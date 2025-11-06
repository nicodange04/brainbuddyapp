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
  showOnlyCalendar?: boolean; // Si es true, solo muestra el calendario
  showOnlyActivities?: boolean; // Si es true, solo muestra las actividades
}

export default function CalendarioComponent({ onDiaSeleccionado, refreshKey, showOnlyCalendar, showOnlyActivities }: CalendarioProps) {
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
              <View style={styles.examenExpandIconContainer}>
                <Text style={styles.examenExpandIcon}>
                  {estaExpandido ? '▼' : '▶'}
                </Text>
              </View>
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


  // Renderizar solo calendario
  if (showOnlyCalendar) {
    return (
      <View style={styles.calendarWrapper}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={crearMarkedDates()}
          theme={{
            backgroundColor: '#FFFFFF',
            calendarBackground: '#FFFFFF',
            textSectionTitleColor: '#8B5CF6', // primary.violet
            selectedDayBackgroundColor: '#8B5CF6',
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: '#7C3AED', // violetDark
            dayTextColor: '#1F2937', // neutral.black
            textDisabledColor: '#E5E7EB', // lightGray
            dotColor: '#8B5CF6',
            selectedDotColor: '#FFFFFF',
            arrowColor: '#8B5CF6',
            monthTextColor: '#1F2937', // neutral.black para mejor contraste
            indicatorColor: '#8B5CF6',
            textDayFontWeight: '500', // medium weight
            textMonthFontWeight: '700', // bold
            textDayHeaderFontWeight: '600', // semibold
            textDayFontSize: 15,
            textMonthFontSize: 18, // lg font size
            textDayHeaderFontSize: 13
          }}
          style={styles.calendar}
          markingType="simple"
        />
      </View>
    );
  }

  // Renderizar solo actividades
  if (showOnlyActivities) {
    return (
      <View style={styles.actividadesDia}>
        <Text style={styles.actividadesTitulo}>
          📋 Próximas Actividades
        </Text>
        <Text style={styles.actividadesSubtitle}>
          Exámenes y sesiones de estudio de las próximas 2 semanas
        </Text>
        
        {actividadesProximas2Semanas.length === 0 ? (
          <View style={styles.sinActividades}>
            <View style={styles.sinActividadesIcon}>
              <Text style={styles.sinActividadesIconText}>📅</Text>
            </View>
            <Text style={styles.sinActividadesText}>
              No hay actividades programadas
            </Text>
            <Text style={styles.sinActividadesSubtext}>
              Crea un examen o configura tu disponibilidad para comenzar
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
    );
  }

  // Renderizar ambos (comportamiento por defecto)
  return (
    <View style={styles.container}>
      {/* Calendario */}
      <View style={styles.calendarWrapper}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={crearMarkedDates()}
          theme={{
            backgroundColor: '#FFFFFF',
            calendarBackground: '#FFFFFF',
            textSectionTitleColor: '#8B5CF6', // primary.violet
            selectedDayBackgroundColor: '#8B5CF6',
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: '#7C3AED', // violetDark
            dayTextColor: '#1F2937', // neutral.black
            textDisabledColor: '#E5E7EB', // lightGray
            dotColor: '#8B5CF6',
            selectedDotColor: '#FFFFFF',
            arrowColor: '#8B5CF6',
            monthTextColor: '#1F2937', // neutral.black para mejor contraste
            indicatorColor: '#8B5CF6',
            textDayFontWeight: '500', // medium weight
            textMonthFontWeight: '700', // bold
            textDayHeaderFontWeight: '600', // semibold
            textDayFontSize: 15,
            textMonthFontSize: 18, // lg font size
            textDayHeaderFontSize: 13
          }}
          style={styles.calendar}
          markingType="simple"
        />
      </View>

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
            <View style={styles.sinActividadesIcon}>
              <Text style={styles.sinActividadesIconText}>📅</Text>
            </View>
            <Text style={styles.sinActividadesText}>
              No hay actividades programadas
            </Text>
            <Text style={styles.sinActividadesSubtext}>
              Crea un examen o configura tu disponibilidad para comenzar
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
    backgroundColor: '#F9FAFB', // offWhite del design system
  },
  calendarWrapper: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16, // md spacing
    marginBottom: 16,
    borderRadius: 24, // card borderRadius
    padding: 16, // md spacing
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 4,
    overflow: 'hidden',
  },
  calendar: {
    borderRadius: 20,
  },
  actividadesDia: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16, // md spacing
    marginBottom: 16,
    padding: 24, // xl spacing (1.5rem)
    borderRadius: 24, // card borderRadius (1.5rem)
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12, // soft shadow
    shadowRadius: 24,
    elevation: 4,
  },
  actividadesTitulo: {
    fontSize: 20, // xl font size
    fontWeight: '700', // bold
    color: '#1F2937', // neutral.black
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  actividadesSubtitle: {
    fontSize: 14, // sm font size
    fontWeight: '500', // medium
    color: '#6B7280', // neutral.mediumGray
    marginBottom: 20, // xl spacing
    lineHeight: 20,
  },
  actividadesContainer: {
    paddingBottom: 4,
  },
  sesionCard: {
    backgroundColor: '#F9FAFB', // offWhite para diferenciar de examen
    padding: 16, // md spacing
    marginBottom: 12, // md spacing
    borderRadius: 16, // xl borderRadius
    borderLeftWidth: 4,
    borderLeftColor: '#A78BFA', // violetLight
    shadowColor: '#A78BFA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sesionHeader: {
    marginBottom: 10,
  },
  sesionFecha: {
    fontSize: 11, // xs font size
    fontWeight: '600', // semibold
    color: '#A78BFA', // violetLight
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
  sesionTema: {
    fontSize: 16, // base font size
    fontWeight: '600', // semibold
    color: '#1F2937', // neutral.black
    marginBottom: 6,
    lineHeight: 22,
  },
  sesionTurno: {
    fontSize: 13, // sm font size
    fontWeight: '500', // medium
    color: '#6B7280', // neutral.mediumGray
    marginBottom: 6,
  },
  sesionEstado: {
    fontSize: 12, // sm font size
    fontWeight: '500', // medium
    color: '#6B7280', // neutral.mediumGray
  },
  examenWrapper: {
    marginBottom: 12, // md spacing
  },
  examenCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // 2xl borderRadius
    borderLeftWidth: 5, // Más grueso para mejor jerarquía
    shadowColor: '#7C3AED', // violetDark
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  examenCardContent: {
    padding: 18, // lg spacing
  },
  examenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // md spacing
  },
  examenExpandIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16, // full
    backgroundColor: '#F3F4F6', // lightGray
    alignItems: 'center',
    justifyContent: 'center',
  },
  examenExpandIcon: {
    fontSize: 12,
    color: '#7C3AED', // violetDark
    fontWeight: '700', // bold
  },
  sesionesExpandidas: {
    marginTop: 8,
    marginLeft: 20,
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#E5E7EB', // lightGray
    paddingTop: 4,
  },
  examenFecha: {
    fontSize: 11, // xs font size
    fontWeight: '700', // bold
    color: '#7C3AED', // violetDark
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
  examenNombre: {
    fontSize: 18, // lg font size
    fontWeight: '700', // bold
    color: '#1F2937', // neutral.black
    marginBottom: 6,
    lineHeight: 24,
  },
  examenMateria: {
    fontSize: 14, // sm font size
    fontWeight: '500', // medium
    color: '#6B7280', // neutral.mediumGray
    marginBottom: 8,
  },
  examenSesiones: {
    fontSize: 12, // sm font size
    fontWeight: '600', // semibold
    color: '#8B5CF6', // primary.violet
    backgroundColor: '#F3F4F6', // lightGray con opacidad
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12, // lg borderRadius
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  sinActividades: {
    padding: 40, // 2xl spacing
    alignItems: 'center',
    justifyContent: 'center',
  },
  sinActividadesIcon: {
    width: 64,
    height: 64,
    borderRadius: 32, // full
    backgroundColor: '#F3F4F6', // lightGray
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16, // md spacing
  },
  sinActividadesIconText: {
    fontSize: 32,
  },
  sinActividadesText: {
    fontSize: 17, // lg font size
    fontWeight: '600', // semibold
    color: '#1F2937', // neutral.black
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  sinActividadesSubtext: {
    fontSize: 14, // sm font size
    fontWeight: '400', // normal
    color: '#6B7280', // neutral.mediumGray
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
