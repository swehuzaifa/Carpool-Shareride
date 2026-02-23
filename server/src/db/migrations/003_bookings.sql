-- ============================================
-- Migration 003: Bookings Table
-- ============================================

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_ride ON public.bookings(ride_id);
CREATE INDEX IF NOT EXISTS idx_bookings_rider ON public.bookings(rider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Riders can view own bookings"
  ON public.bookings FOR SELECT
  USING (
    auth.uid() = rider_id
    OR auth.uid() IN (SELECT driver_id FROM public.rides WHERE id = ride_id)
  );

CREATE POLICY "Riders can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "Involved users can update bookings"
  ON public.bookings FOR UPDATE
  USING (
    auth.uid() = rider_id
    OR auth.uid() IN (SELECT driver_id FROM public.rides WHERE id = ride_id)
  );
