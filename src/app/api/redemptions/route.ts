import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/config";
import { requireUser } from "@/lib/auth";
import { demoStore } from "@/lib/demo-store";

export async function POST(request: Request) {
  const { user, error } = await requireUser(["business"]);
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
    const { data, error: rpcError } = await supabase.rpc("apply_discount", {
      p_token: token,
    });
    if (rpcError) {
      return NextResponse.json({ error: "İndirim uygulanamadı." }, { status: 400 });
    }
    return NextResponse.json({ id: data });
  }

  const live = demoStore.findLiveToken(token);
  if (!live) {
    return NextResponse.json({ error: "Kod geçersiz veya süresi dolmuş." }, { status: 404 });
  }

  const student = demoStore.students.find((s) => s.id === live.studentId);
  if (!student || student.status !== "active") {
    return NextResponse.json({ error: "Kart geçersiz." }, { status: 403 });
  }

  const business = demoStore.businessForUser(user.id);
  const businessUser = demoStore.businessUserForUser(user.id);
  if (!business || !business.isActive) {
    return NextResponse.json({ error: "İşletme hesabı bulunamadı." }, { status: 403 });
  }

  const discount = demoStore.activeDiscount(business.id);
  if (!discount) {
    return NextResponse.json({ error: "Aktif indirim tanımı yok." }, { status: 400 });
  }

  live.usedAt = new Date().toISOString();
  const id = randomUUID();
  demoStore.redemptions.unshift({
    id,
    studentId: student.id,
    businessId: business.id,
    businessUserId: businessUser?.id ?? null,
    discountId: discount.id,
    percentage: discount.percentage,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ id, percentage: discount.percentage });
}

export async function GET() {
  const { user, error } = await requireUser(["student", "business", "admin"]);
  if (error || !user) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  if (user.role === "student") {
    const student = demoStore.studentForUser(user.id);
    const rows = demoStore.redemptions.filter((r) => r.studentId === student?.id);
    return NextResponse.json(enrich(rows));
  }
  if (user.role === "business") {
    const business = demoStore.businessForUser(user.id);
    const rows = demoStore.redemptions.filter((r) => r.businessId === business?.id);
    return NextResponse.json(enrich(rows));
  }
  return NextResponse.json(enrich(demoStore.redemptions));
}

function enrich(rows: typeof demoStore.redemptions) {
  return rows.map((r) => {
    const student = demoStore.students.find((s) => s.id === r.studentId);
    const profile = student ? demoStore.findProfile(student.userId) : null;
    const business = demoStore.businesses.find((b) => b.id === r.businessId);
    return {
      ...r,
      studentName: profile ? `${profile.firstName} ${profile.lastName}` : "—",
      membershipNumber: student?.membershipNumber ?? "—",
      businessName: business?.name ?? "—",
    };
  });
}
