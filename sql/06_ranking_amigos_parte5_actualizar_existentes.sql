-- =====================================================
-- PARTE 5: ACTUALIZAR CÓDIGOS PARA ALUMNOS EXISTENTES
-- =====================================================
-- Ejecuta esta parte ÚLTIMO, después de todas las anteriores
-- Genera códigos de amistad para alumnos que ya existen en la base de datos

UPDATE public.alumno
SET codigo_amistad = public.generar_codigo_amistad()
WHERE codigo_amistad IS NULL OR codigo_amistad = '';

-- VERIFICACIÓN: Ejecuta esto después para verificar
-- SELECT usuario_id, nombre, codigo_amistad FROM alumno LIMIT 10;
-- Verifica que todos los alumnos tengan un código de amistad

