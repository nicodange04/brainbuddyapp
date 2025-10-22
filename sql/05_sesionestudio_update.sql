-- sql/05_sesionestudio_update.sql
-- Actualizar la tabla sesionestudio para que coincida con el código

-- Verificar si la tabla examen existe y tiene la columna id
-- Si no existe, crear la tabla examen primero
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
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios exámenes" ON public.examen;
CREATE POLICY "Los usuarios pueden ver sus propios exámenes" ON public.examen
  FOR SELECT USING (auth.uid()::text = usuario_id::text);

DROP POLICY IF EXISTS "Los usuarios pueden insertar sus propios exámenes" ON public.examen;
CREATE POLICY "Los usuarios pueden insertar sus propios exámenes" ON public.examen
  FOR INSERT WITH CHECK (auth.uid()::text = usuario_id::text);

DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propios exámenes" ON public.examen;
CREATE POLICY "Los usuarios pueden actualizar sus propios exámenes" ON public.examen
  FOR UPDATE USING (auth.uid()::text = usuario_id::text);

DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus propios exámenes" ON public.examen;
CREATE POLICY "Los usuarios pueden eliminar sus propios exámenes" ON public.examen
  FOR DELETE USING (auth.uid()::text = usuario_id::text);

-- Ahora crear la tabla sesionestudio
CREATE TABLE IF NOT EXISTS public.sesionestudio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  examen_id UUID NOT NULL REFERENCES public.examen(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  tema VARCHAR(255) NOT NULL,
  fecha_programada DATE NOT NULL,
  turno VARCHAR(10) NOT NULL CHECK (turno IN ('Mañana', 'Tarde', 'Noche')),
  estado VARCHAR(20) NOT NULL DEFAULT 'NoCompletada' CHECK (estado IN ('NoCompletada', 'Completada', 'Atrasada')),
  secuencia INTEGER NOT NULL, -- Orden de la sesión (1, 2, 3...)
  material_generado JSONB, -- Contenido teórico generado por IA
  quiz_generado JSONB, -- Quiz generado por IA
  puntaje_obtenido INTEGER DEFAULT 0,
  tiempo_estudio INTEGER DEFAULT 0, -- En minutos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_sesionestudio_examen_id ON public.sesionestudio (examen_id);
CREATE INDEX IF NOT EXISTS idx_sesionestudio_usuario_id ON public.sesionestudio (usuario_id);
CREATE INDEX IF NOT EXISTS idx_sesionestudio_fecha ON public.sesionestudio (fecha_programada);
CREATE INDEX IF NOT EXISTS idx_sesionestudio_estado ON public.sesionestudio (estado);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.sesionestudio ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver/editar sus propias sesiones
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias sesiones" ON public.sesionestudio;
CREATE POLICY "Los usuarios pueden ver sus propias sesiones" ON public.sesionestudio
  FOR SELECT USING (auth.uid()::text = usuario_id::text);

DROP POLICY IF EXISTS "Los usuarios pueden insertar sus propias sesiones" ON public.sesionestudio;
CREATE POLICY "Los usuarios pueden insertar sus propias sesiones" ON public.sesionestudio
  FOR INSERT WITH CHECK (auth.uid()::text = usuario_id::text);

DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propias sesiones" ON public.sesionestudio;
CREATE POLICY "Los usuarios pueden actualizar sus propias sesiones" ON public.sesionestudio
  FOR UPDATE USING (auth.uid()::text = usuario_id::text);

DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus propias sesiones" ON public.sesionestudio;
CREATE POLICY "Los usuarios pueden eliminar sus propias sesiones" ON public.sesionestudio
  FOR DELETE USING (auth.uid()::text = usuario_id::text);

-- Comentarios para documentar la tabla
COMMENT ON TABLE public.sesionestudio IS 'Sesiones de estudio generadas automáticamente para cada examen';
COMMENT ON COLUMN public.sesionestudio.material_generado IS 'Contenido teórico generado por IA en formato JSON';
COMMENT ON COLUMN public.sesionestudio.quiz_generado IS 'Quiz generado por IA en formato JSON';
COMMENT ON COLUMN public.sesionestudio.secuencia IS 'Orden de la sesión dentro del examen (1, 2, 3...)';
COMMENT ON COLUMN public.sesionestudio.tiempo_estudio IS 'Tiempo real de estudio en minutos';
