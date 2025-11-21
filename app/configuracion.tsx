import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';

export default function ConfiguracionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar la sesión');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚙️ Configuración</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Información del Usuario */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 INFORMACIÓN</Text>
          <View style={styles.userInfoCard}>
            <Text style={styles.userInfoName}>
              {user?.usuario?.nombre} {user?.usuario?.apellido}
            </Text>
            <Text style={styles.userInfoEmail}>{user?.usuario?.correo}</Text>
            <View style={styles.userInfoBadge}>
              <Text style={styles.userInfoBadgeText}>
                {user?.usuario?.rol === 'alumno' ? '👨‍🎓 Alumno' : '👨‍👩‍👧‍👦 Padre'}
              </Text>
            </View>
          </View>
        </View>

        {/* Opciones de Configuración */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ CONFIGURACIÓN</Text>
          <TouchableOpacity 
            style={styles.configItem}
            onPress={() => router.push('/editar-perfil')}
          >
            <Text style={styles.configIcon}>✏️</Text>
            <Text style={styles.configText}>Editar perfil</Text>
            <Text style={styles.configArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.configItem}
            onPress={() => router.push('/cambiar-contrasena')}
          >
            <Text style={styles.configIcon}>🔒</Text>
            <Text style={styles.configText}>Cambiar contraseña</Text>
            <Text style={styles.configArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.configItem}
            onPress={() => router.push('/notificaciones')}
          >
            <Text style={styles.configIcon}>🔔</Text>
            <Text style={styles.configText}>Notificaciones</Text>
            <Text style={styles.configArrow}>›</Text>
          </TouchableOpacity>
          {user?.padre && (
            <TouchableOpacity 
              style={styles.configItem}
              onPress={() => router.push('/vincular-hijo')}
            >
              <Text style={styles.configIcon}>👨‍👩‍👧‍👦</Text>
              <Text style={styles.configText}>Vincular hijo/a</Text>
              <Text style={styles.configArrow}>›</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Cerrar Sesión */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>🚪 Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Espacio final para scroll */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 80,
    alignItems: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  userInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  userInfoName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  userInfoEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  userInfoBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  userInfoBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  configItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  configIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  configText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  configArrow: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FCA5A5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  bottomSpacer: {
    height: 20,
  },
});

