# 🎓 Guía Rápida para Presentación - Brain Buddy

## ⚡ Pasos Rápidos (5 minutos)

### 1. Clonar e Instalar
```bash
git clone [URL_DEL_REPO]
cd brainbuddyapp
npm install
```

### 2. Configurar Variables
```bash
# Windows
Copy-Item env.example .env

# Mac/Linux
cp env.example .env
```

### 3. Verificar que Todo Está Bien
```bash
npm run verificar-instalacion
```

### 4. Iniciar la App
```bash
npm start
```

### 5. Abrir en el Teléfono
- Escanea el QR con Expo Go
- O presiona `a` (Android) / `i` (iOS)

---

## ✅ Checklist Pre-Presentación

Ejecuta estos comandos en orden:

```bash
# 1. Verificar instalación
npm run verificar-instalacion

# 2. Verificar conexión a BD
npm run test-db

# 3. Iniciar app
npm start
```

Si los 3 pasos funcionan ✅, estás listo para presentar.

---

## 🚨 Si Algo Falla

### Error: "Cannot find module"
```bash
rm -rf node_modules
npm install
```

### Error: "Network request failed"
- Verifica que estás en la misma WiFi
- O usa: `npx expo start --tunnel`

### La app no conecta a Supabase
```bash
# Verifica el .env existe y tiene las variables
npm run test-db
```

---

## 📱 Comandos Esenciales

| Comando | Qué hace |
|---------|----------|
| `npm install` | Instala dependencias |
| `npm start` | Inicia la app |
| `npm run verificar-instalacion` | Verifica que todo está bien |
| `npm run test-db` | Prueba conexión a BD |

---

## 💡 Tips para la Presentación

1. **Llega 10 minutos antes** para configurar
2. **Ten el QR listo** en la pantalla
3. **Prueba la conexión WiFi** antes de empezar
4. **Ten un backup:** Si falla, muestra screenshots/videos
5. **Prepara datos de prueba** (usuario de ejemplo)

---

**¡Éxito en tu presentación! 🚀**
