// services/password.ts
// Servicios para cambiar contraseña

import { supabase } from './supabase';

/**
 * Cambia la contraseña del usuario
 * Primero verifica que la contraseña actual sea correcta
 */
export async function cambiarContrasena(
  contrasenaActual: string,
  nuevaContrasena: string
): Promise<boolean> {
  try {
    // Obtener el usuario actual
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !authUser) {
      throw new Error('No se pudo obtener la información del usuario');
    }

    // Verificar que la contraseña actual sea correcta intentando hacer login
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: authUser.email!,
      password: contrasenaActual,
    });

    if (verifyError) {
      throw new Error('La contraseña actual es incorrecta');
    }

    // Validar nueva contraseña
    if (nuevaContrasena.length < 6) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
    }

    // Actualizar la contraseña
    const { error: updateError } = await supabase.auth.updateUser({
      password: nuevaContrasena,
    });

    if (updateError) {
      throw new Error(`Error al actualizar la contraseña: ${updateError.message}`);
    }

    return true;
  } catch (error: any) {
    console.error('Error al cambiar contraseña:', error);
    throw error;
  }
}

