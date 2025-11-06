-- =====================================================
-- VERIFICAR ESTADO DE RLS Y POLÍTICAS EN DISPONIBILIDAD
-- =====================================================
-- Este script te muestra el estado actual de RLS y políticas

-- 1. Verificar si RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Habilitado"
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'disponibilidad';

-- 2. Ver todas las políticas existentes en la tabla disponibilidad
SELECT 
  schemaname,
  tablename,
  policyname as "Nombre de Política",
  cmd as "Operación",
  qual as "USING (condición)",
  with_check as "WITH CHECK (condición)"
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'disponibilidad'
ORDER BY cmd, policyname;

-- 3. Verificar permisos de la tabla
SELECT 
  grantee as "Usuario/Rol",
  privilege_type as "Permiso"
FROM information_schema.role_table_grants
WHERE table_schema = 'public' 
  AND table_name = 'disponibilidad';

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- Consulta 1: Si RLS está habilitado, verás "RLS Habilitado: true"
-- Consulta 2: Si hay políticas, las verás listadas con sus operaciones (SELECT, INSERT, UPDATE, DELETE)
--            Si no hay políticas, la consulta no devolverá filas (vacío)
-- Consulta 3: Muestra los permisos de la tabla

-- INTERPRETACIÓN DE RESULTADOS:
-- ✅ Si RLS está habilitado Y hay políticas → Todo está configurado correctamente
-- ⚠️ Si RLS está habilitado PERO NO hay políticas → Necesitas crear políticas (problema común)
-- ❌ Si RLS está deshabilitado → No hay seguridad a nivel de filas

