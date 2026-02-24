// app/onboarding.tsx
// Pantalla de onboarding para crear perfil de aprendizaje del alumno

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { guardarPerfilAprendizaje, PerfilAprendizajeInput } from '@/services/perfilAprendizaje';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type EstiloAprendizaje = 'visual' | 'auditivo' | 'lectura' | 'kinestesico' | 'mixto';
type NivelProfundidad = 'basico' | 'medio' | 'avanzado';
type VelocidadAprendizaje = 'lento' | 'normal' | 'rapido';

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [perfil, setPerfil] = useState<PerfilAprendizajeInput>({
    estilo_primario: 'mixto',
    nivel_profundidad: 'medio',
    velocidad_aprendizaje: 'normal',
    prefiere_ejemplos: true,
    prefiere_diagramas: false,
    prefiere_analogias: true,
    prefiere_casos_reales: false,
    prefiere_pasos_ordenados: true,
    prefiere_conceptos_globales: false,
    prefiere_resumenes: true,
    prefiere_lenguaje_formal: false,
    prefiere_lenguaje_cotidiano: true,
    prefiere_terminos_tecnicos: false,
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    if (!user?.alumno?.alumno_id) {
      Alert.alert('Error', 'No se encontró información del alumno');
      return;
    }

    setIsLoading(true);
    try {
      await guardarPerfilAprendizaje(user.alumno.alumno_id, perfil);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Error al guardar el perfil'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Omitir onboarding',
      '¿Estás seguro? Podrás completarlo más tarde desde tu perfil.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Omitir',
          style: 'destructive',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  // Paso 1: Estilo de aprendizaje principal
  const renderStep1 = () => (
    <ThemedView style={styles.stepContent}>
      <ThemedText type="title" style={styles.stepTitle}>
        ¿Cómo aprendes mejor?
      </ThemedText>
      <ThemedText style={styles.stepSubtitle}>
        Selecciona el estilo que mejor describe cómo entiendes mejor la información
      </ThemedText>

      {[
        {
          value: 'visual' as EstiloAprendizaje,
          emoji: '👁️',
          title: 'Visual',
          description: 'Aprendo mejor viendo imágenes, diagramas y gráficos',
        },
        {
          value: 'auditivo' as EstiloAprendizaje,
          emoji: '👂',
          title: 'Auditivo',
          description: 'Aprendo mejor escuchando explicaciones y conversaciones',
        },
        {
          value: 'lectura' as EstiloAprendizaje,
          emoji: '📖',
          title: 'Lectura/Escritura',
          description: 'Aprendo mejor leyendo textos y tomando notas',
        },
        {
          value: 'kinestesico' as EstiloAprendizaje,
          emoji: '🤲',
          title: 'Kinestésico',
          description: 'Aprendo mejor haciendo y practicando',
        },
        {
          value: 'mixto' as EstiloAprendizaje,
          emoji: '🌈',
          title: 'Mixto',
          description: 'Me adapto a diferentes estilos según el tema',
        },
      ].map((opcion) => (
        <TouchableOpacity
          key={opcion.value}
          style={[
            styles.optionCard,
            perfil.estilo_primario === opcion.value && styles.optionCardSelected,
          ]}
          onPress={() => setPerfil({ ...perfil, estilo_primario: opcion.value })}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.optionEmoji}>{opcion.emoji}</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.optionTitle}>
            {opcion.title}
          </ThemedText>
          <ThemedText style={styles.optionDescription}>
            {opcion.description}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </ThemedView>
  );

  // Paso 2: Preferencias de contenido
  const renderStep2 = () => (
    <ThemedView style={styles.stepContent}>
      <ThemedText type="title" style={styles.stepTitle}>
        ¿Qué prefieres en el contenido?
      </ThemedText>
      <ThemedText style={styles.stepSubtitle}>
        Selecciona lo que te ayuda a entender mejor
      </ThemedText>

      {[
        {
          key: 'prefiere_ejemplos' as keyof PerfilAprendizajeInput,
          title: 'Ejemplos prácticos',
          description: 'Me gusta ver ejemplos concretos de cómo se aplica',
        },
        {
          key: 'prefiere_diagramas' as keyof PerfilAprendizajeInput,
          title: 'Diagramas y gráficos',
          description: 'Me ayudan las representaciones visuales',
        },
        {
          key: 'prefiere_analogias' as keyof PerfilAprendizajeInput,
          title: 'Analogías',
          description: 'Me gusta cuando comparan con cosas que conozco',
        },
        {
          key: 'prefiere_casos_reales' as keyof PerfilAprendizajeInput,
          title: 'Casos reales',
          description: 'Prefiero ver cómo se usa en situaciones reales',
        },
      ].map((opcion) => (
        <TouchableOpacity
          key={opcion.key}
          style={[
            styles.checkboxCard,
            perfil[opcion.key] && styles.checkboxCardSelected,
          ]}
          onPress={() =>
            setPerfil({
              ...perfil,
              [opcion.key]: !perfil[opcion.key],
            })
          }
          activeOpacity={0.7}
        >
          <ThemedView style={[
            styles.checkbox,
            perfil[opcion.key] && styles.checkboxSelected
          ]}>
            {perfil[opcion.key] && (
              <ThemedText style={styles.checkboxCheck}>✓</ThemedText>
            )}
          </ThemedView>
          <ThemedView style={styles.checkboxContent}>
            <ThemedText type="defaultSemiBold" style={styles.checkboxTitle}>
              {opcion.title}
            </ThemedText>
            <ThemedText style={styles.checkboxDescription}>
              {opcion.description}
            </ThemedText>
          </ThemedView>
        </TouchableOpacity>
      ))}
    </ThemedView>
  );

  // Paso 3: Nivel de profundidad y velocidad
  const renderStep3 = () => (
    <ThemedView style={styles.stepContent}>
      <ThemedText type="title" style={styles.stepTitle}>
        ¿Cómo prefieres que te expliquen?
      </ThemedText>
      <ThemedText style={styles.stepSubtitle}>
        Esto nos ayuda a ajustar el nivel de detalle
      </ThemedText>

      <ThemedView style={styles.section}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Nivel de profundidad
        </ThemedText>
        <ThemedView style={styles.gridContainer}>
          {[
            { value: 'basico' as NivelProfundidad, emoji: '📚', title: 'Básico' },
            { value: 'medio' as NivelProfundidad, emoji: '📖', title: 'Medio' },
            { value: 'avanzado' as NivelProfundidad, emoji: '🎓', title: 'Avanzado' },
          ].map((opcion) => (
            <TouchableOpacity
              key={opcion.value}
              style={[
                styles.gridCard,
                perfil.nivel_profundidad === opcion.value && styles.gridCardSelected,
              ]}
              onPress={() => setPerfil({ ...perfil, nivel_profundidad: opcion.value })}
              activeOpacity={0.7}
            >
              <ThemedView style={styles.radioIndicator}>
                {perfil.nivel_profundidad === opcion.value && (
                  <ThemedView style={styles.radioIndicatorSelected} />
                )}
              </ThemedView>
              <ThemedText style={styles.gridEmoji}>{opcion.emoji}</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.gridTitle}>
                {opcion.title}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          Velocidad de aprendizaje
        </ThemedText>
        <ThemedView style={styles.gridContainer}>
          {[
            { value: 'lento' as VelocidadAprendizaje, emoji: '🐢', title: 'Lento' },
            { value: 'normal' as VelocidadAprendizaje, emoji: '🚶', title: 'Normal' },
            { value: 'rapido' as VelocidadAprendizaje, emoji: '🚀', title: 'Rápido' },
          ].map((opcion) => (
            <TouchableOpacity
              key={opcion.value}
              style={[
                styles.gridCard,
                perfil.velocidad_aprendizaje === opcion.value && styles.gridCardSelected,
              ]}
              onPress={() => setPerfil({ ...perfil, velocidad_aprendizaje: opcion.value })}
              activeOpacity={0.7}
            >
              <ThemedView style={styles.radioIndicator}>
                {perfil.velocidad_aprendizaje === opcion.value && (
                  <ThemedView style={styles.radioIndicatorSelected} />
                )}
              </ThemedView>
              <ThemedText style={styles.gridEmoji}>{opcion.emoji}</ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.gridTitle}>
                {opcion.title}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );

  // Paso 4: Estructura y organización
  const renderStep4 = () => (
    <ThemedView style={styles.stepContent}>
      <ThemedText type="title" style={styles.stepTitle}>
        ¿Cómo prefieres que esté organizado?
      </ThemedText>
      <ThemedText style={styles.stepSubtitle}>
        Selecciona cómo te gusta recibir la información
      </ThemedText>

      {[
        {
          key: 'prefiere_pasos_ordenados' as keyof PerfilAprendizajeInput,
          title: 'Pasos ordenados',
          description: 'Me gusta seguir una secuencia paso a paso',
        },
        {
          key: 'prefiere_conceptos_globales' as keyof PerfilAprendizajeInput,
          title: 'Vista general primero',
          description: 'Prefiero ver el panorama completo antes de detalles',
        },
        {
          key: 'prefiere_resumenes' as keyof PerfilAprendizajeInput,
          title: 'Resúmenes',
          description: 'Me ayudan los resúmenes al final de cada sección',
        },
      ].map((opcion) => (
        <TouchableOpacity
          key={opcion.key}
          style={[
            styles.checkboxCard,
            perfil[opcion.key] && styles.checkboxCardSelected,
          ]}
          onPress={() =>
            setPerfil({
              ...perfil,
              [opcion.key]: !perfil[opcion.key],
            })
          }
          activeOpacity={0.7}
        >
          <ThemedView style={[
            styles.checkbox,
            perfil[opcion.key] && styles.checkboxSelected
          ]}>
            {perfil[opcion.key] && (
              <ThemedText style={styles.checkboxCheck}>✓</ThemedText>
            )}
          </ThemedView>
          <ThemedView style={styles.checkboxContent}>
            <ThemedText type="defaultSemiBold" style={styles.checkboxTitle}>
              {opcion.title}
            </ThemedText>
            <ThemedText style={styles.checkboxDescription}>
              {opcion.description}
            </ThemedText>
          </ThemedView>
        </TouchableOpacity>
      ))}
    </ThemedView>
  );

  // Paso 5: Lenguaje
  const renderStep5 = () => (
    <ThemedView style={styles.stepContent}>
      <ThemedText type="title" style={styles.stepTitle}>
        ¿Qué tipo de lenguaje prefieres?
      </ThemedText>
      <ThemedText style={styles.stepSubtitle}>
        Esto nos ayuda a adaptar cómo te explicamos
      </ThemedText>

      {[
        {
          key: 'prefiere_lenguaje_cotidiano' as keyof PerfilAprendizajeInput,
          title: 'Lenguaje cotidiano',
          description: 'Prefiero explicaciones con palabras simples y familiares',
        },
        {
          key: 'prefiere_terminos_tecnicos' as keyof PerfilAprendizajeInput,
          title: 'Términos técnicos',
          description: 'Me gusta aprender la terminología correcta',
        },
        {
          key: 'prefiere_lenguaje_formal' as keyof PerfilAprendizajeInput,
          title: 'Lenguaje formal',
          description: 'Prefiero un tono más académico y formal',
        },
      ].map((opcion) => (
        <TouchableOpacity
          key={opcion.key}
          style={[
            styles.checkboxCard,
            perfil[opcion.key] && styles.checkboxCardSelected,
          ]}
          onPress={() =>
            setPerfil({
              ...perfil,
              [opcion.key]: !perfil[opcion.key],
            })
          }
          activeOpacity={0.7}
        >
          <ThemedView style={[
            styles.checkbox,
            perfil[opcion.key] && styles.checkboxSelected
          ]}>
            {perfil[opcion.key] && (
              <ThemedText style={styles.checkboxCheck}>✓</ThemedText>
            )}
          </ThemedView>
          <ThemedView style={styles.checkboxContent}>
            <ThemedText type="defaultSemiBold" style={styles.checkboxTitle}>
              {opcion.title}
            </ThemedText>
            <ThemedText style={styles.checkboxDescription}>
              {opcion.description}
            </ThemedText>
          </ThemedView>
        </TouchableOpacity>
      ))}
    </ThemedView>
  );

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <ThemedView style={styles.content}>
        {/* Header con progreso */}
        <ThemedView style={styles.header}>
          <ThemedView style={styles.progressContainer}>
            <ThemedView style={styles.progressBar}>
              <ThemedView
                style={[
                  styles.progressFill,
                  { width: `${(step / totalSteps) * 100}%` },
                ]}
              />
            </ThemedView>
            <ThemedText style={styles.progressText}>
              Paso {step} de {totalSteps}
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
        <ThemedView style={styles.navigation}>
          {step > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <ThemedText style={styles.backButtonText}>Atrás</ThemedText>
            </TouchableOpacity>
          )}

          {step < totalSteps ? (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <ThemedText style={styles.nextButtonText}>Siguiente</ThemedText>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.finishButton, isLoading && styles.finishButtonDisabled]}
              onPress={handleFinish}
              disabled={isLoading}
            >
              <ThemedText style={styles.finishButtonText}>
                {isLoading ? 'Guardando...' : '¡Comenzar a estudiar!'}
              </ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>

        {/* Skip button */}
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <ThemedText style={styles.skipButtonText}>Omitir por ahora</ThemedText>
        </TouchableOpacity>
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 24,
  },
  stepContent: {
    padding: 8,
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
    marginBottom: 24,
  },
  section: {
    marginBottom: 32, // Más espacio entre secciones para mejor separación visual
  },
  sectionTitle: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 16, // Más espacio antes del grid
  },
  optionCard: {
    backgroundColor: '#F9FAFB',
    padding: 20, // Padding uniforme de 20px
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionCardSelected: {
    borderColor: '#8B5CF6',
    borderWidth: 3, // Borde más grueso cuando está seleccionado
    backgroundColor: '#F3E8FF',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25, // Sombra más pronunciada
    shadowRadius: 8,
    elevation: 6, // Elevación más alta en Android
  },
  optionEmoji: {
    fontSize: 40, // Aumentado de 32 a 40px
    lineHeight: 40, // Altura fija para el emoji
    marginBottom: 12, // Espacio entre emoji y título: 12px
    textAlign: 'center',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600', // Asegurar peso 600
    color: '#1A1A1A', // Color más oscuro
    lineHeight: 22, // 1.2x el fontSize (18 * 1.2 = 21.6, redondeado a 22)
    marginBottom: 6, // Espacio entre título y descripción: 6px
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666', // Color más oscuro
    lineHeight: 20, // 1.4x el fontSize (14 * 1.4 = 19.6, redondeado a 20)
    textAlign: 'center',
    marginBottom: 0, // Sin margen inferior
  },
  checkboxCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF', // Fondo blanco para todas las tarjetas
    padding: 16, // Padding uniforme de 16px
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D1D1', // Borde más oscuro para mejor definición
    marginBottom: 12,
    alignItems: 'flex-start', // Alinear checkbox con el título (arriba)
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  checkboxCardSelected: {
    borderColor: '#8B5CF6',
    borderWidth: 3, // Borde más grueso cuando está seleccionado
    backgroundColor: '#FFFFFF', // Fondo blanco también cuando está seleccionado
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25, // Sombra más pronunciada
    shadowRadius: 8,
    elevation: 6, // Elevación más alta en Android
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6, // Checkbox cuadrado con esquinas redondeadas
    borderWidth: 2,
    borderColor: '#8B5CF6',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12, // Gap de 12px entre checkbox y texto
    marginTop: 2, // Ajuste fino para alinear con la primera línea del título
  },
  checkboxSelected: {
    backgroundColor: '#8B5CF6', // Fondo morado cuando está seleccionado
  },
  checkboxCheck: {
    color: '#FFFFFF', // Checkmark blanco sobre fondo morado
    fontSize: 16, // Checkmark más grande
    fontWeight: 'bold',
    lineHeight: 16, // Asegurar centrado vertical
    textAlign: 'center',
  },
  checkboxContent: {
    flex: 1,
    paddingTop: 0, // Sin padding extra arriba
  },
  checkboxTitle: {
    fontSize: 16,
    fontWeight: '600', // Negrita para diferenciación
    color: '#1A1A1A', // Color más oscuro para el título
    marginBottom: 4, // Espacio entre título y descripción: 4px
    lineHeight: 20,
  },
  checkboxDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666666', // Color más gris para la descripción
    lineHeight: 20,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  finishButton: {
    backgroundColor: '#8B5CF6',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    marginLeft: 12,
    alignItems: 'center',
  },
  finishButtonDisabled: {
    backgroundColor: '#A78BFA',
  },
  finishButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    alignItems: 'center',
    padding: 12,
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 14,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8, // Gap de 8px entre tarjetas
  },
  gridCard: {
    flex: 1, // Cada tarjeta ocupa 1/3 del espacio
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D1D1',
    alignItems: 'center',
    minHeight: 100, // Altura mínima compacta
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  gridCardSelected: {
    borderColor: '#8B5CF6',
    borderWidth: 3,
    backgroundColor: '#FFFFFF',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  radioIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioIndicatorSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8B5CF6',
  },
  gridEmoji: {
    fontSize: 32,
    lineHeight: 32,
    marginBottom: 8,
    textAlign: 'center',
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
});
