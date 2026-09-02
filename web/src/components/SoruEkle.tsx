"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Cikti = { kod: string; metin: string };
type Unite = { id: number; adi: string; ciktilar: Cikti[] };
type Tema = { id: number; adi: string; uniteler: Unite[] };
type Sinif = { kod: number; temalar: Tema[] };

const inputCls =
  "rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 outline-none focus:border-cyan-500";

export default function SoruEkle({ siniflar }: { siniflar: Sinif[] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    sinif: "",
    tema: "",
    unite: "",
    cikti: "",
    prompt: "",
    difficulty: "2",
    explanation: "",
    options: ["", "", "", ""],
    correct: "0",
  });
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sinif = siniflar.find((s) => String(s.kod) === form.sinif);
  const tema = sinif?.temalar.find((t) => String(t.id) === form.tema);
  const unite = tema?.uniteler.find((u) => String(u.id) === form.unite);

  const ciktilar = useMemo(() => unite?.ciktilar ?? [], [unite]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setOption(i: number, value: string) {
    setForm((f) => {
      const options = [...f.options];
      options[i] = value;
      return { ...f, options };
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setBusy(true);
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outcomeCode: form.cikti,
          prompt: form.prompt,
          difficulty: Number(form.difficulty),
          explanation: form.explanation || null,
          options: form.options.filter((o) => o.trim() !== "").map((o) => ({ text: o })),
          correctIndex: Number(form.correct),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Soru eklenemedi");
        return;
      }
      setOk("✅ Soru eklendi!");
      setForm((f) => ({ ...f, prompt: "", explanation: "", options: ["", "", "", ""], correct: "0" }));
      router.refresh();
    } catch {
      setError("Sunucuya ulaşılamadı");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {/* Kademeli seçim */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-slate-400">Sınıf</span>
          <select
            value={form.sinif}
            onChange={(e) => set("sinif", e.target.value)}
            className={inputCls}
          >
            <option value="">Seç</option>
            {siniflar.map((s) => (
              <option key={s.kod} value={s.kod}>
                {s.kod}. sınıf
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-slate-400">Tema</span>
          <select value={form.tema} onChange={(e) => set("tema", e.target.value)} className={inputCls} disabled={!sinif}>
            <option value="">Seç</option>
            {sinif?.temalar.map((t) => (
              <option key={t.id} value={t.id}>
                {t.adi}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-slate-400">Ünite</span>
          <select value={form.unite} onChange={(e) => set("unite", e.target.value)} className={inputCls} disabled={!tema}>
            <option value="">Seç</option>
            {tema?.uniteler.map((u) => (
              <option key={u.id} value={u.id}>
                {u.adi}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-medium text-slate-400">Öğrenme çıktısı</span>
          <select value={form.cikti} onChange={(e) => set("cikti", e.target.value)} className={inputCls} disabled={!unite}>
            <option value="">Seç</option>
            {ciktilar.map((c) => (
              <option key={c.kod} value={c.kod}>
                {c.kod}
              </option>
            ))}
          </select>
        </label>
      </div>

      {form.cikti && (
        <p className="rounded-xl bg-slate-800/60 p-3 text-xs text-slate-400">
          {ciktilar.find((c) => c.kod === form.cikti)?.metin}
        </p>
      )}

      <label className="grid gap-1.5">
        <span className="text-sm font-medium text-slate-300">Soru metni</span>
        <textarea
          value={form.prompt}
          onChange={(e) => set("prompt", e.target.value)}
          required
          minLength={5}
          rows={2}
          className={inputCls}
          placeholder="Soru kökünü yazın..."
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-300">Zorluk</span>
          <select value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)} className={inputCls}>
            {[1, 2, 3, 4, 5].map((d) => (
              <option key={d} value={d}>
                {d} — {"●".repeat(d)}
                {"○".repeat(5 - d)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-slate-300">Açıklama (isteğe bağlı)</span>
          <input
            value={form.explanation}
            onChange={(e) => set("explanation", e.target.value)}
            className={inputCls}
            placeholder="Doğru/yanlış sonrası gösterilecek açıklama"
          />
        </label>
      </div>

      {/* Seçenekler */}
      <div className="grid gap-3">
        <span className="text-sm font-medium text-slate-300">Seçenekler (doğru olanı işaretleyin)</span>
        {form.options.map((opt, i) => (
          <div key={i} className="flex items-center gap-3">
            <input
              type="radio"
              name="dogru"
              checked={form.correct === String(i)}
              onChange={() => set("correct", String(i))}
              className="h-4 w-4 accent-emerald-500"
              title="Doğru cevap"
            />
            <input
              value={opt}
              onChange={(e) => setOption(i, e.target.value)}
              placeholder={`Seçenek ${String.fromCharCode(65 + i)}`}
              className={inputCls + " flex-1"}
            />
          </div>
        ))}
      </div>

      {error && <p className="rounded-xl bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
      {ok && <p className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-300">{ok}</p>}

      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
      >
        {busy ? "Ekleniyor..." : "+ Soruyu Ekle"}
      </button>
    </form>
  );
}
