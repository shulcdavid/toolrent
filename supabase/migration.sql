-- ============================================================
-- Rente – run this once in Supabase SQL editor
-- ============================================================

-- 0. Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public) VALUES ('listings', 'listings', true)
  ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read listing images" ON storage.objects;
CREATE POLICY "Public read listing images" ON storage.objects FOR SELECT USING (bucket_id = 'listings');

DROP POLICY IF EXISTS "Auth upload listing images" ON storage.objects;
CREATE POLICY "Auth upload listing images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listings' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth delete own listing images" ON storage.objects;
CREATE POLICY "Auth delete own listing images" ON storage.objects FOR DELETE USING (bucket_id = 'listings' AND auth.uid()::text = (storage.foldername(name))[1]);

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
