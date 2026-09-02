import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  code: z.string().min(6).max(10),
});

// POST /api/duel/join — kodla düelloya katılır
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Düello kodu girin" }, { status: 400 });
  }

  const code = parsed.data.code.trim().toUpperCase();
  const duel = await prisma.duel.findUnique({ where: { code } });
  if (!duel) {
    return NextResponse.json({ error: "Bu kodla bir düello bulunamadı" }, { status: 404 });
  }
  if (duel.status !== "waiting") {
    return NextResponse.json({ error: "Bu düello başlamış veya bitmiş" }, { status: 409 });
  }
  if (duel.creatorId === session.id) {
    return NextResponse.json({ error: "Kendi düellona katılamazsın" }, { status: 409 });
  }

  const mevcut = await prisma.duelPlayer.findUnique({
    where: { duelId_userId: { duelId: duel.id, userId: session.id } },
  });
  if (mevcut) {
    return NextResponse.json({ error: "Zaten bu düellodasın" }, { status: 409 });
  }

  const playerCount = await prisma.duelPlayer.count({ where: { duelId: duel.id } });
  if (playerCount >= 2) {
    return NextResponse.json({ error: "Düello dolu (2 oyuncu)" }, { status: 409 });
  }

  await prisma.duelPlayer.create({ data: { duelId: duel.id, userId: session.id } });
  await prisma.duel.update({ where: { id: duel.id }, data: { status: "active" } });

  return NextResponse.json({ duelId: duel.id, code });
}
