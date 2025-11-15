// app/sesion-estudio.tsx
// Pantalla completa de sesión de estudio con 3 fases: Teoría, Descanso, Quiz

import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSesionEstudioCompleta, marcarSesionCompletada, SesionEstudioCompleta } from '@/services/sesionEstudio';
import { ContenidoTeorico, PreguntaQuiz } from '@/services/openai';

// Design System Colors (from design.json)
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
  accent: {
    orange: '#FB923C',
    orangeLight: '#FDBA74',
    peach: '#FED7AA',
    coral: '#FCA5A5',
  },
  neutral: {
    black: '#1F2937',
    darkGray: '#374151',
    mediumGray: '#6B7280',
    lightGray: '#E5E7EB',
    backgroundBeige: '#FFEFD5',
  },
  supporting: {
    blue: '#60A5FA',
    blueLight: '#93C5FD',
    yellow: '#FCD34D',
    green: '#34D399',
    pink: '#F472B6',
    red: '#EF4444',
  },
};

type Fase = 'intro' | 'teoria' | 'descanso' | 'quiz' | 'resultados';

interface RespuestaQuiz {
  preguntaIndex: number;
  respuestaSeleccionada: number;
  esCorrecta: boolean;
  tiempoRespuesta: number; // en segundos
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SesionEstudioScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ sesionId: string }>();
  const sesionId = params.sesionId;

  // Estados principales
  const [sesion, setSesion] = useState<SesionEstudioCompleta | null>(null);
  const [loading, setLoading] = useState(true);
  const [faseActual, setFaseActual] = useState<Fase>('intro');
  
  // Estados para Fase 1: Teoría
  const [indiceSeccionActual, setIndiceSeccionActual] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Estados para Fase 2: Descanso
  const [tiempoDescanso, setTiempoDescanso] = useState(5 * 60); // 5 minutos en segundos
  const [descansoActivo, setDescansoActivo] = useState(false);
  
  // Estados para Fase 3: Quiz
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [vidas, setVidas] = useState(3);
  const [puntos, setPuntos] = useState(0);
  const [racha, setRacha] = useState(0);
  const [rachaMaxima, setRachaMaxima] = useState(0);
  const [respuestas, setRespuestas] = useState<RespuestaQuiz[]>([]);
  const [tiempoInicioPregunta, setTiempoInicioPregunta] = useState<number | null>(null);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<number | null>(null);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [esCorrecta, setEsCorrecta] = useState(false);

  // Cargar datos de la sesión
  useEffect(() => {
    if (!sesionId) {
      Alert.alert('Error', 'No se encontró la sesión');
      router.back();
      return;
    }

    const cargarSesion = async () => {
      setLoading(true);
      try {
        const datos = await getSesionEstudioCompleta(sesionId);
        if (!datos) {
          Alert.alert('Error', 'No se pudo cargar la sesión');
          router.back();
          return;
        }

        // Verificar que el material esté listo
        if (datos.material_estado !== 'listo' || !datos.material_generado || !datos.quiz) {
          Alert.alert(
            'Material no disponible',
            'El material de esta sesión aún se está generando. Por favor, intenta más tarde.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
          return;
        }

        setSesion(datos);
      } catch (error) {
        console.error('Error al cargar sesión:', error);
        Alert.alert('Error', 'No se pudo cargar la sesión');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    cargarSesion();
  }, [sesionId]);

  // Timer para descanso
  useEffect(() => {
    if (descansoActivo && tiempoDescanso > 0) {
      const timer = setTimeout(() => {
        setTiempoDescanso(tiempoDescanso - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (descansoActivo && tiempoDescanso === 0) {
      setDescansoActivo(false);
      setFaseActual('quiz');
    }
  }, [descansoActivo, tiempoDescanso]);

  // Inicializar tiempo de pregunta cuando cambia
  useEffect(() => {
    if (faseActual === 'quiz' && sesion?.quiz) {
      setTiempoInicioPregunta(Date.now());
      setRespuestaSeleccionada(null);
      setMostrarFeedback(false);
    }
  }, [preguntaActual, faseActual]);

  // Formatear tiempo (mm:ss)
  const formatearTiempo = (segundos: number): string => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Navegación entre secciones de teoría
  const irASiguienteSeccion = () => {
    if (!sesion?.material_generado) return;
    const totalSecciones = sesion.material_generado.secciones.length;
    if (indiceSeccionActual < totalSecciones - 1) {
      setIndiceSeccionActual(indiceSeccionActual + 1);
      scrollViewRef.current?.scrollTo({ x: (indiceSeccionActual + 1) * SCREEN_WIDTH, animated: true });
    } else {
      // Terminar fase de teoría
      setFaseActual('descanso');
      setDescansoActivo(true);
    }
  };

  const irAPreviaSeccion = () => {
    if (indiceSeccionActual > 0) {
      setIndiceSeccionActual(indiceSeccionActual - 1);
      scrollViewRef.current?.scrollTo({ x: (indiceSeccionActual - 1) * SCREEN_WIDTH, animated: true });
    }
  };

  // Saltar descanso
  const saltarDescanso = () => {
    setDescansoActivo(false);
    setFaseActual('quiz');
  };

  // Manejar respuesta del quiz
  const seleccionarRespuesta = (indice: number) => {
    if (mostrarFeedback || !sesion?.quiz) return;

    const pregunta = sesion.quiz.preguntas[preguntaActual];
    const esCorrectaRespuesta = indice === pregunta.respuesta_correcta;
    const tiempoRespuesta = tiempoInicioPregunta ? Math.floor((Date.now() - tiempoInicioPregunta) / 1000) : 0;

    setRespuestaSeleccionada(indice);
    setEsCorrecta(esCorrectaRespuesta);
    setMostrarFeedback(true);

    // Guardar respuesta
    const nuevaRespuesta: RespuestaQuiz = {
      preguntaIndex: preguntaActual,
      respuestaSeleccionada: indice,
      esCorrecta: esCorrectaRespuesta,
      tiempoRespuesta,
    };
    setRespuestas([...respuestas, nuevaRespuesta]);

    if (esCorrectaRespuesta) {
      // Respuesta correcta
      setPuntos(puntos + 10);
      const nuevaRacha = racha + 1;
      setRacha(nuevaRacha);
      if (nuevaRacha > rachaMaxima) {
        setRachaMaxima(nuevaRacha);
      }
    } else {
      // Respuesta incorrecta
      setVidas(vidas - 1);
      setRacha(0);
    }

    // Avanzar después de 2 segundos
    setTimeout(() => {
      if (preguntaActual < sesion.quiz.preguntas.length - 1) {
        setPreguntaActual(preguntaActual + 1);
        setMostrarFeedback(false);
        setRespuestaSeleccionada(null);
      } else {
        // Terminar quiz
        finalizarQuiz();
      }
    }, 2000);
  };

  // Finalizar quiz
  const finalizarQuiz = async () => {
    if (!sesion) return;

    // Verificar si aprobó (tiene al menos 1 vida)
    const aprobado = vidas > 0;
    const puntajeFinal = puntos;

    // Marcar sesión como completada
    await marcarSesionCompletada(sesion.sesion_id, puntajeFinal, vidas);

    setFaseActual('resultados');
  };

  // Renderizar pantalla de carga
  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Cargando sesión...</Text>
      </View>
    );
  }

  if (!sesion) {
    return null;
  }

  // FASE: INTRO
  if (faseActual === 'intro') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.introContent}>
          <View style={styles.introCard}>
            <Text style={styles.introEmoji}>📚</Text>
            <Text style={styles.introTitle}>¡Vamos a estudiar!</Text>
            <Text style={styles.introSubtitle}>{sesion.tema}</Text>
            
            <View style={styles.introInfo}>
              <View style={styles.introInfoRow}>
                <Text style={styles.introInfoLabel}>📖 Materia:</Text>
                <Text style={styles.introInfoValue}>{sesion.examen_materia}</Text>
              </View>
              <View style={styles.introInfoRow}>
                <Text style={styles.introInfoLabel}>📝 Examen:</Text>
                <Text style={styles.introInfoValue}>{sesion.examen_nombre}</Text>
              </View>
            </View>

            <View style={styles.introPhases}>
              <View style={styles.introPhaseCard}>
                <Text style={styles.introPhaseNumber}>1</Text>
                <Text style={styles.introPhaseTitle}>Teoría</Text>
                <Text style={styles.introPhaseTime}>30 min</Text>
              </View>
              <View style={styles.introPhaseCard}>
                <Text style={styles.introPhaseNumber}>2</Text>
                <Text style={styles.introPhaseTitle}>Descanso</Text>
                <Text style={styles.introPhaseTime}>5 min</Text>
              </View>
              <View style={styles.introPhaseCard}>
                <Text style={styles.introPhaseNumber}>3</Text>
                <Text style={styles.introPhaseTitle}>Quiz</Text>
                <Text style={styles.introPhaseTime}>10 min</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setFaseActual('teoria')}
            >
              <Text style={styles.primaryButtonText}>Comenzar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // FASE 1: TEORÍA
  if (faseActual === 'teoria') {
    const secciones = sesion.material_generado?.secciones || [];
    const seccionActual = secciones[indiceSeccionActual];

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header con progreso */}
        <View style={styles.teoriaHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Atrás</Text>
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Sección {indiceSeccionActual + 1} de {secciones.length}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((indiceSeccionActual + 1) / secciones.length) * 100}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Carousel de secciones */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEnabled={false}
          style={styles.teoriaScrollView}
        >
          {secciones.map((seccion, index) => (
            <View key={index} style={[styles.teoriaCardContainer, { width: SCREEN_WIDTH }]}>
              <ScrollView contentContainerStyle={styles.teoriaCardContent}>
                <View style={styles.teoriaCard}>
                  <Text style={styles.teoriaCardTitle}>{seccion.titulo}</Text>
                  <Text style={styles.teoriaCardText}>{seccion.contenido}</Text>
                  {seccion.tip && (
                    <View style={styles.tipContainer}>
                      <Text style={styles.tipLabel}>💡 Tip</Text>
                      <Text style={styles.tipText}>{seccion.tip}</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          ))}
        </ScrollView>

        {/* Navegación */}
        <View style={styles.teoriaNavigation}>
          <TouchableOpacity
            style={[styles.navButton, indiceSeccionActual === 0 && styles.navButtonDisabled]}
            onPress={irAPreviaSeccion}
            disabled={indiceSeccionActual === 0}
          >
            <Text style={styles.navButtonText}>← Anterior</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={irASiguienteSeccion}>
            <Text style={styles.primaryButtonText}>
              {indiceSeccionActual === secciones.length - 1 ? 'Finalizar teoría' : 'Siguiente →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // FASE 2: DESCANSO
  if (faseActual === 'descanso') {
    return (
      <View style={[styles.container, styles.descansoContainer, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.descansoContent}>
          <View style={styles.descansoCard}>
            <Text style={styles.descansoEmoji}>☕</Text>
            <Text style={styles.descansoTitle}>¡Tómate un descanso!</Text>
            <Text style={styles.descansoTimer}>{formatearTiempo(tiempoDescanso)}</Text>

            <View style={styles.descansoTips}>
              <Text style={styles.descansoTip}>💧 Tomá agua</Text>
              <Text style={styles.descansoTip}>🚶 Estirá las piernas</Text>
              <Text style={styles.descansoTip}>👀 Descansá la vista</Text>
            </View>

            <TouchableOpacity style={styles.secondaryButton} onPress={saltarDescanso}>
              <Text style={styles.secondaryButtonText}>Saltar descanso</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // FASE 3: QUIZ
  if (faseActual === 'quiz') {
    const pregunta = sesion.quiz?.preguntas[preguntaActual];
    if (!pregunta) return null;

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* HUD del Quiz */}
        <View style={styles.quizHUD}>
          <View style={styles.quizHUDItem}>
            <Text style={styles.quizHUDLabel}>Vidas</Text>
            <View style={styles.vidasContainer}>
              {[0, 1, 2].map((i) => (
                <Text key={i} style={styles.vidaIcon}>
                  {i < vidas ? '❤️' : '🤍'}
                </Text>
              ))}
            </View>
          </View>
          <View style={styles.quizHUDItem}>
            <Text style={styles.quizHUDLabel}>Pregunta</Text>
            <Text style={styles.quizHUDValue}>
              {preguntaActual + 1}/{sesion.quiz.preguntas.length}
            </Text>
          </View>
          <View style={styles.quizHUDItem}>
            <Text style={styles.quizHUDLabel}>Puntos</Text>
            <Text style={styles.quizHUDValue}>{puntos}</Text>
          </View>
          {racha > 0 && (
            <View style={styles.quizHUDItem}>
              <Text style={styles.rachaText}>🔥 {racha}</Text>
            </View>
          )}
        </View>

        {/* Pregunta */}
        <ScrollView contentContainerStyle={styles.quizContent}>
          <View style={styles.quizCard}>
            <Text style={styles.quizPregunta}>{pregunta.pregunta}</Text>

            {/* Opciones */}
            <View style={styles.opcionesContainer}>
              {pregunta.opciones.map((opcion, index) => {
                const estaSeleccionada = respuestaSeleccionada === index;
                const esCorrectaOpcion = index === pregunta.respuesta_correcta;
                let estiloOpcion = styles.opcionButton;

                if (mostrarFeedback) {
                  if (esCorrectaOpcion) {
                    estiloOpcion = styles.opcionButtonCorrecta;
                  } else if (estaSeleccionada && !esCorrecta) {
                    estiloOpcion = styles.opcionButtonIncorrecta;
                  }
                }

                return (
                  <TouchableOpacity
                    key={index}
                    style={estiloOpcion}
                    onPress={() => seleccionarRespuesta(index)}
                    disabled={mostrarFeedback}
                  >
                    <Text style={styles.opcionText}>{opcion}</Text>
                    {mostrarFeedback && esCorrectaOpcion && estaSeleccionada && (
                      <Text style={styles.feedbackIcon}>✅</Text>
                    )}
                    {mostrarFeedback && estaSeleccionada && !esCorrecta && (
                      <Text style={styles.feedbackIcon}>❌</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Explicación (si se muestra feedback) */}
            {mostrarFeedback && pregunta.explicacion && (
              <View style={styles.explicacionContainer}>
                <Text style={styles.explicacionText}>{pregunta.explicacion}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Verificar si perdió todas las vidas */}
        {vidas === 0 && (
          <View style={styles.gameOverOverlay}>
            <View style={styles.gameOverCard}>
              <Text style={styles.gameOverTitle}>😔 Se acabaron las vidas</Text>
              <Text style={styles.gameOverText}>
                Puntaje final: {puntos}/{sesion.quiz.puntaje_maximo}
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  finalizarQuiz();
                }}
              >
                <Text style={styles.primaryButtonText}>Ver resultados</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  // FASE: RESULTADOS
  if (faseActual === 'resultados') {
    const aprobado = vidas > 0;
    const puntajeFinal = puntos;
    const porcentaje = Math.round((puntajeFinal / (sesion.quiz?.puntaje_maximo || 100)) * 100);
    const respuestasCorrectas = respuestas.filter((r) => r.esCorrecta).length;

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScrollView contentContainerStyle={styles.resultadosContent}>
          <View style={styles.resultadosCard}>
            <Text style={styles.resultadosEmoji}>{aprobado ? '🎉' : '😔'}</Text>
            <Text style={styles.resultadosTitle}>
              {aprobado ? '¡Quiz completado!' : 'Quiz finalizado'}
            </Text>

            <View style={styles.resultadosStats}>
              <View style={styles.resultadoStatCard}>
                <Text style={styles.resultadoStatLabel}>Puntaje</Text>
                <Text style={styles.resultadoStatValue}>
                  {puntajeFinal}/{sesion.quiz?.puntaje_maximo || 100}
                </Text>
                <Text style={styles.resultadoStatPercentage}>{porcentaje}%</Text>
              </View>

              <View style={styles.resultadoStatCard}>
                <Text style={styles.resultadoStatLabel}>Vidas restantes</Text>
                <Text style={styles.resultadoStatValue}>
                  {vidas > 0 ? '❤️'.repeat(vidas) : '0'}
                </Text>
              </View>

              <View style={styles.resultadoStatCard}>
                <Text style={styles.resultadoStatLabel}>Respuestas correctas</Text>
                <Text style={styles.resultadoStatValue}>
                  {respuestasCorrectas}/{sesion.quiz?.preguntas.length || 0}
                </Text>
              </View>

              {rachaMaxima > 0 && (
                <View style={styles.resultadoStatCard}>
                  <Text style={styles.resultadoStatLabel}>Racha máxima</Text>
                  <Text style={styles.resultadoStatValue}>🔥 {rachaMaxima}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                router.back();
              }}
            >
              <Text style={styles.primaryButtonText}>Volver al inicio</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return null;
}

// Estilos siguiendo estrictamente design.json
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignColors.secondary.offWhite,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: DesignColors.neutral.mediumGray,
    fontWeight: '500',
  },

  // INTRO
  introContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  introCard: {
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 24, // card borderRadius
    padding: 32,
    shadowColor: DesignColors.primary.violet,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    alignItems: 'center',
  },
  introEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 32, // 3xl
    fontWeight: '800', // extrabold
    color: DesignColors.neutral.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  introSubtitle: {
    fontSize: 20, // xl
    fontWeight: '600', // semibold
    color: DesignColors.neutral.darkGray,
    marginBottom: 32,
    textAlign: 'center',
  },
  introInfo: {
    width: '100%',
    marginBottom: 32,
  },
  introInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: DesignColors.neutral.lightGray,
  },
  introInfoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: DesignColors.neutral.mediumGray,
  },
  introInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignColors.neutral.black,
  },
  introPhases: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
  },
  introPhaseCard: {
    alignItems: 'center',
    backgroundColor: DesignColors.secondary.offWhite,
    borderRadius: 16, // xl
    padding: 16,
    minWidth: 80,
  },
  introPhaseNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: DesignColors.primary.violet,
    marginBottom: 4,
  },
  introPhaseTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: DesignColors.neutral.black,
    marginBottom: 4,
  },
  introPhaseTime: {
    fontSize: 12,
    fontWeight: '500',
    color: DesignColors.neutral.mediumGray,
  },

  // TEORÍA
  teoriaHeader: {
    backgroundColor: DesignColors.secondary.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DesignColors.neutral.lightGray,
  },
  backButton: {
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignColors.primary.violet,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: DesignColors.neutral.mediumGray,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: DesignColors.neutral.lightGray,
    borderRadius: 9999, // full
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: DesignColors.primary.violet,
    borderRadius: 9999,
  },
  teoriaScrollView: {
    flex: 1,
  },
  teoriaCardContainer: {
    flex: 1,
  },
  teoriaCardContent: {
    padding: 24,
    flexGrow: 1,
  },
  teoriaCard: {
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 24, // card
    padding: 24,
    shadowColor: DesignColors.primary.violet,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    minHeight: 400,
  },
  teoriaCardTitle: {
    fontSize: 24, // 2xl
    fontWeight: '700', // bold
    color: DesignColors.neutral.black,
    marginBottom: 16,
  },
  teoriaCardText: {
    fontSize: 16, // base
    fontWeight: '400', // normal
    color: DesignColors.neutral.darkGray,
    lineHeight: 24,
    marginBottom: 24,
  },
  tipContainer: {
    backgroundColor: DesignColors.supporting.yellow,
    borderRadius: 16, // xl
    padding: 16,
    marginTop: 16,
  },
  tipLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: DesignColors.neutral.black,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 15,
    fontWeight: '500',
    color: DesignColors.neutral.black,
    lineHeight: 22,
  },
  teoriaNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: DesignColors.secondary.white,
    borderTopWidth: 1,
    borderTopColor: DesignColors.neutral.lightGray,
  },
  navButton: {
    backgroundColor: DesignColors.neutral.lightGray,
    borderRadius: 9999, // button
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 120,
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignColors.neutral.black,
  },

  // DESCANSO
  descansoContainer: {
    backgroundColor: DesignColors.accent.peach,
  },
  descansoContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  descansoCard: {
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: DesignColors.primary.violet,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  descansoEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  descansoTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: DesignColors.neutral.black,
    marginBottom: 24,
    textAlign: 'center',
  },
  descansoTimer: {
    fontSize: 48,
    fontWeight: '700',
    color: DesignColors.primary.violet,
    marginBottom: 32,
  },
  descansoTips: {
    width: '100%',
    marginBottom: 32,
  },
  descansoTip: {
    fontSize: 18,
    fontWeight: '500',
    color: DesignColors.neutral.darkGray,
    marginBottom: 12,
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: DesignColors.neutral.black,
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 200,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignColors.secondary.white,
  },

  // QUIZ
  quizHUD: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: DesignColors.secondary.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: DesignColors.neutral.lightGray,
  },
  quizHUDItem: {
    alignItems: 'center',
  },
  quizHUDLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: DesignColors.neutral.mediumGray,
    marginBottom: 4,
  },
  quizHUDValue: {
    fontSize: 18,
    fontWeight: '700',
    color: DesignColors.neutral.black,
  },
  vidasContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  vidaIcon: {
    fontSize: 20,
  },
  rachaText: {
    fontSize: 18,
    fontWeight: '700',
    color: DesignColors.accent.orange,
  },
  quizContent: {
    padding: 24,
    flexGrow: 1,
  },
  quizCard: {
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: DesignColors.primary.violet,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  quizPregunta: {
    fontSize: 20, // xl
    fontWeight: '700',
    color: DesignColors.neutral.black,
    marginBottom: 24,
    lineHeight: 28,
  },
  opcionesContainer: {
    gap: 12,
  },
  opcionButton: {
    backgroundColor: DesignColors.secondary.offWhite,
    borderRadius: 16, // xl
    padding: 16,
    borderWidth: 2,
    borderColor: DesignColors.neutral.lightGray,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opcionButtonCorrecta: {
    backgroundColor: DesignColors.supporting.green,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: DesignColors.supporting.green,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opcionButtonIncorrecta: {
    backgroundColor: DesignColors.supporting.red,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: DesignColors.supporting.red,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  opcionText: {
    fontSize: 16,
    fontWeight: '500',
    color: DesignColors.neutral.black,
    flex: 1,
  },
  feedbackIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  explicacionContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: DesignColors.secondary.offWhite,
    borderRadius: 16,
  },
  explicacionText: {
    fontSize: 15,
    fontWeight: '500',
    color: DesignColors.neutral.darkGray,
    lineHeight: 22,
  },
  gameOverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  gameOverCard: {
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    minWidth: 300,
  },
  gameOverTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: DesignColors.neutral.black,
    marginBottom: 16,
    textAlign: 'center',
  },
  gameOverText: {
    fontSize: 18,
    fontWeight: '500',
    color: DesignColors.neutral.mediumGray,
    marginBottom: 24,
    textAlign: 'center',
  },

  // RESULTADOS
  resultadosContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  resultadosCard: {
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: DesignColors.primary.violet,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  resultadosEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultadosTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: DesignColors.neutral.black,
    marginBottom: 32,
    textAlign: 'center',
  },
  resultadosStats: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  resultadoStatCard: {
    backgroundColor: DesignColors.secondary.offWhite,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: DesignColors.neutral.lightGray,
  },
  resultadoStatLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: DesignColors.neutral.mediumGray,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  resultadoStatValue: {
    fontSize: 32,
    fontWeight: '800',
    color: DesignColors.neutral.black,
    marginBottom: 4,
  },
  resultadoStatPercentage: {
    fontSize: 18,
    fontWeight: '600',
    color: DesignColors.primary.violet,
  },

  // BUTTONS
  primaryButton: {
    backgroundColor: DesignColors.primary.violet,
    borderRadius: 9999, // button
    paddingVertical: 14,
    paddingHorizontal: 32,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: DesignColors.primary.violet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignColors.secondary.white,
  },
});



