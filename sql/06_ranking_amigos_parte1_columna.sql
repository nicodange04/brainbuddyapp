-- =====================================================
-- PARTE 1: AGREGAR CÓDIGO DE AMISTAD A LA TABLA ALUMNO
-- =====================================================
-- Ejecuta esta parte primero
-- Agrega la columna codigo_amistad a la tabla alumno

ALTER TABLE public.alumno 
ADD COLUMN IF NOT EXISTS codigo_amistad VARCHAR(6) UNIQUE;

-- Crear índice para búsquedas rápidas por código de amistad
CREATE INDEX IF NOT EXISTS idx_alumno_codigo_amistad ON public.alumno (codigo_amistad);

-- Comentario para documentar
COMMENT ON COLUMN public.alumno.codigo_amistad IS 'Código único de 6 caracteres para agregar amigos (diferente al código de vinculación de padres)';

-- VERIFICACIÓN: Ejecuta esto después para verificar
-- SELECT codigo_amistad FROM alumno LIMIT 5;

