-- Fix expiry dates for hazelnuts and chocolate products
-- This script updates any existing items in the database with incorrect expiry dates

-- Update hazelnuts to have 90 days expiry
UPDATE receipt_items
SET estimated_expiry_date = (purchase_date::DATE + INTERVAL '90 days')
WHERE 
  (name ILIKE '%hazelnut%' OR name ILIKE '%hazelnuts%')
  AND (estimated_expiry_date::DATE - purchase_date::DATE) < 30;

-- Update chocolate to have 180 days expiry
UPDATE receipt_items
SET estimated_expiry_date = (purchase_date::DATE + INTERVAL '180 days')
WHERE 
  name ILIKE '%chocolate%'
  AND (estimated_expiry_date::DATE - purchase_date::DATE) < 30;

-- Make sure we have the correct products in the food_products table
INSERT INTO food_products (
  id, name, category, days_to_expiry, storage_type, lidl_specific, confidence, last_updated, created_at
) VALUES 
  (gen_random_uuid(), 'Roasted hazelnuts', 'nuts', 90, 'room-temperature', TRUE, 0.95, NOW(), NOW()),
  (gen_random_uuid(), 'Hazelnuts', 'nuts', 90, 'room-temperature', TRUE, 0.95, NOW(), NOW()),
  (gen_random_uuid(), 'Whole Hazelnut Milk Chocolate', 'chocolate', 180, 'room-temperature', TRUE, 0.95, NOW(), NOW()),
  (gen_random_uuid(), 'Milk Chocolate', 'chocolate', 180, 'room-temperature', TRUE, 0.95, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Update any existing products with incorrect expiry days
UPDATE food_products
SET days_to_expiry = 90, confidence = 0.95
WHERE 
  (name ILIKE '%hazelnut%' OR name ILIKE '%hazelnuts%' OR category = 'nuts')
  AND days_to_expiry < 30;

UPDATE food_products
SET days_to_expiry = 180, confidence = 0.95
WHERE 
  (name ILIKE '%chocolate%' OR category = 'chocolate')
  AND days_to_expiry < 30; 