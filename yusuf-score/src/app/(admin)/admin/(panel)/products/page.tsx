import Image from "next/image";
import Link from "next/link";
import { repo } from "@/lib/data";
import { formatTRY, t } from "@/lib/format";
import { Card, PageTitle } from "@/components/admin/card";
import { toggleProduct } from "../../actions";

export default async function Products({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const r = repo();
  const [products, cats] = await Promise.all([r.listProducts({ includeInactive: true, q: q?.slice(0, 80) }), r.listCategories()]);
  return (
    <>
      <PageTitle title={`المنتجات (${products.length})`} action={<Link href="/admin/products/new" className="btn btn-dark min-h-10">+ منتج جديد</Link>} />
      <form className="mb-4"><input name="q" defaultValue={q} placeholder="بحث بالاسم أو الكود..." className="field bg-white max-w-sm" /></form>
      <Card className="!p-0 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b border-bone text-xs text-smoke">
            <tr><th className="p-3 text-start">المنتج</th><th className="text-start">التصنيف</th><th className="text-start">السعر</th><th className="text-start">المخزون</th><th className="text-start">الحالة</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-bone">
            {products.map((p) => {
              const stock = p.variants.reduce((s, v) => s + v.stock, 0);
              return (
                <tr key={p.id} className={p.active ? "" : "opacity-55"}>
                  <td className="p-3">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      <span className="relative h-14 w-11 shrink-0 bg-bone">{p.images[0] && <Image src={p.images[0]} alt="" fill sizes="44px" className="object-cover" />}</span>
                      <span><span className="block font-medium">{t(p.name, "ar")}</span><span className="text-xs text-smoke" dir="ltr">{p.sku}</span></span>
                    </Link>
                  </td>
                  <td>{t(cats.find((c) => c.id === p.categoryId)?.name, "ar") || "—"}</td>
                  <td dir="ltr" className="text-start">{formatTRY(p.priceMinor, "ar")}{p.compareAtMinor ? <span className="ms-2 text-stone line-through">{formatTRY(p.compareAtMinor, "ar")}</span> : null}</td>
                  <td className={stock === 0 ? "text-sale" : stock < 10 ? "text-amber-700" : ""}>{stock}</td>
                  <td>
                    <form action={toggleProduct}><input type="hidden" name="id" value={p.id} /><button className={`px-2 py-0.5 text-xs ${p.active ? "bg-emerald-100 text-emerald-900" : "bg-bone"}`}>{p.active ? "منشور" : "مخفي"}</button></form>
                  </td>
                  <td className="p-3 text-end"><Link href={`/admin/products/${p.id}`} className="underline">تعديل</Link></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}
