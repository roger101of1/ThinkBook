/**
 * Quiz mechanics: question selection and scoring of graded answers.
 * Pass score %, optional shuffle, optional "ask only N", unlimited retakes.
 */
import type { AnswerRecord, Question, Quiz } from '../types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Pick the questions for one attempt, honoring shuffle / questionCount. */
export function selectQuestions(quiz: Quiz): Question[] {
  let qs = quiz.shuffle ? shuffle(quiz.questions) : [...quiz.questions]
  if (quiz.questionCount && quiz.questionCount < qs.length) qs = qs.slice(0, quiz.questionCount)
  return qs
}

export interface GradeResult {
  scorePercent: number
  passed: boolean
  perQuestion: { question: Question; answer: AnswerRecord }[]
}

/** Combine per-question grader outcomes into an attempt score. */
export function score(questions: Question[], answers: Record<string, AnswerRecord>, passScore: number): GradeResult {
  const perQuestion = questions.map((question) => ({
    question,
    answer: answers[question.id] ?? { text: '', accuracy: 0, covered: [], missed: question.keyPoints },
  }))
  const mean = perQuestion.length === 0 ? 0 : perQuestion.reduce((s, p) => s + p.answer.accuracy, 0) / perQuestion.length
  const scorePercent = Math.round(mean)
  return { scorePercent, passed: scorePercent >= passScore, perQuestion }
}

/** Treat an answer as "good" for tick-row colouring. */
export const GOOD_THRESHOLD = 70
