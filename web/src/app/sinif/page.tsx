import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import SinifaKatil from "@/components/SinifaKatil";

export default async function SinifPage() {
  const session = await getSession();
  if (!session) redirect("/giris");

  const classes = await prisma.classStudent.findMany({
    where: { userId: session.id },
    include: {
      class: {
        include: { teacher: { select: { username: true } }, _count: { select: { students: true } } },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Sınıflarım</h1>
          <p className="mt-1 text-slate-400">
            Öğretmeninin verdiği davet koduyla sınıfına katıl.
          </p>
        </div>
        <Link
          href="/harita"
          className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold transition hover:border-slate-400"
        >
          ← Harita
        </Link>
      </div>

      <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-bold">Sınıfa Katıl</h2>
        <div className="mt-4">
          <SinifaKatil />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold">Üye Olduğun Sınıflar ({classes.length})</h2>
        {classes.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
            Henüz bir sınıfa katılmadın.
          </p>
        ) : (
          <div className="mt-4 grid gap-4">
            {classes.map((c) => (
              <div
                key={c.classId}
                className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-5"
              >
                <div>
                  <h3 className="text-lg font-semibold">{c.class.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Öğretmen: {c.class.teacher.username} · {c.class._count.students} öğrenci
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Üyesin ✓
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
