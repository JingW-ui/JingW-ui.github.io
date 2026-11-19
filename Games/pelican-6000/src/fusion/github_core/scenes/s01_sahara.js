// src/scenes/s01_sahara.js
// #01 撒哈拉岩画 (Saharan Rock Painting · Tassili n'Ajjer, c. 4000 BCE) — r3 Museum Artifact Edition
// - Zero SVG geometric primitives / zero radial-gradient glow balls / zero setLineDash / zero in-painting UI card.
// - Procedural Worley + Ridged-FBM 3D sandstone micro-relief heightfield H(x,y) & world-space rock-tooth grid.
// - Pre-baked dry-rubbed pale kaolin rock-ground band (y = 555..695) for natural foreground contrast;
//   Pelican & stone wheels preserve >= 90% solid mineral pigment cores while outer dry bristles catch world-space rock tooth (35%~58%).
// - 3,600-droplet directional bone-blown negative hand stencils (upper-right & upper-left alcoves) + flint-pecked lower petroglyphs.
// - Tassili Bovidian anatomical cattle (wet-white kaolin lyre horns, dappled hides, sculpted hocks) & calf-tapered attenuated herders.
// - Neolithic fire-bent acacia bow-beam & Y-forked branch bicycle with twisted sinew cordage & knapped sandstone-disc solar wheels.

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  clamp,
  lerp,
  smoothstep,
} from '../beat/timeline.js';
import { computePelicanRig } from '../rig/pelican.js';

const PIGMENT = {
  hematite: '#8d2b14',
  hematiteDeep: '#541709',
  hematiteBright: '#b23f1e',
  yellowOchre: '#d79634',
  limoniteLight: '#eac06b',
  kaolin: '#f4e8d1',
  kaolinWarm: '#e7d4b4',
  charcoal: '#21130c',
  manganese: '#3a2116',
  sandLight: '#e0bc8f',
  sandBase: '#c7935f',
  sandDark: '#89502d',
};

// Fast deterministic integer hash -> [0, 1)
function hash2f(ix, iy, seed = 1337) {
  let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) * 2.3283064365386963e-10;
}

function valueNoise2D(x, y, seed) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2f(ix, iy, seed);
  const b = hash2f(ix + 1, iy, seed);
  const c = hash2f(ix, iy + 1, seed);
  const d = hash2f(ix + 1, iy + 1, seed);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function ridgedFBM(x, y, seed) {
  let sum = 0;
  let amp = 0.52;
  let freq = 1.0;
  for (let o = 0; o < 4; o++) {
    const n = valueNoise2D(x * freq, y * freq, seed + o * 97);
    const ridge = 1.0 - Math.abs(n * 2.0 - 1.0);
    sum += ridge * ridge * amp;
    freq *= 2.07;
    amp *= 0.48;
  }
  return sum;
}

// Cellular Worley sandstone pocket distance in [0, 1]
function worleyRock(x, y, seed) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  let minD2 = 9.0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = ix + dx;
      const cy = iy + dy;
      const px = cx + hash2f(cx, cy, seed);
      const py = cy + hash2f(cx, cy, seed + 71);
      const ddx = px - x;
      const ddy = py - y;
      const d2 = ddx * ddx + ddy * ddy;
      if (d2 < minD2) minD2 = d2;
    }
  }
  return Math.min(1.0, Math.sqrt(minD2));
}

function sampleTooth(toothGrid, wx, wy) {
  const ix = wx < 0 ? 0 : wx >= PANEL_SIZE ? PANEL_SIZE - 1 : wx | 0;
  const iy = wy < 0 ? 0 : wy >= PANEL_SIZE ? PANEL_SIZE - 1 : wy | 0;
  return toothGrid[iy * PANEL_SIZE + ix] * 0.0039215686; // / 255
}

/**
 * World-space rock-tooth aware mineral dry-brush stroke:
 * - Inner core strands stay >= 90% solid so silhouettes never turn lacy or transparent;
 * - Outer strands skip 35%~58% where the world-space sandstone heightfield recedes into pores!
 */
function drawRockToothStroke(ctx, pts, toothGrid, rng, {
  color = PIGMENT.charcoal,
  width = 6,
  strands = 7,
  edgeSkip = 0.48,
  coreSkip = 0.06,
  alpha = 0.94,
  stepPx = 4.5,
} = {}) {
  if (!pts || pts.length < 2) return;

  // Subdivide polyline into ~stepPx world-space samples so bristles feel every rock grain
  const dense = [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(1, Math.ceil(dist / stepPx));
    for (let k = 1; k <= steps; k++) {
      const u = k / steps;
      dense.push([x0 + (x1 - x0) * u, y0 + (y1 - y0) * u]);
    }
  }

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let s = 0; s < strands; s++) {
    const tNorm = strands > 1 ? s / (strands - 1) - 0.5 : 0; // [-0.5, +0.5]
    const absNorm = Math.abs(tNorm) * 2; // [0, 1]
    const isCore = absNorm < 0.46;
    const targetSkip = isCore ? coreSkip : lerp(0.35, edgeSkip, (absNorm - 0.46) / 0.54);

    ctx.lineWidth = Math.max(0.85, (width / strands) * (isCore ? 1.75 : 1.22));
    ctx.globalAlpha = alpha * (isCore ? 0.96 : lerp(0.84, 0.46, absNorm));

    ctx.beginPath();
    let penDown = false;
    for (let i = 0; i < dense.length; i++) {
      const [px, py] = dense[i];
      const prev = dense[Math.max(0, i - 1)];
      const next = dense[Math.min(dense.length - 1, i + 1)];
      const tx = next[0] - prev[0];
      const ty = next[1] - prev[1];
      const tl = Math.hypot(tx, ty) || 1;
      const nx = -ty / tl;
      const ny = tx / tl;

      const taper = Math.min(1, Math.min(i + 1, dense.length - i) / 2.5);
      const jitter = (rng() - 0.5) * width * 0.22;
      const bx = px + nx * (tNorm * width * 0.96 * taper + jitter);
      const by = py + ny * (tNorm * width * 0.96 * taper + jitter);

      const tooth = toothGrid ? sampleTooth(toothGrid, bx, by) : 0.6;
      // Low tooth = recessed rock pore -> pigment skips on outer dry bristles!
      const skip = i > 0 && i < dense.length - 1 && (1 - tooth) * 0.82 + rng() * 0.34 > 1.0 - targetSkip;
      if (skip) {
        penDown = false;
      } else if (!penDown) {
        ctx.moveTo(bx, by);
        penDown = true;
      } else {
        ctx.lineTo(bx, by);
      }
    }
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Fills an organic mineral-pigment shape on rough sandstone:
 * - Core interior keeps >= 91% solid pigment body (with 6%~8% subtle sandstone pinholes at deep rock pits);
 * - Outer contour is dry-rubbed with rock-tooth bristle fringes (38%~58% pore skipping on edges),
 *   100% eliminating flat vector polygon edges!
 */
function fillRockToothPoly(ctx, pts, toothGrid, rng, {
  color = PIGMENT.kaolin,
  coreAlpha = 0.93,
  edgeWidth = 4.2,
  edgeSkip = 0.52,
  pinholeCount = 26,
  pinholeCol = 'rgba(138, 78, 40, 0.36)',
} = {}) {
  if (!pts || pts.length < 3) return;
  ctx.save();
  ctx.beginPath();
  let minX = 1e9;
  let minY = 1e9;
  let maxX = -1e9;
  let maxY = -1e9;
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i];
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  ctx.globalAlpha = coreAlpha;
  ctx.fillStyle = color;
  ctx.fill();

  // Subtle world-anchored sandstone pores peeking through deep pits inside the shape (<8% area)
  if (pinholeCount > 0) {
    ctx.save();
    ctx.clip();
    ctx.fillStyle = pinholeCol;
    const spanX = Math.max(4, maxX - minX);
    const spanY = Math.max(4, maxY - minY);
    for (let k = 0; k < pinholeCount; k++) {
      const gx = minX + rng() * spanX;
      const gy = minY + rng() * spanY;
      const tooth = toothGrid ? sampleTooth(toothGrid, gx, gy) : 0.5;
      if (tooth < 0.36) {
        const pr = 0.8 + (0.36 - tooth) * 3.8;
        ctx.fillRect(gx - pr * 0.5, gy - pr * 0.5, pr, pr * 0.85);
      }
    }
    ctx.restore();
  }
  ctx.restore();

  // Dry-rubbed mineral edge bristles catching rock tooth (38%~58% edge porosity)
  if (edgeWidth > 0) {
    const closed = [...pts, pts[0]];
    drawRockToothStroke(ctx, closed, toothGrid, rng, {
      color,
      width: edgeWidth,
      strands: 5,
      edgeSkip,
      coreSkip: 0.14,
      alpha: coreAlpha * 0.92,
      stepPx: 3.8,
    });
  }
}

/**
 * Builds an asymmetric, knuckle-warped prehistoric human 5-finger hand polygon (zero rubber-glove bezier!).
 */
function buildOrganicHandPoly(rng, toothGrid, cx, cy, scale, rot, mirror = 1) {
  // Hand anatomical landmarks in local space [x, y] with natural finger-joint asymmetry
  const raw = [
    [-14, 36], [-16, 24], [-19, 14], [-22, 8],
    // Splayed thumb with interphalangeal joint swell
    [-31, 1], [-39, -6], [-45, -12], [-44, -16], [-39, -17], [-32, -11], [-24, -4], [-18, 1],
    // Index finger (slightly curved inward)
    [-20, -16], [-23, -31], [-23.5, -43], [-20.5, -48], [-16.5, -47], [-15, -39], [-13, -24], [-10, -8],
    // Middle finger (tallest, subtle knuckle)
    [-8, -25], [-7, -41], [-5.5, -53], [-1.5, -57], [2.5, -55.5], [3.5, -45], [3, -27], [3, -9],
    // Ring finger
    [7, -23], [11, -38], [14.5, -48], [18.5, -49], [21, -45], [18.5, -34], [14.5, -19], [11.5, -6],
    // Pinky finger (natural outward splay)
    [18, -14], [24, -24], [29.5, -32], [33.5, -31.5], [34.5, -27], [29, -18], [23, -7], [19, 5],
    // Hypothenar palm edge & wrist
    [18.5, 16], [16, 26], [13.5, 36], [0, 38],
  ];

  const ca = Math.cos(rot);
  const sa = Math.sin(rot);
  const worldPts = [];
  for (let i = 0; i < raw.length; i++) {
    const next = raw[(i + 1) % raw.length];
    for (let sub = 0; sub < 2; sub++) {
      const u = sub * 0.5;
      let lx = lerp(raw[i][0], next[0], u) * mirror;
      let ly = lerp(raw[i][1], next[1], u);
      const wx0 = cx + (lx * ca - ly * sa) * scale;
      const wy0 = cy + (lx * sa + ly * ca) * scale;
      // Rock crevice projection warp: raised finger over uneven sandstone shifts stencil shadow slightly!
      const relief = toothGrid ? sampleTooth(toothGrid, wx0, wy0) - 0.5 : 0;
      lx += (relief * 2.8 + (rng() - 0.5) * 0.9) * mirror;
      ly += relief * 2.4 + (rng() - 0.5) * 0.9;
      worldPts.push([
        cx + (lx * ca - ly * sa) * scale,
        cy + (lx * sa + ly * ca) * scale,
      ]);
    }
  }
  return worldPts;
}

function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function minDistToPolyEdge(px, py, poly) {
  let minD2 = 1e9;
  for (let i = 0; i < poly.length; i++) {
    const [ax, ay] = poly[i];
    const [bx, by] = poly[(i + 1) % poly.length];
    const dx = bx - ax;
    const dy = by - ay;
    const l2 = dx * dx + dy * dy || 1;
    const t = clamp(((px - ax) * dx + (py - ay) * dy) / l2, 0, 1);
    const ex = ax + dx * t - px;
    const ey = ay + dy * t - py;
    const d2 = ex * ex + ey * ey;
    if (d2 < minD2) minD2 = d2;
  }
  return Math.sqrt(minD2);
}

/**
 * Authentic Prehistoric Bone-Pipe Mouth-Blown Negative Hand Stencil:
 * - ZERO radial-gradient airbrush circle! ZERO artificial outline stroke!
 * - 3,600+ directional blown hematite/manganese mineral droplets occluded by H(x,y) rock micro-relief,
 *   accumulating densely around finger webs & tips while leaving the shielded sandstone palm 100% raw rock!
 */
function drawBlownHandStencil(ctx, toothGrid, rng, {
  cx,
  cy,
  scale = 1.0,
  rot = 0,
  mirror = 1,
  blowDirX = 0.25,
  blowDirY = -0.35,
  primaryRgb = [142, 39, 17],
  darkRgb = [48, 22, 12],
  droplets = 3700,
}) {
  const handPoly = buildOrganicHandPoly(rng, toothGrid, cx, cy, scale, rot, mirror);
  const maxR = 88 * scale;

  ctx.save();
  for (let i = 0; i < droplets; i++) {
    // Concentrate blow bursts around finger zone (cy - 12*scale) with slight asymmetric breath drift
    const a = rng() * Math.PI * 2;
    const radBias = Math.pow(rng(), 0.56);
    const r = (6 + radBias * 82) * scale;
    const drift = radBias * 11 * scale;
    const px = cx + Math.cos(a) * r + blowDirX * drift + (rng() - 0.5) * 5 * scale;
    const py = cy - 9 * scale + Math.sin(a) * r + blowDirY * drift + (rng() - 0.5) * 5 * scale;

    if (px < 0 || px >= PANEL_SIZE || py < 0 || py >= PANEL_SIZE) continue;
    // Shielded by the prehistoric artist's hand pressed flat against the rock!
    if (pointInPoly(px, py, handPoly)) continue;

    const edgeDist = minDistToPolyEdge(px, py, handPoly);
    // Droplets pile up densely right against finger webs (0..14px) and taper irregularly outward
    const nearFingerBoost = Math.exp(-edgeDist / (18 * scale));
    const outerFade = clamp(1 - r / maxR, 0, 1);
    const densityProb = clamp(nearFingerBoost * 0.95 + outerFade * 0.42, 0, 1);
    if (rng() > densityProb) continue;

    // Rock-relief occlusion: recessed leeward pits catch less blown mist than protruding grains!
    const tooth = sampleTooth(toothGrid, px, py);
    if (tooth < 0.24 && rng() < 0.72) continue;

    const isDark = rng() < 0.22;
    const [cr, cg, cb] = isDark ? darkRgb : primaryRgb;
    const alpha = clamp((0.22 + nearFingerBoost * 0.52 + tooth * 0.22) * (0.45 + outerFade * 0.55), 0.08, 0.84);
    const sz = (0.75 + rng() * (edgeDist < 10 * scale ? 1.55 : 2.65)) * (0.7 + tooth * 0.55);

    ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha.toFixed(2)})`;
    // Irregular mineral spatter fleck (tiny rotated rectangle/shard, not smooth circles)
    ctx.fillRect(px - sz * 0.5, py - sz * 0.5, sz, sz * (0.75 + rng() * 0.5));
  }
  ctx.restore();
}

/**
 * Genuine Flint-Pecked Percussion Petroglyph (石器敲击凹坑点刻 — 100% replaces setLineDash!):
 * Each hammerstone blow chips a tiny irregular cupule with dark upper shadow & pale freshly fractured quartz rim.
 */
function drawPeckedPetroglyph(ctx, pts, toothGrid, rng, alpha = 0.48) {
  if (!pts || pts.length < 2) return;
  ctx.save();
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(1, Math.floor(dist / 3.1));
    for (let k = 0; k <= steps; k++) {
      const u = k / steps;
      const px = x0 + (x1 - x0) * u + (rng() - 0.5) * 1.5;
      const py = y0 + (y1 - y0) * u + (rng() - 0.5) * 1.5;
      const tooth = toothGrid ? sampleTooth(toothGrid, px, py) : 0.5;
      const w = 1.8 + rng() * 1.9;
      const h = 1.5 + rng() * 1.7;

      // Upper-left recessed percussion pit shadow
      ctx.fillStyle = `rgba(26, 10, 4, ${(alpha * (0.65 + tooth * 0.4)).toFixed(2)})`;
      ctx.fillRect(px - w * 0.5, py - h * 0.5, w, h);

      // Lower-right freshly bruised pale quartz sandstone rim
      ctx.fillStyle = `rgba(242, 212, 170, ${(alpha * (0.72 + (1 - tooth) * 0.3)).toFixed(2)})`;
      ctx.fillRect(px - w * 0.35 + 0.7, py + h * 0.15, w * 0.95, h * 0.72);
    }
  }
  ctx.restore();
}

/**
 * Bakes the 1000x1000 Tassili sandstone shelter wall via multi-scale Worley + Ridged-FBM heightfield H(x,y)
 * and retains `toothGrid` (Uint8Array 1000x1000) for zero-cost per-frame world-space rock-tooth brushing!
 */
let _cachedSaharaAssets = null;
function getSaharaRockAssets(kit) {
  if (_cachedSaharaAssets) return _cachedSaharaAssets;

  const toothGrid = new Uint8Array(PANEL_SIZE * PANEL_SIZE);

  const wall = kit.bake2D('s01_sahara_wall_r3', (_g, ctx, rng) => {
    // -------------------------------------------------------------------------
    // Step 1: Compute 256x256 Macro/Meso Geological Heightfield (~2.5ms)
    // -------------------------------------------------------------------------
    const G = 256;
    const macroH = new Float32Array(G * G);
    const seepMap = new Float32Array(G * G);

    for (let gy = 0; gy < G; gy++) {
      const wy = (gy / (G - 1)) * PANEL_SIZE;
      for (let gx = 0; gx < G; gx++) {
        const wx = (gx / (G - 1)) * PANEL_SIZE;

        // Tilted sedimentary bedding strata + ridged sandstone crevices + Worley quartz pockets
        const strataWave = Math.sin(wy * 0.042 + Math.sin(wx * 0.0055) * 2.2) * 0.18;
        const ridge = ridgedFBM(wx * 0.0065, wy * 0.011 + wx * 0.0006, 401);
        const cells = worleyRock(wx * 0.022, wy * 0.026, 917);

        // Stepped geological ledges at pastoral terraces (y=505, y=542), canonical road (y=680), and lower cliff
        const roadCliffDrop = smoothstep(ROAD_EDGE_Y - 5, ROAD_EDGE_Y + 9, wy) * -0.26;
        const terrace1 = Math.exp(-Math.pow((wy - 506 + Math.sin(wx * 0.008) * 5) / 8, 2)) * 0.10;
        const terrace2 = Math.exp(-Math.pow((wy - 542 + Math.cos(wx * 0.007) * 5) / 8, 2)) * 0.09;

        macroH[gy * G + gx] = clamp(0.32 + ridge * 0.44 + cells * 0.22 + strataWave + terrace1 + terrace2 + roadCliffDrop, 0, 1);

        // Organic desert-varnish water seepage runnels from rock overhang (replaces CSS fillRect bars!)
        const warpX = wx + (ridgedFBM(wx * 0.014, wy * 0.008, 733) - 0.45) * 46;
        const channel = Math.pow(Math.max(0, Math.sin(warpX * 0.048) * Math.cos(warpX * 0.019 + 1.1)), 4);
        const seepLen = 135 + valueNoise2D(wx * 0.018, 0.5, 551) * 210;
        seepMap[gy * G + gx] = channel * clamp(1 - wy / seepLen, 0, 1);
      }
    }

    const sampleMacro = (arr, px, py) => {
      const fx = clamp((px / PANEL_SIZE) * (G - 1), 0, G - 1.001);
      const fy = clamp((py / PANEL_SIZE) * (G - 1), 0, G - 1.001);
      const ix = fx | 0;
      const iy = fy | 0;
      const ux = fx - ix;
      const uy = fy - iy;
      const i00 = iy * G + ix;
      const v0 = arr[i00] + (arr[i00 + 1] - arr[i00]) * ux;
      const v1 = arr[i00 + G] + (arr[i00 + G + 1] - arr[i00 + G]) * ux;
      return v0 + (v1 - v0) * uy;
    };

    // -------------------------------------------------------------------------
    // Step 2: Full-Res 1000x1000 Bump-Lit Sandstone & Prepared Kaolin Ground (~12ms)
    // -------------------------------------------------------------------------
    const imgData = ctx.createImageData(PANEL_SIZE, PANEL_SIZE);
    const data = imgData.data;

    // Precompute full-res height buffer for finite-difference raking-light bump normals
    const fullH = new Float32Array(PANEL_SIZE * PANEL_SIZE);
    for (let y = 0; y < PANEL_SIZE; y++) {
      const rowOff = y * PANEL_SIZE;
      for (let x = 0; x < PANEL_SIZE; x++) {
        const mh = sampleMacro(macroH, x, y);
        const micro1 = hash2f(x >> 1, y >> 1, 2027);
        const micro2 = hash2f(x, y, 4099);
        const h = clamp(mh * 0.72 + micro1 * 0.17 + micro2 * 0.11, 0, 1);
        fullH[rowOff + x] = h;
        // High-frequency tooth value stored for world-space bristle interaction
        const toothVal = clamp(0.18 + (mh - 0.25) * 0.55 + micro1 * 0.36 + micro2 * 0.26, 0, 1);
        toothGrid[rowOff + x] = (toothVal * 255) | 0;
      }
    }

    // Raking Saharan cave-mouth sunlight vector L = (-0.50, -0.66, 0.56)
    const lx = -0.50;
    const ly = -0.66;
    const lz = 0.56;

    for (let y = 0; y < PANEL_SIZE; y++) {
      const rowOff = y * PANEL_SIZE;
      const ym1 = Math.max(0, y - 1) * PANEL_SIZE;
      const yp1 = Math.min(PANEL_SIZE - 1, y + 1) * PANEL_SIZE;

      // Prepared pale kaolin-rubbed sandstone band in y = 552..684 (Director #85 Guardrail #1:
      // natural high-tooth chalked rock ground so the foreground Pelican & wheels read boldly with ZERO radial glow!)
      const kaolinBand =
        smoothstep(536, 582, y) * (1.0 - smoothstep(673, 690, y));
      const isLowerCliff = smoothstep(ROAD_EDGE_Y - 3, ROAD_EDGE_Y + 8, y);
      // Natural overhang desert-varnish shadow along ceiling (y = 0..75)
      const overhangShade = clamp(1 - y / 72, 0, 1) * 0.36;

      for (let x = 0; x < PANEL_SIZE; x++) {
        const idx = rowOff + x;
        const xm1 = x > 0 ? x - 1 : 0;
        const xp1 = x < PANEL_SIZE - 1 ? x + 1 : PANEL_SIZE - 1;

        const h = fullH[idx];
        const dhx = (fullH[rowOff + xp1] - fullH[rowOff + xm1]) * 4.4;
        const dhy = (fullH[yp1 + x] - fullH[ym1 + x]) * 4.4;
        const invLen = 1.0 / Math.sqrt(dhx * dhx + dhy * dhy + 1.0);
        const ndotl = clamp((-dhx * lx - dhy * ly + lz) * invLen, 0.12, 1.18);

        // Sedimentary ochre mineral color variation
        const strataTint = Math.sin(y * 0.036 + h * 3.8);
        let r = lerp(196, 224, h) + strataTint * 11;
        let g = lerp(138, 178, h) + strataTint * 7;
        let b = lerp(88, 128, h) + strataTint * 4;

        // Dry-rubbed pale kaolin rock preparation in y = 552..684 (catches on high rock tooth!)
        if (kaolinBand > 0.01) {
          const chalkCatch = kaolinBand * smoothstep(0.30, 0.72, toothGrid[idx] / 255) * 0.58;
          r = lerp(r, 245, chalkCatch);
          g = lerp(g, 226, chalkCatch);
          b = lerp(b, 194, chalkCatch);
        }

        // Deep iron-rich hematite sandstone cross-section below y = 680
        if (isLowerCliff > 0.01) {
          const lowR = lerp(84, 136, h) + strataTint * 9;
          const lowG = lerp(38, 72, h) + strataTint * 5;
          const lowB = lerp(20, 42, h);
          r = lerp(r, lowR, isLowerCliff);
          g = lerp(g, lowG, isLowerCliff);
          b = lerp(b, lowB, isLowerCliff);
        }

        // Sinuous desert-varnish water runnels from shelter ceiling
        const seep = sampleMacro(seepMap, x, y);
        const varnish = clamp(seep * 0.62 + overhangShade, 0, 0.68);
        r = lerp(r, 56, varnish);
        g = lerp(g, 25, varnish);
        b = lerp(b, 13, varnish);

        // Quartz crystal micro-glint on sunlit rock facets
        const glint = ndotl > 0.94 && (toothGrid[idx] > 212) ? 16 : 0;
        const shade = 0.60 + ndotl * 0.52;

        const pIdx = idx << 2;
        data[pIdx] = clamp(r * shade + glint, 0, 255) | 0;
        data[pIdx + 1] = clamp(g * shade + glint * 0.85, 0, 255) | 0;
        data[pIdx + 2] = clamp(b * shade + glint * 0.65, 0, 255) | 0;
        data[pIdx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // -------------------------------------------------------------------------
    // Step 3: Weathered Tassili Ochre Horizon Bluffs & Wind-Eroded Arch (y = 215..365)
    // Drawn with organic FBM contours & rock-tooth mineral washes — ZERO straight trapezoid lineTo!
    // -------------------------------------------------------------------------
    const bluffProfile = [];
    for (let x = 0; x <= PANEL_SIZE; x += 8) {
      // Three natural weathered Tassili plateau formations with crumbling talus slopes
      const m1 = smoothstep(55, 118, x) * (1 - smoothstep(245, 305, x)) * 62;
      const m2 = smoothstep(395, 455, x) * (1 - smoothstep(615, 678, x)) * 78;
      const m3 = smoothstep(735, 792, x) * (1 - smoothstep(935, 982, x)) * 74;
      const crag = (valueNoise2D(x * 0.045, 2.3, 613) - 0.5) * 14 + (hash2f(x, 19, 811) - 0.5) * 4.5;
      const py = 312 - Math.max(m1, m2, m3) + crag;
      bluffProfile.push([x, py]);
    }
    const bluffPoly = [[0, 368], ...bluffProfile, [PANEL_SIZE, 368]];
    fillRockToothPoly(ctx, bluffPoly, toothGrid, rng, {
      color: 'rgba(134, 52, 24, 0.34)',
      coreAlpha: 0.32,
      edgeWidth: 4.5,
      edgeSkip: 0.62,
      pinholeCount: 180,
      pinholeCol: 'rgba(222, 182, 134, 0.25)',
    });

    // Wind-carved Tassili sandstone arch window around x = 858, y = 288 (rough rock-chipped opening)
    const archPts = [];
    for (let k = 0; k <= 16; k++) {
      const a = Math.PI + (k / 16) * Math.PI;
      const rx = 31 + (rng() - 0.5) * 4.5;
      const ry = 44 + (rng() - 0.5) * 5.0;
      archPts.push([862 + Math.cos(a) * rx, 298 + Math.sin(a) * ry]);
    }
    fillRockToothPoly(ctx, archPts, toothGrid, rng, {
      color: '#d8aa76',
      coreAlpha: 0.58,
      edgeWidth: 3.0,
      edgeSkip: 0.55,
      pinholeCount: 20,
    });

    // Dry mineral bedding streaks across the distant rock bluffs
    for (let m = 0; m < 5; m++) {
      const my = 242 + m * 22;
      const sPts = [];
      for (let sx = 40; sx <= 960; sx += 48) {
        sPts.push([sx, my + (rng() - 0.5) * 7]);
      }
      drawRockToothStroke(ctx, sPts, toothGrid, rng, {
        color: '#6e2611',
        width: 3.6,
        strands: 5,
        edgeSkip: 0.65,
        coreSkip: 0.32,
        alpha: 0.28,
      });
    }

    // Faded archaic Round-Head / early pastoralist giraffes painted in weathered red ochre (x = 682..755)
    const drawWeatheredGiraffe = (gx, gy, sc) => {
      const x = (u) => gx + u * sc;
      const y = (v) => gy + v * sc;
      fillRockToothPoly(
        ctx,
        [
          [x(-19), y(2)], [x(-4), y(-5)], [x(13), y(-8)],
          [x(31), y(-56)], [x(41), y(-58)], [x(38), y(-50)],
          [x(21), y(-2)], [x(16), y(11)], [x(-15), y(11)],
        ],
        toothGrid,
        rng,
        { color: '#8b3017', coreAlpha: 0.42, edgeWidth: 2.2, edgeSkip: 0.58, pinholeCount: 16 }
      );
      for (const [lx0, ly0, lx1, ly1] of [
        [-14, 10, -18, 39], [-7, 10, -6, 38], [11, 9, 13, 39], [16, 8, 23, 38],
      ]) {
        drawRockToothStroke(ctx, [[x(lx0), y(ly0)], [x(lx1), y(ly1)]], toothGrid, rng, {
          color: '#762510', width: 2.6 * sc, strands: 3, edgeSkip: 0.52, coreSkip: 0.2, alpha: 0.42,
        });
      }
      // Reticulated kaolin clay spots along neck
      ctx.fillStyle = 'rgba(242, 226, 198, 0.38)';
      for (let d = 0; d < 7; d++) {
        ctx.fillRect(x(-7 + d * 4.5), y(3 - d * 5.8), 2.6 * sc, 2.4 * sc);
      }
    };
    drawWeatheredGiraffe(688, 334, 0.88);
    drawWeatheredGiraffe(742, 345, 0.66);

    // -------------------------------------------------------------------------
    // Step 4: Authentic Bone-Blown Negative Hand Stencils (Upper-Right + Freed Upper-Left Alcove!)
    // -------------------------------------------------------------------------
    // 1. Freed Upper-Left Rock Alcove (formerly covered by modern title box!): adult hand + companion hand!
    drawBlownHandStencil(ctx, toothGrid, rng, {
      cx: 112,
      cy: 122,
      scale: 0.94,
      rot: 0.22,
      mirror: 1,
      blowDirX: 0.32,
      blowDirY: -0.28,
      primaryRgb: [138, 37, 16],
      darkRgb: [44, 19, 10],
      droplets: 3800,
    });
    drawBlownHandStencil(ctx, toothGrid, rng, {
      cx: 224,
      cy: 168,
      scale: 0.72,
      rot: -0.14,
      mirror: -1,
      blowDirX: -0.20,
      blowDirY: -0.32,
      primaryRgb: [168, 76, 24],
      darkRgb: [56, 24, 12],
      droplets: 2600,
    });
    // 2. Upper-Right Shelter Alcove Hand Stencil
    drawBlownHandStencil(ctx, toothGrid, rng, {
      cx: 882,
      cy: 132,
      scale: 0.96,
      rot: -0.20,
      mirror: -1,
      blowDirX: -0.30,
      blowDirY: -0.30,
      primaryRgb: [144, 38, 16],
      darkRgb: [44, 20, 11],
      droplets: 3900,
    });
    // 3. Ancient Half-Weathered Ochre Hand Stencil in Lower-Left Stratum
    drawBlownHandStencil(ctx, toothGrid, rng, {
      cx: 102,
      cy: 822,
      scale: 0.84,
      rot: 0.24,
      mirror: 1,
      blowDirX: 0.22,
      blowDirY: -0.25,
      primaryRgb: [166, 62, 26],
      darkRgb: [32, 13, 7],
      droplets: 2500,
    });

    // -------------------------------------------------------------------------
    // Step 5: Elevated Midground Pastoralist Sandstone Terraces (y = 504..546)
    // -------------------------------------------------------------------------
    drawRockToothStroke(
      ctx,
      [[38, 508], [195, 500], [385, 509], [575, 502], [765, 508], [958, 504]],
      toothGrid,
      rng,
      { color: '#782f16', width: 8.5, strands: 7, edgeSkip: 0.56, coreSkip: 0.18, alpha: 0.48 }
    );
    drawRockToothStroke(
      ctx,
      [[52, 545], [265, 539], [510, 547], [735, 539], [935, 544]],
      toothGrid,
      rng,
      { color: '#8a3e1d', width: 7.5, strands: 6, edgeSkip: 0.56, coreSkip: 0.18, alpha: 0.42 }
    );

    // Dry ochre savannah grass tufts brushed onto the rock ledges
    for (const baseRowY of [505, 542]) {
      for (let gIdx = 0; gIdx < 15; gIdx++) {
        const gx = 68 + gIdx * 61 + (rng() - 0.5) * 24;
        const gy = baseRowY + (rng() - 0.5) * 5;
        for (let bl = -2; bl <= 2; bl++) {
          drawRockToothStroke(
            ctx,
            [
              [gx, gy],
              [gx + bl * 2.6, gy - 7],
              [gx + bl * 4.8 + (rng() - 0.5) * 2, gy - 12 - rng() * 5],
            ],
            toothGrid,
            rng,
            {
              color: gIdx % 2 === 0 ? '#dfa84e' : '#7b3217',
              width: 1.9,
              strands: 2,
              edgeSkip: 0.45,
              coreSkip: 0.12,
              alpha: 0.55,
            }
          );
        }
      }
    }

    // -------------------------------------------------------------------------
    // Step 6: Canonical y = 680 Sandstone Ledge Road (Anchored C1-smoothly at (0,680) & (1000,680)!)
    // -------------------------------------------------------------------------
    const roadPts = [];
    for (let x = 0; x <= PANEL_SIZE; x += 16) {
      const env = Math.sin((Math.PI * x) / PANEL_SIZE);
      roadPts.push([x, ROAD_EDGE_Y + Math.sin(x * 0.024) * 1.5 * env]);
    }
    drawRockToothStroke(ctx, roadPts, toothGrid, rng, {
      color: PIGMENT.kaolin,
      width: 9.5,
      strands: 7,
      edgeSkip: 0.46,
      coreSkip: 0.06,
      alpha: 0.84,
    });
    drawRockToothStroke(
      ctx,
      roadPts.map(([rx, ry]) => [rx, ry + 5.5]),
      toothGrid,
      rng,
      {
        color: PIGMENT.hematiteDeep,
        width: 12.5,
        strands: 8,
        edgeSkip: 0.50,
        coreSkip: 0.08,
        alpha: 0.90,
      }
    );

    // Lower rock-cliff bedding ledges & angular sandstone scree chips
    for (let ledge = 0; ledge < 3; ledge++) {
      const ly = 752 + ledge * 78;
      const lPts = [];
      for (let x = 0; x <= PANEL_SIZE; x += 28) {
        lPts.push([x, ly + Math.sin(x * 0.011 + ledge * 1.8) * 13 + (rng() - 0.5) * 4]);
      }
      drawRockToothStroke(ctx, lPts, toothGrid, rng, {
        color: ledge % 2 === 0 ? '#a86436' : '#311308',
        width: 8.5,
        strands: 6,
        edgeSkip: 0.55,
        coreSkip: 0.18,
        alpha: 0.44,
      });
    }

    for (let pb = 0; pb < 72; pb++) {
      const px = rng() * PANEL_SIZE;
      const py = ROAD_EDGE_Y + 6 + rng() * 34;
      const rw = 2.2 + rng() * 5.0;
      const rh = 1.4 + rng() * 2.4;
      ctx.fillStyle = rng() > 0.48 ? 'rgba(238, 208, 166, 0.46)' : 'rgba(34, 13, 6, 0.54)';
      ctx.beginPath();
      ctx.moveTo(px - rw, py);
      ctx.lineTo(px - rw * 0.3, py - rh);
      ctx.lineTo(px + rw, py - rh * 0.3);
      ctx.lineTo(px + rw * 0.5, py + rh);
      ctx.closePath();
      ctx.fill();
    }

    // -------------------------------------------------------------------------
    // Step 7: Genuine Flint-Pecked Lower Cliff Petroglyphs (ZERO setLineDash / ZERO arc!)
    // -------------------------------------------------------------------------
    const drawPeckedGazelle = (ox, oy, sc = 1.0) => {
      const x = (u) => ox + u * sc;
      const y = (v) => oy + v * sc;
      drawPeckedPetroglyph(ctx, [[x(-28), y(2)], [x(-8), y(-6)], [x(18), y(-5)], [x(28), y(-22)], [x(39), y(-20)]], toothGrid, rng, 0.52);
      drawPeckedPetroglyph(ctx, [[x(-28), y(2)], [x(-12), y(9)], [x(18), y(7)], [x(28), y(-22)]], toothGrid, rng, 0.45);
      // Swept scimitar horns
      drawPeckedPetroglyph(ctx, [[x(30), y(-22)], [x(13), y(-41)], [x(-9), y(-46)]], toothGrid, rng, 0.54);
      drawPeckedPetroglyph(ctx, [[x(-20), y(6)], [x(-38), y(26)]], toothGrid, rng, 0.46);
      drawPeckedPetroglyph(ctx, [[x(-12), y(8)], [x(-22), y(28)]], toothGrid, rng, 0.42);
      drawPeckedPetroglyph(ctx, [[x(15), y(6)], [x(34), y(22)]], toothGrid, rng, 0.46);
      drawPeckedPetroglyph(ctx, [[x(19), y(5)], [x(40), y(16)]], toothGrid, rng, 0.42);
    };
    drawPeckedGazelle(355, 815, 1.05);
    drawPeckedGazelle(488, 846, 0.88);
    drawPeckedGazelle(748, 808, 0.96);

    // Pecked Archer pursuing gazelles (x = 228, y = 825 — head also pecked polygon, zero arc!)
    drawPeckedPetroglyph(ctx, [[228, 791], [225, 825], [208, 854]], toothGrid, rng, 0.50);
    drawPeckedPetroglyph(ctx, [[225, 825], [244, 852]], toothGrid, rng, 0.50);
    drawPeckedPetroglyph(ctx, [[212, 806], [247, 802]], toothGrid, rng, 0.48);
    drawPeckedPetroglyph(ctx, [[241, 783], [254, 802], [241, 821]], toothGrid, rng, 0.52);
    const archerHead = [];
    for (let k = 0; k <= 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      archerHead.push([229 + Math.cos(a) * 6.2, 783 + Math.sin(a) * 6.2]);
    }
    drawPeckedPetroglyph(ctx, archerHead, toothGrid, rng, 0.50);

    // Pecked Prehistoric Solar Spiral / Wheel Petroglyph at (615, 882)
    const solarRing = [];
    for (let k = 0; k <= 18; k++) {
      const a = (k / 18) * Math.PI * 2;
      const r = 23 + (rng() - 0.5) * 2.4;
      solarRing.push([615 + Math.cos(a) * r, 882 + Math.sin(a) * r]);
    }
    drawPeckedPetroglyph(ctx, solarRing, toothGrid, rng, 0.46);
    drawPeckedPetroglyph(ctx, [[592, 882], [615, 881], [638, 883]], toothGrid, rng, 0.44);
    drawPeckedPetroglyph(ctx, [[615, 859], [614, 882], [616, 905]], toothGrid, rng, 0.44);

    // -------------------------------------------------------------------------
    // Step 8: Geological Branching Sandstone Fissures
    // -------------------------------------------------------------------------
    for (let c = 0; c < 18; c++) {
      let cx = rng() * PANEL_SIZE;
      let cy = rng() * PANEL_SIZE;
      let ang = (rng() - 0.5) * 1.2 + (rng() > 0.5 ? 0.4 : 1.3);
      const segs = 6 + ((rng() * 6) | 0);
      const crackPts = [[cx, cy]];
      for (let k = 0; k < segs; k++) {
        ang += (rng() - 0.5) * 0.55;
        const len = 14 + rng() * 30;
        cx += Math.cos(ang) * len;
        cy += Math.sin(ang) * len;
        crackPts.push([cx, cy]);
      }
      drawRockToothStroke(ctx, crackPts, toothGrid, rng, {
        color: '#200c05',
        width: 1.6,
        strands: 2,
        edgeSkip: 0.25,
        coreSkip: 0.08,
        alpha: 0.36,
      });
      drawRockToothStroke(
        ctx,
        crackPts.map(([px, py]) => [px + 1.4, py + 1.2]),
        toothGrid,
        rng,
        {
          color: '#f5dfc0',
          width: 1.1,
          strands: 2,
          edgeSkip: 0.48,
          coreSkip: 0.22,
          alpha: 0.24,
        }
      );
    }
  });

  _cachedSaharaAssets = { wall, toothGrid };
  return _cachedSaharaAssets;
}

/**
 * Helper: Sculpted Tassili Bovidian Human Limb (swelling thigh -> knee -> curved calf belly -> fine ankle -> foot!).
 * Directly implements Director #85 Critique #2: "小腿肚微鼓收细踝，改掉等粗直棍腿".
 */
function buildTassiliHumanLegPoly(hipX, hipY, kneeX, kneeY, footX, footY, toeDir = 1) {
  // Thigh vector & normal
  const tdx = kneeX - hipX;
  const tdy = kneeY - hipY;
  const tLen = Math.hypot(tdx, tdy) || 1;
  const tnx = -tdy / tLen;
  const tny = tdx / tLen;

  // Calf vector & normal
  const cdx = footX - kneeX;
  const cdy = footY - kneeY;
  const cLen = Math.hypot(cdx, cdy) || 1;
  const cnx = -cdy / cLen;
  const cny = cdx / cLen;

  const calfMidX = lerp(kneeX, footX, 0.40);
  const calfMidY = lerp(kneeY, footY, 0.40);
  const ankleX = lerp(kneeX, footX, 0.88);
  const ankleY = lerp(kneeY, footY, 0.88);

  return [
    [hipX - tnx * 3.8, hipY - tny * 3.8],
    [lerp(hipX, kneeX, 0.45) - tnx * 3.4, lerp(hipY, kneeY, 0.45) - tny * 3.4],
    [kneeX - cnx * 2.1, kneeY - cny * 2.1],
    // Posterior calf muscle swell (小腿肚微鼓!)
    [calfMidX - cnx * 3.3 * toeDir, calfMidY - cny * 3.3 * toeDir],
    // Tapered fine ankle (收细踝!)
    [ankleX - cnx * 1.15, ankleY - cny * 1.15],
    [footX - toeDir * 1.8, footY + 0.8],
    [footX + toeDir * 5.8, footY + 0.6],
    [footX + toeDir * 2.2, footY - 1.5],
    [ankleX + cnx * 1.15, ankleY + cny * 1.15],
    [calfMidX + cnx * 1.8 * toeDir, calfMidY + cny * 1.8 * toeDir],
    [kneeX + cnx * 2.0, kneeY + cny * 2.0],
    [lerp(hipX, kneeX, 0.5) + tnx * 3.2, lerp(hipY, kneeY, 0.5) + tny * 3.2],
    [hipX + tnx * 3.6, hipY + tny * 3.6],
  ];
}

/**
 * Helper: Sculpted Bovine Leg (muscular upper leg -> hock/knee -> slender cannon bone -> fetlock & cloven hoof).
 */
function buildBovineLegPoly(topX, topY, midX, midY, hoofX, hoofY) {
  return [
    [topX - 3.6, topY],
    [midX - 2.1, midY],
    [lerp(midX, hoofX, 0.78) - 1.1, lerp(midY, hoofY, 0.78)],
    [hoofX - 1.5, hoofY],
    [hoofX + 3.2, hoofY],
    [hoofX + 1.8, hoofY - 2.2],
    [lerp(midX, hoofX, 0.78) + 1.2, lerp(midY, hoofY, 0.78)],
    [midX + 2.2, midY],
    [topX + 3.8, topY],
  ];
}

/**
 * Draws Tassili Bovidian Long-Horned Cattle & Attenuated Pastoralists on elevated rock terraces (y = 504..544):
 * - Anatomical Bovidian proportions, dappled rock-tooth hide patches, wet-white kaolin lyre horns;
 * - Cascading spatial domino reaction wave as `pelicanLocalX` rolls beneath each terrace figure (`x ∈ [150..880]`):
 *   startled cattle rear their forelegs & throw their white-kaolin lyre horns skyward, while pastoralist herders
 *   visibly leap (`dy = -8..-14px`) and fling BOTH attenuated arms + curved acacia throwing-sticks/bows high overhead!
 */
function drawTassiliHerdAndHerders(ctx, kit, toothGrid, localT, pelicanLocalX, isOutroThumbnail) {
  // Subtle ritual step-quantized time (14 Hz prehistoric flicker-dance cadence) for pastoral figures
  const ritualT = Math.floor(localT * 14) / 14;
  const ritualPelX = isOutroThumbnail ? 500 : Math.floor(pelicanLocalX / 8) * 8;

  const cattleSpecs = [
    { x: 150, y: 539, scale: 0.92, baseCol: PIGMENT.hematite, patchCol: PIGMENT.kaolin, hornType: 'lyre', baseDir: 1 },
    { x: 308, y: 506, scale: 0.95, baseCol: PIGMENT.charcoal, patchCol: PIGMENT.kaolinWarm, hornType: 'lyre', baseDir: 1 },
    { x: 556, y: 508, scale: 0.93, baseCol: PIGMENT.yellowOchre, patchCol: PIGMENT.hematite, hornType: 'crescent', baseDir: -1 },
    { x: 724, y: 542, scale: 0.96, baseCol: PIGMENT.hematiteDeep, patchCol: PIGMENT.kaolin, hornType: 'lyre', baseDir: 1 },
    { x: 856, y: 511, scale: 0.90, baseCol: PIGMENT.kaolinWarm, patchCol: PIGMENT.hematite, hornType: 'wide', baseDir: -1 },
  ];

  for (let i = 0; i < cattleSpecs.length; i++) {
    const c = cattleSpecs[i];
    const cRng = kit.makePRNG(3100 + i * 73);
    // Cascading spatial domino wave triggered as stone-wheeled pelican rolls under each terrace animal
    const waveRise = smoothstep(c.x - 195, c.x - 20, pelicanLocalX);
    const waveTail = 1.0 - 0.78 * smoothstep(c.x + 175, c.x + 425, pelicanLocalX);
    const sceneTail = 1.0 - smoothstep(5.35, 5.92, localT);
    const amaze = isOutroThumbnail
      ? (i >= 1 && i <= 3 ? 0.92 : 0.46)
      : clamp(waveRise * waveTail * sceneTail, 0, 1);

    const lookSign = c.baseDir;
    const ritualPulse = 0.65 + 0.35 * Math.abs(Math.sin(ritualT * Math.PI * 2 + i * 0.9));
    // Pronounced rear-back pivot (-0.30..-0.35 rad) anchored cleanly on planted hind hooves (-28, 0)
    const rearTilt = -amaze * (0.28 + 0.06 * ritualPulse);
    const pawKick = amaze * (8.5 + 5.5 * ritualPulse);

    const toW = (lx, ly) => {
      // Pivot around planted hindquarter base (-28, 0) so hind hooves stay grounded while chest & forelegs rear high!
      const rx0 = lx + 28;
      const ry0 = ly;
      const ca = Math.cos(rearTilt);
      const sa = Math.sin(rearTilt);
      const rx = rx0 * ca - ry0 * sa - 28;
      const ry = rx0 * sa + ry0 * ca;
      return [c.x + rx * c.scale * lookSign, c.y + ry * c.scale];
    };

    // 1. Four sculpted bovine legs (hind hooves braced on rock terrace, forelegs rearing & folding high in startled awe!)
    const hindLeg1 = [toW(-30, -21), [c.x + (-33 - amaze * 2) * c.scale * lookSign, c.y - 10 * c.scale], [c.x - 35 * c.scale * lookSign, c.y]];
    const hindLeg2 = [toW(-22, -20), [c.x + (-24 - amaze * 1.5) * c.scale * lookSign, c.y - 9 * c.scale], [c.x - 23 * c.scale * lookSign, c.y]];

    // Reared forelegs fold at carpal knee & kick cloven hooves 14..24px above the sandstone ledge!
    const foreLeg1 = [
      toW(18, -20),
      toW(25 + amaze * 7, -11 - amaze * 6),
      toW(21 + amaze * 5, -pawKick * 0.55),
    ];
    const foreLeg2 = [
      toW(25, -21),
      toW(34 + amaze * 9, -12 - amaze * 8),
      toW(31 + amaze * 9, -pawKick * 0.95),
    ];

    for (const leg of [hindLeg2, foreLeg1, hindLeg1, foreLeg2]) {
      const legPoly = buildBovineLegPoly(leg[0][0], leg[0][1], leg[1][0], leg[1][1], leg[2][0], leg[2][1]);
      fillRockToothPoly(ctx, legPoly, toothGrid, cRng, {
        color: c.baseCol,
        coreAlpha: 0.92,
        edgeWidth: 1.8,
        edgeSkip: 0.48,
        pinholeCount: 4,
      });
    }

    // 2. Whip-like tufted tail flicking skyward when startled!
    const tailWag = Math.sin(ritualT * 6.2 + i * 1.7) * 5;
    drawRockToothStroke(
      ctx,
      [
        toW(-36, -34),
        toW(-46 - amaze * 4, -22 - amaze * 24),
        toW(-44 + tailWag * 0.45, -5 - amaze * 38),
      ],
      toothGrid,
      cRng,
      { color: c.baseCol, width: 2.8 * c.scale, strands: 3, edgeSkip: 0.45, coreSkip: 0.1, alpha: 0.9 }
    );

    // 3. Naturalistic Tassili Bovidian Torso (curved withers hump, graceful lumbar dip, pendulous throat dewlap!)
    const torsoLocal = [
      [-37, -34], [-28, -41], [-12, -42], [6, -43],
      [18, -49], [27, -47], [33, -39], // cervico-thoracic hump
      [33, -24], [27, -16], // pendulous Tassili throat dewlap!
      [17, -18], [0, -15], [-18, -17], [-32, -20],
    ];
    const torsoWorld = torsoLocal.map(([lx, ly]) => toW(lx, ly));
    fillRockToothPoly(ctx, torsoWorld, toothGrid, cRng, {
      color: c.baseCol,
      coreAlpha: 0.93,
      edgeWidth: 3.4 * c.scale,
      edgeSkip: 0.50,
      pinholeCount: 18,
    });

    // 4. Organic Dappled Mineral Hide Patches (irregular hand-daubed patches)
    const patch1 = [
      [-17, -39], [-6, -42], [5, -39], [9, -30], [3, -20], [-9, -18], [-18, -26],
    ].map(([lx, ly]) => toW(lx, ly));
    const patch2 = [
      [14, -36], [24, -39], [29, -30], [24, -20], [15, -23],
    ].map(([lx, ly]) => toW(lx, ly));
    fillRockToothPoly(ctx, patch1, toothGrid, cRng, {
      color: c.patchCol,
      coreAlpha: 0.91,
      edgeWidth: 2.6 * c.scale,
      edgeSkip: 0.54,
      pinholeCount: 8,
    });
    fillRockToothPoly(ctx, patch2, toothGrid, cRng, {
      color: c.patchCol,
      coreAlpha: 0.90,
      edgeWidth: 2.2 * c.scale,
      edgeSkip: 0.54,
      pinholeCount: 5,
    });

    // Charcoal dorsal spine brush accent
    drawRockToothStroke(
      ctx,
      [toW(-36, -34), toW(-12, -42), toW(16, -48), toW(31, -41)],
      toothGrid,
      cRng,
      { color: PIGMENT.charcoal, width: 2.2 * c.scale, strands: 3, edgeSkip: 0.45, coreSkip: 0.12, alpha: 0.88 }
    );

    // 5. Bovine Head + Grand Wet-White Kaolin Lyre Horns pitched dramatically skyward on wave crest!
    const chew = (1 - amaze) * Math.sin(ritualT * 6.5 + i * 2.1) * 0.06;
    const neckAngle = lerp(0.84 + chew, -1.04, amaze);
    const [neckPivotX, neckPivotY] = toW(29, -36);
    const toHead = (hx, hy) => {
      const ca = Math.cos(neckAngle);
      const sa = Math.sin(neckAngle);
      const rx = hx * ca - hy * sa;
      const ry = hx * sa + hy * ca;
      return [neckPivotX + rx * c.scale * lookSign, neckPivotY + ry * c.scale];
    };

    const headPoly = [
      [-5, -7], [10, -10], [22, -10], [33, -4], [31, 3 + amaze * 4.2], [15, 5 + amaze * 1.5], [-4, 7],
    ].map(([hx, hy]) => toHead(hx, hy));
    fillRockToothPoly(ctx, headPoly, toothGrid, cRng, {
      color: c.baseCol,
      coreAlpha: 0.93,
      edgeWidth: 2.4 * c.scale,
      edgeSkip: 0.48,
      pinholeCount: 5,
    });

    // Grand sweeping wet-white kaolin lyre horns (thick tapered multi-bristle kaolin strokes!)
    let horn1Pts;
    let horn2Pts;
    if (c.hornType === 'lyre') {
      horn1Pts = [[15, -9], [9, -26], [16, -45], [24, -60], [17, -73]];
      horn2Pts = [[19, -9], [25, -24], [35, -40], [40, -54], [34, -68]];
    } else if (c.hornType === 'wide') {
      horn1Pts = [[15, -9], [5, -27], [-4, -44], [-12, -57]];
      horn2Pts = [[20, -9], [31, -26], [41, -40], [48, -50]];
    } else {
      horn1Pts = [[15, -9], [16, -27], [24, -44], [33, -57]];
      horn2Pts = [[19, -9], [27, -26], [37, -40], [46, -50]];
    }
    for (const hPts of [horn1Pts, horn2Pts]) {
      const wHorn = hPts.map(([hx, hy]) => toHead(hx, hy));
      drawRockToothStroke(ctx, wHorn, toothGrid, cRng, {
        color: PIGMENT.kaolin,
        width: 4.8 * c.scale,
        strands: 5,
        edgeSkip: 0.34,
        coreSkip: 0.04,
        alpha: 0.98,
      });
    }

    // Archaic hand-daubed kaolin eye ring when startled
    if (amaze > 0.20) {
      const [ex, ey] = toHead(21, -4);
      const eyePts = [];
      for (let k = 0; k <= 7; k++) {
        const a = (k / 7) * Math.PI * 2;
        eyePts.push([ex + Math.cos(a) * 3.8 * c.scale, ey + Math.sin(a) * 3.2 * c.scale]);
      }
      drawRockToothStroke(ctx, eyePts, toothGrid, cRng, {
        color: PIGMENT.kaolin, width: 2.0 * c.scale, strands: 3, edgeSkip: 0.3, coreSkip: 0.05, alpha: 0.95,
      });
      ctx.fillStyle = PIGMENT.charcoal;
      ctx.fillRect(ex - 1.2 * c.scale, ey - 1.2 * c.scale, 2.6 * c.scale, 2.6 * c.scale);
    }

    if (amaze > 0.55) {
      const pulse = 0.72 + 0.28 * Math.sin(ritualT * Math.PI * 4 + i);
      for (let r = -1; r <= 1; r++) {
        drawRockToothStroke(
          ctx,
          [toHead(24 + r * 8, -72), toHead(24 + r * 12, -84)],
          toothGrid,
          cRng,
          { color: PIGMENT.limoniteLight, width: 2.5 * c.scale, strands: 3, edgeSkip: 0.4, alpha: (amaze - 0.50) * 1.9 * pulse }
        );
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 4 Attenuated Tassili Bovidian Herders — Cascading Ritual Leap & Overhead Throwing-Stick/Bow Salute!
  // ---------------------------------------------------------------------------
  const herders = [
    { x: 224, y: 540, h: 1.03, kitType: 'bow_and_stick' },
    { x: 398, y: 510, h: 1.07, kitType: 'twin_sticks' },
    { x: 642, y: 512, h: 1.03, kitType: 'staff_and_stick' },
    { x: 804, y: 540, h: 1.05, kitType: 'bow_and_stick' },
  ];

  // Helper: Saharan S-Curved / Boomerang-Elbowed Acacia Throwing-Stick (`金合欢弯木投掷棒`)
  const drawAcaciaThrowingStick = (hRng, handX, handY, angleRad, scaleH, mirrorDir = 1) => {
    const ca = Math.cos(angleRad);
    const sa = Math.sin(angleRad);
    const sPt = (lx, ly) => [
      handX + (lx * mirrorDir * ca - ly * sa) * scaleH,
      handY + (lx * mirrorDir * sa + ly * ca) * scaleH,
    ];
    const stickPts = [
      sPt(-5, 6),
      sPt(1, 0),
      sPt(9, -11),
      sPt(17, -18),
      sPt(29, -15),
      sPt(36, -8),
    ];
    drawRockToothStroke(ctx, stickPts, toothGrid, hRng, {
      color: PIGMENT.charcoal, width: 4.1 * scaleH, strands: 4, edgeSkip: 0.38, coreSkip: 0.05, alpha: 0.94,
    });
    drawRockToothStroke(ctx, stickPts, toothGrid, hRng, {
      color: PIGMENT.yellowOchre, width: 2.5 * scaleH, strands: 3, edgeSkip: 0.38, coreSkip: 0.06, alpha: 0.96,
    });
    // Kaolin sinew grip-wrap at handle & tip band
    drawRockToothStroke(ctx, [sPt(-2, 4), sPt(3, -3)], toothGrid, hRng, {
      color: PIGMENT.kaolin, width: 2.4 * scaleH, strands: 2, edgeSkip: 0.32, alpha: 0.92,
    });
    drawRockToothStroke(ctx, [sPt(26, -15), sPt(31, -12)], toothGrid, hRng, {
      color: PIGMENT.hematite, width: 2.3 * scaleH, strands: 2, edgeSkip: 0.35, alpha: 0.90,
    });
  };

  // Helper: Triple-Curve Tassili Pastoralist Hunting Bow (`反曲猎弓`)
  const drawTassiliBow = (hRng, handX, handY, angleRad, scaleH, faceDir = 1) => {
    const ca = Math.cos(angleRad);
    const sa = Math.sin(angleRad);
    const bPt = (lx, ly) => [
      handX + (lx * faceDir * ca - ly * sa) * scaleH,
      handY + (lx * faceDir * sa + ly * ca) * scaleH,
    ];
    const bowStave = [
      bPt(-22, -8),
      bPt(-12, -16),
      bPt(0, -11),
      bPt(12, -16),
      bPt(22, -8),
    ];
    drawRockToothStroke(ctx, bowStave, toothGrid, hRng, {
      color: PIGMENT.charcoal, width: 4.0 * scaleH, strands: 4, edgeSkip: 0.38, coreSkip: 0.05, alpha: 0.94,
    });
    drawRockToothStroke(ctx, bowStave, toothGrid, hRng, {
      color: PIGMENT.limoniteLight, width: 2.5 * scaleH, strands: 3, edgeSkip: 0.38, coreSkip: 0.06, alpha: 0.96,
    });
    drawRockToothStroke(ctx, [bowStave[0], bowStave[bowStave.length - 1]], toothGrid, hRng, {
      color: PIGMENT.kaolin, width: 1.35 * scaleH, strands: 2, edgeSkip: 0.32, alpha: 0.88,
    });
  };

  for (let i = 0; i < herders.length; i++) {
    const hd = herders[i];
    const hRng = kit.makePRNG(5200 + i * 89);
    // Exact spatial wave triggered as stone-wheeled pelican rolls under each herder (`hx - 180 .. hx - 20`)
    const waveRise = smoothstep(hd.x - 180, hd.x - 20, pelicanLocalX);
    const waveCrest = waveRise * (1.0 - smoothstep(hd.x + 175, hd.x + 365, pelicanLocalX));
    const afterglow = waveRise * 0.30 * (1.0 - smoothstep(5.35, 5.92, localT));
    const shock = isOutroThumbnail
      ? (i === 1 || i === 2 ? 0.96 : 0.52)
      : clamp(Math.max(waveCrest, afterglow), 0, 1);

    const faceSign = ritualPelX >= hd.x - 12 ? 1 : -1;

    const walkSwing = (1 - shock) * Math.sin(ritualT * 5.5 + i * 1.6) * 8.0;
    // Guaranteed visible prehistoric rock-painted hop (`dy = -8..-14px`) during active wave crest!
    const beatPulse = 0.58 + 0.42 * Math.abs(Math.sin(ritualT * Math.PI * 2 + i * 0.85));
    const hopLift = isOutroThumbnail
      ? (i === 1 || i === 2 ? 11.5 : 4.5)
      : smoothstep(0.24, 0.82, waveCrest) * (8.5 + 5.5 * beatPulse);
    const leanBack = -shock * 0.19;

    // Subtle dry-rubbed ochre ground shadow & kicked pebble flecks on ledge at launch point when airborne!
    if (hopLift > 3.5) {
      drawRockToothStroke(
        ctx,
        [[hd.x - 13, hd.y + 1.5], [hd.x + 13, hd.y + 1.5]],
        toothGrid,
        hRng,
        { color: PIGMENT.hematiteDeep, width: 3.0, strands: 3, edgeSkip: 0.52, alpha: 0.42 }
      );
      for (let pf = -1; pf <= 1; pf += 2) {
        ctx.fillStyle = pf < 0 ? PIGMENT.kaolin : PIGMENT.yellowOchre;
        ctx.fillRect(hd.x + pf * (8 + hopLift * 0.45), hd.y - 2 - hopLift * 0.25, 2.4, 2.0);
      }
    }

    const baseX = hd.x;
    const baseY = hd.y - hopLift;
    const leapPose = smoothstep(0.32, 0.85, shock);
    const wPt = (lx, ly) => [baseX + lx * hd.h * faceSign, baseY + ly * hd.h];
    const wTorso = (tx, ty) => {
      const ca = Math.cos(leanBack);
      const sa = Math.sin(leanBack);
      const rx = tx * ca - ty * sa;
      const ry = tx * sa + ty * ca - 40;
      return wPt(rx, ry);
    };

    // 1. Sculpted Tassili Bovidian Legs (tucked/splayed in dynamic airborne scissor-leap when hopping!)
    const lHip = wPt(-2.5, -40);
    const lKnee = wPt(-9 - walkSwing * 0.45 - leapPose * 8.5, -20 - leapPose * 3.5);
    const lFoot = wPt(-14 - walkSwing - leapPose * 12.5, -leapPose * 2.5);

    const rHip = wPt(2.5, -40);
    const rKnee = wPt(8.5 + walkSwing * 0.45 + leapPose * 9.5, -19 - leapPose * 4.5);
    const rFoot = wPt(11.5 + walkSwing + leapPose * 12.0, -leapPose * 3.0);

    for (const [hp, kn, ft] of [[lHip, lKnee, lFoot], [rHip, rKnee, rFoot]]) {
      const legPoly = buildTassiliHumanLegPoly(hp[0], hp[1], kn[0], kn[1], ft[0], ft[1], faceSign);
      fillRockToothPoly(ctx, legPoly, toothGrid, hRng, {
        color: PIGMENT.hematiteDeep,
        coreAlpha: 0.94,
        edgeWidth: 1.8,
        edgeSkip: 0.48,
        pinholeCount: 5,
      });
    }

    // 2. Elongated Inverted-Triangle Bovidian Torso & Narrow Waist (倒三角修长躯干!)
    const torsoPoly = [
      wTorso(-2.8, 1),
      wTorso(-4.2, -9),
      wTorso(-13.8, -32), // broad sculpted athletic shoulder
      wTorso(0, -34),
      wTorso(13.8, -32),
      wTorso(4.2, -9),
      wTorso(2.8, 1),
    ];
    fillRockToothPoly(ctx, torsoPoly, toothGrid, hRng, {
      color: PIGMENT.hematiteDeep,
      coreAlpha: 0.94,
      edgeWidth: 2.2,
      edgeSkip: 0.48,
      pinholeCount: 8,
    });

    // White kaolin ceremonial loincloth + fluttering hip sash + crossed chest bands
    const kiltPoly = [wTorso(-5.5, -2), wTorso(6.5, -2), wTorso(5 + leapPose * 3, 9), wTorso(-7.5 - leapPose * 3, 7)];
    fillRockToothPoly(ctx, kiltPoly, toothGrid, hRng, {
      color: PIGMENT.kaolin,
      coreAlpha: 0.92,
      edgeWidth: 1.6,
      edgeSkip: 0.45,
      pinholeCount: 3,
    });
    drawRockToothStroke(ctx, [wTorso(-10, -30), wTorso(4, -3)], toothGrid, hRng, {
      color: PIGMENT.kaolin, width: 1.8, strands: 3, edgeSkip: 0.4, alpha: 0.9,
    });
    drawRockToothStroke(ctx, [wTorso(10, -30), wTorso(-4, -3)], toothGrid, hRng, {
      color: PIGMENT.kaolin, width: 1.8, strands: 3, edgeSkip: 0.4, alpha: 0.9,
    });

    // 3. Organic Tassili Lobed Coiffure Head + White Ostrich Feather Plumes
    const headPoly = [
      wTorso(-4, -35), wTorso(-7, -42), wTorso(-5, -49),
      wTorso(2, -50), wTorso(7, -44), wTorso(5.5, -36),
    ];
    fillRockToothPoly(ctx, headPoly, toothGrid, hRng, {
      color: PIGMENT.hematiteDeep,
      coreAlpha: 0.94,
      edgeWidth: 1.8,
      edgeSkip: 0.45,
      pinholeCount: 3,
    });
    drawRockToothStroke(ctx, [wTorso(-2, -49), wTorso(-9, -59), wTorso(-15, -65)], toothGrid, hRng, {
      color: PIGMENT.kaolin, width: 2.4, strands: 3, edgeSkip: 0.35, alpha: 0.94,
    });
    drawRockToothStroke(ctx, [wTorso(1, -50), wTorso(-3, -61), wTorso(-6, -68)], toothGrid, hRng, {
      color: PIGMENT.kaolin, width: 2.2, strands: 3, edgeSkip: 0.35, alpha: 0.92,
    });

    // 4. BOTH Attenuated Arms + Curved Acacia Throwing-Sticks & Bows Flung High Overhead in Jubilant Awe!
    const armWave = shock * Math.sin(ritualT * Math.PI * 4 + i * 1.1) * 3.2;
    const lElbow = wTorso(lerp(-18, -24, shock), lerp(-16, -45, shock));
    const lHand = wTorso(lerp(-14, -20 + armWave * 0.6, shock), lerp(-7, -64, shock));
    const rElbow = wTorso(lerp(18, 24, shock), lerp(-17, -46, shock));
    const rHand = wTorso(lerp(15, 21 - armWave * 0.6, shock), lerp(-9, -66, shock));

    // Upper arms (fuller deltoid/bicep) -> slender attenuated forearms + kaolin upper-armlet bands!
    drawRockToothStroke(ctx, [wTorso(-12.5, -30), lElbow], toothGrid, hRng, {
      color: PIGMENT.hematiteDeep, width: 3.9 * hd.h, strands: 4, edgeSkip: 0.42, alpha: 0.95,
    });
    drawRockToothStroke(ctx, [lElbow, lHand], toothGrid, hRng, {
      color: PIGMENT.hematiteDeep, width: 2.8 * hd.h, strands: 3, edgeSkip: 0.42, alpha: 0.95,
    });
    drawRockToothStroke(ctx, [wTorso(12.5, -30), rElbow], toothGrid, hRng, {
      color: PIGMENT.hematiteDeep, width: 3.9 * hd.h, strands: 4, edgeSkip: 0.42, alpha: 0.95,
    });
    drawRockToothStroke(ctx, [rElbow, rHand], toothGrid, hRng, {
      color: PIGMENT.hematiteDeep, width: 2.8 * hd.h, strands: 3, edgeSkip: 0.42, alpha: 0.95,
    });

    // Kaolin ceremonial ivory arm-rings on upper arms
    const lBand = [lerp(wTorso(-12.5, -30)[0], lElbow[0], 0.55), lerp(wTorso(-12.5, -30)[1], lElbow[1], 0.55)];
    const rBand = [lerp(wTorso(12.5, -30)[0], rElbow[0], 0.55), lerp(wTorso(12.5, -30)[1], rElbow[1], 0.55)];
    ctx.fillStyle = PIGMENT.kaolin;
    ctx.fillRect(lBand[0] - 2.2, lBand[1] - 1.5, 4.4, 2.6);
    ctx.fillRect(rBand[0] - 2.2, rBand[1] - 1.5, 4.4, 2.6);

    // Implements carried low at rest (shock=0) and flung high into the sky on wave crest (shock->1)!
    if (hd.kitType === 'bow_and_stick') {
      const bowTilt = lerp(1.32 * faceSign, -0.18 * faceSign, shock);
      drawTassiliBow(hRng, rHand[0], rHand[1], bowTilt, hd.h, faceSign);
      const stickTilt = lerp(0.95, -0.55, shock);
      drawAcaciaThrowingStick(hRng, lHand[0], lHand[1], stickTilt, hd.h, -faceSign);
    } else if (hd.kitType === 'twin_sticks') {
      drawAcaciaThrowingStick(hRng, lHand[0], lHand[1], lerp(0.92, -0.52, shock), hd.h, -faceSign);
      drawAcaciaThrowingStick(hRng, rHand[0], rHand[1], lerp(0.88, -0.62, shock), hd.h, faceSign);
    } else {
      // Crooked acacia pastoral herding staff flung skyward in front hand + curved throwing-stick in rear hand!
      const staffTop = wTorso(lerp(20, 34, shock), lerp(-44, -96, shock));
      const staffBot = wTorso(lerp(13, 8, shock), lerp(36, -38, shock));
      drawRockToothStroke(
        ctx,
        [
          staffBot,
          rHand,
          staffTop,
          [staffTop[0] + 6 * faceSign * hd.h, staffTop[1] - 4 * hd.h],
          [staffTop[0] + 10 * faceSign * hd.h, staffTop[1] + 2 * hd.h],
        ],
        toothGrid,
        hRng,
        { color: PIGMENT.charcoal, width: 2.9 * hd.h, strands: 3, edgeSkip: 0.38, alpha: 0.94 }
      );
      drawAcaciaThrowingStick(hRng, lHand[0], lHand[1], lerp(0.90, -0.58, shock), hd.h, -faceSign);
    }

    // Prehistoric ochre ritual jubilation ticks radiating above raised hands at wave crest
    if (shock > 0.62) {
      const rayAlpha = (shock - 0.60) * 2.1;
      for (let r = -1; r <= 1; r++) {
        drawRockToothStroke(
          ctx,
          [wTorso(r * 13, -76), wTorso(r * 18, -87)],
          toothGrid,
          hRng,
          { color: r === 0 ? PIGMENT.kaolin : PIGMENT.limoniteLight, width: 2.2 * hd.h, strands: 2, edgeSkip: 0.38, alpha: rayAlpha }
        );
      }
    }
  }
}

/**
 * Draws the Bespoke Saharan Cave-Art Pelican & Neolithic Bent-Acacia Bow-Beam + Knapped Sandstone-Disc Bicycle!
 * - ZERO radial-gradient glow balls, ZERO setLineDash, ZERO roundRect, ZERO arc circles!
 * - Core body & stone wheels maintain >= 91% solid mineral pigment coverage; outer bristles catch world-space rock tooth!
 */
function drawSaharaPelicanAndBike(ctx, kit, toothGrid, rig, localT) {
  const s = rig.root.scale;
  const rng = kit.makePRNG(10109);

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Helper: Gnarled Fire-Bent Acacia Timber Limb (three-tone bark + knots + world-space rock tooth)
  const drawBentAcaciaLimb = (pts, thick, stubIdx = -1, stubDir = 1) => {
    drawRockToothStroke(ctx, pts, toothGrid, rng, {
      color: PIGMENT.charcoal,
      width: (thick + 3.0) * s,
      strands: 6,
      edgeSkip: 0.42,
      coreSkip: 0.04,
      alpha: 0.96,
    });
    drawRockToothStroke(ctx, pts, toothGrid, rng, {
      color: PIGMENT.hematite,
      width: thick * s,
      strands: 6,
      edgeSkip: 0.44,
      coreSkip: 0.05,
      alpha: 0.94,
    });
    drawRockToothStroke(
      ctx,
      pts.map(([px, py]) => [px, py - 1.2 * s]),
      toothGrid,
      rng,
      {
        color: PIGMENT.limoniteLight,
        width: thick * 0.42 * s,
        strands: 4,
        edgeSkip: 0.54,
        coreSkip: 0.16,
        alpha: 0.78,
      }
    );

    if (stubIdx >= 0 && stubIdx < pts.length - 1) {
      const [sx, sy] = pts[stubIdx];
      const [nx, ny] = pts[stubIdx + 1];
      const dx = nx - sx;
      const dy = ny - sy;
      const dl = Math.hypot(dx, dy) || 1;
      const px = -dy / dl;
      const py = dx / dl;
      drawRockToothStroke(
        ctx,
        [[sx, sy], [sx + (dx / dl) * 11 * s + px * 9.5 * stubDir * s, sy + (dy / dl) * 11 * s + py * 9.5 * stubDir * s]],
        toothGrid,
        rng,
        { color: PIGMENT.charcoal, width: 4.0 * s, strands: 4, edgeSkip: 0.4, alpha: 0.92 }
      );
    }
  };

  // Helper: Rawhide Cross-Lashing & Swinging Leather Thong
  const drawRawhideLashing = (jx, jy, rad = 6.8, hasTail = true) => {
    const wraps = [
      [[jx - rad * s, jy - rad * 0.72 * s], [jx + rad * s, jy + rad * 0.72 * s]],
      [[jx - rad * s, jy + rad * 0.72 * s], [jx + rad * s, jy - rad * 0.72 * s]],
      [[jx - rad * 0.3 * s, jy - rad * 0.9 * s], [jx + rad * 0.3 * s, jy + rad * 0.9 * s]],
    ];
    for (const wPts of wraps) {
      drawRockToothStroke(ctx, wPts, toothGrid, rng, {
        color: PIGMENT.charcoal, width: 4.4 * s, strands: 3, edgeSkip: 0.32, coreSkip: 0.04, alpha: 0.95,
      });
      drawRockToothStroke(ctx, wPts, toothGrid, rng, {
        color: PIGMENT.kaolin, width: 2.3 * s, strands: 3, edgeSkip: 0.36, coreSkip: 0.05, alpha: 0.92,
      });
    }
    if (hasTail) {
      const swing = Math.sin(localT * 6.4 + jx * 0.05) * 4.0 * s;
      drawRockToothStroke(
        ctx,
        [[jx, jy + 3 * s], [jx - 4 * s + swing * 0.7, jy + 11 * s], [jx - 6.5 * s + swing * 1.3, jy + 18 * s]],
        toothGrid,
        rng,
        { color: PIGMENT.kaolinWarm, width: 2.1 * s, strands: 3, edgeSkip: 0.42, alpha: 0.9 }
      );
    }
  };

  // Helper: Hand-Knapped Irregular Sandstone Disc Solar Wheel (>= 91% solid mineral core + chipped flint rim!)
  const drawKnappedStoneWheel = (w, seedOffset) => {
    const wRng = kit.makePRNG(4400 + seedOffset);
    const R = w.r;
    const facets = 22;
    const ca0 = Math.cos(w.angle);
    const sa0 = Math.sin(w.angle);
    const toWheelW = (lx, ly) => [w.x + lx * ca0 - ly * sa0, w.y + lx * sa0 + ly * ca0];

    const outerLocal = [];
    const bevelLocal = [];
    for (let i = 0; i < facets; i++) {
      const a = (i / facets) * Math.PI * 2;
      const chip = 0.91 + wRng() * 0.14;
      const bChip = chip * (0.72 + wRng() * 0.06);
      outerLocal.push([Math.cos(a) * R * chip, Math.sin(a) * R * chip]);
      bevelLocal.push([Math.cos(a) * R * bChip, Math.sin(a) * R * bChip]);
    }

    const outerWorld = outerLocal.map(([lx, ly]) => toWheelW(lx, ly));
    const bevelWorld = bevelLocal.map(([lx, ly]) => toWheelW(lx, ly));

    // Solid knapped sandstone wheel slab (>= 91% opaque mineral core so rock background never swallows the wheel!)
    fillRockToothPoly(ctx, outerWorld, toothGrid, wRng, {
      color: '#cfa16c',
      coreAlpha: 0.91,
      edgeWidth: 4.5 * s,
      edgeSkip: 0.50,
      pinholeCount: 24,
      pinholeCol: 'rgba(56, 24, 11, 0.36)',
    });

    // Inner pale kaolin-rubbed sandstone face
    fillRockToothPoly(ctx, bevelWorld, toothGrid, wRng, {
      color: '#e5c9a0',
      coreAlpha: 0.88,
      edgeWidth: 3.2 * s,
      edgeSkip: 0.52,
      pinholeCount: 16,
      pinholeCol: 'rgba(128, 54, 24, 0.30)',
    });

    // 6 Hand-daubed prehistoric solar spiral / spoke markings + rawhide cross-bindings
    const rayCount = 6;
    for (let r = 0; r < rayCount; r++) {
      const a = (r / rayCount) * Math.PI * 2;
      const p0 = toWheelW(Math.cos(a) * 8 * s, Math.sin(a) * 8 * s);
      const p1 = toWheelW(Math.cos(a + 0.16) * R * 0.48, Math.sin(a + 0.16) * R * 0.48);
      const p2 = toWheelW(Math.cos(a + 0.05) * R * 0.86, Math.sin(a + 0.05) * R * 0.86);
      drawRockToothStroke(ctx, [p0, p1, p2], toothGrid, wRng, {
        color: r % 2 === 0 ? PIGMENT.hematite : PIGMENT.kaolin,
        width: 4.8 * s,
        strands: 4,
        edgeSkip: 0.45,
        coreSkip: 0.08,
        alpha: 0.94,
      });
    }

    // Chipped charcoal flint outer rim
    drawRockToothStroke(ctx, [...outerWorld, outerWorld[0]], toothGrid, wRng, {
      color: PIGMENT.charcoal,
      width: 6.8 * s,
      strands: 6,
      edgeSkip: 0.42,
      coreSkip: 0.05,
      alpha: 0.97,
    });

    // Bone axle peg & rawhide cross-knot at wheel center
    const hubPoly = [];
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      hubPoly.push(toWheelW(Math.cos(a) * 9.5 * s, Math.sin(a) * 9.5 * s));
    }
    fillRockToothPoly(ctx, hubPoly, toothGrid, wRng, {
      color: PIGMENT.hematiteDeep, coreAlpha: 0.95, edgeWidth: 2.0 * s, edgeSkip: 0.4, pinholeCount: 2,
    });
    drawRawhideLashing(w.x, w.y, 5.6, false);
  };

  // Helper: Twisted Two-Ply Rawhide Sinew Cordage (replaces CSS setLineDash chain!)
  const drawTwistedSinewCord = (ax, ay, bx, by) => {
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const steps = Math.max(8, Math.floor(len / (5 * s)));
    const strandA = [];
    const strandB = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const twist = Math.sin(u * len * 0.42 - rig.rearWheel.angle * 3.0) * 2.1 * s;
      const px = ax + dx * u;
      const py = ay + dy * u;
      strandA.push([px + nx * twist, py + ny * twist]);
      strandB.push([px - nx * twist, py - ny * twist]);
    }
    drawRockToothStroke(ctx, strandA, toothGrid, rng, {
      color: PIGMENT.charcoal, width: 2.6 * s, strands: 3, edgeSkip: 0.35, coreSkip: 0.06, alpha: 0.92,
    });
    drawRockToothStroke(ctx, strandB, toothGrid, rng, {
      color: PIGMENT.kaolin, width: 2.4 * s, strands: 3, edgeSkip: 0.36, coreSkip: 0.06, alpha: 0.94,
    });
  };

  // Helper: Cave-Art Pelican Leg + Antler Crank + Knapped Flint Pedal (zero roundRect!)
  const drawCavePelicanLeg = (hipPt, kneePt, footPt, pedalPt, isFar) => {
    drawBentAcaciaLimb(
      [
        [rig.bb.x, rig.bb.y],
        [(rig.bb.x + pedalPt.x) * 0.5 + 2.5 * s, (rig.bb.y + pedalPt.y) * 0.5 - 2 * s],
        [pedalPt.x, pedalPt.y],
      ],
      4.6
    );

    const legCol = isFar ? PIGMENT.hematiteDeep : PIGMENT.hematiteBright;
    drawRockToothStroke(
      ctx,
      [
        [hipPt.x, hipPt.y],
        [(hipPt.x + kneePt.x) * 0.5 + 2.5 * s, (hipPt.y + kneePt.y) * 0.5],
        [kneePt.x, kneePt.y],
        [footPt.x, footPt.y],
      ],
      toothGrid,
      rng,
      { color: legCol, width: 7.0 * s, strands: 5, edgeSkip: 0.40, coreSkip: 0.05, alpha: 0.96 }
    );

    // Webbed foot polygon
    fillRockToothPoly(
      ctx,
      [
        [footPt.x - 4 * s, footPt.y],
        [footPt.x + 18 * s, footPt.y + 1 * s],
        [footPt.x + 12 * s, footPt.y + 5 * s],
        [footPt.x + 16 * s, footPt.y + 8 * s],
        [footPt.x - 5 * s, footPt.y + 6 * s],
      ],
      toothGrid,
      rng,
      { color: legCol, coreAlpha: 0.94, edgeWidth: 2.0 * s, edgeSkip: 0.42, pinholeCount: 2 }
    );

    // Lashed wooden/flint slab pedal (irregular chipped polygon, zero roundRect!)
    fillRockToothPoly(
      ctx,
      [
        [pedalPt.x - 11 * s, pedalPt.y + 1 * s],
        [pedalPt.x + 10 * s, pedalPt.y + 0.5 * s],
        [pedalPt.x + 11 * s, pedalPt.y + 6.5 * s],
        [pedalPt.x - 9.5 * s, pedalPt.y + 7 * s],
      ],
      toothGrid,
      rng,
      { color: PIGMENT.charcoal, coreAlpha: 0.95, edgeWidth: 1.8 * s, edgeSkip: 0.4, pinholeCount: 2 }
    );
  };

  // 0. Crushed Hematite & Ochre Grit Kicked Up Behind Rear Stone Wheel (irregular mineral shards, zero glow circles!)
  for (let d = 0; d < 9; d++) {
    const ph = (localT * 3.4 + d * 0.11) % 1;
    const gx = rig.rearWheel.x - 14 * s - ph * 58 * s + Math.sin(d * 4.1) * 5 * s;
    const gy = rig.root.y - 3 * s - Math.sin(ph * Math.PI) * (10 + (d % 3) * 5) * s;
    const sz = (2.2 + (1 - ph) * 3.2) * s;
    ctx.fillStyle = d % 3 === 0 ? PIGMENT.kaolin : d % 3 === 1 ? PIGMENT.hematite : PIGMENT.limoniteLight;
    ctx.globalAlpha = (1 - ph) * 0.72;
    ctx.fillRect(gx, gy, sz, sz * 0.8);
  }
  ctx.globalAlpha = 1;

  // 1. Far Leg
  drawCavePelicanLeg(rig.leftHip, rig.leftKnee, rig.leftFoot, rig.leftPedal, true);

  // 2. Hand-Knapped Sandstone Solar Wheels
  drawKnappedStoneWheel(rig.rearWheel, 1);
  drawKnappedStoneWheel(rig.frontWheel, 2);

  // 3. Twisted Two-Ply Sinew Cordage & Carved Bone Axle Spool (ZERO setLineDash / ZERO arc!)
  drawTwistedSinewCord(rig.rearWheel.x, rig.rearWheel.y - 5.5 * s, rig.bb.x, rig.bb.y - 12.5 * s);
  drawTwistedSinewCord(rig.rearWheel.x, rig.rearWheel.y + 5.5 * s, rig.bb.x, rig.bb.y + 12.5 * s);

  const boneSpool = [];
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2 + rig.rearWheel.angle;
    const r = (12.5 + (k % 2) * 1.8) * s;
    boneSpool.push([rig.bb.x + Math.cos(a) * r, rig.bb.y + Math.sin(a) * r]);
  }
  fillRockToothPoly(ctx, boneSpool, toothGrid, rng, {
    color: PIGMENT.kaolinWarm, coreAlpha: 0.92, edgeWidth: 2.8 * s, edgeSkip: 0.42, pinholeCount: 4,
  });

  // 4. Neolithic Fire-Bent Acacia Bow-Beam & Natural Y-Forked Branch Frame (Replaces modern road-bike diamond!)
  // Sweeping continuous arched bow-pole from front fork crown over saddle down to rear stone axle!
  const bowArchPts = [
    [rig.rearWheel.x, rig.rearWheel.y],
    [lerp(rig.rearWheel.x, rig.seatCluster.x, 0.52) - 8 * s, lerp(rig.rearWheel.y, rig.seatCluster.y, 0.52) - 10 * s],
    [rig.seatCluster.x, rig.seatCluster.y - 2 * s],
    [(rig.seatCluster.x + rig.headTop.x) * 0.5, Math.min(rig.seatCluster.y, rig.headTop.y) - 11 * s],
    [rig.headTop.x, rig.headTop.y],
  ];
  drawBentAcaciaLimb(bowArchPts, 8.2, 1, -1);

  // Natural Y-forked lower branch cradling the bone crank spool from headBot to rear axle
  const lowerForkPts = [
    [rig.headBot.x, rig.headBot.y],
    [lerp(rig.headBot.x, rig.bb.x, 0.55) - 4 * s, lerp(rig.headBot.y, rig.bb.y, 0.55) + 9 * s],
    [rig.bb.x, rig.bb.y],
    [(rig.bb.x + rig.rearWheel.x) * 0.5, rig.bb.y + 5 * s],
    [rig.rearWheel.x, rig.rearWheel.y],
  ];
  drawBentAcaciaLimb(lowerForkPts, 7.2, 0, 1);

  // Center forked branch strut tying bone spool up into the arched bow-pole
  drawBentAcaciaLimb(
    [
      [rig.bb.x, rig.bb.y],
      [(rig.bb.x + rig.seatCluster.x) * 0.5 + 5 * s, (rig.bb.y + rig.seatCluster.y) * 0.5],
      [rig.seatCluster.x, rig.seatCluster.y - 2 * s],
    ],
    6.8
  );

  // Curved forked front wooden fork + ibex-horn handlebar
  drawBentAcaciaLimb(
    [
      [rig.stemTop.x, rig.stemTop.y],
      [rig.headTop.x, rig.headTop.y],
      [(rig.headBot.x + rig.frontWheel.x) * 0.5 + 6 * s, (rig.headBot.y + rig.frontWheel.y) * 0.5 - 3 * s],
      [rig.frontWheel.x, rig.frontWheel.y],
    ],
    7.4,
    2,
    1
  );

  drawRockToothStroke(
    ctx,
    [
      [rig.stemTop.x + 12 * s, rig.stemTop.y - 11 * s],
      [rig.stemTop.x + 2 * s, rig.stemTop.y - 2 * s],
      [rig.handleGrip.x, rig.handleGrip.y],
    ],
    toothGrid,
    rng,
    { color: PIGMENT.kaolin, width: 6.2 * s, strands: 5, edgeSkip: 0.38, coreSkip: 0.04, alpha: 0.96 }
  );

  // Shamanic feather fetish swinging from horn handlebar
  const charmSwing = Math.sin(localT * 6.5) * 4.5 * s;
  drawRockToothStroke(
    ctx,
    [[rig.stemTop.x + 3 * s, rig.stemTop.y + 2 * s], [rig.stemTop.x + 3 * s + charmSwing, rig.stemTop.y + 18 * s]],
    toothGrid,
    rng,
    { color: PIGMENT.hematite, width: 2.2 * s, strands: 2, edgeSkip: 0.35, alpha: 0.9 }
  );
  fillRockToothPoly(
    ctx,
    [
      [rig.stemTop.x + 3 * s + charmSwing, rig.stemTop.y + 16 * s],
      [rig.stemTop.x + 7 * s + charmSwing, rig.stemTop.y + 23 * s],
      [rig.stemTop.x + 2 * s + charmSwing, rig.stemTop.y + 30 * s],
      [rig.stemTop.x - 2 * s + charmSwing, rig.stemTop.y + 23 * s],
    ],
    toothGrid,
    rng,
    { color: PIGMENT.kaolin, coreAlpha: 0.94, edgeWidth: 1.8 * s, edgeSkip: 0.45, pinholeCount: 2 }
  );

  // Prominent rawhide lashing knots at every branch junction
  drawRawhideLashing(rig.seatCluster.x, rig.seatCluster.y - 2 * s, 7.0, true);
  drawRawhideLashing(rig.bb.x, rig.bb.y, 6.6, false);
  drawRawhideLashing(rig.headTop.x, rig.headTop.y, 6.8, true);
  drawRawhideLashing(rig.headBot.x, rig.headBot.y, 6.0, true);

  // Spotted animal-hide saddle lashed over the bow-beam
  fillRockToothPoly(
    ctx,
    [
      [rig.saddle.x - 19 * s, rig.saddle.y - 2 * s],
      [rig.saddle.x - 4 * s, rig.saddle.y - 6 * s],
      [rig.saddle.x + 17 * s, rig.saddle.y + 1 * s],
      [rig.saddle.x + 3 * s, rig.saddle.y + 9 * s],
      [rig.saddle.x - 14 * s, rig.saddle.y + 5 * s],
    ],
    toothGrid,
    rng,
    { color: PIGMENT.charcoal, coreAlpha: 0.95, edgeWidth: 2.4 * s, edgeSkip: 0.45, pinholeCount: 3 }
  );
  ctx.fillStyle = PIGMENT.kaolin;
  for (let sp = -1; sp <= 1; sp++) {
    ctx.fillRect(rig.saddle.x + sp * 6.5 * s - 1.5 * s, rig.saddle.y - 0.5 * s, 3.2 * s, 2.8 * s);
  }

  // 5. Tassili Mineral-Pigment Pelican Torso (>= 93% solid kaolin core + world-space rock-tooth dry feather fringes!)
  const torsoPts = [
    [rig.tailTip.x - 13 * s, rig.tailTip.y - 3 * s],
    [rig.tailTip.x + 7 * s, rig.tailTip.y - 12 * s],
    [rig.tailTip.x - 4 * s, rig.tailTip.y - 19 * s],
    [rig.bodyCenter.x - 28 * s, rig.bodyCenter.y - 28 * s],
    [rig.bodyCenter.x - 4 * s, rig.bodyCenter.y - 26 * s],
    [rig.chest.x + 12 * s, rig.chest.y - 6 * s],
    [rig.chest.x + 16 * s, rig.chest.y + 11 * s],
    [rig.bodyCenter.x + 18 * s, rig.bodyCenter.y + 22 * s],
    [rig.hip.x - 14 * s, rig.hip.y + 15 * s],
    [rig.bodyCenter.x - 36 * s, rig.bodyCenter.y + 12 * s],
  ];
  fillRockToothPoly(ctx, torsoPts, toothGrid, rng, {
    color: PIGMENT.kaolin,
    coreAlpha: 0.94,
    edgeWidth: 5.2 * s,
    edgeSkip: 0.52,
    pinholeCount: 28,
    pinholeCol: 'rgba(136, 68, 32, 0.34)',
  });

  // Layered hematite & yellow-ochre mineral plumage slashes clipped to torso
  ctx.save();
  ctx.beginPath();
  torsoPts.forEach(([px, py], idx) => (idx === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  ctx.closePath();
  ctx.clip();
  for (let m = 0; m < 8; m++) {
    const my = rig.bodyCenter.y - 23 * s + m * 6.4 * s;
    drawRockToothStroke(
      ctx,
      [
        [rig.bodyCenter.x - 50 * s, my + 4 * s],
        [rig.bodyCenter.x - 6 * s, my - 3 * s],
        [rig.bodyCenter.x + 42 * s, my + 5 * s],
      ],
      toothGrid,
      rng,
      {
        color: m < 3 ? PIGMENT.hematite : m < 5 ? PIGMENT.yellowOchre : PIGMENT.hematiteBright,
        width: 6.2 * s,
        strands: 6,
        edgeSkip: 0.55,
        coreSkip: 0.16,
        alpha: 0.78,
      }
    );
  }
  ctx.restore();

  // S-Neck painted in thick kaolin clay + hematite dorsal shadow + charcoal mineral contour
  const neckSpine = [];
  for (let k = 0; k <= 9; k++) {
    const u = k / 9;
    const iu = 1 - u;
    const p0x = rig.chest.x - 1 * s;
    const p0y = rig.chest.y + 4 * s;
    neckSpine.push([
      iu * iu * iu * p0x + 3 * iu * iu * u * rig.neckC1.x + 3 * iu * u * u * rig.neckC2.x + u * u * u * rig.head.x,
      iu * iu * iu * p0y + 3 * iu * iu * u * rig.neckC1.y + 3 * iu * u * u * rig.neckC2.y + u * u * u * rig.head.y,
    ]);
  }
  drawRockToothStroke(ctx, neckSpine, toothGrid, rng, {
    color: PIGMENT.kaolin,
    width: 22 * s,
    strands: 9,
    edgeSkip: 0.48,
    coreSkip: 0.04,
    alpha: 0.96,
  });
  drawRockToothStroke(
    ctx,
    neckSpine.map(([nx, ny]) => [nx - 4.8 * s, ny]),
    toothGrid,
    rng,
    { color: PIGMENT.hematite, width: 9.0 * s, strands: 6, edgeSkip: 0.52, coreSkip: 0.12, alpha: 0.82 }
  );

  // Bold prehistoric charcoal & deep-hematite contour strokes
  drawRockToothStroke(
    ctx,
    [
      [rig.tailTip.x - 11 * s, rig.tailTip.y - 4 * s],
      [rig.bodyCenter.x - 27 * s, rig.bodyCenter.y - 26 * s],
      [rig.chest.x + 4 * s, rig.chest.y - 4 * s],
      ...neckSpine.map(([nx, ny]) => [nx - 8.5 * s, ny - 1 * s]),
    ],
    toothGrid,
    rng,
    { color: PIGMENT.charcoal, width: 4.2 * s, strands: 5, edgeSkip: 0.44, coreSkip: 0.05, alpha: 0.96 }
  );
  drawRockToothStroke(
    ctx,
    [
      ...neckSpine.map(([nx, ny]) => [nx + 8.5 * s, ny + 2 * s]).reverse(),
      [rig.chest.x + 11 * s, rig.chest.y + 9 * s],
      [rig.bodyCenter.x + 18 * s, rig.bodyCenter.y + 21 * s],
      [rig.hip.x - 14 * s, rig.hip.y + 14 * s],
      [rig.tailTip.x - 11 * s, rig.tailTip.y - 4 * s],
    ],
    toothGrid,
    rng,
    { color: PIGMENT.hematiteDeep, width: 4.0 * s, strands: 5, edgeSkip: 0.46, coreSkip: 0.06, alpha: 0.94 }
  );

  // Hand-stippled kaolin clay dots along dorsal ridge (irregular mineral dabs, zero arc!)
  for (let d = 0; d < 9; d++) {
    const du = d / 8;
    const dx = lerp(rig.tailTip.x + 10 * s, rig.chest.x - 2 * s, du);
    const dy = lerp(rig.tailTip.y - 6 * s, rig.chest.y + 2 * s, du) - Math.sin(du * Math.PI) * 12 * s;
    ctx.fillStyle = d % 2 === 0 ? PIGMENT.kaolin : PIGMENT.limoniteLight;
    ctx.fillRect(dx - 2.2 * s, dy - 2.0 * s, 4.4 * s, 3.8 * s);
  }

  // Sculpted Cave-Art Avian Skull + Swept Crown Plumes (organic polygon, zero arc!)
  const skullPts = [
    [rig.head.x - 13 * s, rig.head.y + 5 * s],
    [rig.head.x - 14 * s, rig.head.y - 6 * s],
    [rig.head.x - 4 * s, rig.head.y - 14 * s],
    [rig.head.x + 10 * s, rig.head.y - 11 * s],
    [rig.head.x + 16 * s, rig.head.y - 1 * s],
    [rig.head.x + 10 * s, rig.head.y + 10 * s],
  ];
  fillRockToothPoly(ctx, skullPts, toothGrid, rng, {
    color: PIGMENT.kaolin, coreAlpha: 0.95, edgeWidth: 4.2 * s, edgeSkip: 0.46, pinholeCount: 6,
  });
  drawRockToothStroke(
    ctx,
    [[rig.head.x - 7 * s, rig.head.y - 10 * s], [rig.crest1.x - 9 * s, rig.crest1.y - 5 * s]],
    toothGrid, rng, { color: PIGMENT.hematite, width: 4.8 * s, strands: 4, edgeSkip: 0.44, alpha: 0.94 }
  );
  drawRockToothStroke(
    ctx,
    [[rig.head.x - 10 * s, rig.head.y - 4 * s], [rig.crest2.x - 11 * s, rig.crest2.y]],
    toothGrid, rng, { color: PIGMENT.charcoal, width: 4.4 * s, strands: 4, edgeSkip: 0.44, alpha: 0.94 }
  );

  // 6. Gular Throat Pouch (>= 92% solid yellow-ochre core + coarse hematite/kaolin dry-rubbed folds!)
  const pouchPts = [
    [rig.beakLowerBase.x, rig.beakLowerBase.y],
    [lerp(rig.beakLowerBase.x, rig.pouchBelly.x, 0.5) - 4 * s, lerp(rig.beakLowerBase.y, rig.pouchBelly.y, 0.5) + 10 * s],
    [rig.pouchBelly.x, rig.pouchBelly.y + 4 * s],
    [lerp(rig.pouchBelly.x, rig.beakTip.x, 0.55) + 4 * s, lerp(rig.pouchBelly.y, rig.beakTip.y, 0.55) + 5 * s],
    [rig.beakTip.x - 3 * s, rig.beakTip.y + 1 * s],
    [rig.beakUpperBase.x, rig.beakUpperBase.y + 4 * s],
  ];
  fillRockToothPoly(ctx, pouchPts, toothGrid, rng, {
    color: PIGMENT.yellowOchre,
    coreAlpha: 0.93,
    edgeWidth: 3.8 * s,
    edgeSkip: 0.48,
    pinholeCount: 16,
    pinholeCol: 'rgba(92, 32, 12, 0.34)',
  });

  ctx.save();
  ctx.beginPath();
  pouchPts.forEach(([px, py], idx) => (idx === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  ctx.closePath();
  ctx.clip();
  drawRockToothStroke(
    ctx,
    [[rig.beakLowerBase.x, rig.beakLowerBase.y + 6 * s], [rig.pouchBelly.x, rig.pouchBelly.y - 3 * s], [rig.beakTip.x - 6 * s, rig.beakTip.y + 1 * s]],
    toothGrid, rng, { color: PIGMENT.hematite, width: 12 * s, strands: 7, edgeSkip: 0.54, coreSkip: 0.14, alpha: 0.78 }
  );
  drawRockToothStroke(
    ctx,
    [[rig.beakLowerBase.x + 4 * s, rig.beakLowerBase.y + 12 * s], [rig.pouchBelly.x + 2 * s, rig.pouchBelly.y + 3 * s], [rig.beakTip.x - 10 * s, rig.beakTip.y + 3 * s]],
    toothGrid, rng, { color: PIGMENT.kaolin, width: 8.5 * s, strands: 6, edgeSkip: 0.56, coreSkip: 0.16, alpha: 0.84 }
  );
  // Kaolin clay stippling along throat pouch
  ctx.fillStyle = PIGMENT.kaolin;
  for (let pDot = 0; pDot < 9; pDot++) {
    const pu = (pDot + 0.7) / 9.5;
    const px = lerp(rig.beakLowerBase.x + 6 * s, rig.beakTip.x - 10 * s, pu);
    const py = lerp(rig.beakLowerBase.y + 5 * s, rig.beakTip.y + 1 * s, pu) + Math.sin(pu * Math.PI) * 14 * s;
    ctx.fillRect(px - 2.0 * s, py - 1.8 * s, 4.0 * s, 3.4 * s);
  }
  ctx.restore();

  drawRockToothStroke(ctx, pouchPts.slice(0, 5), toothGrid, rng, {
    color: PIGMENT.charcoal, width: 3.4 * s, strands: 4, edgeSkip: 0.42, coreSkip: 0.06, alpha: 0.94,
  });

  // Upper Hooked Hematite Mandible
  const beakPts = [
    [rig.beakUpperBase.x, rig.beakUpperBase.y - 1 * s],
    [lerp(rig.beakUpperBase.x, rig.beakTip.x, 0.6), lerp(rig.beakUpperBase.y, rig.beakTip.y, 0.6) - 2.5 * s],
    [rig.beakTip.x + 1 * s, rig.beakTip.y - 4 * s],
    [rig.beakTip.x + 5.5 * s, rig.beakTip.y + 3 * s],
    [rig.beakTip.x - 2 * s, rig.beakTip.y + 7 * s],
    [rig.beakLowerBase.x, rig.beakLowerBase.y + 1 * s],
  ];
  fillRockToothPoly(ctx, beakPts, toothGrid, rng, {
    color: PIGMENT.hematite, coreAlpha: 0.95, edgeWidth: 2.6 * s, edgeSkip: 0.44, pinholeCount: 5,
  });
  drawRockToothStroke(ctx, beakPts.slice(0, 4), toothGrid, rng, {
    color: PIGMENT.charcoal, width: 3.2 * s, strands: 4, edgeSkip: 0.40, coreSkip: 0.05, alpha: 0.96,
  });
  drawRockToothStroke(
    ctx,
    [[rig.beakUpperBase.x + 4 * s, rig.beakUpperBase.y + 1 * s], [rig.beakTip.x - 7 * s, rig.beakTip.y - 1.5 * s]],
    toothGrid, rng, { color: PIGMENT.kaolin, width: 2.8 * s, strands: 4, edgeSkip: 0.48, alpha: 0.88 }
  );

  // Archaic Hand-Painted Mineral Ring Eye (octagonal hand-brushed kaolin ring + charcoal dab, ZERO arc!)
  const ex = rig.head.x + 3.5 * s;
  const ey = rig.head.y - 3 * s;
  const eyeRingPts = [];
  for (let k = 0; k <= 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    eyeRingPts.push([ex + Math.cos(a) * 5.6 * s, ey + Math.sin(a) * 4.2 * s]);
  }
  fillRockToothPoly(ctx, eyeRingPts.slice(0, 8), toothGrid, rng, {
    color: PIGMENT.sandBase, coreAlpha: 0.92, edgeWidth: 0, pinholeCount: 0,
  });
  drawRockToothStroke(ctx, eyeRingPts, toothGrid, rng, {
    color: PIGMENT.kaolin, width: 2.8 * s, strands: 3, edgeSkip: 0.3, coreSkip: 0.04, alpha: 0.97,
  });
  ctx.fillStyle = PIGMENT.charcoal;
  ctx.fillRect(ex - 1.2 * s, ey - 2.0 * s, 4.2 * s, 4.0 * s);

  // 7. Near Leg & Foreground Dry-Brushed Feathered Wing
  drawCavePelicanLeg(rig.rightHip, rig.rightKnee, rig.rightFoot, rig.rightPedal, false);

  const wingPts = [
    [rig.wingShoulder.x - 4 * s, rig.wingShoulder.y],
    [rig.wingElbow.x - 14 * s, rig.wingElbow.y + 15 * s],
    [rig.wingTip.x + 5 * s, rig.wingTip.y + 3 * s],
    [rig.wingElbow.x + 13 * s, rig.wingElbow.y - 7 * s],
    [rig.wingShoulder.x + 12 * s, rig.wingShoulder.y + 2 * s],
  ];
  fillRockToothPoly(ctx, wingPts, toothGrid, rng, {
    color: PIGMENT.kaolinWarm, coreAlpha: 0.92, edgeWidth: 3.6 * s, edgeSkip: 0.50, pinholeCount: 10,
  });
  for (let f = 0; f < 7; f++) {
    const fu = f / 6;
    const sx = lerp(rig.wingShoulder.x - 3 * s, rig.wingElbow.x + 4 * s, fu * 0.65);
    const sy = lerp(rig.wingShoulder.y + 2 * s, rig.wingElbow.y + 6 * s, fu * 0.65);
    const tx = lerp(rig.wingElbow.x - 10 * s, rig.wingTip.x + 5 * s, 0.30 + fu * 0.70);
    const ty = lerp(rig.wingElbow.y + 17 * s, rig.wingTip.y + 1 * s, 0.30 + fu * 0.70);
    drawRockToothStroke(
      ctx,
      [[sx, sy], [(sx + tx) * 0.5, (sy + ty) * 0.5 + 3 * s], [tx, ty]],
      toothGrid,
      rng,
      {
        color: f % 3 === 0 ? PIGMENT.charcoal : f % 3 === 1 ? PIGMENT.hematite : PIGMENT.yellowOchre,
        width: 4.4 * s,
        strands: 5,
        edgeSkip: 0.52,
        coreSkip: 0.10,
        alpha: 0.92,
      }
    );
  }

  ctx.restore();
}

export function renderSaharaPelicanOnly(ctx, kit, pelicanLocalX, pedalAngle = 0, speedScale = 1.0, localT = 0) {
  if (pelicanLocalX <= -240 || pelicanLocalX >= PANEL_SIZE + 240) return;
  const { toothGrid } = getSaharaRockAssets(kit);
  const { y: roadY, slope } = kit.sampleRoad(clamp(pelicanLocalX, 0, PANEL_SIZE), 0);
  const rig = computePelicanRig({
    x: pelicanLocalX,
    y: roadY,
    pedalAngle,
    scale: 1.0,
    slope,
    speedScale,
    poseMode: 'normal',
    time: localT,
  });
  drawSaharaPelicanAndBike(ctx, kit, toothGrid, rig, localT);
}

export function render(kit, slot, scene, params) {
  const {
    localT = 0,
    pelicanLocalX = 500,
    pedalAngle = 0,
    speedScale = 1.0,
    isOutroThumbnail = false,
    hidePelican = false,
    includeLeftOutcrop = false,
  } = params;

  const g = slot.g2d;
  const ctx = g.drawingContext;
  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Baked Worley + Ridged-FBM Tassili Sandstone Wall + Prepared Kaolin Ground + Hand Stencils + Pecked Petroglyphs
  const { wall, toothGrid } = getSaharaRockAssets(kit);
  ctx.drawImage(wall.canvas, 0, 0);

  // Subtle 120 BPM cave hearth-fire warm ambient breath across the shelter rock (deterministic, zero radial glow!)
  if (!isOutroThumbnail) {
    const fireBreath = 0.035 * (0.5 + 0.5 * Math.sin(localT * Math.PI * 4));
    ctx.fillStyle = `rgba(232, 146, 62, ${fireBreath.toFixed(3)})`;
    ctx.fillRect(0, 0, PANEL_SIZE, ROAD_EDGE_Y);
  }

  // 2. Dynamic Tassili Bovidian Cattle & Pastoralist Herders on Elevated Terraces (y = 504..544)
  drawTassiliHerdAndHerders(ctx, kit, toothGrid, localT, hidePelican ? -9999 : pelicanLocalX, isOutroThumbnail);

  // 3. Mineral-Pigment Pelican & Fire-Bent Acacia Bow-Beam + Knapped Stone-Wheel Bicycle along y = 680
  if (!hidePelican && pelicanLocalX > -240 && pelicanLocalX < PANEL_SIZE + 240) {
    const { y: roadY, slope } = kit.sampleRoad(clamp(pelicanLocalX, 0, PANEL_SIZE), 0);
    const rig = computePelicanRig({
      x: pelicanLocalX,
      y: roadY,
      pedalAngle,
      scale: 1.0,
      slope,
      speedScale,
      poseMode: 'normal',
      time: localT,
    });
    drawSaharaPelicanAndBike(ctx, kit, toothGrid, rig, localT);
  }

  // 4. Rough Foreground Cave-Mouth Sandstone Corner Outcrops (kept off `x = 0` internal seam!)
  const fgRng = kit.makePRNG(9911);
  if (includeLeftOutcrop || isOutroThumbnail) {
    fillRockToothPoly(
      ctx,
      [[0, PANEL_SIZE], [0, 892], [38, 906], [76, 942], [132, PANEL_SIZE]],
      toothGrid,
      fgRng,
      { color: '#240f07', coreAlpha: 0.56, edgeWidth: 4.0, edgeSkip: 0.55, pinholeCount: 14 }
    );
  }
  fillRockToothPoly(
    ctx,
    [[PANEL_SIZE, PANEL_SIZE], [868, PANEL_SIZE], [924, 940], [964, 904], [PANEL_SIZE, 886]],
    toothGrid,
    fgRng,
    { color: '#240f07', coreAlpha: 0.56, edgeWidth: 4.0, edgeSkip: 0.55, pinholeCount: 14 }
  );

  // 5. Pure Unadulterated Rock Wall in 1080p Scroll (NO in-painting title card — handled by outer museum brass placard!)
  //    Compact exhibition label strip retained ONLY for Outro 7x3 thumbnail grid!
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(24, 15, 10, 0.78)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.fillStyle = '#d99a38';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 4);
    ctx.fillStyle = '#f6ebd8';
    ctx.font = '700 48px "PelicanSerif", serif';
    ctx.textBaseline = 'middle';
    ctx.fillText('01 撒哈拉岩画', 36, PANEL_SIZE - 46);
  }

  ctx.restore();
}
