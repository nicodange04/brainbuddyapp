import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProgresoScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">📊 PROGRESO - Estadísticas y Logros</ThemedText>
        <ThemedText type="defaultSemiBold">
          Esta será la pantalla de progreso y gamificación
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.content}>
        <ThemedText type="subtitle">📋 ELEMENTOS QUE IRÁN AQUÍ:</ThemedText>
        
        <ThemedText type="subtitle">📈 DASHBOARD PRINCIPAL</ThemedText>
        <ThemedText>• Gráfico de barras: Horas de estudio por semana</ThemedText>
        <ThemedText>• Métricas principales:</ThemedText>
        <ThemedText>  - Sesiones completadas: X/Y</ThemedText>
        <ThemedText>  - Promedio puntaje: 82/100</ThemedText>
        <ThemedText>  - Racha actual: 🔥 14 días</ThemedText>
        <ThemedText>  - Puntos totales: 1,250 pts</ThemedText>
        
        <ThemedText type="subtitle">🏆 SECCIÓN TROFEOS</ThemedText>
        <ThemedText>• Grid de trofeos (obtenidos y bloqueados)</ThemedText>
        <ThemedText>• Trofeos disponibles:</ThemedText>
        <ThemedText>  - 🎯 Primera Sesión</ThemedText>
        <ThemedText>  - 🔥 Racha 7 días</ThemedText>
        <ThemedText>  - ⭐ Quiz Perfecto (100/100)</ThemedText>
        <ThemedText>  - 🏃 10 sesiones en 1 semana</ThemedText>
        <ThemedText>  - 📚 5 materias diferentes</ThemedText>
        <ThemedText>  - 💪 10 horas acumuladas</ThemedText>
        
        <ThemedText type="subtitle">📋 TIMELINE DE ACTIVIDADES</ThemedText>
        <ThemedText>• Lista de últimas 10 actividades</ThemedText>
        <ThemedText>• Fecha, acción, puntos ganados</ThemedText>
        <ThemedText>• Ejemplo: "Hoy - Completaste sesión de Historia +70 pts"</ThemedText>
        
        <ThemedText type="subtitle">📊 VISTA POR EXAMEN</ThemedText>
        <ThemedText>• Cards con progreso de cada examen</ThemedText>
        <ThemedText>• Sesiones completadas vs totales</ThemedText>
        <ThemedText>• Promedio de puntajes por examen</ThemedText>
        
        <ThemedText type="subtitle">🎨 DISEÑO:</ThemedText>
        <ThemedText>• Scroll vertical con secciones</ThemedText>
        <ThemedText>• Gráficos con colores vibrantes</ThemedText>
        <ThemedText>• Trofeos con animaciones al desbloquear</ThemedText>
        <ThemedText>• Cards con sombras y bordes redondeados</ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Fondo consistente
    padding: 20,
  },
  header: {
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  content: {
    flex: 1,
    gap: 16,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
});
