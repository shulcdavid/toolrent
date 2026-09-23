-- ============================================================
-- Rente – run this once in Supabase SQL editor
-- ============================================================

-- 1. Add Stripe columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- 2. Add Stripe and fee columns to bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS tool_price NUMERIC(10,2);
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS service_fee NUMERIC(10,2);

-- 3. Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id        UUID NOT NULL REFERENCES public.bookings(id)  ON DELETE CASCADE,
  reviewer_id       UUID NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  reviewee_id       UUID NOT NULL REFERENCES public.profiles(id)  ON DELETE CASCADE,
  listing_id        UUID NOT NULL REFERENCES public.listings(id)  ON DELETE CASCADE,
  rating            INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment           TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id, reviewer_id)
);

-- 4. Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 5. Policies for reviews
CREATE POLICY IF NOT EXISTS "Reviews are viewable by everyone."
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert their own reviews."
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
