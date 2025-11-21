-- =====================================================
-- PARTE 4: CREAR TRIGGER PARA GENERAR CÓDIGO AUTOMÁTICAMENTE
-- =====================================================
-- Ejecuta esta parte después de la Parte 3
-- Crea el trigger que genera automáticamente el código de amistad

-- 4.1 Función para generar código de amistad único
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

COMMENT ON FUNCTION public.generar_codigo_amistad() IS 'Genera un código único de 6 caracteres para amistad';

-- 4.2 Función del trigger
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

COMMENT ON FUNCTION public.trigger_generar_codigo_amistad() IS 'Trigger para generar código de amistad automáticamente';

-- 4.3 Crear el trigger
DROP TRIGGER IF EXISTS trigger_alumno_generar_codigo_amistad ON public.alumno;
CREATE TRIGGER trigger_alumno_generar_codigo_amistad
  BEFORE INSERT OR UPDATE ON public.alumno
  FOR EACH ROW
  WHEN (NEW.codigo_amistad IS NULL OR NEW.codigo_amistad = '')
  EXECUTE FUNCTION public.trigger_generar_codigo_amistad();

-- VERIFICACIÓN: Ejecuta esto después para verificar
-- SELECT codigo_amistad FROM alumno LIMIT 5;
-- Prueba crear un nuevo alumno y verifica que se genere el código automáticamente

