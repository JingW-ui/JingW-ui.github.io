// src/scenes/s20_code.js
// #20 代码美学 (2020s · Flagship OLED Generative SVG Studio) — 3-Act Fourier Epicycle Finale
// - Nano-Texture OLED blue-noise anti-banding dark optical workbench + multi-pass Golden Spiral.
// - Single consolidated 72%-translucent frosted-glass IDE window at (32, 32) [bottom y=364]:
//   native title bar `20 · 代码美学 — 2020s · Generative SVG Code Art` + `[ ◇ pelican_finale_20.svg × ]`,
//   Act-I live `Σ c_k · exp(i·k·ω·t)` header & 16-bar `|c_k|` spectrum -> SVG `<path>` Bezier code!
// - Act I (`0.12s..2.28s`): Real 36-harmonic Complex DFT Epicycles (`Σ c_k · e^{ikωθ}`) centered on
//   the moving rig live-tracing the closed pelican silhouette with white-gold pen tip & floor reflection.
// - Act II (`2.25s..4.65s`): Crystallizes into 22-facet barycentric silk mesh + Delaunay amber pouch +
//   G2 titanium bike, with white Direct-Selection pointer live-dragging Bezier handle `■—○` & comb.
// - Act III (`4.65s..6.00s`): 100% solid iridescent pelican & bike (zero exit dissolve for Outro wall!)
//   adorned with delicate golden harmonic wheel epicycle orbits & 3 orbiting satellite phase dots.

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  BEAT_SEC,
  clamp,
  lerp,
  smoothstep,
} from '../beat/timeline.js';
import { computePelicanRig } from '../rig/pelican.js';

// =============================================================================
// Cached 36-Harmonic Complex DFT Table (`Σ c_k · e^{i k θ}`) of Pelican Silhouette
// Computed once at module init (< 0.4ms one-time, < 0.1ms per-frame evaluation).
// =============================================================================
const FOURIER_HARMONICS = 36;
const FOURIER_RECON_SAMPLES = 320;
let _pelicanFourierCache = null;

function sampleQuadPts(p0, p1, p2, n, out) {
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const mt = 1 - t;
    out.push({
      x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
      y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
    });
  }
}

function sampleCubicPts(p0, p1, p2, p3, n, out) {
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const t2 = t * t;
    out.push({
      x: mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x,
      y: mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y,
    });
  }
}

function sampleLinePts(p0, p1, n, out) {
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    out.push({
      x: p0.x + (p1.x - p0.x) * t,
      y: p0.y + (p1.y - p0.y) * t,
    });
  }
}

function getPelicanFourierData() {
  if (_pelicanFourierCache) return _pelicanFourierCache;

  // Canonical reference rig at (0, 0) so closed Fourier silhouette aligns 1:1 with silk mesh!
  const ref = computePelicanRig({ x: 0, y: 0, pedalAngle: 0.72, speedScale: 0, time: 0 });
  const hx = ref.head.x;
  const hy = ref.head.y;
  const hr = ref.head.r;

  const pCrownStart = { x: hx - hr * 0.92, y: hy + hr * 0.25 };
  const pCrestTip = { x: ref.crest2.x - 9, y: ref.crest1.y - 2 };
  const pSkullTop = { x: hx + hr * 0.25, y: hy - hr * 1.08 };
  const pBeakBaseU = { x: ref.beakUpperBase.x, y: ref.beakUpperBase.y - 1 };
  const pBeakTipU = { x: ref.beakTip.x, y: ref.beakTip.y - 3.5 };
  const pBeakHook = { x: ref.beakTip.x + 5.5, y: ref.beakTip.y + 4.2 };
  const pBeakTipL = { x: ref.beakTip.x - 3, y: ref.beakTip.y + 2 };
  const pPouchCtrl = { x: ref.pouchBelly.x, y: ref.pouchBelly.y + 5 };
  const pThroat = { x: ref.beakLowerBase.x + 2, y: ref.beakLowerBase.y + 2 };
  const pChestFront = { x: ref.chest.x + 11, y: ref.chest.y - 3 };
  const pWingGrip = { x: ref.wingTip.x + 3, y: ref.wingTip.y };
  const pStem = { x: ref.stemTop.x + 5, y: ref.stemTop.y + 2 };
  const pHeadTop = { x: ref.headTop.x + 3, y: ref.headTop.y };
  const pHeadBot = { x: ref.headBot.x + 4, y: ref.headBot.y + 2 };
  const pBB = { x: ref.bb.x, y: ref.bb.y + 3 };
  const pRearHub = { x: ref.rearWheel.x, y: ref.rearWheel.y };
  const pSeatCluster = { x: ref.seatCluster.x - 2, y: ref.seatCluster.y - 2 };
  const pTailTip = { x: ref.tailTip.x - 10, y: ref.tailTip.y - 1 };
  const pWingBackNotch = { x: ref.bodyCenter.x - 18, y: ref.bodyCenter.y - 24 };
  const pBackShoulder = { x: ref.chest.x - 9, y: ref.chest.y - 9 };

  // Clockwise Jordan contour: Crown -> Long Beak -> Gular Pouch -> S-Neck/Chest ->
  // Swept Wing/Handlebar -> Diamond Frame Triangle -> Fanned Tail -> Dorsal Wing Arch -> S-Neck
  const raw = [];
  sampleQuadPts(pCrownStart, { x: pCrestTip.x - 3, y: hy - 6 }, pCrestTip, 8, raw);
  sampleCubicPts(
    pCrestTip,
    { x: hx - hr * 0.5, y: hy - hr * 1.22 },
    { x: hx + hr * 0.05, y: hy - hr * 1.18 },
    pSkullTop,
    10,
    raw
  );
  sampleQuadPts(pSkullTop, { x: hx + hr * 0.85, y: hy - hr * 0.92 }, pBeakBaseU, 8, raw);
  sampleLinePts(pBeakBaseU, pBeakTipU, 24, raw);
  sampleQuadPts(pBeakTipU, pBeakHook, pBeakTipL, 6, raw);
  sampleQuadPts(pBeakTipL, pPouchCtrl, pThroat, 28, raw);
  sampleCubicPts(
    pThroat,
    { x: ref.neckC2.x + 12, y: ref.neckC2.y + 4 },
    { x: ref.neckC1.x + 12, y: ref.neckC1.y + 2 },
    pChestFront,
    16,
    raw
  );
  sampleQuadPts(pChestFront, { x: ref.wingElbow.x + 14, y: ref.wingElbow.y + 10 }, pWingGrip, 14, raw);
  sampleLinePts(pWingGrip, pStem, 7, raw);
  sampleLinePts(pStem, pHeadTop, 8, raw);
  sampleLinePts(pHeadTop, pHeadBot, 10, raw);
  sampleLinePts(pHeadBot, pBB, 24, raw);
  sampleLinePts(pBB, pRearHub, 24, raw);
  sampleLinePts(pRearHub, pSeatCluster, 20, raw);
  sampleQuadPts(pSeatCluster, { x: ref.hip.x - 16, y: ref.hip.y + 6 }, pTailTip, 18, raw);
  sampleQuadPts(pTailTip, { x: ref.bodyCenter.x - 46, y: ref.bodyCenter.y - 28 }, pWingBackNotch, 16, raw);
  sampleQuadPts(pWingBackNotch, { x: ref.bodyCenter.x + 4, y: ref.bodyCenter.y - 34 }, pBackShoulder, 14, raw);
  sampleCubicPts(
    pBackShoulder,
    { x: ref.neckC1.x - 10, y: ref.neckC1.y - 4 },
    { x: ref.neckC2.x - 10, y: ref.neckC2.y - 2 },
    pCrownStart,
    18,
    raw
  );

  // Uniform arc-length resampling to M = 256 equidistant contour vertices
  const M = 256;
  const cum = [0];
  for (let i = 0; i < raw.length; i++) {
    const a = raw[i];
    const b = raw[(i + 1) % raw.length];
    cum.push(cum[i] + Math.hypot(b.x - a.x, b.y - a.y));
  }
  const totalLen = cum[cum.length - 1];
  const samples = [];
  let seg = 0;
  for (let m = 0; m < M; m++) {
    const target = (m / M) * totalLen;
    while (seg < raw.length - 1 && cum[seg + 1] < target) seg++;
    const a = raw[seg];
    const b = raw[(seg + 1) % raw.length];
    const span = Math.max(1e-6, cum[seg + 1] - cum[seg]);
    const u = (target - cum[seg]) / span;
    samples.push({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) });
  }

  // Exact DC centroid c_0 and complex DFT coefficients c_k = (1/M) Σ (z_m - c_0) e^{-i 2π k m / M}
  let c0x = 0;
  let c0y = 0;
  for (let m = 0; m < M; m++) {
    c0x += samples[m].x / M;
    c0y += samples[m].y / M;
  }

  const allTerms = [];
  const K_MAX = 60;
  for (let k = -K_MAX; k <= K_MAX; k++) {
    if (k === 0) continue;
    let re = 0;
    let im = 0;
    for (let m = 0; m < M; m++) {
      const ang = (-2 * Math.PI * k * m) / M;
      const dx = samples[m].x - c0x;
      const dy = samples[m].y - c0y;
      const ca = Math.cos(ang);
      const sa = Math.sin(ang);
      re += (dx * ca - dy * sa) / M;
      im += (dx * sa + dy * ca) / M;
    }
    const amp = Math.hypot(re, im);
    allTerms.push({ k, re, im, amp, phase: Math.atan2(im, re) });
  }

  // Sort by descending |c_k| so largest epicycle rings sit at the core and fine harmonics at the tip
  allTerms.sort((a, b) => b.amp - a.amp);
  const terms = allTerms.slice(0, FOURIER_HARMONICS);

  // Pre-evaluate exact reconstructed closed curve across [0, 2π) for zero-cost trail rendering
  const recon = new Array(FOURIER_RECON_SAMPLES);
  for (let j = 0; j < FOURIER_RECON_SAMPLES; j++) {
    const th = (j / FOURIER_RECON_SAMPLES) * Math.PI * 2;
    let rx = c0x;
    let ry = c0y;
    for (let ti = 0; ti < terms.length; ti++) {
      const t = terms[ti];
      const a = t.k * th + t.phase;
      rx += t.amp * Math.cos(a);
      ry += t.amp * Math.sin(a);
    }
    recon[j] = { x: rx, y: ry };
  }

  _pelicanFourierCache = { c0x, c0y, terms, recon, maxAmp: terms[0].amp };
  return _pelicanFourierCache;
}

/**
 * Computes Act-I Fourier epicycle sweep state (`localT ∈ [0.12s, 2.28s]` -> `~1.62` full sweeps).
 */
function getFourierActState(localT, isOutroThumbnail) {
  if (isOutroThumbnail) {
    return { active: false, alpha: 0, uSweep: 1.62, theta: 1.62 * Math.PI * 2 };
  }
  const alpha = smoothstep(0.08, 0.24, localT) * (1 - smoothstep(2.05, 2.45, localT));
  const rawU = clamp((localT - 0.10) / 2.16, 0, 1);
  const uSweep = 1.62 * Math.pow(rawU, 0.92);
  const theta = uSweep * Math.PI * 2;
  return { active: alpha > 0.015, alpha, uSweep, theta };
}

function evalCubicBezier(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  const x = mt2 * mt * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t2 * t * p3.x;
  const y = mt2 * mt * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t2 * t * p3.y;
  const dx = 3 * mt2 * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t2 * (p3.x - p2.x);
  const dy = 3 * mt2 * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t2 * (p3.y - p2.y);
  const ddx = 6 * mt * (p2.x - 2 * p1.x + p0.x) + 6 * t * (p3.x - 2 * p2.x + p1.x);
  const ddy = 6 * mt * (p2.y - 2 * p1.y + p0.y) + 6 * t * (p3.y - 2 * p2.y + p1.y);
  const len = Math.hypot(dx, dy) || 1;
  const kappa = (dx * ddy - dy * ddx) / Math.pow(len, 2.2);
  return { x, y, nx: -dy / len, ny: dx / len, kappa };
}

function drawFourPointStar(ctx, cx, cy, rOuter, rInner) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const r = i % 2 === 0 ? rOuter : rInner;
    if (i === 0) ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    else ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
}

// Interleaved Gradient Noise (Blue-Noise-like high-frequency dither, zero 8-bit banding!)
function ignNoise(x, y) {
  const v = 52.9829189 * ((0.06711056 * x + 0.00583715 * y) % 1);
  return v - Math.floor(v);
}

/**
 * 1. Bakes Flagship Nano-Texture OLED Dark Optical Workbench (`1000x1000`):
 *    - Pixel-level blue-noise dithered obsidian glass field (zero gradient banding!)
 *    - Focal-falloff precision grid + multi-pass glowing Fibonacci Golden Spiral (`φ = 1.6180339`)
 *    - Luminous `y = 680` vector horizon & obsidian mirror reflection stage.
 */
function getOLEDWorkbench(kit) {
  return kit.bake2D('s20_oled_workbench_r3', (_g, ctx) => {
    const img = ctx.createImageData(PANEL_SIZE, PANEL_SIZE);
    const data = img.data;
    const fx = 648;
    const fy = 515;

    for (let y = 0; y < PANEL_SIZE; y++) {
      const isFloor = y >= ROAD_EDGE_Y;
      const floorV = isFloor ? (y - ROAD_EDGE_Y) / (PANEL_SIZE - ROAD_EDGE_Y) : 0;
      for (let x = 0; x < PANEL_SIZE; x++) {
        const idx = (y * PANEL_SIZE + x) * 4;
        const distF = Math.hypot((x - fx) * 0.92, y - fy);
        const distC = Math.hypot(x - 500, y - 500);
        const stageGlow = Math.exp(-(distF * distF) / (2 * 310 * 310));
        const vig = 1 - 0.34 * Math.pow(distC / 710, 2.1);
        // Nano-texture anti-glare micro-dither (±2.8/255)
        const dither = (ignNoise(x, y) - 0.5) * 5.2;

        let r = (7 + stageGlow * 13) * vig + dither;
        let g = (11 + stageGlow * 28) * vig + dither;
        let b = (20 + stageGlow * 48) * vig + dither * 1.15;

        if (isFloor) {
          const horizonRim = Math.exp(-floorV * 11) * 18;
          r = r * lerp(0.88, 0.52, floorV) + horizonRim * 0.35;
          g = g * lerp(0.92, 0.55, floorV) + horizonRim * 0.85;
          b = b * lerp(0.98, 0.62, floorV) + horizonRim * 1.35;
        }

        data[idx] = clamp(r, 0, 255) | 0;
        data[idx + 1] = clamp(g, 0, 255) | 0;
        data[idx + 2] = clamp(b, 0, 255) | 0;
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    // Focal-falloff 20px minor & 100px major coordinate grid above y=680
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, PANEL_SIZE, ROAD_EDGE_Y);
    ctx.clip();

    ctx.strokeStyle = 'rgba(88, 166, 255, 0.032)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let v = 20; v < PANEL_SIZE; v += 20) {
      if (v % 100 === 0) continue;
      ctx.moveTo(v, 0);
      ctx.lineTo(v, ROAD_EDGE_Y);
      if (v < ROAD_EDGE_Y) {
        ctx.moveTo(0, v);
        ctx.lineTo(PANEL_SIZE, v);
      }
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(125, 211, 252, 0.085)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    for (let v = 100; v < PANEL_SIZE; v += 100) {
      ctx.moveTo(v, 0);
      ctx.lineTo(v, ROAD_EDGE_Y);
      if (v < ROAD_EDGE_Y) {
        ctx.moveTo(0, v);
        ctx.lineTo(PANEL_SIZE, v);
      }
    }
    ctx.stroke();

    // Precision micro-fiducial '+' crosshairs
    ctx.strokeStyle = 'rgba(126, 231, 135, 0.22)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    for (let gx = 100; gx <= 900; gx += 100) {
      for (let gy = 100; gy <= 600; gy += 100) {
        ctx.moveTo(gx - 3, gy);
        ctx.lineTo(gx + 3, gy);
        ctx.moveTo(gx, gy - 3);
        ctx.lineTo(gx, gy + 3);
      }
    }
    ctx.stroke();
    ctx.restore();

    // Top & Right Edge Vernier Rulers
    ctx.fillStyle = 'rgba(148, 163, 184, 0.48)';
    ctx.font = '400 9.5px "PelicanMono", monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'right';
    for (let x = 600; x <= 900; x += 100) ctx.fillText(String(x), x - 4, 8);
    for (let y = 100; y <= 900; y += 100) ctx.fillText(String(y), PANEL_SIZE - 10, y + 4);

    // Sacred Geometry Stage: Dual-Pass Optical Bloom Fibonacci Golden Spiral (`[390..952] x [210..568]`)
    ctx.save();
    const cx = 690;
    const cy = 468;
    ctx.strokeStyle = 'rgba(88, 166, 255, 0.12)';
    ctx.setLineDash([5, 6]);
    ctx.lineWidth = 0.95;
    ctx.beginPath();
    ctx.arc(cx, cy, 256, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(192, 132, 252, 0.12)';
    ctx.beginPath();
    ctx.arc(cx, cy, 256 / 1.6180339, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    for (let deg = 0; deg < 360; deg += 15) {
      const rad = (deg * Math.PI) / 180;
      const r0 = deg % 45 === 0 ? 247 : 252;
      ctx.strokeStyle = deg % 45 === 0 ? 'rgba(125, 211, 252, 0.28)' : 'rgba(88, 166, 255, 0.14)';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(rad) * r0, cy + Math.sin(rad) * r0);
      ctx.lineTo(cx + Math.cos(rad) * 256, cy + Math.sin(rad) * 256);
      ctx.stroke();
    }

    // Golden Rectangle spans x=384..948 (so left edge peeks softly behind the 72% translucent IDE!)
    let rx = 384;
    let ry = 224;
    let rw = 564;
    let rh = 348.5; // 564 / 348.5 = 1.6183
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.14)';
    ctx.lineWidth = 0.85;
    ctx.strokeRect(rx, ry, rw, rh);

    const spiralArcs = [];
    for (let step = 0; step < 7; step++) {
      const dir = step % 4;
      if (dir === 0) {
        const s = rh;
        ctx.strokeRect(rx, ry, s, s);
        spiralArcs.push({ ax: rx + s, ay: ry + s, r: s, a0: Math.PI, a1: Math.PI * 1.5 });
        rx += s;
        rw -= s;
      } else if (dir === 1) {
        const s = rw;
        ctx.strokeRect(rx, ry, s, s);
        spiralArcs.push({ ax: rx, ay: ry + s, r: s, a0: Math.PI * 1.5, a1: Math.PI * 2 });
        ry += s;
        rh -= s;
      } else if (dir === 2) {
        const s = rh;
        ctx.strokeRect(rx + rw - s, ry, s, s);
        spiralArcs.push({ ax: rx + rw - s, ay: ry, r: s, a0: 0, a1: Math.PI * 0.5 });
        rw -= s;
      } else {
        const s = rw;
        ctx.strokeRect(rx, ry + rh - s, s, s);
        spiralArcs.push({ ax: rx + s, ay: ry + rh - s, r: s, a0: Math.PI * 0.5, a1: Math.PI });
        rh -= s;
      }
    }

    const spGrad = ctx.createLinearGradient(384, 224, 948, 572);
    spGrad.addColorStop(0.0, 'rgba(56, 189, 248, 0.42)');
    spGrad.addColorStop(0.52, 'rgba(192, 132, 252, 0.48)');
    spGrad.addColorStop(1.0, 'rgba(251, 146, 60, 0.54)');

    // Pass 1: Soft optical bloom along Golden Spiral; Pass 2: Razor 1.2px core
    for (const [blur, lw, al] of [[10, 3.2, 0.35], [0, 1.35, 0.95]]) {
      ctx.save();
      ctx.globalAlpha = al;
      ctx.shadowColor = '#7dd3fc';
      ctx.shadowBlur = blur;
      ctx.strokeStyle = spGrad;
      ctx.lineWidth = lw;
      ctx.beginPath();
      for (const arc of spiralArcs) ctx.arc(arc.ax, arc.ay, Math.max(1, arc.r), arc.a0, arc.a1);
      ctx.stroke();
      ctx.restore();
    }

    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(251, 146, 60, 0.72)';
    ctx.font = '400 10.5px "PelicanMono", monospace';
    ctx.fillText('φ = 1.6180339887 · EULER-FIBONACCI SPIRAL', 948, 208);
    ctx.restore();

    // Subtle perspective obsidian floor grid below y = 680
    ctx.strokeStyle = 'rgba(88, 166, 255, 0.055)';
    ctx.lineWidth = 0.85;
    for (let i = -8; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(500 + i * 65, ROAD_EDGE_Y);
      ctx.lineTo(500 + i * 158, PANEL_SIZE);
      ctx.stroke();
    }
    for (const fyLine of [720, 772, 838, 916]) {
      ctx.beginPath();
      ctx.moveTo(0, fyLine);
      ctx.lineTo(PANEL_SIZE, fyLine);
      ctx.stroke();
    }

    // Millimeter vernier ticks & luminous y = 680 vector horizon
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.36)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    for (let x = 0; x <= PANEL_SIZE; x += 20) {
      ctx.moveTo(x, ROAD_EDGE_Y);
      ctx.lineTo(x, ROAD_EDGE_Y + (x % 100 === 0 ? 9 : 4.5));
    }
    ctx.stroke();

    ctx.save();
    ctx.strokeStyle = '#60a5fa';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 14;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(0, ROAD_EDGE_Y);
    ctx.lineTo(PANEL_SIZE, ROAD_EDGE_Y);
    ctx.stroke();
    ctx.restore();

    // Clean Engineering Footer Status Bar at y = 948
    ctx.fillStyle = 'rgba(9, 13, 23, 0.78)';
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.18)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.roundRect(32, 946, 912, 26, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#7ee787';
    ctx.beginPath();
    ctx.arc(48, 959, 3.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.86)';
    ctx.font = '400 11px "PelicanMono", monospace';
    ctx.fillText(
      'SVG 2.0 BARYCENTRIC SILK ENGINE  ·  <line id="road-axis" x1="0" y1="680" x2="1000" y2="680"/>  ·  NANO-OLED 60FPS',
      62,
      959.5
    );
  });
}

/**
 * Computes the live Act-II (`localT 2.32..4.68s`) interactive Bezier tweak offset when the
 * white Direct-Selection pointer drags the gular-pouch control handle `■—○`!
 */
function getLiveTweakState(rig, localT, isOutroThumbnail) {
  if (!rig || isOutroThumbnail || localT < 2.30 || localT > 4.72) {
    return { active: false, env: 0, dragging: 0, dx: 0, dy: 0 };
  }
  const env = smoothstep(2.30, 2.60, localT) * smoothstep(4.72, 4.42, localT);
  const dragging = smoothstep(2.56, 2.80, localT) * smoothstep(4.56, 4.30, localT);
  const phase = ((localT - 2.60) / BEAT_SEC) * Math.PI;
  const dx = Math.sin(phase) * 7.5 * dragging;
  const dy = Math.cos(phase * 2) * 8.5 * dragging;
  return { active: env > 0.02, env, dragging, dx, dy };
}

/**
 * 2. Draws the Single Consolidated 72%-Translucent Frosted-Glass Flagship IDE Window at `(32, 32)`:
 *    - Merges Era Title (`20 · 代码美学 — 2020s · Generative SVG Code Art`) into Window Chrome!
 *    - Act I (`localT < 2.35s`): Live `Σ c_k · exp(i·k·ω·t)` header & 16-bar `|c_k|` DFT spectrum!
 *    - Act II & III: Inline IDE color-preview swatches (`■`), SVG `<path>` Bezier live binding!
 */
function drawConsolidatedGlassIDE(ctx, rig, localT, tweak, fourier, isOutroThumbnail) {
  const ex = 32;
  const ey = 32;
  const ew = 504;
  const eh = 332; // Bottom at y = 364! Leaves y = 370..680 (310px!) 100% open!
  const dft = getPelicanFourierData();

  ctx.save();
  // Soft studio drop shadow + 72% translucent frosted glass (#85 Director Spec!)
  ctx.shadowColor = 'rgba(0, 0, 0, 0.46)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = 'rgba(10, 15, 26, 0.72)';
  ctx.beginPath();
  ctx.roundRect(ex, ey, ew, eh, 11);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Inner glass specular rim (`0.9px`)
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.22)';
  ctx.lineWidth = 0.95;
  ctx.beginPath();
  ctx.roundRect(ex, ey, ew, eh, 11);
  ctx.stroke();

  const topSpec = ctx.createLinearGradient(ex, ey, ex + ew, ey);
  topSpec.addColorStop(0.0, 'rgba(125, 211, 252, 0.75)');
  topSpec.addColorStop(0.5, 'rgba(196, 181, 253, 0.55)');
  topSpec.addColorStop(1.0, 'rgba(251, 146, 60, 0.65)');
  ctx.strokeStyle = topSpec;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(ex + 12, ey + 0.8);
  ctx.lineTo(ex + ew - 12, ey + 0.8);
  ctx.stroke();

  // Tier 1: Native IDE Window Title Bar (`height = 36px`) housing `20 · 代码美学 — 2020s`!
  ctx.fillStyle = 'rgba(18, 26, 44, 0.68)';
  ctx.beginPath();
  ctx.roundRect(ex + 1, ey + 1, ew - 2, 36, [10, 10, 0, 0]);
  ctx.fill();

  const dots = ['#f87171', '#fbbf24', '#4ade80'];
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = dots[i];
    ctx.beginPath();
    ctx.arc(ex + 16 + i * 13, ey + 19, 3.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#38bdf8';
  ctx.font = '700 13.5px "PelicanMono", monospace';
  ctx.fillText('20', ex + 58, ey + 19.5);

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 18.5px "PelicanSans", sans-serif';
  ctx.fillText('代码美学', ex + 82, ey + 19);

  ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
  ctx.font = '400 12px "PelicanMono", monospace';
  ctx.fillText('—', ex + 164, ey + 19.5);

  ctx.fillStyle = '#bae6fd';
  ctx.font = '500 12px "PelicanMono", monospace';
  ctx.fillText('2020s · Generative SVG Code Art', ex + 180, ey + 19.5);

  // Tier 2: Active Tab & Breadcrumb Bar (`ey + 37 .. ey + 63`)
  ctx.fillStyle = 'rgba(8, 12, 22, 0.52)';
  ctx.fillRect(ex + 1, ey + 37, ew - 2, 25);
  ctx.fillStyle = 'rgba(30, 41, 68, 0.72)';
  ctx.beginPath();
  ctx.roundRect(ex + 8, ey + 39, 198, 23, [6, 6, 0, 0]);
  ctx.fill();

  // Tiny SVG vector diamond icon inside active tab
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.2;
  ctx.save();
  ctx.translate(ex + 21, ey + 50.5);
  ctx.rotate(Math.PI / 4);
  ctx.strokeRect(-3.6, -3.6, 7.2, 7.2);
  ctx.restore();

  ctx.fillStyle = '#f1f5f9';
  ctx.font = '600 11.5px "PelicanMono", monospace';
  ctx.fillText('pelican_finale_20.svg  ×', ex + 33, ey + 51);

  const isFourierPhase = !isOutroThumbnail && localT < 2.25;
  ctx.fillStyle = 'rgba(148, 163, 184, 0.68)';
  ctx.font = '400 10.5px "PelicanMono", monospace';
  ctx.fillText(isFourierPhase ? 'dft ▸ epicycle_genesis' : 'finale ▸ #20_silk_mesh', ex + 218, ey + 51);

  ctx.fillStyle = isFourierPhase
    ? 'rgba(253, 224, 71, 0.18)'
    : tweak.dragging > 0.1
      ? 'rgba(251, 146, 60, 0.24)'
      : 'rgba(126, 231, 135, 0.18)';
  ctx.beginPath();
  ctx.roundRect(ex + ew - 126, ey + 41, 116, 18, 9);
  ctx.fill();
  ctx.fillStyle = isFourierPhase ? '#fde047' : tweak.dragging > 0.1 ? '#fb923c' : '#7ee787';
  ctx.font = '700 9.6px "PelicanMono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    isFourierPhase ? 'FOURIER DFT N=36' : tweak.dragging > 0.1 ? 'LIVE BEZIER' : 'SILK MESH 100%',
    ex + ew - 68,
    ey + 50.5
  );

  // Live dynamic coordinates bound 1:1 to `rig` + Act-II interactive handle tweak!
  const rx = Math.round(rig ? rig.root.x : 500);
  const hdx = Math.round(rig ? rig.head.x : 520);
  const hdy = Math.round(rig ? rig.head.y : 474);
  const nc1x = Math.round(rig ? rig.neckC1.x : 530);
  const nc1y = Math.round(rig ? rig.neckC1.y : 516);
  const nc2x = Math.round(rig ? rig.neckC2.x : 508);
  const nc2y = Math.round(rig ? rig.neckC2.y : 492);
  const pbx = Math.round((rig ? rig.pouchBelly.x : 558) + tweak.dx);
  const pby = Math.round((rig ? rig.pouchBelly.y : 513) + tweak.dy);
  const btx = Math.round(rig ? rig.beakTip.x : 596);
  const bty = Math.round(rig ? rig.beakTip.y : 481);
  const rkx = rig ? rig.rightKnee.x.toFixed(0) : '518';
  const rky = rig ? rig.rightKnee.y.toFixed(0) : '558';
  const deg = rig ? (((rig.pedalAngle * 180) / Math.PI) % 360).toFixed(0).padStart(3, '0') : '045';

  const C_TAG = '#7ee787';
  const C_ATTR = '#79c0ff';
  const C_VAL = '#d2a8ff';
  const C_NUM = '#ffa657';
  const C_CMT = '#8b949e';

  // Segments support `{ swatch: '#hex' }` inline IDE color preview squares!
  const codeLines = [
    [[`<svg `, C_TAG], [`viewBox=`, C_ATTR], [`"0 0 1000 1000" `, C_VAL], [`data-phi=`, C_ATTR], [`"1.618"`, C_NUM], [`>`, C_TAG]],
    [[`  <defs>`, C_TAG], [` <!-- Barycentric Silk & Delaunay Amber -->`, C_CMT]],
    [[`    <linearGradient `, C_TAG], [`id=`, C_ATTR], [`"silk" `, C_VAL], [`stops=`, C_ATTR], [`"`, C_VAL], [`■`, '#ffffff', true], [`#fff `, C_VAL], [`■`, '#7dd3fc', true], [`#7dd3fc `, C_VAL], [`■`, '#c4b5fd', true], [`#c4b5fd"`, C_VAL], [`/>`, C_TAG]],
    [[`    <radialGradient `, C_TAG], [`id=`, C_ATTR], [`"amber" `, C_VAL], [`stops=`, C_ATTR], [`"`, C_VAL], [`■`, '#fde047', true], [`#fde047 `, C_VAL], [`■`, '#fb7185', true], [`#fb7185"`, C_VAL], [`/>`, C_TAG]],
    [[`  </defs>`, C_TAG]],
    [[`  <!-- G2 Fillet Bike + 2-Bone IK: θ=${deg}° knee=(${rkx},${rky}) -->`, C_CMT]],
    [[`  <g `, C_TAG], [`id=`, C_ATTR], [`"g2-ti-bike" `, C_VAL], [`x=`, C_ATTR], [`"${rx}" `, C_NUM], [`y=`, C_ATTR], [`"680"`, C_NUM], [`>`, C_TAG]],
    [[`    <circle `, C_TAG], [`cx=`, C_ATTR], [`"${rx - 86}" `, C_NUM], [`cy=`, C_ATTR], [`"634" `, C_NUM], [`r=`, C_ATTR], [`"46" `, C_NUM], [`/>`, C_TAG]],
    [[`    <circle `, C_TAG], [`cx=`, C_ATTR], [`"${rx + 86}" `, C_NUM], [`cy=`, C_ATTR], [`"634" `, C_NUM], [`r=`, C_ATTR], [`"46" `, C_NUM], [`/>`, C_TAG]],
    [[`  </g>`, C_TAG]],
    [[`  <path `, C_TAG], [`id=`, C_ATTR], [`"g2-neck" `, C_VAL], [`d=`, C_ATTR], [`"C ${nc1x},${nc1y} ${nc2x},${nc2y} ${hdx},${hdy}"`, C_NUM], [`/>`, C_TAG]],
    [[`  <path `, C_TAG], [`id=`, C_ATTR], [`"pouch" `, C_VAL], [`d=`, C_ATTR], [`"Q ${pbx},${pby} ${btx},${bty}" `, tweak.dragging > 0.1 ? '#fde047' : C_NUM], [`fill=`, C_ATTR], [`"url(#amber)"`, C_VAL], [`/>`, C_TAG]],
    [[`</svg>`, C_TAG]],
  ];

  const lineLengths = codeLines.map((segs) => segs.reduce((acc, [s]) => acc + s.length, 0));
  const totalChars = lineLengths.reduce((a, b) => a + b, 0);

  // Smooth Act-I Fourier Mathematical Header + 16-bar `|c_k|` spectrum (`localT < 2.35s`)!
  const fourierBannerEnv = isOutroThumbnail ? 0 : 1 - smoothstep(1.96, 2.35, localT);

  // Non-uniform LLM token-chunk burst cadence (`localT 0..2.15s`)!
  let streamFrac = 1.0;
  if (!isOutroThumbnail && localT < 2.18) {
    const u = clamp(localT / 2.15, 0, 1);
    const burst = u + 0.022 * Math.sin(u * Math.PI * 14);
    streamFrac = clamp(0.24 + burst * 0.76, 0, 1);
  }
  let remainingChars = Math.floor(totalChars * streamFrac);

  ctx.save();
  ctx.beginPath();
  ctx.rect(ex + 2, ey + 64, ew - 4, eh - 68);
  ctx.clip();

  // Act I Inline Mathematical Header & Mini 16-Bar Harmonic Spectrum (`|c_k|`)
  if (fourierBannerEnv > 0.01) {
    const bx = ex + 10;
    const by = ey + 68 - (1 - fourierBannerEnv) * 68;
    const bw = ew - 20;
    const bh = 62;

    ctx.save();
    ctx.globalAlpha = fourierBannerEnv;
    ctx.fillStyle = 'rgba(13, 21, 38, 0.86)';
    ctx.strokeStyle = 'rgba(88, 166, 255, 0.34)';
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 7);
    ctx.fill();
    ctx.stroke();

    // Left Column: Inline Mathematical Comment + `Σ c_k · exp(i·k·ω·t)` + Live Sweep Readout
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '400 9.8px "PelicanMono", monospace';
    ctx.fillStyle = '#8b949e';
    ctx.fillText('/* Act I · Complex DFT Epicycle Genesis (N=36) */', bx + 10, by + 13);

    // Formula with syntax-highlighted math tokens
    const fy = by + 31.5;
    ctx.font = '600 11.4px "PelicanMono", monospace';
    const mathSegs = [
      ['z(t) = c₀ + ', '#e6edf3'],
      ['Σ ', '#fde047'],
      ['c_k', '#58a6ff'],
      [' · ', '#94a3b8'],
      ['exp(i·k·ω·t)', '#d2a8ff'],
    ];
    let mx = bx + 10;
    for (const [mTxt, mCol] of mathSegs) {
      ctx.fillStyle = mCol;
      ctx.fillText(mTxt, mx, fy);
      mx += ctx.measureText(mTxt).width;
    }

    const rIdx = ((Math.floor(fourier.uSweep * FOURIER_RECON_SAMPLES) % FOURIER_RECON_SAMPLES) + FOURIER_RECON_SAMPLES) % FOURIER_RECON_SAMPLES;
    const tipLocal = dft.recon[rIdx];
    const tipWorldX = Math.round((rig ? rig.root.x : 240) + tipLocal.x);
    const tipWorldY = Math.round((rig ? rig.root.y : ROAD_EDGE_Y) + tipLocal.y);
    ctx.font = '400 9.8px "PelicanMono", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(
      `ωt = ${(fourier.uSweep * 2).toFixed(2)}π rad  ·  pen=(${tipWorldX},${tipWorldY})`,
      bx + 10,
      by + 49
    );

    // Subtle divider between equation & 16-bar harmonic spectrum
    const divX = bx + 292;
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.20)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(divX, by + 8);
    ctx.lineTo(divX, by + bh - 8);
    ctx.stroke();

    // Right Column: Mini 16-Bar Harmonic Amplitude Spectrum (`|c_k|`)
    const sx0 = divX + 10;
    const sw = bw - (divX - bx) - 18;
    const baseAxisY = by + 53;
    ctx.font = '600 8.6px "PelicanMono", monospace';
    ctx.fillStyle = 'rgba(186, 230, 253, 0.82)';
    ctx.fillText('|c_k| SPECTRUM (16 HARMONICS)', sx0, by + 11.5);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.beginPath();
    ctx.moveTo(sx0, baseAxisY + 0.5);
    ctx.lineTo(sx0 + sw, baseAxisY + 0.5);
    ctx.stroke();

    const barPitch = sw / 16;
    const barW = Math.max(4.5, barPitch - 2.6);
    for (let b = 0; b < 16; b++) {
      const term = dft.terms[b];
      const normA = Math.pow(term.amp / dft.maxAmp, 0.44);
      const liveMod = 0.86 + 0.14 * Math.cos(term.k * fourier.theta + term.phase);
      const bhPx = clamp(normA * 32 * liveMod, 2.5, 33);
      const bxBar = sx0 + b * barPitch + 0.8;
      const byBar = baseAxisY - bhPx;
      const isPos = term.k > 0;

      ctx.fillStyle = isPos ? 'rgba(88, 166, 255, 0.78)' : 'rgba(253, 224, 71, 0.82)';
      ctx.fillRect(bxBar, byBar, barW, bhPx);

      // Luminous peak cap
      ctx.fillStyle = isPos ? '#e0f2fe' : '#fef9c3';
      ctx.fillRect(bxBar, byBar - 1.2, barW, 1.4);
    }
    ctx.restore();
  }

  const rowH = 19.2;
  const startY = ey + 78 + fourierBannerEnv * 68;
  ctx.font = '400 11.5px "PelicanMono", monospace';

  let cursorX = ex + 38;
  let cursorY = startY;

  for (let i = 0; i < codeLines.length; i++) {
    if (remainingChars <= 0) break;
    const ly = startY + i * rowH;
    const lineLen = lineLengths[i];
    const isActiveLine = remainingChars <= lineLen && streamFrac < 1.0;
    const justClosed = remainingChars > lineLen && remainingChars - lineLen < 16 && streamFrac < 1.0;
    const isTweakedLine = i === 11 && tweak.dragging > 0.1;

    if (isActiveLine || justClosed || isTweakedLine) {
      ctx.fillStyle = justClosed
        ? 'rgba(126, 231, 135, 0.18)'
        : isTweakedLine
          ? 'rgba(251, 146, 60, 0.18)'
          : 'rgba(56, 189, 248, 0.14)';
      ctx.fillRect(ex + 4, ly - rowH * 0.48, ew - 8, rowH);
    }

    ctx.fillStyle = isTweakedLine ? '#fb923c' : isActiveLine ? '#38bdf8' : 'rgba(148, 163, 184, 0.58)';
    ctx.textAlign = 'right';
    ctx.fillText(String(i + 1).padStart(2, ' '), ex + 28, ly);

    ctx.textAlign = 'left';
    let tx = ex + 38;
    for (const [segText, segCol, isSwatch] of codeLines[i]) {
      if (remainingChars <= 0) break;
      const take = Math.min(segText.length, remainingChars);
      if (isSwatch) {
        // Crisp 8.5x8.5px IDE inline color preview swatch!
        ctx.fillStyle = segCol;
        ctx.fillRect(tx + 1, ly - 4.5, 8.5, 8.5);
        ctx.strokeStyle = 'rgba(255,255,255,0.65)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(tx + 1, ly - 4.5, 8.5, 8.5);
        tx += 12;
      } else {
        const sub = segText.slice(0, take);
        ctx.fillStyle = segCol;
        ctx.fillText(sub, tx, ly);
        tx += ctx.measureText(sub).width;
      }
      remainingChars -= take;
    }
    cursorX = tx + 2;
    cursorY = ly;
  }

  if (isOutroThumbnail || Math.sin(localT * 14) > -0.25) {
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.fillRect(cursorX, cursorY - 6.5, 6.5, 13);
    ctx.shadowBlur = 0;
  }
  ctx.restore();

  // Act I: Ultra-fine 0.75px callout spline from IDE `|c_k|` spectrum to live Epicycle Centroid!
  if (fourierBannerEnv > 0.18 && rig && rig.root.x > 80 && rig.root.x < 560) {
    const fLinkAlpha = fourierBannerEnv * smoothstep(80, 160, rig.root.x) * 0.34;
    if (fLinkAlpha > 0.02) {
      const fCx = rig.root.x + dft.c0x;
      const fCy = rig.root.y + dft.c0y;
      ctx.save();
      ctx.strokeStyle = `rgba(253, 224, 71, ${fLinkAlpha.toFixed(3)})`;
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(ex + ew, ey + 99);
      ctx.bezierCurveTo(ex + ew + 38, ey + 99, fCx - 36, fCy - 24, fCx, fCy);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Act II & III: Ultra-fine 0.75px Bezier leader callout splines from IDE rows 11 & 12 to live Pelican!
  if (fourierBannerEnv < 0.5 && rig && rig.root.x > 330 && rig.root.x < 920) {
    const linkAlpha =
      (1 - fourierBannerEnv) *
      smoothstep(330, 430, rig.root.x) *
      smoothstep(920, 820, rig.root.x) *
      0.36;
    if (linkAlpha > 0.02) {
      ctx.save();
      ctx.strokeStyle = `rgba(125, 211, 252, ${linkAlpha.toFixed(3)})`;
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 0.85;
      const y11 = startY + 10 * rowH;
      ctx.beginPath();
      ctx.moveTo(ex + ew, y11);
      ctx.bezierCurveTo(ex + ew + 42, y11, rig.neckC2.x - 42, rig.neckC2.y, rig.neckC2.x - 6, rig.neckC2.y);
      ctx.stroke();

      const y12 = startY + 11 * rowH;
      ctx.strokeStyle = `rgba(251, 146, 60, ${(linkAlpha + tweak.dragging * 0.28).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(ex + ew, y12);
      ctx.bezierCurveTo(
        ex + ew + 50, y12,
        rig.pouchBelly.x + tweak.dx - 45, rig.pouchBelly.y + tweak.dy,
        rig.pouchBelly.x + tweak.dx, rig.pouchBelly.y + tweak.dy
      );
      ctx.stroke();
      ctx.restore();
    }
  }

  ctx.restore();
}

/**
 * Hairline (`0.85~1.0px`) Bezier tangent handle (`■ anchor — ○ controlPt`) per #85 Director Spec!
 */
function drawBezierHandle(ctx, anchor, ctrl, lineCol, alpha, s = 1, highlight = false) {
  if (alpha <= 0.02) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = lineCol;
  ctx.lineWidth = (highlight ? 1.15 : 0.9) * s;
  ctx.beginPath();
  ctx.moveTo(anchor.x, anchor.y);
  ctx.lineTo(ctrl.x, ctrl.y);
  ctx.stroke();

  ctx.fillStyle = '#090d16';
  ctx.strokeStyle = highlight ? '#fef08a' : '#ffffff';
  ctx.lineWidth = (highlight ? 1.3 : 1.0) * s;
  ctx.beginPath();
  ctx.arc(ctrl.x, ctrl.y, (highlight ? 4.4 : 3.5) * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = lineCol;
  ctx.beginPath();
  ctx.arc(ctrl.x, ctrl.y, 1.6 * s, 0, Math.PI * 2);
  ctx.fill();

  const hs = 2.8 * s;
  ctx.fillStyle = '#38bdf8';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 0.85 * s;
  ctx.fillRect(anchor.x - hs, anchor.y - hs, hs * 2, hs * 2);
  ctx.strokeRect(anchor.x - hs, anchor.y - hs, hs * 2, hs * 2);
  ctx.restore();
}

/**
 * Analytical Normal Curvature Comb (`0.85px` precision hairline teeth + envelope).
 */
function drawCurvatureComb(ctx, p0, p1, p2, p3, opts = {}) {
  const {
    samples = 20,
    combSign = 1,
    baseLen = 15,
    color = '#38bdf8',
    envColor = '#f78166',
    alpha = 0.68,
    s = 1,
  } = opts;
  if (alpha <= 0.02) return;

  ctx.save();
  ctx.globalAlpha = alpha;
  const tips = [];
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.82 * s;
  ctx.beginPath();
  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    const pt = evalCubicBezier(p0, p1, p2, p3, u);
    const mag = (baseLen * (0.42 + 0.72 * Math.sin(Math.PI * u)) + Math.min(13, Math.abs(pt.kappa) * 900)) * s;
    const tx = pt.x + pt.nx * combSign * mag;
    const ty = pt.y + pt.ny * combSign * mag;
    tips.push({ x: tx, y: ty });
    ctx.moveTo(pt.x, pt.y);
    ctx.lineTo(tx, ty);
  }
  ctx.stroke();

  ctx.strokeStyle = envColor;
  ctx.lineWidth = 0.95 * s;
  ctx.beginPath();
  for (let i = 0; i < tips.length; i++) {
    if (i === 0) ctx.moveTo(tips[i].x, tips[i].y);
    else ctx.lineTo(tips[i].x, tips[i].y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawPolarGeometricRing(ctx, cx, cy, r, angle, alpha, accent = '#38bdf8') {
  if (alpha <= 0.02) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = accent;
  ctx.setLineDash([4, 6]);
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (r - 3.5), Math.sin(a) * (r - 3.5));
    ctx.lineTo(Math.cos(a) * (r + 3.5), Math.sin(a) * (r + 3.5));
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Act III (`localT ∈ [4.65s, 6.00s]`): Two ultra-delicate golden harmonic epicycle orbit rings
 * + 3 tiny orbiting satellite phase dots around each CNC wheel as a mathematical callback!
 */
function drawHarmonicWheelOrbits(ctx, w, effT, alpha, s = 1, phaseOffset = 0) {
  if (alpha <= 0.02) return;
  const rInnerOrbit = w.r + 7.5 * s;
  const rOuterOrbit = w.r + 15.8 * s;

  ctx.save();
  ctx.translate(w.x, w.y);
  ctx.globalAlpha = alpha;

  // Inner golden harmonic orbit ring (`0.80px` luminous gold)
  ctx.strokeStyle = 'rgba(253, 224, 71, 0.72)';
  ctx.lineWidth = 0.80 * s;
  ctx.beginPath();
  ctx.arc(0, 0, rInnerOrbit, 0, Math.PI * 2);
  ctx.stroke();

  // Outer champagne-gold harmonic epicycle ring (`0.72px`, counter-rotating quadrature dash)
  ctx.save();
  ctx.rotate(-w.angle * 0.45 + phaseOffset);
  ctx.strokeStyle = 'rgba(254, 240, 138, 0.56)';
  ctx.setLineDash([6 * s, 4 * s]);
  ctx.lineWidth = 0.72 * s;
  ctx.beginPath();
  ctx.arc(0, 0, rOuterOrbit, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // 3 tiny orbiting satellite phase dots (coupled epicycle sub-rings + glowing phase nodes)
  const satellites = [
    { rOrb: rInnerOrbit, rSub: 4.5 * s, omega: 2.2, kSub: -3.0, base: 0.0, col: '#fde047' },
    { rOrb: rOuterOrbit, rSub: 5.0 * s, omega: -1.6, kSub: 4.0, base: (Math.PI * 2) / 3, col: '#fef9c3' },
    { rOrb: rInnerOrbit, rSub: 4.0 * s, omega: 3.1, kSub: -5.0, base: (Math.PI * 4) / 3, col: '#7dd3fc' },
  ];

  for (let i = 0; i < satellites.length; i++) {
    const sat = satellites[i];
    const phi = sat.base + phaseOffset + effT * sat.omega + w.angle * 0.35;
    const cx = Math.cos(phi) * sat.rOrb;
    const cy = Math.sin(phi) * sat.rOrb;
    const subAng = effT * sat.kSub * 1.8 + i * 1.7;
    const sx = cx + Math.cos(subAng) * sat.rSub;
    const sy = cy + Math.sin(subAng) * sat.rSub;

    // Delicate miniature epicycle sub-circle & phase vector
    ctx.strokeStyle = 'rgba(253, 224, 71, 0.62)';
    ctx.lineWidth = 0.68 * s;
    ctx.beginPath();
    ctx.arc(cx, cy, sat.rSub, 0, Math.PI * 2);
    ctx.moveTo(cx, cy);
    ctx.lineTo(sx, sy);
    ctx.stroke();

    // Orbit carrier micro-node
    ctx.fillStyle = '#fef9c3';
    ctx.beginPath();
    ctx.arc(cx, cy, 1.3 * s, 0, Math.PI * 2);
    ctx.fill();

    // Glowing satellite phase dot
    ctx.save();
    ctx.shadowColor = sat.col;
    ctx.shadowBlur = 7;
    ctx.fillStyle = sat.col;
    ctx.beginPath();
    ctx.arc(sx, sy, 2.35 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Act I (`localT ∈ [0.12s, 2.25s]`): Renders the live 36-harmonic nested Complex Fourier Epicycles
 * (`Σ c_k · e^{i k ω θ}`) centered on the moving pelican rig + luminous phosphor contour trail!
 */
function drawFourierEpicycles(ctx, rig, fourier, isReflection = false) {
  if (!fourier.active || fourier.alpha <= 0.015) return;

  const dft = getPelicanFourierData();
  const s = rig.root.scale;
  // Couple origin to live rig X and 60% of subtle saddle bob so closed contour locks onto mesh!
  const canonicalBodyY = ROAD_EDGE_Y - 136 * s;
  const bobDy = (rig.bodyCenter.y - canonicalBodyY) * 0.62;
  const ox = rig.root.x;
  const oy = rig.root.y + bobDy;

  // Evaluate live N = 36 nested epicycle joint positions P_0 .. P_N at instantaneous `fourier.theta`
  const terms = dft.terms;
  const jointsX = new Float64Array(terms.length + 1);
  const jointsY = new Float64Array(terms.length + 1);
  let jx = ox + dft.c0x * s;
  let jy = oy + dft.c0y * s;
  jointsX[0] = jx;
  jointsY[0] = jy;

  for (let i = 0; i < terms.length; i++) {
    const t = terms[i];
    const ang = t.k * fourier.theta + t.phase;
    jx += t.amp * s * Math.cos(ang);
    jy += t.amp * s * Math.sin(ang);
    jointsX[i + 1] = jx;
    jointsY[i + 1] = jy;
  }

  const tipX = jointsX[terms.length];
  const tipY = jointsY[terms.length];

  ctx.save();
  ctx.globalAlpha = fourier.alpha * (isReflection ? 0.85 : 1.0);

  // 1. Nested Rotating Orbital Circles (`0.72..0.85px` translucent cyan `#58a6ff` & gold `#fde047`)
  if (!isReflection) {
    // Subtle radial optical field + polar ticks on fundamental harmonic circle `c_1`
    const r0 = terms[0].amp * s;
    const c0Grad = ctx.createRadialGradient(jointsX[0], jointsY[0], 2 * s, jointsX[0], jointsY[0], r0);
    c0Grad.addColorStop(0.0, 'rgba(88, 166, 255, 0.10)');
    c0Grad.addColorStop(0.7, 'rgba(253, 224, 71, 0.04)');
    c0Grad.addColorStop(1.0, 'rgba(88, 166, 255, 0)');
    ctx.fillStyle = c0Grad;
    ctx.beginPath();
    ctx.arc(jointsX[0], jointsY[0], r0, 0, Math.PI * 2);
    ctx.fill();

    // 16 polar vernier ticks around primary epicycle ring + precision crosshair at DC centroid P_0
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.34)';
    ctx.lineWidth = 0.72 * s;
    ctx.beginPath();
    for (let q = 0; q < 16; q++) {
      const qa = (q * Math.PI) / 8;
      const tLen = (q % 4 === 0 ? 4.2 : 2.2) * s;
      ctx.moveTo(jointsX[0] + Math.cos(qa) * (r0 - tLen), jointsY[0] + Math.sin(qa) * (r0 - tLen));
      ctx.lineTo(jointsX[0] + Math.cos(qa) * (r0 + tLen * 0.5), jointsY[0] + Math.sin(qa) * (r0 + tLen * 0.5));
    }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(253, 224, 71, 0.82)';
    ctx.lineWidth = 0.88 * s;
    ctx.beginPath();
    ctx.moveTo(jointsX[0] - 5 * s, jointsY[0]);
    ctx.lineTo(jointsX[0] + 5 * s, jointsY[0]);
    ctx.moveTo(jointsX[0], jointsY[0] - 5 * s);
    ctx.lineTo(jointsX[0], jointsY[0] + 5 * s);
    ctx.stroke();
  }

  const maxRings = isReflection ? 12 : terms.length;
  for (let i = 0; i < maxRings; i++) {
    const r = terms[i].amp * s;
    if (r < 1.0 * s) continue;
    const isGold = terms[i].k < 0;
    const ringAlpha = i === 0 ? 0.68 : i < 12 ? 0.78 : 0.48;
    ctx.strokeStyle = isGold
      ? `rgba(253, 224, 71, ${ringAlpha.toFixed(2)})`
      : `rgba(88, 166, 255, ${ringAlpha.toFixed(2)})`;
    ctx.lineWidth = (i === 0 ? 0.88 : i < 10 ? 0.78 : 0.68) * s;
    ctx.beginPath();
    ctx.arc(jointsX[i], jointsY[i], r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 2. Crisp Phase-Arm Vector Chain (`P_0 -> P_1 -> ... -> P_N`) + Luminous Joint Nodes
  ctx.strokeStyle = 'rgba(88, 166, 255, 0.36)';
  ctx.lineWidth = 2.4 * s;
  ctx.beginPath();
  ctx.moveTo(jointsX[0], jointsY[0]);
  for (let i = 1; i <= terms.length; i++) ctx.lineTo(jointsX[i], jointsY[i]);
  ctx.stroke();

  const armGrad = ctx.createLinearGradient(jointsX[0], jointsY[0], tipX, tipY);
  armGrad.addColorStop(0.0, '#7dd3fc');
  armGrad.addColorStop(0.5, '#e0f2fe');
  armGrad.addColorStop(0.82, '#fde047');
  armGrad.addColorStop(1.0, '#ffffff');
  ctx.strokeStyle = armGrad;
  ctx.lineWidth = 1.08 * s;
  ctx.beginPath();
  ctx.moveTo(jointsX[0], jointsY[0]);
  for (let i = 1; i <= terms.length; i++) ctx.lineTo(jointsX[i], jointsY[i]);
  ctx.stroke();

  if (!isReflection) {
    for (let i = 0; i < 22; i++) {
      const jr = (i === 0 ? 2.4 : i < 10 ? 1.8 : 1.15) * s;
      ctx.fillStyle = terms[i].k < 0 ? '#fde047' : '#ffffff';
      ctx.beginPath();
      ctx.arc(jointsX[i], jointsY[i], jr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // 3. Live-Traced Closed Fourier Pelican Curve + Luminous Phosphor Trail Persistence!
  const recon = dft.recon;
  const N_REC = recon.length;
  const uClamped = Math.min(1.0, fourier.uSweep);
  const fullSamples = Math.floor(uClamped * N_REC);

  if (fullSamples >= 1) {
    const traceGrad = ctx.createLinearGradient(ox - 92 * s, oy - 215 * s, ox + 98 * s, oy - 50 * s);
    traceGrad.addColorStop(0.0, '#38bdf8');
    traceGrad.addColorStop(0.48, '#e0f2fe');
    traceGrad.addColorStop(0.76, '#fde047');
    traceGrad.addColorStop(1.0, '#fb923c');

    // Pass 1: Soft cyan-gold phosphor bloom; Pass 2: Crisp glowing core contour
    const passes = isReflection ? [[0, 1.8, 0.72]] : [[9, 3.6, 0.42], [0, 1.55, 0.94]];
    for (const [blur, lw, al] of passes) {
      ctx.save();
      ctx.globalAlpha = fourier.alpha * al;
      if (blur > 0) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = blur;
      }
      ctx.strokeStyle = traceGrad;
      ctx.lineWidth = lw * s;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ox + recon[0].x * s, oy + recon[0].y * s);
      for (let m = 1; m <= fullSamples && m < N_REC; m++) {
        ctx.lineTo(ox + recon[m].x * s, oy + recon[m].y * s);
      }
      if (fourier.uSweep >= 1.0) {
        ctx.closePath();
      } else {
        ctx.lineTo(tipX, tipY);
      }
      ctx.stroke();
      ctx.restore();
    }
  }

  // Hot incandescent phosphor comet head trailing directly behind `tipX, tipY`!
  const headSpan = Math.min(fourier.uSweep, 0.28);
  const headSteps = Math.max(2, Math.floor(headSpan * N_REC));
  const curFloat = fourier.uSweep * N_REC;
  const curBaseIdx = Math.floor(curFloat);
  if (headSteps >= 2) {
    ctx.save();
    if (!isReflection) ctx.globalCompositeOperation = 'lighter';
    const BANDS = 5;
    for (let b = 0; b < BANDS; b++) {
      const f0 = b / BANDS;
      const f1 = (b + 1) / BANDS;
      const i0 = curBaseIdx - Math.floor((1 - f0) * headSteps);
      const i1 = curBaseIdx - Math.floor((1 - f1) * headSteps);
      if (i1 <= i0 && b < BANDS - 1) continue;
      ctx.strokeStyle =
        b >= BANDS - 2
          ? `rgba(254, 249, 195, ${(0.32 + 0.58 * f1 * fourier.alpha).toFixed(3)})`
          : `rgba(88, 166, 255, ${(0.14 + 0.36 * f1 * fourier.alpha).toFixed(3)})`;
      ctx.lineWidth = (1.1 + 1.5 * f1) * s;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let idx = i0; idx <= i1; idx++) {
        const wIdx = ((idx % N_REC) + N_REC) % N_REC;
        const px = ox + recon[wIdx].x * s;
        const py = oy + recon[wIdx].y * s;
        if (idx === i0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      if (b === BANDS - 1) ctx.lineTo(tipX, tipY);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 4. Glowing White-Gold Pen Tip at the end of the 36th Epicycle Arm!
  ctx.save();
  if (!isReflection) ctx.globalCompositeOperation = 'lighter';
  const tipHalo = ctx.createRadialGradient(tipX, tipY, 0.5 * s, tipX, tipY, 13 * s);
  tipHalo.addColorStop(0.0, 'rgba(255, 255, 255, 0.95)');
  tipHalo.addColorStop(0.35, 'rgba(253, 224, 71, 0.72)');
  tipHalo.addColorStop(0.72, 'rgba(88, 166, 255, 0.28)');
  tipHalo.addColorStop(1.0, 'rgba(88, 166, 255, 0)');
  ctx.fillStyle = tipHalo;
  ctx.beginPath();
  ctx.arc(tipX, tipY, 13 * s, 0, Math.PI * 2);
  ctx.fill();

  if (!isReflection) {
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#fde047';
    ctx.shadowBlur = 10;
    drawFourPointStar(ctx, tipX, tipY, 6.4 * s, 1.9 * s);
  }
  ctx.restore();

  ctx.restore();
}

/**
 * Core geometry & shading pass for the Haute-Couture Barycentric Silk Mesh Pelican + G2 Titanium Bike.
 * - Act I (`localT ∈ [0.12s, 1.85s]`): Suppresses silk-mesh fill (`meshAlpha ≈ 0`) so Fourier epicycles
 *   visibly birth the bird out of thin air, while preserving smooth `pelicanLocalX < 90` entry continuity!
 * - Transition (`localT ∈ [1.85s, 2.38s]`): Crystallizes all 22 silk facets smoothly (`meshAlpha: 0 -> 1`).
 * - Act II & III (`localT >= 2.38s`): Keeps 100% solid silk mesh & G2 bike with zero exit dissolve!
 */
function drawPelicanAndG2BikeBody(ctx, rig, effT, tweak, isOutroThumbnail, isReflection = false) {
  const s = rig.root.scale;
  const TOTAL_FACETS = 20;

  // Cross-frame entry bridge (`pelicanLocalX < 84`) so crossing `#19 -> #20` at x = 0 is 100% continuous!
  const entryBridge = isOutroThumbnail
    ? 0
    : (1 - smoothstep(4, 84, rig.root.x)) * smoothstep(-155, -20, rig.root.x);

  // Fresh crystallization shimmer as Fourier contour solidifies into 22-facet silk mesh (`1.85s..2.52s`)!
  const afterglow =
    !isReflection && !isOutroThumbnail
      ? smoothstep(1.85, 2.18, effT) * (1 - smoothstep(2.26, 2.68, effT))
      : 0;

  const getFacetState = (idx) => {
    if (isOutroThumbnail) return { wireAlpha: 0, bloom: 1.0, spark: 0.0 };
    // Stagger facet crystallization smoothly across `localT ∈ [1.84s, 2.38s]`
    const tStart = 1.84 + (idx / (TOTAL_FACETS - 1)) * 0.26; // 1.84s .. 2.10s -> 100% solid by 2.38s!
    const u = clamp((effT - tStart) / 0.28, 0, 1);
    const meshBloom = u * u * (3 - 2 * u);
    const isChassis = idx <= 3;
    const bloom = clamp(meshBloom + (isChassis ? 0.54 : 0.42) * entryBridge, 0, 1);

    // During Act I (`effT < 1.84s`), keep bird facets clear (`wireAlpha = 0` after entryBridge) so
    // trigonometry births the bird out of thin air, while bike chassis keeps a faint 0.22 CAD blueprint!
    const crystalWire = smoothstep(tStart - 0.14, tStart + 0.04, effT) * (1 - meshBloom);
    const chassisGhost = isChassis ? 0.22 : 0.0;
    const wireAlpha = clamp(Math.max(chassisGhost * (1 - bloom), crystalWire * 0.85, entryBridge * 0.65), 0, 1);
    const spark = !isReflection && u > 0.02 && u < 0.98 ? Math.sin(Math.PI * u) : 0;
    return { wireAlpha, bloom, spark };
  };

  const bodyAlpha = isOutroThumbnail
    ? 1.0
    : clamp(smoothstep(1.85, 2.34, effT) + 0.48 * entryBridge, 0, 1);
  const chassisAlpha = isOutroThumbnail
    ? 1.0
    : clamp(0.24 + 0.76 * smoothstep(1.82, 2.28, effT) + 0.50 * entryBridge, 0, 1);

  // ZERO heavy white borders! Translucent silk mesh fill + 0.65px delicate internal seam!
  const paintSilkFacet = (fillStyle, idx, wireCol = 'rgba(56, 189, 248, 0.82)', seamCol = 'rgba(186, 230, 253, 0.30)') => {
    const { wireAlpha, bloom, spark } = getFacetState(idx);
    if (wireAlpha <= 0.01 && bloom <= 0.01 && spark <= 0.02) return;

    if (wireAlpha > 0.015 && bloom < 0.99 && !isReflection) {
      ctx.save();
      ctx.globalAlpha = wireAlpha;
      ctx.strokeStyle = wireCol;
      ctx.lineWidth = 0.88 * s;
      ctx.stroke();
      ctx.restore();
    }

    if (bloom > 0.01) {
      ctx.save();
      ctx.globalAlpha = bloom * 0.95;
      ctx.fillStyle = fillStyle;
      ctx.fill();
      if (!isReflection && seamCol) {
        ctx.strokeStyle = seamCol;
        ctx.lineWidth = (0.68 + 0.45 * afterglow) * s;
        ctx.stroke();
      }
      ctx.restore();
    }

    const glowAmt = Math.max(spark * 0.88, afterglow * 0.42 * bloom);
    if (glowAmt > 0.04) {
      ctx.save();
      ctx.globalAlpha = glowAmt;
      ctx.strokeStyle = '#e0f2fe';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = spark > 0.05 ? 10 : 6;
      ctx.lineWidth = (spark > 0.05 ? 1.55 : 0.95) * s;
      ctx.stroke();
      ctx.restore();
    }
  };

  // 1. Precision Tangential-Laced Aero Wheels + Perforated Slotted CNC Disc Rotors!
  const drawPrecisionWheel = (w, facetIdx) => {
    const r = w.r;
    const innerRimR = r - 10.5 * s;
    const { bloom } = getFacetState(facetIdx);

    ctx.save();
    ctx.globalAlpha = chassisAlpha;

    // 24 Paired Tangential Bladed Spokes
    for (let i = 0; i < 24; i++) {
      const pairOff = i % 2 === 0 ? -0.055 : 0.055;
      const a = w.angle + Math.floor(i / 2) * ((Math.PI * 2) / 12) + pairOff;
      const shimmer = 0.38 + 0.62 * Math.abs(Math.sin(a * 2 - effT * 4.5));
      ctx.strokeStyle = i % 4 === 0 ? `rgba(216,180,254,${(shimmer * 0.82).toFixed(2)})` : `rgba(125,211,252,${(shimmer * 0.82).toFixed(2)})`;
      ctx.lineWidth = 0.95 * s;
      ctx.beginPath();
      ctx.moveTo(w.x + Math.cos(a + 0.48) * 8.5 * s, w.y + Math.sin(a + 0.48) * 8.5 * s);
      ctx.lineTo(w.x + Math.cos(a) * innerRimR, w.y + Math.sin(a) * innerRimR);
      ctx.stroke();
    }

    if (bloom > 0.02) {
      ctx.save();
      ctx.globalAlpha = bloom;
      const rimGrad = ctx.createLinearGradient(w.x - r, w.y - r, w.x + r, w.y + r);
      rimGrad.addColorStop(0.0, '#bae6fd');
      rimGrad.addColorStop(0.35, '#2563eb');
      rimGrad.addColorStop(0.72, '#1e1b4b');
      rimGrad.addColorStop(1.0, '#c084fc');
      ctx.strokeStyle = rimGrad;
      ctx.lineWidth = 8.4 * s;
      ctx.beginPath();
      ctx.arc(w.x, w.y, r - 5.2 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.strokeStyle = bloom > 0.5 ? '#0f172a' : '#38bdf8';
    ctx.lineWidth = (bloom > 0.5 ? 3.4 : 1.15) * s;
    ctx.beginPath();
    ctx.arc(w.x, w.y, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(186, 230, 253, 0.72)';
    ctx.lineWidth = 0.95 * s;
    ctx.beginPath();
    ctx.arc(w.x, w.y, innerRimR, 0, Math.PI * 2);
    ctx.stroke();

    // CNC Disc Brake Rotor with 10 Rotating Ventilated Cooling Slots!
    if (!isReflection) {
      ctx.save();
      ctx.translate(w.x, w.y);
      ctx.rotate(w.angle);
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.78)';
      ctx.lineWidth = 2.4 * s;
      ctx.beginPath();
      ctx.arc(0, 0, 12.8 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 1.4 * s;
      for (let k = 0; k < 10; k++) {
        const sa = (k * Math.PI * 2) / 10;
        ctx.beginPath();
        ctx.moveTo(Math.cos(sa) * 9.5 * s, Math.sin(sa) * 9.5 * s);
        ctx.lineTo(Math.cos(sa + 0.18) * 13.8 * s, Math.sin(sa + 0.18) * 13.8 * s);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(w.x, w.y, 4.2 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const drawIKLeg = (hipPt, kneePt, footPt, pedalPt, isFar) => {
    // Subtle blueprint IK stick during Act I, blooming into full warm leg gradient with `bodyAlpha`!
    ctx.save();
    ctx.globalAlpha = chassisAlpha;
    ctx.strokeStyle = isFar ? '#64748b' : '#e2e8f0';
    ctx.lineWidth = (bodyAlpha > 0.3 ? 3.4 : 1.4) * s;
    ctx.beginPath();
    ctx.moveTo(rig.bb.x, rig.bb.y);
    ctx.lineTo(pedalPt.x, pedalPt.y);
    ctx.stroke();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = (bodyAlpha > 0.3 ? 3.0 : 1.3) * s;
    ctx.beginPath();
    ctx.moveTo(pedalPt.x - 8 * s, pedalPt.y + 2.5 * s);
    ctx.lineTo(pedalPt.x + 8 * s, pedalPt.y + 2.5 * s);
    ctx.stroke();
    ctx.restore();

    if (bodyAlpha <= 0.02) {
      if (!isReflection) {
        ctx.save();
        ctx.strokeStyle = isFar ? 'rgba(88, 166, 255, 0.14)' : 'rgba(125, 211, 252, 0.22)';
        ctx.lineWidth = 0.85 * s;
        ctx.setLineDash([3 * s, 3 * s]);
        ctx.beginPath();
        ctx.moveTo(hipPt.x, hipPt.y);
        ctx.lineTo(kneePt.x, kneePt.y);
        ctx.lineTo(footPt.x, footPt.y);
        ctx.stroke();
        ctx.restore();
      }
      return;
    }

    ctx.save();
    ctx.globalAlpha = bodyAlpha;
    const legGrad = ctx.createLinearGradient(hipPt.x, hipPt.y, footPt.x, footPt.y);
    legGrad.addColorStop(0, isFar ? '#c2410c' : '#fde047');
    legGrad.addColorStop(0.5, isFar ? '#ea580c' : '#fb923c');
    legGrad.addColorStop(1, isFar ? '#9a3412' : '#f43f5e');

    ctx.strokeStyle = legGrad;
    ctx.lineWidth = 5.4 * s;
    ctx.beginPath();
    ctx.moveTo(hipPt.x, hipPt.y);
    ctx.lineTo(kneePt.x, kneePt.y);
    ctx.lineTo(footPt.x, footPt.y);
    ctx.stroke();

    ctx.fillStyle = isFar ? '#ea580c' : '#fb923c';
    ctx.beginPath();
    ctx.moveTo(footPt.x - 4 * s, footPt.y);
    ctx.lineTo(footPt.x + 16 * s, footPt.y + 1.5 * s);
    ctx.lineTo(footPt.x + 10 * s, footPt.y + 7.2 * s);
    ctx.lineTo(footPt.x - 5 * s, footPt.y + 5.2 * s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  drawIKLeg(rig.leftHip, rig.leftKnee, rig.leftFoot, rig.leftPedal, true);
  drawPrecisionWheel(rig.rearWheel, 0);
  drawPrecisionWheel(rig.frontWheel, 1);

  // 2. Articulated Roller Chain + 28-Tooth CNC Chainring & Cassette
  ctx.save();
  ctx.globalAlpha = chassisAlpha;
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.2 * s;
  for (const cr of [8.5, 6.0, 3.8]) {
    ctx.beginPath();
    ctx.arc(rig.rearWheel.x, rig.rearWheel.y, cr * s, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.8 * s;
  ctx.setLineDash([2.8 * s, 1.8 * s]);
  ctx.lineDashOffset = -(rig.pedalAngle * 14.8 * s);
  ctx.beginPath();
  ctx.moveTo(rig.rearWheel.x, rig.rearWheel.y - 6 * s);
  ctx.lineTo(rig.bb.x, rig.bb.y - 14.5 * s);
  ctx.moveTo(rig.bb.x, rig.bb.y + 14.5 * s);
  ctx.lineTo(rig.rearWheel.x - 4 * s, rig.rearWheel.y + 15 * s);
  ctx.stroke();
  ctx.setLineDash([]);

  const numTeeth = 28;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.strokeStyle = '#e0f2fe';
  ctx.lineWidth = 1.05 * s;
  ctx.beginPath();
  for (let i = 0; i < numTeeth * 2; i++) {
    const a = rig.pedalAngle + (i * Math.PI) / numTeeth;
    const rad = (i % 2 === 0 ? 15.0 : 12.6) * s;
    if (i === 0) ctx.moveTo(rig.bb.x + Math.cos(a) * rad, rig.bb.y + Math.sin(a) * rad);
    else ctx.lineTo(rig.bb.x + Math.cos(a) * rad, rig.bb.y + Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 3. G2 Curvature-Continuous Fillet-Lugged Titanium-Carbon Aero Frame!
  const drawG2FilletTube = (pA, pB, wA, wB, stops, facetIdx) => {
    const dx = pB.x - pA.x;
    const dy = pB.y - pA.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const midX = (pA.x + pB.x) * 0.5;
    const midY = (pA.y + pB.y) * 0.5;
    const wMid = Math.min(wA, wB) * 0.82; // Concave G2 hourglass fillet taper!

    ctx.beginPath();
    ctx.moveTo(pA.x + nx * wA, pA.y + ny * wA);
    ctx.quadraticCurveTo(midX + nx * wMid, midY + ny * wMid, pB.x + nx * wB, pB.y + ny * wB);
    ctx.lineTo(pB.x - nx * wB, pB.y - ny * wB);
    ctx.quadraticCurveTo(midX - nx * wMid, midY - ny * wMid, pA.x - nx * wA, pA.y - ny * wA);
    ctx.closePath();

    const gTube = ctx.createLinearGradient(pA.x - nx * wA, pA.y - ny * wA, pB.x + nx * wB, pB.y + ny * wB);
    for (const [st, col] of stops) gTube.addColorStop(st, col);
    paintSilkFacet(gTube, facetIdx);
  };

  const tiSilk = [[0.0, '#ffffff'], [0.35, '#bae6fd'], [0.72, '#818cf8'], [1.0, '#1e3a8a']];
  const coralSilk = [[0.0, '#fef08a'], [0.48, '#fb923c'], [1.0, '#e11d48']];

  const stayJoin = { x: lerp(rig.seatCluster.x, rig.bb.x, 0.22), y: lerp(rig.seatCluster.y, rig.bb.y, 0.22) };
  drawG2FilletTube(rig.rearWheel, stayJoin, 1.8 * s, 3.6 * s, coralSilk, 2);
  drawG2FilletTube(rig.rearWheel, rig.bb, 2.0 * s, 4.6 * s, tiSilk, 2);
  drawG2FilletTube(rig.bb, rig.seatCluster, 5.2 * s, 4.2 * s, tiSilk, 2);
  drawG2FilletTube(rig.bb, rig.headBot, 5.8 * s, 4.8 * s, tiSilk, 3);
  drawG2FilletTube(rig.seatCluster, rig.headTop, 4.0 * s, 4.6 * s, tiSilk, 3);
  drawG2FilletTube(rig.headTop, rig.headBot, 5.0 * s, 5.0 * s, tiSilk, 3);
  drawG2FilletTube(rig.headBot, rig.frontWheel, 4.6 * s, 2.0 * s, coralSilk, 3);

  // Smooth G2 Monocoque Fillet Lugs at BB, Seat Cluster & Headtube
  for (const [pt, lr] of [[rig.bb, 6.2 * s], [rig.seatCluster, 4.8 * s], [rig.headTop, 4.8 * s]]) {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, lr, 0, Math.PI * 2);
    paintSilkFacet('#bae6fd', 3, '#38bdf8', null);
  }

  ctx.save();
  ctx.globalAlpha = chassisAlpha;
  ctx.strokeStyle = '#e0f2fe';
  ctx.lineWidth = (bodyAlpha > 0.3 ? 2.6 : 1.1) * s;
  ctx.beginPath();
  ctx.moveTo(rig.seatCluster.x, rig.seatCluster.y);
  ctx.lineTo(rig.saddle.x, rig.saddle.y);
  ctx.moveTo(rig.headTop.x, rig.headTop.y);
  ctx.lineTo(rig.stemTop.x + 5 * s, rig.stemTop.y + 3 * s);
  ctx.lineTo(rig.handleGrip.x, rig.handleGrip.y + 2 * s);
  ctx.bezierCurveTo(
    rig.stemTop.x + 22 * s, rig.stemTop.y + 1 * s,
    rig.stemTop.x + 24 * s, rig.stemTop.y + 22 * s,
    rig.stemTop.x + 5 * s, rig.stemTop.y + 22 * s
  );
  ctx.stroke();

  if (bodyAlpha > 0.05) {
    ctx.globalAlpha = bodyAlpha;
    ctx.fillStyle = '#1e1b4b';
    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 1.3 * s;
    ctx.beginPath();
    ctx.moveTo(rig.saddle.x - 16 * s, rig.saddle.y - 2 * s);
    ctx.quadraticCurveTo(rig.saddle.x, rig.saddle.y - 4 * s, rig.saddle.x + 14 * s, rig.saddle.y + 1 * s);
    ctx.lineTo(rig.saddle.x - 12 * s, rig.saddle.y + 3 * s);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();

  // 4. Barycentric Silk-Mesh Pelican Plumage (ZERO heavy white borders & ZERO arc ball head!)
  // (a) 5 Fanned Silk Tail Rectrices (Facets 4..5)
  for (let f = 0; f < 5; f++) {
    const spread = (f - 2) * 4.8 * s;
    const tx = rig.tailTip.x - (2 - Math.abs(f - 2)) * 7.5 * s;
    const ty = rig.tailTip.y + spread;
    ctx.beginPath();
    ctx.moveTo(rig.bodyCenter.x - 30 * s, rig.bodyCenter.y - 4 * s + spread * 0.4);
    ctx.quadraticCurveTo(tx + 14 * s, ty - 5 * s, tx, ty);
    ctx.quadraticCurveTo(tx + 16 * s, ty + 5 * s, rig.bodyCenter.x - 26 * s, rig.bodyCenter.y + 6 * s);
    ctx.closePath();
    const tg = ctx.createLinearGradient(tx, ty, rig.bodyCenter.x - 24 * s, rig.bodyCenter.y);
    tg.addColorStop(0.0, '#ffffff');
    tg.addColorStop(0.55, f % 2 === 0 ? '#bae6fd' : '#e9d5ff');
    tg.addColorStop(1.0, f % 2 === 0 ? '#38bdf8' : '#a78bfa');
    paintSilkFacet(tg, 4 + (f % 2));
  }

  // (b) 4-Subdivision Barycentric Silk Mesh Torso (Facets 6, 7, 8, 9)
  const torsoDorsalP0 = rig.tailTip;
  const torsoDorsalP1 = { x: rig.bodyCenter.x - 42 * s, y: rig.bodyCenter.y - 34 * s };
  const torsoDorsalP2 = { x: rig.bodyCenter.x + 8 * s, y: rig.bodyCenter.y - 31 * s };
  const torsoDorsalP3 = { x: rig.chest.x + 10 * s, y: rig.chest.y - 6 * s };

  // Deep Ventral Sapphire-Violet Shadow Mesh
  ctx.beginPath();
  ctx.moveTo(rig.tailTip.x + 4 * s, rig.tailTip.y + 2 * s);
  ctx.quadraticCurveTo(rig.bodyCenter.x, rig.bodyCenter.y + 4 * s, rig.chest.x + 10 * s, rig.chest.y + 2 * s);
  ctx.bezierCurveTo(
    rig.bodyCenter.x + 42 * s, rig.bodyCenter.y + 20 * s,
    rig.bodyCenter.x + 14 * s, rig.bodyCenter.y + 33 * s,
    rig.hip.x - 14 * s, rig.hip.y + 15 * s
  );
  ctx.quadraticCurveTo(rig.bodyCenter.x - 46 * s, rig.bodyCenter.y + 15 * s, rig.tailTip.x + 4 * s, rig.tailTip.y + 2 * s);
  ctx.closePath();
  const ventralG = ctx.createLinearGradient(rig.bodyCenter.x, rig.bodyCenter.y, rig.bodyCenter.x, rig.bodyCenter.y + 32 * s);
  ventralG.addColorStop(0.0, '#7dd3fc');
  ventralG.addColorStop(0.55, '#6366f1');
  ventralG.addColorStop(1.0, '#312e81');
  paintSilkFacet(ventralG, 6);

  // Mid-Flank Aurora Lavender-Cyan Ribbon Mesh
  ctx.beginPath();
  ctx.moveTo(rig.tailTip.x + 2 * s, rig.tailTip.y);
  ctx.quadraticCurveTo(rig.bodyCenter.x - 8 * s, rig.bodyCenter.y - 17 * s, rig.chest.x + 10 * s, rig.chest.y - 3 * s);
  ctx.quadraticCurveTo(rig.bodyCenter.x + 16 * s, rig.bodyCenter.y + 15 * s, rig.hip.x - 4 * s, rig.hip.y + 8 * s);
  ctx.quadraticCurveTo(rig.bodyCenter.x - 28 * s, rig.bodyCenter.y + 8 * s, rig.tailTip.x + 2 * s, rig.tailTip.y);
  ctx.closePath();
  const midG = ctx.createLinearGradient(rig.tailTip.x, rig.bodyCenter.y - 16 * s, rig.chest.x + 12 * s, rig.bodyCenter.y + 14 * s);
  midG.addColorStop(0.0, '#ffffff');
  midG.addColorStop(0.45, '#e9d5ff');
  midG.addColorStop(0.78, '#c084fc');
  midG.addColorStop(1.0, '#38bdf8');
  paintSilkFacet(midG, 7);

  // Upper Pearl-Alabaster Dorsal Silk Arch
  ctx.beginPath();
  ctx.moveTo(torsoDorsalP0.x, torsoDorsalP0.y);
  ctx.bezierCurveTo(torsoDorsalP1.x, torsoDorsalP1.y, torsoDorsalP2.x, torsoDorsalP2.y, torsoDorsalP3.x, torsoDorsalP3.y);
  ctx.quadraticCurveTo(rig.bodyCenter.x - 6 * s, rig.bodyCenter.y - 8 * s, torsoDorsalP0.x, torsoDorsalP0.y);
  ctx.closePath();
  const dorsalG = ctx.createLinearGradient(rig.bodyCenter.x, rig.bodyCenter.y - 34 * s, rig.bodyCenter.x, rig.bodyCenter.y);
  dorsalG.addColorStop(0.0, '#ffffff');
  dorsalG.addColorStop(0.62, '#f0f9ff');
  dorsalG.addColorStop(1.0, '#7dd3fc');
  paintSilkFacet(dorsalG, 8);

  // (c) Variable-Width Cubic Bezier S-Neck + G2 Anatomical Bezier Skull (Facets 10, 11)
  const neckP0 = { x: rig.chest.x - 1 * s, y: rig.chest.y + 4 * s };
  const neckP1 = rig.neckC1;
  const neckP2 = rig.neckC2;
  const neckP3 = { x: rig.head.x - 1 * s, y: rig.head.y + 2 * s };
  const leftEdge = [];
  const rightEdge = [];
  for (let i = 0; i <= 16; i++) {
    const u = i / 16;
    const pt = evalCubicBezier(neckP0, neckP1, neckP2, neckP3, u);
    const hw = lerp(12.4, 8.0, u) * s;
    leftEdge.push({ x: pt.x + pt.nx * hw, y: pt.y + pt.ny * hw });
    rightEdge.push({ x: pt.x - pt.nx * hw, y: pt.y - pt.ny * hw });
  }
  ctx.beginPath();
  ctx.moveTo(leftEdge[0].x, leftEdge[0].y);
  for (let i = 1; i <= 16; i++) ctx.lineTo(leftEdge[i].x, leftEdge[i].y);
  for (let i = 16; i >= 0; i--) ctx.lineTo(rightEdge[i].x, rightEdge[i].y);
  ctx.closePath();
  const neckSilk = ctx.createLinearGradient(rig.head.x - 14 * s, rig.head.y, rig.chest.x + 14 * s, rig.chest.y);
  neckSilk.addColorStop(0.0, '#ffffff');
  neckSilk.addColorStop(0.45, '#e0f2fe');
  neckSilk.addColorStop(0.78, '#c4b5fd');
  neckSilk.addColorStop(1.0, '#38bdf8');
  paintSilkFacet(neckSilk, 10);

  // Flowing Silk Crest Plumes + G2 Cubic-Bezier Anatomical Skull (ZERO ctx.arc head!)
  const hx = rig.head.x;
  const hy = rig.head.y;
  const hr = rig.head.r;
  const crests = [
    { x: rig.crest1.x - 8 * s, y: rig.crest1.y - 3 * s, c: '#ffffff' },
    { x: rig.crest2.x - 10 * s, y: rig.crest2.y + 1 * s, c: '#bae6fd' },
    { x: hx - 25 * s, y: hy + 4 * s, c: '#d8b4fe' },
  ];
  for (let c = 0; c < crests.length; c++) {
    ctx.beginPath();
    ctx.moveTo(hx - 5 * s, hy - (11 - c * 4) * s);
    ctx.quadraticCurveTo(crests[c].x + 6 * s, crests[c].y - 4 * s, crests[c].x, crests[c].y);
    ctx.quadraticCurveTo(crests[c].x + 8 * s, crests[c].y + 4 * s, hx - 7 * s, hy - (4 - c * 4) * s);
    ctx.closePath();
    paintSilkFacet(crests[c].c, 11);
  }

  // Sculpted G2 Bezier Cranium seamlessly bridging S-neck to upper mandible!
  ctx.beginPath();
  ctx.moveTo(hx - hr * 0.92, hy + hr * 0.52);
  ctx.bezierCurveTo(hx - hr * 1.18, hy - hr * 0.28, hx - hr * 0.45, hy - hr * 1.18, hx + hr * 0.25, hy - hr * 1.06);
  ctx.bezierCurveTo(hx + hr * 0.88, hy - hr * 0.94, rig.beakUpperBase.x + 2 * s, rig.beakUpperBase.y - 2 * s, rig.beakUpperBase.x + 2 * s, rig.beakUpperBase.y + 3 * s);
  ctx.bezierCurveTo(hx + hr * 0.85, hy + hr * 0.88, hx - hr * 0.22, hy + hr * 1.08, hx - hr * 0.92, hy + hr * 0.52);
  ctx.closePath();
  const skullG = ctx.createRadialGradient(hx + 3 * s, hy - 5 * s, 2 * s, hx, hy, hr * 1.25);
  skullG.addColorStop(0.0, '#ffffff');
  skullG.addColorStop(0.58, '#e0f2fe');
  skullG.addColorStop(1.0, '#a78bfa');
  paintSilkFacet(skullG, 11);

  // (d) 12-Triangle Delaunay Crystalline Caustic Gular Pouch (Facet 12 — responds to `tweak`!)
  const pouchCtrl = { x: rig.pouchBelly.x + tweak.dx, y: rig.pouchBelly.y + tweak.dy + 4 * s };
  const pA = rig.beakLowerBase;
  const pB = { x: rig.beakTip.x - 3 * s, y: rig.beakTip.y };
  const pC = { x: rig.beakUpperBase.x, y: rig.beakUpperBase.y + 5 * s };

  ctx.beginPath();
  ctx.moveTo(pA.x, pA.y);
  ctx.quadraticCurveTo(pouchCtrl.x, pouchCtrl.y, pB.x, pB.y);
  ctx.lineTo(pC.x, pC.y);
  ctx.closePath();

  const cxPouch = (pA.x + pouchCtrl.x + pB.x) / 3;
  const cyPouch = (pA.y + pouchCtrl.y + pB.y) / 3;
  const pouchSSS = ctx.createRadialGradient(cxPouch + 2 * s, cyPouch, 2 * s, cxPouch, cyPouch, 48 * s);
  pouchSSS.addColorStop(0.0, 'rgba(254, 249, 195, 0.96)');
  pouchSSS.addColorStop(0.34, 'rgba(253, 224, 71, 0.92)');
  pouchSSS.addColorStop(0.68, 'rgba(251, 146, 60, 0.88)');
  pouchSSS.addColorStop(1.0, 'rgba(225, 29, 72, 0.86)');
  paintSilkFacet(pouchSSS, 12, '#fb923c', 'rgba(254, 240, 138, 0.45)');

  // Internal Delaunay Crystal Caustic Triangles shimmering with pedalAngle!
  const pouchBloom = getFacetState(12).bloom;
  if (!isReflection && pouchBloom > 0.15) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pA.x, pA.y);
    ctx.quadraticCurveTo(pouchCtrl.x, pouchCtrl.y, pB.x, pB.y);
    ctx.lineTo(pC.x, pC.y);
    ctx.closePath();
    ctx.clip();

    const qMid1 = { x: lerp(pA.x, pouchCtrl.x, 0.52), y: lerp(pA.y, pouchCtrl.y, 0.52) };
    const qMid2 = { x: lerp(pB.x, pouchCtrl.x, 0.52), y: lerp(pB.y, pouchCtrl.y, 0.52) };
    const uMid = { x: lerp(pC.x, pB.x, 0.48), y: lerp(pC.y, pB.y, 0.48) };
    const core1 = { x: cxPouch - 6 * s, y: cyPouch - 1 * s };
    const core2 = { x: cxPouch + 10 * s, y: cyPouch - 2 * s };

    const tris = [
      [pA, pC, core1], [pC, uMid, core1], [uMid, core2, core1],
      [uMid, pB, core2], [pA, core1, qMid1], [qMid1, core1, core2],
      [qMid1, core2, pouchCtrl], [pouchCtrl, core2, qMid2], [qMid2, core2, pB],
    ];
    for (let ti = 0; ti < tris.length; ti++) {
      const [v0, v1, v2] = tris[ti];
      const glint = 0.08 + 0.28 * Math.pow(0.5 + 0.5 * Math.sin(rig.pedalAngle * 2 + ti * 1.35), 2);
      ctx.fillStyle = ti % 2 === 0 ? `rgba(255, 255, 255, ${(glint * pouchBloom).toFixed(3)})` : `rgba(254, 215, 170, ${(glint * 0.7 * pouchBloom).toFixed(3)})`;
      ctx.strokeStyle = `rgba(254, 249, 195, ${(0.28 * pouchBloom).toFixed(3)})`;
      ctx.lineWidth = 0.65 * s;
      ctx.beginPath();
      ctx.moveTo(v0.x, v0.y);
      ctx.lineTo(v1.x, v1.y);
      ctx.lineTo(v2.x, v2.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // Sculpted Upper Mandible & Jewel Sapphire Eye (Facet 13)
  ctx.beginPath();
  ctx.moveTo(rig.beakUpperBase.x, rig.beakUpperBase.y - 1 * s);
  ctx.lineTo(rig.beakTip.x, rig.beakTip.y - 3.5 * s);
  ctx.quadraticCurveTo(rig.beakTip.x + 6 * s, rig.beakTip.y + 4.5 * s, rig.beakTip.x - 2 * s, rig.beakTip.y + 6.5 * s);
  ctx.lineTo(rig.beakLowerBase.x, rig.beakLowerBase.y + 1 * s);
  ctx.closePath();
  const beakG = ctx.createLinearGradient(rig.beakUpperBase.x, rig.beakUpperBase.y - 4 * s, rig.beakTip.x, rig.beakTip.y + 6 * s);
  beakG.addColorStop(0.0, '#fef9c3');
  beakG.addColorStop(0.48, '#facc15');
  beakG.addColorStop(0.82, '#fb923c');
  beakG.addColorStop(1.0, '#f43f5e');
  paintSilkFacet(beakG, 13, '#fb923c');

  if (!isReflection) {
    const skullBloom = getFacetState(11).bloom;
    if (skullBloom > 0.05) {
      ctx.save();
      ctx.globalAlpha = skullBloom;
      const eyeX = hx + 4.5 * s;
      const eyeY = hy - 3.0 * s;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(eyeX + 0.5 * s, eyeY, 5.6 * s, 4.6 * s, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(eyeX, eyeY, 3.8 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.arc(eyeX + 0.9 * s, eyeY, 2.0 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(eyeX - 0.5 * s, eyeY - 1.3 * s, 1.2 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // (e) Near IK Leg + 3-Tier Translucent Glassmorphic Silk Wing (Facets 14..19)
  drawIKLeg(rig.rightHip, rig.rightKnee, rig.rightFoot, rig.rightPedal, false);

  for (let p = 0; p < 6; p++) {
    const f = p / 5;
    const tipX = lerp(rig.wingElbow.x + 4 * s, rig.wingTip.x + 8 * s, f);
    const tipY = lerp(rig.wingElbow.y + 18 * s, rig.wingTip.y + 1 * s, f);
    ctx.beginPath();
    ctx.moveTo(rig.wingElbow.x - 5 * s, rig.wingElbow.y + 3 * s);
    ctx.quadraticCurveTo((rig.wingElbow.x + tipX) * 0.5, tipY - 5 * s, tipX, tipY);
    ctx.quadraticCurveTo((rig.wingElbow.x + tipX) * 0.5, tipY + 4 * s, rig.wingElbow.x - 6 * s, rig.wingElbow.y + 9 * s);
    ctx.closePath();
    const priG = ctx.createLinearGradient(rig.wingElbow.x, rig.wingElbow.y, tipX, tipY);
    priG.addColorStop(0.0, '#7dd3fc');
    priG.addColorStop(0.55, '#6366f1');
    priG.addColorStop(1.0, '#312e81');
    paintSilkFacet(priG, 14 + (p % 2));
  }

  for (let k = 0; k < 7; k++) {
    const f = k / 6;
    const sx = lerp(rig.wingShoulder.x - 8 * s, rig.wingElbow.x + 5 * s, f);
    const sy = lerp(rig.wingShoulder.y + 4 * s, rig.wingElbow.y + 2 * s, f);
    const ex = sx + lerp(-3, 17, f) * s;
    const ey = sy + lerp(18, 13, f) * s;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(ex - 5 * s, ey + 1 * s, ex, ey);
    ctx.quadraticCurveTo(ex + 5 * s, sy + 6 * s, sx + 7.5 * s, sy - 1 * s);
    ctx.closePath();
    const secG = ctx.createLinearGradient(sx, sy, ex, ey);
    secG.addColorStop(0.0, '#ffffff');
    secG.addColorStop(0.55, k % 2 === 0 ? '#bae6fd' : '#e9d5ff');
    secG.addColorStop(1.0, k % 2 === 0 ? '#38bdf8' : '#a855f7');
    paintSilkFacet(secG, 16 + (k % 2));
  }

  ctx.beginPath();
  ctx.moveTo(rig.wingShoulder.x - 9 * s, rig.wingShoulder.y + 2 * s);
  ctx.quadraticCurveTo(rig.wingElbow.x - 10 * s, rig.wingElbow.y + 15 * s, rig.wingTip.x - 3 * s, rig.wingTip.y + 2 * s);
  ctx.quadraticCurveTo(rig.wingElbow.x + 13 * s, rig.wingElbow.y - 10 * s, rig.wingShoulder.x + 14 * s, rig.wingShoulder.y - 2 * s);
  ctx.closePath();
  const covertG = ctx.createLinearGradient(rig.wingShoulder.x - 6 * s, rig.wingShoulder.y - 6 * s, rig.wingTip.x, rig.wingTip.y + 8 * s);
  covertG.addColorStop(0.0, '#ffffff');
  covertG.addColorStop(0.52, '#f0f9ff');
  covertG.addColorStop(1.0, '#c4b5fd');
  paintSilkFacet(covertG, 19);

  // (f) Additive `lighter` Fresnel Rim Shimmer along dorsal arch, S-neck & wing mantle!
  const fresnelBloom = getFacetState(19).bloom;
  if (!isReflection && fresnelBloom > 0.1) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.58 * fresnelBloom;
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 1.9 * s;
    ctx.beginPath();
    ctx.moveTo(torsoDorsalP0.x, torsoDorsalP0.y);
    ctx.bezierCurveTo(torsoDorsalP1.x, torsoDorsalP1.y, torsoDorsalP2.x, torsoDorsalP2.y, torsoDorsalP3.x, torsoDorsalP3.y);
    ctx.stroke();

    ctx.strokeStyle = '#e9d5ff';
    ctx.lineWidth = 1.6 * s;
    ctx.beginPath();
    for (let i = 2; i <= 15; i++) {
      if (i === 2) ctx.moveTo(rightEdge[i].x, rightEdge[i].y);
      else ctx.lineTo(rightEdge[i].x, rightEdge[i].y);
    }
    ctx.stroke();
    ctx.restore();
  }

  return { torsoDorsalP0, torsoDorsalP1, torsoDorsalP2, torsoDorsalP3, neckP0, neckP1, neckP2, neckP3, pouchCtrl };
}

/**
 * 3. Draws 3-Act Finale Pelican:
 *    - Act I (`0.12s..2.28s`): 36-Harmonic Fourier Epicycles + Phosphor Contour + Planar Reflection
 *    - Act II (`2.25s..4.65s`): 22-Facet Silk Mesh + Curvature Combs + Live Bezier Handle Cursor
 *    - Act III (`4.65s..6.00s`): 100% Solid Complete Form + Golden Harmonic Wheel Orbits & Satellites
 */
function drawMasterpieceSVGPelican(ctx, kit, rig, localT, tweak, fourier, isOutroThumbnail) {
  const s = rig.root.scale;
  const effT = isOutroThumbnail ? 3.4 : localT;
  const auraStrength = isOutroThumbnail ? 0.85 : smoothstep(1.88, 2.42, effT);
  const bezierOverlayIn = isOutroThumbnail ? 1.0 : smoothstep(1.96, 2.38, effT);
  const combAlpha =
    bezierOverlayIn * (isOutroThumbnail ? 0.28 : lerp(0.76, 0.26, smoothstep(2.45, 4.65, effT)));
  const handleAlpha =
    bezierOverlayIn * (isOutroThumbnail ? 0.48 : lerp(0.88, 0.36, smoothstep(2.45, 4.65, effT)));
  const act3OrbitAlpha = isOutroThumbnail ? 0.0 : smoothstep(4.55, 4.95, effT);
  const beatPulse = 0.88 + 0.12 * Math.cos((effT / BEAT_SEC) * Math.PI * 2);

  // A. True 1:1 Vertically-Flipped Planar Reflection on Transparent Offscreen Buffer (`destination-out` alpha erase!)
  const reflW = 460;
  const reflH = 165;
  const reflOx = Math.round(rig.root.x - reflW * 0.5);
  const reflG = kit.bake2D('s20_refl_scratch_r3', () => {}, reflW, reflH);
  const rctx = reflG.drawingContext;

  rctx.save();
  rctx.setTransform(1, 0, 0, 1, 0, 0);
  rctx.globalCompositeOperation = 'source-over';
  rctx.globalAlpha = 1.0;
  if ('filter' in rctx) rctx.filter = 'none';
  rctx.clearRect(0, 0, reflW, reflH);

  // Flip around y = ROAD_EDGE_Y onto transparent offscreen buffer (tire contact maps to ry = 0!)
  if ('filter' in rctx) rctx.filter = 'blur(1.1px)';
  rctx.translate(-reflOx, 0);
  rctx.scale(1, -0.62);
  rctx.translate(0, -ROAD_EDGE_Y);
  drawPelicanAndG2BikeBody(rctx, rig, effT, tweak, isOutroThumbnail, true);
  if (fourier.active) {
    drawFourierEpicycles(rctx, rig, fourier, true);
  }
  rctx.restore();

  // Smoothly erase offscreen alpha downward with `destination-out` — ZERO black box over OLED floor grid!
  rctx.save();
  rctx.setTransform(1, 0, 0, 1, 0, 0);
  if ('filter' in rctx) rctx.filter = 'none';
  rctx.globalCompositeOperation = 'destination-out';
  const fadeMask = rctx.createLinearGradient(0, 0, 0, reflH - 6);
  fadeMask.addColorStop(0.0, 'rgba(0, 0, 0, 0.08)');
  fadeMask.addColorStop(0.45, 'rgba(0, 0, 0, 0.46)');
  fadeMask.addColorStop(0.82, 'rgba(0, 0, 0, 0.88)');
  fadeMask.addColorStop(1.0, 'rgba(0, 0, 0, 1.0)');
  rctx.fillStyle = fadeMask;
  rctx.fillRect(0, 0, reflW, reflH);
  rctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, ROAD_EDGE_Y + 1, PANEL_SIZE, reflH);
  ctx.clip();
  ctx.globalAlpha = fourier.active ? lerp(0.30, 0.36, fourier.alpha) : 0.30;
  ctx.drawImage(reflG.canvas, reflOx, ROAD_EDGE_Y + 1);
  ctx.restore();

  // Contact light pool on y=680
  const floorGlow = ctx.createRadialGradient(rig.root.x, rig.root.y, 4 * s, rig.root.x, rig.root.y, 145 * s);
  floorGlow.addColorStop(0.0, `rgba(125, 211, 252, ${(0.20 + 0.16 * Math.max(auraStrength, fourier.alpha * 0.7)).toFixed(2)})`);
  floorGlow.addColorStop(0.5, `rgba(253, 224, 71, ${(0.06 + 0.07 * Math.max(act3OrbitAlpha, fourier.alpha)).toFixed(2)})`);
  floorGlow.addColorStop(1.0, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = floorGlow;
  ctx.beginPath();
  ctx.ellipse(rig.root.x, rig.root.y + 2 * s, 145 * s, 12 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // B. Flowing Silk Light-Ribbons & Stardust Trail (awakens as Silk Mesh crystallizes!)
  if (auraStrength > 0.02) {
    ctx.save();
    const ribbons = [
      { y0: rig.wingShoulder.y + 4 * s, len: 180 * s, amp: 13 * s, c: '125, 211, 252' },
      { y0: rig.tailTip.y + 2 * s, len: 205 * s, amp: -15 * s, c: '196, 181, 253' },
      { y0: rig.rearWheel.y + 4 * s, len: 155 * s, amp: 9 * s, c: '251, 146, 60' },
    ];
    for (let r = 0; r < ribbons.length; r++) {
      const rb = ribbons[r];
      const x0 = rig.tailTip.x - 4 * s;
      const x1 = x0 - rb.len;
      const rg = ctx.createLinearGradient(x1, rb.y0, x0, rb.y0);
      rg.addColorStop(0, `rgba(${rb.c}, 0)`);
      rg.addColorStop(1, `rgba(${rb.c}, 0.48)`);
      ctx.globalAlpha = auraStrength;
      ctx.strokeStyle = rg;
      ctx.lineWidth = (2.1 - r * 0.35) * s;
      const wave = Math.sin(effT * 6 + r * 1.8) * rb.amp;
      ctx.beginPath();
      ctx.moveTo(x0, rb.y0);
      ctx.bezierCurveTo(x0 - rb.len * 0.35, rb.y0 + wave, x0 - rb.len * 0.7, rb.y0 - wave, x1, rb.y0);
      ctx.stroke();
    }

    const starCols = ['#ffffff', '#7dd3fc', '#d8b4fe', '#fda4af', '#fde047'];
    for (let i = 0; i < 20; i++) {
      const cyc = (effT * 0.82 + i * 0.143) % 1;
      const px = rig.tailTip.x - 8 * s - cyc * 198 * s;
      const py = rig.head.y + 12 * s + ((i * 31) % 150) * s + Math.sin(effT * 4.5 + i) * 8 * s;
      const pa = Math.sin(Math.PI * cyc) * 0.78 * auraStrength;
      if (pa <= 0.02) continue;
      ctx.save();
      ctx.globalAlpha = pa;
      ctx.fillStyle = starCols[i % starCols.length];
      if (i % 2 === 0) drawFourPointStar(ctx, px, py, 4.6 * s, 1.4 * s);
      else {
        ctx.beginPath();
        ctx.arc(px, py, 1.8 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    const polarRingAlpha = auraStrength * 0.5 * (1 - act3OrbitAlpha);
    drawPolarGeometricRing(ctx, rig.rearWheel.x, rig.rearWheel.y, (rig.rearWheel.r + 10 * s) * beatPulse, rig.wheelAngle * 0.65, polarRingAlpha, '#38bdf8');
    drawPolarGeometricRing(ctx, rig.frontWheel.x, rig.frontWheel.y, (rig.frontWheel.r + 10 * s) * beatPulse, -rig.wheelAngle * 0.65, polarRingAlpha, '#c084fc');
    ctx.restore();
  }

  // C. Main Haute-Couture Silk Pelican + G2 Titanium Bike
  const splines = drawPelicanAndG2BikeBody(ctx, rig, effT, tweak, isOutroThumbnail, false);

  // C2. Act I: Live 36-Harmonic Complex Fourier Epicycles + Glowing Traced Contour!
  if (fourier.active) {
    drawFourierEpicycles(ctx, rig, fourier, false);
  }

  // C3. Act III (`localT ∈ [4.65s, 6.00s]`): Golden Harmonic Wheel Orbits + 3 Satellite Phase Dots!
  if (act3OrbitAlpha > 0.02) {
    drawHarmonicWheelOrbits(ctx, rig.rearWheel, effT, act3OrbitAlpha, s, 0.0);
    drawHarmonicWheelOrbits(ctx, rig.frontWheel, effT, act3OrbitAlpha, s, 1.05);
  }

  // D. Precision Hairline Curvature Combs (`0.82px`) & Bezier Tangent Handles (`■—○`)
  drawCurvatureComb(ctx, splines.torsoDorsalP0, splines.torsoDorsalP1, splines.torsoDorsalP2, splines.torsoDorsalP3, {
    samples: 18, combSign: -1, baseLen: 16, color: 'rgba(125, 211, 252, 0.78)', envColor: '#fb923c', alpha: combAlpha, s,
  });
  drawCurvatureComb(ctx, splines.neckP0, splines.neckP1, splines.neckP2, splines.neckP3, {
    samples: 15, combSign: -1, baseLen: 13, color: 'rgba(196, 181, 253, 0.78)', envColor: '#38bdf8', alpha: combAlpha, s,
  });

  // Curvature comb on the gular pouch flexing LIVE with the Act-II Direct-Selection cursor!
  const pouchQ1 = { x: lerp(rig.beakLowerBase.x, splines.pouchCtrl.x, 0.667), y: lerp(rig.beakLowerBase.y, splines.pouchCtrl.y, 0.667) };
  const pouchQ2 = { x: lerp(rig.beakTip.x - 3 * s, splines.pouchCtrl.x, 0.667), y: lerp(rig.beakTip.y, splines.pouchCtrl.y, 0.667) };
  if (tweak.active) {
    drawCurvatureComb(ctx, rig.beakLowerBase, pouchQ1, pouchQ2, { x: rig.beakTip.x - 3 * s, y: rig.beakTip.y }, {
      samples: 14, combSign: 1, baseLen: 13, color: 'rgba(253, 224, 71, 0.80)', envColor: '#fb7185', alpha: tweak.env * 0.78, s,
    });
  }

  drawBezierHandle(ctx, splines.neckP0, splines.neckP1, '#38bdf8', handleAlpha, s);
  drawBezierHandle(ctx, splines.neckP3, splines.neckP2, '#38bdf8', handleAlpha, s);
  const pouchHandleAlpha = clamp(handleAlpha + tweak.env * 0.55, 0, 1) * bezierOverlayIn;
  drawBezierHandle(ctx, rig.beakLowerBase, splines.pouchCtrl, '#fb923c', pouchHandleAlpha, s, tweak.dragging > 0.1);
  drawBezierHandle(ctx, { x: rig.beakTip.x - 3 * s, y: rig.beakTip.y }, splines.pouchCtrl, '#fb923c', pouchHandleAlpha, s, tweak.dragging > 0.1);

  // E. Act-II Interactive Direct-Selection Cursor + `0.85px` Hairline SVG Selection Bounding Box!
  if (tweak.active && !isOutroThumbnail) {
    ctx.save();
    ctx.globalAlpha = tweak.env;

    // Ultra-restrained 0.85px silver/ice-cyan SVG 8-handle selection bounding box around beak/pouch
    const bx0 = Math.min(rig.beakLowerBase.x, rig.beakUpperBase.x) - 6 * s;
    const by0 = Math.min(rig.beakUpperBase.y, rig.beakTip.y) - 8 * s;
    const bx1 = rig.beakTip.x + 8 * s;
    const by1 = splines.pouchCtrl.y + 8 * s;
    const bw = bx1 - bx0;
    const bh = by1 - by0;

    ctx.strokeStyle = 'rgba(186, 230, 253, 0.46)';
    ctx.lineWidth = 0.85;
    ctx.strokeRect(bx0, by0, bw, bh);

    // Rotation stem above top-center handle
    ctx.beginPath();
    ctx.moveTo(bx0 + bw * 0.5, by0);
    ctx.lineTo(bx0 + bw * 0.5, by0 - 11);
    ctx.stroke();
    ctx.fillStyle = '#090d16';
    ctx.strokeStyle = '#7dd3fc';
    ctx.beginPath();
    ctx.arc(bx0 + bw * 0.5, by0 - 13, 2.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 8 delicate 3.2x3.2px hollow engineering resize handles
    for (const [hxP, hyP] of [
      [bx0, by0], [bx0 + bw * 0.5, by0], [bx1, by0],
      [bx0, by0 + bh * 0.5], [bx1, by0 + bh * 0.5],
      [bx0, by1], [bx0 + bw * 0.5, by1], [bx1, by1],
    ]) {
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.78)';
      ctx.lineWidth = 0.85;
      ctx.fillRect(hxP - 1.6, hyP - 1.6, 3.2, 3.2);
      ctx.strokeRect(hxP - 1.6, hyP - 1.6, 3.2, 3.2);
    }

    // Smoothly gliding White Direct-Selection Pointer Cursor (`A` tool) locked onto `pouchCtrl`!
    const approach = smoothstep(2.30, 2.58, effT);
    const curX = lerp(splines.pouchCtrl.x + 36, splines.pouchCtrl.x + 1.5, approach);
    const curY = lerp(splines.pouchCtrl.y + 32, splines.pouchCtrl.y + 1.5, approach);

    if (tweak.dragging > 0.05) {
      ctx.strokeStyle = 'rgba(253, 224, 71, 0.55)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(splines.pouchCtrl.x, splines.pouchCtrl.y, 8 + 3 * Math.sin(effT * 12), 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(curX, curY);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 15.5);
    ctx.lineTo(4.2, 12.0);
    ctx.lineTo(7.2, 18.2);
    ctx.lineTo(9.6, 17.0);
    ctx.lineTo(6.6, 10.8);
    ctx.lineTo(11.4, 10.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Precision coordinate tooltip pill beside cursor
    if (tweak.dragging > 0.1) {
      ctx.fillStyle = 'rgba(9, 13, 22, 0.90)';
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.65)';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.roundRect(14, 10, 82, 17, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fde047';
      ctx.font = '600 9.5px "PelicanMono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(splines.pouchCtrl.x)},${Math.round(splines.pouchCtrl.y)}`, 55, 18.5);
    }
    ctx.restore();

    ctx.restore();
  }

  // F. Restrained Zero-Overlap CAD Telemetry Capsules (`0.85px` hairlines)
  if (!isOutroThumbnail) {
    ctx.save();
    ctx.font = '600 10px "PelicanMono", monospace';
    ctx.textBaseline = 'middle';

    const dimY = rig.root.y + 24 * s;
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.45)';
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.moveTo(rig.rearWheel.x, rig.root.y + 6 * s);
    ctx.lineTo(rig.rearWheel.x, dimY + 3 * s);
    ctx.moveTo(rig.frontWheel.x, rig.root.y + 6 * s);
    ctx.lineTo(rig.frontWheel.x, dimY + 3 * s);
    ctx.moveTo(rig.rearWheel.x, dimY);
    ctx.lineTo(rig.frontWheel.x, dimY);
    ctx.stroke();

    ctx.fillStyle = 'rgba(9, 13, 22, 0.92)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.48)';
    ctx.beginPath();
    ctx.roundRect(rig.root.x - 40, dimY - 8.5, 80, 17, 8.5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#7dd3fc';
    ctx.textAlign = 'center';
    ctx.fillText('L = 172.0u', rig.root.x, dimY + 0.5);
    ctx.restore();
  }
}

export function render(kit, slot, scene, params) {
  const {
    localT = 0,
    pelicanLocalX = 500,
    pedalAngle = 0,
    speedScale = 1,
    isOutroThumbnail = false,
  } = params;

  const g = slot.g2d;
  const ctx = g.drawingContext;
  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Baked Nano-Texture OLED Dark Optical Workbench & Multi-Pass Golden Spiral
  const workbench = getOLEDWorkbench(kit);
  ctx.drawImage(workbench.canvas, 0, 0);

  // 2. Live Pelican + Bicycle IK Rig, Act-I Fourier State & Act-II Bezier Tweak State
  const visiblePelican = pelicanLocalX > -240 && pelicanLocalX < PANEL_SIZE + 240;
  const rig = visiblePelican
    ? computePelicanRig({
        x: isOutroThumbnail ? 655 : pelicanLocalX,
        y: ROAD_EDGE_Y,
        pedalAngle,
        scale: 1.0,
        slope: 0,
        speedScale,
        time: isOutroThumbnail ? localT : (params.t ?? localT),
      })
    : null;

  const fourier = getFourierActState(localT, isOutroThumbnail);
  const tweak = getLiveTweakState(rig, localT, isOutroThumbnail);

  // 3. Single Consolidated 72%-Translucent Glass IDE (houses `20 · 代码美学 — 2020s` natively!)
  drawConsolidatedGlassIDE(ctx, rig, localT, tweak, fourier, isOutroThumbnail);

  // 4. 3-Act Finale Pelican: Fourier Epicycles -> Barycentric Silk Mesh -> Golden Wheel Orbits
  if (rig) {
    drawMasterpieceSVGPelican(ctx, kit, rig, localT, tweak, fourier, isOutroThumbnail);
  }

  // 5. Preserve Outro Exhibition Wall Thumbnail Label (NO separate top-left EraTitleCard!)
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(9, 13, 22, 0.86)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.fillStyle = '#e6edf3';
    ctx.font = '700 48px "PelicanSerif", serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} ${scene.zh}`, 36, PANEL_SIZE - 48);
  }

  ctx.restore();
}
