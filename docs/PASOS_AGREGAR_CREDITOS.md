# 💳 Pasos Exactos para Agregar Créditos a Gemini

## 🎯 Ya Encontraste la Cuenta - Ahora Agrega los Créditos

---

## 📝 Pasos Detallados

### Paso 1: Ir a Google AI Studio con tu Cuenta

1. Abre tu navegador
2. Ve a: **https://aistudio.google.com/**
3. **Asegúrate de estar iniciado con la cuenta correcta** (la que tiene tu API key)
4. Si no estás en la cuenta correcta, haz click en tu foto (arriba derecha) y cambia de cuenta

---

### Paso 2: Ir a Configuración de Facturación

**Opción A - Desde el Menú:**
1. Click en tu **foto de perfil** (arriba a la derecha)
2. Click en **"Settings"** o **"Configuración"**
3. En el menú lateral izquierdo, busca y click en **"Billing"** o **"Facturación"**

**Opción B - Link Directo:**
1. Ve directamente a: **https://aistudio.google.com/settings/billing**

---

### Paso 3: Agregar Método de Pago

1. Verás una pantalla de "Billing" o "Facturación"
2. Si es la primera vez, verás un botón grande que dice:
   - **"Add payment method"** o
   - **"Agregar método de pago"** o
   - **"Set up billing"** o
   - **"Configurar facturación"**

3. **Click en ese botón**

4. Te pedirá:
   - **Seleccionar tu país** (Argentina, México, etc.)
   - **Agregar tarjeta de crédito/débito:**
     - Número de tarjeta
     - Fecha de vencimiento (MM/AA)
     - CVV (código de 3 dígitos atrás de la tarjeta)
     - Nombre del titular (como aparece en la tarjeta)
     - Dirección de facturación

5. **Completa todos los campos**

6. Click en **"Save"** o **"Guardar"** o **"Submit"**

---

### Paso 4: Configurar Límite de Gasto (MUY RECOMENDADO)

Para que no gastes más de $5:

1. Después de agregar la tarjeta, busca la opción:
   - **"Set spending limit"** o
   - **"Establecer límite de gasto"** o
   - **"Budget alerts"** o
   - **"Alertas de presupuesto"**

2. **Establece un límite de $5** (o el monto que quieras)

3. Esto significa:
   - ✅ Google te avisará cuando te acerques a $5
   - ✅ Puedes detener el servicio automáticamente al llegar al límite
   - ✅ No gastarás más de lo que quieres

---

### Paso 5: Activar Pay-as-you-go

1. Busca la opción **"Pay-as-you-go"** o **"Pago por uso"**
2. **Actívala** (si no está activada automáticamente)
3. Esto significa:
   - ✅ No hay cargo mensual
   - ✅ Solo pagas por lo que usas
   - ✅ Muy económico

---

### Paso 6: Verificar que Está Activo

Deberías ver:
- ✅ **"Billing enabled"** o **"Facturación activada"**
- ✅ Tu tarjeta listada
- ✅ Estado: **"Active"** o **"Activo"**

---

## ✅ Verificar en tu App

Después de configurar, verifica que funciona:

```bash
npm run verificar-api-key
```

Deberías ver:
- ✅ API key funciona correctamente
- ✅ Cuota disponible (ahora sin límites diarios)

---

## 🔍 Si No Ves la Opción de Billing

**Alternativa - Google Cloud Console:**

1. Ve a: **https://console.cloud.google.com/**
2. **Asegúrate de estar en la misma cuenta de Google**
3. Si no tienes proyecto, crea uno:
   - Click en el selector de proyectos (arriba)
   - "New Project"
   - Nombre: "Brain Buddy" (o el que quieras)
   - Click "Create"

4. Ve a **"Billing"** en el menú lateral (icono de tarjeta de crédito)

5. Click en **"Link a billing account"** o **"Vincular cuenta de facturación"**

6. Click en **"Create billing account"** o **"Crear cuenta de facturación"**

7. Completa:
   - Nombre de la cuenta
   - País
   - Método de pago (tu tarjeta)

8. **Vincula el proyecto a esta cuenta de facturación**

9. **Habilita la API de Gemini:**
   - Ve a "APIs & Services" → "Library"
   - Busca "Generative Language API"
   - Click "Enable"

---

## 💡 Tips Importantes

### 1. No Necesitas "Cargar" $5 Manualmente
- Google **NO funciona como una tarjeta prepaga**
- Google **cobra automáticamente** cuando usas el servicio
- Con el límite de $5, no gastarás más de eso

### 2. El Límite de Gasto es Tu Amigo
- Establece un límite de $5
- Google te avisará cuando te acerques
- Puedes aumentar el límite cuando quieras

### 3. Monitorea tu Uso
- Ve a Google AI Studio → Settings → **Usage**
- Ahí verás cuánto has gastado
- Muy útil para saber cuánto te queda

---

## 🚨 Solución de Problemas

### "No veo la opción de Billing en AI Studio"

**Solución:**
- Algunas cuentas requieren verificación adicional
- Prueba desde Google Cloud Console (pasos arriba)
- Asegúrate de estar en la cuenta correcta

### "Mi tarjeta fue rechazada"

**Soluciones:**
- Verifica que la tarjeta tenga fondos
- Algunas tarjetas de débito no funcionan, usa crédito
- Contacta a tu banco para autorizar pagos internacionales
- Algunos bancos bloquean pagos a Google por seguridad

### "No quiero usar tarjeta de crédito"

**Alternativas:**
- Usa Google Pay si está disponible
- O usa OpenAI como alternativa (tiene $5 gratis al registrarse)

---

## 📊 ¿Cuánto Vas a Gastar?

**Con $5 puedes:**
- Crear ~2,500 exámenes
- O hacer ~12,500 solicitudes individuales
- **Más que suficiente para toda tu tesis**

**Costo real:**
- 1 examen con 3 temas = ~$0.002 (menos de 1 centavo)
- 10 exámenes = ~$0.02 (2 centavos)

---

## ✅ Checklist Final

- [ ] Estoy en la cuenta correcta de Google
- [ ] Agregué método de pago
- [ ] Configuré límite de gasto de $5
- [ ] Pay-as-you-go está activado
- [ ] Verifiqué con `npm run verificar-api-key`
- [ ] Todo funciona correctamente

---

## 🎉 ¡Listo!

Una vez que completes estos pasos:
- ✅ No tendrás límites diarios
- ✅ Podrás crear todos los exámenes que necesites
- ✅ Solo pagarás por lo que uses (muy económico)
- ✅ Perfecto para tu tesis

**¿Tienes algún problema en algún paso?** Dime en cuál y te ayudo específicamente.
