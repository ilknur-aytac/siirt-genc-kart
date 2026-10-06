"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { demoStore } from "@/lib/demo-store";
import { isSupabaseConfigured } from "@/lib/config";

export async function submitApplicationAction(formData: FormData) {
  const { user, error } = await requireUser(["student"]);
  if (error || !user) return { ok: false, message: "Oturum gerekli." };

  const university = String(formData.get("university") ?? "").trim();
  const studentNumber = String(formData.get("studentNumber") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const document = formData.get("document");
  const documentName =
    document instanceof File && document.size > 0 ? document.name : "ogrenci-belgesi.pdf";

  if (!university || !studentNumber || !department) {
    return { ok: false, message: "Lütfen tüm alanları doldurun." };
  }

  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { error: insertError } = await supabase.from("student_applications").insert({
      user_id: user.id,
      university,
      student_number: studentNumber,
      department,
      document_path: `${user.id}/${documentName}`,
      status: "pending",
    });
    if (insertError) return { ok: false, message: insertError.message };
  } else {
    demoStore.upsertApplication(user.id, {
      university,
      studentNumber,
      department,
      documentName,
    });
  }

  revalidatePath("/student");
  return { ok: true, message: "Başvurunuz alındı." };
}

export async function updateProfileAction(formData: FormData) {
  const { user, error } = await requireUser();
  if (error || !user) return { ok: false, message: "Oturum gerekli." };

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;

  if (!firstName || !lastName) {
    return { ok: false, message: "Ad ve soyad zorunludur." };
  }

  if (!isSupabaseConfigured()) {
    demoStore.updateProfile(user.id, { firstName, lastName, phone });
  } else {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    await supabase
      .from("profiles")
      .update({ first_name: firstName, last_name: lastName, phone })
      .eq("id", user.id);
  }

  revalidatePath("/student/profile");
  revalidatePath("/business/profile");
  return { ok: true, message: "Profil güncellendi." };
}

export async function reviewApplicationAction(formData: FormData): Promise<void> {
  const { user, error } = await requireUser(["admin"]);
  if (error || !user) return;

  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "") as "approved" | "rejected";
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!isSupabaseConfigured()) {
    demoStore.reviewApplication(id, decision, user.id, notes);
  }

  revalidatePath("/admin/applications");
  revalidatePath("/admin/students");
  revalidatePath("/admin");
}

export async function toggleStudentAction(formData: FormData): Promise<void> {
  const { error } = await requireUser(["admin"]);
  if (error) return;
  const id = String(formData.get("id") ?? "");
  if (!isSupabaseConfigured()) demoStore.toggleStudent(id);
  revalidatePath("/admin/students");
}

export async function createBusinessAction(formData: FormData): Promise<void> {
  const { error } = await requireUser(["admin"]);
  if (error) return;
  const name = String(formData.get("name") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "Ankara").trim();
  if (!name) return;
  if (!isSupabaseConfigured()) {
    demoStore.addBusiness({ name, category, address, city });
  }
  revalidatePath("/admin/businesses");
}

export async function toggleBusinessAction(formData: FormData): Promise<void> {
  const { error } = await requireUser(["admin"]);
  if (error) return;
  if (!isSupabaseConfigured()) demoStore.toggleBusiness(String(formData.get("id") ?? ""));
  revalidatePath("/admin/businesses");
}

export async function createBusinessUserAction(formData: FormData): Promise<void> {
  const { error } = await requireUser(["admin"]);
  if (error) return;
  try {
    if (!isSupabaseConfigured()) {
      demoStore.addBusinessUser({
        email: String(formData.get("email") ?? "").trim(),
        password: String(formData.get("password") ?? "demo123"),
        firstName: String(formData.get("firstName") ?? "").trim(),
        lastName: String(formData.get("lastName") ?? "").trim(),
        businessId: String(formData.get("businessId") ?? ""),
        role: String(formData.get("role") ?? "staff") as "owner" | "staff",
      });
    }
  } catch {
    return;
  }
  revalidatePath("/admin/users");
}

export async function createDiscountAction(formData: FormData): Promise<void> {
  const { error } = await requireUser(["admin"]);
  if (error) return;
  if (!isSupabaseConfigured()) {
    demoStore.addDiscount({
      businessId: String(formData.get("businessId") ?? ""),
      percentage: Number(formData.get("percentage") ?? 0),
      description: String(formData.get("description") ?? ""),
    });
  }
  revalidatePath("/admin/discounts");
}

export async function toggleDiscountAction(formData: FormData): Promise<void> {
  const { error } = await requireUser(["admin"]);
  if (error) return;
  if (!isSupabaseConfigured()) demoStore.toggleDiscount(String(formData.get("id") ?? ""));
  revalidatePath("/admin/discounts");
}
