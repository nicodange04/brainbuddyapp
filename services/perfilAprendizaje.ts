// services/perfilAprendizaje.ts
// Servicio para gestionar el perfil de aprendizaje del alumno

import { supabase } from './supabase';

export interface PerfilAprendizaje {
  id: number;
  alumno_id: string;
  estilo_primario: 'visual' | 'auditivo' | 'lectura' | 'kinestesico' | 'mixto';
  estilo_secundario?: 'visual' | 'auditivo' | 'lectura' | 'kinestesico' | 'mixto';
  prefiere_ejemplos: boolean;
  prefiere_diagramas: boolean;
  prefiere_analogias: boolean;
  prefiere_casos_reales: boolean;
  nivel_profundidad: 'basico' | 'medio' | 'avanzado';
  prefiere_pasos_ordenados: boolean;
  prefiere_conceptos_globales: boolean;
  prefiere_resumenes: boolean;
  velocidad_aprendizaje: 'lento' | 'normal' | 'rapido';
  prefiere_lenguaje_formal: boolean;
  prefiere_lenguaje_cotidiano: boolean;
  prefiere_terminos_tecnicos: boolean;
  preferencias_adicionales?: Record<string, any>;
  completado: boolean;
  created_at: string;
  updated_at: string;
}

export interface PerfilAprendizajeInput {
  estilo_primario: 'visual' | 'auditivo' | 'lectura' | 'kinestesico' | 'mixto';
  estilo_secundario?: 'visual' | 'auditivo' | 'lectura' | 'kinestesico' | 'mixto';
  prefiere_ejemplos?: boolean;
  prefiere_diagramas?: boolean;
  prefiere_analogias?: boolean;
  prefiere_casos_reales?: boolean;
  nivel_profundidad?: 'basico' | 'medio' | 'avanzado';
  prefiere_pasos_ordenados?: boolean;
  prefiere_conceptos_globales?: boolean;
  prefiere_resumenes?: boolean;
  velocidad_aprendizaje?: 'lento' | 'normal' | 'rapido';
  prefiere_lenguaje_formal?: boolean;
  prefiere_lenguaje_cotidiano?: boolean;
  prefiere_terminos_tecnicos?: boolean;
  preferencias_adicionales?: Record<string, any>;
}

/**
 * Obtiene el perfil de aprendizaje de un alumno
 */
export async function obtenerPerfilAprendizaje(
  alumnoId: string
): Promise<PerfilAprendizaje | null> {
  try {
    const { data, error } = await supabase
      .from('perfil_aprendizaje')
      .select('*')
      .eq('alumno_id', alumnoId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró el perfil
        return null;
      }
      throw error;
    }

    return data as PerfilAprendizaje;
  } catch (error) {
    console.error('Error obteniendo perfil de aprendizaje:', error);
    throw error;
  }
}

/**
 * Crea o actualiza el perfil de aprendizaje de un alumno
 */
export async function guardarPerfilAprendizaje(
  alumnoId: string,
  perfil: PerfilAprendizajeInput
): Promise<PerfilAprendizaje> {
  try {
    // Verificar si ya existe un perfil
    const perfilExistente = await obtenerPerfilAprendizaje(alumnoId);

    if (perfilExistente) {
      // Actualizar perfil existente
      const { data, error } = await supabase
        .from('perfil_aprendizaje')
        .update({
          ...perfil,
          completado: true,
          updated_at: new Date().toISOString(),
        })
        .eq('alumno_id', alumnoId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as PerfilAprendizaje;
    } else {
      // Crear nuevo perfil
      const { data, error } = await supabase
        .from('perfil_aprendizaje')
        .insert({
          alumno_id: alumnoId,
          ...perfil,
          completado: true,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as PerfilAprendizaje;
    }
  } catch (error) {
    console.error('Error guardando perfil de aprendizaje:', error);
    throw error;
  }
}

/**
 * Verifica si un alumno tiene perfil de aprendizaje completado
 * Con timeout para evitar que bloquee la app
 */
export async function tienePerfilCompletado(alumnoId: string): Promise<boolean> {
  try {
    // Agregar timeout de 5 segundos
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), 5000);
    });

    const perfilPromise = obtenerPerfilAprendizaje(alumnoId).then(
      (perfil) => perfil?.completado ?? false
    );

    // Usar Promise.race para que no bloquee más de 5 segundos
    const resultado = await Promise.race([perfilPromise, timeoutPromise]);
    return resultado;
  } catch (error) {
    console.error('Error verificando perfil:', error);
    // En caso de error, asumir que no tiene perfil (no bloquear)
    return false;
  }
}

/**
 * Genera un prompt personalizado basado en el perfil de aprendizaje
 * para usar en la generación de contenido teórico
 */
export function generarPromptPersonalizado(
  perfil: PerfilAprendizaje
): string {
  const partes: string[] = [];

  // Estilo de aprendizaje
  partes.push(`Estilo de aprendizaje principal: ${perfil.estilo_primario}`);
  if (perfil.estilo_secundario) {
    partes.push(`Estilo secundario: ${perfil.estilo_secundario}`);
  }

  // Instrucciones según estilo visual
  if (perfil.estilo_primario === 'visual' || perfil.prefiere_diagramas) {
    partes.push(
      '- INCLUYE descripciones visuales detalladas, metáforas visuales y referencias a imágenes/diagramas'
    );
  }

  // Instrucciones según estilo auditivo
  if (perfil.estilo_primario === 'auditivo') {
    partes.push(
      '- USA lenguaje conversacional, explicaciones habladas, analogías sonoras y ritmo en la explicación'
    );
  }

  // Instrucciones según estilo lectura/escritura
  if (perfil.estilo_primario === 'lectura') {
    partes.push(
      '- ESTRUCTURA el contenido con listas, puntos clave, definiciones claras y texto bien organizado'
    );
  }

  // Instrucciones según estilo kinestésico
  if (perfil.estilo_primario === 'kinestesico') {
    partes.push(
      '- INCLUYE ejemplos prácticos, actividades, casos de uso reales y aplicaciones prácticas'
    );
  }

  // Preferencias de contenido
  if (perfil.prefiere_ejemplos) {
    partes.push('- INCLUYE múltiples ejemplos concretos y casos prácticos');
  }

  if (perfil.prefiere_analogias) {
    partes.push('- USA analogías y comparaciones con situaciones cotidianas');
  }

  if (perfil.prefiere_casos_reales) {
    partes.push('- INCLUYE casos reales y aplicaciones del mundo real');
  }

  // Nivel de profundidad
  if (perfil.nivel_profundidad === 'basico') {
    partes.push(
      '- EXPLICA conceptos desde lo más básico, sin asumir conocimiento previo'
    );
  } else if (perfil.nivel_profundidad === 'avanzado') {
    partes.push(
      '- PROFUNDIZA en los conceptos, puedes asumir conocimiento básico del tema'
    );
  }

  // Estructura
  if (perfil.prefiere_pasos_ordenados) {
    partes.push('- ORGANIZA el contenido en pasos secuenciales y ordenados');
  }

  if (perfil.prefiere_conceptos_globales) {
    partes.push(
      '- PRESENTA primero una visión general antes de entrar en detalles'
    );
  }

  if (perfil.prefiere_resumenes) {
    partes.push('- INCLUYE resúmenes al final de cada sección');
  }

  // Lenguaje
  if (perfil.prefiere_lenguaje_cotidiano) {
    partes.push(
      '- USA lenguaje cotidiano y accesible, evita jerga técnica innecesaria'
    );
  }

  if (perfil.prefiere_terminos_tecnicos) {
    partes.push(
      '- INCLUYE términos técnicos apropiados pero siempre con explicación'
    );
  }

  // Velocidad
  if (perfil.velocidad_aprendizaje === 'lento') {
    partes.push(
      '- EXPLICA cada concepto con más detalle y repetición de ideas clave'
    );
  } else if (perfil.velocidad_aprendizaje === 'rapido') {
    partes.push(
      '- PRESENTA información de forma más concisa y directa al punto'
    );
  }

  return partes.join('\n');
}
