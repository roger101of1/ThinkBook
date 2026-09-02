/**
 * Progress persistence.
 *
 * The app talks only to the `ProgressStore` interface. Today the only
 * implementation is localStorage (good enough for 1–2 trainees on one device,
 * and for demos). Swapping in a real backend (Supabase / Google Sheet / API)
 * means adding another implementation here — nothing in the UI changes.
 */
import { useSyncExternalStore } from 'react'
import type { LearnerProgress, QuizAttempt } from '../types'

export interface ProgressStore {
  get(): LearnerProgress
  setLearner(name: string): void
  markSopRead(sopId: string): void
  addAttempt(attempt: QuizAttempt): void
  reset(): void
  subscribe(listener: () => void): () => void
}

const KEY = 'sop-academy:progress:v1'

function emptyProgress(): LearnerProgress {
  return {
    learnerId: 'local',
    learnerName: '',
    startedAt: new Date().toISOString(),
    sopsRead: {},
    attempts: [],
  }
}

function createLocalStore(): ProgressStore {
  let cache: LearnerProgress = load()
  const listeners = new Set<() => void>()

  function load(): LearnerProgress {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) return { ...emptyProgress(), ...(JSON.parse(raw) as LearnerProgress) }
    } catch {
      /* ignore — fall through to empty */
    }
    return emptyProgress()
  }

  function save(next: LearnerProgress) {
    cache = next
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* storage unavailable — keep in memory */
    }
    listeners.forEach((l) => l())
  }

  return {
    get: () => cache,
    setLearner: (name) => save({ ...cache, learnerName: name }),
    markSopRead: (sopId) => {
      if (cache.sopsRead[sopId]) return
      save({ ...cache, sopsRead: { ...cache.sopsRead, [sopId]: new Date().toISOString() } })
    },
    addAttempt: (attempt) => save({ ...cache, attempts: [...cache.attempts, attempt] }),
    reset: () => save(emptyProgress()),
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export const store: ProgressStore = createLocalStore()

/** React hook: re-renders when progress changes. */
export function useProgress(): LearnerProgress {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}
