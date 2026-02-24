// Script para listar modelos disponibles de Gemini
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ EXPO_PUBLIC_GEMINI_API_KEY no está configurada');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  try {
    console.log('🔍 Listando modelos disponibles de Gemini...\n');
    
    // Listar modelos disponibles
    const models = await genAI.listModels();
    
    console.log('✅ Modelos disponibles:\n');
    for await (const model of models) {
      console.log(`📦 ${model.name}`);
      console.log(`   Display Name: ${model.displayName}`);
      console.log(`   Description: ${model.description || 'N/A'}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('');
    }
  } catch (error: any) {
    console.error('❌ Error listando modelos:', error.message);
    
    // Si falla, probar modelos comunes directamente
    console.log('\n🔄 Probando modelos comunes directamente...\n');
    
    const modelosComunes = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'gemini-1.5-flash-001',
      'gemini-1.5-flash-latest',
    ];
    
    for (const modeloNombre of modelosComunes) {
      try {
        const model = genAI.getGenerativeModel({ model: modeloNombre });
        const result = await model.generateContent('test');
        console.log(`✅ ${modeloNombre} - FUNCIONA`);
      } catch (err: any) {
        console.log(`❌ ${modeloNombre} - ${err.message.substring(0, 50)}...`);
      }
    }
  }
}

listModels().catch(console.error);
