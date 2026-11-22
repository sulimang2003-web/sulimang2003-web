import type { Order, Product, ProductFilter } from "../types";
import type { Stats } from "./repository";
import { t } from "../format";

export function applyFilter(products: Product[], f: ProductFilter = {}, categoryIdBySlug?: (s: string) => string | undefined) {
  let list = f.includeInactive ? products : products.filter((p) => p.active);
  if (f.category && categoryIdBySlug) {
    const id = categoryIdBySlug(f.category);
    list = list.filter((p) => p.categoryId === id);
  }
  if (f.tag) list = list.filter((p) => p.tags.includes(f.tag!));
  if (f.size) list = list.filter((p) => p.variants.some((v) => v.size === f.size && v.stock > 0));
  if (f.color) list = list.filter((p) => p.colors.some((c) => c.code === f.color));
  if (f.minMinor != null) list = list.filter((p) => p.priceMinor >= f.minMinor!);
  if (f.maxMinor != null) list = list.filter((p) => p.priceMinor <= f.maxMinor!);
  if (f.q) {
    const q = f.q.toLocaleLowerCase("tr").trim();
    list = list.filter((p) =>
      [p.name.ar, p.name.tr, p.name.en ?? "", p.sku, p.description.ar, p.description.tr]
        .join(" ")
        .toLocaleLowerCase("tr")
        .includes(q),
    );
  }
  const sort = f.sort ?? "newest";
  list = [...list].sort((a, b) =>
    sort === "price-asc"
      ? a.priceMinor - b.priceMinor
      : sort === "price-desc"
        ? b.priceMinor - a.priceMinor
        : b.createdAt.localeCompare(a.createdAt),
  );
  return f.limit ? list.slice(0, f.limit) : list;
}

export function computeStats(orders: Order[], products: Product[]): Stats {
  const counted = orders.filter((o) => o.status !== "cancelled" && o.status !== "returned");
  const revenueMinor = counted.reduce((s, o) => s + o.totalMinor, 0);
  const days: Stats["last30"] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    const dayOrders = counted.filter((o) => o.createdAt.slice(0, 10) === d);
    days.push({ date: d, orders: dayOrders.length, revenueMinor: dayOrders.reduce((s, o) => s + o.totalMinor, 0) });
  }
  const top = new Map<string, { productId: string; name: string; qty: number; revenueMinor: number }>();
  for (const o of counted)
    for (const it of o.items) {
      const e = top.get(it.productId) ?? { productId: it.productId, name: it.name, qty: 0, revenueMinor: 0 };
      e.qty += it.qty;
      e.revenueMinor += it.qty * it.unitMinor;
      top.set(it.productId, e);
    }
  const src = new Map<string, number>();
  for (const o of orders) {
    const k = o.utm?.source || "direct";
    src.set(k, (src.get(k) ?? 0) + 1);
  }
  return {
    ordersTotal: orders.length,
    ordersPending: orders.filter((o) => o.status === "pending").length,
    revenueMinor,
    avgOrderMinor: counted.length ? Math.round(revenueMinor / counted.length) : 0,
    last30: days,
    topProducts: [...top.values()].sort((a, b) => b.qty - a.qty).slice(0, 8),
    lowStock: products
      .flatMap((p) => p.variants.filter((v) => v.stock <= 2).map((v) => ({ productId: p.id, name: t(p.name, "ar"), size: v.size, color: v.color, stock: v.stock })))
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 12),
    bySource: [...src.entries()].map(([source, n]) => ({ source, orders: n })).sort((a, b) => b.orders - a.orders),
  };
}

export const orderNumber = (seq: number) => `YS-${String(seq).padStart(5, "0")}`;

import type { Coupon, NewOrderInput, OrderItem, StoreSettings } from "../types";
import { OrderError } from "./repository";
import { evaluateCoupon, shippingFor } from "../pricing";

/** Pure server-side order builder: never trusts client prices. */
export function buildOrder(
  input: NewOrderInput,
  products: Map<string, Product>,
  coupon: Coupon | null,
  settings: StoreSettings,
) {
  if (!input.items.length) throw new OrderError("empty");
  const items: OrderItem[] = [];
  const decrements: { productId: string; size: string; color: string; qty: number }[] = [];
  for (const line of input.items) {
    const p = products.get(line.productId);
    if (!p || !p.active) throw new OrderError("invalid_item");
    const v = p.variants.find((x) => x.size === line.size && x.color === line.color);
    if (!v) throw new OrderError("invalid_item");
    const already = decrements.filter((d) => d.productId === p.id && d.size === v.size && d.color === v.color).reduce((s, d) => s + d.qty, 0);
    if (v.stock < line.qty + already) throw new OrderError("out_of_stock", `${p.sku} ${v.size}/${v.color}`);
    const colorName = p.colors.find((c) => c.code === v.color)?.name;
    items.push({
      productId: p.id,
      sku: p.sku,
      name: t(p.name, input.locale),
      size: v.size,
      color: colorName ? t(colorName, input.locale) : v.color,
      colorCode: v.color,
      qty: line.qty,
      unitMinor: p.priceMinor,
    });
    decrements.push({ productId: p.id, size: v.size, color: v.color, qty: line.qty });
  }
  const subtotalMinor = items.reduce((s, i) => s + i.qty * i.unitMinor, 0);
  let discountMinor = 0;
  let couponCode: string | null = null;
  if (input.couponCode) {
    const r = evaluateCoupon(coupon, subtotalMinor);
    if (!r.ok) throw new OrderError("invalid_coupon", r.reason);
    discountMinor = r.discountMinor;
    couponCode = coupon!.code;
  }
  const shippingMinor = shippingFor(subtotalMinor - discountMinor, input.address.city, settings.shipping);
  return {
    items,
    decrements,
    subtotalMinor,
    discountMinor,
    shippingMinor,
    totalMinor: subtotalMinor - discountMinor + shippingMinor,
    couponCode,
  };
}
