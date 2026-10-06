import { createDiscountAction, toggleDiscountAction } from "@/app/actions/admin";
import { StatusBadge } from "@/components/StatusBadge";
import { demoStore } from "@/lib/demo-store";

export default function DiscountsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-[var(--navy)]">İndirim yönetimi</h1>
      <form action={createDiscountAction} className="card grid gap-3 p-5 sm:grid-cols-3">
        <select className="select" name="businessId" required>
          {demoStore.businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <input className="input" name="percentage" type="number" min={1} max={100} placeholder="%" required />
        <input className="input" name="description" placeholder="Açıklama" />
        <div className="sm:col-span-3">
          <button className="btn-primary" type="submit">
            İndirim ekle
          </button>
        </div>
      </form>
      <div className="card overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>İşletme</th>
              <th>Oran</th>
              <th>Açıklama</th>
              <th>Durum</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {demoStore.discounts.map((d) => {
              const b = demoStore.businesses.find((x) => x.id === d.businessId);
              return (
                <tr key={d.id}>
                  <td>{b?.name}</td>
                  <td>%{d.percentage}</td>
                  <td>{d.description}</td>
                  <td>
                    <StatusBadge status={d.isActive ? "Aktif" : "Pasif"} />
                  </td>
                  <td>
                    <form action={toggleDiscountAction}>
                      <input type="hidden" name="id" value={d.id} />
                      <button className="btn-ghost" type="submit">
                        {d.isActive ? "Durdur" : "Aç"}
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
