# Plan: framework pass (2026-09-02)

**Goal.** Stand up the skeleton of a Trainual-style training app for the
Hospitality Coordinator role, with enough sample content to exercise every
screen, so the team can react to something real before we invest in
ingestion, auth, and AI.

**Out of scope (explicitly, per Roger):** login, Google Docs sync, Grok
integration, multi-trainee storage.

## Deliverables

- [x] Content model (`src/types.ts`) mirroring Trainual's hierarchy at the
      size we need: LearningPath → Module → SOP + Quiz.
- [x] `path.json` with 4 modules / 8 sample SOPs / 4 quizzes (29 questions,
      all three auto-graded types).
- [x] Learner UI: My Training (path with locking + progress ring + "up
      next"), SOP reader (markdown, mark-as-read, next/quiz CTA), Module
      check (shuffle, ask-N, submit, per-question feedback with link back to
      the SOP, retake).
- [x] SOP Library with keyword search and an "Ask AI" button wired to the
      provider stub.
- [x] Trainer dashboard: per-module table, every attempt with what was
      missed, reading log, reset.
- [x] `ProgressStore` interface with localStorage implementation.
- [x] `AiProvider` interface with stub.
- [x] GitHub Pages deploy workflow.
- [x] Compound Engineering scaffolding: CLAUDE.md, STRATEGY.md,
      docs/{brainstorms,plans,solutions}.

## Acceptance

- `npm run build` passes with zero TS errors.
- A trainee can read both Module 1 SOPs, take the check, fail, see which SOP
  to re-read, retake, pass, and see Module 2 unlock.
- Trainer page reflects all of the above.
- Everything above verified in a headless browser (see
  `docs/solutions/local-preview-and-screenshots.md`).

## Next passes (each gets its own plan)

1. **Content sync** — `scripts/sync-sops.ts`: Google Drive folder → markdown
   files with front matter (`sourceUrl`, `lastSynced`). Decide the SOP subset.
2. **Shared progress store** — second `ProgressStore` implementation; trainer
   dashboard lists trainees.
3. **Auth + hosting** — decision in `docs/brainstorms/` first.
4. **Grok** — server-side function for `askSops`; offline script for
   `generateQuestions` producing a draft quiz JSON for trainer review.
