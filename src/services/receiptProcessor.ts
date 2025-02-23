import Tesseract from 'tesseract.js';
import { Receipt, ReceiptItem } from '@/types';
import { formatDateForDB } from '@/utils/dateUtils';

export class ReceiptProcessor {
  static async processImage(imageFile: File): Promise<Receipt> {
    try {
      const result = await Tesseract.recognize(
        imageFile,
        'eng',
        { logger: m => console.log(m) }
      );

      const text = result.data.text;
      return this.parseReceiptText(text);
    } catch (error) {
      console.error('Error processing receipt:', error);
      throw error;
    }
  }

  static parseReceiptText(text: string): Receipt {
    try {
      // Extract store information
      const storeMatch = text.match(/Dublin - ([^\n]+)/);
      const store = storeMatch ? storeMatch[1].trim() : '';

      // Extract date
      const dateMatch = text.match(/Date:\s*(\d{2}\/\d{2}\/\d{2})/);
      const date = dateMatch ? dateMatch[1] : '';
      if (!date) {
        throw new Error('Could not extract date from receipt');
      }

      // Extract total
      const totalMatch = text.match(/TOTAL\s*([\d.]+)/);
      const total = totalMatch ? parseFloat(totalMatch[1]) : 0;
      if (isNaN(total)) {
        throw new Error('Could not extract total from receipt');
      }

      // Extract items
      const items: ReceiptItem[] = [];
      const lines = text.split('\n');
      
      for (const line of lines) {
        const itemMatch = line.match(/^(.+?)\s+([\d.]+)\s+[ABC]$/);
        if (itemMatch) {
          const [, name, price] = itemMatch;
          const parsedPrice = parseFloat(price);
          if (isNaN(parsedPrice)) {
            console.warn(`Invalid price for item: ${name}`);
            continue;
          }
          
          items.push({
            id: crypto.randomUUID(),
            name: name.trim(),
            price: parsedPrice,
            quantity: 1,
            purchaseDate: date,
            estimatedExpiryDate: this.estimateExpiryDate(name, date),
            vatRate: null as number | null,
            category: null
          });
        }
      }

      if (items.length === 0) {
        throw new Error('No items found in receipt');
      }

      const receipt = {
        id: crypto.randomUUID(),
        store,
        date,
        items,
        total,
        rawText: text,
      };

      console.log('Parsed receipt:', {
        ...receipt,
        formattedDate: formatDateForDB(receipt.date),
        items: receipt.items.map(item => ({
          ...item,
          formattedPurchaseDate: formatDateForDB(item.purchaseDate),
          formattedExpiryDate: formatDateForDB(item.estimatedExpiryDate)
        }))
      });

      return receipt;
    } catch (error) {
      console.error('Error parsing receipt:', error);
      throw error;
    }
  }

  static estimateExpiryDate(productName: string, purchaseDate: string): string {
    let daysToAdd = 7; // Default shelf life

    // Basic rules - you'll want to expand these
    if (productName.toLowerCase().includes('yogurt')) {
      daysToAdd = 14;
    } else if (productName.toLowerCase().includes('milk')) {
      daysToAdd = 7;
    }

    const purchaseDateTime = new Date(formatDateForDB(purchaseDate));
    const expiryDate = new Date(purchaseDateTime);
    expiryDate.setDate(purchaseDateTime.getDate() + daysToAdd);
    
    return expiryDate.toISOString().split('T')[0];
  }
} 