// Always Allow wordmark build. Lane 5b.2 of the visual rebuild.
//
// The letterforms are NOT redrawn here. The outlines carry no typeface name of their own, so
// this reads the existing kit wordmark and applies exactly two recorded changes to it:
//
//   1. A word space. Sarah's ruling 5 is that the company name is two words, always, and
//      the kit wordmark sets it as one word: the gap between "Always" and "Allow" measures
//      0.573 units, the smallest gap in the whole wordmark, tighter than the gap between
//      the A and the l. She chose the wide space on 2026-08-27 from a rendered
//      comparison of four widths, revising an earlier pick of the medium one. SPACE below is that choice. Only the five glyphs of the
//      second word move; every letter is left exactly as drawn.
//   2. The ink colour. The kit files are entirely in retired colours (11 of 11 fills).
//      #344650 is the guide's ink token, whose stated role is text.
//
// Every substitution below is length preserving by construction, so the output must be
// exactly as long as the input. An earlier version of this file wrote a stray bracket into
// all five transforms and grew the file by 5 bytes; the length assertion and the transform
// shape assertion below both catch that, and a byte-for-byte comparison against the
// builder's own output did not, because it compared a wrong file to the same wrong file.
//
// The input is 2026.08.27_WordmarkSource.svg, the outlines this wordmark was cut from, kept in
// this folder so the script can run. The face is DM Serif Display: measured 2026-08-27, every
// letter width as a ratio to cap height matches the live font within half a percent, and the
// font itself is committed at brand/fonts/. So the type CAN be re-set if it ever needs different
// tracking or extra characters, which is a different job from this one and would change the
// letterforms. It is committed as outlines anyway, which is normal for a wordmark, because
// outlines render identically everywhere without the font being present.
//
// Usage:
//   node 2026.08.27_WordmarkBuild.mjs 2026.08.27_WordmarkSource.svg <out.svg>
//   node 2026.08.27_WordmarkBuild.mjs 2026.08.27_WordmarkSource.svg <out.svg> --check

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const SPACE = 9;            // her choice, 2026-08-27: option D, word gap 40% of cap height
const INK = '#344650';      // guide token: ink, role text
const DEAD_INK = '#2D2926'; // retired colour in the kit file
const BASELINE = '56.624999';
const WRAPPER = 'translate(-179,0)';
const SECOND_WORD = [296.896885, 320.296927, 330.592947, 340.888967, 360.293007];
const ALL_ORIGINS = [184.360671, 207.760713, 217.696736, 244.984794, 263.056822,
                     281.77686, 296.896885, 320.296927, 330.592947, 340.888967, 360.293007];

function origin(x) { return `translate(${x}, ${BASELINE})`; }

export function build(src) {
  let t = src;
  let droppedBytes = 0;

  const fills = (t.match(new RegExp(DEAD_INK, 'g')) || []).length;
  if (fills !== 11) throw new Error(`expected 11 fills of ${DEAD_INK}, found ${fills}`);
  t = t.split(DEAD_INK).join(INK);

  for (const x of SECOND_WORD) {
    // The kit file writes 281.77686 without a trailing zero, so match the literal it uses.
    const from = origin(String(x));
    const to = origin(String(Number((x + SPACE).toFixed(6))));
    if (t.split(from).length - 1 !== 1) throw new Error(`origin not found exactly once: ${from}`);
    if (from.length !== to.length) throw new Error(`substitution changes length: ${from} -> ${to}`);
    t = t.replace(from, to);
  }

  // The ink right edge sits at 208.980507 in a 212 box, so the widened word needs a
  // widened canvas or it clips. 212 + SPACE keeps the left bearing untouched.
  const vbFrom = 'viewBox="0 0 212 90"', vbTo = `viewBox="0 0 ${212 + SPACE} 90"`;
  if (t.split(vbFrom).length - 1 !== 1) throw new Error(`not found exactly once: ${vbFrom}`);
  if (vbFrom.length !== vbTo.length) throw new Error('viewBox substitution changes length');
  t = t.replace(vbFrom, vbTo);

  // Drop the width and height. Every other file in this set carries a viewBox and no intrinsic
  // size, so placements scale it; leaving these two here made that claim false, and an image
  // element with no size inside a shrink-to-fit box collapses to nothing.
  const dims = ' width="212" height="90"';
  if (t.split(dims).length - 1 !== 1) throw new Error(`not found exactly once: ${dims}`);
  t = t.replace(dims, '');
  droppedBytes = dims.length;

  verify(src, t, droppedBytes);
  return t;
}

// Assert the OUTPUT is structurally right, not merely reproducible.
function verify(src, out, droppedBytes) {
  if (out.length !== src.length - droppedBytes) {
    throw new Error(`length is ${out.length}, expected ${src.length - droppedBytes}; every edit here is length preserving apart from the dropped width and height`);
  }
  if (/<svg[^>]*\swidth=/.test(out) || /<svg[^>]*\sheight=/.test(out)) {
    throw new Error('the root still carries an intrinsic size');
  }
  const transforms = out.match(/transform="[^"]*"/g) || [];
  if (transforms.length !== 12) throw new Error(`expected 12 transforms, found ${transforms.length}`);
  const seen = [];
  for (const raw of transforms) {
    const v = raw.slice(11, -1);
    if (v === WRAPPER) continue;
    const m = /^translate\((-?\d+(?:\.\d+)?), (-?\d+(?:\.\d+)?)\)$/.exec(v);
    if (!m) throw new Error(`malformed transform: ${v}`);
    if (m[2] !== BASELINE) throw new Error(`glyph off the baseline: ${v}`);
    seen.push(Number(m[1]));
  }
  const want = ALL_ORIGINS.map((x) => (SECOND_WORD.includes(x) ? Number((x + SPACE).toFixed(6)) : x));
  if (seen.length !== want.length || seen.some((v, i) => v !== want[i])) {
    throw new Error(`glyph origins wrong:\n  got  ${seen.join(', ')}\n  want ${want.join(', ')}`);
  }
  if (out.includes(DEAD_INK)) throw new Error('retired colour still present');
  const inks = (out.match(new RegExp(INK, 'g')) || []).length;
  if (inks !== 11) throw new Error(`expected 11 ink fills, found ${inks}`);
}

const [, , inPath, outPath, flag] = process.argv;
if (!inPath || !outPath) {
  console.error('usage: node 2026.08.27_WordmarkBuild.mjs 2026.08.27_WordmarkSource.svg <out.svg> [--check]');
  process.exit(1);
}
// Pin the source outlines by hash. Added 2026-09-02 after review: the builder verifies its own
// output against its input, so altered outlines plus a regenerated output passed --check together.
// The pinned file is the kit wordmark as it was on 2026-08-27, the letterforms Sarah approved.
const SOURCE_SHA256 = '8be473ef05ef30ef59ecb08aa3fa15866311f89feec94cea5edb638456940347';
const sourceText = readFileSync(inPath, 'utf8');
const sourceHash = createHash('sha256').update(sourceText).digest('hex');
if (sourceHash !== SOURCE_SHA256) {
  throw new Error(`${inPath} is not the pinned source.\n  expected ${SOURCE_SHA256}\n  got      ${sourceHash}`);
}
const built = build(sourceText);
if (flag === '--check') {
  const disk = readFileSync(outPath, 'utf8');
  if (disk === built) { console.log(`${outPath}: matches the builder, and the builder self-verified`); process.exit(0); }
  console.error(`${outPath}: DIFFERS from the builder output`); process.exit(1);
}
writeFileSync(outPath, built);
console.log(`wrote ${outPath} (${Buffer.byteLength(built)} bytes)`);
