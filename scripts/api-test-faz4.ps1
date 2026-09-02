# Faz 4 testi: sanal laboratuvar + öğretmen soru ekleme (dosya tabanlı gövdeler)
$root = "C:\Users\muhar\OneDrive\Desktop\yapayzeka\4.hafta\odev2"
$web  = Join-Path $root "web"
$cTeacher = Join-Path $root "cookies-teacher.txt"
$cStudent = Join-Path $root "cookies-student.txt"

Remove-Item $cTeacher, $cStudent -ErrorAction SilentlyContinue

$proc = Start-Process -FilePath "C:\nodejs\node.exe" `
  -ArgumentList "node_modules\next\dist\bin\next", "start", "-p", "3000" `
  -WorkingDirectory $web `
  -RedirectStandardOutput (Join-Path $web "f4.log") -RedirectStandardError (Join-Path $web "f4.err.log") -PassThru

try {
  Start-Sleep -Seconds 4

  Write-Host "=== 1) OGRETMEN GIRIS ===" -ForegroundColor Yellow
  curl.exe -s -c $cTeacher -X POST "http://localhost:3000/api/auth/login" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req15.json"
  Write-Host ""

  Write-Host "`n=== 2) OGRETMEN SORU EKLEME ===" -ForegroundColor Yellow
  curl.exe -s -b $cTeacher -X POST "http://localhost:3000/api/questions" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req12.json"
  Write-Host ""

  Write-Host "`n=== 3) OGRENCI SORU EKLEME GIRISIMI (403 beklenir) ===" -ForegroundColor Yellow
  curl.exe -s -c $cStudent -X POST "http://localhost:3000/api/auth/login" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req16.json" > $null
  curl.exe -s -o NUL -w "HTTP %{http_code}" -b $cStudent -X POST "http://localhost:3000/api/questions" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req12.json"
  Write-Host " (403 beklenir)"

  Write-Host "`n=== 4) GECERSIZ DOGRU INDEKS (400 beklenir) ===" -ForegroundColor Yellow
  curl.exe -s -b $cTeacher -X POST "http://localhost:3000/api/questions" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req14.json"
  Write-Host ""

  Write-Host "`n=== 5) SANAL LABORATUVAR TURU ===" -ForegroundColor Yellow
  curl.exe -s -b $cStudent -X POST "http://localhost:3000/api/quiz/finish" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req13.json"
  Write-Host ""

  Write-Host "`n=== 6) VERITABANI ===" -ForegroundColor Yellow
  Push-Location $web
  C:\nodejs\node.exe -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{const q=await p.question.findMany({orderBy:{id:'desc'},take:2,include:{options:true,outcome:true}});console.log('son sorular:',q.map(x=>'#'+x.id+' ['+x.outcome.code+'] '+x.prompt.slice(0,40)+' ('+x.options.length+' opt)').join(' | '));const sk=await p.score.findMany({where:{gameMode:{slug:'sanal_lab'}},include:{user:{select:{username:true}}}});console.log('sanal_lab skorlari:',sk.map(x=>x.user.username+':'+x.score).join(', ')||'(yok)');})();"
  Pop-Location
} finally {
  Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  Write-Host "`nSunucu kapatildi." -ForegroundColor Cyan
}
