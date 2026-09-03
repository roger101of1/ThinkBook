# Design system (as of the 2026-09-03 Apple-style pass)

All tokens live at the top of `src/index.css`. Use them; don't add literals.
Token names are **roles**, not colours, so a palette swap never touches
components again (the first pass named them after hues and we paid for it).

| Token | Value | Role |
|---|---|---|
| `--ink` | #1D1D1F | primary text, "current" markers |
| `--accent` | #0071E3 | the one accent: buttons, links, progress, done |
| `--accent-deep` / `--accent-tint` | #0062C4 / #EAF3FD | hover / selected fill |
| `--ground` | #F5F5F7 | page |
| `--paper` | #FFFFFF | panels, cards |
| `--line` | #D2D2D7 | separators |
| `--secondary` | #6E6E73 | secondary text |
| `--good` | #34C759 | semantic only: pass |
| `--negative` | #FF3B30 | semantic only: fail / missed |
| `--focus-tint` | #E8E8ED | halo behind the current stepper node |

Roger's brief: *Apple colour style, but not rainbow.* So: one blue, neutral
greys, and green/red appear **only** where the meaning is pass/fail (score,
status dots, review marks). Everything else — progress, current, done — is
blue or ink. Do not introduce orange/purple/teal for "variety".

## Type

System stack first: `-apple-system, BlinkMacSystemFont, 'SF Pro …'` so Apple
devices render San Francisco; Inter (Google Fonts, loaded in `index.html`)
is the fallback for Windows/Android. No serif. Headlines are 600–700 with
tight tracking (−0.02 to −0.04 em) — that's where the Apple feel comes from,
more than the colour.

## Surfaces

- Top bar: translucent white with `backdrop-filter: blur(20px) saturate(180%)`.
- Panels: white, 1 px `--line`, radius 18 px; the hero gets a soft shadow.
- Buttons: pill; primary = accent fill; secondary = white outline.
- Light-only on purpose; `body` paints `--ground` explicitly.

## Interaction rules (unchanged from the previous pass)

- Home leads with one action; the stepper is orientation.
- Status is carried by node/line colour plus one word, not pills.
- SOP page: one sticky action bar whose label changes with state.
- Quiz: one question per screen; feedback on the review screen only.

## Gotcha

Playwright screenshots in the sandbox render Helvetica/Liberation (no SF, no
Google Fonts). Judge layout there, judge type on a Mac or on the published
artifact.
