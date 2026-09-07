// Kaçış Odası havuzu: her temada birkaç soru "kacis" olarak etiketlenir.
// Böylece kaçış soruları quiz sorularından ayrılır (quiz/kacis aynı soruyu kullanmaz).
// seed-questions.ts içinde, tüm sorular eklendikten SONRA çağrılır (idempotent, dengeli).
import type { PrismaClient } from "@prisma/client";

const HEDEF_TEMA_BASI = 5; // her temada hedeflenen kaçış sorusu sayısı
const MIN_QUIZ_BIRIM = 4; // bir ünitede quiz için bırakılacak minimum soru

export async function kacisHavuzunuEtiketle(prisma: PrismaClient) {
  const [sorular, uniteler] = await Promise.all([
    prisma.question.findMany({
      select: { id: true, kullanim: true, outcome: { select: { unitId: true } } },
    }),
    prisma.unit.findMany({ select: { id: true, themeId: true } }),
  ]);

  const unitTheme = new Map(uniteler.map((u) => [u.id, u.themeId]));
  const themeIds = [...new Set(uniteler.map((u) => u.themeId))];
  let toplamEtiket = 0;

  for (const themeId of themeIds) {
    const temaSorulari = sorular.filter((q) => unitTheme.get(q.outcome.unitId) === themeId);

    // Yetkili sayaçlar (her seçimde güncellenir — yanlış yığılmayı önler)
    const quizSayisi = new Map<number, number>();
    const kacisSayisi = new Map<number, number>();
    temaSorulari.forEach((q) => {
      const uid = q.outcome.unitId;
      if (q.kullanim === "kacis") kacisSayisi.set(uid, (kacisSayisi.get(uid) ?? 0) + 1);
      else quizSayisi.set(uid, (quizSayisi.get(uid) ?? 0) + 1);
    });

    let mevcutKacis = [...kacisSayisi.values()].reduce((a, b) => a + b, 0);
    let gerekli = HEDEF_TEMA_BASI - mevcutKacis;
    if (gerekli <= 0) continue;

    // Aday sorular: quiz etiketli (ünite bazlı sıralı — tutarlı seçim için)
    const adaylar = temaSorulari
      .filter((q) => q.kullanim === "quiz")
      .sort((a, b) => a.outcome.unitId - b.outcome.unitId || a.id - b.id);

    let guard = 0;
    while (gerekli > 0 && guard++ < 100) {
      // Uygun ünite: etiket sonrası MIN_QUIZ_BIRIM quiz kalmalı
      const uygun = [...quizSayisi.keys()].filter(
        (uid) => (quizSayisi.get(uid) ?? 0) - 1 >= MIN_QUIZ_BIRIM
      );
      if (uygun.length === 0) break;

      // En az kacis etiketli üniteyi seç; eşitse en çok quiz'i olanı (yayılım)
      const secilenBirim = uygun.sort(
        (a, b) =>
          (kacisSayisi.get(a) ?? 0) - (kacisSayisi.get(b) ?? 0) ||
          (quizSayisi.get(b) ?? 0) - (quizSayisi.get(a) ?? 0)
      )[0];

      const aday = adaylar.find((q) => q.outcome.unitId === secilenBirim);
      if (!aday) break;

      await prisma.question.update({ where: { id: aday.id }, data: { kullanim: "kacis" } });
      adaylar.splice(adaylar.indexOf(aday), 1); // bir daha seçilmesin
      quizSayisi.set(secilenBirim, (quizSayisi.get(secilenBirim) ?? 0) - 1);
      kacisSayisi.set(secilenBirim, (kacisSayisi.get(secilenBirim) ?? 0) + 1);
      toplamEtiket++;
      gerekli--;
    }
  }

  return toplamEtiket;
}
