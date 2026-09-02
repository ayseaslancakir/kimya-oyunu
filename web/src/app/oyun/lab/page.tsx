import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import SanalLab from "@/components/SanalLab";

export default async function LabPage() {
  const session = await getSession();
  if (!session) redirect("/giris");

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <SanalLab />
    </main>
  );
}
