import { getQuiz, getSop, learningPath } from '../lib/content'
import { moduleStates, overallPercent, pathComplete } from '../lib/progress'
import { store, useProgress } from '../lib/store'
import { AttemptBars } from '../components/AttemptBars'
import { TickRow, type Tick } from '../components/TickRow'
import { ProgressRing } from '../components/ProgressRing'
import { learningPath as path } from '../lib/content'

/**
 * Trainer dashboard. Per-trainee layout so the multi-trainee list (once a
 * shared store exists) is an additive change.
 */
export default function TrainerPage() {
  const progress = useProgress()
  const states = moduleStates(learningPath, progress)
  const pct = overallPercent(learningPath, progress)
  const complete = pathComplete(learningPath, progress)
  const fmt = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <>
      <div className="page-head">
        <h1>Trainer</h1>
        <p>Progress and check results for the {learningPath.role} path.</p>
      </div>

      <p className="note" style={{ marginBottom: 20 }}>
        Preview: progress is saved in this browser only, so this shows the trainee using this device. A shared store adds the full trainee list.
      </p>

      <section className="panel pad" style={{ marginBottom: 24 }}>
        <div className="trainee-card">
          <div>
            <div className="eyebrow">Trainee</div>
            <h2>{progress.learnerName || <span className="muted">Unnamed</span>}</h2>
            <div className="small muted">Started {fmt(progress.startedAt)}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
            <ProgressRing percent={pct} done={complete} />
            <div className={`state-dot ${complete ? 'good' : 'active'} small`}>{complete ? 'Ready for sign-off' : 'In progress'}</div>
          </div>
        </div>
      </section>

      <div className="trainer-viz" style={{ marginTop: 0, marginBottom: 24 }}>
        <div className="viz-card">
          <h3>{Object.keys(progress.sopsRead).length} of {path.modules.reduce((n, m) => n + m.sops.length, 0)} SOPs read</h3>
          <div className="sub">One dot per SOP, one square per module check · in path order</div>
          <div className="module-ticks">
            {states.map((s) => {
              const ticks: Tick[] = [
                ...s.module.sops.map<Tick>((id) => ({ state: progress.sopsRead[id] ? 'done' : 'todo', label: getSop(id)?.title ?? id })),
                ...(s.module.quiz ? [{ state: (s.status === 'completed' ? 'quiz-done' : 'quiz-todo') as Tick['state'], label: 'Module check' }] : []),
              ]
              return (
                <div className="row" key={s.module.id}>
                  <span className={`name ${s.status === 'locked' ? 'locked' : ''}`}>{s.module.title.replace(/^Module \d+ · /, '')}</span>
                  <TickRow ticks={ticks} />
                </div>
              )
            })}
          </div>
          <div className="src">Reading log · this device</div>
        </div>
        <div className="viz-card">
          <h3>{progress.attempts.filter((a) => a.passed).length} of {progress.attempts.length} attempts passed</h3>
          <div className="sub">One bar per attempt, height = score · dashed line = pass mark</div>
          <AttemptBars attempts={progress.attempts} passScore={learningPath.defaultPassScore} />
          <div className="src">Check attempts · all modules</div>
        </div>
      </div>

      <div className="panel table-wrap">
        <table className="data">
          <thead>
            <tr><th>Module</th><th>SOPs read</th><th>Attempts</th><th>Best</th><th>Status</th></tr>
          </thead>
          <tbody>
            {states.map((s) => (
              <tr key={s.module.id}>
                <td>{s.module.title}</td>
                <td className="num">{s.sopsRead} / {s.sopsTotal}</td>
                <td className="num">{s.attempts.length || '—'}</td>
                <td className="num">{s.bestAttempt ? `${s.bestAttempt.scorePercent}%` : '—'}{s.module.quiz && <span className="muted small"> / {s.passScore}</span>}</td>
                <td>
                  {s.status === 'completed' && <span className="state-dot good">Completed</span>}
                  {s.status === 'locked' && <span className="state-dot">Locked</span>}
                  {s.status === 'not-started' && <span className="state-dot">Not started</span>}
                  {s.status === 'in-progress' && <span className="state-dot active">Reading</span>}
                  {s.status === 'reading-done' && <span className="state-dot active">Needs to pass check</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="section-title">Check attempts</h2>
      <div className="panel table-wrap">
        {progress.attempts.length === 0 ? (
          <div className="empty">No attempts yet.</div>
        ) : (
          <table className="data">
            <thead><tr><th>When</th><th>Check</th><th>Accuracy</th><th>Result</th><th>Key points missed</th></tr></thead>
            <tbody>
              {[...progress.attempts].reverse().map((a, i) => {
                const quiz = getQuiz(a.quizId)
                const missedPoints = [...new Set(Object.values(a.answers).flatMap((ans) => ans.missed ?? []))]
                const weak = quiz ? quiz.questions.filter((q) => (a.answers[q.id]?.accuracy ?? 0) < 70).length : 0
                return (
                  <tr key={i}>
                    <td className="num" style={{ whiteSpace: 'nowrap' }}>{fmt(a.finishedAt)}</td>
                    <td>{quiz?.title.replace(/ Check · /, ' · ') ?? a.quizId}</td>
                    <td className="num">~{a.scorePercent}%</td>
                    <td>{a.passed ? <span className="state-dot good">Pass</span> : <span className="state-dot bad">Fail</span>}</td>
                    <td className="small muted">{missedPoints.length === 0 ? '—' : `${weak} weak · ${missedPoints.slice(0, 4).join('; ')}${missedPoints.length > 4 ? '…' : ''}`}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <h2 className="section-title">Reading log</h2>
      <div className="panel table-wrap">
        {Object.keys(progress.sopsRead).length === 0 ? (
          <div className="empty">Nothing read yet.</div>
        ) : (
          <table className="data">
            <thead><tr><th>SOP</th><th>Marked read</th></tr></thead>
            <tbody>
              {Object.entries(progress.sopsRead).sort((a, b) => a[1].localeCompare(b[1])).map(([id, at]) => (
                <tr key={id}><td>{getSop(id)?.title ?? id}</td><td className="num">{fmt(at)}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: 28 }}>
        <button className="btn" onClick={() => { if (window.confirm('Reset all progress on this device? This cannot be undone.')) store.reset() }}>
          Reset this trainee's progress
        </button>
      </div>
    </>
  )
}
