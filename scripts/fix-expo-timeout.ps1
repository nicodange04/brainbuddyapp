# Script para solucionar problemas de timeout en Expo
# Ejecutar con: .\scripts\fix-expo-timeout.ps1

Write-Host "🔧 Solucionando problemas de timeout en Expo..." -ForegroundColor Cyan
Write-Host ""

# 1. Detener procesos de Node
Write-Host "1. Deteniendo procesos de Node..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "   ✅ Procesos detenidos" -ForegroundColor Green

# 2. Limpiar cache de Expo
Write-Host "2. Limpiando cache de Expo..." -ForegroundColor Yellow
if (Test-Path .expo) {
    Remove-Item -Recurse -Force .expo
    Write-Host "   ✅ Cache de .expo eliminado" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No hay cache de .expo" -ForegroundColor Gray
}

# 3. Limpiar cache de node_modules
Write-Host "3. Limpiando cache de node_modules..." -ForegroundColor Yellow
if (Test-Path node_modules\.cache) {
    Remove-Item -Recurse -Force node_modules\.cache
    Write-Host "   ✅ Cache de node_modules eliminado" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No hay cache en node_modules" -ForegroundColor Gray
}

# 4. Verificar puerto
Write-Host "4. Verificando puerto 8081..." -ForegroundColor Yellow
$port = netstat -ano | findstr :8081
if ($port) {
    Write-Host "   ⚠️  Puerto 8081 está en uso" -ForegroundColor Yellow
    Write-Host "   💡 Usa: npx expo start --port 8082" -ForegroundColor Cyan
} else {
    Write-Host "   ✅ Puerto 8081 disponible" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Limpieza completada!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Ahora ejecuta:" -ForegroundColor Cyan
Write-Host "   npx expo start --clear" -ForegroundColor White
Write-Host ""
