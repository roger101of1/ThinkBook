/**
 * SOP search.
 *
 * v1: plain keyword search over title + body, with a short snippet.
 * Planned: semantic search / Q&A over the SOPs via the `ai.ts` provider,
 * returning an answer with citations back to the SOP section.
 */
import type { Sop } from '../types'

export interface SearchHit {
  sop: Sop
  score: number
  snippet: string
}

function stripMarkdown(md: string): string {
  return md
    .replace(/^---[\s\S]*?---/, '')
    .replace(/[#>*_`|]/g, ' ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

export function searchSops(sops: Sop[], query: string, limit = 10): SearchHit[] {
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1)
  if (terms.length === 0) return []

  const hits: SearchHit[] = []
  for (const sop of sops) {
    const title = sop.title.toLowerCase()
    const text = stripMarkdown(sop.body)
    const lower = text.toLowerCase()
    let score = 0
    let firstIdx = -1
    for (const t of terms) {
      if (title.includes(t)) score += 5
      let idx = lower.indexOf(t)
      while (idx !== -1) {
        score += 1
        if (firstIdx === -1 || idx < firstIdx) firstIdx = idx
        idx = lower.indexOf(t, idx + t.length)
      }
    }
    if (score === 0) continue
    const start = Math.max(0, (firstIdx === -1 ? 0 : firstIdx) - 80)
    const snippet = (start > 0 ? '…' : '') + text.slice(start, start + 220) + (start + 220 < text.length ? '…' : '')
    hits.push({ sop, score, snippet })
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit)
}
