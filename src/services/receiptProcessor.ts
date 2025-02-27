import Tesseract from 'tesseract.js';
import { Receipt, ReceiptItem } from '@/types';
import { formatDateForDB } from '@/utils/dateUtils';
import { ShelfLifeService } from './shelfLifeService';

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
      const storeMatch = text.match(/Dublin - ([^\n]+)/) || text.match(/LIDL/);
      const store = storeMatch ? (storeMatch[1]?.trim() || 'LIDL') : '';

      // Extract date
      const dateMatch = text.match(/Date:\s*(\d{2}\/\d{2}\/\d{2})/) || text.match(/(\d{2})\/(\d{2})\/(\d{2})/);
      const date = dateMatch ? dateMatch[1] || dateMatch[2] : '';
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
        const itemMatch = line.match(/^(.+?)\s+([\d.]+)\s+[ABC]$/) || 
                         line.match(/^(.+?)\s+(\d+\.\d{2})\s*[ABC]$/);
        if (itemMatch) {
          const [, name, price] = itemMatch;
          const parsedPrice = parseFloat(price);
          if (isNaN(parsedPrice)) {
            console.warn(`Invalid price for item: ${name}`);
            continue;
          }
          
          const formattedDate = formatDateForDB(date);
          const category = ShelfLifeService.categorizeProduct(name);
          const estimatedExpiryDate = ShelfLifeService.calculateExpiryDate(name, formattedDate);
          
          items.push({
            id: crypto.randomUUID(),
            name: name.trim(),
            price: parsedPrice,
            quantity: 1,
            purchaseDate: date,
            estimatedExpiryDate: estimatedExpiryDate,
            vatRate: null as number | null,
            category: category
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
} 