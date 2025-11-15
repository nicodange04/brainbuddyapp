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
 * Calcula la racha actual (días consecutivos con sesiones completadas)
 */
function calcularRachaActual(sesionesCompletadas: Array<{ updated_at?: string }>): number {
  if (sesionesCompletadas.length === 0) return 0;

  // Ordenar sesiones por fecha (más reciente primero)
  const sesionesOrdenadas = sesionesCompletadas
    .map(s => ({
      fecha: new Date(s.updated_at || new Date()),
    }))
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

  // Obtener fechas únicas (solo el día, sin hora)
  const fechasUnicas = new Set<string>();
  sesionesOrdenadas.forEach(s => {
    const fechaStr = s.fecha.toISOString().split('T')[0];
    fechasUnicas.add(fechaStr);
  });

  const fechasArray = Array.from(fechasUnicas)
    .map(f => new Date(f))
    .sort((a, b) => b.getTime() - a.getTime());

  if (fechasArray.length === 0) return 0;

  // Calcular días consecutivos desde hoy hacia atrás
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  let racha = 0;
  let fechaEsperada = new Date(hoy);

  for (const fecha of fechasArray) {
    fecha.setHours(0, 0, 0, 0);
    
    // Si la fecha coincide con la esperada, incrementar racha
    if (fecha.getTime() === fechaEsperada.getTime()) {
      racha++;
      fechaEsperada.setDate(fechaEsperada.getDate() - 1);
    } else if (fecha.getTime() < fechaEsperada.getTime()) {
      // Si la fecha es anterior a la esperada, romper la racha
      break;
    }
  }

  return racha;
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

    // Obtener sesiones completadas con updated_at para calcular racha
    const { data: sesiones, error: sesionesError } = await supabase
      .from('sesionestudio')
      .select('estado, updated_at')
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

    // Calcular racha actual
    const rachaActual = calcularRachaActual(sesionesCompletadas);
    
    // Calcular racha máxima (por ahora igual a la actual, se puede mejorar)
    const rachaMaxima = rachaActual;

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
 * Obtiene los trofeos del usuario calculando dinámicamente cuáles están obtenidos
 */
export async function getTrofeosUsuario(usuarioId: string): Promise<Trofeo[]> {
  try {
    // Obtener estadísticas del usuario para calcular trofeos
    const estadisticas = await getEstadisticasUsuario(usuarioId);

    // Definir todos los trofeos disponibles
    const todosLosTrofeos: Omit<Trofeo, 'obtenido'>[] = [
      {
        trofeo_id: '1',
        nombre: 'Primera Sesión',
        descripcion: 'Completa tu primera sesión de estudio',
        icono: 'trophy',
      },
      {
        trofeo_id: '2',
        nombre: 'Estudiante Dedicado',
        descripcion: 'Completa 10 sesiones',
        icono: 'star',
      },
      {
        trofeo_id: '3',
        nombre: 'Racha de Fuego',
        descripcion: 'Mantén una racha de 7 días',
        icono: 'flame',
      },
      {
        trofeo_id: '4',
        nombre: 'Maestro',
        descripcion: 'Completa 50 sesiones',
        icono: 'school',
      },
      {
        trofeo_id: '5',
        nombre: 'Perfeccionista',
        descripcion: 'Obtén 100% en 5 quizzes',
        icono: 'diamond',
      },
      {
        trofeo_id: '6',
        nombre: 'Leyenda',
        descripcion: 'Completa 100 sesiones',
        icono: 'star-outline',
      },
    ];

    // Calcular qué trofeos están obtenidos basándose en las estadísticas
    return todosLosTrofeos.map(trofeo => {
      let obtenido = false;

      switch (trofeo.trofeo_id) {
        case '1': // Primera Sesión
          obtenido = estadisticas.sesiones_completadas >= 1;
          break;
        case '2': // Estudiante Dedicado
          obtenido = estadisticas.sesiones_completadas >= 10;
          break;
        case '3': // Racha de Fuego
          obtenido = estadisticas.racha_actual >= 7;
          break;
        case '4': // Maestro
          obtenido = estadisticas.sesiones_completadas >= 50;
          break;
        case '5': // Perfeccionista
          // Por ahora siempre false hasta que tengamos datos de puntajes reales
          obtenido = false;
          break;
        case '6': // Leyenda
          obtenido = estadisticas.sesiones_completadas >= 100;
          break;
      }

      return {
        ...trofeo,
        obtenido,
      };
    });
  } catch (error) {
    console.error('Error al obtener trofeos:', error);
    // Retornar trofeos por defecto sin obtener
    return [
      {
        trofeo_id: '1',
        nombre: 'Primera Sesión',
        descripcion: 'Completa tu primera sesión de estudio',
        icono: 'trophy',
        obtenido: false,
      },
      {
        trofeo_id: '2',
        nombre: 'Estudiante Dedicado',
        descripcion: 'Completa 10 sesiones',
        icono: 'star',
        obtenido: false,
      },
      {
        trofeo_id: '3',
        nombre: 'Racha de Fuego',
        descripcion: 'Mantén una racha de 7 días',
        icono: 'flame',
        obtenido: false,
      },
      {
        trofeo_id: '4',
        nombre: 'Maestro',
        descripcion: 'Completa 50 sesiones',
        icono: 'school',
        obtenido: false,
      },
      {
        trofeo_id: '5',
        nombre: 'Perfeccionista',
        descripcion: 'Obtén 100% en 5 quizzes',
        icono: 'diamond',
        obtenido: false,
      },
      {
        trofeo_id: '6',
        nombre: 'Leyenda',
        descripcion: 'Completa 100 sesiones',
        icono: 'star-outline',
        obtenido: false,
      },
    ];
  }
}

