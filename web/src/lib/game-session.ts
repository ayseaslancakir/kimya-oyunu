// Sunucu taraflı oyun turu (GameSession) yardımcıları.
// Skor yalnızca sunucuda hesaplanır; istemciden gelen puan/doğruluk kullanılmaz.
import type { GameSession } from "@prisma/client";

export const DOGRU_TABAN_PUAN = 100; // her doğru cevap için taban puan
export const SERI_BONUSU = 10; // doğru serideki her adım için ek puan

// Doğru cevap puanı: 100 + seri*10 (seri: bu cevapla ulaşılan yeni seri sayısı)
export function cevapPuani(seri: number): number {
  return DOGRU_TABAN_PUAN + seri * SERI_BONUSU;
}

// JSON metin alanlarını (questionIds / answeredIds) güvenli biçimde sayı dizisine çevirir.
export function idListesiCoz(raw: string | null | undefined): number[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((v) => Number(v))
      .filter((v) => Number.isInteger(v));
  } catch {
    return [];
  }
}

export function idListesiYaz(ids: number[]): string {
  return JSON.stringify(ids);
}

// Bitirilmiş turun doğruluk oranı: cevaplanan sorular üzerinden hesaplanır.
export function turDogrulugu(session: Pick<GameSession, "answeredIds" | "correctCount">): number {
  const cevaplanan = idListesiCoz(session.answeredIds).length;
  if (cevaplanan === 0) return 0;
  return Math.max(0, Math.min(1, session.correctCount / cevaplanan));
}
