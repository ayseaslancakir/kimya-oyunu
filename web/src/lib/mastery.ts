import { prisma } from "@/lib/db";

// Aynı soruya tekrar tekrar doğru cevap vererek ustalık şişirilmesini önler:
// bir soru, bir kullanıcı için 24 saat içinde en fazla bir kez masteryScore'u değiştirir.
// Pencere dolduktan sonraki denemeler yalnızca deneme sayacını artırır.
export const MASTERY_WINDOW_MS = 24 * 60 * 60 * 1000;
const CORRECT_DELTA = 20;
const WRONG_DELTA = -10;

function clampMastery(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function masteryStatus(mastery: number): string {
  return mastery >= 80 ? "mastered" : mastery > 0 ? "in_progress" : "not_started";
}

export type MasteryResult = {
  mastery: number;
  status: string;
  masteryUpdated: boolean; // bu deneme ustalığı değiştirdi mi?
};

// Bir cevabın ustalık etkisini uygular (soru bazlı 24 saat kuralıyla).
export async function applyMastery(params: {
  userId: number;
  questionId: number;
  outcomeId: number;
  correct: boolean;
}): Promise<MasteryResult> {
  const { userId, questionId, outcomeId, correct } = params;
  const now = new Date();

  // 1) Soru bazlı kayıt: pencere dolmadan mastery değişmez.
  const previous = await prisma.questionMastery.findUnique({
    where: { userId_questionId: { userId, questionId } },
  });
  const masteryUpdated =
    !previous?.masteryAt || now.getTime() - previous.masteryAt.getTime() >= MASTERY_WINDOW_MS;

  await prisma.questionMastery.upsert({
    where: { userId_questionId: { userId, questionId } },
    update: {
      attempts: { increment: 1 },
      lastAttemptAt: now,
      ...(masteryUpdated ? { masteryAt: now } : {}),
    },
    create: {
      userId,
      questionId,
      attempts: 1,
      lastAttemptAt: now,
      masteryAt: masteryUpdated ? now : null,
    },
  });

  // 2) Öğrenme çıktısı ustalığı: pencere içindeyse yalnızca deneme sayısı artar.
  const progress = await prisma.userProgress.findUnique({
    where: { userId_outcomeId: { userId, outcomeId } },
  });
  const currentMastery = progress?.masteryScore ?? 0;
  const mastery = masteryUpdated
    ? clampMastery(currentMastery + (correct ? CORRECT_DELTA : WRONG_DELTA))
    : currentMastery;
  const status = masteryUpdated ? masteryStatus(mastery) : (progress?.status ?? "not_started");

  await prisma.userProgress.upsert({
    where: { userId_outcomeId: { userId, outcomeId } },
    update: {
      attempts: { increment: 1 },
      lastAttemptAt: now,
      ...(masteryUpdated ? { masteryScore: mastery, status } : {}),
    },
    create: {
      userId,
      outcomeId,
      masteryScore: mastery,
      status,
      attempts: 1,
      lastAttemptAt: now,
    },
  });

  return { mastery, status, masteryUpdated };
}
