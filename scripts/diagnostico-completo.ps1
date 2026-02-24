# Script de diagnóstico completo para problemas de timeout
# Ejecutar con: .\scripts\diagnostico-completo.ps1

Write-Host "🔍 DIAGNÓSTICO COMPLETO DE TIMEOUT" -ForegroundColor Cyan
Write-Host "=" * 60
Write-Host ""

# 1. Verificar .env
Write-Host "1. Verificando variables de entorno..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "   ✅ Archivo .env existe" -ForegroundColor Green
    $envContent = Get-Content .env
    $hasSupabaseUrl = $envContent | Select-String "EXPO_PUBLIC_SUPABASE_URL"
    $hasSupabaseKey = $envContent | Select-String "EXPO_PUBLIC_SUPABASE_ANON_KEY"
    
    if ($hasSupabaseUrl) {
        Write-Host "   ✅ EXPO_PUBLIC_SUPABASE_URL configurado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ EXPO_PUBLIC_SUPABASE_URL NO configurado" -ForegroundColor Red
    }
    
    if ($hasSupabaseKey) {
        Write-Host "   ✅ EXPO_PUBLIC_SUPABASE_ANON_KEY configurado" -ForegroundColor Green
    } else {
        Write-Host "   ❌ EXPO_PUBLIC_SUPABASE_ANON_KEY NO configurado" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Archivo .env NO existe" -ForegroundColor Red
    Write-Host "   💡 Crea .env desde env.example" -ForegroundColor Yellow
}
Write-Host ""

# 2. Verificar procesos de Node
Write-Host "2. Verificando procesos de Node..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   ⚠️  Hay $($nodeProcesses.Count) procesos de Node corriendo" -ForegroundColor Yellow
    Write-Host "   💡 Pueden estar causando conflictos" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ No hay procesos de Node corriendo" -ForegroundColor Green
}
Write-Host ""

# 3. Verificar puerto 8081
Write-Host "3. Verificando puerto 8081..." -ForegroundColor Yellow
$port = netstat -ano | findstr :8081
if ($port) {
    Write-Host "   ⚠️  Puerto 8081 está en uso" -ForegroundColor Yellow
    Write-Host "   💡 Usa: npx expo start --port 8082" -ForegroundColor Cyan
} else {
    Write-Host "   ✅ Puerto 8081 disponible" -ForegroundColor Green
}
Write-Host ""

# 4. Verificar cache
Write-Host "4. Verificando cache..." -ForegroundColor Yellow
if (Test-Path .expo) {
    Write-Host "   ⚠️  Cache de .expo existe" -ForegroundColor Yellow
    Write-Host "   💡 Puede estar corrupto" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ No hay cache de .expo" -ForegroundColor Green
}

if (Test-Path node_modules\.cache) {
    Write-Host "   ⚠️  Cache de node_modules existe" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ No hay cache en node_modules" -ForegroundColor Green
}
Write-Host ""

# 5. Verificar node_modules
Write-Host "5. Verificando node_modules..." -ForegroundColor Yellow
if (Test-Path node_modules) {
    $moduleCount = (Get-ChildItem node_modules -Directory).Count
    Write-Host "   ✅ node_modules existe ($moduleCount módulos)" -ForegroundColor Green
} else {
    Write-Host "   ❌ node_modules NO existe" -ForegroundColor Red
    Write-Host "   💡 Ejecuta: npm install" -ForegroundColor Yellow
}
Write-Host ""

# 6. Verificar errores de TypeScript
Write-Host "6. Verificando errores de TypeScript..." -ForegroundColor Yellow
Write-Host "   (Esto puede tardar unos segundos...)" -ForegroundColor Gray
try {
    $tscOutput = npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ No hay errores de TypeScript" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Hay errores de TypeScript" -ForegroundColor Red
        Write-Host "   💡 Revisa los errores arriba" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  No se pudo verificar TypeScript" -ForegroundColor Yellow
}
Write-Host ""

# 7. Resumen y recomendaciones
Write-Host "=" * 60
Write-Host "📋 RESUMEN Y RECOMENDACIONES" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔧 ACCIONES RECOMENDADAS:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Limpiar todo:" -ForegroundColor White
Write-Host "   Get-Process node | Stop-Process -Force" -ForegroundColor Gray
Write-Host "   Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue" -ForegroundColor Gray
Write-Host "   Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Reiniciar Expo:" -ForegroundColor White
Write-Host "   npx expo start --clear" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Si sigue fallando, probar con tunnel:" -ForegroundColor White
Write-Host "   npx expo start --tunnel" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Si el problema persiste, verificar Supabase:" -ForegroundColor White
Write-Host "   npm run test-db" -ForegroundColor Gray
Write-Host ""
