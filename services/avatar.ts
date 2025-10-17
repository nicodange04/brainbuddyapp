// Servicio para generar avatares automáticos y códigos de vinculación

// Colores predefinidos para avatares
export const AVATAR_COLORS = [
  '#3B82F6', // azul
  '#10B981', // verde
  '#8B5CF6', // morado
  '#F59E0B', // naranja
  '#EC4899', // rosa
] as const;

export type AvatarColor = typeof AVATAR_COLORS[number];

// Caracteres para generar códigos de vinculación
const CODIGO_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Genera las iniciales de un nombre completo
 * @param nombre - Nombre completo (ej: "Juan Pérez")
 * @returns Iniciales (ej: "JP")
 */
export function generarIniciales(nombre: string): string {
  if (!nombre || nombre.trim() === '') {
    return '??';
  }

  const palabras = nombre.trim().split(/\s+/);
  
  if (palabras.length === 1) {
    // Si solo hay una palabra, toma las primeras 2 letras
    return palabras[0].substring(0, 2).toUpperCase();
  }
  
  // Si hay múltiples palabras, toma la primera letra de las primeras 2
  const primera = palabras[0].charAt(0).toUpperCase();
  const segunda = palabras[1].charAt(0).toUpperCase();
  
  return primera + segunda;
}

/**
 * Selecciona un color aleatorio para el avatar
 * @returns Color hexadecimal
 */
export function seleccionarColorAleatorio(): AvatarColor {
  const indice = Math.floor(Math.random() * AVATAR_COLORS.length);
  return AVATAR_COLORS[indice];
}

/**
 * Genera un código de vinculación de 6 dígitos alfanumérico
 * @returns Código de 6 caracteres (ej: "ABC123")
 */
export function generarCodigoVinculacion(): string {
  let codigo = '';
  
  for (let i = 0; i < 6; i++) {
    const indice = Math.floor(Math.random() * CODIGO_CHARS.length);
    codigo += CODIGO_CHARS.charAt(indice);
  }
  
  return codigo;
}

/**
 * Genera un avatar completo con iniciales y color
 * @param nombre - Nombre completo del usuario
 * @returns Objeto con iniciales y color
 */
export function generarAvatar(nombre: string): {
  iniciales: string;
  color: AvatarColor;
} {
  return {
    iniciales: generarIniciales(nombre),
    color: seleccionarColorAleatorio(),
  };
}

/**
 * Valida si un código de vinculación tiene el formato correcto
 * @param codigo - Código a validar
 * @returns true si es válido
 */
export function validarCodigoVinculacion(codigo: string): boolean {
  if (!codigo || codigo.length !== 6) {
    return false;
  }
  
  // Verifica que todos los caracteres sean alfanuméricos
  return /^[A-Z0-9]{6}$/.test(codigo.toUpperCase());
}

/**
 * Formatea un código de vinculación para mostrar (ej: "ABC-123")
 * @param codigo - Código sin formato
 * @returns Código formateado
 */
export function formatearCodigoVinculacion(codigo: string): string {
  if (!codigo || codigo.length !== 6) {
    return codigo;
  }
  
  return `${codigo.substring(0, 3)}-${codigo.substring(3, 6)}`;
}
