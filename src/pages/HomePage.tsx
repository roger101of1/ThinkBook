import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getSop, learningPath } from '../lib/content'
import { moduleStates, overallPercent, pathComplete, type ModuleState } from '../lib/progress'
import { store, useProgress } from '../lib/store'
import { ProgressRing } from '../components/ProgressRing'
import { TickRow, type Tick } from '../components/TickRow'
import { STAGGER_BAR, STAGGER_DOT } from '../lib/motion'

export default function HomePage() {
  const progress = useProgress()
  const states = moduleStates(learningPath, progress)
  const pct = overallPercent(learningPath, progress)
  const done = pathComplete(learningPath, progress)
  const current = states.find((s) => s.status !== 'completed' && s.status !== 'locked')
  const completedCount = states.filter((s) => s.status === 'completed').length

  return (
    <>
      <section className="hero home-hero">
        <div>
          <div className="eyebrow">{done ? 'All modules complete' : current ? `Up next · ${current.module.title.replace(/^Module \d+ · /, '')}` : 'Your training'}</div>
          {done ? (
            <>
              <h2>You're ready for sign-off.</h2>
              <p className="sub">Every SOP read and every module check passed. Your trainer can see the results on their dashboard.</p>
              <Link to="/library" className="btn">Browse the SOP library</Link>
            </>
          ) : current ? (
            <NextAction state={current} sopsRead={progress.sopsRead} />
          ) : null}
          <NameField name={progress.learnerName} />
        </div>
        <div className="meter">
          <ProgressRing percent={pct} done={done} />
          <div className="small muted num" style={{ marginTop: 20 }}>{completedCount} of {states.length} modules</div>
          <TickRow size="sm" ticks={states.map<Tick>((s) => ({ state: s.status === 'completed' ? 'done' : current?.module.id === s.module.id ? 'current' : 'todo', label: s.module.title }))} />
        </div>
      </section>

      <div className="page-head">
        <h1 className="display" style={{ fontSize: 26 }}>{learningPath.title}</h1>
        <p>{learningPath.description}</p>
      </div>

      <ol className="stepper">
        {states.map((s) => (
          <ModuleStep key={s.module.id} state={s} isCurrent={current?.module.id === s.module.id} sopsRead={progress.sopsRead} />
        ))}
      </ol>

      <p className="note" style={{ marginTop: 8 }}>
        Pass mark is {learningPath.defaultPassScore}% (the safety module asks for more). You can retake a check as often as you like — the point is to know the material.
      </p>
    </>
  )
}

function NextAction({ state, sopsRead }: { state: ModuleState; sopsRead: Record<string, string> }) {
  const nextSop = state.module.sops.find((id) => !sopsRead[id])
  if (nextSop) {
    const sop = getSop(nextSop)
    const started = state.sopsRead > 0
    return (
      <>
        <h2>{sop?.title}</h2>
        <p className="sub">{sop?.readMinutes} min read · {state.sopsRead} of {state.sopsTotal} SOPs in this module done</p>
        <Link to={`/sop/${nextSop}`} className="btn primary lg">{started ? 'Continue reading' : 'Start reading'} →</Link>
      </>
    )
  }
  if (state.module.quiz) {
    return (
      <>
        <h2>Module check</h2>
        <p className="sub">
          All SOPs in this module are read. Pass at {state.passScore}% to unlock the next module.
          {state.bestAttempt && ` Your best so far: ${state.bestAttempt.scorePercent}%.`}
        </p>
        <Link to={`/quiz/${state.module.quiz}`} className="btn primary lg">{state.attempts.length ? 'Retake the check' : 'Take the check'} →</Link>
      </>
    )
  }
  return null
}

function ModuleStep({ state, isCurrent, sopsRead }: { state: ModuleState; isCurrent: boolean; sopsRead: Record<string, string> }) {
  const { module, status, index, bestAttempt, passScore } = state
  const locked = status === 'locked'
  const cls = `step ${status} ${isCurrent ? 'current' : ''}`
  const statusText =
    status === 'completed' ? 'Completed'
    : status === 'locked' ? 'Locked'
    : status === 'reading-done' ? 'Ready for check'
    : status === 'in-progress' ? 'In progress'
    : isCurrent ? 'Up next' : 'Not started'

  return (
    <li className={cls} style={{ ['--i' as string]: index }}>
      <div className="node" style={{ animationDelay: `${index * STAGGER_BAR}ms` }}>{status === 'completed' ? '✓' : index + 1}</div>
      <div className="body">
        <div className="title-row">
          <h3>{module.title}</h3>
          <span className="status">{statusText}</span>
        </div>
        <p>{module.description}</p>
        <ul>
          {module.sops.map((id, k) => {
            const sop = getSop(id)
            const read = Boolean(sopsRead[id])
            return (
              <li key={id}>
                <span className={`dot ${read ? 'done' : ''}`} style={{ animationDelay: `${index * STAGGER_BAR + k * STAGGER_DOT * 3}ms` }} />
                {locked ? <span className="muted">{sop?.title ?? id}</span> : <Link to={`/sop/${id}`}>{sop?.title ?? id}</Link>}
                <span className="meta num">{sop?.readMinutes ?? '–'} min</span>
              </li>
            )
          })}
          {module.quiz && (
            <li>
              <span className={`dot quiz ${status === 'completed' ? 'done' : ''}`} style={{ animationDelay: `${index * STAGGER_BAR + module.sops.length * STAGGER_DOT * 3}ms` }} />
              {locked ? <span className="muted">Module check</span> : <Link to={`/quiz/${module.quiz}`}>Module check</Link>}
              <span className="meta num">
                {bestAttempt ? `best ${bestAttempt.scorePercent}%` : `pass at ${passScore}%`}
              </span>
            </li>
          )}
        </ul>
      </div>
    </li>
  )
}

function NameField({ name }: { name: string }) {
  const [draft, setDraft] = useState('')
  if (name) return <p className="small muted" style={{ marginTop: 18, marginBottom: 0 }}>Signed in as <strong style={{ color: 'var(--ink)' }}>{name}</strong> · <button className="btn quiet small" style={{ padding: '0 4px' }} onClick={() => store.setLearner('')}>change</button></p>
  return (
    <form
      className="name-inline"
      onSubmit={(e) => {
        e.preventDefault()
        if (draft.trim()) store.setLearner(draft.trim())
      }}
    >
      <input type="text" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Your name, so your trainer knows it's you" />
      <button className="btn" type="submit" disabled={!draft.trim()}>Save</button>
    </form>
  )
}
