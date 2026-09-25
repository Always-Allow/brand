# Workshop one-pager

**Consolidation status, 25 September 2026: unverified.** This is the dated local copy from 3 September, preserved as a rebuildable candidate. The recorded Claude Design project is inaccessible to this account, so the current cloud version and editable master have not been confirmed. Sarah asked to mark it unverified and continue the consolidation. Do not label these staged files as the current approved one-pager or use the price placeholder for publication.

The two local HTML copies now use Sarah's approved 10 September company lockup in their headers. This is a local template update, not a claim that the current Claude Design file, PDF or PowerPoint export has been updated or approved.

The two-page company workshop one-pager, as approved by Sarah on 2026-09-03: page one is the
sample agenda for the two tracks, page two is what exists when the room clears, the candidate
list, the before and after, the keycap board of the client's tool stack, the price and the call
to action.

## Where it is edited

The editable copy lives in Claude Design, project `6962cb1d-d5e4-4f13-918d-db444fb98472`, file
`Always Allow Workshop One-Pager Copy Review.dc.html`. Edit there. Text is edited inline; the
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
| `always-allow-workshop-one-pager.dc.html` | The source. Tool logos are embedded as data URIs so it renders offline. |
| `always-allow-workshop-one-pager-print.dc.html` | The same page with the print colour and animation resets Claude Design adds for export. |
| `2026.09.25_Lockup.svg` | The approved newer lockup composition used by both local HTML headers. |
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
