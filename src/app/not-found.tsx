import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-full place-items-center px-4 text-center">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">404</p>
        <h1 className="mt-2 font-display text-3xl text-[var(--navy)]">Sayfa bulunamadı</h1>
        <Link href="/" className="btn-primary mt-6 inline-flex">
          Ana sayfa
        </Link>
      </div>
    </div>
  );
}
