// Script para explorar la base de datos Supabase
// Ejecutar con: npx ts-node scripts/explore-supabase.ts

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Faltan variables de entorno EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface TableInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

async function getTableSchema(tableName: string): Promise<TableInfo[]> {
  const { data, error } = await supabase.rpc('get_table_schema', { table_name: tableName });
  
  if (error) {
    // Si la función no existe, intentar consulta directa
    const { data: directData, error: directError } = await supabase
      .from('information_schema.columns')
      .select('table_name, column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', tableName);
    
    if (directError) {
      console.error(`Error obteniendo esquema de ${tableName}:`, directError);
      return [];
    }
    
    return directData as TableInfo[];
  }
  
  return data as TableInfo[];
}

async function listAllTables(): Promise<string[]> {
  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .eq('table_type', 'BASE TABLE');
  
  if (error) {
    console.error('Error listando tablas:', error);
    return [];
  }
  
  return (data as { table_name: string }[]).map(t => t.table_name);
}

async function getTableRowCount(tableName: string): Promise<number> {
  const { count, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.error(`Error contando filas de ${tableName}:`, error);
    return 0;
  }
  
  return count || 0;
}

async function exploreDatabase() {
  console.log('🔍 Explorando base de datos Supabase...\n');
  console.log(`URL: ${supabaseUrl}\n`);
  
  // Listar todas las tablas
  console.log('📋 Listando tablas...');
  const tables = await listAllTables();
  
  if (tables.length === 0) {
    console.log('⚠️  No se encontraron tablas o no tienes permisos para acceder a information_schema');
    console.log('\n📊 Intentando acceder directamente a las tablas conocidas...\n');
    
    const knownTables = [
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
    
    for (const table of knownTables) {
      const count = await getTableRowCount(table);
      if (count >= 0) {
        console.log(`✅ ${table}: ${count} filas`);
      }
    }
    
    return;
  }
  
  console.log(`\n✅ Encontradas ${tables.length} tablas:\n`);
  
  // Para cada tabla, mostrar información
  for (const table of tables) {
    const count = await getTableRowCount(table);
    console.log(`📊 ${table}: ${count} filas`);
    
    // Intentar obtener algunas filas de ejemplo
    if (count > 0 && count < 100) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(3);
      
      if (!error && data && data.length > 0) {
        console.log(`   Ejemplo de estructura:`);
        const firstRow = data[0];
        const keys = Object.keys(firstRow);
        console.log(`   Campos: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
      }
    }
    console.log('');
  }
  
  // Mostrar relaciones importantes
  console.log('\n🔗 Relaciones principales:');
  console.log('   usuarios -> alumno (1:1)');
  console.log('   usuarios -> padre (1:1)');
  console.log('   usuarios -> examen (1:N)');
  console.log('   examen -> sesion_estudio (1:N)');
  console.log('   sesion_estudio -> mini_quiz (1:1)');
  console.log('   mini_quiz -> quiz_attempt (1:N)');
  console.log('   padre -> padre_alumno -> alumno (N:M)');
}

// Ejecutar exploración
exploreDatabase().catch(console.error);
