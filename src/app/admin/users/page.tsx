import { createBusinessUserAction } from "@/app/actions/admin";
import { demoStore } from "@/lib/demo-store";
import { statusLabel } from "@/lib/format";

export default function UsersPage() {
  const users = demoStore.businessUsers;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-[var(--navy)]">İşletme kullanıcıları</h1>
      <form action={createBusinessUserAction} className="card grid gap-3 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2 font-medium">Yeni kasa hesabı</div>
        <input className="input" name="firstName" placeholder="Ad" required />
        <input className="input" name="lastName" placeholder="Soyad" required />
        <input className="input" name="email" type="email" placeholder="E-posta" required />
        <input className="input" name="password" placeholder="Şifre" defaultValue="demo123" />
        <select className="select" name="businessId" required>
          {demoStore.businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select className="select" name="role" defaultValue="staff">
          <option value="staff">Personel</option>
          <option value="owner">Sahip</option>
        </select>
        <div className="sm:col-span-2">
          <button className="btn-primary" type="submit">
            Oluştur
          </button>
        </div>
      </form>
      <div className="card overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Kullanıcı</th>
              <th>E-posta</th>
              <th>İşletme</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const p = demoStore.findProfile(u.userId);
              const b = demoStore.businesses.find((x) => x.id === u.businessId);
              return (
                <tr key={u.id}>
                  <td>
                    {p?.firstName} {p?.lastName}
                  </td>
                  <td>{p?.email}</td>
                  <td>{b?.name}</td>
                  <td>{statusLabel(u.role)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
