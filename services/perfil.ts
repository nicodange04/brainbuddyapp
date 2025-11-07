// services/perfil.ts
// Servicios para obtener datos del perfil del usuario

import { supabase } from './supabase';

export interface EstadisticasPerfil {
  puntos_totales: number;
  racha_actual: number;
  racha_maxima: number;
  sesiones_completadas: number;
  horas_estudiadas: number;
}

export interface Trofeo {
  trofeo_id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  obtenido: boolean;
}

/**
 * Obtiene las estadísticas del usuario
 */
export async function getEstadisticasUsuario(usuarioId: string): Promise<EstadisticasPerfil> {
  try {
    // Obtener estadísticas desde sesiones de estudio
    const { data: examenes, error: examenesError } = await supabase
      .from('examen')
      .select('examen_id')
      .eq('alumno_id', usuarioId);

    if (examenesError || !examenes || examenes.length === 0) {
      return {
        puntos_totales: 0,
        racha_actual: 0,
        racha_maxima: 0,
        sesiones_completadas: 0,
        horas_estudiadas: 0,
      };
    }

    const examenIds = examenes.map(e => e.examen_id);

    // Obtener sesiones completadas
    const { data: sesiones, error: sesionesError } = await supabase
      .from('sesionestudio')
      .select('estado, observacion')
      .in('examen_id', examenIds);

    if (sesionesError) {
      console.error('Error al obtener sesiones:', sesionesError);
      return {
        puntos_totales: 0,
        racha_actual: 0,
        racha_maxima: 0,
        sesiones_completadas: 0,
        horas_estudiadas: 0,
      };
    }

    const sesionesCompletadas = sesiones?.filter(s => s.estado === 'Completada') || [];
    // Por ahora puntos y horas son estimados, se pueden calcular mejor cuando tengamos más datos
    const puntosTotales = sesionesCompletadas.length * 100; // Estimado: 100 puntos por sesión
    const horasEstudiadas = sesionesCompletadas.length * 0.75; // Estimado: 45 min por sesión

    // Calcular racha (simplificado - contar días consecutivos con sesiones completadas)
    // Por ahora retornamos valores por defecto, esto se puede mejorar con lógica más compleja
    const rachaActual = 0; // TODO: Implementar cálculo de racha
    const rachaMaxima = 0; // TODO: Implementar cálculo de racha máxima

    return {
      puntos_totales: puntosTotales,
      racha_actual: rachaActual,
      racha_maxima: rachaMaxima,
      sesiones_completadas: sesionesCompletadas.length,
      horas_estudiadas: Math.round(horasEstudiadas * 100) / 100, // Redondear a 2 decimales
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return {
      puntos_totales: 0,
      racha_actual: 0,
      racha_maxima: 0,
      sesiones_completadas: 0,
      horas_estudiadas: 0,
    };
  }
}

/**
 * Obtiene los trofeos del usuario (por ahora retornamos datos mock)
 */
export async function getTrofeosUsuario(usuarioId: string): Promise<Trofeo[]> {
  // TODO: Implementar cuando exista la tabla de trofeos
  // Por ahora retornamos datos mock
  return [
    {
      trofeo_id: '1',
      nombre: 'Primera Sesión',
      descripcion: 'Completa tu primera sesión de estudio',
      icono: '🏆',
      obtenido: true,
    },
    {
      trofeo_id: '2',
      nombre: 'Estudiante Dedicado',
      descripcion: 'Completa 10 sesiones',
      icono: '⭐',
      obtenido: true,
    },
    {
      trofeo_id: '3',
      nombre: 'Racha de Fuego',
      descripcion: 'Mantén una racha de 7 días',
      icono: '🔥',
      obtenido: true,
    },
    {
      trofeo_id: '4',
      nombre: 'Maestro',
      descripcion: 'Completa 50 sesiones',
      icono: '👑',
      obtenido: false,
    },
    {
      trofeo_id: '5',
      nombre: 'Perfeccionista',
      descripcion: 'Obtén 100% en 5 quizzes',
      icono: '💎',
      obtenido: false,
    },
    {
      trofeo_id: '6',
      nombre: 'Leyenda',
      descripcion: 'Completa 100 sesiones',
      icono: '🌟',
      obtenido: false,
    },
  ];
}

