-- Supabase Setup Instructions for Avatar Storage and Push Tokens

-- 1. Create a Storage Bucket for Avatars:
-- In the Supabase Dashboard, go to Storage > New Bucket.
-- Name it "avatars" and make sure to uncheck "Restrict Access" so it is Public.

-- 2. Add push_token column to profiles table:
-- Run this in the SQL Editor:
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token text;

-- 3. You may need to create RLS policies for the "avatars" bucket allowing uploads:
-- Run this in the SQL Editor (adjust assuming you want authenticated users to upload):
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

CREATE POLICY "Users can upload their own avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );

-- 4. Create Mock Transactions Table for Pseudo Payments
CREATE TABLE IF NOT EXISTS transactions (
  id text PRIMARY KEY,
  sender_id uuid REFERENCES auth.users(id),
  receiver_id uuid REFERENCES auth.users(id),
  amount numeric NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  reference_id text
);

-- RLS for the transactions table:
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING ( auth.uid() = sender_id OR auth.uid() = receiver_id );

CREATE POLICY "Users can insert transactions they authored"
  ON transactions FOR INSERT
  WITH CHECK ( auth.uid() = sender_id );
