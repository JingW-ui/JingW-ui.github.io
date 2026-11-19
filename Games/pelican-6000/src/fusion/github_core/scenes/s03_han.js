// src/scenes/s03_han.js
// Scene #03: 汉画像石拓片 (Eastern Han Stone Relief Rubbing · c. 100 CE, Wu Liang Shrine Style) — r3 Masterpiece
// Physical Medium: Wujin pine-soot dab-pad rubbing (乌金椎拓) on fibrous Mianlian Xuan paper over
// chiseled Shandong bluestone flat-relief (武梁祠减地平雕 + 三角槽阴线刻).
// - Hybrid WebGL2 `kit.bakeBrush` (charcoal/spray soot clouds & parallel iron-chisel striations)
//   bridged once via `fb.get().canvas` into `bake2D` (`slot.usedFb = false`, Outro-safe, <16ms/frame).
// - Slab-locked Mianlian Xuan paper `createPattern` fills (zero flat CSS cutouts, zero sticker drift!)
//   + stochastic dab-pad soot bleed (`拓包扑墨毛边`) + FBM stone-chipped polygonal contours (zero `ctx.arc`!).
// - Variable-width V-groove intaglio chisel cuts (`chiselVGroove`) with spalled stone-crumb lips.
// - Authentic Wu Liang Shrine angular wide-sleeved `曲裾深衣` & `武冠/进贤冠` riders on proud bound-tail steeds,
//   Kaogongji curved-shaft wooden wheel-bicycle with 3-tier yak-tail `汉节`, incised Han Lishu `「車騎奇禽出行」`
//   cartouche on stone, and Qing Qian-Jia small-regular colophon on right Mianlian margin (`y=680` unbroken!).

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  clamp,
  lerp,
  smoothstep,
} from '../beat/timeline.js';
import { computePelicanRig } from '../rig/pelican.js';
import { getInkPaper } from '../kit/ink.js';

const SOOT_BG = '#131210';
const SOOT_DEEP = '#090807';
const BG_RELIEF = '#36322c';
const BG_RELIEF_DARK = '#23201c';
const PAPER_MARGIN = '#ebe3d1';
const CINNABAR_SEAL = '#b83224';

// -----------------------------------------------------------------------------
// Deterministic Fast Hash & Chisel-Faceted Contour Generators (ZERO ctx.arc!)
// -----------------------------------------------------------------------------
function stoneHash(n) {
  let x = Math.imul(n | 0, 0x27d4eb2d);
  x = (x ^ (x >>> 15)) >>> 0;
  x = Math.imul(x, 0x85ebca6b) >>> 0;
  return ((x ^ (x >>> 13)) >>> 0) * 2.3283064365386963e-10;
}

function stoneNoise1D(u, seed = 1) {
  const i = Math.floor(u);
  const f = u - i;
  const s = f * f * (3 - 2 * f);
  return lerp(stoneHash(i + seed * 131), stoneHash(i + 1 + seed * 131), s) * 2 - 1;
}

/**
 * Generates a hand-chiseled polygonal ring/disc contour with irregular stone-chip bevels
 * (completely replacing smooth mathematical `ctx.arc` circles!).
 */
function makeChiselDiscPts(cx, cy, r, sides = 20, chipAmt = 1.15, seed = 7, rot = 0) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = rot + (i / sides) * Math.PI * 2;
    const chip = stoneNoise1D(i * 1.37, seed) * chipAmt;
    const angJit = stoneNoise1D(i * 2.11, seed + 19) * (0.18 / sides);
    const rad = Math.max(0.8, r + chip);
    pts.push([cx + Math.cos(a + angJit) * rad, cy + Math.sin(a + angJit) * rad]);
  }
  return pts;
}

/**
 * Subdivides a polyline/polygon and perturbs edges with subtle iron-chisel facets & spall nicks.
 */
function perturbChiselPoly(pts, chipAmt = 1.05, seed = 13, closed = true) {
  if (pts.length < 2) return pts;
  const out = [];
  const count = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < count; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % pts.length];
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const steps = Math.max(1, Math.min(6, Math.round(len / 18)));
    const nx = -dy / len;
    const ny = dx / len;
    for (let s = 0; s < steps; s++) {
      const u = s / steps;
      const off = s === 0
        ? stoneNoise1D(i * 3.1, seed) * chipAmt * 0.45
        : stoneNoise1D(i * 7.3 + s * 1.9, seed) * chipAmt;
      out.push([lerp(x0, x1, u) + nx * off, lerp(y0, y1, u) + ny * off]);
    }
  }
  if (!closed) out.push(pts[pts.length - 1]);
  return out;
}

function sampleQuadPts(x0, y0, cx, cy, x1, y1, steps = 10) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    pts.push([
      mt * mt * x0 + 2 * mt * t * cx + t * t * x1,
      mt * mt * y0 + 2 * mt * t * cy + t * t * y1,
    ]);
  }
  return pts;
}

function sampleCubicPts(x0, y0, c1x, c1y, c2x, c2y, x1, y1, steps = 14) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    pts.push([
      mt * mt * mt * x0 + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t * t * t * x1,
      mt * mt * mt * y0 + 3 * mt * mt * t * c1y + 3 * mt * t * t * c2y + t * t * t * y1,
    ]);
  }
  return pts;
}

// -----------------------------------------------------------------------------
// Pre-Baked Fibrous Un-Inked Mianlian Xuan Paper Tiles (Slab-Locked Fill Patterns!)
// -----------------------------------------------------------------------------
function getMianlianPaperBank(kit) {
  const specs = [
    ['light', '#f0e9da', '#e3dac6', '#fffcf4'],
    ['mid', '#dfd6c3', '#d0c5ae', '#f2ead9'],
    ['shade', '#cbbba0', '#bca98c', '#dfd2bc'],
    ['weathered', '#c6bdb0', '#b5ab9c', '#dbd3c5'],
  ];
  const bank = {};
  for (const [name, baseHex, darkHex, fiberHex] of specs) {
    const tile = kit.bake2D(`s03_mianlian_tile_${name}_r3`, (_g, ctx, rng, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, baseHex);
      grad.addColorStop(0.55, darkHex);
      grad.addColorStop(1, baseHex);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Horizontal laid bamboo-screen ribs (绵连宣纸竹帘纹)
      for (let y = 1; y < h; y += 5) {
        ctx.fillStyle = `rgba(112, 96, 72, ${(0.035 + rng() * 0.035).toFixed(3)})`;
        ctx.fillRect(0, y, w, 1);
      }

      // Pteroceltis & straw plant fibers embedded in raw rubbing paper
      for (let i = 0; i < 240; i++) {
        const fx = rng() * w;
        const fy = rng() * h;
        const len = 5 + rng() * 18;
        const ang = rng() * Math.PI * 2;
        ctx.strokeStyle = rng() > 0.35 ? fiberHex : 'rgba(98, 82, 60, 0.12)';
        ctx.globalAlpha = 0.16 + rng() * 0.22;
        ctx.lineWidth = 0.6 + rng() * 0.8;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + Math.cos(ang) * len, fy + Math.sin(ang) * len);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Subtle stone-tooth soot micro-speckles pressed through damp Xuan paper (透墨石花微粒)
      for (let i = 0; i < 360; i++) {
        const sx = rng() * w;
        const sy = rng() * h;
        const sw = 0.8 + rng() * 2.1;
        const sh = 0.7 + rng() * 1.8;
        ctx.fillStyle = rng() > 0.28
          ? `rgba(22, 20, 17, ${(0.04 + rng() * 0.10).toFixed(3)})`
          : 'rgba(255, 251, 242, 0.16)';
        ctx.fillRect(sx, sy, sw, sh);
      }
    }, 256, 256);
    bank[name] = tile.canvas;
  }
  return bank;
}

/**
 * Resolves a slab-locked CanvasPattern so moving relief figures sample stone/paper grain
 * anchored to global stone-slab coordinates `(0, 0)` instead of drifting like paper stickers!
 */
function bindSlabPaperFill(ctx, paperBank, tone = 'light') {
  const cnv = paperBank?.[tone];
  if (!cnv || typeof ctx.createPattern !== 'function') {
    ctx.fillStyle = tone === 'light' ? '#efe8d8' : tone === 'mid' ? '#dfd5c2' : '#c8beb0';
    return;
  }
  const pat = ctx.createPattern(cnv, 'repeat');
  if (pat && typeof pat.setTransform === 'function' && typeof ctx.getTransform === 'function') {
    const m = ctx.getTransform();
    if (m && typeof m.inverse === 'function') {
      pat.setTransform(m.inverse());
    }
  }
  ctx.fillStyle = pat || '#efe8d8';
}

// -----------------------------------------------------------------------------
// Physical Rubbing Relief & V-Groove Intaglio Primitives
// -----------------------------------------------------------------------------
/**
 * Fills a raised stone-relief polygon with slab-locked Mianlian Xuan paper,
 * a recessed dark soot stone-bevel trench, and stochastic `拓包` dab-pad ink bleed along edges!
 */
function fillChiseledRelief(ctx, rawPts, paperBank, {
  tone = 'light',
  haloWidth = 4.2,
  chipAmt = 0.95,
  seed = 17,
  bleedDabs = true,
  solidColor = null,
} = {}) {
  if (!rawPts || rawPts.length < 3) return;
  const pts = chipAmt > 0 ? perturbChiselPoly(rawPts, chipAmt, seed, true) : rawPts;

  ctx.save();
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 3.2;

  // 1. Deep recessed soot trench surrounding raised stone plane
  if (haloWidth > 0) {
    ctx.strokeStyle = SOOT_DEEP;
    ctx.lineWidth = haloWidth;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    ctx.stroke();
  }

  // 2. Fibrous un-inked Mianlian Xuan paper relief surface (or dark recessed stone)
  if (solidColor) {
    ctx.fillStyle = solidColor;
  } else {
    bindSlabPaperFill(ctx, paperBank, tone);
  }
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();

  // 3. Stochastic silk dab-pad (`拓包扑墨`) soot creep along stone bevel edges (1.4~4.0px mottled rim!)
  if (bleedDabs && !solidColor) {
    const stride = Math.max(1, Math.floor(pts.length / 28));
    for (let i = 0; i < pts.length; i += stride) {
      const h = stoneHash(seed * 97 + i * 31);
      if (h < 0.26) continue;
      const [px, py] = pts[i];
      const [nxPt, nyPt] = pts[(i + 1) % pts.length];
      const dx = nxPt - px;
      const dy = nyPt - py;
      const len = Math.hypot(dx, dy) || 1;
      // Inward normal so soot creeps slightly onto the bevel lip of the raised relief
      const inX = dy / len;
      const inY = -dx / len;
      const creep = (h - 0.35) * 2.4;
      const dabW = 1.4 + stoneHash(seed + i * 13) * 2.7;
      const dabH = 1.1 + stoneHash(seed + i * 29) * 2.1;
      ctx.fillStyle = `rgba(19, 18, 15, ${(0.20 + h * 0.34).toFixed(2)})`;
      ctx.fillRect(px + inX * creep - dabW * 0.5, py + inY * creep - dabH * 0.5, dabW, dabH);
    }
  }

  ctx.restore();
}

/**
 * Draws a raised stone-relief bar/limb segment between two points (with chiseled polygonal facets).
 */
function drawChiseledStrut(ctx, x0, y0, x1, y1, width, paperBank, {
  tone = 'light',
  haloWidth = 3.6,
  seed = 23,
  intaglioCore = false,
} = {}) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * (width * 0.5);
  const ny = (dx / len) * (width * 0.5);
  const mx = (x0 + x1) * 0.5;
  const my = (y0 + y1) * 0.5;
  const wob = stoneNoise1D(seed, 5) * 0.9;
  const poly = [
    [x0 + nx, y0 + ny],
    [mx + nx * (1.04 + wob * 0.08), my + ny * (1.04 + wob * 0.08)],
    [x1 + nx * 0.92, y1 + ny * 0.92],
    [x1 - nx * 0.92, y1 - ny * 0.92],
    [mx - nx * (1.04 - wob * 0.08), my - ny * (1.04 - wob * 0.08)],
    [x0 - nx, y0 - ny],
  ];
  fillChiseledRelief(ctx, poly, paperBank, { tone, haloWidth, chipAmt: 0.65, seed });
  if (intaglioCore) {
    chiselVGroove(ctx, [[x0, y0], [mx + nx * 0.08, my + ny * 0.08], [x1, y1]], Math.max(1.3, width * 0.24), seed + 7);
  }
}

/**
 * Variable-width V-trough iron-chisel intaglio groove (`三角槽阴线刻：起刀尖入、行刀涩进、收刀崩碴`).
 * Replaces uniform `ctx.stroke()` black lines with authentic tapered polygon chisel cuts!
 */
function chiselVGroove(ctx, pts, maxWidth = 2.5, seed = 41, color = SOOT_BG) {
  if (!pts || pts.length < 2) return;
  const dense = pts.length <= 3
    ? perturbChiselPoly(pts, 0.55, seed, false)
    : pts;
  const n = dense.length;
  if (n < 2) return;

  const left = [];
  const right = [];
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const [px, py] = dense[i];
    const [xPrev, yPrev] = dense[Math.max(0, i - 1)];
    const [xNext, yNext] = dense[Math.min(n - 1, i + 1)];
    const tx = xNext - xPrev;
    const ty = yNext - yPrev;
    const tl = Math.hypot(tx, ty) || 1;
    const nx = -ty / tl;
    const ny = tx / tl;

    // Chisel entry & exit taper + stone-grain chatter
    const entryExit = u < 0.14 ? u / 0.14 : u > 0.84 ? (1 - u) / 0.16 : 1.0;
    const chatter = 0.72 + 0.46 * stoneHash(seed * 53 + i * 19);
    const hw = Math.max(0.28, 0.5 * maxWidth * (0.22 + 0.78 * entryExit) * chatter);
    left.push([px + nx * hw, py + ny * hw]);
    right.push([px - nx * hw, py - ny * hw]);
  }

  ctx.save();
  // Subtle damp-paper bevel shadow halo along groove rim
  ctx.strokeStyle = 'rgba(20, 18, 15, 0.26)';
  ctx.lineWidth = maxWidth * 0.95;
  ctx.lineJoin = 'bevel';
  ctx.beginPath();
  ctx.moveTo(dense[0][0], dense[0][1]);
  for (let i = 1; i < n; i++) ctx.lineTo(dense[i][0], dense[i][1]);
  ctx.stroke();

  // Sharp V-groove core
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i < n; i++) ctx.lineTo(left[i][0], left[i][1]);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
  ctx.closePath();
  ctx.fill();

  // Spalled micro stone-crumb chip at chisel turn/exit
  if (n >= 3 && maxWidth >= 1.7) {
    const midIdx = Math.floor(n * 0.5);
    const [mx, my] = dense[midIdx];
    const cr = 0.8 + stoneHash(seed + 11) * 1.4;
    ctx.fillStyle = color;
    ctx.fillRect(mx - cr * 0.5, my - cr * 0.5, cr * 1.3, cr * 0.9);
  }
  ctx.restore();
}

function chiselCurveGroove(ctx, x0, y0, cx, cy, x1, y1, width = 2.3, seed = 53, color = SOOT_BG) {
  chiselVGroove(ctx, sampleQuadPts(x0, y0, cx, cy, x1, y1, 10), width, seed, color);
}
// -----------------------------------------------------------------------------
// Static Baked Layer 1: Wujin-Rubbing Stone Slab, Parallel Chisel Striations,
// Recessed Architecture, Friezes & Right Mianlian Antiquarian Colophon Margin
// -----------------------------------------------------------------------------
function getBakedHanSlab(kit, paperBank) {
  return kit.bake2D('s03_han_slab_r3', (_g, ctx, rng) => {
    // 1. Base pine-soot rubbing substrate
    const baseRubbing = getInkPaper(kit, 'rubbing');
    ctx.drawImage(baseRubbing.canvas, 0, 0);

    // 2. WebGL2 `kit.bakeBrush` Kubelka-Munk pine-soot dabbing & parallel iron-chisel striations
    //    transferred once via `fb.get().canvas` (`slot.usedFb = false` for <16ms & Outro parity!)
    if (kit && typeof kit.bakeBrush === 'function' && kit.brush) {
      const rubFb = kit.bakeBrush('s03_han_wujin_brush_r3', (p, brush, bRng) => {
        p.background(20, 19, 17);
        brush.noStroke();
        brush.noHatch();

        // Mottled Wujin pine-soot tonal clouds (`乌金拓浓淡墨韵`)
        const sootShades = ['#080807', '#1c1a17', '#2b2823', '#0d0c0b'];
        for (let i = 0; i < 18; i++) {
          const cx = bRng() * 940;
          const cy = 20 + bRng() * 960;
          const rx = 90 + bRng() * 165;
          const ry = 55 + bRng() * 110;
          const poly = [];
          for (let k = 0; k < 8; k++) {
            const a = (k / 8) * Math.PI * 2;
            const rScale = 0.72 + bRng() * 0.48;
            poly.push([cx + Math.cos(a) * rx * rScale, cy + Math.sin(a) * ry * rScale]);
          }
          brush.fill(sootShades[i % sootShades.length], 95 + Math.floor(bRng() * 75));
          brush.fillBleed(0.28, 'out');
          brush.fillTexture(0.84, 0.52);
          brush.polygon(poly);
        }

        // Parallel diagonal Wu Liang Shrine recessed stone chisel grooves (`减地斜向平行铁錾纹`)
        for (let i = 0; i < 165; i++) {
          const x0 = bRng() * 920;
          const y0 = 42 + bRng() * 910;
          const len = 26 + bRng() * 58;
          const slope = -0.24 + (bRng() - 0.5) * 0.06;
          brush.set(i % 3 === 0 ? 'charcoal' : '2H', i % 2 === 0 ? '#3e3a33' : '#090807', 0.85 + bRng() * 0.9);
          brush.line(x0, y0, x0 + len, y0 + len * slope);
        }

        // Fine dab-pad soot grain (`拓包扑墨散点`)
        brush.set('spray', '#cfc6b4', 0.45);
        for (let s = 0; s < 14; s++) {
          const sx = 40 + bRng() * 880;
          const sy = 50 + bRng() * 890;
          brush.line(sx, sy, sx + 45 + bRng() * 65, sy + (bRng() - 0.5) * 18);
        }
      });
      const snap = rubFb.get();
      if (snap && snap.canvas) {
        ctx.save();
        ctx.globalAlpha = 0.84;
        ctx.drawImage(snap.canvas, 0, 0, PANEL_SIZE, PANEL_SIZE);
        ctx.restore();
      }
    }

    // 3. Crisp Wu Liang Shrine parallel iron-chisel background striation troughs (`减地平雕横斜凿沟`)
    //    Clearly visible across recessed dark stone ground!
    for (let rowY = 46; rowY < 952; rowY += 7) {
      let x = (rowY * 13) % 19;
      while (x < 936) {
        const segW = 14 + rng() * 24;
        const dy = -2.2 + (rng() - 0.5) * 1.1;
        const alpha = 0.055 + rng() * 0.085;
        ctx.strokeStyle = `rgba(228, 220, 203, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.0 + rng() * 0.7;
        ctx.beginPath();
        ctx.moveTo(x, rowY + (rng() - 0.5) * 1.8);
        ctx.lineTo(Math.min(936, x + segW), rowY + dy);
        ctx.stroke();
        x += segW + 5 + rng() * 11;
      }
    }

    // 4. Top & Bottom Cornice Bands + Ornate Friezes (spanning stone slab x = 0..938, road x = 0..1000)
    const slabRight = 938;

    // Top Sawtooth Triangle Cornice (`三角齿纹`, y = 18..41)
    drawSawtoothBand(ctx, 18, 41, slabRight, paperBank, false);

    // Upper Celestial Register (`y = 45..236`): Freed top-left now hosts Winged Immortal & Cloud-Birds!
    drawHanCloudScroll(ctx, 148, 92, 1.04, false, paperBank);
    drawHanCloudScroll(ctx, 435, 86, 0.98, true, paperBank);
    drawHanCloudScroll(ctx, 765, 92, 1.06, false, paperBank);
    drawHanCloudScroll(ctx, 255, 196, 0.92, true, paperBank);
    drawHanCloudScroll(ctx, 615, 198, 0.94, false, paperBank);

    drawHanWingedImmortal(ctx, 292, 118, 0.96, paperBank);
    drawHanAuspiciousBird(ctx, 590, 118, 1.0, -1, paperBank, 'light');
    drawHanAuspiciousBird(ctx, 845, 188, 0.88, -1, paperBank, 'mid');
    drawHanAuspiciousBird(ctx, 108, 192, 0.86, 1, paperBank, 'mid');

    // Wu Liang Shrine Register Beam (`穿璧纹横栏`, y = 240..288)
    drawBiDiscFrieze(ctx, 240, 288, slabRight, paperBank);

    // Recessed Secondary Stone Plane (`浅刻远景享堂与子母汉阙` — low contrast so foreground cortege pops!)
    drawRecessedHanHall(ctx, 44, 344, 232, ROAD_EDGE_Y, paperBank);
    drawRecessedHanQueGateway(ctx, 816, 294, ROAD_EDGE_Y, paperBank);

    // Incised Han Clerical Script Stele Cartouche on stone (`「車騎奇禽出行」` — #85 Director Rule!)
    drawHanStoneCartouche(ctx, 520, 294, ['車', '騎', '奇', '禽', '出', '行'], paperBank);

    // 5. Canonical Unbroken Stone Road Slab (`y = ROAD_EDGE_Y = 680` strictly from `x = 0` to `x = 1000`!)
    const roadTopPts = [[0, ROAD_EDGE_Y]];
    for (let x = 28; x < PANEL_SIZE; x += 28) {
      const edgeFade = smoothstep(0, 90, x) * smoothstep(0, 90, PANEL_SIZE - x);
      roadTopPts.push([x, ROAD_EDGE_Y + stoneNoise1D(x * 0.08, 31) * 0.9 * edgeFade]);
    }
    roadTopPts.push([PANEL_SIZE, ROAD_EDGE_Y]);
    const roadPoly = [
      ...roadTopPts,
      [PANEL_SIZE, ROAD_EDGE_Y + 23],
      [0, ROAD_EDGE_Y + 23],
    ];
    fillChiseledRelief(ctx, roadPoly, paperBank, {
      tone: 'light',
      haloWidth: 3.5,
      chipAmt: 0.45,
      seed: 61,
    });

    // Chiseled stone road paving joints & diagonal kerb incisions across full 0..1000 width
    chiselVGroove(ctx, [[0, ROAD_EDGE_Y + 6.5], [340, ROAD_EDGE_Y + 7], [680, ROAD_EDGE_Y + 6.2], [PANEL_SIZE, ROAD_EDGE_Y + 6.5]], 2.1, 67);
    for (let x = 14; x < PANEL_SIZE - 8; x += 22) {
      chiselVGroove(ctx, [[x, ROAD_EDGE_Y + 8], [x - 8, ROAD_EDGE_Y + 20]], 1.8, 70 + x);
    }

    // 6. Lower Geometric Double-Lozenge Frieze (`双菱格纹`, y = 707..758) & Sub-Register (`铺首衔环 + 苍龙`, y = 764..952)
    drawLozengeFrieze(ctx, 707, 758, slabRight, paperBank);
    drawLowerSubRegister(ctx, 764, 952, slabRight, paperBank);
    drawSawtoothBand(ctx, 954, 978, slabRight, paperBank, true);

    // 7. Hand-Torn Raw Mianlian Xuan Paper Margins (Top, Bottom & Right `62px` Antiquarian Colophon Strip!)
    //    NOTE: Right paper margin splits naturally around `y = 668..706` so the `y = 680` stone road
    //    reaches `x = 1000` with 100% C1 stone continuity!
    drawTornMianlianMarginsAndColophon(ctx, rng, paperBank, slabRight);
  });
}

function drawTornMianlianMarginsAndColophon(ctx, rng, paperBank, slabRight) {
  ctx.save();

  // Helper to fill torn paper strip + dabbed soot transition along stone edge
  const fillPaperRegion = (polyPts, edgePts, inwardDir) => {
    bindSlabPaperFill(ctx, paperBank, 'light');
    ctx.beginPath();
    ctx.moveTo(polyPts[0][0], polyPts[0][1]);
    for (let i = 1; i < polyPts.length; i++) ctx.lineTo(polyPts[i][0], polyPts[i][1]);
    ctx.closePath();
    ctx.fill();

    // Soft mottled ink-pad dabbing stipple along stone slab boundary (zero `ctx.arc`!)
    for (let i = 0; i < edgePts.length - 1; i++) {
      const [x0, y0] = edgePts[i];
      const [x1, y1] = edgePts[i + 1];
      for (let s = 0; s < 3; s++) {
        const u = (s + rng()) / 3;
        const px = lerp(x0, x1, u) + inwardDir[0] * (rng() * 4.5);
        const py = lerp(y0, y1, u) + inwardDir[1] * (rng() * 4.5);
        const r = 2.0 + rng() * 3.6;
        const dab = makeChiselDiscPts(px, py, r, 7, 0.9, i * 7 + s);
        ctx.fillStyle = `rgba(20, 19, 16, ${(0.22 + rng() * 0.42).toFixed(2)})`;
        ctx.beginPath();
        ctx.moveTo(dab[0][0], dab[0][1]);
        for (let k = 1; k < dab.length; k++) ctx.lineTo(dab[k][0], dab[k][1]);
        ctx.closePath();
        ctx.fill();
      }
    }
  };

  // Top torn paper margin (`y = 0..13`)
  const topEdge = [];
  for (let x = 0; x <= PANEL_SIZE; x += 16) {
    topEdge.push([x, 9.5 + Math.sin(x * 0.025) * 3.2 + (rng() - 0.5) * 4.2]);
  }
  fillPaperRegion([[0, 0], [PANEL_SIZE, 0], ...[...topEdge].reverse()], topEdge, [0, 1]);

  // Bottom torn paper margin (`y = 987..1000`)
  const botEdge = [];
  for (let x = 0; x <= PANEL_SIZE; x += 16) {
    botEdge.push([x, PANEL_SIZE - (9.5 + Math.cos(x * 0.023) * 3.2 + (rng() - 0.5) * 4.2)]);
  }
  fillPaperRegion([[0, PANEL_SIZE], [PANEL_SIZE, PANEL_SIZE], ...[...botEdge].reverse()], botEdge, [0, -1]);

  // Upper-Right `62px` (`x ≈ 938..1000, y = 0..666`) Antiquarian Colophon Margin Strip
  // Tapering cleanly into stone lintel above `y = 674` so `y = 680` stone road runs unbroken to `x = 1000`!
  const rightUpperEdge = [];
  for (let y = 8; y <= 666; y += 16) {
    const flareOut = smoothstep(632, 666, y) * 64; // Curves cleanly off to x=1000 above road!
    const jx = slabRight + flareOut + Math.sin(y * 0.035) * 2.8 + (rng() - 0.5) * 3.6;
    rightUpperEdge.push([Math.min(PANEL_SIZE, jx), y]);
  }
  fillPaperRegion(
    [[PANEL_SIZE, 0], [PANEL_SIZE, 668], ...[...rightUpperEdge].reverse()],
    rightUpperEdge,
    [-1, 0]
  );

  // Lower-Right `58px` (`x ≈ 942..1000, y = 712..1000`) Antiquarian Margin Strip below stone road!
  const rightLowerEdge = [];
  for (let y = 712; y <= PANEL_SIZE - 8; y += 16) {
    const flareIn = (1 - smoothstep(712, 742, y)) * 60;
    const jx = slabRight + 4 + flareIn + Math.cos(y * 0.031) * 2.8 + (rng() - 0.5) * 3.6;
    rightLowerEdge.push([Math.min(PANEL_SIZE, jx), y]);
  }
  fillPaperRegion(
    [[PANEL_SIZE, 710], [PANEL_SIZE, PANEL_SIZE], ...[...rightLowerEdge].reverse()],
    rightLowerEdge,
    [-1, 0]
  );

  // Qing Qianlong-Jiaqing Jinshi Scholar Small Regular Script Colophon (`清乾嘉金石家蝇头小楷题跋`)
  // Strictly pure classical Chinese script & seals on the right Mianlian paper margin (#85 Rule!)
  ctx.fillStyle = '#1d1a16';
  ctx.font = '600 13.5px "PelicanWenKai", "PelicanSerif", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const col1 = '東漢武梁石室車騎奇禽出行畫像真本';
  const col2 = '永元舊拓烏金精墨嘉祥石刻神品';
  for (let i = 0; i < col1.length; i++) {
    const gx = 983 + (rng() - 0.5) * 0.7;
    const gy = 48 + i * 21.5;
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate((rng() - 0.5) * 0.04);
    ctx.fillText(col1[i], 0, 0);
    ctx.restore();
  }
  ctx.font = '500 12.5px "PelicanWenKai", "PelicanSerif", serif';
  ctx.fillStyle = '#2c2721';
  for (let i = 0; i < col2.length; i++) {
    const gx = 960 + (rng() - 0.5) * 0.7;
    const gy = 74 + i * 20.5;
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate((rng() - 0.5) * 0.04);
    ctx.fillText(col2[i], 0, 0);
    ctx.restore();
  }

  // Seal 1 (Upper-right colophon tail, y = 412): White-Intaglio Cinnabar Seal (`白文印：「金石永壽」`)
  drawJinshiSeal(ctx, 949, 412, 42, ['金', '石', '永', '壽'], true, rng);
  // Seal 2 (Upper-right colophon tail, y = 468): Vermilion-Relief Seal (`朱文印：「武梁真賞」`)
  drawJinshiSeal(ctx, 951, 468, 38, ['武', '梁', '真', '賞'], false, rng);
  // Seal 3 (Lower-right margin corner, y = 862): Collector corner seal (`朱文印：「秘府珍藏」`)
  drawJinshiSeal(ctx, 950, 862, 40, ['秘', '府', '珍', '藏'], true, rng);

  ctx.restore();
}

/**
 * Authentic hand-carved antiquarian cinnabar seal with weathered stone edges & Xuan fiber gaps
 * (ZERO `strokeRect`!).
 */
function drawJinshiSeal(ctx, x, y, size, chars, isBaiwen, rng) {
  ctx.save();
  const outer = perturbChiselPoly(
    [[x, y], [x + size, y], [x + size, y + size], [x, y + size]],
    0.85,
    Math.round(x + y),
    true
  );

  if (isBaiwen) {
    // White-intaglio seal (白文朱砂方印)
    ctx.fillStyle = CINNABAR_SEAL;
    ctx.beginPath();
    ctx.moveTo(outer[0][0], outer[0][1]);
    for (let i = 1; i < outer.length; i++) ctx.lineTo(outer[i][0], outer[i][1]);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = PAPER_MARGIN;
    ctx.font = `700 ${Math.round(size * 0.36)}px "PelicanSerif", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(chars[0], x + size * 0.72, y + size * 0.28);
    ctx.fillText(chars[1], x + size * 0.72, y + size * 0.73);
    ctx.fillText(chars[2], x + size * 0.28, y + size * 0.28);
    ctx.fillText(chars[3], x + size * 0.28, y + size * 0.73);
  } else {
    // Vermilion-relief seal (朱文细边印)
    ctx.strokeStyle = CINNABAR_SEAL;
    ctx.lineWidth = 2.3;
    ctx.lineJoin = 'bevel';
    ctx.beginPath();
    ctx.moveTo(outer[0][0], outer[0][1]);
    for (let i = 1; i < outer.length; i++) ctx.lineTo(outer[i][0], outer[i][1]);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = CINNABAR_SEAL;
    ctx.font = `700 ${Math.round(size * 0.35)}px "PelicanSerif", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(chars[0], x + size * 0.72, y + size * 0.28);
    ctx.fillText(chars[1], x + size * 0.72, y + size * 0.73);
    ctx.fillText(chars[2], x + size * 0.28, y + size * 0.28);
    ctx.fillText(chars[3], x + size * 0.28, y + size * 0.73);
  }

  // Natural missing-cinnabar paper fiber gaps (`印泥飞白剥蚀`)
  ctx.fillStyle = PAPER_MARGIN;
  for (let k = 0; k < 9; k++) {
    const gx = x + rng() * size;
    const gy = y + rng() * size;
    ctx.fillRect(gx, gy, 1.4 + rng() * 3.2, 0.9 + rng() * 2.0);
  }
  ctx.restore();
}

// -----------------------------------------------------------------------------
// Static Baked Layer 2: Natural Spalled Stone Cracks (断碑崩茬) & Stone Pits (石花)
// -----------------------------------------------------------------------------
function getBakedStoneWeatheringOverlay(kit) {
  return kit.bake2D('s03_han_weathering_r3', (_g, ctx, rng) => {
    ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

    // 1. Fine soot chisel pits across relief surfaces (confined to stone slab x < 936)
    for (let i = 0; i < 1650; i++) {
      const px = rng() * 934;
      const py = 18 + rng() * (PANEL_SIZE - 36);
      const w = 1.0 + rng() * 3.4;
      const h = 0.8 + rng() * 2.5;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rng() * Math.PI);
      ctx.fillStyle = `rgba(17, 16, 14, ${(0.16 + rng() * 0.40).toFixed(2)})`;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.restore();
    }

    // 2. Un-inked stone-flower pits (`石花留白斑点`, irregular polygonal chips — zero `ctx.arc`!)
    for (let c = 0; c < 38; c++) {
      const cx = rng() * 920;
      const cy = 26 + rng() * (PANEL_SIZE - 52);
      const count = 7 + Math.floor(rng() * 14);
      for (let k = 0; k < count; k++) {
        const px = cx + (rng() - 0.5) * 44;
        const py = cy + (rng() - 0.5) * 36;
        const r = 0.8 + rng() * 2.3;
        const chip = makeChiselDiscPts(px, py, r, 6, 0.55, c * 19 + k);
        ctx.fillStyle = `rgba(236, 230, 216, ${(0.10 + rng() * 0.25).toFixed(2)})`;
        ctx.beginPath();
        ctx.moveTo(chip[0][0], chip[0][1]);
        for (let m = 1; m < chip.length; m++) ctx.lineTo(chip[m][0], chip[m][1]);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 3. Naturalistic Broken-Stele Cracks (`断碑裂纹崩茬`)
    const cracks = [
      [
        [298, 14], [316, 128], [302, 232], [336, 344], [354, 458],
        [340, 568], [368, 678], [382, 808], [366, 922], [378, 984],
      ],
      [
        [744, 16], [722, 148], [736, 272], [706, 398], [684, 520],
        [698, 638], [672, 762], [652, 892], [662, 984],
      ],
    ];

    for (const basePts of cracks) {
      const finePts = [basePts[0]];
      for (let i = 0; i < basePts.length - 1; i++) {
        const [x0, y0] = basePts[i];
        const [x1, y1] = basePts[i + 1];
        const steps = 8;
        for (let s = 1; s <= steps; s++) {
          const u = s / steps;
          const jx = s < steps ? (rng() - 0.5) * 8.5 : 0;
          const jy = s < steps ? (rng() - 0.5) * 5.5 : 0;
          finePts.push([lerp(x0, x1, u) + jx, lerp(y0, y1, u) + jy]);
        }
      }

      for (let i = 0; i < finePts.length - 1; i++) {
        const [x0, y0] = finePts[i];
        const [x1, y1] = finePts[i + 1];
        const w = 1.3 + rng() * 2.9;

        ctx.strokeStyle = 'rgba(11, 10, 9, 0.76)';
        ctx.lineWidth = w + 3.0;
        ctx.beginPath();
        ctx.moveTo(x0 + 1.4, y0 + 1.0);
        ctx.lineTo(x1 + 1.4, y1 + 1.0);
        ctx.stroke();

        ctx.strokeStyle = `rgba(235, 228, 213, ${(0.56 + rng() * 0.34).toFixed(2)})`;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();

        const crumbs = 1 + Math.floor(rng() * 3);
        for (let c = 0; c < crumbs; c++) {
          const side = rng() > 0.5 ? 1 : -1;
          const dist = 2 + rng() * 10;
          const cx = lerp(x0, x1, rng()) + side * dist;
          const cy = lerp(y0, y1, rng()) + (rng() - 0.5) * 7;
          const cr = 0.9 + rng() * 2.6;
          ctx.fillStyle = `rgba(236, 229, 214, ${(0.34 + rng() * 0.46).toFixed(2)})`;
          ctx.beginPath();
          ctx.moveTo(cx - cr, cy);
          ctx.lineTo(cx, cy - cr * 0.8);
          ctx.lineTo(cx + cr * 1.1, cy + cr * 0.4);
          ctx.lineTo(cx - cr * 0.3, cy + cr);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  });
}

// -----------------------------------------------------------------------------
// Architectural & Ornamental Frieze Helpers (100% Chisel-Faceted, Zero `ctx.arc`!)
// -----------------------------------------------------------------------------
function drawSawtoothBand(ctx, y0, y1, maxX, paperBank, invert = false) {
  const barTop = invert ? y1 - 4 : y0;
  const barBot = invert ? y0 : y1 - 3;
  fillChiseledRelief(ctx, [[0, barTop], [maxX, barTop], [maxX, barTop + 4], [0, barTop + 4]], paperBank, {
    tone: 'mid', haloWidth: 0, chipAmt: 0.4, seed: y0,
  });
  fillChiseledRelief(ctx, [[0, barBot], [maxX, barBot], [maxX, barBot + 3], [0, barBot + 3]], paperBank, {
    tone: 'mid', haloWidth: 0, chipAmt: 0.4, seed: y1,
  });

  const step = 25;
  for (let x = 0; x < maxX - 8; x += step) {
    const tri = invert
      ? [[x, y1 - 5], [Math.min(maxX, x + step), y1 - 5], [x + step * 0.5, y0 + 5]]
      : [[x, y0 + 5], [Math.min(maxX, x + step), y0 + 5], [x + step * 0.5, y1 - 5]];
    fillChiseledRelief(ctx, tri, paperBank, { tone: 'mid', haloWidth: 1.5, chipAmt: 0.55, seed: x + y0 });
  }
}

function drawHanCloudScroll(ctx, cx, cy, scale = 1, flip = false, paperBank = null) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(flip ? -scale : scale, scale);

  const spineA = sampleCubicPts(-78, 12, -45, -18, -10, 24, 24, -6, 12);
  const spineB = sampleCubicPts(24, -6, 48, -26, 76, -8, 66, 12, 10);
  const spine = [...spineA, ...spineB.slice(1)];
  for (let i = 0; i < spine.length - 1; i++) {
    drawChiseledStrut(ctx, spine[i][0], spine[i][1], spine[i + 1][0], spine[i + 1][1], 8.2, paperBank, {
      tone: 'mid', haloWidth: 2.2, seed: 100 + i,
    });
  }

  for (const [vx, vy, vr, sd] of [[-26, -4, 13, 11], [22, -10, 15, 29], [64, 6, 12, 47]]) {
    const disc = makeChiselDiscPts(vx, vy, vr, 14, 0.9, sd);
    fillChiseledRelief(ctx, disc, paperBank, { tone: 'mid', haloWidth: 2.4, chipAmt: 0.5, seed: sd });
    const spiral = [];
    for (let k = 0; k <= 9; k++) {
      const a = 0.2 + (k / 9) * Math.PI * 1.55;
      const sr = vr * (0.62 - k * 0.035);
      spiral.push([vx + Math.cos(a) * sr, vy + Math.sin(a) * sr]);
    }
    chiselVGroove(ctx, spiral, 2.0, sd + 3);
  }
  chiselVGroove(ctx, spineA, 2.0, 141);
  ctx.restore();
}

function drawHanWingedImmortal(ctx, cx, cy, scale = 1, paperBank = null) {
  // Wu Liang Shrine Feathered Immortal (`汉代羽人乘云献瑞`) in freed upper-left celestial register!
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  const body = [
    [-58, 16], [-34, 4], [-14, -6], [10, -14],
    [22, -32], [32, -34], [38, -24], [34, -14], // Han immortal topknot & aquiline profile
    [52, -18], [58, -10], [40, -2],             // Offering Lingzhi/Ruyi herb forward!
    [20, 6], [-6, 14], [-38, 24],
  ];
  const wing = [[-6, -12], [-34, -40], [-10, -34], [8, -14]];
  fillChiseledRelief(ctx, wing, paperBank, { tone: 'mid', haloWidth: 2.6, chipAmt: 0.7, seed: 181 });
  fillChiseledRelief(ctx, body, paperBank, { tone: 'light', haloWidth: 3.0, chipAmt: 0.75, seed: 183 });
  chiselVGroove(ctx, [[-8, -14], [-26, -34]], 1.9, 187);
  chiselVGroove(ctx, [[0, -13], [-14, -30]], 1.8, 189);
  chiselCurveGroove(ctx, -4, 4, -24, 12, -48, 18, 2.0, 191);
  // Lingzhi cloud-fungus head
  const zhi = makeChiselDiscPts(60, -15, 7.5, 10, 0.8, 193);
  fillChiseledRelief(ctx, zhi, paperBank, { tone: 'light', haloWidth: 2.2, chipAmt: 0.4, seed: 195 });
  ctx.restore();
}

function drawHanAuspiciousBird(ctx, cx, cy, scale = 1, dir = -1, paperBank = null, tone = 'light', solidColor = null) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(dir * scale, scale);

  const birdPts = [
    [-62, -10], [-34, -5], [-12, -9], [8, -16], [18, -32],
    [9, -41], [26, -40], [46, -34], [31, -27],
    [32, -8], [14, 9], [-8, 11], [-24, 6], [-46, 16], [-68, 15], [-34, 1],
  ];
  const wingPts = [[-4, -12], [-28, -42], [4, -36], [16, -14]];
  fillChiseledRelief(ctx, wingPts, paperBank, { tone, haloWidth: solidColor ? 0 : 2.5, chipAmt: 0.7, seed: 211, solidColor });
  fillChiseledRelief(ctx, birdPts, paperBank, { tone, haloWidth: solidColor ? 0 : 3.0, chipAmt: 0.75, seed: 213, solidColor });

  const pearl = makeChiselDiscPts(52, -33, 4.4, 9, 0.55, 217);
  fillChiseledRelief(ctx, pearl, paperBank, { tone, haloWidth: solidColor ? 0 : 1.6, chipAmt: 0.3, seed: 219, solidColor });

  chiselVGroove(ctx, [[-3, -15], [-20, -37]], 1.9, 221);
  chiselVGroove(ctx, [[3, -15], [-9, -35]], 1.9, 223);
  chiselVGroove(ctx, [[-15, -1], [-52, -6]], 1.9, 225);
  ctx.restore();
}

function drawBiDiscFrieze(ctx, y0, y1, maxX, paperBank) {
  const cy = (y0 + y1) * 0.5;
  fillChiseledRelief(ctx, [[0, y0], [maxX, y0], [maxX, y0 + 4.5], [0, y0 + 4.5]], paperBank, {
    tone: 'mid', haloWidth: 0, chipAmt: 0.45, seed: 241,
  });
  fillChiseledRelief(ctx, [[0, y1 - 4.5], [maxX, y1 - 4.5], [maxX, y1], [0, y1]], paperBank, {
    tone: 'mid', haloWidth: 0, chipAmt: 0.45, seed: 243,
  });

  const step = 132;
  for (let x = -step * 0.5; x < maxX; x += step) {
    const xEnd = Math.min(maxX, x + step);
    drawChiseledStrut(ctx, Math.max(0, x), y0 + 6, xEnd, y1 - 6, 7.0, paperBank, {
      tone: 'mid', haloWidth: 1.8, seed: 250 + x, intaglioCore: true,
    });
    drawChiseledStrut(ctx, Math.max(0, x), y1 - 6, xEnd, y0 + 6, 7.0, paperBank, {
      tone: 'mid', haloWidth: 1.8, seed: 260 + x, intaglioCore: true,
    });
  }

  // Faceted stone-cut Jade Bi-Discs (`穿璧纹`, zero `ctx.arc`!)
  for (let x = step * 0.5; x < maxX - 20; x += step) {
    const outerBi = makeChiselDiscPts(x, cy, 16.5, 18, 0.9, 270 + x);
    fillChiseledRelief(ctx, outerBi, paperBank, { tone: 'light', haloWidth: 2.6, chipAmt: 0.4, seed: 271 + x });
    const innerRing = makeChiselDiscPts(x, cy, 10.6, 14, 0.55, 280 + x);
    chiselVGroove(ctx, [...innerRing, innerRing[0]], 1.9, 285 + x);
    const hole = makeChiselDiscPts(x, cy, 5.4, 10, 0.45, 290 + x);
    fillChiseledRelief(ctx, hole, paperBank, { solidColor: SOOT_BG, haloWidth: 0, chipAmt: 0.2, seed: 291 + x });
  }
}

function drawLozengeFrieze(ctx, y0, y1, maxX, paperBank) {
  const h = y1 - y0;
  const cy = y0 + h * 0.44;
  fillChiseledRelief(ctx, [[0, y0], [maxX, y0], [maxX, y0 + 4], [0, y0 + 4]], paperBank, {
    tone: 'mid', haloWidth: 0, chipAmt: 0.4, seed: 301,
  });
  fillChiseledRelief(ctx, [[0, y0 + h * 0.80], [maxX, y0 + h * 0.80], [maxX, y0 + h * 0.80 + 4], [0, y0 + h * 0.80 + 4]], paperBank, {
    tone: 'mid', haloWidth: 0, chipAmt: 0.4, seed: 303,
  });

  const w = 52;
  for (let x = 0; x < maxX - 18; x += w) {
    const xR = Math.min(maxX, x + w);
    const mx = (x + xR) * 0.5;
    fillChiseledRelief(ctx, [[x + 2, cy], [mx, y0 + 5], [xR - 2, cy], [mx, y0 + h * 0.80 - 2]], paperBank, {
      tone: 'mid', haloWidth: 1.4, chipAmt: 0.55, seed: 310 + x,
    });
    fillChiseledRelief(ctx, [[x + 11, cy], [mx, y0 + 11], [xR - 11, cy], [mx, y0 + h * 0.80 - 8]], paperBank, {
      solidColor: SOOT_BG, haloWidth: 0, chipAmt: 0.4, seed: 320 + x,
    });
    const boss = makeChiselDiscPts(mx, cy, 3.6, 8, 0.4, 330 + x);
    fillChiseledRelief(ctx, boss, paperBank, { tone: 'light', haloWidth: 0, chipAmt: 0.2, seed: 331 + x });
  }
}

function drawRecessedHanHall(ctx, x0, yTop, w, yBot, paperBank) {
  ctx.save();
  fillChiseledRelief(ctx, [
    [x0 - 18, yTop + 56], [x0 + 28, yTop], [x0 + w - 28, yTop], [x0 + w + 18, yTop + 56],
  ], paperBank, { solidColor: BG_RELIEF, haloWidth: 0, chipAmt: 0.9, seed: 351 });

  fillChiseledRelief(ctx, [
    [x0 + 20, yTop], [x0 + 10, yTop - 16], [x0 + 34, yTop - 8],
    [x0 + w - 34, yTop - 8], [x0 + w - 10, yTop - 16], [x0 + w - 20, yTop],
  ], paperBank, { solidColor: BG_RELIEF, haloWidth: 0, chipAmt: 0.8, seed: 353 });

  for (const cx of [x0 + 18, x0 + w * 0.5, x0 + w - 18]) {
    fillChiseledRelief(ctx, [
      [cx - 7, yTop + 56], [cx + 7, yTop + 56], [cx + 7, yBot], [cx - 7, yBot],
    ], paperBank, { solidColor: BG_RELIEF_DARK, haloWidth: 0, chipAmt: 0.6, seed: 355 + cx });
    fillChiseledRelief(ctx, [
      [cx - 19, yTop + 56], [cx - 12, yTop + 73], [cx + 12, yTop + 73], [cx + 19, yTop + 56],
    ], paperBank, { solidColor: BG_RELIEF, haloWidth: 0, chipAmt: 0.6, seed: 357 + cx });
  }
  for (let rx = x0 - 4; rx <= x0 + w + 4; rx += 14) {
    chiselVGroove(ctx, [[rx, yTop + 4], [rx + (rx - (x0 + w * 0.5)) * 0.14, yTop + 54]], 1.8, 360 + rx);
  }
  ctx.restore();
}

function drawRecessedHanQueGateway(ctx, x0, yTop, yBot, paperBank) {
  ctx.save();
  fillChiseledRelief(ctx, [
    [x0 + 16, yBot], [x0 + 22, yTop + 102], [x0 + 84, yTop + 102], [x0 + 90, yBot],
  ], paperBank, { solidColor: BG_RELIEF_DARK, haloWidth: 0, chipAmt: 0.8, seed: 371 });

  // Open portal passage (`阙门暗道`) so foreground cortege passes with 100% crisp contrast
  fillChiseledRelief(ctx, [
    [x0 + 30, 500], [x0 + 76, 500], [x0 + 76, yBot], [x0 + 30, yBot],
  ], paperBank, { solidColor: SOOT_BG, haloWidth: 0, chipAmt: 0.5, seed: 373 });

  fillChiseledRelief(ctx, [
    [x0 + 4, yTop + 102], [x0 + 12, yTop + 72], [x0 + 94, yTop + 72], [x0 + 102, yTop + 102],
  ], paperBank, { solidColor: BG_RELIEF, haloWidth: 0, chipAmt: 0.7, seed: 375 });
  fillChiseledRelief(ctx, [
    [x0 - 14, yTop + 72], [x0 + 22, yTop + 38], [x0 + 84, yTop + 38], [x0 + 114, yTop + 72],
  ], paperBank, { solidColor: BG_RELIEF, haloWidth: 0, chipAmt: 0.8, seed: 377 });
  drawHanAuspiciousBird(ctx, x0 + 53, yTop + 22, 0.48, -1, paperBank, 'mid', BG_RELIEF);

  for (let rx = x0 - 4; rx <= x0 + 104; rx += 12) {
    chiselVGroove(ctx, [[rx, yTop + 40], [rx + (rx - (x0 + 53)) * 0.15, yTop + 70]], 1.8, 380 + rx);
  }
  for (let bx = x0 + 20; bx <= x0 + 86; bx += 22) {
    chiselVGroove(ctx, [[bx, yTop + 74], [bx, yTop + 100]], 2.1, 390 + bx);
  }
  ctx.restore();
}

/**
 * Authentic Eastern Han Stele Cartouche (`汉隶碑额榜题：「車騎奇禽出行」` — #85 Director Directive!).
 * Coiled-dragon rounded stele arch (`蟠螭碑穿晕首`) + V-chisel incised Clerical Script (`蚕头燕尾八分隶`).
 */
function drawHanStoneCartouche(ctx, x, y, chars, paperBank) {
  const w = 46;
  const h = 136; // y = 294..430, well above pelican head!
  const archPts = [
    [x, y + h],
    [x, y + 22],
    ...sampleQuadPts(x, y + 22, x + w * 0.5, y - 10, x + w, y + 22, 8),
    [x + w, y + h],
  ];
  fillChiseledRelief(ctx, archPts, paperBank, { tone: 'mid', haloWidth: 3.2, chipAmt: 0.85, seed: 401 });

  // Stele `穿` (circular hanging aperture in stele head, polygonal stone cut!)
  const chuanHole = makeChiselDiscPts(x + w * 0.5, y + 14, 4.2, 10, 0.45, 403);
  fillChiseledRelief(ctx, chuanHole, paperBank, { solidColor: SOOT_BG, haloWidth: 0, chipAmt: 0.2, seed: 405 });

  // Chiseled inner `界格` frame lines (zero `strokeRect`!)
  chiselVGroove(ctx, [[x + 5, y + 25], [x + w - 5, y + 25], [x + w - 5, y + h - 5], [x + 5, y + h - 5], [x + 5, y + 25]], 1.8, 407);

  // Flattened wide Han Clerical Script (`汉隶八分扁体`) incised into the stone plaque
  ctx.save();
  ctx.fillStyle = SOOT_BG;
  ctx.font = '700 16.5px "PelicanSerif", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < chars.length; i++) {
    ctx.save();
    ctx.translate(x + w * 0.5, y + 36 + i * 17.5);
    ctx.scale(1.26, 0.80); // Authentic wide, squat Eastern Han Bafen Lishu proportion!
    ctx.fillText(chars[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

function drawLowerSubRegister(ctx, y0, y1, maxX, paperBank) {
  const cy = (y0 + y1) * 0.5;
  for (const cx of [158, 472, 786]) {
    if (cx + 42 > maxX) continue;
    // Wu Liang Shrine Monster-Mask Escutcheon (`铺首衔环`, zero `ctx.arc`!)
    const maskPts = [
      [cx - 34, cy - 38], [cx - 26, cy - 58], [cx - 8, cy - 52], [cx, cy - 59],
      [cx + 8, cy - 52], [cx + 26, cy - 58], [cx + 34, cy - 38],
      [cx + 28, cy - 12], [cx + 18, cy - 4], [cx - 18, cy - 4], [cx - 28, cy - 12],
    ];
    fillChiseledRelief(ctx, maskPts, paperBank, { tone: 'weathered', haloWidth: 2.2, chipAmt: 0.85, seed: 420 + cx });

    for (const ex of [cx - 12, cx + 12]) {
      const eye = makeChiselDiscPts(ex, cy - 30, 4.4, 8, 0.45, 430 + ex);
      fillChiseledRelief(ctx, eye, paperBank, { solidColor: SOOT_BG, haloWidth: 0, chipAmt: 0.2, seed: 431 + ex });
    }
    chiselVGroove(ctx, [[cx, cy - 52], [cx, cy - 10]], 2.4, 440 + cx);

    // Chiseled polygonal bronze ring (`衔环`, outer minus inner)
    const ringOuter = makeChiselDiscPts(cx, cy + 20, 28, 18, 0.95, 450 + cx);
    const ringInner = makeChiselDiscPts(cx, cy + 20, 19.5, 16, 0.85, 460 + cx);
    fillChiseledRelief(ctx, ringOuter, paperBank, { tone: 'weathered', haloWidth: 2.0, chipAmt: 0.4, seed: 451 + cx });
    fillChiseledRelief(ctx, ringInner, paperBank, { solidColor: SOOT_BG, haloWidth: 0, chipAmt: 0.4, seed: 461 + cx });
    chiselVGroove(ctx, [... makeChiselDiscPts(cx, cy + 20, 23.8, 16, 0.6, 470 + cx), ringOuter[0]], 1.7, 471 + cx);
  }

  // Sinuous Han Cloud-Dragons (`苍龙白虎穿云石刻`)
  for (const [bx, dir] of [[315, 1], [630, -1]]) {
    ctx.save();
    ctx.translate(bx, cy + 4);
    ctx.scale(dir, 1);
    const bodySpine = sampleCubicPts(-78, 22, -42, -50, 26, 50, 62, -20, 14);
    for (let i = 0; i < bodySpine.length - 1; i++) {
      drawChiseledStrut(ctx, bodySpine[i][0], bodySpine[i][1], bodySpine[i + 1][0], bodySpine[i + 1][1], 12.2, paperBank, {
        tone: 'weathered', haloWidth: 2.0, seed: 480 + i,
      });
    }
    drawChiseledStrut(ctx, -32, -6, -46, 30, 6.2, paperBank, { tone: 'weathered', haloWidth: 1.6, seed: 495 });
    drawChiseledStrut(ctx, 26, 12, 42, 36, 6.2, paperBank, { tone: 'weathered', haloWidth: 1.6, seed: 497 });

    const headPts = [
      [52, -30], [34, -46], [28, -42], [60, -38], [86, -35], [74, -24], [84, -12], [56, -12],
    ];
    fillChiseledRelief(ctx, headPts, paperBank, { tone: 'weathered', haloWidth: 2.0, chipAmt: 0.7, seed: 499 });
    chiselVGroove(ctx, bodySpine, 2.0, 501);
    ctx.restore();
  }
}
// -----------------------------------------------------------------------------
// Wu Liang Shrine Proud Bound-Tail Steeds, Canopy Chariot & Angular-Robed Riders
// -----------------------------------------------------------------------------
function drawWuLiangHorse(ctx, hx, groundY, gaitPhase, paperBank, {
  scale = 1.0,
  tone = 'light',
  glanceBack = 0,
  drawTwinEcho = false,
  seed = 600,
} = {}) {
  ctx.save();
  ctx.translate(hx, groundY);
  ctx.scale(scale, scale);

  const bob = Math.sin(gaitPhase) * 2.5;
  const stepA = Math.sin(gaitPhase);
  const stepB = Math.cos(gaitPhase);

  // Staggered abreast horses (`驷马并辔重影刻法`)
  if (drawTwinEcho) {
    ctx.save();
    ctx.translate(15, -7);
    drawSculptedSteedBody(ctx, bob * 0.85, -stepA * 0.76, -stepB * 0.76, paperBank, 'shade', 0, seed + 40);
    ctx.restore();
  }

  drawSculptedSteedBody(ctx, bob, stepA, stepB, paperBank, tone, glanceBack, seed);
  ctx.restore();
}

function drawSculptedSteedBody(ctx, bob, stepA, stepB, paperBank, tone, glanceBack, seed) {
  const fLift = Math.max(0, stepA) * 27;
  const fReach = stepA * 16;
  const rPush = stepB * 15;

  const drawSteedLeg = (pts, legTone, legSeed) => {
    // Upper muscular gaskin/forearm + slender cannon bone + carved fetlock & hoof!
    drawChiseledStrut(ctx, pts[0][0], pts[0][1], pts[1][0], pts[1][1], 8.8, paperBank, {
      tone: legTone, haloWidth: 3.2, seed: legSeed, intaglioCore: true,
    });
    drawChiseledStrut(ctx, pts[1][0], pts[1][1], pts[2][0], pts[2][1], 6.4, paperBank, {
      tone: legTone, haloWidth: 3.0, seed: legSeed + 5, intaglioCore: false,
    });
    const last = pts[2];
    fillChiseledRelief(ctx, [
      [last[0] - 4.5, last[1] - 6.5],
      [last[0] + 7.5, last[1] - 0.8],
      [last[0] - 5.5, last[1] - 0.8],
    ], paperBank, { tone: legTone, haloWidth: 2.2, chipAmt: 0.45, seed: legSeed + 9 });
  };

  // Far legs
  drawSteedLeg([[-40, -60 + bob], [-54 - rPush * 0.5, -28], [-46 - rPush, -2]], 'weathered', seed + 1);
  drawSteedLeg([[28, -62 + bob], [45 - fReach * 0.4, -34], [40 - fReach * 0.6, -2]], 'weathered', seed + 11);

  // Proud Bound Umbrella-Arch Han Warhorse Tail (`昂首束尾骏马：缚结高扬马尾`)
  const tailPts = [
    ...sampleQuadPts(-52, -83 + bob, -76, -120 + bob, -90, -94 + bob, 7),
    ...sampleQuadPts(-90, -94 + bob, -97, -72 + bob, -84, -55 + bob, 6).slice(1),
    ...sampleQuadPts(-84, -55 + bob, -79, -78 + bob, -73, -86 + bob, 5).slice(1),
    ...sampleQuadPts(-73, -86 + bob, -65, -94 + bob, -52, -73 + bob, 5).slice(1),
  ];
  fillChiseledRelief(ctx, tailPts, paperBank, { tone, haloWidth: 3.4, chipAmt: 0.7, seed: seed + 21 });
  // Bound tail ribbon wrap (`束尾丝绦阴刻`)
  chiselVGroove(ctx, [[-63, -95 + bob], [-58, -81 + bob]], 2.3, seed + 22);
  chiselCurveGroove(ctx, -62, -88 + bob, -78, -106 + bob, -86, -68 + bob, 1.8, seed + 23);

  // Sculpted Wu Liang Shrine Steed Torso:
  // Powerful rounded hindquarters, muscular saddle back, towering arched neck, chiseled bony head & proud breast!
  const headShift = -glanceBack * 12;
  const torsoPts = [
    ...sampleCubicPts(-58, -74 + bob, -66, -106 + bob, -38, -110 + bob, -18, -97 + bob, 8),
    ...sampleQuadPts(-18, -97 + bob, 3, -91 + bob, 16, -101 + bob, 5).slice(1),
    ...sampleCubicPts(
      16, -101 + bob,
      13 + headShift * 0.2, -134 + bob,
      25 + headShift * 0.4, -163 + bob,
      42 + headShift * 0.6, -173 + bob,
      8
    ).slice(1),
    // Twin pricked ears & bronze `当卢` plume crest!
    [43 + headShift * 0.6, -186 + bob],
    [49 + headShift * 0.65, -174 + bob],
    [55 + headShift * 0.65, -184 + bob],
    [57 + headShift * 0.7, -169 + bob],
    // Chiseled nasal bridge, flared nostril & spirited parted jaws
    [68 + headShift * 0.9, -158 + bob],
    [75 + headShift, -146 + bob],
    [66 + headShift, -138 + bob],
    [54 + headShift * 0.8, -143 + bob],
    [64 + headShift * 0.9, -133 + bob],
    [49 + headShift * 0.6, -129 + bob],
    [43 + headShift * 0.5, -136 + bob],
    // Deep arched throatlatch into massive swelling Wu Liang Shrine breast (`高挺弧曲胸肌`)
    ...sampleCubicPts(43 + headShift * 0.5, -136 + bob, 40, -118 + bob, 66, -105 + bob, 54, -75 + bob, 8).slice(1),
    ...sampleQuadPts(54, -75 + bob, 46, -59 + bob, 31, -58 + bob, 5).slice(1),
    ...sampleQuadPts(31, -58 + bob, -4, -51 + bob, -38, -58 + bob, 6).slice(1),
  ];
  fillChiseledRelief(ctx, torsoPts, paperBank, { tone, haloWidth: 4.2, chipAmt: 0.75, seed: seed + 25 });

  // Near legs (spirited high-stepping foreleg!)
  drawSteedLeg([[-44, -62 + bob], [-30 + rPush * 0.5, -30], [-35 + rPush, -2]], tone, seed + 31);
  drawSteedLeg([[34, -64 + bob], [58 + fReach * 0.5, -46 - fLift], [64 + fReach, -5 - fLift * 0.5]], tone, seed + 35);

  // Intaglio muscle planes, crenellated hogged mane, bridle cheek-straps & chest harness (`胸鞅鞦带`)
  chiselCurveGroove(ctx, 22, -104 + bob, 47, -98 + bob, 38, -67 + bob, 2.3, seed + 41);
  chiselCurveGroove(ctx, -48, -95 + bob, -33, -84 + bob, -40, -64 + bob, 2.1, seed + 43);
  for (let i = 0; i < 6; i++) {
    const my = -110 - i * 9.2 + bob;
    const mx = 18 + i * 3.3 + headShift * 0.25;
    chiselVGroove(ctx, [[mx, my], [mx + 11, my - 3]], 1.9, seed + 50 + i);
  }
  // Bridle & harness straps
  chiselVGroove(ctx, [[44 + headShift * 0.55, -166 + bob], [66 + headShift * 0.9, -142 + bob]], 1.8, seed + 58);
  chiselCurveGroove(ctx, 14, -84 + bob, 36, -90 + bob, 54, -84 + bob, 2.5, seed + 61);
  chiselCurveGroove(ctx, -56, -78 + bob, -36, -75 + bob, -16, -78 + bob, 2.3, seed + 63);

  const phalera = makeChiselDiscPts(46, -86 + bob, 4.2, 8, 0.4, seed + 65);
  fillChiseledRelief(ctx, phalera, paperBank, { solidColor: SOOT_BG, haloWidth: 0, chipAmt: 0.2, seed: seed + 66 });

  // Angular almond stone-cut horse eye (zero `ctx.arc`!)
  const ex = 53 + headShift * 0.75;
  const ey = -156 + bob;
  const eyeDiamond = [[ex - 5.5, ey + 0.8], [ex, ey - 3.6], [ex + 5.5, ey - 0.6], [ex, ey + 3.4]];
  chiselVGroove(ctx, [...eyeDiamond, eyeDiamond[0]], 1.9, seed + 69);
  const pupilOff = glanceBack > 0.2 ? -1.8 : 1.4;
  fillChiseledRelief(
    ctx,
    makeChiselDiscPts(ex + pupilOff, ey, 2.0, 6, 0.2, seed + 71),
    paperBank,
    { solidColor: SOOT_BG, haloWidth: 0, chipAmt: 0.1, seed: seed + 72 }
  );
}

/**
 * Wu Liang Shrine Cavalry Escort (`#85` Director Fix ①: Sculpted Angular `曲裾深衣` Wide Sleeves,
 * Upright `武冠/进贤冠` Profile, Saddlecloth `障泥` & Riding Boot — ZERO "steamed-bun torso"!).
 */
function drawHanCavalryRider(ctx, vx, groundY, t, sideEyeAmt, paperBank, role = 'vanguard') {
  if (vx < -150 || vx > PANEL_SIZE + 150) return;
  const roleSeed = role === 'vanguard' ? 700 : role === 'herald' ? 760 : 820;
  const gaitPhase = t * Math.PI * 2.0 + (role === 'vanguard' ? 0.6 : role === 'herald' ? 1.5 : 2.3);
  const isTurned = role === 'vanguard' ? sideEyeAmt : 0;
  const riderTone = role === 'vanguard' ? 'light' : 'mid';

  // 1. Proud Bound-Tail Wu Liang Shrine Steed
  drawWuLiangHorse(ctx, vx, groundY, gaitPhase, paperBank, {
    scale: 0.92,
    tone: riderTone,
    glanceBack: isTurned * 0.68,
    drawTwinEcho: false,
    seed: roleSeed,
  });

  const bob = Math.sin(gaitPhase) * 2.3;
  const rx = vx - 3;
  const ry = groundY - 90 + bob;

  // 2. CeremonialQi-Halberd Shaft (`棨戟长杆`) behind near sleeve so hand visibly grips it!
  const poleTopX = rx + 42;
  const poleTopY = ry - 134;
  drawChiseledStrut(ctx, rx + 10, ry + 8, poleTopX, poleTopY, 4.4, paperBank, {
    tone: 'light', haloWidth: 2.6, seed: roleSeed + 5,
  });
  // Halberd spearhead & horizontal crescent/dagger blade (`戟枝`)
  fillChiseledRelief(ctx, [
    [poleTopX, poleTopY - 24], [poleTopX + 5.5, poleTopY - 2], [poleTopX - 5, poleTopY - 2],
  ], paperBank, { tone: 'light', haloWidth: 2.2, chipAmt: 0.45, seed: roleSeed + 7 });
  fillChiseledRelief(ctx, [
    [poleTopX - 2, poleTopY - 6], [poleTopX - 18, poleTopY - 10], [poleTopX - 14, poleTopY - 2], [poleTopX - 2, poleTopY - 1],
  ], paperBank, { tone: 'light', haloWidth: 2.0, chipAmt: 0.4, seed: roleSeed + 8 });

  // Notched Han `矟幡` pennant streaming in wind
  const pWave = Math.sin(t * 8.2 + vx * 0.02) * 4.8;
  fillChiseledRelief(ctx, [
    [poleTopX - 3, poleTopY + 3],
    [poleTopX - 52, poleTopY + 7 + pWave],
    [poleTopX - 36, poleTopY + 17 + pWave],
    [poleTopX - 54, poleTopY + 26 + pWave],
    [poleTopX - 6, poleTopY + 21],
  ], paperBank, { tone: 'mid', haloWidth: 2.4, chipAmt: 0.65, seed: roleSeed + 9 });
  chiselVGroove(ctx, [[poleTopX - 8, poleTopY + 12], [poleTopX - 38, poleTopY + 15 + pWave]], 1.6, roleSeed + 10);

  // 3. Carved Han Flared Saddlecloth (`障泥鞍鞯`) & Rider's Bent Leg + Boot
  fillChiseledRelief(ctx, [
    [rx - 26, ry + 2], [rx + 20, ry + 1], [rx + 26, ry + 24], [rx - 22, ry + 25],
  ], paperBank, { tone: 'mid', haloWidth: 3.0, chipAmt: 0.65, seed: roleSeed + 12 });
  chiselVGroove(ctx, [[rx - 20, ry + 19], [rx + 20, ry + 18]], 1.8, roleSeed + 13);

  // Rider's booted foot tucked forward below saddlecloth
  fillChiseledRelief(ctx, [
    [rx + 2, ry + 22], [rx + 18, ry + 24], [rx + 22, ry + 31], [rx + 4, ry + 30],
  ], paperBank, { tone: riderTone, haloWidth: 2.4, chipAmt: 0.45, seed: roleSeed + 14 });

  // 4. Sculpted Wu Liang Shrine Cavalry Official:
  //    Distinct pinched waist with `大带`, broad angular shoulders, sharp hanging wide sleeve (`折角垂胡宽袖`),
  //    distinct neck notch, chiseled Han facial profile, and tall angular `武冠/进贤冠`!
  let headAndTorsoPts;
  if (isTurned > 0.35) {
    // Bar 2 Double-Take: Torso stays martial forward (+X) while head & tall `武冠` snap backward (-X)!
    headAndTorsoPts = [
      // Flared `曲裾` riding robe skirt over saddle
      [rx - 22, ry + 14],
      [rx - 14, ry - 4],   // Cinched waist back! (eliminates tombstone dome!)
      [rx - 21, ry - 24],  // Angular rear shoulder cape corner
      [rx - 10, ry - 35],  // Distinct nape/collar notch!
      // Bearded Han face profile turned BACKWARD (-X) toward pelican!
      [rx - 16, ry - 38],  // Pointed chin/beard facing -X
      [rx - 14, ry - 43],
      [rx - 21, ry - 46],  // Sharp aquiline Han nose facing -X!
      [rx - 15, ry - 52],  // Brow ridge
      // Tall angular Han `武冠/鹖冠` with forward-tilted peak & rear冠梁!
      [rx - 20, ry - 64],  // Front peak of Wu-crown (facing -X)
      [rx - 6, ry - 60],   // Crown step notch
      [rx + 6, ry - 70],   // Tall rear `进贤/武冠` beam peak!
      [rx + 12, ry - 52],  // Back of crown ribbon
      [rx + 6, ry - 36],   // Front neck notch!
      // Extended wide angular Han sleeve (`折角宽袖`) gripping halberd & reins!
      [rx + 20, ry - 32],  // Shoulder-to-sleeve upper line
      [rx + 32, ry - 26],  // Hand gripping halberd shaft
      [rx + 28, ry - 8],   // Sharp angular hanging `胡袖` elbow corner!
      [rx + 12, ry - 4],   // Sleeve tuck back to waist sash
      [rx + 18, ry + 13],  // Curved `曲裾` robe front hem
    ];
  } else {
    // Solemn forward march (+X): crisp angular `进贤冠/武冠` + aquiline nose + angular `曲裾深衣` wide sleeve!
    headAndTorsoPts = [
      [rx - 22, ry + 14],  // Flared `曲裾` rear hem
      [rx - 13, ry - 4],   // Cinched waist sash indentation!
      [rx - 22, ry - 25],  // Sculpted angular back-shoulder corner
      [rx - 9, ry - 36],   // Crisp nape notch!
      // Tall sloped Han `进贤冠/武冠` (two-stepped archaic crown beam!)
      [rx - 15, ry - 54],  // Rear crown base
      [rx - 10, ry - 71],  // Tall archaic crown beam crest (`高耸冠梁`)!
      [rx + 4, ry - 61],   // Crown step
      [rx + 16, ry - 64],  // Projecting front visor peak (`前耸冠展`)
      [rx + 12, ry - 52],  // Forehead under crown
      // Crisp Han facial profile facing +X
      [rx + 20, ry - 45],  // Aquiline Han nose!
      [rx + 14, ry - 40],  // Lips
      [rx + 18, ry - 35],  // Dignified goatee/chin!
      [rx + 8, ry - 33],   // Throat notch!
      // Outstretched angular wide-sleeved arm (`折角宽袖执戟御辔`)
      [rx + 22, ry - 30],
      [rx + 33, ry - 25],  // Fist holding halberd & reins
      [rx + 29, ry - 6],   // Iconic Wu Liang Shrine squared hanging wide-sleeve belly (`垂胡大袖`)!
      [rx + 11, ry - 3],   // Cinched waist front
      [rx + 18, ry + 13],  // Overlapping `曲裾` diagonal skirt hem
    ];
  }
  fillChiseledRelief(ctx, headAndTorsoPts, paperBank, {
    tone: riderTone,
    haloWidth: 3.8,
    chipAmt: 0.55,
    seed: roleSeed + 20,
  });

  // Intaglio `交领右衽` Y-collar, `大带` waist sash, `曲裾` spiral hem & angular wide-sleeve drapery folds!
  chiselVGroove(ctx, [[rx - 6, ry - 34], [rx + 4, ry - 18], [rx + 9, ry - 32]], 2.0, roleSeed + 22);
  chiselVGroove(ctx, [[rx - 12, ry - 4], [rx + 11, ry - 3]], 2.3, roleSeed + 24); // Waist sash `大带`
  chiselCurveGroove(ctx, rx + 8, ry - 24, rx + 20, ry - 14, rx + 27, ry - 10, 2.0, roleSeed + 26); // Wide sleeve fold
  chiselCurveGroove(ctx, rx + 6, ry - 18, rx + 18, ry - 8, rx + 25, ry - 16, 1.8, roleSeed + 27);
  chiselVGroove(ctx, [[rx - 16, ry + 12], [rx + 8, ry - 2], [rx + 14, ry + 12]], 1.9, roleSeed + 28); // `曲裾` wrap

  // Crown chin-tie (`冠缨`) & chiseled eye
  const eyeX = isTurned > 0.35 ? rx - 11 : rx + 9;
  chiselVGroove(ctx, [[isTurned > 0.35 ? rx - 4 : rx + 1, ry - 52], [isTurned > 0.35 ? rx - 8 : rx + 6, ry - 36]], 1.6, roleSeed + 30);
  fillChiseledRelief(
    ctx,
    makeChiselDiscPts(eyeX, ry - 47, isTurned > 0.35 ? 2.6 : 2.1, 6, 0.25, roleSeed + 31),
    paperBank,
    { solidColor: SOOT_BG, haloWidth: 0, chipAmt: 0.1, seed: roleSeed + 32 }
  );

  // Braided rein from rider's hand to steed's bit (`执辔悬链`)
  const bitX = vx + (isTurned > 0.35 ? 50 : 58) * 0.92;
  const bitY = groundY - 125 + bob;
  const reinSag = 6 + Math.sin(t * 10 + vx * 0.03) * 2.2;
  drawChiseledStrut(ctx, rx + 28, ry - 22, (rx + 28 + bitX) * 0.5, (ry - 22 + bitY) * 0.5 + reinSag, 2.2, paperBank, {
    tone: 'mid', haloWidth: 1.2, seed: roleSeed + 35,
  });
  drawChiseledStrut(ctx, (rx + 28 + bitX) * 0.5, (ry - 22 + bitY) * 0.5 + reinSag, bitX, bitY, 2.2, paperBank, {
    tone: 'mid', haloWidth: 1.2, seed: roleSeed + 36,
  });
}

function drawRearCanopyChariot(ctx, baseX, groundY, t, sideEyeAmt, paperBank) {
  const gaitPhase = t * Math.PI * 2.0;
  const wheelAngle = baseX / 48;
  const joltY = Math.sin(t * Math.PI * 4.0 + 0.8) * 1.1;

  // 1. Harnessed High-Stepping Four-Horse Team (`高头驷马`)
  const horseX = baseX + 146;
  drawWuLiangHorse(ctx, horseX, groundY, gaitPhase, paperBank, {
    scale: 0.95,
    tone: 'light',
    glanceBack: 0,
    drawTwinEcho: true,
    seed: 900,
  });

  // Curved Chariot Draught Pole (`曲辕辀木`)
  const shaftPts = sampleQuadPts(baseX + 24, groundY - 54 + joltY, baseX + 94, groundY - 54, horseX + 32, groundY - 98, 10);
  for (let i = 0; i < shaftPts.length - 1; i++) {
    drawChiseledStrut(ctx, shaftPts[i][0], shaftPts[i][1], shaftPts[i + 1][0], shaftPts[i + 1][1], 6.8, paperBank, {
      tone: 'light', haloWidth: 2.8, seed: 940 + i, intaglioCore: true,
    });
  }

  // 2. Domed Han Umbrella Canopy (`华盖`) & Notched Streaming Banner (`旌旐`)
  const canopyX = baseX - 4;
  const canopyY = groundY - 230 + joltY;
  drawChiseledStrut(ctx, canopyX, groundY - 78 + joltY, canopyX, canopyY, 6.4, paperBank, {
    tone: 'mid', haloWidth: 2.6, seed: 955,
  });

  const canopyPts = [
    ...sampleQuadPts(canopyX - 80, canopyY + 28, canopyX, canopyY - 34, canopyX + 80, canopyY + 28, 12),
    [canopyX + 54, canopyY + 36],
    [canopyX + 28, canopyY + 26],
    [canopyX, canopyY + 37],
    [canopyX - 28, canopyY + 26],
    [canopyX - 54, canopyY + 36],
  ];
  fillChiseledRelief(ctx, canopyPts, paperBank, { tone: 'light', haloWidth: 3.8, chipAmt: 0.75, seed: 957 });
  for (const rx of [-46, -22, 0, 22, 46]) {
    chiselCurveGroove(ctx, canopyX, canopyY - 4, canopyX + rx * 0.7, canopyY + 10, canopyX + rx * 1.45, canopyY + 28, 2.0, 960 + rx);
  }

  const wave = Math.sin(t * 7.5) * 5;
  drawChiseledStrut(ctx, baseX - 44, groundY - 78 + joltY, baseX - 46, groundY - 204 + joltY, 4.5, paperBank, {
    tone: 'mid', haloWidth: 2.2, seed: 971,
  });
  fillChiseledRelief(ctx, [
    [baseX - 46, groundY - 198 + joltY],
    [baseX - 108, groundY - 192 + wave],
    [baseX - 90, groundY - 180 + wave],
    [baseX - 110, groundY - 168 + wave],
    [baseX - 46, groundY - 172 + joltY],
  ], paperBank, { tone: 'mid', haloWidth: 3.0, chipAmt: 0.65, seed: 973 });

  // 3. Seated Han Nobleman in Tall Angular `进贤冠` & `曲裾深衣` Holding Jade `笏` Tablet
  fillChiseledRelief(ctx, [
    [baseX - 44, groundY - 78 + joltY],
    [baseX - 40, groundY - 106 + joltY],
    [baseX - 46, groundY - 124 + joltY], // Angular back shoulder
    [baseX - 34, groundY - 134 + joltY], // Neck notch
    [baseX - 41, groundY - 154 + joltY], // Tall `进贤冠` rear
    [baseX - 27, groundY - 166 + joltY], // Crown peak!
    [baseX - 10, groundY - 151 + joltY], // Crown visor
    [baseX - 7, groundY - 135 + joltY],  // Aquiline nose
    [baseX - 3, groundY - 126 + joltY],  // Dignified long beard
    [baseX - 12, groundY - 122 + joltY],
    [baseX + 5, groundY - 114 + joltY],  // Raised hands holding Jade Hu
    [baseX + 3, groundY - 94 + joltY],   // Angular `垂胡大袖` corner!
    [baseX - 12, groundY - 78 + joltY],
  ], paperBank, { tone: 'mid', haloWidth: 3.4, chipAmt: 0.55, seed: 977 });
  chiselCurveGroove(ctx, baseX - 34, groundY - 124 + joltY, baseX - 18, groundY - 112 + joltY, baseX - 2, groundY - 100 + joltY, 2.1, 979);
  drawChiseledStrut(ctx, baseX - 2, groundY - 114 + joltY, baseX + 8, groundY - 138 + joltY, 3.4, paperBank, {
    tone: 'light', haloWidth: 1.6, seed: 981,
  });

  // 4. Charioteer (`御夫`): Leans sharply forward & extends angular wide sleeve POINTING at the pelican in Bar 2!
  const leanX = sideEyeAmt * 14;
  const pointExt = sideEyeAmt * 22;
  fillChiseledRelief(ctx, [
    [baseX - 2, groundY - 78 + joltY],
    [baseX + 2 + leanX * 0.4, groundY - 106 + joltY],
    [baseX - 2 + leanX * 0.5, groundY - 124 + joltY],
    [baseX + 11 + leanX * 0.8, groundY - 136 + joltY],
    [baseX + 7 + leanX, groundY - 155 + joltY],   // Flat-topped Han `平巾帻` official cap
    [baseX + 30 + leanX, groundY - 157 + joltY],
    [baseX + 31 + leanX, groundY - 142 + joltY],
    [baseX + 37 + leanX, groundY - 134 + joltY],  // Nose
    [baseX + 30 + leanX, groundY - 126 + joltY],  // Chin
    [baseX + 49 + leanX + pointExt, groundY - 122 - sideEyeAmt * 8 + joltY], // Pointing hand!
    [baseX + 45 + leanX + pointExt * 0.68, groundY - 100 - sideEyeAmt * 4 + joltY], // Angular wide sleeve!
    [baseX + 28, groundY - 78 + joltY],
  ], paperBank, { tone: 'light', haloWidth: 3.6, chipAmt: 0.55, seed: 985 });

  chiselCurveGroove(
    ctx,
    baseX + 12 + leanX * 0.6, groundY - 124 + joltY,
    baseX + 28 + leanX * 0.8, groundY - 110 + joltY,
    baseX + 42 + leanX + pointExt * 0.6, groundY - 108 + joltY,
    2.1,
    987
  );
  fillChiseledRelief(
    ctx,
    makeChiselDiscPts(baseX + 25 + leanX, groundY - 139 + joltY, sideEyeAmt > 0.35 ? 2.8 : 2.1, 6, 0.2, 989),
    paperBank,
    { solidColor: SOOT_BG, haloWidth: 0, chipAmt: 0.1, seed: 990 }
  );

  // Dynamic Catenary Vibrating Four-Reins (`四辔悬链微颤`)
  for (let r = 0; r < 3; r++) {
    const vib = Math.sin(t * 11.5 + r * 1.4) * 2.4;
    const rPts = sampleQuadPts(
      baseX + 44 + leanX * 0.7, groundY - 112 + r * 3.5 + joltY,
      baseX + 112, groundY - 100 + r * 6 + vib,
      horseX + 56, groundY - 136 + r * 4,
      8
    );
    for (let k = 0; k < rPts.length - 1; k++) {
      drawChiseledStrut(ctx, rPts[k][0], rPts[k][1], rPts[k + 1][0], rPts[k + 1][1], 2.0, paperBank, {
        tone: 'mid', haloWidth: 0.9, seed: 995 + r * 10 + k,
      });
    }
  }

  // 5. Open Han Chariot Box with Curved Ear-Fender (`轺车曲輢舆厢`) & 16-Spoked Faceted Wooden Wheel
  const boxPts = [
    [baseX - 48, groundY - 82 + joltY],
    [baseX + 32, groundY - 82 + joltY],
    ...sampleQuadPts(baseX + 32, groundY - 82 + joltY, baseX + 54, groundY - 108 + joltY, baseX + 58, groundY - 96 + joltY, 5).slice(1),
    ...sampleQuadPts(baseX + 58, groundY - 96 + joltY, baseX + 50, groundY - 68 + joltY, baseX + 42, groundY - 48 + joltY, 5).slice(1),
    [baseX - 48, groundY - 48 + joltY],
  ];
  fillChiseledRelief(ctx, boxPts, paperBank, { tone: 'light', haloWidth: 3.8, chipAmt: 0.65, seed: 1030 });
  chiselVGroove(ctx, [[baseX - 42, groundY - 65 + joltY], [baseX + 38, groundY - 65 + joltY]], 2.3, 1032);
  for (let gx = baseX - 32; gx <= baseX + 28; gx += 15) {
    chiselVGroove(ctx, [[gx, groundY - 80 + joltY], [gx, groundY - 50 + joltY]], 2.1, 1035 + gx);
  }

  drawKaogongjiWheel(ctx, baseX - 2, groundY - 48 + joltY * 0.4, 48, wheelAngle, 16, paperBank, 1060);
}

// -----------------------------------------------------------------------------
// Kaogongji Wooden Chariot-Bicycle & Wu Liang Shrine Relief Pelican (ZERO `ctx.arc`!)
// -----------------------------------------------------------------------------
/**
 * Authentic Eastern Han *Kaogongji* (`《考工记·轮人》`) Wooden Chariot Wheel:
 * Hand-chiseled polygonal cambered felloe (`牙/辋`) with mortise wedges (`槥`),
 * 14 tapered wooden spokes (`辐`), and barrel hub (`毂`) with bronze `軎` linchpin!
 */
function drawKaogongjiWheel(ctx, wx, wy, r, angle, numSpokes = 14, paperBank = null, seed = 1100) {
  ctx.save();

  // 1. Recessed dark soot stone trench behind wheel rim
  const trenchOuter = makeChiselDiscPts(wx, wy, r + 3.2, 24, 1.0, seed);
  const trenchInner = makeChiselDiscPts(wx, wy, Math.max(8, r - 11.5), 20, 0.9, seed + 1);
  fillChiseledRelief(ctx, trenchOuter, paperBank, { solidColor: SOOT_DEEP, haloWidth: 0, chipAmt: 0.3, seed: seed + 2 });
  // Punch interior open slightly smaller so spokes remain crisp over stone ground
  ctx.fillStyle = SOOT_BG;
  ctx.beginPath();
  ctx.moveTo(trenchInner[0][0], trenchInner[0][1]);
  for (let i = 1; i < trenchInner.length; i++) ctx.lineTo(trenchInner[i][0], trenchInner[i][1]);
  ctx.closePath();
  ctx.fill();

  // 2. 14 Hand-Tapered Polygonal Wooden Spokes (`考工记收分扁木辐`)
  for (let i = 0; i < numSpokes; i++) {
    const a = angle + (i * Math.PI * 2) / numSpokes;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const nx = -sa;
    const ny = ca;
    const r0 = 10;
    const r1 = r - 7.5;
    const spokePoly = [
      [wx + ca * r0 + nx * 2.4, wy + sa * r0 + ny * 2.4],
      [wx + ca * r1 + nx * 1.3, wy + sa * r1 + ny * 1.3],
      [wx + ca * r1 - nx * 1.3, wy + sa * r1 - ny * 1.3],
      [wx + ca * r0 - nx * 2.4, wy + sa * r0 - ny * 2.4],
    ];
    fillChiseledRelief(ctx, spokePoly, paperBank, {
      tone: 'mid', haloWidth: 1.6, chipAmt: 0.35, seed: seed + 10 + i, bleedDabs: false,
    });
  }

  // 3. Thick Faceted Wooden Felloe (`木辋/牙`) constructed as 12 curved mortised segments!
  const segCount = 12;
  const rOut = r;
  const rIn = r - 8.6;
  for (let sIdx = 0; sIdx < segCount; sIdx++) {
    const a0 = angle + (sIdx / segCount) * Math.PI * 2;
    const a1 = angle + ((sIdx + 1) / segCount) * Math.PI * 2;
    const am = (a0 + a1) * 0.5;
    const j0 = stoneNoise1D(sIdx * 2.1, seed) * 0.9;
    const jm = stoneNoise1D(sIdx * 3.7 + 1, seed) * 1.0;
    const segPts = [
      [wx + Math.cos(a0) * (rOut + j0), wy + Math.sin(a0) * (rOut + j0)],
      [wx + Math.cos(am) * (rOut + jm), wy + Math.sin(am) * (rOut + jm)],
      [wx + Math.cos(a1) * (rOut - j0 * 0.5), wy + Math.sin(a1) * (rOut - j0 * 0.5)],
      [wx + Math.cos(a1) * rIn, wy + Math.sin(a1) * rIn],
      [wx + Math.cos(am) * (rIn + jm * 0.5), wy + Math.sin(am) * (rIn + jm * 0.5)],
      [wx + Math.cos(a0) * rIn, wy + Math.sin(a0) * rIn],
    ];
    fillChiseledRelief(ctx, segPts, paperBank, {
      tone: 'light', haloWidth: 1.8, chipAmt: 0.45, seed: seed + 40 + sIdx,
    });

    // Mortise wedge cut (`槥楔卯缝`) & inner rim groove
    chiselVGroove(ctx, [
      [wx + Math.cos(a0) * (rIn - 0.5), wy + Math.sin(a0) * (rIn - 0.5)],
      [wx + Math.cos(a0) * (rOut + 0.5), wy + Math.sin(a0) * (rOut + 0.5)],
    ], 1.8, seed + 60 + sIdx);
    chiselVGroove(ctx, [
      [wx + Math.cos(a0 + 0.05) * (r - 4.2), wy + Math.sin(a0 + 0.05) * (r - 4.2)],
      [wx + Math.cos(a1 - 0.05) * (r - 4.2), wy + Math.sin(a1 - 0.05) * (r - 4.2)],
    ], 1.5, seed + 80 + sIdx);
  }

  // 4. Barrel Wooden Hub (`贤/毂`) with Bronze `軎` Axle-Cap & Linchpin (`辖`)
  const hubPts = makeChiselDiscPts(wx, wy, 11.2, 10, 0.7, seed + 95, angle);
  fillChiseledRelief(ctx, hubPts, paperBank, { tone: 'light', haloWidth: 2.6, chipAmt: 0.4, seed: seed + 96 });
  fillChiseledRelief(ctx, [
    [wx - 4.2, wy - 4.2], [wx + 4.2, wy - 4.2], [wx + 4.2, wy + 4.2], [wx - 4.2, wy + 4.2],
  ], paperBank, { solidColor: SOOT_BG, haloWidth: 0, chipAmt: 0.2, seed: seed + 98 });
  // Bronze linchpin cross-bar (`车辖销`)
  chiselVGroove(ctx, [[wx - 8.5, wy], [wx + 8.5, wy]], 2.0, seed + 99);

  ctx.restore();
}

function drawHanReliefPelicanAndBike(ctx, rig, t, paperBank) {
  const s = rig.root.scale;
  ctx.save();

  const drawHanLeg = (hipPt, kneePt, footPt, pedalPt, legTone, legSeed) => {
    // Wooden crank arm with bronze pin
    drawChiseledStrut(ctx, rig.bb.x, rig.bb.y, pedalPt.x, pedalPt.y, 5.6 * s, paperBank, {
      tone: 'mid', haloWidth: 2.4 * s, seed: legSeed, intaglioCore: true,
    });

    // Chiseled feathered thigh block + scaly tarsus strut
    const dx1 = kneePt.x - hipPt.x;
    const dy1 = kneePt.y - hipPt.y;
    const l1 = Math.hypot(dx1, dy1) || 1;
    const nx1 = (-dy1 / l1) * 6.2 * s;
    const ny1 = (dx1 / l1) * 6.2 * s;
    fillChiseledRelief(ctx, [
      [hipPt.x + nx1, hipPt.y + ny1],
      [kneePt.x + nx1 * 0.72, kneePt.y + ny1 * 0.72],
      [kneePt.x - nx1 * 0.72, kneePt.y - ny1 * 0.72],
      [hipPt.x - nx1, hipPt.y - ny1],
    ], paperBank, { tone: legTone, haloWidth: 3.0 * s, chipAmt: 0.55, seed: legSeed + 3 });

    drawChiseledStrut(ctx, kneePt.x, kneePt.y, footPt.x, footPt.y, 6.4 * s, paperBank, {
      tone: legTone, haloWidth: 2.8 * s, seed: legSeed + 5, intaglioCore: true,
    });

    // Archaic webbed stone-cut foot & mortised wooden pedal block
    fillChiseledRelief(ctx, [
      [footPt.x - 6 * s, footPt.y - 1 * s],
      [footPt.x + 17 * s, footPt.y + 1 * s],
      [footPt.x + 13 * s, footPt.y + 8 * s],
      [footPt.x - 6 * s, footPt.y + 6 * s],
    ], paperBank, { tone: legTone, haloWidth: 2.4 * s, chipAmt: 0.45, seed: legSeed + 7 });

    fillChiseledRelief(ctx, [
      [pedalPt.x - 10 * s, pedalPt.y + 1 * s],
      [pedalPt.x + 10 * s, pedalPt.y + 1 * s],
      [pedalPt.x + 10 * s, pedalPt.y + 7 * s],
      [pedalPt.x - 10 * s, pedalPt.y + 7 * s],
    ], paperBank, { tone: 'light', haloWidth: 2.4 * s, chipAmt: 0.4, seed: legSeed + 9 });
  };

  // 1. Far Leg
  drawHanLeg(rig.leftHip, rig.leftKnee, rig.leftFoot, rig.leftPedal, 'mid', 1200);

  // 2. Kaogongji 14-Spoked Faceted Wooden Wheels
  drawKaogongjiWheel(ctx, rig.rearWheel.x, rig.rearWheel.y, rig.rearWheel.r, rig.rearWheel.angle, 14, paperBank, 1220);
  drawKaogongjiWheel(ctx, rig.frontWheel.x, rig.frontWheel.y, rig.frontWheel.r, rig.frontWheel.angle, 14, paperBank, 1320);

  // 3. Eastern Han Curved-Shaft Timber Chariot-Cycle (`曲辕木构双轮轻轺` — replaces modern straight steel diamond!)
  const drawCurvedTimber = (p0, ctrl, p1, width, seed) => {
    const pts = sampleQuadPts(p0.x, p0.y, ctrl[0], ctrl[1], p1.x, p1.y, 8);
    for (let i = 0; i < pts.length - 1; i++) {
      drawChiseledStrut(ctx, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], width * s, paperBank, {
        tone: 'light', haloWidth: 3.4 * s, seed: seed + i, intaglioCore: true,
      });
    }
  };

  // Curved Han `曲辕` main arched draught-beam (`seatCluster -> arched crest -> headTop`)
  drawCurvedTimber(
    rig.seatCluster,
    [lerp(rig.seatCluster.x, rig.headTop.x, 0.52), lerp(rig.seatCluster.y, rig.headTop.y, 0.5) - 15 * s],
    rig.headTop,
    8.2,
    1410
  );
  // Sweeping curved lower belly-timber (`bb -> arched keel -> headBot`)
  drawCurvedTimber(
    rig.bb,
    [lerp(rig.bb.x, rig.headBot.x, 0.5) + 8 * s, lerp(rig.bb.y, rig.headBot.y, 0.5) + 12 * s],
    rig.headBot,
    7.8,
    1425
  );
  // Mortised wooden stays & slightly arched fork
  drawCurvedTimber(
    rig.rearWheel,
    [lerp(rig.rearWheel.x, rig.seatCluster.x, 0.5) - 6 * s, lerp(rig.rearWheel.y, rig.seatCluster.y, 0.5) - 8 * s],
    rig.seatCluster,
    6.6,
    1440
  );
  drawChiseledStrut(ctx, rig.rearWheel.x, rig.rearWheel.y, rig.bb.x, rig.bb.y, 6.4 * s, paperBank, {
    tone: 'mid', haloWidth: 2.8 * s, seed: 1452, intaglioCore: true,
  });
  drawChiseledStrut(ctx, rig.seatCluster.x, rig.seatCluster.y, rig.bb.x, rig.bb.y, 7.6 * s, paperBank, {
    tone: 'light', haloWidth: 3.2 * s, seed: 1456, intaglioCore: true,
  });
  drawChiseledStrut(ctx, rig.headTop.x, rig.headTop.y, rig.headBot.x, rig.headBot.y, 8.4 * s, paperBank, {
    tone: 'light', haloWidth: 3.4 * s, seed: 1460, intaglioCore: true,
  });
  drawCurvedTimber(
    rig.headBot,
    [rig.headBot.x + 12 * s, lerp(rig.headBot.y, rig.frontWheel.y, 0.52)],
    rig.frontWheel,
    7.2,
    1465
  );
  drawChiseledStrut(ctx, rig.seatCluster.x, rig.seatCluster.y, rig.saddle.x, rig.saddle.y, 6.4 * s, paperBank, {
    tone: 'light', haloWidth: 2.8 * s, seed: 1478,
  });
  drawCurvedTimber(
    rig.headTop,
    [rig.stemTop.x + 8 * s, rig.stemTop.y - 6 * s],
    rig.handleGrip,
    6.4,
    1482
  );

  // Han Bronze `错金云气釭` Joint Sleeves at structural mortise nodes!
  for (const [jx, jy, sd] of [
    [rig.seatCluster.x, rig.seatCluster.y, 1491],
    [rig.headTop.x, rig.headTop.y, 1493],
    [rig.headBot.x, rig.headBot.y, 1495],
  ]) {
    fillChiseledRelief(ctx, [
      [jx - 6.5 * s, jy - 5.5 * s], [jx + 6.5 * s, jy - 5.5 * s],
      [jx + 6.5 * s, jy + 5.5 * s], [jx - 6.5 * s, jy + 5.5 * s],
    ], paperBank, { tone: 'mid', haloWidth: 2.0 * s, chipAmt: 0.4, seed: sd });
    chiselVGroove(ctx, [[jx - 4.5 * s, jy], [jx + 4.5 * s, jy]], 1.6 * s, sd + 1);
  }

  // Braided Hemp Drive Rope (`绞股麻绳传动`) + Carved Jade Bi-Disc Wooden Drive Wheel (`穿璧木轮盘`)
  chiselVGroove(ctx, [[rig.rearWheel.x, rig.rearWheel.y - 6 * s], [rig.bb.x, rig.bb.y - 14 * s]], 2.1 * s, 1501, '#cfc6b4');
  chiselVGroove(ctx, [[rig.rearWheel.x, rig.rearWheel.y + 6 * s], [rig.bb.x, rig.bb.y + 14 * s]], 2.1 * s, 1503, '#cfc6b4');

  const biGear = makeChiselDiscPts(rig.bb.x, rig.bb.y, 15.2 * s, 16, 0.75 * s, 1505, rig.rearWheel.angle);
  fillChiseledRelief(ctx, biGear, paperBank, { tone: 'light', haloWidth: 2.8 * s, chipAmt: 0.4, seed: 1506 });
  const biInner = makeChiselDiscPts(rig.bb.x, rig.bb.y, 8.2 * s, 12, 0.45 * s, 1507, rig.rearWheel.angle);
  chiselVGroove(ctx, [...biInner, biInner[0]], 1.9 * s, 1508);

  // Curved Han Chariot Lacquer-Ear Saddle (`漆绘曲輢座茵`)
  fillChiseledRelief(ctx, [
    [rig.saddle.x - 21 * s, rig.saddle.y - 9 * s],
    [rig.saddle.x - 13 * s, rig.saddle.y + 1 * s],
    [rig.saddle.x + 14 * s, rig.saddle.y + 2 * s],
    [rig.saddle.x + 19 * s, rig.saddle.y - 5 * s],
    [rig.saddle.x + 15 * s, rig.saddle.y + 7 * s],
    [rig.saddle.x - 18 * s, rig.saddle.y + 6 * s],
  ], paperBank, { tone: 'light', haloWidth: 3.0 * s, chipAmt: 0.5, seed: 1512 });

  // 4. Ceremonial Three-Tier Yak-Tail Han Envoy Staff (`三层牦牛尾汉节`) on Handlebar!
  const poleBaseX = rig.headTop.x + 4 * s;
  const poleBaseY = rig.headTop.y - 2 * s;
  const poleTipX = poleBaseX + 34 * s;
  const poleTipY = poleBaseY - 64 * s;
  drawChiseledStrut(ctx, poleBaseX, poleBaseY, poleTipX, poleTipY, 4.4 * s, paperBank, {
    tone: 'light', haloWidth: 2.8 * s, seed: 1520,
  });
  drawChiseledStrut(ctx, poleTipX, poleTipY, poleTipX - 15 * s, poleTipY + 4 * s, 4.0 * s, paperBank, {
    tone: 'light', haloWidth: 2.4 * s, seed: 1522,
  });

  const sway = Math.sin(t * 9.0) * 4.8 * s;
  for (let tier = 0; tier < 3; tier++) {
    const tx = poleTipX - 11 * s + sway * (0.4 + tier * 0.32);
    const ty = poleTipY + (6 + tier * 15) * s;
    fillChiseledRelief(ctx, [
      [tx, ty], [tx - 10.5 * s, ty + 12.5 * s], [tx + 6.5 * s, ty + 13.5 * s],
    ], paperBank, { tone: tier % 2 === 0 ? 'light' : 'mid', haloWidth: 2.4 * s, chipAmt: 0.45, seed: 1530 + tier });
    chiselVGroove(ctx, [[tx - 1 * s, ty + 2 * s], [tx - 3 * s, ty + 11 * s]], 1.5 * s, 1535 + tier);
  }

  // 5. Monumental Chiseled Wu Liang Shrine Pelican (`朱雀/仙禽石刻程式：方折厚重 + 阶梯覆羽 + 三角槽阴刻`)
  const bc = rig.bodyCenter;
  const hd = rig.head;

  // Squared archaic stepped tail-plume register (`古拙方齐平铲尾羽`) + proud arched divine-bird torso!
  const bodyPts = [
    [rig.tailTip.x - 24 * s, rig.tailTip.y - 15 * s],
    [rig.tailTip.x - 6 * s, rig.tailTip.y - 15 * s],
    [rig.tailTip.x - 22 * s, rig.tailTip.y - 5 * s],
    [rig.tailTip.x - 5 * s, rig.tailTip.y - 5 * s],
    [rig.tailTip.x - 20 * s, rig.tailTip.y + 6 * s],
    ...sampleQuadPts(bc.x - 42 * s, bc.y + 12 * s, rig.hip.x - 4 * s, rig.hip.y + 20 * s, bc.x + 24 * s, bc.y + 24 * s, 7),
    ...sampleQuadPts(bc.x + 24 * s, bc.y + 24 * s, rig.chest.x + 25 * s, rig.chest.y + 8 * s, rig.chest.x + 8 * s, rig.chest.y - 10 * s, 6).slice(1),
    ...sampleQuadPts(rig.chest.x + 8 * s, rig.chest.y - 10 * s, bc.x - 22 * s, bc.y - 32 * s, rig.tailTip.x + 6 * s, rig.tailTip.y - 14 * s, 7).slice(1),
  ];
  fillChiseledRelief(ctx, bodyPts, paperBank, { tone: 'light', haloWidth: 4.4 * s, chipAmt: 0.75 * s, seed: 1550 });

  // Broad Chiseled S-Neck Polygon (built as variable-thickness stone relief band — zero uniform `stroke`!)
  const neckSpine = sampleCubicPts(
    rig.chest.x, rig.chest.y + 2 * s,
    rig.neckC1.x, rig.neckC1.y,
    rig.neckC2.x, rig.neckC2.y,
    hd.x, hd.y,
    12
  );
  const neckL = [];
  const neckR = [];
  for (let i = 0; i < neckSpine.length; i++) {
    const u = i / (neckSpine.length - 1);
    const [px, py] = neckSpine[i];
    const [xP, yP] = neckSpine[Math.max(0, i - 1)];
    const [xN, yN] = neckSpine[Math.min(neckSpine.length - 1, i + 1)];
    const tl = Math.hypot(xN - xP, yN - yP) || 1;
    const nx = -(yN - yP) / tl;
    const ny = (xN - xP) / tl;
    const hw = lerp(11.8, 9.4, u) * s;
    neckL.push([px + nx * hw, py + ny * hw]);
    neckR.push([px - nx * hw, py - ny * hw]);
  }
  fillChiseledRelief(ctx, [...neckL, ...neckR.reverse()], paperBank, {
    tone: 'light', haloWidth: 4.0 * s, chipAmt: 0.55 * s, seed: 1560,
  });

  // Intaglio neck feather groove & Han ceremonial `颈绶` collar band
  chiselVGroove(ctx, neckSpine.map(([px, py]) => [px - 2.5 * s, py]), 2.0 * s, 1565);
  chiselVGroove(ctx, [[rig.chest.x - 9 * s, rig.chest.y - 6 * s], [rig.chest.x + 13 * s, rig.chest.y + 4 * s]], 3.0 * s, 1567);

  // Chiseled Head + Archaic Stepped Phoenix Crest Plumes
  const headPts = [
    [hd.x - 16 * s, hd.y - 6 * s],
    [rig.crest1.x - 14 * s, rig.crest1.y - 6 * s],
    [hd.x - 8 * s, hd.y - 14 * s],
    [rig.crest2.x - 16 * s, rig.crest2.y + 2 * s],
    [hd.x - 13 * s, hd.y + 6 * s],
    ...sampleQuadPts(hd.x - 13 * s, hd.y + 6 * s, hd.x, hd.y + 18 * s, hd.x + 14 * s, hd.y + 12 * s, 5).slice(1),
    ...sampleQuadPts(hd.x + 14 * s, hd.y + 12 * s, hd.x + 18 * s, hd.y - 8 * s, hd.x + 2 * s, hd.y - 18 * s, 5).slice(1),
  ];
  fillChiseledRelief(ctx, headPts, paperBank, { tone: 'light', haloWidth: 3.8 * s, chipAmt: 0.55 * s, seed: 1570 });

  // Chiseled Gular Throat Pouch + V-Groove Stone Ribs
  const bu = rig.beakUpperBase;
  const bl = rig.beakLowerBase;
  const bt = rig.beakTip;
  const pb = rig.pouchBelly;

  const pouchPts = [
    ...sampleQuadPts(bl.x - 2 * s, bl.y, pb.x, pb.y + 8 * s, bt.x - 4 * s, bt.y + 2 * s, 9),
    [bu.x, bu.y + 4 * s],
  ];
  fillChiseledRelief(ctx, pouchPts, paperBank, { tone: 'mid', haloWidth: 3.6 * s, chipAmt: 0.6 * s, seed: 1580 });

  for (let k = 1; k <= 3; k++) {
    const f = k / 4;
    chiselCurveGroove(
      ctx,
      lerp(bl.x, bu.x + 18 * s, f * 0.5),
      lerp(bl.y + 2 * s, bu.y + 7 * s, f),
      lerp(bl.x, pb.x + 8 * s, 0.35 + f * 0.4),
      lerp(bl.y, pb.y + 4 * s, 0.5 + f * 0.35),
      bt.x - (10 + k * 7) * s,
      bt.y + 2 * s,
      2.0 * s,
      1585 + k
    );
  }

  // Faceted Hooked Upper Beak
  fillChiseledRelief(ctx, [
    [bu.x - 2 * s, bu.y - 3 * s],
    [bt.x + 2 * s, bt.y - 5 * s],
    [bt.x + 9 * s, bt.y + 4 * s],
    [bt.x - 1 * s, bt.y + 8 * s],
    [bt.x - 5 * s, bt.y + 2 * s],
    [bl.x, bl.y + 1 * s],
  ], paperBank, { tone: 'light', haloWidth: 3.4 * s, chipAmt: 0.5 * s, seed: 1592 });
  chiselVGroove(ctx, [[bu.x + 4 * s, bu.y + 1 * s], [bt.x - 3 * s, bt.y - 1 * s]], 1.9 * s, 1594);

  // Archaic Diamond-Almond Carved Eye (zero `ctx.arc`!)
  const ex = hd.x + 4 * s;
  const ey = hd.y - 3 * s;
  fillChiseledRelief(ctx, [
    [ex - 7 * s, ey], [ex, ey - 4.5 * s], [ex + 7 * s, ey], [ex, ey + 4.5 * s],
  ], paperBank, { solidColor: SOOT_BG, haloWidth: 0, chipAmt: 0.2, seed: 1596 });
  fillChiseledRelief(
    ctx,
    makeChiselDiscPts(ex + 0.8 * s, ey, 2.1 * s, 6, 0.2, 1598),
    paperBank,
    { tone: 'light', haloWidth: 0, chipAmt: 0.1, seed: 1599, bleedDabs: false }
  );

  // Stepped tail & flank feather V-groove incisions
  for (let row = 0; row < 3; row++) {
    const ry = bc.y - 12 * s + row * 9 * s;
    const rx0 = bc.x - 30 * s + row * 4 * s;
    chiselVGroove(ctx, [[rx0, ry], [rx0 - 30 * s, ry + (row - 1) * 3 * s]], 2.2 * s, 1605 + row);
  }

  // 6. Near Leg
  drawHanLeg(rig.rightHip, rig.rightKnee, rig.rightFoot, rig.rightPedal, 'light', 1620);

  // 7. Wu Liang Shrine 3-Register Stepped Relief Wing (`三层阶梯式覆羽浮雕带`) Reaching to Handlebar!
  const ws = rig.wingShoulder;
  const we = rig.wingElbow;
  const wt = rig.wingTip;

  // Register 3 (Outer flight-feather tier)
  const wingOuter = [
    ...sampleQuadPts(ws.x - 12 * s, ws.y - 4 * s, we.x + 16 * s, we.y - 9 * s, wt.x + 8 * s, wt.y - 1 * s, 7),
    [wt.x + 4 * s, wt.y + 10 * s],
    ...sampleQuadPts(wt.x + 4 * s, wt.y + 10 * s, we.x - 12 * s, we.y + 21 * s, ws.x - 18 * s, ws.y + 13 * s, 7).slice(1),
  ];
  fillChiseledRelief(ctx, wingOuter, paperBank, { tone: 'light', haloWidth: 4.0 * s, chipAmt: 0.6 * s, seed: 1640 });

  // Stepped chisel boundary lines dividing Wing Registers 1, 2, and 3 + flight-feather troughs!
  chiselCurveGroove(ctx, ws.x - 14 * s, ws.y + 5 * s, we.x - 4 * s, we.y + 8 * s, wt.x - 14 * s, wt.y + 2 * s, 2.2 * s, 1645);
  chiselCurveGroove(ctx, ws.x - 10 * s, ws.y + 1 * s, we.x + 2 * s, we.y + 2 * s, we.x + 18 * s, we.y - 1 * s, 2.0 * s, 1647);

  // Cloud-volute shoulder carving (`云纹翼肩`, polygonal spiral!)
  const shoulderSpiral = [];
  for (let k = 0; k <= 10; k++) {
    const a = (k / 10) * Math.PI * 1.75;
    const sr = (6.8 - k * 0.42) * s;
    shoulderSpiral.push([ws.x + 1 * s + Math.cos(a) * sr, ws.y + 3 * s + Math.sin(a) * sr]);
  }
  chiselVGroove(ctx, shoulderSpiral, 2.1 * s, 1650);

  for (let f = 0; f < 5; f++) {
    const u = f / 4;
    chiselVGroove(ctx, [
      [lerp(ws.x - 10 * s, we.x + 4 * s, u), lerp(ws.y + 6 * s, we.y + 10 * s, u)],
      [lerp(we.x - 8 * s, wt.x + 4 * s, u), lerp(we.y + 17 * s, wt.y + 8 * s, u)],
    ], 2.0 * s, 1660 + f);
  }

  ctx.restore();
}

// -----------------------------------------------------------------------------
// Exported Scene Renderer
// -----------------------------------------------------------------------------
export function render(kit, slot, scene, params) {
  const {
    t,
    localT,
    pelicanLocalX,
    pedalAngle,
    speedScale,
    isOutroThumbnail = false,
  } = params;

  const g = slot.g2d;
  const ctx = g.drawingContext;
  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Pre-baked fibrous Mianlian paper bank & Wujin stone-rubbing slab (`slot.usedFb = false`!)
  const paperBank = getMianlianPaperBank(kit);
  const slabBg = getBakedHanSlab(kit, paperBank);
  ctx.drawImage(slabBg.canvas, 0, 0);

  // 2. Synchronized Zero-Overlap Eastern Han Chariot & Cavalry Cortege
  const anchorX = isOutroThumbnail ? 485 : clamp(pelicanLocalX, -120, PANEL_SIZE + 120);
  // Crisp two-beat solemn head-snap & pointing reaction in Bar 2 (`localT 1.6..4.8s`)
  const sideEyeEnv = smoothstep(1.45, 2.05, localT) * (1 - smoothstep(4.35, 5.05, localT));

  drawHanCavalryRider(ctx, anchorX - 575, ROAD_EDGE_Y, t, 0, paperBank, 'rear_guard');
  drawHanCavalryRider(ctx, anchorX - 775, ROAD_EDGE_Y, t, 0, paperBank, 'herald');

  if (anchorX - 372 > -280 && anchorX - 372 < PANEL_SIZE + 120) {
    drawRearCanopyChariot(ctx, anchorX - 372, ROAD_EDGE_Y, t, sideEyeEnv, paperBank);
  }

  drawHanCavalryRider(ctx, anchorX + 248, ROAD_EDGE_Y, t, sideEyeEnv, paperBank, 'vanguard');
  drawHanCavalryRider(ctx, anchorX + 454, ROAD_EDGE_Y, t, 0, paperBank, 'herald');
  drawHanCavalryRider(ctx, anchorX + 660, ROAD_EDGE_Y, t, 0, paperBank, 'herald');

  // 3. Deadpan Wu Liang Shrine Relief Pelican & Kaogongji Wooden Chariot-Bicycle
  if (pelicanLocalX > -260 && pelicanLocalX < PANEL_SIZE + 260) {
    // Subtle 120-BPM heavy wooden-wheel stone-joint micro-jolt (converges to 0 at x < 90 & x > 910!)
    const edgeGuard = smoothstep(10, 95, pelicanLocalX) * smoothstep(10, 95, PANEL_SIZE - pelicanLocalX);
    const stoneJolt = Math.abs(Math.sin(t * Math.PI * 4.0)) * -1.35 * edgeGuard;

    const rig = computePelicanRig({
      x: isOutroThumbnail ? 485 : pelicanLocalX,
      y: ROAD_EDGE_Y + stoneJolt,
      pedalAngle,
      scale: 1.0,
      slope: 0,
      speedScale,
      poseMode: 'normal',
      time: t,
    });
    drawHanReliefPelicanAndBike(ctx, rig, t, paperBank);
  }

  // 4. Foreground Stone Pitting (`石花`) & Spalled Broken-Slab Cracks (`断碑崩茬`)
  const weathering = getBakedStoneWeatheringOverlay(kit);
  ctx.drawImage(weathering.canvas, 0, 0);

  // 5. No modern top-left box in `!isOutroThumbnail` (handled by outer bronze museum placard!);
  //    Preserve bottom gallery thumbnail label for Outro 7x3 exhibition wall!
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(15, 14, 12, 0.78)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.fillStyle = '#f5f0e6';
    ctx.font = '700 48px "PelicanSerif", serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} ${scene.zh}`, 36, PANEL_SIZE - 48);
  }

  ctx.restore();
}
