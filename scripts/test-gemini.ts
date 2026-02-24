// Script para probar la integración de Gemini
// Ejecutar con: npm run test-gemini

require('dotenv').config();

// Importar servicios usando require para compatibilidad con ts-node
const { verificarConfiguracionGemini, generarContenidoTeorico, generarQuiz } = require('../services/gemini');

async function testGemini() {
  console.log('🧪 Iniciando pruebas de Gemini 1.5 Flash...\n');

  // 1. Verificar configuración
  console.log('1️⃣ Verificando configuración...');
  const config = verificarConfiguracionGemini();
  if (!config.valida) {
    console.error('❌ Error:', config.mensaje);
    console.log('\n💡 Solución: Agrega EXPO_PUBLIC_GEMINI_API_KEY a tu archivo .env');
    process.exit(1);
  }
  console.log('✅', config.mensaje);
  console.log('');

  // 2. Probar generación de contenido teórico
  console.log('2️⃣ Probando generación de contenido teórico...');
  try {
    const contenido = await generarContenidoTeorico(
      'Fotosíntesis',
      'Biología',
      undefined, // Sin documentos adicionales por ahora
      'Estilo visual, nivel básico, prefiere ejemplos prácticos'
    );
    
    console.log('✅ Contenido generado exitosamente!');
    console.log(`📊 Secciones generadas: ${contenido.secciones.length}`);
    console.log('\n📄 Primeras 2 secciones:');
    contenido.secciones.slice(0, 2).forEach((seccion: any, index: number) => {
      console.log(`\n${index + 1}. ${seccion.titulo}`);
      console.log(`   Contenido: ${seccion.contenido.substring(0, 100)}...`);
      if (seccion.tip) {
        console.log(`   💡 Tip: ${seccion.tip}`);
      }
    });
  } catch (error) {
    console.error('❌ Error generando contenido:', error);
    process.exit(1);
  }
  console.log('');

  // 3. Probar generación de quiz
  console.log('3️⃣ Probando generación de quiz...');
  try {
    // Primero generar contenido para el quiz
    const contenidoParaQuiz = await generarContenidoTeorico(
      'Revolución Francesa',
      'Historia',
      undefined
    );

    const quiz = await generarQuiz(
      'Revolución Francesa',
      'Historia',
      contenidoParaQuiz
    );

    console.log('✅ Quiz generado exitosamente!');
    console.log(`📊 Preguntas generadas: ${quiz.preguntas.length}`);
    console.log(`📊 Puntaje máximo: ${quiz.puntaje_maximo}`);
    console.log('\n📝 Primera pregunta:');
    if (quiz.preguntas.length > 0) {
      const primera = quiz.preguntas[0];
      console.log(`   Pregunta: ${primera.pregunta}`);
      console.log(`   Opciones: ${primera.opciones.length}`);
      primera.opciones.forEach((opcion: string, index: number) => {
        const esCorrecta = index === primera.respuesta_correcta ? ' ✅' : '';
        console.log(`     ${index + 1}. ${opcion}${esCorrecta}`);
      });
      if (primera.explicacion) {
        console.log(`   Explicación: ${primera.explicacion}`);
      }
    }
  } catch (error) {
    console.error('❌ Error generando quiz:', error);
    process.exit(1);
  }

  console.log('\n✅ ¡Todas las pruebas pasaron exitosamente!');
  console.log('🎉 Gemini 1.5 Flash está funcionando correctamente.');
}

// Ejecutar pruebas
testGemini().catch((error) => {
  console.error('❌ Error en las pruebas:', error);
  process.exit(1);
});
