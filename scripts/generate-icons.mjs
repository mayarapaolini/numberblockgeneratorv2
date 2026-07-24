import { chromium } from "@playwright/test";
import { mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const sandboxChromium = "/opt/pw-browsers/chromium";
const executablePath = existsSync(sandboxChromium) ? sandboxChromium : undefined;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

const iconSvg = (size, padding) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="${padding ? 0 : 14}" fill="#4f46e5"/>
  <rect x="12" y="36" width="15" height="15" rx="4" fill="#f97316"/>
  <rect x="29" y="36" width="15" height="15" rx="4" fill="#facc15"/>
  <rect x="37" y="20" width="15" height="15" rx="4" fill="#22d3ee"/>
  <rect x="20" y="16" width="16" height="16" rx="4" fill="#4ade80"/>
  <circle cx="25" cy="23" r="2" fill="#1f2937"/>
  <circle cx="32" cy="23" r="2" fill="#1f2937"/>
  <path d="M25 27.5c1.4 1.6 5.6 1.6 7 0" stroke="#1f2937" stroke-width="1.8" fill="none" stroke-linecap="round"/>
</svg>`;

const targets = [
  { file: "icon-192.png", size: 192, padding: false },
  { file: "icon-512.png", size: 512, padding: false },
  { file: "apple-touch-icon.png", size: 180, padding: false },
];

const browser = await chromium.launch(executablePath ? { executablePath } : undefined);
const page = await browser.newPage();

for (const target of targets) {
  await page.setViewportSize({ width: target.size, height: target.size });
  await page.setContent(
    `<html><body style="margin:0">${iconSvg(target.size, target.padding)}</body></html>`,
  );
  await page.screenshot({ path: path.join(outDir, target.file), omitBackground: false });
}

await browser.close();
console.log("Icons generated in", outDir);
