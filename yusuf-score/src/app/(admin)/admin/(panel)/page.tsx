import Link from "next/link";
import { repo } from "@/lib/data";
import { formatDate, formatTRY } from "@/lib/format";
import { Badge, Card, PageTitle } from "@/components/admin/card";
import { RevenueChart } from "@/components/admin/revenue-chart";

export default async function Dashboard() {
  const r = repo();
  const [s, recent] = await Promise.all([r.stats(), r.listOrders({ limit: 6 })]);
  const kpis = [
    ["إجمالي المبيعات", formatTRY(s.revenueMinor, "ar")],
    ["عدد الطلبات", String(s.ordersTotal)],
    ["بانتظار التأكيد", String(s.ordersPending)],
    ["متوسط قيمة الطلب", formatTRY(s.avgOrderMinor, "ar")],
  ];
  return (
    <>
      <PageTitle title="نظرة عامة" action={<Link href="/admin/products/new" className="btn btn-dark min-h-10">+ منتج جديد</Link>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map(([k, v]) => (
          <Card key={k}><p className="text-xs text-smoke">{k}</p><p className="mt-2 text-2xl font-medium" dir="ltr">{v}</p></Card>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="mb-4 font-medium">الإيرادات اليومية — آخر 30 يوماً</p>
          <RevenueChart data={s.last30} />
        </Card>
        <Card>
          <p className="mb-4 font-medium">مصادر الطلبات (UTM)</p>
          {s.bySource.length === 0 ? <p className="text-sm text-smoke">لا توجد طلبات بعد.</p> : (
            <ul className="space-y-2 text-sm">
              {s.bySource.map((x) => (
                <li key={x.source} className="flex justify-between"><span dir="ltr">{x.source}</span><span>{x.orders}</span></li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-xs text-smoke">أنشئ روابط تتبع للحملات من صفحة الإعدادات.</p>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex justify-between"><p className="font-medium">أحدث الطلبات</p><Link href="/admin/orders" className="text-sm underline">الكل</Link></div>
          {recent.length === 0 ? <p className="text-sm text-smoke">لا توجد طلبات بعد. جرّب طلباً من المتجر.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-bone">
                  {recent.map((o) => (
                    <tr key={o.id}>
                      <td className="py-2.5"><Link href={`/admin/orders/${o.id}`} className="underline" dir="ltr">{o.number}</Link></td>
                      <td>{o.customer.name}</td>
                      <td className="text-smoke">{formatDate(o.createdAt)}</td>
                      <td><Badge status={o.status} /></td>
                      <td className="text-end" dir="ltr">{formatTRY(o.totalMinor, "ar")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <Card>
          <p className="mb-4 font-medium">الأكثر طلباً</p>
          {s.topProducts.length === 0 ? <p className="text-sm text-smoke">—</p> : (
            <ol className="space-y-2 text-sm">
              {s.topProducts.map((p, i) => (
                <li key={p.productId} className="flex justify-between gap-2"><span>{i + 1}. {p.name}</span><span className="text-smoke">{p.qty} قطعة</span></li>
              ))}
            </ol>
          )}
          <p className="mb-3 mt-6 font-medium">مخزون منخفض</p>
          <ul className="space-y-1.5 text-sm">
            {s.lowStock.slice(0, 8).map((v) => (
              <li key={`${v.productId}${v.size}${v.color}`} className="flex justify-between gap-2">
                <Link href={`/admin/products/${v.productId}`} className="truncate underline">{v.name}</Link>
                <span className={v.stock === 0 ? "text-sale" : "text-amber-700"}>{v.size}/{v.color}: {v.stock}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
