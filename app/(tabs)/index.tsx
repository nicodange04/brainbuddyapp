import { Avatar } from '@/components/avatar';
import { SelectorHijo } from '@/components/SelectorHijo';
import { useAuth } from '@/contexts/AuthContext';
import { usePadre } from '@/contexts/PadreContext';
import { seleccionarColorPorNombre } from '@/services/avatar';
import { getProximaSesion, getProximasSesiones, getProximosExamenes, getSesionesPendientes, ProximaSesion, ProximoExamen, SesionPendiente } from '@/services/home';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DesignColors } from '@/constants/design';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { hijoActivo, loading: loadingPadre } = usePadre();
  const [proximasSesiones, setProximasSesiones] = useState<(ProximaSesion & { esPendiente?: boolean; diasAtraso?: number })[]>([]);
  const [proximosExamenes, setProximosExamenes] = useState<ProximoExamen[]>([]);
  const [loading, setLoading] = useState(true);

  // Determinar si es padre o alumno
  const esPadre = user?.usuario?.rol === 'padre';
  const alumnoIdParaUsar = esPadre ? hijoActivo?.alumno_id : user?.alumno?.alumno_id;

  const cargarDatos = async () => {
    // Si es padre y no tiene hijo activo, no cargar datos
    if (esPadre && !hijoActivo) {
      setLoading(false);
      return;
    }

    // Si es alumno y no tiene datos, no cargar
    if (!esPadre && (!user?.usuario?.usuario_id || !user?.alumno?.alumno_id)) {
      setLoading(false);
      return;
    }

    if (!alumnoIdParaUsar) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [sesionesFuturas, examenes, pendientes] = await Promise.all([
        getProximasSesiones(alumnoIdParaUsar, 3), // Obtener hasta 3 futuras
        getProximosExamenes(alumnoIdParaUsar),
        getSesionesPendientes(alumnoIdParaUsar, 3), // Obtener hasta 3 pendientes
      ]);

      // Combinar sesiones pendientes y futuras
      const sesionesCombinadas: (ProximaSesion & { esPendiente?: boolean; diasAtraso?: number })[] = [];

      // Primero agregar sesiones pendientes (máximo 3)
      if (pendientes && pendientes.length > 0) {
        pendientes.slice(0, 3).forEach(pendiente => {
          sesionesCombinadas.push({
            sesion_id: pendiente.sesion_id,
            nombre: pendiente.nombre,
            tema: pendiente.tema,
            fecha: pendiente.fecha,
            examen_id: pendiente.examen_id,
            examen_nombre: pendiente.examen_nombre,
            examen_materia: pendiente.examen_materia,
            estado: pendiente.estado,
            esPendiente: true,
            diasAtraso: pendiente.diasAtraso,
          });
        });
      }

      // Luego agregar sesiones futuras (hasta completar al menos 3 en total)
      if (sesionesFuturas && sesionesFuturas.length > 0) {
        sesionesFuturas.forEach(sesion => {
          // Verificar que no esté duplicada
          const yaExiste = sesionesCombinadas.some(s => s.sesion_id === sesion.sesion_id);
          if (!yaExiste) {
            sesionesCombinadas.push({
              ...sesion,
              esPendiente: false,
              diasAtraso: 0,
            });
          }
        });
      }

      // Asegurar que tenemos al menos 3 sesiones si hay disponibles
      setProximasSesiones(sesionesCombinadas.slice(0, Math.max(3, sesionesCombinadas.length)));
      setProximosExamenes(examenes || []);
    } catch (error) {
      console.error('Error al cargar datos de home:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [user, hijoActivo]);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [user, hijoActivo])
  );

  // Obtener nombre del usuario o del hijo
  const nombreParaMostrar = esPadre 
    ? (user?.usuario?.nombre || 'Padre')
    : (user?.usuario?.nombre || 'Usuario');
  const apellidoParaMostrar = esPadre 
    ? (user?.usuario?.apellido || '')
    : (user?.usuario?.apellido || '');
  
  // Calcular iniciales (siempre del usuario actual, no del hijo)
  const iniciales = apellidoParaMostrar
    ? `${nombreParaMostrar.charAt(0).toUpperCase()}${apellidoParaMostrar.charAt(0).toUpperCase()}`
    : nombreParaMostrar.substring(0, 2).toUpperCase();
  
  const avatarColor = seleccionarColorPorNombre(nombreParaMostrar + apellidoParaMostrar);

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
    // Por ahora retornamos 0, pero esto se puede calcular basado en sesiones completadas
    return 0;
  };

  // Si es padre y está cargando hijos, mostrar loading
  if (esPadre && loadingPadre) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  // Si es padre y no tiene hijos vinculados, mostrar mensaje
  if (esPadre && !hijoActivo) {
    return (
      <ScrollView 
        style={[styles.container, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>👨‍👩‍👧‍👦</Text>
          <Text style={styles.emptyStateTitle}>No hay hijos vinculados</Text>
          <Text style={styles.emptyStateText}>
            Para ver el progreso de tu hijo/a, primero debes vincularlo usando su código de vinculación.
          </Text>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => router.push('/vincular-hijo')}
          >
            <Text style={styles.primaryButtonText}>Vincular hijo/a</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

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
            {esPadre ? (
              <>
                <Text style={styles.greeting}>Hola {user?.usuario?.nombre || 'Padre'} 👋</Text>
                <Text style={styles.subtitle}>Vista de seguimiento</Text>
              </>
            ) : (
              <>
                <Text style={styles.greeting}>¡Hola, {nombreParaMostrar}! 👋</Text>
                <Text style={styles.subtitle}>Listo para estudiar hoy</Text>
              </>
            )}
          </View>
        </View>
        {/* Selector de hijo para padres */}
        {esPadre && hijoActivo && (
          <View style={styles.selectorContainer}>
            <SelectorHijo />
          </View>
        )}
      </View>

      {/* Próximas sesiones de estudio */}
      {proximasSesiones.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRÓXIMAS SESIONES DE ESTUDIO</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sesionesScrollContent}
          >
            {proximasSesiones.map((sesion) => (
              <View 
                key={sesion.sesion_id} 
                style={[
                  styles.sesionCard,
                  styles.sesionCardHorizontal,
                  sesion.esPendiente && styles.sesionCardPendiente
                ]}
              >
                <View style={styles.sesionHeader}>
                  <View style={styles.sesionBadge}>
                    <Text style={styles.sesionBadgeText}>📚 {sesion.examen_materia}</Text>
                  </View>
                  <View style={styles.sesionHeaderRight}>
                    {sesion.esPendiente ? (
                      <View style={styles.sesionAtrasadaBadge}>
                        <Text style={styles.sesionAtrasadaBadgeText}>
                          {sesion.diasAtraso === 1 ? '1 día atrasada' : `${sesion.diasAtraso} días atrasada`}
                        </Text>
                      </View>
                    ) : (
                      <Text style={styles.sesionFecha}>{formatearFecha(sesion.fecha)}</Text>
                    )}
                  </View>
                </View>
                <Text style={styles.sesionTitulo}>{sesion.nombre}</Text>
                <Text style={styles.sesionTema}>{sesion.tema}</Text>
                
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${calcularProgreso()}%` }]} />
                  </View>
                  <Text style={styles.progressText}>
                    {calcularProgreso()}% completado
                  </Text>
                </View>

                {esPadre ? (
                  <View style={[styles.primaryButton, styles.primaryButtonDisabled]}>
                    <Text style={[styles.primaryButtonText, styles.primaryButtonTextDisabled]}>
                      Solo visualización
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.primaryButton}
                    onPress={() => {
                      router.push({
                        pathname: '/sesion-estudio',
                        params: { sesionId: sesion.sesion_id }
                      });
                    }}
                  >
                    <Text style={styles.primaryButtonText}>
                      {sesion.esPendiente ? 'Realizar ahora' : 'Comenzar sesión'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Próximos exámenes */}
      {proximosExamenes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRÓXIMOS EXÁMENES</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.examenesScrollContent}
          >
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
          </ScrollView>
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
        
        {!esPadre && (
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => router.push('/crear-examen')}
          >
            <Text style={styles.quickActionIcon}>➕</Text>
            <Text style={styles.quickActionText}>Agregar examen</Text>
            <Text style={styles.quickActionArrow}>›</Text>
          </TouchableOpacity>
        )}
        
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
  sesionCardHorizontal: {
    width: 320,
    marginRight: 16,
  },
  sesionesScrollContent: {
    paddingRight: 16,
  },
  sesionCardPendiente: {
    borderLeftWidth: 4,
    borderLeftColor: DesignColors.primary.violetDark,
    borderWidth: 1,
    borderColor: DesignColors.primary.violetLight,
    shadowColor: DesignColors.primary.violetDark,
    shadowOpacity: 0.15,
  },
  sesionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sesionHeaderRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  sesionBadge: {
    backgroundColor: '#F5F3FF',
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
  examenesScrollContent: {
    paddingRight: 16,
  },
  examenCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20, // 2xl borderRadius
    width: 380,
    marginRight: 16,
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
    marginBottom: 10,
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
    marginBottom: 6,
    lineHeight: 20,
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
  selectorContainer: {
    marginTop: 16,
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 100,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  primaryButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonTextDisabled: {
    color: '#9CA3AF',
  },
  sesionPendienteCard: {
    backgroundColor: DesignColors.secondary.white,
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: DesignColors.primary.violetDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: DesignColors.primary.violetDark,
    borderWidth: 1,
    borderColor: DesignColors.primary.violetLight,
  },
  sesionPendienteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  sesionPendienteBadge: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sesionPendienteBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: DesignColors.primary.violetDark,
  },
  sesionAtrasadaBadge: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sesionAtrasadaBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: DesignColors.primary.violetDark,
  },
});

