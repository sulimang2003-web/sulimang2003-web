import type { ReactNode } from "react";

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`bg-white/80 border border-bone p-5 md:p-6 ${className}`}>{children}</div>
);

export const PageTitle = ({ title, action }: { title: string; action?: ReactNode }) => (
  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
    <h1 className="text-2xl font-medium">{title}</h1>
    {action}
  </div>
);

export const statusLabel: Record<string, string> = {
  pending: "بانتظار التأكيد", confirmed: "مؤكد", preparing: "قيد التجهيز", shipped: "تم الشحن",
  delivered: "تم التسليم", cancelled: "ملغي", returned: "مُرتجع",
};
export const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900", confirmed: "bg-sky-100 text-sky-900", preparing: "bg-indigo-100 text-indigo-900",
  shipped: "bg-violet-100 text-violet-900", delivered: "bg-emerald-100 text-emerald-900", cancelled: "bg-stone/30 text-graphite",
  returned: "bg-rose-100 text-rose-900",
};
export const payLabel: Record<string, string> = { unpaid: "غير مدفوع", paid: "مدفوع", refunded: "مُسترد" };

export const Badge = ({ status }: { status: string }) => (
  <span className={`inline-block px-2 py-0.5 text-xs ${statusColor[status] ?? "bg-bone"}`}>{statusLabel[status] ?? status}</span>
);
