-- =====================================================
-- Insert 2 sample trips for testing
-- =====================================================
-- Run this after creating the trips table
-- Uses the provided user ID as driver_id
-- =====================================================

-- Insert 2 sample trips
INSERT INTO public.trips (
  driver_id,
  origin,
  destination,
  departure_time,
  available_seats,
  price,
  notes,
  status
)
VALUES
  (
    'e64f1664-ae31-4f70-95ea-adfd37ae85ed'::uuid,
    'Centro de Quito',
    'Campus ESPE - Sangolquí',
    (NOW() + INTERVAL '2 days' + INTERVAL '7 hours')::timestamptz, -- 2 días desde ahora a las 7:00 AM
    3,
    2.50,
    'Salida puntual. Parada en el Centro Comercial Quicentro Norte si alguien lo necesita.',
    'ACTIVE'
  ),
  (
    'e64f1664-ae31-4f70-95ea-adfd37ae85ed'::uuid,
    'Campus ESPE - Sangolquí',
    'Aeropuerto Mariscal Sucre',
    (NOW() + INTERVAL '5 days' + INTERVAL '14 hours')::timestamptz, -- 5 días desde ahora a las 2:00 PM
    2,
    5.00,
    'Viaje directo al aeropuerto. Ideal para vuelos de tarde/noche. Equipaje moderado.',
    'ACTIVE'
  );

-- Verify the trips were created
SELECT 
  id,
  driver_id,
  origin,
  destination,
  departure_time,
  available_seats,
  price,
  status,
  created_at
FROM public.trips
WHERE driver_id = 'e64f1664-ae31-4f70-95ea-adfd37ae85ed'::uuid
ORDER BY departure_time;
