import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { repo } from "@/lib/data";
import { evaluateCoupon } from "@/lib/pricing";
import { clientIp, jsonError, limit, sameOrigin } from "@/lib/http";

const schema = z.object({ code: z.string().trim().min(2).max(40), subtotalMinor: z.number().int().min(0).max(1e9) });

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return jsonError("forbidden", 403);
  if (!limit(`coupon:${clientIp(req)}`, 15, 10 * 60 * 1000)) return jsonError("rate_limited", 429);
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ ok: false });
  const r = evaluateCoupon(await repo().getCouponByCode(p.data.code), p.data.subtotalMinor);
  // Final discount is always recomputed server-side when the order is placed.
  return NextResponse.json(r.ok ? { ok: true, discountMinor: r.discountMinor } : { ok: false, reason: r.reason });
}
