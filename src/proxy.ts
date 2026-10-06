import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isSupabaseConfigured } from "@/lib/config";
import { updateSupabaseSession } from "@/lib/supabase/middleware";
import type { AppRole } from "@/lib/types";

const ROLE_PREFIX: Record<string, AppRole> = {
  "/student": "student",
  "/business": "business",
  "/admin": "admin",
};

function requiredRole(pathname: string): AppRole | null {
  for (const [prefix, role] of Object.entries(ROLE_PREFIX)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return role;
  }
  return null;
}

function parseDemoSession(raw: string | undefined): { id: string; role: AppRole } | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { id?: string; role?: AppRole };
    if (!parsed.id || !parsed.role) return null;
    return { id: parsed.id, role: parsed.role };
  } catch {
    return null;
  }
}

function homeForRole(role: AppRole) {
  if (role === "admin") return "/admin";
  if (role === "business") return "/business";
  return "/student";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleNeeded = requiredRole(pathname);

  if (isSupabaseConfigured()) {
    return updateSupabaseSession(request);
  }

  if (!roleNeeded) return NextResponse.next();

  const session = parseDemoSession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (session.role !== roleNeeded) {
    const url = request.nextUrl.clone();
    url.pathname = homeForRole(session.role);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
