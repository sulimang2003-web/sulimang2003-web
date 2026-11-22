// Core domain types — shared by the storefront, admin, API and (later) native apps.
// Money is always stored as integer minor units (kuruş) to avoid float rounding.

import type { Locale } from "@/i18n/config";

export type Localized = { ar: string; tr: string; en?: string };

export type ProductTag = "new" | "bestseller" | "featured";

export interface ProductColor {
  code: string; // stable id, e.g. "black"
  hex: string;
  name: Localized;
}

export interface ProductVariant {
  size: string;
  color: string; // ProductColor.code
  stock: number;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: Localized;
  description: Localized;
  material?: Localized;
  categoryId: string | null;
  priceMinor: number;
  compareAtMinor?: number | null; // original price when discounted
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  variants: ProductVariant[];
  tags: ProductTag[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: Localized;
  image?: string | null;
  sortOrder: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type OrderChannel = "whatsapp" | "online";

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  size: string;
  color: string; // localized display name at time of order
  colorCode: string;
  qty: number;
  unitMinor: number;
}

export interface Utm {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
}

export interface Order {
  id: string;
  number: string;
  locale: Locale;
  channel: OrderChannel;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customer: { name: string; phone: string; email?: string };
  address: { city: string; district: string; line: string; postalCode?: string; notes?: string };
  items: OrderItem[];
  subtotalMinor: number;
  discountMinor: number;
  shippingMinor: number;
  totalMinor: number;
  couponCode?: string | null;
  carrier?: string | null;
  trackingNumber?: string | null;
  utm?: Utm;
  createdAt: string;
  updatedAt: string;
}

export type CouponType = "percent" | "fixed";

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number; // percent (1-100) or fixed minor units
  minSubtotalMinor: number;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  endsAt: string | null;
  active: boolean;
}

export interface ShippingSettings {
  istanbulMinor: number;
  turkeyMinor: number;
  freeOverMinor: number | null;
  carriers: string[];
  estimatedDays: { istanbul: string; turkey: string };
}

export interface StoreSettings {
  storeName: string;
  whatsappNumber: string; // E.164 without "+", e.g. 905xxxxxxxxx
  instagramHandle: string;
  addressLine: string;
  email: string;
  pricesIncludeVat: boolean;
  vatRate: number; // percent, configurable — confirm with accountant
  shipping: ShippingSettings;
  paymentProvider: "none" | "iyzico" | "paytr";
  socials?: { tiktok?: string; facebook?: string; snapchat?: string; youtube?: string; mapsUrl?: string };
  announcement?: Localized;
}

export interface ProductFilter {
  q?: string;
  category?: string; // slug
  size?: string;
  color?: string;
  minMinor?: number;
  maxMinor?: number;
  tag?: ProductTag;
  sort?: "newest" | "price-asc" | "price-desc";
  includeInactive?: boolean;
  limit?: number;
}

export interface NewOrderInput {
  locale: Locale;
  channel: OrderChannel;
  customer: Order["customer"];
  address: Order["address"];
  items: { productId: string; size: string; color: string; qty: number }[];
  couponCode?: string;
  utm?: Utm;
}
