/* player.js — local addition to the MIT-licensed source of "67: A Brief History of Art".
 * The upstream public/index.html is a frame-capture harness driven by tools/render.mjs
 * (window.renderAt(t)); this driver offers two ways to watch the film:
 *
 *   1. LIVE MODE (default attempt): real-time playback of the pure-function timeline.
 *      Film time tracks wall clock; per-frame cost is measured continuously.
 *   2. GALLERY MODE (auto-degrade): if the machine cannot render frames fast enough
 *      (single frame > 4 s, or 4-frame average > 1.6 s, or repeated render errors),
 *      playback switches to a CSS-composited slideshow of the pre-baked stills
 *      (tiles/<id>/001.jpg, our own renders of the MIT scene code) with era captions,
 *      following the same 82 s timeline. Zero main-thread risk, works on any device.
 *
 * Query flags:
 *   ?t=SECONDS       start at a given film time
 *   ?still           render a single clean frame and stop (thumbnails / QA)
 *   ?gallery=1       force gallery mode
 *   ?notrans=1       upstream flag, disables the slat-slide transitions
 */
(function () {
  const q = new URLSearchParams(location.search);
  const still = q.has('still');
  const forceGallery = q.has('gallery');
  const tStart = Math.max(0, parseFloat(q.get('t')) || 0);
  const DUR = 82; // keep in sync with timeline.json duration
  let t0 = null;
  let booted = false;
  let gallery = false;
  const costs = [];
  let failures = 0;

  function fit() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    const m = document.querySelector('main');
    if (m) m.style.transform = 'scale(' + s + ')';
  }
  addEventListener('resize', fit);
  fit();

  /* ---------------------------------------------------------------- gallery */
  function startGallery(fromT) {
    if (gallery) return;
    gallery = true;
    const stage = document.querySelector('main');
    if (stage) stage.style.display = 'none';

    const TL = (V.TL && V.TL.scenes) || [];
    const eras = TL.filter((s) => s.id !== 'intro' && s.id !== 'finale');
    const finMeta = TL.find((s) => s.id === 'finale') || { t0: 72 };
    const yr = (s) => {
      const y = s.year < 0 ? Math.abs(s.year) : s.year;
      const suf = s.year < 0 ? ' BCE' : s.suffix ? ' ' + s.suffix : '';
      return (s.prefix ? s.prefix : '') + y + suf;
    };

    const style = document.createElement('style');
    style.textContent = [
      '#ah67-gallery{position:fixed;inset:0;background:#000;z-index:4;overflow:hidden}',
      '.ah67-slide{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .9s ease;pointer-events:none}',
      '.ah67-slide.is-on{opacity:1}',
      '.ah67-slide>img{max-width:100%;max-height:100%;object-fit:contain}',
      '.ah67-slide.is-on>img{animation:ah67kb 10s ease-out forwards}',
      '@keyframes ah67kb{from{transform:scale(1)}to{transform:scale(1.05)}}',
      '.ah67-cap{position:absolute;left:4vmin;bottom:4vmin;color:#c9c2af;font:500 2vmin/1.5 Menlo,Consolas,monospace;letter-spacing:.06em;background:rgba(0,0,0,.5);padding:.6em 1em;border-left:3px solid #d97757;max-width:72vw}',
      '.ah67-cap b{display:block;color:#f4efe2;font-size:1.25em;margin-bottom:.15em}',
      '.ah67-intro{flex-direction:column;background:#000}',
      '.ah67-intro-67{font:bold 24vmin Georgia,\'Times New Roman\',serif;color:#f4efe2;letter-spacing:-1vmin;text-shadow:0 0 8vmin rgba(217,119,87,.4)}',
      '.ah67-intro-sub{margin-top:2vmin;color:#6f695c;font:700 2vmin Menlo,Consolas,monospace;letter-spacing:.35em}',
      '.ah67-mosaic{position:absolute;inset:7vmin 4vmin 12vmin;display:grid;grid-template-columns:repeat(5,1fr);grid-template-rows:repeat(3,1fr);gap:.5vmin}',
      '.ah67-mosaic img{width:100%;height:100%;object-fit:cover;opacity:0;transform:scale(.2)}',
      '.ah67-slide.is-on .ah67-mosaic img{animation:ah67pop .5s cubic-bezier(.2,1.4,.4,1) forwards}',
      '@keyframes ah67pop{to{opacity:1;transform:scale(1)}}',
      '.ah67-fin{position:absolute;left:0;right:0;bottom:3vmin;text-align:center;color:#f1ead9;font:bold 4vmin \'Songti TC\',SimSun,serif}',
      '.ah67-fin span{display:block;margin-top:1vmin;color:#d97757;font-size:.55em}',
      '.ah67-note{position:fixed;left:4vmin;top:4vmin;z-index:6;color:#6f695c;background:rgba(0,0,0,.55);border-left:3px solid #d97757;padding:.5em .9em;font:500 1.6vmin/1.4 Menlo,Consolas,monospace;letter-spacing:.05em;transition:opacity 1s ease}',
    ].join('\n');
    document.head.appendChild(style);

    const g = document.createElement('div');
    g.id = 'ah67-gallery';
    let html = '<div class="ah67-slide ah67-intro" data-t0="0"><div class="ah67-intro-67">67</div><div class="ah67-intro-sub">一部藝術史 · A BRIEF HISTORY OF ART</div></div>';
    for (const s of eras) {
      const cap = s.label ? s.label.title : '';
      html += `<div class="ah67-slide" data-t0="${s.t0}"><img src="tiles/${s.id}/001.jpg" alt="${s.era || s.id}"><div class="ah67-cap"><b>${yr(s)} · ${s.era || ''}</b>《${cap}》</div></div>`;
    }
    html += `<div class="ah67-slide" data-t0="${finMeta.t0}"><div class="ah67-mosaic">${eras.map((s) => `<img src="tiles/${s.id}/001.jpg" alt="">`).join('')}</div><div class="ah67-fin">結論：人類四萬年來，一直都在 67。<span>沒有人知道為什麼。也沒有人敢問。</span></div></div>`;
    html += '<div class="ah67-note">实时渲染在本机负载过高，已自动切换画廊模式（预渲染静帧）</div>';
    g.innerHTML = html;
    document.body.appendChild(g);

    // staggered mosaic pops
    g.querySelectorAll('.ah67-mosaic img').forEach((im, k) => { im.style.animationDelay = (0.35 + k * 0.14).toFixed(2) + 's'; });

    // timeline-driven slide switching, looping on the same 82 s clock
    const slides = Array.from(g.querySelectorAll('.ah67-slide'));
    const boundaries = slides.map((s) => parseFloat(s.dataset.t0) || 0);
    const g0 = performance.now() - fromT * 1000;
    let current = -1;
    function show(idx) {
      if (idx === current) return;
      slides.forEach((s, k) => s.classList.toggle('is-on', k === idx));
      if (current >= 0) {
        const prev = slides[current];
        const anims = prev.querySelectorAll('.ah67-mosaic img');
        anims.forEach((im) => { im.style.animation = 'none'; void im.offsetWidth; im.style.animation = ''; });
      }
      current = idx;
    }
    setInterval(() => {
      const ft = ((performance.now() - g0) / 1000) % DUR;
      let idx = 0;
      for (let k = 0; k < boundaries.length; k++) if (ft >= boundaries[k]) idx = k;
      show(idx);
    }, 200);

    const note = g.querySelector('.ah67-note');
    setTimeout(() => { if (note) note.style.opacity = '0'; }, 6000);
    setTimeout(() => { if (note && note.parentNode) note.parentNode.removeChild(note); }, 8000);
    window.__boot && window.__boot.finish();
  }

  /* ------------------------------------------------------------------ still */
  if (still) {
    // QA stills must capture the bare canvas — drop the loading overlay entirely
    // (removed once the DOM is parsed, inside waitReady).
    (function waitReady() {
      if (window.__ready) {
        const b = document.getElementById('boot');
        if (b) b.remove();
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
    return;
  }

  /* ---------------------------------------------------------------- playback */
  // Pre-flight probe: measure raw canvas performance once (~30-60 ms on a GPU machine,
  // hundreds of ms+ under software rendering). Weak machines skip live mode entirely,
  // so the page never blocks on a first frame that would take tens of seconds.
  let benchMs = null;
  function bench() {
    if (benchMs != null) return benchMs;
    try {
      const c = document.createElement('canvas');
      c.width = 640; c.height = 360;
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) { benchMs = 9999; return benchMs; }
      const a = performance.now();
      for (let i = 0; i < 60; i++) { gl.clearColor(i / 255, 0.3, 0.5, 1); gl.clear(gl.COLOR_BUFFER_BIT); }
      const glMs = performance.now() - a;
      const c2 = document.createElement('canvas');
      c2.width = 960; c2.height = 540;
      const ctx = c2.getContext('2d');
      const b = performance.now();
      ctx.strokeStyle = '#454545'; ctx.lineWidth = 6;
      for (let i = 0; i < 300; i++) {
        ctx.beginPath();
        ctx.moveTo((i * 37) % 960, (i * 13) % 540);
        ctx.quadraticCurveTo(200, 300 + (i % 100), 900, 500);
        ctx.stroke();
      }
      benchMs = glMs + (performance.now() - b);
    } catch (e) {
      benchMs = 9999;
    }
    return benchMs;
  }
  const BENCH_LIMIT = 300; // ms; a hardware-accelerated machine finishes in tens of ms

  async function pump(now) {
    if (gallery) return; // gallery mode owns the page now
    if (window.__ready) {
      if (forceGallery || bench() > BENCH_LIMIT) { console.log('[perf] bench=' + bench().toFixed(0) + 'ms -> gallery'); startGallery(tStart); return; }
      if (t0 == null) t0 = now - tStart * 1000;
      const t = ((now - t0) / 1000) % DUR;
      try {
        const _t0 = performance.now();
        await window.renderAt(t);
        const _dt = performance.now() - _t0;
        if (_dt > 250) console.log('[perf] t=' + t.toFixed(2) + ' frame=' + _dt.toFixed(0) + 'ms');
        if (!booted) { booted = true; window.__boot && window.__boot.finish(); }
        // adaptive degrade: this film renders one full 1920x1080 procedural frame per
        // tick; on machines where that costs seconds the page would feel frozen.
        costs.push(_dt);
        if (costs.length > 5) costs.shift();
        const avg = costs.reduce((a, b) => a + b, 0) / costs.length;
        if (_dt > 4000 || (costs.length >= 4 && avg > 1600)) {
          console.log('[perf] degrading to gallery at t=' + t.toFixed(2) + ' (frame=' + _dt.toFixed(0) + 'ms avg=' + avg.toFixed(0) + 'ms)');
          startGallery(t);
          return;
        }
      } catch (e) {
        console.error('frame failed at t=' + t.toFixed(2), e);
        if (++failures >= 2) { startGallery(t); return; }
      }
    }
    if (!gallery) requestAnimationFrame(pump);
  }

  if (!still) requestAnimationFrame(pump);
})();
