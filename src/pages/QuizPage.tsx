import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Question } from '../types'
import { getQuiz, getSop, learningPath } from '../lib/content'
import { moduleStates, passScoreFor } from '../lib/progress'
import { choicesFor, grade, selectQuestions, type GradeResult } from '../lib/quiz'
import { store, useProgress } from '../lib/store'
import { TickRow, type Tick } from '../components/TickRow'
import { useCountUp, useReveal } from '../lib/motion'

const KIND: Record<Question['type'], string> = { single: 'Choose one', multi: 'Choose all that apply', boolean: 'True or false' }

export default function QuizPage() {
  const { quizId = '' } = useParams()
  const progress = useProgress()
  const quiz = getQuiz(quizId)
  const [round, setRound] = useState(0)
  const questions = useMemo(() => (quiz ? selectQuestions(quiz) : []), [quiz, round])
  const [i, setI] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number[]>>({})
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString())
  const [result, setResult] = useState<GradeResult | null>(null)

  useEffect(() => { window.scrollTo({ top: 0 }) }, [i, result])

  if (!quiz) return <div className="empty">Check not found.</div>

  const state = moduleStates(learningPath, progress).find((s) => s.module.quiz === quizId)
  const passScore = passScoreFor(learningPath, quizId)

  if (state?.status === 'locked') {
    return (
      <div className="panel pad">
        <div className="eyebrow">Locked</div>
        <h1 className="display" style={{ fontSize: 24, margin: '8px 0' }}>{quiz.title}</h1>
        <p className="muted">Finish the previous module first.</p>
        <Link to="/" className="btn">← My training</Link>
      </div>
    )
  }

  const unread = state ? state.module.sops.filter((s) => !progress.sopsRead[s]) : []
  const q = questions[i]
  const chosen = answers[q?.id] ?? []
  const isLast = i === questions.length - 1

  function toggle(idx: number) {
    setAnswers((prev) => {
      const cur = prev[q.id] ?? []
      if (q.type === 'multi') return { ...prev, [q.id]: cur.includes(idx) ? cur.filter((x) => x !== idx) : [...cur, idx] }
      return { ...prev, [q.id]: [idx] }
    })
  }

  function submit() {
    const r = grade(questions, answers, passScore)
    setResult(r)
    store.addAttempt({ quizId, startedAt, finishedAt: new Date().toISOString(), scorePercent: r.scorePercent, passed: r.passed, answers })
  }

  function retake() {
    setAnswers({}); setResult(null); setI(0); setStartedAt(new Date().toISOString()); setRound((r) => r + 1)
  }

  const crumbs = (
    <div className="crumbs small muted" style={{ marginBottom: 14 }}>
      <Link to="/">My training</Link>{state && <> / {state.module.title}</>}
    </div>
  )

  if (result) {
    return (
      <>
        {crumbs}
        <div className="quiz-frame">
          <ResultHero result={result} title={quiz.title} passScore={passScore} onRetake={retake} />
            <div className="review">
            {result.perQuestion.map(({ question, chosen, correct }, n) => {
              const cs = choicesFor(question)
              const sop = question.sopId ? getSop(question.sopId) : undefined
              return (
                <div className="review-item" key={question.id}>
                  <div className={`mark ${correct ? 'good' : 'bad'}`}>{correct ? '✓' : '✕'}</div>
                  <div>
                    <div className="q">{n + 1}. {question.prompt}</div>
                    {!correct && <div className="ans you">Your answer: {chosen.length ? chosen.map((c) => cs[c]).join(', ') : '—'}</div>}
                    <div className="ans right">{correct ? 'Correct: ' : 'Answer: '}{question.answer.map((c) => cs[c]).join(', ')}</div>
                    {(question.explanation || sop) && (
                      <div className="why">
                        {question.explanation}
                        {sop && <> <Link to={`/sop/${sop.id}`}>Re-read {sop.title} →</Link></>}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {crumbs}
      {unread.length > 0 && (
        <p className="note" style={{ marginBottom: 16 }}>
          Heads up: you haven't marked {unread.map((id, k) => <span key={id}>{k > 0 && ', '}<Link to={`/sop/${id}`}>{getSop(id)?.title ?? id}</Link></span>)} as read. You can still take the check, but the module completes only once they're read.
        </p>
      )}
      <div className="quiz-frame">
        <div className="quiz-top">
          <span>{quiz.title}</span>
          <div className="segs" aria-hidden="true">
            {questions.map((qq, k) => (
              <span key={qq.id} className={`seg ${k === i ? 'current' : (answers[qq.id] ?? []).length ? 'answered' : ''}`} />
            ))}
          </div>
          <span className="num">{i + 1} / {questions.length}</span>
        </div>
        <div className="quiz-body">
          <div className="kind">{KIND[q.type]}</div>
          <div className="prompt">{q.prompt}</div>
          {choicesFor(q).map((c, idx) => (
            <label className={`choice ${chosen.includes(idx) ? 'selected' : ''}`} key={idx}>
              <input type={q.type === 'multi' ? 'checkbox' : 'radio'} name={q.id} checked={chosen.includes(idx)} onChange={() => toggle(idx)} />
              <span>{c}</span>
            </label>
          ))}
        </div>
        <div className="quiz-nav">
          <button className="btn quiet" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>← Back</button>
          {isLast ? (
            <button className="btn primary" disabled={chosen.length === 0} onClick={submit}>See my result</button>
          ) : (
            <button className="btn primary" disabled={chosen.length === 0} onClick={() => setI((x) => x + 1)}>Next →</button>
          )}
        </div>
      </div>
      <p className="small muted" style={{ textAlign: 'center', marginTop: 14 }}>
        Pass at {passScore}% · unlimited attempts{state && state.attempts.length > 0 && ` · ${state.attempts.length} so far`}
      </p>
    </>
  )
}

function ResultHero({ result, title, passScore, onRetake }: { result: GradeResult; title: string; passScore: number; onRetake: () => void }) {
  const { ref, key, replay } = useReveal<HTMLDivElement>(0.1)
  const shown = useCountUp(result.scorePercent, key || 1)
  const ticks: Tick[] = result.perQuestion.map((p, n) => ({ state: p.correct ? 'done' : 'missed', label: `Q${n + 1} · ${p.correct ? 'correct' : 'missed'}` }))
  return (
    <div ref={ref} className={`result ${result.passed ? 'pass' : 'fail'}`} onClick={replay}>
      <div className="eyebrow">{title}</div>
      <div className="score num" key={key}>{shown}%</div>
      <div style={{ margin: '4px 0 12px' }}><TickRow size="lg" ticks={ticks} replayKey={key} /></div>
      <div className="line num">{result.correct} of {result.total} correct · pass mark {passScore}%</div>
      <h2 className="display" style={{ fontSize: 24, marginTop: 14 }}>{result.passed ? 'Passed. Well done.' : 'Not quite yet.'}</h2>
      {!result.passed && <p className="muted" style={{ maxWidth: '44ch', margin: '6px auto 0' }}>Each dot is one question — go through the ones marked red below, re-read those SOPs, and take it again when you're ready.</p>}
      <div className="actions" onClick={(e) => e.stopPropagation()}>
        {result.passed ? (
          <Link to="/" className="btn primary lg">Back to my training →</Link>
        ) : (
          <>
            <button className="btn primary lg" onClick={onRetake}>Retake the check</button>
            <Link to="/" className="btn lg">Review the SOPs</Link>
          </>
        )}
      </div>
    </div>
  )
}
