// Periyodik tablodaki yaygın elementler (Hız Yarışı, Bulmaca ve koleksiyon için)
export type Element = {
  symbol: string;
  name: string;
  number: number;
};

export const ELEMENTS: Element[] = [
  { symbol: "H", name: "Hidrojen", number: 1 },
  { symbol: "He", name: "Helyum", number: 2 },
  { symbol: "Li", name: "Lityum", number: 3 },
  { symbol: "Be", name: "Berilyum", number: 4 },
  { symbol: "B", name: "Bor", number: 5 },
  { symbol: "C", name: "Karbon", number: 6 },
  { symbol: "N", name: "Azot", number: 7 },
  { symbol: "O", name: "Oksijen", number: 8 },
  { symbol: "F", name: "Flor", number: 9 },
  { symbol: "Ne", name: "Neon", number: 10 },
  { symbol: "Na", name: "Sodyum", number: 11 },
  { symbol: "Mg", name: "Magnezyum", number: 12 },
  { symbol: "Al", name: "Alüminyum", number: 13 },
  { symbol: "Si", name: "Silisyum", number: 14 },
  { symbol: "P", name: "Fosfor", number: 15 },
  { symbol: "S", name: "Kükürt", number: 16 },
  { symbol: "Cl", name: "Klor", number: 17 },
  { symbol: "Ar", name: "Argon", number: 18 },
  { symbol: "K", name: "Potasyum", number: 19 },
  { symbol: "Ca", name: "Kalsiyum", number: 20 },
  { symbol: "Ti", name: "Titanyum", number: 22 },
  { symbol: "Cr", name: "Krom", number: 24 },
  { symbol: "Mn", name: "Mangan", number: 25 },
  { symbol: "Fe", name: "Demir", number: 26 },
  { symbol: "Co", name: "Kobalt", number: 27 },
  { symbol: "Ni", name: "Nikel", number: 28 },
  { symbol: "Cu", name: "Bakır", number: 29 },
  { symbol: "Zn", name: "Çinko", number: 30 },
  { symbol: "Br", name: "Brom", number: 35 },
  { symbol: "Kr", name: "Kripton", number: 36 },
  { symbol: "Rb", name: "Rubidyum", number: 37 },
  { symbol: "Sr", name: "Stronsiyum", number: 38 },
  { symbol: "Ag", name: "Gümüş", number: 47 },
  { symbol: "Sn", name: "Kalay", number: 50 },
  { symbol: "I", name: "İyot", number: 53 },
  { symbol: "Xe", name: "Ksenon", number: 54 },
  { symbol: "Cs", name: "Sezyum", number: 55 },
  { symbol: "Ba", name: "Baryum", number: 56 },
  { symbol: "Pt", name: "Platin", number: 78 },
  { symbol: "Au", name: "Altın", number: 79 },
  { symbol: "Hg", name: "Cıva", number: 80 },
  { symbol: "Pb", name: "Kurşun", number: 82 },
  { symbol: "U", name: "Uranyum", number: 92 },
];

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
