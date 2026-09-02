import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2, "Sınıf adı en az 2 karakter olmalı").max(50),
});

// POST /api/classes — öğretmen sınıf oluşturur (davet kodu üretilir)
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
    return NextResponse.json({ error: "Geçersiz sınıf adı" }, { status: 400 });
  }

  // Benzersiz davet kodu üret (6 haneli, çakışırsa tekrar dene)
  const karakterler = "ABCDEFGHJKLMNPRSTUVYZ23456789";
  let inviteCode = "";
  for (let deneme = 0; deneme < 10; deneme++) {
    inviteCode = Array.from({ length: 6 }, () =>
      karakterler[Math.floor(Math.random() * karakterler.length)]
    ).join("");
    const mevcut = await prisma.class.findUnique({ where: { inviteCode } });
    if (!mevcut) break;
  }

  const sinif = await prisma.class.create({
    data: { name: parsed.data.name, inviteCode, teacherId: session.id },
  });

  return NextResponse.json({ sinif }, { status: 201 });
}
