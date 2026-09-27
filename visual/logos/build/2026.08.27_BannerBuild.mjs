// Always Allow Etsy banner build. Lane 5b.4, and resized 2026-09-02.
//
// The banner is a raster deliverable with no vector source anywhere in the repo, so it is
// composed here as a page and rendered at exactly the size Etsy asks for, with the real font
// embedded rather than named, so the output does not depend on what is installed on the
// machine that renders it. The size is 1600x400, Etsy's recommended big shop banner; it was
// 1200x300, Etsy's minimum, from 2026-08-27 until 2026-09-02.
//
// Three things changed from the banner this replaced, each one derivable from the guide rather
// than chosen: the ground moved from bone to canvas, because the guide says bone is a surface
// colour and never the floor; the wordmark stopped being split across two colours, because the
// guide forbids the accent as text; and the keycap became the locked master.
// The tagline wording is Sarah's own and is carried over untouched.
//
// Usage:
//   node 2026.08.27_BannerBuild.mjs <lockup.svg> <font.woff2> <out.png>
//   node 2026.08.27_BannerBuild.mjs <lockup.svg> <font.woff2> <out.png> --check
//
// [2026-09-02] The banner is now 1600x400, which is the size Etsy recommends for a big shop
// banner (1200x300 is its minimum), read from Etsy's own image requirements article that day.
// The composition is the 1200x300 one scaled by exactly four thirds: every layout constant below
// is written as its 2026-08-27 value times that factor, so the design numbers stay traceable.
// Two things are deliberately not scaled: the colour tolerances, which are about channel values,
// and the one-pixel centring bound, which is a precision the render is held to at any size.
// The output lives at brand/Platforms/Etsy/, because an asset is filed by where it is deployed.

import { readFileSync, writeFileSync, copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { captureReadyPage } from './capture-ready-page.mjs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { readPng, pixel, census, bbox } from './2026.08.27_PngInspect.mjs';
import { lockupMetrics } from './2026.08.27_LockupBuild.mjs';

const BASE_W = 1200;                 // the width the 2026-08-27 layout was tuned at
const W = 1600, H = 400;             // Etsy's recommended big shop banner, checked 2026-09-02
const K = W / BASE_W;                // 4/3; H scales the same, 300 -> 400
const CANVAS = '#FEFDFB';   // guide: the floor of every page and slide
const MUTED = '#427294';    // guide: secondary text, on canvas only
const TAGLINE = 'stickers for people who vibe code';   // her existing copy, unchanged

const CAP_PX = 30 * K;      // how tall the capital A reads in the finished banner (30 at 1200)
const GAP_PX = 20 * K;      // clear space between the wordmark's lowest ink and the tagline (20)
const TAG_PX = 17 * K;      // tagline size, set well below the wordmark so it reads as secondary (17)
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const [, , lockupPath, fontPath, outPath, flag, ...extra] = process.argv;
// The only flag is --check. Anything else, a mistyped --chek included, must not fall through to
// the write branch and overwrite the committed banner. (Devin CLI, round 2, 2026-09-02.)
if (!lockupPath || !fontPath || !outPath || extra.length || (flag !== undefined && flag !== '--check')) {
  console.error('usage: node 2026.08.27_BannerBuild.mjs <lockup.svg> <font.woff2> <out.png> [--check]');
  process.exit(1);
}

const lockupSrc = readFileSync(resolve(lockupPath), 'utf8');
const lockup = 'data:image/svg+xml;base64,' + Buffer.from(lockupSrc).toString('base64');
const fontBytes = readFileSync(resolve(fontPath));

// Pin the typeface by hash. A missing or swapped font file is the real failure mode here, and
// it cannot be detected reliably from the pixels: measured 2026-08-27, the tagline renders
// 305px wide with this font and 295px with the browser's fallback, which no sane tolerance
// separates. Fail loudly on the file instead of guessing from the output.
const FONT_SHA256 = '48a0c2503a9c8ec4153302693fff56b3281aba5ce5afd7cf2bd51a03b098cd22';
const got = createHash('sha256').update(fontBytes).digest('hex');
if (got !== FONT_SHA256) {
  throw new Error(`the font at ${fontPath} is not the pinned one.\n  expected ${FONT_SHA256}\n  got      ${got}`);
}
const font = 'data:font/woff2;base64,' + fontBytes.toString('base64');

// Every number describing the lockup comes from the lockup, through the builder that made it.
// This file used to carry its own copy of three of them and all three were wrong: they were the
// wordmark's ink extent, not the lockup's, so the keycap's ground shadow hung 3.7 units below
// where this layout believed the artwork ended.
const L = lockupMetrics(lockupSrc);
const k = CAP_PX / L.capHeight;
const imgW = L.box.w * k, imgH = L.box.h * k;
if (imgW > W * 0.75) throw new Error(`lockup too wide for the banner: ${imgW.toFixed(1)}px`);

// The lockup's box is now tight to its artwork, so there is no dead space above the ink to
// cancel. What remains below the WORDMARK is the keycap's ground shadow, which is real ink but
// is not what the eye measures the gap from, so the tagline is spaced off the wordmark and the
// shadow is allowed to sit inside that gap.
const belowWordmark = imgH - (L.inkBottom - L.box.y) * k;
const pull = GAP_PX - belowWordmark;

function page(offsetPx) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: "InterEmbedded"; src: url("${font}"); font-weight: 400; font-display: block; }
html, body { margin:0; padding:0; width:${W}px; height:${H}px; background:${CANVAS}; }
.wrap { width:${W}px; height:${H}px; display:flex; flex-direction:column;
        align-items:center; justify-content:center; transform:translateY(${offsetPx.toFixed(3)}px); }
.lockup { display:block; width:${imgW.toFixed(3)}px; height:${imgH.toFixed(3)}px; }
.tag { font-family:"InterEmbedded", -apple-system, sans-serif; font-weight:400;
       font-size:${TAG_PX}px; letter-spacing:0.005em; color:${MUTED};
       margin-top:${pull.toFixed(3)}px; }
</style></head><body><div class="wrap">
<img class="lockup" src="${lockup}" alt="Always Allow">
<div class="tag">${TAGLINE}</div>
</div></body></html>`;
}

async function render(offsetPx, target) {
  const dir = mkdtempSync(join(tmpdir(), 'aa-banner-'));
  try {
    const html = join(dir, 'banner.html');
    writeFileSync(html, page(offsetPx));
    await captureReadyPage(CHROME, html, target, W, H, `${TAG_PX}px InterEmbedded`);
    return readPng(readFileSync(target));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// Where the drawn content actually sits, against the ground colour the page was painted with.
// Measured 2026-08-27 to be identical at thresholds 6, 12 and 24, so it is not a threshold
// artifact either way.
function inkBounds(img, tol = 6) {
  const g = pixel(img, 0, 0);
  let x0 = img.width, y0 = img.height, x1 = -1, y1 = -1;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const p = pixel(img, x, y);
      if (Math.abs(p.r - g.r) > tol || Math.abs(p.g - g.g) > tol || Math.abs(p.b - g.b) > tol) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) throw new Error('nothing was drawn');
  return { x0, y0, x1, y1, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}

const dir = mkdtempSync(join(tmpdir(), 'aa-banner-out-'));
const staged = join(dir, 'banner.png');
try {
  // Pass one measures, pass two corrects. Centring the flex column centres its BOXES, and a
  // text box carries leading its glyphs do not fill, so a column centred as boxes still lands
  // its ink off centre. The previous version left the composition 19.5px low on a 300px band,
  // and its own checks could not see it: they asserted dimensions, ground colour, ink counts
  // and tagline width, and never once asked where any of it had landed.
  const first = await render(0, staged);
  const offset = (H - 1) / 2 - inkBounds(first).cy;
  const img = await render(offset, staged);
  const ink = inkBounds(img);

  if (img.width !== W || img.height !== H) throw new Error(`asked for ${W}x${H}, got ${img.width}x${img.height}`);

  const corner = pixel(img, 0, 0);
  const want = { r: 0xFE, g: 0xFD, b: 0xFB };
  if (Math.abs(corner.r - want.r) > 2 || Math.abs(corner.g - want.g) > 2 || Math.abs(corner.b - want.b) > 2) {
    throw new Error(`ground is not the canvas colour: corner reads rgb(${corner.r},${corner.g},${corner.b})`);
  }
  const inkPx = census(img, '#344650', 24);
  if (inkPx.match < 800 * K * K) throw new Error(`the wordmark did not render: only ${inkPx.match} ink pixels`);
  const tag = census(img, MUTED, 24);
  if (tag.match < 250 * K * K) throw new Error(`the tagline did not render: only ${tag.match} pixels of ${MUTED}`);

  // The assertion the old version was missing. Both axes, because the old one was exact
  // horizontally and 19.5px out vertically, and a check on one axis would have passed.
  const offCentreY = ink.cy - (H - 1) / 2;
  const offCentreX = ink.cx - (W - 1) / 2;
  if (Math.abs(offCentreY) > 1) throw new Error(`the composition sits ${offCentreY.toFixed(1)}px off centre vertically`);
  if (Math.abs(offCentreX) > 1) throw new Error(`the composition sits ${offCentreX.toFixed(1)}px off centre horizontally`);

  // Layout check only. It cannot tell one typeface from another: measured 2026-08-27, this
  // tagline renders 305px wide with the intended font and 295px with the fallback, so a width
  // test cannot discriminate between them. Font identity is guaranteed by the hash pin above
  // instead. This catches a layout regression, not a font one.
  // The bound was 220 to 400 until 2026-09-02, which admitted a visibly different layout. The
  // committed banner measures 272px (bbox x 464 to 735 at TAG_PX 17, after the 2026-08-27 numbers
  // above were taken at a larger size), and the bound is now that measurement plus or minus 10,
  // which is wider than any rendering noise seen and narrower than any change worth catching.
  // [2026-09-02] At 1600x400 the same tagline measures 364px (the 272 above scaled by four
  // thirds would be 362.7; type does not scale perfectly linearly, so the value is measured on
  // the first 1600x400 render rather than derived), and the bound scales with it to 13.
  const box = bbox(img, MUTED, 24, { fromY: Math.round(img.height * 0.55) });
  const tagW = box.x1 - box.x0 + 1;
  const TAG_W = 364, TAG_TOL = Math.round(10 * K);
  if (Math.abs(tagW - TAG_W) > TAG_TOL) {
    throw new Error(`the tagline is ${tagW}px wide; the committed layout measures ${TAG_W}px and the bound is ${TAG_TOL}px`);
  }

  // Everything above passed, so this render is fit to be the deliverable. Nothing is written to
  // the committed path until here: a validate-after-write leaves a broken file on disk whenever
  // it fails, which is the state a check exists to prevent.
  const png = readFileSync(staged);
  if (flag === '--check') {
    const disk = readFileSync(resolve(outPath));
    if (disk.equals(png)) {
      console.log(`${outPath}: matches the builder, and the builder self-verified`);
    } else {
      console.error(`${outPath}: DIFFERS from the builder output`);
      process.exit(1);
    }
  } else {
    copyFileSync(staged, resolve(outPath));
    console.log(`${outPath}  ${img.width}x${img.height}  ${png.length} bytes  (wordmark ${inkPx.match}px, tagline ${tag.match}px at ${tagW}px wide, ink centre off by ${offCentreY.toFixed(2)}px)`);
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}
