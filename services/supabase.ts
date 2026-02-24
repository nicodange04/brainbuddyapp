// services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

// Configuración de Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validar que las variables estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERROR: Variables de entorno de Supabase no configuradas');
  console.error('   EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
  console.error('   Verifica que el archivo .env existe y tiene las variables correctas');
}

// Adaptador para almacenamiento seguro en React Native
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// Crear cliente Supabase (solo si las variables están definidas)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });

// Tipos para la base de datos (basados en tu estructura actual)
export interface Usuario {
  usuario_id: string;
  nombre: string;
  apellido: string;
  correo: string;
  password_hash: string;
  rol: 'alumno' | 'padre' | 'admin';
  codigo_vinculacion?: string;
  fecha_nacimiento?: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Alumno {
  alumno_id: string;
  ranking_id?: number;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Padre {
  padre_id: string;
  telefono?: string;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  admin_id: string;
  created_at: string;
  updated_at: string;
}

export interface Suscripcion {
  suscripcion_id: string;
  usuario_id: string;
  plan: string;
  estado: string;
  fecha_inicio: string;
  fecha_fin?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

// Función para probar la conexión
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('usuarios').select('count').limit(1);
    if (error) {
      console.error('Error de conexión Supabase:', error);
      return false;
    }
    console.log('✅ Conexión Supabase exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión Supabase:', error);
    return false;
  }
};
