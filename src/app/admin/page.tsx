import Link from "next/link";
import { demoStore } from "@/lib/demo-store";

export default function AdminHome() {
  const pending = demoStore.applications.filter((a) => a.status === "pending").length;
  const students = demoStore.students.length;
  const businesses = demoStore.businesses.filter((b) => b.isActive).length;
  const redemptions = demoStore.redemptions.length;

  const cards = [
    { href: "/admin/applications", label: "Bekleyen başvuru", value: pending },
    { href: "/admin/students", label: "Aktif öğrenci kartı", value: students },
    { href: "/admin/businesses", label: "İşletme", value: businesses },
    { href: "/admin/redemptions", label: "Toplam kullanım", value: redemptions },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Yönetim</p>
        <h1 className="font-display text-3xl text-[var(--navy)]">Kontrol paneli</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="card p-5">
            <p className="text-xs uppercase tracking-wider text-[var(--muted)]">{c.label}</p>
            <p className="font-display text-4xl text-[var(--navy)]">{c.value}</p>
          </Link>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/discounts" className="card p-5">
          <h2 className="font-display text-xl">İndirimler</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            İşletme bazlı yüzde tanımlarını yönetin.
          </p>
        </Link>
        <Link href="/admin/users" className="card p-5">
          <h2 className="font-display text-xl">İşletme kullanıcıları</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Kasa personeli hesapları oluşturun.</p>
        </Link>
      </div>
    </div>
  );
}
