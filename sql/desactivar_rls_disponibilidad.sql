-- =====================================================
-- DESACTIVAR RLS Y ELIMINAR POLÍTICAS DE DISPONIBILIDAD
-- =====================================================
-- ⚠️ ADVERTENCIA: Esto desactiva toda la seguridad RLS
-- Solo úsalo si necesitas debuggear o si no tienes políticas configuradas

-- Paso 1: Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "alumnos_can_view_own_availability" ON public.disponibilidad;
DROP POLICY IF EXISTS "alumnos_can_insert_own_availability" ON public.disponibilidad;
DROP POLICY IF EXISTS "alumnos_can_update_own_availability" ON public.disponibilidad;
DROP POLICY IF EXISTS "alumnos_can_delete_own_availability" ON public.disponibilidad;

-- Paso 2: DESACTIVAR RLS (solo si quieres desactivarlo completamente)
-- Descomenta la siguiente línea si quieres desactivar RLS:
-- ALTER TABLE public.disponibilidad DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- OPCIONES ALTERNATIVAS:
-- =====================================================

-- Opción A: Solo eliminar políticas pero mantener RLS habilitado
-- (después necesitarás crear nuevas políticas)
-- Ejecuta solo los DROP POLICY de arriba

-- Opción B: Desactivar RLS completamente
-- (descomenta la línea ALTER TABLE de arriba)
-- ⚠️ Esto permite que cualquier usuario autenticado pueda ver/modificar cualquier disponibilidad

-- Opción C: Crear políticas permisivas temporales (para debug)
-- Descomenta el siguiente bloque:

/*
-- Políticas temporales muy permisivas (solo para debug)
CREATE POLICY "temp_allow_all_select" ON public.disponibilidad
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "temp_allow_all_insert" ON public.disponibilidad
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "temp_allow_all_update" ON public.disponibilidad
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "temp_allow_all_delete" ON public.disponibilidad
  FOR DELETE USING (auth.uid() IS NOT NULL);
*/

-- =====================================================
-- DESPUÉS DE DESACTIVAR:
-- =====================================================
-- 1. Ejecuta el script de verificación: verificar_rls_disponibilidad.sql
-- 2. Prueba la aplicación
-- 3. Si funciona, crea las políticas correctas usando: 02_disponibilidad_rls.sql


