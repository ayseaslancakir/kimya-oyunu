import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Bulmaca, { type BulmacaKarti } from "@/components/Bulmaca";

export default async function BulmacaPage({
  searchParams,
}: {
  searchParams: Promise<{ unitId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/giris");

  // unitId isteğe bağlı: verilirse kartlar o ünitenin sorularından (soru ↔ doğru cevap) üretilir.
  const { unitId } = await searchParams;
  const id = Number(unitId);
  const unit =
    unitId && Number.isFinite(id) && id > 0
      ? await prisma.unit.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            theme: { select: { name: true, grade: { select: { code: true } } } },
          },
        })
      : null;
  if (unitId && !unit) redirect("/harita");

  let kartlar: BulmacaKarti[] | undefined;
  if (unit) {
    const sorular = await prisma.question.findMany({
      where: { kullanim: "quiz", outcome: { unitId: unit.id } },
      select: { prompt: true, options: { select: { text: true, isCorrect: true } } },
      orderBy: { id: "asc" },
    });

    kartlar = [];
    const gorulenCevaplar = new Set<string>();
    for (const soru of sorular) {
      const cevap = (soru.options.find((o) => o.isCorrect)?.text ?? "").trim();
      // Aynı cevap iki kez kart olmasın (eşleştirme net kalsın).
      if (!cevap || gorulenCevaplar.has(cevap)) continue;
      gorulenCevaplar.add(cevap);
      kartlar.push({ sol: soru.prompt.trim(), sag: cevap });
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {unit && (
        <div className="mb-2 text-sm text-slate-500">
          🧩 Bulmaca → {unit.theme.grade.code}. sınıf · {unit.theme.name} · {unit.name}
        </div>
      )}
      <Bulmaca unitId={unit?.id} unitName={unit?.name} kartlar={kartlar} />
    </main>
  );
}
