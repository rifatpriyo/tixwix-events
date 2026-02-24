
-- Create MLS matches table
CREATE TABLE public.mls_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_logo_url TEXT,
  away_logo_url TEXT,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT NOT NULL DEFAULT 'Camp Nou Stadium',
  status TEXT DEFAULT 'upcoming',
  total_tickets INTEGER NOT NULL DEFAULT 60000,
  available_tickets INTEGER NOT NULL DEFAULT 60000,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.mls_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view matches" ON public.mls_matches FOR SELECT USING (true);

-- Create stadium sections table
CREATE TABLE public.stadium_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.mls_matches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  section_label TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'standard',
  price NUMERIC NOT NULL,
  total_seats INTEGER NOT NULL,
  available_seats INTEGER NOT NULL,
  color TEXT DEFAULT '#6366f1',
  position_x FLOAT DEFAULT 0,
  position_y FLOAT DEFAULT 0,
  position_z FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stadium_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stadium sections" ON public.stadium_sections FOR SELECT USING (true);

-- Insert sample MLS matches
INSERT INTO public.mls_matches (home_team, away_team, match_date, venue, status, total_tickets, available_tickets, description) VALUES
('Inter Miami CF', 'LA Galaxy', '2026-03-15 19:30:00+00', 'Camp Nou Stadium', 'upcoming', 60000, 58500, 'MLS Season opener - a blockbuster clash between two top teams!'),
('New York Red Bulls', 'Atlanta United', '2026-03-22 20:00:00+00', 'Camp Nou Stadium', 'upcoming', 60000, 59000, 'Eastern Conference showdown under the lights.'),
('Seattle Sounders', 'LAFC', '2026-04-05 18:00:00+00', 'Camp Nou Stadium', 'upcoming', 60000, 60000, 'Western Conference rivals go head to head.'),
('Columbus Crew', 'Cincinnati FC', '2026-04-12 17:00:00+00', 'Camp Nou Stadium', 'upcoming', 60000, 60000, 'Ohio derby - fierce local rivalry!');

-- Insert stadium sections for each match
DO $$
DECLARE
  match_rec RECORD;
BEGIN
  FOR match_rec IN SELECT id FROM public.mls_matches LOOP
    INSERT INTO public.stadium_sections (match_id, name, section_label, tier, price, total_seats, available_seats, color, position_x, position_y, position_z) VALUES
    (match_rec.id, 'VIP North', 'VIP-N', 'vip', 15000, 2000, 1950, '#a855f7', 0, 2, -4),
    (match_rec.id, 'VIP South', 'VIP-S', 'vip', 15000, 2000, 1980, '#a855f7', 0, 2, 4),
    (match_rec.id, 'Premium West', 'PREM-W', 'premium', 8000, 5000, 4800, '#f59e0b', -4, 1.5, 0),
    (match_rec.id, 'Premium East', 'PREM-E', 'premium', 8000, 5000, 4900, '#f59e0b', 4, 1.5, 0),
    (match_rec.id, 'Upper North', 'UP-N', 'standard', 3500, 8000, 7800, '#3b82f6', 0, 3, -5),
    (match_rec.id, 'Upper South', 'UP-S', 'standard', 3500, 8000, 7900, '#3b82f6', 0, 3, 5),
    (match_rec.id, 'Lower North', 'LW-N', 'standard', 5000, 6000, 5800, '#22c55e', 0, 0.5, -3),
    (match_rec.id, 'Lower South', 'LW-S', 'standard', 5000, 6000, 5900, '#22c55e', 0, 0.5, 3),
    (match_rec.id, 'Lower West', 'LW-W', 'standard', 5000, 5000, 4800, '#22c55e', -3, 0.5, 0),
    (match_rec.id, 'Lower East', 'LW-E', 'standard', 5000, 5000, 4900, '#22c55e', 3, 0.5, 0),
    (match_rec.id, 'General North-West', 'GEN-NW', 'economy', 2000, 4000, 3950, '#64748b', -3, 2.5, -3),
    (match_rec.id, 'General North-East', 'GEN-NE', 'economy', 2000, 4000, 3980, '#64748b', 3, 2.5, -3),
    (match_rec.id, 'General South-West', 'GEN-SW', 'economy', 2000, 4000, 3990, '#64748b', -3, 2.5, 3),
    (match_rec.id, 'General South-East', 'GEN-SE', 'economy', 2000, 4000, 4000, '#64748b', 3, 2.5, 3);
  END LOOP;
END $$;

-- Add trigger for updated_at
CREATE TRIGGER update_mls_matches_updated_at
BEFORE UPDATE ON public.mls_matches
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
