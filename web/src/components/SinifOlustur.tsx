"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SinifOlustur() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sınıf oluşturulamadı");
        return;
      }
      setName("");
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
        <span className="text-sm font-medium text-slate-300">Sınıf adı</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          placeholder="örn. 9-A Kimya"
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 outline-none focus:border-cyan-500"
        />
      </label>
      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-cyan-500 px-6 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
      >
        {busy ? "Oluşturuluyor..." : "+ Sınıf Oluştur"}
      </button>
      {error && <p className="w-full text-sm text-rose-300">{error}</p>}
    </form>
  );
}
