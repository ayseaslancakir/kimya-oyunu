import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { saveGameResult } from "@/lib/game";

const schema = z.object({
  unitId: z.number().int().nullable().default(null),
  mode: z
    .enum(["quiz_arena", "hiz_yarisi", "bulmaca", "kacis_odasi", "sanal_lab", "duel"])
    .default("quiz_arena"),
  score: z.number().int().min(0),
  accuracy: z.number().min(0).max(1),
  maxStreak: z.number().int().min(0),
  durationSec: z.number().int().min(0),
});

// POST /api/quiz/finish — tur bitince skoru kaydeder, XP + rozet + element ödülü verir.
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

  try {
    const result = await saveGameResult(session.id, parsed.data);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
