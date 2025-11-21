-- sql/06_ranking_amigos.sql
-- Tabla y estructura para sistema de ranking entre amigos

-- =====================================================
-- 1. AGREGAR CÓDIGO DE AMISTAD A LA TABLA ALUMNO
-- =====================================================
-- Código diferente al de vinculación de padres para evitar mal uso
ALTER TABLE public.alumno 
ADD COLUMN IF NOT EXISTS codigo_amistad VARCHAR(6) UNIQUE;

-- Crear índice para búsquedas rápidas por código de amistad
CREATE INDEX IF NOT EXISTS idx_alumno_codigo_amistad ON public.alumno (codigo_amistad);

-- Comentario para documentar
COMMENT ON COLUMN public.alumno.codigo_amistad IS 'Código único de 6 caracteres para agregar amigos (diferente al código de vinculación de padres)';

-- =====================================================
-- 2. TABLA DE RELACIONES DE AMISTAD
-- =====================================================
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

-- =====================================================
-- 3. FUNCIÓN PARA CALCULAR PUNTOS TOTALES DE UN ALUMNO
-- =====================================================
-- Esta función calcula los puntos totales sumando todos los puntajes de sesiones completadas
CREATE OR REPLACE FUNCTION public.calcular_puntos_totales_alumno(p_alumno_id UUID)
RETURNS INTEGER AS $$
DECLARE
  puntos_calculados INTEGER;
BEGIN
  SELECT COALESCE(SUM(COALESCE(se.puntaje_obtenido, 0)), 0)
  INTO puntos_calculados
  FROM public.sesionestudio se
  INNER JOIN public.examen e ON se.examen_id = e.examen_id
  WHERE e.alumno_id = p_alumno_id
    AND se.estado = 'Completada';
  
  RETURN puntos_calculados;
END;
$$ LANGUAGE plpgsql;

-- Comentario para documentar
COMMENT ON FUNCTION public.calcular_puntos_totales_alumno(UUID) IS 'Calcula los puntos totales de un alumno sumando los puntajes de todas sus sesiones completadas';

-- =====================================================
-- 4. FUNCIÓN PARA OBTENER RANKING DE AMIGOS (TOP 10)
-- =====================================================
-- Esta función devuelve el ranking de amigos de un alumno ordenado por puntos
CREATE OR REPLACE FUNCTION public.get_ranking_amigos(p_alumno_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  posicion BIGINT,
  usuario_id UUID,
  nombre VARCHAR,
  apellido VARCHAR,
  avatar_color VARCHAR,
  puntos_totales INTEGER,
  racha_actual INTEGER,
  sesiones_completadas BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH amigos_ids AS (
    -- Obtener IDs de todos los amigos aceptados
    SELECT 
      CASE 
        WHEN aa.alumno_id = p_alumno_id THEN aa.amigo_id
        ELSE aa.alumno_id
      END AS amigo_id
    FROM public.alumno_amigo aa
    WHERE (aa.alumno_id = p_alumno_id OR aa.amigo_id = p_alumno_id)
      AND aa.estado = 'aceptado'
  ),
  puntos_amigos AS (
    -- Calcular puntos de cada amigo
    SELECT 
      u.usuario_id,
      u.nombre,
      u.apellido,
      COALESCE(a.avatar_color, '#8B5CF6') AS avatar_color,
      public.calcular_puntos_totales_alumno(u.usuario_id) AS puntos_totales,
      COALESCE(a.racha_dias, 0) AS racha_actual,
      (
        SELECT COUNT(*)
        FROM public.sesionestudio se
        INNER JOIN public.examen e ON se.examen_id = e.examen_id
        WHERE e.alumno_id = u.usuario_id
          AND se.estado = 'Completada'
      ) AS sesiones_completadas
    FROM amigos_ids ai
    INNER JOIN public.usuarios u ON u.usuario_id = ai.amigo_id
    LEFT JOIN public.alumno a ON a.alumno_id = u.usuario_id
    WHERE u.rol = 'alumno'
  )
  SELECT 
    ROW_NUMBER() OVER (ORDER BY pa.puntos_totales DESC, pa.racha_actual DESC, pa.sesiones_completadas DESC) AS posicion,
    pa.usuario_id,
    pa.nombre,
    pa.apellido,
    pa.avatar_color,
    pa.puntos_totales,
    pa.racha_actual,
    pa.sesiones_completadas
  FROM puntos_amigos pa
  ORDER BY pa.puntos_totales DESC, pa.racha_actual DESC, pa.sesiones_completadas DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Comentario para documentar
COMMENT ON FUNCTION public.get_ranking_amigos(UUID, INTEGER) IS 'Obtiene el ranking de amigos de un alumno ordenado por puntos (top N)';

-- =====================================================
-- 5. FUNCIÓN PARA OBTENER POSICIÓN DEL ALUMNO EN EL RANKING
-- =====================================================
-- Esta función devuelve la posición del alumno en el ranking de sus amigos
CREATE OR REPLACE FUNCTION public.get_posicion_ranking_amigos(p_alumno_id UUID)
RETURNS INTEGER AS $$
DECLARE
  posicion_alumno INTEGER;
BEGIN
  WITH ranking_completo AS (
    SELECT 
      usuario_id,
      ROW_NUMBER() OVER (ORDER BY puntos_totales DESC, racha_actual DESC, sesiones_completadas DESC) AS posicion
    FROM public.get_ranking_amigos(p_alumno_id, 1000) -- Obtener todos para encontrar posición
  )
  SELECT posicion
  INTO posicion_alumno
  FROM ranking_completo
  WHERE usuario_id = p_alumno_id;
  
  RETURN COALESCE(posicion_alumno, 0);
END;
$$ LANGUAGE plpgsql;

-- Comentario para documentar
COMMENT ON FUNCTION public.get_posicion_ranking_amigos(UUID) IS 'Obtiene la posición del alumno en el ranking de sus amigos';

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) - OPCIONAL
-- =====================================================
-- Si quieres que los alumnos solo vean sus propias relaciones de amistad
-- Descomenta las siguientes líneas:

-- ALTER TABLE public.alumno_amigo ENABLE ROW LEVEL SECURITY;

-- Política: Los alumnos pueden ver sus propias relaciones de amistad
-- CREATE POLICY "Los alumnos pueden ver sus propias amistades" ON public.alumno_amigo
--   FOR SELECT USING (
--     auth.uid()::text = alumno_id::text OR 
--     auth.uid()::text = amigo_id::text
--   );

-- Política: Los alumnos pueden crear solicitudes de amistad
-- CREATE POLICY "Los alumnos pueden crear solicitudes de amistad" ON public.alumno_amigo
--   FOR INSERT WITH CHECK (
--     auth.uid()::text = alumno_id::text OR 
--     auth.uid()::text = amigo_id::text
--   );

-- Política: Los alumnos pueden aceptar/rechazar solicitudes dirigidas a ellos
-- CREATE POLICY "Los alumnos pueden actualizar solicitudes dirigidas a ellos" ON public.alumno_amigo
--   FOR UPDATE USING (
--     auth.uid()::text = amigo_id::text AND solicitado_por != auth.uid()::text
--   );

-- =====================================================
-- 7. TRIGGER PARA GENERAR CÓDIGO DE AMISTAD AUTOMÁTICAMENTE
-- =====================================================
-- Función para generar código de amistad único de 6 caracteres
CREATE OR REPLACE FUNCTION public.generar_codigo_amistad()
RETURNS VARCHAR(6) AS $$
DECLARE
  codigo VARCHAR(6);
  existe BOOLEAN;
BEGIN
  LOOP
    -- Generar código aleatorio de 6 caracteres (letras y números)
    codigo := UPPER(
      SUBSTRING(
        MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT),
        1, 6
      )
    );
    
    -- Verificar si el código ya existe
    SELECT EXISTS(SELECT 1 FROM public.alumno WHERE codigo_amistad = codigo)
    INTO existe;
    
    -- Si no existe, salir del loop
    EXIT WHEN NOT existe;
  END LOOP;
  
  RETURN codigo;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar código automáticamente cuando se crea un alumno
CREATE OR REPLACE FUNCTION public.trigger_generar_codigo_amistad()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo generar código si no existe
  IF NEW.codigo_amistad IS NULL OR NEW.codigo_amistad = '' THEN
    NEW.codigo_amistad := public.generar_codigo_amistad();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger
DROP TRIGGER IF EXISTS trigger_alumno_generar_codigo_amistad ON public.alumno;
CREATE TRIGGER trigger_alumno_generar_codigo_amistad
  BEFORE INSERT OR UPDATE ON public.alumno
  FOR EACH ROW
  WHEN (NEW.codigo_amistad IS NULL OR NEW.codigo_amistad = '')
  EXECUTE FUNCTION public.trigger_generar_codigo_amistad();

-- Comentarios para documentar
COMMENT ON FUNCTION public.generar_codigo_amistad() IS 'Genera un código único de 6 caracteres para amistad';
COMMENT ON FUNCTION public.trigger_generar_codigo_amistad() IS 'Trigger para generar código de amistad automáticamente';

-- =====================================================
-- 8. ACTUALIZAR CÓDIGOS DE AMISTAD PARA ALUMNOS EXISTENTES
-- =====================================================
-- Si ya tienes alumnos en la base de datos, generar códigos para ellos
UPDATE public.alumno
SET codigo_amistad = public.generar_codigo_amistad()
WHERE codigo_amistad IS NULL OR codigo_amistad = '';

