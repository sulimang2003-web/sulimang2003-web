// Generates tasteful, clearly-labelled DEMO product artwork (SVG) so the store
// looks complete before real photography is supplied. Replace via the admin panel.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const out = join(process.cwd(), "public", "demo");
mkdirSync(out, { recursive: true });

const shapes = {
  shirt: `<path d="M300 210 L360 180 Q400 205 440 180 L500 210 L590 280 L555 345 L505 315 L505 660 L295 660 L295 315 L245 345 L210 280 Z" /><path d="M360 180 L400 250 L440 180" fill="none"/><line x1="400" y1="250" x2="400" y2="660"/><circle cx="400" cy="300" r="4"/><circle cx="400" cy="370" r="4"/><circle cx="400" cy="440" r="4"/><circle cx="400" cy="510" r="4"/>`,
  blazer: `<path d="M295 200 L360 175 L400 330 L440 175 L505 200 L585 290 L560 640 L500 640 L500 680 L300 680 L300 640 L240 640 L215 290 Z"/><path d="M360 175 L330 300 L400 420 L470 300 L440 175" fill="none"/><line x1="400" y1="420" x2="400" y2="680"/><circle cx="410" cy="470" r="5"/><circle cx="410" cy="540" r="5"/><line x1="320" y1="520" x2="370" y2="520"/>`,
  trousers: `<path d="M300 170 L500 170 L515 680 L425 680 L400 330 L375 680 L285 680 Z"/><line x1="300" y1="210" x2="500" y2="210"/><path d="M330 230 Q345 270 335 300" fill="none"/><path d="M470 230 Q455 270 465 300" fill="none"/>`,
  knit: `<path d="M300 200 Q400 240 500 200 L590 290 L560 610 L510 610 L505 300 L505 640 L295 640 L295 300 L290 610 L240 610 L210 290 Z"/><path d="M345 205 Q400 260 455 205" fill="none"/><line x1="295" y1="615" x2="505" y2="615"/><line x1="295" y1="625" x2="505" y2="625"/>`,
  coat: `<path d="M300 180 L360 160 L400 300 L440 160 L500 180 L590 280 L570 720 L230 720 L210 280 Z"/><path d="M360 160 L320 280 L400 380 L480 280 L440 160" fill="none"/><line x1="400" y1="380" x2="400" y2="720"/><circle cx="370" cy="430" r="6"/><circle cx="430" cy="430" r="6"/><circle cx="370" cy="520" r="6"/><circle cx="430" cy="520" r="6"/>`,
  polo: `<path d="M300 200 L365 180 Q400 200 435 180 L500 200 L575 260 L545 320 L505 300 L505 620 L295 620 L295 300 L255 320 L225 260 Z"/><path d="M365 180 L385 215 L400 290 L415 215 L435 180" fill="none"/><circle cx="400" cy="240" r="3.5"/><circle cx="400" cy="270" r="3.5"/>`,
};

// Silver studio backdrops matching the official YS logo
const bgs = [
  ["#B4B6B9", "#8C8E92"],
  ["#A3A5A9", "#7D7F83"],
  ["#2C2E32", "#1D1F22"],
];

function art({ shape, color, bg, label, stroke }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient>
<radialGradient id="l" cx=".5" cy=".38" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
<rect width="800" height="1000" fill="url(#g)"/><rect width="800" height="1000" fill="url(#l)"/>
<ellipse cx="400" cy="800" rx="230" ry="18" fill="#000" opacity=".08"/>
<g transform="translate(0 40)" fill="${color}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${shapes[shape]}</g>
<text x="400" y="905" text-anchor="middle" font-family="Georgia, serif" font-size="22" letter-spacing="8" fill="${bg[0] === "#2C2E32" ? "#C4C6C9" : "#1D1F22"}" font-weight="700">YUSUF SCORE</text>
<text x="400" y="940" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" letter-spacing="4" fill="${bg[0] === "#2C2E32" ? "#8b8e93" : "#45474b"}">${label} · DEMO</text>
</svg>`;
}

export const demo = [
  ["oxford-shirt-ivory", "shirt", "#F7F3EA", "#B9AE98"],
  ["oxford-shirt-sky", "shirt", "#C9D6E3", "#8B9BAB"],
  ["linen-shirt-sand", "shirt", "#D9C7A7", "#A8956F"],
  ["wool-blazer-charcoal", "blazer", "#3A3A3C", "#1E1E20"],
  ["wool-blazer-navy", "blazer", "#26324A", "#141B2A"],
  ["pleated-trousers-black", "trousers", "#232323", "#0E0E0E"],
  ["chino-stone", "trousers", "#C8BBA2", "#998B72"],
  ["merino-knit-camel", "knit", "#B98A57", "#8A6234"],
  ["merino-knit-black", "knit", "#262525", "#0F0F0F"],
  ["cashmere-coat-camel", "coat", "#B48756", "#7E5A33"],
  ["overcoat-charcoal", "coat", "#45464A", "#222326"],
  ["knit-polo-ivory", "polo", "#EFE8DA", "#B5A88F"],
  ["knit-polo-olive", "polo", "#5E6248", "#3B3E2C"],
  ["turtleneck-ivory", "knit", "#EEE7D8", "#B7AA90"],
];

for (const [name, shape, color, stroke] of demo) {
  bgs.forEach((bg, i) => {
    const label = name.split("-").slice(0, -1).join(" ").toUpperCase() || name.toUpperCase();
    writeFileSync(join(out, `${name}-${i + 1}.svg`), art({ shape, color, bg, label, stroke }));
  });
}

// Editorial hero + category banners
const hero = (w, h, file, shape, color) =>
  writeFileSync(
    join(out, file),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2c30"/><stop offset=".6" stop-color="#1d1f22"/><stop offset="1" stop-color="#141518"/></linearGradient>
<radialGradient id="s" cx=".68" cy=".4" r=".55"><stop offset="0" stop-color="#C4C6C9" stop-opacity=".22"/><stop offset="1" stop-color="#C4C6C9" stop-opacity="0"/></radialGradient></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/><rect width="${w}" height="${h}" fill="url(#s)"/>
<g opacity=".9" transform="translate(${w * 0.62 - 400 * (h / 1000)} ${h * 0.02}) scale(${h / 1000})" fill="${color}" stroke="#C4C6C9" stroke-opacity=".35" stroke-width="2">${shapes[shape]}</g>
<line x1="${w * 0.08}" y1="${h * 0.92}" x2="${w * 0.92}" y2="${h * 0.92}" stroke="#C4C6C9" stroke-opacity=".25"/>
</svg>`,
  );
// Abstract editorial hero (monogram + light) — replace with campaign photography.
const editorial = (w, h, file) =>
  writeFileSync(
    join(out, file),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a2c30"/><stop offset=".55" stop-color="#1d1f22"/><stop offset="1" stop-color="#141518"/></linearGradient>
<radialGradient id="s" cx=".72" cy=".32" r=".7"><stop offset="0" stop-color="#C4C6C9" stop-opacity=".20"/><stop offset=".5" stop-color="#C4C6C9" stop-opacity=".05"/><stop offset="1" stop-color="#C4C6C9" stop-opacity="0"/></radialGradient>
<linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0e1e3" stop-opacity=".55"/><stop offset="1" stop-color="#e0e1e3" stop-opacity=".05"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/><rect width="${w}" height="${h}" fill="url(#s)"/>
<text x="${w * 0.72}" y="${h * 0.62}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="${Math.min(w, h) * 0.62}" fill="none" stroke="url(#t)" stroke-width="1.2" letter-spacing="-10">YS</text>
<g stroke="#C4C6C9" stroke-opacity=".18" fill="none"><circle cx="${w * 0.72}" cy="${h * 0.4}" r="${Math.min(w, h) * 0.42}"/><circle cx="${w * 0.72}" cy="${h * 0.4}" r="${Math.min(w, h) * 0.3}"/></g>
<line x1="${w * 0.72}" y1="0" x2="${w * 0.72}" y2="${h}" stroke="#C4C6C9" stroke-opacity=".08"/>
</svg>`,
  );
editorial(1600, 1000, "hero.svg");
editorial(900, 1400, "hero-mobile.svg");
hero(800, 1000, "cat-outerwear.svg", "coat", "#4a4238");
hero(800, 1000, "cat-shirts.svg", "shirt", "#d9d2c3");
hero(800, 1000, "cat-knitwear.svg", "knit", "#8c6a45");
hero(800, 1000, "cat-trousers.svg", "trousers", "#2e2e2e");
hero(800, 1000, "cat-tailoring.svg", "blazer", "#2b3448");
editorial(1200, 1200, "story.svg");
console.log("Demo images written to public/demo");
