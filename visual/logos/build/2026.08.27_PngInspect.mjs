// Minimal PNG reader, so the build scripts can assert what they actually rendered rather than
// only that the file has the right dimensions. A raster export that produces a blank image, or
// one where an embedded font failed to load, passes a dimensions-only check and looks fine.
//
// Handles what headless Chrome writes: 8 bit, non-interlaced, colour type 2 (RGB) or 6 (RGBA).

import { inflateSync } from 'node:zlib';

export function readPng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  const width = buf.readUInt32BE(16), height = buf.readUInt32BE(20);
  const depth = buf[24], colour = buf[25], interlace = buf[28];
  if (depth !== 8) throw new Error(`unsupported bit depth ${depth}`);
  if (interlace !== 0) throw new Error('interlaced PNG not supported');
  if (colour !== 2 && colour !== 6) throw new Error(`unsupported colour type ${colour}`);
  const channels = colour === 6 ? 4 : 3;

  const idat = [];
  let p = 8;
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString('ascii', p + 4, p + 8);
    if (type === 'IDAT') idat.push(buf.subarray(p + 8, p + 8 + len));
    if (type === 'IEND') break;
    p += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));

  const stride = width * channels;
  const out = Buffer.alloc(height * stride);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const line = raw.subarray(pos, pos + stride); pos += stride;
    const cur = out.subarray(y * stride, (y + 1) * stride);
    const prev = y > 0 ? out.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? cur[x - channels] : 0;
      const b = prev ? prev[x] : 0;
      const c = prev && x >= channels ? prev[x - channels] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      } else if (filter !== 0) throw new Error(`unknown filter ${filter}`);
      cur[x] = v & 0xff;
    }
  }
  return { width, height, channels, data: out };
}

export function pixel(img, x, y) {
  const i = (y * img.width + x) * img.channels;
  return {
    r: img.data[i], g: img.data[i + 1], b: img.data[i + 2],
    a: img.channels === 4 ? img.data[i + 3] : 255,
  };
}

// How many pixels are within `tol` of a colour, and how many are not background at all.
export function census(img, hex, tol = 10) {
  const R = parseInt(hex.slice(1, 3), 16), G = parseInt(hex.slice(3, 5), 16), B = parseInt(hex.slice(5, 7), 16);
  let match = 0, opaque = 0;
  for (let i = 0; i < img.width * img.height; i++) {
    const o = i * img.channels;
    const a = img.channels === 4 ? img.data[o + 3] : 255;
    if (a < 8) continue;
    opaque++;
    if (Math.abs(img.data[o] - R) <= tol && Math.abs(img.data[o + 1] - G) <= tol && Math.abs(img.data[o + 2] - B) <= tol) match++;
  }
  return { match, opaque, total: img.width * img.height };
}

// Bounding box of pixels within `tol` of a colour. Used to check that rendered type has the
// width it should, which is how a font that silently fell back gets caught.
export function bbox(img, hex, tol = 10, region = {}) {
  const fromY = region.fromY || 0, toY = region.toY == null ? img.height : region.toY;
  const R = parseInt(hex.slice(1, 3), 16), G = parseInt(hex.slice(3, 5), 16), B = parseInt(hex.slice(5, 7), 16);
  let x0 = img.width, y0 = img.height, x1 = -1, y1 = -1;
  for (let y = fromY; y < toY; y++) {
    for (let x = 0; x < img.width; x++) {
      const o = (y * img.width + x) * img.channels;
      if (img.channels === 4 && img.data[o + 3] < 8) continue;
      if (Math.abs(img.data[o] - R) <= tol && Math.abs(img.data[o + 1] - G) <= tol && Math.abs(img.data[o + 2] - B) <= tol) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) throw new Error(`no pixels matched ${hex}`);
  return { x0, y0, x1, y1 };
}

// How many pixels carry drawn content: anything not fully transparent, and on an opaque image
// anything that differs from the corner colour, which stands in for the background.
export function inkCount(img) {
  if (img.channels === 4) {
    let n = 0;
    for (let i = 0; i < img.width * img.height; i++) if (img.data[i * 4 + 3] >= 8) n++;
    return n;
  }
  const r0 = img.data[0], g0 = img.data[1], b0 = img.data[2];
  let n = 0;
  for (let i = 0; i < img.width * img.height; i++) {
    const o = i * 3;
    if (Math.abs(img.data[o] - r0) > 6 || Math.abs(img.data[o + 1] - g0) > 6 || Math.abs(img.data[o + 2] - b0) > 6) n++;
  }
  return n;
}
