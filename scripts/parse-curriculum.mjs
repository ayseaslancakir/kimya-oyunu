// TYMM Kimya 2026 program metninden müfredat JSON'u üretir.
// Kullanım: node parse-curriculum.mjs <girdi.txt> <çıktı.json>
import fs from "node:fs";

const [,, input, output] = process.argv;
if (!input || !output) {
  console.error("Kullanım: node parse-curriculum.mjs <girdi.txt> <çıktı.json>");
  process.exit(1);
}

const raw = fs.readFileSync(input, "utf-8");

// ---------- 1) Satır temizliği ----------
const lines = raw.split(/\r?\n/).map((l) => l.trim());

const cleaned = [];
for (const line of lines) {
  if (!line) continue;
  if (/^\d{1,3}$/.test(line)) continue; // sayfa numaraları
  if (line === "KİMYA DERSİ ÖĞRETİM PROGRAMI") continue; // sayfa başlığı
  if (line === "ÖĞRENME ÇIKTILARI VE" || line === "SÜREÇ BİLEŞENLERİ") continue;
  if (/^2\. KİMYA DERSİ ÖĞRETİM PROGRAMI SINIF DÜZEYLERİNE AİT TEMALAR/.test(line)) continue;
  cleaned.push(line);
}

let text = cleaned.join("\n");

// Yumuşak tireleri birleştir: satır sonundaki "-" + sonraki satırın ilk harfi
text = text.replace(/([\p{L}])-\n([\p{L}])/gu, "$1$2");
text = text.replace(/ {2,}/g, " ");

// ---------- 2) Sınıf bölümlerini bul ----------
const gradeHeaders = [...text.matchAll(/(\d{1,2})\. SINIF TEMALARI/g)];
const grades = [9, 10, 11, 12];
const gradeSlices = {}; // code -> { start, end }

for (const m of gradeHeaders) {
  const code = Number(m[1]);
  if (!grades.includes(code)) continue;
  const after = text.slice(m.index + m[0].length, m.index + m[0].length + 800);
  if (after.includes("1. TEMA:")) {
    gradeSlices[code] = { start: m.index + m[0].length };
  }
}
const codes = Object.keys(gradeSlices).map(Number).sort((a, b) => a - b);
codes.forEach((code, i) => {
  gradeSlices[code].end = i + 1 < codes.length ? gradeSlices[codes[i + 1]].start : text.length;
});

// ---------- 3) Tema bölümlerini bul ----------
const THEME_NAMES = ["ETKİLEŞİM", "ÇEŞİTLİLİK", "SÜRDÜRÜLEBİLİRLİK"];

function sliceTheme(gradeText, themeIndex) {
  const re = new RegExp(`${themeIndex}\\. TEMA: (${THEME_NAMES.join("|")})`);
  const m = re.exec(gradeText);
  if (!m) return null;
  const start = m.index + m[0].length;
  const rest = gradeText.slice(start);
  const next = rest.search(/(?:^|\n)\d\. TEMA: /);
  const end = next === -1 ? rest.length : next;
  return { name: m[1], start, end, text: rest.slice(0, end) };
}

// ---------- 4) Öğrenme çıktılarını ayıkla ----------
const OUTCOME_RE = /KİM\.(\d+)\.(\d+)\.(\d+)\./g;
const COMPONENT_RE = /([a-zçğıöşü])\s*\)\s*([\s\S]*?)(?=\n[a-zçğıöşü]\s*\)|KİM\.\d+\.\d+\.\d+\.|İÇERİK ÇERÇEVESİ|Genellemeler|ÖĞRENME|$)/g;

function normalizeText(s) {
  return s.replace(/\s+/g, " ").trim();
}

function parseOutcomes(themeText) {
  const outcomes = [];
  const re = new RegExp(OUTCOME_RE.source, "g");
  let m;
  while ((m = re.exec(themeText)) !== null) {
    const grade = Number(m[1]);
    const theme = Number(m[2]);
    const order = Number(m[3]);
    const start = m.index + m[0].length;
    const rest = themeText.slice(start);
    const nextCode = rest.search(/KİM\.\d+\.\d+\.\d+\./);
    const nextSection = rest.search(/İÇERİK ÇERÇEVESİ|Genellemeler\/İlkeler|ÖĞRENME KANITLARI/);
    let end = Infinity;
    if (nextCode !== -1) end = Math.min(end, nextCode);
    if (nextSection !== -1) end = Math.min(end, nextSection);
    const block = rest.slice(0, end);

    // Başlık: kod ile ilk bileşen arası
    const compStart = block.search(/\n[a-zçğıöşü]\s*\)/);
    const title = normalizeText(compStart === -1 ? block : block.slice(0, compStart));
    if (!title) continue;

    // Süreç bileşenleri
    const components = [];
    const cre = new RegExp(COMPONENT_RE.source, "g");
    const compBlock = compStart === -1 ? "" : block.slice(compStart);
    let cm;
    while ((cm = cre.exec(compBlock)) !== null) {
      components.push(`${cm[1]}) ${normalizeText(cm[2])}`);
    }

    outcomes.push({
      kod: `KİM.${grade}.${theme}.${order}`,
      metin: title,
      surecBilesenleri: components,
      bilisselDuzey: classifyLevel(title),
    });
  }
  return outcomes;
}

// ---------- 5) Bilişsel düzey sınıflandırması (tahmini) ----------
const KEYWORDS = {
  analiz: ["çözümle", "akıl yürüt", "tümevarım", "tümdengelim", "çıkarım", "sorgula", "karşılaştır", "değerlendir", "çelişki", "ayıklar", "eleştirel", "analiz", "yargı", "kanıt", "hipotez", "belirle", "incele", "sınar"],
  uygulama: ["deney yap", "gözlem yap", "hesapla", "uygula", "oluşturabilme", "hazırla", "yazma", "yazabilme", "planla", "gerçekleştir", "kullanır", "kullanarak", "çözme", "çözer", "model oluştur"],
  anlama: ["açıkla", "tanımla", "özetle", "yorumla", "anlamlandır", "ilişkilendir", "göster", "ifade eder", "örüntü", "genelleme", "karşılaştırarak"],
};

function classifyLevel(title) {
  const t = title.toLowerCase();
  for (const [level, words] of Object.entries(KEYWORDS)) {
    if (words.some((w) => t.includes(w))) return level;
  }
  return "hatırlama";
}

// ---------- 6) İçerik çerçevesi (üniteler/bölümler) ----------
// Her bölüm "BölümAdı: konular" biçiminde YENİ SATIRDA başlar.
function parseUnits(themeText) {
  const startIdx = themeText.search(/İÇERİK ÇERÇEVESİ/);
  if (startIdx === -1) return [];
  let block = themeText.slice(startIdx + "İÇERİK ÇERÇEVESİ".length);
  const endMatch = block.search(/Genellemeler\/İlkeler|ÖĞRENME\s*KANITLARI|Öğrenme-Öğretme/);
  if (endMatch !== -1) block = block.slice(0, endMatch);

  const units = [];
  const nameLineRe = /^([A-ZÇĞİÖŞÜ][^:]{1,90}?):\s*(.*)$/;
  for (const line of block.split(/\n/)) {
    const l = line.trim();
    if (!l) continue;
    const m = nameLineRe.exec(l);
    if (m) {
      units.push({ adi: normalizeText(m[1]), konular: splitKonular(m[2]) });
    } else if (units.length > 0) {
      // Bölümün devam eden satırı: ilk parça önceki konuya birleşir (satır taşması)
      const last = units[units.length - 1];
      const parts = splitKonular(l);
      if (parts.length > 0 && last.konular.length > 0) {
        last.konular[last.konular.length - 1] += " " + parts.shift();
      }
      last.konular.push(...parts);
    }
  }
  return units;
}

function splitKonular(s) {
  return s
    .split(/,\s+/)
    .map((k) => normalizeText(k))
    .filter(Boolean);
}

// ---------- 7) Anahtar kavramlar ----------
function parseKeyConcepts(themeText) {
  const idx = themeText.search(/Anahtar Kavramlar/);
  if (idx === -1) return [];
  let block = themeText.slice(idx + "Anahtar Kavramlar".length);
  const end = block.search(/ÖĞRENME\s*KANITLARI|ÖĞRENME$/);
  if (end !== -1) block = block.slice(0, end);
  return splitKonular(block);
}

// ---------- 8) Ders saati + tema açıklaması ----------
function parseThemeMeta(themeText) {
  const saatMatch = themeText.match(/DERS SAATİ\s*(\d+)/);
  const dersSaati = saatMatch ? Number(saatMatch[1]) : null;

  const aciklamaStart = themeText.search(/\n/); // tema başlığından sonraki satır
  const aciklamaEnd = themeText.search(/DERS SAATİ|ALAN/);
  let aciklama = "";
  if (aciklamaStart !== -1 && aciklamaEnd !== -1 && aciklamaEnd > aciklamaStart) {
    aciklama = normalizeText(themeText.slice(aciklamaStart + 1, aciklamaEnd));
  }
  return { dersSaati, aciklama };
}

// ---------- 9) Çıktıları ünitelere eşle (kelime tabanlı) ----------
const STOPWORDS = new Set([
  "ilişkin", "yönelik", "yapabilme", "bilimsel", "temelinde", "kullanarak",
  "çözebilme", "oluşturabilme", "belirleyebilme", "amaçlanmaktadır", "çıkarım",
  "akıl", "yürütme", "gözlem", "model", "ilişkilerini", "bulunabilme", "değerlendirme",
]);

function assignUnits(theme) {
  const units = theme.uniteler;
  if (!units.length) {
    theme.ogrenmeCiktilar.forEach((o) => (o.unitAdi = null));
    return;
  }
  if (units.length === 1) {
    theme.ogrenmeCiktilar.forEach((o) => (o.unitAdi = units[0].adi));
    return;
  }
  const konuWords = units.map((u) =>
    u.konular.flatMap((k) =>
      k.toLowerCase().split(/[^a-zçğıöşü]+/).filter((w) => w.length >= 4)
    )
  );

  theme.ogrenmeCiktilar.forEach((o) => {
    const words = o.metin.toLowerCase().split(/[^a-zçğıöşü]+/).filter((w) => w.length > 4 && !STOPWORDS.has(w));
    let best = 0;
    let bestScore = 0;
    units.forEach((u, i) => {
      let score = 0;
      for (const w of words) {
        for (const kw of konuWords[i]) {
          if (w.includes(kw) || kw.includes(w)) score++;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    });
    o.unitAdi = units[best].adi;
  });
}

// ---------- Ana akış ----------
const siniflar = [];
for (const code of codes) {
  const { start, end } = gradeSlices[code];
  const gradeText = text.slice(start, end);
  const temalar = [];

  for (let t = 1; t <= 3; t++) {
    const theme = sliceTheme(gradeText, t);
    if (!theme) continue;
    const { dersSaati, aciklama } = parseThemeMeta(theme.text);
    const themeObj = {
      adi: titleCase(theme.name),
      sira: t,
      dersSaati,
      aciklama,
      uniteler: parseUnits(theme.text).map((u, i) => ({ ...u, sira: i + 1 })),
      anahtarKavramlar: parseKeyConcepts(theme.text),
      ogrenmeCiktilar: parseOutcomes(theme.text),
    };
    assignUnits(themeObj);
    temalar.push(themeObj);
  }

  siniflar.push({ kod: code, temalar });
}

function titleCase(s) {
  // Türkçe İ/I eşlemesi: JS toLowerCase, İ'yi "i + birleşik nokta"ya çevirir
  const lower = s.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();
  return s.charAt(0) + lower.slice(1);
}

const result = {
  meta: {
    ders: "Kimya",
    program: "TYMM Kimya Dersi (9-12)",
    surum: "2026",
    kaynak: "https://mufredat.meb.gov.tr/ProgramDetay.aspx?PID=2255",
    not: "Öğrenme çıktıları ve içerik çerçevesi resmi PDF'ten otomatik çıkarıldı. bilisselDuzey alanı anahtar kelime sınıflandırmasıyla tahmin edilmiştir; içerik üretiminde gözden geçirilmelidir.",
  },
  siniflar,
};

fs.writeFileSync(output, JSON.stringify(result, null, 2), "utf-8");

// Özet rapor
const toplam = result.siniflar.reduce((acc, s) => acc + s.temalar.reduce((a2, t) => a2 + t.ogrenmeCiktilar.length, 0), 0);
const toplamUnite = result.siniflar.reduce((acc, s) => acc + s.temalar.reduce((a2, t) => a2 + t.uniteler.length, 0), 0);
console.log(`✔ JSON oluşturuldu → ${output}`);
console.log(`  Sınıflar: ${result.siniflar.map((s) => `${s.kod} (${s.temalar.reduce((a, t) => a + t.ogrenmeCiktilar.length, 0)} çıktı)`).join(", ")}`);
console.log(`  Toplam öğrenme çıktısı: ${toplam} · Ünite: ${toplamUnite}`);
