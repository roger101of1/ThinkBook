# Short-answer grading

Checks are free-text. The learner types; we return an approximate accuracy,
the complete (model) answer, and which key points were hit or missed.

## How the rubric grader works (`src/lib/grader.ts`)

Each question carries `keyPoints[]`. For each point we extract *key terms*:
numbers/money/percents, quoted names, hyphenated compounds, and content
words after stop-word removal. A point is covered when

- every *decisive* term (number, quoted phrase, hyphenated term) is present, or
- at least half of the terms are present (stemmed, with a synonym table for
  things like cannot/can't, apologize/sorry, auto-pay/autopay, on/enabled).

Accuracy = covered / total, rounded to 5. It is deliberately lenient on
wording and strict on facts — a learner who writes "12 months fixed, auto
renew on, +4%" scores 100; one who writes "set it up normally" scores 0.

## Writing key points that grade well

- One fact per point. "Term 6 or 12" and "Fixed Term" as two points, not one.
- Put the number or the exact UI name in the point — those are decisive.
- Avoid vague verbs; the grader ignores click/select/enter/use.
- Test with `npx tsx gtest.ts`-style scripts: write 3 realistic answers
  (good / partial / wrong) per question and check the scores feel fair.

## Known limits (why this is "approximate")

- Can't tell a negated statement from an affirmed one ("do NOT tick Include
  Archived" scores the same as "tick Include Archived").
- Paraphrase beyond the synonym table is missed (e.g. "top right" ≠
  "upper-right corner").
- No credit for correct facts that aren't in the rubric.

The LLM grader (Grok) will fix all three while keeping the same
`{ accuracy, covered, missed, feedback }` shape, so nothing in the UI changes.
