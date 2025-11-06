-- =====================================================
-- VERIFICACIÓN SIMPLE DE RLS EN DISPONIBILIDAD
-- =====================================================
-- Este script te muestra solo lo esencial

-- 1. ¿RLS está habilitado?
SELECT 
  tablename as "Tabla",
  rowsecurity as "RLS Habilitado"
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'disponibilidad';

-- 2. ¿Cuántas políticas hay?
SELECT 
  COUNT(*) as "Cantidad de Políticas"
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'disponibilidad';

-- 3. Listar todas las políticas (si hay)
SELECT 
  policyname as "Nombre",
  cmd as "Operación"
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'disponibilidad'
ORDER BY cmd;

-- =====================================================
-- INTERPRETACIÓN:
-- =====================================================
-- Si "RLS Habilitado" = true pero "Cantidad de Políticas" = 0
-- → PROBLEMA: RLS está activo pero NO hay políticas, por eso falla el DELETE
--
-- Si "RLS Habilitado" = false
-- → No hay RLS, debería funcionar todo
--
-- Si "RLS Habilitado" = true y "Cantidad de Políticas" > 0
-- → Hay políticas, revisa si son correctas


