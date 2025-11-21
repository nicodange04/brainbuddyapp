// app/recuperar-contrasena.tsx
// Pantalla para recuperar contraseña mediante email

import { recuperarContrasena } from '@/services/password';
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
    blue: '#60A5FA',
  },
};

export default function RecuperarContrasenaScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailEnviado, setEmailEnviado] = useState(false);

  const handleRecuperar = async () => {
    // Validaciones
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setLoading(true);
    try {
      await recuperarContrasena(email.trim());
      setEmailEnviado(true);
    } catch (error: any) {
      console.error('Error al recuperar contraseña:', error);
      Alert.alert('Error', error.message || 'No se pudo enviar el email de recuperación. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVolver = () => {
    router.back();
  };

  const handleReenviar = () => {
    setEmailEnviado(false);
    setEmail('');
  };

  // Si el email fue enviado, mostrar pantalla de confirmación
  if (emailEnviado) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={handleVolver} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={DesignColors.neutral.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recuperar Contraseña</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.successCard}>
            <View style={styles.successIconContainer}>
              <Ionicons name="mail" size={64} color={DesignColors.supporting.green} />
            </View>
            <Text style={styles.successTitle}>¡Email enviado!</Text>
            <Text style={styles.successText}>
              Hemos enviado un email a{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
            <Text style={styles.successSubtext}>
              Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
            </Text>
            <Text style={styles.successNote}>
              💡 Si no encuentras el email, revisa tu carpeta de spam.
            </Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleReenviar}
              disabled={loading}
            >
              <Text style={styles.buttonSecondaryText}>Enviar a otro email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleVolver}
              disabled={loading}
            >
              <Text style={styles.buttonPrimaryText}>Volver al login</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Pantalla principal para ingresar email
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={handleVolver} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={DesignColors.neutral.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recuperar Contraseña</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Información */}
        <View style={styles.infoCard}>
          <Ionicons name="lock-closed-outline" size={48} color={DesignColors.primary.violet} />
          <Text style={styles.infoTitle}>¿Olvidaste tu contraseña?</Text>
          <Text style={styles.infoText}>
            No te preocupes. Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.section}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={DesignColors.neutral.mediumGray}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="tu@email.com"
                placeholderTextColor={DesignColors.neutral.mediumGray}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>
            <Text style={styles.helperText}>
              Te enviaremos un email con las instrucciones para restablecer tu contraseña
            </Text>
          </View>
        </View>

        {/* Botones */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonCancel]}
            onPress={handleVolver}
            disabled={loading}
          >
            <Text style={styles.buttonCancelText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSave, loading && styles.buttonDisabled]}
            onPress={handleRecuperar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={DesignColors.secondary.white} />
            ) : (
              <Text style={styles.buttonSaveText}>Enviar email</Text>
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
    fontSize: 20,
    fontWeight: '700',
    color: DesignColors.neutral.black,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: DesignColors.neutral.lightGray,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: DesignColors.neutral.black,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  helperText: {
    fontSize: 12,
    color: DesignColors.neutral.mediumGray,
    marginTop: 6,
    fontStyle: 'italic',
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
  // Estilos para pantalla de éxito
  successCard: {
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: DesignColors.supporting.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: DesignColors.supporting.green + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: DesignColors.neutral.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: DesignColors.neutral.darkGray,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
  },
  emailHighlight: {
    fontWeight: '700',
    color: DesignColors.primary.violet,
  },
  successSubtext: {
    fontSize: 14,
    color: DesignColors.neutral.mediumGray,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  successNote: {
    fontSize: 13,
    color: DesignColors.neutral.mediumGray,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  buttonPrimary: {
    backgroundColor: DesignColors.primary.violet,
    shadowColor: DesignColors.primary.violet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPrimaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignColors.secondary.white,
  },
  buttonSecondary: {
    backgroundColor: DesignColors.secondary.white,
    borderWidth: 2,
    borderColor: DesignColors.neutral.lightGray,
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignColors.neutral.black,
  },
});


