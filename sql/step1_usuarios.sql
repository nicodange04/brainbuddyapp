-- =====================================================
-- PASO 1: QUITAR "UNRESTRICTED" DE TABLA USUARIOS
-- =====================================================
-- Ejecutar este script en Supabase SQL Editor

-- 1. Habilitar RLS (esto quita el "Unrestricted")
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 2. Política básica: Los usuarios solo pueden ver su propio perfil
CREATE POLICY "usuarios_own_data" ON usuarios
    FOR ALL USING (usuario_id = auth.uid()::text);

-- 3. Verificar que ya no aparece "Unrestricted"
SELECT 'usuarios' as tabla, rowsecurity as rls_habilitado 
FROM pg_tables 
WHERE tablename = 'usuarios' AND schemaname = 'public';
