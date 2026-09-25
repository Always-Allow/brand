// Derive a transparent vector candidate from Sarah's approved 2026-09-10
// white-background reference. The source sticker builder rendered the locked
// 2026-08-27 lockup at 2988 x 412, covered its original mark, and rendered the
// locked master mark at the coordinates below. This builder keeps the original
// wordmark paths verbatim and replaces that mark without a white masking box.
//
// Usage: node brand/logos/build/2026.09.25_LockupVectorBuild.mjs [--check]

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const logos = resolve(here, '..');
const oldPath = resolve(logos, '2026.08.27_Lockup.svg');
const masterPath = resolve(logos, '2026.08.27_LogoMaster.svg');
const outputPath = resolve(logos, '2026.09.25_Lockup.svg');

const canvas = { width: 2988, height: 412 };
const placement = {
  x: Math.round(canvas.width * 0.051747),
  y: Math.round(canvas.height * -0.03032),
  width: Math.round(canvas.width * 0.142135),
};
placement.height = Math.round(placement.width * 840 / 1054);

function readRoot(svg) {
  const start = svg.match(/^<svg[^>]*viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)"[^>]*>/);
  if (!start || !svg.trimEnd().endsWith('</svg>')) throw new Error('invalid SVG root');
  return {
    open: start[0],
    box: start.slice(1, 5).map(Number),
    inner: svg.slice(start[0].length, svg.lastIndexOf('</svg>')),
  };
}

const old = readRoot(readFileSync(oldPath, 'utf8'));
const master = readRoot(readFileSync(masterPath, 'utf8'));
const oldNestedStart = old.inner.indexOf('<svg ');
const oldNestedEnd = old.inner.indexOf('</svg>', oldNestedStart) + '</svg>'.length;
if (oldNestedStart < 0 || oldNestedEnd < 0) throw new Error('original keycap not found');
const oldNested = old.inner.slice(oldNestedStart, oldNestedEnd);
if (!oldNested.includes(master.inner)) throw new Error('locked keycap body differs from master');
const wordmark = old.inner.slice(oldNestedEnd);
if (!wordmark.includes('translate(-124.068548, 0)')) throw new Error('locked wordmark not found');

// SVG preserveAspectRatio="xMidYMid meet" is the default used by the sticker
// raster exporter. Invert its pixel-to-viewBox mapping so the vector receives
// the same rounded geometry as the approved 2988 x 412 PNG.
const [vx, vy, vw, vh] = old.box;
const scale = Math.min(canvas.width / vw, canvas.height / vh);
const marginX = (canvas.width - vw * scale) / 2;
const marginY = (canvas.height - vh * scale) / 2;
const x = vx + (placement.x - marginX) / scale;
const y = vy + (placement.y - marginY) / scale;
const width = placement.width / scale;
const height = placement.height / scale;
const num = (value) => value.toFixed(9);

const svg = `${old.open}\n<svg x="${num(x)}" y="${num(y)}" width="${num(width)}" height="${num(height)}" viewBox="${master.box.join(' ')}" overflow="visible">${master.inner}</svg>${wordmark}</svg>\n`;

if (!svg.includes(wordmark) || svg.includes('2026.08.27_Lockup.svg')) throw new Error('wordmark changed or external dependency introduced');
const expected = { x: 155, y: -12, width: 425, height: 339 };
for (const key of Object.keys(expected)) {
  if (placement[key] !== expected[key]) throw new Error(`source placement drift: ${key}`);
}

if (process.argv.includes('--check')) {
  if (readFileSync(outputPath, 'utf8') !== svg) throw new Error('candidate SVG differs from build');
  process.stdout.write(`Candidate vector matches builder: ${outputPath}\n`);
} else {
  writeFileSync(outputPath, svg);
  process.stdout.write(`Wrote candidate vector: ${outputPath}\n`);
}
