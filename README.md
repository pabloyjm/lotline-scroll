# LOTLINE — scroll-driven aerial survey POC

React + Vite + TypeScript PWA. Scrolling scrubs a WebP frame sequence extracted from `video.mp4`.

## Run

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`). Scroll (wheel / touch / trackpad) to scrub the flyover.

```bash
npm run build
npm run preview
```

## Assets

| Item | Detail |
| --- | --- |
| Source video | `video.mp4` (1920×1080, 24 fps, ~10.04 s) |
| Frames | `public/assets/frames/frame-0001.webp` … `frame-0121.webp` |
| Count / size | 121 WebP frames @ 960×540, ~5.6 MB total |
| Extraction | `ffmpeg -vf "fps=12,scale=960:-1"` → libwebp q72 |

## Notes

- Canvas + `requestAnimationFrame` frame scrubbing with eased scroll progress
- Priority frame preload, nearest-neighbor fallback while loading
- Installable PWA via `vite-plugin-pwa` (manifest + service worker)
