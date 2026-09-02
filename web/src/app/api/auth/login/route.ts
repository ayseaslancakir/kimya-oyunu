import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSessionToken, setSessionCookie, verifyPassword } from "@/lib/auth";

const schema = z.object({
  login: z.string().min(1, "Kullanıcı adı veya e-posta girin"),
  password: z.string().min(1, "Şifre girin"),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Kullanıcı adı ve şifre girin" }, { status: 400 });
  }

  const { login, password } = parsed.data;

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
}
