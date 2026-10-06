import { Scanner } from "@/components/Scanner";

export default function ScannerPage() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="font-display text-3xl text-[var(--navy)]">QR tarayıcı</h1>
      <p className="text-sm text-[var(--muted)]">
        Öğrencinin kartındaki kodu okutun. Yalnızca ad, soyad, üniversite, kart geçerliliği ve
        indirim oranı gösterilir.
      </p>
      <Scanner />
    </div>
  );
}
