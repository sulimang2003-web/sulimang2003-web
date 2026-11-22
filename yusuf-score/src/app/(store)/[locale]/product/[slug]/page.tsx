import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { repo } from "@/lib/data";
import { formatTRY, t } from "@/lib/format";
import { siteUrl } from "@/lib/site";
import { ProductGallery } from "@/components/store/product-gallery";
import { ProductPurchase } from "@/components/store/product-purchase";
import { ProductCard } from "@/components/store/product-card";

export async function generateMetadata({ params }: PageProps<"/[locale]/product/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const p = await repo().getProductBySlug(slug);
  if (!p) return {};
  const l = locale as Locale;
  return {
    title: t(p.name, l),
    description: t(p.description, l).slice(0, 160),
    openGraph: { images: p.images.filter((i) => !i.endsWith(".svg")).slice(0, 1) },
  };
}

export default async function ProductPage({ params }: PageProps<"/[locale]/product/[slug]">) {
  const { locale: lc, slug } = await params;
  const locale = lc as Locale;
  const r = repo();
  const p = await r.getProductBySlug(slug);
  if (!p || !p.active) notFound();
  const [d, cats, related] = await Promise.all([
    getDictionary(locale),
    r.listCategories(),
    r.listProducts({ limit: 8 }),
  ]);
  const cat = cats.find((c) => c.id === p.categoryId);
  const similar = related.filter((x) => x.id !== p.id && x.categoryId === p.categoryId).concat(related.filter((x) => x.id !== p.id && x.categoryId !== p.categoryId)).slice(0, 4);
  const url = `${siteUrl()}/${locale}/product/${p.slug}?utm_source=whatsapp&utm_medium=share&utm_campaign=product`;
  const inStock = p.variants.some((v) => v.stock > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: t(p.name, locale),
    sku: p.sku,
    description: t(p.description, locale),
    brand: { "@type": "Brand", name: "Yusuf Score" },
    offers: { "@type": "Offer", priceCurrency: "TRY", price: (p.priceMinor / 100).toFixed(2), availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-luxe pt-6 pb-20 md:pt-10">
        <nav className="mb-6 text-xs text-smoke">
          <Link href={`/${locale}/shop`} className="link-underline">{d.nav.shop}</Link>
          {cat && <> / <Link href={`/${locale}/shop?category=${cat.slug}`} className="link-underline">{t(cat.name, locale)}</Link></>}
        </nav>
        <div className="grid gap-10 md:grid-cols-[1.25fr_1fr] md:gap-14 lg:gap-20">
          <div className="-mx-5 md:mx-0"><ProductGallery images={p.images} alt={t(p.name, locale)} /></div>
          <div className="md:sticky md:top-28 md:self-start">
            <p className="eyebrow">{cat ? t(cat.name, locale) : "Yusuf Score"}</p>
            <h1 className="heading-display mt-3 text-3xl md:text-[2.6rem]">{t(p.name, locale)}</h1>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-xl">{formatTRY(p.priceMinor, locale)}</span>
              {p.compareAtMinor && p.compareAtMinor > p.priceMinor && (
                <>
                  <span className="text-stone line-through">{formatTRY(p.compareAtMinor, locale)}</span>
                  <span dir="ltr" className="bg-sale px-2 py-0.5 text-xs text-ivory">-{Math.round(100 - (p.priceMinor / p.compareAtMinor) * 100)}%</span>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-smoke">{d.product.sku}: <span dir="ltr">{p.sku}</span> · {d.cart.vatNote}</p>
            <div className="my-8 h-px bg-bone" />
            <ProductPurchase p={p} url={url} />
            <div className="mt-10 divide-y divide-bone border-y border-bone">
              {[
                [d.product.description, t(p.description, locale)],
                [d.product.material, t(p.material, locale)],
                [d.product.delivery, d.product.deliveryText],
              ].filter(([, v]) => v).map(([k, v], i) => (
                <details key={k} className="group py-5" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm uppercase tracking-[0.15em] rtl:tracking-normal">
                    {k}<span className="transition-transform group-open:rotate-45 text-lg">+</span>
                  </summary>
                  <p className="mt-4 text-sm leading-loose text-graphite">{v}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
      {similar.length > 0 && (
        <section className="container-luxe border-t border-bone py-20">
          <h2 className="heading-display text-3xl md:text-4xl">{d.product.related}</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-6">
            {similar.map((x) => <ProductCard key={x.id} p={x} locale={locale} dict={d} />)}
          </div>
        </section>
      )}
    </>
  );
}
