import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Sağlık kontrolü: uygulama + veritabanı ayakta mı?
// http://localhost:3000/api/health
// Yayın sonrası bu adres 200 dönmeli (docs/05-yayin-rehberi.md).
export async function GET() {
  let db: "ok" | "hata" = "ok";
  let soruSayisi: number | null = null;
  try {
    soruSayisi = await prisma.question.count();
  } catch {
    db = "hata";
  }

  return NextResponse.json(
    {
      status: db === "ok" ? "ok" : "degraded",
      app: "kimya-oyunu",
      db,
      soruSayisi,
      time: new Date().toISOString(),
    },
    { status: db === "ok" ? 200 : 503 }
  );
}
