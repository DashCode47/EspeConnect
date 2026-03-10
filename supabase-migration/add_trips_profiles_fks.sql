-- =====================================================
-- Add Foreign Keys from trips tables to profiles
-- =====================================================
-- Run this if you already have trips, trip_requests, and trip_ratings tables
-- but need to add the FK relationships to profiles for Supabase joins
-- =====================================================

-- Add FK from trips.driver_id to profiles.id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'trips'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_schema = 'public' 
      AND constraint_name = 'trips_driver_id_profiles_fkey'
    ) THEN
      ALTER TABLE public.trips 
      ADD CONSTRAINT trips_driver_id_profiles_fkey 
      FOREIGN KEY (driver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
      RAISE NOTICE 'Added FK from trips.driver_id to profiles.id';
    ELSE
      RAISE NOTICE 'FK from trips.driver_id to profiles.id already exists';
    END IF;
  ELSE
    RAISE NOTICE 'Tables trips or profiles do not exist';
  END IF;
END $$;

-- Add FK from trip_requests.passenger_id to profiles.id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'trip_requests'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_schema = 'public' 
      AND constraint_name = 'trip_requests_passenger_id_profiles_fkey'
    ) THEN
      ALTER TABLE public.trip_requests 
      ADD CONSTRAINT trip_requests_passenger_id_profiles_fkey 
      FOREIGN KEY (passenger_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
      RAISE NOTICE 'Added FK from trip_requests.passenger_id to profiles.id';
    ELSE
      RAISE NOTICE 'FK from trip_requests.passenger_id to profiles.id already exists';
    END IF;
  ELSE
    RAISE NOTICE 'Tables trip_requests or profiles do not exist';
  END IF;
END $$;

-- Add FK from trip_ratings.rater_id to profiles.id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'trip_ratings'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_schema = 'public' 
      AND constraint_name = 'trip_ratings_rater_id_profiles_fkey'
    ) THEN
      ALTER TABLE public.trip_ratings 
      ADD CONSTRAINT trip_ratings_rater_id_profiles_fkey 
      FOREIGN KEY (rater_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
      RAISE NOTICE 'Added FK from trip_ratings.rater_id to profiles.id';
    ELSE
      RAISE NOTICE 'FK from trip_ratings.rater_id to profiles.id already exists';
    END IF;
  ELSE
    RAISE NOTICE 'Tables trip_ratings or profiles do not exist';
  END IF;
END $$;

-- Add FK from trip_ratings.driver_id to profiles.id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'trip_ratings'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_schema = 'public' 
      AND constraint_name = 'trip_ratings_driver_id_profiles_fkey'
    ) THEN
      ALTER TABLE public.trip_ratings 
      ADD CONSTRAINT trip_ratings_driver_id_profiles_fkey 
      FOREIGN KEY (driver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
      RAISE NOTICE 'Added FK from trip_ratings.driver_id to profiles.id';
    ELSE
      RAISE NOTICE 'FK from trip_ratings.driver_id to profiles.id already exists';
    END IF;
  ELSE
    RAISE NOTICE 'Tables trip_ratings or profiles do not exist';
  END IF;
END $$;

-- Verify the constraints were created
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND (tc.table_name IN ('trips', 'trip_requests', 'trip_ratings'))
  AND ccu.table_name = 'profiles'
ORDER BY tc.table_name, tc.constraint_name;
