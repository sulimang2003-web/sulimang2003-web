import { notFound } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { policies } from "@/lib/content";
import { ContentPage } from "@/components/store/content-page";

export function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }));
}

export default async function Policy({ params }: PageProps<"/[locale]/policies/[slug]">) {
  const { locale, slug } = await params;
  const p = policies[slug as keyof typeof policies];
  if (!p) notFound();
  const d = await getDictionary(locale as Locale);
  const c = p[locale as "ar" | "tr"];
  return <ContentPage title={c.title} intro={c.intro} sections={c.sections} notice={d.pages.draftNotice} />;
}
