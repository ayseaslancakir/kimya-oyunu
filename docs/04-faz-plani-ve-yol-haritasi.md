# 🗺️ Faz Planı ve Yol Haritası (GÜNCELLENDİ)

> ✅ **Kararlar:** Next.js (full-stack) · Mod seti: Quiz Arena çekirdek + çeşitlendirme · Öğretmen paneli dahil
> Her faz çalışır bir ürün çıkarır; faz sonunda sahip onayı alınır.

---

## Faz 0 — Ön Hazırlık ✅ (2 küçük görev kaldı)

**Tamamlanan:**
- [x] Müfredat araştırması + 10 oyun tarzı + mimari + faz planı
- [x] Kararlar: Next.js, mod seti, öğretmen paneli
- [x] Proje iskeleti: `web/` (Next.js + Prisma + Tailwind) — dosyalar hazır

**Kalan:**
- [ ] **Node.js LTS kurulumu** (makinede yok) → `nodejs.org` → kur → `node --version`
- [ ] `web/` içinde `npm install` + `npx prisma migrate dev` + `npm run db:seed`
- [ ] **Müfredat verisi çıkarma:** `mufredat.meb.gov.tr/ProgramDetay.aspx?PID=2255` PDF → JSON → `data/curriculum/tymm_kimya_2026.json`

---

## Faz 1 — MVP: Hesap + Quiz Arena ✅ (tamamlandı, uçtan uca test edildi)

**Hedef:** "Kayıt ol → giriş yap → soru çöz → skor/ilerleme kaydedilir → haritada görünür" zinciri.

| # | İş | Durum |
|---|----|-------|
| 1 | Auth (kayıt/giriş/çıkış/me, JWT + bcrypt, Zod) | ✅ |
| 2 | Müfredat seed (sınıf + tema + ünite + 93 çıktı) | ✅ |
| 3 | Soru bankası (15 örnek soru — 9. sınıf Tema 1) | ✅ |
| 4 | Quiz Arena (süre, combo, geri bildirim, açıklama) | ✅ |
| 5 | İlerleme kaydı (çıktı bazlı ustalık) | ✅ |
| 6 | Skor kaydı + XP | ✅ |
| 7 | Müfredat haritası ekranı (`/harita`) | ✅ |
| 8 | Test: kayıt → giriş → soru → cevap → skor (API uçtan uca) | ✅ |

**Kabul kriteri:** Öğrenci kayıt olur → giriş yapar → 9. sınıf Tema 1 sorularını çözer → skoru ve ilerlemesi DB'de görünür → haritada ilerleme görülür. ✅

---

## Faz 2 — Çeşitlendirme + Rekabet ✅ (tamamlandı, uçtan uca test edildi)

**Hedef:** İkinci ve üçüncü oyun modu ile tekdüzeliği kırma; rekabet.

| Mod / Özellik | Durum |
|---------------|-------|
| ⚡ **Hız Yarışı** (60 sn arcade: sembol→isim, combo, hız bonusu) | ✅ `/oyun/hiz` |
| 🧩 **Bulmaca Krallığı** (sembol↔isim eşleştirme, 3 tur, hata cezası) | ✅ `/oyun/bulmaca` |
| 🏆 Liderlik tablosu (haftalık/tüm, mod filtreli) | ✅ `/liderlik` |
| 🏅 Rozetler (ilk-tur, %100, seri-5/10, ilk-usta) | ✅ tur sonunda otomatik |
| 🧫 Element koleksiyonu (iyi turda rastgele element kartı) | ✅ `/koleksiyon` |
| Element veri seti (45 element) | ✅ `src/data/elements.ts` |

**Test sonuçları:** hız yarışı turu → ilk-tur + seri-5 rozetleri + Platin kartı ✅ · düşük doğruluklu tur → ödül yok ✅ · liderlik 3 modda doğru sıralama ✅

---

## Faz 3 — Öğretmen Paneli + Kaçış Odası ✅ (tamamlandı, uçtan uca test edildi)

**Hedef:** Sınıfta kullanılabilirlik; ölçme-değerlendirme aracı.

| Özellik | Durum |
|---------|-------|
| Sınıf yönetimi: öğretmen sınıf oluşturur → 6 haneli davet kodu → öğrenciler `/sinif` sayfasından katılır | ✅ `/panel` · `/sinif` |
| Öğrenci raporları: sınıf → ünite bazlı ortalama ustalık, zayıf üniteler (<%40), öğrenci kartları | ✅ `/panel/sinif/[id]` |
| Erişim kontrolü: sınıf oluşturma sadece öğretmen (`403`), katılım öğrenci | ✅ |
| 🚪 **Lab Kaçış Odası**: tema senaryoları, 5 bulmaca, 5 dk süre, 3 can, ipucu (puan karşılığı), süre bonusu | ✅ `/oyun/kacis?unitId=X` |

**Test sonuçları:** öğretmen kaydı + sınıf oluşturma (kod `C8N5MC`) ✅ · öğrenci katılımı ✅ · tekrar katılım 409 ✅ · kaçış turu → %100 rozeti + Bakır kartı ✅ · sınıf/üyelik/skor DB'de ✅

---

## Faz 4 — Farklılaşma + Yayın (kısmen tamamlandı ✅)

**Tamamlanan:**

| Özellik | Durum |
|---------|-------|
| 🔬 **Sanal Laboratuvar**: 3 deney (turnusol ile asit-baz tayini, karbonat+sirke gaz çıkışı, AgCl çökelmesi) — adım adım prosedür, güvenlik kontrolü, gözlem metinleri, deney raporu | ✅ `/oyun/lab` |
| 📝 **Öğretmen soru ekleme aracı**: sınıf→tema→ünite→çıktı kademeli seçim, 4-6 seçenek, doğru cevap işaretleme | ✅ `/panel/sorular` |
| ⚔️ **Canlı Düello**: ünite seç → davet kodu → 2. oyuncu katılır → aynı 5 soru, canlı skor panosu (2 sn polling) → kazanan | ✅ `/oyun/duel` |

**Kalan (harici hesap gerektiren adımlar):**
- 🗄️ SQLite → PostgreSQL (Neon) geçişi: şema zaten uyumlu (enum yerine TEXT), sadece `provider` değişimi + `DATABASE_URL`
- 🚀 Yayın: Vercel (uygulama) + Neon (veritabanı) — hesap ve domain gerekir
- 🔁 Performans + yedekleme + KVKK kontrolü

> 💡 Şema Postgres'e hazır: SQLite'te çalışan tüm modeller TEXT/INT kullanıyor, enum yok.

---

## 📅 Takvim ve Riskler

| Faz | Süre | Kümülatif |
|-----|------|-----------|
| 0 | 1 hafta | 1 hafta |
| 1 (MVP) | 4-6 hafta | ~6 hafta |
| 2 | 4-6 hafta | ~12 hafta |
| 3 | 4-6 hafta | ~18 hafta |
| 4 | 6+ hafta | ~24 hafta+ |

| Risk | Önlem |
|------|-------|
| Node.js kurulu değil | Faz 0'da kurulum (nodejs.org LTS) |
| İçerik (soru) üretimi zaman alır | Faz 1'de dar kapsam: 9. sınıf Tema 1; formatı oturt sonra genişlet |
| Müfredat detayları yanlış eşlenebilir | Resmi PDF'ten veri çıkarma adımı atlanmaz |
| Kapsam şişmesi | Her fazın kabul kriterlerine sadık kal |
| SQLite → Postgres sürprizleri | Prisma şemasında Postgres uyumlu tipler kullan (enum yerine TEXT) |
