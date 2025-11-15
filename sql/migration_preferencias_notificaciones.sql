-- sql/migration_preferencias_notificaciones.sql
-- Migración para agregar columna de preferencias de notificaciones

-- Agregar columna preferencias_notificaciones a la tabla usuarios
ALTER TABLE public.usuarios
ADD COLUMN IF NOT EXISTS preferencias_notificaciones JSONB DEFAULT '{
  "material_listo": true,
  "recordatorio_sesion": true,
  "logros_trofeos": true,
  "resumen_semanal": false,
  "recordatorio_examen": true
}'::jsonb;

-- Comentario para documentar la columna
COMMENT ON COLUMN public.usuarios.preferencias_notificaciones IS 'Preferencias de notificaciones del usuario en formato JSON';

