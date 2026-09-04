"use client";

import { useState } from "react";
import Link from "next/link";

type Session = { username: string; role: string } | null;

export default function SiteNav({ session }: { session: Session }) {
  const [acik, setAcik] = useState(false);

  const linkCls = "text-slate-300 transition hover:text-cyan-300";

  const links = session ? (
    <>
      <Link href="/harita" className={linkCls} onClick={() => setAcik(false)}>
        Harita
      </Link>
      <Link href="/oyun/hiz" className={linkCls} onClick={() => setAcik(false)}>
        Hız
      </Link>
      <Link href="/oyun/bulmaca" className={linkCls} onClick={() => setAcik(false)}>
        Bulmaca
      </Link>
      <Link href="/oyun/lab" className={linkCls} onClick={() => setAcik(false)}>
        Lab
      </Link>
      <Link href="/oyun/duel" className={linkCls} onClick={() => setAcik(false)}>
        Düello
      </Link>
      <Link href="/liderlik" className={linkCls} onClick={() => setAcik(false)}>
        Liderlik
      </Link>
      <Link href="/sinif" className={linkCls} onClick={() => setAcik(false)}>
        Sınıf
      </Link>
      <Link href="/koleksiyon" className={linkCls} onClick={() => setAcik(false)}>
        Koleksiyon
      </Link>
      {session.role === "teacher" && (
        <Link
          href="/panel"
          className="rounded-lg bg-amber-500/15 px-3 py-1.5 font-semibold text-amber-300 transition hover:bg-amber-500/25"
          onClick={() => setAcik(false)}
        >
          Panel
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
      <Link href="/harita" className={linkCls} onClick={() => setAcik(false)}>
        Harita
      </Link>
      <Link href="/giris" className={linkCls} onClick={() => setAcik(false)}>
        Giriş
      </Link>
      <Link
        href="/kayit"
        className="rounded-lg bg-cyan-500 px-3 py-1.5 font-semibold text-slate-950 transition hover:bg-cyan-400"
        onClick={() => setAcik(false)}
      >
        Kayıt Ol
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-black tracking-tight">
          Kimya<span className="text-cyan-400">Oyunu</span>
        </Link>

        <div className="hidden items-center gap-4 text-sm md:flex">{links}</div>

        <button
          type="button"
          className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm md:hidden"
          aria-expanded={acik}
          aria-controls="mobil-menu"
          onClick={() => setAcik((v) => !v)}
        >
          {acik ? "Kapat" : "Menü"}
        </button>
      </nav>
      {acik && (
        <div id="mobil-menu" className="flex flex-col gap-3 border-t border-slate-800 px-4 py-3 text-sm md:hidden">
          {links}
        </div>
      )}
    </header>
  );
}
