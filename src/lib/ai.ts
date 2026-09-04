/**
 * AI provider boundary.
 *
 * Three uses, all behind one interface so the vendor (Grok / xAI is the
 * requested one) can be swapped or mocked:
 *
 *   1. `gradeShortAnswer` — online: judge a learner's free-text answer
 *      against the model answer + key points; return an approximate
 *      accuracy and short feedback. Ships today with the local rubric
 *      grader; the LLM version keeps the same output shape.
 *   2. `generateQuestions` — offline, at content-sync time: draft
 *      short-answer questions (prompt, model answer, key points) from an
 *      SOP for a trainer to review.
 *   3. `askSops` — online: answer a learner's question from the SOP text,
 *      with citations.
 *
 * The browser build never holds an API key: LLM calls go through a small
 * server/edge function once hosting is decided.
 */
import type { Question, Sop } from '../types'
import { gradeLocally, type GradeOutcome } from './grader'

export interface AiProvider {
  name: string
  gradeShortAnswer(question: Question, answer: string): Promise<GradeOutcome>
  generateQuestions(sop: Sop, count: number): Promise<Question[]>
  askSops(question: string, context: Sop[]): Promise<{ answer: string; citations: string[] }>
}

export const rubricProvider: AiProvider = {
  name: 'rubric',
  async gradeShortAnswer(q, a) {
    return gradeLocally(q, a)
  },
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

export const ai: AiProvider = rubricProvider
