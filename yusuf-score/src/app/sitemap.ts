import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { repo } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [products, cats] = await Promise.all([repo().listProducts(), repo().listCategories()]);
  const paths = [
    "", "/shop", "/about", "/contact", "/faq",
    "/policies/shipping", "/policies/returns", "/policies/privacy", "/policies/terms",
    ...cats.map((c) => `/shop?category=${c.slug}`),
    ...products.map((p) => `/product/${p.slug}`),
  ];
  return paths.flatMap((p) =>
    locales.map((l) => ({
      url: `${base}/${l}${p}`,
      alternates: { languages: Object.fromEntries(locales.map((x) => [x, `${base}/${x}${p}`])) },
    })),
  );
}
