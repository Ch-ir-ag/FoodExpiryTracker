import { ShelfLife } from '@/types';
import { addDays, format } from 'date-fns';
import { ZeroShotClassificationService } from './ZeroShotClassificationService';

// Simplified database of food categories and shelf lives
const SHELF_LIFE_DATABASE: ShelfLife[] = [
  // Dairy Products
  { category: 'milk', daysToExpiry: 7, storageType: 'refrigerated' },
  { category: 'yogurt', daysToExpiry: 14, storageType: 'refrigerated' },
  { category: 'cheese', daysToExpiry: 14, storageType: 'refrigerated' },
  { category: 'butter', daysToExpiry: 30, storageType: 'refrigerated' },
  { category: 'cream', daysToExpiry: 7, storageType: 'refrigerated' },
  
  // Meat & Seafood
  { category: 'beef', daysToExpiry: 3, storageType: 'refrigerated' },
  { category: 'chicken', daysToExpiry: 2, storageType: 'refrigerated' },
  { category: 'fish', daysToExpiry: 1, storageType: 'refrigerated' },
  { category: 'pork', daysToExpiry: 3, storageType: 'refrigerated' },
  { category: 'meat', daysToExpiry: 3, storageType: 'refrigerated' },
  { category: 'seafood', daysToExpiry: 2, storageType: 'refrigerated' },
  { category: 'sausage', daysToExpiry: 5, storageType: 'refrigerated' },
  { category: 'bacon', daysToExpiry: 7, storageType: 'refrigerated' },
  { category: 'ham', daysToExpiry: 5, storageType: 'refrigerated' },
  
  // Fruits & Vegetables
  { category: 'fruit', daysToExpiry: 7, storageType: 'refrigerated' },
  { category: 'apple', daysToExpiry: 14, storageType: 'refrigerated' },
  { category: 'banana', daysToExpiry: 5, storageType: 'room-temperature' },
  { category: 'orange', daysToExpiry: 14, storageType: 'refrigerated' },
  { category: 'berries', daysToExpiry: 5, storageType: 'refrigerated' },
  { category: 'vegetable', daysToExpiry: 7, storageType: 'refrigerated' },
  { category: 'lettuce', daysToExpiry: 5, storageType: 'refrigerated' },
  { category: 'tomato', daysToExpiry: 7, storageType: 'room-temperature' },
  { category: 'cucumber', daysToExpiry: 7, storageType: 'refrigerated' },
  { category: 'pepper', daysToExpiry: 10, storageType: 'refrigerated' },
  { category: 'carrot', daysToExpiry: 14, storageType: 'refrigerated' },
  { category: 'potato', daysToExpiry: 14, storageType: 'room-temperature' },
  { category: 'onion', daysToExpiry: 30, storageType: 'room-temperature' },
  
  // Bakery
  { category: 'bread', daysToExpiry: 5, storageType: 'room-temperature' },
  { category: 'roll', daysToExpiry: 3, storageType: 'room-temperature' },
  { category: 'pastry', daysToExpiry: 3, storageType: 'room-temperature' },
  { category: 'cake', daysToExpiry: 5, storageType: 'refrigerated' },
  { category: 'cookies', daysToExpiry: 14, storageType: 'room-temperature' },
  
  // Pantry Items
  { category: 'pasta', daysToExpiry: 365, storageType: 'room-temperature' },
  { category: 'rice', daysToExpiry: 365, storageType: 'room-temperature' },
  { category: 'cereal', daysToExpiry: 180, storageType: 'room-temperature' },
  { category: 'canned', daysToExpiry: 365, storageType: 'room-temperature' },
  { category: 'snack', daysToExpiry: 90, storageType: 'room-temperature' },
  { category: 'chocolate', daysToExpiry: 180, storageType: 'room-temperature' },
  { category: 'nuts', daysToExpiry: 90, storageType: 'room-temperature' },
  { category: 'flour', daysToExpiry: 180, storageType: 'room-temperature' },
  { category: 'sugar', daysToExpiry: 365, storageType: 'room-temperature' },
  { category: 'oil', daysToExpiry: 180, storageType: 'room-temperature' },
  
  // Eggs
  { category: 'eggs', daysToExpiry: 28, storageType: 'refrigerated' },
  
  // Beverages
  { category: 'juice', daysToExpiry: 7, storageType: 'refrigerated' },
  { category: 'soda', daysToExpiry: 180, storageType: 'room-temperature' },
  { category: 'water', daysToExpiry: 365, storageType: 'room-temperature' },
  { category: 'beer', daysToExpiry: 180, storageType: 'refrigerated' },
  { category: 'wine', daysToExpiry: 365, storageType: 'room-temperature' },
  
  // Deli Items
  { category: 'deli', daysToExpiry: 5, storageType: 'refrigerated' },
  
  // Default
  { category: 'default', daysToExpiry: 7, storageType: 'refrigerated' }
];

export class ShelfLifeService {
  /**
   * Simplified method to categorize a product based on its name
   */
  static categorizeProduct(productName: string): string {
    const normalizedName = productName.toLowerCase().trim();
    
    // Dairy Products
    if (normalizedName.includes('milk') || normalizedName.includes('dairy milk')) return 'milk';
    if (normalizedName.includes('yogurt') || normalizedName.includes('yoghurt') || 
        normalizedName.includes('greek') || normalizedName.includes('activia') || 
        normalizedName.includes('muller')) return 'yogurt';
    if (normalizedName.includes('cheese') || normalizedName.includes('cheddar') || 
        normalizedName.includes('brie') || normalizedName.includes('mozzarella') || 
        normalizedName.includes('parmesan') || normalizedName.includes('feta')) return 'cheese';
    if (normalizedName.includes('butter') || normalizedName.includes('lurpak') || 
        normalizedName.includes('margarine') || normalizedName.includes('spread')) return 'butter';
    if (normalizedName.includes('cream') || normalizedName.includes('crème fraîche')) return 'cream';
    
    // Meat & Seafood
    if (normalizedName.includes('beef') || normalizedName.includes('steak') || 
        normalizedName.includes('mince beef') || normalizedName.includes('ground beef')) return 'beef';
    if (normalizedName.includes('chicken') || normalizedName.includes('poultry') || 
        normalizedName.includes('drumstick') || normalizedName.includes('wing')) return 'chicken';
    if (normalizedName.includes('fish') || normalizedName.includes('salmon') || 
        normalizedName.includes('cod') || normalizedName.includes('tuna') || 
        normalizedName.includes('haddock')) return 'fish';
    if (normalizedName.includes('pork') || normalizedName.includes('loin') || 
        normalizedName.includes('chop')) return 'pork';
    if (normalizedName.includes('sausage') || normalizedName.includes('bratwurst') || 
        normalizedName.includes('wurst')) return 'sausage';
    if (normalizedName.includes('bacon')) return 'bacon';
    if (normalizedName.includes('ham')) return 'ham';
    if (normalizedName.includes('meat')) return 'meat';
    if (normalizedName.includes('seafood') || normalizedName.includes('prawn') || 
        normalizedName.includes('shrimp') || normalizedName.includes('crab') || 
        normalizedName.includes('lobster')) return 'seafood';
    
    // Fruits
    if (normalizedName.includes('apple')) return 'apple';
    if (normalizedName.includes('banana')) return 'banana';
    if (normalizedName.includes('orange') || normalizedName.includes('mandarin') || 
        normalizedName.includes('clementine')) return 'orange';
    if (normalizedName.includes('berry') || normalizedName.includes('berries') || 
        normalizedName.includes('strawberry') || normalizedName.includes('blueberry') || 
        normalizedName.includes('raspberry')) return 'berries';
    if (normalizedName.includes('fruit') || normalizedName.includes('melon') || 
        normalizedName.includes('watermelon') || normalizedName.includes('kiwi') || 
        normalizedName.includes('pear') || normalizedName.includes('grape') || 
        normalizedName.includes('peach') || normalizedName.includes('plum') || 
        normalizedName.includes('nectarine')) return 'fruit';
    
    // Vegetables
    if (normalizedName.includes('lettuce') || normalizedName.includes('iceberg') || 
        normalizedName.includes('romaine')) return 'lettuce';
    if (normalizedName.includes('tomato')) return 'tomato';
    if (normalizedName.includes('cucumber')) return 'cucumber';
    if (normalizedName.includes('pepper') || normalizedName.includes('capsicum') || 
        normalizedName.includes('bell pepper')) return 'pepper';
    if (normalizedName.includes('carrot')) return 'carrot';
    if (normalizedName.includes('potato') || normalizedName.includes('potatoes')) return 'potato';
    if (normalizedName.includes('onion')) return 'onion';
    if (normalizedName.includes('salad') || normalizedName.includes('spinach') || 
        normalizedName.includes('kale') || normalizedName.includes('broccoli') || 
        normalizedName.includes('cauliflower') || normalizedName.includes('cabbage') || 
        normalizedName.includes('vegetable') || normalizedName.includes('courgette') || 
        normalizedName.includes('zucchini') || normalizedName.includes('aubergine') || 
        normalizedName.includes('eggplant')) return 'vegetable';
    
    // Bakery
    if (normalizedName.includes('bread') || normalizedName.includes('loaf') || 
        normalizedName.includes('baguette') || normalizedName.includes('sourdough')) return 'bread';
    if (normalizedName.includes('roll') || normalizedName.includes('bun')) return 'roll';
    if (normalizedName.includes('cake') || normalizedName.includes('gateau') || 
        normalizedName.includes('cheesecake')) return 'cake';
    if (normalizedName.includes('cookie') || normalizedName.includes('biscuit')) return 'cookies';
    if (normalizedName.includes('pastry') || normalizedName.includes('croissant') || 
        normalizedName.includes('danish') || normalizedName.includes('muffin') || 
        normalizedName.includes('scone')) return 'pastry';
    
    // Pantry Items
    if (normalizedName.includes('pasta') || normalizedName.includes('spaghetti') || 
        normalizedName.includes('penne') || normalizedName.includes('fusilli') || 
        normalizedName.includes('macaroni') || normalizedName.includes('noodle')) return 'pasta';
    if (normalizedName.includes('rice') || normalizedName.includes('basmati') || 
        normalizedName.includes('jasmine')) return 'rice';
    if (normalizedName.includes('cereal') || normalizedName.includes('oat') || 
        normalizedName.includes('muesli') || normalizedName.includes('cornflakes')) return 'cereal';
    if ((normalizedName.includes('can') || normalizedName.includes('tin')) && 
        !normalizedName.includes('candy')) return 'canned';
    if (normalizedName.includes('crisp') || normalizedName.includes('chip') || 
        normalizedName.includes('snack') || normalizedName.includes('pretzel') || 
        normalizedName.includes('cracker')) return 'snack';
    if (normalizedName.includes('chocolate') || normalizedName.includes('cocoa')) return 'chocolate';
    if (normalizedName.includes('nut') || normalizedName.includes('peanut') || 
        normalizedName.includes('almond') || normalizedName.includes('cashew') || 
        normalizedName.includes('walnut')) return 'nuts';
    if (normalizedName.includes('flour')) return 'flour';
    if (normalizedName.includes('sugar')) return 'sugar';
    if (normalizedName.includes('oil') || normalizedName.includes('olive') || 
        normalizedName.includes('vegetable oil') || normalizedName.includes('sunflower oil')) return 'oil';
    
    // Eggs
    if (normalizedName.includes('egg') && !normalizedName.includes('eggplant')) return 'eggs';
    
    // Beverages
    if (normalizedName.includes('juice') || normalizedName.includes('orange juice') || 
        normalizedName.includes('apple juice')) return 'juice';
    if (normalizedName.includes('soda') || normalizedName.includes('cola') || 
        normalizedName.includes('coke') || normalizedName.includes('pepsi') || 
        normalizedName.includes('lemonade') || normalizedName.includes('sprite')) return 'soda';
    if (normalizedName.includes('water') || normalizedName.includes('mineral water') || 
        normalizedName.includes('sparkling water')) return 'water';
    if (normalizedName.includes('beer') || normalizedName.includes('ale') || 
        normalizedName.includes('lager')) return 'beer';
    if (normalizedName.includes('wine') || normalizedName.includes('red wine') || 
        normalizedName.includes('white wine')) return 'wine';
    
    // Deli Items
    if (normalizedName.includes('deli') || normalizedName.includes('sliced meat') || 
        normalizedName.includes('pastrami') || normalizedName.includes('salami')) return 'deli';
    
    return 'default';
  }

  /**
   * Advanced categorization using zero-shot classification
   * Falls back to keyword-based categorization if AI classification fails
   */
  static categorizeProductWithAI(productName: string): string {
    try {
      // Try using AI-based classification
      const result = ZeroShotClassificationService.classifyFood(productName);
      
      // If AI returned a valid subcategory, use it
      if (result && result.subcategory && result.confidence > 0.6) {
        // Check if this subcategory exists in our database
        const hasCategory = SHELF_LIFE_DATABASE.some(
          item => item.category === result.subcategory
        );
        
        if (hasCategory) {
          return result.subcategory;
        }
        
        // If subcategory doesn't exist in our database but main category does,
        // use the main category
        if (result.mainCategory) {
          const hasMainCategory = SHELF_LIFE_DATABASE.some(
            item => item.category === result.mainCategory
          );
          
          if (hasMainCategory) {
            return result.mainCategory;
          }
        }
      }
    } catch (error) {
      console.error('Error in AI categorization:', error);
    }
    
    // Fall back to keyword-based categorization
    return this.categorizeProduct(productName);
  }
  
  /**
   * Get shelf life information for a product
   */
  static getShelfLife(productName: string): ShelfLife {
    const category = this.categorizeProduct(productName);
    return SHELF_LIFE_DATABASE.find(item => item.category === category) || 
           SHELF_LIFE_DATABASE.find(item => item.category === 'default')!;
  }

  /**
   * Get shelf life information using AI categorization
   */
  static getShelfLifeWithAI(productName: string): ShelfLife {
    const category = this.categorizeProductWithAI(productName);
    return SHELF_LIFE_DATABASE.find(item => item.category === category) || 
           SHELF_LIFE_DATABASE.find(item => item.category === 'default')!;
  }
  
  /**
   * Calculate the expiry date for a product
   */
  static calculateExpiryDate(
    productName: string,
    purchaseDate: string
  ): string {
    const shelfLife = this.getShelfLife(productName);
    const expiryDate = addDays(new Date(purchaseDate), shelfLife.daysToExpiry);
    return format(expiryDate, 'yyyy-MM-dd');
  }

  /**
   * Calculate the expiry date using AI categorization
   */
  static calculateExpiryDateWithAI(
    productName: string,
    purchaseDate: string
  ): string {
    const shelfLife = this.getShelfLifeWithAI(productName);
    const expiryDate = addDays(new Date(purchaseDate), shelfLife.daysToExpiry);
    return format(expiryDate, 'yyyy-MM-dd');
  }
} 