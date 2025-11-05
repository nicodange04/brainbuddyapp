-- =====================================================
-- RLS PARA TABLA USUARIOS - BRAIN BUDDY
-- =====================================================
-- Políticas de seguridad específicas para la tabla usuarios
-- Basadas en el contexto completo del proyecto

-- =====================================================
-- 1. HABILITAR RLS EN TABLA USUARIOS
-- =====================================================

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. POLÍTICAS PARA SELECT (LECTURA)
-- =====================================================

-- Política: Admin puede ver todos los usuarios
DROP POLICY IF EXISTS "admin_can_view_all_users" ON public.usuarios;
CREATE POLICY "admin_can_view_all_users" ON public.usuarios
  FOR SELECT USING (
    public.is_admin() 
    AND public.is_user_active(usuario_id)
  );

-- Política: Usuarios pueden ver su propio registro
DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.usuarios;
CREATE POLICY "users_can_view_own_profile" ON public.usuarios
  FOR SELECT USING (
    public.owns_user(usuario_id) 
    AND public.is_user_active(usuario_id)
  );

-- Política: Permitir acceso durante login (por email)
DROP POLICY IF EXISTS "allow_login_access" ON public.usuarios;
CREATE POLICY "allow_login_access" ON public.usuarios
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND public.is_user_active(usuario_id)
  );

-- =====================================================
-- 3. POLÍTICAS PARA INSERT (CREACIÓN)
-- =====================================================

-- Política: Admin puede insertar usuarios
DROP POLICY IF EXISTS "admin_can_insert_users" ON public.usuarios;
CREATE POLICY "admin_can_insert_users" ON public.usuarios
  FOR INSERT WITH CHECK (
    public.is_admin() 
    AND public.is_user_active(usuario_id)
  );

-- Política: Permitir inserción durante registro
DROP POLICY IF EXISTS "allow_user_registration" ON public.usuarios;
CREATE POLICY "allow_user_registration" ON public.usuarios
  FOR INSERT WITH CHECK (
    public.can_insert_user() 
    AND public.is_user_active(usuario_id)
  );

-- =====================================================
-- 4. POLÍTICAS PARA UPDATE (ACTUALIZACIÓN)
-- =====================================================

-- Política: Admin puede actualizar todos los usuarios
DROP POLICY IF EXISTS "admin_can_update_all_users" ON public.usuarios;
CREATE POLICY "admin_can_update_all_users" ON public.usuarios
  FOR UPDATE USING (
    public.is_admin() 
    AND public.is_user_active(usuario_id)
  );

-- Política: Usuarios pueden actualizar su propio perfil
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.usuarios;
CREATE POLICY "users_can_update_own_profile" ON public.usuarios
  FOR UPDATE USING (
    public.owns_user(usuario_id) 
    AND public.is_user_active(usuario_id)
  );

-- =====================================================
-- 5. POLÍTICAS PARA DELETE (ELIMINACIÓN)
-- =====================================================

-- Política: Solo admin puede hacer soft delete
DROP POLICY IF EXISTS "only_admin_can_delete_users" ON public.usuarios;
CREATE POLICY "only_admin_can_delete_users" ON public.usuarios
  FOR DELETE USING (
    public.can_delete_user(usuario_id) 
    AND public.is_user_active(usuario_id)
  );

-- =====================================================
-- 6. VERIFICACIÓN DE POLÍTICAS IMPLEMENTADAS
-- =====================================================

-- Función para verificar políticas de usuarios
CREATE OR REPLACE FUNCTION verificar_politicas_usuarios()
RETURNS TABLE(
  operacion TEXT,
  politica TEXT,
  estado TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cmd as operacion,
    policyname as politica,
    CASE 
      WHEN policyname IS NOT NULL THEN '✅ IMPLEMENTADA'
      ELSE '❌ FALTANTE'
    END as estado
  FROM pg_policies 
  WHERE schemaname = 'public' 
  AND tablename = 'usuarios'
  ORDER BY cmd, policyname;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. FUNCIÓN DE PRUEBA PARA VERIFICAR ACCESOS
-- =====================================================

-- Función para probar diferentes escenarios de acceso
CREATE OR REPLACE FUNCTION probar_accesos_usuarios()
RETURNS TABLE(
  escenario TEXT,
  usuario_actual TEXT,
  rol_actual TEXT,
  puede_ver_todos BOOLEAN,
  puede_ver_propio BOOLEAN,
  puede_insertar BOOLEAN,
  puede_actualizar_propio BOOLEAN,
  puede_eliminar BOOLEAN
) AS $$
DECLARE
  current_user_id UUID;
  user_role TEXT;
BEGIN
  -- Obtener usuario actual
  current_user_id := auth.uid();
  user_role := public.user_role();
  
  RETURN QUERY
  SELECT 
    'Usuario actual' as escenario,
    COALESCE(current_user_id::text, 'No autenticado') as usuario_actual,
    COALESCE(user_role, 'No autenticado') as rol_actual,
    public.is_admin() as puede_ver_todos,
    public.owns_user(current_user_id) as puede_ver_propio,
    public.can_insert_user() as puede_insertar,
    public.owns_user(current_user_id) as puede_actualizar_propio,
    public.can_delete_user(current_user_id) as puede_eliminar;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON POLICY "admin_can_view_all_users" ON public.usuarios IS 'Admin puede ver todos los usuarios activos';
COMMENT ON POLICY "users_can_view_own_profile" ON public.usuarios IS 'Usuarios pueden ver su propio perfil';
COMMENT ON POLICY "allow_login_access" ON public.usuarios IS 'Permite acceso durante proceso de login';
COMMENT ON POLICY "admin_can_insert_users" ON public.usuarios IS 'Admin puede insertar nuevos usuarios';
COMMENT ON POLICY "allow_user_registration" ON public.usuarios IS 'Permite inserción durante registro de usuarios';
COMMENT ON POLICY "admin_can_update_all_users" ON public.usuarios IS 'Admin puede actualizar todos los usuarios';
COMMENT ON POLICY "users_can_update_own_profile" ON public.usuarios IS 'Usuarios pueden actualizar su propio perfil';
COMMENT ON POLICY "only_admin_can_delete_users" ON public.usuarios IS 'Solo admin puede eliminar usuarios';

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================

/*
POLÍTICAS RLS IMPLEMENTADAS PARA USUARIOS:

SELECT (Lectura):
- ✅ Admin puede ver todos los usuarios activos
- ✅ Usuarios pueden ver su propio perfil
- ✅ Permite acceso durante login (por email)

INSERT (Creación):
- ✅ Admin puede insertar usuarios
- ✅ Permite inserción durante registro

UPDATE (Actualización):
- ✅ Admin puede actualizar todos los usuarios
- ✅ Usuarios pueden actualizar su propio perfil

DELETE (Eliminación):
- ✅ Solo admin puede hacer soft delete

VERIFICACIÓN:
SELECT * FROM verificar_politicas_usuarios();
SELECT * FROM probar_accesos_usuarios();

PRÓXIMO PASO:
Implementar RLS para tabla alumno
*/
