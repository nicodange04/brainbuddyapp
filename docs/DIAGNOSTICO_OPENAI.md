# 🔍 Diagnóstico de Problemas con OpenAI

## 📋 Información que Necesito para Diagnosticar

Para poder ayudarte a resolver el problema, necesito que me pases la siguiente información:

### 1. ✅ Verificar API Key

**Ejecuta esto en tu terminal (desde la raíz del proyecto):**

```bash
# Verificar que la variable esté en .env
cat .env | findstr EXPO_PUBLIC_OPENAI_API_KEY
```

**O en PowerShell:**
```powershell
Select-String -Path .env -Pattern "EXPO_PUBLIC_OPENAI_API_KEY"
```

**¿Qué debería mostrar?**
- `EXPO_PUBLIC_OPENAI_API_KEY=sk-...` (tu key debería empezar con `sk-`)

**Si no muestra nada o muestra un valor vacío:**
- Tu API key no está configurada correctamente
- Agrega la línea al archivo `.env`

---

### 2. ✅ Verificar Créditos en OpenAI

1. Ve a: https://platform.openai.com/account/billing
2. Verifica:
   - **Usage**: ¿Cuánto has gastado?
   - **Credits**: ¿Tienes créditos disponibles?
   - **Payment method**: ¿Tienes método de pago configurado?

**Si no tienes créditos:**
- Agrega un método de pago
- Recarga créditos (mínimo $5)

---

### 3. ✅ Verificar Estado de Sesiones en BD

**Ejecuta esta query en Supabase SQL Editor:**

```sql
SELECT 
  sesion_id,
  tema,
  material_estado,
  CASE 
    WHEN material_generado IS NOT NULL THEN 'SÍ' 
    ELSE 'NO' 
  END as tiene_material,
  CASE 
    WHEN mini_quiz_id IS NOT NULL THEN 'SÍ' 
    ELSE 'NO' 
  END as tiene_quiz,
  created_at,
  updated_at
FROM sesionestudio
WHERE examen_id = 'TU_EXAMEN_ID_AQUI'  -- Reemplaza con tu examen_id
ORDER BY fecha ASC;
```

**¿Qué debería mostrar?**
- `material_estado`: `'pendiente'`, `'generando'`, `'listo'`, o `'error'`
- `tiene_material`: `'SÍ'` o `'NO'`
- `tiene_quiz`: `'SÍ'` o `'NO'`

**Pásame el resultado de esta query.**

---

### 4. ✅ Verificar Logs de la App

**Cuando creas un examen, deberías ver en la consola:**

```
🚀 Iniciando generación de material en background para X sesión(es)...
🔄 Generando material para sesión ... (intento 1/3)...
📝 Generando contenido teórico para "..."
```

**Si ves errores, pásame:**
- El mensaje de error completo
- El stack trace (si aparece)

---

### 5. ✅ Verificar que la Migración SQL se Ejecutó

**Ejecuta esta query en Supabase:**

```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'sesionestudio' 
  AND column_name IN ('material_generado', 'material_estado');
```

**Debería mostrar 2 filas:**
- `material_generado` (tipo: `jsonb`)
- `material_estado` (tipo: `character varying`)

**Si no muestra nada:**
- La migración no se ejecutó
- Ejecuta el archivo `sql/migration_agregar_material_generado.sql`

---

## 🐛 Problemas Comunes y Soluciones

### Error 429: "You exceeded your current quota"

**Causa:** No tienes créditos en OpenAI

**Solución:**
1. Ve a https://platform.openai.com/account/billing
2. Agrega método de pago
3. Recarga créditos (mínimo $5)
4. Espera 1-2 minutos para que se actualice
5. Reintenta crear un examen

---

### Error 401: "Invalid API key"

**Causa:** API key incorrecta o no configurada

**Solución:**
1. Verifica que tu `.env` tenga: `EXPO_PUBLIC_OPENAI_API_KEY=sk-tu_key`
2. Verifica que la key empiece con `sk-`
3. Reinicia el servidor de Expo: `expo start --clear`
4. Si usas Expo Go, cierra y vuelve a abrir la app

---

### Error: "Column material_estado does not exist"

**Causa:** La migración SQL no se ejecutó

**Solución:**
1. Ve a Supabase SQL Editor
2. Ejecuta el contenido de `sql/migration_agregar_material_generado.sql`
3. Verifica con la query del punto 5

---

### Material no se genera (sin errores)

**Posibles causas:**
1. La generación está en background (puede tardar 30-60 segundos)
2. Revisa los logs de la consola
3. Verifica el estado en BD (query del punto 3)

---

## 🔄 Reintentar Sesiones Fallidas

Si algunas sesiones fallaron, puedes reintentarlas manualmente.

**Ejecuta esta query para ver sesiones con error:**

```sql
SELECT 
  sesion_id,
  tema,
  material_estado
FROM sesionestudio
WHERE material_estado = 'error'
ORDER BY created_at DESC;
```

**Luego, puedo crear una función para reintentar estas sesiones automáticamente.**

---

## 📞 Información para Enviarme

Cuando me pases información, incluye:

1. ✅ Resultado de la query del punto 3 (estado de sesiones)
2. ✅ Logs de la consola cuando creas un examen
3. ✅ Resultado de la query del punto 5 (verificar migración)
4. ✅ Confirmación de que tienes créditos en OpenAI
5. ✅ Confirmación de que la API key está en `.env`

Con esta información podré diagnosticar exactamente qué está fallando.

---

## 🧪 Prueba Rápida

**Para probar si todo funciona:**

1. Crea un examen nuevo con 1 tema simple (ej: "Prueba")
2. Observa los logs en la consola
3. Espera 30-60 segundos
4. Verifica en BD que `material_estado = 'listo'`
5. Si funciona, el sistema está bien configurado ✅

---

¿Necesitas ayuda con algún paso? Pregúntame y te guío.



