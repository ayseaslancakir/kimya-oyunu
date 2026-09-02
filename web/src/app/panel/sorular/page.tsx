import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import SoruEkle from "@/components/SoruEkle";

export default async function SorularPage() {
  const session = await getSession();
  if (!session) redirect("/giris");
  if (session.role !== "teacher") redirect("/harita");

  const siniflar = await prisma.grade.findMany({
    orderBy: { code: "asc" },
    include: {
      themes: {
        orderBy: { orderIndex: "asc" },
        include: {
          units: {
            orderBy: { orderIndex: "asc" },
            include: { outcomes: { select: { code: true, description: true }, orderBy: { code: "asc" } } },
          },
        },
      },
    },
  });

  const questions = await prisma.question.findMany({
    include: {
      outcome: true,
      _count: { select: { options: true } },
    },
    orderBy: { id: "desc" },
    take: 30,
  });

  const siniflarProps = siniflar.map((g) => ({
    kod: g.code,
    temalar: g.themes.map((t) => ({
      id: t.id,
      adi: t.name,
      uniteler: t.units.map((u) => ({
        id: u.id,
        adi: u.name,
        ciktilar: u.outcomes.map((o) => ({ kod: o.code, metin: o.description })),
      })),
    })),
  }));

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/panel" className="text-sm text-slate-400 hover:text-cyan-300">
            ← Panel
          </Link>
          <h1 className="mt-1 text-3xl font-black">📝 Soru Bankası Yönetimi</h1>
          <p className="mt-1 text-slate-400">
            Müfredata bağlı kendi sorularını ekle; öğrencilerin tüm modlarda karşısına çıkar.
          </p>
        </div>
      </div>

      <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-bold">Yeni Soru Ekle</h2>
        <p className="mt-1 text-sm text-slate-400">
          Sınıf → Tema → Ünite → Öğrenme çıktısı seç, soruyu yaz, doğru cevabı işaretle.
        </p>
        <div className="mt-5">
          <SoruEkle siniflar={siniflarProps} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">Son Eklenen Sorular ({questions.length})</h2>
        <div className="mt-4 grid gap-3">
          {questions.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
              Henüz soru yok.
            </p>
          ) : (
            questions.map((q) => (
              <div key={q.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{q.prompt}</p>
                  <span className="shrink-0 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-cyan-300">
                    {q.outcome.code}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Zorluk {q.difficulty} · {q._count.options} seçenek
                  {q.outcome.cognitiveLevel ? ` · ${q.outcome.cognitiveLevel}` : ""}
                </p>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
