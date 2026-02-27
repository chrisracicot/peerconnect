-- SQL Script to create the reports table for the Flagging System (Phase 7)
-- Run this directly in your Supabase Dashboard SQL Editor

CREATE TABLE IF NOT EXISTS public.reports (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    reporter_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    target_type text NOT NULL CHECK (target_type IN ('message', 'request', 'user')),
    target_id text NOT NULL,
    reason text NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users can insert their own reports
CREATE POLICY "Users can create reports" 
  ON public.reports FOR INSERT 
  WITH CHECK (auth.uid() = reporter_id);

-- Admins can view all reports (We will assume admin check happens on the app layer for now, or you can add a strict RLS if you have an admin roles table)
CREATE POLICY "Admins can view reports" 
  ON public.reports FOR SELECT 
  USING (true);

-- Admins can update reports
CREATE POLICY "Admins can update reports" 
  ON public.reports FOR UPDATE 
  USING (true);
