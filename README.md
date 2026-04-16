# Video Player

A lightweight, scroll-aware video player for Webflow (or any HTML site). Lazy loads, auto-plays muted when in view, pauses when scrolled away, with custom controls: centered play/pause, progress scrubber, mute toggle, and fullscreen.

Designed to keep **as little code as possible in Webflow** — just 2 one-liners and an embed block. Everything else lives on GitHub and is served via jsDelivr.

---

## Quick Reference

### 1. Webflow — Page Settings → Custom Code → Inside `<head>` tag

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/ahmedmissio/video-player@main/video-player.css?v=1">
```

### 2. Webflow — Page Settings → Custom Code → Before `</body>` tag

```html
<script defer src="https://cdn.jsdelivr.net/gh/ahmedmissio/video-player@main/video-player.js?v=1"></script>
```

### 3. Webflow — Embed element (wherever the video should appear)

```html
<div class="reel-wrap is-paused" data-reel>
  <video muted playsinline loop preload="none"
    poster="POSTER-IMAGE-URL.jpg"
    data-lazy-src="VIDEO-URL.mp4">
  </video>

  <button class="reel-center-btn" data-reel-toggle aria-label="Play/Pause">
    <svg data-icon-play viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
    <svg data-icon-pause viewBox="0 0 24 24" style="display:none"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
  </button>

  <div class="reel-controls">
    <div class="reel-progress" data-reel-progress>
      <div class="reel-progress-fill" data-reel-fill></div>
    </div>
    <div class="reel-row">
      <div class="reel-left">
        <button class="reel-btn" data-reel-mute aria-label="Mute/Unmute">
          <svg data-icon-muted viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.17v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
          <svg data-icon-unmuted viewBox="0 0 24 24" style="display:none"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
        </button>
        <span class="reel-time" data-reel-time>0:00 / 0:00</span>
      </div>
      <button class="reel-btn" data-reel-fullscreen aria-label="Fullscreen">
        <svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
      </button>
    </div>
  </div>
</div>
```

Replace `POSTER-IMAGE-URL.jpg` and `VIDEO-URL.mp4` with your actual URLs. Publish the site. Done.

---

## Features

- **Lazy loading** — video source is not fetched until the user scrolls near it (200px buffer)
- **Auto-play on scroll** — muted auto-play when video enters viewport
- **Auto-pause when out of view** — saves bandwidth and CPU
- **Resumes on re-entry** — picks up where it left off
- **Respects user intent** — once the user manually pauses, scrolling won't override them
- **Custom controls** — centered play/pause button, progress scrubber, mute toggle, fullscreen
- **Multiple videos per page** — drop as many `[data-reel]` blocks as you want
- **Zero dependencies** — pure vanilla JS, no libraries
- **Responsive** — built-in 16:9 aspect ratio, scales to container width

---

## Full Walkthrough

### Why this setup

Webflow's built-in Background Video element doesn't lazy load, doesn't pause on scroll, and can't have custom controls. Embedding a long `<script>` block directly in Webflow's custom code works but clutters the project and can't be reused across sites.

Hosting the logic on GitHub and serving via jsDelivr means:

- Webflow stays clean — just 2 one-liners and an embed block
- One update to the GitHub file updates every site using it
- Full browser caching across sites (jsDelivr is a global CDN)
- Free forever for public repos

This is the same approach Finsweet uses for their Attributes library.

### Repo structure

```
video-player/
├── video-player.js    # All behavior logic
├── video-player.css   # All styling
└── README.md          # This file
```

### Hosting videos

Use **Cloudinary** (recommended) for hosted videos. It's free up to 25GB storage + 25GB bandwidth.

**Cloudinary URL tricks worth knowing:**

- Add `/so_0/` to generate a poster image from the first frame of the video — no need to export manually. Just swap the extension to `.jpg`:
  ```
  https://res.cloudinary.com/CLOUD/video/upload/so_0/v.../file.jpg
  ```
- Add `/q_auto,f_auto/` to the video URL to serve the best format per browser (smaller WebM for Chrome, MP4 for Safari, optimized quality per device):
  ```
  https://res.cloudinary.com/CLOUD/video/upload/q_auto,f_auto/v.../file.mp4
  ```

### How the scroll behavior works

An `IntersectionObserver` watches each `[data-reel]` wrapper. It fires when the wrapper enters or leaves the viewport.

- **Entering viewport:** fetches the source (only the first time) and calls `video.play()`
- **Leaving viewport:** calls `video.pause()`
- **User-paused flag:** once the viewer clicks pause, a flag is set so scrolling back into view won't auto-resume. This avoids the annoying behavior of a muted-then-unmuted video re-playing on its own.

The `rootMargin: "200px 0px"` option in the observer means it starts loading 200px before the video enters the viewport — so by the time the user sees it, it's already ready.

### How lazy loading works

The `<video>` tag is rendered with `preload="none"` and no `<source>` element. The URL is stored in `data-lazy-src`. When the observer fires for the first time, JavaScript creates a `<source>` element, inserts it into the video, and calls `.load()`.

This means **zero network cost at page load** — no video data is fetched until the user actually scrolls near it. On pages with multiple videos this is a huge performance win.

### Updating the script

1. Edit the file on GitHub → commit
2. Bump the `?v=1` cache-buster in the Webflow script tag to `?v=2`, `?v=3`, etc.
3. Republish Webflow

The cache-buster is critical — jsDelivr aggressively caches files for up to 24 hours. Without the version bump, visitors will see the old version.

For production stability, pin to a specific commit or tag instead of `@main`:
```html
<script defer src="https://cdn.jsdelivr.net/gh/ahmedmissio/video-player@v1.0.0/video-player.js"></script>
```

### Multiple videos on one page

Just drop multiple `[data-reel]` blocks. Each one is independent — its own observer, its own play state, its own controls. No config needed.

### Customizing the styling

Edit `video-player.css` on GitHub. Common tweaks:

- **Change aspect ratio** — edit `.reel-wrap { aspect-ratio: 16/9; }` (try `4/3`, `1/1`, `21/9`, `9/16` for vertical)
- **Change border radius** — edit `.reel-wrap { border-radius: 12px; }`
- **Change button color** — edit `.reel-center-btn { background: rgba(0,0,0,0.55); }`
- **Change progress bar color** — edit `.reel-progress-fill { background: #fff; }`

### Gotchas and fixes

**Video doesn't play after publishing.**
Test with DevTools → Console:
```javascript
document.querySelectorAll("[data-reel]").length
```
- Returns `1+` → script is finding the element, check the Network tab for the jsDelivr files (200 OK means loaded)
- Returns `0` → Webflow's Embed element sometimes wraps content unexpectedly. Confirm the embed HTML wasn't modified

**Script loads but nothing happens.**
This was the original bug — a script loaded with `defer` can fire after `DOMContentLoaded`, missing the event. The current version checks `document.readyState` to handle both cases.

**Custom code doesn't run at all.**
Webflow **does not execute custom code in the Designer preview**. Only the published `.webflow.io` or custom domain URL runs the scripts. Always test on the published site.

**Styles not updating after editing CSS.**
jsDelivr caches for up to 24 hours. Bump the `?v=1` query string in the Webflow `<link>` tag to force-refresh.

**Console shows errors from browser extensions.**
Errors mentioning `chrome-extension://`, `fbevents.js`, or `ad-block` are browser extensions, not your code. Ignore them.

**Video container has zero height.**
The CSS sets `aspect-ratio: 16/9` on `.reel-wrap`, so the wrapper sizes itself from its width. If your layout ever breaks, make sure the Webflow parent isn't forcing `height: 0` or `display: none` on the wrapper.

**iOS fullscreen doesn't work on the wrapper.**
iOS Safari only allows fullscreen on the `<video>` element itself, not arbitrary divs. The script handles this with a `video.webkitEnterFullscreen()` fallback — but it means on iOS you get native fullscreen (with native controls) rather than fullscreen of the custom wrapper. This is a browser limitation, not fixable.

### Reusing on future projects

On any new Webflow project:

1. Paste the CSS link in `<head>`
2. Paste the JS script tag before `</body>`
3. Paste the embed block wherever you want a video
4. Swap the poster + video URLs

That's it. Nothing else to copy, nothing else to configure.

If a future project needs a variation (different aspect ratio, different button style, different behavior), two options:

- **Fork and customize** — clone this repo into a new one for that project
- **Add variants to this repo** — create `video-player-vertical.js`, `video-player-minimal.js`, etc. and reference whichever one the project needs

---

## Tech stack

- Vanilla JavaScript (no framework, no dependencies)
- CSS with custom properties and modern features (`aspect-ratio`, `backdrop-filter`)
- `IntersectionObserver` API for scroll detection
- jsDelivr CDN for global delivery

## License

MIT — use anywhere, modify freely.
