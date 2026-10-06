import { reviewApplicationAction } from "@/app/actions/admin";
import { StatusBadge } from "@/components/StatusBadge";
import { demoStore } from "@/lib/demo-store";
import { formatDateTime, statusLabel } from "@/lib/format";

export default function ApplicationsPage() {
  const rows = [...demoStore.applications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-[var(--navy)]">Öğrenci başvuruları</h1>
      <div className="space-y-3">
        {rows.map((a) => {
          const p = demoStore.findProfile(a.userId);
          return (
            <article key={a.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[var(--navy)]">
                    {p?.firstName} {p?.lastName}
                  </p>
                  <p className="text-sm text-[var(--muted)]">
                    {a.university} · {a.department} · No {a.studentNumber}
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Belge: {a.documentName ?? "—"} · {formatDateTime(a.createdAt)}
                  </p>
                </div>
                <StatusBadge status={statusLabel(a.status)} />
              </div>
              {a.status === "pending" ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={reviewApplicationAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="decision" value="approved" />
                    <button className="btn-primary" type="submit">
                      Onayla
                    </button>
                  </form>
                  <form action={reviewApplicationAction} className="flex gap-2">
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="decision" value="rejected" />
                    <input className="input max-w-[200px]" name="notes" placeholder="Red nedeni" />
                    <button className="btn-danger" type="submit">
                      Reddet
                    </button>
                  </form>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
