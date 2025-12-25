-- Insert the two promo codes the user requested
INSERT INTO promo_codes (code, discount_type, discount_value, description, valid_from, valid_until, is_active, applicable_to, min_purchase, max_discount, usage_limit)
VALUES 
  ('FIRSTORDER', 'percentage', 10.00, 'First order discount - 10% off', '2025-01-01 00:00:00+00', '2026-12-31 23:59:59+00', true, ARRAY['movie', 'concert'], 0, NULL, NULL),
  ('PRIYORCHOTOBHAI', 'percentage', 90.00, 'Special VIP discount - 90% off', '2025-01-01 00:00:00+00', '2026-12-31 23:59:59+00', true, ARRAY['movie', 'concert'], 0, NULL, NULL);