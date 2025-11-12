import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BarChart,
  ExamProgressCard,
  MetricCard,
  TrophyGrid,
} from '@/components/progreso';
import { DesignColors, DesignSpacing } from '@/constants/design';

// ============================================
// DATOS MOCK - Reemplazar con datos reales después
// ============================================

const mockMetrics = {
  sesionesCompletadas: { value: '15/20', label: 'Sesiones Completadas' },
  promedioPuntaje: { value: '82', label: 'Promedio Puntaje' },
  rachaActual: { value: '14', label: 'Racha Actual' },
  puntosTotales: { value: '1,250', label: 'Puntos Totales' },
};

const mockBarChartData = [
  { label: 'Lun', value: 2.5, color: DesignColors.accent.orange },
  { label: 'Mar', value: 3.0, color: DesignColors.accent.orange },
  { label: 'Mié', value: 1.5, color: DesignColors.accent.coral },
  { label: 'Jue', value: 4.0, color: DesignColors.accent.orange },
  { label: 'Vie', value: 2.0, color: DesignColors.accent.coral },
  { label: 'Sáb', value: 3.5, color: DesignColors.accent.orange },
  { label: 'Dom', value: 1.0, color: DesignColors.accent.coral },
];

const mockTrophies = [
  {
    id: '1',
    name: 'Primera Sesión',
    icon: 'trophy' as const,
    description: 'Completa tu primera sesión',
    unlocked: true,
    color: DesignColors.supporting.yellow,
  },
  {
    id: '2',
    name: 'Racha 7 días',
    icon: 'flame-outline' as const,
    description: 'Estudia 7 días consecutivos',
    unlocked: true,
    color: DesignColors.accent.orange,
  },
  {
    id: '3',
    name: 'Quiz Perfecto',
    icon: 'star' as const,
    description: 'Obtén 100/100 en un quiz',
    unlocked: true,
    color: DesignColors.supporting.yellow,
  },
  {
    id: '4',
    name: '10 Sesiones',
    icon: 'checkmark-done-circle' as const,
    description: 'Completa 10 sesiones en 1 semana',
    unlocked: false,
    color: DesignColors.primary.violet,
  },
  {
    id: '5',
    name: '5 Materias',
    icon: 'library' as const,
    description: 'Estudia 5 materias diferentes',
    unlocked: true,
    color: DesignColors.supporting.blue,
  },
  {
    id: '6',
    name: '10 Horas',
    icon: 'time' as const,
    description: 'Acumula 10 horas de estudio',
    unlocked: false,
    color: DesignColors.supporting.green,
  },
];

const mockExams = [
  {
    id: '1',
    name: 'Examen Final Historia',
    subject: 'Historia',
    sessionsCompleted: 8,
    sessionsTotal: 10,
    averageScore: 82,
    icon: 'book' as const,
    color: DesignColors.supporting.blue,
  },
  {
    id: '2',
    name: 'Examen Parcial Matemáticas',
    subject: 'Matemáticas',
    sessionsCompleted: 5,
    sessionsTotal: 8,
    averageScore: 88,
    icon: 'calculator' as const,
    color: DesignColors.primary.violet,
  },
  {
    id: '3',
    name: 'Examen Final Física',
    subject: 'Física',
    sessionsCompleted: 12,
    sessionsTotal: 15,
    averageScore: 85,
    icon: 'flask' as const,
    color: DesignColors.accent.orange,
  },
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function ProgresoScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📊 Progreso</Text>
          <Text style={styles.headerSubtitle}>Estadísticas y Logros</Text>
        </View>

        {/* Métricas Principales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Dashboard Principal</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCardWrapper}>
              <MetricCard
                label={mockMetrics.sesionesCompletadas.label}
                value={mockMetrics.sesionesCompletadas.value}
                icon="checkmark-circle"
                iconColor={DesignColors.supporting.green}
                borderColor={DesignColors.supporting.green}
              />
            </View>
            <View style={styles.metricCardWrapper}>
              <MetricCard
                label={mockMetrics.promedioPuntaje.label}
                value={mockMetrics.promedioPuntaje.value}
                icon="star"
                iconColor={DesignColors.supporting.yellow}
                borderColor={DesignColors.supporting.yellow}
              />
            </View>
            <View style={styles.metricCardWrapper}>
              <MetricCard
                label={mockMetrics.rachaActual.label}
                value={`🔥 ${mockMetrics.rachaActual.value}`}
                icon="flame-outline"
                iconColor={DesignColors.accent.orange}
                borderColor={DesignColors.accent.orange}
              />
            </View>
            <View style={styles.metricCardWrapper}>
              <MetricCard
                label={mockMetrics.puntosTotales.label}
                value={mockMetrics.puntosTotales.value}
                icon="trophy"
                iconColor={DesignColors.primary.violet}
                borderColor={DesignColors.primary.violet}
              />
            </View>
          </View>
        </View>

        {/* Gráfico de Barras */}
        <View style={styles.section}>
          <BarChart
            data={mockBarChartData}
            title="Horas de Estudio por Semana"
            maxValue={5}
          />
        </View>

        {/* Trofeos */}
        <View style={styles.section}>
          <TrophyGrid trophies={mockTrophies} />
        </View>

        {/* Vista por Examen */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Vista por Examen</Text>
          {mockExams.map((exam) => (
            <ExamProgressCard key={exam.id} exam={exam} />
          ))}
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
});
