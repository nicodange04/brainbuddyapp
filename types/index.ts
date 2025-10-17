// Tipos principales de la aplicación

// Tipos basados en tu estructura actual de Supabase
export interface Usuario {
  usuario_id: string;
  nombre: string;
  apellido: string;
  correo: string;
  password_hash: string;
  rol: 'alumno' | 'padre' | 'admin';
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Alumno {
  alumno_id: string;
  ranking_id?: number;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Padre {
  padre_id: string;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  admin_id: string;
  created_at: string;
  updated_at: string;
}

export interface Suscripcion {
  suscripcion_id: string;
  usuario_id: string;
  plan: string;
  estado: string;
  fecha_inicio: string;
  fecha_fin?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

// Tipos extendidos para funcionalidades futuras
export interface UsuarioCompleto extends Usuario {
  alumno?: Alumno;
  padre?: Padre;
  admin?: Admin;
  suscripcion?: Suscripcion;
  // Campos adicionales para la app
  codigo_vinculacion?: string;
  avatar_color?: string;
  puntos_totales?: number;
  racha_dias?: number;
}

export interface Examen {
  id: string;
  usuario_id: string;
  nombre: string;
  materia: string;
  fecha: string;
  estado: 'activo' | 'completado' | 'cancelado';
  created_at: string;
  updated_at: string;
}

export interface SesionEstudio {
  id: string;
  examen_id: string;
  nombre: string;
  tema: string;
  fecha: string;
  estado: 'NoCompletada' | 'Completada';
  material_id?: string;
  quiz_id?: string;
  puntaje_obtenido?: number;
  created_at: string;
  updated_at: string;
}

export interface Disponibilidad {
  id: string;
  usuario_id: string;
  dia_semana: number; // 0=Domingo, 1=Lunes, etc.
  turno: 'Mañana' | 'Tarde' | 'Noche';
  created_at: string;
}

export interface Trofeo {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  condicion: string;
  puntos_requeridos?: number;
}

// Tipos para el wizard de crear examen
export interface PasoExamen {
  nombre: string;
  materia: string;
  fecha: string;
  temas: string[];
  archivos: ArchivoSubido[];
}

export interface ArchivoSubido {
  uri: string;
  name: string;
  type: string;
  size: number;
}

// Tipos para la sesión de estudio
export interface ContenidoTeorico {
  secciones: Array<{
    titulo: string;
    contenido: string;
    tip?: string;
  }>;
}

export interface PreguntaQuiz {
  pregunta: string;
  opciones: string[];
  respuesta_correcta: number;
  explicacion?: string;
}

export interface QuizCompleto {
  preguntas: PreguntaQuiz[];
  puntaje_maximo: number;
}

// Tipos para el estado de la sesión
export interface EstadoSesion {
  fase: 'teoria' | 'descanso' | 'quiz' | 'completada';
  tiempo_restante: number;
  pregunta_actual?: number;
  vidas_restantes?: number;
  puntaje_actual?: number;
  racha_actual?: number;
}

// Tipos para el calendario
export interface EventoCalendario {
  fecha: string;
  sesiones: SesionEstudio[];
  color: 'verde' | 'amarillo' | 'rojo' | 'azul';
}

// Tipos para el progreso
export interface EstadisticasUsuario {
  sesiones_completadas: number;
  horas_estudiadas: number;
  promedio_puntaje: number;
  racha_actual: number;
  racha_maxima: number;
  trofeos_obtenidos: number;
  puntos_totales: number;
}

// Tipos para la navegación
export type RootStackParamList = {
  '(tabs)': undefined;
  modal: undefined;
  'crear-examen': undefined;
  'sesion-estudio': { sesionId: string };
  'disponibilidad': undefined;
  'progreso-detalle': undefined;
};

export type TabParamList = {
  home: undefined;
  calendario: undefined;
  progreso: undefined;
  perfil: undefined;
};

// Colores para avatares
export const AVATAR_COLORS = [
  '#3B82F6', // azul
  '#10B981', // verde
  '#8B5CF6', // morado
  '#F59E0B', // naranja
  '#EC4899', // rosa
] as const;

export type AvatarColor = typeof AVATAR_COLORS[number];

// Días de la semana
export const DIAS_SEMANA = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const;

export type DiaSemana = typeof DIAS_SEMANA[number];

// Turnos
export const TURNOS = ['Mañana', 'Tarde', 'Noche'] as const;

export type Turno = typeof TURNOS[number];


