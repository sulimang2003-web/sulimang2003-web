import { NextResponse, type NextRequest } from "next/server";
import { repo, OrderError } from "@/lib/data";
import { orderSchema } from "@/lib/validation";
import { clientIp, jsonError, limit, sameOrigin } from "@/lib/http";
import type { Utm } from "@/lib/types";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return jsonError("forbidden", 403);
  if (!limit(`order:${clientIp(req)}`, 8, 10 * 60 * 1000)) return jsonError("rate_limited", 429);

  const parsed = orderSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("invalid_input", 400);

  let utm: Utm | undefined;
  try {
    const raw = req.cookies.get("ys_utm")?.value;
    if (raw) {
      const u = JSON.parse(raw);
      utm = Object.fromEntries(Object.entries(u).filter(([k, v]) => ["source", "medium", "campaign", "content"].includes(k) && typeof v === "string").map(([k, v]) => [k, String(v).slice(0, 100)]));
    }
  } catch { /* ignore bad cookie */ }

  const { consent: _c, ...input } = parsed.data; // eslint-disable-line @typescript-eslint/no-unused-vars
  try {
    const order = await repo().createOrder({ ...input, utm });
    // Return only what the customer needs to see.
    return NextResponse.json({
      order: {
        id: order.id, number: order.number, totalMinor: order.totalMinor,
        items: order.items.map((i) => ({ name: i.name, sku: i.sku, size: i.size, color: i.color, qty: i.qty, unitMinor: i.unitMinor })),
        customer: { name: order.customer.name }, address: order.address,
      },
    }, { status: 201 });
  } catch (e) {
    if (e instanceof OrderError) return jsonError(e.code, 409);
    console.error("createOrder failed", e);
    return jsonError("server_error", 500);
  }
}
