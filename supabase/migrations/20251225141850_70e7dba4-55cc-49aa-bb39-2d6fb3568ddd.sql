-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'staff')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create halls/venues table
CREATE TABLE public.halls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  hall_type TEXT NOT NULL CHECK (hall_type IN ('cinema', 'concert', 'convention')),
  description TEXT,
  image_url TEXT,
  amenities TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create movies table
CREATE TABLE public.movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  trailer_url TEXT,
  genre TEXT[] NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 10),
  release_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'coming_soon' CHECK (status IN ('now_showing', 'coming_soon', 'ended')),
  language TEXT DEFAULT 'English',
  director TEXT,
  cast_members TEXT[],
  age_rating TEXT CHECK (age_rating IN ('G', 'PG', 'PG-13', 'R', 'NC-17')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create concerts table
CREATE TABLE public.concerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue_id UUID REFERENCES public.halls(id) ON DELETE SET NULL,
  venue_name TEXT NOT NULL,
  price_min DECIMAL(10,2) NOT NULL,
  price_max DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'on_sale', 'sold_out', 'cancelled', 'completed')),
  total_tickets INTEGER NOT NULL,
  available_tickets INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create showtimes table for movies
CREATE TABLE public.showtimes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE NOT NULL,
  hall_id UUID REFERENCES public.halls(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  format TEXT DEFAULT '2D' CHECK (format IN ('2D', '3D', 'IMAX', '4DX', 'Dolby')),
  available_seats INTEGER NOT NULL,
  total_seats INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create seats table
CREATE TABLE public.seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hall_id UUID REFERENCES public.halls(id) ON DELETE CASCADE NOT NULL,
  row_label TEXT NOT NULL,
  seat_number INTEGER NOT NULL,
  seat_type TEXT DEFAULT 'standard' CHECK (seat_type IN ('standard', 'premium', 'vip', 'wheelchair')),
  price_multiplier DECIMAL(3,2) DEFAULT 1.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(hall_id, row_label, seat_number)
);

-- Create concert sections for pricing tiers
CREATE TABLE public.concert_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concert_id UUID REFERENCES public.concerts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total_tickets INTEGER NOT NULL,
  available_tickets INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  booking_type TEXT NOT NULL CHECK (booking_type IN ('movie', 'concert')),
  showtime_id UUID REFERENCES public.showtimes(id) ON DELETE SET NULL,
  concert_id UUID REFERENCES public.concerts(id) ON DELETE SET NULL,
  concert_section_id UUID REFERENCES public.concert_sections(id) ON DELETE SET NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  final_amount DECIMAL(10,2) NOT NULL,
  promo_code TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'refunded')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create booking items for individual seats/tickets
CREATE TABLE public.booking_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  seat_id UUID REFERENCES public.seats(id) ON DELETE SET NULL,
  ticket_type TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  review_type TEXT NOT NULL CHECK (review_type IN ('movie', 'concert')),
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  concert_id UUID REFERENCES public.concerts(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create promo codes table
CREATE TABLE public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2) DEFAULT 0,
  max_discount DECIMAL(10,2),
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  applicable_to TEXT[] DEFAULT ARRAY['movie', 'concert'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showtimes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concert_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read policies for content
CREATE POLICY "Anyone can view halls" ON public.halls FOR SELECT USING (true);
CREATE POLICY "Anyone can view movies" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Anyone can view concerts" ON public.concerts FOR SELECT USING (true);
CREATE POLICY "Anyone can view showtimes" ON public.showtimes FOR SELECT USING (true);
CREATE POLICY "Anyone can view seats" ON public.seats FOR SELECT USING (true);
CREATE POLICY "Anyone can view concert sections" ON public.concert_sections FOR SELECT USING (true);
CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Anyone can view active promo codes" ON public.promo_codes FOR SELECT USING (is_active = true);

-- Booking policies
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

-- Booking items policies
CREATE POLICY "Users can view their own booking items" ON public.booking_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = booking_items.booking_id AND bookings.user_id = auth.uid()));
CREATE POLICY "Users can create booking items for their bookings" ON public.booking_items FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.bookings WHERE bookings.id = booking_items.booking_id AND bookings.user_id = auth.uid()));

-- Review policies
CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_halls_updated_at BEFORE UPDATE ON public.halls FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_movies_updated_at BEFORE UPDATE ON public.movies FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_concerts_updated_at BEFORE UPDATE ON public.concerts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_showtimes_updated_at BEFORE UPDATE ON public.showtimes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for performance
CREATE INDEX idx_movies_status ON public.movies(status);
CREATE INDEX idx_movies_release_date ON public.movies(release_date);
CREATE INDEX idx_concerts_date ON public.concerts(date);
CREATE INDEX idx_concerts_status ON public.concerts(status);
CREATE INDEX idx_showtimes_movie_id ON public.showtimes(movie_id);
CREATE INDEX idx_showtimes_start_time ON public.showtimes(start_time);
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_reviews_movie_id ON public.reviews(movie_id);
CREATE INDEX idx_reviews_concert_id ON public.reviews(concert_id);