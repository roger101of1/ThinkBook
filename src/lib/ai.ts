/**
 * AI provider boundary.
 *
 * Two planned uses, both behind this one interface so the model vendor
 * (Grok / xAI is the requested one) can be swapped or mocked:
 *
 *   1. `generateQuestions` — offline, at content-sync time: draft quiz
 *      questions from an SOP for a trainer to review before publishing.
 *      (Mirrors Trainual's "Auto-generate tests": ~10 MCQs, human-reviewed.)
 *   2. `askSops` — online: answer a learner's question using only the SOP
 *      text, with citations.
 *
 * Nothing in the UI calls a vendor SDK directly. The browser build never
 * holds an API key: `askSops` will go through a small server/edge function
 * once hosting is decided. Until then `stubProvider` is wired in.
 */
import type { Question, Sop } from '../types'

export interface AiProvider {
  name: string
  generateQuestions(sop: Sop, count: number): Promise<Question[]>
  askSops(question: string, context: Sop[]): Promise<{ answer: string; citations: string[] }>
}

export const stubProvider: AiProvider = {
  name: 'stub',
  async generateQuestions() {
    throw new Error('AI question generation is not configured yet. See docs/plans/ for the Grok integration plan.')
  },
  async askSops(question, context) {
    return {
      answer:
        `AI answers are not configured yet. Your question was: “${question}”. ` +
        `The keyword search results above are drawn from ${context.length} SOP(s).`,
      citations: [],
    }
  },
}

export const ai: AiProvider = stubProvider
