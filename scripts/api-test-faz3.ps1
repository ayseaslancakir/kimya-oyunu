# Faz 3 API testi: öğretmen paneli (sınıf + davet kodu) + kaçış odası modu
$root = "C:\Users\muhar\OneDrive\Desktop\yapayzeka\4.hafta\odev2"
$web  = Join-Path $root "web"
$cTeacher = Join-Path $root "cookies-teacher.txt"
$cStudent = Join-Path $root "cookies-student.txt"

Remove-Item $cTeacher, $cStudent -ErrorAction SilentlyContinue

$proc = Start-Process -FilePath "C:\nodejs\node.exe" `
  -ArgumentList "node_modules\next\dist\bin\next", "start", "-p", "3000" `
  -WorkingDirectory $web `
  -RedirectStandardOutput (Join-Path $web "f3.log") -RedirectStandardError (Join-Path $web "f3.err.log") -PassThru

try {
  Start-Sleep -Seconds 4

  Write-Host "=== 1) ÖĞRETMEN KAYDI ===" -ForegroundColor Yellow
  curl.exe -s -c $cTeacher -X POST "http://localhost:3000/api/auth/register" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req8.json"
  Write-Host ""

  Write-Host "`n=== 2) SINIF OLUŞTUR (öğretmen) ===" -ForegroundColor Yellow
  $cevap = curl.exe -s -b $cTeacher -X POST "http://localhost:3000/api/classes" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req9.json"
  Write-Host $cevap
  $kod = ($cevap | ConvertFrom-Json).sinif.inviteCode
  Write-Host "→ Davet kodu: $kod"

  Write-Host "`n=== 3) SINIF OLUŞTUR (öğrenci girişimi → 403 beklenir) ===" -ForegroundColor Yellow
  curl.exe -s -o NUL -w "HTTP %{http_code}" -b $cStudent -X POST "http://localhost:3000/api/classes" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req9.json"
  Write-Host " (çerezsiz → 401 beklenir)"
  curl.exe -s -o NUL -w "HTTP %{http_code}" -X POST "http://localhost:3000/api/classes" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req9.json"
  Write-Host ""

  Write-Host "`n=== 4) ÖĞRENCİ GİRİŞ + SINIFA KATILIM ===" -ForegroundColor Yellow
  curl.exe -s -c $cStudent -X POST "http://localhost:3000/api/auth/login" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req5.json"
  Write-Host ""
  $joinBody = "{""inviteCode"":""$kod""}"
  Set-Content -Path (Join-Path $root "scripts\req10.json") -Value $joinBody -NoNewline
  curl.exe -s -b $cStudent -X POST "http://localhost:3000/api/classes/join" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req10.json"
  Write-Host ""

  Write-Host "`n=== 5) AYNI KODLA TEKRAR KATILIM (→ 409 beklenir) ===" -ForegroundColor Yellow
  curl.exe -s -b $cStudent -X POST "http://localhost:3000/api/classes/join" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req10.json"
  Write-Host ""

  Write-Host "`n=== 6) KAÇIŞ ODASI TURU (mode: kacis_odasi) ===" -ForegroundColor Yellow
  curl.exe -s -b $cStudent -X POST "http://localhost:3000/api/quiz/finish" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req11.json"
  Write-Host ""

  Write-Host "`n=== 7) VERİTABANI: sınıflar + üyelikler + kaçış skoru ===" -ForegroundColor Yellow
  Push-Location $web
  C:\nodejs\node.exe -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{const s=await p.class.findMany({include:{_count:{select:{students:true}},students:{include:{user:{select:{username:true}}}}}});console.log('sınıflar:',s.map(c=>c.name+' ['+c.inviteCode+'] öğrenci:'+c.students.map(x=>x.user.username).join(',')).join(' | '));const k=await p.score.findMany({where:{gameMode:{slug:'kacis_odasi'}},include:{user:{select:{username:true}}}});console.log('kaçış skorları:',k.map(x=>x.user.username+':'+x.score).join(', ')||'(yok)');})();"
  Pop-Location
} finally {
  Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  Write-Host "`n▶ Sunucu kapatıldı." -ForegroundColor Cyan
}
