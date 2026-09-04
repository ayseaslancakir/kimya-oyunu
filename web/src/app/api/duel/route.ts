import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { shuffle } from "@/data/elements";

const schema = z.object({
  unitId: z.number().int(),
});

const SORU_SAYISI = 5;
const KOD_KARAKTERLER = "ABCDEFGHJKLMNPRSTUVYZ23456789";

// POST /api/duel — düello kurar (kurucu + soru seti sabitlenir)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ünite seçin" }, { status: 400 });
  }

  const unit = await prisma.unit.findUnique({ where: { id: parsed.data.unitId } });
  if (!unit) {
    return NextResponse.json({ error: "Ünite bulunamadı" }, { status: 404 });
  }

  const pool = await prisma.question.findMany({
    where: { outcome: { unitId: unit.id } },
    select: { id: true },
  });
  const questions = shuffle(pool).slice(0, SORU_SAYISI);
  if (questions.length < 3) {
    return NextResponse.json({
      error: "Bu ünitede düello için yeterli soru yok (en az 3 soru gerekli)",
    }, { status: 400 });
  }

  let code = "";
  for (let deneme = 0; deneme < 10; deneme++) {
    code = Array.from({ length: 6 }, () =>
      KOD_KARAKTERLER[Math.floor(Math.random() * KOD_KARAKTERLER.length)]
    ).join("");
    const mevcut = await prisma.duel.findUnique({ where: { code } });
    if (!mevcut) break;
  }

  const duel = await prisma.duel.create({
    data: {
      code,
      unitId: unit.id,
      creatorId: session.id,
      questionIds: JSON.stringify(questions.map((q) => q.id)),
      players: { create: { userId: session.id } },
    },
  });

  return NextResponse.json({ duelId: duel.id, code }, { status: 201 });
}
