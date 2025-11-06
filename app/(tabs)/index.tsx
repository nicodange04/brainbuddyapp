import { Avatar } from '@/components/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { seleccionarColorPorNombre } from '@/services/avatar';
import { getProximaSesion, getProximosExamenes, ProximaSesion, ProximoExamen } from '@/services/home';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [proximaSesion, setProximaSesion] = useState<ProximaSesion | null>(null);
  const [proximosExamenes, setProximosExamenes] = useState<ProximoExamen[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = async () => {
    if (!user?.usuario?.usuario_id || !user?.alumno?.alumno_id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [sesion, examenes] = await Promise.all([
        getProximaSesion(user.alumno.alumno_id),
        getProximosExamenes(user.alumno.alumno_id),
      ]);

      setProximaSesion(sesion);
      setProximosExamenes(examenes || []);
    } catch (error) {
      console.error('Error al cargar datos de home:', error);
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

  // Obtener nombre del usuario
  const nombreUsuario = user?.usuario?.nombre || 'Usuario';
  const apellidoUsuario = user?.usuario?.apellido || '';
  const nombreCompleto = `${nombreUsuario}${apellidoUsuario ? ` ${apellidoUsuario}` : ''}`;
  
  // Calcular iniciales: si hay apellido, usar primera letra de nombre y apellido
  // Si no hay apellido, usar las primeras dos letras del nombre
  const iniciales = apellidoUsuario 
    ? `${nombreUsuario.charAt(0).toUpperCase()}${apellidoUsuario.charAt(0).toUpperCase()}`
    : nombreUsuario.substring(0, 2).toUpperCase();
  
  const avatarColor = seleccionarColorPorNombre(nombreUsuario + apellidoUsuario);

  // Formatear fecha
  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaObj = new Date(date);
    fechaObj.setHours(0, 0, 0, 0);

    if (fechaObj.getTime() === hoy.getTime()) {
      return 'Hoy';
    }

    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);
    if (fechaObj.getTime() === mañana.getTime()) {
      return 'Mañana';
    }

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  // Calcular progreso de sesión (simulado por ahora)
  const calcularProgreso = () => {
    if (!proximaSesion) return 0;
    // Por ahora retornamos 0, pero esto se puede calcular basado en sesiones completadas
    return 0;
  };

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header con avatar y saludo */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Avatar 
            iniciales={iniciales}
            color={avatarColor}
            size="large"
          />
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>¡Hola, {nombreUsuario}! 👋</Text>
            <Text style={styles.subtitle}>Listo para estudiar hoy</Text>
          </View>
        </View>
      </View>

      {/* Próxima sesión */}
      {proximaSesion && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TU PRÓXIMA SESIÓN</Text>
          <View style={styles.sesionCard}>
            <View style={styles.sesionHeader}>
              <View style={styles.sesionBadge}>
                <Text style={styles.sesionBadgeText}>📚 {proximaSesion.examen_materia}</Text>
              </View>
              <Text style={styles.sesionFecha}>{formatearFecha(proximaSesion.fecha)}</Text>
            </View>
            <Text style={styles.sesionTitulo}>{proximaSesion.nombre}</Text>
            <Text style={styles.sesionTema}>{proximaSesion.tema}</Text>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${calcularProgreso()}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {calcularProgreso()}% completado
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => {
                // TODO: Navegar a la sesión cuando esté implementada
                console.log('Iniciar sesión:', proximaSesion.sesion_id);
              }}
            >
              <Text style={styles.primaryButtonText}>Comenzar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Próximos exámenes */}
      {proximosExamenes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRÓXIMOS EXÁMENES</Text>
          <View style={styles.examenesContainer}>
            {proximosExamenes.map((examen) => (
              <TouchableOpacity
                key={examen.examen_id}
                style={styles.examenCard}
                onPress={() => {
                  router.push('/(tabs)/calendario');
                }}
              >
                <View style={styles.examenCardHeader}>
                  <Text style={styles.examenMateria}>{examen.materia}</Text>
                  <Text style={styles.examenFecha}>{formatearFecha(examen.fecha)}</Text>
                </View>
                <Text style={styles.examenNombre}>{examen.nombre}</Text>
                <View style={styles.examenStats}>
                  <Text style={styles.examenStatsText}>
                    {examen.sesiones_completadas}/{examen.total_sesiones_planificadas} sesiones
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Accesos rápidos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCESOS RÁPIDOS</Text>
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => router.push('/(tabs)/calendario')}
        >
          <Text style={styles.quickActionIcon}>📅</Text>
          <Text style={styles.quickActionText}>Ver calendario</Text>
          <Text style={styles.quickActionArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => router.push('/crear-examen')}
        >
          <Text style={styles.quickActionIcon}>➕</Text>
          <Text style={styles.quickActionText}>Agregar examen</Text>
          <Text style={styles.quickActionArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickAction}
          onPress={() => router.push('/(tabs)/progreso')}
        >
          <Text style={styles.quickActionIcon}>📊</Text>
          <Text style={styles.quickActionText}>Mi progreso</Text>
          <Text style={styles.quickActionArrow}>›</Text>
        </TouchableOpacity>
      </View>
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
    padding: 24, // xl spacing
    marginBottom: 16,
    borderRadius: 24, // card borderRadius
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
    marginHorizontal: 16,
    marginTop: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  greeting: {
    fontSize: 24, // 2xl font size
    fontWeight: '700', // bold
    color: '#1F2937', // neutral.black
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14, // sm font size
    fontWeight: '500', // medium
    color: '#6B7280', // neutral.mediumGray
  },
  section: {
    marginBottom: 20,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12, // xs font size
    fontWeight: '700', // bold
    color: '#6B7280', // neutral.mediumGray
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sesionCard: {
    backgroundColor: '#FFFFFF',
    padding: 24, // xl spacing
    borderRadius: 24, // card borderRadius
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
  },
  sesionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sesionBadge: {
    backgroundColor: '#F3F4F6', // lightGray
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12, // lg borderRadius
  },
  sesionBadgeText: {
    fontSize: 12, // sm font size
    fontWeight: '600', // semibold
    color: '#8B5CF6', // primary.violet
  },
  sesionFecha: {
    fontSize: 12, // sm font size
    fontWeight: '600', // semibold
    color: '#6B7280', // neutral.mediumGray
  },
  sesionTitulo: {
    fontSize: 20, // xl font size
    fontWeight: '700', // bold
    color: '#1F2937', // neutral.black
    marginBottom: 8,
    lineHeight: 28,
  },
  sesionTema: {
    fontSize: 14, // sm font size
    fontWeight: '500', // medium
    color: '#6B7280', // neutral.mediumGray
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB', // lightGray
    borderRadius: 4, // full
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6', // primary.violet
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12, // sm font size
    fontWeight: '500', // medium
    color: '#6B7280', // neutral.mediumGray
  },
  primaryButton: {
    backgroundColor: '#8B5CF6', // primary.violet
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 9999, // full (pill-shaped)
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16, // base font size
    fontWeight: '600', // semibold
    letterSpacing: 0.3,
  },
  examenesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  examenCard: {
    backgroundColor: '#FFFFFF',
    padding: 18, // lg spacing
    borderRadius: 20, // 2xl borderRadius
    flex: 1,
    minWidth: '47%',
    shadowColor: '#7C3AED', // violetDark
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED', // violetDark
  },
  examenCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  examenMateria: {
    fontSize: 11, // xs font size
    fontWeight: '700', // bold
    color: '#7C3AED', // violetDark
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  examenFecha: {
    fontSize: 11, // xs font size
    fontWeight: '600', // semibold
    color: '#6B7280', // neutral.mediumGray
  },
  examenNombre: {
    fontSize: 16, // base font size
    fontWeight: '700', // bold
    color: '#1F2937', // neutral.black
    marginBottom: 8,
    lineHeight: 22,
  },
  examenStats: {
    backgroundColor: '#F3F4F6', // lightGray
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12, // lg borderRadius
    alignSelf: 'flex-start',
  },
  examenStatsText: {
    fontSize: 11, // xs font size
    fontWeight: '600', // semibold
    color: '#6B7280', // neutral.mediumGray
  },
  quickAction: {
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
  quickActionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  quickActionText: {
    flex: 1,
    fontSize: 16, // base font size
    fontWeight: '600', // semibold
    color: '#1F2937', // neutral.black
  },
  quickActionArrow: {
    fontSize: 24,
    color: '#8B5CF6', // primary.violet
    fontWeight: '300',
  },
});
