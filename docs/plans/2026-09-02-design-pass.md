# Plan: design pass — "high-end UI, simple interactions" (2026-09-02)

**Request (Roger):** UI 高端，交互简洁易懂.

## Design plan

**Subject.** A boutique-hospitality training tool. The visual world is the
front desk of a well-run hotel: calm, unhurried, brass-and-linen, nothing
shouting. The trainee should feel taken care of, the same way a guest is.

**Color.**
- `ink`      #16211C  — green-black, all primary text
- `pine`     #1F4D3A  — primary action, active states, brand
- `brass`    #B08A4A  — the one warm accent: progress, "current" markers
- `linen`    #F4F3EE  — page ground (warm-grey, not cream)
- `paper`    #FFFFFF  — surfaces
- `mist`     #E4E5DF  — hairlines; `slate` #66706A for secondary text
- Semantic: pass = pine, needs-work = #A8562E, locked = slate.

**Type.**
- Display: *Fraunces* (soft serif, optical sizing) — page titles, SOP titles,
  the big score. Used sparingly.
- Body/UI: *DM Sans* — everything else. Tabular numerals for scores/times.
- Fallbacks: Georgia / system sans.

**Layout.** One column, 720px measure for reading; a quiet top bar with three
text tabs. Home is a hero "Up next" + a vertical stepper of modules — the
stepper's line and nodes carry status, so pills and badges mostly go away.

## Interaction simplifications

1. **Home leads with one action.** A single "Continue" card at the top; the
   module list is for orientation, not navigation clutter.
2. **Name prompt becomes a one-line inline field** in the hero, only until set.
3. **SOP page**: reading-progress hairline under the top bar; one sticky
   action bar at the bottom ("Mark as read" → becomes "Next" / "Start check").
4. **Quiz shows one question at a time** with a progress count, Back/Next, and
   a review screen at the end. Feedback appears on the review screen, not
   mid-quiz (keeps the test honest and the screen calm).
5. **Trainer/Library**: same components, fewer borders; status via colour dot
   + word rather than pills of five colours.

## Not changing

Data model, store, routes, content. Pure `pages/` + `index.css` work.

## Acceptance

`npm run build` green; walk all four pages; republish preview.
