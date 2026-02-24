// services/formatosMultimedia.ts
// Servicio para generar formatos multimedia adicionales según perfil de aprendizaje

import OpenAI from 'openai';
import { ContenidoTeorico } from './openai';
import { PerfilAprendizaje } from './perfilAprendizaje';

// Configuración de OpenAI (cambiamos de Gemini a OpenAI para gráficos)
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const openai = OPENAI_API_KEY ? new OpenAI({
  apiKey: OPENAI_API_KEY,
}) : null;

// Interfaces para formatos multimedia
export interface AudioFormat {
  script: string;
  duracionEstimada: number; // en segundos
  url?: string; // URL del audio generado (si se implementa TTS)
}

export interface Diagrama {
  id: string;
  tipo: 'flujo' | 'comparacion' | 'jerarquia' | 'proceso' | 'concepto';
  titulo: string;
  descripcion: string;
  datos: Record<string, any>;
}

export interface Flashcard {
  id: string;
  pregunta: string;
  respuesta: string;
  categoria?: string;
  dificultad?: 'facil' | 'medio' | 'dificil';
}

export interface Infografia {
  id: string;
  titulo: string;
  contenido: string;
  elementos: string[];
}

export interface MaterialCompleto {
  texto: ContenidoTeorico;
  audio?: AudioFormat;
  diagramas?: Diagrama[];
  flashcards?: Flashcard[];
  infografias?: Infografia[];
}

/**
 * Determina qué formatos generar según el perfil de aprendizaje
 */
export function determinarFormatos(perfil: PerfilAprendizaje | null): string[] {
  const formatos: string[] = ['texto']; // Siempre texto

  if (!perfil) {
    return formatos; // Sin perfil, solo texto
  }

  // Auditivo → Audio/Podcast
  if (
    perfil.estilo_primario === 'auditivo' ||
    perfil.estilo_secundario === 'auditivo'
  ) {
    formatos.push('audio');
  }

  // Visual → Diagramas + Infografías
  if (perfil.estilo_primario === 'visual' || perfil.prefiere_diagramas) {
    formatos.push('diagramas');
    formatos.push('infografias');
  }

  // Prefiere resúmenes → Flashcards
  if (
    perfil.prefiere_resumenes ||
    perfil.velocidad_aprendizaje === 'rapido'
  ) {
    formatos.push('flashcards');
  }

  return formatos;
}

/**
 * Genera script de audio/podcast desde contenido teórico
 */
export async function generarAudio(
  contenidoTeorico: ContenidoTeorico,
  perfil: PerfilAprendizaje
): Promise<AudioFormat> {
  if (!openai) {
    throw new Error('OpenAI API no está configurada');
  }

  try {
    const contenidoTexto = contenidoTeorico.secciones
      .map((s) => `${s.titulo}: ${s.contenido}`)
      .join('\n\n');

    const prompt = `
Convierte el siguiente contenido teórico en un SCRIPT DE PODCAST educativo.

CONTENIDO:
${contenidoTexto}

INSTRUCCIONES:
- Estilo: Conversacional, como si fuera un podcast educativo
- Tono: ${perfil.prefiere_lenguaje_cotidiano ? 'Cotidiano y amigable' : 'Profesional pero accesible'}
- Duración estimada: 5-10 minutos
- Incluye: Introducción, desarrollo de cada sección, conclusiones
- Formato: Texto natural para Text-to-Speech
- Ritmo: ${perfil.velocidad_aprendizaje === 'lento' ? 'Pausado, con repeticiones de conceptos clave' : perfil.velocidad_aprendizaje === 'rapido' ? 'Dinámico y directo' : 'Equilibrado'}

Genera un script que sea fácil de leer en voz alta, con pausas naturales y énfasis.
Marca las pausas con [PAUSA] y los énfasis con [ÉNFASIS: texto].

Responde ÚNICAMENTE con el script, sin texto adicional ni markdown.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en crear scripts de podcast educativos. Responde SOLO con el script, sin markdown ni texto adicional.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const script = completion.choices[0]?.message?.content || '';

    // Calcular duración estimada (~150 palabras/minuto)
    const palabras = script.split(/\s+/).length;
    const duracionEstimada = Math.ceil((palabras / 150) * 60);

    return {
      script: script.trim(),
      duracionEstimada,
      url: undefined, // Se genera después con TTS si se implementa
    };
  } catch (error) {
    console.error('Error generando audio:', error);
    throw error;
  }
}

/**
 * Genera diagramas visuales desde contenido teórico
 */
export async function generarDiagramas(
  contenidoTeorico: ContenidoTeorico,
  perfil: PerfilAprendizaje
): Promise<Diagrama[]> {
  if (!openai) {
    throw new Error('OpenAI API no está configurada');
  }

  try {
    const contenidoTexto = contenidoTeorico.secciones
      .map((s) => `${s.titulo}: ${s.contenido}`)
      .join('\n\n');

    const prompt = `
Analiza el siguiente contenido y genera DIAGRAMAS VISUALES estructurados.

CONTENIDO:
${contenidoTexto}

INSTRUCCIONES:
- Genera EXACTAMENTE 2 diagramas (no más, para evitar respuestas muy largas)
- Tipos posibles: flujo, comparacion, jerarquia, proceso, concepto
- Para cada diagrama, proporciona:
  * Tipo de diagrama
  * Título (máximo 50 caracteres)
  * Descripción textual (máximo 150 caracteres)
  * Datos estructurados (máximo 10 nodos y 15 conexiones por diagrama)

Nivel de detalle: ${perfil.nivel_profundidad === 'basico' ? 'Básico, con conceptos simples' : perfil.nivel_profundidad === 'avanzado' ? 'Avanzado, con detalles técnicos' : 'Medio, equilibrado'}

IMPORTANTE: Mantén las respuestas CONCISAS. Cada diagrama debe ser simple y directo.

Responde ÚNICAMENTE con JSON válido en este formato (sin markdown, sin texto adicional):
{
  "diagramas": [
    {
      "tipo": "flujo",
      "titulo": "Título del diagrama",
      "descripcion": "Descripción de qué representa",
      "datos": {
        "nodos": [
          {"id": "1", "label": "Nodo 1", "tipo": "inicio"},
          {"id": "2", "label": "Nodo 2", "tipo": "proceso"}
        ],
        "conexiones": [
          {"desde": "1", "hacia": "2", "label": "conecta"}
        ]
      }
    }
  ]
}
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en generar diagramas visuales estructurados en formato JSON. Responde SOLO con JSON válido, sin markdown ni texto adicional.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const texto = completion.choices[0]?.message?.content || '';

    if (!texto || texto.trim().length === 0) {
      throw new Error('OpenAI no devolvió contenido para los diagramas');
    }

    console.log('📄 [DEBUG] Respuesta cruda de OpenAI (diagramas):', texto.substring(0, 200));

    // Limpiar JSON - función similar a la de gemini.ts
    let textoLimpio = texto.trim();
    
    // Remover markdown code blocks
    if (textoLimpio.startsWith('```json')) {
      textoLimpio = textoLimpio.replace(/^```json\s*/i, '').replace(/\s*```$/g, '');
    } else if (textoLimpio.startsWith('```')) {
      textoLimpio = textoLimpio.replace(/^```\s*/i, '').replace(/\s*```$/g, '');
    }
    
    // Buscar el primer { y último } para extraer solo el JSON
    const primerCorchete = textoLimpio.indexOf('{');
    let ultimoCorchete = textoLimpio.lastIndexOf('}');
    
    // Si no encuentra el último }, puede estar truncado
    if (ultimoCorchete === -1 || ultimoCorchete <= primerCorchete) {
      console.warn('⚠️ El JSON parece estar truncado. Buscando último corchete válido...');
      // Buscar el último } que tenga sentido
      for (let i = textoLimpio.length - 1; i >= primerCorchete; i--) {
        if (textoLimpio[i] === '}') {
          ultimoCorchete = i;
          break;
        }
      }
    }
    
    if (primerCorchete !== -1 && ultimoCorchete !== -1 && ultimoCorchete > primerCorchete) {
      textoLimpio = textoLimpio.substring(primerCorchete, ultimoCorchete + 1);
    }
    
    textoLimpio = textoLimpio.trim();

    console.log('📄 [DEBUG] JSON limpio (diagramas) - Longitud:', textoLimpio.length);
    console.log('📄 [DEBUG] Primeros 200 chars:', textoLimpio.substring(0, 200));
    console.log('📄 [DEBUG] Últimos 200 chars:', textoLimpio.substring(Math.max(0, textoLimpio.length - 200)));

    if (!textoLimpio || textoLimpio.length === 0) {
      throw new Error('No se pudo extraer JSON válido de la respuesta de OpenAI');
    }

    // Verificar si el JSON está completo (termina con })
    if (!textoLimpio.endsWith('}')) {
      console.warn('⚠️ El JSON parece estar truncado. Intentando reparar...');
      // Contar corchetes para ver cuántos faltan
      const corchetesAbiertos = (textoLimpio.match(/\{/g) || []).length;
      const corchetesCerrados = (textoLimpio.match(/\}/g) || []).length;
      const corchetesFaltantes = corchetesAbiertos - corchetesCerrados;
      
      // Contar corchetes cuadrados también
      const corchetesCuadradosAbiertos = (textoLimpio.match(/\[/g) || []).length;
      const corchetesCuadradosCerrados = (textoLimpio.match(/\]/g) || []).length;
      const corchetesCuadradosFaltantes = corchetesCuadradosAbiertos - corchetesCuadradosCerrados;
      
      if (corchetesFaltantes > 0 || corchetesCuadradosFaltantes > 0) {
        // Intentar cerrar el JSON en el orden correcto
        let reparado = textoLimpio;
        // Primero cerrar arrays, luego objetos
        reparado += ']'.repeat(corchetesCuadradosFaltantes);
        reparado += '}'.repeat(corchetesFaltantes);
        console.log(`✅ JSON reparado agregando ${corchetesCuadradosFaltantes} ] y ${corchetesFaltantes} }`);
        textoLimpio = reparado;
      }
    }

    let parsed;
    try {
      parsed = JSON.parse(textoLimpio);
    } catch (parseError) {
      console.error('❌ Error al parsear JSON de diagramas:', parseError);
      console.error('📄 Texto que falló (primeros 500 chars):', textoLimpio.substring(0, 500));
      console.error('📄 Texto que falló (últimos 500 chars):', textoLimpio.substring(Math.max(0, textoLimpio.length - 500)));
      throw new Error(`Error al parsear JSON: ${parseError instanceof Error ? parseError.message : 'Error desconocido'}`);
    }

    if (!parsed.diagramas || !Array.isArray(parsed.diagramas)) {
      console.warn('⚠️ La respuesta no tiene el formato esperado. Respuesta:', parsed);
      // Intentar devolver un array vacío en lugar de fallar
      return [];
    }

    const diagramas: Diagrama[] = parsed.diagramas.map((d: any, index: number) => ({
      id: `diagrama-${index + 1}`,
      tipo: d.tipo || 'concepto',
      titulo: d.titulo || `Diagrama ${index + 1}`,
      descripcion: d.descripcion || '',
      datos: d.datos || {},
    }));

    return diagramas;
  } catch (error) {
    console.error('Error generando diagramas:', error);
    // En lugar de lanzar el error, devolver array vacío para que no falle todo
    console.warn('⚠️ Continuando sin diagramas debido al error');
    return [];
  }
}

/**
 * Genera flashcards de repaso desde contenido teórico
 */
export async function generarFlashcards(
  contenidoTeorico: ContenidoTeorico,
  perfil: PerfilAprendizaje
): Promise<Flashcard[]> {
  if (!openai) {
    throw new Error('OpenAI API no está configurada');
  }

  try {
    const contenidoTexto = contenidoTeorico.secciones
      .map((s) => `${s.titulo}: ${s.contenido}`)
      .join('\n\n');

    const cantidadFlashcards = perfil.velocidad_aprendizaje === 'rapido' ? 15 : 10;

    const prompt = `
Crea FLASHCARDS de repaso basadas en el siguiente contenido.

CONTENIDO:
${contenidoTexto}

INSTRUCCIONES:
- Genera ${cantidadFlashcards} flashcards
- Cada flashcard debe tener:
  * Pregunta clara y concisa
  * Respuesta breve pero completa
  * Categoría (opcional)
  * Dificultad (facil, medio, dificil)

- Estilo: ${perfil.velocidad_aprendizaje === 'rapido' ? 'Preguntas directas y respuestas concisas' : 'Preguntas detalladas con respuestas completas'}
- Lenguaje: ${perfil.prefiere_lenguaje_cotidiano ? 'Cotidiano y simple' : 'Preciso pero accesible'}

Responde ÚNICAMENTE con JSON válido en este formato (sin markdown):
{
  "flashcards": [
    {
      "pregunta": "¿Pregunta?",
      "respuesta": "Respuesta completa",
      "categoria": "Categoría (opcional)",
      "dificultad": "medio"
    }
  ]
}
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en crear flashcards educativas estructuradas en formato JSON. Responde SOLO con JSON válido, sin markdown ni texto adicional.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const texto = completion.choices[0]?.message?.content || '';

    if (!texto || texto.trim().length === 0) {
      throw new Error('OpenAI no devolvió contenido para las flashcards');
    }

    // Limpiar JSON - función similar a la de gemini.ts
    let textoLimpio = texto.trim();
    
    // Remover markdown code blocks
    if (textoLimpio.startsWith('```json')) {
      textoLimpio = textoLimpio.replace(/^```json\s*/i, '').replace(/\s*```$/g, '');
    } else if (textoLimpio.startsWith('```')) {
      textoLimpio = textoLimpio.replace(/^```\s*/i, '').replace(/\s*```$/g, '');
    }
    
    // Buscar el primer { y último } para extraer solo el JSON
    const primerCorchete = textoLimpio.indexOf('{');
    const ultimoCorchete = textoLimpio.lastIndexOf('}');
    
    if (primerCorchete !== -1 && ultimoCorchete !== -1 && ultimoCorchete > primerCorchete) {
      textoLimpio = textoLimpio.substring(primerCorchete, ultimoCorchete + 1);
    }
    
    textoLimpio = textoLimpio.trim();

    if (!textoLimpio || textoLimpio.length === 0) {
      throw new Error('No se pudo extraer JSON válido de la respuesta de OpenAI');
    }

    let parsed;
    try {
      parsed = JSON.parse(textoLimpio);
    } catch (parseError) {
      console.error('❌ Error al parsear JSON de flashcards:', parseError);
      console.error('📄 Texto que falló:', textoLimpio);
      throw new Error(`Error al parsear JSON: ${parseError instanceof Error ? parseError.message : 'Error desconocido'}`);
    }

    if (!parsed.flashcards || !Array.isArray(parsed.flashcards)) {
      console.warn('⚠️ La respuesta no tiene el formato esperado. Respuesta:', parsed);
      return [];
    }

    const flashcards: Flashcard[] = parsed.flashcards.map((f: any, index: number) => ({
      id: `flashcard-${index + 1}`,
      pregunta: f.pregunta || `Pregunta ${index + 1}`,
      respuesta: f.respuesta || '',
      categoria: f.categoria,
      dificultad: f.dificultad || 'medio',
    }));

    return flashcards;
  } catch (error) {
    console.error('Error generando flashcards:', error);
    // En lugar de lanzar el error, devolver array vacío para que no falle todo
    console.warn('⚠️ Continuando sin flashcards debido al error');
    return [];
  }
}

/**
 * Genera infografías desde contenido teórico
 */
export async function generarInfografias(
  contenidoTeorico: ContenidoTeorico,
  perfil: PerfilAprendizaje
): Promise<Infografia[]> {
  if (!openai) {
    throw new Error('OpenAI API no está configurada');
  }

  try {
    const contenidoTexto = contenidoTeorico.secciones
      .map((s) => `${s.titulo}: ${s.contenido}`)
      .join('\n\n');

    const prompt = `
Crea INFOGRAFÍAS visuales basadas en el siguiente contenido.

CONTENIDO:
${contenidoTexto}

INSTRUCCIONES:
- Genera 1-2 infografías que resuman visualmente los conceptos clave
- Cada infografía debe tener:
  * Título atractivo
  * Contenido descriptivo (qué elementos visuales incluir)
  * Lista de elementos visuales (iconos, gráficos, textos)

- Estilo: ${perfil.nivel_profundidad === 'basico' ? 'Simple y colorido, fácil de entender' : 'Detallado pero visualmente atractivo'}

Responde ÚNICAMENTE con JSON válido en este formato (sin markdown):
{
  "infografias": [
    {
      "titulo": "Título de la infografía",
      "contenido": "Descripción de qué elementos visuales incluir",
      "elementos": [
        "Elemento visual 1",
        "Elemento visual 2"
      ]
    }
  ]
}
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en crear infografías visuales estructuradas en formato JSON. Responde SOLO con JSON válido, sin markdown ni texto adicional.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });

    const texto = completion.choices[0]?.message?.content || '';

    if (!texto || texto.trim().length === 0) {
      throw new Error('OpenAI no devolvió contenido para las infografías');
    }

    // Limpiar JSON - función similar a la de gemini.ts
    let textoLimpio = texto.trim();
    
    // Remover markdown code blocks
    if (textoLimpio.startsWith('```json')) {
      textoLimpio = textoLimpio.replace(/^```json\s*/i, '').replace(/\s*```$/g, '');
    } else if (textoLimpio.startsWith('```')) {
      textoLimpio = textoLimpio.replace(/^```\s*/i, '').replace(/\s*```$/g, '');
    }
    
    // Buscar el primer { y último } para extraer solo el JSON
    const primerCorchete = textoLimpio.indexOf('{');
    const ultimoCorchete = textoLimpio.lastIndexOf('}');
    
    if (primerCorchete !== -1 && ultimoCorchete !== -1 && ultimoCorchete > primerCorchete) {
      textoLimpio = textoLimpio.substring(primerCorchete, ultimoCorchete + 1);
    }
    
    textoLimpio = textoLimpio.trim();

    // OpenAI ya devuelve JSON limpio con response_format: json_object
    let parsed;
    try {
      // Limpiar JSON por si acaso
      let textoLimpio = texto.trim();
      if (textoLimpio.startsWith('```json')) {
        textoLimpio = textoLimpio.replace(/^```json\s*/i, '').replace(/\s*```$/g, '');
      } else if (textoLimpio.startsWith('```')) {
        textoLimpio = textoLimpio.replace(/^```\s*/i, '').replace(/\s*```$/g, '');
      }
      
      const primerCorchete = textoLimpio.indexOf('{');
      const ultimoCorchete = textoLimpio.lastIndexOf('}');
      if (primerCorchete !== -1 && ultimoCorchete !== -1 && ultimoCorchete > primerCorchete) {
        textoLimpio = textoLimpio.substring(primerCorchete, ultimoCorchete + 1);
      }
      
      parsed = JSON.parse(textoLimpio);
    } catch (parseError) {
      console.error('❌ Error al parsear JSON de infografías:', parseError);
      console.error('📄 Texto que falló:', texto.substring(0, 500));
      throw new Error(`Error al parsear JSON: ${parseError instanceof Error ? parseError.message : 'Error desconocido'}`);
    }

    if (!parsed.infografias || !Array.isArray(parsed.infografias)) {
      console.warn('⚠️ La respuesta no tiene el formato esperado. Respuesta:', parsed);
      return [];
    }

    const infografias: Infografia[] = parsed.infografias.map((i: any, index: number) => ({
      id: `infografia-${index + 1}`,
      titulo: i.titulo || `Infografía ${index + 1}`,
      contenido: i.contenido || '',
      elementos: i.elementos || [],
    }));

    return infografias;
  } catch (error) {
    console.error('Error generando infografías:', error);
    // En lugar de lanzar el error, devolver array vacío para que no falle todo
    console.warn('⚠️ Continuando sin infografías debido al error');
    return [];
  }
}

/**
 * Genera todos los formatos adicionales según el perfil
 */
export async function generarFormatosAdicionales(
  contenidoTeorico: ContenidoTeorico,
  perfil: PerfilAprendizaje | null,
  formatos: string[]
): Promise<Partial<MaterialCompleto>> {
  if (!perfil) {
    return {}; // Sin perfil, no generar formatos adicionales
  }

  const resultado: Partial<MaterialCompleto> = {};

  try {
    // Generar audio si está en la lista
    if (formatos.includes('audio')) {
      console.log('🎧 Generando audio...');
      resultado.audio = await generarAudio(contenidoTeorico, perfil);
    }

    // Generar diagramas si está en la lista
    if (formatos.includes('diagramas')) {
      console.log('📊 Generando diagramas...');
      resultado.diagramas = await generarDiagramas(contenidoTeorico, perfil);
    }

    // Generar flashcards si está en la lista
    if (formatos.includes('flashcards')) {
      console.log('🃏 Generando flashcards...');
      resultado.flashcards = await generarFlashcards(contenidoTeorico, perfil);
    }

    // Generar infografías si está en la lista
    if (formatos.includes('infografias')) {
      console.log('📈 Generando infografías...');
      resultado.infografias = await generarInfografias(contenidoTeorico, perfil);
    }
  } catch (error) {
    console.error('Error generando formatos adicionales:', error);
    // No fallar completamente, devolver lo que se pudo generar
  }

  return resultado;
}
