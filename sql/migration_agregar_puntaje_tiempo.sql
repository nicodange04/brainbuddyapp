-- ============================================
-- MIGRACIÓN: Agregar campos puntaje_obtenido y tiempo_estudio
-- ============================================
-- Ejecuta esta migración en Supabase SQL Editor
-- para agregar los campos necesarios para guardar
-- el puntaje y tiempo de estudio de las sesiones

-- ============================================
-- 1. Agregar campo puntaje_obtenido a sesionestudio
-- ============================================
-- Este campo guardará el puntaje obtenido en el quiz de la sesión
ALTER TABLE public.sesionestudio
ADD COLUMN IF NOT EXISTS puntaje_obtenido INTEGER DEFAULT 0;

-- ============================================
-- 2. Agregar campo tiempo_estudio a sesionestudio
-- ============================================
-- Este campo guardará el tiempo de estudio en minutos
ALTER TABLE public.sesionestudio
ADD COLUMN IF NOT EXISTS tiempo_estudio INTEGER DEFAULT 0;

-- ============================================
-- 3. Actualizar sesiones existentes
-- ============================================
-- Establecer valores por defecto para sesiones existentes
UPDATE public.sesionestudio
SET puntaje_obtenido = 0
WHERE puntaje_obtenido IS NULL;

UPDATE public.sesionestudio
SET tiempo_estudio = 0
WHERE tiempo_estudio IS NULL;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta esta query para verificar que los campos se agregaron correctamente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'sesionestudio'
  AND column_name IN ('puntaje_obtenido', 'tiempo_estudio')
ORDER BY column_name;




