"use client";
import Image from "next/image";
import { useStore } from "./store-context";

/** iOS-style glass notifications, top-centre, branded with the YS mark. */
export function Toaster() {
  const { toasts, dismiss, dict } = useStore();
  const now = dict.common.now;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-3" style={{ paddingTop: "env(safe-area-inset-top)" }} aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} role="status" className={`toast glass pointer-events-auto flex w-full max-w-[26rem] items-center gap-3 rounded-[1.4rem] p-3 pe-4 text-ivory shadow-[0_20px_60px_rgba(0,0,0,.45)] ${t.tone === "error" ? "!border-red-300/25" : ""}`}>
          <Image src="/brand/ys-logo-circle.png" alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1" onClick={() => dismiss(t.id)}>
            <div className="flex items-center justify-between gap-2 text-[0.68rem] text-ivory/55">
              <span dir="ltr" className="tracking-[0.2em]">YUSUF SCORE</span><span>{now}</span>
            </div>
            <p className="truncate text-sm font-medium">{t.title}</p>
            {t.body && <p className="truncate text-xs text-ivory/70">{t.body}</p>}
          </div>
          {t.image && <Image src={t.image} alt="" width={40} height={50} className="h-12 w-10 shrink-0 rounded-md object-cover" />}
          {t.action && (
            <button onClick={() => { t.action!.onClick(); dismiss(t.id); }} className="shrink-0 rounded-full bg-ivory/90 px-3 py-1.5 text-xs text-ink">{t.action.label}</button>
          )}
        </div>
      ))}
    </div>
  );
}
