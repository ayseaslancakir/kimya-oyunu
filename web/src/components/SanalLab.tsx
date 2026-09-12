"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { DENEYLER, type Deney } from "@/data/experiments";

type TurSonucu = {
  xp: number;
  score: number;
  achievements: { slug: string; name: string; icon: string }[];
  element: { symbol: string; name: string; number: number } | null;
};

type Asama = "secim" | "deney" | "sonuc";

const GUVENLIK_CEZASI = 50; // güvenlik ihlali başına ek puan cezası

// Puan: doğru adım +100, yanlış adım −20, güvenlik ihlali ek −50.
function puanHesapla(dogruSayisi: number, hataSayisi: number, ihlalSayisi: number): number {
  return Math.max(0, dogruSayisi * 100 - hataSayisi * 20 - ihlalSayisi * GUVENLIK_CEZASI);
}

export default function SanalLab() {
  const [asama, setAsama] = useState<Asama>("secim");
  const [deney, setDeney] = useState<Deney | null>(null);
  const [adim, setAdim] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [dogruMu, setDogruMu] = useState<boolean | null>(null);
  const [guvenlikUyarisi, setGuvenlikUyarisi] = useState<string | null>(null);
  const [guvenlikIhlaliSayisi, setGuvenlikIhlaliSayisi] = useState(0);
  const [gozlemler, setGozlemler] = useState<string[]>([]);
  const [dogru, setDogru] = useState(0);
  const [hata, setHata] = useState(0);
  const [sonuc, setSonuc] = useState<TurSonucu | null>(null);
  const [saving, setSaving] = useState(false);
  const startTime = useRef(Date.now());

  function basla(d: Deney) {
    setDeney(d);
    setAdim(0);
    setDogru(0);
    setHata(0);
    setSelected(null);
    setDogruMu(null);
    setGuvenlikUyarisi(null);
    setGuvenlikIhlaliSayisi(0);
    setGozlemler([]);
    setSonuc(null);
    startTime.current = Date.now();
    setAsama("deney");
  }

  async function bitir(finalDogru: number, finalHata: number, finalIhlal: number) {
    if (!deney) return;
    setSaving(true);
    const durationSec = Math.round((Date.now() - startTime.current) / 1000);
    const toplam = deney.adimlar.length;
    try {
      const res = await fetch("/api/quiz/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId: null,
          mode: "sanal_lab",
          score: puanHesapla(finalDogru, finalHata, finalIhlal),
          accuracy: toplam > 0 ? finalDogru / toplam : 0,
          maxStreak: 0,
          durationSec,
        }),
      });
      const data = await res.json();
      if (res.ok) setSonuc(data);
    } catch {
      // sonuç ekranı yine gösterilir
    } finally {
      setSaving(false);
    }
  }

  function cevapla(optIdx: number) {
    if (!deney || dogruMu !== null) return;
    setSelected(optIdx);
    const adimData = deney.adimlar[adim];
    const dogruCevap = optIdx === adimData.dogru;
    // Yanlış seçenek bir güvenlik ihlaliyse uyarı gösterilir ve puan düşer.
    const uyari = dogruCevap ? null : (adimData.guvenlik?.[optIdx] ?? null);

    setDogruMu(dogruCevap);
    setGuvenlikUyarisi(uyari);

    if (dogruCevap) {
      setDogru((d) => d + 1);
    } else {
      setHata((h) => h + 1);
      if (uyari) setGuvenlikIhlaliSayisi((g) => g + 1);
    }

    // Gözlem defteri: her adımın gözlemi birikir; güvenlik ihlali ayrıca not edilir.
    const eklenecek: string[] = [];
    if (uyari) eklenecek.push(`🚨 Güvenlik ihlali: ${uyari}`);
    eklenecek.push(adimData.sonuc);
    setGozlemler((g) => [...g, ...eklenecek]);
  }

  function siradaki() {
    if (!deney) return;
    setSelected(null);
    setDogruMu(null);
    setGuvenlikUyarisi(null);
    if (adim + 1 >= deney.adimlar.length) {
      setAsama("sonuc");
      bitir(dogru, hata, guvenlikIhlaliSayisi);
    } else {
      setAdim((a) => a + 1);
    }
  }

  // ---------- Görünümler ----------
  if (asama === "secim") {
    return (
      <div className="mx-auto max-w-3xl py-12">
        <div className="text-center">
          <p className="text-5xl">🔬</p>
          <h1 className="mt-3 text-3xl font-black">Sanal Laboratuvar</h1>
          <p className="mt-2 text-slate-400">
            Gerçek laboratuvarda riskli olabilecek deneyleri güvenle yap. Adımları doğru seç, gözlemleri kaydet.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          {DENEYLER.map((d) => (
            <button
              key={d.id}
              onClick={() => basla(d)}
              className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left transition hover:border-cyan-500"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold group-hover:text-cyan-300">{d.ad}</h3>
                <span className="text-xs text-slate-500">{d.ciktiKodu}</span>
              </div>
              <p className="mt-1 text-sm text-slate-400">{d.amac}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {d.malzemeler.map((m) => (
                  <span key={m} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                    🧫 {m}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (asama === "sonuc" && deney) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="rounded-3xl border border-slate-700 bg-slate-900 p-8">
          <p className="text-5xl">{dogru === deney.adimlar.length ? "🧪" : "📋"}</p>
          <h2 className="mt-3 text-3xl font-black">Deney Tamamlandı</h2>
          <p className="mt-2 text-sm text-slate-500">
            {deney.ad} · {deney.ciktiKodu}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-slate-800 p-4">
              <p className="text-2xl font-black text-cyan-400">{sonuc?.score ?? 0}</p>
              <p className="mt-1 text-xs text-slate-400">Puan</p>
            </div>
            <div className="rounded-2xl bg-slate-800 p-4">
              <p className="text-2xl font-black text-emerald-400">
                {dogru}/{deney.adimlar.length}
              </p>
              <p className="mt-1 text-xs text-slate-400">Doğru adım</p>
            </div>
            <div className="rounded-2xl bg-slate-800 p-4">
              <p className="text-2xl font-black text-rose-400">{hata}</p>
              <p className="mt-1 text-xs text-slate-400">Hata</p>
            </div>
          </div>

          {guvenlikIhlaliSayisi > 0 && (
            <p className="mt-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm font-semibold text-rose-300">
              🚨 {guvenlikIhlaliSayisi} güvenlik ihlali (−{guvenlikIhlaliSayisi * GUVENLIK_CEZASI} puan)
            </p>
          )}

          {/* Adım adım biriken gözlemlerin özeti */}
          <div className="mt-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-4 text-left">
            <p className="text-sm font-bold text-cyan-300">📝 Deney Raporu</p>
            {gozlemler.length > 0 ? (
              <ol className="mt-2 grid gap-1.5 text-sm text-slate-300">
                {gozlemler.map((g, i) => (
                  <li key={i} className={g.startsWith("🚨") ? "text-rose-300" : ""}>
                    {i + 1}. {g}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-1 text-sm text-slate-400">Gözlem kaydedilmedi.</p>
            )}
            <p className="mt-3 border-t border-cyan-500/20 pt-3 text-sm text-slate-300">{deney.sonucMetni}</p>
          </div>

          {sonuc?.achievements && sonuc.achievements.length > 0 && (
            <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-left">
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
            <button
              onClick={() => setAsama("secim")}
              className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Başka Deney Yap
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

  if (!deney) return null;

  const adimData = deney.adimlar[adim];

  return (
    <div className="mx-auto max-w-2xl py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">🔬 {deney.ad}</h2>
          <p className="text-xs text-slate-500">
            Adım {adim + 1}/{deney.adimlar.length} · {deney.ciktiKodu}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-cyan-400">
            {puanHesapla(dogru, hata, guvenlikIhlaliSayisi)} puan
          </p>
          <p className="text-xs text-slate-400">
            Hata: {hata}
            {guvenlikIhlaliSayisi > 0 && (
              <span className="text-rose-400"> · İhlal: {guvenlikIhlaliSayisi}</span>
            )}
          </p>
        </div>
      </div>

      {/* Amaç + malzemeler */}
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-cyan-300">Amaç:</span> {deney.amac}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {deney.malzemeler.map((m) => (
            <span key={m} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
              🧫 {m}
            </span>
          ))}
        </div>
      </div>

      {/* Adım kartı */}
      <div className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
        <p className="text-xs uppercase tracking-widest text-slate-500">Prosedür</p>
        <h3 className="mt-2 text-lg font-semibold leading-snug">{adimData.soru}</h3>

        <div className="mt-5 grid gap-3">
          {adimData.secenekler.map((sec, i) => {
            let stil = "border-slate-700 bg-slate-800/60 hover:border-cyan-500 hover:bg-slate-800";
            if (dogruMu !== null) {
              if (i === adimData.dogru) stil = "border-emerald-500 bg-emerald-500/15 text-emerald-300";
              else if (i === selected) stil = "border-rose-500 bg-rose-500/15 text-rose-300";
              else stil = "border-slate-800 bg-slate-900 text-slate-500";
            }
            return (
              <button
                key={i}
                disabled={dogruMu !== null}
                onClick={() => cevapla(i)}
                className={`rounded-xl border p-4 text-left font-medium transition disabled:cursor-default ${stil}`}
              >
                {sec}
              </button>
            );
          })}
        </div>

        {dogruMu !== null && (
          <div
            className={`mt-5 rounded-2xl border p-4 ${
              guvenlikUyarisi
                ? "border-rose-600 bg-rose-500/10"
                : "border-cyan-600/50 bg-cyan-500/5"
            }`}
          >
            <p
              className={`text-sm font-bold ${
                guvenlikUyarisi ? "text-rose-300" : dogruMu ? "text-emerald-300" : "text-amber-300"
              }`}
            >
              {guvenlikUyarisi
                ? `🚨 GÜVENLİK İHLALİ! (−${GUVENLIK_CEZASI} puan)`
                : dogruMu
                  ? "✅ Doğru adım!"
                  : "❌ Bu adım güvenli değil!"}
            </p>
            <p className="mt-1 text-sm text-slate-300">{guvenlikUyarisi ?? adimData.aciklama}</p>
            <p className="mt-2 text-sm italic text-cyan-300">{adimData.sonuc}</p>
            <button
              onClick={siradaki}
              className="mt-4 rounded-xl bg-cyan-500 px-6 py-2.5 font-semibold text-slate-950 hover:bg-cyan-400"
            >
              {adim + 1 >= deney.adimlar.length ? "Deneyi Bitir 🧾" : "Sonraki Adım →"}
            </button>
          </div>
        )}
      </div>

      {/* Adım adım biriken gözlem defteri */}
      {gozlemler.length > 0 && (
        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm font-bold text-slate-300">
            📝 Gözlem Defteri <span className="text-xs font-normal text-slate-500">({gozlemler.length} kayıt)</span>
          </p>
          <ol className="mt-2 grid max-h-48 gap-1.5 overflow-y-auto pr-1 text-sm text-slate-400">
            {gozlemler.map((g, i) => (
              <li key={i} className={g.startsWith("🚨") ? "text-rose-300" : ""}>
                {i + 1}. {g}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
