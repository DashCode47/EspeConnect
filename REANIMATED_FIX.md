# Solución para Error de react-native-reanimated en Windows

## Problema
```
ninja: error: mkdir(src/main/cpp/reanimated/CMakeFiles/reanimated.dir/C_/Users/...): No such file or directory
```

Este error ocurre cuando CMake intenta crear directorios con rutas muy largas en Windows. **El NDK tiene un límite en el número de caracteres de ruta**, por lo que rutas largas pueden causar este problema.

## Solución Principal (Recomendada)

### Mover el proyecto a una ruta más corta

**Esta es la solución más efectiva.** El NDK tiene limitaciones en la longitud de las rutas, por lo que acortar la ruta del proyecto resuelve el problema.

**Ejemplo:**
- ❌ Ruta larga: `C:\Users\david\Documents\Projects\CampPlus\especonnectFront`
- ✅ Ruta corta: `C:\Projects\CampPlus\especonnectFront` o `C:\Dev\especonnectFront`

**Pasos:**
1. Cierra todas las terminales y editores que estén usando el proyecto
2. Mueve la carpeta del proyecto a una ubicación con ruta más corta
3. Abre el proyecto desde la nueva ubicación
4. Limpia y reconstruye:
   ```powershell
   cd android
   .\gradlew.bat clean
   cd ..
   yarn android
   ```

## Otras Soluciones (Si el problema persiste)

### 1. Limpiar archivos de build de CMake
```powershell
# Limpiar archivos de CMake y build
cd android
Remove-Item -Recurse -Force "app\.cxx" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "app\build" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".gradle" -ErrorAction SilentlyContinue
```

### 2. Limpiar con Gradle
```powershell
cd android
.\gradlew.bat clean
```

### 3. Reconstruir el proyecto
```powershell
# Volver al directorio raíz
cd ..

# Iniciar Metro con caché limpia
yarn start --reset-cache
```

En otra terminal:
```powershell
yarn android
```

## Si el problema persiste

### Opción 1: Deshabilitar temporalmente la nueva arquitectura

Edita `android/gradle.properties` y cambia:
```properties
newArchEnabled=false
```

Luego limpia y reconstruye:
```powershell
cd android
.\gradlew.bat clean
cd ..
yarn android
```

### Opción 2: Limitar arquitecturas de build

En `android/gradle.properties`, puedes limitar las arquitecturas:
```properties
reactNativeArchitectures=arm64-v8a
```

Esto reduce el tiempo de compilación y puede evitar problemas con rutas largas.

### Opción 3: Verificar versión de react-native-reanimated

Asegúrate de tener una versión compatible:
```powershell
yarn list react-native-reanimated
```

Si es necesario, reinstala:
```powershell
yarn remove react-native-reanimated
yarn add react-native-reanimated@^3.17.5
```

## Notas

- **La causa principal es la longitud de la ruta del proyecto** - NDK tiene limitaciones en el número de caracteres de ruta
- El error de CMake suele resolverse moviendo el proyecto a una ruta más corta
- En Windows, las rutas largas pueden causar problemas con CMake y NDK
- La nueva arquitectura de React Native puede requerir configuración adicional


