import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { getSessionUser, homeForRole } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/config";

export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <div className="min-h-full hero-grid">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <BrandMark />
        <div className="flex gap-2">
          {user ? (
            <Link href={homeForRole(user.role)} className="btn-primary">
              Panele git
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Giriş
              </Link>
              <Link href="/register" className="btn-primary">
                Öğrenci ol
              </Link>
            </>
          )}
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">
            Ankara · Üniversite öğrencileri
          </p>
          <h1 className="mt-3 font-display text-4xl leading-[1.1] text-[var(--navy)] sm:text-6xl">
            Şehrin öğrenci kartı, cebinizde.
          </h1>
          <p className="mt-5 max-w-md text-lg text-[var(--muted)]">
            Siirt Genç Kart ile kafelere, restoranlara ve kitabevlerine dijital üyelik
            kartınızı gösterin; indiriminiz anında uygulansın.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn-gold px-6 py-3">
              Ücretsiz başvur
            </Link>
            <Link href="/login" className="btn-ghost px-6 py-3">
              İşletme / yönetici girişi
            </Link>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-4 max-w-md">
            {[
              ["%20", "örnek kafe indirimi"],
              ["SGK", "benzersiz üye no"],
              ["60 sn", "güvenli QR ömrü"],
            ].map(([k, v]) => (
              <div key={v}>
                <dt className="font-display text-2xl text-[var(--navy)]">{k}</dt>
                <dd className="text-xs text-[var(--muted)]">{v}</dd>
              </div>
            ))}
          </dl>
          {!isSupabaseConfigured() ? (
            <p className="mt-8 max-w-md text-xs text-[var(--muted)]">
              Demo modu açık. Yarınki sunum için hazır hesaplar giriş sayfasındadır.
              Supabase bağlandığında aynı arayüz canlı kimlik doğrulamaya geçer.
            </p>
          ) : null}
        </div>

        <div className="relative">
          <div className="membership-card mx-auto w-full max-w-sm rounded-[32px] p-6 text-[#f6e7c8] shadow-[0_40px_80px_rgba(12,35,64,0.35)]">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a227]">Dijital üyelik</p>
            <p className="mt-8 font-display text-3xl">Elif Yılmaz</p>
            <p className="mt-2 text-sm text-[#f6e7c8]/70">Ankara Üniversitesi</p>
            <p className="mt-8 font-mono tracking-[0.22em]">SGK-184392</p>
            <div className="mt-10 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-[#f6e7c8]/60">
              <span>Geçerli · 2027</span>
              <span>Aktif üye</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 sm:grid-cols-3">
        {[
          ["Öğrenci", "Başvurun, onay alın, kartınızı gösterin."],
          ["İşletme", "QR okutun, profili görün, indirimi uygulayın."],
          ["Yönetim", "Başvuruları onaylayın, indirimleri yönetin."],
        ].map(([t, d]) => (
          <article key={t} className="card p-5">
            <h2 className="font-display text-xl text-[var(--navy)]">{t}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{d}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
