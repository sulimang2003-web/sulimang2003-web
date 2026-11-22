import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { repo } from "@/lib/data";
import { t } from "@/lib/format";
import type { ProductFilter, ProductTag } from "@/lib/types";
import { ProductCard } from "@/components/store/product-card";
import { AutoSubmitSelect } from "@/components/store/auto-submit-select";

export async function generateMetadata({ params }: PageProps<"/[locale]/shop">): Promise<Metadata> {
  const d = await getDictionary((await params).locale as Locale);
  return { title: d.shop.title };
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

export default async function Shop({ params, searchParams }: PageProps<"/[locale]/shop">) {
  const locale = (await params).locale as Locale;
  const sp = await searchParams;
  const d = await getDictionary(locale);
  const r = repo();

  const minTL = Number(one(sp.min)), maxTL = Number(one(sp.max));
  const filter: ProductFilter = {
    q: one(sp.q)?.slice(0, 80),
    category: one(sp.category),
    size: one(sp.size),
    color: one(sp.color),
    tag: (["new", "bestseller", "featured"] as const).includes(one(sp.tag) as ProductTag) ? (one(sp.tag) as ProductTag) : undefined,
    minMinor: Number.isFinite(minTL) && minTL > 0 ? minTL * 100 : undefined,
    maxMinor: Number.isFinite(maxTL) && maxTL > 0 ? maxTL * 100 : undefined,
    sort: (["newest", "price-asc", "price-desc"] as const).find((s) => s === one(sp.sort)) ?? "newest",
  };
  const [products, all, cats] = await Promise.all([r.listProducts(filter), r.listProducts(), r.listCategories()]);
  const sizes = [...new Set(all.flatMap((p) => p.sizes))];
  const colors = [...new Map(all.flatMap((p) => p.colors).map((c) => [c.code, c])).values()];
  const activeCat = cats.find((c) => c.slug === filter.category);
  const title = activeCat ? t(activeCat.name, locale) : filter.tag === "new" ? d.nav.newIn : filter.tag === "bestseller" ? d.home.bestSellers : d.shop.subtitle;

  const hidden = (skip: string[]) =>
    Object.entries({ q: filter.q, category: filter.category, tag: filter.tag, sort: filter.sort })
      .filter(([k, v]) => v && !skip.includes(k))
      .map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />);

  const Filters = (
    <form className="space-y-8" action={`/${locale}/shop`}>
      {hidden(["sort"])}
      <input type="hidden" name="sort" value={filter.sort} />
      <fieldset>
        <legend className="eyebrow mb-3">{d.shop.size}</legend>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <label key={s} className="cursor-pointer">
              <input type="radio" name="size" value={s} defaultChecked={filter.size === s} className="peer sr-only" />
              <span className="chip peer-checked:bg-ivory peer-checked:text-ink peer-checked:border-ivory">{s}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="eyebrow mb-3">{d.shop.color}</legend>
        <div className="flex flex-wrap gap-3">
          {colors.map((c) => (
            <label key={c.code} className="cursor-pointer flex flex-col items-center gap-1.5 text-[0.7rem] text-smoke" title={t(c.name, locale)}>
              <input type="radio" name="color" value={c.code} defaultChecked={filter.color === c.code} className="peer sr-only" />
              <span className="h-8 w-8 rounded-full ring-1 ring-stone/40 ring-offset-2 ring-offset-paper peer-checked:ring-2 peer-checked:ring-ivory" style={{ background: c.hex }} />
              {t(c.name, locale)}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="eyebrow mb-3">{d.shop.price} (TRY)</legend>
        <div className="flex gap-2">
          <input className="field" type="number" min={0} name="min" placeholder={d.shop.min} defaultValue={one(sp.min)} inputMode="numeric" />
          <input className="field" type="number" min={0} name="max" placeholder={d.shop.max} defaultValue={one(sp.max)} inputMode="numeric" />
        </div>
      </fieldset>
      <div className="flex gap-2">
        <button className="btn btn-dark flex-1">{d.shop.apply}</button>
        <Link href={`/${locale}/shop`} className="btn btn-outline">{d.shop.clear}</Link>
      </div>
    </form>
  );

  return (
    <div className="container-luxe pb-24 pt-10 md:pt-14">
      <header className="mb-8 md:mb-12">
        <p className="eyebrow">{d.shop.title}</p>
        <h1 className="heading-display mt-3 text-4xl md:text-6xl">{title}</h1>
      </header>

      {/* Category pills */}
      <nav className="no-scrollbar -mx-5 mb-8 flex gap-2 overflow-x-auto px-5 md:mx-0 md:px-0">
        <Link href={`/${locale}/shop`} className="chip shrink-0" data-active={!filter.category && !filter.tag}>{d.shop.all}</Link>
        {cats.map((c) => (
          <Link key={c.id} href={`/${locale}/shop?category=${c.slug}`} className="chip shrink-0 whitespace-nowrap" data-active={filter.category === c.slug}>{t(c.name, locale)}</Link>
        ))}
      </nav>

      <div className="flex items-center justify-between gap-3 border-y border-bone py-3">
        <details className="group lg:hidden">
          <summary className="cursor-pointer list-none text-sm uppercase tracking-widest rtl:tracking-normal">{d.shop.filters} +</summary>
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto border-t border-bone bg-paper p-6 shadow-2xl animate-fade-up">{Filters}</div>
        </details>
        <p className="hidden text-sm text-smoke lg:block">{products.length} {d.shop.results}</p>
        <form action={`/${locale}/shop`} className="flex items-center gap-2">
          {hidden(["sort"])}
          {filter.size && <input type="hidden" name="size" value={filter.size} />}
          {filter.color && <input type="hidden" name="color" value={filter.color} />}
          <label htmlFor="sort" className="text-xs text-smoke">{d.shop.sort}</label>
          <AutoSubmitSelect id="sort" name="sort" defaultValue={filter.sort} className="bg-transparent py-1 text-sm outline-none">
            <option value="newest">{d.shop.newest}</option>
            <option value="price-asc">{d.shop.priceAsc}</option>
            <option value="price-desc">{d.shop.priceDesc}</option>
          </AutoSubmitSelect>
        </form>
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <form action={`/${locale}/shop`} className="mb-8">
            {hidden(["q"])}
            <input className="field" type="search" name="q" defaultValue={filter.q} placeholder={d.shop.searchPlaceholder} />
          </form>
          {Filters}
        </aside>
        <section>
          <p className="mb-6 text-sm text-smoke lg:hidden">{products.length} {d.shop.results}</p>
          {products.length === 0 ? (
            <p className="py-24 text-center text-smoke">{d.shop.empty}</p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6">
              {products.map((p, i) => (
                <div key={p.id} className="reveal" style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                  <ProductCard p={p} locale={locale} dict={d} priority={i < 4} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
