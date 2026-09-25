#!/usr/bin/env python3
"""Build the 2026-09-10 Printify review artwork.

The files land in stickers/build/ because they are review renders, not the
published-product source of truth in stickers/products/. Brand marks are rendered
from the locked SVG masters by the existing brand raster exporter. Loading-state
art comes from the preserved 2026-04-05 candidate scan.
"""

from pathlib import Path
import argparse
import base64
import shutil
import subprocess
import tempfile
from PIL import Image, ImageFilter


REPO = Path(__file__).resolve().parents[2]
STICKERS = REPO / "stickers"
BUILD = STICKERS / "build"
APPROVED = STICKERS / "review" / "approved"
LOGOS = REPO / "brand" / "logos"
RASTER_EXPORT = LOGOS / "build" / "2026.08.27_RasterExport.mjs"
INTER_REGULAR = REPO / "brand" / "fonts" / "2026.08.27_Inter_Regular_Latin.woff2"
DM_SERIF_DISPLAY = REPO / "brand" / "fonts" / "2026.08.27_DMSerifDisplay_Regular_Latin.woff2"

CANVAS = (254, 253, 251)
OUTLINE_PX = 30
URL_TEXT = "alwaysallow.com"
URL_COLOR = "#427294"

LOADING_STATES = {
    "Deciphering": "new_29.png",
    "Discombobulating": "new_02.png",
    "Incubating": "new_51.png",
    "Percolating": "new_33.png",
}

WORKSHOP_HASHTAGS = (
    ("WWBuiltW", "#WWBuiltW"),
)


def crop_alpha(image: Image.Image) -> Image.Image:
    image = image.convert("RGBA")
    box = image.getchannel("A").getbbox()
    if box is None:
        raise ValueError("image has no visible pixels")
    return image.crop(box)


def resize_to_height(image: Image.Image, height: int) -> Image.Image:
    width = max(1, round(image.width * height / image.height))
    return image.resize((width, height), Image.Resampling.LANCZOS)


def add_print_outline(image: Image.Image, radius: int = OUTLINE_PX) -> Image.Image:
    """Add a near-white contour while preserving the source artwork exactly."""
    image = crop_alpha(image)
    padded = Image.new(
        "RGBA",
        (image.width + radius * 2, image.height + radius * 2),
        (0, 0, 0, 0),
    )
    padded.alpha_composite(image, (radius, radius))

    alpha = padded.getchannel("A")
    # A giant MaxFilter is quadratic in the requested radius and turns the
    # print-size keycap into a minutes-long build. A thresholded blur gives the
    # same continuous contour in a small fraction of the time.
    expanded = alpha.filter(ImageFilter.GaussianBlur(radius / 2))
    expanded = expanded.point(lambda value: 255 if value > 2 else 0)
    outline = Image.new("RGBA", padded.size, (*CANVAS, 0))
    outline.putalpha(expanded)
    return Image.alpha_composite(outline, padded)


def render_svg(svg: Path, width: int, height: int, output: Path) -> Image.Image:
    subprocess.run(
        [
            "node",
            str(RASTER_EXPORT),
            str(svg),
            str(width),
            str(height),
            str(output),
        ],
        cwd=REPO,
        check=True,
    )
    return Image.open(output).convert("RGBA")


def render_url_signature(
    temp: Path,
    font_size: int,
    name: str,
    font_path: Path = INTER_REGULAR,
    font_family: str = "Always Allow Inter",
) -> Image.Image:
    """Render the quiet URL in an explicitly selected locked brand font."""
    width = 2000
    height = max(320, font_size * 2)
    baseline = round(height * 0.62)
    encoded_font = base64.b64encode(font_path.read_bytes()).decode("ascii")
    svg = temp / f"{name}-url.svg"
    svg.write_text(
        f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}">
<style>
@font-face {{
  font-family: "{font_family}";
  src: url("data:font/woff2;base64,{encoded_font}") format("woff2");
  font-style: normal;
  font-weight: 400;
}}
</style>
<text x="{width / 2}" y="{baseline}" text-anchor="middle"
  fill="{URL_COLOR}" font-family="{font_family}" font-size="{font_size}"
  font-style="normal" font-weight="400">{URL_TEXT}</text>
</svg>'''
    )
    return crop_alpha(render_svg(svg, width, height, temp / f"{name}-url.png"))


def render_hashtag(temp: Path, text: str, name: str) -> Image.Image:
    """Render an exact workshop hashtag in the Always Allow display face."""
    width = 3600
    height = 720
    font_size = 420
    baseline = 460
    encoded_font = base64.b64encode(DM_SERIF_DISPLAY.read_bytes()).decode("ascii")
    if text != "#WWBuiltW":
        raise ValueError("workshop hashtag text must remain exactly #WWBuiltW")
    # The visible DM Serif Display W is 382 px wide at this production size.
    # Add 19 px, or 5%, only at the W | W | Built | W boundaries.
    initial_gap = 19
    svg = temp / f"{name}-hashtag.svg"
    svg.write_text(
        f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}">
<style>
@font-face {{
  font-family: "Always Allow Display";
  src: url("data:font/woff2;base64,{encoded_font}") format("woff2");
  font-style: normal;
  font-weight: 400;
}}
</style>
<text x="{width / 2}" y="{baseline}" text-anchor="middle"
  fill="#344650" font-family="Always Allow Display" font-size="{font_size}"
  font-style="normal" font-weight="400"><tspan stroke="#344650" stroke-width="10"
  stroke-linejoin="miter" paint-order="stroke fill">#</tspan><tspan>W</tspan><tspan
  dx="{initial_gap}">W</tspan><tspan dx="{initial_gap}">Built</tspan><tspan
  dx="{initial_gap}">W</tspan></text>
</svg>'''
    )
    return crop_alpha(render_svg(svg, width, height, temp / f"{name}-hashtag.png"))


def compose_below(mark: Image.Image, signature: Image.Image, gap: int) -> Image.Image:
    """Center the signature below the visible mark with an exact visible gap."""
    mark = crop_alpha(mark)
    signature = crop_alpha(signature)
    width = max(mark.width, signature.width)
    output = Image.new(
        "RGBA",
        (width, mark.height + gap + signature.height),
        (0, 0, 0, 0),
    )
    output.alpha_composite(mark, ((width - mark.width) // 2, 0))
    output.alpha_composite(
        signature,
        ((width - signature.width) // 2, mark.height + gap),
    )
    return output


def save(image: Image.Image, filename: str) -> Path:
    BUILD.mkdir(parents=True, exist_ok=True)
    output = BUILD / filename
    crop_alpha(image).save(output, optimize=True)
    return output


def build_brand_stickers(temp: Path) -> list[Path]:
    outputs = []

    lockup = render_svg(
        LOGOS / "2026.08.27_Lockup.svg",
        3000,
        414,
        temp / "lockup.png",
    )
    outputs.append(
        save(
            add_print_outline(lockup, 34),
            "2026.09.10_AlwaysAllow_LockupSticker.png",
        )
    )

    keycap = render_svg(
        LOGOS / "2026.08.27_LogoMaster.svg",
        2108,
        1680,
        temp / "keycap.png",
    )
    keycap_url = render_url_signature(temp, 108, "keycap")
    # The keycap SVG carries a long, faint shadow below its visible face. The
    # approved board treatment tucks the URL into that shadow field, so the
    # alpha layers intentionally overlap here instead of adding empty space.
    keycap_with_url = compose_below(keycap, keycap_url, -68)
    outputs.append(
        save(
            add_print_outline(keycap_with_url, 44),
            "2026.09.10_AlwaysAllow_KeycapSticker.png",
        )
    )

    icon = render_svg(
        LOGOS / "2026.08.27_LogoMarkSmall.svg",
        1800,
        1800,
        temp / "icon.png",
    )
    icon_url = render_url_signature(temp, 142, "icon")
    icon_with_url = compose_below(icon, icon_url, 95)
    outputs.append(
        save(
            add_print_outline(icon_with_url, 44),
            "2026.09.10_AlwaysAllow_IconSticker.png",
        )
    )
    return outputs


def build_workshop_hashtag_stickers(temp: Path) -> list[Path]:
    """Build the exact expanded workshop hashtag for board review."""
    outputs = []
    for name, text in WORKSHOP_HASHTAGS:
        hashtag = render_hashtag(temp, text, name)
        signature = render_url_signature(
            temp,
            76,
            f"{name}-signature",
            font_path=DM_SERIF_DISPLAY,
            font_family="Always Allow Display",
        )
        # 28 px is the requested 25% increase over the prior 22 px visible gap,
        # rounded to the nearest whole production pixel.
        artwork = compose_below(hashtag, signature, 28)
        outputs.append(
            save(
                add_print_outline(artwork, 34),
                f"2026.09.10_WorkshopHashtag_{name}Sticker.png",
            )
        )
    return outputs


def build_approved_lockup_reference(temp: Path) -> Path:
    """Save the approved board lockup without changing the locked brand masters."""
    width = 2988
    height = 412
    base = render_svg(
        LOGOS / "2026.08.27_Lockup.svg",
        width,
        height,
        temp / "approved-lockup-base.png",
    )
    artwork = Image.new("RGBA", base.size, (255, 255, 255, 255))
    artwork.alpha_composite(base)

    # Reproduce the approved board composition exactly at 4x its 747x103 source.
    mask_width = round(width * 0.221)
    mask = Image.new("RGBA", (mask_width, height), (255, 255, 255, 255))
    artwork.alpha_composite(mask, (0, 0))

    keycap_width = round(width * 0.142135)
    keycap_height = round(keycap_width * 840 / 1054)
    keycap = render_svg(
        LOGOS / "2026.08.27_LogoMaster.svg",
        keycap_width,
        keycap_height,
        temp / "approved-lockup-keycap.png",
    )
    keycap_x = round(width * 0.051747)
    keycap_y = round(height * -0.03032)
    artwork.alpha_composite(keycap, (keycap_x, keycap_y))

    APPROVED.mkdir(parents=True, exist_ok=True)
    output = APPROVED / "2026.09.10_AlwaysAllow_FullCompanyLockup_NameOnly.png"
    artwork.save(output, optimize=True)
    return output


def save_approved_artwork(temp: Path) -> list[Path]:
    """Freeze only the items Sarah approved on 2026-09-10."""
    APPROVED.mkdir(parents=True, exist_ok=True)
    approved = []
    copies = (
        (
            BUILD / "2026.09.10_AlwaysAllow_KeycapSticker.png",
            APPROVED / "2026.09.10_AlwaysAllow_Keycap_WithDomain.png",
        ),
        (
            BUILD / "2026.09.10_AlwaysAllow_IconSticker.png",
            APPROVED / "2026.09.10_AlwaysAllow_CommandIcon_WithDomain.png",
        ),
        (
            BUILD / "2026.09.10_WorkshopHashtag_WWBuiltWSticker.png",
            APPROVED / "2026.09.10_WWBuiltW_WithDomain.png",
        ),
    )
    for source, destination in copies:
        shutil.copyfile(source, destination)
        approved.append(destination)
    approved.append(build_approved_lockup_reference(temp))
    return approved


def build_loading_sticker(source: Path, icon: Image.Image, name: str) -> Path:
    text = resize_to_height(crop_alpha(Image.open(source)), 280)
    mark = resize_to_height(crop_alpha(icon), 190)

    gap = 24
    height = max(text.height, mark.height)
    art = Image.new("RGBA", (text.width + gap + mark.width, height), (0, 0, 0, 0))
    art.alpha_composite(text, (0, (height - text.height) // 2))
    art.alpha_composite(mark, (text.width + gap, (height - mark.height) // 2))

    return save(
        add_print_outline(art, OUTLINE_PX),
        f"2026.09.10_LoadingState_{name}Sticker.png",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--save-approved",
        action="store_true",
        help="also freeze the two approved stickers and name-only lockup reference",
    )
    args = parser.parse_args()

    with tempfile.TemporaryDirectory(prefix="always-allow-sticker-build-") as tmp:
        temp = Path(tmp)
        outputs = build_brand_stickers(temp)
        outputs.extend(build_workshop_hashtag_stickers(temp))

        icon = render_svg(
            LOGOS / "2026.08.27_LogoMarkSmall.svg",
            600,
            600,
            temp / "loading-icon.png",
        )
        source_dir = STICKERS / "raw" / "loading-state-candidates"
        for name, filename in LOADING_STATES.items():
            outputs.append(build_loading_sticker(source_dir / filename, icon, name))

        if args.save_approved:
            outputs.extend(save_approved_artwork(temp))

    for output in outputs:
        image = Image.open(output)
        print(f"{output.relative_to(REPO)}  {image.width}x{image.height}  {output.stat().st_size} bytes")


if __name__ == "__main__":
    main()
