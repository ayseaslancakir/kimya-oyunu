import type { Metadata } from "next";
import "./globals.css";
import { getSession } from "@/lib/auth";
import SiteNav from "@/components/SiteNav";

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
        <a href="#icerik" className="skip-link">
          İçeriğe geç
        </a>
        <SiteNav
          session={
            session
              ? { username: session.username, role: session.role }
              : null
          }
        />
        <div id="icerik">{children}</div>
      </body>
    </html>
  );
}
