// app/vincular-hijo.tsx
// Pantalla para que el padre vincule un hijo usando código de vinculación

import { useAuth } from '@/contexts/AuthContext';
import { usePadre } from '@/contexts/PadreContext';
import { vincularPadreAlumno } from '@/services/auth';
import { validarCodigoVinculacion } from '@/services/avatar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function VincularHijoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { hijosVinculados, refrescarHijos } = usePadre();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVincular = async () => {
    // Validaciones
    if (!codigo.trim()) {
      Alert.alert('Error', 'Por favor ingresa el código de vinculación');
      return;
    }

    const codigoLimpio = codigo.trim().toUpperCase();
    
    if (!validarCodigoVinculacion(codigoLimpio)) {
      Alert.alert('Error', 'El código debe tener 6 caracteres alfanuméricos');
      return;
    }

    if (!user?.padre?.padre_id) {
      Alert.alert('Error', 'No se pudo obtener la información del padre');
      return;
    }

    // Verificar si ya está vinculado
    const yaVinculado = hijosVinculados.some(
      h => h.codigo_vinculacion === codigoLimpio
    );
    
    if (yaVinculado) {
      Alert.alert('Ya vinculado', 'Este hijo ya está vinculado a tu cuenta');
      return;
    }

    setLoading(true);
    try {
      await vincularPadreAlumno(codigoLimpio, user.padre.padre_id);
      
      // Refrescar lista de hijos
      await refrescarHijos();

      Alert.alert(
        '¡Vinculación exitosa!',
        'Ahora puedes ver el progreso de tu hijo/a',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error al vincular:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo vincular. Verifica que el código sea correcto.'
      );
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
        <Text style={styles.headerTitle}>Vincular Hijo</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Información */}
        <View style={styles.infoCard}>
          <Ionicons name="link" size={48} color={DesignColors.primary.violet} />
          <Text style={styles.infoTitle}>Vincular con tu hijo/a</Text>
          <Text style={styles.infoText}>
            Ingresa el código de vinculación de 6 dígitos que tu hijo/a te compartió.
            Este código lo encontrarás en su perfil.
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.section}>
          <Text style={styles.label}>Código de vinculación</Text>
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

        {/* Hijos ya vinculados */}
        {hijosVinculados.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hijos vinculados</Text>
            {hijosVinculados.map((hijo) => (
              <View key={hijo.alumno_id} style={styles.hijoCard}>
                <View style={[styles.avatarCircle, { backgroundColor: hijo.avatar_color }]}>
                  <Text style={styles.avatarText}>{hijo.iniciales}</Text>
                </View>
                <View style={styles.hijoInfo}>
                  <Text style={styles.hijoNombre}>
                    {hijo.nombre} {hijo.apellido}
                  </Text>
                  <Text style={styles.hijoCodigo}>
                    Código: {hijo.codigo_vinculacion}
                  </Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color={DesignColors.supporting.green} />
              </View>
            ))}
          </View>
        )}

        {/* Botón */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVincular}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={DesignColors.secondary.white} />
          ) : (
            <Text style={styles.buttonText}>Vincular</Text>
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
  hijoCard: {
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
  hijoInfo: {
    flex: 1,
  },
  hijoNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignColors.neutral.black,
    marginBottom: 4,
  },
  hijoCodigo: {
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
});





