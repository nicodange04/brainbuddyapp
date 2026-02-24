import { GoogleGenerativeAI } from '@google/generative-ai';

// Validar que la API key esté configurada
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY || API_KEY === 'your_gemini_api_key_here' || API_KEY.trim() === '') {
  console.warn('⚠️ EXPO_PUBLIC_GEMINI_API_KEY no está configurada o es inválida');
}

// Configuración de Gemini
// Nota: El SDK puede usar diferentes versiones de la API
// Si tienes problemas, verifica en Google AI Studio qué modelos están disponibles
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Modelo: Gemini 2.5 Flash (versión estable disponible)
// El script verificar-modelos encontró que este es el modelo disponible
// Si necesitas otro modelo, agrega EXPO_PUBLIC_GEMINI_MODEL a tu .env
const MODEL_NAME = process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash';

// Configuración del modelo estilo NotebookLM (precisión máxima, sin inventar)
const GENERATION_CONFIG = {
  temperature: 0.0, // Temperatura CERO: máximo determinismo, sin creatividad, sin invención
  topP: 0.95, // Núcleo de muestreo: controla la diversidad (0.0 a 1.0)
  topK: 40, // Top-K sampling: número de tokens más probables a considerar
  maxOutputTokens: 8192, // Máximo de tokens en la respuesta (Gemini Flash soporta hasta 8192)
};

// System Instruction: "El Cerrojo" - Limita a usar solo documentos proporcionados
const SYSTEM_INSTRUCTION = `Actúa como un asistente de investigación académico estricto. 

REGLAS CRÍTICAS:
1. Tu ÚNICA fuente de información son los documentos y archivos proporcionados por el usuario.
2. Si la información NO está en los documentos proporcionados, debes responder: "Lo siento, no encuentro esa información en el material cargado. Por favor, verifica que los documentos contengan esta información."
3. NO utilices conocimientos externos previos, información de internet, o conocimiento general.
4. NO inventes, asumas o especules información que no esté explícitamente en los documentos.
5. Para cada afirmación importante, indica la fuente (nombre del archivo o documento de referencia).
6. Si los documentos no cubren completamente el tema solicitado, sé honesto y limítate a explicar solo lo que está en los documentos.
7. Mantén un tono educativo y didáctico, pero siempre basado únicamente en el material proporcionado.

Tu rol es ser un asistente académico preciso que trabaja exclusivamente con el material proporcionado, similar a NotebookLM.`;

// Tipos para el contenido generado (mismos que OpenAI para compatibilidad)
export interface ContenidoTeorico {
  secciones: Array<{
    titulo: string;
    contenido: string;
    tip?: string;
  }>;
}

export interface PreguntaQuiz {
  pregunta: string;
  opciones: string[];
  respuesta_correcta: number; // índice de la respuesta correcta
  explicacion?: string;
}

export interface QuizCompleto {
  preguntas: PreguntaQuiz[];
  puntaje_maximo: number;
}

/**
 * Limpia el JSON removiendo markdown code blocks y texto adicional
 */
function limpiarJSON(texto: string): string {
  let limpio = texto.trim();
  
  // Paso 1: Remover markdown code blocks (```json ... ``` o ``` ... ```)
  if (limpio.startsWith('```json')) {
    limpio = limpio.replace(/^```json\s*/i, '').replace(/\s*```$/g, '');
  } else if (limpio.startsWith('```')) {
    limpio = limpio.replace(/^```\s*/i, '').replace(/\s*```$/g, '');
  }
  
  // Paso 2: Buscar el primer { y último } para extraer solo el JSON
  const primerCorchete = limpio.indexOf('{');
  const ultimoCorchete = limpio.lastIndexOf('}');
  
  if (primerCorchete !== -1 && ultimoCorchete !== -1 && ultimoCorchete > primerCorchete) {
    limpio = limpio.substring(primerCorchete, ultimoCorchete + 1);
  }
  
  // Paso 3: Limpiar espacios y saltos de línea
  limpio = limpio.trim();
  
  // Paso 4: Verificar que empiece con { y termine con }
  if (!limpio.startsWith('{') || !limpio.endsWith('}')) {
    const match = limpio.match(/\{[\s\S]*\}/);
    if (match) {
      limpio = match[0];
    }
  }
  
  return limpio.trim();
}

/**
 * Aleatoriza las posiciones de las respuestas correctas
 */
function aleatorizarPosicionesRespuestas(quiz: QuizCompleto): QuizCompleto {
  const preguntasAleatorizadas = quiz.preguntas.map((pregunta) => {
    const indices = [0, 1, 2, 3];
    const respuestaCorrectaOriginal = pregunta.opciones[pregunta.respuesta_correcta];
    
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    const opcionesReordenadas = indices.map(idx => pregunta.opciones[idx]);
    const nuevaPosicionCorrecta = opcionesReordenadas.indexOf(respuestaCorrectaOriginal);
    
    return {
      ...pregunta,
      opciones: opcionesReordenadas,
      respuesta_correcta: nuevaPosicionCorrecta,
    };
  });
  
  return {
    ...quiz,
    preguntas: preguntasAleatorizadas,
  };
}

/**
 * Genera contenido teórico usando Gemini 1.5 Flash
 */
export async function generarContenidoTeorico(
  tema: string,
  materia: string,
  textoAdicional?: string,
  promptPersonalizado?: string
): Promise<ContenidoTeorico> {
  if (!genAI) {
    throw new Error('Gemini API no está configurada. Verifica EXPO_PUBLIC_GEMINI_API_KEY en .env');
  }

  try {
    // Verificar si hay documentos proporcionados
    const tieneDocumentos = textoAdicional && textoAdicional.trim().length > 0;
    
    if (!tieneDocumentos) {
      console.warn('⚠️ No se proporcionaron documentos. Gemini trabajará solo con el tema solicitado.');
    }

    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: GENERATION_CONFIG,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const prompt = `
${tieneDocumentos 
  ? `DOCUMENTOS Y MATERIAL DE REFERENCIA (TU ÚNICA FUENTE DE INFORMACIÓN):
${textoAdicional}

INSTRUCCIÓN: Genera contenido teórico para estudiantes de secundaria sobre el tema: "${tema}" de la materia: "${materia}" basándote EXCLUSIVAMENTE en los documentos proporcionados arriba.

⚠️ CRÍTICO: Solo usa información que esté explícitamente en los documentos. Si el tema no está completamente cubierto en los documentos, explica solo lo que encuentres y menciona que la información está limitada a lo disponible en el material.`
  : `INSTRUCCIÓN: Genera contenido teórico educativo para estudiantes de secundaria sobre el tema: "${tema}" de la materia: "${materia}".

IMPORTANTE: No se proporcionaron documentos de referencia. En este caso, debes generar contenido educativo general y completo sobre el tema solicitado. Este contenido será útil para el estudiante aunque no provenga de documentos específicos.

Debes responder con el JSON solicitado, no con un mensaje de error. Genera contenido educativo de calidad sobre el tema.`
}

${promptPersonalizado ? `\nPERSONALIZACIÓN SEGÚN PERFIL DE APRENDIZAJE DEL ALUMNO:\n${promptPersonalizado}\n` : ''}

REQUISITOS CRÍTICOS:
- Nivel: Secundaria (13-18 años) - contenido apropiado para este nivel educativo
- Lenguaje: Claro, simple y didáctico. EVITA términos técnicos avanzados, jerga especializada o conceptos universitarios
- Profundidad: Explica los conceptos con la profundidad que se espera en secundaria, no más avanzado
- Vocabulario: Usa palabras que un estudiante de secundaria pueda entender fácilmente
- Explicaciones: Si necesitas mencionar conceptos complejos, explícalos de forma simple y con ejemplos cotidianos
- Estructura: 5-6 secciones bien organizadas
- Cada sección debe tener: título claro, contenido (2-3 párrafos explicativos), y un tip práctico destacado
- Formato: JSON válido

IMPORTANTE: 
${tieneDocumentos 
  ? `- El contenido DEBE basarse ÚNICAMENTE en los documentos proporcionados.
- Si algo no está en los documentos, NO lo inventes. Indica que no hay información disponible en el material.
- Para cada sección, asegúrate de que la información provenga de los documentos.
- El contenido debe ser educativo pero accesible. No uses terminología técnica avanzada a menos que esté en los documentos, y en ese caso, explícala de forma simple.`
  : `- El contenido debe ser educativo pero accesible. No uses terminología técnica avanzada a menos que sea absolutamente necesario, y en ese caso, explícala de forma simple.
- Como no hay documentos de referencia, este es contenido educativo general.`
}

Responde ÚNICAMENTE con el JSON en este formato (sin texto adicional, sin markdown):
{
  "secciones": [
    {
      "titulo": "Título de la sección",
      "contenido": "Contenido explicativo...",
      "tip": "Tip destacado en amarillo"
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Verificar grounding metadata (citas/referencias del documento)
    // Nota: groundingMetadata puede no estar disponible en todas las versiones del SDK
    try {
      const groundingMetadata = (response as any).groundingMetadata;
      if (groundingMetadata && groundingMetadata.groundingChunks) {
        console.log(`✅ Gemini generó contenido con ${groundingMetadata.groundingChunks.length} referencias verificadas del documento`);
      } else if (tieneDocumentos) {
        console.log('ℹ️ Grounding metadata no disponible en esta versión del SDK');
      }
    } catch (error) {
      // Grounding metadata puede no estar disponible
      console.log('ℹ️ Verificación de grounding no disponible');
    }
    
    const contenido = response.text();

    if (!contenido) {
      throw new Error('No se pudo generar contenido');
    }

    // Limpiar el contenido: remover markdown code blocks si existen
    const contenidoLimpio = limpiarJSON(contenido);
    
    try {
      return JSON.parse(contenidoLimpio) as ContenidoTeorico;
    } catch (parseError) {
      console.error('❌ Error al parsear JSON del contenido teórico:', parseError);
      console.error('📄 Contenido original:', contenido);
      console.error('📄 Contenido limpio:', contenidoLimpio);
      throw new Error(`Error al parsear JSON: ${parseError instanceof Error ? parseError.message : 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('Error generando contenido teórico con Gemini:', error);
    throw error;
  }
}

/**
 * Genera quiz usando Gemini 1.5 Flash
 */
export async function generarQuiz(
  tema: string,
  materia: string,
  contenidoTeorico: ContenidoTeorico
): Promise<QuizCompleto> {
  if (!genAI) {
    throw new Error('Gemini API no está configurada. Verifica EXPO_PUBLIC_GEMINI_API_KEY en .env');
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: MODEL_NAME,
      generationConfig: GENERATION_CONFIG,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const contenidoTexto = contenidoTeorico.secciones
      .map(s => `${s.titulo}: ${s.contenido}`)
      .join('\n\n');

    const prompt = `
DOCUMENTO DE REFERENCIA (TU ÚNICA FUENTE DE INFORMACIÓN):
${contenidoTexto}

INSTRUCCIÓN: Genera EXACTAMENTE 10 preguntas de opción múltiple sobre el tema: "${tema}" de la materia: "${materia}" basándote EXCLUSIVAMENTE en el contenido de referencia proporcionado arriba.

⚠️ CRÍTICO: 
- Las preguntas DEBEN poder responderse usando SOLO la información del documento de referencia.
- NO uses conocimiento externo o información que no esté en el documento.
- Si no hay suficiente información en el documento para crear 10 preguntas, crea las que puedas basándote solo en el material disponible.

REQUISITOS ESTRICTOS:
1. CANTIDAD: Exactamente 10 preguntas (ni más ni menos)
2. OPCIONES: Cada pregunta debe tener EXACTAMENTE 4 opciones
3. DISTRIBUCIÓN DE DIFICULTAD: 3 preguntas fáciles, 4 medias, 3 difíciles
4. NIVEL: Secundaria (13-18 años) - Las preguntas deben ser apropiadas para este nivel educativo
   - EVITA términos técnicos avanzados, jerga especializada o conceptos universitarios
   - Usa vocabulario que un estudiante de secundaria pueda entender
   - La dificultad debe ser apropiada para secundaria, no más avanzada
   - Si necesitas mencionar conceptos complejos, usa lenguaje simple y claro

5. DIFICULTAD Y CALIDAD DE RESPUESTAS (CRÍTICO):
   - Las preguntas deben requerir conocimiento ESPECÍFICO del material estudiado para responder correctamente
   - NO deben poder responderse solo con conocimiento general o deducción lógica
   - Todas las opciones deben ser plausibles y relacionadas al tema/materia
   - Las opciones incorrectas deben ser conceptos, lugares, fechas, nombres o términos que aparecen en el contexto del tema pero que NO son la respuesta correcta
   
   Para cada pregunta, las 4 opciones deben ser:
   - Opción CORRECTA: 100% correcta según el material, clara pero requiere conocimiento específico del contenido estudiado
   - Opción PARECIDA 1: Muy similar a la correcta, del mismo contexto/tema pero incorrecta. Debe ser un distractor MUY plausible que solo quien estudió bien puede descartar
   - Opción PARECIDA 2: Relacionada al tema, de un aspecto o momento diferente pero del mismo contexto histórico/conceptual. Distractor plausible que requiere conocimiento del material
   - Opción PARECIDA 3: También relacionada al tema, pero de un contexto, época o concepto similar. Otro distractor plausible relacionado

   PROHIBIDO:
   - NO usar opciones completamente fuera de contexto (ej: si es historia de Argentina, NO usar países como Rusia, Noruega, Estados Unidos)
   - NO usar opciones obviamente incorrectas que hagan la pregunta demasiado fácil de deducir
   - NO usar opciones que puedan descartarse sin conocer el material
   - TODAS las opciones deben ser conceptos/contextos que aparecen o están relacionados con el tema estudiado

6. VARIACIÓN DE POSICIÓN: La respuesta correcta debe estar en diferentes posiciones (0, 1, 2, 3) a lo largo del quiz. NO siempre en la primera posición.

7. CLARIDAD: La respuesta correcta debe ser UNA SOLA y estar 100% clara según el material. No debe haber ambigüedad ni múltiples respuestas que puedan ser correctas.

8. EXPLICACIÓN: Incluir una explicación clara y concisa para cada respuesta correcta basada en el material.

IMPORTANTE: 
- Las preguntas deben ser desafiantes y requerir estudio del material
- Todas las opciones incorrectas deben ser plausibles y relacionadas al tema
- Las opciones deben confundir a quien no estudió bien el material
- NO facilitar la respuesta con opciones obviamente incorrectas

Responde ÚNICAMENTE con el JSON en este formato (sin texto adicional, sin markdown):
{
  "preguntas": [
    {
      "pregunta": "¿Cuál es...?",
      "opciones": ["Opción correcta", "Opción parecida 1 (muy plausible)", "Opción parecida 2 (plausible relacionada)", "Opción parecida 3 (plausible relacionada)"],
      "respuesta_correcta": 0,
      "explicacion": "Explicación clara de por qué es correcta"
    }
  ],
  "puntaje_maximo": 100
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Verificar grounding metadata (citas/referencias del documento)
    // Nota: groundingMetadata puede no estar disponible en todas las versiones del SDK
    try {
      const groundingMetadata = (response as any).groundingMetadata;
      if (groundingMetadata && groundingMetadata.groundingChunks) {
        console.log(`✅ Gemini generó quiz con ${groundingMetadata.groundingChunks.length} referencias verificadas del documento`);
      } else {
        console.log('ℹ️ Grounding metadata no disponible en esta versión del SDK');
      }
    } catch (error) {
      // Grounding metadata puede no estar disponible
      console.log('ℹ️ Verificación de grounding no disponible');
    }
    
    const quiz = response.text();

    if (!quiz) {
      throw new Error('No se pudo generar quiz');
    }

    // Limpiar el contenido: remover markdown code blocks si existen
    const quizLimpio = limpiarJSON(quiz);
    
    try {
      const quizParsed = JSON.parse(quizLimpio) as QuizCompleto;
      
      // Validar que tenga exactamente 10 preguntas
      if (quizParsed.preguntas.length !== 10) {
        console.warn(`⚠️ El quiz generado tiene ${quizParsed.preguntas.length} preguntas en lugar de 10`);
      }
      
      // Validar que cada pregunta tenga 4 opciones
      quizParsed.preguntas.forEach((pregunta, index) => {
        if (pregunta.opciones.length !== 4) {
          console.warn(`⚠️ La pregunta ${index + 1} tiene ${pregunta.opciones.length} opciones en lugar de 4`);
        }
      });
      
      // Aleatorizar las posiciones de las respuestas correctas
      const quizAleatorizado = aleatorizarPosicionesRespuestas(quizParsed);
      
      return quizAleatorizado;
    } catch (parseError) {
      console.error('❌ Error al parsear JSON del quiz:', parseError);
      console.error('📄 Quiz original:', quiz);
      console.error('📄 Quiz limpio:', quizLimpio);
      throw new Error(`Error al parsear JSON: ${parseError instanceof Error ? parseError.message : 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('Error generando quiz con Gemini:', error);
    throw error;
  }
}

/**
 * Verifica que la API key esté configurada correctamente
 */
export function verificarConfiguracionGemini(): { valida: boolean; mensaje: string } {
  if (!API_KEY || API_KEY === 'your_gemini_api_key_here' || API_KEY.trim() === '') {
    return {
      valida: false,
      mensaje: 'API key no configurada. Verifica tu archivo .env'
    };
  }
  
  if (!API_KEY.startsWith('AIza')) {
    return {
      valida: false,
      mensaje: 'API key no tiene el formato correcto (debe empezar con "AIza")'
    };
  }
  
  return {
    valida: true,
    mensaje: 'API key configurada correctamente'
  };
}

/**
 * Función para extraer texto de archivos (placeholder para implementación futura)
 */
export async function extraerTextoDeArchivo(archivoUrl: string): Promise<string> {
  // TODO: Implementar extracción de texto de PDFs/Word
  return '';
}
