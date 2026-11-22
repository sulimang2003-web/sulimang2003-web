import { repo } from "@/lib/data";
import { Card, PageTitle } from "@/components/admin/card";
import { ActionForm, ConfirmButton, Submit } from "@/components/admin/ui";
import { deleteCategory, saveCategory } from "../../actions";
import type { Category } from "@/lib/types";

function CategoryFields({ c }: { c?: Category }) {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_80px_auto] md:items-end">
      {c && <input type="hidden" name="id" value={c.id} />}
      <div><label className="label">الاسم (عربي)</label><input name="name_ar" required defaultValue={c?.name.ar} className="field bg-white" /></div>
      <div><label className="label">الاسم (تركي)</label><input name="name_tr" required dir="ltr" defaultValue={c?.name.tr} className="field bg-white" /></div>
      <div><label className="label">الرابط</label><input name="slug" required dir="ltr" pattern="[a-z0-9-]+" defaultValue={c?.slug} className="field bg-white" /></div>
      <div><label className="label">الترتيب</label><input name="sortOrder" type="number" min={0} defaultValue={c?.sortOrder ?? 0} className="field bg-white" /></div>
      <input type="hidden" name="image" value={c?.image ?? ""} />
      <Submit className="btn btn-dark min-h-12">{c ? "حفظ" : "إضافة"}</Submit>
    </div>
  );
}

export default async function Categories() {
  const cats = await repo().listCategories();
  return (
    <>
      <PageTitle title="التصنيفات" />
      <Card className="mb-4"><p className="mb-3 font-medium">تصنيف جديد</p><ActionForm action={saveCategory} resetOnSuccess><CategoryFields /></ActionForm></Card>
      <div className="space-y-3">
        {cats.map((c) => (
          <Card key={c.id}>
            <ActionForm action={saveCategory}><CategoryFields c={c} /></ActionForm>
            <form action={deleteCategory} className="mt-2"><input type="hidden" name="id" value={c.id} /><ConfirmButton message="حذف التصنيف؟ ستبقى المنتجات بدون تصنيف." className="text-xs text-sale">حذف</ConfirmButton></form>
          </Card>
        ))}
      </div>
    </>
  );
}
