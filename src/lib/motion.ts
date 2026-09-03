/**
 * Motion primitives.
 *
 * Borrowed *principles* (not code) from Lieflat Charts' visual language:
 *  - fast-in, fast-stop easing (quartic out), no bounce
 *  - stagger small units (8–15 ms per dot, 80–130 ms per bar)
 *  - play when scrolled into view; click to replay
 *  - always honour prefers-reduced-motion
 *  - a mark only animates or reacts if there is a real record behind it
 */
import { useCallback, useEffect, useRef, useState } from 'react'

export const STAGGER_DOT = 12
export const STAGGER_BAR = 100
export const ENTER = 900

export const quarticOut = (t: number) => 1 - Math.pow(1 - t, 4)

export function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

/**
 * Scroll-into-view reveal with click-to-replay.
 * `key` changes each time the element should (re)play; pass it as a React
 * `key` on the animated subtree so CSS animations restart.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T | null>(null)
  const [key, setKey] = useState(0)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) { setShown(true); return }
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setShown(true)
        setKey((k) => k + 1)
        io.disconnect()
      }
    }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  const replay = useCallback(() => setKey((k) => k + 1), [])
  return { ref, key, shown, replay }
}

/** Counts from 0 to `target` with quartic-out easing. Restarts when `replayKey` changes. */
export function useCountUp(target: number, replayKey: number, duration = ENTER): number {
  const [value, setValue] = useState(prefersReducedMotion() ? target : 0)
  useEffect(() => {
    if (prefersReducedMotion() || replayKey === 0) { setValue(target); return }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setValue(Math.round(target * quarticOut(t)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, replayKey, duration])
  return value
}
