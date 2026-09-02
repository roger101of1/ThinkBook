# STRATEGY.md

**Problem.** New Hospitality Coordinators at Thinkspace need to learn ~a
subset of 300+ SOPs (Google Docs in the Operational Directory) and prove they
know them. Today that is ad hoc. Trainual does this well but is
demo-gated, priced for far more seats than we have, and imports Google Docs
badly.

**Persona.** A Hospitality Coordinator in their first two weeks (1–2 at a
time), and the trainer/manager who signs them off.

**Approach.** A small Trainual-style app we own: fixed learning path →
read SOPs → pass a check per module → trainer sees progress. SOPs stay in
Google Docs as the source of truth and are synced in; AI (Grok) drafts quiz
questions for a human to approve and answers questions over the SOP text.

**What "done" looks like for v1.**
- A trainee can go from zero to "ready for sign-off" without help.
- A trainer can see, for each trainee, what was read, every check attempt,
  and what was missed.
- Content comes from the real Operational Directory, not hand-written files.

**Metrics.** Time-to-sign-off for a new coordinator; first-attempt pass rate
per module (low → SOP or question needs work); trainer time spent per hire.

**Non-goals (v1).** Org charts, e-signatures, video answers, gamification,
multiple roles, the Operations/Performance suites Trainual sells.
