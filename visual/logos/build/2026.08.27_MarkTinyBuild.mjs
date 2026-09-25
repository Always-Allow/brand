// The 16px cut of the small mark. Lane 5b.5.
//
// WHY THIS FILE EXISTS. 2026.08.27_LogoMarkSmall.svg is the small mark and it is correct at 32px
// and above. At 16px it stopped being a command symbol: measured on the shipped
// png/2026.08.27_LogoMarkSmall-16.png (a retired file; png/ is brand/logos/ since 2026-09-02), only 2 pixels in the whole image were true bone against
// 98 at 32px, the centre counter closed to a 2px blend of #7F9AA8 at 2.10:1 where 32px and 48px
// both render that same counter as clean Petrol at 7.05:1, and the glyph read as a grey lattice
// rather than a mark. Sarah asked for it redrawn on 2026-08-27.
//
// WHY SCALING DOWN CANNOT FIX IT. The mark's proportions do not land on whole pixels at this
// size. Across the glyph the real symbol runs wall 11.6%, counter 19.6%, wall 11.6%, centre
// counter 14.5%, wall 11.6%, counter 19.6%, wall 11.6%. At any glyph size that fits a 16px tile
// those come out fractional, so every wall and every counter straddles a pixel boundary and
// greys out. Enlarging it was tested and does not help: an edge-to-edge variant with the glyph
// scaled up to match still closes its centre counter. The size was never the problem.
//
// WHAT THIS DOES INSTEAD. It redraws the same symbol on the 16px pixel grid, so every wall is
// exactly one pixel and every counter exactly two, and nothing needs to be antialiased except
// the tile's rounded corners. The seven segments across the glyph become 1, 2, 1, 2, 1, 2, 1,
// which is 10px inside a 16px tile: the same 1:1 symbol, at essentially the same size as the
// 9.75px it renders today, drawn where the pixels are.
//
// This is a size-specific cut and nothing else uses it. LogoMarkSmall.svg is untouched, so the
// avatar, the symbols and the 32, 48, 128 and 512 rasters are all unaffected.
//
// Usage:
//   node 2026.08.27_MarkTinyBuild.mjs <out.svg>
//   node 2026.08.27_MarkTinyBuild.mjs <out.svg> --check

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { readPng, pixel } from './2026.08.27_PngInspect.mjs';

const PETROL = '#1D5372';   // guide token
const BONE = '#F0ECE6';     // guide token
const SIZE = 16;            // one user unit is one pixel, which is the whole point
const RADIUS = 3;           // the tile's corner, the only thing here that may antialias
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// The glyph, as whole pixels. Each ring is an outer square and the counter punched out of it.
// The four lobes each share one corner block with the centre square, which is what joins them
// into a single closed symbol exactly as the full-size drawing does.
const RINGS = [
  { name: 'lobe top-left',     outer: [3, 3, 4, 4], counter: [4, 4, 2, 2] },
  { name: 'lobe top-right',    outer: [9, 3, 4, 4], counter: [10, 4, 2, 2] },
  { name: 'lobe bottom-left',  outer: [3, 9, 4, 4], counter: [4, 10, 2, 2] },
  { name: 'lobe bottom-right', outer: [9, 9, 4, 4], counter: [10, 10, 2, 2] },
  { name: 'centre',            outer: [6, 6, 4, 4], counter: [7, 7, 2, 2] },
];

// Nonzero winding, not even-odd: the lobes and the centre overlap by one block each, and under
// even-odd those four shared blocks would cancel to holes and cut the symbol into five pieces.
// Outer squares run clockwise and counters run anticlockwise, so the counters subtract.
const cw = ([x, y, w, h]) => `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
const ccw = ([x, y, w, h]) => `M ${x} ${y} L ${x} ${y + h} L ${x + w} ${y + h} L ${x + w} ${y} Z`;

const d = RINGS.map((r) => `${cw(r.outer)} ${ccw(r.counter)}`).join(' ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}">
<rect x="0" y="0" width="${SIZE}" height="${SIZE}" rx="${RADIUS}" fill="${PETROL}"/>
<path fill="${BONE}" fill-rule="nonzero" d="${d}"/>
</svg>`;

// Structural checks on the markup, before anything is rendered.
if (/<text|<tspan/.test(svg)) throw new Error('contains live text');
if (/data:image|base64/.test(svg)) throw new Error('contains an embedded raster');
for (const dead of ['#c4795b', '#6a8e8b', '#1E2A30', '#e8e2da', '#2D2926', '#D6CAB8']) {
  if (svg.toLowerCase().includes(dead.toLowerCase())) throw new Error(`retired colour present: ${dead}`);
}
for (const [x, y, w, h] of RINGS.flatMap((r) => [r.outer, r.counter])) {
  if (![x, y, w, h].every((v) => Number.isInteger(v))) throw new Error('a glyph segment is not on the pixel grid');
  if (x < 0 || y < 0 || x + w > SIZE || y + h > SIZE) throw new Error('a glyph segment leaves the tile');
}

// Render at the one size this file is for, and assert the thing that actually failed: that the
// counters come back as flat Petrol and the walls as flat bone. A dimensions check, or a count
// of drawn pixels, passes just as happily on the grey lattice this replaces.
function renderAndProve(markup) {
  const dir = mkdtempSync(join(tmpdir(), 'aa-mark16-'));
  const page = join(dir, 'p.html');
  const out = join(dir, 'p.png');
  const uri = 'data:image/svg+xml;base64,' + Buffer.from(markup).toString('base64');
  writeFileSync(page, `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;background:transparent}img{display:block;width:${SIZE}px;height:${SIZE}px}
</style></head><body><img src="${uri}"></body></html>`);
  execFileSync(CHROME, ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=1', '--default-background-color=00000000',
    `--window-size=${SIZE},${SIZE}`, `--screenshot=${out}`, 'file://' + page], { stdio: 'ignore' });
  const img = readPng(readFileSync(out));
  rmSync(dir, { recursive: true, force: true });

  if (img.width !== SIZE || img.height !== SIZE) throw new Error(`rendered ${img.width}x${img.height}`);
  const is = (p, hex) => {
    const R = parseInt(hex.slice(1, 3), 16), G = parseInt(hex.slice(3, 5), 16), B = parseInt(hex.slice(5, 7), 16);
    return p.a >= 250 && Math.abs(p.r - R) <= 1 && Math.abs(p.g - G) <= 1 && Math.abs(p.b - B) <= 1;
  };

  // Every counter pixel must be flat Petrol. This is the assertion the old 16px raster fails.
  for (const r of RINGS) {
    const [cx, cy, cw_, ch] = r.counter;
    for (let y = cy; y < cy + ch; y++) {
      for (let x = cx; x < cx + cw_; x++) {
        const p = pixel(img, x, y);
        if (!is(p, PETROL)) {
          throw new Error(`${r.name}: counter pixel (${x},${y}) is rgb(${p.r},${p.g},${p.b}), not flat Petrol, so it has closed up`);
        }
      }
    }
  }

  // And the walls must be flat bone, or the symbol is there but washed out.
  let bone = 0;
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) if (is(pixel(img, x, y), BONE)) bone++;
  const wallArea = RINGS.reduce((n, r) => n + r.outer[2] * r.outer[3] - r.counter[2] * r.counter[3], 0);
  // The lobes overlap the centre by one block each, so the drawn area is four blocks less than
  // the sum of the five rings taken separately.
  const expected = wallArea - 4;
  if (bone !== expected) throw new Error(`expected ${expected} flat bone pixels, rendered ${bone}`);
  return { bone, counters: RINGS.length };
}

const [, , outPath, flag] = process.argv;
if (!outPath) {
  console.error('usage: node 2026.08.27_MarkTinyBuild.mjs <out.svg> [--check]');
  process.exit(1);
}
const proof = renderAndProve(svg);
if (flag === '--check') {
  const disk = readFileSync(resolve(outPath), 'utf8');
  if (disk === svg) {
    console.log(`${outPath}: matches the builder, and renders ${proof.bone} flat bone pixels with all ${proof.counters} counters flat Petrol at ${SIZE}px`);
    process.exit(0);
  }
  console.error(`${outPath}: DIFFERS from the builder output`);
  process.exit(1);
}
writeFileSync(resolve(outPath), svg);
console.log(`wrote ${outPath} (${Buffer.byteLength(svg)} bytes): ${proof.bone} flat bone pixels, all ${proof.counters} counters flat Petrol at ${SIZE}px`);
