# 🛠️ Teknoloji ve Mimari — Next.js Sürümü (KARAR VERİLDİ)

> ✅ **Sahip kararı:** Next.js (full-stack, tek dil: TypeScript). Frontend + API + öğretmen paneli aynı uygulamada.
> Veritabanı şeması oyun modundan bağımsızdır; modlar zamanla eklenir.

---

## 1. Mimari Genel Bakış

```
┌────────────────────────────────────────────────────────────┐
│                     Next.js Uygulaması (web/)               │
│                                                            │
│  App Router                                               │
│  ├── Sayfalar (UI + oyun ekranları + öğretmen paneli)      │
│  ├── Route Handlers (API: /api/...)                        │
│  └── Server Actions (form işlemleri, opsiyonel)            │
│                                                            │
│  Prisma ORM ──▶ SQLite (geliştirme) ──▶ PostgreSQL (yayın) │
└────────────────────────────────────────────────────────────┘
```

**Neden tek uygulama?** Next.js hem oyun arayüzünü hem API'yi barındırır → tek deploy, tek dil, daha az kurulum. Öğretmen paneli de aynı uygulamada `/panel` altında.

## 2. Teknoloji Seçimi

| Katman | Seçim | Not |
|--------|-------|-----|
| **Çatı (Framework)** | **Next.js 15 (App Router) + React 19** | Sunucu bileşenleri + API aynı yerde |
| **Dil** | **TypeScript** | Tip güvenliği; modellerle senkron |
| **Stil** | **Tailwind CSS v4** | Hızlı UI geliştirme |
| **Veritabanı** | **SQLite (geliştirme) → PostgreSQL (yayın)** | Prisma ile geçiş sadece `provider` değişikliği |
| **ORM** | **Prisma** | Şema tabanlı, migration desteği |
| **Kimlik Doğrulama** | **JWT (jose) + bcryptjs, httpOnly çerez** | Basit, şeffaf; bağımlılık az |
| **Doğrulama** | **Zod** | Form/API girdileri |
| **Deploy** | **Vercel** (frontend+API) + **Neon** (PostgreSQL) | Ücretsiz kotalar yeterli |
| **İçerik** | JSON seed dosyaları → DB | `data/curriculum/` klasöründen yüklenir |

> ⚠️ **Ön koşul:** Node.js **LTS (22+)** kurulu olmalı. (Bu makinede henüz yok — kurulum: `nodejs.org` → LTS indir → kur → `node --version` ile doğrula.)

## 3. Veritabanı Şeması (Prisma)

Tam şema: **`web/prisma/schema.prisma`** dosyasında hazır. Model listesi:

### Müfredat (TYMM — içeriğin omurgası)
```
Curriculum (1) ──▶ Grade (9/10/11/12) ──▶ Theme (Etkileşim/Çeşitlilik/Sürdürülebilirlik)
                    └──▶ Unit ──▶ LearningOutcome (KİM.9.1.1) ──▶ Question ──▶ QuestionOption
```

### Kullanıcı ve Oyun
```
User (role: student/teacher/admin, grade, xp)
 ├── UserProgress      → çıktı bazlı ustalık (mastery)
 ├── Score             → her oyun oturumu (mod, konu, skor, isabet, süre)
 ├── InventoryItem     → koleksiyon (element/kart/keşif)
 └── UserAchievement   → rozetler

GameMode (quiz_arena, hiz_yarisi, bulmaca, kacis_odasi, sanal_lab...)
```

### Öğretmen Paneli
```
User (teacher) ──▶ Class (inviteCode ile katılım) ──▶ ClassStudent (öğrenci üyelikleri)
```

**Tasarım kararları:**
- Tüm skorlar satır satır saklanır → liderlik tabloları ve raporlar sorguyla üretilir.
- Mastery: son denemelerin ağırlıklı ortalaması; ≥80 = "mastered".
- Müfredat tabloları modlardan bağımsız → yeni mod veritabanını değiştirmez.

## 4. API Tasarımı (Next.js Route Handlers)

| Metot | Uç Nokta | Açıklama | Faz |
|-------|----------|----------|-----|
| POST | `/api/auth/register` | Kayıt | 1 |
| POST | `/api/auth/login` | Giriş → JWT çerezi | 1 |
| POST | `/api/auth/logout` | Çıkış | 1 |
| GET | `/api/curriculum` | Müfredat ağacı | 1 |
| GET | `/api/units/{id}/questions?mode=quiz` | Sorular | 1 |
| POST | `/api/answers` | Cevap → doğruluk + açıklama | 1 |
| POST | `/api/sessions` | Tur bitince skor kaydı | 1 |
| GET | `/api/progress/me` | İlerleme haritası | 1 |
| GET | `/api/leaderboard` | Liderlik | 2 |
| GET | `/api/inventory/me` | Koleksiyon | 2 |
| POST/GET | `/api/classes` (öğretmen) | Sınıf yönetimi | 3 |
| GET | `/api/classes/{id}/reports` | Öğrenci raporları | 3 |

## 5. Klasör Yapısı (hazır iskelet)

```
odev2/
├── README.md                     ← kurulum rehberi
├── docs/                         ← karar ve plan dokümanları
├── data/
│   └── curriculum/               ← TYMM'den çıkarılan müfredat JSON + format şeması
└── web/                          ← Next.js uygulaması (full-stack)
    ├── package.json              ← bağımlılıklar (npm install ile kurulur)
    ├── next.config.ts
    ├── tsconfig.json
    ├── postcss.config.mjs
    ├── .env.example              ← DATABASE_URL + JWT_SECRET şablonu
    ├── .gitignore
    ├── prisma/
    │   ├── schema.prisma         ← tam veritabanı şeması
    │   └── seed.ts               ← sınıf + tema + oyun modları seed'i
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx          ← giriş/ana sayfa (tema haritası)
        │   ├── globals.css       ← Tailwind v4
        │   └── api/health/route.ts  ← sağlık kontrolü (çalışır kanıt)
        ├── lib/
        │   └── db.ts             ← Prisma singleton
        └── components/           ← (Faz 1'de) QuestionCard, Timer...
```

## 6. Güvenlik ve Gizlilik

- Şifreler hash'lenir (bcryptjs) — asla düz metin.
- JWT kısa ömürlü (30 dk) + httpOnly çerez; şifre çereze yazılmaz.
- `JWT_SECRET` .env'de; üretimde uzun rastgele değer.
- KVKK notu: minimum veri topla (kullanıcı adı, e-posta, sınıf düzeyi); 18 yaş altı için e-posta opsiyonel olabilir.
- Öğretmen paneli: sadece `role=teacher` erişir; öğrenci verisi sadece kendi sınıfından görünür.
