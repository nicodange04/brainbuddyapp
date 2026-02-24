// components/DiagramaVisual.tsx
// Componente para renderizar diagramas visuales basados en datos estructurados

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Diagrama } from '@/services/formatosMultimedia';

interface DiagramaVisualProps {
  diagrama: Diagrama;
}

export default function DiagramaVisual({ diagrama }: DiagramaVisualProps) {
  const { tipo, titulo, descripcion, datos } = diagrama;
  const { nodos = [], conexiones = [] } = datos || {};

  // Validar que hay datos para renderizar
  if (!nodos || nodos.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.descripcion}>{descripcion}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No hay datos disponibles para este diagrama</Text>
        </View>
      </View>
    );
  }

  // Renderizar según el tipo de diagrama
  const renderDiagrama = () => {
    switch (tipo) {
      case 'flujo':
      case 'proceso':
        return renderDiagramaFlujo(nodos, conexiones);
      case 'jerarquia':
        return renderDiagramaJerarquia(nodos, conexiones);
      case 'comparacion':
        return renderDiagramaComparacion(nodos, conexiones);
      case 'concepto':
      default:
        return renderDiagramaConcepto(nodos, conexiones);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.header}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.descripcion}>{descripcion}</Text>
        <View style={styles.tipoBadge}>
          <Text style={styles.tipoText}>{tipo.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.diagramaContainer}>
        {renderDiagrama()}
      </View>
    </ScrollView>
  );
}

// Renderizar diagrama de flujo/proceso
function renderDiagramaFlujo(nodos: any[], conexiones: any[]) {
  return (
    <View style={styles.flujoContainer}>
      {nodos.map((nodo, index) => {
        const esInicio = nodo.tipo === 'inicio';
        const esFin = nodo.tipo === 'fin';
        const esDecision = nodo.tipo === 'decision';
        
        return (
          <View key={nodo.id || index} style={styles.flujoItem}>
            <View
              style={[
                styles.nodoFlujo,
                esInicio && styles.nodoInicio,
                esFin && styles.nodoFin,
                esDecision && styles.nodoDecision,
              ]}
            >
              <Text style={styles.nodoLabel} numberOfLines={3}>
                {nodo.label}
              </Text>
            </View>
            {index < nodos.length - 1 && (
              <View style={styles.flechaContainer}>
                <View style={styles.flecha} />
                <Text style={styles.flechaText}>↓</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

// Renderizar diagrama de jerarquía
function renderDiagramaJerarquia(nodos: any[], conexiones: any[]) {
  // Encontrar el nodo raíz (principal)
  const nodoRaiz = nodos.find(n => n.tipo === 'principal') || nodos[0];
  const nodosHijos = nodos.filter(n => n.id !== nodoRaiz.id);

  return (
    <View style={styles.jerarquiaContainer}>
      {/* Nodo raíz */}
      <View style={styles.nodoRaiz}>
        <Text style={styles.nodoRaizLabel} numberOfLines={2}>
          {nodoRaiz.label}
        </Text>
      </View>

      {/* Línea vertical */}
      <View style={styles.lineaVertical} />

      {/* Nodos hijos en fila */}
      <View style={styles.nodosHijosContainer}>
        {nodosHijos.map((nodo, index) => (
          <View key={nodo.id || index} style={styles.nodoHijo}>
            <View style={styles.lineaHorizontal} />
            <View style={styles.nodoHijoBox}>
              <Text style={styles.nodoHijoLabel} numberOfLines={2}>
                {nodo.label}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// Renderizar diagrama de comparación
function renderDiagramaComparacion(nodos: any[], conexiones: any[]) {
  return (
    <View style={styles.comparacionContainer}>
      {nodos.map((nodo, index) => (
        <View key={nodo.id || index} style={styles.nodoComparacion}>
          <View style={styles.nodoComparacionBox}>
            <Text style={styles.nodoComparacionLabel} numberOfLines={3}>
              {nodo.label}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// Renderizar diagrama de concepto (red de conceptos)
function renderDiagramaConcepto(nodos: any[], conexiones: any[]) {
  // Agrupar nodos por tipo
  const nodoPrincipal = nodos.find(n => n.tipo === 'principal');
  const nodosConceptos = nodos.filter(n => n.tipo === 'concepto' || n.tipo === 'definicion');
  const nodosPartes = nodos.filter(n => n.tipo === 'parte' || n.tipo === 'categoria');
  const nodosEjemplos = nodos.filter(n => n.tipo === 'ejemplo');

  return (
    <View style={styles.conceptoContainer}>
      {/* Nodo principal en el centro */}
      {nodoPrincipal && (
        <View style={styles.nodoPrincipal}>
          <Text style={styles.nodoPrincipalLabel} numberOfLines={2}>
            {nodoPrincipal.label}
          </Text>
        </View>
      )}

      {/* Conceptos alrededor */}
      {nodosConceptos.length > 0 && (
        <View style={styles.conceptosContainer}>
          {nodosConceptos.map((nodo, index) => (
            <View key={nodo.id || index} style={styles.nodoConcepto}>
              <View style={styles.lineaConcepto} />
              <View style={styles.nodoConceptoBox}>
                <Text style={styles.nodoConceptoLabel} numberOfLines={2}>
                  {nodo.label}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Partes/Categorías */}
      {nodosPartes.length > 0 && (
        <View style={styles.partesContainer}>
          {nodosPartes.map((nodo, index) => (
            <View key={nodo.id || index} style={styles.nodoParte}>
              <View style={styles.nodoParteBox}>
                <Text style={styles.nodoParteLabel} numberOfLines={2}>
                  {nodo.label}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Ejemplos */}
      {nodosEjemplos.length > 0 && (
        <View style={styles.ejemplosContainer}>
          <Text style={styles.ejemplosTitulo}>Ejemplos:</Text>
          {nodosEjemplos.map((nodo, index) => (
            <View key={nodo.id || index} style={styles.nodoEjemplo}>
              <Text style={styles.nodoEjemploLabel}>{nodo.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  titulo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    marginBottom: 12,
  },
  tipoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tipoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  diagramaContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  // FLUJO/PROCESO
  flujoContainer: {
    alignItems: 'center',
  },
  flujoItem: {
    alignItems: 'center',
    width: '100%',
  },
  nodoFlujo: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 16,
    minWidth: 200,
    maxWidth: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodoInicio: {
    backgroundColor: '#34D399',
  },
  nodoFin: {
    backgroundColor: '#EF4444',
  },
  nodoDecision: {
    backgroundColor: '#FCD34D',
    transform: [{ rotate: '45deg' }],
  },
  nodoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  flechaContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  flecha: {
    width: 2,
    height: 20,
    backgroundColor: '#8B5CF6',
  },
  flechaText: {
    fontSize: 20,
    color: '#8B5CF6',
  },

  // JERARQUÍA
  jerarquiaContainer: {
    alignItems: 'center',
  },
  nodoRaiz: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 20,
    minWidth: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodoRaizLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  lineaVertical: {
    width: 3,
    height: 30,
    backgroundColor: '#8B5CF6',
    marginVertical: 12,
  },
  nodosHijosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  nodoHijo: {
    alignItems: 'center',
    minWidth: 120,
    maxWidth: '45%',
  },
  lineaHorizontal: {
    width: 30,
    height: 3,
    backgroundColor: '#8B5CF6',
    marginBottom: 8,
  },
  nodoHijoBox: {
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodoHijoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // COMPARACIÓN
  comparacionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 16,
  },
  nodoComparacion: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
  },
  nodoComparacionBox: {
    backgroundColor: '#60A5FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  nodoComparacionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  // CONCEPTO
  conceptoContainer: {
    alignItems: 'center',
  },
  nodoPrincipal: {
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    padding: 20,
    minWidth: 200,
    maxWidth: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  nodoPrincipalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  conceptosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  nodoConcepto: {
    alignItems: 'center',
    minWidth: 120,
    maxWidth: '45%',
  },
  lineaConcepto: {
    width: 2,
    height: 20,
    backgroundColor: '#8B5CF6',
    marginBottom: 8,
  },
  nodoConceptoBox: {
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodoConceptoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  partesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  nodoParte: {
    minWidth: 100,
    maxWidth: '30%',
  },
  nodoParteBox: {
    backgroundColor: '#93C5FD',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodoParteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  ejemplosContainer: {
    marginTop: 24,
    width: '100%',
  },
  ejemplosTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  nodoEjemplo: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  nodoEjemploLabel: {
    fontSize: 13,
    color: '#374151',
  },

  // ERROR
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
});
