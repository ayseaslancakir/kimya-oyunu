# GitHub işlemleri: repo'yu public yap + öğretmene (axxion) push yetkisi ver
# Kimlik: Git Credential Manager'da saklı oturumdan alınır (tarayıcı girişi)
$ErrorActionPreference = "Stop"

$git = "C:\git\cmd\git.exe"
$owner = "ayseaslancakir"
$repo = "kimya-oyunu"
$collab = "axxion"

# 1) Kayıtlı GitHub erişim anahtarını al
$credInput = "protocol=https`nhost=github.com`n"
$cred = $credInput | & $git credential fill
$tokenLine = $cred | Where-Object { $_ -like "password=*" }
if (-not $tokenLine) {
    Write-Host "HATA: GitHub oturumu bulunamadi. Once git push ile giris yapilmali." -ForegroundColor Red
    exit 1
}
$token = $tokenLine.Substring("password=".Length)

$headers = @{
    Authorization = "Bearer $token"
    Accept        = "application/vnd.github+json"
}

# 2) Repoyu PUBLIC yap
Write-Host "== 1) Repo public yapiliyor... ==" -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Method Patch -Uri "https://api.github.com/repos/$owner/$repo" -Headers $headers -Body '{"visibility":"public"}' -ContentType "application/json"
    Write-Host "OK: repo artik $($r.visibility)" -ForegroundColor Green
} catch {
    Write-Host "HATA: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3) Öğretmeni collaborator olarak ekle (push = düzenleme yetkisi)
Write-Host "`n== 2) $collab kullanicisina push yetkisi veriliyor... ==" -ForegroundColor Yellow
try {
    $r2 = Invoke-RestMethod -Method Put -Uri "https://api.github.com/repos/$owner/$repo/collaborators/$collab" -Headers $headers -Body '{"permission":"push"}' -ContentType "application/json"
    Write-Host "OK: $($r2.permissions.pull -eq $true)`n`n$($r2 | ConvertTo-Json -Depth 3)" -ForegroundColor Green
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    if ($status -eq 204) {
        Write-Host "OK: zaten ekli (204)" -ForegroundColor Green
    } else {
        Write-Host "HATA($status): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 4) Doğrulama
Write-Host "`n== Dogrulama ==" -ForegroundColor Yellow
$anon = curl.exe -s -o NUL -w "%{http_code}" "https://api.github.com/repos/$owner/$repo"
Write-Host "Repo herkese acik erisim: HTTP $anon (200 = public OK)"
