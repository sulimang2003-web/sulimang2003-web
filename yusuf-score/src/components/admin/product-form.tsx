"use client";
import Image from "next/image";
import { startTransition, useActionState, useMemo, useState } from "react";
import type { Category, Product, ProductColor, ProductTag } from "@/lib/types";
import { saveProduct } from "@/app/(admin)/admin/actions";
import { slugify } from "@/lib/format";

const blank: Product = {
  id: "", slug: "", sku: "", name: { ar: "", tr: "" }, description: { ar: "", tr: "" }, material: { ar: "", tr: "" },
  categoryId: null, priceMinor: 0, compareAtMinor: null, images: [], colors: [], sizes: ["S", "M", "L", "XL", "XXL"],
  variants: [], tags: ["new"], active: true, createdAt: "", updatedAt: "",
};

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const [p, setP] = useState<Product>(product ?? blank);
  const [state, action, pending] = useActionState(saveProduct, null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [newColor, setNewColor] = useState<ProductColor>({ code: "", hex: "#151515", name: { ar: "", tr: "" } });
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((x) => ({ ...x, [k]: v }));

  const stock = (size: string, color: string) => p.variants.find((v) => v.size === size && v.color === color)?.stock ?? 0;
  const setStock = (size: string, color: string, n: number) =>
    setP((x) => {
      const others = x.variants.filter((v) => !(v.size === size && v.color === color));
      return { ...x, variants: [...others, { size, color, stock: Math.max(0, Math.floor(n) || 0) }] };
    });

  // Variants always cover the full size × colour matrix
  const payload = useMemo(() => {
    const variants = p.colors.flatMap((c) => p.sizes.map((s) => ({ size: s, color: c.code, stock: stock(s, c.code) })));
    return JSON.stringify({ ...p, variants, material: p.material?.ar || p.material?.tr ? p.material : undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true); setUploadErr("");
    const fd = new FormData();
    [...files].forEach((f) => fd.append("files", f));
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const j = await res.json();
    setUploading(false);
    if (!res.ok) return setUploadErr(j.error === "too_large" ? "الحد الأقصى ٥ ميغابايت للصورة" : "صيغة غير مدعومة (JPG/PNG/WebP/AVIF)");
    set("images", [...p.images, ...j.urls]);
  }
  const move = (i: number, d: number) => {
    const a = [...p.images]; const j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]]; set("images", a);
  };
  const toggleTag = (tag: ProductTag) => set("tags", p.tags.includes(tag) ? p.tags.filter((t) => t !== tag) : [...p.tags, tag]);

  const box = "bg-white/80 border border-bone p-5 md:p-6 space-y-4";
  return (
    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }} className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <input type="hidden" name="payload" value={payload} />
      <div className="space-y-4">
        <section className={box}>
          <p className="font-medium">المعلومات الأساسية</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className="label">الاسم بالعربية *</label><input required className="field bg-white" value={p.name.ar} onChange={(e) => set("name", { ...p.name, ar: e.target.value })} /></div>
            <div><label className="label">الاسم بالتركية *</label><input required dir="ltr" className="field bg-white" value={p.name.tr} onChange={(e) => { set("name", { ...p.name, tr: e.target.value }); if (!product) set("slug", slugify(e.target.value)); }} /></div>
            <div><label className="label">الوصف بالعربية</label><textarea rows={4} className="field bg-white" value={p.description.ar} onChange={(e) => set("description", { ...p.description, ar: e.target.value })} /></div>
            <div><label className="label">الوصف بالتركية</label><textarea rows={4} dir="ltr" className="field bg-white" value={p.description.tr} onChange={(e) => set("description", { ...p.description, tr: e.target.value })} /></div>
            <div><label className="label">الخامة والعناية (عربي)</label><input className="field bg-white" value={p.material?.ar ?? ""} onChange={(e) => set("material", { ar: e.target.value, tr: p.material?.tr ?? "" })} /></div>
            <div><label className="label">الخامة والعناية (تركي)</label><input dir="ltr" className="field bg-white" value={p.material?.tr ?? ""} onChange={(e) => set("material", { ar: p.material?.ar ?? "", tr: e.target.value })} /></div>
          </div>
        </section>

        <section className={box}>
          <div className="flex items-center justify-between">
            <p className="font-medium">الصور ({p.images.length})</p>
            <label className="btn btn-outline min-h-9 cursor-pointer px-4 text-xs">
              {uploading ? "جاري الرفع..." : "+ رفع صور"}
              <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => upload(e.target.files)} />
            </label>
          </div>
          {uploadErr && <p className="text-sm text-sale">{uploadErr}</p>}
          <div className="grid grid-cols-3 gap-3 md:grid-cols-5">
            {p.images.map((src, i) => (
              <div key={src + i} className="group relative aspect-[4/5] bg-bone">
                <Image src={src} alt="" fill sizes="140px" className="object-cover" />
                {i === 0 && <span className="absolute top-1 start-1 bg-ink px-1.5 text-[0.6rem] text-ivory">الرئيسية</span>}
                <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/70 text-xs text-ivory">
                  <button type="button" className="px-2 py-1" onClick={() => move(i, -1)}>→</button>
                  <button type="button" className="px-2 py-1" onClick={() => set("images", p.images.filter((_, j) => j !== i))}>حذف</button>
                  <button type="button" className="px-2 py-1" onClick={() => move(i, 1)}>←</button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-smoke">يُفضّل صور ٤:٥ بدقة ١٦٠٠×٢٠٠٠ بخلفية موحّدة. الصورة الأولى هي الرئيسية.</p>
        </section>

        <section className={box}>
          <p className="font-medium">المقاسات والألوان والمخزون</p>
          <div>
            <label className="label">المقاسات (مفصولة بفاصلة)</label>
            <input dir="ltr" className="field bg-white" defaultValue={p.sizes.join(", ")}
              onBlur={(e) => set("sizes", [...new Set(e.target.value.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean))].slice(0, 20))} />
          </div>
          <div className="flex flex-wrap gap-2">
            {p.colors.map((c) => (
              <span key={c.code} className="flex items-center gap-2 border border-bone bg-white px-2 py-1 text-sm">
                <span className="h-4 w-4 rounded-full ring-1 ring-stone/40" style={{ background: c.hex }} />{c.name.ar} / {c.name.tr}
                <button type="button" className="text-sale" onClick={() => set("colors", p.colors.filter((x) => x.code !== c.code))}>×</button>
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-[60px_1fr_1fr_1fr_auto]">
            <input type="color" value={newColor.hex} onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })} className="h-12 w-full" aria-label="hex" />
            <input placeholder="اسم اللون بالعربية" className="field bg-white" value={newColor.name.ar} onChange={(e) => setNewColor({ ...newColor, name: { ...newColor.name, ar: e.target.value } })} />
            <input placeholder="Renk adı (TR)" dir="ltr" className="field bg-white" value={newColor.name.tr} onChange={(e) => setNewColor({ ...newColor, name: { ...newColor.name, tr: e.target.value }, code: slugify(e.target.value) })} />
            <input placeholder="code" dir="ltr" className="field bg-white" value={newColor.code} onChange={(e) => setNewColor({ ...newColor, code: slugify(e.target.value) })} />
            <button type="button" className="btn btn-outline min-h-12 px-4" disabled={!newColor.code || !newColor.name.ar || !newColor.name.tr || p.colors.some((c) => c.code === newColor.code)}
              onClick={() => { set("colors", [...p.colors, newColor]); setNewColor({ code: "", hex: "#151515", name: { ar: "", tr: "" } }); }}>+ لون</button>
          </div>
          {p.colors.length > 0 && p.sizes.length > 0 && (
            <div className="overflow-x-auto">
              <table className="text-sm">
                <thead><tr><th className="p-2 text-start text-xs text-smoke">اللون \ المقاس</th>{p.sizes.map((s) => <th key={s} className="p-2 text-xs">{s}</th>)}</tr></thead>
                <tbody>
                  {p.colors.map((c) => (
                    <tr key={c.code}>
                      <td className="p-2">{c.name.ar}</td>
                      {p.sizes.map((s) => (
                        <td key={s} className="p-1"><input type="number" min={0} inputMode="numeric" className="field w-20 bg-white !min-h-10 !p-2 text-center" value={stock(s, c.code)} onChange={(e) => setStock(s, c.code, Number(e.target.value))} /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <div className="space-y-4">
        <section className={box}>
          <label className="flex items-center justify-between"><span className="font-medium">منشور في المتجر</span><input type="checkbox" checked={p.active} onChange={(e) => set("active", e.target.checked)} className="h-5 w-5 accent-ink" /></label>
          <div><label className="label">التصنيف</label>
            <select className="field bg-white" value={p.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value || null)}>
              <option value="">—</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name.ar}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {([["new", "جديد"], ["bestseller", "الأكثر مبيعاً"], ["featured", "مميز (إنستغرام)"]] as const).map(([tag, l]) => (
              <button type="button" key={tag} className="chip" aria-pressed={p.tags.includes(tag)} onClick={() => toggleTag(tag)}>{l}</button>
            ))}
          </div>
        </section>
        <section className={box}>
          <p className="font-medium">السعر (ل.ت شامل الضريبة)</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">السعر *</label><input required type="number" min={0} step="0.01" dir="ltr" className="field bg-white" value={p.priceMinor / 100 || ""} onChange={(e) => set("priceMinor", Math.round(Number(e.target.value) * 100))} /></div>
            <div><label className="label">السعر قبل الخصم</label><input type="number" min={0} step="0.01" dir="ltr" className="field bg-white" value={p.compareAtMinor ? p.compareAtMinor / 100 : ""} onChange={(e) => set("compareAtMinor", e.target.value ? Math.round(Number(e.target.value) * 100) : null)} /></div>
          </div>
        </section>
        <section className={box}>
          <div><label className="label">كود المنتج (SKU) *</label><input required dir="ltr" className="field bg-white" value={p.sku} onChange={(e) => set("sku", e.target.value.toUpperCase())} /></div>
          <div><label className="label">الرابط (slug) *</label><input required dir="ltr" pattern="[a-z0-9-]+" className="field bg-white" value={p.slug} onChange={(e) => set("slug", slugify(e.target.value))} /></div>
        </section>
        <button disabled={pending} className="btn btn-dark w-full">{pending ? "جاري الحفظ..." : "حفظ المنتج"}</button>
        {state?.error && <p className="text-sm text-sale">{state.error}</p>}
        {state?.ok && <p className="text-sm text-emerald-700">✓ تم الحفظ</p>}
      </div>
    </form>
  );
}
