# Sistema de Planes - Migración de Supabase

Este directorio contiene las migraciones SQL para el sistema de planes sociales de EspeConnect.

## 📋 Descripción

El sistema de planes permite a los usuarios crear y unirse a eventos sociales con las siguientes características:

- **Creación de planes** con título, descripción, categoría, fecha, hora y ubicación
- **Sistema de participantes** con roles (creador/participante) y gestión de límites
- **Chat integrado** para cada plan con mensajes de texto y sistema
- **Control de visibilidad** (público o solo universidad)
- **Estados del plan** (activo, cancelado, finalizado)

## 🗂️ Archivos de Migración

### Opción 1: Archivo Completo (Recomendado)
- **`plans_complete.sql`** - Todo en un solo archivo, listo para ejecutar

### Opción 2: Archivos Modulares
1. **`plans_enums.sql`** - Define los tipos ENUM
2. **`plans_tables.sql`** - Crea las 3 tablas principales con índices
3. **`plans_triggers.sql`** - Configura triggers para `updated_at`
4. **`plans_rls_policies.sql`** - Políticas de Row Level Security
5. **`plans_migration.sql`** - Script maestro que ejecuta todo en orden

## 🚀 Cómo Ejecutar

### Método 1: SQL Editor de Supabase (Más Fácil)

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido de **`plans_complete.sql`**
5. Haz clic en **Run**

### Método 2: Supabase CLI

```bash
# Si usas archivos modulares
psql -h db.xxx.supabase.co -U postgres -d postgres -f plans_complete.sql

# O ejecuta cada archivo individualmente
psql -h db.xxx.supabase.co -U postgres -d postgres -f plans_enums.sql
psql -h db.xxx.supabase.co -U postgres -d postgres -f plans_tables.sql
psql -h db.xxx.supabase.co -U postgres -d postgres -f plans_triggers.sql
psql -h db.xxx.supabase.co -U postgres -d postgres -f plans_rls_policies.sql
```

## 📊 Estructura de las Tablas

### 1. `plans`
Tabla principal que almacena los planes creados por usuarios.

```sql
- id                  UUID (PK)
- creator_id          UUID (FK -> User.id)
- title               TEXT
- description         TEXT (opcional)
- category            PlanCategory ENUM
- date                DATE
- start_time          TIME
- end_time            TIME (opcional)
- location_name       TEXT (opcional)
- latitude            DOUBLE PRECISION (opcional)
- longitude           DOUBLE PRECISION (opcional)
- visibility          PlanVisibility ENUM (default: UNIVERSITY)
- max_participants    INTEGER (opcional, null = ilimitado)
- status              PlanStatus ENUM (default: ACTIVE)
- created_at          TIMESTAMP
- updated_at          TIMESTAMP (auto-actualizado)
```

**Constraints:**
- `max_participants` debe ser > 0 o NULL
- Si hay coordenadas, deben estar ambas (lat y lon)
- La fecha debe ser >= hoy

### 2. `plan_participants`
Gestiona los participantes de cada plan.

```sql
- id          UUID (PK)
- plan_id     UUID (FK -> plans.id)
- user_id     UUID (FK -> User.id)
- role        PlanParticipantRole ENUM
- joined_at   TIMESTAMP
- left_at     TIMESTAMP (opcional, null = sigue activo)
```

**Constraints:**
- Un usuario solo puede estar activo una vez por plan
- `left_at` debe ser posterior a `joined_at`

### 3. `plan_chat_messages`
Mensajes de chat para cada plan.

```sql
- id            UUID (PK)
- plan_id       UUID (FK -> plans.id)
- sender_id     UUID (FK -> User.id)
- message       TEXT
- message_type  PlanMessageType ENUM (default: TEXT)
- created_at    TIMESTAMP
```

## 🎨 ENUMs Definidos

```sql
PlanCategory:         CAFE, FIESTA, ESTUDIO, DEPORTE, CINE, MUSICA, VIAJE, COMIDA, OTRO
PlanVisibility:       PUBLIC, UNIVERSITY
PlanStatus:           ACTIVE, CANCELLED, FINISHED
PlanParticipantRole:  CREATOR, PARTICIPANT
PlanMessageType:      TEXT, SYSTEM
```

## 🔒 Políticas de Seguridad (RLS)

### Tabla `plans`
- **SELECT**: Ver planes públicos, activos, o propios
- **INSERT**: Crear planes (solo como creador)
- **UPDATE**: Solo el creador puede actualizar
- **DELETE**: Solo el creador puede eliminar

### Tabla `plan_participants`
- **SELECT**: Ver participantes de planes accesibles
- **INSERT**: Unirse a planes activos con espacio disponible
- **UPDATE**: Actualizar solo tu propia participación
- **DELETE**: Salir de un plan, o el creador puede eliminar participantes

### Tabla `plan_chat_messages`
- **SELECT**: Solo participantes activos ven mensajes
- **INSERT**: Solo participantes activos pueden enviar mensajes
- **UPDATE**: No permitido (los mensajes no se editan)
- **DELETE**: Autor del mensaje o creador del plan

## 🎯 Casos de Uso

### Crear un Plan
```typescript
const { data, error } = await supabase
  .from('plans')
  .insert({
    creator_id: userId,
    title: 'Café en Starbucks',
    description: 'Vamos por un café después de clases',
    category: 'CAFE',
    date: '2026-02-15',
    start_time: '16:00',
    location_name: 'Starbucks Campus',
    visibility: 'UNIVERSITY',
    max_participants: 5
  })
  .select()
  .single();

// Automáticamente crear el participante creador
await supabase
  .from('plan_participants')
  .insert({
    plan_id: data.id,
    user_id: userId,
    role: 'CREATOR'
  });
```

### Unirse a un Plan
```typescript
const { error } = await supabase
  .from('plan_participants')
  .insert({
    plan_id: planId,
    user_id: userId,
    role: 'PARTICIPANT'
  });
```

### Ver Planes Disponibles
```typescript
const { data } = await supabase
  .from('plans')
  .select(`
    *,
    creator:User!creator_id(id, name, avatarUrl),
    participants:plan_participants(count)
  `)
  .eq('status', 'ACTIVE')
  .gte('date', new Date().toISOString().split('T')[0])
  .order('date', { ascending: true });
```

### Enviar Mensaje en el Chat
```typescript
const { error } = await supabase
  .from('plan_chat_messages')
  .insert({
    plan_id: planId,
    sender_id: userId,
    message: 'Hola! Ya voy en camino',
    message_type: 'TEXT'
  });
```

### Salir de un Plan
```typescript
const { error } = await supabase
  .from('plan_participants')
  .update({ left_at: new Date().toISOString() })
  .eq('plan_id', planId)
  .eq('user_id', userId)
  .is('left_at', null);
```

## 🔍 Queries Útiles

### Ver participantes activos de un plan
```sql
SELECT
  pp.*,
  u.name,
  u.avatarUrl
FROM plan_participants pp
JOIN "User" u ON u.id = pp.user_id
WHERE pp.plan_id = 'plan-uuid-here'
  AND pp.left_at IS NULL
ORDER BY pp.joined_at;
```

### Contar espacios disponibles
```sql
SELECT
  p.id,
  p.title,
  p.max_participants,
  COUNT(pp.id) FILTER (WHERE pp.left_at IS NULL) as current_participants,
  CASE
    WHEN p.max_participants IS NULL THEN NULL
    ELSE p.max_participants - COUNT(pp.id) FILTER (WHERE pp.left_at IS NULL)
  END as spaces_available
FROM plans p
LEFT JOIN plan_participants pp ON pp.plan_id = p.id
WHERE p.status = 'ACTIVE'
GROUP BY p.id;
```

### Ver historial de mensajes
```sql
SELECT
  m.*,
  u.name as sender_name,
  u.avatarUrl as sender_avatar
FROM plan_chat_messages m
JOIN "User" u ON u.id = m.sender_id
WHERE m.plan_id = 'plan-uuid-here'
ORDER BY m.created_at ASC;
```

## 📝 Notas Importantes

1. **Creador como participante**: Cuando crees un plan, debes insertar también un registro en `plan_participants` con `role='CREATOR'`

2. **Límite de participantes**: El RLS valida automáticamente que no se exceda `max_participants` al unirse

3. **Mensajes del sistema**: Usa `message_type='SYSTEM'` para notificaciones automáticas (ej: "Juan se unió al plan")

4. **Coordenadas opcionales**: Si no tienes lat/lon, déjalas en NULL. Si las usas, ambas deben tener valor.

5. **Fechas pasadas**: El constraint `check_date_future` permite crear planes solo para hoy o fechas futuras

6. **Trigger automático**: La columna `updated_at` en `plans` se actualiza automáticamente en cada UPDATE

## 🧪 Verificación Post-Migración

Después de ejecutar la migración, verifica que todo está correcto:

```sql
-- Ver tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'plan%';

-- Ver ENUMs
SELECT typname FROM pg_type WHERE typname LIKE 'Plan%';

-- Ver políticas RLS
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('plans', 'plan_participants', 'plan_chat_messages');

-- Ver índices
SELECT tablename, indexname
FROM pg_indexes
WHERE tablename IN ('plans', 'plan_participants', 'plan_chat_messages');
```

## 🐛 Troubleshooting

### Error: "tipo PlanCategory no existe"
- Ejecuta primero `plans_enums.sql` o usa `plans_complete.sql`

### Error: "relación User no existe"
- Verifica que la tabla `User` existe en tu base de datos
- Ejecuta primero las migraciones base del proyecto

### Error: "función update_updated_at_column no existe"
- Ejecuta primero `03_create_triggers.sql` del directorio raíz
- O comenta el trigger en `plans_triggers.sql`

## 📚 Próximos Pasos

Después de ejecutar la migración:

1. Crear TypeScript types basados en estas tablas
2. Implementar servicios en `src/services/plan.service.ts`
3. Crear componentes React para UI de planes
4. Configurar realtime subscriptions para chat
5. Agregar notificaciones push para nuevos mensajes

## 🤝 Contribuir

Si encuentras algún problema o mejora, por favor reporta en el repositorio del proyecto.

---

**Creado para:** EspeConnect
**Fecha:** 2026-02-01
**Versión:** 1.0.0
