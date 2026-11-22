import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Sans_Arabic, Jost } from "next/font/google";
import "../../globals.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "YUSUF SCORE — لوحة الإدارة", robots: { index: false, follow: false } };

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-cormorant" });
const jost = Jost({ subsets: ["latin", "latin-ext"], weight: ["300", "400", "500"], variable: "--font-jost" });
const plexAr = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["300", "400", "500", "600"], variable: "--font-plex-ar" });

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cormorant.variable} ${jost.variable} ${plexAr.variable}`}>
      <body className="min-h-dvh bg-[#f3efe7]">{children}</body>
    </html>
  );
}
