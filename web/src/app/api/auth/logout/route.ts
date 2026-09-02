import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function GET() {
  await clearSessionCookie();
  // Çıkış sonrası ana sayfaya yönlendir
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}
