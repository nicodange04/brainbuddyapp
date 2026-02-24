import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import {
  BarChart,
  ExamProgressCard,
  MetricCard,
  TrophyGrid,
} from '@/components/progreso';
import { SelectorHijo } from '@/components/SelectorHijo';
import { DesignColors, DesignSpacing, DesignShadows } from '@/constants/design';
import { useAuth } from '@/contexts/AuthContext';
import { usePadre } from '@/contexts/PadreContext';
import {
  getMetricasProgreso,
  getHorasPorDiaSemana,
  getProgresoExamenes,
  MetricasProgreso,
  HorasPorDia,
  ProgresoExamen,
} from '@/services/progreso';
import { getTrofeosUsuario, Trofeo } from '@/services/perfil';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function ProgresoScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { hijoActivo } = usePadre();
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState<MetricasProgreso | null>(null);
  const [horasPorDia, setHorasPorDia] = useState<HorasPorDia[]>([]);
  const [examenes, setExamenes] = useState<ProgresoExamen[]>([]);
  const [trofeos, setTrofeos] = useState<Trofeo[]>([]);

  // Determinar si es padre o alumno
  const esPadre = user?.usuario?.rol === 'padre';
  const alumnoIdParaUsar = esPadre ? hijoActivo?.alumno_id : user?.alumno?.alumno_id;
  const usuarioIdParaUsar = esPadre ? hijoActivo?.usuario_id : user?.usuario?.usuario_id;

  const cargarDatos = useCallback(async () => {
    // Si es padre y no tiene hijo activo, no cargar
    if (esPadre && !hijoActivo) {
      setLoading(false);
      return;
    }

    // Si es alumno y no tiene datos, no cargar
    if (!esPadre && !user?.alumno?.alumno_id) {
      setLoading(false);
      return;
    }

    if (!alumnoIdParaUsar || !usuarioIdParaUsar) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [metricasData, horasData, examenesData, trofeosData] = await Promise.all([
        getMetricasProgreso(alumnoIdParaUsar),
        getHorasPorDiaSemana(alumnoIdParaUsar),
        getProgresoExamenes(alumnoIdParaUsar),
        getTrofeosUsuario(usuarioIdParaUsar),
      ]);

      setMetricas(metricasData);
      setHorasPorDia(horasData);
      setExamenes(examenesData);
      setTrofeos(trofeosData);
    } catch (error) {
      console.error('Error al cargar datos de progreso:', error);
    } finally {
      setLoading(false);
    }
  }, [user, hijoActivo, esPadre, alumnoIdParaUsar, usuarioIdParaUsar]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [cargarDatos])
  );

  // Formatear número con separador de miles
  const formatearNumero = (num: number): string => {
    return num.toLocaleString('es-AR');
  };

  // Calcular valor máximo para el gráfico (redondear hacia arriba)
  const maxValueGrafico = horasPorDia.length > 0
    ? Math.max(...horasPorDia.map(h => h.value), 1)
    : 5;

  // Convertir trofeos al formato esperado por TrophyGrid
  const trofeosFormateados = trofeos.map(trofeo => ({
    id: trofeo.trofeo_id,
    name: trofeo.nombre,
    icon: trofeo.icono as any,
    description: trofeo.descripcion,
    unlocked: trofeo.obtenido,
    color: DesignColors.supporting.yellow, // Por ahora usar color por defecto
  }));

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={DesignColors.primary.violet} />
        <Text style={styles.loadingText}>Cargando progreso...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            📊 {esPadre ? 'Progreso del Hijo/a' : 'Progreso'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {esPadre ? 'Estadísticas y logros de tu hijo/a' : 'Estadísticas y Logros'}
          </Text>
          {/* Selector de hijo para padres */}
          {esPadre && hijoActivo && (
            <View style={styles.selectorContainer}>
              <SelectorHijo />
            </View>
          )}
        </View>

        {/* Métricas Principales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Dashboard Principal</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCardWrapper}>
              <MetricCard
                label="Sesiones Completadas"
                value={metricas ? `${metricas.sesionesCompletadas}/${metricas.sesionesTotales}` : '0/0'}
                icon="checkmark-circle"
                iconColor={DesignColors.supporting.green}
                borderColor={DesignColors.supporting.green}
              />
            </View>
            <View style={styles.metricCardWrapper}>
              <MetricCard
                label="Promedio Puntaje"
                value={metricas ? metricas.promedioPuntaje.toString() : '0'}
                icon="star"
                iconColor={DesignColors.supporting.yellow}
                borderColor={DesignColors.supporting.yellow}
              />
            </View>
            <View style={styles.metricCardWrapper}>
              <MetricCard
                label="Racha Actual"
                value={metricas ? `🔥 ${metricas.rachaActual}` : '🔥 0'}
                icon="flame-outline"
                iconColor={DesignColors.accent.orange}
                borderColor={DesignColors.accent.orange}
              />
            </View>
            <View style={styles.metricCardWrapper}>
              <MetricCard
                label="Puntos Totales"
                value={metricas ? formatearNumero(metricas.puntosTotales) : '0'}
                icon="trophy"
                iconColor={DesignColors.primary.violet}
                borderColor={DesignColors.primary.violet}
              />
            </View>
          </View>
        </View>

        {/* Vista por Examen */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Vista por Examen</Text>
          {examenes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No hay exámenes aún</Text>
              <Text style={styles.emptyStateSubtext}>
                Crea un examen para comenzar a ver tu progreso
              </Text>
            </View>
          ) : (
            examenes.map((exam) => (
              <ExamProgressCard
                key={exam.id}
                exam={{
                  id: exam.id,
                  name: exam.name,
                  subject: exam.subject,
                  sessionsCompleted: exam.sessionsCompleted,
                  sessionsTotal: exam.sessionsTotal,
                  averageScore: exam.averageScore,
                  icon: exam.icon as any,
                  color: exam.color,
                }}
              />
            ))
          )}
        </View>

        {/* Gráfico de Barras */}
        <View style={styles.section}>
          <BarChart
            data={horasPorDia}
            title="Horas de Estudio por Semana"
            maxValue={Math.ceil(maxValueGrafico)}
          />
        </View>

        {/* Trofeos */}
        <View style={styles.section}>
          <TrophyGrid trophies={trofeosFormateados} />
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
    backgroundColor: DesignColors.secondary.offWhite,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: DesignSpacing.md,
    paddingBottom: DesignSpacing['2xl'],
  },
  header: {
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 24,
    padding: DesignSpacing.lg,
    marginBottom: DesignSpacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: DesignColors.neutral.black,
    marginBottom: DesignSpacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: DesignColors.neutral.mediumGray,
  },
  selectorContainer: {
    marginTop: 16,
  },
  section: {
    marginBottom: DesignSpacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DesignColors.neutral.black,
    marginBottom: DesignSpacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'space-between',
  },
  metricCardWrapper: {
    width: '48%',
    marginBottom: DesignSpacing.md,
  },
  bottomSpacer: {
    height: DesignSpacing.xl,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: DesignSpacing.md,
    fontSize: 16,
    color: DesignColors.neutral.mediumGray,
    fontWeight: '500',
  },
  emptyState: {
    padding: DesignSpacing.xl,
    alignItems: 'center',
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 24,
    ...DesignShadows.base,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: DesignColors.neutral.black,
    marginBottom: DesignSpacing.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: DesignColors.neutral.mediumGray,
    textAlign: 'center',
  },
});
