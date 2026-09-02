# Faz 2 API testi: hız yarışı + bulmaca skorları, rozetler, element, liderlik
$root = "C:\Users\muhar\OneDrive\Desktop\yapayzeka\4.hafta\odev2"
$web  = Join-Path $root "web"
$cookie = Join-Path $root "cookies-test2.txt"

Remove-Item $cookie -ErrorAction SilentlyContinue

$proc = Start-Process -FilePath "C:\nodejs\node.exe" `
  -ArgumentList "node_modules\next\dist\bin\next", "start", "-p", "3000" `
  -WorkingDirectory $web `
  -RedirectStandardOutput (Join-Path $web "f2.log") -RedirectStandardError (Join-Path $web "f2.err.log") -PassThru

try {
  Start-Sleep -Seconds 4

  Write-Host "=== 1) GİRİŞ ===" -ForegroundColor Yellow
  curl.exe -s -c $cookie -X POST "http://localhost:3000/api/auth/login" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req5.json"
  Write-Host ""

  Write-Host "`n=== 2) HIZ YARIŞI TURU (rozet + element beklenir) ===" -ForegroundColor Yellow
  curl.exe -s -b $cookie -X POST "http://localhost:3000/api/quiz/finish" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req6.json"
  Write-Host ""

  Write-Host "`n=== 3) BULMACA TURU (düşük doğruluk → element yok, rozet yok) ===" -ForegroundColor Yellow
  curl.exe -s -b $cookie -X POST "http://localhost:3000/api/quiz/finish" `
    -H "Content-Type: application/json" `
    --data-binary "@$root\scripts\req7.json"
  Write-Host ""

  Write-Host "`n=== 4) LİDERLİK (hiz_yarisi, tüm zamanlar) ===" -ForegroundColor Yellow
  curl.exe -s -b $cookie "http://localhost:3000/api/leaderboard?mode=hiz_yarisi&period=all"
  Write-Host ""

  Write-Host "`n=== 5) LİDERLİK (quiz_arena, haftalık) ===" -ForegroundColor Yellow
  curl.exe -s -b $cookie "http://localhost:3000/api/leaderboard?mode=quiz_arena&period=week"
  Write-Host ""

  Write-Host "`n=== 6) VERİTABANI: rozet + envanter ===" -ForegroundColor Yellow
  Push-Location $web
  C:\nodejs\node.exe -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{const ro=await p.userAchievement.findMany({include:{achievement:true,user:{select:{username:true}}}});console.log('rozetler:',ro.map(r=>r.user.username+':'+r.achievement.slug).join(', ')||'(yok)');const en=await p.inventoryItem.findMany({where:{itemType:'element'},include:{user:{select:{username:true}}}});console.log('elementler:',en.map(e=>e.user.username+':'+e.itemKey).join(', ')||'(yok)');const sk=await p.score.findMany({include:{gameMode:true}});console.log('skorlar:',sk.map(s=>s.gameMode.slug+':'+s.score).join(', ')||'(yok)');})();"
  Pop-Location
} finally {
  Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  Write-Host "`n▶ Sunucu kapatıldı." -ForegroundColor Cyan
}
