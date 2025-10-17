// Configuraciones de la aplicación

export const APP_CONFIG = {
  // Configuración de sesiones de estudio
  SESION: {
    DURACION_TEORIA: 30 * 60, // 30 minutos en segundos
    DURACION_DESCANSO: 5 * 60, // 5 minutos en segundos
    DURACION_QUIZ: 10 * 60, // 10 minutos en segundos
    TOTAL_DURACION: 45 * 60, // 45 minutos en segundos
  },

  // Configuración de quiz
  QUIZ: {
    CANTIDAD_PREGUNTAS: 10,
    VIDAS_INICIALES: 3,
    PUNTOS_POR_CORRECTA: 10,
    PUNTOS_POR_SESION_COMPLETA: 70,
    PUNTOS_BONUS_QUIZ_PERFECTO: 30,
  },

  // Configuración de archivos
  ARCHIVOS: {
    MAX_ARCHIVOS: 5,
    MAX_TAMAÑO_MB: 10,
    TIPOS_PERMITIDOS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },

  // Configuración de avatares
  AVATAR: {
    COLORES: [
      '#3B82F6', // azul
      '#10B981', // verde
      '#8B5CF6', // morado
      '#F59E0B', // naranja
      '#EC4899', // rosa
    ],
  },

  // Configuración de códigos de vinculación
  CODIGO_VINCULACION: {
    LONGITUD: 6,
    CARACTERES: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  },

  // Configuración de trofeos
  TROFEOS: {
    PRIMERA_SESION: {
      id: 'primera_sesion',
      nombre: 'Primera Sesión',
      descripcion: 'Completa tu primera sesión de estudio',
      icono: '🎯',
      condicion: 'sesiones_completadas >= 1',
    },
    RACHA_7_DIAS: {
      id: 'racha_7_dias',
      nombre: 'Racha de Fuego',
      descripcion: 'Estudia 7 días consecutivos',
      icono: '🔥',
      condicion: 'racha_dias >= 7',
    },
    QUIZ_PERFECTO: {
      id: 'quiz_perfecto',
      nombre: 'Quiz Perfecto',
      descripcion: 'Obtén 100/100 en un quiz',
      icono: '⭐',
      condicion: 'puntaje_quiz = 100',
    },
    SESIONES_SEMANA: {
      id: 'sesiones_semana',
      nombre: 'Estudiante Dedicado',
      descripcion: 'Completa 10 sesiones en una semana',
      icono: '🏃',
      condicion: 'sesiones_semana >= 10',
    },
    MULTI_MATERIA: {
      id: 'multi_materia',
      nombre: 'Polímata',
      descripcion: 'Estudia 5 materias diferentes',
      icono: '📚',
      condicion: 'materias_diferentes >= 5',
    },
    HORAS_ACUMULADAS: {
      id: 'horas_acumuladas',
      nombre: 'Estudiante Experto',
      descripcion: 'Acumula 10 horas de estudio',
      icono: '💪',
      condicion: 'horas_estudiadas >= 10',
    },
  },
} as const;

// Configuración de colores para el calendario
export const CALENDAR_COLORS = {
  COMPLETADA: '#10B981', // verde
  PROXIMA: '#F59E0B', // amarillo
  ATRASADA: '#EF4444', // rojo
  FUTURA: '#3B82F6', // azul
} as const;

// Configuración de días de la semana
export const DIAS_SEMANA = [
  { id: 0, nombre: 'Domingo', corto: 'Dom' },
  { id: 1, nombre: 'Lunes', corto: 'Lun' },
  { id: 2, nombre: 'Martes', corto: 'Mar' },
  { id: 3, nombre: 'Miércoles', corto: 'Mié' },
  { id: 4, nombre: 'Jueves', corto: 'Jue' },
  { id: 5, nombre: 'Viernes', corto: 'Vie' },
  { id: 6, nombre: 'Sábado', corto: 'Sáb' },
] as const;

// Configuración de turnos
export const TURNOS = [
  { id: 'Mañana', nombre: 'Mañana', horario: '08:00 - 12:00' },
  { id: 'Tarde', nombre: 'Tarde', horario: '12:00 - 18:00' },
  { id: 'Noche', nombre: 'Noche', horario: '18:00 - 22:00' },
] as const;

// Configuración de materias comunes
export const MATERIAS_COMUNES = [
  'Matemáticas',
  'Historia',
  'Geografía',
  'Lengua y Literatura',
  'Biología',
  'Química',
  'Física',
  'Inglés',
  'Francés',
  'Educación Física',
  'Arte',
  'Música',
  'Filosofía',
  'Economía',
  'Informática',
] as const;


