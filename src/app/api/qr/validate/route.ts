import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";
import { requireUser } from "@/lib/auth";
import { demoStore } from "@/lib/demo-store";
import type { QrPreview } from "@/lib/types";

export async function POST(request: Request) {
  const { user, error } = await requireUser(["business", "admin"]);
  if (error || !user) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  const body = (await request.json()) as { token?: string };
  const token = body.token?.trim();
  if (!token) {
    return NextResponse.json({ error: "Kod gerekli." }, { status: 400 });
  }

  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data, error: rpcError } = await supabase.rpc("validate_qr_token", {
      p_token: token,
    });
    if (rpcError) {
      return NextResponse.json({ error: "Kod doğrulanamadı." }, { status: 400 });
    }
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      return NextResponse.json({ error: "Kod geçersiz veya süresi dolmuş." }, { status: 404 });
    }
    const preview: QrPreview = {
      tokenId: row.token_id,
      firstName: row.first_name,
      lastName: row.last_name,
      university: row.university,
      avatarUrl: row.avatar_url,
      membershipValid: row.membership_valid,
      validUntil: row.valid_until,
      discountPercentage: row.discount_percentage,
      discountId: row.discount_id,
    };
    return NextResponse.json(preview);
  }

  const live = demoStore.findLiveToken(token);
  if (!live) {
    return NextResponse.json({ error: "Kod geçersiz veya süresi dolmuş." }, { status: 404 });
  }

  const student = demoStore.students.find((s) => s.id === live.studentId);
  const profile = student ? demoStore.findProfile(student.userId) : null;
  if (!student || !profile) {
    return NextResponse.json({ error: "Öğrenci bulunamadı." }, { status: 404 });
  }

  const business =
    user.role === "business" ? demoStore.businessForUser(user.id) : demoStore.businesses[0];
  const discount = business ? demoStore.activeDiscount(business.id) : null;
  const membershipValid =
    student.status === "active" && new Date(student.validUntil).getTime() >= Date.now();

  const preview: QrPreview = {
    tokenId: live.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    university: student.university,
    avatarUrl: profile.avatarUrl,
    membershipValid,
    validUntil: student.validUntil,
    discountPercentage: discount?.percentage ?? null,
    discountId: discount?.id ?? null,
  };

  return NextResponse.json(preview);
}
