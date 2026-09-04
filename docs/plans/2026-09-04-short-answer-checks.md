# Plan: short-answer checks (2026-09-04)

**Request (Roger):** questions are short-answer only. The AI's job is to
give the fuller/model answer and an *approximate* accuracy — not to be a
multiple-choice grader.

## Model

- `Question` becomes `{ id, prompt, modelAnswer, keyPoints[], sopId, hint? }`.
  `keyPoints` is the rubric: the 2–5 facts a good answer must contain.
- `QuizAttempt.answers[qid]` becomes `{ text, accuracy, covered[] }`.
- Quiz score = mean accuracy across questions; pass mark unchanged.

## Grading

`AiProvider.gradeShortAnswer(question, text)` → `{ accuracy 0–100, covered[],
missed[], feedback }`. Two implementations:

1. **Rubric grader (local, ships now).** For each key point, check whether
   its key terms (numbers, quoted names, capitalised terms, remaining
   content words) appear in the learner's text, with light stemming and
   synonyms for on/off, yes/no. Accuracy = covered / total, rounded to 5.
   Deterministic, offline, explains itself ("you missed: …").
2. **LLM grader (Grok, later).** Same interface; returns a judgement plus a
   one-sentence feedback. Falls back to the rubric grader on error.

The learner always sees: their answer, the model answer, accuracy, and the
key points they covered / missed — that is the "more complete answer".

## UI

- One question per screen, a textarea, "Next".
- Result: mean accuracy big, per-question cards with the three things above.
- Trainer: attempts table shows mean accuracy; "Missed" lists key points
  missed (deduped), not question ids.

## Content

All quizzes rewritten as short-answer: 4 sample module checks (5 each) and
the Kube check (8).
