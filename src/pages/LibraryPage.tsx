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

  return (
    <>
      <h1 className="page-title">SOP Library</h1>
      <p className="page-sub">
        Every SOP for the {learningPath.role} role. {sops.length} documents.{' '}
        <span className="muted">(Real content will be synced from the Operational Directory.)</span>
      </p>

      <div className="card stack" style={{ marginBottom: 24 }}>
        <input
          type="search"
          placeholder="Search SOPs… e.g. “late checkout”, “fire alarm”, “hold time”"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setAiAnswer(null) }}
        />
        {query && (
          <div className="row spread">
            <span className="muted small">{hits.length} result{hits.length === 1 ? '' : 's'}</span>
            <button className="ghost" onClick={ask}>Ask AI ({ai.name})</button>
          </div>
        )}
        {aiAnswer && <div className="callout">{aiAnswer}</div>}
      </div>

      {query ? (
        <div className="stack">
          {hits.length === 0 && <div className="empty">No SOPs match “{query}”.</div>}
          {hits.map((h) => (
            <SopCard key={h.sop.id} id={h.sop.id} title={h.sop.title} category={h.sop.category} minutes={h.sop.readMinutes}
              snippet={h.snippet} read={Boolean(progress.sopsRead[h.sop.id])} locked={!sopUnlocked(learningPath, progress, h.sop.id)} />
          ))}
        </div>
      ) : (
        categories.map((cat) => (
          <section key={cat} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 17, margin: '0 0 10px' }}>{cat}</h2>
            <div className="lib-grid">
              {sops.filter((s) => s.category === cat).map((s) => (
                <SopCard key={s.id} id={s.id} title={s.title} category={s.category} minutes={s.readMinutes}
                  read={Boolean(progress.sopsRead[s.id])} locked={!sopUnlocked(learningPath, progress, s.id)} />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  )
}

function SopCard(p: { id: string; title: string; category: string; minutes: number; snippet?: string; read: boolean; locked: boolean }) {
  const module = moduleForSop(p.id)
  const inner = (
    <>
      <div className="row spread">
        <h3>{p.title}</h3>
        {p.read && <span className="pill success">✓</span>}
        {p.locked && <span className="pill">🔒</span>}
      </div>
      <div className="muted small">{p.minutes} min{module && <> · {module.title}</>}</div>
      {p.snippet && <p className="snippet">{p.snippet}</p>}
    </>
  )
  return p.locked ? (
    <div className="card sop-card" style={{ opacity: 0.6 }}>{inner}</div>
  ) : (
    <Link to={`/sop/${p.id}`} className="card sop-card">{inner}</Link>
  )
}
