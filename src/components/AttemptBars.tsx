/**
 * One capsule bar per check attempt — height ∝ score, hairline at the pass
 * mark. Bars stagger in; each carries its own record on hover.
 * Bars never break the axis: 0–100 is the whole contract.
 */
import type { QuizAttempt } from '../types'
import { STAGGER_BAR, useReveal } from '../lib/motion'

export function AttemptBars({ attempts, passScore, height = 120 }: { attempts: QuizAttempt[]; passScore: number; height?: number }) {
  const { ref, key, shown, replay } = useReveal<HTMLDivElement>()
  const n = attempts.length
  if (n === 0) return <div className="muted small">No attempts yet.</div>

  const w = Math.max(320, n * 56 + 40)
  const padL = 30, padR = 10, padT = 10, padB = 22
  const plotH = height - padT - padB
  const y = (v: number) => padT + plotH * (1 - v / 100)
  const barW = 18
  const gap = (w - padL - padR) / n
  const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  return (
    <div ref={ref} className="attempt-bars" onClick={replay} title="Click to replay">
      <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} style={{ maxWidth: w }} key={key}>
        {/* axis ticks */}
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line x1={padL - 4} x2={w - padR} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth="1" />
            <text x={padL - 8} y={y(v) + 3.5} textAnchor="end" fontSize="9.5" fontWeight="600" fill="var(--secondary)">{v}</text>
          </g>
        ))}
        {/* pass mark hairline */}
        <line x1={padL - 4} x2={w - padR} y1={y(passScore)} y2={y(passScore)} stroke="var(--secondary)" strokeWidth="1" strokeDasharray="3 3" />
        <text x={w - padR} y={y(passScore) - 4} textAnchor="end" fontSize="9" fontWeight="600" fill="var(--secondary)">pass {passScore}</text>

        {attempts.map((a, i) => {
          const cx = padL + gap * i + gap / 2
          const top = y(a.scorePercent)
          const h = Math.max(2, y(0) - top)
          return (
            <g key={a.finishedAt + i} className={shown ? 'bar-in' : ''} style={{ animationDelay: `${i * STAGGER_BAR}ms`, transformOrigin: `${cx}px ${y(0)}px` }}>
              <rect
                x={cx - barW / 2} y={top} width={barW} height={h}
                rx={barW / 2}
                fill={a.passed ? 'var(--accent)' : 'var(--negative)'}
              >
                <title>{`Attempt ${i + 1} · ${a.scorePercent}% · ${a.passed ? 'pass' : 'fail'} · ${fmt(a.finishedAt)}`}</title>
              </rect>
              <text x={cx} y={top - 5} textAnchor="middle" fontSize="10" fontWeight="800" fill="var(--ink)">{a.scorePercent}</text>
              <text x={cx} y={height - 6} textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--secondary)">{i + 1}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
