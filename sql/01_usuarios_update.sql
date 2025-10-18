-- sql/01_usuarios_update.sql
-- Actualizar tablas específicas con columnas faltantes

-- Agregar columnas específicas de ALUMNOS a la tabla alumno
ALTER TABLE public.alumno 
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
ADD COLUMN IF NOT EXISTS codigo_vinculacion VARCHAR(6) UNIQUE,
ADD COLUMN IF NOT EXISTS avatar_color VARCHAR(7) DEFAULT '#8B5CF6',
ADD COLUMN IF NOT EXISTS puntos_totales INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS racha_dias INTEGER DEFAULT 0;

-- Agregar columnas específicas de PADRES a la tabla padre
ALTER TABLE public.padre 
ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_alumno_codigo_vinculacion ON public.alumno (codigo_vinculacion);
CREATE INDEX IF NOT EXISTS idx_alumno_puntos ON public.alumno (puntos_totales);
CREATE INDEX IF NOT EXISTS idx_alumno_racha ON public.alumno (racha_dias);
CREATE INDEX IF NOT EXISTS idx_padre_telefono ON public.padre (telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN public.alumno.fecha_nacimiento IS 'Fecha de nacimiento del alumno';
COMMENT ON COLUMN public.alumno.codigo_vinculacion IS 'Código único para vincular padres con alumnos';
COMMENT ON COLUMN public.alumno.avatar_color IS 'Color del avatar del alumno';
COMMENT ON COLUMN public.alumno.puntos_totales IS 'Puntos totales acumulados por el alumno';
COMMENT ON COLUMN public.alumno.racha_dias IS 'Días consecutivos de estudio';
COMMENT ON COLUMN public.padre.telefono IS 'Teléfono del padre/madre para notificaciones';
