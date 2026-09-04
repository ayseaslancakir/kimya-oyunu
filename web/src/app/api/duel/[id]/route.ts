import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/duel/[id] — düello durumu (oyunculardan biri erişebilir)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  const { id } = await params;
  const duelId = Number(id);
  if (!duelId) {
    return NextResponse.json({ error: "Geçersiz düello" }, { status: 400 });
  }

  const duel = await prisma.duel.findUnique({
    where: { id: duelId },
    include: {
      unit: true,
      players: { include: { user: { select: { username: true } } } },
    },
  });
  if (!duel) {
    return NextResponse.json({ error: "Düello bulunamadı" }, { status: 404 });
  }

  const ben = duel.players.find((p) => p.userId === session.id);
  if (!ben) {
    return NextResponse.json({ error: "Bu düellonun oyuncusu değilsin" }, { status: 403 });
  }

  // Soruları sabitlenen listeden getir — sıra questionIds ile aynı kalsın
  const questionIds = JSON.parse(duel.questionIds) as number[];
  const found = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    include: {
      options: { orderBy: { orderIndex: "asc" }, select: { id: true, text: true } },
      outcome: { select: { code: true } },
    },
  });
  const byId = new Map(found.map((q) => [q.id, q]));
  const questions = questionIds.map((qid) => byId.get(qid)).filter((q): q is NonNullable<typeof q> => Boolean(q));

  return NextResponse.json({
    duel: {
      id: duel.id,
      code: duel.code,
      status: duel.status,
      unitId: duel.unitId,
      unitName: duel.unit.name,
    },
    questions: questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      outcomeCode: q.outcome?.code ?? "",
      options: q.options,
    })),
    players: duel.players.map((p) => ({
      userId: p.userId,
      username: p.user.username,
      score: p.score,
      dogru: p.dogru,
      finished: p.finished,
    })),
    me: {
      userId: ben.userId,
      username: ben.user.username,
      score: ben.score,
      dogru: ben.dogru,
      finished: ben.finished,
    },
  });
}
