# خارطة الطريق

## المرحلة 1 — MVP (منجز في هذا المستودع)
متجر ثنائي اللغة RTL/LTR · كتالوج وفلترة · صفحة منتج بمخزون لكل مقاس/لون · سلة · إتمام الطلب عبر واتساب مع حجز المخزون ·
كوبونات · لوحة إدارة (منتجات/صور/تصنيفات/مخزون/طلبات/شحن/كوبونات/إحصائيات/روابط UTM) · PWA · API v1 للقراءة · مخطط Supabase مع RLS.

## المرحلة 2 — الإطلاق التجاري (2–4 أسابيع)
- ربط Supabase الإنتاجي ونقل البيانات الحقيقية، ورفع صور احترافية.
- دمج مزود الدفع (iyzico / PayTR): `createCheckout` + `verifyCallback` + صفحة نتيجة الدفع.
- بريد معاملات (Resend/Postmark): تأكيد الطلب + نسخة عقد البيع عن بُعد.
- فواتير e-Arşiv عبر مزود معتمد (Paraşüt / Logo / Uyumsoft…) API.
- ربط شركة الشحن (Yurtiçi/Aras/MNG API) لإنشاء البوليصة ورقم التتبع آلياً.
- Rate limiting موزّع (Upstash Redis) ومراقبة أخطاء (Sentry).

## المرحلة 3 — النمو
- Instagram Graph API لعرض آخر المنشورات تلقائياً + Instagram Shopping / Meta Catalog feed (`/api/v1/feed`).
- Meta Conversions API (server-side) + GA4 e-commerce events.
- حسابات العملاء (Supabase Auth: OTP عبر الهاتف)، سجل الطلبات، قائمة المفضلة، تنبيه "عاد للمخزون".
- اللغة الإنجليزية (إضافة `en` في `src/i18n/config.ts` + قاموس `en.ts`؛ الحقول `en` موجودة مسبقاً في المنتجات).
- WhatsApp Cloud API: إشعارات حالة الطلب التلقائية بقوالب معتمدة.
- صلاحيات متعددة للموظفين (`admins.role = staff`) وسجل تدقيق.

## المرحلة 4 — تطبيق iOS / Android
- **التوصية**: React Native (Expo) يستهلك نفس `/api/v1` ونفس Supabase (RLS جاهزة للقراءة العامة).
- الواجهات المطلوبة إضافتها: `POST /api/v1/orders` (نفس منطق `/api/orders`)، مصادقة العملاء، Push Notifications (Expo/FCM).
- بديل أسرع: تغليف الـ PWA عبر Capacitor للنشر في المتاجر مع إشعارات أصلية.
