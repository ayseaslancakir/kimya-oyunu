import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import DuelKur from "@/components/DuelKur";

export default async function DuelPage() {
  const session = await getSession();
  if (!session) redirect("/giris");

  const units = await prisma.unit.findMany({
    include: {
      theme: { include: { grade: true } },
      _count: { select: { outcomes: true } },
      outcomes: { select: { _count: { select: { questions: true } } } },
    },
    orderBy: [{ theme: { gradeId: "asc" } }, { orderIndex: "asc" }],
  });

  const uniteler = units
    .map((u) => ({
      id: u.id,
      adi: u.name,
      tema: u.theme.name,
      sinif: u.theme.grade.code,
      soruSayisi: u.outcomes.reduce((a, o) => a + o._count.questions, 0),
    }))
    .filter((u) => u.soruSayisi >= 3);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">⚔️ Canlı Düello</h1>
          <p className="mt-1 text-slate-400">
            Bir ünite seç, davet kodunu paylaş; rakibinle aynı soruları çözüp skorunu karşılaştır.
          </p>
        </div>
        <Link
          href="/harita"
          className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold transition hover:border-slate-400"
        >
          ← Harita
        </Link>
      </div>

      {uniteler.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
          Düello için yeterli soruya sahip ünite yok. Önce soru bankasını doldur.
        </p>
      ) : (
        <DuelKur uniteler={uniteler} />
      )}

      <p className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-center text-sm text-slate-400">
        Davet koduyla katılmak için:{" "}
        <Link href="/oyun/duel/katil" className="font-semibold text-rose-300 hover:underline">
          /oyun/duel/katil
        </Link>
      </p>
    </main>
  );
}
