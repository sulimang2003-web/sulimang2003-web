import { repo } from "@/lib/data";
import { siteUrl } from "@/lib/site";
import { Card, PageTitle } from "@/components/admin/card";
import { ActionForm, Submit } from "@/components/admin/ui";
import { CampaignBuilder } from "@/components/admin/campaign-builder";
import { saveSettings } from "../../actions";
import { paymentProvider } from "@/lib/payments";

export default async function Settings() {
  const s = await repo().getSettings();
  const tl = (m: number | null) => (m == null ? "" : m / 100);
  return (
    <>
      <PageTitle title="الشحن والإعدادات" />
      <ActionForm action={saveSettings} className="space-y-4">
        <Card className="grid gap-4 md:grid-cols-2">
          <p className="font-medium md:col-span-2">بيانات المتجر</p>
          <div><label className="label">اسم المتجر</label><input name="storeName" defaultValue={s.storeName} className="field bg-white" /></div>
          <div><label className="label">رقم واتساب (مع 90 بدون +)</label><input name="whatsappNumber" defaultValue={s.whatsappNumber} dir="ltr" className="field bg-white" /></div>
          <div><label className="label">حساب إنستغرام</label><input name="instagramHandle" defaultValue={s.instagramHandle} dir="ltr" className="field bg-white" /></div>
          <div><label className="label">البريد</label><input name="email" type="email" defaultValue={s.email} dir="ltr" className="field bg-white" /></div>
          <div className="md:col-span-2"><label className="label">العنوان</label><input name="addressLine" defaultValue={s.addressLine} className="field bg-white" /></div>
          <div><label className="label">نسبة KDV المرجعية % (الأسعار شاملة)</label><input name="vatRate" type="number" step="1" defaultValue={s.vatRate} className="field bg-white" /></div>
          <p className="self-end text-xs text-smoke">⚠️ يجب تأكيد نسبة الضريبة المطبقة على كل فئة مع المحاسب (Mali Müşavir).</p>
        </Card>
        <Card className="grid gap-4 md:grid-cols-3">
          <p className="font-medium md:col-span-3">حسابات التواصل الاجتماعي <span className="text-xs text-smoke">(تظهر تحت الشعار أسفل كل صفحة — اترك الحقل فارغاً لإخفائه)</span></p>
          <div><label className="label">TikTok (اسم المستخدم)</label><input name="tiktok" defaultValue={s.socials?.tiktok ?? ""} dir="ltr" className="field bg-white" placeholder="yusufscore" /></div>
          <div><label className="label">Snapchat (اسم المستخدم)</label><input name="snapchat" defaultValue={s.socials?.snapchat ?? ""} dir="ltr" className="field bg-white" /></div>
          <div><label className="label">Facebook (رابط https)</label><input name="facebook" defaultValue={s.socials?.facebook ?? ""} dir="ltr" className="field bg-white" /></div>
          <div><label className="label">YouTube (رابط https)</label><input name="youtube" defaultValue={s.socials?.youtube ?? ""} dir="ltr" className="field bg-white" /></div>
          <div className="md:col-span-2"><label className="label">رابط الموقع على Google Maps</label><input name="mapsUrl" defaultValue={s.socials?.mapsUrl ?? ""} dir="ltr" className="field bg-white" /></div>
        </Card>
        <Card className="grid gap-4 md:grid-cols-3">
          <p className="font-medium md:col-span-3">الشحن</p>
          <div><label className="label">داخل إسطنبول (ل.ت)</label><input name="istanbul" type="number" step="0.01" defaultValue={tl(s.shipping.istanbulMinor)} className="field bg-white" /></div>
          <div><label className="label">باقي تركيا (ل.ت)</label><input name="turkey" type="number" step="0.01" defaultValue={tl(s.shipping.turkeyMinor)} className="field bg-white" /></div>
          <div><label className="label">شحن مجاني فوق (ل.ت، فارغ = لا)</label><input name="freeOver" type="number" step="0.01" defaultValue={tl(s.shipping.freeOverMinor)} className="field bg-white" /></div>
          <div><label className="label">مدة إسطنبول (أيام)</label><input name="daysIst" defaultValue={s.shipping.estimatedDays.istanbul} className="field bg-white" /></div>
          <div><label className="label">مدة تركيا (أيام)</label><input name="daysTr" defaultValue={s.shipping.estimatedDays.turkey} className="field bg-white" /></div>
          <div><label className="label">شركات الشحن (مفصولة بفاصلة)</label><input name="carriers" defaultValue={s.shipping.carriers.join(", ")} className="field bg-white" /></div>
        </Card>
        <Submit>حفظ الإعدادات</Submit>
      </ActionForm>

      <Card className="mt-6">
        <p className="mb-1 font-medium">الدفع الإلكتروني</p>
        <p className="text-sm text-smoke">المزود الحالي: <strong dir="ltr">{paymentProvider().id}</strong>. البنية جاهزة لـ iyzico أو PayTR — يتطلب عقد تاجر ومفاتيح API تُضاف كمتغيرات بيئة على الخادم فقط.</p>
      </Card>

      <Card className="mt-6">
        <p className="mb-1 font-medium">منشئ روابط الحملات (UTM)</p>
        <p className="mb-4 text-sm text-smoke">استخدم رابطاً مختلفاً للبايو، الستوري، الإعلانات ورسائل واتساب — ستظهر المصادر في لوحة الإحصائيات وفي كل طلب.</p>
        <CampaignBuilder base={siteUrl()} />
      </Card>
    </>
  );
}
