
-- Update all movie dates to 2030
UPDATE public.movies
SET release_date = release_date + interval '4 years',
    end_date = CASE WHEN end_date IS NOT NULL THEN end_date + interval '4 years' ELSE NULL END,
    status = 'now_showing';

-- Update all concert dates to 2030
UPDATE public.concerts
SET date = date + interval '4 years',
    status = 'upcoming';

-- Update all showtime dates to 2030
UPDATE public.showtimes
SET start_time = start_time + interval '4 years',
    end_time = end_time + interval '4 years';

-- Update all MLS match dates to 2030
UPDATE public.mls_matches
SET match_date = match_date + interval '4 years',
    status = 'upcoming';

-- Update promo code validity to 2030+
UPDATE public.promo_codes
SET valid_until = GREATEST(valid_until, '2031-01-01'::timestamptz);
