// Render the two-page Always Allow one-pager to one PDF without cross-page drift.
//
// Chrome can offset fixed-height HTML sections when it paginates a multi-section document. This
// builder renders each section at 2x and composes those verified pages into one PDF, so every page
// uses the exact browser layout that was visually checked.
//
// Usage:
//   node 2026.09.02_OnePagerPdfBuild.mjs --out /path/to/AlwaysAllow_OnePager.pdf

import { readFileSync, writeFileSync, mkdtempSync, rmSync, copyFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(HERE, '..', 'always-allow-one-pager.dc.html');
const CHROME = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const MERGER = resolve(HERE, '2026.09.02_MergePdfPages.swift');
const argv = process.argv.slice(2);
if (argv.length !== 2 || argv[0] !== '--out') {
  console.error('usage: node 2026.09.02_OnePagerPdfBuild.mjs --out /path/to/output.pdf');
  process.exit(1);
}
if (!existsSync(CHROME)) throw new Error(`Chrome not found at ${CHROME}; set CHROME_BIN`);
if (!existsSync(MERGER)) throw new Error(`PDF merger not found at ${MERGER}`);
const target = resolve(argv[1]);
const source = readFileSync(SOURCE, 'utf8');
const style = source.match(/<style>([\s\S]*?)<\/style>/)?.[1];
const pages = [...source.matchAll(/<section class="page letter"[\s\S]*?<\/section>/g)].map(m=>m[0]);
if (!style || pages.length !== 2) throw new Error(`${SOURCE}: expected exactly two letter pages`);

const work = mkdtempSync(join(tmpdir(), 'aa-one-pager-pdf-'));
try {
  const pageImages=[];
  pages.forEach((page,index)=>{
    const html=join(work,`page-${index+1}.html`);
    const png=join(work,`page-${index+1}.png`);
    writeFileSync(html,`<!doctype html><html><head><meta charset="utf-8"><style>${style}html,body{display:block;padding:0;background:#fff}.page{margin:0}</style></head><body>${page}</body></html>`);
    execFileSync(CHROME,['--headless','--disable-gpu','--no-sandbox','--hide-scrollbars','--force-device-scale-factor=2','--window-size=816,1056',`--screenshot=${png}`,'file://'+html],{stdio:'ignore'});
    if (process.env.AA_PDF_DEBUG_DIR) {
      copyFileSync(png,resolve(process.env.AA_PDF_DEBUG_DIR,`one-pager-source-page-${index+1}.png`));
    }
    pageImages.push(png);
  });
  const merged=join(work,'merged.pdf');
  execFileSync('swift',[MERGER,merged,...pageImages],{stdio:'ignore'});
  copyFileSync(merged,target);
  console.log(`${target}: ${readFileSync(target).length} bytes, 2 pages`);
} finally { rmSync(work,{recursive:true,force:true}); }
