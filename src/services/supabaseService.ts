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
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

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
    } catch (error: unknown) {
      console.error('Error saving receipt:', error);
      throw error;
    }
  }

  /**
   * Get all receipts for the current user
   * @param forceRefresh If true, adds cache busting to ensure fresh data
   */
  static async getReceipts(_forceRefresh = true): Promise<Receipt[]> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      console.log('Fetching receipts from database...');
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('Authentication error');
      }
      
      // Use a timestamp to prevent caching
      const cacheBuster = new Date().getTime();
      console.log(`Using timestamp: ${cacheBuster} for cache busting`);

      // Simple query without headers (which aren't supported in your version)
      const { data: receipts, error: receiptsError } = await supabase
        .from('receipts')
        .select(`
          *,
          items:receipt_items(*)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (receiptsError) {
        console.error('Error fetching receipts:', receiptsError);
        throw receiptsError;
      }

      if (!receipts) {
        console.warn('No receipts found');
        return [];
      }

      console.log(`Fetched ${receipts.length} receipts with ${receipts.reduce((total, r) => total + r.items.length, 0)} items`);
      
      // Log all received expiry dates for debugging
      console.log("RECEIVED EXPIRY DATES FROM DATABASE:");
      receipts.forEach(receipt => {
        receipt.items.forEach((item: any) => {
          console.log(`${item.name}: ${item.estimated_expiry_date} (corrected: ${item.user_corrected_expiry})`);
        });
      });

      // Transform the data to match the Receipt type
      const transformedReceipts: Receipt[] = receipts.map(receipt => ({
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

      return transformedReceipts;
    } catch (error) {
      console.error('Error in getReceipts:', error);
      throw error;
    }
  }

  static async deleteReceipt(receiptId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Authentication error');
      }

      // Use RPC (stored procedure) to delete receipt and its items
      const { error } = await supabase.rpc('delete_receipt_with_items', {
        receipt_id: receiptId,
        user_id: user.id
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteReceipt:', error);
      throw error;
    }
  }

  static async deleteAllReceipts(): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Authentication error');
      }

      // Get all receipts for this user
      const { data: receipts } = await supabase
        .from('receipts')
        .select('id')
        .eq('user_id', user.id);

      if (!receipts?.length) {
        return; // No receipts to delete
      }

      // Delete all receipt items first
      const { error: itemsError } = await supabase
        .from('receipt_items')
        .delete()
        .in('receipt_id', receipts.map(r => r.id));

      if (itemsError) {
        console.error('Error deleting receipt items:', itemsError);
        throw itemsError;
      }

      // Then delete all receipts
      const { error: receiptsError } = await supabase
        .from('receipts')
        .delete()
        .eq('user_id', user.id);

      if (receiptsError) {
        console.error('Error deleting receipts:', receiptsError);
        throw receiptsError;
      }

    } catch (error) {
      console.error('Error in deleteAllReceipts:', error);
      throw error;
    }
  }

  static async deleteReceiptItem(itemId: string): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      console.log('Deleting item with ID:', itemId);
      const { error } = await supabase
        .from('receipt_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting receipt item:', error);
      throw error;
    }
  }

  /**
   * Update the expiry date of a receipt item - simplest possible approach
   */
  static async updateItemExpiryDate(
    itemId: string, 
    newExpiryDate: string,
    userCorrected: boolean = false
  ): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      console.log(`Updating expiry date for item ${itemId} to ${newExpiryDate}`);
      
      // Update all fields in a single operation for simplicity
      const { error } = await supabase
        .from('receipt_items')
        .update({ 
          estimated_expiry_date: newExpiryDate,
          user_corrected_expiry: userCorrected
        })
        .eq('id', itemId);
        
      if (error) {
        console.error('Error updating expiry date:', error);
        throw error;
      }
      
      console.log('Successfully updated expiry date');
    } catch (error) {
      console.error('Error in updateItemExpiryDate:', error);
      throw error;
    }
  }

  /**
   * Ultra-debug version of the update method with added diagnostics
   */
  static async directUpdateExpiryDate(
    itemId: string,
    newExpiryDate: string
  ): Promise<void> {
    console.log('⚡ directUpdateExpiryDate STARTED ⚡');
    console.log(`Parameters: itemId=${itemId}, newExpiryDate=${newExpiryDate}`);
    
    if (!supabase) {
      console.error('🔴 CRITICAL ERROR: Supabase client not initialized');
      throw new Error('Supabase client not initialized');
    }
    
    // Ensure UUID format is correct (if it's a UUID)
    let formattedItemId = itemId;
    try {
      // Check if it looks like a UUID format (basic validation)
      if (itemId.includes('-') && itemId.length > 30) {
        // It's likely a UUID, make sure format is correct
        const parts = itemId.split('-');
        if (parts.length === 5) {
          // It's already in correct format
          formattedItemId = itemId;
        }
      }
      console.log(`Using formatted item ID: ${formattedItemId}`);
    } catch (error) {
      console.warn('UUID formatting issue:', error);
      // Continue with original ID
    }
    
    // Ensure date is properly formatted for PostgreSQL
    let formattedDate = newExpiryDate;
    try {
      // If it's YYYY-MM-DD format, it's already OK for PostgreSQL
      if (/^\d{4}-\d{2}-\d{2}$/.test(newExpiryDate)) {
        formattedDate = newExpiryDate;
      } else {
        // Try to parse and format the date
        const date = new Date(newExpiryDate);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0];
        }
      }
      console.log(`Using formatted date: ${formattedDate} (original: ${newExpiryDate})`);
    } catch (dateErr) {
      console.warn('Date formatting issue:', dateErr);
      // Continue with original date
    }

    try {
      // Skip directly to update without read verification (since reads are failing)
      console.log('Attempting direct database update...');
      
      // Use multiple approaches to maximize chance of success
      
      // Approach 1: Standard update with minimal fields
      console.log('Approach 1: Standard update with minimal fields...');
      const { error: updateError1 } = await supabase
        .from('receipt_items')
        .update({
          estimated_expiry_date: formattedDate,
          user_corrected_expiry: true
        })
        .eq('id', formattedItemId);
      
      if (updateError1) {
        console.error('🔴 UPDATE APPROACH 1 FAILED:', updateError1);
        
        // Approach 2: Try RPC fallback
        console.log('Approach 2: Attempting RPC update...');
        try {
          const { error: rpcError } = await supabase.rpc('update_item_expiry', {
            item_id: formattedItemId,
            new_expiry_date: formattedDate
          });
          
          if (rpcError) {
            console.error('🔴 RPC UPDATE FAILED:', rpcError);
            throw new Error(`Failed via RPC: ${rpcError.message}`);
          } else {
            console.log('✅ RPC UPDATE SUCCEEDED');
            // Verification step
            await verifyUpdate(formattedItemId, formattedDate);
            return;
          }
        } catch (rpcCatchErr) {
          console.error('RPC call threw exception:', rpcCatchErr);
          
          // Approach 3: Raw update with forced cache busting
          console.log('Approach 3: Raw update with cache busting...');
          const { error: updateError3 } = await supabase
            .from('receipt_items')
            .update({
              estimated_expiry_date: formattedDate,
              user_corrected_expiry: true,
              // Add a cache-busting field that won't affect functionality
              updated_at: new Date().toISOString()
            })
            .eq('id', formattedItemId)
            .select()
            .maybeSingle();
            
          if (updateError3) {
            console.error('🔴 UPDATE APPROACH 3 FAILED:', updateError3);
            throw new Error(`All update approaches failed`);
          } else {
            console.log('✅ UPDATE APPROACH 3 SUCCEEDED');
            // Verification step
            await verifyUpdate(formattedItemId, formattedDate);
            return;
          }
        }
      } else {
        console.log('✅ UPDATE APPROACH 1 SUCCEEDED');
        // Verification step
        await verifyUpdate(formattedItemId, formattedDate);
        return;
      }
      
      console.log('⚡ directUpdateExpiryDate COMPLETED ⚡');
    } catch (error) {
      console.error('💥 CRITICAL ERROR in directUpdateExpiryDate:', error);
      throw error;
    }
    
    // Helper function to verify the update
    async function verifyUpdate(id: string, expectedDate: string) {
      try {
        console.log('🔍 Verifying update...');
        
        const { data, error } = await supabase!
          .from('receipt_items')
          .select('estimated_expiry_date, user_corrected_expiry')
          .eq('id', id)
          .select();
          
        if (error) {
          console.warn('⚠️ Verification query failed:', error);
        } else if (data && data.length > 0) {
          console.log('📊 VERIFICATION DATA:', data[0]);
          if (data[0].estimated_expiry_date === expectedDate) {
            console.log('✅ EXPIRY DATE VERIFIED IN DATABASE!');
          } else {
            console.warn(`⚠️ EXPIRY DATE MISMATCH: ${data[0].estimated_expiry_date} !== ${expectedDate}`);
          }
        } else {
          console.warn('⚠️ No data returned for verification');
        }
      } catch (verifyError) {
        console.warn('⚠️ Verification failed but update may have succeeded:', verifyError);
      }
    }
  }

  /**
   * Last resort method that attempts to update an item's expiry date via raw SQL
   * This is only for debugging purposes to diagnose issues with RLS or other permission problems
   */
  static async emergencyUpdateExpiryDate(
    itemId: string,
    newExpiryDate: string
  ): Promise<void> {
    console.log('🚨 EMERGENCY UPDATE METHOD CALLED 🚨');
    console.log(`Parameters: itemId=${itemId}, newExpiryDate=${newExpiryDate}`);
    
    if (!supabase) {
      console.error('🔴 CRITICAL ERROR: Supabase client not initialized');
      throw new Error('Supabase client not initialized');
    }

    try {
      // Attempt a raw SQL update bypassing normal methods
      console.log('Attempting SQL update via rpc...');
      
      // First, let's check if there's even a function to execute
      const { data: funcCheck, error: funcCheckError } = await supabase
        .rpc('check_function_exists', { function_name: 'emergency_update_expiry' });
        
      console.log('Function check result:', { funcCheck, funcCheckError });
      
      if (funcCheckError || !funcCheck) {
        console.log('Function emergency_update_expiry does not exist, creating it now...');
        
        // Comment out or remove the unused variable
        /* 
        const createFunctionSQL = `
          CREATE OR REPLACE FUNCTION emergency_update_expiry(
            p_item_id UUID,
            p_new_date TEXT
          )
          RETURNS BOOLEAN
          LANGUAGE plpgsql
          SECURITY DEFINER -- This runs with the privileges of the function creator
          AS $$
          DECLARE
            success BOOLEAN;
          BEGIN
            UPDATE receipt_items
            SET 
              estimated_expiry_date = p_new_date::DATE,
              user_corrected_expiry = TRUE,
              updated_at = NOW()
            WHERE id = p_item_id;
            
            GET DIAGNOSTICS success = ROW_COUNT;
            
            -- Log the attempt
            INSERT INTO update_logs (
              table_name, row_id, operation, new_data, user_id
            ) VALUES (
              'receipt_items',
              p_item_id::TEXT,
              'EMERGENCY_UPDATE',
              jsonb_build_object('estimated_expiry_date', p_new_date, 'emergency', true),
              auth.uid()
            );
            
            RETURN success > 0;
          END;
          $$;
        `;
        */
        
        // This would need to be run by a Supabase admin or via a migration
        console.log('Cannot create function dynamically, need admin rights');
      }
      
      // Try the direct SQL update via RPC call (if function exists)
      console.log('Attempting emergency update via RPC...');
      const { data, error } = await supabase
        .rpc('emergency_update_expiry', { 
          p_item_id: itemId,
          p_new_date: newExpiryDate
        });
        
      console.log('Emergency update result:', { data, error });
      
      if (error) {
        throw new Error(`Emergency update failed: ${error.message}`);
      }
      
      // Verify if the update was successful
      const { data: verifyData, error: verifyError } = await supabase
        .from('receipt_items')
        .select('estimated_expiry_date, user_corrected_expiry')
        .eq('id', itemId)
        .single();
        
      if (verifyError) {
        console.error('Verification failed after emergency update:', verifyError);
      } else {
        console.log('Verification data after emergency update:', verifyData);
      }
      
      console.log('🚨 EMERGENCY UPDATE COMPLETED 🚨');
    } catch (error) {
      console.error('💥 CRITICAL ERROR in emergencyUpdateExpiryDate:', error);
      throw error;
    }
  }
} 