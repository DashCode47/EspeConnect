# Instrucciones para Ejecutar la Migración de CamPlus

## 📋 Antes de Comenzar

Asegúrate de tener:
- ✅ Proyecto "CamPlus" creado en Supabase
- ✅ Acceso al Dashboard de Supabase
- ✅ Los scripts de migración en la carpeta `supabase-migration/`

## 🚀 Pasos para Ejecutar la Migración

### Opción 1: Ejecutar Script por Script (Recomendado)

Sigue estos pasos en orden:

#### 1. Ir al SQL Editor de Supabase

1. Ve a tu proyecto CamPlus en https://supabase.com/dashboard
2. En el menú lateral, haz clic en **SQL Editor**
3. Haz clic en **New Query** (o usa el botón +)

#### 2. Ejecutar Script 1: Crear ENUMs

1. Abre el archivo `01_create_enums.sql`
2. Copia **TODO** el contenido del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** (botón verde abajo a la derecha)
5. ✅ Deberías ver "Success. No rows returned"

#### 3. Ejecutar Script 2: Crear Tablas

1. Abre el archivo `02_create_tables.sql`
2. Copia **TODO** el contenido
3. Pégalo en el SQL Editor (puedes usar la misma ventana)
4. Haz clic en **Run**
5. ✅ Deberías ver "Success. No rows returned"

#### 4. Ejecutar Script 3: Crear Triggers

1. Abre el archivo `03_create_triggers.sql`
2. Copia **TODO** el contenido
3. Pégalo en el SQL Editor
4. Haz clic en **Run**
5. ✅ Deberías ver "Success. No rows returned"

#### 5. Ejecutar Script 4: Habilitar RLS

1. Abre el archivo `04_enable_rls.sql`
2. Copia **TODO** el contenido
3. Pégalo en el SQL Editor
4. Haz clic en **Run**
5. ✅ Deberías ver "Success. No rows returned"

#### 6. Ejecutar Script 5: Crear Políticas RLS

1. Abre el archivo `05_create_rls_policies.sql`
2. Copia **TODO** el contenido
3. Pégalo en el SQL Editor
4. Haz clic en **Run**
5. ✅ Deberías ver "Success. No rows returned"

#### 7. Ejecutar Script 6: Crear Storage Buckets

1. Abre el archivo `06_create_storage_buckets.sql`
2. Copia **TODO** el contenido
3. Pégalo en el SQL Editor
4. Haz clic en **Run**
5. ✅ Deberías ver "Success. No rows returned"

#### 8. Verificar la Migración

1. Abre el archivo `99_verify_migration.sql`
2. Copia **TODO** el contenido
3. Pégalo en el SQL Editor
4. Haz clic en **Run**
5. ✅ Revisa los resultados - todos los componentes deben mostrar ✓

### Opción 2: Ejecutar Todo de Una Vez (Avanzado)

**NOTA:** El script maestro `00_run_all_migrations.sql` usa comandos `\i` que solo funcionan en `psql`, NO en el SQL Editor de Supabase.

Si quieres ejecutar todo de una vez en el SQL Editor de Supabase:

1. Crea un nuevo archivo temporal que combine todos los scripts
2. O ejecuta cada script manualmente como se describe en la Opción 1

## 📊 Qué Esperar Después de Cada Script

### Script 1: ENUMs
- Se crean 6 tipos ENUM
- No hay output visible, pero no debe haber errores

### Script 2: Tablas
- Se crean 18 tablas
- Puedes verificar en la pestaña **Table Editor** del sidebar

### Script 3: Triggers
- Se crean 8 triggers
- Se crea 1 función (update_updated_at_column)

### Script 4: RLS
- Se habilita Row Level Security en las 18 tablas
- Verás las tablas con un icono de candado en Table Editor

### Script 5: Políticas RLS
- Se crean más de 50 políticas de seguridad
- Puedes verlas en Authentication > Policies

### Script 6: Storage
- Se crean 6 buckets de almacenamiento
- Puedes verlos en Storage en el sidebar
- Buckets: avatars, posts, events, banners, establishments, careers

## ✅ Verificación Final

Después de ejecutar todos los scripts, ejecuta `99_verify_migration.sql` para verificar:

```
Component                          | Expected | Actual | Status
-----------------------------------+----------+--------+--------
ENUMs                              | 6        | 6      | ✓
Tables                             | 18       | 18     | ✓
Tables with postgres ownership     | 18       | 18     | ✓
Triggers                           | 8        | 8      | ✓
Tables with RLS enabled            | 18       | 18     | ✓
RLS Policies                       | 50       | 50+    | ✓
Storage Buckets                    | 6        | 6      | ✓
Storage Policies                   | 24       | 24+    | ✓
```

Todos deben mostrar ✓

## ❌ Solución de Problemas

### Error: "type already exists"
- **Solución:** El tipo ya fue creado anteriormente. Puedes ignorar este error o eliminar el tipo primero con `DROP TYPE IF EXISTS`.

### Error: "relation already exists"
- **Solución:** La tabla ya existe. Puedes eliminarla con `DROP TABLE IF EXISTS` o ignorar si ya está correcta.

### Error: "permission denied"
- **Solución:** Asegúrate de estar usando el proyecto correcto y tener permisos de administrador.

### Error en Storage Buckets
- **Solución:** Si los buckets ya existen, elimínalos primero desde Storage > Settings o ignora el error.

## 🎯 Siguiente Paso

Una vez que todos los scripts se ejecuten exitosamente y la verificación muestre ✓ en todos los componentes:

1. Obtén tus credenciales de Supabase (Settings > API)
2. Crea un archivo `.env` con tus credenciales
3. Genera los tipos TypeScript
4. Actualiza el frontend para usar Supabase

---

**¿Necesitas ayuda?** Si encuentras algún error durante la ejecución, copia el mensaje de error completo y pídeme ayuda.
