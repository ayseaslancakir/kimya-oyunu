// PDF'ten tüm metni çıkarır ve .txt olarak kaydeder.
// Kullanım: node extract-text.mjs <girdi.pdf> <çıktı.txt>
import fs from "node:fs";
import pdf from "pdf-parse";

const [,, input, output] = process.argv;
if (!input || !output) {
  console.error("Kullanım: node extract-text.mjs <girdi.pdf> <çıktı.txt>");
  process.exit(1);
}

const dataBuffer = fs.readFileSync(input);
const data = await pdf(dataBuffer);

// pdf-parse 1.x: data.text tüm belgenin metnidir (sayfa sayısı data.numpages)
fs.writeFileSync(output, data.text, "utf-8");
console.log(`✔ ${data.numpages} sayfa → ${output} (${data.text.length} karakter)`);
