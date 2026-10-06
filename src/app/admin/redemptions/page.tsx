import { demoStore } from "@/lib/demo-store";
import { formatDateTime } from "@/lib/format";

export default function RedemptionsPage() {
  const rows = [...demoStore.redemptions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-[var(--navy)]">Kullanım kayıtları</h1>
      <div className="card overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Öğrenci</th>
              <th>Üyelik</th>
              <th>İşletme</th>
              <th>İndirim</th>
              <th>Tarih</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const student = demoStore.students.find((s) => s.id === r.studentId);
              const profile = student ? demoStore.findProfile(student.userId) : null;
              const business = demoStore.businesses.find((b) => b.id === r.businessId);
              return (
                <tr key={r.id}>
                  <td>{profile ? `${profile.firstName} ${profile.lastName}` : "—"}</td>
                  <td className="font-mono text-xs">{student?.membershipNumber}</td>
                  <td>{business?.name}</td>
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
