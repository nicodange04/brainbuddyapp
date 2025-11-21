-- =====================================================
-- PARTE 3: CREAR FUNCIONES SQL
-- =====================================================
-- Ejecuta esta parte después de la Parte 2
-- Crea las funciones necesarias para calcular puntos y obtener rankings

-- 3.1 Función para calcular puntos totales
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

COMMENT ON FUNCTION public.calcular_puntos_totales_alumno(UUID) IS 'Calcula los puntos totales de un alumno sumando los puntajes de todas sus sesiones completadas';

-- 3.2 Función para obtener ranking de amigos (TOP 10)
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
    -- Obtener IDs de todos los amigos aceptados + el usuario actual
    SELECT 
      CASE 
        WHEN aa.alumno_id = p_alumno_id THEN aa.amigo_id
        ELSE aa.alumno_id
      END AS amigo_id
    FROM public.alumno_amigo aa
    WHERE (aa.alumno_id = p_alumno_id OR aa.amigo_id = p_alumno_id)
      AND aa.estado = 'aceptado'
    
    UNION
    
    -- Incluir también al usuario actual
    SELECT p_alumno_id AS amigo_id
  ),
  puntos_amigos AS (
    -- Calcular puntos de cada amigo (incluyendo al usuario actual)
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

COMMENT ON FUNCTION public.get_ranking_amigos(UUID, INTEGER) IS 'Obtiene el ranking de amigos de un alumno ordenado por puntos (top N)';

-- 3.3 Función para obtener posición del alumno en el ranking
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

COMMENT ON FUNCTION public.get_posicion_ranking_amigos(UUID) IS 'Obtiene la posición del alumno en el ranking de sus amigos';

-- VERIFICACIÓN: Ejecuta esto después para verificar (reemplaza 'tu-usuario-id' con un ID real)
-- SELECT * FROM calcular_puntos_totales_alumno('tu-usuario-id');
-- SELECT * FROM get_ranking_amigos('tu-usuario-id', 10);
-- SELECT * FROM get_posicion_ranking_amigos('tu-usuario-id');

