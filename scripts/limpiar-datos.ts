// Script para limpiar todos los datos de la base de datos
// Mantiene las tablas pero elimina todos los registros
// 
// ⚠️ ADVERTENCIA: Este script eliminará TODOS los datos
// 
// Ejecutar con: npx ts-node scripts/limpiar-datos.ts

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('   EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Leer el archivo SQL
const sqlPath = path.join(__dirname, '../sql/limpiar_datos.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

// Función para pedir confirmación
function pregunta(consulta: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(consulta, (respuesta) => {
      rl.close();
      resolve(respuesta);
    });
  });
}

async function limpiarDatos() {
  console.log('⚠️  ⚠️  ⚠️  ADVERTENCIA ⚠️  ⚠️  ⚠️');
  console.log('Este script eliminará TODOS los datos de la base de datos.');
  console.log('Las tablas se mantendrán pero quedarán vacías.\n');

  const respuesta = await pregunta('¿Estás seguro? Escribe "SI" para continuar: ');

  if (respuesta !== 'SI') {
    console.log('❌ Operación cancelada.');
    process.exit(0);
  }

  console.log('\n🧹 Limpiando datos...\n');

  // Dividir el SQL en comandos individuales
  const comandos = sql
    .split(';')
    .map((cmd) => cmd.trim())
    .filter((cmd) => cmd.length > 0 && !cmd.startsWith('--') && !cmd.startsWith('SET'));

  // Ejecutar cada comando
  for (const comando of comandos) {
    if (comando.startsWith('TRUNCATE')) {
      const tabla = comando.match(/TRUNCATE TABLE IF EXISTS (\w+)/)?.[1];
      if (tabla) {
        console.log(`🗑️  Limpiando tabla: ${tabla}`);
        const { error } = await supabase.rpc('exec_sql', { sql_query: comando + ';' });
        if (error) {
          // Si la función RPC no existe, intentar DELETE directo
          const { error: deleteError } = await supabase.from(tabla).delete().neq('id', '00000000-0000-0000-0000-000000000000');
          if (deleteError) {
            console.error(`   ⚠️  Error en ${tabla}:`, deleteError.message);
          } else {
            console.log(`   ✅ ${tabla} limpiada`);
          }
        } else {
          console.log(`   ✅ ${tabla} limpiada`);
        }
      }
    }
  }

  // Verificar que las tablas están vacías
  console.log('\n📊 Verificando que las tablas están vacías...\n');

  const tablas = [
    'usuarios',
    'alumno',
    'padre',
    'examen',
    'sesion_estudio',
    'disponibilidad',
    'padre_alumno',
    'mini_quiz',
    'quiz_attempt',
    'avatar_trofeo',
    'reporte_general',
    'reporte_detallado',
  ];

  for (const tabla of tablas) {
    const { count, error } = await supabase.from(tabla).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`   ⚠️  ${tabla}: Error al verificar`);
    } else {
      console.log(`   ${count === 0 ? '✅' : '❌'} ${tabla}: ${count || 0} filas`);
    }
  }

  console.log('\n✅ Proceso completado!');
  console.log('Las tablas están vacías pero la estructura se mantiene.');
}

limpiarDatos().catch(console.error);
