# 🔍 ¿Por Qué Saltan Errores de Gemini y Cómo Resolverlos?

## 📊 Errores Más Comunes y Sus Causas

### ❌ Error 429: "Cuota Excedida" (El Más Común)

**¿Por qué ocurre?**

El plan **GRATUITO** de Gemini tiene límites muy estrictos:

1. **Límite Diario:** Solo **20 solicitudes por día**
   - Cada vez que creas un examen, se hacen múltiples solicitudes
   - Si creas 3 exámenes con 5 temas cada uno = 15 solicitudes (contenido) + 15 solicitudes (quiz) = **30 solicitudes**
   - **¡Ya excediste el límite diario!**

2. **Límite por Minuto:** Solo **5 solicitudes por minuto**
   - Si generas material para varias sesiones rápido, excedes este límite
   - La app intenta generar todo de una vez → Error 429

3. **Límite de RPM (Requests Per Minute):** 15 RPM en plan gratuito
   - Si haces muchas solicitudes seguidas, Google bloquea temporalmente

**Ejemplo Real:**
```
Crear 1 examen con 3 temas:
- 3 solicitudes para contenido teórico
- 3 solicitudes para quizzes
= 6 solicitudes totales

Si ya usaste 15 solicitudes hoy → Error 429
```

---

### ❌ Error 401: "API Key Inválida"

**¿Por qué ocurre?**

1. **API key expirada o revocada**
2. **API key mal copiada** (espacios, caracteres faltantes)
3. **API key de otra cuenta** (no tiene permisos)
4. **API key no activada** en Google AI Studio

---

### ❌ Error de Red / Timeout

**¿Por qué ocurre?**

1. **Conexión a internet lenta o inestable**
2. **Firewall o proxy bloqueando** las solicitudes a Google
3. **Servidores de Google sobrecargados** (poco común)

---

## ✅ SOLUCIONES (De Más Fácil a Más Completa)

### Solución 1: Esperar (Plan Gratuito) ⏰

**Si es límite por minuto:**
- Espera **1-2 minutos** y vuelve a intentar
- La app automáticamente reintenta con backoff exponencial

**Si es límite diario:**
- Espera hasta **mañana** (se resetea a medianoche hora del servidor)
- O usa la app mañana

**Ventajas:**
- ✅ Gratis
- ✅ No requiere configuración

**Desventajas:**
- ❌ Muy limitado para desarrollo/pruebas
- ❌ No sirve para presentación de tesis si necesitas probar mucho

---

### Solución 2: Optimizar Uso (Plan Gratuito) 🎯

**Estrategias:**

1. **Crear exámenes de a uno**
   - No crees múltiples exámenes el mismo día
   - Espera entre creación de exámenes

2. **Usar menos temas por examen**
   - En lugar de 5 temas, usa 2-3 temas
   - Menos solicitudes = menos probabilidad de error

3. **Esperar entre solicitudes**
   - Si creas un examen, espera 15-20 segundos antes de crear otro

**Ventajas:**
- ✅ Gratis
- ✅ Puedes seguir usando la app

**Desventajas:**
- ❌ Muy lento
- ❌ No práctico para presentación

---

### Solución 3: Agregar Créditos de Pago (RECOMENDADO PARA TESIS) 💳

**Esta es la mejor solución para tu tesis porque:**

✅ **Sin límite diario** - Puedes crear todos los exámenes que necesites  
✅ **Más rápido** - 60 RPM en lugar de 15 RPM  
✅ **Pay-as-you-go** - Solo pagas lo que usas  
✅ **Muy económico** - ~$0.000125 por 1K caracteres  
✅ **Se activa inmediatamente** - En 2-3 minutos ya funciona  

**¿Cuánto cuesta realmente?**

Ejemplo real:
- Crear 1 examen con 3 temas = ~6 solicitudes
- Cada solicitud = ~2000-3000 caracteres
- Costo aproximado: **$0.0015 - $0.0022 por examen**
- **10 exámenes = ~$0.02 (2 centavos de dólar)**

**Pasos para Activar:**

1. **Ve a Google AI Studio:**
   ```
   https://aistudio.google.com/
   ```

2. **Inicia sesión** con tu cuenta de Google

3. **Ve a Settings → Billing:**
   - Click en tu perfil (arriba derecha)
   - Settings
   - Billing

4. **Agrega método de pago:**
   - Tarjeta de crédito/débito
   - O cuenta de Google Pay

5. **Selecciona plan:**
   - **Pay-as-you-go** (recomendado)
   - Sin cargo mensual, solo pagas por uso

6. **¡Listo!** Los créditos se activan automáticamente

**Ventajas:**
- ✅ Sin límites diarios
- ✅ Más rápido
- ✅ Muy económico
- ✅ Perfecto para tesis

**Desventajas:**
- ❌ Requiere tarjeta de crédito
- ❌ Pagas por uso (pero es muy barato)

---

### Solución 4: Usar OpenAI como Backup 🤖

**Si Gemini falla, la app automáticamente usa OpenAI:**

1. **Configura OpenAI en .env:**
   ```env
   EXPO_PUBLIC_OPENAI_API_KEY=tu_key_de_openai
   ```

2. **La app automáticamente cambia:**
   - Si Gemini da error 429 → Usa OpenAI
   - Si Gemini da error 401 → Usa OpenAI
   - Si Gemini no está configurado → Usa OpenAI

**Ventajas:**
- ✅ Backup automático
- ✅ No dependes de un solo proveedor

**Desventajas:**
- ❌ OpenAI también tiene límites (pero más generosos)
- ❌ Requiere configurar otra API key

---

## 🎯 RECOMENDACIÓN PARA TU TESIS

### Opción A: Plan de Pago de Gemini (Mejor Opción)

**Por qué:**
- ✅ Sin límites diarios
- ✅ Muy económico (~$0.02 por 10 exámenes)
- ✅ Se activa en 2-3 minutos
- ✅ Perfecto para presentación

**Pasos:**
1. Ve a https://aistudio.google.com/
2. Settings → Billing
3. Agrega tarjeta
4. Selecciona Pay-as-you-go
5. ¡Listo!

### Opción B: Usar OpenAI como Principal

**Por qué:**
- ✅ Límites más generosos en plan gratuito
- ✅ $5 de crédito gratis al registrarte
- ✅ Puede ser suficiente para tesis

**Pasos:**
1. Regístrate en https://platform.openai.com/
2. Obtén $5 de crédito gratis
3. Configura en .env:
   ```env
   EXPO_PUBLIC_OPENAI_API_KEY=tu_key
   EXPO_PUBLIC_PROVEEDOR_IA=openai
   ```

---

## 🔧 Cómo Verificar Qué Error Tienes

```bash
# Verificar API key y cuota
npm run verificar-api-key

# Si dice "Cuota disponible" → No es problema de cuota
# Si dice "Cuota excedida" → Necesitas esperar o actualizar plan
```

---

## 📝 Resumen de Límites

| Plan | Solicitudes/Día | Solicitudes/Min | RPM | Costo |
|------|----------------|-----------------|-----|-------|
| **Gratuito** | 20 | 5 | 15 | $0 |
| **Pay-as-you-go** | ∞ | ∞ | 60 | ~$0.000125/1K chars |

---

## 💡 Tips Finales

1. **Para desarrollo/pruebas:** Usa plan gratuito con cuidado
2. **Para tesis/presentación:** **Activa plan de pago** (es muy barato)
3. **Tienes backup:** Configura OpenAI también por si acaso
4. **Monitorea uso:** Ve a Google AI Studio → Usage para ver cuánto usas

---

**¿Necesitas ayuda para activar el plan de pago?** Te guío paso a paso si quieres.
