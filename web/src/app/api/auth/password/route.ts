import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";
import { hizSiniri } from "@/lib/rate-limit";

const schema = z.object({
  currentPassword: z.string().min(1, "Mevcut şifreyi girin"),
  newPassword: z.string().min(8, "Yeni şifre en az 8 karakter olmalı").max(72),
});

// Mevcut şifreyi deneme saldırısına karşı: kullanıcı başına saatte en fazla 10 deneme.
const SIFRE_LIMITI = 10;
const SIFRE_PENCERE_MS = 60 * 60_000;

// POST /api/auth/password { currentPassword, newPassword }
// Mevcut şifre doğrulanır; doğruysa yeni şifre hash'lenip kaydedilir.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  const kota = hizSiniri(`password:${session.id}`, SIFRE_LIMITI, SIFRE_PENCERE_MS);
  if (!kota.izin) {
    return NextResponse.json(
      { error: "Çok fazla deneme yaptınız. Bir süre sonra tekrar deneyin." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json({ error: first?.message ?? "Geçersiz veri" }, { status: 400 });
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: "Mevcut şifre hatalı" }, { status: 403 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword) },
  });

  return NextResponse.json({ ok: true });
}
