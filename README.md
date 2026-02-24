# 🧠 Brain Buddy - App de Estudio Gamificada

App móvil gamificada que ayuda a estudiantes de secundaria a estudiar para exámenes mediante inteligencia artificial.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior) - [Descargar aquí](https://nodejs.org/)
- **npm** (viene con Node.js)
- **Git** - [Descargar aquí](https://git-scm.com/)
- **Expo Go** (en tu teléfono) - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779)

## 🚀 Instalación Rápida (Para Presentación)

### Paso 1: Clonar el Repositorio

```bash
git clone [URL_DEL_REPOSITORIO]
cd brainbuddyapp
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

**⏱️ Tiempo estimado:** 2-5 minutos (depende de la conexión)

### Paso 3: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

**Windows (PowerShell):**
```powershell
Copy-Item env.example .env
```

**Mac/Linux:**
```bash
cp env.example .env
```

Luego edita el archivo `.env` y asegúrate de que tenga estas variables (ya vienen con valores por defecto en `env.example`):

```env
EXPO_PUBLIC_SUPABASE_URL=https://gtetkonnacdseddztjru.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0ZXRrb25uYWNkc2VkZHp0anJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MzExMTMsImV4cCI6MjA3NTAwNzExM30.RshqgOMISPqKGetwGBMGbDC8Hm7jFi_TFSlaKgc0F_g
EXPO_PUBLIC_OPENAI_API_KEY=tu_api_key_aqui
EXPO_PUBLIC_GEMINI_API_KEY=tu_api_key_aqui
EXPO_PUBLIC_GEMINI_MODEL=gemini-1.5-flash
```

> **⚠️ IMPORTANTE:** Si no tienes las API keys de OpenAI o Gemini, la app funcionará pero algunas funcionalidades de IA no estarán disponibles.

### Paso 4: Verificar Instalación

```bash
npm run lint
```

Si no hay errores críticos, continúa.

### Paso 5: Iniciar la Aplicación

```bash
npm start
```

O directamente:

```bash
npx expo start
```

### Paso 6: Abrir en tu Dispositivo

1. **Opción A - Con Expo Go (Recomendado para presentación):**
   - Escanea el código QR que aparece en la terminal con:
     - **Android:** Cámara del teléfono o Expo Go
     - **iOS:** Cámara nativa o Expo Go
   - La app se abrirá automáticamente

2. **Opción B - Emulador/Simulador:**
   - Presiona `a` para Android emulator
   - Presiona `i` para iOS simulator
   - Presiona `w` para web browser

## ✅ Verificación de que Todo Funciona

### 1. Verificar Conexión a Base de Datos

```bash
npm run test-db
```

Deberías ver: `✅ Conexión exitosa a Supabase`

### 2. Verificar que la App Inicia

- La terminal muestra el código QR
- No hay errores rojos en la terminal
- La app se abre en tu dispositivo/emulador

### 3. Probar Funcionalidad Básica

- [ ] Puedes ver la pantalla de login
- [ ] Puedes registrarte o iniciar sesión
- [ ] Puedes navegar entre las tabs (Home, Calendario, Progreso, Perfil)

## 🔧 Solución de Problemas Comunes

### Error: "Cannot find module"

**Solución:**
```bash
rm -rf node_modules
npm install
```

### Error: "Expo CLI not found"

**Solución:**
```bash
npm install -g expo-cli
```

O usa `npx expo` en lugar de `expo`

### Error: "Network request failed" o problemas de conexión

**Solución:**
- Verifica que tu computadora y teléfono estén en la misma red WiFi
- Si usas datos móviles, asegúrate de que la IP sea accesible
- Prueba con `npx expo start --tunnel` (más lento pero funciona desde cualquier red)

### La app no se conecta a Supabase

**Solución:**
1. Verifica que el archivo `.env` existe y tiene las variables correctas
2. Reinicia el servidor de Expo: `Ctrl+C` y luego `npm start` de nuevo
3. Ejecuta `npm run test-db` para verificar la conexión

## 📱 Comandos Útiles

```bash
# Iniciar la app
npm start

# Iniciar en modo específico
npm run android    # Solo Android
npm run ios        # Solo iOS
npm run web        # Solo Web

# Verificar código
npm run lint

# Probar conexión a BD
npm run test-db

# Explorar base de datos
npm run explore-db
```

## 📂 Estructura del Proyecto

```
brainbuddyapp/
├── app/                 # Pantallas (Expo Router)
├── components/          # Componentes reutilizables
├── services/            # Lógica de negocio y APIs
├── contexts/            # Contextos de React
├── constants/           # Constantes y configuración
├── types/               # Tipos de TypeScript
├── sql/                 # Scripts SQL y migraciones
├── docs/                # Documentación
└── .env                 # Variables de entorno (NO subir a Git)
```

## 🎯 Para la Presentación

### Checklist Pre-Presentación

- [ ] ✅ Proyecto clonado e instalado
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ `npm install` ejecutado sin errores
- [ ] ✅ `npm start` funciona correctamente
- [ ] ✅ App se abre en el dispositivo
- [ ] ✅ Login/Registro funciona
- [ ] ✅ Navegación entre pantallas funciona
- [ ] ✅ Conexión a Supabase verificada (`npm run test-db`)

### Datos de Prueba (Opcional)

Si necesitas datos de prueba, puedes:
1. Registrarte como nuevo usuario
2. O usar credenciales existentes si las tienes

## 📞 Soporte

Si encuentras problemas durante la presentación:

1. **Revisa los logs** en la terminal donde corre `npm start`
2. **Verifica la conexión:** `npm run test-db`
3. **Reinicia el servidor:** `Ctrl+C` y luego `npm start`
4. **Reinstala dependencias:** `rm -rf node_modules && npm install`

## 🔐 Seguridad

- ⚠️ **NUNCA** subas el archivo `.env` al repositorio
- ⚠️ El archivo `.env` está en `.gitignore` por seguridad
- ⚠️ Las API keys son sensibles, mantenlas privadas

## 📚 Documentación Adicional

- `docs/requirements.md` - Requisitos del proyecto
- `docs/EJECUTAR_MIGRACIONES.md` - Guía de migraciones de BD
- `docs/PENDIENTES_IMPLEMENTACION.md` - Funcionalidades pendientes

---

## 🎓 Para la Tesis

Este proyecto utiliza:
- **React Native** + **Expo** para desarrollo móvil
- **Supabase** para backend (Base de datos + Auth)
- **OpenAI API** y **Google Gemini** para generación de contenido con IA
- **TypeScript** para type safety
- **Expo Router** para navegación file-based

**Versión:** 1.0.0  
**Última actualización:** 2024
