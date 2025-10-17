import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { formatearCodigoVinculacion } from '@/services/avatar';
import * as Clipboard from 'expo-clipboard';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

interface CodigoVinculacionProps {
  codigo: string;
  titulo?: string;
  descripcion?: string;
  mostrarBotonCopiar?: boolean;
  mostrarBotonCompartir?: boolean;
}

export function CodigoVinculacion({ 
  codigo, 
  titulo = "Código de Vinculación",
  descripcion = "Comparte este código con tus padres para que puedan seguir tu progreso",
  mostrarBotonCopiar = true,
  mostrarBotonCompartir = true,
}: CodigoVinculacionProps) {
  const [copiado, setCopiado] = useState(false);

  const codigoFormateado = formatearCodigoVinculacion(codigo);

  const copiarCodigo = async () => {
    try {
      await Clipboard.setStringAsync(codigo);
      setCopiado(true);
      Alert.alert('¡Copiado!', 'El código se ha copiado al portapapeles');
      
      // Resetear el estado después de 2 segundos
      setTimeout(() => setCopiado(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'No se pudo copiar el código');
    }
  };

  const compartirCodigo = () => {
    const mensaje = `¡Hola! Mi código de Brain Buddy es: ${codigoFormateado}\n\nÚsalo para seguir mi progreso de estudio.`;
    
    // Por ahora solo mostramos un alert, más adelante podemos usar expo-sharing
    Alert.alert(
      'Compartir Código',
      mensaje,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Copiar mensaje', onPress: () => Clipboard.setStringAsync(mensaje) },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.titulo}>
        {titulo}
      </ThemedText>
      
      <ThemedText style={styles.descripcion}>
        {descripcion}
      </ThemedText>

      <ThemedView style={styles.codigoContainer}>
        <ThemedView style={styles.codigoBox}>
          <ThemedText style={styles.codigoText}>
            {codigoFormateado}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.botonesContainer}>
        {mostrarBotonCopiar && (
          <TouchableOpacity 
            style={[styles.boton, copiado && styles.botonCopiado]}
            onPress={copiarCodigo}
          >
            <ThemedText style={styles.botonText}>
              {copiado ? '✓ Copiado' : '📋 Copiar'}
            </ThemedText>
          </TouchableOpacity>
        )}

        {mostrarBotonCompartir && (
          <TouchableOpacity 
            style={styles.boton}
            onPress={compartirCodigo}
          >
            <ThemedText style={styles.botonText}>
              📤 Compartir
            </ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  titulo: {
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  descripcion: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  codigoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  codigoBox: {
    backgroundColor: '#F3E8FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    minWidth: 120,
  },
  codigoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    textAlign: 'center',
    letterSpacing: 2,
  },
  botonesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  boton: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonCopiado: {
    backgroundColor: '#10B981',
  },
  botonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
