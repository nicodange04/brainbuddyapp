import { Avatar } from '@/components/avatar';
import { CodigoVinculacion } from '@/components/codigo-vinculacion';
import { DateInput } from '@/components/date-input';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { generarAvatar, generarCodigoVinculacion } from '@/services/avatar';
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
        <ThemedText style={styles.successEmoji}>🎉</ThemedText>
        <ThemedText type="title" style={styles.stepTitle}>
          ¡Cuenta creada exitosamente!
        </ThemedText>
        
        {userType === 'alumno' ? (
          <>
            <ThemedText style={styles.stepSubtitle}>
              Tu avatar y código de vinculación han sido generados
            </ThemedText>

            {avatarGenerado && (
              <ThemedView style={styles.avatarContainer}>
                <Avatar 
                  iniciales={avatarGenerado.iniciales}
                  color={avatarGenerado.color as any}
                  size="large"
                />
                <ThemedText style={styles.avatarLabel}>
                  Tu avatar: {avatarGenerado.iniciales}
                </ThemedText>
              </ThemedView>
            )}

            {codigoGenerado && (
              <CodigoVinculacion 
                codigo={codigoGenerado}
                titulo="Tu código de vinculación"
                descripcion="Comparte este código con tus padres para que puedan seguir tu progreso de estudio"
              />
            )}
          </>
        ) : (
          <>
            <ThemedText style={styles.stepSubtitle}>
              Tu cuenta de padre/madre ha sido creada
            </ThemedText>
            <ThemedView style={styles.padreInfo}>
              <ThemedText style={styles.padreText}>
                • Usa el código de vinculación de tu hijo/a para conectarte
              </ThemedText>
              <ThemedText style={styles.padreText}>
                • Podrás ver su progreso, sesiones y estadísticas
              </ThemedText>
              <ThemedText style={styles.padreText}>
                • No podrás crear exámenes ni estudiar sesiones
              </ThemedText>
            </ThemedView>
          </>
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
              onPress={() => router.replace('/(tabs)')}
            >
              <ThemedText style={styles.finalButtonText}>
                {userType === 'alumno' ? '¡Comenzar a estudiar!' : 'Ir a la app'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* Footer */}
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
    gap: 16,
  },
  stepTitle: {
    textAlign: 'center',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepSubtitle: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 16,
    marginBottom: 20,
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
    gap: 20,
  },
  successEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '500',
  },
  finalNavigation: {
    marginTop: 24,
  },
  finalButton: {
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
  finalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  padreInfo: {
    backgroundColor: '#F3E8FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B5CF6',
    marginTop: 20,
  },
  padreText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
});
