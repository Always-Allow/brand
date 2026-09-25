#!/usr/bin/env python3
"""Duplicate a locked Luma cover template for a new event.

    python3 make-cover.py --list
    python3 make-cover.py --template staircase-clean \
        --title "Intro to AI" --place NYC --date 2026-09-17 --time 6:30pm

Writes <out>/<slug>.html and <out>/<slug>.png. The weekday is DERIVED from --date,
never typed, because every cover in the 2026-08-28 set had a weekday taken from the
2025 calendar and none of them matched their own date.
"""
import argparse, datetime, json, pathlib, re, subprocess, sys

HERE = pathlib.Path(__file__).resolve().parent
# Resolve the reusable cover source inside this brand checkout.
TPL_DIR = HERE.parent.parent / 'templates' / 'event-covers'
# cover-playground.html sits in that directory too. It is the standing playground
# tool rather than one of the seven locked patterns, so it is not offered here.
NOT_A_TEMPLATE = {'cover-playground'}
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
STATE_RE = re.compile(r'(<script type="application/json" id="state">)(.*?)(</script>)', re.S)
META_RE  = re.compile(r'(<p class="meta"[^>]*>)(.*?)(</p>)', re.S)
H1_RE    = re.compile(r'(<h1[^>]*>)(.*?)(</h1>)', re.S)

def templates():
    return sorted(p.stem for p in TPL_DIR.glob('*.html')
                  if p.stem not in NOT_A_TEMPLATE)

def absolutize(html):
    """Point the generated file's assets at the repository.

    The templates reference the stylesheet, fonts and tool marks relative to
    their own directory, so they stay portable inside the repository. A cut
    cover is written wherever --out says, usually outside it, where the same
    relative path resolves to nothing and the cover renders with no styling.
    These were absolute paths into a ~/.planning worktree until 2026-09-01,
    which survived the move only because that worktree happened to still exist.
    """
    def one(m):
        return '"file://' + str((TPL_DIR / m.group(1)).resolve()) + '"'
    return re.sub(r'"((?:\.\./)+[^"]+)"', one, html)

def meta_line(place, d, t):
    day = datetime.date.fromisoformat(d)
    stamp = f"{place} &middot; {day.strftime('%a')} {day.day} {day.strftime('%b')}"
    # A time is optional. Four of the September and October events have a date
    # but no start time yet, and a cover with a trailing separator and nothing
    # after it looks broken, so the clause is dropped rather than left empty.
    return f"{stamp} &middot; {t}" if t else stamp

def build(tpl, title, place, date, time_, out):
    src_p = TPL_DIR / f'{tpl}.html'
    if not src_p.exists():
        sys.exit(f"no template {tpl!r}. available: {', '.join(templates())}")
    src = src_p.read_text()
    meta = meta_line(place, date, time_)
    if STATE_RE.search(src):
        def patch(m):
            st = json.loads(m.group(2))
            st['title'] = title
            st['meta'] = meta.replace('&middot;', '·')
            return m.group(1) + json.dumps(st, ensure_ascii=False) + m.group(3)
        out_html, n = STATE_RE.subn(patch, src)
        mode = 'state'
    else:
        out_html, n = META_RE.subn(lambda m: m.group(1) + meta + m.group(3), src)
        out_html, n2 = H1_RE.subn(lambda m: m.group(1) + title + m.group(3), out_html, count=1)
        if not n2: sys.exit(f"{tpl}: could not find the <h1> to set the title")
        mode = 'markup'
    if not n: sys.exit(f"{tpl}: could not find the meta line to set")

    slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    out = pathlib.Path(out).expanduser().resolve()
    out.mkdir(parents=True, exist_ok=True)
    html_p, png_p = out / f'{slug}.html', out / f'{slug}.png'
    html_p.write_text(absolutize(out_html))
    subprocess.run([CHROME, '--headless', '--disable-gpu', '--window-size=1080,1080',
                    '--virtual-time-budget=8000', f'--screenshot={png_p}', f'file://{html_p}'],
                   check=True, capture_output=True)
    print(f"{tpl} ({mode})  ->  {html_p}\n{' '*len(tpl)}           {png_p}")
    print(f"meta: {meta.replace('&middot;','·')}   title: {title}")

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--list', action='store_true')
    ap.add_argument('--template'); ap.add_argument('--title')
    ap.add_argument('--place', default='NYC'); ap.add_argument('--date')
    ap.add_argument('--time', dest='time_'); ap.add_argument('--out', default='.')
    a = ap.parse_args()
    if a.list or not (a.template and a.title and a.date):
        print('templates:'); [print('  ' + t) for t in templates()]
        if not a.list: print('\nneed --template --title --date (--time optional)')
        sys.exit(0)
    build(a.template, a.title, a.place, a.date, a.time_, a.out)
