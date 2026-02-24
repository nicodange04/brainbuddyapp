# Instalación Completa - Brain Buddy

Guía paso a paso para instalar y ejecutar el proyecto Brain Buddy en cualquier computadora.

---

## 📋 Requisitos Previos

Asegúrate de tener instalado:
- **Node.js** (versión 18 o superior)
- **npm** (viene con Node.js)
- **Git**

Para verificar:
```powershell
node --version
npm --version
git --version
```

---

## 🚀 PASO 1: Clonar el Repositorio

### 1.1 Elegir dónde guardar el proyecto

Puedes clonar el proyecto en cualquier carpeta. Ejemplos comunes:

**Opción A - Escritorio:**
```powershell
cd C:\Users\TU_USUARIO\Desktop
```

**Opción B - Documentos:**
```powershell
cd C:\Users\TU_USUARIO\Documents
```

**Opción C - Carpeta de proyectos (recomendado):**
```powershell
cd C:\Users\TU_USUARIO
mkdir proyectos
cd proyectos
```

### 1.2 Clonar el repositorio

Una vez en la carpeta donde quieres guardar el proyecto, ejecuta:

```powershell
git clone https://github.com/nicodange04/brainbuddyapp.git
```

Esto creará una carpeta llamada `brainbuddyapp` con todo el código del proyecto.

### 1.3 Entrar a la carpeta del proyecto

```powershell
cd brainbuddyapp
```

**📌 IMPORTANTE:** Guarda la ruta completa donde clonaste el proyecto. La necesitarás cada vez que quieras ejecutar el proyecto.

**Ejemplo de ruta completa:**
```
C:\Users\Juan\Desktop\brainbuddyapp
```

Para verificar dónde estás:
```powershell
pwd
```

---

## 📦 PASO 2: Instalar Dependencias

### 2.1 Asegúrate de estar en la carpeta del proyecto

```powershell
# Si no estás seguro, navega a la carpeta
cd C:\Users\TU_USUARIO\Desktop\brainbuddyapp

# O usa la ruta donde clonaste el proyecto
```

### 2.2 Instalar todas las dependencias

```powershell
npm install
```

**⏱️ Esto puede tardar 2-5 minutos.** Verás muchos mensajes en la terminal, es normal.

**✅ Cuando termine, deberías ver algo como:**
```
added 1234 packages in 2m
```

---

## ⚙️ PASO 3: Configurar Variables de Entorno

### 3.1 Crear el archivo .env

El proyecto necesita un archivo `.env` con las configuraciones. Cópialo desde el ejemplo:

```powershell
Copy-Item env.example .env
```

### 3.2 Verificar que el archivo .env existe

```powershell
# Verificar que se creó correctamente
dir .env
```

### 3.3 Contenido del archivo .env

El archivo `.env` ya viene con las configuraciones necesarias:

```env
EXPO_PUBLIC_SUPABASE_URL=https://gtetkonnacdseddztjru.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0ZXRrb25uYWNkc2VkZHp0anJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MzExMTMsImV4cCI6MjA3NTAwNzExM30.RshqgOMISPqKGetwGBMGbDC8Hm7jFi_TFSlaKgc0F_g
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
EXPO_PUBLIC_GEMINI_MODEL=gemini-1.5-flash
```

**⚠️ NOTA:** Si no tienes API keys de OpenAI o Gemini, déjalas como están. La app funcionará pero algunas funciones de IA no estarán disponibles.

---

## ▶️ PASO 4: Ejecutar la Aplicación

### 4.1 Asegúrate de estar en la carpeta del proyecto

```powershell
cd C:\Users\TU_USUARIO\Desktop\brainbuddyapp
```

### 4.2 Iniciar el servidor de desarrollo

```powershell
npm start
```

**O también puedes usar:**
```powershell
npx expo start
```

### 4.3 Qué esperar

Después de ejecutar `npm start`, verás algo como esto:

```
› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

**✅ Si ves el código QR, todo está funcionando correctamente.**

---

## 📱 PASO 5: Abrir en tu Teléfono

### 5.1 Instalar Expo Go

**Android:**
- Play Store: https://play.google.com/store/apps/details?id=host.exp.exponent

**iOS:**
- App Store: https://apps.apple.com/app/expo-go/id982107779

### 5.2 Conectar tu teléfono

**IMPORTANTE:** Tu teléfono y computadora deben estar en la **misma red WiFi**.

**Opción A - Escanear QR con Expo Go:**
1. Abre la app **Expo Go** en tu teléfono
2. Toca "Scan QR code"
3. Apunta la cámara al código QR que aparece en la terminal
4. La app se abrirá automáticamente

**Opción B - Escanear QR con cámara nativa (iOS):**
1. Abre la app **Cámara** nativa de iOS
2. Apunta al código QR
3. Toca la notificación que aparece
4. Se abrirá en Expo Go

### 5.3 Si el QR no funciona

Si tu teléfono y computadora están en redes diferentes, usa el modo tunnel:

```powershell
# Detén el servidor (Ctrl+C) y ejecuta:
npx expo start --tunnel
```

**⚠️ Nota:** El modo tunnel es más lento pero funciona desde cualquier red.

---

## ✅ PASO 6: Verificar que Todo Funciona

### 6.1 Verificar conexión a la base de datos

En una **nueva terminal** (deja `npm start` corriendo), ejecuta:

```powershell
cd C:\Users\TU_USUARIO\Desktop\brainbuddyapp
npm run test-db
```

**✅ Debe mostrar:**
```
✅ Conexión exitosa a Supabase
```

### 6.2 Verificar que la app funciona

- [ ] El código QR aparece en la terminal
- [ ] No hay errores rojos en la terminal
- [ ] La app se abre en tu teléfono
- [ ] Puedes ver la pantalla de login
- [ ] Puedes navegar entre las pantallas

---

## 🔧 Solución de Problemas Comunes

### Error: "Cannot find module"

**Solución:**
```powershell
rm -rf node_modules
npm install
```

### Error: "Expo CLI not found"

**Solución:**
```powershell
npx expo start
```

### El QR no funciona / No se conecta el teléfono

**Solución:**
1. Verifica que teléfono y computadora estén en la misma WiFi
2. Prueba con modo tunnel: `npx expo start --tunnel`
3. Verifica que el firewall no esté bloqueando la conexión

### La app no se conecta a Supabase

**Solución:**
1. Verifica que el archivo `.env` existe: `dir .env`
2. Reinicia el servidor: `Ctrl+C` y luego `npm start`
3. Ejecuta: `npm run test-db` para verificar la conexión

### No encuentro la carpeta del proyecto

**Solución:**
```powershell
# Buscar la carpeta
cd C:\Users\TU_USUARIO\Desktop
dir

# O buscar en toda la computadora (puede tardar)
Get-ChildItem -Path C:\ -Filter "brainbuddyapp" -Recurse -Directory -ErrorAction SilentlyContinue
```

---

## 📝 Comandos de Referencia Rápida

### Comandos esenciales

```powershell
# Navegar a la carpeta del proyecto
cd C:\Users\TU_USUARIO\Desktop\brainbuddyapp

# Instalar dependencias (solo la primera vez)
npm install

# Iniciar la aplicación
npm start

# Verificar conexión a base de datos
npm run test-db
```

### Comandos durante la ejecución

Cuando `npm start` está corriendo, puedes presionar:
- `r` - Recargar la app
- `m` - Mostrar menú
- `a` - Abrir en Android emulator
- `i` - Abrir en iOS simulator
- `w` - Abrir en navegador web
- `Ctrl+C` - Detener el servidor

### Comandos de mantenimiento

```powershell
# Reinstalar dependencias
rm -rf node_modules
npm install

# Verificar código
npm run lint

# Verificar instalación completa
npm run verificar-instalacion
```

---

## 📍 Recordar la Ruta del Proyecto

**Cada vez que quieras ejecutar el proyecto, necesitas navegar a la carpeta:**

```powershell
cd C:\Users\TU_USUARIO\Desktop\brainbuddyapp
```

**Para encontrar la ruta rápidamente:**

**Desde PowerShell:**
```powershell
# Si ya estás en la carpeta del proyecto
pwd
```

**Desde Explorador de Archivos:**
1. Abre el Explorador de Archivos
2. Navega hasta la carpeta `brainbuddyapp`
3. Click en la barra de direcciones (arriba)
4. Copia la ruta completa

---

## ✅ Checklist de Instalación

Antes de la presentación, verifica:

- [ ] ✅ Node.js instalado (`node --version`)
- [ ] ✅ Proyecto clonado desde GitHub
- [ ] ✅ `npm install` ejecutado sin errores
- [ ] ✅ Archivo `.env` creado (`dir .env`)
- [ ] ✅ `npm start` funciona y muestra el QR
- [ ] ✅ App se abre en el teléfono
- [ ] ✅ `npm run test-db` muestra conexión exitosa
- [ ] ✅ Puedes ver la pantalla de login
- [ ] ✅ Navegación entre pantallas funciona

---

## 🎯 Resumen Ultra-Rápido

```powershell
# 1. Clonar
git clone https://github.com/nicodange04/brainbuddyapp.git
cd brainbuddyapp

# 2. Instalar
npm install

# 3. Configurar
Copy-Item env.example .env

# 4. Ejecutar
npm start

# 5. Escanear QR con Expo Go
```

---

**Última actualización:** 2024  
**Repositorio:** https://github.com/nicodange04/brainbuddyapp
