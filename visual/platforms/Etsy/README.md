# Etsy

The two files to upload, built 2026-09-02 from the current logo set:

| Slot | File | Size |
|---|---|---|
| Shop logo | `2026.09.02_EtsyLogo_500.png` | 500 x 500 |
| Big shop banner | `2026.09.02_EtsyBanner_1600x400.png` | 1600 x 400 |

The account still shows the avatar and banner from before the 2026-08-27 logo set. Uploading is
Sarah's, as the Luma and LinkedIn uploads were; the shop otherwise waits on the wind-down.

## Sizes

Checked against Etsy's own article "Requirements and Best Practices for Images in Your Etsy Shop"
(help.etsy.com, article 115015663347) on 2026-09-02.

| Surface | Etsy asks | Note |
|---|---|---|
| Shop logo | 500 x 500 recommended | |
| Big shop banner | 1200 x 300 minimum, 1600 x 400 recommended | the banner type this shop uses |
| Mini shop banner | 1200 x 160 minimum, 1600 x 213 recommended | not built; the shop uses the big banner |
| Any image | jpg, gif, png, svg or heic; Etsy converts uploads to sRGB (the standard colour profile for web images) | both files are under 25KB |
| Listing images | over 1MB may not finish uploading | Etsy says this of listing images only; the builder borrows 1MB as a threshold for the logo anyway |

Etsy renders transparent PNG pixels as black. The avatar in `brand/logos/` has rounded transparent
corners, so the logo here is that same avatar rendered over an opaque Petrol ground: the corners
fill in, the square bleeds Petrol to the edge, and the file carries no alpha channel (the layer
that records transparency) at all. The
avatar builder records, from 2026-08-27, that the shop page shows the logo in a circle; that is
repository knowledge, not something Etsy's article states, and a full-bleed square is right under
any crop shape either way.

## How they are built

The logo is built by `../2026.09.02_PlatformLogoBuild.mjs`, which also makes the Mercury one, and
the banner is built by `../../logos/build/2026.08.27_BannerBuild.mjs`, the same composition as
before scaled to Etsy's recommended size. Both builders have a `--check`, and both commands are in
the list in `brand/logos/build/2026.08.27_LogoFilenameMatrix.md`. Nothing here is edited by hand.

`[2026-09-02]` The three copies of what the account shows today were deleted the same day on
Sarah's call; git history has them.
