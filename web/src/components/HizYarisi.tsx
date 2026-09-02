"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ELEMENTS, shuffle, type Element } from "@/data/elements";

const SURE = 60; // saniye

type TurSonucu = {
  xp: number;
  score: number;
  achievements: { slug: string; name: string; icon: string }[];
  element: Element | null;
};

type Asama = "hazirlik" | "oyun" | "bitis";

export default function HizYarisi() {
  const [asama, setAsama] = useState<Asama>("hazirlik");
  const [soru, setSoru] = useState<{ element: Element; secenekler: string[] } | null>(null);
  const [timeLeft, setTimeLeft] = useState(SURE);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [dogru, setDogru] = useState(0);
  const [toplam, setToplam] = useState(0);
  const [sonuc, setSonuc] = useState<TurSonucu | null>(null);
  const [saving, setSaving] = useState(false);

  const cevapVerildi = useRef(false);

  const yeniSoru = useCallback(() => {
    const element = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
    const yanlislar = shuffle(ELEMENTS.filter((e) => e.symbol !== element.symbol)).slice(0, 3);
    const secenekler = shuffle([element, ...yanlislar]).map((e) => e.name);
    setSoru({ element, secenekler });
    cevapVerildi.current = false;
  }, []);

  const basla = useCallback(() => {
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setDogru(0);
    setToplam(0);
    setTimeLeft(SURE);
    setSonuc(null);
    yeniSoru();
    setAsama("oyun");
  }, [yeniSoru]);

  const bitir = useCallback(
    async (accuracy: number, s: number) => {
      setSaving(true);
      try {
        const res = await fetch("/api/quiz/finish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            unitId: null,
            mode: "hiz_yarisi",
            score: s,
            accuracy,
            maxStreak: maxStreak,
            durationSec: SURE,
          }),
        });
        const data = await res.json();
        if (res.ok) setSonuc(data);
      } catch {
        // skor kaydı başarısız olsa bile bitiş ekranı gösterilir
      } finally {
        setSaving(false);
      }
    },
    [maxStreak]
  );

  // Geri sayım
  useEffect(() => {
    if (asama !== "oyun" || sonuc) return;
    if (timeLeft <= 0) {
      const accuracy = toplam > 0 ? dogru / toplam : 0;
      setAsama("bitis");
      bitir(accuracy, score);
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, asama, sonuc, toplam, dogru, score, bitir]);

  function cevapla(isim: string) {
    if (!soru || cevapVerildi.current || asama !== "oyun") return;
    cevapVerildi.current = true;
    setToplam((t) => t + 1);

    if (isim === soru.element.name) {
      setDogru((d) => d + 1);
      setStreak((s) => {
        const yeni = s + 1;
        setMaxStreak((m) => Math.max(m, yeni));
        return yeni;
      });
      setScore((s) => s + 50 + streak * 10);
    } else {
      setStreak(0);
    }

    setTimeout(() => yeniSoru(), 200);
  }

  // ---------- Görünümler ----------
  if (asama === "hazirlik") {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <p className="text-4xl">⚡</p>
          <h2 className="mt-3 text-3xl font-black">Hız Yarışı</h2>
          <p className="mt-3 text-slate-400">
            60 saniye içinde olabildiğince çok element sembolünü doğru ismiyle eşleştir.
            Her doğru: <span className="font-semibold text-cyan-300">50 puan + seri bonusu</span>.
            Doğruluk oranın %70+ olursa yeni bir <span className="font-semibold text-amber-300">element kartı</span> kazanırsın.
          </p>
          <button
            onClick={basla}
            className="mt-6 rounded-xl bg-cyan-500 px-8 py-3 text-lg font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            Başla!
          </button>
        </div>
      </div>
    );
  }

  if (asama === "bitis") {
    const accuracy = toplam > 0 ? dogru / toplam : 0;
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <p className="text-sm font-medium tracking-widest text-cyan-400 uppercase">Süre Doldu</p>
          <h2 className="mt-2 text-3xl font-black">⚡ Hız Yarışı Sonucu</h2>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-800 p-4">
              <p className="text-2xl font-black text-cyan-400">{score}</p>
              <p className="mt-1 text-xs text-slate-400">Puan</p>
            </div>
            <div className="rounded-2xl bg-slate-800 p-4">
              <p className="text-2xl font-black text-emerald-400">
                {dogru}/{toplam}
              </p>
              <p className="mt-1 text-xs text-slate-400">Doğru</p>
            </div>
            <div className="rounded-2xl bg-slate-800 p-4">
              <p className="text-2xl font-black text-amber-400">{maxStreak}</p>
              <p className="mt-1 text-xs text-slate-400">En İyi Seri</p>
            </div>
          </div>

          {sonuc?.achievements && sonuc.achievements.length > 0 && (
            <div className="mt-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-left">
              <p className="text-sm font-bold text-amber-300">🏅 Yeni Rozetler</p>
              {sonuc.achievements.map((a) => (
                <p key={a.slug} className="mt-1 text-sm text-slate-300">
                  {a.icon} {a.name}
                </p>
              ))}
            </div>
          )}

          {sonuc?.element && (
            <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
              <p className="text-sm font-bold text-emerald-300">🧫 Yeni Element Kartı</p>
              <p className="mt-1 text-2xl font-black">
                {sonuc.element.symbol}{" "}
                <span className="text-base font-semibold text-slate-300">
                  {sonuc.element.name} ({sonuc.element.number})
                </span>
              </p>
            </div>
          )}

          <div className="mt-8 flex justify-center gap-3">
            <button onClick={basla} className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400">
              Tekrar Oyna
            </button>
            <Link href="/liderlik" className="rounded-xl border border-slate-600 px-6 py-3 font-semibold hover:border-slate-400">
              🏆 Liderlik
            </Link>
            <Link href="/koleksiyon" className="rounded-xl border border-slate-600 px-6 py-3 font-semibold hover:border-slate-400">
              🧫 Koleksiyon
            </Link>
          </div>
          {saving && <p className="mt-3 text-xs text-slate-500">Skor kaydediliyor...</p>}
        </div>
      </div>
    );
  }

  // oyun
  const accuracy = toplam > 0 ? Math.round((dogru / toplam) * 100) : 100;

  return (
    <div className="mx-auto max-w-2xl py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">⚡ Hız Yarışı</h2>
          <p className="text-xs text-slate-500">
            Doğruluk: %{accuracy} · Seri: {streak} 🔥
          </p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-black ${timeLeft <= 10 ? "text-rose-400" : "text-cyan-400"}`}>
            ⏱ {timeLeft}
          </p>
          <p className="text-xs text-slate-400">Puan: {score}</p>
        </div>
      </div>

      {soru && (
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-500">Bu sembol hangi element?</p>
          <p className="mt-2 text-7xl font-black tracking-wider text-cyan-300">{soru.element.symbol}</p>

          <div className="mx-auto mt-8 grid max-w-md gap-3">
            {soru.secenekler.map((isim) => (
              <button
                key={isim}
                onClick={() => cevapla(isim)}
                className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 text-lg font-semibold transition hover:border-cyan-500 hover:bg-slate-800"
              >
                {isim}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
