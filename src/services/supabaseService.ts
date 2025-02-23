import { supabase } from '@/lib/supabase';
import { Receipt } from '@/types';
import { formatDateForDB } from '@/utils/dateUtils';

interface DatabaseReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  purchase_date: string;
  estimated_expiry_date: string;
  category: string | null;
  vat_rate: number | null;
}

export class SupabaseService {
  static async saveReceipt(receipt: Receipt): Promise<string | null> {
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('Auth error:', userError);
        throw userError;
      }
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Format the date for Postgres
      const formattedDate = formatDateForDB(receipt.date);
      
      // Debug log all the data
      console.log('Debug data:', {
        receipt,
        formattedDate,
        user,
        items: receipt.items.map(item => ({
          ...item,
          purchase_date: formattedDate,
          estimated_expiry_date: formatDateForDB(item.estimatedExpiryDate)
        }))
      });

      // Log the data being sent
      console.log('Saving receipt with data:', {
        user_id: user.id,
        store: receipt.store,
        date: formattedDate,
        total: receipt.total,
        raw_text: receipt.rawText
      });

      // First, insert the receipt
      const { data: receiptData, error: receiptError } = await supabase
        .from('receipts')
        .insert({
          user_id: user.id,
          store: receipt.store,
          date: formattedDate,
          total: receipt.total,
          raw_text: receipt.rawText
        })
        .select()
        .single();

      if (receiptError) {
        console.error('Receipt insert error details:', {
          message: receiptError.message,
          details: receiptError.details,
          hint: receiptError.hint
        });
        throw receiptError;
      }

      if (!receiptData) {
        throw new Error('No receipt data returned after insert');
      }

      // Log receipt items data
      const receiptItems = receipt.items.map(item => ({
        receipt_id: receiptData.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        purchase_date: formattedDate,
        estimated_expiry_date: formatDateForDB(item.estimatedExpiryDate),
        category: item.category,
        vat_rate: item.vatRate
      }));

      console.log('Saving receipt items:', receiptItems);

      const { error: itemsError } = await supabase
        .from('receipt_items')
        .insert(receiptItems);

      if (itemsError) {
        console.error('Items insert error details:', {
          message: itemsError.message,
          details: itemsError.details,
          hint: itemsError.hint
        });
        throw itemsError;
      }

      return receiptData.id;
    } catch (error: Error) {
      console.error('Error saving receipt:', error);
      throw error;
    }
  }

  static async getReceipts(): Promise<Receipt[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Authentication error');
      }

      const { data: receipts, error: receiptsError } = await supabase
        .from('receipts')
        .select(`
          *,
          items:receipt_items(*)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (receiptsError) throw receiptsError;

      return receipts.map(receipt => ({
        id: receipt.id,
        store: receipt.store,
        date: receipt.date,
        total: receipt.total,
        rawText: receipt.raw_text,
        items: receipt.items.map((item: DatabaseReceiptItem) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          purchaseDate: item.purchase_date,
          estimatedExpiryDate: item.estimated_expiry_date,
          category: item.category,
          vatRate: item.vat_rate
        }))
      }));
    } catch (error) {
      console.error('Error fetching receipts:', error);
      return [];
    }
  }

  static async deleteReceipt(receiptId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', receiptId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting receipt:', error);
      throw error;
    }
  }

  static async deleteReceiptItem(itemId: string): Promise<void> {
    try {
      console.log('Deleting item with ID:', itemId);
      const { error } = await supabase
        .from('receipt_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error in deleteReceiptItem:', error);
        throw error;
      }
      console.log('Successfully deleted item:', itemId);
    } catch (error: Error) {
      console.error('Error deleting receipt item:', error);
      throw error;
    }
  }
} 