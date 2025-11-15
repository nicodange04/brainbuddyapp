// services/perfilUpdate.ts
// Servicios para actualizar datos del perfil del usuario

import { supabase } from './supabase';

export interface DatosPerfilActualizar {
  nombre?: string;
  apellido?: string;
  correo?: string;
  fecha_nacimiento?: string; // Para alumnos
  telefono?: string; // Para padres
}

/**
 * Actualiza los datos del perfil del usuario
 */
export async function actualizarPerfilUsuario(
  usuarioId: string,
  datos: DatosPerfilActualizar
): Promise<boolean> {
  try {
    // Preparar datos para actualizar (solo los que están definidos)
    const datosActualizar: any = {};
    
    if (datos.nombre !== undefined) {
      datosActualizar.nombre = datos.nombre;
    }
    if (datos.apellido !== undefined) {
      datosActualizar.apellido = datos.apellido;
    }
    if (datos.correo !== undefined) {
      datosActualizar.correo = datos.correo;
    }

    // Actualizar tabla usuarios
    const { error: usuarioError } = await supabase
      .from('usuarios')
      .update(datosActualizar)
      .eq('usuario_id', usuarioId);

    if (usuarioError) {
      console.error('Error al actualizar usuario:', usuarioError);
      throw new Error(`Error al actualizar perfil: ${usuarioError.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    throw error;
  }
}

/**
 * Actualiza los datos específicos del alumno
 */
export async function actualizarPerfilAlumno(
  alumnoId: string,
  fechaNacimiento?: string
): Promise<boolean> {
  try {
    const datosActualizar: any = {};
    
    if (fechaNacimiento !== undefined) {
      datosActualizar.fecha_nacimiento = fechaNacimiento || null;
    }

    if (Object.keys(datosActualizar).length === 0) {
      return true; // No hay nada que actualizar
    }

    const { error } = await supabase
      .from('alumno')
      .update(datosActualizar)
      .eq('alumno_id', alumnoId);

    if (error) {
      console.error('Error al actualizar alumno:', error);
      throw new Error(`Error al actualizar perfil de alumno: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error al actualizar perfil de alumno:', error);
    throw error;
  }
}

/**
 * Actualiza los datos específicos del padre
 */
export async function actualizarPerfilPadre(
  padreId: string,
  telefono?: string
): Promise<boolean> {
  try {
    const datosActualizar: any = {};
    
    if (telefono !== undefined) {
      datosActualizar.telefono = telefono || null;
    }

    if (Object.keys(datosActualizar).length === 0) {
      return true; // No hay nada que actualizar
    }

    const { error } = await supabase
      .from('padre')
      .update(datosActualizar)
      .eq('padre_id', padreId);

    if (error) {
      console.error('Error al actualizar padre:', error);
      throw new Error(`Error al actualizar perfil de padre: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error al actualizar perfil de padre:', error);
    throw error;
  }
}

/**
 * Actualiza el perfil completo (usuario + alumno/padre según corresponda)
 */
export async function actualizarPerfilCompleto(
  usuarioId: string,
  datos: DatosPerfilActualizar,
  rol: 'alumno' | 'padre',
  alumnoId?: string,
  padreId?: string
): Promise<boolean> {
  try {
    // Actualizar datos del usuario
    await actualizarPerfilUsuario(usuarioId, {
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: datos.correo,
    });

    // Actualizar datos específicos según el rol
    if (rol === 'alumno' && alumnoId) {
      await actualizarPerfilAlumno(alumnoId, datos.fecha_nacimiento);
    } else if (rol === 'padre' && padreId) {
      await actualizarPerfilPadre(padreId, datos.telefono);
    }

    return true;
  } catch (error) {
    console.error('Error al actualizar perfil completo:', error);
    throw error;
  }
}

