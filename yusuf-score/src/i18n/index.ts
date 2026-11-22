import "server-only";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries/ar";

const dictionaries: Record<string, () => Promise<Dictionary>> = {
  ar: () => import("./dictionaries/ar").then((m) => m.default),
  tr: () => import("./dictionaries/tr").then((m) => m.default),
  // en: () => import("./dictionaries/en").then((m) => m.default),
};

export const getDictionary = (locale: Locale) => (dictionaries[locale] ?? dictionaries.ar)();
export type { Dictionary };
