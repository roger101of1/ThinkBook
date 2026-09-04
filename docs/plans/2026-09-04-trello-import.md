# Plan: import the "New Hire Training" Trello board into ThinkBook (2026-09-04)

**Request (Roger):** the Trello board https://trello.com/b/hbYmxp4o/new-hire-training is the
complete, current Hospitality Coordinator onboarding. Bring *all* of it in, follow the linked
Google Docs (trainees will click the links; the AI must know the content to write and grade
questions), skip empty cards, never store secrets, and rename the app **ThinkBook**.

## How it was done
1. Board JSON pulled via the built-in browser (`/b/<id>.json`) → `trello/board.json`; 13 lists,
   79 cards, 51 with descriptions, 38 links in descriptions, 0 attachments (except one PDF).
2. 16 linked Drive files fetched with the Google Drive connector; text saved under
   `trello/docs/`. Three could not be opened by roger@ (listed in `docs/not-accessible.md`).
3. Four subagents converted lists → SOP markdown + one short-answer quiz per module, following
   `trello/BRIEF.md` (completeness, links, secrets rules, format).
4. Secrets scan over the output (known passwords/codes from the sources) → clean.
5. `path.json` rebuilt: 12 modules in Trello order (+ "Kube · Contracts" from the printed
   manual after Day 0). Admin and "Things I still need to be trained on" dropped (no content).
6. Product change: **SOPs are always readable; only module checks lock.** ThinkBook is the
   reference manual as well as the course.

## Result
51 SOPs, 12 checks, 86 short-answer questions. 28 cards skipped as empty (listed per module in
`trello/out/manifest-*.json`).

## Follow-ups for the trainer (surfaced as `> Note for the trainer` inside SOPs)
- Access needed: Daily/Opening Checklist doc, Vendor spreadsheet, DISC.pdf.
- Conflicts kept side by side: dog fee refundable vs non-refundable; John Demaree's two numbers;
  huddle "daily" vs M/T/Th/F; ViewGlass app store; PTO card vs handbook.
- Cards that show secrets in plain text on Trello (HVAC IVU password, bike lock code, Liftmaster
  reset code) should be cleaned up on the board — ThinkBook never shows them.
