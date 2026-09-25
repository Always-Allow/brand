# Logos

The [10 September approved name-only lockup reference](candidates/2026.09.10/README.md) is preserved as a candidate for the post-launch revision. It has not been promoted to the current export set. The 27 August files below remain the delivered files while the revised vector, site, page kit, templates and Printify placements are reconciled.

Every logo file, in one place. Open this folder, take the file, done.

| You need | Take this file |
|---|---|
| The logo: keycap beside the name, for anything 48px or bigger | `2026.08.27_Lockup.svg`, or `2026.08.27_Lockup_747x103.png` |
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
Etsy logo and banner, or the Mercury logo, is in `../Platforms/`, at that platform's own sizes and
formats. Fonts are in `../fonts/`. The voice guide and the visual identity guide are in
`../guides/`.

`build/` holds the scripts that make these files, their manifest and the filename matrix.
Nothing in this folder is edited by hand except `2026.08.27_LogoMarkSmall.svg`, which is a
hand-drawn cut pinned by hash; everything else goes through its builder in `build/`.
