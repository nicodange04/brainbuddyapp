// services/padre.ts
// Servicios para gestionar la relación padre-alumno

import { supabase } from './supabase';
import { getEstadisticasUsuario } from './perfil';

export interface HijoVinculado {
  alumno_id: string;
  usuario_id: string;
  nombre: string;
  apellido: string;
  iniciales: string;
  avatar_color: string;
  codigo_vinculacion: string;
  vinculado_en: string;
  estado: 'activo' | 'inactivo' | 'pendiente';
}

export interface DatosHijo {
  usuario_id: string;
  alumno_id: string;
  nombre: string;
  apellido: string;
  correo: string;
  iniciales: string;
  avatar_color: string;
  codigo_vinculacion: string;
  fecha_nacimiento?: string;
  estadisticas: any; // EstadisticasPerfil
}

/**
 * Obtiene todos los hijos vinculados de un padre
 */
export async function getHijosVinculados(padreId: string): Promise<HijoVinculado[]> {
  try {
    // Primero obtener las vinculaciones
    // Nota: en padre_alumno, alumno_id es en realidad un usuario_id (referencia a usuarios.usuario_id)
    const { data: vinculaciones, error: vinculacionesError } = await supabase
      .from('padre_alumno')
      .select('alumno_id, vinculado_en, estado')
      .eq('padre_id', padreId)
      .eq('estado', 'activo')
      .order('vinculado_en', { ascending: false });

    if (vinculacionesError) {
      console.error('Error al obtener vinculaciones:', vinculacionesError);
      throw new Error(`Error al obtener hijos: ${vinculacionesError.message}`);
    }

    if (!vinculaciones || vinculaciones.length === 0) {
      return [];
    }

    // En padre_alumno, alumno_id es en realidad usuario_id
    const usuarioIds = vinculaciones.map(v => v.alumno_id);

    // Obtener datos de usuarios
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('usuario_id, nombre, apellido')
      .in('usuario_id', usuarioIds);

    if (usuariosError) {
      console.error('Error al obtener usuarios:', usuariosError);
      throw new Error(`Error al obtener datos de usuarios: ${usuariosError.message}`);
    }

    // Obtener datos de alumnos (alumno_id = usuario_id)
    const { data: alumnos, error: alumnosError } = await supabase
      .from('alumno')
      .select('alumno_id, codigo_vinculacion, avatar_color')
      .in('alumno_id', usuarioIds);

    if (alumnosError) {
      console.error('Error al obtener alumnos:', alumnosError);
      // No es crítico si no hay datos en alumno, continuar con usuarios
    }

    // Formatear datos combinando todo
    const hijos: HijoVinculado[] = vinculaciones.map((vinculacion) => {
      // vinculacion.alumno_id es en realidad un usuario_id
      const usuarioId = vinculacion.alumno_id;
      const usuario = usuarios?.find(u => u.usuario_id === usuarioId);
      const alumno = alumnos?.find(a => a.alumno_id === usuarioId);
      
      // Generar iniciales
      const nombre = usuario?.nombre || '';
      const apellido = usuario?.apellido || '';
      const iniciales = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();

      return {
        alumno_id: usuarioId, // En realidad es usuario_id, pero lo usamos como alumno_id
        usuario_id: usuarioId,
        nombre: nombre,
        apellido: apellido,
        iniciales: iniciales,
        avatar_color: alumno?.avatar_color || '#8B5CF6',
        codigo_vinculacion: alumno?.codigo_vinculacion || '',
        vinculado_en: vinculacion.vinculado_en,
        estado: vinculacion.estado as 'activo' | 'inactivo' | 'pendiente',
      };
    });

    return hijos;
  } catch (error) {
    console.error('Error al obtener hijos vinculados:', error);
    throw error;
  }
}

/**
 * Obtiene los datos completos de un hijo específico
 */
export async function getDatosHijo(alumnoId: string): Promise<DatosHijo> {
  try {
    // Nota: alumnoId en este contexto es en realidad un usuario_id
    // (porque viene de padre_alumno donde alumno_id = usuario_id)
    
    // Obtener datos del usuario primero
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .select('usuario_id, nombre, apellido, correo')
      .eq('usuario_id', alumnoId)
      .single();

    if (usuarioError || !usuarioData) {
      throw new Error('No se encontró el usuario del alumno');
    }

    // Obtener datos del alumno (alumno_id = usuario_id)
    const { data: alumnoData, error: alumnoError } = await supabase
      .from('alumno')
      .select('alumno_id, codigo_vinculacion, avatar_color, fecha_nacimiento')
      .eq('alumno_id', alumnoId)
      .single();

    // Si no hay datos en alumno, usar valores por defecto
    const codigoVinculacion = alumnoData?.codigo_vinculacion || '';
    const avatarColor = alumnoData?.avatar_color || '#8B5CF6';
    const fechaNacimiento = alumnoData?.fecha_nacimiento;

    const nombre = usuarioData.nombre || '';
    const apellido = usuarioData.apellido || '';
    const iniciales = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();

    // Obtener estadísticas
    const estadisticas = await getEstadisticasUsuario(usuarioData.usuario_id);

    return {
      usuario_id: usuarioData.usuario_id,
      alumno_id: alumnoId, // alumnoId es en realidad usuario_id, pero lo usamos como alumno_id
      nombre: nombre,
      apellido: apellido,
      correo: usuarioData.correo || '',
      iniciales: iniciales,
      avatar_color: avatarColor,
      codigo_vinculacion: codigoVinculacion,
      fecha_nacimiento: fechaNacimiento,
      estadisticas: estadisticas,
    };
  } catch (error) {
    console.error('Error al obtener datos del hijo:', error);
    throw error;
  }
}

/**
 * Verifica si un padre tiene hijos vinculados
 */
export async function tieneHijosVinculados(padreId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('padre_alumno')
      .select('id')
      .eq('padre_id', padreId)
      .eq('estado', 'activo')
      .limit(1);

    if (error) {
      console.error('Error al verificar hijos:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error al verificar hijos vinculados:', error);
    return false;
  }
}

/**
 * Obtiene el primer hijo vinculado (útil cuando solo hay uno)
 */
export async function getPrimerHijo(padreId: string): Promise<HijoVinculado | null> {
  try {
    const hijos = await getHijosVinculados(padreId);
    return hijos.length > 0 ? hijos[0] : null;
  } catch (error) {
    console.error('Error al obtener primer hijo:', error);
    return null;
  }
}

