# SOP Academy — guide for AI agents and humans

Internal training app for Thinkspace, modeled on Trainual and scoped to a
single role: **Hospitality Coordinator** (1–2 trainees at a time). Trainees read
SOPs in a fixed order, pass a check at the end of each module, and a trainer
sees progress and results.

This repo follows **Compound Engineering** (Every's plugin:
`/plugin marketplace add EveryInc/compound-engineering-plugin` →
`/plugin install compound-engineering`). The rule is simple: every piece of
work leaves the repo smarter than it found it. Plans, decisions, and lessons
live *in the repo*, not in chat history, so the next person or agent can pick
up without regressing.

## Workflow (do this every time)

1. **Brainstorm** — for anything non-trivial, write or update a requirements
   note in `docs/brainstorms/<topic>-requirements.md` before coding.
2. **Plan** — write `docs/plans/YYYY-MM-DD-<topic>.md` (what, why, files
   touched, acceptance criteria). Update `STRATEGY.md` if the direction changes.
3. **Work** — implement against the plan. Keep commits small and descriptive.
4. **Review** — `npm run build` must pass (typecheck + bundle). Walk the four
   pages in a browser. For UI changes, screenshot before/after.
5. **Compound** — record anything learned in `docs/solutions/<topic>.md`
   (bugs, gotchas, decisions, "why we didn't do X"). Update this file if a
   convention changed.

Never skip step 5. If you fixed something confusing, the fix is not done until
it's documented.

## Stack

- Vite + React 19 + TypeScript, `react-router-dom` (HashRouter — GitHub Pages
  has no server rewrites), `react-markdown` + `remark-gfm`.
- No backend yet. Progress persists in `localStorage` via `src/lib/store.ts`.
- Static build → GitHub Pages via `.github/workflows/deploy.yml`.
- `npm run dev` / `npm run build` / `npm run preview`.
  Local preview of the prod build: `VITE_BASE=/ npm run build && VITE_BASE=/ npm run preview`.

## Layout

```
src/
  types.ts            content + progress model (read this first)
  content/
    path.json         THE learning path: modules → SOP ids → quiz id
    sops/*.md         one SOP per file, YAML-ish front matter + markdown
    quizzes/*.json    one quiz per module
  lib/
    content.ts        loads content/ at build time; validateContent()
    store.ts          ProgressStore interface + localStorage impl
    progress.ts       pure derivations: module status, locking, % complete
    quiz.ts           question selection + grading
    search.ts         keyword search (semantic search is a planned upgrade)
    ai.ts             AiProvider boundary (Grok goes here; stub for now)
  pages/              one file per route
docs/
  brainstorms/        requirements notes
  plans/              dated implementation plans
  solutions/          lessons learned, decisions, gotchas
```

## Conventions

- **Content is data.** Adding an SOP = add a `.md` under `content/sops/` and
  reference its id in `path.json`. Adding a question = edit the quiz JSON.
  No code changes needed. `validateContent()` warns in dev if ids don't line up.
- **SOP ids** are kebab-case file names and must be stable (progress is keyed
  on them).
- **The UI never talks to a vendor SDK.** AI goes through `lib/ai.ts`; storage
  goes through `lib/store.ts`. Swap implementations there.
- **Locking** is computed, never stored (`lib/progress.ts`). Don't add
  "unlocked" flags to the data.
- **No secrets in the browser bundle.** When Grok is wired up, calls go through
  a small server/edge function. An API key in `VITE_*` env is a bug.
- Sample SOP content is clearly marked `> **Sample content.**` — remove that
  line only when replacing with real Operational Directory text.

## Product decisions already made (don't re-litigate without a plan)

- One role, one path, `completeInOrder: true`, default pass score 80 %
  (safety module 90 %), unlimited retakes — same philosophy as Trainual.
- Trainee marks an SOP "read" explicitly; there is no scroll-tracking.
- Wrong answers link back to the SOP they came from (`question.sopId`).
- Login, multi-trainee storage, Google Docs sync, and Grok are **deferred**
  on purpose (see `docs/plans/2026-09-02-framework.md` → "Not in this pass").

## Open questions (answer these before building the related feature)

- Hosting/auth: GitHub Pages is public. Before real SOPs land, either add an
  auth layer or move to a host that supports Google SSO (Cloudflare Pages /
  Vercel). See `docs/brainstorms/sop-academy-requirements.md`.
- Should the SOP Library ignore module locking (act as a reference manual
  after onboarding)? Currently it respects locks.
