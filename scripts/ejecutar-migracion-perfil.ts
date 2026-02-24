// scripts/ejecutar-migracion-perfil.ts
// Script para ejecutar la migración de perfil_aprendizaje desde la terminal
// Ejecutar con: npx ts-node scripts/ejecutar-migracion-perfil.ts

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Cargar variables de entorno
dotenv.config();

// Para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('   EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function ejecutarMigracion() {
  console.log('🚀 Migración: perfil_aprendizaje\n');
  console.log('─'.repeat(70));

  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '../sql/migration_perfil_aprendizaje.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');

    console.log('\n📄 CONTENIDO DEL ARCHIVO SQL:\n');
    console.log(sqlContent);
    console.log('\n' + '─'.repeat(70));

    console.log('\n📋 RESUMEN:');
    console.log('   ⚠️  Supabase no permite ejecutar SQL arbitrario desde el cliente JavaScript');
    console.log('   por seguridad. Necesitas ejecutar esta migración desde el SQL Editor.\n');
    console.log('   ✅ OPCIÓN RECOMENDADA: SQL Editor de Supabase\n');
    console.log('   📝 INSTRUCCIONES:');
    console.log('   1. Ve a https://supabase.com/dashboard');
    console.log('   2. Selecciona tu proyecto');
    console.log('   3. Abre "SQL Editor" en el menú lateral');
    console.log('   4. Crea una nueva query (botón "New query")');
    console.log('   5. Copia y pega el contenido mostrado arriba');
    console.log('   6. Haz clic en "Run" o presiona Ctrl+Enter\n');
    console.log('   💡 TIP: En Windows PowerShell puedes copiar el SQL al portapapeles con:');
    console.log('      Get-Content sql/migration_perfil_aprendizaje.sql | Set-Clipboard\n');

  } catch (error: any) {
    console.error('❌ Error ejecutando migración:', error.message);
    process.exit(1);
  }
}

ejecutarMigracion();
