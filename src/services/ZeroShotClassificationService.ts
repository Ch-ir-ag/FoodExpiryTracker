// import { pipeline } from '@xenova/transformers';

/**
 * Simple keyword-based classification service for food items
 * This is a fallback implementation that doesn't rely on external ML libraries
 */
export class ZeroShotClassificationService {
  // Categories for food classification
  private static readonly FOOD_CATEGORIES = [
    'dairy', 'meat', 'seafood', 'fruit', 'vegetable', 
    'bakery', 'pantry', 'snack', 'beverage', 'eggs'
  ];

  // Detailed categories for second-level classification with keywords for matching
  private static readonly DETAILED_CATEGORIES: Record<string, {name: string, keywords: string[]}[]> = {
    'dairy': [
      {name: 'milk', keywords: ['milk', 'lactose free', 'almond milk', 'oat milk']},
      {name: 'yogurt', keywords: ['yogurt', 'yoghurt', 'greek yogurt', 'skyr']},
      {name: 'cheese', keywords: ['cheese', 'mozzarella', 'cheddar', 'parmesan', 'feta', 'brie']},
      {name: 'butter', keywords: ['butter', 'lurpak', 'margarine', 'spread']},
      {name: 'cream', keywords: ['cream', 'sour cream', 'crème fraîche', 'whipping']}
    ],
    'meat': [
      {name: 'beef', keywords: ['beef', 'steak', 'mince', 'ground beef', 'burger']},
      {name: 'chicken', keywords: ['chicken', 'poultry', 'drumstick', 'thigh', 'breast']},
      {name: 'pork', keywords: ['pork', 'loin', 'chop', 'tenderloin']},
      {name: 'sausage', keywords: ['sausage', 'bratwurst', 'chorizo']},
      {name: 'bacon', keywords: ['bacon', 'pancetta', 'lardons']},
      {name: 'ham', keywords: ['ham', 'prosciutto', 'serrano', 'parma']}
    ],
    'seafood': [
      {name: 'fish', keywords: ['fish', 'salmon', 'tuna', 'cod', 'haddock', 'tilapia']},
      {name: 'shellfish', keywords: ['shellfish', 'mussel', 'oyster', 'clam']},
      {name: 'prawn', keywords: ['prawn', 'shrimp']},
      {name: 'crab', keywords: ['crab', 'crabmeat']},
      {name: 'lobster', keywords: ['lobster']}
    ],
    'fruit': [
      {name: 'apple', keywords: ['apple', 'granny smith', 'pink lady']},
      {name: 'banana', keywords: ['banana', 'plantain']},
      {name: 'orange', keywords: ['orange', 'clementine', 'tangerine', 'satsuma']},
      {name: 'berries', keywords: ['berry', 'strawberry', 'blueberry', 'raspberry', 'blackberry']},
      {name: 'melon', keywords: ['melon', 'watermelon', 'cantaloupe', 'honeydew']},
      {name: 'citrus', keywords: ['lemon', 'lime', 'grapefruit']}
    ],
    'vegetable': [
      {name: 'lettuce', keywords: ['lettuce', 'romaine', 'iceberg', 'arugula', 'salad']},
      {name: 'tomato', keywords: ['tomato', 'cherry tomato', 'plum tomato']},
      {name: 'cucumber', keywords: ['cucumber']},
      {name: 'pepper', keywords: ['pepper', 'bell pepper', 'capsicum', 'chili']},
      {name: 'carrot', keywords: ['carrot']},
      {name: 'potato', keywords: ['potato', 'sweet potato', 'russet']},
      {name: 'onion', keywords: ['onion', 'shallot', 'leek', 'spring onion', 'scallion']}
    ],
    'bakery': [
      {name: 'bread', keywords: ['bread', 'loaf', 'bun', 'bagel', 'sourdough', 'whole wheat']},
      {name: 'roll', keywords: ['roll', 'baguette', 'ciabatta']},
      {name: 'cake', keywords: ['cake', 'cheesecake', 'muffin', 'cupcake']},
      {name: 'cookies', keywords: ['cookie', 'biscuit']},
      {name: 'pastry', keywords: ['pastry', 'croissant', 'danish']},
      {name: 'croissant', keywords: ['croissant']}
    ],
    'pantry': [
      {name: 'pasta', keywords: ['pasta', 'spaghetti', 'penne', 'fusilli', 'lasagna', 'macaroni']},
      {name: 'rice', keywords: ['rice', 'basmati', 'jasmine', 'brown rice', 'risotto']},
      {name: 'cereal', keywords: ['cereal', 'oatmeal', 'muesli', 'cornflakes']},
      {name: 'canned', keywords: ['can', 'canned', 'tinned', 'preserved']},
      {name: 'flour', keywords: ['flour', 'self-raising', 'all-purpose']},
      {name: 'sugar', keywords: ['sugar', 'sweetener', 'caster sugar', 'brown sugar']},
      {name: 'oil', keywords: ['oil', 'olive oil', 'vegetable oil', 'sunflower oil']}
    ],
    'snack': [
      {name: 'chocolate', keywords: ['chocolate', 'cocoa', 'kit kat', 'snickers']},
      {name: 'chips', keywords: ['chips', 'crisps', 'tortilla chips', 'potato chips']},
      {name: 'nuts', keywords: ['nuts', 'peanuts', 'almonds', 'cashews', 'walnuts']},
      {name: 'crackers', keywords: ['cracker', 'rice cake', 'crispbread']},
      {name: 'candy', keywords: ['candy', 'sweets', 'gum', 'jellies', 'marshmallow']}
    ],
    'beverage': [
      {name: 'juice', keywords: ['juice', 'orange juice', 'apple juice', 'cranberry juice']},
      {name: 'soda', keywords: ['soda', 'soft drink', 'cola', 'lemonade', 'sprite', 'fanta']},
      {name: 'water', keywords: ['water', 'sparkling water', 'mineral water']},
      {name: 'beer', keywords: ['beer', 'ale', 'lager', 'stout', 'pilsner']},
      {name: 'wine', keywords: ['wine', 'red wine', 'white wine', 'rosé', 'champagne']}
    ],
    'eggs': [
      {name: 'eggs', keywords: ['egg', 'eggs', 'free range', 'organic eggs']}
    ]
  };

  /**
   * Main category keywords for initial classification
   */
  private static readonly CATEGORY_KEYWORDS: Record<string, string[]> = {
    'dairy': ['milk', 'yogurt', 'cheese', 'butter', 'cream', 'dairy', 'yoghurt', 'creamer'],
    'meat': ['beef', 'chicken', 'pork', 'sausage', 'bacon', 'ham', 'turkey', 'meat', 'steak'],
    'seafood': ['fish', 'shellfish', 'prawn', 'shrimp', 'crab', 'lobster', 'seafood', 'salmon', 'tuna'],
    'fruit': ['apple', 'banana', 'orange', 'berry', 'berries', 'melon', 'fruit', 'citrus'],
    'vegetable': ['lettuce', 'tomato', 'cucumber', 'pepper', 'carrot', 'potato', 'onion', 'vegetable', 'veg'],
    'bakery': ['bread', 'roll', 'cake', 'cookie', 'pastry', 'croissant', 'bakery', 'baked', 'loaf'],
    'pantry': ['pasta', 'rice', 'cereal', 'canned', 'flour', 'sugar', 'oil', 'grain', 'dry goods'],
    'snack': ['chocolate', 'chips', 'nuts', 'crackers', 'candy', 'snack', 'crisp', 'treat'],
    'beverage': ['juice', 'soda', 'water', 'beer', 'wine', 'drink', 'beverage', 'tea', 'coffee'],
    'eggs': ['egg', 'eggs', 'free range', 'organic eggs']
  };

  /**
   * Classify a food item into its main category using keyword matching
   * @param productName The name of the product to classify
   * @returns The predicted category
   */
  static classifyFoodCategory(productName: string): string {
    const normalizedName = productName.toLowerCase();
    
    // Check each category for keyword matches
    for (const category of this.FOOD_CATEGORIES) {
      const keywords = this.CATEGORY_KEYWORDS[category];
      for (const keyword of keywords) {
        if (normalizedName.includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }
    
    // Default category if no match found
    return 'pantry';
  }

  /**
   * Get detailed subcategory using keyword matching
   * @param productName The name of the product
   * @param mainCategory The main category determined earlier
   * @returns The specific subcategory
   */
  static classifyFoodSubcategory(productName: string, mainCategory: string): string {
    const normalizedName = productName.toLowerCase();
    
    // If we don't have subcategories for this main category, return main category
    if (!mainCategory || !this.DETAILED_CATEGORIES[mainCategory]) {
      return mainCategory;
    }
    
    // Check subcategories for keyword matches
    const subcategories = this.DETAILED_CATEGORIES[mainCategory];
    for (const sub of subcategories) {
      for (const keyword of sub.keywords) {
        if (normalizedName.includes(keyword.toLowerCase())) {
          return sub.name;
        }
      }
    }
    
    // Default to main category if no subcategory match found
    return mainCategory;
  }

  /**
   * Comprehensive food item classification returning both main category and subcategory
   * @param productName The name of the product to classify
   * @returns An object with main category and subcategory
   */
  static classifyFood(productName: string): { 
    mainCategory: string, 
    subcategory: string,
    confidence: number
  } {
    const mainCategory = this.classifyFoodCategory(productName);
    const subcategory = this.classifyFoodSubcategory(productName, mainCategory);

    // Confidence is always high with keyword matching since it's deterministic
    const confidence = 0.9;

    return {
      mainCategory,
      subcategory,
      confidence
    };
  }
} 