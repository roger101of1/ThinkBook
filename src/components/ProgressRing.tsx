/**
 * Draw-in ring + counter for a single 0–100 value. Plays when scrolled into
 * view, replays on click.
 */
import { useCountUp, useReveal } from '../lib/motion'

export function ProgressRing({ percent, label, done }: { percent: number; label?: string; done?: boolean }) {
  const { ref, key, replay } = useReveal<HTMLButtonElement>()
  const shown = useCountUp(percent, key)
  const r = 46
  const c = 2 * Math.PI * r
  return (
    <button ref={ref} className={`ring-btn ${done ? 'done' : ''}`} onClick={replay} title="Click to replay" type="button">
      <svg viewBox="0 0 108 108" width="108" height="108" aria-hidden="true">
        <circle cx="54" cy="54" r={r} fill="none" stroke="var(--line)" strokeWidth="7" />
        <circle
          cx="54" cy="54" r={r} fill="none"
          stroke={done ? 'var(--good)' : 'var(--accent)'}
          strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown / 100)}
          transform="rotate(-90 54 54)"
        />
      </svg>
      <span className="ring-value num">{shown}%</span>
      {label && <span className="ring-label">{label}</span>}
    </button>
  )
}
