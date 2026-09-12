import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ELEMENTS } from "@/data/elements";
import { PERIODIC_TABLE } from "@/data/periodic-table";

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
            {sahip}/{toplam} kazanılabilir element
          </span>
          <span className="text-cyan-300">%{yuzde}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
            style={{ width: `${yuzde}%` }}
          />
        </div>
        <p className="mt-3 text-sm text-slate-400">
          Tabloda 118 elementin tamamı görünür.{" "}
          <span className="font-bold text-cyan-300">Kalın ve renkli</span> olanlar senin kazandığın elementler; soluk
          olanlar henüz kazanılmadı.
        </p>
      </div>

      {/* Gerçek periyodik tablo yerleşimi: 18 grup × 7 periyot + f bloğu (lantanit/aktinit) */}
      <div className="mt-6 overflow-x-auto">
        <div
          className="grid min-w-[900px] gap-1"
          style={{
            gridTemplateColumns: "repeat(18, minmax(0, 1fr))",
            gridTemplateRows: "repeat(10, minmax(0, auto))",
          }}
        >
          {PERIODIC_TABLE.map((e) => {
            const sahipMi = ownedSet.has(e.symbol);
            return (
              <div
                key={e.number}
                title={`${e.number} · ${e.name}`}
                style={{ gridColumn: e.group, gridRow: e.period }}
                className={`rounded-lg border px-1 py-1 text-center leading-tight transition ${
                  sahipMi
                    ? "border-cyan-500/60 bg-cyan-500/10 hover:bg-cyan-500/20"
                    : "border-slate-800 bg-slate-900/40 opacity-40 grayscale"
                }`}
              >
                <p className="text-[9px] text-slate-500">{e.number}</p>
                <p className={`text-sm ${sahipMi ? "font-black text-slate-100" : "font-normal text-slate-400"}`}>
                  {e.symbol}
                </p>
                <p className="truncate text-[8px] text-slate-400">{e.name}</p>
              </div>
            );
          })}

          {/* f bloğu göstergeleri (lantanit/aktinit serileri) */}
          <div
            style={{ gridColumn: 3, gridRow: 6 }}
            className="flex items-center justify-center rounded-lg border border-dashed border-slate-700 text-[8px] text-slate-500"
          >
            57-71
          </div>
          <div
            style={{ gridColumn: 3, gridRow: 7 }}
            className="flex items-center justify-center rounded-lg border border-dashed border-slate-700 text-[8px] text-slate-500"
          >
            89-103
          </div>
        </div>
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
