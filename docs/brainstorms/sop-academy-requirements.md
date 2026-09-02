# SOP Academy — requirements (brainstorm)

_Status: agreed for the framework pass, 2026-09-02._

## Source request (paraphrased)

- ~300 SOP documents live in the Operational Directory (Google Docs, text-heavy).
- Employees need a way to refer to SOPs, be onboarded, learn, and be evaluated
  (quiz/test/eval) so we know they know the SOPs.
- Model it after Trainual.com.
- Constraints: code in GitHub (invite peter@ and exmachina@thinkspace.com),
  use Grok, use the Compound Engineering framework so work is documented in
  the repo and other people/AI can continue without regressing.
- Scope narrowed to: **Hospitality Coordinator only, 1–2 trainees at a time.**
- Instruction for this pass: don't handle login or file/doc ingestion yet —
  build the framework.

## How Trainual works (researched from their help center)

- Content hierarchy: Subject → Document/Topic → Page/Step. Subjects grouped
  under Company / Policies / Processes.
- People: five permission levels; users belong to Groups (role/team/dept/
  location); content is assigned to groups.
- Onboarding: per-user Training Path made of Sets; "complete in order"
  locks later content; delays or scheduled release between sets; required vs
  reference content; due dates; certificates.
- Tests: one per subject; single/multi/true-false auto-graded, written/video
  manual; settings = pass score %, result emails, shuffle, ask N of M;
  **unlimited retakes** (by design); AI can auto-generate ~10 MCQs for
  human review before publishing.
- Trainee home: To Do / Completed / Reference + streaks, rings, leaderboard;
  AI search over content.
- Reports: per-person completion and every test attempt; per-subject
  completion, time estimates; version history.
- Import limits (a real weakness): Google Docs must be downloaded as
  docx/PDF, ≤3,000 words, no TOC.

## What we keep for one role / 1–2 trainees

| Trainual concept | Ours |
|---|---|
| Subject | Module |
| Document | SOP (one Google Doc) |
| Test | Module check (quiz) |
| Training Path with "complete in order" | `path.json` with `completeInOrder` |
| Pass score, shuffle, ask N of M, unlimited retakes | same |
| Auto-generate test → human review | Grok drafts → trainer approves (planned) |
| People report / test results | Trainer dashboard |
| AI search | Keyword now, Grok Q&A with citations later |

Dropped: groups, permission levels beyond trainee/trainer, delays/scheduled
release, leaderboards/streaks, certificates, e-sign, org chart, video answers.

## Open decisions

1. **Hosting & auth.** "Deploy to GitHub" = GitHub Pages = public. Fine for
   sample content; not fine for real SOPs. Options: (a) Cloudflare Pages +
   Access (Google SSO, free tier), (b) Vercel + NextAuth, (c) keep Pages and
   put real content behind a simple backend that checks a Google token.
2. **Where progress lives.** localStorage now. For 1–2 trainees a Google
   Sheet via Apps Script, or Supabase free tier, is enough. Needs a decision
   before the trainer dashboard can show more than one person.
3. **Which SOPs.** Which of the 300 apply to this role? A folder in the
   Operational Directory, or a hand-picked list?
4. **Path order.** Is there an existing onboarding checklist to mirror, or do
   we draft the sequence from the SOPs?
5. **Grok data policy.** Sending SOP text to xAI for question generation /
   Q&A — confirm this is acceptable under the "keep our data secure" boundary.
