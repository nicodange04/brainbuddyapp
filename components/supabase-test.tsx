// components/supabase-test.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { testSupabaseConnection } from '@/services/supabase';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setConnectionStatus('testing');
    try {
      const isConnected = await testSupabaseConnection();
      if (isConnected) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
        setErrorMessage('No se pudo conectar a Supabase');
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'testing': return '#F59E0B'; // Amarillo
      case 'success': return '#10B981'; // Verde
      case 'error': return '#EF4444'; // Rojo
      default: return '#6B7280'; // Gris
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing': return 'Probando conexión...';
      case 'success': return '✅ Conexión exitosa';
      case 'error': return '❌ Error de conexión';
      default: return 'Estado desconocido';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Test de Conexión Supabase
      </ThemedText>
      
      <ThemedView style={[styles.statusCard, { borderColor: getStatusColor() }]}>
        <ThemedText style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </ThemedText>
        
        {connectionStatus === 'error' && (
          <ThemedText style={styles.errorText}>
            {errorMessage}
          </ThemedText>
        )}
      </ThemedView>

      <TouchableOpacity style={styles.retryButton} onPress={testConnection}>
        <ThemedText style={styles.retryButtonText}>
          🔄 Probar de nuevo
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#1F2937',
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
