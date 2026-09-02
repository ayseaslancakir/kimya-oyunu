"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Unite = { id: number; adi: string; tema: string; sinif: number; soruSayisi: number };

export default function DuelKur({ uniteler }: { uniteler: Unite[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function kur(unitId: number) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/duel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Düello kurulamadı");
        setBusy(false);
        return;
      }
      router.push(`/oyun/duel/oyun?duelId=${data.duelId}`);
    } catch {
      setError("Sunucuya ulaşılamadı");
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {uniteler.map((u) => (
          <button
            key={u.id}
            onClick={() => kur(u.id)}
            disabled={busy}
            className="group flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left transition hover:border-rose-500"
          >
            <div>
              <p className="text-xs text-slate-500">
                {u.sinif}. sınıf · {u.tema}
              </p>
              <h3 className="mt-0.5 font-semibold group-hover:text-rose-300">{u.adi}</h3>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
                {u.soruSayisi} soru
              </span>
              <p className="mt-1 text-lg">⚔️</p>
            </div>
          </button>
        ))}
      </div>

      {error && <p className="mt-4 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
      {busy && <p className="mt-4 animate-pulse text-center text-sm text-rose-300">Düello kuruluyor...</p>}
    </div>
  );
}
