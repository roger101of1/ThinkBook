import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { allSops, learningPath, moduleForSop } from '../lib/content'
import { sopUnlocked } from '../lib/progress'
import { searchSops } from '../lib/search'
import { useProgress } from '../lib/store'
import { ai } from '../lib/ai'

export default function LibraryPage() {
  const progress = useProgress()
  const [query, setQuery] = useState('')
  const [aiAnswer, setAiAnswer] = useState<string | null>(null)
  const sops = useMemo(() => allSops(), [])
  const hits = useMemo(() => searchSops(sops, query), [sops, query])
  const categories = useMemo(() => [...new Set(sops.map((s) => s.category))].sort(), [sops])

  async function ask() {
    const res = await ai.askSops(query, hits.map((h) => h.sop))
    setAiAnswer(res.answer)
  }

  const row = (id: string, title: string, sub: string, snippet?: string) => {
    const read = Boolean(progress.sopsRead[id])
    const locked = !sopUnlocked(learningPath, progress, id)
    const inner = (
      <>
        <div>
          <h3>{title}</h3>
          <div className="sub">{sub}</div>
          {snippet && <div className="snippet">{snippet}</div>}
        </div>
        <span className={`state ${read ? 'read' : ''}`}>{locked ? 'Locked' : read ? '✓ Read' : ''}</span>
      </>
    )
    return locked ? <div className="lib-row locked" key={id}>{inner}</div> : <Link to={`/sop/${id}`} className="lib-row" key={id}>{inner}</Link>
  }

  return (
    <>
      <div className="page-head">
        <h1>Library</h1>
        <p>Every SOP for the {learningPath.role} role — {sops.length} documents. Search by topic, or browse by category.</p>
      </div>

      <div className="search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input
          type="search"
          placeholder="Search — “late checkout”, “fire alarm”, “hold time”…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setAiAnswer(null) }}
        />
        {query && <button className="btn quiet ask" onClick={ask}>Ask AI</button>}
      </div>
      {aiAnswer && <div className="answer">{aiAnswer}</div>}

      {query ? (
        <div className="lib-list">
          {hits.length === 0 && <div className="empty">Nothing matches “{query}”.</div>}
          {hits.map((h) => row(h.sop.id, h.sop.title, `${h.sop.category} · ${h.sop.readMinutes} min`, h.snippet))}
        </div>
      ) : (
        categories.map((cat) => (
          <section className="lib-section" key={cat}>
            <h2>{cat}</h2>
            <div className="lib-list">
              {sops.filter((s) => s.category === cat).map((s) => {
                const m = moduleForSop(s.id)
                return row(s.id, s.title, `${s.readMinutes} min${m ? ` · ${m.title}` : ''}`)
              })}
            </div>
          </section>
        ))
      )}
    </>
  )
}
