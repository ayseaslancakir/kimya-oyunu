import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

// TYMM Kimya programından DOĞRULANMIŞ tema yapısı
// Kaynak: https://tymm.meb.gov.tr/ogretim-programlari/ders/kimya-dersi
const THEMES = ["Etkileşim", "Çeşitlilik", "Sürdürülebilirlik"];
const GRADE_CODES = [9, 10, 11, 12];

async function main() {
  // 1) Müfredat sürümü
  const curriculum = await prisma.curriculum.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "TYMM Kimya Dersi",
      version: "2026",
      sourceUrl: "https://mufredat.meb.gov.tr/ProgramDetay.aspx?PID=2255",
    },
  });
  console.log(`📚 Müfredat: ${curriculum.name} (${curriculum.version})`);

  // 2) Sınıflar + temalar + (varsa) ünite ve öğrenme çıktıları
  const jsonPath = path.join(process.cwd(), "..", "data", "curriculum", "tymm_kimya_2026.json");
  const curriculumData = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, "utf-8")) : null;

  for (const code of GRADE_CODES) {
    const grade = await prisma.grade.upsert({
      where: { curriculumId_code: { curriculumId: curriculum.id, code } },
      update: {},
      create: { curriculumId: curriculum.id, code },
    });

    for (const [index, themeName] of THEMES.entries()) {
      const theme = await prisma.theme.upsert({
        where: { gradeId_orderIndex: { gradeId: grade.id, orderIndex: index + 1 } },
        update: {},
        create: { gradeId: grade.id, name: themeName, orderIndex: index + 1 },
      });

      const jsonTheme = curriculumData?.siniflar
        ?.find((s: { kod: number }) => s.kod === code)
        ?.temalar?.find((t: { sira: number }) => t.sira === index + 1);

      if (jsonTheme) {
        // Üniteler (bölümler)
        const unitMap = new Map();
        for (const [ui, unit] of (jsonTheme.uniteler ?? []).entries()) {
          const created = await prisma.unit.upsert({
            where: { themeId_name: { themeId: theme.id, name: unit.adi } },
            update: {},
            create: { themeId: theme.id, name: unit.adi, orderIndex: ui + 1 },
          });
          unitMap.set(unit.adi, created);
        }

        // Öğrenme çıktıları (çıktı → ünite eşlemesi JSON'daki unitAdi ile)
        for (const outcome of jsonTheme.ogrenmeCiktilar ?? []) {
          const unit = unitMap.get(outcome.unitAdi) ?? unitMap.values().next().value;
          if (!unit) continue;
          await prisma.learningOutcome.upsert({
            where: { code: outcome.kod },
            update: { description: outcome.metin, cognitiveLevel: outcome.bilisselDuzey, unitId: unit.id },
            create: {
              unitId: unit.id,
              code: outcome.kod,
              description: outcome.metin,
              cognitiveLevel: outcome.bilisselDuzey,
            },
          });
        }
        console.log(`  ✅ ${code}. sınıf · ${themeName} (${jsonTheme.ogrenmeCiktilar.length} çıktı)`);
      } else {
        console.log(`  ✅ ${code}. sınıf + 3 tema`);
      }
    }
  }

  // 3) Oyun modları (Faz 1-2 seti; yenileri eklenir)
  const modes = [
    { slug: "quiz_arena", name: "Quiz Arena", description: "Bilgi düellosu: süreli, combo'lu tur" },
    { slug: "hiz_yarisi", name: "Hız Yarışı", description: "Refleks + bilgi: 60 saniyelik arcade tur" },
    { slug: "bulmaca", name: "Bulmaca Krallığı", description: "Sembol ↔ isim eşleştirme bulmacası" },
    { slug: "kacis_odasi", name: "Lab Kaçış Odası", description: "Ünite sonu senaryo: 5 bulmaca, süre ve can" },
    { slug: "sanal_lab", name: "Sanal Laboratuvar", description: "Güvenli deney simülasyonu: adım adım prosedür" },
    { slug: "duel", name: "Canlı Düello", description: "İki oyuncu aynı soruları çözer, skor karşılaştırması" },
  ];
  for (const mode of modes) {
    await prisma.gameMode.upsert({
      where: { slug: mode.slug },
      update: {},
      create: mode,
    });
  }
  console.log(`🎮 Oyun modları: ${modes.map((m) => m.slug).join(", ")}`);

  // 4) Rozetler (başarımlar)
  const achievements = [
    { slug: "ilk-tur", name: "İlk Tur", description: "İlk oyun turunu tamamla", icon: "🎯" },
    { slug: "yuzde-100", name: "Mükemmel Tur", description: "Bir turda %100 doğruluk yakala", icon: "💯" },
    { slug: "seri-5", name: "Ateş Serisi", description: "Tek turda 5'li doğru serisi yap", icon: "🔥" },
    { slug: "seri-10", name: "Alev Serisi", description: "Tek turda 10'lu doğru serisi yap", icon: "🚀" },
    { slug: "ilk-usta", name: "İlk Ustalık", description: "İlk öğrenme çıktısında ustalaş (%80)", icon: "🏅" },
  ];
  for (const a of achievements) {
    await prisma.achievement.upsert({
      where: { slug: a.slug },
      update: {},
      create: a,
    });
  }
  console.log(`🏅 Rozetler: ${achievements.map((a) => a.slug).join(", ")}`);

  console.log("\n✅ Seed tamamlandı.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
