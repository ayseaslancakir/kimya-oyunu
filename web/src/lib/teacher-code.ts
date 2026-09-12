import { timingSafeEqual } from "node:crypto";

// Öğretmen kaydı bir kodla korunur. Kod YALNIZCA ortam değişkeninden (TEACHER_CODE) gelir:
// veritabanına yazılmaz, panelden düzenlenebilir bir alana açılmaz.
// Yayında (Vercel) tanımlı olması ZORUNLUDUR; tanımlı değilse öğretmen kaydı reddedilir.
export const TEACHER_CODE_MIN_LENGTH = 8;

export function getTeacherCode(): string | null {
  const raw = process.env.TEACHER_CODE?.trim();
  return raw && raw.length > 0 ? raw : null;
}

// Yayında kısa/eksik kod kabul edilmez (kolay tahmin edilmesin).
export function isTeacherCodeConfigured(): boolean {
  const code = getTeacherCode();
  if (!code) return false;
  if (process.env.NODE_ENV === "production" && code.length < TEACHER_CODE_MIN_LENGTH) return false;
  return true;
}

// Sabit zamanlı karşılaştırma; kod tanımlı değilse her zaman false.
export function verifyTeacherCode(input: unknown): boolean {
  if (!isTeacherCodeConfigured()) return false;
  if (typeof input !== "string") return false;

  const given = Buffer.from(input.trim(), "utf8");
  const expected = Buffer.from(getTeacherCode() as string, "utf8");
  if (given.length !== expected.length) return false;
  return timingSafeEqual(given, expected);
}
