import { cookies } from "next/headers";
import { SESSION_COOKIE, isSupabaseConfigured } from "@/lib/config";
import { demoStore } from "@/lib/demo-store";
import type { AppRole, SessionUser } from "@/lib/types";

export function encodeDemoSession(id: string, role: AppRole) {
  return JSON.stringify({ id, role });
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role, first_name, last_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) return null;

    return {
      id: profile.id,
      email: user.email ?? "",
      role: profile.role as AppRole,
      firstName: profile.first_name,
      lastName: profile.last_name,
      avatarUrl: profile.avatar_url,
    };
  }

  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { id?: string };
    if (!parsed.id) return null;
    return demoStore.sessionFromId(parsed.id);
  } catch {
    return null;
  }
}

export async function requireUser(roles?: AppRole[]) {
  const user = await getSessionUser();
  if (!user) {
    return { user: null as SessionUser | null, error: "unauthenticated" as const };
  }
  if (roles && !roles.includes(user.role)) {
    return { user, error: "forbidden" as const };
  }
  return { user, error: null };
}

export function homeForRole(role: AppRole) {
  if (role === "admin") return "/admin";
  if (role === "business") return "/business";
  return "/student";
}
