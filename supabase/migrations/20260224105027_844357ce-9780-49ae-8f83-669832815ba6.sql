
-- Delete existing stadium sections
DELETE FROM stadium_sections;

-- Re-insert with Camp Nou-style sections for each match
DO $$
DECLARE
  match_rec RECORD;
BEGIN
  FOR match_rec IN SELECT id FROM public.mls_matches LOOP
    INSERT INTO public.stadium_sections (match_id, name, section_label, tier, price, total_seats, available_seats, color, position_x, position_y, position_z) VALUES
    -- VIP Longside (red) - closest to pitch, long sides
    (match_rec.id, 'VIP Longside West', 'VIP-LW', 'vip_longside', 20000, 1500, 1450, '#ef4444', -2.8, 0.2, 0),
    (match_rec.id, 'VIP Longside East', 'VIP-LE', 'vip_longside', 20000, 1500, 1480, '#ef4444', 2.8, 0.2, 0),
    -- VIP Shortside (green) - closest to pitch, short sides (behind goals)
    (match_rec.id, 'VIP Shortside North', 'VIP-SN', 'vip_shortside', 15000, 800, 780, '#22c55e', 0, 0.2, -2.2),
    (match_rec.id, 'VIP Shortside South', 'VIP-SS', 'vip_shortside', 15000, 800, 790, '#22c55e', 0, 0.2, 2.2),
    -- Longside Premium (light blue) - 2nd tier long sides
    (match_rec.id, 'Longside Premium West', 'LP-W', 'longside_premium', 12000, 3000, 2900, '#38bdf8', -3.2, 0.5, 0.8),
    (match_rec.id, 'Longside Premium East', 'LP-E', 'longside_premium', 12000, 3000, 2950, '#38bdf8', 3.2, 0.5, -0.8),
    -- Longside Standard (orange) - mid tier long sides
    (match_rec.id, 'Longside Standard West', 'LS-W', 'longside_standard', 8000, 5000, 4800, '#f97316', -3.5, 0.8, -1.0),
    (match_rec.id, 'Longside Standard East', 'LS-E', 'longside_standard', 8000, 5000, 4850, '#f97316', 3.5, 0.8, 1.0),
    -- Shortside Standard (blue) - mid tier short sides
    (match_rec.id, 'Shortside Standard North', 'SS-N', 'shortside_standard', 6000, 4000, 3900, '#3b82f6', -1.2, 0.5, -2.8),
    (match_rec.id, 'Shortside Standard South', 'SS-S', 'shortside_standard', 6000, 4000, 3950, '#3b82f6', 1.2, 0.5, 2.8),
    -- Longside High (yellow) - upper tier long sides
    (match_rec.id, 'Longside High West', 'LH-W', 'longside_high', 5000, 6000, 5800, '#eab308', -3.8, 1.2, 0.5),
    (match_rec.id, 'Longside High East', 'LH-E', 'longside_high', 5000, 6000, 5900, '#eab308', 3.8, 1.2, -0.5),
    -- Shortside High (pink/magenta) - upper tier short sides
    (match_rec.id, 'Shortside High North', 'SH-N', 'shortside_high', 3500, 5000, 4900, '#ec4899', -1.5, 1.0, -3.2),
    (match_rec.id, 'Shortside High South', 'SH-S', 'shortside_high', 3500, 5000, 4950, '#ec4899', 1.5, 1.0, 3.2);
  END LOOP;
END $$;
