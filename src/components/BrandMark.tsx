"use client";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl bg-[linear-gradient(145deg,#0c2340,#163a63)] shadow-[0_8px_20px_rgba(12,35,64,0.35)]">
        <span className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_20%,#c9a227,transparent_55%)]" />
        <span className="relative font-display text-lg font-semibold tracking-tight text-[#f6e7c8]">
          SG
        </span>
      </span>
      {!compact ? (
        <span className="leading-tight">
          <span className="block font-display text-base font-semibold tracking-tight text-[var(--navy)]">
            Siirt Genç Kart
          </span>
          <span className="block text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
            Ankara öğrenci kartı
          </span>
        </span>
      ) : null}
    </div>
  );
}
