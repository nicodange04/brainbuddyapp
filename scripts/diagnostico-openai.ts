/**
 * Script de diagnóstico para verificar la configuración de OpenAI
 * 
 * Ejecutar con: npx ts-node scripts/diagnostico-openai.ts
 * O desde la app: importar y llamar a las funciones
 */

import { verificarConfiguracionOpenAI, generarContenidoTeorico } from '../services/openai';

/**
 * Ejecuta diagnóstico completo de OpenAI
 */
export async function ejecutarDiagnostico(): Promise<void> {
  console.log('🔍 Iniciando diagnóstico de OpenAI...\n');

  // 1. Verificar configuración de API key
  console.log('1️⃣ Verificando API key...');
  const config = verificarConfiguracionOpenAI();
  console.log(`   ${config.valida ? '✅' : '❌'} ${config.mensaje}\n`);

  if (!config.valida) {
    console.log('⚠️ La API key no está configurada correctamente.');
    console.log('   Verifica que tu archivo .env tenga:');
    console.log('   EXPO_PUBLIC_OPENAI_API_KEY=sk-tu_key_aqui\n');
    return;
  }

  // 2. Verificar variable de entorno
  console.log('2️⃣ Verificando variable de entorno...');
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (apiKey) {
    const keyPreview = apiKey.substring(0, 7) + '...' + apiKey.substring(apiKey.length - 4);
    console.log(`   ✅ API key encontrada: ${keyPreview}\n`);
  } else {
    console.log('   ❌ API key no encontrada en process.env\n');
    return;
  }

  // 3. Prueba de conexión con OpenAI (solo si está en Node.js)
  if (typeof window === 'undefined') {
    console.log('3️⃣ Probando conexión con OpenAI...');
    try {
      const resultado = await generarContenidoTeorico(
        'Prueba de diagnóstico',
        'Matemáticas',
        'Este es un test de diagnóstico'
      );
      
      if (resultado && resultado.secciones && resultado.secciones.length > 0) {
        console.log(`   ✅ Conexión exitosa. Se generaron ${resultado.secciones.length} secciones.\n`);
      } else {
        console.log('   ⚠️ Conexión exitosa pero respuesta inesperada.\n');
      }
    } catch (error: any) {
      console.log(`   ❌ Error al conectar con OpenAI: ${error.message}\n`);
      
      if (error.message?.includes('429')) {
        console.log('   💡 Error 429: Quota excedida. Verifica tus créditos en:');
        console.log('      https://platform.openai.com/account/billing\n');
      } else if (error.message?.includes('401')) {
        console.log('   💡 Error 401: API key inválida. Verifica tu API key.\n');
      } else if (error.message?.includes('network')) {
        console.log('   💡 Error de red. Verifica tu conexión a internet.\n');
      }
    }
  } else {
    console.log('   ⚠️ No se puede probar conexión desde el navegador.\n');
  }

  console.log('✅ Diagnóstico completado.\n');
}

// Si se ejecuta directamente (Node.js)
if (typeof require !== 'undefined' && require.main === module) {
  ejecutarDiagnostico().catch(console.error);
}



