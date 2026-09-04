# Brief for content subagents — ThinkBook (Thinkspace Hospitality Coordinator onboarding)

You are converting Trello cards (plus the Google Docs they link to) into SOP pages and
short-answer checks for an internal training app called **ThinkBook**. The audience is a
new Hospitality Coordinator at Thinkspace (coworking; two locations: Redmond "RED" at
8201 164th Ave NE, and Seattle "SEA" at 1700 Westlake Ave N, Lake Union Building).

## Inputs (read them; do not guess)
- `/home/claude/trello/cards.json` — every card: `list`, `name`, `desc` (markdown), `checklist`, `url`.
- `/home/claude/trello/docs/*.md` — text of the Google Docs the cards link to (already fetched;
  some credentials already redacted). `docs/not-accessible.md` lists links we could NOT open.
- Example of the target SOP format: `/home/claude/sop-academy/src/content/sops/kube-virtual-office-coworking-contracts.md`
- Example of the target quiz format: `/home/claude/sop-academy/src/content/quizzes/q-kube-contracts.json`
- Type definitions: `/home/claude/sop-academy/src/types.ts` (Question = prompt, modelAnswer, keyPoints[], sopId, hint?)

## Output (write files; do not touch anything under /home/claude/sop-academy)
- One SOP per card with content → `/home/claude/trello/out/sops/<id>.md`
- One quiz per module (Trello list) → `/home/claude/trello/out/quizzes/q-<module-id>.json`
- A manifest → `/home/claude/trello/out/manifest-<your-group>.json`:
  `[{ "module": "<Trello list name>", "moduleId": "<kebab>", "sops": ["<id>", ...], "quiz": "q-<module-id>", "skipped": ["<card name>", ...] }]`

## Rules — read twice
1. **Skip cards with no real content** (empty description, or only a placeholder like
   "30 minutes"). List them under `skipped`. A card whose description is only a link to a doc
   we fetched is NOT empty — the doc is the content.
2. **Completeness beats brevity.** Every fact, number, name, rule, phone number of a
   vendor/property manager, and step in the card or linked doc must appear in the SOP.
   Restructure freely (steps, tables, "if…then…"), but do not drop or invent facts.
   Where the card and a doc disagree, keep both and add a `> **Note for the trainer:**` line.
3. **SECRETS NEVER GO IN.** Do not write any password, door/keypad/lockbox/bike/callbox code,
   master code, promo code, Wi-Fi key, account number, or login credential — not even ones you
   see in the inputs. Replace with "**see 1Password**" (or "in the Door Codes sheet — link below").
   Specifically redact: the HVAC IVU password on the "HVAC IVU.thinkspace.com" card; "Code is [REDACTED]"
   on "Locking bicycle storage"; "The Code is [REDACTED]" on "Liftmaster CAPXS"; the PrintWithMe promo
   code; the ViewGlass app password; any code in the door-code sheets. Business phone numbers of
   property managers and vendors are fine to keep. Personal names are fine.
4. **Links stay clickable.** Every Google Doc / sheet / site the card links to goes in a
   `## Links` section at the end as `- [Label](url)`, and the Trello card URL goes in front matter
   as `sourceUrl`. Trainees will click them from ThinkBook.
5. **SOP file format** — front matter then markdown:
   ```
   ---
   title: <card name, cleaned>
   category: <module name>
   readMinutes: <estimate>
   sourceUrl: "<trello card shortUrl>"
   lastSynced: 2026-09-04
   ---
   > **Source:** Trello card "<name>" in list "<list>"; linked docs: <names or "none">.
   ## Purpose  (one or two sentences)
   ... body ...
   ## Links
   ```
   Use `##` headings, numbered steps, tables for field/value data, `> **Warning**` for one-way
   or costly mistakes. Mention RED vs SEA explicitly whenever the rule differs by location.
   If a linked doc could not be opened (see docs/not-accessible.md), keep the link and add
   `> **Note for the trainer:** this document needs access granted to roger@thinkspace.com before it can be transcribed.`
6. **SOP ids**: kebab-case of the card name, ≤ 50 chars, stable, no leading numbers.
7. **Quiz per module**: 1–3 short-answer questions per substantive SOP (0 for trivial ones),
   capped at 12 per module. Each question: `id` (`<moduleId>-<n>`), `sopId`, `prompt`
   (a situation or "explain…" — never yes/no), `modelAnswer` (2–4 sentences, complete),
   `keyPoints` (2–5 concrete facts; put the exact number / name / step text in each; one fact per
   point; never a secret). Questions must be answerable from the SOP text alone.
   Quiz JSON: `{ "id": "q-<moduleId>", "title": "<Module> Check", "shuffle": true, "questions": [...] }`.
8. Write in clear, warm, direct English; second person ("you"). No em-dash-heavy prose.
9. When done, print the manifest and a one-paragraph summary of anything ambiguous.
