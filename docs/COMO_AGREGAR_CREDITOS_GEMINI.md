# 💳 Cómo Agregar $5 de Créditos a Gemini - Guía Paso a Paso

## 🎯 Con $5 Tienes Suficiente

**Cálculo rápido:**
- $5 = 5,000 centavos
- 1 examen con 3 temas ≈ 2 centavos
- **Con $5 puedes crear ~2,500 exámenes** (más que suficiente para tesis)

---

## 📝 Pasos Detallados

### Paso 1: Ir a Google AI Studio

1. Abre tu navegador
2. Ve a: **https://aistudio.google.com/**
3. Inicia sesión con tu cuenta de Google (la misma que usaste para crear la API key)

---

### Paso 2: Acceder a Configuración de Facturación

**Opción A - Desde el menú:**
1. Click en tu **foto de perfil** (arriba a la derecha)
2. Click en **"Settings"** o **"Configuración"**
3. En el menú lateral, busca **"Billing"** o **"Facturación"**

**Opción B - Directo:**
1. Ve directamente a: **https://aistudio.google.com/settings/billing**

---

### Paso 3: Agregar Método de Pago

1. Si es la primera vez, verás un botón **"Add payment method"** o **"Agregar método de pago"**
2. Click en ese botón
3. Selecciona tu país
4. Ingresa los datos de tu tarjeta:
   - Número de tarjeta
   - Fecha de vencimiento
   - CVV (código de seguridad)
   - Nombre del titular
   - Dirección de facturación

5. Click en **"Save"** o **"Guardar"**

---

### Paso 4: Configurar Límite de Gasto (Opcional pero Recomendado)

Para evitar gastos inesperados:

1. Busca **"Set spending limit"** o **"Establecer límite de gasto"**
2. Establece un límite de **$5** o **$10**
3. Esto asegura que no gastes más de lo que quieres

---

### Paso 5: Activar Pay-as-you-go

1. Busca la opción **"Pay-as-you-go"** o **"Pago por uso"**
2. Actívala (si no está activada)
3. **No hay cargo mensual**, solo pagas por lo que usas

---

### Paso 6: Verificar que Está Activo

1. Deberías ver un mensaje como: **"Billing enabled"** o **"Facturación activada"**
2. Verás tu método de pago listado
3. Los créditos se activan **automáticamente** (no necesitas "cargar" $5, se cobra automáticamente cuando usas)

---

## ✅ Verificación en tu App

Después de configurar, verifica que funciona:

```bash
npm run verificar-api-key
```

Deberías ver:
- ✅ API key funciona correctamente
- ✅ Cuota disponible (ahora sin límites diarios)

---

## 🔍 Si No Encuentras la Opción de Billing

**Alternativa - Desde Google Cloud Console:**

1. Ve a: **https://console.cloud.google.com/**
2. Selecciona tu proyecto (o crea uno nuevo)
3. Ve a **"Billing"** en el menú lateral
4. Click en **"Link a billing account"** o **"Vincular cuenta de facturación"**
5. Crea una cuenta de facturación nueva
6. Agrega tu método de pago
7. Vincula el proyecto de Gemini API a esta cuenta

---

## 💡 Tips Importantes

1. **No necesitas "cargar" $5 manualmente**
   - Google cobra automáticamente cuando usas el servicio
   - Puedes establecer un límite de $5 para no gastar más

2. **El límite de gasto es tu amigo**
   - Establece un límite de $5 o $10
   - Google te avisará cuando te acerques al límite
   - Puedes aumentar el límite cuando quieras

3. **Monitorea tu uso**
   - Ve a Google AI Studio → Settings → Usage
   - Ahí verás cuánto has gastado
   - Muy útil para saber cuánto te queda

---

## 🚨 Solución de Problemas

### "No veo la opción de Billing"

**Solución:**
- Asegúrate de estar en la cuenta correcta de Google
- Prueba desde Google Cloud Console (link arriba)
- Algunas cuentas requieren verificación adicional

### "Mi tarjeta fue rechazada"

**Solución:**
- Verifica que la tarjeta tenga fondos
- Algunas tarjetas de débito no funcionan, usa crédito
- Contacta a tu banco para autorizar pagos internacionales

### "No quiero usar tarjeta de crédito"

**Solución:**
- Usa Google Pay si está disponible en tu país
- O usa OpenAI como alternativa (tiene $5 gratis al registrarse)

---

## 📊 ¿Cuánto Vas a Gastar Realmente?

**Ejemplo Real:**
- Crear 1 examen con 3 temas = ~6 solicitudes
- Cada solicitud = ~2000-3000 caracteres
- Costo = ~$0.002 (menos de 1 centavo)

**Con $5 puedes:**
- Crear ~2,500 exámenes
- O hacer ~12,500 solicitudes individuales
- **Más que suficiente para toda tu tesis y pruebas**

---

## ✅ Checklist Final

- [ ] Cuenta de Google iniciada en AI Studio
- [ ] Método de pago agregado
- [ ] Pay-as-you-go activado
- [ ] Límite de gasto configurado (opcional pero recomendado)
- [ ] Verificado con `npm run verificar-api-key`

---

**¡Listo! Con esto ya no tendrás problemas de cuota. 🎉**
