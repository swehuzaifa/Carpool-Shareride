-- ============================================
-- CARPOOL-SHARERIDE: Combined Database Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- =====================
-- 1. PROFILES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('rider', 'driver', 'both')) DEFAULT 'rider',
  rating_avg NUMERIC(3,2) DEFAULT 0.00,
  total_rides INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view any profile"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================
-- 2. RIDES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  origin_address TEXT NOT NULL,
  origin_lat DOUBLE PRECISION NOT NULL,
  origin_lng DOUBLE PRECISION NOT NULL,
  destination_address TEXT NOT NULL,
  destination_lat DOUBLE PRECISION NOT NULL,
  destination_lng DOUBLE PRECISION NOT NULL,
  waypoints JSONB DEFAULT '[]'::jsonb,
  departure_time TIMESTAMPTZ NOT NULL,
  estimated_duration INTEGER,
  total_seats INTEGER NOT NULL CHECK (total_seats > 0),
  available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
  price_per_seat NUMERIC(10,2) NOT NULL,
  vehicle_info JSONB DEFAULT '{}'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  status TEXT CHECK (status IN ('active', 'arrived', 'ongoing', 'completed', 'cancelled')) DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rides_departure ON public.rides(departure_time);
CREATE INDEX IF NOT EXISTS idx_rides_status ON public.rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_driver ON public.rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_active_departure ON public.rides(status, departure_time) WHERE status = 'active';

ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active rides"
  ON public.rides FOR SELECT USING (true);

CREATE POLICY "Drivers can create rides"
  ON public.rides FOR INSERT WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update own rides"
  ON public.rides FOR UPDATE USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can delete own rides"
  ON public.rides FOR DELETE USING (auth.uid() = driver_id);

-- =====================
-- 3. BOOKINGS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  rider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  seats_booked INTEGER NOT NULL DEFAULT 1,
  agreed_price NUMERIC(10,2) NOT NULL,
  pickup_address TEXT,
  pickup_lat DOUBLE PRECISION,
  pickup_lng DOUBLE PRECISION,
  dropoff_address TEXT,
  dropoff_lat DOUBLE PRECISION,
  dropoff_lng DOUBLE PRECISION,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'rider_checked_in', 'confirmed_onboard', 'completed', 'cancelled')) DEFAULT 'pending',
  driver_confirmed BOOLEAN DEFAULT FALSE,
  rider_confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_ride ON public.bookings(ride_id);
CREATE INDEX IF NOT EXISTS idx_bookings_rider ON public.bookings(rider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Riders can view own bookings"
  ON public.bookings FOR SELECT
  USING (
    auth.uid() = rider_id
    OR auth.uid() IN (SELECT driver_id FROM public.rides WHERE id = ride_id)
  );

CREATE POLICY "Riders can create bookings"
  ON public.bookings FOR INSERT WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "Involved users can update bookings"
  ON public.bookings FOR UPDATE
  USING (
    auth.uid() = rider_id
    OR auth.uid() IN (SELECT driver_id FROM public.rides WHERE id = ride_id)
  );

-- =====================
-- 4. OFFERS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  rider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  offered_price NUMERIC(10,2) NOT NULL,
  counter_price NUMERIC(10,2),
  message TEXT,
  status TEXT CHECK (status IN ('pending', 'countered', 'accepted', 'rejected', 'expired')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_offers_ride ON public.offers(ride_id);
CREATE INDEX IF NOT EXISTS idx_offers_rider ON public.offers(rider_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Involved users can view offers"
  ON public.offers FOR SELECT
  USING (
    auth.uid() = rider_id
    OR auth.uid() IN (SELECT driver_id FROM public.rides WHERE id = ride_id)
  );

CREATE POLICY "Riders can create offers"
  ON public.offers FOR INSERT WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "Involved users can update offers"
  ON public.offers FOR UPDATE
  USING (
    auth.uid() = rider_id
    OR auth.uid() IN (SELECT driver_id FROM public.rides WHERE id = ride_id)
  );

-- =====================
-- 5. RATINGS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES public.rides(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ride_id, from_user_id, to_user_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_to_user ON public.ratings(to_user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_ride ON public.ratings(ride_id);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ratings"
  ON public.ratings FOR SELECT USING (true);

CREATE POLICY "Users can create ratings"
  ON public.ratings FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- =====================
-- 6. NOTIFICATIONS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
