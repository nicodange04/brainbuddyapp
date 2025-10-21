import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CalendarioScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">📅 CALENDARIO - Vista Mensual</ThemedText>
        <ThemedText type="defaultSemiBold">
          Esta será la vista de calendario con sesiones de estudio
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.content}>
        <ThemedText type="subtitle">📋 ELEMENTOS QUE IRÁN AQUÍ:</ThemedText>
        
        <ThemedText type="subtitle">🗓️ CALENDARIO MENSUAL</ThemedText>
        <ThemedText>• Vista de calendario estándar (react-native-calendars)</ThemedText>
        <ThemedText>• Dots de colores en cada día con sesiones:</ThemedText>
        <ThemedText>  - 🟢 Verde: Sesión completada</ThemedText>
        <ThemedText>  - 🟡 Amarillo: Sesión próxima (hoy/mañana)</ThemedText>
        <ThemedText>  - 🔴 Rojo: Sesión atrasada (fecha pasada)</ThemedText>
        <ThemedText>  - 🔵 Azul: Sesión futura</ThemedText>
        
        <ThemedText type="subtitle">👆 INTERACCIONES</ThemedText>
        <ThemedText>• Tap en día → Modal con sesiones de ese día</ThemedText>
        <ThemedText>• Tap en sesión → Ver detalle de la sesión</ThemedText>
        <ThemedText>• Botón "Comenzar" si la sesión está disponible</ThemedText>
        
        <ThemedText type="subtitle">📱 NAVEGACIÓN</ThemedText>
        <ThemedText>• Flechas para cambiar mes</ThemedText>
        <ThemedText>• Botón "Hoy" para volver al mes actual</ThemedText>
        <ThemedText>• Header con mes y año actual</ThemedText>
        
        <ThemedText type="subtitle">🎨 DISEÑO:</ThemedText>
        <ThemedText>• Calendario ocupando toda la pantalla</ThemedText>
        <ThemedText>• Dots pequeños pero visibles</ThemedText>
        <ThemedText>• Modal con fondo semi-transparente</ThemedText>
        <ThemedText>• Cards para mostrar sesiones en el modal</ThemedText>
      </ThemedView>

      <ThemedView style={styles.actionsContainer}>
        <ThemedText type="subtitle">🔧 ACCIONES DISPONIBLES:</ThemedText>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/disponibilidad')}
        >
          <Text style={styles.actionButtonText}>
            ⏰ Configurar Disponibilidad Horaria
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
  actionsContainer: {
    marginTop: 20,
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
  actionButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
