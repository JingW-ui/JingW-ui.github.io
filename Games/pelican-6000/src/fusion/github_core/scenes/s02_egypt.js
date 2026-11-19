// src/scenes/s02_egypt.js
// #02 埃及壁画 (Ancient Egyptian Tomb Fresco · New Kingdom Thebes, c. 1300 BCE) — r3 Museum Artifact Edition
// - Zero SVG geometric primitives (zero roundRect / strokeRect / ctx.arc circles / setLineDash / radial or linear gradients).
// - Zero computer fonts inside the artwork (drawEgyptTitleCard removed; Royal Cartouche "鹈鹕测试" & canon cubit tallies
//   100% hand-brushed via Juncus rush-reed calligraphy paths!).
// - Three-stratum geological tomb substrate (chiseled Theban limestone -> chaff-mud Mouna -> troweled gypsum Intonaco)
//   + coarse crushed Egyptian Blue / Malachite frit granulation + cross-layer plaster spalling & craquelure overlay.
// - Authentic full-bleed Tomb Register Baselines (x = 0..330 & x = 670..1000 at y = 442) framing a central Naos Shrine Portal.
// - 18th-Dynasty Tutankhamun steam-bent S-pole gilded chariot-bicycle + Nebamun-style imbricated-feather Pelican Deity.

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  clamp,
  lerp,
  smoothstep,
} from '../beat/timeline.js';
import { computePelicanRig } from '../rig/pelican.js';

const EGYPT = {
  plasterLight: '#f1e2be',
  plasterMid: '#e6cfa0',
  plasterWarm: '#d8bc86',
  limestoneRaw: '#bfa474',
  mounaMud: '#97794e',
  vermilionGrid: '#bf3f23',
  carnelian: '#be3b1e',
  carnelianDeep: '#892510',
  gold: '#d89d24',
  goldBright: '#f3c54b',
  goldHighlight: '#fff0a6',
  bronzeDark: '#825412',
  lapis: '#174b74',
  lapisBright: '#216294',
  lapisDeep: '#0f304a',
  turquoise: '#1e7b80',
  turquoiseLight: '#3fa3a5',
  malachite: '#2c6d48',
  alabaster: '#f8f0df',
  ochreWash: '#dfb365',
  kohl: '#191410',
  terracotta: '#b95530',
};

const MID_REGISTER_Y = 442; // Full-bleed side register baseline (x=0..330 & x=670..1000), 100% clear of Pelican entry/exit

function hash2e(ix, iy, seed = 2029) {
  let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) * 2.3283064365386963e-10;
}

function vNoise2D(x, y, seed) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2e(ix, iy, seed);
  const b = hash2e(ix + 1, iy, seed);
  const c = hash2e(ix, iy + 1, seed);
  const d = hash2e(ix + 1, iy + 1, seed);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

/**
 * Generates an organic hand-drawn closed loop / oval (replaces mathematical ctx.arc!).
 */
function rushRingPoints(cx, cy, rx, ry, segments = 18, rng = null, rot = 0, ecc = 0.045) {
  const pts = [];
  const ca = Math.cos(rot);
  const sa = Math.sin(rot);
  const p1 = rng ? rng() * Math.PI * 2 : 0.7;
  const p2 = rng ? rng() * Math.PI * 2 : 2.1;
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const wobble =
      i === segments
        ? pts[0]._w
        : 1 + Math.sin(a * 2 + p1) * ecc + Math.cos(a * 3 + p2) * (ecc * 0.6) + (rng ? (rng() - 0.5) * ecc * 0.7 : 0);
    const lx = Math.cos(a) * rx * wobble;
    const ly = Math.sin(a) * ry * wobble;
    const pt = [cx + lx * ca - ly * sa, cy + lx * sa + ly * ca];
    pt._w = wobble;
    pts.push(pt);
  }
  return pts;
}

/**
 * Ancient Egyptian Juncus Rush-Stem Brush Stroke (灯心草芦苇笔引擎):
 * - Subdivides polylines to inject organic reed-pen hand tremor (0.4~1.0px);
 * - Simulates wet carbon/ochre ink pooling at stroke starts & corners, plus subtle reed fiber split!
 */
function rushStroke(ctx, pts, rng, {
  color = EGYPT.kohl,
  width = 1.9,
  tremor = 0.55,
  alpha = 0.95,
  dryTail = true,
  subStep = 9,
} = {}) {
  if (!pts || pts.length < 2) return;

  const dense = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const d = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.ceil(d / subStep));
    for (let k = 1; k <= n; k++) {
      const u = k / n;
      const midEnv = Math.sin(u * Math.PI);
      const jx = rng ? (rng() - 0.5) * tremor * (0.5 + midEnv * 0.8) : 0;
      const jy = rng ? (rng() - 0.5) * tremor * (0.5 + midEnv * 0.8) : 0;
      dense.push([x0 + (x1 - x0) * u + jx, y0 + (y1 - y0) * u + jy]);
    }
  }

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Primary reed nib body
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.beginPath();
  for (let i = 0; i < dense.length; i++) {
    const [px, py] = dense[i];
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Secondary frayed rush fiber edge + start nib ink-pooling accent
  if (width >= 1.3) {
    ctx.globalAlpha = alpha * 0.42;
    ctx.lineWidth = Math.max(0.7, width * 0.48);
    ctx.beginPath();
    const endLimit = dryTail ? Math.max(1, dense.length - 1) : dense.length;
    for (let i = 0; i < endLimit; i++) {
      const [px, py] = dense[i];
      const off = (rng ? rng() - 0.35 : 0.2) * width * 0.42;
      if (i === 0) ctx.moveTo(px + off, py + off * 0.6);
      else ctx.lineTo(px + off, py + off * 0.6);
    }
    ctx.stroke();

    // Subtle wet-ink nib press at stroke start
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha * 0.38;
    const r0 = width * 0.58;
    ctx.fillRect(dense[0][0] - r0 * 0.5, dense[0][1] - r0 * 0.5, r0, r0 * 0.9);
  }

  ctx.restore();
}

/**
 * Fills a mineral tempera polygon with intentional 0.8~1.5px hand-registration breath (套色微偏与留白气口)
 * + optional crushed frit mineral crystal speckles, then strokes its Juncus kohl contour!
 */
function temperaPoly(ctx, pts, rng, {
  fillCol = EGYPT.alabaster,
  strokeCol = EGYPT.kohl,
  strokeW = 1.9,
  tremor = 0.55,
  misregX = null,
  misregY = null,
  alpha = 0.96,
  fritCount = 0,
  fritLight = 'rgba(255, 248, 226, 0.28)',
  fritDark = 'rgba(14, 24, 34, 0.24)',
  closeStroke = true,
} = {}) {
  if (!pts || pts.length < 3) return;
  const dx = misregX !== null ? misregX : rng ? (rng() - 0.38) * 2.1 : 0.9;
  const dy = misregY !== null ? misregY : rng ? (rng() - 0.42) * 1.9 : 0.7;

  ctx.save();
  if (fillCol) {
    let minX = 1e9;
    let minY = 1e9;
    let maxX = -1e9;
    let maxY = -1e9;
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const px = pts[i][0] + dx;
      const py = pts[i][1] + dy;
      if (px < minX) minX = px;
      if (py < minY) minY = py;
      if (px > maxX) maxX = px;
      if (py > maxY) maxY = py;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = fillCol;
    ctx.fill();

    // Coarse ground Egyptian Blue / Malachite / Orpiment mineral crystal granulation
    if (fritCount > 0 && rng) {
      ctx.save();
      ctx.clip();
      const sw = Math.max(2, maxX - minX);
      const sh = Math.max(2, maxY - minY);
      for (let f = 0; f < fritCount; f++) {
        const fx = minX + rng() * sw;
        const fy = minY + rng() * sh;
        const fs = 0.9 + rng() * 1.7;
        ctx.fillStyle = f % 2 === 0 ? fritLight : fritDark;
        ctx.fillRect(fx, fy, fs, fs * 0.85);
      }
      ctx.restore();
    }
  }
  ctx.restore();

  if (strokeCol && strokeW > 0) {
    const outlinePts = closeStroke ? [...pts, pts[0]] : pts;
    rushStroke(ctx, outlinePts, rng, {
      color: strokeCol,
      width: strokeW,
      tremor,
      alpha,
      dryTail: !closeStroke,
    });
  }
}

/**
 * Hand-brushed Egyptian Polychrome Tempera Block-Band Border (replaces CSS fillRect/strokeRect!):
 * Each pigment rectangle is hand-daubed with 0.9~1.5px breathing gaps inside Juncus kohl border rails.
 */
function drawTemperaBlockBand(ctx, rng, x0, y0, w, h, blockW = 24) {
  const cols = [EGYPT.lapis, EGYPT.gold, EGYPT.turquoise, EGYPT.carnelian];
  // Aged alabaster-gypsum backing strip
  temperaPoly(
    ctx,
    [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]],
    rng,
    { fillCol: EGYPT.alabaster, strokeCol: null, misregX: 0, misregY: 0, alpha: 0.92 }
  );

  let idx = 0;
  for (let bx = x0 + 1.5; bx < x0 + w - 2; bx += blockW) {
    const bw = Math.min(blockW - 3.2, x0 + w - bx - 1.5);
    if (bw <= 2) break;
    const jTop = (rng() - 0.5) * 0.9;
    const jBot = (rng() - 0.5) * 0.9;
    const pad = 1.6 + rng() * 0.7;
    const poly = [
      [bx + (rng() - 0.5) * 0.8, y0 + pad + jTop],
      [bx + bw + (rng() - 0.5) * 0.8, y0 + pad - jTop * 0.5],
      [bx + bw + (rng() - 0.5) * 0.8, y0 + h - pad + jBot],
      [bx + (rng() - 0.5) * 0.8, y0 + h - pad - jBot * 0.5],
    ];
    temperaPoly(ctx, poly, rng, {
      fillCol: cols[idx % cols.length],
      strokeCol: EGYPT.kohl,
      strokeW: 1.15,
      tremor: 0.4,
      misregX: (rng() - 0.4) * 1.2,
      misregY: (rng() - 0.4) * 1.0,
      fritCount: 3,
    });
    idx++;
  }

  // Hand-ruled top & bottom kohl reed border lines
  rushStroke(ctx, [[x0, y0 + 0.8], [x0 + w * 0.5, y0 + 0.5], [x0 + w, y0 + 0.9]], rng, {
    color: EGYPT.kohl, width: 2.1, tremor: 0.55, subStep: 24,
  });
  rushStroke(ctx, [[x0, y0 + h - 0.8], [x0 + w * 0.5, y0 + h - 0.5], [x0 + w, y0 + h - 0.9]], rng, {
    color: EGYPT.kohl, width: 2.1, tremor: 0.55, subStep: 24,
  });
}

/**
 * Vertical Polychrome Shrine Jamb Band (frames the side registers cleanly into the central Naos hall!).
 */
function drawVerticalTemperaJamb(ctx, rng, x0, y0, w, h, blockH = 22) {
  const cols = [EGYPT.gold, EGYPT.lapis, EGYPT.carnelian, EGYPT.turquoise];
  temperaPoly(
    ctx,
    [[x0, y0], [x0 + w, y0], [x0 + w, y0 + h], [x0, y0 + h]],
    rng,
    { fillCol: EGYPT.alabaster, strokeCol: null, misregX: 0, misregY: 0, alpha: 0.92 }
  );
  let idx = 0;
  for (let by = y0 + 1.5; by < y0 + h - 2; by += blockH) {
    const bh = Math.min(blockH - 3.0, y0 + h - by - 1.5);
    if (bh <= 2) break;
    temperaPoly(
      ctx,
      [
        [x0 + 1.6, by],
        [x0 + w - 1.6, by + (rng() - 0.5) * 0.7],
        [x0 + w - 1.6, by + bh],
        [x0 + 1.6, by + bh + (rng() - 0.5) * 0.7],
      ],
      rng,
      { fillCol: cols[idx % cols.length], strokeCol: EGYPT.kohl, strokeW: 1.05, tremor: 0.35, fritCount: 2 }
    );
    idx++;
  }
  rushStroke(ctx, [[x0 + 0.6, y0], [x0 + 0.6, y0 + h]], rng, { color: EGYPT.kohl, width: 1.8, tremor: 0.5, subStep: 22 });
  rushStroke(ctx, [[x0 + w - 0.6, y0], [x0 + w - 0.6, y0 + h]], rng, { color: EGYPT.kohl, width: 1.8, tremor: 0.5, subStep: 22 });
}

/**
 * Hand-brushed Blue Lotus Blossom, Papyrus Umbel, or Carnelian Lotus Bud (zero geometric ellipse/fillRect!).
 */
function drawRushLotusOrPapyrus(ctx, rng, cx, cy, size, kind = 'lotus', flipY = 1) {
  const toW = (lx, ly) => [cx + lx, cy + ly * flipY];

  if (kind === 'lotus') {
    // Outer lapis calyx sepals
    const outerPts = [
      toW(0, 0),
      toW(-size * 0.52, -size * 0.32),
      toW(-size * 0.92, -size * 0.98),
      toW(-size * 0.32, -size * 0.76),
      toW(0, -size * 1.08),
      toW(size * 0.32, -size * 0.76),
      toW(size * 0.92, -size * 0.98),
      toW(size * 0.52, -size * 0.32),
    ];
    temperaPoly(ctx, outerPts, rng, {
      fillCol: EGYPT.lapis, strokeCol: EGYPT.kohl, strokeW: 1.35, tremor: 0.45, fritCount: 6,
    });

    // Inner alabaster petals
    const innerPts = [
      toW(0, -size * 0.08),
      toW(-size * 0.44, -size * 0.88),
      toW(0, -size * 1.04),
      toW(size * 0.44, -size * 0.88),
    ];
    temperaPoly(ctx, innerPts, rng, {
      fillCol: EGYPT.alabaster, strokeCol: EGYPT.kohl, strokeW: 1.15, tremor: 0.4,
    });

    // Golden central stamen spike
    const goldPts = [
      toW(0, -size * 0.14),
      toW(-size * 0.17, -size * 0.84),
      toW(0, -size * 0.99),
      toW(size * 0.17, -size * 0.84),
    ];
    temperaPoly(ctx, goldPts, rng, {
      fillCol: EGYPT.gold, strokeCol: null, tremor: 0.35,
    });
  } else if (kind === 'papyrus') {
    const bellPts = [
      toW(-size * 0.18, 0),
      toW(-size * 0.32, -size * 0.58),
      toW(-size * 0.90, -size * 0.94),
      toW(-size * 0.38, -size * 1.08),
      toW(0, -size * 1.13),
      toW(size * 0.38, -size * 1.08),
      toW(size * 0.90, -size * 0.94),
      toW(size * 0.32, -size * 0.58),
      toW(size * 0.18, 0),
    ];
    temperaPoly(ctx, bellPts, rng, {
      fillCol: EGYPT.turquoise, strokeCol: EGYPT.kohl, strokeW: 1.35, tremor: 0.45, fritCount: 6,
    });

    for (let r = -2; r <= 2; r++) {
      rushStroke(ctx, [toW(r * size * 0.05, -size * 0.18), toW(r * size * 0.34, -size * 0.94)], rng, {
        color: EGYPT.goldBright, width: 1.05, tremor: 0.35,
      });
    }
    // Carnelian basal bracts
    temperaPoly(
      ctx,
      [toW(-size * 0.23, 0), toW(-size * 0.25, -size * 0.22), toW(size * 0.25, -size * 0.22), toW(size * 0.23, 0)],
      rng,
      { fillCol: EGYPT.carnelian, strokeCol: EGYPT.kohl, strokeW: 1.1, tremor: 0.35 }
    );
  } else {
    const budPts = [
      toW(0, 0),
      toW(-size * 0.22, -size * 0.42),
      toW(-size * 0.14, -size * 0.84),
      toW(0, -size * 0.98),
      toW(size * 0.14, -size * 0.84),
      toW(size * 0.22, -size * 0.42),
    ];
    temperaPoly(ctx, budPts, rng, {
      fillCol: EGYPT.carnelian, strokeCol: EGYPT.kohl, strokeW: 1.2, tremor: 0.4, fritCount: 3,
    });
  }
}

/**
 * Hand-Brushed Sacred Egyptian Hieroglyphs (100% rushStroke/temperaPoly, zero ctx.arc / fillRect!).
 * Includes archaic numeral glyphs: 8 = Lotus-1000 (𓆼), 9 = Rope-100x3 + II (c.1300 · #02).
 */
function drawRushHieroglyph(ctx, rng, gx, gy, size, glyphId) {
  const r = size * 0.5;
  const p = (lx, ly) => [gx + lx * r, gy + ly * r];

  switch (glyphId % 10) {
    case 0: {
      // Ankh (☥)
      const loop = rushRingPoints(gx, gy - r * 0.36, r * 0.30, r * 0.42, 10, rng);
      temperaPoly(ctx, loop.slice(0, -1), rng, {
        fillCol: null, strokeCol: EGYPT.gold, strokeW: 2.6, tremor: 0.4,
      });
      rushStroke(ctx, loop, rng, { color: EGYPT.kohl, width: 1.2, tremor: 0.4 });
      rushStroke(ctx, [p(-0.54, 0.08), p(0.54, 0.08)], rng, { color: EGYPT.kohl, width: 1.8, tremor: 0.4 });
      rushStroke(ctx, [p(0, 0.08), p(0, 0.86)], rng, { color: EGYPT.kohl, width: 2.0, tremor: 0.4 });
      break;
    }
    case 1: {
      // Wedjat Eye of Horus
      rushStroke(ctx, [p(-0.82, -0.34), p(0, -0.68), p(0.82, -0.30)], rng, {
        color: EGYPT.lapis, width: 1.9, tremor: 0.4,
      });
      temperaPoly(
        ctx,
        [p(-0.72, 0), p(0, -0.38), p(0.74, 0), p(0, 0.34)],
        rng,
        { fillCol: EGYPT.alabaster, strokeCol: EGYPT.kohl, strokeW: 1.35, tremor: 0.35 }
      );
      const pupil = rushRingPoints(gx, gy - r * 0.02, r * 0.18, r * 0.18, 8, rng);
      temperaPoly(ctx, pupil.slice(0, -1), rng, { fillCol: EGYPT.kohl, strokeCol: null });
      rushStroke(ctx, [p(0, 0.22), p(0, 0.70)], rng, { color: EGYPT.kohl, width: 1.4, tremor: 0.35 });
      rushStroke(ctx, [p(0.14, 0.20), p(0.46, 0.56), p(0.28, 0.76)], rng, { color: EGYPT.kohl, width: 1.4, tremor: 0.35 });
      break;
    }
    case 2: {
      // Sacred Pelican Determinative Glyph (Henu-bird!)
      temperaPoly(
        ctx,
        [p(-0.52, 0.12), p(-0.22, -0.18), p(0.24, -0.10), p(0.18, 0.28), p(-0.28, 0.28)],
        rng,
        { fillCol: EGYPT.carnelian, strokeCol: EGYPT.kohl, strokeW: 1.35, tremor: 0.35 }
      );
      rushStroke(ctx, [p(0.18, -0.08), p(0.26, -0.58), p(0.84, -0.46), p(0.32, -0.26)], rng, {
        color: EGYPT.kohl, width: 1.45, tremor: 0.35,
      });
      rushStroke(ctx, [p(-0.14, 0.28), p(-0.20, 0.78)], rng, { color: EGYPT.kohl, width: 1.4, tremor: 0.35 });
      rushStroke(ctx, [p(0.08, 0.28), p(0.14, 0.78)], rng, { color: EGYPT.kohl, width: 1.4, tremor: 0.35 });
      break;
    }
    case 3: {
      // Triple Nile Water Zigzag (n-sign)
      for (let row = -1; row <= 1; row++) {
        const wy = row * 0.42;
        const wPts = [];
        for (let k = -3; k <= 3; k++) {
          wPts.push(p((k / 3) * 0.80, wy + (k % 2 === 0 ? -0.13 : 0.13)));
        }
        rushStroke(ctx, wPts, rng, { color: EGYPT.lapis, width: 1.6, tremor: 0.35 });
      }
      break;
    }
    case 4: {
      // Djed Pillar of Stability
      temperaPoly(ctx, [p(-0.22, 0.80), p(-0.15, -0.66), p(0.15, -0.66), p(0.22, 0.80)], rng, {
        fillCol: EGYPT.turquoise, strokeCol: EGYPT.kohl, strokeW: 1.3, tremor: 0.35,
      });
      for (let b = 0; b < 4; b++) {
        const by = -0.66 + b * 0.22;
        rushStroke(ctx, [p(-0.42, by), p(0.42, by)], rng, {
          color: b % 2 === 0 ? EGYPT.carnelian : EGYPT.kohl, width: 2.0, tremor: 0.35,
        });
      }
      break;
    }
    case 5: {
      // Solar Ra Disc
      const sun = rushRingPoints(gx, gy, r * 0.55, r * 0.55, 12, rng);
      temperaPoly(ctx, sun.slice(0, -1), rng, {
        fillCol: EGYPT.carnelian, strokeCol: EGYPT.kohl, strokeW: 1.5, tremor: 0.4,
      });
      const dot = rushRingPoints(gx, gy, r * 0.16, r * 0.16, 7, rng);
      temperaPoly(ctx, dot.slice(0, -1), rng, { fillCol: EGYPT.goldBright, strokeCol: null });
      break;
    }
    case 6: {
      // Feather of Ma'at
      temperaPoly(
        ctx,
        [p(-0.18, 0.62), p(-0.34, -0.18), p(0.18, -0.74), p(0.32, -0.05), p(0.02, 0.62)],
        rng,
        { fillCol: EGYPT.turquoise, strokeCol: EGYPT.kohl, strokeW: 1.35, tremor: 0.35 }
      );
      rushStroke(ctx, [p(-0.08, 0.82), p(0.12, -0.56)], rng, { color: EGYPT.kohl, width: 1.35, tremor: 0.35 });
      break;
    }
    case 7: {
      // 6-Spoked Chariot Wheel Determinative Glyph
      const rim = rushRingPoints(gx, gy, r * 0.62, r * 0.62, 14, rng);
      rushStroke(ctx, rim, rng, { color: EGYPT.carnelian, width: 2.0, tremor: 0.4 });
      for (let sp = 0; sp < 3; sp++) {
        const a = (sp * Math.PI) / 3;
        rushStroke(ctx, [p(-Math.cos(a) * 0.58, -Math.sin(a) * 0.58), p(Math.cos(a) * 0.58, Math.sin(a) * 0.58)], rng, {
          color: EGYPT.kohl, width: 1.25, tremor: 0.3,
        });
      }
      break;
    }
    case 8: {
      // Egyptian Numeral 1000 (Lotus Plant Glyph 𓆼 — encodes "1000" of c.1300 BCE!)
      temperaPoly(ctx, [p(0, -0.20), p(-0.42, -0.76), p(0, -0.86), p(0.42, -0.76)], rng, {
        fillCol: EGYPT.turquoise, strokeCol: EGYPT.kohl, strokeW: 1.3, tremor: 0.35,
      });
      rushStroke(ctx, [p(0, -0.20), p(0, 0.68)], rng, { color: EGYPT.kohl, width: 1.6, tremor: 0.35 });
      temperaPoly(ctx, [p(-0.46, 0.68), p(0, 0.42), p(0.46, 0.68)], rng, {
        fillCol: EGYPT.gold, strokeCol: EGYPT.kohl, strokeW: 1.25, tremor: 0.35,
      });
      break;
    }
    default: {
      // Egyptian Numeral 300 + Panel II (Three Coiled-Rope 100s 𓍢𓍢𓍢 + Dual Strokes || -> "300 · #02"!)
      for (let c = -1; c <= 1; c++) {
        const sx = c * 0.48;
        rushStroke(
          ctx,
          [p(sx, -0.22), p(sx + 0.16, -0.42), p(sx - 0.12, -0.58), p(sx - 0.18, -0.18), p(sx + 0.16, 0.05)],
          rng,
          { color: EGYPT.carnelian, width: 1.45, tremor: 0.3 }
        );
      }
      // Dual upright tally strokes for Scene #02
      rushStroke(ctx, [p(-0.22, 0.28), p(-0.22, 0.80)], rng, { color: EGYPT.kohl, width: 2.1, tremor: 0.3 });
      rushStroke(ctx, [p(0.22, 0.28), p(0.22, 0.80)], rng, { color: EGYPT.kohl, width: 2.1, tremor: 0.3 });
      break;
    }
  }
}

/**
 * Hand-Brushed Archaic Stele / Seal-Script Inscription 「鹈 鹕 测 试」 inside the Royal Cartouche!
 * 100% Juncus rush-pen stroke paths — ZERO computer fillText(), satisfying Director #85 Critique #2!
 */
function drawCalligraphicCartoucheTitle(ctx, rng, centerX, centerY) {
  // Draws a single archaic seal/stele character inside a [-12..12, -14..14] cell using Juncus reed strokes
  const strokeGlyph = (gx, gy, scale, strokeList, accentList = []) => {
    const mapPts = (arr) => arr.map(([lx, ly]) => [gx + lx * scale, gy + ly * scale]);
    for (const sPts of strokeList) {
      rushStroke(ctx, mapPts(sPts), rng, {
        color: EGYPT.kohl,
        width: 2.15 * scale,
        tremor: 0.42,
        alpha: 0.94,
        subStep: 5,
      });
    }
    for (const aPts of accentList) {
      rushStroke(ctx, mapPts(aPts), rng, {
        color: EGYPT.carnelian,
        width: 1.75 * scale,
        tremor: 0.38,
        alpha: 0.88,
        subStep: 5,
      });
    }
  };

  const y = centerY;
  const sc = 0.96;

  // 1. 「鹈」 (Left: archaic '弟' horned-bow coil; Right: '鸟' sacred crested bird profile!)
  strokeGlyph(
    centerX - 66,
    y,
    sc,
    [
      // Left radical '弟'
      [[-10, -13], [-6, -9]],
      [[ -2, -13], [-5, -9]],
      [[-11, -8], [-2, -8], [-2, -3], [-10, -3], [-10, 3], [-1, 3], [-2, 11], [-5, 9]],
      [[-6, -8], [-6, 14]],
      // Right radical '鸟' (archaic bronze-script bird!)
      [[5, -14], [2, -10], [2, 3], [11, 3], [10, 12], [6, 10]],
      [[2, -10], [10, -10], [9, -3], [2, -3]],
      [[2, -1], [9, -1]],
    ],
    [
      [[-11, 11], [-8, 6]],
      [[0, 7], [8, 7]], // carnelian eye/feather bar
      [[5, -7], [6, -7]],
    ]
  );

  // 2. 「鹕」 (Left: '胡' = 古 + 月; Right: '鸟' sacred bird radical)
  strokeGlyph(
    centerX - 22,
    y,
    sc,
    [
      // '古' (top-left)
      [[-12, -8], [-5, -8]],
      [[-8.5, -13], [-8.5, -3]],
      [[-11, -3], [-6, -3], [-6, 3], [-11, 3], [-11, -3]],
      // '月' (mid-left)
      [[-4, -11], [-4, 12]],
      [[-4, -11], [0, -11], [0, 12], [-2, 10]],
      [[-4, -4], [0, -4]],
      [[-4, 2], [0, 2]],
      // '鸟' (right)
      [[6, -14], [3, -10], [3, 3], [12, 3], [11, 12], [7, 10]],
      [[3, -10], [11, -10], [10, -3], [3, -3]],
      [[3, -1], [10, -1]],
    ],
    [
      [[2, 7], [9, 7]],
      [[6, -7], [7, -7]],
    ]
  );

  // 3. 「测」 (Left: archaic 3-water-ripples '氵'; Mid: cowrie-vessel '贝'; Right: carved reed-knife '刂')
  strokeGlyph(
    centerX + 22,
    y,
    sc,
    [
      // '贝' (mid archaic cowrie/amphora frame)
      [[-4, -11], [4, -11], [4, 4], [-4, 4], [-4, -11]],
      [[-4, -6], [4, -6]],
      [[-4, -1], [4, -1]],
      [[-2, 5], [-6, 12]],
      [[2, 5], [5, 12]],
      // '刂' (right standing reed-blade)
      [[8, -9], [8, 6]],
      [[11.5, -13], [11.5, 12], [8.5, 10]],
    ],
    [
      // '氵' painted as three Egyptian carnelian/lapis water drops & wave!
      [[-11, -10], [-8, -7]],
      [[-12, -2], [-8.5, 1]],
      [[-11.5, 11], [-7.5, 4]],
    ]
  );

  // 4. 「试」 (Left: archaic speech-reed '讠'; Right: chariot-craftsman carpenter square '式'!)
  strokeGlyph(
    centerX + 66,
    y,
    sc,
    [
      // '讠'
      [[-10, -12], [-7, -9]],
      [[-12, -5], [-7, -5], [-7, 9], [-4, 5]],
      // '式' (archaic ceremonial halberd '弋' + cubit-rule '工')
      [[-4, -4], [11, -4]],
      [[-3, 2], [3, 2]],
      [[0, 2], [0, 9]],
      [[-4, 10], [4, 8]],
      [[5, -14], [6, 1], [9, 10], [12, 12], [11, 6]],
    ],
    [
      [[9, -12], [11.5, -9]], // carnelian royal seal dot on halberd!
    ]
  );
}

/**
 * Bakes:
 * 1) `wall`: 3-stratum Theban tomb plaster substrate + full-bleed Lotus ceiling frieze + Register Baselines (x=0..330, 670..1000)
 *    + Hand-brushed Royal Cartouche ("鹈鹕测试") + Canonical y=680 Road Band + Hand-brushed Nile Marsh Predella;
 * 2) `spallOverlay`: Cross-layer 3,300-year plaster flaking (revealing chaff-mud Mouna & chiseled limestone) + craquelure!
 */
let _cachedEgyptAssets = null;
function getEgyptTombAssets(kit) {
  if (_cachedEgyptAssets) return _cachedEgyptAssets;

  const wall = kit.bake2D('s02_egypt_wall_r3', (_g, ctx, rng) => {
    // -------------------------------------------------------------------------
    // 1. Three-Stratum Intonaco Gypsum Plaster Relief Substrate (ImageData ~10ms)
    // -------------------------------------------------------------------------
    const G = 200;
    const macroPlaster = new Float32Array(G * G);
    for (let gy = 0; gy < G; gy++) {
      const wy = (gy / (G - 1)) * PANEL_SIZE;
      for (let gx = 0; gx < G; gx++) {
        const wx = (gx / (G - 1)) * PANEL_SIZE;
        // Horizontal wooden-float plaster trowel sweeps + limestone wall undulation
        const trowel = Math.sin(wy * 0.055 + vNoise2D(wx * 0.012, wy * 0.015, 307) * 3.4) * 0.14;
        const cloud = vNoise2D(wx * 0.016, wy * 0.016, 619) * 0.52 + vNoise2D(wx * 0.048, wy * 0.048, 883) * 0.28;
        macroPlaster[gy * G + gx] = clamp(0.22 + cloud + trowel, 0, 1);
      }
    }

    const sampleP = (px, py) => {
      const fx = clamp((px / PANEL_SIZE) * (G - 1), 0, G - 1.001);
      const fy = clamp((py / PANEL_SIZE) * (G - 1), 0, G - 1.001);
      const ix = fx | 0;
      const iy = fy | 0;
      const ux = fx - ix;
      const uy = fy - iy;
      const i00 = iy * G + ix;
      const v0 = macroPlaster[i00] + (macroPlaster[i00 + 1] - macroPlaster[i00]) * ux;
      const v1 = macroPlaster[i00 + G] + (macroPlaster[i00 + G + 1] - macroPlaster[i00 + G]) * ux;
      return v0 + (v1 - v0) * uy;
    };

    const imgData = ctx.createImageData(PANEL_SIZE, PANEL_SIZE);
    const data = imgData.data;

    for (let y = 0; y < PANEL_SIZE; y++) {
      const rowOff = y * PANEL_SIZE;
      // Central Naos Shrine prepared lime-gesso wash (feathered brush bounds, zero smooth radial glow!)
      const gessoY = smoothstep(255, 305, y) * (1 - smoothstep(665, 682, y));
      for (let x = 0; x < PANEL_SIZE; x++) {
        const idx = rowOff + x;
        const ph = sampleP(x, y);
        const sand = hash2e(x, y, 5101);
        const fine = hash2e(x >> 1, y >> 1, 7307);

        let r = lerp(214, 243, ph) + (sand - 0.5) * 12;
        let g = lerp(187, 224, ph) + (sand - 0.5) * 10;
        let b = lerp(136, 184, ph) + (sand - 0.5) * 9;

        // Prepared thin white gypsum wash inside central Naos portal (x = 332..668)
        const gessoX = smoothstep(326, 355 + (fine - 0.5) * 18, x) * (1 - smoothstep(645 + (fine - 0.5) * 18, 674, x));
        const gesso = gessoX * gessoY * 0.42;
        if (gesso > 0.01) {
          r = lerp(r, 249, gesso);
          g = lerp(g, 239, gesso);
          b = lerp(b, 214, gesso);
        }

        // Subtle age-darkened tomb corner patina
        const edgeDist = Math.min(x, PANEL_SIZE - x, y, PANEL_SIZE - y);
        const cornerPatina = clamp(1 - edgeDist / 95, 0, 1) * 0.12;
        r *= 1 - cornerPatina;
        g *= 1 - cornerPatina * 1.05;
        b *= 1 - cornerPatina * 1.15;

        const pIdx = idx << 2;
        data[pIdx] = clamp(r, 0, 255) | 0;
        data[pIdx + 1] = clamp(g, 0, 255) | 0;
        data[pIdx + 2] = clamp(b, 0, 255) | 0;
        data[pIdx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // -------------------------------------------------------------------------
    // 2. Hand-Snapped Vermilion Chalk-String Canon Grid (28px squares, y = 148..680)
    //    + Hand-Brushed Hieratic Cubit Tally Marks (ZERO computer fillText!)
    // -------------------------------------------------------------------------
    const gridStep = 28;
    const gridTop = ROAD_EDGE_Y - 19 * gridStep; // 148
    ctx.save();
    for (let gy = gridTop; gy <= ROAD_EDGE_Y; gy += gridStep) {
      const rowIdx = Math.round((ROAD_EDGE_Y - gy) / gridStep);
      const isMajor = rowIdx === 6 || rowIdx === 12 || rowIdx === 18;
      for (let sx = 0; sx < PANEL_SIZE; sx += 18) {
        const focus = 0.44 + 0.56 * Math.exp(-Math.pow((sx - 500) / 350, 2));
        const alpha = (isMajor ? 0.38 : 0.24) * focus * (0.62 + rng() * 0.65);
        ctx.strokeStyle = `rgba(192, 60, 32, ${alpha.toFixed(3)})`;
        ctx.lineWidth = isMajor ? 1.45 : 1.0;
        ctx.beginPath();
        ctx.moveTo(sx, gy + (rng() - 0.5) * 0.7);
        ctx.lineTo(sx + 18, gy + (rng() - 0.5) * 0.7);
        ctx.stroke();

        if (rng() < 0.36) {
          ctx.fillStyle = `rgba(192, 60, 32, ${(alpha * 0.82).toFixed(3)})`;
          ctx.fillRect(sx + rng() * 18, gy + (rng() - 0.5) * 3.8, 1.3, 1.3);
        }
      }
    }

    for (let gx = 4; gx <= PANEL_SIZE; gx += gridStep) {
      const isAxis = Math.abs(gx - 508) < 10;
      const focus = 0.42 + 0.58 * Math.exp(-Math.pow((gx - 500) / 350, 2));
      for (let sy = gridTop; sy < ROAD_EDGE_Y; sy += 18) {
        const alpha = (isAxis ? 0.42 : 0.23) * focus * (0.62 + rng() * 0.65);
        ctx.strokeStyle = `rgba(192, 60, 32, ${alpha.toFixed(3)})`;
        ctx.lineWidth = isAxis ? 1.5 : 1.0;
        ctx.beginPath();
        ctx.moveTo(gx + (rng() - 0.5) * 0.7, sy);
        ctx.lineTo(gx + (rng() - 0.5) * 0.7, sy + 18);
        ctx.stroke();
      }
    }

    // Hand-brushed Egyptian Hieratic Cubit Tally Marks along x = 508 (replaces Roman font numerals!)
    // Egyptian 10 = inverted heel-arch '∩', 1 = upright stroke '|'
    for (const [sq, tens, ones] of [[6, 0, 3], [9, 0, 4], [12, 1, 2], [15, 1, 5]]) {
      const my = ROAD_EDGE_Y - sq * gridStep;
      rushStroke(ctx, [[503, my], [513, my]], rng, { color: EGYPT.vermilionGrid, width: 1.7, tremor: 0.3, alpha: 0.62 });
      let tx = 517;
      if (tens > 0) {
        // Egyptian '10' heel-bone arch ∩
        rushStroke(ctx, [[tx, my + 3], [tx + 1, my - 4], [tx + 5, my - 4], [tx + 6, my + 3]], rng, {
          color: EGYPT.vermilionGrid, width: 1.3, tremor: 0.25, alpha: 0.58,
        });
        tx += 9;
      }
      for (let u = 0; u < Math.min(ones, 5); u++) {
        rushStroke(ctx, [[tx + u * 2.8, my - 3.5], [tx + u * 2.8, my + 3]], rng, {
          color: EGYPT.vermilionGrid, width: 1.2, tremor: 0.25, alpha: 0.58,
        });
      }
    }
    ctx.restore();

    // -------------------------------------------------------------------------
    // 3. Uninterrupted Full-Width Upper Ceiling Lotus & Papyrus Frieze (x = 0..1000, y = 0..146!)
    //    (100% liberated from the removed top-left modern UI box!)
    // -------------------------------------------------------------------------
    drawTemperaBlockBand(ctx, rng, 0, 0, PANEL_SIZE, 20, 25);
    temperaPoly(
      ctx,
      [[0, 20], [PANEL_SIZE, 20], [PANEL_SIZE, 130], [0, 130]],
      rng,
      { fillCol: 'rgba(225, 201, 150, 0.58)', strokeCol: null, misregX: 0, misregY: 0 }
    );

    for (let fx = 24; fx <= PANEL_SIZE - 20; fx += 44) {
      if (fx + 44 <= PANEL_SIZE - 12) {
        rushStroke(ctx, [[fx, 30], [fx + 22, 19], [fx + 44, 30]], rng, {
          color: EGYPT.gold, width: 1.9, tremor: 0.45,
        });
      }
      const kind = Math.round((fx - 24) / 44) % 2 === 0 ? 'lotus' : 'papyrus';
      drawRushLotusOrPapyrus(ctx, rng, fx, 30, 34, kind, -1);
      if (fx + 22 <= PANEL_SIZE - 14) {
        drawRushLotusOrPapyrus(ctx, rng, fx + 22, 30, 22, 'bud', -1);
      }
    }
    drawTemperaBlockBand(ctx, rng, 0, 130, PANEL_SIZE, 16, 22);

    // -------------------------------------------------------------------------
    // 4. Authentic Full-Bleed Tomb Register Baselines (x = 0..330 & x = 670..1000 at y = 442)
    //    + Framed Central Naos Shrine Portal Jambs (ZERO floating IKEA shelf look! Director #85 #1)
    // -------------------------------------------------------------------------
    drawTemperaBlockBand(ctx, rng, 0, MID_REGISTER_Y, 330, 11, 20);
    drawTemperaBlockBand(ctx, rng, 670, MID_REGISTER_Y, 330, 11, 20);

    // Vertical polychrome Naos jamb borders framing the left & right registers cleanly from ceiling frieze (y=146) down to y=453
    drawVerticalTemperaJamb(ctx, rng, 320, 146, 11, MID_REGISTER_Y - 146 + 11, 20);
    drawVerticalTemperaJamb(ctx, rng, 669, 146, 11, MID_REGISTER_Y - 146 + 11, 20);

    //Lotus capital ornaments crowning the Naos portal jambs
    drawRushLotusOrPapyrus(ctx, rng, 325.5, 192, 22, 'papyrus', 1);
    drawRushLotusOrPapyrus(ctx, rng, 674.5, 192, 22, 'papyrus', 1);

    // -------------------------------------------------------------------------
    // 5. Flanking Vertical Hieroglyphic Columns (with Egyptian Numerals 1000+300 & II = c.1300 · #02!)
    // -------------------------------------------------------------------------
    const drawHieroglyphColumns = (xStart, colMatrix) => {
      const colW = 34;
      const colH = 108;
      const yStart = 156;
      const totalW = colMatrix.length * colW;
      temperaPoly(
        ctx,
        [[xStart, yStart], [xStart + totalW, yStart], [xStart + totalW, yStart + colH], [xStart, yStart + colH]],
        rng,
        { fillCol: 'rgba(248, 239, 214, 0.78)', strokeCol: EGYPT.lapis, strokeW: 1.8, tremor: 0.45, fritCount: 8 }
      );
      for (let c = 1; c < colMatrix.length; c++) {
        rushStroke(ctx, [[xStart + c * colW, yStart], [xStart + c * colW, yStart + colH]], rng, {
          color: EGYPT.lapis, width: 1.6, tremor: 0.4,
        });
      }
      for (let c = 0; c < colMatrix.length; c++) {
        for (let row = 0; row < 3; row++) {
          drawRushHieroglyph(
            ctx,
            rng,
            xStart + c * colW + colW * 0.5,
            yStart + 19 + row * 34,
            20,
            colMatrix[c][row]
          );
        }
      }
    };
    // Left columns include glyphs 8 (Lotus 1000) & 9 (300 + II) encoding Era #02 · c.1300 BCE natively!
    drawHieroglyphColumns(18, [[8, 9, 2], [5, 1, 0], [6, 3, 4]]);
    drawHieroglyphColumns(878, [[5, 2, 7], [1, 4, 6], [8, 9, 0]]);

    // -------------------------------------------------------------------------
    // 6. Monumental Hand-Brushed Royal Shen-Ring Cartouche (x = 346..654, y = 166..258)
    //    ZERO roundRect! ZERO fillText! Pure Juncus rush-pen calligraphy 「鹈鹕测试」!
    // -------------------------------------------------------------------------
    const buildCartoucheLoop = (cx, cy, w, h, inset = 0) => {
      const rx = (h * 0.5) - inset;
      const straightHalf = (w * 0.5) - inset - rx;
      const pts = [];
      for (let k = 0; k <= 10; k++) {
        const a = Math.PI * 0.5 + (k / 10) * Math.PI;
        pts.push([cx - straightHalf + Math.cos(a) * rx, cy + Math.sin(a) * rx]);
      }
      for (let k = 0; k <= 10; k++) {
        const a = -Math.PI * 0.5 + (k / 10) * Math.PI;
        pts.push([cx + straightHalf + Math.cos(a) * rx, cy + Math.sin(a) * rx]);
      }
      return pts;
    };

    const cartCX = 496;
    const cartCY = 212;
    const cartW = 286;
    const cartH = 88;

    // Outer braided gold Shen rope ring
    const outerShen = buildCartoucheLoop(cartCX, cartCY, cartW, cartH, 0);
    temperaPoly(ctx, outerShen, rng, {
      fillCol: EGYPT.gold, strokeCol: EGYPT.kohl, strokeW: 2.5, tremor: 0.5, fritCount: 14,
    });

    // Right vertical knotted Shen bar & polychrome flax lashing
    const shenX = cartCX + cartW * 0.5 + 3;
    temperaPoly(
      ctx,
      [[shenX, cartCY - 47], [shenX + 10, cartCY - 47], [shenX + 10, cartCY + 47], [shenX, cartCY + 47]],
      rng,
      { fillCol: EGYPT.gold, strokeCol: EGYPT.kohl, strokeW: 2.2, tremor: 0.45 }
    );
    for (const [ky, kCol] of [[-8, EGYPT.lapis], [0, EGYPT.carnelian], [8, EGYPT.turquoise]]) {
      temperaPoly(
        ctx,
        [[shenX - 7, cartCY + ky - 3], [shenX + 12, cartCY + ky - 3], [shenX + 12, cartCY + ky + 3], [shenX - 7, cartCY + ky + 3]],
        rng,
        { fillCol: kCol, strokeCol: EGYPT.kohl, strokeW: 1.1, tremor: 0.3 }
      );
    }

    // Inner alabaster gesso field
    const innerShen = buildCartoucheLoop(cartCX, cartCY, cartW, cartH, 8.5);
    temperaPoly(ctx, innerShen, rng, {
      fillCol: EGYPT.alabaster, strokeCol: EGYPT.lapis, strokeW: 1.8, tremor: 0.45, fritCount: 10,
    });

    // Sacred determinative hieroglyphs flanking the hand-brushed royal name
    drawRushHieroglyph(ctx, rng, cartCX - 108, cartCY - 14, 20, 5); // Solar Ra
    drawRushHieroglyph(ctx, rng, cartCX - 108, cartCY + 15, 21, 2); // Sacred Pelican
    rushStroke(ctx, [[cartCX - 86, cartCY - 27], [cartCX - 86, cartCY + 27]], rng, {
      color: EGYPT.vermilionGrid, width: 1.35, tremor: 0.35, alpha: 0.58,
    });

    // Hand-brushed Juncus reed calligraphy 「鹈 鹕 测 试」 + subtle decorative wave underline!
    drawCalligraphicCartoucheTitle(ctx, rng, cartCX + 2, cartCY - 3);
    const subWave = [];
    for (let wx = cartCX - 72; wx <= cartCX + 76; wx += 8) {
      subWave.push([wx, cartCY + 22 + (((wx - cartCX) / 8) % 2 === 0 ? -1.8 : 1.8)]);
    }
    rushStroke(ctx, subWave, rng, { color: EGYPT.lapis, width: 1.3, tremor: 0.3, alpha: 0.72 });

    rushStroke(ctx, [[cartCX + 88, cartCY - 27], [cartCX + 88, cartCY + 27]], rng, {
      color: EGYPT.vermilionGrid, width: 1.35, tremor: 0.35, alpha: 0.58,
    });
    drawRushHieroglyph(ctx, rng, cartCX + 108, cartCY - 14, 19, 7); // Chariot Wheel
    drawRushHieroglyph(ctx, rng, cartCX + 108, cartCY + 15, 19, 0); // Ankh

    // -------------------------------------------------------------------------
    // 7. Static Tomb Offerings on Side Register Baselines (y = 442) & Background Marsh Bouquets
    // -------------------------------------------------------------------------
    // Left Offering Table (x = 278, y = 442)
    temperaPoly(
      ctx,
      [[269, MID_REGISTER_Y], [274, MID_REGISTER_Y - 36], [282, MID_REGISTER_Y - 36], [287, MID_REGISTER_Y]],
      rng,
      { fillCol: EGYPT.alabaster, strokeCol: EGYPT.kohl, strokeW: 1.6, tremor: 0.4 }
    );
    temperaPoly(
      ctx,
      [[250, MID_REGISTER_Y - 42], [306, MID_REGISTER_Y - 42], [304, MID_REGISTER_Y - 36], [252, MID_REGISTER_Y - 36]],
      rng,
      { fillCol: EGYPT.gold, strokeCol: EGYPT.kohl, strokeW: 1.5, tremor: 0.4 }
    );
    for (const [lx, ly, col] of [
      [262, -49, EGYPT.goldBright], [276, -51, EGYPT.terracotta], [290, -49, EGYPT.goldBright],
      [269, -60, EGYPT.carnelian], [283, -60, EGYPT.turquoise],
    ]) {
      const loaf = rushRingPoints(lx, MID_REGISTER_Y + ly, 6.2, 5.8, 9, rng);
      temperaPoly(ctx, loaf.slice(0, -1), rng, { fillCol: col, strokeCol: EGYPT.kohl, strokeW: 1.25, tremor: 0.35 });
    }
    rushStroke(ctx, [[260, MID_REGISTER_Y - 62], [278, MID_REGISTER_Y - 78], [294, MID_REGISTER_Y - 69]], rng, {
      color: EGYPT.malachite, width: 1.9, tremor: 0.4,
    });
    drawRushLotusOrPapyrus(ctx, rng, 297, MID_REGISTER_Y - 67, 15, 'lotus', 1);

    // Right Twin Garlanded Wine Amphorae (x = 716, y = 442) + Tall Golden Incense Stand (x = 768, y = 442)
    rushStroke(ctx, [[693, MID_REGISTER_Y], [698, MID_REGISTER_Y - 26], [734, MID_REGISTER_Y - 26], [739, MID_REGISTER_Y]], rng, {
      color: EGYPT.bronzeDark, width: 2.3, tremor: 0.4,
    });
    for (const jx of [706, 726]) {
      temperaPoly(
        ctx,
        [
          [jx, MID_REGISTER_Y - 5],
          [jx - 8, MID_REGISTER_Y - 30],
          [jx - 5, MID_REGISTER_Y - 52],
          [jx - 7, MID_REGISTER_Y - 61],
          [jx + 7, MID_REGISTER_Y - 61],
          [jx + 5, MID_REGISTER_Y - 52],
          [jx + 8, MID_REGISTER_Y - 30],
        ],
        rng,
        { fillCol: EGYPT.terracotta, strokeCol: EGYPT.kohl, strokeW: 1.45, tremor: 0.4 }
      );
      temperaPoly(
        ctx,
        [[jx - 6.5, MID_REGISTER_Y - 49], [jx + 6.5, MID_REGISTER_Y - 49], [jx + 6.5, MID_REGISTER_Y - 43], [jx - 6.5, MID_REGISTER_Y - 43]],
        rng,
        { fillCol: EGYPT.turquoise, strokeCol: EGYPT.kohl, strokeW: 1.0, tremor: 0.3 }
      );
      temperaPoly(
        ctx,
        [[jx - 5.5, MID_REGISTER_Y - 61], [jx, MID_REGISTER_Y - 73], [jx + 5.5, MID_REGISTER_Y - 61]],
        rng,
        { fillCol: EGYPT.gold, strokeCol: EGYPT.kohl, strokeW: 1.25, tremor: 0.35 }
      );
    }

    // Tall gilded incense burner stand at x = 768, y = 442
    temperaPoly(
      ctx,
      [[762, MID_REGISTER_Y], [765, MID_REGISTER_Y - 54], [771, MID_REGISTER_Y - 54], [774, MID_REGISTER_Y]],
      rng,
      { fillCol: EGYPT.gold, strokeCol: EGYPT.kohl, strokeW: 1.45, tremor: 0.4 }
    );
    temperaPoly(
      ctx,
      [[757, MID_REGISTER_Y - 54], [779, MID_REGISTER_Y - 54], [775, MID_REGISTER_Y - 63], [761, MID_REGISTER_Y - 63]],
      rng,
      { fillCol: EGYPT.carnelian, strokeCol: EGYPT.kohl, strokeW: 1.35, tremor: 0.35 }
    );

    // Subtle recessed marsh papyrus & blue-lotus wall bouquets in lower hall (y = 615..680)
    for (const bx of [112, 236, 764, 888]) {
      ctx.save();
      ctx.globalAlpha = 0.36;
      for (let st = -1; st <= 1; st++) {
        rushStroke(
          ctx,
          [[bx + st * 4, ROAD_EDGE_Y], [bx + st * 12, ROAD_EDGE_Y - 36], [bx + st * 17, ROAD_EDGE_Y - 62 + Math.abs(st) * 10]],
          rng,
          { color: EGYPT.malachite, width: 2.1, tremor: 0.45 }
        );
      }
      drawRushLotusOrPapyrus(ctx, rng, bx, ROAD_EDGE_Y - 62, 17, 'lotus', 1);
      drawRushLotusOrPapyrus(ctx, rng, bx - 17, ROAD_EDGE_Y - 50, 13, 'papyrus', 1);
      drawRushLotusOrPapyrus(ctx, rng, bx + 17, ROAD_EDGE_Y - 50, 12, 'bud', 1);
      ctx.restore();
    }

    // -------------------------------------------------------------------------
    // 8. Canonical Road Register Band at y = 680 + Lower Lotus Predella + Hand-Brushed Nile Marsh!
    // -------------------------------------------------------------------------
    drawTemperaBlockBand(ctx, rng, 0, ROAD_EDGE_Y, PANEL_SIZE, 18, 25);

    temperaPoly(
      ctx,
      [[0, ROAD_EDGE_Y + 18], [PANEL_SIZE, ROAD_EDGE_Y + 18], [PANEL_SIZE, ROAD_EDGE_Y + 80], [0, ROAD_EDGE_Y + 80]],
      rng,
      { fillCol: 'rgba(220, 196, 145, 0.72)', strokeCol: null, misregX: 0, misregY: 0 }
    );
    for (let lx = 26; lx < PANEL_SIZE - 12; lx += 46) {
      const kind = Math.round(lx / 46) % 2 === 0 ? 'lotus' : 'papyrus';
      drawRushLotusOrPapyrus(ctx, rng, lx, ROAD_EDGE_Y + 76, 36, kind, 1);
      if (lx + 23 < PANEL_SIZE - 12) {
        drawRushLotusOrPapyrus(ctx, rng, lx + 23, ROAD_EDGE_Y + 76, 24, 'bud', 1);
      }
    }
    drawTemperaBlockBand(ctx, rng, 0, ROAD_EDGE_Y + 80, PANEL_SIZE, 12, 22);

    // Deep Egyptian-Blue Frit Nile Marsh Pool (y = 772..1000) with hand-brushed zigzag water strokes!
    const nileTop = ROAD_EDGE_Y + 92;
    temperaPoly(
      ctx,
      [[0, nileTop], [PANEL_SIZE, nileTop], [PANEL_SIZE, PANEL_SIZE], [0, PANEL_SIZE]],
      rng,
      {
        fillCol: EGYPT.lapisDeep,
        strokeCol: null,
        misregX: 0,
        misregY: 0,
        alpha: 0.98,
        fritCount: 950,
        fritLight: 'rgba(68, 152, 196, 0.28)',
        fritDark: 'rgba(7, 18, 30, 0.35)',
      }
    );

    // Hand-brushed Egyptian zigzag Nile ripples (broken into natural reed brushfuls with organic height jitter!)
    for (let wy = nileTop + 14; wy < PANEL_SIZE - 4; wy += 20) {
      let xCur = 0;
      while (xCur < PANEL_SIZE) {
        const span = 140 + ((rng() * 110) | 0);
        const wPts = [];
        for (let wx = xCur; wx <= Math.min(PANEL_SIZE, xCur + span); wx += 14) {
          const stepIdx = Math.round(wx / 14);
          const amp = 4.6 + (rng() - 0.5) * 1.8;
          const dy = (stepIdx % 2 === 0 ? -amp : amp) + Math.sin(wx * 0.015 + wy) * 1.2;
          wPts.push([wx, wy + dy]);
        }
        rushStroke(ctx, wPts, rng, {
          color: EGYPT.turquoiseLight,
          width: 1.85 + (rng() - 0.5) * 0.45,
          tremor: 0.55,
          alpha: 0.78 + rng() * 0.16,
        });
        xCur += span - 14;
      }
    }

    // Nebamun-style hand-painted Nile Bolti Tilapia Fish with scale texture
    const fishSpecs = [
      [165, nileTop + 54, 1, EGYPT.gold],
      [428, nileTop + 98, -1, EGYPT.turquoise],
      [682, nileTop + 52, 1, EGYPT.gold],
      [888, nileTop + 96, -1, EGYPT.turquoise],
    ];
    for (const [fx, fy, dir, fCol] of fishSpecs) {
      const fPt = (lx, ly) => [fx + lx * dir, fy + ly];
      temperaPoly(
        ctx,
        [fPt(-22, 0), fPt(-34, -11), fPt(-32, 0), fPt(-34, 11)],
        rng,
        { fillCol: EGYPT.carnelian, strokeCol: EGYPT.kohl, strokeW: 1.35, tremor: 0.35 }
      );
      temperaPoly(
        ctx,
        [fPt(-10, -10), fPt(9, -17), fPt(13, -9)],
        rng,
        { fillCol: EGYPT.carnelian, strokeCol: EGYPT.kohl, strokeW: 1.25, tremor: 0.35 }
      );
      temperaPoly(
        ctx,
        [fPt(-23, 0), fPt(-8, -13), fPt(11, -12), fPt(24, 0), fPt(10, 12), fPt(-9, 13)],
        rng,
        { fillCol: fCol, strokeCol: EGYPT.kohl, strokeW: 1.6, tremor: 0.4, fritCount: 6 }
      );
      // Hand-drawn imbricated fish scales
      for (let scX = -10; scX <= 8; scX += 6) {
        rushStroke(ctx, [fPt(scX, -6), fPt(scX - 3, 0), fPt(scX, 6)], rng, {
          color: EGYPT.kohl, width: 0.95, tremor: 0.25, alpha: 0.55,
        });
      }
      const eye = rushRingPoints(fx + 14 * dir, fy - 2, 3.0, 3.0, 8, rng);
      temperaPoly(ctx, eye.slice(0, -1), rng, { fillCol: EGYPT.alabaster, strokeCol: EGYPT.kohl, strokeW: 1.0 });
      ctx.fillStyle = EGYPT.kohl;
      ctx.fillRect(fx + 14 * dir - 1.2, fy - 3.2, 2.5, 2.5);
    }
  });

  // ---------------------------------------------------------------------------
  // Cross-Layer Tomb Plaster Spalling & Craquelure Overlay (`s02_egypt_spall_r3`):
  // Breaks cleanly across painted borders, mural figures, and Nile waves so paint never looks newly pasted!
  // ---------------------------------------------------------------------------
  const spallOverlay = kit.bake2D('s02_egypt_spall_r3', (_g, ctx, rng) => {
    const drawPlasterSpallPatch = (cx, cy, rx, ry, rot = 0) => {
      const segs = 16;
      const ca = Math.cos(rot);
      const sa = Math.sin(rot);
      const outer = [];
      const inner = [];
      for (let i = 0; i < segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        const jag = 0.68 + rng() * 0.56;
        const lx = Math.cos(a) * rx * jag;
        const ly = Math.sin(a) * ry * jag;
        outer.push([cx + lx * ca - ly * sa, cy + lx * sa + ly * ca]);
        inner.push([cx + lx * 0.80 * ca - ly * 0.80 * sa + 1.2, cy + lx * 0.80 * sa + ly * 0.80 * ca + 1.2]);
      }

      // 1. Plaster thickness drop-shadow & coarse chaff-mud Mouna rim!
      ctx.save();
      ctx.beginPath();
      outer.forEach(([px, py], idx) => (idx === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
      ctx.closePath();
      ctx.fillStyle = EGYPT.mounaMud;
      ctx.fill();
      ctx.strokeStyle = 'rgba(48, 32, 16, 0.52)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Tiny golden wheat-chaff impressions in exposed mud-plaster rim
      ctx.clip();
      ctx.strokeStyle = 'rgba(228, 198, 134, 0.55)';
      ctx.lineWidth = 0.9;
      for (let st = 0; st < 12; st++) {
        const sx = cx + (rng() - 0.5) * rx * 1.7;
        const sy = cy + (rng() - 0.5) * ry * 1.7;
        const sa2 = rng() * Math.PI;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + Math.cos(sa2) * 5.5, sy + Math.sin(sa2) * 5.5);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Recessed coarse chiseled Theban limestone core
      ctx.save();
      ctx.beginPath();
      inner.forEach(([px, py], idx) => (idx === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
      ctx.closePath();
      ctx.fillStyle = EGYPT.limestoneRaw;
      ctx.fill();
      ctx.clip();

      // Diagonal copper-adze stone-dressing chisel grooves!
      ctx.strokeStyle = 'rgba(116, 90, 52, 0.36)';
      ctx.lineWidth = 1.2;
      for (let d = -rx - ry; d <= rx + ry; d += 5.5) {
        ctx.beginPath();
        ctx.moveTo(cx + d - 20, cy - ry - 10);
        ctx.lineTo(cx + d + 20, cy + ry + 10);
        ctx.stroke();
      }
      ctx.restore();
    };

    // Authentic tomb plaster spalls along edges, frieze joints, and corners (carefully clear of hero center!)
    drawPlasterSpallPatch(16, 22, 34, 24, 0.2);
    drawPlasterSpallPatch(984, 34, 30, 26, -0.3);
    drawPlasterSpallPatch(568, 8, 26, 13, 0.1);
    drawPlasterSpallPatch(12, 512, 22, 38, 0.15);
    drawPlasterSpallPatch(988, 568, 20, 34, -0.15);
    drawPlasterSpallPatch(308, 446, 16, 9, 0.1);
    drawPlasterSpallPatch(788, 686, 22, 11, -0.08);
    drawPlasterSpallPatch(24, 978, 42, 26, 0.2);
    drawPlasterSpallPatch(974, 982, 38, 24, -0.2);

    // Branching 3,300-year tomb craquelure cracks & hairline fissures cutting across pigment & plaster
    for (let c = 0; c < 30; c++) {
      let cx = rng() * PANEL_SIZE;
      let cy = rng() * PANEL_SIZE;
      let ang = rng() * Math.PI * 2;
      const pts = [[cx, cy]];
      const segs = 5 + ((rng() * 6) | 0);
      for (let k = 0; k < segs; k++) {
        ang += (rng() - 0.5) * 0.72;
        const step = 14 + rng() * 26;
        cx += Math.cos(ang) * step;
        cy += Math.sin(ang) * step;
        pts.push([cx, cy]);
      }
      rushStroke(ctx, pts, rng, {
        color: cy > ROAD_EDGE_Y + 90 ? 'rgba(188, 166, 124, 0.24)' : 'rgba(74, 52, 28, 0.28)',
        width: 0.95 + rng() * 0.55,
        tremor: 0.45,
        alpha: 0.85,
      });
      // Secondary micro-branch
      if (pts.length > 3 && rng() < 0.6) {
        const [bx0, by0] = pts[2];
        const bAng = ang + (rng() > 0.5 ? 0.85 : -0.85);
        rushStroke(
          ctx,
          [[bx0, by0], [bx0 + Math.cos(bAng) * 18, by0 + Math.sin(bAng) * 18]],
          rng,
          { color: 'rgba(84, 60, 34, 0.22)', width: 0.75, tremor: 0.35 }
        );
      }
    }

    // Subtle micro-flaking pinholes & calcite efflorescence dust across painted wall
    for (let i = 0; i < 2400; i++) {
      const gx = rng() * PANEL_SIZE;
      const gy = rng() * PANEL_SIZE;
      const sz = 0.9 + rng() * 1.8;
      ctx.fillStyle =
        i % 3 === 0
          ? 'rgba(238, 224, 192, 0.24)'
          : i % 3 === 1
          ? 'rgba(142, 112, 68, 0.19)'
          : 'rgba(36, 78, 112, 0.12)';
      ctx.fillRect(gx, gy, sz, sz * 0.85);
    }
  });

  _cachedEgyptAssets = { wall, spallOverlay };
  return _cachedEgyptAssets;
}

/**
 * Helper: Builds an anatomical New Kingdom Egyptian human profile head polygon (cranial dome, brow, nose bridge, lips, chin — ZERO ctx.arc!).
 */
function buildEgyptianProfileHead(cx, cy, r) {
  return [
    [cx - r * 0.85, cy + r * 0.75], // nape
    [cx - r * 1.02, cy - r * 0.15], // occiput
    [cx - r * 0.72, cy - r * 0.92], // crown
    [cx + r * 0.28, cy - r * 0.95], // forehead
    [cx + r * 0.78, cy - r * 0.42], // brow
    [cx + r * 1.12, cy - r * 0.05], // aquiline Egyptian nose tip!
    [cx + r * 0.88, cy + r * 0.18], // philtrum / upper lip
    [cx + r * 0.92, cy + r * 0.38], // lower lip
    [cx + r * 0.68, cy + r * 0.72], // chin
    [cx + r * 0.15, cy + r * 0.86], // jaw/throat
  ];
}

/**
 * Draws the Dynamic Side-Register Tomb Figures on `y = 442` (`x = 0..330` & `x = 670..1000`):
 * 1. Left (`x = 78`): Fan-Bearing Attendant tilting ostrich-feather Flabellum & performing bent-arm salute!
 * 2. Left-Mid (`x = 186`): Seated Scribe with red/black reed palette — writes briskly in Bar 1, pauses & gazes up in awe in Bar 2!
 * 3. Right-Mid (`x = 768`): Curling Juncus dilute-ink frankincense smoke ribbon rising from golden incense stand!
 * 4. Right-Mid (`x = 828`): Temple Chantress shaking a golden Hathor Sistrum on the 120 BPM beat!
 * 5. Right (`x = 922`): Anubis-Headed Priest performing the formal Egyptian bent-arm adoration salute!
 */
function drawMidRegisterTombFigures(ctx, kit, localT, pelicanLocalX, poseBlend) {
  const s = 0.70;
  const saluteLeft = clamp(Math.max(poseBlend, smoothstep(70, 250, pelicanLocalX) * (1 - smoothstep(4.6, 5.5, localT))), 0, 1);
  const saluteRight = clamp(Math.max(poseBlend, smoothstep(420, 720, pelicanLocalX)), 0, 1);

  // -------------------------------------------------------------------------
  // 1. Left Fan-Bearer Attendant (x = 78, y = 442, facing +X)
  // -------------------------------------------------------------------------
  {
    const fRng = kit.makePRNG(6101);
    const wP = (lx, ly) => [78 + lx * s, MID_REGISTER_Y + ly * s];

    for (const [hipX, footX] of [[-10, -22], [6, 20]]) {
      temperaPoly(
        ctx,
        [wP(hipX - 6, -86), wP(footX - 5, 0), wP(footX + 16, 0), wP(footX + 4, -7), wP(hipX + 7, -86)],
        fRng,
        { fillCol: EGYPT.terracotta, strokeCol: EGYPT.kohl, strokeW: 1.65, tremor: 0.4 }
      );
    }

    // Pleated linen Shendyt kilt
    temperaPoly(
      ctx,
      [wP(-16, -120), wP(16, -120), wP(25, -68), wP(-22, -68)],
      fRng,
      { fillCol: EGYPT.alabaster, strokeCol: EGYPT.kohl, strokeW: 1.65, tremor: 0.4 }
    );
    for (let pl = -14; pl <= 16; pl += 6) {
      rushStroke(ctx, [wP(pl * 0.8, -118), wP(pl * 1.1, -69)], fRng, {
        color: EGYPT.ochreWash, width: 0.9, tremor: 0.25, alpha: 0.65,
      });
    }
    temperaPoly(
      ctx,
      [wP(-4, -120), wP(6, -120), wP(8, -68), wP(-5, -68)],
      fRng,
      { fillCol: EGYPT.gold, strokeCol: EGYPT.kohl, strokeW: 1.25, tremor: 0.35 }
    );

    // Frontal shoulders & collar
    temperaPoly(
      ctx,
      [wP(-14, -122), wP(-26, -176), wP(26, -176), wP(14, -122)],
      fRng,
      { fillCol: EGYPT.terracotta, strokeCol: EGYPT.kohl, strokeW: 1.65, tremor: 0.4 }
    );
    const colPts = [];
    for (let k = 0; k <= 8; k++) {
      const a = (k / 8) * Math.PI;
      colPts.push(wP(Math.cos(a) * 21, -176 + Math.sin(a) * 19));
    }
    temperaPoly(ctx, colPts, fRng, {
      fillCol: EGYPT.turquoise, strokeCol: EGYPT.kohl, strokeW: 1.35, tremor: 0.35, fritCount: 4,
    });

    // Anatomical profile head + layered echelon black wig (zero arc!)
    const headPts = buildEgyptianProfileHead(2, -196, 13.5).map(([hx, hy]) => wP(hx, hy));
    temperaPoly(ctx, headPts, fRng, {
      fillCol: EGYPT.terracotta, strokeCol: EGYPT.kohl, strokeW: 1.5, tremor: 0.35,
    });
    temperaPoly(
      ctx,
      [wP(-14, -176), wP(-17, -198), wP(-10, -212), wP(6, -212), wP(13, -203), wP(4, -200), wP(2, -182)],
      fRng,
      { fillCol: EGYPT.kohl, strokeCol: EGYPT.kohl, strokeW: 1.2, tremor: 0.35 }
    );
    rushStroke(ctx, [wP(-15, -203), wP(12, -203)], fRng, { color: EGYPT.gold, width: 2.0, tremor: 0.3 });

    // Bent-arm salute + fan-bearing arm
    rushStroke(ctx, [wP(-23, -172), wP(-12, -142), wP(lerp(4, 14, saluteLeft), lerp(-152, -168, saluteLeft))], fRng, {
      color: EGYPT.terracotta, width: 5.2, tremor: 0.4,
    });
    rushStroke(ctx, [wP(23, -172), wP(36, -154), wP(44, -178)], fRng, {
      color: EGYPT.terracotta, width: 5.2, tremor: 0.4,
    });

    // Ostrich-plume Flabellum Fan (hand-brushed plume fan, zero arc!)
    const fanTilt = 0.14 + saluteLeft * 0.22;
    const ca = Math.cos(fanTilt);
    const sa = Math.sin(fanTilt);
    const fW = (lx, ly) => wP(44 + lx * ca - ly * sa, -178 + lx * sa + ly * ca);
    rushStroke(ctx, [fW(-3, 22), fW(0, -98)], fRng, { color: EGYPT.gold, width: 3.1, tremor: 0.4 });

    const plumeOuter = [fW(-29, -102)];
    for (let k = 0; k <= 10; k++) {
      const a = Math.PI + (k / 10) * Math.PI;
      plumeOuter.push(fW(Math.cos(a) * 30, -102 + Math.sin(a) * 28));
    }
    temperaPoly(ctx, plumeOuter, fRng, {
      fillCol: EGYPT.alabaster, strokeCol: EGYPT.kohl, strokeW: 1.45, tremor: 0.4,
    });
    const plumeInner = [fW(-16, -102)];
    for (let k = 0; k <= 8; k++) {
      const a = Math.PI + (k / 8) * Math.PI;
      plumeInner.push(fW(Math.cos(a) * 16, -102 + Math.sin(a) * 16));
    }
    temperaPoly(ctx, plumeInner, fRng, {
      fillCol: EGYPT.gold, strokeCol: EGYPT.kohl, strokeW: 1.2, tremor: 0.35,
    });
    for (let b = 1; b < 9; b++) {
      const a = Math.PI + (b / 9) * Math.PI;
      rushStroke(ctx, [fW(Math.cos(a) * 16, -102 + Math.sin(a) * 16), fW(Math.cos(a) * 29, -102 + Math.sin(a) * 27)], fRng, {
        color: EGYPT.ochreWash, width: 0.9, tremor: 0.25,
      });
    }
  }

  // -------------------------------------------------------------------------
  // 2. Cross-Legged Seated Scribe (x = 186, y = 442 — pauses writing & looks up in Bar 2!)
  // -------------------------------------------------------------------------
  {
    const sRng = kit.makePRNG(6202);
    const awe = poseBlend;
    const wS = (lx, ly) => [186 + lx * s, MID_REGISTER_Y + ly * s];

    // Woven malachite reed mat + scribe's wooden two-ink palette on mat!
    temperaPoly(ctx, [wS(-40, -6), wS(42, -6), wS(42, 0), wS(-40, 0)], sRng, {
      fillCol: EGYPT.malachite, strokeCol: EGYPT.kohl, strokeW: 1.35, tremor: 0.35, fritCount: 4,
    });
    // Scribe's inkwell palette beside knee (black kohl cake + red ochre cake!)
    temperaPoly(ctx, [wS(26, -11), wS(44, -11), wS(44, -6), wS(26, -6)], sRng, {
      fillCol: EGYPT.gold, strokeCol: EGYPT.kohl, strokeW: 1.1, tremor: 0.3,
    });
    ctx.fillStyle = EGYPT.kohl;
    ctx.fillRect(186 + 29 * s, MID_REGISTER_Y - 10 * s, 3.2 * s, 2.5 * s);
    ctx.fillStyle = EGYPT.carnelian;
    ctx.fillRect(186 + 36 * s, MID_REGISTER_Y - 10 * s, 3.2 * s, 2.5 * s);

    // Stretched white linen lap-kilt
    temperaPoly(
      ctx,
      [wS(-26, -6), wS(-30, -28), wS(-12, -38), wS(28, -36), wS(34, -18), wS(24, -6)],
      sRng,
      { fillCol: EGYPT.alabaster, strokeCol: EGYPT.kohl, strokeW: 1.55, tremor: 0.4 }
    );

    // Torso (straightens attentively when beholding the Pelican Deity in Bar 2!)
    const lean = lerp(4, -3, awe);
    temperaPoly(
      ctx,
      [wS(-16, -38), wS(-22 + lean, -96), wS(18 + lean, -94), wS(12, -38)],
      sRng,
      { fillCol: EGYPT.terracotta, strokeCol: EGYPT.kohl, strokeW: 1.55, tremor: 0.4 }
    );

    // Head tilts upward in awe during Bar 2!
    const headTilt = -awe * 0.24;
    const hPivot = wS(3 + lean, -113);
    const caH = Math.cos(headTilt);
    const saH = Math.sin(headTilt);
    const sHeadPts = buildEgyptianProfileHead(0, 0, 12.8).map(([hx, hy]) => [
      hPivot[0] + (hx * caH - hy * saH) * s,
      hPivot[1] + (hx * saH + hy * caH) * s,
    ]);
    temperaPoly(ctx, sHeadPts, sRng, {
      fillCol: EGYPT.terracotta, strokeCol: EGYPT.kohl, strokeW: 1.45, tremor: 0.35,
    });
    temperaPoly(
      ctx,
      [wS(-10 + lean, -104), wS(-12 + lean, -120), wS(-2 + lean, -127), wS(12 + lean, -122), wS(4 + lean, -116)],
      sRng,
      { fillCol: EGYPT.kohl, strokeCol: EGYPT.kohl, strokeW: 1.1, tremor: 0.3 }
    );
    // Spare rush reed tucked behind ear
    rushStroke(ctx, [wS(-9 + lean, -112), wS(15 + lean, -129)], sRng, {
      color: EGYPT.goldBright, width: 1.6, tremor: 0.3,
    });

    // Unrolled papyrus scroll with curled end (drawn via rushPoly, zero arc!)
    temperaPoly(
      ctx,
      [wS(-6, -42), wS(37, -48), wS(43, -44), wS(41, -37), wS(35, -36), wS(-6, -35)],
      sRng,
      { fillCol: '#f7edd0', strokeCol: EGYPT.kohl, strokeW: 1.35, tremor: 0.35 }
    );

    // Writing hand briskly jotting notes in Bar 1, lifting reed brush in awe during Bar 2!
    const writeJot = (1 - awe) * Math.sin(localT * 11.5) * 4.0;
    const penLift = awe * 15;
    rushStroke(
      ctx,
      [wS(-15 + lean, -90), wS(-4, -56), wS(14 + writeJot, -48 - penLift)],
      sRng,
      { color: EGYPT.terracotta, width: 4.8, tremor: 0.35 }
    );
    rushStroke(ctx, [wS(14 + lean, -88), wS(24, -62), wS(32, -47)], sRng, {
      color: EGYPT.terracotta, width: 4.6, tremor: 0.35,
    });
    rushStroke(ctx, [wS(19 + writeJot, -64 - penLift), wS(11 + writeJot, -43 - penLift)], sRng, {
      color: EGYPT.carnelian, width: 1.8, tremor: 0.3,
    });
  }

  // -------------------------------------------------------------------------
  // 3. Curling Frankincense Smoke Ribbon from Incense Stand (x = 768, y = 442)
  // -------------------------------------------------------------------------
  {
    const smRng = kit.makePRNG(6299);
    const smokePts = [];
    for (let k = 0; k <= 10; k++) {
      const u = k / 10;
      const sway = Math.sin(u * 5.2 - localT * Math.PI * 2) * (2.5 + u * 7.5);
      smokePts.push([768 + sway, MID_REGISTER_Y - 65 * s - u * 72]);
    }
    rushStroke(ctx, smokePts, smRng, {
      color: 'rgba(112, 98, 78, 0.36)',
      width: 1.8,
      tremor: 0.45,
      alpha: 0.34 + poseBlend * 0.22,
    });
  }

  // -------------------------------------------------------------------------
  // 4. Temple Chantress Shaking Golden Hathor Sistrum (x = 830, y = 442, facing -X)
  // -------------------------------------------------------------------------
  {
    const cRng = kit.makePRNG(6303);
    const wC = (lx, ly) => [830 - lx * s, MID_REGISTER_Y + ly * s];

    // Slender ankles & sheer linen sheath dress
    temperaPoly(
      ctx,
      [wC(-12, -138), wC(12, -138), wC(15, -14), wC(-13, -14)],
      cRng,
      { fillCol: EGYPT.alabaster, strokeCol: EGYPT.kohl, strokeW: 1.5, tremor: 0.38 }
    );
    temperaPoly(ctx, [wC(-8, -14), wC(-12, 0), wC(-1, 0), wC(-3, -14)], cRng, {
      fillCol: EGYPT.ochreWash, strokeCol: EGYPT.kohl, strokeW: 1.35, tremor: 0.35,
    });
    temperaPoly(ctx, [wC(4, -14), wC(6, 0), wC(17, 0), wC(9, -14)], cRng, {
      fillCol: EGYPT.ochreWash, strokeCol: EGYPT.kohl, strokeW: 1.35, tremor: 0.35,
    });

    // Upper torso & turquoise bead collar
    temperaPoly(ctx, [wC(-11, -138), wC(-19, -174), wC(19, -174), wC(11, -138)], cRng, {
      fillCol: EGYPT.ochreWash, strokeCol: EGYPT.kohl, strokeW: 1.5, tremor: 0.38,
    });
    const cCol = [];
    for (let k = 0; k <= 8; k++) {
      const a = (k / 8) * Math.PI;
      cCol.push(wC(Math.cos(a) * 18, -174 + Math.sin(a) * 15));
    }
    temperaPoly(ctx, cCol, cRng, { fillCol: EGYPT.turquoise, strokeCol: EGYPT.kohl, strokeW: 1.2, tremor: 0.3 });

    // Profile head, braided long wig & blue lotus brow fillet
    const pHead = buildEgyptianProfileHead(2, -193, 12.2).map(([hx, hy]) => wC(hx, hy));
    temperaPoly(ctx, pHead, cRng, { fillCol: EGYPT.ochreWash, strokeCol: EGYPT.kohl, strokeW: 1.4, tremor: 0.35 });
    temperaPoly(
      ctx,
      [wC(-14, -162), wC(-17, -196), wC(-8, -209), wC(8, -208), wC(3, -196), wC(-4, -162)],
      cRng,
      { fillCol: EGYPT.kohl, strokeCol: EGYPT.kohl, strokeW: 1.1, tremor: 0.3 }
    );
    rushStroke(ctx, [wC(-13, -199), wC(11, -199)], cRng, { color: EGYPT.goldBright, width: 1.8, tremor: 0.3 });

    // Arm shaking Golden Sistrum on the 120 BPM beat!
    const shake = Math.sin(localT * Math.PI * 4) * 3.5;
    rushStroke(ctx, [wC(16, -170), wC(30, -156), wC(38 + shake, -182)], cRng, {
      color: EGYPT.ochreWash, width: 4.4, tremor: 0.35,
    });
    const sx = 38 + shake;
    rushStroke(ctx, [wC(sx, -176), wC(sx, -198)], cRng, { color: EGYPT.gold, width: 2.6, tremor: 0.3 });
    const sisLoop = rushRingPoints(830 - sx * s, MID_REGISTER_Y - 208 * s, 6.5 * s, 9 * s, 10, cRng);
    rushStroke(ctx, sisLoop, cRng, { color: EGYPT.goldBright, width: 2.0, tremor: 0.3 });
    rushStroke(ctx, [wC(sx - 9, -208), wC(sx + 9, -208)], cRng, { color: EGYPT.kohl, width: 1.1, tremor: 0.25 });
  }

  // -------------------------------------------------------------------------
  // 5. Right Anubis-Headed Priest (x = 922, y = 442, facing -X, Bent-Arm Adoration Salute!)
  // -------------------------------------------------------------------------
  {
    const aRng = kit.makePRNG(6404);
    const wA = (lx, ly) => [922 - lx * s, MID_REGISTER_Y + ly * s];

    rushStroke(ctx, [wA(-14, -112), wA(-26, -68), wA(-23, -18)], aRng, {
      color: EGYPT.kohl, width: 2.6, tremor: 0.4,
    });

    for (const [hipX, footX] of [[-10, -22], [6, 22]]) {
      temperaPoly(
        ctx,
        [wA(hipX - 6, -88), wA(footX - 5, 0), wA(footX + 16, 0), wA(footX + 4, -7), wA(hipX + 7, -88)],
        aRng,
        { fillCol: EGYPT.terracotta, strokeCol: EGYPT.kohl, strokeW: 1.65, tremor: 0.4 }
      );
    }

    temperaPoly(
      ctx,
      [wA(-16, -124), wA(16, -124), wA(26, -70), wA(-22, -70)],
      aRng,
      { fillCol: EGYPT.alabaster, strokeCol: EGYPT.kohl, strokeW: 1.65, tremor: 0.4 }
    );
    temperaPoly(
      ctx,
      [wA(-5, -124), wA(7, -124), wA(13, -68), wA(-8, -68)],
      aRng,
      { fillCol: EGYPT.gold, strokeCol: EGYPT.kohl, strokeW: 1.4, tremor: 0.35 }
    );

    temperaPoly(
      ctx,
      [wA(-14, -124), wA(-27, -180), wA(27, -180), wA(14, -124)],
      aRng,
      { fillCol: EGYPT.terracotta, strokeCol: EGYPT.kohl, strokeW: 1.65, tremor: 0.4 }
    );

    const aCol = [];
    for (let k = 0; k <= 8; k++) {
      const a = (k / 8) * Math.PI;
      aCol.push(wA(Math.cos(a) * 23, -180 + Math.sin(a) * 20));
    }
    temperaPoly(ctx, aCol, aRng, { fillCol: EGYPT.lapis, strokeCol: EGYPT.kohl, strokeW: 1.35, tremor: 0.35, fritCount: 4 });

    // Striped Lapis & Gold Nemes Lappet Wig (polygon, zero roundRect!)
    temperaPoly(
      ctx,
      [wA(-18, -214), wA(8, -214), wA(10, -170), wA(-18, -170)],
      aRng,
      { fillCol: EGYPT.lapis, strokeCol: EGYPT.kohl, strokeW: 1.45, tremor: 0.35 }
    );
    for (let st = 0; st < 5; st++) {
      rushStroke(ctx, [wA(-17, -208 + st * 8), wA(8, -208 + st * 8)], aRng, {
        color: EGYPT.gold, width: 2.1, tremor: 0.3,
      });
    }

    // Obsidian Jackal Head & Tall Alert Ears
    temperaPoly(
      ctx,
      [wA(-8, -196), wA(-6, -216), wA(10, -215), wA(35, -206), wA(34, -198), wA(12, -194)],
      aRng,
      { fillCol: EGYPT.kohl, strokeCol: EGYPT.kohl, strokeW: 1.2, tremor: 0.35 }
    );
    temperaPoly(ctx, [wA(-5, -213), wA(-9, -242), wA(1, -214)], aRng, {
      fillCol: EGYPT.kohl, strokeCol: EGYPT.gold, strokeW: 0.9, tremor: 0.3,
    });
    temperaPoly(ctx, [wA(2, -213), wA(1, -244), wA(9, -214)], aRng, {
      fillCol: EGYPT.kohl, strokeCol: EGYPT.gold, strokeW: 0.9, tremor: 0.3,
    });
    ctx.fillStyle = EGYPT.goldBright;
    ctx.fillRect(922 - 8 * s, MID_REGISTER_Y - 209 * s, 3.2 * s, 2.2 * s);

    // Formal Egyptian Bent-Arm Salute + Golden Was-Scepter
    rushStroke(
      ctx,
      [wA(-23, -175), wA(-12, -145), wA(lerp(5, 16, saluteRight), lerp(-156, -172, saluteRight))],
      aRng,
      { color: EGYPT.terracotta, width: 5.2, tremor: 0.4 }
    );
    rushStroke(
      ctx,
      [wA(22, -175), wA(35, -162), wA(44, lerp(-178, -198, saluteRight))],
      aRng,
      { color: EGYPT.terracotta, width: 5.2, tremor: 0.4 }
    );
    // Tall golden Was-scepter held in front hand
    rushStroke(ctx, [wA(44, 0), wA(44, -222), wA(51, -231)], aRng, {
      color: EGYPT.gold, width: 2.6, tremor: 0.4,
    });
  }
}

/**
 * Monumental Angular Horus / Ma'at Protective Wing with Staggered Blade-by-Blade Ceremonial Cascade!
 * - Each of the 12 polychrome feather blades unfolds sequentially from shoulder (u=0) to wingtip (u=1);
 * - Painted in 3 Nebamun/Tutankhamun mineral tempera tiers (Gold covert scales, Turquoise secondaries, Lapis primaries)
 *   using Juncus rush strokes & 1px tempera registration breath!
 */
function drawHorusProtectiveWing(ctx, rng, rootX, rootY, dirSign, unfold, s, rig, glintX) {
  const numBlades = 12;

  const spinePt = (u) => {
    const localUnfold = smoothstep(u * 0.34, 0.66 + u * 0.34, unfold);
    const foldX =
      dirSign > 0
        ? lerp(rootX, rig.handleGrip.x, u)
        : lerp(rootX, rig.tailTip.x - 8 * s, u);
    const foldY =
      dirSign > 0
        ? lerp(rootY, rig.handleGrip.y, u) + Math.sin(u * Math.PI) * 9 * s
        : lerp(rootY, rig.tailTip.y - 4 * s, u) + Math.sin(u * Math.PI) * 7 * s;

    const openX = rootX + dirSign * (u * 124 * s);
    const openY =
      rootY -
      Math.sin(Math.min(1, u * 1.45) * Math.PI * 0.5) * 23 * s +
      u * u * 15 * s;

    return [lerp(foldX, openX, localUnfold), lerp(foldY, openY, localUnfold), localUnfold];
  };

  // 1. Individual Staggered Deep-Lapis Primary Feather Blades (fan out blade-by-blade!)
  for (let i = 0; i < numBlades; i++) {
    const u0 = i / numBlades;
    const u1 = (i + 1) / numBlades;
    const [x0, y0, lu0] = spinePt(u0);
    const [x1, y1, lu1] = spinePt(u1);
    const bladeOpen = (lu0 + lu1) * 0.5;
    const chord = lerp(17, 55, bladeOpen) * s;

    const l0 = chord * (0.56 + 0.44 * Math.sin(u0 * Math.PI * 0.88));
    const l1 = chord * (0.56 + 0.44 * Math.sin(u1 * Math.PI * 0.88));
    const slant = dirSign * 4.5 * s * bladeOpen;

    const bladePoly = [
      [x0, y0],
      [x1, y1],
      [x1 + slant, y1 + l1],
      [(x0 + x1) * 0.5 + slant * 1.05, (y0 + y1) * 0.5 + (l0 + l1) * 0.5 + 2.2 * s],
      [x0 + slant * 0.85, y0 + l0],
    ];
    temperaPoly(ctx, bladePoly, rng, {
      fillCol: i % 2 === 0 ? EGYPT.lapis : EGYPT.lapisBright,
      strokeCol: EGYPT.kohl,
      strokeW: 1.35 * s,
      tremor: 0.4 * s,
      fritCount: 3,
      fritLight: 'rgba(84, 168, 218, 0.30)',
    });

    // Fine rush-pen feather rachis shaft
    rushStroke(
      ctx,
      [[(x0 + x1) * 0.5, (y0 + y1) * 0.5], [(x0 + x1) * 0.5 + slant, (y0 + y1) * 0.5 + (l0 + l1) * 0.48]],
      rng,
      { color: EGYPT.gold, width: 0.9 * s, tremor: 0.25 * s, alpha: 0.72 }
    );
  }

  // 2. Middle Turquoise Secondary Plumage Tier
  const midPoly = [];
  for (let i = 0; i <= numBlades; i++) {
    const [sx, sy] = spinePt(i / numBlades);
    midPoly.push([sx, sy]);
  }
  for (let i = numBlades; i >= 0; i--) {
    const u = i / numBlades;
    const [sx, sy, lu] = spinePt(u);
    const midLen = lerp(9, 28, lu) * s * (0.64 + 0.36 * Math.sin(u * Math.PI * 0.86));
    midPoly.push([sx + dirSign * 2.2 * s * lu, sy + midLen]);
  }
  temperaPoly(ctx, midPoly, rng, {
    fillCol: EGYPT.turquoise,
    strokeCol: EGYPT.kohl,
    strokeW: 1.45 * s,
    tremor: 0.4 * s,
    fritCount: 10,
    fritLight: 'rgba(136, 224, 218, 0.28)',
  });
  for (let i = 1; i < numBlades; i++) {
    const u = i / numBlades;
    const [sx, sy, lu] = spinePt(u);
    const midLen = lerp(9, 28, lu) * s * (0.64 + 0.36 * Math.sin(u * Math.PI * 0.86));
    rushStroke(ctx, [[sx, sy], [sx + dirSign * 2.2 * s * lu, sy + midLen]], rng, {
      color: EGYPT.kohl, width: 1.15 * s, tremor: 0.3 * s,
    });
  }

  // 3. Upper Hammered-Gold Wing-Bone & Imbricated Covert Scale Register (with tomb oil-lamp sheen!)
  const covPoly = [];
  for (let i = 0; i <= numBlades; i++) {
    const [sx, sy] = spinePt(i / numBlades);
    covPoly.push([sx, sy]);
  }
  for (let i = numBlades; i >= 0; i--) {
    const u = i / numBlades;
    const [sx, sy, lu] = spinePt(u);
    const covLen = lerp(5, 13.5, lu) * s * (1 - u * 0.32);
    covPoly.push([sx, sy + covLen]);
  }
  temperaPoly(ctx, covPoly, rng, {
    fillCol: EGYPT.goldBright,
    strokeCol: EGYPT.kohl,
    strokeW: 1.55 * s,
    tremor: 0.4 * s,
  });

  // Imbricated gold scale arcs & carnelian bead inlays + traveling gold-leaf lamp glint!
  for (let d = 1; d < numBlades; d++) {
    const u = d / numBlades;
    const [sx, sy, lu] = spinePt(u);
    const glint = Math.exp(-Math.pow((sx - glintX) / (28 * s), 2));
    if (glint > 0.22) {
      ctx.fillStyle = `rgba(255, 248, 196, ${(glint * 0.58).toFixed(2)})`;
      ctx.fillRect(sx - 4 * s, sy + 1 * s, 8 * s, 6 * s);
    }
    if (lu > 0.25 && d % 2 === 1) {
      ctx.fillStyle = EGYPT.carnelian;
      ctx.fillRect(sx - 1.6 * s, sy + 3.5 * s, 3.2 * s, 2.8 * s);
    }
  }
}

/**
 * Draws the Bespoke Ancient Egyptian Composite-Canon Pelican Deity &
 * 18th-Dynasty Tutankhamun Steam-Bent S-Pole Gilded Chariot-Bicycle!
 * - ZERO radial/linear gradients, ZERO roundRect, ZERO setLineDash, ZERO ctx.arc!
 */
function drawEgyptPelicanAndChariotBike(ctx, kit, rig, localT, poseBlend) {
  const s = rig.root.scale;
  const rng = kit.makePRNG(8021);
  // Warm traveling tomb sesame-oil lamp specular glint coordinate across hammered gold surfaces
  const glintPhase = (localT * 0.42) % 1;
  const glintX = rig.root.x + lerp(-125 * s, 125 * s, glintPhase);

  ctx.save();

  // Helper: 18th-Dynasty 6-Spoked V-Jointed Bentwood & Rawhide-Bound Pharaoh Chariot Wheel
  const drawTutankhamunChariotWheel = (w, seedOff) => {
    const wRng = kit.makePRNG(8400 + seedOff);
    const R = w.r;
    const ca0 = Math.cos(w.angle);
    const sa0 = Math.sin(w.angle);
    const toW = (lx, ly) => [w.x + lx * ca0 - ly * sa0, w.y + lx * sa0 + ly * ca0];

    // Delicate woven papyrus-pith backing lattice inside inner rim
    const numSpokes = 6;
    for (let i = 0; i < numSpokes; i++) {
      const a0 = (i * Math.PI * 2) / numSpokes;
      const a1 = ((i + 1) * Math.PI * 2) / numSpokes;
      const rMid = R * 0.54;
      rushStroke(
        ctx,
        [toW(Math.cos(a0) * rMid, Math.sin(a0) * rMid), toW(Math.cos(a1) * rMid, Math.sin(a1) * rMid)],
        wRng,
        { color: 'rgba(178, 138, 66, 0.62)', width: 1.5 * s, tremor: 0.35 * s }
      );
    }

    // 6 V-Jointed Steam-Bent Hardwood Spokes (authentic Tutankhamun V-nave joinery!) + Rawhide Felloe Sleeves
    for (let i = 0; i < numSpokes; i++) {
      const a = (i * Math.PI * 2) / numSpokes;
      const aNext = ((i + 1) * Math.PI * 2) / numSpokes;
      const aMid = (a + aNext) * 0.5;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const nx = -sa;
      const ny = ca;

      // Tapered gilded ash spoke
      const spokePoly = [
        toW(ca * 7 * s + nx * 3.8 * s, sa * 7 * s + ny * 3.8 * s),
        toW(ca * (R - 5.5 * s) + nx * 2.1 * s, sa * (R - 5.5 * s) + ny * 2.1 * s),
        toW(ca * (R - 5.5 * s) - nx * 2.1 * s, sa * (R - 5.5 * s) - ny * 2.1 * s),
        toW(ca * 7 * s - nx * 3.8 * s, sa * 7 * s - ny * 3.8 * s),
      ];
      temperaPoly(ctx, spokePoly, wRng, {
        fillCol: EGYPT.goldBright, strokeCol: EGYPT.kohl, strokeW: 1.45 * s, tremor: 0.35 * s,
      });

      // V-bent hardwood nave arch connecting adjacent spokes around hub!
      rushStroke(
        ctx,
        [
          toW(ca * 17 * s, sa * 17 * s),
          toW(Math.cos(aMid) * 10.5 * s, Math.sin(aMid) * 10.5 * s),
          toW(Math.cos(aNext) * 17 * s, Math.sin(aNext) * 17 * s),
        ],
        wRng,
        { color: EGYPT.bronzeDark, width: 1.8 * s, tremor: 0.3 * s }
      );

      // Green malachite / carnelian rawhide tenon sleeve at felloe junction
      temperaPoly(
        ctx,
        [
          toW(ca * (R - 12 * s) + nx * 2.8 * s, sa * (R - 12 * s) + ny * 2.8 * s),
          toW(ca * (R - 5 * s) + nx * 2.8 * s, sa * (R - 5 * s) + ny * 2.8 * s),
          toW(ca * (R - 5 * s) - nx * 2.8 * s, sa * (R - 5 * s) - ny * 2.8 * s),
          toW(ca * (R - 12 * s) - nx * 2.8 * s, sa * (R - 12 * s) - ny * 2.8 * s),
        ],
        wRng,
        { fillCol: i % 2 === 0 ? EGYPT.malachite : EGYPT.carnelian, strokeCol: EGYPT.kohl, strokeW: 1.1 * s }
      );
    }

    // Hand-drawn steam-bent wood felloe rim wrapped in rawhide & hammered gold sheet (ZERO ctx.arc!)
    const rimOuter = rushRingPoints(w.x, w.y, R - 1.5 * s, R - 1.5 * s, 24, wRng, w.angle, 0.022);
    const rimInner = rushRingPoints(w.x, w.y, R - 6.8 * s, R - 6.8 * s, 24, wRng, w.angle, 0.022);
    rushStroke(ctx, rimOuter, wRng, { color: EGYPT.kohl, width: 7.8 * s, tremor: 0.4 * s });
    rushStroke(ctx, rimOuter, wRng, { color: EGYPT.gold, width: 4.8 * s, tremor: 0.35 * s });
    rushStroke(ctx, rimInner, wRng, { color: EGYPT.kohl, width: 1.4 * s, tremor: 0.35 * s });

    // Rawhide tire lashing wraps around felloe
    for (let b = 0; b < 12; b++) {
      const ba = (b * Math.PI * 2) / 12;
      rushStroke(
        ctx,
        [toW(Math.cos(ba) * (R - 6.8 * s), Math.sin(ba) * (R - 6.8 * s)), toW(Math.cos(ba) * (R + 0.5 * s), Math.sin(ba) * (R + 0.5 * s))],
        wRng,
        { color: EGYPT.carnelian, width: 2.4 * s, tremor: 0.25 * s }
      );
    }

    // Bronze & Lapis Lotus Nave Hub
    const nave = rushRingPoints(w.x, w.y, 9.2 * s, 9.2 * s, 12, wRng);
    temperaPoly(ctx, nave.slice(0, -1), wRng, {
      fillCol: EGYPT.lapis, strokeCol: EGYPT.kohl, strokeW: 1.6 * s, tremor: 0.3 * s,
    });
    const linch = rushRingPoints(w.x, w.y, 4.6 * s, 4.6 * s, 8, wRng);
    temperaPoly(ctx, linch.slice(0, -1), wRng, { fillCol: EGYPT.goldBright, strokeCol: EGYPT.kohl, strokeW: 1.0 * s });
  };

  // Helper: Tapered Steam-Bent Gilded Wood Chariot Timber with Cloisonné Inlay Collars
  const drawGildedBentTimber = (pts, thick = 6.2, collarIdx = -1) => {
    rushStroke(ctx, pts, rng, { color: EGYPT.kohl, width: (thick + 3.0) * s, tremor: 0.45 * s });
    rushStroke(ctx, pts, rng, { color: EGYPT.gold, width: thick * s, tremor: 0.4 * s });
    rushStroke(
      ctx,
      pts.map(([px, py]) => [px, py - 1.0 * s]),
      rng,
      { color: EGYPT.goldHighlight, width: thick * 0.28 * s, tremor: 0.35 * s, alpha: 0.72 }
    );

    if (collarIdx >= 0 && collarIdx < pts.length - 1) {
      const [ax, ay] = pts[collarIdx];
      const [bx, by] = pts[collarIdx + 1];
      const mx = (ax + bx) * 0.5;
      const my = (ay + by) * 0.5;
      const dx = bx - ax;
      const dy = by - ay;
      const dl = Math.hypot(dx, dy) || 1;
      const ux = dx / dl;
      const uy = dy / dl;
      const nx = -uy;
      const ny = ux;
      const hw = thick * 0.56 * s;
      for (const [off, col] of [[-4.5 * s, EGYPT.lapis], [0, EGYPT.carnelian], [4.5 * s, EGYPT.turquoise]]) {
        const cx = mx + ux * off;
        const cy = my + uy * off;
        temperaPoly(
          ctx,
          [
            [cx - ux * 2 * s + nx * hw, cy - uy * 2 * s + ny * hw],
            [cx + ux * 2 * s + nx * hw, cy + uy * 2 * s + ny * hw],
            [cx + ux * 2 * s - nx * hw, cy + uy * 2 * s - ny * hw],
            [cx - ux * 2 * s - nx * hw, cy - uy * 2 * s - ny * hw],
          ],
          rng,
          { fillCol: col, strokeCol: EGYPT.kohl, strokeW: 0.95 * s, tremor: 0.2 * s }
        );
      }
    }
  };

  // Helper: Braided Two-Ply Flax Rope Drive (replaces CSS setLineDash chain!)
  const drawBraidedFlaxRope = (ax, ay, bx, by) => {
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const steps = Math.max(8, Math.floor(len / (4.8 * s)));
    const pA = [];
    const pB = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const wv = Math.sin(u * len * 0.45 - rig.rearWheel.angle * 3.0) * 1.6 * s;
      pA.push([ax + dx * u + nx * wv, ay + dy * u + ny * wv]);
      pB.push([ax + dx * u - nx * wv, ay + dy * u - ny * wv]);
    }
    rushStroke(ctx, pA, rng, { color: EGYPT.bronzeDark, width: 2.1 * s, tremor: 0.3 * s });
    rushStroke(ctx, pB, rng, { color: EGYPT.goldBright, width: 1.7 * s, tremor: 0.3 * s });
  };

  // Helper: Egyptian Composite-Canon Pelican Leg + Bronze Sandal-Pedal
  const drawEgyptPelicanLeg = (hipPt, kneePt, footPt, pedalPt, isFar) => {
    drawGildedBentTimber([[rig.bb.x, rig.bb.y], [pedalPt.x, pedalPt.y]], 3.6);

    const legCol = isFar ? '#a23d1b' : EGYPT.terracotta;
    // Tapered avian leg polygon with Juncus kohl outline
    const tdx = kneePt.x - hipPt.x;
    const tdy = kneePt.y - hipPt.y;
    const tl = Math.hypot(tdx, tdy) || 1;
    const tnx = (-tdy / tl) * 3.2 * s;
    const tny = (tdx / tl) * 3.2 * s;

    temperaPoly(
      ctx,
      [
        [hipPt.x - tnx, hipPt.y - tny],
        [kneePt.x - 2.3 * s, kneePt.y],
        [footPt.x - 1.8 * s, footPt.y],
        [footPt.x + 2.0 * s, footPt.y],
        [kneePt.x + 2.3 * s, kneePt.y],
        [hipPt.x + tnx, hipPt.y + tny],
      ],
      rng,
      { fillCol: legCol, strokeCol: EGYPT.kohl, strokeW: 1.8 * s, tremor: 0.35 * s }
    );

    // Golden anklet bangle
    const ankX = lerp(kneePt.x, footPt.x, 0.80);
    const ankY = lerp(kneePt.y, footPt.y, 0.80);
    temperaPoly(
      ctx,
      [[ankX - 3.6 * s, ankY - 2 * s], [ankX + 3.6 * s, ankY - 2 * s], [ankX + 3.6 * s, ankY + 2 * s], [ankX - 3.6 * s, ankY + 2 * s]],
      rng,
      { fillCol: EGYPT.goldBright, strokeCol: EGYPT.kohl, strokeW: 1.2 * s, tremor: 0.25 * s }
    );

    // Profile Egyptian webbed foot
    temperaPoly(
      ctx,
      [
        [footPt.x - 5 * s, footPt.y + 5 * s],
        [footPt.x - 3 * s, footPt.y - 1 * s],
        [footPt.x + 17 * s, footPt.y + 3 * s],
        [footPt.x + 17 * s, footPt.y + 6 * s],
      ],
      rng,
      { fillCol: legCol, strokeCol: EGYPT.kohl, strokeW: 1.6 * s, tremor: 0.35 * s }
    );

    // Bronze chariot stirrup-pedal block
    temperaPoly(
      ctx,
      [
        [pedalPt.x - 9.5 * s, pedalPt.y + 2 * s],
        [pedalPt.x + 9.5 * s, pedalPt.y + 2 * s],
        [pedalPt.x + 8.5 * s, pedalPt.y + 6.5 * s],
        [pedalPt.x - 8.5 * s, pedalPt.y + 6.5 * s],
      ],
      rng,
      { fillCol: EGYPT.gold, strokeCol: EGYPT.kohl, strokeW: 1.45 * s, tremor: 0.3 * s }
    );
  };

  // ---------------------------------------------------------------------------
  // 0. Bar-2 Draughtsman's Vermilion Canon Grid Node Crosses (replaces setLineDash box!)
  //    Highlights exact 28px Canon Grid intersections aligning Crown, Chest, Hip & Wheel Hubs!
  // ---------------------------------------------------------------------------
  if (poseBlend > 0.08) {
    const snap28 = (v, base) => base + Math.round((v - base) / 28) * 28;
    const gridNodes = [
      [snap28(rig.head.x, 4), snap28(rig.head.y - 28 * s, ROAD_EDGE_Y)],
      [snap28(rig.chest.x, 4), snap28(rig.chest.y, ROAD_EDGE_Y)],
      [snap28(rig.hip.x, 4), snap28(rig.hip.y, ROAD_EDGE_Y)],
      [snap28(rig.rearWheel.x, 4), snap28(rig.rearWheel.y, ROAD_EDGE_Y)],
      [snap28(rig.frontWheel.x, 4), snap28(rig.frontWheel.y, ROAD_EDGE_Y)],
    ];
    for (const [gx, gy] of gridNodes) {
      rushStroke(ctx, [[gx - 8 * s, gy], [gx + 8 * s, gy]], rng, {
        color: EGYPT.vermilionGrid, width: 1.7 * s, tremor: 0.3 * s, alpha: poseBlend * 0.72,
      });
      rushStroke(ctx, [[gx, gy - 8 * s], [gx, gy + 8 * s]], rng, {
        color: EGYPT.vermilionGrid, width: 1.7 * s, tremor: 0.3 * s, alpha: poseBlend * 0.72,
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 1. Far Horus Protective Wing (Cascades open FORWARD in Bar-2 Freeze!)
  // ---------------------------------------------------------------------------
  if (poseBlend > 0.02) {
    ctx.save();
    ctx.globalAlpha = smoothstep(0.02, 0.22, poseBlend);
    drawHorusProtectiveWing(ctx, rng, rig.chest.x + 8 * s, rig.chest.y - 4 * s, +1, poseBlend, s, rig, glintX);
    ctx.restore();
  }

  // ---------------------------------------------------------------------------
  // 2. Far Leg, Tutankhamun 6-Spoked Wheels, Flax Pulley & S-Pole Chariot Frame!
  // ---------------------------------------------------------------------------
  drawEgyptPelicanLeg(rig.leftHip, rig.leftKnee, rig.leftFoot, rig.leftPedal, true);
  drawTutankhamunChariotWheel(rig.rearWheel, 1);
  drawTutankhamunChariotWheel(rig.frontWheel, 2);

  // Braided flax-rope drive & 6-petalled bronze lotus crank pulley
  drawBraidedFlaxRope(rig.rearWheel.x, rig.rearWheel.y - 5.5 * s, rig.bb.x, rig.bb.y - 12.5 * s);
  drawBraidedFlaxRope(rig.rearWheel.x, rig.rearWheel.y + 5.5 * s, rig.bb.x, rig.bb.y + 12.5 * s);

  const pulleyRing = rushRingPoints(rig.bb.x, rig.bb.y, 12.8 * s, 12.8 * s, 14, rng);
  temperaPoly(ctx, pulleyRing.slice(0, -1), rng, {
    fillCol: EGYPT.gold, strokeCol: EGYPT.kohl, strokeW: 1.7 * s, tremor: 0.35 * s,
  });
  for (let p = 0; p < 6; p++) {
    const pa = (p * Math.PI) / 3 + rig.rearWheel.angle;
    rushStroke(
      ctx,
      [[rig.bb.x, rig.bb.y], [rig.bb.x + Math.cos(pa) * 10.5 * s, rig.bb.y + Math.sin(pa) * 10.5 * s]],
      rng,
      { color: p % 2 === 0 ? EGYPT.turquoise : EGYPT.carnelian, width: 2.2 * s, tremor: 0.25 * s }
    );
  }

  // Tutankhamun Steam-Bent S-Curved Main Chariot Pole (辕木 — replaces straight diamond bike tubes!)
  // Sweeps from rear axle hub -> dips under bronze lotus pulley -> curves gracefully up in an S-arch to front steering post!
  const chariotSPole = [
    [rig.rearWheel.x, rig.rearWheel.y],
    [lerp(rig.rearWheel.x, rig.bb.x, 0.55), rig.bb.y + 6 * s],
    [rig.bb.x, rig.bb.y + 2 * s],
    [lerp(rig.bb.x, rig.headBot.x, 0.48), lerp(rig.bb.y, rig.headBot.y, 0.48) + 8 * s],
    [lerp(rig.bb.x, rig.headTop.x, 0.80), lerp(rig.bb.y, rig.headTop.y, 0.80) - 4 * s],
    [rig.headTop.x, rig.headTop.y],
  ];
  drawGildedBentTimber(chariotSPole, 6.4, 3);

  // Openwork D-Shaped Pharaoh Chariot Cab Rail (镂空 D 形鎏金浮雕战车护栏框 — cradles saddle & braces rear axle!)
  const cabArch = [
    [rig.rearWheel.x, rig.rearWheel.y],
    [lerp(rig.rearWheel.x, rig.seatCluster.x, 0.52) - 9 * s, lerp(rig.rearWheel.y, rig.seatCluster.y, 0.52) - 8 * s],
    [rig.seatCluster.x - 4 * s, rig.seatCluster.y - 2 * s],
    [rig.seatCluster.x + 18 * s, rig.seatCluster.y - 3 * s],
    [lerp(rig.bb.x, rig.headTop.x, 0.46), lerp(rig.bb.y, rig.headTop.y, 0.46) - 6 * s],
    [rig.bb.x + 3 * s, rig.bb.y],
  ];
  // Semi-sheer embossed gold & turquoise openwork cab panel inside the D-rail!
  temperaPoly(
    ctx,
    [
      cabArch[2],
      cabArch[3],
      cabArch[4],
      [rig.bb.x, rig.bb.y - 4 * s],
      [lerp(rig.bb.x, rig.seatCluster.x, 0.5), lerp(rig.bb.y, rig.seatCluster.y, 0.5)],
    ],
    rng,
    { fillCol: 'rgba(220, 162, 38, 0.28)', strokeCol: EGYPT.gold, strokeW: 1.4 * s, tremor: 0.35 * s }
  );
  // Sacred Wedjat Eye emblem mounted inside the openwork chariot cab!
  drawRushHieroglyph(
    ctx,
    rng,
    lerp(rig.seatCluster.x, rig.bb.x, 0.32) + 12 * s,
    lerp(rig.seatCluster.y, rig.bb.y, 0.42) - 4 * s,
    18 * s,
    1
  );
  drawGildedBentTimber(cabArch, 5.2, 1);

  // Curved gilded front chariot yoke-fork + Papyrus capital & curved horn handlebar
  drawGildedBentTimber(
    [
      [rig.stemTop.x, rig.stemTop.y],
      [rig.headTop.x, rig.headTop.y],
      [lerp(rig.headBot.x, rig.frontWheel.x, 0.52) + 6 * s, lerp(rig.headBot.y, rig.frontWheel.y, 0.52) - 3 * s],
      [rig.frontWheel.x, rig.frontWheel.y],
    ],
    5.6,
    2
  );
  drawRushLotusOrPapyrus(ctx, rng, rig.stemTop.x + 2 * s, rig.stemTop.y + 8 * s, 15 * s, 'papyrus', 1);

  drawGildedBentTimber(
    [
      [rig.stemTop.x, rig.stemTop.y],
      [rig.stemTop.x - 4 * s, rig.stemTop.y - 8 * s],
      [rig.handleGrip.x, rig.handleGrip.y],
    ],
    4.6
  );

  // Woven rawhide & gilded leather chariot saddle (hand-brushed polygon, ZERO roundRect!)
  const saddlePoly = [
    [rig.saddle.x - 17 * s, rig.saddle.y - 3 * s],
    [rig.saddle.x + 14 * s, rig.saddle.y - 4 * s],
    [rig.saddle.x + 16 * s, rig.saddle.y + 4 * s],
    [rig.saddle.x - 14 * s, rig.saddle.y + 5 * s],
  ];
  temperaPoly(ctx, saddlePoly, rng, {
    fillCol: EGYPT.goldBright, strokeCol: EGYPT.kohl, strokeW: 1.8 * s, tremor: 0.35 * s,
  });
  for (let wv = -10; wv <= 10; wv += 5) {
    rushStroke(
      ctx,
      [[rig.saddle.x + wv * s, rig.saddle.y - 3 * s], [rig.saddle.x + (wv + 3) * s, rig.saddle.y + 4 * s]],
      rng,
      { color: EGYPT.carnelian, width: 1.0 * s, tremor: 0.2 * s }
    );
  }

  // ---------------------------------------------------------------------------
  // 3. Nebamun-Style Imbricated-Feather Pelican Torso, Striated Tail & Pleated Shendyt!
  // ---------------------------------------------------------------------------
  // Striated Lapis & Turquoise Tail Quills
  const tailPoly = [
    [rig.bodyCenter.x - 28 * s, rig.bodyCenter.y - 6 * s],
    [rig.tailTip.x - 12 * s, rig.tailTip.y - 9 * s],
    [rig.tailTip.x - 3 * s, rig.tailTip.y + 6 * s],
    [rig.bodyCenter.x - 25 * s, rig.bodyCenter.y + 12 * s],
  ];
  temperaPoly(ctx, tailPoly, rng, {
    fillCol: EGYPT.lapis, strokeCol: EGYPT.kohl, strokeW: 2.0 * s, tremor: 0.4 * s, fritCount: 6,
  });
  for (let tq = 0; tq < 3; tq++) {
    rushStroke(
      ctx,
      [[rig.bodyCenter.x - 26 * s, rig.bodyCenter.y - 2 * s + tq * 5 * s], [rig.tailTip.x - (10 - tq * 2) * s, rig.tailTip.y - (5 - tq * 4) * s]],
      rng,
      { color: EGYPT.turquoiseLight, width: 1.2 * s, tremor: 0.3 * s }
    );
  }

  // Sculpted Alabaster-Gypsum Avian Torso
  const torsoPoly = [
    [rig.tailTip.x + 2 * s, rig.tailTip.y - 2 * s],
    [rig.bodyCenter.x - 30 * s, rig.bodyCenter.y - 24 * s],
    [rig.bodyCenter.x - 4 * s, rig.bodyCenter.y - 24 * s],
    [rig.chest.x + 12 * s, rig.chest.y - 8 * s],
    [rig.chest.x + 17 * s, rig.chest.y + 9 * s],
    [rig.bodyCenter.x + 16 * s, rig.bodyCenter.y + 21 * s],
    [rig.hip.x - 14 * s, rig.hip.y + 14 * s],
    [rig.bodyCenter.x - 35 * s, rig.bodyCenter.y + 11 * s],
  ];
  temperaPoly(ctx, torsoPoly, rng, {
    fillCol: EGYPT.alabaster, strokeCol: EGYPT.kohl, strokeW: 2.3 * s, tremor: 0.45 * s,
  });

  // Nebamun-style imbricated (fish-scale) covert feather rows brushed in warm ochre bistre!
  for (let row = 0; row < 3; row++) {
    const ry = rig.bodyCenter.y - 13 * s + row * 8.5 * s;
    for (let col = -3; col <= 2; col++) {
      const rx = rig.bodyCenter.x + col * 9.5 * s + (row % 2) * 4.5 * s;
      rushStroke(
        ctx,
        [[rx - 4 * s, ry - 2 * s], [rx, ry + 3.2 * s], [rx + 4 * s, ry - 2 * s]],
        rng,
        { color: 'rgba(176, 128, 62, 0.58)', width: 1.15 * s, tremor: 0.25 * s }
      );
    }
  }

  // Royal Pleated Shendyt Hip Apron
  const kiltPoly = [
    [rig.hip.x - 13 * s, rig.hip.y - 8 * s],
    [rig.hip.x + 15 * s, rig.hip.y - 6 * s],
    [rig.hip.x + 11 * s, rig.hip.y + 13 * s],
    [rig.hip.x - 11 * s, rig.hip.y + 11 * s],
  ];
  temperaPoly(ctx, kiltPoly, rng, {
    fillCol: EGYPT.gold, strokeCol: EGYPT.kohl, strokeW: 1.55 * s, tremor: 0.35 * s,
  });
  for (let kp = -8; kp <= 10; kp += 4.5) {
    rushStroke(
      ctx,
      [[rig.hip.x + kp * s, rig.hip.y - 7 * s], [rig.hip.x + (kp - 1) * s, rig.hip.y + 11 * s]],
      rng,
      { color: EGYPT.carnelian, width: 0.95 * s, tremor: 0.2 * s, alpha: 0.72 }
    );
  }

  // Near Leg
  drawEgyptPelicanLeg(rig.rightHip, rig.rightKnee, rig.rightFoot, rig.rightPedal, false);

  // ---------------------------------------------------------------------------
  // 4. Near Horus Protective Wing (Grips handlebar when riding, cascades BACKWARD in Bar-2!)
  // ---------------------------------------------------------------------------
  if (poseBlend <= 0.48) {
    drawHorusProtectiveWing(ctx, rng, rig.wingShoulder.x, rig.wingShoulder.y, +1, poseBlend * 0.4, s, rig, glintX);
  } else {
    drawHorusProtectiveWing(
      ctx,
      rng,
      rig.chest.x - 8 * s,
      rig.chest.y - 4 * s,
      -1,
      smoothstep(0.40, 0.88, poseBlend),
      s,
      rig,
      glintX
    );
  }

  // Hieratic Columnar Neck drawn in Juncus brush before Frontal Usekh Collar
  const neckC1X = lerp(rig.neckC1.x, rig.chest.x + 10 * s, poseBlend * 0.65);
  const neckC2X = lerp(rig.neckC2.x, rig.head.x - 3 * s, poseBlend * 0.65);
  const neckPts = [];
  for (let k = 0; k <= 8; k++) {
    const u = k / 8;
    const iu = 1 - u;
    neckPts.push([
      iu * iu * iu * rig.chest.x + 3 * iu * iu * u * neckC1X + 3 * iu * u * u * neckC2X + u * u * u * rig.head.x,
      iu * iu * iu * (rig.chest.y + 3 * s) + 3 * iu * iu * u * rig.neckC1.y + 3 * iu * u * u * rig.neckC2.y + u * u * u * rig.head.y,
    ]);
  }
  rushStroke(ctx, neckPts, rng, { color: EGYPT.kohl, width: 22.5 * s, tremor: 0.45 * s });
  rushStroke(ctx, neckPts, rng, { color: EGYPT.alabaster, width: 17.5 * s, tremor: 0.4 * s });

  // ---------------------------------------------------------------------------
  // 5. Bead-by-Bead Frontal Unfolded Usekh Jewel Collar (逐粒穿珠乌瑟克宽领饰!)
  // ---------------------------------------------------------------------------
  const colX = rig.chest.x;
  const colY = rig.chest.y - 4 * s;
  const colRot = lerp(-0.12, 0.0, poseBlend);
  const caC = Math.cos(colRot);
  const saC = Math.sin(colRot);
  const toCol = (lx, ly) => [colX + lx * caC - ly * saC, colY + lx * saC + ly * caC];

  // Gold backing gorget polygon
  const gorgetPts = [];
  for (let k = 0; k <= 14; k++) {
    const a = -0.04 * Math.PI + (k / 14) * 1.08 * Math.PI;
    gorgetPts.push(toCol(Math.cos(a) * 33 * s, Math.sin(a) * 33 * s));
  }
  for (let k = 14; k >= 0; k--) {
    const a = -0.04 * Math.PI + (k / 14) * 1.08 * Math.PI;
    gorgetPts.push(toCol(Math.cos(a) * 10 * s, Math.sin(a) * 10 * s));
  }
  temperaPoly(ctx, gorgetPts, rng, {
    fillCol: EGYPT.goldBright, strokeCol: EGYPT.kohl, strokeW: 1.6 * s, tremor: 0.35 * s,
  });

  // 3 Concentric Garlands of Individually Painted Tubular Gem Beads (Lapis, Turquoise, Carnelian!)
  const beadTiers = [
    { rIn: 12.5 * s, rOut: 18.0 * s, count: 11, colA: EGYPT.carnelian, colB: EGYPT.goldBright },
    { rIn: 18.8 * s, rOut: 24.8 * s, count: 14, colA: EGYPT.turquoise, colB: EGYPT.lapis },
    { rIn: 25.6 * s, rOut: 31.8 * s, count: 17, colA: EGYPT.lapis, colB: EGYPT.goldBright },
  ];
  for (const tier of beadTiers) {
    for (let b = 0; b < tier.count; b++) {
      const a0 = (b / tier.count) * Math.PI + 0.03;
      const a1 = ((b + 0.84) / tier.count) * Math.PI;
      const beadPoly = [
        toCol(Math.cos(a0) * tier.rIn, Math.sin(a0) * tier.rIn),
        toCol(Math.cos(a1) * tier.rIn, Math.sin(a1) * tier.rIn),
        toCol(Math.cos(a1) * tier.rOut, Math.sin(a1) * tier.rOut),
        toCol(Math.cos(a0) * tier.rOut, Math.sin(a0) * tier.rOut),
      ];
      const [bx] = beadPoly[0];
      const glint = Math.exp(-Math.pow((bx - glintX) / (24 * s), 2));
      const bCol = b % 2 === 0 ? tier.colA : glint > 0.45 ? EGYPT.goldHighlight : tier.colB;
      temperaPoly(ctx, beadPoly, rng, {
        fillCol: bCol, strokeCol: EGYPT.kohl, strokeW: 1.0 * s, tremor: 0.2 * s, misregX: 0.4, misregY: 0.4,
      });
    }
  }

  // 11 Hanging Lotus-Seed Gold & Turquoise Drop Pendants (teardrop polygons, zero arc!)
  for (let p = 0; p <= 10; p++) {
    const pa = (p / 10) * Math.PI;
    const ux = Math.cos(pa);
    const uy = Math.sin(pa);
    const nx = -uy;
    const ny = ux;
    const dropPoly = [
      toCol(ux * 33 * s, uy * 33 * s),
      toCol(ux * 37.5 * s + nx * 2.5 * s, uy * 37.5 * s + ny * 2.5 * s),
      toCol(ux * 40.5 * s, uy * 40.5 * s),
      toCol(ux * 37.5 * s - nx * 2.5 * s, uy * 37.5 * s - ny * 2.5 * s),
    ];
    temperaPoly(ctx, dropPoly, rng, {
      fillCol: p % 2 === 0 ? EGYPT.goldBright : EGYPT.turquoiseLight,
      strokeCol: EGYPT.kohl,
      strokeW: 1.05 * s,
      tremor: 0.2 * s,
    });
  }

  // ---------------------------------------------------------------------------
  // 6. Horned Carnelian-and-Gold Solar Disc Crown (Hand-brushed tapered rays in Bar 2 — ZERO radial glow!)
  // ---------------------------------------------------------------------------
  const sunX = rig.head.x + 1 * s;
  const sunY = rig.head.y - 31 * s;

  if (poseBlend > 0.06) {
    // 12 Tapered Hand-Brushed Gold-Leaf Rays (authentic Amarna/Theban painted sunbeams!)
    for (let r = 0; r < 12; r++) {
      const ra = (r * Math.PI * 2) / 12 + localT * 0.22;
      const ca = Math.cos(ra);
      const sa = Math.sin(ra);
      const nx = -sa;
      const ny = ca;
      const rIn = 17 * s;
      const rOut = (30 + (r % 2) * 6) * s;
      temperaPoly(
        ctx,
        [
          [sunX + ca * rIn, sunY + sa * rIn],
          [sunX + ca * rOut + nx * 2.2 * s, sunY + sa * rOut + ny * 2.2 * s],
          [sunX + ca * rOut - nx * 2.2 * s, sunY + sa * rOut - ny * 2.2 * s],
        ],
        rng,
        { fillCol: EGYPT.goldBright, strokeCol: null, alpha: poseBlend * 0.78 }
      );
    }
  }

  // Sacred Hathor/Horus Golden Cow-Horns embracing the Solar Disc
  const hornCrown = [];
  for (let k = 0; k <= 10; k++) {
    const a = 0.10 * Math.PI + (k / 10) * 0.80 * Math.PI;
    hornCrown.push([sunX + Math.cos(a) * 19 * s, sunY + 3 * s - Math.sin(a) * 17 * s + 12 * s]);
  }
  rushStroke(ctx, hornCrown, rng, { color: EGYPT.kohl, width: 4.4 * s, tremor: 0.35 * s });
  rushStroke(ctx, hornCrown, rng, { color: EGYPT.goldBright, width: 2.6 * s, tremor: 0.3 * s });

  const sunPoly = rushRingPoints(sunX, sunY, 13.5 * s, 13.5 * s, 16, rng);
  temperaPoly(ctx, sunPoly.slice(0, -1), rng, {
    fillCol: EGYPT.carnelian, strokeCol: EGYPT.goldBright, strokeW: 3.0 * s, tremor: 0.35 * s, fritCount: 5,
  });
  rushStroke(ctx, sunPoly, rng, { color: EGYPT.kohl, width: 1.2 * s, tremor: 0.3 * s });

  // ---------------------------------------------------------------------------
  // 7. Anatomical Avian Profile Skull, Striped Nemes Lappet, Hooded Uraeus Cobra & Tempera Beak!
  // ---------------------------------------------------------------------------
  temperaPoly(
    ctx,
    [
      [rig.head.x - 4 * s, rig.head.y - 16 * s],
      [rig.head.x - 22 * s, rig.head.y - 13 * s],
      [rig.head.x - 25 * s, rig.head.y + 4 * s],
      [rig.head.x - 23 * s, rig.head.y + 18 * s],
      [rig.head.x - 8 * s, rig.head.y + 15 * s],
    ],
    rng,
    { fillCol: EGYPT.lapis, strokeCol: EGYPT.kohl, strokeW: 1.9 * s, tremor: 0.4 * s, fritCount: 4 }
  );
  for (let ns = 0; ns < 3; ns++) {
    const ny = rig.head.y - 6 * s + ns * 7 * s;
    rushStroke(ctx, [[rig.head.x - 22 * s, ny], [rig.head.x - 9 * s, ny]], rng, {
      color: EGYPT.goldBright, width: 2.0 * s, tremor: 0.3 * s,
    });
  }

  // Anatomical Avian-Ibis/Pelican Profile Head Polygon (ZERO ctx.arc circle!)
  const headR = rig.head.r * 1.06;
  const avianSkull = [
    [rig.head.x - headR * 0.92, rig.head.y + headR * 0.65],
    [rig.head.x - headR * 1.05, rig.head.y - headR * 0.20],
    [rig.head.x - headR * 0.68, rig.head.y - headR * 0.95],
    [rig.head.x + headR * 0.35, rig.head.y - headR * 0.98],
    [rig.head.x + headR * 0.96, rig.head.y - headR * 0.42],
    [rig.head.x + headR * 1.05, rig.head.y + headR * 0.25],
    [rig.head.x + headR * 0.62, rig.head.y + headR * 0.88],
  ];
  temperaPoly(ctx, avianSkull, rng, {
    fillCol: EGYPT.alabaster, strokeCol: EGYPT.kohl, strokeW: 2.2 * s, tremor: 0.4 * s,
  });

  // Golden Royal Diadem Band + Rearing Hooded Golden Uraeus Cobra at Brow!
  temperaPoly(
    ctx,
    [
      [rig.head.x - 15 * s, rig.head.y - 11 * s],
      [rig.head.x + 15 * s, rig.head.y - 11 * s],
      [rig.head.x + 15 * s, rig.head.y - 6 * s],
      [rig.head.x - 15 * s, rig.head.y - 6 * s],
    ],
    rng,
    { fillCol: EGYPT.goldBright, strokeCol: EGYPT.kohl, strokeW: 1.45 * s, tremor: 0.3 * s }
  );
  temperaPoly(
    ctx,
    [
      [rig.head.x + 12 * s, rig.head.y - 9 * s],
      [rig.head.x + 22 * s, rig.head.y - 14 * s],
      [rig.head.x + 21 * s, rig.head.y - 23 * s],
      [rig.head.x + 26 * s, rig.head.y - 24 * s],
      [rig.head.x + 16 * s, rig.head.y - 25 * s],
      [rig.head.x + 15 * s, rig.head.y - 16 * s],
      [rig.head.x + 9 * s, rig.head.y - 9 * s],
    ],
    rng,
    { fillCol: EGYPT.goldBright, strokeCol: EGYPT.kohl, strokeW: 1.55 * s, tremor: 0.3 * s }
  );

  // Matte Orpiment-Gold & Carnelian Feathered Gular Throat Pouch (ZERO createLinearGradient!)
  const beakTipX = lerp(rig.beakTip.x, rig.head.x + 82 * s, poseBlend);
  const beakTipY = lerp(rig.beakTip.y, rig.head.y + 3 * s, poseBlend);
  const pouchBellyX = lerp(rig.pouchBelly.x, rig.head.x + 41 * s, poseBlend);
  const pouchBellyY = lerp(rig.pouchBelly.y, rig.head.y + 38 * s, poseBlend);

  const pouchPoly = [
    [rig.beakLowerBase.x, rig.beakLowerBase.y],
    [lerp(rig.beakLowerBase.x, pouchBellyX, 0.48) - 2 * s, lerp(rig.beakLowerBase.y, pouchBellyY, 0.62)],
    [pouchBellyX, pouchBellyY * 0.55 + rig.beakLowerBase.y * 0.45 + 10 * s],
    [lerp(pouchBellyX, beakTipX, 0.55), lerp(pouchBellyY, beakTipY, 0.62) + 4 * s],
    [beakTipX - 3 * s, beakTipY + 2 * s],
    [rig.beakUpperBase.x, rig.beakUpperBase.y + 5 * s],
  ];
  temperaPoly(ctx, pouchPoly, rng, {
    fillCol: EGYPT.gold,
    strokeCol: null,
    misregX: 1.1 * s,
    misregY: 0.9 * s,
    fritCount: 8,
  });

  // Lower carnelian mineral wash + Juncus rush-pen pleat ribs inside pouch
  ctx.save();
  ctx.beginPath();
  pouchPoly.forEach(([px, py], idx) => (idx === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  ctx.closePath();
  ctx.clip();
  temperaPoly(
    ctx,
    [
      [rig.beakLowerBase.x - 4 * s, lerp(rig.beakLowerBase.y, pouchBellyY, 0.42)],
      [beakTipX, beakTipY],
      [pouchBellyX + 12 * s, pouchBellyY + 12 * s],
      [rig.beakLowerBase.x - 6 * s, pouchBellyY + 12 * s],
    ],
    rng,
    { fillCol: 'rgba(190, 59, 30, 0.52)', strokeCol: null, misregX: 0, misregY: 0 }
  );
  for (let pl = 1; pl <= 4; pl++) {
    const py = rig.beakLowerBase.y + pl * 6.2 * s;
    rushStroke(
      ctx,
      [[rig.beakLowerBase.x - 3 * s, py], [pouchBellyX, py + 5.5 * s], [beakTipX - 2 * s, beakTipY + 2 * s]],
      rng,
      { color: EGYPT.carnelianDeep, width: 1.25 * s, tremor: 0.3 * s, alpha: 0.68 }
    );
  }
  ctx.restore();
  rushStroke(ctx, [...pouchPoly, pouchPoly[0]], rng, { color: EGYPT.kohl, width: 2.2 * s, tremor: 0.4 * s });

  // Burnished Gold Upper Hooked Mandible (with lamp sheen!)
  const upperBeak = [
    [rig.beakUpperBase.x, rig.beakUpperBase.y - 1 * s],
    [beakTipX, beakTipY - 4 * s],
    [beakTipX + 6 * s, beakTipY + 2.5 * s],
    [beakTipX - 2 * s, beakTipY + 6 * s],
    [rig.beakLowerBase.x, rig.beakLowerBase.y + 1 * s],
  ];
  const beakGlint = Math.exp(-Math.pow(((rig.beakUpperBase.x + beakTipX) * 0.5 - glintX) / (36 * s), 2));
  temperaPoly(ctx, upperBeak, rng, {
    fillCol: beakGlint > 0.45 ? EGYPT.goldHighlight : EGYPT.goldBright,
    strokeCol: EGYPT.kohl,
    strokeW: 2.2 * s,
    tremor: 0.4 * s,
  });
  rushStroke(
    ctx,
    [[rig.beakLowerBase.x + 3 * s, rig.beakLowerBase.y - 1 * s], [beakTipX - 4 * s, beakTipY + 1.5 * s]],
    rng,
    { color: EGYPT.carnelian, width: 2.2 * s, tremor: 0.35 * s }
  );

  // ---------------------------------------------------------------------------
  // 8. Full-Frontal Lapis Lazuli Eye of Horus (Wedjat) Drawn with Juncus Reed Brush!
  // ---------------------------------------------------------------------------
  const ex = rig.head.x + 2.5 * s;
  const ey = rig.head.y - 0.5 * s;

  rushStroke(
    ctx,
    [[ex + 9 * s, ey - 3.6 * s], [ex, ey - 6.8 * s], [ex - 16 * s, ey - 3.2 * s]],
    rng,
    { color: EGYPT.lapisBright, width: 2.6 * s, tremor: 0.3 * s }
  );

  const eyeAlmond = [
    [ex - 8.2 * s, ey],
    [ex, ey - 4.2 * s],
    [ex + 8.0 * s, ey],
    [ex, ey + 4.0 * s],
  ];
  temperaPoly(ctx, eyeAlmond, rng, {
    fillCol: '#fbf7ec', strokeCol: EGYPT.lapis, strokeW: 2.2 * s, tremor: 0.25 * s, misregX: 0.3, misregY: 0.3,
  });

  // Lapis temple cosmetic line + falcon drop & Wedjat spiral!
  rushStroke(ctx, [[ex - 8.0 * s, ey], [ex - 18.5 * s, ey - 0.5 * s]], rng, {
    color: EGYPT.lapisBright, width: 2.4 * s, tremor: 0.25 * s,
  });
  rushStroke(ctx, [[ex - 0.5 * s, ey + 3.8 * s], [ex - 1.5 * s, ey + 11 * s]], rng, {
    color: EGYPT.lapisBright, width: 2.1 * s, tremor: 0.25 * s,
  });
  rushStroke(
    ctx,
    [[ex - 2.5 * s, ey + 3.8 * s], [ex - 9.5 * s, ey + 9.8 * s], [ex - 14 * s, ey + 8 * s]],
    rng,
    { color: EGYPT.lapisBright, width: 2.1 * s, tremor: 0.25 * s }
  );

  const pupilPoly = rushRingPoints(ex + 0.5 * s, ey, 2.5 * s, 2.5 * s, 8, rng);
  temperaPoly(ctx, pupilPoly.slice(0, -1), rng, { fillCol: EGYPT.kohl, strokeCol: null });

  ctx.restore();
}

/**
 * Draws the Lower-Register Naos Shrine Portal Flanking Inspectors on `y = 680` (`ROAD_EDGE_Y`):
 * Synchronized with `freeze_bar2` via `inspectEnv = smoothstep(1.65, 2.25, localT) * (1 - smoothstep(3.65, 4.25, localT))`:
 * - Left (`x = 286 -> 328`, facing `+X`): Royal Tomb Outline-Scribe / Fresco Artisan (*Sesh-Qedut*) steps & leans inward,
 *   raising a polychrome wooden scribal palette & *Juncus* rush-reed brush to dab final turquoise/gold pigment onto the
 *   slowed pelican's tail & rear plumage feathers;
 * - Right (`x = 716 -> 682`, facing `-X`): Chief Tomb *Sem*-Priest / Canon Overseer steps a half-stride inward in strict
 *   Egyptian profile canon, extending a graduated Golden Royal Cubit Measuring Rod (`皇家腕尺`) & Golden *Ankh* (`☥`)
 *   right up to the slowed pelican's beak tip (`~[604, 477]`) to verify its canonical proportions;
 * - Both snap crisply and deadpan back to formal Egyptian attention as the pelican accelerates out in Bar 3!
 */
function drawNaosShrineInspectors(ctx, kit, localT, pelicanLocalX, poseBlend, inspectEnv, rig, layer = 'body') {
  const sL = 0.85;
  const sR = 0.87;

  // Compute live beakTip & tail target when rig is present (defaults to canonical x=500 freeze coords)
  const beakTipX = rig ? lerp(rig.beakTip.x, rig.head.x + 82 * rig.root.scale, poseBlend) : 604;
  const beakTipY = rig ? lerp(rig.beakTip.y, rig.head.y + 3 * rig.root.scale, poseBlend) : 477;
  const tailTargetX = rig ? rig.tailTip.x - 10 * rig.root.scale : 406;
  const tailTargetY = rig ? rig.tailTip.y - 4 * rig.root.scale : 544;

  // Spatial gates complete inspection around pelicanLocalX ~ 502..536 so both inspectors snap back to
  // formal attention before the pelican's advancing Horus wing reaches x=682 or leaves the Scribe behind!
  const scribeReach =
    inspectEnv *
    (pelicanLocalX < 250 ? 0 : smoothstep(255, 345, pelicanLocalX)) *
    (1 - smoothstep(502, 538, pelicanLocalX));
  const priestReach = inspectEnv * (1 - smoothstep(498, 536, pelicanLocalX));

  // Separate foreground-tool gates so Scribe's brush overlaps rear plumage while Priest's arm never overlaps passing pelican!
  const scribeInFg = scribeReach > 0.45 && pelicanLocalX >= 425 && pelicanLocalX <= 538;
  const priestInFg = priestReach > 0.45 && pelicanLocalX >= 425 && pelicanLocalX <= 518;

  // =========================================================================
  // LEFT FLANKING ARTISAN: Royal Tomb Fresco Scribe & Painter (facing +X)
  // =========================================================================
  {
    const lRng = kit.makePRNG(6511);
    const stepIn = scribeReach;
    const baseX = lerp(284, 326, stepIn);
    const torsoLean = stepIn * 0.16; // leans attentively into Naos portal during Bar-2 freeze
    const caL = Math.cos(torsoLean);
    const saL = Math.sin(torsoLean);

    const wFoot = (lx, ly) => [baseX + lx * sL, ROAD_EDGE_Y + ly * sL];
    const wTorso = (lx, ly) => {
      // Pivot lean around hip (0, -92)
      const dy0 = ly + 92;
      const rx = lx * caL - dy0 * saL;
      const ry = lx * saL + dy0 * caL - 92;
      return [baseX + rx * sL, ROAD_EDGE_Y + ry * sL];
    };

    if (layer === 'body') {
      // 1. Strict Egyptian Profile Legs (snaps from narrow formal attention stride to wide half-stride inward!)
      const backFootX = lerp(-16, -34, stepIn);
      const frontFootX = lerp(14, 38, stepIn);
      for (const [hipX, footX] of [[-9, backFootX], [7, frontFootX]]) {
        temperaPoly(
          ctx,
          [
            wTorso(hipX - 6, -90),
            wFoot(footX - 5, 0),
            wFoot(footX + 18, 0),
            wFoot(footX + 5, -7),
            wTorso(hipX + 7, -90),
          ],
          lRng,
          { fillCol: EGYPT.terracotta, strokeCol: EGYPT.kohl, strokeW: 1.75, tremor: 0.4 }
        );
      }

      // 2. Pleated Alabaster Linen Artisan Shendyt Kilt + Turquoise Pigment Sash
      temperaPoly(
        ctx,
        [wTorso(-17, -126), wTorso(17, -126), wTorso(26 + stepIn * 5, -70), wTorso(-22, -70)],
        lRng,
        { fillCol: EGYPT.alabaster, strokeCol: EGYPT.kohl, strokeW: 1.75, tremor: 0.4 }
      );
      for (let pl = -14; pl <= 16; pl += 6) {
        rushStroke(ctx, [wTorso(pl * 0.8, -124), wTorso(pl * 1.1, -72)], lRng, {
          color: EGYPT.ochreWash, width: 0.95, tremor: 0.25, alpha: 0.68,
        });
      }
      temperaPoly(
        ctx,
        [wTorso(-4, -126), wTorso(7, -126), wTorso(11, -69), wTorso(-5, -69)],
        lRng,
        { fillCol: EGYPT.turquoise, strokeCol: EGYPT.kohl, strokeW: 1.3, tremor: 0.35, fritCount: 3 }
      );

      // 3. Frontal Broad Shoulders & Gold/Lapis Collar
      temperaPoly(
        ctx,
        [wTorso(-15, -126), wTorso(-27, -182), wTorso(27, -182), wTorso(15, -126)],
        lRng,
        { fillCol: EGYPT.terracotta, strokeCol: EGYPT.kohl, strokeW: 1.75, tremor: 0.4 }
      );
      const sColPts = [];
      for (let k = 0; k <= 8; k++) {
        const a = (k / 8) * Math.PI;
        sColPts.push(wTorso(Math.cos(a) * 22, -182 + Math.sin(a) * 18));
      }
      temperaPoly(ctx, sColPts, lRng, {
        fillCol: EGYPT.gold, strokeCol: EGYPT.kohl, strokeW: 1.35, tremor: 0.35,
      });

      // 4. Anatomical Profile Head + Stepped Echelon Wig + Spare Rush Pen Behind Ear!
      const headPts = buildEgyptianProfileHead(3, -202, 13.5).map(([hx, hy]) => wTorso(hx, hy));
      temperaPoly(ctx, headPts, lRng, {
        fillCol: EGYPT.terracotta, strokeCol: EGYPT.kohl, strokeW: 1.55, tremor: 0.35,
      });
      // Kohl profile eye
      const [lex, ley] = wTorso(8.5, -205);
      temperaPoly(
        ctx,
        [[lex - 4.2, ley], [lex, ley - 2.2], [lex + 4.0, ley], [lex, ley + 2.0]],
        lRng,
        { fillCol: EGYPT.alabaster, strokeCol: EGYPT.kohl, strokeW: 1.15, tremor: 0.2 }
      );
      ctx.fillStyle = EGYPT.kohl;
      ctx.fillRect(lex - 1.0, ley - 1.2, 2.4, 2.4);

      // Layered black echelon scribe wig
      temperaPoly(
        ctx,
        [wTorso(-14, -180), wTorso(-17, -204), wTorso(-10, -218), wTorso(8, -218), wTorso(14, -208), wTorso(4, -205), wTorso(1, -184)],
        lRng,
        { fillCol: EGYPT.kohl, strokeCol: EGYPT.kohl, strokeW: 1.2, tremor: 0.35 }
      );
      // Spare golden Juncus rush-reed brush tucked behind ear
      rushStroke(ctx, [wTorso(-8, -204), wTorso(19, -223)], lRng, {
        color: EGYPT.goldBright, width: 1.9, tremor: 0.3,
      });
    }

    // 5. Scribe's Arms, Polychrome Scribal Palette & Juncus Rush-Reed Brush!
    const drawScribeArmsAndTools = layer === 'fg' ? scribeInFg : !scribeInFg;
    if (drawScribeArmsAndTools) {
      const aRng = kit.makePRNG(6555);
      // Subtle 120 BPM artisan dabbing wrist oscillation when touching up tail/rear plumage feathers
      const dab = stepIn * Math.sin(localT * Math.PI * 6) * 2.8;

      // Supporting Left Arm holding Polychrome Wooden Scribal Palette (`调色书吏板`) clearly against pale gesso
      const palShoulder = wTorso(-21, -176);
      const palElbow = wTorso(lerp(-14, 6, stepIn), lerp(-140, -144, stepIn));
      const palHand = wTorso(lerp(8, 30, stepIn), lerp(-148, -164, stepIn));
      rushStroke(ctx, [palShoulder, palElbow, palHand], aRng, {
        color: EGYPT.terracotta, width: 5.8, tremor: 0.4,
      });

      // Wooden Scribal & Painter's Palette with 4 vivid mineral pigment wells (Turquoise, Gold, Carnelian, Kohl)
      const pAng = lerp(-1.15, -0.32, stepIn);
      const cp = Math.cos(pAng);
      const sp = Math.sin(pAng);
      const pPt = (ux, uy) => [palHand[0] + ux * cp - uy * sp, palHand[1] + ux * sp + uy * cp];
      temperaPoly(
        ctx,
        [pPt(-12, -6.2), pPt(27, -6.2), pPt(28, 6.2), pPt(-12, 6.2)],
        aRng,
        { fillCol: '#cfa24e', strokeCol: EGYPT.kohl, strokeW: 1.55, tremor: 0.3 }
      );
      const cakeCols = [EGYPT.turquoiseLight, EGYPT.goldBright, EGYPT.carnelian, EGYPT.kohl];
      for (let cIdx = 0; cIdx < 4; cIdx++) {
        const [cx, cy] = pPt(-5 + cIdx * 8.2, 0);
        const well = rushRingPoints(cx, cy, 2.8, 2.6, 8, aRng);
        temperaPoly(ctx, well.slice(0, -1), aRng, { fillCol: cakeCols[cIdx], strokeCol: EGYPT.kohl, strokeW: 0.85 });
      }

      // Extended Front Right Arm silhouettes cleanly in pale gesso (y ~ 512), angling Juncus brush onto tail/plumage!
      const brShoulder = wTorso(22, -176);
      const restElbow = wTorso(29, -142);
      const restHand = wTorso(26, -158);
      const restTip = wTorso(28, -196);

      // Target upper-rear tail/plumage edge so reed stem tracks tail up to x~434 before retracting to attention
      const targetTipX = clamp(tailTargetX - 4, 392, 434) + dab * 0.45;
      const targetTipY = clamp(tailTargetY - 14, 526, 540) + dab * 0.8;
      const activeHand = [targetTipX - 28, targetTipY - 15];
      const activeElbow = [lerp(brShoulder[0], activeHand[0], 0.50) - 3, lerp(brShoulder[1], activeHand[1], 0.50) + 11];

      const brElbow = [lerp(restElbow[0], activeElbow[0], stepIn), lerp(restElbow[1], activeElbow[1], stepIn)];
      const brHand = [lerp(restHand[0], activeHand[0], stepIn), lerp(restHand[1], activeHand[1], stepIn)];
      const brTip = [lerp(restTip[0], targetTipX, stepIn), lerp(restTip[1], targetTipY, stepIn)];
      const brButt = [
        brHand[0] - (brTip[0] - brHand[0]) * 0.55,
        brHand[1] - (brTip[1] - brHand[1]) * 0.55,
      ];

      rushStroke(ctx, [brShoulder, brElbow, brHand], aRng, {
        color: EGYPT.terracotta, width: 5.8, tremor: 0.4,
      });
      // Outlined Juncus rush-reed brush stem (high-contrast kohl + burnished reed gold!)
      rushStroke(ctx, [brButt, brHand, brTip], aRng, {
        color: EGYPT.kohl, width: 4.1, tremor: 0.3,
      });
      rushStroke(ctx, [brButt, brHand, brTip], aRng, {
        color: EGYPT.goldBright, width: 2.3, tremor: 0.28,
      });
      // Chewed Juncus fiber nib loaded with wet turquoise & gold pigment!
      const nibBase = [lerp(brHand[0], brTip[0], 0.74), lerp(brHand[1], brTip[1], 0.74)];
      temperaPoly(
        ctx,
        [
          [nibBase[0] - 1.6, nibBase[1] - 2.4],
          [brTip[0] + 2.4, brTip[1] - 1.2],
          [brTip[0] + 2.6, brTip[1] + 2.0],
          [nibBase[0] - 1.6, nibBase[1] + 2.4],
        ],
        aRng,
        { fillCol: EGYPT.turquoiseLight, strokeCol: EGYPT.kohl, strokeW: 1.05, tremor: 0.2 }
      );

      // Freshly dabbed turquoise frit & gold-leaf wet pigment flecks kissing the tail plumage!
      if (stepIn > 0.65 && pelicanLocalX >= 415 && pelicanLocalX <= 526) {
        const fleckAlpha = smoothstep(0.65, 0.95, stepIn);
        for (let f = 0; f < 3; f++) {
          const fx = brTip[0] + 2.5 + f * 3.8;
          const fy = brTip[1] + 1.5 + (f - 1) * 3.2 + Math.sin(localT * 12 + f) * 1.1;
          ctx.fillStyle = f % 2 === 0 ? EGYPT.turquoiseLight : EGYPT.goldHighlight;
          ctx.globalAlpha = fleckAlpha * 0.95;
          ctx.fillRect(fx, fy, 3.2, 2.6);
        }
        ctx.globalAlpha = 1;
      }
    }
  }

  // =========================================================================
  // RIGHT FLANKING PRIEST: Chief Tomb Sem-Priest & Canon Overseer (facing -X)
  // =========================================================================
  {
    const rRng = kit.makePRNG(6622);
    const stepIn = priestReach;
    const baseX = lerp(724, 682, stepIn);
    const torsoLean = stepIn * 0.09; // dignified canonical forward incline while measuring
    const caR = Math.cos(torsoLean);
    const saR = Math.sin(torsoLean);

    // Local lx > 0 points INWARD (-X toward central shrine!)
    const wFoot = (lx, ly) => [baseX - lx * sR, ROAD_EDGE_Y + ly * sR];
    const wTorso = (lx, ly) => {
      const dy0 = ly + 92;
      const rx = lx * caR - dy0 * saR;
      const ry = lx * saR + dy0 * caR - 92;
      return [baseX - rx * sR, ROAD_EDGE_Y + ry * sR];
    };

    if (layer === 'body') {
      // 1. Strict Egyptian Profile Legs (steps crisp half-stride inward toward Naos shrine!)
      const backFootX = lerp(-15, -32, stepIn);
      const frontFootX = lerp(15, 38, stepIn);
      for (const [hipX, footX] of [[-9, backFootX], [7, frontFootX]]) {
        temperaPoly(
          ctx,
          [
            wTorso(hipX - 6, -90),
            wFoot(footX - 5, 0),
            wFoot(footX + 18, 0),
            wFoot(footX + 5, -7),
            wTorso(hipX + 7, -90),
          ],
          rRng,
          { fillCol: EGYPT.terracotta, strokeCol: EGYPT.kohl, strokeW: 1.75, tremor: 0.4 }
        );
      }

      // 2. Crisp Starched Triangular Pharaoh/Priestly Pleated Linen Shendyt Apron
      temperaPoly(
        ctx,
        [wTorso(-18, -128), wTorso(18, -128), wTorso(31 + stepIn * 4, -66), wTorso(-23, -68)],
        rRng,
        { fillCol: EGYPT.alabaster, strokeCol: EGYPT.kohl, strokeW: 1.8, tremor: 0.4 }
      );
      for (let pl = -14; pl <= 20; pl += 6) {
        rushStroke(ctx, [wTorso(pl * 0.75, -126), wTorso(pl * 1.15, -68)], rRng, {
          color: EGYPT.ochreWash, width: 0.95, tremor: 0.25, alpha: 0.7,
        });
      }
      // Golden Uraeus-fringed belt apron
      temperaPoly(
        ctx,
        [wTorso(-4, -128), wTorso(8, -128), wTorso(14, -67), wTorso(-5, -67)],
        rRng,
        { fillCol: EGYPT.gold, strokeCol: EGYPT.kohl, strokeW: 1.4, tremor: 0.35 }
      );

      // 3. Frontal Torso + Ceremonial Spotted Leopard-Skin Sem-Priest Stole (`豹皮祭司披肩`)!
      temperaPoly(
        ctx,
        [wTorso(-15, -128), wTorso(-28, -184), wTorso(28, -184), wTorso(15, -128)],
        rRng,
        { fillCol: EGYPT.terracotta, strokeCol: EGYPT.kohl, strokeW: 1.8, tremor: 0.4 }
      );
      // Diagonal golden-ochre panther hide sash with hand-brushed rosette spots
      temperaPoly(
        ctx,
        [wTorso(-22, -184), wTorso(-6, -184), wTorso(16, -118), wTorso(-4, -116)],
        rRng,
        { fillCol: EGYPT.goldBright, strokeCol: EGYPT.kohl, strokeW: 1.35, tremor: 0.35 }
      );
      for (const [spx, spy] of [[-12, -172], [-5, -158], [1, -144], [6, -130], [-3, -134]]) {
        const [wx, wy] = wTorso(spx, spy);
        ctx.fillStyle = EGYPT.kohl;
        ctx.fillRect(wx - 2.2, wy - 1.8, 2.2, 2.0);
        ctx.fillRect(wx + 0.6, wy - 0.6, 2.0, 2.0);
      }

      // Lapis & Turquoise Usekh Collar
      const pColPts = [];
      for (let k = 0; k <= 8; k++) {
        const a = (k / 8) * Math.PI;
        pColPts.push(wTorso(Math.cos(a) * 23, -184 + Math.sin(a) * 19));
      }
      temperaPoly(ctx, pColPts, rRng, {
        fillCol: EGYPT.lapis, strokeCol: EGYPT.kohl, strokeW: 1.35, tremor: 0.35, fritCount: 4,
      });

      // 4. Clean-Shaven High-Priest Profile Skull + Golden Diadem Fillet (facing -X)
      const pHeadPts = buildEgyptianProfileHead(3, -204, 13.8).map(([hx, hy]) => wTorso(hx, hy));
      temperaPoly(ctx, pHeadPts, rRng, {
        fillCol: EGYPT.terracotta, strokeCol: EGYPT.kohl, strokeW: 1.6, tremor: 0.35,
      });
      // Golden priestly brow diadem + lotus ribbon
      rushStroke(ctx, [wTorso(-11, -210), wTorso(10, -210)], rRng, {
        color: EGYPT.goldBright, width: 2.5, tremor: 0.3,
      });
      rushStroke(ctx, [wTorso(-11, -210), wTorso(-21, -202), wTorso(-24, -193)], rRng, {
        color: EGYPT.carnelian, width: 1.7, tremor: 0.3,
      });
      // Deadpan kohl profile eye sighting strictly along the canon grid!
      const [pex, pey] = wTorso(8.5, -207);
      temperaPoly(
        ctx,
        [[pex - 4.2, pey], [pex, pey - 2.2], [pex + 4.2, pey], [pex, pey + 2.0]],
        rRng,
        { fillCol: EGYPT.alabaster, strokeCol: EGYPT.kohl, strokeW: 1.15, tremor: 0.2 }
      );
      ctx.fillStyle = EGYPT.kohl;
      ctx.fillRect(pex - 1.6, pey - 1.2, 2.5, 2.5);
    }

    // 5. Priest's Extended Royal Cubit Measuring Rod (`皇家腕尺`) & Golden Ankh (`☥`)!
    //    Held cleanly FROM BELOW (`x = 636..647, y = 510..525`) so Priest's profile face (`x ~ 673, y ~ 502`) stays 100% unobstructed!
    const drawPriestArmsAndTools = layer === 'fg' ? priestInFg : !priestInFg;
    if (drawPriestArmsAndTools) {
      const pToolRng = kit.makePRNG(6688);

      // Rear Arm extending Golden Ankh (`☥`) forward at chest/waist level in canonical blessing!
      const ankhShoulder = wTorso(-22, -178);
      const ankhElbow = wTorso(lerp(-14, 8, stepIn), lerp(-142, -134, stepIn));
      const ankhHand = wTorso(lerp(4, 34, stepIn), lerp(-150, -144, stepIn));
      rushStroke(ctx, [ankhShoulder, ankhElbow, ankhHand], pToolRng, {
        color: EGYPT.terracotta, width: 5.9, tremor: 0.4,
      });

      // Sacred Golden Ankh (`☥`) held forward by its top loop / crossbar
      const akX = ankhHand[0] - 8 * stepIn;
      const akY = ankhHand[1] + 2;
      const ankhLoop = rushRingPoints(akX, akY - 8, 5.8, 8.5, 12, pToolRng);
      temperaPoly(ctx, ankhLoop.slice(0, -1), pToolRng, {
        fillCol: null, strokeCol: EGYPT.goldBright, strokeW: 3.6, tremor: 0.3,
      });
      rushStroke(ctx, ankhLoop, pToolRng, { color: EGYPT.kohl, width: 1.3, tremor: 0.3 });
      rushStroke(ctx, [[akX - 9.5, akY + 1], [akX + 9.5, akY + 1]], pToolRng, {
        color: EGYPT.goldBright, width: 3.4, tremor: 0.3,
      });
      rushStroke(ctx, [[akX - 9.5, akY + 1], [akX + 9.5, akY + 1]], pToolRng, {
        color: EGYPT.kohl, width: 1.2, tremor: 0.3,
      });
      rushStroke(ctx, [[akX, akY + 1], [akX, akY + 19]], pToolRng, {
        color: EGYPT.goldBright, width: 3.6, tremor: 0.3,
      });
      rushStroke(ctx, [[akX, akY + 1], [akX, akY + 19]], pToolRng, {
        color: EGYPT.kohl, width: 1.2, tremor: 0.3,
      });

      // Front Arm extending Graduated Golden Royal Cubit Rod (`皇家腕尺`) upward-left to Beak Tip!
      const rodShoulder = wTorso(23, -178);
      const restRodElbow = wTorso(29, -148);
      const restRodHand = wTorso(26, -166);
      const restRodTop = wTorso(27, -222);
      const restRodBot = wTorso(25, -144);

      // Distal tip meets beakTip (`[604, 477]` -> `[609, 477]`) while butt stays low-left (`[646, 523]`),
      // then retracts smoothly via `stepIn` back to vertical shoulder attention at `x = 724`!
      const targetRodTipX = clamp(beakTipX + 5, 590, 626);
      const targetRodTipY = clamp(beakTipY, 468, 486);
      const activeRodHand = [targetRodTipX + 27, targetRodTipY + 33];
      const activeRodButt = [targetRodTipX + 38, targetRodTipY + 46];
      const activeRodElbow = [
        lerp(rodShoulder[0], activeRodHand[0], 0.50) + 4,
        lerp(rodShoulder[1], activeRodHand[1], 0.50) + 16,
      ];

      const rElbow = [lerp(restRodElbow[0], activeRodElbow[0], stepIn), lerp(restRodElbow[1], activeRodElbow[1], stepIn)];
      const rHand = [lerp(restRodHand[0], activeRodHand[0], stepIn), lerp(restRodHand[1], activeRodHand[1], stepIn)];
      const rTip = [lerp(restRodTop[0], targetRodTipX, stepIn), lerp(restRodTop[1], targetRodTipY, stepIn)];
      const rButt = [lerp(restRodBot[0], activeRodButt[0], stepIn), lerp(restRodBot[1], activeRodButt[1], stepIn)];

      rushStroke(ctx, [rodShoulder, rElbow, rHand], pToolRng, {
        color: EGYPT.terracotta, width: 5.9, tremor: 0.4,
      });

      // Beveled Golden Royal Cubit Measuring Rod (`皇家腕尺`, 7 palms / 28 digits with kohl graduation ticks!)
      const rdx = rTip[0] - rButt[0];
      const rdy = rTip[1] - rButt[1];
      const rLen = Math.hypot(rdx, rdy) || 1;
      const rnx = (-rdy / rLen) * 3.5;
      const rny = (rdx / rLen) * 3.5;

      temperaPoly(
        ctx,
        [
          [rButt[0] + rnx, rButt[1] + rny],
          [rTip[0] + rnx * 0.9, rTip[1] + rny * 0.9],
          [rTip[0] - rnx * 0.9, rTip[1] - rny * 0.9],
          [rButt[0] - rnx, rButt[1] - rny],
        ],
        pToolRng,
        { fillCol: EGYPT.goldBright, strokeCol: EGYPT.kohl, strokeW: 1.55, tremor: 0.28 }
      );
      // 7 Canonical Palm Subdivisions along Royal Cubit Rod
      for (let dv = 1; dv <= 7; dv++) {
        const u = dv / 8;
        const gx = rButt[0] + rdx * u;
        const gy = rButt[1] + rdy * u;
        const tickScale = dv === 4 ? 0.95 : 0.68;
        rushStroke(
          ctx,
          [[gx + rnx * tickScale, gy + rny * tickScale], [gx - rnx * tickScale, gy - rny * tickScale]],
          pToolRng,
          { color: dv === 7 ? EGYPT.carnelian : EGYPT.kohl, width: 1.15, tremor: 0.2 }
        );
      }

      // Vermilion canon sight-tick & plumb drop at distal cubit tip when actively verifying beak tip!
      if (stepIn > 0.72 && pelicanLocalX >= 445 && pelicanLocalX <= 518) {
        const sightAlpha = smoothstep(0.72, 0.96, stepIn) * 0.84;
        rushStroke(ctx, [[rTip[0], rTip[1]], [rTip[0], rTip[1] + 15]], pToolRng, {
          color: EGYPT.vermilionGrid, width: 1.3, tremor: 0.25, alpha: sightAlpha,
        });
        rushStroke(ctx, [[rTip[0] - 4.5, rTip[1]], [rTip[0] + 4.5, rTip[1]]], pToolRng, {
          color: EGYPT.vermilionGrid, width: 1.4, tremor: 0.25, alpha: sightAlpha,
        });
      }
    }
  }
}

export function render(kit, slot, scene, params) {
  const {
    localT = 0,
    pelicanLocalX = 500,
    pedalAngle = 0,
    speedScale = 1.0,
    isOutroThumbnail = false,
  } = params;

  const g = slot.g2d;
  const ctx = g.drawingContext;
  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // Bar-2 Hieratic Freeze Blend & Synchronized Naos Portal Inspection Envelope
  const poseBlend = isOutroThumbnail
    ? 1.0
    : smoothstep(1.60, 2.20, localT) * (1 - smoothstep(3.90, 4.50, localT));
  const inspectEnv = isOutroThumbnail
    ? 1.0
    : smoothstep(1.65, 2.25, localT) * (1 - smoothstep(3.65, 4.25, localT));

  // 1. Baked 3-Stratum Tomb Plaster + Full-Width Lotus Frieze + Register Baselines + Hand-Brushed Cartouche ("鹈鹕测试")
  const { wall, spallOverlay } = getEgyptTombAssets(kit);
  ctx.drawImage(wall.canvas, 0, 0);

  // 2. Dynamic Side-Register Tomb Figures on y = 442 (Fan-Bearer, Scribe, Chantress, Anubis + Curling Incense!)
  drawMidRegisterTombFigures(ctx, kit, localT, pelicanLocalX, poseBlend);

  // Precompute pelican rig so Naos Shrine Inspectors can sight directly onto beak tip & tail quills
  let rig = null;
  if (pelicanLocalX > -240 && pelicanLocalX < PANEL_SIZE + 240) {
    const { y: roadY, slope } = kit.sampleRoad(clamp(pelicanLocalX, 0, PANEL_SIZE), 0);
    rig = computePelicanRig({
      x: pelicanLocalX,
      y: roadY,
      pedalAngle,
      scale: 1.0,
      slope,
      speedScale,
      poseMode: poseBlend > 0.45 ? 'egypt_freeze' : 'normal',
      time: localT,
    });
  }

  // 3a. Lower-Register Flanking Naos Shrine Priest & Scribe Inspectors (mural body layer)
  drawNaosShrineInspectors(ctx, kit, localT, pelicanLocalX, poseBlend, inspectEnv, rig, 'body');

  // 3b. Composite-Canon Winged Pelican Deity & Tutankhamun S-Pole Chariot-Bicycle along y = 680
  if (rig) {
    drawEgyptPelicanAndChariotBike(ctx, kit, rig, localT, poseBlend);
  }

  // 3c. Foreground Inspection Tools (Cubit Rod / Ankh at Beak Tip & Juncus Brush Dabbing Tail Feathers) during Freeze!
  drawNaosShrineInspectors(ctx, kit, localT, pelicanLocalX, poseBlend, inspectEnv, rig, 'fg');

  // 4. Cross-Layer 3,300-Year Tomb Plaster Spalling & Craquelure Overlay!
  //    Binds mural borders, Nile waves, attendants, and hero into a single genuine excavated tomb wall!
  ctx.drawImage(spallOverlay.canvas, 0, 0);

  // 5. NO In-Painting Title Box in 1080p Scroll (handled by external museum brass placard + native Royal Cartouche)!
  //    Compact exhibition label strip retained ONLY for Outro 7x3 thumbnail grid!
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(20, 16, 12, 0.80)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.fillStyle = EGYPT.gold;
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 4);
    ctx.fillStyle = '#f8efd9';
    ctx.font = '700 48px "PelicanSerif", serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('02 埃及壁画', 36, PANEL_SIZE - 46);
  }

  ctx.restore();
}
