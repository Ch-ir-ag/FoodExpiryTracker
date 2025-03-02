import { supabase } from '@/lib/supabase';
import { FoodProduct, ProductMatch } from '@/types';

/**
 * Service for managing the dynamic food product database
 */
export class FoodDatabaseService {
  /**
   * Initialize the food database with default values if it's empty
   */
  static async initializeDatabase(): Promise<void> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Check if the database is already populated
      const { count, error } = await supabase
        .from('food_products')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      // If we already have products, no need to initialize
      if (count && count > 0) return;

      // Import the default shelf life database to bootstrap the system
      // We'll use the existing ShelfLifeService data for initial population
      // instead of importing from a separate file
      const initialProducts = this.generateInitialProducts();
      
      // Insert the initial products in batches to avoid request size limits
      const batchSize = 50;
      for (let i = 0; i < initialProducts.length; i += batchSize) {
        const batch = initialProducts.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('food_products')
          .insert(batch);
        
        if (insertError) throw insertError;
      }

      console.log('Food database initialized with default products');
    } catch (error) {
      console.error('Error initializing food database:', error);
      throw error;
    }
  }

  /**
   * Generate initial products from the existing shelf life data
   */
  private static generateInitialProducts(): FoodProduct[] {
    // This is a simplified version - in production, you'd convert from your existing database
    const now = new Date().toISOString();
    
    return [
      // Dairy Products
      {
        id: crypto.randomUUID(),
        name: 'Milk',
        category: 'milk',
        daysToExpiry: 7,
        storageType: 'refrigerated',
        lidlSpecific: false,
        confidence: 0.9,
        lastUpdated: now
      },
      {
        id: crypto.randomUUID(),
        name: 'Greek Yogurt',
        category: 'yogurt',
        daysToExpiry: 14,
        storageType: 'refrigerated',
        lidlSpecific: false,
        confidence: 0.9,
        lastUpdated: now
      },
      // LIDL Specific Products
      {
        id: crypto.randomUUID(),
        name: 'LIDL Greek Style Yogurt',
        category: 'yogurt',
        daysToExpiry: 21,
        storageType: 'refrigerated',
        lidlSpecific: true,
        confidence: 0.95,
        lastUpdated: now
      },
      {
        id: crypto.randomUUID(),
        name: 'LIDL White Sub Rolls',
        category: 'bread-packaged',
        daysToExpiry: 5,
        storageType: 'room-temperature',
        lidlSpecific: true,
        confidence: 0.95,
        lastUpdated: now
      },
      // Add specific products with correct expiry dates
      {
        id: crypto.randomUUID(),
        name: 'Roasted hazelnuts',
        category: 'nuts',
        daysToExpiry: 90,
        storageType: 'room-temperature',
        lidlSpecific: true,
        confidence: 0.95,
        lastUpdated: now
      },
      {
        id: crypto.randomUUID(),
        name: 'Hazelnuts',
        category: 'nuts',
        daysToExpiry: 90,
        storageType: 'room-temperature',
        lidlSpecific: true,
        confidence: 0.95,
        lastUpdated: now
      },
      {
        id: crypto.randomUUID(),
        name: 'Whole Hazelnut Milk Chocolate',
        category: 'chocolate',
        daysToExpiry: 180,
        storageType: 'room-temperature',
        lidlSpecific: true,
        confidence: 0.95,
        lastUpdated: now
      },
      {
        id: crypto.randomUUID(),
        name: 'Milk Chocolate',
        category: 'chocolate',
        daysToExpiry: 180,
        storageType: 'room-temperature',
        lidlSpecific: true,
        confidence: 0.95,
        lastUpdated: now
      }
      // Add more products as needed
    ];
  }

  /**
   * Find the best matching product for a given product name
   */
  static async findBestMatch(productName: string): Promise<ProductMatch | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Special case handling for specific products
      const normalizedName = productName.toLowerCase().trim();
      
      // Direct matches for specific products
      if (normalizedName.includes('hazelnut') || normalizedName.includes('hazelnuts')) {
        const { data: nutMatches, error: nutError } = await supabase
          .from('food_products')
          .select('*')
          .ilike('name', '%hazelnut%')
          .order('confidence', { ascending: false })
          .limit(1);
          
        if (nutError) throw nutError;
        
        if (nutMatches && nutMatches.length > 0) {
          return {
            product: nutMatches[0] as FoodProduct,
            confidence: 0.95
          };
        }
      }
      
      if (normalizedName.includes('chocolate')) {
        const { data: chocolateMatches, error: chocolateError } = await supabase
          .from('food_products')
          .select('*')
          .ilike('name', '%chocolate%')
          .order('confidence', { ascending: false })
          .limit(1);
          
        if (chocolateError) throw chocolateError;
        
        if (chocolateMatches && chocolateMatches.length > 0) {
          return {
            product: chocolateMatches[0] as FoodProduct,
            confidence: 0.95
          };
        }
      }

      // First try exact match
      const { data: exactMatches, error: exactError } = await supabase
        .from('food_products')
        .select('*')
        .ilike('name', productName)
        .limit(1);

      if (exactError) throw exactError;

      if (exactMatches && exactMatches.length > 0) {
        return {
          product: exactMatches[0] as FoodProduct,
          confidence: 1.0
        };
      }

      // Try fuzzy search using Supabase's text search capabilities
      const words = normalizedName.split(' ').filter(w => w.length > 2);
      
      if (words.length === 0) {
        return null;
      }

      // Build a query that searches for any of the words in the product name
      let query = supabase
        .from('food_products')
        .select('*');

      // Add conditions for each word
      for (const word of words) {
        query = query.or(`name.ilike.%${word}%`);
      }

      const { data: fuzzyMatches, error: fuzzyError } = await query.limit(5);

      if (fuzzyError) throw fuzzyError;

      if (!fuzzyMatches || fuzzyMatches.length === 0) {
        return null;
      }

      // Calculate confidence scores based on word matches
      const scoredMatches = fuzzyMatches.map(product => {
        const productWords = product.name.toLowerCase().split(' ');
        let matchCount = 0;
        
        for (const word of words) {
          if (productWords.some((pw: string) => pw.includes(word) || word.includes(pw))) {
            matchCount++;
          }
        }
        
        const confidence = matchCount / Math.max(words.length, productWords.length);
        
        return {
          product: product as FoodProduct,
          confidence
        };
      });

      // Sort by confidence and return the best match
      scoredMatches.sort((a, b) => b.confidence - a.confidence);
      
      // Only return if confidence is above threshold
      return scoredMatches[0].confidence > 0.3 ? scoredMatches[0] : null;
    } catch (error) {
      console.error('Error finding product match:', error);
      return null;
    }
  }

  /**
   * Add a new product to the database or update an existing one
   */
  static async saveProduct(product: Omit<FoodProduct, 'id' | 'lastUpdated'>): Promise<FoodProduct | null> {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      const now = new Date().toISOString();
      
      // Check if a similar product already exists
      const { data: existingProducts, error: searchError } = await supabase
        .from('food_products')
        .select('*')
        .ilike('name', product.name)
        .limit(1);

      if (searchError) throw searchError;

      if (existingProducts && existingProducts.length > 0) {
        // Update the existing product
        const existingProduct = existingProducts[0];
        const { data: updatedProduct, error: updateError } = await supabase
          .from('food_products')
          .update({
            ...product,
            lastUpdated: now
          })
          .eq('id', existingProduct.id)
          .select()
          .single();

        if (updateError) throw updateError;
        return updatedProduct as FoodProduct;
      } else {
        // Insert a new product
        const { data: newProduct, error: insertError } = await supabase
          .from('food_products')
          .insert({
            ...product,
            id: crypto.randomUUID(),
            lastUpdated: now
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newProduct as FoodProduct;
      }
    } catch (error) {
      console.error('Error saving product:', error);
      return null;
    }
  }

  /**
   * Learn from user corrections to improve the database
   */
  static async learnFromCorrection(
    productName: string, 
    originalExpiryDays: number, 
    correctedExpiryDays: number
  ): Promise<void> {
    try {
      // Find the product that was used for the original prediction
      const match = await this.findBestMatch(productName);
      
      if (!match) {
        // If no match was found, create a new product entry
        await this.saveProduct({
          name: productName,
          category: this.inferCategoryFromName(productName),
          daysToExpiry: correctedExpiryDays,
          storageType: this.inferStorageType(productName, correctedExpiryDays),
          lidlSpecific: true,
          confidence: 0.8 // Start with reasonable confidence
        });
        return;
      }
      
      // If we found a match, update it with a weighted average of the old and new values
      // This helps the system learn gradually without overreacting to a single correction
      const product = match.product;
      const weightedDaysToExpiry = Math.round(
        (product.daysToExpiry * 0.7) + (correctedExpiryDays * 0.3)
      );
      
      await this.saveProduct({
        ...product,
        daysToExpiry: weightedDaysToExpiry,
        // Increase confidence if the correction is close to the original
        confidence: Math.min(
          1.0, 
          product.confidence + (Math.abs(originalExpiryDays - correctedExpiryDays) < 3 ? 0.1 : -0.1)
        )
      });
    } catch (error) {
      console.error('Error learning from correction:', error);
    }
  }

  /**
   * Infer a category from a product name
   */
  private static inferCategoryFromName(productName: string): string {
    const normalized = productName.toLowerCase();
    
    // Simple category inference based on keywords
    if (normalized.includes('milk')) return 'milk';
    if (normalized.includes('yogurt') || normalized.includes('yoghurt')) return 'yogurt';
    if (normalized.includes('cheese')) return normalized.includes('cream') ? 'cheese-soft' : 'cheese-hard';
    if (normalized.includes('bread') || normalized.includes('roll')) return 'bread-packaged';
    if (normalized.includes('meat') || normalized.includes('beef') || normalized.includes('chicken')) return 'meat-fresh';
    if (normalized.includes('fish')) return 'fish-fresh';
    if (normalized.includes('fruit')) return 'fruit';
    if (normalized.includes('vegetable')) return 'vegetable';
    
    // Default category
    return 'default';
  }

  /**
   * Infer storage type based on product name and expiry days
   */
  private static inferStorageType(
    productName: string, 
    daysToExpiry: number
  ): 'refrigerated' | 'room-temperature' | 'frozen' {
    const normalized = productName.toLowerCase();
    
    // Frozen items typically have long shelf lives
    if (normalized.includes('frozen') || daysToExpiry > 60) return 'frozen';
    
    // Items that need refrigeration
    if (
      normalized.includes('milk') || 
      normalized.includes('yogurt') || 
      normalized.includes('yoghurt') ||
      normalized.includes('cheese') ||
      normalized.includes('meat') ||
      normalized.includes('fish') ||
      normalized.includes('fresh')
    ) return 'refrigerated';
    
    // Default to room temperature
    return 'room-temperature';
  }
} 