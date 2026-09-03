# Countable units & motion (after Lieflat Charts)

Roger asked for "some of the interactions from Lieflat Charts"
(github.com/larashero3-dotcom/lieflat-charts). We adopted its **principles**,
re-implemented in our own tokens. We did not copy any code: that repo is
PolyForm Noncommercial and this is a business tool. Keep it that way.

## The rules we took

1. **A mark exists only if a real record is behind it.** One dot = one SOP,
   one square = one module check, one bar = one attempt, one tick = one
   question. No decorative dots, no fake density.
2. **Fast in, fast stop.** Quartic-out easing, no bounce. Dots pop in with
   ~12 ms stagger; bars rise with ~100 ms stagger (`lib/motion.ts`).
3. **Reveal on scroll, replay on click.** `useReveal()` fires when 30 % of
   the element is visible and bumps a `key`; clicking the element replays.
4. **Counters draw in.** `useCountUp()` for the progress ring and the score.
5. **Never break the axis.** Attempt bars are 0–100, always.
6. **Reduced motion wins.** Every animation is switched off under
   `prefers-reduced-motion: reduce`, and counters jump straight to the value.
7. **Chart card = title-as-conclusion + sub (what a unit means) + chart +
   source line.** See `.viz-card` on the Trainer page.

## Where they live

- `src/lib/motion.ts` — easing, stagger constants, `useReveal`, `useCountUp`
- `src/components/TickRow.tsx` — countable units (SOPs, questions, modules)
- `src/components/ProgressRing.tsx` — draw-in ring + counter
- `src/components/AttemptBars.tsx` — capsule bars per attempt, pass hairline
- Quiz top bar: one segment per question (answered = pine, current = brass)

## Gotchas

- Restart CSS animations by changing a React `key` on the animated subtree;
  toggling a class does not re-run `animation`.
- `useCountUp` must start from the target when `replayKey` is 0 (element not
  yet revealed) or reduced-motion is on — otherwise the page loads showing 0.
- In Playwright, `page.goto()` to the *same* hash URL doesn't remount the
  route; navigate elsewhere first if you need fresh component state.
- `pkill -f "vite preview"` from inside the same Bash call kills that shell
  too (exit 144). Kill the preview in its own call.
