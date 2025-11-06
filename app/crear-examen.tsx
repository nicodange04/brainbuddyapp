import { DateInput } from '@/components/date-input';
import { useAuth } from '@/contexts/AuthContext';
import { uploadCompleteFile } from '@/services/files';
import { distribuirSesionesParaExamen } from '@/services/sessionDistribution';
import { supabase } from '@/services/supabase';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function CrearExamenScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    materia: '',
    fecha: '',
    temario: '',
    material: '',
  });

  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    fileName: string;
    fileSize: number;
    mimeType: string;
  }>>([]);

  const [currentExamenId, setCurrentExamenId] = useState<string | null>(null);

  const convertToISODate = (dateString: string): string => {
    // Convierte DD/MM/YYYY a YYYY-MM-DD
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        if (formData.nombre.trim() === '' || 
            formData.materia.trim() === '' || 
            formData.fecha.trim() === '') {
          return false;
        }
        
        // Validar que la fecha sea futura
        try {
          const fechaISO = convertToISODate(formData.fecha);
          const fechaExamen = new Date(fechaISO);
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas
          
          if (fechaExamen < hoy) {
            return false; // Fecha pasada
          }
        } catch (error) {
          return false; // Fecha inválida
        }
        
        return true;
      case 2:
        return formData.temario.trim() !== '' && 
               formData.temario.split('\n').filter(line => line.trim() !== '').length >= 1;
      case 3:
        return true; // Material es opcional
      case 4:
        return true; // Confirmación
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      // Mostrar mensaje de error específico
      if (currentStep === 1) {
        try {
          const fechaISO = convertToISODate(formData.fecha);
          const fechaExamen = new Date(fechaISO);
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);
          
          if (fechaExamen < hoy) {
            Alert.alert('Error', 'La fecha del examen debe ser futura o igual a hoy');
            return;
          }
        } catch (error) {
          Alert.alert('Error', 'Formato de fecha inválido. Use DD/MM/YYYY');
          return;
        }
        
        Alert.alert('Error', 'Completa todos los campos requeridos');
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFileUpload = async () => {
    try {
      setIsLoading(true);
      
      // Si no hay examen creado aún, crear uno temporal
      let examenId = currentExamenId;
      
      if (!examenId) {
        // Crear examen temporal para poder subir archivos
        const fechaISO = convertToISODate(formData.fecha);
        
        const examenData = {
          alumno_id: user?.usuario?.usuario_id,
          nombre: formData.nombre.trim() || 'Examen Temporal',
          materia: formData.materia.trim() || 'Materia Temporal',
          fecha: fechaISO,
          temario: formData.temario.trim() || 'Temario temporal',
          total_sesiones_planificadas: 0,
          material_id: null,
        };

        const { data, error } = await supabase
          .from('examen')
          .insert([examenData])
          .select()
          .single();

        if (error) {
          Alert.alert('Error', `Error al crear examen temporal: ${error.message}`);
          return;
        }

        examenId = data.examen_id;
        setCurrentExamenId(examenId);
      }
      
      const result = await uploadCompleteFile(examenId);
      
      if (result.success) {
        // Agregar archivo a la lista
        setUploadedFiles(prev => [...prev, {
          fileName: result.fileName!,
          fileSize: result.fileSize!,
          mimeType: result.mimeType!,
        }]);
        
        Alert.alert('¡Éxito!', `Archivo "${result.fileName}" subido correctamente`);
      } else {
        Alert.alert('Error', result.error || 'Error al subir archivo');
      }
    } catch (error) {
      console.error('Error al subir archivo:', error);
      Alert.alert('Error', 'Error inesperado al subir archivo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.usuario?.usuario_id) {
      Alert.alert('Error', 'No hay usuario autenticado');
      return;
    }

    setIsLoading(true);
    try {
      // Si ya existe un examen (por archivos subidos), actualizarlo
      if (currentExamenId) {
        const fechaISO = convertToISODate(formData.fecha);
        
        const { error } = await supabase
          .from('examen')
          .update({
            nombre: formData.nombre.trim(),
            materia: formData.materia.trim(),
            fecha: fechaISO,
            temario: formData.temario.trim(),
          })
          .eq('examen_id', currentExamenId);

        if (error) {
          console.error('Error al actualizar examen:', error);
          Alert.alert('Error', `Error al actualizar examen: ${error.message}`);
          return;
        }

        console.log('Examen actualizado exitosamente');
        Alert.alert('¡Éxito!', 'Examen creado correctamente', [
          { text: 'OK', onPress: () => router.push('/(tabs)/calendario') }
        ]);
      } else {
        // Crear nuevo examen si no existe
        const fechaISO = convertToISODate(formData.fecha);
        
        const examenData = {
          alumno_id: user.usuario.usuario_id,
          nombre: formData.nombre.trim(),
          materia: formData.materia.trim(),
          fecha: fechaISO,
          temario: formData.temario.trim(),
          total_sesiones_planificadas: 0,
          material_id: null,
        };

        console.log('Datos del examen a insertar:', examenData);

        const { data, error } = await supabase
          .from('examen')
          .insert([examenData])
          .select()
          .single();

        if (error) {
          console.error('Error al crear examen:', error);
          Alert.alert('Error', `Error al crear examen: ${error.message}`);
          return;
        }

        console.log('✅ Examen creado exitosamente:', data);
        const examenId = data.examen_id;
        
        // Automáticamente crear sesiones de estudio para este examen
        if (user?.usuario?.usuario_id && examenId) {
          console.log('🔄 Creando sesiones de estudio automáticamente...');
          try {
            const resultado = await distribuirSesionesParaExamen(examenId, user.usuario.usuario_id);
            
            if (resultado.error) {
              console.error('⚠️ Error al crear sesiones:', resultado.error);
              Alert.alert(
                'Examen creado',
                `El examen se creó correctamente, pero hubo un problema al generar las sesiones de estudio: ${resultado.error}`,
                [
                  { text: 'OK', onPress: () => router.push('/(tabs)/calendario') }
                ]
              );
            } else {
              console.log(`✅ ${resultado.sesiones_creadas} sesiones de estudio creadas automáticamente`);
              Alert.alert(
                '¡Éxito!',
                `Examen creado correctamente.\n\nSe generaron ${resultado.sesiones_creadas} sesiones de estudio automáticamente.`,
                [
                  { text: 'OK', onPress: () => router.push('/(tabs)/calendario') }
                ]
              );
            }
          } catch (error) {
            console.error('❌ Error al crear sesiones automáticamente:', error);
            Alert.alert(
              'Examen creado',
              'El examen se creó correctamente, pero hubo un problema al generar las sesiones de estudio. Puedes generarlas manualmente desde el calendario.',
              [
                { text: 'OK', onPress: () => router.push('/(tabs)/calendario') }
              ]
            );
          }
        } else {
          // Si no hay usuario o examen_id, solo mostrar éxito
          Alert.alert('¡Éxito!', 'Examen creado correctamente', [
            { text: 'OK', onPress: () => router.push('/(tabs)/calendario') }
          ]);
        }
      }

    } catch (error) {
      console.error('Error inesperado:', error);
      Alert.alert('Error', 'Error inesperado al crear el examen');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Información Básica</Text>
      <Text style={styles.stepSubtitle}>Completa los datos principales del examen</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nombre del Examen</Text>
        <TextInput
          style={styles.input}
          value={formData.nombre}
          onChangeText={(text) => setFormData(prev => ({ ...prev, nombre: text }))}
          placeholder="Ej: Parcial de Matemáticas"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Materia</Text>
        <TextInput
          style={styles.input}
          value={formData.materia}
          onChangeText={(text) => setFormData(prev => ({ ...prev, materia: text }))}
          placeholder="Ej: Matemáticas, Historia, etc."
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Fecha del Examen</Text>
        <DateInput
          value={formData.fecha}
          onChangeText={(text) => setFormData(prev => ({ ...prev, fecha: text }))}
          placeholder="DD/MM/YYYY"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Temario</Text>
      <Text style={styles.stepSubtitle}>Lista los temas que incluye el examen (uno por línea)</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Temas del Examen</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={formData.temario}
          onChangeText={(text) => setFormData(prev => ({ ...prev, temario: text }))}
          placeholder="Ejemplo:&#10;• Funciones lineales&#10;• Ecuaciones cuadráticas&#10;• Geometría básica"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          onBlur={() => {
            // Cerrar el teclado cuando se pierde el foco
            Keyboard.dismiss();
          }}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Material de Estudio</Text>
      <Text style={styles.stepSubtitle}>Sube archivos relacionados con el examen (opcional)</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Archivos</Text>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={handleFileUpload}
          disabled={isLoading}
        >
          <Text style={styles.uploadButtonText}>
            {isLoading ? '⏳ Subiendo...' : '📁 Seleccionar Archivos'}
          </Text>
          <Text style={styles.uploadSubtext}>PDFs, imágenes, documentos</Text>
        </TouchableOpacity>
        
        {uploadedFiles.length > 0 && (
          <View style={styles.filesList}>
            <Text style={styles.filesListTitle}>Archivos subidos:</Text>
            {uploadedFiles.map((file, index) => (
              <View key={index} style={styles.fileItem}>
                <Text style={styles.fileName}>📄 {file.fileName}</Text>
                <Text style={styles.fileSize}>
                  {(file.fileSize / 1024).toFixed(1)} KB
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Confirmar Datos</Text>
      <Text style={styles.stepSubtitle}>Revisa la información antes de crear el examen</Text>
      
      <View style={styles.confirmationContainer}>
        <View style={styles.confirmationItem}>
          <Text style={styles.confirmationLabel}>Nombre:</Text>
          <Text style={styles.confirmationValue}>{formData.nombre}</Text>
        </View>
        
        <View style={styles.confirmationItem}>
          <Text style={styles.confirmationLabel}>Materia:</Text>
          <Text style={styles.confirmationValue}>{formData.materia}</Text>
        </View>
        
        <View style={styles.confirmationItem}>
          <Text style={styles.confirmationLabel}>Fecha:</Text>
          <Text style={styles.confirmationValue}>{formData.fecha}</Text>
        </View>
        
        <View style={styles.confirmationItem}>
          <Text style={styles.confirmationLabel}>Temas:</Text>
          <Text style={styles.confirmationValue}>
            {formData.temario.split('\n').filter(line => line.trim() !== '').length} temas
          </Text>
        </View>
        
        <View style={styles.confirmationItem}>
          <Text style={styles.confirmationLabel}>Archivos:</Text>
          <Text style={styles.confirmationValue}>
            {uploadedFiles.length} archivo{uploadedFiles.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No hay usuario autenticado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Crear Examen</Text>
        <Text style={styles.stepIndicator}>Paso {currentStep} de 4</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            {renderCurrentStep()}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(currentStep / 4) * 100}%` }]} />
        </View>
        
        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity onPress={handleBack} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Anterior</Text>
            </TouchableOpacity>
          )}
          
          {currentStep < 4 ? (
            <TouchableOpacity 
              onPress={handleNext} 
              style={[styles.primaryButton, !canProceed() && styles.disabledButton]}
              disabled={!canProceed()}
            >
              <Text style={styles.primaryButtonText}>Siguiente</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={handleSave} 
              style={[styles.primaryButton, isLoading && styles.disabledButton]}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Creando...' : 'Crear Examen'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  stepIndicator: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#1F2937',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#7C3AED',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '600',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#6B7280',
  },
  filesList: {
    marginTop: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  filesListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  fileName: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  fileSize: {
    fontSize: 12,
    color: '#6B7280',
  },
  confirmationContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
  },
  confirmationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  confirmationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  confirmationValue: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 50,
  },
});
