/**
 * A row of countable units — one tick per real record (an SOP, a question).
 * Never decorative: every tick maps to something the viewer can name on hover.
 */
import { STAGGER_DOT } from '../lib/motion'

export type TickState = 'done' | 'todo' | 'missed' | 'current' | 'quiz-done' | 'quiz-todo'

export interface Tick {
  state: TickState
  label: string
}

export function TickRow({ ticks, replayKey = 0, size = 'md' }: { ticks: Tick[]; replayKey?: number; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <div className={`tickrow ${size}`} key={replayKey} aria-label={ticks.map((t) => t.label).join(', ')}>
      {ticks.map((t, i) => (
        <span
          key={i}
          className={`tick ${t.state}`}
          style={{ animationDelay: `${i * STAGGER_DOT}ms` }}
          title={t.label}
        />
      ))}
    </div>
  )
}
