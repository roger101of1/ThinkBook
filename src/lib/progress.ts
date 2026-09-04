/**
 * Derived progress: module status, locking, and completion percentages.
 * Pure functions over (LearningPath, LearnerProgress) so they are trivially testable.
 */
import type { LearnerProgress, LearningPath, Module, QuizAttempt } from '../types'
import { getQuiz } from './content'

export type ModuleStatus = 'locked' | 'not-started' | 'in-progress' | 'reading-done' | 'completed'

export interface ModuleState {
  module: Module
  index: number
  status: ModuleStatus
  sopsRead: number
  sopsTotal: number
  bestAttempt?: QuizAttempt
  attempts: QuizAttempt[]
  passScore: number
}

export function attemptsFor(progress: LearnerProgress, quizId: string): QuizAttempt[] {
  return progress.attempts.filter((a) => a.quizId === quizId)
}

export function bestAttempt(progress: LearnerProgress, quizId: string): QuizAttempt | undefined {
  return attemptsFor(progress, quizId).reduce<QuizAttempt | undefined>(
    (best, a) => (best === undefined || a.scorePercent > best.scorePercent ? a : best),
    undefined,
  )
}

export function quizPassed(progress: LearnerProgress, quizId: string): boolean {
  return attemptsFor(progress, quizId).some((a) => a.passed)
}

export function passScoreFor(path: LearningPath, quizId: string | undefined): number {
  return (quizId && getQuiz(quizId)?.passScore) || path.defaultPassScore
}

export function moduleComplete(progress: LearnerProgress, m: Module): boolean {
  const allRead = m.sops.every((s) => Boolean(progress.sopsRead[s]))
  if (!allRead) return false
  if (!m.quiz) return true
  return quizPassed(progress, m.quiz)
}

export function moduleStates(path: LearningPath, progress: LearnerProgress): ModuleState[] {
  let previousComplete = true
  return path.modules.map((module, index) => {
    const sopsRead = module.sops.filter((s) => Boolean(progress.sopsRead[s])).length
    const sopsTotal = module.sops.length
    const attempts = module.quiz ? attemptsFor(progress, module.quiz) : []
    const complete = moduleComplete(progress, module)

    let status: ModuleStatus
    if (complete) status = 'completed'
    else if (path.completeInOrder && !previousComplete) status = 'locked'
    else if (sopsRead === 0 && attempts.length === 0) status = 'not-started'
    else if (sopsRead === sopsTotal) status = 'reading-done'
    else status = 'in-progress'

    previousComplete = previousComplete && complete
    return {
      module,
      index,
      status,
      sopsRead,
      sopsTotal,
      attempts,
      bestAttempt: module.quiz ? bestAttempt(progress, module.quiz) : undefined,
      passScore: passScoreFor(path, module.quiz),
    }
  })
}

/** 0–100. Each SOP read and each quiz passed counts as one unit. */
export function overallPercent(path: LearningPath, progress: LearnerProgress): number {
  let total = 0
  let done = 0
  for (const m of path.modules) {
    total += m.sops.length
    done += m.sops.filter((s) => Boolean(progress.sopsRead[s])).length
    if (m.quiz) {
      total += 1
      if (quizPassed(progress, m.quiz)) done += 1
    }
  }
  return total === 0 ? 0 : Math.round((done / total) * 100)
}

export function pathComplete(path: LearningPath, progress: LearnerProgress): boolean {
  return path.modules.every((m) => moduleComplete(progress, m))
}

/**
 * SOPs are always readable — ThinkBook doubles as the reference manual.
 * Locking applies to module *checks* only (see moduleStates → status 'locked').
 */
export function sopUnlocked(_path: LearningPath, _progress: LearnerProgress, _sopId: string): boolean {
  return true
}
