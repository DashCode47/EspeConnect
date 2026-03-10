# Lista de Pantallas - ESPE Connect Front

Esta aplicación React Native contiene las siguientes pantallas organizadas por módulos:

## 🔐 Autenticación (Auth)

### LoginScreen
- **Ubicación**: `src/screens/auth/LoginScreen.tsx`
- **Descripción**: Pantalla de inicio de sesión que permite a los usuarios autenticarse con email y contraseña. Incluye validación de campos y manejo de errores.

### RegisterScreen
- **Ubicación**: `src/screens/auth/RegisterScreen.tsx`
- **Descripción**: Pantalla de registro de nuevos usuarios. Permite crear cuenta con información personal (nombre, email, carrera, género), selección de intereses (máximo 5) y validación de contraseñas.

## 🏠 Pantalla Principal

### HomeScreen
- **Ubicación**: `src/screens/home/HomeScreen.tsx`
- **Descripción**: Pantalla principal de la aplicación que muestra:
  - Banner de noticias universitarias con carrusel
  - Sección de promociones/beneficios
  - Posts destacados
  - Acciones rápidas para navegación

### CreatePostScreen
- **Ubicación**: `src/screens/home/CreatePostScreen.tsx`
- **Descripción**: Pantalla para crear nuevos posts. Permite seleccionar tipo de post (Confesión, Marketplace, Lost & Found), agregar título, contenido e imagen.

### PostDetailsScreen
- **Ubicación**: `src/screens/home/PostDetailsScreen.tsx`
- **Descripción**: Pantalla de detalles de un post específico donde los usuarios pueden ver el contenido completo, comentarios y interactuar con el post.

## 📝 Posts

### PostScreen
- **Ubicación**: `src/screens/posts/PostScreen.tsx`
- **Descripción**: Pantalla principal de posts con filtros por tipo (Confesiones, Social, Académico). Muestra lista de posts con opción de refrescar y crear nuevos posts.

## 👤 Perfil

### ProfileScreen
- **Ubicación**: `src/screens/ProfileScreen.tsx`
- **Descripción**: Pantalla de perfil del usuario que permite:
  - Ver y editar información personal
  - Cambiar foto de perfil
  - Ver intereses seleccionados
  - Cerrar sesión

## 🎁 Beneficios

### BenefitDetail
- **Ubicación**: `src/screens/benefits/BenefitDetail.tsx`
- **Descripción**: Pantalla de detalles de promociones/beneficios con:
  - Información completa de la promoción
  - Cronología de fechas
  - Información de ubicación y categoría
  - Opción para compartir el beneficio

## 🎓 Comunidad

### Carreers
- **Ubicación**: `src/screens/comunity/Carreers.tsx`
- **Descripción**: Pantalla que muestra todas las carreras disponibles con información de modalidad, duración y campus. Incluye animaciones y gradientes personalizados.

### CarreerDetails
- **Ubicación**: `src/screens/comunity/CarreerDetails.tsx`
- **Descripción**: Pantalla de detalles de una carrera específica con información detallada sobre la carrera seleccionada.

### CurriculumTree
- **Ubicación**: `src/screens/comunity/CurriculumTree.tsx`
- **Descripción**: Pantalla que muestra el árbol curricular de las carreras, permitiendo visualizar la estructura académica.

### ProfessorRadar
- **Ubicación**: `src/screens/comunity/ProfessorRadar.tsx`
- **Descripción**: Sistema de reseñas de profesores que incluye:
  - Evaluaciones detalladas (exigencia, claridad, humor, disponibilidad)
  - Comentarios de estudiantes
  - Fortalezas y áreas de mejora
  - Sistema de calificación por estrellas

### WisdomCapsules
- **Ubicación**: `src/screens/comunity/WisdomCapsules.tsx`
- **Descripción**: Pantalla de cápsulas de sabiduría o consejos académicos para estudiantes.
 
## 🚗 Viajes (Rides)
 
### RidesScreen
- **Ubicación**: `src/screens/rides/RidesScreen.tsx`
- **Descripción**: Centro de carpooling donde los usuarios pueden buscar viajes o ofrecer rutas. Incluye filtros por origen/destino y gestión de viajes propios.
 
### TripDetailScreen
- **Ubicación**: `src/screens/rides/TripDetailScreen.tsx`
- **Descripción**: Detalle completo de un viaje con información del conductor, ruta, horario y solicitudes. Permite a los pasajeros unirse al viaje.
 
### ManageTripRequestsScreen
- **Ubicación**: `src/screens/rides/ManageTripRequestsScreen.tsx`
- **Descripción**: Panel para que el conductor gestione las solicitudes de pasajeros (aceptar/rechazar).
 
### CreateTripScreen
- **Ubicación**: `src/screens/rides/CreateTripScreen.tsx`
- **Descripción**: Formulario para crear una nueva oferta de viaje con detalles de ruta, precio y asientos.
 
### MyTripsScreen
- **Ubicación**: `src/screens/rides/MyTripsScreen.tsx`
- **Descripción**: Historial y lista de viajes donde el usuario participa como conductor o pasajero.

## 📱 Características Técnicas

- **Framework**: React Native
- **Navegación**: React Navigation v6
- **UI Components**: React Native Paper
- **Animaciones**: React Native Reanimated
- **Gradientes**: React Native Linear Gradient
- **Imágenes**: React Native Image Picker
- **Estado**: Context API + Zustand (useTripStore, useUserStore, usePlanStore)
- **Almacenamiento**: AsyncStorage

## 🎨 Diseño

La aplicación utiliza un sistema de colores basado en:
- Verde principal: `#008000`
- Gradientes dinámicos para tarjetas
- Animaciones fluidas y transiciones
- Diseño responsivo con SafeAreaView
- Iconografía de Material Community Icons

## 📂 Estructura de Navegación

```
RootNavigator
├── AuthNavigator (Login, Register)
└── MainTabNavigator
    ├── HomeStack (Home, CreatePost, PostDetails)
    ├── BenefitsNavigator (BenefitDetail)
    ├── ComunityStack (Carreers, CarreerDetails, CurriculumTree, ProfessorRadar, WisdomCapsules)
    ├── PostStack (PostScreen)
    └── ProfileScreen
```

---

*Documento generado automáticamente basado en la estructura de archivos de la aplicación ESPE Connect Front.*
