import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import type { Category, Coupon, Order, Product, StoreSettings } from "../types";
import type { Repository } from "./repository";
import { applyFilter, buildOrder, computeStats, orderNumber } from "./shared";
import { seedCategories, seedCoupons, seedProducts, seedSettings } from "./seed";

/**
 * DEMO adapter — persists to .data/db.json so the owner can try the full flow
 * locally without any external account. NOT for production (single process,
 * no multi-instance safety; read-only filesystems fall back to memory).
 */
interface DB {
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  settings: StoreSettings;
  seq: number;
}

const FILE = join(process.cwd(), ".data", "db.json");
const g = globalThis as unknown as { __ysdb?: DB; __yslock?: Promise<unknown> };

function fresh(): DB {
  return structuredClone({
    products: seedProducts,
    categories: seedCategories,
    orders: [],
    coupons: seedCoupons,
    settings: seedSettings,
    seq: 10000,
  });
}

async function load(): Promise<DB> {
  if (g.__ysdb) return g.__ysdb;
  try {
    g.__ysdb = JSON.parse(await readFile(FILE, "utf8")) as DB;
  } catch {
    g.__ysdb = fresh();
    await persist(g.__ysdb);
  }
  return g.__ysdb!;
}

async function persist(db: DB) {
  try {
    await mkdir(join(process.cwd(), ".data"), { recursive: true });
    await writeFile(FILE, JSON.stringify(db, null, 2));
  } catch {
    /* read-only FS (e.g. serverless preview): keep in memory only */
  }
}

/** Serialises writes so concurrent requests cannot oversell stock. */
function tx<T>(fn: (db: DB) => T | Promise<T>): Promise<T> {
  const run = (g.__yslock ?? Promise.resolve()).then(async () => {
    const db = await load();
    const r = await fn(db);
    await persist(db);
    return r;
  });
  g.__yslock = run.catch(() => undefined);
  return run;
}

const clone = <T,>(v: T): T => structuredClone(v);
const nowIso = () => new Date().toISOString();

export const demoStore: Repository = {
  mode: "demo",
  async listProducts(f) {
    const db = await load();
    return clone(applyFilter(db.products, f, (s) => db.categories.find((c) => c.slug === s)?.id));
  },
  async getProductBySlug(slug) {
    return clone((await load()).products.find((p) => p.slug === slug) ?? null);
  },
  async getProductById(id) {
    return clone((await load()).products.find((p) => p.id === id) ?? null);
  },
  saveProduct: (p) =>
    tx((db) => {
      const i = db.products.findIndex((x) => x.id === p.id);
      const rec = { ...p, id: p.id || `prd-${randomUUID().slice(0, 8)}`, updatedAt: nowIso(), createdAt: p.createdAt || nowIso() };
      if (db.products.some((x) => x.slug === rec.slug && x.id !== rec.id)) throw new Error("slug_taken");
      if (i >= 0) db.products[i] = rec;
      else db.products.push(rec);
      return clone(rec);
    }),
  deleteProduct: (id) => tx((db) => void (db.products = db.products.filter((p) => p.id !== id))),

  async listCategories() {
    return clone([...(await load()).categories].sort((a, b) => a.sortOrder - b.sortOrder));
  },
  saveCategory: (c) =>
    tx((db) => {
      const rec = { ...c, id: c.id || `cat-${randomUUID().slice(0, 8)}` };
      const i = db.categories.findIndex((x) => x.id === rec.id);
      if (i >= 0) db.categories[i] = rec;
      else db.categories.push(rec);
      return clone(rec);
    }),
  deleteCategory: (id) =>
    tx((db) => {
      db.categories = db.categories.filter((c) => c.id !== id);
      db.products.forEach((p) => p.categoryId === id && (p.categoryId = null));
    }),

  createOrder: (input) =>
    tx((db) => {
      const map = new Map(db.products.map((p) => [p.id, p]));
      const coupon = input.couponCode
        ? db.coupons.find((c) => c.code.toUpperCase() === input.couponCode!.toUpperCase()) ?? null
        : null;
      const b = buildOrder(input, map, coupon, db.settings);
      for (const d of b.decrements) {
        const v = map.get(d.productId)!.variants.find((x) => x.size === d.size && x.color === d.color)!;
        v.stock -= d.qty;
      }
      if (coupon && b.couponCode) coupon.usedCount += 1;
      db.seq += 1;
      const order: Order = {
        id: randomUUID(),
        number: orderNumber(db.seq),
        locale: input.locale,
        channel: input.channel,
        status: "pending",
        paymentStatus: "unpaid",
        customer: input.customer,
        address: input.address,
        items: b.items,
        subtotalMinor: b.subtotalMinor,
        discountMinor: b.discountMinor,
        shippingMinor: b.shippingMinor,
        totalMinor: b.totalMinor,
        couponCode: b.couponCode,
        utm: input.utm,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      db.orders.unshift(order);
      return clone(order);
    }),
  async listOrders(o = {}) {
    let list = (await load()).orders;
    if (o.status) list = list.filter((x) => x.status === o.status);
    if (o.q) {
      const q = o.q.toLowerCase();
      list = list.filter((x) => [x.number, x.customer.name, x.customer.phone].join(" ").toLowerCase().includes(q));
    }
    return clone(o.limit ? list.slice(0, o.limit) : list);
  },
  async getOrder(id) {
    return clone((await load()).orders.find((o) => o.id === id) ?? null);
  },
  updateOrder: (id, patch) =>
    tx((db) => {
      const o = db.orders.find((x) => x.id === id);
      if (!o) throw new Error("not_found");
      const wasActive = o.status !== "cancelled" && o.status !== "returned";
      const willBeInactive = patch.status === "cancelled" || patch.status === "returned";
      if (wasActive && willBeInactive) {
        // restock items
        for (const it of o.items) {
          const p = db.products.find((x) => x.id === it.productId);
          const v = p?.variants.find((x) => x.size === it.size && x.color === it.colorCode);
          if (v) v.stock += it.qty;
        }
      }
      Object.assign(o, Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)), { updatedAt: nowIso() });
      return clone(o);
    }),

  async listCoupons() {
    return clone((await load()).coupons);
  },
  async getCouponByCode(code) {
    return clone((await load()).coupons.find((c) => c.code.toUpperCase() === code.toUpperCase()) ?? null);
  },
  saveCoupon: (c) =>
    tx((db) => {
      const rec = { ...c, code: c.code.toUpperCase(), id: c.id || `cpn-${randomUUID().slice(0, 8)}` };
      if (db.coupons.some((x) => x.code === rec.code && x.id !== rec.id)) throw new Error("code_taken");
      const i = db.coupons.findIndex((x) => x.id === rec.id);
      if (i >= 0) db.coupons[i] = rec;
      else db.coupons.push(rec);
      return clone(rec);
    }),
  deleteCoupon: (id) => tx((db) => void (db.coupons = db.coupons.filter((c) => c.id !== id))),

  async getSettings() {
    return clone((await load()).settings);
  },
  saveSettings: (s) => tx((db) => clone((db.settings = s))),

  async stats() {
    const db = await load();
    return computeStats(db.orders, db.products);
  },
};
