// scripts/diagnosticar-formatos.ts
// Script para diagnosticar por qué no aparecen formatos adicionales

require('dotenv').config();

// Crear cliente de Supabase directamente sin dependencias de Expo
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticarFormatos() {
  const examenId = process.argv[2] || '96a92e63-c1e2-48ee-a34c-ff7621d7bf84'; // Tu examen ID por defecto
  
  console.log('🔍 Diagnosticando por qué no aparecen formatos...\n');
  console.log(`📋 Examen ID: ${examenId}\n`);
  
  // 1. Verificar examen (intentar diferentes nombres de columnas)
  let examen: any = null;
  let errorExamen: any = null;
  
  // Intentar con examen_id y usuario_id
  let result = await supabase
    .from('examen')
    .select('*')
    .eq('examen_id', examenId)
    .single();
  
  if (result.error) {
    // Intentar con id y alumno_id (versión antigua)
    result = await supabase
      .from('examen')
      .select('*')
      .eq('id', examenId)
      .single();
  }
  
  examen = result.data;
  errorExamen = result.error;
  
  if (errorExamen) {
    console.error('❌ Error al obtener examen:', errorExamen);
    console.log('\n💡 Posibles causas:');
    console.log('   - El examen no existe');
    console.log('   - El examen no tiene permisos de lectura');
    console.log('   - El ID del examen es incorrecto\n');
    return;
  }
  
  if (!examen) {
    console.error('❌ No se encontró el examen');
    return;
  }
  
  console.log('📋 Examen encontrado:');
  console.log(`   - Nombre: ${examen.nombre || examen.nombre_examen || 'N/A'}`);
  console.log(`   - Materia: ${examen.materia || 'N/A'}`);
  
  // Verificar qué columna de usuario tiene
  const usuarioId = examen?.usuario_id || examen?.alumno_id || examen?.user_id;
  console.log(`   - Tiene ID de usuario: ${usuarioId ? '✅ SÍ' : '❌ NO'}`);
  console.log(`   - Columnas disponibles: ${Object.keys(examen).join(', ')}\n`);
  
  if (!usuarioId) {
    console.error('\n❌ PROBLEMA CRÍTICO: El examen no tiene ID de usuario asociado');
    console.log('💡 Solución: El examen debe estar asociado a un usuario para generar formatos adicionales');
    console.log('   Esto puede pasar si:');
    console.log('   1. El examen fue creado antes de implementar usuario_id');
    console.log('   2. Hubo un error al crear el examen');
    console.log('   3. La columna usuario_id no existe en la tabla examen\n');
    console.log('🔍 Nota: Para verificar la estructura de la tabla, revisa el Supabase Dashboard\n');
    return;
  }
  
  console.log(`   - ID de usuario: ${usuarioId}\n`);
  
  // 2. Verificar perfil
  const usuarioIdParaPerfil = examen?.usuario_id || examen?.alumno_id || examen?.user_id;
  const { data: perfil, error: errorPerfil } = await supabase
    .from('perfil_aprendizaje')
    .select('*')
    .eq('alumno_id', usuarioIdParaPerfil)
    .eq('completado', true)
    .single();
  
  if (errorPerfil && errorPerfil.code !== 'PGRST116') {
    console.error('❌ Error al obtener perfil:', errorPerfil);
    return;
  }
  
  if (!perfil) {
    console.error('❌ PROBLEMA ENCONTRADO: No hay perfil de aprendizaje completado');
    console.log(`   - usuario_id buscado: ${usuarioIdParaPerfil}`);
    console.log('💡 Solución: Completa el onboarding para generar formatos adicionales\n');
    
    // Verificar si existe perfil sin completar
    const { data: perfilIncompleto } = await supabase
      .from('perfil_aprendizaje')
      .select('*')
      .eq('alumno_id', usuarioIdParaPerfil)
      .single();
    
    if (perfilIncompleto) {
      console.log('ℹ️ Existe un perfil pero no está completado:');
      console.log(`   - completado: ${perfilIncompleto.completado}`);
    }
    
    return;
  }
  
  console.log('👤 Perfil de aprendizaje encontrado:');
  console.log(`   - Estilo primario: ${perfil.estilo_primario}`);
  console.log(`   - Estilo secundario: ${perfil.estilo_secundario || 'N/A'}`);
  console.log(`   - Prefiere diagramas: ${perfil.prefiere_diagramas ? '✅ SÍ' : '❌ NO'}`);
  console.log(`   - Prefiere resúmenes: ${perfil.prefiere_resumenes ? '✅ SÍ' : '❌ NO'}`);
  console.log(`   - Velocidad aprendizaje: ${perfil.velocidad_aprendizaje}`);
  console.log(`   - Completado: ${perfil.completado ? '✅ SÍ' : '❌ NO'}\n`);
  
  // 3. Determinar qué formatos deberían generarse
  const formatos: string[] = ['texto'];
  
  if (perfil.estilo_primario === 'auditivo' || perfil.estilo_secundario === 'auditivo') {
    formatos.push('audio');
  }
  
  if (perfil.estilo_primario === 'visual' || perfil.prefiere_diagramas) {
    formatos.push('diagramas');
    formatos.push('infografias');
  }
  
  if (perfil.prefiere_resumenes || perfil.velocidad_aprendizaje === 'rapido') {
    formatos.push('flashcards');
  }
  
  console.log(`🎨 Formatos que DEBERÍAN generarse: ${formatos.join(', ')}\n`);
  
  // 4. Verificar sesiones
  const examenIdField = examen.examen_id || examen.id;
  const { data: sesiones, error: errorSesiones } = await supabase
    .from('sesionestudio')
    .select('sesion_id, tema, material_generado, material_estado')
    .eq('examen_id', examenIdField || examenId)
    .limit(5);
  
  if (errorSesiones) {
    console.error('❌ Error al obtener sesiones:', errorSesiones);
    return;
  }
  
  if (!sesiones || sesiones.length === 0) {
    console.log('ℹ️ No se encontraron sesiones para este examen');
    return;
  }
  
  console.log(`📚 Sesiones encontradas: ${sesiones.length}\n`);
  
  sesiones.forEach((sesion: any, index: number) => {
    const material = sesion.material_generado as any;
    const formatosGenerados = material ? Object.keys(material).filter((k: string) => k !== 'texto') : [];
    
    console.log(`   Sesión ${index + 1}: ${sesion.tema}`);
    console.log(`   - Estado: ${sesion.material_estado}`);
    console.log(`   - Formatos generados: ${formatosGenerados.length > 0 ? formatosGenerados.join(', ') : 'NINGUNO (solo texto)'}`);
    
    if (formatosGenerados.length === 0 && formatos.length > 1) {
      console.log(`   ⚠️ PROBLEMA: Deberían haberse generado ${formatos.length - 1} formato(s) adicional(es)`);
      console.log(`      Formatos esperados: ${formatos.slice(1).join(', ')}`);
    } else if (formatosGenerados.length > 0) {
      console.log(`   ✅ Formatos adicionales generados correctamente`);
    }
    console.log('');
  });
  
  // 5. Resumen
  const usuarioIdFinal = examen?.usuario_id || examen?.alumno_id || examen?.user_id;
  console.log('📊 RESUMEN:');
  console.log(`   - Examen tiene ID de usuario: ${usuarioIdFinal ? '✅' : '❌'}`);
  console.log(`   - Perfil encontrado: ${perfil ? '✅' : '❌'}`);
  console.log(`   - Formatos esperados: ${formatos.length}`);
  console.log(`   - Formatos generados: ${sesiones.some((s: any) => {
    const m = s.material_generado as any;
    return m && Object.keys(m).length > 1;
  }) ? '✅' : '❌'}\n`);
}

diagnosticarFormatos().catch(console.error);
