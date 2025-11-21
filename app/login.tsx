import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    
    try {
      await login({ email, password });
      // El AuthContext maneja la navegación automáticamente
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView style={styles.content}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedView style={styles.logoContainer}>
            <ThemedView style={styles.logo}>
              <ThemedText style={styles.logoText}>BB</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedText type="title" style={styles.title}>
            ¡Bienvenido a Brain Buddy!
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.subtitle}>
            Inicia sesión para continuar estudiando
          </ThemedText>
        </ThemedView>

        {/* Formulario */}
        <ThemedView style={styles.form}>
          <ThemedView style={styles.inputContainer}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </ThemedView>

          <ThemedView style={styles.inputContainer}>
            <ThemedText style={styles.label}>Contraseña</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Tu contraseña"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </ThemedView>

          <ThemedView style={styles.optionsContainer}>
            <TouchableOpacity 
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <ThemedView style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <ThemedText style={styles.checkmark}>✓</ThemedText>}
              </ThemedView>
              <ThemedText style={styles.rememberMeText}>Recordarme</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => router.push('/recuperar-contrasena')}
            >
              <ThemedText style={styles.forgotPasswordText}>
                ¿Olvidaste tu contraseña?
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <TouchableOpacity 
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <ThemedText style={styles.loginButtonText}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {/* Footer */}
        <ThemedView style={styles.footer}>
          <ThemedText style={styles.footerText}>
            ¿No tienes cuenta?{' '}
          </ThemedText>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <ThemedText style={styles.registerLink}>
                Regístrate aquí
              </ThemedText>
            </TouchableOpacity>
          </Link>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#1F2937',
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
  },
  form: {
    backgroundColor: 'white',
    padding: 24,
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
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rememberMeText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPassword: {
    // alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#8B5CF6', // Violeta principal
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#A78BFA',
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#6B7280',
    fontSize: 16,
  },
  registerLink: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
});
