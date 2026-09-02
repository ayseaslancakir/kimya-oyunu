import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  inviteCode: z.string().min(6, "Davet kodu 6 karakterdir").max(10),
});

// POST /api/classes/join — öğrenci davet koduyla sınıfa katılır
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Davet kodu girin" }, { status: 400 });
  }

  const inviteCode = parsed.data.inviteCode.trim().toUpperCase();
  const sinif = await prisma.class.findUnique({
    where: { inviteCode },
    include: { teacher: { select: { username: true } } },
  });
  if (!sinif) {
    return NextResponse.json({ error: "Bu davet koduyla bir sınıf bulunamadı" }, { status: 404 });
  }

  const mevcut = await prisma.classStudent.findUnique({
    where: { classId_userId: { classId: sinif.id, userId: session.id } },
  });
  if (mevcut) {
    return NextResponse.json({ error: "Zaten bu sınıfın üyesisin" }, { status: 409 });
  }

  await prisma.classStudent.create({
    data: { classId: sinif.id, userId: session.id },
  });

  return NextResponse.json({
    sinif: { id: sinif.id, name: sinif.name, inviteCode: sinif.inviteCode, teacher: sinif.teacher.username },
  });
}
