// app/agregar-amigo.tsx
// Pantalla para que el alumno agregue un amigo usando código de amistad

import { useAuth } from '@/contexts/AuthContext';
import { agregarAmigoPorCodigo, getAmigos } from '@/services/amigos';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Design System Colors
const DesignColors = {
  primary: {
    violet: '#8B5CF6',
    violetLight: '#A78BFA',
    violetDark: '#7C3AED',
  },
  secondary: {
    white: '#FFFFFF',
    offWhite: '#F9FAFB',
  },
  neutral: {
    black: '#1F2937',
    darkGray: '#374151',
    mediumGray: '#6B7280',
    lightGray: '#E5E7EB',
  },
  supporting: {
    green: '#34D399',
    red: '#EF4444',
  },
};

export default function AgregarAmigoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [amigos, setAmigos] = useState<any[]>([]);
  const [loadingAmigos, setLoadingAmigos] = useState(true);

  const cargarAmigos = async () => {
    if (!user?.alumno?.alumno_id) return;

    setLoadingAmigos(true);
    try {
      const listaAmigos = await getAmigos(user.alumno.alumno_id);
      setAmigos(listaAmigos);
    } catch (error) {
      console.error('Error al cargar amigos:', error);
    } finally {
      setLoadingAmigos(false);
    }
  };

  useEffect(() => {
    cargarAmigos();
  }, [user]);

  const handleAgregar = async () => {
    // Validaciones
    if (!codigo.trim()) {
      Alert.alert('Error', 'Por favor ingresa el código de amistad');
      return;
    }

    const codigoLimpio = codigo.trim().toUpperCase();

    if (codigoLimpio.length !== 6) {
      Alert.alert('Error', 'El código debe tener 6 caracteres');
      return;
    }

    if (!user?.alumno?.alumno_id) {
      Alert.alert('Error', 'No se pudo obtener la información del alumno');
      return;
    }

    setLoading(true);
    try {
      const resultado = await agregarAmigoPorCodigo(user.alumno.alumno_id, codigoLimpio);

      if (resultado.success) {
        Alert.alert('¡Éxito!', resultado.message, [
          {
            text: 'OK',
            onPress: () => {
              setCodigo('');
              cargarAmigos();
            },
          },
        ]);
      } else {
        Alert.alert('Error', resultado.message);
      }
    } catch (error: any) {
      console.error('Error al agregar amigo:', error);
      Alert.alert('Error', 'No se pudo agregar el amigo. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={DesignColors.neutral.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agregar Amigo</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Información */}
        <View style={styles.infoCard}>
          <Ionicons name="people" size={48} color={DesignColors.primary.violet} />
          <Text style={styles.infoTitle}>Agregar un amigo</Text>
          <Text style={styles.infoText}>
            Ingresa el código de amistad de 6 dígitos de tu amigo para competir en el ranking.
            Puedes encontrar tu código en tu perfil.
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.section}>
          <Text style={styles.label}>Código de amistad</Text>
          <TextInput
            style={styles.input}
            value={codigo}
            onChangeText={(text) => setCodigo(text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            placeholder="ABC123"
            placeholderTextColor={DesignColors.neutral.mediumGray}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            editable={!loading}
          />
          <Text style={styles.helperText}>
            El código tiene 6 caracteres (letras y números)
          </Text>
        </View>

        {/* Amigos ya agregados */}
        {loadingAmigos ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={DesignColors.primary.violet} />
          </View>
        ) : amigos.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amigos agregados ({amigos.length})</Text>
            {amigos.map((amigo) => (
              <View key={amigo.usuario_id} style={styles.amigoCard}>
                <View style={[styles.avatarCircle, { backgroundColor: amigo.avatar_color }]}>
                  <Text style={styles.avatarText}>
                    {amigo.nombre.charAt(0)}{amigo.apellido.charAt(0)}
                  </Text>
                </View>
                <View style={styles.amigoInfo}>
                  <Text style={styles.amigoNombre}>
                    {amigo.nombre} {amigo.apellido}
                  </Text>
                  <Text style={styles.amigoCodigo}>
                    Código: {amigo.codigo_amistad}
                  </Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color={DesignColors.supporting.green} />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={DesignColors.neutral.mediumGray} />
            <Text style={styles.emptyStateText}>Aún no tienes amigos agregados</Text>
            <Text style={styles.emptyStateSubtext}>
              Agrega amigos usando sus códigos para competir en el ranking
            </Text>
          </View>
        )}

        {/* Botón */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAgregar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={DesignColors.secondary.white} />
          ) : (
            <Text style={styles.buttonText}>Agregar Amigo</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignColors.secondary.offWhite,
  },
  header: {
    backgroundColor: DesignColors.secondary.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: DesignColors.neutral.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DesignColors.neutral.black,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: DesignColors.primary.violet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DesignColors.neutral.black,
    marginTop: 16,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: DesignColors.neutral.mediumGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: DesignColors.neutral.mediumGray,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: DesignColors.neutral.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 16,
    padding: 16,
    fontSize: 24,
    fontWeight: '700',
    color: DesignColors.neutral.black,
    borderWidth: 2,
    borderColor: DesignColors.neutral.lightGray,
    textAlign: 'center',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  helperText: {
    fontSize: 12,
    color: DesignColors.neutral.mediumGray,
    marginTop: 6,
    textAlign: 'center',
  },
  amigoCard: {
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: DesignColors.primary.violet,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: DesignColors.secondary.white,
  },
  amigoInfo: {
    flex: 1,
  },
  amigoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignColors.neutral.black,
    marginBottom: 4,
  },
  amigoCodigo: {
    fontSize: 12,
    color: DesignColors.neutral.mediumGray,
  },
  button: {
    backgroundColor: DesignColors.primary.violet,
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    shadowColor: DesignColors.primary.violet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignColors.secondary.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  bottomSpacing: {
    height: 24,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyState: {
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignColors.neutral.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: DesignColors.neutral.mediumGray,
    textAlign: 'center',
  },
});

