# Local preview of the production build, and headless verification

## Gotcha: `base` mismatch makes the preview a blank page

`vite.config.ts` sets `base: '/sop-academy/'` for GitHub Pages. If you run
`VITE_BASE=/ npm run build` but then `npm run preview` *without* the env var,
the preview server serves at `/sop-academy/` while the built HTML references
`/assets/...` — the page loads but every asset 404s and you get a blank white
screen with no obvious error.

**Fix:** set the same `VITE_BASE` for both commands:

```sh
VITE_BASE=/ npm run build && VITE_BASE=/ npm run preview
```

## Headless walkthrough with Playwright

Used to verify the full trainee flow without a human clicking. Pattern:

```js
import { chromium } from 'playwright'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }) // pinned in the cloud sandbox
const p = await b.newPage({ viewport: { width: 1200, height: 900 } })
p.on('pageerror', e => errors.push(e.message))
await p.goto('http://localhost:4173/#/')          // HashRouter → routes live after '#'
await p.click('a[href="#/sop/role-overview"]')     // links are hash links
await p.click('button:has-text("read and understood")')
...
await p.screenshot({ path: 'home.png', fullPage: true })
```

Things that bit us:
- `window.scrollTo({behavior:'smooth'})` hasn't finished when the screenshot
  is taken; use `top: 0` without smooth if the screenshot matters.
- Playwright wants its own browser download; in the sandbox use
  `executablePath: '/opt/pw-browsers/chromium'` instead of
  `npx playwright install`.

## Decision: why HashRouter

GitHub Pages serves static files only — a deep link like
`/sop-academy/sop/guest-arrival` would 404 with BrowserRouter. HashRouter
keeps everything under `index.html`. If we move to a host with rewrites we
can switch to BrowserRouter in `main.tsx`; nothing else changes.
