#!/usr/bin/env python3
"""Build the Always Allow Luma calendar-page assets.

    python3 build-calendar-assets.py --out .

Emits calendar-cover.png (1500x500), calendar-icon.png (1024x1024, transparent
corners) and calendar-social.png (1200x630), plus _render-calendar-assets.html,
a stacked preview of all three at true size.

Design locked by Sarah 2026-08-28 (option t1). Standing rule: Claude and OpenAI
are always in the tool set, they are the two core models she teaches in.
Tool marks come from radar-assets only, mirrored at site/assets/tools/.
"""
import argparse, base64, pathlib, subprocess

# The repository root, found from this file rather than hardcoded. The previous
# value was one machine's worktree path, so the script exited on import for
# anyone else and for this machine once that worktree was removed.
# brand/Platforms/Luma/ is three levels down, not two. This was parents[2] while the
# script lived in workshops/calendar/, and the 2026-09-01 move to Platforms would have
# left it resolving the repo root as brand/.
REPO = pathlib.Path(__file__).resolve().parents[3]


def _brand(name):
    p = REPO / 'brand' / 'logos' / name
    if not p.exists():
        raise SystemExit(f"missing {p}. The logo set lives in brand/logos/ since 2026-09-02.")
    return p.read_text().strip()

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
LOCKUP = _brand('2026.08.27_Lockup.svg')
AVATAR = _brand('2026.08.27_Avatar.svg')
CMD = ("M9 5.5a2.5 2.5 0 1 0-2.5 2.5H9zm0 0V9m0-3.5h6m0 0a2.5 2.5 0 1 1 2.5 2.5H15zm0 0V9"
       "M9 9h6m-6 0v6m6-6v6m0 0a2.5 2.5 0 1 0 2.5-2.5H15zm0 0H9m0 0a2.5 2.5 0 1 1-2.5-2.5H9z")
TOOLS = ['claude', 'openai', 'slack', 'notion', 'outlook']
HEAD_A, HEAD_B = 'See the patterns.', 'Build your systems.'
SUB = 'AI workshops for people who learn by building.'

def uri(p):
    p = pathlib.Path(p)
    mime = {'.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'}[p.suffix.lower()]
    return f'data:{mime};base64,' + base64.b64encode(p.read_bytes()).decode()

# radar-assets is the master for every tool mark (FILING.md) and
# site/assets/tools/ is its generated copy (scripts/build-tool-index.mjs), so
# every mark is read from there, OpenAI included. OpenAI used to be read from
# the legacy site/assets/vendor-icons/ set and then straight from radar while
# the site copy lacked it; both let this render drift from what the site shows.
MARKS = {n: uri(REPO/f'site/assets/tools/{n}.png') for n in TOOLS}

CSS = """
 :root{--canvas:#FEFDFB;--bone:#F0ECE6;--hairline:#E3DDD2;--ink:#344650;--muted:#427294;--accent:#1D5372;}
 *{box-sizing:border-box} html,body{margin:0;padding:0;background:#fff}
 .cv{position:relative;overflow:hidden;background:var(--canvas);color:var(--ink);
   font-family:Inter,-apple-system,sans-serif}
 .wash{position:absolute;inset:0;pointer-events:none}
 .brand{position:absolute;z-index:7}.brand svg{width:100%;height:auto;display:block}
 h1{font-family:"DM Serif Display",Georgia,serif;font-weight:400;margin:0;
   letter-spacing:-.012em;line-height:1.04;color:var(--ink)}
 .sub{margin:0;color:var(--muted);font-weight:500}
 .mk{position:relative;display:inline-block}
 .mk::after{content:"";position:absolute;left:-2px;right:-2px;bottom:.045em;height:.10em;
   background:var(--accent);opacity:.22;border-radius:3px;z-index:-1}
 .g{position:absolute;inset:0;z-index:2}
 .g .nm{fill:none;stroke:var(--accent);stroke-linejoin:round;stroke-linecap:round}
 .g .dotf{fill:var(--accent)}
 .tray{position:absolute;z-index:5;display:flex;align-items:center;justify-content:center;
   background:#fff;border:1px solid var(--hairline);
   box-shadow:0 1px 2px rgba(52,70,80,.06), 0 10px 26px rgba(52,70,80,.10)}
 .tray span{display:grid;place-items:center;flex:none}
 .tray img{width:100%;height:100%;object-fit:contain;display:block}
 .icon svg{width:100%;height:100%;display:block}
"""
def star(x,y,r,w=2.5):
    k=r*.32
    return (f'<path class="nm" stroke-width="{w}" d="M {x} {y-r} C {x+k} {y-k} {x+k} {y-k} {x+r} {y} '
            f'C {x+k} {y+k} {x+k} {y+k} {x} {y+r} C {x-k} {y+k} {x-k} {y+k} {x-r} {y} '
            f'C {x-k} {y-k} {x-k} {y-k} {x} {y-r} Z"/>')
def ring(x,y,r,w=2.5): return f'<circle class="nm" stroke-width="{w}" cx="{x}" cy="{y}" r="{r}"/><circle class="dotf" cx="{x}" cy="{y}" r="{r*.24:.1f}"/>'
def diamond(x,y,r,w=2.5): return f'<path class="nm" stroke-width="{w}" d="M {x} {y-r} L {x+r*.72} {y} L {x} {y+r} L {x-r*.72} {y} Z"/>'
def cross(x,y,r,w=2.5): return f'<path class="nm" stroke-width="{w}" d="M {x} {y-r} L {x} {y+r} M {x-r} {y} L {x+r} {y}"/>'
def arcm(x,y,r,w=2.5): return f'<path class="nm" stroke-width="{w}" d="M {x-r} {y+r*.45} A {r*1.1} {r*1.1} 0 0 1 {x+r} {y+r*.45}"/>'
def dots(x,y,r=4.6,g=17): return ''.join(f'<circle class="dotf" cx="{x+i*g}" cy="{y}" r="{r}"/>' for i in (-1,0,1))
def halo(x,y,r,w=2.5): return f'<circle class="nm" stroke-width="{w}" cx="{x}" cy="{y}" r="{r}"/><circle class="nm" stroke-width="{w}" cx="{x}" cy="{y}" r="{r*.5:.1f}"/>'
def cmdm(x,y,r,w=2.4):
    s=(2*r)/24.0
    return (f'<g transform="translate({x-r},{y-r}) scale({s:.4f})"><path d="{CMD}" fill="none" '
            f'stroke="#1D5372" stroke-width="{w/s:.2f}" stroke-linecap="round" stroke-linejoin="round"/></g>')
def tray(cx, cy, s, gap, pad, radius):
    w = len(TOOLS)*s + (len(TOOLS)-1)*gap + pad*2
    h = s + pad*1.64
    inner = ''.join(f'<span style="width:{s}px;height:{s}px"><img src="{MARKS[m]}" alt=""></span>' for m in TOOLS)
    return (f'<div class="tray" style="left:{cx-w/2:.0f}px;top:{cy-h/2:.0f}px;width:{w:.0f}px;'
            f'height:{h:.0f}px;gap:{gap}px;border-radius:{radius}px">{inner}</div>')

def cover():
    wash = ('background:radial-gradient(1100px 620px at 88% -10%, rgba(29,83,114,.16), transparent 68%),'
            'radial-gradient(900px 520px at 4% 112%, rgba(29,83,114,.09), transparent 72%)')
    g = (cmdm(928,392,26)+star(1420,96,18)+ring(700,112,16)+cross(560,424,15)
         +diamond(1420,404,17)+dots(1136,432)+halo(404,432,16)+arcm(1252,110,18))
    return (f'<div class="cv" id="cover" style="width:1500px;height:500px">'
            f'<div class="wash" style="{wash}"></div>'
            f'<svg class="g" viewBox="0 0 1500 500" style="width:1500px;height:500px">{g}</svg>'
            f'<div class="brand" style="top:44px;left:64px;width:246px">{LOCKUP}</div>'
            f'<div style="position:absolute;left:64px;top:236px;transform:translateY(-50%);width:780px;z-index:6">'
            f'<h1 style="font-size:60px"><span class="mk">{HEAD_A}</span><br>{HEAD_B}</h1>'
            f'<p class="sub" style="margin-top:24px;font-size:25px">{SUB}</p></div>'
            f'{tray(1200,250,42,30,28,22)}</div>')

def social():
    wash = ('background:radial-gradient(900px 620px at 92% -12%, rgba(29,83,114,.16), transparent 68%),'
            'radial-gradient(760px 520px at 2% 110%, rgba(29,83,114,.09), transparent 72%)')
    g = (cmdm(1058,150,24)+star(1112,470,17)+ring(150,470,15)+cross(980,556,14)
         +diamond(1128,300,16)+dots(190,566,4.4,16)+arcm(880,120,17))
    return (f'<div class="cv" id="social" style="width:1200px;height:630px">'
            f'<div class="wash" style="{wash}"></div>'
            f'<svg class="g" viewBox="0 0 1200 630" style="width:1200px;height:630px">{g}</svg>'
            f'<div class="brand" style="top:48px;left:64px;width:238px">{LOCKUP}</div>'
            f'<div style="position:absolute;left:64px;top:300px;transform:translateY(-50%);width:820px;z-index:6">'
            f'<h1 style="font-size:64px"><span class="mk">{HEAD_A}</span><br>{HEAD_B}</h1>'
            f'<p class="sub" style="margin-top:26px;font-size:26px">{SUB}</p></div>'
            f'{tray(420,506,44,32,28,22)}</div>')

def icon():
    return f'<div class="cv icon" id="icon" style="width:1024px;height:1024px;background:transparent">{AVATAR}</div>'

HEAD = ('<meta charset=utf8>\n<link rel="preconnect" href="https://fonts.googleapis.com">\n'
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
        'family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap">\n')

def shot(html, out, w, h, transparent=False):
    tmp = out.parent / f'_tmp-{out.stem}.html'
    # CSS paints html,body white, which overrides --default-background-color for the
    # transparent icon render and fills its rounded corners. Clear it for that shot only.
    css = CSS + ('\nhtml,body{background:transparent}' if transparent else '')
    tmp.write_text('<!doctype html>' + HEAD + f'<style>{css}</style>' + html)
    cmd = [CHROME, '--headless', '--disable-gpu', f'--window-size={w},{h}',
           '--virtual-time-budget=9000', f'--screenshot={out}', f'file://{tmp}']
    if transparent: cmd.insert(3, '--default-background-color=00000000')
    subprocess.run(cmd, check=True, capture_output=True)
    tmp.unlink()
    import struct
    b = out.read_bytes(); gw, gh = struct.unpack('>II', b[16:24])
    assert (gw, gh) == (w, h), f'{out.name}: got {gw}x{gh}, wanted {w}x{h}'
    print(f'  {out.name:22s} {gw}x{gh}  {len(b)//1024}KB')

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--out', default='.')
    out = pathlib.Path(ap.parse_args().out).expanduser().resolve()
    out.mkdir(parents=True, exist_ok=True)
    print('building calendar assets ->', out)
    shot(cover(),  out/'calendar-cover.png',  1500, 500)
    shot(icon(),   out/'calendar-icon.png',   1024, 1024, transparent=True)
    shot(social(), out/'calendar-social.png', 1200, 630)
    (out/'_render-calendar-assets.html').write_text(
        '<!doctype html>' + HEAD + f'<style>{CSS}\nbody{{background:#E6E2DC;padding:22px;display:grid;gap:22px;justify-items:start}}</style>'
        + cover() + social() + f'<div style="background:#DDD9D3">{icon()}</div>')
    print(f'  {"_render-calendar-assets.html":22s} preview of all three')
