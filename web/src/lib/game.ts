import { prisma } from "@/lib/db";
import { evaluateAchievements } from "@/lib/achievements";
import { ELEMENTS } from "@/data/elements";

export type GameResultInput = {
  unitId: number | null;
  mode: string; // game mode slug
  score: number;
  accuracy: number;
  maxStreak: number;
  durationSec: number;
};

// Oyun turu sonucunu kaydeder: skor + XP + rozet + element ödülü.
export async function saveGameResult(userId: number, input: GameResultInput) {
  const { unitId, mode, score, accuracy, maxStreak, durationSec } = input;

  const gameMode = await prisma.gameMode.findUnique({ where: { slug: mode } });
  if (!gameMode) {
    throw new Error("Oyun modu bulunamadı");
  }

  await prisma.score.create({
    data: {
      userId,
      gameModeId: gameMode.id,
      outcomeId: unitId ? null : null,
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
