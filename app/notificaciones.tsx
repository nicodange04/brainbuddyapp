// app/notificaciones.tsx
// Pantalla para configurar preferencias de notificaciones

import { useAuth } from '@/contexts/AuthContext';
import {
  actualizarPreferenciasNotificaciones,
  getPreferenciasNotificaciones,
  PreferenciasNotificaciones,
} from '@/services/notificacionesConfig';
import { solicitarPermisosNotificaciones } from '@/services/notifications';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Design System Colors
const DesignColors = {
  primary: {
    violet: '#8B5CF6',
    violetLight: '#A78BFA',
    violetDark: '#7C3AED',
  },
  secondary: {
    white: '#FFFFFF',
    offWhite: '#F9FAFB',
  },
  neutral: {
    black: '#1F2937',
    darkGray: '#374151',
    mediumGray: '#6B7280',
    lightGray: '#E5E7EB',
  },
  supporting: {
    blue: '#60A5FA',
    green: '#34D399',
  },
};

interface NotificacionItem {
  id: keyof PreferenciasNotificaciones;
  titulo: string;
  descripcion: string;
  icono: keyof typeof Ionicons.glyphMap;
}

const notificacionesItems: NotificacionItem[] = [
  {
    id: 'material_listo',
    titulo: 'Material listo',
    descripcion: 'Recibe una notificación cuando el material de estudio esté listo',
    icono: 'document-text',
  },
  {
    id: 'recordatorio_sesion',
    titulo: 'Recordatorios de sesiones',
    descripcion: 'Te recordamos cuando tengas una sesión de estudio programada',
    icono: 'calendar',
  },
  {
    id: 'logros_trofeos',
    titulo: 'Logros y trofeos',
    descripcion: 'Celebra cuando obtengas un nuevo trofeo o logro',
    icono: 'trophy',
  },
  {
    id: 'recordatorio_examen',
    titulo: 'Recordatorios de exámenes',
    descripcion: 'Te avisamos cuando se acerque la fecha de un examen',
    icono: 'school',
  },
  {
    id: 'resumen_semanal',
    titulo: 'Resumen semanal',
    descripcion: 'Recibe un resumen de tu progreso cada semana',
    icono: 'stats-chart',
  },
];

export default function NotificacionesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferencias, setPreferencias] = useState<PreferenciasNotificaciones>({
    material_listo: true,
    recordatorio_sesion: true,
    logros_trofeos: true,
    resumen_semanal: false,
    recordatorio_examen: true,
  });

  useEffect(() => {
    cargarPreferencias();
  }, [user]);

  const cargarPreferencias = async () => {
    if (!user?.usuario?.usuario_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const prefs = await getPreferenciasNotificaciones(user.usuario.usuario_id);
      setPreferencias(prefs);
    } catch (error) {
      console.error('Error al cargar preferencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePreferencia = (id: keyof PreferenciasNotificaciones) => {
    setPreferencias((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleGuardar = async () => {
    if (!user?.usuario?.usuario_id) {
      Alert.alert('Error', 'No se pudo obtener la información del usuario');
      return;
    }

    // Solicitar permisos si hay alguna notificación activada
    const tieneAlgunaActiva = Object.values(preferencias).some((v) => v === true);
    if (tieneAlgunaActiva) {
      try {
        await solicitarPermisosNotificaciones();
      } catch (error) {
        console.error('Error al solicitar permisos:', error);
        // Continuar de todas formas
      }
    }

    setSaving(true);
    try {
      await actualizarPreferenciasNotificaciones(user.usuario.usuario_id, preferencias);

      Alert.alert(
        'Preferencias guardadas',
        'Tus preferencias de notificaciones se han actualizado correctamente',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error al guardar preferencias:', error);
      Alert.alert('Error', error.message || 'No se pudieron guardar las preferencias. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={DesignColors.primary.violet} />
        <Text style={styles.loadingText}>Cargando preferencias...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={DesignColors.neutral.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Información */}
        <View style={styles.infoCard}>
          <Ionicons name="notifications" size={32} color={DesignColors.primary.violet} />
          <Text style={styles.infoTitle}>Gestiona tus notificaciones</Text>
          <Text style={styles.infoText}>
            Elige qué notificaciones quieres recibir para mantenerte al día con tu progreso de estudio.
          </Text>
        </View>

        {/* Lista de notificaciones */}
        <View style={styles.section}>
          {notificacionesItems.map((item) => (
            <View key={item.id} style={styles.notificacionItem}>
              <View style={styles.notificacionIcon}>
                <Ionicons
                  name={item.icono}
                  size={24}
                  color={preferencias[item.id] ? DesignColors.primary.violet : DesignColors.neutral.mediumGray}
                />
              </View>
              <View style={styles.notificacionContent}>
                <Text style={styles.notificacionTitulo}>{item.titulo}</Text>
                <Text style={styles.notificacionDescripcion}>{item.descripcion}</Text>
              </View>
              <Switch
                value={preferencias[item.id]}
                onValueChange={() => togglePreferencia(item.id)}
                trackColor={{
                  false: DesignColors.neutral.lightGray,
                  true: DesignColors.primary.violetLight,
                }}
                thumbColor={
                  preferencias[item.id] ? DesignColors.primary.violet : DesignColors.neutral.mediumGray
                }
                ios_backgroundColor={DesignColors.neutral.lightGray}
              />
            </View>
          ))}
        </View>

        {/* Botón guardar */}
        <TouchableOpacity
          style={[styles.buttonSave, saving && styles.buttonDisabled]}
          onPress={handleGuardar}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={DesignColors.secondary.white} />
          ) : (
            <Text style={styles.buttonSaveText}>Guardar preferencias</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignColors.secondary.offWhite,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: DesignColors.neutral.mediumGray,
    fontWeight: '500',
  },
  header: {
    backgroundColor: DesignColors.secondary.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: DesignColors.neutral.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DesignColors.neutral.black,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: DesignColors.primary.violet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DesignColors.neutral.black,
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: DesignColors.neutral.mediumGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  notificacionItem: {
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: DesignColors.primary.violet,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  notificacionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DesignColors.secondary.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificacionContent: {
    flex: 1,
  },
  notificacionTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignColors.neutral.black,
    marginBottom: 4,
  },
  notificacionDescripcion: {
    fontSize: 13,
    color: DesignColors.neutral.mediumGray,
    lineHeight: 18,
  },
  buttonSave: {
    backgroundColor: DesignColors.primary.violet,
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    shadowColor: DesignColors.primary.violet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  buttonSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignColors.secondary.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  bottomSpacing: {
    height: 24,
  },
});

