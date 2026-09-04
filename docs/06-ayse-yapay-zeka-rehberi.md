# Ayşe için geliştirme rehberi

Bu dosya **senin** içindir. **Yazılımcı değilsin** — terminal, Git, Prisma gibi kelimeleri ezberleme. Her şeyi **Cursor sohbetine yapıştır**, o yapsın. Sen oyunu tarayıcıda dene, kimya doğruluğunu kontrol et, öğretmene göster.

Proje: TYMM (9–12) kimya müfredatına bağlı, kayıtlı bir web oyunu. Hedef: lise öğrencisi 10 dakika oynayıp “yarın yine girerim” desin; öğretmen zayıf üniteyi görsün.

---

## Başarı yol haritası (sırayla, atlama)

| Adım | Ne yapacaksın | Bitti sayılır when… |
|------|---------------|---------------------|
| **A** | Oyunu bilgisayarında aç (İş 0) | Kayıt olup quiz oynadın |
| **B** | Soru bankasını büyüt (İş 2) | 3 sınıftan soru var, hepsini okudun |
| **C** | Modları gerçek oyun yap (İş 3–6) | Her mod farklı hissettiriyor |
| **D** | Öğretmen + sınıf (İş 7–8) | Sınıfta 2 kişi düello oynadı |
| **E** | Görünüm (İş 9) | Telefonda menü ve quiz rahat |
| **F** | Yayın (İş 10) | İnternetten link açılıyor |

**Altın kural:** Bir iş bitmeden sonrakine geçme. Her işten sonra tarayıcıda dene.

**Senin işin (yapay zekâ yapamaz):** Kimya doğruluğu, soru metinlerini okumak, sınıfta denemek, jüriye anlatmak.

**Yapay zekânın işi:** Kod, veritabanı, sayfa, hata düzeltme, GitHub’a gönderme.

---

## 0) Oyunu ilk kez aç (EN ÖNEMLİ — bunu atlama)

**http://localhost:3000 tek başına açılmaz.** Önce sunucu + veritabanı lazım.

### Cursor’a yapıştır (en kolay — tek komut)

```
Kimya oyunu projesini bilgisayarımda çalıştır.
1) git pull origin main
2) cd web && npm install
3) npm run dev:oyun
Tarayıcıda http://localhost:3000 açılsın.
Kayıt olmayı test et. Hata olursa düzelt.
Terminali kapatma — kapatırsan site kapanır.
```

`dev:oyun` = veritabanı kurulumu + sunucu birlikte (PostgreSQL kurmana gerek yok).

### Alternatif (adım adım)

```
Kimya oyunu projesini bilgisayarımda çalıştır.
1) git pull origin main
2) cd web && npm install
3) npm run setup:local
4) npm run dev
Kayıt olmayı test et. Hata olursa düzelt.
```

**Sen sadece:** Terminalde `Ready` yazınca tarayıcıyı aç → **Kayıt ol** → **Harita** → bir ünite → **Quiz**.

### Sık hatalar

| Ekranda ne görürsün | Ne demek | Cursor'a ne yaz |
|---------------------|----------|-----------------|
| Site açılmıyor | Sunucu çalışmıyor | `npm run dev çalıştır` |
| Sunucuya ulaşılamadı / Veritabanına bağlanılamadı | DB kurulmamış | `npm run setup:local çalıştır` |
| Bu kullanıcı zaten kayıtlı | Normal | Başka kullanıcı adı dene |
| Port 3000 meşgul | Eski sunucu açık | `3000 portunu kullanan süreci kapat, npm run dev tekrar başlat` |

---

## 0b) Her gün nasıl çalışırsın (5 dakika)

1. **Cursor’u aç**, proje klasörünü seç (`kimya-oyunu`).
2. Sohbete yapıştır:

```
GitHub'dan en son kodu çek (git pull origin main).
cd web, gerekirse npm install.
npm run dev:oyun ile oyunu başlat.
```

3. Tarayıcıda değişikliği dene.
4. İş bitince Cursor'a:

```
Yaptığımız değişiklikleri GitHub'a gönder (commit + push).
Kısa commit mesajı yaz.
```

Sen `git` komutlarını elle yazma — Cursor yapsın.

---

## 0c) Takıldığında

Cursor'a **ekran görüntüsü** veya **kırmızı hata yazısını** yapıştır. Şunu ekle:

```
Yazılımcı değilim. Ne yapmam gerektiğini tek cümleyle söyle.
Hatayı sen düzelt, ben sadece tarayıcıda test edeceğim.
```

“Çalışmıyor” deme — hangi sayfada, ne tıkladın, ne yazdı ekranda.

---

## 1. Oyun şu an ne?

Çalışan bir **iskelet + 6 mod**. Kayıt, giriş, harita, quiz, hız, bulmaca, kaçış, laboratuvar, düello, öğretmen paneli, liderlik ve koleksiyon var.

Eksik olan şey “mod yokluğu” değil: **içerik sığ (~15 örnek soru), bazı modlar quiz kılığına girmiş.** Bitti sayma.

| Çalışır | Zayıf / yarım | Yapma (şimdilik) |
|---------|----------------|------------------|
| Hesap, oturum, roller | Soru bankası çoğunlukla 9. sınıf Tema 1 | Yeni çatı (Unity, mobil native) |
| Quiz Arena + ustalık | Hız/bulmaca müfredat çıktısına bağlı değil | Kripto, reklam, sosyal giriş |
| Öğretmen sınıf + rapor | Lab tıklamalı prosedür | LLM ile rastgele soru (kontrolsüz) |
| Düello kodu + 2 oyuncu | Kaçış odası süreli quiz + hikâye | 10. oyun tarzının hepsini birden |

---

## 2. Yapay zekâya nasıl konuşacaksın?

Her sohbete **aynı iskeleti** yapıştır. “Oyunu güzelleştir” deme; ajan rastgele süsler, asıl işi bırakır.

**Her mesajın başı (kopyala):**

```
Proje: kimya-oyunu. Next.js 15 App Router, React 19, TypeScript, Prisma, Tailwind v4.
Kök uygulama klasörü: web/
Müfredat: data/curriculum/tymm_kimya_2026.json (TYMM kimya 9-12).
Oyun modları: Quiz Arena, Hız Yarışı, Bulmaca, Kaçış Odası, Sanal Lab, Canlı Düello.
Dil: arayüz Türkçe. Kod ve dosya adları İngilizce.
Yerel test: npm run setup:local (SQLite, PostgreSQL gerekmez).
Yayın: PostgreSQL (Neon) — docs/05-yayin-rehberi.md.
Kurallar:
- Mevcut deseni bozma (App Router, Prisma, /api/* route handlers).
- JWT_SECRET ve DATABASE_URL asla koda yazma.
- Skoru istemcinin söylediğine körü körüne güvenme; mümkünse sunucuda doğrula.
- Bir seferde TEK iş. Bitince nasıl denediğini söyle.
- Yeni paket ekleme gerekçesiz.
- Ben yazılımcı değilim; terminal komutlarını sen çalıştır.
Şimdi yapacağın iş: [buraya tek cümle]
Kabul ölçütü: [öğrenci/öğretmen ne görünce bitti sayılır]
```

**Yasak cümleler:** “tümünü refactor et”, “modern bir tasarım yap”, “AI ile soru üret ve kaydet” (önce sen kontrol etmeden).

**İyi cümle:** “Quiz’te aynı 10 soru hep aynı sırada gelmesin; sorular karışsın. Doğru şık id’si sızmasın. Bitince tarayıcıda iki tur oynayıp farklı sıra gördüğünü yaz.”

Ajan bir dosyayı gereksiz yere silerse Cursor'a: `Son değişikliği geri al, sadece istediğim işi yap.`

---

## 3. Sıra (bunu atlama)

Aşağıdaki işleri **numara sırasıyla** yaptır. Her maddenin altında yapay zekâya yapıştıracağın metin var.

### İş 1 — Bilgisayarında çalışır hale getir

```
git pull origin main
cd web
npm install
npm run dev:oyun
http://localhost:3000 açılsın.
Öğrenci kaydı oluştur → /harita → bir ünite Quiz dene.
Öğretmen hesabı ile /panel dene.
Hata olursa düzelt; bana sadece "şimdi şunu yap" de.
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
Ünitede 0 soru varsa öğrenciye “öğretmenin soru eklesin” ve /harita linki çıksın (metni netleştir).
```

### İş 4 — Hız ve bulmacayı müfredata bağla

```
Hız Yarışı ve Bulmaca'ya isteğe bağlı ?unitId= ekle. unitId varsa o ünitenin kavramlarına göre kart üret.
unitId yoksa şimdiki genel element turu kalsın. Skoru o üniteye kaydet.
```

### İş 5 — Kaçış odasını senaryo yap

```
Kaçış odası hâlâ quiz sorusu çekiyor. data/scenarios.ts hikâyesini her bulmacaya bağla.
İpucu puan düşsün. Can 0 olunca “sonraki” çıkmasın. Soru sırası her seferinde değişsin.
```

### İş 6 — Laboratuvarı “deney” gibi hissettir

```
SanalLab tıklamalı prosedür. En az bir deneyde yanlış malzeme “güvenlik ihlali” sayılsın.
Gözlem metni adım adım biriksin. Yeni deney: yalnız 1 deney, TYMM çıktı kodu ile.
```

### İş 7 — Öğretmenin 5 dakikası

```
/panel/sinif/[id] raporunda: kim hiç oynamamış, hangi ünite ortalama <%40, son 7 gün aktif.
Öğrenci zayıf ünitelerini /harita üzerinde renk ile görsün.
```

### İş 8 — Düello sınıf etkinliği

```
Bekleme ekranında kod kopyala butonu. Rakip skoru tur bitene kadar gizlensin.
İki oyuncudan biri ayrılırsa 2 dk sonra düello iptal / berabere kuralı.
```

### İş 9 — Görünüm (en son, az)

```
Koyu slate zemin, cyan vurgu kalsın. Emoji yağmuruna son.
Mobil: nav menüsü açık. Quiz şıkları başparmakla tıklanır kalsın.
Yeni font veya 3D arka plan EKLEME.
```

### İş 10 — Yayın (Vercel + Neon)

`docs/05-yayin-rehberi.md` adım adım. Yapay zekâya:

```
docs/05-yayin-rehberi.md dosyasındaki sırayı bozma. JWT_SECRET üret, .env'i commit etme.
Vercel Root Directory = web. prisma migrate deploy build'de çalışıyor olmalı.
Yayın sonrası /api/health 200 dönsün. Seed komutunu bana yaz, ben çalıştıracağım.
```

---

## 4. “Güzel ve etkili oyun” kontrol listesi

Etkili = **öğrenci yanlışını anlasın + yarın tekrar gelsin + öğretmen veri görsün.**

Büyük işlerde yapay zekâya bunu da yapıştır:

```
Oyun hissi kontrol listesi:
1. Ana sayfadan ilk soruya en fazla 3 tık.
2. Anında geri bildirim: doğru/yanlış + bir cümle neden.
3. İlerleme görünür: XP, ustalık çubuğu, kart, rozet.
4. Başarısızlık utandırmaz: “Tekrar dene”, doğru cevap gösterilir.
5. Soru ve şık sırası her turda değişir.
6. Öğretmen: sınıf kodu + kim zayıf, ekstra tıklama gerektirmeden.
7. Erişilebilirlik: lang=tr, butonlar metinli.
```

Kimya doğruluğu: ajan uydurmasın. Kaynak: müfredat JSON + senin ders notun. Şüpheli soruyu ekletme.

---

## 5. Sık kırılan yerler (ajan bunları bozmasın)

| Dosya | Ne işe yarar |
|-------|----------------|
| `web/scripts/setup-local-db.ps1` | PostgreSQL olmadan yerel test (SQLite) |
| `web/src/lib/auth.ts` | Oturum. JWT 7 gün, çerez httpOnly. |
| `web/src/lib/game.ts` | Tur sonu XP/rozet/kart. Skor tavanı 20000. |
| `web/src/app/api/quiz/answer/route.ts` | Doğruluk + ustalık. |
| `web/prisma/schema.prisma` | Şema. Değiştirince migration yaz. |

Yerel test: `npm run setup:local` → `prisma/dev.db` oluşur (Git'e gitmez).

---

## 6. “Bitti” ne demek? (teslim / jüri)

Şunlar olmadan proje bitmiş sayılmaz:

1. Temiz kayıt → quiz → haritada ustalık artıyor.
2. En az **3 sınıf kademesinden** soru var (yalnız 9.1 değil).
3. Öğretmen: sınıf kurar, öğrenci kodla girer, raporda isim görünür.
4. İki öğrenci düello koduyla oynar, kazanan belli olur.
5. Telefon genişliğinde menü ve quiz tıklanır.
6. `npm run dev:oyun` senin PC'nde çalışır.
7. Gizlilik sayfası (`/gizlilik`) ve yayın ortamında gerçek `JWT_SECRET`.

**Jüriye 3 cümle:** *TYMM çıktı koduna bağlı sorular; öğretmen sınıf raporu; aynı içerikle 6 tempo.*

---

## 7. GitHub (sen elle yapma)

Her iş bitince Cursor'a:

```
Değişiklikleri commit et ve GitHub'a push et.
Commit mesajı: [ne yaptığını tek cümle Türkçe yaz]
```

Takıldın: hatayı ve hangi URL'de olduğunu yapıştır.

**Repo:** https://github.com/ayseaslancakir/kimya-oyunu
