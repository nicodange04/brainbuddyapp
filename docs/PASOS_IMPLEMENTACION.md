# 🚀 Pasos para Implementar Generación de Material en Background

## ✅ Checklist de Implementación

### Paso 1: Ejecutar Migración SQL (OBLIGATORIO)

**Ejecuta en Supabase SQL Editor:**

1. Abre Supabase Dashboard
2. Ve a SQL Editor
3. Copia y pega el contenido de `sql/migration_agregar_material_generado.sql`
4. Ejecuta la query
5. Verifica que no haya errores

**¿Qué hace?**
- Agrega campo `material_generado` (JSONB) a `sesionestudio`
- Agrega campo `material_estado` (VARCHAR) a `sesionestudio`
- Crea índice para búsquedas rápidas
- Marca sesiones existentes como 'pendiente'

**✅ Verificación:**
Ejecuta esta query para verificar:
```sql
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'sesionestudio' 
  AND column_name IN ('material_generado', 'material_estado');
```

Deberías ver 2 filas con los nuevos campos.

---

### Paso 2: Instalar Dependencias

**Ejecuta en terminal:**

```bash
npm install
```

Esto instalará:
- `expo-notifications` (para notificaciones locales)
- `openai` (si no está instalado)

**✅ Verificación:**
Verifica que `package.json` tenga:
- `"expo-notifications": "~14.0.0"`
- `"openai"` (si no está, ejecuta `npm install openai`)

---

### Paso 3: Configurar API Key de OpenAI

**Crea o edita archivo `.env` en la raíz del proyecto:**

```env
EXPO_PUBLIC_OPENAI_API_KEY=tu_api_key_aqui
```

**¿Cómo obtener la API key?**
1. Ve a https://platform.openai.com/api-keys
2. Crea una nueva API key
3. Cópiala y pégala en `.env`

**⚠️ IMPORTANTE:**
- NO subas el archivo `.env` a Git
- Asegúrate de que esté en `.gitignore`

**✅ Verificación:**
Verifica que el archivo `.env` exista y tenga la API key.

---

### Paso 4: Rebuild de la App (OBLIGATORIO)

**Después de instalar `expo-notifications`, necesitas rebuild nativo:**

```bash
# Opción 1: Prebuild limpio (recomendado)
npx expo prebuild --clean

# Opción 2: Rebuild directo
# Para iOS
npx expo run:ios

# Para Android
npx expo run:android
```

**⚠️ IMPORTANTE:**
- Los plugins de Expo (como `expo-notifications`) requieren rebuild nativo
- No funcionará solo con `expo start` después de agregar el plugin

**✅ Verificación:**
Después del rebuild, la app debería iniciar normalmente.

---

### Paso 5: Verificar Configuración

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

**✅ Verificación:**
Abre `app.json` y verifica que el plugin esté configurado.

---

### Paso 6: Probar la Implementación

**1. Crear un examen de prueba:**

- Abre la app
- Ve a "Agregar Examen"
- Crea un examen con 2-3 temas (ej: "Tema 1", "Tema 2", "Tema 3")
- Completa el wizard y crea el examen

**2. Verificar logs en consola:**

Deberías ver:
```
✅ Examen creado exitosamente
✅ X sesiones de estudio creadas automáticamente
🚀 Iniciando generación de material en background para X sesión(es)...
```

**3. Esperar 30-60 segundos:**

- El material se está generando en background
- NO debería bloquear la app
- Puedes seguir usando la app normalmente

**4. Verificar notificación:**

- Deberías recibir una notificación local cuando termine
- Título: "📚 Material generado"
- Cuerpo: "El material para [Tema] está listo para estudiar"

**5. Verificar en Base de Datos:**

Ejecuta esta query en Supabase:
```sql
SELECT 
  sesion_id,
  tema,
  material_estado,
  material_generado IS NOT NULL as tiene_material,
  mini_quiz_id IS NOT NULL as tiene_quiz
FROM sesionestudio
WHERE examen_id = 'TU_EXAMEN_ID'
ORDER BY fecha ASC;
```

Deberías ver:
- `material_estado` = 'listo'
- `tiene_material` = true
- `tiene_quiz` = true

---

## 🐛 Troubleshooting

### Error: "Column material_estado does not exist"

**Solución:** Ejecuta la migración SQL (Paso 1)

### Error: "Notifications not working"

**Solución:**
1. Verifica permisos en configuración del dispositivo
2. Verifica que se haya hecho rebuild después de instalar dependencias
3. Verifica que `app.json` tenga el plugin de notificaciones

### Error: "OpenAI API key not found"

**Solución:**
1. Verifica que el archivo `.env` exista
2. Verifica que tenga `EXPO_PUBLIC_OPENAI_API_KEY=tu_key`
3. Reinicia el servidor de Expo (`expo start --clear`)

### Error: "Material not generating"

**Solución:**
1. Verifica logs en consola
2. Verifica que OpenAI API key sea válida
3. Verifica conexión a internet
4. Verifica que no haya errores en `services/materialGeneration.ts`

---

## ✅ Checklist Final

- [ ] Paso 1: Migración SQL ejecutada
- [ ] Paso 2: Dependencias instaladas
- [ ] Paso 3: API key de OpenAI configurada
- [ ] Paso 4: Rebuild de la app completado
- [ ] Paso 5: Configuración verificada
- [ ] Paso 6: Prueba exitosa

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, la generación de material en background debería funcionar correctamente.

**¿Necesitas ayuda con algún paso?** Pregúntame y te ayudo.




