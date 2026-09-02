import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ELEMENTS } from "@/data/elements";

export default async function KoleksiyonPage() {
  const session = await getSession();
  if (!session) redirect("/giris");

  const owned = await prisma.inventoryItem.findMany({
    where: { userId: session.id, itemType: "element" },
    select: { itemKey: true },
  });
  const ownedSet = new Set(owned.map((o) => o.itemKey));

  const achievements = await prisma.userAchievement.findMany({
    where: { userId: session.id },
    include: { achievement: true },
  });

  const toplam = ELEMENTS.length;
  const sahip = ELEMENTS.filter((e) => ownedSet.has(e.symbol)).length;
  const yuzde = Math.round((sahip / toplam) * 100);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black">🧫 Element Koleksiyonu</h1>
          <p className="mt-1 text-slate-400">
            İyi turlar bitirdikçe element kartları kazanırsın.
          </p>
        </div>
        <Link
          href="/harita"
          className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold transition hover:border-slate-400"
        >
          ← Harita
        </Link>
      </div>

      <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">
            {sahip}/{toplam} element
          </span>
          <span className="text-cyan-300">%{yuzde}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
            style={{ width: `${yuzde}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9">
        {ELEMENTS.map((e) => {
          const sahipMi = ownedSet.has(e.symbol);
          return (
            <div
              key={e.symbol}
              className={`rounded-2xl border p-3 text-center transition ${
                sahipMi
                  ? "border-cyan-500/50 bg-cyan-500/10"
                  : "border-slate-800 bg-slate-900/40 opacity-40 grayscale"
              }`}
              title={e.name}
            >
              <p className="text-xs text-slate-500">{e.number}</p>
              <p className="text-xl font-black">{e.symbol}</p>
              <p className="truncate text-xs text-slate-400">{e.name}</p>
            </div>
          );
        })}
      </div>

      {/* Rozetler */}
      <h2 className="mt-14 text-2xl font-bold">🏅 Rozetlerim</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.length === 0 ? (
          <p className="text-sm text-slate-500">Henüz rozet kazanmadın. Oyna ve kazan!</p>
        ) : (
          achievements.map((ua) => (
            <div
              key={ua.achievement.id}
              className="flex items-center gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4"
            >
              <span className="text-3xl">{ua.achievement.icon}</span>
              <div>
                <p className="font-semibold">{ua.achievement.name}</p>
                <p className="text-xs text-slate-400">{ua.achievement.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
