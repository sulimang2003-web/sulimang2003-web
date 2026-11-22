// ⚠️ DEMO DATA — placeholder products, prices and stock. Replace with real catalogue.
import type { Category, Coupon, Product, ProductColor, ProductTag, StoreSettings } from "../types";

const C: Record<string, ProductColor> = {
  black: { code: "black", hex: "#151515", name: { ar: "أسود", tr: "Siyah", en: "Black" } },
  charcoal: { code: "charcoal", hex: "#3A3A3C", name: { ar: "فحمي", tr: "Antrasit", en: "Charcoal" } },
  navy: { code: "navy", hex: "#26324A", name: { ar: "كحلي", tr: "Lacivert", en: "Navy" } },
  ivory: { code: "ivory", hex: "#F1EBDD", name: { ar: "عاجي", tr: "Ekru", en: "Ivory" } },
  sky: { code: "sky", hex: "#C9D6E3", name: { ar: "أزرق سماوي", tr: "Açık Mavi", en: "Sky" } },
  sand: { code: "sand", hex: "#D9C7A7", name: { ar: "رملي", tr: "Kum", en: "Sand" } },
  camel: { code: "camel", hex: "#B48756", name: { ar: "جملي", tr: "Camel", en: "Camel" } },
  stone: { code: "stone", hex: "#C8BBA2", name: { ar: "حجري", tr: "Taş", en: "Stone" } },
  olive: { code: "olive", hex: "#5E6248", name: { ar: "زيتي", tr: "Haki", en: "Olive" } },
};

export const seedCategories: Category[] = [
  { id: "cat-outerwear", slug: "outerwear", name: { ar: "معاطف وجاكيتات", tr: "Dış Giyim", en: "Outerwear" }, image: "/demo/cat-outerwear.svg", sortOrder: 1 },
  { id: "cat-tailoring", slug: "tailoring", name: { ar: "بليزرات وبدلات", tr: "Blazer & Takım", en: "Tailoring" }, image: "/demo/cat-tailoring.svg", sortOrder: 2 },
  { id: "cat-shirts", slug: "shirts", name: { ar: "قمصان", tr: "Gömlekler", en: "Shirts" }, image: "/demo/cat-shirts.svg", sortOrder: 3 },
  { id: "cat-knitwear", slug: "knitwear", name: { ar: "تريكو وكنزات", tr: "Triko", en: "Knitwear" }, image: "/demo/cat-knitwear.svg", sortOrder: 4 },
  { id: "cat-trousers", slug: "trousers", name: { ar: "بناطيل", tr: "Pantolonlar", en: "Trousers" }, image: "/demo/cat-trousers.svg", sortOrder: 5 },
];

const SIZES = ["S", "M", "L", "XL", "XXL"];
const TROUSER_SIZES = ["30", "32", "34", "36", "38"];

function variants(sizes: string[], colors: string[], seed: number) {
  return colors.flatMap((color, ci) =>
    sizes.map((size, si) => ({ size, color, stock: Math.max(0, ((seed * 7 + si * 3 + ci * 5) % 11) - 2) })),
  );
}

type Def = {
  slug: string; sku: string; cat: string; price: number; compare?: number;
  name: [string, string]; desc: [string, string]; material: [string, string];
  colors: string[]; img: string[]; tags: ProductTag[]; sizes?: string[]; daysAgo: number;
};

const defs: Def[] = [
  { slug: "cashmere-blend-overcoat", sku: "YS-CO-101", cat: "cat-outerwear", price: 8900, compare: 10500, name: ["معطف كشمير مزدوج", "Kaşmir Karışımlı Palto"], desc: ["معطف طويل بقصّة مستقيمة من مزيج الصوف والكشمير، بياقة عريضة وبطانة ساتان ناعمة. قطعة أساسية لشتاء أنيق.", "Yün ve kaşmir karışımlı, düz kesim uzun palto. Geniş yaka ve yumuşak saten astar. Şık bir kışın temel parçası."], material: ["٧٠٪ صوف، ٢٠٪ كشمير، ١٠٪ بوليامايد. تنظيف جاف فقط.", "%70 yün, %20 kaşmir, %10 poliamid. Sadece kuru temizleme."], colors: ["camel", "charcoal"], img: ["cashmere-coat-camel", "overcoat-charcoal"], tags: ["featured", "bestseller"], daysAgo: 4 },
  { slug: "tailored-wool-overcoat", sku: "YS-CO-102", cat: "cat-outerwear", price: 7450, name: ["معطف صوف مفصّل", "Yün Klasik Palto"], desc: ["معطف بصفّ أزرار واحد وخطوط نظيفة، مصمم ليُلبس فوق البدلة أو الكنزة.", "Tek sıra düğmeli, temiz hatlı palto. Takım elbise veya triko üzerine giyilmek için tasarlandı."], material: ["٨٠٪ صوف، ٢٠٪ بوليستر.", "%80 yün, %20 polyester."], colors: ["charcoal", "black"], img: ["overcoat-charcoal"], tags: ["new"], daysAgo: 1 },
  { slug: "structured-wool-blazer", sku: "YS-BL-201", cat: "cat-tailoring", price: 5900, name: ["بليزر صوف مُهيكل", "Yapılandırılmış Yün Blazer"], desc: ["بليزر بقصّة Slim مع أكتاف ناعمة الهيكلة، مناسب للعمل والمناسبات.", "Hafif yapılandırılmış omuzlu slim fit blazer. İş ve davetler için ideal."], material: ["٦٥٪ صوف، ٣٥٪ فيسكوز. تنظيف جاف.", "%65 yün, %35 viskon. Kuru temizleme."], colors: ["charcoal", "navy"], img: ["wool-blazer-charcoal", "wool-blazer-navy"], tags: ["bestseller", "featured"], daysAgo: 12 },
  { slug: "double-breasted-navy-blazer", sku: "YS-BL-202", cat: "cat-tailoring", price: 6450, compare: 7200, name: ["بليزر كحلي مزدوج الصدر", "Kruvaze Lacivert Blazer"], desc: ["بليزر كلاسيكي مزدوج الصدر بأزرار داكنة، لإطلالة رسمية واثقة.", "Koyu düğmeli klasik kruvaze blazer; kendinden emin resmi bir görünüm."], material: ["٧٠٪ صوف، ٣٠٪ بوليستر.", "%70 yün, %30 polyester."], colors: ["navy"], img: ["wool-blazer-navy"], tags: ["new"], daysAgo: 2 },
  { slug: "oxford-cotton-shirt", sku: "YS-SH-301", cat: "cat-shirts", price: 1450, name: ["قميص أكسفورد قطني", "Pamuk Oxford Gömlek"], desc: ["قميص أكسفورد بياقة بأزرار وقصّة Regular، من قطن ممشّط ناعم يدوم طويلاً.", "Düğmeli yaka, regular fit; uzun ömürlü yumuşak penye pamuktan Oxford gömlek."], material: ["١٠٠٪ قطن. غسيل ٣٠°.", "%100 pamuk. 30° yıkama."], colors: ["ivory", "sky"], img: ["oxford-shirt-ivory", "oxford-shirt-sky"], tags: ["bestseller"], daysAgo: 20 },
  { slug: "linen-resort-shirt", sku: "YS-SH-302", cat: "cat-shirts", price: 1650, name: ["قميص كتان مريح", "Keten Rahat Gömlek"], desc: ["قميص من الكتان الطبيعي بلمسة مغسولة، خفيف ومثالي للأيام الدافئة.", "Yıkanmış dokulu doğal keten gömlek; hafif ve sıcak günler için ideal."], material: ["١٠٠٪ كتان.", "%100 keten."], colors: ["sand", "ivory"], img: ["linen-shirt-sand", "oxford-shirt-ivory"], tags: ["new"], daysAgo: 3 },
  { slug: "poplin-dress-shirt", sku: "YS-SH-303", cat: "cat-shirts", price: 1350, name: ["قميص بوبلين رسمي", "Poplin Klasik Gömlek"], desc: ["قميص رسمي بقصّة Slim من قماش البوبلين الناعم، سهل الكي.", "Kolay ütülenen yumuşak poplin kumaştan slim fit klasik gömlek."], material: ["٩٧٪ قطن، ٣٪ إيلاستين.", "%97 pamuk, %3 elastan."], colors: ["ivory", "sky"], img: ["oxford-shirt-sky", "oxford-shirt-ivory"], tags: [], daysAgo: 30 },
  { slug: "merino-crew-knit", sku: "YS-KN-401", cat: "cat-knitwear", price: 2450, name: ["كنزة ميرينو", "Merino Bisiklet Yaka Triko"], desc: ["كنزة بياقة دائرية من صوف الميرينو الناعم، دافئة وخفيفة في آن.", "Yumuşak merino yünden bisiklet yaka triko; hem sıcak hem hafif."], material: ["١٠٠٪ صوف ميرينو. غسيل يدوي.", "%100 merino yünü. Elde yıkama."], colors: ["camel", "black"], img: ["merino-knit-camel", "merino-knit-black"], tags: ["bestseller", "featured"], daysAgo: 8 },
  { slug: "ribbed-turtleneck", sku: "YS-KN-402", cat: "cat-knitwear", price: 2150, name: ["كنزة برقبة عالية", "Fitilli Balıkçı Yaka"], desc: ["كنزة برقبة عالية بنسيج مضلّع، قطعة أساسية تحت البليزر أو المعطف.", "Fitilli dokulu balıkçı yaka; blazer veya palto altında temel parça."], material: ["٥٠٪ صوف، ٥٠٪ أكريليك.", "%50 yün, %50 akrilik."], colors: ["ivory", "black"], img: ["turtleneck-ivory", "merino-knit-black"], tags: ["new"], daysAgo: 1 },
  { slug: "knitted-polo", sku: "YS-KN-403", cat: "cat-knitwear", price: 1850, name: ["بولو تريكو", "Triko Polo"], desc: ["بولو منسوج بأزرار مخفية وقصّة مريحة، لإطلالة Smart Casual.", "Gizli düğmeli, rahat kesim triko polo; smart casual görünüm için."], material: ["١٠٠٪ قطن.", "%100 pamuk."], colors: ["ivory", "olive"], img: ["knit-polo-ivory", "knit-polo-olive"], tags: ["bestseller"], daysAgo: 15 },
  { slug: "pleated-wool-trousers", sku: "YS-TR-501", cat: "cat-trousers", price: 1950, name: ["بنطال صوف بكسرات", "Pileli Yün Pantolon"], desc: ["بنطال بكسرة أمامية وقصّة مستقيمة مستدقّة، يكمل الإطلالة الرسمية.", "Önden pileli, düz-daralan kesim; resmi görünümü tamamlar."], material: ["٦٠٪ صوف، ٤٠٪ بوليستر.", "%60 yün, %40 polyester."], colors: ["black", "charcoal"], img: ["pleated-trousers-black"], tags: ["featured"], sizes: TROUSER_SIZES, daysAgo: 10 },
  { slug: "stretch-cotton-chino", sku: "YS-TR-502", cat: "cat-trousers", price: 1450, compare: 1750, name: ["بنطال تشينو قطني", "Streç Pamuk Chino"], desc: ["تشينو بقصّة Slim مع لمسة مرونة لراحة طوال اليوم.", "Gün boyu konfor için hafif esnek slim fit chino."], material: ["٩٨٪ قطن، ٢٪ إيلاستين.", "%98 pamuk, %2 elastan."], colors: ["stone", "navy"], img: ["chino-stone"], tags: ["bestseller"], sizes: TROUSER_SIZES, daysAgo: 25 },
];

const now = Date.now();

export const seedProducts: Product[] = defs.map((d, i) => ({
  id: `prd-${String(i + 1).padStart(3, "0")}`,
  slug: d.slug,
  sku: d.sku,
  name: { ar: d.name[0], tr: d.name[1] },
  description: { ar: d.desc[0], tr: d.desc[1] },
  material: { ar: d.material[0], tr: d.material[1] },
  categoryId: d.cat,
  priceMinor: d.price * 100,
  compareAtMinor: d.compare ? d.compare * 100 : null,
  images: d.img.flatMap((base) => [1, 2, 3].map((n) => `/demo/${base}-${n}.svg`)).slice(0, 4),
  colors: d.colors.map((c) => C[c]),
  sizes: d.sizes ?? SIZES,
  variants: variants(d.sizes ?? SIZES, d.colors, i + 1),
  tags: d.tags,
  active: true,
  createdAt: new Date(now - d.daysAgo * 86400000).toISOString(),
  updatedAt: new Date(now - d.daysAgo * 86400000).toISOString(),
}));

export const seedCoupons: Coupon[] = [
  { id: "cpn-1", code: "WELCOME10", type: "percent", value: 10, minSubtotalMinor: 150000, maxUses: 500, usedCount: 0, startsAt: null, endsAt: null, active: true },
  { id: "cpn-2", code: "INSTA250", type: "fixed", value: 25000, minSubtotalMinor: 300000, maxUses: 200, usedCount: 0, startsAt: null, endsAt: null, active: true },
];

export const seedSettings: StoreSettings = {
  storeName: "YUSUF SCORE",
  whatsappNumber: "905000000000", // ⚠️ placeholder — set the real number in Admin → Settings
  instagramHandle: "yusufscore",
  addressLine: "Fatih, İstanbul, Türkiye",
  email: "info@yusufscore.example",
  pricesIncludeVat: true,
  vatRate: 10, // ⚠️ confirm the applicable KDV rate with your accountant
  shipping: {
    istanbulMinor: 9900,
    turkeyMinor: 14900,
    freeOverMinor: 250000,
    carriers: ["Yurtiçi Kargo", "Aras Kargo", "MNG Kargo", "Kurye (İstanbul)"],
    estimatedDays: { istanbul: "1–2", turkey: "2–4" },
  },
  paymentProvider: "none",
  socials: { mapsUrl: "https://www.google.com/maps/search/?api=1&query=Yusuf+Score+Fatih+Istanbul" },
};
