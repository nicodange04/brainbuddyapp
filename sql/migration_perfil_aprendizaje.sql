-- ============================================
-- MIGRACIÓN: Tabla perfil_aprendizaje
-- ============================================
-- Esta tabla almacena el perfil de aprendizaje del alumno
-- que se crea durante el onboarding y se usa para personalizar
-- la generación de material teórico

-- ============================================
-- 1. Crear tabla perfil_aprendizaje
-- ============================================
CREATE TABLE IF NOT EXISTS perfil_aprendizaje (
    id SERIAL PRIMARY KEY,
    alumno_id UUID NOT NULL REFERENCES alumno(alumno_id) ON DELETE CASCADE,
    
    -- Estilo de aprendizaje (VARK: Visual, Auditivo, Lectura/Escritura, Kinestésico)
    estilo_primario VARCHAR(20) NOT NULL CHECK (estilo_primario IN ('visual', 'auditivo', 'lectura', 'kinestesico', 'mixto')),
    estilo_secundario VARCHAR(20) CHECK (estilo_secundario IN ('visual', 'auditivo', 'lectura', 'kinestesico', 'mixto')),
    
    -- Preferencias de contenido
    prefiere_ejemplos BOOLEAN DEFAULT true,
    prefiere_diagramas BOOLEAN DEFAULT false,
    prefiere_analogias BOOLEAN DEFAULT true,
    prefiere_casos_reales BOOLEAN DEFAULT false,
    
    -- Nivel de profundidad preferido
    nivel_profundidad VARCHAR(20) DEFAULT 'medio' CHECK (nivel_profundidad IN ('basico', 'medio', 'avanzado')),
    
    -- Preferencias de estructura
    prefiere_pasos_ordenados BOOLEAN DEFAULT true,
    prefiere_conceptos_globales BOOLEAN DEFAULT false,
    prefiere_resumenes BOOLEAN DEFAULT true,
    
    -- Velocidad de aprendizaje
    velocidad_aprendizaje VARCHAR(20) DEFAULT 'normal' CHECK (velocidad_aprendizaje IN ('lento', 'normal', 'rapido')),
    
    -- Preferencias de lenguaje
    prefiere_lenguaje_formal BOOLEAN DEFAULT false,
    prefiere_lenguaje_cotidiano BOOLEAN DEFAULT true,
    prefiere_terminos_tecnicos BOOLEAN DEFAULT false,
    
    -- Información adicional (JSONB para flexibilidad)
    preferencias_adicionales JSONB DEFAULT '{}',
    
    -- Metadatos
    completado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Un alumno solo puede tener un perfil
    UNIQUE(alumno_id)
);

-- ============================================
-- 2. Crear índices
-- ============================================
CREATE INDEX IF NOT EXISTS idx_perfil_aprendizaje_alumno_id 
ON perfil_aprendizaje(alumno_id);

CREATE INDEX IF NOT EXISTS idx_perfil_aprendizaje_estilo_primario 
ON perfil_aprendizaje(estilo_primario);

CREATE INDEX IF NOT EXISTS idx_perfil_aprendizaje_completado 
ON perfil_aprendizaje(completado);

-- ============================================
-- 3. Trigger para actualizar updated_at
-- ============================================
CREATE TRIGGER update_perfil_aprendizaje_updated_at 
BEFORE UPDATE ON perfil_aprendizaje 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. Comentarios para documentación
-- ============================================
COMMENT ON TABLE perfil_aprendizaje IS 'Perfil de aprendizaje del alumno para personalizar generación de contenido';
COMMENT ON COLUMN perfil_aprendizaje.estilo_primario IS 'Estilo de aprendizaje principal según modelo VARK';
COMMENT ON COLUMN perfil_aprendizaje.preferencias_adicionales IS 'Preferencias adicionales en formato JSON para flexibilidad futura';

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta esta query para verificar que la tabla se creó correctamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'perfil_aprendizaje'
ORDER BY ordinal_position;
