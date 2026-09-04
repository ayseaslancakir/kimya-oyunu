# Ayşe için geliştirme rehberi

Bu dosya **senin** içindir. Proje TYMM (9–12) kimya müfredatına bağlı, kayıtlı bir web oyunu. Yapay zekâ ile geliştirmeye devam edeceksin. Aşağıdaki kuralları ve hazır cümleleri olduğu gibi kullan; ajanın başka bir oyuna sapmasını engeller.

GitHub’dan güncel kodu çek:

```powershell
git pull origin main
cd web
npm install
npx prisma migrate deploy
npm run dev
```

Tarayıcı: `http://localhost:3000`

Yerel PostgreSQL ve `.env` (`DATABASE_URL`, `JWT_SECRET`) yoksa önce `web/.env.example` dosyasını `.env` olarak kopyala, şifreleri kendi makinen için doldur. Seed:

```powershell
npm run db:seed
npm run db:seed-questions
```

---

## 1. Oyun şu an ne?

Çalışan bir **iskelet + 6 mod**. Kayıt, giriş, harita, quiz, hız, bulmaca, kaçış, laboratuvar, düello, öğretmen paneli, liderlik ve koleksiyon var.

Eksik olan şey “mod yokluğu” değil: **içerik sığ, bazı modlar quiz kılığına girmiş, okulda 40 kişilik sınıfta sürtünme var.** Bitti sayma. Hedef: bir lise öğrencisi 10 dakika oynayıp “yarın yine girerim” desin; öğretmen zayıf üniteyi görsün.

| Çalışır | Zayıf / yarım | Yapma (şimdilik) |
|---------|----------------|------------------|
| Hesap, JWT çerez, roller | Soru bankası neredeyse yalnız 9. sınıf Tema 1 | Yeni çatı (Unity, mobil native) |
| Quiz Arena + ustalık | Hız/bulmaca müfredat çıktısına bağlı değil | Kripto, reklam, sosyal giriş |
| Öğretmen sınıf + rapor | Lab 3 deney, tıklama prosedürü (sürükle-bırak yok) | LLM ile rastgele soru (doğruluğu kontrol edilmeden) |
| Düello kodu + 2 oyuncu | Kaçış odası aslında süreli quiz + hikâye metni | 10. oyun tarzının hepsini birden |

---

## 2. Yapay zekâya nasıl konuşacaksın?

Her sohbete **aynı iskeleti** yapıştır. “Oyunu güzelleştir” deme; ajan rastgele Tailwind ve emoji ekler, asıl işi bırakır.

**Her mesajın başı (kopyala):**

```
Proje: kimya-oyunu. Next.js 15 App Router, React 19, TypeScript, Prisma, PostgreSQL, Tailwind v4.
Kök uygulama klasörü: web/
Müfredat: data/curriculum/tymm_kimya_2026.json (TYMM kimya 9-12).
Oyun modları: Quiz Arena, Hız Yarışı, Bulmaca, Lab Kaçış Odası, Sanal Lab, Canlı Düello.
Dil: arayüz Türkçe. Kod ve dosya adları İngilizce.
Kurallar:
- Mevcut deseni bozma (App Router, Prisma, /api/* route handlers).
- JWT_SECRET ve DATABASE_URL asla koda yazma.
- Skoru istemcinin söylediğine körü körüne güvenme; mümkünse sunucuda doğrula.
- Bir seferde TEK iş. Bitince nasıl denediğini söyle.
- Yeni paket ekleme gerekçesiz.
Şimdi yapacağın iş: [buraya tek cümle]
Kabul ölçütü: [öğrenci/öğretmen ne görünce bitti sayılır]
```

**Yasak cümleler:** “tümünü refactor et”, “modern bir tasarım yap”, “AI ile soru üret ve kaydet” (önce sen kontrol etmeden).

**İyi cümle:** “Quiz’te aynı 10 soru hep aynı sırada gelmesin; `GET /api/quiz/questions` karıştırsın. Doğru şık id’si sızmasın. Bitince tarayıcıda iki tur oynayıp farklı sıra gördüğünü yaz.”

Ajan bir dosyayı gereksiz yere silerse `git checkout -- dosya` ile geri al. Her işten sonra `git diff` bak: yalnız istediğin iş değişmiş olmalı.

---

## 3. Sıra (bunu atlama)

Aşağıdaki işleri **numara sırasıyla** yaptır. Birini bitirmeden sonrakine geçme. Her maddenin altında yapay zekâya yapıştıracağın metin var.

### İş 1 — Bilgisayarında çalışır hale getir

```
web/.env yoksa .env.example'dan oluştur. Prisma migrate + seed + seed-questions çalışsın.
npm run dev ile http://localhost:3000 açılsın.
Kayıt ol (öğrenci) → /harita → bir ünite Quiz. Öğretmen hesabı ile /panel.
Hata olursa tam hata metnini düzelt; tahmini çözüm yazma.
```

### İş 2 — Soru bankasını büyüt (en önemli içerik)

Oyunun kalbi soru. 15 örnek soru yetmez. Her soru bir `KİM.x.y.z` koduna bağlı olsun.

```
prisma/seed-questions.ts içindeki formatı aynen kullan: kod, zorluk 1-5, soru, aciklama, 4 seçenek, dogru index.
ÖNCE yalnız 9. sınıf Tema 1 dışındaki EKSİK çıktılar için 20 yeni soru ekle. Her şık inandırıcı olsun; doğru hep A (index 0) olmasın.
Kimya hatalı bilgi yazma; emin değilsen o soruyu ekleme, bana sor.
Sonra npm run db:seed-questions. Aynı soruyu iki kez basmasın (varsa upsert veya atla).
```

İkinci turda 10. sınıf, sonra 11–12. Öğretmen panelinden de soru eklenebiliyor: `/panel/sorular`. Sınıfta deneme için 2–3 soruyu sen yaz, gerisini ajanla çoğalt, **hepsini oku**.

### İş 3 — Quiz’i gerçek bir tur yap

```
QuizPlayer: süre dolduğunda kaydedilen skor güncel olsun (ref kullan, stale state yok).
Açıklama her zaman öğretsin. Yanlışta doğru şık işaretlensin (şu an var, bozma).
Ünitede 0 soru varsa öğrenciye “öğretmenin soru eklesin” ve /harita linki çıksın (şu an hata metni var, metni netleştir).
```

### İş 4 — Hız ve bulmacayı müfredata bağla

Şu an element listesi (`src/data/elements.ts`) — eğlenceli ama haritadaki üniteyle ilişkisi yok.

```
Hız Yarışı ve Bulmaca'ya isteğe bağlı ?unitId= ekle. unitId varsa o ünitenin kavramlarına göre kart üret (şimdilik sembol-isim kalabilir ama ünite adını ekranda göster ve skoru o üniteye kaydet).
unitId yoksa şimdiki genel element turu kalsın.
```

### İş 5 — Kaçış odasını senaryo yap

```
Kaçış odası hâlâ quiz sorusu çekiyor. data/scenarios.ts hikâyesini her bulmacaya bağla: soru metni senaryo cümlesi + kimya sorusu olsun.
İpucu puan düşsün (düşüyor olmalı). Can 0 olunca “sonraki” çıkmasın.
Aynı 5 soruyu her seferinde aynı sırada verme.
```

### İş 6 — Laboratuvarı “deney” gibi hissettir

```
SanalLab tıklamalı prosedür. En az bir deneyde 2 malzeme seçimi yanlışsa “güvenlik ihlali” ayrı sayılsın.
Gözlem metni adım adım biriksin (rapor kutusuna yazılsın).
Yeni deney ekleme: yalnız 1 deney, TYMM çıktı kodu ile. 5 deney birden ekleme.
```

### İş 7 — Öğretmenin 5 dakikası

```
/panel/sinif/[id] raporunda: kim hiç oynamamış, hangi ünite ortalama <%40, son 7 gün aktif.
CSV indirme şart değil; ekran net olsun.
Öğrenci kendi zayıf ünitelerini /harita üzerinde renk ile görsün.
```

### İş 8 — Düello sınıf etkinliği

```
Bekleme ekranında kod kopyala butonu. Süre bitince ikisi de bitmeden sonuç spoiler olmasın (rakip skoru tur bitene kadar gizle — veya “rakip hâlâ oynuyor” kalsın, bitmiş skoru gösterme).
İki oyuncudan biri ayrılırsa 2 dk sonra düello iptal / berabere kuralı yaz ve uygula.
```

### İş 9 — Görünüm (en son, az)

```
Tasarım: koyu slate zemin, cyan vurgu kalsın. Emoji yağmuruna son: ikon yerine kısa metin veya tek harf rozet.
Mobil: nav menüsü açık (SiteNav). Quiz şıkları başparmakla tıklanır kalsın (min yükseklik).
Yeni font veya 3D arka plan EKLEME.
```

### İş 10 — Yayın (Vercel + Neon)

`docs/05-yayin-rehberi.md` adım adım. Yapay zekâya:

```
docs/05-yayin-rehberi.md dosyasındaki sırayı bozma. JWT_SECRET üret, .env'i commit etme.
Vercel Root Directory = web. prisma migrate deploy build'de çalışıyor olmalı.
Yayın sonrası /api/health 200 dönsün. Seed'i yayın DB'sine bir kez çalıştırma komutunu ver, sen çalıştırma (ben çalıştıracağım).
```

---

## 4. “Güzel ve etkili oyun” için ajanın bilmesi gerekenler

Etkili = **öğrenci yanlışını anlasın + yarın tekrar gelsin + öğretmen veri görsün.**

Yapay zekâya şunu da yapıştır (büyük işlerde):

```
Oyun hissi kontrol listesi (her değişiklikte):
1. 10 saniye kuralı: ana sayfadan ilk soruya en fazla 3 tık.
2. Anında geri bildirim: doğru/yanlış + bir cümle neden.
3. İlerleme görünür: XP, ustalık çubuğu, kart, rozet — boş ekran yok.
4. Başarısızlık utandırmaz: “Tekrar dene”, doğru cevap gösterilir.
5. Tekrar oynanır: soru sırası ve şık sırası her turda değişir.
6. Öğretmen: sınıf kodu + kim zayıf, ekstra tıklama gerektirmeden.
7. Erişilebilirlik: lang=tr, butonlar metinli, renk tek başına anlam taşımasın.
```

Kimya doğruluğu: ajan uydurmasın. Kaynak: müfredat JSON + senin ders notun. Şüpheli soruyu ekletme.

---

## 5. Sık kırılan yerler (ajan bunları bozmasın)

| Dosya | Ne işe yarar |
|-------|----------------|
| `web/src/lib/auth.ts` | Oturum. JWT 7 gün, çerez httpOnly. |
| `web/src/lib/game.ts` | Tur sonu XP/rozet/kart. Skor tavanı 20000. Çift gönderim penceresi var. |
| `web/src/app/api/quiz/answer/route.ts` | Doğruluk + ustalık. İstemci “ben doğruyum” diyemez. |
| `web/src/app/api/quiz/finish/route.ts` | İstemci puan gönderir — tavan var ama kopya hâlâ mümkün; uzun vadede sunucu oturumu tut. |
| `web/src/app/api/duel/[id]/answer/route.ts` | Soru düello setinde olmalı; aynı soru iki kez puanlanmamalı. |
| `web/prisma/schema.prisma` | Şema. Değiştirince migration yaz. |

Bilinçli borç (sonraya bırak, ilk 4 işten sonra):

- Quiz bitiş puanını tamamen sunucuda hesaplamak (şu an tavan + kısa tekrar koruması var).
- Öğretmen kaydını davet koduna bağlamak (şimdi herkes öğretmen seçebilir — ödev demosu için).
- Otomatik test (`npm test` yok). Eklerken Playwright yerine önce API’ye küçük bir test.

---

## 6. “Bitti” ne demek? (teslim / jüri)

Şunlar olmadan proje bitmiş sayılmaz:

1. Temiz kayıt → quiz → haritada ustalık artıyor.
2. En az **3 sınıf kademesinden** soru var (yalnız 9.1 değil).
3. Öğretmen: sınıf kurar, öğrenci kodla girer, raporda isim görünür.
4. İki öğrenci düello koduyla oynar, kazanan belli olur.
5. Telefon genişliğinde menü ve quiz tıklanır.
6. README’deki kurulum senin PC’nde birebir çalışır.
7. Gizlilik sayfası (`/gizlilik`) ve yayın ortamında gerçek `JWT_SECRET`.

Jüriye 3 cümle: *TYMM çıktı koduna bağlı sorular; öğretmen sınıf raporu; aynı içerikle 6 tempo.*

---

## 7. Git alışkanlığı

Her iş ayrı commit. Mesaj örneği: `Soru bankasına 10. sınıf asit-baz ekle`. `git push` sonra GitHub’da dosyalara bak.

Takıldın: hatayı (kırmızı yazı) ve hangi URL’de olduğunu ajan sohbetine yapıştır. “Çalışmıyor” deme.
