import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import AccountPanel from "@/components/AccountPanel";

export const metadata = {
  title: "Hesabım | Kimya Oyunu",
};

export default async function HesapPage() {
  const session = await getSession();
  if (!session) redirect("/giris");

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { username: true, email: true, role: true, xp: true },
  });
  if (!user) redirect("/giris");

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-black">Hesabım</h1>
      <p className="mt-1 text-slate-400">
        Bilgilerini gör, şifreni değiştir veya hesabını sil.
      </p>

      <section className="mt-8 rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
        <h2 className="text-lg font-bold">Hesap bilgileri</h2>
        <dl className="mt-4 grid gap-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-400">Kullanıcı adı</dt>
            <dd className="font-semibold">{user.username}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-400">E-posta</dt>
            <dd className="font-semibold">{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-400">Hesap türü</dt>
            <dd className="font-semibold">{user.role === "teacher" ? "Öğretmen" : "Öğrenci"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-400">Toplam XP</dt>
            <dd className="font-semibold text-cyan-300">{user.xp}</dd>
          </div>
        </dl>
      </section>

      <AccountPanel username={user.username} />
    </main>
  );
}
