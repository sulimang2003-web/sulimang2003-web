import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { repo } from "@/lib/data";
import { logout } from "../actions";
import { AdminNav } from "@/components/admin/nav";

export default async function Panel({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const mode = repo().mode;
  return (
    <div className="md:grid md:min-h-dvh md:grid-cols-[240px_1fr]">
      <aside className="bg-ink text-ivory md:sticky md:top-0 md:h-dvh md:flex md:flex-col">
        <div className="flex items-center justify-between px-5 py-4 md:block md:py-7">
          <Link href="/admin" className="font-display text-xl tracking-[0.25em]" dir="ltr">YUSUF SCORE</Link>
          <p className="hidden text-[0.65rem] text-gold md:mt-1 md:block">لوحة الإدارة</p>
        </div>
        <AdminNav />
        <div className="hidden border-t border-ivory/10 p-5 text-xs text-ivory/50 md:mt-auto md:block">
          <p dir="ltr" className="truncate">{admin.email}</p>
          <p className="mt-1">{mode === "demo" ? "⚠️ وضع تجريبي (ملف محلي)" : "Supabase"}</p>
          <div className="mt-3 flex gap-4">
            <Link href="/" target="_blank" className="underline">المتجر ↗</Link>
            <form action={logout}><button className="underline">خروج</button></form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 p-4 md:p-8">{children}</main>
    </div>
  );
}
