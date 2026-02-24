// Script para verificar los nombres reales de las tablas
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarTablas() {
  console.log('🔍 Verificando nombres reales de las tablas...\n');

  // Lista de posibles nombres de tablas
  const posiblesTablas = [
    'usuarios',
    'alumno',
    'padre',
    'examen',
    'sesionestudio',
    'sesion_estudio',
    'disponibilidad',
    'padre_alumno',
    'miniquiz',
    'mini_quiz',
    'quiz_attempt',
    'quizattempt',
    'avatar_trofeo',
    'avatar_trofeos',
    'reporte_general',
    'reporte_detallado',
    'material',
    'materialfile',
    'perfil_aprendizaje',
    'alumno_amigo',
  ];

  const tablasExistentes: string[] = [];

  console.log('Verificando cada tabla...\n');
  for (const tabla of posiblesTablas) {
    try {
      const { count, error } = await supabase
        .from(tabla)
        .select('*', { count: 'exact', head: true });

      if (!error && count !== null) {
        tablasExistentes.push(tabla);
        console.log(`  ✅ ${tabla} - ${count} filas`);
      }
    } catch (error) {
      // Tabla no existe
    }
  }

  console.log(`\n📊 RESUMEN:`);
  console.log(`   Total de tablas encontradas: ${tablasExistentes.length}`);
  console.log(`\n   Tablas existentes:`);
  tablasExistentes.forEach((t) => console.log(`     - ${t}`));

  return tablasExistentes;
}

verificarTablas().catch(console.error);
