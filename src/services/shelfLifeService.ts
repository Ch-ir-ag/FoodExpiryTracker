import { ShelfLife } from '@/types';
import { FoodDatabaseService } from './foodDatabaseService';
import { addDays, format } from 'date-fns';

// Comprehensive database of food categories and shelf lives
const SHELF_LIFE_DATABASE: ShelfLife[] = [
  // Dairy Products
  { category: 'milk', daysToExpiry: 7, storageType: 'refrigerated' },
  { category: 'yogurt', daysToExpiry: 14, storageType: 'refrigerated' },
  { category: 'cheese-soft', daysToExpiry: 14, storageType: 'refrigerated' },
  { category: 'cheese-hard', daysToExpiry: 30, storageType: 'refrigerated' },
  { category: 'butter', daysToExpiry: 30, storageType: 'refrigerated' },
  { category: 'cream', daysToExpiry: 7, storageType: 'refrigerated' },
  
  // Meat & Seafood
  { category: 'beef-fresh', daysToExpiry: 3, storageType: 'refrigerated' },
  { category: 'chicken-fresh', daysToExpiry: 2, storageType: 'refrigerated' },
  { category: 'fish-fresh', daysToExpiry: 1, storageType: 'refrigerated' },
  { category: 'pork-fresh', daysToExpiry: 3, storageType: 'refrigerated' },
  { category: 'meat-ground', daysToExpiry: 2, storageType: 'refrigerated' },
  { category: 'meat-processed', daysToExpiry: 7, storageType: 'refrigerated' },
  { category: 'meat-frozen', daysToExpiry: 180, storageType: 'frozen' },
  { category: 'seafood-frozen', daysToExpiry: 90, storageType: 'frozen' },
  
  // Fruits
  { category: 'apples', daysToExpiry: 30, storageType: 'refrigerated' },
  { category: 'bananas', daysToExpiry: 5, storageType: 'room-temperature' },
  { category: 'berries', daysToExpiry: 5, storageType: 'refrigerated' },
  { category: 'citrus', daysToExpiry: 14, storageType: 'refrigerated' },
  { category: 'grapes', daysToExpiry: 7, storageType: 'refrigerated' },
  { category: 'melons', daysToExpiry: 7, storageType: 'refrigerated' },
  { category: 'stone-fruit', daysToExpiry: 5, storageType: 'refrigerated' },
  
  // Vegetables
  { category: 'leafy-greens', daysToExpiry: 5, storageType: 'refrigerated' },
  { category: 'root-vegetables', daysToExpiry: 14, storageType: 'refrigerated' },
  { category: 'potatoes', daysToExpiry: 21, storageType: 'room-temperature' },
  { category: 'onions', daysToExpiry: 30, storageType: 'room-temperature' },
  { category: 'tomatoes', daysToExpiry: 7, storageType: 'room-temperature' },
  { category: 'cucumbers', daysToExpiry: 7, storageType: 'refrigerated' },
  { category: 'peppers', daysToExpiry: 10, storageType: 'refrigerated' },
  { category: 'broccoli', daysToExpiry: 7, storageType: 'refrigerated' },
  { category: 'mushrooms', daysToExpiry: 7, storageType: 'refrigerated' },
  
  // Bakery
  { category: 'bread-fresh', daysToExpiry: 5, storageType: 'room-temperature' },
  { category: 'bread-packaged', daysToExpiry: 7, storageType: 'room-temperature' },
  { category: 'pastries', daysToExpiry: 3, storageType: 'room-temperature' },
  { category: 'cake', daysToExpiry: 4, storageType: 'refrigerated' },
  
  // Pantry Items
  { category: 'eggs', daysToExpiry: 28, storageType: 'refrigerated' },
  { category: 'pasta-dry', daysToExpiry: 730, storageType: 'room-temperature' },
  { category: 'rice', daysToExpiry: 730, storageType: 'room-temperature' },
  { category: 'cereal', daysToExpiry: 180, storageType: 'room-temperature' },
  { category: 'flour', daysToExpiry: 180, storageType: 'room-temperature' },
  { category: 'sugar', daysToExpiry: 720, storageType: 'room-temperature' },
  { category: 'canned-goods', daysToExpiry: 730, storageType: 'room-temperature' },
  { category: 'snacks', daysToExpiry: 90, storageType: 'room-temperature' },
  { category: 'nuts', daysToExpiry: 90, storageType: 'room-temperature' },
  
  // Beverages
  { category: 'juice-fresh', daysToExpiry: 7, storageType: 'refrigerated' },
  { category: 'juice-packaged', daysToExpiry: 21, storageType: 'refrigerated' },
  { category: 'soda', daysToExpiry: 270, storageType: 'room-temperature' },
  { category: 'water-bottled', daysToExpiry: 365, storageType: 'room-temperature' },
  
  // Condiments
  { category: 'ketchup', daysToExpiry: 180, storageType: 'refrigerated' },
  { category: 'mustard', daysToExpiry: 180, storageType: 'refrigerated' },
  { category: 'mayonnaise', daysToExpiry: 60, storageType: 'refrigerated' },
  { category: 'salad-dressing', daysToExpiry: 90, storageType: 'refrigerated' },
  { category: 'jam', daysToExpiry: 180, storageType: 'refrigerated' },
  { category: 'honey', daysToExpiry: 730, storageType: 'room-temperature' },
  
  // Default
  { category: 'default', daysToExpiry: 7, storageType: 'refrigerated' },

  // Specific LIDL products
  { category: 'greek-yogurt', daysToExpiry: 21, storageType: 'refrigerated' },
  { category: 'white-rolls', daysToExpiry: 5, storageType: 'room-temperature' },
  { category: 'tortilla-wraps', daysToExpiry: 7, storageType: 'room-temperature' },
  { category: 'hazelnuts', daysToExpiry: 180, storageType: 'room-temperature' },
  { category: 'chocolate', daysToExpiry: 180, storageType: 'room-temperature' },

  // Add more LIDL-specific items
  { category: 'lidl-bakery', daysToExpiry: 3, storageType: 'room-temperature' },
  { category: 'lidl-deli', daysToExpiry: 4, storageType: 'refrigerated' },
  { category: 'lidl-fresh-meat', daysToExpiry: 3, storageType: 'refrigerated' },
  { category: 'lidl-fresh-fish', daysToExpiry: 1, storageType: 'refrigerated' },
  { category: 'lidl-dairy', daysToExpiry: 10, storageType: 'refrigerated' },
];

// Product name keywords mapping to categories - kept for reference but not actively used
/* eslint-disable @typescript-eslint/no-unused-vars */
const _PRODUCT_KEYWORDS: Record<string, string[]> = {
  'milk': ['milk', 'dairy milk', 'whole milk', 'semi skimmed', 'skimmed', 'almond milk', 'soy milk', 'oat milk'],
  'yogurt': ['yogurt', 'yoghurt', 'greek yogurt', 'yogurt drink', 'activia', 'yoplait', 'muller'],
  'cheese-soft': ['cream cheese', 'cottage cheese', 'ricotta', 'brie', 'camembert', 'mozzarella', 'feta'],
  'cheese-hard': ['cheddar', 'parmesan', 'gouda', 'edam', 'emmental', 'gruyere', 'cheese block'],
  'butter': ['butter', 'margarine', 'spread', 'flora', 'lurpak'],
  'cream': ['cream', 'double cream', 'single cream', 'whipping cream', 'sour cream', 'crème fraîche'],
  
  'beef-fresh': ['beef', 'steak', 'roast beef', 'sirloin', 'ribeye', 'mince beef'],
  'chicken-fresh': ['chicken', 'chicken breast', 'chicken thigh', 'chicken wings', 'chicken drumsticks'],
  'fish-fresh': ['fish', 'salmon', 'cod', 'haddock', 'tuna steak', 'trout', 'sea bass', 'fresh fish'],
  'pork-fresh': ['pork', 'pork chop', 'pork loin', 'pork belly', 'gammon'],
  'meat-ground': ['mince', 'ground', 'minced beef', 'ground turkey', 'ground chicken'],
  'meat-processed': ['ham', 'bacon', 'sausage', 'salami', 'pepperoni', 'chorizo', 'deli meat'],
  'meat-frozen': ['frozen meat', 'frozen chicken', 'frozen beef', 'frozen turkey'],
  'seafood-frozen': ['frozen fish', 'fish fingers', 'frozen prawns', 'frozen shrimp', 'frozen seafood'],
  
  'apples': ['apple', 'granny smith', 'pink lady', 'gala apple', 'golden delicious'],
  'bananas': ['banana', 'bananas'],
  'berries': ['berry', 'berries', 'strawberry', 'strawberries', 'blueberry', 'blueberries', 'raspberry', 'blackberry'],
  'citrus': ['orange', 'lemon', 'lime', 'grapefruit', 'mandarin', 'clementine', 'satsuma'],
  'grapes': ['grape', 'grapes', 'red grapes', 'green grapes'],
  'melons': ['melon', 'watermelon', 'cantaloupe', 'honeydew'],
  'stone-fruit': ['peach', 'nectarine', 'plum', 'apricot', 'cherry', 'cherries'],
  
  'leafy-greens': ['lettuce', 'spinach', 'kale', 'rocket', 'arugula', 'chard', 'cabbage', 'greens'],
  'root-vegetables': ['carrot', 'parsnip', 'turnip', 'beetroot', 'swede', 'radish'],
  'potatoes': ['potato', 'potatoes', 'sweet potato', 'maris piper'],
  'onions': ['onion', 'onions', 'red onion', 'white onion', 'shallot', 'spring onion', 'scallion'],
  'tomatoes': ['tomato', 'tomatoes', 'cherry tomato', 'plum tomato', 'beef tomato'],
  'cucumbers': ['cucumber'],
  'peppers': ['pepper', 'bell pepper', 'red pepper', 'green pepper', 'yellow pepper', 'capsicum'],
  'broccoli': ['broccoli', 'tenderstem', 'broccolini'],
  'mushrooms': ['mushroom', 'mushrooms', 'button mushroom', 'portobello', 'shiitake'],
  
  'bread-fresh': ['fresh bread', 'bakery bread', 'baguette', 'sourdough', 'artisan bread', 'loaf'],
  'bread-packaged': ['bread', 'sliced bread', 'white bread', 'brown bread', 'wholemeal', 'whole grain'],
  'pastries': ['pastry', 'croissant', 'danish', 'pain au chocolat', 'muffin', 'scone'],
  'cake': ['cake', 'cheesecake', 'gateau', 'sponge cake'],
  
  'eggs': ['egg', 'eggs', 'free range', 'large eggs', 'medium eggs'],
  'pasta-dry': ['pasta', 'spaghetti', 'penne', 'fusilli', 'linguine', 'macaroni', 'noodles'],
  'rice': ['rice', 'basmati', 'jasmine rice', 'long grain', 'short grain', 'risotto rice'],
  'cereal': ['cereal', 'cornflakes', 'muesli', 'granola', 'porridge', 'oats'],
  'flour': ['flour', 'plain flour', 'self-raising', 'bread flour', 'wholemeal flour'],
  'sugar': ['sugar', 'caster sugar', 'granulated', 'icing sugar', 'brown sugar'],
  'canned-goods': ['can', 'tin', 'canned', 'tinned', 'baked beans', 'soup', 'tuna can', 'canned tomato'],
  'snacks': ['crisps', 'chips', 'crackers', 'popcorn', 'pretzel', 'tortilla chips'],
  'nuts': ['nuts', 'peanuts', 'cashews', 'almonds', 'walnuts', 'pistachios'],
  
  'juice-fresh': ['fresh juice', 'freshly squeezed', 'not from concentrate'],
  'juice-packaged': ['juice', 'orange juice', 'apple juice', 'fruit juice', 'cranberry juice'],
  'soda': ['soda', 'soft drink', 'cola', 'lemonade', 'fizzy drink', 'coke', 'pepsi'],
  'water-bottled': ['water', 'mineral water', 'spring water', 'bottled water'],
  
  'ketchup': ['ketchup', 'tomato sauce', 'tomato ketchup'],
  'mustard': ['mustard', 'dijon', 'english mustard', 'wholegrain mustard'],
  'mayonnaise': ['mayo', 'mayonnaise', 'hellmann'],
  'salad-dressing': ['dressing', 'salad dressing', 'vinaigrette', 'ranch dressing'],
  'jam': ['jam', 'preserve', 'marmalade', 'conserve', 'strawberry jam'],
  'honey': ['honey'],
  'greek-yogurt': ['greek style yogurt', 'greek yogurt', 'greek yoghurt', 'greek style'],
  'white-rolls': ['white sub rolls', 'white rolls', 'bread rolls', 'sub rolls', 'sandwich rolls'],
  'tortilla-wraps': ['tortilla wraps', 'plain tortilla', 'wraps', 'tortillas', 'flour tortilla'],
  'hazelnuts': ['hazelnuts', 'roasted hazelnuts', 'hazelnut', 'nuts'],
  'chocolate': ['chocolate', 'milk chocolate', 'hazelnut milk chocolate', 'whole hazelnut', 'chocolate bar'],
  'lidl-bakery': ['lidl bakery', 'fresh bakery', 'in-store bakery'],
  'lidl-deli': ['lidl deli', 'deli counter', 'delicatessen'],
  'lidl-fresh-meat': ['lidl fresh meat', 'meat counter', 'butcher counter'],
  'lidl-fresh-fish': ['lidl fresh fish', 'fish counter', 'seafood counter'],
  'lidl-dairy': ['lidl dairy', 'dairy section'],
};
/* eslint-enable @typescript-eslint/no-unused-vars */

// Brand-specific category mapping - kept for reference but not actively used
/* eslint-disable @typescript-eslint/no-unused-vars */
const _BRAND_CATEGORY_MAPPING: Record<string, string> = {
  'lurpak': 'butter',
  'flora': 'butter',
  'muller': 'yogurt',
  'activia': 'yogurt',
  'yoplait': 'yogurt',
  'heinz': 'canned-goods', // Default, will be overridden by product name
  'hellmann': 'mayonnaise',
  'coca-cola': 'soda',
  'pepsi': 'soda',
  'evian': 'water-bottled',
  'warburtons': 'bread-packaged',
  'hovis': 'bread-packaged',
  'kelloggs': 'cereal',
  'quaker': 'cereal',
  'innocent': 'juice-packaged',
  'tropicana': 'juice-packaged',
  'walkers': 'snacks',
  'pringles': 'snacks',
  'cadbury': 'snacks',
  'nestle': 'snacks',
  'dolmio': 'pasta-dry',
  'uncle ben': 'rice',
  'lidl': 'default', // Will be overridden by more specific product matches
};

// Regional adjustments - kept for reference but not actively used
const _REGIONAL_ADJUSTMENTS: Record<string, number> = {
  'milk': 1, // Add 1 day to milk shelf life in Ireland (example)
  'bread-fresh': -1, // Reduce by 1 day due to humidity (example)
};
/* eslint-enable @typescript-eslint/no-unused-vars */

export class ShelfLifeService {
  /**
   * Determine the most likely food category based on product name
   * This is now a wrapper around the more sophisticated FoodDatabaseService
   */
  static async categorizeProduct(productName: string): Promise<string> {
    try {
      // Try to find a match in the dynamic database
      const match = await FoodDatabaseService.findBestMatch(productName);
      
      if (match && match.confidence > 0.5) {
        return match.product.category;
      }
      
      // Fallback to the original categorization logic
      return this.legacyCategorizeProduct(productName);
    } catch (error) {
      console.error('Error in categorizeProduct:', error);
      return this.legacyCategorizeProduct(productName);
    }
  }
  
  /**
   * Legacy categorization method (simplified version of the original)
   */
  private static legacyCategorizeProduct(productName: string): string {
    const normalized = productName.toLowerCase().trim();
    
    // Simple keyword matching
    if (normalized.includes('milk')) return 'milk';
    if (normalized.includes('yogurt') || normalized.includes('yoghurt')) return 'yogurt';
    if (normalized.includes('cheese')) {
      if (normalized.includes('cream') || normalized.includes('soft')) return 'cheese-soft';
      return 'cheese-hard';
    }
    if (normalized.includes('butter')) return 'butter';
    if (normalized.includes('cream')) return 'cream';
    
    // LIDL specific products
    if (normalized.includes('greek style yogurt')) return 'yogurt';
    if (normalized.includes('white sub rolls')) return 'bread-packaged';
    if (normalized.includes('tortilla wraps')) return 'tortilla-wraps';
    
    return 'default';
  }
  
  /**
   * Get shelf life information for a product
   * This now uses the dynamic database with fallback to the static one
   */
  static async getShelfLife(productName: string): Promise<ShelfLife> {
    try {
      // Try to find a match in the dynamic database
      const match = await FoodDatabaseService.findBestMatch(productName);
      
      if (match) {
        return {
          category: match.product.category,
          daysToExpiry: match.product.daysToExpiry,
          storageType: match.product.storageType
        };
      }
      
      // Fallback to the original method
      return this.legacyGetShelfLife(productName);
    } catch (error) {
      console.error('Error in getShelfLife:', error);
      return this.legacyGetShelfLife(productName);
    }
  }
  
  /**
   * Legacy shelf life lookup method
   */
  private static legacyGetShelfLife(productName: string): ShelfLife {
    const category = this.legacyCategorizeProduct(productName);
    
    // Find the shelf life data for this category
    return SHELF_LIFE_DATABASE.find(item => item.category === category) || 
           SHELF_LIFE_DATABASE.find(item => item.category === 'default')!;
  }
  
  /**
   * Calculate estimated expiry date based on product name and purchase date
   * Now uses the dynamic database with learning capabilities
   */
  static async calculateExpiryDate(productName: string, purchaseDate: string): Promise<string> {
    try {
      const shelfLife = await this.getShelfLife(productName);
      
      const purchaseDateTime = new Date(purchaseDate);
      const expiryDate = addDays(purchaseDateTime, shelfLife.daysToExpiry);
      
      return format(expiryDate, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error calculating expiry date:', error);
      
      // Fallback to a simple default expiry date (7 days)
      const purchaseDateTime = new Date(purchaseDate);
      const expiryDate = addDays(purchaseDateTime, 7);
      return format(expiryDate, 'yyyy-MM-dd');
    }
  }

  /**
   * Update the expiry date for a product based on user feedback
   * This allows the system to learn and improve over time
   */
  static async updateExpiryDate(
    productName: string,
    originalExpiryDate: string,
    correctedExpiryDate: string
  ): Promise<void> {
    try {
      const originalDate = new Date(originalExpiryDate);
      const correctedDate = new Date(correctedExpiryDate);
      const purchaseDate = new Date(); // Approximate purchase date
      
      // Calculate days difference
      const originalDaysToExpiry = Math.round((originalDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
      const correctedDaysToExpiry = Math.round((correctedDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Learn from this correction
      await FoodDatabaseService.learnFromCorrection(
        productName,
        originalDaysToExpiry,
        correctedDaysToExpiry
      );
    } catch (error) {
      console.error('Error updating expiry date:', error);
    }
  }
} 