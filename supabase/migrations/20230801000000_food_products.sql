-- Enable the pg_trgm extension for text search capabilities
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create the food_products table
CREATE TABLE IF NOT EXISTS food_products (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  days_to_expiry INTEGER NOT NULL,
  storage_type TEXT NOT NULL,
  barcode TEXT,
  brand TEXT,
  lidl_specific BOOLEAN NOT NULL DEFAULT FALSE,
  confidence FLOAT NOT NULL DEFAULT 0.5,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add indexes for faster searching
CREATE INDEX IF NOT EXISTS idx_food_products_name ON food_products USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_food_products_category ON food_products (category);
CREATE INDEX IF NOT EXISTS idx_food_products_lidl_specific ON food_products (lidl_specific);

-- Add a column to receipt_items to track user corrections
ALTER TABLE receipt_items ADD COLUMN IF NOT EXISTS user_corrected_expiry BOOLEAN DEFAULT FALSE;

-- Create a function to update the last_updated timestamp
CREATE OR REPLACE FUNCTION update_food_product_last_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the last_updated timestamp
CREATE TRIGGER update_food_product_last_updated
BEFORE UPDATE ON food_products
FOR EACH ROW
EXECUTE FUNCTION update_food_product_last_updated();

-- Create a function to handle user corrections and improve the food database
CREATE OR REPLACE FUNCTION handle_expiry_correction()
RETURNS TRIGGER AS $$
DECLARE
  product_name TEXT;
  purchase_date DATE;
  original_days INTEGER;
  corrected_days INTEGER;
  matching_product UUID;
BEGIN
  -- Only process if this is a user correction
  IF NEW.user_corrected_expiry = TRUE THEN
    -- Get the product name and purchase date
    SELECT name, purchase_date::DATE INTO product_name, purchase_date
    FROM receipt_items
    WHERE id = NEW.id;
    
    -- Calculate the original and corrected days to expiry
    original_days := (OLD.estimated_expiry_date::DATE - purchase_date);
    corrected_days := (NEW.estimated_expiry_date::DATE - purchase_date);
    
    -- Find a matching product
    SELECT id INTO matching_product
    FROM food_products
    WHERE name ILIKE '%' || product_name || '%'
    ORDER BY confidence DESC
    LIMIT 1;
    
    -- If we found a matching product, update it
    IF matching_product IS NOT NULL THEN
      -- Update with a weighted average to learn gradually
      UPDATE food_products
      SET days_to_expiry = ROUND((days_to_expiry * 0.7) + (corrected_days * 0.3)),
          confidence = LEAST(1.0, confidence + 0.05)
      WHERE id = matching_product;
    ELSE
      -- Create a new product entry
      INSERT INTO food_products (
        id, name, category, days_to_expiry, storage_type, lidl_specific, confidence
      ) VALUES (
        gen_random_uuid(),
        product_name,
        CASE
          WHEN product_name ILIKE '%milk%' THEN 'milk'
          WHEN product_name ILIKE '%yogurt%' OR product_name ILIKE '%yoghurt%' THEN 'yogurt'
          WHEN product_name ILIKE '%cheese%' THEN 
            CASE WHEN product_name ILIKE '%cream%' THEN 'cheese-soft' ELSE 'cheese-hard' END
          WHEN product_name ILIKE '%bread%' OR product_name ILIKE '%roll%' THEN 'bread-packaged'
          WHEN product_name ILIKE '%hazelnut%' OR product_name ILIKE '%hazelnuts%' THEN 'nuts'
          WHEN product_name ILIKE '%chocolate%' THEN 'chocolate'
          ELSE 'default'
        END,
        corrected_days,
        CASE
          WHEN product_name ILIKE '%frozen%' OR corrected_days > 60 THEN 'frozen'
          WHEN product_name ILIKE '%milk%' OR 
               product_name ILIKE '%yogurt%' OR 
               product_name ILIKE '%yoghurt%' OR
               product_name ILIKE '%cheese%' OR
               product_name ILIKE '%meat%' OR
               product_name ILIKE '%fish%' OR
               product_name ILIKE '%fresh%' THEN 'refrigerated'
          ELSE 'room-temperature'
        END,
        TRUE, -- Assume LIDL specific since we're focusing on LIDL
        0.8   -- Start with reasonable confidence
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically handle expiry corrections
CREATE TRIGGER handle_expiry_correction
AFTER UPDATE OF estimated_expiry_date ON receipt_items
FOR EACH ROW
WHEN (NEW.user_corrected_expiry = TRUE)
EXECUTE FUNCTION handle_expiry_correction();

-- Insert specific products for hazelnuts and chocolate with correct expiry dates
INSERT INTO food_products (
  id, name, category, days_to_expiry, storage_type, lidl_specific, confidence, last_updated, created_at
) VALUES 
  (gen_random_uuid(), 'Roasted hazelnuts', 'nuts', 90, 'room-temperature', TRUE, 0.95, NOW(), NOW()),
  (gen_random_uuid(), 'Hazelnuts', 'nuts', 90, 'room-temperature', TRUE, 0.95, NOW(), NOW()),
  (gen_random_uuid(), 'Whole Hazelnut Milk Chocolate', 'chocolate', 180, 'room-temperature', TRUE, 0.95, NOW(), NOW()),
  (gen_random_uuid(), 'Milk Chocolate', 'chocolate', 180, 'room-temperature', TRUE, 0.95, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Update any existing items in receipt_items that match these patterns
UPDATE receipt_items
SET estimated_expiry_date = (purchase_date::DATE + INTERVAL '90 days')
WHERE name ILIKE '%hazelnut%' OR name ILIKE '%hazelnuts%';

UPDATE receipt_items
SET estimated_expiry_date = (purchase_date::DATE + INTERVAL '180 days')
WHERE name ILIKE '%chocolate%'; 