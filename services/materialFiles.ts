import { supabase } from './supabase';

/**
 * Interfaz para representar un archivo de material
 */
export interface ArchivoMaterial {
  file_id: string;
  file_url: string;
  file_name: string;
  mimetype: string;
  tamano_bytes: number;
}

/**
 * Obtiene todos los archivos asociados a un examen
 * Consulta las tablas material y materialfile para obtener las URLs de los archivos
 * 
 * @param examenId - ID del examen
 * @returns Array de archivos con sus URLs y metadatos
 */
export async function getArchivosDeExamen(examenId: string): Promise<ArchivoMaterial[]> {
  try {
    console.log(`📁 Obteniendo archivos del examen ${examenId}...`);

    // 1. Obtener todos los materiales asociados al examen
    const { data: materiales, error: materialesError } = await supabase
      .from('material')
      .select('material_id')
      .eq('examen_id', examenId);

    if (materialesError) {
      console.error('❌ Error al obtener materiales:', materialesError);
      throw materialesError;
    }

    if (!materiales || materiales.length === 0) {
      console.log('ℹ️ No hay materiales asociados al examen');
      return [];
    }

    const materialIds = materiales.map(m => m.material_id);

    // 2. Obtener todos los archivos de esos materiales
    const { data: archivos, error: archivosError } = await supabase
      .from('materialfile')
      .select('file_id, file_url, file_name, mimetype, tamano_bytes')
      .in('material_id', materialIds);

    if (archivosError) {
      console.error('❌ Error al obtener archivos:', archivosError);
      throw archivosError;
    }

    if (!archivos || archivos.length === 0) {
      console.log('ℹ️ No hay archivos asociados a los materiales');
      return [];
    }

    console.log(`✅ Se encontraron ${archivos.length} archivo(s)`);

    return archivos.map(archivo => ({
      file_id: archivo.file_id,
      file_url: archivo.file_url,
      file_name: archivo.file_name,
      mimetype: archivo.mimetype,
      tamano_bytes: archivo.tamano_bytes,
    }));
  } catch (error) {
    console.error('❌ Error completo al obtener archivos del examen:', error);
    throw error;
  }
}

/**
 * Obtiene el texto de los archivos (placeholder para implementación futura)
 * Por ahora retorna un string vacío, pero en el futuro podría extraer texto de PDFs/Word
 * 
 * @param archivos - Array de archivos
 * @returns Texto extraído de los archivos
 */
export async function extraerTextoDeArchivos(archivos: ArchivoMaterial[]): Promise<string> {
  // TODO: Implementar extracción de texto de PDFs/Word
  // Por ahora retornamos string vacío
  // En el futuro, podríamos usar servicios como pdf-parse, mammoth, etc.
  
  if (archivos.length === 0) {
    return '';
  }

  console.log(`📄 Extrayendo texto de ${archivos.length} archivo(s)...`);
  
  // Por ahora, solo retornamos información sobre los archivos
  const infoArchivos = archivos
    .map(archivo => `Archivo: ${archivo.file_name} (${archivo.mimetype})`)
    .join('\n');

  console.log('ℹ️ Extracción de texto no implementada aún');
  return infoArchivos;
}




