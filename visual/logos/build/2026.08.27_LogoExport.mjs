// Always Allow logo master export script. Lane 5b.1 of the visual rebuild plan.
// The construction and the numbers below were locked by Sarah on 2026-08-27.
// The generator code is carried verbatim from the Keycap Tipping Room
// (was tracked beside this file as 2026.08.27_KeycapTippingRoom.html until Sarah retired it on 2026-09-02, also artifact
// d46423ef-7904-4021-85ad-3c7ae40616e6). Change nothing here without a new
// locked readout from Sarah; hand edits to the SVGs are forbidden.
//
// Usage:
//   node 2026.08.27_LogoExport.mjs            regenerate the master SVG in place
//   node 2026.08.27_LogoExport.mjs --check    verify committed files match the generator byte for byte
//
// PNG rendering for derived variants is a separate step (plan 5b.2 onward):
// use 2026.08.27_RasterExport.mjs. Do NOT use qlmanage. It is a thumbnailer, it pads
// non-square artwork into a square and it flattens transparency to white, both measured
// on this master on 2026-08-27.

import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const LOCKED = { back: 10, dip: 5, depth: 42, side: 55, thick: 12, glimmer: 60 };

// ---- generator, verbatim from the Tipping Room ----

const CMD=`<g><path d="M 40.359375 2.421875 C 35.910156 2.421875 31.84375 1.320312 28.15625 -0.875 C 24.46875 -3.070312 21.535156 -6.015625 19.359375 -9.703125 C 17.191406 -13.390625 16.109375 -17.457031 16.109375 -21.90625 C 16.109375 -26.394531 17.191406 -30.484375 19.359375 -34.171875 C 21.535156 -37.859375 24.46875 -40.8125 28.15625 -43.03125 C 31.84375 -45.25 35.910156 -46.359375 40.359375 -46.359375 L 51.5625 -46.359375 L 51.5625 -62.921875 L 40.359375 -62.921875 C 35.910156 -62.921875 31.84375 -64.003906 28.15625 -66.171875 C 24.46875 -68.347656 21.535156 -71.28125 19.359375 -74.96875 C 17.191406 -78.65625 16.109375 -82.742188 16.109375 -87.234375 C 16.109375 -91.671875 17.191406 -95.722656 19.359375 -99.390625 C 21.535156 -103.054688 24.46875 -105.984375 28.15625 -108.171875 C 31.84375 -110.367188 35.910156 -111.46875 40.359375 -111.46875 C 44.847656 -111.46875 48.9375 -110.367188 52.625 -108.171875 C 56.3125 -105.984375 59.265625 -103.054688 61.484375 -99.390625 C 63.703125 -95.722656 64.8125 -91.671875 64.8125 -87.234375 L 64.8125 -76.09375 L 81.375 -76.09375 L 81.375 -87.234375 C 81.375 -91.671875 82.457031 -95.722656 84.625 -99.390625 C 86.800781 -103.054688 89.734375 -105.984375 93.421875 -108.171875 C 97.109375 -110.367188 101.195312 -111.46875 105.6875 -111.46875 C 110.175781 -111.46875 114.265625 -110.367188 117.953125 -108.171875 C 121.640625 -105.984375 124.566406 -103.054688 126.734375 -99.390625 C 128.910156 -95.722656 130 -91.671875 130 -87.234375 C 130 -82.742188 128.910156 -78.664062 126.734375 -75 C 124.566406 -71.332031 121.640625 -68.398438 117.953125 -66.203125 C 114.265625 -64.015625 110.175781 -62.921875 105.6875 -62.921875 L 94.5625 -62.921875 L 94.5625 -46.359375 L 105.6875 -46.359375 C 110.175781 -46.359375 114.265625 -45.25 117.953125 -43.03125 C 121.640625 -40.8125 124.566406 -37.859375 126.734375 -34.171875 C 128.910156 -30.484375 130 -26.394531 130 -21.90625 C 130 -17.457031 128.910156 -13.390625 126.734375 -9.703125 C 124.566406 -6.015625 121.640625 -3.070312 117.953125 -0.875 C 114.265625 1.320312 110.175781 2.421875 105.6875 2.421875 C 101.195312 2.421875 97.117188 1.320312 93.453125 -0.875 C 89.796875 -3.070312 86.867188 -6.015625 84.671875 -9.703125 C 82.472656 -13.390625 81.375 -17.457031 81.375 -21.90625 L 81.375 -33.03125 L 64.8125 -33.03125 L 64.8125 -21.90625 C 64.8125 -17.457031 63.703125 -13.390625 61.484375 -9.703125 C 59.265625 -6.015625 56.3125 -3.070312 52.625 -0.875 C 48.9375 1.320312 44.847656 2.421875 40.359375 2.421875 Z M 40.359375 -10.765625 C 42.410156 -10.816406 44.289062 -11.328125 46 -12.296875 C 47.707031 -13.273438 49.0625 -14.617188 50.0625 -16.328125 C 51.0625 -18.035156 51.5625 -19.894531 51.5625 -21.90625 L 51.5625 -33.03125 L 40.359375 -33.03125 C 38.359375 -33.03125 36.515625 -32.53125 34.828125 -31.53125 C 33.140625 -30.53125 31.796875 -29.1875 30.796875 -27.5 C 29.796875 -25.8125 29.296875 -23.945312 29.296875 -21.90625 C 29.296875 -19.894531 29.796875 -18.035156 30.796875 -16.328125 C 31.796875 -14.617188 33.140625 -13.273438 34.828125 -12.296875 C 36.515625 -11.328125 38.359375 -10.816406 40.359375 -10.765625 Z M 40.359375 -76.09375 L 51.5625 -76.09375 L 51.5625 -87.234375 C 51.5625 -89.285156 51.046875 -91.140625 50.015625 -92.796875 C 48.992188 -94.453125 47.648438 -95.769531 45.984375 -96.75 C 44.328125 -97.726562 42.453125 -98.21875 40.359375 -98.21875 C 38.359375 -98.21875 36.515625 -97.726562 34.828125 -96.75 C 33.140625 -95.769531 31.796875 -94.453125 30.796875 -92.796875 C 29.796875 -91.140625 29.296875 -89.285156 29.296875 -87.234375 C 29.296875 -85.179688 29.796875 -83.3125 30.796875 -81.625 C 31.796875 -79.945312 33.140625 -78.601562 34.828125 -77.59375 C 36.515625 -76.59375 38.359375 -76.09375 40.359375 -76.09375 Z M 94.5625 -76.09375 L 105.6875 -76.09375 C 107.738281 -76.09375 109.59375 -76.59375 111.25 -77.59375 C 112.914062 -78.601562 114.25 -79.945312 115.25 -81.625 C 116.25 -83.3125 116.75 -85.179688 116.75 -87.234375 C 116.75 -89.285156 116.25 -91.140625 115.25 -92.796875 C 114.25 -94.453125 112.914062 -95.769531 111.25 -96.75 C 109.59375 -97.726562 107.738281 -98.21875 105.6875 -98.21875 C 103.632812 -98.21875 101.765625 -97.726562 100.078125 -96.75 C 98.398438 -95.769531 97.0625 -94.453125 96.0625 -92.796875 C 95.0625 -91.140625 94.5625 -89.285156 94.5625 -87.234375 Z M 105.6875 -10.765625 C 107.738281 -10.816406 109.59375 -11.328125 111.25 -12.296875 C 112.914062 -13.273438 114.25 -14.617188 115.25 -16.328125 C 116.25 -18.035156 116.75 -19.894531 116.75 -21.90625 C 116.75 -23.945312 116.25 -25.8125 115.25 -27.5 C 114.25 -29.1875 112.914062 -30.53125 111.25 -31.53125 C 109.59375 -32.53125 107.738281 -33.03125 105.6875 -33.03125 L 94.5625 -33.03125 L 94.5625 -21.90625 C 94.5625 -19.894531 95.0625 -18.035156 96.0625 -16.328125 C 97.0625 -14.617188 98.398438 -13.273438 100.078125 -12.296875 C 101.765625 -11.328125 103.632812 -10.816406 105.6875 -10.765625 Z M 64.8125 -46.359375 L 81.375 -46.359375 L 81.375 -62.921875 L 64.8125 -62.921875 Z M 64.8125 -46.359375 "/></g>`;
const INK='#344650', PETROL='#1D5372', PETROL_DARK='#3C7FA2', BONE='#F0ECE6';
const FX=15, FY=11.117519, FW=450;
function rtrap(x,y,w,h,ins,rt,rb){
  const TL=[x+ins,y],TR=[x+w-ins,y],BR=[x+w,y+h],BL=[x,y+h];
  const u=(a,b)=>{const d=Math.hypot(b[0]-a[0],b[1]-a[1]);return[(b[0]-a[0])/d,(b[1]-a[1])/d]};
  const corners=[[BL,TL,TR,rt],[TL,TR,BR,rt],[TR,BR,BL,rb],[BR,BL,TL,rb]].map(([A,C,B,r])=>{
    const ua=u(C,A),ub=u(C,B);
    return[[C[0]+ua[0]*r,C[1]+ua[1]*r],C,[C[0]+ub[0]*r,C[1]+ub[1]*r]];});
  let d=`M ${corners[0][2][0].toFixed(2)} ${corners[0][2][1].toFixed(2)} `;
  for(let i=1;i<=4;i++){const[s,c,e]=corners[i%4];
    d+=`L ${s[0].toFixed(2)} ${s[1].toFixed(2)} Q ${c[0].toFixed(2)} ${c[1].toFixed(2)} ${e[0].toFixed(2)} ${e[1].toFixed(2)} `;}
  return d+'Z';}
function build(tip,dip,TYv,sideR,TH,dark,glimAmt){
  const H0=277.76;
  const insX=tip*3.0;          // how far the top-left corner pulls in
  const dropY=dip*3.2;         // how far the top-left corner drops
  const TXv=TYv*sideR/100;
  function rquad(P,R){
    const u=(a,b)=>{const d=Math.hypot(b[0]-a[0],b[1]-a[1]);return[(b[0]-a[0])/d,(b[1]-a[1])/d]};
    const c=[];
    for(let i=0;i<4;i++){
      const A=P[(i+3)%4],C=P[i],B=P[(i+1)%4],r=R[i];
      const ua=u(C,A),ub=u(C,B);
      c.push([[C[0]+ua[0]*r,C[1]+ua[1]*r],C,[C[0]+ub[0]*r,C[1]+ub[1]*r]]);}
    let d=`M ${c[0][2][0].toFixed(2)} ${c[0][2][1].toFixed(2)} `;
    for(let i=1;i<=4;i++){const[st,ce,en]=c[i%4];
      d+=`L ${st[0].toFixed(2)} ${st[1].toFixed(2)} Q ${ce[0].toFixed(2)} ${ce[1].toFixed(2)} ${en[0].toFixed(2)} ${en[1].toFixed(2)} `;}
    return d+'Z';}
  function tile(x,y){
    // TL pulled in and dropped; TR, BR, BL square. bottom horizontal, right vertical.
    return rquad([[x+insX,y+dropY],[x+FW,y],[x+FW,y+H0],[x,y+H0]],[38,45,45,45]);}
  const face=tile(FX,FY), slab=tile(FX+TXv,FY+TYv);
  const GY=FY+TYv+H0+6;
  const VB=`${(FX-18).toFixed(1)} ${(FY-16).toFixed(1)} ${(FW+TXv+46).toFixed(1)} ${(H0+TYv+TH+62).toFixed(1)}`;
  const slabFill=dark?PETROL_DARK:PETROL;
  const groundShadow=dark?'':`<rect x="${(FX+TXv+38).toFixed(1)}" y="${(GY+TH).toFixed(1)}" width="${(FW-76).toFixed(1)}" height="24" rx="12" fill="rgba(28,45,58,0.30)" filter="url(#g0)"/>`;
  const sheen=glimAmt>0?`<path d="${face}" fill="url(#sh0)"/>`:'';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VB}">
<defs>
<linearGradient id="f0" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="${BONE}"/></linearGradient>
<linearGradient id="sh0" x1="0" y1="0" x2="1" y2="0.47"><stop offset="0.06" stop-color="rgba(255,255,255,0)"/><stop offset="${(0.115).toFixed(3)}" stop-color="rgba(255,255,255,${(glimAmt/100).toFixed(2)})"/><stop offset="${(0.17+glimAmt*0.0009).toFixed(3)}" stop-color="rgba(255,255,255,0)"/></linearGradient>
<filter id="s0" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>
<filter id="g0" x="-60%" y="-150%" width="220%" height="400%"><feGaussianBlur stdDeviation="16"/></filter>
<clipPath id="c0"><path d="${slab}"/></clipPath>
</defs>
${groundShadow}
<g transform="translate(${(TH*0.35).toFixed(1)},${TH})"><path d="${slab}" fill="${dark?'#2A5E7C':'#14384D'}"/></g>
<path d="${slab}" fill="${slabFill}"/>
<g clip-path="url(#c0)"><g transform="translate(${(TXv*0.5).toFixed(1)},${(TYv*0.5).toFixed(1)})"><path d="${face}" fill="rgba(22,36,46,0.38)" filter="url(#s0)"/></g></g>
<g transform="translate(${(TH*0.35).toFixed(1)},${TH})"><path d="${face}" fill="#C2CBD1"/></g>
<path d="${face}" fill="url(#f0)" stroke="rgba(52,70,80,0.35)" stroke-width="4"/>
${sheen}
<g fill="${INK}"><g transform="translate(98.198753, 204.514846)">${CMD}</g></g>
<g stroke="${INK}" stroke-width="13.19" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M 386.4 99.6 L 386.4 171 L 310 171"/></g>
<path d="M 271 171 L 309 145 L 309 197 Z" fill="${INK}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>
</svg>`;}
// ---- end verbatim generator ----

// The generator's viewBox stops short of where the ground shadow actually ends, so the master
// cut its own shadow off in a straight horizontal line across the bottom edge. Measured on the
// shipped png/2026.08.27_LogoMaster-1054x800.png (png/ is brand/logos/ since 2026-09-02), the final row still carried alpha 12 of 255
// across 724 pixels, and it read as a step of 11 to 12 levels on canvas, on bone and on white,
// so no ground was safe from it.
//
// This does not touch the construction. Every path, colour and locked number is exactly what
// build() returned; only the window onto them grows, downward, by 20 units.
//
// The bound is the shadow filter's OWN region rather than the Gaussian tail, and it is read
// back out of the emitted markup rather than restated here, so that changing the filter moves
// the padding with it. Filter g0 is declared y="-150%" height="400%" against the shadow rect,
// which puts its floor 2.5 rect-heights below the rect's top and draws nothing below that.
// Verified by rendering: at 413.8, 420 and 460 units the last drawn row is 837 in all three,
// which is what makes 413.8 the smallest window that clips nothing.
function shadowFloor(svg) {
  const rect = svg.match(/<rect[^>]*\sy="([\d.]+)"[^>]*\sheight="([\d.]+)"[^>]*filter="url\(#g0\)"/);
  if (!rect) return null;   // a build with dark enabled draws no ground shadow, so it needs no padding
  const filter = svg.match(/<filter id="g0"[^>]*\sy="(-?[\d.]+)%"[^>]*\sheight="([\d.]+)%"/);
  if (!filter) throw new Error('a ground shadow uses filter g0, but g0 is not declared');
  return Number(rect[1]) + Number(rect[2]) * (Number(filter[1]) + Number(filter[2])) / 100;
}

const VIEWBOX = /viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)"/;

function unclipShadow(svg) {
  const floor = shadowFloor(svg);
  if (floor === null) return svg;
  const vb = svg.match(VIEWBOX);
  if (!vb) throw new Error('no viewBox to extend');
  const [x, y, w, h] = vb.slice(1);   // keep these as emitted; only the height may change
  const need = Math.ceil((floor - Number(y)) * 10) / 10;
  if (need <= Number(h)) return svg;
  return svg.replace(vb[0], `viewBox="${x} ${y} ${w} ${need.toFixed(1)}"`);
}

// The builders live in logos/build/ since 2026-09-02; the SVGs they read and write live one level up.
const here = join(dirname(fileURLToPath(import.meta.url)), '..');
const outputs = [
  ['2026.08.27_LogoMaster.svg',     build(LOCKED.back, LOCKED.dip, LOCKED.depth, LOCKED.side, LOCKED.thick, false, LOCKED.glimmer)],
  // The dark ground variant was generated here as 2026.08.27_LogoMasterDark.svg until 2026-09-02,
  // when Sarah answered the plan's 5b.2 question: deleted, not kept as history. build() keeps its
  // dark switch because the generator is carried verbatim; nothing calls it with dark on.
].map(([name, svg]) => [name, unclipShadow(svg)]);
// The small mark is hand-authored source, not generated. Its hash is pinned so
// an accidental edit fails the check.
const SMALL = '2026.08.27_LogoMarkSmall.svg';
const SMALL_SHA256 = '00e2638f22c539f0f6f3e26653a918e487fce3c17309b037ed667cc7fdbbcbde';

// Structural checks on what the generator produced. Comparing a file to the generator only
// proves they agree; if the generator itself went wrong, both would be wrong together. These
// assert properties the output must have regardless of what the generator did.
const DEAD = ['#c4795b', '#6a8e8b', '#1E2A30', '#e8e2da', '#2D2926', '#D6CAB8'];
for (const [name, svg] of outputs) {
  if (!svg.startsWith('<svg')) { console.error(name + ': generator did not return svg'); process.exit(1); }
  const ids = (svg.match(/\sid="([^"]+)"/g) || []).map((s) => s.slice(5, -1));
  const refs = (svg.match(/url\(#([^)]+)\)/g) || []).map((s) => s.slice(5, -1));
  const missing = refs.filter((r) => !ids.includes(r));
  if (missing.length) { console.error(`${name}: unresolved references ${missing.join(', ')}`); process.exit(1); }
  if (/<text|<tspan/.test(svg)) { console.error(`${name}: contains live text`); process.exit(1); }
  if (/data:image|base64/.test(svg)) { console.error(`${name}: contains an embedded raster`); process.exit(1); }
  if (/<g[^>]*transform="translate\([^"]*\)"><g\s*\/>/.test(svg)) {
    console.error(`${name}: contains an empty translated glyph wrapper`); process.exit(1);
  }
  const dead = DEAD.filter((d) => svg.toLowerCase().includes(d.toLowerCase()));
  if (dead.length) { console.error(`${name}: retired colours ${dead.join(', ')}`); process.exit(1); }
  const paths = (svg.match(/<path/g) || []).length;
  if (paths < 8) { console.error(`${name}: only ${paths} paths, the artwork is incomplete`); process.exit(1); }
  // The defect this catches is a shadow that runs past the bottom of its own viewBox and gets
  // sliced off flat. Assert against the emitted markup, not against the numbers that produced
  // it, because the padding is applied after the generator has already returned.
  const floor = shadowFloor(svg);
  if (floor !== null) {
    const vb = svg.match(VIEWBOX);
    if (!vb) { console.error(`${name}: no viewBox`); process.exit(1); }
    const bottom = Number(vb[2]) + Number(vb[4]);
    if (bottom < floor) {
      console.error(`${name}: the ground shadow reaches ${floor.toFixed(6)} but the viewBox stops at ${bottom.toFixed(6)}, so it ships clipped`);
      process.exit(1);
    }
  }
}

if (process.argv.includes('--check')) {
  let failed = false;
  for (const [name, svg] of outputs) {
    const disk = readFileSync(join(here, name), 'utf8');
    if (disk === svg) console.log(name + ': matches the generator byte for byte');
    else { console.error(name + ': DIFFERS from the generator output'); failed = true; }
  }
  const sha = createHash('sha256').update(readFileSync(join(here, SMALL))).digest('hex');
  if (sha === SMALL_SHA256) console.log(SMALL + ': hash matches the pinned source');
  else { console.error(SMALL + ': hash DIFFERS from the pinned source'); failed = true; }
  process.exit(failed ? 1 : 0);
} else {
  for (const [name, svg] of outputs) {
    writeFileSync(join(here, name), svg);
    console.log('wrote ' + name + ' (' + Buffer.byteLength(svg) + ' bytes)');
  }
}
