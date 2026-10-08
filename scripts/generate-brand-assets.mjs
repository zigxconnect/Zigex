// Builds every app icon from the one source logo (assets/brand/logo.png, 640px,
// the blue Z tile with rounded transparent corners).
//
//   node scripts/generate-brand-assets.mjs
//
// Writes:
//   public/icons/icon-{48,96,192,512}.png   standard icons (rounded tile)
//   public/icons/maskable-{192,512}.png     Android adaptive icons: full-bleed blue,
//                                           mark inside the 80% safe zone
//   public/icons/apple-touch-icon.png       180px, opaque (iOS rounds it itself)
//   public/icons/shortcut-*.png             96px shortcut icons (white glyph on the tile)
//   public/icons/badge-96.png               notification badge (white mark, transparent)
//   app/favicon.ico                         32 + 48px
//   assets/brand/mark-white.png             the Z mark alone, for share images
//   assets/brand/mark-blue.png              the same mark in brand blue
import sharp from "sharp";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "assets/brand/logo.png");
const ICONS = join(root, "public/icons");
const BLUE = { r: 0x15, g: 0x5d, b: 0xfc, alpha: 1 };

await mkdir(ICONS, { recursive: true });

// 1. The white Z mark on transparent, trimmed to its bounds.
const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const mark = Buffer.alloc(info.width * info.height * 4);
for (let i = 0; i < info.width * info.height; i++) {
  const [r, g, b, a] = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2], data[i * 4 + 3]];
  // White-ish pixels belong to the mark; keep anti-aliased edges as partial alpha.
  const whiteness = Math.min(r, g, b);
  const alpha = a < 10 ? 0 : Math.max(0, Math.min(255, Math.round(((whiteness - 110) / (255 - 110)) * 255)));
  mark[i * 4] = 255;
  mark[i * 4 + 1] = 255;
  mark[i * 4 + 2] = 255;
  mark[i * 4 + 3] = alpha;
}
const markWhite = await sharp(mark, { raw: { width: info.width, height: info.height, channels: 4 } }).trim({ threshold: 1 }).png().toBuffer();
await writeFile(join(root, "assets/brand/mark-white.png"), markWhite);
const markBlue = await sharp(markWhite).tint({ r: BLUE.r, g: BLUE.g, b: BLUE.b }).png().toBuffer();
// tint keeps luminance; recolour exactly instead: blue pixels with the mark's alpha.
const mw = await sharp(markWhite).raw().toBuffer({ resolveWithObject: true });
const blueRaw = Buffer.alloc(mw.data.length);
for (let i = 0; i < mw.data.length; i += 4) {
  blueRaw[i] = BLUE.r; blueRaw[i + 1] = BLUE.g; blueRaw[i + 2] = BLUE.b; blueRaw[i + 3] = mw.data[i + 3];
}
await writeFile(
  join(root, "assets/brand/mark-blue.png"),
  await sharp(blueRaw, { raw: { width: mw.info.width, height: mw.info.height, channels: 4 } }).png().toBuffer()
);
void markBlue;

// 2. Standard icons: the tile itself.
for (const size of [48, 96, 192, 512]) {
  await sharp(SRC).resize(size, size).png({ compressionLevel: 9 }).toFile(join(ICONS, `icon-${size}.png`));
}

// Full-bleed blue square with the mark centred at `scale` of the width.
async function onBlue(size, scale) {
  const markSize = Math.round(size * scale);
  const m = await sharp(markWhite).resize(markSize, markSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: BLUE } })
    .composite([{ input: m, gravity: "center" }])
    .png({ compressionLevel: 9 });
}

// 3. Maskable (Android crops to circles/squircles; keep the mark within the 80% safe zone).
for (const size of [192, 512]) await (await onBlue(size, 0.44)).toFile(join(ICONS, `maskable-${size}.png`));

// 4. Apple touch icon: opaque, iOS applies its own rounding.
await (await onBlue(180, 0.58)).flatten({ background: BLUE }).toFile(join(ICONS, "apple-touch-icon.png"));

// 4b. Notification badge (Android status bar): white silhouette on transparent.
await sharp(markWhite)
  .resize(72, 72, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({ top: 12, bottom: 12, left: 12, right: 12, background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(join(ICONS, "badge-96.png"));

// 5. Shortcut icons: white lucide glyph on the rounded tile.
async function lucideSvg(name) {
  const mod = await import(pathToFileURL(join(root, `node_modules/lucide-react/dist/esm/icons/${name}.js`)).href);
  const body = mod.__iconNode
    .map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).filter(([k]) => k !== "key").map(([k, v]) => `${k}="${v}"`).join(" ")}/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}
const tile96 = await sharp({
  create: { width: 96, height: 96, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" rx="22" fill="#155DFC"/></svg>`) }])
  .png()
  .toBuffer();
for (const [file, icon] of [["explore", "compass"], ["applications", "clipboard-list"], ["programs", "graduation-cap"], ["notifications", "bell"]]) {
  await sharp(tile96)
    .composite([{ input: Buffer.from(await lucideSvg(icon)), gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(join(ICONS, `shortcut-${file}.png`));
}

// 6. favicon.ico with PNG-encoded 32 and 48px images (supported by every current browser).
const pngs = await Promise.all([32, 48].map((s) => sharp(SRC).resize(s, s).png().toBuffer()));
const header = Buffer.alloc(6 + 16 * pngs.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(pngs.length, 4);
let offset = header.length;
pngs.forEach((png, i) => {
  const size = [32, 48][i];
  const e = 6 + 16 * i;
  header.writeUInt8(size, e);
  header.writeUInt8(size, e + 1);
  header.writeUInt8(0, e + 2);
  header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(png.length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += png.length;
});
await writeFile(join(root, "app/favicon.ico"), Buffer.concat([header, ...pngs]));

console.log("Brand assets written.");
