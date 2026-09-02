import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export default async function SinifDetayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/giris");
  if (session.role !== "teacher") redirect("/harita");

  const { id } = await params;
  const sinifId = Number(id);
  if (!sinifId) notFound();

  const sinif = await prisma.class.findUnique({
    where: { id: sinifId },
    include: { teacher: true },
  });
  if (!sinif || sinif.teacherId !== session.id) notFound();

  // Öğrenciler + ilerlemeleri
  const members = await prisma.classStudent.findMany({
    where: { classId: sinifId },
    include: {
      user: {
        include: {
          progress: {
            select: { outcomeId: true, masteryScore: true, status: true, attempts: true },
          },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  // Üniteler + çıktılar (rapor için)
  const units = await prisma.unit.findMany({
    include: {
      theme: { include: { grade: true } },
      outcomes: { select: { id: true } },
    },
    orderBy: [{ theme: { gradeId: "asc" } }, { orderIndex: "asc" }],
  });

  // Sınıf raporu: ünite başına ortalama ustalık
  const unitRows = units.map((unit) => {
    const outcomeIds = unit.outcomes.map((o) => o.id);
    let toplamPuan = 0;
    let toplamCikti = 0;
    for (const m of members) {
      for (const outcomeId of outcomeIds) {
        const p = m.user.progress.find((x) => x.outcomeId === outcomeId);
        toplamPuan += p?.masteryScore ?? 0;
        toplamCikti++;
      }
    }
    const ort = toplamCikti > 0 ? Math.round(toplamPuan / toplamCikti) : 0;
    const katilan = members.filter((m) =>
      outcomeIds.some((oid) => m.user.progress.some((p) => p.outcomeId === oid && p.attempts > 0))
    ).length;
    return {
      id: unit.id,
      grade: unit.theme.grade.code,
      tema: unit.theme.name,
      ad: unit.name,
      ort,
      katilan,
      zayif: ort < 40,
    };
  });

  const toplamCiktiGenel = units.reduce((a, u) => a + u.outcomes.length, 0);
  const ogrenciRows = members.map((m) => {
    const mastered = m.user.progress.filter((p) => p.status === "mastered").length;
    const ustalikOrt =
      m.user.progress.length > 0
        ? Math.round(m.user.progress.reduce((a, p) => a + p.masteryScore, 0) / m.user.progress.length)
        : 0;
    return {
      id: m.userId,
      username: m.user.username,
      gradeCode: null,
      mastered,
      ustalikOrt,
      attempts: m.user.progress.reduce((a, p) => a + p.attempts, 0),
    };
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/panel" className="text-sm text-slate-400 hover:text-cyan-300">
            ← Panel
          </Link>
          <h1 className="mt-1 text-3xl font-black">{sinif.name}</h1>
          <p className="mt-1 text-sm text-slate-400">
            Davet kodu:{" "}
            <span className="rounded-lg bg-amber-500/15 px-2.5 py-1 font-mono text-lg font-bold tracking-widest text-amber-300">
              {sinif.inviteCode}
            </span>
            <span className="ml-2 text-xs">(öğrenciler /sinif sayfasından katılır)</span>
          </p>
        </div>
      </div>

      {/* Öğrenciler */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">
          Öğrenciler ({ogrenciRows.length})
        </h2>
        {ogrenciRows.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
            Henüz öğrenci katılmadı. Davet kodunu paylaş.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {ogrenciRows.map((o) => {
              const yuzde = toplamCiktiGenel > 0 ? Math.round((o.mastered / toplamCiktiGenel) * 100) : 0;
              return (
                <div key={o.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{o.username}</p>
                    <span className="text-xs text-slate-400">{o.attempts} deneme</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                      style={{ width: `${yuzde}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {o.mastered}/{toplamCiktiGenel} çıktıda ustalık · ort. ustalık %{o.ustalikOrt}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Ünite raporu */}
      <section className="mt-12">
        <h2 className="text-xl font-bold">Sınıf Raporu (ünite bazlı)</h2>
        <p className="mt-1 text-sm text-slate-400">
          Ortalama ustalık &lt; %40 olan üniteler <span className="font-bold text-rose-300">zayıf</span> işaretlenir.
        </p>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-left text-slate-400">
                <th className="px-4 py-3 font-medium">Sınıf</th>
                <th className="px-4 py-3 font-medium">Tema</th>
                <th className="px-4 py-3 font-medium">Ünite</th>
                <th className="px-4 py-3 text-right font-medium">Ort. Ustalık</th>
                <th className="px-4 py-3 text-right font-medium">Katılım</th>
              </tr>
            </thead>
            <tbody>
              {unitRows.map((u) => (
                <tr key={u.id} className="border-b border-slate-800/60 last:border-0 hover:bg-slate-900/40">
                  <td className="px-4 py-3">{u.grade}. sınıf</td>
                  <td className="px-4 py-3 text-slate-300">{u.tema}</td>
                  <td className="px-4 py-3 font-medium">
                    {u.ad}
                    {u.zayif && (
                      <span className="ml-2 rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-bold text-rose-300">
                        zayıf
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-bold ${
                        u.zayif ? "text-rose-300" : u.ort >= 80 ? "text-emerald-300" : "text-slate-200"
                      }`}
                    >
                      %{u.ort}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400">
                    {u.katilan}/{members.length} öğrenci
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
