export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "approved" || status === "active" || status === "Aktif"
      ? "badge-ok"
      : status === "pending" || status === "İncelemede"
        ? "badge-wait"
        : status === "rejected" || status === "suspended" || status === "expired"
          ? "badge-bad"
          : "badge-wait";
  return <span className={`badge ${tone}`}>{status}</span>;
}
