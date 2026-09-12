#!/usr/bin/env node
// Uçtan uca duman testi — yeni paket kullanmaz; Node'un yerleşik fetch'i yeter.
//
// Zincir: sağlık → kayıt → giriş → quiz soruları → cevap → tur bitir → liderlik
// Her adımda beklenen HTTP kodu kontrol edilir, sonunda özet basılır.
// Hata varsa çıkış kodu 1 olur. Test kullanıcısı sonunda silinir.
//
// Kullanım (web/ içinden):
//   npm run dev          # ayrı bir terminalde sunucu çalışıyor olmalı
//   npm run test:duman
//
// Farklı adres için: SMOKE_BASE_URL=http://localhost:3001 npm run test:duman
// Not: /api/auth/register aynı IP'den saatte en fazla 5 hesap açar; testi
// kısa sürede çok kez koşarsan 429 dönebilir (bir süre bekleyip tekrar dene).

import { createRequire } from "node:module";

// Güvenlik ağı temizliği için mevcut bağımlılık (yeni paket değil):
// /api/auth/delete başarısız olursa test kullanıcısı doğrudan veritabanından silinir.
const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");

const BASE = (process.env.SMOKE_BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const CIZGI = "─".repeat(64);

const sonuclar = [];
let basarisiz = 0;

// Temizlik durumu (modül düzeyinde: hata olsa bile finally'de kullanılır)
let testKullaniciAdi = null;
let kullaniciSilindi = false;

function dogrula(ad, gecti, not = "") {
  sonuclar.push({ ad, gecti, not });
  if (!gecti) basarisiz += 1;
  console.log(`${gecti ? "✅" : "❌"} ${ad}${not ? `  — ${not}` : ""}`);
  return gecti;
}

function atla(ad, not) {
  sonuclar.push({ ad, gecti: false, not });
  basarisiz += 1;
  console.log(`⏭️  ${ad}  — atlandı (${not})`);
}

function hataNot(yanit) {
  if (yanit.hata) return yanit.hata;
  const mesaj = yanit.veri?.error;
  return mesaj ? `${mesaj}` : "";
}

async function cagir(yol, { method = "GET", body, cookie } = {}) {
  const headers = {};
  if (body !== undefined) headers["content-type"] = "application/json";
  if (cookie) headers.cookie = cookie;

  try {
    const res = await fetch(`${BASE}${yol}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: "manual",
    });
    const metin = await res.text();
    let veri = null;
    try {
      veri = metin ? JSON.parse(metin) : null;
    } catch {
      veri = null;
    }
    const hamCerez = res.headers.get("set-cookie");
    const eslesme = hamCerez ? hamCerez.match(/kimya_token=([^;]+)/) : null;
    return { durum: res.status, veri, metin, cookie: eslesme ? `kimya_token=${eslesme[1]}` : null };
  } catch (e) {
    return { durum: 0, veri: null, metin: "", cookie: null, hata: e.message };
  }
}

// /api/auth/delete çalışmadıysa son çare: kullanıcıyı ve bağlı kayıtlarını sil.
async function guvenlikAginiTemizle() {
  if (kullaniciSilindi || !testKullaniciAdi) return;
  const prisma = new PrismaClient();
  try {
    const kullanici = await prisma.user.findUnique({ where: { username: testKullaniciAdi } });
    if (!kullanici) return;
    const userId = kullanici.id;
    await prisma.classStudent.deleteMany({ where: { userId } });
    await prisma.duelPlayer.deleteMany({ where: { userId } });
    await prisma.questionMastery.deleteMany({ where: { userId } });
    await prisma.gameSession.deleteMany({ where: { userId } });
    await prisma.userProgress.deleteMany({ where: { userId } });
    await prisma.score.deleteMany({ where: { userId } });
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    await prisma.userAchievement.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    console.log(`   ↻ Güvenlik ağı: "${testKullaniciAdi}" doğrudan veritabanından silindi.`);
  } catch (e) {
    console.error(`\n⚠️  Güvenlik ağı temizliği başarısız: ${e.message}`);
    console.error(`   Elle silmek için: kullanıcı adı "${testKullaniciAdi}"`);
  } finally {
    await prisma.$disconnect();
  }
}

function ozetYazdir() {
  const gecen = sonuclar.filter((s) => s.gecti).length;
  console.log(`\n${CIZGI}`);
  console.log(`ÖZET: ${gecen}/${sonuclar.length} kontrol geçti.`);
  if (basarisiz === 0) {
    console.log("Sonuç: ✅ Duman testi başarılı (kayıt → giriş → quiz → cevap → bitir → liderlik).");
  } else {
    console.log(`Sonuç: ❌ ${basarisiz} kontrol başarısız.`);
    for (const s of sonuclar.filter((x) => !x.gecti)) {
      console.log(`   • ${s.ad}${s.not ? ` — ${s.not}` : ""}`);
    }
  }
  console.log(CIZGI);
  process.exitCode = basarisiz === 0 ? 0 : 1;
}

async function main() {
  const damga = Date.now().toString(36);
  const rastgele = Math.random().toString(36).slice(2, 6);
  testKullaniciAdi = `duman_${damga}${rastgele}`.slice(0, 20);
  const eposta = `${testKullaniciAdi}@duman-test.local`;
  const sifre = `Duman!${damga}${rastgele}`;

  console.log(`\n🧪 DUMAN TESTİ — ${BASE}`);
  console.log(`   Test kullanıcısı: ${testKullaniciAdi}`);
  console.log(CIZGI);

  // ---------- 1) Sağlık ----------
  const saglik = await cagir("/api/health");
  dogrula("1) Sağlık: GET /api/health", saglik.durum === 200, `HTTP ${saglik.durum}${hataNot(saglik) ? ` — ${hataNot(saglik)}` : ""}`);
  dogrula("   veritabanı bağlı (db=ok)", saglik.veri?.db === "ok", `db=${saglik.veri?.db ?? "?"}`);
  if (saglik.durum !== 200) {
    console.log("\n⚠️  Sunucu ayakta değil. Ayrı bir terminalde önce şunu çalıştır:");
    console.log("     cd web && npm run dev");
    return;
  }

  // ---------- 2) Kayıt ----------
  const kayit = await cagir("/api/auth/register", {
    method: "POST",
    body: { username: testKullaniciAdi, email: eposta, password: sifre, role: "student", gradeLevel: 9 },
  });
  dogrula("2) Kayıt: POST /api/auth/register", kayit.durum === 201, `HTTP ${kayit.durum}${hataNot(kayit) ? ` — ${hataNot(kayit)}` : ""}`);
  let cerez = kayit.cookie;

  // ---------- 3) Giriş ----------
  const giris = await cagir("/api/auth/login", {
    method: "POST",
    body: { login: testKullaniciAdi, password: sifre },
  });
  dogrula("3) Giriş: POST /api/auth/login", giris.durum === 200, `HTTP ${giris.durum}${hataNot(giris) ? ` — ${hataNot(giris)}` : ""}`);
  if (giris.cookie) cerez = giris.cookie;
  dogrula("   oturum çerezi alındı (kimya_token)", Boolean(cerez), cerez ? "var" : "yok");

  // ---------- 4) Oynanabilir bir ünite bul (harita bağlantısından) ----------
  let unitId = null;
  if (cerez) {
    const harita = await cagir("/harita", { cookie: cerez });
    dogrula("4) Harita: GET /harita", harita.durum === 200, `HTTP ${harita.durum}`);
    const eslesme = harita.metin.match(/\/oyun\/quiz\?unitId=(\d+)/);
    unitId = eslesme ? Number(eslesme[1]) : null;
    dogrula("   oynanabilir ünite bulundu", unitId !== null, unitId ? `unitId=${unitId}` : "haritada quiz bağlantısı yok");
  } else {
    atla("4) Harita: GET /harita", "oturum çerezi yok");
  }

  // ---------- 5) Quiz soruları (tur başlatır) ----------
  let sessionId = null;
  let ilkSoru = null;
  if (cerez && unitId) {
    const sorular = await cagir(`/api/quiz/questions?unitId=${unitId}&limit=5`, { cookie: cerez });
    dogrula("5) Sorular: GET /api/quiz/questions", sorular.durum === 200, `HTTP ${sorular.durum}${hataNot(sorular) ? ` — ${hataNot(sorular)}` : ""}`);
    sessionId = sorular.veri?.sessionId ?? null;
    ilkSoru = sorular.veri?.questions?.[0] ?? null;
    dogrula("   tur oturumu açıldı (sessionId)", typeof sessionId === "number", `sessionId=${sessionId}`);
    dogrula("   soru listesi dolu", Array.isArray(sorular.veri?.questions) && sorular.veri.questions.length > 0, `${sorular.veri?.questions?.length ?? 0} soru`);
  } else {
    atla("5) Sorular: GET /api/quiz/questions", "önceki adım başarısız");
  }

  // ---------- 6) Cevap (puan sunucuda hesaplanır) ----------
  if (cerez && sessionId && ilkSoru?.options?.length) {
    const cevap = await cagir("/api/quiz/answer", {
      method: "POST",
      cookie: cerez,
      body: { sessionId, questionId: ilkSoru.id, optionId: ilkSoru.options[0].id },
    });
    dogrula("6) Cevap: POST /api/quiz/answer", cevap.durum === 200, `HTTP ${cevap.durum}${hataNot(cevap) ? ` — ${hataNot(cevap)}` : ""}`);
    dogrula("   sunucu doğruluk döndü (correct)", typeof cevap.veri?.correct === "boolean", `correct=${cevap.veri?.correct}`);
    dogrula("   sunucu skoru döndü (score)", typeof cevap.veri?.score === "number", `score=${cevap.veri?.score}`);
  } else {
    atla("6) Cevap: POST /api/quiz/answer", "oturum veya soru yok");
  }

  // ---------- 7) Tur bitir ----------
  if (cerez && sessionId) {
    const bitir = await cagir("/api/quiz/finish", { method: "POST", cookie: cerez, body: { sessionId } });
    dogrula("7) Tur bitir: POST /api/quiz/finish", bitir.durum === 200, `HTTP ${bitir.durum}${hataNot(bitir) ? ` — ${hataNot(bitir)}` : ""}`);
    dogrula("   sonuç sunucudaki turdan okundu (ok=true)", bitir.veri?.ok === true, `score=${bitir.veri?.score ?? "?"}`);
  } else {
    atla("7) Tur bitir: POST /api/quiz/finish", "oturum veya tur yok");
  }

  // ---------- 8) Liderlik ----------
  if (cerez) {
    const lider = await cagir("/api/leaderboard?period=week&mode=quiz_arena", { cookie: cerez });
    dogrula("8) Liderlik: GET /api/leaderboard", lider.durum === 200, `HTTP ${lider.durum}${hataNot(lider) ? ` — ${hataNot(lider)}` : ""}`);
    dogrula("   satır listesi geldi (rows)", Array.isArray(lider.veri?.rows), `${lider.veri?.rows?.length ?? "?"} satır`);
  } else {
    atla("8) Liderlik: GET /api/leaderboard", "oturum çerezi yok");
  }

  // ---------- 9) Temizlik: test kullanıcısını sil ----------
  if (cerez) {
    const sil = await cagir("/api/auth/delete", { method: "POST", cookie: cerez });
    kullaniciSilindi = sil.durum === 200 && sil.veri?.ok === true;
    dogrula("9) Temizlik: POST /api/auth/delete", kullaniciSilindi, `HTTP ${sil.durum}${hataNot(sil) ? ` — ${hataNot(sil)}` : ""}`);
  } else {
    atla("9) Temizlik: POST /api/auth/delete", "oturum çerezi yok");
  }
}

main()
  .catch((e) => {
    sonuclar.push({ ad: "Beklenmeyen hata", gecti: false, not: e.message });
    basarisiz += 1;
    console.error("\nBeklenmeyen hata:", e.message);
  })
  .finally(async () => {
    await guvenlikAginiTemizle();
    ozetYazdir();
  });
