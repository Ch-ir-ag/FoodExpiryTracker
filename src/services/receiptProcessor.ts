import Tesseract from 'tesseract.js';
import { Receipt, ReceiptItem } from '@/types';
import { formatDateForDB } from '@/utils/dateUtils';
import { ShelfLifeService } from './shelfLifeService';

export class ReceiptProcessor {
  static async processImage(imageFile: File, useAI: boolean = false): Promise<Receipt> {
    try {
      const result = await Tesseract.recognize(
        imageFile,
        'eng',
        { logger: m => console.log(m) }
      );

      const text = result.data.text;
      return this.parseReceiptText(text, useAI);
    } catch (error) {
      console.error('Error processing receipt:', error);
      throw error;
    }
  }

  static async parseReceiptText(text: string, useAI: boolean = false): Promise<Receipt> {
    try {
      // Extract store information
      const storeMatch = text.match(/Dublin - ([^\n]+)/) || text.match(/LIDL/);
      const store = storeMatch ? (storeMatch[1]?.trim() || 'LIDL') : 'LIDL'; // Default to LIDL

      // Extract date
      const dateMatch = text.match(/Date:\s*(\d{2}\/\d{2}\/\d{2})/) || text.match(/(\d{2})\/(\d{2})\/(\d{2})/);
      const date = dateMatch ? dateMatch[1] || dateMatch[0] : '';
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
      const formattedDate = formatDateForDB(date);
      
      // Process each line to extract items
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
          
          // Process item with or without AI-based classification
          const item = this.processItem(name, parsedPrice, date, formattedDate, useAI);
          items.push(item);
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
  
  /**
   * Process a single item with optional AI-powered classification
   */
  private static processItem(
    name: string, 
    price: number, 
    date: string, 
    formattedDate: string,
    useAI: boolean = false
  ): ReceiptItem {
    try {
      // Get category and expiry date using either AI or simple classification
      let category, estimatedExpiryDate;
      
      if (useAI) {
        category = ShelfLifeService.categorizeProductWithAI(name);
        estimatedExpiryDate = ShelfLifeService.calculateExpiryDateWithAI(name, formattedDate);
      } else {
        category = ShelfLifeService.categorizeProduct(name);
        estimatedExpiryDate = ShelfLifeService.calculateExpiryDate(name, formattedDate);
      }
      
      return {
        id: crypto.randomUUID(),
        name: name.trim(),
        price: price,
        quantity: 1,
        purchaseDate: date,
        estimatedExpiryDate: estimatedExpiryDate,
        vatRate: null as number | null,
        category: category
      };
    } catch (error) {
      console.error(`Error processing item: ${name}`, error);
      // Fall back to simple classification if anything fails
      const category = ShelfLifeService.categorizeProduct(name);
      const estimatedExpiryDate = ShelfLifeService.calculateExpiryDate(name, formattedDate);
      
      return {
        id: crypto.randomUUID(),
        name: name.trim(),
        price: price,
        quantity: 1,
        purchaseDate: date,
        estimatedExpiryDate: estimatedExpiryDate,
        vatRate: null as number | null,
        category: category
      };
    }
  }
} 