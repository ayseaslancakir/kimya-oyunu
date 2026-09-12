// Basit bellek içi hız sınırlayıcı.
// Tek sunucu (Vercel'de tek bölge / yerel geliştirme) için yeterlidir.
// Çok örnekli yayına geçilirse Redis/Upstash'e taşınmalı.

type Kayit = { sayac: number; sifirlamaZamani: number };

const kovalar = new Map<string, Kayit>();
const TEMIZLIK_ARALIGI_MS = 10 * 60_000;
let sonTemizlik = Date.now();

function temizle(simdi: number) {
  if (simdi - sonTemizlik < TEMIZLIK_ARALIGI_MS) return;
  sonTemizlik = simdi;
  for (const [anahtar, kayit] of kovalar) {
    if (kayit.sifirlamaZamani <= simdi) kovalar.delete(anahtar);
  }
}

export type HizSonucu = { izin: boolean; kalanSaniye: number };

/**
 * @param anahtar  kova kimliği (örn. "login:1.2.3.4")
 * @param limit    pencere başına izin verilen deneme sayısı
 * @param pencereMs pencere uzunluğu (ms)
 */
export function hizSiniri(anahtar: string, limit: number, pencereMs: number): HizSonucu {
  const simdi = Date.now();
  temizle(simdi);

  const mevcut = kovalar.get(anahtar);
  if (!mevcut || mevcut.sifirlamaZamani <= simdi) {
    kovalar.set(anahtar, { sayac: 1, sifirlamaZamani: simdi + pencereMs });
    return { izin: true, kalanSaniye: 0 };
  }

  mevcut.sayac += 1;
  if (mevcut.sayac > limit) {
    return { izin: false, kalanSaniye: Math.ceil((mevcut.sifirlamaZamani - simdi) / 1000) };
  }
  return { izin: true, kalanSaniye: 0 };
}

// Ters vekil (Vercel) arkasında istemci IP'si.
export function istemciIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "bilinmeyen";
}
