// src/kit/transitions.js
// Localized Cross-Frame Micro-Physics (`k = 0..19`, `t_cross = 5.0 + 6.0 * k`, `bx = k * 1000`).
// Drawn in world camera coordinates immediately over panels & period borders.
// Strictly deterministic pure function of `clampedT` — zero camera shake, zero full-screen flash,
// restrained museum-grade material handoffs (<0.4ms when active, <0.001ms early-out otherwise).

import {
  INTRO_SEC,
  SCENE_SEC,
  NUM_SCENES,
  PANEL_SIZE,
  ROAD_EDGE_Y,
  clamp,
  lerp,
  smoothstep,
  smootherstep,
} from '../beat/timeline.js';
import { computePelicanRig } from '../rig/pelican.js';
import { makePRNG, hashSeed } from './kit.js';

const PATCH_W = 540;
const PATCH_H = 460;
const PATCH_HALF_W = PATCH_W / 2; // 270px left & right of seam bx
const PATCH_Y0 = 340; // covers world y in [340, 800]

const STD_PRE_SEC = 0.26;
const STD_POST_SEC = 0.30;
const HERO_HALF_SEC = 0.45; // k = 14 (#14 Nosferatu -> #15 Oscilloscope): 88.55s..89.45s

// Pooled 2D offscreen patch per p5 instance + precomputed particle tables per crossing k
const patchPool = new WeakMap();
const crossingParticleCache = new Map();

function getPooledPatch(p) {
  let g = patchPool.get(p);
  if (!g) {
    g = p.createGraphics(PATCH_W, PATCH_H);
    g.pixelDensity(1);
    patchPool.set(p, g);
  }
  return g;
}

function fastSinNoise(a, b) {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453123;
  return (s - Math.floor(s)) * 2 - 1;
}

/**
 * Computes deterministic, cached static birth descriptors for crossing `k` so particles,
 * flakes, impasto dabs & ink blooms move with silky 60fps continuity (zero frame-to-frame RNG strobe).
 */
function getCrossingDescriptors(k) {
  if (crossingParticleCache.has(k)) return crossingParticleCache.get(k);
  const rng = makePRNG(hashSeed(`pelican_seam_s3_k${k}`));

  const motes = [];
  for (let i = 0; i < 24; i++) {
    const polyPts = [];
    const nVerts = 4 + Math.floor(rng() * 3);
    for (let v = 0; v < nVerts; v++) {
      const ang = (v / nVerts) * Math.PI * 2 + (rng() - 0.5) * 0.45;
      const rad = 0.58 + rng() * 0.62;
      polyPts.push({ x: Math.cos(ang) * rad, y: Math.sin(ang) * rad });
    }
    motes.push({
      tBirth: lerp(-0.21, 0.11, i / 23) + (rng() - 0.5) * 0.03,
      life: 0.20 + rng() * 0.16,
      ox: (rng() - 0.45) * 26,
      oy: -rng() * 58,
      vx: 72 + rng() * 165,
      vy: -24 - rng() * 92,
      spin0: rng() * Math.PI * 2,
      spinV: (rng() - 0.5) * 14,
      size: 1.8 + rng() * 3.4,
      colIdx: Math.floor(rng() * 12),
      flutterPh: rng() * Math.PI * 2,
      polyPts,
    });
  }

  const ribbons = [];
  for (let i = 0; i < 10; i++) {
    ribbons.push({
      tBirth: -0.20 + (i / 9) * 0.22,
      yOff: -8 - rng() * 78,
      len: 44 + rng() * 68,
      amp: (rng() - 0.5) * 16,
      freq: 0.045 + rng() * 0.04,
      phase: rng() * Math.PI * 2,
      width: 0.9 + rng() * 1.9,
      colIdx: i,
    });
  }

  const lobes = [];
  for (let b = 0; b < 3; b++) {
    const verts = [];
    const n = 16;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const rMod = 0.76 + 0.34 * rng() + 0.12 * Math.sin(a * 3 + b * 2.1);
      verts.push({ ca: Math.cos(a) * rMod, sa: Math.sin(a) * rMod });
    }
    lobes.push({
      dx: (b - 1) * 14 + (rng() - 0.5) * 8,
      dy: (rng() - 0.5) * 5,
      rx: 18 + b * 8,
      ry: 5.5 + b * 2.4,
      t0: -0.18 + b * 0.06,
      verts,
    });
  }

  const desc = { motes, ribbons, lobes };
  crossingParticleCache.set(k, desc);
  return desc;
}

function drawPolygonMote(ctx, x, y, size, rot, polyPts) {
  const c = Math.cos(rot) * size;
  const s = Math.sin(rot) * size;
  ctx.beginPath();
  for (let i = 0; i < polyPts.length; i++) {
    const p = polyPts[i];
    const px = x + p.x * c - p.y * s;
    const py = y + p.x * s + p.y * c;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function fillSoftAnisotropicGlow(ctx, cx, cy, rx, ry, stops) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(rx, ry);
  const g = ctx.createRadialGradient(0, 0, 0.03, 0, 0, 1.0);
  for (const [offset, color] of stops) {
    g.addColorStop(offset, color);
  }
  ctx.fillStyle = g;
  ctx.fillRect(-1.02, -1.02, 2.04, 2.04);
  ctx.restore();
}

/**
 * Evaluates exact #14 Nosferatu stair-shadow projection for world point `pt` on `x < 14000`,
 * matching the `smoothstep(1000, 845, localX)` Orlok loom envelope so `x = 14000`
 * joins `#15`'s `(14000+, 680)` rig with C1 precision.
 */
function projectNosferatuWorldJoint(pt, pelWorldX) {
  const sideToCrt = smoothstep(13988, 14012, pt.x);
  if (sideToCrt >= 0.999) return { x: pt.x, y: pt.y };

  const pelLocalX = clamp(pelWorldX - 13000, 0, PANEL_SIZE);
  const peakX = 695;
  let stairY = ROAD_EDGE_Y;
  if (pelLocalX < PANEL_SIZE && pelLocalX > peakX) {
    const u2 = (pelLocalX - peakX) / (PANEL_SIZE - peakX);
    const s2 = u2 * u2 * (3 - 2 * u2);
    stairY = ROAD_EDGE_Y - 176 * (1 - s2);
  }
  const orlokEnv = pelWorldX >= 14000 ? 0 : smoothstep(1000, 845, pelLocalX);
  const dy = pt.y - ROAD_EDGE_Y;
  const dx = pt.x - pelWorldX;
  const s14X = pt.x + (dx * 0.08 - dy * 0.19) * orlokEnv;
  const s14Y = stairY + dy * (1 + 0.37 * orlokEnv);
  return {
    x: lerp(s14X, pt.x, sideToCrt),
    y: lerp(s14Y, pt.y, sideToCrt),
  };
}

// -----------------------------------------------------------------------------
// Family A: Mineral Dust, Limestone Chips, Han Rubbing & Maya Stucco (k = 0, 1, 2, 6)
// -----------------------------------------------------------------------------
function renderMineralAndRubbingHandoff(ctx, k, bx, dt, env, desc) {
  // Subtle ground contact dry-pigment / soot puff hugging y = 680
  const puffX = bx + lerp(-6, 36, clamp((dt + 0.22) / 0.48, 0, 1));
  let puffStops = null;

  let palette = null;
  let gravity = 340;
  if (k === 0) {
    // Intro sepia ink flaking -> #01 Tassili ochre sandstone dust
    puffStops = [
      [0, `rgba(196, 142, 92, ${(0.22 * env).toFixed(3)})`],
      [1, 'rgba(196, 142, 92, 0)'],
    ];
    palette = ['#c89b6e', '#8c3b1f', '#b56735', '#e3c598', '#522518'];
    gravity = 240;

    // Departing sepia manuscript nib hairlines flaking on left side of x = 0
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < 6; i++) {
      const r = desc.ribbons[i];
      const age = dt - r.tBirth;
      if (age <= 0 || age >= 0.30) continue;
      const a = Math.sin((age / 0.30) * Math.PI) * 0.42 * env;
      const sx = bx - 44 + i * 7 + age * 85;
      const sy = ROAD_EDGE_Y - 8 - i * 8 + Math.sin(age * 14 + i) * 3;
      ctx.strokeStyle = `rgba(64, 46, 30, ${a.toFixed(3)})`;
      ctx.lineWidth = 1.05;
      ctx.beginPath();
      ctx.moveTo(sx - 12, sy + 2);
      ctx.quadraticCurveTo(sx - 4, sy - 3, sx + 5, sy - 1);
      ctx.stroke();
    }
    ctx.restore();
  } else if (k === 1) {
    // #01 -> #02 Egyptian dry limestone gesso plaster chips + red-ochre scribe tick
    puffStops = [
      [0, `rgba(232, 213, 167, ${(0.20 * env).toFixed(3)})`],
      [1, 'rgba(232, 213, 167, 0)'],
    ];
    palette = ['#e8d5a7', '#f2e4c2', '#c14928', '#d4a024', '#1d6b73'];
    gravity = 430;
  } else if (k === 2) {
    // #02 -> #03 Eastern Han stone relief pine-soot & cinnabar rubbing flecks
    puffStops = [
      [0, `rgba(34, 31, 28, ${(0.24 * env).toFixed(3)})`],
      [1, 'rgba(34, 31, 28, 0)'],
    ];
    palette = ['#1a1917', '#383530', '#ebe6dc', '#b3392b', '#cfc8b8'];
    gravity = 290;
  } else {
    // k = 6: #06 -> #07 Maya Codex brittle calcium-carbonate stucco & cochineal/Maya-blue flecks
    puffStops = [
      [0, `rgba(235, 217, 180, ${(0.21 * env).toFixed(3)})`],
      [1, 'rgba(235, 217, 180, 0)'],
    ];
    palette = ['#f4e8cc', '#ebd9b4', '#b83324', '#267365', '#8c6239'];
    gravity = 380;
  }

  ctx.save();
  fillSoftAnisotropicGlow(ctx, puffX, ROAD_EDGE_Y - 2, 54, 14, puffStops);

  const count = k === 0 ? 18 : 16;
  for (let i = 0; i < count; i++) {
    const m = desc.motes[i];
    const age = dt - m.tBirth;
    if (age <= 0 || age >= m.life) continue;
    const u = age / m.life;
    const alpha = Math.sin(Math.PI * u) * 0.48 * env;
    if (alpha <= 0.01) continue;

    const drag = 1 - 0.28 * u;
    const mx = bx + m.ox * 0.4 + m.vx * age * drag;
    let my = ROAD_EDGE_Y - 3 + m.oy * 0.45 + m.vy * age + 0.5 * gravity * age * age;
    if (my > ROAD_EDGE_Y + 3) {
      my = ROAD_EDGE_Y + 3 - (my - (ROAD_EDGE_Y + 3)) * 0.28;
    }
    const rot = m.spin0 + m.spinV * age;
    const sz = m.size * (k === 0 ? 0.78 : 0.95) * (1 - 0.25 * u);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = palette[m.colIdx % palette.length];
    drawPolygonMote(ctx, mx, my, sz, rot, m.polyPts);
    ctx.fill();

    if (k === 1 || k === 6) {
      ctx.strokeStyle = 'rgba(28, 22, 16, 0.35)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }
  }
  ctx.restore();
}

// -----------------------------------------------------------------------------
// Family B: Chinese Handscroll Xuan-Paper Capillary Bloom & Feibai Dry-Brush (k = 3, 4, 5, 8)
// -----------------------------------------------------------------------------
function renderInkScrollHandoff(ctx, k, bx, dt, env, desc) {
  const isBada = k === 8;
  const isQingming = k === 5;
  const inkRgb = isBada ? '23, 22, 20' : k === 4 ? '28, 27, 24' : '33, 28, 23';

  ctx.save();

  // 1. Lucas-Washburn sqrt(t) capillary ink-wash micro-bloom (`墨晕`) at wheel seam contact
  const lobeCount = isBada ? 2 : 3;
  for (let b = 0; b < lobeCount; b++) {
    const lb = desc.lobes[b];
    const age = dt - lb.t0;
    if (age <= 0 || age >= 0.42) continue;
    const u = clamp(age / 0.42, 0, 1);
    const spread = 0.35 + 0.85 * Math.sqrt(u);
    const fade = (1 - smoothstep(0.45, 1.0, u)) * smoothstep(0.0, 0.14, u);
    const fillA = (isBada ? 0.13 : 0.17) * fade * env;
    const rimA = (isBada ? 0.19 : 0.24) * fade * env;
    if (fillA <= 0.005) continue;

    const cx = bx + lb.dx + u * 16;
    const cy = ROAD_EDGE_Y + lb.dy;

    ctx.beginPath();
    for (let i = 0; i < lb.verts.length; i++) {
      const v = lb.verts[i];
      const px = cx + v.ca * lb.rx * spread;
      const py = cy + v.sa * lb.ry * spread;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(${inkRgb}, ${fillA.toFixed(3)})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${inkRgb}, ${rimA.toFixed(3)})`;
    ctx.lineWidth = 0.85;
    ctx.stroke();
  }

  // 2. `飞白` (Feibai) split-hair dry-brush ribbons trailing across the brocade `隔水`
  const numRibbons = isBada ? 3 : 5;
  ctx.lineCap = 'round';
  for (let i = 0; i < numRibbons; i++) {
    const r = desc.ribbons[i];
    const age = dt - r.tBirth;
    if (age <= 0 || age >= 0.36) continue;
    const u = age / 0.36;
    const alpha = Math.sin(Math.PI * u) * (isBada ? 0.38 : 0.34) * env;
    if (alpha <= 0.008) continue;

    const xStart = bx - 38 + u * 54;
    const xLen = r.len * (isBada ? 0.78 : 1.0);
    const yBase = ROAD_EDGE_Y - 4 + r.yOff * (isBada ? 0.45 : 0.58);

    // 3 split-bristle filaments per dry-brush stroke
    for (let f = -1; f <= 1; f++) {
      const fAlpha = alpha * (f === 0 ? 1.0 : 0.58);
      if (isQingming && i === 2 && f === 1) {
        ctx.strokeStyle = `rgba(111, 125, 101, ${(fAlpha * 0.85).toFixed(3)})`;
      } else {
        ctx.strokeStyle = `rgba(${inkRgb}, ${fAlpha.toFixed(3)})`;
      }
      ctx.lineWidth = Math.max(0.55, r.width * (f === 0 ? 0.72 : 0.42) * (1 - 0.35 * u));
      ctx.beginPath();
      const steps = 10;
      for (let s = 0; s <= steps; s++) {
        const su = s / steps;
        // Dry-brush skip gap near tail on outer bristles
        if (f !== 0 && su > 0.68 && su < 0.82) continue;
        const wx = xStart + su * xLen;
        const curl = k === 3 ? -Math.pow(su, 2.2) * 11 : 0; // #04 Tang Wu-style upward breeze
        const wy =
          yBase +
          f * (1.4 + su * 1.9) +
          Math.sin(su * Math.PI * 1.6 + r.phase) * r.amp * 0.38 +
          curl;
        if (s === 0 || (f !== 0 && Math.abs(su - 0.82) < 0.06)) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
    }
  }

  // 3. Subtle 2-3 cinnabar collector-seal (`朱砂印泥`) micro-flecks near the scroll seam
  for (let c = 0; c < 3; c++) {
    const m = desc.motes[c + 4];
    const age = dt - m.tBirth;
    if (age <= 0 || age >= 0.28) continue;
    const a = Math.sin((age / 0.28) * Math.PI) * 0.36 * env;
    const sx = bx - 4 + m.vx * 0.38 * age;
    const sy = ROAD_EDGE_Y - 18 - c * 14 + m.vy * 0.18 * age;
    ctx.fillStyle = `rgba(168, 43, 33, ${a.toFixed(3)})`;
    ctx.fillRect(sx, sy, 2.1, 1.9);
  }

  ctx.restore();
}

// -----------------------------------------------------------------------------
// Family C: #08 Mughal 24k Torn Gold-Leaf (*Afshan*) Motes (k = 7)
// -----------------------------------------------------------------------------
function renderMughalGoldLeafHandoff(ctx, bx, dt, env, desc) {
  ctx.save();

  // Subtle lapis & burnished gold dust shimmer along y = 680
  fillSoftAnisotropicGlow(ctx, bx + 18, ROAD_EDGE_Y - 8, 58, 24, [
    [0, `rgba(217, 161, 59, ${(0.18 * env).toFixed(3)})`],
    [0.6, `rgba(29, 67, 84, ${(0.08 * env).toFixed(3)})`],
    [1, 'rgba(29, 67, 84, 0)'],
  ]);

  const goldPalette = ['#fff2ba', '#f3ca5e', '#d9a13b', '#c78824', '#1d4354'];
  for (let i = 0; i < 20; i++) {
    const m = desc.motes[i];
    const age = dt - m.tBirth;
    if (age <= 0 || age >= m.life * 1.15) continue;
    const u = age / (m.life * 1.15);
    // Specular foil glint as thin 24k leaf tumbles in air
    const glint = 0.55 + 0.45 * Math.cos(age * 18 + m.flutterPh);
    const alpha = Math.sin(Math.PI * u) * 0.50 * glint * env;
    if (alpha <= 0.01) continue;

    const mx = bx + m.ox * 0.35 + m.vx * 0.72 * age + Math.sin(age * 11 + m.flutterPh) * 6;
    const my =
      ROAD_EDGE_Y -
      6 +
      m.oy * 0.9 +
      m.vy * 0.45 * age -
      18 * age +
      Math.cos(age * 9 + m.flutterPh) * 4;
    const scaleX = 0.35 + 0.65 * Math.abs(Math.cos(age * 12 + m.spin0));

    ctx.save();
    ctx.translate(mx, my);
    ctx.rotate(m.spin0 + m.spinV * 0.6 * age);
    ctx.scale(scaleX, 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = goldPalette[i % 5 === 4 ? 4 : i % 4];
    drawPolygonMote(ctx, 0, 0, m.size * 0.92, 0, m.polyPts);
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

// -----------------------------------------------------------------------------
// Family D: #10 Wayang Kulit Coconut-Oil Lamp (*Blencong*) Seam Flare (k = 9)
// -----------------------------------------------------------------------------
function renderWayangOilLampHandoff(ctx, bx, dt, env, clampedT, desc) {
  ctx.save();

  // Gentle 10Hz/14Hz authentic coconut-oil wick breath (subtle, localized to cotton kelir seam)
  const wickBreath = 0.92 + 0.08 * Math.sin(clampedT * 28.0) * Math.cos(clampedT * 17.0);
  const peakA = 0.34 * env * wickBreath;

  const cx = bx + 8;
  const cy = ROAD_EDGE_Y - 46;
  ctx.globalCompositeOperation = 'screen';
  fillSoftAnisotropicGlow(ctx, cx, cy, 92, 112, [
    [0.0, `rgba(255, 241, 201, ${peakA.toFixed(3)})`],
    [0.36, `rgba(255, 186, 76, ${(peakA * 0.62).toFixed(3)})`],
    [0.72, `rgba(196, 112, 28, ${(peakA * 0.22).toFixed(3)})`],
    [1.0, 'rgba(140, 62, 12, 0)'],
  ]);

  // 3 delicate perforated leather-shadow pinhole light rays fanning across the seam
  for (let r = 0; r < 3; r++) {
    const ang = -0.26 + r * 0.22 + dt * 0.35;
    const rayLen = 78 + r * 14;
    const rg = ctx.createLinearGradient(
      bx - 6,
      cy + (r - 1) * 18,
      bx + Math.cos(ang) * rayLen,
      cy + (r - 1) * 18 + Math.sin(ang) * rayLen
    );
    rg.addColorStop(0, `rgba(255, 224, 150, ${(0.16 * env).toFixed(3)})`);
    rg.addColorStop(1, 'rgba(255, 180, 70, 0)');
    ctx.strokeStyle = rg;
    ctx.lineWidth = 4.5 - r * 0.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx - 6, cy + (r - 1) * 18);
    ctx.lineTo(bx + Math.cos(ang) * rayLen, cy + (r - 1) * 18 + Math.sin(ang) * rayLen);
    ctx.stroke();
  }

  // Tiny warm oil-lamp ember motes drifting upward
  ctx.globalCompositeOperation = 'source-over';
  for (let i = 0; i < 8; i++) {
    const m = desc.motes[i];
    const age = dt - m.tBirth;
    if (age <= 0 || age >= 0.34) continue;
    const u = age / 0.34;
    const a = Math.sin(Math.PI * u) * 0.44 * env;
    const ex = bx + (m.ox * 0.5) + m.vx * 0.42 * age;
    const ey = ROAD_EDGE_Y - 14 + m.oy * 0.8 - 52 * age;
    ctx.fillStyle = `rgba(255, 208, 112, ${a.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(ex, ey, 1.2 + (i % 2) * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// -----------------------------------------------------------------------------
// Family E: #11 Ukiyo-e Edo Woodblock *Bokashi* Mist & Spray Curl (k = 10)
// -----------------------------------------------------------------------------
function renderUkiyoeBokashiHandoff(ctx, bx, dt, env, desc) {
  ctx.save();
  const uProg = clamp((dt + STD_PRE_SEC) / (STD_PRE_SEC + STD_POST_SEC), 0, 1);

  // 1. Prussian-blue (`ベロ藍`) bokashi horizontal woodblock wipe band at y = 680
  const bx0 = bx - 24 + uProg * 28;
  const bokG = ctx.createLinearGradient(bx0, 0, bx0 + 96, 0);
  bokG.addColorStop(0, 'rgba(29, 59, 92, 0)');
  bokG.addColorStop(0.28, `rgba(29, 59, 92, ${(0.24 * env).toFixed(3)})`);
  bokG.addColorStop(0.68, `rgba(59, 110, 140, ${(0.18 * env).toFixed(3)})`);
  bokG.addColorStop(1, 'rgba(240, 228, 202, 0)');
  ctx.fillStyle = bokG;
  ctx.fillRect(bx0, ROAD_EDGE_Y - 12, 96, 16);

  // 2. Two crisp keyblock-outlined Edo foam curl tendrils at wheel contact
  for (let c = 0; c < 2; c++) {
    const curlX = bx + 6 + c * 22 + uProg * 42;
    const curlY = ROAD_EDGE_Y - 3 - c * 6;
    const r = (11 - c * 3) * (0.65 + 0.35 * Math.sin(Math.PI * uProg));
    const a = 0.46 * env;

    ctx.fillStyle = `rgba(244, 234, 212, ${a.toFixed(3)})`;
    ctx.strokeStyle = `rgba(25, 44, 68, ${(a * 0.92).toFixed(3)})`;
    ctx.lineWidth = 1.05;
    ctx.beginPath();
    ctx.moveTo(curlX - 22, ROAD_EDGE_Y);
    ctx.quadraticCurveTo(curlX - 4, curlY - r * 1.25, curlX + r, curlY - r * 0.65);
    ctx.quadraticCurveTo(curlX + r * 1.35, curlY + 1, curlX + r * 0.45, curlY + 2);
    ctx.quadraticCurveTo(curlX - 6, ROAD_EDGE_Y - 1, curlX - 22, ROAD_EDGE_Y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 3. Tiny block-printed washi foam droplets
  for (let i = 0; i < 10; i++) {
    const m = desc.motes[i];
    const age = dt - m.tBirth;
    if (age <= 0 || age >= 0.28) continue;
    const u = age / 0.28;
    const a = Math.sin(Math.PI * u) * 0.48 * env;
    const dx = bx + 4 + m.vx * 0.55 * age;
    const dy = ROAD_EDGE_Y - 6 + m.vy * 0.52 * age + 150 * age * age;
    const dr = 1.4 + (i % 3) * 0.65;
    ctx.fillStyle = `rgba(245, 236, 214, ${a.toFixed(3)})`;
    ctx.strokeStyle = `rgba(29, 59, 92, ${(a * 0.85).toFixed(3)})`;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(dx, Math.min(ROAD_EDGE_Y + 2, dy), dr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

// -----------------------------------------------------------------------------
// Family F: #12 Starry Impasto Swirls, #13 Scream Acoustic Waves & #14 Nitrate Dissolve (k = 11, 12, 13)
// -----------------------------------------------------------------------------
function renderOilAndExpressionistHandoff(ctx, k, bx, dt, env, clampedT, desc) {
  ctx.save();
  ctx.lineCap = 'round';

  if (k === 11) {
    // #11 -> #12 Van Gogh Swirling Cobalt & Cadmium Impasto Bristle Dabs
    const colors = [
      { main: '31, 78, 140', hi: '132, 178, 235' },
      { main: '242, 193, 56', hi: '255, 238, 158' },
      { main: '19, 41, 75', hi: '78, 118, 176' },
      { main: '232, 225, 171', hi: '255, 252, 228' },
    ];
    const eddyX = bx + 26 + (dt + 0.22) * 95;
    const eddyY = ROAD_EDGE_Y - 34;

    for (let i = 0; i < 14; i++) {
      const m = desc.motes[i];
      const age = dt - m.tBirth;
      if (age <= 0 || age >= 0.34) continue;
      const u = age / 0.34;
      const a = Math.sin(Math.PI * u) * 0.50 * env;
      if (a <= 0.01) continue;

      const orbitR = 14 + (i % 5) * 9 + u * 18;
      const ang0 = m.spin0 + u * 2.1 * (i % 2 === 0 ? 1 : -0.8);
      const ang1 = ang0 + 0.58;
      const cx = i < 8 ? eddyX : bx + m.vx * 0.55 * age;
      const cy = i < 8 ? eddyY : ROAD_EDGE_Y - 12 + m.oy * 0.4;
      const col = colors[i % colors.length];

      // Dark impasto furrow shadow
      ctx.strokeStyle = `rgba(10, 16, 28, ${(a * 0.45).toFixed(3)})`;
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.arc(cx + 0.8, cy + 1.0, orbitR, ang0, ang1);
      ctx.stroke();

      // Main thick oil-paint body
      ctx.strokeStyle = `rgba(${col.main}, ${a.toFixed(3)})`;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.arc(cx, cy, orbitR, ang0, ang1);
      ctx.stroke();

      // Raised palette-knife specular ridge
      ctx.strokeStyle = `rgba(${col.hi}, ${(a * 0.65).toFixed(3)})`;
      ctx.lineWidth = 0.95;
      ctx.beginPath();
      ctx.arc(cx - 0.5, cy - 0.6, orbitR - 0.6, ang0 + 0.06, ang1 - 0.06);
      ctx.stroke();
    }
  } else if (k === 12) {
    // #12 -> #13 Munch Expressionist Vermilion & Amber Acoustic Wave-Streaks
    const waveCols = ['217, 78, 40', '242, 149, 68', '38, 56, 89', '230, 199, 156'];
    for (let i = 0; i < 8; i++) {
      const r = desc.ribbons[i];
      const age = dt - r.tBirth;
      if (age <= 0 || age >= 0.34) continue;
      const u = age / 0.34;
      const a = Math.sin(Math.PI * u) * 0.46 * env;
      if (a <= 0.01) continue;

      const x0 = bx - 26 + u * 48;
      const len = 52 + (i % 3) * 22;
      const y0 = ROAD_EDGE_Y - 10 + r.yOff * 1.15;
      ctx.strokeStyle = `rgba(${waveCols[i % waveCols.length]}, ${a.toFixed(3)})`;
      ctx.lineWidth = (2.4 - (i % 3) * 0.45) * (1 - 0.3 * u);
      ctx.beginPath();
      for (let s = 0; s <= 12; s++) {
        const su = s / 12;
        const wx = x0 + su * len;
        const wy = y0 + Math.sin(su * Math.PI * 2.2 - age * 22 + r.phase) * (4.5 + (i % 2) * 3.0);
        if (s === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
    }
  } else {
    // k = 13 (83.0s, bx = 13000): #13 Scream -> #14 Nosferatu Silver-Nitrate Shadow Dissolve
    for (let i = 0; i < 14; i++) {
      const m = desc.motes[i];
      const age = dt - m.tBirth;
      if (age <= 0 || age >= 0.32) continue;
      const u = age / 0.32;
      const mx = bx - 18 + m.vx * 0.65 * age;
      const my = ROAD_EDGE_Y - 12 + m.oy * 1.6 + m.vy * 0.25 * age;
      // Desaturate from warm expressionist ochre on left of 13000 to cold nitrate charcoal on right!
      const intoNitrate = smoothstep(bx - 12, bx + 24, mx);
      const cr = Math.round(lerp(198, 24, intoNitrate));
      const cg = Math.round(lerp(96, 22, intoNitrate));
      const cb = Math.round(lerp(56, 24, intoNitrate));
      const a = Math.sin(Math.PI * u) * 0.44 * env;
      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${a.toFixed(3)})`;
      drawPolygonMote(ctx, mx, my, m.size * 0.9, m.spin0 + age * 6, m.polyPts);
      ctx.fill();
    }

    // 2 fleeting 18Hz orthochromatic vertical emulsion scratches right beside the sprocket stile
    const q18 = Math.floor(clampedT * 18);
    for (let s = 0; s < 2; s++) {
      const sx = bx + 10 + s * 16 + fastSinNoise(q18, s * 13) * 5;
      const sa = 0.24 * env;
      ctx.strokeStyle = s === 0 ? `rgba(238, 220, 182, ${sa.toFixed(3)})` : `rgba(14, 13, 16, ${(sa * 1.2).toFixed(3)})`;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(sx, ROAD_EDGE_Y - 185);
      ctx.lineTo(sx + fastSinNoise(q18 + 3, s) * 2.5, ROAD_EDGE_Y + 18);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// -----------------------------------------------------------------------------
// HERO GAG (k = 14, t = 89.0s, bx = 14000): #14 Nosferatu -> #15 Oscilloscope
// High-voltage P1 green (#39ff7a + #d8ffe6 core) cathode-ray arcs & shadow-to-beam collapse
// strictly across the frame stile `x in [13820, 14180]` (zero white blob over-saturation!).
// -----------------------------------------------------------------------------
function renderNosferatuToOscilloscopeHero(ctx, bx, dt, env, clampedT, pelWorld) {
  const minX = bx - 180; // 13820
  const maxX = bx + 180; // 14180

  const rig = computePelicanRig({
    x: pelWorld.worldX,
    y: ROAD_EDGE_Y,
    pedalAngle: pelWorld.pedalAngle,
    scale: 1.0,
    slope: 0,
    speedScale: pelWorld.speedScale,
    poseMode: 'normal',
    time: clampedT,
  });

  const J = (pt) => projectNosferatuWorldJoint(pt, pelWorld.worldX);

  const rearW = J(rig.rearWheel);
  const frontW = J(rig.frontWheel);
  const bb = J(rig.bb);
  const seat = J(rig.seatCluster);
  const headTop = J(rig.headTop);
  const handle = J(rig.handleGrip);
  const tail = J(rig.tailTip);
  const chest = J(rig.chest);
  const head = J(rig.head);
  const beak = J(rig.beakTip);
  const pouch = J(rig.pouchBelly);
  const wing = J(rig.wingElbow);

  ctx.save();
  // Clip strictly to localized stile corridor [13820, 14180] per #139 Director Guardrail
  ctx.beginPath();
  ctx.rect(minX, PATCH_Y0, maxX - minX, PATCH_H);
  ctx.clip();

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Continuous P1 Phosphor Seam-Bridge Sweep across the opaque frame stile `(13958..14048, 680)`
  const bridgeSpanL = bx - lerp(28, 68, env);
  const bridgeSpanR = bx + lerp(28, 72, env);
  const buildBridgePts = () => {
    const pts = [];
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const wx = lerp(bridgeSpanL, bridgeSpanR, u);
      const pin = Math.sin(Math.PI * u);
      const hvRipple =
        Math.sin(u * 18 - clampedT * 62) * 4.5 * env * pin +
        fastSinNoise(i * 2.7, Math.floor(clampedT * 60)) * 1.8 * env * pin;
      pts.push({ x: wx, y: ROAD_EDGE_Y + hvRipple });
    }
    return pts;
  };
  const bridgePts = buildBridgePts();

  const strokePoly = (pts, col, w) => {
    if (pts.length < 2) return;
    ctx.strokeStyle = col;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  };

  strokePoly(bridgePts, `rgba(36, 228, 98, ${(0.24 * env).toFixed(3)})`, 6.2);
  strokePoly(bridgePts, `rgba(57, 255, 122, ${(0.68 * env).toFixed(3)})`, 2.6);
  strokePoly(bridgePts, `rgba(216, 255, 230, ${(0.88 * env).toFixed(3)})`, 1.15);

  // 2. Electrified Cross-Stile Rig Skeleton (welds the black shadow silhouette right across the frame
  //    border into #15's P1 vector trace, with electromagnetic vertical pinch right at x = 14000!)
  const pinchSnap = Math.exp(-Math.pow(dt / 0.14, 2)); // peaks right at t = 89.00s
  const collapsePoint = (p) => {
    const stileProx = Math.exp(-Math.pow((p.x - bx) / 26, 2)) * pinchSnap * 0.42;
    return {
      x: p.x,
      y: lerp(p.y, ROAD_EDGE_Y - 18, stileProx),
    };
  };

  const rigSegments = [
    [rearW, seat, bb, rearW],
    [seat, headTop, bb],
    [headTop, frontW],
    [headTop, handle],
    [tail, chest, head, beak, pouch, chest],
    [chest, wing, handle],
  ];

  // Mask rig skeleton intensity strongest around the stile `[bx - 125 .. bx + 125]`
  ctx.save();
  ctx.beginPath();
  ctx.rect(bx - 128, PATCH_Y0, 256, PATCH_H);
  ctx.clip();

  for (const chain of rigSegments) {
    const warped = chain.map(collapsePoint);
    strokePoly(warped, `rgba(42, 235, 105, ${(0.22 * env).toFixed(3)})`, 4.8);
    strokePoly(warped, `rgba(57, 255, 122, ${(0.64 * env).toFixed(3)})`, 2.0);
    strokePoly(warped, `rgba(216, 255, 230, ${(0.82 * env).toFixed(3)})`, 0.9);
  }

  // Electrified wheel rims straddling the stile
  for (const [origW, projW] of [
    [rig.rearWheel, rearW],
    [rig.frontWheel, frontW],
  ]) {
    if (Math.abs(projW.x - bx) > 145) continue;
    const wheelPts = [];
    const segs = 24;
    for (let i = 0; i <= segs; i++) {
      const a = origW.angle + (i / segs) * Math.PI * 2;
      const stand = 1 + 0.04 * Math.sin(a * 6 + clampedT * 42);
      const rawPt = {
        x: origW.x + Math.cos(a) * origW.r * stand,
        y: origW.y + Math.sin(a) * origW.r * stand,
      };
      wheelPts.push(collapsePoint(J(rawPt)));
    }
    strokePoly(wheelPts, `rgba(57, 255, 122, ${(0.58 * env).toFixed(3)})`, 2.1);
    strokePoly(wheelPts, `rgba(216, 255, 230, ${(0.80 * env).toFixed(3)})`, 0.9);
  }
  ctx.restore();

  // 3. High-Voltage Cathode-Ray Plasma Arcs crackling from shadow silhouette -> (14000, 680) CRT waveguide!
  const qStep = Math.floor(clampedT * 48); // crisp 48Hz HV discharge cadence
  const anchors = [beak, head, chest, frontW, bb, seat, rearW, tail];
  const waveguideHub = {
    x: bx + lerp(6, 32, clamp((dt + 0.3) / 0.6, 0, 1)),
    y: ROAD_EDGE_Y,
  };

  for (let a = 0; a < anchors.length; a++) {
    const src = anchors[a];
    if (src.x < minX + 8 || src.x > maxX - 8) continue;
    // Prioritize joints currently near or crossing the stile
    const distStile = Math.abs(src.x - bx);
    const prox = 1 - smoothstep(35, 165, distStile);
    if (prox <= 0.04) continue;

    // Pair shadow joint on left with either the CRT waveguide hub or next joint across the seam
    const dst =
      src.x < bx
        ? a % 2 === 0
          ? waveguideHub
          : { x: bx + 18 + (a % 3) * 14, y: lerp(src.y, ROAD_EDGE_Y, 0.55) }
        : { x: bx - 10, y: lerp(src.y, ROAD_EDGE_Y, 0.65) };

    const arcAlpha = env * prox * (0.58 + 0.34 * Math.abs(fastSinNoise(a * 7.3, qStep)));
    const arcPts = [];
    const steps = 9;
    for (let s = 0; s <= steps; s++) {
      const u = s / steps;
      const bow = Math.sin(Math.PI * u);
      const jx = fastSinNoise(s * 3.1 + a * 13, qStep) * 11 * bow;
      const jy =
        fastSinNoise(s * 5.7 + a * 19, qStep + 7) * 16 * bow +
        Math.sin(u * Math.PI * 2 + clampedT * 45 + a) * 5 * bow;
      arcPts.push({
        x: lerp(src.x, dst.x, u) + jx,
        y: lerp(src.y, dst.y, u) + jy,
      });
    }

    strokePoly(arcPts, `rgba(57, 255, 122, ${(arcAlpha * 0.72).toFixed(3)})`, 2.4);
    strokePoly(arcPts, `rgba(222, 255, 235, ${(arcAlpha * 0.92).toFixed(3)})`, 0.95);

    // Small crisp cathode dwell pinpoint at arc attachment (r <= 3.5px, never a white blob)
    ctx.fillStyle = `rgba(57, 255, 122, ${(arcAlpha * 0.45).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(src.x, src.y, 3.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(238, 255, 245, ${(arcAlpha * 0.92).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(src.x, src.y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Crisp small cathode lock-on glint right at `(14000, 680)` during peak collapse
  if (pinchSnap > 0.05) {
    const spA = pinchSnap * env * 0.68;
    ctx.strokeStyle = `rgba(216, 255, 230, ${spA.toFixed(3)})`;
    ctx.lineWidth = 1.4;
    const arm = 18 * pinchSnap + 6;
    ctx.beginPath();
    ctx.moveTo(bx - arm, ROAD_EDGE_Y);
    ctx.lineTo(bx + arm * 1.4, ROAD_EDGE_Y);
    ctx.moveTo(bx, ROAD_EDGE_Y - arm * 0.75);
    ctx.lineTo(bx, ROAD_EDGE_Y + arm * 0.75);
    ctx.stroke();
  }

  ctx.restore();
}

// -----------------------------------------------------------------------------
// Family G: Digital, Analog-Video & Generative-Code Handoffs (k = 15, 16, 17, 18, 19)
// -----------------------------------------------------------------------------
function renderDigitalEraHandoff(ctx, k, bx, dt, env, clampedT, cam, pelWorld, desc) {
  const surroundDim = clamp(cam?.surroundDim || 0, 0, 1);

  const rig = computePelicanRig({
    x: pelWorld.worldX,
    y: ROAD_EDGE_Y,
    pedalAngle: pelWorld.pedalAngle,
    scale: 1.0,
    slope: 0,
    speedScale: pelWorld.speedScale,
    poseMode: 'normal',
    time: clampedT,
  });

  if (k === 15) {
    // #15 Oscilloscope -> #16 8-bit (95.0s, bx = 15000):
    // Analog P1 green phosphor beam discretizing into crisp 8x8 NES pixel blocks across the bezel!
    ctx.save();
    const nesCols = ['#39ff7a', '#00a800', '#f8b800', '#fcfcfc', '#5c94fc'];
    const joints = [
      rig.frontWheel,
      rig.beakTip,
      rig.head,
      rig.bb,
      rig.rearWheel,
      { x: bx + 8, y: ROAD_EDGE_Y },
    ];

    // Left-of-seam analog phosphor tail stepping into 8x8 pixel grid on right
    ctx.strokeStyle = `rgba(57, 255, 122, ${(0.52 * env).toFixed(3)})`;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(bx - 36, ROAD_EDGE_Y);
    ctx.lineTo(bx + 4, ROAD_EDGE_Y);
    ctx.stroke();

    for (let i = 0; i < 18; i++) {
      const m = desc.motes[i];
      const age = dt - m.tBirth;
      if (age <= 0 || age >= 0.30) continue;
      const u = age / 0.30;
      const anchor = joints[i % joints.length];
      if (Math.abs(anchor.x - bx) > 135) continue;

      const rawX = lerp(bx, anchor.x, 0.55) + m.vx * 0.42 * age - 8;
      const rawY = anchor.y + (m.oy + 28) * 0.45;
      // Snap strictly to 8x8 NES tile grid!
      const gx = Math.floor(rawX / 8) * 8;
      const gy = Math.floor(rawY / 8) * 8;
      const a = Math.sin(Math.PI * u) * 0.56 * env;
      const isRight = gx >= bx;
      const col = isRight ? nesCols[1 + (i % 4)] : '#39ff7a';

      ctx.globalAlpha = a;
      ctx.fillStyle = col;
      ctx.fillRect(gx, gy, 7, 7);
      ctx.strokeStyle = isRight ? '#181c28' : '#b8ffd0';
      ctx.lineWidth = 1;
      ctx.strokeRect(gx + 0.5, gy + 0.5, 6, 6);
    }
    ctx.restore();
    return;
  }

  if (k === 16) {
    // #16 8-bit -> #17 Win2000 Chat (101.0s, bx = 16000):
    // Localized Win2000 GDI `BitBlt` raster scanline band & 256-color Bayer dither strip
    ctx.save();
    const uProg = clamp((dt + STD_PRE_SEC) / (STD_PRE_SEC + STD_POST_SEC), 0, 1);
    const bandCols = ['#0054e3', '#ece9d8', '#3a6ea5', '#ffffff'];

    for (let i = 0; i < 14; i++) {
      const sy = Math.round((ROAD_EDGE_Y - 196 + i * 15) / 2) * 2;
      const shift = Math.sin(i * 1.9 + uProg * 8) * 14;
      const sx = bx - 22 + uProg * 36 + shift;
      const sw = 28 + ((i * 17) % 36);
      const a = (0.28 + 0.16 * ((i + 1) % 2)) * env;

      ctx.fillStyle = bandCols[i % bandCols.length];
      ctx.globalAlpha = a;
      ctx.fillRect(sx, sy, sw, 2);

      // Crisp 2x2 256-color GIF dither squares at leading edge of each BitBlt slice
      if (i % 2 === 0) {
        for (let d = 0; d < 4; d++) {
          ctx.fillRect(sx + sw + d * 4, sy + (d % 2) * 2, 2, 2);
        }
      }
    }
    ctx.restore();
    return;
  }

  if (k === 17) {
    // #17 Win2000 -> #18 Vaporwave (107.0s, bx = 17000):
    // Localized VHS magenta/cyan horizontal tracking chroma-comb bar near y = 680 & wheel hubs
    ctx.save();
    const qVhs = Math.floor(clampedT * 30);
    const baseBands = [ROAD_EDGE_Y - 2, ROAD_EDGE_Y - 46, ROAD_EDGE_Y - 118];

    for (let b = 0; b < baseBands.length; b++) {
      const cy = baseBands[b];
      const rows = b === 0 ? 7 : 4;
      for (let r = 0; r < rows; r++) {
        const y = cy - rows * 1.5 + r * 3.2;
        const jitter = fastSinNoise(r + b * 9, qVhs) * 18;
        const x0 = bx - 38 + jitter + (dt + 0.2) * 55;
        const w = (b === 0 ? 78 : 52) * (0.65 + 0.35 * Math.abs(fastSinNoise(r * 3, qVhs + 5)));
        const a = (b === 0 ? 0.42 : 0.30) * env;

        ctx.globalAlpha = a;
        ctx.fillStyle = r % 2 === 0 ? '#ff4ecd' : '#00f0ff';
        ctx.fillRect(x0, y, w, 1.8);

        if (r === 1) {
          ctx.globalAlpha = a * 0.75;
          ctx.fillStyle = '#ffe6f7';
          ctx.fillRect(x0 + w * 0.25, y + 0.4, w * 0.45, 1.0);
        }
      }
    }
    ctx.restore();
    return;
  }

  if (k === 18) {
    // #18 Vaporwave -> #19 Shortvideo (113.0s, bx = 18000):
    // Sleek vertical 9:16 dark-glass & #25f4ee / #ff2a5f neon edge-sweep strictly INSIDE x >= 18000
    // (respecting `cam.surroundDim` so ZERO pixels ever leak onto #18's dimmed velvet curtain!).
    ctx.save();
    ctx.beginPath();
    ctx.rect(bx + 1, PATCH_Y0, PATCH_HALF_W - 2, PATCH_H);
    ctx.clip();

    const uProg = smootherstep(-STD_PRE_SEC, STD_POST_SEC, dt);
    const sweepX = bx + 3 + uProg * 44;
    const sweepA = 0.38 * env;

    const glassG = ctx.createLinearGradient(sweepX - 14, 0, sweepX + 10, 0);
    glassG.addColorStop(0, 'rgba(37, 244, 238, 0)');
    glassG.addColorStop(0.55, `rgba(37, 244, 238, ${(sweepA * 0.48).toFixed(3)})`);
    glassG.addColorStop(0.85, `rgba(255, 42, 95, ${(sweepA * 0.55).toFixed(3)})`);
    glassG.addColorStop(1, 'rgba(255, 42, 95, 0)');

    ctx.fillStyle = glassG;
    ctx.fillRect(sweepX - 14, 445, 24, 255);

    // Razor-thin specular chamfer line along the advancing 9:16 glass edge
    const lineG = ctx.createLinearGradient(0, 445, 0, 700);
    lineG.addColorStop(0, 'rgba(255, 255, 255, 0)');
    lineG.addColorStop(0.25, `rgba(37, 244, 238, ${(sweepA * 1.15).toFixed(3)})`);
    lineG.addColorStop(0.75, `rgba(255, 42, 95, ${(sweepA * 1.15).toFixed(3)})`);
    lineG.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.strokeStyle = lineG;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(sweepX, 448);
    ctx.lineTo(sweepX, 698);
    ctx.stroke();

    ctx.restore();
    return;
  }

  // k = 19 (119.0s, bx = 19000): #19 Shortvideo -> #20 Code
  // Crisp generative-CAD Bezier anchor nodes & tangent handles (`●──□` in #7ee787 / #58a6ff / #f78166)
  // snapping onto the pelican rig's wheel/beak/frame joints across `x = 19000`, attenuated by
  // `(1 - surroundDim)` outside `#19` so nothing floats prematurely over the 9:16 curtain!
  ctx.save();
  const codeNodes = [
    { pt: rig.beakTip, tx: 22, ty: -14 },
    { pt: rig.pouchBelly, tx: 18, ty: 12 },
    { pt: rig.head, tx: -16, ty: -18 },
    { pt: rig.frontWheel, tx: 0, ty: -26 },
    { pt: rig.headTop, tx: 18, ty: -12 },
    { pt: rig.seatCluster, tx: -18, ty: -14 },
    { pt: rig.bb, tx: 16, ty: 14 },
    { pt: rig.rearWheel, tx: -20, ty: -20 },
  ];

  // Subtle vector horizon lock tick at (19000+, 680) weighted by curtain openness
  const rightOpen = 1 - surroundDim * 0.92;
  if (rightOpen > 0.04) {
    ctx.strokeStyle = `rgba(88, 166, 255, ${(0.36 * env * rightOpen).toFixed(3)})`;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(bx + 1, ROAD_EDGE_Y);
    ctx.lineTo(bx + 68, ROAD_EDGE_Y);
    ctx.stroke();
  }

  for (let i = 0; i < codeNodes.length; i++) {
    const { pt, tx, ty } = codeNodes[i];
    const distSeam = Math.abs(pt.x - bx);
    if (distSeam > 148) continue;

    // Respect 9:16 surroundDim on x > 19000 while curtain is still opening (118.65..119.45s),
    // and keep x < 19000 restrained inside #19's right pillarbox
    const sideVis = pt.x >= bx ? rightOpen : 0.45 * (1 - surroundDim * 0.5);
    const prox = (1 - smoothstep(28, 145, distSeam)) * env * sideVis;
    if (prox <= 0.02) continue;

    // Elastic snap-in of Bezier tangent handle toward exact joint
    const snap = smoothstep(bx - 36, bx + 28, pt.x);
    const hx1 = pt.x + tx * (1.45 - 0.45 * snap);
    const hy1 = pt.y + ty * (1.45 - 0.45 * snap);
    const hx2 = pt.x - tx * (1.45 - 0.45 * snap);
    const hy2 = pt.y - ty * (1.45 - 0.45 * snap);

    // Bilateral G2 tangent stem (`●──□──●`)
    ctx.strokeStyle = `rgba(88, 166, 255, ${(0.52 * prox).toFixed(3)})`;
    ctx.lineWidth = 1.05;
    ctx.beginPath();
    ctx.moveTo(hx2, hy2);
    ctx.lineTo(hx1, hy1);
    ctx.stroke();

    // Coral control-point circles (`●` #f78166)
    ctx.fillStyle = `rgba(247, 129, 102, ${(0.62 * prox).toFixed(3)})`;
    for (const [hx, hy] of [
      [hx1, hy1],
      [hx2, hy2],
    ]) {
      ctx.beginPath();
      ctx.arc(hx, hy, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Emerald SVG on-curve anchor node square (`□` #7ee787 with dark #0d1117 core)
    const sq = 4.6;
    ctx.fillStyle = `rgba(13, 17, 23, ${(0.82 * prox).toFixed(3)})`;
    ctx.fillRect(pt.x - sq / 2, pt.y - sq / 2, sq, sq);
    ctx.strokeStyle = `rgba(126, 231, 135, ${(0.76 * prox).toFixed(3)})`;
    ctx.lineWidth = 1.25;
    ctx.strokeRect(pt.x - sq / 2, pt.y - sq / 2, sq, sq);
  }

  ctx.restore();
}

/**
 * Renders localized 0.35s~0.56s (`0.90s` on `k=14`) cross-frame medium micro-physics
 * in world coordinates right over the picture-frame stiles (`t_cross = 5.0 + 6.0 * k`, `k = 0..19`).
 *
 * @param {object} p - Active p5 WEBGL instance (currently inside camera world transform)
 * @param {object} kit - Shared toolkit instance from `createKit`
 * @param {number} clampedT - Deterministic film time in `[0, 137.0]`
 * @param {object} cam - Camera state from `getCameraState(clampedT)`
 * @param {object} pelWorld - Pelican world state from `getPelicanWorldState(clampedT)`
 */
export function renderThresholdMicroPhysics(p, kit, clampedT, cam, pelWorld) {
  if (!p || !pelWorld) return;

  // Nearest crossing index k in [0..19] (`t_cross = 5.0 + 6.0 * k`, `bx = k * 1000`)
  const k = Math.round((clampedT - INTRO_SEC) / SCENE_SEC);
  if (k < 0 || k >= NUM_SCENES) return;

  const tc = INTRO_SEC + k * SCENE_SEC;
  const dt = clampedT - tc;
  const preWin = k === 14 ? HERO_HALF_SEC : STD_PRE_SEC;
  const postWin = k === 14 ? HERO_HALF_SEC : STD_POST_SEC;

  // Instant <0.001ms early-out outside active threshold window (~90% of film frames)
  if (dt <= -preWin || dt >= postWin) return;

  const env =
    k === 14
      ? smoothstep(-HERO_HALF_SEC, -0.10, dt) * (1 - smoothstep(0.12, HERO_HALF_SEC, dt))
      : smoothstep(-STD_PRE_SEC, -0.06, dt) * (1 - smoothstep(0.08, STD_POST_SEC, dt));
  if (env <= 0.004) return;

  const bx = k * PANEL_SIZE;
  const patchX0 = bx - PATCH_HALF_W;
  const patchG = getPooledPatch(p);

  patchG.clear();
  const ctx = patchG.drawingContext;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.translate(-patchX0, -PATCH_Y0);

  const desc = getCrossingDescriptors(k);

  if (k === 0 || k === 1 || k === 2 || k === 6) {
    renderMineralAndRubbingHandoff(ctx, k, bx, dt, env, desc);
  } else if (k === 3 || k === 4 || k === 5 || k === 8) {
    renderInkScrollHandoff(ctx, k, bx, dt, env, desc);
  } else if (k === 7) {
    renderMughalGoldLeafHandoff(ctx, bx, dt, env, desc);
  } else if (k === 9) {
    renderWayangOilLampHandoff(ctx, bx, dt, env, clampedT, desc);
  } else if (k === 10) {
    renderUkiyoeBokashiHandoff(ctx, bx, dt, env, desc);
  } else if (k === 11 || k === 12 || k === 13) {
    renderOilAndExpressionistHandoff(ctx, k, bx, dt, env, clampedT, desc);
  } else if (k === 14) {
    renderNosferatuToOscilloscopeHero(ctx, bx, dt, env, clampedT, pelWorld);
  } else {
    renderDigitalEraHandoff(ctx, k, bx, dt, env, clampedT, cam, pelWorld, desc);
  }

  ctx.restore();

  p.push();
  p.imageMode(p.CORNER);
  p.noTint();
  p.image(patchG, patchX0, PATCH_Y0, PATCH_W, PATCH_H);
  p.pop();
}
