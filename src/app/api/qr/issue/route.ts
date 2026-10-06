import { NextResponse } from "next/server";
import { QR_TTL_SECONDS, isSupabaseConfigured } from "@/lib/config";
import { requireUser } from "@/lib/auth";
import { demoStore } from "@/lib/demo-store";

export async function POST() {
  const { user, error } = await requireUser(["student"]);
  if (error || !user) {
    return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  }

  if (isSupabaseConfigured()) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: student } = await supabase
      .from("students")
      .select("id, status, valid_until")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!student || student.status !== "active") {
      return NextResponse.json({ error: "Aktif kart bulunamadı." }, { status: 403 });
    }

    const token = crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
    const expiresAt = new Date(Date.now() + QR_TTL_SECONDS * 1000).toISOString();
    const { error: insertError } = await supabase.from("qr_tokens").insert({
      student_id: student.id,
      token,
      expires_at: expiresAt,
    });
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    return NextResponse.json({ token, expiresAt, ttl: QR_TTL_SECONDS });
  }

  const student = demoStore.studentForUser(user.id);
  if (!student || student.status !== "active") {
    return NextResponse.json({ error: "Aktif kart bulunamadı." }, { status: 403 });
  }

  const row = demoStore.issueQr(student.id, QR_TTL_SECONDS);
  return NextResponse.json({
    token: row.token,
    expiresAt: row.expiresAt,
    ttl: QR_TTL_SECONDS,
  });
}
