"use client";
import { useState } from "react";

/** Builds UTM-tagged links for Instagram bio, stories, ads and WhatsApp broadcasts. */
export function CampaignBuilder({ base }: { base: string }) {
  const [v, setV] = useState({ path: "/ar/shop", source: "instagram", medium: "bio", campaign: "aw26", content: "" });
  const url = new URL(v.path || "/", base);
  url.searchParams.set("utm_source", v.source);
  url.searchParams.set("utm_medium", v.medium);
  url.searchParams.set("utm_campaign", v.campaign);
  if (v.content) url.searchParams.set("utm_content", v.content);
  const f = (k: keyof typeof v, label: string, list?: string[]) => (
    <div>
      <label className="label">{label}</label>
      <input dir="ltr" list={list ? `l-${k}` : undefined} className="field bg-white" value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value.replace(/[^\w\-/?=&]/g, "") })} />
      {list && <datalist id={`l-${k}`}>{list.map((x) => <option key={x} value={x} />)}</datalist>}
    </div>
  );
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-5">
        {f("path", "الصفحة", ["/ar", "/tr", "/ar/shop", "/tr/shop", "/ar/shop?tag=new"])}
        {f("source", "المصدر", ["instagram", "whatsapp", "tiktok", "facebook", "google"])}
        {f("medium", "الوسيلة", ["bio", "story", "reel", "post", "ad", "broadcast", "dm"])}
        {f("campaign", "الحملة")}
        {f("content", "المحتوى (اختياري)")}
      </div>
      <div className="flex gap-2">
        <input readOnly dir="ltr" value={url.toString()} className="field bg-ivory text-xs" onFocus={(e) => e.currentTarget.select()} />
        <button type="button" className="btn btn-outline min-h-12 px-4" onClick={() => navigator.clipboard.writeText(url.toString())}>نسخ</button>
      </div>
    </div>
  );
}
