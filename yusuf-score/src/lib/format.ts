import { intlLocale, type Locale } from "@/i18n/config";
import type { Localized } from "./types";

export function formatTRY(minor: number, locale: Locale = "tr") {
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "TRY",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: minor % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(minor / 100);
}

export const toMinor = (v: number) => Math.round(v * 100);
export const fromMinor = (v: number) => v / 100;

export function t(value: Localized | undefined | null, locale: Locale): string {
  if (!value) return "";
  return value[locale] || value.tr || value.ar || "";
}

export function formatDate(iso: string, locale: Locale = "ar") {
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso),
  );
}

export function slugify(input: string) {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i" };
  return input
    .toLowerCase()
    .replace(/[çğıöşüİ]/g, (c) => map[c] ?? c)
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
