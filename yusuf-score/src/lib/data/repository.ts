import type {
  Category, Coupon, NewOrderInput, Order, OrderStatus, PaymentStatus, Product, ProductFilter, StoreSettings,
} from "../types";

export interface Stats {
  ordersTotal: number;
  ordersPending: number;
  revenueMinor: number; // excludes cancelled/returned
  avgOrderMinor: number;
  last30: { date: string; orders: number; revenueMinor: number }[];
  topProducts: { productId: string; name: string; qty: number; revenueMinor: number }[];
  lowStock: { productId: string; name: string; size: string; color: string; stock: number }[];
  bySource: { source: string; orders: number }[];
}

export class OrderError extends Error {
  constructor(public code: "out_of_stock" | "invalid_item" | "invalid_coupon" | "empty", message?: string) {
    super(message ?? code);
  }
}

/** Single data-access contract. Implemented by the demo JSON store and by Supabase. */
export interface Repository {
  mode: "demo" | "supabase";
  listProducts(f?: ProductFilter): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductById(id: string): Promise<Product | null>;
  saveProduct(p: Product): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  listCategories(): Promise<Category[]>;
  saveCategory(c: Category): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  /** Validates stock, recomputes prices server-side, applies coupon, decrements stock atomically. */
  createOrder(input: NewOrderInput): Promise<Order>;
  listOrders(opts?: { status?: OrderStatus; q?: string; limit?: number }): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  updateOrder(
    id: string,
    patch: { status?: OrderStatus; paymentStatus?: PaymentStatus; carrier?: string | null; trackingNumber?: string | null },
  ): Promise<Order>;

  listCoupons(): Promise<Coupon[]>;
  getCouponByCode(code: string): Promise<Coupon | null>;
  saveCoupon(c: Coupon): Promise<Coupon>;
  deleteCoupon(id: string): Promise<void>;

  getSettings(): Promise<StoreSettings>;
  saveSettings(s: StoreSettings): Promise<StoreSettings>;

  stats(): Promise<Stats>;
}
