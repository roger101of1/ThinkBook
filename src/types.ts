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

export interface Question {
  id: string
  prompt: string
  /** The complete answer the learner sees afterwards. */
  modelAnswer: string
  /** Rubric: the facts a good answer must contain. Accuracy = share covered. */
  keyPoints: string[]
  /** SOP id this question is drawn from — lets a weak answer link back to the reading. */
  sopId?: string
  /** Optional nudge shown under the prompt. */
  hint?: string
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

export interface AnswerRecord {
  text: string
  /** 0–100, from the grader. */
  accuracy: number
  covered: string[]
  missed: string[]
  feedback?: string
}

export interface QuizAttempt {
  quizId: string
  startedAt: string
  finishedAt: string
  /** Mean accuracy across questions, 0–100. */
  scorePercent: number
  passed: boolean
  /** questionId -> graded answer */
  answers: Record<string, AnswerRecord>
}

export interface LearnerProgress {
  learnerId: string
  learnerName: string
  startedAt: string
  /** sopId -> ISO timestamp when marked read */
  sopsRead: Record<string, string>
  attempts: QuizAttempt[]
}
