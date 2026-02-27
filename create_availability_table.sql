-- SQL Script to create the availability table for Phase 7
-- Run this directly in your Supabase Dashboard SQL Editor

CREATE TABLE IF NOT EXISTS public.availability (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    day_of_week text NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time text NOT NULL, -- Format: HH:MM
    end_time text NOT NULL,   -- Format: HH:MM
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

-- Users can manage their own availability
CREATE POLICY "Users can manage their availability" 
  ON public.availability FOR ALL 
  USING (auth.uid() = user_id);

-- Anyone can view a user's availability
CREATE POLICY "Anyone can view availability" 
  ON public.availability FOR SELECT 
  USING (true);
