"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/admin", "الرئيسية"], ["/admin/orders", "الطلبات"], ["/admin/products", "المنتجات"],
  ["/admin/categories", "التصنيفات"], ["/admin/coupons", "الكوبونات"], ["/admin/settings", "الشحن والإعدادات"],
] as const;

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 text-sm md:flex-col md:px-3 md:pb-0">
      {items.map(([href, label]) => {
        const active = href === "/admin" ? path === href : path.startsWith(href);
        return (
          <Link key={href} href={href} className={`shrink-0 whitespace-nowrap px-3 py-2.5 transition-colors ${active ? "bg-ivory/10 text-gold" : "text-ivory/70 hover:text-ivory"}`}>{label}</Link>
        );
      })}
    </nav>
  );
}
