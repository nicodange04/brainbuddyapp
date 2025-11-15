# Plan de Implementación: Generación de Material en Background

## 📋 Resumen

Implementar generación de material teórico y quiz en background cuando se crean las sesiones de estudio, con:
- ✅ Generación en background (no bloquea al usuario)
- ✅ Reintentos automáticos (máximo 3 intentos, sin loops infinitos)
- ✅ Notificaciones locales cuando termine
- ✅ Cache inteligente (verificar si material ya existe antes de generar)

---

## 🔄 Flujo Actual vs Nuevo

### Flujo Actual:
```
1. Crear examen (con temas)
2. Crear sesiones de estudio (distribuir temas)
3. ❌ NO se genera material
```

### Flujo Nuevo:
```
1. Crear examen (con temas)
2. Crear sesiones de estudio (distribuir temas)
3. ✅ Iniciar generación de material en background (para cada sesión)
4. ✅ Notificar cuando termine
```

---

## 📦 Archivos a Crear/Modificar

### Nuevos Archivos:
1. `services/materialFiles.ts` - Obtener archivos de un examen
2. `services/materialGeneration.ts` - Generar material en background
3. `services/notifications.ts` - Notificaciones locales

### Archivos a Modificar:
1. `services/sessionDistribution.ts` - Iniciar generación en background
2. `package.json` - Agregar `expo-notifications`
3. `app.json` - Configurar permisos de notificaciones

---

## 🗄️ Cambios en Base de Datos

### Si NO existen los campos:
```sql
ALTER TABLE public.sesionestudio
ADD COLUMN IF NOT EXISTS material_generado JSONB,
ADD COLUMN IF NOT EXISTS quiz_generado JSONB,
ADD COLUMN IF NOT EXISTS material_estado VARCHAR(20) DEFAULT 'pendiente' 
  CHECK (material_estado IN ('pendiente', 'generando', 'listo', 'error'));
```

### Índice para búsquedas:
```sql
CREATE INDEX IF NOT EXISTS idx_sesionestudio_material_estado 
ON public.sesionestudio(material_estado);
```

---

## 📝 Paso a Paso de Implementación

### Paso 1: Instalar Dependencias
```bash
npx expo install expo-notifications
```

### Paso 2: Crear `services/materialFiles.ts`
- Función para obtener archivos de un examen
- Consultar tablas `material` y `materialfile`
- Retornar URLs de archivos

### Paso 3: Crear `services/notifications.ts`
- Configurar permisos de notificaciones
- Función para enviar notificación local
- Notificar cuando termine la generación

### Paso 4: Crear `services/materialGeneration.ts`
- Función para generar material de una sesión
- Reintentos automáticos (máximo 3 intentos)
- Actualizar estado en BD
- Notificar cuando termine

### Paso 5: Modificar `services/sessionDistribution.ts`
- Después de crear sesiones, iniciar generación en background
- No bloquear el flujo principal
- Manejar errores silenciosamente

### Paso 6: Configurar `app.json`
- Agregar plugin de notificaciones
- Configurar permisos iOS/Android

---

## 🔧 Detalles Técnicos

### Reintentos:
- Máximo 3 intentos por sesión
- Esperar 5 segundos entre intentos
- Si falla 3 veces, marcar como 'error' y notificar

### Estados del Material:
- `pendiente`: Aún no se ha generado
- `generando`: Actualmente generándose
- `listo`: Material generado exitosamente
- `error`: Falló después de 3 intentos

### Notificaciones:
- Título: "Material generado"
- Cuerpo: "El material para [Tema] está listo"
- Solo si la generación fue exitosa

---

## ✅ Checklist de Implementación

- [ ] Ejecutar queries SQL para agregar campos (si no existen)
- [ ] Instalar `expo-notifications`
- [ ] Crear `services/materialFiles.ts`
- [ ] Crear `services/notifications.ts`
- [ ] Crear `services/materialGeneration.ts`
- [ ] Modificar `services/sessionDistribution.ts`
- [ ] Configurar `app.json`
- [ ] Probar generación en background
- [ ] Probar notificaciones locales
- [ ] Probar reintentos automáticos

---

## 🧪 Testing

### Casos de Prueba:
1. ✅ Crear examen con 3 temas → Verificar que se generen 3 sesiones
2. ✅ Verificar que se inicie generación en background
3. ✅ Verificar notificación cuando termine
4. ✅ Verificar reintentos si falla
5. ✅ Verificar que no se genere material duplicado

---

## 📌 Notas Importantes

- La generación NO debe bloquear la creación del examen
- Si falla la generación, el usuario puede iniciar la sesión sin material (mostrar mensaje)
- Los reintentos son automáticos pero limitados (máximo 3)
- Las notificaciones solo se envían si la generación fue exitosa




