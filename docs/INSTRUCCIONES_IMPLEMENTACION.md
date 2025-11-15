# 📋 Instrucciones de Implementación: Generación de Material en Background

## ✅ Archivos Creados

1. ✅ `sql/migration_agregar_material_generado.sql` - Migración SQL para agregar campos
2. ✅ `services/materialFiles.ts` - Obtener archivos de un examen
3. ✅ `services/notifications.ts` - Sistema de notificaciones locales
4. ✅ `services/materialGeneration.ts` - Generación de material en background
5. ✅ `services/sessionDistribution.ts` - Modificado para iniciar generación en background
6. ✅ `package.json` - Agregado `expo-notifications`
7. ✅ `app.json` - Configurado plugin de notificaciones

---

## 🚀 Pasos para Implementar

### Paso 1: Ejecutar Migración SQL

**Ejecuta en Supabase SQL Editor:**

```sql
-- Archivo: sql/migration_agregar_material_generado.sql
```

Esto agregará los campos:
- `material_generado` (JSONB) - Para guardar contenido teórico
- `material_estado` (VARCHAR) - Para trackear estado de generación

---

### Paso 2: Instalar Dependencias

**Ejecuta en terminal:**

```bash
npm install
# o
yarn install
```

Esto instalará `expo-notifications` que agregamos al `package.json`.

---

### Paso 3: Rebuild de la App

**Después de instalar dependencias, necesitas rebuild:**

```bash
# Para iOS
npx expo prebuild --clean
# o
npx expo run:ios

# Para Android
npx expo prebuild --clean
# o
npx expo run:android
```

**⚠️ IMPORTANTE:** Los plugins de Expo (como `expo-notifications`) requieren rebuild nativo.

---

### Paso 4: Verificar Configuración

**Verifica que `app.json` tenga el plugin de notificaciones:**

```json
"plugins": [
  "expo-router",
  [
    "expo-notifications",
    {
      "icon": "./assets/images/icon.png",
      "color": "#8B5CF6",
      "sounds": []
    }
  ]
]
```

---

## 🔄 Flujo de Funcionamiento

### Cuando se crea un examen:

1. **Usuario crea examen** → `app/crear-examen.tsx`
2. **Se crean sesiones** → `services/sessionDistribution.ts`
3. **Se inicia generación en background** → `services/materialGeneration.ts`
4. **Para cada sesión:**
   - Genera contenido teórico con OpenAI
   - Genera quiz con OpenAI
   - Guarda en BD (`material_generado` y `miniquiz`)
   - Actualiza estado a 'listo'
   - Envía notificación local

### Reintentos Automáticos:

- **Máximo 3 intentos** por sesión
- **5 segundos** entre intentos
- Si falla 3 veces → marca como 'error' y notifica

---

## 🧪 Testing

### Casos de Prueba:

1. ✅ **Crear examen con 3 temas**
   - Verificar que se creen 3 sesiones
   - Verificar que se inicie generación en background
   - Verificar que NO bloquee la creación del examen

2. ✅ **Verificar generación de material**
   - Esperar 30-60 segundos
   - Verificar que `material_estado` cambie a 'listo'
   - Verificar que `material_generado` tenga contenido
   - Verificar que se cree registro en `miniquiz`

3. ✅ **Verificar notificaciones**
   - Verificar que llegue notificación cuando termine
   - Verificar permisos de notificaciones

4. ✅ **Verificar reintentos**
   - Simular error (desconectar internet)
   - Verificar que reintente automáticamente
   - Verificar que no se genere loop infinito

---

## 📝 Notas Importantes

### ⚠️ Campos Requeridos en BD:

Asegúrate de que `sesionestudio` tenga:
- `material_generado` (JSONB) - NULL por defecto
- `material_estado` (VARCHAR) - 'pendiente' por defecto

### ⚠️ Permisos de Notificaciones:

- iOS: Requiere permisos explícitos
- Android: Requiere canal de notificaciones (ya configurado)

### ⚠️ Rebuild Necesario:

Después de agregar `expo-notifications`, necesitas rebuild nativo.

---

## 🐛 Troubleshooting

### Error: "Column material_estado does not exist"

**Solución:** Ejecuta la migración SQL primero.

### Error: "Notifications not working"

**Solución:** 
1. Verifica permisos en configuración del dispositivo
2. Verifica que se haya hecho rebuild después de instalar dependencias

### Error: "Material not generating"

**Solución:**
1. Verifica logs en consola
2. Verifica que OpenAI API key esté configurada
3. Verifica conexión a internet

---

## 📊 Monitoreo

### Logs a Revisar:

- `🚀 Iniciando generación de material en background...`
- `📝 Generando contenido teórico...`
- `🎯 Generando quiz...`
- `✅ Material generado exitosamente...`
- `❌ Error al generar material...`

### Estados en BD:

- `pendiente` - Aún no se ha generado
- `generando` - Actualmente generándose
- `listo` - Material generado exitosamente
- `error` - Falló después de 3 intentos

---

## ✅ Checklist Final

- [ ] Ejecutar migración SQL
- [ ] Instalar dependencias (`npm install`)
- [ ] Rebuild de la app (`npx expo prebuild --clean`)
- [ ] Verificar que `app.json` tenga plugin de notificaciones
- [ ] Probar crear examen y verificar generación en background
- [ ] Verificar notificaciones locales
- [ ] Verificar reintentos automáticos

---

## 🎉 Listo!

Una vez completados estos pasos, la generación de material en background debería funcionar correctamente.




