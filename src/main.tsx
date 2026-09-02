import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { validateContent } from './lib/content'

if (import.meta.env.DEV) {
  for (const p of validateContent()) console.warn('[content]', p)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* HashRouter so deep links work on GitHub Pages without server rewrites. */}
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
