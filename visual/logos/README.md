# Logos

Sarah confirmed on 25 September that the [10 September approved name-only lockup](candidates/2026.09.10/README.md) should replace the older full logo across the site, page kit, templates, and logo-bearing merchandise. The transparent vector `2026.09.25_Lockup.svg` and the byte-identical approved white-background PNG `2026.09.10_AlwaysAllow_FullCompanyLockup_NameOnly.png` are staged as the replacement pair. The vector is derived from the approved composition; the September 27 same-scale visual comparison matches the approved reference composition, with small rasterization differences. See [the evidence](../../docs/2026.09.27_LogoComparison.md). Public release and downstream export checks remain. The 27 August full-lockup exports remain only for rollback and existing external links.

Every logo file, in one place. Open this folder, take the file, done.

| You need | Take this file |
|---|---|
| The approved newer full-logo reference | White-background `2026.09.10_AlwaysAllow_FullCompanyLockup_NameOnly.png` |
| The newer transparent full logo, staged for review | `2026.09.25_Lockup.svg`; composition matches the approved PNG in the September 27 comparison; downstream export and release checks remain |
| The keycap on its own, large | `2026.08.27_LogoMaster.svg`, or `2026.08.27_LogoMaster_1054x840.png` |
| A square icon or profile picture | `2026.08.27_LogoMarkSmall_512.png`, `2026.08.27_LogoMarkSmall_128.png`, `2026.08.27_LogoMarkSmall_48.png`, `2026.08.27_LogoMarkSmall_32.png`; vector `2026.08.27_LogoMarkSmall.svg` |
| A round profile picture, colour to the edge | `2026.08.27_Avatar_500.png`; vector `2026.08.27_Avatar.svg` |
| A favicon | `2026.08.27_LogoMarkTiny_16.png`; vector `2026.08.27_LogoMarkTiny.svg` |
| The name on its own, no keycap | `2026.08.27_Wordmark.svg` |
| The command symbol on its own | `2026.08.27_SymbolInk.svg` |

SVG scales to any size. PNG is for anything that cannot take an SVG, which is most upload
forms. The small mark (`LogoMarkSmall`) is a different drawing from the large keycap, made so it
stays readable under 48px; use it for icons and the large keycap for everything else.

Branding made for a specific account, such as the LinkedIn cover, the Luma calendar art, the
Etsy logo and banner, or the Mercury logo, is in [platform assets](../platforms/), at that platform's own sizes and
formats. Fonts are in [fonts](../fonts/). The [voice guide](../../voice/2026.08.27_BrandVoiceGuide.md) and the
[visual identity guide](../colours-and-type/2026.08.27_VisualIdentityGuide.md) have separate homes in this staged library.

`build/2026.09.25_LockupVectorBuild.mjs` reproduces the newer transparent vector from the locked August components. The 10 September sticker-board builder produced the approved PNG; its frozen source and approval record are preserved under `candidates/2026.09.10/source/`.

`build/` holds the scripts that make these files, their manifest and the filename matrix.
Nothing in this folder is edited by hand except `2026.08.27_LogoMarkSmall.svg`, which is a
hand-drawn cut pinned by hash; everything else goes through its builder in `build/`.
