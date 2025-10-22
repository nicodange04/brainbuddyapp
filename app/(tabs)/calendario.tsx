import CalendarioComponent from '@/components/CalendarioComponent';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { distribuirSesionesParaTodosExamenes } from '@/services/sessionDistribution';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CalendarioScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [isDistribuyendo, setIsDistribuyendo] = useState(false);

  const handleDistribuirSesiones = async () => {
    if (!user?.usuario?.usuario_id) {
      Alert.alert('Error', 'No hay usuario autenticado');
      return;
    }

    setIsDistribuyendo(true);
    try {
      const resultados = await distribuirSesionesParaTodosExamenes(user.usuario.usuario_id);
      
      const totalSesiones = resultados.reduce((sum, r) => sum + r.sesiones_creadas, 0);
      const examenesConError = resultados.filter(r => r.error);
      
      if (examenesConError.length > 0) {
        const errores = examenesConError.map(r => r.error).join('\n');
        Alert.alert(
          'Distribución completada con errores',
          `Se crearon ${totalSesiones} sesiones.\n\nErrores:\n${errores}`
        );
      } else {
        Alert.alert(
          '¡Distribución exitosa!',
          `Se crearon ${totalSesiones} sesiones de estudio para todos los exámenes.`
        );
      }
    } catch (error) {
      console.error('Error al distribuir sesiones:', error);
      Alert.alert('Error', 'No se pudieron distribuir las sesiones');
    } finally {
      setIsDistribuyendo(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header con acciones */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">📅 CALENDARIO DE ESTUDIO</ThemedText>
        <ThemedText type="defaultSemiBold">
          Visualiza tus sesiones de estudio y exámenes
        </ThemedText>
      </ThemedView>

      {/* Botones de acción */}
      <ThemedView style={styles.actionsContainer}>
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

        <TouchableOpacity 
          style={[styles.actionButton, styles.algorithmButton]}
          onPress={handleDistribuirSesiones}
          disabled={isDistribuyendo}
        >
          <Text style={styles.actionButtonText}>
            {isDistribuyendo ? '🔄 Distribuyendo...' : '🧠 Generar Sesiones'}
          </Text>
        </TouchableOpacity>
      </ThemedView>

      {/* Componente de calendario */}
      <CalendarioComponent 
        onDiaSeleccionado={(dia) => {
          console.log('Día seleccionado:', dia);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionsContainer: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  algorithmButton: {
    backgroundColor: '#10B981',
  },
});
