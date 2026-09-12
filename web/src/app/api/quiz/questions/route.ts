import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { shuffle, ELEMENTS } from "@/data/elements";
import { idListesiYaz } from "@/lib/game-session";

// GET /api/quiz/questions?unitId=5&limit=10&mod=quiz|kacis&mode=quiz_arena|hiz_yarisi
// mod="quiz"  -> tur başlatır: GameSession oluşturur ve sessionId döner.
// mod="kacis" -> kaçış odası soruları (oturum kullanmaz, geriye dönük uyumlu).
// mode="hiz_yarisi" -> element eşleştirme turu: soru setini sunucu üretir ve oturum açar.
const HIZ_VARSAYILAN_SORU = 40; // 60 saniyelik tur için bolca soru
const HIZ_SECENEK_SAYISI = 4;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  const mod = req.nextUrl.searchParams.get("mod") === "kacis" ? "kacis" : "quiz";
  const mode = req.nextUrl.searchParams.get("mode") === "hiz_yarisi" ? "hiz_yarisi" : "quiz_arena";
  const limitParam = Number(req.nextUrl.searchParams.get("limit"));

  // ---- Hız Yarışı: element sembolü → isim eşleştirme turu ----
  if (mode === "hiz_yarisi") {
    const adet = Number.isFinite(limitParam)
      ? Math.min(Math.max(Math.trunc(limitParam), 5), 60)
      : HIZ_VARSAYILAN_SORU;

    const gameMode = await prisma.gameMode.findUnique({ where: { slug: "hiz_yarisi" } });
    if (!gameMode) {
      return NextResponse.json({ error: "Hız yarışı modu tanımlı değil" }, { status: 500 });
    }

    const secilenler = shuffle(ELEMENTS).slice(0, Math.min(adet, ELEMENTS.length));
    const questions = secilenler.map((element) => {
      const yanlislar = shuffle(ELEMENTS.filter((e) => e.number !== element.number)).slice(
        0,
        HIZ_SECENEK_SAYISI - 1
      );
      return {
        id: element.number, // element numarası soru kimliğidir
        prompt: element.symbol,
        difficulty: 1,
        outcomeCode: "—",
        options: shuffle([element, ...yanlislar]).map((e) => ({ id: e.number, text: e.name })),
      };
    });

    const tur = await prisma.gameSession.create({
      data: {
        userId: session.id,
        gameModeId: gameMode.id,
        unitId: null,
        questionIds: idListesiYaz(questions.map((q) => q.id)),
      },
    });

    return NextResponse.json({ sessionId: tur.id, unitId: null, mode, questions });
  }

  // ---- Quiz / Kaçış: öğrenme çıktısı soruları ----
  const unitId = Number(req.nextUrl.searchParams.get("unitId"));
  if (!unitId || Number.isNaN(unitId)) {
    return NextResponse.json({ error: "unitId parametresi gerekli" }, { status: 400 });
  }
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(Math.trunc(limitParam), 1), 20) : 10;

  const pool = await prisma.question.findMany({
    where: { kullanim: mod, outcome: { unitId } },
    include: {
      options: { orderBy: { orderIndex: "asc" }, select: { id: true, text: true } },
      outcome: { select: { code: true } },
    },
  });

  let questions = pool;

  // Kaçış: ünitede yeterli soru yoksa aynı temadaki diğer ünitelerden tamamla
  if (mod === "kacis" && questions.length < limit) {
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      select: { themeId: true },
    });
    if (unit) {
      const tamamlayici = await prisma.question.findMany({
        where: {
          kullanim: "kacis",
          outcome: { unit: { themeId: unit.themeId }, unitId: { not: unitId } },
        },
        include: {
          options: { orderBy: { orderIndex: "asc" }, select: { id: true, text: true } },
          outcome: { select: { code: true } },
        },
      });
      questions = [...pool, ...tamamlayici];
    }
  }

  const secilen = shuffle(questions).slice(0, limit);

  // Quiz turu: soru listesini sunucuda sabitleyip oturum açar.
  // Kaçış odası oturum kullanmaz (geriye dönük uyum).
  let sessionId: number | null = null;
  if (mod === "quiz") {
    const gameMode = await prisma.gameMode.findUnique({ where: { slug: "quiz_arena" } });
    if (!gameMode) {
      return NextResponse.json({ error: "Quiz modu tanımlı değil" }, { status: 500 });
    }
    const tur = await prisma.gameSession.create({
      data: {
        userId: session.id,
        gameModeId: gameMode.id,
        unitId,
        questionIds: idListesiYaz(secilen.map((q) => q.id)),
      },
    });
    sessionId = tur.id;
  }

  return NextResponse.json({
    sessionId,
    unitId,
    mod,
    mode,
    questions: secilen.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      difficulty: q.difficulty,
      outcomeCode: q.outcome.code,
      options: shuffle(q.options),
    })),
  });
}
