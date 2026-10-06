import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";
import { requireUser } from "@/lib/auth";
import { demoStore } from "@/lib/demo-store";

export default async function BusinessProfilePage() {
  const { user, error } = await requireUser(["business"]);
  if (!user || error) redirect("/login");
  const profile = demoStore.findProfile(user.id);
  const business = demoStore.businessForUser(user.id);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-[var(--navy)]">Profil</h1>
      <p className="text-sm text-[var(--muted)]">{business?.name}</p>
      <ProfileForm
        firstName={user.firstName}
        lastName={user.lastName}
        email={user.email}
        phone={profile?.phone}
      />
    </div>
  );
}
