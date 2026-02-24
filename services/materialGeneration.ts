import { supabase } from './supabase';
// Importar ambos servicios (OpenAI y Gemini)
import { determinarFormatos, generarFormatosAdicionales, MaterialCompleto } from './formatosMultimedia';
import { generarContenidoTeorico as generarContenidoGemini, generarQuiz as generarQuizGemini, verificarConfiguracionGemini } from './gemini';
import { extraerTextoDeArchivos, getArchivosDeExamen } from './materialFiles';
import { notificarErrorMaterial, notificarMaterialListo } from './notifications';
import { ContenidoTeorico, generarContenidoTeorico as generarContenidoOpenAI, generarQuiz as generarQuizOpenAI, QuizCompleto, verificarConfiguracionOpenAI } from './openai';
import { obtenerPerfilAprendizaje, PerfilAprendizaje } from './perfilAprendizaje';

// Configuración: elegir qué servicio usar
// Opciones: 'gemini', 'openai', 'auto' (auto usa Gemini si está disponible, sino OpenAI)
// Por defecto: 'openai' (más confiable y sin límites de cuota)
const PROVEEDOR_IA = (process.env.EXPO_PUBLIC_PROVEEDOR_IA || 'openai').toLowerCase();

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
  // Declarar usarGemini fuera del try para que esté disponible en el catch
  let usarGemini = false;
  
  try {
    console.log(`🔄 Generando material para sesión ${sesionId} (intento ${intento}/${MAX_REINTENTOS})...`);

    // 0. Determinar qué proveedor usar y verificar configuración
    console.log(`🔍 [DEBUG] PROVEEDOR_IA configurado: "${PROVEEDOR_IA}"`);
    if (intento === 1) {
      if (PROVEEDOR_IA === 'gemini') {
        const configGemini = verificarConfiguracionGemini();
        console.log(`🔍 [DEBUG] Configuración Gemini:`, configGemini);
        if (configGemini.valida) {
          usarGemini = true;
          console.log('✅ Usando Gemini 2.5 Flash');
        } else {
          console.warn(`⚠️ Gemini no configurado: ${configGemini.mensaje}. Intentando con OpenAI...`);
          const configOpenAI = verificarConfiguracionOpenAI();
          if (!configOpenAI.valida) {
            throw new Error(`Ningún proveedor de IA está configurado. Gemini: ${configGemini.mensaje}, OpenAI: ${configOpenAI.mensaje}`);
          }
          console.log('✅ Usando OpenAI como fallback');
        }
      } else if (PROVEEDOR_IA === 'openai') {
        const configOpenAI = verificarConfiguracionOpenAI();
        if (!configOpenAI.valida) {
          throw new Error(`Configuración de OpenAI inválida: ${configOpenAI.mensaje}`);
        }
        console.log('✅ Usando OpenAI');
      } else if (PROVEEDOR_IA === 'auto') {
        // Auto: intentar Gemini primero, luego OpenAI
        const configGemini = verificarConfiguracionGemini();
        if (configGemini.valida) {
          usarGemini = true;
          console.log('✅ Auto-selección: Usando Gemini 2.5 Flash');
        } else {
          const configOpenAI = verificarConfiguracionOpenAI();
          if (!configOpenAI.valida) {
            throw new Error(`Ningún proveedor de IA está configurado. Gemini: ${configGemini.mensaje}, OpenAI: ${configOpenAI.mensaje}`);
          }
          console.log('✅ Auto-selección: Usando OpenAI');
        }
      }
    } else {
      // En reintentos, mantener el mismo proveedor del primer intento
      // (se determina en el primer intento y se mantiene)
      usarGemini = PROVEEDOR_IA === 'gemini' || (PROVEEDOR_IA === 'auto' && verificarConfiguracionGemini().valida);
    }

    // 1. Actualizar estado a 'generando'
    await actualizarEstadoSesion(sesionId, 'generando');

    // 2. Obtener archivos del examen (si existen)
    const archivos = await getArchivosDeExamen(examenId);
    const textoArchivos = await extraerTextoDeArchivos(archivos);

    // 3. Obtener perfil de aprendizaje del alumno (si existe)
    let promptPersonalizado = '';
    let examenData: { alumno_id?: string; usuario_id?: string; examen_id?: string; id?: string } | null = null;
    let usuarioIdParaPerfil: string | null = null;
    
    try {
      // Intentar obtener examen - La tabla examen usa examen_id (PK) y alumno_id (FK)
      let result = await supabase
        .from('examen')
        .select('examen_id, alumno_id')
        .eq('examen_id', examenId)
        .single();
      
      if (result.error) {
        // Intentar con 'id' como fallback (por si acaso)
        result = await supabase
          .from('examen')
          .select('examen_id, alumno_id')
          .eq('id', examenId)
          .single();
      }
      
      if (result.error) {
        console.warn(`⚠️ Error al obtener examen ${examenId}:`, result.error.message);
        console.warn(`   Código de error: ${result.error.code}`);
      } else {
        examenData = result.data;
        console.log(`🔍 [DEBUG] Datos del examen obtenidos:`, {
          examen_id: examenData?.examen_id || examenData?.id,
          tiene_alumno_id: !!examenData?.alumno_id,
          alumno_id: examenData?.alumno_id || 'NO ENCONTRADO',
          columnas: Object.keys(examenData || {})
        });
      }

      // La tabla examen usa alumno_id (NO usuario_id)
      usuarioIdParaPerfil = examenData?.alumno_id || null;

      if (usuarioIdParaPerfil) {
        console.log(`🔍 [DEBUG] Obteniendo perfil para usuario_id: ${usuarioIdParaPerfil}`);
        const { data: perfilData, error: errorPerfil } = await supabase
          .from('perfil_aprendizaje')
          .select('*')
          .eq('alumno_id', usuarioIdParaPerfil)
          .eq('completado', true)
          .single();

        if (errorPerfil && errorPerfil.code !== 'PGRST116') {
          // PGRST116 = no rows returned, que es normal si no hay perfil
          console.warn(`⚠️ Error al obtener perfil de aprendizaje:`, errorPerfil.message);
        }

        if (perfilData) {
          const { generarPromptPersonalizado } = await import('./perfilAprendizaje');
          promptPersonalizado = generarPromptPersonalizado(perfilData as any);
          console.log('✅ Usando perfil de aprendizaje personalizado');
        } else {
          console.log('ℹ️ No se encontró perfil de aprendizaje completado para este usuario');
        }
      } else {
        console.log(`ℹ️ El examen ${examenId} no tiene alumno_id ni usuario_id asociado`);
        console.log(`   Columnas disponibles en examen: ${Object.keys(examenData || {}).join(', ')}`);
      }
    } catch (error) {
      console.warn('⚠️ No se pudo obtener perfil de aprendizaje, usando configuración por defecto:', error instanceof Error ? error.message : String(error));
    }

    // 4. Generar contenido teórico con el proveedor seleccionado
    console.log(`📝 Generando contenido teórico para "${tema}" con ${usarGemini ? 'Gemini' : 'OpenAI'}...`);
    const contenidoTeorico: ContenidoTeorico = usarGemini
      ? await generarContenidoGemini(
          tema,
          materia,
          textoArchivos || undefined,
          promptPersonalizado || undefined
        )
      : await generarContenidoOpenAI(
          tema,
          materia,
          textoArchivos || undefined,
          promptPersonalizado || undefined
        );

    // 4.5. Obtener perfil de aprendizaje para generar formatos adicionales
    // Reutilizar el usuarioId que ya obtuvimos en el paso 3
    let perfil: PerfilAprendizaje | null = null;
    try {
      if (usuarioIdParaPerfil) {
        console.log(`🔍 [DEBUG] Obteniendo perfil para formatos adicionales (usuario: ${usuarioIdParaPerfil})`);
        perfil = await obtenerPerfilAprendizaje(usuarioIdParaPerfil);
        if (perfil) {
          console.log(`✅ Perfil obtenido para formatos adicionales:`, {
            estilo_primario: perfil.estilo_primario,
            estilo_secundario: perfil.estilo_secundario,
            prefiere_diagramas: perfil.prefiere_diagramas,
            prefiere_resumenes: perfil.prefiere_resumenes,
            velocidad_aprendizaje: perfil.velocidad_aprendizaje,
          });
        } else {
          console.log('ℹ️ No se encontró perfil de aprendizaje completado para este usuario');
        }
      } else {
        console.log('ℹ️ No se generarán formatos adicionales: el examen no tiene alumno_id ni usuario_id asociado');
        if (examenData) {
          console.log(`   Columnas disponibles en examen: ${Object.keys(examenData).join(', ')}`);
        }
      }
    } catch (error) {
      console.warn('⚠️ Error al obtener perfil para formatos adicionales:', error instanceof Error ? error.message : String(error));
    }

    // 4.6. Generar formatos adicionales según perfil (en background, no bloquea)
    let materialCompleto: MaterialCompleto = { texto: contenidoTeorico };
    
    // Generar formatos adicionales con OpenAI (ahora todo usa OpenAI)
    if (perfil) {
      const formatosAGenerar = determinarFormatos(perfil);
      console.log(`🎨 Formatos a generar según perfil: ${formatosAGenerar.join(', ')}`);
      console.log(`🔍 [DEBUG] Razón de formatos:`, {
        tieneAudio: perfil.estilo_primario === 'auditivo' || perfil.estilo_secundario === 'auditivo',
        tieneDiagramas: perfil.estilo_primario === 'visual' || perfil.prefiere_diagramas,
        tieneFlashcards: perfil.prefiere_resumenes || perfil.velocidad_aprendizaje === 'rapido',
      });
      
      if (formatosAGenerar.length > 1) {
        // Hay formatos adicionales además de texto
        try {
          const formatosAdicionales = await generarFormatosAdicionales(
            contenidoTeorico,
            perfil,
            formatosAGenerar
          );
          materialCompleto = {
            ...materialCompleto,
            ...formatosAdicionales,
          };
          console.log('✅ Formatos adicionales generados exitosamente con OpenAI');
          console.log(`🔍 [DEBUG] Formatos generados:`, Object.keys(formatosAdicionales));
        } catch (error) {
          console.warn('⚠️ Error generando formatos adicionales, continuando solo con texto:', error);
          // Continuar con solo texto si falla
        }
      } else {
        console.log('ℹ️ Solo se generará texto (no hay formatos adicionales según el perfil)');
      }
    } else {
      console.log('ℹ️ No se generarán formatos adicionales: perfil de aprendizaje no encontrado o no completado');
    }

    // 5. Generar quiz con el proveedor seleccionado
    console.log(`🎯 Generando quiz para "${tema}" con ${usarGemini ? 'Gemini' : 'OpenAI'}...`);
    const quiz: QuizCompleto = usarGemini
      ? await generarQuizGemini(tema, materia, contenidoTeorico)
      : await generarQuizOpenAI(tema, materia, contenidoTeorico);

    // 6. Guardar material completo (texto + formatos adicionales) en sesionestudio
    console.log(`💾 [DEBUG] Guardando material completo para sesión ${sesionId}...`);
    console.log(`💾 [DEBUG] Formatos incluidos:`, Object.keys(materialCompleto).join(', '));
    const { error: errorMaterial, data: dataMaterial } = await supabase
      .from('sesionestudio')
      .update({
        material_generado: materialCompleto, // Guardar material completo con todos los formatos
        material_estado: 'listo',
      })
      .eq('sesion_id', sesionId)
      .select();
    
    console.log(`💾 [DEBUG] Resultado de actualización de material:`, { errorMaterial, dataMaterial, rowsUpdated: dataMaterial?.length });

    if (errorMaterial) {
      console.error('❌ Error al guardar material teórico:', errorMaterial);
      throw errorMaterial;
    }

    // 7. Crear registro de quiz en miniquiz
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
    console.log(`💾 [DEBUG] Actualizando mini_quiz_id para sesión ${sesionId}...`);
    console.log(`💾 [DEBUG] Quiz generado:`, JSON.stringify(quiz).substring(0, 200));
    const { error: errorUpdate, data: dataUpdate } = await supabase
      .from('sesionestudio')
      .update({
        mini_quiz_id: quizData.mini_quiz_id,
      })
      .eq('sesion_id', sesionId)
      .select();
    
    console.log(`💾 [DEBUG] Resultado de actualización de mini_quiz_id:`, { errorUpdate, dataUpdate, rowsUpdated: dataUpdate?.length });

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
    
    // Detectar qué proveedor se está usando para mensajes de error más precisos
    const proveedorActual = usarGemini ? 'Gemini' : 'OpenAI';
    
    // Log detallado del error para diagnóstico
    if (errorMessage.includes('429')) {
      // Detectar si es error de quota de Gemini o OpenAI
      if (errorMessage.includes('GoogleGenerativeAI') || errorMessage.includes('generativelanguage')) {
        console.error(`   💡 Error 429: Cuota excedida de ${proveedorActual}.`);
        console.error('   📊 Límites del plan gratuito:');
        console.error('      - 20 solicitudes por día');
        console.error('      - 5 solicitudes por minuto');
        console.error('   ⏰ Espera unos minutos antes de reintentar o considera actualizar tu plan.');
      } else {
        console.error(`   💡 Error 429: Cuota excedida de ${proveedorActual}. Verifica tus créditos.`);
      }
      
      // Para errores 429, usar backoff exponencial más largo
      if (intento < MAX_REINTENTOS) {
        const delayBackoff = Math.min(DELAY_ENTRE_REINTENTOS * Math.pow(2, intento - 1), 60000); // Máximo 60 segundos
        console.log(`   ⏳ Esperando ${delayBackoff / 1000} segundos antes de reintentar (backoff exponencial)...`);
        await new Promise(resolve => setTimeout(resolve, delayBackoff));
      }
    } else if (errorMessage.includes('401')) {
      console.error(`   💡 Error 401: API key inválida de ${proveedorActual}. Verifica tu API key en .env`);
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
    console.log(`🔄 [DEBUG] Actualizando estado de sesión ${sesionId} a "${estado}"...`);
    const { error, data } = await supabase
      .from('sesionestudio')
      .update({ material_estado: estado })
      .eq('sesion_id', sesionId)
      .select();
    
    console.log(`🔄 [DEBUG] Resultado de actualización de estado:`, { error, data, rowsUpdated: data?.length });

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
    // Nota: El backoff exponencial para errores 429 se maneja dentro de generarMaterialParaSesion
    // Aquí solo esperamos el delay estándar para otros errores
    if (intento < MAX_REINTENTOS && !resultado.error?.includes('429')) {
      console.log(`⏳ Esperando ${DELAY_ENTRE_REINTENTOS / 1000} segundos antes de reintentar...`);
      await new Promise(resolve => setTimeout(resolve, DELAY_ENTRE_REINTENTOS));
    }
    // Si es error 429, el backoff ya se manejó dentro de generarMaterialParaSesion
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
        console.log(`🔍 [DEBUG] Verificando sesión ${sesion.sesion_id}...`);
        const { data: sesionData, error: errorSesion } = await supabase
          .from('sesionestudio')
          .select('material_estado, material_generado')
          .eq('sesion_id', sesion.sesion_id)
          .single();
        
        console.log(`🔍 [DEBUG] Datos de sesión:`, { sesionData, errorSesion });

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


