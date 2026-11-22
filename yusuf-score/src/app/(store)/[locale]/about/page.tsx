import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { about } from "@/lib/content";
import { ContentPage } from "@/components/store/content-page";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">) {
  return { title: about[(await params).locale as "ar" | "tr"].title };
}

export default async function About({ params }: PageProps<"/[locale]/about">) {
  const locale = (await params).locale as Locale;
  const d = await getDictionary(locale);
  const c = about[locale as "ar" | "tr"];
  return <ContentPage eyebrow={d.home.storyEyebrow} title={c.title} intro={c.intro} sections={c.sections} />;
}
