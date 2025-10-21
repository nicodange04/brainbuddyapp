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

export default function DisponibilidadScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadData[]>([]);
  const [loading, setLoading] = useState(false);

  // Debug: Verificar estado de autenticación
  useEffect(() => {
    console.log('DisponibilidadScreen - User:', user);
    console.log('DisponibilidadScreen - User ID:', user?.id);
    console.log('DisponibilidadScreen - User keys:', user ? Object.keys(user) : 'No user');
    initializeDisponibilidad();
  }, [user]);

  const initializeDisponibilidad = () => {
    const initialData = DIAS_SEMANA.map(dia => ({
      diaSemana: dia,
      turnos: []
    }));
    setDisponibilidad(initialData);
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
      // Eliminar disponibilidad existente del usuario
      await supabase
        .from('disponibilidad')
        .delete()
        .eq('alumno_id', user.usuario.usuario_id);

      // Insertar nueva disponibilidad
      const disponibilidadToInsert = disponibilidad
        .filter(dia => dia.turnos.length > 0)
        .flatMap(dia => 
          dia.turnos.map(turno => ({
            alumno_id: user.usuario.usuario_id,
            dia_semana: getDiaSemanaNumber(dia.diaSemana),
            turno: turno
          }))
        );

      console.log('Datos a insertar:', disponibilidadToInsert); // Debug

      if (disponibilidadToInsert.length > 0) {
        const { error } = await supabase
          .from('disponibilidad')
          .insert(disponibilidadToInsert);

        if (error) throw error;
      }

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

    } catch (error) {
      console.error('Error al guardar disponibilidad:', error);
      Alert.alert('Error', 'No se pudo guardar la disponibilidad. Inténtalo de nuevo.');
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
        disabled={!disponibilidad[diaIndex]?.turnos.length}
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
});
