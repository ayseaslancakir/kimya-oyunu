import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { shuffle } from "@/data/elements";

// GET /api/quiz/questions?unitId=5&limit=10
// Bir ünitenin sorularını döner (doğru cevaplar GİZLİ). Her turda karışık sıra.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  const unitId = Number(req.nextUrl.searchParams.get("unitId"));
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 10), 20);
  if (!unitId || Number.isNaN(unitId)) {
    return NextResponse.json({ error: "unitId parametresi gerekli" }, { status: 400 });
  }

  const pool = await prisma.question.findMany({
    where: { outcome: { unitId } },
    include: {
      options: { orderBy: { orderIndex: "asc" }, select: { id: true, text: true } },
      outcome: { select: { code: true } },
    },
  });

  const questions = shuffle(pool).slice(0, limit);

  return NextResponse.json({
    unitId,
    questions: questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      difficulty: q.difficulty,
      outcomeCode: q.outcome.code,
      options: shuffle(q.options),
    })),
  });
}
