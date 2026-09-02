import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import SinifOlustur from "@/components/SinifOlustur";

export default async function PanelPage() {
  const session = await getSession();
  if (!session) redirect("/giris");
  if (session.role !== "teacher") redirect("/harita");

  const classes = await prisma.class.findMany({
    where: { teacherId: session.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { students: true } } },
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">🛠️ Öğretmen Paneli</h1>
          <p className="mt-1 text-slate-400">Sınıflarını yönet, öğrenci gelişimini izle.</p>
        </div>
        <Link
          href="/harita"
          className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold transition hover:border-slate-400"
        >
          ← Harita
        </Link>
      </div>

      <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-bold">Yeni Sınıf Oluştur</h2>
        <p className="mt-1 text-sm text-slate-400">
          Sınıf oluştur, öğrencilere <span className="font-mono text-cyan-300">davet kodunu</span> ver; öğrenciler{" "}
          <Link href="/sinif" className="text-cyan-400 hover:underline">
            /sinif
          </Link>{" "}
          sayfasından katılsın.
        </p>
        <div className="mt-4">
          <SinifOlustur />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold">Sınıflarım ({classes.length})</h2>

        {classes.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
            Henüz sınıf oluşturmadın.
          </p>
        ) : (
          <div className="mt-4 grid gap-4">
            {classes.map((c) => (
              <Link
                key={c.id}
                href={`/panel/sinif/${c.id}`}
                className="group flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-cyan-600"
              >
                <div>
                  <h3 className="text-lg font-semibold group-hover:text-cyan-300">{c.name}</h3>
                  <p className="mt-1 font-mono text-sm tracking-widest text-slate-400">
                    Davet kodu: <span className="font-bold text-amber-300">{c.inviteCode}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-cyan-400">{c._count.students}</p>
                  <p className="text-xs text-slate-400">öğrenci</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <section className="mt-10">
        <Link
          href="/panel/sorular"
          className="group flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-cyan-600"
        >
          <div>
            <h2 className="text-lg font-bold group-hover:text-cyan-300">📝 Soru Bankası Yönetimi</h2>
            <p className="mt-1 text-sm text-slate-400">Müfredata bağlı kendi sorularını ekle.</p>
          </div>
          <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300">Aç →</span>
        </Link>
      </section>
    </main>
  );
}
