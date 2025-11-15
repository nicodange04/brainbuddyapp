# 📋 Paso a Paso: Generación de Material en Background

## ✅ Estado Actual

**Lo que ya está hecho:**
- ✅ Archivos creados (pero NO integrados):
  - `sql/migration_agregar_material_generado.sql` - Migración SQL
  - `services/materialFiles.ts` - Obtener archivos
  - `services/notifications.ts` - Notificaciones
  - `services/materialGeneration.ts` - Generación en background

**Lo que NO está hecho:**
- ❌ Migración SQL ejecutada
- ❌ Dependencias instaladas
- ❌ Código integrado

---

## 🚀 PASO 1: Ejecutar Migración SQL (PRIMERO)

**Este es el PRIMER paso obligatorio antes de continuar.**

### ¿Qué hace la migración?

Agrega 2 campos nuevos a la tabla `sesionestudio`:
- `material_generado` (JSONB) - Para guardar contenido teórico
- `material_estado` (VARCHAR) - Para trackear estado ('pendiente', 'generando', 'listo', 'error')

**⚠️ IMPORTANTE:** Solo AGREGA campos, NO modifica nada existente.

### Cómo ejecutar:

1. **Abre Supabase Dashboard**
   - Ve a tu proyecto en Supabase
   - Click en "SQL Editor" (menú lateral)

2. **Abre el archivo de migración**
   - Abre `sql/migration_agregar_material_generado.sql` en tu editor
   - Copia TODO el contenido

3. **Pega y ejecuta en Supabase**
   - Pega el contenido en SQL Editor
   - Click en "Run" o presiona Ctrl+Enter
   - Verifica que no haya errores

4. **Verifica que funcionó**
   - Deberías ver mensaje de éxito
   - Ejecuta esta query para verificar:

```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'sesionestudio' 
  AND column_name IN ('material_generado', 'material_estado');
```

Deberías ver 2 filas con los nuevos campos.

**✅ Una vez completado este paso, avísame y continuamos con el siguiente.**

---

## 📝 PASO 2: Instalar Dependencias (DESPUÉS del Paso 1)

**Solo después de ejecutar la migración SQL.**

### Dependencias a instalar:

1. **expo-notifications** - Para notificaciones locales
2. **openai** - Para generar contenido con ChatGPT

### Cómo instalar:

```bash
# Instalar expo-notifications
npx expo install expo-notifications

# Instalar openai
npm install openai
```

**✅ Una vez completado, avísame y continuamos.**

---

## 🔑 PASO 3: Configurar API Key de OpenAI (DESPUÉS del Paso 2)

**Solo después de instalar dependencias.**

### Cómo obtener API key:

1. Ve a https://platform.openai.com/api-keys
2. Inicia sesión o crea cuenta
3. Click en "Create new secret key"
4. Copia la API key (solo se muestra una vez)

### Cómo configurar:

1. **Abre archivo `.env`** (o créalo si no existe)
2. **Agrega la API key:**

```env
EXPO_PUBLIC_OPENAI_API_KEY=tu_api_key_aqui
```

3. **Guarda el archivo**

**⚠️ IMPORTANTE:** NO subas `.env` a Git (debe estar en `.gitignore`)

**✅ Una vez completado, avísame y continuamos.**

---

## 🔧 PASO 4: Integrar Código (DESPUÉS del Paso 3)

**Solo después de configurar la API key.**

### Cambios a hacer:

1. **Modificar `package.json`** - Agregar dependencias
2. **Modificar `app.json`** - Agregar plugin de notificaciones
3. **Modificar `services/sessionDistribution.ts`** - Iniciar generación en background

**Te guiaré paso a paso cuando lleguemos aquí.**

---

## 🧪 PASO 5: Rebuild y Probar (DESPUÉS del Paso 4)

**Solo después de integrar el código.**

### Rebuild necesario:

```bash
npx expo prebuild --clean
npx expo run:ios  # o run:android
```

### Probar:

1. Crear examen de prueba
2. Verificar logs
3. Verificar notificaciones
4. Verificar BD

---

## 📌 Resumen del Orden

```
1. ✅ Ejecutar migración SQL (PRIMERO)
   ↓
2. ✅ Instalar dependencias
   ↓
3. ✅ Configurar API key
   ↓
4. ✅ Integrar código
   ↓
5. ✅ Rebuild y probar
```

---

## ⚠️ IMPORTANTE

**NO hagas el Paso 2 hasta completar el Paso 1.**
**NO hagas el Paso 3 hasta completar el Paso 2.**
**Y así sucesivamente...**

**Cada paso depende del anterior.**

---

## 🎯 ¿Dónde estás ahora?

**Estás en el PASO 1: Ejecutar Migración SQL**

**Siguiente acción:**
1. Abre `sql/migration_agregar_material_generado.sql`
2. Copia el contenido
3. Ejecuta en Supabase SQL Editor
4. Verifica que funcionó
5. **Avísame cuando esté listo y continuamos con el Paso 2**

---

## ❓ ¿Necesitas ayuda?

Si tienes dudas en algún paso, pregúntame y te ayudo.




