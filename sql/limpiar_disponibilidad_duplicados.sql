-- =====================================================
-- LIMPIAR DATOS DUPLICADOS DE DISPONIBILIDAD
-- =====================================================
-- Este script elimina registros duplicados y deja solo uno por combinación única
-- ⚠️ REEMPLAZA 'TU_USER_ID_AQUI' con tu usuario_id real

-- Paso 1: Ver cuántos registros duplicados hay
SELECT 
  alumno_id,
  dia_semana,
  turno,
  COUNT(*) as cantidad
FROM disponibilidad
GROUP BY alumno_id, dia_semana, turno
HAVING COUNT(*) > 1;

-- Paso 2: Eliminar duplicados (mantiene solo el más reciente)
-- Descomenta y ejecuta cuando estés listo:
/*
DELETE FROM disponibilidad
WHERE id NOT IN (
  SELECT DISTINCT ON (alumno_id, dia_semana, turno) id
  FROM disponibilidad
  ORDER BY alumno_id, dia_semana, turno, created_at DESC
);
*/

-- Paso 3: Para un usuario específico (más seguro)
-- Reemplaza 'TU_USER_ID_AQUI' con tu usuario_id UUID
-- Descomenta y ejecuta:
/*
DELETE FROM disponibilidad
WHERE alumno_id = 'TU_USER_ID_AQUI'
AND id NOT IN (
  SELECT DISTINCT ON (dia_semana, turno) id
  FROM disponibilidad
  WHERE alumno_id = 'TU_USER_ID_AQUI'
  ORDER BY dia_semana, turno, created_at DESC
);
*/

-- =====================================================
-- OPCIÓN ALTERNATIVA: ELIMINAR TODOS LOS REGISTROS DEL USUARIO
-- =====================================================
-- Si quieres empezar desde cero, ejecuta esto (reemplaza TU_USER_ID_AQUI):
/*
DELETE FROM disponibilidad WHERE alumno_id = 'TU_USER_ID_AQUI';
*/


