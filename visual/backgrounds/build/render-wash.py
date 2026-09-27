#!/usr/bin/env python3
"""Render the Always Allow wash background as a PNG at any size.

    python3 render-wash.py WIDTH HEIGHT OUT.png

The wash is the canvas colour with two soft Petrol pools over it. The values are
the ones locked on the 1200x630 Luma social image (brand/Platforms/Luma/ in the
always-allow repository), scaled by the canvas width. Each pool is anchored to
its corner in pixels, the way the website anchors its own wash, because a
position given as a percentage of the height slides the pool off a tall canvas
and leaves it blank. Found 2026-09-18 on a 1080x1920 render.

Needs Google Chrome on a Mac. The output size is read back from the PNG and the
script fails if it is not the size asked for.
"""
import pathlib, struct, subprocess, sys, tempfile

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
CANVAS = "#FEFDFB"
PETROL = "29,83,114"


def wash_css(w, h):
    k = w / 1200
    return (
        f"radial-gradient({900*k:.0f}px {620*k:.0f}px at {w - 96*k:.0f}px {-76*k:.0f}px, "
        f"rgba({PETROL},.16), transparent 68%),"
        f"radial-gradient({760*k:.0f}px {520*k:.0f}px at {24*k:.0f}px {h + 63*k:.0f}px, "
        f"rgba({PETROL},.09), transparent 72%)"
    )


def main():
    if len(sys.argv) != 4:
        raise SystemExit("usage: python3 render-wash.py WIDTH HEIGHT OUT.png")
    w, h, out = int(sys.argv[1]), int(sys.argv[2]), pathlib.Path(sys.argv[3]).resolve()
    html = (
        f"<!doctype html><meta charset=utf8><style>html,body{{margin:0;background:{CANVAS}}}"
        f".cv{{width:{w}px;height:{h}px;background:{CANVAS};position:relative;overflow:hidden}}"
        f".w{{position:absolute;inset:0;background:{wash_css(w, h)}}}</style>"
        f"<div class=cv><div class=w></div></div>"
    )
    with tempfile.TemporaryDirectory() as tmp:
        page = pathlib.Path(tmp) / "wash.html"
        page.write_text(html)
        subprocess.run(
            [CHROME, "--headless", "--disable-gpu", "--hide-scrollbars",
             "--force-device-scale-factor=1", f"--window-size={w},{h}",
             f"--screenshot={out}", f"file://{page}"],
            check=True, capture_output=True,
        )
    gw, gh = struct.unpack(">II", out.read_bytes()[16:24])
    assert (gw, gh) == (w, h), f"{out.name}: got {gw}x{gh}, wanted {w}x{h}"
    print(f"{out}  {gw}x{gh}")
    print(wash_css(w, h))


if __name__ == "__main__":
    main()
