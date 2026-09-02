"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Row = {
  userId: number;
  username: string;
  gradeCode: number | null;
  totalScore: number;
  games: number;
};

const MODLAR = [
  { slug: "quiz_arena", ad: "Quiz Arena" },
  { slug: "hiz_yarisi", ad: "Hız Yarışı" },
  { slug: "bulmaca", ad: "Bulmaca" },
];

const MADALYA = ["🥇", "🥈", "🥉"];

export default function LiderlikPage() {
  const [period, setPeriod] = useState<"week" | "all">("week");
  const [mode, setMode] = useState("quiz_arena");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}&mode=${mode}`)
      .then((r) => r.json())
      .then((d) => setRows(d.rows ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [period, mode]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">🏆 Liderlik Tablosu</h1>
          <p className="mt-1 text-slate-400">En iyi kimyagerler burada!</p>
        </div>
        <Link
          href="/harita"
          className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold transition hover:border-slate-400"
        >
          ← Harita
        </Link>
      </div>

      {/* Filtreler */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {MODLAR.map((m) => (
          <button
            key={m.slug}
            onClick={() => setMode(m.slug)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              mode === m.slug ? "bg-cyan-500 text-slate-950" : "border border-slate-700 hover:border-slate-500"
            }`}
          >
            {m.ad}
          </button>
        ))}
        <span className="mx-2 h-6 w-px bg-slate-700" />
        <button
          onClick={() => setPeriod("week")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            period === "week" ? "bg-emerald-500 text-slate-950" : "border border-slate-700 hover:border-slate-500"
          }`}
        >
          Bu Hafta
        </button>
        <button
          onClick={() => setPeriod("all")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            period === "all" ? "bg-emerald-500 text-slate-950" : "border border-slate-700 hover:border-slate-500"
          }`}
        >
          Tüm Zamanlar
        </button>
      </div>

      {/* Liste */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-800">
        {loading ? (
          <p className="p-10 text-center text-slate-500">Yükleniyor...</p>
        ) : rows.length === 0 ? (
          <p className="p-10 text-center text-slate-500">
            Henüz skor yok. İlk sen oyna! 🧪
          </p>
        ) : (
          rows.map((r, i) => (
            <div
              key={r.userId}
              className={`flex items-center justify-between border-b border-slate-800 px-6 py-4 last:border-0 ${
                i === 0 ? "bg-amber-500/5" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="w-10 text-center text-2xl font-black">
                  {MADALYA[i] ?? i + 1}
                </span>
                <div>
                  <p className="font-semibold">{r.username}</p>
                  <p className="text-xs text-slate-500">
                    {r.gradeCode ? `${r.gradeCode}. sınıf` : "Sınıf belirtilmedi"} · {r.games} oyun
                  </p>
                </div>
              </div>
              <p className="text-xl font-black text-cyan-400">{r.totalScore.toLocaleString("tr-TR")}</p>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
