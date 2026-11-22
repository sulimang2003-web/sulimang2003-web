import type { Coupon, StoreSettings } from "./types";

export function isIstanbul(city: string) {
  const c = city.trim().toLocaleLowerCase("tr");
  return c === "istanbul" || c === "i̇stanbul" || c === "إسطنبول" || c === "اسطنبول";
}

export function shippingFor(subtotalMinor: number, city: string, s: StoreSettings["shipping"]) {
  if (s.freeOverMinor != null && subtotalMinor >= s.freeOverMinor) return 0;
  return isIstanbul(city) ? s.istanbulMinor : s.turkeyMinor;
}

export type CouponCheck = { ok: true; discountMinor: number } | { ok: false; reason: string };

export function evaluateCoupon(c: Coupon | null, subtotalMinor: number, at = new Date()): CouponCheck {
  if (!c || !c.active) return { ok: false, reason: "invalid" };
  if (c.startsAt && new Date(c.startsAt) > at) return { ok: false, reason: "not_started" };
  if (c.endsAt && new Date(c.endsAt) < at) return { ok: false, reason: "expired" };
  if (c.maxUses != null && c.usedCount >= c.maxUses) return { ok: false, reason: "exhausted" };
  if (subtotalMinor < c.minSubtotalMinor) return { ok: false, reason: "min_subtotal" };
  const raw = c.type === "percent" ? Math.round((subtotalMinor * Math.min(100, c.value)) / 100) : c.value;
  return { ok: true, discountMinor: Math.min(raw, subtotalMinor) };
}
