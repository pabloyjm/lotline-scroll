import { useEffect, useRef, useState } from 'react'
import { FRAME_COUNT, frameUrl } from '../lib/frames'

export type FrameSlot = HTMLImageElement | null

type LoaderState = {
  frames: FrameSlot[]
  loaded: number
  ready: boolean
}

const INITIAL: LoaderState = {
  frames: Array.from({ length: FRAME_COUNT }, () => null),
  loaded: 0,
  ready: false,
}

export function useFrameLoader() {
  const [state, setState] = useState<LoaderState>(INITIAL)
  const framesRef = useRef<FrameSlot[]>(INITIAL.frames)

  useEffect(() => {
    let cancelled = false
    const slots: FrameSlot[] = Array.from({ length: FRAME_COUNT }, () => null)
    framesRef.current = slots
    let loaded = 0

    const bump = () => {
      if (cancelled) return
      loaded += 1
      setState({
        frames: slots.slice(),
        loaded,
        ready: loaded >= Math.min(24, FRAME_COUNT),
      })
    }

    const order: number[] = []
    const seen = new Set<number>()
    const push = (i: number) => {
      if (i < 0 || i >= FRAME_COUNT || seen.has(i)) return
      seen.add(i)
      order.push(i)
    }

    push(0)
    push(FRAME_COUNT - 1)
    for (let step = FRAME_COUNT >> 1; step >= 1; step >>= 1) {
      for (let i = step; i < FRAME_COUNT; i += step) push(i)
    }
    for (let i = 0; i < FRAME_COUNT; i++) push(i)

    const concurrency = navigator.hardwareConcurrency
      ? Math.min(8, Math.max(3, navigator.hardwareConcurrency))
      : 4

    let cursor = 0

    const runWorker = async () => {
      while (!cancelled) {
        const i = cursor++
        if (i >= order.length) return
        const index = order[i]
        const img = new Image()
        img.decoding = 'async'
        img.src = frameUrl(index)
        try {
          await img.decode()
        } catch {
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve()
            img.onerror = () => reject()
          }).catch(() => undefined)
        }
        if (cancelled) return
        slots[index] = img
        bump()
      }
    }

    void Promise.all(Array.from({ length: concurrency }, () => runWorker()))

    return () => {
      cancelled = true
    }
  }, [])

  return { ...state, framesRef }
}
