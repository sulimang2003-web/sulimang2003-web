import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { repo } from "@/lib/data";
import { t } from "@/lib/format";
import { ProductCard } from "@/components/store/product-card";
import { IconArrow, IconExchange, IconInstagram, IconStore, IconTruck, IconWhatsApp } from "@/components/icons";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const locale = (await params).locale as Locale;
  const d = await getDictionary(locale);
  const r = repo();
  const [newIn, best, cats, settings, featured] = await Promise.all([
    r.listProducts({ tag: "new", limit: 8 }),
    r.listProducts({ tag: "bestseller", limit: 4 }),
    r.listCategories(),
    r.getSettings(),
    r.listProducts({ tag: "featured", limit: 6 }),
  ]);
  const L = (p: string) => `/${locale}${p}`;
  const insta = [...featured, ...best, ...newIn].filter((p, i, a) => a.findIndex((x) => x.id === p.id) === i).slice(0, 6);

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative h-[100svh] min-h-[620px] overflow-hidden bg-ink text-ivory">
        <picture>
          <source media="(min-width: 768px)" srcSet="/demo/hero.svg" />
          <img src="/demo/hero-mobile.svg" alt="" className="absolute inset-0 h-full w-full object-cover animate-fade-in" />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-ink/40" />
        <div className="container-luxe relative flex h-full flex-col justify-end pb-16 md:pb-24">
          <p className="eyebrow !text-gold-soft animate-fade-up">{d.home.heroEyebrow}</p>
          <h1 className="heading-display mt-5 max-w-3xl whitespace-pre-line text-[2.9rem] sm:text-6xl md:text-7xl lg:text-[5.6rem] animate-fade-up [animation-delay:120ms]">
            {d.home.heroTitle}
          </h1>
          <p className="mt-6 max-w-md text-ivory/75 leading-relaxed animate-fade-up [animation-delay:240ms]">{d.home.heroText}</p>
          <div className="mt-9 flex flex-wrap gap-3 animate-fade-up [animation-delay:360ms]">
            <Link href={L("/shop")} className="btn btn-light">{d.home.shopCollection} <IconArrow width={16} /></Link>
            <Link href={L("/shop?tag=new")} className="btn btn-outline text-ivory hover:!bg-ivory hover:!text-ink hover:!border-ivory">{d.nav.newIn}</Link>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="overflow-hidden border-b border-bone bg-ivory py-4" dir="ltr">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap font-display text-lg italic text-smoke">
          {Array.from({ length: 2 }).flatMap((_, k) =>
            ["Crafted in Istanbul", "Fatih · Since day one", "Premium Menswear", "Order via WhatsApp", "@yusufscore"].map((x, i) => (
              <span key={`${k}-${i}`} className="flex items-center gap-12">{x}<span className="text-gold not-italic">✦</span></span>
            )),
          )}
        </div>
      </div>

      {/* ── NEW ARRIVALS ── */}
      <section className="container-luxe py-20 md:py-28">
        <SectionHead eyebrow={d.home.newArrivalsSub} title={d.home.newArrivals} href={L("/shop?tag=new")} cta={d.home.viewAll} />
        <div className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible md:px-0">
          {newIn.slice(0, 4).map((p, i) => (
            <div key={p.id} className="reveal w-[68%] shrink-0 snap-start md:w-auto" style={{ transitionDelay: `${i * 90}ms` }}>
              <ProductCard p={p} locale={locale} dict={d} priority={i < 2} />
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="bg-ivory py-20 md:py-28">
        <div className="container-luxe">
          <SectionHead eyebrow={d.home.discover} title={d.home.categories} />
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-5">
            {cats.map((c, i) => (
              <Link key={c.id} href={L(`/shop?category=${c.slug}`)} className={`reveal img-zoom group relative block overflow-hidden bg-charcoal ${i === 0 ? "col-span-2 aspect-[16/10] md:col-span-1 md:aspect-[3/4]" : "aspect-[3/4]"}`} style={{ transitionDelay: `${i * 80}ms` }}>
                <Image src={c.image ?? "/demo/hero.svg"} alt="" fill sizes="(min-width:768px) 20vw, 50vw" className="object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/75 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-ivory md:p-5">
                  <p className="font-display text-xl md:text-2xl">{t(c.name, locale)}</p>
                  <span className="mt-1 inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] text-ivory/70 rtl:tracking-normal rtl:text-xs">{d.home.discover} <IconArrow width={12} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEST SELLERS ── */}
      <section className="container-luxe py-20 md:py-28">
        <SectionHead eyebrow={d.home.bestSellersSub} title={d.home.bestSellers} href={L("/shop?tag=bestseller")} cta={d.home.viewAll} />
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-6">
          {best.map((p, i) => (
            <div key={p.id} className="reveal" style={{ transitionDelay: `${i * 90}ms` }}><ProductCard p={p} locale={locale} dict={d} /></div>
          ))}
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="bg-ink text-ivory">
        <div className="container-luxe grid items-center gap-12 py-20 md:grid-cols-2 md:gap-20 md:py-28">
          <div className="reveal relative aspect-square overflow-hidden">
            <Image src="/demo/story.svg" alt="" fill sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
            <div className="absolute inset-5 border border-gold/30" />
          </div>
          <div className="reveal">
            <p className="eyebrow !text-gold">{d.home.storyEyebrow}</p>
            <h2 className="heading-display mt-5 text-4xl md:text-5xl">{d.home.storyTitle}</h2>
            <p className="mt-6 max-w-lg leading-loose text-ivory/70">{d.home.storyText}</p>
            <Link href={L("/about")} className="btn btn-outline mt-10 text-ivory hover:!bg-ivory hover:!text-ink">{d.home.storyCta}</Link>
          </div>
        </div>
      </section>

      {/* ── PERKS ── */}
      <section className="border-b border-bone">
        <div className="container-luxe grid grid-cols-2 gap-px bg-bone md:grid-cols-4">
          {[
            [IconTruck, d.perks.shipping, d.perks.shippingText],
            [IconWhatsApp, d.perks.whatsapp, d.perks.whatsappText],
            [IconExchange, d.perks.exchange, d.perks.exchangeText],
            [IconStore, d.perks.store, d.perks.storeText],
          ].map(([Icon, title, text], i) => {
            const I = Icon as typeof IconTruck;
            return (
              <div key={i} className="bg-paper px-4 py-10 md:px-8 md:py-14">
                <I className="text-gold" width={26} height={26} />
                <p className="mt-5 font-display text-xl">{title as string}</p>
                <p className="mt-2 text-sm leading-relaxed text-smoke">{text as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── INSTAGRAM ── */}
      <section className="container-luxe py-20 md:py-28 text-center">
        <p className="eyebrow" dir="ltr">{d.home.instaEyebrow}</p>
        <h2 className="heading-display mx-auto mt-4 max-w-2xl text-3xl md:text-5xl">{d.home.instaTitle}</h2>
        <div className="mt-10 grid grid-cols-3 gap-1.5 md:grid-cols-6 md:gap-3">
          {insta.map((p) => (
            <Link key={p.id} href={L(`/product/${p.slug}`)} className="img-zoom group relative aspect-square overflow-hidden bg-bone">
              <Image src={p.images[1] ?? p.images[0]} alt={t(p.name, locale)} fill sizes="(min-width:768px) 16vw, 33vw" className="object-cover" />
              <div className="absolute inset-0 grid place-items-center bg-ink/0 text-ivory opacity-0 transition-all duration-500 group-hover:bg-ink/40 group-hover:opacity-100"><IconInstagram width={26} height={26} /></div>
            </Link>
          ))}
        </div>
        <a href={`https://instagram.com/${settings.instagramHandle}`} target="_blank" rel="noopener" className="btn btn-dark mt-10">
          <IconInstagram /> {d.home.instaCta}
        </a>
      </section>

      {/* ── VISIT ── */}
      <section className="bg-ivory">
        <div className="container-luxe flex flex-col items-center gap-4 py-16 text-center">
          <IconStore className="text-gold" width={28} height={28} />
          <h2 className="heading-display text-3xl">{d.home.visitTitle}</h2>
          <p className="max-w-md text-smoke">{d.home.visitText}</p>
          <p className="text-sm">{d.pages.hours}: {d.pages.hoursValue}</p>
        </div>
      </section>
    </>
  );
}

function SectionHead({ eyebrow, title, href, cta }: { eyebrow: string; title: string; href?: string; cta?: string }) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="heading-display mt-3 text-4xl md:text-5xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="hidden items-center gap-2 pb-2 text-xs uppercase tracking-[0.2em] rtl:tracking-normal rtl:text-sm sm:inline-flex link-underline">
          {cta} <IconArrow width={14} />
        </Link>
      )}
    </div>
  );
}
