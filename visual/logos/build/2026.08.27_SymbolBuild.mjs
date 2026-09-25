// The symbol on its own, with no tile behind it. Lane 5b of the visual rebuild.
//
// This exists because the review found the two symbol files were the only assets in the set with
// no builder: they had been produced once by hand and could not be regenerated or checked.
//
// The outline is lifted verbatim from the locked small mark and never redrawn. The canvas is
// trimmed to the symbol plus a margin of an eighth of its own size on each side, so the file has
// no dead space and drops straight onto any background.
//
// Usage: node 2026.08.27_SymbolBuild.mjs 2026.08.27_LogoMarkSmall.svg <ink|bone> <out.svg> [--check]

import { readFileSync, writeFileSync } from 'node:fs';

const INK = '#344650';    // guide token: text. For light backgrounds
const BONE = '#F0ECE6';   // guide token. For dark backgrounds
const TILE = { x: 4, y: 4, w: 120, h: 120 };
const MARGIN = 0.125;     // of the symbol's own size, on each side

export function build(markSrc, colour) {
  const m = /<g fill="#F0ECE6"><g transform="translate\(([\d.]+), ([\d.]+)\) scale\(([\d.]+)\)">([\s\S]*)<\/g><\/g>/.exec(markSrc);
  if (!m) throw new Error('cannot find the glyph group in the small mark');
  const [, gx, gy, gs, glyph] = m;

  // The glyph's local box, read from its own path data rather than restated here.
  const local = pathBox(glyph);
  const s = Number(gs);
  const x0 = Number(gx) + local.x0 * s, y0 = Number(gy) + local.y0 * s;
  const size = (local.x1 - local.x0) * s;
  const tall = (local.y1 - local.y0) * s;
  if (Math.abs(size - tall) > 0.01) throw new Error(`the symbol is not square: ${size} by ${tall}`);

  const pad = size * MARGIN;
  const box = size + pad * 2;
  const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r(box)} ${r(box)}">
<g fill="${colour}"><g transform="translate(${r(Number(gx) - x0 + pad)}, ${r(Number(gy) - y0 + pad)}) scale(${gs})">${glyph}</g></g>
</svg>`;
  verify(out, glyph, colour, box, size, pad);
  return out;
}

const r = (n) => Number(n.toFixed(6));

// Bounding box of the drawn path, from its own coordinates. Only M, L, C and Z appear in this
// outline, and all are absolute, so the on-path points bound it.
function pathBox(g) {
  const d = /<path d="([^"]+)"/.exec(g);
  if (!d) throw new Error('no path in the glyph group');
  const nums = d[1].match(/-?\d+(?:\.\d+)?/g).map(Number);
  if (nums.length % 2 !== 0) throw new Error('odd coordinate count; unexpected path commands');
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i < nums.length; i += 2) {
    x0 = Math.min(x0, nums[i]); x1 = Math.max(x1, nums[i]);
    y0 = Math.min(y0, nums[i + 1]); y1 = Math.max(y1, nums[i + 1]);
  }
  return { x0, y0, x1, y1 };
}

function verify(out, glyph, colour, box, size, pad) {
  if (!out.includes(glyph)) throw new Error('the outline was altered in transit');
  const colours = [...new Set(out.match(/#[0-9A-Fa-f]{6}/g) || [])];
  if (colours.length !== 1 || colours[0] !== colour) {
    throw new Error(`expected exactly ${colour}, found ${colours.join(', ') || 'none'}`);
  }
  // Re-derive the symbol's placement from the OUTPUT rather than trusting the arithmetic above,
  // and confirm it lands centred with the intended margin on every side.
  const m = /transform="translate\((-?[\d.]+), (-?[\d.]+)\) scale\(([\d.]+)\)"/.exec(out);
  if (!m) throw new Error('cannot read the output transform');
  const local = pathBox(glyph), s = Number(m[3]);
  const left = Number(m[1]) + local.x0 * s, top = Number(m[2]) + local.y0 * s;
  const right = box - (Number(m[1]) + local.x1 * s), bottom = box - (Number(m[2]) + local.y1 * s);
  for (const [name, v] of [['left', left], ['top', top], ['right', right], ['bottom', bottom]]) {
    if (Math.abs(v - pad) > 0.001) throw new Error(`${name} margin is ${v.toFixed(4)}, expected ${pad.toFixed(4)}`);
  }
  console.error(`  symbol ${size.toFixed(3)} square in a ${box.toFixed(3)} box, margin ${pad.toFixed(3)} all round`);
}

const [, , markPath, which, outPath, flag] = process.argv;
const COLOURS = { ink: INK, bone: BONE };
if (!markPath || !COLOURS[which] || !outPath) {
  console.error('usage: node 2026.08.27_SymbolBuild.mjs 2026.08.27_LogoMarkSmall.svg <ink|bone> <out.svg> [--check]');
  process.exit(1);
}
const built = build(readFileSync(markPath, 'utf8'), COLOURS[which]);
if (flag === '--check') {
  if (readFileSync(outPath, 'utf8') === built) { console.log(`${outPath}: matches the builder, and the builder self-verified`); process.exit(0); }
  console.error(`${outPath}: DIFFERS from the builder output`); process.exit(1);
}
writeFileSync(outPath, built);
console.log(`wrote ${outPath} (${Buffer.byteLength(built)} bytes)`);
