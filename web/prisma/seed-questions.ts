// 9. sınıf Tema 1 (Etkileşim) için örnek soru bankası.
// Kullanım: npm run db:seed-questions
import { PrismaClient } from "@prisma/client";
import { EK_SORULAR } from "./questions-bank-extra";

const prisma = new PrismaClient();

type Soru = {
  kod: string; // öğrenme çıktısı kodu: KİM.9.1.x
  zorluk: number; // 1-5
  soru: string;
  aciklama: string;
  secenekler: string[]; // 4 seçenek
  dogru: number; // doğru seçeneğin indeksi
};

const SORULAR: Soru[] = [
  // ---- KİM.9.1.1 Kimya biliminin günlük hayata katkısı ----
  {
    kod: "KİM.9.1.1",
    zorluk: 1,
    soru: "Aşağıdakilerden hangisi kimya biliminin günlük hayata katkılarına bir örnektir?",
    aciklama: "Temizlik ürünlerinin içeriği ve güvenli kullanımı kimya biliminin günlük hayata katkısıdır. Uçak kanadı tasarımı fizik/mühendislik, internet ağı bilişim alanıdır.",
    secenekler: [
      "Evde kullanılan temizlik ürünlerinin içerik ve güvenli kullanımının belirlenmesi",
      "Uçak kanatlarının aerodinamik tasarımı",
      "İnternet ağının hızlandırılması",
      "Akıllı telefonların yazılım geliştirilmesi",
    ],
    dogru: 0,
  },
  {
    kod: "KİM.9.1.1",
    zorluk: 2,
    soru: "Hangisi kimyanın bir alt disiplinidir?",
    aciklama: "Analitik kimya, maddelerin bileşimini ve miktarını inceleyen kimya alt disiplinidir. Diğer seçenekler fizik ve biyoloji alanlarıdır.",
    secenekler: ["Analitik kimya", "Termodinamik", "Genetik", "Mekanik"],
    dogru: 0,
  },
  // ---- KİM.9.1.2 Kimyasal maddelerin kullanımı ve güvenlik ----
  {
    kod: "KİM.9.1.2",
    zorluk: 1,
    soru: "Laboratuvarda kimyasal madde kullanırken hangisi GÜVENLİ bir davranıştır?",
    aciklama: "Kimyasal maddelerin etiketleri (GHS piktogramları) tehlikeler hakkında bilgi verir. Maddeler asla koklanmaz ve tadına bakılmaz.",
    secenekler: [
      "Maddenin üzerindeki güvenlik etiketlerini okumak",
      "Maddeyi koklayarak tanımaya çalışmak",
      "Maddenin tadına bakmak",
      "Koruyucu ekipman olmadan çalışmak",
    ],
    dogru: 0,
  },
  {
    kod: "KİM.9.1.2",
    zorluk: 2,
    soru: "Tehlike piktogramı üzerinde alev sembolü bulunan bir kimyasal madde için hangisi söylenebilir?",
    aciklama: "Alev sembolü yanıcı madde anlamına gelir; ateş ve ısı kaynaklarından uzak tutulmalıdır.",
    secenekler: [
      "Yanıcı olduğu için ateşten uzak tutulmalıdır",
      "Sadece su ile temas etmemelidir",
      "Zehirli olduğu için asla kullanılmamalıdır",
      "Radyoaktif olduğu anlamına gelir",
    ],
    dogru: 0,
  },
  // ---- KİM.9.1.3 Atom teorileri ve bilimsel bilginin değişebilirliği ----
  {
    kod: "KİM.9.1.3",
    zorluk: 2,
    soru: "Bohr atom teorisine göre elektronlar atomda nasıl bulunur?",
    aciklama: "Bohr'a göre elektronlar çekirdek çevresinde belirli enerji düzeylerinde (yörüngelerde) döner. Modern atom teorisinde bu yerini orbital kavramına bırakmıştır.",
    secenekler: [
      "Belirli enerji düzeylerinde (yörüngelerde) döner",
      "Çekirdekte protonlarla birlikte bulunur",
      "Rastgele ve sürekli değişen yollarda hareket eder",
      "Atomu oluşturan tek taneciktir",
    ],
    dogru: 0,
  },
  {
    kod: "KİM.9.1.3",
    zorluk: 3,
    soru: "Atom modellerinin zaman içinde (Dalton → Thomson → Rutherford → Bohr → Modern) değişmesinin temel nedeni nedir?",
    aciklama: "Bilimsel bilgi; yeni deneyler, gözlemler ve kanıtlar ışığında sürekli güncellenir. Bu durum bilimsel bilginin değişebilirliğini gösterir.",
    secenekler: [
      "Yeni deney ve gözlemlerin yapılması",
      "Eski bilim insanlarının hata yapması",
      "Kitapların yeniden basılması",
      "Matematiksel formüllerin değişmesi",
    ],
    dogru: 0,
  },
  // ---- KİM.9.1.4 Atom orbitallerinin bağıl enerjileri ----
  {
    kod: "KİM.9.1.4",
    zorluk: 2,
    soru: "Elektronlar orbitallere yerleştirilirken hangi ilkeye göre önce en düşük enerjili orbitaller doldurulur?",
    aciklama: "Aufbau (yapılandırma) ilkesi: elektronlar en düşük enerjili orbitalden başlanarak yerleştirilir.",
    secenekler: ["Aufbau ilkesi", "Hund kuralı", "Pauli dışlama ilkesi", "Avogadro yasası"],
    dogru: 0,
  },
  {
    kod: "KİM.9.1.4",
    zorluk: 1,
    soru: "Bir orbitalde en fazla kaç elektron bulunabilir?",
    aciklama: "Pauli dışlama ilkesine göre bir orbitalde en fazla 2 elektron bulunur ve bu elektronların spinleri zıttır.",
    secenekler: ["2", "1", "8", "18"],
    dogru: 0,
  },
  // ---- KİM.9.1.5 Elektron dizilimi ----
  {
    kod: "KİM.9.1.5",
    zorluk: 3,
    soru: "1s² 2s² 2p⁶ 3s¹ elektron dizilimi hangi elemente aittir?",
    aciklama: "Toplam elektron sayısı 11'dir → Sodyum (Na). Atom numarası 11 olan element sodyumdur.",
    secenekler: ["Sodyum (Na)", "Magnezyum (Mg)", "Alüminyum (Al)", "Neon (Ne)"],
    dogru: 0,
  },
  {
    kod: "KİM.9.1.5",
    zorluk: 2,
    soru: "Hund kuralına göre eş enerjili (aynı alt kabuktaki) orbitallere elektronlar nasıl yerleşir?",
    aciklama: "Hund kuralı: eş enerjili orbitallere elektronlar önce birer birer (aynı spinli) yerleşir, sonra çiftlenir.",
    secenekler: [
      "Önce birer birer, aynı spin yönünde yerleşir",
      "Hepsi aynı orbitale dolar",
      "Önce zıt spinli çiftler oluşturur",
      "Rastgele sırayla yerleşir",
    ],
    dogru: 0,
  },
  // ---- KİM.9.1.6 Periyodik tabloda yer bulma ----
  {
    kod: "KİM.9.1.6",
    zorluk: 3,
    soru: "Elektron dizilimi 2-8-2 olan element periyodik tabloda nerede bulunur?",
    aciklama: "3 katman (enerji düzeyi) → 3. periyot; son katmanda 2 elektron → 2A grubu. Bu element magnezyumdur (Mg).",
    secenekler: ["3. periyot, 2A grubu", "2. periyot, 2A grubu", "3. periyot, 8A grubu", "2. periyot, 8A grubu"],
    dogru: 0,
  },
  {
    kod: "KİM.9.1.6",
    zorluk: 2,
    soru: "Periyodik tabloda bir elementin PERİYOT numarası neyi gösterir?",
    aciklama: "Periyot numarası, elementin sahip olduğu enerji düzeyi (katman) sayısını gösterir.",
    secenekler: [
      "Enerji düzeyi (katman) sayısını",
      "Proton sayısını",
      "Nötron sayısını",
      "Valans elektron sayısını",
    ],
    dogru: 0,
  },
  // ---- KİM.9.1.7 İyon oluşumu ----
  {
    kod: "KİM.9.1.7",
    zorluk: 2,
    soru: "Bir atom elektron verdiğinde aşağıdakilerden hangisi oluşur?",
    aciklama: "Elektron veren atom pozitif yüklü KATYON olur (örn. Na → Na⁺). Elektron alan atom ise negatif yüklü anyon olur.",
    secenekler: ["Pozitif yüklü katyon", "Negatif yüklü anyon", "Nötr atom", "Molekül"],
    dogru: 0,
  },
  // ---- KİM.9.1.8 Periyodik özellikler ----
  {
    kod: "KİM.9.1.8",
    zorluk: 2,
    soru: "Periyodik tabloda soldan sağa doğru gidildikçe atom yarıçapı genellikle nasıl değişir?",
    aciklama: "Soldan sağa gidildikçe çekirdek yükü artar, elektronlar çekirdeğe daha güçlü çekilir ve atom yarıçapı genellikle AZALIR.",
    secenekler: ["Azalır", "Artar", "Değişmez", "Önce artar, sonra azalır"],
    dogru: 0,
  },
  {
    kod: "KİM.9.1.8",
    zorluk: 3,
    soru: "Aynı grupta yukarıdan aşağıya inildikçe iyonlaşma enerjisi genellikle nasıl değişir?",
    aciklama: "Aşağı inildikçe atom yarıçapı artar, elektron çekirdekten uzaklaşır ve elektron koparmak kolaylaşır → iyonlaşma enerjisi AZALIR.",
    secenekler: ["Azalır", "Artar", "Değişmez", "Düzensiz artar"],
    dogru: 0,
  },
];

const TUM_SORULAR = [...SORULAR, ...EK_SORULAR];

async function main() {
  let eklenen = 0;
  let atlanan = 0;

  for (const s of TUM_SORULAR) {
    const outcome = await prisma.learningOutcome.findUnique({ where: { code: s.kod } });
    if (!outcome) {
      console.warn(`  ⚠️ Çıktı bulunamadı: ${s.kod} (atlandı)`);
      atlanan++;
      continue;
    }

    const mevcut = await prisma.question.findFirst({
      where: { prompt: s.soru, outcomeId: outcome.id },
    });
    if (mevcut) {
      atlanan++;
      continue;
    }

    await prisma.question.create({
      data: {
        outcomeId: outcome.id,
        type: "multiple_choice",
        prompt: s.soru,
        difficulty: s.zorluk,
        explanation: s.aciklama,
        options: {
          create: s.secenekler.map((text, i) => ({
            text,
            isCorrect: i === s.dogru,
            orderIndex: i + 1,
          })),
        },
      },
    });
    eklenen++;
  }

  console.log(`\n✅ Soru bankası: ${eklenen} soru eklendi, ${atlanan} atlandı.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
