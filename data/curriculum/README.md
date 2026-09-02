# 📁 Müfredat Verisi (TYMM Kimya)

Bu klasör, **TYMM Kimya Dersi Öğretim Programı'ndan (9-12)** çıkarılacak yapılandırılmış veriyi barındırır.

## Kaynak

| Sürüm | Adres |
|-------|-------|
| Güncel program PDF (2026) | `https://mufredat.meb.gov.tr/ProgramDetay.aspx?PID=2255` |
| Etkileşimli tema görünümü | `https://tymm.meb.gov.tr/ogretim-programlari/ders/kimya-dersi` |

## Yapılacak İş (Faz 0/1 görevi)

1. PDF'i indir.
2. Her sınıf (9, 10, 11, 12) için tema → ünite → öğrenme çıktısı yapısını çıkar.
3. Aşağıdaki formatta `tymm_kimya_2026.json` olarak kaydet.
4. (Opsiyonel) Soru üretiminde kullanmak üzere her çıktıya bilişsel düzey etiketi ekle: `hatırlama / anlama / uygulama / analiz`.

## Hedef Format (JSON)

```json
{
  "meta": {
    "ders": "Kimya",
    "program": "TYMM Kimya Dersi (9-12)",
    "surum": "2026",
    "kaynak": "https://mufredat.meb.gov.tr/ProgramDetay.aspx?PID=2255"
  },
  "siniflar": [
    {
      "kod": 9,
      "temalar": [
        {
          "adi": "Etkileşim",
          "sira": 1,
          "uniteler": [
            {
              "adi": "Ünite adı (PDF'ten)",
              "sira": 1,
              "ogrenmeCiktilar": [
                {
                  "kod": "KİM.9.1.1",
                  "metin": "Öğrenme çıktısı açıklaması (PDF'ten)",
                  "bilisselDuzey": "anlama"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

> ⚠️ **Doğruluk kritik:** Ünite adları ve öğrenme çıktısı metinleri **resmi PDF'ten birebir** alınmalı; tahminle yazılmamalı. Tema adları (Etkileşim / Çeşitlilik / Sürdürülebilirlik) resmi siteden doğrulanmıştır ve `web/prisma/seed.ts` içinde otomatik yüklenir.
