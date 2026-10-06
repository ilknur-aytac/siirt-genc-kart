import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction } from "@/app/actions/auth";
import { BrandMark } from "@/components/BrandMark";
import { getSessionUser, homeForRole } from "@/lib/auth";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (user) redirect(homeForRole(user.role));
  const params = await searchParams;

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8">
        <BrandMark />
      </Link>
      <h1 className="font-display text-3xl text-[var(--navy)]">Öğrenci kaydı</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Hesabınızı oluşturun, ardından öğrenci belgenizle başvurun.
      </p>
      {params.error ? (
        <p className="mt-4 rounded-2xl bg-[#fde8e8] px-4 py-3 text-sm text-[#9b2c2c]">
          {params.error}
        </p>
      ) : null}
      <form action={registerAction} className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Ad</label>
            <input className="input" name="firstName" required />
          </div>
          <div>
            <label className="label">Soyad</label>
            <input className="input" name="lastName" required />
          </div>
        </div>
        <div>
          <label className="label">E-posta</label>
          <input className="input" name="email" type="email" required />
        </div>
        <div>
          <label className="label">Şifre</label>
          <input className="input" name="password" type="password" minLength={6} required />
        </div>
        <button className="btn-primary w-full" type="submit">
          Kayıt ol
        </button>
      </form>
      <p className="mt-4 text-sm text-[var(--muted)]">
        Zaten hesabınız var mı?{" "}
        <Link href="/login" className="font-semibold text-[var(--navy)]">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
