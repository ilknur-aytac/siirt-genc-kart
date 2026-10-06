import Link from "next/link";
import { redirect } from "next/navigation";
import { ApplicationForm } from "@/components/ApplicationForm";
import { MembershipCard } from "@/components/MembershipCard";
import { StatusBadge } from "@/components/StatusBadge";
import { requireUser } from "@/lib/auth";
import { demoStore } from "@/lib/demo-store";
import { formatDate, statusLabel } from "@/lib/format";

export default async function StudentHome() {
  const { user, error } = await requireUser(["student"]);
  if (!user || error) redirect("/login");

  const student = demoStore.studentForUser(user.id);
  const application = demoStore.applicationForUser(user.id);
  const redemptions = student
    ? demoStore.redemptions.filter((r) => r.studentId === student.id)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">Öğrenci paneli</p>
        <h1 className="font-display text-3xl text-[var(--navy)]">Merhaba, {user.firstName}</h1>
      </div>

      {student ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
          <MembershipCard user={user} student={student} />
          <div className="space-y-4">
            <div className="card p-5">
              <h2 className="font-display text-xl">Kart durumu</h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Üyelik no {student.membershipNumber} · {formatDate(student.validUntil)} tarihine
                kadar geçerli.
              </p>
              <div className="mt-4">
                <StatusBadge status={statusLabel(student.status)} />
              </div>
              <Link href="/student/card" className="btn-primary mt-5 inline-flex">
                Kartı aç
              </Link>
            </div>
            <div className="card p-5">
              <h2 className="font-display text-xl">Son kullanımlar</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">{redemptions.length} kayıt</p>
              <Link href="/student/history" className="mt-3 inline-block text-sm font-semibold">
                Geçmişi gör
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-5">
            <h2 className="font-display text-xl">Başvuru durumu</h2>
            {application ? (
              <div className="mt-3 space-y-2 text-sm">
                <StatusBadge status={statusLabel(application.status)} />
                <p>
                  {application.university} · {application.studentNumber}
                </p>
                {application.notes ? <p>Not: {application.notes}</p> : null}
                {application.status === "rejected" ? (
                  <p className="text-[var(--muted)]">Yeni bir başvuru gönderebilirsiniz.</p>
                ) : application.status === "pending" ? (
                  <p className="text-[var(--muted)]">
                    Yönetici onayından sonra dijital kartınız oluşur.
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted)]">
                Kart almak için üniversite bilgilerinizi ve öğrenci belgenizi gönderin.
              </p>
            )}
          </div>
          {!application || application.status === "rejected" ? <ApplicationForm /> : null}
          {application?.status === "pending" ? (
            <div className="card p-5">
              <p className="text-sm text-[var(--muted)]">
                Başvurunuz inceleniyor. Onaylandığında kart sayfanız otomatik açılır.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
