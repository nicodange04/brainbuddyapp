import { supabase } from './supabase';
import { generarMaterialEnBackground } from './materialGeneration';

export interface Disponibilidad {
  id: string;
  alumno_id: string;
  dia_semana: number; // 0=Domingo, 1=Lunes, etc.
  turno: string; // 'Mañana', 'Tarde', 'Noche'
  created_at: string;
}

export interface Examen {
  examen_id: string;
  alumno_id: string;
  nombre: string;
  materia: string;
  temario: string;
  fecha: string; // YYYY-MM-DD
  total_sesiones_planificadas: number;
  material_id: string;
  created_at: string;
  updated_at: string;
}

export interface SesionEstudio {
  sesion_id: string;
  examen_id: string;
  nombre: string;
  tema: string;
  fecha: string; // TIMESTAMP
  estado: 'Completada' | 'NoCompletada';
  observacion?: string;
  mini_quiz_id?: string;
  created_at: string;
  updated_at: string;
}

export interface DistribucionResult {
  examen_id: string;
  sesiones_creadas: number;
  dias_distribuidos: string[];
  error?: string;
}

/**
 * Obtiene la disponibilidad del estudiante
 */
export async function getDisponibilidad(alumnoId: string): Promise<Disponibilidad[]> {
  try {
    const { data, error } = await supabase
      .from('disponibilidad')
      .select('*')
      .eq('alumno_id', alumnoId)
      .order('dia_semana', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    throw error;
  }
}

/**
 * Obtiene los exámenes del estudiante
 */
export async function getExamenes(alumnoId: string): Promise<Examen[]> {
  try {
    const { data, error } = await supabase
      .from('examen')
      .select('*')
      .eq('alumno_id', alumnoId)
      .gte('fecha', new Date().toISOString().split('T')[0]) // Solo exámenes futuros
      .order('fecha', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al obtener exámenes:', error);
    throw error;
  }
}

/**
 * Calcula los días disponibles hasta una fecha específica
 */
function calcularDiasDisponibles(
  fechaExamen: string,
  disponibilidad: Disponibilidad[]
): { fecha: string; turno: string }[] {
  const diasDisponibles: { fecha: string; turno: string }[] = [];
  const fechaExamenDate = new Date(fechaExamen);
  const hoy = new Date();
  
  // Crear un mapa de disponibilidad por día de la semana
  const disponibilidadPorDia = new Map<number, string[]>();
  disponibilidad.forEach(d => {
    if (!disponibilidadPorDia.has(d.dia_semana)) {
      disponibilidadPorDia.set(d.dia_semana, []);
    }
    disponibilidadPorDia.get(d.dia_semana)!.push(d.turno);
  });

  // Generar días disponibles desde hoy hasta el examen
  for (let fecha = new Date(hoy); fecha <= fechaExamenDate; fecha.setDate(fecha.getDate() + 1)) {
    const diaSemana = fecha.getDay(); // 0=Domingo, 1=Lunes, etc.
    const turnosDisponibles = disponibilidadPorDia.get(diaSemana) || [];
    
    turnosDisponibles.forEach(turno => {
      diasDisponibles.push({
        fecha: fecha.toISOString().split('T')[0],
        turno
      });
    });
  }

  return diasDisponibles;
}

/**
 * Distribuye los temas del temario en sesiones de estudio
 * PRIORIDAD: 1 sesión por día para espaciar el estudio
 * Solo usa múltiples turnos del mismo día cuando no hay más días disponibles
 */
function distribuirTemas(
  temario: string | any,
  diasDisponibles: { fecha: string; turno: string }[]
): { tema: string; fecha: string; turno: string }[] {
  // Convertir temario a string si es JSONB
  let temarioString: string;
  if (typeof temario === 'string') {
    temarioString = temario;
  } else if (Array.isArray(temario)) {
    temarioString = temario.join('\n');
  } else {
    temarioString = String(temario || '');
  }

  const temas = temarioString
    .split('\n')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  if (temas.length === 0) return [];

  // Paso 1: Agrupar días disponibles por fecha (para identificar días únicos)
  const diasPorFecha = new Map<string, { fecha: string; turno: string }[]>();
  diasDisponibles.forEach(dia => {
    if (!diasPorFecha.has(dia.fecha)) {
      diasPorFecha.set(dia.fecha, []);
    }
    diasPorFecha.get(dia.fecha)!.push(dia);
  });

  // Paso 2: Crear array de días únicos ordenados por fecha
  const fechasUnicas = Array.from(diasPorFecha.keys()).sort();
  
  const sesiones: { tema: string; fecha: string; turno: string }[] = [];
  let fechaIndex = 0; // Índice para días únicos (1 sesión por día)
  let turnoIndexPorFecha = new Map<string, number>(); // Índice de turno por cada fecha

  temas.forEach(tema => {
    // ESTRATEGIA: Primero intentar 1 sesión por día (espaciando)
    if (fechaIndex < fechasUnicas.length) {
      // Aún hay días únicos disponibles, usar uno por día
      const fecha = fechasUnicas[fechaIndex];
      const turnosDelDia = diasPorFecha.get(fecha)!;
      
      // Usar el primer turno disponible de este día
      sesiones.push({
        tema,
        fecha: turnosDelDia[0].fecha,
        turno: turnosDelDia[0].turno
      });
      
      // Marcar que ya usamos el primer turno de este día
      turnoIndexPorFecha.set(fecha, 1);
      
      // Avanzar al siguiente día (1 sesión por día = espaciado)
      fechaIndex++;
    } else {
      // Ya usamos todos los días únicos, ahora usar turnos adicionales
      // Empezar desde el último día hacia atrás para usar turnos adicionales
      let asignado = false;
      
      // Intentar con el último día primero
      for (let i = fechasUnicas.length - 1; i >= 0 && !asignado; i--) {
        const fecha = fechasUnicas[i];
        const turnosDelDia = diasPorFecha.get(fecha)!;
        const turnoIndex = turnoIndexPorFecha.get(fecha) || 0;
        
        if (turnoIndex < turnosDelDia.length) {
          // Hay turnos disponibles en este día
          sesiones.push({
            tema,
            fecha: turnosDelDia[turnoIndex].fecha,
            turno: turnosDelDia[turnoIndex].turno
          });
          turnoIndexPorFecha.set(fecha, turnoIndex + 1);
          asignado = true;
        }
      }
      
      // Si no se pudo asignar (caso extremo), usar el último turno del último día
      if (!asignado && fechasUnicas.length > 0) {
        const ultimaFecha = fechasUnicas[fechasUnicas.length - 1];
        const turnosUltimoDia = diasPorFecha.get(ultimaFecha)!;
        const ultimoTurno = turnosUltimoDia[turnosUltimoDia.length - 1];
        sesiones.push({
          tema,
          fecha: ultimoTurno.fecha,
          turno: ultimoTurno.turno
        });
      }
    }
  });

  return sesiones;
}

/**
 * Crea las sesiones de estudio en la base de datos
 * IMPORTANTE: Elimina sesiones existentes del examen antes de crear nuevas para evitar duplicados
 */
async function crearSesionesEstudio(
  examenId: string,
  usuarioId: string,
  sesiones: { tema: string; fecha: string; turno: string }[]
): Promise<number> {
  try {
    console.log(`🗑️ Eliminando sesiones existentes para examen ${examenId}...`);
    
    // Primero eliminar todas las sesiones existentes de este examen
    const { error: deleteError } = await supabase
      .from('sesionestudio')
      .delete()
      .eq('examen_id', examenId);

    if (deleteError) {
      console.error('⚠️ Error al eliminar sesiones existentes:', deleteError);
      // Continuar de todas formas, pero registrar el error
    } else {
      console.log('✅ Sesiones existentes eliminadas correctamente');
    }

    // Esperar un momento para asegurar que la eliminación se complete
    await new Promise(resolve => setTimeout(resolve, 300));

    console.log(`📝 Creando ${sesiones.length} nuevas sesiones para examen ${examenId}...`);
    
    const sesionesParaInsertar = sesiones.map((sesion, index) => {
      const hora = sesion.turno === 'Mañana' ? '09:00' : sesion.turno === 'Tarde' ? '15:00' : '20:00';
      const fechaCompleta = `${sesion.fecha}T${hora}:00`;
      
      // Construir objeto con campos que existen en la tabla según el esquema real:
      // - sesion_id: se genera automáticamente (UUID)
      // - examen_id: requerido (FK)
      // - nombre: requerido
      // - tema: requerido
      // - fecha: requerido (TIMESTAMP)
      // - observacion: opcional (texto para guardar el turno)
      // - estado: requerido
      // - material_estado: opcional (para trackear generación de material)
      // - mini_quiz_id: opcional (no lo incluimos)
      // - created_at/updated_at: se generan automáticamente
      return {
        examen_id: examenId,
        nombre: `Sesión: ${sesion.tema}`,
        tema: sesion.tema,
        fecha: fechaCompleta, // TIMESTAMP con fecha y hora completa
        observacion: `Turno: ${sesion.turno}`, // El turno se guarda en observacion como texto
        estado: 'NoCompletada' as const,
        material_estado: 'pendiente' as const // Inicializar estado de material como pendiente
      };
    });

    const { data, error } = await supabase
      .from('sesionestudio')
      .insert(sesionesParaInsertar)
      .select();

    if (error) {
      console.error('❌ Error al insertar sesiones:', error);
      throw error;
    }
    
    console.log(`✅ ${data?.length || 0} sesiones creadas correctamente`);
    return data?.length || 0;
  } catch (error) {
    console.error('Error al crear sesiones de estudio:', error);
    throw error;
  }
}

/**
 * Actualiza el total de sesiones planificadas en el examen
 */
async function actualizarTotalSesiones(examenId: string, totalSesiones: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('examen')
      .update({ total_sesiones_planificadas: totalSesiones })
      .eq('examen_id', examenId);

    if (error) throw error;
  } catch (error) {
    console.error('Error al actualizar total de sesiones:', error);
    throw error;
  }
}

/**
 * Función principal que distribuye sesiones para un examen específico
 */
export async function distribuirSesionesParaExamen(
  examenId: string,
  alumnoId: string
): Promise<DistribucionResult> {
  try {
    // 1. Obtener disponibilidad del estudiante
    const disponibilidad = await getDisponibilidad(alumnoId);
    if (disponibilidad.length === 0) {
      return {
        examen_id: examenId,
        sesiones_creadas: 0,
        dias_distribuidos: [],
        error: 'No hay disponibilidad configurada'
      };
    }

    // 2. Obtener el examen específico
    const { data: examen, error: examenError } = await supabase
      .from('examen')
      .select('*')
      .eq('examen_id', examenId)
      .eq('alumno_id', alumnoId)
      .single();

    if (examenError || !examen) {
      return {
        examen_id: examenId,
        sesiones_creadas: 0,
        dias_distribuidos: [],
        error: 'Examen no encontrado'
      };
    }

    // 3. Calcular días disponibles hasta el examen
    const diasDisponibles = calcularDiasDisponibles(examen.fecha, disponibilidad);
    if (diasDisponibles.length === 0) {
      return {
        examen_id: examenId,
        sesiones_creadas: 0,
        dias_distribuidos: [],
        error: 'No hay días disponibles hasta el examen'
      };
    }

    // 4. Distribuir temas en sesiones
    const sesiones = distribuirTemas(examen.temario, diasDisponibles);
    if (sesiones.length === 0) {
      return {
        examen_id: examenId,
        sesiones_creadas: 0,
        dias_distribuidos: [],
        error: 'No hay temas en el temario'
      };
    }

    // 5. Crear sesiones en la base de datos (elimina sesiones existentes antes de crear nuevas)
    const sesionesCreadas = await crearSesionesEstudio(examenId, alumnoId, sesiones);

    // 6. Actualizar total de sesiones en el examen
    await actualizarTotalSesiones(examenId, sesionesCreadas);

    // 7. Iniciar generación de material en background (NO bloquea el flujo principal)
    // Obtener las sesiones creadas para generar material
    console.log(`🔍 [DEBUG] Obteniendo sesiones creadas para examen ${examenId}...`);
    const { data: sesionesData, error: errorSesiones } = await supabase
      .from('sesionestudio')
      .select('sesion_id, tema')
      .eq('examen_id', examenId);

    console.log(`🔍 [DEBUG] Sesiones obtenidas:`, { sesionesData, errorSesiones, count: sesionesData?.length });

    if (sesionesData && sesionesData.length > 0) {
      console.log(`🚀 Iniciando generación de material en background para ${sesionesData.length} sesión(es)...`);
      console.log(`🔍 [DEBUG] Sesiones a procesar:`, sesionesData.map(s => ({ sesion_id: s.sesion_id, tema: s.tema })));
      console.log(`🔍 [DEBUG] Materia del examen:`, examen.materia);
      
      // Iniciar generación en background (no esperar)
      generarMaterialEnBackground(
        sesionesData.map(s => ({ sesion_id: s.sesion_id, tema: s.tema })),
        examen.materia,
        examenId
      ).catch((error) => {
        console.error('❌ Error al iniciar generación en background:', error);
        console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
        // No afecta el flujo principal, solo logueamos el error
      });
    } else {
      console.warn(`⚠️ No se encontraron sesiones para el examen ${examenId}. Error:`, errorSesiones);
    }

    return {
      examen_id: examenId,
      sesiones_creadas: sesionesCreadas,
      dias_distribuidos: [...new Set(sesiones.map(s => s.fecha))],
      error: undefined
    };

  } catch (error) {
    console.error('Error en distribución de sesiones:', error);
    return {
      examen_id: examenId,
      sesiones_creadas: 0,
      dias_distribuidos: [],
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

/**
 * Distribuye sesiones para todos los exámenes del estudiante
 */
export async function distribuirSesionesParaTodosExamenes(
  alumnoId: string
): Promise<DistribucionResult[]> {
  try {
    const examenes = await getExamenes(alumnoId);
    const resultados: DistribucionResult[] = [];

    for (const examen of examenes) {
      const resultado = await distribuirSesionesParaExamen(examen.examen_id, alumnoId);
      resultados.push(resultado);
    }

    return resultados;
  } catch (error) {
    console.error('Error en distribución masiva:', error);
    throw error;
  }
}
