import { notFound } from "next/navigation";
import { repo } from "@/lib/data";
import { formatDate, formatTRY } from "@/lib/format";
import { ORDER_STATUSES } from "@/lib/types";
import { waLink } from "@/lib/whatsapp";
import { Badge, Card, PageTitle, payLabel, statusLabel } from "@/components/admin/card";
import { ActionForm, Submit } from "@/components/admin/ui";
import { updateOrder } from "../../../actions";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = repo();
  const [o, settings] = await Promise.all([r.getOrder(id), r.getSettings()]);
  if (!o) notFound();
  const phone = o.customer.phone.replace(/\D/g, "").replace(/^0/, "90");
  const msg = o.locale === "tr"
    ? `Merhaba ${o.customer.name}, ${o.number} numaralı siparişiniz: ${statusLabel[o.status]}.${o.trackingNumber ? ` Kargo takip: ${o.trackingNumber}` : ""}`
    : `مرحباً ${o.customer.name}، حالة طلبك ${o.number}: ${statusLabel[o.status]}.${o.trackingNumber ? ` رقم التتبع: ${o.trackingNumber}` : ""}`;
  return (
    <>
      <PageTitle title={`طلب ${o.number}`} action={<Badge status={o.status} />} />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card>
            <table className="w-full text-sm">
              <thead className="border-b border-bone text-xs text-smoke"><tr><th className="py-2 text-start">المنتج</th><th>المقاس</th><th>اللون</th><th>الكمية</th><th className="text-end">المجموع</th></tr></thead>
              <tbody className="divide-y divide-bone">
                {o.items.map((i, k) => (
                  <tr key={k}><td className="py-3">{i.name}<br /><span className="text-xs text-smoke" dir="ltr">{i.sku}</span></td><td className="text-center">{i.size}</td><td className="text-center">{i.color}</td><td className="text-center">{i.qty}</td><td className="text-end" dir="ltr">{formatTRY(i.qty * i.unitMinor, "ar")}</td></tr>
                ))}
              </tbody>
            </table>
            <dl className="mt-4 space-y-1 border-t border-bone pt-4 text-sm">
              <div className="flex justify-between"><dt>المجموع الفرعي</dt><dd dir="ltr">{formatTRY(o.subtotalMinor, "ar")}</dd></div>
              {o.discountMinor > 0 && <div className="flex justify-between text-sale"><dt>خصم {o.couponCode}</dt><dd dir="ltr">-{formatTRY(o.discountMinor, "ar")}</dd></div>}
              <div className="flex justify-between"><dt>الشحن</dt><dd dir="ltr">{formatTRY(o.shippingMinor, "ar")}</dd></div>
              <div className="flex justify-between text-base font-medium"><dt>الإجمالي</dt><dd dir="ltr">{formatTRY(o.totalMinor, "ar")}</dd></div>
            </dl>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <p className="mb-3 font-medium">العميل</p>
              <p>{o.customer.name}</p>
              <p dir="ltr" className="text-start text-smoke">{o.customer.phone}</p>
              {o.customer.email && <p dir="ltr" className="text-start text-smoke">{o.customer.email}</p>}
              <a href={waLink(phone, msg)} target="_blank" rel="noopener" className="btn btn-wa mt-4 min-h-10 w-full">مراسلة العميل على واتساب</a>
            </Card>
            <Card>
              <p className="mb-3 font-medium">العنوان</p>
              <p>{o.address.line}</p>
              <p>{o.address.district} — {o.address.city} {o.address.postalCode}</p>
              {o.address.notes && <p className="mt-2 text-sm text-smoke">ملاحظة: {o.address.notes}</p>}
              <p className="mt-4 text-xs text-smoke">{formatDate(o.createdAt)} · {o.locale.toUpperCase()} · {o.channel}</p>
              {o.utm?.source && <p className="mt-1 text-xs text-smoke" dir="ltr">utm: {o.utm.source}/{o.utm.medium}/{o.utm.campaign}</p>}
            </Card>
          </div>
        </div>
        <Card className="h-fit">
          <p className="mb-4 font-medium">تحديث الطلب والشحن</p>
          <ActionForm action={updateOrder} className="space-y-4">
            <input type="hidden" name="id" value={o.id} />
            <div><label className="label">الحالة</label><select name="status" defaultValue={o.status} className="field bg-white">{ORDER_STATUSES.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}</select></div>
            <div><label className="label">الدفع</label><select name="paymentStatus" defaultValue={o.paymentStatus} className="field bg-white">{Object.entries(payLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label className="label">شركة الشحن</label><select name="carrier" defaultValue={o.carrier ?? ""} className="field bg-white"><option value="">—</option>{settings.shipping.carriers.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label className="label">رقم التتبع</label><input name="trackingNumber" defaultValue={o.trackingNumber ?? ""} dir="ltr" className="field bg-white" /></div>
            <p className="text-xs text-smoke">الإلغاء أو الإرجاع يعيد الكميات إلى المخزون تلقائياً.</p>
            <Submit className="btn btn-dark w-full">حفظ</Submit>
          </ActionForm>
        </Card>
      </div>
    </>
  );
}
