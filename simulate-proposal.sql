DO $$
DECLARE
  bob_id uuid;
  chris_id uuid;
  proposal_payload text;
BEGIN
  -- 1. Get Bob Learner's ID
  SELECT id INTO bob_id FROM auth.users WHERE email = 'bob@peerconnect.com' LIMIT 1;
  
  -- 2. Get Chris's ID
  SELECT id INTO chris_id FROM public.profiles WHERE full_name ILIKE '%Chris%' LIMIT 1;

  IF bob_id IS NULL THEN
    RAISE EXCEPTION 'Could not find Bob Learner.';
  END IF;

  IF chris_id IS NULL THEN
    RAISE EXCEPTION 'Could not find a user named Chris.';
  END IF;

  -- 3. Prepare the proposal payload
  proposal_payload := '{"title": "Software Architecture Review", "price": 45.00, "location": "Online via Zoom", "date": "' || to_char(now() + interval '2 days', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') || '"}';
  
  -- 4. Insert the message
  INSERT INTO public.messages (sender_id, receiver_id, content, is_read)
  VALUES (bob_id, chris_id, '[PROPOSAL]' || proposal_payload, false);

END $$;
