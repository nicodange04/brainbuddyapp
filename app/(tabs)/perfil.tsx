import { Avatar } from '@/components/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { generarIniciales, seleccionarColorPorNombre } from '@/services/avatar';
import { EstadisticasPerfil, getEstadisticasUsuario, getTrofeosUsuario, Trofeo } from '@/services/perfil';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PerfilScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [estadisticas, setEstadisticas] = useState<EstadisticasPerfil | null>(null);
  const [trofeos, setTrofeos] = useState<Trofeo[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    if (!user?.usuario?.usuario_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [stats, trofeosData] = await Promise.all([
        user.alumno ? getEstadisticasUsuario(user.alumno.alumno_id) : Promise.resolve(null),
        user.alumno ? getTrofeosUsuario(user.alumno.alumno_id) : Promise.resolve([]),
      ]);

      setEstadisticas(stats);
      setTrofeos(trofeosData || []);
    } catch (error) {
      console.error('Error al cargar datos del perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [user])
  );

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

  const copiarCodigo = async () => {
    const codigo = user?.alumno?.codigo_vinculacion || '';
    if (!codigo) {
      Alert.alert('Error', 'No se pudo obtener el código de vinculación');
      return;
    }
    await Clipboard.setStringAsync(codigo);
    Alert.alert('Código copiado', 'El código se ha copiado al portapapeles');
  };

  const compartirCodigo = async () => {
    // TODO: Implementar compartir
    Alert.alert('Compartir', 'Funcionalidad de compartir próximamente');
  };

  // Obtener datos del usuario
  const nombreUsuario = user?.usuario?.nombre || 'Usuario';
  const apellidoUsuario = user?.usuario?.apellido || '';
  const emailUsuario = user?.usuario?.correo || '';
  const rolUsuario = user?.usuario?.rol || 'alumno';
  const nombreCompleto = `${nombreUsuario}${apellidoUsuario ? ` ${apellidoUsuario}` : ''}`;
  const iniciales = generarIniciales(nombreCompleto);
  const avatarColor = seleccionarColorPorNombre(nombreUsuario + apellidoUsuario);

  // Formatear fecha de nacimiento (si existe)
  const formatearFechaNacimiento = (fecha?: string) => {
    if (!fecha) return 'No especificada';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Contar trofeos obtenidos
  const trofeosObtenidos = trofeos.filter(t => t.obtenido).length;
  const totalTrofeos = trofeos.length;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header con Avatar */}
      <View style={styles.header}>
        <Avatar 
          iniciales={iniciales}
          color={avatarColor}
          size="large"
        />
        <Text style={styles.nombreUsuario}>{nombreCompleto}</Text>
        <Text style={styles.emailUsuario}>{emailUsuario}</Text>
        <View style={styles.badgeRol}>
          <Text style={styles.badgeRolText}>
            {rolUsuario === 'alumno' ? '👨‍🎓 Alumno' : '👨‍👩‍👧‍👦 Padre'}
          </Text>
        </View>
        {user?.alumno?.fecha_nacimiento && (
          <Text style={styles.fechaNacimiento}>
            📅 {formatearFechaNacimiento(user.alumno.fecha_nacimiento)}
          </Text>
        )}
      </View>

      {/* Estadísticas Principales */}
      {estadisticas && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⭐ ESTADÍSTICAS</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statValue}>{estadisticas.puntos_totales.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Puntos totales</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statValue}>{estadisticas.racha_actual}</Text>
              <Text style={styles.statLabel}>Racha actual</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statValue}>{estadisticas.racha_maxima}</Text>
              <Text style={styles.statLabel}>Racha máxima</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>✅</Text>
              <Text style={styles.statValue}>{estadisticas.sesiones_completadas}</Text>
              <Text style={styles.statLabel}>Sesiones</Text>
            </View>
            <View style={[styles.statCard, styles.statCardFull]}>
              <Text style={styles.statIcon}>⏱️</Text>
              <Text style={styles.statValue}>{estadisticas.horas_estudiadas}h</Text>
              <Text style={styles.statLabel}>Horas de estudio</Text>
            </View>
          </View>
        </View>
      )}

      {/* Trofeos */}
      {trofeos.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏆 TROFEOS</Text>
            <Text style={styles.trofeosContador}>
              {trofeosObtenidos} de {totalTrofeos}
            </Text>
          </View>
          <View style={styles.trofeosGrid}>
            {trofeos.map((trofeo) => (
              <View 
                key={trofeo.trofeo_id} 
                style={[
                  styles.trofeoCard,
                  !trofeo.obtenido && styles.trofeoCardBloqueado
                ]}
              >
                <View style={[
                  styles.trofeoIconContainer,
                  trofeo.obtenido && styles.trofeoIconContainerObtenido
                ]}>
                  <Ionicons
                    name={trofeo.icono as any}
                    size={32}
                    color={trofeo.obtenido ? '#FFFFFF' : '#9CA3AF'}
                  />
                </View>
                <Text style={[
                  styles.trofeoNombre,
                  !trofeo.obtenido && styles.trofeoNombreBloqueado
                ]}>
                  {trofeo.nombre}
                </Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.verTodosButton}>
            <Text style={styles.verTodosButtonText}>Ver todos los trofeos</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Código de Vinculación (solo para alumnos) */}
      {user?.alumno && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔗 CÓDIGO DE VINCULACIÓN</Text>
          <View style={styles.codigoCard}>
            <Text style={styles.codigoTexto}>
              {user?.alumno?.codigo_vinculacion || 'N/A'}
            </Text>
            <Text style={styles.codigoDescripcion}>
              Comparte este código con tus padres para que puedan ver tu progreso
            </Text>
            <View style={styles.codigoButtons}>
              <TouchableOpacity 
                style={[styles.codigoButton, styles.codigoButtonPrimary]}
                onPress={copiarCodigo}
              >
                <Text style={styles.codigoButtonText}>📋 Copiar código</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.codigoButton, styles.codigoButtonSecondary]}
                onPress={compartirCodigo}
              >
                <Text style={styles.codigoButtonText}>📤 Compartir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Configuración */}
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

      {/* Botón de Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>🚪 Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // offWhite del design system
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 32, // 2xl spacing
    marginBottom: 16,
    borderRadius: 24, // card borderRadius
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
    marginHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  nombreUsuario: {
    fontSize: 24, // 2xl font size
    fontWeight: '700', // bold
    color: '#1F2937', // neutral.black
    marginTop: 16,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  emailUsuario: {
    fontSize: 14, // sm font size
    fontWeight: '500', // medium
    color: '#6B7280', // neutral.mediumGray
    marginBottom: 12,
  },
  badgeRol: {
    backgroundColor: '#F3F4F6', // lightGray
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12, // lg borderRadius
    marginBottom: 8,
  },
  badgeRolText: {
    fontSize: 12, // sm font size
    fontWeight: '600', // semibold
    color: '#8B5CF6', // primary.violet
  },
  fechaNacimiento: {
    fontSize: 13, // sm font size
    fontWeight: '500', // medium
    color: '#6B7280', // neutral.mediumGray
  },
  section: {
    marginBottom: 20,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12, // xs font size
    fontWeight: '700', // bold
    color: '#6B7280', // neutral.mediumGray
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 20, // lg spacing
    borderRadius: 20, // 2xl borderRadius
    flex: 1,
    minWidth: '47%',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  statCardFull: {
    minWidth: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28, // 3xl font size
    fontWeight: '700', // bold
    color: '#1F2937', // neutral.black
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12, // sm font size
    fontWeight: '500', // medium
    color: '#6B7280', // neutral.mediumGray
    textAlign: 'center',
  },
  trofeosContador: {
    fontSize: 12, // sm font size
    fontWeight: '600', // semibold
    color: '#8B5CF6', // primary.violet
  },
  trofeosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  trofeoCard: {
    backgroundColor: '#FFFFFF',
    padding: 16, // md spacing
    borderRadius: 16, // xl borderRadius
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 2,
    borderColor: '#8B5CF6', // primary.violet
  },
  trofeoCardBloqueado: {
    opacity: 0.4,
    borderColor: '#E5E7EB', // lightGray
  },
  trofeoIcono: {
    fontSize: 40,
    marginBottom: 8,
  },
  trofeoNombre: {
    fontSize: 11, // xs font size
    fontWeight: '600', // semibold
    color: '#1F2937', // neutral.black
    textAlign: 'center',
  },
  verTodosButton: {
    backgroundColor: '#F3F4F6', // lightGray
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12, // lg borderRadius
    alignItems: 'center',
  },
  verTodosButtonText: {
    fontSize: 14, // sm font size
    fontWeight: '600', // semibold
    color: '#8B5CF6', // primary.violet
  },
  codigoCard: {
    backgroundColor: '#FFFFFF',
    padding: 24, // xl spacing
    borderRadius: 24, // card borderRadius
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
    alignItems: 'center',
  },
  codigoTexto: {
    fontSize: 32, // 3xl font size
    fontWeight: '700', // bold
    color: '#8B5CF6', // primary.violet
    letterSpacing: 4,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  codigoDescripcion: {
    fontSize: 14, // sm font size
    fontWeight: '400', // normal
    color: '#6B7280', // neutral.mediumGray
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  codigoButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  codigoButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12, // lg borderRadius
    alignItems: 'center',
  },
  codigoButtonPrimary: {
    backgroundColor: '#8B5CF6', // primary.violet
  },
  codigoButtonSecondary: {
    backgroundColor: '#F3F4F6', // lightGray
  },
  codigoButtonText: {
    fontSize: 14, // sm font size
    fontWeight: '600', // semibold
    color: '#FFFFFF',
  },
  configItem: {
    backgroundColor: '#FFFFFF',
    padding: 20, // lg spacing
    borderRadius: 20, // 2xl borderRadius
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  configIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  configText: {
    flex: 1,
    fontSize: 16, // base font size
    fontWeight: '600', // semibold
    color: '#1F2937', // neutral.black
  },
  configArrow: {
    fontSize: 24,
    color: '#8B5CF6', // primary.violet
    fontWeight: '300',
  },
  logoutButton: {
    backgroundColor: '#EF4444', // red
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 9999, // full (pill-shaped)
    marginHorizontal: 16,
    marginTop: 8,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16, // base font size
    fontWeight: '600', // semibold
    letterSpacing: 0.3,
  },
  bottomSpacing: {
    height: 24,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  trofeoIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  trofeoIconContainerObtenido: {
    backgroundColor: '#8B5CF6',
  },
  trofeoNombreBloqueado: {
    color: '#9CA3AF',
  },
});
