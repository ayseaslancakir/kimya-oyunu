import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import HizYarisi from "@/components/HizYarisi";

export default async function HizYarisiPage({
  searchParams,
}: {
  searchParams: Promise<{ unitId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/giris");

  // unitId isteğe bağlı: verilirse kartlar o ünitenin sorularından üretilir ve skor üniteye yazılır.
  const { unitId } = await searchParams;
  const id = Number(unitId);
  const unit =
    unitId && Number.isFinite(id) && id > 0
      ? await prisma.unit.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            theme: { select: { name: true, grade: { select: { code: true } } } },
          },
        })
      : null;
  if (unitId && !unit) redirect("/harita");

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      {unit && (
        <div className="mb-2 text-sm text-slate-500">
          ⚡ Hız Yarışı → {unit.theme.grade.code}. sınıf · {unit.theme.name} · {unit.name}
        </div>
      )}
      <HizYarisi unitId={unit?.id} unitName={unit?.name} />
    </main>
  );
}
