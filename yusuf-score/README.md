# YUSUF SCORE — متجر أزياء رجالية فاخر (Next.js + Supabase)

متجر إلكتروني ثنائي اللغة (العربية RTL / التركية LTR) مع لوحة إدارة، طلب عبر واتساب، وتطبيق ويب PWA.

| | |
|---|---|
| Framework | Next.js 16.4 (App Router, Turbopack, Server Actions) + React 19.3 |
| Language | TypeScript 5.9 (strict) |
| Styling | Tailwind CSS 4.3 (design tokens in `src/app/globals.css`) |
| Data | Supabase (PostgreSQL + RLS + Storage) — أو **وضع تجريبي** بملف JSON محلي بدون أي حساب |
| Validation | Zod 4 |
| PWA | Web manifest + Service Worker + زر تثبيت |

## التشغيل المحلي (٣ دقائق، بدون أي حسابات)

```bash
cd yusuf-score
npm install
cp .env.example .env.local        # ثم غيّر SESSION_SECRET و ADMIN_PASSWORD
npm run dev                       # http://localhost:3000
```
- المتجر: `http://localhost:3000` (يحوّل إلى `/ar` أو `/tr`)
- الإدارة: `http://localhost:3000/admin` — الدخول بـ `ADMIN_EMAIL` / `ADMIN_PASSWORD` من `.env.local`
- إعادة البيانات التجريبية: `npm run demo:reset`
- كوبونات تجريبية: `WELCOME10` (10% فوق 1,500 ₺) · `INSTA250` (250 ₺ فوق 3,000 ₺)

> لاختبار الـ PWA والـ Service Worker استخدم `npm run build && npm start` (لا يُسجَّل في وضع التطوير).

## التشغيل مع Supabase (الإنتاج)

1. أنشئ مشروعاً في Supabase (يفضَّل منطقة `eu-central-1` Frankfurt — راجع ملاحظة KVKK عن نقل البيانات).
2. نفّذ `supabase/migrations/0001_init.sql` ثم `supabase/seed.sql` (SQL Editor أو `supabase db push`).
3. Authentication → أنشئ مستخدم المالك، ثم:
   `insert into public.admins (user_id, role) select id, 'owner' from auth.users where email = 'OWNER_EMAIL';`
4. أضف في `.env.local` / متغيرات الاستضافة: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
   بمجرد وجودها يتحول التطبيق تلقائياً من الوضع التجريبي إلى Supabase.

## النشر (Vercel موصى به)
1. استورد المستودع، واضبط **Root Directory = `yusuf-score`**.
2. أضف متغيرات البيئة (انظر `.env.example`) — `SESSION_SECRET` و Supabase إلزامية في الإنتاج
   (الوضع التجريبي لا يحفظ البيانات على الاستضافات السحابية ذات نظام الملفات للقراءة فقط).
3. اربط النطاق واضبط `NEXT_PUBLIC_SITE_URL=https://your-domain`.
بدائل: Netlify، أو أي خادم Node ≥ 20.9 (`npm run build && npm start`).

## ما يعمل فعلياً الآن ✅
- الواجهة كاملة بالعربية والتركية مع تبديل الاتجاه RTL/LTR، والعملة ₺ TRY.
- الرئيسية، المتجر (فلترة فئة/مقاس/لون/سعر + ترتيب + بحث)، المنتج (معرض، مقاس/لون، مخزون لكل مقاس، جدول مقاسات)، السلة، الإتمام.
- إنشاء الطلب على الخادم: **إعادة حساب الأسعار من القاعدة** (لا ثقة بأسعار المتصفح)، تحقق المخزون وخصمه ذرياً، الكوبونات، الشحن حسب المدينة.
- رسائل واتساب جاهزة (منتج واحد / السلة / الطلب المؤكد برقمه)، وزر مراسلة العميل من اللوحة.
- تتبع UTM من إنستغرام وغيره ← محفوظ في كل طلب وظاهر في الإحصائيات، ومنشئ روابط حملات في اللوحة.
- لوحة إدارة: منتجات (CRUD، رفع صور متعددة مع فحص نوع الملف الحقيقي، ترتيب الصور، مصفوفة مخزون مقاس×لون، خصومات)، تصنيفات، طلبات (حالة/دفع/شحن/تتبع، استرجاع المخزون عند الإلغاء)، كوبونات، إعدادات الشحن والمتجر، إحصائيات (مبيعات 30 يوماً، الأكثر طلباً، مخزون منخفض، مصادر الطلبات).
- PWA: manifest، أيقونات، Service Worker (لا يخزّن API/الإدارة/الإتمام)، صفحة offline، زر تثبيت.
- SEO: metadata، hreflang، sitemap، robots، JSON-LD للمنتجات والأسئلة.
- API عامة: `/api/v1/products`, `/api/v1/products/:slug`, `/api/v1/categories`.

## يحتاج حسابات / مفاتيح / قرارات ⚠️
| البند | المطلوب |
|---|---|
| قاعدة البيانات الإنتاجية | مشروع Supabase + المفاتيح (المخطط و RLS جاهزان ومختبران محلياً على Postgres مضمّن، لم يُطبَّقا على مشروع حي) |
| رقم واتساب | الرقم الحالي `905000000000` وهمي — يُعدَّل من اللوحة ← الإعدادات |
| الصور واللوغو | كل الصور الحالية رسومات **DEMO** مولّدة؛ اللوغو Wordmark مؤقت |
| المنتجات والأسعار والمقاسات | بيانات تجريبية بالكامل |
| الدفع بالبطاقة | عقد مع iyzico/PayTR + مفاتيح — الواجهة `src/lib/payments` جاهزة والتنفيذ TODO |
| Meta Pixel / GA4 | المعرّفات + مراجعة KVKK؛ لا تُحمَّل إلا بعد موافقة الزائر |
| بريد المعاملات، الفوترة الإلكترونية، API الشحن | غير مدمجة (انظر ROADMAP) |
| الامتثال القانوني | انظر `docs/LAUNCH-CHECKLIST-TR.md` — النصوص القانونية مسودات |

## الأمان
- مفتاح `service_role` يُستخدم على الخادم فقط (`server-only`)؛ المتصفح لا يكتب في القاعدة مباشرة.
- RLS: الزائر يقرأ المنتجات النشطة والتصنيفات فقط؛ الطلبات والكوبونات غير مقروءة علناً؛ `place_order` و`restock_order` قابلة للتنفيذ من `service_role` فقط.
- جلسة الإدارة: Cookie موقّعة HMAC‑SHA256، `httpOnly` + `secure` + `sameSite=lax`، مدة 8 ساعات؛ كل صفحة وServer Action وAPI إدارية تتحقق `requireAdmin()` (الـ proxy طبقة إضافية فقط).
- حماية من التخمين (5 محاولات/15 دقيقة)، Rate limit للطلبات والكوبونات، فحص Origin لطلبات POST، تحقق Zod لكل المدخلات، فحص magic bytes للصور (≤5MB)، ترويسات أمان (HSTS, nosniff, X-Frame-Options).
- للنشر متعدد النسخ: استبدل الـ rate limiter الذاكري بـ Redis (Upstash).

## هيكل المشروع
```
src/
  app/(store)/[locale]/   صفحات المتجر (layout يضبط lang/dir)
  app/(admin)/admin/      لوحة الإدارة + actions.ts (Server Actions)
  app/api/                orders · coupons · admin/upload · media · v1 (للتطبيق)
  components/store|admin/ مكونات الواجهة
  i18n/                   config + dictionaries (ar, tr)
  lib/data/               Repository: demo-store (JSON) | supabase-store — نفس الواجهة
  lib/                    auth, session, validation, pricing, whatsapp, payments, content
  proxy.ts                توجيه اللغة + UTM + حماية /admin
supabase/                 migrations + seed
docs/                     BRAND-AND-UX · LAUNCH-CHECKLIST-TR · ROADMAP
```
