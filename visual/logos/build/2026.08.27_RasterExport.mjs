// Exact-dimension raster export for Always Allow brand SVGs. Lane 5b.3.
//
// qlmanage cannot do this: it is a thumbnailer and pads non-square art into a square.
// Headless Chrome renders at exactly the pixel size asked for, on a transparent ground.
//
// Usage:
//   node 2026.08.27_RasterExport.mjs <input.svg> <width> <height> <output.png>
//   node 2026.08.27_RasterExport.mjs --manifest <manifest.json>
//   node 2026.08.27_RasterExport.mjs --manifest <manifest.json> --check
//
// Manifest form: [{ "svg": "...", "w": 680, "h": 120, "out": "..." }, ...], paths relative to
// the directory the command runs from. The committed manifest is 2026.08.27_RasterManifest.json
// and the check commands in the filename matrix run from the repository root.
//
// --check renders every row to a temporary file and compares it with the committed PNG, pixel
// by pixel, writing nothing to the committed path. Added 2026-09-02 after review: until then no
// command compared a committed PNG with its vector, so a stale or corrupt raster stayed green.
// Measured 2026-09-02, all eight rows re-render byte for byte; the comparison is on pixels
// rather than bytes so a browser update that changes the encoder and not the picture does not
// fail it, and any pixel off by more than 8 in any channel does.
// Override the browser with CHROME_BIN if it is installed elsewhere.

import { readFileSync, writeFileSync, mkdtempSync, existsSync, rmSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, basename, dirname } from 'node:path';
import { readPng, inkCount } from './2026.08.27_PngInspect.mjs';

const CHROME = process.env.CHROME_BIN
  || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function render(svgPath, w, h, outPath) {
  if (!existsSync(CHROME)) throw new Error('browser not found at ' + CHROME + '; set CHROME_BIN');
  const svg = readFileSync(resolve(svgPath));
  const uri = 'data:image/svg+xml;base64,' + svg.toString('base64');
  const dir = mkdtempSync(join(tmpdir(), 'aa-raster-'));
  const page = join(dir, 'page.html');
  writeFileSync(page, `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;background:transparent}
img{display:block;width:${w}px;height:${h}px}
</style></head><body><img src="${uri}"></body></html>`);
  execFileSync(CHROME, [
    '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=1', '--default-background-color=00000000',
    `--window-size=${w},${h}`, `--screenshot=${resolve(outPath)}`,
    'file://' + page,
  ], { stdio: 'ignore' });
  rmSync(dir, { recursive: true, force: true });

  // Assert the renderer honoured the request. A silently wrong size is the failure
  // this script exists to prevent, so it fails loudly rather than reporting success.
  const png = readFileSync(resolve(outPath));
  const img = readPng(png);
  if (img.width !== w || img.height !== h) {
    throw new Error(`${outPath}: asked for ${w}x${h}, got ${img.width}x${img.height}`);
  }
  // A dimensions-only check passes on a blank image, which is the failure this is most likely
  // to hit: a browser that rendered nothing still writes a correctly sized file.
  const drawn = inkCount(img);
  const ratio = drawn / (img.width * img.height);
  if (ratio < 0.005) {
    throw new Error(`${outPath}: rendered ${(100 * ratio).toFixed(2)}% coverage, which is effectively blank`);
  }
  console.log(`${outPath}  ${img.width}x${img.height}  ${png.length} bytes  (${(100 * ratio).toFixed(1)}% drawn)`);
}

// Compare a fresh render with the committed file. Dimensions first, then every pixel; a byte
// match is reported because it is the common case today, and it is not required.
function check(row) {
  const dir = mkdtempSync(join(tmpdir(), 'aa-raster-check-'));
  try {
    const fresh = join(dir, 'fresh.png');
    render(row.svg, row.w, row.h, fresh);
    const a = readFileSync(resolve(row.out)), b = readFileSync(fresh);
    if (a.equals(b)) { console.log(`${row.out}: matches a fresh render byte for byte`); return true; }
    const A = readPng(a), B = readPng(b);
    if (A.width !== B.width || A.height !== B.height) {
      console.error(`${row.out}: committed ${A.width}x${A.height}, fresh render ${B.width}x${B.height}`);
      return false;
    }
    const TOL = 8;
    let off = 0, worst = 0;
    for (let i = 0; i < A.width * A.height; i++) {
      let d = 0;
      for (let c = 0; c < 4; c++) {
        const va = c < 3 ? A.data[i * A.channels + c] : (A.channels === 4 ? A.data[i * 4 + 3] : 255);
        const vb = c < 3 ? B.data[i * B.channels + c] : (B.channels === 4 ? B.data[i * 4 + 3] : 255);
        d = Math.max(d, Math.abs(va - vb));
      }
      if (d > TOL) off++;
      if (d > worst) worst = d;
    }
    if (off > 0) {
      console.error(`${row.out}: DIFFERS from a fresh render, ${off} of ${A.width * A.height} pixels off by more than ${TOL} (worst ${worst})`);
      return false;
    }
    console.log(`${row.out}: matches a fresh render within tolerance (bytes differ, worst channel delta ${worst})`);
    return true;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// The manifest is data, so the check has to prove the manifest before it proves the pictures. Added
// 2026-09-02 after review: a row dropped, a row duplicated, or a row's size changed alongside a
// regenerated PNG all stayed green. Three rules, none of them a hash that would need re-pinning
// every time a raster is added: every row's size must match the size written into its own
// filename, which is the contract the matrix records; no output may appear twice; and every PNG in
// the output folder must be covered, except the ones a different builder owns and checks.
// [2026-09-02] Empty since the Etsy banner moved to brand/Platforms/Etsy/ at 1600x400, so every
// PNG in brand/logos/ is now a manifest row. The mechanism stays for the next builder-owned file.
const OWNED_ELSEWHERE = {};
function sizeInName(name) {
  const m = /_(\d+)(?:x(\d+))?\.png$/.exec(name);
  if (!m) throw new Error(`${name}: the filename does not carry its size`);
  return { w: Number(m[1]), h: Number(m[2] || m[1]) };
}
function validateManifest(rows) {
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('the manifest is empty');
  const seen = new Set();
  let dir = null;
  for (const row of rows) {
    for (const k of ['svg', 'w', 'h', 'out']) if (row[k] == null) throw new Error(`a manifest row is missing ${k}`);
    if (!existsSync(row.svg)) throw new Error(`${row.out}: its source ${row.svg} does not exist`);
    const name = basename(row.out);
    const want = sizeInName(name);
    if (row.w !== want.w || row.h !== want.h) {
      throw new Error(`${row.out}: the manifest says ${row.w}x${row.h} but the filename says ${want.w}x${want.h}`);
    }
    if (seen.has(row.out)) throw new Error(`${row.out}: listed twice`);
    seen.add(row.out);
    const d = dirname(row.out);
    if (dir === null) dir = d;
    else if (d !== dir) throw new Error(`${row.out}: every output must sit in one folder, and ${dir} came first`);
  }
  const missing = readdirSync(dir).filter((f) => f.endsWith('.png') && !OWNED_ELSEWHERE[f] && !seen.has(join(dir, f)));
  if (missing.length) throw new Error(`not in the manifest, so never checked: ${missing.join(', ')}`);
  for (const f of Object.keys(OWNED_ELSEWHERE)) {
    if (seen.has(join(dir, f))) throw new Error(`${f} is owned by ${OWNED_ELSEWHERE[f]} and must not be in this manifest`);
  }
  return rows;
}

const argv = process.argv.slice(2);
if (argv[0] === '--manifest') {
  // After the manifest path the only thing allowed is --check. A mistyped flag used to fall
  // through to the export branch and re-render every committed PNG. (Devin CLI, round 2, 2026-09-02.)
  if (argv.length > 3 || (argv.length === 3 && argv[2] !== '--check')) {
    console.error('usage: node 2026.08.27_RasterExport.mjs --manifest <manifest.json> [--check]');
    process.exit(1);
  }
  const rows = validateManifest(JSON.parse(readFileSync(argv[1], 'utf8')));
  if (argv[2] === '--check') {
    let ok = true;
    for (const row of rows) if (!check(row)) ok = false;
    process.exit(ok ? 0 : 1);
  }
  for (const row of rows) render(row.svg, row.w, row.h, row.out);
} else if (argv.length === 4) {
  render(argv[0], Number(argv[1]), Number(argv[2]), argv[3]);
} else {
  console.error('usage: node 2026.08.27_RasterExport.mjs <input.svg> <w> <h> <out.png>, or --manifest <manifest.json> [--check]');
  process.exit(1);
}
