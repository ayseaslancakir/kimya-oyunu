"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type Option = { id: number; text: string };
type Question = { id: number; prompt: string; outcomeCode: string; options: Option[] };
type Player = { userId: number; username: string; score: number; dogru: number; finished: boolean };

type DuelState = {
  duel: { id: number; code: string; status: string; unitId: number; unitName: string };
  questions: Question[];
  players: Player[];
  me: Player;
};

const SURE = 15; // soru başına saniye

export default function DuelOyun({ duelId }: { duelId: number }) {
  const [state, setState] = useState<DuelState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // oyun fazı
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; correctOptionId: number | null; explanation: string | null } | null>(null);
  const [timeLeft, setTimeLeft] = useState(SURE);
  const [sonuc, setSonuc] = useState<{ xp: number; achievements?: { slug: string; name: string; icon: string }[]; element?: { symbol: string; name: string; number: number } | null } | null>(null);

  const answered = useRef(false);
  const bitirdim = useRef(false);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/duel/${duelId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Düello durumu alınamadı");
        return;
      }
      const data = await res.json();
      setState(data);
    } catch {
      // geçici hata — bir sonraki poll dener
    }
  }, [duelId]);

  // İlk yükleme + 2 sn'de bir polling
  useEffect(() => {
    fetchState();
    const t = setInterval(fetchState, 2000);
    return () => clearInterval(t);
  }, [fetchState]);

  const bitir = useCallback(async () => {
    if (bitirdim.current) return;
    bitirdim.current = true;
    try {
      const res = await fetch(`/api/duel/${duelId}/finish`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.sonuc) setSonuc(data.sonuc);
    } catch {
      // bitiş kaydı başarısız olsa bile beklemeye geçilir
    }
    fetchState();
  }, [duelId, fetchState]);

  const cevapla = useCallback(
    async (optionId: number | null) => {
      if (answered.current) return;
      answered.current = true;
      setSelected(optionId);

      const question = state!.questions[index];
      try {
        const res = await fetch(`/api/duel/${duelId}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: question.id, optionId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setFeedback(data);
      } catch {
        setFeedback({ correct: false, correctOptionId: null, explanation: null });
      }
    },
    [duelId, index, state]
  );

  // Soru zamanlayıcı
  useEffect(() => {
    if (!state || state.players.length < 2 || state.me.finished || feedback) return;
    if (timeLeft <= 0) {
      cevapla(null);
      return;
    }
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, state, feedback, cevapla]);

  const siradaki = useCallback(() => {
    answered.current = false;
    setSelected(null);
    setFeedback(null);
    setTimeLeft(SURE);
    if (index + 1 >= state!.questions.length) {
      bitir();
    } else {
      setIndex((i) => i + 1);
    }
  }, [index, state, bitir]);

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-rose-400">{error}</p>
        <Link href="/oyun/duel" className="mt-4 inline-block rounded-xl bg-slate-700 px-5 py-2.5 font-semibold">
          Düello Sayfasına Dön
        </Link>
      </div>
    );
  }

  if (!state) {
    return <div className="py-20 text-center text-slate-400">Düello yükleniyor...</div>;
  }

  const rakip = state.players.find((p) => p.userId !== state.me.userId);
  const bekleniyor = state.players.length < 2;
  const benBittirdi = state.me.finished;
  const düelloBitti = state.duel.status === "finished";

  // ---------- BEKLEME: rakip bekleniyor ----------
  if (bekleniyor) {
    const paylasimLinki =
      typeof window !== "undefined"
        ? `${window.location.origin}/oyun/duel/katil?kod=${state.duel.code}`
        : "";
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <p className="text-5xl">🤝</p>
          <h2 className="mt-3 text-3xl font-black">Düello Kuruldu!</h2>
          <p className="mt-2 text-sm text-slate-400">{state.duel.unitName}</p>

          <p className="mt-6 text-xs uppercase tracking-widest text-slate-500">Davet Kodu</p>
          <p className="mt-2 rounded-2xl bg-slate-800 py-4 font-mono text-4xl font-black tracking-[0.4em] text-amber-300">
            {state.duel.code}
          </p>

          <p className="mt-6 text-sm text-slate-400">
            Rakibine kodu veya şu linki gönder:
          </p>
          <p className="mt-2 break-all rounded-xl bg-slate-800/60 p-3 text-xs text-cyan-300">{paylasimLinki}</p>

          <p className="mt-6 animate-pulse text-sm font-semibold text-emerald-400">
            ⏳ Rakip bekleniyor...
          </p>
        </div>
      </div>
    );
  }

  // ---------- SONUÇ ----------
  if (düelloBitti) {
    const ben = state.me;
    const rakibSkor = rakip?.score ?? 0;
    const kazandi = ben.score > rakibSkor;
    const berabere = ben.score === rakibSkor;
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <p className="text-6xl">{berabere ? "🤝" : kazandi ? "🏆" : "💪"}</p>
          <h2 className="mt-3 text-3xl font-black">
            {berabere ? "Berabere!" : kazandi ? "Düelloyu Kazandın!" : "Rakip Kazandı"}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{state.duel.unitName}</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-800 p-4">
              <p className="text-xs text-slate-400">Sen ({state.me.username})</p>
              <p className="mt-1 text-3xl font-black text-cyan-400">{state.me.score}</p>
              <p className="text-xs text-slate-500">{state.me.dogru} doğru</p>
            </div>
            <div className="rounded-2xl bg-slate-800 p-4">
              <p className="text-xs text-slate-400">Rakip ({rakip?.username})</p>
              <p className="mt-1 text-3xl font-black text-rose-400">{rakibSkor}</p>
              <p className="text-xs text-slate-500">{rakip?.dogru} doğru</p>
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
            <Link href="/oyun/duel" className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400">
              Yeni Düello
            </Link>
            <Link href="/liderlik" className="rounded-xl border border-slate-600 px-6 py-3 font-semibold hover:border-slate-400">
              🏆 Liderlik
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ---------- RAKİP BEKLENİYOR (ben bitirdim, rakip oynuyor) ----------
  if (benBittirdi) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <p className="text-5xl">⏳</p>
          <h2 className="mt-3 text-2xl font-black">Turunu Tamamladın!</h2>
          <p className="mt-2 text-sm text-slate-400">
            Skorun: <span className="font-bold text-cyan-300">{state.me.score}</span>
          </p>
          <p className="mt-6 animate-pulse text-sm font-semibold text-emerald-400">
            Rakibin (<span className="font-bold">{rakip?.username}</span>) oynuyor...
          </p>
        </div>
      </div>
    );
  }

  // ---------- OYUN ----------
  const question = state.questions[index];
  if (!question) {
    return <div className="py-20 text-center text-slate-400">Soru yükleniyor...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl py-10">
      {/* Skor tablosu */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-cyan-500/40 bg-cyan-500/5 p-3 text-center">
          <p className="text-xs text-slate-400">Sen ({state.me.username})</p>
          <p className="text-2xl font-black text-cyan-300">{state.me.score}</p>
        </div>
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/5 p-3 text-center">
          <p className="text-xs text-slate-400">Rakip ({rakip?.username})</p>
          <p className="text-2xl font-black text-rose-300">{rakip?.score ?? 0}</p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-400">
          Soru {index + 1}/{state.questions.length} · {question.outcomeCode}
        </p>
        <p className={`text-sm font-bold ${timeLeft <= 5 ? "text-rose-400" : "text-slate-300"}`}>
          ⏱ {timeLeft} sn
        </p>
      </div>

      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
        <h3 className="text-xl font-semibold leading-snug">{question.prompt}</h3>

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
                disabled={!!feedback}
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
              {feedback.correct ? "🎉 Doğru! (+100)" : selected === null ? "⏰ Süre Doldu!" : "❌ Yanlış!"}
            </p>
            {feedback.explanation && <p className="mt-1 text-sm text-slate-300">{feedback.explanation}</p>}
            <button
              onClick={siradaki}
              className="mt-4 rounded-xl bg-cyan-500 px-6 py-2.5 font-semibold text-slate-950 hover:bg-cyan-400"
            >
              {index + 1 >= state.questions.length ? "Turu Bitir" : "Sonraki Soru →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
