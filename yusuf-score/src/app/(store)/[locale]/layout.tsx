import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Cormorant_Garamond, Jost, IBM_Plex_Sans_Arabic, Amiri } from "next/font/google";
import "../../globals.css";
import { dirOf, isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { repo } from "@/lib/data";
import { t } from "@/lib/format";
import { siteUrl } from "@/lib/site";
import { StoreProvider } from "@/components/store/store-context";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { CartDrawer } from "@/components/store/cart-drawer";
import { WhatsAppFab } from "@/components/store/whatsapp-fab";
import { RevealObserver } from "@/components/store/reveal";
import { ConsentAndAnalytics } from "@/components/store/analytics";

export const dynamic = "force-dynamic";

const cormorant = Cormorant_Garamond({ subsets: ["latin", "latin-ext"], weight: ["300", "400", "500"], style: ["normal", "italic"], variable: "--font-cormorant", display: "swap" });
const jost = Jost({ subsets: ["latin", "latin-ext"], weight: ["300", "400", "500"], variable: "--font-jost", display: "swap" });
const plexAr = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["300", "400", "500"], variable: "--font-plex-ar", display: "swap" });
const amiri = Amiri({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-amiri", display: "swap" });

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const d = await getDictionary(locale);
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: d.meta.title, template: "%s — YUSUF SCORE" },
    description: d.meta.description,
    applicationName: "YUSUF SCORE",
    appleWebApp: { capable: true, title: "Yusuf Score", statusBarStyle: "black-translucent" },
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])) },
    openGraph: { type: "website", siteName: "YUSUF SCORE", locale: locale === "ar" ? "ar_TR" : "tr_TR", title: d.meta.title, description: d.meta.description },
    icons: { icon: "/icons/icon.svg", apple: "/icons/apple-touch-icon.png" },
  };
}

export const viewport: Viewport = {
  themeColor: "#0e0e0d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function StoreLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [dict, settings, categories] = await Promise.all([getDictionary(locale), repo().getSettings(), repo().listCategories()]);
  const pub = {
    whatsappNumber: settings.whatsappNumber,
    instagramHandle: settings.instagramHandle,
    shipping: settings.shipping,
    addressLine: settings.addressLine,
    email: settings.email,
  };
  return (
    <html lang={locale} dir={dirOf(locale)} className={`${cormorant.variable} ${jost.variable} ${plexAr.variable} ${amiri.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <StoreProvider locale={locale} dict={dict} settings={pub}>
          <Header categories={categories.map((c) => ({ slug: c.slug, name: t(c.name, locale) }))} />
          <main className="flex-1">{children}</main>
          <Footer dict={dict} locale={locale} settings={settings} />
          <CartDrawer />
          <WhatsAppFab />
          <RevealObserver />
          <ConsentAndAnalytics text={dict.consent.text} accept={dict.consent.accept} reject={dict.consent.reject} />
        </StoreProvider>
      </body>
    </html>
  );
}
