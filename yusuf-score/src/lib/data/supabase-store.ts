import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Category, Coupon, Order, Product, StoreSettings } from "../types";
import { OrderError, type Repository } from "./repository";
import { applyFilter, buildOrder, computeStats } from "./shared";
import { seedSettings } from "./seed";

/**
 * SUPABASE adapter — server-side only, uses the service-role key.
 * Callers MUST have already authorised the request (requireAdmin) for writes.
 */
let client: SupabaseClient | null = null;
function db() {
  if (!client) {
    client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

function must<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

const toProduct = (r: Row): Product => ({
  id: r.id, slug: r.slug, sku: r.sku, name: r.name, description: r.description, material: r.material ?? undefined,
  categoryId: r.category_id, priceMinor: r.price_minor, compareAtMinor: r.compare_at_minor, images: r.images ?? [],
  colors: r.colors ?? [], sizes: r.sizes ?? [], tags: r.tags ?? [], active: r.active,
  variants: (r.product_variants ?? []).map((v: Row) => ({ size: v.size, color: v.color, stock: v.stock })),
  createdAt: r.created_at, updatedAt: r.updated_at,
});
const toCategory = (r: Row): Category => ({ id: r.id, slug: r.slug, name: r.name, image: r.image, sortOrder: r.sort_order });
const toCoupon = (r: Row): Coupon => ({
  id: r.id, code: r.code, type: r.type, value: r.value, minSubtotalMinor: r.min_subtotal_minor, maxUses: r.max_uses,
  usedCount: r.used_count, startsAt: r.starts_at, endsAt: r.ends_at, active: r.active,
});
const toOrder = (r: Row): Order => ({
  id: r.id, number: r.number, locale: r.locale, channel: r.channel, status: r.status, paymentStatus: r.payment_status,
  customer: r.customer, address: r.address, subtotalMinor: r.subtotal_minor, discountMinor: r.discount_minor,
  shippingMinor: r.shipping_minor, totalMinor: r.total_minor, couponCode: r.coupon_code, carrier: r.carrier,
  trackingNumber: r.tracking_number, utm: r.utm ?? undefined, createdAt: r.created_at, updatedAt: r.updated_at,
  items: (r.order_items ?? []).map((i: Row) => ({
    productId: i.product_id, sku: i.sku, name: i.name, size: i.size, color: i.color, colorCode: i.color_code, qty: i.qty, unitMinor: i.unit_minor,
  })),
});

const PRODUCT_SELECT = "*, product_variants(size,color,stock)";

async function allProducts(includeInactive: boolean) {
  let q = db().from("products").select(PRODUCT_SELECT);
  if (!includeInactive) q = q.eq("active", true);
  return must(await q).map(toProduct);
}

export const supabaseStore: Repository = {
  mode: "supabase",
  // Catalogue is small (hundreds of SKUs) so filtering in memory keeps one code path.
  // Move filters to SQL / full-text search when the catalogue grows.
  async listProducts(f = {}) {
    const [products, cats] = await Promise.all([allProducts(!!f.includeInactive), this.listCategories()]);
    return applyFilter(products, f, (s) => cats.find((c) => c.slug === s)?.id);
  },
  async getProductBySlug(slug) {
    const r = must(await db().from("products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle());
    return r ? toProduct(r) : null;
  },
  async getProductById(id) {
    const r = must(await db().from("products").select(PRODUCT_SELECT).eq("id", id).maybeSingle());
    return r ? toProduct(r) : null;
  },
  async saveProduct(p) {
    const row = {
      ...(p.id ? { id: p.id } : {}),
      slug: p.slug, sku: p.sku, name: p.name, description: p.description, material: p.material ?? null,
      category_id: p.categoryId, price_minor: p.priceMinor, compare_at_minor: p.compareAtMinor ?? null,
      images: p.images, colors: p.colors, sizes: p.sizes, tags: p.tags, active: p.active,
    };
    const saved = must(await db().from("products").upsert(row).select().single()) as Row;
    must(await db().from("product_variants").delete().eq("product_id", saved.id));
    if (p.variants.length)
      must(await db().from("product_variants").insert(p.variants.map((v) => ({ product_id: saved.id, ...v }))));
    return (await this.getProductById(saved.id))!;
  },
  async deleteProduct(id) {
    must(await db().from("products").delete().eq("id", id));
  },

  async listCategories() {
    return must(await db().from("categories").select("*").order("sort_order")).map(toCategory);
  },
  async saveCategory(c) {
    const row = { ...(c.id ? { id: c.id } : {}), slug: c.slug, name: c.name, image: c.image ?? null, sort_order: c.sortOrder };
    return toCategory(must(await db().from("categories").upsert(row).select().single()));
  },
  async deleteCategory(id) {
    must(await db().from("categories").delete().eq("id", id));
  },

  async createOrder(input) {
    const ids = [...new Set(input.items.map((i) => i.productId))];
    const [rows, settings, coupon] = await Promise.all([
      db().from("products").select(PRODUCT_SELECT).in("id", ids),
      this.getSettings(),
      input.couponCode ? this.getCouponByCode(input.couponCode) : Promise.resolve(null),
    ]);
    const map = new Map(must(rows).map((r: Row) => [r.id as string, toProduct(r)]));
    const b = buildOrder(input, map, coupon, settings);
    const { data, error } = await db().rpc("place_order", {
      p_order: { ...input, ...b, items: undefined },
      p_items: b.items,
      p_coupon: b.couponCode,
    });
    if (error) {
      if (error.message.includes("out_of_stock")) throw new OrderError("out_of_stock");
      if (error.message.includes("invalid_coupon")) throw new OrderError("invalid_coupon");
      throw new Error(error.message);
    }
    return (await this.getOrder((data as Row).id))!;
  },
  async listOrders(o = {}) {
    let q = db().from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
    if (o.status) q = q.eq("status", o.status);
    if (o.q) {
      const safe = o.q.replace(/[%,()]/g, "");
      q = q.or(`number.ilike.%${safe}%,customer->>name.ilike.%${safe}%,customer->>phone.ilike.%${safe}%`);
    }
    if (o.limit) q = q.limit(o.limit);
    return must(await q).map(toOrder);
  },
  async getOrder(id) {
    const r = must(await db().from("orders").select("*, order_items(*)").eq("id", id).maybeSingle());
    return r ? toOrder(r) : null;
  },
  async updateOrder(id, patch) {
    const before = await this.getOrder(id);
    if (!before) throw new Error("not_found");
    const wasActive = before.status !== "cancelled" && before.status !== "returned";
    if (wasActive && (patch.status === "cancelled" || patch.status === "returned"))
      must(await db().rpc("restock_order", { p_order: id }));
    const row: Row = {};
    if (patch.status) row.status = patch.status;
    if (patch.paymentStatus) row.payment_status = patch.paymentStatus;
    if (patch.carrier !== undefined) row.carrier = patch.carrier;
    if (patch.trackingNumber !== undefined) row.tracking_number = patch.trackingNumber;
    must(await db().from("orders").update(row).eq("id", id));
    return (await this.getOrder(id))!;
  },

  async listCoupons() {
    return must(await db().from("coupons").select("*").order("code")).map(toCoupon);
  },
  async getCouponByCode(code) {
    const r = must(await db().from("coupons").select("*").eq("code", code.toUpperCase()).maybeSingle());
    return r ? toCoupon(r) : null;
  },
  async saveCoupon(c) {
    const row = {
      ...(c.id ? { id: c.id } : {}), code: c.code.toUpperCase(), type: c.type, value: c.value,
      min_subtotal_minor: c.minSubtotalMinor, max_uses: c.maxUses, used_count: c.usedCount,
      starts_at: c.startsAt, ends_at: c.endsAt, active: c.active,
    };
    return toCoupon(must(await db().from("coupons").upsert(row).select().single()));
  },
  async deleteCoupon(id) {
    must(await db().from("coupons").delete().eq("id", id));
  },

  async getSettings() {
    const r = must(await db().from("settings").select("data").eq("id", 1).maybeSingle()) as Row | null;
    return { ...seedSettings, ...(r?.data ?? {}) } as StoreSettings;
  },
  async saveSettings(s) {
    must(await db().from("settings").upsert({ id: 1, data: s }));
    return s;
  },

  async stats() {
    const since = new Date(Date.now() - 365 * 86400000).toISOString();
    const [orders, products] = await Promise.all([
      db().from("orders").select("*, order_items(*)").gte("created_at", since),
      allProducts(true),
    ]);
    return computeStats(must(orders).map(toOrder), products);
  },
};
