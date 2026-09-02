"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function KayitPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "student",
    gradeLevel: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          role: form.role,
          gradeLevel: form.gradeLevel ? Number(form.gradeLevel) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kayıt başarısız");
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

  const inputCls =
    "rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-500";

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-3xl font-black">Kayıt Ol</h1>
      <p className="mt-1 text-slate-400">Kimya yolculuğuna başla — ilerlemen kaydedilsin.</p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-4">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-300">Kullanıcı adı</span>
          <input
            value={form.username}
            onChange={(e) => set("username", e.target.value)}
            required
            minLength={3}
            className={inputCls}
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-300">E-posta</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
            className={inputCls}
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-300">Şifre</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            required
            minLength={6}
            className={inputCls}
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-300">Hesap türü</span>
            <select value={form.role} onChange={(e) => set("role", e.target.value)} className={inputCls}>
              <option value="student">Öğrenci</option>
              <option value="teacher">Öğretmen</option>
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-300">Sınıf düzeyi</span>
            <select
              value={form.gradeLevel}
              onChange={(e) => set("gradeLevel", e.target.value)}
              className={inputCls}
            >
              <option value="">Seçilmedi</option>
              <option value="9">9. sınıf</option>
              <option value="10">10. sınıf</option>
              <option value="11">11. sınıf</option>
              <option value="12">12. sınıf</option>
            </select>
          </label>
        </div>

        {error && <p className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="mt-2 rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
        >
          {busy ? "Kaydediliyor..." : "Hesap Oluştur"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Zaten hesabın var mı?{" "}
        <Link href="/giris" className="font-semibold text-cyan-400 hover:underline">
          Giriş yap
        </Link>
      </p>
    </main>
  );
}
