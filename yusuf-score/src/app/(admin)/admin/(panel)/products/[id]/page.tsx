import Link from "next/link";
import { notFound } from "next/navigation";
import { repo } from "@/lib/data";
import { PageTitle } from "@/components/admin/card";
import { ProductForm } from "@/components/admin/product-form";
import { ConfirmButton } from "@/components/admin/ui";
import { deleteProduct } from "../../../actions";

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const r = repo();
  const [p, cats] = await Promise.all([r.getProductById(id), r.listCategories()]);
  if (!p) notFound();
  const saved = (await searchParams).saved;
  return (
    <>
      <PageTitle title={p.name.ar} action={
        <div className="flex items-center gap-4">
          <Link href={`/ar/product/${p.slug}`} target="_blank" className="text-sm underline">معاينة ↗</Link>
          <form action={deleteProduct}><input type="hidden" name="id" value={p.id} /><ConfirmButton message="حذف المنتج نهائياً؟">حذف</ConfirmButton></form>
        </div>
      } />
      {saved && <p className="mb-4 bg-emerald-50 p-3 text-sm text-emerald-800">✓ تم إنشاء المنتج</p>}
      <ProductForm product={p} categories={cats} />
    </>
  );
}
