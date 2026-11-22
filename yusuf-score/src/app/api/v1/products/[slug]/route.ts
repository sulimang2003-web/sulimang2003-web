import { NextResponse } from "next/server";
import { repo } from "@/lib/data";

export async function GET(_req: Request, ctx: RouteContext<"/api/v1/products/[slug]">) {
  const { slug } = await ctx.params;
  const p = await repo().getProductBySlug(slug);
  if (!p || !p.active) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ data: p });
}
