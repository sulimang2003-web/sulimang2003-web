// Wordmark placeholder — replace with the official Yusuf Score logo file (SVG) when supplied.
export function Logo({ className = "", tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <span dir="ltr" className={`inline-flex flex-col items-center leading-none ${tone === "light" ? "text-ivory" : "text-ink"} ${className}`}>
      <span className="font-display text-[1.45rem] tracking-[0.32em] ps-[0.32em] md:text-[1.7rem]">YUSUF SCORE</span>
      <span className="mt-1 text-[0.5rem] tracking-[0.55em] ps-[0.55em] text-gold">ISTANBUL · FATIH</span>
    </span>
  );
}
