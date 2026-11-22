import type { Metadata } from "next";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { CheckoutForm } from "@/components/store/checkout-form";
import { onlinePaymentAvailable } from "@/lib/payments";

export const metadata: Metadata = { robots: { index: false } };

export default async function CheckoutPage({ params }: PageProps<"/[locale]/checkout">) {
  const d = await getDictionary((await params).locale as Locale);
  return (
    <div className="container-luxe pb-24 pt-10 md:pt-14">
      <h1 className="heading-display mb-10 text-4xl md:text-5xl">{d.checkout.title}</h1>
      <CheckoutForm onlinePayment={onlinePaymentAvailable()} />
    </div>
  );
}
