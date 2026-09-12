import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSessionToken, setSessionCookie, verifyPassword } from "@/lib/auth";
import { hizSiniri, istemciIp } from "@/lib/rate-limit";

const schema = z.object({
  login: z.string().min(1, "Kullanıcı adı veya e-posta girin"),
  password: z.string().min(1, "Şifre girin"),
});

// Aynı IP'den 15 dakikada en fazla 10 giriş denemesi (şifre deneme saldırısına karşı).
const DENEME_LIMITI = 10;
const PENCERE_MS = 15 * 60_000;

export async function POST(req: NextRequest) {
  const kota = hizSiniri(`login:${istemciIp(req)}`, DENEME_LIMITI, PENCERE_MS);
  if (!kota.izin) {
    return NextResponse.json(
      { error: `Çok fazla giriş denemesi. ${Math.ceil(kota.kalanSaniye / 60)} dakika sonra tekrar deneyin.` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Kullanıcı adı ve şifre girin" }, { status: 400 });
  }

  const { login, password } = parsed.data;

  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ username: login }, { email: login }] },
    });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Kullanıcı adı veya şifre hatalı" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = await createSessionToken({ id: user.id, username: user.username, role: user.role });
    await setSessionCookie(token);

    return NextResponse.json({
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (e) {
    const msg = (e as Error).message ?? "";
    if (msg.includes("Can't reach database server") || msg.includes("P1001") || msg.includes("Error code 14")) {
      return NextResponse.json(
        { error: "Veritabanına bağlanılamadı. Önce: npm run setup:local" },
        { status: 503 }
      );
    }
    console.error("login error:", e);
    return NextResponse.json({ error: "Giriş sırasında sunucu hatası oluştu" }, { status: 500 });
  }
}
