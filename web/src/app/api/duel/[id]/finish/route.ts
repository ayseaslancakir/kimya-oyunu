import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { saveGameResult } from "@/lib/game";

// POST /api/duel/[id]/finish — oyuncu turunu bitirir; ikisi de bitince düello biter.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  const { id } = await params;
  const duelId = Number(id);

  const duel = await prisma.duel.findUnique({
    where: { id: duelId },
    include: { players: true },
  });
  if (!duel) {
    return NextResponse.json({ error: "Düello bulunamadı" }, { status: 404 });
  }

  const ben = duel.players.find((p) => p.userId === session.id);
  if (!ben) {
    return NextResponse.json({ error: "Bu düellonun oyuncusu değilsin" }, { status: 403 });
  }

  let sonuc = null;
  if (!ben.finished) {
    await prisma.duelPlayer.update({
      where: { id: ben.id },
      data: { finished: true },
    });

    // Skoru kaydet (mode: duel) + XP + rozet + element
    const soruSayisi = (JSON.parse(duel.questionIds) as number[]).length;
    sonuc = await saveGameResult(session.id, {
      unitId: duel.unitId,
      mode: "duel",
      score: ben.score,
      accuracy: soruSayisi > 0 ? ben.dogru / soruSayisi : 0,
      maxStreak: 0,
      durationSec: 0,
    });

    // İki oyuncu da bitirdi mi?
    const guncel = await prisma.duel.findUnique({
      where: { id: duelId },
      include: { players: true },
    });
    if (guncel && guncel.players.every((p) => p.finished)) {
      await prisma.duel.update({
        where: { id: duelId },
        data: { status: "finished", finishedAt: new Date() },
      });
    }
  }

  return NextResponse.json({ ok: true, sonuc });
}
