"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GirisPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Giriş başarısız");
        return;
      }
      router.push("/harita");
      router.refresh();
    } catch {
      setError("Sunucuya ulaşılamadı");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-3xl font-black">Giriş Yap</h1>
      <p className="mt-1 text-slate-400">İlerlemeni görmek ve oynamaya devam etmek için giriş yap.</p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-4">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-300">Kullanıcı adı veya e-posta</span>
          <input
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-500"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-300">Şifre</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-500"
          />
        </label>

        {error && <p className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
        >
          {busy ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Hesabın yok mu?{" "}
        <Link href="/kayit" className="font-semibold text-cyan-400 hover:underline">
          Kayıt ol
        </Link>
      </p>
    </main>
  );
}
