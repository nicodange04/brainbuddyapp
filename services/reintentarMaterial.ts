/**
 * Servicio para reintentar la generación de material para sesiones que fallaron
 */

import { supabase } from './supabase';
import { generarMaterialConReintentos } from './materialGeneration';

/**
 * Interfaz para el resultado de reintento
 */
export interface ResultadoReintento {
  sesionId: string;
  tema: string;
  exito: boolean;
  error?: string;
}

/**
 * Reintenta generar material para una sesión específica
 * @param sesionId - ID de la sesión
 * @returns Resultado del reintento
 */
export async function reintentarSesion(sesionId: string): Promise<ResultadoReintento> {
  try {
    // 1. Obtener información de la sesión
    const { data: sesion, error: sesionError } = await supabase
      .from('sesionestudio')
      .select('sesion_id, tema, examen_id')
      .eq('sesion_id', sesionId)
      .single();

    if (sesionError || !sesion) {
      return {
        sesionId,
        tema: 'Desconocido',
        exito: false,
        error: 'Sesión no encontrada',
      };
    }

    // 2. Obtener materia del examen
    const { data: examen } = await supabase
      .from('examen')
      .select('materia')
      .eq('examen_id', sesion.examen_id)
      .single();

    if (!examen) {
      return {
        sesionId,
        tema: sesion.tema,
        exito: false,
        error: 'Examen no encontrado',
      };
    }

    // 3. Reintentar generación
    console.log(`🔄 Reintentando generación para sesión ${sesionId}...`);
    const resultado = await generarMaterialConReintentos(
      sesion.sesion_id,
      sesion.tema,
      examen.materia,
      sesion.examen_id
    );

    return {
      sesionId: sesion.sesion_id,
      tema: sesion.tema,
      exito: resultado.exito,
      error: resultado.error,
    };
  } catch (error) {
    console.error(`❌ Error al reintentar sesión ${sesionId}:`, error);
    return {
      sesionId,
      tema: 'Desconocido',
      exito: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}

/**
 * Reintenta generar material para todas las sesiones con estado 'error'
 * @param examenId - ID del examen (opcional, si no se proporciona, reintenta todas)
 * @returns Array de resultados
 */
export async function reintentarSesionesConError(examenId?: string): Promise<ResultadoReintento[]> {
  try {
    // 1. Obtener sesiones con error
    let query = supabase
      .from('sesionestudio')
      .select('sesion_id, tema, examen_id')
      .eq('material_estado', 'error');

    if (examenId) {
      query = query.eq('examen_id', examenId);
    }

    const { data: sesiones, error } = await query;

    if (error) {
      console.error('❌ Error al obtener sesiones con error:', error);
      return [];
    }

    if (!sesiones || sesiones.length === 0) {
      console.log('ℹ️ No hay sesiones con error para reintentar');
      return [];
    }

    console.log(`🔄 Reintentando ${sesiones.length} sesión(es) con error...`);

    // 2. Obtener información de los exámenes
    const examenIds = [...new Set(sesiones.map(s => s.examen_id))];
    const { data: examenes } = await supabase
      .from('examen')
      .select('examen_id, materia')
      .in('examen_id', examenIds);

    const examenesMap = new Map(examenes?.map(e => [e.examen_id, e.materia]) || []);

    // 3. Reintentar cada sesión
    const resultados: ResultadoReintento[] = [];

    for (const sesion of sesiones) {
      const materia = examenesMap.get(sesion.examen_id);
      if (!materia) {
        resultados.push({
          sesionId: sesion.sesion_id,
          tema: sesion.tema,
          exito: false,
          error: 'Materia no encontrada',
        });
        continue;
      }

      const resultado = await generarMaterialConReintentos(
        sesion.sesion_id,
        sesion.tema,
        materia,
        sesion.examen_id
      );

      resultados.push({
        sesionId: sesion.sesion_id,
        tema: sesion.tema,
        exito: resultado.exito,
        error: resultado.error,
      });
    }

    const exitosas = resultados.filter(r => r.exito).length;
    const fallidas = resultados.length - exitosas;

    console.log(`✅ Reintentos completados. Exitosas: ${exitosas}, Fallidas: ${fallidas}`);

    return resultados;
  } catch (error) {
    console.error('❌ Error al reintentar sesiones:', error);
    return [];
  }
}

