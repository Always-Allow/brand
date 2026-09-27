# Luma cover templates, locked 2026-08-28

Seven templates, one per kept pattern. The imported originals were traced to the review-page tiles by content hash. The HTML here subsequently received the September SVG candidate; the preserved PNGs have not been regenerated from those edits. Do not treat each current HTML/PNG pair as matching.

Consolidation note, 25 September 2026: the seven patterns below are the original active set.
Two later patterns Sarah kept on 8 September, `dialog-always-allow` and `scorecard-ready`, are
[staged separately as source candidates](candidates/2026.09.08/README.md). Their old website
asset dependencies and cover-builder support have not been reconciled, so they are not in
`make-cover.py --list` yet.

To make the next event's cover, do not edit these files. Duplicate one:

```
cd scripts/templates

python3 make-cover.py --list

python3 make-cover.py --template staircase-clean \
    --title "Intro to AI" --place NYC --date 2026-09-17 --time 6:30pm \
    --out ~/some/where
```

That writes a new `.html` and a rendered 1080x1080 `.png` into `--out`, leaving the template
untouched. The seven covers cut for September and October are the worked examples, filed
with their events in the content library.

## The set

| Template | The pattern | Came from |
|---|---|---|
| `chief-of-staff-morning` | Chat opener, tools cascade, outcomes docked | Sarah's playground layout |
| `staircase-clean` | Hairline treads with the step icons, no connectors | r14-j2 |
| `stream-outcomes-docked` | Outcome chips docked onto app tiles, the per-vertical template | r11-j3 |
| `board-cmd-key` | Keyboard board, per-session icon swaps, command glyph centre key | r10-j4 |
| `chip-wall` | Dense chip field, four skills lit in Petrol | r11-k2 |
| `loop` | The four chips round the master keycap | r6-f4a |
| `petrol-board-offset` | Petrol ground, for sponsored, webinar or special events | r10-j5 |

`chief-of-staff-morning` carries its layout as a JSON state block, because it came out of the
playground, so it can also be reopened and dragged. The other six carry their content as
markup. `make-cover.py` handles both, and says which mode it used.

## The weekday is derived, never typed

Every cover in the set shipped with a weekday that did not match its own date. All five dates
matched the **2025** calendar: 24 Sep 2025 was a Wednesday, 18 Sep 2025 a Thursday, and so on,
while in 2026 each falls a day later. The labels were one day behind on all seven covers.

`make-cover.py` takes `--date` as `YYYY-MM-DD` and computes the weekday from it, so the two
can no longer disagree. The templates still carry their original wrong strings, which is
harmless because nothing renders a template directly, but it is why you should always go
through the script rather than copying a file by hand.

That date/weekday question was recorded with the original templates. Consult the current event record for a new cover; this historical note is not a claim about the current published schedule.
