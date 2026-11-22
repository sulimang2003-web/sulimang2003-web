"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "./store-context";
import { Logo } from "./logo";
import { IconBag, IconClose, IconInstagram, IconMenu, IconSearch } from "../icons";
import { locales, localeNames } from "@/i18n/config";

export function Header({ categories }: { categories: { slug: string; name: string }[] }) {
  const { locale, dict, count, setDrawerOpen, settings } = useStore();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === `/${locale}`;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { setMenu(false); setSearch(false); }, [pathname]);
  useEffect(() => { document.body.style.overflow = menu ? "hidden" : ""; }, [menu]);

  const transparent = isHome && !scrolled && !menu;
  const switchTo = (l: string) => pathname.replace(new RegExp(`^/${locale}`), `/${l}`);
  const L = (p: string) => `/${locale}${p}`;

  return (
    <>
      <div className="glass !border-x-0 !border-t-0 text-ivory/80 text-[0.7rem] rtl:text-xs text-center py-2 px-4 tracking-wide">{dict.announcement}</div>
      <header
        className={`sticky top-0 z-40 transition-colors duration-500 ${transparent ? "bg-transparent text-ivory" : "bg-paper/70 backdrop-blur-2xl text-ivory border-b border-bone"}`}
      >
        <div className="container-luxe grid h-[4.5rem] grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center gap-5">
            <button aria-label={dict.nav.menu} onClick={() => setMenu(true)} className="lg:hidden -ms-1 p-1"><IconMenu /></button>
            <nav className="hidden lg:flex items-center gap-6 whitespace-nowrap text-[0.7rem] uppercase tracking-[0.16em] rtl:tracking-normal rtl:text-sm">
              <Link className="link-underline" href={L("/shop")}>{dict.nav.shop}</Link>
              <Link className="link-underline" href={L("/shop?tag=new")}>{dict.nav.newIn}</Link>
              {categories.slice(0, 2).map((c) => (
                <Link key={c.slug} className="link-underline hidden xl:inline" href={L(`/shop?category=${c.slug}`)}>{c.name}</Link>
              ))}
            </nav>
          </div>
          <Link href={L("")} aria-label="Yusuf Score"><Logo tone="light" withMark /></Link>
          <div className="flex items-center justify-end gap-4">
            <div className="hidden md:flex items-center gap-1 text-[0.7rem] uppercase tracking-widest">
              {locales.map((l) => (
                <Link key={l} href={switchTo(l)} hrefLang={l} className={`px-1.5 ${l === locale ? "opacity-100" : "opacity-50 hover:opacity-100"}`}>{l}</Link>
              ))}
            </div>
            <button aria-label={dict.nav.search} onClick={() => setSearch((s) => !s)} className="p-1"><IconSearch /></button>
            <button aria-label={dict.nav.cart} onClick={() => setDrawerOpen(true)} className="relative p-1">
              <IconBag />
              {count > 0 && (
                <span className="absolute -top-1 -end-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-ivory px-1 text-[0.6rem] text-ink">{count}</span>
              )}
            </button>
          </div>
        </div>
        {search && (
          <form
            className="border-t border-bone bg-paper text-ivory animate-fade-in"
            onSubmit={(e) => { e.preventDefault(); const q = new FormData(e.currentTarget).get("q"); router.push(L(`/shop?q=${encodeURIComponent(String(q ?? ""))}`)); }}
          >
            <div className="container-luxe flex items-center gap-3 py-4">
              <IconSearch className="text-smoke" />
              <input autoFocus name="q" type="search" placeholder={dict.shop.searchPlaceholder} className="w-full bg-transparent py-2 text-lg outline-none placeholder:text-stone" />
              <button type="button" onClick={() => setSearch(false)} aria-label={dict.nav.close}><IconClose /></button>
            </div>
          </form>
        )}
      </header>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-50 lg:hidden ${menu ? "" : "pointer-events-none"}`} aria-hidden={!menu}>
        <div onClick={() => setMenu(false)} className={`absolute inset-0 bg-ink/40 transition-opacity duration-500 ${menu ? "opacity-100" : "opacity-0"}`} />
        <aside className={`glass absolute inset-y-0 start-0 flex w-[86%] max-w-sm flex-col !bg-[#1d1f22]/85 text-ivory transition-transform duration-500 ease-[var(--ease-luxe)] ${menu ? "translate-x-0" : "ltr:-translate-x-full rtl:translate-x-full"}`}>
          <div className="flex h-[4.5rem] items-center justify-between border-b border-bone px-5">
            <Logo tone="light" withMark className="scale-90 origin-[inherit]" />
            <button onClick={() => setMenu(false)} aria-label={dict.nav.close}><IconClose /></button>
          </div>
          <nav className="flex flex-col px-5 py-6 text-2xl font-display">
            <Link className="py-3 border-b border-bone/70" href={L("/shop")}>{dict.nav.shop}</Link>
            <Link className="py-3 border-b border-bone/70" href={L("/shop?tag=new")}>{dict.nav.newIn}</Link>
            {categories.map((c) => (
              <Link key={c.slug} className="py-3 border-b border-bone/70" href={L(`/shop?category=${c.slug}`)}>{c.name}</Link>
            ))}
            <Link className="py-3 border-b border-bone/70" href={L("/about")}>{dict.nav.about}</Link>
            <Link className="py-3 border-b border-bone/70" href={L("/contact")}>{dict.nav.contact}</Link>
            <Link className="py-3" href={L("/faq")}>{dict.nav.faq}</Link>
          </nav>
          <div className="mt-auto border-t border-bone px-5 py-5 flex items-center justify-between">
            <div className="flex gap-2">
              {locales.map((l) => (
                <Link key={l} href={switchTo(l)} className="chip" data-active={l === locale}>{localeNames[l]}</Link>
              ))}
            </div>
            <a href={`https://instagram.com/${settings.instagramHandle}`} target="_blank" rel="noopener" aria-label="Instagram"><IconInstagram /></a>
          </div>
        </aside>
      </div>
    </>
  );
}
