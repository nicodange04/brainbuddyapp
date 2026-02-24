// scripts/ejecutar-migracion-perfil-service.ts
// Script para ejecutar la migración usando Service Role Key (permisos completos)
// ⚠️ IMPORTANTE: Este script requiere la Service Role Key que tiene permisos completos
// Ejecutar con: npx ts-node scripts/ejecutar-migracion-perfil-service.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
// Para migraciones, necesitamos la SERVICE ROLE KEY (no la anon key)
// Esta key tiene permisos completos para ejecutar cualquier SQL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Error: Falta EXPO_PUBLIC_SUPABASE_URL');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Error: Falta SUPABASE_SERVICE_ROLE_KEY');
  console.error('\n📝 Para obtener tu Service Role Key:');
  console.error('   1. Ve a https://supabase.com/dashboard');
  console.error('   2. Selecciona tu proyecto');
  console.error('   3. Ve a Settings > API');
  console.error('   4. Copia la "service_role" key (NO la anon key)');
  console.error('   5. Agrégala a tu archivo .env como:');
  console.error('      SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui\n');
  console.error('   ⚠️  IMPORTANTE: Nunca expongas esta key en el cliente\n');
  process.exit(1);
}

// Crear cliente con service role key (tiene permisos completos)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function ejecutarSQL(sql: string): Promise<boolean> {
  try {
    if (!supabaseUrl) {
      throw new Error('supabaseUrl no está definido');
    }
    // Supabase no tiene un método directo para ejecutar SQL arbitrario desde el cliente
    // Necesitamos usar una función RPC o el REST API directamente
    
    // Opción 1: Usar REST API directamente
    const url = String(supabaseUrl) + '/rest/v1/rpc/exec_sql';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey || '',
        'Authorization': `Bearer ${supabaseServiceKey || ''}`,
      },
      body: JSON.stringify({ sql_query: sql }),
    });

    if (!response.ok) {
      // Si no existe la función RPC, intentar método alternativo
      console.log('   ⚠️  No se puede ejecutar directamente desde el cliente');
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

async function ejecutarMigracion() {
  console.log('🚀 Ejecutando migración: perfil_aprendizaje (con Service Role Key)\n');

  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../sql/migration_perfil_aprendizaje.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    console.log('📋 Contenido del archivo SQL:');
    console.log('─'.repeat(60));
    console.log(sqlContent);
    console.log('─'.repeat(60));
    console.log('\n');

    console.log('⚠️  IMPORTANTE:');
    console.log('   Supabase no permite ejecutar SQL arbitrario desde el cliente JavaScript.');
    console.log('   Necesitas ejecutar esta migración desde el SQL Editor de Supabase.\n');
    console.log('📝 INSTRUCCIONES:');
    console.log('   1. Ve a https://supabase.com/dashboard');
    console.log('   2. Selecciona tu proyecto');
    console.log('   3. Abre "SQL Editor" en el menú lateral');
    console.log('   4. Crea una nueva query');
    console.log('   5. Copia y pega el contenido mostrado arriba');
    console.log('   6. Haz clic en "Run" o presiona Ctrl+Enter\n');
    console.log('   O usa este comando para copiar el SQL al portapapeles:\n');
    console.log('   (En Windows PowerShell):');
    console.log('   Get-Content sql/migration_perfil_aprendizaje.sql | Set-Clipboard\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

ejecutarMigracion();
