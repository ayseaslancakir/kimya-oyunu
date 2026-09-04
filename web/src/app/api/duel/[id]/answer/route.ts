import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  questionId: z.number().int(),
  optionId: z.number().int().nullable(),
});

// POST /api/duel/[id]/answer — düello sorusuna cevap (ilerleme de güncellenir)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  const { id } = await params;
  const duelId = Number(id);
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }

  const duel = await prisma.duel.findUnique({
    where: { id: duelId },
    include: { players: true },
  });
  if (!duel) {
    return NextResponse.json({ error: "Düello bulunamadı" }, { status: 404 });
  }
  if (duel.status === "finished") {
    return NextResponse.json({ error: "Düello bitti" }, { status: 409 });
  }

  const ben = duel.players.find((p) => p.userId === session.id);
  if (!ben) {
    return NextResponse.json({ error: "Bu düellonun oyuncusu değilsin" }, { status: 403 });
  }
  if (ben.finished) {
    return NextResponse.json({ error: "Turu tamamladın" }, { status: 409 });
  }

  let allowedIds: number[] = [];
  try {
    allowedIds = JSON.parse(duel.questionIds) as number[];
  } catch {
    return NextResponse.json({ error: "Düello soruları bozuk" }, { status: 500 });
  }
  if (!allowedIds.includes(parsed.data.questionId)) {
    return NextResponse.json({ error: "Bu soru bu düelloda yok" }, { status: 400 });
  }

  let answered: number[] = [];
  try {
    answered = JSON.parse(ben.answeredIds || "[]") as number[];
  } catch {
    answered = [];
  }
  if (answered.includes(parsed.data.questionId)) {
    return NextResponse.json({ error: "Bu soruyu zaten cevapladın" }, { status: 409 });
  }

  const question = await prisma.question.findUnique({
    where: { id: parsed.data.questionId },
    include: { options: true, outcome: true },
  });
  if (!question) {
    return NextResponse.json({ error: "Soru bulunamadı" }, { status: 404 });
  }

  const selected = question.options.find((o) => o.id === parsed.data.optionId);
  const correct = selected?.isCorrect ?? false;
  const correctOption = question.options.find((o) => o.isCorrect);

  // Öğrenme çıktısı ustalığını güncelle (quiz/answer ile aynı mantık)
  const existing = await prisma.userProgress.findUnique({
    where: { userId_outcomeId: { userId: session.id, outcomeId: question.outcomeId } },
  });
  const delta = correct ? 20 : -10;
  const mastery = Math.max(0, Math.min(100, (existing?.masteryScore ?? 0) + delta));
  const status = mastery >= 80 ? "mastered" : mastery > 0 ? "in_progress" : "not_started";

  await prisma.userProgress.upsert({
    where: { userId_outcomeId: { userId: session.id, outcomeId: question.outcomeId } },
    update: { masteryScore: mastery, status, attempts: { increment: 1 }, lastAttemptAt: new Date() },
    create: {
      userId: session.id,
      outcomeId: question.outcomeId,
      masteryScore: mastery,
      status,
      attempts: 1,
      lastAttemptAt: new Date(),
    },
  });

  answered.push(parsed.data.questionId);
  await prisma.duelPlayer.update({
    where: { id: ben.id },
    data: {
      answeredIds: JSON.stringify(answered),
      ...(correct ? { score: { increment: 100 }, dogru: { increment: 1 } } : {}),
    },
  });

  return NextResponse.json({
    correct,
    correctOptionId: correctOption?.id ?? null,
    explanation: question.explanation,
  });
}
