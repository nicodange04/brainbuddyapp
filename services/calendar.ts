import { supabase } from './supabase';

export interface SesionCalendario {
  sesion_id: string;
  examen_id: string;
  nombre: string;
  tema: string;
  fecha: string; // TIMESTAMP
  estado: 'Completada' | 'NoCompletada';
  observacion?: string;
  examen_nombre?: string;
  examen_materia?: string;
  examen_fecha?: string;
}

export interface ExamenCalendario {
  examen_id: string;
  nombre: string;
  materia: string;
  fecha: string; // DATE
  total_sesiones_planificadas: number;
}

export interface DiaCalendario {
  fecha: string; // YYYY-MM-DD
  sesiones: SesionCalendario[];
  examenes: ExamenCalendario[];
  tieneActividades: boolean;
}

/**
 * Obtiene todas las sesiones de estudio de un alumno para un rango de fechas
 */
export async function getSesionesCalendario(
  alumnoId: string,
  fechaInicio: string,
  fechaFin: string
): Promise<SesionCalendario[]> {
  try {
    console.log('🔍 Buscando sesiones para:', { alumnoId, fechaInicio, fechaFin });
    
    // Primero obtener los exámenes del alumno
    const { data: examenes, error: examenesError } = await supabase
      .from('examen')
      .select('examen_id')
      .eq('alumno_id', alumnoId);

    if (examenesError) {
      console.error('❌ Error al obtener exámenes:', examenesError);
      throw examenesError;
    }

    const examenIds = examenes?.map(e => e.examen_id) || [];
    console.log('📚 Exámenes del alumno:', examenIds);

    if (examenIds.length === 0) {
      console.log('⚠️ No hay exámenes para este alumno');
      return [];
    }

    // Ahora obtener las sesiones de esos exámenes
    const { data, error } = await supabase
      .from('sesionestudio')
      .select(`
        sesion_id,
        examen_id,
        nombre,
        tema,
        fecha,
        estado,
        observacion,
        examen:examen_id (
          nombre,
          materia,
          fecha
        )
      `)
      .in('examen_id', examenIds)
      .gte('fecha', `${fechaInicio}T00:00:00`)
      .lte('fecha', `${fechaFin}T23:59:59`)
      .order('fecha', { ascending: true });

    if (error) {
      console.error('❌ Error en consulta sesiones:', error);
      throw error;
    }

    console.log('📊 Sesiones encontradas:', data?.length || 0);
    console.log('📋 Datos de sesiones:', data);
    console.log('🔍 Filtros aplicados:', { 
      examenIds, 
      fechaInicio: `${fechaInicio}T00:00:00`, 
      fechaFin: `${fechaFin}T23:59:59` 
    });

    // Transformar los datos para incluir información del examen
    const sesionesTransformadas: SesionCalendario[] = (data || []).map(sesion => ({
      sesion_id: sesion.sesion_id,
      examen_id: sesion.examen_id,
      nombre: sesion.nombre,
      tema: sesion.tema,
      fecha: sesion.fecha,
      estado: sesion.estado,
      observacion: sesion.observacion,
      examen_nombre: sesion.examen?.nombre,
      examen_materia: sesion.examen?.materia,
      examen_fecha: sesion.examen?.fecha
    }));

    return sesionesTransformadas;
  } catch (error) {
    console.error('Error al obtener sesiones del calendario:', error);
    throw error;
  }
}

/**
 * Obtiene todos los exámenes de un alumno para un rango de fechas
 */
export async function getExamenesCalendario(
  alumnoId: string,
  fechaInicio: string,
  fechaFin: string
): Promise<ExamenCalendario[]> {
  try {
    const { data, error } = await supabase
      .from('examen')
      .select('examen_id, nombre, materia, fecha, total_sesiones_planificadas')
      .eq('alumno_id', alumnoId)
      .gte('fecha', fechaInicio)
      .lte('fecha', fechaFin)
      .order('fecha', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener exámenes del calendario:', error);
    throw error;
  }
}

/**
 * Combina sesiones y exámenes por día para el calendario
 */
export async function getDiasCalendario(
  alumnoId: string,
  fechaInicio: string,
  fechaFin: string
): Promise<DiaCalendario[]> {
  try {
    const [sesiones, examenes] = await Promise.all([
      getSesionesCalendario(alumnoId, fechaInicio, fechaFin),
      getExamenesCalendario(alumnoId, fechaInicio, fechaFin)
    ]);

    // Crear un mapa de días
    const diasMap = new Map<string, DiaCalendario>();

    // Agregar sesiones por día
    sesiones.forEach(sesion => {
      const fechaSesion = sesion.fecha.split('T')[0]; // Extraer solo la fecha
      
      if (!diasMap.has(fechaSesion)) {
        diasMap.set(fechaSesion, {
          fecha: fechaSesion,
          sesiones: [],
          examenes: [],
          tieneActividades: false
        });
      }
      
      diasMap.get(fechaSesion)!.sesiones.push(sesion);
      diasMap.get(fechaSesion)!.tieneActividades = true;
    });

    // Agregar exámenes por día
    examenes.forEach(examen => {
      if (!diasMap.has(examen.fecha)) {
        diasMap.set(examen.fecha, {
          fecha: examen.fecha,
          sesiones: [],
          examenes: [],
          tieneActividades: false
        });
      }
      
      diasMap.get(examen.fecha)!.examenes.push(examen);
      diasMap.get(examen.fecha)!.tieneActividades = true;
    });

    // Convertir mapa a array y ordenar por fecha
    return Array.from(diasMap.values()).sort((a, b) => 
      new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
    );
  } catch (error) {
    console.error('Error al obtener días del calendario:', error);
    throw error;
  }
}

/**
 * Obtiene las actividades de una semana específica
 */
export async function getActividadesSemana(
  alumnoId: string,
  fechaInicioSemana: string
): Promise<DiaCalendario[]> {
  const fechaFinSemana = new Date(fechaInicioSemana);
  fechaFinSemana.setDate(fechaFinSemana.getDate() + 6);
  
  return getDiasCalendario(
    alumnoId,
    fechaInicioSemana,
    fechaFinSemana.toISOString().split('T')[0]
  );
}

/**
 * Extrae el turno de una sesión basado en la observación
 */
export function extraerTurno(observacion?: string): string {
  if (!observacion) return 'Sin turno';
  
  if (observacion.includes('Mañana')) return 'Mañana';
  if (observacion.includes('Tarde')) return 'Tarde';
  if (observacion.includes('Noche')) return 'Noche';
  
  return 'Sin turno';
}

/**
 * Obtiene el color del dot basado en el estado de la sesión
 */
export function obtenerColorDot(estado: string, esExamen: boolean = false): string {
  if (esExamen) return '#EF4444'; // Rojo para exámenes
  
  switch (estado) {
    case 'Completada':
      return '#10B981'; // Verde
    case 'NoCompletada':
      return '#F59E0B'; // Amarillo
    default:
      return '#6B7280'; // Gris
  }
}
