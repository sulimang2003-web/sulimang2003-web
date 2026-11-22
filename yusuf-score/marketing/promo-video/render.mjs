// Renders promo.html frame-by-frame (deterministic) and encodes an MP4 with ffmpeg.
// Usage: node marketing/promo-video/render.mjs   (requires Playwright + ffmpeg)
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const FPS = 30;
const frames = join(here, ".frames");
rmSync(frames, { recursive: true, force: true });
mkdirSync(frames, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(join(here, "promo.html")).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => [...document.images].every((i) => i.complete));
const duration = await page.evaluate(() => window.DURATION);
const total = Math.round(duration * FPS);
for (let i = 0; i < total; i++) {
  await page.evaluate((t) => window.render(t), i / FPS);
  await page.screenshot({ path: join(frames, `${String(i).padStart(5, "0")}.jpg`), type: "jpeg", quality: 94 });
  if (i % 60 === 0) process.stdout.write(`frame ${i}/${total}\n`);
}
await browser.close();

const out = join(here, "yusuf-score-promo-1080x1920.mp4");
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", join(frames, "%05d.jpg"),
  "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], { stdio: "inherit" });
rmSync(frames, { recursive: true, force: true });
console.log("Video:", out);
