// The Always Allow logo as Etsy and Mercury take it. Built 2026-09-02.
//
// Neither platform can take the logo set as it sits in brand/logos/. Etsy paints the transparent
// pixels of a PNG black (its article "Requirements and Best Practices for Images in Your Etsy
// Shop", read 2026-09-02), and Mercury asks for "a JPEG/JPG version of your logo" (its article
// "Add or change a custom logo on your Mercury account", read the same day), a format that cannot
// carry transparency at all. The
// avatar is Petrol to the edge with rounded transparent corners, drawn for a circular crop, so
// uploaded as it is those corners would go black on Etsy, and the JPEG Mercury asks for cannot
// carry them at all: whatever converted the file would fill them with something.
//
// So this renders the same avatar, unchanged, over an opaque Petrol ground. The corners fill in,
// the tile becomes a full-bleed square, and whatever crop either platform applies (Etsy shows a
// circle, Mercury offers its own crop tool) cuts into Petrol rather than into a stray colour.
// Nothing is redrawn: the glyph, its size and its placement are the avatar's.
//
// Sizes, each checked against the platform's own guidance on 2026-09-02:
//   Etsy shop logo   500x500 recommended; jpg, gif, png, svg or heic; no transparency; Etsy says
//                    of listing images that over 1MB may not finish uploading, and 1MB is
//                    borrowed as a threshold for the logo here
//   Mercury logo     a JPEG/JPG upload, cropped in the dashboard; the invoice logo must be at
//                    least 256x256, so 1024 leaves the crop tool room
//
// Usage, from anywhere:
//   node brand/Platforms/2026.09.02_PlatformLogoBuild.mjs
//   node brand/Platforms/2026.09.02_PlatformLogoBuild.mjs --check
//
// --check renders both files afresh and compares them with the committed ones byte for byte,
// writing nothing into the repository. Byte for byte, for three reasons that were each argued
// out in review on 2026-09-02. The matrix's optimisation rule says a generated file is committed
// exactly as its builder emits it, and only a byte comparison can tell a recompressed or
// re-tagged PNG from the builder's own (Codex, round 7). Any tolerance at this gate admits a
// hand-edited file inside it (Codex, rounds 5 and 6). And this is the same gate the banner
// builder has used since 2026-08-27. The cost is that the gate is bound to the machine that
// rendered the file: a browser or macOS update that changes the encoder fails the check even
// when the picture is the same (the Devin app, round 7). That is accepted, because the remedy
// is the rule itself: re-run the builder on the machine doing the checking and commit what it
// emits. When bytes differ, the check says whether the pictures differ too, so a same-picture
// mismatch reads as "regenerate" rather than as a defect. Measured 2026-09-02: both files are
// deterministic on this machine across every render and encode of seven review rounds.

import { readFileSync, writeFileSync, copyFileSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPng, pixel, census } from '../logos/build/2026.08.27_PngInspect.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const AVATAR = resolve(HERE, '..', 'logos', '2026.08.27_Avatar.svg');
const OUT = {
  etsy: { path: resolve(HERE, 'Etsy', '2026.09.02_EtsyLogo_500.png'), size: 500, kind: 'png' },
  mercury: { path: resolve(HERE, 'Mercury', '2026.09.02_MercuryLogo_1024.jpg'), size: 1024, kind: 'jpg' },
};
const PETROL = '#1D5372';   // guide token: the one accent, and the avatar's tile
const BONE = '#F0ECE6';     // guide token: the glyph
// Etsy's article says, of listing images, that files larger than 1MB may not finish uploading. That
// is advice about a different image type, not a stated limit for logos, and this threshold is a
// safety margin borrowed from it; Mercury states nothing of the kind.
const ETSY_MAX_BYTES = 1_000_000;
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// The only argument is --check. Anything else is a mistake, and a mistyped check must not turn
// into a write over the committed files, so it stops here. (Devin, round 1.)
const argv = process.argv.slice(2);
if (argv.length > 1 || (argv.length === 1 && argv[0] !== '--check')) {
  console.error('usage: node 2026.09.02_PlatformLogoBuild.mjs [--check]');
  process.exit(1);
}
const flag = argv[0];
if (!existsSync(CHROME)) throw new Error('browser not found at ' + CHROME + '; set CHROME_BIN');

const avatarSrc = readFileSync(AVATAR, 'utf8');
// The avatar is expected to be exactly what its builder emits: one Petrol tile, one bone glyph.
if (!avatarSrc.includes(`fill="${PETROL}"`) || !avatarSrc.includes(`fill="${BONE}"`)) {
  throw new Error('the avatar does not carry the Petrol tile and bone glyph this builder expects');
}
const avatarUri = 'data:image/svg+xml;base64,' + Buffer.from(avatarSrc).toString('base64');

function renderPng(size, target) {
  const dir = mkdtempSync(join(tmpdir(), 'aa-platform-logo-'));
  try {
    const html = join(dir, 'logo.html');
    // An opaque ground and no transparent-background flag, so Chrome writes an RGB PNG with no
    // alpha channel at all. Measured 2026-09-02: colour type 2. That is the point, not a side
    // effect, because Etsy treats any transparency as black.
    writeFileSync(html, `<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;padding:0;width:${size}px;height:${size}px;background:${PETROL}}
img{display:block;width:${size}px;height:${size}px}
</style></head><body><img src="${avatarUri}"></body></html>`);
    execFileSync(CHROME, ['--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
      '--force-device-scale-factor=1', `--window-size=${size},${size}`,
      `--screenshot=${target}`, 'file://' + html], { stdio: 'ignore' });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  return readPng(readFileSync(target));
}

// What a correct render looks like, asserted on the pixels rather than assumed from the markup.
function verify(img, size, label) {
  if (img.width !== size || img.height !== size) throw new Error(`${label}: asked for ${size}x${size}, got ${img.width}x${img.height}`);
  if (img.channels !== 3) throw new Error(`${label}: the PNG carries an alpha channel; both deliverables must be opaque RGB`);
  const want = { r: 0x1D, g: 0x53, b: 0x72 };
  for (const [x, y] of [[0, 0], [size - 1, 0], [0, size - 1], [size - 1, size - 1]]) {
    const p = pixel(img, x, y);
    if (Math.abs(p.r - want.r) > 2 || Math.abs(p.g - want.g) > 2 || Math.abs(p.b - want.b) > 2) {
      throw new Error(`${label}: corner (${x},${y}) reads rgb(${p.r},${p.g},${p.b}), not Petrol; the tile did not bleed to the edge`);
    }
  }
  const glyph = census(img, BONE, 12).match;
  const share = glyph / (size * size);
  // The avatar's glyph covers about 23% of its square: measured 2026-09-02 on this render path
  // as 22.9% at 500 and 23.1% at 1024, the same within a quarter of a point at tolerance 12 and
  // 24. Well under that means the glyph did not render; well over means the ground did not.
  if (share < 0.19 || share > 0.27) throw new Error(`${label}: bone glyph covers ${(100 * share).toFixed(1)}% of the square, expected about 23%`);
  return { glyph, share };
}

function jpegSize(buf) {
  if (buf[0] !== 0xFF || buf[1] !== 0xD8) throw new Error('not a JPEG');
  let p = 2;
  while (p < buf.length) {
    if (buf[p] !== 0xFF) throw new Error('malformed JPEG');
    // Any number of 0xFF fill bytes may precede a marker (ITU T.81 B.1.1.2); skip them rather than
    // reading one as the marker and the marker as a length. (Codex, round 1.)
    while (buf[p + 1] === 0xFF) p++;
    const marker = buf[p + 1];
    if (marker === 0xD8 || (marker >= 0xD0 && marker <= 0xD7) || marker === 0x01) { p += 2; continue; }
    const len = buf.readUInt16BE(p + 2);
    if ((marker >= 0xC0 && marker <= 0xC3) || (marker >= 0xC5 && marker <= 0xC7) || (marker >= 0xC9 && marker <= 0xCB) || (marker >= 0xCD && marker <= 0xCF)) {
      return { height: buf.readUInt16BE(p + 5), width: buf.readUInt16BE(p + 7), components: buf[p + 9] };
    }
    p += 2 + len;
  }
  throw new Error('no frame header in the JPEG');
}

// Used at build time to prove the JPEG encode did not move the picture (the decoded JPEG against
// the render it was made from), and at --check time only as a diagnostic after the byte gate
// has already failed, to say whether the pictures differ too. Measured 2026-09-02, that decode
// differs on 99.9% of pixels by about one level, 9 pixels by more than 4, none by more than 8,
// worst 5, mean 1.01, so the bounds below sit above that and well below any real change. This is
// never the gate on a committed file; the gate is exact.
function pixelsMatch(a, b, { tol, meanMax }, label) {
  if (a.width !== b.width || a.height !== b.height) {
    console.error(`${label}: committed ${a.width}x${a.height}, fresh render ${b.width}x${b.height}`);
    return false;
  }
  const N = a.width * a.height;
  let off = 0, worst = 0, sum = 0;
  for (let i = 0; i < N; i++) {
    let d = 0;
    for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(a.data[i * a.channels + c] - b.data[i * b.channels + c]));
    if (d > tol) off++;
    if (d > worst) worst = d;
    sum += d;
  }
  const mean = sum / N;
  if (off > 0 || mean > meanMax) {
    console.error(`${label}: DIFFERS from a fresh render, ${off} of ${N} pixels off by more than ${tol}, worst ${worst}, mean ${mean.toFixed(3)} against a bound of ${meanMax}`);
    return false;
  }
  return true;
}
const JPEG_BOUNDS = { tol: 12, meanMax: 3 };

// The gate on the committed PNG: every pixel equal, no tolerance.
function pixelsEqual(a, b, label) {
  if (a.width !== b.width || a.height !== b.height) {
    console.error(`${label}: committed ${a.width}x${a.height}, fresh render ${b.width}x${b.height}`);
    return false;
  }
  const N = a.width * a.height;
  let off = 0;
  for (let i = 0; i < N; i++) {
    for (let c = 0; c < 3; c++) if (a.data[i * a.channels + c] !== b.data[i * b.channels + c]) { off++; break; }
  }
  if (off > 0) {
    console.error(`${label}: DIFFERS from a fresh render on ${off} of ${N} pixels; re-run the builder and commit what it emits`);
    return false;
  }
  return true;
}

function decodeJpeg(jpgPath, dir) {
  const png = join(dir, 'decoded.png');
  execFileSync('sips', ['-s', 'format', 'png', jpgPath, '--out', png], { stdio: 'ignore' });
  return readPng(readFileSync(png));
}

const work = mkdtempSync(join(tmpdir(), 'aa-platform-logo-out-'));
let ok = true;
try {
  // Etsy: the PNG is the deliverable as rendered.
  const etsyPng = join(work, 'etsy.png');
  const etsy = renderPng(OUT.etsy.size, etsyPng);
  const e = verify(etsy, OUT.etsy.size, 'Etsy logo');
  const etsyBytes = readFileSync(etsyPng);
  if (etsyBytes.length > ETSY_MAX_BYTES) throw new Error(`Etsy logo is ${etsyBytes.length} bytes, over the 1MB threshold taken from Etsy's advice`);

  // Mercury: rendered the same way, then encoded as JPEG by sips, then read back.
  const mercPng = join(work, 'mercury.png');
  const merc = renderPng(OUT.mercury.size, mercPng);
  const m = verify(merc, OUT.mercury.size, 'Mercury logo');
  const mercJpg = join(work, 'mercury.jpg');
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '100', mercPng, '--out', mercJpg], { stdio: 'ignore' });
  const mercBytes = readFileSync(mercJpg);
  const hdr = jpegSize(mercBytes);
  if (hdr.width !== OUT.mercury.size || hdr.height !== OUT.mercury.size) throw new Error(`Mercury JPEG is ${hdr.width}x${hdr.height}`);
  if (hdr.components !== 3) throw new Error(`Mercury JPEG has ${hdr.components} components, expected 3 (RGB)`);
  // The JPEG round trip must not have moved the picture: decode it and hold it to the render.
  if (!pixelsMatch(merc, decodeJpeg(mercJpg, work), JPEG_BOUNDS, 'Mercury JPEG round trip')) throw new Error('the JPEG encode changed the picture');

  if (flag === '--check') {
    // The committed file is held to the same assertions as a fresh render before the pixels are
    // compared: size, no alpha channel, Petrol corners, glyph share. pixelsMatch reads RGB only, so
    // without this a committed PNG that kept its colours and gained transparency would pass, and
    // Etsy would paint that transparency black. (Devin, round 1.)
    const committedEtsy = readPng(readFileSync(OUT.etsy.path));
    verify(committedEtsy, OUT.etsy.size, 'committed Etsy logo');
    if (readFileSync(OUT.etsy.path).length > ETSY_MAX_BYTES) throw new Error('committed Etsy logo is over the 1MB threshold');
    const committedEtsyBytes = readFileSync(OUT.etsy.path);
    if (committedEtsyBytes.equals(etsyBytes)) console.log(`${OUT.etsy.path}: matches a fresh render byte for byte`);
    else {
      const samePicture = pixelsEqual(committedEtsy, etsy, OUT.etsy.path);
      console.error(`${OUT.etsy.path}: DIFFERS from a fresh render byte for byte${samePicture ? ', though the pixels are identical' : ''}; re-run the builder and commit what it emits`);
      ok = false;
    }
    const committed = readFileSync(OUT.mercury.path);
    const committedHdr = jpegSize(committed);
    if (committedHdr.width !== OUT.mercury.size || committedHdr.height !== OUT.mercury.size || committedHdr.components !== 3) {
      throw new Error(`committed Mercury logo is ${committedHdr.width}x${committedHdr.height} with ${committedHdr.components} components`);
    }
    if (committed.equals(mercBytes)) console.log(`${OUT.mercury.path}: matches a fresh render byte for byte`);
    else {
      const samePicture = pixelsMatch(decodeJpeg(OUT.mercury.path, work), merc, JPEG_BOUNDS, OUT.mercury.path);
      console.error(`${OUT.mercury.path}: DIFFERS from a fresh encode byte for byte${samePicture ? ', though the decoded picture is within the encoder round-trip bounds' : ''}; re-run the builder and commit what it emits`);
      ok = false;
    }
  } else {
    copyFileSync(etsyPng, OUT.etsy.path);
    console.log(`${OUT.etsy.path}  ${etsy.width}x${etsy.height} RGB  ${etsyBytes.length} bytes  (glyph ${(100 * e.share).toFixed(1)}%)`);
    copyFileSync(mercJpg, OUT.mercury.path);
    console.log(`${OUT.mercury.path}  ${hdr.width}x${hdr.height} JPEG  ${mercBytes.length} bytes  (glyph ${(100 * m.share).toFixed(1)}%)`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
process.exit(ok ? 0 : 1);
