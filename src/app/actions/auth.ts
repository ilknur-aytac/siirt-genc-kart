"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, isSupabaseConfigured } from "@/lib/config";
import { demoStore } from "@/lib/demo-store";
import { encodeDemoSession, homeForRole } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      redirect(`/login?error=${encodeURIComponent("E-posta veya şifre hatalı.")}`);
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user!.id)
      .maybeSingle();
    redirect(next || homeForRole(profile?.role ?? "student"));
  }

  const account = demoStore.findAccountByEmail(email);
  if (!account || account.password !== password) {
    redirect(`/login?error=${encodeURIComponent("E-posta veya şifre hatalı.")}`);
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, encodeDemoSession(account.profile.id, account.profile.role), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect(next || homeForRole(account.profile.role));
}

export async function registerAction(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!firstName || !lastName || !email || password.length < 6) {
    redirect(
      `/register?error=${encodeURIComponent("Lütfen tüm alanları doldurun (şifre en az 6 karakter).")}`,
    );
  }

  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, role: "student" },
      },
    });
    if (error) {
      redirect(`/register?error=${encodeURIComponent(error.message)}`);
    }
    redirect("/student");
  }

  try {
    const profile = demoStore.registerStudent({ email, password, firstName, lastName });
    const jar = await cookies();
    jar.set(SESSION_COOKIE, encodeDemoSession(profile.id, profile.role), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kayıt başarısız.";
    redirect(`/register?error=${encodeURIComponent(message)}`);
  }

  redirect("/student");
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}

export async function demoLoginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const data = new FormData();
  data.set("email", email);
  data.set("password", password);
  await loginAction(data);
}
