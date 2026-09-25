// Render every page in a generated .dc.html template to PNG for visual QA.
// Usage: node 2026.09.02_TemplatePreview.mjs input.dc.html output-directory

import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, join, basename } from 'node:path';

const [, , inputArg, outputArg] = process.argv;
if (!inputArg || !outputArg) {
  console.error('usage: node 2026.09.02_TemplatePreview.mjs input.dc.html output-directory');
  process.exit(1);
}
const input = resolve(inputArg);
const output = resolve(outputArg);
const chrome = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!existsSync(chrome)) throw new Error(`Chrome not found at ${chrome}; set CHROME_BIN`);
const source = readFileSync(input, 'utf8');
const style = source.match(/<style>([\s\S]*?)<\/style>/)?.[1];
const pages = [...source.matchAll(/<section class="page (slide|letter|elements)"[\s\S]*?<\/section>/g)];
if (!style || !pages.length) throw new Error(`${input}: no generated pages found`);
mkdirSync(output, { recursive: true });
const dimensions = { slide:[1600,900], elements:[1600,900], letter:[816,1056] };

for (let i=0;i<pages.length;i++) {
  const [,kind] = pages[i];
  const [width,height] = dimensions[kind];
  const dir = mkdtempSync(join(tmpdir(),'aa-template-preview-'));
  try {
    const html = join(dir,'page.html');
    writeFileSync(html, `<!doctype html><html><head><meta charset="utf-8"><style>${style}html,body{display:block;padding:0;background:#fff}.page{margin:0}</style></head><body>${pages[i][0]}</body></html>`);
    const number=String(i+1).padStart(2,'0');
    const png=join(output,`${basename(input,'.dc.html')}-${number}.png`);
    execFileSync(chrome,['--headless','--disable-gpu','--no-sandbox','--hide-scrollbars','--force-device-scale-factor=1','--virtual-time-budget=3000',`--window-size=${width},${height}`,`--screenshot=${png}`,'file://'+html],{stdio:'ignore'});
    const bytes=readFileSync(png);
    if(bytes.readUInt32BE(16)!==width||bytes.readUInt32BE(20)!==height) throw new Error(`${png}: wrong dimensions`);
    console.log(png);
  } finally { rmSync(dir,{recursive:true,force:true}); }
}
