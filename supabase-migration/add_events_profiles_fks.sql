-- =====================================================
-- Add Foreign Keys from events to profiles
-- =====================================================
-- Run this if you already have events and event_attendees tables
-- but need to add the FK relationships to profiles for Supabase joins
-- =====================================================

-- Add FK from events.creado_por to profiles.id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'events'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    -- Drop existing constraint if it exists with a different name
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_schema = 'public' 
      AND table_name = 'events'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%creado_por%profiles%'
    ) THEN
      -- Constraint already exists, skip
      RAISE NOTICE 'FK from events.creado_por to profiles.id already exists';
    ELSE
      ALTER TABLE public.events 
      ADD CONSTRAINT events_creado_por_profiles_fkey 
      FOREIGN KEY (creado_por) REFERENCES public.profiles(id) ON DELETE CASCADE;
      RAISE NOTICE 'Added FK from events.creado_por to profiles.id';
    END IF;
  ELSE
    RAISE NOTICE 'Tables events or profiles do not exist';
  END IF;
END $$;

-- Add FK from event_attendees.user_id to profiles.id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'event_attendees'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    -- Drop existing constraint if it exists with a different name
    IF EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_schema = 'public' 
      AND table_name = 'event_attendees'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%user_id%profiles%'
    ) THEN
      -- Constraint already exists, skip
      RAISE NOTICE 'FK from event_attendees.user_id to profiles.id already exists';
    ELSE
      ALTER TABLE public.event_attendees 
      ADD CONSTRAINT event_attendees_user_id_profiles_fkey 
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
      RAISE NOTICE 'Added FK from event_attendees.user_id to profiles.id';
    END IF;
  ELSE
    RAISE NOTICE 'Tables event_attendees or profiles do not exist';
  END IF;
END $$;

-- Create missing profiles for existing users before adding FK
-- This prevents FK constraint violations
INSERT INTO public.profiles (id, full_name, email, updated_at)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.email,
    'Usuario'
  ) AS full_name,
  au.email,
  NOW() AS updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

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
  AND (tc.table_name = 'events' OR tc.table_name = 'event_attendees')
  AND ccu.table_name = 'profiles'
ORDER BY tc.table_name, tc.constraint_name;
