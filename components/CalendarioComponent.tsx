import { useAuth } from '@/contexts/AuthContext';
import {
    DiaCalendario,
    ExamenCalendario,
    extraerTurno,
    getDiasCalendario,
    obtenerColorDot,
    SesionCalendario
} from '@/services/calendar';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

interface CalendarioProps {
  onDiaSeleccionado?: (dia: DiaCalendario) => void;
}

export default function CalendarioComponent({ onDiaSeleccionado }: CalendarioProps) {
  const { user } = useAuth();
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [diasCalendario, setDiasCalendario] = useState<DiaCalendario[]>([]);
  const [actividadesProximas2Semanas, setActividadesProximas2Semanas] = useState<DiaCalendario[]>([]);
  const [loading, setLoading] = useState(false);

  // Obtener fechas del mes actual
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  
  const fechaInicio = primerDiaMes.toISOString().split('T')[0];
  const fechaFin = ultimoDiaMes.toISOString().split('T')[0];

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

  const renderExamen = (examen: ExamenCalendario, fecha?: string) => {
    const fechaExamen = fecha || examen.fecha;
    
    return (
      <View key={examen.examen_id} style={[styles.examenCard, { borderLeftColor: '#7C3AED' }]}>
        <View style={styles.examenHeader}>
          <Text style={styles.examenFecha}>
            {new Date(fechaExamen).toLocaleDateString('es-ES', { 
              weekday: 'short',
              day: 'numeric',
              month: 'short'
            })}
          </Text>
        </View>
        <Text style={styles.examenNombre}>📝 {examen.nombre}</Text>
        <Text style={styles.examenMateria}>{examen.materia}</Text>
        <Text style={styles.examenSesiones}>
          {examen.total_sesiones_planificadas} sesiones planificadas
        </Text>
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
            {actividadesProximas2Semanas
              .filter(dia => dia.tieneActividades)
              .flatMap(dia => [
                ...dia.sesiones.map(sesion => ({ ...sesion, fechaDia: dia.fecha, tipo: 'sesion' as const })),
                ...dia.examenes.map(examen => ({ ...examen, fechaDia: dia.fecha, tipo: 'examen' as const }))
              ])
              .sort((a, b) => {
                // Ordenar por fecha
                const fechaA = new Date(a.fechaDia).getTime();
                const fechaB = new Date(b.fechaDia).getTime();
                if (fechaA !== fechaB) return fechaA - fechaB;
                
                // Si es el mismo día, exámenes primero, luego sesiones
                if (a.tipo === 'examen' && b.tipo === 'sesion') return -1;
                if (a.tipo === 'sesion' && b.tipo === 'examen') return 1;
                return 0;
              })
              .map((item, index) => {
                if (item.tipo === 'sesion') {
                  return renderSesion(item as SesionCalendario & { fechaDia: string }, item.fechaDia);
                } else {
                  return renderExamen(item as ExamenCalendario & { fechaDia: string }, item.fechaDia);
                }
              })}
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
  examenHeader: {
    marginBottom: 8,
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
