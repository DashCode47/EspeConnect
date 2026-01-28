-- =====================================================
-- Trips tables (Supabase) + setup
-- =====================================================
-- Use this if your project uses public.trips (snake_case)
-- with driver_id referencing auth.users / profiles.
-- Run in Supabase SQL Editor.
-- =====================================================

-- 1) Create trips table (skip if you already have it)
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
  price NUMERIC(10,2),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FULL', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.trips IS 'Viajes compartidos (carpooling)';

-- Add foreign key to profiles table for Supabase joins
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_schema = 'public' 
      AND constraint_name = 'trips_driver_id_profiles_fkey'
    ) THEN
      ALTER TABLE public.trips 
      ADD CONSTRAINT trips_driver_id_profiles_fkey 
      FOREIGN KEY (driver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- 2) Create trip_requests table
CREATE TABLE IF NOT EXISTS public.trip_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, passenger_id)
);

-- Add foreign key to profiles table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_schema = 'public' 
      AND constraint_name = 'trip_requests_passenger_id_profiles_fkey'
    ) THEN
      ALTER TABLE public.trip_requests 
      ADD CONSTRAINT trip_requests_passenger_id_profiles_fkey 
      FOREIGN KEY (passenger_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS trip_requests_trip_id_idx ON public.trip_requests(trip_id);
CREATE INDEX IF NOT EXISTS trip_requests_passenger_id_idx ON public.trip_requests(passenger_id);
CREATE INDEX IF NOT EXISTS trip_requests_status_idx ON public.trip_requests(status);

-- 3) Create trip_ratings table
CREATE TABLE IF NOT EXISTS public.trip_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trip_id, rater_id)
);

-- Add foreign keys to profiles table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_schema = 'public' 
      AND constraint_name = 'trip_ratings_rater_id_profiles_fkey'
    ) THEN
      ALTER TABLE public.trip_ratings 
      ADD CONSTRAINT trip_ratings_rater_id_profiles_fkey 
      FOREIGN KEY (rater_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_schema = 'public' 
      AND constraint_name = 'trip_ratings_driver_id_profiles_fkey'
    ) THEN
      ALTER TABLE public.trip_ratings 
      ADD CONSTRAINT trip_ratings_driver_id_profiles_fkey 
      FOREIGN KEY (driver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS trip_ratings_trip_id_idx ON public.trip_ratings(trip_id);
CREATE INDEX IF NOT EXISTS trip_ratings_driver_id_idx ON public.trip_ratings(driver_id);
CREATE INDEX IF NOT EXISTS trips_driver_id_idx ON public.trips(driver_id);
CREATE INDEX IF NOT EXISTS trips_status_idx ON public.trips(status);
CREATE INDEX IF NOT EXISTS trips_departure_time_idx ON public.trips(departure_time);

-- 4) Enable RLS
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trips
CREATE POLICY "Trips are readable by everyone"
  ON public.trips FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create trips"
  ON public.trips FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Drivers can update own trips"
  ON public.trips FOR UPDATE
  TO authenticated
  USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can delete own trips"
  ON public.trips FOR DELETE
  TO authenticated
  USING (auth.uid() = driver_id);

-- RLS Policies for trip_requests
CREATE POLICY "Users can view requests for their trips"
  ON public.trip_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_requests.trip_id
      AND trips.driver_id = auth.uid()
    )
    OR passenger_id = auth.uid()
  );

CREATE POLICY "Authenticated users can create trip requests"
  ON public.trip_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Drivers can update requests for their trips"
  ON public.trip_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_requests.trip_id
      AND trips.driver_id = auth.uid()
    )
  );

CREATE POLICY "Drivers can delete requests for their trips"
  ON public.trip_requests FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = trip_requests.trip_id
      AND trips.driver_id = auth.uid()
    )
  );

-- RLS Policies for trip_ratings
CREATE POLICY "Ratings are readable by everyone"
  ON public.trip_ratings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create ratings"
  ON public.trip_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = rater_id);

CREATE POLICY "Users can update own ratings"
  ON public.trip_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = rater_id);

CREATE POLICY "Users can delete own ratings"
  ON public.trip_ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = rater_id);
