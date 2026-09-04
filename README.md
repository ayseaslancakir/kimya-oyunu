# Kimya Oyunu — TYMM müfredatına dayalı eğitici web oyunu

Türkiye Yüzyılı Maarif Modeli (TYMM) Kimya Dersi Öğretim Programı’na (9–12) bağlı, hesaplı ve skor kaydeden web oyunu.

**Ayşe:** geliştirmeye devam etmek için önce `docs/06-ayse-yapay-zeka-rehberi.md` dosyasını oku. Yapay zekâya ne söyleyeceğin orada, kopyalanacak metinlerle duruyor.

## Teknoloji

| Katman | Seçim |
|--------|--------|
| Çatı | Next.js 15 (App Router) + React 19 + TypeScript |
| Stil | Tailwind CSS v4 |
| Veri | Prisma + PostgreSQL |
| Kimlik | JWT (`jose`) + bcryptjs, httpOnly çerez |
| Modlar | Quiz Arena · Hız Yarışı · Bulmaca · Kaçış Odası · Sanal Lab · Canlı Düello |

## Kurulum

**En kolay (PostgreSQL gerekmez):**

```powershell
cd web
npm install
npm run setup:local
npm run dev
```

Tarayıcı: `http://localhost:3000` · sağlık: `http://localhost:3000/api/health`

Tek komut: `npm run dev:oyun` (kurulum + sunucu birlikte).

**Demo hesapları:** `demo_ogrenci` / `demo_ogretmen` · şifre `demo123456` (`setup:local` sonrası)

**PostgreSQL ile (yayına yakın):** `.env.example` B seçeneği + `npx prisma migrate deploy` + seed.

## Sayfalar

| Adres | Ne işe yarar |
|-------|----------------|
| `/` | Tanıtım, müfredat ızgarası, modlar |
| `/kayit` · `/giris` | Hesap |
| `/harita` | Sınıf → tema → ünite + ustalık |
| `/oyun/quiz?unitId=` | Quiz Arena |
| `/oyun/hiz` | Hız yarışı |
| `/oyun/bulmaca` | Eşleştirme |
| `/oyun/kacis?unitId=` | Kaçış odası |
| `/oyun/lab` | Sanal laboratuvar |
| `/oyun/duel` | Düello kur / katıl |
| `/liderlik` · `/koleksiyon` | Sıralama ve kartlar |
| `/panel` | Öğretmen |
| `/sinif` | Öğrenci katılımı |
| `/gizlilik` | Kısa gizlilik notu |

## Klasörler

```
kimya-oyunu/
├── README.md
├── docs/                 araştırma, faz planı, yayın, Ayşe rehberi
├── data/curriculum/      TYMM JSON (93 öğrenme çıktısı)
├── scripts/              API denemeleri, müfredat araçları
├── tools/run.cmd
└── web/                  Next.js uygulaması
    ├── prisma/
    └── src/              app, components, lib, data
```

## Durum

İskelet ve altı mod **oynanabilir**. Asıl açık: soru bankası dar (çoğu örnek 9. sınıf Tema 1), bazı modlar henüz tam “oyun” değil quiz/hikâye karışımı. Yayın: Vercel + Neon — `docs/05-yayin-rehberi.md`.

Sıradaki iş listesi ve yapay zekâ komutları: **`docs/06-ayse-yapay-zeka-rehberi.md`**.
