import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { clearSessionCookie, getSession } from "@/lib/auth";

// POST /api/auth/delete
// Oturum sahibinin hesabını ve ona bağlı tüm kayıtları siler:
// skorlar, ilerleme (ustalık), rozetler, envanter, oyun turları, soru bazlı ustalık,
// sınıf üyelikleri ve öğretmense sahip olduğu sınıflar ile kurduğu düellolar.
export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Giriş yapılmamış" }, { status: 401 });
  }

  const userId = session.id;

  try {
    await prisma.$transaction(async (tx) => {
      // Öğretmenin sahip olduğu sınıflar: önce üyelikler, sonra sınıflar.
      const siniflar = await tx.class.findMany({
        where: { teacherId: userId },
        select: { id: true },
      });
      const sinifIdleri = siniflar.map((c) => c.id);
      if (sinifIdleri.length > 0) {
        await tx.classStudent.deleteMany({ where: { classId: { in: sinifIdleri } } });
        await tx.class.deleteMany({ where: { id: { in: sinifIdleri } } });
      }

      // Kurduğu düellolar: önce oyuncular, sonra düellolar.
      const duellolar = await tx.duel.findMany({
        where: { creatorId: userId },
        select: { id: true },
      });
      const duelloIdleri = duellolar.map((d) => d.id);
      if (duelloIdleri.length > 0) {
        await tx.duelPlayer.deleteMany({ where: { duelId: { in: duelloIdleri } } });
        await tx.duel.deleteMany({ where: { id: { in: duelloIdleri } } });
      }

      // Kullanıcıya doğrudan bağlı kayıtlar.
      await tx.classStudent.deleteMany({ where: { userId } });
      await tx.duelPlayer.deleteMany({ where: { userId } });
      await tx.questionMastery.deleteMany({ where: { userId } });
      await tx.gameSession.deleteMany({ where: { userId } });
      await tx.userProgress.deleteMany({ where: { userId } });
      await tx.score.deleteMany({ where: { userId } });
      await tx.inventoryItem.deleteMany({ where: { userId } });
      await tx.userAchievement.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });

    // Oturum çerezi de temizlenir.
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("delete account error:", e);
    return NextResponse.json({ error: "Hesap silinemedi" }, { status: 500 });
  }
}
