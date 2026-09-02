/**
 * Quiz mechanics: question selection, grading.
 * Mirrors Trainual's test rules: pass score %, optional shuffle, optional
 * "ask only N questions", unlimited retakes.
 */
import type { Question, Quiz } from '../types'

export function choicesFor(q: Question): string[] {
  return q.type === 'boolean' ? ['True', 'False'] : (q.choices ?? [])
}

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

export function isCorrect(q: Question, chosen: number[] | undefined): boolean {
  if (!chosen || chosen.length === 0) return false
  const a = [...q.answer].sort((x, y) => x - y)
  const c = [...chosen].sort((x, y) => x - y)
  return a.length === c.length && a.every((v, i) => v === c[i])
}

export interface GradeResult {
  correct: number
  total: number
  scorePercent: number
  passed: boolean
  perQuestion: { question: Question; chosen: number[]; correct: boolean }[]
}

export function grade(questions: Question[], answers: Record<string, number[]>, passScore: number): GradeResult {
  const perQuestion = questions.map((question) => {
    const chosen = answers[question.id] ?? []
    return { question, chosen, correct: isCorrect(question, chosen) }
  })
  const correct = perQuestion.filter((p) => p.correct).length
  const total = questions.length
  const scorePercent = total === 0 ? 0 : Math.round((correct / total) * 100)
  return { correct, total, scorePercent, passed: scorePercent >= passScore, perQuestion }
}
