"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type Option = { id: number; text: string };
type Question = {
  id: number;
  prompt: string;
  difficulty: number;
  outcomeCode: string;
  options: Option[];
};

type Feedback = {
  correct: boolean;
  correctOptionId: number | null;
  explanation: string | null;
  outcomeCode: string;
  mastery: number;
};

const SURE = 15; // soru başına saniye

export default function QuizPlayer({ unitId, unitName }: { unitId: number; unitName: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [timeLeft, setTimeLeft] = useState(SURE);

  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [dogru, setDogru] = useState(0);

  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sonuc, setSonuc] = useState<{
    xp: number;
    achievements?: { slug: string; name: string; icon: string }[];
    element?: { symbol: string; name: string; number: number } | null;
  } | null>(null);

  const startTime = useRef(Date.now());
  const answered = useRef(false);

  useEffect(() => {
    fetch(`/api/quiz/questions?unitId=${unitId}&limit=10`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Soru alınamadı");
        const data = await res.json();
        if (data.questions.length === 0) throw new Error("Bu ünitede henüz soru yok");
        setQuestions(data.questions);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [unitId]);

  const cevapla = useCallback(
    async (optionId: number | null) => {
      if (answered.current) return;
      answered.current = true;
      setSelected(optionId);

      const question = questions[index];
      try {
        const res = await fetch("/api/quiz/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: question.id, optionId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setFeedback(data);
        if (data.correct) {
          setDogru((d) => d + 1);
          setStreak((s) => {
            const yeni = s + 1;
            setMaxStreak((m) => Math.max(m, yeni));
            return yeni;
          });
          setScore((s) => s + 100 + (streak + 1) * 10);
        } else {
          setStreak(0);
        }
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [index, questions, streak]
  );

  // Zamanlayıcı
  useEffect(() => {
    if (loading || feedback || finished) return;
    if (timeLeft <= 0) {
      cevapla(null); // süre doldu → yanlış
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, loading, feedback, finished, cevapla]);

  const siradaki = useCallback(() => {
    answered.current = false;
    setSelected(null);
    setFeedback(null);
    setTimeLeft(SURE);
    if (index + 1 >= questions.length) {
      setFinished(true);
      bitir();
    } else {
      setIndex((i) => i + 1);
    }
  }, [index, questions.length]);

  const bitir = useCallback(async () => {
    setSaving(true);
    const durationSec = Math.round((Date.now() - startTime.current) / 1000);
    try {
      const res = await fetch("/api/quiz/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          score,
          accuracy: questions.length > 0 ? dogru / questions.length : 0,
          maxStreak,
          durationSec,
        }),
      });
      const data = await res.json();
      if (res.ok) setSonuc(data);
    } catch {
      // skor kaydı başarısız olsa bile ekran gösterilir
    } finally {
      setSaving(false);
    }
  }, [unitId, score, dogru, questions.length, maxStreak]);

  // ---------- Görünümler ----------
  if (loading) {
    return <div className="py-20 text-center text-slate-400">Sorular yükleniyor...</div>;
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

  if (finished) {
    const toplam = questions.length;
    const yuzde = toplam > 0 ? Math.round((dogru / toplam) * 100) : 0;
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <p className="text-sm font-medium tracking-widest text-cyan-400 uppercase">Tur Bitti</p>
          <h2 className="mt-2 text-3xl font-black">{unitName}</h2>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-800 p-4">
              <p className="text-2xl font-black text-cyan-400">{score}</p>
              <p className="mt-1 text-xs text-slate-400">Puan</p>
            </div>
            <div className="rounded-2xl bg-slate-800 p-4">
              <p className="text-2xl font-black text-emerald-400">%{yuzde}</p>
              <p className="mt-1 text-xs text-slate-400">Doğruluk ({dogru}/{toplam})</p>
            </div>
            <div className="rounded-2xl bg-slate-800 p-4">
              <p className="text-2xl font-black text-amber-400">{maxStreak}</p>
              <p className="mt-1 text-xs text-slate-400">En İyi Seri</p>
            </div>
          </div>

          {sonuc && (
            <p className="mt-4 text-sm text-slate-400">
              Kazanılan XP: <span className="font-bold text-emerald-400">{sonuc.xp}</span>
            </p>
          )}

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
            <Link href={`/oyun/quiz?unitId=${unitId}`} className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400">
              Tekrar Oyna
            </Link>
            <Link href="/harita" className="rounded-xl border border-slate-600 px-6 py-3 font-semibold hover:border-slate-400">
              Haritaya Dön
            </Link>
            <Link href="/liderlik" className="rounded-xl border border-slate-600 px-6 py-3 font-semibold hover:border-slate-400">
              🏆 Liderlik
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[index];
  const ilerleme = ((index + (feedback ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="mx-auto max-w-2xl py-10">
      {/* Üst bilgi */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{unitName}</p>
          <p className="text-xs text-slate-500">
            Soru {index + 1} / {questions.length} · {question.outcomeCode}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-cyan-400">{score}</p>
          <p className="text-xs text-slate-400">Seri: {streak} 🔥</p>
        </div>
      </div>

      {/* İlerleme çubuğu */}
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${ilerleme}%` }} />
      </div>

      {/* Soru kartı */}
      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-300">
            Zorluk: {"●".repeat(question.difficulty)}
            {"○".repeat(5 - question.difficulty)}
          </span>
          <span className={`text-sm font-bold ${timeLeft <= 5 ? "text-rose-400" : "text-slate-300"}`}>
            ⏱ {timeLeft} sn
          </span>
        </div>

        <h3 className="text-xl font-semibold leading-snug">{question.prompt}</h3>

        <div className="mt-6 grid gap-3">
          {question.options.map((opt, i) => {
            let stil =
              "border-slate-700 bg-slate-800/60 hover:border-cyan-500 hover:bg-slate-800";
            if (feedback) {
              if (opt.id === feedback.correctOptionId) {
                stil = "border-emerald-500 bg-emerald-500/15 text-emerald-300";
              } else if (opt.id === selected) {
                stil = "border-rose-500 bg-rose-500/15 text-rose-300";
              } else {
                stil = "border-slate-800 bg-slate-900 text-slate-500";
              }
            }
            return (
              <button
                key={opt.id}
                disabled={!!feedback}
                onClick={() => cevapla(opt.id)}
                className={`rounded-xl border p-4 text-left font-medium transition disabled:cursor-default ${stil}`}
              >
                <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-xs font-bold">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt.text}
              </button>
            );
          })}
        </div>

        {/* Geri bildirim */}
        {feedback && (
          <div
            className={`mt-5 rounded-2xl border p-4 ${
              feedback.correct
                ? "border-emerald-600 bg-emerald-500/10"
                : "border-rose-600 bg-rose-500/10"
            }`}
          >
            <p className={`font-bold ${feedback.correct ? "text-emerald-300" : "text-rose-300"}`}>
              {feedback.correct ? "🎉 Doğru!" : selected === null ? "⏰ Süre Doldu!" : "❌ Yanlış!"}
            </p>
            {feedback.explanation && (
              <p className="mt-1 text-sm text-slate-300">{feedback.explanation}</p>
            )}
            <button
              onClick={siradaki}
              className="mt-4 rounded-xl bg-cyan-500 px-6 py-2.5 font-semibold text-slate-950 hover:bg-cyan-400"
            >
              {index + 1 >= questions.length ? "Turu Bitir" : "Sonraki Soru →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
