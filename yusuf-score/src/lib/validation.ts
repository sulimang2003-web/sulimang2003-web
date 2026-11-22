import { z } from "zod";

const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s()-]/g, ""))
  .pipe(z.string().regex(/^\+?\d{10,15}$/, "invalid_phone"));

const text = (max: number) => z.string().trim().min(1).max(max);
const opt = (max: number) => z.string().trim().max(max).optional().or(z.literal("").transform(() => undefined));

export const orderSchema = z.object({
  locale: z.enum(["ar", "tr", "en"]),
  channel: z.enum(["whatsapp", "online"]),
  customer: z.object({ name: text(80), phone, email: z.email().max(120).optional().or(z.literal("").transform(() => undefined)) }),
  address: z.object({ city: text(60), district: text(80), line: text(300), postalCode: opt(10), notes: opt(500) }),
  items: z
    .array(z.object({ productId: text(40), size: text(10), color: text(40), qty: z.number().int().min(1).max(20) }))
    .min(1)
    .max(30),
  couponCode: opt(40),
  utm: z
    .object({ source: opt(60), medium: opt(60), campaign: opt(100), content: opt(100) })
    .optional(),
  consent: z.literal(true),
});

const localized = z.object({ ar: z.string().trim().max(2000), tr: z.string().trim().max(2000), en: z.string().trim().max(2000).optional() });

export const productSchema = z.object({
  id: z.string().max(40).optional().default(""),
  slug: z.string().regex(/^[a-z0-9-]{1,120}$/, "slug"),
  sku: text(40),
  name: z.object({ ar: text(160), tr: text(160), en: z.string().max(160).optional() }),
  description: localized,
  material: localized.optional(),
  categoryId: z.string().max(40).nullable(),
  priceMinor: z.number().int().min(0).max(100_000_000),
  compareAtMinor: z.number().int().min(0).max(100_000_000).nullable().optional(),
  images: z.array(z.string().max(500).regex(/^(\/|https:\/\/)/)).max(12),
  colors: z
    .array(z.object({ code: z.string().regex(/^[a-z0-9-]{1,40}$/), hex: z.string().regex(/^#[0-9a-fA-F]{6}$/), name: z.object({ ar: text(40), tr: text(40), en: z.string().max(40).optional() }) }))
    .max(20),
  sizes: z.array(text(10)).max(20),
  variants: z.array(z.object({ size: text(10), color: text(40), stock: z.number().int().min(0).max(100000) })).max(400),
  tags: z.array(z.enum(["new", "bestseller", "featured"])).max(3),
  active: z.boolean(),
});

export const couponSchema = z.object({
  id: z.string().max(40).optional().default(""),
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,40}$/),
  type: z.enum(["percent", "fixed"]),
  value: z.number().int().min(1),
  minSubtotalMinor: z.number().int().min(0),
  maxUses: z.number().int().min(1).nullable(),
  usedCount: z.number().int().min(0).default(0),
  startsAt: z.string().nullable(),
  endsAt: z.string().nullable(),
  active: z.boolean(),
});

export const categorySchema = z.object({
  id: z.string().max(40).optional().default(""),
  slug: z.string().regex(/^[a-z0-9-]{1,80}$/),
  name: z.object({ ar: text(80), tr: text(80), en: z.string().max(80).optional() }),
  image: z.string().max(500).nullable().optional(),
  sortOrder: z.number().int().min(0).max(1000),
});
