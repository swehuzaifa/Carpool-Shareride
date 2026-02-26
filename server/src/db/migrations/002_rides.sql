-- ============================================
-- Migration 002: Rides Table
-- ============================================

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
  notes TEXT,
  status TEXT CHECK (status IN ('active', 'arrived', 'ongoing', 'completed', 'cancelled')) DEFAULT 'active',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rides_departure ON public.rides(departure_time);
CREATE INDEX IF NOT EXISTS idx_rides_status ON public.rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_driver ON public.rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_active_departure ON public.rides(status, departure_time) WHERE status = 'active';

-- Enable RLS
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active rides"
  ON public.rides FOR SELECT
  USING (true);

CREATE POLICY "Drivers can create rides"
  ON public.rides FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update own rides"
  ON public.rides FOR UPDATE
  USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can delete own rides"
  ON public.rides FOR DELETE
  USING (auth.uid() = driver_id);
