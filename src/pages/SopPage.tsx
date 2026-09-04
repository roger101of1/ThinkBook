import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getSop, moduleForSop } from '../lib/content'
import { store, useProgress } from '../lib/store'

export default function SopPage() {
  const { sopId = '' } = useParams()
  const progress = useProgress()
  const sop = getSop(sopId)
  const [scrolled, setScrolled] = useState(0)

  useEffect(() => {
    window.scrollTo({ top: 0 })
    const onScroll = () => {
      const h = document.documentElement
      const max = h.scrollHeight - h.clientHeight
      setScrolled(max <= 0 ? 100 : Math.min(100, Math.round((h.scrollTop / max) * 100)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [sopId])

  if (!sop) return <div className="empty">SOP not found.</div>

  const module = moduleForSop(sopId)
  const readAt = progress.sopsRead[sopId]
  const idx = module ? module.sops.indexOf(sopId) : -1
  const nextSopId = module && idx >= 0 ? module.sops[idx + 1] : undefined
  const isLastInModule = Boolean(module && idx === module.sops.length - 1)
  const position = module ? `${idx + 1} of ${module.sops.length}` : ''

  return (
    <>
      <div className="read-progress" style={{ width: `${scrolled}%` }} />

      <header className="doc-head">
        <div className="crumbs">
          <Link to="/">My training</Link>
          {module && <> / {module.title}</>}
        </div>
        <h1>{sop.title}</h1>
        <div className="facts">
          <span>{sop.category}</span>
          <span className="num">{sop.readMinutes} min read</span>
          {position && <span className="num">SOP {position} in this module</span>}
          {sop.sourceUrl && <span><a href={sop.sourceUrl} target="_blank" rel="noreferrer">Source document</a></span>}
        </div>
      </header>

      <article className="doc">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{sop.body}</ReactMarkdown>
      </article>

      <div className="actionbar">
        {readAt ? (
          <>
            <span className="msg"><strong>✓ Read.</strong> {nextSopId ? 'Ready for the next SOP.' : isLastInModule && module?.quiz ? 'That was the last SOP in this module.' : ''}</span>
            {nextSopId && <Link to={`/sop/${nextSopId}`} className="btn primary">Next SOP →</Link>}
            {!nextSopId && isLastInModule && module?.quiz && <Link to={`/quiz/${module.quiz}`} className="btn primary">Take the module check →</Link>}
            {!nextSopId && !(isLastInModule && module?.quiz) && <Link to="/" className="btn primary">Back to my training</Link>}
          </>
        ) : (
          <>
            <span className="msg">When you've read it all, mark it done.</span>
            <button className="btn primary" onClick={() => store.markSopRead(sopId)}>I've read and understood this</button>
          </>
        )}
      </div>
    </>
  )
}
