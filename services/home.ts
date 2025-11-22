// services/home.ts
// Servicios para obtener datos de la pantalla de inicio

import { supabase } from './supabase';

export interface ProximaSesion {
  sesion_id: string;
  nombre: string;
  tema: string;
  fecha: string;
  examen_id: string;
  examen_nombre: string;
  examen_materia: string;
  estado: string;
}

export interface ProximoExamen {
  examen_id: string;
  nombre: string;
  materia: string;
  fecha: string;
  total_sesiones_planificadas: number;
  sesiones_completadas: number; // Calculado contando sesiones con estado 'Completada'
}

export interface SesionPendiente extends ProximaSesion {
  diasAtraso: number; // Días de retraso desde la fecha programada
}

/**
 * Obtiene múltiples sesiones futuras del alumno
 */
export async function getProximasSesiones(alumnoId: string, limite: number = 3): Promise<ProximaSesion[]> {
  try {
    // Primero obtener los exámenes del alumno
    const { data: examenes, error: examenesError } = await supabase
      .from('examen')
      .select('examen_id')
      .eq('alumno_id', alumnoId);

    if (examenesError) {
      console.error('Error al obtener exámenes:', examenesError);
      return [];
    }

    const examenIds = examenes?.map(e => e.examen_id) || [];

    if (examenIds.length === 0) {
      return [];
    }

    // Obtener las próximas sesiones (las más cercanas en el futuro)
    const ahora = new Date().toISOString();

    const { data, error } = await supabase
      .from('sesionestudio')
      .select(`
        sesion_id,
        nombre,
        tema,
        fecha,
        estado,
        examen_id,
        examen:examen_id (
          nombre,
          materia
        )
      `)
      .in('examen_id', examenIds)
      .gte('fecha', ahora)
      .eq('estado', 'NoCompletada')
      .order('fecha', { ascending: true })
      .limit(limite);

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map(sesion => ({
      sesion_id: sesion.sesion_id,
      nombre: sesion.nombre,
      tema: sesion.tema,
      fecha: sesion.fecha,
      examen_id: sesion.examen_id,
      examen_nombre: (sesion.examen as any)?.nombre || '',
      examen_materia: (sesion.examen as any)?.materia || '',
      estado: sesion.estado,
    }));
  } catch (error) {
    console.error('Error al obtener próximas sesiones:', error);
    return [];
  }
}

/**
 * Obtiene la próxima sesión de estudio del alumno
 */
export async function getProximaSesion(alumnoId: string): Promise<ProximaSesion | null> {
  try {
    // Primero obtener los exámenes del alumno
    const { data: examenes, error: examenesError } = await supabase
      .from('examen')
      .select('examen_id')
      .eq('alumno_id', alumnoId);

    if (examenesError) {
      console.error('Error al obtener exámenes:', examenesError);
      return null;
    }

    const examenIds = examenes?.map(e => e.examen_id) || [];

    if (examenIds.length === 0) {
      return null;
    }

    // Obtener la próxima sesión (la más cercana en el futuro)
    const ahora = new Date().toISOString();

    const { data, error } = await supabase
      .from('sesionestudio')
      .select(`
        sesion_id,
        nombre,
        tema,
        fecha,
        estado,
        examen_id,
        examen:examen_id (
          nombre,
          materia
        )
      `)
      .in('examen_id', examenIds)
      .gte('fecha', ahora)
      .eq('estado', 'NoCompletada')
      .order('fecha', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      sesion_id: data.sesion_id,
      nombre: data.nombre,
      tema: data.tema,
      fecha: data.fecha,
      examen_id: data.examen_id,
      examen_nombre: (data.examen as any)?.nombre || '',
      examen_materia: (data.examen as any)?.materia || '',
      estado: data.estado,
    };
  } catch (error) {
    console.error('Error al obtener próxima sesión:', error);
    return null;
  }
}

/**
 * Obtiene los próximos exámenes del alumno (máximo 3)
 */
export async function getProximosExamenes(alumnoId: string): Promise<ProximoExamen[]> {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Obtener los exámenes
    const { data: examenes, error: examenesError } = await supabase
      .from('examen')
      .select('examen_id, nombre, materia, fecha, total_sesiones_planificadas')
      .eq('alumno_id', alumnoId)
      .gte('fecha', hoy.toISOString().split('T')[0])
      .order('fecha', { ascending: true })
      .limit(3);

    if (examenesError) {
      console.error('Error al obtener próximos exámenes:', examenesError);
      return [];
    }

    if (!examenes || examenes.length === 0) {
      return [];
    }

    // Obtener los IDs de los exámenes
    const examenIds = examenes.map(e => e.examen_id);

    // Contar sesiones completadas para cada examen
    const { data: sesionesData, error: sesionesError } = await supabase
      .from('sesionestudio')
      .select('examen_id, estado')
      .in('examen_id', examenIds);

    if (sesionesError) {
      console.error('Error al obtener sesiones:', sesionesError);
    }

    // Crear un mapa de sesiones completadas por examen
    const sesionesCompletadasMap = new Map<string, number>();
    if (sesionesData) {
      sesionesData.forEach(sesion => {
        if (sesion.estado === 'Completada') {
          const count = sesionesCompletadasMap.get(sesion.examen_id) || 0;
          sesionesCompletadasMap.set(sesion.examen_id, count + 1);
        }
      });
    }

    // Mapear los resultados con las sesiones completadas calculadas
    return examenes.map(examen => ({
      examen_id: examen.examen_id,
      nombre: examen.nombre,
      materia: examen.materia,
      fecha: examen.fecha,
      total_sesiones_planificadas: examen.total_sesiones_planificadas || 0,
      sesiones_completadas: sesionesCompletadasMap.get(examen.examen_id) || 0,
    }));
  } catch (error) {
    console.error('Error al obtener próximos exámenes:', error);
    return [];
  }
}

/**
 * Obtiene las sesiones pendientes/atrasadas del alumno
 * (sesiones con fecha pasada y estado NoCompletada)
 */
export async function getSesionesPendientes(alumnoId: string, limite: number = 5): Promise<SesionPendiente[]> {
  try {
    // Primero obtener los exámenes del alumno
    const { data: examenes, error: examenesError } = await supabase
      .from('examen')
      .select('examen_id')
      .eq('alumno_id', alumnoId);

    if (examenesError) {
      console.error('Error al obtener exámenes:', examenesError);
      return [];
    }

    const examenIds = examenes?.map(e => e.examen_id) || [];

    if (examenIds.length === 0) {
      return [];
    }

    // Obtener sesiones pendientes (fecha pasada y no completadas)
    const ahora = new Date().toISOString();

    const { data, error } = await supabase
      .from('sesionestudio')
      .select(`
        sesion_id,
        nombre,
        tema,
        fecha,
        estado,
        examen_id,
        examen:examen_id (
          nombre,
          materia
        )
      `)
      .in('examen_id', examenIds)
      .lt('fecha', ahora)
      .eq('estado', 'NoCompletada')
      .order('fecha', { ascending: false }) // Más recientes primero
      .limit(limite);

    if (error || !data || data.length === 0) {
      return [];
    }

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    hoy.setMinutes(0, 0);
    hoy.setSeconds(0, 0);
    hoy.setMilliseconds(0);

    // Mapear resultados y calcular días de atraso
    return data.map(sesion => {
      const fechaSesion = new Date(sesion.fecha);
      fechaSesion.setHours(0, 0, 0, 0);
      fechaSesion.setMinutes(0, 0);
      fechaSesion.setSeconds(0, 0);
      fechaSesion.setMilliseconds(0);
      
      const diferenciaMs = hoy.getTime() - fechaSesion.getTime();
      const diasAtraso = Math.max(1, Math.floor(diferenciaMs / (1000 * 60 * 60 * 24)));

      return {
        sesion_id: sesion.sesion_id,
        nombre: sesion.nombre,
        tema: sesion.tema,
        fecha: sesion.fecha,
        examen_id: sesion.examen_id,
        examen_nombre: (sesion.examen as any)?.nombre || '',
        examen_materia: (sesion.examen as any)?.materia || '',
        estado: sesion.estado,
        diasAtraso,
      };
    });
  } catch (error) {
    console.error('Error al obtener sesiones pendientes:', error);
    return [];
  }
}

