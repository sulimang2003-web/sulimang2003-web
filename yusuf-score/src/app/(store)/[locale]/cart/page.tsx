import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { CartView } from "@/components/store/cart-view";

export default async function CartPage({ params }: PageProps<"/[locale]/cart">) {
  const d = await getDictionary((await params).locale as Locale);
  return (
    <div className="container-luxe pb-24 pt-10 md:pt-14">
      <h1 className="heading-display mb-10 text-4xl md:text-5xl">{d.cart.title}</h1>
      <CartView />
    </div>
  );
}
