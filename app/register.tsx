import { Avatar } from '@/components/avatar';
import { DateInput } from '@/components/date-input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { formatearCodigoVinculacion, generarAvatar, generarCodigoVinculacion } from '@/services/avatar';
import * as Clipboard from 'expo-clipboard';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'alumno' | 'padre' | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    fechaNacimiento: '',
    telefono: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [avatarGenerado, setAvatarGenerado] = useState<{iniciales: string, color: string} | null>(null);
  const [codigoGenerado, setCodigoGenerado] = useState<string>('');


  const handleNext = () => {
    if (step === 1 && !userType) {
      Alert.alert('Error', 'Por favor selecciona un tipo de usuario');
      return;
    }
    if (step === 2) {
      if (!formData.nombre || !formData.email) {
        Alert.alert('Error', 'Por favor completa todos los campos');
        return;
      }
      if (userType === 'padre' && !formData.telefono) {
        Alert.alert('Error', 'Por favor ingresa tu número de teléfono');
        return;
      }
    }
    if (step === 3) {
      if (!formData.password || !formData.confirmPassword) {
        Alert.alert('Error', 'Por favor completa todos los campos');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Error', 'Las contraseñas no coinciden');
        return;
      }
    }
    if (step === 4 && userType === 'alumno' && !formData.fechaNacimiento) {
      Alert.alert('Error', 'Por favor selecciona tu fecha de nacimiento');
      return;
    }
    setStep(step + 1);
  };

  const handleRegister = async () => {
    setIsLoading(true);
    
    try {
      // Preparar datos para el registro
      const registerData = {
        nombre: formData.nombre.split(' ')[0] || formData.nombre,
        apellido: formData.nombre.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        password: formData.password,
        rol: userType!,
        fechaNacimiento: userType === 'alumno' ? formData.fechaNacimiento : undefined,
        telefono: userType === 'padre' ? formData.telefono : undefined,
      };

      // Registrar usuario
      await register(registerData);
      
      // Solo generar avatar y código para alumnos (para mostrar en pantalla de éxito)
      if (userType === 'alumno') {
        const avatar = generarAvatar(formData.nombre);
        const codigo = generarCodigoVinculacion();
        
        setAvatarGenerado(avatar);
        setCodigoGenerado(codigo);
      }
      
      setStep(5); // Ir al paso de éxito
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al crear la cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <ThemedView style={styles.stepContent}>
      <ThemedText type="title" style={styles.stepTitle}>
        ¿Cómo te gustaría registrarte?
      </ThemedText>
      <ThemedText style={styles.stepSubtitle}>
        Selecciona el tipo de cuenta que mejor se adapte a ti
      </ThemedText>

      <TouchableOpacity 
        style={[styles.userTypeCard, userType === 'alumno' && styles.userTypeCardSelected]}
        onPress={() => setUserType('alumno')}
      >
        <ThemedView style={styles.userTypeIcon}>
          <ThemedText style={styles.userTypeEmoji}>🎓</ThemedText>
        </ThemedView>
        <ThemedText type="defaultSemiBold" style={styles.userTypeTitle}>
          Soy Alumno
        </ThemedText>
        <ThemedText style={styles.userTypeDescription}>
          Quiero estudiar y prepararme para mis exámenes
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.userTypeCard, userType === 'padre' && styles.userTypeCardSelected]}
        onPress={() => setUserType('padre')}
      >
        <ThemedView style={styles.userTypeIcon}>
          <ThemedText style={styles.userTypeEmoji}>👨‍👩‍👧‍👦</ThemedText>
        </ThemedView>
        <ThemedText type="defaultSemiBold" style={styles.userTypeTitle}>
          Soy Padre/Madre
        </ThemedText>
        <ThemedText style={styles.userTypeDescription}>
          Quiero seguir el progreso de mi hijo/a
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  const renderStep2 = () => (
    <ThemedView style={styles.stepContent}>
      <ThemedText type="title" style={styles.stepTitle}>
        Información Personal
      </ThemedText>
      <ThemedText style={styles.stepSubtitle}>
        Cuéntanos un poco sobre ti
      </ThemedText>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Nombre completo</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Tu nombre completo"
          placeholderTextColor="#9CA3AF"
          value={formData.nombre}
          onChangeText={(text) => setFormData({...formData, nombre: text})}
        />
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Email</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="tu@email.com"
          placeholderTextColor="#9CA3AF"
          value={formData.email}
          onChangeText={(text) => setFormData({...formData, email: text})}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </ThemedView>

      {userType === 'padre' && (
        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.label}>Teléfono</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="+54 9 11 1234-5678"
            placeholderTextColor="#9CA3AF"
            value={formData.telefono}
            onChangeText={(text) => setFormData({...formData, telefono: text})}
            keyboardType="phone-pad"
          />
        </ThemedView>
      )}
    </ThemedView>
  );

  const renderStep3 = () => (
    <ThemedView style={styles.stepContent}>
      <ThemedText type="title" style={styles.stepTitle}>
        Contraseña Segura
      </ThemedText>
      <ThemedText style={styles.stepSubtitle}>
        Crea una contraseña para proteger tu cuenta
      </ThemedText>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Contraseña</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 8 caracteres"
          placeholderTextColor="#9CA3AF"
          value={formData.password}
          onChangeText={(text) => setFormData({...formData, password: text})}
          secureTextEntry
        />
      </ThemedView>

      <ThemedView style={styles.inputContainer}>
        <ThemedText style={styles.label}>Confirmar contraseña</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Repite tu contraseña"
          placeholderTextColor="#9CA3AF"
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
          secureTextEntry
        />
      </ThemedView>
    </ThemedView>
  );

  const renderStep4 = () => (
    <ThemedView style={styles.stepContent}>
      <ThemedText type="title" style={styles.stepTitle}>
        {userType === 'alumno' ? 'Fecha de Nacimiento' : '¡Casi listo!'}
      </ThemedText>
      <ThemedText style={styles.stepSubtitle}>
        {userType === 'alumno' 
          ? 'Necesitamos tu fecha de nacimiento para personalizar tu experiencia'
          : 'Revisa tu información antes de crear tu cuenta'
        }
      </ThemedText>

      {userType === 'alumno' && (
        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.label}>Fecha de nacimiento</ThemedText>
          <DateInput
            value={formData.fechaNacimiento}
            onChangeText={(text) => setFormData({...formData, fechaNacimiento: text})}
            placeholder="DD/MM/YYYY"
          />
        </ThemedView>
      )}

      <ThemedView style={styles.summaryCard}>
        <ThemedText type="defaultSemiBold" style={styles.summaryTitle}>
          Resumen de tu cuenta:
        </ThemedText>
        <ThemedText style={styles.summaryText}>• Tipo: {userType === 'alumno' ? 'Alumno' : 'Padre/Madre'}</ThemedText>
        <ThemedText style={styles.summaryText}>• Nombre: {formData.nombre}</ThemedText>
        <ThemedText style={styles.summaryText}>• Email: {formData.email}</ThemedText>
        {userType === 'padre' && formData.telefono && (
          <ThemedText style={styles.summaryText}>• Teléfono: {formData.telefono}</ThemedText>
        )}
        {userType === 'alumno' && formData.fechaNacimiento && (
          <ThemedText style={styles.summaryText}>• Fecha: {formData.fechaNacimiento}</ThemedText>
        )}
      </ThemedView>
    </ThemedView>
  );

  const renderStep5 = () => (
    <ThemedView style={styles.stepContent}>
      <ThemedView style={styles.successContainer}>
        {/* Título breve */}
        <ThemedText type="title" style={styles.successTitle}>
          ¡Cuenta creada exitosamente! 🎉
          </ThemedText>

        {/* Código grande y destacado (solo para alumnos) */}
        {userType === 'alumno' && codigoGenerado && (
          <ThemedView style={styles.codeHighlightContainer}>
            <ThemedText style={styles.codeLabel}>Tu código de vinculación</ThemedText>
            <TouchableOpacity 
              style={styles.codeBoxLarge}
              onPress={async () => {
                try {
                  await Clipboard.setStringAsync(codigoGenerado);
                  Alert.alert('¡Copiado!', 'El código se ha copiado al portapapeles');
                } catch {
                  Alert.alert('Error', 'No se pudo copiar el código');
                }
              }}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.codeTextLarge}>
                {formatearCodigoVinculacion(codigoGenerado)}
            </ThemedText>
              <ThemedText style={styles.codeHint}>Toca para copiar</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.codeDescription}>
              Compártelo con tus padres para que puedan seguir tu progreso
            </ThemedText>
          </ThemedView>
          )}

        {/* Avatar pequeño abajo (solo para alumnos) */}
        {userType === 'alumno' && avatarGenerado && (
          <ThemedView style={styles.avatarGroupCompact}>
            <Avatar 
              iniciales={avatarGenerado.iniciales}
              color={avatarGenerado.color as any}
              size="medium"
            />
            <ThemedText style={styles.avatarLabelCompact}>
              Tu avatar
            </ThemedText>
          </ThemedView>
        )}

        {/* Info para padres */}
        {userType === 'padre' && (
          <ThemedView style={styles.padreInfoCompact}>
            <ThemedText style={styles.padreInfoTitle}>
              ¿Qué sigue?
              </ThemedText>
            <ThemedText style={styles.padreInfoText}>
              Usa el código de vinculación de tu hijo/a para conectarte y ver su progreso
              </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ThemedView>
  );

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView style={styles.content}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedView style={styles.progressContainer}>
            <ThemedView style={styles.progressBar}>
              <ThemedView style={[styles.progressFill, { width: `${(step / (step === 5 ? 5 : 4)) * 100}%` }]} />
            </ThemedView>
            <ThemedText style={styles.progressText}>
              Paso {step} de {step === 5 ? 5 : 4}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Step Content */}
        <ThemedView style={styles.form}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </ThemedView>

        {/* Navigation */}
        {step < 5 && (
          <ThemedView style={styles.navigation}>
            {step > 1 && step < 5 && (
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setStep(step - 1)}
              >
                <ThemedText style={styles.backButtonText}>Atrás</ThemedText>
              </TouchableOpacity>
            )}
            
            {step < 4 ? (
              <TouchableOpacity 
                style={styles.nextButton}
                onPress={handleNext}
              >
                <ThemedText style={styles.nextButtonText}>Siguiente</ThemedText>
              </TouchableOpacity>
            ) : step === 4 ? (
              <TouchableOpacity 
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                <ThemedText style={styles.registerButtonText}>
                  {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </ThemedText>
              </TouchableOpacity>
            ) : null}
          </ThemedView>
        )}

        {/* Botón final para ir a la app */}
        {step === 5 && (
          <ThemedView style={styles.finalNavigation}>
            <TouchableOpacity 
              style={styles.finalButton}
              onPress={() => {
                // Si es alumno, ir a onboarding; si es padre, ir a tabs
                if (userType === 'alumno') {
                  router.replace('/onboarding');
                } else {
                  router.replace('/(tabs)');
                }
              }}
            >
              <ThemedText style={styles.finalButtonText}>
                {userType === 'alumno' ? 'Continuar' : 'Ir a la app'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* Footer - Solo mostrar si no es el paso 5 */}
        {step !== 5 && (
        <ThemedView style={styles.footer}>
          <ThemedText style={styles.footerText}>
            ¿Ya tienes cuenta?{' '}
          </ThemedText>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <ThemedText style={styles.loginLink}>
                Inicia sesión aquí
              </ThemedText>
            </TouchableOpacity>
          </Link>
        </ThemedView>
        )}
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
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
    marginBottom: 24,
  },
  stepContent: {
    padding: 24,
  },
  stepTitle: {
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 0, // Se maneja con gap del grupo
  },
  stepSubtitle: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginBottom: 0, // Se maneja con gap del grupo
  },
  userTypeCard: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  userTypeCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3E8FF',
  },
  userTypeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userTypeEmoji: {
    fontSize: 24,
  },
  userTypeTitle: {
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 8,
  },
  userTypeDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
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
  summaryCard: {
    backgroundColor: '#F3E8FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  summaryTitle: {
    fontSize: 16,
    color: '#8B5CF6',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#8B5CF6',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginLeft: 12,
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
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#8B5CF6',
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
  registerButtonDisabled: {
    backgroundColor: '#A78BFA',
    shadowOpacity: 0.1,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#6B7280',
    fontSize: 16,
  },
  loginLink: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    gap: 32, // Espaciado generoso entre elementos principales
    width: '100%',
  },
  successTitle: {
    textAlign: 'center',
    color: '#1F2937',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  codeHighlightContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  codeLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  codeBoxLarge: {
    backgroundColor: '#F3E8FF',
    paddingVertical: 32, // Aumentado de 24 a 32 para más espacio vertical
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#8B5CF6',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center', // Centrar verticalmente
    minHeight: 100, // Altura mínima para acomodar el texto completo
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'visible', // Asegurar que no se corte el texto
  },
  codeTextLarge: {
    fontSize: 36,
    fontWeight: '800',
    color: '#8B5CF6',
    textAlign: 'center',
    letterSpacing: 4,
    lineHeight: 50, // 1.39x el fontSize (36 * 1.39 = 50) para espacio vertical suficiente con ascendentes/descendentes
    marginBottom: 8,
    includeFontPadding: false, // Eliminar padding extra en Android
    textAlignVertical: 'center', // Centrar verticalmente en Android
  },
  codeHint: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '500',
    textAlign: 'center',
  },
  codeDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '90%',
  },
  avatarGroupCompact: {
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  avatarLabelCompact: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
    textAlign: 'center',
  },
  finalNavigation: {
    marginTop: 8,
    width: '100%',
  },
  finalButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    width: '100%',
  },
  finalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  padreInfoCompact: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  padreInfoTitle: {
    fontSize: 18,
    color: '#1F2937',
    fontWeight: '600',
    textAlign: 'center',
  },
  padreInfoText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
