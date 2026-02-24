import * as DocumentPicker from 'expo-document-picker';
import { supabase } from './supabase';

export interface FileUploadResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  fileUri?: string; // URI del archivo seleccionado
  error?: string;
}

export interface MaterialData {
  material_id: string;
  examen_id: string;
  tipo: string;
}

export interface MaterialFileData {
  file_id: string;
  material_id: string;
  file_url: string;
  file_name: string;
  mimetype: string;
  tamano_bytes: number;
}

/**
 * Selecciona un archivo del dispositivo
 */
export const selectFile = async (): Promise<FileUploadResult> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*', 'text/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return {
        success: false,
        error: 'Selección de archivo cancelada'
      };
    }

    const file = result.assets[0];
    
    return {
      success: true,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.mimeType,
      fileUri: file.uri, // Agregar la URI del archivo
    };
  } catch (error) {
    console.error('Error al seleccionar archivo:', error);
    return {
      success: false,
      error: 'Error al seleccionar archivo'
    };
  }
};

/**
 * Sube un archivo a Supabase Storage - VERSIÓN SIMPLIFICADA
 */
export const uploadFileToStorage = async (
  fileUri: string,
  fileName: string,
  bucketName: string = 'materiales'
): Promise<FileUploadResult> => {
  try {
    console.log('Iniciando subida de archivo:', fileName);
    console.log('URI del archivo:', fileUri);
    
    // Crear un nombre único para el archivo
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${fileName}`;
    
    // Método más simple: usar fetch para leer el archivo
    const response = await fetch(fileUri);
    if (!response.ok) {
      throw new Error(`Error al leer archivo: ${response.status}`);
    }
    
    // Obtener el array buffer
    const arrayBuffer = await response.arrayBuffer();
    
    console.log('Archivo leído, tamaño:', arrayBuffer.byteLength);
    
    // Subir directamente el ArrayBuffer a Supabase
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFileName, arrayBuffer, {
        contentType: 'application/octet-stream',
      });

    if (error) {
      console.error('Error de Supabase Storage:', error);
      return {
        success: false,
        error: `Error al subir archivo: ${error.message}`
      };
    }

    console.log('Archivo subido exitosamente:', data);

    // Obtener la URL pública del archivo
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uniqueFileName);

    console.log('URL pública:', urlData.publicUrl);

    return {
      success: true,
      fileUrl: urlData.publicUrl,
      fileName: fileName,
      fileSize: arrayBuffer.byteLength,
      mimeType: 'application/octet-stream',
    };
  } catch (error) {
    console.error('Error completo en uploadFileToStorage:', error);
    return {
      success: false,
      error: `Error inesperado: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

/**
 * Crea un registro de material en la base de datos
 */
export const createMaterialRecord = async (
  examenId: string,
  tipo: string = 'general'
): Promise<{ success: boolean; materialId?: string; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('material')
      .insert([{
        examen_id: examenId,
        tipo: tipo,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error al crear material:', error);
      return {
        success: false,
        error: `Error al crear material: ${error.message}`
      };
    }

    return {
      success: true,
      materialId: data.material_id,
    };
  } catch (error) {
    console.error('Error inesperado al crear material:', error);
    return {
      success: false,
      error: 'Error inesperado al crear material'
    };
  }
};

/**
 * Crea un registro de archivo en la base de datos
 */
export const createMaterialFileRecord = async (
  materialId: string,
  fileData: {
    fileUrl: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }
): Promise<{ success: boolean; fileId?: string; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('materialfile')
      .insert([{
        material_id: materialId,
        file_url: fileData.fileUrl,
        file_name: fileData.fileName,
        mimetype: fileData.mimeType,
        tamano_bytes: fileData.fileSize,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error al crear archivo:', error);
      return {
        success: false,
        error: `Error al crear archivo: ${error.message}`
      };
    }

    return {
      success: true,
      fileId: data.file_id,
    };
  } catch (error) {
    console.error('Error inesperado al crear archivo:', error);
    return {
      success: false,
      error: 'Error inesperado al crear archivo'
    };
  }
};

/**
 * Función completa para subir un archivo (seleccionar + subir + guardar en BD)
 */
export const uploadCompleteFile = async (
  examenId: string,
  bucketName: string = 'materiales'
): Promise<FileUploadResult> => {
  try {
    // 1. Seleccionar archivo
    const fileSelection = await selectFile();
    if (!fileSelection.success) {
      return fileSelection;
    }

    // 2. Crear registro de material
    const materialResult = await createMaterialRecord(examenId);
    if (!materialResult.success) {
      return {
        success: false,
        error: materialResult.error
      };
    }

    // 3. Subir archivo a Storage
    const uploadResult = await uploadFileToStorage(
      fileSelection.fileUri!, // URI del archivo
      fileSelection.fileName!,
      bucketName
    );
    
    if (!uploadResult.success) {
      return uploadResult;
    }

    // 4. Crear registro de archivo
    const fileRecordResult = await createMaterialFileRecord(
      materialResult.materialId!,
      {
        fileUrl: uploadResult.fileUrl!,
        fileName: uploadResult.fileName!,
        mimeType: uploadResult.mimeType!,
        fileSize: uploadResult.fileSize!,
      }
    );

    if (!fileRecordResult.success) {
      return {
        success: false,
        error: fileRecordResult.error
      };
    }

    return {
      success: true,
      fileUrl: uploadResult.fileUrl,
      fileName: uploadResult.fileName,
      fileSize: uploadResult.fileSize,
      mimeType: uploadResult.mimeType,
    };
  } catch (error) {
    console.error('Error en uploadCompleteFile:', error);
    return {
      success: false,
      error: 'Error inesperado en el proceso de subida'
    };
  }
};
