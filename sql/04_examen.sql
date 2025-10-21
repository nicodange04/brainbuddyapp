-- sql/04_examen.sql
-- Tabla para exámenes creados por los alumnos

CREATE TABLE IF NOT EXISTS public.examen (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  materia VARCHAR(100) NOT NULL,
  fecha DATE NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'cancelado')),
  temario JSONB, -- Array de temas como JSON
  archivos JSONB, -- Array de archivos subidos como JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validaciones
  CONSTRAINT fecha_futura CHECK (fecha >= CURRENT_DATE)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_examen_usuario_id ON public.examen (usuario_id);
CREATE INDEX IF NOT EXISTS idx_examen_fecha ON public.examen (fecha);
CREATE INDEX IF NOT EXISTS idx_examen_estado ON public.examen (estado);
CREATE INDEX IF NOT EXISTS idx_examen_materia ON public.examen (materia);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.examen ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver/editar sus propios exámenes
CREATE POLICY "Los usuarios pueden ver sus propios exámenes" ON public.examen
  FOR SELECT USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "Los usuarios pueden insertar sus propios exámenes" ON public.examen
  FOR INSERT WITH CHECK (auth.uid()::text = usuario_id::text);

CREATE POLICY "Los usuarios pueden actualizar sus propios exámenes" ON public.examen
  FOR UPDATE USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "Los usuarios pueden eliminar sus propios exámenes" ON public.examen
  FOR DELETE USING (auth.uid()::text = usuario_id::text);

-- Comentarios para documentar la tabla
COMMENT ON TABLE public.examen IS 'Exámenes creados por los alumnos con sus temas y fechas';
COMMENT ON COLUMN public.examen.temario IS 'Array JSON con los temas del examen';
COMMENT ON COLUMN public.examen.archivos IS 'Array JSON con archivos subidos por el alumno';
COMMENT ON COLUMN public.examen.fecha IS 'Fecha del examen (debe ser futura)';
COMMENT ON COLUMN public.examen.estado IS 'Estado del examen: activo, completado, cancelado';