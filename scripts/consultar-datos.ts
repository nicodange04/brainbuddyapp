// Script temporal para consultar datos de las tablas
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function consultarDatos() {
  console.log('📊 CONSULTANDO DATOS DE LAS TABLAS:\n');

  // Usuarios
  const { data: usuarios, error: errorUsuarios } = await supabase
    .from('usuarios')
    .select('*')
    .limit(10);

  if (errorUsuarios) {
    console.error('❌ Error consultando usuarios:', errorUsuarios);
  } else {
    console.log(`👥 USUARIOS (${usuarios?.length || 0} encontrados):`);
    usuarios?.forEach((u: any, i) => {
      console.log(`  ${i + 1}. ${u.nombre || 'N/A'} ${u.apellido || ''}`);
      console.log(`     - Rol: ${u.rol || 'N/A'}`);
      console.log(`     - Email: ${u.correo || 'N/A'}`);
      console.log(`     - Código vinculación: ${u.codigo_vinculacion || 'N/A'}`);
      console.log(`     - Columnas disponibles: ${Object.keys(u).join(', ')}`);
    });
  }

  // Alumnos
  const { data: alumnos, error: errorAlumnos } = await supabase
    .from('alumno')
    .select('alumno_id, codigo_vinculacion, puntos_totales, racha_dias')
    .limit(10);

  if (errorAlumnos) {
    console.error('❌ Error consultando alumnos:', errorAlumnos);
  } else {
    console.log(`\n🎓 ALUMNOS (${alumnos?.length || 0} encontrados):`);
    alumnos?.forEach((a, i) => {
      console.log(`  ${i + 1}. ID: ${a.alumno_id.substring(0, 8)}...`);
      console.log(`     - Código: ${a.codigo_vinculacion || 'N/A'}`);
      console.log(`     - Puntos: ${a.puntos_totales || 0}`);
      console.log(`     - Racha: ${a.racha_dias || 0} días`);
    });
  }

  // Exámenes
  const { data: examenes, error: errorExamenes } = await supabase
    .from('examen')
    .select('*')
    .limit(10);

  if (errorExamenes) {
    console.error('❌ Error consultando exámenes:', errorExamenes);
  } else {
    console.log(`\n📝 EXÁMENES (${examenes?.length || 0} encontrados):`);
    examenes?.forEach((e: any, i) => {
      const examenId = e.id || e.examen_id || 'N/A';
      console.log(`  ${i + 1}. ${e.nombre || 'N/A'}`);
      console.log(`     - ID: ${examenId}`);
      console.log(`     - Materia: ${e.materia || 'N/A'}`);
      console.log(`     - Fecha: ${e.fecha || 'N/A'}`);
      console.log(`     - Estado: ${e.estado || 'N/A'}`);
      console.log(`     - Columnas: ${Object.keys(e).join(', ')}`);
    });
  }

  // Disponibilidad
  const { data: disponibilidad, error: errorDispo } = await supabase
    .from('disponibilidad')
    .select('*')
    .limit(10);

  if (errorDispo) {
    console.error('❌ Error consultando disponibilidad:', errorDispo);
  } else {
    console.log(`\n📅 DISPONIBILIDAD (${disponibilidad?.length || 0} encontrados):`);
    disponibilidad?.forEach((d: any, i) => {
      const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      console.log(`  ${i + 1}. ${dias[d.dia_semana] || 'N/A'} - ${d.turno || 'N/A'}`);
      if (i === 0) console.log(`     - Columnas: ${Object.keys(d).join(', ')}`);
    });
  }

  // Padre-Alumno vinculaciones
  const { data: vinculaciones, error: errorVinculaciones } = await supabase
    .from('padre_alumno')
    .select('*')
    .limit(10);

  if (errorVinculaciones) {
    console.error('❌ Error consultando vinculaciones:', errorVinculaciones);
  } else {
    console.log(`\n🔗 VINCULACIONES PADRE-ALUMNO (${vinculaciones?.length || 0} encontradas):`);
    vinculaciones?.forEach((v, i) => {
      console.log(`  ${i + 1}. Padre: ${v.padre_id.substring(0, 8)}... -> Alumno: ${v.alumno_id.substring(0, 8)}...`);
      console.log(`     - Estado: ${v.estado || 'N/A'}`);
    });
  }
}

consultarDatos().catch(console.error);
