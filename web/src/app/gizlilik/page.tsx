import Link from "next/link";

export const metadata = {
  title: "Gizlilik | Kimya Oyunu",
};

export default function GizlilikPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-black">Gizlilik notu</h1>
      <p className="mt-4 text-slate-300">
        Bu bir eğitici okul projesidir. Hesap açınca kullanıcı adı, e-posta, şifre özeti
        (hash) ve oyun skorların kaydedilir. Amaç sıralama, sınıf raporu ve ilerlemeyi göstermek.
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-400">
        <li>Şifre düz metin saklanmaz.</li>
        <li>Öğretmen, yalnız kendi sınıfındaki öğrencilerin ilerleme özetini görür.</li>
        <li>18 yaş altı öğrenciler için okul / veli onayı öğretmenin sorumluluğundadır.</li>
        <li>Hesap silme isteği için öğretmenine veya proje sahibine yaz.</li>
      </ul>
      <p className="mt-6">
        <Link href="/" className="font-semibold text-cyan-400 hover:underline">
          Ana sayfaya dön
        </Link>
      </p>
    </main>
  );
}
