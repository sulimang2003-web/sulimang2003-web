import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n";
import { faq } from "@/lib/content";

export default async function Faq({ params }: PageProps<"/[locale]/faq">) {
  const locale = (await params).locale as Locale;
  const d = await getDictionary(locale);
  const items = faq[locale as "ar" | "tr"];
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  return (
    <div className="container-luxe max-w-3xl py-14 md:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <h1 className="heading-display text-4xl md:text-6xl">{d.pages.faqTitle}</h1>
      <div className="mt-10 divide-y divide-bone border-y border-bone">
        {items.map(([q, a]) => (
          <details key={q} className="group py-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl">
              {q}<span className="text-2xl transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-4 leading-loose text-graphite">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
