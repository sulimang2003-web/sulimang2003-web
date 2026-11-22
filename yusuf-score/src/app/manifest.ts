import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "YUSUF SCORE",
    short_name: "Yusuf Score",
    description: "Premium menswear — Fatih, Istanbul",
    start_url: "/?utm_source=pwa&utm_medium=app&utm_campaign=homescreen",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1d1f22",
    theme_color: "#1d1f22",
    lang: "ar",
    dir: "auto",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "المتجر / Mağaza", url: "/ar/shop?utm_source=pwa&utm_medium=shortcut" },
      { name: "وصل حديثاً / Yeni", url: "/ar/shop?tag=new&utm_source=pwa&utm_medium=shortcut" },
    ],
  };
}
