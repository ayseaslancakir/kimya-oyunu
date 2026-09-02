"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function KatilForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("kod") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/duel/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Katılım başarısız");
        return;
      }
      router.push(`/oyun/duel/oyun?duelId=${data.duelId}`);
    } catch {
      setError("Sunucuya ulaşılamadı");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-4">
      <label className="grid gap-1.5">
        <span className="text-sm font-medium text-slate-300">Düello kodu</span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          required
          maxLength={6}
          placeholder="6 haneli kod"
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] uppercase outline-none focus:border-rose-500"
        />
      </label>

      {error && <p className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-rose-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-rose-400 disabled:opacity-50"
      >
        {busy ? "Katılıyor..." : "⚔️ Düelloya Katıl"}
      </button>
    </form>
  );
}

export default function DuelKatilPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <div className="text-center">
        <p className="text-5xl">⚔️</p>
        <h1 className="mt-3 text-3xl font-black">Düelloya Katıl</h1>
        <p className="mt-1 text-slate-400">
          Arkadaşının paylaştığı kodu gir, aynı soruları çözüp kapışın.
        </p>
      </div>
      <Suspense fallback={null}>
        <KatilForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-slate-400">
        Düello kurmak ister misin?{" "}
        <Link href="/oyun/duel" className="font-semibold text-rose-300 hover:underline">
          Düello kur
        </Link>
      </p>
    </main>
  );
}
