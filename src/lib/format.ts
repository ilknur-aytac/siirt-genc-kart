export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return new Date(`${iso}T00:00:00`).toLocaleDateString("tr-TR");
  }
  return d.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function statusLabel(status: string) {
  const map: Record<string, string> = {
    draft: "Taslak",
    pending: "İncelemede",
    approved: "Onaylandı",
    rejected: "Reddedildi",
    active: "Aktif",
    expired: "Süresi doldu",
    suspended: "Askıda",
    student: "Öğrenci",
    business: "İşletme",
    admin: "Yönetici",
    owner: "Sahip",
    staff: "Personel",
    kafe: "Kafe",
    restoran: "Restoran",
    kitabevi: "Kitabevi",
    genel: "Genel",
  };
  return map[status] ?? status;
}
