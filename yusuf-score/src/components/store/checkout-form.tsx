"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "./store-context";
import { formatTRY, t } from "@/lib/format";
import { shippingFor } from "@/lib/pricing";
import { cartMessage, waLink } from "@/lib/whatsapp";
import { IconWhatsApp } from "../icons";
import { track } from "./analytics";

export function CheckoutForm({ onlinePayment }: { onlinePayment: boolean }) {
  const { lines, dict, locale, subtotalMinor, settings, clear } = useStore();
  const c = dict.checkout;
  const [city, setCity] = useState("İstanbul");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState<{ code: string; minor: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<{ number: string; wa: string } | null>(null);

  const discountMinor = discount?.minor ?? 0;
  const shipping = shippingFor(subtotalMinor - discountMinor, city, settings.shipping);
  const total = subtotalMinor - discountMinor + shipping;

  if (done)
    return (
      <div className="mx-auto max-w-lg py-20 text-center animate-fade-up">
        <p className="eyebrow !text-gold">✦</p>
        <h1 className="heading-display mt-4 text-4xl">{c.successTitle}</h1>
        <p className="mt-4 text-smoke">{c.successText}: <strong dir="ltr" className="text-ink">{done.number}</strong></p>
        <p className="mt-6 text-sm text-smoke">{c.successNext}</p>
        <a href={done.wa} target="_blank" rel="noopener" className="btn btn-wa mt-8"><IconWhatsApp /> {c.openWhatsapp}</a>
        <div className="mt-4"><Link href={`/${locale}/shop`} className="text-sm link-underline">{dict.cart.continue}</Link></div>
      </div>
    );

  if (!lines.length)
    return (
      <div className="py-24 text-center">
        <p className="text-smoke">{dict.cart.empty}</p>
        <Link href={`/${locale}/shop`} className="btn btn-dark mt-8">{dict.cart.continue}</Link>
      </div>
    );

  async function applyCoupon() {
    setCouponMsg("");
    const res = await fetch("/api/coupons/validate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: coupon, subtotalMinor }) });
    const j = await res.json();
    if (j.ok) { setDiscount({ code: coupon.toUpperCase(), minor: j.discountMinor }); setCouponMsg(c.couponApplied); }
    else { setDiscount(null); setCouponMsg("✕"); }
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    const f = new FormData(e.currentTarget);
    const body = {
      locale,
      channel: "whatsapp",
      customer: { name: f.get("name"), phone: f.get("phone"), email: f.get("email") },
      address: { city: f.get("city"), district: f.get("district"), line: f.get("line"), postalCode: f.get("postal"), notes: f.get("notes") },
      items: lines.map((l) => ({ productId: l.productId, size: l.size, color: l.color, qty: l.qty })),
      couponCode: discount?.code,
      consent: f.get("consent") === "on",
    };
    setBusy(true);
    track("InitiateCheckout", { value: total / 100, currency: "TRY", num_items: lines.length });
    try {
      const res = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "error");
      const o = j.order;
      const wa = waLink(
        settings.whatsappNumber,
        cartMessage(dict.whatsapp, locale, o.items, {
          orderNumber: o.number, totalMinor: o.totalMinor, name: o.customer.name,
          address: `${o.address.line}, ${o.address.district}, ${o.address.city}`,
        }),
      );
      track("Lead", { value: o.totalMinor / 100, currency: "TRY" });
      clear();
      setDone({ number: o.number, wa });
      window.scrollTo({ top: 0 });
      setTimeout(() => window.location.assign(wa), 900);
    } catch (e) {
      setErr(e instanceof Error && e.message === "out_of_stock" ? `${dict.product.outOfStock} — ${c.errorGeneric}` : c.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-12 lg:grid-cols-[1fr_400px]">
      <div className="space-y-10">
        <fieldset className="space-y-4">
          <legend className="font-display text-2xl mb-4">{c.contact}</legend>
          <div><label className="label" htmlFor="name">{c.name} *</label><input id="name" name="name" required maxLength={80} autoComplete="name" className="field" /></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div><label className="label" htmlFor="phone">{c.phone} *</label><input id="phone" name="phone" required type="tel" dir="ltr" placeholder="+90 5xx xxx xx xx" autoComplete="tel" className="field" /></div>
            <div><label className="label" htmlFor="email">{c.email}</label><input id="email" name="email" type="email" dir="ltr" autoComplete="email" className="field" /></div>
          </div>
        </fieldset>
        <fieldset className="space-y-4">
          <legend className="font-display text-2xl mb-4">{c.address}</legend>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="city">{c.city} *</label>
              <input id="city" name="city" required list="cities" value={city} onChange={(e) => setCity(e.target.value)} className="field" autoComplete="address-level1" />
              <datalist id="cities">{["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Konya", "Gaziantep", "Kocaeli"].map((x) => <option key={x} value={x} />)}</datalist>
            </div>
            <div><label className="label" htmlFor="district">{c.district} *</label><input id="district" name="district" required maxLength={80} className="field" autoComplete="address-level2" /></div>
          </div>
          <div><label className="label" htmlFor="line">{c.line} *</label><textarea id="line" name="line" required maxLength={300} rows={2} className="field" autoComplete="street-address" /></div>
          <div className="grid gap-4 md:grid-cols-[160px_1fr]">
            <div><label className="label" htmlFor="postal">{c.postal}</label><input id="postal" name="postal" maxLength={10} dir="ltr" inputMode="numeric" className="field" autoComplete="postal-code" /></div>
            <div><label className="label" htmlFor="notes">{c.notes}</label><input id="notes" name="notes" maxLength={500} className="field" /></div>
          </div>
        </fieldset>
        <fieldset className="space-y-3">
          <legend className="font-display text-2xl mb-4">{c.payment}</legend>
          <label className="flex cursor-pointer gap-4 border border-ink p-5">
            <input type="radio" name="method" defaultChecked className="mt-1 accent-ink" />
            <span><span className="flex items-center gap-2 font-medium"><IconWhatsApp width={18} /> {c.payWhatsapp}</span><span className="mt-1 block text-sm text-smoke">{c.payWhatsappText}</span></span>
          </label>
          <label className={`flex gap-4 border border-bone p-5 ${onlinePayment ? "cursor-pointer" : "opacity-50"}`}>
            <input type="radio" name="method" disabled={!onlinePayment} className="mt-1" />
            <span><span className="font-medium">{c.payOnline}</span><span className="mt-1 block text-sm text-smoke">{c.payOnlineSoon}</span></span>
          </label>
        </fieldset>
      </div>

      <aside className="h-fit space-y-5 bg-ivory p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-2xl">{c.summary}</h2>
        <ul className="space-y-4">
          {lines.map((l) => (
            <li key={l.key} className="flex gap-3">
              <div className="relative aspect-[4/5] w-16 shrink-0 bg-bone">
                <Image src={l.image} alt="" fill sizes="64px" className="object-cover" />
                <span className="absolute -top-2 -end-2 grid h-5 w-5 place-items-center rounded-full bg-ink text-[0.65rem] text-ivory">{l.qty}</span>
              </div>
              <div className="flex-1 text-sm"><p>{t(l.name, locale)}</p><p className="text-xs text-smoke">{l.size} · {t(l.colorName, locale)}</p></div>
              <p className="text-sm">{formatTRY(l.qty * l.priceMinor, locale)}</p>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder={c.coupon} dir="ltr" className="field uppercase" />
          <button type="button" onClick={applyCoupon} disabled={!coupon} className="btn btn-outline px-4">{c.applyCoupon}</button>
        </div>
        {couponMsg && <p className="text-xs text-smoke">{couponMsg}</p>}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>{dict.cart.subtotal}</span><span>{formatTRY(subtotalMinor, locale)}</span></div>
          {discountMinor > 0 && <div className="flex justify-between text-sale"><span>{dict.cart.discount} ({discount?.code})</span><span>-{formatTRY(discountMinor, locale)}</span></div>}
          <div className="flex justify-between"><span>{dict.cart.shipping}</span><span>{shipping === 0 ? dict.cart.free : formatTRY(shipping, locale)}</span></div>
        </div>
        <div className="h-px bg-bone" />
        <div className="flex justify-between text-lg"><span>{dict.cart.total}</span><span>{formatTRY(total, locale)}</span></div>
        <p className="text-xs text-smoke">{dict.cart.vatNote}</p>
        <label className="flex gap-3 text-xs leading-relaxed text-graphite">
          <input type="checkbox" name="consent" required className="mt-0.5 accent-ink" />
          <span>
            {c.agree}{" "}
            <Link href={`/${locale}/policies/terms`} target="_blank" className="underline">↗</Link>{" "}
            <Link href={`/${locale}/policies/privacy`} target="_blank" className="underline">↗</Link>
          </span>
        </label>
        {err && <p className="text-sm text-sale">{err}</p>}
        <button disabled={busy} className="btn btn-wa w-full"><IconWhatsApp /> {busy ? c.placing : c.payWhatsapp}</button>
      </aside>
    </form>
  );
}
