import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { Locale } from "@/i18n/config";
import { formatTRY } from "./format";

export const waLink = (number: string, text: string) =>
  `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

export function productMessage(
  d: Dictionary["whatsapp"],
  locale: Locale,
  p: { name: string; sku: string; size?: string; color?: string; priceMinor: number; qty?: number; url: string },
) {
  return [
    d.hello,
    "",
    `• ${d.product}: ${p.name}`,
    `• ${d.code}: ${p.sku}`,
    `• ${d.size}: ${p.size ?? "—"}`,
    `• ${d.color}: ${p.color ?? "—"}`,
    `• ${d.qty}: ${p.qty ?? 1}`,
    `• ${d.price}: ${formatTRY(p.priceMinor, locale)}`,
    "",
    `${d.link}: ${p.url}`,
  ].join("\n");
}

export function cartMessage(
  d: Dictionary["whatsapp"],
  locale: Locale,
  lines: { name: string; sku: string; size: string; color: string; qty: number; unitMinor: number }[],
  extra?: { orderNumber?: string; totalMinor?: number; name?: string; address?: string },
) {
  const total = extra?.totalMinor ?? lines.reduce((s, l) => s + l.qty * l.unitMinor, 0);
  return [
    d.cartHello,
    extra?.orderNumber ? `${d.order}: ${extra.orderNumber}` : null,
    "",
    ...lines.map(
      (l, i) =>
        `${i + 1}) ${l.name}\n   ${d.code}: ${l.sku} | ${d.size}: ${l.size} | ${d.color}: ${l.color} | ${d.qty}: ${l.qty} | ${formatTRY(l.unitMinor * l.qty, locale)}`,
    ),
    "",
    `${d.total}: ${formatTRY(total, locale)}`,
    extra?.name ? `${d.name}: ${extra.name}` : null,
    extra?.address ? `${d.address}: ${extra.address}` : null,
  ]
    .filter((x) => x !== null)
    .join("\n");
}
