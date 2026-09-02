import { NextResponse } from "next/server";

// Sağlık kontrolü: iskeletin ayakta olduğunu doğrulamak için
// http://localhost:3000/api/health
export function GET() {
  return NextResponse.json({
    status: "ok",
    app: "kimya-oyunu",
    time: new Date().toISOString(),
  });
}
