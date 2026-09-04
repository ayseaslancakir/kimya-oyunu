import Link from "next/link";
import { getSession } from "@/lib/auth";

const SINIFLAR = [9, 10, 11, 12];

const TEMALAR = [
  { ad: "Etkileşim", renk: "bg-cyan-700", ikon: "E" },
  { ad: "Çeşitlilik", renk: "bg-emerald-700", ikon: "C" },
  { ad: "Sürdürülebilirlik", renk: "bg-amber-700", ikon: "S" },
];

const MODLAR = [
  { ad: "Quiz Arena", aciklama: "Süreli bilgi düellosu — combo ve açıklamalı geri bildirim", durum: "Hazır", href: "/harita" },
  { ad: "Hız Yarışı", aciklama: "60 saniyelik arcade — sembolü görün, ismini seç", durum: "Hazır", href: "/oyun/hiz" },
  { ad: "Bulmaca Krallığı", aciklama: "Sembol ↔ isim eşleştirme, 3 tur", durum: "Hazır", href: "/oyun/bulmaca" },
  { ad: "Lab Kaçış Odası", aciklama: "Ünite sonu senaryo — süre, can, ipucu", durum: "Hazır", href: "/harita" },
  { ad: "Sanal Laboratuvar", aciklama: "Adım adım güvenli deney prosedürü", durum: "Hazır", href: "/oyun/lab" },
  { ad: "Canlı Düello", aciklama: "Arkadaşınla aynı soruları çöz, skoru karşılaştır", durum: "Hazır", href: "/oyun/duel" },
];

export default async function HomePage() {
  const session = await getSession();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <section className="text-center">
        <p className="text-sm font-medium tracking-widest text-cyan-400 uppercase">
          Türkiye Yüzyılı Maarif Modeli
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          Kimyayı <span className="text-cyan-400">oynayarak</span> öğren
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          9–12. sınıf TYMM kimya müfredatı. Kayıt ol, üniteni seç, soru çöz;
          ilerlemen, rozetlerin ve koleksiyonun kaydolur.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href={session ? "/harita" : "/kayit"}
            className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            {session ? "Haritaya git" : "Ücretsiz kayıt ol"}
          </Link>
          <Link
            href="/oyun/hiz"
            className="rounded-xl border border-slate-600 px-6 py-3 font-semibold transition hover:border-slate-400"
          >
            60 sn hız yarışı dene
          </Link>
        </div>
      </section>

      <section className="mt-16 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left">
          <p className="text-sm font-bold text-cyan-300">1. Kayıt</p>
          <p className="mt-1 text-sm text-slate-400">Öğrenci veya öğretmen hesabı aç. İlerlemen sunucuda durur.</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left">
          <p className="text-sm font-bold text-cyan-300">2. Ünite seç</p>
          <p className="mt-1 text-sm text-slate-400">Haritadan sınıf → tema → ünite. Quiz veya kaçış odası.</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 text-left">
          <p className="text-sm font-bold text-cyan-300">3. Tekrar oyna</p>
          <p className="mt-1 text-sm text-slate-400">XP, rozet, element kartı ve liderlik tablosu seni geri çeker.</p>
        </div>
      </section>

      <section id="harita" className="mt-20">
        <h2 className="text-2xl font-bold">Müfredat haritası</h2>
        <p className="mt-1 text-slate-400">
          Her sınıfta 3 tema · toplam 12 bölge (resmi TYMM programına göre)
        </p>

        <div className="mt-6 overflow-x-auto">
          <div className="grid min-w-[640px] grid-cols-5 gap-3">
            <div />
            {SINIFLAR.map((s) => (
              <div key={s} className="text-center text-lg font-bold text-slate-200">
                {s}. Sınıf
              </div>
            ))}

            {TEMALAR.map((tema, temaIdx) => (
              <TemaSatiri key={tema.ad} tema={tema} temaIdx={temaIdx} />
            ))}
          </div>
        </div>
      </section>

      <section id="modlar" className="mt-20">
        <h2 className="text-2xl font-bold">Oyun modları</h2>
        <p className="mt-1 text-slate-400">Aynı müfredat, farklı tempo</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {MODLAR.map((mod) => (
            <Link
              key={mod.ad}
              href={mod.href}
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-cyan-700"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold group-hover:text-cyan-300">{mod.ad}</h3>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                  {mod.durum}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{mod.aciklama}</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-24 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
        TYMM Kimya Dersi Öğretim Programı (2026) · Kaynak: mufredat.meb.gov.tr
        {" · "}
        <Link href="/gizlilik" className="text-slate-400 hover:text-cyan-300">
          Gizlilik
        </Link>
      </footer>
    </main>
  );
}

function TemaSatiri({
  tema,
  temaIdx,
}: {
  tema: { ad: string; renk: string; ikon: string };
  temaIdx: number;
}) {
  return (
    <>
      <div className="flex items-center gap-2 font-medium text-slate-300">
        <span className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-black text-white ${tema.renk}`}>
          {tema.ikon}
        </span>
        <span>{tema.ad}</span>
      </div>
      {SINIFLAR.map((s) => (
        <Link
          key={`${s}-${tema.ad}`}
          href="/harita"
          className={`flex min-h-16 items-center justify-center rounded-xl ${tema.renk} p-3 text-center text-sm font-semibold text-white/95 opacity-80 transition hover:opacity-100`}
        >
          {s}.{temaIdx + 1}
        </Link>
      ))}
    </>
  );
}
