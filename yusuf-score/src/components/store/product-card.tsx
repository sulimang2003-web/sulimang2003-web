import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { Product } from "@/lib/types";
import { formatTRY, t } from "@/lib/format";

export function ProductCard({ p, locale, dict, priority = false }: { p: Product; locale: Locale; dict: Dictionary; priority?: boolean }) {
  const soldOut = p.variants.every((v) => v.stock <= 0);
  const onSale = p.compareAtMinor && p.compareAtMinor > p.priceMinor;
  return (
    <Link href={`/${locale}/product/${p.slug}`} className="group block">
      <div className="img-zoom relative aspect-[4/5] overflow-hidden bg-bone">
        <Image src={p.images[0] ?? "/demo/hero.svg"} alt={t(p.name, locale)} fill priority={priority}
          sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw" className="object-cover" />
        {p.images[1] && (
          <Image src={p.images[1]} alt="" fill sizes="(min-width:1024px) 25vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
        )}
        <div className="absolute top-3 start-3 flex flex-col gap-1.5">
          {p.tags.includes("new") && <span className="bg-paper/90 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] rtl:tracking-normal rtl:text-[0.7rem]">{dict.product.new}</span>}
          {onSale && <span className="bg-sale px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-ivory rtl:tracking-normal rtl:text-[0.7rem]">{dict.product.sale}</span>}
        </div>
        {soldOut && <div className="absolute inset-x-0 bottom-0 bg-ink/70 py-2 text-center text-xs text-ivory">{dict.product.soldOut}</div>}
      </div>
      <div className="mt-3.5 space-y-1">
        <h3 className="text-[0.92rem] leading-snug">{t(p.name, locale)}</h3>
        <div className="flex items-center gap-2 text-sm">
          <span>{formatTRY(p.priceMinor, locale)}</span>
          {onSale && <span className="text-stone line-through">{formatTRY(p.compareAtMinor!, locale)}</span>}
        </div>
        {p.colors.length > 1 && (
          <div className="flex gap-1.5 pt-1">
            {p.colors.map((c) => <span key={c.code} className="h-2.5 w-2.5 rounded-full ring-1 ring-stone/40" style={{ background: c.hex }} />)}
          </div>
        )}
      </div>
    </Link>
  );
}
