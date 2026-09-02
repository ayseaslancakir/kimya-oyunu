"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SinifaKatil() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setBusy(true);
    try {
      const res = await fetch("/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Katılım başarısız");
        return;
      }
      setOk(`🎉 "${data.sinif.name}" sınıfına katıldın!`);
      setCode("");
      router.refresh();
    } catch {
      setError("Sunucuya ulaşılamadı");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
      <label className="grid flex-1 gap-1.5">
        <span className="text-sm font-medium text-slate-300">Davet kodu</span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          required
          maxLength={6}
          placeholder="örn. ABC123"
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 font-mono text-lg tracking-widest uppercase outline-none focus:border-cyan-500"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-emerald-500 px-6 py-2.5 font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
      >
        {busy ? "Katılıyor..." : "Sınıfa Katıl"}
      </button>
      {error && <p className="w-full text-sm text-rose-300">{error}</p>}
      {ok && <p className="w-full text-sm text-emerald-300">{ok}</p>}
    </form>
  );
}
