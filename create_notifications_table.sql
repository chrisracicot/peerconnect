-- SQL Script to create the missing notifications table
-- This is required to fix the message sending bug where `createNotification` fails silently.
-- Please run this directly in your Supabase Dashboard SQL Editor!

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  content text NOT NULL,
  data jsonb,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications." 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

-- Anyone can create notifications (since one user taking an action triggers a notification for another user)
CREATE POLICY "Anyone can create notifications." 
  ON public.notifications FOR INSERT 
  WITH CHECK (true);

-- Users can only mark their own notifications as read
CREATE POLICY "Users can update their own notifications." 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);
