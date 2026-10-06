import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { demoStore } from "@/lib/demo-store";
import { formatDateTime } from "@/lib/format";

export default async function BusinessHistoryPage() {
  const { user, error } = await requireUser(["business"]);
  if (!user || error) redirect("/login");
  const business = demoStore.businessForUser(user.id);
  const rows = demoStore.redemptions.filter((r) => r.businessId === business?.id);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-[var(--navy)]">İşlem geçmişi</h1>
      <div className="card overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Öğrenci</th>
              <th>Üyelik</th>
              <th>İndirim</th>
              <th>Tarih</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const student = demoStore.students.find((s) => s.id === r.studentId);
              const profile = student ? demoStore.findProfile(student.userId) : null;
              return (
                <tr key={r.id}>
                  <td>{profile ? `${profile.firstName} ${profile.lastName}` : "—"}</td>
                  <td className="font-mono text-xs">{student?.membershipNumber ?? "—"}</td>
                  <td>%{r.percentage}</td>
                  <td>{formatDateTime(r.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
