-- =====================================================
-- BRAIN BUDDY - ESQUEMA DE BASE DE DATOS COMPLETO
-- =====================================================

-- 1. TABLA USUARIOS (ya existe, agregar columnas faltantes)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS codigo_vinculacion VARCHAR(6) UNIQUE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS avatar_color VARCHAR(7) DEFAULT '#8B5CF6';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS puntos_totales INTEGER DEFAULT 0;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS racha_dias INTEGER DEFAULT 0;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);

-- 2. TABLA ALUMNO (ya existe, agregar columnas faltantes)
ALTER TABLE alumno ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE alumno ADD COLUMN IF NOT EXISTS codigo_vinculacion VARCHAR(6) UNIQUE;
ALTER TABLE alumno ADD COLUMN IF NOT EXISTS avatar_color VARCHAR(7) DEFAULT '#8B5CF6';
ALTER TABLE alumno ADD COLUMN IF NOT EXISTS puntos_totales INTEGER DEFAULT 0;
ALTER TABLE alumno ADD COLUMN IF NOT EXISTS racha_dias INTEGER DEFAULT 0;

-- 3. TABLA PADRE (ya existe, agregar columnas faltantes)
ALTER TABLE padre ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);

-- 4. TABLA DISPONIBILIDAD (nueva)
CREATE TABLE IF NOT EXISTS disponibilidad (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6), -- 0=Domingo, 1=Lunes, etc.
    turno VARCHAR(10) NOT NULL CHECK (turno IN ('Mañana', 'Tarde', 'Noche')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, dia_semana, turno)
);

-- 5. TABLA EXAMEN (mejorada)
CREATE TABLE IF NOT EXISTS examen (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    materia VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    temario JSONB NOT NULL, -- Array de temas
    archivos_subidos JSONB DEFAULT '[]', -- URLs de archivos subidos
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'cancelado')),
    total_sesiones_planificadas INTEGER DEFAULT 0,
    sesiones_completadas INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 6. TABLA SESION ESTUDIO (mejorada)
CREATE TABLE IF NOT EXISTS sesion_estudio (
    id SERIAL PRIMARY KEY,
    examen_id INTEGER NOT NULL REFERENCES examen(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    tema VARCHAR(255) NOT NULL,
    fecha_programada TIMESTAMP WITH TIME ZONE NOT NULL,
    estado VARCHAR(20) DEFAULT 'NoCompletada' CHECK (estado IN ('NoCompletada', 'Completada')),
    secuencia INTEGER NOT NULL,
    teoria_procesada JSONB, -- Contenido teórico generado por IA
    puntaje_obtenido INTEGER DEFAULT 0,
    tiempo_estudiado INTEGER DEFAULT 0, -- en minutos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABLA MINI QUIZ (mejorada)
CREATE TABLE IF NOT EXISTS mini_quiz (
    id SERIAL PRIMARY KEY,
    sesion_id INTEGER NOT NULL REFERENCES sesion_estudio(id) ON DELETE CASCADE,
    preguntas JSONB NOT NULL, -- Array de preguntas con opciones
    puntaje_maximo INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABLA QUIZ ATTEMPT (mejorada)
CREATE TABLE IF NOT EXISTS quiz_attempt (
    id SERIAL PRIMARY KEY,
    mini_quiz_id INTEGER NOT NULL REFERENCES mini_quiz(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha_intento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    respuestas_usuario JSONB NOT NULL, -- Respuestas del usuario
    puntaje_obtenido INTEGER NOT NULL,
    intento_num INTEGER DEFAULT 1,
    vidas_restantes INTEGER DEFAULT 3,
    tiempo_transcurrido INTEGER DEFAULT 0, -- en segundos
    status VARCHAR(20) DEFAULT 'completado' CHECK (status IN ('en_progreso', 'completado', 'abandonado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABLA PADRE ALUMNO (mejorada)
CREATE TABLE IF NOT EXISTS padre_alumno (
    id SERIAL PRIMARY KEY,
    padre_id INTEGER NOT NULL REFERENCES padre(id) ON DELETE CASCADE,
    alumno_id INTEGER NOT NULL REFERENCES alumno(id) ON DELETE CASCADE,
    codigo_vinculacion VARCHAR(6) NOT NULL,
    vinculado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(padre_id, alumno_id)
);

-- 10. TABLA AVATAR TROFEO (nueva)
CREATE TABLE IF NOT EXISTS avatar_trofeo (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    trofeo_id VARCHAR(50) NOT NULL, -- ID del trofeo (ej: 'primera_sesion')
    fecha_obtencion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, trofeo_id)
);

-- 11. TABLA REPORTE GENERAL (mejorada)
CREATE TABLE IF NOT EXISTS reporte_general (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    horas_estudio DECIMAL(5,2) DEFAULT 0.0,
    sesiones_completadas INTEGER DEFAULT 0,
    sesiones_no_realizadas INTEGER DEFAULT 0,
    puntaje_promedio_examen DECIMAL(5,2) DEFAULT 0.0,
    puntos_totales INTEGER DEFAULT 0,
    racha_actual INTEGER DEFAULT 0,
    racha_maxima INTEGER DEFAULT 0,
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id)
);

-- 12. TABLA REPORTE DETALLADO (mejorada)
CREATE TABLE IF NOT EXISTS reporte_detallado (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    examen_id INTEGER NOT NULL REFERENCES examen(id) ON DELETE CASCADE,
    generado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    detalles_sesion JSONB NOT NULL, -- Detalles de cada sesión
    puntaje_promedio DECIMAL(5,2) DEFAULT 0.0,
    tiempo_total_estudio INTEGER DEFAULT 0, -- en minutos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_codigo_vinculacion ON usuarios(codigo_vinculacion);
CREATE INDEX IF NOT EXISTS idx_examen_usuario_id ON examen(usuario_id);
CREATE INDEX IF NOT EXISTS idx_examen_fecha ON examen(fecha);
CREATE INDEX IF NOT EXISTS idx_sesion_estudio_examen_id ON sesion_estudio(examen_id);
CREATE INDEX IF NOT EXISTS idx_sesion_estudio_fecha ON sesion_estudio(fecha_programada);
CREATE INDEX IF NOT EXISTS idx_quiz_attempt_usuario_id ON quiz_attempt(usuario_id);
CREATE INDEX IF NOT EXISTS idx_padre_alumno_codigo ON padre_alumno(codigo_vinculacion);

-- =====================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a tablas que lo necesiten
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_examen_updated_at BEFORE UPDATE ON examen FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sesion_estudio_updated_at BEFORE UPDATE ON sesion_estudio FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCIONES ÚTILES
-- =====================================================

-- Función para generar código de vinculación único
CREATE OR REPLACE FUNCTION generar_codigo_vinculacion()
RETURNS VARCHAR(6) AS $$
DECLARE
    codigo VARCHAR(6);
    existe BOOLEAN;
BEGIN
    LOOP
        codigo := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
        SELECT EXISTS(SELECT 1 FROM usuarios WHERE codigo_vinculacion = codigo) INTO existe;
        IF NOT existe THEN
            EXIT;
        END IF;
    END LOOP;
    RETURN codigo;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar reporte general
CREATE OR REPLACE FUNCTION actualizar_reporte_general(usuario_id_param INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO reporte_general (usuario_id, horas_estudio, sesiones_completadas, puntos_totales, actualizado_en)
    SELECT 
        usuario_id_param,
        COALESCE(SUM(tiempo_estudiado), 0) / 60.0, -- Convertir minutos a horas
        COALESCE(COUNT(CASE WHEN estado = 'Completada' THEN 1 END), 0),
        COALESCE(SUM(puntaje_obtenido), 0)
    FROM sesion_estudio se
    JOIN examen e ON se.examen_id = e.id
    WHERE e.usuario_id = usuario_id_param
    ON CONFLICT (usuario_id) DO UPDATE SET
        horas_estudio = EXCLUDED.horas_estudio,
        sesiones_completadas = EXCLUDED.sesiones_completadas,
        puntos_totales = EXCLUDED.puntos_totales,
        actualizado_en = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE usuarios IS 'Tabla central de usuarios con información básica';
COMMENT ON TABLE alumno IS 'Tabla específica para estudiantes';
COMMENT ON TABLE padre IS 'Tabla específica para padres';
COMMENT ON TABLE examen IS 'Exámenes creados por los alumnos';
COMMENT ON TABLE sesion_estudio IS 'Sesiones de estudio programadas';
COMMENT ON TABLE mini_quiz IS 'Quizzes asociados a cada sesión';
COMMENT ON TABLE quiz_attempt IS 'Intentos de quiz realizados por usuarios';
COMMENT ON TABLE disponibilidad IS 'Horarios disponibles de estudio';
COMMENT ON TABLE padre_alumno IS 'Vinculación entre padres e hijos';
COMMENT ON TABLE avatar_trofeo IS 'Trofeos obtenidos por usuarios';
COMMENT ON TABLE reporte_general IS 'Reportes generales de progreso';
COMMENT ON TABLE reporte_detallado IS 'Reportes detallados por examen';

