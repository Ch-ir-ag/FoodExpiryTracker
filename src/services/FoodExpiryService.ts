import { ShelfLifeService } from './shelfLifeService';

/**
 * Simplified service for food products - no expiry prediction
 */
export class FoodExpiryService {
  /**
   * Returns zero days (no prediction)
   */
  static predictExpiryDays(
    productName: string,
    purchaseDate: string,
    additionalContext: {
      store?: string;
      category?: string;
    } = {}
  ): { days: number; confidence: number; method: string } {
    // Return zero days with no expiry prediction
    return {
      days: 0, 
      confidence: 0,
      method: 'no-prediction'
    };
  }
  
  /**
   * Returns null for expiry date (no prediction)
   */
  static calculateExpiryDate(
    productName: string,
    purchaseDate: string,
    additionalContext: {
      store?: string;
      category?: string;
    } = {}
  ): string | null {
    // Return null (no expiry date prediction)
    return null;
  }
} 