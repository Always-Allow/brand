import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readPng, inkCount } from '../visual/logos/build/2026.08.27_PngInspect.mjs';
import { captureReadyPage, chromeArguments } from '../visual/logos/build/capture-ready-page.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const buildDir = path.join(root, 'visual/logos/build');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
// Exercise the private verifiers directly, before their command-line entry points.
function load(file, boundary, names, extra = {}) {
  let source = fs.readFileSync(path.join(buildDir, file), 'utf8').split(boundary)[0];
  source = source.replace(/^import .*;$/gm, '').replace(/^export /gm, '')
    .replaceAll('import.meta.url', JSON.stringify(pathToFileURL(path.join(buildDir, file)).href));
  const context = vm.createContext({ ...fs, ...path, tmpdir, createHash, readPng, inkCount,
    Buffer, process, fileURLToPath, console: { log() {}, error() {} }, ...extra });
  return vm.runInContext(`${source}\n({${names.join(',')}})`, context);
}
const wordmark = load('2026.08.27_WordmarkBuild.mjs', 'const [, , inPath', ['build', 'verify']);
const avatar = load('2026.08.27_AvatarBuild.mjs', 'const [, , markPath', ['build', 'verify']);
const source = read('visual/logos/build/2026.08.27_WordmarkSource.svg');
const mark = read('visual/logos/2026.08.27_LogoMarkSmall.svg');

test('wordmark preserves approved bytes', () => {
  assert.equal(wordmark.build(source), read('visual/logos/2026.08.27_Wordmark.svg'));
});
test('wordmark rejects a same-length outline mutation', () => {
  const out = wordmark.build(source);
  const changed = out.replace(/(<path\b[^>]*\sd="[^"0-9]*)([0-9])/, (_, prefix, n) => prefix + ((+n + 1) % 10));
  assert.notEqual(changed, out); assert.equal(changed.length, out.length);
  assert.throws(() => wordmark.verify(source, changed, source.length - out.length), /output paths differ/);
});
test('avatar preserves approved bytes', () => {
  assert.equal(avatar.build(mark, 500), read('visual/logos/2026.08.27_Avatar.svg'));
});
for (const [name, pattern, replacement] of [
  ['viewBox', /viewBox="[^"]*"/, 'viewBox="0 0 501 500"'],
  ['x', /<rect x="0"/, '<rect x="1"'],
  ['y', / y="0"/, ' y="1"'],
  ['width', /width="500"/, 'width="499"'],
  ['height', /height="500"/, 'height="499"'],
  ['radius', /rx="[^"]*"/, 'rx="1"'],
  ['translate', /translate\([^,]+,/, 'translate(1,'],
  ['scale', /scale\([^)]*\)/, 'scale(1)'],
]) test(`avatar rejects emitted ${name} mutation`, () => {
  const out = avatar.build(mark, 500), changed = out.replace(pattern, replacement);
  assert.notEqual(changed, out);
  assert.throws(() => avatar.verify(changed, mark, 500), /avatar/);
});

function withRaster(fn) {
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'aa-regression-'));
  const svg = path.join(dir, 'source.svg'), out = path.join(dir, 'output.png');
  fs.writeFileSync(svg, '<svg/>'); fs.writeFileSync(out, 'existing approved image');
  let renderer = () => { throw new Error('renderer failed'); };
  const api = load('2026.08.27_RasterExport.mjs', 'const argv =', ['render', 'check', 'validateManifest'], {
    existsSync: p => p === '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' || fs.existsSync(p),
    execFileSync: (_bin, args) => renderer(args.find(s => s.startsWith('--screenshot=')).slice(13)),
  });
  try { return fn({ ...api, dir, svg, out, setRenderer: f => { renderer = f; } }); }
  finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
const pngPath = path.join(root, 'visual/logos/2026.08.27_LogoMarkSmall_128.png');
const png = fs.readFileSync(pngPath);
for (const mode of ['renderer error', 'invalid PNG', 'wrong dimensions']) {
  test(`raster keeps destination and removes staging after ${mode}`, () => withRaster(r => {
    if (mode === 'invalid PNG') r.setRenderer(p => fs.writeFileSync(p, 'bad png'));
    if (mode === 'wrong dimensions') r.setRenderer(p => fs.writeFileSync(p, png));
    assert.throws(() => r.render(r.svg, 32, 32, r.out));
    assert.equal(fs.readFileSync(r.out, 'utf8'), 'existing approved image');
    assert.equal(fs.readdirSync(r.dir).filter(p => p.startsWith('.aa-raster-')).length, 0);
  }));
}
test('raster publishes validated output', () => withRaster(r => {
  r.setRenderer(p => fs.writeFileSync(p, png)); r.render(r.svg, 128, 128, r.out);
  assert.deepEqual(fs.readFileSync(r.out), png);
}));
test('raster check rejects different bytes with identical decoded pixels', () => withRaster(r => {
  const changed = Buffer.concat([png, Buffer.from('trailing metadata')]);
  assert.deepEqual(readPng(changed), readPng(png));
  fs.writeFileSync(r.out, changed); r.setRenderer(p => fs.writeFileSync(p, png));
  assert.equal(r.check({ svg: r.svg, w: 128, h: 128, out: r.out }), false);
  assert.deepEqual(fs.readFileSync(r.out), changed);
}));
test('raster check accepts identical bytes', () => withRaster(r => {
  fs.writeFileSync(r.out, png); r.setRenderer(p => fs.writeFileSync(p, png));
  assert.equal(r.check({ svg: r.svg, w: 128, h: 128, out: r.out }), true);
}));
test('custom manifest does not require an unrelated imported reference', () => withRaster(r => {
  fs.unlinkSync(r.out);
  const out = path.join(r.dir, 'render_128.png'); fs.writeFileSync(out, png);
  const rows = [{ svg: r.svg, w: 128, h: 128, out }];
  assert.equal(r.validateManifest(rows), rows);
}));
test('canonical manifest requires the imported reference', () => {
  const api = load('2026.08.27_RasterExport.mjs', 'const argv =', ['validateManifest'], {
    existsSync: p => String(p).endsWith('2026.09.10_AlwaysAllow_FullCompanyLockup_NameOnly.png') ? false : fs.existsSync(p),
  });
  const rows = JSON.parse(read('visual/logos/build/2026.08.27_RasterManifest.json'))
    .map(row => ({ ...row, svg: path.join(root, row.svg), out: path.join(root, row.out) }));
  assert.throws(() => api.validateManifest(rows), /approved reference is missing/);
});
test('canonical imported reference is hash checked', () => {
  const api = load('2026.08.27_RasterExport.mjs', 'const argv =', ['validateManifest'], {
    readFileSync: (p, ...args) => String(p).endsWith('2026.09.10_AlwaysAllow_FullCompanyLockup_NameOnly.png') ? Buffer.from('altered') : fs.readFileSync(p, ...args),
  });
  const rows = JSON.parse(read('visual/logos/build/2026.08.27_RasterManifest.json'))
    .map(row => ({ ...row, svg: path.join(root, row.svg), out: path.join(root, row.out) }));
  assert.throws(() => api.validateManifest(rows), /reference hash differs/);
});
test('custom folder cannot hide an unlisted PNG behind the reference basename', () => withRaster(r => {
  fs.unlinkSync(r.out);
  const out = path.join(r.dir, 'render_128.png'); fs.writeFileSync(out, png);
  fs.copyFileSync(path.join(root, 'visual/logos/2026.09.10_AlwaysAllow_FullCompanyLockup_NameOnly.png'),
    path.join(r.dir, '2026.09.10_AlwaysAllow_FullCompanyLockup_NameOnly.png'));
  assert.throws(() => r.validateManifest([{ svg: r.svg, w: 128, h: 128, out }]), /not in the manifest/);
}));
for (const [platform, uid, needsFlag] of [['linux', 0, true], ['linux', 1000, false], ['darwin', 0, false]]) {
  test(`Chrome root-container compatibility: ${platform} uid ${uid}`, () => {
    const args = chromeArguments('/private/profile', platform, uid);
    assert.equal(args.includes('--no-sandbox'), needsFlag);
    assert.ok(args.includes('--remote-debugging-pipe'));
    assert.ok(args.includes('--user-data-dir=/private/profile'));
  });
}

test('capture rejects missing Chrome and preserves target', async () => {
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'aa-capture-test-'));
  const target = path.join(dir, 'out.png'); fs.writeFileSync(target, 'approved');
  try {
    await assert.rejects(captureReadyPage(path.join(dir, 'missing-browser'), path.join(dir, 'page.html'), target, 100, 100, '20px Missing'));
    assert.equal(fs.readFileSync(target, 'utf8'), 'approved');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
const chrome = process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
test('real Chrome rejects missing embedded font before replacing target', async () => {
  assert.ok(fs.existsSync(chrome), 'Chrome is required for this suite; set CHROME_BIN to its executable');
  const dir = fs.mkdtempSync(path.join(tmpdir(), 'aa-font-test-'));
  const page = path.join(dir, 'page.html'), target = path.join(dir, 'out.png');
  fs.writeFileSync(page, '<!doctype html><p>Missing font</p>'); fs.writeFileSync(target, 'approved');
  try {
    await assert.rejects(captureReadyPage(chrome, page, target, 100, 100, '20px MissingEmbeddedFont'), /readiness failed/);
    assert.equal(fs.readFileSync(target, 'utf8'), 'approved');
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
