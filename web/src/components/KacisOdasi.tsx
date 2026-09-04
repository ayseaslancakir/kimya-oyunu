"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getScenario } from "@/data/scenarios";

type Option = { id: number; text: string };
type Question = {
  id: number;
  prompt: string;
  difficulty: number;
  outcomeCode: string;
  options: Option[];
};

const TOPLAM_SORU = 5;
const SURE = 300; // 5 dakika
const CAN = 3;

type TurSonucu = {
  xp: number;
  score: number;
  achievements: { slug: string; name: string; icon: string }[];
  element: { symbol: string; name: string; number: number } | null;
};

type Asama = "hikaye" | "oyun" | "sonuc";

export default function KacisOdasi({
  unitId,
  unitName,
  temaAdi,
}: {
  unitId: number;
  unitName: string;
  temaAdi: string;
}) {
  const senaryo = getScenario(temaAdi);

  const [asama, setAsama] = useState<Asama>("hikaye");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; correctOptionId: number | null } | null>(null);
  const [can, setCan] = useState(CAN);
  const [dogru, setDogru] = useState(0);
  const [ipucuKullanildi, setIpucuKullanildi] = useState(false);
  const [timeLeft, setTimeLeft] = useState(SURE);

  const [sonuc, setSonuc] = useState<TurSonucu | null>(null);
  const [kactiMi, setKactiMi] = useState(false);
  const [saving, setSaving] = useState(false);

  const cevapVerildi = useRef(false);
  const dogruRef = useRef(0);
  const timeLeftRef = useRef(SURE);
  const ipucuCezaRef = useRef(0);

  useEffect(() => {
    fetch(`/api/quiz/questions?unitId=${unitId}&limit=${TOPLAM_SORU}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Bulmacalar alınamadı");
        const data = await res.json();
        if (data.questions.length === 0) throw new Error("Bu ünite için henüz bulmaca yok");
        setQuestions(data.questions.slice(0, TOPLAM_SORU));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [unitId]);

  const bitir = useCallback(
    async (kazandi: boolean) => {
      setSaving(true);
      const zamanBonus = kazandi ? timeLeftRef.current * 2 : 0;
      const finalPuan = Math.max(0, dogruRef.current * 100 + zamanBonus - ipucuCezaRef.current);
      const soruSayisi = questions.length || TOPLAM_SORU;
      try {
        const res = await fetch("/api/quiz/finish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            unitId,
            mode: "kacis_odasi",
            score: finalPuan,
            accuracy: soruSayisi > 0 ? dogruRef.current / soruSayisi : 0,
            maxStreak: 0,
            durationSec: SURE - timeLeftRef.current,
          }),
        });
        const data = await res.json();
        if (res.ok) setSonuc(data);
      } catch {
        // sonuç ekranı yine gösterilir
      } finally {
        setSaving(false);
      }
    },
    [unitId, questions.length]
  );

  const baslat = useCallback(() => {
    setIndex(0);
    setCan(CAN);
    setDogru(0);
    dogruRef.current = 0;
    ipucuCezaRef.current = 0;
    timeLeftRef.current = SURE;
    setTimeLeft(SURE);
    setSelected(null);
    setFeedback(null);
    setIpucuKullanildi(false);
    setSonuc(null);
    setAsama("oyun");
  }, []);

  // Geri sayım
  useEffect(() => {
    if (asama !== "oyun" || sonuc) return;
    if (timeLeft <= 0) {
      setKactiMi(false);
      setAsama("sonuc");
      bitir(false);
      return;
    }
    const t = setTimeout(() => {
      setTimeLeft((v) => {
        const next = v - 1;
        timeLeftRef.current = next;
        return next;
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [timeLeft, asama, sonuc, bitir]);

  function cevapla(optionId: number) {
    if (cevapVerildi.current || asama !== "oyun") return;
    cevapVerildi.current = true;
    setSelected(optionId);

    fetch("/api/quiz/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: questions[index].id, optionId }),
    })
      .then((r) => r.json())
      .then((data) => {
        const dogruCevap = data.correct === true;
        setFeedback({ correct: dogruCevap, correctOptionId: data.correctOptionId ?? null });
        if (dogruCevap) {
          setDogru((d) => {
            const next = d + 1;
            dogruRef.current = next;
            return next;
          });
        } else {
          setCan((c) => {
            const yeni = c - 1;
            if (yeni <= 0) {
              setTimeout(() => {
                setKactiMi(false);
                setAsama("sonuc");
                bitir(false);
              }, 900);
            }
            return yeni;
          });
        }
      })
      .catch(() => setFeedback({ correct: false, correctOptionId: null }));
  }

  const siradaki = useCallback(() => {
    cevapVerildi.current = false;
    setSelected(null);
    setFeedback(null);
    setIpucuKullanildi(false);
    if (index + 1 >= questions.length) {
      setKactiMi(true);
      setAsama("sonuc");
      bitir(true);
    } else {
      setIndex((i) => i + 1);
    }
  }, [index, questions.length, bitir]);

  // ---------- Görünümler ----------
  if (loading) {
    return <div className="py-20 text-center text-slate-400">Bulmacalar hazırlanıyor...</div>;
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-rose-400">{error}</p>
        <Link href="/harita" className="mt-4 inline-block rounded-xl bg-slate-700 px-5 py-2.5 font-semibold">
          Haritaya Dön
        </Link>
      </div>
    );
  }

  if (asama === "hikaye") {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <p className="text-5xl">🚪</p>
          <h2 className="mt-3 text-3xl font-black">Lab Kaçış Odası</h2>
          <p className="mt-2 text-sm text-slate-500">
            {unitName} · {temaAdi}
          </p>
          <p className="mt-4 text-slate-300">{senaryo.giris}</p>

          <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl bg-slate-800 p-3">
              <p className="text-lg font-black text-cyan-400">{TOPLAM_SORU}</p>
              <p className="text-xs text-slate-400">Bulmaca</p>
            </div>
            <div className="rounded-2xl bg-slate-800 p-3">
              <p className="text-lg font-black text-amber-400">5 dk</p>
              <p className="text-xs text-slate-400">Süre</p>
            </div>
            <div className="rounded-2xl bg-slate-800 p-3">
              <p className="text-lg font-black text-rose-400">{CAN} ❤️</p>
              <p className="text-xs text-slate-400">Can</p>
            </div>
          </div>

          <button
            onClick={baslat}
            className="mt-6 rounded-xl bg-cyan-500 px-8 py-3 text-lg font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            Kaçışa Başla 🏃
          </button>
        </div>
      </div>
    );
  }

  if (asama === "sonuc") {
    const kalan = timeLeft;
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <p className="text-5xl">{kactiMi ? "🎉" : "🔒"}</p>
          <h2 className="mt-3 text-3xl font-black">
            {kactiMi ? "Kaçış Başarılı!" : "Kaçış Başarısız"}
          </h2>
          <p className="mt-3 text-slate-300">
            {kactiMi ? senaryo.cikis : can <= 0 ? "Canların tükendi!" : "Süre doldu!"}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-800 p-4">
              <p className="text-2xl font-black text-cyan-400">{dogru}/{TOPLAM_SORU}</p>
              <p className="mt-1 text-xs text-slate-400">Bulmaca</p>
            </div>
            <div className="rounded-2xl bg-slate-800 p-4">
              <p className="text-2xl font-black text-emerald-400">{sonuc?.score ?? dogru * 100}</p>
              <p className="mt-1 text-xs text-slate-400">Puan</p>
            </div>
            <div className="rounded-2xl bg-slate-800 p-4">
              <p className="text-2xl font-black text-amber-400">{kalan} sn</p>
              <p className="mt-1 text-xs text-slate-400">Kalan Süre</p>
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

          <div className="mt-8 flex justify-center gap-3">
            <button onClick={baslat} className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400">
              Tekrar Dene
            </button>
            <Link href="/harita" className="rounded-xl border border-slate-600 px-6 py-3 font-semibold hover:border-slate-400">
              Haritaya Dön
            </Link>
          </div>
          {saving && <p className="mt-3 text-xs text-slate-500">Skor kaydediliyor...</p>}
        </div>
      </div>
    );
  }

  // oyun
  const question = questions[index];
  const dk = Math.floor(timeLeft / 60);
  const sn = timeLeft % 60;

  return (
    <div className="mx-auto max-w-2xl py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">🚪 Lab Kaçış Odası</h2>
          <p className="text-xs text-slate-500">
            Bulmaca {index + 1}/{questions.length} · {unitName}
          </p>
        </div>
        <div className="flex items-center gap-4 text-right">
          <span className="text-lg">
            {"❤️".repeat(Math.max(0, can))}
            <span className="opacity-30">{"❤️".repeat(Math.max(0, CAN - can))}</span>
          </span>
          <p className={`text-xl font-black ${timeLeft <= 60 ? "text-rose-400" : "text-cyan-400"}`}>
            ⏱ {dk}:{String(sn).padStart(2, "0")}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
            {question.outcomeCode}
          </span>
          {!ipucuKullanildi && feedback === null && (
            <button
              onClick={() => {
                setIpucuKullanildi(true);
                ipucuCezaRef.current += 50;
              }}
              className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/30"
            >
              İpucu (−50 puan)
            </button>
          )}
        </div>

        <h3 className="text-xl font-semibold leading-snug">{question.prompt}</h3>

        {ipucuKullanildi && feedback === null && (
          <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            💡 {senaryo.ipucu}
          </p>
        )}

        <div className="mt-6 grid gap-3">
          {question.options.map((opt) => {
            let stil = "border-slate-700 bg-slate-800/60 hover:border-cyan-500 hover:bg-slate-800";
            if (feedback) {
              if (opt.id === feedback.correctOptionId) {
                stil = "border-emerald-500 bg-emerald-500/15 text-emerald-300";
              } else if (opt.id === selected && !feedback.correct) {
                stil = "border-rose-500 bg-rose-500/15 text-rose-300";
              } else {
                stil = "border-slate-800 bg-slate-900 text-slate-500";
              }
            }
            return (
              <button
                key={opt.id}
                disabled={feedback !== null}
                onClick={() => cevapla(opt.id)}
                className={`rounded-xl border p-4 text-left font-medium transition disabled:cursor-default ${stil}`}
              >
                {opt.text}
              </button>
            );
          })}
        </div>

        {feedback && (
          <div
            className={`mt-5 rounded-2xl border p-4 ${
              feedback.correct ? "border-emerald-600 bg-emerald-500/10" : "border-rose-600 bg-rose-500/10"
            }`}
          >
            <p className={`font-bold ${feedback.correct ? "text-emerald-300" : "text-rose-300"}`}>
              {feedback.correct ? "✅ Kilit bir adım açıldı!" : "❌ Kilit gıcırdadı... (1 can kaybettin)"}
            </p>
            {can > 0 && (
              <button
                onClick={siradaki}
                className="mt-4 rounded-xl bg-cyan-500 px-6 py-2.5 font-semibold text-slate-950 hover:bg-cyan-400"
              >
                {index + 1 >= questions.length ? "Kapıyı Aç 🔓" : "Sonraki Bulmaca →"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
