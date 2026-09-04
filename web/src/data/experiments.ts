// Sanal Laboratuvar deney tanımları (TYMM 10. sınıf, Etkileşim teması kapsamında)
export type DeneyAdimi = {
  soru: string;
  secenekler: string[];
  dogru: number; // doğru seçeneğin indeksi
  aciklama: string; // doğru/yanlış sonrası açıklama
  sonuc: string; // gözlenen sonuç metni
};

export type Deney = {
  id: string;
  ad: string;
  ciktiKodu: string; // bağlı öğrenme çıktısı
  amac: string; // bilimsel amaç
  malzemeler: string[];
  adimlar: DeneyAdimi[];
  sonucMetni: string; // deney sonu raporu
};

export const DENEYLER: Deney[] = [
  {
    id: "turnusol",
    ad: "Turnusol ile Asit-Baz Tayini",
    ciktiKodu: "KİM.10.1.3",
    amac: "Bilinmeyen sıvıların asit mi baz mı olduğunu turnusol kâğıdı kullanarak belirlemek.",
    malzemeler: ["Turnusol kâğıdı (kırmızı + mavi)", "3 numune sıvı", "Damlalık", "Güvenlik gözlüğü", "Eldiven"],
    adimlar: [
      {
        soru: "Bilinmeyen sıvıların asit-baz durumunu belirlemek için ilk adım ne olmalıdır?",
        secenekler: [
          "Numuneleri turnusol kâğıdıyla test etmek",
          "Numunelerin tadına bakmak",
          "Numuneleri koklamak",
          "Numuneleri birbirine karıştırmak",
        ],
        dogru: 0,
        aciklama: "Güvenli ve doğru yöntem turnusol (pH) kâğıdıyla test etmektir. Maddeler asla tadılmaz veya koklanmaz.",
        sonuc: "🔵🔴 Turnusol kâğıtları sıvılara batırıldı. Kâğıtların renkleri değişmeye başladı!",
      },
      {
        soru: "Kırmızı turnusol kâğıdı numunede MAVİYE döndü. Bu sıvı için ne söylenebilir?",
        secenekler: ["Sıvı baziktir", "Sıvı asidiktir", "Sıvı nötrdür", "Sıvı bir metaldir"],
        dogru: 0,
        aciklama: "Bazlar kırmızı turnusolu maviye çevirir. Asitler mavi turnusolu kırmızıya çevirir.",
        sonuc: "🔵 Kâğıt maviye döndü — numune bazik özellik gösteriyor!",
      },
      {
        soru: "Mavi turnusol kâğıdı numunede KIRMIZIYA döndü. Bu sıvı için ne söylenebilir?",
        secenekler: ["Sıvı asidiktir", "Sıvı baziktir", "Sıvı saf sudur", "Sıvı nötrdür"],
        dogru: 0,
        aciklama: "Asitler mavi turnusolu kırmızıya çevirir. pH < 7 olan çözeltiler asidiktir.",
        sonuc: "🔴 Kâğıt kırmızıya döndü — numune asidik özellik gösteriyor!",
      },
      {
        soru: "Asit ve bazlarla çalışırken hangi güvenlik önlemi ZORUNLUDUR?",
        secenekler: ["Koruyucu gözlük ve eldiven kullanmak", "Deneyi koşarak yapmak", "Malzemeleri açıkta bırakmak", "Kâğıt peçeteyle karıştırmak"],
        dogru: 0,
        aciklama: "Kimyasallarla çalışırken göz ve cilt koruması şarttır (GHS güvenlik kuralları).",
        sonuc: "🛡️ Güvenlik ekipmanların tamam — deney güvenle tamamlandı!",
      },
    ],
    sonucMetni:
      "Sonuç: Kırmızı turnusolu maviye çeviren sıvılar bazik, mavi turnusolu kırmızıya çeviren sıvılar asidiktir. Turnusol, asit-baz ayıracı (indikatör) olarak kullanılır.",
  },
  {
    id: "gaz-cikisi",
    ad: "Karbonat ve Sirke: Gaz Çıkışı",
    ciktiKodu: "KİM.10.1.1",
    amac: "Kimyasal değişimin gözlenebilir göstergelerinden gaz çıkışını incelemek.",
    malzemeler: ["Karbonat (NaHCO₃)", "Sirke (asetik asit)", "Balyon", "Erlenmayer", "Kaşık"],
    adimlar: [
      {
        soru: "Erlenmayerdeki karbonata sirke eklendiğinde hangi gözlenebilir değişim beklenir?",
        secenekler: ["Gaz kabarcıkları oluşur", "Sıvı katılaşır", "Renk yeşile döner", "Hiçbir şey olmaz"],
        dogru: 0,
        aciklama: "Asit (sirke) + karbonat → CO₂ gazı çıkışı. Kabarcıklar, gaz çıkışının göstergesidir.",
        sonuc: "🫧 Karışım köpürmeye başladı! CO₂ gazı açığa çıkıyor.",
      },
      {
        soru: "Çıkan gazın karbondioksit olduğunu doğrulamak için hangi test uygundur?",
        secenekler: [
          "Yanan kibriti ağza yaklaştırıp sönmesini gözlemlemek",
          "Gaza dokunmak",
          "Gazı koklamak",
          "Gazı içmek",
        ],
        dogru: 0,
        aciklama: "CO₂ yanmayı desteklemez; yanan kibriti söndürür. Bu klasik CO₂ testidir.",
        sonuc: "🔥 Kibrit ağza yaklaştırılınca söndü — gaz karbondioksit!",
      },
      {
        soru: "Bu olay kimyasal bir değişim midir? Neden?",
        secenekler: [
          "Evet, çünkü yeni bir madde (CO₂) oluştu",
          "Hayır, sadece fiziksel karışım oldu",
          "Hayır, çünkü renk değişmedi",
          "Evet, çünkü sıcaklık arttı",
        ],
        dogru: 0,
        aciklama: "Yeni madde oluşumu (gaz çıkışı) kimyasal değişimin kanıtıdır.",
        sonuc: "⚗️ Karbonat ve sirke tepkimeye girdi — yeni maddeler oluştu.",
      },
      {
        soru: "Köpürme/kabarcık oluşumu hangi kimyasal değişim göstergesidir?",
        secenekler: ["Gaz çıkışı", "Renk değişimi", "Çökelek oluşumu", "Enerji değişimi"],
        dogru: 0,
        aciklama: "Kimyasal değişim göstergeleri: gaz çıkışı, renk değişimi, çökelek oluşumu ve enerji değişimi.",
        sonuc: "📝 Bulgular kaydedildi: gaz çıkışı gözlendi.",
      },
    ],
    sonucMetni:
      "Sonuç: NaHCO₃ (karbonat) + CH₃COOH (sirke) → CO₂ gazı + tuz + su. Gaz çıkışı, kimyasal değişimin gözlenebilir göstergelerinden biridir.",
  },
  {
    id: "cokelek",
    ad: "Çökelme Tepkimesi: Gümüş Klorür",
    ciktiKodu: "KİM.10.1.3",
    amac: "İki çözeltinin karıştırılmasıyla çökelek (katı) oluşumunu gözlemlemek.",
    malzemeler: ["Gümüş nitrat çözeltisi (AgNO₃)", "Sodyum klorür çözeltisi (NaCl)", "Deney tüpü", "Damlalık"],
    adimlar: [
      {
        soru: "AgNO₃ çözeltisine NaCl çözeltisi eklendiğinde ne gözlenir?",
        secenekler: ["Beyaz katı (çökelek) oluşur", "Gaz çıkar", "Sıvı kaynar", "Renk değişmez, karışım homojen kalır"],
        dogru: 0,
        aciklama: "Ag⁺ ve Cl⁻ iyonları birleşerek suda çözünmeyen beyaz AgCl katısını oluşturur.",
        sonuc: "⚪ Tüpte beyaz, süt gibi bir katı (çökelek) oluştu!",
      },
      {
        soru: "Oluşan çökelek hangi bileşiktir?",
        secenekler: ["Gümüş klorür (AgCl)", "Gümüş nitrat (AgNO₃)", "Sodyum klorür (NaCl)", "Sodyum nitrat (NaNO₃)"],
        dogru: 0,
        aciklama: "AgNO₃ + NaCl → AgCl (çökelek) + NaNO₃. AgCl suda çözünmeyen beyaz bir katıdır.",
        sonuc: "⚗️ AgCl katısı çökeldi — NaNO₃ çözeltide kaldı.",
      },
      {
        soru: "Bu tepkime hangi tepkime türüne girer?",
        secenekler: ["Çökelme (çözünme-çökelme) tepkimesi", "Yanma tepkimesi", "Sentez tepkimesi", "Analiz (ayrışma) tepkimesi"],
        dogru: 0,
        aciklama: "İki çözelti karışınca çözünmeyen katı oluşması çökelme tepkimesidir.",
        sonuc: "🧪 Çökelme tepkimesi doğrulandı.",
      },
      {
        soru: "Çökeleği sıvıdan ayırmak için hangi yöntem kullanılır?",
        secenekler: ["Süzme (filtrasyon)", "Buharlaştırma", "Damıtma", "Mıknatısla ayırma"],
        dogru: 0,
        aciklama: "Süzme; çözünmeyen katıyı (çökelek) sıvıdan ayırır. AgCl süzgeç kâğıdında kalır.",
        sonuc: "🔻 Süzgeç kâğıdında beyaz AgCl katısı birikti.",
      },
    ],
    sonucMetni:
      "Sonuç: AgNO₃(aq) + NaCl(aq) → AgCl(k) + NaNO₃(aq). Suda çözünmeyen AgCl katısının oluşumu çökelme tepkimesinin kanıtıdır.",
  },
  {
    id: "ph-olcum",
    ad: "pH Ölçümü ve Asit-Baz Gücü",
    ciktiKodu: "KİM.11.2.5",
    amac: "Farklı çözeltilerin pH değerlerini karşılaştırarak asit-baz gücünü yorumlamak.",
    malzemeler: ["pH metre veya pH kağıdı", "Limon suyu", "Sabunlu su", "Saf su", "Güvenlik gözlüğü"],
    adimlar: [
      {
        soru: "pH ölçümü yapmadan önce hangi güvenlik adımı alınmalıdır?",
        secenekler: ["Koruyucu gözlük takmak", "Numuneleri birbirine karıştırmak", "Tadına bakmak", "Elleri numuneye sokmak"],
        dogru: 0,
        aciklama: "Kimyasal çözeltilerle çalışırken göz koruması zorunludur.",
        sonuc: "Güvenlik ekipmanı hazır.",
      },
      {
        soru: "Limon suyunun pH değeri yaklaşık 2–3 ise bu çözelti için ne söylenir?",
        secenekler: ["Asidiktir", "Baziktir", "Nötrdür", "Tuzlu sudur"],
        dogru: 0,
        aciklama: "pH < 7 asidik ortam gösterir.",
        sonuc: "Limon suyu asidik özellik gösterdi.",
      },
      {
        soru: "Sabunlu suyun pH değeri 9–10 aralığındaysa bu çözelti?",
        secenekler: ["Baziktir", "Asidiktir", "Nötrdür", "İyonik değildir"],
        dogru: 0,
        aciklama: "pH > 7 bazik ortam gösterir.",
        sonuc: "Sabunlu su bazik özellik gösterdi.",
      },
      {
        soru: "Saf suyun pH değeri 25°C'de yaklaşık kaçtır?",
        secenekler: ["7", "0", "14", "1"],
        dogru: 0,
        aciklama: "Nötr su 25°C'de pH ≈ 7'dir.",
        sonuc: "Saf su nötr olarak kaydedildi.",
      },
    ],
    sonucMetni:
      "Sonuç: pH ölçümü asit-baz gücünü sayısal olarak karşılaştırmamızı sağlar. pH < 7 asidik, pH > 7 bazik, pH ≈ 7 nötr çözeltidir.",
  },
  {
    id: "redoks-lehim",
    ad: "Redoks: Çinko-Bakır Pil Modeli",
    ciktiKodu: "KİM.12.1.5",
    amac: "Galvanik hücrede anot-katot olaylarını ve elektron akış yönünü yorumlamak.",
    malzemeler: ["Çinko levha", "Bakır levha", "CuSO₄ çözeltisi", "Bağlantı kabloları", "Voltmetre"],
    adimlar: [
      {
        soru: "Galvanik hücrede elektronlar hangi elektroda açığa çıkar?",
        secenekler: ["Anotta (yükseltgenme)", "Katotta (indirgenme)", "Tuz köprüsünde", "Voltmetrede"],
        dogru: 0,
        aciklama: "Anotta yükseltgenme olur; elektronlar dış devreye verilir.",
        sonuc: "Elektron akışı anottan başladı.",
      },
      {
        soru: "Cu²⁺ iyonları katotta ne olur?",
        secenekler: ["İndirgenerek Cu(l) oluşturur", "Yükseltgenerek O₂ verir", "Çözeltiden kaybolmaz", "Proton alır"],
        dogru: 0,
        aciklama: "Katotta indirgenme: Cu²⁺ + 2e⁻ → Cu.",
        sonuc: "Bakır levha üzerinde bakır birikimi gözlendi.",
      },
      {
        soru: "Çinko elektrot eriyorsa hangi süreç gerçekleşmiştir?",
        secenekler: ["Zn yükseltgenerek Zn²⁺ olur", "Zn indirgenir", "Cu yükseltgenir", "Tepkime durmuştur"],
        dogru: 0,
        aciklama: "Zn → Zn²⁺ + 2e⁻ (yükseltgenme, anot).",
        sonuc: "Çinko levha kütle kaybetti — redoks doğrulandı.",
      },
    ],
    sonucMetni:
      "Sonuç: Galvanik hücrede anotta yükseltgenme, katotta indirgenme olur. Elektronlar anottan katoda dış devre üzerinden akar.",
  },
];

export function getDeney(id: string): Deney | undefined {
  return DENEYLER.find((d) => d.id === id);
}
