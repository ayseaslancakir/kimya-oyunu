import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "kimya_token";
const FALLBACK_SECRET = "degistir-beni-en-az-32-karakterlik-rastgele-bir-anahtar";

function jwtSecretBytes(): Uint8Array {
  const raw = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production" && (!raw || raw === FALLBACK_SECRET || raw.length < 32)) {
    throw new Error("JWT_SECRET üretimde en az 32 karakter olmalı");
  }
  return new TextEncoder().encode(raw && raw.length >= 16 ? raw : FALLBACK_SECRET);
}

export type SessionUser = {
  id: number;
  username: string;
  role: string;
};

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ username: user.username, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(jwtSecretBytes());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, jwtSecretBytes());
    if (!payload.sub) return null;
    return {
      id: Number(payload.sub),
      username: (payload.username as string) ?? "",
      role: (payload.role as string) ?? "student",
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 gün
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
