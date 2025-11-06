-- =====================================================
-- RLS PARA TABLA DISPONIBILIDAD - BRAIN BUDDY
-- =====================================================
-- Políticas de seguridad específicas para la tabla disponibilidad
-- Permite que los alumnos gestionen su propia disponibilidad horaria

-- =====================================================
-- 1. HABILITAR RLS EN TABLA DISPONIBILIDAD
-- =====================================================

ALTER TABLE public.disponibilidad ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. POLÍTICAS PARA SELECT (LECTURA)
-- =====================================================

-- Política: Alumnos pueden ver su propia disponibilidad
DROP POLICY IF EXISTS "alumnos_can_view_own_availability" ON public.disponibilidad;
CREATE POLICY "alumnos_can_view_own_availability" ON public.disponibilidad
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND alumno_id::text = auth.uid()::text
  );

-- =====================================================
-- 3. POLÍTICAS PARA INSERT (CREACIÓN)
-- =====================================================

-- Política: Alumnos pueden insertar su propia disponibilidad
DROP POLICY IF EXISTS "alumnos_can_insert_own_availability" ON public.disponibilidad;
CREATE POLICY "alumnos_can_insert_own_availability" ON public.disponibilidad
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND alumno_id::text = auth.uid()::text
  );

-- =====================================================
-- 4. POLÍTICAS PARA UPDATE (ACTUALIZACIÓN)
-- =====================================================

-- Política: Alumnos pueden actualizar su propia disponibilidad
DROP POLICY IF EXISTS "alumnos_can_update_own_availability" ON public.disponibilidad;
CREATE POLICY "alumnos_can_update_own_availability" ON public.disponibilidad
  FOR UPDATE USING (
    auth.uid() IS NOT NULL 
    AND alumno_id::text = auth.uid()::text
  );

-- =====================================================
-- 5. POLÍTICAS PARA DELETE (ELIMINACIÓN)
-- =====================================================

-- Política: Alumnos pueden eliminar su propia disponibilidad
DROP POLICY IF EXISTS "alumnos_can_delete_own_availability" ON public.disponibilidad;
CREATE POLICY "alumnos_can_delete_own_availability" ON public.disponibilidad
  FOR DELETE USING (
    auth.uid() IS NOT NULL 
    AND alumno_id::text = auth.uid()::text
  );

-- =====================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================

COMMENT ON POLICY "alumnos_can_view_own_availability" ON public.disponibilidad IS 
  'Permite que los alumnos vean su propia disponibilidad horaria';

COMMENT ON POLICY "alumnos_can_insert_own_availability" ON public.disponibilidad IS 
  'Permite que los alumnos inserten su propia disponibilidad horaria';

COMMENT ON POLICY "alumnos_can_update_own_availability" ON public.disponibilidad IS 
  'Permite que los alumnos actualicen su propia disponibilidad horaria';

COMMENT ON POLICY "alumnos_can_delete_own_availability" ON public.disponibilidad IS 
  'Permite que los alumnos eliminen su propia disponibilidad horaria';

-- =====================================================
-- VERIFICACIÓN DE POLÍTICAS IMPLEMENTADAS
-- =====================================================

-- Función para verificar políticas de disponibilidad
CREATE OR REPLACE FUNCTION verificar_politicas_disponibilidad()
RETURNS TABLE(
  operacion TEXT,
  politica TEXT,
  estado TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cmd as operacion,
    polname as politica,
    CASE 
      WHEN cmd = 'SELECT' AND polname = 'alumnos_can_view_own_availability' THEN '✅ Activa'
      WHEN cmd = 'INSERT' AND polname = 'alumnos_can_insert_own_availability' THEN '✅ Activa'
      WHEN cmd = 'UPDATE' AND polname = 'alumnos_can_update_own_availability' THEN '✅ Activa'
      WHEN cmd = 'DELETE' AND polname = 'alumnos_can_delete_own_availability' THEN '✅ Activa'
      ELSE '❌ No encontrada'
    END as estado
  FROM pg_policies
  WHERE schemaname = 'public' 
    AND tablename = 'disponibilidad'
  ORDER BY cmd, polname;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================

/*
POLÍTICAS RLS IMPLEMENTADAS PARA DISPONIBILIDAD:

SELECT (Lectura):
- ✅ Alumnos pueden ver su propia disponibilidad

INSERT (Creación):
- ✅ Alumnos pueden insertar su propia disponibilidad

UPDATE (Actualización):
- ✅ Alumnos pueden actualizar su propia disponibilidad

DELETE (Eliminación):
- ✅ Alumnos pueden eliminar su propia disponibilidad

VERIFICACIÓN:
SELECT * FROM verificar_politicas_disponibilidad();

NOTA IMPORTANTE:
Las políticas usan auth.uid() para verificar que el usuario autenticado
coincida con el alumno_id del registro. Esto asegura que cada alumno
solo pueda gestionar su propia disponibilidad.
*/

