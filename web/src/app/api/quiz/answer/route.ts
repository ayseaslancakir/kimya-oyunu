import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ELEMENTS } from "@/data/elements";
import { cevapPuani, idListesiCoz, idListesiYaz } from "@/lib/game-session";
import { applyMastery } from "@/lib/mastery";

const schema = z.object({
  sessionId: z.number().int().positive().optional(),
  questionId: z.number().int(),
  optionId: z.number().int().nullable().optional(), // süre dolduysa null (yanlış sayılır)
  answer: z.string().min(1).max(100).optional(), // hız yarışı: seçilen element adı
});

// POST /api/quiz/answer
// sessionId varsa: puan SUNUCUDA hesaplanır ve GameSession'a yazılır (aynı soru iki kez puan yazmaz).
// sessionId yoksa: kaçış odası gibi oturumsuz akış için eski davranış korunur.
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

  const { sessionId, questionId, optionId, answer } = parsed.data;

  if (sessionId) {
    return oturumluCevap(session.id, sessionId, questionId, optionId ?? null, answer ?? null);
  }
  return oturumsuzCevap(session.id, questionId, optionId ?? null);
}

// ---------- Oturumlu tur: sunucu taraflı puanlama ----------
async function oturumluCevap(
  userId: number,
  sessionId: number,
  questionId: number,
  optionId: number | null,
  answer: string | null
) {
  const tur = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    include: { gameMode: true },
  });
  if (!tur || tur.userId !== userId) {
    return NextResponse.json({ error: "Tur bulunamadı" }, { status: 404 });
  }
  if (tur.finishedAt) {
    return NextResponse.json({ error: "Bu tur bitirilmiş" }, { status: 409 });
  }

  // Soru bu tura mı ait? (soru listesi tur başında sabitlenir)
  if (!idListesiCoz(tur.questionIds).includes(questionId)) {
    return NextResponse.json({ error: "Soru bu tura ait değil" }, { status: 400 });
  }

  // Doğru/yanlış kararı sunucuda verilir
  let correct = false;
  let correctOptionId: number | null = null;
  let explanation: string | null = null;
  let outcomeCode: string | null = null;
  let outcomeId: number | null = null;

  if (tur.gameMode.slug === "hiz_yarisi") {
    const element = ELEMENTS.find((e) => e.number === questionId);
    if (!element) {
      return NextResponse.json({ error: "Soru bulunamadı" }, { status: 404 });
    }
    correct = answer != null && answer === element.name;
  } else {
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { options: true, outcome: true },
    });
    if (!question) {
      return NextResponse.json({ error: "Soru bulunamadı" }, { status: 404 });
    }
    const secilen = question.options.find((o) => o.id === optionId);
    correct = secilen?.isCorrect ?? false;
    correctOptionId = question.options.find((o) => o.isCorrect)?.id ?? null;
    explanation = question.explanation;
    outcomeCode = question.outcome.code;
    outcomeId = question.outcomeId;
  }

  const yeniSeri = correct ? tur.currentStreak + 1 : 0;
  const kazanilan = correct ? cevapPuani(yeniSeri) : 0;

  // Çift cevap koruması: cevaplananlar işlem içinde yeniden okunur.
  const guncel = await prisma.$transaction(async (tx) => {
    const icerde = await tx.gameSession.findUnique({ where: { id: tur.id } });
    if (!icerde) return null;
    const cevaplananlar = idListesiCoz(icerde.answeredIds);
    if (cevaplananlar.includes(questionId)) return null;

    return tx.gameSession.update({
      where: { id: icerde.id },
      data: {
        answeredIds: idListesiYaz([...cevaplananlar, questionId]),
        score: { increment: kazanilan },
        correctCount: { increment: correct ? 1 : 0 },
        currentStreak: yeniSeri,
        maxStreak: Math.max(icerde.maxStreak, yeniSeri),
      },
    });
  });

  if (!guncel) {
    return NextResponse.json(
      {
        error: "Bu soru zaten cevaplandı",
        alreadyAnswered: true,
        score: tur.score,
        correctCount: tur.correctCount,
        answeredCount: idListesiCoz(tur.answeredIds).length,
        streak: tur.currentStreak,
        maxStreak: tur.maxStreak,
      },
      { status: 409 }
    );
  }

  // Öğrenme çıktısı ustalığı (yalnızca quiz sorularında).
  // Soru bazlı 24 saat kuralı: aynı soru kısa sürede tekrar doğru cevaplanırsa
  // masteryScore değişmez, yalnızca deneme sayacı artar; doğru cevap yine gösterilir.
  let mastery: number | null = null;
  let status: string | null = null;
  let masteryUpdated = false;
  if (outcomeId != null) {
    const sonuc = await applyMastery({ userId, questionId, outcomeId, correct });
    mastery = sonuc.mastery;
    status = sonuc.status;
    masteryUpdated = sonuc.masteryUpdated;
  }

  return NextResponse.json({
    correct,
    correctOptionId,
    explanation,
    outcomeCode,
    mastery,
    status,
    masteryUpdated,
    score: guncel.score,
    correctCount: guncel.correctCount,
    answeredCount: idListesiCoz(guncel.answeredIds).length,
    streak: guncel.currentStreak,
    maxStreak: guncel.maxStreak,
  });
}

// ---------- Oturumsuz akış (kaçış odası): eski davranış ----------
async function oturumsuzCevap(userId: number, questionId: number, optionId: number | null) {
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

  // Soru bazlı 24 saat kuralı burada da geçerli (kaçış odası vb.).
  const sonuc = await applyMastery({
    userId,
    questionId,
    outcomeId: question.outcomeId,
    correct,
  });

  return NextResponse.json({
    correct,
    correctOptionId: correctOption?.id ?? null,
    explanation: question.explanation,
    outcomeCode: question.outcome.code,
    mastery: sonuc.mastery,
    status: sonuc.status,
    masteryUpdated: sonuc.masteryUpdated,
  });
}
