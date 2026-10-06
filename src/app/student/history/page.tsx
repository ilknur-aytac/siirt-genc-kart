import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { demoStore } from "@/lib/demo-store";
import { formatDateTime } from "@/lib/format";

export default async function StudentHistoryPage() {
  const { user, error } = await requireUser(["student"]);
  if (!user || error) redirect("/login");
  const student = demoStore.studentForUser(user.id);
  const rows = demoStore.redemptions.filter((r) => r.studentId === student?.id);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-[var(--navy)]">Kullanım geçmişi</h1>
      <div className="card overflow-hidden">
        {rows.length === 0 ? (
          <p className="p-6 text-sm text-[var(--muted)]">Henüz indirim kullanılmadı.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>İşletme</th>
                <th>İndirim</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const business = demoStore.businesses.find((b) => b.id === r.businessId);
                return (
                  <tr key={r.id}>
                    <td>{business?.name ?? "—"}</td>
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
