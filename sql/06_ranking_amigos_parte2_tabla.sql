-- =====================================================
-- PARTE 2: CREAR TABLA DE RELACIONES DE AMISTAD
-- =====================================================
-- Ejecuta esta parte después de la Parte 1
-- Crea la tabla alumno_amigo para almacenar las relaciones

CREATE TABLE IF NOT EXISTS public.alumno_amigo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id UUID NOT NULL REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE,
  amigo_id UUID NOT NULL REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE,
  estado VARCHAR(20) NOT NULL DEFAULT 'aceptado' CHECK (estado IN ('pendiente', 'aceptado', 'rechazado', 'bloqueado')),
  solicitado_por UUID NOT NULL REFERENCES public.usuarios(usuario_id), -- Quién hizo la solicitud
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  aceptado_en TIMESTAMP WITH TIME ZONE,
  
  -- Evitar duplicados: un alumno no puede tener al mismo amigo dos veces
  CONSTRAINT unique_alumno_amigo UNIQUE (alumno_id, amigo_id),
  
  -- Un alumno no puede agregarse a sí mismo como amigo
  CONSTRAINT check_alumno_diferente_amigo CHECK (alumno_id != amigo_id),
  
  -- El solicitado_por debe ser uno de los dos (alumno_id o amigo_id)
  CONSTRAINT check_solicitado_por_valido CHECK (solicitado_por = alumno_id OR solicitado_por = amigo_id)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_alumno_amigo_alumno_id ON public.alumno_amigo (alumno_id);
CREATE INDEX IF NOT EXISTS idx_alumno_amigo_amigo_id ON public.alumno_amigo (amigo_id);
CREATE INDEX IF NOT EXISTS idx_alumno_amigo_estado ON public.alumno_amigo (estado);
CREATE INDEX IF NOT EXISTS idx_alumno_amigo_solicitado_por ON public.alumno_amigo (solicitado_por);

-- Comentarios para documentar
COMMENT ON TABLE public.alumno_amigo IS 'Relaciones de amistad entre alumnos para competir en rankings';
COMMENT ON COLUMN public.alumno_amigo.alumno_id IS 'ID del alumno principal';
COMMENT ON COLUMN public.alumno_amigo.amigo_id IS 'ID del amigo';
COMMENT ON COLUMN public.alumno_amigo.estado IS 'Estado de la amistad: pendiente, aceptado, rechazado, bloqueado';
COMMENT ON COLUMN public.alumno_amigo.solicitado_por IS 'ID del usuario que hizo la solicitud de amistad';

-- VERIFICACIÓN: Ejecuta esto después para verificar
-- SELECT * FROM alumno_amigo LIMIT 1;
-- SELECT COUNT(*) FROM alumno_amigo;

