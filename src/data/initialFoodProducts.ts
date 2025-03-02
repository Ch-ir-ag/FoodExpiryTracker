import { FoodProduct } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Convert the existing shelf life database to the new format
const initialFoodProducts: Omit<FoodProduct, 'id' | 'lastUpdated'>[] = [
  // Dairy Products
  {
    name: 'Milk',
    category: 'milk',
    daysToExpiry: 7,
    storageType: 'refrigerated',
    lidlSpecific: false,
    confidence: 0.9
  },
  {
    name: 'Greek Yogurt',
    category: 'yogurt',
    daysToExpiry: 14,
    storageType: 'refrigerated',
    lidlSpecific: false,
    confidence: 0.9
  },
  {
    name: 'Cream Cheese',
    category: 'cheese-soft',
    daysToExpiry: 14,
    storageType: 'refrigerated',
    lidlSpecific: false,
    confidence: 0.9
  },
  {
    name: 'Cheddar Cheese',
    category: 'cheese-hard',
    daysToExpiry: 30,
    storageType: 'refrigerated',
    lidlSpecific: false,
    confidence: 0.9
  },
  
  // LIDL Specific Products
  {
    name: 'LIDL Greek Style Yogurt',
    category: 'yogurt',
    daysToExpiry: 21,
    storageType: 'refrigerated',
    lidlSpecific: true,
    confidence: 0.95
  },
  {
    name: 'LIDL White Sub Rolls',
    category: 'bread-packaged',
    daysToExpiry: 5,
    storageType: 'room-temperature',
    lidlSpecific: true,
    confidence: 0.95
  },
  {
    name: 'LIDL Tortilla Wraps',
    category: 'bread-packaged',
    daysToExpiry: 7,
    storageType: 'room-temperature',
    lidlSpecific: true,
    confidence: 0.95
  },
  {
    name: 'LIDL Roasted Hazelnuts',
    category: 'nuts',
    daysToExpiry: 180,
    storageType: 'room-temperature',
    lidlSpecific: true,
    confidence: 0.95
  },
  {
    name: 'LIDL Hazelnut Milk Chocolate',
    category: 'chocolate',
    daysToExpiry: 180,
    storageType: 'room-temperature',
    lidlSpecific: true,
    confidence: 0.95
  },
  
  // Meat & Seafood
  {
    name: 'Fresh Beef',
    category: 'beef-fresh',
    daysToExpiry: 3,
    storageType: 'refrigerated',
    lidlSpecific: false,
    confidence: 0.9
  },
  {
    name: 'Fresh Chicken',
    category: 'chicken-fresh',
    daysToExpiry: 2,
    storageType: 'refrigerated',
    lidlSpecific: false,
    confidence: 0.9
  },
  {
    name: 'Fresh Fish',
    category: 'fish-fresh',
    daysToExpiry: 1,
    storageType: 'refrigerated',
    lidlSpecific: false,
    confidence: 0.9
  },
  
  // Fruits
  {
    name: 'Apples',
    category: 'apples',
    daysToExpiry: 30,
    storageType: 'refrigerated',
    lidlSpecific: false,
    confidence: 0.9
  },
  {
    name: 'Bananas',
    category: 'bananas',
    daysToExpiry: 5,
    storageType: 'room-temperature',
    lidlSpecific: false,
    confidence: 0.9
  },
  {
    name: 'Berries',
    category: 'berries',
    daysToExpiry: 5,
    storageType: 'refrigerated',
    lidlSpecific: false,
    confidence: 0.9
  },
  
  // Vegetables
  {
    name: 'Leafy Greens',
    category: 'leafy-greens',
    daysToExpiry: 5,
    storageType: 'refrigerated',
    lidlSpecific: false,
    confidence: 0.9
  },
  {
    name: 'Potatoes',
    category: 'potatoes',
    daysToExpiry: 21,
    storageType: 'room-temperature',
    lidlSpecific: false,
    confidence: 0.9
  },
  {
    name: 'Onions',
    category: 'onions',
    daysToExpiry: 30,
    storageType: 'room-temperature',
    lidlSpecific: false,
    confidence: 0.9
  },
  
  // Bakery
  {
    name: 'Fresh Bread',
    category: 'bread-fresh',
    daysToExpiry: 5,
    storageType: 'room-temperature',
    lidlSpecific: false,
    confidence: 0.9
  },
  {
    name: 'Packaged Bread',
    category: 'bread-packaged',
    daysToExpiry: 7,
    storageType: 'room-temperature',
    lidlSpecific: false,
    confidence: 0.9
  },
  
  // LIDL Specific Categories
  {
    name: 'LIDL Bakery Item',
    category: 'lidl-bakery',
    daysToExpiry: 3,
    storageType: 'room-temperature',
    lidlSpecific: true,
    confidence: 0.9
  },
  {
    name: 'LIDL Deli Item',
    category: 'lidl-deli',
    daysToExpiry: 4,
    storageType: 'refrigerated',
    lidlSpecific: true,
    confidence: 0.9
  },
  {
    name: 'LIDL Fresh Meat',
    category: 'lidl-fresh-meat',
    daysToExpiry: 3,
    storageType: 'refrigerated',
    lidlSpecific: true,
    confidence: 0.9
  },
  {
    name: 'LIDL Fresh Fish',
    category: 'lidl-fresh-fish',
    daysToExpiry: 1,
    storageType: 'refrigerated',
    lidlSpecific: true,
    confidence: 0.9
  },
  {
    name: 'LIDL Dairy Product',
    category: 'lidl-dairy',
    daysToExpiry: 10,
    storageType: 'refrigerated',
    lidlSpecific: true,
    confidence: 0.9
  }
];

// Add IDs and lastUpdated to each product
const now = new Date().toISOString();
const productsWithIds = initialFoodProducts.map(product => ({
  ...product,
  id: uuidv4(),
  lastUpdated: now
}));

export default productsWithIds; 