import { ShelfLife } from '@/types';

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

// Product name keywords mapping to categories
const PRODUCT_KEYWORDS: Record<string, string[]> = {
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

// Brand-specific category mapping
const BRAND_CATEGORY_MAPPING: Record<string, string> = {
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

// Regional adjustments (e.g., for Ireland)
const REGIONAL_ADJUSTMENTS: Record<string, number> = {
  'milk': 1, // Add 1 day to milk shelf life in Ireland (example)
  'bread-fresh': -1, // Reduce by 1 day due to humidity (example)
};

export class ShelfLifeService {
  /**
   * Determine the most likely food category based on product name
   */
  static categorizeProduct(productName: string): string {
    const normalizedName = productName.toLowerCase().trim();
    
    // Check for brand-specific categorization first
    for (const [brand, category] of Object.entries(BRAND_CATEGORY_MAPPING)) {
      if (normalizedName.includes(brand)) {
        // Found a brand match, but still check if we can get more specific
        for (const [specificCategory, keywords] of Object.entries(PRODUCT_KEYWORDS)) {
          if (keywords.some(keyword => normalizedName.includes(keyword))) {
            return specificCategory;
          }
        }
        return category;
      }
    }
    
    // Check for keyword matches
    for (const [category, keywords] of Object.entries(PRODUCT_KEYWORDS)) {
      if (keywords.some(keyword => normalizedName.includes(keyword))) {
        return category;
      }
    }
    
    // Use NLP-like approach for partial matches
    let bestCategory = 'default';
    let highestScore = 0;
    
    for (const [category, keywords] of Object.entries(PRODUCT_KEYWORDS)) {
      for (const keyword of keywords) {
        // Calculate similarity score (simple version)
        const words = normalizedName.split(' ');
        const keywordWords = keyword.split(' ');
        
        let matchCount = 0;
        for (const word of words) {
          if (keywordWords.some(kw => word.includes(kw) || kw.includes(word))) {
            matchCount++;
          }
        }
        
        const score = matchCount / words.length;
        if (score > highestScore && score > 0.3) { // Threshold for partial match
          highestScore = score;
          bestCategory = category;
        }
      }
    }
    
    // Apply special handling for LIDL products
    return this.handleLidlSpecifics(productName, bestCategory);
  }
  
  /**
   * Get shelf life information for a product
   */
  static getShelfLife(productName: string): ShelfLife {
    const category = this.categorizeProduct(productName);
    
    // Find the shelf life data for this category
    const shelfLifeData = SHELF_LIFE_DATABASE.find(item => item.category === category) || 
                          SHELF_LIFE_DATABASE.find(item => item.category === 'default')!;
    
    // Apply regional adjustments if applicable
    let adjustedDaysToExpiry = shelfLifeData.daysToExpiry;
    if (REGIONAL_ADJUSTMENTS[category]) {
      adjustedDaysToExpiry += REGIONAL_ADJUSTMENTS[category];
    }
    
    return {
      ...shelfLifeData,
      daysToExpiry: adjustedDaysToExpiry
    };
  }
  
  /**
   * Calculate estimated expiry date based on product name and purchase date
   */
  static calculateExpiryDate(productName: string, purchaseDate: string): string {
    const shelfLife = this.getShelfLife(productName);
    
    const purchaseDateTime = new Date(purchaseDate);
    const expiryDate = new Date(purchaseDateTime);
    expiryDate.setDate(purchaseDateTime.getDate() + shelfLife.daysToExpiry);
    
    return expiryDate.toISOString().split('T')[0];
  }

  /**
   * Special handling for LIDL receipt items
   */
  static handleLidlSpecifics(productName: string, category: string): string {
    const normalizedName = productName.toLowerCase().trim();
    
    // Handle LIDL's specific product naming
    if (normalizedName.includes('x') && /\d+\s*x/.test(normalizedName)) {
      // This is likely a quantity indicator (e.g., "2 x 0.79")
      // Extract the actual product name
      const actualProduct = normalizedName.replace(/\d+\s*x\s*[\d.]+/, '').trim();
      if (actualProduct) {
        return this.categorizeProduct(actualProduct);
      }
    }
    
    // Handle specific LIDL products from the receipt
    if (normalizedName.includes('greek style yogurt')) {
      return 'greek-yogurt';
    } else if (normalizedName.includes('white sub rolls')) {
      return 'white-rolls';
    } else if (normalizedName.includes('tortilla wraps')) {
      return 'tortilla-wraps';
    } else if (normalizedName.includes('hazelnuts')) {
      return 'hazelnuts';
    } else if (normalizedName.includes('hazelnut') && normalizedName.includes('chocolate')) {
      return 'chocolate';
    }
    
    return category;
  }
} 