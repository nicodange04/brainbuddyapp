// app/editar-perfil.tsx
// Pantalla para editar el perfil del usuario

import { useAuth } from '@/contexts/AuthContext';
import { actualizarPerfilCompleto, DatosPerfilActualizar } from '@/services/perfilUpdate';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Design System Colors
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

export default function EditarPerfilScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, checkAuthState } = useAuth();
  const [loading, setLoading] = useState(false);

  // Estados del formulario
  const [nombre, setNombre] = useState(user?.usuario?.nombre || '');
  const [apellido, setApellido] = useState(user?.usuario?.apellido || '');
  const [correo, setCorreo] = useState(user?.usuario?.correo || '');
  const [fechaNacimiento, setFechaNacimiento] = useState(
    user?.usuario?.fecha_nacimiento || ''
  );
  const [telefono, setTelefono] = useState(
    user?.padre?.telefono || ''
  );

  // Validar email
  const validarEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Formatear fecha automáticamente mientras se escribe (DD/MM/YYYY)
  const formatearFechaInput = (texto: string): string => {
    // Remover todo lo que no sea número
    const numeros = texto.replace(/\D/g, '');
    
    // Limitar a 8 dígitos (DDMMYYYY)
    const numerosLimitados = numeros.slice(0, 8);
    
    // Formatear según la longitud
    if (numerosLimitados.length <= 2) {
      return numerosLimitados;
    } else if (numerosLimitados.length <= 4) {
      return `${numerosLimitados.slice(0, 2)}/${numerosLimitados.slice(2)}`;
    } else {
      return `${numerosLimitados.slice(0, 2)}/${numerosLimitados.slice(2, 4)}/${numerosLimitados.slice(4)}`;
    }
  };

  // Validar fecha (formato DD/MM/YYYY)
  const validarFecha = (fecha: string): boolean => {
    if (!fecha) return true; // Fecha opcional
    const fechaRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!fechaRegex.test(fecha)) return false;
    
    const [, dia, mes, año] = fecha.match(fechaRegex) || [];
    const diaNum = parseInt(dia);
    const mesNum = parseInt(mes);
    const añoNum = parseInt(año);
    
    // Validar rangos
    if (diaNum < 1 || diaNum > 31) return false;
    if (mesNum < 1 || mesNum > 12) return false;
    if (añoNum < 1900 || añoNum > new Date().getFullYear()) return false;
    
    const fechaObj = new Date(añoNum, mesNum - 1, diaNum);
    
    return (
      fechaObj.getDate() === diaNum &&
      fechaObj.getMonth() === mesNum - 1 &&
      fechaObj.getFullYear() === añoNum &&
      fechaObj < new Date() // La fecha debe ser en el pasado
    );
  };

  // Convertir fecha DD/MM/YYYY a ISO
  const convertirFechaAISO = (fecha: string): string | undefined => {
    if (!fecha) return undefined;
    const fechaRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = fecha.match(fechaRegex);
    if (!match) return undefined;
    
    const [, dia, mes, año] = match;
    return `${año}-${mes}-${dia}`;
  };

  // Formatear fecha ISO a DD/MM/YYYY
  const formatearFechaDesdeISO = (fechaISO?: string): string => {
    if (!fechaISO) return '';
    try {
      const fecha = new Date(fechaISO);
      const dia = fecha.getDate().toString().padStart(2, '0');
      const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
      const año = fecha.getFullYear();
      return `${dia}/${mes}/${año}`;
    } catch {
      return '';
    }
  };

  // Inicializar fecha de nacimiento formateada
  React.useEffect(() => {
    if (user?.usuario?.fecha_nacimiento && !fechaNacimiento) {
      setFechaNacimiento(formatearFechaDesdeISO(user.usuario.fecha_nacimiento));
    }
  }, [user]);

  const handleGuardar = async () => {
    // Validaciones
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    if (!correo.trim()) {
      Alert.alert('Error', 'El correo es obligatorio');
      return;
    }

    if (!validarEmail(correo)) {
      Alert.alert('Error', 'El correo electrónico no es válido');
      return;
    }

    if (user?.alumno && fechaNacimiento && !validarFecha(fechaNacimiento)) {
      Alert.alert('Error', 'La fecha de nacimiento no es válida. Usa el formato DD/MM/YYYY');
      return;
    }

    setLoading(true);
    try {
      const datos: DatosPerfilActualizar = {
        nombre: nombre.trim(),
        apellido: apellido.trim() || undefined,
        correo: correo.trim(),
      };

      if (user?.alumno) {
        datos.fecha_nacimiento = convertirFechaAISO(fechaNacimiento);
      }

      if (user?.padre) {
        datos.telefono = telefono.trim() || undefined;
      }

      await actualizarPerfilCompleto(
        user!.usuario.usuario_id,
        datos,
        user!.usuario.rol as 'alumno' | 'padre',
        user?.alumno?.alumno_id,
        user?.padre?.padre_id
      );

      // Refrescar datos del usuario
      await checkAuthState();

      Alert.alert(
        'Perfil actualizado',
        'Tus datos se han actualizado correctamente',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo actualizar el perfil. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    Alert.alert(
      'Cancelar edición',
      '¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.',
      [
        { text: 'Continuar editando', style: 'cancel' },
        {
          text: 'Cancelar',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={handleCancelar} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={DesignColors.neutral.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Información Personal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN PERSONAL</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Tu nombre"
              placeholderTextColor={DesignColors.neutral.mediumGray}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Apellido</Text>
            <TextInput
              style={styles.input}
              value={apellido}
              onChangeText={setApellido}
              placeholder="Tu apellido"
              placeholderTextColor={DesignColors.neutral.mediumGray}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico *</Text>
            <TextInput
              style={styles.input}
              value={correo}
              onChangeText={setCorreo}
              placeholder="tu@email.com"
              placeholderTextColor={DesignColors.neutral.mediumGray}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {/* Información específica según rol */}
        {user?.alumno && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMACIÓN ADICIONAL</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha de nacimiento</Text>
              <TextInput
                style={styles.input}
                value={fechaNacimiento}
                onChangeText={(text) => setFechaNacimiento(formatearFechaInput(text))}
                placeholder="DD/MM/YYYY"
                placeholderTextColor={DesignColors.neutral.mediumGray}
                keyboardType="numeric"
                maxLength={10}
              />
              <Text style={styles.helperText}>
                Formato: DD/MM/YYYY (ejemplo: 15/03/2005)
              </Text>
            </View>
          </View>
        )}

        {user?.padre && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMACIÓN DE CONTACTO</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                value={telefono}
                onChangeText={setTelefono}
                placeholder="+54 9 11 1234-5678"
                placeholderTextColor={DesignColors.neutral.mediumGray}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        )}

        {/* Campos no editables (información) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMACIÓN DEL SISTEMA</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rol:</Text>
              <Text style={styles.infoValue}>
                {user?.usuario?.rol === 'alumno' ? 'Alumno' : 'Padre/Madre'}
              </Text>
            </View>
            {user?.alumno && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Código de vinculación:</Text>
                <Text style={styles.infoValue}>
                  {user.usuario.codigo_vinculacion || user.alumno?.codigo_vinculacion || 'N/A'}
                </Text>
              </View>
            )}
            <Text style={styles.infoNote}>
              Estos campos no se pueden modificar
            </Text>
          </View>
        </View>

        {/* Botones */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonCancel]}
            onPress={handleCancelar}
            disabled={loading}
          >
            <Text style={styles.buttonCancelText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSave, loading && styles.buttonDisabled]}
            onPress={handleGuardar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={DesignColors.secondary.white} />
            ) : (
              <Text style={styles.buttonSaveText}>Guardar cambios</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignColors.secondary.offWhite,
  },
  header: {
    backgroundColor: DesignColors.secondary.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: DesignColors.neutral.lightGray,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: DesignColors.neutral.black,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: DesignColors.neutral.mediumGray,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: DesignColors.neutral.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: DesignColors.neutral.black,
    borderWidth: 2,
    borderColor: DesignColors.neutral.lightGray,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  helperText: {
    fontSize: 12,
    color: DesignColors.neutral.mediumGray,
    marginTop: 6,
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: DesignColors.secondary.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: DesignColors.neutral.lightGray,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: DesignColors.neutral.mediumGray,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: DesignColors.neutral.black,
  },
  infoNote: {
    fontSize: 12,
    color: DesignColors.neutral.mediumGray,
    fontStyle: 'italic',
    marginTop: 8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonCancel: {
    backgroundColor: DesignColors.secondary.white,
    borderWidth: 2,
    borderColor: DesignColors.neutral.lightGray,
  },
  buttonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignColors.neutral.black,
  },
  buttonSave: {
    backgroundColor: DesignColors.primary.violet,
    shadowColor: DesignColors.primary.violet,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: DesignColors.secondary.white,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  bottomSpacing: {
    height: 24,
  },
});

