import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Configura el comportamiento de las notificaciones
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Solicita permisos para notificaciones locales
 * @returns true si se otorgaron permisos, false en caso contrario
 */
export async function solicitarPermisosNotificaciones(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️ Permisos de notificaciones no otorgados');
      return false;
    }

    // Configurar canal de notificaciones para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8B5CF6',
      });
    }

    console.log('✅ Permisos de notificaciones otorgados');
    return true;
  } catch (error) {
    console.error('❌ Error al solicitar permisos de notificaciones:', error);
    return false;
  }
}

/**
 * Envía una notificación local
 * @param titulo - Título de la notificación
 * @param cuerpo - Cuerpo de la notificación
 * @param datos - Datos adicionales (opcional)
 */
export async function enviarNotificacionLocal(
  titulo: string,
  cuerpo: string,
  datos?: Record<string, any>
): Promise<void> {
  try {
    // Verificar permisos antes de enviar
    const tienePermisos = await solicitarPermisosNotificaciones();
    if (!tienePermisos) {
      console.warn('⚠️ No se pueden enviar notificaciones sin permisos');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: titulo,
        body: cuerpo,
        sound: true,
        data: datos || {},
      },
      trigger: null, // null = enviar inmediatamente
    });

    console.log(`✅ Notificación enviada: ${titulo}`);
  } catch (error) {
    console.error('❌ Error al enviar notificación:', error);
  }
}

/**
 * Notifica cuando el material de una sesión está listo
 * @param tema - Tema de la sesión
 * @param sesionId - ID de la sesión
 */
export async function notificarMaterialListo(tema: string, sesionId: string): Promise<void> {
  await enviarNotificacionLocal(
    '📚 Material generado',
    `El material para "${tema}" está listo para estudiar`,
    {
      sesionId,
      tipo: 'material_listo',
    }
  );
}

/**
 * Notifica cuando hay un error al generar material
 * @param tema - Tema de la sesión
 * @param sesionId - ID de la sesión
 */
export async function notificarErrorMaterial(tema: string, sesionId: string): Promise<void> {
  await enviarNotificacionLocal(
    '⚠️ Error al generar material',
    `No se pudo generar el material para "${tema}". Se reintentará automáticamente.`,
    {
      sesionId,
      tipo: 'error_material',
    }
  );
}


