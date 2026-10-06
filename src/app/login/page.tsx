import Link from "next/link";
import { loginAction, demoLoginAction } from "@/app/actions/auth";
import { BrandMark } from "@/components/BrandMark";
import { DEMO_LOGINS } from "@/lib/demo-store";
import { getSessionUser, homeForRole } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const user = await getSessionUser();
  if (user) redirect(homeForRole(user.role));
  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8">
        <BrandMark />
      </Link>
      <h1 className="font-display text-3xl text-[var(--navy)]">Giriş yap</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Öğrenci, işletme veya yönetici hesabınızla devam edin.
      </p>
      {params.error ? (
        <p className="mt-4 rounded-2xl bg-[#fde8e8] px-4 py-3 text-sm text-[#9b2c2c]">
          {params.error}
        </p>
      ) : null}
      <form action={loginAction} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={params.next ?? ""} />
        <div>
          <label className="label">E-posta</label>
          <input className="input" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <label className="label">Şifre</label>
          <input
            className="input"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        <button className="btn-primary w-full" type="submit">
          Giriş
        </button>
      </form>
      <p className="mt-4 text-sm text-[var(--muted)]">
        Hesabınız yok mu?{" "}
        <Link href="/register" className="font-semibold text-[var(--navy)]">
          Öğrenci kaydı
        </Link>
      </p>
      <div className="mt-8 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          Hızlı demo
        </p>
        {DEMO_LOGINS.map((item) => (
          <form action={demoLoginAction} key={item.email}>
            <input type="hidden" name="email" value={item.email} />
            <input type="hidden" name="password" value={item.password} />
            <button className="btn-ghost w-full justify-between" type="submit">
              <span>{item.label}</span>
              <span className="text-[11px] text-[var(--muted)]">{item.email}</span>
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
