import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getSop, learningPath } from '../lib/content'
import { moduleStates, overallPercent, pathComplete, type ModuleState } from '../lib/progress'
import { store, useProgress } from '../lib/store'

const STATUS_LABEL: Record<ModuleState['status'], { text: string; cls: string }> = {
  locked: { text: 'Locked', cls: '' },
  'not-started': { text: 'Not started', cls: '' },
  'in-progress': { text: 'In progress', cls: 'accent' },
  'reading-done': { text: 'Ready for check', cls: 'warn' },
  completed: { text: 'Completed', cls: 'success' },
}

export default function HomePage() {
  const progress = useProgress()
  const states = moduleStates(learningPath, progress)
  const pct = overallPercent(learningPath, progress)
  const done = pathComplete(learningPath, progress)
  const current = states.find((s) => s.status !== 'completed' && s.status !== 'locked')

  return (
    <>
      <h1 className="page-title">{learningPath.title}</h1>
      <p className="page-sub">{learningPath.description}</p>

      <div className="grid-2">
        <div className="card" style={{ padding: 0 }}>
          {states.map((s) => (
            <ModuleRow key={s.module.id} state={s} isCurrent={current?.module.id === s.module.id} sopsRead={progress.sopsRead} />
          ))}
        </div>

        <div className="stack">
          <div className="card row" style={{ gap: 20 }}>
            <div className="ring" style={{ ['--pct' as string]: pct }}>
              <span>{pct}%</span>
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{done ? 'Training complete' : 'Overall progress'}</div>
              <div className="muted small">
                {states.filter((s) => s.status === 'completed').length} of {states.length} modules
              </div>
              {done && <span className="pill success" style={{ marginTop: 8 }}>✓ Ready for sign-off</span>}
            </div>
          </div>

          <LearnerCard name={progress.learnerName} />

          {current && (
            <div className="card">
              <div className="small muted" style={{ marginBottom: 6 }}>Up next</div>
              <NextAction state={current} sopsRead={progress.sopsRead} />
            </div>
          )}

          <div className="card small muted">
            Pass score: <strong>{learningPath.defaultPassScore}%</strong> (some modules set their own). Unlimited retakes —
            the goal is that you know the material, not that you get it first try.
          </div>
        </div>
      </div>
    </>
  )
}

function ModuleRow({ state, isCurrent, sopsRead }: { state: ModuleState; isCurrent: boolean; sopsRead: Record<string, string> }) {
  const { module, status, index, bestAttempt, passScore } = state
  const label = STATUS_LABEL[status]
  const locked = status === 'locked'
  const quizDone = status === 'completed'
  return (
    <div className={`module ${status} ${isCurrent ? 'active' : ''}`}>
      <div className="num">{status === 'completed' ? '✓' : index + 1}</div>
      <div>
        <h3>{module.title}</h3>
        <p>{module.description}</p>
        <ul>
          {module.sops.map((id) => {
            const sop = getSop(id)
            const read = Boolean(sopsRead[id])
            return (
              <li key={id}>
                <span className={`check ${read ? 'done' : ''}`}>{read ? '✓' : ''}</span>
                {locked ? (
                  <span className="muted">{sop?.title ?? id}</span>
                ) : (
                  <Link to={`/sop/${id}`}>{sop?.title ?? id}</Link>
                )}
                <span className="muted small">· {sop?.readMinutes ?? '?'} min</span>
              </li>
            )
          })}
          {module.quiz && (
            <li className="quiz">
              <span className={`check ${quizDone ? 'done' : ''}`}>{quizDone ? '✓' : ''}</span>
              {locked ? (
                <span className="muted">Module check</span>
              ) : (
                <Link to={`/quiz/${module.quiz}`}>Module check</Link>
              )}
              <span className="muted small">
                · pass at {passScore}%
                {bestAttempt && ` · best ${bestAttempt.scorePercent}%`}
              </span>
            </li>
          )}
        </ul>
      </div>
      <span className={`pill ${label.cls}`}>{locked ? '🔒 ' : ''}{label.text}</span>
    </div>
  )
}

function NextAction({ state, sopsRead }: { state: ModuleState; sopsRead: Record<string, string> }) {
  const nextSop = state.module.sops.find((id) => !sopsRead[id])
  if (nextSop) {
    const sop = getSop(nextSop)
    return (
      <>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>{sop?.title}</div>
        <Link to={`/sop/${nextSop}`}><button className="primary">Continue reading</button></Link>
      </>
    )
  }
  if (state.module.quiz) {
    return (
      <>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>{state.module.title} · check</div>
        <Link to={`/quiz/${state.module.quiz}`}><button className="primary">Take the module check</button></Link>
      </>
    )
  }
  return null
}

function LearnerCard({ name }: { name: string }) {
  const [editing, setEditing] = useState(!name)
  const [draft, setDraft] = useState(name)
  if (editing) {
    return (
      <form
        className="card stack"
        style={{ gap: 8 }}
        onSubmit={(e) => {
          e.preventDefault()
          store.setLearner(draft.trim())
          setEditing(false)
        }}
      >
        <label className="small muted">Your name (shown on the trainer dashboard)</label>
        <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="e.g. Jamie Lee" autoFocus />
        <button className="primary" type="submit" disabled={!draft.trim()}>Save</button>
      </form>
    )
  }
  return (
    <div className="card row spread">
      <div>
        <div className="small muted">Trainee</div>
        <div style={{ fontWeight: 600 }}>{name}</div>
      </div>
      <button className="ghost" onClick={() => setEditing(true)}>Edit</button>
    </div>
  )
}
