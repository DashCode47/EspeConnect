-- ============================================================================
-- LIMPIAR Y RECREAR PLANES DE PRUEBA
-- ============================================================================
-- Este script elimina todos los planes existentes y crea 5 nuevos de prueba
-- ============================================================================

DO $$
DECLARE
  user1_id UUID;
  user2_id UUID;
  user3_id UUID;
  user4_id UUID;
  user5_id UUID;
  plan1_id UUID;
  plan2_id UUID;
  plan3_id UUID;
  plan4_id UUID;
  plan5_id UUID;
BEGIN
  -- Paso 1: Limpiar datos existentes
  DELETE FROM plan_chat_messages;
  DELETE FROM plan_participants;
  DELETE FROM plans;

  RAISE NOTICE '✅ Datos antiguos eliminados';

  -- Paso 2: Obtener perfiles existentes
  SELECT id INTO user1_id FROM profiles LIMIT 1;

  IF user1_id IS NULL THEN
    RAISE EXCEPTION 'No hay perfiles en la tabla profiles. Por favor crea al menos un perfil primero.';
  END IF;

  SELECT id INTO user2_id FROM profiles OFFSET 1 LIMIT 1;
  SELECT id INTO user3_id FROM profiles OFFSET 2 LIMIT 1;
  SELECT id INTO user4_id FROM profiles OFFSET 3 LIMIT 1;
  SELECT id INTO user5_id FROM profiles OFFSET 4 LIMIT 1;

  -- Si no hay suficientes perfiles, usar el primero
  user2_id := COALESCE(user2_id, user1_id);
  user3_id := COALESCE(user3_id, user1_id);
  user4_id := COALESCE(user4_id, user1_id);
  user5_id := COALESCE(user5_id, user1_id);

  -- Plan 1: Estudio en biblioteca
  INSERT INTO plans (
    creator_id, title, description, category, date, start_time, end_time,
    location_name, latitude, longitude, visibility, max_participants, status
  ) VALUES (
    user1_id,
    'Estudiar en la biblioteca',
    '¿Alguien para repasar Cálculo? Traigo snacks 🍪 y apuntes de la clase de ayer. ¡Nos vemos en la zona de silencio!',
    'ESTUDIO',
    CURRENT_DATE + INTERVAL '2 days',
    '16:00',
    '19:00',
    'Biblio Central',
    -0.3064, -78.4500,
    'UNIVERSITY',
    8,
    'ACTIVE'
  ) RETURNING id INTO plan1_id;

  INSERT INTO plan_participants (plan_id, user_id, role) VALUES
    (plan1_id, user1_id, 'CREATOR');

  -- Solo agregar participantes si son diferentes al creador
  IF user2_id != user1_id THEN
    INSERT INTO plan_participants (plan_id, user_id, role) VALUES (plan1_id, user2_id, 'PARTICIPANT');
  END IF;
  IF user3_id != user1_id AND user3_id != user2_id THEN
    INSERT INTO plan_participants (plan_id, user_id, role) VALUES (plan1_id, user3_id, 'PARTICIPANT');
  END IF;
  IF user4_id != user1_id AND user4_id != user2_id AND user4_id != user3_id THEN
    INSERT INTO plan_participants (plan_id, user_id, role) VALUES (plan1_id, user4_id, 'PARTICIPANT');
  END IF;

  -- Plan 2: Café después de clases
  INSERT INTO plans (
    creator_id, title, description, category, date, start_time,
    location_name, visibility, max_participants, status
  ) VALUES (
    user2_id,
    'Café en Starbucks',
    'Break después de Física 2. ¿Quién se anima? ☕',
    'CAFE',
    CURRENT_DATE + INTERVAL '1 day',
    '14:30',
    'Starbucks Campus',
    'UNIVERSITY',
    5,
    'ACTIVE'
  ) RETURNING id INTO plan2_id;

  INSERT INTO plan_participants (plan_id, user_id, role) VALUES
    (plan2_id, user2_id, 'CREATOR');

  IF user1_id != user2_id THEN
    INSERT INTO plan_participants (plan_id, user_id, role) VALUES (plan2_id, user1_id, 'PARTICIPANT');
  END IF;
  IF user5_id != user2_id AND user5_id != user1_id THEN
    INSERT INTO plan_participants (plan_id, user_id, role) VALUES (plan2_id, user5_id, 'PARTICIPANT');
  END IF;

  -- Plan 3: Partido de fútbol
  INSERT INTO plans (
    creator_id, title, description, category, date, start_time, end_time,
    location_name, visibility, max_participants, status
  ) VALUES (
    user3_id,
    'Cascarita de fútbol',
    'Partido amistoso en la cancha de la ESPE. Traigan agua y buena onda ⚽',
    'DEPORTE',
    CURRENT_DATE + INTERVAL '3 days',
    '17:00',
    '19:00',
    'Cancha ESPE',
    'UNIVERSITY',
    14,
    'ACTIVE'
  ) RETURNING id INTO plan3_id;

  INSERT INTO plan_participants (plan_id, user_id, role) VALUES
    (plan3_id, user3_id, 'CREATOR');

  IF user2_id != user3_id THEN
    INSERT INTO plan_participants (plan_id, user_id, role) VALUES (plan3_id, user2_id, 'PARTICIPANT');
  END IF;
  IF user4_id != user3_id AND user4_id != user2_id THEN
    INSERT INTO plan_participants (plan_id, user_id, role) VALUES (plan3_id, user4_id, 'PARTICIPANT');
  END IF;

  -- Plan 4: Cine en el centro comercial
  INSERT INTO plans (
    creator_id, title, description, category, date, start_time,
    location_name, visibility, status
  ) VALUES (
    user4_id,
    'Cine: Nueva película de Marvel',
    '¿Alguien para ir al cine este fin de semana? Función de las 7pm 🎬🍿',
    'CINE',
    CURRENT_DATE + INTERVAL '5 days',
    '19:00',
    'Cinemark San Luis',
    'PUBLIC',
    'ACTIVE'
  ) RETURNING id INTO plan4_id;

  INSERT INTO plan_participants (plan_id, user_id, role) VALUES
    (plan4_id, user4_id, 'CREATOR');

  IF user1_id != user4_id THEN
    INSERT INTO plan_participants (plan_id, user_id, role) VALUES (plan4_id, user1_id, 'PARTICIPANT');
  END IF;
  IF user3_id != user4_id AND user3_id != user1_id THEN
    INSERT INTO plan_participants (plan_id, user_id, role) VALUES (plan4_id, user3_id, 'PARTICIPANT');
  END IF;
  IF user5_id != user4_id AND user5_id != user1_id AND user5_id != user3_id THEN
    INSERT INTO plan_participants (plan_id, user_id, role) VALUES (plan4_id, user5_id, 'PARTICIPANT');
  END IF;

  -- Plan 5: Pizza party
  INSERT INTO plans (
    creator_id, title, description, category, date, start_time,
    location_name, visibility, max_participants, status
  ) VALUES (
    user5_id,
    'Pizza Party de Ingeniería',
    'Celebremos el fin de parciales con pizza y juegos. ¡Todos invitados! 🍕🎉',
    'COMIDA',
    CURRENT_DATE + INTERVAL '7 days',
    '20:00',
    'Pizza Hut Mall del Sol',
    'UNIVERSITY',
    12,
    'ACTIVE'
  ) RETURNING id INTO plan5_id;

  INSERT INTO plan_participants (plan_id, user_id, role) VALUES
    (plan5_id, user5_id, 'CREATOR');

  IF user1_id != user5_id THEN
    INSERT INTO plan_participants (plan_id, user_id, role) VALUES (plan5_id, user1_id, 'PARTICIPANT');
  END IF;
  IF user2_id != user5_id AND user2_id != user1_id THEN
    INSERT INTO plan_participants (plan_id, user_id, role) VALUES (plan5_id, user2_id, 'PARTICIPANT');
  END IF;
  IF user3_id != user5_id AND user3_id != user1_id AND user3_id != user2_id THEN
    INSERT INTO plan_participants (plan_id, user_id, role) VALUES (plan5_id, user3_id, 'PARTICIPANT');
  END IF;
  IF user4_id != user5_id AND user4_id != user1_id AND user4_id != user2_id AND user4_id != user3_id THEN
    INSERT INTO plan_participants (plan_id, user_id, role) VALUES (plan5_id, user4_id, 'PARTICIPANT');
  END IF;

  -- Mensajes en el chat del plan 5
  INSERT INTO plan_chat_messages (plan_id, sender_id, message, message_type) VALUES
    (plan5_id, user5_id, 'Plan creado', 'SYSTEM'),
    (plan5_id, user1_id, '¡Me encanta la idea! 🎉', 'TEXT'),
    (plan5_id, user2_id, '¿Podemos pedir también alitas?', 'TEXT'),
    (plan5_id, user5_id, '¡Claro! Pidamos variedad 😋', 'TEXT');

  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ Se crearon 5 planes de prueba exitosamente';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Plan 1: % participantes', (SELECT COUNT(*) FROM plan_participants WHERE plan_id = plan1_id AND left_at IS NULL);
  RAISE NOTICE 'Plan 2: % participantes', (SELECT COUNT(*) FROM plan_participants WHERE plan_id = plan2_id AND left_at IS NULL);
  RAISE NOTICE 'Plan 3: % participantes', (SELECT COUNT(*) FROM plan_participants WHERE plan_id = plan3_id AND left_at IS NULL);
  RAISE NOTICE 'Plan 4: % participantes', (SELECT COUNT(*) FROM plan_participants WHERE plan_id = plan4_id AND left_at IS NULL);
  RAISE NOTICE 'Plan 5: % participantes', (SELECT COUNT(*) FROM plan_participants WHERE plan_id = plan5_id AND left_at IS NULL);

END $$;

-- Verificar los planes creados
SELECT
  p.id,
  p.title,
  p.category,
  p.date,
  p.start_time,
  prof.full_name as creator_name,
  COUNT(pp.id) as participants_count
FROM plans p
JOIN profiles prof ON prof.id = p.creator_id
LEFT JOIN plan_participants pp ON pp.plan_id = p.id AND pp.left_at IS NULL
WHERE p.status = 'ACTIVE'
GROUP BY p.id, p.title, p.category, p.date, p.start_time, prof.full_name
ORDER BY p.date, p.start_time;
