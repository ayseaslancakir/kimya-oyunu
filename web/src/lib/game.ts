import { prisma } from "@/lib/db";
import { evaluateAchievements } from "@/lib/achievements";
import { ELEMENTS } from "@/data/elements";

export type GameResultInput = {
  unitId: number | null;
  mode: string;
  score: number;
  accuracy: number;
  maxStreak: number;
  durationSec: number;
};

const MAX_SCORE = 20_000;
const DUPLICATE_WINDOW_MS = 5_000;

function clampScore(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(MAX_SCORE, Math.floor(n)));
}

// Oyun turu sonucunu kaydeder: skor + XP + rozet + element ödülü.
export async function saveGameResult(userId: number, input: GameResultInput) {
  const score = clampScore(input.score);
  const accuracy = Math.max(0, Math.min(1, input.accuracy));
  const maxStreak = Math.max(0, Math.floor(input.maxStreak));
  const durationSec = Math.max(0, Math.floor(input.durationSec));
  const { unitId, mode } = input;

  const gameMode = await prisma.gameMode.findUnique({ where: { slug: mode } });
  if (!gameMode) {
    throw new Error("Oyun modu bulunamadı");
  }

  // Çift tıklama / yeniden gönderim: aynı tur iki kez XP yazmasın.
  const recent = await prisma.score.findFirst({
    where: {
      userId,
      gameModeId: gameMode.id,
      score,
      playedAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
    },
    orderBy: { playedAt: "desc" },
  });
  if (recent) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { xp: true } });
    return {
      xp: user?.xp ?? 0,
      score,
      achievements: [] as { slug: string; name: string; description: string; icon: string | null }[],
      element: null,
    };
  }

  // Ünite oturumlarını en az bir öğrenme çıktısına bağla (rapor/harita için).
  let outcomeId: number | null = null;
  if (unitId) {
    const first = await prisma.learningOutcome.findFirst({
      where: { unitId },
      select: { id: true },
      orderBy: { id: "asc" },
    });
    outcomeId = first?.id ?? null;
  }

  await prisma.score.create({
    data: {
      userId,
      gameModeId: gameMode.id,
      outcomeId,
      score,
      accuracy,
      maxStreak,
      durationSec,
    },
  });

  const user = await prisma.user.update({
    where: { id: userId },
    data: { xp: { increment: score } },
  });

  const hasMastered =
    (await prisma.userProgress.count({
      where: { userId, status: "mastered" },
    })) > 0;

  const achievements = await evaluateAchievements(userId, {
    accuracy,
    maxStreak,
    hasMastered,
  });

  let element = null;
  if (accuracy >= 0.7) {
    const owned = await prisma.inventoryItem.findMany({
      where: { userId, itemType: "element" },
      select: { itemKey: true },
    });
    const ownedSet = new Set(owned.map((i) => i.itemKey));
    const available = ELEMENTS.filter((e) => !ownedSet.has(e.symbol));
    if (available.length > 0) {
      element = available[Math.floor(Math.random() * available.length)];
      await prisma.inventoryItem.create({
        data: { userId, itemType: "element", itemKey: element.symbol },
      });
    }
  }

  return {
    xp: user.xp,
    score,
    achievements: achievements.map((a) => ({
      slug: a.slug,
      name: a.name,
      description: a.description,
      icon: a.icon,
    })),
    element,
  };
}
