"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ELEMENTS, shuffle, type Element } from "@/data/elements";

const TUR_BASI_ES = 4; // her turda 4 çift
const TUR_SAYISI = 3;

type TurSonucu = {
  xp: number;
  score: number;
  achievements: { slug: string; name: string; icon: string }[];
  element: Element | null;
};

type Asama = "hazirlik" | "oyun" | "bitis";
type Cift = { element: Element; eslesti: boolean; hata: boolean };

export default function Bulmaca() {
  const [asama, setAsama] = useState<Asama>("hazirlik");
  const [ciftler, setCiftler] = useState<Cift[]>([]);
  const [solKarilik, setSolKarilik] = useState<string[]>([]); // semboller (karılmış)
  const [sagKarilik, setSagKarilik] = useState<string[]>([]); // isimler (karılmış)

  const [tur, setTur] = useState(1);
  const [hata, setHata] = useState(0);
  const [puan, setPuan] = useState(0);
  const [sonuc, setSonuc] = useState<TurSonucu | null>(null);
  const [saving, setSaving] = useState(false);

  const [seciliSol, setSeciliSol] = useState<string | null>(null);
  const [seciliSag, setSeciliSag] = useState<string | null>(null);
  const [yanlis, setYanlis] = useState<string | null>(null);
  const startTime = useRef(Date.now());

  const turKur = useCallback((turNo: number) => {
    const esler = shuffle(ELEMENTS).slice(0, TUR_BASI_ES);
    setCiftler(esler.map((e) => ({ element: e, eslesti: false, hata: false })));
    setSolKarilik(shuffle(esler.map((e) => e.symbol)));
    setSagKarilik(shuffle(esler.map((e) => e.name)));
    setSeciliSol(null);
    setSeciliSag(null);
    setYanlis(null);
    setTur(turNo);
  }, []);

  const basla = useCallback(() => {
    setHata(0);
    setPuan(0);
    startTime.current = Date.now();
    turKur(1);
    setAsama("oyun");
  }, [turKur]);

  const bitir = useCallback(
    async (finalPuan: number) => {
      setSaving(true);
      const durationSec = Math.round((Date.now() - startTime.current) / 1000);
      try {
        const res = await fetch("/api/quiz/finish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            unitId: null,
            mode: "bulmaca",
            score: finalPuan,
            accuracy: 1 - hata / (TUR_SAYISI * TUR_BASI_ES * 2), // kabaca doğruluk
            maxStreak: 0,
            durationSec,
          }),
        });
        const data = await res.json();
        if (res.ok) setSonuc(data);
      } catch {
        // bitiş ekranı yine gösterilir
      } finally {
        setSaving(false);
      }
    },
    [hata]
  );

  const turuBitir = useCallback(() => {
    if (tur >= TUR_SAYISI) {
      const finalPuan = Math.max(0, puan);
      setAsama("bitis");
      bitir(finalPuan);
    } else {
      turKur(tur + 1);
    }
  }, [tur, puan, turKur, bitir]);

  function solTikla(sembol: string) {
    if (seciliSag) return; // önce sağ taraf seçilmeli
    setSeciliSol(sembol);
  }

  function sagTikla(isim: string) {
    if (!seciliSol || seciliSag) return;

    const cift = ciftler.find((c) => c.element.name === isim);
    if (!cift) return;

    if (cift.element.symbol === seciliSol) {
      // doğru eşleşme
      setCiftler((cs) => cs.map((c) => (c.element.name === isim ? { ...c, eslesti: true } : c)));
      setPuan((p) => p + 100);
      setSeciliSol(null);
      setSeciliSag(null);

      const kalan = ciftler.filter((c) => !c.eslesti && c.element.name !== isim).length;
      if (kalan === 0) {
        setTimeout(turuBitir, 400);
      }
    } else {
      // yanlış eşleşme
      setHata((h) => h + 1);
      setPuan((p) => Math.max(0, p - 20));
      setYanlis(isim);
      setTimeout(() => setYanlis(null), 500);
      setSeciliSol(null);
    }
  }

  // ---------- Görünümler ----------
  if (asama === "hazirlik") {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <p className="text-4xl">🧩</p>
          <h2 className="mt-3 text-3xl font-black">Bulmaca Krallığı</h2>
          <p className="mt-3 text-slate-400">
            Sembolü sol taraftan, doğru ismini sağ taraftan seçerek eşleştir.
            {TUR_SAYISI} tur · her turda {TUR_BASI_ES} çift.
            Her doğru çift <span className="font-semibold text-cyan-300">100 puan</span>, her hata{" "}
            <span className="font-semibold text-rose-300">-20 puan</span>.
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
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <p className="text-sm font-medium tracking-widest text-cyan-400 uppercase">Tamamlandı</p>
          <h2 className="mt-2 text-3xl font-black">🧩 Bulmaca Sonucu</h2>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-800 p-4">
              <p className="text-2xl font-black text-cyan-400">{puan}</p>
              <p className="mt-1 text-xs text-slate-400">Puan</p>
            </div>
            <div className="rounded-2xl bg-slate-800 p-4">
              <p className="text-2xl font-black text-rose-400">{hata}</p>
              <p className="mt-1 text-xs text-slate-400">Hata</p>
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
            <Link href="/koleksiyon" className="rounded-xl border border-slate-600 px-6 py-3 font-semibold hover:border-slate-400">
              🧫 Koleksiyon
            </Link>
          </div>
          {saving && <p className="mt-3 text-xs text-slate-500">Skor kaydediliyor...</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">🧩 Bulmaca Krallığı</h2>
          <p className="text-xs text-slate-500">
            Tur {tur}/{TUR_SAYISI} · {ciftler.filter((c) => c.eslesti).length}/{TUR_BASI_ES} çift
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-cyan-400">{puan} puan</p>
          <p className="text-xs text-slate-400">Hata: {hata}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Sol: semboller */}
        <div className="grid gap-3">
          {solKarilik.map((sembol) => {
            const cift = ciftler.find((c) => c.element.symbol === sembol);
            const eslesti = cift?.eslesti;
            const secili = seciliSol === sembol;
            return (
              <button
                key={sembol}
                disabled={eslesti}
                onClick={() => solTikla(sembol)}
                className={`rounded-xl border p-4 text-2xl font-black tracking-wide transition ${
                  eslesti
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                    : secili
                      ? "border-cyan-400 bg-cyan-500/15 text-cyan-300"
                      : "border-slate-700 bg-slate-800/60 hover:border-cyan-500"
                }`}
              >
                {sembol}
              </button>
            );
          })}
        </div>

        {/* Sağ: isimler */}
        <div className="grid gap-3">
          {sagKarilik.map((isim) => {
            const cift = ciftler.find((c) => c.element.name === isim);
            const eslesti = cift?.eslesti;
            const yanlisMi = yanlis === isim;
            return (
              <button
                key={isim}
                disabled={eslesti}
                onClick={() => sagTikla(isim)}
                className={`rounded-xl border p-4 text-left font-semibold transition ${
                  eslesti
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                    : yanlisMi
                      ? "border-rose-500 bg-rose-500/20 text-rose-300"
                      : "border-slate-700 bg-slate-800/60 hover:border-cyan-500"
                }`}
              >
                {isim}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        Önce sol taraftan sembolü, sonra sağ taraftan ismini seç.
      </p>
    </div>
  );
}
