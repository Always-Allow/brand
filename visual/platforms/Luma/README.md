# Luma

The calendar's own branding on lu.ma, plus the renderer that produces it. Moved
here from `workshops/calendar/` on 2026-09-01.

| File | What it is |
|---|---|
| `calendar-icon.png` | the calendar icon, 1024x1024 |
| `calendar-cover.png` | the calendar cover |
| `calendar-social.png` | the social share image |
| `_render-calendar-assets.html` | all three in one file |
| `build-calendar-assets.py` | renders them |

`[2026-09-02]` A QR file listed here as the calendar's was deleted on Sarah's call. It encoded `alwaysallow.com/code`, a redirect for a retired workshop, not the calendar.

Per-event cover tiles are not here. They live with their event, at
`workshops/events/<event>/cover/`, cut from the seven locked patterns in
`workshops/templates/covers/` by `workshops/scripts/make-cover.py`.
