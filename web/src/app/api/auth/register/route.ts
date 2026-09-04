import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";

const schema = z.object({
  username: z
    .string()
    .min(3, "Kullanıcı adı en az 3 karakter olmalı")
    .max(20, "Kullanıcı adı en fazla 20 karakter olmalı")
    .regex(/^[a-zA-Z0-9_çğıöşüÇĞİÖŞÜ]+$/, "Kullanıcı adı sadece harf, rakam ve _ içerebilir"),
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı").max(72),
  role: z.enum(["student", "teacher"]).default("student"),
  gradeLevel: z.number().int().min(9).max(12).optional().nullable(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first?.message ?? "Geçersiz veri" }, { status: 400 });
  }

  const { username, email, password, role, gradeLevel } = parsed.data;

  try {
    const exists = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (exists) {
      return NextResponse.json({ error: "Bu kullanıcı adı veya e-posta zaten kayıtlı" }, { status: 409 });
    }

    const grade = gradeLevel
      ? await prisma.grade.findFirst({ where: { code: gradeLevel } })
      : null;

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: await hashPassword(password),
        role,
        gradeId: grade?.id,
      },
    });

    const token = await createSessionToken({ id: user.id, username: user.username, role: user.role });
    await setSessionCookie(token);

    return NextResponse.json(
      { user: { id: user.id, username: user.username, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (e) {
    const msg = (e as Error).message ?? "";
    if (msg.includes("Can't reach database server") || msg.includes("P1001") || msg.includes("Error code 14")) {
      return NextResponse.json(
        { error: "Veritabanına bağlanılamadı. Önce: npm run setup:local" },
        { status: 503 }
      );
    }
    console.error("register error:", e);
    return NextResponse.json({ error: "Kayıt sırasında sunucu hatası oluştu" }, { status: 500 });
  }
}
