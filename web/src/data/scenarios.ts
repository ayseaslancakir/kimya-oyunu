// Lab Kaçış Odası senaryoları (tema bazlı).
// Her bulmaca adımının kendi hikâye metni ve ipucu vardır; ipucu alınca puan düşer.

export const ADIM_SAYISI = 5;

export type SenaryoAdimi = {
  hikaye: string; // bulmacanın başındaki hikâye metni
  ipucu: string; // ipucu istenirse gösterilir (puan düşer)
};

export type Senaryo = {
  giris: string;
  cikis: string;
  adimlar: SenaryoAdimi[];
};

// Yeterli adım tanımlı değilse kullanılacak genel adımlar.
function genelAdimlar(): SenaryoAdimi[] {
  return [
    {
      hikaye:
        "🔒 Laboratuvar kapısı kilitlendi. Güvenlik panelindeki ilk bulmacayı çözersen ilk kilit açılır.",
      ipucu: "Ünitede çalıştığın temel kavramları hatırla; ilk adım genelde tanım sorusudur.",
    },
    {
      hikaye:
        "🚪 İlk kilit açıldı, koridordaki dolabın şifresi seni bekliyor. Panelde bu ünitenin bir başka konusu var.",
      ipucu: "Bir önceki soruda kullandığın kavramı değil, ünitenin diğer konusunu düşün.",
    },
    {
      hikaye:
        "⚡ Işıklar kırpıştı! Elektrik panosundaki mühür ancak doğru cevapla açılır.",
      ipucu: "Sorudaki sayısal değerlere ve birimlere dikkat et.",
    },
    {
      hikaye:
        "🧪 Tezgâhta unutulmuş bir deney düzeneği var; etiketteki soruyu çözersen son bölmeye geçebilirsin.",
      ipucu: "Deney/gözlem sorularında verilen değişkenleri karşılaştır.",
    },
    {
      hikaye:
        "🔓 Son kapı! Çıkış şifresi bu ünitenin özet bilgisine bağlı. Doğru cevapla laboratuvardan çık.",
      ipucu: "Ünitenin ana fikrini düşün; çıkış sorusu genelde kavramları birleştirir.",
    },
  ];
}

const SENARYOLAR: Record<string, Senaryo> = {
  Etkileşim: {
    giris:
      "🧪 Laboratuvarın güvenlik sistemi devreye girdi ve kapı kilitlendi! Etkileşim bilgini kullanarak 5 güvenlik sorusunu doğru cevapla. Her doğru cevap kilidi bir adım açar, 5 cevap kapıyı açar.",
    cikis: "🚪 Kapı açıldı! Etkileşim bilginle laboratuvardan başarıyla çıktın.",
    adimlar: [
      {
        hikaye:
          "🔒 Bilgisayar ekranında ilk kilit belirdi: “Laboratuvar giriş kaydını doğrula.” Atomların dünyasına açılan ilk kapı bu.",
        ipucu: "Atomun yapısını ve atom modellerini düşün; ilk adım genelde tanımla ilgilidir.",
      },
      {
        hikaye:
          "🚪 Koridora açılan kapı aralandı, ama ortadaki çekmece kilitli. Üzerindeki not: “Elektronların dizilimini bilirsen beni açarsın.”",
        ipucu: "Elektron dizilimi ve orbitallerin bağlı enerji sırası bu adımın şifresi.",
      },
      {
        hikaye:
          "⚡ Işıklar bir an söndü! Elektrik panosundaki mühür, periyodik tablodaki değişimi soran soruyu bekliyor.",
        ipucu: "Atom yarıçapı ve iyonlaşma enerjisi gibi periyodik özelliklerin değişimini hatırla.",
      },
      {
        hikaye:
          "🧪 Çekmeceyi açar açmaz bir gaz tüpü yuvarlandı; etiketinde tepkime türü yazıyor.",
        ipucu: "Sentez, analiz, yer değiştirme ve nötrleşme tepkimelerini ayırt et.",
      },
      {
        hikaye:
          "🔓 Son kapı! Şifre paneli, iyon ve bağ oluşumu bilginle açılacak. Doğru cevapla laboratuvardan çık.",
        ipucu: "İyon oluşumu ile bağ türleri (iyonik, kovalent, metalik) son kapının anahtarı.",
      },
    ],
  },
  Çeşitlilik: {
    giris:
      "🔬 Kimya deposunda kilitli kaldın! Depo kapısının şifresi, maddelerin çeşitliliğiyle ilgili sorularda gizli. 5 soruyu doğru cevaplayıp çıkışı bul.",
    cikis: "🚪 Depo kapısı ardına kadar açıldı! Çeşitlilik bilginle kurtuldun.",
    adimlar: [
      {
        hikaye:
          "🔒 Depo kapısının panosu yandı: “Madde türlerini sınıflandırmadan geçemezsin.”",
        ipucu: "Element, bileşik ve karışım arasındaki farkı düşün.",
      },
      {
        hikaye:
          "🧊 Soğutucu dolaplardan biri kilitli; etiketinde “çözünme ve karışımlar” yazıyor.",
        ipucu: "Homojen/heterojen karışımlar ve çözelti kavramları bu adımda.",
      },
      {
        hikaye:
          "🌡️ Termometre kırmızıya döndü! Rafı aşmak için hal değişimi sorusunu çözmelisin.",
        ipucu: "Erime, kaynama, buhar basıncı ve viskozite gibi özellikleri hatırla.",
      },
      {
        hikaye:
          "🧱 Rafın arkasındaki duvar, moleküller arası etkileşim sorusunu doğru cevaplarsan açılıyor.",
        ipucu: "Hidrojen bağı, dipol–dipol ve London kuvvetlerini düşün.",
      },
      {
        hikaye:
          "🔓 Çıkış kapısı! Adlandırma kurallarını bilirsen depodan kurtulacaksın.",
        ipucu: "İyonik ve kovalent bileşiklerin adlandırma kuralları son şifredir.",
      },
    ],
  },
  Sürdürülebilirlik: {
    giris:
      "🌍 Çevre laboratuvarında kilitli kaldın! Ekolojik güvenlik protokolü aktif. Sürdürülebilirlik bilgini kullanarak 5 soruyu çöz ve sistemi devre dışı bırak.",
    cikis: "🚪 Çevre laboratuvarı kapısı açıldı! Sürdürülebilirlik bilginle görevini tamamladın.",
    adimlar: [
      {
        hikaye:
          "🔒 Çevre laboratuvarının güvenlik protokolü başladı: “Atık türlerini ayırmadan devam edemezsin.”",
        ipucu: "Evsel atıklar, geri dönüşüm ve atık ayrıştırma ilk adımın.",
      },
      {
        hikaye:
          "💧 Su arıtma ünitesinin vanası kilitli. Panel, su kaynaklarını korumayla ilgili bir soru soruyor.",
        ipucu: "Temiz su, su kirliliği ve arıtma süreçlerini düşün.",
      },
      {
        hikaye:
          "🌫️ Havalandırma durdu! Havayı temizlemek için atmosferle ilgili soruyu çözmelisin.",
        ipucu: "Sera gazları, asit yağmurları ve karbon ayak izi bu adımın anahtarı.",
      },
      {
        hikaye:
          "♻️ Geri dönüşüm konteyneri açılmıyor; kod, yeşil kimyanın ilkelerinde saklı.",
        ipucu: "Yeşil kimyanın ilkeleri ve atom ekonomisi kavramını hatırla.",
      },
      {
        hikaye:
          "🔓 Son kapı: sürdürülebilir bir çıkış için yeşil teknoloji sorusunu yanıtla.",
        ipucu: "Yenilenebilir enerji ve yeşil hidrojen gibi çözümleri düşün.",
      },
    ],
  },
};

export function getScenario(temaAdi: string): Senaryo {
  return (
    SENARYOLAR[temaAdi] ?? {
      giris:
        "🧪 Laboratuvar kapısı kilitlendi! Bu ünitede öğrendiklerinle 5 soruyu çöz ve çıkışı bul.",
      cikis: "🚪 Kapı açıldı! Başarıyla çıktın.",
      adimlar: genelAdimlar(),
    }
  );
}

// Adım sayısı senaryoda tanımlı olandan fazlaysa son adım tekrar kullanılır.
export function getScenarioStep(senaryo: Senaryo, index: number): SenaryoAdimi {
  return senaryo.adimlar[index] ?? senaryo.adimlar[senaryo.adimlar.length - 1] ?? genelAdimlar()[0];
}
