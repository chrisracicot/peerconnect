-- SQL Script to alter the bookings table for Phase 6
-- Run this directly in your Supabase Dashboard SQL Editor to support Escrow payments

-- 1. Add extra metadata for the proposal lock-in
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS price numeric DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS location text;

-- 2. Link the booking to the actual request post
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS request_id bigint REFERENCES public.request(request_id) ON DELETE SET NULL;

-- 3. Add Escrow specific payment statuses
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending' 
CHECK (payment_status IN ('pending', 'escrow', 'released', 'disputed'));

-- 4. Update existing check constraint for 'status' if needed, or simply rely on the existing pending/confirmed/completed/canceled statuses
-- Note: Supabase UI will show these columns mapped to your application layer now.
