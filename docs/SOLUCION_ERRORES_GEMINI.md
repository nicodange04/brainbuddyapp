# 🔧 Solución de Errores de Gemini - Créditos y Cuota

## 📋 Errores Comunes y Soluciones

### ❌ Error 429: Cuota Excedida

**Síntomas:**
- Mensaje: `429` o `quota exceeded` o `rate limit exceeded`
- La app no puede generar contenido con IA

**Causas:**
1. **Límite diario excedido** (20 solicitudes/día en plan gratuito)
2. **Límite por minuto excedido** (5 solicitudes/minuto en plan gratuito)
3. Plan gratuito agotado

**Soluciones:**

#### Opción 1: Esperar (Plan Gratuito)
```bash
# Verifica tu cuota
npm run verificar-api-key

# Si dice "Cuota excedida", espera:
# - 1-2 minutos si es límite por minuto
# - Hasta mañana si es límite diario
```

#### Opción 2: Actualizar Plan de Gemini (Recomendado para Tesis)
1. Ve a [Google AI Studio](https://aistudio.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Ve a **Settings** → **Billing**
4. Actualiza a un plan de pago (Pay-as-you-go)
5. Los créditos se renuevan automáticamente

**Límites del Plan Gratuito:**
- ⏱️ **20 solicitudes por día**
- ⚡ **5 solicitudes por minuto**
- 📊 **15 RPM (Requests Per Minute)**

**Límites del Plan de Pago:**
- 💰 **Pay-as-you-go**: $0.000125 por 1K caracteres
- 📈 **Sin límite diario** (solo límites de tasa)
- ⚡ **60 RPM** (Requests Per Minute)

---

### ❌ Error 401/403: API Key Inválida

**Síntomas:**
- Mensaje: `401 Unauthorized` o `403 Forbidden`
- `API key inválida` o `sin permisos`

**Soluciones:**

1. **Verificar API Key:**
```bash
npm run verificar-api-key
```

2. **Obtener Nueva API Key:**
   - Ve a [Google AI Studio](https://aistudio.google.com/)
   - Inicia sesión
   - Ve a **Get API Key**
   - Crea una nueva key o usa una existente
   - Copia la key (empieza con `AIza...`)

3. **Actualizar .env:**
```env
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyTuNuevaKeyAqui
```

4. **Reiniciar la app:**
```bash
# Detén el servidor (Ctrl+C)
npm start
```

---

### ❌ Error 404: Modelo No Encontrado

**Síntomas:**
- Mensaje: `Model not found` o `404`
- El modelo especificado no existe

**Soluciones:**

1. **Verificar modelos disponibles:**
```bash
npm run verificar-modelos
```

2. **Actualizar modelo en .env:**
```env
EXPO_PUBLIC_GEMINI_MODEL=gemini-2.5-flash
```

**Modelos disponibles (2024):**
- `gemini-2.5-flash` ✅ (Recomendado - más rápido y económico)
- `gemini-1.5-flash` ✅ (Alternativa)
- `gemini-1.5-pro` ✅ (Más potente, más caro)

---

### ❌ Error: "Network request failed"

**Síntomas:**
- No se puede conectar a Gemini API
- Timeout o error de red

**Soluciones:**

1. **Verificar conexión a internet**
2. **Verificar firewall/proxy** (si estás en una red corporativa)
3. **Probar con otro modelo:**
```env
EXPO_PUBLIC_GEMINI_MODEL=gemini-1.5-flash
```

---

## 🔍 Diagnóstico Rápido

### Paso 1: Verificar API Key
```bash
npm run verificar-api-key
```

**Si funciona ✅:**
- La key es válida
- Hay cuota disponible
- Puedes continuar

**Si falla ❌:**
- Revisa el error específico arriba
- Sigue las soluciones correspondientes

### Paso 2: Verificar Modelo
```bash
npm run verificar-modelos
```

Esto te mostrará qué modelos están disponibles y funcionando.

### Paso 3: Probar Generación
```bash
npm run test-gemini
```

Esto prueba una generación completa de contenido.

---

## 💡 Tips para Evitar Errores

### 1. **Monitorear Uso**
- Revisa tu uso en [Google AI Studio](https://aistudio.google.com/)
- Ve a **Usage** para ver cuántas solicitudes has hecho

### 2. **Usar Plan de Pago para Tesis**
- El plan gratuito es limitado (20/día)
- Para una presentación, considera actualizar temporalmente
- Puedes cancelar después si no lo necesitas

### 3. **Optimizar Solicitudes**
- No generes múltiples exámenes al mismo tiempo
- Espera entre solicitudes (al menos 15 segundos)
- Usa `gemini-2.5-flash` (más económico que `pro`)

### 4. **Tener Backup**
- Si Gemini falla, la app puede usar OpenAI como respaldo
- Configura ambas API keys en `.env`

---

## 🚨 Para la Presentación de Tesis

### Checklist Pre-Presentación:

- [ ] ✅ API key de Gemini configurada y verificada
- [ ] ✅ `npm run verificar-api-key` funciona
- [ ] ✅ Tienes créditos/cuota disponible
- [ ] ✅ Plan actualizado si es necesario
- [ ] ✅ Backup: API key de OpenAI configurada (opcional)

### Si Fallan los Créditos Durante la Presentación:

1. **Opción A - Usar OpenAI como Backup:**
   - La app automáticamente cambia a OpenAI si Gemini falla
   - Asegúrate de tener `EXPO_PUBLIC_OPENAI_API_KEY` configurada

2. **Opción B - Mostrar Screenshots/Videos:**
   - Prepara screenshots de la funcionalidad
   - O graba un video de demostración

3. **Opción C - Actualizar Plan Rápido:**
   - Ve a Google AI Studio
   - Actualiza a plan de pago (toma 2-3 minutos)
   - Los créditos se activan inmediatamente

---

## 📞 Comandos de Verificación

```bash
# Verificar API key y cuota
npm run verificar-api-key

# Verificar modelos disponibles
npm run verificar-modelos

# Probar generación completa
npm run test-gemini

# Verificar conexión a BD (por si acaso)
npm run test-db
```

---

## 🔗 Enlaces Útiles

- [Google AI Studio](https://aistudio.google.com/) - Gestionar API keys y ver uso
- [Documentación Gemini](https://ai.google.dev/docs) - Documentación oficial
- [Precios Gemini](https://ai.google.dev/pricing) - Ver precios y límites

---

**¿Necesitas ayuda específica?** Ejecuta `npm run verificar-api-key` y comparte el error que ves.
