import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { saveGameResult } from "@/lib/game";
import { idListesiCoz, turDogrulugu } from "@/lib/game-session";

const schema = z.object({
  // Oturumlu tur: skor/doğruluk/seri sunucudaki GameSession'dan okunur.
  sessionId: z.number().int().positive().optional(),
  // Aşağıdaki alanlar YALNIZCA oturum kullanmayan modlar (bulmaca, kaçış odası,
  // sanal laboratuvar) için geriye dönük uyumluluk amacıyla kabul edilir.
  unitId: z.number().int().nullable().default(null),
  mode: z
    .enum(["quiz_arena", "hiz_yarisi", "bulmaca", "kacis_odasi", "sanal_lab", "duel"])
    .default("quiz_arena"),
  score: z.number().int().min(0).max(20_000).optional(),
  accuracy: z.number().min(0).max(1).optional(),
  maxStreak: z.number().int().min(0).optional(),
  durationSec: z.number().int().min(0).optional(),
});

// POST /api/quiz/finish
// Oturumlu turda istemciden gelen score/accuracy/maxStreak YOK SAYILIR; değerler
// GameSession'dan okunur. Oturumsuz modlarda eski davranış korunur.
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

  const { sessionId, unitId, mode, score, accuracy, maxStreak, durationSec } = parsed.data;

  try {
    // ---------- Oturumlu tur: sonuç sunucudaki turdan okunur ----------
    if (sessionId) {
      const tur = await prisma.gameSession.findUnique({
        where: { id: sessionId },
        include: { gameMode: true },
      });
      if (!tur || tur.userId !== session.id) {
        return NextResponse.json({ error: "Tur bulunamadı" }, { status: 404 });
      }
      if (tur.finishedAt) {
        return NextResponse.json({ error: "Bu tur zaten bitirildi" }, { status: 409 });
      }

      const finishedAt = new Date();
      const answeredCount = idListesiCoz(tur.answeredIds).length;
      const questionCount = idListesiCoz(tur.questionIds).length;
      const sure = Math.max(0, Math.round((finishedAt.getTime() - tur.startedAt.getTime()) / 1000));
      const dogruluk = turDogrulugu(tur);

      const result = await saveGameResult(session.id, {
        unitId: tur.unitId,
        mode: tur.gameMode.slug,
        score: tur.score,
        accuracy: dogruluk,
        maxStreak: tur.maxStreak,
        durationSec: sure,
      });

      await prisma.gameSession.update({
        where: { id: tur.id },
        data: { finishedAt },
      });

      return NextResponse.json({
        ok: true,
        ...result,
        sessionId: tur.id,
        score: tur.score,
        correctCount: tur.correctCount,
        answeredCount,
        questionCount,
        maxStreak: tur.maxStreak,
        accuracy: dogruluk,
      });
    }

    // ---------- Oturumsuz modlar (geriye dönük uyum) ----------
    if (score == null || accuracy == null) {
      return NextResponse.json(
        { error: "sessionId ya da score/accuracy gerekli" },
        { status: 400 }
      );
    }

    const result = await saveGameResult(session.id, {
      unitId,
      mode,
      score,
      accuracy,
      maxStreak: maxStreak ?? 0,
      durationSec: durationSec ?? 0,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
