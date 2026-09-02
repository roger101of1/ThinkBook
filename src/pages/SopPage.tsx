import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getSop, learningPath, moduleForSop } from '../lib/content'
import { sopUnlocked } from '../lib/progress'
import { store, useProgress } from '../lib/store'

export default function SopPage() {
  const { sopId = '' } = useParams()
  const progress = useProgress()
  const sop = getSop(sopId)
  if (!sop) return <div className="empty">SOP not found.</div>

  if (!sopUnlocked(learningPath, progress, sopId)) {
    return (
      <div className="card" style={{ maxWidth: 560 }}>
        <div className="callout warn">🔒 This SOP is locked until you complete the previous module.</div>
        <p><Link to="/">← Back to My Training</Link></p>
      </div>
    )
  }

  const module = moduleForSop(sopId)
  const readAt = progress.sopsRead[sopId]
  const idx = module ? module.sops.indexOf(sopId) : -1
  const nextSopId = module && idx >= 0 ? module.sops[idx + 1] : undefined
  const isLastInModule = module && idx === module.sops.length - 1

  return (
    <div className="reader stack">
      <div className="row spread">
        <div className="small muted">
          <Link to="/">My Training</Link>
          {module && <> › {module.title}</>}
        </div>
        <div className="row">
          <span className="pill">{sop.category}</span>
          <span className="pill">{sop.readMinutes} min read</span>
          {readAt && <span className="pill success">✓ Read</span>}
        </div>
      </div>

      <article className="card doc">
        <h1>{sop.title}</h1>
        {sop.sourceUrl && (
          <p className="small muted">
            Source: <a href={sop.sourceUrl} target="_blank" rel="noreferrer">Google Doc</a>
            {sop.lastSynced && <> · synced {sop.lastSynced}</>}
          </p>
        )}
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{sop.body}</ReactMarkdown>

        <div className="doc-footer">
          {readAt ? (
            <span className="pill success">✓ Marked as read</span>
          ) : (
            <button className="primary" onClick={() => store.markSopRead(sopId)}>
              I've read and understood this SOP
            </button>
          )}
          {readAt && nextSopId && (
            <Link to={`/sop/${nextSopId}`}><button>Next SOP →</button></Link>
          )}
          {readAt && isLastInModule && module?.quiz && (
            <Link to={`/quiz/${module.quiz}`}><button className="primary">Take the module check →</button></Link>
          )}
          {readAt && <Link to="/" className="small">Back to My Training</Link>}
        </div>
      </article>
    </div>
  )
}
