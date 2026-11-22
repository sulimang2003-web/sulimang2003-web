import { NextResponse } from "next/server";
import { repo } from "@/lib/data";

export async function GET() {
  return NextResponse.json({ data: await repo().listCategories() });
}
