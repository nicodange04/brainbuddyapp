-- ============================================
-- QUERIES PARA ANÁLISIS DE BASE DE DATOS
-- ============================================
-- Ejecuta estas queries en Supabase SQL Editor
-- y comparte los resultados conmigo

-- ============================================
-- 1. ESTRUCTURA DE TABLA: sesionestudio
-- ============================================
-- Obtiene la estructura completa de la tabla sesionestudio
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'sesionestudio'
ORDER BY ordinal_position;

-- ============================================
-- 2. ESTRUCTURA DE TABLA: examen
-- ============================================
-- Obtiene la estructura completa de la tabla examen
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'examen'
ORDER BY ordinal_position;

-- ============================================
-- 3. ESTRUCTURA DE TABLA: material
-- ============================================
-- Obtiene la estructura completa de la tabla material
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'material'
ORDER BY ordinal_position;

-- ============================================
-- 4. ESTRUCTURA DE TABLA: materialfile
-- ============================================
-- Obtiene la estructura completa de la tabla materialfile
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'materialfile'
ORDER BY ordinal_position;

-- ============================================
-- 4.1 ESTRUCTURA DE TABLA: miniquiz
-- ============================================
-- Obtiene la estructura completa de la tabla miniquiz
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'miniquiz'
ORDER BY ordinal_position;

-- ============================================
-- 5. DATOS DE EJEMPLO: sesionestudio
-- ============================================
-- Obtiene un ejemplo de registro de sesionestudio
-- (reemplaza 'TU_SESION_ID' con un ID real si tienes datos)
SELECT *
FROM public.sesionestudio
LIMIT 1;

-- ============================================
-- 6. DATOS DE EJEMPLO: examen
-- ============================================
-- Obtiene un ejemplo de registro de examen específico
SELECT *
FROM public.examen
WHERE examen_id = '3ba5fe5d-64fb-44e1-911a-2e46b7f51147';

-- ============================================
-- 7. RELACIÓN: examen -> material -> materialfile
-- ============================================
-- Obtiene los archivos asociados a un examen
SELECT 
    e.examen_id,
    e.nombre as examen_nombre,
    e.materia,
    m.material_id,
    m.tipo as material_tipo,
    mf.file_id,
    mf.file_url,
    mf.file_name,
    mf.mimetype,
    mf.tamano_bytes
FROM public.examen e
LEFT JOIN public.material m ON m.examen_id = e.examen_id
LEFT JOIN public.materialfile mf ON mf.material_id = m.material_id
WHERE e.examen_id = '3ba5fe5d-64fb-44e1-911a-2e46b7f51147'
ORDER BY mf.created_at DESC;

-- ============================================
-- 8. VERIFICAR: Campos en sesionestudio
-- ============================================
-- Verifica campos importantes en sesionestudio
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'sesionestudio'
  AND column_name IN ('material_generado', 'quiz_generado', 'material_id', 'mini_quiz_id', 'material_estado')
ORDER BY column_name;

-- ============================================
-- 9. CONTEO DE REGISTROS
-- ============================================
-- Cuenta cuántos registros hay en cada tabla
SELECT 
    'examen' as tabla, COUNT(*) as total FROM public.examen
UNION ALL
SELECT 
    'sesionestudio' as tabla, COUNT(*) as total FROM public.sesionestudio
UNION ALL
SELECT 
    'material' as tabla, COUNT(*) as total FROM public.material
UNION ALL
SELECT 
    'materialfile' as tabla, COUNT(*) as total FROM public.materialfile
UNION ALL
SELECT 
    'miniquiz' as tabla, COUNT(*) as total FROM public.miniquiz;

-- ============================================
-- 10. EJEMPLO COMPLETO: examen con sesiones, archivos y quiz
-- ============================================
-- Obtiene un examen completo con sus sesiones, archivos y quiz
SELECT 
    e.examen_id,
    e.nombre as examen_nombre,
    e.materia,
    e.temario,
    e.fecha,
    s.sesion_id,
    s.nombre as sesion_nombre,
    s.tema,
    s.fecha as sesion_fecha,
    s.estado as sesion_estado,
    s.mini_quiz_id,
    s.observacion,
    mf.file_url,
    mf.file_name,
    mf.mimetype,
    mq.mini_quiz_id,
    mq.preguntas as quiz_preguntas,
    mq.puntaje_maximo
FROM public.examen e
LEFT JOIN public.sesionestudio s ON s.examen_id = e.examen_id
LEFT JOIN public.material m ON m.examen_id = e.examen_id
LEFT JOIN public.materialfile mf ON mf.material_id = m.material_id
LEFT JOIN public.miniquiz mq ON mq.sesion_id = s.sesion_id
WHERE e.examen_id = '3ba5fe5d-64fb-44e1-911a-2e46b7f51147'
ORDER BY s.fecha ASC;

-- ============================================
-- 11. SESIONES DE ESTUDIO DEL EXAMEN
-- ============================================
-- Obtiene todas las sesiones de estudio de un examen
SELECT 
    s.sesion_id,
    s.nombre,
    s.tema,
    s.fecha,
    s.estado,
    s.observacion,
    s.mini_quiz_id,
    s.created_at,
    s.updated_at
FROM public.sesionestudio s
WHERE s.examen_id = '3ba5fe5d-64fb-44e1-911a-2e46b7f51147'
ORDER BY s.fecha ASC;

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecuta estas queries en Supabase SQL Editor
-- 2. Comparte los resultados conmigo (especialmente queries 1, 2, 3, 4, 4.1, 8)
-- 3. Si tienes datos de ejemplo, ejecuta también las queries 5, 6, 7, 10, 11
-- 4. Con esta información podré crear el código exacto para tu BD
--
-- NOTAS IMPORTANTES:
-- - Según el ERD, sesionestudio NO tiene material_generado ni quiz_generado
-- - El quiz se guarda en miniquiz con preguntas (jsonb)
-- - Necesitaremos agregar material_generado a sesionestudio o crear una tabla separada
-- - Los archivos están en materialfile con file_url

