// services/sesionEstudio.ts
// Servicios para obtener datos de una sesión de estudio

import { supabase } from './supabase';
import { ContenidoTeorico, PreguntaQuiz, QuizCompleto } from './openai';
import { MaterialCompleto } from './formatosMultimedia';

export interface SesionEstudioCompleta {
  sesion_id: string;
  nombre: string;
  tema: string;
  fecha: string;
  estado: 'Completada' | 'NoCompletada';
  examen_id: string;
  examen_nombre: string;
  examen_materia: string;
  material_estado: 'pendiente' | 'generando' | 'listo' | 'error';
  material_generado: MaterialCompleto | ContenidoTeorico | null; // Puede ser MaterialCompleto o ContenidoTeorico (compatibilidad)
  quiz: QuizCompleto | null;
  mini_quiz_id: string | null;
}

/**
 * Obtiene todos los datos de una sesión de estudio, incluyendo material teórico y quiz
 */
export async function getSesionEstudioCompleta(sesionId: string): Promise<SesionEstudioCompleta | null> {
  try {
    // 1. Obtener datos de la sesión
    const { data: sesion, error: sesionError } = await supabase
      .from('sesionestudio')
      .select(`
        sesion_id,
        nombre,
        tema,
        fecha,
        estado,
        examen_id,
        material_estado,
        material_generado,
        mini_quiz_id,
        examen:examen_id (
          nombre,
          materia
        )
      `)
      .eq('sesion_id', sesionId)
      .single();

    if (sesionError || !sesion) {
      console.error('Error al obtener sesión:', sesionError);
      return null;
    }

    // 2. Obtener el quiz si existe
    let quiz: QuizCompleto | null = null;
    if (sesion.mini_quiz_id) {
      const { data: quizData, error: quizError } = await supabase
        .from('miniquiz')
        .select('preguntas, puntaje_maximo')
        .eq('mini_quiz_id', sesion.mini_quiz_id)
        .single();

      if (!quizError && quizData) {
        quiz = {
          preguntas: quizData.preguntas as PreguntaQuiz[],
          puntaje_maximo: quizData.puntaje_maximo || 100,
        };
      }
    }

    // 3. Parsear material generado
    let materialGenerado: MaterialCompleto | ContenidoTeorico | null = null;
    if (sesion.material_generado) {
      try {
        // Puede ser MaterialCompleto (con formatos adicionales) o ContenidoTeorico (solo texto)
        materialGenerado = sesion.material_generado as MaterialCompleto | ContenidoTeorico;
      } catch (error) {
        console.error('Error al parsear material_generado:', error);
      }
    }

    const examen = sesion.examen as any;

    return {
      sesion_id: sesion.sesion_id,
      nombre: sesion.nombre,
      tema: sesion.tema,
      fecha: sesion.fecha,
      estado: sesion.estado as 'Completada' | 'NoCompletada',
      examen_id: sesion.examen_id,
      examen_nombre: examen?.nombre || '',
      examen_materia: examen?.materia || '',
      material_estado: (sesion.material_estado as any) || 'pendiente',
      material_generado: materialGenerado,
      quiz: quiz,
      mini_quiz_id: sesion.mini_quiz_id,
    };
  } catch (error) {
    console.error('Error al obtener sesión completa:', error);
    return null;
  }
}

/**
 * Marca una sesión como completada y guarda el puntaje
 */
export async function marcarSesionCompletada(
  sesionId: string,
  puntaje: number,
  vidasRestantes: number
): Promise<boolean> {
  try {
    // Calcular tiempo de estudio estimado (45 minutos por sesión)
    const tiempoEstudio = 45; // minutos

    // Primero intentar actualizar con todas las columnas
    // Si las columnas no existen, solo actualizar estado
    const updateData: any = {
      estado: 'Completada',
      updated_at: new Date().toISOString(),
    };

    // Intentar agregar puntaje_obtenido y tiempo_estudio si existen
    // Si no existen, Supabase lanzará un error y lo manejaremos
    try {
      updateData.puntaje_obtenido = puntaje;
      updateData.tiempo_estudio = tiempoEstudio;
    } catch (e) {
      // Ignorar si las columnas no existen
    }

    const { error } = await supabase
      .from('sesionestudio')
      .update(updateData)
      .eq('sesion_id', sesionId);

    if (error) {
      // Si el error es porque las columnas no existen, intentar solo con estado
      if (error.message?.includes('puntaje_obtenido') || error.message?.includes('tiempo_estudio')) {
        console.warn('⚠️ Columnas puntaje_obtenido o tiempo_estudio no existen, actualizando solo estado');
        const { error: errorSimple } = await supabase
          .from('sesionestudio')
          .update({
            estado: 'Completada',
            updated_at: new Date().toISOString(),
          })
          .eq('sesion_id', sesionId);

        if (errorSimple) {
          console.error('Error al marcar sesión como completada:', errorSimple);
          return false;
        }
        return true;
      }
      console.error('Error al marcar sesión como completada:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error al marcar sesión completada:', error);
    return false;
  }
}



