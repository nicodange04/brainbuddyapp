import CalendarioComponent from '@/components/CalendarioComponent';
import { SelectorHijo } from '@/components/SelectorHijo';
import { useAuth } from '@/contexts/AuthContext';
import { usePadre } from '@/contexts/PadreContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CalendarioScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { hijoActivo } = usePadre();
  const [refreshKey] = useState(0); // Clave para forzar refresh del calendario

  const esPadre = user?.usuario?.rol === 'padre';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con acciones */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            📅 {esPadre ? 'Calendario del Hijo/a' : 'Calendario de Estudio'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {esPadre 
              ? 'Visualiza las sesiones de estudio y exámenes de tu hijo/a'
              : 'Visualiza tus sesiones de estudio y exámenes'
            }
          </Text>
          {/* Selector de hijo para padres */}
          {esPadre && hijoActivo && (
            <View style={styles.selectorContainer}>
              <SelectorHijo />
            </View>
          )}
        </View>

        {/* Calendario */}
        <CalendarioComponent 
          refreshKey={refreshKey}
          showOnlyCalendar={true}
          onDiaSeleccionado={(dia) => {
            // console.log('Día seleccionado:', dia); // Comentado para reducir logs
          }}
        />

        {/* Botones de acción (solo para alumnos) */}
        {!esPadre && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/disponibilidad')}
            >
              <Text style={styles.actionButtonText}>
                ⏰ Configurar Disponibilidad
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/crear-examen')}
            >
              <Text style={styles.actionButtonText}>
                📝 Agregar Examen
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Actividades */}
        <CalendarioComponent 
          refreshKey={refreshKey}
          showOnlyActivities={true}
          onDiaSeleccionado={(dia) => {
            // console.log('Día seleccionado:', dia); // Comentado para reducir logs
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // offWhite del design system
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24, // 1.5rem (xl spacing)
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24, // xl spacing
    marginBottom: 12, // md spacing
    borderRadius: 24, // card borderRadius (1.5rem)
    shadowColor: '#8B5CF6', // Soft shadow con color violet
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, // soft shadow del design system
    shadowRadius: 24,
    elevation: 4,
    marginHorizontal: 16, // md spacing
    marginTop: 12,
  },
  headerTitle: {
    fontSize: 22, // 2xl font size
    fontWeight: '700', // bold
    color: '#1F2937', // neutral.black
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14, // sm font size
    fontWeight: '500', // medium
    color: '#6B7280', // neutral.mediumGray
    lineHeight: 20,
  },
  actionsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20, // lg spacing
    marginBottom: 12,
    borderRadius: 24, // card borderRadius
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
    marginHorizontal: 16,
    gap: 12, // md spacing entre botones
  },
  actionButton: {
    backgroundColor: '#8B5CF6', // primary.violet
    paddingVertical: 14, // 0.875rem
    paddingHorizontal: 24, // 1.5rem
    borderRadius: 9999, // full (pill-shaped button)
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15, // base font size
    fontWeight: '600', // semibold
    letterSpacing: 0.3,
  },
  selectorContainer: {
    marginTop: 16,
  },
});
