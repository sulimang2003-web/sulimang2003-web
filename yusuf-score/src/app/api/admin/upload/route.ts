import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { getAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/data";
import { jsonError, sameOrigin } from "@/lib/http";

const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };
const MAX = 5 * 1024 * 1024;

/** Verifies the file really is the image type it claims (magic bytes), not just the header. */
function sniff(b: Uint8Array): string | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "image/webp";
  if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) return "image/avif";
  return null;
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return jsonError("forbidden", 403);
  if (!(await getAdmin())) return jsonError("unauthorized", 401);

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File).slice(0, 10);
  if (!files.length) return jsonError("no_files", 400);

  const urls: string[] = [];
  for (const f of files) {
    if (f.size > MAX) return jsonError("too_large", 413);
    const buf = new Uint8Array(await f.arrayBuffer());
    const type = sniff(buf);
    if (!type || !TYPES[type]) return jsonError("unsupported_type", 415);
    const name = `${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${TYPES[type]}`;

    if (isSupabaseConfigured()) {
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
      const bucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";
      const { error } = await sb.storage.from(bucket).upload(name, buf, { contentType: type, cacheControl: "31536000" });
      if (error) return jsonError("upload_failed", 500);
      urls.push(sb.storage.from(bucket).getPublicUrl(name).data.publicUrl);
    } else {
      // Demo mode: local disk under .data/uploads, served by /api/media (not for serverless hosts).
      await mkdir(join(process.cwd(), ".data", "uploads", name.split("/")[0]), { recursive: true });
      await writeFile(join(process.cwd(), ".data", "uploads", name), buf);
      urls.push(`/api/media/${name}`);
    }
  }
  return NextResponse.json({ urls });
}
