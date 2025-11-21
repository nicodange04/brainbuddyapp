# Instrucciones para Ejecutar el SQL de Ranking de Amigos

## 📋 Orden de Ejecución

Ejecuta los archivos SQL en este orden exacto:

### 1️⃣ **PARTE 1: Columna codigo_amistad**
📁 Archivo: `06_ranking_amigos_parte1_columna.sql`
- ✅ Agrega la columna `codigo_amistad` a la tabla `alumno`
- ✅ Crea el índice para búsquedas rápidas
- ⏱️ Tiempo estimado: < 1 segundo

**Verificación después:**
```sql
SELECT codigo_amistad FROM alumno LIMIT 5;
```

---

### 2️⃣ **PARTE 2: Tabla alumno_amigo**
📁 Archivo: `06_ranking_amigos_parte2_tabla.sql`
- ✅ Crea la tabla `alumno_amigo` para relaciones de amistad
- ✅ Crea todos los índices necesarios
- ⏱️ Tiempo estimado: < 1 segundo

**Verificación después:**
```sql
SELECT * FROM alumno_amigo LIMIT 1;
SELECT COUNT(*) FROM alumno_amigo;
```

---

### 3️⃣ **PARTE 3: Funciones SQL**
📁 Archivo: `06_ranking_amigos_parte3_funciones.sql`
- ✅ Crea función `calcular_puntos_totales_alumno()`
- ✅ Crea función `get_ranking_amigos()`
- ✅ Crea función `get_posicion_ranking_amigos()`
- ⏱️ Tiempo estimado: < 2 segundos

**Verificación después:**
```sql
-- Reemplaza 'tu-usuario-id' con un ID real de alumno
SELECT calcular_puntos_totales_alumno('tu-usuario-id');
SELECT * FROM get_ranking_amigos('tu-usuario-id', 10);
SELECT get_posicion_ranking_amigos('tu-usuario-id');
```

---

### 4️⃣ **PARTE 4: Trigger automático**
📁 Archivo: `06_ranking_amigos_parte4_trigger.sql`
- ✅ Crea función `generar_codigo_amistad()`
- ✅ Crea función del trigger
- ✅ Crea el trigger en la tabla `alumno`
- ⏱️ Tiempo estimado: < 1 segundo

**Verificación después:**
```sql
SELECT codigo_amistad FROM alumno LIMIT 5;
```

---

### 5️⃣ **PARTE 5: Actualizar alumnos existentes**
📁 Archivo: `06_ranking_amigos_parte5_actualizar_existentes.sql`
- ✅ Genera códigos de amistad para todos los alumnos existentes
- ⏱️ Tiempo estimado: Depende de cuántos alumnos tengas (1-5 segundos)

**Verificación después:**
```sql
SELECT usuario_id, nombre, codigo_amistad FROM alumno LIMIT 10;
-- Verifica que todos tengan un código
SELECT COUNT(*) as total, COUNT(codigo_amistad) as con_codigo FROM alumno;
-- Ambos números deben ser iguales
```

---

## ⚠️ Si algo falla

### Error en Parte 1:
- Verifica que la tabla `alumno` existe
- Verifica que no hay una columna `codigo_amistad` ya creada

### Error en Parte 2:
- Verifica que la tabla `usuarios` existe
- Verifica que no hay una tabla `alumno_amigo` ya creada

### Error en Parte 3:
- Verifica que las tablas `sesionestudio` y `examen` existen
- Verifica que las columnas `puntaje_obtenido` y `estado` existen en `sesionestudio`

### Error en Parte 4:
- Verifica que la Parte 1 se ejecutó correctamente
- Verifica que la función `generar_codigo_amistad()` se creó

### Error en Parte 5:
- Verifica que la Parte 4 se ejecutó correctamente
- Verifica que hay alumnos en la tabla `alumno`

---

## ✅ Verificación Final Completa

Después de ejecutar todas las partes, ejecuta esto para verificar que todo está bien:

```sql
-- 1. Verificar columna
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'alumno' AND column_name = 'codigo_amistad';

-- 2. Verificar tabla
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'alumno_amigo';

-- 3. Verificar funciones
SELECT proname 
FROM pg_proc 
WHERE proname IN ('calcular_puntos_totales_alumno', 'get_ranking_amigos', 'get_posicion_ranking_amigos', 'generar_codigo_amistad');

-- 4. Verificar trigger
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_alumno_generar_codigo_amistad';

-- 5. Verificar códigos generados
SELECT COUNT(*) as total_alumnos, 
       COUNT(codigo_amistad) as con_codigo,
       COUNT(DISTINCT codigo_amistad) as codigos_unicos
FROM alumno;
```

Todos los checks deben devolver resultados positivos. ✅

