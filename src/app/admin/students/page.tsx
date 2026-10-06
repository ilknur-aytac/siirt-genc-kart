import { toggleStudentAction } from "@/app/actions/admin";
import { StatusBadge } from "@/components/StatusBadge";
import { demoStore } from "@/lib/demo-store";
import { statusLabel } from "@/lib/format";

export default function StudentsPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-[var(--navy)]">Öğrenci yönetimi</h1>
      <div className="card overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Üye</th>
              <th>Üyelik no</th>
              <th>Üniversite</th>
              <th>Durum</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {demoStore.students.map((s) => {
              const p = demoStore.findProfile(s.userId);
              return (
                <tr key={s.id}>
                  <td>
                    {p?.firstName} {p?.lastName}
                  </td>
                  <td className="font-mono text-xs">{s.membershipNumber}</td>
                  <td>{s.university}</td>
                  <td>
                    <StatusBadge status={statusLabel(s.status)} />
                  </td>
                  <td>
                    <form action={toggleStudentAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <button className="btn-ghost" type="submit">
                        {s.status === "active" ? "Askıya al" : "Aktifleştir"}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
