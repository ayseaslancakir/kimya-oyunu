import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Kimya Oyunu | TYMM Müfredatı",
  description:
    "Türkiye Yüzyılı Maarif Modeli (TYMM) kimya müfredatıyla (9-12) oynayarak öğren.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();

  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
            <Link href="/" className="text-lg font-black tracking-tight">
              🧪 Kimya<span className="text-cyan-400">Oyunu</span>
            </Link>

            <div className="flex items-center gap-4 text-sm">
              <Link href="/harita" className="text-slate-300 transition hover:text-cyan-300">
                Harita
              </Link>
              <Link href="/liderlik" className="text-slate-300 transition hover:text-cyan-300">
                Liderlik
              </Link>
              {session ? (
                <>
                  <Link href="/sinif" className="text-slate-300 transition hover:text-cyan-300">
                    Sınıf
                  </Link>
                  <Link href="/koleksiyon" className="text-slate-300 transition hover:text-cyan-300">
                    Koleksiyon
                  </Link>
                  {session.role === "teacher" && (
                    <Link href="/panel" className="rounded-lg bg-amber-500/15 px-3 py-1.5 font-semibold text-amber-300 transition hover:bg-amber-500/25">
                      🛠️ Panel
                    </Link>
                  )}
                  <span className="hidden font-medium text-slate-400 sm:inline">
                    {session.username}
                    {session.role === "teacher" && (
                      <span className="ml-1.5 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300">
                        Öğretmen
                      </span>
                    )}
                  </span>
                  <Link
                    href="/api/auth/logout"
                    className="rounded-lg border border-slate-700 px-3 py-1.5 font-medium transition hover:border-rose-500 hover:text-rose-300"
                  >
                    Çıkış
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/giris" className="text-slate-300 transition hover:text-cyan-300">
                    Giriş
                  </Link>
                  <Link
                    href="/kayit"
                    className="rounded-lg bg-cyan-500 px-3 py-1.5 font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
