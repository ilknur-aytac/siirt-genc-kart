import { LiveQr } from "@/components/LiveQr";
import type { SessionUser, StudentRecord } from "@/lib/types";

export function MembershipCard({
  user,
  student,
}: {
  user: SessionUser;
  student: StudentRecord;
}) {
  return (
    <div className="membership-card relative mx-auto w-full max-w-sm overflow-hidden rounded-[32px] p-5 text-[#f6e7c8] shadow-[0_30px_60px_rgba(12,35,64,0.35)]">
      <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-[#c9a227]/25 blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a227]">Siirt Genç Kart</p>
          <p className="mt-1 font-display text-lg">Ankara Öğrenci Kartı</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full border border-[#c9a227]/50 text-xs">
          SG
        </div>
      </div>
      <div className="relative mt-8">
        <p className="font-display text-2xl leading-tight">
          {user.firstName} {user.lastName}
        </p>
        <p className="mt-2 text-xs text-[#f6e7c8]/75">{student.university}</p>
        {student.department ? (
          <p className="text-xs text-[#f6e7c8]/55">{student.department}</p>
        ) : null}
        <p className="mt-4 font-mono text-sm tracking-[0.2em]">{student.membershipNumber}</p>
      </div>
      <div className="relative mt-5">
        <LiveQr membershipNumber={student.membershipNumber} />
      </div>
      <div className="relative mt-2 flex justify-between text-[10px] uppercase tracking-[0.16em] text-[#f6e7c8]/70">
        <span>Bitiş {student.validUntil}</span>
        <span>{student.status === "active" ? "Aktif üye" : "Pasif"}</span>
      </div>
    </div>
  );
}
