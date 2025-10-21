-- =====================================================
-- ROLLBACK: TABLA USUARIOS
-- =====================================================
-- Si algo falla, ejecuta este script para volver atrás

-- 1. Deshabilitar RLS (vuelve a aparecer "Unrestricted")
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar la política
DROP POLICY IF EXISTS "usuarios_own_data" ON usuarios;

-- 3. Verificar que volvió a "Unrestricted"
SELECT 'usuarios' as tabla, rowsecurity as rls_habilitado 
FROM pg_tables 
WHERE tablename = 'usuarios' AND schemaname = 'public';
