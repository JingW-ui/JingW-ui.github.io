// src/scenes/s07_maya.js
// #07 玛雅抄本 (约 1200 · Dresden Codex SLUB Museum-Authentic Screenfold Edition — r3)
// - Physical Medium: Cross-beaten Amatl (Ficus) bark-fiber sheet coated in brittle calcium-carbonate lime
//   stucco (gesso) with genuine 3D-edged spalling along worn margins & accordion screenfold hinges (x=368, 717),
//   tropical humidity tide-lines & granular Palygorskite Maya-Blue / Cochineal Cinnabar washes baked via
//   `kit.bakeBrush` -> `kit.bake2D` (100% `slot.g2d` / `outro.js` compatible, steady-state < 15ms).
// - Zero Vector Primitives & Zero Modern Fonts: Custom `drawQuillRibbon` agave/hair-quill brush polygon engine
//   with pressure modulation, organic hand-tremor, corner ink-pooling, and dry-bristle splits. All modern
//   UI boxes and computer typography inside the artwork are 100% replaced with authentic Maya glyphic iconography.
// - Codex Canon Rider & Craft Bicycle: Water-Bird Deity Pelican (Itzam Yeh) with asymmetric hand-wash stucco
//   reserve gaps, 6-segment traveling-wave Quetzal plumes,riding a Bicephalic Kukulkán Feathered-Serpent
//   carved chicozapote hardwood & henequen-lashed frame with hand-dressed polygonal obsidian solar stone wheels.
// - Bar 2 Vigesimal Tally & Scribe Physics: Pictographic Foot-Pedaling-Wheel header emblem, live crank-to-column
//   Cinnabar Ik' breath-scroll pulse on every revolution, Ah Ts'ib scribe dipping into conch inkpot before
//   brushing wet-to-matte cinnabar bars/dots, and self-evident visual legend equations ([Shell = Empty Hand],
//   [5 Dots -> 1 Bar]).

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  clamp,
  smoothstep,
} from '../beat/timeline.js';
import { computePelicanRig, solveTwoBoneIK } from '../rig/pelican.js';

const lerp = (a, b, u) => a + (b - a) * u;

const COL = {
  barkDeep: '#563b1f',
  barkDark: '#7a5630',
  barkMid: '#a57d4d',
  barkLight: '#cca875',
  stuccoShadow: '#cbb78e',
  stuccoWarm: '#e3d0a7',
  stuccoBase: '#eee0be',
  stuccoHi: '#f8f0da',
  stuccoChalk: '#fcf7e8',
  charcoal: '#191410',
  charcoalSoft: '#2f261f',
  cinnabar: '#ab281b',
  cinnabarWet: '#cf3120',
  cinnabarDeep: '#751810',
  mayaBlue: '#217369',
  mayaBlueLight: '#499d90',
  mayaBlueDark: '#134740',
  ochre: '#cf9122',
  ochreLight: '#e6bc56',
  ochreDeep: '#966312',
  jade: '#2b7d4b',
  jadeLight: '#5eb077',
  terracotta: '#bc6d36',
  terracottaDark: '#965123',
  obsidian: '#161519',
  obsidianGlint: '#526275',
};

// Fast deterministic hash & 2D value/FBM/Worley noise for stucco fracture & hand-quill modulation
function hash2(ix, iy, seed = 1) {
  let h = (Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(seed, 1442695041)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) * 2.3283064365386963e-10;
}

function vnoise2(x, y, seed = 1) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
}

function fbm2(x, y, seed = 1, octaves = 4) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amp * vnoise2(x * freq, y * freq, seed + i * 31);
    freq *= 2.03;
    amp *= 0.5;
  }
  return sum;
}

function worleyEdge2(x, y, seed = 7) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  let d1 = 99;
  let d2 = 99;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = ix + dx + 0.15 + 0.7 * hash2(ix + dx, iy + dy, seed);
      const cy = iy + dy + 0.15 + 0.7 * hash2(ix + dx, iy + dy, seed + 97);
      const d = Math.hypot(x - cx, y - cy);
      if (d < d1) {
        d2 = d1;
        d1 = d;
      } else if (d < d2) {
        d2 = d;
      }
    }
  }
  return d2 - d1;
}

/**
 * Generates an organic hand-modulated polyline around a rounded codex rectangle (ZERO `roundRect` / `strokeRect`).
 */
function buildCodexBoxPoints(x, y, w, h, corner = 5, seed = 11, jitter = 0.55) {
  const c = Math.min(corner, w * 0.35, h * 0.35);
  const raw = [
    [x + c, y],
    [x + w * 0.5, y],
    [x + w - c, y],
    [x + w, y + c],
    [x + w, y + h * 0.5],
    [x + w, y + h - c],
    [x + w - c, y + h],
    [x + w * 0.5, y + h],
    [x + c, y + h],
    [x, y + h - c],
    [x, y + h * 0.5],
    [x, y + c],
  ];
  const pts = [];
  const n = raw.length;
  for (let i = 0; i < n; i++) {
    const p0 = raw[i];
    const p1 = raw[(i + 1) % n];
    const dist = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
    const steps = Math.max(2, Math.ceil(dist / 14));
    for (let s = 0; s < steps; s++) {
      const u = s / steps;
      const px = lerp(p0[0], p1[0], u);
      const py = lerp(p0[1], p1[1], u);
      const jx = (hash2(i * 17 + s, seed, 3) - 0.5) * 2 * jitter;
      const jy = (hash2(i * 17 + s, seed, 9) - 0.5) * 2 * jitter;
      pts.push([px + jx, py + jy]);
    }
  }
  pts.push([pts[0][0], pts[0][1]]);
  return pts;
}

/**
 * Generates a hand-drawn slightly irregular oval/disc polygon (ZERO `ctx.arc` / `ctx.ellipse`).
 */
function buildHandDiscPoints(cx, cy, rx, ry = rx, rot = 0, steps = 20, seed = 5, wobble = 0.045) {
  const pts = [];
  const ca = Math.cos(rot);
  const sa = Math.sin(rot);
  for (let i = 0; i <= steps; i++) {
    const idx = i % steps;
    const a = (idx / steps) * Math.PI * 2;
    const rScale = 1 + (hash2(idx, seed, 19) - 0.5) * 2 * wobble;
    const lx = Math.cos(a) * rx * rScale;
    const ly = Math.sin(a) * ry * rScale;
    pts.push([cx + lx * ca - ly * sa, cy + lx * sa + ly * ca]);
  }
  return pts;
}

/**
 * Core Dresden Codex Agave/Hair-Quill Variable-Width Brush Ribbon Engine!
 * Extrudes a polygon ribbon with calligraphic entry/exit pressure swell, organic hand-tremor,
 * ink pooling at sharp bends, and optional dry-bristle split.
 */
function drawQuillRibbon(ctx, pts, {
  wStart = 2.6,
  wEnd = 2.2,
  color = COL.charcoal,
  seed = 1,
  wobble = 0.45,
  poolCorners = true,
  drySplit = false,
} = {}) {
  if (!pts || pts.length < 2) return;
  const n = pts.length;
  const left = [];
  const right = [];

  for (let i = 0; i < n; i++) {
    const pPrev = pts[Math.max(0, i - 1)];
    const pCurr = pts[i];
    const pNext = pts[Math.min(n - 1, i + 1)];
    let tx = pNext[0] - pPrev[0];
    let ty = pNext[1] - pPrev[1];
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const nx = -ty;
    const ny = tx;

    const u = i / (n - 1);
    // Agave-quill entry dab swell + mid-stroke modulation + slight exit taper
    const entrySwell = i === 0 ? 1.18 : i === n - 1 ? 0.86 : 1.0;
    const pressureWave = 1 + 0.18 * Math.sin(u * Math.PI * 3.2 + seed * 1.7) + (hash2(i, seed, 41) - 0.5) * 0.22;
    const halfW = Math.max(0.45, lerp(wStart, wEnd, u) * 0.5 * entrySwell * pressureWave);
    const tremor = (hash2(i, seed, 73) - 0.5) * 2 * wobble;

    left.push([pCurr[0] + nx * (halfW + tremor), pCurr[1] + ny * (halfW + tremor)]);
    right.push([pCurr[0] - nx * (halfW - tremor), pCurr[1] - ny * (halfW - tremor)]);
  }

  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i < n; i++) ctx.lineTo(left[i][0], left[i][1]);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
  ctx.closePath();
  ctx.fill();

  // Subtle ink-pooling bead at sharp Maya calligraphic turns
  if (poolCorners && n >= 3) {
    for (let i = 1; i < n - 1; i++) {
      const ax = pts[i][0] - pts[i - 1][0];
      const ay = pts[i][1] - pts[i - 1][1];
      const bx = pts[i + 1][0] - pts[i][0];
      const by = pts[i + 1][1] - pts[i][1];
      const la = Math.hypot(ax, ay);
      const lb = Math.hypot(bx, by);
      if (la > 1.5 && lb > 1.5) {
        const dot = (ax * bx + ay * by) / (la * lb);
        if (dot < 0.45) {
          const pr = Math.max(1.1, wStart * 0.56);
          const poolPts = buildHandDiscPoints(pts[i][0], pts[i][1], pr, pr * 0.9, i * 0.7, 7, seed + i, 0.12);
          ctx.beginPath();
          ctx.moveTo(poolPts[0][0], poolPts[0][1]);
          for (let k = 1; k < poolPts.length; k++) ctx.lineTo(poolPts[k][0], poolPts[k][1]);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  }

  // Optional dry-bristle split scratch exposing lime gesso inside thick border strokes
  if (drySplit && wStart >= 2.8 && n >= 4) {
    ctx.strokeStyle = 'rgba(244, 232, 204, 0.34)';
    ctx.lineWidth = 0.75;
    ctx.beginPath();
    const i0 = Math.floor(n * 0.25);
    const i1 = Math.min(n - 1, Math.floor(n * 0.78));
    for (let i = i0; i <= i1; i++) {
      if (i === i0) ctx.moveTo(pts[i][0] + 0.5, pts[i][1] - 0.4);
      else ctx.lineTo(pts[i][0] + 0.5, pts[i][1] - 0.4);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Fills a polygon with a mineral pigment wash (including authentic Dresden Codex hand-coloring
 * registration offset & stucco reserve gap!) and outlines it with `drawQuillRibbon`.
 */
function paintCodexShape(ctx, pts, {
  fill = null,
  stroke = COL.charcoal,
  lw = 2.5,
  seed = 1,
  washJitter = 1.15,
  wobble = 0.42,
  drySplit = false,
} = {}) {
  if (!pts || pts.length < 3) return;
  if (fill) {
    // Authentic Maya scribe wash registration drift: color wash sits slightly shifted/contracted
    // relative to charcoal ink contour, letting tiny breathing slivers of white gesso peek through!
    let cx = 0;
    let cy = 0;
    for (const p of pts) {
      cx += p[0];
      cy += p[1];
    }
    cx /= pts.length;
    cy /= pts.length;
    const shiftX = (hash2(seed, 11, 5) - 0.46) * washJitter * 1.45;
    const shiftY = (hash2(seed, 23, 7) - 0.46) * washJitter * 1.45;

    ctx.save();
    ctx.fillStyle = fill;
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const dx = pts[i][0] - cx;
      const dy = pts[i][1] - cy;
      const shrink = 0.965 + (hash2(i, seed, 61) - 0.5) * 0.05;
      const wx = cx + dx * shrink + shiftX;
      const wy = cy + dy * shrink + shiftY;
      if (i === 0) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  if (lw > 0 && stroke) {
    drawQuillRibbon(ctx, pts, {
      wStart: lw * 1.05,
      wEnd: lw * 0.92,
      color: stroke,
      seed,
      wobble,
      drySplit,
    });
  }
}

function paintCodexBox(ctx, x, y, w, h, {
  fill = null,
  stroke = COL.charcoal,
  lw = 2.5,
  corner = 4,
  seed = 1,
  washJitter = 1.1,
  drySplit = false,
} = {}) {
  const pts = buildCodexBoxPoints(x, y, w, h, corner, seed, 0.5);
  paintCodexShape(ctx, pts, { fill, stroke, lw, seed, washJitter, drySplit });
}

function paintCodexDisc(ctx, cx, cy, rx, ry, {
  rot = 0,
  steps = 16,
  fill = null,
  stroke = COL.charcoal,
  lw = 2.2,
  seed = 3,
  washJitter = 0.9,
} = {}) {
  const pts = buildHandDiscPoints(cx, cy, rx, ry, rot, steps, seed, 0.055);
  paintCodexShape(ctx, pts, { fill, stroke, lw, seed, washJitter });
}

/**
 * Bakes granular mineral pigment swatches (Palygorskite Maya Blue, Cochineal Cinnabar,
 * Hematite Ochre, Guatemalan Jadeite, Aged Lime Stucco, Terracotta) into `CanvasPattern`s
 * so even dynamic rider/wheel fills carry genuine mineral pigment mottling & gesso brush tooth!
 */
function getMayaPigmentSwatches(kit) {
  const atlas = kit.bake2D('s07_pigment_swatches_r3', (_g, ctx, rng) => {
    const specs = [
      { idx: 0, base: [33, 115, 105], hi: [84, 168, 154], lo: [18, 68, 61] },   // Maya Blue
      { idx: 1, base: [173, 42, 28], hi: [216, 78, 54], lo: [115, 22, 15] },    // Cinnabar
      { idx: 2, base: [210, 148, 38], hi: [242, 198, 96], lo: [148, 96, 18] },  // Ochre
      { idx: 3, base: [46, 128, 78], hi: [104, 182, 126], lo: [26, 82, 48] },   // Jade
      { idx: 4, base: [244, 234, 208], hi: [253, 248, 234], lo: [215, 197, 158] }, // Stucco Ivory
      { idx: 5, base: [188, 108, 54], hi: [218, 142, 84], lo: [138, 72, 32] },  // Terracotta
    ];
    const tile = 128;
    const img = ctx.createImageData(tile * 3, tile * 2);
    const data = img.data;
    const W = tile * 3;

    for (const sp of specs) {
      const ox = (sp.idx % 3) * tile;
      const oy = Math.floor(sp.idx / 3) * tile;
      const sBase = sp.idx * 97 + 13;
      for (let py = 0; py < tile; py++) {
        for (let px = 0; px < tile; px++) {
          const n1 = fbm2((px + ox) * 0.065, (py + oy) * 0.065, sBase, 3);
          const n2 = vnoise2(px * 0.35, py * 0.14, sBase + 41); // horizontal brush-stroke streak
          const gran = hash2(px, py, sBase + 83);
          // Occasional dry-brush tooth skip revealing pale lime gesso [246, 236, 212]
          const skip = n1 > 0.68 && n2 > 0.72 ? 0.48 : 0;
          const mix = clamp(n1 * 0.72 + n2 * 0.28 + (gran - 0.5) * 0.16, 0, 1);

          let r = mix < 0.5 ? lerp(sp.lo[0], sp.base[0], mix * 2) : lerp(sp.base[0], sp.hi[0], (mix - 0.5) * 2);
          let g = mix < 0.5 ? lerp(sp.lo[1], sp.base[1], mix * 2) : lerp(sp.base[1], sp.hi[1], (mix - 0.5) * 2);
          let b = mix < 0.5 ? lerp(sp.lo[2], sp.base[2], mix * 2) : lerp(sp.base[2], sp.hi[2], (mix - 0.5) * 2);
          if (skip > 0) {
            r = lerp(r, 246, skip);
            g = lerp(g, 236, skip);
            b = lerp(b, 212, skip);
          }
          const idx = ((oy + py) * W + (ox + px)) * 4;
          data[idx] = r | 0;
          data[idx + 1] = g | 0;
          data[idx + 2] = b | 0;
          data[idx + 3] = 255;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
    if (rng() < -1) ctx.fillRect(0, 0, 1, 1);
  }, 384, 256);

  if (!atlas._swatches && atlas.canvas) {
    const names = ['mayaBlue', 'cinnabar', 'ochre', 'jade', 'stucco', 'terracotta'];
    const pats = {};
    for (let i = 0; i < names.length; i++) {
      const sub = kit.bake2D(`s07_swatch_${names[i]}_r3`, (_sg, sctx) => {
        const ox = (i % 3) * 128;
        const oy = Math.floor(i / 3) * 128;
        sctx.drawImage(atlas.canvas, ox, oy, 128, 128, 0, 0, 128, 128);
      }, 128, 128);
      pats[names[i]] = sub.drawingContext.createPattern(sub.canvas, 'repeat') || COL[names[i]] || COL.stuccoHi;
    }
    atlas._swatches = pats;
  }
  return atlas._swatches || {
    mayaBlue: COL.mayaBlue,
    cinnabar: COL.cinnabar,
    ochre: COL.ochre,
    jade: COL.jade,
    stucco: COL.stuccoHi,
    terracotta: COL.terracotta,
  };
}

/**
 * Draws the Dresden Codex Stylized Red Conch Shell = 0 (贝壳零符) with hand-brushed quill contours.
 */
function drawMayaShellZero(ctx, cx, cy, scale = 1.0, wetGlow = 0, sw = null) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  if (wetGlow > 0.03) {
    // Organic wet cinnabar soak halo into lime plaster (no digital shadowBlur)
    paintCodexDisc(ctx, 0, 0, 30 + wetGlow * 4, 18 + wetGlow * 3, {
      steps: 16,
      fill: `rgba(196, 48, 30, ${(wetGlow * 0.28).toFixed(3)})`,
      lw: 0,
      seed: 19,
      washJitter: 0.4,
    });
  }

  // Plump asymmetric cowrie/conch shell body
  paintCodexDisc(ctx, 0, 0, 25, 14.5, {
    rot: -0.04,
    steps: 18,
    fill: wetGlow > 0.18 ? COL.cinnabarWet : (sw ? sw.cinnabar : COL.cinnabar),
    stroke: COL.charcoal,
    lw: 2.5,
    seed: 31,
    washJitter: 1.0,
  });

  // Pale lime-stucco inner aperture slit
  paintCodexDisc(ctx, 0, 2.2, 17, 5.2, {
    steps: 14,
    fill: COL.stuccoHi,
    stroke: COL.charcoal,
    lw: 1.9,
    seed: 37,
    washJitter: 0.6,
  });

  // Hand-brushed shell plication ribs
  for (let r = -12; r <= 12; r += 6) {
    drawQuillRibbon(
      ctx,
      [
        [r, -13.5],
        [r * 0.9, -8.5],
        [r * 0.82, -3.2],
      ],
      { wStart: 1.9, wEnd: 1.5, color: COL.charcoal, seed: 50 + r, wobble: 0.25 }
    );
  }
  // Three spire dots below aperture
  for (let d = -8; d <= 8; d += 8) {
    paintCodexDisc(ctx, d, 9.2, 1.9, 1.8, {
      steps: 8,
      fill: COL.stuccoHi,
      lw: 0,
      seed: 70 + d,
      washJitter: 0,
    });
  }

  ctx.restore();
}

/**
 * Draws the Classical Maya Empty Open-Hand Zero Glyph (`Mih` 空手零符) for zero-text equation clarity!
 */
function drawMayaEmptyHandZero(ctx, cx, cy, scale = 1.0, sw = null) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Open palm + thumb + 4 extended fingers in Dresden Codex profile
  const handPts = [
    [-16, 10],
    [-18, -2],
    [-11, -11], // thumb tip
    [-6, -6],
    [12, -11],  // index
    [16, -7],
    [17, -1],   // middle/ring
    [14, 5],
    [8, 10],    // little finger & palm heel
    [-8, 12],
    [-16, 10],
  ];
  paintCodexShape(ctx, handPts, {
    fill: sw ? sw.terracotta : COL.terracotta,
    stroke: COL.charcoal,
    lw: 2.1,
    seed: 88,
    washJitter: 0.8,
  });

  // Finger division lines & jade wrist bead + inner spiral "completion/zero" curl
  drawQuillRibbon(ctx, [[1, -5], [14, -5]], { wStart: 1.4, wEnd: 1.1, seed: 91, wobble: 0.2 });
  drawQuillRibbon(ctx, [[2, 0], [15, 0]], { wStart: 1.4, wEnd: 1.1, seed: 92, wobble: 0.2 });
  drawQuillRibbon(ctx, [[-6, 4], [-1, 1], [3, 4], [0, 7]], { wStart: 1.5, wEnd: 1.2, seed: 93, wobble: 0.2 });
  paintCodexDisc(ctx, -14, 4, 3.6, 7.2, {
    rot: 0.2,
    steps: 10,
    fill: sw ? sw.jade : COL.jadeLight,
    stroke: COL.charcoal,
    lw: 1.6,
    seed: 95,
  });

  ctx.restore();
}

/**
 * Draws a Maya *Ik'* Breath/Wind Scroll Volute along (x0, y0) -> (x1, y1).
 */
function drawMayaIkScroll(ctx, x0, y0, x1, y1, scale = 1.0, fillCol = COL.cinnabar, alpha = 1.0, seed = 7) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const ang = Math.atan2(dy, dx);
  const len = Math.hypot(dx, dy);
  ctx.translate(x0, y0);
  ctx.rotate(ang);

  const pts = [
    [0, -2.5 * scale],
    [len * 0.38, -9 * scale],
    [len * 0.74, -5 * scale],
    [len, -10 * scale],
    [len + 7 * scale, -4 * scale],
    [len + 3 * scale, 4 * scale],
    [len - 5 * scale, 2 * scale],
    [len - 3 * scale, -3 * scale],
    [len * 0.68, 2 * scale],
    [len * 0.34, -2 * scale],
    [0, 2.5 * scale],
    [0, -2.5 * scale],
  ];
  paintCodexShape(ctx, pts, {
    fill: fillCol,
    stroke: COL.charcoal,
    lw: 1.9 * scale,
    seed,
    washJitter: 0.6,
  });
  ctx.restore();
}

/**
 * Draws an authentic Maya Vigesimal Numeral (0..19) centered at (cx, cy) using hand-brushed quill bars & dots.
 */
function drawMayaVigesimalDigit(ctx, cx, cy, value, {
  scale = 1.0,
  useRedBars = false,
  wetGlow = 0,
  sw = null,
} = {}) {
  const v = ((Math.floor(value) % 20) + 20) % 20;
  if (v === 0) {
    drawMayaShellZero(ctx, cx, cy, scale, wetGlow, sw);
    return { tipX: cx, tipY: cy };
  }

  const bars = Math.floor(v / 5);
  const dots = v % 5;
  const barW = 62 * scale;
  const barH = 9.6 * scale;
  const barGap = 13.8 * scale;
  const dotR = 6.8 * scale;

  const totalH = bars * barGap + (dots > 0 ? 18 * scale : 0);
  const curBottomY = cy + totalH * 0.42;

  ctx.save();
  for (let b = 0; b < bars; b++) {
    const by = curBottomY - b * barGap - barH;
    const isNewestBar = dots === 0 && b === bars - 1 && wetGlow > 0.02;
    if (isNewestBar) {
      // Wet cinnabar ink soak into porous gesso around the freshly brushed bar
      paintCodexBox(ctx, cx - barW * 0.54, by - 2.5 * scale, barW * 1.08, barH + 5 * scale, {
        fill: `rgba(198, 44, 28, ${(wetGlow * 0.34).toFixed(3)})`,
        lw: 0,
        corner: 5 * scale,
        seed: 101 + b,
        washJitter: 0.3,
      });
    }
    const barFill = isNewestBar
      ? COL.cinnabarWet
      : useRedBars
      ? (sw ? sw.cinnabar : COL.cinnabar)
      : COL.charcoal;
    paintCodexBox(ctx, cx - barW / 2, by, barW, barH, {
      fill: barFill,
      stroke: COL.charcoal,
      lw: 2.0 * scale,
      corner: 3.5 * scale,
      seed: 120 + b * 7 + v,
      washJitter: 0.7,
      drySplit: !isNewestBar,
    });
  }

  let newestDotPos = { tipX: cx, tipY: curBottomY - Math.max(0, bars - 1) * barGap - barH * 0.5 };
  if (dots > 0) {
    const dotY = curBottomY - bars * barGap - 8.5 * scale;
    const spacing = Math.min(16.2 * scale, (barW - 8 * scale) / Math.max(1, dots - 0.2));
    const startX = cx - ((dots - 1) * spacing) / 2;

    // Authentic Maya crescent spacer brackets flanking single/double dots
    if (dots <= 2 && bars > 0) {
      for (const side of [-1, 1]) {
        const sx0 = cx + side * (barW * 0.39);
        drawQuillRibbon(
          ctx,
          [
            [sx0 - side * 2 * scale, dotY - 4.2 * scale],
            [sx0 + side * 2.5 * scale, dotY],
            [sx0 - side * 2 * scale, dotY + 4.2 * scale],
          ],
          { wStart: 1.7 * scale, wEnd: 1.5 * scale, color: COL.cinnabar, seed: 150 + side, wobble: 0.2 }
        );
      }
    }

    for (let d = 0; d < dots; d++) {
      const dx = startX + d * spacing;
      const isLast = d === dots - 1;
      const pop = isLast && wetGlow > 0.02 ? 1 + 0.16 * wetGlow : 1.0;

      if (isLast && wetGlow > 0.02) {
        // Freshly dabbed wet cinnabar stain bleeding softly into chalky stucco
        paintCodexDisc(ctx, dx, dotY, dotR * (1.45 + (1 - wetGlow) * 0.35), dotR * (1.35 + (1 - wetGlow) * 0.3), {
          steps: 12,
          fill: `rgba(204, 46, 28, ${(wetGlow * 0.36).toFixed(3)})`,
          lw: 0,
          seed: 170 + d,
          washJitter: 0.3,
        });
      }

      const dotFill =
        isLast && wetGlow > 0.12
          ? COL.cinnabarWet
          : useRedBars
          ? (sw ? sw.cinnabar : COL.cinnabar)
          : COL.charcoal;
      paintCodexDisc(ctx, dx, dotY, dotR * pop, dotR * 0.94 * pop, {
        rot: d * 0.4,
        steps: 12,
        fill: dotFill,
        stroke: COL.charcoal,
        lw: 1.8 * scale,
        seed: 180 + d * 11 + v,
        washJitter: 0.55,
      });

      // Tiny wet specular highlight on fresh cinnabar drop right after brush contact
      if (isLast && wetGlow > 0.35) {
        paintCodexDisc(ctx, dx - 2.0 * scale, dotY - 2.0 * scale, 1.8 * scale, 1.3 * scale, {
          steps: 7,
          fill: `rgba(255, 236, 206, ${(wetGlow * 0.65).toFixed(3)})`,
          lw: 0,
          seed: 199,
          washJitter: 0,
        });
      }

      if (isLast) {
        newestDotPos = { tipX: dx, tipY: dotY };
      }
    }
  }

  ctx.restore();
  return newestDotPos;
}

/**
 * Draws an intricate hand-brushed Classical Maya Glyph Cartouche at (gx, gy, gw, gh) — ZERO `roundRect`/`arc`.
 */
function drawMayaGlyphBlock(ctx, gx, gy, gw, gh, motifIdx, sw) {
  const superH = gh * 0.21;
  const mainY = gy + superH + 2;
  const mainH = gh - superH - 2;
  const prefW = gw * 0.22;
  const mainX = gx + prefW + 2;
  const mainW = gw - prefW - 2;
  const seed = 200 + motifIdx * 29;

  const fills = [sw.stucco, sw.mayaBlue, sw.ochre, '#e6c1ac', COL.stuccoWarm, sw.jade];
  const mainFill = fills[motifIdx % fills.length];

  // Superfix bar (top)
  paintCodexBox(ctx, mainX, gy, mainW, superH, {
    fill: motifIdx % 2 === 0 ? sw.cinnabar : sw.mayaBlue,
    lw: 2.0,
    corner: 4,
    seed: seed + 1,
  });
  for (let i = 0; i < 3; i++) {
    paintCodexDisc(ctx, mainX + (mainW * (i + 1)) / 4, gy + superH * 0.5, 2.1, 2.0, {
      steps: 8,
      fill: COL.stuccoHi,
      lw: 0,
      seed: seed + 3 + i,
      washJitter: 0,
    });
  }

  // Prefix nodules (left)
  for (let k = 0; k < 2; k++) {
    const py = gy + 3 + k * ((gh - 5) / 2);
    const ph = (gh - 8) / 2;
    paintCodexBox(ctx, gx, py, prefW, ph, {
      fill: k === 0 ? sw.ochre : COL.stuccoWarm,
      lw: 1.9,
      corner: 5,
      seed: seed + 10 + k,
    });
    paintCodexDisc(ctx, gx + prefW * 0.5, py + ph * 0.5, 2.0, 2.0, {
      steps: 7,
      fill: COL.charcoal,
      lw: 0,
      seed: seed + 14 + k,
      washJitter: 0,
    });
  }

  // Main cartouche + inner contour ring
  paintCodexBox(ctx, mainX, mainY, mainW, mainH, {
    fill: mainFill,
    lw: 2.2,
    corner: 7,
    seed: seed + 20,
  });
  paintCodexBox(ctx, mainX + 4, mainY + 4, mainW - 8, mainH - 8, {
    fill: null,
    lw: 1.3,
    corner: 5,
    seed: seed + 22,
  });

  const cx = mainX + mainW * 0.5;
  const cy = mainY + mainH * 0.5;
  const m = motifIdx % 6;

  if (m === 0) {
    // Sacred Water-Bird Deity profile glyph
    paintCodexDisc(ctx, cx - 3, cy, 7.5, 7.0, { steps: 12, fill: COL.stuccoHi, lw: 1.8, seed: seed + 30 });
    paintCodexShape(ctx, [[cx + 2, cy - 4], [cx + 13, cy + 1], [cx + 2, cy + 5.5], [cx + 2, cy - 4]], {
      fill: sw.ochre,
      lw: 1.8,
      seed: seed + 31,
    });
    paintCodexDisc(ctx, cx - 2, cy - 1, 2.0, 2.0, { steps: 7, fill: COL.charcoal, lw: 0, seed: seed + 32 });
  } else if (m === 1) {
    // K'in 4-petal Solar Wheel glyph
    paintCodexDisc(ctx, cx, cy, 9.0, 8.8, { steps: 14, fill: COL.ochreLight, lw: 1.8, seed: seed + 33 });
    for (let a = 0; a < 4; a++) {
      const ang = (a * Math.PI) / 2 + Math.PI / 4;
      drawQuillRibbon(ctx, [[cx, cy], [cx + Math.cos(ang) * 8.5, cy + Math.sin(ang) * 8.5]], {
        wStart: 1.7,
        wEnd: 1.4,
        seed: seed + 34 + a,
      });
    }
    paintCodexDisc(ctx, cx, cy, 3.0, 3.0, { steps: 8, fill: sw.cinnabar, lw: 1.2, seed: seed + 39 });
  } else if (m === 2) {
    // Ajaw Lord day-sign face
    paintCodexBox(ctx, cx - 9, cy - 7.5, 18, 15, { fill: COL.stuccoHi, lw: 1.8, corner: 4, seed: seed + 40 });
    paintCodexDisc(ctx, cx - 3.8, cy - 2, 1.9, 1.9, { steps: 7, fill: COL.charcoal, lw: 0, seed: seed + 41 });
    paintCodexDisc(ctx, cx + 3.8, cy - 2, 1.9, 1.9, { steps: 7, fill: COL.charcoal, lw: 0, seed: seed + 42 });
    drawQuillRibbon(ctx, [[cx - 4, cy + 3], [cx, cy + 5.5], [cx + 4, cy + 3]], { wStart: 1.6, wEnd: 1.5, seed: seed + 43 });
  } else if (m === 3) {
    // Kakaw (Cacao pod) ribbed glyph
    paintCodexDisc(ctx, cx, cy, 6.2, 9.5, { rot: 0.2, steps: 14, fill: sw.cinnabar, lw: 1.8, seed: seed + 44 });
    drawQuillRibbon(ctx, [[cx - 1, cy - 8.5], [cx + 0.5, cy], [cx + 1, cy + 8.5]], { wStart: 1.4, wEnd: 1.3, seed: seed + 45 });
  } else if (m === 4) {
    // Kab / Step-scroll road spiral
    drawQuillRibbon(
      ctx,
      [[cx - 9, cy + 5], [cx - 9, cy - 6], [cx + 7, cy - 6], [cx + 7, cy + 3], [cx - 2, cy + 3], [cx - 2, cy - 1]],
      { wStart: 2.0, wEnd: 1.5, seed: seed + 46 }
    );
  } else {
    // Jade & Crossed-bands celestial sign
    drawQuillRibbon(ctx, [[cx - 8, cy - 6.5], [cx + 8, cy + 6.5]], { wStart: 2.0, wEnd: 1.8, seed: seed + 47 });
    drawQuillRibbon(ctx, [[cx + 8, cy - 6.5], [cx - 8, cy + 6.5]], { wStart: 2.0, wEnd: 1.8, seed: seed + 48 });
    paintCodexDisc(ctx, cx, cy, 3.6, 3.6, { steps: 9, fill: sw.jade, lw: 1.5, seed: seed + 49 });
  }
}

/**
 * Draws the Upper Calligraphic Header (x = 42..702, y = 38..130) replacing the old modern title sticker!
 * Left features a grand Dresden-Codex Initial Series Introductory Glyph (ISIG) encoding Numeral `7` (1 Bar + 2 Dots),
 * flanked by a 2x5 array of Classical Maya Astronomical & Calendar Glyphs!
 */
function drawUpperGlyphHeader(ctx, sw) {
  // 1. Grand Initial Series Introductory Block at (x = 44..168, y = 38..130) encoding Folio #7 (Wuuk = 1 Bar + 2 Dots)!
  paintCodexBox(ctx, 44, 38, 124, 92, {
    fill: COL.stuccoHi,
    lw: 2.7,
    corner: 8,
    seed: 301,
  });
  paintCodexBox(ctx, 50, 44, 112, 24, {
    fill: sw.mayaBlue,
    lw: 1.9,
    corner: 4,
    seed: 302,
  });
  // Hand-brushed Maya Numeral `7` (1 horizontal bar + 2 upper dots = Scene #07!) inside the ISIG cartouche
  drawMayaVigesimalDigit(ctx, 106, 95, 7, {
    scale: 0.92,
    useRedBars: true,
    wetGlow: 0,
    sw,
  });
  // Flanking Tun-scroll ear brackets on the ISIG header
  for (const sx of [62, 150]) {
    paintCodexDisc(ctx, sx, 56, 5.5, 5.2, {
      steps: 10,
      fill: sw.ochre,
      lw: 1.6,
      seed: 305 + sx,
    });
  }

  // 2. Five columns x 2 rows of Classical Maya Glyph Blocks across x = 178..702, y = 38..130
  const cols = 5;
  const gW = 97;
  const gH = 43;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < cols; c++) {
      drawMayaGlyphBlock(
        ctx,
        180 + c * (gW + 8),
        38 + r * (gH + 6),
        gW,
        gH,
        r * 5 + c,
        sw
      );
    }
  }
}

/**
 * Draws the Classical Maya Skyband (天象带) across (x, y, w, h) using hand-brushed quill ribbons.
 */
function drawMayaSkyband(ctx, x, y, w, h, sw) {
  paintCodexBox(ctx, x, y, w, h, { fill: COL.stuccoBase, lw: 3.0, corner: 2, seed: 400, drySplit: true });

  const cells = 10;
  const cw = w / cells;
  const bgPalette = [
    sw.mayaBlue,
    sw.cinnabar,
    COL.stuccoWarm,
    COL.mayaBlueDark,
    sw.ochre,
    sw.mayaBlue,
    COL.stuccoHi,
    sw.cinnabar,
    sw.mayaBlue,
    sw.ochre,
  ];

  for (let i = 0; i < cells; i++) {
    const cx0 = x + i * cw;
    const midX = cx0 + cw * 0.5;
    const midY = y + h * 0.5;
    paintCodexBox(ctx, cx0, y, cw, h, { fill: bgPalette[i], lw: 2.2, corner: 1, seed: 410 + i });

    const motif = i % 5;
    if (motif === 0) {
      // Crossed Celestial Bands
      paintCodexShape(ctx, [[cx0 + 6, y + 5], [cx0 + 15, y + 5], [cx0 + cw - 6, y + h - 5], [cx0 + cw - 15, y + h - 5], [cx0 + 6, y + 5]], {
        fill: COL.stuccoHi,
        lw: 1.9,
        seed: 430 + i,
      });
      paintCodexShape(ctx, [[cx0 + cw - 6, y + 5], [cx0 + cw - 15, y + 5], [cx0 + 6, y + h - 5], [cx0 + 15, y + h - 5], [cx0 + cw - 6, y + 5]], {
        fill: COL.stuccoHi,
        lw: 1.9,
        seed: 431 + i,
      });
      paintCodexDisc(ctx, midX, midY, 4.2, 4.2, { steps: 9, fill: sw.cinnabar, lw: 1.6, seed: 432 + i });
    } else if (motif === 1) {
      // Ek' (Venus Star-Eye)
      paintCodexDisc(ctx, midX, y + 8, cw * 0.31, 9, { steps: 12, fill: COL.stuccoHi, lw: 1.9, seed: 440 + i });
      for (const k of [-1, 1]) {
        paintCodexDisc(ctx, midX + k * 12, midY + 6, 6.2, 6.0, { steps: 10, fill: COL.stuccoHi, lw: 1.8, seed: 442 + i + k });
        paintCodexDisc(ctx, midX + k * 12, midY + 7, 2.3, 2.3, { steps: 7, fill: COL.charcoal, lw: 0, seed: 445 + i + k });
      }
    } else if (motif === 2) {
      // K'in Four-Petal Sun Disc
      paintCodexDisc(ctx, midX, midY, h * 0.33, h * 0.33, { steps: 14, fill: COL.ochreLight, lw: 1.9, seed: 450 + i });
      for (let a = 0; a < 4; a++) {
        const ang = (a * Math.PI) / 2 + Math.PI / 4;
        paintCodexDisc(ctx, midX + Math.cos(ang) * 9, midY + Math.sin(ang) * 9, 3.1, 3.1, {
          steps: 8,
          fill: sw.cinnabar,
          lw: 1.4,
          seed: 452 + a,
        });
      }
      paintCodexDisc(ctx, midX, midY, 4.0, 4.0, { steps: 8, fill: sw.mayaBlue, lw: 1.5, seed: 459 + i });
    } else if (motif === 3) {
      // Ak'bal Darkness Sign
      paintCodexDisc(ctx, midX, y + h - 9, cw * 0.32, 9.5, { steps: 12, fill: COL.stuccoHi, lw: 1.9, seed: 460 + i });
      paintCodexDisc(ctx, midX - 7, y + 12, 3.0, 3.0, { steps: 8, fill: COL.charcoal, lw: 0, seed: 461 + i });
      paintCodexDisc(ctx, midX + 7, y + 12, 3.0, 3.0, { steps: 8, fill: COL.charcoal, lw: 0, seed: 462 + i });
    } else {
      // Uh Lunar Crescent & Jade Bead
      const cresPts = [
        [midX - 11, midY - 6],
        [midX - 14, midY + 5],
        [midX - 3, midY + 13],
        [midX + 11, midY + 9],
        [midX + 3, midY + 6],
        [midX - 4, midY + 1],
        [midX - 4, midY - 6],
        [midX - 11, midY - 6],
      ];
      paintCodexShape(ctx, cresPts, { fill: COL.stuccoHi, lw: 1.9, seed: 470 + i });
      paintCodexDisc(ctx, midX + 5, midY - 3, 4.2, 4.2, { steps: 9, fill: sw.jade, lw: 1.6, seed: 471 + i });
    }
  }

  // Hanging Jade Beads & Cinnabar Feather Tassels beneath Skyband
  for (let i = 1; i < cells; i += 2) {
    const tx = x + i * cw;
    paintCodexShape(ctx, [[tx - 6, y + h], [tx - 3, y + h + 15], [tx + 3, y + h + 15], [tx + 6, y + h], [tx - 6, y + h]], {
      fill: sw.cinnabar,
      lw: 1.8,
      seed: 480 + i,
    });
    paintCodexDisc(ctx, tx, y + h + 4, 4.2, 4.0, { steps: 9, fill: sw.jade, lw: 1.6, seed: 481 + i });
  }
}

/**
 * Draws the Stepped Pyramid Temple of Kukulkán with hand-chiseled ashlar joints & quill brushwork.
 */
function drawSteppedPyramid(ctx, sw) {
  const baseY = ROAD_EDGE_Y;
  const tiers = 7;
  const startX = 52;
  const baseW = 248;
  const tierH = 38;

  for (let i = 0; i < tiers; i++) {
    const ty = baseY - (i + 1) * tierH;
    const inset = i * 14;
    const tx = startX + inset;
    const tw = baseW - inset * 1.45;

    const taludPts = [
      [tx - 5, ty + tierH],
      [tx + 3, ty],
      [tx + tw * 0.5, ty + (hash2(i, 3, 501) - 0.5) * 1.4],
      [tx + tw, ty],
      [tx + tw + 6, ty + tierH],
      [tx - 5, ty + tierH],
    ];
    paintCodexShape(ctx, taludPts, {
      fill: i % 2 === 0 ? '#ddc798' : '#d2b782',
      lw: 2.5,
      seed: 510 + i,
      drySplit: true,
    });

    const tabX = tx + 10;
    const tabY = ty + 7;
    const tabW = Math.max(18, tw - 48);
    const tabH = tierH - 15;
    paintCodexBox(ctx, tabX, tabY, tabW, tabH, {
      fill: i % 2 === 0 ? sw.cinnabar : sw.mayaBlue,
      lw: 1.9,
      corner: 2,
      seed: 530 + i,
    });

    for (let bx = tabX + 22; bx < tabX + tabW - 8; bx += 24) {
      drawQuillRibbon(ctx, [[bx, tabY + 1], [bx + 0.4, tabY + tabH - 1]], {
        wStart: 1.3,
        wEnd: 1.1,
        color: 'rgba(25, 20, 16, 0.52)',
        seed: 550 + bx + i,
        wobble: 0.3,
      });
    }
  }

  // Steep Profile Staircase & Alfarda Balustrade
  const topY = baseY - tiers * tierH;
  const stairTopX = startX + (tiers - 1) * 14 + (baseW - (tiers - 1) * 14 * 1.45) - 26;
  const stairBotX = 326;

  paintCodexShape(
    ctx,
    [
      [stairTopX, topY],
      [stairTopX + 28, topY],
      [stairBotX + 28, baseY],
      [stairBotX - 18, baseY],
      [stairTopX, topY],
    ],
    { fill: '#e6d5b0', lw: 2.6, seed: 570, drySplit: true }
  );

  const numSteps = 20;
  for (let s = 0; s < numSteps; s++) {
    const u0 = s / numSteps;
    const u1 = (s + 1) / numSteps;
    const sx0 = lerp(stairTopX, stairBotX, u0);
    const sy0 = lerp(topY, baseY, u0);
    const sx1 = lerp(stairTopX, stairBotX, u1);
    const sy1 = lerp(topY, baseY, u1);
    drawQuillRibbon(ctx, [[sx0, sy0], [sx1 + 4, sy0], [sx1 + 4, sy1]], {
      wStart: 1.7,
      wEnd: 1.4,
      seed: 580 + s,
      wobble: 0.25,
    });
  }

  // Carved Kukulkán Feathered Serpent Stone Head at foot of balustrade
  const shX = stairBotX + 26;
  const shY = baseY - 22;
  for (let f = 0; f < 4; f++) {
    paintCodexDisc(ctx, shX - 10 - f * 4, shY - 12 + f * 3, 11.5, 4.4, {
      rot: -0.5 + f * 0.2,
      steps: 12,
      fill: sw.mayaBlue,
      lw: 2.1,
      seed: 605 + f,
    });
  }
  const snoutPts = [
    [shX - 14, shY - 10],
    [shX + 21, shY - 12],
    [shX + 28, shY - 19],
    [shX + 21, shY - 24],
    [shX + 16, shY - 18],
    [shX + 20, shY + 2],
    [shX - 14, shY + 4],
    [shX - 14, shY - 10],
  ];
  paintCodexShape(ctx, snoutPts, { fill: '#dcd0ae', lw: 2.4, seed: 612 });
  paintCodexShape(
    ctx,
    [[shX + 14, shY + 3], [shX + 34, shY + 9], [shX + 27, shY + 13], [shX + 35, shY + 16], [shX + 12, shY + 11], [shX + 14, shY + 3]],
    { fill: sw.cinnabar, lw: 2.0, seed: 613 }
  );
  paintCodexBox(ctx, shX - 12, shY + 8, 30, 11, { fill: '#dcd0ae', lw: 2.1, corner: 3, seed: 614 });
  paintCodexShape(ctx, [[shX + 8, shY + 2], [shX + 12, shY + 9], [shX + 15, shY + 2], [shX + 8, shY + 2]], {
    fill: COL.stuccoHi,
    lw: 1.7,
    seed: 615,
  });
  paintCodexDisc(ctx, shX + 2, shY - 5, 4.5, 4.2, { steps: 9, fill: COL.ochreLight, lw: 1.8, seed: 616 });
  paintCodexBox(ctx, shX + 0.5, shY - 7, 2.8, 4.8, { fill: COL.charcoal, lw: 0, corner: 1, seed: 617 });

  // Summit Sanctuary Temple & Perforated Roof Comb (Crestería)
  const tempX = startX + 84;
  const tempW = 104;
  const tempH = 74;
  const tempY = topY - tempH;
  paintCodexBox(ctx, tempX, tempY, tempW, tempH, { fill: COL.stuccoHi, lw: 2.6, corner: 2, seed: 620, drySplit: true });
  paintCodexBox(ctx, tempX - 5, tempY, tempW + 10, 24, { fill: sw.mayaBlue, lw: 2.4, corner: 2, seed: 621 });
  for (let gx = tempX + 6; gx < tempX + tempW - 12; gx += 24) {
    paintCodexBox(ctx, gx, tempY + 5, 16, 14, { fill: sw.ochre, lw: 1.6, corner: 2, seed: 622 + gx });
  }
  paintCodexBox(ctx, tempX + 30, tempY + 28, 44, tempH - 28, { fill: '#221c17', lw: 2.2, corner: 1, seed: 625 });
  paintCodexShape(
    ctx,
    [[tempX + 30, tempY + 28], [tempX + 52, tempY + 41], [tempX + 74, tempY + 28], [tempX + 74, tempY + 38], [tempX + 52, tempY + 49], [tempX + 30, tempY + 38], [tempX + 30, tempY + 28]],
    { fill: sw.cinnabar, lw: 2.0, seed: 626 }
  );

  const rcW = 76;
  const rcH = 54;
  const rcX = tempX + (tempW - rcW) / 2;
  const rcY = tempY - rcH;
  paintCodexShape(ctx, [[rcX, tempY], [rcX + 10, rcY], [rcX + rcW - 10, rcY], [rcX + rcW, tempY], [rcX, tempY]], {
    fill: sw.cinnabar,
    lw: 2.5,
    seed: 630,
    drySplit: true,
  });
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 3; c++) {
      paintCodexBox(ctx, rcX + 15 + c * 17, rcY + 9 + r * 20, 10, 12, {
        fill: COL.stuccoBase,
        lw: 1.6,
        corner: 1,
        seed: 632 + r * 3 + c,
      });
    }
  }
  for (let c = 0; c < 4; c++) {
    paintCodexDisc(ctx, rcX + 14 + c * 16, rcY - 3, 4.8, 4.8, { steps: 9, fill: COL.mayaBlueLight, lw: 1.7, seed: 640 + c });
  }

  // Tripod Copal Incense Brazier on summit terrace
  const brX = stairTopX + 8;
  const brY = topY - 14;
  paintCodexShape(ctx, [[brX - 11, brY], [brX + 11, brY], [brX + 8, brY + 14], [brX - 8, brY + 14], [brX - 11, brY]], {
    fill: sw.ochre,
    lw: 2.1,
    seed: 645,
  });
  paintCodexDisc(ctx, brX, brY - 2, 6.2, 4.2, { steps: 10, fill: COL.cinnabarWet, lw: 1.6, seed: 646 });
}

/**
 * Draws Maya Codex Cacao Tree (Kakaw) & Sacred Maize Stalks (Nal) with asymmetrical hand-quill brush foliage.
 */
function drawMayaBotanicals(ctx, sw) {
  const cx = 422;
  const baseY = ROAD_EDGE_Y;

  // Kab earth-scroll root glyph
  paintCodexBox(ctx, cx - 26, baseY - 20, 52, 20, { fill: sw.ochre, lw: 2.3, corner: 3, seed: 700 });
  drawQuillRibbon(ctx, [[cx - 15, baseY - 6], [cx - 15, baseY - 14], [cx - 6, baseY - 14], [cx - 6, baseY - 9]], { wStart: 1.9, wEnd: 1.5, seed: 701 });
  drawQuillRibbon(ctx, [[cx + 15, baseY - 6], [cx + 15, baseY - 14], [cx + 6, baseY - 14], [cx + 6, baseY - 9]], { wStart: 1.9, wEnd: 1.5, seed: 702 });

  // Knotted asymmetrical Cacao trunk & boughs
  const trunkPts = [
    [cx - 13, baseY - 20],
    [cx - 17, 610],
    [cx - 12, 540],
    [cx - 7, 484],
    [cx - 32, 438],
    [cx - 58, 392],
    [cx - 48, 385],
    [cx - 21, 424],
    [cx + 1, 465],
    [cx + 26, 422],
    [cx + 56, 382],
    [cx + 64, 390],
    [cx + 33, 435],
    [cx + 10, 486],
    [cx + 16, 558],
    [cx + 12, baseY - 20],
    [cx - 13, baseY - 20],
  ];
  paintCodexShape(ctx, trunkPts, { fill: '#8a5530', lw: 2.5, seed: 705, drySplit: true });

  const leaves = [
    { x: cx - 62, y: 384, a: -2.4, fill: sw.jade },
    { x: cx - 36, y: 368, a: -1.6, fill: sw.mayaBlue },
    { x: cx, y: 362, a: -1.55, fill: COL.jadeLight },
    { x: cx + 38, y: 366, a: -1.1, fill: sw.jade },
    { x: cx + 68, y: 388, a: -0.5, fill: sw.mayaBlue },
    { x: cx - 48, y: 432, a: 2.7, fill: COL.jadeLight },
    { x: cx + 52, y: 428, a: 0.4, fill: sw.jade },
  ];
  leaves.forEach((lf, idx) => {
    ctx.save();
    ctx.translate(lf.x, lf.y);
    ctx.rotate(lf.a);
    const lPts = [
      [0, 0],
      [14, -10.5],
      [31, -8.5],
      [47, 0.5],
      [30, 10.2],
      [13, 8.8],
      [0, 0],
    ];
    paintCodexShape(ctx, lPts, { fill: lf.fill, lw: 2.1, seed: 710 + idx });
    drawQuillRibbon(ctx, [[3, 0], [22, -0.6], [41, 0.4]], { wStart: 1.5, wEnd: 1.0, seed: 720 + idx });
    ctx.restore();
  });

  // Trunk-borne Ribbed Cacao Pods (Kakaw)
  const pods = [
    { x: cx - 15, y: 545, a: 0.55, fill: sw.cinnabar },
    { x: cx + 16, y: 520, a: -0.5, fill: sw.ochre },
    { x: cx - 28, y: 452, a: 0.8, fill: COL.ochreLight },
    { x: cx + 28, y: 446, a: -0.75, fill: COL.cinnabarWet },
    { x: cx + 4, y: 432, a: 0.1, fill: sw.cinnabar },
  ];
  pods.forEach((pd, idx) => {
    ctx.save();
    ctx.translate(pd.x, pd.y);
    ctx.rotate(pd.a);
    const pPts = [
      [0, -2],
      [9.5, 2],
      [10.5, 13],
      [5.5, 24],
      [0, 30],
      [-5.8, 24],
      [-10.5, 13],
      [-9.5, 2],
      [0, -2],
    ];
    paintCodexShape(ctx, pPts, { fill: pd.fill, lw: 2.0, seed: 730 + idx });
    drawQuillRibbon(ctx, [[0, 1], [0.4, 15], [0, 27]], { wStart: 1.3, wEnd: 1.1, seed: 740 + idx });
    drawQuillRibbon(ctx, [[-4.8, 5], [-5.2, 15], [-2.8, 24]], { wStart: 1.1, wEnd: 1.0, seed: 745 + idx });
    drawQuillRibbon(ctx, [[4.8, 5], [5.2, 15], [2.8, 24]], { wStart: 1.1, wEnd: 1.0, seed: 750 + idx });
    ctx.restore();
  });

  // Sacred Maize Stalks (Nal)
  const maizePositions = [
    { x: 575, h: 214, scale: 1.0 },
    { x: 646, h: 182, scale: 0.88 },
  ];
  maizePositions.forEach((mz, mIdx) => {
    const mx = mz.x;
    const topY = baseY - mz.h;
    const canePts = [
      [mx - 3 * mz.scale, baseY],
      [mx - 5 * mz.scale, baseY - mz.h * 0.5],
      [mx - 1 * mz.scale, topY],
      [mx + 4 * mz.scale, topY],
      [mx + 1 * mz.scale, baseY - mz.h * 0.5],
      [mx + 3 * mz.scale, baseY],
      [mx - 3 * mz.scale, baseY],
    ];
    paintCodexShape(ctx, canePts, { fill: sw.jade, lw: 2.1 * mz.scale, seed: 760 + mIdx });

    for (let k = 0; k < 4; k++) {
      const ly = baseY - 38 - k * 42 * mz.scale;
      const dir = k % 2 === 0 ? -1 : 1;
      const bladePts = [
        [mx, ly],
        [mx + dir * 24 * mz.scale, ly - 15 * mz.scale],
        [mx + dir * 44 * mz.scale, ly - 8 * mz.scale],
        [mx + dir * 56 * mz.scale, ly + 14 * mz.scale],
        [mx + dir * 36 * mz.scale, ly - 1 * mz.scale],
        [mx + dir * 18 * mz.scale, ly + 2 * mz.scale],
        [mx, ly + 9 * mz.scale],
        [mx, ly],
      ];
      paintCodexShape(ctx, bladePts, {
        fill: k % 2 === 0 ? sw.mayaBlue : COL.jadeLight,
        lw: 1.9,
        seed: 770 + mIdx * 10 + k,
      });
    }

    const cobY = baseY - mz.h * 0.58;
    ctx.save();
    ctx.translate(mx + 6, cobY);
    ctx.rotate(0.38);
    paintCodexDisc(ctx, 0, 0, 8.2 * mz.scale, 21 * mz.scale, {
      steps: 14,
      fill: COL.ochreLight,
      lw: 1.9,
      seed: 785 + mIdx,
    });
    for (let ky = -13; ky <= 13; ky += 6.5) {
      drawQuillRibbon(ctx, [[-5.5 * mz.scale, ky * mz.scale], [5.5 * mz.scale, ky * mz.scale]], {
        wStart: 1.1,
        wEnd: 1.0,
        seed: 790 + ky,
      });
    }
    drawQuillRibbon(ctx, [[0, -21 * mz.scale], [7, -30 * mz.scale], [15, -25 * mz.scale]], {
      wStart: 2.0,
      wEnd: 1.2,
      color: COL.cinnabar,
      seed: 798 + mIdx,
    });
    drawQuillRibbon(ctx, [[-2, -20 * mz.scale], [-7, -29 * mz.scale], [-12, -24 * mz.scale]], {
      wStart: 1.9,
      wEnd: 1.1,
      color: COL.cinnabar,
      seed: 799 + mIdx,
    });
    ctx.restore();
  });
}

/**
 * Draws the Sacbe Stone Causeway (anchored strictly at y = 680 across [0..1000]),
 * Basal Naab Water-Lily Marsh Band (left), and Pure Hand-Drawn Vigesimal Equation Legend (right, ZERO modern text!).
 */
function drawSacbeAndBasalBand(ctx, sw) {
  const roadTop = ROAD_EDGE_Y;
  const roadH = 34;

  // 1. Continuous Sacbe Limestone Causeway across FULL [0..1000]
  ctx.fillStyle = '#e3d0a8';
  ctx.fillRect(0, roadTop, PANEL_SIZE, roadH);

  let bx = 0;
  let idx = 0;
  while (bx < PANEL_SIZE) {
    const bw = Math.min(PANEL_SIZE - bx, 46 + ((idx * 17) % 22));
    const blockFill =
      idx % 5 === 1
        ? sw.mayaBlue
        : idx % 5 === 3
        ? sw.cinnabar
        : idx % 2 === 0
        ? '#eee0be'
        : '#d9c192';
    paintCodexBox(ctx, bx + 1, roadTop + 5, bw - 2, roadH - 10, {
      fill: blockFill,
      lw: 1.9,
      corner: 2,
      seed: 810 + idx,
    });
    paintCodexDisc(ctx, bx + bw * 0.5, roadTop + roadH * 0.5, 2.7, 2.5, {
      steps: 8,
      fill: idx % 5 === 1 || idx % 5 === 3 ? COL.stuccoHi : COL.charcoal,
      lw: 0,
      seed: 840 + idx,
      washJitter: 0,
    });
    bx += bw;
    idx++;
  }

  // Bold hand-brushed charcoal Sacbe road-surface line locked strictly to y = 680 at x=0 and x=1000!
  const topRoadPts = [[0, roadTop]];
  const botRoadPts = [[0, roadTop + roadH]];
  for (let rx = 25; rx < PANEL_SIZE; rx += 25) {
    const edgeFade = Math.min(rx / 90, (PANEL_SIZE - rx) / 90, 1);
    const wy = (hash2(rx, 7, 860) - 0.5) * 1.1 * edgeFade;
    topRoadPts.push([rx, roadTop + wy]);
    botRoadPts.push([rx, roadTop + roadH + wy * 0.8]);
  }
  topRoadPts.push([PANEL_SIZE, roadTop]);
  botRoadPts.push([PANEL_SIZE, roadTop + roadH]);
  drawQuillRibbon(ctx, topRoadPts, { wStart: 4.5, wEnd: 4.4, seed: 861, wobble: 0.25, poolCorners: false, drySplit: true });
  drawQuillRibbon(ctx, botRoadPts, { wStart: 3.8, wEnd: 3.8, seed: 862, wobble: 0.3, poolCorners: false });

  // Cinnabar codex sub-band below Sacbe
  paintCodexBox(ctx, 22, roadTop + roadH, PANEL_SIZE - 44, 14, {
    fill: sw.cinnabar,
    lw: 2.2,
    corner: 1,
    seed: 865,
    drySplit: true,
  });

  // 2. Lower-Left Basal Band (x = 36..708, y = 734..962): Hand-brushed Naab Marsh Scroll Waves, Lilies & Chay Fish
  const bX = 36;
  const bY = 734;
  const bW = 672;
  const bH = 228;
  paintCodexBox(ctx, bX, bY, bW, bH, { fill: COL.mayaBlueDark, lw: 2.7, corner: 2, seed: 870 });

  // Non-uniform hand-drawn Maya water-scroll strata (replaces geometric sine wave!)
  for (let band = 0; band < 4; band++) {
    const wy = bY + 28 + band * 47;
    const pts = [[bX + 2, wy]];
    let curX = bX + 2;
    let crestIdx = 0;
    while (curX < bX + bW - 6) {
      const span = 26 + ((crestIdx * 13 + band * 7) % 19);
      const nextX = Math.min(bX + bW - 2, curX + span);
      const amp = 6 + ((crestIdx * 11 + band * 5) % 7);
      pts.push([curX + span * 0.36, wy - amp]);
      pts.push([curX + span * 0.72, wy + amp * 0.45]);
      pts.push([nextX, wy + (hash2(crestIdx, band, 875) - 0.5) * 3]);
      curX = nextX;
      crestIdx++;
    }
    const linePts = pts.slice();
    pts.push([bX + bW - 2, bY + bH - 2], [bX + 2, bY + bH - 2], [bX + 2, wy]);
    paintCodexShape(ctx, pts, {
      fill: band % 2 === 0 ? sw.mayaBlue : COL.mayaBlueLight,
      lw: 0,
      seed: 880 + band,
      washJitter: 0.8,
    });
    drawQuillRibbon(ctx, linePts, { wStart: 2.2, wEnd: 1.9, seed: 885 + band, wobble: 0.45, poolCorners: false });
  }

  // Naab Water-Lilies & Chay Codex Fish
  [124, 290, 456, 610].forEach((mx, mIdx) => {
    const my = bY + 96 + (mIdx % 2) * 30;
    if (mIdx % 2 === 0) {
      paintCodexDisc(ctx, mx, my + 23, 37, 10.5, { steps: 16, fill: sw.jade, lw: 2.1, seed: 890 + mIdx });
      for (let p = -2; p <= 2; p++) {
        ctx.save();
        ctx.translate(mx, my + 18);
        ctx.rotate(p * 0.35);
        paintCodexDisc(ctx, 0, -17, 6.2, 17, {
          steps: 12,
          fill: Math.abs(p) === 2 ? sw.ochre : COL.stuccoHi,
          lw: 1.8,
          seed: 895 + mIdx * 5 + p,
        });
        ctx.restore();
      }
      paintCodexDisc(ctx, mx, my + 16, 5.8, 5.5, { steps: 10, fill: sw.cinnabar, lw: 1.8, seed: 909 + mIdx });
    } else {
      const fishPts = [
        [mx + 29, my],
        [mx + 8, my - 14],
        [mx - 14, my - 12],
        [mx - 26, my - 2],
        [mx - 42, my - 13],
        [mx - 36, my],
        [mx - 42, my + 13],
        [mx - 26, my + 2],
        [mx - 14, my + 12],
        [mx + 8, my + 14],
        [mx + 29, my],
      ];
      paintCodexShape(ctx, fishPts, { fill: COL.ochreLight, lw: 2.2, seed: 915 + mIdx });
      paintCodexShape(ctx, [[mx + 4, my - 11], [mx - 12, my - 23], [mx - 16, my - 9], [mx + 4, my - 11]], {
        fill: sw.cinnabar,
        lw: 1.9,
        seed: 917 + mIdx,
      });
      paintCodexDisc(ctx, mx + 15, my - 3, 4.2, 4.0, { steps: 9, fill: COL.stuccoHi, lw: 1.6, seed: 918 + mIdx });
      paintCodexDisc(ctx, mx + 16, my - 3, 1.8, 1.8, { steps: 7, fill: COL.charcoal, lw: 0, seed: 919 + mIdx });
    }
  });

  // Step-fret geometric border along bottom of marsh band
  const fretY = bY + bH - 28;
  paintCodexBox(ctx, bX, fretY, bW, 28, { fill: COL.stuccoWarm, lw: 2.1, corner: 1, seed: 925 });
  for (let fx = bX + 10; fx < bX + bW - 36; fx += 44) {
    drawQuillRibbon(
      ctx,
      [[fx, fretY + 23], [fx, fretY + 5], [fx + 28, fretY + 5], [fx + 28, fretY + 17], [fx + 14, fretY + 17], [fx + 14, fretY + 11], [fx + 22, fretY + 11]],
      { wStart: 2.3, wEnd: 1.9, seed: 930 + fx }
    );
  }

  // 3. Lower-Right Basal Almanac Grid (x = 724..964, y = 734..962):
  //    Director #85 Mandate: ZERO modern Chinese/English text! Pure self-explanatory hand-drawn visual equations!
  const rX = 724;
  const rW = 240;
  paintCodexBox(ctx, rX, bY, rW, bH, { fill: COL.stuccoBase, lw: 2.7, corner: 2, seed: 950 });

  // Top visual glyphic frieze: 3 miniature Calendar Day-Sign Blocks
  for (let g = 0; g < 3; g++) {
    drawMayaGlyphBlock(ctx, rX + 10 + g * 75, bY + 8, 70, 44, g + 3, sw);
  }

  // Equation Box 1 (y = 792..866): `[Red Conch Shell]  ══  [Empty Open Maya Hand Zero Glyph]` (Zero = Empty!)
  paintCodexBox(ctx, rX + 10, bY + 58, rW - 20, 74, {
    fill: '#f6ecd3',
    lw: 1.9,
    corner: 4,
    seed: 960,
  });
  drawMayaShellZero(ctx, rX + 62, bY + 95, 0.86, 0, sw);
  // Hand-brushed double tie-bar `=` in Cinnabar
  drawQuillRibbon(ctx, [[rX + 106, bY + 90], [rX + 132, bY + 90]], { wStart: 2.6, wEnd: 2.4, color: COL.cinnabar, seed: 962 });
  drawQuillRibbon(ctx, [[rX + 106, bY + 99], [rX + 132, bY + 99]], { wStart: 2.6, wEnd: 2.4, color: COL.cinnabar, seed: 963 });
  drawMayaEmptyHandZero(ctx, rX + 180, bY + 95, 1.18, sw);

  // Equation Box 2 (y = 872..952): `[5 Charcoal Dots •••••]  ══➢  [1 Solid Horizontal Bar ▬]` (5 Dots = 1 Bar!)
  paintCodexBox(ctx, rX + 10, bY + 138, rW - 20, 80, {
    fill: '#f6ecd3',
    lw: 1.9,
    corner: 4,
    seed: 970,
  });
  // Five distinct Maya pebbles/dots arrayed in an arc/cluster on left
  const fiveDotOffsets = [
    [-34, -8],
    [-17, -8],
    [0, -8],
    [-25, 9],
    [-8, 9],
  ];
  for (let d = 0; d < 5; d++) {
    paintCodexDisc(ctx, rX + 66 + fiveDotOffsets[d][0], bY + 178 + fiveDotOffsets[d][1], 5.6, 5.3, {
      steps: 10,
      fill: COL.charcoal,
      stroke: COL.charcoal,
      lw: 1.2,
      seed: 972 + d,
    });
  }
  // Hand-brushed Cinnabar transformation arrow `══➢`
  drawQuillRibbon(ctx, [[rX + 92, bY + 178], [rX + 130, bY + 178]], { wStart: 3.0, wEnd: 2.6, color: COL.cinnabar, seed: 980 });
  paintCodexShape(ctx, [[rX + 124, bY + 169], [rX + 140, bY + 178], [rX + 124, bY + 187], [rX + 128, bY + 178], [rX + 124, bY + 169]], {
    fill: sw.cinnabar,
    lw: 1.7,
    seed: 981,
  });
  // Resulting single Maya Bar (= 5) on right!
  paintCodexBox(ctx, rX + 152, bY + 172, 64, 12, {
    fill: COL.charcoal,
    stroke: COL.charcoal,
    lw: 2.0,
    corner: 4,
    seed: 985,
  });
}

/**
 * Draws the Static Right Priest Tally Column (x = 724..964, y = 36..422) + Open Sanctuary Portal below.
 * Director #85 Mandate: Prominent hand-brushed「脚掌踏轮联动象形徽」(Foot-Pedaling-Wheel Emblem) at top,
 * ZERO modern Chinese/English text!
 */
function drawPriestTallyColumnStatic(ctx, sw) {
  const colX = 724;
  const colY = 36;
  const colW = 240;
  const tallyBoxH = 386;

  paintCodexBox(ctx, colX, colY, colW, tallyBoxH, { fill: COL.stuccoBase, lw: 2.9, corner: 3, seed: 1001 });

  // 1. Prominent Pictographic Header Emblem (y = 42..96):「脚掌踏轮联动象形徽」(Foot Pedaling Solar Wheel -> Tally!)
  paintCodexBox(ctx, colX + 6, colY + 6, colW - 12, 54, {
    fill: COL.mayaBlueDark,
    lw: 2.2,
    corner: 3,
    seed: 1005,
  });
  // Cream cartouche medallion framing the Foot-Pedal-Wheel emblem
  paintCodexBox(ctx, colX + 14, colY + 10, colW - 28, 46, {
    fill: '#f7eed6',
    lw: 1.9,
    corner: 6,
    seed: 1006,
  });

  // Left of Emblem: Terracotta/Cinnabar Webbed Pelican Deity Foot pressing a Crank Arm attached to Solar Wheel!
  const wx = colX + 66;
  const wy = colY + 33;
  paintCodexDisc(ctx, wx, wy, 15, 15, { steps: 14, fill: sw.ochre, lw: 2.0, seed: 1008 });
  paintCodexDisc(ctx, wx, wy, 6.5, 6.5, { steps: 10, fill: sw.cinnabar, lw: 1.6, seed: 1009 });
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    drawQuillRibbon(ctx, [[wx + Math.cos(a) * 6.5, wy + Math.sin(a) * 6.5], [wx + Math.cos(a) * 14.5, wy + Math.sin(a) * 14.5]], {
      wStart: 1.5,
      wEnd: 1.3,
      seed: 1010 + i,
    });
  }
  // Crank arm + Webbed Bird Foot pressing pedal on right of solar wheel
  drawQuillRibbon(ctx, [[wx, wy], [wx + 24, wy + 5]], { wStart: 2.8, wEnd: 2.4, seed: 1018 });
  paintCodexShape(
    ctx,
    [[wx + 14, wy - 10], [wx + 18, wy + 2], [wx + 35, wy + 4], [wx + 28, wy + 9], [wx + 13, wy + 6], [wx + 14, wy - 10]],
    { fill: sw.cinnabar, lw: 1.8, seed: 1019 }
  );
  // Circular rotation motion scroll around wheel
  drawQuillRibbon(ctx, [[wx - 18, wy - 8], [wx - 11, wy - 18], [wx + 4, wy - 18]], {
    wStart: 2.0,
    wEnd: 1.3,
    color: COL.cinnabar,
    seed: 1020,
  });

  // Center-to-Right of Emblem: Cinnabar Ik' Breath-Arrow linking Pedal Turn -> Bar-and-Dot Tally Icon!
  drawMayaIkScroll(ctx, colX + 114, colY + 35, colX + 150, colY + 33, 0.72, sw.cinnabar, 1.0, 1022);
  // Miniature Bar + 2 Dots icon on right of header cartouche
  paintCodexBox(ctx, colX + 170, colY + 36, 40, 7, { fill: COL.charcoal, lw: 1.5, corner: 2, seed: 1024 });
  paintCodexDisc(ctx, colX + 182, colY + 24, 4.2, 4.0, { steps: 9, fill: sw.cinnabar, lw: 1.4, seed: 1025 });
  paintCodexDisc(ctx, colX + 198, colY + 24, 4.2, 4.0, { steps: 9, fill: sw.cinnabar, lw: 1.4, seed: 1026 });

  // 2. Sub-column A (Left, x = 731..805): Current Screenfold Page Turns
  const subAX = colX + 7;
  const subAW = 74;
  const tallyY = colY + 66;
  const tallyH = 312;
  paintCodexBox(ctx, subAX, tallyY, subAW, tallyH, { fill: '#f7eed6', lw: 2.0, corner: 2, seed: 1030 });
  paintCodexBox(ctx, subAX, tallyY, subAW, 30, { fill: sw.ochre, lw: 1.8, corner: 2, seed: 1031 });
  // Pictographic Accordion Screenfold-Page Glyph in Sub-column A header (no modern text!)
  paintCodexShape(
    ctx,
    [[subAX + 20, tallyY + 23], [subAX + 28, tallyY + 7], [subAX + 38, tallyY + 21], [subAX + 47, tallyY + 7], [subAX + 55, tallyY + 23]],
    { fill: COL.stuccoHi, lw: 1.8, seed: 1032 }
  );
  drawQuillRibbon(ctx, [[subAX + 6, tallyY + 208], [subAX + subAW - 6, tallyY + 208]], {
    wStart: 1.8,
    wEnd: 1.6,
    color: 'rgba(171, 40, 27, 0.58)',
    seed: 1034,
  });

  // 3. Sub-column B (Center, x = 809..887): 3-Place Cumulative Vigesimal Tally (Bak'=400 / K'al=20 / Units=1)
  const subBX = colX + 85;
  const subBW = 78;
  paintCodexBox(ctx, subBX, tallyY, subBW, tallyH, { fill: '#f7eed6', lw: 2.0, corner: 2, seed: 1040 });
  paintCodexBox(ctx, subBX, tallyY, subBW, 30, { fill: sw.cinnabar, lw: 1.8, corner: 2, seed: 1041 });
  // Pictographic Bundled K'al Cycle Knot Glyph in Sub-column B header
  paintCodexDisc(ctx, subBX + subBW * 0.5, tallyY + 15, 14, 8.5, { steps: 12, fill: COL.stuccoHi, lw: 1.7, seed: 1042 });
  drawQuillRibbon(ctx, [[subBX + 31, tallyY + 9], [subBX + 47, tallyY + 21]], { wStart: 1.8, wEnd: 1.6, color: COL.cinnabar, seed: 1043 });
  drawQuillRibbon(ctx, [[subBX + 47, tallyY + 9], [subBX + 31, tallyY + 21]], { wStart: 1.8, wEnd: 1.6, color: COL.cinnabar, seed: 1044 });

  const cellStart = tallyY + 30;
  const cellH = (tallyH - 30) / 3;
  for (let p = 0; p < 3; p++) {
    const py = cellStart + p * cellH;
    if (p > 0) {
      drawQuillRibbon(ctx, [[subBX + 6, py], [subBX + subBW - 6, py]], {
        wStart: 1.7,
        wEnd: 1.5,
        color: 'rgba(171, 40, 27, 0.55)',
        seed: 1050 + p,
      });
    }
    // Tiny Maya place-value glyph watermark in upper-right corner of each vigesimal register (Bak' plume / K'al moon / Unit dot)
    const gx = subBX + subBW - 12;
    const gy = py + 11;
    if (p === 0) {
      // Bak' (400) feather tuft mark
      drawQuillRibbon(ctx, [[gx - 4, gy + 4], [gx, gy - 5], [gx + 4, gy + 4]], { wStart: 1.4, wEnd: 1.1, color: 'rgba(25,20,16,0.42)', seed: 1055 });
    } else if (p === 1) {
      // K'al (20) lunar completion crescent mark
      drawQuillRibbon(ctx, [[gx + 3, gy - 4], [gx - 4, gy], [gx + 3, gy + 4]], { wStart: 1.5, wEnd: 1.2, color: 'rgba(25,20,16,0.42)', seed: 1056 });
    } else {
      // Hun (1) unit pebble mark
      paintCodexDisc(ctx, gx, gy, 2.5, 2.4, { steps: 7, fill: 'rgba(25,20,16,0.38)', lw: 0, seed: 1057 });
    }
  }

  // 4. Sub-column C (Right, x = 891..958): Elevated Scribe Balcony Dais
  const subCX = colX + 167;
  const subCW = 67;
  paintCodexBox(ctx, subCX, tallyY, subCW, tallyH, { fill: '#e8d6ae', lw: 2.0, corner: 2, seed: 1060 });
  paintCodexBox(ctx, subCX + 4, tallyY + tallyH - 30, subCW - 8, 26, { fill: sw.mayaBlue, lw: 2.0, corner: 2, seed: 1061 });

  // 5. Open Codex Calendar Sanctuary Chamber below Tally Box (y = 426..678)
  const portY = 426;
  const portH = ROAD_EDGE_Y - portY;
  paintCodexBox(ctx, colX, portY, colW, portH, { fill: '#f1e3c2', lw: 2.5, corner: 2, seed: 1070 });
  paintCodexBox(ctx, colX + 6, portY + 5, colW - 12, 22, { fill: sw.mayaBlue, lw: 1.8, corner: 2, seed: 1071 });
  for (let gx = colX + 16; gx < colX + colW - 22; gx += 36) {
    paintCodexBox(ctx, gx, portY + 9, 20, 14, { fill: sw.ochre, lw: 1.4, corner: 2, seed: 1072 + gx });
  }

  // Faded Lime-Wash Tzolk'in Calendar Stone Emblem in background of portal
  const emCx = colX + colW * 0.5;
  const emCy = portY + 138;
  ctx.save();
  ctx.globalAlpha = 0.36;
  const cogs = 20;
  const gearPts = [];
  for (let i = 0; i < cogs; i++) {
    const a0 = (i * Math.PI * 2) / cogs;
    const a1 = a0 + (Math.PI * 0.44) / cogs;
    const a2 = a0 + (Math.PI * 1.16) / cogs;
    const a3 = a0 + (Math.PI * 1.58) / cogs;
    gearPts.push(
      [emCx + Math.cos(a0) * 71, emCy + Math.sin(a0) * 71],
      [emCx + Math.cos(a1) * 82, emCy + Math.sin(a1) * 82],
      [emCx + Math.cos(a2) * 82, emCy + Math.sin(a2) * 82],
      [emCx + Math.cos(a3) * 71, emCy + Math.sin(a3) * 71]
    );
  }
  gearPts.push(gearPts[0]);
  paintCodexShape(ctx, gearPts, { fill: '#e0cca0', stroke: '#5a3e23', lw: 1.9, seed: 1080 });
  paintCodexDisc(ctx, emCx, emCy, 52, 52, { steps: 20, fill: '#eee0be', stroke: '#5a3e23', lw: 1.8, seed: 1081 });
  paintCodexDisc(ctx, emCx, emCy, 24, 24, { steps: 14, fill: '#e6c16e', stroke: '#5a3e23', lw: 1.8, seed: 1082 });
  paintCodexDisc(ctx, emCx, emCy, 7, 7, { steps: 9, fill: COL.cinnabar, stroke: '#5a3e23', lw: 1.5, seed: 1083 });
  ctx.restore();
}

/**
 * Bakes the entire 1000x1000 SLUB Dresden Codex Artifact Substrate:
 * 1. Pixel-level cross-beaten Amatl (Ficus) bark weave;
 * 2. Hand-troweled Calcium-Carbonate Lime Stucco + `kit.bakeBrush` WebGL2 Kubelka-Munk humidity tide-stains
 *    & granular mineral washes bridged once via `fb.get().canvas` into `bake2D` (`slot.usedFb = false`!);
 * 3. Codex borders, full glyphic header (`7` ISIG), Skyband, Pyramid, Cacao/Maize, Sacbe (`y=680`), Tally Column;
 * 4. Genuine 3D-edged brittle flaked lime-stucco spalling (`灰泥崩裂剥落`) along worn margins & accordion screenfold
 *    hinges (`x=368, 717`), exposing dark fibrous Amatl bark underneath with cast micro-shadows & chalky fracture lips!
 */
function getBakedMayaCodex(kit) {
  return kit.bake2D('s07_maya_codex_r3', (_g, ctx, rng) => {
    const sw = getMayaPigmentSwatches(kit);

    // --- PHASE A: Bake Raw Cross-Beaten Amatl (Ficus) Bark-Paper Sheet into Offscreen Canvas ---
    const barkCanvas = kit.bake2D('s07_amatl_bark_r3', (_bg, bctx) => {
      const img = bctx.createImageData(PANEL_SIZE, PANEL_SIZE);
      const d = img.data;
      for (let y = 0; y < PANEL_SIZE; y++) {
        for (let x = 0; x < PANEL_SIZE; x++) {
          // Cross-laminated horizontal & vertical pounded bast fibers + woody knots
          const fh = vnoise2(x * 0.035, y * 0.42, 17);
          const fv = vnoise2(x * 0.38, y * 0.04, 53);
          const mott = fbm2(x * 0.008, y * 0.008, 89, 3);
          const fine = hash2(x, y, 131);
          const v = clamp(fh * 0.38 + fv * 0.30 + mott * 0.24 + fine * 0.08, 0, 1);
          const r = lerp(84, 194, v) | 0;
          const g = lerp(56, 150, v) | 0;
          const b = lerp(30, 96, v) | 0;
          const idx = (y * PANEL_SIZE + x) * 4;
          d[idx] = r;
          d[idx + 1] = g;
          d[idx + 2] = b;
          d[idx + 3] = 255;
        }
      }
      bctx.putImageData(img, 0, 0);

      // Long overlapping beaten Ficus bast strands
      for (let i = 0; i < 900; i++) {
        const fx = hash2(i, 1, 201) * PANEL_SIZE;
        const fy = hash2(i, 2, 202) * PANEL_SIZE;
        const horiz = hash2(i, 3, 203) > 0.36;
        const len = 28 + hash2(i, 4, 204) * 95;
        bctx.strokeStyle = i % 2 === 0 ? 'rgba(66, 42, 19, 0.36)' : 'rgba(222, 190, 138, 0.30)';
        bctx.lineWidth = 0.7 + hash2(i, 5, 205) * 1.6;
        bctx.beginPath();
        bctx.moveTo(fx, fy);
        bctx.lineTo(
          fx + (horiz ? len : (hash2(i, 6, 206) - 0.5) * 10),
          fy + (horiz ? (hash2(i, 7, 207) - 0.5) * 8 : len)
        );
        bctx.stroke();
      }
    });

    // --- PHASE B: Paint Lime-Stucco Ground + Bridge `kit.bakeBrush` Kubelka-Munk Watercolor Patina ---
    const stuccoImg = ctx.createImageData(PANEL_SIZE, PANEL_SIZE);
    const sData = stuccoImg.data;
    for (let y = 0; y < PANEL_SIZE; y++) {
      for (let x = 0; x < PANEL_SIZE; x++) {
        const n1 = fbm2(x * 0.007, y * 0.007, 311, 4);
        const trowel = vnoise2(x * 0.025, y * 0.12, 347);
        const grain = hash2(x, y, 389);
        const edgeDark = Math.pow(Math.max(Math.abs(x - 500), Math.abs(y - 500)) / 500, 2.2) * 0.16;
        const u = clamp(0.62 + (n1 - 0.5) * 0.34 + (trowel - 0.5) * 0.12 + (grain - 0.5) * 0.06 - edgeDark, 0, 1);
        const idx = (y * PANEL_SIZE + x) * 4;
        sData[idx] = lerp(214, 250, u) | 0;
        sData[idx + 1] = lerp(194, 241, u) | 0;
        sData[idx + 2] = lerp(152, 214, u) | 0;
        sData[idx + 3] = 255;
      }
    }
    ctx.putImageData(stuccoImg, 0, 0);

    // Bridge `kit.bakeBrush` spectral watercolor washes (tropical damp tide-rings, mineral dust & charcoal craze)
    try {
      if (kit.brush && typeof kit.bakeBrush === 'function') {
        const brushFb = kit.bakeBrush('s07_maya_watercolor_patina_r3', (_p, brush, bRng) => {
          brush.noStroke();
          // Tropical humidity brown-amber water-stain tide rings at corners & along screenfold hinges
          const stains = [
            [88, 92, 118, '#b9935a', 46],
            [918, 110, 105, '#b38b52', 44],
            [368, 260, 95, '#c4a16b', 36],
            [717, 510, 120, '#b58d54', 42],
            [140, 880, 115, '#ae864e', 44],
            [860, 895, 110, '#b89158', 40],
          ];
          for (const [sx, sy, sr, scol, sop] of stains) {
            brush.fill(scol, sop);
            brush.fillBleed(0.36, 'out');
            brush.fillTexture(0.78, 0.68, true, 0.2);
            brush.circle(sx, sy, sr, true);
          }
          // Subtle chalky lime reserve wash along the central Sacbe riding corridor (y=460..675)
          brush.fill('#fff9ea', 55);
          brush.fillBleed(0.24, 'out');
          brush.fillTexture(0.55, 0.35);
          brush.rect(50, 465, 650, 205);

          // Fine dry charcoal crazing & mineral dust across aged stucco
          brush.noFill();
          for (let i = 0; i < 28; i++) {
            const x0 = 40 + bRng() * 920;
            const y0 = 40 + bRng() * 920;
            const ang = bRng() * Math.PI * 2;
            const len = 25 + bRng() * 65;
            brush.set('2H', '#7a5d3a', 0.28 + bRng() * 0.22);
            brush.line(x0, y0, x0 + Math.cos(ang) * len, y0 + Math.sin(ang) * len);
          }
        });
        const snap = brushFb && typeof brushFb.get === 'function' ? brushFb.get() : null;
        if (snap && snap.canvas) {
          ctx.save();
          ctx.globalAlpha = 0.72;
          ctx.drawImage(snap.canvas, 0, 0, PANEL_SIZE, PANEL_SIZE);
          ctx.restore();
        }
      }
    } catch (_err) {
      // Safe fallback in headless Node smoke tests without WebGL2 context
    }

    // --- PHASE C: Codex Cinnabar Register Borders, Glyphic Header, Skyband, Temple & Tally Architecture ---
    const bThick = 14;
    paintCodexBox(ctx, 22, 22, PANEL_SIZE - 44, bThick, { fill: sw.cinnabar, lw: 2.4, corner: 2, seed: 1101, drySplit: true });
    paintCodexBox(ctx, 22, PANEL_SIZE - 22 - bThick, PANEL_SIZE - 44, bThick, { fill: sw.cinnabar, lw: 2.4, corner: 2, seed: 1102, drySplit: true });
    paintCodexBox(ctx, 22, 22, bThick, ROAD_EDGE_Y - 22, { fill: sw.cinnabar, lw: 2.4, corner: 2, seed: 1103, drySplit: true });
    paintCodexBox(ctx, 22, ROAD_EDGE_Y + 34, bThick, PANEL_SIZE - 22 - (ROAD_EDGE_Y + 34), { fill: sw.cinnabar, lw: 2.4, corner: 2, seed: 1104, drySplit: true });
    paintCodexBox(ctx, PANEL_SIZE - 22 - bThick, 22, bThick, ROAD_EDGE_Y - 22, { fill: sw.cinnabar, lw: 2.4, corner: 2, seed: 1105, drySplit: true });
    paintCodexBox(ctx, PANEL_SIZE - 22 - bThick, ROAD_EDGE_Y + 34, bThick, PANEL_SIZE - 22 - (ROAD_EDGE_Y + 34), { fill: sw.cinnabar, lw: 2.4, corner: 2, seed: 1106, drySplit: true });
    // Vertical Cinnabar Register Divider along main accordion hinge (x = 710..724)
    paintCodexBox(ctx, 710, 22, 14, ROAD_EDGE_Y - 22, { fill: sw.cinnabar, lw: 2.4, corner: 1, seed: 1107, drySplit: true });
    paintCodexBox(ctx, 710, ROAD_EDGE_Y + 34, 14, PANEL_SIZE - 22 - (ROAD_EDGE_Y + 34), { fill: sw.cinnabar, lw: 2.4, corner: 1, seed: 1108, drySplit: true });

    drawUpperGlyphHeader(ctx, sw);
    drawMayaSkyband(ctx, 36, 138, 674, 42, sw);
    drawSteppedPyramid(ctx, sw);
    drawMayaBotanicals(ctx, sw);

    // Dry-brushed chalky lime-gesso patina softening background Pyramid & Cacao in the riding zone
    // (ZERO `createRadialGradient` orb — pure dry-brushed mineral stucco haze so foreground rider pops crisply!)
    ctx.save();
    ctx.fillStyle = 'rgba(244, 234, 208, 0.34)';
    ctx.fillRect(38, 184, 670, ROAD_EDGE_Y - 184);
    for (let i = 0; i < 110; i++) {
      const wx = 46 + rng() * 648;
      const wy = 445 + rng() * 228; // concentrated behind rider's vertical band (y=445..673)
      const wLen = 22 + rng() * 58;
      drawQuillRibbon(
        ctx,
        [[wx, wy], [wx + wLen * 0.5, wy + (rng() - 0.5) * 3], [wx + wLen, wy + (rng() - 0.5) * 4]],
        { wStart: 5.5 + rng() * 5, wEnd: 3.5 + rng() * 3, color: 'rgba(249, 241, 220, 0.30)', seed: 1200 + i, wobble: 0.6, poolCorners: false }
      );
    }
    ctx.restore();

    drawSacbeAndBasalBand(ctx, sw);
    drawPriestTallyColumnStatic(ctx, sw);

    // --- PHASE D: Pixel-Level 3D Brittle Lime-Stucco Spalling (`碳酸钙灰泥脆性崩裂露底`) ---
    // Along all 4 deckle margins AND along the two vertical accordion screenfold hinges (`x=368`, `x=717`),
    // brittle gesso flakes chip completely off to expose raw cross-beaten Amatl bark with a 3D plaster step!
    if (barkCanvas && barkCanvas.canvas) {
      const codexImg = ctx.getImageData(0, 0, PANEL_SIZE, PANEL_SIZE);
      const bCtx = barkCanvas.drawingContext;
      const barkImg = bCtx.getImageData(0, 0, PANEL_SIZE, PANEL_SIZE);
      const cD = codexImg.data;
      const bD = barkImg.data;

      // Precompute spall mask: 1 = raw Amatl bark exposed, 0 = stucco intact
      const spall = new Uint8Array(PANEL_SIZE * PANEL_SIZE);
      for (let y = 0; y < PANEL_SIZE; y++) {
        // Protect Sacbe causeway cross-frame anchor around y = 680..714 at left/right edges!
        const nearRoad = y >= ROAD_EDGE_Y - 6 && y <= ROAD_EDGE_Y + 36;
        const dEdge = Math.min(xDistEdge(0), PANEL_SIZE); // dummy avoided below
        for (let x = 0; x < PANEL_SIZE; x++) {
          const borderDist = Math.min(x, PANEL_SIZE - 1 - x, y, PANEL_SIZE - 1 - y);
          const dFold1 = Math.abs(x - 368);
          const dFold2 = Math.abs(x - 717);
          if (borderDist > 42 && dFold1 > 16 && dFold2 > 22) continue;

          const fbm = fbm2(x * 0.045, y * 0.045, 701, 3);
          const cell = worleyEdge2(x * 0.055, y * 0.055, 733);
          let spallScore = 0;

          // Deckle outer margin spalling (skipping exact road contact join at x<48 / x>952, y=674..716)
          if (!(nearRoad && (x < 48 || x > PANEL_SIZE - 48))) {
            if (borderDist < 38) {
              spallScore = Math.max(spallScore, (1 - borderDist / 34) * 1.15 + (fbm - 0.45) * 0.85 - cell * 0.25);
            }
          }
          // Primary accordion screenfold hinge at x = 717 (broken plaster islands along fold!)
          if (dFold2 < 18 && !nearRoad) {
            const foldNoise = fbm2(x * 0.08, y * 0.032, 761, 3);
            spallScore = Math.max(spallScore, (1 - dFold2 / 13.5) * 0.92 + (foldNoise - 0.52) * 1.05);
          }
          // Secondary screenfold crease at x = 368 (lighter intermittent flaking)
          if (dFold1 < 12 && !nearRoad) {
            const foldNoise1 = fbm2(x * 0.09, y * 0.036, 787, 3);
            spallScore = Math.max(spallScore, (1 - dFold1 / 8.5) * 0.72 + (foldNoise1 - 0.58) * 1.05);
          }

          if (spallScore > 0.58) {
            spall[y * PANEL_SIZE + x] = 1;
          }
        }
      }

      // Composite exposed Amatl bark + 1.5px 3D cast drop-shadow onto bark + chalky white broken-gesso rim!
      for (let y = 1; y < PANEL_SIZE - 1; y++) {
        for (let x = 1; x < PANEL_SIZE - 1; x++) {
          const pIdx = y * PANEL_SIZE + x;
          const idx4 = pIdx * 4;
          if (spall[pIdx] === 1) {
            // Check if upper-left stucco overhangs this bark pixel -> dark 3D gesso thickness shadow!
            const castShadow = spall[(y - 1) * PANEL_SIZE + (x - 1)] === 0 || spall[y * PANEL_SIZE + (x - 1)] === 0;
            const shade = castShadow ? 0.62 : 1.0;
            cD[idx4] = (bD[idx4] * shade) | 0;
            cD[idx4 + 1] = (bD[idx4 + 1] * shade) | 0;
            cD[idx4 + 2] = (bD[idx4 + 2] * shade) | 0;
          } else {
            // Intact stucco right next to a spalled bark cavity -> bright chalky white calcium-carbonate fracture lip!
            const touchesSpall =
              spall[pIdx - 1] === 1 ||
              spall[pIdx + 1] === 1 ||
              spall[pIdx - PANEL_SIZE] === 1 ||
              spall[pIdx + PANEL_SIZE] === 1;
            if (touchesSpall) {
              cD[idx4] = lerp(cD[idx4], 253, 0.72) | 0;
              cD[idx4 + 1] = lerp(cD[idx4 + 1], 248, 0.72) | 0;
              cD[idx4 + 2] = lerp(cD[idx4 + 2], 232, 0.72) | 0;
            }
          }
        }
      }
      ctx.putImageData(codexImg, 0, 0);

      // Subtle vertical accordion crease shading & highlight along x=368 and x=717
      for (const [fx, str] of [[368, 0.42], [717, 0.78]]) {
        const fg = ctx.createLinearGradient(fx - 12, 0, fx + 12, 0);
        fg.addColorStop(0, 'rgba(0,0,0,0)');
        fg.addColorStop(0.42, `rgba(74, 48, 22, ${(0.24 * str).toFixed(3)})`);
        fg.addColorStop(0.54, `rgba(255, 250, 236, ${(0.30 * str).toFixed(3)})`);
        fg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = fg;
        ctx.fillRect(fx - 12, 0, 24, PANEL_SIZE);
      }
    }
  });
}

function xDistEdge(v) {
  return v;
}

/**
 * Draws the Live Vigesimal Tally Numerals, Crank-to-Column Cinnabar *Ik'* Breath Pulse,
 * and Crouching Maya Scribe Priest (Ah Ts'ib) dipping into his conch inkpot before brushing new dots/bars!
 */
function drawLiveTallyAndScribe(ctx, t, localT, pelicanLocalX, rig, sw) {
  // 120 BPM: 2 beats = 1.0s = 1 full crank revolution.
  // Offset +0.40s so revolutions tick at localT = 0.60, 1.60, 2.60, 3.60, 4.60, 5.60s
  // (at hero shot localT = 2.80s -> tickAge = 0.20s, capturing both the live Ik' pulse & scribe brush stroke!).
  const exactRev = (t - 5.0) + 0.40;
  const totalTurns = Math.max(0, Math.floor(exactRev));
  const pageTurns = clamp(totalTurns - 36, 0, 19);
  const tickAge = exactRev - Math.floor(exactRev); // [0..1)

  // Wet cinnabar ink drying curve: wet glistening crimson right after stroke (0..0.62s) -> matte mineral red
  const wetGlow = tickAge < 0.62 ? Math.pow(1 - tickAge / 0.62, 1.2) : 0;
  // Brush phases:
  // - [0.00..0.44]: Scribe sweeps arm left to paint the newly ticked bar/dot!
  // - [0.68..0.98]: Scribe dips hair-brush down into his Cinnabar conch-shell inkpot to reload!
  const dabReach = tickAge < 0.44 ? Math.sin((1 - tickAge / 0.44) * Math.PI * 0.5) : 0;
  const dipInPot = tickAge > 0.68 ? Math.sin(((tickAge - 0.68) / 0.30) * Math.PI) : 0;

  // Bar 2 sacred emphasis (localT 2..4s): hand-brushed Cinnabar border accent around tally chambers
  const bar2Focus = smoothstep(1.75, 2.15, localT) * (1 - smoothstep(4.05, 4.45, localT));
  if (bar2Focus > 0.02) {
    paintCodexBox(ctx, 729, 100, 230, 316, {
      fill: null,
      stroke: `rgba(198, 46, 28, ${(0.68 * bar2Focus).toFixed(3)})`,
      lw: 3.0,
      corner: 3,
      seed: 1301,
    });
  }

  // 1. Sub-column A (Left, x = 731..805): Current Screenfold Page Turns
  const subACx = 768;
  const pageTarget = drawMayaVigesimalDigit(ctx, subACx, 214, pageTurns, {
    scale: 0.86,
    useRedBars: true,
    wetGlow,
    sw,
  });

  // Live Pictographic Synced Crank-Wheel & Foot Medallion in lower chamber of Sub-column A (y = 316..406 — ZERO text!)
  const crankAng = (t / 0.5) * Math.PI;
  ctx.save();
  ctx.translate(subACx, 360);
  paintCodexDisc(ctx, 0, 0, 22, 22, { steps: 16, fill: '#eee0be', lw: 1.9, seed: 1310 });
  ctx.save();
  ctx.rotate(crankAng);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    drawQuillRibbon(ctx, [[-Math.cos(a) * 19, -Math.sin(a) * 19], [Math.cos(a) * 19, Math.sin(a) * 19]], {
      wStart: 1.7,
      wEnd: 1.5,
      color: COL.mayaBlue,
      seed: 1312 + i,
    });
  }
  // Rotating crank arm + cinnabar pedal dot
  drawQuillRibbon(ctx, [[0, 0], [15, 0]], { wStart: 2.8, wEnd: 2.4, color: COL.charcoal, seed: 1318 });
  paintCodexDisc(ctx, 15, 0, 4.4, 4.2, { steps: 9, fill: sw.cinnabar, lw: 1.5, seed: 1319 });
  ctx.restore();
  paintCodexDisc(ctx, 0, 0, 5.2, 5.2, { steps: 9, fill: sw.jade, lw: 1.5, seed: 1320 });
  ctx.restore();

  // 2. Sub-column B (Center, x = 809..887): 3-Place Cumulative Vigesimal (400s / 20s / 1s)
  const subBCx = 848;
  const d400 = Math.floor(totalTurns / 400) % 20;
  const d20 = Math.floor(totalTurns / 20) % 20;
  const d1 = totalTurns % 20;
  const carryTo20 = d1 === 0 ? wetGlow : 0;

  drawMayaVigesimalDigit(ctx, subBCx, 180, d400, { scale: 0.75, wetGlow: 0, sw });
  drawMayaVigesimalDigit(ctx, subBCx, 274, d20, { scale: 0.77, wetGlow: carryTo20, sw });
  const unitTarget = drawMayaVigesimalDigit(ctx, subBCx, 372, d1, {
    scale: 0.75,
    useRedBars: false,
    wetGlow,
    sw,
  });

  // 3. Director #85 Mandate: Live Crank-to-Tally Cinnabar *Ik'* Breath-Scroll Pulse on Every Completed Turn!
  //    Sweeps visibly from the Bicycle Crank Hub (`rig.bb`) up into the Tally Column (`pageTarget`)!
  if (tickAge < 0.56 && pelicanLocalX > -60 && pelicanLocalX < 940) {
    const uPulse = tickAge / 0.56;
    const startX = rig ? rig.bb.x : clamp(pelicanLocalX, 40, 860);
    const startY = rig ? rig.bb.y : ROAD_EDGE_Y - 46;
    const endX = pageTarget.tipX - 8;
    const endY = pageTarget.tipY + 12;
    const midX = lerp(startX, endX, 0.52) - 24;
    const midY = Math.min(startY, endY) - 48;

    // Evaluate quadratic Bezier point & tangent at `uPulse`
    const inv = 1 - uPulse;
    const ix = inv * inv * startX + 2 * inv * uPulse * midX + uPulse * uPulse * endX;
    const iy = inv * inv * startY + 2 * inv * uPulse * midY + uPulse * uPulse * endY;
    const uNext = Math.min(1, uPulse + 0.14);
    const invN = 1 - uNext;
    const nx = invN * invN * startX + 2 * invN * uNext * midX + uNext * uNext * endX;
    const ny = invN * invN * startY + 2 * invN * uNext * midY + uNext * uNext * endY;
    const alpha = Math.sin(Math.PI * uPulse) * 0.9;

    // Hand-brushed trailing cinnabar wind filament + Maya Ik' breath-volute head!
    const uTail = Math.max(0, uPulse - 0.18);
    const invT = 1 - uTail;
    const tx0 = invT * invT * startX + 2 * invT * uTail * midX + uTail * uTail * endX;
    const ty0 = invT * invT * startY + 2 * invT * uTail * midY + uTail * uTail * endY;
    drawQuillRibbon(ctx, [[tx0, ty0], [(tx0 + ix) * 0.5, (ty0 + iy) * 0.5 - 4], [ix, iy]], {
      wStart: 1.2,
      wEnd: 2.8,
      color: `rgba(198, 46, 28, ${(alpha * 0.65).toFixed(3)})`,
      seed: 1340,
      wobble: 0.35,
    });
    drawMayaIkScroll(ctx, ix, iy, nx, ny, 0.85, sw.cinnabar, alpha, 1345);
  }

  // 4. Crouching Maya Scribe Priest (Ah Ts'ib) perched on Elevated Dais in Sub-column C (x = 928, y = 386)
  const sx = 928;
  const sy = 386;
  const sc = 0.80;
  const torsoLean = -0.14 * dabReach + 0.08 * dipInPot;
  const headNod = 0.11 + Math.sin(t * Math.PI * 2) * 0.04 - dabReach * 0.18 + dipInPot * 0.16;

  ctx.save();
  ctx.translate(sx, sy);
  ctx.scale(sc, sc);

  // Folded thigh & calf on dais
  paintCodexDisc(ctx, -18, -10, 27, 11.5, {
    rot: -0.1,
    steps: 14,
    fill: sw.terracotta,
    lw: 2.4,
    seed: 1350,
  });

  // Jaguar-pelt kilt (Balam) with black rosettes & cinnabar sash
  paintCodexShape(ctx, [[-22, -26], [24, -26], [28, -4], [-10, -2], [-22, -26]], {
    fill: COL.ochreLight,
    lw: 2.3,
    seed: 1351,
  });
  for (const [jx, jy] of [[-4, -15], [8, -12], [16, -18], [2, -8]]) {
    paintCodexDisc(ctx, jx, jy, 2.3, 2.2, { steps: 7, fill: COL.charcoal, lw: 0, seed: 1352 + jx });
  }
  paintCodexShape(ctx, [[-20, -26], [-32, 4], [-21, 6], [-10, -24], [-20, -26]], {
    fill: sw.cinnabar,
    lw: 2.1,
    seed: 1358,
  });

  // Upper body pivoting on `torsoLean`
  ctx.save();
  ctx.translate(2, -24);
  ctx.rotate(torsoLean);
  ctx.translate(-2, 24);

  paintCodexShape(ctx, [[-14, -24], [-20, -49], [-10, -72], [18, -70], [23, -46], [20, -24], [-14, -24]], {
    fill: sw.terracotta,
    lw: 2.4,
    seed: 1360,
  });
  paintCodexShape(ctx, [[-14, -70], [2, -55], [19, -68], [16, -58], [2, -45], [-16, -60], [-14, -70]], {
    fill: sw.mayaBlue,
    lw: 2.1,
    seed: 1361,
  });

  // Left Arm holding Cinnabar Conch-Shell Inkpot
  paintCodexShape(ctx, [[-10, -60], [-42, -48], [-38, -38], [-6, -48], [-10, -60]], {
    fill: COL.terracottaDark,
    lw: 2.1,
    seed: 1362,
  });
  paintCodexDisc(ctx, -48, -48, 13, 8, { rot: -0.2, steps: 12, fill: COL.stuccoHi, lw: 2.0, seed: 1363 });
  paintCodexDisc(ctx, -48, -51, 8, 3.6, { rot: -0.2, steps: 10, fill: COL.cinnabarWet, lw: 1.2, seed: 1364 });

  // Scribe Head in Noble Classic Maya Profile + Ah Ts'ib Turban
  ctx.save();
  ctx.translate(0, -76);
  ctx.rotate(headNod);

  paintCodexShape(
    ctx,
    [[10, 4], [12, -16], [-6, -24], [-23, -6], [-17, -3], [-20, 2], [-15, 7], [4, 8], [10, 4]],
    { fill: sw.terracotta, lw: 2.3, seed: 1365 }
  );
  const lookOff = pelicanLocalX > 820 ? 1.6 : -1.6;
  paintCodexDisc(ctx, -9, -11, 5.0, 3.3, { steps: 10, fill: COL.stuccoHi, lw: 1.7, seed: 1366 });
  paintCodexDisc(ctx, -9 + lookOff, -11, 1.9, 1.9, { steps: 7, fill: COL.charcoal, lw: 0, seed: 1367 });

  paintCodexDisc(ctx, 5, -6, 5.8, 5.8, { steps: 10, fill: sw.jade, lw: 1.8, seed: 1368 });
  paintCodexDisc(ctx, 5, -6, 2.1, 2.1, { steps: 7, fill: sw.cinnabar, lw: 0, seed: 1369 });

  // Wrapped Ah Ts'ib Turban & Quetzal Plumes (subtle secondary nod)
  paintCodexDisc(ctx, 3, -24, 18.5, 9.8, { rot: 0.22, steps: 14, fill: COL.stuccoHi, lw: 2.1, seed: 1370 });
  paintCodexDisc(ctx, 4, -22, 15.5, 4.4, { rot: 0.22, steps: 12, fill: sw.cinnabar, lw: 1.7, seed: 1371 });
  const qWave = Math.sin(t * 7.2) * 3.5;
  paintCodexShape(ctx, [[14, -26], [30, -37 + qWave * 0.5], [47, -20 + qWave], [30, -26 + qWave * 0.4], [12, -20], [14, -26]], {
    fill: sw.mayaBlue,
    lw: 2.0,
    seed: 1372,
  });
  ctx.restore();
  ctx.restore();
  ctx.restore();

  // Two-Bone IK Brush-Wielding Arm in world space:
  // Smoothly interpolates between Inkpot Dip (`inkpotTip`) -> Ready Hover (`idleTip`) -> Active Tally Dab (`activeTip`)!
  const shWX = sx + 4 * sc - dabReach * 6 + dipInPot * 3;
  const shWY = sy - 60 * sc + dabReach * 2;
  const inkpotTipX = sx - 47 * sc;
  const inkpotTipY = sy - 52 * sc;
  const idleTipX = 886;
  const idleTipY = 320 + Math.sin(t * Math.PI * 4) * 2.5;
  const activeTipX = unitTarget.tipX + 5;
  const activeTipY = unitTarget.tipY + 1;

  let tipWX = lerp(idleTipX, inkpotTipX, dipInPot);
  let tipWY = lerp(idleTipY, inkpotTipY, dipInPot);
  tipWX = lerp(tipWX, activeTipX, dabReach);
  tipWY = lerp(tipWY, activeTipY, dabReach);

  const handWX = tipWX + 22;
  const handWY = tipWY + 8 - dabReach * 3;
  const ikElbow = solveTwoBoneIK(shWX, shWY, handWX, handWY, 30, 30, 1);

  // Sculpted Scribe Arm + Jade Wrist Cuff + Hair-Quill Brush
  const armRibbon = [[shWX, shWY], [ikElbow.x, ikElbow.y], [handWX, handWY]];
  drawQuillRibbon(ctx, armRibbon, { wStart: 8.2, wEnd: 6.8, color: COL.charcoal, seed: 1380, wobble: 0.25 });
  drawQuillRibbon(ctx, armRibbon, { wStart: 4.6, wEnd: 3.8, color: COL.terracotta, seed: 1381, wobble: 0.15, poolCorners: false });

  paintCodexDisc(ctx, handWX, handWY, 4.2, 4.2, { steps: 9, fill: sw.jade, lw: 1.6, seed: 1382 });

  // Reed/Wood Brush Handle + Wet Cinnabar Hair Tuft
  const brushShaft = [[handWX + 9, handWY + 4], [tipWX + 4, tipWY + 1]];
  drawQuillRibbon(ctx, brushShaft, { wStart: 4.8, wEnd: 3.8, color: COL.charcoal, seed: 1383, wobble: 0.15 });
  drawQuillRibbon(ctx, brushShaft, { wStart: 2.5, wEnd: 1.8, color: COL.ochreLight, seed: 1384, wobble: 0.1, poolCorners: false });

  paintCodexShape(
    ctx,
    [[tipWX + 5, tipWY + 2], [tipWX, tipWY - 3.5], [tipWX - 6.5, tipWY - 0.8], [tipWX - 0.5, tipWY + 4.2], [tipWX + 5, tipWY + 2]],
    { fill: COL.cinnabarWet, lw: 1.5, seed: 1385 }
  );
}

/**
 * Draws a Hand-Chiseled Polygonal Obsidian & Limestone Solar Calendar Wheel (ZERO `ctx.arc` circles!).
 */
function drawMayaCalendarWheel(ctx, wheel, s, sw, seedOffset = 0) {
  const { x, y, r, angle } = wheel;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // 1. Hand-flaked Black Obsidian Solar Ray Blades around perimeter
  const numTeeth = 16;
  const outerR = r + 3.2 * s;
  const rimR = r - 4.8 * s;
  for (let i = 0; i < numTeeth; i++) {
    const a0 = (i * Math.PI * 2) / numTeeth;
    const aMid = a0 + Math.PI / numTeeth + (hash2(i, 1, 1400 + seedOffset) - 0.5) * 0.04;
    const a1 = ((i + 1) * Math.PI * 2) / numTeeth;
    const rPeak = outerR + (hash2(i, 2, 1401 + seedOffset) - 0.5) * 2.2 * s;

    paintCodexShape(
      ctx,
      [
        [Math.cos(a0) * rimR, Math.sin(a0) * rimR],
        [Math.cos(aMid) * rPeak, Math.sin(aMid) * rPeak],
        [Math.cos(a1) * rimR, Math.sin(a1) * rimR],
        [Math.cos(a0) * rimR, Math.sin(a0) * rimR],
      ],
      { fill: i % 2 === 0 ? COL.obsidian : '#26242b', lw: 1.5 * s, seed: 1410 + i + seedOffset, washJitter: 0.3 }
    );
    if (i % 2 === 0) {
      drawQuillRibbon(
        ctx,
        [
          [Math.cos(a0 + 0.05) * (rimR + 1.2 * s), Math.sin(a0 + 0.05) * (rimR + 1.2 * s)],
          [Math.cos(aMid) * (rPeak - 1.5 * s), Math.sin(aMid) * (rPeak - 1.5 * s)],
        ],
        { wStart: 1.2 * s, wEnd: 0.8 * s, color: COL.obsidianGlint, seed: 1430 + i, wobble: 0.1, poolCorners: false }
      );
    }
  }

  // 2. Hand-dressed 18-Facet Polygonal Limestone Calendar Ring (replaces `ctx.arc`!)
  const innerRimR = r - 15.0 * s;
  const outerRingPts = buildHandDiscPoints(0, 0, rimR, rimR, 0, 18, 1450 + seedOffset, 0.038);
  const innerRingPts = buildHandDiscPoints(0, 0, innerRimR, innerRimR, 0, 18, 1455 + seedOffset, 0.042);

  // Fill annular limestone ring via even-odd polygon path + hand-quill outlines
  ctx.save();
  ctx.fillStyle = sw.ochre;
  ctx.beginPath();
  ctx.moveTo(outerRingPts[0][0], outerRingPts[0][1]);
  for (let i = 1; i < outerRingPts.length; i++) ctx.lineTo(outerRingPts[i][0], outerRingPts[i][1]);
  ctx.closePath();
  ctx.moveTo(innerRingPts[0][0], innerRingPts[0][1]);
  for (let i = innerRingPts.length - 1; i >= 0; i--) ctx.lineTo(innerRingPts[i][0], innerRingPts[i][1]);
  ctx.closePath();
  ctx.fill('evenodd');
  ctx.restore();

  drawQuillRibbon(ctx, outerRingPts, { wStart: 2.6 * s, wEnd: 2.5 * s, seed: 1460 + seedOffset, wobble: 0.3 });
  drawQuillRibbon(ctx, innerRingPts, { wStart: 2.4 * s, wEnd: 2.3 * s, seed: 1461 + seedOffset, wobble: 0.3 });

  // 12 Carved Calendar Glyph Compartments & Mineral Dots
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI * 2) / 12;
    drawQuillRibbon(
      ctx,
      [[Math.cos(a) * innerRimR, Math.sin(a) * innerRimR], [Math.cos(a) * rimR, Math.sin(a) * rimR]],
      { wStart: 1.6 * s, wEnd: 1.4 * s, seed: 1470 + i }
    );
    const midA = a + Math.PI / 12;
    const midRad = (rimR + innerRimR) * 0.5;
    paintCodexDisc(ctx, Math.cos(midA) * midRad, Math.sin(midA) * midRad, 2.5 * s, 2.4 * s, {
      steps: 8,
      fill: i % 3 === 0 ? sw.cinnabar : i % 3 === 1 ? sw.mayaBlue : COL.stuccoHi,
      lw: 0,
      seed: 1485 + i,
      washJitter: 0,
    });
  }

  // 3. Eight Chicozapote Hardwood Spokes Strung with Jadeite Beads
  const numSpokes = 8;
  for (let i = 0; i < numSpokes; i++) {
    const a = (i * Math.PI * 2) / numSpokes;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    drawQuillRibbon(
      ctx,
      [[ca * 10 * s, sa * 10 * s], [ca * (innerRimR * 0.55) - sa * 0.8 * s, sa * (innerRimR * 0.55) + ca * 0.8 * s], [ca * innerRimR, sa * innerRimR]],
      { wStart: 2.4 * s, wEnd: 2.0 * s, seed: 1500 + i, wobble: 0.2 }
    );
    for (const br of [15.5, 23.8]) {
      paintCodexDisc(ctx, ca * br * s, sa * br * s, 3.4 * s, 3.2 * s, {
        rot: a,
        steps: 9,
        fill: br < 20 ? sw.mayaBlue : sw.jade,
        lw: 1.5 * s,
        seed: 1510 + i * 2 + (br | 0),
      });
    }
  }

  // 4. Central K'in Solar Deity Stone Hub Medallion
  paintCodexDisc(ctx, 0, 0, 10.5 * s, 10.2 * s, { steps: 12, fill: sw.cinnabar, lw: 2.3 * s, seed: 1530 + seedOffset });
  paintCodexDisc(ctx, 0, 0, 5.2 * s, 5.0 * s, { steps: 9, fill: COL.ochreLight, lw: 1.6 * s, seed: 1531 + seedOffset });

  ctx.restore();
}

/**
 * Draws a Curved Knotted Chicozapote Hardwood Beam or Kukulkán Serpent Timber Member
 * (100% eliminates modern straight metal bicycle tubes!).
 */
function drawCarvedTimberBeam(ctx, ax, ay, bx, by, fillStyle, width, arch, s, seed) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  const steps = 8;
  const upper = [];
  const lower = [];
  const centerLine = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const bend = Math.sin(u * Math.PI) * arch * s + (hash2(i, seed, 1601) - 0.5) * 1.2 * s;
    const cx = lerp(ax, bx, u) + nx * bend;
    const cy = lerp(ay, by, u) + ny * bend;
    const halfW = (width * 0.5 + Math.sin(u * Math.PI * 2 + seed) * 0.6) * s;
    centerLine.push([cx, cy]);
    upper.push([cx + nx * halfW, cy + ny * halfW]);
    lower.push([cx - nx * halfW, cy - ny * halfW]);
  }
  const poly = [...upper, ...lower.reverse(), upper[0]];
  paintCodexShape(ctx, poly, { fill: fillStyle, lw: 2.2 * s, seed, washJitter: 0.75 });
  return centerLine;
}

/**
 * Draws Criss-Crossed Henequen / Agave Fiber Cordage Lashing at a Timber Frame Joint!
 */
function drawAgaveCordLashing(ctx, x, y, radius, s, seed) {
  paintCodexDisc(ctx, x, y, radius * s, radius * 0.92 * s, {
    steps: 10,
    fill: '#dfc58f',
    lw: 2.0 * s,
    seed,
  });
  drawQuillRibbon(ctx, [[x - radius * 0.7 * s, y - radius * 0.65 * s], [x + radius * 0.7 * s, y + radius * 0.65 * s]], {
    wStart: 1.7 * s,
    wEnd: 1.5 * s,
    color: COL.charcoal,
    seed: seed + 1,
  });
  drawQuillRibbon(ctx, [[x + radius * 0.7 * s, y - radius * 0.65 * s], [x - radius * 0.7 * s, y + radius * 0.65 * s]], {
    wStart: 1.7 * s,
    wEnd: 1.5 * s,
    color: COL.charcoal,
    seed: seed + 2,
  });
}

/**
 * Draws the Bespoke Maya Water-Bird Deity Pelican (`Itzam Yeh`) & Kukulkán Feathered-Serpent Timber/Stone Bicycle!
 * Strictly built from `computePelicanRig` joints (ZERO `drawRig2D`, ZERO `ctx.arc`/`roundRect`/`setLineDash`).
 */
function drawMayaDeityPelicanAndBike(ctx, rig, sw) {
  const s = rig.root.scale;
  const t = rig.time;

  // Soft dry-brushed chalky lime-gesso reserve strokes right behind the deity torso & head
  // (authentic codex reserve ground instead of a uniform digital sticker cutout or radial gradient!)
  for (const [ox, oy, rx, ry, sd] of [
    [rig.bodyCenter.x - 4 * s, rig.bodyCenter.y, 62 * s, 38 * s, 1650],
    [rig.head.x + 14 * s, rig.head.y + 8 * s, 58 * s, 34 * s, 1651],
  ]) {
    paintCodexDisc(ctx, ox, oy, rx, ry, {
      steps: 14,
      fill: 'rgba(249, 241, 220, 0.56)',
      lw: 0,
      seed: sd,
      washJitter: 1.8,
    });
  }

  const drawMayaLeg = (hipPt, kneePt, footPt, pedalPt, isFar, sd) => {
    // Carved Chicozapote & Jadeite Crank Lever
    drawCarvedTimberBeam(ctx, rig.bb.x, rig.bb.y, pedalPt.x, pedalPt.y, sw.ochre, 6.2, 1.5, s, sd);

    // Articulated Scaled Terracotta/Cinnabar Water-Bird Leg
    const legFill = isFar ? COL.terracottaDark : sw.terracotta;
    drawCarvedTimberBeam(ctx, hipPt.x, hipPt.y, kneePt.x, kneePt.y, legFill, 8.2, -1.8, s, sd + 2);
    drawCarvedTimberBeam(ctx, kneePt.x, kneePt.y, footPt.x, footPt.y, legFill, 7.2, 1.4, s, sd + 3);

    // Jadeite knee & ankle deity cuffs
    for (const [jt, js] of [[kneePt, sd + 4], [footPt, sd + 5]]) {
      paintCodexDisc(ctx, jt.x, jt.y, 4.8 * s, 4.4 * s, { steps: 9, fill: sw.jade, lw: 1.8 * s, seed: js });
    }

    // Webbed Codex Bird Foot gripping carved Maya-Blue Limestone Pedal Block
    paintCodexShape(
      ctx,
      [
        [footPt.x - 5 * s, footPt.y],
        [footPt.x + 17 * s, footPt.y + 2 * s],
        [footPt.x + 11 * s, footPt.y + 8 * s],
        [footPt.x - 5 * s, footPt.y + 5 * s],
        [footPt.x - 5 * s, footPt.y],
      ],
      { fill: legFill, lw: 2.1 * s, seed: sd + 6 }
    );
    paintCodexBox(ctx, pedalPt.x - 10 * s, pedalPt.y + 1 * s, 20 * s, 6.5 * s, {
      fill: sw.mayaBlue,
      lw: 1.9 * s,
      corner: 2 * s,
      seed: sd + 7,
    });
  };

  // 1. Far Leg & Crank
  drawMayaLeg(rig.leftHip, rig.leftKnee, rig.leftFoot, rig.leftPedal, true, 1660);

  // 2. Hand-Chiseled Polygonal Obsidian & Limestone Solar Calendar Wheels
  drawMayaCalendarWheel(ctx, rig.rearWheel, s, sw, 0);
  drawMayaCalendarWheel(ctx, rig.frontWheel, s, sw, 50);

  // 3. Twisted Two-Ply Henequen Hemp Cord Drive studded with Jadeite Beads (ZERO `setLineDash`!)
  for (const yOff of [-1, 1]) {
    const ax = rig.rearWheel.x;
    const ay = rig.rearWheel.y + yOff * 6 * s;
    const bx = rig.bb.x;
    const by = rig.bb.y + yOff * 12.5 * s;
    const ropePts = [];
    for (let i = 0; i <= 14; i++) {
      const u = i / 14;
      const sag = yOff > 0 ? Math.sin(u * Math.PI) * 2.5 * s : 0;
      const twist = Math.sin(u * Math.PI * 10 - rig.wheelAngle * 3) * 1.1 * s;
      ropePts.push([lerp(ax, bx, u), lerp(ay, by, u) + sag + twist]);
    }
    drawQuillRibbon(ctx, ropePts, { wStart: 3.1 * s, wEnd: 3.0 * s, color: COL.charcoal, seed: 1680 + yOff, wobble: 0.15, poolCorners: false });
    drawQuillRibbon(ctx, ropePts, { wStart: 1.5 * s, wEnd: 1.4 * s, color: '#dfc58f', seed: 1683 + yOff, wobble: 0.1, poolCorners: false });
  }

  // 4. Bicephalic Kukulkán Feathered-Serpent & Lashed Chicozapote Hardwood Ritual Frame!
  // Rear timber stays & seat post
  drawCarvedTimberBeam(ctx, rig.rearWheel.x, rig.rearWheel.y, rig.seatCluster.x, rig.seatCluster.y, '#8c552e', 7.0, 4.5, s, 1701);
  drawCarvedTimberBeam(ctx, rig.rearWheel.x, rig.rearWheel.y, rig.bb.x, rig.bb.y, sw.ochre, 6.8, -3.2, s, 1702);
  drawCarvedTimberBeam(ctx, rig.bb.x, rig.bb.y, rig.seatCluster.x, rig.seatCluster.y, sw.cinnabar, 8.0, -3.5, s, 1703);
  // Curved Chicozapote front fork
  drawCarvedTimberBeam(ctx, rig.headBot.x, rig.headBot.y, rig.frontWheel.x, rig.frontWheel.y, '#8c552e', 7.6, 5.8, s, 1704);
  drawCarvedTimberBeam(ctx, rig.headTop.x, rig.headTop.y, rig.headBot.x, rig.headBot.y, sw.ochre, 8.6, 1.5, s, 1705);

  // Sinuous Kukulkán Feathered-Serpent Main Arching Beam (SeatCluster -> HeadTop) & Belly Beam (BB -> HeadBot)!
  const serpTopLine = drawCarvedTimberBeam(ctx, rig.seatCluster.x, rig.seatCluster.y, rig.headTop.x, rig.headTop.y, sw.mayaBlue, 9.2, -9.5, s, 1706);
  drawCarvedTimberBeam(ctx, rig.bb.x, rig.bb.y, rig.headBot.x, rig.headBot.y, sw.jade, 8.4, 7.5, s, 1707);

  // Serpent dorsal scale markings along the arching Kukulkán top beam
  for (let i = 1; i < serpTopLine.length - 1; i += 2) {
    paintCodexDisc(ctx, serpTopLine[i][0], serpTopLine[i][1], 2.2 * s, 2.0 * s, {
      steps: 7,
      fill: COL.ochreLight,
      lw: 0,
      seed: 1710 + i,
    });
  }
  // Carved Golden Rattle Tail of Kukulkán projecting behind rear axle!
  for (let rt = 0; rt < 3; rt++) {
    paintCodexDisc(ctx, rig.rearWheel.x - (10 + rt * 6.5) * s, rig.rearWheel.y - (3 + rt * 1.5) * s, (4.2 - rt * 0.7) * s, (3.4 - rt * 0.5) * s, {
      steps: 8,
      fill: sw.ochre,
      lw: 1.5 * s,
      seed: 1720 + rt,
    });
  }

  // Criss-crossed Agave/Henequen Cord Lashings at Timber Frame Lugs + Solar Bottom-Bracket Stone
  drawAgaveCordLashing(ctx, rig.seatCluster.x, rig.seatCluster.y, 6.6, s, 1730);
  drawAgaveCordLashing(ctx, rig.headTop.x, rig.headTop.y, 6.6, s, 1733);
  drawAgaveCordLashing(ctx, rig.headBot.x, rig.headBot.y, 6.2, s, 1736);
  paintCodexDisc(ctx, rig.bb.x, rig.bb.y, 12.8 * s, 12.5 * s, { steps: 14, fill: sw.jade, lw: 2.3 * s, seed: 1740 });
  paintCodexDisc(ctx, rig.bb.x, rig.bb.y, 5.5 * s, 5.3 * s, { steps: 9, fill: sw.cinnabar, lw: 1.7 * s, seed: 1741 });

  // Timber Seatpost,Handlebar Stem & Fierce Carved Kukulkán Feathered-Serpent Prow Head!
  drawCarvedTimberBeam(ctx, rig.seatCluster.x, rig.seatCluster.y, rig.saddle.x, rig.saddle.y, '#8c552e', 6.4, 0, s, 1745);
  drawCarvedTimberBeam(ctx, rig.headTop.x, rig.headTop.y, rig.stemTop.x, rig.stemTop.y, sw.cinnabar, 6.8, -1.5, s, 1746);
  drawCarvedTimberBeam(ctx, rig.stemTop.x, rig.stemTop.y, rig.handleGrip.x, rig.handleGrip.y, '#8c552e', 6.4, -2.5, s, 1747);

  // Sculpted Kukulkán Serpent Head Prow on front stemTop (curled snout + forked cinnabar tongue!)
  const spx = rig.stemTop.x + 5 * s;
  const spy = rig.stemTop.y - 3 * s;
  paintCodexShape(
    ctx,
    [
      [spx - 5 * s, spy - 6 * s],
      [spx + 13 * s, spy - 7 * s],
      [spx + 17 * s, spy - 13 * s],
      [spx + 11 * s, spy - 14 * s],
      [spx + 14 * s, spy + 2 * s],
      [spx - 5 * s, spy + 4 * s],
      [spx - 5 * s, spy - 6 * s],
    ],
    { fill: sw.jade, lw: 2.0 * s, seed: 1750 }
  );
  // Forked cinnabar serpent tongue flickering slightly with pedal rhythm
  const tongueFlick = Math.sin(t * 10) * 1.8 * s;
  drawQuillRibbon(ctx, [[spx + 13 * s, spy + 1 * s], [spx + 23 * s, spy + 3 * s + tongueFlick]], {
    wStart: 2.0 * s,
    wEnd: 1.2 * s,
    color: COL.cinnabarWet,
    seed: 1751,
  });
  paintCodexDisc(ctx, spx + 4 * s, spy - 2.5 * s, 2.5 * s, 2.3 * s, { steps: 7, fill: COL.ochreLight, lw: 1.2 * s, seed: 1752 });

  // Jaguar-Pelt Saddle Cushion & Elastic Fluttering Cinnabar Maxtlatl Sash
  paintCodexBox(ctx, rig.saddle.x - 16 * s, rig.saddle.y - 4 * s, 30 * s, 9 * s, {
    fill: COL.ochreLight,
    lw: 2.2 * s,
    corner: 4 * s,
    seed: 1755,
  });
  for (const jx of [-8, 0, 7]) {
    paintCodexDisc(ctx, rig.saddle.x + jx * s, rig.saddle.y + 0.5 * s, 1.7 * s, 1.6 * s, { steps: 6, fill: COL.charcoal, lw: 0, seed: 1756 + jx });
  }

  // 5. Maya Water-Bird Deity Pelican (`Itzam Yeh`) Body, Ceremonial Tail & S-Neck
  const sashLag = Math.sin(rig.pedalAngle * 2 - 1.1) * 5.5 * s;
  for (let tf = 0; tf < 4; tf++) {
    const tyOff = (tf - 1.5) * 6.5 * s + sashLag * 0.25;
    paintCodexShape(
      ctx,
      [
        [rig.bodyCenter.x - 26 * s, rig.bodyCenter.y + tyOff * 0.5],
        [rig.tailTip.x - (15 - tf * 3) * s, rig.tailTip.y + tyOff],
        [rig.tailTip.x - (6 - tf * 2) * s, rig.tailTip.y + tyOff + 6 * s],
        [rig.bodyCenter.x - 20 * s, rig.bodyCenter.y + tyOff * 0.5 + 6 * s],
        [rig.bodyCenter.x - 26 * s, rig.bodyCenter.y + tyOff * 0.5],
      ],
      { fill: tf % 2 === 0 ? sw.mayaBlue : sw.cinnabar, lw: 2.2 * s, seed: 1760 + tf }
    );
  }

  // Plump Stucco-Ivory Deity Torso sampled along hand-drawn points
  const torsoPts = [
    [rig.tailTip.x + 4 * s, rig.tailTip.y],
    [rig.bodyCenter.x - 32 * s, rig.bodyCenter.y - 22 * s],
    [rig.bodyCenter.x - 4 * s, rig.bodyCenter.y - 26 * s],
    [rig.chest.x + 10 * s, rig.chest.y - 6 * s],
    [rig.bodyCenter.x + 30 * s, rig.bodyCenter.y + 12 * s],
    [rig.bodyCenter.x + 12 * s, rig.bodyCenter.y + 24 * s],
    [rig.hip.x - 14 * s, rig.hip.y + 15 * s],
    [rig.bodyCenter.x - 42 * s, rig.bodyCenter.y + 13 * s],
    [rig.tailTip.x + 4 * s, rig.tailTip.y],
  ];
  paintCodexShape(ctx, torsoPts, { fill: sw.stucco, lw: 3.2 * s, seed: 1770, washJitter: 1.35, drySplit: true });

  // Secondary elastic Cinnabar Maxtlatl Loincloth Sash bouncing with 120 BPM follow-through
  paintCodexShape(
    ctx,
    [
      [rig.hip.x - 16 * s, rig.hip.y + 4 * s],
      [rig.hip.x - 31 * s - sashLag, rig.hip.y + 29 * s],
      [rig.hip.x - 18 * s - sashLag * 0.85, rig.hip.y + 31 * s],
      [rig.hip.x - 4 * s, rig.hip.y + 8 * s],
      [rig.hip.x - 16 * s, rig.hip.y + 4 * s],
    ],
    { fill: sw.cinnabar, lw: 2.1 * s, seed: 1772 }
  );

  // S-Curved Neck built as a true variable-width codex polygon + twin quill contours
  const neckLeft = [];
  const neckRight = [];
  const p0 = { x: rig.chest.x - 2 * s, y: rig.chest.y + 4 * s };
  const p1 = rig.neckC1;
  const p2 = rig.neckC2;
  const p3 = rig.head;
  const nSteps = 12;
  for (let i = 0; i <= nSteps; i++) {
    const u = i / nSteps;
    const inv = 1 - u;
    const bx = inv * inv * inv * p0.x + 3 * inv * inv * u * p1.x + 3 * inv * u * u * p2.x + u * u * u * p3.x;
    const by = inv * inv * inv * p0.y + 3 * inv * inv * u * p1.y + 3 * inv * u * u * p2.y + u * u * u * p3.y;
    const u2 = Math.min(1, u + 0.04);
    const inv2 = 1 - u2;
    const bx2 = inv2 * inv2 * inv2 * p0.x + 3 * inv2 * inv2 * u2 * p1.x + 3 * inv2 * u2 * u2 * p2.x + u2 * u2 * u2 * p3.x;
    const by2 = inv2 * inv2 * inv2 * p0.y + 3 * inv2 * inv2 * u2 * p1.y + 3 * inv2 * u2 * u2 * p2.y + u2 * u2 * u2 * p3.y;
    const dx = bx2 - bx;
    const dy = by2 - by;
    const dl = Math.hypot(dx, dy) || 1;
    const nx = -dy / dl;
    const ny = dx / dl;
    const hw = lerp(10.8, 8.8, u) * s;
    neckLeft.push([bx + nx * hw, by + ny * hw]);
    neckRight.push([bx - nx * hw, by - ny * hw]);
  }
  const neckPoly = [...neckLeft, ...neckRight.slice().reverse(), neckLeft[0]];
  paintCodexShape(ctx, neckPoly, { fill: sw.stucco, lw: 0, seed: 1775, washJitter: 1.0 });
  drawQuillRibbon(ctx, neckLeft, { wStart: 3.1 * s, wEnd: 2.7 * s, seed: 1776, wobble: 0.3 });
  drawQuillRibbon(ctx, neckRight, { wStart: 3.1 * s, wEnd: 2.7 * s, seed: 1777, wobble: 0.3 });

  // Royal Maya Three-Tier Jade & Cinnabar Beaded Pectoral Collar (bouncing subtly with chest)
  const pcX = rig.chest.x + 1 * s;
  const pcY = rig.chest.y + 2 * s + sashLag * 0.18;
  const pecPts = [];
  for (let i = 0; i <= 8; i++) {
    const a = lerp(0.25, Math.PI - 0.35, i / 8);
    pecPts.push([pcX + Math.cos(a) * 20 * s, pcY - 6 * s + Math.sin(a) * 20 * s]);
  }
  for (let i = 8; i >= 0; i--) {
    const a = lerp(0.25, Math.PI - 0.35, i / 8);
    pecPts.push([pcX + Math.cos(a) * 9 * s, pcY - 6 * s + Math.sin(a) * 9 * s]);
  }
  pecPts.push(pecPts[0]);
  paintCodexShape(ctx, pecPts, { fill: sw.mayaBlue, lw: 2.2 * s, seed: 1780 });
  for (let b = -2; b <= 2; b++) {
    const ba = Math.PI * 0.5 + b * 0.28;
    paintCodexDisc(ctx, pcX + Math.cos(ba) * 22.5 * s, pcY - 6 * s + Math.sin(ba) * 22.5 * s, 3.3 * s, 3.2 * s, {
      steps: 8,
      fill: b % 2 === 0 ? sw.jade : sw.cinnabar,
      lw: 1.6 * s,
      seed: 1782 + b,
    });
  }

  // 6. Multi-Segment Traveling-Wave Resplendent Quetzal Long Plume Headdress (`6 段行波传导`)!
  const hx = rig.head.x;
  const hy = rig.head.y;
  const plumeConfigs = [
    { len: 116, lift: -36, phase: 0.0, fill: sw.mayaBlue, tip: COL.ochreLight },
    { len: 132, lift: -17, phase: 0.85, fill: sw.jade, tip: sw.cinnabar },
    { len: 100, lift: -2, phase: 1.7, fill: COL.mayaBlueLight, tip: COL.ochreLight },
    { len: 76, lift: -48, phase: 2.55, fill: sw.cinnabar, tip: sw.jade },
  ];
  plumeConfigs.forEach((pl, pIdx) => {
    const segs = 6;
    const upper = [];
    const lower = [];
    for (let k = 0; k <= segs; k++) {
      const u = k / segs;
      // Traveling sine-whip wave propagating from crown (u=0) to tail-tip (u=1) synced to 120 BPM!
      const travel = Math.sin(t * Math.PI * 4 - u * 3.6 + pl.phase) * (12 * u * u) * s;
      const archLift = Math.sin(u * Math.PI) * -14 * s + pl.lift * u * s;
      const px = hx - 8 * s - pl.len * u * s;
      const py = hy - 11 * s + archLift + travel;
      const halfW = lerp(4.2, 2.2, u) * s;
      upper.push([px, py - halfW]);
      lower.push([px, py + halfW]);
    }
    const plumePoly = [...upper, ...lower.slice().reverse(), upper[0]];
    paintCodexShape(ctx, plumePoly, { fill: pl.fill, lw: 2.2 * s, seed: 1790 + pIdx });
    const tipPt = upper[segs];
    paintCodexDisc(ctx, tipPt[0] + 2 * s, tipPt[1] + 2.5 * s, 4.3 * s, 4.0 * s, {
      steps: 9,
      fill: pl.tip,
      lw: 1.7 * s,
      seed: 1795 + pIdx,
    });
  });

  // 7. Pelican Deity Head, Crosshatched Water-Band Gular Pouch & Step-Fret Carved Beak
  paintCodexDisc(ctx, hx, hy, rig.head.r * 1.07, rig.head.r * 1.02, {
    steps: 14,
    fill: sw.stucco,
    lw: 3.0 * s,
    seed: 1800,
    washJitter: 1.1,
  });

  // Elastic Gular Throat Pouch with Maya Crosshatched Water-Band & Scale Dots
  const pouchPts = [
    [rig.beakLowerBase.x, rig.beakLowerBase.y],
    [lerp(rig.beakLowerBase.x, rig.pouchBelly.x, 0.55), rig.pouchBelly.y - 4 * s],
    [rig.pouchBelly.x + 8 * s, rig.pouchBelly.y - 1 * s],
    [rig.beakTip.x - 3 * s, rig.beakTip.y],
    [rig.beakUpperBase.x, rig.beakUpperBase.y + 5 * s],
    [rig.beakLowerBase.x, rig.beakLowerBase.y],
  ];
  paintCodexShape(ctx, pouchPts, { fill: sw.cinnabar, lw: 2.8 * s, seed: 1805, washJitter: 1.15 });
  drawQuillRibbon(
    ctx,
    [
      [rig.beakLowerBase.x + 8 * s, rig.beakLowerBase.y + 6 * s],
      [rig.pouchBelly.x - 1 * s, rig.pouchBelly.y - 7 * s],
      [rig.beakTip.x - 15 * s, rig.beakTip.y + 1 * s],
    ],
    { wStart: 2.6 * s, wEnd: 1.8 * s, color: COL.ochreLight, seed: 1806 }
  );
  // Codex crosshatched water patch on pouch belly
  for (let ch = -1; ch <= 1; ch++) {
    const cx0 = rig.pouchBelly.x + ch * 6 * s;
    const cy0 = rig.pouchBelly.y - 11 * s;
    drawQuillRibbon(ctx, [[cx0 - 3 * s, cy0 - 3 * s], [cx0 + 3 * s, cy0 + 3 * s]], {
      wStart: 1.2 * s,
      wEnd: 1.1 * s,
      color: COL.charcoal,
      seed: 1808 + ch,
    });
  }

  // Great Hooked Upper Mandible with Carved Step-Fret Volutes
  const beakPts = [
    [rig.beakUpperBase.x, rig.beakUpperBase.y - 2 * s],
    [lerp(rig.beakUpperBase.x, rig.beakTip.x, 0.5), lerp(rig.beakUpperBase.y, rig.beakTip.y, 0.5) - 3.5 * s],
    [rig.beakTip.x, rig.beakTip.y - 4 * s],
    [rig.beakTip.x + 5.5 * s, rig.beakTip.y + 2.5 * s],
    [rig.beakTip.x - 2 * s, rig.beakTip.y + 8 * s],
    [rig.beakLowerBase.x, rig.beakLowerBase.y + 1 * s],
    [rig.beakUpperBase.x, rig.beakUpperBase.y - 2 * s],
  ];
  paintCodexShape(ctx, beakPts, { fill: sw.ochre, lw: 2.9 * s, seed: 1812, washJitter: 1.0 });

  const bAng = Math.atan2(rig.beakTip.y - rig.beakUpperBase.y, rig.beakTip.x - rig.beakUpperBase.x);
  ctx.save();
  ctx.translate(rig.beakUpperBase.x, rig.beakUpperBase.y + 2 * s);
  ctx.rotate(bAng);
  for (let v = 0; v < 3; v++) {
    const vx = (12 + v * 17) * s;
    drawQuillRibbon(
      ctx,
      [[vx, 3 * s], [vx, -3 * s], [vx + 10 * s, -3 * s], [vx + 10 * s, 2 * s], [vx + 5 * s, 2 * s]],
      { wStart: 1.9 * s, wEnd: 1.5 * s, seed: 1815 + v }
    );
  }
  ctx.restore();

  // Maya Deity Squared-Scroll Eye (`K'uh`) & Supraorbital Maya-Blue Brow Plate
  const ex = hx + 4 * s;
  const ey = hy - 3 * s;
  paintCodexShape(
    ctx,
    [[ex - 8 * s, ey - 5 * s], [ex + 2 * s, ey - 10 * s], [ex + 9 * s, ey - 4 * s], [ex + 6 * s, ey - 1 * s], [ex - 6 * s, ey - 1 * s], [ex - 8 * s, ey - 5 * s]],
    { fill: sw.mayaBlue, lw: 2.0 * s, seed: 1820 }
  );
  paintCodexBox(ctx, ex - 5 * s, ey - 3.5 * s, 10 * s, 8 * s, { fill: COL.stuccoHi, lw: 1.9 * s, corner: 2.5 * s, seed: 1821 });
  // Squared spiral god-pupil
  drawQuillRibbon(
    ctx,
    [[ex - 2 * s, ey - 2 * s], [ex + 3 * s, ey - 2 * s], [ex + 3 * s, ey + 2.5 * s], [ex - 1 * s, ey + 2.5 * s], [ex - 1 * s, ey]],
    { wStart: 2.0 * s, wEnd: 1.6 * s, seed: 1822 }
  );

  // Crown Headdress Mask-Band & Luminous Jadeite Flare Earspool
  paintCodexBox(ctx, hx - 16 * s, hy - 18 * s, 28 * s, 8 * s, { fill: sw.cinnabar, lw: 2.1 * s, corner: 2.5 * s, seed: 1825 });
  for (let jb = -10; jb <= 6; jb += 8) {
    paintCodexDisc(ctx, hx + jb * s, hy - 14 * s, 3.3 * s, 3.2 * s, { steps: 8, fill: sw.jade, lw: 1.5 * s, seed: 1826 + jb });
  }
  const earX = hx - 7 * s;
  const earY = hy + 4 * s;
  paintCodexDisc(ctx, earX, earY, 6.8 * s, 6.6 * s, { steps: 11, fill: sw.jade, lw: 2.1 * s, seed: 1830 });
  paintCodexDisc(ctx, earX, earY, 2.7 * s, 2.7 * s, { steps: 8, fill: COL.jadeLight, lw: 0, seed: 1831 });
  paintCodexBox(ctx, earX - 2.6 * s, earY + 6.5 * s + sashLag * 0.12, 5.2 * s, 9 * s, {
    fill: sw.mayaBlue,
    lw: 1.8 * s,
    corner: 2 * s,
    seed: 1832,
  });

  // 8. Near Leg & Crank
  drawMayaLeg(rig.rightHip, rig.rightKnee, rig.rightFoot, rig.rightPedal, false, 1840);

  // 9. Layered Scalloped Codex Wing + Charcoal-Tipped Primaries & Jade Wristband
  const wingPts = [
    [rig.wingShoulder.x - 4 * s, rig.wingShoulder.y],
    [lerp(rig.wingShoulder.x, rig.wingElbow.x, 0.6) - 10 * s, rig.wingElbow.y + 12 * s],
    [rig.wingElbow.x + 4 * s, rig.wingElbow.y + 12 * s],
    [rig.wingTip.x + 5 * s, rig.wingTip.y + 3 * s],
    [lerp(rig.wingTip.x, rig.wingShoulder.x, 0.52) + 8 * s, rig.wingElbow.y - 6 * s],
    [rig.wingShoulder.x + 12 * s, rig.wingShoulder.y + 2 * s],
    [rig.wingShoulder.x - 4 * s, rig.wingShoulder.y],
  ];
  paintCodexShape(ctx, wingPts, { fill: COL.stuccoWarm, lw: 2.9 * s, seed: 1850, washJitter: 1.15 });

  // Scalloped Maya-Blue covert feathers
  for (let cf = 0; cf < 4; cf++) {
    const u = 0.16 + cf * 0.18;
    const fx = lerp(rig.wingShoulder.x, rig.wingTip.x, u);
    const fy = lerp(rig.wingShoulder.y, rig.wingTip.y, u) + (2 - cf * 0.4) * 2.5 * s;
    paintCodexDisc(ctx, fx, fy, 8.5 * s, 4.5 * s, {
      rot: -0.18,
      steps: 10,
      fill: cf % 2 === 0 ? sw.mayaBlue : sw.cinnabar,
      lw: 1.8 * s,
      seed: 1855 + cf,
    });
  }
  // Charcoal-tipped primaries & Jadeite wrist cuff gripping handlebar
  for (let pf = 0; pf < 3; pf++) {
    const u = 0.58 + pf * 0.15;
    const fx = lerp(rig.wingElbow.x, rig.wingTip.x, u);
    const fy = lerp(rig.wingElbow.y, rig.wingTip.y, u) + (2 - pf) * 3.4 * s;
    paintCodexDisc(ctx, fx, fy, 8.5 * s, 3.0 * s, {
      rot: -0.15,
      steps: 10,
      fill: pf === 1 ? sw.cinnabar : COL.charcoal,
      lw: 1.2 * s,
      seed: 1862 + pf,
    });
  }
  paintCodexBox(ctx, rig.wingTip.x - 6 * s, rig.wingTip.y - 4 * s, 10 * s, 9 * s, {
    fill: sw.jade,
    lw: 1.9 * s,
    corner: 2.5 * s,
    seed: 1870,
  });
}

export function render(kit, slot, scene, params) {
  const {
    t,
    localT,
    pelicanLocalX,
    pedalAngle,
    speedScale,
    isOutroThumbnail = false,
  } = params;

  slot.usedFb = false;
  const g = slot.g2d;
  const ctx = g.drawingContext;
  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Draw Static Baked SLUB Dresden Codex Amatl Bark, Spalled Lime Stucco & Architecture
  const sw = getMayaPigmentSwatches(kit);
  const baked = getBakedMayaCodex(kit);
  ctx.drawImage(baked.canvas, 0, 0);

  // 2. Animated Carved Maya *Ik'* Copal Incense Breath-Scrolls rising from Temple Summit Brazier
  for (let k = 0; k < 2; k++) {
    const phase = (t * 0.48 + k * 0.5) % 1;
    const bx = 256 + Math.sin(t * 2.0 + k * 2.4) * 6;
    const by = 394 - phase * 64;
    const alpha = Math.sin(Math.PI * phase) * 0.85;
    drawMayaIkScroll(
      ctx,
      bx,
      by + 16,
      bx + (k === 0 ? -8 : 10),
      by - 12,
      0.72 + phase * 0.16,
      k === 0 ? COL.stuccoHi : COL.mayaBlueLight,
      alpha,
      1900 + k
    );
  }

  // 3. Precompute Pelican Rig so Crank-to-Tally *Ik'* Pulse connects seamlessly to `rig.bb`
  const riderVisible = pelicanLocalX > -250 && pelicanLocalX < PANEL_SIZE + 250;
  const rig = riderVisible
    ? computePelicanRig({
        x: pelicanLocalX,
        y: ROAD_EDGE_Y,
        pedalAngle,
        scale: 1.0,
        slope: 0,
        speedScale,
        poseMode: 'normal',
        time: t,
      })
    : null;

  // 4. Live Right-Column Maya Vigesimal Tally, Crank-to-Column *Ik'* Pulse & Dipping/Brushing Scribe
  drawLiveTallyAndScribe(ctx, t, localT, pelicanLocalX, rig, sw);

  // 5. Bespoke Maya Water-Bird Deity Pelican & Kukulkán Feathered-Serpent Timber/Stone Bicycle along y = 680
  if (rig) {
    drawMayaDeityPelicanAndBike(ctx, rig, sw);
  }

  // 6. Museum Placard Policy (#85): 100% pure codex artwork when `!isOutroThumbnail`!
  //    Retain compact bottom strip ONLY for `isOutroThumbnail` so Outro 7x3 wall stays crisp!
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(18, 15, 12, 0.76)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.fillStyle = '#f6efe2';
    ctx.font = '700 48px "PelicanSerif", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} ${scene.zh}`, 36, PANEL_SIZE - 48);
  }

  ctx.restore();
}
