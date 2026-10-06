export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export const QR_TTL_SECONDS = 60;
export const SESSION_COOKIE = "sgk_demo_session";
