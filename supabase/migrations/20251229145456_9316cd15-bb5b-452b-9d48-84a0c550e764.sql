-- Fix WLV promo code: set valid_from to now and remove max_discount
UPDATE promo_codes 
SET valid_from = '2025-01-01 00:00:00+00',
    max_discount = NULL
WHERE code = 'WLV';