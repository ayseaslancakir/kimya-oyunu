import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export default async function HaritaPage() {
  const session = await getSession();
  if (!session) redirect("/giris");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { username: true, xp: true },
  });

  const grades = await prisma.grade.findMany({
    where: { curriculum: { isActive: true } },
    orderBy: { code: "asc" },
    include: {
      themes: {
        orderBy: { orderIndex: "asc" },
        include: {
          units: {
            orderBy: { orderIndex: "asc" },
            include: { outcomes: { select: { id: true } } },
          },
        },
      },
    },
  });

  const progress = await prisma.userProgress.findMany({
    where: { userId: session.id },
    select: { outcomeId: true, status: true, masteryScore: true },
  });
  const progressMap = new Map(progress.map((p) => [p.outcomeId, p]));

  const TEMA_RENK: Record<string, string> = {
    Etkileşim: "border-cyan-500/40 bg-cyan-500/10",
    Çeşitlilik: "border-emerald-500/40 bg-emerald-500/10",
    Sürdürülebilirlik: "border-amber-500/40 bg-amber-500/10",
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-black">Müfredat Haritası</h1>
          <p className="mt-1 text-slate-400">
            Hoş geldin, <span className="font-semibold text-slate-200">{user?.username}</span>! Bir ünite seç ve oyna.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-right">
          <p className="text-2xl font-black text-cyan-400">{user?.xp ?? 0}</p>
          <p className="text-xs text-slate-400">Toplam XP</p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {grades.map((grade) => (
          <section key={grade.id} className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-xl font-bold">{grade.code}. Sınıf</h2>
            <div className="mt-4 grid gap-4">
              {grade.themes.map((theme) => {
                const toplam = theme.units.reduce((a, u) => a + u.outcomes.length, 0);
                const tamamlanan = theme.units.reduce(
                  (a, u) => a + u.outcomes.filter((o) => progressMap.get(o.id)?.status === "mastered").length,
                  0
                );
                const yuzde = toplam > 0 ? Math.round((tamamlanan / toplam) * 100) : 0;

                return (
                  <div key={theme.id} className={`rounded-2xl border p-4 ${TEMA_RENK[theme.name] ?? "border-slate-700"}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{theme.name}</h3>
                      <span className="text-xs text-slate-400">
                        {tamamlanan}/{toplam} çıktı
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
                        style={{ width: `${yuzde}%` }}
                      />
                    </div>

                    <div className="mt-3 grid gap-2">
                      {theme.units.map((unit) => {
                        const uToplam = unit.outcomes.length;
                        const uTamam = unit.outcomes.filter(
                          (o) => progressMap.get(o.id)?.status === "mastered"
                        ).length;
                        const uYuzde = uToplam > 0 ? Math.round((uTamam / uToplam) * 100) : 0;
                        const ort = unit.outcomes.reduce(
                          (a, o) => a + (progressMap.get(o.id)?.masteryScore ?? 0),
                          0
                        );
                        const ortMastery = uToplam > 0 ? Math.round(ort / uToplam) : 0;

                        return (
                          <div
                            key={unit.id}
                            className="flex items-center justify-between gap-2 rounded-xl bg-slate-800/70 px-4 py-2.5"
                          >
                            <Link
                              href={`/oyun/quiz?unitId=${unit.id}`}
                              className="group flex flex-1 items-center justify-between"
                            >
                              <span className="text-sm font-medium group-hover:text-cyan-300">
                                {unit.name}
                                <span className="ml-2 text-xs text-slate-500">{uYuzde}%</span>
                              </span>
                              <span className="flex items-center gap-3">
                                {ortMastery > 0 && (
                                  <span className="text-xs text-slate-400">ustalık %{ortMastery}</span>
                                )}
                                <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-xs font-bold text-cyan-300">
                                  Oyna ▶
                                </span>
                              </span>
                            </Link>
                            <Link
                              href={`/oyun/kacis?unitId=${unit.id}`}
                              title="Lab Kaçış Odası"
                              className="rounded-lg border border-rose-500/30 px-2 py-1 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/15"
                            >
                              🚪
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
