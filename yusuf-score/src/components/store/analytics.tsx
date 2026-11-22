"use client";
import Script from "next/script";
import { useEffect, useState } from "react";

/**
 * Consent-gated analytics. Nothing loads until the visitor accepts optional cookies
 * (KVKK / ePrivacy). Meta Pixel & GA load only if their env IDs are set.
 */
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const GA = process.env.NEXT_PUBLIC_GA_ID;

export function track(event: "ViewContent" | "AddToCart" | "InitiateCheckout" | "Lead" | "Contact", data?: Record<string, unknown>) {
  const w = window as unknown as { fbq?: (...a: unknown[]) => void; gtag?: (...a: unknown[]) => void };
  w.fbq?.("track", event, data);
  w.gtag?.("event", event, data);
}

export function ConsentAndAnalytics({ text, accept, reject }: { text: string; accept: string; reject: string }) {
  const [consent, setConsent] = useState<"all" | "essential" | null | undefined>(undefined);
  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )ys_consent=([^;]+)/);
    setConsent((m?.[1] as "all" | "essential") ?? null);
  }, []);
  const choose = (v: "all" | "essential") => {
    document.cookie = `ys_consent=${v}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`;
    setConsent(v);
  };
  return (
    <>
      {consent === null && (PIXEL || GA) && (
        <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl bg-ink p-5 text-sm text-ivory shadow-2xl md:inset-x-auto md:start-6 animate-fade-up">
          <p className="text-ivory/80 leading-relaxed">{text}</p>
          <div className="mt-4 flex gap-2">
            <button className="btn btn-gold min-h-10 px-4" onClick={() => choose("all")}>{accept}</button>
            <button className="btn btn-outline min-h-10 px-4" onClick={() => choose("essential")}>{reject}</button>
          </div>
        </div>
      )}
      {consent === "all" && PIXEL && (
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL}');fbq('track','PageView');`}</Script>
      )}
      {consent === "all" && GA && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA}');`}</Script>
        </>
      )}
    </>
  );
}
