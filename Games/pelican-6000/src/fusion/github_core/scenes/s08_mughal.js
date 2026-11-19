// src/scenes/s08_mughal.js
// #08 莫卧儿细密画 (约 1600 · Akbar / Jahangir Imperial Muraqqa Folio — Museum-Authentic r3)
// - Physical Medium: Agate-burnished layered Wasli handmade paper, crushed Afghan Lapis-Lazuli (Lajward)
//   mineral outer Hashiya dusted with irregular torn gold-leaf shards (Afshan) & illuminated top Unwan Shamsa,
//   `kit.bakeBrush` WebGL2 Kubelka-Munk opaque gouache sky/garden washes bridged once into `bake2D` (`slot.usedFb = false`),
//   and subtle lead-white/malachite micro-craquelure.
// - Zero Vector Primitives & Zero Modern Fonts: Single-squirrel-hair (`Qalam-i yak-bala`, 0.55-0.95px) modulated
//   sepia-carmine & Halkari liquid-gold brush engine + `Pardaz` micro-stipple shading. Lollipop circle trees &
//   arc fish-scales are 100% replaced by hundreds of pointed gouache leaf-dabs, tarnished silver-leaf (Nuqra)
//   swirling eddies with lotus blossoms & waterfowl, Millefleurs botanical meadows, and Pietra-Dura / Chini-khana
//   porcelain-niche marble architecture.
// - Ustad Mansur Avian Study & Karkhana Jade/Koftgari Curio Bike: Sculpted naturalist Pelican with Pardaz tonal
//   volume, fine sable barbules, swaying Basra-pearl/spinel Mala garlands, riding a double-S carved Mughal
//   celadon-nephrite jade & Damascus Koftgari gold-arabesque bicycle with Peacock prow & 16-petal Meenakari wheels.
// - Bar 2 Multi-Perspective Courtly Theater: 5 aristocrats/artisans dressed in authentic four-pointed translucent
//   Chakdar Jama, pleated Patka sashes & two-bone IK curved sleeves smoothly turn their heads and point across
//   stacked perspective planes as rose petals drift in the rider's breeze!

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  clamp,
  lerp,
  smoothstep,
} from '../beat/timeline.js';
import { computePelicanRig, solveTwoBoneIK } from '../rig/pelican.js';

const MUG = {
  lapisDeep: '#0c213d',
  lapisMid: '#183d6b',
  lapisBright: '#2a64a6',
  lapisCrystal: '#5b93cf',
  goldSpec: '#fff4ba',
  goldBright: '#f7dc84',
  goldLiquid: '#dfa93a',
  goldDeep: '#a16e16',
  goldShadow: '#69450b',
  ruby: '#cc1f32',
  rubyHi: '#ff7585',
  crimson: '#9e1f26',
  crimsonDark: '#5e1015',
  emerald: '#1a754e',
  emeraldBright: '#36ab74',
  malachiteHi: '#8fd18e',
  orpiment: '#ebd060',
  cypressCore: '#0b261a',
  cypressMid: '#184a33',
  peacock: '#176e64',
  jadePale: '#dce8d6',
  jadeMid: '#b5cfb0',
  jadeDeep: '#6c916b',
  sandstone: '#ab4b37',
  sandstoneLight: '#c96a52',
  sandstoneDark: '#752b1d',
  marbleHi: '#fbf6ec',
  marbleMid: '#ece1cc',
  marbleShade: '#cbbba0',
  silverWater: '#6d8d9e',
  silverDark: '#415d6e',
  silverTarnish: '#8ca6b3',
  silverFoam: '#e8f2f5',
  qalamSepia: '#2b1914',
  qalamCarmine: '#4d1d1a',
  qalamSoft: '#523a2e',
};

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
  return lerp(
    lerp(hash2(ix, iy, seed), hash2(ix + 1, iy, seed), ux),
    lerp(hash2(ix, iy + 1, seed), hash2(ix + 1, iy + 1, seed), ux),
    uy
  );
}

function fbm2(x, y, seed = 1, octaves = 3) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amp * vnoise2(x * freq, y * freq, seed + i * 29);
    freq *= 2.02;
    amp *= 0.5;
  }
  return sum;
}

/**
 * Single-Squirrel-Hair Calligraphic Brush Engine (`Qalam-i yak-bala`):
 * Renders razor-delicate variable-width tapered hairlines (`0.55–0.95px` typical) with subtle hand-breath.
 */
function drawQalamStroke(ctx, pts, {
  wStart = 0.75,
  wMid = 0.92,
  wEnd = 0.55,
  color = MUG.qalamSepia,
  seed = 1,
  wobble = 0.14,
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
    const wProfile = u < 0.5 ? lerp(wStart, wMid, u * 2) : lerp(wMid, wEnd, (u - 0.5) * 2);
    const halfW = Math.max(0.24, wProfile * 0.5);
    const trem = (hash2(i, seed, 19) - 0.5) * 2 * wobble;
    left.push([pCurr[0] + nx * (halfW + trem), pCurr[1] + ny * (halfW + trem)]);
    right.push([pCurr[0] - nx * (halfW - trem), pCurr[1] - ny * (halfW - trem)]);
  }

  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i < n; i++) ctx.lineTo(left[i][0], left[i][1]);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function buildOvalPoly(cx, cy, rx, ry = rx, rot = 0, steps = 16, seed = 3, wobble = 0.025) {
  const pts = [];
  const ca = Math.cos(rot);
  const sa = Math.sin(rot);
  for (let i = 0; i <= steps; i++) {
    const idx = i % steps;
    const a = (idx / steps) * Math.PI * 2;
    const rMod = 1 + (hash2(idx, seed, 37) - 0.5) * 2 * wobble;
    const lx = Math.cos(a) * rx * rMod;
    const ly = Math.sin(a) * ry * rMod;
    pts.push([cx + lx * ca - ly * sa, cy + lx * sa + ly * ca]);
  }
  return pts;
}

function buildRectPoly(x, y, w, h, seed = 5, jitter = 0.18) {
  const raw = [
    [x, y],
    [x + w * 0.5, y],
    [x + w, y],
    [x + w, y + h * 0.5],
    [x + w, y + h],
    [x + w * 0.5, y + h],
    [x, y + h],
    [x, y + h * 0.5],
  ];
  const pts = raw.map((p, i) => [
    p[0] + (hash2(i, seed, 11) - 0.5) * 2 * jitter,
    p[1] + (hash2(i, seed, 17) - 0.5) * 2 * jitter,
  ]);
  pts.push([pts[0][0], pts[0][1]]);
  return pts;
}

function paintMughalPoly(ctx, pts, {
  fill = null,
  stroke = MUG.qalamSepia,
  lw = 0.8,
  goldRim = 0,
  seed = 1,
} = {}) {
  if (!pts || pts.length < 3) return;
  if (fill) {
    ctx.save();
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  if (goldRim > 0) {
    drawQalamStroke(ctx, pts, {
      wStart: goldRim,
      wMid: goldRim * 1.08,
      wEnd: goldRim * 0.9,
      color: MUG.goldBright,
      seed: seed + 3,
      wobble: 0.08,
    });
  }
  if (lw > 0 && stroke) {
    drawQalamStroke(ctx, pts, {
      wStart: lw * 0.9,
      wMid: lw * 1.08,
      wEnd: lw * 0.85,
      color: stroke,
      seed,
      wobble: 0.11,
    });
  }
}

function paintMughalOval(ctx, cx, cy, rx, ry, {
  rot = 0,
  steps = 14,
  fill = null,
  stroke = MUG.qalamSepia,
  lw = 0.78,
  goldRim = 0,
  seed = 1,
} = {}) {
  const pts = buildOvalPoly(cx, cy, rx, ry, rot, steps, seed, 0.024);
  paintMughalPoly(ctx, pts, { fill, stroke, lw, goldRim, seed });
}

/**
 * `Pardaz` Mughal Taswirkhana Micro-Stippling Shading:
 * Scatters delicate squirrel-hair pigment micro-dots inside a tonal region for soft sculptural volume.
 */
function paintPardazStipple(ctx, cx, cy, rx, ry, count, color, alpha = 0.24, seed = 1) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  for (let i = 0; i < count; i++) {
    const r = Math.sqrt(hash2(i, 1, seed));
    const a = hash2(i, 2, seed + 7) * Math.PI * 2;
    const dx = cx + Math.cos(a) * rx * r;
    const dy = cy + Math.sin(a) * ry * r;
    ctx.fillRect(dx - 0.55, dy - 0.55, 1.15, 1.15);
  }
  ctx.restore();
}

/**
 * Draws a single pointed Mughal gouache leaf-dab (`点叶笔触`) at (x, y) oriented at `ang`.
 */
function paintPointedLeafDab(ctx, x, y, len, wid, ang, fillCol, tipCol = null) {
  const ca = Math.cos(ang);
  const sa = Math.sin(ang);
  const xf = (lx, ly) => [x + lx * ca - ly * sa, y + lx * sa + ly * ca];
  const p0 = xf(0, 0);
  const p1 = xf(len * 0.44, -wid);
  const p2 = xf(len, 0);
  const p3 = xf(len * 0.44, wid);

  ctx.fillStyle = fillCol;
  ctx.beginPath();
  ctx.moveTo(p0[0], p0[1]);
  ctx.lineTo(p1[0], p1[1]);
  ctx.lineTo(p2[0], p2[1]);
  ctx.lineTo(p3[0], p3[1]);
  ctx.closePath();
  ctx.fill();

  if (tipCol) {
    const q0 = xf(len * 0.48, -wid * 0.55);
    const q1 = xf(len * 0.96, 0);
    const q2 = xf(len * 0.48, wid * 0.55);
    ctx.fillStyle = tipCol;
    ctx.beginPath();
    ctx.moveTo(q0[0], q0[1]);
    ctx.lineTo(q1[0], q1[1]);
    ctx.lineTo(q2[0], q2[1]);
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * Draws an ornate Mughal Imperial Lotus Blossom in liquid gold, crimson, and pearl for the Hashiya border.
 */
function drawHashiyaLotus(ctx, cx, cy, scale = 1.0, rot = 0, seed = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.scale(scale, scale);

  for (let p = -3; p <= 3; p++) {
    ctx.save();
    ctx.rotate(p * 0.36);
    paintMughalPoly(
      ctx,
      [[0, 2], [-4.8, -8], [0, -17.5], [4.8, -8], [0, 2]],
      {
        fill: Math.abs(p) % 2 === 0 ? MUG.crimson : '#d95b66',
        stroke: MUG.goldBright,
        lw: 0.95,
        seed: seed + p + 4,
      }
    );
    ctx.restore();
  }
  for (let p = -1; p <= 1; p++) {
    ctx.save();
    ctx.rotate(p * 0.32);
    paintMughalPoly(
      ctx,
      [[0, 2], [-3.2, -6], [0, -11.5], [3.2, -6], [0, 2]],
      { fill: MUG.goldLiquid, stroke: MUG.goldSpec, lw: 0.8, seed: seed + 15 + p }
    );
    ctx.restore();
  }
  paintMughalOval(ctx, 0, 1, 3.8, 3.6, {
    steps: 10,
    fill: MUG.emeraldBright,
    stroke: MUG.goldBright,
    lw: 0.9,
    seed: seed + 25,
  });

  ctx.restore();
}

/**
 * Draws the Crushed Afghan Lapis-Lazuli (`Lajward`) & Irregular Torn Gold-Leaf (`Afshan`) Hashiya Border,
 * Multi-Line Hand-Ruled `Jadwal` Borders, and the Top-Center Illuminated Royal `Unwan / Shamsa` Cartouche!
 * (ZERO modern computer text — pure hand-painted Persian calligraphic strokes!).
 */
function drawHashiyaBorder(ctx, rng) {
  const m = 54;

  // 1. Pixel-level Crushed Lapis-Lazuli (`Lajward`) Mineral Margin Texture (ultramarine crystals + pyrite/calcite specks)
  // Read existing canvas pixels first (`getImageData`) so `putImageData` preserves 100% of the inner [56..944] Charbagh garden!
  const img = ctx.getImageData(0, 0, PANEL_SIZE, PANEL_SIZE);
  const d = img.data;
  for (let y = 0; y < PANEL_SIZE; y++) {
    const inMarginY = y < m + 2 || y >= PANEL_SIZE - m - 2;
    for (let x = 0; x < PANEL_SIZE; x++) {
      if (!inMarginY && x >= m + 2 && x < PANEL_SIZE - m - 2) continue;
      const n1 = fbm2(x * 0.05, y * 0.05, 41, 3);
      const cryst = hash2(x, y, 79);
      const sparkle = cryst > 0.985 ? 0.38 : cryst < 0.03 ? -0.22 : 0;
      const u = clamp(0.38 + (n1 - 0.5) * 0.48 + (cryst - 0.5) * 0.18 + sparkle, 0, 1);
      const idx = (y * PANEL_SIZE + x) * 4;
      d[idx] = lerp(10, 56, u) | 0;
      d[idx + 1] = lerp(28, 102, u) | 0;
      d[idx + 2] = lerp(58, 168, u) | 0;
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  // 2. Irregular Torn Gold-Leaf Shards (`Afshan` 手撕金箔碎屑 — angular polygons of varied scale, NOT uniform circles!)
  ctx.save();
  for (let i = 0; i < 620; i++) {
    const side = i % 4;
    let gx = 0;
    let gy = 0;
    if (side === 0) {
      gx = rng() * PANEL_SIZE;
      gy = 3 + rng() * (m - 6);
    } else if (side === 1) {
      gx = rng() * PANEL_SIZE;
      gy = PANEL_SIZE - m + 3 + rng() * (m - 6);
    } else if (side === 2) {
      gx = 3 + rng() * (m - 6);
      gy = m + rng() * (PANEL_SIZE - 2 * m);
    } else {
      gx = PANEL_SIZE - m + 3 + rng() * (m - 6);
      gy = m + rng() * (PANEL_SIZE - 2 * m);
    }
    const sz = 0.8 + Math.pow(rng(), 1.8) * 3.2;
    const rot = rng() * Math.PI * 2;
    const corners = 3 + ((i * 7) % 3); // 3 to 5 irregular torn gold-leaf vertices
    ctx.fillStyle = i % 3 === 0 ? MUG.goldSpec : i % 3 === 1 ? MUG.goldBright : MUG.goldLiquid;
    ctx.globalAlpha = 0.42 + rng() * 0.52;
    ctx.beginPath();
    for (let v = 0; v < corners; v++) {
      const va = rot + (v / corners) * Math.PI * 2 + (rng() - 0.5) * 0.4;
      const vr = sz * (0.55 + rng() * 0.65);
      const px = gx + Math.cos(va) * vr;
      const py = gy + Math.sin(va) * vr * 0.72;
      if (v === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 3. Scrolling Liquid-Gold Islimi Arabesque Vines & Lotus Blossoms along all 4 sides
  const drawVineStrip = (len, count, skipCenter = false, seedBase = 100) => {
    const vine1 = [];
    const vine2 = [];
    for (let x = 0; x <= len; x += 8) {
      vine1.push([x, Math.sin((x / len) * Math.PI * count * 2) * 10.5]);
      vine2.push([x, -Math.sin((x / len) * Math.PI * count * 2) * 7.8]);
    }
    drawQalamStroke(ctx, vine1, { wStart: 1.5, wMid: 1.8, wEnd: 1.5, color: MUG.goldLiquid, seed: seedBase, wobble: 0.12 });
    drawQalamStroke(ctx, vine2, { wStart: 0.9, wMid: 1.1, wEnd: 0.9, color: 'rgba(247, 220, 132, 0.72)', seed: seedBase + 1, wobble: 0.1 });

    const step = len / count;
    for (let k = 0; k < count; k++) {
      if (skipCenter && k === Math.floor(count / 2)) continue;
      const lx = (k + 0.5) * step;
      const ly = Math.sin(((k + 0.5) / count) * Math.PI * count * 2) * 4.5;
      drawHashiyaLotus(ctx, lx, ly, 0.86, (k % 2 === 0 ? 1 : -1) * 0.24, seedBase + k * 7);
      if (k > 0 && !(skipCenter && (k === Math.floor(count / 2) || k === Math.floor(count / 2) + 1))) {
        const bx = k * step;
        paintPointedLeafDab(ctx, bx - 2, -2, 8.5, 2.4, -2.5, MUG.goldLiquid, MUG.goldSpec);
        paintPointedLeafDab(ctx, bx + 2, 2, 8.5, 2.4, 0.6, MUG.goldLiquid, MUG.goldSpec);
        paintMughalOval(ctx, bx, 0, 2.9, 2.8, { steps: 8, fill: MUG.ruby, stroke: MUG.goldBright, lw: 0.8, seed: seedBase + 50 + k });
      }
    }
  };

  const span = PANEL_SIZE - 2 * m;
  ctx.save();
  ctx.translate(m, m * 0.5);
  drawVineStrip(span, 9, true, 110); // Leave center open on top Hashiya for the royal Unwan Shamsa!
  ctx.restore();

  ctx.save();
  ctx.translate(m, PANEL_SIZE - m * 0.5);
  drawVineStrip(span, 9, false, 150);
  ctx.restore();

  ctx.save();
  ctx.translate(m * 0.5, PANEL_SIZE - m);
  ctx.rotate(-Math.PI / 2);
  drawVineStrip(span, 9, false, 190);
  ctx.restore();

  ctx.save();
  ctx.translate(PANEL_SIZE - m * 0.5, m);
  ctx.rotate(Math.PI / 2);
  drawVineStrip(span, 9, false, 230);
  ctx.restore();

  // 4. Illuminated Top-Margin 8-Lobed Royal `Unwan / Lawh` Cartouche (x = 426..574, y = 8..46, ZERO modern fonts!)
  const ux = 500;
  const uy = 27;
  const unwanPts = [];
  for (let i = 0; i <= 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    const cusp = 1 + 0.08 * Math.abs(Math.sin(6 * a));
    const ogee = 1 + 0.14 * Math.pow(Math.abs(Math.cos(a)), 3);
    unwanPts.push([ux + Math.cos(a) * 66 * ogee * cusp, uy + Math.sin(a) * 15.5 * cusp]);
  }
  paintMughalPoly(ctx, unwanPts, { fill: MUG.goldLiquid, stroke: MUG.goldSpec, lw: 1.2, seed: 260 });
  const unwanInner = unwanPts.map(([px, py]) => [ux + (px - ux) * 0.84, uy + (py - uy) * 0.78]);
  paintMughalPoly(ctx, unwanInner, { fill: MUG.lapisDeep, stroke: MUG.crimson, lw: 0.9, seed: 261 });

  // Pure hand-brushed Nastaliq gold calligraphic flourish & numeral strokes (`٨ · ١٦٠٠`) inside the Unwan!
  // Left flowing Nastaliq flourish ("Jahangir Shahi")
  drawQalamStroke(ctx, [[ux - 42, uy + 2], [ux - 31, uy + 5], [ux - 20, uy - 4], [ux - 11, uy + 3], [ux - 4, uy - 2]], {
    wStart: 0.8,
    wMid: 1.65,
    wEnd: 0.7,
    color: MUG.goldSpec,
    seed: 265,
  });
  paintMughalOval(ctx, ux - 25, uy - 6, 1.1, 1.1, { steps: 6, fill: MUG.goldSpec, lw: 0, seed: 266 });
  paintMughalOval(ctx, ux + 3, uy, 1.8, 1.8, { steps: 7, fill: MUG.rubyHi, lw: 0, seed: 267 });
  // Hand-brushed Eastern Arabic / Persian numeral strokes `٨` (8) and `١٦٠٠` (1600) — zero computer fonts!
  drawQalamStroke(ctx, [[ux + 12, uy + 5], [ux + 16, uy - 5], [ux + 20, uy + 5]], { wStart: 1.0, wMid: 1.5, wEnd: 1.0, color: MUG.goldSpec, seed: 268 });
  drawQalamStroke(ctx, [[ux + 27, uy - 5], [ux + 28, uy + 5]], { wStart: 1.2, wMid: 1.4, wEnd: 1.0, color: MUG.goldSpec, seed: 269 });
  drawQalamStroke(ctx, [[ux + 33, uy - 4], [ux + 37, uy - 4], [ux + 35, uy + 5]], { wStart: 1.1, wMid: 1.4, wEnd: 0.9, color: MUG.goldSpec, seed: 270 });
  paintMughalOval(ctx, ux + 42, uy, 1.3, 1.3, { steps: 6, fill: MUG.goldSpec, lw: 0, seed: 271 });
  paintMughalOval(ctx, ux + 47, uy, 1.3, 1.3, { steps: 6, fill: MUG.goldSpec, lw: 0, seed: 272 });

  // 5. Four Corner Gold-and-Ruby Mandala Rosettes
  for (const [cx, cy, sd] of [
    [m * 0.5, m * 0.5, 280],
    [PANEL_SIZE - m * 0.5, m * 0.5, 285],
    [m * 0.5, PANEL_SIZE - m * 0.5, 290],
    [PANEL_SIZE - m * 0.5, PANEL_SIZE - m * 0.5, 295],
  ]) {
    paintMughalOval(ctx, cx, cy, 17.5, 17.5, { steps: 16, fill: MUG.goldLiquid, stroke: MUG.goldSpec, lw: 1.2, seed: sd });
    drawHashiyaLotus(ctx, cx, cy + 2, 0.80, Math.PI / 4, sd + 1);
  }

  // 6. Multi-line Hand-Ruled `Jadwal` Illuminated Borders framing [54..946] (ZERO `strokeRect`)
  const innerW = PANEL_SIZE - 2 * m;
  for (const [off, w, col, sd] of [
    [-6.0, 2.2, MUG.goldLiquid, 301],
    [-3.6, 1.3, MUG.crimson, 302],
    [-1.6, 1.4, MUG.goldSpec, 303],
    [0.0, 0.95, MUG.qalamSepia, 304],
  ]) {
    const rPts = buildRectPoly(m + off, m + off, innerW - off * 2, innerW - off * 2, sd, 0.14);
    drawQalamStroke(ctx, rPts, { wStart: w, wMid: w, wEnd: w, color: col, seed: sd, wobble: 0.08 });
  }
}

/**
 * Abolishes `ctx.arc` lollipop circles!
 * Paints a Sculpted Mughal Cypress (`Sarv`) & Gnarled Fruiting Pomegranate Tree (`Anar`) using
 * HUNDREDS of individual pointed mineral gouache leaf-dabs (`点叶晕染法`), split ruby pomegranates
 * showing seed grains, and a tiny painted turquoise kingfisher perched in the boughs!
 */
function drawCypressAndPomegranatePair(ctx, cx, baseY, scale = 1.0, seedBase = 400) {
  ctx.save();
  ctx.translate(cx, baseY);
  ctx.scale(scale, scale);

  // 1. Gnarled Twisting Pomegranate Trunk & Branches (`Qalam` double-shaded bark)
  const branches = [
    [[7, 0], [18, -32], [23, -68], [18, -114]],
    [[18, -114], [34, -142], [54, -178]],
    [[18, -114], [-8, -138], [-42, -174]],
    [[21, -82], [38, -96], [48, -110]],
    [[12, -96], [-16, -116], [-32, -134]],
  ];
  branches.forEach((bPts, bi) => {
    const w0 = bi === 0 ? 6.8 : 4.2;
    const w1 = bi === 0 ? 4.4 : 2.0;
    drawQalamStroke(ctx, bPts, { wStart: w0, wMid: (w0 + w1) * 0.5, wEnd: w1, color: '#4d2e18', seed: seedBase + bi, wobble: 0.25 });
    drawQalamStroke(ctx, bPts, { wStart: w0 * 0.45, wMid: w1 * 0.45, wEnd: 0.8, color: '#7d5233', seed: seedBase + 10 + bi, wobble: 0.15 });
  });

  // 2. Layered Pointed Mineral Gouache Leaf-Dabs (`莫卧儿点叶法` — ~210 individual pointed leaves per tree!)
  const boughCenters = [
    [-42, -176, 30, 24],
    [52, -180, 32, 25],
    [28, -138, 28, 22],
    [-31, -135, 26, 20],
    [45, -109, 24, 19],
    [4, -156, 25, 20],
  ];
  boughCenters.forEach(([bx, by, rx, ry], cIdx) => {
    // Pass 1: Deep Indigo-Emerald Core Shadow Leaf Cluster (14 leaves)
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + hash2(i, cIdx, seedBase + 20) * 0.5;
      const rad = 0.25 + hash2(i, cIdx, seedBase + 21) * 0.58;
      paintPointedLeafDab(
        ctx,
        bx + Math.cos(a) * rx * rad,
        by + Math.sin(a) * ry * rad,
        10.5,
        3.6,
        a + (hash2(i, cIdx, 3) - 0.5) * 0.4,
        '#113b27',
        '#1b573b'
      );
    }
    // Pass 2: Rich Malachite Midtone Leaves radiating outward (14 leaves)
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + 0.22;
      const rad = 0.35 + hash2(i, cIdx, seedBase + 31) * 0.62;
      paintPointedLeafDab(
        ctx,
        bx + Math.cos(a) * rx * rad,
        by + Math.sin(a) * ry * rad - 2,
        9.6,
        3.1,
        a,
        '#25734a',
        '#47a169'
      );
    }
    // Pass 3: Sunlit Orpiment-Gold & Terre-Verte Crown Tips on upper hemisphere (8 leaves)
    for (let i = 0; i < 8; i++) {
      const a = -Math.PI * 0.92 + (i / 7) * Math.PI * 0.84;
      const rad = 0.45 + hash2(i, cIdx, seedBase + 41) * 0.48;
      paintPointedLeafDab(
        ctx,
        bx + Math.cos(a) * rx * rad,
        by + Math.sin(a) * ry * rad - 4,
        8.4,
        2.5,
        a,
        '#4ea868',
        MUG.orpiment
      );
    }
  });

  // 3. Ripe Split-Open Ruby Pomegranates (`Anar`) revealing sparkling crimson seed grains!
  const fruits = [
    [-46, -165, true],
    [-27, -128, false],
    [56, -168, true],
    [35, -132, false],
    [46, -98, false],
    [2, -148, true],
  ];
  fruits.forEach(([fx, fy, isSplit], fIdx) => {
    paintMughalOval(ctx, fx, fy, 7.2, 6.9, {
      steps: 12,
      fill: '#c93835',
      stroke: MUG.qalamCarmine,
      lw: 0.75,
      goldRim: 0.9,
      seed: seedBase + 60 + fIdx,
    });
    // Calyx crown at bottom
    paintMughalPoly(ctx, [[fx - 3.2, fy + 6.2], [fx, fy + 10.2], [fx + 3.2, fy + 6.2], [fx - 3.2, fy + 6.2]], {
      fill: MUG.goldBright,
      stroke: MUG.qalamCarmine,
      lw: 0.6,
      seed: seedBase + 70 + fIdx,
    });
    if (isSplit) {
      // Split ivory rind cleft packed with glistening ruby-red aril seeds!
      paintMughalOval(ctx, fx + 0.5, fy + 0.5, 4.0, 2.8, {
        rot: -0.3,
        steps: 9,
        fill: '#fae8cf',
        stroke: MUG.crimsonDark,
        lw: 0.55,
        seed: seedBase + 80 + fIdx,
      });
      for (const [sx, sy] of [[-1.2, 0.2], [0.6, -0.6], [1.8, 0.8], [0, 1.4]]) {
        ctx.fillStyle = MUG.ruby;
        ctx.fillRect(fx + sx, fy + sy, 1.5, 1.5);
      }
    } else {
      paintMughalOval(ctx, fx - 2.0, fy - 2.0, 2.0, 1.6, { steps: 7, fill: MUG.rubyHi, lw: 0, seed: seedBase + 90 + fIdx });
    }
  });

  // Tiny Jahangiri Turquoise Parakeet / Kingfisher perched on upper right bough!
  if (seedBase % 2 === 0) {
    paintMughalOval(ctx, 41, -150, 5.5, 2.8, { rot: -0.45, steps: 9, fill: MUG.peacock, stroke: MUG.qalamSepia, lw: 0.55, seed: seedBase + 95 });
    drawQalamStroke(ctx, [[37, -148], [30, -142]], { wStart: 1.5, wMid: 1.0, wEnd: 0.4, color: MUG.lapisBright, seed: seedBase + 96 });
    paintMughalPoly(ctx, [[45, -152], [49, -153], [45, -150]], { fill: MUG.ruby, lw: 0, seed: seedBase + 97 });
  }

  // 4. Sculpted Flame-Tipped Dark-Green Mughal Cypress (`Sarv`) built from dense overlapping foliage tufts
  const trunkPts = buildRectPoly(-4.5, -32, 9, 32, seedBase + 101, 0.2);
  paintMughalPoly(ctx, trunkPts, { fill: '#4a2e1b', stroke: MUG.qalamSepia, lw: 0.9, seed: seedBase + 101 });

  // Base cypress silhouette polygon
  const cyPoly = [];
  for (let i = 0; i <= 24; i++) {
    const u = i / 24; // 0 (base right) -> 0.5 (flame tip) -> 1 (base left)
    if (u <= 0.5) {
      const hFrac = u * 2;
      const y = lerp(-28, -244, hFrac);
      const w = Math.sin(Math.pow(hFrac, 0.72) * Math.PI) * 29;
      cyPoly.push([w + (hFrac > 0.88 ? Math.sin(hFrac * 18) * 2.5 : 0), y]);
    } else {
      const hFrac = (1 - u) * 2;
      const y = lerp(-28, -244, hFrac);
      const w = Math.sin(Math.pow(hFrac, 0.72) * Math.PI) * 29;
      cyPoly.push([-w, y]);
    }
  }
  cyPoly.push(cyPoly[0]);
  paintMughalPoly(ctx, cyPoly, { fill: MUG.cypressCore, stroke: MUG.goldDeep, lw: 0.85, seed: seedBase + 105 });

  // 95 fine layered needle-spray brush dabs sculpting 3D cylindrical volume on the Cypress!
  for (let row = 0; row < 19; row++) {
    const hFrac = (row + 0.5) / 19.5;
    const y = lerp(-34, -234, hFrac);
    const halfW = Math.sin(Math.pow(hFrac, 0.72) * Math.PI) * 26;
    const cols = Math.max(2, Math.round(halfW / 4.8));
    for (let c = -cols; c <= cols; c++) {
      const xOff = (c / Math.max(1, cols)) * halfW * 0.85;
      const lit = clamp(0.5 - (c / Math.max(1, cols)) * 0.45 + (hash2(row, c + 10, seedBase + 120) - 0.5) * 0.25, 0, 1);
      const col = lit > 0.62 ? '#296e4b' : lit > 0.32 ? MUG.cypressMid : '#0e3322';
      const tip = lit > 0.72 ? '#6bbf7e' : null;
      paintPointedLeafDab(ctx, xOff, y + 4, 9.5, 2.4, -Math.PI * 0.5 + (xOff / 30) * 0.45, col, tip);
    }
  }

  ctx.restore();
}


/**
 * Draws an Imperial Safavid-Mughal `Lachak-Toranj` Medallion Silk Carpet in flat stacked perspective.
 * Zero `strokeRect`, zero `ctx.arc`.
 */
function drawPersianCarpet(ctx, x, y, w, h, mainColor = '#8c1b24', borderColor = '#143359', seed = 500) {
  ctx.save();
  // Silk fringe threads on left and right short edges
  for (let fy = y + 3; fy <= y + h - 3; fy += 3.6) {
    drawQalamStroke(ctx, [[x - 6.5, fy], [x, fy + 0.3]], { wStart: 0.7, wMid: 0.85, wEnd: 0.7, color: '#efe2c4', seed: seed + (fy | 0) });
    drawQalamStroke(ctx, [[x + w, fy], [x + w + 6.5, fy + 0.3]], { wStart: 0.7, wMid: 0.85, wEnd: 0.7, color: '#efe2c4', seed: seed + 90 + (fy | 0) });
  }

  const outerPts = buildRectPoly(x, y, w, h, seed + 1, 0.22);
  paintMughalPoly(ctx, outerPts, { fill: borderColor, stroke: MUG.goldBright, lw: 1.15, seed: seed + 1 });

  const b = Math.min(w, h) * 0.15;
  const fieldPts = buildRectPoly(x + b, y + b, w - 2 * b, h - 2 * b, seed + 2, 0.18);
  paintMughalPoly(ctx, fieldPts, { fill: mainColor, stroke: MUG.goldSpec, lw: 0.9, seed: seed + 2 });

  // Guard-border tiny gold & turquoise florets
  for (let bx = x + b * 0.5; bx <= x + w - b * 0.4; bx += 11) {
    paintMughalOval(ctx, bx, y + b * 0.5, 2.1, 1.9, { steps: 7, fill: MUG.goldBright, stroke: MUG.ruby, lw: 0.45, seed: seed + (bx | 0) });
    paintMughalOval(ctx, bx, y + h - b * 0.5, 2.1, 1.9, { steps: 7, fill: MUG.goldBright, stroke: MUG.ruby, lw: 0.45, seed: seed + 30 + (bx | 0) });
  }

  // Corner quarter-spandrels (`Lachak`)
  const cSz = Math.min(w, h) * 0.18;
  for (const [cx0, cy0, dx, dy, sd] of [
    [x + b, y + b, cSz, cSz, 11],
    [x + w - b, y + b, -cSz, cSz, 12],
    [x + b, y + h - b, cSz, -cSz, 13],
    [x + w - b, y + h - b, -cSz, -cSz, 14],
  ]) {
    paintMughalPoly(ctx, [[cx0, cy0], [cx0 + dx, cy0], [cx0, cy0 + dy], [cx0, cy0]], {
      fill: MUG.peacock,
      stroke: MUG.goldBright,
      lw: 0.75,
      seed: seed + sd,
    });
  }

  // Central `Toranj` 12-lobed floral medallion + pendant finials
  const mx = x + w * 0.5;
  const my = y + h * 0.5;
  const rx = (w - 2 * b) * 0.28;
  const ry = (h - 2 * b) * 0.34;
  const medPts = [];
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const lobe = 1 + 0.12 * Math.abs(Math.cos(6 * a));
    medPts.push([mx + Math.cos(a) * rx * lobe, my + Math.sin(a) * ry * lobe]);
  }
  paintMughalPoly(ctx, medPts, { fill: MUG.goldLiquid, stroke: MUG.goldSpec, lw: 0.95, seed: seed + 20 });
  paintMughalOval(ctx, mx, my, rx * 0.56, ry * 0.56, { steps: 12, fill: MUG.peacock, stroke: MUG.goldSpec, lw: 0.75, seed: seed + 21 });
  paintMughalOval(ctx, mx, my, rx * 0.22, ry * 0.22, { steps: 8, fill: MUG.rubyHi, lw: 0, seed: seed + 22 });

  // Delicate scrolling gold vine motifs in the crimson field
  for (const sx of [-1, 1]) {
    drawQalamStroke(
      ctx,
      [[mx + sx * rx * 1.05, my], [mx + sx * rx * 1.38, my - ry * 0.38], [mx + sx * rx * 1.62, my + ry * 0.24]],
      { wStart: 0.85, wMid: 0.95, wEnd: 0.55, color: MUG.goldBright, seed: seed + 30 + sx }
    );
  }
  ctx.restore();
}

/**
 * Builds polygon vertices for a classic Mughal 9-cusped Shahjahani/Jahangiri ogee arch opening.
 */
function getCuspedArchPoly(cx, topY, w, h) {
  const halfW = w * 0.5;
  const springY = topY + h * 0.42;
  const botY = topY + h;
  const pts = [[cx - halfW, botY], [cx - halfW, springY]];
  const cusps = 9;
  for (let i = 0; i <= cusps * 4; i++) {
    const u = i / (cusps * 4); // 0 (left spring) -> 0.5 (apex) -> 1 (right spring)
    const ang = Math.PI * (1 - u);
    const archX = cx + Math.cos(ang) * halfW;
    const ogeeLift = Math.pow(Math.sin(ang), 0.78);
    const cuspScallop = Math.abs(Math.sin(u * Math.PI * cusps)) * 3.1 * Math.sin(ang);
    const archY = springY - (springY - topY) * ogeeLift - cuspScallop;
    pts.push([archX, archY]);
  }
  pts.push([cx + halfW, botY], [cx - halfW, botY]);
  return pts;
}

/**
 * Paints semi-precious `Pietra Dura` (`Parchin Kari`) floral inlays in Makrana marble arch spandrels.
 */
function drawPietraDuraSpandrel(ctx, cx, topY, w, seed = 600) {
  for (const sx of [-1, 1]) {
    const bx = cx + sx * w * 0.36;
    const by = topY + 9.5;
    drawQalamStroke(
      ctx,
      [[cx + sx * 7, topY + 3], [cx + sx * w * 0.24, topY + 6], [bx, by + 5]],
      { wStart: 0.75, wMid: 0.9, wEnd: 0.6, color: MUG.goldDeep, seed: seed + sx }
    );
    paintMughalOval(ctx, bx, by, 3.2, 2.8, { steps: 8, fill: MUG.ruby, stroke: MUG.goldLiquid, lw: 0.55, seed: seed + 10 + sx });
    paintPointedLeafDab(ctx, bx - sx * 3, by + 2, 5.5, 1.8, sx > 0 ? 2.6 : 0.5, MUG.emeraldBright);
    paintPointedLeafDab(ctx, cx + sx * w * 0.22, topY + 6.5, 5.0, 1.6, sx > 0 ? 1.9 : 1.2, MUG.lapisBright);
  }
}

/**
 * Paints recessed Mughal `Chini-khana` porcelain-and-vessel wall niches inside pavilion arches
 * (replaces empty dark arch holes with rich palace interior craft!).
 */
function drawChiniKhanaInterior(ctx, cx, topY, w, h, isUpper = false, seed = 620) {
  const archPts = getCuspedArchPoly(cx, topY, w, h);
  // Warm lamp-lit sandstone/ochre-crimson recessed chamber back wall
  paintMughalPoly(ctx, archPts, {
    fill: isUpper ? '#3a1a1f' : '#471e22',
    stroke: MUG.goldBright,
    lw: 1.15,
    seed,
  });

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(archPts[0][0], archPts[0][1]);
  for (let i = 1; i < archPts.length; i++) ctx.lineTo(archPts[i][0], archPts[i][1]);
  ctx.closePath();
  ctx.clip();

  // Subtle recessed plaster geometric dado & miniature `Chini-khana` vessel niches
  const dadoY = topY + h * 0.68;
  paintMughalPoly(ctx, buildRectPoly(cx - w * 0.5, dadoY, w, h * 0.34, seed + 2, 0.1), {
    fill: '#5c262b',
    stroke: MUG.goldLiquid,
    lw: 0.7,
    seed: seed + 2,
  });

  const cols = w > 52 ? [-15, 0, 15] : [-9, 9];
  cols.forEach((ox, idx) => {
    const nx = cx + ox;
    const ny = topY + h * 0.42;
    // Tiny cusped niche frame
    paintMughalPoly(ctx, [[nx - 5.2, ny + 12], [nx - 5.2, ny + 3], [nx, ny - 2], [nx + 5.2, ny + 3], [nx + 5.2, ny + 12], [nx - 5.2, ny + 12]], {
      fill: '#2b1115',
      stroke: MUG.goldDeep,
      lw: 0.6,
      seed: seed + 10 + idx,
    });
    if ((idx + (isUpper ? 1 : 0)) % 2 === 0) {
      // Miniature Ming blue-and-white porcelain `Surahi` long-necked flask!
      paintMughalOval(ctx, nx, ny + 8.5, 3.1, 3.3, { steps: 9, fill: '#f2f5f8', stroke: MUG.lapisBright, lw: 0.6, seed: seed + 20 + idx });
      drawQalamStroke(ctx, [[nx, ny + 5.5], [nx, ny + 1.2]], { wStart: 1.5, wMid: 1.1, wEnd: 1.6, color: '#f2f5f8', seed: seed + 25 + idx });
      paintMughalOval(ctx, nx, ny + 8.5, 1.3, 1.1, { steps: 6, fill: MUG.lapisBright, lw: 0, seed: seed + 30 + idx });
    } else {
      // Burnished gold `Gulabpash` rosewater ewer with ruby finial
      paintMughalOval(ctx, nx, ny + 8.8, 2.9, 3.0, { steps: 9, fill: MUG.goldLiquid, stroke: MUG.goldSpec, lw: 0.55, seed: seed + 40 + idx });
      drawQalamStroke(ctx, [[nx, ny + 6.0], [nx + 0.6, ny + 1.4]], { wStart: 1.2, wMid: 0.9, wEnd: 0.7, color: MUG.goldSpec, seed: seed + 45 + idx });
      paintMughalOval(ctx, nx + 0.6, ny + 1.2, 1.0, 1.0, { steps: 6, fill: MUG.rubyHi, lw: 0, seed: seed + 48 + idx });
    }
  });

  // Crimson brocade `Masnad` bolster cushion at base of ground-floor arches
  if (!isUpper) {
    paintMughalOval(ctx, cx, topY + h - 4.5, w * 0.34, 5.2, {
      steps: 12,
      fill: MUG.crimson,
      stroke: MUG.goldBright,
      lw: 0.75,
      seed: seed + 60,
    });
  }

  // Rolled crimson-and-gold silk `Chik` Valence curtain draped at arch crown
  paintMughalPoly(
    ctx,
    [[cx - w * 0.46, topY + 14], [cx, topY + 20], [cx + w * 0.46, topY + 14], [cx + w * 0.46, topY], [cx - w * 0.46, topY]],
    { fill: MUG.crimson, stroke: MUG.goldBright, lw: 0.8, seed: seed + 70 }
  );

  ctx.restore();
  drawQalamStroke(ctx, archPts, { wStart: 1.05, wMid: 1.2, wEnd: 1.0, color: MUG.goldBright, seed: seed + 80, wobble: 0.08 });
}

/**
 * Draws the White Makrana Marble Imperial Pleasure Pavilion (`Baradari`) with veined marble,
 * `Pietra Dura` floral spandrels, `Chini-khana` niches, overhanging `Chhajja` eaves, & ribbed onion `Chhatri` domes.
 */
function drawMarblePavilionBase(ctx, px, py) {
  ctx.save();
  ctx.translate(px, py);

  // 1. Stepped Red Sikri Sandstone & Inlaid Marble Plinth (`Chabutra`)
  paintMughalPoly(ctx, buildRectPoly(-118, -22, 236, 22, 701, 0.2), {
    fill: MUG.sandstone,
    stroke: MUG.goldDeep,
    lw: 1.0,
    seed: 701,
  });
  for (let tx = -108; tx <= 100; tx += 26) {
    paintMughalPoly(ctx, [[tx, -17], [tx + 9, -11], [tx, -5], [tx - 9, -11], [tx, -17]], {
      fill: MUG.marbleHi,
      stroke: MUG.goldBright,
      lw: 0.7,
      seed: 702 + tx,
    });
  }

  // 2. Ground-Floor Veined White Makrana Marble Arcade (`y = -114 .. -22`)
  paintMughalPoly(ctx, buildRectPoly(-105, -114, 210, 92, 710, 0.18), {
    fill: MUG.marbleHi,
    stroke: MUG.qalamSoft,
    lw: 0.95,
    seed: 710,
  });
  // Subtle translucent grey-amber marble veining
  for (let v = 0; v < 5; v++) {
    const vx = -92 + v * 44;
    drawQalamStroke(ctx, [[vx, -110], [vx + 12, -74], [vx + 4, -26]], {
      wStart: 0.6,
      wMid: 1.1,
      wEnd: 0.5,
      color: 'rgba(182, 166, 142, 0.34)',
      seed: 715 + v,
    });
  }

  // Three ground-floor cusped arches with `Pietra Dura` spandrels & `Chini-khana` interiors
  drawPietraDuraSpandrel(ctx, 0, -104, 66, 720);
  drawPietraDuraSpandrel(ctx, -68, -99, 46, 724);
  drawPietraDuraSpandrel(ctx, 68, -99, 46, 728);
  drawChiniKhanaInterior(ctx, 0, -102, 62, 80, false, 730);
  drawChiniKhanaInterior(ctx, -68, -97, 44, 75, false, 740);
  drawChiniKhanaInterior(ctx, 68, -97, 44, 75, false, 750);

  // Fluted Makrana marble columns with lotus bases & muqarnas capitals
  for (const colX of [-100, -39, 39, 100]) {
    paintMughalPoly(ctx, buildRectPoly(colX - 3.6, -106, 7.2, 84, 760 + colX, 0.12), {
      fill: MUG.marbleMid,
      stroke: MUG.goldDeep,
      lw: 0.78,
      seed: 760 + colX,
    });
    paintMughalPoly(ctx, [[colX - 6, -106], [colX + 6, -106], [colX + 4, -100], [colX - 4, -100]], {
      fill: MUG.goldLiquid,
      stroke: MUG.qalamSepia,
      lw: 0.65,
      seed: 765 + colX,
    });
  }

  // Overhanging sloped `Chhajja` sun-breaker eaves + shadow band + carved sandstone brackets (`Madala`)
  paintMughalPoly(ctx, [[-110, -114], [110, -114], [116, -106], [-116, -106], [-110, -114]], {
    fill: 'rgba(42, 22, 16, 0.28)',
    lw: 0,
    seed: 770,
  });
  paintMughalPoly(ctx, [[-118, -114], [118, -114], [110, -123], [-110, -123], [-118, -114]], {
    fill: MUG.sandstoneLight,
    stroke: MUG.goldBright,
    lw: 0.95,
    seed: 771,
  });
  for (let bx = -98; bx <= 98; bx += 28) {
    paintMughalPoly(ctx, [[bx - 2.5, -114], [bx + 2.5, -114], [bx + 1, -107], [bx - 1, -107]], {
      fill: MUG.goldLiquid,
      stroke: MUG.qalamSepia,
      lw: 0.55,
      seed: 775 + bx,
    });
  }

  // 3. Second-Floor Imperial Loggia (`y = -194 .. -123`) — where our Nobleman leans over the rail!
  paintMughalPoly(ctx, buildRectPoly(-82, -194, 164, 71, 780, 0.16), {
    fill: MUG.marbleHi,
    stroke: MUG.qalamSoft,
    lw: 0.9,
    seed: 780,
  });
  drawPietraDuraSpandrel(ctx, 0, -186, 52, 782);
  drawPietraDuraSpandrel(ctx, -53, -182, 36, 784);
  drawPietraDuraSpandrel(ctx, 53, -182, 36, 786);
  drawChiniKhanaInterior(ctx, 0, -184, 48, 61, true, 790);
  drawChiniKhanaInterior(ctx, -53, -180, 34, 57, true, 795);
  drawChiniKhanaInterior(ctx, 53, -180, 34, 57, true, 800);

  // Upper cornice `Chhajja` eaves
  paintMughalPoly(ctx, [[-93, -194], [93, -194], [85, -202], [-85, -202], [-93, -194]], {
    fill: MUG.sandstone,
    stroke: MUG.goldBright,
    lw: 0.9,
    seed: 805,
  });

  // 4. Central Ribbed Onion-Lotus Marble Dome (`Gumbad`) + Flanking `Chhatri` Kiosks
  const drawRibbedDome = (dx, dy, rx, ry, sd) => {
    const domePts = [];
    for (let i = 0; i <= 22; i++) {
      const u = i / 22;
      const a = Math.PI * (1 - u);
      const bulge = 1 + 0.16 * Math.sin(Math.PI * Math.sin(a));
      domePts.push([dx + Math.cos(a) * rx * bulge, dy - Math.sin(a) * ry]);
    }
    domePts.push([dx - rx, dy]);
    paintMughalPoly(ctx, domePts, { fill: MUG.marbleHi, stroke: MUG.goldDeep, lw: 0.9, seed: sd });
    // Fluted marble ribs + Pardaz right-side shading
    for (const frac of [-0.62, -0.3, 0, 0.3, 0.62]) {
      drawQalamStroke(ctx, [[dx + frac * rx, dy], [dx + frac * rx * 0.65, dy - ry * 0.62], [dx, dy - ry]], {
        wStart: 0.65,
        wMid: 0.75,
        wEnd: 0.45,
        color: MUG.marbleShade,
        seed: sd + Math.round(frac * 10),
      });
    }
    paintPardazStipple(ctx, dx + rx * 0.42, dy - ry * 0.42, rx * 0.4, ry * 0.38, 28, MUG.qalamSoft, 0.16, sd + 9);
    // Inverted lotus `Padmakosha` crown + gilded `Kalasha` spire finial
    paintMughalPoly(ctx, [[dx - 5, dy - ry + 1], [dx, dy - ry - 5], [dx + 5, dy - ry + 1]], {
      fill: MUG.goldLiquid,
      stroke: MUG.qalamSepia,
      lw: 0.6,
      seed: sd + 11,
    });
    drawQalamStroke(ctx, [[dx, dy - ry - 4], [dx, dy - ry - 15]], { wStart: 1.5, wMid: 1.1, wEnd: 0.6, color: MUG.goldSpec, seed: sd + 12 });
    paintMughalOval(ctx, dx, dy - ry - 8.5, 2.2, 2.2, { steps: 8, fill: MUG.goldBright, stroke: MUG.goldDeep, lw: 0.5, seed: sd + 13 });
  };

  drawRibbedDome(0, -202, 34, 27, 810);
  drawRibbedDome(-62, -202, 16, 14, 830);
  drawRibbedDome(62, -202, 16, 14, 850);

  ctx.restore();
}

/**
 * Draws the pierced marble `Jali` lattice balustrade on the 2nd-floor balcony (layered IN FRONT of the Nobleman's waist!).
 */
function drawPavilionJaliBalustrade(ctx, px, py) {
  ctx.save();
  ctx.translate(px, py);
  paintMughalPoly(ctx, buildRectPoly(-84, -138, 168, 15, 870, 0.15), {
    fill: MUG.marbleHi,
    stroke: MUG.goldDeep,
    lw: 0.9,
    seed: 870,
  });
  for (let jx = -76; jx <= 72; jx += 12) {
    paintMughalPoly(ctx, [[jx, -135], [jx + 4.5, -130.5], [jx, -126], [jx - 4.5, -130.5], [jx, -135]], {
      fill: '#3d1c20',
      stroke: MUG.goldLiquid,
      lw: 0.6,
      seed: 871 + jx,
    });
  }
  drawQalamStroke(ctx, [[-85, -138], [85, -138]], { wStart: 1.3, wMid: 1.5, wEnd: 1.3, color: MUG.goldBright, seed: 890 });
  ctx.restore();
}

/**
 * Draws the Imperial Red Sikri Sandstone & White Makrana Marble `Girih` Star-Inlaid Walkway
 * strictly anchored along `y = ROAD_EDGE_Y = 680` across the entire panel!
 */
function drawGeometricInlaidWalkway(ctx) {
  const m = 54;
  const roadTop = ROAD_EDGE_Y; // 680 — strict global horizon/road edge contract!
  const roadH = 74; // 680 .. 754

  // 1. Base dressed red sandstone slabs
  paintMughalPoly(ctx, buildRectPoly(m, roadTop, PANEL_SIZE - 2 * m, roadH, 901, 0.18), {
    fill: MUG.sandstone,
    stroke: MUG.qalamCarmine,
    lw: 0.95,
    seed: 901,
  });
  // Subtle hand-rubbed mineral pigment variation per slab
  for (let sx = m; sx < PANEL_SIZE - m; sx += 56) {
    const wSlab = Math.min(56, PANEL_SIZE - m - sx);
    const tone = hash2(sx, 1, 902) > 0.5 ? 'rgba(209, 108, 82, 0.16)' : 'rgba(92, 31, 20, 0.14)';
    paintMughalPoly(ctx, buildRectPoly(sx, roadTop + 8, wSlab, roadH - 16, 903 + sx, 0.12), {
      fill: tone,
      stroke: 'rgba(77, 29, 26, 0.28)',
      lw: 0.55,
      seed: 903 + sx,
    });
  }

  // 2. Upper (`y = 680`) and Lower (`y = 754`) Carved White Makrana Marble Curbs
  paintMughalPoly(ctx, buildRectPoly(m, roadTop, PANEL_SIZE - 2 * m, 8.2, 910, 0.12), {
    fill: MUG.marbleHi,
    stroke: MUG.goldDeep,
    lw: 0.95,
    seed: 910,
  });
  paintMughalPoly(ctx, buildRectPoly(m, roadTop + roadH - 8.2, PANEL_SIZE - 2 * m, 8.2, 911, 0.12), {
    fill: MUG.marbleHi,
    stroke: MUG.goldDeep,
    lw: 0.95,
    seed: 911,
  });

  // 3. Repeating 8-Pointed Mughal `Girih` Star & Cross Parquetry Inlays (`x = 54..946`)
  const step = 56;
  const cy = roadTop + roadH * 0.5;
  for (let gx = m + 28; gx < PANEL_SIZE - m - 10; gx += step) {
    const starPts = [];
    for (let i = 0; i <= 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const r = i % 2 === 0 ? 21 : 9.4;
      starPts.push([gx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.80]);
    }
    paintMughalPoly(ctx, starPts, { fill: MUG.marbleHi, stroke: MUG.goldDeep, lw: 0.85, seed: 920 + gx });
    paintMughalOval(ctx, gx, cy, 6.2, 5.0, {
      steps: 10,
      fill: (Math.round(gx / step) % 2 === 0) ? MUG.peacock : MUG.lapisMid,
      stroke: MUG.goldBright,
      lw: 0.75,
      seed: 940 + gx,
    });
    paintMughalOval(ctx, gx, cy, 2.0, 1.7, { steps: 7, fill: MUG.rubyHi, lw: 0, seed: 950 + gx });

    if (gx + step * 0.5 < PANEL_SIZE - m - 14) {
      const mx = gx + step * 0.5;
      for (const dy of [-17, 17]) {
        paintMughalPoly(ctx, [[mx, cy + dy - 5], [mx + 6.5, cy + dy], [mx, cy + dy + 5], [mx - 6.5, cy + dy], [mx, cy + dy - 5]], {
          fill: MUG.goldLiquid,
          stroke: MUG.qalamCarmine,
          lw: 0.65,
          seed: 960 + mx + dy,
        });
      }
    }
  }
}

/**
 * Abolishes uniform `ctx.arc` fish-scales!
 * Paints Authentic Tarnished Oxidized Silver-Leaf (`Nuqra`) Mughal Water Channels with
 * swirling Timurid-Mughal spiral eddies, floating emerald lotus pads, pink `Nelumbo` blossoms, and miniature court ducks!
 */
function fillMughalSilverWater(ctx, rx, ry, rw, rh, seed = 1000) {
  ctx.save();
  const rectPts = buildRectPoly(rx, ry, rw, rh, seed, 0.14);
  paintMughalPoly(ctx, rectPts, { fill: MUG.silverWater, lw: 0, seed });

  ctx.beginPath();
  ctx.moveTo(rx, ry);
  ctx.lineTo(rx + rw, ry);
  ctx.lineTo(rx + rw, ry + rh);
  ctx.lineTo(rx, ry + rh);
  ctx.closePath();
  ctx.clip();

  // Oxidized silver-leaf (`Nuqra`) mottled tarnish patches (dark slate-pewter edges & metallic silver sheen center)
  const patches = Math.max(4, Math.round((rw * rh) / 2200));
  for (let i = 0; i < patches; i++) {
    const px = rx + hash2(i, 1, seed + 3) * rw;
    const py = ry + hash2(i, 2, seed + 5) * rh;
    const edgeProx = Math.min(px - rx, rx + rw - px, py - ry, ry + rh - py);
    const col = edgeProx < 10 ? 'rgba(42, 62, 77, 0.34)' : (i % 2 === 0 ? 'rgba(182, 206, 217, 0.24)' : 'rgba(56, 82, 99, 0.22)');
    paintMughalOval(ctx, px, py, 14 + (i % 9), 7 + (i % 5), { steps: 10, fill: col, lw: 0, seed: seed + 10 + i });
  }

  // Hand-brushed Swirling Timurid-Mughal Calligraphic Water Eddies & Wave Filaments!
  const isHoriz = rw >= rh;
  const span = isHoriz ? rw : rh;
  const count = Math.max(3, Math.floor(span / 38));
  for (let k = 0; k < count; k++) {
    const u = (k + 0.5) / count;
    const ex = isHoriz ? rx + u * rw : rx + rw * (0.32 + 0.36 * ((k * 7) % 2));
    const ey = isHoriz ? ry + rh * (0.30 + 0.40 * ((k * 5) % 2)) : ry + u * rh;

    // Spiral eddy curl (`回水涡纹`)
    const spiral = [];
    for (let s = 0; s <= 16; s++) {
      const t = s / 16;
      const a = t * Math.PI * 2.7 + k * 1.1;
      const rad = lerp(9.5, 1.4, t);
      spiral.push([ex + Math.cos(a) * rad * 1.25, ey + Math.sin(a) * rad * 0.72]);
    }
    drawQalamStroke(ctx, spiral, { wStart: 0.75, wMid: 0.85, wEnd: 0.45, color: MUG.silverFoam, seed: seed + 40 + k, wobble: 0.08 });

    // Flowing flanking current filaments
    const wave = [];
    for (let wStep = -3; wStep <= 3; wStep++) {
      const off = wStep * 5.5;
      wave.push([
        ex + (isHoriz ? off : Math.sin(wStep * 0.9) * 4.2),
        ey + (isHoriz ? Math.sin(wStep * 0.9) * 3.8 - 6 : off),
      ]);
    }
    drawQalamStroke(ctx, wave, { wStart: 0.45, wMid: 0.72, wEnd: 0.45, color: 'rgba(35, 55, 70, 0.55)', seed: seed + 80 + k, wobble: 0.08 });
  }

  // Floating Emerald Lotus Pads & Pink Imperial `Nelumbo` Blossoms!
  const lotusCount = Math.max(1, Math.floor((rw * rh) / 5600));
  for (let l = 0; l < lotusCount; l++) {
    const lx = rx + 12 + hash2(l, 7, seed + 120) * Math.max(6, rw - 24);
    const ly = ry + 10 + hash2(l, 9, seed + 130) * Math.max(6, rh - 20);
    paintMughalOval(ctx, lx, ly, 6.2, 4.1, {
      rot: (l % 3 - 1) * 0.25,
      steps: 10,
      fill: '#236947',
      stroke: MUG.goldDeep,
      lw: 0.55,
      seed: seed + 140 + l,
    });
    if (l % 2 === 0) {
      // Blooming pink lotus petals
      for (const pa of [-0.55, 0, 0.55]) {
        paintPointedLeafDab(ctx, lx, ly - 1, 6.2, 2.2, -Math.PI * 0.5 + pa, '#e8748c', '#ffd6df');
      }
      paintMughalOval(ctx, lx, ly - 1.5, 1.5, 1.1, { steps: 6, fill: MUG.goldBright, lw: 0, seed: seed + 160 + l });
    }
  }

  // Tiny Painted Mughal Waterfowl / Mandarin Duck in horizontal canals!
  if (isHoriz && rw > 180) {
    const dx = rx + rw * 0.58;
    const dy = ry + rh * 0.54;
    paintMughalOval(ctx, dx, dy, 6.2, 3.4, { steps: 10, fill: '#f5ead6', stroke: MUG.qalamSepia, lw: 0.6, seed: seed + 190 });
    drawQalamStroke(ctx, [[dx + 4.5, dy - 1], [dx + 6.8, dy - 5.2], [dx + 8.5, dy - 5.5]], {
      wStart: 2.2,
      wMid: 1.7,
      wEnd: 1.4,
      color: '#1b5946',
      seed: seed + 191,
    });
    paintMughalPoly(ctx, [[dx + 8.5, dy - 6.0], [dx + 11.4, dy - 5.2], [dx + 8.5, dy - 4.6]], { fill: MUG.orpiment, lw: 0, seed: seed + 192 });
  }

  ctx.restore();
}

/**
 * Paints Jahangir-era `Millefleurs` (`Sad-barg`) Botanical Meadow Tufts inside a `Chaman` grass parterre:
 * Kashmiri purple irises, crimson poppies, saffron marigolds, flame-striped tulips & white jasmine!
 */
function drawMillefleursMeadow(ctx, x0, y0, w, h, rng, avoidRect = null) {
  const tuftCount = Math.round((w * h) / 2350);
  for (let i = 0; i < tuftCount; i++) {
    const fx = x0 + 14 + rng() * Math.max(8, w - 28);
    const fy = y0 + 16 + rng() * Math.max(8, h - 28);
    if (
      avoidRect &&
      fx > avoidRect.x - 10 &&
      fx < avoidRect.x + avoidRect.w + 10 &&
      fy > avoidRect.y - 10 &&
      fy < avoidRect.y + avoidRect.h + 10
    ) {
      continue;
    }

    const kind = i % 5;
    const stemH = 9 + (i % 4) * 2.4;
    // Basal curved botanical leaves + central stem
    paintPointedLeafDab(ctx, fx, fy, 7.5, 2.0, -Math.PI * 0.72, '#174f32', '#337d52');
    paintPointedLeafDab(ctx, fx, fy, 7.5, 2.0, -Math.PI * 0.28, '#174f32', '#337d52');
    drawQalamStroke(ctx, [[fx, fy], [fx + (kind % 2 === 0 ? 1.2 : -1.2), fy - stemH]], {
      wStart: 0.9,
      wMid: 0.75,
      wEnd: 0.55,
      color: '#1d5939',
      seed: 1200 + i,
    });

    const bx = fx + (kind % 2 === 0 ? 1.2 : -1.2);
    const by = fy - stemH;
    if (kind === 0) {
      // Kashmiri Violet-Blue Iris (`Sosan`)
      paintPointedLeafDab(ctx, bx, by + 1, 6.4, 2.2, -Math.PI * 0.5, '#56398f', '#8a6bc9');
      paintPointedLeafDab(ctx, bx - 1, by + 1, 5.2, 1.8, -Math.PI * 0.82, '#3f2673', MUG.orpiment);
      paintPointedLeafDab(ctx, bx + 1, by + 1, 5.2, 1.8, -Math.PI * 0.18, '#3f2673', MUG.orpiment);
    } else if (kind === 1) {
      // Mughal Crimson Poppy (`Lala`) with dark stamen eye
      paintMughalOval(ctx, bx - 2.0, by - 0.8, 2.8, 2.4, { steps: 7, fill: MUG.ruby, lw: 0, seed: 1300 + i });
      paintMughalOval(ctx, bx + 2.0, by - 0.8, 2.8, 2.4, { steps: 7, fill: '#e03647', lw: 0, seed: 1301 + i });
      paintMughalOval(ctx, bx, by - 2.2, 2.8, 2.3, { steps: 7, fill: MUG.rubyHi, lw: 0, seed: 1302 + i });
      paintMughalOval(ctx, bx, by - 0.9, 1.2, 1.1, { steps: 6, fill: '#1f0d12', lw: 0, seed: 1303 + i });
    } else if (kind === 2) {
      // Saffron Marigold (`Genda`)
      paintMughalOval(ctx, bx, by - 1, 3.4, 3.0, { steps: 9, fill: '#e88b1a', stroke: MUG.goldSpec, lw: 0.45, seed: 1400 + i });
      paintMughalOval(ctx, bx, by - 1, 1.5, 1.3, { steps: 6, fill: MUG.orpiment, lw: 0, seed: 1401 + i });
    } else if (kind === 3) {
      // Flame-Striped Kashmiri Tulip
      paintPointedLeafDab(ctx, bx, by + 2, 7.0, 2.6, -Math.PI * 0.5, MUG.orpiment, MUG.ruby);
      paintPointedLeafDab(ctx, bx, by + 2, 5.8, 1.5, -Math.PI * 0.62, MUG.ruby, null);
    } else {
      // Starry White Jasmine (`Chambeli`) cluster
      for (const [jx, jy] of [[-2.2, -0.6], [2.2, -0.6], [0, -2.8]]) {
        paintMughalOval(ctx, bx + jx, by + jy, 1.7, 1.6, { steps: 6, fill: '#fcf7eb', stroke: MUG.goldDeep, lw: 0.35, seed: 1500 + i });
      }
    }
  }
}

/**
 * Bakes the static 1000x1000 Mughal Imperial Folio (`Wasli` burnished paper + `bakeBrush` mineral gouache washes +
 * swirling golden Tchi clouds + Millefleurs Charbagh + Silver-Leaf Canals + Baradari Pavilion + Lapis/Afshan Hashiya).
 */
function getBakedMughalGarden(kit) {
  return kit.bake2D('s08_mughal_folio_r3', (_g, ctx, rng) => {
    // 1. Bake real Kubelka-Munk opaque mineral gouache washes via WebGL2 `p5.brush` ONCE inside `bake2D`
    //    so `brushFb.get()` never runs on steady-state cached frames!
    let brushSnap = null;
    try {
      const brushFb = kit.bakeBrush('s08_mughal_gouache_r3', (p, brush) => {
        p.background(242, 232, 208);
        brush.noStroke();

        // Dawn Lapis-Turquoise & Orpiment-Gold Mughal Sky washes (y = 54..176)
        brush.fill('#21558c', 165);
        brush.fillBleed(0.24, 'out');
        brush.fillTexture(0.52, 0.35);
        brush.rect(54, 54, 892, 68);

        brush.fill('#4fa3a5', 140);
        brush.fillBleed(0.28, 'out');
        brush.rect(54, 102, 892, 52);

        brush.fill('#ebd078', 155);
        brush.fillBleed(0.25, 'out');
        brush.rect(54, 138, 892, 42);

        // Rich Malachite & Terre-Verte Mineral Gouache `Chaman` Garden Parterre Washes
        brush.fill('#225c39', 175);
        brush.fillBleed(0.20, 'out');
        brush.fillTexture(0.58, 0.42);
        brush.rect(54, 178, 412, 184);
        brush.rect(534, 178, 412, 184);
        brush.rect(54, 414, 412, 266);
        brush.rect(534, 414, 412, 266);

        // Sunlit ochre-pistachio botanical glow spots inside the four parterres
        brush.fill('#438752', 110);
        brush.fillBleed(0.32, 'out');
        brush.circle(235, 275, 130);
        brush.circle(745, 275, 130);
        brush.circle(215, 535, 155);
        brush.circle(765, 535, 155);

        // Foreground Warm Terracotta Imperial Courtyard Wash (`y = 754..946`)
        brush.fill('#bf8b59', 155);
        brush.fillBleed(0.22, 'out');
        brush.rect(54, 754, 892, 192);

        // Delicate dry-brush `cpencil` gold & sepia mineral texture grain
        brush.noFill();
        brush.set('cpencil', '#3c6e47', 0.85);
        for (let row = 0; row < 18; row++) {
          const gy = 195 + row * 26;
          if (gy > 356 && gy < 422) continue;
          brush.line(68, gy, 452, gy + (row % 2 === 0 ? 2 : -2));
          brush.line(548, gy, 932, gy + (row % 2 === 0 ? -2 : 2));
        }
      });
      brushSnap = brushFb.get();
    } catch (_) {
      brushSnap = null;
    }

    const m = 54;
    const innerW = PANEL_SIZE - 2 * m;

    // A. Fallback mineral ground + Bridged WebGL2 `p5.brush` Gouache Washes
    ctx.fillStyle = '#efe2c4';
    ctx.fillRect(0, 0, PANEL_SIZE, PANEL_SIZE);

    const skyGrad = ctx.createLinearGradient(0, m, 0, 178);
    skyGrad.addColorStop(0, '#1d4c82');
    skyGrad.addColorStop(0.52, '#4c9da1');
    skyGrad.addColorStop(1, '#f0d57d');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(m, m, innerW, 124);

    ctx.fillStyle = '#245e3b';
    ctx.fillRect(m, 178, innerW, ROAD_EDGE_Y - 178);
    ctx.fillStyle = '#c49363';
    ctx.fillRect(m, 754, innerW, PANEL_SIZE - m - 754);

    if (brushSnap && brushSnap.canvas) {
      ctx.save();
      ctx.globalAlpha = 0.84;
      ctx.drawImage(brushSnap.canvas, 0, 0);
      ctx.restore();
    }

    // B. Agate-Burnished Layered `Wasli` Handmade Paper Laid-Lines & Fiber Specks over inner painting
    ctx.save();
    for (let y = m; y < PANEL_SIZE - m; y += 3) {
      ctx.fillStyle = y % 6 === 0 ? 'rgba(255, 248, 230, 0.05)' : 'rgba(92, 64, 32, 0.035)';
      ctx.fillRect(m, y, innerW, 1);
    }
    ctx.restore();

    // C. Swirling Persianate-Mughal Golden `Tchi` Ribbon Clouds (`Abr`) in the Azure Dawn Sky
    const drawTchiCloud = (cx, cy, sc, sd) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(sc, sc);
      const body = [[-42, 4], [-24, -6], [-8, -2], [6, -11], [24, -4], [44, 3], [26, 8], [2, 5], [-20, 9], [-42, 4]];
      paintMughalPoly(ctx, body, { fill: 'rgba(255, 246, 214, 0.84)', stroke: MUG.goldBright, lw: 1.15, seed: sd });
      drawQalamStroke(ctx, [[-42, 4], [-58, 9], [-68, 3]], { wStart: 2.2, wMid: 1.4, wEnd: 0.5, color: MUG.goldSpec, seed: sd + 1 });
      drawQalamStroke(ctx, [[42, 3], [58, 8], [70, 2]], { wStart: 2.2, wMid: 1.4, wEnd: 0.5, color: MUG.goldSpec, seed: sd + 2 });
      ctx.restore();
    };
    drawTchiCloud(178, 96, 0.95, 1601);
    drawTchiCloud(508, 84, 1.08, 1605);
    drawTchiCloud(815, 102, 0.92, 1610);

    // D. Distant Crenellated Red Sikri Sandstone Palace Garden Wall (`y = 154..180`)
    paintMughalPoly(ctx, buildRectPoly(m, 160, innerW, 20, 1620, 0.15), {
      fill: MUG.sandstone,
      stroke: MUG.goldDeep,
      lw: 0.9,
      seed: 1620,
    });
    for (let kx = m + 8; kx < PANEL_SIZE - m - 14; kx += 22) {
      paintMughalPoly(ctx, [[kx, 160], [kx, 152], [kx + 7, 150], [kx + 14, 152], [kx + 14, 160]], {
        fill: MUG.sandstoneLight,
        stroke: MUG.goldBright,
        lw: 0.7,
        seed: 1625 + kx,
      });
    }

    // E. Four `Chaman` Botanical Parterres carpeted with Jahangiri `Millefleurs` Flowering Plants!
    // Avoid pavilion footprint in upper-right quadrant (`x = 618..862, y = 178..356`) and lower-left carpet (`x = 92..348, y = 516..644`)
    drawMillefleursMeadow(ctx, 58, 184, 398, 170, rng, null);
    drawMillefleursMeadow(ctx, 542, 184, 398, 170, rng, { x: 615, y: 170, w: 250, h: 190 });
    drawMillefleursMeadow(ctx, 58, 422, 398, 250, rng, { x: 92, y: 514, w: 258, h: 132 });
    drawMillefleursMeadow(ctx, 542, 422, 398, 250, rng, null);

    // F. Cruciform Four-Part Marble Water Canals (`Charbagh`) + Oxidized Silver-Leaf (`Nuqra`) Swirling Water!
    const canalCX = 500;
    const canalCY = 388; // Safely above the Pelican's head/neck (`y = 435..680`)!
    const canalW = 68;
    const curb = 8.5;

    // White Makrana marble canal curbs + chevron-carved waterfall chutes (`Chadar`)
    paintMughalPoly(ctx, buildRectPoly(canalCX - canalW / 2 - curb, 180, canalW + curb * 2, ROAD_EDGE_Y - 180, 1701, 0.16), {
      fill: MUG.marbleHi,
      stroke: MUG.goldDeep,
      lw: 0.95,
      seed: 1701,
    });
    paintMughalPoly(ctx, buildRectPoly(m, canalCY - canalW / 2 - curb, innerW, canalW + curb * 2, 1702, 0.16), {
      fill: MUG.marbleHi,
      stroke: MUG.goldDeep,
      lw: 0.95,
      seed: 1702,
    });
    // Delicate gold-and-emerald chevron inlays along marble curbs
    for (let mx = m + 18; mx < PANEL_SIZE - m - 14; mx += 34) {
      if (Math.abs(mx - canalCX) < 76) continue;
      paintMughalPoly(ctx, [[mx, canalCY - canalW / 2 - 4.2], [mx + 5, canalCY - canalW / 2 - 1.5], [mx, canalCY - canalW / 2 + 1.0], [mx - 5, canalCY - canalW / 2 - 1.5]], {
        fill: MUG.emerald,
        lw: 0,
        seed: 1710 + mx,
      });
      paintMughalPoly(ctx, [[mx, canalCY + canalW / 2 + 4.2], [mx + 5, canalCY + canalW / 2 + 1.5], [mx, canalCY + canalW / 2 - 1.0], [mx - 5, canalCY + canalW / 2 + 1.5]], {
        fill: MUG.emerald,
        lw: 0,
        seed: 1715 + mx,
      });
    }

    // Four Tarnished Silver-Leaf Water Arms
    fillMughalSilverWater(ctx, canalCX - canalW / 2, 180, canalW, canalCY - 180 - 30, 1730);
    fillMughalSilverWater(ctx, canalCX - canalW / 2, canalCY + 30, canalW, ROAD_EDGE_Y - (canalCY + 30), 1740);
    fillMughalSilverWater(ctx, m, canalCY - canalW / 2, canalCX - m - 30, canalW, 1750);
    fillMughalSilverWater(ctx, canalCX + 30, canalCY - canalW / 2, PANEL_SIZE - m - (canalCX + 30), canalW, 1760);

    // Central Octagonal Marble Fountain Pool (`Hauz`) at `(500, 388)`
    const octR = 64;
    const octOuter = [];
    const octInner = [];
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      octOuter.push([canalCX + Math.cos(a) * octR, canalCY + Math.sin(a) * octR * 0.88]);
      octInner.push([canalCX + Math.cos(a) * (octR - 10.5), canalCY + Math.sin(a) * (octR - 10.5) * 0.88]);
    }
    paintMughalPoly(ctx, octOuter, { fill: MUG.marbleHi, stroke: MUG.goldDeep, lw: 1.15, seed: 1770 });
    paintMughalPoly(ctx, octInner, { fill: MUG.silverWater, stroke: MUG.goldBright, lw: 0.95, seed: 1771 });
    fillMughalSilverWater(ctx, canalCX - 38, canalCY - 32, 76, 64, 1775);
    // Re-stroke octagonal inner rim cleanly over rectangular clip
    drawQalamStroke(ctx, octInner, { wStart: 1.0, wMid: 1.15, wEnd: 1.0, color: MUG.goldBright, seed: 1776 });
    // Central carved lotus fountain nozzle (`Fawwara`)
    paintMughalOval(ctx, canalCX, canalCY, 11.5, 9.5, { steps: 12, fill: MUG.goldLiquid, stroke: MUG.goldSpec, lw: 0.95, seed: 1780 });
    paintMughalOval(ctx, canalCX, canalCY, 4.8, 4.0, { steps: 8, fill: MUG.ruby, stroke: MUG.goldSpec, lw: 0.65, seed: 1781 });

    // G. Upper-Quadrant Sculpted Cypress & Split-Pomegranate Pairs + Two-Story White Marble `Baradari` Pavilion
    drawCypressAndPomegranatePair(ctx, 152, 344, 0.78, 1800);
    drawCypressAndPomegranatePair(ctx, 356, 344, 0.84, 1840);
    drawMarblePavilionBase(ctx, 742, 350);

    // H. Lower-Left Courtly Silk Carpet (`Chaman` lawn) & Lower-Right Sculpted Cypress Pair
    drawPersianCarpet(ctx, 96, 520, 250, 120, '#8f1b24', '#143359', 1900);
    drawCypressAndPomegranatePair(ctx, 846, 628, 0.84, 1940);

    // Lower-left gardener's cypress at `(362, 548)` so the peeking gardener is 100% unobstructed above the rider in Bar 2!
    drawCypressAndPomegranatePair(ctx, 362, 548, 0.72, 1980);

    // I. Primary Imperial Sandstone & Marble `Girih` Star-Inlaid Walkway (`y = 680 .. 754`)
    drawGeometricInlaidWalkway(ctx);

    // J. Foreground Royal Courtyard Terrace (`y = 754 .. 946`) + Lower Courtyard Carpets & Marble Water Basin
    // Subtle octagonal sandstone paving joints
    for (let py = 782; py < 936; py += 46) {
      drawQalamStroke(ctx, [[m, py], [PANEL_SIZE - m, py]], { wStart: 0.6, wMid: 0.7, wEnd: 0.6, color: 'rgba(117, 43, 29, 0.24)', seed: 2010 + py });
    }
    drawPersianCarpet(ctx, 566, 774, 292, 128, '#175449', '#7d1822', 2050);

    // Imperial Mughal Librarian's Antique Vermilion & Lampblack `Al-Tamgha` Collector Seal in lower-left courtyard corner!
    paintMughalOval(ctx, 92, 912, 16.5, 16.5, {
      steps: 18,
      fill: 'rgba(42, 26, 22, 0.58)',
      stroke: 'rgba(158, 31, 38, 0.72)',
      lw: 1.0,
      seed: 2080,
    });
    drawQalamStroke(ctx, [[83, 913], [90, 905], [96, 915], [101, 907]], {
      wStart: 0.75,
      wMid: 1.1,
      wEnd: 0.6,
      color: 'rgba(239, 226, 196, 0.70)',
      seed: 2081,
    });

    // K. Authentic Subtle Mineral Gouache Micro-Craquelure (`矿物重彩细微龟裂纹`) over thick sky/marble areas
    for (let c = 0; c < 26; c++) {
      const cx0 = m + 30 + rng() * (innerW - 60);
      const cy0 = m + 20 + rng() * 580;
      const crack = [[cx0, cy0]];
      let px = cx0;
      let py = cy0;
      let ang = rng() * Math.PI * 2;
      for (let s = 0; s < 4; s++) {
        ang += (rng() - 0.5) * 0.9;
        px += Math.cos(ang) * (7 + rng() * 9);
        py += Math.sin(ang) * (7 + rng() * 9);
        crack.push([px, py]);
      }
      drawQalamStroke(ctx, crack, { wStart: 0.35, wMid: 0.42, wEnd: 0.3, color: 'rgba(58, 38, 22, 0.16)', seed: 2100 + c, wobble: 0.05 });
    }

    // L. Outer Crushed Lapis-Lazuli (`Lajward`) & Irregular Torn Gold-Leaf (`Afshan`) Hashiya + Top Royal `Unwan` Shamsa!
    drawHashiyaBorder(ctx, rng);

    // M. Delicate Double `Halkari` Gold Threshold Datum Marks across the outer Lapis margins at `y = 680`
    // so adjacent scenes' `y = 680` road horizon visually meets the Mughal inlaid marble curb with C1 precision!
    drawQalamStroke(ctx, [[0, ROAD_EDGE_Y], [m, ROAD_EDGE_Y]], { wStart: 1.4, wMid: 1.2, wEnd: 1.5, color: MUG.goldBright, seed: 2201, wobble: 0.05 });
    drawQalamStroke(ctx, [[PANEL_SIZE - m, ROAD_EDGE_Y], [PANEL_SIZE, ROAD_EDGE_Y]], { wStart: 1.5, wMid: 1.2, wEnd: 1.4, color: MUG.goldBright, seed: 2202, wobble: 0.05 });
  });
}


/**
 * Draws an Authentic Akbari/Jahangiri Courtier (`Taswirkhana` Portraiture):
 * - Eliminates bell-jar block torsos! Features fitted `Churidar Paijama` / cross-legged silk folds underneath
 *   a semi-translucent **Four-Pointed `Chakdar Jama`** muslin/silk robe with armpit `Band` ties,
 *   a pleated draped **`Patka` waist sash** with swaying floral brocade end-hangings, and **Two-Bone IK
 *   curved sleeves (`solveTwoBoneIK`)** with wrist `Churi` folds!
 * - Smoothly turns head from 3/4 (`nim-rukh`) courtly repose into strict Mughal side profile (`ek-chashm`)
 *   and raises an articulated pointing arm toward the riding Pelican in Bar 2!
 */
function drawMughalSpectator(ctx, spec, pelicanPos, amazement, beatPhase, localT) {
  const {
    x,
    y,
    scale = 1.0,
    jamaColor,
    jamaTranslucent = 'rgba(252, 244, 228, 0.84)',
    paijamaColor = '#d98a2b',
    turbanColor,
    sashColor,
    pose = 'kneel', // 'kneel' | 'stand' | 'balcony' | 'peek'
    prop = 'none', // 'tea' | 'sitar' | 'scroll' | 'shears' | 'balcony'
    hasHalo = false,
    defaultDir = 1,
    seed = 3000,
  } = spec;

  const dx = pelicanPos.x - x;
  const dy = pelicanPos.y - (y - 36 * scale);
  const targetDir = dx >= 0 ? 1 : -1;
  const faceDir = amazement > 0.2 ? targetDir : defaultDir;
  const turnAmt = clamp(amazement * 1.18, 0, 1);
  const bob = Math.sin(beatPhase * Math.PI * 2 + x * 0.03) * 1.3 * amazement;
  const breeze = Math.sin(localT * 3.1 + x * 0.02);

  ctx.save();
  ctx.translate(x, y + bob);
  ctx.scale(scale, scale);

  // 0. Subtle Imperial Solar Halo (`Shamsa Nimba`) behind the 2nd-floor Royal Prince
  if (hasHalo) {
    paintMughalOval(ctx, 0, -56, 20.5, 20.5, {
      steps: 22,
      fill: 'rgba(235, 208, 96, 0.20)',
      stroke: MUG.goldSpec,
      lw: 0.9,
      seed: seed + 1,
    });
  }

  // 1. Lower Body Underneath the Translucent `Chakdar Jama`:
  // Either cross-legged silk cushion knees (`kneel`) or fitted `Churidar Paijama` wrinkled silk legs (`stand` / `peek`)
  if (pose === 'kneel') {
    paintMughalOval(ctx, -12, 5, 13.5, 6.8, {
      rot: -0.14,
      steps: 12,
      fill: paijamaColor,
      stroke: MUG.qalamSepia,
      lw: 0.75,
      seed: seed + 5,
    });
    paintMughalOval(ctx, 12, 5, 13.5, 6.8, {
      rot: 0.14,
      steps: 12,
      fill: paijamaColor,
      stroke: MUG.qalamSepia,
      lw: 0.75,
      seed: seed + 6,
    });
    // Embroidered velvet `Mojari` curled-toe slippers peeking out
    paintMughalPoly(ctx, [[-6, 9], [-1, 7.5], [2, 10], [-5, 11]], { fill: MUG.crimson, stroke: MUG.goldBright, lw: 0.55, seed: seed + 7 });
  } else if (pose === 'stand' || pose === 'peek') {
    for (const lx of [-6.2, 6.2]) {
      paintMughalPoly(ctx, [[lx - 3.6, -2], [lx + 3.6, -2], [lx + 2.5, 18], [lx - 2.5, 18]], {
        fill: paijamaColor,
        stroke: MUG.qalamSepia,
        lw: 0.72,
        seed: seed + 8 + Math.round(lx),
      });
      // `Churidar` horizontal silk ankle gathers
      for (const gy of [7, 11, 15]) {
        drawQalamStroke(ctx, [[lx - 2.8, gy], [lx + 2.8, gy + 0.5]], { wStart: 0.55, wMid: 0.65, wEnd: 0.55, color: MUG.qalamCarmine, seed: seed + gy });
      }
      // Curled-toe gilded `Mojari` court shoes
      paintMughalPoly(
        ctx,
        [[lx - 2.6, 18], [lx + 2.8, 18], [lx + faceDir * 7.8, 19.5], [lx + faceDir * 8.8, 17.2], [lx + faceDir * 5.2, 21.2], [lx - 2.6, 21.2]],
        { fill: MUG.crimson, stroke: MUG.goldBright, lw: 0.65, seed: seed + 15 + Math.round(lx) }
      );
    }
  }

  // 2. Authentic Tapered Upper Torso & Flaring Four-Pointed `Chakdar Jama` Robe!
  // Inner opaque silk bodice (`Angarkha` / lining)
  const bodicePts = [
    [-12.5, -39],
    [12.5, -39],
    [9.4, -18],
    [-9.4, -18],
    [-12.5, -39],
  ];
  paintMughalPoly(ctx, bodicePts, { fill: jamaColor, stroke: MUG.qalamSepia, lw: 0.78, seed: seed + 20 });

  // Flaring Four-Pointed `Chakdar Jama` Skirt (`四尖摆纱袍` — 4 sharp pointed corner hems dipping down at sides & front!)
  const skirtHemY = pose === 'balcony' ? 1.5 : pose === 'kneel' ? 8.5 : 11.5;
  const jamaSkirtPts = [
    [-9.4, -18],
    [9.4, -18],
    [18.5, -4],
    [22.5, skirtHemY - 1.5], // Outer-right sharp point #4
    [15.5, skirtHemY - 5.5], // Arch scallop
    [9.2, skirtHemY + 2.2],  // Inner-right sharp point #3
    [0, skirtHemY - 4.2],    // Central arch scallop revealing Paijama/Patka
    [-9.2, skirtHemY + 2.2], // Inner-left sharp point #2
    [-15.5, skirtHemY - 5.5],// Arch scallop
    [-22.5, skirtHemY - 1.5],// Outer-left sharp point #1
    [-18.5, -4],
    [-9.4, -18],
  ];
  ctx.save();
  ctx.globalAlpha = jamaTranslucent ? 0.88 : 0.96;
  paintMughalPoly(ctx, jamaSkirtPts, {
    fill: jamaColor,
    stroke: MUG.qalamSepia,
    lw: 0.82,
    goldRim: 0.95,
    seed: seed + 25,
  });
  ctx.restore();

  // Delicate radiating muslin pleat folds & diagonal chest crossover `Band` ribbon ties (`Baghal-bandi`)
  for (const px of [-13, -7, 7, 13]) {
    drawQalamStroke(ctx, [[px * 0.55, -17], [px, skirtHemY - 2.5]], {
      wStart: 0.45,
      wMid: 0.62,
      wEnd: 0.4,
      color: 'rgba(43, 25, 20, 0.38)',
      seed: seed + 30 + px,
    });
  }
  // Crossover lapel + armpit silk tie cords (`Lari`)
  drawQalamStroke(ctx, [[-4 * faceDir, -39], [9.5 * faceDir, -28], [8.5 * faceDir, -18]], {
    wStart: 0.8,
    wMid: 0.95,
    wEnd: 0.75,
    color: MUG.goldBright,
    seed: seed + 40,
  });
  drawQalamStroke(ctx, [[9.5 * faceDir, -29], [12.5 * faceDir, -25], [11.5 * faceDir, -21]], {
    wStart: 0.65,
    wMid: 0.65,
    wEnd: 0.45,
    color: MUG.ruby,
    seed: seed + 41,
  });

  // 3. Pleated Draped `Patka` Waist Sash + Swaying Floral Brocade End-Panels (`Pallu`)
  paintMughalPoly(ctx, [[-10.4, -19.2], [10.4, -19.2], [11.2, -13.5], [-11.2, -13.5], [-10.4, -19.2]], {
    fill: sashColor,
    stroke: MUG.goldBright,
    lw: 0.85,
    seed: seed + 45,
  });
  drawQalamStroke(ctx, [[-10.2, -16.4], [10.2, -16.4]], { wStart: 0.65, wMid: 0.75, wEnd: 0.65, color: MUG.goldSpec, seed: seed + 46 });

  // Twin hanging `Patka` brocade panels swaying gently in the breeze
  const patkaSway = breeze * 1.6;
  for (const ox of [-2.4, 2.4]) {
    const pBot = skirtHemY - 0.5;
    paintMughalPoly(
      ctx,
      [[ox - 2.1, -13.5], [ox + 2.1, -13.5], [ox + 2.6 + patkaSway, pBot], [ox - 2.0 + patkaSway, pBot], [ox - 2.1, -13.5]],
      { fill: sashColor, stroke: MUG.goldBright, lw: 0.7, seed: seed + 50 + Math.round(ox * 10) }
    );
    // Tiny crimson poppy motif embroidered on the lower `Patka` border
    paintMughalOval(ctx, ox + patkaSway * 0.85, pBot - 3.2, 1.3, 1.5, { steps: 6, fill: MUG.rubyHi, lw: 0, seed: seed + 55 + Math.round(ox * 10) });
  }

  // 4. Two-Bone IK Curved Sleeves (`solveTwoBoneIK`) & Courtly Props!
  // Helper to paint a tapered, elbow-articulated Mughal silk sleeve + hand
  const drawCurvedIKArm = (shoulder, hand, bendDir, sleeveCol, isPointing = false, sd = 60) => {
    const elbow = solveTwoBoneIK(shoulder.x, shoulder.y, hand.x, hand.y, 13.5, 13.0, bendDir);
    // Tapered sleeve polygon around shoulder -> elbow -> wrist
    const segPts = [shoulder, elbow, hand];
    const leftSide = [];
    const rightSide = [];
    const widths = [4.2, 3.5, 2.3];
    for (let i = 0; i < 3; i++) {
      const p0 = segPts[Math.max(0, i - 1)];
      const p1 = segPts[Math.min(2, i + 1)];
      let tx = p1.x - p0.x;
      let ty = p1.y - p0.y;
      const tl = Math.hypot(tx, ty) || 1;
      tx /= tl;
      ty /= tl;
      const nx = -ty;
      const ny = tx;
      leftSide.push([segPts[i].x + nx * widths[i], segPts[i].y + ny * widths[i]]);
      rightSide.push([segPts[i].x - nx * widths[i], segPts[i].y - ny * widths[i]]);
    }
    const sleevePoly = [...leftSide, ...rightSide.reverse(), leftSide[0]];
    paintMughalPoly(ctx, sleevePoly, { fill: sleeveCol, stroke: MUG.qalamSepia, lw: 0.78, seed: sd });

    // Elbow & wrist `Churi` silk sleeve creases + gold `Zari` cuff band
    drawQalamStroke(ctx, [[elbow.x - 2.2, elbow.y - 1.2], [elbow.x + 2.2, elbow.y + 1.2]], {
      wStart: 0.5,
      wMid: 0.65,
      wEnd: 0.5,
      color: 'rgba(43, 25, 20, 0.45)',
      seed: sd + 1,
    });
    paintMughalOval(ctx, hand.x, hand.y, 2.5, 1.8, {
      rot: Math.atan2(hand.y - elbow.y, hand.x - elbow.x),
      steps: 8,
      fill: MUG.goldLiquid,
      stroke: MUG.qalamSepia,
      lw: 0.55,
      seed: sd + 2,
    });

    // Sculpted hand & extended index finger when pointing in amazement!
    const wristAng = Math.atan2(hand.y - elbow.y, hand.x - elbow.x);
    const palmX = hand.x + Math.cos(wristAng) * 2.6;
    const palmY = hand.y + Math.sin(wristAng) * 2.6;
    paintMughalOval(ctx, palmX, palmY, 2.7, 2.0, {
      rot: wristAng,
      steps: 8,
      fill: '#deb087',
      stroke: MUG.qalamSepia,
      lw: 0.62,
      seed: sd + 3,
    });
    if (isPointing) {
      const tipX = palmX + Math.cos(wristAng) * 5.2;
      const tipY = palmY + Math.sin(wristAng) * 5.2;
      drawQalamStroke(ctx, [[palmX, palmY], [tipX, tipY]], {
        wStart: 1.55,
        wMid: 1.2,
        wEnd: 0.75,
        color: '#deb087',
        seed: sd + 4,
      });
      drawQalamStroke(ctx, [[palmX, palmY - 0.6], [tipX, tipY]], {
        wStart: 0.55,
        wMid: 0.6,
        wEnd: 0.45,
        color: MUG.qalamSepia,
        seed: sd + 5,
      });
    }
  };

  // Back/Resting Arm + Prop Interaction
  const backShoulder = { x: -faceDir * 9.5, y: -36 };
  if (prop === 'tea') {
    // Minister cradling a delicate Ming blue-and-white porcelain teacup on a golden saucer!
    const cupHand = { x: -faceDir * 3.5 + faceDir * 3 * (1 - turnAmt), y: -23.5 };
    drawCurvedIKArm(backShoulder, cupHand, -faceDir, jamaColor, false, seed + 60);
    paintMughalOval(ctx, cupHand.x, cupHand.y - 1.5, 4.8, 1.5, { steps: 8, fill: MUG.goldBright, stroke: MUG.qalamSepia, lw: 0.5, seed: seed + 66 });
    paintMughalPoly(
      ctx,
      [[cupHand.x - 3.6, cupHand.y - 5.6], [cupHand.x + 3.6, cupHand.y - 5.6], [cupHand.x + 2.4, cupHand.y - 1.5], [cupHand.x - 2.4, cupHand.y - 1.5]],
      { fill: '#f5f8fc', stroke: MUG.lapisBright, lw: 0.65, seed: seed + 67 }
    );
  } else if (prop === 'sitar') {
    // Court Musician holding a double-gourd inlaid Mughal Tanpura/Sitar!
    const gourdX = -faceDir * 9.5;
    const gourdY = -5.5;
    paintMughalOval(ctx, gourdX, gourdY, 9.2, 8.0, {
      rot: -0.3 * faceDir,
      steps: 12,
      fill: '#b86825',
      stroke: MUG.goldBright,
      lw: 0.9,
      seed: seed + 70,
    });
    paintMughalOval(ctx, gourdX, gourdY, 4.2, 3.6, { steps: 9, fill: MUG.marbleHi, stroke: MUG.qalamCarmine, lw: 0.55, seed: seed + 71 });
    const neckEnd = [gourdX + faceDir * 24, gourdY - 27];
    drawQalamStroke(ctx, [[gourdX, gourdY - 2], neckEnd], { wStart: 3.4, wMid: 2.8, wEnd: 2.4, color: '#5c3114', seed: seed + 72 });
    drawQalamStroke(ctx, [[gourdX, gourdY - 2], neckEnd], { wStart: 0.7, wMid: 0.7, wEnd: 0.6, color: MUG.goldSpec, seed: seed + 73 });
    const fretHand = { x: gourdX + faceDir * 14, y: gourdY - 16 };
    drawCurvedIKArm(backShoulder, fretHand, -faceDir, jamaColor, false, seed + 75);
  } else if (prop === 'scroll') {
    // Chronicler holding a gilded Imperial `Muraqqa` album / scroll
    const scrollHand = { x: -faceDir * 6.5, y: -21 };
    drawCurvedIKArm(backShoulder, scrollHand, -faceDir, jamaColor, false, seed + 80);
    paintMughalPoly(
      ctx,
      [[scrollHand.x - 6, scrollHand.y - 5], [scrollHand.x + 7, scrollHand.y - 8], [scrollHand.x + 9, scrollHand.y + 2], [scrollHand.x - 4, scrollHand.y + 5]],
      { fill: '#f7ebd2', stroke: MUG.goldDeep, lw: 0.8, seed: seed + 86 }
    );
    drawQalamStroke(ctx, [[scrollHand.x - 2, scrollHand.y - 2], [scrollHand.x + 5, scrollHand.y - 4]], {
      wStart: 0.6,
      wMid: 0.7,
      wEnd: 0.5,
      color: MUG.crimson,
      seed: seed + 87,
    });
  } else {
    const restHand = { x: -faceDir * 8.5, y: -19 };
    drawCurvedIKArm(backShoulder, restHand, -faceDir, jamaColor, false, seed + 90);
  }

  // Active Front Arm: Idle courtly gesture in Bar 1 -> Smoothly raises & points toward the Pelican in Bar 2!
  const frontShoulder = { x: faceDir * 8.8, y: -36 };
  const aimAngle = clamp(Math.atan2(dy, Math.abs(dx)), -0.78, 0.52);
  let idleHand = { x: faceDir * 6.5, y: -20.5 };
  if (prop === 'sitar') {
    const strum = Math.sin(localT * 9.5) * 2.4 * (1 - turnAmt);
    idleHand = { x: -faceDir * 3.5 + strum, y: -10.5 };
  } else if (prop === 'shears') {
    idleHand = { x: faceDir * 10.5, y: -22 };
  }
  const pointHand = {
    x: faceDir * (8.5 + Math.cos(aimAngle) * 16.5),
    y: -35 + Math.sin(aimAngle) * 16.5,
  };
  const activeHand = {
    x: lerp(idleHand.x, pointHand.x, turnAmt),
    y: lerp(idleHand.y, pointHand.y, turnAmt),
  };
  drawCurvedIKArm(frontShoulder, activeHand, faceDir, jamaColor, turnAmt > 0.35, seed + 100);

  // 5. Sculpted Mughal Portrait Head (`Nim-rukh` 3/4 -> `Ek-chashm` Pure Side Profile, ZERO `ctx.arc`!)
  ctx.save();
  ctx.translate(0, -49.5);
  // Subtle neck column with pearl strand
  paintMughalPoly(ctx, [[-3.6, 5], [3.6, 5], [4.2, 11], [-4.2, 11]], {
    fill: '#d6a47a',
    stroke: MUG.qalamSepia,
    lw: 0.65,
    seed: seed + 110,
  });
  drawQalamStroke(ctx, [[-4.2, 9.8], [0, 11.2], [4.2, 9.8]], { wStart: 1.1, wMid: 1.3, wEnd: 1.1, color: '#fcf7eb', seed: seed + 111 });

  // Sculpted cranial & jawline profile polygon morphing smoothly with `turnAmt`
  const noseProj = lerp(2.6, 5.4, turnAmt);
  const headPts = [
    [0, -9.2],
    [faceDir * 6.8, -7.8],
    [faceDir * 8.2, -3.2], // Forehead (`Peshani`)
    [faceDir * (7.8 + noseProj), 0.8], // Aquiline Mughal nose tip!
    [faceDir * 8.0, 2.4], // Upper lip philtrum
    [faceDir * 7.6, 4.8], // Sculpted chin
    [faceDir * 2.2, 7.6], // Jawline
    [-faceDir * 6.4, 5.8], // Nape
    [-faceDir * 8.2, -1.5], // Occiput
    [-faceDir * 5.8, -7.6],
    [0, -9.2],
  ];
  paintMughalPoly(ctx, headPts, { fill: '#e0b187', stroke: MUG.qalamSepia, lw: 0.82, seed: seed + 115 });
  // `Pardaz` soft carmine-sepia stipple shading on cheek & jaw!
  paintPardazStipple(ctx, faceDir * 2.2, 2.2, 3.8, 3.4, 14, MUG.qalamCarmine, 0.16, seed + 116);

  // Large Almond Kohl-Rimmed Mughal Eye (`Ek-chashm` signature!) + Arched Eyebrow
  const eyeX = faceDir * lerp(2.8, 4.2, turnAmt);
  const eyeY = -1.4;
  paintMughalOval(ctx, eyeX, eyeY, 2.6, 1.35, {
    steps: 8,
    fill: '#ffffff',
    stroke: '#170d0a',
    lw: 0.72,
    seed: seed + 120,
  });
  paintMughalOval(ctx, eyeX + faceDir * 0.75, eyeY, 1.05, 1.05, { steps: 6, fill: '#170d0a', lw: 0, seed: seed + 121 });
  drawQalamStroke(ctx, [[eyeX - faceDir * 3.0, eyeY - 2.3], [eyeX, eyeY - 3.1], [eyeX + faceDir * 2.6, eyeY - 2.1]], {
    wStart: 0.55,
    wMid: 0.9,
    wEnd: 0.45,
    color: '#170d0a',
    seed: seed + 122,
  });

  // In 3/4 view (`turnAmt < 0.45`), show hint of far eye fading away as head turns into strict profile
  if (turnAmt < 0.45) {
    ctx.save();
    ctx.globalAlpha = (0.45 - turnAmt) * 1.9;
    paintMughalOval(ctx, -faceDir * 2.6, eyeY, 1.8, 1.05, { steps: 7, fill: '#ffffff', stroke: '#170d0a', lw: 0.6, seed: seed + 125 });
    paintMughalOval(ctx, -faceDir * 2.2, eyeY, 0.8, 0.8, { steps: 6, fill: '#170d0a', lw: 0, seed: seed + 126 });
    ctx.restore();
  }

  // Upturned Akbari/Jahangiri courtly mustache & pearl-emerald ear hoop (`Bala`)
  drawQalamStroke(ctx, [[faceDir * 4.4, 3.0], [faceDir * 7.8, 2.7], [faceDir * 2.2, 2.2]], {
    wStart: 0.5,
    wMid: 0.95,
    wEnd: 0.45,
    color: '#1f120e',
    seed: seed + 130,
  });
  const earX = -faceDir * 1.5;
  paintMughalOval(ctx, earX, 2.8, 1.4, 1.4, { steps: 6, fill: '#fcf7eb', stroke: MUG.goldDeep, lw: 0.45, seed: seed + 132 });
  paintMughalOval(ctx, earX, 4.8, 1.1, 1.3, { steps: 6, fill: MUG.ruby, lw: 0, seed: seed + 133 });

  // Wrapped Multi-Fold Imperial Silk `Pagri` Turban + Jeweled `Sarpech` & Swaying Black Heron Plume (`Kalgi`)
  const turbPts = [
    [-10.2, -2.5],
    [-11.2, -8.5],
    [-5.5, -14.2],
    [3.5, -14.8],
    [10.2, -10.5],
    [10.8, -4.2],
    [5.2, -3.5],
    [-2.5, -4.8],
    [-7.8, -0.5],
    [-10.2, -2.5],
  ];
  paintMughalPoly(ctx, turbPts, { fill: turbanColor, stroke: MUG.qalamSepia, lw: 0.85, goldRim: 0.85, seed: seed + 140 });
  // Diagonal gold brocade turban cross-band (`pech`)
  drawQalamStroke(ctx, [[-8.5, -5.2], [0, -11.5], [8.8, -7.2]], { wStart: 1.2, wMid: 1.5, wEnd: 1.1, color: MUG.goldBright, seed: seed + 142 });
  drawQalamStroke(ctx, [[-6.2, -11.5], [4.5, -5.8]], { wStart: 0.7, wMid: 0.85, wEnd: 0.7, color: 'rgba(43, 25, 20, 0.42)', seed: seed + 143 });

  // Ruby & Gold `Sarpech` Ornament + Trembling Heron Plume (`Kalgi`)
  const sx = faceDir * 6.8;
  const sy = -11.5;
  paintMughalPoly(ctx, [[sx, sy - 4.2], [sx + 2.8, sy], [sx, sy + 3.2], [sx - 2.8, sy], [sx, sy - 4.2]], {
    fill: MUG.ruby,
    stroke: MUG.goldSpec,
    lw: 0.75,
    seed: seed + 146,
  });
  const plumeSway = breeze * 1.8;
  drawQalamStroke(
    ctx,
    [[sx, sy - 3.5], [sx - faceDir * 3.5 + plumeSway * 0.5, sy - 11.5], [sx - faceDir * 9.2 + plumeSway, sy - 14.2]],
    { wStart: 2.1, wMid: 1.5, wEnd: 0.45, color: '#1b1514', seed: seed + 148 }
  );
  drawQalamStroke(
    ctx,
    [[sx, sy - 3.5], [sx - faceDir * 3.5 + plumeSway * 0.5, sy - 11.5]],
    { wStart: 0.75, wMid: 0.55, wEnd: 0.35, color: MUG.goldSpec, seed: seed + 149 }
  );

  ctx.restore();
  ctx.restore();
}

/**
 * Draws a `Kundan` Gold-Bezel-Set Ruby, Emerald, or Sapphire Cabochon Gem (zero `ctx.arc`!).
 */
function drawKundanGem(ctx, x, y, r, color = MUG.ruby, seed = 4000) {
  paintMughalOval(ctx, x, y, r + 1.5, r + 1.4, { steps: 10, fill: MUG.goldBright, stroke: MUG.goldDeep, lw: 0.65, seed });
  paintMughalOval(ctx, x, y, r, r * 0.95, { steps: 9, fill: color, stroke: MUG.goldSpec, lw: 0.45, seed: seed + 1 });
  paintMughalOval(ctx, x - r * 0.3, y - r * 0.3, r * 0.34, r * 0.28, { steps: 6, fill: 'rgba(255,255,255,0.78)', lw: 0, seed: seed + 2 });
}

/**
 * Abolishes straight modern welded steel tubes!
 * Draws an Imperial `Karkhana` Carved Mughal Celadon-Nephrite Jade (`Yashm`) or Blued Damascus Steel (`Faulad`)
 * Curved Scroll Tube inlaid with `Koftgari` Gold-Wire Arabesques & Lotus-Petal Lug Collars!
 */
function drawJadeAndKoftgariCurvedTube(ctx, p1, p2, bow = 8, width = 7.2, isJade = true, seed = 4100) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  // Sample graceful S-curve / arch centerline
  const steps = 12;
  const center = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const arch = Math.sin(u * Math.PI) * bow + Math.sin(u * Math.PI * 2) * (bow * 0.28);
    center.push([lerp(p1.x, p2.x, u) + nx * arch, lerp(p1.y, p2.y, u) + ny * arch]);
  }

  // Outer burnished gold `Halkari` casing
  drawQalamStroke(ctx, center, {
    wStart: width + 2.6,
    wMid: width + 3.2,
    wEnd: width + 2.6,
    color: MUG.goldBright,
    seed,
    wobble: 0.06,
  });
  // Carved celadon nephrite jade (`Yashm`) or blued Damascus steel (`Faulad`) core
  drawQalamStroke(ctx, center, {
    wStart: width,
    wMid: width + 0.6,
    wEnd: width,
    color: isJade ? MUG.jadeMid : '#16283d',
    seed: seed + 1,
    wobble: 0.05,
  });
  // Translucent mutton-fat jade inner highlight spine
  if (isJade) {
    drawQalamStroke(ctx, center, {
      wStart: width * 0.34,
      wMid: width * 0.42,
      wEnd: width * 0.34,
      color: MUG.jadePale,
      seed: seed + 2,
      wobble: 0.04,
    });
  }

  // Scrolling `Koftgari` gold-wire arabesque vine & tiny ruby inlays along the curved tube!
  const vine = center.map(([cx, cy], idx) => {
    const u = idx / steps;
    const wave = Math.sin(u * Math.PI * 5) * (width * 0.32);
    return [cx + nx * wave, cy + ny * wave];
  });
  drawQalamStroke(ctx, vine, { wStart: 0.85, wMid: 1.05, wEnd: 0.85, color: MUG.goldSpec, seed: seed + 3, wobble: 0.04 });

  // Gilded lotus-bud lug collars at both tube joints
  for (const [ep, sd] of [[p1, 10], [p2, 20]]) {
    paintMughalOval(ctx, ep.x, ep.y, width * 0.72, width * 0.72, {
      steps: 10,
      fill: MUG.goldLiquid,
      stroke: MUG.qalamSepia,
      lw: 0.65,
      seed: seed + sd,
    });
  }
}

/**
 * Abolishes `ctx.arc` & wire spokes!
 * Draws a 16-Petal Jaipur `Meenakari` Polychrome Enamel (Ruby / Emerald / Lapis) & Gold Filigree Lotus-Mandala Wheel!
 */
function drawMeenakariLotusWheel(ctx, c, r, rot, seed = 4300) {
  // Draw outer tire & gold rim using `evenodd` polygon annuli so the Charbagh garden & inlaid walkway shine cleanly between the 16 lotus spokes!
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(rot);

  const ringAnnulus = (rOut, rIn, fillCol, strokeOut, lwOut, sd) => {
    const outer = buildOvalPoly(0, 0, rOut, rOut, 0, 30, sd, 0.012);
    const inner = buildOvalPoly(0, 0, rIn, rIn, 0, 30, sd + 1, 0.012);
    ctx.save();
    ctx.fillStyle = fillCol;
    ctx.beginPath();
    ctx.moveTo(outer[0][0], outer[0][1]);
    for (let i = 1; i < outer.length; i++) ctx.lineTo(outer[i][0], outer[i][1]);
    ctx.closePath();
    ctx.moveTo(inner[0][0], inner[0][1]);
    for (let i = 1; i < inner.length; i++) ctx.lineTo(inner[i][0], inner[i][1]);
    ctx.closePath();
    ctx.fill('evenodd');
    ctx.restore();
    if (lwOut > 0) {
      drawQalamStroke(ctx, outer, { wStart: lwOut, wMid: lwOut, wEnd: lwOut, color: strokeOut, seed: sd + 2, wobble: 0.06 });
      drawQalamStroke(ctx, inner, { wStart: lwOut * 0.85, wMid: lwOut * 0.85, wEnd: lwOut * 0.85, color: MUG.goldSpec, seed: sd + 3, wobble: 0.06 });
    }
  };

  // 16 Radiating `Meenakari` Enamel Lotus-Petal Filigree Spokes + Scalloped Inner Ring!
  const petals = 16;
  const innerRimR = r - 7.0;
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    ctx.save();
    ctx.rotate(a);
    const enamelCol = i % 2 === 0 ? MUG.crimson : i % 4 === 1 ? MUG.emerald : MUG.lapisBright;
    // Graceful pointed lotus-arch spoke from hub (`13px`) to inner rim (`innerRimR`)
    const spokePoly = [
      [12, -1.5],
      [r * 0.48, -4.1],
      [innerRimR - 2, -2.0],
      [innerRimR + 0.5, 0],
      [innerRimR - 2, 2.0],
      [r * 0.48, 4.1],
      [12, 1.5],
      [12, -1.5],
    ];
    paintMughalPoly(ctx, spokePoly, {
      fill: enamelCol,
      stroke: MUG.goldBright,
      lw: 0.9,
      seed: seed + 10 + i,
    });
    // Gold central spine + ruby/pearl bead on rim join
    drawQalamStroke(ctx, [[13, 0], [innerRimR - 2, 0]], { wStart: 0.7, wMid: 0.8, wEnd: 0.55, color: MUG.goldSpec, seed: seed + 30 + i, wobble: 0.04 });
    ctx.restore();
  }

  // Outer dark buffalo-hide tire annulus + `Meenakari` gold rim annulus with 16 jewel studs!
  ringAnnulus(r + 3.4, r - 1.2, '#241815', MUG.qalamSepia, 0.9, seed + 60);
  ringAnnulus(r - 1.2, innerRimR, MUG.goldLiquid, MUG.goldSpec, 0.95, seed + 70);
  for (let i = 0; i < petals; i++) {
    const a = ((i + 0.5) / petals) * Math.PI * 2;
    const jx = Math.cos(a) * (r - 4.1);
    const jy = Math.sin(a) * (r - 4.1);
    paintMughalOval(ctx, jx, jy, 1.7, 1.7, {
      steps: 7,
      fill: i % 2 === 0 ? MUG.ruby : MUG.emeraldBright,
      stroke: MUG.goldSpec,
      lw: 0.4,
      seed: seed + 80 + i,
    });
  }

  // Central `Shamsa` Sunburst Hub Boss (`Kundan` ruby + 8 gold petals)
  paintMughalOval(ctx, 0, 0, 13.5, 13.5, { steps: 16, fill: MUG.goldLiquid, stroke: MUG.goldSpec, lw: 1.0, seed: seed + 100 });
  paintMughalOval(ctx, 0, 0, 8.8, 8.8, { steps: 12, fill: MUG.lapisMid, stroke: MUG.goldBright, lw: 0.8, seed: seed + 101 });
  drawKundanGem(ctx, 0, 0, 4.2, MUG.ruby, seed + 102);

  ctx.restore();
}

/**
 * Draws an Articulated Chain of Individual Oval Gold Links (`Zanjir` — ZERO `setLineDash`!).
 */
function drawArticulatedGoldChain(ctx, p1, p2, phaseOffset = 0, seed = 4500) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const dist = Math.hypot(dx, dy) || 1;
  const ang = Math.atan2(dy, dx);
  const linkStep = 6.2;
  const count = Math.floor(dist / linkStep);
  const shift = ((phaseOffset % 1) + 1) % 1;

  for (let i = 0; i < count; i++) {
    const u = (i + shift) / count;
    if (u <= 0.02 || u >= 0.98) continue;
    const sag = Math.sin(u * Math.PI) * 1.8;
    const lx = lerp(p1.x, p2.x, u);
    const ly = lerp(p1.y, p2.y, u) + sag;
    paintMughalOval(ctx, lx, ly, 2.9, 1.55, {
      rot: ang,
      steps: 8,
      fill: i % 2 === 0 ? MUG.goldBright : MUG.goldLiquid,
      stroke: MUG.qalamSepia,
      lw: 0.52,
      seed: seed + i,
    });
  }
}

/**
 * Draws the Ustad Mansur Naturalist Imperial Pelican (`Jahangir-nama` Avian Portraiture) &
 * the `Karkhana` Carved Mughal Jade, Damascus `Koftgari` & Peacock-Prow Curio Bicycle!
 * - ZERO sticker outline halo, ZERO `ctx.arc`, ZERO `setLineDash`, ZERO `createRadialGradient`!
 */
function drawMughalImperialPelicanAndBike(ctx, rig, localT, beatPhase) {
  ctx.save();
  const pendulumLag = Math.sin(beatPhase * Math.PI * 2 - 0.85);
  const wRadius = rig.rearWheel.r;
  const wRot = rig.wheelAngle;

  // 1. Hand-stippled Ground Contact Shadows on the Sandstone/Marble `Girih` Walkway (`y = 680`)
  paintMughalOval(ctx, rig.rearWheel.x, rig.rearWheel.y + wRadius + 2.5, wRadius * 0.92, 6.2, {
    steps: 16,
    fill: 'rgba(54, 21, 15, 0.30)',
    lw: 0,
    seed: 5001,
  });
  paintMughalOval(ctx, rig.frontWheel.x, rig.frontWheel.y + wRadius + 2.5, wRadius * 0.92, 6.2, {
    steps: 16,
    fill: 'rgba(54, 21, 15, 0.30)',
    lw: 0,
    seed: 5002,
  });
  paintMughalOval(ctx, (rig.rearWheel.x + rig.frontWheel.x) * 0.5, ROAD_EDGE_Y + 4.5, 68, 5.2, {
    steps: 16,
    fill: 'rgba(54, 21, 15, 0.18)',
    lw: 0,
    seed: 5003,
  });

  // 2. 16-Petal Jaipur `Meenakari` Enamel & Gold Filigree Lotus Wheels
  drawMeenakariLotusWheel(ctx, rig.rearWheel, wRadius, wRot, 5100);
  drawMeenakariLotusWheel(ctx, rig.frontWheel, wRadius, wRot, 5200);

  // 3. Far Leg & Far Foot wearing a Royal Pearl-and-Gold Anklet (`Payal`) + Far Crank
  const drawPelicanLeg = (hip, knee, foot, isFar, sd) => {
    const legCol = isFar ? '#ba6524' : '#e08834';
    drawQalamStroke(ctx, [[hip.x, hip.y], [knee.x, knee.y]], { wStart: 8.6, wMid: 7.4, wEnd: 6.2, color: legCol, seed: sd });
    drawQalamStroke(ctx, [[hip.x, hip.y], [knee.x, knee.y]], { wStart: 0.85, wMid: 0.9, wEnd: 0.8, color: MUG.qalamCarmine, seed: sd + 1 });
    drawQalamStroke(ctx, [[knee.x, knee.y], [foot.x, foot.y]], { wStart: 6.0, wMid: 5.2, wEnd: 4.4, color: legCol, seed: sd + 2 });
    drawQalamStroke(ctx, [[knee.x, knee.y], [foot.x, foot.y]], { wStart: 0.8, wMid: 0.85, wEnd: 0.75, color: MUG.qalamCarmine, seed: sd + 3 });

    // Royal Gold & Pearl Anklet (`Payal`) above webbed foot
    const ankX = lerp(knee.x, foot.x, 0.82);
    const ankY = lerp(knee.y, foot.y, 0.82);
    paintMughalOval(ctx, ankX, ankY, 4.6, 2.2, { steps: 9, fill: MUG.goldBright, stroke: MUG.ruby, lw: 0.6, seed: sd + 4 });

    // Sculpted 3-toed webbed avian foot on gilded lotus pedal
    const webbed = [
      [foot.x - 5, foot.y - 1.5],
      [foot.x + 16, foot.y - 2.8],
      [foot.x + 19, foot.y + 1.2],
      [foot.x + 14, foot.y + 4.5],
      [foot.x - 6, foot.y + 3.2],
      [foot.x - 5, foot.y - 1.5],
    ];
    paintMughalPoly(ctx, webbed, { fill: legCol, stroke: MUG.qalamCarmine, lw: 0.8, goldRim: 0.7, seed: sd + 5 });
    paintMughalPoly(ctx, buildRectPoly(foot.x - 9, foot.y + 2.8, 22, 4.2, sd + 6, 0.1), {
      fill: MUG.goldLiquid,
      stroke: MUG.qalamSepia,
      lw: 0.65,
      seed: sd + 6,
    });
  };

  drawQalamStroke(ctx, [[rig.bb.x, rig.bb.y], [rig.leftPedal.x, rig.leftPedal.y]], {
    wStart: 4.8,
    wMid: 4.2,
    wEnd: 3.6,
    color: MUG.goldDeep,
    seed: 5300,
  });
  drawPelicanLeg(rig.leftHip, rig.leftKnee, rig.leftFoot, true, 5310);

  // 4. Imperial `Karkhana` Carved Celadon-Jade (`Yashm`) & Blued Damascus `Koftgari` Scrollwork Frame!
  const { seatCluster, headTop, headBot, stemTop, handleGrip } = rig;
  // Graceful S-arched carved nephrite jade top scroll & lower scroll + blued Damascus steel stays!
  drawJadeAndKoftgariCurvedTube(ctx, rig.rearWheel, seatCluster, -9.5, 6.2, false, 5401);
  drawJadeAndKoftgariCurvedTube(ctx, rig.rearWheel, rig.bb, 7.5, 6.2, false, 5410);
  drawJadeAndKoftgariCurvedTube(ctx, rig.bb, seatCluster, -5.5, 7.4, true, 5420);
  drawJadeAndKoftgariCurvedTube(ctx, rig.bb, headBot, 11.5, 7.8, true, 5430);
  drawJadeAndKoftgariCurvedTube(ctx, seatCluster, headTop, -12.5, 7.6, true, 5440);
  drawJadeAndKoftgariCurvedTube(ctx, headTop, headBot, 2.0, 8.2, false, 5450);
  // Curved Mughal sword-blade front fork (`Shamshir` curve)
  drawJadeAndKoftgariCurvedTube(ctx, headBot, rig.frontWheel, 9.2, 6.8, true, 5460);

  // Sculpted Golden Royal Peacock-Neck & Crowned Peacock-Head Finial (`Mayura`) rising from Handlebar Stem!
  drawJadeAndKoftgariCurvedTube(ctx, headTop, stemTop, -3.0, 5.6, false, 5470);
  // Graceful Peacock prow curving forward from `stemTop`
  const pkNeck = [
    [stemTop.x + 2, stemTop.y + 2],
    [stemTop.x + 13, stemTop.y - 5],
    [stemTop.x + 17, stemTop.y - 15],
    [stemTop.x + 12, stemTop.y - 22],
  ];
  drawQalamStroke(ctx, pkNeck, { wStart: 6.8, wMid: 5.2, wEnd: 4.2, color: MUG.goldBright, seed: 5475 });
  drawQalamStroke(ctx, pkNeck, { wStart: 4.4, wMid: 3.2, wEnd: 2.6, color: MUG.peacock, seed: 5476 });
  paintMughalOval(ctx, stemTop.x + 13, stemTop.y - 22.5, 5.2, 3.8, {
    steps: 10,
    fill: MUG.peacock,
    stroke: MUG.goldSpec,
    lw: 0.85,
    seed: 5477,
  });
  paintMughalPoly(ctx, [[stemTop.x + 17.5, stemTop.y - 23.5], [stemTop.x + 23.5, stemTop.y - 21.5], [stemTop.x + 17.5, stemTop.y - 20.5]], {
    fill: MUG.goldSpec,
    stroke: MUG.qalamSepia,
    lw: 0.55,
    seed: 5478,
  });
  paintMughalOval(ctx, stemTop.x + 14.2, stemTop.y - 23.0, 1.1, 1.1, { steps: 6, fill: MUG.rubyHi, lw: 0, seed: 5479 });
  // Three tiny golden peacock crest plumes!
  for (const ca of [-0.45, 0, 0.45]) {
    const cx2 = stemTop.x + 11 + Math.sin(ca) * 5;
    const cy2 = stemTop.y - 29.5 + Math.abs(ca) * 2;
    drawQalamStroke(ctx, [[stemTop.x + 11.5, stemTop.y - 25], [cx2, cy2]], { wStart: 0.65, wMid: 0.6, wEnd: 0.5, color: MUG.goldSpec, seed: 5480 + Math.round(ca * 10) });
    paintMughalOval(ctx, cx2, cy2, 1.4, 1.4, { steps: 6, fill: MUG.emeraldBright, stroke: MUG.goldSpec, lw: 0.35, seed: 5485 + Math.round(ca * 10) });
  }
  // Swept Mughal Jade-Grip Handlebar
  drawQalamStroke(ctx, [[stemTop.x + 2, stemTop.y], [handleGrip.x + 6, handleGrip.y - 2], [handleGrip.x - 5, handleGrip.y + 1]], {
    wStart: 4.8,
    wMid: 4.4,
    wEnd: 5.6,
    color: MUG.goldBright,
    seed: 5490,
  });
  drawKundanGem(ctx, handleGrip.x - 5, handleGrip.y + 1, 3.2, MUG.emeraldBright, 5492);

  // `Kundan` Rubies & Sapphires at Frame Lug Clusters
  drawKundanGem(ctx, seatCluster.x, seatCluster.y, 4.2, MUG.ruby, 5495);
  drawKundanGem(ctx, headTop.x, headTop.y, 3.8, MUG.lapisBright, 5498);
  drawKundanGem(ctx, headBot.x, headBot.y, 3.8, MUG.emeraldBright, 5501);

  // Individually Articulated Oval Gold Chain Links (`Zanjir`) + Pierced Lotus Gold Chainring!
  drawArticulatedGoldChain(
    ctx,
    { x: rig.rearWheel.x, y: rig.rearWheel.y - 9.5 },
    { x: rig.bb.x, y: rig.bb.y - 16.5 },
    wRot * 1.8,
    5510
  );
  drawArticulatedGoldChain(
    ctx,
    { x: rig.rearWheel.x, y: rig.rearWheel.y + 9.5 },
    { x: rig.bb.x, y: rig.bb.y + 16.5 },
    -wRot * 1.8,
    5540
  );
  paintMughalOval(ctx, rig.bb.x, rig.bb.y, 17.5, 17.5, {
    steps: 20,
    fill: MUG.goldLiquid,
    stroke: MUG.goldSpec,
    lw: 1.0,
    seed: 5570,
  });
  for (let k = 0; k < 8; k++) {
    const ka = rig.pedalAngle + (k / 8) * Math.PI * 2;
    paintMughalOval(ctx, rig.bb.x + Math.cos(ka) * 10.5, rig.bb.y + Math.sin(ka) * 10.5, 3.0, 2.2, {
      rot: ka,
      steps: 7,
      fill: k % 2 === 0 ? MUG.crimson : MUG.lapisMid,
      stroke: MUG.goldSpec,
      lw: 0.45,
      seed: 5575 + k,
    });
  }
  drawKundanGem(ctx, rig.bb.x, rig.bb.y, 4.8, MUG.ruby, 5590);

  // Crimson Velvet `Zari` Royal Saddlecloth (`Zin-posh`) with Pendulum-Swaying Gold Silk Tassels!
  const sx = rig.saddle.x;
  const sy = rig.saddle.y;
  paintMughalPoly(
    ctx,
    [[sx - 25, sy + 1], [sx + 19, sy - 3], [sx + 16, sy + 14], [sx - 2, sy + 19], [sx - 27, sy + 15], [sx - 25, sy + 1]],
    { fill: MUG.crimson, stroke: MUG.goldBright, lw: 1.05, seed: 5600 }
  );
  // Embroidered gold lotus on saddlecloth corner + 4 swaying silk tassels
  paintMughalOval(ctx, sx - 12, sy + 9, 4.2, 3.2, { steps: 8, fill: MUG.goldLiquid, stroke: MUG.goldSpec, lw: 0.55, seed: 5601 });
  for (let t = -2; t <= 1; t++) {
    const tx = sx - 8 + t * 8.5;
    const ty = sy + 15.5;
    const tShift = pendulumLag * 3.2;
    drawQalamStroke(ctx, [[tx, ty], [tx - 2.5 + tShift, ty + 9.5]], {
      wStart: 1.4,
      wMid: 2.1,
      wEnd: 2.8,
      color: MUG.goldBright,
      seed: 5610 + t,
    });
    paintMughalOval(ctx, tx, ty, 1.3, 1.3, { steps: 6, fill: '#fcf7eb', lw: 0, seed: 5615 + t });
  }

  // 5. Ustad Mansur Naturalist Imperial Pelican (`Jahangir-nama` Court Study)!
  const bRx = rig.bodyCenter.rx;
  const bRy = rig.bodyCenter.ry;
  ctx.save();
  ctx.translate(rig.bodyCenter.x, rig.bodyCenter.y);
  ctx.rotate(rig.bodyCenter.tilt);

  // Layered Pointed Tail Rectrices with `Halkari` Liquid-Gold Rachis Spines & Indigo-Sepia Tips
  for (let t = 0; t < 5; t++) {
    const ty = -7 + t * 5.2;
    const tailPts = [
      [-bRx + 10, ty - 2],
      [-bRx - 26 - (2 - Math.abs(t - 2)) * 6, ty - 6 + t * 2.2],
      [-bRx - 19, ty + 3.5],
      [-bRx + 10, ty + 2.5],
    ];
    paintMughalPoly(ctx, tailPts, {
      fill: t % 2 === 0 ? '#faf2df' : '#efe1c5',
      stroke: MUG.qalamSoft,
      lw: 0.72,
      goldRim: 0.65,
      seed: 5700 + t,
    });
    // Dark sepia-indigo primary tip accent (`Ustad Mansur` naturalist detail!)
    paintPointedLeafDab(ctx, -bRx - 16, ty - 2 + t * 1.1, 11, 2.2, Math.PI * 0.96, '#2b2420', MUG.goldLiquid);
  }

  // Sculpted Anatomical Avian Torso (28-point organic contour, warm parchment gouache + `Pardaz` micro-stipple volume!)
  const torsoPts = buildOvalPoly(0, 0, bRx, bRy, 0, 28, 5720, 0.018);
  paintMughalPoly(ctx, torsoPts, {
    fill: '#fcf5e6',
    stroke: MUG.qalamSoft,
    lw: 0.85,
    goldRim: 0.95, // Subtle `Halkari` burnished gold rim-light instead of sticker border!
    seed: 5720,
  });
  // Soft warm buff belly shadow + `Pardaz` micro-stippling for round 3D avian volume!
  paintPardazStipple(ctx, -4, bRy * 0.42, bRx * 0.78, bRy * 0.38, 68, '#8c6642', 0.20, 5722);
  paintPardazStipple(ctx, 8, -bRy * 0.36, bRx * 0.58, bRy * 0.25, 36, MUG.goldLiquid, 0.16, 5723);

  // Ornamental Mughal Court Brocade Back-Mantle (`Jhul`) with Emerald, Ruby & Gold Arabesque Trim!
  const jhulPts = [
    [-26, -bRy + 5],
    [18, -bRy + 3],
    [22, -4],
    [-4, 5],
    [-29, -4],
    [-26, -bRy + 5],
  ];
  paintMughalPoly(ctx, jhulPts, { fill: MUG.peacock, stroke: MUG.goldSpec, lw: 0.95, seed: 5730 });
  paintMughalPoly(
    ctx,
    [[-21, -bRy + 8], [13, -bRy + 6], [16, -6], [-4, 1], [-23, -6], [-21, -bRy + 8]],
    { fill: MUG.crimson, stroke: MUG.goldBright, lw: 0.75, seed: 5731 }
  );
  drawKundanGem(ctx, -4, -12, 3.6, MUG.goldSpec, 5732);

  ctx.restore();

  // 6. Near Crank & Near Royal-Anklet Leg (pedaling cleanly in front of frame!)
  drawQalamStroke(ctx, [[rig.bb.x, rig.bb.y], [rig.rightPedal.x, rig.rightPedal.y]], {
    wStart: 5.2,
    wMid: 4.5,
    wEnd: 3.8,
    color: MUG.goldSpec,
    seed: 5750,
  });
  drawQalamStroke(ctx, [[rig.bb.x, rig.bb.y], [rig.rightPedal.x, rig.rightPedal.y]], {
    wStart: 0.75,
    wMid: 0.75,
    wEnd: 0.65,
    color: MUG.qalamSepia,
    seed: 5751,
  });
  drawPelicanLeg(rig.rightHip, rig.rightKnee, rig.rightFoot, false, 5760);

  // 7. Sculpted Anatomical S-Curved Neck, Swaying Basra-Pearl & Spinel `Mala` Garlands, Head, Turban & Beak!
  const [n0, n1, n2, n3] = [rig.chest, rig.neckC1, rig.neckC2, rig.head];
  // Sample cubic Bezier neck spine (`16` points) and build smooth anatomical variable-width neck polygon!
  const neckLeft = [];
  const neckRight = [];
  const neckSamples = 16;
  for (let i = 0; i <= neckSamples; i++) {
    const t = i / neckSamples;
    const mt = 1 - t;
    const px = mt * mt * mt * n0.x + 3 * mt * mt * t * n1.x + 3 * mt * t * t * n2.x + t * t * t * n3.x;
    const py = mt * mt * mt * n0.y + 3 * mt * mt * t * n1.y + 3 * mt * t * t * n2.y + t * t * t * n3.y;
    const dt = 0.04;
    const tA = Math.max(0, t - dt);
    const tB = Math.min(1, t + dt);
    const mtA = 1 - tA;
    const mtB = 1 - tB;
    const xA = mtA ** 3 * n0.x + 3 * mtA ** 2 * tA * n1.x + 3 * mtA * tA ** 2 * n2.x + tA ** 3 * n3.x;
    const yA = mtA ** 3 * n0.y + 3 * mtA ** 2 * tA * n1.y + 3 * mtA * tA ** 2 * n2.y + tA ** 3 * n3.y;
    const xB = mtB ** 3 * n0.x + 3 * mtB ** 2 * tB * n1.x + 3 * mtB * tB ** 2 * n2.x + tB ** 3 * n3.x;
    const yB = mtB ** 3 * n0.y + 3 * mtB ** 2 * tB * n1.y + 3 * mtB * tB ** 2 * n2.y + tB ** 3 * n3.y;
    let tx = xB - xA;
    let ty = yB - yA;
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const nx = -ty;
    const ny = tx;
    const halfW = lerp(13.8, 9.6, smoothstep(0, 1, t));
    neckLeft.push([px + nx * halfW, py + ny * halfW]);
    neckRight.push([px - nx * halfW, py - ny * halfW]);
  }
  const neckPoly = [...neckLeft, ...neckRight.reverse(), neckLeft[0]];
  paintMughalPoly(ctx, neckPoly, {
    fill: '#fcf5e6',
    stroke: MUG.qalamSoft,
    lw: 0.82,
    goldRim: 0.85,
    seed: 5800,
  });
  // Delicate `Pardaz` sepia feather-down stippling along back of S-neck
  for (let k = 2; k < 14; k += 2) {
    paintPardazStipple(ctx, neckLeft[k][0] + 3, neckLeft[k][1] + 2, 4.5, 4.5, 8, '#8c6642', 0.17, 5810 + k);
  }

  // Multi-Strand Royal Basra Pearl, Balas Spinel Ruby & Emerald `Satlada` Necklace (`Mala`) swaying with 120 BPM lag!
  const necklaceSway = pendulumLag * 3.8;
  for (let strand = 0; strand < 2; strand++) {
    const baseX = n0.x + 5 + strand * 2;
    const baseY = n0.y - 4 + strand * 8;
    const beadCount = 9 + strand * 2;
    for (let b = 0; b <= beadCount; b++) {
      const u = b / beadCount;
      const catenary = Math.sin(u * Math.PI) * (15 + strand * 8);
      const bx = lerp(baseX - 15, baseX + 18, u) + Math.sin(u * Math.PI) * necklaceSway;
      const by = baseY + catenary;
      const isCenterRuby = b === Math.floor(beadCount / 2);
      if (isCenterRuby) {
        drawKundanGem(ctx, bx, by + 2.2, 3.6 + strand * 0.6, strand === 0 ? MUG.emeraldBright : MUG.ruby, 5830 + strand);
      } else {
        paintMughalOval(ctx, bx, by, 2.5, 2.4, {
          steps: 7,
          fill: b % 3 === 1 ? MUG.goldSpec : '#fffdf7',
          stroke: MUG.goldDeep,
          lw: 0.5,
          seed: 5840 + strand * 20 + b,
        });
      }
    }
  }

  // Sculpted Anatomical Pelican Cranium, Coral-Amber `Islimi` Gular Pouch & Hooked Upper Mandible!
  ctx.save();
  ctx.translate(rig.head.x, rig.head.y);
  ctx.rotate(rig.head.angle);

  const bLen = Math.hypot(rig.beakTip.x - rig.head.x, rig.beakTip.y - rig.head.y) || 74;
  const pouchSag = clamp(rig.pouchBelly.y - rig.head.y - 6, 18, 42);

  // Translucent Warm Saffron-Coral Gular Pouch (`Thaili`) decorated with delicate `Halkari` Gold Arabesques!
  const pouchPts = [];
  pouchPts.push([8, 4]);
  for (let i = 1; i <= 14; i++) {
    const u = i / 14;
    const px = lerp(8, bLen * 0.90, u);
    const belly = Math.sin(Math.pow(u, 0.72) * Math.PI) * pouchSag;
    pouchPts.push([px, 5 + belly]);
  }
  pouchPts.push([bLen * 0.94, 3.5], [8, 4]);
  paintMughalPoly(ctx, pouchPts, {
    fill: '#e68c45',
    stroke: MUG.qalamCarmine,
    lw: 0.85,
    goldRim: 0.9,
    seed: 5900,
  });
  // Warm crimson-amber inner vascular glow stipple + delicate gold `Islimi` scroll on the pouch!
  paintPardazStipple(ctx, bLen * 0.42, 4 + pouchSag * 0.52, bLen * 0.26, pouchSag * 0.35, 42, MUG.crimson, 0.22, 5902);
  drawQalamStroke(
    ctx,
    [[18, 12], [34, 9 + pouchSag * 0.48], [52, 7 + pouchSag * 0.34], [68, 9]],
    { wStart: 0.8, wMid: 1.05, wEnd: 0.55, color: MUG.goldSpec, seed: 5905 }
  );

  // Sculpted Avian Skull & Cheek Contour (flows organically into upper mandible — ZERO `ctx.arc` ball head!)
  const skullPts = [
    [-16, 8],
    [-19, -2],
    [-15, -13],
    [-3, -18],
    [10, -15],
    [19, -6],
    [18, 4],
    [7, 10],
    [-7, 11],
    [-16, 8],
  ];
  paintMughalPoly(ctx, skullPts, {
    fill: '#fcf5e6',
    stroke: MUG.qalamSoft,
    lw: 0.82,
    goldRim: 0.8,
    seed: 5910,
  });
  paintPardazStipple(ctx, -4, 4, 8, 5, 22, '#9c734c', 0.18, 5912);

  // Long Sculpted Ivory-Gold Upper Mandible with Crimson Nail Hook (`Unguis`)
  const upperBeak = [
    [14, -7.5],
    [bLen * 0.55, -5.2],
    [bLen, -1.8],
    [bLen + 4.5, 4.8], // Hooked crimson unguis tip!
    [bLen - 2.5, 4.2],
    [bLen * 0.50, 4.2],
    [13, 4.5],
    [14, -7.5],
  ];
  paintMughalPoly(ctx, upperBeak, {
    fill: '#f5cb6e',
    stroke: MUG.qalamCarmine,
    lw: 0.85,
    goldRim: 0.85,
    seed: 5920,
  });
  paintMughalPoly(ctx, [[bLen - 4, -1.8], [bLen + 4.5, 4.8], [bLen - 3, 4.0]], {
    fill: MUG.ruby,
    stroke: MUG.qalamCarmine,
    lw: 0.65,
    seed: 5921,
  });
  // Culmen ridge line
  drawQalamStroke(ctx, [[16, -2.2], [bLen - 4, 0.8]], { wStart: 0.7, wMid: 0.75, wEnd: 0.5, color: MUG.crimson, seed: 5922 });

  // Expressive Ustad Mansur Golden-Ringed Eye (`Lores` bare skin patch + ruby-rimmed iris + obsidian pupil)
  paintMughalOval(ctx, 6.5, -4.2, 6.2, 4.4, { steps: 10, fill: '#f2b885', lw: 0, seed: 5930 });
  paintMughalOval(ctx, 6.2, -4.4, 3.8, 3.5, {
    steps: 10,
    fill: MUG.goldSpec,
    stroke: '#1a0f0c',
    lw: 0.8,
    seed: 5931,
  });
  paintMughalOval(ctx, 7.0, -4.4, 2.0, 2.0, { steps: 8, fill: '#170d0a', lw: 0, seed: 5932 });
  paintMughalOval(ctx, 6.2, -5.2, 0.85, 0.85, { steps: 6, fill: '#ffffff', lw: 0, seed: 5933 });

  // Imperial Miniature Mughal `Pagri` Silk Turban, Pearl Band, Emerald `Sarpech` & Swaying Peacock-Eye `Kalgi` Plume!
  const pTurb = [
    [-17, -8],
    [-19, -16],
    [-9, -24],
    [5, -24.5],
    [13, -17],
    [11, -10],
    [0, -12],
    [-10, -8],
    [-17, -8],
  ];
  paintMughalPoly(ctx, pTurb, { fill: MUG.crimson, stroke: MUG.goldSpec, lw: 0.95, seed: 5940 });
  drawQalamStroke(ctx, [[-14, -12], [-2, -21], [10, -14]], { wStart: 1.4, wMid: 1.7, wEnd: 1.3, color: MUG.goldBright, seed: 5941 });
  // Pearl strand across turban front
  for (let p = -10; p <= 8; p += 3.6) {
    paintMughalOval(ctx, p, -15 - Math.cos(p * 0.15) * 3, 1.3, 1.3, { steps: 6, fill: '#fffdf7', stroke: MUG.goldDeep, lw: 0.35, seed: 5945 + p });
  }
  drawKundanGem(ctx, 8.5, -18.5, 3.8, MUG.emeraldBright, 5960);
  // Swaying Royal `Kalgi` Heron & Peacock-Eye Aigrette Plume!
  const pPlumeSway = pendulumLag * 3.5;
  drawQalamStroke(
    ctx,
    [[8.5, -21], [1 - pPlumeSway * 0.4, -33], [-12 - pPlumeSway, -39]],
    { wStart: 2.4, wMid: 1.8, wEnd: 0.6, color: '#1b1615', seed: 5965 }
  );
  drawQalamStroke(
    ctx,
    [[8.5, -21], [1 - pPlumeSway * 0.4, -33], [-12 - pPlumeSway, -39]],
    { wStart: 0.85, wMid: 0.7, wEnd: 0.4, color: MUG.goldSpec, seed: 5966 }
  );
  paintMughalOval(ctx, -12 - pPlumeSway, -39, 3.8, 2.8, {
    rot: -0.35,
    steps: 9,
    fill: MUG.peacock,
    stroke: MUG.goldSpec,
    lw: 0.7,
    seed: 5967,
  });
  paintMughalOval(ctx, -12 - pPlumeSway, -39, 1.5, 1.3, { steps: 6, fill: MUG.lapisDeep, lw: 0, seed: 5968 });

  ctx.restore();

  // 8. Point-by-Point Sable-Hair & `Halkari` Gold-Pointed Articulated Wing (`Shahpar` — 3 Tiers of Feathers Reaching Handlebar)!
  const sh = rig.wingShoulder;
  const el = rig.wingElbow;
  const gr = rig.wingTip;

  // Upper Covert Wing Scapular Mass + `Pardaz` shading
  const wingBase = [
    [sh.x - 16, sh.y - 7],
    [sh.x + 12, sh.y - 11],
    [gr.x + 3, gr.y - 2],
    [gr.x - 4, gr.y + 5],
    [el.x - 16, el.y + 12],
    [sh.x - 24, sh.y + 7],
    [sh.x - 16, sh.y - 7],
  ];
  paintMughalPoly(ctx, wingBase, {
    fill: '#fbf3e1',
    stroke: MUG.qalamSoft,
    lw: 0.82,
    goldRim: 0.9,
    seed: 6000,
  });

  // Tier 1: 9 Long Primary Remiges (`Shahpar`) with sepia-black Mansur tips & `0.65px` liquid-gold rachis shafts!
  for (let f = 0; f < 9; f++) {
    const u = f / 8;
    const rootX = lerp(el.x - 14, gr.x - 3, u);
    const rootY = lerp(el.y + 4, gr.y + 1, u);
    const tipX = rootX - lerp(28, 9, u);
    const tipY = rootY + lerp(16, 5, u);
    const fPoly = [
      [rootX, rootY - 2.6],
      [lerp(rootX, tipX, 0.65), lerp(rootY, tipY, 0.65) - 3.2],
      [tipX, tipY],
      [lerp(rootX, tipX, 0.65), lerp(rootY, tipY, 0.65) + 2.8],
      [rootX, rootY + 2.2],
    ];
    paintMughalPoly(ctx, fPoly, {
      fill: f % 2 === 0 ? '#fdf7ea' : '#efe1c6',
      stroke: MUG.qalamSoft,
      lw: 0.68,
      seed: 6010 + f,
    });
    // Naturalist dark sepia-slate primary tip (`Pardaz` feather tip) + gold rachis shaft!
    if (f < 6) {
      paintPointedLeafDab(ctx, lerp(rootX, tipX, 0.55), lerp(rootY, tipY, 0.55), 13, 2.4, Math.atan2(tipY - rootY, tipX - rootX), '#332822', MUG.goldBright);
    }
    drawQalamStroke(ctx, [[rootX, rootY], [tipX, tipY]], {
      wStart: 0.78,
      wMid: 0.65,
      wEnd: 0.4,
      color: MUG.goldLiquid,
      seed: 6030 + f,
      wobble: 0.04,
    });
  }

  // Tier 2 & Tier 3: Scalloped Lesser & Median Covert Feathers (`2 rows x 7 feathers`) with fine barbule ticks & gold tips!
  for (let row = 0; row < 2; row++) {
    const count = 7 - row;
    for (let c = 0; c < count; c++) {
      const u = c / Math.max(1, count - 1);
      const cx2 = lerp(sh.x - 16 + row * 4, el.x + 14, u);
      const cy2 = lerp(sh.y + 2 - row * 6, el.y + 3 - row * 6, u);
      paintMughalOval(ctx, cx2, cy2, 7.6 - row * 0.8, 4.2 - row * 0.4, {
        rot: 0.22,
        steps: 10,
        fill: '#fdf7ea',
        stroke: MUG.qalamSoft,
        lw: 0.62,
        goldRim: 0.65,
        seed: 6060 + row * 20 + c,
      });
    }
  }

  // Royal Gold & Ruby `Bazuband` Armlet on Upper Wing Shoulder + Feather Grip on Handlebar
  paintMughalOval(ctx, sh.x - 2, sh.y - 1, 7.5, 4.2, {
    rot: 0.35,
    steps: 10,
    fill: MUG.goldLiquid,
    stroke: MUG.goldSpec,
    lw: 0.8,
    seed: 6100,
  });
  drawKundanGem(ctx, sh.x - 2, sh.y - 1, 3.0, MUG.ruby, 6101);
  paintMughalOval(ctx, gr.x, gr.y + 1, 6.2, 4.4, {
    rot: 0.2,
    steps: 9,
    fill: '#fcf5e6',
    stroke: MUG.qalamSoft,
    lw: 0.72,
    goldRim: 0.65,
    seed: 6105,
  });

  ctx.restore();
}

/**
 * Draws Sparkling Parabolic Silver-and-Pearl Fountain Jets in the `Charbagh` Pools
 * AND Delicate Damascus Rose & Pomegranate Petals Drifting in the Wake of the Wheels!
 */
function drawAnimatedFountainJetsAndPetals(ctx, localT, pelicanX, layer = 'back') {
  if (layer === 'back') {
    const nozzles = [
      { x: 500, y: 388, h: 42, spread: 24, n: 7 },
      { x: 248, y: 388, h: 25, spread: 15, n: 5 },
      { x: 752, y: 388, h: 25, spread: 15, n: 5 },
    ];

    nozzles.forEach((nz, idx) => {
      // Concentric expanding oval silver ripples in the tarnished silver pool (zero `ctx.arc`!)
      const rip = (localT * 1.35 + idx * 0.37) % 1;
      ctx.save();
      ctx.globalAlpha = (1 - rip) * 0.52;
      paintMughalOval(ctx, nz.x, nz.y + 2, 10 + rip * 24, 4.5 + rip * 10, {
        steps: 16,
        fill: null,
        stroke: MUG.silverFoam,
        lw: 0.9,
        seed: 7000 + idx,
      });
      ctx.restore();

      // Parabolic silver-white water arches + sparkling pearl droplets
      for (let s = 0; s < nz.n; s++) {
        const dir = (s - (nz.n - 1) / 2) / ((nz.n - 1) / 2 || 1);
        const phase = (localT * 2.15 + s * 0.19 + idx * 0.31) % 1;
        const arcPts = [];
        for (let k = 0; k <= 8; k++) {
          const u = k / 8;
          arcPts.push([
            nz.x + dir * nz.spread * u,
            nz.y - Math.sin(u * Math.PI * 0.86) * nz.h * (1 - 0.14 * Math.abs(dir)) + u * u * 7,
          ]);
        }
        drawQalamStroke(ctx, arcPts, {
          wStart: 1.05,
          wMid: 0.85,
          wEnd: 0.45,
          color: 'rgba(236, 247, 250, 0.76)',
          seed: 7020 + idx * 10 + s,
          wobble: 0.05,
        });

        const dx = nz.x + dir * nz.spread * phase;
        const dy = nz.y - Math.sin(phase * Math.PI * 0.86) * nz.h * (1 - 0.14 * Math.abs(dir)) + phase * phase * 7;
        paintMughalOval(ctx, dx, dy, 1.55, 1.35, { steps: 6, fill: '#ffffff', lw: 0, seed: 7060 + idx * 10 + s });
      }
    });
  } else {
    // Foreground poetic breeze: 8 delicate pink Damascus rose (`Gul-i Surkh`) & ruby pomegranate petals
    // swirling gently across the inlaid walkway and lower garden in the rider's slipstream!
    for (let p = 0; p < 8; p++) {
      const cycle = (localT * (0.20 + (p % 3) * 0.04) + p * 0.137) % 1;
      const baseX = ((pelicanX - 40 - cycle * 320 + p * 95) % 860 + 860) % 860 + 70;
      const baseY = 470 + p * 34 + Math.sin(localT * 2.6 + p * 1.7) * 14;
      if (baseY > 925) continue;
      const rot = localT * (2.2 + (p % 2)) + p;
      paintPointedLeafDab(
        ctx,
        baseX,
        baseY,
        6.8,
        2.7,
        rot,
        p % 3 === 0 ? MUG.ruby : '#eb839b',
        p % 3 === 0 ? MUG.goldBright : '#ffd9e3'
      );
    }
  }
}

export function render(kit, slot, scene, params) {
  const {
    t = 0,
    localT = 0,
    pelicanLocalX = 500,
    pedalAngle = 0,
    speedScale = 1.0,
    beatFrac = (localT * 2) % 1,
    isOutroThumbnail = false,
  } = params;

  // Keep steady-state rendering strictly on `slot.g2d` (`slot.usedFb = false`) so both main scroll & `outro.js` sample 100% identically!
  slot.usedFb = false;
  const g = slot.g2d;
  const ctx = g.drawingContext;
  const beatPhase = beatFrac;

  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Draw Static Baked Museum Folio (`Wasli` + `bakeBrush` gouache + `Charbagh` + `Baradari` + `Lajward/Afshan` Hashiya + `Unwan`)
  const baked = getBakedMughalGarden(kit);
  ctx.drawImage(baked.canvas, 0, 0);

  // 2. Compute Rider Trajectory & Shared Pelican Skeletal Rig along `y = 680` Royal Walkway (seamless C1 frame-crossing!)
  const riderVisible = pelicanLocalX > -250 && pelicanLocalX < PANEL_SIZE + 250;
  const interiorScaleEnv =
    smoothstep(132, 195, pelicanLocalX) * smoothstep(868, 805, pelicanLocalX);
  const rigScale = isOutroThumbnail ? 0.96 : lerp(1.0, 0.96, interiorScaleEnv);
  const rig = riderVisible
    ? computePelicanRig({
        x: pelicanLocalX,
        y: ROAD_EDGE_Y,
        pedalAngle,
        scale: rigScale,
        slope: 0,
        speedScale,
        poseMode: 'normal',
        time: t,
      })
    : null;
  const pelicanFocus = rig ? { x: rig.head.x, y: rig.head.y } : { x: clamp(pelicanLocalX, 0, PANEL_SIZE), y: 480 };

  // 3. Animated Silver-Leaf Fountain Jets & Pool Ripples
  drawAnimatedFountainJetsAndPetals(ctx, localT, pelicanLocalX, 'back');

  // 4. Bar 2 (`localT 2..4s`) Multi-Perspective Simultaneous Courtly Head-Turn & Pointing Theater!
  // Smoothly ramps up as Bar 2 begins (`1.50 -> 2.28s`), holds full courtly amazement through `2.28..4.35s`, and settles gracefully.
  const enterTurn = smoothstep(1.50, 2.28, localT);
  const relaxTurn = 1.0 - 0.30 * smoothstep(4.55, 5.75, localT);
  const amazement = clamp(enterTurn * relaxTurn, 0, 1);

  // (A) 2nd-Floor `Baradari` Balcony Royal Prince (`hasHalo: true`) — drawn BEFORE the pierced marble `Jali` balustrade!
  drawMughalSpectator(
    ctx,
    {
      x: 742,
      y: 223,
      scale: 0.84,
      jamaColor: '#ebd9be',
      paijamaColor: MUG.crimson,
      turbanColor: MUG.goldLiquid,
      sashColor: MUG.crimson,
      pose: 'balcony',
      prop: 'balcony',
      hasHalo: true,
      defaultDir: -1,
      seed: 3100,
    },
    pelicanFocus,
    amazement,
    beatPhase,
    localT
  );
  // Layer the pierced Makrana marble `Jali` balcony railing cleanly across the Prince's lower waist!
  drawPavilionJaliBalustrade(ctx, 742, 350);

  // (B) Lower-Left Crimson Persian Carpet: Grand Vizier / Minister cradling a Ming porcelain teacup
  drawMughalSpectator(
    ctx,
    {
      x: 214,
      y: 590,
      scale: 1.04,
      jamaColor: '#f5e8d0',
      paijamaColor: '#c97824',
      turbanColor: MUG.crimson,
      sashColor: MUG.lapisMid,
      pose: 'kneel',
      prop: 'tea',
      defaultDir: 1,
      seed: 3200,
    },
    pelicanFocus,
    clamp(amazement * 1.08, 0, 1),
    beatPhase,
    localT
  );

  // (C) Right Marble Canal-Side Lawn: Court Musician (`Kalawant`) playing a Double-Gourd Mughal Sitar
  drawMughalSpectator(
    ctx,
    {
      x: 646,
      y: 562,
      scale: 0.98,
      jamaColor: '#d9ede4',
      paijamaColor: MUG.crimson,
      turbanColor: MUG.orpiment,
      sashColor: MUG.crimson,
      pose: 'kneel',
      prop: 'sitar',
      defaultDir: -1,
      seed: 3300,
    },
    pelicanFocus,
    amazement,
    beatPhase,
    localT
  );

  // (D) Imperial Gardener (`Baghban`) peeking around the `(362, 548)` Sculpted Cypress Trunk!
  const peekShift = amazement * 15;
  drawMughalSpectator(
    ctx,
    {
      x: 378 + peekShift,
      y: 536,
      scale: 0.86,
      jamaColor: '#dcebd5',
      paijamaColor: '#9e5422',
      turbanColor: '#d97824',
      sashColor: MUG.goldLiquid,
      pose: 'peek',
      prop: 'shears',
      defaultDir: 1,
      seed: 3400,
    },
    pelicanFocus,
    amazement,
    beatPhase,
    localT
  );

  // (E) Foreground Royal Courtyard Carpet (`y = 852`): Court Chronicler (`Waqia-navis`) with Illuminated `Muraqqa` Album
  drawMughalSpectator(
    ctx,
    {
      x: 718,
      y: 852,
      scale: 1.06,
      jamaColor: '#f7ead5',
      paijamaColor: MUG.peacock,
      turbanColor: MUG.lapisBright,
      sashColor: MUG.goldLiquid,
      pose: 'kneel',
      prop: 'scroll',
      defaultDir: -1,
      seed: 3500,
    },
    pelicanFocus,
    amazement,
    beatPhase,
    localT
  );

  // 5. Hero Ustad Mansur Naturalist Pelican & `Karkhana` Carved Jade / Damascus `Koftgari` Curio Bicycle!
  if (rig) {
    drawMughalImperialPelicanAndBike(ctx, rig, localT, beatPhase);
  }

  // 6. Foreground Poetic Drifting Rose & Pomegranate Petals in the Rider's Breeze
  drawAnimatedFountainJetsAndPetals(ctx, localT, pelicanLocalX, 'front');

  // 7. Zero Modern Computer Fonts in Main Scroll (`!isOutroThumbnail` — external brass placard on `frame.js` + top `Unwan` Shamsa!).
  // Keep ONLY the `isOutroThumbnail` banner so the 7x3 Outro wall remains 100% crisp and readable!
  if (isOutroThumbnail) {
    ctx.save();
    ctx.fillStyle = 'rgba(12, 33, 61, 0.88)';
    ctx.fillRect(0, PANEL_SIZE - 130, PANEL_SIZE, 130);
    ctx.strokeStyle = MUG.goldBright;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, PANEL_SIZE - 130);
    ctx.lineTo(PANEL_SIZE, PANEL_SIZE - 130);
    ctx.stroke();
    ctx.fillStyle = '#fff3d1';
    ctx.font = '700 60px "PelicanSerif", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`08 · ${scene.zh}`, PANEL_SIZE / 2, PANEL_SIZE - 65);
    ctx.restore();
  }

  ctx.restore();
}
