import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { demoStore } from "@/lib/demo-store";
import { formatDateTime } from "@/lib/format";

export default async function BusinessHome() {
  const { user, error } = await requireUser(["business"]);
  if (!user || error) redirect("/login");
  const business = demoStore.businessForUser(user.id);
  const discount = business ? demoStore.activeDiscount(business.id) : null;
  const rows = demoStore.redemptions.filter((r) => r.businessId === business?.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">İşletme</p>
        <h1 className="font-display text-3xl text-[var(--navy)]">{business?.name ?? "İşletme"}</h1>
        <p className="text-sm text-[var(--muted)]">
          {business?.address} · {business?.city}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Aktif indirim</p>
          <p className="font-display text-4xl text-[var(--navy)]">
            {discount ? `%${discount.percentage}` : "—"}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Bugünkü kullanım</p>
          <p className="font-display text-4xl text-[var(--navy)]">
            {
              rows.filter(
                (r) => new Date(r.createdAt).toDateString() === new Date().toDateString(),
              ).length
            }
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Toplam</p>
          <p className="font-display text-4xl text-[var(--navy)]">{rows.length}</p>
        </div>
      </div>
      <Link href="/business/scanner" className="btn-gold inline-flex px-8 py-3 text-base">
        QR tarayıcıyı aç
      </Link>
      <div className="card overflow-hidden">
        <div className="border-b border-[var(--line)] px-5 py-3 font-medium">Son işlemler</div>
        {rows.slice(0, 5).length === 0 ? (
          <p className="p-5 text-sm text-[var(--muted)]">Henüz işlem yok.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Öğrenci</th>
                <th>İndirim</th>
                <th>Zaman</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 5).map((r) => {
                const student = demoStore.students.find((s) => s.id === r.studentId);
                const profile = student ? demoStore.findProfile(student.userId) : null;
                return (
                  <tr key={r.id}>
                    <td>
                      {profile ? `${profile.firstName} ${profile.lastName}` : "—"}
                    </td>
                    <td>%{r.percentage}</td>
                    <td>{formatDateTime(r.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
