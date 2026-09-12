# Kimya Oyunu — TYMM müfredatına dayalı eğitici web oyunu

Türkiye Yüzyılı Maarif Modeli (TYMM) Kimya Dersi Öğretim Programı’na (9–12) bağlı, hesaplı ve skor kaydeden web oyunu.

**Ayşe:** önce `docs/06-ayse-yapay-zeka-rehberi.md` (nasıl çalıştırılır, günlük akış),
sonra `docs/07-yapay-zeka-gorev-listesi.md` (yapay zekâya yapıştıracağın görev kutuları).

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

**Faydalı komutlar:** `npm run check` (TypeScript denetimi) · `npm run use:postgres` (şemayı PostgreSQL'e çevir)

**Öğretmen hesabı:** `TEACHER_CODE` ortam değişkeni tanımlıysa kayıt sırasında davet kodu istenir.
Yayında kod tanımlı değilse öğretmen kaydı tamamen kapalıdır (yerel geliştirmede serbest).

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
├── docs/                 araştırma, faz planı, yayın, Ayşe rehberi, görev listesi
├── data/curriculum/      TYMM JSON (93 öğrenme çıktısı)
├── scripts/              API denemeleri, müfredat araçları
├── tools/run.cmd
└── web/                  Next.js uygulaması
    ├── prisma/
    └── src/              app, components, lib, data
```

## Durum

İskelet ve altı mod **oynanabilir**; soru bankasında 88 soru var (ağırlıkla 9–10. sınıf).

Açık kalan işler:

- **Skor istemciden geliyor.** Sunucu mod tavanı, süre tutarlılığı ve günlük XP sınırı uyguluyor
  (`web/src/lib/game.ts`), ama turun kendisi henüz sunucuda tutulmuyor — görev listesinde **S1**.
- 11 ve 12. sınıf soruları eksik — **İ1**.
- Hız/bulmaca müfredat çıktısına bağlı değil; kaçış odası hâlâ quiz kılığında — **O1, O2**.
- Otomatik test yok — **Y1**.

Yayın: Vercel + Neon — `docs/05-yayin-rehberi.md`.

Sıradaki iş listesi ve yapay zekâ komutları: **`docs/07-yapay-zeka-gorev-listesi.md`**.
