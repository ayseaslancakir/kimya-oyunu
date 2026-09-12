"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ELEMENTS, shuffle } from "@/data/elements";

const TUR_BASI_ES = 4; // her turda 4 çift
const TUR_SAYISI = 3;

// Ünite modunda sunucudan gelen eşleştirme kartları (soru ↔ doğru cevap).
export type BulmacaKarti = { sol: string; sag: string };

type Cift = { id: string; sol: string; sag: string };

type TurSonucu = {
  xp: number;
  score: number;
  achievements: { slug: string; name: string; icon: string }[];
  element: { symbol: string; name: string; number: number } | null;
};

type Asama = "hazirlik" | "oyun" | "bitis";

// Element turu: rastgele 4 element çifti (ünite verilmediğinde mevcut davranış).
function elementCiftleri(): Cift[] {
  return shuffle(ELEMENTS)
    .slice(0, TUR_BASI_ES)
    .map((e) => ({ id: `e${e.number}`, sol: e.symbol, sag: e.name }));
}

// Ünite kartlarını turlara böler (son tur tek kart kaldıysa öncekiyle birleştirir).
function uniteTurlari(kartlar: BulmacaKarti[]): Cift[][] {
  const karisik = shuffle(kartlar.map((k, i) => ({ id: `k${i}`, sol: k.sol, sag: k.sag })));
  const gruplar: Cift[][] = [];
  for (let i = 0; i < karisik.length && gruplar.length < TUR_SAYISI; i += TUR_BASI_ES) {
    gruplar.push(karisik.slice(i, i + TUR_BASI_ES));
  }
  if (gruplar.length > 1 && gruplar[gruplar.length - 1].length < 2) {
    const tek = gruplar.pop() as Cift[];
    gruplar[gruplar.length - 1] = [...gruplar[gruplar.length - 1], ...tek];
  }
  return gruplar;
}

// Ünite verilmezse genel element turu; ünite verilirse kartlar ünitenin sorularından gelir.
export default function Bulmaca({
  unitId,
  unitName,
  kartlar,
}: {
  unitId?: number;
  unitName?: string;
  kartlar?: BulmacaKarti[];
}) {
  const uniteModu = Array.isArray(kartlar) && kartlar.length >= 2;

  const [asama, setAsama] = useState<Asama>("hazirlik");
  const [ciftler, setCiftler] = useState<Cift[]>([]);
  const [solSira, setSolSira] = useState<string[]>([]); // soldaki kartların id sırası (karılmış)
  const [sagSira, setSagSira] = useState<string[]>([]); // sağdaki kartların id sırası (karılmış)
  const [eslesenIdler, setEslesenIdler] = useState<string[]>([]);

  const [tur, setTur] = useState(1);
  const [turSayisi, setTurSayisi] = useState(TUR_SAYISI);
  const [hata, setHata] = useState(0);
  const [puan, setPuan] = useState(0);
  const [sonuc, setSonuc] = useState<TurSonucu | null>(null);
  const [saving, setSaving] = useState(false);

  const [seciliSolId, setSeciliSolId] = useState<string | null>(null);
  const [yanlisId, setYanlisId] = useState<string | null>(null);
  const startTime = useRef(Date.now());
  const turlarRef = useRef<Cift[][]>([]);
  const ciftSayisiRef = useRef(0);

  const turKur = useCallback((turNo: number) => {
    const grup = turlarRef.current[turNo - 1] ?? [];
    setCiftler(grup);
    setSolSira(shuffle(grup.map((c) => c.id)));
    setSagSira(shuffle(grup.map((c) => c.id)));
    setEslesenIdler([]);
    setSeciliSolId(null);
    setYanlisId(null);
    setTur(turNo);
  }, []);

  const basla = useCallback(() => {
    const turlar = uniteModu
      ? uniteTurlari(kartlar as BulmacaKarti[])
      : Array.from({ length: TUR_SAYISI }, elementCiftleri);
    turlarRef.current = turlar;
    ciftSayisiRef.current = turlar.reduce((a, g) => a + g.length, 0);
    setTurSayisi(turlar.length);
    setHata(0);
    setPuan(0);
    setSonuc(null);
    startTime.current = Date.now();
    turKur(1);
    setAsama("oyun");
  }, [uniteModu, kartlar, turKur]);

  const bitir = useCallback(
    async (finalPuan: number) => {
      setSaving(true);
      const durationSec = Math.round((Date.now() - startTime.current) / 1000);
      const toplamCift = Math.max(1, ciftSayisiRef.current);
      try {
        const res = await fetch("/api/quiz/finish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            unitId: uniteModu ? unitId : null, // skor üniteye kaydedilir
            mode: "bulmaca",
            score: finalPuan,
            accuracy: Math.max(0, Math.min(1, 1 - hata / (toplamCift * 2))), // kabaca doğruluk
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
    [hata, uniteModu, unitId]
  );

  const turuBitir = useCallback(() => {
    if (tur >= turSayisi) {
      const finalPuan = Math.max(0, puan);
      setAsama("bitis");
      bitir(finalPuan);
    } else {
      turKur(tur + 1);
    }
  }, [tur, turSayisi, puan, turKur, bitir]);

  function solTikla(id: string) {
    if (eslesenIdler.includes(id)) return;
    setSeciliSolId(id);
  }

  function sagTikla(id: string) {
    if (!seciliSolId || eslesenIdler.includes(id)) return; // önce sol taraf seçilmeli

    if (id === seciliSolId) {
      // doğru eşleşme
      const yeniEslesen = [...eslesenIdler, id];
      setEslesenIdler(yeniEslesen);
      setPuan((p) => p + 100);
      setSeciliSolId(null);

      if (yeniEslesen.length === ciftler.length) {
        setTimeout(turuBitir, 400);
      }
    } else {
      // yanlış eşleşme
      setHata((h) => h + 1);
      setPuan((p) => Math.max(0, p - 20));
      setYanlisId(id);
      setTimeout(() => setYanlisId(null), 500);
      setSeciliSolId(null);
    }
  }

  // ---------- Görünümler ----------
  if (asama === "hazirlik") {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <p className="text-4xl">🧩</p>
          <h2 className="mt-3 text-3xl font-black">Bulmaca Krallığı</h2>
          {uniteModu && unitName && (
            <p className="mt-1 text-sm font-semibold text-cyan-300">{unitName}</p>
          )}
          <p className="mt-3 text-slate-400">
            {uniteModu
              ? "Soldan soruyu, sağdan doğru cevabı seçerek eşleştir."
              : "Sembolü sol taraftan, doğru ismini sağ taraftan seçerek eşleştir."}
            {uniteModu
              ? ` En fazla ${TUR_SAYISI} tur · her turda ${TUR_BASI_ES} kart.`
              : ` ${TUR_SAYISI} tur · her turda ${TUR_BASI_ES} çift.`}
            {" "}Her doğru çift <span className="font-semibold text-cyan-300">100 puan</span>, her hata{" "}
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
          {uniteModu && unitName && (
            <p className="mt-1 text-sm text-slate-400">{unitName}</p>
          )}

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
          <h2 className="text-xl font-bold">🧩 Bulmaca Krallığı{unitName ? ` · ${unitName}` : ""}</h2>
          <p className="text-xs text-slate-500">
            Tur {tur}/{turSayisi} · {eslesenIdler.length}/{ciftler.length} çift
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-cyan-400">{puan} puan</p>
          <p className="text-xs text-slate-400">Hata: {hata}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Sol: semboller (element modu) veya sorular (ünite modu) */}
        <div className="grid gap-3">
          {solSira.map((id) => {
            const cift = ciftler.find((c) => c.id === id);
            if (!cift) return null;
            const eslesti = eslesenIdler.includes(id);
            const secili = seciliSolId === id;
            return (
              <button
                key={id}
                disabled={eslesti}
                onClick={() => solTikla(id)}
                className={`rounded-xl border p-4 transition ${
                  uniteModu ? "text-left text-sm font-semibold leading-snug" : "text-2xl font-black tracking-wide"
                } ${
                  eslesti
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                    : secili
                      ? "border-cyan-400 bg-cyan-500/15 text-cyan-300"
                      : "border-slate-700 bg-slate-800/60 hover:border-cyan-500"
                }`}
              >
                {cift.sol}
              </button>
            );
          })}
        </div>

        {/* Sağ: isimler (element modu) veya cevaplar (ünite modu) */}
        <div className="grid gap-3">
          {sagSira.map((id) => {
            const cift = ciftler.find((c) => c.id === id);
            if (!cift) return null;
            const eslesti = eslesenIdler.includes(id);
            const yanlisMi = yanlisId === id;
            return (
              <button
                key={id}
                disabled={eslesti}
                onClick={() => sagTikla(id)}
                className={`rounded-xl border p-4 text-left font-semibold transition ${
                  uniteModu ? "text-sm leading-snug" : ""
                } ${
                  eslesti
                    ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
                    : yanlisMi
                      ? "border-rose-500 bg-rose-500/20 text-rose-300"
                      : "border-slate-700 bg-slate-800/60 hover:border-cyan-500"
                }`}
              >
                {cift.sag}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        Önce sol taraftan {uniteModu ? "soruyu" : "sembolü"}, sonra sağ taraftan{" "}
        {uniteModu ? "doğru cevabı" : "ismini"} seç.
      </p>
    </div>
  );
}
