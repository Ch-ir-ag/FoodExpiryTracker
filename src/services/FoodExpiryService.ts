import { format, addDays } from 'date-fns';
import { ShelfLifeService } from './shelfLifeService';

/**
 * Service for predicting food expiry dates
 * Provides both simple keyword-based and AI-powered methods
 */
export class FoodExpiryService {
  /**
   * Predict expiry days for a product using the simplified ShelfLifeService
   */
  static predictExpiryDays(
    productName: string,
    purchaseDate: string,
    additionalContext: {
      store?: string;
      category?: string;
    } = {}
  ): { days: number; confidence: number; method: string } {
    // Get shelf life information from the ShelfLifeService
    const shelfLife = ShelfLifeService.getShelfLife(productName);
    
    return {
      days: shelfLife.daysToExpiry,
      confidence: 0.8,
      method: 'category-match'
    };
  }
  
  /**
   * Predict expiry days using AI-powered classification
   * This method is asynchronous and more accurate but slower
   */
  static async predictExpiryDaysWithAI(
    productName: string,
    purchaseDate: string,
    additionalContext: {
      store?: string;
      category?: string;
    } = {}
  ): Promise<{ days: number; confidence: number; method: string }> {
    // Get shelf life information using AI classification
    const shelfLife = await ShelfLifeService.getShelfLifeWithAI(productName);
    
    return {
      days: shelfLife.daysToExpiry,
      confidence: 0.9, // Higher confidence with AI
      method: 'ai-classification'
    };
  }
  
  /**
   * Calculate and format the expiry date based on purchase date and predicted days
   * Uses the simple keyword-based categorization
   */
  static calculateExpiryDate(
    productName: string,
    purchaseDate: string,
    additionalContext: {
      store?: string;
      category?: string;
    } = {}
  ): string {
    return ShelfLifeService.calculateExpiryDate(productName, purchaseDate);
  }

  /**
   * Calculate and format the expiry date using AI classification
   * More accurate but asynchronous
   */
  static async calculateExpiryDateWithAI(
    productName: string,
    purchaseDate: string,
    additionalContext: {
      store?: string;
      category?: string;
    } = {}
  ): Promise<string> {
    return await ShelfLifeService.calculateExpiryDateWithAI(productName, purchaseDate);
  }
} 