import { getQuiz, getSop, learningPath } from '../lib/content'
import { moduleStates, overallPercent, pathComplete } from '../lib/progress'
import { store, useProgress } from '../lib/store'

/**
 * Trainer dashboard.
 *
 * With localStorage persistence this can only show the trainee on *this*
 * device. Once a shared backend exists, this page lists every trainee and
 * drills into each one — the layout below is already per-trainee so that
 * change is additive.
 */
export default function TrainerPage() {
  const progress = useProgress()
  const states = moduleStates(learningPath, progress)
  const pct = overallPercent(learningPath, progress)
  const complete = pathComplete(learningPath, progress)

  const fmt = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <>
      <h1 className="page-title">Trainer dashboard</h1>
      <p className="page-sub">Progress and check results for the {learningPath.role} onboarding path.</p>

      <div className="callout" style={{ marginBottom: 20 }}>
        Preview mode: progress is stored in this browser only, so this shows the trainee using this device.
        Multi-trainee view arrives with the shared data store.
      </div>

      <div className="card stack" style={{ marginBottom: 20 }}>
        <div className="row spread">
          <div>
            <div className="small muted">Trainee</div>
            <div style={{ fontWeight: 600, fontSize: 18 }}>{progress.learnerName || <span className="muted">Unnamed</span>}</div>
            <div className="small muted">Started {fmt(progress.startedAt)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{pct}%</div>
            {complete ? <span className="pill success">✓ Complete — ready for sign-off</span> : <span className="pill accent">In progress</span>}
          </div>
        </div>
        <div className={`bar ${complete ? 'success' : ''}`}><span style={{ width: `${pct}%` }} /></div>
      </div>

      <div className="card" style={{ padding: 0, marginBottom: 20 }}>
        <table className="data">
          <thead>
            <tr>
              <th>Module</th>
              <th>SOPs read</th>
              <th>Check</th>
              <th>Attempts</th>
              <th>Best</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {states.map((s) => (
              <tr key={s.module.id}>
                <td>{s.module.title}</td>
                <td>{s.sopsRead} / {s.sopsTotal}</td>
                <td>{s.module.quiz ? `pass at ${s.passScore}%` : <span className="muted">—</span>}</td>
                <td>{s.attempts.length}</td>
                <td>{s.bestAttempt ? `${s.bestAttempt.scorePercent}%` : <span className="muted">—</span>}</td>
                <td>
                  {s.status === 'completed' && <span className="pill success">Completed</span>}
                  {s.status === 'locked' && <span className="pill">Locked</span>}
                  {s.status === 'not-started' && <span className="pill">Not started</span>}
                  {s.status === 'in-progress' && <span className="pill accent">Reading</span>}
                  {s.status === 'reading-done' && <span className="pill warn">Needs to pass check</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 17, margin: '0 0 10px' }}>Check attempts</h2>
      <div className="card" style={{ padding: 0, marginBottom: 20 }}>
        {progress.attempts.length === 0 ? (
          <div className="empty">No attempts yet.</div>
        ) : (
          <table className="data">
            <thead>
              <tr><th>When</th><th>Check</th><th>Score</th><th>Result</th><th>Missed</th></tr>
            </thead>
            <tbody>
              {[...progress.attempts].reverse().map((a, i) => {
                const quiz = getQuiz(a.quizId)
                const missed = quiz
                  ? Object.entries(a.answers)
                      .map(([qid, chosen]) => quiz.questions.find((q) => q.id === qid && !sameSet(q.answer, chosen)))
                      .filter(Boolean)
                  : []
                return (
                  <tr key={i}>
                    <td>{fmt(a.finishedAt)}</td>
                    <td>{quiz?.title ?? a.quizId}</td>
                    <td>{a.scorePercent}%</td>
                    <td>{a.passed ? <span className="pill success">Pass</span> : <span className="pill danger">Fail</span>}</td>
                    <td className="small muted">
                      {missed.length === 0
                        ? '—'
                        : `${missed.length} missed · ` +
                          [...new Set(missed.map((q) => (q!.sopId ? getSop(q!.sopId)?.title ?? q!.sopId : q!.id)))].join('; ')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <h2 style={{ fontSize: 17, margin: '0 0 10px' }}>SOP reading log</h2>
      <div className="card" style={{ padding: 0, marginBottom: 20 }}>
        {Object.keys(progress.sopsRead).length === 0 ? (
          <div className="empty">Nothing read yet.</div>
        ) : (
          <table className="data">
            <thead><tr><th>SOP</th><th>Marked read</th></tr></thead>
            <tbody>
              {Object.entries(progress.sopsRead)
                .sort((a, b) => a[1].localeCompare(b[1]))
                .map(([id, at]) => (
                  <tr key={id}><td>{getSop(id)?.title ?? id}</td><td>{fmt(at)}</td></tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="row">
        <button
          onClick={() => {
            if (window.confirm('Reset all progress on this device? This cannot be undone.')) store.reset()
          }}
        >
          Reset this trainee's progress
        </button>
      </div>
    </>
  )
}

function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  const sa = [...a].sort((x, y) => x - y)
  const sb = [...b].sort((x, y) => x - y)
  return sa.every((v, i) => v === sb[i])
}
