import { useEffect, useRef, type MutableRefObject } from 'react'
import type { FrameSlot } from '../hooks/useFrameLoader'
import { FRAME_COUNT, FRAME_HEIGHT, FRAME_WIDTH } from '../lib/frames'

type Props = {
  progress: number
  framesRef: MutableRefObject<FrameSlot[]>
  ready: boolean
}

function coverDraw(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number,
  zoom = 1,
) {
  const ir = img.naturalWidth / img.naturalHeight
  const cr = cw / ch
  let dw: number
  let dh: number
  if (ir > cr) {
    dh = ch * zoom
    dw = dh * ir
  } else {
    dw = cw * zoom
    dh = dw / ir
  }
  const dx = (cw - dw) / 2
  const dy = (ch - dh) / 2
  ctx.drawImage(img, dx, dy, dw, dh)
}

function nearestFrame(frames: FrameSlot[], index: number): HTMLImageElement | null {
  const hit = frames[index]
  if (hit) return hit
  for (let d = 1; d < FRAME_COUNT; d++) {
    const a = frames[index - d]
    if (a) return a
    const b = frames[index + d]
    if (b) return b
  }
  return null
}

export function ScrollFrames({ progress, framesRef, ready }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const progressRef = useRef(progress)
  const lastIndexRef = useRef(-1)
  const lastZoomRef = useRef(-1)

  progressRef.current = progress

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      lastIndexRef.current = -1
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !ready) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    let raf = 0
    let running = true

    const paint = () => {
      if (!running) return
      const p = progressRef.current
      const index = Math.min(
        FRAME_COUNT - 1,
        Math.max(0, Math.round(p * (FRAME_COUNT - 1))),
      )
      const zoom = 1.04 + p * 0.08

      if (index !== lastIndexRef.current || Math.abs(zoom - lastZoomRef.current) >= 0.001) {
        const img = nearestFrame(framesRef.current, index)
        if (img) {
          ctx.fillStyle = '#0c110e'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          coverDraw(ctx, img, canvas.width, canvas.height, zoom)
          lastIndexRef.current = index
          lastZoomRef.current = zoom
        }
      }

      raf = requestAnimationFrame(paint)
    }

    raf = requestAnimationFrame(paint)
    return () => {
      running = false
      cancelAnimationFrame(raf)
    }
  }, [framesRef, ready])

  return (
    <canvas
      ref={canvasRef}
      className="scroll-frames"
      width={FRAME_WIDTH}
      height={FRAME_HEIGHT}
      aria-hidden
    />
  )
}
