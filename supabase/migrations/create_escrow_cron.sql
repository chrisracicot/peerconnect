-- Run this script in the Supabase SQL Editor to automate Escrow Release after 21 days
-- This utilizes the built in Postgres pg_cron extension

-- 1. Enable pg_cron (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Create the escrow auto-release function
CREATE OR REPLACE FUNCTION release_expired_escrow()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE bookings
  SET payment_status = 'released'
  WHERE payment_status = 'escrow'
    -- Date + 21 days implies it's older than 3 weeks since the meetup date
    AND date < (now() - interval '21 days');
END;
$$;

-- 3. Schedule the function to run daily at midnight
SELECT cron.schedule(
  'auto-release-escrows',
  '0 0 * * *',
  $$ SELECT release_expired_escrow() $$
);
