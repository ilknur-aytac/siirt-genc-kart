import { redirect } from "next/navigation";
import { MembershipCard } from "@/components/MembershipCard";
import { requireUser } from "@/lib/auth";
import { demoStore } from "@/lib/demo-store";

export default async function StudentCardPage() {
  const { user, error } = await requireUser(["student"]);
  if (!user || error) redirect("/login");
  const student = demoStore.studentForUser(user.id);
  if (!student) redirect("/student");

  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-center font-display text-3xl text-[var(--navy)]">Kartım</h1>
      <p className="text-center text-sm text-[var(--muted)]">
        QR kodu kasaya gösterin. Kod öğrenci numaranızı içermez; 60 saniyede yenilenir.
      </p>
      <MembershipCard user={user} student={student} />
    </div>
  );
}
