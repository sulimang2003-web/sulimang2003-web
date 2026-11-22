import "server-only";
import { timingSafeEqual, createHash } from "node:crypto";
import { MAX_AGE } from "./session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./data";

/**
 * Admin authentication.
 *  • Supabase mode: credentials verified by Supabase Auth, then the user must exist in public.admins.
 *  • Demo mode: ADMIN_EMAIL / ADMIN_PASSWORD from env.
 * Either way the server issues its own short-lived, HMAC-signed, httpOnly cookie.
 * Every admin page, server action and admin API calls requireAdmin() — the proxy check is only a UX shortcut.
 */
import { SESSION_COOKIE, verifySession } from "./session";
export { SESSION_COOKIE, signSession, verifySession, MAX_AGE } from "./session";

export async function getAdmin() {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function requireAdmin() {
  const a = await getAdmin();
  if (!a) redirect("/admin/login");
  return a;
}

// ── Brute-force protection (per-instance; use Redis/Upstash for multi-instance) ──
const attempts = new Map<string, { n: number; until: number }>();
export function rateLimited(key: string) {
  const a = attempts.get(key);
  return !!a && a.n >= 5 && a.until > Date.now();
}
export function recordFailure(key: string) {
  const a = attempts.get(key);
  const fresh = !a || a.until < Date.now();
  attempts.set(key, { n: fresh ? 1 : a!.n + 1, until: Date.now() + 15 * 60 * 1000 });
}
export const clearFailures = (key: string) => attempts.delete(key);

const sha = (s: string) => createHash("sha256").update(s).digest();
const safeEq = (a: string, b: string) => timingSafeEqual(sha(a), sha(b));

export async function verifyCredentials(email: string, password: string): Promise<{ sub: string; email: string } | null> {
  if (isSupabaseConfigured()) {
    const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false },
    });
    const { data, error } = await anon.auth.signInWithPassword({ email, password });
    if (error || !data.user) return null;
    const svc = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
    const { data: admin } = await svc.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
    return admin ? { sub: data.user.id, email: data.user.email ?? email } : null;
  }
  const e = process.env.ADMIN_EMAIL, p = process.env.ADMIN_PASSWORD;
  if (!e || !p) return null;
  const ok = safeEq(email.toLowerCase(), e.toLowerCase()) && safeEq(password, p);
  return ok ? { sub: "demo-owner", email: e } : null;
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};
