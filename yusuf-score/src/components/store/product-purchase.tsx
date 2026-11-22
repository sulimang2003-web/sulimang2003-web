"use client";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { useStore } from "./store-context";
import { formatTRY, t } from "@/lib/format";
import { productMessage, waLink } from "@/lib/whatsapp";
import { IconMinus, IconPlus, IconWhatsApp } from "../icons";
import { track } from "./analytics";

export function ProductPurchase({ p, url }: { p: Product; url: string }) {
  const { dict, locale, add, settings } = useStore();
  const [color, setColor] = useState(p.colors.find((c) => p.variants.some((v) => v.color === c.code && v.stock > 0))?.code ?? p.colors[0]?.code);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);
  const [guide, setGuide] = useState(false);

  const stockOf = (s: string) => p.variants.find((v) => v.size === s && v.color === color)?.stock ?? 0;
  const stock = size ? stockOf(size) : 0;
  const colorObj = p.colors.find((c) => c.code === color);
  const allOut = useMemo(() => p.variants.every((v) => v.stock <= 0), [p.variants]);

  const wa = waLink(
    settings.whatsappNumber,
    productMessage(dict.whatsapp, locale, {
      name: t(p.name, locale), sku: p.sku, size: size ?? undefined, color: colorObj ? t(colorObj.name, locale) : undefined,
      priceMinor: p.priceMinor, qty, url,
    }),
  );

  const onAdd = () => {
    if (!size) return setError(true);
    add({
      productId: p.id, slug: p.slug, sku: p.sku, name: p.name, image: p.images[0], size, color: color!,
      colorName: colorObj!.name, priceMinor: p.priceMinor, qty, maxQty: Math.min(stock, 20),
    });
    track("AddToCart", { content_ids: [p.sku], value: (p.priceMinor * qty) / 100, currency: "TRY" });
  };

  return (
    <div className="space-y-7">
      {/* Color */}
      {p.colors.length > 0 && (
        <div>
          <p className="mb-3 text-sm">{dict.product.color}: <span className="text-smoke">{colorObj && t(colorObj.name, locale)}</span></p>
          <div className="flex gap-3">
            {p.colors.map((c) => (
              <button key={c.code} onClick={() => { setColor(c.code); setSize(null); setQty(1); }} aria-pressed={c.code === color} aria-label={t(c.name, locale)}
                className={`h-9 w-9 rounded-full ring-offset-2 ring-offset-paper transition ${c.code === color ? "ring-2 ring-ink" : "ring-1 ring-stone/40 hover:ring-ink/60"}`} style={{ background: c.hex }} />
            ))}
          </div>
        </div>
      )}

      {/* Size */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm">{dict.product.size}{size && <span className="text-smoke">: {size}</span>}</p>
          <button onClick={() => setGuide(true)} className="text-xs text-smoke underline underline-offset-4">{dict.product.sizeGuide}</button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {p.sizes.map((s) => {
            const st = stockOf(s);
            return (
              <button key={s} disabled={st <= 0} aria-pressed={size === s} onClick={() => { setSize(s); setQty(1); setError(false); }} className="chip w-full">
                {s}
              </button>
            );
          })}
        </div>
        <p className={`mt-2 min-h-5 text-xs ${error ? "text-sale" : "text-smoke"}`}>
          {error ? dict.product.selectSize : size ? (stock <= 0 ? dict.product.outOfStock : stock <= 3 ? `${dict.product.lowStock} (${stock})` : `● ${dict.product.inStock}`) : ""}
        </p>
      </div>

      {/* Qty */}
      <div className="flex items-center gap-4">
        <span className="text-sm">{dict.product.qty}</span>
        <div className="flex items-center border border-bone">
          <button className="p-3" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="-"><IconMinus width={14} /></button>
          <span className="w-8 text-center">{qty}</span>
          <button className="p-3" onClick={() => setQty((q) => Math.min(size ? Math.min(stock, 20) : 1, q + 1))} aria-label="+"><IconPlus width={14} /></button>
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={onAdd} disabled={allOut} className="btn btn-dark w-full">
          {allOut ? dict.product.soldOut : `${dict.product.addToCart} — ${formatTRY(p.priceMinor * qty, locale)}`}
        </button>
        <a href={wa} target="_blank" rel="noopener" onClick={() => track("Contact", { content_ids: [p.sku] })} className="btn btn-wa w-full">
          <IconWhatsApp /> {dict.product.orderWhatsapp}
        </a>
      </div>

      {guide && <SizeGuide onClose={() => setGuide(false)} trousers={/^\d+$/.test(p.sizes[0] ?? "")} />}
    </div>
  );
}

function SizeGuide({ onClose, trousers }: { onClose: () => void; trousers: boolean }) {
  const { dict } = useStore();
  // ⚠️ Demo measurements — replace with the brand's real size chart.
  const rows = trousers
    ? [["30", "76", "102"], ["32", "81", "103"], ["34", "86", "104"], ["36", "91", "105"], ["38", "96", "106"]]
    : [["S", "96", "72"], ["M", "102", "74"], ["L", "108", "76"], ["XL", "114", "78"], ["XXL", "120", "80"]];
  return (
    <div className="fixed inset-0 z-50 grid place-items-end md:place-items-center" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-paper p-6 md:p-8 animate-fade-up">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-display text-2xl">{dict.product.sizeGuide}</h3>
          <button onClick={onClose} className="text-sm underline">{dict.nav.close}</button>
        </div>
        <table className="w-full text-center text-sm">
          <thead className="border-b border-bone text-smoke">
            <tr><th className="py-3">{dict.product.size}</th><th>{trousers ? dict.product.waist : dict.product.chest}</th><th>{dict.product.length}</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => <tr key={r[0]} className="border-b border-bone/60">{r.map((c, i) => <td key={i} className="py-3">{c}</td>)}</tr>)}
          </tbody>
        </table>
        <p className="mt-4 text-xs text-smoke">{dict.product.sizeNote}</p>
      </div>
    </div>
  );
}
