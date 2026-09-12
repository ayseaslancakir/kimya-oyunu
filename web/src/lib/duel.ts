import { prisma } from "@/lib/db";
import { idListesiCoz } from "@/lib/game-session";

// Oyunculardan biri 2 dakika boyunca hiç cevap vermezse düello iptal edilir (status: "cancelled").
export const CEVAPSIZ_IPTAL_MS = 2 * 60 * 1000;

type OyuncuDurumu = {
  finished: boolean;
  joinedAt: Date;
  lastAnswerAt: Date | null;
  answeredIds: string;
};

type DuelDurumu = {
  id: number;
  status: string;
  questionIds: string;
  players: OyuncuDurumu[];
};

// Aktif düelloda cevapsızlık süresi aşıldı mı?
// Turu bitiren ya da tüm soruları cevaplayıp bitirmesi beklenen oyuncular muaf tutulur.
export function cevapsizlikAsildi(duel: DuelDurumu, simdi = Date.now()): boolean {
  if (duel.status !== "active") return false;

  const toplamSoru = idListesiCoz(duel.questionIds).length;

  return duel.players.some((oyuncu) => {
    if (oyuncu.finished) return false;
    if (toplamSoru > 0 && idListesiCoz(oyuncu.answeredIds).length >= toplamSoru) return false;

    const sonHareket = (oyuncu.lastAnswerAt ?? oyuncu.joinedAt).getTime();
    return simdi - sonHareket > CEVAPSIZ_IPTAL_MS;
  });
}

// Süre aşıldıysa düelloyu iptal eder; iptal ettiyse true döner.
export async function cevapsizsaIptalEt(duel: DuelDurumu): Promise<boolean> {
  if (!cevapsizlikAsildi(duel)) return false;

  await prisma.duel.update({
    where: { id: duel.id },
    data: { status: "cancelled", finishedAt: new Date() },
  });
  return true;
}
