import OpenAI from 'openai';

// Validar que la API key esté configurada
const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

if (!API_KEY || API_KEY === 'your_openai_api_key_here' || API_KEY.trim() === '') {
  console.warn('⚠️ EXPO_PUBLIC_OPENAI_API_KEY no está configurada o es inválida');
}

// Configuración de OpenAI
const openai = new OpenAI({
  apiKey: API_KEY,
});

// Tipos para el contenido generado
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

// Función para generar contenido teórico
export async function generarContenidoTeorico(
  tema: string,
  materia: string,
  textoAdicional?: string,
  promptPersonalizado?: string
): Promise<ContenidoTeorico> {
  try {
    const prompt = `
Genera contenido teórico para estudiantes de secundaria sobre el tema: "${tema}" de la materia: "${materia}".

${textoAdicional ? `Información adicional del estudiante: ${textoAdicional}` : ''}

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

IMPORTANTE: El contenido debe ser educativo pero accesible. No uses terminología técnica avanzada a menos que sea absolutamente necesario, y en ese caso, explícala de forma simple.

Responde ÚNICAMENTE con el JSON en este formato:
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

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const contenido = response.choices[0]?.message?.content;
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
      console.error('📄 Primeros 200 caracteres del contenido limpio:', contenidoLimpio.substring(0, 200));
      throw new Error(`Error al parsear JSON: ${parseError instanceof Error ? parseError.message : 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('Error generando contenido teórico:', error);
    throw error;
  }
}

// Función para generar quiz
export async function generarQuiz(
  tema: string,
  materia: string,
  contenidoTeorico: ContenidoTeorico
): Promise<QuizCompleto> {
  try {
    const contenidoTexto = contenidoTeorico.secciones
      .map(s => `${s.titulo}: ${s.contenido}`)
      .join('\n\n');

    const prompt = `
Genera EXACTAMENTE 10 preguntas de opción múltiple sobre el tema: "${tema}" de la materia: "${materia}".

Contenido de referencia:
${contenidoTexto}

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

EJEMPLO DE LO QUE NO DEBES HACER:
❌ Pregunta: "¿A quién fue a liberar San Martín?"
❌ Opciones: ["Perú", "Rusia", "Noruega", "Estados Unidos"]
   (Esto es muy fácil de deducir sin estudiar)

EJEMPLO DE LO QUE SÍ DEBES HACER:
✅ Pregunta: "¿Cuál fue el principal objetivo estratégico de la campaña de San Martín en 1820?"
✅ Opciones: ["Consolidar la independencia de Perú", "Asegurar el control del Río de la Plata", "Establecer alianzas con Brasil", "Proteger las fronteras del Alto Perú"]
   (Todas son opciones relacionadas al contexto histórico, requieren conocimiento del material)

IMPORTANTE: 
- Las preguntas deben ser desafiantes y requerir estudio del material
- Todas las opciones incorrectas deben ser plausibles y relacionadas al tema
- Las opciones deben confundir a quien no estudió bien el material
- NO facilitar la respuesta con opciones obviamente incorrectas

Responde ÚNICAMENTE con el JSON en este formato (sin texto adicional):
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

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const quiz = response.choices[0]?.message?.content;
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
      console.error('📄 Primeros 200 caracteres del quiz limpio:', quizLimpio.substring(0, 200));
      throw new Error(`Error al parsear JSON: ${parseError instanceof Error ? parseError.message : 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('Error generando quiz:', error);
    throw error;
  }
}

/**
 * Aleatoriza las posiciones de las respuestas correctas para evitar que siempre estén en la primera posición
 */
function aleatorizarPosicionesRespuestas(quiz: QuizCompleto): QuizCompleto {
  const preguntasAleatorizadas = quiz.preguntas.map((pregunta) => {
    // Crear un array de índices [0, 1, 2, 3]
    const indices = [0, 1, 2, 3];
    
    // Guardar la respuesta correcta original
    const respuestaCorrectaOriginal = pregunta.opciones[pregunta.respuesta_correcta];
    
    // Aleatorizar el orden de las opciones (Fisher-Yates shuffle)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    // Reordenar las opciones según los índices aleatorizados
    const opcionesReordenadas = indices.map(idx => pregunta.opciones[idx]);
    
    // Encontrar la nueva posición de la respuesta correcta
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
 * Limpia el JSON removiendo markdown code blocks y texto adicional
 * OpenAI a veces devuelve el JSON dentro de ```json ... ``` o con texto antes/después
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
  // Esto maneja casos donde hay texto antes o después del JSON
  const primerCorchete = limpio.indexOf('{');
  const ultimoCorchete = limpio.lastIndexOf('}');
  
  if (primerCorchete !== -1 && ultimoCorchete !== -1 && ultimoCorchete > primerCorchete) {
    // Extraer solo la parte del JSON
    limpio = limpio.substring(primerCorchete, ultimoCorchete + 1);
  }
  
  // Paso 3: Limpiar espacios y saltos de línea al inicio/final
  limpio = limpio.trim();
  
  // Paso 4: Verificar que empiece con { y termine con }
  if (!limpio.startsWith('{') || !limpio.endsWith('}')) {
    // Si no empieza/termina correctamente, intentar encontrar el JSON completo
    const match = limpio.match(/\{[\s\S]*\}/);
    if (match) {
      limpio = match[0];
    }
  }
  
  return limpio.trim();
}

// Función para extraer texto de archivos (placeholder para implementación futura)
export async function extraerTextoDeArchivo(archivoUrl: string): Promise<string> {
  // TODO: Implementar extracción de texto de PDFs/Word
  // Por ahora retorna string vacío
  return '';
}

/**
 * Verifica que la API key esté configurada correctamente
 */
export function verificarConfiguracionOpenAI(): { valida: boolean; mensaje: string } {
  if (!API_KEY || API_KEY === 'your_openai_api_key_here' || API_KEY.trim() === '') {
    return {
      valida: false,
      mensaje: 'API key no configurada. Verifica tu archivo .env'
    };
  }
  
  if (!API_KEY.startsWith('sk-')) {
    return {
      valida: false,
      mensaje: 'API key no tiene el formato correcto (debe empezar con "sk-")'
    };
  }
  
  return {
    valida: true,
    mensaje: 'API key configurada correctamente'
  };
}

export { openai };


