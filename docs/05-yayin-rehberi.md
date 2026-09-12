# 🚀 Yayın Rehberi (GitHub + Vercel + Neon)

> Hedef mimari: **Vercel** (uygulama) + **Neon** (PostgreSQL, ücretsiz). Uygulama şu an yerel PostgreSQL'de çalışıyor ve şema yayına hazır.
> Tahmini süre: 20-30 dakika.

---

## Mimari

```
GitHub (kod) ──▶ Vercel (Next.js + API) ──▶ Neon PostgreSQL
                     │                          ▲
                     └── build: prisma migrate deploy + next build
```

## Adım 1 — Neon'da veritabanı oluştur (5 dk)

1. [neon.tech](https://neon.tech) → **Sign up** (GitHub ile en hızlısı)
2. Yeni proje oluştur: **Create a project** → ad: `kimya-oyunu` → bölge: `Europe (Frankfurt)`
3. Açılan **connection string**'i kopyala:
   ```
   postgresql://neondb_owner:XXXX@ep-xxx.eu-central-1.aws.neon.tech/kimya-oyunu?sslmode=require
   ```
   > ⚠️ Bu şifre `postgres` kullanıcısına ait. Daha güvenli alternatif: **Roles** bölümünden yeni rol + şifre üret.

## Adım 2 — GitHub'a yükle (5 dk)

```powershell
# Proje zaten git reposu olarak hazırlandı (bu rehberle birlikte). Kontrol:
C:\git\cmd\git.exe status

# 1. github.com → New repository → ad: kimya-oyunu (private önerilir) → Create
# 2. Repo'yu uzak adres olarak ekle:
C:\git\cmd\git.exe remote add origin https://github.com/KULLANICI-ADI/kimya-oyunu.git
# 3. İlk gönderim:
C:\git\cmd\git.exe push -u origin main
```

> 📌 **Öneri:** Proje OneDrive içinde. Yayın öncesi klasörü `C:\dev\kimya-oyunu` gibi OneDrive dışına taşıman önerilir (OneDrive, `.git` klasörünü sürekli senkronlamaya çalışır ve dosya kilitleri sorun çıkarabilir).

## Adım 3 — Vercel'e bağla (10 dk)

1. [vercel.com](https://vercel.com) → **Sign up** (GitHub ile)
2. **Add New → Project** → GitHub'dan `kimya-oyunu` repo'sunu seç (Vercel GitHub uygulamasını ister → Install)
3. Proje ayarları:
   | Ayar | Değer |
   |------|-------|
   | Framework Preset | Next.js (otomatik algılanır) |
   | **Root Directory** | `web` |
   | Build Command | `prisma migrate deploy && next build` (vercel.json ile otomatik) |
   | Install Command | `npm install` (postinstall → prisma generate otomatik) |
4. **Environment Variables** ekle:
   ```
   DATABASE_URL = <Adım 1'deki Neon bağlantısı>
   JWT_SECRET   = <en az 32 karakterlik rastgele anahtar — randomkeygen.com>
   TEACHER_CODE = <öğretmen kaydı için gizli kod — en az 8 karakter>
   ```

### ➕ Vercel ortam değişkenlerine TEACHER_CODE ekle (zorunlu)

Yayında öğretmen hesabı açılabilmesi için `TEACHER_CODE` **mutlaka** tanımlı olmalıdır:

1. Vercel → proje (`kimya-oyunu`) → **Settings → Environment Variables**
2. **Add New** → Key: `TEACHER_CODE` · Value: en az 8 karakterlik güçlü ve gizli bir kod · Environment: **Production** (Preview de seçilebilir)
3. **Save** → ardından projeyi **yeniden Deploy** et (ortam değişkeni ancak yeni dağıtımda etkin olur)

> ⚠️ `TEACHER_CODE` yalnızca ortam değişkeninden gelir: veritabanına yazılmaz, uygulama/panel içinden değiştirilemez. Kod tanımlı değilse (veya yayında 8 karakterden kısaysa) öğretmen kaydı reddedilir ve `/api/health` **503** döner.
5. **Deploy** → ilk build ~2-3 dk sürer. Migration'lar yayın veritabanına otomatik uygulanır (`prisma migrate deploy`).

## Adım 4 — Soru bankasını doldur (1 kez)

Migration'lar şemayı kurar ama **örnek sorular** seed ile yüklenir. Yayın DB'sine bir kez çalıştır:

```powershell
# Yerelden, yayın DB'sine bağlanarak:
cd web
$env:DATABASE_URL = "postgresql://...neon bağlantısı..."
C:\nodejs\npx.cmd tsx prisma/seed-questions.ts
```

> Veya Vercel **Cron/CLI** yerine basitçe: Neon **SQL Editor**'ü aç → `seed-questions.ts` dosyasındaki soruları elle ekle. (İleride yönetim paneli yapılırsa otomatikleşir.)

## Adım 5 — Doğrula

| Kontrol | Adres |
|---------|-------|
| Ana sayfa | `https://kimya-oyunu.vercel.app` |
| Sağlık | `https://kimya-oyunu.vercel.app/api/health` → `status: "ok"` ve `teacherCodeConfigured: true` olmalı |
| Kayıt → Harita → oyun | Tarayıcıda dene |

> Öğretmen olarak kayıt olmayı da bir kez dene: kod doğruysa hesap açılır, kod yanlışsa "Öğretmen kodu geçersiz" hatası görünür.

## 🔒 Yayın öncesi güvenlik kontrol listesi

- [ ] `JWT_SECRET` güçlü ve rastgele (varsayılan DEĞİL)
- [ ] `TEACHER_CODE` yayında tanımlı (en az 8 karakter) ve yalnızca ortam değişkeninde — paylaşılan kod sızmasın
- [ ] Neon şifresi güçlü; bağlantı `sslmode=require`
- [ ] `.env` dosyaları repo'da YOK (gitignore kontrol)
- [ ] Repo **private** (öğrenci verisi için)
- [ ] KVKK notu: kullanıcı adı + e-posta toplanıyor; gizlilik politikası eklenmeli
- [ ] `pgpass.txt` gibi şifre dosyaları repo dışında

## 🛠️ Sorun giderme

| Sorun | Çözüm |
|-------|-------|
| Build hatası: "Prisma client not generated" | Vercel'de Install Command'ın `npm install` olduğundan emin ol (postinstall çalışmalı) |
| `P1001` migration hatası | `DATABASE_URL` doğru mu? Neon'da "connection pooling" varsa `?sslmode=require` ekle |
| Migration çakışması | `prisma migrate deploy` hatası → Neon SQL Editor'de `_prisma_migrations` tablosunu kontrol et |
| UTF-8 sorunları | Neon projesi varsayılan UTF-8; locale sorunu olmaz (yerelde `--locale=C` kullandık) |
| Öğretmen kaydı "kapalı" / sağlık 503 | Vercel → Settings → Environment Variables'ta `TEACHER_CODE` yok ya da kısa → ekle ve **yeniden Deploy** et |

## 📈 Geliştirme ortamı (bu makine)

| Bileşen | Durum |
|---------|-------|
| PostgreSQL 18 | ✅ Windows hizmeti `postgresql-x64-18` (otomatik başlar) — DB: `kimya`, kullanıcı: `postgres` |
| Migration + seed | ✅ `web/prisma/migrations` (Postgres için) uygulandı |
| Çalıştırma | `.\tools\run.cmd C:\nodejs\npm.cmd run dev` |

> Yerelde öğretmen kaydını denemek istersen `web/.env` dosyasına `TEACHER_CODE` ekle (en az 8 karakter) ve sunucuyu yeniden başlat. Hazır `demo_ogretmen` hesabı bu koddan bağımsız çalışır (şifre: `demo123456`).

> Yerel PostgreSQL'i elle durdurmak gerekirse (yönetici): `net stop postgresql-x64-18`
