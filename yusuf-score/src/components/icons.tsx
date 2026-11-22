import type { SVGProps } from "react";

const base = (p: SVGProps<SVGSVGElement>) => ({
  width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor",
  strokeWidth: 1.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, ...p,
});

export const IconBag = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M5 8h14l-1 13H6L5 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>);
export const IconSearch = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>);
export const IconMenu = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M3 7h18M3 12h18M3 17h12" /></svg>);
export const IconClose = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const IconArrow = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)} className={`rtl:-scale-x-100 ${p.className ?? ""}`}><path d="M4 12h16m-6-6 6 6-6 6" /></svg>);
export const IconTruck = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.8" /><circle cx="17" cy="18" r="1.8" /></svg>);
export const IconExchange = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M4 9h13l-3-3M20 15H7l3 3" /></svg>);
export const IconStore = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M4 10v10h16V10M3 10l2-6h14l2 6H3Z" /><path d="M10 20v-5h4v5" /></svg>);
export const IconPlus = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const IconMinus = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M5 12h14" /></svg>);
export const IconChevron = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="m6 9 6 6 6-6" /></svg>);
export const IconInstagram = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r=".6" fill="currentColor" /></svg>);
export const IconWhatsApp = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} viewBox="0 0 24 24">
    <path d="M20 11.6a8 8 0 0 1-11.8 7L4 20l1.4-4.1A8 8 0 1 1 20 11.6Z" />
    <path d="M9 8.6c.2-.4.4-.4.7-.4h.5c.2 0 .4 0 .5.4l.7 1.6c0 .2 0 .3-.1.5l-.5.6c-.1.1-.1.3 0 .4.6 1 1.4 1.8 2.4 2.3.2.1.3.1.4 0l.6-.7c.1-.2.3-.2.5-.1l1.6.8c.2.1.3.2.3.4 0 .9-.7 1.7-1.7 1.8-.6.1-1.4 0-2.9-.6a9 9 0 0 1-3.8-3.6c-.6-1-.7-1.9-.6-2.5Z" fill="currentColor" stroke="none" />
  </svg>
);
export const IconTikTok = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" /><path d="M14 3c.4 2.6 2.2 4.4 5 4.6" /></svg>);
export const IconFacebook = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M14.5 8H17V4.5h-2.5A3.5 3.5 0 0 0 11 8v2.5H8.5V14H11v7h3.5v-7H17l.5-3.5h-3V8.6c0-.4.2-.6.5-.6Z" /></svg>);
export const IconSnapchat = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M12 3.5c2.8 0 4.6 2.1 4.6 4.8v2.2l1.9-.6c.5 0 .7.6.3.9l-2 1.2c.6 1.8 1.9 3 3.4 3.5-.4.9-1.6 1.1-2.6 1.3-.2.6-.3 1.2-.6 1.2-.6 0-1.5-.4-2.6.1-.9.5-1.4 1.4-2.4 1.4s-1.5-.9-2.4-1.4c-1.1-.5-2-.1-2.6-.1-.3 0-.4-.6-.6-1.2-1-.2-2.2-.4-2.6-1.3 1.5-.5 2.8-1.7 3.4-3.5l-2-1.2c-.4-.3-.2-.9.3-.9l1.9.6V8.3c0-2.7 1.8-4.8 4.6-4.8Z" /></svg>);
export const IconYouTube = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="m10 9.2 5 2.8-5 2.8V9.2Z" fill="currentColor" stroke="none" /></svg>);
export const IconPin = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M12 21s-6.5-5.7-6.5-11a6.5 6.5 0 1 1 13 0c0 5.3-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></svg>);
