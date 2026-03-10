# Configuración de Supabase en CamPlus Frontend

## 📦 Paso 1: Instalar Dependencias

Ejecuta estos comandos en tu terminal:

```bash
# Instalar Supabase JS Client
npm install @supabase/supabase-js

# Instalar react-native-config para manejar variables de entorno
npm install react-native-config

# Para iOS, instalar pods
cd ios && pod install && cd ..
```

## 🔑 Paso 2: Configurar Variables de Entorno

1. Crea un archivo `.env` en la raíz del proyecto (copia desde `.env.example`):

```bash
cp .env.example .env
```

2. Edita el archivo `.env` y añade tus credenciales de Supabase:

```env
SUPABASE_URL=https://tu-proyecto-ref.supabase.co
SUPABASE_ANON_KEY=tu-anon-key-aqui
```

**¿Dónde encontrar estas credenciales?**
- Ve a https://supabase.com/dashboard
- Selecciona tu proyecto CamPlus
- Ve a Settings → API
- Copia "Project URL" y "anon public" key

## 📱 Paso 3: Configurar react-native-config

### Para Android:

Edita `android/app/build.gradle` y añade al inicio (si no existe):

```gradle
// Al inicio del archivo, después de apply plugin
apply from: project(':react-native-config').projectDir.getPath() + "/dotenv.gradle"
```

### Para iOS:

Edita `ios/CamPlus/AppDelegate.mm` (o `AppDelegate.m`) y añade:

```objective-c
#import "RNCConfig.h"
```

**Ya está listo!** react-native-config se auto-configura en la mayoría de los casos.

## 🔌 Paso 4: Crear el Cliente de Supabase

He creado el archivo `src/lib/supabase.ts` con la configuración del cliente.

**Importante:** Debes importar este cliente en lugar de usar axios para las llamadas a la API.

## 🎯 Paso 5: Actualizar AuthContext

Necesitas actualizar `src/contexts/AuthContext.tsx` para usar Supabase Auth en lugar de JWT manual.

Los cambios principales son:
- Reemplazar `axios` por el cliente de Supabase
- Usar `supabase.auth.signUp()` para registro
- Usar `supabase.auth.signInWithPassword()` para login
- Usar `supabase.auth.signOut()` para logout
- Usar `supabase.auth.getUser()` para obtener usuario actual
- Escuchar cambios de autenticación con `supabase.auth.onAuthStateChange()`

## 🗄️ Paso 6: Actualizar los Servicios API

Reemplaza las llamadas axios en tus servicios por llamadas a Supabase:

### Ejemplo - Antes (con axios):
```typescript
const response = await axios.get('/api/posts');
const posts = response.data;
```

### Ejemplo - Después (con Supabase):
```typescript
import { supabase } from '../lib/supabase';

const { data: posts, error } = await supabase
  .from('Post')
  .select('*')
  .order('createdAt', { ascending: false });

if (error) throw error;
```

## 📝 Paso 7: Tipos TypeScript (Opcional pero Recomendado)

Para tener autocompletado y type-safety, genera los tipos TypeScript:

```bash
# Instala Supabase CLI globalmente
npm install -g supabase

# Genera los tipos (reemplaza con tu project ID)
npx supabase gen types typescript --project-id tu-project-id > src/types/database.types.ts
```

Luego podrás usar los tipos así:

```typescript
import { Database } from '../types/database.types';

const { data, error } = await supabase
  .from('Post')
  .select<'*', Database['public']['Tables']['Post']['Row']>('*');
```

## 🔄 Paso 8: Migrar Servicios Uno por Uno

Recomiendo migrar los servicios en este orden:

1. ✅ **auth.service.ts** - Autenticación (login, register, logout)
2. ✅ **user.service.ts** - Operaciones de usuario
3. ✅ **post.service.ts** - Posts y comentarios
4. ✅ **trip.service.ts** - Sistema de carpooling
5. ✅ **event.service.ts** - Eventos
6. ✅ **promotion.service.ts** - Promociones
7. ✅ **establishment.service.ts** - Establecimientos

## 📤 Paso 9: Subir Archivos a Storage

Para subir imágenes, reemplaza las llamadas a Google Cloud Storage:

### Antes (GCS):
```typescript
const formData = new FormData();
formData.append('image', imageFile);
const response = await axios.post('/upload', formData);
```

### Después (Supabase Storage):
```typescript
import { supabase } from '../lib/supabase';

const { data, error } = await supabase.storage
  .from('posts')
  .upload(`${userId}/${Date.now()}-${fileName}`, imageFile);

if (error) throw error;

// Obtener URL pública
const { data: { publicUrl } } = supabase.storage
  .from('posts')
  .getPublicUrl(data.path);
```

## ✅ Verificación

Para verificar que todo funciona:

1. **Prueba el login/registro** - Verifica que crea usuarios en Supabase Auth
2. **Prueba crear un post** - Verifica que se guarda en la tabla Post
3. **Prueba subir una imagen** - Verifica que aparece en Storage > posts
4. **Revisa las políticas RLS** - Si hay errores de permisos, revisa las políticas en Supabase Dashboard

## 🐛 Solución de Problemas

### Error: "SUPABASE_URL is not defined"
- Asegúrate de que `.env` existe y tiene las variables correctas
- Reinicia Metro Bundler: `npm start -- --reset-cache`
- En Android: reconstruye la app `npm run android`
- En iOS: reconstruye `npm run ios`

### Error: "Row Level Security policy violation"
- Verifica que el usuario está autenticado
- Revisa las políticas RLS en Supabase Dashboard
- Algunas operaciones requieren que auth.uid() coincida con el userId

### Error al subir imágenes
- Verifica que el bucket existe en Storage
- Verifica que las políticas de storage permiten upload
- Revisa el formato del archivo (debe ser image/jpeg, image/png, etc.)

## 📚 Recursos

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth con React Native](https://supabase.com/docs/guides/auth/quickstarts/react-native)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**¿Necesitas ayuda?** Si encuentras algún error durante la migración, avísame y te ayudo a resolverlo.
