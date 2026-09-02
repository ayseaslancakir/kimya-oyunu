import { prisma } from "@/lib/db";

export type AchievementContext = {
  accuracy: number; // 0-1
  maxStreak: number;
  hasMastered: boolean; // en az bir çıktıda ustalaşılmış mı
};

const CONDITIONS: Record<string, (c: AchievementContext) => boolean> = {
  "ilk-tur": () => true,
  "yuzde-100": (c) => c.accuracy >= 1,
  "seri-5": (c) => c.maxStreak >= 5,
  "seri-10": (c) => c.maxStreak >= 10,
  "ilk-usta": (c) => c.hasMastered,
};

// Tura göre koşulu sağlanan ve henüz kazanılmamış rozetleri verir.
export async function evaluateAchievements(userId: number, ctx: AchievementContext) {
  const defs = await prisma.achievement.findMany();
  const earned = [];

  for (const def of defs) {
    const cond = CONDITIONS[def.slug];
    if (!cond || !cond(ctx)) continue;

    const existing = await prisma.userAchievement.findUnique({
      where: { userId_achievementId: { userId, achievementId: def.id } },
    });
    if (existing) continue;

    await prisma.userAchievement.create({ data: { userId, achievementId: def.id } });
    earned.push(def);
  }
  return earned;
}
