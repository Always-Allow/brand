# Saved cover layouts

`layout.json` is the live one. The Cover Playground reads it on boot and writes
back to that exact name, so it is the only file the tool itself uses.

The other two are Sarah's earlier saves of the same Building with AI cover, kept
because they are genuinely different artwork rather than duplicates: the second
adds two elements and changes nine, and the chip fix that became `layout.json`
changes another.

| File | Status |
|---|---|
| `layout.json` | **live.** Her latest save, the source of truth for the Building with AI cover |
| `layout-v2.json` | historical |
| `layout-v1.json` | historical, the earliest of the three |

The two historical files are not competing sources and nothing should read them
automatically. `layout.json` is the newest; the version numbers run oldest to
newest, so a future save supersedes `layout.json` and the old one becomes
`layout-v3.json`.

No file in this folder carries a date. That is `WORKSHOPS.md`'s rule for
`templates/`, and every one of the 24 files here follows it.
