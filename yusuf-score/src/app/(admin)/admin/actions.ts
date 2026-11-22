"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  clearFailures, rateLimited, recordFailure, requireAdmin, SESSION_COOKIE, sessionCookieOptions, signSession, verifyCredentials,
} from "@/lib/auth";
import { repo } from "@/lib/data";
import { categorySchema, couponSchema, productSchema } from "@/lib/validation";
import { ORDER_STATUSES, type Product, type StoreSettings } from "@/lib/types";

export type ActionState = { ok?: boolean; error?: string } | null;

const refresh = () => revalidatePath("/", "layout");

// ── Auth ────────────────────────────────────────────────
export async function login(_: ActionState, form: FormData): Promise<ActionState> {
  const email = String(form.get("email") ?? "").trim().slice(0, 120);
  const password = String(form.get("password") ?? "").slice(0, 200);
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] ?? "local";
  const key = `${ip}:${email.toLowerCase()}`;
  if (rateLimited(key)) return { error: "محاولات كثيرة. حاول بعد ١٥ دقيقة." };
  const user = await verifyCredentials(email, password);
  if (!user) {
    recordFailure(key);
    return { error: "بيانات الدخول غير صحيحة أو الحساب ليس لديه صلاحية إدارة." };
  }
  clearFailures(key);
  (await cookies()).set(SESSION_COOKIE, signSession(user), sessionCookieOptions);
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ── Products ────────────────────────────────────────────
export async function saveProduct(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  let raw: unknown;
  try { raw = JSON.parse(String(form.get("payload") ?? "")); } catch { return { error: "بيانات غير صالحة" }; }
  const p = productSchema.safeParse(raw);
  if (!p.success) return { error: "تحقق من الحقول: " + p.error.issues.slice(0, 3).map((i) => i.path.join(".")).join("، ") };
  const r = repo();
  const existing = p.data.id ? await r.getProductById(p.data.id) : null;
  let saved: Product;
  try {
    saved = await r.saveProduct({
      ...p.data,
      compareAtMinor: p.data.compareAtMinor ?? null,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Product);
  } catch (e) {
    if (e instanceof Error && /slug|duplicate|unique/i.test(e.message)) return { error: "الرابط (slug) أو الكود مستخدم مسبقاً" };
    throw e;
  }
  refresh();
  if (!existing) redirect(`/admin/products/${saved.id}?saved=1`);
  return { ok: true };
}

export async function deleteProduct(form: FormData) {
  await requireAdmin();
  await repo().deleteProduct(z.string().max(40).parse(form.get("id")));
  refresh();
  redirect("/admin/products");
}

export async function toggleProduct(form: FormData) {
  await requireAdmin();
  const r = repo();
  const p = await r.getProductById(z.string().max(40).parse(form.get("id")));
  if (p) await r.saveProduct({ ...p, active: !p.active });
  refresh();
}

// ── Categories ──────────────────────────────────────────
export async function saveCategory(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const p = categorySchema.safeParse({
    id: form.get("id") || "", slug: form.get("slug"),
    name: { ar: form.get("name_ar"), tr: form.get("name_tr"), en: form.get("name_en") || undefined },
    image: form.get("image") || null, sortOrder: Number(form.get("sortOrder") || 0),
  });
  if (!p.success) return { error: "تحقق من الاسم والرابط (أحرف لاتينية صغيرة وشرطات)" };
  await repo().saveCategory(p.data);
  refresh();
  return { ok: true };
}

export async function deleteCategory(form: FormData) {
  await requireAdmin();
  await repo().deleteCategory(z.string().max(40).parse(form.get("id")));
  refresh();
}

// ── Orders ──────────────────────────────────────────────
export async function updateOrder(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const p = z.object({
    id: z.uuid(),
    status: z.enum(ORDER_STATUSES as [string, ...string[]]),
    paymentStatus: z.enum(["unpaid", "paid", "refunded"]),
    carrier: z.string().max(60).optional(),
    trackingNumber: z.string().max(80).optional(),
  }).safeParse(Object.fromEntries(form));
  if (!p.success) return { error: "قيم غير صالحة" };
  await repo().updateOrder(p.data.id, {
    status: p.data.status as (typeof ORDER_STATUSES)[number],
    paymentStatus: p.data.paymentStatus,
    carrier: p.data.carrier || null,
    trackingNumber: p.data.trackingNumber || null,
  });
  revalidatePath("/admin", "layout");
  return { ok: true };
}

// ── Coupons ─────────────────────────────────────────────
export async function saveCoupon(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const type = form.get("type") === "fixed" ? "fixed" : "percent";
  const value = Number(form.get("value") || 0);
  const p = couponSchema.safeParse({
    id: form.get("id") || "",
    code: form.get("code"),
    type,
    value: type === "fixed" ? Math.round(value * 100) : Math.round(value),
    minSubtotalMinor: Math.round(Number(form.get("min") || 0) * 100),
    maxUses: form.get("maxUses") ? Number(form.get("maxUses")) : null,
    usedCount: Number(form.get("usedCount") || 0),
    startsAt: form.get("startsAt") ? new Date(String(form.get("startsAt"))).toISOString() : null,
    endsAt: form.get("endsAt") ? new Date(String(form.get("endsAt"))).toISOString() : null,
    active: form.get("active") === "on",
  });
  if (!p.success || (type === "percent" && p.data.value > 90)) return { error: "تحقق من الكود (٣–٤٠ حرفاً لاتينياً) والقيمة" };
  try {
    await repo().saveCoupon(p.data);
  } catch {
    return { error: "الكود مستخدم مسبقاً" };
  }
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function deleteCoupon(form: FormData) {
  await requireAdmin();
  await repo().deleteCoupon(z.string().max(40).parse(form.get("id")));
  revalidatePath("/admin/coupons");
}

// ── Settings ────────────────────────────────────────────
export async function saveSettings(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const tl = (k: string) => Math.round(Number(form.get(k) || 0) * 100);
  const p = z.object({
    storeName: z.string().trim().min(1).max(60),
    whatsappNumber: z.string().regex(/^\d{10,15}$/),
    instagramHandle: z.string().regex(/^[A-Za-z0-9._]{1,30}$/),
    addressLine: z.string().trim().max(200),
    email: z.email().max(120),
    vatRate: z.number().min(0).max(100),
  }).safeParse({
    storeName: form.get("storeName"),
    whatsappNumber: String(form.get("whatsappNumber") ?? "").replace(/\D/g, ""),
    instagramHandle: String(form.get("instagramHandle") ?? "").replace(/^@/, ""),
    addressLine: form.get("addressLine"),
    email: form.get("email"),
    vatRate: Number(form.get("vatRate")),
  });
  if (!p.success) return { error: "تحقق من رقم واتساب (أرقام فقط مع رمز الدولة 90) والبريد" };
  const handle = (k: string) => String(form.get(k) ?? "").trim().replace(/^@/, "").replace(/[^\w.]/g, "").slice(0, 40) || undefined;
  const url = (k: string) => {
    const v = String(form.get(k) ?? "").trim().slice(0, 300);
    return /^https:\/\/[^\s"<>]+$/.test(v) ? v : undefined;
  };
  const r = repo();
  const current = await r.getSettings();
  const next: StoreSettings = {
    ...current,
    ...p.data,
    socials: { tiktok: handle("tiktok"), snapchat: handle("snapchat"), facebook: url("facebook"), youtube: url("youtube"), mapsUrl: url("mapsUrl") },
    pricesIncludeVat: true,
    shipping: {
      ...current.shipping,
      istanbulMinor: tl("istanbul"),
      turkeyMinor: tl("turkey"),
      freeOverMinor: form.get("freeOver") ? tl("freeOver") : null,
      carriers: String(form.get("carriers") ?? "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 10),
      estimatedDays: { istanbul: String(form.get("daysIst") ?? "1–2").slice(0, 10), turkey: String(form.get("daysTr") ?? "2–4").slice(0, 10) },
    },
  };
  await r.saveSettings(next);
  refresh();
  return { ok: true };
}
