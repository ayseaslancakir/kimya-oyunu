import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import HizYarisi from "@/components/HizYarisi";

export default async function HizYarisiPage() {
  const session = await getSession();
  if (!session) redirect("/giris");

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <HizYarisi />
    </main>
  );
}
