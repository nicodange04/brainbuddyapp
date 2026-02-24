-- =====================================================
-- SCRIPT PARA LIMPIAR TODOS LOS DATOS DEL PROYECTO
-- Mantiene las tablas pero elimina todos los registros
-- =====================================================
-- 
-- ⚠️ ADVERTENCIA: Este script eliminará TODOS los datos
-- ⚠️ Las tablas se mantendrán pero quedarán vacías
-- 
-- Orden de eliminación (respetando foreign keys):
-- 1. Tablas dependientes (con foreign keys)
-- 2. Tablas principales
-- =====================================================

-- =====================================================
-- 1. ELIMINAR DATOS DE TABLAS DEPENDIENTES
-- (Orden: primero las que tienen foreign keys)
-- =====================================================

-- Tablas de quizzes y sesiones
DELETE FROM miniquiz;
DELETE FROM sesionestudio;

-- Tablas de materiales
DELETE FROM materialfile;
DELETE FROM material;

-- Tablas de amigos
DELETE FROM alumno_amigo;

-- Tablas de vinculaciones
DELETE FROM padre_alumno;

-- Tablas de disponibilidad
DELETE FROM disponibilidad;

-- Tablas de exámenes
DELETE FROM examen;

-- =====================================================
-- 2. ELIMINAR DATOS DE TABLAS PRINCIPALES
-- =====================================================

-- Tabla de perfil de aprendizaje
DELETE FROM perfil_aprendizaje;

-- Tablas específicas de roles
DELETE FROM alumno;
DELETE FROM padre;

-- Tabla principal de usuarios (última, porque otras dependen de ella)
DELETE FROM usuarios;

-- =====================================================
-- 4. VERIFICAR QUE LAS TABLAS ESTÁN VACÍAS
-- =====================================================

-- Mostrar conteo de filas en cada tabla (debería ser 0)
SELECT 'usuarios' as tabla, COUNT(*) as filas FROM usuarios
UNION ALL
SELECT 'alumno', COUNT(*) FROM alumno
UNION ALL
SELECT 'padre', COUNT(*) FROM padre
UNION ALL
SELECT 'examen', COUNT(*) FROM examen
UNION ALL
SELECT 'sesionestudio', COUNT(*) FROM sesionestudio
UNION ALL
SELECT 'disponibilidad', COUNT(*) FROM disponibilidad
UNION ALL
SELECT 'padre_alumno', COUNT(*) FROM padre_alumno
UNION ALL
SELECT 'miniquiz', COUNT(*) FROM miniquiz
UNION ALL
SELECT 'material', COUNT(*) FROM material
UNION ALL
SELECT 'materialfile', COUNT(*) FROM materialfile
UNION ALL
SELECT 'perfil_aprendizaje', COUNT(*) FROM perfil_aprendizaje
UNION ALL
SELECT 'alumno_amigo', COUNT(*) FROM alumno_amigo;

-- =====================================================
-- ✅ COMPLETADO
-- =====================================================
-- Todas las tablas están vacías pero la estructura se mantiene
-- Puedes empezar a crear nuevos usuarios y datos desde cero
