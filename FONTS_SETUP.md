# Configuración de Fuentes - League Spartan

Este documento explica cómo configurar la fuente League Spartan en la aplicación React Native.

## Pasos para agregar las fuentes

### 1. Descargar las fuentes

Descarga los archivos de fuente League Spartan desde [Google Fonts](https://fonts.google.com/specimen/League+Spartan) o desde el repositorio oficial.

Necesitarás los siguientes archivos:
- `LeagueSpartan-Regular.ttf`
- `LeagueSpartan-Medium.ttf`
- `LeagueSpartan-SemiBold.ttf`
- `LeagueSpartan-Bold.ttf`
- `LeagueSpartan-Light.ttf` (opcional)
- `LeagueSpartan-ExtraLight.ttf` (opcional)
- `LeagueSpartan-ExtraBold.ttf` (opcional)
- `LeagueSpartan-Black.ttf` (opcional)

### 2. Configuración para Android

1. Crea la carpeta de fuentes si no existe:
   ```bash
   mkdir -p android/app/src/main/assets/fonts
   ```

2. Copia todos los archivos `.ttf` a la carpeta:
   ```bash
   cp LeagueSpartan-*.ttf android/app/src/main/assets/fonts/
   ```

### 3. Configuración para iOS

1. Crea la carpeta de fuentes si no existe:
   ```bash
   mkdir -p ios/especonnectFront/Fonts
   ```

2. Copia todos los archivos `.ttf` a la carpeta:
   ```bash
   cp LeagueSpartan-*.ttf ios/especonnectFront/Fonts/
   ```

3. Abre `ios/especonnectFront/Info.plist` y agrega la siguiente entrada dentro de `<dict>`:
   ```xml
   <key>UIAppFonts</key>
   <array>
     <string>LeagueSpartan-Regular.ttf</string>
     <string>LeagueSpartan-Medium.ttf</string>
     <string>LeagueSpartan-SemiBold.ttf</string>
     <string>LeagueSpartan-Bold.ttf</string>
     <string>LeagueSpartan-Light.ttf</string>
     <string>LeagueSpartan-ExtraLight.ttf</string>
     <string>LeagueSpartan-ExtraBold.ttf</string>
     <string>LeagueSpartan-Black.ttf</string>
   </array>
   ```

### 4. Limpiar y reconstruir

Después de agregar las fuentes:

**Android:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

**iOS:**
```bash
cd ios
pod install
cd ..
npm run ios
```

### 5. Verificar la instalación

La aplicación ahora debería usar League Spartan como fuente predeterminada en todos los componentes que usen `react-native-paper` y en los estilos que usen `FONT_FAMILY` de `globalStyles.ts`.

## Notas

- Los nombres de las fuentes deben coincidir exactamente con los nombres de los archivos (sin la extensión `.ttf`)
- Si agregas nuevas fuentes después de la primera instalación, necesitarás reconstruir la aplicación
- En desarrollo, puedes usar `npx react-native-asset` para copiar automáticamente las fuentes (requiere instalación adicional)

