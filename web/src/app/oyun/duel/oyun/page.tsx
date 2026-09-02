import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import DuelOyun from "@/components/DuelOyun";

export default async function DuelOyunPage({
  searchParams,
}: {
  searchParams: Promise<{ duelId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/giris");

  const { duelId } = await searchParams;
  const id = Number(duelId);
  if (!id) redirect("/oyun/duel");

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <DuelOyun duelId={id} />
    </main>
  );
}
