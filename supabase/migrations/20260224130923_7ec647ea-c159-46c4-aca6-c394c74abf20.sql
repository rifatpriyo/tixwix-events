
INSERT INTO public.promo_codes (code, discount_type, discount_value, min_purchase, max_discount, applicable_to, valid_from, valid_until, is_active)
VALUES
  ('LIKHAN', 'percentage', 90, 0, NULL, ARRAY['movie','concert'], now(), now() + interval '1 year', true),
  ('PRIYO', 'percentage', 90, 0, NULL, ARRAY['movie','concert'], now(), now() + interval '1 year', true);
