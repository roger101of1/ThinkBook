# Design system (as of the 2026-09-02 design pass)

All tokens live at the top of `src/index.css`. Use them; don't add literals.

| Token | Value | Use |
|---|---|---|
| `--ink` | #16211C | primary text |
| `--pine` | #1F4D3A | primary buttons, links, "done" |
| `--brass` | #B08A4A | the one accent: progress ring/bars, "current" step, active tab |
| `--linen` | #F4F3EE | page ground |
| `--paper` | #FFFFFF | panels |
| `--mist` | #E4E5DF | hairlines |
| `--slate` | #66706A | secondary text |
| `--clay` | #A8562E | "needs work" / fail only |

Type: **Fraunces** for display (titles, big score, question prompt),
**DM Sans** for everything else. Loaded from Google Fonts in `index.html`;
fallbacks are Georgia / system sans so the sandbox (which can't reach
Google Fonts) still renders correctly.

Light-only on purpose. `body` paints `--linen` explicitly so the page holds
on any host background.

## Interaction rules that came out of the pass

- Home leads with **one** action (the hero). The stepper is orientation.
- Status is carried by the stepper node + line colour and a single word,
  not coloured pills.
- SOP page has one sticky action bar; its label changes with state
  (mark read → next SOP / take check).
- Quiz is one question per screen; feedback only on the review screen.
- Only two button styles: `.btn.primary` (pine) and `.btn` (outline);
  `.btn.quiet` for tertiary links inside toolbars.

## Gotcha

Playwright screenshots in the sandbox show fallback fonts (Google Fonts is
blocked by egress policy). Judge layout there, judge type on the published
artifact.
