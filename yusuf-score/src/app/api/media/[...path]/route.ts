import { readFile } from "node:fs/promises";
import { join, normalize } from "node:path";

const MIME: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif" };

/** Demo-mode media server for admin uploads. In production, images are served from Supabase Storage. */
export async function GET(_req: Request, ctx: RouteContext<"/api/media/[...path]">) {
  const { path } = await ctx.params;
  const rel = normalize(path.join("/"));
  if (rel.startsWith("..") || !/^[\w-]+\/[\w-]+\.(jpg|png|webp|avif)$/.test(rel)) return new Response("Not found", { status: 404 });
  try {
    const buf = await readFile(join(process.cwd(), ".data", "uploads", rel));
    return new Response(buf, {
      headers: { "Content-Type": MIME[rel.split(".").pop()!], "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
