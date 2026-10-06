import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { LogoutButton } from "@/components/LogoutButton";
import type { SessionUser } from "@/lib/types";

const NAV: Record<
  SessionUser["role"],
  { href: string; label: string }[]
> = {
  student: [
    { href: "/student", label: "Özet" },
    { href: "/student/card", label: "Kartım" },
    { href: "/student/history", label: "Geçmiş" },
    { href: "/student/profile", label: "Profil" },
  ],
  business: [
    { href: "/business", label: "Özet" },
    { href: "/business/scanner", label: "Tarayıcı" },
    { href: "/business/history", label: "Geçmiş" },
    { href: "/business/profile", label: "Profil" },
  ],
  admin: [
    { href: "/admin", label: "Panel" },
    { href: "/admin/applications", label: "Başvurular" },
    { href: "/admin/students", label: "Öğrenciler" },
    { href: "/admin/businesses", label: "İşletmeler" },
    { href: "/admin/users", label: "Kullanıcılar" },
    { href: "/admin/discounts", label: "İndirimler" },
    { href: "/admin/redemptions", label: "Kullanımlar" },
  ],
};

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  const items = NAV[user.role];
  return (
    <div className="min-h-full bg-[var(--paper)]">
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[rgba(250,247,241,0.9)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href={items[0].href} className="shrink-0">
            <BrandMark />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {items.map((item) => (
              <Link key={item.href} href={item.href} className="nav-link">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden text-right text-sm sm:block">
              <span className="block font-medium text-[var(--navy)]">
                {user.firstName} {user.lastName}
              </span>
              <span className="block text-[11px] uppercase tracking-wider text-[var(--muted)]">
                {user.role === "admin"
                  ? "Yönetici"
                  : user.role === "business"
                    ? "İşletme"
                    : "Öğrenci"}
              </span>
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-24 md:pb-10">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--line)] bg-[rgba(250,247,241,0.96)] backdrop-blur md:hidden">
        <div className="grid grid-cols-4">
          {items.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-1 py-3 text-center text-[11px] font-medium text-[var(--navy)]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
