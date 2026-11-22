"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Dictionary } from "@/i18n/dictionaries/ar";
import type { Locale } from "@/i18n/config";
import type { Localized, StoreSettings } from "@/lib/types";

export interface CartLine {
  key: string; // productId|size|color
  productId: string;
  slug: string;
  sku: string;
  name: Localized;
  image: string;
  size: string;
  color: string;
  colorName: Localized;
  priceMinor: number;
  qty: number;
  maxQty: number;
}

type PublicSettings = Pick<StoreSettings, "whatsappNumber" | "instagramHandle" | "shipping" | "addressLine" | "email">;

interface Ctx {
  locale: Locale;
  dict: Dictionary;
  settings: PublicSettings;
  lines: CartLine[];
  count: number;
  subtotalMinor: number;
  add(line: Omit<CartLine, "key">): void;
  setQty(key: string, qty: number): void;
  remove(key: string): void;
  clear(): void;
  drawerOpen: boolean;
  setDrawerOpen(v: boolean): void;
}

const StoreCtx = createContext<Ctx | null>(null);
const KEY = "ys_cart_v1";

export function StoreProvider({ locale, dict, settings, children }: { locale: Locale; dict: Dictionary; settings: PublicSettings; children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch { /* ignore */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* ignore */ }
  }, [lines, ready]);

  const add = useCallback((l: Omit<CartLine, "key">) => {
    const key = `${l.productId}|${l.size}|${l.color}`;
    setLines((prev) => {
      const ex = prev.find((p) => p.key === key);
      if (ex) return prev.map((p) => (p.key === key ? { ...p, qty: Math.min(p.maxQty, p.qty + l.qty) } : p));
      return [...prev, { ...l, key, qty: Math.min(l.maxQty, l.qty) }];
    });
    setDrawerOpen(true);
  }, []);
  const setQty = useCallback((key: string, qty: number) =>
    setLines((prev) => prev.map((p) => (p.key === key ? { ...p, qty: Math.max(1, Math.min(p.maxQty, qty)) } : p))), []);
  const remove = useCallback((key: string) => setLines((prev) => prev.filter((p) => p.key !== key)), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<Ctx>(() => ({
    locale, dict, settings, lines,
    count: lines.reduce((s, l) => s + l.qty, 0),
    subtotalMinor: lines.reduce((s, l) => s + l.qty * l.priceMinor, 0),
    add, setQty, remove, clear, drawerOpen, setDrawerOpen,
  }), [locale, dict, settings, lines, add, setQty, remove, clear, drawerOpen]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore outside StoreProvider");
  return c;
}
