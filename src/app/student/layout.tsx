import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const { user, error } = await requireUser(["student"]);
  if (error === "unauthenticated" || !user) redirect("/login");
  if (error === "forbidden") redirect("/");
  return <AppShell user={user}>{children}</AppShell>;
}
