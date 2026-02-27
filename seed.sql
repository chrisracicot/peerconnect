-- Peer Connect Seed Script
-- Update constraints in case the old schema was used before adding 'completed' 
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_status_check CHECK (status IN ('pending', 'confirmed', 'completed', 'canceled'));

-- This script safely injects mock users, courses, requests, messages, and reviews directly into your database.
-- Run this in your Supabase SQL Editor.

DO $$
DECLARE
  user1_id uuid := gen_random_uuid();
  user2_id uuid := gen_random_uuid();
  user3_id uuid := gen_random_uuid();
  user4_id uuid := gen_random_uuid();
  req1_id bigint;
  req2_id bigint;
  book1_id bigint;
  book2_id bigint;
BEGIN
  -- 1. Insert Mock Auth Users (Bypassing email confirmations)
  -- The password for all these mock accounts is 'password123'
  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES 
  (user1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alice@peerconnect.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Alice Expert"}', now(), now()),
  (user2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bob@peerconnect.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Bob Learner"}', now(), now()),
  (user3_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'charlie@peerconnect.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Charlie Tutor"}', now(), now()),
  (user4_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'diana@peerconnect.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "Diana Student"}', now(), now()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@peerconnect.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name": "System Admin"}', now(), now());

  -- (Note: The auth.users insert above automatically triggers `handle_new_user()` which creates rows in public.profiles)

  -- 2. Update Mock Profiles with Avatars and Verification
  UPDATE public.profiles SET avatar_url = 'https://i.pravatar.cc/150?u=alice', verified = true WHERE id = user1_id;
  UPDATE public.profiles SET avatar_url = 'https://i.pravatar.cc/150?u=bob', verified = false WHERE id = user2_id;
  UPDATE public.profiles SET avatar_url = 'https://i.pravatar.cc/150?u=charlie', verified = true WHERE id = user3_id;
  UPDATE public.profiles SET avatar_url = 'https://i.pravatar.cc/150?u=diana', verified = false WHERE id = user4_id;

  -- 3. Insert Mock Tutor Requests (from Students)
  INSERT INTO public.request (user_id, course_id, title, description, status)
  VALUES 
  (user2_id, 'ELEC 101', 'Need help with basic circuits', 'I am struggling with Kirchhoff laws for my upcoming midterm. Can anyone help?', 'pending'),
  (user4_id, 'CPRG303', 'Database normalization help', 'I need help understanding 3NF and BCNF for our assignment.', 'pending');

  INSERT INTO public.request (user_id, course_id, title, description, status, assigned_to)
  VALUES 
  (user2_id, 'SOFT 401', 'Looking for software eng tutor', 'Preparing for my final project on React Native.', 'booked', user1_id);

  -- 4. Insert Mock Bookings
  INSERT INTO public.bookings (requester_id, provider_id, title, date, status)
  VALUES 
  (user2_id, user1_id, 'React Native Tutoring Session', now() + interval '2 days', 'confirmed')
  RETURNING id INTO book1_id;
  
  INSERT INTO public.bookings (requester_id, provider_id, title, date, status)
  VALUES 
  (user4_id, user3_id, 'Past Session - Linear Algebra', now() - interval '5 days', 'completed')
  RETURNING id INTO book2_id;

  -- 5. Insert Mock Messages (Conversations)
  INSERT INTO public.messages (sender_id, receiver_id, content, is_read)
  VALUES 
  (user2_id, user1_id, 'Hi Alice, are we still good for the React Native session tomorrow?', true),
  (user1_id, user2_id, 'Yes Bob! I have the study materials ready for you.', false),
  (user4_id, user3_id, 'Thanks for the help last week Charlie!', true);

  -- 6. Insert Mock Reviews (For completed bookings)
  INSERT INTO public.reviews (reviewer_id, reviewee_id, booking_id, rating, comment)
  VALUES 
  (user4_id, user3_id, book2_id, 5, 'Charlie is an amazing tutor! Highly recommended.');

END $$;
