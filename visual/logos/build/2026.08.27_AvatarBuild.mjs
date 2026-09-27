// Always Allow square avatar build. Lane 5b.4 of the visual rebuild.
//
// The etsy-avatar.svg this replaced (deleted from brand/Platforms/Etsy/ on 2026-09-02) had no vector artwork in it at all: it is two background
// rects plus a 640x400 Canva render embedded twice as base64, once as the picture and once
// as its alpha channel. There is nothing to recolour or rescale, so this authors the avatar
// fresh from the locked small mark instead of editing that file.
//
// The small mark is the right source rather than the full keycap master. An avatar is shown
// small and, on Etsy, cropped to a circle. The master is 1.318 wide to tall, so it would
// leave bands top and bottom in a square, and its slab, inner shadow, sheen and ground
// shadow all disappear at avatar size. The small mark is square, edge to edge, one colour
// on one colour.
//
// The Petrol tile is bled to the canvas edge rather than keeping the small mark's 4-unit
// inset. A circular crop cuts the corners off anyway, and an inset would show as a gap
// between the circle edge and the artwork.
//
// The glyph path is not redrawn or re-scaled by hand: it is lifted verbatim from the small
// mark and carried under one uniform transform.
//
// Usage: node 2026.08.27_AvatarBuild.mjs 2026.08.27_LogoMarkSmall.svg <size> <out.svg> [--check]

import { readFileSync, writeFileSync } from 'node:fs';

// Measured from 2026.08.27_LogoMarkSmall.svg.
const TILE = { x: 4, y: 4, w: 120, h: 120, rx: 26 };
const PETROL = '#1D5372';
const BONE = '#F0ECE6';

export function build(markSrc, size) {
  const tile = /<rect x="4" y="4" width="120" height="120" rx="26" fill="#1D5372"\/>/.exec(markSrc);
  if (!tile) throw new Error('the small mark tile is not the shape this builder expects');

  const gm = /<g fill="#F0ECE6"><g transform="translate\(([\d.]+), ([\d.]+)\) scale\(([\d.]+)\)">([\s\S]*)<\/g><\/g>/.exec(markSrc);
  if (!gm) throw new Error('cannot find the glyph group in the small mark');
  const [, gx, gy, gs, glyph] = gm;

  // Map the tile's own 120 units onto the full canvas, so the tile bleeds to the edge.
  const k = size / TILE.w;
  const tx = (Number(gx) - TILE.x) * k;
  const ty = (Number(gy) - TILE.y) * k;
  const s = Number(gs) * k;
  const rx = TILE.rx * k;

  const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
<rect x="0" y="0" width="${size}" height="${size}" rx="${round(rx)}" fill="${PETROL}"/>
<g fill="${BONE}"><g transform="translate(${round(tx)}, ${round(ty)}) scale(${round(s)})">${glyph}</g></g>
</svg>`;

  verify(out, markSrc, size);
  return out;
}

const round = (n) => Number(n.toFixed(6));

function verify(out, markSrc, size) {
  // Re-extract from BOTH files independently rather than reusing what build() captured. Sharing
  // one regex between the builder and its check means a mis-extraction passes twice.
  const dOf = (svg) => (svg.match(/<path d="([^"]*)"/g) || []).map((m) => m.slice(9, -1));
  const outPaths = dOf(out), srcPaths = dOf(markSrc);
  if (outPaths.length !== 1) throw new Error(`expected exactly one path, found ${outPaths.length}`);
  if (!srcPaths.includes(outPaths[0])) {
    throw new Error('the outline in the output does not appear in the source mark');
  }
  if (out.includes('data:image') || out.includes('base64')) throw new Error('raster embedded');
  for (const dead of ['#c4795b', '#6a8e8b', '#1E2A30', '#e8e2da', '#2D2926', '#D6CAB8']) {
    if (out.toLowerCase().includes(dead.toLowerCase())) throw new Error(`retired colour: ${dead}`);
  }
  const colours = [...new Set(out.match(/#[0-9A-Fa-f]{6}/g) || [])];
  if (colours.length !== 2 || !colours.includes(PETROL) || !colours.includes(BONE)) {
    throw new Error(`expected exactly Petrol and bone, found ${colours.join(', ')}`);
  }
  // Read geometry from emitted markup, independently of the template's local variables.
  const number = '-?\\d+(?:\\.\\d+)?';
  const root = /<svg\b[^>]*viewBox="([^"]*)"/.exec(out);
  const rects = out.match(/<rect\b[^>]*\/>/g) || [];
  const transforms = [...out.matchAll(/transform="([^"]*)"/g)];
  if (!root || root[1] !== `0 0 ${size} ${size}` || rects.length !== 1 || transforms.length !== 1) {
    throw new Error('avatar viewBox, tile count or transform count is wrong');
  }
  const attrs = Object.fromEntries([...rects[0].matchAll(/([a-z]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
  const k = size / TILE.w;
  for (const [key, value] of Object.entries({ x: 0, y: 0, width: size, height: size, rx: round(TILE.rx * k) })) {
    if (attrs[key] === undefined || attrs[key].trim() === '' || Number(attrs[key]) !== value) {
      throw new Error(`avatar tile ${key} is wrong`);
    }
  }
  const parse = (value) => new RegExp(`^translate\\((${number}), (${number})\\) scale\\((${number})\\)$`).exec(value);
  const actual = parse(transforms[0][1]);
  const sourceTransforms = [...markSrc.matchAll(/transform="([^"]*)"/g)];
  const source = sourceTransforms.length === 1 && parse(sourceTransforms[0][1]);
  if (!actual || !source) throw new Error('cannot read avatar/source transform');
  const expected = [(Number(source[1]) - TILE.x) * k, (Number(source[2]) - TILE.y) * k, Number(source[3]) * k].map(round);
  if (expected.some((v, i) => Number(actual[i + 1]) !== v)) throw new Error('avatar emitted transform is wrong');
  // Use the scale read back from the output for the measured source glyph's crop bound.
  const gr = 78.015112 * (Number(actual[3]) / Number(source[3])) / 2;
  const clearance = Number(attrs.width) / 2 - Math.hypot(gr, gr);
  if (!Number.isFinite(clearance) || clearance <= 0) throw new Error('glyph corners fall outside the circular crop');
  console.error(`  ${size}x${size}, corner radius ${attrs.rx}, circular-crop clearance ${clearance.toFixed(2)}px`);
}

const [, , markPath, sizeArg, outPath, flag] = process.argv;
if (!markPath || !sizeArg || !outPath) {
  console.error('usage: node 2026.08.27_AvatarBuild.mjs 2026.08.27_LogoMarkSmall.svg <size> <out.svg> [--check]');
  process.exit(1);
}
const built = build(readFileSync(markPath, 'utf8'), Number(sizeArg));
if (flag === '--check') {
  if (readFileSync(outPath, 'utf8') === built) { console.log(`${outPath}: matches the builder, and the builder self-verified`); process.exit(0); }
  console.error(`${outPath}: DIFFERS from the builder output`); process.exit(1);
}
writeFileSync(outPath, built);
console.log(`wrote ${outPath} (${Buffer.byteLength(built)} bytes)`);
