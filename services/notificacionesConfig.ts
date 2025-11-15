// services/notificacionesConfig.ts
// Servicios para gestionar preferencias de notificaciones

import { supabase } from './supabase';

export interface PreferenciasNotificaciones {
  material_listo: boolean; // Notificar cuando el material esté listo
  recordatorio_sesion: boolean; // Recordatorios de sesiones programadas
  logros_trofeos: boolean; // Notificar cuando se obtenga un trofeo
  resumen_semanal: boolean; // Resumen semanal de progreso
  recordatorio_examen: boolean; // Recordatorios de exámenes próximos
}

/**
 * Obtiene las preferencias de notificaciones del usuario
 */
export async function getPreferenciasNotificaciones(
  usuarioId: string
): Promise<PreferenciasNotificaciones> {
  try {
    // Intentar obtener preferencias, pero si la columna no existe, retornar valores por defecto
    const { data, error } = await supabase
      .from('usuarios')
      .select('preferencias_notificaciones')
      .eq('usuario_id', usuarioId)
      .single();

    // Si hay error (puede ser que la columna no exista), retornar valores por defecto
    if (error) {
      console.warn('No se pudieron obtener preferencias (la columna puede no existir aún):', error.message);
      return getPreferenciasPorDefecto();
    }

    // Si no hay preferencias guardadas, retornar valores por defecto
    if (!data?.preferencias_notificaciones) {
      return getPreferenciasPorDefecto();
    }

    // Combinar con valores por defecto para asegurar que todos los campos existan
    const preferencias = {
      ...getPreferenciasPorDefecto(),
      ...(data.preferencias_notificaciones as PreferenciasNotificaciones),
    };

    return preferencias;
  } catch (error) {
    console.error('Error al obtener preferencias de notificaciones:', error);
    return getPreferenciasPorDefecto();
  }
}

/**
 * Actualiza las preferencias de notificaciones del usuario
 */
export async function actualizarPreferenciasNotificaciones(
  usuarioId: string,
  preferencias: PreferenciasNotificaciones
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({
        preferencias_notificaciones: preferencias,
      })
      .eq('usuario_id', usuarioId);

    if (error) {
      // Si el error es que la columna no existe, informar al usuario
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        throw new Error(
          'La columna de preferencias no existe en la base de datos. ' +
          'Por favor, ejecuta la migración SQL: sql/migration_preferencias_notificaciones.sql'
        );
      }
      console.error('Error al actualizar preferencias:', error);
      throw new Error(`Error al actualizar preferencias: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error al actualizar preferencias de notificaciones:', error);
    throw error;
  }
}

/**
 * Retorna las preferencias por defecto (todas activadas)
 */
function getPreferenciasPorDefecto(): PreferenciasNotificaciones {
  return {
    material_listo: true,
    recordatorio_sesion: true,
    logros_trofeos: true,
    resumen_semanal: false,
    recordatorio_examen: true,
  };
}

