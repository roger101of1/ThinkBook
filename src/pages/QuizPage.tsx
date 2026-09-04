import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { AnswerRecord } from '../types'
import { getQuiz, getSop, learningPath } from '../lib/content'
import { moduleStates, passScoreFor } from '../lib/progress'
import { GOOD_THRESHOLD, score, selectQuestions, type GradeResult } from '../lib/quiz'
import { store, useProgress } from '../lib/store'
import { ai } from '../lib/ai'
import { TickRow, type Tick } from '../components/TickRow'
import { useCountUp, useReveal } from '../lib/motion'

export default function QuizPage() {
  const { quizId = '' } = useParams()
  const progress = useProgress()
  const quiz = getQuiz(quizId)
  const [round, setRound] = useState(0)
  const questions = useMemo(() => (quiz ? selectQuestions(quiz) : []), [quiz, round])
  const [i, setI] = useState(0)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString())
  const [result, setResult] = useState<GradeResult | null>(null)
  const [grading, setGrading] = useState(false)

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
  const draft = drafts[q?.id] ?? ''
  const isLast = i === questions.length - 1
  const answered = (id: string) => (drafts[id] ?? '').trim().length > 0

  async function submit() {
    setGrading(true)
    const answers: Record<string, AnswerRecord> = {}
    for (const qq of questions) {
      const text = (drafts[qq.id] ?? '').trim()
      const g = await ai.gradeShortAnswer(qq, text)
      answers[qq.id] = { text, ...g }
    }
    const r = score(questions, answers, passScore)
    setResult(r)
    setGrading(false)
    store.addAttempt({ quizId, startedAt, finishedAt: new Date().toISOString(), scorePercent: r.scorePercent, passed: r.passed, answers })
  }

  function retake() {
    setDrafts({}); setResult(null); setI(0); setStartedAt(new Date().toISOString()); setRound((r) => r + 1)
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
            {result.perQuestion.map(({ question, answer }, n) => {
              const sop = question.sopId ? getSop(question.sopId) : undefined
              const good = answer.accuracy >= GOOD_THRESHOLD
              return (
                <div className="review-item" key={question.id}>
                  <div className={`mark ${good ? 'good' : 'bad'} num`}>{answer.accuracy}</div>
                  <div>
                    <div className="q">{n + 1}. {question.prompt}</div>
                    <div className="ans-block">
                      <div className="ans-label">Your answer</div>
                      <div className={`ans-text ${answer.text ? '' : 'muted'}`}>{answer.text || '—'}</div>
                    </div>
                    <div className="ans-block model">
                      <div className="ans-label">Complete answer</div>
                      <div className="ans-text">{question.modelAnswer}</div>
                    </div>
                    <div className="keypoints">
                      {question.keyPoints.map((kp) => {
                        const hit = answer.covered.includes(kp)
                        return <span key={kp} className={`kp ${hit ? 'hit' : 'miss'}`}>{hit ? '✓' : '✕'} {kp}</span>
                      })}
                    </div>
                    <div className="why">
                      ~{answer.accuracy}% · {answer.feedback}
                      {sop && !good && <> <Link to={`/sop/${sop.id}`}>Re-read {sop.title} →</Link></>}
                    </div>
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
              <span key={qq.id} className={`seg ${k === i ? 'current' : answered(qq.id) ? 'answered' : ''}`} />
            ))}
          </div>
          <span className="num">{i + 1} / {questions.length}</span>
        </div>
        <div className="quiz-body">
          <div className="kind">Answer in your own words</div>
          <div className="prompt">{q.prompt}</div>
          {q.hint && <div className="small muted" style={{ marginTop: -12, marginBottom: 14 }}>{q.hint}</div>}
          <textarea
            className="answer-box"
            value={draft}
            onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
            placeholder="Two or three sentences is plenty. Include the specific names, numbers, or steps that matter."
            rows={5}
            autoFocus
          />
        </div>
        <div className="quiz-nav">
          <button className="btn quiet" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0 || grading}>← Back</button>
          {isLast ? (
            <button className="btn primary" disabled={!answered(q.id) || grading} onClick={submit}>{grading ? 'Grading…' : 'Submit and see my result'}</button>
          ) : (
            <button className="btn primary" disabled={!answered(q.id)} onClick={() => setI((x) => x + 1)}>Next →</button>
          )}
        </div>
      </div>
      <p className="small muted" style={{ textAlign: 'center', marginTop: 14 }}>
        Graded by {ai.name === 'rubric' ? 'key-point rubric' : ai.name} · pass at {passScore}% · unlimited attempts{state && state.attempts.length > 0 && ` · ${state.attempts.length} so far`}
      </p>
    </>
  )
}

function ResultHero({ result, title, passScore, onRetake }: { result: GradeResult; title: string; passScore: number; onRetake: () => void }) {
  const { ref, key, replay } = useReveal<HTMLDivElement>(0.1)
  const shown = useCountUp(result.scorePercent, key || 1)
  const ticks: Tick[] = result.perQuestion.map((p, n) => ({
    state: p.answer.accuracy >= GOOD_THRESHOLD ? 'done' : 'missed',
    label: `Q${n + 1} · ~${p.answer.accuracy}%`,
  }))
  return (
    <div ref={ref} className={`result ${result.passed ? 'pass' : 'fail'}`} onClick={replay}>
      <div className="eyebrow">{title}</div>
      <div className="score num" key={key}>~{shown}%</div>
      <div style={{ margin: '4px 0 12px' }}><TickRow size="lg" ticks={ticks} replayKey={key} /></div>
      <div className="line num">approximate accuracy across {result.perQuestion.length} answers · pass mark {passScore}%</div>
      <h2 className="display" style={{ fontSize: 24, marginTop: 14 }}>{result.passed ? 'Passed. Well done.' : 'Not quite yet.'}</h2>
      {!result.passed && <p className="muted" style={{ maxWidth: '46ch', margin: '6px auto 0' }}>Each dot is one answer. Read the complete answers below, note the key points you missed, and take it again when you're ready.</p>}
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
