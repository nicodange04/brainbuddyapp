// services/auth.ts
import { Alumno, Padre, Usuario } from '@/types';
import { generarAvatar, generarCodigoVinculacion } from './avatar';
import { supabase } from './supabase';

// Función para convertir DD/MM/YYYY a YYYY-MM-DD
const convertToISODate = (dateString: string): string => {
  if (!dateString) return '';
  
  // Si ya está en formato ISO, devolverlo
  if (dateString.includes('-') && dateString.length === 10) {
    return dateString;
  }
  
  // Convertir de DD/MM/YYYY a YYYY-MM-DD
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  return dateString;
};

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: 'alumno' | 'padre';
  fechaNacimiento?: string;
  telefono?: string;
}

export interface AuthUser {
  usuario: Usuario;
  alumno?: Alumno;
  padre?: Padre;
}

// Función para hacer login
export const login = async (credentials: LoginCredentials): Promise<AuthUser> => {
  try {
    // Autenticar con Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('No se pudo obtener la información del usuario');
    }

    // Obtener datos del usuario desde nuestra tabla
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select(`
        *,
        alumno:alumno(*),
        padre:padre(*)
      `)
      .eq('correo', credentials.email)
      .single();

    if (usuarioError) {
      throw new Error('No se encontró el usuario en la base de datos');
    }

    return {
      usuario,
      alumno: usuario.alumno,
      padre: usuario.padre,
    };
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};

// Función para registrar usuario
export const register = async (data: RegisterData): Promise<AuthUser> => {
  try {
    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario');
    }

    // Crear registro en tabla usuarios
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .insert({
        usuario_id: authData.user.id,
        nombre: data.nombre,
        apellido: data.apellido,
        correo: data.email,
        password_hash: '', // Supabase maneja el hash
        rol: data.rol,
      })
      .select()
      .single();

    if (usuarioError) {
      console.error('Error detallado al crear usuario:', usuarioError);
      throw new Error(`Error al crear el usuario en la base de datos: ${usuarioError.message}`);
    }

    let alumno: Alumno | undefined;
    let padre: Padre | undefined;

    // Crear registro específico según el rol
    if (data.rol === 'alumno') {
      // Generar avatar y código de vinculación
      const avatar = generarAvatar(`${data.nombre} ${data.apellido}`);
      const codigoVinculacion = generarCodigoVinculacion();

      const { data: alumnoData, error: alumnoError } = await supabase
        .from('alumno')
        .insert({
          alumno_id: authData.user.id,
          fecha_nacimiento: data.fechaNacimiento ? convertToISODate(data.fechaNacimiento) : null,
          codigo_vinculacion: codigoVinculacion,
          avatar_color: avatar.color,
          puntos_totales: 0,
          racha_dias: 0,
        })
        .select()
        .single();

      if (alumnoError) {
        console.error('Error detallado al crear alumno:', alumnoError);
        throw new Error(`Error al crear el perfil de alumno: ${alumnoError.message}`);
      }

      alumno = alumnoData;
    } else if (data.rol === 'padre') {
      const { data: padreData, error: padreError } = await supabase
        .from('padre')
        .insert({
          padre_id: authData.user.id,
          telefono: data.telefono,
        })
        .select()
        .single();

      if (padreError) {
        throw new Error('Error al crear el perfil de padre');
      }

      padre = padreData;
    }

    return {
      usuario,
      alumno,
      padre,
    };
  } catch (error) {
    console.error('Error en registro:', error);
    throw error;
  }
};

// Función para hacer logout
export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error en logout:', error);
    throw error;
  }
};

// Función para obtener usuario actual
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    // Obtener datos del usuario desde nuestra tabla
    const { data: usuario, error: usuarioError } = await supabase
      .from('usuarios')
      .select(`
        *,
        alumno:alumno(*),
        padre:padre(*)
      `)
      .eq('usuario_id', user.id)
      .single();

    if (usuarioError) {
      return null;
    }

    return {
      usuario,
      alumno: usuario.alumno,
      padre: usuario.padre,
    };
  } catch (error) {
    console.error('Error al obtener usuario actual:', error);
    return null;
  }
};

// Función para vincular padre con alumno
export const vincularPadreAlumno = async (codigoVinculacion: string, padreId: string): Promise<void> => {
  try {
    // Buscar alumno por código de vinculación
    const { data: alumno, error: alumnoError } = await supabase
      .from('alumno')
      .select('alumno_id')
      .eq('codigo_vinculacion', codigoVinculacion)
      .single();

    if (alumnoError || !alumno) {
      throw new Error('Código de vinculación no válido');
    }

    // Crear vinculación
    const { error: vinculacionError } = await supabase
      .from('padre_alumno')
      .insert({
        padre_id: padreId,
        alumno_id: alumno.alumno_id,
        estado: 'activo',
      });

    if (vinculacionError) {
      throw new Error('Error al vincular padre con alumno');
    }
  } catch (error) {
    console.error('Error en vinculación:', error);
    throw error;
  }
};
