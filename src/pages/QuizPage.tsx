import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Question } from '../types'
import { getQuiz, getSop, learningPath } from '../lib/content'
import { moduleStates, passScoreFor } from '../lib/progress'
import { choicesFor, grade, selectQuestions, type GradeResult } from '../lib/quiz'
import { store, useProgress } from '../lib/store'

export default function QuizPage() {
  const { quizId = '' } = useParams()
  const progress = useProgress()
  const quiz = getQuiz(quizId)
  const [round, setRound] = useState(0) // bump to re-select questions on retake
  const questions = useMemo(() => (quiz ? selectQuestions(quiz) : []), [quiz, round])
  const [answers, setAnswers] = useState<Record<string, number[]>>({})
  const [startedAt] = useState(() => new Date().toISOString())
  const [result, setResult] = useState<GradeResult | null>(null)

  if (!quiz) return <div className="empty">Quiz not found.</div>

  const state = moduleStates(learningPath, progress).find((s) => s.module.quiz === quizId)
  const passScore = passScoreFor(learningPath, quizId)

  if (state?.status === 'locked') {
    return (
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="callout warn">🔒 This check is locked until you complete the previous module.</div>
        <p><Link to="/">← Back to My Training</Link></p>
      </div>
    )
  }

  const unread = state ? state.module.sops.filter((s) => !progress.sopsRead[s]) : []
  const answered = questions.filter((q) => (answers[q.id] ?? []).length > 0).length

  function toggle(q: Question, idx: number) {
    if (result) return
    setAnswers((prev) => {
      const cur = prev[q.id] ?? []
      if (q.type === 'multi') {
        return { ...prev, [q.id]: cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx] }
      }
      return { ...prev, [q.id]: [idx] }
    })
  }

  function submit() {
    const r = grade(questions, answers, passScore)
    setResult(r)
    store.addAttempt({
      quizId,
      startedAt,
      finishedAt: new Date().toISOString(),
      scorePercent: r.scorePercent,
      passed: r.passed,
      answers,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function retake() {
    setAnswers({})
    setResult(null)
    setRound((r) => r + 1)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="reader stack">
      <div className="small muted">
        <Link to="/">My Training</Link>
        {state && <> › {state.module.title}</>}
      </div>

      <div className="card">
        <h1 className="page-title" style={{ fontSize: 22 }}>{quiz.title}</h1>
        <p className="muted small" style={{ margin: 0 }}>
          {questions.length} questions · pass at {passScore}% · unlimited attempts
          {state && state.attempts.length > 0 && <> · {state.attempts.length} previous attempt{state.attempts.length > 1 ? 's' : ''}</>}
        </p>
        {unread.length > 0 && !result && (
          <div className="callout warn" style={{ marginTop: 12 }}>
            You haven't marked all SOPs in this module as read yet:{' '}
            {unread.map((id, i) => (
              <span key={id}>
                {i > 0 && ', '}
                <Link to={`/sop/${id}`}>{getSop(id)?.title ?? id}</Link>
              </span>
            ))}
            . You can still take the check, but the module won't complete until they're read.
          </div>
        )}
      </div>

      {result && (
        <div className={`card result-hero ${result.passed ? 'pass' : 'fail'}`}>
          <div className="muted">{result.passed ? 'Passed' : 'Not yet'}</div>
          <div className="score">{result.scorePercent}%</div>
          <div className="muted">{result.correct} of {result.total} correct · needed {passScore}%</div>
          <div className="row" style={{ justifyContent: 'center', marginTop: 16 }}>
            {result.passed ? (
              <Link to="/"><button className="primary">Back to My Training</button></Link>
            ) : (
              <button className="primary" onClick={retake}>Retake</button>
            )}
            {!result.passed && <Link to="/"><button>Review the SOPs first</button></Link>}
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        {questions.map((q, i) => {
          const chosen = answers[q.id] ?? []
          const outcome = result?.perQuestion.find((p) => p.question.id === q.id)
          return (
            <div className="question" key={q.id}>
              <div className="q">
                {i + 1}. {q.prompt}
                <small>
                  {q.type === 'multi' ? 'Select all that apply' : q.type === 'boolean' ? 'True or false' : 'Select one'}
                </small>
              </div>
              {choicesFor(q).map((c, idx) => {
                const selected = chosen.includes(idx)
                let cls = 'choice'
                if (result) {
                  const isAnswer = q.answer.includes(idx)
                  if (isAnswer) cls += ' correct'
                  else if (selected) cls += ' wrong'
                } else if (selected) cls += ' selected'
                return (
                  <label className={cls} key={idx}>
                    <input
                      type={q.type === 'multi' ? 'checkbox' : 'radio'}
                      name={q.id}
                      checked={selected}
                      disabled={Boolean(result)}
                      onChange={() => toggle(q, idx)}
                    />
                    <span>{c}</span>
                  </label>
                )
              })}
              {outcome && (
                <div className={`explain ${outcome.correct ? 'good' : 'bad'}`}>
                  <strong>{outcome.correct ? 'Correct.' : 'Incorrect.'}</strong>{' '}
                  {q.explanation}
                  {q.sopId && (
                    <>
                      {' '}<Link to={`/sop/${q.sopId}`}>Re-read {getSop(q.sopId)?.title ?? q.sopId} →</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {!result && (
        <div className="card row spread">
          <span className="muted small">{answered} of {questions.length} answered</span>
          <button className="primary" disabled={answered < questions.length} onClick={submit}>
            Submit answers
          </button>
        </div>
      )}
    </div>
  )
}
