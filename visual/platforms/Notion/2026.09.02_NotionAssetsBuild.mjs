// Build the Always Allow Notion team/page covers and page icons from the approved light system.
//
// Usage:
//   node brand/Platforms/Notion/2026.09.02_NotionAssetsBuild.mjs
//   node brand/Platforms/Notion/2026.09.02_NotionAssetsBuild.mjs --check
//
// Both SVG sources and PNG upload files are generated. Never hand-edit either output.

import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..', '..');
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const argv = process.argv.slice(2);
if (argv.length > 1 || (argv.length && argv[0] !== '--check')) {
  console.error('usage: node 2026.09.02_NotionAssetsBuild.mjs [--check]');
  process.exit(1);
}
const CHECK = argv[0] === '--check';
if (!existsSync(CHROME)) throw new Error(`Chrome not found at ${CHROME}; set CHROME_BIN`);

const b64 = path => readFileSync(path).toString('base64');
const inter = b64(resolve(ROOT, 'brand/fonts/2026.08.27_Inter_Regular_Latin.woff2'));
const serif = b64(resolve(ROOT, 'brand/fonts/2026.08.27_DMSerifDisplay_Regular_Latin.woff2'));
const lockup = b64(resolve(ROOT, 'brand/logos/2026.08.27_Lockup.svg'));
const master = b64(resolve(ROOT, 'brand/logos/2026.08.27_LogoMaster.svg'));
const small = b64(resolve(ROOT, 'brand/logos/2026.08.27_LogoMarkSmall.svg'));
const C = { canvas:'#FEFDFB', bone:'#F0ECE6', deep:'#E7E0D4', line:'#E3DDD2', ink:'#344650', muted:'#427294', accent:'#1D5372', gold:'#F3E5C2' };

const defs = `<defs>
  <style>@font-face{font-family:Inter;src:url(data:font/woff2;base64,${inter}) format('woff2')}@font-face{font-family:DMSerif;src:url(data:font/woff2;base64,${serif}) format('woff2')}.sans{font-family:Inter,-apple-system,sans-serif}.serif{font-family:DMSerif,Georgia,serif}</style>
  <radialGradient id="wash" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${C.accent}" stop-opacity=".16"/><stop offset=".48" stop-color="${C.accent}" stop-opacity=".055"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient>
</defs>`;
const image = (href,x,y,w,h=w) => `<image href="data:image/svg+xml;base64,${href}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet"/>`;
const star = (x,y,r) => `<path d="M${x} ${y-r}C${x+r*.28} ${y-r*.28} ${x+r*.28} ${y-r*.28} ${x+r} ${y}C${x+r*.28} ${y+r*.28} ${x+r*.28} ${y+r*.28} ${x} ${y+r}C${x-r*.28} ${y+r*.28} ${x-r*.28} ${y+r*.28} ${x-r} ${y}C${x-r*.28} ${y-r*.28} ${x-r*.28} ${y-r*.28} ${x} ${y-r}Z" fill="none" stroke="${C.accent}" stroke-width="3"/>`;
const ring = (x,y,r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${C.accent}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${r*.23}" fill="${C.accent}"/>`;
const cross = (x,y,r) => `<path d="M${x-r} ${y}H${x+r}M${x} ${y-r}V${y+r}" fill="none" stroke="${C.accent}" stroke-width="3" stroke-linecap="round"/>`;
const diamond = (x,y,r) => `<path d="M${x} ${y-r}L${x+r*.72} ${y}L${x} ${y+r}L${x-r*.72} ${y}Z" fill="none" stroke="${C.accent}" stroke-width="3"/>`;
const field = () => `${star(2220,95,30)}${ring(2020,360,27)}${cross(1730,82,22)}${diamond(2260,368,28)}<circle cx="1885" cy="370" r="7" fill="${C.accent}"/><circle cx="1920" cy="370" r="7" fill="${C.accent}"/><circle cx="1955" cy="370" r="7" fill="${C.accent}"/>`;

const motifs = {
  Team: `${image(master,1752,103,230,230)}${star(2110,196,44)}${ring(2240,88,25)}`,
  Brand: `${image(master,1800,86,270,270)}${star(2140,116,35)}${ring(2220,315,30)}`,
  Content: `<g transform="translate(1770 90)"><rect width="340" height="270" rx="22" fill="#fff" stroke="${C.line}"/><rect x="30" y="35" width="112" height="14" rx="7" fill="${C.ink}"/><rect x="30" y="82" width="278" height="12" rx="6" fill="${C.deep}"/><rect x="30" y="112" width="235" height="12" rx="6" fill="${C.deep}"/><rect x="30" y="164" width="130" height="70" rx="12" fill="${C.bone}" stroke="${C.line}"/>${star(260,202,26)}</g>`,
  CRM: `<g transform="translate(1760 88)" fill="#fff" stroke="${C.accent}" stroke-width="3"><path d="M70 75H180M210 75H320M195 90V220M195 220H105M195 220H285" fill="none"/><rect x="10" y="30" width="70" height="90" rx="16"/><rect x="160" y="30" width="70" height="90" rx="16"/><rect x="310" y="30" width="70" height="90" rx="16"/><rect x="65" y="190" width="80" height="70" rx="16"/><rect x="245" y="190" width="80" height="70" rx="16"/></g>`,
  Ops: `<g transform="translate(1820 78)" fill="none" stroke="${C.accent}" stroke-width="5" stroke-linecap="round"><path d="M280 85A120 120 0 1 0 305 210"/><path d="M278 48L282 89L240 84"/><path d="M308 248L304 207L346 212"/></g>${image(small,1928,166,100,100)}`,
  Stickers: `${star(1820,110,48)}${ring(2000,98,38)}${cross(2170,138,42)}${diamond(1880,298,46)}${image(small,2002,218,118,118)}${ring(2220,310,31)}`,
  Assets: `<g transform="translate(1760 80)">${[0,1,2].map(i=>`<rect x="${i*125}" y="0" width="100" height="120" rx="16" fill="#fff" stroke="${C.line}"/><rect x="${i*125+20}" y="22" width="60" height="60" rx="12" fill="${C.bone}"/><rect x="${i*125+20}" y="94" width="54" height="7" rx="3.5" fill="${C.deep}"/>`).join('')}${[0,1,2].map(i=>`<rect x="${i*125}" y="155" width="100" height="120" rx="16" fill="#fff" stroke="${C.line}"/><rect x="${i*125+20}" y="177" width="60" height="60" rx="12" fill="${C.bone}"/><rect x="${i*125+20}" y="249" width="54" height="7" rx="3.5" fill="${C.deep}"/>`).join('')}</g>`
};

function cover(name, title, subtitle) {
  const team = name === 'Team';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="460" viewBox="0 0 2400 460">${defs}<rect width="2400" height="460" fill="${C.canvas}"/><ellipse cx="2070" cy="10" rx="730" ry="430" fill="url(#wash)"/><ellipse cx="250" cy="520" rx="700" ry="320" fill="url(#wash)" opacity=".56"/>${team?field():''}<g>${image(lockup,96,54,275,38)}</g><g class="sans"><text x="96" y="${team?224:207}" font-size="18" font-weight="700" letter-spacing="2.6" fill="${C.ink}">${team?'ALWAYS ALLOW WORKSPACE':'WORKSPACE / '+name.toUpperCase()}</text></g><g class="serif" fill="${C.ink}"><text x="96" y="${team?308:300}" font-size="${team?66:76}">${title}</text></g><g class="sans"><text x="96" y="${team?355:350}" font-size="24" fill="${C.muted}">${subtitle}</text></g>${motifs[name]}</svg>`;
}

function icon(name) {
  const inner = {
    Team: image(master,128,118,256,256),
    Brand: image(master,142,132,228,228),
    Content: `<rect x="145" y="126" width="222" height="260" rx="25" fill="#fff" stroke="${C.line}" stroke-width="3"/><rect x="182" y="176" width="92" height="17" rx="8" fill="${C.ink}"/><rect x="182" y="223" width="148" height="13" rx="6" fill="${C.deep}"/><rect x="182" y="257" width="112" height="13" rx="6" fill="${C.deep}"/>${star(303,329,34)}`,
    CRM: `<g fill="#fff" stroke="${C.accent}" stroke-width="5"><path d="M155 190H256M256 190H357M256 190V320M256 320H184M256 320H328" fill="none"/><circle cx="145" cy="190" r="44"/><circle cx="256" cy="190" r="44"/><circle cx="367" cy="190" r="44"/><circle cx="176" cy="330" r="38"/><circle cx="336" cy="330" r="38"/></g>`,
    Ops: `<g fill="none" stroke="${C.accent}" stroke-width="9" stroke-linecap="round"><path d="M347 181A118 118 0 1 0 360 304"/><path d="M344 135L348 184L299 180"/><path d="M362 348L359 301L407 305"/></g>${image(small,206,206,100,100)}`,
    Stickers: `${star(176,180,48)}${ring(324,170,39)}${cross(347,325,43)}${diamond(184,340,44)}${image(small,220,222,82,82)}`,
    Assets: `<g>${[[150,150],[262,150],[150,262],[262,262]].map(([x,y])=>`<rect x="${x}" y="${y}" width="100" height="100" rx="20" fill="#fff" stroke="${C.line}" stroke-width="3"/><rect x="${x+25}" y="${y+25}" width="50" height="50" rx="12" fill="${C.bone}"/>`).join('')}</g>`
  }[name];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${defs}<rect width="512" height="512" fill="${C.canvas}"/><circle cx="410" cy="80" r="250" fill="url(#wash)"/><rect x="72" y="72" width="368" height="368" rx="78" fill="${C.bone}" stroke="${C.line}" stroke-width="3"/>${inner}</svg>`;
}

const items = [
  ['Team','See the patterns. Build your systems.','AI workshops for people who learn by building.'],
  ['Brand','Brand','The source for marks, type, color, and approved visual rules.'],
  ['Content','Content','What Always Allow publishes, teaches, and shares.'],
  ['CRM','CRM','People, relationships, and the next useful follow-up.'],
  ['Ops','Operations','The systems that keep the work moving.'],
  ['Stickers','Stickers','Small signals for work worth noticing.'],
  ['Assets','Assets','Downloadable sources, templates, and platform exports.']
];

function render(svg, pngPath, width, height) {
  const dir = mkdtempSync(join(tmpdir(), 'aa-notion-'));
  try {
    const html = join(dir, 'asset.html');
    writeFileSync(html, `<!doctype html><html><style>html,body{margin:0;width:${width}px;height:${height}px;overflow:hidden;background:${C.canvas}}img{display:block;width:${width}px;height:${height}px}</style><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}">`);
    execFileSync(CHROME, ['--headless','--disable-gpu','--no-sandbox','--hide-scrollbars','--force-device-scale-factor=1',`--window-size=${width},${height}`,`--screenshot=${pngPath}`,'file://'+html], {stdio:'ignore'});
  } finally { rmSync(dir,{recursive:true,force:true}); }
}

const work = mkdtempSync(join(tmpdir(), 'aa-notion-build-'));
let ok = true;
try {
  for (const [name,title,subtitle] of items) {
    for (const [kind,svg,width,height] of [['NotionCover',cover(name,title,subtitle),2400,460],['NotionPageIcon',icon(name),512,512]]) {
      const base = `2026.09.02_AlwaysAllow_${kind}_${name}`;
      const svgPath = resolve(HERE, base+'.svg');
      const pngPath = resolve(HERE, base+'.png');
      const freshPng = resolve(work, base+'.png');
      render(svg,freshPng,width,height);
      const png = readFileSync(freshPng);
      if (png.readUInt32BE(16)!==width || png.readUInt32BE(20)!==height) throw new Error(`${base}: wrong PNG dimensions`);
      if (CHECK) {
        if (!existsSync(svgPath) || readFileSync(svgPath,'utf8')!==svg) { console.error(`${svgPath}: differs from a fresh build`); ok=false; }
        else console.log(`${svgPath}: matches`);
        if (!existsSync(pngPath) || !readFileSync(pngPath).equals(png)) { console.error(`${pngPath}: differs from a fresh build`); ok=false; }
        else console.log(`${pngPath}: matches`);
      } else {
        writeFileSync(svgPath,svg); writeFileSync(pngPath,png);
        console.log(`${base}: ${width}x${height}`);
      }
    }
  }
} finally { rmSync(work,{recursive:true,force:true}); }
process.exit(ok?0:1);
