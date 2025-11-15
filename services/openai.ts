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
  textoAdicional?: string
): Promise<ContenidoTeorico> {
  try {
    const prompt = `
Genera contenido teórico para estudiantes de secundaria sobre el tema: "${tema}" de la materia: "${materia}".

${textoAdicional ? `Información adicional del estudiante: ${textoAdicional}` : ''}

Requisitos:
- Nivel: Secundaria (13-18 años)
- Lenguaje: Claro y didáctico
- Estructura: 5-6 secciones
- Cada sección debe tener: título, contenido (2-3 párrafos), y un tip destacado
- Formato: JSON válido

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
      console.error('📄 Contenido recibido:', contenido);
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
Genera un quiz de 10 preguntas sobre el tema: "${tema}" de la materia: "${materia}".

Contenido de referencia:
${contenidoTexto}

Requisitos:
- 10 preguntas de opción múltiple
- 4 opciones por pregunta
- 3 preguntas fáciles, 4 medias, 3 difíciles
- Nivel: Secundaria (13-18 años)
- Incluir explicación para cada respuesta correcta
- Formato: JSON válido

Responde ÚNICAMENTE con el JSON en este formato:
{
  "preguntas": [
    {
      "pregunta": "¿Cuál es...?",
      "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
      "respuesta_correcta": 0,
      "explicacion": "Explicación de por qué es correcta"
    }
  ],
  "puntaje_maximo": 100
}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const quiz = response.choices[0]?.message?.content;
    if (!quiz) {
      throw new Error('No se pudo generar quiz');
    }

    // Limpiar el contenido: remover markdown code blocks si existen
    const quizLimpio = limpiarJSON(quiz);
    
    try {
      return JSON.parse(quizLimpio) as QuizCompleto;
    } catch (parseError) {
      console.error('❌ Error al parsear JSON del quiz:', parseError);
      console.error('📄 Quiz recibido:', quiz);
      throw new Error(`Error al parsear JSON: ${parseError instanceof Error ? parseError.message : 'Error desconocido'}`);
    }
  } catch (error) {
    console.error('Error generando quiz:', error);
    throw error;
  }
}

/**
 * Limpia el JSON removiendo markdown code blocks si existen
 * OpenAI a veces devuelve el JSON dentro de ```json ... ```
 */
function limpiarJSON(texto: string): string {
  // Remover markdown code blocks (```json ... ``` o ``` ... ```)
  let limpio = texto.trim();
  
  // Si empieza con ```json o ```, removerlo
  if (limpio.startsWith('```json')) {
    limpio = limpio.replace(/^```json\s*/i, '').replace(/\s*```$/g, '');
  } else if (limpio.startsWith('```')) {
    limpio = limpio.replace(/^```\s*/i, '').replace(/\s*```$/g, '');
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


