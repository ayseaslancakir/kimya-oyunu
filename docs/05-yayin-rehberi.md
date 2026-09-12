# 🚀 Yayın Rehberi (GitHub + Vercel + Neon)

> Hedef mimari: **Vercel** (uygulama) + **Neon** (PostgreSQL, ücretsiz). Yayında şema **PostgreSQL**'dir (`npm run use:postgres`) ve migration'lar build sırasında `prisma migrate deploy` ile uygulanır; yerel testler SQLite ile yapılır (`npm run setup:local`).
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
   > 🔌 Neon iki adres sunar: **Pooled** (`...-pooler...`) ve **Direct**. Bu proje migration'ları build sırasında çalıştırdığı için **Direct (pooled olmayan)** adresi kullan: pooled adres `prisma migrate deploy` sırasında hata verebilir. Neon panelinde bağlantı kutusundaki **Pooled connection** anahtarını kapatınca direct adres görünür.

## Adım 2 — GitHub'a yükle (5 dk)

### ⚠️ Önce: şemayı PostgreSQL'e çevir (yayın şartı)

Vercel, depodaki `prisma/schema.prisma` ile build eder. Yayında bu şema **PostgreSQL** olmalıdır; aksi hâlde build SQLite istemcisi üretir ve `prisma migrate deploy` Neon'da başarısız olur.

```powershell
cd web
# Çalışan bir geliştirme sunucusu varsa önce kapat (Prisma motor dosyasını kilitler).
C:\nodejs\npm.cmd run use:postgres
```

- Bu komut `prisma/schema.postgres.prisma` dosyasını `prisma/schema.prisma` üzerine kopyalar ve Prisma istemcisini yeniden üretir.
- Kontrol: `prisma/schema.prisma` içinde `provider = "postgresql"` yazmalı.
- Yerelde SQLite ile test etmek istersen `npm run setup:local` bu dosyayı geçici olarak SQLite'a çevirir (bunu **commit etme**).
- Aşağıdaki `git push`, PostgreSQL şemasını içermelidir.

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
4. **Environment Variables** ekle (Environment: **Production**, isteğe bağlı Preview):
   ```
   DATABASE_URL = <Adım 1'deki DIRECT (pooled olmayan) Neon bağlantısı; sonunda ?sslmode=require olmalı>
   JWT_SECRET   = <en az 32 karakterlik YENİ rastgele anahtar>
   TEACHER_CODE = <öğretmen kaydı için gizli kod (en az 8 karakter)>
   ```
   Güçlü bir `JWT_SECRET` üretmek için (PowerShell):
   ```powershell
   C:\nodejs\node.exe -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   ```
   > ⚠️ Varsayılan/yedek anahtarı kullanma: üretimde `JWT_SECRET` yoksa ya da 32 karakterden kısaysa uygulama oturum açamaz. Anahtarı kimseyle paylaşma, `.env` dosyasına yazıp commit etme.
   > ⚠️ Bu üç değişkenin hiçbiri koda veya repoya yazılmaz; yalnızca Vercel ortam değişkenlerinde tutulur.

### ➕ Vercel ortam değişkenlerine TEACHER_CODE ekle (zorunlu)

Yayında öğretmen hesabı açılabilmesi için `TEACHER_CODE` **mutlaka** tanımlı olmalıdır:

1. Vercel → proje (`kimya-oyunu`) → **Settings → Environment Variables**
2. **Add New** → Key: `TEACHER_CODE` · Value: güçlü ve gizli bir kod (en az 8 karakter önerilir) · Environment: **Production** (Preview de seçilebilir)
3. **Save** → ardından projeyi **yeniden Deploy** et (ortam değişkeni ancak yeni dağıtımda etkin olur)

> ⚠️ `TEACHER_CODE` yalnızca ortam değişkeninden gelir: veritabanına yazılmaz, uygulama/panel içinden değiştirilemez. Yayında kod tanımlı değilse öğretmen kaydı tamamen kapalıdır (403); kod tanımlıysa yalnızca doğru kodu giren kişi öğretmen hesabı açabilir.
5. **Deploy** → ilk build ~2-3 dk sürer. Migration'lar yayın veritabanına otomatik uygulanır (`prisma migrate deploy`).

## Adım 4 — Veritabanını doldur (1 kez, SEN çalıştıracaksın)

Migration'lar şemayı kurar ama **müfredat/ünite/oyun modları** ve **soru bankası** seed ile yüklenir. Aşağıdaki komutları kendi bilgisayarından, yayın (Neon) veritabanına bağlanarak **bir kez** çalıştır:

```powershell
# 0) Şema PostgreSQL istemcisi üretilmiş olmalı (Adım 2'deki: npm run use:postgres)
cd web

# 1) Yayın veritabanına bağlan (DIRECT/pooled olmayan adres; yalnızca bu terminal oturumu için geçerli)
$env:DATABASE_URL = "postgresql://...neon direct baglanti...?sslmode=require"

# 2) Müfredat, üniteler, öğrenme çıktıları, oyun modları (demo hesap OLUŞTURMAZ)
C:\nodejs\npm.cmd run db:seed

# 3) Soru bankası (9-12. sınıf)
C:\nodejs\npm.cmd run db:seed-questions
```

- Migration'lar Vercel build'inde zaten uygulanır; burada ayrıca `prisma migrate deploy` çalıştırmana gerek yok.
- 🔒 Bu komut yayında **demo hesap oluşturmaz**: `demo_ogrenci` / `demo_ogretmen` yalnızca `KIMYA_DEMO_HESAPLAR=1` ile (yerel `npm run setup:local`) yüklenir. Şifresi herkesçe bilinen bir öğretmen hesabının canlıya çıkmaması için böyledir.
- `$env:DATABASE_URL` yalnızca o PowerShell penceresi için geçerlidir; değeri `.env` dosyasına yazıp **commit etme**.
- Kontrol: Neon → **Tables** içinde `Unit`, `LearningOutcome` ve `Question` tabloları dolmuş olmalı (yaklaşık 304 soru).

## Adım 5 — Doğrula

| Kontrol | Adres |
|---------|-------|
| Ana sayfa | `https://kimya-oyunu.vercel.app` |
| Sağlık | `https://kimya-oyunu.vercel.app/api/health` → `status: "ok"` ve `db: "ok"` olmalı |
| Kayıt → Harita → oyun | Tarayıcıda dene |

```powershell
# Beklenen: HTTP 200 ve gövdede "db":"ok"
curl.exe -s https://kimya-oyunu.vercel.app/api/health
```

> ⚠️ Sağlık 503 veya `db:"hata"` dönerse `DATABASE_URL` yanlış ya da migration uygulanmamıştır: Vercel → **Deployments → Build Logs** içinde `prisma migrate deploy` çıktısını kontrol et.

> Öğretmen olarak kayıt olmayı da bir kez dene: kod doğruysa hesap açılır, kod yanlışsa "Öğretmen davet kodu hatalı" hatası görünür.

## 🔒 Yayın öncesi güvenlik kontrol listesi

- [ ] `JWT_SECRET` güçlü ve rastgele (varsayılan DEĞİL)
- [ ] `TEACHER_CODE` yayında tanımlı ve yalnızca ortam değişkeninde — paylaşılan kod sızmasın
- [ ] Neon şifresi güçlü; bağlantı `sslmode=require`
- [ ] `.env` dosyaları repo'da YOK (gitignore kontrol)
- [ ] `prisma/schema.prisma` PostgreSQL (`provider = "postgresql"`) — `npm run use:postgres` çalıştırıldı ve commit edildi
- [ ] Canlı veritabanında `demo_ogretmen` / `demo_ogrenci` hesabı YOK (üretim seed'i oluşturmaz; `KIMYA_DEMO_HESAPLAR` kapalı)
- [ ] Repo **private** (öğrenci verisi için)
- [ ] KVKK notu: kullanıcı adı + e-posta toplanıyor; gizlilik politikası eklenmeli
- [ ] `pgpass.txt` gibi şifre dosyaları repo dışında

## 🛠️ Sorun giderme

| Sorun | Çözüm |
|-------|-------|
| Build hatası: "Prisma client not generated" | Vercel'de Install Command'ın `npm install` olduğundan emin ol (postinstall çalışmalı) |
| `P1001` migration hatası | `DATABASE_URL` doğru mu? Neon'un **pooled** adresini kullanıyorsan **Direct** (pooled olmayan) adrese geç |
| Migration çakışması | `prisma migrate deploy` hatası → Neon SQL Editor'de `_prisma_migrations` tablosunu kontrol et |
| UTF-8 sorunları | Neon projesi varsayılan UTF-8; locale sorunu olmaz (yerelde `--locale=C` kullandık) |
| Öğretmen kaydı "kapalı" (403) | Yayında `TEACHER_CODE` tanımlı değil → Vercel → Settings → Environment Variables'a ekle ve **yeniden Deploy** et |

## 📈 Geliştirme ortamı (bu makine)

| Bileşen | Durum |
|---------|-------|
| PostgreSQL 18 | ✅ Windows hizmeti `postgresql-x64-18` (otomatik başlar) — DB: `kimya`, kullanıcı: `postgres` |
| Migration + seed | ✅ `web/prisma/migrations` (Postgres için) uygulandı |
| Çalıştırma | `.\tools\run.cmd C:\nodejs\npm.cmd run dev` |

> Yerelde `TEACHER_CODE` tanımlı değilse öğretmen kaydı serbesttir (geliştirme kolaylığı); kodla korumak isterseniz `web/.env` dosyasına `TEACHER_CODE` ekleyip sunucuyu yeniden başlatın. Hazır `demo_ogretmen` hesabı bu koddan bağımsız çalışır (şifre: `demo123456`).

> Yerel PostgreSQL'i elle durdurmak gerekirse (yönetici): `net stop postgresql-x64-18`
