import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Bulmaca from "@/components/Bulmaca";

export default async function BulmacaPage() {
  const session = await getSession();
  if (!session) redirect("/giris");

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Bulmaca />
    </main>
  );
}
