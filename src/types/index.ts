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
  category?: string;
  vatRate?: number;
}

export interface ShelfLife {
  category: string;
  daysToExpiry: number;
  storageType: 'refrigerated' | 'room-temperature' | 'frozen';
} 