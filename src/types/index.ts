export interface Receipt {
  id: string;
  store: string;
  date: string;
  items: ReceiptItem[];
  total: number;
  rawText?: string;
}

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  purchaseDate: string;
  estimatedExpiryDate: string;
  category?: string | null;
  vatRate?: number | null;
  userCorrectedExpiry?: boolean;
}

export interface ShelfLife {
  category: string;
  daysToExpiry: number;
  storageType: 'refrigerated' | 'room-temperature' | 'frozen';
}

export interface FoodProduct {
  id: string;
  name: string;
  category: string;
  daysToExpiry: number;
  storageType: 'refrigerated' | 'room-temperature' | 'frozen';
  barcode?: string | null;
  brand?: string | null;
  lidlSpecific: boolean;
  confidence: number;
  lastUpdated: string;
}

export interface ProductMatch {
  product: FoodProduct;
  confidence: number;
} 