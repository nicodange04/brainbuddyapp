-- sql/02_disponibilidad.sql
-- Tabla para disponibilidad horaria de los alumnos

CREATE TABLE IF NOT EXISTS public.disponibilidad (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id UUID NOT NULL REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo, 1=Lunes, etc.
  turno VARCHAR(10) NOT NULL CHECK (turno IN ('Mañana', 'Tarde', 'Noche')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar duplicados: un alumno no puede tener el mismo día y turno dos veces
  CONSTRAINT unique_disponibilidad_alumno_dia_turno UNIQUE (alumno_id, dia_semana, turno)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_disponibilidad_alumno_id ON public.disponibilidad (alumno_id);
CREATE INDEX IF NOT EXISTS idx_disponibilidad_dia_semana ON public.disponibilidad (dia_semana);
CREATE INDEX IF NOT EXISTS idx_disponibilidad_turno ON public.disponibilidad (turno);

-- Comentarios para documentar la tabla
COMMENT ON TABLE public.disponibilidad IS 'Disponibilidad horaria de los alumnos para programar sesiones de estudio';
COMMENT ON COLUMN public.disponibilidad.dia_semana IS 'Día de la semana: 0=Domingo, 1=Lunes, ..., 6=Sábado';
COMMENT ON COLUMN public.disponibilidad.turno IS 'Turno del día: Mañana, Tarde, Noche';
