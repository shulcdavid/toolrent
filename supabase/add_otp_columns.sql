-- Migration: add phone OTP confirmation columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_pending text,
  ADD COLUMN IF NOT EXISTS phone_otp text,
  ADD COLUMN IF NOT EXISTS phone_otp_expires_at timestamptz;
