import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { Locale } from "@/i18n/config";
import type { StoreSettings } from "@/lib/types";
import { Logo } from "./logo";
import { IconInstagram, IconWhatsApp } from "../icons";
import { InstallPrompt } from "./install-prompt";
import { waLink } from "@/lib/whatsapp";

export function Footer({ dict, locale, settings }: { dict: Dictionary; locale: Locale; settings: StoreSettings }) {
  const L = (p: string) => `/${locale}${p}`;
  const col = "space-y-3 text-sm text-ivory/70";
  return (
    <footer className="bg-ink text-ivory">
      <div className="container-luxe grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-5">
          <Logo tone="light" />
          <p className="max-w-xs text-sm text-ivory/60">{dict.footer.tagline}</p>
          <p className="text-sm text-ivory/60">{settings.addressLine}</p>
          <div className="flex items-center gap-4">
            <a href={`https://instagram.com/${settings.instagramHandle}`} target="_blank" rel="noopener" aria-label="Instagram" className="hover:text-gold"><IconInstagram /></a>
            <a href={waLink(settings.whatsappNumber, "")} target="_blank" rel="noopener" aria-label="WhatsApp" className="hover:text-gold"><IconWhatsApp /></a>
            <InstallPrompt label={dict.footer.install} />
          </div>
        </div>
        <div>
          <p className="eyebrow !text-gold mb-5">{dict.footer.shop}</p>
          <ul className={col}>
            <li><Link className="link-underline" href={L("/shop")}>{dict.nav.shop}</Link></li>
            <li><Link className="link-underline" href={L("/shop?tag=new")}>{dict.nav.newIn}</Link></li>
            <li><Link className="link-underline" href={L("/shop?tag=bestseller")}>{dict.home.bestSellers}</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow !text-gold mb-5">{dict.footer.help}</p>
          <ul className={col}>
            <li><Link className="link-underline" href={L("/about")}>{dict.nav.about}</Link></li>
            <li><Link className="link-underline" href={L("/contact")}>{dict.nav.contact}</Link></li>
            <li><Link className="link-underline" href={L("/faq")}>{dict.nav.faq}</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow !text-gold mb-5">{dict.footer.legal}</p>
          <ul className={col}>
            <li><Link className="link-underline" href={L("/policies/shipping")}>{dict.footer.shipping}</Link></li>
            <li><Link className="link-underline" href={L("/policies/returns")}>{dict.footer.returns}</Link></li>
            <li><Link className="link-underline" href={L("/policies/privacy")}>{dict.footer.privacy}</Link></li>
            <li><Link className="link-underline" href={L("/policies/terms")}>{dict.footer.terms}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="container-luxe flex flex-col gap-2 py-6 text-xs text-ivory/45 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} {settings.storeName}. {dict.footer.rights}</p>
          <p dir="ltr">@{settings.instagramHandle}</p>
        </div>
      </div>
    </footer>
  );
}
