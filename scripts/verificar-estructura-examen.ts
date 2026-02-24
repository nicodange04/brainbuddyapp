// scripts/verificar-estructura-examen.ts
// Script para verificar la estructura real de la tabla examen

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarEstructuraExamen() {
  console.log('🔍 Verificando estructura real de la tabla examen...\n');
  
  // 1. Intentar obtener un examen de ejemplo para ver sus columnas
  console.log('1️⃣ Obteniendo un examen de ejemplo...');
  const { data: examenes, error: errorExamenes } = await supabase
    .from('examen')
    .select('*')
    .limit(1);
  
  if (errorExamenes) {
    console.error('❌ Error al obtener exámenes:', errorExamenes);
    console.log('   Código:', errorExamenes.code);
    console.log('   Mensaje:', errorExamenes.message);
    return;
  }
  
  if (!examenes || examenes.length === 0) {
    console.log('ℹ️ No hay exámenes en la base de datos');
    return;
  }
  
  const examenEjemplo = examenes[0];
  console.log('✅ Examen de ejemplo encontrado\n');
  console.log('📋 Columnas disponibles en la tabla examen:');
  const columnas = Object.keys(examenEjemplo);
  columnas.forEach((col, index) => {
    const valor = examenEjemplo[col];
    const tipo = typeof valor;
    console.log(`   ${index + 1}. ${col} (${tipo})${valor !== null ? ` = ${JSON.stringify(valor).substring(0, 50)}` : ' = null'}`);
  });
  
  console.log('\n🔍 Análisis de columnas importantes:');
  console.log(`   - ID del examen: ${examenEjemplo.examen_id || examenEjemplo.id || 'NO ENCONTRADO'}`);
  console.log(`   - ID del usuario/alumno: ${examenEjemplo.alumno_id || examenEjemplo.usuario_id || examenEjemplo.user_id || 'NO ENCONTRADO'}`);
  console.log(`   - Nombre: ${examenEjemplo.nombre || 'NO ENCONTRADO'}`);
  console.log(`   - Materia: ${examenEjemplo.materia || 'NO ENCONTRADO'}`);
  
  // 2. Verificar estructura de sesionestudio
  console.log('\n2️⃣ Verificando estructura de sesionestudio...');
  const { data: sesiones, error: errorSesiones } = await supabase
    .from('sesionestudio')
    .select('*')
    .limit(1);
  
  if (!errorSesiones && sesiones && sesiones.length > 0) {
    const sesionEjemplo = sesiones[0];
    console.log('✅ Sesión de ejemplo encontrada\n');
    console.log('📋 Columnas disponibles en sesionestudio:');
    const columnasSesion = Object.keys(sesionEjemplo);
    columnasSesion.forEach((col, index) => {
      const valor = sesionEjemplo[col];
      const tipo = typeof valor;
      console.log(`   ${index + 1}. ${col} (${tipo})`);
    });
    
    console.log(`\n   - examen_id: ${sesionEjemplo.examen_id || sesionEjemplo.examenId || 'NO ENCONTRADO'}`);
    console.log(`   - material_generado: ${sesionEjemplo.material_generado ? 'EXISTE' : 'NO EXISTE'}`);
    if (sesionEjemplo.material_generado) {
      const material = sesionEjemplo.material_generado;
      console.log(`     Formatos en material_generado: ${Object.keys(material).join(', ')}`);
    }
  } else {
    console.log('ℹ️ No hay sesiones en la base de datos o error:', errorSesiones?.message);
  }
  
  // 3. Verificar perfil_aprendizaje
  console.log('\n3️⃣ Verificando estructura de perfil_aprendizaje...');
  const { data: perfiles, error: errorPerfiles } = await supabase
    .from('perfil_aprendizaje')
    .select('*')
    .limit(1);
  
  if (!errorPerfiles && perfiles && perfiles.length > 0) {
    const perfilEjemplo = perfiles[0];
    console.log('✅ Perfil de ejemplo encontrado\n');
    console.log('📋 Columnas disponibles en perfil_aprendizaje:');
    const columnasPerfil = Object.keys(perfilEjemplo);
    columnasPerfil.forEach((col, index) => {
      const valor = perfilEjemplo[col];
      const tipo = typeof valor;
      console.log(`   ${index + 1}. ${col} (${tipo})`);
    });
    
    console.log(`\n   - alumno_id: ${perfilEjemplo.alumno_id || 'NO ENCONTRADO'}`);
    console.log(`   - estilo_primario: ${perfilEjemplo.estilo_primario || 'NO ENCONTRADO'}`);
    console.log(`   - completado: ${perfilEjemplo.completado || 'NO ENCONTRADO'}`);
  } else {
    console.log('ℹ️ No hay perfiles en la base de datos o error:', errorPerfiles?.message);
  }
  
  console.log('\n✅ Verificación completada');
}

verificarEstructuraExamen().catch(console.error);
