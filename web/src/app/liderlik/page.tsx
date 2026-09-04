import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LiderlikBoard from "@/components/LiderlikBoard";

export default async function LiderlikPage() {
  const session = await getSession();
  if (!session) redirect("/giris");
  return <LiderlikBoard />;
}
