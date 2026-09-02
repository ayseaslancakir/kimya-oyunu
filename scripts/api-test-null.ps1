# Süre dolumu (optionId: null) testi
$root = "C:\Users\muhar\OneDrive\Desktop\yapayzeka\4.hafta\odev2"
$web  = Join-Path $root "web"
$cookie = Join-Path $root "cookies-test.txt"

$proc = Start-Process -FilePath "C:\nodejs\node.exe" `
  -ArgumentList "node_modules\next\dist\bin\next", "start", "-p", "3000" `
  -WorkingDirectory $web `
  -RedirectStandardOutput (Join-Path $web "s2.log") -RedirectStandardError (Join-Path $web "s2.err.log") -PassThru

try {
  Start-Sleep -Seconds 4
  Write-Host "=== CEVAP (optionId: null → süre doldu) ===" -ForegroundColor Yellow
  curl.exe -s -b $cookie -X POST "http://localhost:3000/api/quiz/answer" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req4.json"
  Write-Host ""
} finally {
  Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
}
