#!/usr/bin/env python3
"""Build the Always Allow LinkedIn and Slack workspace assets.

    python3 build-social-assets.py --out .

Emits, with the sizes each platform actually asks for:

    linkedin-company-logo.png     400x400    LinkedIn asks 268 min, 400 recommended
    linkedin-company-cover.png    4200x700   LinkedIn's recommended upload; displays ~1128x191
    linkedin-personal-banner.png  1584x396   the personal profile cover
    slack-workspace-icon.png      512x512    Slack displays it at 34 to 68px

Built on the calendar-asset system locked by Sarah on 2026-08-28: the site wash
ground, the real lockup, the glyph field, DM Serif Display over Inter, and the
tool marks in a single white tray with a hairline border.

The words are the live homepage hero copy verbatim. That is deliberate and it
follows the calendar cover's precedent: reusing approved copy sidesteps the
approval problem entirely and keeps every surface saying the same thing.

Two keep-clear rules are designed in rather than eyeballed. LinkedIn overlaps the
page logo onto the bottom left of a company cover, and the profile photo onto the
bottom left of a personal banner, so that corner carries nothing. LinkedIn also
crops a company cover to its centre 900 of 1128 display pixels on mobile, which is
79.8%, so everything that has to survive sits inside the middle 80%.
"""
import argparse, base64, pathlib, subprocess

# The repository root, found from this file rather than hardcoded. The previous
# value was one machine's worktree path, so the script exited on import for
# anyone else and for this machine once that worktree was removed.
REPO = pathlib.Path(__file__).resolve().parents[2]


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
# every mark is read from there. Claude used to be read straight from radar and
# OpenAI from the legacy vendor-icons set while the site copy was stale or
# missing; as of 2026-09-01 the site copy is current and it is the one source.
MARKS = {n: uri(REPO/f'site/assets/tools/{n}.png') for n in TOOLS}
# The transparent symbol covers 40.1% of its cell against Slack's 57.6%, so it
# needs a bump to carry the same optical weight. 1.2 is the ink-parity figure.
SCALE = {'claude': 1.2}

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
    inner = ''.join(
        f'<span style="width:{s}px;height:{s}px">'
        f'<img src="{MARKS[m]}" alt="" style="transform:scale({SCALE.get(m,1.0)})"></span>'
        for m in TOOLS)
    return (f'<div class="tray" style="left:{cx-w/2:.0f}px;top:{cy-h/2:.0f}px;width:{w:.0f}px;'
            f'height:{h:.0f}px;gap:{gap}px;border-radius:{radius}px">{inner}</div>')

def company_cover():
    """4200x700. Displays at 1128x191, mobile keeps only the centre 80%, and the
    page logo covers the bottom left, so the composition is centred and that
    corner is empty. Everything load-bearing sits between x=420 and x=3780."""
    W, H = 4200, 700
    wash = ('background:radial-gradient(2600px 900px at 88% -20%, rgba(29,83,114,.16), transparent 68%),'
            'radial-gradient(2200px 800px at 6% 120%, rgba(29,83,114,.08), transparent 72%)')
    g = (cmdm(3560,196,58,5.2)+star(3980,470,42,5)+ring(690,180,38,5)+cross(980,520,34,5)
         +diamond(3320,540,40,5)+dots(760,470,10,38)+halo(4010,170,38,5)+arcm(3120,150,40,5))
    return (W, H, f'<div class="cv" id="linkedin-company-cover" style="width:{W}px;height:{H}px">'
            f'<div class="wash" style="{wash}"></div>'
            f'<svg class="g" viewBox="0 0 {W} {H}" style="width:{W}px;height:{H}px">{g}</svg>'
            f'<div style="position:absolute;left:0;right:0;top:298px;transform:translateY(-50%);'
            f'text-align:center;z-index:6">'
            f'<h1 style="font-size:132px"><span class="mk">{HEAD_A}</span> {HEAD_B}</h1>'
            f'<p class="sub" style="margin-top:34px;font-size:52px">{SUB}</p></div>'
            f'{tray(2100,606,72,52,30,26)}</div>')

def personal_banner():
    """1584x396. LinkedIn covers the bottom left with the profile photo and the
    action buttons, about 568 wide by 264 tall, and asks for text to sit at least
    300 to 400px in from the left, 150 from the right, 60 from the top and 150
    from the bottom. That leaves a usable band of roughly x 620 to 1434 and y 60
    to 246, so the message and the tray both live inside it and the whole bottom
    left carries nothing but background. The lockup sits top left, above the
    blocked band rather than inside it."""
    W, H = 1584, 396
    wash = ('background:radial-gradient(1100px 620px at 90% -14%, rgba(29,83,114,.17), transparent 68%),'
            'radial-gradient(820px 460px at 2% 116%, rgba(29,83,114,.08), transparent 72%)')
    g = (cmdm(1516,92,26)+star(600,330,18)+ring(1490,300,16)+cross(566,96,15)
         +diamond(1140,330,17)+dots(760,338,4.4,16)+arcm(940,332,18))
    return (W, H, f'<div class="cv" id="linkedin-personal-banner" style="width:{W}px;height:{H}px">'
            f'<div class="wash" style="{wash}"></div>'
            f'<svg class="g" viewBox="0 0 {W} {H}" style="width:{W}px;height:{H}px">{g}</svg>'
            f'<div class="brand" style="top:34px;left:56px;width:198px">{LOCKUP}</div>'
            f'<div style="position:absolute;left:620px;top:153px;transform:translateY(-50%);'
            f'width:480px;z-index:6">'
            f'<h1 style="font-size:40px"><span class="mk">{HEAD_A}</span><br>{HEAD_B}</h1>'
            f'<p class="sub" style="margin-top:14px;font-size:19px">{SUB}</p></div>'
            f'{tray(1290,153,40,24,22,18)}</div>')

def avatar(px):
    """The brand avatar. Slack rounds the corners and LinkedIn renders the page
    logo in a rounded square, so the glyph stays centred and clear of the edges."""
    return (px, px, f'<div class="cv icon" id="avatar" style="width:{px}px;height:{px}px;'
            f'background:transparent">{AVATAR}</div>')

HEAD = ('<meta charset=utf8>\n<link rel="preconnect" href="https://fonts.googleapis.com">\n'
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
        'family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap">\n')

def shot(spec, out, transparent=False):
    w, h, html = spec
    tmp = out.parent / f'_tmp-{out.stem}.html'
    # CSS sets an opaque white body, which beats Chrome's transparent background
    # flag and produces white corners on a rounded icon. The calendar icon shipped
    # that way on 2026-08-28 while its builder claimed transparent corners, so the
    # override is explicit here rather than assumed.
    clear = '\nhtml,body{background:transparent}' if transparent else ''
    tmp.write_text('<!doctype html>' + HEAD + f'<style>{CSS}{clear}</style>' + html)
    cmd = [CHROME, '--headless', '--disable-gpu', f'--window-size={w},{h}',
           '--virtual-time-budget=9000', f'--screenshot={out}', f'file://{tmp}']
    if transparent: cmd.insert(3, '--default-background-color=00000000')
    subprocess.run(cmd, check=True, capture_output=True)
    tmp.unlink()
    import struct
    b = out.read_bytes(); gw, gh = struct.unpack('>II', b[16:24])
    assert (gw, gh) == (w, h), f'{out.name}: got {gw}x{gh}, wanted {w}x{h}'
    print(f'  {out.name:32s} {gw}x{gh}  {len(b)//1024}KB')

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--out', default='.')
    out = pathlib.Path(ap.parse_args().out).expanduser().resolve()
    out.mkdir(parents=True, exist_ok=True)
    print('building social assets ->', out)
    shot(company_cover(),   out/'linkedin-company-cover.png')
    shot(personal_banner(), out/'linkedin-personal-banner.png')
    shot(avatar(400),       out/'linkedin-company-logo.png',    transparent=True)
    shot(avatar(512),       out/'slack-workspace-icon.png',     transparent=True)
    (out/'_render-social-assets.html').write_text(
        '<!doctype html>' + HEAD
        + f'<style>{CSS}\nbody{{background:#E6E2DC;padding:22px;display:grid;gap:22px;justify-items:start}}'
        + '\n.shrink{transform-origin:top left;transform:scale(0.268);height:188px}</style>'
        + f'<div class="shrink">{company_cover()[2]}</div>'
        + personal_banner()[2]
        + f'<div style="background:#DDD9D3">{avatar(512)[2]}</div>')
    print(f'  {"_render-social-assets.html":32s} preview of all four')
