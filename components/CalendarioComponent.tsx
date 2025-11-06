import { useAuth } from '@/contexts/AuthContext';
import {
    DiaCalendario,
    ExamenCalendario,
    extraerTurno,
    getDiasCalendario,
    obtenerColorDot,
    SesionCalendario
} from '@/services/calendar';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

interface CalendarioProps {
  onDiaSeleccionado?: (dia: DiaCalendario) => void;
  refreshKey?: number; // Clave para forzar refresh
}

export default function CalendarioComponent({ onDiaSeleccionado, refreshKey }: CalendarioProps) {
  const { user } = useAuth();
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [diasCalendario, setDiasCalendario] = useState<DiaCalendario[]>([]);
  const [actividadesProximas2Semanas, setActividadesProximas2Semanas] = useState<DiaCalendario[]>([]);
  const [loading, setLoading] = useState(false);
  const [examenesExpandidos, setExamenesExpandidos] = useState<Set<string>>(new Set());

  // Obtener fechas del mes actual
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  
  const fechaInicio = primerDiaMes.toISOString().split('T')[0];
  const fechaFin = ultimoDiaMes.toISOString().split('T')[0];

  const cargarDatosCalendario = async () => {
    if (!user?.usuario?.usuario_id) return;

    console.log('🚀 Cargando datos del calendario para usuario:', user.usuario.usuario_id);
    console.log('📅 Rango de fechas:', { fechaInicio, fechaFin });

    setLoading(true);
    try {
      // Fecha de inicio para las próximas 2 semanas (desde hoy)
      const fechaInicioProximas2Semanas = hoy.toISOString().split('T')[0];
      const fechaFinProximas2Semanas = new Date(hoy);
      fechaFinProximas2Semanas.setDate(fechaFinProximas2Semanas.getDate() + 13); // 2 semanas = 14 días
      
      const [dias, actividades] = await Promise.all([
        getDiasCalendario(user.usuario.usuario_id, fechaInicio, fechaFin),
        getDiasCalendario(user.usuario.usuario_id, fechaInicioProximas2Semanas, fechaFinProximas2Semanas.toISOString().split('T')[0])
      ]);

      console.log('📊 Días del calendario:', dias.length);
      console.log('🗓️ Días con actividades:', dias);
      console.log('📅 Actividades próximas 2 semanas:', actividades.length);

      setDiasCalendario(dias);
      setActividadesProximas2Semanas(actividades);
    } catch (error) {
      console.error('Error al cargar datos del calendario:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del calendario');
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos del calendario cuando cambia el usuario o refreshKey
  useEffect(() => {
    if (user?.usuario?.usuario_id) {
      cargarDatosCalendario();
    }
  }, [user, refreshKey]); // Agregar refreshKey como dependencia

  // Refrescar cuando la pantalla recibe foco (cuando vuelves de otra pantalla)
  useFocusEffect(
    useCallback(() => {
      if (user?.usuario?.usuario_id) {
        console.log('🔄 Pantalla enfocada, refrescando calendario...');
        cargarDatosCalendario();
      }
    }, [user?.usuario?.usuario_id])
  );

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

  const renderSesion = (sesion: SesionCalendario, fecha?: string) => {
    const turno = extraerTurno(sesion.observacion);
    const fechaSesion = fecha || sesion.fecha.split('T')[0];
    
    return (
      <View key={sesion.sesion_id} style={[styles.sesionCard, { borderLeftColor: '#A78BFA' }]}>
        <View style={styles.sesionHeader}>
          <Text style={styles.sesionFecha}>
            {new Date(fechaSesion).toLocaleDateString('es-ES', { 
              weekday: 'short',
              day: 'numeric',
              month: 'short'
            })}
          </Text>
        </View>
        <Text style={styles.sesionTema}>{sesion.tema}</Text>
        <Text style={styles.sesionTurno}>🕐 {turno}</Text>
        <Text style={styles.sesionEstado}>
          {sesion.estado === 'Completada' ? '✅' : '⏳'} {sesion.estado}
        </Text>
      </View>
    );
  };

  const toggleExamen = (examenId: string) => {
    setExamenesExpandidos(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(examenId)) {
        nuevo.delete(examenId);
      } else {
        nuevo.add(examenId);
      }
      return nuevo;
    });
  };

  const renderExamen = (
    examen: ExamenCalendario, 
    fecha?: string, 
    sesiones?: SesionCalendario[]
  ) => {
    const fechaExamen = fecha || examen.fecha;
    const estaExpandido = examenesExpandidos.has(examen.examen_id);
    const sesionesDelExamen = sesiones || [];
    
    return (
      <View key={examen.examen_id} style={styles.examenWrapper}>
        <TouchableOpacity
          style={[styles.examenCard, { borderLeftColor: '#7C3AED' }]}
          onPress={() => toggleExamen(examen.examen_id)}
          activeOpacity={0.7}
        >
          <View style={styles.examenCardContent}>
            <View style={styles.examenHeader}>
              <Text style={styles.examenFecha}>
                {new Date(fechaExamen).toLocaleDateString('es-ES', { 
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })}
              </Text>
              <Text style={styles.examenExpandIcon}>
                {estaExpandido ? '▼' : '▶'}
              </Text>
            </View>
            <Text style={styles.examenNombre}>📝 {examen.nombre}</Text>
            <Text style={styles.examenMateria}>{examen.materia}</Text>
            <Text style={styles.examenSesiones}>
              {examen.total_sesiones_planificadas} sesiones planificadas
            </Text>
          </View>
        </TouchableOpacity>
        
        {/* Sesiones expandidas */}
        {estaExpandido && sesionesDelExamen.length > 0 && (
          <View style={styles.sesionesExpandidas}>
            {sesionesDelExamen.map(sesion => renderSesion(sesion, sesion.fecha.split('T')[0]))}
          </View>
        )}
      </View>
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

      {/* Actividades Próximas - Siempre visible */}
      <View style={styles.actividadesDia}>
        <Text style={styles.actividadesTitulo}>
          📋 Próximas Actividades
        </Text>
        <Text style={styles.actividadesSubtitle}>
          Exámenes y sesiones de estudio de las próximas 2 semanas
        </Text>
        
        {actividadesProximas2Semanas.length === 0 ? (
          <View style={styles.sinActividades}>
            <Text style={styles.sinActividadesText}>
              No hay actividades programadas en las próximas 2 semanas
            </Text>
            <Text style={styles.sinActividadesSubtext}>
              Crea un examen o configura tu disponibilidad para ver actividades
            </Text>
          </View>
        ) : (
          <View style={styles.actividadesContainer}>
            {(() => {
              // Agrupar sesiones por examen_id
              const sesionesPorExamen = new Map<string, SesionCalendario[]>();
              const examenesConFecha: Array<{ examen: ExamenCalendario; fecha: string }> = [];
              
              actividadesProximas2Semanas
                .filter(dia => dia.tieneActividades)
                .forEach(dia => {
                  // Agregar exámenes
                  dia.examenes.forEach(examen => {
                    examenesConFecha.push({ examen, fecha: dia.fecha });
                  });
                  
                  // Agrupar sesiones por examen_id
                  dia.sesiones.forEach(sesion => {
                    if (!sesionesPorExamen.has(sesion.examen_id)) {
                      sesionesPorExamen.set(sesion.examen_id, []);
                    }
                    sesionesPorExamen.get(sesion.examen_id)!.push(sesion);
                  });
                });
              
              // Ordenar exámenes por fecha
              examenesConFecha.sort((a, b) => {
                const fechaA = new Date(a.fecha).getTime();
                const fechaB = new Date(b.fecha).getTime();
                return fechaA - fechaB;
              });
              
              // Renderizar solo exámenes (las sesiones se muestran dentro cuando se expanden)
              return examenesConFecha.map(({ examen, fecha }) => {
                const sesiones = sesionesPorExamen.get(examen.examen_id) || [];
                return renderExamen(examen, fecha, sesiones);
              });
            })()}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    marginBottom: 4,
  },
  actividadesSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  actividadesContainer: {
    paddingBottom: 8,
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
  sesionHeader: {
    marginBottom: 8,
  },
  sesionFecha: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A78BFA',
    textTransform: 'capitalize',
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
  examenWrapper: {
    marginBottom: 8,
  },
  examenCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  examenCardContent: {
    padding: 12,
  },
  examenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  examenExpandIcon: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: 'bold',
  },
  sesionesExpandidas: {
    marginTop: 4,
    marginLeft: 16,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#E5E7EB',
  },
  examenFecha: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
    textTransform: 'capitalize',
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
