import { useEffect, useRef, useState } from 'react'
import { ScrollFrames } from './components/ScrollFrames'
import { useFrameLoader } from './hooks/useFrameLoader'
import { FRAME_COUNT } from './lib/frames'
import './App.css'

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

export default function App() {
  const { loaded, ready, framesRef } = useFrameLoader()
  const [progress, setProgress] = useState(0)
  const progressRef = useRef(0)
  const targetRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
    window.scrollTo(0, 0)
    progressRef.current = 0
    targetRef.current = 0
    setProgress(0)

    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      targetRef.current = clamp01(window.scrollY / max)
    }

    const tick = () => {
      const current = progressRef.current
      const next = current + (targetRef.current - current) * 0.14
      if (Math.abs(next - current) > 0.00015) {
        progressRef.current = next
        setProgress(next)
      } else if (current !== targetRef.current) {
        progressRef.current = targetRef.current
        setProgress(targetRef.current)
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const beginSurvey = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    window.scrollTo({ top: max * 0.82, behavior: 'smooth' })
  }

  const loadPct = Math.round((loaded / FRAME_COUNT) * 100)
  const brandShift = progress * -42
  const copyShift = progress * -18
  const railGlow = 0.35 + progress * 0.55
  const heroCopyOpacity = clamp01(1 - (progress - 0.42) / 0.22)
  const outroOpacity = clamp01((progress - 0.78) / 0.16)
  const ctaOpacity = clamp01(1 - progress * 1.8)

  return (
    <div className="app">
      <div className="stage" aria-hidden={!ready}>
        <ScrollFrames progress={progress} framesRef={framesRef} ready={ready} />
        <div className="stage-veil" />
        <div className="stage-grain" />
        <div className="stage-vignette" />
      </div>

      <div className="scroll-track" />

      <header className="hud">
        <div className="hud-mark" style={{ transform: `translate3d(0, ${brandShift * 0.35}px, 0)` }}>
          LOTLINE
        </div>
        <div className="hud-meta">
          <span>{String(Math.round(progress * (FRAME_COUNT - 1)) + 1).padStart(3, '0')}</span>
          <span className="hud-slash">/</span>
          <span>{FRAME_COUNT}</span>
        </div>
      </header>

      <main className="hero" style={{ transform: `translate3d(0, ${brandShift}px, 0)` }}>
        <p className="hero-kicker" style={{ opacity: clamp01(1 - progress * 1.4) }}>
          Aerial survey · parcel 04
        </p>
        <h1 className="hero-brand">LOTLINE</h1>

        <div className="copy-slot">
          <div
            className="copy-panel copy-panel--intro"
            style={{
              opacity: heroCopyOpacity,
              visibility: heroCopyOpacity < 0.02 ? 'hidden' : 'visible',
              transform: `translate3d(0, ${copyShift}px, 0)`,
            }}
          >
            <p className="hero-line">
              Scroll the boundary. Watch the lot resolve from field to claim.
            </p>
            <div
              className="hero-cta"
              style={{
                opacity: ctaOpacity,
                visibility: ctaOpacity < 0.02 ? 'hidden' : 'visible',
                pointerEvents: ctaOpacity < 0.02 ? 'none' : 'auto',
              }}
            >
              <button type="button" className="cta" onClick={beginSurvey}>
                Begin survey
              </button>
              <span className="cta-hint">drag / wheel / touch</span>
            </div>
          </div>

          <div
            className="copy-panel copy-panel--outro"
            aria-hidden={outroOpacity < 0.02}
            style={{
              opacity: outroOpacity,
              visibility: outroOpacity < 0.02 ? 'hidden' : 'visible',
            }}
          >
            <h2 className="outro-title">The line is the product.</h2>
            <p className="outro-body">
              Neon edge over living soil — ten seconds of air, remapped into one continuous
              landing plane.
            </p>
          </div>
        </div>
      </main>

      <aside className="rail" aria-hidden>
        <div className="rail-track">
          <div
            className="rail-fill"
            style={{
              transform: `scaleY(${progress})`,
              opacity: railGlow,
            }}
          />
        </div>
        <span className="rail-label">SCROLL</span>
      </aside>

      {!ready && (
        <div className="boot" role="status">
          <div className="boot-brand">LOTLINE</div>
          <div className="boot-bar">
            <div className="boot-fill" style={{ width: `${loadPct}%` }} />
          </div>
          <div className="boot-pct">{loadPct}%</div>
        </div>
      )}
    </div>
  )
}
