import { NextResponse, type NextRequest } from "next/server";
import { repo } from "@/lib/data";

/** Public read-only catalogue API — consumed by the future iOS/Android app. */
export async function GET(req: NextRequest) {
  const s = req.nextUrl.searchParams;
  const products = await repo().listProducts({
    q: s.get("q")?.slice(0, 80) || undefined,
    category: s.get("category") || undefined,
    tag: (["new", "bestseller", "featured"] as const).find((x) => x === s.get("tag")),
    sort: (["newest", "price-asc", "price-desc"] as const).find((x) => x === s.get("sort")),
    limit: Math.min(100, Number(s.get("limit")) || 50),
  });
  return NextResponse.json({ data: products }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
