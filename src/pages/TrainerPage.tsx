import { getQuiz, getSop, learningPath } from '../lib/content'
import { moduleStates, overallPercent, pathComplete } from '../lib/progress'
import { isCorrect } from '../lib/quiz'
import { store, useProgress } from '../lib/store'

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
          <div>
            <div className="big">{pct}%</div>
            <div className={`state-dot ${complete ? 'pine' : 'brass'} small`} style={{ justifyContent: 'flex-end', display: 'flex' }}>
              {complete ? 'Ready for sign-off' : 'In progress'}
            </div>
          </div>
        </div>
        <div className={`bar ${complete ? 'done' : ''}`}><span style={{ width: `${pct}%` }} /></div>
      </section>

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
                  {s.status === 'completed' && <span className="state-dot pine">Completed</span>}
                  {s.status === 'locked' && <span className="state-dot">Locked</span>}
                  {s.status === 'not-started' && <span className="state-dot">Not started</span>}
                  {s.status === 'in-progress' && <span className="state-dot brass">Reading</span>}
                  {s.status === 'reading-done' && <span className="state-dot brass">Needs to pass check</span>}
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
            <thead><tr><th>When</th><th>Check</th><th>Score</th><th>Result</th><th>Missed</th></tr></thead>
            <tbody>
              {[...progress.attempts].reverse().map((a, i) => {
                const quiz = getQuiz(a.quizId)
                const missed = quiz ? quiz.questions.filter((q) => q.id in a.answers && !isCorrect(q, a.answers[q.id])) : []
                const missedSops = [...new Set(missed.map((q) => (q.sopId ? getSop(q.sopId)?.title ?? q.sopId : q.id)))]
                return (
                  <tr key={i}>
                    <td className="num" style={{ whiteSpace: 'nowrap' }}>{fmt(a.finishedAt)}</td>
                    <td>{quiz?.title.replace(/ Check · /, ' · ') ?? a.quizId}</td>
                    <td className="num">{a.scorePercent}%</td>
                    <td>{a.passed ? <span className="state-dot pine">Pass</span> : <span className="state-dot clay">Fail</span>}</td>
                    <td className="small muted">{missed.length === 0 ? '—' : `${missed.length} · ${missedSops.join('; ')}`}</td>
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
