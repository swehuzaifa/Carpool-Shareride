-- ============================================
-- Migration 004: Offers (Bidding) Table
-- ============================================

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_offers_ride ON public.offers(ride_id);
CREATE INDEX IF NOT EXISTS idx_offers_rider ON public.offers(rider_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);

-- Enable RLS
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Involved users can view offers"
  ON public.offers FOR SELECT
  USING (
    auth.uid() = rider_id
    OR auth.uid() IN (SELECT driver_id FROM public.rides WHERE id = ride_id)
  );

CREATE POLICY "Riders can create offers"
  ON public.offers FOR INSERT
  WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "Involved users can update offers"
  ON public.offers FOR UPDATE
  USING (
    auth.uid() = rider_id
    OR auth.uid() IN (SELECT driver_id FROM public.rides WHERE id = ride_id)
  );
