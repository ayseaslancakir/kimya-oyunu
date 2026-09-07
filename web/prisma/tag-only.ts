// Tek seferlik yardımcı: etiketleri sıfırlayıp dengeli şekilde yeniden dağıtır.
// Kullanım: npm run db:tag  (veya: npx tsx prisma/tag-only.ts)
import { PrismaClient } from "@prisma/client";
import { kacisHavuzunuEtiketle } from "./tag-kacis-pool";

const prisma = new PrismaClient();

async function main() {
  const sifirlanan = await prisma.question.updateMany({ data: { kullanim: "quiz" } });
  console.log(`↺ ${sifirlanan.count} soru "quiz" olarak sıfırlandı.`);
  const etiket = await kacisHavuzunuEtiketle(prisma);
  console.log(`🚪 ${etiket} soru "kacis" olarak etiketlendi.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
