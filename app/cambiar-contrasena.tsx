// app/cambiar-contrasena.tsx
// Pantalla para cambiar la contraseña del usuario

import { cambiarContrasena } from '@/services/password';
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
    red: '#EF4444',
    green: '#34D399',
  },
};

export default function CambiarContrasenaScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Estados del formulario
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');

  // Estados para mostrar/ocultar contraseñas
  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  // Validar fortaleza de contraseña
  const validarFortaleza = (password: string): { valida: boolean; mensaje: string } => {
    if (password.length < 6) {
      return { valida: false, mensaje: 'La contraseña debe tener al menos 6 caracteres' };
    }
    if (password.length > 50) {
      return { valida: false, mensaje: 'La contraseña no puede tener más de 50 caracteres' };
    }
    return { valida: true, mensaje: '' };
  };

  const handleCambiar = async () => {
    // Validaciones
    if (!contrasenaActual.trim()) {
      Alert.alert('Error', 'Debes ingresar tu contraseña actual');
      return;
    }

    if (!nuevaContrasena.trim()) {
      Alert.alert('Error', 'Debes ingresar una nueva contraseña');
      return;
    }

    const validacion = validarFortaleza(nuevaContrasena);
    if (!validacion.valida) {
      Alert.alert('Error', validacion.mensaje);
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (contrasenaActual === nuevaContrasena) {
      Alert.alert('Error', 'La nueva contraseña debe ser diferente a la actual');
      return;
    }

    setLoading(true);
    try {
      await cambiarContrasena(contrasenaActual, nuevaContrasena);

      Alert.alert(
        'Contraseña actualizada',
        'Tu contraseña se ha cambiado correctamente',
        [
          {
            text: 'OK',
            onPress: () => {
              // Limpiar campos
              setContrasenaActual('');
              setNuevaContrasena('');
              setConfirmarContrasena('');
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      Alert.alert('Error', error.message || 'No se pudo cambiar la contraseña. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    if (contrasenaActual || nuevaContrasena || confirmarContrasena) {
      Alert.alert(
        'Cancelar',
        '¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.',
        [
          { text: 'Continuar editando', style: 'cancel' },
          {
            text: 'Cancelar',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={handleCancelar} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={DesignColors.neutral.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cambiar Contraseña</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Información */}
        <View style={styles.infoCard}>
          <Ionicons name="lock-closed" size={32} color={DesignColors.primary.violet} />
          <Text style={styles.infoTitle}>Seguridad de tu cuenta</Text>
          <Text style={styles.infoText}>
            Cambia tu contraseña regularmente para mantener tu cuenta segura. 
            Asegúrate de usar una contraseña fuerte y única.
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña actual *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={contrasenaActual}
                onChangeText={setContrasenaActual}
                placeholder="Ingresa tu contraseña actual"
                placeholderTextColor={DesignColors.neutral.mediumGray}
                secureTextEntry={!mostrarActual}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setMostrarActual(!mostrarActual)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={mostrarActual ? 'eye-off' : 'eye'}
                  size={20}
                  color={DesignColors.neutral.mediumGray}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nueva contraseña *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={nuevaContrasena}
                onChangeText={setNuevaContrasena}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={DesignColors.neutral.mediumGray}
                secureTextEntry={!mostrarNueva}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setMostrarNueva(!mostrarNueva)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={mostrarNueva ? 'eye-off' : 'eye'}
                  size={20}
                  color={DesignColors.neutral.mediumGray}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>
              La contraseña debe tener al menos 6 caracteres
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar nueva contraseña *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmarContrasena}
                onChangeText={setConfirmarContrasena}
                placeholder="Repite la nueva contraseña"
                placeholderTextColor={DesignColors.neutral.mediumGray}
                secureTextEntry={!mostrarConfirmar}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setMostrarConfirmar(!mostrarConfirmar)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={mostrarConfirmar ? 'eye-off' : 'eye'}
                  size={20}
                  color={DesignColors.neutral.mediumGray}
                />
              </TouchableOpacity>
            </View>
            {confirmarContrasena && nuevaContrasena !== confirmarContrasena && (
              <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
            )}
            {confirmarContrasena && nuevaContrasena === confirmarContrasena && (
              <Text style={styles.successText}>✓ Las contraseñas coinciden</Text>
            )}
          </View>
        </View>

        {/* Botones */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonCancel]}
            onPress={handleCancelar}
            disabled={loading}
          >
            <Text style={styles.buttonCancelText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSave, loading && styles.buttonDisabled]}
            onPress={handleCambiar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={DesignColors.secondary.white} />
            ) : (
              <Text style={styles.buttonSaveText}>Cambiar contraseña</Text>
            )}
          </TouchableOpacity>
        </View>

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
    fontSize: 18,
    fontWeight: '700',
    color: DesignColors.neutral.black,
    marginTop: 12,
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: DesignColors.neutral.black,
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: DesignColors.neutral.lightGray,
    paddingRight: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: DesignColors.neutral.black,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  eyeButton: {
    padding: 8,
  },
  helperText: {
    fontSize: 12,
    color: DesignColors.neutral.mediumGray,
    marginTop: 6,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: DesignColors.supporting.red,
    marginTop: 6,
    fontWeight: '500',
  },
  successText: {
    fontSize: 12,
    color: DesignColors.supporting.green,
    marginTop: 6,
    fontWeight: '500',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonCancel: {
    backgroundColor: DesignColors.secondary.white,
    borderWidth: 2,
    borderColor: DesignColors.neutral.lightGray,
  },
  buttonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignColors.neutral.black,
  },
  buttonSave: {
    backgroundColor: DesignColors.primary.violet,
    shadowColor: DesignColors.primary.violet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonSaveText: {
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

