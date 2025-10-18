-- sql/04_avatars.sql
-- Sistema de trofeos y avatares para gamificación

-- Tabla maestra de trofeos disponibles
CREATE TABLE IF NOT EXISTS public.trofeo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  icono VARCHAR(10), -- Emoji del trofeo
  puntos_recompensa INTEGER DEFAULT 0,
  condicion VARCHAR(200), -- Descripción de cómo obtener el trofeo
  categoria VARCHAR(50) DEFAULT 'general', -- general, estudio, racha, puntos, etc.
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de trofeos desbloqueados por usuario
CREATE TABLE IF NOT EXISTS public.avatar_trofeo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alumno_id UUID NOT NULL REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE,
  trofeo_id UUID NOT NULL REFERENCES public.trofeo(id) ON DELETE CASCADE,
  fecha_obtencion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  puntos_obtenidos INTEGER DEFAULT 0,
  
  -- Evitar duplicados: un alumno no puede obtener el mismo trofeo dos veces
  CONSTRAINT unique_alumno_trofeo UNIQUE (alumno_id, trofeo_id)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_trofeo_categoria ON public.trofeo (categoria);
CREATE INDEX IF NOT EXISTS idx_trofeo_activo ON public.trofeo (activo);
CREATE INDEX IF NOT EXISTS idx_avatar_trofeo_alumno_id ON public.avatar_trofeo (alumno_id);
CREATE INDEX IF NOT EXISTS idx_avatar_trofeo_fecha ON public.avatar_trofeo (fecha_obtencion);

-- Insertar trofeos básicos
INSERT INTO public.trofeo (nombre, descripcion, icono, puntos_recompensa, condicion, categoria) VALUES
('Primer Paso', 'Completa tu primera sesión de estudio', '🎯', 10, 'Completar 1 sesión de estudio', 'estudio'),
('Estudiante Dedicado', 'Completa 5 sesiones de estudio', '📚', 25, 'Completar 5 sesiones de estudio', 'estudio'),
('Maratón de Estudio', 'Completa 10 sesiones de estudio', '🏃‍♂️', 50, 'Completar 10 sesiones de estudio', 'estudio'),
('Racha de 3 días', 'Estudia 3 días consecutivos', '🔥', 30, 'Mantener racha de 3 días', 'racha'),
('Racha de 7 días', 'Estudia 7 días consecutivos', '💪', 75, 'Mantener racha de 7 días', 'racha'),
('Racha de 30 días', 'Estudia 30 días consecutivos', '👑', 200, 'Mantener racha de 30 días', 'racha'),
('Primer Examen', 'Completa tu primer examen', '📝', 20, 'Completar 1 examen', 'examen'),
('Estudiante Estrella', 'Obtén 100 puntos', '⭐', 100, 'Acumular 100 puntos', 'puntos'),
('Maestro del Conocimiento', 'Obtén 500 puntos', '🧙‍♂️', 500, 'Acumular 500 puntos', 'puntos')
ON CONFLICT (nombre) DO NOTHING;

-- Comentarios para documentar las tablas
COMMENT ON TABLE public.trofeo IS 'Catálogo de trofeos disponibles para desbloquear';
COMMENT ON TABLE public.avatar_trofeo IS 'Trofeos desbloqueados por cada alumno';
COMMENT ON COLUMN public.trofeo.categoria IS 'Categoría del trofeo: general, estudio, racha, puntos, examen';
COMMENT ON COLUMN public.avatar_trofeo.puntos_obtenidos IS 'Puntos obtenidos al desbloquear este trofeo';
