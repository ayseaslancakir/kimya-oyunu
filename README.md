# 🧪 Kimya Oyunu — TYMM Müfredatına Dayalı Eğitici Web Oyunu

> **Türkiye Yüzyılı Maarif Modeli (TYMM)** Kimya Dersi Öğretim Programı'na (9-10-11-12. sınıf) birebir bağlı, web tabanlı, kullanıcı hesaplı ve oyuncu verilerini kaydeden eğitici oyun platformu.

---

## ✅ Teknolojiler ve Tasarım

| Karar | Seçim |
|-------|-------|
| Çatı | **Next.js 15 (App Router) + React 19 + TypeScript** (full-stack) |
| Stil | Tailwind CSS v4 |
| Veritabanı | **Prisma** + **PostgreSQL** (yerel geliştirme) → Neon (yayın) |
| Kimlik | JWT (jose) + bcryptjs, httpOnly çerez |
| Oyun modları | 🏆 Quiz Arena · ⚡ Hız Yarışı · 🧩 Bulmaca · 🚪 Kaçış Odası · 🔬 Sanal Lab · ⚔️ Canlı Düello |
| Öğretmen paneli | Sınıf yönetimi + öğrenci raporları + soru bankası |

## 🚀 Kurulum (bu makinede tamamlandı)

> ✅ Node.js 24.19 LTS (`C:\nodejs`) · Git 2.55 (`C:\git`) · PostgreSQL 18 (Windows hizmeti `postgresql-x64-18`, DB: `kimya`)
> Uygulama şu an **yerel PostgreSQL** üzerinde çalışıyor. Yayın rehberi: `docs/05-yayin-rehberi.md`

**Geliştirme sunucusu:**
```powershell
.\tools\run.cmd C:\nodejs\npm.cmd run dev
```
Tarayıcıda: `http://localhost:3000` · API: `http://localhost:3000/api/health`

**Yeni makinede kurulum:**
1. Node.js + PostgreSQL kur (yerel Postgres için: `initdb` ile veri dizini + `scripts\pgsql-start.cmd`)
2. `web/` içinde: `npm install`
3. `.env.example`'dan `.env` oluştur → `DATABASE_URL` + `JWT_SECRET` düzenle
4. Migration + seed:
   ```powershell
   npm run db:migrate          # şema kurar
   npm run db:seed             # müfredat (93 öğrenme çıktısı)
   npm run db:seed-questions   # örnek soru bankası
   ```

## 🗺️ Sayfalar

| Adres | Açıklama |
|-------|----------|
| `/` | Tanıtım + 6 oyun modu |
| `/kayit` · `/giris` | Kayıt (öğrenci/öğretmen) · Giriş |
| `/harita` | Müfredat haritası (sınıf→tema→ünite) + ilerleme |
| `/oyun/quiz?unitId=X` | 🏆 Quiz Arena |
| `/oyun/hiz` | ⚡ Hız Yarışı |
| `/oyun/bulmaca` | 🧩 Bulmaca Krallığı |
| `/oyun/kacis?unitId=X` | 🚪 Lab Kaçış Odası |
| `/oyun/lab` | 🔬 Sanal Laboratuvar |
| `/oyun/duel` · `/oyun/duel/katil` | ⚔️ Canlı Düello (kur / kodla katıl) |
| `/liderlik` | 🏆 Liderlik tablosu |
| `/koleksiyon` | 🧫 Element koleksiyonu + rozetler |
| `/panel` | 🛠️ Öğretmen paneli |
| `/panel/sinif/[id]` | Sınıf detayı + raporlar |
| `/panel/sorular` | 📝 Soru bankası yönetimi |
| `/sinif` | Öğrenci sınıfları + davet koduyla katılım |

## 📂 Proje Yapısı

```
odev2/
├── README.md                      ← bu dosya
├── docs/                          ← araştırma, plan ve yayın dokümanları
│   ├── 01-tymm-mufredat-arastirmasi.md
│   ├── 02-oyun-modelleri-10-tarz.md
│   ├── 03-teknoloji-ve-mimari.md
│   ├── 04-faz-plani-ve-yol-haritasi.md
│   └── 05-yayin-rehberi.md        ← GitHub + Vercel + Neon yayını
├── data/curriculum/               ← TYMM müfredatı (tymm_kimya_2026.json — 93 çıktı)
├── scripts/                       ← PDF araçları, API testleri, pgsql yardımcıları
├── tools/run.cmd                  ← PATH sarmalayıcı (node'u PATH'e ekler)
└── web/                           ← Next.js uygulaması (full-stack)
    ├── prisma/schema.prisma       ← veritabanı şeması (12+ model)
    ├── prisma/migrations/         ← PostgreSQL migration'ları
    ├── prisma/seed.ts             ← müfredat + modlar + rozetler
    ├── prisma/seed-questions.ts   ← örnek sorular
    └── src/                       ← app (sayfalar + API) · components · lib · data
```

## 📖 Dokümanlar

1. **Müfredat Araştırması** — TYMM kimya programının yapısı, resmi kaynaklar.
2. **10 Oyun Tarzı** — araştırma + kararlaştırılan mod seti.
3. **Teknoloji ve Mimari** — Next.js mimarisi, veritabanı şeması, API tasarımı.
4. **Faz Planı** — Faz 0 → 4 yol haritası.
5. **Yayın Rehberi** — GitHub + Vercel + Neon ile canlıya alma.

## 📍 Güncel Durum

| Faz | Durum |
|-----|-------|
| Faz 0 — Ön hazırlık (araştırma + kararlar) | ✅ Tamamlandı |
| Müfredat verisi çıkarma (resmi PDF → JSON) | ✅ Tamamlandı (93 çıktı, 20 ünite, 12 tema) |
| Faz 1 — Hesap + Quiz Arena | ✅ Tamamlandı |
| Faz 2 — Hız Yarışı + Bulmaca + liderlik + rozet + koleksiyon | ✅ Tamamlandı |
| Faz 3 — Öğretmen paneli + Kaçış Odası | ✅ Tamamlandı |
| Faz 4 — Sanal Lab + soru aracı + Canlı Düello | ✅ Tamamlandı |
| PostgreSQL geçişi | ✅ Tamamlandı (yerel PG 18 hizmet olarak çalışıyor) |
| **Vercel + Neon yayını** | ⏳ Kullanıcı hesabı gerekli → `docs/05-yayin-rehberi.md` |

## 🚀 Sonraki Adım

1. `docs/05-yayin-rehberi.md`'yi takip et: Neon hesabı → GitHub'a push → Vercel import (~20 dk).
2. Yayın sonrası soru bankasını genişlet (tüm ünitelere soru üretimi).
