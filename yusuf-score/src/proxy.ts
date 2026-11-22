import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

function pickLocale(req: NextRequest) {
  const saved = req.cookies.get("ys_locale")?.value;
  if (saved && isLocale(saved)) return saved;
  const al = req.headers.get("accept-language")?.toLowerCase() ?? "";
  const ar = al.indexOf("ar"), tr = al.indexOf("tr");
  if (tr !== -1 && (ar === -1 || tr < ar)) return "tr";
  return defaultLocale;
}

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // ── Admin: fast reject for missing/invalid session (real check happens server-side too)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!verifySession(req.cookies.get(SESSION_COOKIE)?.value)) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return NextResponse.next();

  // ── Locale prefix
  const first = pathname.split("/")[1] ?? "";
  let res: NextResponse;
  if (!isLocale(first)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${pickLocale(req)}${pathname === "/" ? "" : pathname}`;
    res = NextResponse.redirect(url);
  } else {
    res = NextResponse.next();
    res.cookies.set("ys_locale", first, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }

  // ── Campaign attribution: last-touch UTM stored for 30 days, attached to orders
  if (UTM_KEYS.some((k) => searchParams.has(k))) {
    const utm = Object.fromEntries(
      UTM_KEYS.filter((k) => searchParams.has(k)).map((k) => [k.replace("utm_", ""), searchParams.get(k)!.slice(0, 100)]),
    );
    res.cookies.set("ys_utm", JSON.stringify(utm), { path: "/", maxAge: 60 * 60 * 24 * 30, sameSite: "lax" });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next|api|demo|uploads|icons|sw.js|manifest.webmanifest|robots.txt|sitemap.xml|favicon.ico|.*\\..*).*)"],
};
