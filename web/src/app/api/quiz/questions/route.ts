import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { shuffle } from "@/data/elements";

// GET /api/quiz/questions?unitId=5&limit=10&mod=quiz|kacis
// Soru havuzları ayrıdır: quiz -> kullanim="quiz", kaçış -> kullanim="kacis".
// Kaçışta ünitede yeterli soru yoksa aynı temadaki diğer ünitelerin kaçış sorularıyla tamamlanır.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  const unitId = Number(req.nextUrl.searchParams.get("unitId"));
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 10), 20);
  const mod = req.nextUrl.searchParams.get("mod") === "kacis" ? "kacis" : "quiz";
  if (!unitId || Number.isNaN(unitId)) {
    return NextResponse.json({ error: "unitId parametresi gerekli" }, { status: 400 });
  }

  const pool = await prisma.question.findMany({
    where: { kullanim: mod, outcome: { unitId } },
    include: {
      options: { orderBy: { orderIndex: "asc" }, select: { id: true, text: true } },
      outcome: { select: { code: true } },
    },
  });

  let questions = pool;

  // Kaçış: ünitede yeterli soru yoksa aynı temadaki diğer ünitelerden tamamla
  if (mod === "kacis" && questions.length < limit) {
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      select: { themeId: true },
    });
    if (unit) {
      const tamamlayici = await prisma.question.findMany({
        where: {
          kullanim: "kacis",
          outcome: { unit: { themeId: unit.themeId }, unitId: { not: unitId } },
        },
        include: {
          options: { orderBy: { orderIndex: "asc" }, select: { id: true, text: true } },
          outcome: { select: { code: true } },
        },
      });
      questions = [...pool, ...tamamlayici];
    }
  }

  const secilen = shuffle(questions).slice(0, limit);

  return NextResponse.json({
    unitId,
    mod,
    questions: secilen.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      difficulty: q.difficulty,
      outcomeCode: q.outcome.code,
      options: shuffle(q.options),
    })),
  });
}
