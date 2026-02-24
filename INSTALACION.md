# Instalación - Brain Buddy

## PASO 1: Subir a GitHub

```powershell
cd C:\brainbuddyapp
git init
git add .
git commit -m "Primera versión"
git remote add origin https://github.com/TU_USUARIO/brainbuddyapp.git
git branch -M main
git push -u origin main
```

**Nota:** Reemplaza `TU_USUARIO` con tu usuario de GitHub.

---

## PASO 2: En otra computadora

### 2.1 Clonar el proyecto

**Abre PowerShell o CMD y ejecuta:**

```powershell
git clone https://github.com/nicodange04/brainbuddyapp.git
cd brainbuddyapp
```

**O desde cualquier carpeta:**
```powershell
# Navega a donde quieras guardar el proyecto (ejemplo: Escritorio)
cd C:\Users\TU_USUARIO\Desktop

# Clona el repositorio
git clone https://github.com/nicodange04/brainbuddyapp.git

# Entra a la carpeta del proyecto
cd brainbuddyapp
```

### 2.2 Instalar dependencias
```powershell
npm install
```
⏱️ Espera 2-5 minutos mientras se instalan.

### 2.3 Crear archivo .env
```powershell
Copy-Item env.example .env
```

### 2.4 Ejecutar la aplicación
```powershell
npm start
```

### 2.5 Abrir en el teléfono
- Escanea el código QR que aparece en la terminal
- Usa la app **Expo Go** (Android/iOS)

---

## Verificar que funciona

```powershell
npm run test-db
```

Debe mostrar: `✅ Conexión exitosa a Supabase`

---

## Si algo falla

```powershell
# Reinstalar dependencias
rm -rf node_modules
npm install

# Volver a ejecutar
npm start
```

---

## Comandos útiles

```powershell
npm start          # Iniciar la app
npm run test-db    # Verificar conexión a BD
npm run lint       # Verificar código
```
