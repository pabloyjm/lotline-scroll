export const FRAME_COUNT = 121
export const FRAME_WIDTH = 960
export const FRAME_HEIGHT = 540

export function frameUrl(index: number): string {
  const n = String(index + 1).padStart(4, '0')
  return `/assets/frames/frame-${n}.webp`
}
