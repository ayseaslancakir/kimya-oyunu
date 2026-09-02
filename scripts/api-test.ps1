# Kimya Oyunu API uçtan uca testi
# Kullanım: powershell -ExecutionPolicy Bypass -File api-test.ps1
$ErrorActionPreference = "Continue"

$root = "C:\Users\muhar\OneDrive\Desktop\yapayzeka\4.hafta\odev2"
$web  = Join-Path $root "web"
$log  = Join-Path $web "server-test.log"
$err  = Join-Path $web "server-test.err.log"
$cookie = Join-Path $root "cookies-test.txt"

Remove-Item $log, $err, $cookie -ErrorAction SilentlyContinue

Write-Host "▶ Sunucu başlatılıyor..." -ForegroundColor Cyan
$proc = Start-Process -FilePath "C:\nodejs\node.exe" `
  -ArgumentList "node_modules\next\dist\bin\next", "start", "-p", "3000" `
  -WorkingDirectory $web `
  -RedirectStandardOutput $log -RedirectStandardError $err -PassThru

try {
  Start-Sleep -Seconds 4

  Write-Host "`n=== 1) HEALTH ===" -ForegroundColor Yellow
  curl.exe -s "http://localhost:3000/api/health"

  Write-Host "`n`n=== 2) KAYIT (yeni kullanıcı) ===" -ForegroundColor Yellow
  curl.exe -s -c $cookie -X POST "http://localhost:3000/api/auth/register" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req.json"

  Write-Host "`n`n=== 3) KAYIT (aynı kullanıcı → 409 beklenir) ===" -ForegroundColor Yellow
  curl.exe -s -X POST "http://localhost:3000/api/auth/register" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req.json"

  Write-Host "`n`n=== 4) /api/auth/me (oturum) ===" -ForegroundColor Yellow
  curl.exe -s -b $cookie "http://localhost:3000/api/auth/me"

  Write-Host "`n`n=== 5) SORULAR (unitId=1, limit=3) ===" -ForegroundColor Yellow
  curl.exe -s -b $cookie "http://localhost:3000/api/quiz/questions?unitId=1&limit=3"

  Write-Host "`n`n=== 6) CEVAP (doğru) ===" -ForegroundColor Yellow
  curl.exe -s -b $cookie -X POST "http://localhost:3000/api/quiz/answer" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req2.json"

  Write-Host "`n`n=== 7) CEVAP (süre doldu → optionId null) ===" -ForegroundColor Yellow
  curl.exe -s -b $cookie -X POST "http://localhost:3000/api/quiz/answer" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req4.json"

  Write-Host "`n`n=== 8) TUR BİTİŞİ (skor kaydı) ===" -ForegroundColor Yellow
  curl.exe -s -b $cookie -X POST "http://localhost:3000/api/quiz/finish" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req3.json"

  Write-Host "`n`n=== 9) YETKİSİZ (çerezsiz soru isteği → 401) ===" -ForegroundColor Yellow
  curl.exe -s -o NUL -w "HTTP %{http_code}" "http://localhost:3000/api/quiz/questions?unitId=1"

  Write-Host "`n`n=== 10) VERİTABANI DURUMU ===" -ForegroundColor Yellow
  Push-Location $web
  C:\nodejs\node.exe -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{const u=await p.user.count();const q=await p.question.count();const o=await p.learningOutcome.count();const s=await p.score.count();const g=await p.grade.count();const t=await p.theme.count();const un=await p.unit.count();const pr=await p.userProgress.findMany({include:{outcome:true}});console.log('kullanıcı:',u,'| soru:',q,'| çıktı:',o,'| skor:',s,'| sınıf:',g,'| tema:',t,'| ünite:',un);console.log('ilerleme kayıtları:',pr.map(x=>x.outcome.code+' %'+x.masteryScore+' '+x.status).join(', ')||'(yok)');})();"
  Pop-Location 
} finally {
  Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  Write-Host "`n▶ Sunucu kapatıldı." -ForegroundColor Cyan
}
