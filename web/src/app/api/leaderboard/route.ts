import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/leaderboard?period=week|all&mode=quiz_arena|hiz_yarisi|bulmaca&limit=20
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  const period = req.nextUrl.searchParams.get("period") === "all" ? "all" : "week";
  const mode = req.nextUrl.searchParams.get("mode") ?? "quiz_arena";
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 20), 50);

  const gameMode = await prisma.gameMode.findUnique({ where: { slug: mode } });
  if (!gameMode) {
    return NextResponse.json({ error: "Oyun modu bulunamadı" }, { status: 404 });
  }

  const since = period === "week" ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : undefined;

  const groups = await prisma.score.groupBy({
    by: ["userId"],
    where: {
      gameModeId: gameMode.id,
      ...(since ? { playedAt: { gte: since } } : {}),
    },
    _sum: { score: true },
    _count: { _all: true },
  });

  const userIds = groups.map((g) => g.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true, grade: { select: { code: true } } },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  const rows = groups
    .map((g) => ({
      userId: g.userId,
      username: userMap.get(g.userId)?.username ?? "?",
      gradeCode: userMap.get(g.userId)?.grade?.code ?? null,
      totalScore: g._sum.score ?? 0,
      games: g._count._all,
    }))
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, limit);

  return NextResponse.json({ period, mode, rows });
}
