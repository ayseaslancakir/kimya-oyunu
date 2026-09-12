"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Mesaj = { tur: "ok" | "hata"; metin: string } | null;

// Hesap sayfasının etkileşimli bölümleri: şifre değiştirme ve hesap silme.
export default function AccountPanel({ username }: { username: string }) {
  const router = useRouter();

  const [sifre, setSifre] = useState({ currentPassword: "", newPassword: "", tekrar: "" });
  const [sifreBusy, setSifreBusy] = useState(false);
  const [sifreMesaj, setSifreMesaj] = useState<Mesaj>(null);

  const [silOnay, setSilOnay] = useState(false);
  const [silBusy, setSilBusy] = useState(false);
  const [silHata, setSilHata] = useState<string | null>(null);

  const inputCls =
    "w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-cyan-500";

  async function sifreDegistir(e: React.FormEvent) {
    e.preventDefault();
    setSifreMesaj(null);

    if (sifre.newPassword !== sifre.tekrar) {
      setSifreMesaj({ tur: "hata", metin: "Yeni şifreler birbiriyle aynı değil." });
      return;
    }

    setSifreBusy(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: sifre.currentPassword,
          newPassword: sifre.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSifreMesaj({ tur: "hata", metin: data.error ?? "Şifre değiştirilemedi" });
        return;
      }
      setSifre({ currentPassword: "", newPassword: "", tekrar: "" });
      setSifreMesaj({ tur: "ok", metin: "Şifren güncellendi. Yeni şifrenle giriş yapabilirsin." });
    } catch {
      setSifreMesaj({ tur: "hata", metin: "Sunucuya ulaşılamadı" });
    } finally {
      setSifreBusy(false);
    }
  }

  async function hesabiSil() {
    setSilHata(null);
    setSilBusy(true);
    try {
      const res = await fetch("/api/auth/delete", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSilHata(data.error ?? "Hesap silinemedi");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setSilHata("Sunucuya ulaşılamadı");
    } finally {
      setSilBusy(false);
    }
  }

  return (
    <>
      <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-bold">Şifre değiştir</h2>
        <p className="mt-1 text-sm text-slate-400">
          Güvenlik için mevcut şifreni girmen gerekir.
        </p>

        <form onSubmit={sifreDegistir} className="mt-4 grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-300">Mevcut şifre</span>
            <input
              type="password"
              value={sifre.currentPassword}
              onChange={(e) => setSifre((s) => ({ ...s, currentPassword: e.target.value }))}
              required
              autoComplete="current-password"
              className={inputCls}
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-300">Yeni şifre (en az 8 karakter)</span>
            <input
              type="password"
              value={sifre.newPassword}
              onChange={(e) => setSifre((s) => ({ ...s, newPassword: e.target.value }))}
              required
              minLength={8}
              autoComplete="new-password"
              className={inputCls}
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium text-slate-300">Yeni şifre (tekrar)</span>
            <input
              type="password"
              value={sifre.tekrar}
              onChange={(e) => setSifre((s) => ({ ...s, tekrar: e.target.value }))}
              required
              minLength={8}
              autoComplete="new-password"
              className={inputCls}
            />
          </label>

          {sifreMesaj && (
            <p
              className={`rounded-xl p-3 text-sm ${
                sifreMesaj.tur === "ok"
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-rose-500/10 text-rose-300"
              }`}
            >
              {sifreMesaj.metin}
            </p>
          )}

          <button
            type="submit"
            disabled={sifreBusy}
            className="justify-self-start rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {sifreBusy ? "Kaydediliyor..." : "Şifreyi Değiştir"}
          </button>
        </form>
      </section>

      <section className="mt-8 rounded-3xl border border-rose-900/60 bg-rose-950/20 p-6">
        <h2 className="text-lg font-bold text-rose-300">Hesabı sil</h2>
        <p className="mt-1 text-sm text-slate-400">
          <span className="font-semibold text-slate-300">{username}</span> hesabın ve ona bağlı tüm
          veriler (skorlar, ilerleme, rozetler, envanter) kalıcı olarak silinir. Bu işlem geri
          alınamaz.
        </p>

        <label className="mt-4 flex items-start gap-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={silOnay}
            onChange={(e) => setSilOnay(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-900"
          />
          <span>Verilerimin kalıcı olarak silineceğini anladım.</span>
        </label>

        {silHata && <p className="mt-3 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300">{silHata}</p>}

        <button
          type="button"
          onClick={hesabiSil}
          disabled={!silOnay || silBusy}
          className="mt-4 rounded-xl border border-rose-500 px-6 py-3 font-semibold text-rose-300 transition hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {silBusy ? "Siliniyor..." : "Hesabımı Sil"}
        </button>
      </section>
    </>
  );
}
