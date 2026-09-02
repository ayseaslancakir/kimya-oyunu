import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import QuizPlayer from "@/components/QuizPlayer";

export default async function QuizPage({
  searchParams,
}: {
  searchParams: Promise<{ unitId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/giris");

  const { unitId } = await searchParams;
  const id = Number(unitId);
  if (!id) redirect("/harita");

  const unit = await prisma.unit.findUnique({
    where: { id },
    include: { theme: { include: { grade: true } } },
  });
  if (!unit) redirect("/harita");

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-2 text-sm text-slate-500">
        {unit.theme.grade.code}. sınıf → {unit.theme.name} → {unit.name}
      </div>
      <QuizPlayer unitId={unit.id} unitName={unit.name} />
    </main>
  );
}
