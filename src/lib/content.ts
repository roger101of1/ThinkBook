/**
 * Content loader.
 *
 * Today content is bundled at build time from src/content/. The sync script
 * (scripts/sync-sops — not yet written) will populate the same folder from
 * the Operational Directory (Google Docs), so nothing here changes when real
 * SOPs land: only the files under src/content/ do.
 */
import type { LearningPath, Module, Quiz, Sop } from '../types'
import pathJson from '../content/path.json'

const sopFiles = import.meta.glob('../content/sops/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const quizFiles = import.meta.glob('../content/quizzes/*.json', { import: 'default', eager: true }) as Record<string, Quiz>

/** Minimal front-matter parser: `key: value` lines between `---` fences. */
function parseFrontMatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { meta: {}, body: raw }
  const meta: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    meta[key] = value
  }
  return { meta, body: match[2] }
}

function idFromPath(p: string): string {
  return p.split('/').pop()!.replace(/\.(md|json)$/, '')
}

const sops: Record<string, Sop> = {}
for (const [file, raw] of Object.entries(sopFiles)) {
  const id = idFromPath(file)
  const { meta, body } = parseFrontMatter(raw)
  sops[id] = {
    id,
    title: meta.title ?? id,
    category: meta.category ?? 'Uncategorized',
    readMinutes: Number(meta.readMinutes ?? 5),
    sourceUrl: meta.sourceUrl || undefined,
    lastSynced: meta.lastSynced || undefined,
    body,
  }
}

const quizzes: Record<string, Quiz> = {}
for (const [file, quiz] of Object.entries(quizFiles)) {
  quizzes[idFromPath(file)] = quiz
}

export const learningPath = pathJson as LearningPath

export function getSop(id: string): Sop | undefined {
  return sops[id]
}

export function allSops(): Sop[] {
  return Object.values(sops).sort((a, b) => a.title.localeCompare(b.title))
}

export function getQuiz(id: string): Quiz | undefined {
  return quizzes[id]
}

export function getModule(id: string): Module | undefined {
  return learningPath.modules.find((m) => m.id === id)
}

/** Which module (if any) contains this SOP. */
export function moduleForSop(sopId: string): Module | undefined {
  return learningPath.modules.find((m) => m.sops.includes(sopId))
}

/** Validate that the path references content that actually exists. Logged at startup in dev. */
export function validateContent(): string[] {
  const problems: string[] = []
  for (const m of learningPath.modules) {
    for (const s of m.sops) if (!sops[s]) problems.push(`Module "${m.id}" references missing SOP "${s}"`)
    if (m.quiz && !quizzes[m.quiz]) problems.push(`Module "${m.id}" references missing quiz "${m.quiz}"`)
    if (m.quiz) {
      for (const q of quizzes[m.quiz]?.questions ?? []) {
        if (q.sopId && !sops[q.sopId]) problems.push(`Question "${q.id}" references missing SOP "${q.sopId}"`)
        if (q.type !== 'boolean' && (!q.choices || q.choices.length < 2)) problems.push(`Question "${q.id}" needs at least 2 choices`)
        if (q.answer.length === 0) problems.push(`Question "${q.id}" has no answer`)
      }
    }
  }
  return problems
}
