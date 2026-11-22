import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { Locale } from "@/i18n/config";
import type { StoreSettings } from "@/lib/types";
import { LogoMark } from "./logo";
import { IconFacebook, IconInstagram, IconPin, IconSnapchat, IconTikTok, IconWhatsApp, IconYouTube } from "../icons";
import { InstallPrompt } from "./install-prompt";
import { waLink } from "@/lib/whatsapp";

type Social = { href: string; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> };

export function socialLinks(s: StoreSettings, locationLabel: string): Social[] {
  const x = s.socials ?? {};
  const list: (Social | null)[] = [
    { href: `https://instagram.com/${s.instagramHandle}`, label: "Instagram", Icon: IconInstagram },
    { href: waLink(s.whatsappNumber, ""), label: "WhatsApp", Icon: IconWhatsApp },
    x.tiktok ? { href: `https://www.tiktok.com/@${x.tiktok.replace(/^@/, "")}`, label: "TikTok", Icon: IconTikTok } : null,
    x.snapchat ? { href: `https://www.snapchat.com/add/${x.snapchat.replace(/^@/, "")}`, label: "Snapchat", Icon: IconSnapchat } : null,
    x.facebook ? { href: x.facebook, label: "Facebook", Icon: IconFacebook } : null,
    x.youtube ? { href: x.youtube, label: "YouTube", Icon: IconYouTube } : null,
    x.mapsUrl ? { href: x.mapsUrl, label: locationLabel, Icon: IconPin } : null,
  ];
  return list.filter((v): v is Social => v !== null);
}

export function Footer({ dict, locale, settings }: { dict: Dictionary; locale: Locale; settings: StoreSettings }) {
  const L = (p: string) => `/${locale}${p}`;
  const col = "space-y-3 text-sm text-ivory/65";
  const socials = socialLinks(settings, dict.footer.location);
  return (
    <footer className="relative mt-10 border-t border-bone text-ivory">
      {/* Links */}
      <div className="container-luxe grid grid-cols-2 gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="eyebrow mb-5 !text-ivory/50">{dict.footer.shop}</p>
          <ul className={col}>
            <li><Link className="link-underline" href={L("/shop")}>{dict.nav.shop}</Link></li>
            <li><Link className="link-underline" href={L("/shop?tag=new")}>{dict.nav.newIn}</Link></li>
            <li><Link className="link-underline" href={L("/shop?tag=bestseller")}>{dict.home.bestSellers}</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-5 !text-ivory/50">{dict.footer.help}</p>
          <ul className={col}>
            <li><Link className="link-underline" href={L("/about")}>{dict.nav.about}</Link></li>
            <li><Link className="link-underline" href={L("/contact")}>{dict.nav.contact}</Link></li>
            <li><Link className="link-underline" href={L("/faq")}>{dict.nav.faq}</Link></li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-5 !text-ivory/50">{dict.footer.legal}</p>
          <ul className={col}>
            <li><Link className="link-underline" href={L("/policies/shipping")}>{dict.footer.shipping}</Link></li>
            <li><Link className="link-underline" href={L("/policies/returns")}>{dict.footer.returns}</Link></li>
            <li><Link className="link-underline" href={L("/policies/privacy")}>{dict.footer.privacy}</Link></li>
            <li><Link className="link-underline" href={L("/policies/terms")}>{dict.footer.terms}</Link></li>
          </ul>
        </div>
      </div>

      {/* Brand signature — circular YS logo + social accounts */}
      <div className="relative flex flex-col items-center px-5 pb-14 pt-6 text-center">
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(255,255,255,.09),transparent)]" />
        <LogoMark size={260} className="reveal relative h-44 w-44 !shadow-none md:h-60 md:w-60" />
        <a href={`https://instagram.com/${settings.instagramHandle}`} target="_blank" rel="noopener" dir="ltr" className="mt-6 text-sm tracking-[0.18em] text-ivory/75 hover:text-ivory">
          @{settings.instagramHandle}
        </a>
        <p className="mt-2 max-w-xs text-xs text-ivory/45">{dict.footer.follow}</p>
        <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-6 md:gap-x-10">
          {socials.map(({ href, label, Icon }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noopener" aria-label={label} className="social-btn">
                <span className="c"><Icon width={26} height={26} strokeWidth={1.4} /></span>
                <span>{label}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-8"><InstallPrompt label={dict.footer.install} /></div>
      </div>

      <div className="border-t border-bone">
        <div className="container-luxe flex flex-col items-center gap-1.5 py-6 text-center text-xs text-ivory/40 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} {settings.storeName} — For Men. {dict.footer.rights}</p>
          <p>{settings.addressLine}</p>
        </div>
      </div>
    </footer>
  );
}
