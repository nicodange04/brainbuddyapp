import OpenAI from 'openai';

// Configuración de OpenAI
const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
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

    return JSON.parse(contenido) as ContenidoTeorico;
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

    return JSON.parse(quiz) as QuizCompleto;
  } catch (error) {
    console.error('Error generando quiz:', error);
    throw error;
  }
}

// Función para extraer texto de archivos (placeholder para implementación futura)
export async function extraerTextoDeArchivo(archivoUrl: string): Promise<string> {
  // TODO: Implementar extracción de texto de PDFs/Word
  // Por ahora retorna string vacío
  return '';
}

export { openai };


