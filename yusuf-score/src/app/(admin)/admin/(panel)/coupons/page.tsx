import { repo } from "@/lib/data";
import { formatTRY } from "@/lib/format";
import { Card, PageTitle } from "@/components/admin/card";
import { ActionForm, ConfirmButton, Submit } from "@/components/admin/ui";
import { deleteCoupon, saveCoupon } from "../../actions";

export default async function Coupons() {
  const coupons = await repo().listCoupons();
  return (
    <>
      <PageTitle title="الكوبونات" />
      <Card className="mb-4">
        <p className="mb-3 font-medium">كوبون جديد</p>
        <ActionForm action={saveCoupon} resetOnSuccess className="grid gap-3 md:grid-cols-4">
          <div><label className="label">الكود</label><input name="code" required dir="ltr" className="field bg-white uppercase" placeholder="INSTA15" /></div>
          <div><label className="label">النوع</label><select name="type" className="field bg-white"><option value="percent">نسبة %</option><option value="fixed">مبلغ ثابت (ل.ت)</option></select></div>
          <div><label className="label">القيمة</label><input name="value" type="number" min={1} required className="field bg-white" /></div>
          <div><label className="label">حد أدنى للسلة (ل.ت)</label><input name="min" type="number" min={0} defaultValue={0} className="field bg-white" /></div>
          <div><label className="label">أقصى عدد استخدام</label><input name="maxUses" type="number" min={1} className="field bg-white" /></div>
          <div><label className="label">يبدأ</label><input name="startsAt" type="date" className="field bg-white" /></div>
          <div><label className="label">ينتهي</label><input name="endsAt" type="date" className="field bg-white" /></div>
          <label className="flex items-center gap-2 pt-6"><input type="checkbox" name="active" defaultChecked className="accent-ink" /> مفعّل</label>
          <div className="md:col-span-4"><Submit>إنشاء الكوبون</Submit></div>
        </ActionForm>
      </Card>
      <Card className="!p-0 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-bone text-xs text-smoke"><tr><th className="p-3 text-start">الكود</th><th className="text-start">الخصم</th><th className="text-start">الحد الأدنى</th><th className="text-start">الاستخدام</th><th className="text-start">الصلاحية</th><th /></tr></thead>
          <tbody className="divide-y divide-bone">
            {coupons.map((c) => (
              <tr key={c.id} className={c.active ? "" : "opacity-50"}>
                <td className="p-3 font-medium" dir="ltr">{c.code}</td>
                <td>{c.type === "percent" ? `${c.value}%` : formatTRY(c.value, "ar")}</td>
                <td>{formatTRY(c.minSubtotalMinor, "ar")}</td>
                <td>{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                <td className="text-xs text-smoke">{c.endsAt ? `حتى ${c.endsAt.slice(0, 10)}` : "مفتوح"}</td>
                <td className="p-3 text-end"><form action={deleteCoupon}><input type="hidden" name="id" value={c.id} /><ConfirmButton message="حذف الكوبون؟">حذف</ConfirmButton></form></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
