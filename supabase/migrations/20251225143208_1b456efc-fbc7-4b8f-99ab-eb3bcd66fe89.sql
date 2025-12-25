-- Insert Halls with correct hall_type values
INSERT INTO public.halls (id, name, location, hall_type, capacity, description, amenities, image_url) VALUES
('11111111-1111-1111-1111-111111111111', 'Hall A - Premium IMAX', 'Dhaka, Bangladesh', 'cinema', 200, 'Premium IMAX experience with Dolby Atmos sound', ARRAY['Dolby Atmos', 'Recliner Seats', 'Premium Sound', 'IMAX'], 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800'),
('22222222-2222-2222-2222-222222222222', 'Hall B - Standard', 'Dhaka, Bangladesh', 'cinema', 150, 'Standard cinema hall with great viewing experience', ARRAY['Digital Sound', 'Comfortable Seats'], 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800'),
('33333333-3333-3333-3333-333333333333', 'Hall C - VIP', 'Dhaka, Bangladesh', 'cinema', 80, 'Exclusive VIP experience with luxury amenities', ARRAY['Luxury Recliners', 'Personal Service', 'Gourmet Food', 'VIP'], 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800');

-- Insert Movies (Hollywood + Anime)
INSERT INTO public.movies (id, title, description, poster_url, trailer_url, genre, duration, rating, release_date, end_date, status, language, director, cast_members, age_rating) VALUES
('aaaa1111-1111-1111-1111-111111111111', 'Avatar: Fire and Ash', 'The third installment of James Cameron''s epic saga continues the story of Jake Sully and his family as they face new threats on Pandora.', 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400', 'https://youtube.com/watch?v=example1', ARRAY['Sci-Fi', 'Action', 'Adventure'], 180, 8.5, '2026-01-01', '2026-02-28', 'now_showing', 'English', 'James Cameron', ARRAY['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver'], 'PG-13'),
('aaaa2222-2222-2222-2222-222222222222', 'Mission: Impossible - Final Reckoning', 'Ethan Hunt faces his most dangerous mission yet as he confronts enemies from his past in an explosive finale.', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400', 'https://youtube.com/watch?v=example2', ARRAY['Action', 'Thriller', 'Adventure'], 165, 8.2, '2026-01-05', '2026-02-20', 'now_showing', 'English', 'Christopher McQuarrie', ARRAY['Tom Cruise', 'Rebecca Ferguson', 'Simon Pegg'], 'PG-13'),
('aaaa3333-3333-3333-3333-333333333333', 'Jurassic World: Rebirth', 'A new chapter in the Jurassic saga as scientists attempt to restore balance between humans and dinosaurs.', 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400', 'https://youtube.com/watch?v=example3', ARRAY['Action', 'Sci-Fi', 'Adventure'], 145, 7.8, '2026-01-08', '2026-02-25', 'now_showing', 'English', 'Gareth Edwards', ARRAY['Scarlett Johansson', 'Jonathan Bailey', 'Mahershala Ali'], 'PG-13'),
('aaaa4444-4444-4444-4444-444444444444', 'Gladiator II', 'The epic sequel follows a new hero rising in the Roman Empire, continuing the legacy of Maximus.', 'https://images.unsplash.com/photo-1533928298208-27ff66555d8d?w=400', 'https://youtube.com/watch?v=example4', ARRAY['Action', 'Drama', 'History'], 155, 8.0, '2026-01-03', '2026-02-18', 'now_showing', 'English', 'Ridley Scott', ARRAY['Paul Mescal', 'Denzel Washington', 'Pedro Pascal'], 'R'),
('aaaa5555-5555-5555-5555-555555555555', 'The Batman: Part II', 'Bruce Wayne continues his crusade against crime in Gotham, facing a new threat that challenges his beliefs.', 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400', 'https://youtube.com/watch?v=example5', ARRAY['Action', 'Crime', 'Drama'], 175, 8.7, '2026-01-10', '2026-03-01', 'now_showing', 'English', 'Matt Reeves', ARRAY['Robert Pattinson', 'Zoë Kravitz', 'Colin Farrell'], 'PG-13'),
('bbbb1111-1111-1111-1111-111111111111', 'Demon Slayer: Infinity Castle Arc - Part 1', 'Tanjiro and the Hashira face their ultimate battle against Muzan Kibutsuji in the Infinity Castle.', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400', 'https://youtube.com/watch?v=anime1', ARRAY['Anime', 'Action', 'Fantasy'], 130, 9.2, '2026-01-12', '2026-02-28', 'now_showing', 'Japanese', 'Haruo Sotozaki', ARRAY['Natsuki Hanae', 'Akari Kitō', 'Yoshitsugu Matsuoka'], 'PG-13'),
('bbbb2222-2222-2222-2222-222222222222', 'One Piece Film: Grand Line Chronicles', 'Luffy and the Straw Hat crew embark on their most epic adventure yet in this theatrical masterpiece.', 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=400', 'https://youtube.com/watch?v=anime2', ARRAY['Anime', 'Action', 'Adventure'], 140, 8.9, '2026-01-15', '2026-02-28', 'now_showing', 'Japanese', 'Tatsuya Nagamine', ARRAY['Mayumi Tanaka', 'Kazuya Nakai', 'Akemi Okamura'], 'PG-13');

-- Insert Seats with correct seat_type values (standard, premium, vip, wheelchair)
-- Hall A (Premium IMAX) - 10 rows, 20 seats each = 200 seats
INSERT INTO public.seats (hall_id, row_label, seat_number, seat_type, price_multiplier)
SELECT 
  '11111111-1111-1111-1111-111111111111',
  chr(64 + row_num),
  seat_num,
  CASE 
    WHEN row_num <= 3 THEN 'standard'
    WHEN row_num <= 7 THEN 'premium'
    ELSE 'vip'
  END,
  CASE 
    WHEN row_num <= 3 THEN 1.0
    WHEN row_num <= 7 THEN 1.3
    ELSE 1.6
  END
FROM generate_series(1, 10) AS row_num, generate_series(1, 20) AS seat_num;

-- Hall B (Standard) - 10 rows, 15 seats each = 150 seats
INSERT INTO public.seats (hall_id, row_label, seat_number, seat_type, price_multiplier)
SELECT 
  '22222222-2222-2222-2222-222222222222',
  chr(64 + row_num),
  seat_num,
  CASE 
    WHEN row_num <= 4 THEN 'standard'
    WHEN row_num <= 8 THEN 'premium'
    ELSE 'vip'
  END,
  CASE 
    WHEN row_num <= 4 THEN 1.0
    WHEN row_num <= 8 THEN 1.2
    ELSE 1.5
  END
FROM generate_series(1, 10) AS row_num, generate_series(1, 15) AS seat_num;

-- Hall C (VIP) - 8 rows, 10 seats each = 80 seats
INSERT INTO public.seats (hall_id, row_label, seat_number, seat_type, price_multiplier)
SELECT 
  '33333333-3333-3333-3333-333333333333',
  chr(64 + row_num),
  seat_num,
  CASE 
    WHEN row_num <= 4 THEN 'premium'
    ELSE 'vip'
  END,
  CASE 
    WHEN row_num <= 4 THEN 1.3
    ELSE 1.6
  END
FROM generate_series(1, 8) AS row_num, generate_series(1, 10) AS seat_num;

-- Insert Showtimes (Jan 1-20, 2026)
INSERT INTO public.showtimes (movie_id, hall_id, start_time, end_time, price, total_seats, available_seats, format)
SELECT 
  m.id,
  h.id,
  (DATE '2026-01-01' + (day_offset || ' days')::interval + (time_slot || ' hours')::interval)::timestamptz,
  (DATE '2026-01-01' + (day_offset || ' days')::interval + (time_slot || ' hours')::interval + (m.duration || ' minutes')::interval)::timestamptz,
  CASE 
    WHEN 'IMAX' = ANY(h.amenities) THEN 800.00
    WHEN 'VIP' = ANY(h.amenities) THEN 1200.00
    ELSE 500.00
  END,
  h.capacity,
  h.capacity,
  CASE 
    WHEN 'IMAX' = ANY(h.amenities) THEN 'IMAX'
    ELSE '2D'
  END
FROM public.movies m
CROSS JOIN public.halls h
CROSS JOIN generate_series(0, 19) AS day_offset
CROSS JOIN (VALUES (10), (14), (18), (21)) AS t(time_slot)
WHERE m.status = 'now_showing';

-- Insert Concerts
INSERT INTO public.concerts (id, title, artist, description, poster_url, date, venue_name, total_tickets, available_tickets, price_min, price_max, status) VALUES
('cccc1111-1111-1111-1111-111111111111', 'Coke Studio Night', 'Various Artists', 'An unforgettable night featuring the best of Coke Studio performances with live orchestra and top artists from Bangladesh and Pakistan. Experience the magic of fusion music under the stars.', 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', '2026-01-18 19:00:00+06', 'Dhaka Stadium', 5000, 5000, 1500.00, 10000.00, 'upcoming'),
('cccc2222-2222-2222-2222-222222222222', 'Legends of Bangladesh Rock Night', 'Warfaze, Shironamhin, Carnival & More', 'The biggest rock concert in Bangladesh featuring legendary bands Warfaze, Shironamhin, Carnival, Artcell, Black, and Nemesis. A celebration of Bangladeshi rock music spanning decades.', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', '2026-01-25 18:00:00+06', 'Army Stadium', 10000, 10000, 1000.00, 8000.00, 'upcoming');

-- Insert Concert Sections
INSERT INTO public.concert_sections (concert_id, name, price, total_tickets, available_tickets) VALUES
('cccc1111-1111-1111-1111-111111111111', 'General Standing', 1500.00, 2000, 2000),
('cccc1111-1111-1111-1111-111111111111', 'Silver Zone', 3000.00, 1500, 1500),
('cccc1111-1111-1111-1111-111111111111', 'Gold Zone', 5000.00, 1000, 1000),
('cccc1111-1111-1111-1111-111111111111', 'VIP Lounge', 10000.00, 500, 500),
('cccc2222-2222-2222-2222-222222222222', 'General Admission', 1000.00, 4000, 4000),
('cccc2222-2222-2222-2222-222222222222', 'Fan Zone', 2000.00, 3000, 3000),
('cccc2222-2222-2222-2222-222222222222', 'Premium Area', 4000.00, 2000, 2000),
('cccc2222-2222-2222-2222-222222222222', 'VVIP Experience', 8000.00, 1000, 1000);

-- Insert Promo Codes
INSERT INTO public.promo_codes (code, description, discount_type, discount_value, min_purchase, max_discount, valid_from, valid_until, usage_limit, applicable_to) VALUES
('WELCOME25', 'Welcome discount for new users', 'percentage', 25, 500, 500, '2026-01-01 00:00:00+06', '2026-12-31 23:59:59+06', 1000, ARRAY['movie', 'concert']),
('MOVIEFAN', 'Special discount for movie lovers', 'percentage', 15, 300, 300, '2026-01-01 00:00:00+06', '2026-03-31 23:59:59+06', 500, ARRAY['movie']),
('ROCKNIGHT', 'Special discount for Rock Night concert', 'fixed', 200, 1000, 200, '2026-01-01 00:00:00+06', '2026-01-25 18:00:00+06', 200, ARRAY['concert']);