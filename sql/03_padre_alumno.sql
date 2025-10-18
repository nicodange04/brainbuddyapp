-- sql/03_padre_alumno.sql
-- Tabla para vincular padres con alumnos

CREATE TABLE IF NOT EXISTS public.padre_alumno (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  padre_id UUID NOT NULL REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE,
  alumno_id UUID NOT NULL REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE,
  vinculado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'pendiente')),
  
  -- Evitar duplicados: un padre no puede estar vinculado al mismo alumno dos veces
  CONSTRAINT unique_padre_alumno UNIQUE (padre_id, alumno_id),
  
  -- Un padre no puede vincularse a sí mismo
  CONSTRAINT check_padre_diferente_alumno CHECK (padre_id != alumno_id)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_padre_alumno_padre_id ON public.padre_alumno (padre_id);
CREATE INDEX IF NOT EXISTS idx_padre_alumno_alumno_id ON public.padre_alumno (alumno_id);
CREATE INDEX IF NOT EXISTS idx_padre_alumno_estado ON public.padre_alumno (estado);

-- Comentarios para documentar la tabla
COMMENT ON TABLE public.padre_alumno IS 'Vinculación entre padres y alumnos para seguimiento de progreso';
COMMENT ON COLUMN public.padre_alumno.padre_id IS 'ID del usuario padre';
COMMENT ON COLUMN public.padre_alumno.alumno_id IS 'ID del usuario alumno';
COMMENT ON COLUMN public.padre_alumno.vinculado_en IS 'Fecha y hora de la vinculación';
COMMENT ON COLUMN public.padre_alumno.estado IS 'Estado de la vinculación: activo, inactivo, pendiente';
