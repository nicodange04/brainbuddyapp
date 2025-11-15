// services/progreso.ts
// Servicios para obtener datos de progreso del usuario

import { supabase } from './supabase';
import { DesignColors } from '@/constants/design';

export interface MetricasProgreso {
  sesionesCompletadas: number;
  sesionesTotales: number;
  promedioPuntaje: number;
  rachaActual: number;
  puntosTotales: number;
}

export interface HorasPorDia {
  label: string; // 'Lun', 'Mar', etc.
  value: number; // horas
  color: string;
}

export interface ProgresoExamen {
  id: string;
  name: string;
  subject: string;
  sessionsCompleted: number;
  sessionsTotal: number;
  averageScore: number;
  icon: string;
  color: string;
}

/**
 * Obtiene las métricas principales de progreso del usuario
 */
export async function getMetricasProgreso(alumnoId: string): Promise<MetricasProgreso> {
  try {
    // 1. Obtener todos los exámenes del alumno
    const { data: examenes, error: examenesError } = await supabase
      .from('examen')
      .select('examen_id, total_sesiones_planificadas')
      .eq('alumno_id', alumnoId);

    if (examenesError) {
      console.error('Error al obtener exámenes:', examenesError);
      return getMetricasVacias();
    }

    if (!examenes || examenes.length === 0) {
      return getMetricasVacias();
    }

    const examenIds = examenes.map(e => e.examen_id);
    const sesionesTotales = examenes.reduce((sum, e) => sum + (e.total_sesiones_planificadas || 0), 0);

    // 2. Obtener todas las sesiones de estudio
    // Nota: Si puntaje_obtenido no existe, usaremos 0 como valor por defecto
    const { data: sesiones, error: sesionesError } = await supabase
      .from('sesionestudio')
      .select('estado, updated_at')
      .in('examen_id', examenIds);

    if (sesionesError) {
      console.error('Error al obtener sesiones:', sesionesError);
      return getMetricasVacias();
    }

    const sesionesCompletadas = sesiones?.filter(s => s.estado === 'Completada') || [];
    const sesionesCompletadasCount = sesionesCompletadas.length;

    // 3. Calcular promedio de puntaje
    // Por ahora estimamos 100 puntos por sesión completada hasta que se implemente puntaje_obtenido
    const promedioPuntaje = sesionesCompletadasCount > 0 ? 100 : 0;

    // 4. Calcular puntos totales (estimado: 100 puntos por sesión completada)
    const puntosTotales = sesionesCompletadasCount * 100;

    // 5. Calcular racha actual (días consecutivos con sesiones completadas)
    const rachaActual = calcularRachaActual(sesionesCompletadas);

    return {
      sesionesCompletadas: sesionesCompletadasCount,
      sesionesTotales,
      promedioPuntaje,
      rachaActual,
      puntosTotales,
    };
  } catch (error) {
    console.error('Error al obtener métricas de progreso:', error);
    return getMetricasVacias();
  }
}

/**
 * Obtiene las horas de estudio por día de la semana (última semana)
 */
export async function getHorasPorDiaSemana(alumnoId: string): Promise<HorasPorDia[]> {
  try {
    // Obtener exámenes del alumno
    const { data: examenes, error: examenesError } = await supabase
      .from('examen')
      .select('examen_id')
      .eq('alumno_id', alumnoId);

    if (examenesError || !examenes || examenes.length === 0) {
      return getDiasSemanaVacios();
    }

    const examenIds = examenes.map(e => e.examen_id);

    // Calcular fecha de inicio (hace 7 días)
    const hoy = new Date();
    const hace7Dias = new Date(hoy);
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    hace7Dias.setHours(0, 0, 0, 0);

    // Obtener sesiones completadas de la última semana
    // Nota: Si tiempo_estudio no existe, usaremos 45 minutos como valor por defecto
    const { data: sesiones, error: sesionesError } = await supabase
      .from('sesionestudio')
      .select('fecha, updated_at')
      .in('examen_id', examenIds)
      .eq('estado', 'Completada')
      .gte('updated_at', hace7Dias.toISOString());

    if (sesionesError) {
      console.error('Error al obtener sesiones para gráfico:', sesionesError);
      return getDiasSemanaVacios();
    }

    // Agrupar por día de la semana
    const horasPorDia = new Map<number, number>(); // 0 = Domingo, 1 = Lunes, etc.
    
    sesiones?.forEach(sesion => {
      const fecha = new Date(sesion.updated_at || sesion.fecha);
      const diaSemana = fecha.getDay(); // 0 = Domingo, 1 = Lunes, etc.
      const horas = (sesion.tiempo_estudio || 45) / 60; // Convertir minutos a horas
      
      const horasActuales = horasPorDia.get(diaSemana) || 0;
      horasPorDia.set(diaSemana, horasActuales + horas);
    });

    // Mapear a formato requerido (Lun, Mar, Mié, Jue, Vie, Sáb, Dom)
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const diasOrdenados = [1, 2, 3, 4, 5, 6, 0]; // Lunes a Domingo
    
    return diasOrdenados.map((dia, index) => {
      const horas = horasPorDia.get(dia) || 0;
      // Alternar colores entre orange y coral
      const color = index % 2 === 0 
        ? DesignColors.accent.orange 
        : DesignColors.accent.coral;
      
      return {
        label: diasSemana[dia],
        value: Math.round(horas * 10) / 10, // Redondear a 1 decimal
        color,
      };
    });
  } catch (error) {
    console.error('Error al obtener horas por día:', error);
    return getDiasSemanaVacios();
  }
}

/**
 * Obtiene la lista de exámenes con su progreso detallado
 */
export async function getProgresoExamenes(alumnoId: string): Promise<ProgresoExamen[]> {
  try {
    // Obtener todos los exámenes del alumno
    const { data: examenes, error: examenesError } = await supabase
      .from('examen')
      .select('examen_id, nombre, materia, total_sesiones_planificadas')
      .eq('alumno_id', alumnoId)
      .order('created_at', { ascending: false });

    if (examenesError) {
      console.error('Error al obtener exámenes:', examenesError);
      return [];
    }

    if (!examenes || examenes.length === 0) {
      return [];
    }

    const examenIds = examenes.map(e => e.examen_id);

    // Obtener sesiones de todos los exámenes
    // Nota: Si puntaje_obtenido no existe, usaremos 0 como valor por defecto
    const { data: sesiones, error: sesionesError } = await supabase
      .from('sesionestudio')
      .select('examen_id, estado')
      .in('examen_id', examenIds);

    if (sesionesError) {
      console.error('Error al obtener sesiones:', sesionesError);
      return [];
    }

    // Agrupar sesiones por examen y calcular estadísticas
    const sesionesPorExamen = new Map<string, typeof sesiones>();
    sesiones?.forEach(sesion => {
      const sesionesExamen = sesionesPorExamen.get(sesion.examen_id) || [];
      sesionesExamen.push(sesion);
      sesionesPorExamen.set(sesion.examen_id, sesionesExamen);
    });

    // Mapear a formato requerido
    return examenes.map(examen => {
      const sesionesExamen = sesionesPorExamen.get(examen.examen_id) || [];
      const sesionesCompletadas = sesionesExamen.filter(s => s.estado === 'Completada');
      const sesionesCompletadasCount = sesionesCompletadas.length;
      
      // Calcular promedio de puntaje
      // Por ahora estimamos 100 puntos por sesión completada hasta que se implemente puntaje_obtenido
      const averageScore = sesionesCompletadasCount > 0 ? 100 : 0;

      // Obtener icono y color según materia
      const { icon, color } = obtenerIconoYColorPorMateria(examen.materia);

      return {
        id: examen.examen_id,
        name: examen.nombre,
        subject: examen.materia,
        sessionsCompleted: sesionesCompletadasCount,
        sessionsTotal: examen.total_sesiones_planificadas || 0,
        averageScore,
        icon,
        color,
      };
    });
  } catch (error) {
    console.error('Error al obtener progreso de exámenes:', error);
    return [];
  }
}

/**
 * Calcula la racha actual (días consecutivos con sesiones completadas)
 */
function calcularRachaActual(sesionesCompletadas: Array<{ updated_at?: string; fecha?: string }>): number {
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
 * Obtiene icono y color según la materia
 */
function obtenerIconoYColorPorMateria(materia: string): { icon: string; color: string } {
  const materiaLower = materia.toLowerCase();
  
  // Mapeo de materias a iconos y colores
  if (materiaLower.includes('matemática') || materiaLower.includes('matematica')) {
    return { icon: 'calculator', color: DesignColors.primary.violet };
  } else if (materiaLower.includes('historia')) {
    return { icon: 'book', color: DesignColors.supporting.blue };
  } else if (materiaLower.includes('física') || materiaLower.includes('fisica')) {
    return { icon: 'flask', color: DesignColors.accent.orange };
  } else if (materiaLower.includes('química') || materiaLower.includes('quimica')) {
    return { icon: 'flask', color: DesignColors.supporting.green };
  } else if (materiaLower.includes('biología') || materiaLower.includes('biologia')) {
    return { icon: 'leaf', color: DesignColors.supporting.green };
  } else if (materiaLower.includes('literatura') || materiaLower.includes('lengua')) {
    return { icon: 'book', color: DesignColors.supporting.pink };
  } else if (materiaLower.includes('geografía') || materiaLower.includes('geografia')) {
    return { icon: 'globe', color: DesignColors.supporting.blue };
  } else {
    // Por defecto
    return { icon: 'book', color: DesignColors.primary.violet };
  }
}

/**
 * Retorna métricas vacías
 */
function getMetricasVacias(): MetricasProgreso {
  return {
    sesionesCompletadas: 0,
    sesionesTotales: 0,
    promedioPuntaje: 0,
    rachaActual: 0,
    puntosTotales: 0,
  };
}

/**
 * Retorna días de la semana vacíos
 */
function getDiasSemanaVacios(): HorasPorDia[] {
  const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  return diasSemana.map((dia, index) => ({
    label: dia,
    value: 0,
    color: index % 2 === 0 ? DesignColors.accent.orange : DesignColors.accent.coral,
  }));
}

