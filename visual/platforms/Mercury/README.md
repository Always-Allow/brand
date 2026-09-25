# Mercury

The file to upload, built 2026-09-02 from the current logo set: `2026.09.02_MercuryLogo_1024.jpg`,
1024 x 1024, JPEG.

The account still shows a logo from before the 2026-08-27 logo set. Uploading is Sarah's, and the
article's route is to open the company menu at the top left of the dashboard, choose Settings,
hover the placeholder icon beside the company name, click Add logo, crop if needed, and save.
Invoices take their own logo upload, under Invoicing, Invoice settings, Branding. The
invoice article states only a minimum of 256 square, which this file meets, and says nothing about
format, so whether that uploader takes a JPEG is found out by trying it.

## Sizes

Checked against Mercury's own articles on 2026-09-02: "Add or change a custom logo on your Mercury
account" (support.mercury.com, article 28772366824340) and "Customizing your invoicing template"
(article 29648303115924).

| Surface | Mercury asks | Note |
|---|---|---|
| Account logo | a JPEG or JPG upload, cropped in the dashboard | the article's words are "a JPEG/JPG version of your logo"; no pixel size stated; 1024 leaves the crop tool room |
| Invoice logo | at least 256 x 256 | no format stated |

A JPEG cannot carry transparency, so the file is the avatar from `brand/logos/` rendered over an
opaque Petrol ground, full bleed, so there is no corner of a second colour for Mercury's crop to
show. The encode is checked against the render pixel by pixel before the file is written.

## How it is built

It is built by `../2026.09.02_PlatformLogoBuild.mjs`, which also makes the Etsy logo. That
builder's `--check` compares a fresh render with this file, and the command is in the list in
`brand/logos/build/2026.08.27_LogoFilenameMatrix.md`. Nothing here is edited by hand.

`[2026-09-02]` The two copies of what the account shows today were deleted the same day on Sarah's
call; git history has them.
