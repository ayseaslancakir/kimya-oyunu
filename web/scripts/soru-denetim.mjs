#!/usr/bin/env node
// Soru bankası denetimi — yeni paket kullanmaz (yalnızca Node yerleşikleri + mevcut @prisma/client).
//
// Kullanım (web/ içinden):
//   npm run db:denetim            → raporu yazdırır (çıkış kodu 0)
//   npm run db:denetim -- --strict → sorun varsa çıkış kodu 1 (CI için)
//
// Raporlananlar:
//   (a) aynı metinli tekrar sorular
//   (b) doğru şıkkı hep aynı indekste olan öğrenme çıktıları
//   (c) açıklaması boş sorular
//   (d) hiç sorusu olmayan öğrenme çıktıları
//   (e) müfredat JSON'unda karşılığı olmayan kodlar (ek bilgi: JSON'da olup veritabanında olmayanlar)

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");

const __dirname = dirname(fileURLToPath(import.meta.url));
const MUFREDAT_YOLU = join(__dirname, "..", "..", "data", "curriculum", "tymm_kimya_2026.json");

const STRICT = process.argv.includes("--strict");
const LISTE_LIMITI = 15; // her başlıkta en fazla bu kadar satır gösterilir

const CIZGI = "─".repeat(64);

function baslik(no, metin) {
  console.log(`\n${CIZGI}\n(${no}) ${metin}\n${CIZGI}`);
}

function ilkBoslukYok(metin) {
  return (metin ?? "").replace(/\s+/g, " ").trim();
}

function kisalt(metin, uzunluk = 90) {
  const tek = ilkBoslukYok(metin);
  return tek.length > uzunluk ? `${tek.slice(0, uzunluk - 1)}…` : tek;
}

// Türkçe küçük harfe duyarlı normalleştirme (İ/ı ayrımı için "tr" locale).
function normallestir(metin) {
  return ilkBoslukYok(metin).toLocaleLowerCase("tr");
}

function harf(index) {
  return index >= 0 ? String.fromCharCode(65 + index) : "?";
}

function listele(satirlar) {
  for (const satir of satirlar.slice(0, LISTE_LIMITI)) console.log(`  • ${satir}`);
  if (satirlar.length > LISTE_LIMITI) {
    console.log(`  … ve ${satirlar.length - LISTE_LIMITI} tane daha`);
  }
}

// Müfredat JSON'u gezilerek KİM.* kodları toplanır (yapı değişse bile çalışır).
function kodlariTopla(deger, kume) {
  if (Array.isArray(deger)) {
    for (const eleman of deger) kodlariTopla(eleman, kume);
    return kume;
  }
  if (deger && typeof deger === "object") {
    for (const [anahtar, icerik] of Object.entries(deger)) {
      if (anahtar === "kod" && typeof icerik === "string" && icerik.startsWith("KİM.")) {
        kume.add(icerik.trim());
      } else {
        kodlariTopla(icerik, kume);
      }
    }
  }
  return kume;
}

async function main() {
  const prisma = new PrismaClient();

  try {
    let mufredat;
    try {
      mufredat = JSON.parse(readFileSync(MUFREDAT_YOLU, "utf8"));
    } catch (e) {
      console.error(`Müfredat JSON'u okunamadı: ${MUFREDAT_YOLU}`);
      console.error(e.message);
      process.exitCode = 1;
      return;
    }
    const mufredatKodlari = kodlariTopla(mufredat, new Set());

    const [ciktilar, sorular] = await Promise.all([
      prisma.learningOutcome.findMany({
        select: { id: true, code: true, unit: { select: { name: true } } },
        orderBy: { id: "asc" },
      }),
      prisma.question.findMany({
        select: {
          id: true,
          prompt: true,
          explanation: true,
          kullanim: true,
          outcomeId: true,
          options: {
            select: { id: true, isCorrect: true, orderIndex: true },
            orderBy: { orderIndex: "asc" },
          },
        },
        orderBy: { id: "asc" },
      }),
    ]);

    const ciktiKodu = new Map(ciktilar.map((c) => [c.id, c.code]));

    console.log("\n🧪 SORU BANKASI DENETİMİ");
    console.log(`   Müfredat: ${MUFREDAT_YOLU}`);
    console.log(`   Öğrenme çıktısı: ${ciktilar.length} · Soru: ${sorular.length} · Müfredat kodu (JSON): ${mufredatKodlari.size}`);

    // ---------- (a) Aynı metinli tekrar sorular ----------
    const metinGruplari = new Map();
    for (const soru of sorular) {
      const anahtar = normallestir(soru.prompt);
      if (!anahtar) continue;
      if (!metinGruplari.has(anahtar)) metinGruplari.set(anahtar, []);
      metinGruplari.get(anahtar).push(soru);
    }
    const tekrarlar = [...metinGruplari.values()].filter((grup) => grup.length > 1);

    baslik("a", "Aynı metinli tekrar sorular");
    if (tekrarlar.length === 0) {
      console.log("  ✅ Tekrar yok.");
    } else {
      listele(
        tekrarlar.map((grup) => {
          const kodlar = [...new Set(grup.map((s) => ciktiKodu.get(s.outcomeId) ?? "?"))].join(", ");
          const idler = grup.map((s) => `#${s.id}`).join(", ");
          return `${grup.length}× [${kodlar}] ${kisalt(grup[0].prompt)}  (${idler})`;
        })
      );
    }

    // ---------- (b) Doğru şıkkı hep aynı indekste olan çıktılar ----------
    const ciktiSoru = new Map(); // outcomeId -> { indexler: number[], adet: number }
    for (const soru of sorular) {
      if (!ciktiSoru.has(soru.outcomeId)) ciktiSoru.set(soru.outcomeId, { indexler: [], adet: 0 });
      const kayit = ciktiSoru.get(soru.outcomeId);
      kayit.indexler.push(soru.options.findIndex((o) => o.isCorrect));
      kayit.adet += 1;
    }
    const ayniIndeks = [];
    for (const [outcomeId, kayit] of ciktiSoru) {
      if (kayit.adet < 2) continue; // tek soruda kalıp aranmaz
      const tekil = new Set(kayit.indexler);
      if (tekil.size === 1 && kayit.indexler[0] >= 0) {
        ayniIndeks.push({
          kod: ciktiKodu.get(outcomeId) ?? "?",
          index: kayit.indexler[0],
          adet: kayit.adet,
        });
      }
    }

    baslik("b", "Doğru şıkkı hep aynı indekste olan öğrenme çıktıları");
    console.log("  ℹ️  Not: /api/quiz/questions şıkları sunarken karıştırır (shuffle), bu yüzden oyunda\n      'hep A' görünmez; yine de veri hijyeni için şık konumlarını çeşitlendirmek iyidir.");
    if (ayniIndeks.length === 0) {
      console.log("  ✅ Hepsi dengeli.");
    } else {
      listele(
        ayniIndeks.map(
          (k) => `${k.kod}: ${k.adet} sorunun tamamında doğru şık indeks ${k.index} (${harf(k.index)})`
        )
      );
    }

    // ---------- (c) Açıklaması boş sorular ----------
    const aciklamasiz = sorular.filter((s) => ilkBoslukYok(s.explanation) === "");

    baslik("c", "Açıklaması boş sorular");
    if (aciklamasiz.length === 0) {
      console.log("  ✅ Hepsinin açıklaması var.");
    } else {
      listele(
        aciklamasiz.map(
          (s) => `#${s.id} [${ciktiKodu.get(s.outcomeId) ?? "?"} · ${s.kullanim}] ${kisalt(s.prompt)}`
        )
      );
    }

    // ---------- (d) Hiç sorusu olmayan öğrenme çıktıları ----------
    const soruSayisi = new Map();
    for (const soru of sorular) {
      soruSayisi.set(soru.outcomeId, (soruSayisi.get(soru.outcomeId) ?? 0) + 1);
    }
    const bosCiktilar = ciktilar.filter((c) => (soruSayisi.get(c.id) ?? 0) === 0);

    baslik("d", "Hiç sorusu olmayan öğrenme çıktıları");
    if (bosCiktilar.length === 0) {
      console.log("  ✅ Tüm çıktıların sorusu var.");
    } else {
      listele(bosCiktilar.map((c) => `${c.code} — ${c.unit?.name ?? "?"}`));
    }

    // ---------- (e) Müfredat JSON'unda karşılığı olmayan kodlar ----------
    const veritabaniKodlari = new Set(ciktilar.map((c) => c.code));
    const jsonaOlmayan = ciktilar.filter((c) => !mufredatKodlari.has(c.code));
    const veritabanindaOlmayan = [...mufredatKodlari].filter((kod) => !veritabaniKodlari.has(kod)).sort();

    baslik("e", "Müfredat JSON'unda karşılığı olmayan kodlar");
    if (jsonaOlmayan.length === 0) {
      console.log("  ✅ Tüm çıktı kodları müfredatta bulundu.");
    } else {
      listele(jsonaOlmayan.map((c) => `${c.code} — ${c.unit?.name ?? "?"}`));
    }
    console.log(`\n  ℹ️  Ek bilgi: JSON'da olup veritabanında henüz olmayan kod: ${veritabanindaOlmayan.length}`);
    if (veritabanindaOlmayan.length > 0) listele(veritabanindaOlmayan);

    // ---------- Özet ----------
    const sorunSayisi =
      tekrarlar.length + ayniIndeks.length + aciklamasiz.length + bosCiktilar.length + jsonaOlmayan.length;

    console.log(`\n${CIZGI}`);
    console.log(`ÖZET: tekrar metin ${tekrarlar.length} · dengesiz şık ${ayniIndeks.length} · açıklamasız ${aciklamasiz.length} · boş çıktı ${bosCiktilar.length} · müfredat dışı kod ${jsonaOlmayan.length}`);
    if (sorunSayisi === 0) {
      console.log("Sonuç: ✅ Sorun bulunamadı.");
    } else {
      console.log(`Sonuç: ⚠️  ${sorunSayisi} başlıkta bulgu var (yukarıya bakın).`);
      if (STRICT) process.exitCode = 1;
    }
    console.log(CIZGI);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("Denetim hatası:", e);
  process.exitCode = 1;
});
