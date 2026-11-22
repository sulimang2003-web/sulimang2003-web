import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { repo } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";
import { IconInstagram, IconWhatsApp } from "@/components/icons";

export default async function Contact({ params }: PageProps<"/[locale]/contact">) {
  const locale = (await params).locale as Locale;
  const [d, s] = await Promise.all([getDictionary(locale), repo().getSettings()]);
  return (
    <div className="container-luxe py-14 md:py-20">
      <h1 className="heading-display text-4xl md:text-6xl">{d.pages.contactTitle}</h1>
      <div className="mt-12 grid gap-px bg-bone md:grid-cols-3">
        <a href={waLink(s.whatsappNumber, "")} target="_blank" rel="noopener" className="group bg-paper p-8 transition-colors hover:bg-white/[0.06]">
          <IconWhatsApp className="text-gold" width={28} height={28} />
          <p className="mt-6 font-display text-2xl">WhatsApp</p>
          <p className="mt-2 text-smoke" dir="ltr">+{s.whatsappNumber}</p>
        </a>
        <a href={`https://instagram.com/${s.instagramHandle}`} target="_blank" rel="noopener" className="bg-paper p-8 transition-colors hover:bg-white/[0.06]">
          <IconInstagram className="text-gold" width={28} height={28} />
          <p className="mt-6 font-display text-2xl">Instagram</p>
          <p className="mt-2 text-smoke" dir="ltr">@{s.instagramHandle}</p>
        </a>
        <div className="bg-paper p-8">
          <p className="eyebrow">{d.pages.addressLabel}</p>
          <p className="mt-4 font-display text-2xl">{s.addressLine}</p>
          <p className="mt-6 eyebrow">{d.pages.hours}</p>
          <p className="mt-2 text-smoke">{d.pages.hoursValue}</p>
          <p className="mt-6 text-smoke" dir="ltr">{s.email}</p>
        </div>
      </div>
      <div className="mt-px aspect-[16/7] w-full bg-bone">
        <iframe title="map" className="h-full w-full grayscale" loading="lazy" referrerPolicy="no-referrer"
          src="https://www.openstreetmap.org/export/embed.html?bbox=28.93%2C41.005%2C28.965%2C41.025&layer=mapnik" />
      </div>
    </div>
  );
}
