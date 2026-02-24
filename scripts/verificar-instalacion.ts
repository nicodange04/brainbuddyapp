#!/usr/bin/env ts-node

/**
 * Script de verificación rápida para asegurar que el proyecto está listo
 * Ejecutar antes de la presentación: npm run verificar-instalacion
 */

import * as fs from 'fs';
import * as path from 'path';

console.log('🔍 Verificando instalación de Brain Buddy...\n');

let errores = 0;
let advertencias = 0;

// 1. Verificar que existe node_modules
console.log('1️⃣ Verificando dependencias...');
if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
  console.log('   ❌ ERROR: node_modules no existe. Ejecuta: npm install');
  errores++;
} else {
  console.log('   ✅ node_modules existe');
}

// 2. Verificar package.json
console.log('\n2️⃣ Verificando package.json...');
if (!fs.existsSync(path.join(process.cwd(), 'package.json'))) {
  console.log('   ❌ ERROR: package.json no existe');
  errores++;
} else {
  console.log('   ✅ package.json existe');
}

// 3. Verificar archivo .env
console.log('\n3️⃣ Verificando variables de entorno...');
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.log('   ⚠️  ADVERTENCIA: .env no existe. Crea uno desde env.example');
  advertencias++;
} else {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const requiredVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  let missingVars: string[] = [];
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName)) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.log(`   ⚠️  ADVERTENCIA: Faltan variables: ${missingVars.join(', ')}`);
    advertencias++;
  } else {
    console.log('   ✅ Variables de entorno configuradas');
  }
}

// 4. Verificar estructura de carpetas importantes
console.log('\n4️⃣ Verificando estructura del proyecto...');
const requiredDirs = ['app', 'components', 'services', 'constants'];
requiredDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`   ❌ ERROR: Carpeta ${dir} no existe`);
    errores++;
  } else {
    console.log(`   ✅ Carpeta ${dir} existe`);
  }
});

// 5. Verificar que Expo está instalado
console.log('\n5️⃣ Verificando Expo CLI...');
try {
  const { execSync } = require('child_process');
  execSync('npx expo --version', { stdio: 'ignore' });
  console.log('   ✅ Expo CLI disponible');
} catch (error) {
  console.log('   ⚠️  ADVERTENCIA: No se pudo verificar Expo CLI');
  advertencias++;
}

// Resumen
console.log('\n' + '='.repeat(50));
console.log('📊 RESUMEN DE VERIFICACIÓN\n');

if (errores === 0 && advertencias === 0) {
  console.log('✅ ¡Todo está listo! Puedes ejecutar: npm start');
} else if (errores === 0) {
  console.log(`⚠️  ${advertencias} advertencia(s) encontrada(s). Revisa arriba.`);
  console.log('💡 Puedes continuar, pero revisa las advertencias.');
} else {
  console.log(`❌ ${errores} error(es) encontrado(s). Debes corregirlos antes de continuar.`);
  console.log(`⚠️  ${advertencias} advertencia(s) adicional(es).`);
  process.exit(1);
}

console.log('\n📱 Para iniciar la app: npm start');
console.log('🔗 Para verificar BD: npm run test-db\n');
