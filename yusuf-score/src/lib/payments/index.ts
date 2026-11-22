import "server-only";
import type { Order } from "../types";

/**
 * Payment provider abstraction.
 * Phase 1: "none" — orders are confirmed via WhatsApp (cash on delivery / bank transfer / in store).
 * Phase 2: plug in a licensed Turkish PSP (e.g. iyzico or PayTR) once the merchant account,
 * contract and 3D Secure flow are approved. Card data must NEVER touch our server —
 * use the provider's hosted checkout / iframe (keeps PCI-DSS scope minimal).
 */
export interface PaymentProvider {
  id: "none" | "iyzico" | "paytr";
  isConfigured(): boolean;
  /** Returns a URL (hosted payment page) or HTML token to render the provider's iframe. */
  createCheckout(order: Order, opts: { callbackUrl: string }): Promise<{ redirectUrl?: string; iframeToken?: string }>;
  /** Verify the provider's server-to-server callback signature and return the order id + result. */
  verifyCallback(body: Record<string, string>): Promise<{ orderId: string; paid: boolean }>;
}

const notImplemented = (name: string) => async () => {
  throw new Error(`${name} integration not implemented yet — requires a merchant account and credentials`);
};

const none: PaymentProvider = {
  id: "none",
  isConfigured: () => true,
  createCheckout: notImplemented("none"),
  verifyCallback: notImplemented("none"),
};

const iyzico: PaymentProvider = {
  id: "iyzico",
  isConfigured: () => !!(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY),
  createCheckout: notImplemented("iyzico"), // TODO: Checkout Form Initialize (CF) API
  verifyCallback: notImplemented("iyzico"), // TODO: retrieve checkout form result by token
};

const paytr: PaymentProvider = {
  id: "paytr",
  isConfigured: () => !!(process.env.PAYTR_MERCHANT_ID && process.env.PAYTR_MERCHANT_KEY && process.env.PAYTR_MERCHANT_SALT),
  createCheckout: notImplemented("paytr"), // TODO: iFrame API get-token
  verifyCallback: notImplemented("paytr"), // TODO: validate hash with merchant_key + merchant_salt
};

export function paymentProvider(): PaymentProvider {
  const id = (process.env.PAYMENT_PROVIDER ?? "none") as PaymentProvider["id"];
  const p = { none, iyzico, paytr }[id] ?? none;
  return p.isConfigured() ? p : none;
}

export const onlinePaymentAvailable = () => paymentProvider().id !== "none";
