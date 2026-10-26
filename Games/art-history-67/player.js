/* player.js — local addition to the MIT-licensed source of "67: A Brief History of Art".
 * The upstream public/index.html is a frame-capture harness driven by tools/render.mjs
 * (window.renderAt(t)); this small driver plays the pure-function timeline in real time.
 *
 *   - default          : real-time playback, loops at the end of the 82 s timeline
 *   - ?t=SECONDS       : start playback at a given film time
 *   - ?t=SECONDS&still : render a single clean frame and stop (thumbnails / QA)
 *   - ?notrans=1       : upstream flag, disables the slat-slide transitions
 *
 * Scaling: the stage is authored at a fixed 1920x1080; it is scaled to fit the viewport.
 */
(function () {
  const q = new URLSearchParams(location.search);
  const still = q.has('still');
  const tStart = Math.max(0, parseFloat(q.get('t')) || 0);
  const DUR = 82; // keep in sync with timeline.json duration
  let t0 = null;

  function fit() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    const m = document.querySelector('main');
    if (m) m.style.transform = 'scale(' + s + ')';
  }
  addEventListener('resize', fit);
  fit();

  async function pump(now) {
    if (window.__ready) {
      if (t0 == null) t0 = now - tStart * 1000;
      const t = ((now - t0) / 1000) % DUR;
      await window.renderAt(t);
    }
    requestAnimationFrame(pump);
  }

  if (still) {
    // still mode: poll instead of rAF so headless virtual-time budget isn't consumed
    // by animation frames; render exactly one frame, then the page goes fully idle.
    // document.title reports the outcome for headless QA: AH67_OK / AH67_ERR / AH67_FAIL.
    (function waitReady() {
      if (window.__ready) {
        (async () => {
          try {
            await window.renderAt(tStart);
            document.title = window.__lastError ? 'AH67_ERR' : 'AH67_OK';
          } catch (e) {
            document.title = 'AH67_FAIL';
            console.error('still render failed:', e);
          }
        })();
        return;
      }
      setTimeout(waitReady, 60);
    })();
  } else {
    requestAnimationFrame(pump);
  }
})();
