# ThinkBook

Trainual-style onboarding and SOP reference for Thinkspace's **Hospitality
Coordinator** role. Trainees read SOPs in order, pass a check at the end of
each module, and the trainer sees progress and results.

> Status: **framework pass**. All SOP content is sample text. Login, Google
> Docs sync, shared progress storage, and Grok are planned — see
> `docs/plans/2026-09-02-framework.md`.

## Run it

```sh
npm install
npm run dev            # http://localhost:5173/ThinkBook/
```

Production build + local preview:

```sh
VITE_BASE=/ npm run build && VITE_BASE=/ npm run preview
```

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`
(enable Pages → Source: *GitHub Actions* in the repo settings once).

## Screens

- **My Training** — the learning path: modules, SOPs, checks, locking, progress.
- **SOP** — reader with "I've read and understood" and a jump to the next step.
- **Module check** — short-answer questions; each answer gets an approximate
  accuracy, the complete answer, and the key points hit/missed; unlimited retakes.
- **SOP Library** — all SOPs by category, keyword search, "Ask AI" (stub).
- **Trainer** — per-module progress, every attempt with what was missed,
  reading log.

## Editing content

Content is data, no code changes required:

- `src/content/path.json` — module order, which SOPs and quiz each module has,
  pass score, complete-in-order.
- `src/content/sops/<id>.md` — one SOP; front matter `title`, `category`,
  `readMinutes`, `sourceUrl`, then markdown.
- `src/content/quizzes/<id>.json` — short-answer questions: `prompt`,
  `modelAnswer`, `keyPoints[]` (rubric), `sopId` for the "re-read" link.

Run `npm run dev` and check the console — `validateContent()` warns about any
dangling ids.

## Working on this repo

Read `CLAUDE.md` first. This repo uses Compound Engineering: plan in
`docs/plans/`, learn in `docs/solutions/`, keep `CLAUDE.md` current.
