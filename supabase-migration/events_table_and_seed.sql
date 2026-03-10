-- =====================================================
-- Events table (Supabase) + 3 sample events
-- =====================================================
-- Use this if your project uses public.events (snake_case)
-- with creado_por referencing auth.users / profiles.
-- Run in Supabase SQL Editor.
-- =====================================================

-- 1) Create events table (skip if you already have it)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('SOCIAL', 'ACADEMIC', 'PRIVATE', 'SPORTS', 'OTHER')),
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ,
  ubicacion TEXT NOT NULL,
  precio NUMERIC(10,2) DEFAULT 0,
  creado_por UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  imagen TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key to profiles table for Supabase joins
-- This allows the join profiles!creado_por(...) to work
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    -- Add FK constraint if profiles table exists and constraint doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_schema = 'public' 
      AND constraint_name = 'events_creado_por_profiles_fkey'
    ) THEN
      ALTER TABLE public.events 
      ADD CONSTRAINT events_creado_por_profiles_fkey 
      FOREIGN KEY (creado_por) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

COMMENT ON TABLE public.events IS 'Eventos de la app (Supabase)';

-- =====================================================
-- Trigger to auto-create profile when user signs up
-- =====================================================
-- This ensures every auth.users entry has a corresponding profiles entry
-- Run this if you don't already have a trigger for this
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email,
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile entry when a new user signs up';

-- 2) Create event_attendees table (skip if you already have it)
CREATE TABLE IF NOT EXISTS public.event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Add foreign key to profiles table for Supabase joins
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    -- Add FK constraint if profiles table exists and constraint doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_schema = 'public' 
      AND constraint_name = 'event_attendees_user_id_profiles_fkey'
    ) THEN
      ALTER TABLE public.event_attendees 
      ADD CONSTRAINT event_attendees_user_id_profiles_fkey 
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS event_attendees_event_id_idx ON public.event_attendees(event_id);
CREATE INDEX IF NOT EXISTS event_attendees_user_id_idx ON public.event_attendees(user_id);

-- 3) Enable RLS (optional)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can read events
CREATE POLICY "Events are readable by everyone"
  ON public.events FOR SELECT
  USING (true);

-- Policy: authenticated users can insert events
CREATE POLICY "Authenticated users can create events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creado_por);

-- Policy: creators can update/delete their events
CREATE POLICY "Creators can update own events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (auth.uid() = creado_por);

CREATE POLICY "Creators can delete own events"
  ON public.events FOR DELETE
  TO authenticated
  USING (auth.uid() = creado_por);

-- Policy: event_attendees readable by everyone
CREATE POLICY "Event attendees are readable"
  ON public.event_attendees FOR SELECT
  USING (true);

-- Policy: authenticated can insert/delete their attendance
CREATE POLICY "Users can register attendance"
  ON public.event_attendees FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel attendance"
  ON public.event_attendees FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 4) Insert 3 sample events (creado_por = first user in auth.users)
-- Run this only after you have at least one user in auth.users (e.g. after signup).
WITH first_user AS (
  SELECT id FROM auth.users ORDER BY created_at LIMIT 1
)
INSERT INTO public.events (
  nombre,
  descripcion,
  categoria,
  fecha_inicio,
  fecha_fin,
  ubicacion,
  precio,
  creado_por,
  imagen
)
SELECT v.nombre, v.descripcion, v.categoria, v.fecha_inicio, v.fecha_fin, v.ubicacion, v.precio, f.id, NULL
FROM first_user f
CROSS JOIN (VALUES
  (
    'Conferencia de Inteligencia Artificial',
    'Charla sobre aplicaciones de IA en la industria y casos de éxito. Incluye taller práctico.',
    'ACADEMIC',
    (NOW() + INTERVAL '7 days')::timestamptz,
    (NOW() + INTERVAL '7 days' + INTERVAL '3 hours')::timestamptz,
    'Auditorio Principal - Campus ESPE',
    0::numeric
  ),
  (
    'Torneo de Fútbol Intercarreras',
    'Inscripciones abiertas. Equipos de 11 jugadores. Premios para primer y segundo lugar.',
    'SPORTS',
    (NOW() + INTERVAL '14 days')::timestamptz,
    (NOW() + INTERVAL '14 days' + INTERVAL '6 hours')::timestamptz,
    'Cancha Deportiva - ESPE',
    5.00::numeric
  ),
  (
    'Noche de Networking y Emprendimiento',
    'Conecta con egresados y empresas. Pitch de proyectos y rueda de inversión.',
    'SOCIAL',
    (NOW() + INTERVAL '21 days')::timestamptz,
    (NOW() + INTERVAL '21 days' + INTERVAL '4 hours')::timestamptz,
    'Sala de Eventos - Edificio A',
    0::numeric
  )
) AS v(nombre, descripcion, categoria, fecha_inicio, fecha_fin, ubicacion, precio);

-- Alternative: if you prefer a fixed user UUID (replace YOUR-USER-UUID with a real auth.users.id):
-- INSERT INTO public.events (nombre, descripcion, categoria, fecha_inicio, fecha_fin, ubicacion, precio, creado_por)
-- VALUES
--   ('Conferencia de Inteligencia Artificial', 'Charla sobre IA en la industria.', 'ACADEMIC', NOW() + INTERVAL '7 days', NOW() + INTERVAL '7 days' + INTERVAL '3 hours', 'Auditorio Principal - Campus ESPE', 0, 'YOUR-USER-UUID'),
--   ('Torneo de Fútbol Intercarreras', 'Inscripciones abiertas. Equipos de 11.', 'SPORTS', NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '6 hours', 'Cancha Deportiva - ESPE', 5.00, 'YOUR-USER-UUID'),
--   ('Noche de Networking y Emprendimiento', 'Conecta con egresados y empresas.', 'SOCIAL', NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '4 hours', 'Sala de Eventos - Edificio A', 0, 'YOUR-USER-UUID');
