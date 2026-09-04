/**
 * Rubric grader — deterministic, offline, explains itself.
 *
 * A key point is "covered" when enough of its key terms appear in the
 * learner's answer. Key terms are: numbers ($875, 4.00%, 6, 12), quoted
 * names ("Include Archived"), and content words after stop-word removal,
 * lightly stemmed. Accuracy = covered / total key points, rounded to 5.
 *
 * This is the fallback behind `AiProvider.gradeShortAnswer`. The LLM grader
 * (Grok) will replace the judgement but keep the same output shape.
 */
import type { Question } from '../types'

export interface GradeOutcome {
  accuracy: number
  covered: string[]
  missed: string[]
  feedback: string
}

const STOP = new Set(
  `a an the and or of to in on at for with by from as is are be was were it its this that these those you your they them their
   if then than so not no yes do does did done can will should must may need needs needed any all each every one ones per
   click clicks clicked button box tab page field select enter type use using when where which what who how into onto up down
   out off over under again also only just very more most less least new still through via`.split(/\s+/),
)

const SYN: Record<string, string[]> = {
  on: ['enabled', 'enable', 'turned on', 'switch on', 'activate'],
  off: ['disabled', 'disable', 'turned off'],
  cannot: ["can't", 'cant', 'can not', 'not able', 'unable', 'no way', 'impossible', 'never'],
  disabled: ['turn off', 'turned off', 'switch off', 'undo', 'undone', 'remove', 'reverse', 'change back', 'uncheck'],
  amendment: ['amend', 'amending'],
  automatic: ['auto', 'automatically', 'autopay', 'auto-pay', 'auto pay'],
  attempt: ['try', 'tried', 'tries', 'attempted', 'charged', 'charge', 'taken'],
  'auto-pay': ['autopay', 'auto pay', 'automatic payment', 'auto payment'],
  'auto-save': ['auto save', 'autosave', 'saves automatically', 'automatically save', 'automatically saves', 'save automatically', 'saved automatically'],
  enabled: ['on', 'turned on', 'enable', 'active', 'set up'],
  method: ['card', 'credit card', 'ach', 'bank'],
  following: ['next', 'later', 'subsequent', 'other', 'rest', 'remaining'],
  progress: ['not ready', 'not finished', 'unfinished', 'pending', 'incomplete', 'not done', 'in progress'],
  ready: ['finished', 'done', 'complete', 'live'],
  apologize: ['sorry', 'apologise', 'apology', 'apologies'],
  empathize: ['empathise', 'empathy', 'understand', 'understanding'],
  resolve: ['fix', 'solve', 'solution', 'sort', 'sorted'],
  notify: ['log', 'tell', 'inform', 'report', 'escalate'],
  listen: ['hear', 'let them talk', 'let them finish'],
  proration: ['prorate', 'prorated', 'pro-rate', 'pro-rated', 'pro rata', 'partial'],
  activate: ['start', 'kick in', 'begin', 'active'],
  terminate: ['end', 'cancel', 'close'],
  archived: ['archive'],
  tick: ['check', 'select', 'enable'],
  manual: ['manually', 'by hand', 'hand-signed', 'hand signed'],
  'e-signature': ['esignature', 'ysign', 'e-sign', 'esign', 'electronic signature'],
  seattle: ['seattle property'],
  immediately: ['right away', 'at once', 'straight away', 'asap'],
  '911': ['emergency services', 'call 911'],
  duty: ['manager'],
}

function stem(w: string): string {
  return w
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/(ies)$/, 'y')
    .replace(/(ing|ed|es|s)$/, '')
}

function normalise(text: string): string {
  return ' ' + text.toLowerCase().replace(/[“”"']/g, ' ').replace(/[^\w$%.\-/ ]+/g, ' ').replace(/\s+/g, ' ') + ' '
}

/** Extract the terms that matter from a key point. */
export function keyTerms(point: string): string[] {
  const terms = new Set<string>()
  // numbers & money & percents, e.g. $875, 4.00%, 6, 12, 05/2025, 1:00 PM
  for (const m of point.match(/\$?\d[\d.,:/]*%?/g) ?? []) terms.add(m.toLowerCase().replace(/[.,]$/, ''))
  // quoted phrases
  for (const m of point.match(/["“]([^"”]+)["”]/g) ?? []) terms.add(m.replace(/["“”]/g, '').toLowerCase())
  // content words
  for (const w of point.replace(/["“”]/g, ' ').split(/[^\w$%'-]+/)) {
    const lw = w.toLowerCase()
    if (!lw || STOP.has(lw) || /^\d/.test(lw) || lw.length < 3) continue
    terms.add(lw)
  }
  return [...terms]
}

function termPresent(term: string, text: string): boolean {
  const t = term.toLowerCase()
  if (text.includes(' ' + t + ' ') || text.includes(t)) return true
  // numeric: accept 875 for $875.00, 4% for 4.00%
  const num = t.replace(/[$%,]/g, '').replace(/\.0+$/, '')
  if (/^\d/.test(num) && new RegExp(`(^|[^\\d])\\$?${num.replace('.', '\\.')}(\\.0+)?%?([^\\d]|$)`).test(text)) return true
  // stemmed word match
  const st = stem(t)
  if (st.length >= 3) {
    const words = text.split(' ')
    if (words.some((w) => stem(w) === st || (w.length > 4 && st.length > 4 && (w.startsWith(st) || st.startsWith(stem(w)))))) return true
  }
  for (const s of SYN[t] ?? []) if (text.includes(s)) return true
  return false
}

export function pointCovered(point: string, text: string): boolean {
  const terms = keyTerms(point)
  if (terms.length === 0) return false
  const hits = terms.filter((t) => termPresent(t, text)).length
  // numbers/quoted names are decisive; otherwise need most of the content words
  const decisive = terms.filter((t) => /^\$?\d/.test(t) || t.includes(' ') || t.includes('-'))
  if (decisive.length > 0 && decisive.every((t) => termPresent(t, text))) return true
  return hits / terms.length >= 0.5
}

export function gradeLocally(q: Question, answer: string): GradeOutcome {
  const text = normalise(answer)
  const covered: string[] = []
  const missed: string[] = []
  for (const p of q.keyPoints) (pointCovered(p, text) ? covered : missed).push(p)
  const raw = q.keyPoints.length === 0 ? 0 : (covered.length / q.keyPoints.length) * 100
  const accuracy = answer.trim().length < 3 ? 0 : Math.round(raw / 5) * 5
  const feedback =
    accuracy >= 90 ? 'Covers everything that matters.'
    : accuracy >= 60 ? `Mostly there — you left out: ${missed.join('; ')}.`
    : accuracy > 0 ? `Partly right. Missing: ${missed.join('; ')}.`
    : "This doesn't cover the key points — read the complete answer below."
  return { accuracy, covered, missed, feedback }
}
