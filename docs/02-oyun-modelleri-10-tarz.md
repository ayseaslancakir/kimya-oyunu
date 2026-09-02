# 🎮 10 Kimya Oyun Tarzı Araştırması

> Amaç: TYMM kimya müfredatını (9-12) web üzerinde, hesaplı ve kayıtlı veriyle öğreten oyun için **10 farklı oyun modeli** sunmak. Her model için oynanış, müfredat eşlemesi, teknik zorluk ve artı/eksiler verilmiştir. Sonunda karşılaştırma tablosu ve öneri vardır.

---

## Model 1: 🏆 Quiz Arena (Bilgi Düellosu)

**Tür:** Bilgi yarışması / trivia duel

**Konsept:** Klasik ama doğru kurgulanmış bilgi yarışması. Oyuncu sınıf → tema → ünite seçer, 10-15 soruluk turlar oynar. Doğru cevap puan, hızlı cevap bonus, ardışık doğrular **combo çarpanı** verir. 3 can hakkı; yanlış cevapta can düşer. Tur sonunda skor, istatistik ve rozetler.

**Oynanış döngüsü:** Soruyu oku → 4 seçenekten seç (10-20 sn) → anında geri bildirim + açıklama → sonraki soru → tur sonu raporu.

**Müfredat eşlemesi:** Her soru bir öğrenme çıktısına bağlanır (KİM.9.1.1...). Soru filtreleri: sınıf, tema, ünite, zorluk, bilişsel düzey.

**Hesap/veri:** Skorlar, isabet oranı, streak, ortalama süre — hepsi kaydedilir; "zayıf olduğun konular" analizi üretilir.

**Çok oyunculu:** 2. fazda canlı eşleştirme (aynı anda aynı soruları çözme) ve haftalık ligler.

**Zorluk:** ★★☆☆☆ (2/5) · **MVP süresi:** 4-6 hafta

| ✅ Artılar | ❌ Eksiler |
|-----------|-----------|
| En hızlı MVP; içerik üretimi kolay | "Oyun" hissi sınırlı |
| Tüm müfredata kolayca uyarlanır | Uzun vadede tekdüzeleşebilir |
| Rekabet ve sıralama motivasyonu yüksek | Öğrenme derinliği sınav benzeri |
| Veri analitiği için en zengin format | |

---

## Model 2: 🧙 Kimya Macerası (RPG)

**Tür:** Rol yapma + görev (quest) oyunu

**Konsept:** Oyuncu bir "kimyager çırağıdır". Müfredat haritasında ilerler: her tema bir **bölge**, her ünite bir **görev zinciri**, ünite sonu ise **boss sınavıdır**. Görevler; sorular, mini oyunlar ve etkileşimli senaryolarla çözülür. Doğru cevaplar XP, element ve ekipman kazandırır. Seviye atladıkça yeni bölgeler açılır.

**Oynanış döngüsü:** Görev al → görevi çöz (soru/mini oyun) → ödül (XP + koleksiyon) → yeni görev/bölge → boss (zamanlı karma sınav) → sınıf tamamlandı rozeti.

**Müfredat eşlemesi:** Görev ağacı müfredat hiyerarşisine **birebir** eşlenir (sınıf → tema → ünite → çıktı). Boss = ünite değerlendirmesi.

**Hesap/veri:** Karakter seviyesi, XP, envanter (elementler, ekipman), tamamlanan görevler, boss puanları.

**Çok oyunculu:** Takım görevleri (sınıfça boss) ileri fazda.

**Zorluk:** ★★★★☆ (4/5) · **MVP süresi:** 3-4 ay (fazlı gelişir)

| ✅ Artılar | ❌ Eksiler |
|-----------|-----------|
| En yüksek bağlılık ve motivasyon | En çok içerik + tasarım işi |
| Müfredat ilerlemesi doğal ve görsel | Hikaye/mekan tasarımı gerekir |
| Uzun vadede genişletilebilir | İlk oynanabilir sürüm geç gelir |

---

## Model 3: 🔬 Sanal Laboratuvar (Deney Simülasyonu)

**Tür:** Simülasyon / deney

**Konsept:** Okulda riskli ya da imkânsız deneyleri güvenle yap: malzeme seç, ölç, karıştır, ısıt, gözlemle. Deney prosedürü adım adım izlenir; yanlış adım reaksiyonu bozar (puan/güvenlik skoru düşer). Ayrıca **keşif modu**: bilinen maddeleri birleştirerek yenilerini keşfet (Little Alchemy etkisi).

**Oynanış döngüsü:** Deneyi seç → prosedürü uygula (sürükle-bırak) → sonucu gözlemle → raporu doldur → güvenlik + doğruluk puanı.

**Müfredat eşlemesi:** Kimyasal türler arası etkileşimler, asit-baz, haller, deney düzenekleri. TYMM'in **alan becerileri** (deney tasarlama, gözlem, çıkarım) kısmına birebir hitap eder.

**Hesap/veri:** Tamamlanan deneyler, güvenlik skoru, keşfedilen bileşik koleksiyonu.

**Çok oyunculu:** Laboratuvar yarışları (aynı deneyi en hızlı/doğru tamamlama).

**Zorluk:** ★★★★☆ (4/5) · **MVP süresi:** 2-3 ay (kısıtlı deney setiyle 1-2 ay)

| ✅ Artılar | ❌ Eksiler |
|-----------|-----------|
| Rakipsiz eğitsel değer (güvenli deney) | Animasyon/simülasyon işi yoğun |
| TYMM alan becerilerini ölçer | Deney içeriği uzmanlık ister |
| Keşif modu bağımlılık yaratır | Bazı deneyleri web'de modellemek zor |

---

## Model 4: 🧩 Bulmaca Krallığı (Eşleştirme / Mantık)

**Tür:** Bulmaca / casual puzzle

**Konsept:** Kimya kavramlarını bulmaca mekaniklerine dönüştür:
- Sembol ↔ isim eşleştirme (H → Hidrojen)
- Periyodik tabloyu boşluklara yerleştirme
- Denklem dengeleme "terazi" bulmacası
- 3'lü eşleştir tahtaları (Candy Crush tarzı: element grupları)
Seviye bazlıdır, her seviye 3 yıldızlıdır.

**Oynanış döngüsü:** Seviyeyi aç → bulmacayı çöz → yıldız kazan → yeni seviye/mekanik.

**Müfredat eşlemesi:** Semboller, periyodik sistem, bileşik formülleri, denklem dengeleme, mol hesabı (sayı bulmacaları). Orta sınıflar (9-10) için ideal; organik kimyada (12) eşleştirme kartları olarak uyarlanabilir.

**Hesap/veri:** Yıldızlar, açılan seviyeler, süre rekorları, hata sayıları.

**Çok oyunculu:** Haftalık "seviye yarışı" (en hızlı kim çözecek).

**Zorluk:** ★★★☆☆ (3/5) · **MVP süresi:** 6-8 hafta

| ✅ Artılar | ❌ Eksiler |
|-----------|-----------|
| "Oyun" hissi en yüksek türlerden | Kavramsal/derin konulara uyarlamak zor |
| Kısa oturumlar, mobil uyumlu | Soru üretimi bulmaca tasarımı ister |
| Tekrar oynanabilirliği yüksek | Hız odaklı; analiz düzeyi ölçmek sınırlı |

---

## Model 5: 🚪 Lab Kaçış Odası (Escape Room)

**Tür:** Bulmaca + hikâye

**Konsept:** Her tema bir senaryodur: *"Laboratuvarda kilitli kaldın. Kimyasal bilginle 5 bulmacayı çözüp çıkışı bul."* Bulmacalar: periyodik sistemle şifre çözme, karışım hazırlama, pH/sıcaklık hesapları, doğru deney düzeneği kurma. Süre sayacı vardır; ipucu sistemi (ceza ile) bulunur.

**Oynanış döngüsü:** Senaryoyu oku → bulmacaları çöz (sıralı/paralel) → ipucu iste (skor cezası) → kapıyı aç → süre + ipucu kullanımına göre puan.

**Müfredat eşlemesi:** Ünite sonu **bütünleşik değerlendirme** için mükemmel — bilgiyi farklı bağlamlarda birlikte kullanmayı gerektirir.

**Hesap/veri:** Tamamlanan odalar, süreler, ipucu sayısı, puanlar.

**Çok oyunculu:** Takım halinde odalar (sınıf etkinliği) ileri fazda.

**Zorluk:** ★★★☆☆ (3/5) · **MVP süresi:** 6-10 hafta (senaryo başına 1-2 hafta)

| ✅ Artılar | ❌ Eksiler |
|-----------|-----------|
| Yüksek motivasyon, senaryo gücü | Tekrar oynanabilirlik düşük (çözünce biter) |
| Sınıfta "etkinlik" olarak kullanılabilir | Sürekli yeni senaryo üretimi gerekir |
| Bilgiyi bütünleşik kullanmayı öğretir | Bulmaca dengelemesi dikkat ister |

---

## Model 6: 🃏 Element Kartları (Koleksiyon + Strateji)

**Tür:** Kart oyunu (TCG)

**Konsept:** Element ve bileşik **kartları topla** (soruları/etkinlikleri doğru çözerek kazan). Kartların güçleri periyodik özelliklerden türetilir. Kart savaşlarında rakip kartına karşı **tepkimeyi tahmin et**: doğru ürünü seçersen rakibe hasar; yanlışsa sen hasar alırsın. Grup sinerjileri: alkali metal + halojen → güçlü tuz kartı gibi.

**Oynanış döngüsü:** Desteni kur → savaş (tepkime tahmini/mekanik sorular) → kazan → yeni kart paketi → koleksiyonu büyüt.

**Müfredat eşlemesi:** Periyodik özellikler, bağ oluşumu, tepkime türleri, organik fonksiyonel gruplar (12). Kart istatistikleri gerçek kimyasal verilere dayanır.

**Hesap/veri:** Kart koleksiyonu, desteler, savaş galibiyetleri, elo benzeri derecelendirme.

**Çok oyunculu:** **Doğal** çok oyunculu tür; eşleştirme ve ligler kolay kurulur.

**Zorluk:** ★★★★☆ (4/5) · **MVP süresi:** 2-3 ay

| ✅ Artılar | ❌ Eksiler |
|-----------|-----------|
| Koleksiyon + strateji derinliği | Dengeleme (balance) ciddi iş |
| Çok oyunculuya en uygun tür | Kart mekaniği tasarımı uzmanlık ister |
| Uzun vadeli bağlılık (koleksiyon) | Tek kart/kavram başına içerik yükü |

---

## Model 7: 🏭 Kimya Fabrikası (Yönetim Simülasyonu)

**Tür:** Ekonomi / kaynak yönetimi

**Konsept:** Oyuncu bir kimya fabrikasını yönetir: hammaddelerden (elementlerden) ara ürünler ve bileşikler üretir, üretim zinciri kurar, enerji ve atık yönetir. **Sürdürülebilirlik hedefleri** vardır (TYMM'nin 3. temasıyla birebir uyumlu!). Yeni üretim teknolojileri müfredat sorularıyla açılır.

**Oynanış döngüsü:** Ürünü seç → gereken tepkimeyi bil (soru/formül) → üretim hattını kur → kaynakları dengele → hedefi karşıla → fabrikayı büyüt.

**Müfredat eşlemesi:** Tepkime türleri, stokiyometri (mol hesabıyla üretim), endüstriyel kimya, enerji kaynakları, sürdürülebilirlik (10-12. sınıf ağırlıklı).

**Hesap/veri:** Fabrika seviyesi, üretilen ürünler, ekonomi skorları, sürdürülebilirlik notu.

**Çok oyunculu:** Pazar/ticaret (basit) veya takım fabrikaları.

**Zorluk:** ★★★★★ (5/5) · **MVP süresi:** 3+ ay

| ✅ Artılar | ❌ Eksiler |
|-----------|-----------|
| Sürdürülebilirlik temasına birebir oturur | En karmaşık türlerden |
| Derin strateji, uzun oturumlar | Bilgi ölçümü dolaylı (yönetim arayüzünde) |
| Ekonomi oyunu sevenleri bağlar | Kimya → oyun mekaniği dönüşümü zor |

---

## Model 8: ⚡ Hız Yarışı (Refleks + Bilgi)

**Tür:** Arcade / hız oyunu

**Konsept:** Hızlı mini görevler: ekranda sembol düşer → doğru isme tıkla; formül parçalarını sürükle-bırak; doğru tepkime ürününe en hızlı tıkla. Combo sistemi ve "hayalet rakip" (kendi en iyi skorun) vardır. Süreli turlar, yanlış tıklama combo'yu kırar.

**Oynanış döngüsü:** Modu seç (sembol/formül/denklem) → 60 sn hız turu → skor + rekor → tekrar dene.

**Müfredat eşlemesi:** Sembol-isim, formül yazma, denklem dengeleme — **ezber ve otomasyon** gerektiren 9-10. sınıf konuları için ideal.

**Hesap/veri:** Rekorlar, en yüksek combo, doğruluk oranı, hız istatistikleri.

**Çok oyunculu:** Aynı anda "kim daha hızlı" düelloları ve turnuvalar.

**Zorluk:** ★★☆☆☆ (2/5) · **MVP süresi:** 4-6 hafta

| ✅ Artılar | ❌ Eksiler |
|-----------|-----------|
| İkinci en hızlı MVP | Kavramsal/derin konularda kullanılamaz |
| Yüksek tekrar oynanabilirlik | Ezber odağı; öğrenme derinliği sınırlı |
| Turnuva/liderlik için doğal | Hız baskısı bazı öğrencileri strese sokar |

---

## Model 9: 🕵️ Kimya Dedektifi (Hikâye / Gizem)

**Tür:** Etkileşimli hikâye (interactive fiction)

**Konsept:** Her bölüm bir olay: *"Bir içecekte şüpheli bir madde var."* Oyuncu kanıt toplar (pH testi, renk değişimi, çözünürlük, stokiyometri), seçeneklerle sonuca gider. Seçimler hikâyeyi değiştirir; yanlış iz takibi puan kaybettirir. Her bölüm bir üniteye bağlıdır.

**Oynanış döngüsü:** Olayı oku → kanıtları incele (soru/mini etkileşim) → hipotez kur → doğrula → sonucu açıkla.

**Müfredat eşlemesi:** Bilgiyi **gerçek yaşam senaryosunda** uygulama. TYMM'nin bütüncül eğitim, etik ve sorumluluk değerleriyle uyumludur.

**Hesap/veri:** Tamamlanan bölümler, doğru iz oranı, puanlar.

**Çok oyunculu:** Aynı vakayı sınıfça çözme (tartışma aracı).

**Zorluk:** ★★★☆☆ (3/5) · **MVP süresi:** 2-3 ay

| ✅ Artılar | ❌ Eksiler |
|-----------|-----------|
| Hikâye değeri en yüksek tür | Tekrar oynanabilirlik düşük |
| Uygulama/analiz düzeyini doğal ölçer | Senaryo + şık yazımı ağır içerik işi |
| Okulda proje/etkinlik olarak kullanılabilir | Çok dallı hikâye yönetimi (state) karmaşık |

---

## Model 10: 🌍 Element Dünyası (Sandbox / Keşif)

**Tür:** Keşif / sandbox (Little Alchemy + Minecraft Eğitim tarzı)

**Konsept:** Serbest bir ızgara dünyasında elementleri birleştirerek maddeler keşfet (H + O → Su). Keşfedilen her madde koleksiyona girer ve "Keşif Ansiklopedisi"nde açıklamasıyla sergilenir. Müfredat hedefleri ilerledikçe yeni bölgeler/maddeler açılır. Serbest mod + hedefli mod bir arada.

**Oynanış döngüsü:** Maddeyi seç → başka maddeyle birleştir → sonucu gör/keşfet → ansiklopediyi doldur → yeni hedef/bölge.

**Müfredat eşlemesi:** Tepkime mantığı, bileşik oluşturma, madde sınıfları. Her keşif hedefi bir öğrenme çıktısına bağlanabilir.

**Hesap/veri:** Keşfedilen maddeler, ansiklopedi ilerlemesi, keşif süreleri.

**Çok oyunculu:** Keşif yarışları / sınıf koleksiyon panosu.

**Zorluk:** ★★★☆☆ (basit) → ★★★★★ (zengin) · **MVP süresi:** 2-4 ay

| ✅ Artılar | ❌ Eksiler |
|-----------|-----------|
| Yaratıcılığı ve merakı tetikler | Keşif verisi "yanlış cevap" üretmez (ölçme zayıf) |
| Kanıtlanmış bağımlılık mekaniği (Little Alchemy) | Sınırsız içerik beklentisi yaratır |
| Koleksiyon = görsel ilerleme | Okul notu/ölçme için dönüşüm gerekir |

---

## 📊 Karşılaştırma Tablosu

| # | Model | Tür | Zorluk (1-5) | MVP Süresi | Oyun Hissi | Eğitsel Derinlik | Tekrar Oynanabilirlik | Çok Oyunculu Potansiyeli | Müfredat Kapsamı |
|---|-------|-----|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | Quiz Arena | Bilgi yarışması | 2 | 4-6 hafta | 🟡 | 🟡 | 🟡 | 🟢 | 🟢 |
| 2 | Kimya Macerası (RPG) | RPG | 4 | 3-4 ay | 🟢 | 🟢 | 🟢 | 🟡 | 🟢 |
| 3 | Sanal Laboratuvar | Simülasyon | 4 | 2-3 ay | 🟢 | 🟢🟢 | 🟡 | 🟡 | 🟡 |
| 4 | Bulmaca Krallığı | Bulmaca | 3 | 6-8 hafta | 🟢 | 🟡 | 🟢 | 🟡 | 🟡 |
| 5 | Lab Kaçış Odası | Bulmaca+hikâye | 3 | 6-10 hafta | 🟢 | 🟢 | 🔴 | 🟡 | 🟢 |
| 6 | Element Kartları | Kart (TCG) | 4 | 2-3 ay | 🟢 | 🟡 | 🟢 | 🟢 | 🟡 |
| 7 | Kimya Fabrikası | Yönetim | 5 | 3+ ay | 🟢 | 🟡 | 🟢 | 🟡 | 🟡 |
| 8 | Hız Yarışı | Arcade | 2 | 4-6 hafta | 🟢 | 🔴 | 🟢 | 🟢 | 🔴 |
| 9 | Kimya Dedektifi | Hikâye | 3 | 2-3 ay | 🟢 | 🟢🟢 | 🔴 | 🟡 | 🟢 |
| 10 | Element Dünyası | Sandbox | 3-5 | 2-4 ay | 🟢 | 🟡 | 🟢 | 🟡 | 🟡 |

🟢 yüksek · 🟡 orta · 🔴 düşük

## 🏗️ Önerilen Mimari Yaklaşım: "Çekirdek Platform + Çoklu Oyun Modu"

Tek bir oyun tarzı seçmek yerine şu mimariyi öneriyorum:

> **Bir platform, birden fazla oyun modu.** Tüm sorular/etkinlikler müfredat etiketli (sınıf → tema → ünite → çıktı) tek bir veri havuzunda durur. Oyuncu aynı içerikle farklı modlarda oynar. Modlar zamanla eklenir.

**Bu neden daha iyi?**
1. **İçerik tek sefer üretilir**, her modda yeniden kullanılır.
2. Faz 1'de hızlı MVP (Quiz Arena) çıkar; Faz 2+ modlar eklenir.
3. Müfredat kapsamı (9-12 tam) her modda otomatik korunur.
4. Oyuncu sıkılırsa mod değiştirir; platform canlı kalır.

## ✅ KARARLAŞTIRILAN MOD SETİ (sahip onayı ile)

> Sahip kararı: **Quiz Arena çekirdek** + çeşitlendirme. Aynı soru havuzundan beslenen mod seti:

| Faz | Mod | Seçim nedeni |
|-----|-----|--------------|
| Faz 1 (MVP) | 🏆 **Quiz Arena** + **Müfredat Haritası** | En hızlı çalışır kanıt; hesap + veri altyapısı; müfredatı görselleştirir |
| Faz 2 | ⚡ **Hız Yarışı** + 🧩 **Bulmaca Krallığı** | Hızlı üretilen, oyun hissi yüksek, tekdüzeliği kırar |
| Faz 3 | 🚪 **Lab Kaçış Odası** | Sınıf etkinliği değeri; bütünleşik değerlendirme |
| Faz 4 | 🔬 **Sanal Laboratuvar** | Rakipsiz farklılaştırıcı; TYMM alan becerileri |
| Her faz | 🛠️ **Öğretmen paneli** (Faz 3 tam; Faz 1/2'de temel görünüm) | Ölçme-değerlendirme; sınıf yönetimi |

> 💡 **Tek cümlelik öneri:** *"Quiz Arena ile başla, müfredat haritasıyla ilerlemeyi görselleştir, ikinci mod olarak Kaçış Odası veya Bulmaca Krallığı ekle, farklılaşmak için Sanal Laboratuvar'a yatırım yap."*

## ❓ Sahibin Karar Vermesi Gerekenler

1. Hangi mod(ler) ile başlayalım? (Öneri: Faz 1 = Quiz Arena)
2. Hedef kitle sadece öğrenciler mi, öğretmen paneli de isteniyor mu?
3. Okulda (sınıf etkinliği) kullanılacak mı, yoksa bireysel mi?
4. Oyun dili sadece Türkçe mi?
5. Görsel stil: bilimsel/teknik mi, çizgi film mi, minimal mi?
