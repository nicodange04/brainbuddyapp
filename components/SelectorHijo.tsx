// components/SelectorHijo.tsx
// Componente para que el padre seleccione qué hijo ver

import { usePadre } from '@/contexts/PadreContext';
import { Avatar } from '@/components/avatar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Design System Colors
const DesignColors = {
  primary: {
    violet: '#8B5CF6',
    violetLight: '#A78BFA',
  },
  secondary: {
    white: '#FFFFFF',
    offWhite: '#F9FAFB',
  },
  neutral: {
    black: '#1F2937',
    darkGray: '#374151',
    mediumGray: '#6B7280',
    lightGray: '#E5E7EB',
  },
};

interface SelectorHijoProps {
  mostrarSoloNombre?: boolean; // Si true, solo muestra el nombre sin dropdown
}

export function SelectorHijo({ mostrarSoloNombre = false }: SelectorHijoProps) {
  const { hijosVinculados, hijoActivo, cambiarHijoActivo } = usePadre();
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  // Si no hay hijos, no mostrar nada
  if (hijosVinculados.length === 0) {
    return null;
  }

  // Si solo hay un hijo y mostrarSoloNombre es true, mostrar solo el nombre
  if (hijosVinculados.length === 1 && mostrarSoloNombre) {
    const hijo = hijosVinculados[0];
    return (
      <View style={styles.container}>
        <Avatar
          iniciales={hijo.iniciales}
          color={hijo.avatar_color as any}
          size="small"
        />
        <Text style={styles.nombreSolo}>
          {hijo.nombre} {hijo.apellido}
        </Text>
      </View>
    );
  }

  // Si hay múltiples hijos o no se especifica mostrarSoloNombre, mostrar selector
  return (
    <>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        <Avatar
          iniciales={hijoActivo?.iniciales || '?'}
          color={(hijoActivo?.avatar_color || '#8B5CF6') as any}
          size="small"
        />
        <View style={styles.selectorInfo}>
          <Text style={styles.selectorLabel}>Viendo progreso de:</Text>
          <Text style={styles.selectorNombre}>
            {hijoActivo?.nombre} {hijoActivo?.apellido}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={DesignColors.neutral.mediumGray} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar hijo/a</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={DesignColors.neutral.black} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {hijosVinculados.map((hijo) => {
                const esActivo = hijoActivo?.alumno_id === hijo.alumno_id;
                return (
                  <TouchableOpacity
                    key={hijo.alumno_id}
                    style={[
                      styles.hijoOption,
                      esActivo && styles.hijoOptionActivo,
                    ]}
                    onPress={() => {
                      cambiarHijoActivo(hijo.alumno_id);
                      setModalVisible(false);
                    }}
                  >
                    <Avatar
                      iniciales={hijo.iniciales}
                      color={hijo.avatar_color as any}
                      size="medium"
                    />
                    <View style={styles.hijoOptionInfo}>
                      <Text style={styles.hijoOptionNombre}>
                        {hijo.nombre} {hijo.apellido}
                      </Text>
                      <Text style={styles.hijoOptionCodigo}>
                        Código: {hijo.codigo_vinculacion}
                      </Text>
                    </View>
                    {esActivo && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={DesignColors.primary.violet}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
              
              {/* Botón para agregar nuevo hijo */}
              <TouchableOpacity
                style={styles.agregarHijoButton}
                onPress={() => {
                  setModalVisible(false);
                  router.push('/vincular-hijo');
                }}
              >
                <View style={styles.agregarHijoIconContainer}>
                  <Ionicons
                    name="add-circle-outline"
                    size={28}
                    color={DesignColors.primary.violet}
                  />
                </View>
                <View style={styles.agregarHijoInfo}>
                  <Text style={styles.agregarHijoTexto}>
                    Vincular otro hijo/a
                  </Text>
                  <Text style={styles.agregarHijoSubtexto}>
                    Agregar un nuevo hijo usando su código
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={DesignColors.neutral.mediumGray}
                />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nombreSolo: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignColors.neutral.black,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    shadowColor: DesignColors.primary.violet,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectorInfo: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 11,
    color: DesignColors.neutral.mediumGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectorNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: DesignColors.neutral.black,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: DesignColors.secondary.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: DesignColors.neutral.lightGray,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DesignColors.neutral.black,
  },
  modalList: {
    padding: 16,
  },
  hijoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: DesignColors.secondary.offWhite,
    gap: 12,
  },
  hijoOptionActivo: {
    backgroundColor: DesignColors.primary.violetLight + '20',
    borderWidth: 2,
    borderColor: DesignColors.primary.violet,
  },
  hijoOptionInfo: {
    flex: 1,
  },
  hijoOptionNombre: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignColors.neutral.black,
    marginBottom: 4,
  },
  hijoOptionCodigo: {
    fontSize: 12,
    color: DesignColors.neutral.mediumGray,
  },
  agregarHijoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: DesignColors.secondary.white,
    borderWidth: 2,
    borderColor: DesignColors.primary.violet,
    borderStyle: 'dashed',
    gap: 12,
  },
  agregarHijoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: DesignColors.primary.violetLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  agregarHijoInfo: {
    flex: 1,
  },
  agregarHijoTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignColors.primary.violet,
    marginBottom: 4,
  },
  agregarHijoSubtexto: {
    fontSize: 12,
    color: DesignColors.neutral.mediumGray,
  },
});





