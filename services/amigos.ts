// services/amigos.ts
// Servicios para manejar relaciones de amistad y rankings

import { supabase } from './supabase';

export interface Amigo {
  usuario_id: string;
  nombre: string;
  apellido: string;
  avatar_color: string;
  codigo_amistad: string;
}

export interface RankingAmigo {
  posicion: number;
  usuario_id: string;
  nombre: string;
  apellido: string;
  avatar_color: string;
  puntos_totales: number;
  racha_actual: number;
  sesiones_completadas: number;
  es_yo?: boolean; // Para marcar si es el usuario actual
}

export interface SolicitudAmistad {
  id: string;
  alumno_id: string;
  amigo_id: string;
  estado: 'pendiente' | 'aceptado' | 'rechazado' | 'bloqueado';
  solicitado_por: string;
  creado_en: string;
  aceptado_en?: string;
}

/**
 * Obtiene el código de amistad del alumno actual
 */
export async function getCodigoAmistad(alumnoId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('alumno')
      .select('codigo_amistad')
      .eq('alumno_id', alumnoId)
      .single();

    if (error) {
      console.error('Error al obtener código de amistad:', error);
      return null;
    }

    return data?.codigo_amistad || null;
  } catch (error) {
    console.error('Error al obtener código de amistad:', error);
    return null;
  }
}

/**
 * Busca un alumno por su código de amistad
 */
export async function buscarAlumnoPorCodigo(codigoAmistad: string): Promise<Amigo | null> {
  try {
    const codigoLimpio = codigoAmistad.trim().toUpperCase();

    // Primero buscar el alumno por código
    const { data: alumnoData, error: alumnoError } = await supabase
      .from('alumno')
      .select('alumno_id, codigo_amistad, avatar_color')
      .eq('codigo_amistad', codigoLimpio)
      .single();

    if (alumnoError || !alumnoData) {
      console.error('Error al buscar alumno por código:', alumnoError);
      return null;
    }

    // Luego obtener los datos del usuario (alumno_id debería ser igual a usuario_id)
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .select('usuario_id, nombre, apellido')
      .eq('usuario_id', alumnoData.alumno_id)
      .single();

    if (usuarioError || !usuarioData) {
      console.error('Error al obtener datos del usuario:', usuarioError);
      return null;
    }

    return {
      usuario_id: alumnoData.alumno_id,
      nombre: usuarioData.nombre || '',
      apellido: usuarioData.apellido || '',
      avatar_color: alumnoData.avatar_color || '#8B5CF6',
      codigo_amistad: alumnoData.codigo_amistad,
    };
  } catch (error) {
    console.error('Error al buscar alumno por código:', error);
    return null;
  }
}

/**
 * Agrega un amigo usando el código de amistad
 */
export async function agregarAmigoPorCodigo(
  miAlumnoId: string,
  codigoAmistad: string
): Promise<{ success: boolean; message: string }> {
  try {
    const codigoLimpio = codigoAmistad.trim().toUpperCase();

    // 1. Buscar el alumno por código
    const amigo = await buscarAlumnoPorCodigo(codigoLimpio);
    if (!amigo) {
      return {
        success: false,
        message: 'No se encontró ningún alumno con ese código',
      };
    }

    // 2. Verificar que no sea el mismo usuario
    if (amigo.usuario_id === miAlumnoId) {
      return {
        success: false,
        message: 'No puedes agregarte a ti mismo como amigo',
      };
    }

    // 3. Verificar si ya son amigos
    const { data: amistadExistente, error: errorAmistad } = await supabase
      .from('alumno_amigo')
      .select('id, estado')
      .or(`and(alumno_id.eq.${miAlumnoId},amigo_id.eq.${amigo.usuario_id}),and(alumno_id.eq.${amigo.usuario_id},amigo_id.eq.${miAlumnoId})`)
      .maybeSingle();

    if (errorAmistad && errorAmistad.code !== 'PGRST116') {
      // PGRST116 es "no rows returned", que es válido
      console.error('Error al verificar amistad existente:', errorAmistad);
    }

    if (amistadExistente) {
      if (amistadExistente.estado === 'aceptado') {
        return {
          success: false,
          message: 'Ya son amigos',
        };
      } else if (amistadExistente.estado === 'pendiente') {
        return {
          success: false,
          message: 'Ya existe una solicitud de amistad pendiente',
        };
      }
    }

    // 4. Crear la relación de amistad (directamente aceptada)
    const { error: insertError } = await supabase
      .from('alumno_amigo')
      .insert({
        alumno_id: miAlumnoId,
        amigo_id: amigo.usuario_id,
        estado: 'aceptado',
        solicitado_por: miAlumnoId,
        aceptado_en: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error al agregar amigo:', insertError);
      return {
        success: false,
        message: 'No se pudo agregar el amigo. Intenta nuevamente.',
      };
    }

    return {
      success: true,
      message: `¡${amigo.nombre} ${amigo.apellido} agregado como amigo!`,
    };
  } catch (error: any) {
    console.error('Error al agregar amigo:', error);
    return {
      success: false,
      message: error.message || 'Error al agregar amigo',
    };
  }
}

/**
 * Obtiene la lista de amigos de un alumno
 */
export async function getAmigos(alumnoId: string): Promise<Amigo[]> {
  try {
    // Obtener relaciones donde el alumno es alumno_id o amigo_id
    const { data, error } = await supabase
      .from('alumno_amigo')
      .select('alumno_id, amigo_id')
      .or(`alumno_id.eq.${alumnoId},amigo_id.eq.${alumnoId}`)
      .eq('estado', 'aceptado');

    if (error) {
      console.error('Error al obtener amigos:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Obtener IDs de los amigos (el que no es el alumno actual)
    const amigosIds = data.map((relacion: any) =>
      relacion.alumno_id === alumnoId ? relacion.amigo_id : relacion.alumno_id
    );

    // Obtener datos de los usuarios (primera consulta)
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('usuario_id, nombre, apellido')
      .in('usuario_id', amigosIds);

    if (usuariosError || !usuarios) {
      console.error('Error al obtener datos de usuarios:', usuariosError);
      return [];
    }

    // Obtener datos de los alumnos (segunda consulta separada)
    const { data: alumnos, error: alumnosError } = await supabase
      .from('alumno')
      .select('alumno_id, avatar_color, codigo_amistad')
      .in('alumno_id', amigosIds);

    if (alumnosError) {
      console.error('Error al obtener datos de alumnos:', alumnosError);
      // No es crítico, continuar sin datos de alumno
    }

    // Mapear combinando datos de usuarios y alumnos
    return usuarios.map((usuario: any) => {
      const alumno = alumnos?.find((a: any) => a.alumno_id === usuario.usuario_id);
      return {
        usuario_id: usuario.usuario_id,
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        avatar_color: alumno?.avatar_color || '#8B5CF6',
        codigo_amistad: alumno?.codigo_amistad || '',
      };
    });
  } catch (error) {
    console.error('Error al obtener amigos:', error);
    return [];
  }
}

/**
 * Obtiene el ranking de amigos (top 10) usando la función SQL
 */
export async function getRankingAmigos(alumnoId: string): Promise<RankingAmigo[]> {
  try {
    // Llamar a la función SQL que creamos
    const { data, error } = await supabase.rpc('get_ranking_amigos', {
      p_alumno_id: alumnoId,
      p_limit: 10,
    });

    if (error) {
      console.error('Error al obtener ranking de amigos:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Mapear los resultados y marcar si es el usuario actual
    return data.map((item: any) => ({
      posicion: Number(item.posicion),
      usuario_id: item.usuario_id,
      nombre: item.nombre || '',
      apellido: item.apellido || '',
      avatar_color: item.avatar_color || '#8B5CF6',
      puntos_totales: item.puntos_totales || 0,
      racha_actual: item.racha_actual || 0,
      sesiones_completadas: Number(item.sesiones_completadas || 0),
      es_yo: item.usuario_id === alumnoId,
    }));
  } catch (error) {
    console.error('Error al obtener ranking de amigos:', error);
    return [];
  }
}

/**
 * Obtiene la posición del alumno en el ranking de sus amigos
 */
export async function getMiPosicionRanking(alumnoId: string): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('get_posicion_ranking_amigos', {
      p_alumno_id: alumnoId,
    });

    if (error) {
      console.error('Error al obtener posición en ranking:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Error al obtener posición en ranking:', error);
    return 0;
  }
}

/**
 * Elimina un amigo
 */
export async function eliminarAmigo(
  miAlumnoId: string,
  amigoId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('alumno_amigo')
      .delete()
      .or(`and(alumno_id.eq.${miAlumnoId},amigo_id.eq.${amigoId}),and(alumno_id.eq.${amigoId},amigo_id.eq.${miAlumnoId})`);

    if (error) {
      console.error('Error al eliminar amigo:', error);
      return {
        success: false,
        message: 'No se pudo eliminar el amigo',
      };
    }

    return {
      success: true,
      message: 'Amigo eliminado correctamente',
    };
  } catch (error: any) {
    console.error('Error al eliminar amigo:', error);
    return {
      success: false,
      message: error.message || 'Error al eliminar amigo',
    };
  }
}

