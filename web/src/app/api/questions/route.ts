import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  outcomeCode: z.string().min(1, "Öğrenme çıktısı seçin"),
  prompt: z.string().min(5, "Soru en az 5 karakter olmalı").max(500),
  difficulty: z.number().int().min(1).max(5).default(2),
  explanation: z.string().max(500).optional().nullable(),
  options: z
    .array(z.object({ text: z.string().min(1, "Seçenek boş olamaz").max(200) }))
    .min(2, "En az 2 seçenek gerekli")
    .max(6, "En fazla 6 seçenek"),
  correctIndex: z.number().int().min(0),
});

// POST /api/questions — öğretmen kendi sorusunu ekler
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }
  if (session.role !== "teacher") {
    return NextResponse.json({ error: "Bu işlem sadece öğretmenler içindir" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz soru verisi" }, { status: 400 });
  }

  const { outcomeCode, prompt, difficulty, explanation, options, correctIndex } = parsed.data;

  if (correctIndex >= options.length) {
    return NextResponse.json({ error: "Doğru cevap indeksi seçenek sayısından büyük" }, { status: 400 });
  }

  const outcome = await prisma.learningOutcome.findUnique({ where: { code: outcomeCode } });
  if (!outcome) {
    return NextResponse.json({ error: "Öğrenme çıktısı bulunamadı" }, { status: 404 });
  }

  const question = await prisma.question.create({
    data: {
      outcomeId: outcome.id,
      type: "multiple_choice",
      prompt,
      difficulty,
      explanation: explanation || null,
      options: {
        create: options.map((o, i) => ({
          text: o.text,
          isCorrect: i === correctIndex,
          orderIndex: i + 1,
        })),
      },
    },
  });

  return NextResponse.json(
    { question: { id: question.id, prompt: question.prompt, outcomeCode } },
    { status: 201 }
  );
}
