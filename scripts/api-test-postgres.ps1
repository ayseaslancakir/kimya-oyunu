# Postgres geçiş doğrulaması
$root = "C:\Users\muhar\OneDrive\Desktop\yapayzeka\4.hafta\odev2"
$web  = Join-Path $root "web"
$cookie = Join-Path $root "cookies-pg.txt"
Remove-Item $cookie -ErrorAction SilentlyContinue

$proc = Start-Process -FilePath "C:\nodejs\node.exe" `
  -ArgumentList "node_modules\next\dist\bin\next", "start", "-p", "3000" `
  -WorkingDirectory $web `
  -RedirectStandardOutput (Join-Path $web "pg.log") -RedirectStandardError (Join-Path $web "pg.err.log") -PassThru

try {
  Start-Sleep -Seconds 4
  Write-Host "=== 1) HEALTH ===" -ForegroundColor Yellow
  curl.exe -s "http://localhost:3000/api/health"
  Write-Host ""

  Write-Host "`n=== 2) KAYIT (Postgres'e yazar) ===" -ForegroundColor Yellow
  curl.exe -s -c $cookie -X POST "http://localhost:3000/api/auth/register" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req22.json"
  Write-Host ""

  Write-Host "`n=== 3) SORULAR (Postgres'ten okur) ===" -ForegroundColor Yellow
  $sorular = curl.exe -s -b $cookie "http://localhost:3000/api/quiz/questions?unitId=1&limit=2"
  Write-Host $sorular
  Write-Host ""

  Write-Host "`n=== 4) POSTGRES DOGRUDAN ===" -ForegroundColor Yellow
  .\scripts\pgsql-psql.cmd -c "SELECT count(*) AS soru FROM ""Question""; SELECT count(*) AS cikti FROM ""LearningOutcome""; SELECT count(*) AS kullanici FROM ""User"";" 2>&1 | Out-String
} finally {
  Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  Write-Host "`nSunucu kapatildi." -ForegroundColor Cyan
}
