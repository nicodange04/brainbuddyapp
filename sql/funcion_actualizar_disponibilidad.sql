-- =====================================================
-- FUNCIÓN PARA ACTUALIZAR DISPONIBILIDAD
-- =====================================================
-- Esta función elimina todos los registros del usuario y luego inserta los nuevos
-- Todo en una transacción para evitar problemas de duplicados

CREATE OR REPLACE FUNCTION actualizar_disponibilidad(
  p_alumno_id UUID,
  p_disponibilidad JSONB
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  registros_insertados INTEGER
) AS $$
DECLARE
  v_count INTEGER;
  registro JSONB;
BEGIN
  -- Iniciar transacción implícita
  
  -- Paso 1: Eliminar TODOS los registros existentes del usuario
  DELETE FROM disponibilidad 
  WHERE alumno_id = p_alumno_id;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Registros eliminados: %', v_count;
  
  -- Paso 2: Insertar nuevos registros
  v_count := 0;
  
  FOR registro IN SELECT * FROM jsonb_array_elements(p_disponibilidad)
  LOOP
    INSERT INTO disponibilidad (alumno_id, dia_semana, turno)
    VALUES (
      p_alumno_id,
      (registro->>'dia_semana')::INTEGER,
      registro->>'turno'
    );
    v_count := v_count + 1;
  END LOOP;
  
  -- Retornar éxito
  RETURN QUERY SELECT TRUE, 'Disponibilidad actualizada correctamente', v_count;
  
EXCEPTION
  WHEN OTHERS THEN
    -- En caso de error, hacer rollback automático
    RETURN QUERY SELECT FALSE, SQLERRM, 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PERMISOS
-- =====================================================
-- Permitir que usuarios autenticados ejecuten la función
GRANT EXECUTE ON FUNCTION actualizar_disponibilidad(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION actualizar_disponibilidad(UUID, JSONB) TO anon;

-- =====================================================
-- COMENTARIOS
-- =====================================================
COMMENT ON FUNCTION actualizar_disponibilidad IS 
  'Función para actualizar la disponibilidad de un alumno de forma atómica';

-- =====================================================
-- USO:
-- =====================================================
-- SELECT * FROM actualizar_disponibilidad(
--   'user-uuid-here'::UUID,
--   '[{"dia_semana": 1, "turno": "Mañana"}, {"dia_semana": 1, "turno": "Tarde"}]'::JSONB
-- );


