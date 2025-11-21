import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getSesionesExamen, SesionExamen } from '@/services/progreso';
import { supabase } from '@/services/supabase';
import { DesignColors, DesignSpacing } from '@/constants/design';

export default function DetalleExamenScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { examenId, examenNombre, examenMateria } = useLocalSearchParams<{
    examenId: string;
    examenNombre: string;
    examenMateria: string;
  }>();

  const [sesiones, setSesiones] = useState<SesionExamen[]>([]);
  const [loading, setLoading] = useState(true);
  const [examenNombreState, setExamenNombreState] = useState(examenNombre || '');

  useEffect(() => {
    cargarDatos();
  }, [examenId]);

  const cargarDatos = async () => {
    if (!examenId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Si no tenemos el nombre del examen, obtenerlo de la BD
      if (!examenNombreState) {
        const { data: examen, error } = await supabase
          .from('examen')
          .select('nombre, materia')
          .eq('examen_id', examenId)
          .single();

        if (!error && examen) {
          setExamenNombreState(examen.nombre);
        }
      }

      const sesionesData = await getSesionesExamen(examenId);
      setSesiones(sesionesData);
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatearTiempo = (minutos: number | null) => {
    if (!minutos) return 'N/A';
    if (minutos < 60) return `${minutos} min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={DesignColors.neutral.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sesiones de Estudio</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DesignColors.primary.violet} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={DesignColors.neutral.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sesiones de Estudio</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Información del examen */}
        <View style={styles.examenInfo}>
          <Text style={styles.examenNombre}>{examenNombreState}</Text>
          {examenMateria && (
            <Text style={styles.examenMateria}>{examenMateria}</Text>
          )}
        </View>

        {/* Lista de sesiones */}
        {sesiones.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color={DesignColors.neutral.mediumGray} />
            <Text style={styles.emptyStateText}>No hay sesiones aún</Text>
            <Text style={styles.emptyStateSubtext}>
              Las sesiones de estudio aparecerán aquí cuando las completes
            </Text>
          </View>
        ) : (
          <View style={styles.sesionesContainer}>
            {sesiones.map((sesion) => (
              <View key={sesion.sesion_id} style={styles.sesionCard}>
                <View style={styles.sesionHeader}>
                  <View style={styles.sesionHeaderLeft}>
                    <Text style={styles.sesionNombre}>{sesion.nombre}</Text>
                    <Text style={styles.sesionTema}>{sesion.tema}</Text>
                  </View>
                  <View
                    style={[
                      styles.estadoBadge,
                      sesion.estado === 'Completada'
                        ? styles.estadoBadgeCompletada
                        : styles.estadoBadgePendiente,
                    ]}
                  >
                    <Text
                      style={[
                        styles.estadoBadgeText,
                        sesion.estado === 'Completada'
                          ? styles.estadoBadgeTextCompletada
                          : styles.estadoBadgeTextPendiente,
                      ]}
                    >
                      {sesion.estado === 'Completada' ? '✓ Completada' : 'Pendiente'}
                    </Text>
                  </View>
                </View>

                <View style={styles.sesionInfo}>
                  <View style={styles.sesionInfoRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={DesignColors.neutral.mediumGray}
                    />
                    <Text style={styles.sesionInfoText}>
                      {formatearFecha(sesion.fecha || sesion.updated_at)}
                    </Text>
                  </View>

                  {sesion.estado === 'Completada' && (
                    <>
                      {sesion.puntaje_obtenido !== null && (
                        <View style={styles.sesionInfoRow}>
                          <Ionicons
                            name="star"
                            size={16}
                            color={DesignColors.supporting.yellow}
                          />
                          <Text style={styles.sesionInfoText}>
                            Puntaje: {sesion.puntaje_obtenido} puntos
                          </Text>
                        </View>
                      )}

                      {sesion.tiempo_estudio !== null && (
                        <View style={styles.sesionInfoRow}>
                          <Ionicons
                            name="time-outline"
                            size={16}
                            color={DesignColors.neutral.mediumGray}
                          />
                          <Text style={styles.sesionInfoText}>
                            Tiempo: {formatearTiempo(sesion.tiempo_estudio)}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignColors.secondary.offWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: DesignSpacing.lg,
    paddingVertical: DesignSpacing.md,
    backgroundColor: DesignColors.secondary.white,
    borderBottomWidth: 1,
    borderBottomColor: DesignColors.neutral.lightGray,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DesignColors.neutral.black,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: DesignSpacing.lg,
  },
  examenInfo: {
    marginBottom: DesignSpacing.xl,
    paddingBottom: DesignSpacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: DesignColors.neutral.lightGray,
  },
  examenNombre: {
    fontSize: 24,
    fontWeight: '800',
    color: DesignColors.neutral.black,
    marginBottom: DesignSpacing.xs,
  },
  examenMateria: {
    fontSize: 16,
    color: DesignColors.neutral.mediumGray,
  },
  sesionesContainer: {
    gap: DesignSpacing.md,
  },
  sesionCard: {
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 16,
    padding: DesignSpacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sesionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignSpacing.md,
  },
  sesionHeaderLeft: {
    flex: 1,
    marginRight: DesignSpacing.md,
  },
  sesionNombre: {
    fontSize: 18,
    fontWeight: '700',
    color: DesignColors.neutral.black,
    marginBottom: DesignSpacing.xs / 2,
  },
  sesionTema: {
    fontSize: 14,
    color: DesignColors.neutral.mediumGray,
  },
  estadoBadge: {
    paddingHorizontal: DesignSpacing.sm,
    paddingVertical: DesignSpacing.xs,
    borderRadius: 12,
  },
  estadoBadgeCompletada: {
    backgroundColor: '#D1FAE5',
  },
  estadoBadgePendiente: {
    backgroundColor: '#FEF3C7',
  },
  estadoBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  estadoBadgeTextCompletada: {
    color: '#065F46',
  },
  estadoBadgeTextPendiente: {
    color: '#92400E',
  },
  sesionInfo: {
    gap: DesignSpacing.sm,
  },
  sesionInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSpacing.sm,
  },
  sesionInfoText: {
    fontSize: 14,
    color: DesignColors.neutral.mediumGray,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignSpacing['3xl'],
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: DesignColors.neutral.black,
    marginTop: DesignSpacing.lg,
    marginBottom: DesignSpacing.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: DesignColors.neutral.mediumGray,
    textAlign: 'center',
    paddingHorizontal: DesignSpacing.xl,
  },
});

