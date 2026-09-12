# Yapay zekâya vereceğin görev listesi

Bu dosya **kopyala-yapıştır** içindir. Sen yazılımcı değilsin: aşağıdaki kutuları sırayla
yapay zekâ sohbetine yapıştırırsın, o kodu yazar, sen tarayıcıda denersin.

- Nasıl çalıştırılır / günlük akış: `docs/06-ayse-yapay-zeka-rehberi.md`
- Yayın adımları: `docs/05-yayin-rehberi.md`

---

## Önce şunu anla (2 dakika)

Bu projede iki kişi çalışıyor: **sen** ve **yapay zekâ**.

| İş | Kim yapar |
|----|-----------|
| Kod yazmak, dosya değiştirmek, hata düzeltmek, GitHub'a göndermek | Yapay zekâ |
| Ona ne yapacağını söylemek (aşağıdaki kutuları yapıştırmak) | Sen |
| Tarayıcıda deneyip "oldu / olmadı" demek | Sen |
| Kimya bilgisinin doğruluğunu kontrol etmek | **Sadece sen** — yapay zekâ kimyayı uydurabilir |

Terminal, Prisma, migration gibi kelimeleri **öğrenmene gerek yok**. Kutuda geçiyorlarsa
yapay zekâ için yazılmışlardır; sen sadece kopyalayıp yapıştırırsın.

**Bir görev şöyle ilerler:**

1. Aşağıdan **bir** kutu seç (sırayla: S1, S2, S3… sonra İ1, İ2… sonra O1…).
2. Önce "0) Her mesajın başına yapıştıracağın blok"u, hemen altına o kutuyu yapıştır.
3. Yapay zekâ "bitti" dediğinde **tarayıcıyı aç ve kutudaki "Kabul ölçütü" satırını dene**.
4. Tuttuysa bir sonraki kutuya geç. Tutmadıysa ne gördüğünü yaz (aşağıdaki son tabloya bak).

**Ne kadar sürer:** Bir kutu genelde tek oturumda biter. S1 en uzunu (yarım gün sürebilir),
İ1 en çok senin okumanı gerektirendir.

---

**Üç kural:**
1. **Bir seferde tek kutu.** İki görevi birleştirme; ajan ikisini de yarım bırakır.
2. **Her kutudan sonra tarayıcıda dene.** Olmadıysa "çalışmıyor" deme — hangi sayfada ne gördüğünü yaz.
3. **Sıra önemli.** Önce S (güvenlik), sonra İ (içerik), sonra O (oyun hissi), en son Y (yayın).

---

## 0) Her mesajın başına yapıştıracağın blok

```
Proje: kimya-oyunu. Next.js 15 App Router, React 19, TypeScript, Prisma, Tailwind v4.
Uygulama klasörü: web/  · Müfredat: data/curriculum/tymm_kimya_2026.json
Arayüz Türkçe, kod ve dosya adları İngilizce.
Yerel test: cd web && npm run setup:local && npm run dev  (SQLite, PostgreSQL gerekmez)
Kurallar:
- Mevcut deseni bozma (App Router, Prisma, /api/* route handlers).
- JWT_SECRET, DATABASE_URL, TEACHER_CODE asla koda yazılmaz; .env commit edilmez.
- İstemciden gelen skora/doğruluğa körü körüne güvenme.
- Gerekçesiz yeni paket ekleme. Toplu refactor yapma.
- Bitirince "npm run check" temiz olmalı; ne yaptığını ve nasıl denediğini yaz.
Görev: [aşağıdaki kutulardan biri]
```

---

## S — Güvenlik ve dürüstlük (önce bunlar)

### S1 · Skoru sunucuda hesapla (en önemli açık)

Bugün skor istemciden geliyor; sunucu sadece "makul mü" diye tavan uyguluyor
(`web/src/lib/game.ts`). Gerçek çözüm turu sunucuda tutmaktır.

```
Görev: Quiz turunu sunucuda tut, skoru sunucu hesaplasın.
1) Prisma şemasına GameSession modeli ekle: id, userId, gameModeId, unitId, questionIds (JSON metin),
   answeredIds (JSON metin), score, correctCount, maxStreak, startedAt, finishedAt.
2) /api/quiz/questions turu başlatsın: session oluştursun ve sessionId dönsün.
3) /api/quiz/answer sessionId alsın; aynı soru iki kez puan yazmasın; puan SUNUCUDA hesaplansın
   (doğru cevap: 100 + seri*10) ve session'a yazılsın.
4) /api/quiz/finish artık istemciden score/accuracy/maxStreak ALMASIN; session'dan okusun.
5) QuizPlayer ve HizYarisi bileşenlerini yeni akışa uydur.
6) Migration yaz; prisma/schema.sqlite.prisma ve prisma/schema.postgres.prisma dosyalarının ikisini de güncelle.
Kabul ölçütü: /api/quiz/finish'e uydurma yüksek skor gönderilince XP artmıyor;
normal oynanan tur doğru XP yazıyor.
```

### S2 · Ustalık çiftçiliğini durdur

```
Görev: /api/quiz/answer içinde aynı soruya tekrar tekrar doğru cevap vererek ustalık yükseltmeyi engelle.
Bir soru, bir kullanıcı için 24 saat içinde en fazla bir kez masteryScore değiştirsin;
sonraki denemeler yalnız attempts sayacını artırsın ve doğru cevabı göstersin.
Kabul ölçütü: aynı soruyu 5 kez doğru cevaplayınca ustalık 20 puandan fazla artmıyor.
```

### S3 · Öğretmen davet kodunu yayında zorunlu kıl

```
Görev: TEACHER_CODE ortam değişkeni yayında mutlaka tanımlı olsun.
docs/05-yayin-rehberi.md içine "Vercel ortam değişkenlerine TEACHER_CODE ekle" adımını yaz.
Kod yalnız ortam değişkeninden gelsin; panelden değiştirilebilir hâle GETİRME.
Kabul ölçütü: yayında kodsuz öğretmen kaydı 403 dönüyor, öğrenci kaydı çalışıyor.
```

### S4 · Şifre değiştirme ve hesap silme

```
Görev: /api/auth/password (mevcut şifre doğrulanarak şifre değiştirir) ve
/api/auth/delete (hesabı ve ona bağlı skor/ilerleme/rozet kayıtlarını siler) uç noktalarını ekle.
Küçük bir /hesap sayfasından kullanılsınlar.
/gizlilik sayfasına "hesabını ve verilerini buradan silebilirsin" satırı ekle.
Kabul ölçütü: şifre değişince eski şifreyle giriş yapılamıyor; hesap silinince liderlikte görünmüyor.
```

---

## İ — İçerik (oyunun kalbi)

Şu an bankada **88 soru** var, ağırlıkla 9 ve 10. sınıf. Hedef: her ünitede en az 5 soru.

### İ1 · 11 ve 12. sınıf sorularını tamamla

```
Görev: web/prisma/questions-bank-extra.ts dosyasına 11. sınıf için 20 yeni çoktan seçmeli soru ekle.
Biçim birebir mevcut kayıtlarla aynı olsun (kod, zorluk 1-5, soru, aciklama, secenekler[4], dogru).
Kod olarak yalnız data/curriculum/tymm_kimya_2026.json içinde GERÇEKTEN var olan KİM.11.x.y kodlarını kullan.
Doğru şık hep 0. indekste olmasın; çeldiriciler inandırıcı olsun; açıklama tek cümlede NEDEN'i söylesin.
Emin olmadığın kimya bilgisini YAZMA; o soruyu atla ve bana listele.
Sonra: npm run db:seed-questions
Kabul ölçütü: /api/health soruSayisi arttı; haritadan 11. sınıf ünitesinde quiz oynanıyor.
```

Aynı kutuyu `12` yazarak tekrarla. **Eklenen her soruyu sen oku** — kimya doğruluğu senin işin.

### İ2 · Soru kalitesi denetim betiği

```
Görev: web/scripts/soru-denetim.mjs adında kontrol betiği yaz (yeni paket kullanma).
Raporlasın: (a) aynı metinli tekrar sorular, (b) doğru şıkkı hep aynı indekste olan çıktılar,
(c) açıklaması boş sorular, (d) hiç sorusu olmayan öğrenme çıktıları,
(e) müfredat JSON'unda karşılığı olmayan kodlar.
package.json'a "db:denetim" scripti ekle.
Kabul ölçütü: npm run db:denetim çalışıyor ve eksik çıktıların listesini veriyor.
```

---

## O — Oyun hissi

### O1 · Hız Yarışı ve Bulmacayı müfredata bağla

```
Görev: /oyun/hiz ve /oyun/bulmaca sayfaları isteğe bağlı ?unitId= parametresi alsın.
unitId varsa kartlar o ünitenin öğrenme çıktılarından üretilsin, skor o üniteye kaydedilsin.
unitId yoksa bugünkü genel element turu aynen kalsın.
/harita üzerindeki ünite kartına "Hız" ve "Bulmaca" bağlantısı ekle.
Kabul ölçütü: haritadan bir üniteye girip Hız oynayınca o ünitenin ustalığı değişiyor.
```

### O2 · Kaçış odasını gerçek senaryo yap

```
Görev: /oyun/kacis hâlâ düz quiz sorusu çekiyor. web/src/data/scenarios.ts hikâyesini her bulmacaya bağla:
her adımda hikâye metni + ipucu (ipucu alınca puan düşer) + can hakkı olsun.
Can 0 olunca "sonraki" düğmesi çıkmasın, "tekrar dene" çıksın. Bulmaca sırası her turda karışsın.
Kabul ölçütü: iki tur oynayınca sıra farklı; ipucu alınan turun puanı düşük.
```

### O3 · Laboratuvarı deney gibi hissettir

```
Görev: SanalLab'da en az bir deneyde yanlış malzeme seçimi "güvenlik ihlali" uyarısı versin ve puan düşürsün.
Gözlem metni adım adım birikip tur sonunda özet olarak görünsün.
Yeni deney ekleyeceksen YALNIZ bir tane ekle ve TYMM çıktı kodu ile eşleştir.
Kabul ölçütü: yanlış malzeme seçince uyarı çıkıyor; tur sonunda gözlem özeti görünüyor.
```

### O4 · Düelloyu sınıfa hazırla

```
Görev: /oyun/duel bekleme ekranına "kodu kopyala" düğmesi ekle.
Rakibin skoru tur bitene kadar gizlensin; tur bitince iki skor ve kazanan görünsün.
Oyunculardan biri 2 dakika hiç cevap vermezse düello iptal olsun (status alanını kullan).
Kabul ölçütü: iki tarayıcı penceresinde düello oynanıyor, kazanan ekranda yazıyor.
```

### O5 · Öğretmenin 5 dakikası

```
Görev: /panel/sinif/[id] raporuna üç blok ekle:
(1) hiç oynamamış öğrenciler, (2) sınıf ortalaması %40 altındaki üniteler, (3) son 7 günde aktif olanlar.
Öğrenci tarafında /harita'da zayıf üniteler renkle ayrışsın (kırmızı / sarı / yeşil).
Kabul ölçütü: öğretmen sınıf sayfasını açınca fazladan tıklamadan zayıf üniteyi görüyor.
```

---

## Y — Yayın ve dayanıklılık

### Y1 · Otomatik duman testi

```
Görev: web/scripts/duman-testi.mjs yaz (yeni paket yok, Node'un kendi fetch'i yeter):
kayıt → giriş → quiz soruları → cevap → tur bitir → liderlik zincirini çalıştırsın.
Her adımda beklenen HTTP kodunu kontrol edip sonunda özet bassın; hata varsa çıkış kodu 1 olsun.
Test kullanıcısını sonunda silsin. package.json'a "test:duman" scripti ekle.
Kabul ölçütü: npm run dev açıkken npm run test:duman "TÜM ADIMLAR GEÇTİ" yazıyor.
```

### Y2 · Yayın (Vercel + Neon)

```
Görev: docs/05-yayin-rehberi.md sırasını bozmadan yayına hazırla.
Vercel Root Directory = web. Ortam değişkenleri: DATABASE_URL (Neon), JWT_SECRET (32+ karakter, yeni üret), TEACHER_CODE.
Şema PostgreSQL olmalı: npm run use:postgres · Build sırasında prisma migrate deploy çalışsın.
Yayından sonra /api/health 200 ve db:"ok" dönsün.
Seed komutunu bana yaz, ben çalıştıracağım.
Kabul ölçütü: internet adresinden kayıt olup quiz oynanıyor.
```

---

## Bitti sayma ölçütü (jüri / teslim)

| # | Ölçüt | Nasıl denersin |
|---|-------|----------------|
| 1 | Kayıt → quiz → haritada ustalık artıyor | Yeni hesap aç, bir ünite oyna |
| 2 | 9–12 arası en az üç sınıfta soru var | `/api/health` soruSayisi + haritada gezin |
| 3 | Uydurma skor XP yazmıyor | S1 bitince duman testi |
| 4 | Öğretmen kodsuz hesap açamıyor | Kayıt sayfasında öğretmen seç, kodsuz dene |
| 5 | Sınıf kurulur, öğrenci kodla girer, raporda görünür | İki hesapla dene |
| 6 | İki kişi düello oynar, kazanan belli | İki tarayıcı penceresi |
| 7 | Telefon genişliğinde menü ve quiz rahat | Tarayıcıyı daralt |
| 8 | Yayındaki adres açılıyor, `/api/health` 200 | Linke tıkla |

---

## Ajan yanlış yaparsa

| Durum | Yapıştıracağın cümle |
|-------|----------------------|
| Alakasız dosyaları değiştirdi | `Son değişikliği geri al. Yalnız sana söylediğim dosyaya dokun.` |
| Yeni paket kurdu | `Eklediğin paketi kaldır, aynı işi mevcut araçlarla yap.` |
| "Bitti" dedi ama çalışmıyor | `Kendi değişikliğini sen çalıştırıp dene, çıktıyı bana göster.` |
| Kimyayı uydurdu | `Bu sorunun kaynağını göster. Emin değilsen soruyu sil.` |
| Türkçe bozuldu | `Arayüz metinleri Türkçe ve öğrenciye uygun olacak; kod İngilizce kalacak.` |
| Veritabanı hata verdi | `npm run setup:local çalıştır, sonra /api/health 200 mü kontrol et.` |
