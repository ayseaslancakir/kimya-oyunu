import { NextResponse } from "next/server";
import { isTeacherCodeConfigured } from "@/lib/teacher-code";

// Sağlık kontrolü: iskeletin ayakta olduğunu doğrulamak için
// http://localhost:3000/api/health
// Yayında TEACHER_CODE tanımlı değilse (ya da 8 karakterden kısaysa) sağlık kontrolü
// başarısız döner; böylece eksik yapılandırma yayında fark edilir.
export function GET() {
  const teacherCodeConfigured = isTeacherCodeConfigured();
  const time = new Date().toISOString();

  if (process.env.NODE_ENV === "production" && !teacherCodeConfigured) {
    return NextResponse.json(
      {
        status: "error",
        app: "kimya-oyunu",
        reason: "TEACHER_CODE ortam değişkeni tanımlı değil",
        teacherCodeConfigured,
        time,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    status: "ok",
    app: "kimya-oyunu",
    teacherCodeConfigured,
    time,
  });
}
