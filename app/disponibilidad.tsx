import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/services/supabase';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface DisponibilidadData {
  diaSemana: string;
  turnos: string[];
}

const DIAS_SEMANA = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
];

const TURNOS = ['Mañana', 'Tarde', 'Noche'];

// Función para convertir día de la semana a número (0=Domingo, 1=Lunes, etc.)
const getDiaSemanaNumber = (diaSemana: string): number => {
  const diasMap: { [key: string]: number } = {
    'Domingo': 0,
    'Lunes': 1,
    'Martes': 2,
    'Miércoles': 3,
    'Jueves': 4,
    'Viernes': 5,
    'Sábado': 6
  };
  return diasMap[diaSemana] || 1; // Default a Lunes si no encuentra
};

// Función para convertir número de día de la semana a nombre
const getDiaSemanaName = (diaSemanaNumber: number): string => {
  const diasMap: { [key: number]: string } = {
    0: 'Domingo',
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado'
  };
  return diasMap[diaSemanaNumber] || 'Lunes';
};

export default function DisponibilidadScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadData[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Cargar disponibilidad existente cuando se monta el componente
  useEffect(() => {
    if (user?.usuario?.usuario_id) {
      cargarDisponibilidadExistente();
    } else {
      initializeDisponibilidad();
    }
  }, [user]);

  const initializeDisponibilidad = () => {
    const initialData = DIAS_SEMANA.map(dia => ({
      diaSemana: dia,
      turnos: []
    }));
    setDisponibilidad(initialData);
    setLoadingData(false);
  };

  const cargarDisponibilidadExistente = async () => {
    if (!user?.usuario?.usuario_id) {
      initializeDisponibilidad();
      return;
    }

    setLoadingData(true);
    try {
      console.log('📥 Cargando disponibilidad existente para usuario:', user.usuario.usuario_id);
      
      const { data, error } = await supabase
        .from('disponibilidad')
        .select('dia_semana, turno')
        .eq('alumno_id', user.usuario.usuario_id)
        .order('dia_semana', { ascending: true });

      if (error) {
        console.error('❌ Error al cargar disponibilidad:', error);
        Alert.alert('Error', 'No se pudo cargar la disponibilidad existente');
        initializeDisponibilidad();
        return;
      }

      console.log('✅ Disponibilidad existente cargada:', data?.length || 0, 'registros');
      console.log('📋 Datos cargados:', JSON.stringify(data, null, 2));

      // Inicializar con todos los días vacíos
      const initialData = DIAS_SEMANA.map(dia => ({
        diaSemana: dia,
        turnos: [] as string[]
      }));

      // Mapear los datos de la BD a la estructura de la UI
      if (data && data.length > 0) {
        data.forEach((registro: { dia_semana: number; turno: string }) => {
          const diaNombre = getDiaSemanaName(registro.dia_semana);
          const diaIndex = DIAS_SEMANA.indexOf(diaNombre);
          
          if (diaIndex !== -1 && !initialData[diaIndex].turnos.includes(registro.turno)) {
            initialData[diaIndex].turnos.push(registro.turno);
          }
        });
      }

      console.log('📊 Disponibilidad mapeada:', JSON.stringify(initialData, null, 2));
      setDisponibilidad(initialData);
    } catch (error) {
      console.error('❌ Error inesperado al cargar disponibilidad:', error);
      initializeDisponibilidad();
    } finally {
      setLoadingData(false);
    }
  };

  const toggleDia = (diaIndex: number) => {
    setDisponibilidad(prev => {
      const newData = [...prev];
      if (newData[diaIndex].turnos.length > 0) {
        // Si tiene turnos, desactivar día completo
        newData[diaIndex].turnos = [];
      } else {
        // Si no tiene turnos, activar con todos los turnos
        newData[diaIndex].turnos = [...TURNOS];
      }
      return newData;
    });
  };

  // Método alternativo usando UPSERT directo en Supabase
  const guardarDisponibilidadAlternativo = async (disponibilidadToInsert: any[]) => {
    console.log('🔄 Usando método UPSERT directo...');
    
    // Primero eliminar todos los registros del usuario con múltiples intentos
    console.log('🗑️ Eliminando registros existentes...');
    
    for (let intento = 0; intento < 3; intento++) {
      const { error: deleteError } = await supabase
        .from('disponibilidad')
        .delete()
        .eq('alumno_id', user.usuario.usuario_id);

      if (deleteError) {
        console.error(`⚠️ Error en eliminación intento ${intento + 1}:`, deleteError);
      }
      
      // Esperar entre intentos
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Esperar un poco más antes de insertar
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Insertar usando UPSERT manual (insertar uno por uno con manejo de conflictos)
    console.log('📥 Insertando disponibilidad con UPSERT...');
    
    for (const item of disponibilidadToInsert) {
      // Primero intentar eliminar el registro específico si existe
      await supabase
        .from('disponibilidad')
        .delete()
        .eq('alumno_id', item.alumno_id)
        .eq('dia_semana', item.dia_semana)
        .eq('turno', item.turno);

      // Luego insertar
      const { error: insertError } = await supabase
        .from('disponibilidad')
        .insert([item]);

      if (insertError && insertError.code !== '23505') {
        console.error('❌ Error al insertar:', insertError);
        throw insertError;
      }
    }

    console.log('✅ Disponibilidad guardada con método UPSERT');
  };

  const toggleTurno = (diaIndex: number, turno: string) => {
    setDisponibilidad(prev => {
      const newData = [...prev];
      const turnos = newData[diaIndex].turnos;
      
      if (turnos.includes(turno)) {
        // Remover turno
        newData[diaIndex].turnos = turnos.filter(t => t !== turno);
      } else {
        // Agregar turno
        newData[diaIndex].turnos = [...turnos, turno];
      }
      return newData;
    });
  };

  const handleSave = async () => {
    // Validar que al menos un día tenga turnos
    const hasAnyAvailability = disponibilidad.some(dia => dia.turnos.length > 0);
    
    if (!hasAnyAvailability) {
      Alert.alert(
        'Disponibilidad requerida',
        'Debes seleccionar al menos un día y turno para estudiar.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    if (!user || !user.usuario?.usuario_id) {
      Alert.alert('Error', 'No hay usuario autenticado o ID de usuario inválido');
      return;
    }

    console.log('User ID:', user.usuario.usuario_id); // Debug

    setLoading(true);

    try {
      // Preparar datos a insertar
      const disponibilidadToInsert = disponibilidad
        .filter(dia => dia.turnos.length > 0)
        .flatMap(dia => 
          dia.turnos.map(turno => ({
            alumno_id: user.usuario.usuario_id,
            dia_semana: getDiaSemanaNumber(dia.diaSemana),
            turno: turno
          }))
        );

      // ELIMINAR DUPLICADOS antes de enviar
      const disponibilidadSinDuplicados = disponibilidadToInsert.filter((item, index, self) => 
        index === self.findIndex((t) => (
          t.dia_semana === item.dia_semana && 
          t.turno === item.turno
        ))
      );

      console.log('📊 Datos ANTES de eliminar duplicados:', disponibilidadToInsert.length, 'registros');
      console.log('📊 Datos DESPUÉS de eliminar duplicados:', disponibilidadSinDuplicados.length, 'registros');
      console.log('📋 Detalle de datos:', JSON.stringify(disponibilidadSinDuplicados, null, 2));

      if (disponibilidadSinDuplicados.length === 0) {
        Alert.alert('Error', 'No hay disponibilidad para guardar');
        setLoading(false);
        return;
      }

      // SOLUCIÓN ROBUSTA: Usar función almacenada que hace todo en una transacción
      // Preparar datos en formato JSON para la función
      const disponibilidadJSON = disponibilidadSinDuplicados.map(item => ({
        dia_semana: item.dia_semana,
        turno: item.turno
      }));

      console.log('🔄 Llamando función almacenada para actualizar disponibilidad...');
      console.log('📊 Datos a procesar:', JSON.stringify(disponibilidadJSON, null, 2));

      // Llamar a la función almacenada
      console.log('🔄 Intentando usar función almacenada...');
      console.log('📋 Parámetros:', {
        p_alumno_id: user.usuario.usuario_id,
        p_disponibilidad: disponibilidadJSON
      });

      const { data: resultado, error: funcionError } = await supabase
        .rpc('actualizar_disponibilidad', {
          p_alumno_id: user.usuario.usuario_id,
          p_disponibilidad: disponibilidadJSON
        });

      if (funcionError) {
        console.error('❌ Error al llamar función almacenada:', funcionError);
        console.error('📋 Detalles del error:', JSON.stringify(funcionError, null, 2));
        
        // Si hay cualquier error con la función, usar método alternativo
        console.log('⚠️ Usando método alternativo por error en función...');
        await guardarDisponibilidadAlternativo(disponibilidadSinDuplicados);
        
        // Si llegamos aquí, el método alternativo funcionó
        Alert.alert(
          '¡Perfecto!',
          'Tu disponibilidad horaria ha sido guardada.',
          [
            {
              text: 'Continuar',
              onPress: () => router.back()
            }
          ]
        );
        return;
      }

      console.log('📋 Respuesta de la función:', resultado);

      if (!resultado || resultado.length === 0) {
        console.warn('⚠️ No se recibió respuesta de la función, usando método alternativo...');
        await guardarDisponibilidadAlternativo(disponibilidadSinDuplicados);
        
        Alert.alert(
          '¡Perfecto!',
          'Tu disponibilidad horaria ha sido guardada.',
          [
            {
              text: 'Continuar',
              onPress: () => router.back()
            }
          ]
        );
        return;
      }

      const resultadoFuncion = resultado[0];
      console.log('📋 Resultado de la función:', resultadoFuncion);

      if (!resultadoFuncion || resultadoFuncion.success === false) {
        console.warn('⚠️ La función retornó error, usando método alternativo...');
        await guardarDisponibilidadAlternativo(disponibilidadSinDuplicados);
        
        Alert.alert(
          '¡Perfecto!',
          'Tu disponibilidad horaria ha sido guardada.',
          [
            {
              text: 'Continuar',
              onPress: () => router.back()
            }
          ]
        );
        return;
      }

      console.log('✅ Disponibilidad actualizada correctamente con función almacenada');
      console.log('📊 Registros insertados:', resultadoFuncion.registros_insertados);

      Alert.alert(
        '¡Perfecto!',
        'Tu disponibilidad horaria ha sido guardada.',
        [
          {
            text: 'Continuar',
            onPress: () => router.back()
          }
        ]
      );

    } catch (error: any) {
      console.error('❌ Error al guardar disponibilidad:', error);
      
      // Mensaje de error más específico
      let errorMessage = 'No se pudo guardar la disponibilidad. Inténtalo de nuevo.';
      
      if (error?.code === '23505') {
        errorMessage = 'Ya existe una disponibilidad con estos valores. Por favor, intenta nuevamente después de un momento.';
        console.error('⚠️ Error de duplicado detectado. Intentando eliminar registros nuevamente...');
        
        // Intentar eliminar nuevamente como solución temporal
        try {
          await supabase
            .from('disponibilidad')
            .delete()
            .eq('alumno_id', user.usuario.usuario_id);
          console.log('✅ Regeneración de disponibilidad completada');
        } catch (retryError) {
          console.error('❌ Error al reintentar eliminación:', retryError);
        }
      } else if (error?.message) {
        errorMessage = `Error: ${error.message}`;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderTurnoButton = (diaIndex: number, turno: string) => {
    const isSelected = disponibilidad[diaIndex]?.turnos.includes(turno) || false;
    
    return (
      <TouchableOpacity
        key={turno}
        style={[
          styles.turnoButton,
          isSelected && styles.turnoButtonSelected
        ]}
        onPress={() => toggleTurno(diaIndex, turno)}
        disabled={false}
      >
        <Text style={[
          styles.turnoButtonText,
          isSelected && styles.turnoButtonTextSelected
        ]}>
          {turno}
        </Text>
      </TouchableOpacity>
    );
  };

  // Si no hay usuario, mostrar mensaje
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Configurar Disponibilidad</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            No hay usuario autenticado. Por favor, inicia sesión primero.
          </Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Ir a Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Configurar Disponibilidad</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>¿Cuándo podés estudiar?</Text>
        
        {loadingData ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Cargando disponibilidad...</Text>
          </View>
        ) : (
          <View style={styles.diasContainer}>
          {DIAS_SEMANA.map((dia, index) => {
            const isDiaSelected = disponibilidad[index]?.turnos.length > 0;
            
            return (
              <View key={dia} style={styles.diaRow}>
                <TouchableOpacity
                  style={[
                    styles.diaButton,
                    isDiaSelected && styles.diaButtonSelected
                  ]}
                  onPress={() => toggleDia(index)}
                >
                  <Text style={[
                    styles.diaButtonText,
                    isDiaSelected && styles.diaButtonTextSelected
                  ]}>
                    {isDiaSelected ? '☑️' : '☐'} {dia}
                  </Text>
                </TouchableOpacity>
                
                <View style={styles.turnosContainer}>
                  {TURNOS.map(turno => renderTurnoButton(index, turno))}
                </View>
              </View>
            );
          })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Guardando...' : 'Guardar Disponibilidad'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#8B5CF6',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 24,
    textAlign: 'center',
  },
  diasContainer: {
    gap: 16,
  },
  diaRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  diaButton: {
    marginBottom: 12,
  },
  diaButtonSelected: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
  },
  diaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  diaButtonTextSelected: {
    color: '#8B5CF6',
  },
  turnosContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  turnoButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  turnoButtonSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  turnoButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  turnoButtonTextSelected: {
    color: '#FFFFFF',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
