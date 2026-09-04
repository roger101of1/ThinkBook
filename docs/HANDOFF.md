# HANDOFF — read this first, then CLAUDE.md

_Last updated 2026-09-04 by the agent that built the first version. Update this file
at the end of every working session; it is the one place the next agent looks._

## What ThinkBook is
Internal onboarding + SOP reference for Thinkspace's **Hospitality Coordinator** role
(1–2 trainees at a time). Modeled on Trainual, scoped down. Static React app; content is
data in `src/content/`. Live preview (Claude artifact) and this repo are the two places it
exists today. Owner: Roger (roger@thinkspace.com). Collaborators to invite: peter@thinkspace.com,
exmachina@thinkspace.com.

## Current state (what works)
- 12 modules / 51 SOPs / 86 short-answer questions, imported from the Trello board
  "New Hire Training" + 16 linked Google Docs (`docs/plans/2026-09-04-trello-import.md`).
- Learner flow: My training (stepper, one "Up next" action) → SOP reader → module check
  (free-text answers, rubric-graded approximate accuracy, complete answer + key points shown)
  → Trainer dashboard.
- SOPs always readable; only module checks lock in order.
- Apple-style design tokens (`docs/solutions/design-system.md`), Lieflat-style countable units
  and motion (`docs/solutions/countable-units-and-motion.md`).
- Progress = localStorage only. AI = local rubric grader only. No login. No backend.
- `npm run build` is green. Deploy workflow for GitHub Pages is in `.github/workflows/deploy.yml`
  (enable Pages → Source "GitHub Actions" once).

## How to work here (Compound Engineering)
1. Read `CLAUDE.md` (conventions, decisions already made, open questions).
2. Before a non-trivial change: write `docs/plans/YYYY-MM-DD-<topic>.md`.
3. After: record learnings in `docs/solutions/<topic>.md`, update `CLAUDE.md` if a convention
   changed, and update the "Current state" + "Next" sections of this file.
4. Never commit secrets. Passwords / door / lockbox / promo codes → "see 1Password".

## Source material and where it lives
- Trello board JSON, per-card dump, fetched Google Docs, subagent brief and manifests:
  `trello/` at the repo root (`trello/BRIEF.md` is the conversion spec — reuse it when the
  board changes). `trello/docs/not-accessible.md` lists files still needing access.
- Printed Kube manual (8 pages, transcribed from video): `src/content/sops/kube-virtual-office-coworking-contracts.md`.

## Open questions waiting on humans
- Abby: dog fee refundable vs nonrefundable; John Demaree's two numbers; PTO card vs handbook;
  access to Opening/Closing Checklist doc, Redmond Vendor List, DISC.pdf. (Email drafted 2026-09-04.)
- Roger: hosting/auth choice (recommendation: Cloudflare Pages + Access with Google SSO);
  whether SOP text may be sent to xAI (Grok) for grading/Q&A.

## Next (in order)
1. **Push + Pages.** Repo is `github.com/roger101of1/ThinkBook`, branch `main`. Enable Pages.
2. **Shared progress store.** Second `ProgressStore` implementation (Google Sheet via Apps
   Script, or Supabase). Then the Trainer page lists all trainees. Interface: `src/lib/store.ts`.
3. **Grok grader.** Implement `AiProvider.gradeShortAnswer` against xAI behind a small edge
   function; keep the rubric grader as fallback. Interface: `src/lib/ai.ts`, shape in `src/lib/grader.ts`.
4. **Content sync script.** `scripts/sync-trello.ts` to re-run the import when the board or
   docs change, using `trello/BRIEF.md` rules; flag changed SOPs as "needs re-read".
5. **Fold in Abby's answers** and the three inaccessible docs; remove the matching
   `> Note for the trainer` lines.
6. **Auth + hosting** per the decision above.
