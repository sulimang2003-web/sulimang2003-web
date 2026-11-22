"use client";
import { useStore } from "./store-context";
import { IconWhatsApp } from "../icons";
import { waLink } from "@/lib/whatsapp";

export function WhatsAppFab() {
  const { settings, dict } = useStore();
  return (
    <a
      href={waLink(settings.whatsappNumber, dict.whatsapp.hello.split(",")[0])}
      target="_blank" rel="noopener" aria-label="WhatsApp"
      className="fixed bottom-5 end-5 z-30 grid h-13 w-13 place-items-center rounded-full bg-[#1f3b2d] text-ivory shadow-lg shadow-ink/20 transition-transform hover:scale-105 md:bottom-8 md:end-8"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <IconWhatsApp width={26} height={26} />
    </a>
  );
}
