// Build the Strategy cover that extends the approved 2026.09.01 Notion family.
//
// Usage:
//   node brand/Platforms/Notion/2026.09.03_StrategyCoverBuild.mjs
//   node brand/Platforms/Notion/2026.09.03_StrategyCoverBuild.mjs --check

import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..', '..');
const chrome = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const args = process.argv.slice(2);
const check = args.length === 1 && args[0] === '--check';

if ((args.length && !check) || args.length > 1) {
  console.error('usage: node 2026.09.03_StrategyCoverBuild.mjs [--check]');
  process.exit(1);
}
if (!existsSync(chrome)) throw new Error(`Chrome not found at ${chrome}; set CHROME_BIN`);

const font = readFileSync(resolve(root, 'brand/fonts/2026.08.27_DMSerifDisplay_Regular_Latin.woff2')).toString('base64');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="800" viewBox="0 0 2400 800">
  <defs>
    <style>@font-face{font-family:DMSerif;src:url(data:font/woff2;base64,${font}) format('woff2')}</style>
    <radialGradient id="wash" cx="78%" cy="8%" r="92%">
      <stop offset="0" stop-color="#427294" stop-opacity=".42"/>
      <stop offset=".55" stop-color="#1D5372" stop-opacity=".12"/>
      <stop offset="1" stop-color="#1D5372" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="2400" height="800" fill="#1D5372"/>
  <rect width="2400" height="800" fill="url(#wash)"/>
  <g fill="none" stroke="#F0ECE6" stroke-width="5" opacity=".24" stroke-linecap="round" stroke-linejoin="round">
    <path d="M232 196l26-36 26 36-26 36z"/>
    <path d="M182 584h60m-30-30v60"/>
    <path d="M462 520a44 44 0 0 1 88 0"/>
    <circle cx="356" cy="314" r="8" fill="#F0ECE6" stroke="none"/>
    <circle cx="390" cy="314" r="8" fill="#F0ECE6" stroke="none"/>
    <circle cx="424" cy="314" r="8" fill="#F0ECE6" stroke="none"/>
    <circle cx="2074" cy="178" r="45"/>
    <circle cx="2074" cy="178" r="16"/>
    <path d="M2208 556h88m-44-44v88"/>
    <path d="M1878 146h98l58 84h120"/>
    <circle cx="1878" cy="146" r="10" fill="#F0ECE6" stroke="none"/>
    <circle cx="2034" cy="230" r="10" fill="#F0ECE6" stroke="none"/>
    <circle cx="2154" cy="230" r="10" fill="#F0ECE6" stroke="none"/>
    <path d="M1988 622l34-48 34 48-34 48z"/>
    <path d="M2260 348a44 44 0 0 1 88 0"/>
  </g>
  <text x="1200" y="420" fill="#FEFDFB" font-family="DMSerif, Georgia, serif" font-size="154" text-anchor="middle">Strategy</text>
  <path d="M1148 482h104" stroke="#F3E5C2" stroke-width="6" stroke-linecap="round"/>
</svg>`;

const base = '2026.09.03_AlwaysAllow_NotionCover_Strategy';
const svgPath = resolve(here, `${base}.svg`);
const pngPath = resolve(here, `${base}.png`);
const work = mkdtempSync(join(tmpdir(), 'aa-strategy-cover-'));

try {
  const htmlPath = join(work, 'cover.html');
  const freshPng = join(work, `${base}.png`);
  writeFileSync(htmlPath, `<!doctype html><html><style>html,body{margin:0;width:2400px;height:800px;overflow:hidden}</style><img width="2400" height="800" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"></html>`);
  execFileSync(chrome, [
    '--headless', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=1', '--window-size=2400,800',
    `--screenshot=${freshPng}`, `file://${htmlPath}`
  ], { stdio: 'ignore' });

  const png = readFileSync(freshPng);
  if (png.readUInt32BE(16) !== 2400 || png.readUInt32BE(20) !== 800) {
    throw new Error('Strategy cover rendered at the wrong dimensions');
  }

  if (check) {
    let ok = true;
    if (!existsSync(svgPath) || readFileSync(svgPath, 'utf8') !== svg) {
      console.error(`${svgPath}: differs from a fresh build`);
      ok = false;
    } else {
      console.log(`${svgPath}: matches`);
    }
    if (!existsSync(pngPath) || !readFileSync(pngPath).equals(png)) {
      console.error(`${pngPath}: differs from a fresh build`);
      ok = false;
    } else {
      console.log(`${pngPath}: matches`);
    }
    process.exitCode = ok ? 0 : 1;
  } else {
    writeFileSync(svgPath, svg);
    writeFileSync(pngPath, png);
    console.log(`${base}: 2400x800`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
