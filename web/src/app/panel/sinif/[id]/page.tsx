import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const SON_AKTIF_GUN = 7; // "son 7 günde aktif" bloğu için pencere

function tarihKisa(t: Date): string {
  return `${t.getDate()}.${t.getMonth() + 1}.${t.getFullYear()}`;
}

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

  // ---- Son 7 gün aktivitesi: cevaplar (UserProgress) + bitirilen turlar (Score) ----
  const yediGunOnce = new Date(Date.now() - SON_AKTIF_GUN * 24 * 60 * 60 * 1000);
  const uyeIdler = members.map((m) => m.userId);

  const [cevapAktivite, turAktivite] = await Promise.all([
    uyeIdler.length > 0
      ? prisma.userProgress.groupBy({
          by: ["userId"],
          where: { userId: { in: uyeIdler }, lastAttemptAt: { gte: yediGunOnce } },
          _max: { lastAttemptAt: true },
        })
      : Promise.resolve([] as { userId: number; _max: { lastAttemptAt: Date | null } }[]),
    uyeIdler.length > 0
      ? prisma.score.groupBy({
          by: ["userId"],
          where: { userId: { in: uyeIdler }, playedAt: { gte: yediGunOnce } },
          _max: { playedAt: true },
        })
      : Promise.resolve([] as { userId: number; _max: { playedAt: Date | null } }[]),
  ]);

  const sonAktivite = new Map<number, Date>();
  for (const satir of cevapAktivite) {
    if (satir._max.lastAttemptAt) sonAktivite.set(satir.userId, satir._max.lastAttemptAt);
  }
  for (const satir of turAktivite) {
    if (!satir._max.playedAt) continue;
    const mevcut = sonAktivite.get(satir.userId);
    if (!mevcut || satir._max.playedAt > mevcut) sonAktivite.set(satir.userId, satir._max.playedAt);
  }

  // (1) hiç oynamamış · (2) ortalaması %40 altı (en az bir öğrenci oynamış) · (3) son 7 günde aktif
  const hicOynamayanlar = ogrenciRows.filter((o) => o.attempts === 0);
  const zayifUniteler = unitRows
    .filter((u) => u.katilan > 0 && u.ort < 40)
    .sort((a, b) => a.ort - b.ort);
  const katilimsizUniteSayisi = unitRows.filter((u) => u.katilan === 0).length;
  const sonYediGunAktif = members
    .map((m) => ({ id: m.userId, username: m.user.username, son: sonAktivite.get(m.userId) ?? null }))
    .filter((o): o is { id: number; username: string; son: Date } => o.son !== null)
    .sort((a, b) => b.son.getTime() - a.son.getTime());

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

      {/* Rapor blokları: (1) hiç oynamayanlar · (2) ortalaması %40 altı üniteler · (3) son 7 günde aktif */}
      <section className="mt-12">
        <h2 className="text-xl font-bold">Özet Bloklar</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {/* (1) Hiç oynamamış öğrenciler */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <h3 className="font-semibold text-slate-200">
              🎯 Hiç Oynamamış Öğrenciler{" "}
              <span className="text-sm font-normal text-slate-400">({hicOynamayanlar.length})</span>
            </h3>
            {hicOynamayanlar.length === 0 ? (
              <p className="mt-3 text-sm text-emerald-300">✅ Sınıftaki herkes en az bir kez oynamış.</p>
            ) : (
              <ul className="mt-3 grid gap-1.5 text-sm">
                {hicOynamayanlar.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-slate-800/60 px-3 py-1.5"
                  >
                    <span className="font-medium text-slate-200">{o.username}</span>
                    <span className="text-xs text-rose-300">0 deneme</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* (2) Sınıf ortalaması %40 altındaki üniteler */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <h3 className="font-semibold text-slate-200">
              ⚠️ Ortalaması %40 Altındaki Üniteler{" "}
              <span className="text-sm font-normal text-slate-400">({zayifUniteler.length})</span>
            </h3>
            {zayifUniteler.length === 0 ? (
              <p className="mt-3 text-sm text-emerald-300">✅ Oynanan ünitelerin tümü %40 üzerinde.</p>
            ) : (
              <ul className="mt-3 grid gap-1.5 text-sm">
                {zayifUniteler.map((u) => (
                  <li key={u.id} className="rounded-lg bg-rose-500/10 px-3 py-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-slate-200">
                        {u.grade}. sınıf · {u.ad}
                      </span>
                      <span className="font-bold text-rose-300">%{u.ort}</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {u.tema} · {u.katilan}/{members.length} öğrenci oynadı
                    </p>
                  </li>
                ))}
              </ul>
            )}
            {katilimsizUniteSayisi > 0 && (
              <p className="mt-3 text-xs text-slate-500">
                Ayrıca {katilimsizUniteSayisi} üniteye sınıftan hiç katılım yok.
              </p>
            )}
          </div>

          {/* (3) Son 7 günde aktif olanlar */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
            <h3 className="font-semibold text-slate-200">
              🔥 Son {SON_AKTIF_GUN} Günde Aktif{" "}
              <span className="text-sm font-normal text-slate-400">({sonYediGunAktif.length})</span>
            </h3>
            {sonYediGunAktif.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">Son 7 günde hiçbir öğrenci oynamadı.</p>
            ) : (
              <ul className="mt-3 grid gap-1.5 text-sm">
                {sonYediGunAktif.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-emerald-500/10 px-3 py-1.5"
                  >
                    <span className="font-medium text-slate-200">{o.username}</span>
                    <span className="text-xs text-emerald-300">son: {tarihKisa(o.son)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
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
