import { createBusinessAction, toggleBusinessAction } from "@/app/actions/admin";
import { StatusBadge } from "@/components/StatusBadge";
import { demoStore } from "@/lib/demo-store";

export default function BusinessesPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-[var(--navy)]">İşletmeler</h1>
      <form action={createBusinessAction} className="card grid gap-3 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2 font-medium">Yeni işletme</div>
        <input className="input" name="name" placeholder="Ad" required />
        <input className="input" name="category" placeholder="Kategori" defaultValue="genel" />
        <input className="input" name="address" placeholder="Adres" />
        <input className="input" name="city" placeholder="Şehir" defaultValue="Ankara" />
        <div className="sm:col-span-2">
          <button className="btn-primary" type="submit">
            Ekle
          </button>
        </div>
      </form>
      <div className="card overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Ad</th>
              <th>Kategori</th>
              <th>Adres</th>
              <th>Durum</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {demoStore.businesses.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.category}</td>
                <td>
                  {b.address} · {b.city}
                </td>
                <td>
                  <StatusBadge status={b.isActive ? "Aktif" : "Pasif"} />
                </td>
                <td>
                  <form action={toggleBusinessAction}>
                    <input type="hidden" name="id" value={b.id} />
                    <button className="btn-ghost" type="submit">
                      {b.isActive ? "Pasifleştir" : "Aktifleştir"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
