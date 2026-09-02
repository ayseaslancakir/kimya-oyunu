// Lab Kaçış Odası senaryoları (tema bazlı)
export type Senaryo = {
  giris: string;
  ipucu: string;
  cikis: string;
};

const SENARYOLAR: Record<string, Senaryo> = {
  Etkileşim: {
    giris:
      "🧪 Laboratuvarın güvenlik sistemi devreye girdi ve kapı kilitlendi! Etkileşim bilgini kullanarak 5 güvenlik sorusunu doğru cevapla. Her doğru cevap kilidi bir adım açar, 5 cevap kapıyı açar.",
    ipucu: "Kilit, periyodik tabloya ve atomlara göre programlanmış. Aynı ünitede çalıştığın konuları düşün.",
    cikis: "🚪 Kapı açıldı! Etkileşim bilginle laboratuvardan başarıyla çıktın.",
  },
  Çeşitlilik: {
    giris:
      "🔬 Kimya deposunda kilitli kaldın! Depo kapısının şifresi, maddelerin çeşitliliğiyle ilgili sorularda gizli. 5 soruyu doğru cevaplayıp çıkışı bul.",
    ipucu: "Maddelerin hallerini, karışımları ve bileşikleri düşün. Şifre, doğru cevapların ardında.",
    cikis: "🚪 Depo kapısı ardına kadar açıldı! Çeşitlilik bilginle kurtuldun.",
  },
  Sürdürülebilirlik: {
    giris:
      "🌍 Çevre laboratuvarında kilitli kaldın! Ekolojik güvenlik protokolü aktif. Sürdürülebilirlik bilgini kullanarak 5 soruyu çöz ve sistemi devre dışı bırak.",
    ipucu: "Yeşil kimya, atık yönetimi ve enerji verimliliği anahtarların olacak.",
    cikis: "🚪 Çevre laboratuvarı kapısı açıldı! Sürdürülebilirlik bilginle görevini tamamladın.",
  },
};

export function getScenario(temaAdi: string): Senaryo {
  return (
    SENARYOLAR[temaAdi] ?? {
      giris:
        "🧪 Laboratuvar kapısı kilitlendi! Bu ünitede öğrendiklerinle 5 soruyu çöz ve çıkışı bul.",
      ipucu: "Ünitede çalıştığın konuları hatırla.",
      cikis: "🚪 Kapı açıldı! Başarıyla çıktın.",
    }
  );
}
