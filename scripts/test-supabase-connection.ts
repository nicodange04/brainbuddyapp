// Script para probar la conexión con Supabase
// Ejecutar con: npx ts-node scripts/test-supabase-connection.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('   EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
  process.exit(1);
}

console.log('🔌 Probando conexión con Supabase...\n');
console.log(`URL: ${supabaseUrl}\n`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Probar conexión básica
    console.log('1️⃣ Probando conexión básica...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.error('❌ Error de conexión:', healthError.message);
      console.error('   Código:', healthError.code);
      
      if (healthError.code === 'PGRST301' || healthError.message.includes('paused')) {
        console.error('\n⚠️  Tu base de datos parece estar PAUSADA');
        console.error('   Ve a https://supabase.com/dashboard');
        console.error('   Selecciona tu proyecto y haz clic en "Resume" para reactivarla\n');
      }
      
      return false;
    }
    
    console.log('✅ Conexión exitosa!\n');
    
    // Probar acceso a tablas principales
    console.log('2️⃣ Verificando acceso a tablas...\n');
    
    const tables = [
      'usuarios',
      'alumno',
      'padre',
      'disponibilidad',
      'examen',
      'sesion_estudio',
      'mini_quiz',
      'quiz_attempt',
      'padre_alumno',
      'avatar_trofeo',
      'reporte_general',
      'reporte_detallado'
    ];
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`   ❌ ${table}: Error - ${error.message}`);
        } else {
          console.log(`   ✅ ${table}: ${count || 0} filas`);
        }
      } catch (err) {
        console.log(`   ❌ ${table}: Error inesperado`);
      }
    }
    
    console.log('\n✅ Todas las pruebas completadas');
    console.log('\n💡 Si todas las tablas tienen 0 filas, tu base de datos está vacía pero funcionando');
    console.log('   Si hay errores, verifica que las tablas existan en Supabase\n');
    
    return true;
  } catch (error: any) {
    console.error('❌ Error inesperado:', error.message);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
