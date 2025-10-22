import { useAuth } from '@/contexts/AuthContext';
import {
    DiaCalendario,
    ExamenCalendario,
    extraerTurno,
    getActividadesSemana,
    getDiasCalendario,
    obtenerColorDot,
    SesionCalendario
} from '@/services/calendar';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

interface CalendarioProps {
  onDiaSeleccionado?: (dia: DiaCalendario) => void;
}

export default function CalendarioComponent({ onDiaSeleccionado }: CalendarioProps) {
  const { user } = useAuth();
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [diasCalendario, setDiasCalendario] = useState<DiaCalendario[]>([]);
  const [actividadesSemana, setActividadesSemana] = useState<DiaCalendario[]>([]);
  const [loading, setLoading] = useState(false);

  // Función para extraer turno de exámenes (fecha DATE)
  const extraerTurnoExamen = (fecha: string): string => {
    // Para exámenes, asumimos que son por la mañana por defecto
    // En el futuro se podría agregar un campo turno específico
    return 'Mañana';
  };

  // Obtener fechas del mes actual
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  
  const fechaInicio = primerDiaMes.toISOString().split('T')[0];
  const fechaFin = ultimoDiaMes.toISOString().split('T')[0];
  
  // Obtener fecha de inicio de la semana actual (lunes)
  const primerDiaSemana = new Date(hoy);
  const diaSemana = hoy.getDay(); // 0 = Domingo, 1 = Lunes, etc.
  const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1; // Si es domingo, retroceder 6 días
  primerDiaSemana.setDate(hoy.getDate() - diasHastaLunes);
  const fechaInicioSemana = primerDiaSemana.toISOString().split('T')[0];

  // Cargar datos del calendario
  useEffect(() => {
    if (user?.usuario?.usuario_id) {
      cargarDatosCalendario();
    }
  }, [user]);

  const cargarDatosCalendario = async () => {
    if (!user?.usuario?.usuario_id) return;

    console.log('🚀 Cargando datos del calendario para usuario:', user.usuario.usuario_id);
    console.log('📅 Rango de fechas:', { fechaInicio, fechaFin });

    setLoading(true);
    try {
      const [dias, actividades] = await Promise.all([
        getDiasCalendario(user.usuario.usuario_id, fechaInicio, fechaFin),
        getActividadesSemana(user.usuario.usuario_id, fechaInicioSemana)
      ]);

      console.log('📊 Días del calendario:', dias.length);
      console.log('📋 Actividades de la semana:', actividades.length);
      console.log('🗓️ Días con actividades:', dias);
      console.log('🔍 Primer día con actividades:', dias[0]);
      console.log('🔍 Sesiones del primer día:', dias[0]?.sesiones);
      
      // Debug específico para actividades de la semana
      console.log('🔍 DEBUG ACTIVIDADES SEMANA:');
      console.log('📅 Fecha inicio semana:', fechaInicioSemana);
      console.log('📊 Actividades encontradas:', actividades);
      actividades.forEach((actividad, index) => {
        console.log(`📋 Actividad ${index}:`, {
          fecha: actividad.fecha,
          sesiones: actividad.sesiones.length,
          examenes: actividad.examenes.length,
          tieneActividades: actividad.tieneActividades
        });
      });

      setDiasCalendario(dias);
      setActividadesSemana(actividades);
    } catch (error) {
      console.error('Error al cargar datos del calendario:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del calendario');
    } finally {
      setLoading(false);
    }
  };

  // Crear objeto markedDates para el calendario
  const crearMarkedDates = () => {
    const marked: any = {};
    
    console.log('🔍 Creando marked dates con', diasCalendario.length, 'días');
    
    diasCalendario.forEach(dia => {
      const fecha = dia.fecha;
      const tieneSesiones = dia.sesiones.length > 0;
      const tieneExamenes = dia.examenes.length > 0;
      
      console.log(`📅 Procesando fecha ${fecha}:`, { tieneSesiones, tieneExamenes });
      
      // Usar marked directamente en lugar de dots
      if (tieneSesiones || tieneExamenes) {
        let color = '#8B5CF6'; // Color por defecto
        
        if (tieneSesiones) {
          color = obtenerColorDot(dia.sesiones[0].estado);
          console.log(`✅ Marcando sesión para ${fecha}:`, dia.sesiones[0].estado);
        }
        
        if (tieneExamenes) {
          color = obtenerColorDot('', true);
          console.log(`✅ Marcando examen para ${fecha}`);
        }
        
        marked[fecha] = {
          marked: true,
          dotColor: color,
          selected: fecha === fechaSeleccionada,
          selectedColor: '#8B5CF6'
        };
        
        console.log(`🎯 Marcado ${fecha} con color ${color}`);
      }
    });
    
    console.log('🗓️ Marked dates finales:', marked);
    return marked;
  };

  const onDayPress = (day: DateData) => {
    const fecha = day.dateString;
    setFechaSeleccionada(fecha);
    
    // Buscar el día seleccionado
    const diaSeleccionado = diasCalendario.find(dia => dia.fecha === fecha);
    
    if (diaSeleccionado && onDiaSeleccionado) {
      onDiaSeleccionado(diaSeleccionado);
    }
  };

  const renderSesion = (sesion: SesionCalendario) => {
    const turno = extraerTurno(sesion.observacion);
    const color = obtenerColorDot(sesion.estado);
    
    return (
      <View key={sesion.sesion_id} style={[styles.sesionCard, { borderLeftColor: color }]}>
        <Text style={styles.sesionTema}>{sesion.tema}</Text>
        <Text style={styles.sesionTurno}>🕐 {turno}</Text>
        <Text style={styles.sesionEstado}>
          {sesion.estado === 'Completada' ? '✅' : '⏳'} {sesion.estado}
        </Text>
      </View>
    );
  };

  const renderExamen = (examen: ExamenCalendario) => {
    return (
      <View key={examen.examen_id} style={[styles.examenCard, { borderLeftColor: '#EF4444' }]}>
        <Text style={styles.examenNombre}>📝 {examen.nombre}</Text>
        <Text style={styles.examenMateria}>{examen.materia}</Text>
        <Text style={styles.examenSesiones}>
          {examen.total_sesiones_planificadas} sesiones planificadas
        </Text>
      </View>
    );
  };

  const renderResumenSemana = () => {
    console.log('🔍 Renderizando resumen semanal...');
    console.log('📊 Actividades de la semana:', actividadesSemana.length);
    console.log('📋 Datos completos:', actividadesSemana);
    
    if (actividadesSemana.length === 0) {
      console.log('⚠️ No hay actividades esta semana');
      return (
        <View style={styles.sinActividades}>
          <Text style={styles.sinActividadesText}>
            📅 No hay actividades esta semana
          </Text>
          <Text style={styles.sinActividadesSubtext}>
            Crea un examen o configura tu disponibilidad para ver actividades
          </Text>
        </View>
      );
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.resumenScroll}>
        {actividadesSemana.map(dia => {
          const tieneExamenes = dia.examenes.length > 0;
          const tieneSesiones = dia.sesiones.length > 0;
          
          console.log(`📅 Procesando día ${dia.fecha}:`, {
            tieneExamenes,
            tieneSesiones,
            examenes: dia.examenes.length,
            sesiones: dia.sesiones.length
          });
          
          if (!tieneExamenes && !tieneSesiones) {
            console.log(`⚠️ Día ${dia.fecha} sin actividades, saltando`);
            return null;
          }

          return (
            <View key={dia.fecha} style={styles.diaSemana}>
              <Text style={styles.diaNombre}>
                {new Date(dia.fecha).toLocaleDateString('es-ES', { 
                  weekday: 'short',
                  day: 'numeric'
                }).toUpperCase()}
              </Text>
              
              {/* Día con exámenes - Diseño especial */}
              {tieneExamenes ? (
                <View style={styles.diaConExamen}>
                  <View style={styles.examenHeader}>
                    <Text style={styles.examenIcon}>📝</Text>
                    <Text style={styles.examenLabel}>EXAMEN</Text>
                  </View>
                  {dia.examenes.map(examen => (
                    <View key={examen.examen_id} style={styles.examenResumen}>
                      <Text style={styles.examenNombreResumen}>{examen.nombre}</Text>
                      <Text style={styles.examenMateriaResumen}>{examen.materia}</Text>
                      <Text style={styles.examenHorario}>
                        {extraerTurnoExamen(examen.fecha)} · {new Date(examen.fecha).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                /* Día con sesiones normales */
                <View style={styles.diaConSesiones}>
                  {dia.sesiones.map(sesion => {
                    const turno = extraerTurno(sesion.observacion);
                    const iconoTurno = turno === 'Mañana' ? '🌅' : turno === 'Tarde' ? '🌆' : '🌙';
                    
                    return (
                      <View key={sesion.sesion_id} style={styles.sesionResumen}>
                        <Text style={styles.sesionIcon}>{iconoTurno}</Text>
                        <View style={styles.sesionInfo}>
                          <Text style={styles.sesionTemaResumen}>{sesion.tema}</Text>
                          <Text style={styles.sesionTurnoResumen}>{turno}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Calendario */}
      <Calendar
        onDayPress={onDayPress}
        markedDates={crearMarkedDates()}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#8B5CF6',
          selectedDayBackgroundColor: '#8B5CF6',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#8B5CF6',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#8B5CF6',
          selectedDotColor: '#ffffff',
          arrowColor: '#8B5CF6',
          monthTextColor: '#8B5CF6',
          indicatorColor: '#8B5CF6',
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '300',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 13
        }}
      />

      {/* Resumen Semanal */}
      <View style={styles.resumenSemanal}>
        <Text style={styles.resumenTitulo}>📅 Resumen de la Semana</Text>
        {renderResumenSemana()}
      </View>

      {/* Actividades del Día Seleccionado */}
      {fechaSeleccionada && (
        <View style={styles.actividadesDia}>
          <Text style={styles.actividadesTitulo}>
            📋 Actividades del {new Date(fechaSeleccionada).toLocaleDateString('es-ES')}
          </Text>
          
          {(() => {
            const diaSeleccionado = diasCalendario.find(dia => dia.fecha === fechaSeleccionada);
            
            if (!diaSeleccionado || !diaSeleccionado.tieneActividades) {
              return (
                <View style={styles.sinActividades}>
                  <Text style={styles.sinActividadesText}>
                    No hay actividades programadas para este día
                  </Text>
                </View>
              );
            }

            return (
              <ScrollView style={styles.actividadesScroll}>
                {diaSeleccionado.sesiones.map(renderSesion)}
                {diaSeleccionado.examenes.map(renderExamen)}
              </ScrollView>
            );
          })()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  resumenSemanal: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  resumenTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  diaSemana: {
    marginRight: 16,
    alignItems: 'center',
    minWidth: 120,
  },
  diaNombre: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  resumenScroll: {
    paddingHorizontal: 4,
  },
  // Estilos para días con exámenes
  diaConExamen: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: 8,
    padding: 12,
    minWidth: 110,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  examenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  examenIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  examenLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  examenResumen: {
    alignItems: 'center',
  },
  examenNombreResumen: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  examenMateriaResumen: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  examenHorario: {
    fontSize: 9,
    color: '#DC2626',
    fontWeight: '500',
    textAlign: 'center',
  },
  // Estilos para días con sesiones normales
  diaConSesiones: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 8,
    minWidth: 110,
  },
  sesionResumen: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 4,
  },
  sesionIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  sesionInfo: {
    flex: 1,
  },
  sesionTemaResumen: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 1,
  },
  sesionTurnoResumen: {
    fontSize: 9,
    color: '#6B7280',
  },
  actividadesDia: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actividadesTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  actividadesScroll: {
    maxHeight: 300,
  },
  sesionCard: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sesionTema: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sesionTurno: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  sesionEstado: {
    fontSize: 12,
    color: '#6B7280',
  },
  examenCard: {
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  examenNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  examenMateria: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  examenSesiones: {
    fontSize: 12,
    color: '#6B7280',
  },
  sinActividades: {
    padding: 20,
    alignItems: 'center',
  },
  sinActividadesText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  sinActividadesSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
