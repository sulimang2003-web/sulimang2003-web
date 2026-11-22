"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useStore } from "./store-context";
import { IconClose, IconMinus, IconPlus, IconWhatsApp } from "../icons";
import { formatTRY, t } from "@/lib/format";
import { cartMessage, waLink } from "@/lib/whatsapp";

export function CartDrawer() {
  const { drawerOpen: open, setDrawerOpen, lines, dict, locale, subtotalMinor, setQty, remove, settings } = useStore();
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [setDrawerOpen]);

  const wa = waLink(
    settings.whatsappNumber,
    cartMessage(dict.whatsapp, locale, lines.map((l) => ({ name: t(l.name, locale), sku: l.sku, size: l.size, color: t(l.colorName, locale), qty: l.qty, unitMinor: l.priceMinor }))),
  );

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div onClick={() => setDrawerOpen(false)} className={`absolute inset-0 bg-ink/40 transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`} />
      <aside
        role="dialog"
        aria-label={dict.cart.title}
        className={`absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-paper transition-transform duration-500 ease-[var(--ease-luxe)] ${open ? "translate-x-0" : "ltr:translate-x-full rtl:-translate-x-full"}`}
      >
        <div className="flex h-[4.5rem] items-center justify-between border-b border-bone px-6">
          <h2 className="font-display text-2xl">{dict.cart.title} <span className="text-stone text-lg">({lines.length})</span></h2>
          <button onClick={() => setDrawerOpen(false)} aria-label={dict.nav.close}><IconClose /></button>
        </div>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
            <p className="text-smoke">{dict.cart.empty}</p>
            <Link href={`/${locale}/shop`} onClick={() => setDrawerOpen(false)} className="btn btn-dark">{dict.cart.continue}</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-bone overflow-y-auto px-6">
              {lines.map((l) => (
                <li key={l.key} className="flex gap-4 py-5">
                  <Link href={`/${locale}/product/${l.slug}`} onClick={() => setDrawerOpen(false)} className="relative aspect-[4/5] w-24 shrink-0 bg-bone">
                    <Image src={l.image} alt="" fill sizes="96px" className="object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <p className="font-display text-lg leading-snug">{t(l.name, locale)}</p>
                      <p className="text-sm whitespace-nowrap">{formatTRY(l.priceMinor * l.qty, locale)}</p>
                    </div>
                    <p className="mt-1 text-xs text-smoke">{l.size} · {t(l.colorName, locale)} · {l.sku}</p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-bone">
                        <button className="p-2" aria-label="-" onClick={() => setQty(l.key, l.qty - 1)}><IconMinus width={14} /></button>
                        <span className="w-8 text-center text-sm">{l.qty}</span>
                        <button className="p-2" aria-label="+" onClick={() => setQty(l.key, l.qty + 1)} disabled={l.qty >= l.maxQty}><IconPlus width={14} /></button>
                      </div>
                      <button onClick={() => remove(l.key)} className="text-xs text-smoke link-underline">{dict.cart.remove}</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-bone px-6 py-5 space-y-3 bg-white/[0.03] backdrop-blur-xl">
              <div className="flex justify-between"><span>{dict.cart.subtotal}</span><span>{formatTRY(subtotalMinor, locale)}</span></div>
              <p className="text-xs text-smoke">{dict.cart.shipping}: {dict.cart.shippingCalc} · {dict.cart.vatNote}</p>
              <Link href={`/${locale}/checkout`} onClick={() => setDrawerOpen(false)} className="btn btn-dark w-full">{dict.cart.checkout}</Link>
              <a href={wa} target="_blank" rel="noopener" className="btn btn-wa w-full"><IconWhatsApp /> {dict.cart.sendWhatsapp}</a>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
