// scripts/verificar-api-key-gemini.ts
// Script para verificar que la nueva API key de Gemini funciona correctamente

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

async function verificarAPIKey() {
  console.log('🔍 Verificando API key de Gemini...\n');
  
  if (!API_KEY || API_KEY === 'your_gemini_api_key_here' || API_KEY.trim() === '') {
    console.error('❌ EXPO_PUBLIC_GEMINI_API_KEY no está configurada o es inválida');
    console.log('\n💡 Solución:');
    console.log('   1. Ve a Google AI Studio: https://aistudio.google.com/');
    console.log('   2. Obtén tu API key');
    console.log('   3. Agrega EXPO_PUBLIC_GEMINI_API_KEY=tu_key_aqui a tu archivo .env');
    process.exit(1);
  }
  
  if (!API_KEY.startsWith('AIza')) {
    console.error('❌ API key no tiene el formato correcto');
    console.log('   La API key de Gemini debe empezar con "AIza"');
    process.exit(1);
  }
  
  console.log('✅ API key encontrada');
  console.log(`   Formato: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 4)}\n`);
  
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash'
    });
    
    console.log('🧪 Probando conexión con Gemini API...');
    console.log(`   Modelo: ${process.env.EXPO_PUBLIC_GEMINI_MODEL || 'gemini-2.5-flash'}\n`);
    
    const result = await model.generateContent('Responde solo con "OK" si puedes leer esto.');
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API key funciona correctamente!');
    console.log(`   Respuesta: ${text.trim()}\n`);
    
    // Verificar cuota disponible
    console.log('📊 Verificando cuota disponible...');
    try {
      // Intentar una segunda solicitud para verificar límites
      const result2 = await model.generateContent('Responde solo con "OK"');
      const response2 = await result2.response;
      console.log('✅ Cuota disponible - Puedes hacer solicitudes\n');
    } catch (error: any) {
      if (error.message?.includes('429')) {
        console.error('⚠️ Cuota excedida');
        if (error.message?.includes('PerMinute')) {
          console.log('   - Límite por minuto excedido (5 solicitudes/minuto)');
          console.log('   - Espera 1-2 minutos antes de usar la API\n');
        } else if (error.message?.includes('PerDay')) {
          console.log('   - Límite diario excedido (20 solicitudes/día)');
          console.log('   - Espera hasta mañana o actualiza tu plan\n');
        }
      } else {
        throw error;
      }
    }
    
    console.log('🎉 Todo listo! Puedes usar esta API key para generar material.');
    
  } catch (error: any) {
    console.error('❌ Error al verificar API key:', error.message);
    
    if (error.message?.includes('429')) {
      console.log('\n💡 Cuota excedida:');
      console.log('   - Espera unos minutos antes de reintentar');
      console.log('   - O considera actualizar tu plan de Gemini\n');
    } else if (error.message?.includes('401') || error.message?.includes('403')) {
      console.log('\n💡 API key inválida o sin permisos:');
      console.log('   - Verifica que la API key sea correcta');
      console.log('   - Asegúrate de que la API key tenga permisos para usar Gemini\n');
    } else if (error.message?.includes('404')) {
      console.log('\n💡 Modelo no encontrado:');
      console.log('   - Verifica que el modelo esté disponible');
      console.log('   - Revisa EXPO_PUBLIC_GEMINI_MODEL en tu .env\n');
    } else {
      console.log('\n💡 Error desconocido:');
      console.log('   - Verifica tu conexión a internet');
      console.log('   - Revisa los logs para más detalles\n');
    }
    
    process.exit(1);
  }
}

verificarAPIKey();
