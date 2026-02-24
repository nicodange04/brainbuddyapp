# 🔍 Cómo Identificar a Qué Cuenta de Google Pertenece tu API Key de Gemini

## Método 1: Verificar en Google AI Studio (Más Fácil)

### Paso 1: Probar con Cada Cuenta

1. **Abre una ventana de incógnito** (para no tener sesiones activas)
2. Ve a: **https://aistudio.google.com/**
3. Inicia sesión con tu **primera cuenta de Google**
4. Ve a **"Get API Key"** o **"API Keys"**
5. Compara las primeras y últimas letras de tu API key:
   - Tu API key empieza con `AIza...` y termina con `...MxZ0` (ejemplo)
   - Si coincide → **Esta es la cuenta correcta**
6. Si no coincide, cierra sesión y prueba con la siguiente cuenta

### Paso 2: Verificar en el Código

Tu API key está en el archivo `.env`. Las primeras letras te ayudan a identificarla:

```bash
# Ver las primeras letras de tu API key (sin mostrarla completa por seguridad)
```

---

## Método 2: Usar el Script de Verificación

Ejecuta este comando y verás las primeras y últimas letras:

```bash
npm run verificar-api-key
```

Verás algo como:
```
✅ API key encontrada
   Formato: AIzaSyAjf8...MxZ0
```

**Luego:**
1. Ve a Google AI Studio con cada cuenta
2. Ve a "Get API Key"
3. Compara las primeras letras (`AIzaSyAjf8`) y últimas (`MxZ0`)
4. Cuando coincidan → **Esa es tu cuenta**

---

## Método 3: Verificar Directamente en .env

**⚠️ CUIDADO: No compartas tu API key completa**

1. Abre el archivo `.env` en tu proyecto
2. Busca la línea: `EXPO_PUBLIC_GEMINI_API_KEY=...`
3. Anota las **primeras 10 letras** (ej: `AIzaSyAjf8`)
4. Anota las **últimas 4 letras** (ej: `MxZ0`)
5. Ve a Google AI Studio con cada cuenta
6. Compara las letras hasta encontrar la que coincide

---

## Método 4: Crear Nueva API Key (Si No Encuentras la Cuenta)

Si no puedes identificar la cuenta, puedes crear una nueva:

1. Ve a **https://aistudio.google.com/**
2. Inicia sesión con la cuenta que quieras usar
3. Ve a **"Get API Key"**
4. Click en **"Create API Key"**
5. Copia la nueva key
6. Actualiza tu `.env`:
   ```env
   EXPO_PUBLIC_GEMINI_API_KEY=tu_nueva_key_aqui
   ```
7. Verifica que funciona:
   ```bash
   npm run verificar-api-key
   ```

---

## 🔐 Seguridad: No Compartas tu API Key

**NUNCA:**
- ❌ Subas el archivo `.env` a GitHub
- ❌ Compartas tu API key completa
- ❌ La publiques en ningún lado

**SÍ puedes:**
- ✅ Mostrar las primeras y últimas letras para identificar
- ✅ Usar la key en tu app local
- ✅ Guardarla en `.env` (que está en `.gitignore`)

---

## 💡 Tips

1. **Usa la misma cuenta** para todo:
   - Google AI Studio
   - Facturación
   - API keys

2. **Si tienes muchas cuentas**, crea una nueva API key en la cuenta que quieras usar

3. **Verifica regularmente** en Google AI Studio → Settings → API Keys para ver todas tus keys

---

## ✅ Checklist

- [ ] Identifiqué qué cuenta tiene la API key
- [ ] Actualicé el `.env` si cambié de cuenta
- [ ] Verifiqué con `npm run verificar-api-key`
- [ ] Configuré la facturación en la misma cuenta

---

**¿Necesitas ayuda para identificar tu cuenta específica?** Ejecuta `npm run verificar-api-key` y comparte las primeras y últimas letras (sin la key completa) y te ayudo a identificarla.
