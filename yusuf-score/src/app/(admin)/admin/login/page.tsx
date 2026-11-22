import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/data";
import { login } from "../actions";
import { ActionForm, Submit } from "@/components/admin/ui";
import { Logo } from "@/components/store/logo";

export default async function Login() {
  if (await getAdmin()) redirect("/admin");
  const demo = !isSupabaseConfigured();
  return (
    <div className="grid min-h-dvh place-items-center bg-ink px-5">
      <div className="w-full max-w-sm bg-paper p-8">
        <div className="mb-8 text-center"><Logo /></div>
        <ActionForm action={login} className="space-y-4">
          <div><label className="label" htmlFor="email">البريد الإلكتروني</label><input id="email" name="email" type="email" required dir="ltr" autoComplete="username" className="field" /></div>
          <div><label className="label" htmlFor="password">كلمة المرور</label><input id="password" name="password" type="password" required dir="ltr" autoComplete="current-password" className="field" /></div>
          <Submit className="btn btn-dark w-full">دخول لوحة الإدارة</Submit>
        </ActionForm>
        {demo && (
          <p className="mt-6 border-s-2 border-gold bg-ivory p-3 text-xs leading-relaxed text-smoke">
            وضع العرض التجريبي: بيانات الدخول من ملف <code dir="ltr">.env.local</code> (ADMIN_EMAIL / ADMIN_PASSWORD).
          </p>
        )}
      </div>
    </div>
  );
}
