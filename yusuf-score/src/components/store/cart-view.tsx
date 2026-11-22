"use client";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "./store-context";
import { formatTRY, t } from "@/lib/format";
import { cartMessage, waLink } from "@/lib/whatsapp";
import { IconMinus, IconPlus, IconWhatsApp } from "../icons";

export function CartView() {
  const { lines, dict, locale, subtotalMinor, setQty, remove, settings } = useStore();
  if (!lines.length)
    return (
      <div className="py-24 text-center">
        <p className="text-smoke">{dict.cart.empty}</p>
        <Link href={`/${locale}/shop`} className="btn btn-dark mt-8">{dict.cart.continue}</Link>
      </div>
    );
  const wa = waLink(settings.whatsappNumber, cartMessage(dict.whatsapp, locale, lines.map((l) => ({ name: t(l.name, locale), sku: l.sku, size: l.size, color: t(l.colorName, locale), qty: l.qty, unitMinor: l.priceMinor }))));
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
      <ul className="divide-y divide-bone border-y border-bone">
        {lines.map((l) => (
          <li key={l.key} className="flex gap-5 py-6">
            <Link href={`/${locale}/product/${l.slug}`} className="relative aspect-[4/5] w-28 shrink-0 bg-bone md:w-36">
              <Image src={l.image} alt="" fill sizes="144px" className="object-cover" />
            </Link>
            <div className="flex flex-1 flex-col">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-display text-xl">{t(l.name, locale)}</p>
                  <p className="mt-1 text-xs text-smoke">{dict.product.size}: {l.size} · {dict.product.color}: {t(l.colorName, locale)} · <span dir="ltr">{l.sku}</span></p>
                </div>
                <p className="whitespace-nowrap">{formatTRY(l.priceMinor * l.qty, locale)}</p>
              </div>
              <div className="mt-auto flex items-center justify-between pt-4">
                <div className="flex items-center border border-bone">
                  <button className="p-3" onClick={() => setQty(l.key, l.qty - 1)} aria-label="-"><IconMinus width={14} /></button>
                  <span className="w-8 text-center">{l.qty}</span>
                  <button className="p-3" onClick={() => setQty(l.key, l.qty + 1)} disabled={l.qty >= l.maxQty} aria-label="+"><IconPlus width={14} /></button>
                </div>
                <button onClick={() => remove(l.key)} className="text-xs text-smoke link-underline">{dict.cart.remove}</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <aside className="h-fit space-y-4 bg-white/[0.04] backdrop-blur-xl border border-bone p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-2xl">{dict.checkout.summary}</h2>
        <div className="flex justify-between text-sm"><span>{dict.cart.subtotal}</span><span>{formatTRY(subtotalMinor, locale)}</span></div>
        <div className="flex justify-between text-sm text-smoke"><span>{dict.cart.shipping}</span><span>{dict.cart.shippingCalc}</span></div>
        <div className="h-px bg-bone" />
        <div className="flex justify-between text-lg"><span>{dict.cart.total}</span><span>{formatTRY(subtotalMinor, locale)}</span></div>
        <p className="text-xs text-smoke">{dict.cart.vatNote}</p>
        <Link href={`/${locale}/checkout`} className="btn btn-dark w-full">{dict.cart.checkout}</Link>
        <a href={wa} target="_blank" rel="noopener" className="btn btn-wa w-full"><IconWhatsApp /> {dict.cart.sendWhatsapp}</a>
      </aside>
    </div>
  );
}
