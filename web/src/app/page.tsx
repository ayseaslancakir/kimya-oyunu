// Ana sayfa (Faz 0 iskeleti)
// TYMM kimya programının 12 tema bölgesini (4 sınıf × 3 tema) gösterir.
// Faz 1'de: giriş/kayıt linkleri + müfredat haritası buradan bağlanacak.

const SINIFLAR = [9, 10, 11, 12];

const TEMALAR = [
  { ad: "Etkileşim", renk: "from-cyan-500 to-blue-600", ikon: "⚛️" },
  { ad: "Çeşitlilik", renk: "from-emerald-500 to-teal-600", ikon: "🧫" },
  { ad: "Sürdürülebilirlik", renk: "from-amber-500 to-orange-600", ikon: "🌱" },
];

const MODLAR = [
  { ad: "Quiz Arena", aciklama: "Süreli bilgi düellosu — combo ve skor sistemi", durum: "Hazır", href: "/harita" },
  { ad: "Hız Yarışı", aciklama: "60 saniyelik arcade tur — sembol ve isim eşleştirme", durum: "Hazır", href: "/oyun/hiz" },
  { ad: "Bulmaca Krallığı", aciklama: "Sembol ↔ isim eşleştirme bulmacası", durum: "Hazır", href: "/oyun/bulmaca" },
  { ad: "Lab Kaçış Odası", aciklama: "Ünite sonu senaryo modu — süre ve can", durum: "Hazır", href: "/harita" },
  { ad: "Sanal Laboratuvar", aciklama: "Güvenli deney simülasyonu — adım adım prosedür", durum: "Hazır", href: "/oyun/lab" },
  { ad: "Canlı Düello", aciklama: "İki oyuncu aynı soruları çözer, skor karşılaştırması", durum: "Hazır", href: "/oyun/duel" },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      {/* Hero */}
      <section className="text-center">
        <p className="text-sm font-medium tracking-widest text-cyan-400 uppercase">
          Türkiye Yüzyılı Maarif Modeli
        </p>
        <h1 className="mt-4 text-5xl font-black tracking-tight">
          Kimyayı <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Oynayarak</span> Öğren
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          9, 10, 11 ve 12. sınıf kimya müfredatının tamamı — tema haritaları,
          oyun modları ve kaydedilen ilerlemeyle.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="/harita"
            className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Haritayı Keşfet
          </a>
          <a
            href="/kayit"
            className="rounded-xl border border-slate-600 px-6 py-3 font-semibold transition hover:border-slate-400"
          >
            Ücretsiz Kayıt Ol
          </a>
        </div>
      </section>

      {/* 12 tema bölgesi */}
      <section id="harita" className="mt-20">
        <h2 className="text-2xl font-bold">Müfredat Haritası</h2>
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

      {/* Oyun modları */}
      <section id="modlar" className="mt-20">
        <h2 className="text-2xl font-bold">Oyun Modları</h2>
        <p className="mt-1 text-slate-400">
          Aynı müfredat içeriği, farklı oyun deneyimleri
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {MODLAR.map((mod) => (
            <a
              key={mod.ad}
              href={mod.href}
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-600"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold group-hover:text-cyan-300">{mod.ad}</h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    mod.durum === "Hazır"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {mod.durum}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{mod.aciklama}</p>
            </a>
          ))}
        </div>
      </section>

      <footer className="mt-24 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
        TYMM Kimya Dersi Öğretim Programı (2026) · Kaynak: mufredat.meb.gov.tr
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
        <span>{tema.ikon}</span>
        <span>{tema.ad}</span>
      </div>
      {SINIFLAR.map((s) => (
        <a
          key={`${s}-${tema.ad}`}
          href="/harita"
          className={`flex min-h-16 items-center justify-center rounded-xl bg-gradient-to-br ${tema.renk} p-3 text-center text-sm font-semibold text-white/95 opacity-70 transition hover:opacity-100`}
        >
          {s}.{temaIdx + 1}
        </a>
      ))}
    </>
  );
}
