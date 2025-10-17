import { Avatar } from '@/components/avatar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header con avatar y puntos */}
      <ThemedView style={styles.header}>
        <ThemedView style={styles.avatarContainer}>
          <Avatar 
            iniciales="JP"
            color="#8B5CF6"
            size="medium"
          />
        </ThemedView>
        <ThemedView style={styles.userInfo}>
          <ThemedText type="title">¡Hola, Juan!</ThemedText>
          <ThemedText type="defaultSemiBold">320 pts ⭐ 🔥 14</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Próxima sesión */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">TU PRÓXIMA SESIÓN</ThemedText>
        <ThemedView style={styles.sesionCard}>
          <ThemedText type="defaultSemiBold">Sesión 3: Revolución Francesa</ThemedText>
          <ThemedText>📚 Historia</ThemedText>
          <ThemedText>📅 Hoy</ThemedText>
          <ThemedView style={styles.progressBar}>
            <ThemedView style={styles.progressFill} />
          </ThemedView>
          <ThemedText>████████░░ 2/5</ThemedText>
          <TouchableOpacity style={styles.button}>
            <ThemedText style={styles.buttonText}>Comenzar sesión</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Próximos exámenes */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">PRÓXIMOS EXÁMENES</ThemedText>
        <ThemedView style={styles.examenesContainer}>
          <ThemedView style={styles.examenCard}>
            <ThemedText type="defaultSemiBold">Matemáticas</ThemedText>
            <ThemedText>15 Oct</ThemedText>
          </ThemedView>
          <ThemedView style={styles.examenCard}>
            <ThemedText type="defaultSemiBold">Historia</ThemedText>
            <ThemedText>20 Oct</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Accesos rápidos */}
      <ThemedView style={styles.section}>
        <TouchableOpacity style={styles.quickAction}>
          <ThemedText>📅 Ver calendario</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <ThemedText>➕ Agregar examen</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <ThemedText>📊 Mi progreso</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Fondo más suave y consistente
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sesionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginTop: 12,
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
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginVertical: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '80%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  examenesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  examenCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  quickAction: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
});
