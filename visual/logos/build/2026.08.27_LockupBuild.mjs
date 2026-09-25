// Always Allow lockup build: the locked keycap master beside the two-word wordmark.
// Lane 5b.2 of the visual rebuild.
//
// Nothing here is drawn by hand. The lockup is composed from two locked sources, and every
// placement number below was measured from the shipping files rather than chosen by eye:
//
//   - The old lockups carry the mark as a 160x100 embedded PNG, so there is no vector mark
//     to preserve and nothing is lost by discarding it. The optical relationships ARE worth
//     preserving, so the three that matter are carried over exactly: the mark's rendered
//     height (29.746094), the gap from mark to wordmark (18.055983), and the mark being
//     centred on the wordmark's full ink extent rather than on its cap height.
//   - The mark is placed by its KEYCAP BODY, not by its viewBox. The master's viewBox
//     carries shadow and blur padding, so the visible keycap fills only 91.45% of its width
//     and 84.34% of its height. Placing by viewBox would silently render the keycap 16%
//     short.
//   - The master is scaled UNIFORMLY. Its aspect is 1.318182 against the old mark slot's
//     1.512804, so forcing it into the old box would stretch it 23.28% horizontally. The
//     old files already carry a 1.5623% stretch of their own (matrix 0.304687 against 0.3).
//
// The master is nested as its own <svg> element, which scopes its gradient and clip ids and
// makes an id collision with the wordmark impossible.
//
// Usage: node 2026.08.27_LockupBuild.mjs <master.svg> <wordmark.svg> <out.svg> [--check]

import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Keycap body: the union of the drawn tiles, their offset copies, the 4-wide cap stroke and
// the glyphs. Excludes the ground shadow rect and all blur spread.
const BODY = { x0: 17.596967, y0: 10.767399, x1: 492.3, y1: 342.88 };
// The master's FULL drawn extent inside its own viewBox: the body plus the blur spread plus
// the ground shadow. Measured 2026-08-27 from png/2026.08.27_LogoMaster_1054x840.png (now brand/logos/), taking
// every pixel with alpha >= 1 and converting back to user units. BODY is the solid keycap;
// this is everything the mark actually covers, and it is what the lockup's box has to hold.
const MASTER_INK = { x0: 17.192694, y0: 10.371190, x1: 492.459772, y1: 407.914762 };
const MARK_H = 29.746094;      // the old mark's rendered height, preserved
const GAP = 18.055983;         // old mark right edge to wordmark ink left, preserved
// The wordmark's ink inside its own file, in raw glyph coordinates, before the -179 crop
// wrapper. inkRight depends on the word space, so it is DERIVED from the file's own last glyph
// origin rather than restated here: hardcoding it once let the two builders drift when the
// space changed. The vertical pair is measured the same way as the horizontal, from an 8x
// render of 2026.08.27_Wordmark.svg, and the mid-line is derived from the pair rather than
// carried as a third number that could disagree with them.
const WM = { inkLeft: 184.641921, inkRightAtZeroSpace: 387.980507, lastGlyphAtZeroSpace: 360.293007,
             inkTop: 31.390624, inkBottom: 65.265624, wrapper: 'translate(-179,0)' };
// The baseline every glyph origin sits on, and the cap height of the A measured up from it.
// The cap height is what a consumer sizes type-relative layouts by, so it is published rather
// than left for each one to re-measure. Confirmed 2026-08-27 against an 8x render, which put
// the A at 23.875 with a measurement resolution of 0.125, so the finer value stands.
const WM_BASELINE = 56.624999;
const WM_CAP_H = 23.828125;

const DEAD = ['#c4795b', '#6a8e8b', '#1E2A30', '#e8e2da', '#2D2926', '#D6CAB8'];

function wordSpace(wordmarkSrc) {
  const all = [...wordmarkSrc.matchAll(/translate\((\d+(?:\.\d+)?), 56\.624999\)/g)].map((m) => Number(m[1]));
  if (all.length !== 11) throw new Error(`expected 11 glyph origins, found ${all.length}`);
  const space = Number((all[10] - WM.lastGlyphAtZeroSpace).toFixed(6));
  if (!(space >= 0 && space < 40)) throw new Error(`implausible word space: ${space}`);
  return space;
}

// Read the master's viewBox out of the master, rather than carrying a copy of it here. A copy
// went stale the moment the master's canvas was extended to stop clipping its ground shadow,
// and a stale copy here places the whole keycap wrongly while every check still passes.
function masterViewBox(masterSrc) {
  const m = masterSrc.match(/<svg[^>]*viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)"/);
  if (!m) throw new Error('cannot read the master viewBox');
  const [x, y, w, h] = m.slice(1).map(Number);
  if (!(w > 0 && h > 0)) throw new Error(`implausible master viewBox: ${m[1]}`);
  return { x, y, w, h };
}

function inner(svg) {
  const open = svg.indexOf('>', svg.indexOf('<svg'));
  const close = svg.lastIndexOf('</svg>');
  if (open < 0 || close < 0) throw new Error('cannot find svg body');
  return svg.slice(open + 1, close);
}

// Where every drawn thing lands, in the working coordinates the composition is built in.
// Both the builder and the verifier derive the box through this one function, so there is no
// second copy of the arithmetic to drift.
function inkBox(bodyLeft, bodyTop, s, wmInkLeft, wmInkW) {
  const x0 = Math.min(bodyLeft + (MASTER_INK.x0 - BODY.x0) * s, wmInkLeft);
  const x1 = Math.max(bodyLeft + (MASTER_INK.x1 - BODY.x0) * s, wmInkLeft + wmInkW);
  const y0 = Math.min(bodyTop + (MASTER_INK.y0 - BODY.y0) * s, WM.inkTop);
  const y1 = Math.max(bodyTop + (MASTER_INK.y1 - BODY.y0) * s, WM.inkBottom);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

// The composition, separated from the serialising so that anything needing these numbers gets
// them from here rather than keeping a copy.
function compose(masterSrc, wordmarkSrc) {
  const vb = masterViewBox(masterSrc);
  const bodyW = BODY.x1 - BODY.x0, bodyH = BODY.y1 - BODY.y0;
  const s = MARK_H / bodyH;
  const markW = bodyW * s;

  const space = wordSpace(wordmarkSrc);
  const inkRight = WM.inkRightAtZeroSpace + space;
  const wmInkW = inkRight - WM.inkLeft;
  const inkMidY = (WM.inkTop + WM.inkBottom) / 2;

  // A working origin, not a canvas. The box is computed from where the artwork actually lands,
  // so the origin these numbers hang off does not reach the output.
  const bodyLeft = 0;
  const bodyTop = inkMidY - MARK_H / 2;
  const wmInkLeft = bodyLeft + markW + GAP;
  const wmShift = wmInkLeft - WM.inkLeft;

  // Place the nested svg so the BODY, not the viewBox, lands where intended.
  const nx = bodyLeft - (BODY.x0 - vb.x) * s;
  const ny = bodyTop - (BODY.y0 - vb.y) * s;
  const nw = vb.w * s, nh = vb.h * s;

  // The box IS the artwork. It used to be a 510x90 literal, which left the drawing filling
  // 53.5% of the width and 41.7% of the height with the visible content sitting 6px above
  // centre, so anyone sizing this file by its height got a logo at 42% of the size they asked
  // for. That was not theoretical: BannerBuild had already been forced to hand-compensate for
  // it, using constants that were the wordmark's ink extent rather than the lockup's. Clear
  // space belongs to the placement, per the guide's 8%-of-the-short-edge rule, not baked in.
  const box = inkBox(bodyLeft, bodyTop, s, wmInkLeft, wmInkW);
  return { vb, s, space, markW, wmInkW, wmInkLeft, wmShift, nx, ny, nw, nh, box };
}

// What a consumer laying this lockup out actually needs, published rather than left for each
// one to restate. BannerBuild used to carry its own copy of three of these numbers, and all
// three were the WORDMARK's ink extent rather than the lockup's, so the keycap's ground shadow
// hung 3.7 units below where the only consumer believed the artwork stopped.
export function lockupMetrics(lockupSrc) {
  const m = lockupSrc.match(/^<svg[^>]*viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)"/);
  if (!m) throw new Error('cannot read the lockup viewBox');
  const [x, y, w, h] = m.slice(1).map(Number);
  const origins = (lockupSrc.match(new RegExp(`translate\\(\\d+(?:\\.\\d+)?, ${WM_BASELINE}\\)`, 'g')) || []).length;
  if (origins !== 11) throw new Error(`expected 11 wordmark glyphs on the baseline, found ${origins}`);
  return { box: { x, y, w, h }, baseline: WM_BASELINE, capHeight: WM_CAP_H,
           inkTop: WM.inkTop, inkBottom: WM.inkBottom };
}

export function build(masterSrc, wordmarkSrc) {
  const { s, space, markW, wmInkW, wmInkLeft, wmShift, nx, ny, nw, nh, box, vb } =
    compose(masterSrc, wordmarkSrc);

  const wmBody = inner(wordmarkSrc);
  const i = wmBody.indexOf(`transform="${WM.wrapper}"`);
  if (i < 0) throw new Error('wordmark wrapper transform not found');
  // Drop the -179 crop wrapper and re-place the glyphs at their lockup position.
  const glyphs = wmBody.slice(wmBody.indexOf('>', i) + 1, wmBody.lastIndexOf('</g>'));

  const out = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="${box.x.toFixed(6)} ${box.y.toFixed(6)} ${box.w.toFixed(6)} ${box.h.toFixed(6)}">
<svg x="${nx.toFixed(6)}" y="${ny.toFixed(6)}" width="${nw.toFixed(6)}" height="${nh.toFixed(6)}" viewBox="${vb.x} ${vb.y} ${vb.w} ${vb.h}" overflow="visible">${inner(masterSrc)}</svg>
<g transform="translate(${wmShift.toFixed(6)}, 0)">${glyphs}</g>
</svg>`;

  verify(out, space);
  return out;
}

// Read the emitted markup back and re-derive everything from it. The previous version of this
// function checked the intermediate numbers the builder had just computed, which proves only
// that the arithmetic agrees with itself: a template error could have placed or scaled the
// artwork anywhere and every assertion would still have passed.
function verify(out, space) {
  const near = (a, b, what, tol = 1e-4) => {
    if (!(Math.abs(a - b) <= tol)) throw new Error(`${what}: emitted ${a}, expected ${b}`);
  };

  const root = out.match(/^<svg[^>]*viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)"/);
  if (!root) throw new Error('no root viewBox in the output');
  const [vx, vy, vw, vh] = root.slice(1).map(Number);

  const nest = out.match(/<svg x="(-?[\d.]+)" y="(-?[\d.]+)" width="(-?[\d.]+)" height="(-?[\d.]+)" viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)" overflow="visible">/);
  if (!nest) throw new Error('the nested master is missing, or its attributes changed shape');
  const [nx, ny, nw, nh, mvx, mvy, mvw, mvh] = nest.slice(1).map(Number);

  const shifted = out.match(/<g transform="translate\((-?[\d.]+), 0\)">/);
  if (!shifted) throw new Error('the wordmark placement is missing');
  const wmShift = Number(shifted[1]);

  // A uniform scale is the whole point, so derive it separately per axis and require the two
  // to agree, rather than asserting that the single number used to make them is finite. The
  // comparison is proportional: the width and height are emitted to six decimals, which puts
  // about 1.3e-8 of rounding noise between the two axes, while the smallest stretch anyone has
  // actually shipped here is the old files' 1.5623%. 1e-6 sits far above the noise and far
  // below anything a person would call uniform.
  const sx = nw / mvw, sy = nh / mvh;
  const s = sx;
  if (!(Math.abs(sx - sy) / s <= 1e-6)) {
    throw new Error(`the master is stretched: x scale ${sx}, y scale ${sy}`);
  }

  const bodyLeft = nx + (BODY.x0 - mvx) * s;
  const bodyTop = ny + (BODY.y0 - mvy) * s;
  const markW = (BODY.x1 - BODY.x0) * s;
  near((BODY.y1 - BODY.y0) * s, MARK_H, 'the mark is not the preserved height');

  // The three preserved relationships, measured off the emitted geometry.
  const wmInkLeft = WM.inkLeft + wmShift;
  const wmInkW = (WM.inkRightAtZeroSpace + space) - WM.inkLeft;
  near(wmInkLeft - (bodyLeft + markW), GAP, 'the mark-to-wordmark gap');
  near(bodyTop + MARK_H / 2, (WM.inkTop + WM.inkBottom) / 2, 'the mark is not centred on the wordmark ink');

  // The box has to hold every drawn thing and touch all four edges: no clipping, no padding.
  const box = inkBox(bodyLeft, bodyTop, s, wmInkLeft, wmInkW);
  near(vx, box.x, 'viewBox x does not sit on the artwork');
  near(vy, box.y, 'viewBox y does not sit on the artwork');
  near(vw, box.w, 'viewBox width does not match the artwork');
  near(vh, box.h, 'viewBox height does not match the artwork');

  const nested = (out.match(/<svg /g) || []).length;
  if (nested !== 2) throw new Error(`expected 2 svg elements, found ${nested}`);
  const origins = (out.match(/translate\((\d+(?:\.\d+)?), 56\.624999\)/g) || []).length;
  if (origins !== 11) throw new Error(`expected 11 wordmark glyphs in the output, found ${origins}`);
  for (const dead of DEAD) {
    if (out.toLowerCase().includes(dead.toLowerCase())) throw new Error(`retired colour present: ${dead}`);
  }
  if (out.includes('data:image') || out.includes('base64')) throw new Error('raster embedded; the mark must be vector');
  if (/<text|<tspan/.test(out)) throw new Error('contains live text; the wordmark must be outlines');
  console.error(`  word space ${space}, mark body ${markW.toFixed(4)} x ${MARK_H}, scale ${s.toFixed(8)}, box ${vw.toFixed(4)} x ${vh.toFixed(4)}`);
}

// Only run the command line when this file IS the command being run. BannerBuild imports
// lockupMetrics from here, and an unguarded argv block would fire on that import.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , masterPath, wmPath, outPath, flag] = process.argv;
  if (!masterPath || !wmPath || !outPath) {
    console.error('usage: node 2026.08.27_LockupBuild.mjs <master.svg> <wordmark.svg> <out.svg> [--check]');
    process.exit(1);
  }
  const built = build(readFileSync(masterPath, 'utf8'), readFileSync(wmPath, 'utf8'));
  if (flag === '--check') {
    const disk = readFileSync(outPath, 'utf8');
    if (disk === built) { console.log(`${outPath}: matches the builder, and the builder self-verified`); process.exit(0); }
    console.error(`${outPath}: DIFFERS from the builder output`); process.exit(1);
  }
  writeFileSync(outPath, built);
  console.log(`wrote ${outPath} (${Buffer.byteLength(built)} bytes)`);
}
