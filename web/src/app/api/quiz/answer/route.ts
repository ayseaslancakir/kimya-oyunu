import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  questionId: z.number().int(),
  optionId: z.number().int().nullable(), // süre dolduysa null (yanlış sayılır)
});

// POST /api/quiz/answer { questionId, optionId }
// Cevabı kontrol eder, açıklamayı döner ve öğrenme çıktısı ustalığını günceller.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
  }

  const { questionId, optionId } = parsed.data;

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { options: true, outcome: true },
  });
  if (!question) {
    return NextResponse.json({ error: "Soru bulunamadı" }, { status: 404 });
  }

  const selected = question.options.find((o) => o.id === optionId);
  const correct = selected?.isCorrect ?? false;
  const correctOption = question.options.find((o) => o.isCorrect);

  // Öğrenme çıktısı ustalığını güncelle
  const existing = await prisma.userProgress.findUnique({
    where: { userId_outcomeId: { userId: session.id, outcomeId: question.outcomeId } },
  });

  const delta = correct ? 20 : -10;
  const mastery = Math.max(0, Math.min(100, (existing?.masteryScore ?? 0) + delta));
  const status = mastery >= 80 ? "mastered" : mastery > 0 ? "in_progress" : "not_started";

  await prisma.userProgress.upsert({
    where: { userId_outcomeId: { userId: session.id, outcomeId: question.outcomeId } },
    update: {
      masteryScore: mastery,
      status,
      attempts: { increment: 1 },
      lastAttemptAt: new Date(),
    },
    create: {
      userId: session.id,
      outcomeId: question.outcomeId,
      masteryScore: mastery,
      status,
      attempts: 1,
      lastAttemptAt: new Date(),
    },
  });

  return NextResponse.json({
    correct,
    correctOptionId: correctOption?.id ?? null,
    explanation: question.explanation,
    outcomeCode: question.outcome.code,
    mastery,
    status,
  });
}
