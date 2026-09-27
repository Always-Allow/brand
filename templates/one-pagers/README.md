# Workshop one-pager

**Consolidation status, 25 September 2026: unverified.** This is the dated local copy from 3 September, preserved as a rebuildable candidate. The recorded Claude Design project is inaccessible to this account, so the current cloud version and editable master have not been confirmed. Sarah asked to mark it unverified and continue the consolidation. Do not label these staged files as the current approved one-pager or use the price placeholder for publication.

The two local HTML copies now use the 25 September SVG candidate derived from Sarah's approved 10 September company lockup. The SVG composition matched that approved PNG in the [September 27 visual comparison](../../docs/2026.09.27_LogoComparison.md); the current one-pager itself remains unverified. This local template update does not establish that the current Claude Design file, PDF or PowerPoint export has been updated or approved.

The historical two-page company workshop one-pager was approved by Sarah on 2026-09-03: page one is the
sample agenda for the two tracks, page two is what exists when the room clears, the candidate
list, the before and after, the keycap board of the client's tool stack, the price and the call
to action. That approval describes the September 3 version, not the later local logo edits.

## Source check, 27 September 2026

The [Notion asset record](https://app.notion.com/p/3cf57763ef6f81348cabf5ddc070414b) links to a September 2 PDF in Drive and a separately named September 3 attachment. The linked [Drive PDF](https://drive.google.com/file/d/1EyI9Psm4URhCEF_SH6QUwZL6IsMsN2Gw/view) was last modified September 2. Its metadata does not establish the current Claude Design version. A targeted Drive filename search found that PDF and no later workshop one-pager among the returned matches.

The Packages database lists **Foundations** and **Skills & Automations** as separate four-hour offers, each **starting at $6,000**, with status Selling. This saved template instead combines two two-hour tracks into one four-hour agenda. Its price needs an explicit scope decision, not an automatic substitution. The later sales project also asks for a two-hour buyer-focused version following a custom engagement; that is a separate revision brief.

The price placeholder is retained pending Sarah's confirmation. [Full source record and remaining decisions](../../docs/2026.09.27_TemplateAndAssetSources.md).

## Where it is edited

The recorded September 3 editing home was Claude Design, project `6962cb1d-d5e4-4f13-918d-db444fb98472`, file
`Always Allow Workshop One-Pager Copy Review.dc.html`. Current access and the latest master are unverified. In that version, text is edited inline; the
icons on the keycap board are logo slots, so a client's tools are dropped onto the caps; the
blue pills and the letter caps are plain text.

This folder was filed as the source of record for the one-pager, kept so it can be reprinted or rebuilt
without Claude Design. Sarah asked for the repo copy on 2026-09-03 and filed it as a template,
because every workshop reuses it; `FILING.md` holds the rule on where copies go, so read it
before moving this. The copy was taken 2026-09-03 after the keycap board went in and is stale
when the Claude Design file's version is newer; then re-copy the two `.dc.html` files from the
project and update this line.

## Files

| File | What it is |
|---|---|
| `always-allow-workshop-one-pager.dc.html` | Preserved September 3 HTML with later local logo edits; current cloud master unverified. Tool logos are embedded as data URIs. |
| `always-allow-workshop-one-pager-print.dc.html` | The same page with the print colour and animation resets Claude Design adds for export. |
| `2026.09.25_Lockup.svg` | Vector candidate based on the approved newer composition, used by both local HTML headers; logo composition comparison completed September 27; full one-pager review remains open. |
| `logo-keycap.png` | Previous header mark, retained for rollback and old exports. |
| `support.js`, `doc-page.js`, `image-slot.js` | The Claude Design runtime the page needs to lay out. Copied from the project on 2026-09-03, unmodified. |

## Export a PDF without Claude Design

Chrome prints the print companion straight to two Letter pages with no browser header or footer:

```
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --no-first-run --user-data-dir=/tmp/aa-print --allow-file-access-from-files --timeout=15000 \
  --no-pdf-header-footer --print-to-pdf=out.pdf \
  "file://$PWD/always-allow-workshop-one-pager-print.dc.html"
```

Verified 2026-09-03: two pages, 612 by 792 points each, and page two rendered clean through
CoreGraphics, which is what Preview on a Mac uses. Print the outer Claude Design viewer instead
of this file and you get one clipped page.

## Why the keycap shadow is a PNG

Chrome prints a CSS blurred shadow as a soft-masked image, and macOS Preview draws those as
solid grey blocks over the whole board. Measured 2026-09-03 through CoreGraphics, and it went
away only when the blur went. So the caps keep the hard Petrol wall as CSS and take their soft
shadow from a pre-rendered transparent PNG embedded in the style block, and the pills keep only
their solid drop. Do not put a blurred `box-shadow` back on anything that has to print.

## Still placeholder

The price reads `$[PRICE]` until the number from the Notion Packages database is confirmed. The
pill wording and the six tool logos are placeholders to be replaced per client.
