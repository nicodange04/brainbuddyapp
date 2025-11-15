import { supabase } from './supabase';
import { generarContenidoTeorico, generarQuiz, ContenidoTeorico, QuizCompleto, verificarConfiguracionOpenAI } from './openai';
import { getArchivosDeExamen, extraerTextoDeArchivos } from './materialFiles';
import { notificarMaterialListo, notificarErrorMaterial } from './notifications';

/**
 * Interfaz para el resultado de generación de material
 */
export interface ResultadoGeneracion {
  exito: boolean;
  sesionId: string;
  tema: string;
  error?: string;
}

/**
 * Configuración de reintentos
 */
const MAX_REINTENTOS = 3;
const DELAY_ENTRE_REINTENTOS = 5000; // 5 segundos

/**
 * Genera el material teórico y quiz para una sesión de estudio
 * @param sesionId - ID de la sesión
 * @param tema - Tema de la sesión
 * @param materia - Materia del examen
 * @param examenId - ID del examen (para obtener archivos)
 * @param intento - Número de intento actual (para reintentos)
 * @returns Resultado de la generación
 */
async function generarMaterialParaSesion(
  sesionId: string,
  tema: string,
  materia: string,
  examenId: string,
  intento: number = 1
): Promise<ResultadoGeneracion> {
  try {
    console.log(`🔄 Generando material para sesión ${sesionId} (intento ${intento}/${MAX_REINTENTOS})...`);

    // 0. Verificar configuración de OpenAI antes de empezar
    if (intento === 1) {
      const config = verificarConfiguracionOpenAI();
      if (!config.valida) {
        throw new Error(`Configuración de OpenAI inválida: ${config.mensaje}`);
      }
    }

    // 1. Actualizar estado a 'generando'
    await actualizarEstadoSesion(sesionId, 'generando');

    // 2. Obtener archivos del examen (si existen)
    const archivos = await getArchivosDeExamen(examenId);
    const textoArchivos = await extraerTextoDeArchivos(archivos);

    // 3. Generar contenido teórico con OpenAI
    console.log(`📝 Generando contenido teórico para "${tema}"...`);
    const contenidoTeorico: ContenidoTeorico = await generarContenidoTeorico(
      tema,
      materia,
      textoArchivos || undefined
    );

    // 4. Generar quiz con OpenAI
    console.log(`🎯 Generando quiz para "${tema}"...`);
    const quiz: QuizCompleto = await generarQuiz(tema, materia, contenidoTeorico);

    // 5. Guardar material teórico en sesionestudio
    const { error: errorMaterial } = await supabase
      .from('sesionestudio')
      .update({
        material_generado: contenidoTeorico,
        material_estado: 'listo',
      })
      .eq('sesion_id', sesionId);

    if (errorMaterial) {
      console.error('❌ Error al guardar material teórico:', errorMaterial);
      throw errorMaterial;
    }

    // 6. Crear registro de quiz en miniquiz
    const { data: quizData, error: errorQuiz } = await supabase
      .from('miniquiz')
      .insert([
        {
          sesion_id: sesionId,
          preguntas: quiz.preguntas,
          puntaje_maximo: quiz.puntaje_maximo,
        },
      ])
      .select()
      .single();

    if (errorQuiz) {
      console.error('❌ Error al crear quiz:', errorQuiz);
      throw errorQuiz;
    }

    // 7. Actualizar sesionestudio con mini_quiz_id
    const { error: errorUpdate } = await supabase
      .from('sesionestudio')
      .update({
        mini_quiz_id: quizData.mini_quiz_id,
      })
      .eq('sesion_id', sesionId);

    if (errorUpdate) {
      console.error('⚠️ Error al actualizar mini_quiz_id:', errorUpdate);
      // No es crítico, continuamos
    }

    console.log(`✅ Material generado exitosamente para sesión ${sesionId}`);

    // 8. Notificar que el material está listo
    await notificarMaterialListo(tema, sesionId);

    return {
      exito: true,
      sesionId,
      tema,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    
    console.error(`❌ Error al generar material (intento ${intento}):`, errorMessage);
    
    // Log detallado del error para diagnóstico
    if (errorMessage.includes('429')) {
      console.error('   💡 Error 429: Quota excedida. Verifica tus créditos en OpenAI.');
    } else if (errorMessage.includes('401')) {
      console.error('   💡 Error 401: API key inválida. Verifica tu API key en .env');
    } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      console.error('   💡 Error de red. Verifica tu conexión a internet.');
    } else {
      console.error('   📋 Detalles del error:', errorDetails);
    }

    // Si no es el último intento, marcar como 'pendiente' para reintentar
    if (intento < MAX_REINTENTOS) {
      await actualizarEstadoSesion(sesionId, 'pendiente');
      return {
        exito: false,
        sesionId,
        tema,
        error: errorMessage,
      };
    }

    // Si es el último intento, marcar como 'error'
    await actualizarEstadoSesion(sesionId, 'error');
    await notificarErrorMaterial(tema, sesionId);

    return {
      exito: false,
      sesionId,
      tema,
      error: errorMessage,
    };
  }
}

/**
 * Actualiza el estado de generación de una sesión
 */
async function actualizarEstadoSesion(
  sesionId: string,
  estado: 'pendiente' | 'generando' | 'listo' | 'error'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('sesionestudio')
      .update({ material_estado: estado })
      .eq('sesion_id', sesionId);

    if (error) {
      console.error(`❌ Error al actualizar estado a "${estado}":`, error);
    }
  } catch (error) {
    console.error('❌ Error al actualizar estado:', error);
  }
}

/**
 * Genera material para una sesión con reintentos automáticos
 * @param sesionId - ID de la sesión
 * @param tema - Tema de la sesión
 * @param materia - Materia del examen
 * @param examenId - ID del examen
 * @returns Resultado de la generación
 */
export async function generarMaterialConReintentos(
  sesionId: string,
  tema: string,
  materia: string,
  examenId: string
): Promise<ResultadoGeneracion> {
  let resultado: ResultadoGeneracion | null = null;

  for (let intento = 1; intento <= MAX_REINTENTOS; intento++) {
    resultado = await generarMaterialParaSesion(sesionId, tema, materia, examenId, intento);

    if (resultado.exito) {
      return resultado;
    }

    // Si no es el último intento, esperar antes de reintentar
    if (intento < MAX_REINTENTOS) {
      console.log(`⏳ Esperando ${DELAY_ENTRE_REINTENTOS / 1000} segundos antes de reintentar...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_ENTRE_REINTENTOS));
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  return resultado!;
}

/**
 * Genera material en background para múltiples sesiones
 * Esta función se ejecuta de forma asíncrona sin bloquear el flujo principal
 * @param sesiones - Array de sesiones a procesar
 * @param materia - Materia del examen
 * @param examenId - ID del examen
 */
export async function generarMaterialEnBackground(
  sesiones: Array<{ sesion_id: string; tema: string }>,
  materia: string,
  examenId: string
): Promise<void> {
  console.log(`🚀 Iniciando generación en background para ${sesiones.length} sesión(es)...`);

  // Ejecutar generación en background (no esperar)
  Promise.all(
    sesiones.map(async (sesion) => {
      try {
        // Verificar si el material ya está generado
        const { data: sesionData } = await supabase
          .from('sesionestudio')
          .select('material_estado, material_generado')
          .eq('sesion_id', sesion.sesion_id)
          .single();

        // Si ya está listo, no generar de nuevo
        if (sesionData?.material_estado === 'listo' && sesionData?.material_generado) {
          console.log(`ℹ️ Material ya generado para sesión ${sesion.sesion_id}, omitiendo...`);
          return;
        }

        // Generar material con reintentos
        await generarMaterialConReintentos(
          sesion.sesion_id,
          sesion.tema,
          materia,
          examenId
        );
      } catch (error) {
        console.error(`❌ Error al generar material para sesión ${sesion.sesion_id}:`, error);
      }
    })
  ).then(() => {
    console.log(`✅ Generación en background completada para ${sesiones.length} sesión(es)`);
  }).catch((error) => {
    console.error('❌ Error en generación en background:', error);
  });
}


