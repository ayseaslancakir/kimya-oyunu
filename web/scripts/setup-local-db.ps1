# Yerel test — PostgreSQL kurmadan SQLite dosyası ile oyunu ayağa kaldırır.
# Kullanım (web/ içinden): npm run setup:local
$ErrorActionPreference = "Stop"
$webRoot = Split-Path $PSScriptRoot -Parent
Set-Location $webRoot

Write-Host "==> Yerel SQLite veritabani kuruluyor..." -ForegroundColor Cyan

# Calisan Next.js sunucusu Prisma dosyalarini kilitler — once kapat
$ports = @(3000, 3001)
foreach ($port in $ports) {
  $conns = netstat -ano 2>$null | Select-String ":$port\s" | Select-String "LISTENING"
  foreach ($line in $conns) {
    $pid = ($line -split '\s+')[-1]
    if ($pid -match '^\d+$') {
      Write-Host "Port $port kullanan surec kapatiliyor (PID $pid)..." -ForegroundColor Yellow
      Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
  }
}
Start-Sleep -Seconds 2

if (-not (Test-Path "prisma\schema.postgres.prisma")) {
  Copy-Item "prisma\schema.prisma" "prisma\schema.postgres.prisma"
}
Copy-Item "prisma\schema.sqlite.prisma" "prisma\schema.prisma" -Force

@'
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="yerel-test-icin-en-az-32-karakter-anahtar-123"
'@ | Set-Content ".env" -Encoding utf8

npx prisma generate
npx prisma db push --accept-data-loss
npm run db:seed
npm run db:seed-questions

Write-Host ""
Write-Host "Hazir! Simdi: npm run dev" -ForegroundColor Green
Write-Host "Tarayici: http://localhost:3000" -ForegroundColor Green
