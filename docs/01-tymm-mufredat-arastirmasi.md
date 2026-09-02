# 📚 TYMM Kimya Dersi Müfredat Araştırması

> Kaynak: MEB resmi siteleri (`tymm.meb.gov.tr`, `mufredat.meb.gov.tr`) — 31 Ağustos 2026'da doğrudan incelendi.

---

## 1. TYMM Nedir?

**Türkiye Yüzyılı Maarif Modeli (TYMM)**, MEB Talim ve Terbiye Kurulu Başkanlığı tarafından yayımlanan yeni öğretim programları modelidir. Önceki (2018) programların yerine kademeli olarak uygulanmaktadır.

TYMM'nin temel bileşenleri (resmi siteden):

| Bileşen | Açıklama |
|---------|----------|
| **Öğrenci Profili** | "Yetkin ve Erdemli İnsan" — ahlaklı, bilge, sorgulayan, üretken birey |
| **Erdem-Değer-Eylem Çerçevesi** | Adalet, Saygı, Sorumluluk çatı değerleri etrafında 20+ değer |
| **Beceriler Çerçevesi** | Kavramsal beceriler, alan becerileri, sosyal-duygusal öğrenme, okuryazarlık becerileri, eğilimler |
| **Bütüncül Eğitim** | Öğrenme çıktıları, ölçme-değerlendirme, farklılaştırılmış öğretim, programlar arası bileşenler |

> 🎮 **Oyunumuz için önemi:** TYMM'de "kazanım" yerine **öğrenme çıktıları** (KİM.9.1.1 gibi kodlanır) kullanılır ve beceri/değer boyutları da ölçülür. Oyun içeriğimiz bu çıktılara bağlanmalı; sorularımız sadece bilgi değil, **uygulama ve analiz** düzeylerini de ölçmeli.

## 2. Kimya Dersi Öğretim Programı — Sürümler

`mufredat.meb.gov.tr` portalında kimya için **iki TYMM sürümü** bulunmaktadır:

| Sürüm | Sayfa |
|-------|-------|
| [TYMM] KİMYA DERSİ (9-12) (2024) | İlk uygulanan program |
| [TYMM] KİMYA DERSİ (9-12) (2026) | **Güncel program** → `mufredat.meb.gov.tr/ProgramDetay.aspx?PID=2255` |

**Kademeli geçiş takvimi (önemli!):**

| Eğitim-Öğretim Yılı | Yeni (TYMM) programa geçen sınıflar |
|---------------------|-------------------------------------|
| 2024-2025 | 9. sınıf |
| 2025-2026 | 10. sınıf |
| 2026-2027 | 11. sınıf ← **bugün içinde olduğumuz yıl** |
| 2027-2028 | 12. sınıf |

> ⚠️ **Sonuç:** Şu anda (2026-2027) 9, 10 ve 11. sınıflar TYMM programıyla okuyor; 12. sınıf 2027-2028'de geçecek. **Oyunumuz 2026 sürümünü temel almalı**, ancak 12. sınıf için de içerik planı 2026 programına göre yapılmalı (sınıf, o yıl geçiş yapacak).

## 3. Programın Yapısı (Doğrulanmış)

TYMM etkileşimli program sayfasından (`tymm.meb.gov.tr/ogretim-programlari/ders/kimya-dersi`) doğrulandı:

**Her sınıfta (9, 10, 11, 12) 3 tema vardır:**

| Tema | Adı | Oyun içindeki karşılığı |
|------|-----|------------------------|
| 1. Tema | **Etkileşim** | Madde ve türlerinin etkileşimleri (atom, bağ, tepkime...) |
| 2. Tema | **Çeşitlilik** | Maddelerin çeşitliliği (haller, karışımlar, bileşikler...) |
| 3. Tema | **Sürdürülebilirlik** | Kimyanın doğa, çevre ve toplumla ilişkisi |

**Hiyerarşi (oyun veri modelimizin temeli):**

```
Sınıf (9 / 10 / 11 / 12)
 └── Tema (Etkileşim / Çeşitlilik / Sürdürülebilirlik)
      └── Ünite / Öğrenme Alanı
           └── Öğrenme Çıktısı (KİM.9.1.1. gibi kodlu)
                └── Süreç Bileşenleri + Açıklamalar
```

Her öğrenme çıktısı ayrıca şunlarla ilişkilendirilir: alan becerileri, kavramsal beceriler, eğilimler, değerler, okuryazarlık becerileri.

## 4. Resmi Kaynaklar

| Kaynak | Adres |
|--------|-------|
| TYMM ana sayfa | `https://tymm.meb.gov.tr` |
| TYMM kimya dersi (etkileşimli) | `https://tymm.meb.gov.tr/ogretim-programlari/ders/kimya-dersi` |
| 9. sınıf temaları | `https://tymm.meb.gov.tr/ogretim-programlari/kimya-dersi/11` |
| 10. sınıf temaları | `https://tymm.meb.gov.tr/ogretim-programlari/kimya-dersi/12` |
| 11. sınıf temaları | `https://tymm.meb.gov.tr/ogretim-programlari/kimya-dersi/13` |
| 12. sınıf temaları | `https://tymm.meb.gov.tr/ogretim-programlari/kimya-dersi/14` |
| Müfredat portalı — Kimya (2026) PDF | `https://mufredat.meb.gov.tr/ProgramDetay.aspx?PID=2255` |
| Müfredat portalı — program listesi | `https://mufredat.meb.gov.tr/Programlar.aspx` |
| OGM Materyal (deney/video/etkinlik) | `https://ogmmateryal.eba.gov.tr` |

## 5. Oyun Tasarımına Etkileri

1. **İçerik hiyerarşisi net:** Oyun ilerleme haritası = Sınıf → Tema → Ünite → Öğrenme Çıktısı. Her soru/etkinlik bir öğrenme çıktısına bağlanmalı.
2. **12 tema = 12 ana bölge:** 4 sınıf × 3 tema. Harita tabanlı ilerleme için doğal bölünme.
3. **Bilişsel düzey etiketi:** Sorulara bilişsel düzey (hatırlama / anlama / uygulama / analiz) eklenmeli.
4. **Beceri ve değer boyutu:** Oyun içi "bilimsel sorgulama", "sorumluluk" gibi temalar başarımlara (achievement) dönüştürülebilir.

## 6. Sonraki Adım: Müfredat Verisini Çıkarma (Faz 0/1 Görevi)

1. `mufredat.meb.gov.tr/ProgramDetay.aspx?PID=2255` adresindeki **2026 PDF'ini indir**.
2. PDF'ten şunları yapılandırılmış JSON'a dönüştür:
   - Sınıflar → Temalar → Üniteler → Öğrenme çıktıları (kod + metin)
3. Çıktıyı `data/curriculum/` klasörüne koy (örn. `tymm_kimya_2026.json`).
4. (İleri) TYMM etkileşimli sayfasındaki verileri otomatik çekmek için scraper yazılabilir — ama PDF en güvenilir kaynaktır.

> 📌 **Not:** Bu dosyadaki tema yapısı resmi kaynaktan doğrulandı. Ünite adları ve öğrenme çıktısı metinleri için resmi PDF'ten çıkarma yapılacak; bu işlem "içerik doğruluğu" açısından kritiktir.
