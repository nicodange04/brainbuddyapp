// Script para verificar qué modelos de Gemini están disponibles
require('dotenv').config();

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ EXPO_PUBLIC_GEMINI_API_KEY no está configurada');
  process.exit(1);
}

async function verificarModelos() {
  if (!API_KEY) {
    console.error('❌ EXPO_PUBLIC_GEMINI_API_KEY no está configurada');
    process.exit(1);
  }

  console.log('🔍 Verificando modelos disponibles de Gemini...\n');
  console.log(`API Key: ${API_KEY.substring(0, 10)}...\n`);

  // Lista de modelos comunes a probar
  const modelosAProbar = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-pro-latest',
    'gemini-1.5-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-001',
    'gemini-1.0-pro',
    'gemini-1.0-pro-latest',
  ];

  console.log('📋 Probando modelos comunes...\n');

  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(API_KEY);

  let modeloFuncionando: string | null = null;

  for (const nombreModelo of modelosAProbar) {
    try {
      console.log(`🔄 Probando: ${nombreModelo}...`);
      
      const model = genAI.getGenerativeModel({ 
        model: nombreModelo,
        generationConfig: {
          temperature: 0.0,
          maxOutputTokens: 10, // Solo 10 tokens para prueba rápida
        }
      });

      const result = await model.generateContent('test');
      const response = await result.response;
      const text = response.text();

      console.log(`✅ ${nombreModelo} - FUNCIONA!`);
      console.log(`   Respuesta: ${text.substring(0, 50)}...\n`);
      
      if (!modeloFuncionando) {
        modeloFuncionando = nombreModelo;
      }
    } catch (error: any) {
      const mensajeError = error.message || error.toString();
      if (mensajeError.includes('404') || mensajeError.includes('not found')) {
        console.log(`❌ ${nombreModelo} - No disponible (404)\n`);
      } else if (mensajeError.includes('403') || mensajeError.includes('permission')) {
        console.log(`⚠️  ${nombreModelo} - Sin permisos (403)\n`);
      } else {
        console.log(`❌ ${nombreModelo} - Error: ${mensajeError.substring(0, 60)}...\n`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  
  if (modeloFuncionando) {
    console.log(`\n✅ MODELO FUNCIONANDO ENCONTRADO: ${modeloFuncionando}\n`);
    console.log('📝 Para usar este modelo, agrega esta línea a tu archivo .env:\n');
    console.log(`   EXPO_PUBLIC_GEMINI_MODEL=${modeloFuncionando}\n`);
    console.log('O actualiza services/gemini.ts línea 15 con:\n');
    console.log(`   const MODEL_NAME = '${modeloFuncionando}';\n`);
  } else {
    console.log('\n❌ No se encontró ningún modelo funcionando.\n');
    console.log('💡 Posibles causas:');
    console.log('   1. Tu API key no tiene acceso a estos modelos');
    console.log('   2. Necesitas habilitar la API en Google Cloud Console');
    console.log('   3. Tu región no tiene acceso a estos modelos');
    console.log('\n🔗 Verifica en: https://aistudio.google.com/');
    console.log('   - Intenta crear un prompt ahí');
    console.log('   - Haz clic en "Get code"');
    console.log('   - Revisa qué modelo usa\n');
  }

  // Intentar listar modelos usando la API REST directamente
  console.log('\n🔍 Intentando listar modelos disponibles vía API REST...\n');
  
  try {
    const fetch = require('node-fetch');
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.models && data.models.length > 0) {
      console.log('✅ Modelos disponibles según la API:\n');
      data.models.forEach((model: any) => {
        if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes('generateContent')) {
          console.log(`   📦 ${model.name}`);
          console.log(`      Display: ${model.displayName || 'N/A'}`);
          console.log(`      Descripción: ${model.description?.substring(0, 60) || 'N/A'}...`);
          console.log('');
        }
      });
      
      // Sugerir el primer modelo que soporte generateContent
      const modeloSugerido = data.models.find((m: any) => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      if (modeloSugerido) {
        const nombreCorto = modeloSugerido.name.split('/').pop();
        console.log(`\n💡 MODELO SUGERIDO: ${nombreCorto}`);
        console.log(`   Nombre completo: ${modeloSugerido.name}\n`);
        console.log('Agrega a tu .env:');
        console.log(`   EXPO_PUBLIC_GEMINI_MODEL=${nombreCorto}\n`);
      }
    } else {
      console.log('⚠️  No se pudieron obtener modelos de la API REST');
    }
  } catch (error: any) {
    console.log(`⚠️  Error al listar modelos: ${error.message}`);
  }
}

verificarModelos().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
