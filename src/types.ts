/**
 * Core content model — deliberately modeled on Trainual's hierarchy,
 * trimmed to what a single-role (Hospitality Coordinator) program needs.
 *
 *   LearningPath  (one per role; today there is exactly one)
 *     └─ Module   (≈ Trainual "Subject"; e.g. "Week 1 · Guest Arrival")
 *          ├─ Sop (≈ Trainual "Document"; one SOP from the Operational Directory)
 *          └─ Quiz (≈ Trainual "Test"; gate at the end of the module)
 */

export interface LearningPath {
  id: string
  role: string
  title: string
  description: string
  /** Percentage (0-100) needed to pass any quiz unless the quiz overrides it. */
  defaultPassScore: number
  /** When true, a module is locked until the previous module's quiz is passed. */
  completeInOrder: boolean
  modules: Module[]
}

export interface Module {
  id: string
  title: string
  description: string
  /** Ordered list of SOP ids (see content/sops/<id>.md). */
  sops: string[]
  /** Quiz id (see content/quizzes/<id>.json). Optional — a module can be reading-only. */
  quiz?: string
}

export interface Sop {
  id: string
  title: string
  /** Free-form category, e.g. "Guest Services". Mirrors the Operational Directory folder. */
  category: string
  /** Rough reading time in minutes, shown to the learner. */
  readMinutes: number
  /** Link back to the source of truth (Google Doc). Blank in sample content. */
  sourceUrl?: string
  /** ISO date the source doc was last synced. Used later to flag "needs re-read". */
  lastSynced?: string
  /** Markdown body. */
  body: string
}

export type QuestionType = 'single' | 'multi' | 'boolean'

export interface Question {
  id: string
  type: QuestionType
  prompt: string
  /** For 'boolean' the choices are implicitly ["True", "False"]. */
  choices?: string[]
  /** Index(es) into choices. For 'boolean': [0] = True, [1] = False. */
  answer: number[]
  /** Shown after answering; ideally cites the SOP section. */
  explanation?: string
  /** SOP id this question is drawn from — lets a wrong answer link back to the reading. */
  sopId?: string
}

export interface Quiz {
  id: string
  title: string
  /** Overrides LearningPath.defaultPassScore when set. */
  passScore?: number
  shuffle?: boolean
  /** Ask only N of the questions (random subset) when set. */
  questionCount?: number
  questions: Question[]
}

/* ---------- Learner progress (persisted; see lib/store.ts) ---------- */

export interface QuizAttempt {
  quizId: string
  startedAt: string
  finishedAt: string
  scorePercent: number
  passed: boolean
  /** questionId -> chosen indexes */
  answers: Record<string, number[]>
}

export interface LearnerProgress {
  learnerId: string
  learnerName: string
  startedAt: string
  /** sopId -> ISO timestamp when marked read */
  sopsRead: Record<string, string>
  attempts: QuizAttempt[]
}
