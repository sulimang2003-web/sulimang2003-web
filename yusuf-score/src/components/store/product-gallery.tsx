"use client";
import Image from "next/image";
import { useRef, useState } from "react";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const go = (i: number) => {
    setActive(i);
    const el = track.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };
  return (
    <div className="md:grid md:grid-cols-[72px_1fr] md:gap-4">
      <div className="hidden md:flex md:flex-col md:gap-3">
        {images.map((src, i) => (
          <button key={src} onClick={() => go(i)} className={`relative aspect-[4/5] w-full bg-bone transition-opacity ${i === active ? "opacity-100 ring-1 ring-ivory" : "opacity-55 hover:opacity-100"}`} aria-label={`${i + 1}`}>
            <Image src={src} alt="" fill sizes="72px" className="object-cover" />
          </button>
        ))}
      </div>
      <div className="relative">
        <div
          ref={track}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            setActive(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
          }}
        >
          {images.map((src, i) => (
            <div key={src} className="relative aspect-[4/5] w-full shrink-0 snap-start bg-bone">
              <Image src={src} alt={`${alt} — ${i + 1}`} fill priority={i === 0} sizes="(min-width:768px) 50vw, 100vw" className="object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 md:hidden">
          {images.map((_, i) => <span key={i} className={`h-[2px] transition-all ${i === active ? "w-6 bg-ink" : "w-3 bg-ink/30"}`} />)}
        </div>
      </div>
    </div>
  );
}
