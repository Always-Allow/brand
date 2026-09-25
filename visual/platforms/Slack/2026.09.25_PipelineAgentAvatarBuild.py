#!/usr/bin/env python3
"""Build the Slack profile picture for the pipeline agent.

    python3 brand/Platforms/Slack/2026.09.25_PipelineAgentAvatarBuild.py
    python3 brand/Platforms/Slack/2026.09.25_PipelineAgentAvatarBuild.py --check

Emits, beside this file:
    2026.09.25_PipelineAgent_Avatar.svg       the drawing
    2026.09.25_PipelineAgent_Avatar_512.png   the upload, rendered from it by Chrome

The pipeline agent is the Slack app that posts form responses, contact form leads,
nominations and sign-ups. Its picture is one brushed spiral stroke, thick in the
middle and tapering at both ends, circling in to a single point: everything the
agent watches, gathered to one place. Bone stroke on a Petrol tile, full bleed,
because Slack rounds the corners itself.

Chosen by Sarah on 2026-09-25 from the review page at
https://claude.ai/artifact/8ZMx6Fe8KnhuBFNCJ5FAh7, after three rejected rounds:
stock UI icons read as generic, and anything built from two or three thin-line
parts turned to fuzz at the 20px sidebar size. One stroke survives every size.

--check renders both files afresh into a temporary folder and compares them with
the committed ones byte for byte, writing nothing into the repository. Same gate
as the other builders under brand/, for the reasons argued out in review on
2026-09-02 and recorded in brand/Platforms/2026.09.02_PlatformLogoBuild.mjs: a
tolerance admits a hand-edited file, and a byte match proves the committed file
is what this builder emits on the machine doing the checking. A browser update
that changes the PNG encoder fails the check with the same picture; the remedy is
to re-run the builder and commit what it emits.

A byte match alone would not catch a builder that was wrong from the start, so
every render is also read back and asserted on its pixels before it is written
or compared: 512 square, opaque RGB, Petrol in all four corners, and the bone
stroke covering the share of the square it was measured at. (Devin, round 1,
both the app and the CLI review.) The same round set the other three rules
below: only --check is accepted as an argument, so a mistyped check cannot turn
into a write; CHROME_BIN overrides the browser path, as the sibling builders
allow; and the PNG is rendered and verified before either committed file is
replaced, so a failed render leaves the pair as it was.
"""
import math, os, pathlib, struct, subprocess, sys, tempfile, zlib

HERE = pathlib.Path(__file__).resolve().parent
SVG = HERE / '2026.09.25_PipelineAgent_Avatar.svg'
PNG = HERE / '2026.09.25_PipelineAgent_Avatar_512.png'
CHROME = os.environ.get('CHROME_BIN') or '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
PETROL, BONE = '#1D5372', '#F0ECE6'   # the live token table, brand/Platforms/build-social-assets.py
SIZE, C = 512, 256
# The stroke covers 23.0% of the square, measured 2026-09-25 on this render path at tolerance
# 12 per channel. Well under means the stroke did not render; well over means the ground did not.
STROKE_SHARE = (0.19, 0.27)


def spiral(turns, r_out, r_in, n=400, phase=-math.pi / 2):
    pts = []
    for i in range(n + 1):
        t = i / n
        th = phase + t * turns * 2 * math.pi
        r = r_out + (r_in - r_out) * t
        pts.append((C + r * math.cos(th), C + r * math.sin(th)))
    return pts


def ribbon(pts, half_width):
    """Offset a polyline into one closed shape whose width varies along it."""
    left, right = [], []
    n = len(pts)
    for i, (x, y) in enumerate(pts):
        x0, y0 = pts[max(i - 1, 0)]
        x1, y1 = pts[min(i + 1, n - 1)]
        dx, dy = x1 - x0, y1 - y0
        length = math.hypot(dx, dy) or 1
        nx, ny = -dy / length, dx / length
        h = half_width(i / (n - 1))
        left.append((x + nx * h, y + ny * h))
        right.append((x - nx * h, y - ny * h))
    return 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in left + right[::-1]) + 'Z'


def svg_text():
    stroke = ribbon(spiral(2.05, 176, 18), lambda t: 4 + 30 * math.sin(math.pi * t) ** 0.8)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {SIZE} {SIZE}" width="{SIZE}" height="{SIZE}">'
            f'<rect width="{SIZE}" height="{SIZE}" fill="{PETROL}"/>'
            f'<path d="{stroke}" fill="{BONE}"/></svg>')


def render(svg, out_dir):
    out_dir = pathlib.Path(out_dir)
    page = out_dir / 'avatar.html'
    png = out_dir / 'avatar.png'
    page.write_text(f'<!doctype html><html><body style="margin:0;background:{PETROL}">{svg}</body></html>')
    if not pathlib.Path(CHROME).exists():
        raise SystemExit(f'no browser at {CHROME}; set CHROME_BIN to a Chrome or Chromium binary')
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars',
                    '--force-device-scale-factor=1', f'--window-size={SIZE},{SIZE}',
                    f'--screenshot={png}', page.as_uri()],
                   check=True, capture_output=True)
    if not png.exists():
        raise SystemExit('the browser exited without writing a screenshot')
    return png.read_bytes()


def read_png(data):
    """Decode an 8-bit RGB or RGBA PNG into (width, height, channels, rows of bytes)."""
    if data[:8] != b'\x89PNG\r\n\x1a\n':
        raise SystemExit('the render is not a PNG')
    pos, idat, w = 8, b'', None
    while pos < len(data):
        n, kind = struct.unpack('>I4s', data[pos:pos + 8])
        body = data[pos + 8:pos + 8 + n]
        if kind == b'IHDR':
            w, h, depth, ctype = struct.unpack('>IIBB', body[:10])
            if depth != 8 or ctype not in (2, 6):
                raise SystemExit(f'unexpected PNG format: bit depth {depth}, colour type {ctype}')
            ch = 3 if ctype == 2 else 4
        elif kind == b'IDAT':
            idat += body
        pos += 12 + n
    raw = zlib.decompress(idat)
    stride = w * ch
    rows, prev = [], bytearray(stride)
    for y in range(h):
        f = raw[y * (stride + 1)]
        line = bytearray(raw[y * (stride + 1) + 1:(y + 1) * (stride + 1)])
        for i in range(stride):
            a = line[i - ch] if i >= ch else 0
            b = prev[i]
            c = prev[i - ch] if i >= ch else 0
            if f == 1: line[i] = (line[i] + a) & 255
            elif f == 2: line[i] = (line[i] + b) & 255
            elif f == 3: line[i] = (line[i] + (a + b) // 2) & 255
            elif f == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                line[i] = (line[i] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
        rows.append(bytes(line)); prev = line
    return w, h, ch, rows


def verify(data):
    """What a correct render looks like, asserted on the pixels rather than assumed from the markup."""
    w, h, ch, rows = read_png(data)
    if (w, h) != (SIZE, SIZE):
        raise SystemExit(f'asked for {SIZE}x{SIZE}, got {w}x{h}')
    if ch != 3:
        raise SystemExit('the PNG carries an alpha channel; the upload must be opaque RGB')
    petrol = tuple(int(PETROL[i:i + 2], 16) for i in (1, 3, 5))
    bone = tuple(int(BONE[i:i + 2], 16) for i in (1, 3, 5))
    px = lambda x, y: tuple(rows[y][x * 3:x * 3 + 3])
    for x, y in ((0, 0), (SIZE - 1, 0), (0, SIZE - 1), (SIZE - 1, SIZE - 1)):
        if max(abs(a - b) for a, b in zip(px(x, y), petrol)) > 2:
            raise SystemExit(f'corner ({x},{y}) reads rgb{px(x, y)}, not Petrol; the tile did not bleed to the edge')
    near_bone = sum(1 for y in range(SIZE) for x in range(SIZE)
                    if max(abs(a - b) for a, b in zip(px(x, y), bone)) <= 12)
    share = near_bone / (SIZE * SIZE)
    if not STROKE_SHARE[0] <= share <= STROKE_SHARE[1]:
        raise SystemExit(f'bone stroke covers {100 * share:.1f}% of the square, expected about 23%')
    return share


def main():
    argv = sys.argv[1:]
    if argv not in ([], ['--check']):
        print('usage: 2026.09.25_PipelineAgentAvatarBuild.py [--check]', file=sys.stderr)
        sys.exit(2)
    svg = svg_text()
    with tempfile.TemporaryDirectory() as tmp:
        png = render(svg, tmp)
    share = verify(png)
    if argv:
        problems = []
        if not SVG.exists() or SVG.read_text() != svg:
            problems.append(f'{SVG.name} differs from what this builder emits')
        if not PNG.exists() or PNG.read_bytes() != png:
            problems.append(f'{PNG.name} differs from what this builder emits on this machine')
        if problems:
            print('\n'.join(problems))
            print('Re-run the builder without --check and commit what it writes.')
            sys.exit(1)
        print(f'ok: {SVG.name} and {PNG.name} match the builder byte for byte; stroke covers {100 * share:.1f}%')
        return
    SVG.write_text(svg)
    PNG.write_bytes(png)
    print(f'wrote {SVG.name} and {PNG.name} ({len(png)} bytes); stroke covers {100 * share:.1f}%')


if __name__ == '__main__':
    main()
