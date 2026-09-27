# Brand exports, 27 September 2026

Private review files built from brand source commit `a1e55f722d27165403c521227a63c92a2f8604e3`. This batch updates saved exports. It does not publish the brand kit or change platform accounts.

## Which file to use

| Need | File or folder |
|---|---|
| Review the reusable deck | [2026.09.27_AlwaysAllow_ReusableDeck_14Layouts.pdf](2026.09.27_AlwaysAllow_ReusableDeck_14Layouts.pdf), 14 layouts |
| Review the generic one-pager | [2026.09.27_AlwaysAllow_ReusableOnePager.pdf](2026.09.27_AlwaysAllow_ReusableOnePager.pdf), two Letter pages |
| Review the workshop offer | [2026.09.27_AlwaysAllow_WorkshopOnePager_Candidate.pdf](2026.09.27_AlwaysAllow_WorkshopOnePager_Candidate.pdf), two Letter pages, client and price placeholders retained |
| Open these visual previews in PowerPoint | The three files ending `_VisualPreview.pptx` |
| Cover and social image files | [Cover and social images](cover-and-social-images/), 18 PNGs |
| All files, page previews and self-contained HTML pages | [2026.09.27_AlwaysAllow_BrandExportReview.zip](2026.09.27_AlwaysAllow_BrandExportReview.zip) |

The PDFs and PowerPoint previews contain rendered page images. Text and shapes are not separately editable in PowerPoint, and PDF text is not selectable. Editable originals remain in `templates/decks/` and `templates/one-pagers/` in the brand repository. The ZIP also includes the static HTML pages used for this render. The older 17-slide teaching deck has different content and is preserved; this 14-layout deck does not replace it.

## Export checks

- Every one of the 36 rendered surfaces was inspected individually: 14 deck pages, four one-pager pages, seven cover templates, four LinkedIn/Luma images and seven Notion covers.
- PNG dimensions were checked against the source canvas sizes. Deck previews are 1600x900; one-pager previews 816x1056; cover templates 1080x1080; LinkedIn 4200x700 and 1584x396; Luma 1500x500 and 1200x630; Notion 2400x460.
- PDF page counts are 14, 2 and 2. One-pagers are US Letter, 612x792 points. PDF pages and PowerPoint images use double-resolution page captures (3200x1800 and 1632x2112).
- All three PowerPoint packages passed the structural package checker with zero findings. Their embedded slide images match the checked captures. Native PowerPoint opening was not tested.
- Original WebKit vector PDFs mishandled translucent gradients. Those intermediate PDFs are excluded. Final PDFs use the checked raster captures to retain the wash, logo and shadows.
- Render inputs contain no JavaScript, remote dependencies or browser navigation. Fonts and images are embedded. The explicitly approved offline renderer disables JavaScript and network access. Its output is a new review export, not a byte-identical rerun of the historical Chrome builders.

## What remains a candidate

- The workshop one-pager has not been reconciled with the current cloud document. Its `$[PRICE]`, client fields, tool slots and example outcomes remain placeholders.
- The seven cover templates retain example event titles and historical dates from their source. They are layout references, not current event announcements. Recruiter example outcomes remain unapproved.
- The Petrol cover retains its separate light wordmark treatment. It is not evidence that the verified full-lockup SVG has been substituted there, or that the dark treatment is newly approved.
- The LinkedIn company cover contains no full logo in its source. It was rendered faithfully, not given a new logo placement. Strategy's Notion cover also has no full lockup and was not rebuilt.
- Notion uploads and crop behavior in the live workspace have not been checked. The seven covers are full-canvas exports only.
- Website share cards, event-specific deliveries, the older teaching deck, Etsy, sticker print artwork, delivered kits, headshot approvals and public releases remain separate work. No files in those areas were replaced.

## Source handling

The private source archive was downloaded at the pinned commit and extracted only to a temporary working directory. No deleted Projects checkout was recreated. Source HTML wording and layouts were retained. The workshop document's inert image-slot components were converted to static images for export; the chief-of-staff cover was assembled from its embedded seed JSON without running its editor, storage or publishing code. Local repository fonts replaced external font requests. Existing website worktree edits were left untouched.

The manifest records exact file hashes and source provenance. Older exports remain in their existing locations until consumer migration and approval are complete.
