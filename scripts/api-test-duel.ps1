# Faz 4b testi: canlı düello (kur → katıl → cevapla → bitir)
$root = "C:\Users\muhar\OneDrive\Desktop\yapayzeka\4.hafta\odev2"
$web  = Join-Path $root "web"
$cA = Join-Path $root "cookies-duel-a.txt"
$cB = Join-Path $root "cookies-duel-b.txt"

Remove-Item $cA, $cB -ErrorAction SilentlyContinue

$proc = Start-Process -FilePath "C:\nodejs\node.exe" `
  -ArgumentList "node_modules\next\dist\bin\next", "start", "-p", "3000" `
  -WorkingDirectory $web `
  -RedirectStandardOutput (Join-Path $web "f5.log") -RedirectStandardError (Join-Path $web "f5.err.log") -PassThru

try {
  Start-Sleep -Seconds 4

  Write-Host "=== 1) OYUNCU A GIRIS + DUELLO KURMA ===" -ForegroundColor Yellow
  curl.exe -s -c $cA -X POST "http://localhost:3000/api/auth/login" `
    -H "Content-Type: application/json" --data-binary "@$root\scripts\req16.json" > $null
  $kur = curl.exe -s -b $cA -X POST "http://localhost:3000/api/duel" `
    -H "Content-Type: application/json" --data-binary "@$root\scripts\req19.json"
  Write-Host $kur
  $kurJson = $kur | ConvertFrom-Json
  $duelId = $kurJson.duelId
  $kod = $kurJson.code
  Write-Host "duelId=$duelId kod=$kod"

  Write-Host "`n=== 2) OYUNCU B GIRIS + KATILIM ===" -ForegroundColor Yellow
  curl.exe -s -c $cB -X POST "http://localhost:3000/api/auth/login" `
    -H "Content-Type: application/json" --data-binary "@$root\scripts\req20.json" > $null
  $joinBody = "{""code"":""$kod""}"
  Set-Content -Path (Join-Path $root "scripts\req21.json") -Value $joinBody -NoNewline
  curl.exe -s -b $cB -X POST "http://localhost:3000/api/duel/join" `
    -H "Content-Type: application/json" --data-binary "@$root\scripts\req21.json"
  Write-Host ""

  Write-Host "`n=== 3) DURUM (2 oyuncu, 5 soru) ===" -ForegroundColor Yellow
  $durum = curl.exe -s -b $cB "http://localhost:3000/api/duel/$duelId"
  $durumJson = $durum | ConvertFrom-Json
  Write-Host "durum: $($durumJson.duel.status) | oyuncu: $($durumJson.players.Count) | soru: $($durumJson.questions.Count) | oyuncular: $(($durumJson.players | ForEach-Object { $_.username }) -join ', ')"

  Write-Host "`n=== 4) OYUNCU A: DOGRU CEVAP (soru 1) ===" -ForegroundColor Yellow
  curl.exe -s -b $cA -X POST "http://localhost:3000/api/duel/$duelId/answer" `
    -H "Content-Type: application/json" --data-binary "@$root\scripts\req17.json"
  Write-Host ""

  Write-Host "`n=== 5) OYUNCU B: YANLIS CEVAP (soru 1) ===" -ForegroundColor Yellow
  curl.exe -s -b $cB -X POST "http://localhost:3000/api/duel/$duelId/answer" `
    -H "Content-Type: application/json" --data-binary "@$root\scripts\req18.json"
  Write-Host ""

  Write-Host "`n=== 6) OYUNCU A TURU BITIRIYOR ===" -ForegroundColor Yellow
  curl.exe -s -b $cA -X POST "http://localhost:3000/api/duel/$duelId/finish"
  Write-Host ""

  Write-Host "`n=== 7) OYUNCU B TURU BITIRIYOR (duello biter) ===" -ForegroundColor Yellow
  curl.exe -s -b $cB -X POST "http://localhost:3000/api/duel/$duelId/finish"
  Write-Host ""

  Write-Host "`n=== 8) SON DURUM ===" -ForegroundColor Yellow
  $son = curl.exe -s -b $cA "http://localhost:3000/api/duel/$duelId"
  $sonJson = $son | ConvertFrom-Json
  Write-Host "durum: $($sonJson.duel.status)"
  $sonJson.players | ForEach-Object { Write-Host "  $($_.username): $($_.score) puan, $($_.dogru) dogru, bitti=$($_.finished)" }

  Write-Host "`n=== 9) VERITABANI ===" -ForegroundColor Yellow
  Push-Location $web
  C:\nodejs\node.exe -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{const d=await p.duel.findMany({include:{players:{include:{user:{select:{username:true}}}}}});console.log('duellolar:',d.map(x=>'#'+x.id+' ['+x.code+'] '+x.status+' oyuncular:'+x.players.map(pl=>pl.user.username+'('+pl.score+')').join(',')).join(' | '));const sk=await p.score.findMany({where:{gameMode:{slug:'duel'}},include:{user:{select:{username:true}}}});console.log('duel skorlari:',sk.map(x=>x.user.username+':'+x.score).join(', ')||'(yok)');})();"
  Pop-Location
} finally {
  Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  Write-Host "`nSunucu kapatildi." -ForegroundColor Cyan
}
