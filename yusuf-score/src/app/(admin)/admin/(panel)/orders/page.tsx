import Link from "next/link";
import { repo } from "@/lib/data";
import { formatDate, formatTRY } from "@/lib/format";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";
import { Badge, Card, PageTitle, payLabel, statusLabel } from "@/components/admin/card";

export default async function Orders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const sp = await searchParams;
  const status = ORDER_STATUSES.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : undefined;
  const orders = await repo().listOrders({ status, q: sp.q?.slice(0, 60) });
  return (
    <>
      <PageTitle title={`الطلبات (${orders.length})`} />
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        <Link href="/admin/orders" className="chip shrink-0 bg-white" data-active={!status}>الكل</Link>
        {ORDER_STATUSES.map((s) => <Link key={s} href={`/admin/orders?status=${s}`} className="chip shrink-0 whitespace-nowrap bg-white" data-active={status === s}>{statusLabel[s]}</Link>)}
      </div>
      <form className="mb-4">{status && <input type="hidden" name="status" value={status} />}<input name="q" defaultValue={sp.q} placeholder="رقم الطلب، الاسم أو الهاتف" className="field max-w-sm bg-white" /></form>
      <Card className="!p-0 overflow-x-auto">
        {orders.length === 0 ? <p className="p-6 text-sm text-smoke">لا توجد طلبات.</p> : (
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-bone text-xs text-smoke"><tr>
              <th className="p-3 text-start">الطلب</th><th className="text-start">العميل</th><th className="text-start">المدينة</th><th className="text-start">التاريخ</th><th className="text-start">الحالة</th><th className="text-start">الدفع</th><th className="p-3 text-end">الإجمالي</th>
            </tr></thead>
            <tbody className="divide-y divide-bone">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-ivory/60">
                  <td className="p-3"><Link href={`/admin/orders/${o.id}`} className="font-medium underline" dir="ltr">{o.number}</Link><span className="ms-2 text-xs text-smoke">{o.channel === "whatsapp" ? "واتساب" : "أونلاين"}</span></td>
                  <td>{o.customer.name}<br /><span className="text-xs text-smoke" dir="ltr">{o.customer.phone}</span></td>
                  <td>{o.address.city}</td>
                  <td className="text-smoke">{formatDate(o.createdAt)}</td>
                  <td><Badge status={o.status} /></td>
                  <td className="text-xs">{payLabel[o.paymentStatus]}</td>
                  <td className="p-3 text-end" dir="ltr">{formatTRY(o.totalMinor, "ar")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
