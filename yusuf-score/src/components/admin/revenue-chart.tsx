import { formatTRY } from "@/lib/format";

/** Single-series daily revenue bars (one hue, no legend needed). Hover shows the exact value. */
export function RevenueChart({ data }: { data: { date: string; orders: number; revenueMinor: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenueMinor));
  return (
    <figure>
      <div className="flex h-44 items-end gap-[2px] border-b border-bone" dir="ltr" role="img" aria-label="الإيرادات اليومية لآخر ٣٠ يوماً">
        {data.map((d) => (
          <div key={d.date} className="group relative flex h-full flex-1 items-end">
            <div
              className="w-full rounded-t-[4px] bg-graphite transition-colors group-hover:bg-gold"
              style={{ height: `${Math.max(d.revenueMinor > 0 ? 3 : 0, (d.revenueMinor / max) * 100)}%` }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap bg-ink px-2.5 py-1.5 text-[0.7rem] text-ivory group-hover:block">
              {d.date.slice(5)} · {formatTRY(d.revenueMinor, "ar")} · {d.orders} طلب
            </div>
          </div>
        ))}
      </div>
      <figcaption className="mt-2 flex justify-between text-[0.7rem] text-smoke" dir="ltr">
        <span>{data[0]?.date.slice(5)}</span><span>{data.at(-1)?.date.slice(5)}</span>
      </figcaption>
    </figure>
  );
}
