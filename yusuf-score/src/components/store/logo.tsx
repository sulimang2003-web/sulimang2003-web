import Image from "next/image";

/** Official circular YS mark — used exactly as supplied (no recolouring). */
export function LogoMark({ size = 44, className = "", priority = false }: { size?: number; className?: string; priority?: boolean }) {
  return (
    <Image src="/brand/ys-logo-circle.png" alt="Yusuf Score — For Men" width={size} height={size} priority={priority}
      className={`rounded-full shadow-[0_8px_30px_rgba(0,0,0,.45)] ${className}`} />
  );
}

/** Wordmark set in the same Didone style as the logo: YUSUF SCORE / FOR MEN */
export function Logo({ className = "", tone = "dark", withMark = false }: { className?: string; tone?: "dark" | "light"; withMark?: boolean }) {
  return (
    <span dir="ltr" className={`inline-flex items-center gap-3 ${className}`}>
      {withMark && <LogoMark size={40} priority className="hidden sm:block" />}
      <span className={`inline-flex flex-col items-center leading-none ${tone === "light" ? "text-ivory" : "text-ink"}`}>
        <span className="font-logo text-[1.15rem] font-bold tracking-[0.34em] ps-[0.34em] md:text-[1.35rem]">YUSUF SCORE</span>
        <span className={`mt-1.5 text-[0.5rem] tracking-[0.7em] ps-[0.7em] ${tone === "light" ? "text-ivory/70" : "text-smoke"}`}>FOR MEN</span>
      </span>
    </span>
  );
}
