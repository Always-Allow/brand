# Recap page

The page attendees get after a workshop: the recording, the transcript, the
slides, the handout, whatever else was given away, and the photos when there
are any. One template, one config per event.

Built 2026-09-20 for Pick Your Fighter, which is at `/pyf`.

## Making one

1. Copy an existing event's `_Recap.json` config and file it where `FILING.md`
   says. Pick Your Fighter's is the worked example.
2. Edit it. Everything that changes between workshops is in there.
3. Build it:

   ```
   python3 workshops/scripts/build-recap-page.py <path to that config>
   ```

   It writes `site/<slug>/index.html`. `cleanUrls` is already on in
   `site/vercel.json`, so the folder name is the URL and nothing else needs
   configuring. Check the slug does not collide with an existing route.

## The config

| Key | What it does |
|---|---|
| `slug` | the URL. `pyf` serves at `alwaysallow.com/pyf` |
| `title`, `subtitle` | the h1 and the line under it. Take them from the Luma listing, not from memory |
| `date_line` | the small line above the title, as plain strings: `["Monday 21 September 2026", "Online"]`. The builder escapes each and adds the separator |
| `expires` | `YYYY-MM-DD`, shown on the page. See "Taking it down" |
| `description` | the meta description |
| `recording` | the card's `heading` and `body`, plus `url` and `transcript_url`. Leave the two urls `null` until the files exist |
| `takeaways` | the numbered rows. Each one: `title`, `body`, optional `note`, and `actions`. The prompt row, when there is one, takes the next number |
| `photos` | `{src, alt}` each. **Empty removes the whole section** |
| `prompt`, `hero_art` | `false` removes those blocks. Without hero art the hero is one column |
| `whats_next` | the three closing links |

`recording`, `takeaways` and `whats_next` are required, along with the title,
subtitle, description, slug and expiry: the builder refuses a config without
them rather than building an empty section.

For a session with no recording, set `"recording": false`. The recording
section and its CSS are omitted. An object with null URLs keeps the existing
pending recording and transcript treatment.

An action with `"url": null` renders as a pending link: visibly not yet live,
marked for screen readers, and it does not navigate. That is the normal state
when the page is built before the recording exists. Fill the url in and
rebuild.

## Sections come out, they do not hide

A section the config has nothing for is removed from the built file: markup,
its CSS and its script. It is not hidden with `display:none` or an empty
heading. Everything under `site/` is served publicly and unlisted is not
private, so a section that renders as nothing still hands a reader whatever is
in the source. Pick Your Fighter was a Zoom webinar with no room photos, and
its built page contains no photo markup, no photo CSS and no photo script.

The photo section also sizes itself to what it is given: nothing at zero, one
framed image at one, the scrolling strip at two or more. A webinar that
produces a single screenshot gets a single image, not one card stranded in a
three-up track.

`?photos=0|1|2` on a built page previews those states. It is a preview
convenience, harmless in production, and has no effect on what is in the file.

## Kept out of search

The template carries `<meta name="robots" content="noindex">`, so every recap
page built from it stays out of search results. A recap page links a recording
and is written for the people who came. It is not in `site/sitemap.xml` either.
Noindex keeps a page out of search; it does not stop anyone with the link from
opening it, which is the point of the page.

## What this does not do yet

**Taking the page down is not automatic.** The date is printed on the page and
nothing enforces it. The intended shape is a small function in `site/api/`
reading an events file, serving the page inside its window and a short "this
one has come down" page after. Until that exists, removing the folder or adding
a redirect to `site/vercel.json` is the manual version.

## Publishing

Merging to `main` deploys production. See the repo `CLAUDE.md`: stage first,
and never deploy production without Sarah's say-so.

## Files

| File | What it is |
|---|---|
| `recap.html` | the template. Slots are `{{name}}`, optional blocks are `@if name` / `@endif` in HTML, CSS and script comments |
| `../../scripts/build-recap-page.py` | the builder |

The page is built on `site/assets/system.css` and takes its nav, footer,
keycap and photo strip from there, so it follows the site without carrying a
second copy of any of it.
