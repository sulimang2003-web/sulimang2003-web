// Add "en" here (and create dictionaries/en.ts) to enable English.
export const locales = ["ar", "tr"] as const;
export type Locale = (typeof locales)[number] | "en";
export const defaultLocale: Locale = "ar";
export const rtlLocales: Locale[] = ["ar"];

export const isLocale = (v: string): v is (typeof locales)[number] =>
  (locales as readonly string[]).includes(v);

export const dirOf = (l: Locale) => (rtlLocales.includes(l) ? "rtl" : "ltr");

export const localeNames: Record<Locale, string> = { ar: "العربية", tr: "Türkçe", en: "English" };

export const intlLocale: Record<Locale, string> = { ar: "ar-u-nu-latn", tr: "tr-TR", en: "en-GB" };
