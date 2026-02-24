# 🧹 Cómo Limpiar Todos los Datos del Proyecto

Esta guía te muestra cómo eliminar todos los datos de la base de datos manteniendo las tablas intactas.

## ⚠️ ADVERTENCIA

**Este proceso eliminará TODOS los datos:**
- ✅ Las tablas se mantendrán (estructura intacta)
- ❌ Todos los registros se eliminarán (usuarios, exámenes, sesiones, etc.)
- ❌ **Esta acción NO se puede deshacer**

## 📋 Opciones Disponibles

### Opción 1: SQL Editor de Supabase (Recomendado) ⭐

**La forma más segura y fácil:**

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor** (menú lateral)
4. Abre el archivo `sql/limpiar_datos.sql`
5. Copia todo el contenido
6. Pégalo en el SQL Editor
7. Haz clic en **Run** (o presiona `Ctrl+Enter`)
8. Confirma que todas las tablas quedaron vacías

**Ventajas:**
- ✅ Más seguro
- ✅ Puedes ver el SQL antes de ejecutarlo
- ✅ Validación de sintaxis
- ✅ Muestra errores claros

---

### Opción 2: Script TypeScript

**Para ejecutar desde la terminal:**

```bash
npm run limpiar-datos
```

El script te pedirá confirmación escribiendo "SI" antes de proceder.

**Nota:** Este script requiere que tengas configuradas las variables de entorno en `.env`.

---

## 📊 Qué se Elimina

El script elimina datos de estas tablas (en este orden):

1. **Tablas dependientes:**
   - `quiz_attempt` - Intentos de quiz
   - `mini_quiz` - Quizzes
   - `sesion_estudio` - Sesiones de estudio
   - `reporte_detallado` - Reportes detallados
   - `reporte_general` - Reportes generales
   - `avatar_trofeo` - Trofeos obtenidos
   - `padre_alumno` - Vinculaciones padre-hijo
   - `disponibilidad` - Horarios disponibles
   - `examen` - Exámenes creados

2. **Tablas principales:**
   - `alumno` - Datos de alumnos
   - `padre` - Datos de padres
   - `usuarios` - Usuarios del sistema

---

## ✅ Verificación

Después de ejecutar el script, verifica que las tablas están vacías:

```sql
SELECT 'usuarios' as tabla, COUNT(*) as filas FROM usuarios
UNION ALL
SELECT 'alumno', COUNT(*) FROM alumno
UNION ALL
SELECT 'padre', COUNT(*) FROM padre
UNION ALL
SELECT 'examen', COUNT(*) FROM examen;
```

Todas deberían mostrar `0` filas.

---

## 🔄 Después de Limpiar

Una vez limpiados los datos:

1. ✅ Las tablas siguen existiendo
2. ✅ Puedes crear nuevos usuarios desde cero
3. ✅ La estructura de la base de datos se mantiene
4. ✅ Índices y relaciones se conservan

---

## 💡 Consejos

- **Haz un backup antes:** Si tienes datos importantes, exporta las tablas antes de limpiar
- **Prueba primero:** Si no estás seguro, prueba en un proyecto de desarrollo
- **Verifica después:** Siempre verifica que las tablas quedaron vacías

---

## ❓ Preguntas Frecuentes

**P: ¿Se eliminan también los usuarios de Supabase Auth?**
R: No, solo se eliminan los registros de la tabla `usuarios`. Los usuarios de Supabase Auth se mantienen.

**P: ¿Puedo recuperar los datos después?**
R: No, esta acción es permanente. Si necesitas los datos, haz un backup antes.

**P: ¿Qué pasa con los archivos subidos?**
R: Los archivos en Supabase Storage no se eliminan. Solo se eliminan las referencias en la base de datos.

---

## 🚀 Próximos Pasos

Después de limpiar:
1. Crea nuevos usuarios de prueba
2. Crea exámenes de ejemplo
3. Prueba el flujo completo de la aplicación
