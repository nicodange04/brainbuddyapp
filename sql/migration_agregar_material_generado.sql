-- ============================================
-- MIGRACIÓN: Agregar campos para material generado
-- ============================================
-- Ejecuta esta migración en Supabase SQL Editor
-- para agregar los campos necesarios para guardar
-- el material teórico generado por IA

-- ============================================
-- 1. Agregar campo material_generado a sesionestudio
-- ============================================
-- Este campo guardará el contenido teórico generado por IA en formato JSONB
ALTER TABLE public.sesionestudio
ADD COLUMN IF NOT EXISTS material_generado JSONB;

-- ============================================
-- 2. Agregar campo material_estado a sesionestudio
-- ============================================
-- Este campo trackeará el estado de generación del material
-- Valores posibles: 'pendiente', 'generando', 'listo', 'error'
ALTER TABLE public.sesionestudio
ADD COLUMN IF NOT EXISTS material_estado VARCHAR(20) DEFAULT 'pendiente'
CHECK (material_estado IN ('pendiente', 'generando', 'listo', 'error'));

-- ============================================
-- 3. Crear índice para búsquedas rápidas
-- ============================================
CREATE INDEX IF NOT EXISTS idx_sesionestudio_material_estado 
ON public.sesionestudio(material_estado);

-- ============================================
-- 4. Actualizar sesiones existentes
-- ============================================
-- Marcar todas las sesiones existentes como 'pendiente'
UPDATE public.sesionestudio
SET material_estado = 'pendiente'
WHERE material_estado IS NULL;

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
  AND column_name IN ('material_generado', 'material_estado')
ORDER BY column_name;




