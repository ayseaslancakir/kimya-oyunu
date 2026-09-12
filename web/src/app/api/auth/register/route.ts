import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { hizSiniri, istemciIp } from "@/lib/rate-limit";

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
  teacherCode: z.string().max(100).optional().nullable(),
});

// Aynı IP'den saatte en fazla 5 hesap.
const KAYIT_LIMITI = 5;
const KAYIT_PENCERE_MS = 60 * 60_000;

// Öğretmen hesabı herkese açık olmamalı: öğretmen rolü sınıf kurar ve
// soru bankasına yazar. TEACHER_CODE tanımlıysa kod doğrulanır.
// Üretimde kod tanımlı değilse öğretmen kaydı tamamen kapatılır.
function ogretmenKaydiReddi(kod: string | null | undefined): string | null {
  const beklenen = process.env.TEACHER_CODE;
  if (!beklenen) {
    return process.env.NODE_ENV === "production"
      ? "Öğretmen kaydı kapalı. Okul yöneticisinden davet kodu isteyin."
      : null; // yerel geliştirmede serbest
  }
  return kod === beklenen ? null : "Öğretmen davet kodu hatalı";
}

export async function POST(req: NextRequest) {
  const kota = hizSiniri(`register:${istemciIp(req)}`, KAYIT_LIMITI, KAYIT_PENCERE_MS);
  if (!kota.izin) {
    return NextResponse.json(
      { error: "Çok fazla kayıt denemesi. Bir süre sonra tekrar deneyin." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first?.message ?? "Geçersiz veri" }, { status: 400 });
  }

  const { username, email, password, role, gradeLevel, teacherCode } = parsed.data;

  if (role === "teacher") {
    const red = ogretmenKaydiReddi(teacherCode);
    if (red) return NextResponse.json({ error: red }, { status: 403 });
  }

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
