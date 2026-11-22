import "server-only";
import { NextResponse, type NextRequest } from "next/server";

/** Reject cross-site POSTs (basic CSRF defence for JSON endpoints). */
export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin fetches from older browsers / server-side calls
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

const buckets = new Map<string, { n: number; reset: number }>();
/** Tiny fixed-window limiter (per instance). Swap for Upstash/Redis in multi-instance deployments. */
export function limit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  b.n += 1;
  return b.n <= max;
}

export const clientIp = (req: NextRequest) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

export const jsonError = (error: string, status: number) => NextResponse.json({ error }, { status });
