// src/scenes/s04_tang.js
// Scene #04: 唐代白描 (Tang Dynasty Pure Ink Baimiao · c. 750 CE, Wu Daozi "吴带当风" Style) — r3 Masterpiece
// Physical Medium: Pure pine-soot ink (`焦浓重淡清` five shades, ZERO color pigment except cinnabar seals)
// brushed with a wolf-hair pointed `狼毫圭笔` onto waxed High-Tang `硬黄捣制麻纸` handscroll paper.
// - Hybrid WebGL2 `kit.bakeBrush` (spectral Yinghuang wax-tea patina clouds + misty distant pale-ink willow haze)
//   transferred once via `fb.get().canvas` into `bake2D` (`slot.usedFb = false`, <16ms/frame, Outro-safe).
// - Pattern-Preserving Hemp Paper Occlusion (`bindScrollPaperFill`): ALL dynamic bodies, silk ribbons, wheels &
//   petals composite the exact underlying `1000x1000` hemp paper fibers & creases (ZERO flat CSS `#eae0c8` cutouts!).
// - Dual-Layer Calligraphic Engine (`drawLanyeStroke`): wrist micro-tremor, pale-ink sizing halo + dense carbon
//   center-bone, dwell ink pooling at turns, and 5~9 filament wolf-hair dry-brush tip splitting (`狼毫丝毛飞白`).
// - Zero banned primitives (`ctx.arc`, `strokeRect`, `roundRect`, `setLineDash`, `createRadialGradient` = 0!).
// - Abolished ruler-straight `y=680` line & uniform fish-scale wave grid: undulating overlapping cloud-head stone
//   embankment strokes (locked at `(0,680)` & `(1000,680)`) interwoven with wind-bent wild ink orchids, plus
//   asymmetric Wu-style surging river eddies (`奔流回澜水法`), High-Tang carved bentwood chariot with draped brocade
//   `绣茵鞍袱` & gyroscopic `葡萄花鸟银香囊`, advected traveling-wave flipping Apsaras ribbons, and vertical `乌丝栏` title slip!

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  clamp,
  lerp,
  smoothstep,
} from '../beat/timeline.js';
import { computePelicanRig } from '../rig/pelican.js';
import { INK_SHADES, getInkPaper } from '../kit/ink.js';

const CINNABAR_SEAL = '#a82c21';
const PAPER_FALLBACK = '#eae0c8';

// -----------------------------------------------------------------------------
// Deterministic Hash, Wrist-Tremor Noise & Hand-Brushed Curve Samplers (ZERO `ctx.arc`!)
// -----------------------------------------------------------------------------
function brushHash(n) {
  let x = Math.imul(n | 0, 0x27d4eb2d);
  x = (x ^ (x >>> 15)) >>> 0;
  x = Math.imul(x, 0x85ebca6b) >>> 0;
  return ((x ^ (x >>> 13)) >>> 0) * 2.3283064365386963e-10;
}

function wristNoise1D(u, seed = 1) {
  const i = Math.floor(u);
  const f = u - i;
  const s = f * f * (3 - 2 * f);
  return lerp(brushHash(i + seed * 137), brushHash(i + 1 + seed * 137), s) * 2 - 1;
}

function sampleBezier(p0, p1, p2, p3, steps = 22) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    pts.push([
      mt * mt * mt * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t * t * t * p3[0],
      mt * mt * mt * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return pts;
}

function sampleQuad(p0, p1, p2, steps = 16) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    pts.push([
      mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0],
      mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1],
    ]);
  }
  return pts;
}

/**
 * Generates a hand-brushed center-tip organic ring/ellipse polyline with natural calligrapher
 * wrist breathing (completely replacing mathematical `ctx.arc` & `ctx.ellipse`!).
 */
function sampleHandRingPts(cx, cy, rx, ry = rx, steps = 28, wobble = 0.75, seed = 11, rot = 0, closeOverlap = true) {
  const pts = [];
  const total = closeOverlap ? steps + 2 : steps;
  const cr = Math.cos(rot);
  const sr = Math.sin(rot);
  for (let i = 0; i <= total; i++) {
    const u = i / steps;
    const a = u * Math.PI * 2;
    const dr = wristNoise1D(u * 5.2, seed) * wobble;
    const lx = Math.cos(a) * (rx + dr);
    const ly = Math.sin(a) * (ry + dr * (ry / Math.max(1, rx)));
    pts.push([cx + lx * cr - ly * sr, cy + lx * sr + ly * cr]);
  }
  return pts;
}

// -----------------------------------------------------------------------------
// Calligraphic Wolf-Hair Brush Engine: Dual-Layer `浓骨淡韵` 兰叶描 & Multi-Filament Split
// -----------------------------------------------------------------------------
/**
 * Wu Daozi Wolf-Hair Orchid-Leaf Stroke (`双层浓骨淡韵兰叶描 + 狼毫丝毛飞白`):
 * - Subtle wrist tremor along normals (`tremor`) eliminates CAD Bezier smoothness;
 * - Dual-layer ink physics: soft `淡墨` sizing diffusion halo beneath dense `焦/浓墨` center bone;
 * - Automatic dwell-pressure thickening at sharp turns;
 * - Optional 5~9 filament wolf-hair dry-brush tip split (`splitFilaments`) on wind-whipped exits!
 */
function drawLanyeStroke(ctx, pts, {
  minW = 0.65,
  maxW = 5.4,
  color = INK_SHADES.jiao,
  haloColor = INK_SHADES.dan,
  alpha = 1.0,
  waves = 2.0,
  phase = 0.0,
  sharpTail = true,
  tailStart = 0.68,
  tremor = 0.42,
  halo = true,
  splitFilaments = 0,
  seed = 19,
} = {}) {
  const n = pts.length;
  if (n < 2) return;

  const leftBone = [];
  const rightBone = [];
  const leftHalo = [];
  const rightHalo = [];
  const normals = [];
  const halfWidths = [];
  const centers = [];

  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const [rawX, rawY] = pts[i];
    const [prevX, prevY] = pts[Math.max(0, i - 1)];
    const [nextX, nextY] = pts[Math.min(n - 1, i + 1)];
    const tx = nextX - prevX;
    const ty = nextY - prevY;
    const tl = Math.hypot(tx, ty) || 1;
    const nx = -ty / tl;
    const ny = tx / tl;

    // Subtle calligrapher wrist tremor (pinned to 0 at endpoints if sharpTail=false so joints stay exact!)
    const endPin = sharpTail ? smoothstep(0, 0.08, u) : smoothstep(0, 0.12, u) * smoothstep(0, 0.12, 1 - u);
    const jitter = tremor > 0 ? wristNoise1D(u * 7.5 + phase, seed) * tremor * endPin : 0;
    const px = rawX + nx * jitter;
    const py = rawY + ny * jitter;

    let env;
    if (u < 0.08) {
      // 藏锋起笔: crisp press-in dwell
      env = 0.26 + 0.74 * Math.sin((u / 0.08) * (Math.PI * 0.5));
    } else if (sharpTail && u > tailStart) {
      // 长锋出锋: extended supple wolf-hair whip exit
      const k = (1 - u) / Math.max(0.05, 1 - tailStart);
      env = Math.pow(Math.max(0, k), 1.52);
    } else {
      env = 0.96;
    }

    // Curvature dwell bonus (`折钗/顿挫驻笔蓄墨`)
    let turnBonus = 0;
    if (i > 0 && i < n - 1) {
      const dxA = rawX - prevX;
      const dyA = rawY - prevY;
      const dxB = nextX - rawX;
      const dyB = nextY - rawY;
      const lA = Math.hypot(dxA, dyA) || 1;
      const lB = Math.hypot(dxB, dyB) || 1;
      const cosTurn = clamp((dxA * dxB + dyA * dyB) / (lA * lB), -1, 1);
      turnBonus = (1 - cosTurn) * 0.35;
    }

    const swell = Math.pow(0.5 + 0.5 * Math.sin(u * Math.PI * waves + phase), 0.85);
    const w = lerp(minW, maxW, clamp(env * (0.30 + 0.70 * swell + turnBonus), 0.02, 1.0));
    const hw = 0.5 * w;
    const haloExtra = halo ? Math.min(0.85, 0.32 + hw * 0.24) : 0;

    centers.push([px, py]);
    normals.push([nx, ny]);
    halfWidths.push(hw);

    leftBone.push([px + nx * hw, py + ny * hw]);
    rightBone.push([px - nx * hw, py - ny * hw]);
    if (halo) {
      leftHalo.push([px + nx * (hw + haloExtra), py + ny * (hw + haloExtra)]);
      rightHalo.push([px - nx * (hw + haloExtra), py - ny * (hw + haloExtra)]);
    }
  }

  ctx.save();

  // 1. Pale-ink sizing fiber-diffusion halo (`淡韵渗边`)
  if (halo && maxW >= 1.6) {
    ctx.globalAlpha = alpha * 0.24;
    ctx.fillStyle = haloColor;
    ctx.beginPath();
    ctx.moveTo(leftHalo[0][0], leftHalo[0][1]);
    for (let i = 1; i < n; i++) ctx.lineTo(leftHalo[i][0], leftHalo[i][1]);
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(rightHalo[i][0], rightHalo[i][1]);
    ctx.closePath();
    ctx.fill();
  }

  // 2. Dense center-tip carbon ink bone (`中锋浓墨骨线`)
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(leftBone[0][0], leftBone[0][1]);
  for (let i = 1; i < n; i++) ctx.lineTo(leftBone[i][0], leftBone[i][1]);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(rightBone[i][0], rightBone[i][1]);
  ctx.closePath();
  ctx.fill();

  // 3. Multi-filament wolf-hair dry-brush tip split (`5~9 丝狼毫分叉飞白`)
  if (splitFilaments >= 3 && n >= 6) {
    const startIdx = Math.max(1, Math.floor(n * 0.62));
    const endPt = centers[n - 1];
    const prevPt = centers[n - 2];
    const dirX = endPt[0] - prevPt[0];
    const dirY = endPt[1] - prevPt[1];
    const dirL = Math.hypot(dirX, dirY) || 1;
    const ux = dirX / dirL;
    const uy = dirY / dirL;
    const unx = -uy;
    const uny = ux;

    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    for (let f = 0; f < splitFilaments; f++) {
      const fNorm = (f / (splitFilaments - 1)) * 2 - 1; // [-1..1]
      const fLenExtra = (4 + brushHash(seed * 31 + f * 17) * 14) * (1 - 0.35 * Math.abs(fNorm));
      ctx.lineWidth = Math.max(0.32, 0.72 - 0.25 * Math.abs(fNorm));
      ctx.globalAlpha = alpha * (0.36 + 0.38 * (1 - Math.abs(fNorm)));
      ctx.beginPath();
      for (let i = startIdx; i < n; i++) {
        const k = (i - startIdx) / Math.max(1, n - 1 - startIdx);
        const spread = fNorm * (halfWidths[startIdx] * 1.15 + k * 2.8);
        const fx = centers[i][0] + normals[i][0] * spread;
        const fy = centers[i][1] + normals[i][1] * spread;
        if (i === startIdx) ctx.moveTo(fx, fy);
        else ctx.lineTo(fx, fy);
      }
      ctx.lineTo(
        endPt[0] + ux * fLenExtra + unx * fNorm * 3.4,
        endPt[1] + uy * fLenExtra + uny * fNorm * 3.4
      );
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Gu Kaizhi / Wu Daozi Iron-Wire & Lute-String Stroke (`铁线描 / 琴弦描`) with subtle hand warmth.
 */
function drawTiexianStroke(ctx, pts, width = 1.55, color = INK_SHADES.nong, alpha = 1.0, seed = 29) {
  if (!pts || pts.length < 2) return;
  drawLanyeStroke(ctx, pts, {
    minW: width * 0.72,
    maxW: width * 1.18,
    color,
    alpha,
    waves: 1.5,
    phase: seed * 0.3,
    sharpTail: false,
    tremor: 0.24,
    halo: false,
    seed,
  });
}

// -----------------------------------------------------------------------------
// Pre-Baked Aged High-Tang Waxed `硬黄麻纸` Substrate & Pattern-Preserving Occlusion!
// -----------------------------------------------------------------------------
function getBakedYinghuangPaper(kit) {
  return kit.bake2D('s04_yinghuang_paper_r3', (_g, ctx, rng, w, h) => {
    // 1. Base hemp paper
    const basePaper = getInkPaper(kit, 'baimiao');
    ctx.drawImage(basePaper.canvas, 0, 0);

    // 2. WebGL2 `kit.bakeBrush` Kubelka-Munk spectral wax-burnished tea/amber sizing clouds (`硬黄蜡染包浆`)
    if (kit && typeof kit.bakeBrush === 'function' && kit.brush) {
      const waxFb = kit.bakeBrush('s04_yinghuang_wax_brush_r3', (p, brush, bRng) => {
        p.background(236, 225, 200);
        brush.noStroke();
        brush.noHatch();

        const patinaTones = ['#dccaa2', '#e8dbb9', '#cfb98d', '#e2d3ae', '#c8b082'];
        for (let i = 0; i < 16; i++) {
          const cx = bRng() * w;
          const cy = bRng() * h;
          const rx = 110 + bRng() * 210;
          const ry = 70 + bRng() * 145;
          const poly = [];
          for (let k = 0; k < 8; k++) {
            const a = (k / 8) * Math.PI * 2;
            const rs = 0.7 + bRng() * 0.5;
            poly.push([cx + Math.cos(a) * rx * rs, cy + Math.sin(a) * ry * rs]);
          }
          brush.fill(patinaTones[i % patinaTones.length], 42 + Math.floor(bRng() * 44));
          brush.fillBleed(0.32, 'out');
          brush.fillTexture(0.76, 0.38);
          brush.polygon(poly);
        }

        // Subtle mulberry/hemp coarse fiber threads via fine `2H` & `rotring` strokes
        for (let f = 0; f < 110; f++) {
          const fx = bRng() * w;
          const fy = bRng() * h;
          const flen = 12 + bRng() * 32;
          const ang = (bRng() - 0.5) * 0.45;
          brush.set(f % 2 === 0 ? '2H' : 'cpencil', f % 3 === 0 ? '#a89067' : '#f7f0de', 0.45 + bRng() * 0.35);
          brush.line(fx, fy, fx + Math.cos(ang) * flen, fy + Math.sin(ang) * flen);
        }
      });
      const snap = waxFb.get();
      if (snap && snap.canvas) {
        ctx.save();
        ctx.globalAlpha = 0.52;
        ctx.drawImage(snap.canvas, 0, 0, w, h);
        ctx.restore();
      }
    }

    // 3. Crisp laid bamboo-screen ribs (`麻纸竹帘横纹`) & vertical handscroll rolling creases (`卷轴折痕包浆`)
    for (let y = 2; y < h; y += 5) {
      ctx.fillStyle = `rgba(116, 94, 62, ${(0.022 + rng() * 0.024).toFixed(3)})`;
      ctx.fillRect(0, y, w, 1);
    }

    // Aged handscroll top/bottom tea-darkened mounting patina
    const edgeGrad = ctx.createLinearGradient(0, 0, 0, h);
    edgeGrad.addColorStop(0, 'rgba(124, 96, 56, 0.16)');
    edgeGrad.addColorStop(0.08, 'rgba(124, 96, 56, 0)');
    edgeGrad.addColorStop(0.90, 'rgba(124, 96, 56, 0)');
    edgeGrad.addColorStop(1, 'rgba(116, 88, 50, 0.18)');
    ctx.fillStyle = edgeGrad;
    ctx.fillRect(0, 0, w, h);

    // Historical vertical scroll-sheet join seam (`纸幅拼缝` at x = 688) & subtle rolling creases
    for (const [cx, alpha] of [[284, 0.07], [688, 0.17], [812, 0.06]]) {
      ctx.fillStyle = `rgba(104, 82, 52, ${alpha})`;
      ctx.fillRect(cx, 0, 1.2, h);
      ctx.fillStyle = `rgba(255, 249, 236, ${alpha * 0.65})`;
      ctx.fillRect(cx + 1.4, 0, 1.0, h);
    }

    // Delicate 1,200-year museum foxing specks (`古纸微斑`, irregular polygons — zero `ctx.arc`!)
    for (let s = 0; s < 55; s++) {
      const sx = rng() * w;
      const sy = rng() * h;
      const sr = 1.2 + rng() * 3.8;
      const pts = sampleHandRingPts(sx, sy, sr, sr * 0.8, 7, 0.45, s + 9, 0, false);
      ctx.fillStyle = `rgba(132, 100, 60, ${(0.035 + rng() * 0.055).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let k = 1; k < pts.length; k++) ctx.lineTo(pts[k][0], pts[k][1]);
      ctx.closePath();
      ctx.fill();
    }
  });
}

/**
 * Binds the baked `1000x1000` Yinghuang hemp paper in global panel coordinates so ANY occluding
 * silhouette (pelican, silk ribbon, wooden wheel, petal) preserves 100% continuous hemp paper
 * fibers & creases underneath instead of erasing them with flat `#eae0c8`!
 */
function bindScrollPaperFill(ctx, paperCanvas) {
  if (!paperCanvas || typeof ctx.createPattern !== 'function') {
    ctx.fillStyle = PAPER_FALLBACK;
    return;
  }
  const pat = ctx.createPattern(paperCanvas, 'repeat');
  if (pat && typeof pat.setTransform === 'function' && typeof ctx.getTransform === 'function') {
    const m = ctx.getTransform();
    if (m && typeof m.inverse === 'function') {
      pat.setTransform(m.inverse());
    }
  }
  ctx.fillStyle = pat || PAPER_FALLBACK;
}

function fillPaperMaskPoly(ctx, pts, paperCanvas, maskAlpha = 1.0) {
  if (!pts || pts.length < 3 || maskAlpha <= 0.005) return;
  ctx.save();
  ctx.globalAlpha *= maskAlpha;
  bindScrollPaperFill(ctx, paperCanvas);
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}


// -----------------------------------------------------------------------------
// Antique Mottled Cinnabar Seals, Ruyi Cloud-Scrolls, Willows, Orchids & Surging River
// -----------------------------------------------------------------------------
function drawHandCinnabarSeal(ctx, x, y, w, h, chars, yang = true, seed = 1) {
  ctx.save();
  // Hand-carved weathered seal perimeter (irregular polygon, zero `strokeRect`!)
  const pad = 2.0;
  const perim = [
    [x, y + 1.2], [x + w * 0.35, y], [x + w * 0.75, y + 0.8], [x + w, y + 1.5],
    [x + w - 0.6, y + h * 0.45], [x + w + 0.4, y + h * 0.82], [x + w - 1.1, y + h],
    [x + w * 0.62, y + h - 0.5], [x + w * 0.25, y + h + 0.4], [x + 0.8, y + h - 1.0],
    [x - 0.4, y + h * 0.58], [x + 0.5, y + h * 0.22], [x, y + 1.2],
  ];

  if (!yang) {
    ctx.fillStyle = CINNABAR_SEAL;
    ctx.globalAlpha = 0.86;
    ctx.beginPath();
    ctx.moveTo(perim[0][0], perim[0][1]);
    for (let i = 1; i < perim.length; i++) ctx.lineTo(perim[i][0], perim[i][1]);
    ctx.closePath();
    ctx.fill();
  } else {
    drawLanyeStroke(ctx, perim, {
      minW: 1.5,
      maxW: 2.8,
      color: CINNABAR_SEAL,
      alpha: 0.86,
      waves: 2.5,
      phase: seed,
      sharpTail: false,
      tremor: 0.35,
      halo: false,
      seed,
    });
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = yang ? CINNABAR_SEAL : PAPER_FALLBACK;
  ctx.globalAlpha = yang ? 0.86 : 0.92;
  const cols = chars.length === 4 ? 2 : 1;
  const rows = chars.length === 4 ? 2 : chars.length;
  const cw = (w - pad * 2) / cols;
  const ch = (h - pad * 2) / rows;
  ctx.font = `700 ${Math.floor(Math.min(cw, ch) * 0.82)}px "Noto Serif CJK SC", "Songti SC", serif`;
  for (let i = 0; i < chars.length; i++) {
    const col = cols === 2 ? (i < 2 ? 1 : 0) : 0; // Traditional right-to-left seal column order!
    const row = cols === 2 ? (i % 2) : i;
    ctx.fillText(chars[i], x + pad + (col + 0.5) * cw, y + pad + (row + 0.54) * ch);
  }

  // Mottled hemp-paper fiber dropouts (`印泥飞白剥蚀`)
  ctx.fillStyle = PAPER_FALLBACK;
  ctx.globalAlpha = 0.65;
  for (let k = 0; k < 14; k++) {
    const fx = x + brushHash(seed * 31 + k) * w;
    const fy = y + brushHash(seed * 53 + k) * h;
    ctx.fillRect(fx, fy, 0.9 + brushHash(k + 7) * 2.1, 0.8 + brushHash(k + 19) * 1.4);
  }
  ctx.restore();
}

function drawTangRuyiCloudBand(ctx, x, y, scale, flip, alpha, seed) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(flip ? -scale : scale, scale);

  // Voluminous 3-lobe High-Tang Ruyi mushroom head (`盛唐三叠如意云头`)
  const mainHead = [
    ...sampleBezier([-130, 14], [-104, -10], [-68, -14], [-42, 4], 16),
    ...sampleBezier([-42, 4], [-34, -26], [6, -34], [28, -8], 18),
    ...sampleBezier([28, -8], [52, -24], [86, -8], [76, 16], 16),
    ...sampleBezier([76, 16], [62, 32], [28, 28], [14, 14], 14),
  ];
  drawLanyeStroke(ctx, mainHead, {
    minW: 0.7, maxW: 3.2, color: INK_SHADES.zhong, alpha, waves: 2.2, phase: seed, tremor: 0.55, splitFilaments: 5, seed,
  });

  // Inner parallel琴弦描 (`Qinxian`) double-hook cloud-eye spirals (`双勾云眼涡卷`)
  const spiralA = sampleBezier([-22, -4], [-8, -20], [18, -16], [12, 2], 16);
  const spiralB = sampleBezier([32, -2], [50, -14], [66, -2], [54, 12], 14);
  drawTiexianStroke(ctx, spiralA, 1.15, INK_SHADES.dan, alpha * 0.85, seed + 3);
  drawTiexianStroke(ctx, spiralB, 1.05, INK_SHADES.dan, alpha * 0.8, seed + 7);

  // Long sweeping `吴带` cloud-tail ribbons (`流云长尾`)
  for (let k = 0; k < 3; k++) {
    const oy = k * 7.5;
    const len = 185 - k * 28;
    const tail = sampleBezier(
      [-52 - k * 14, 8 + oy],
      [-108 - k * 12, 24 + oy],
      [-148 - k * 10, -8 + oy * 0.7],
      [-52 - len, 6 + oy * 0.8],
      22
    );
    drawLanyeStroke(ctx, tail, {
      minW: 0.45,
      maxW: 2.3 - k * 0.4,
      color: k === 0 ? INK_SHADES.zhong : INK_SHADES.dan,
      alpha: alpha * (0.95 - k * 0.2),
      waves: 1.8,
      phase: seed + k,
      splitFilaments: 6,
      seed: seed + 11 + k,
    });
  }
  ctx.restore();
}

function drawGnarledTangWillow(ctx, baseX, baseY, height, leanDir, alpha, seed) {
  // Gnarled, knotty calligraphic willow trunk (`顿挫苍劲老柳主干`, replacing stick lines!)
  const topX = baseX + leanDir * height * 0.34;
  const topY = baseY - height;
  const leftBark = sampleBezier(
    [baseX - 9, baseY + 4],
    [baseX - 6 + leanDir * 8, baseY - height * 0.42],
    [baseX + leanDir * 18 - 4, baseY - height * 0.76],
    [topX - 2, topY],
    20
  );
  const rightBark = sampleBezier(
    [baseX + 9, baseY + 5],
    [baseX + 7 + leanDir * 12, baseY - height * 0.38],
    [baseX + leanDir * 22 + 3, baseY - height * 0.74],
    [topX + 3, topY + 2],
    20
  );
  drawLanyeStroke(ctx, leftBark, {
    minW: 1.1, maxW: 4.2, color: INK_SHADES.zhong, alpha, waves: 2.6, phase: seed, tremor: 0.9, splitFilaments: 6, seed,
  });
  drawLanyeStroke(ctx, rightBark, {
    minW: 0.9, maxW: 3.6, color: INK_SHADES.dan, alpha: alpha * 0.9, waves: 2.2, phase: seed + 2, tremor: 0.85, splitFilaments: 5, seed: seed + 4,
  });

  // Secondary forked boughs & 14 supple wind-swept weeping willow tendrils (`万缕垂丝迎风斜拂`)
  for (let b = 0; b < 3; b++) {
    const bt = 0.55 + b * 0.18;
    const bx = lerp(baseX, topX, bt);
    const by = lerp(baseY, topY, bt);
    const bEnd = [bx + (b - 0.8) * 32 + leanDir * 18, by - 26 - b * 8];
    const bough = sampleQuad([bx, by], [bx + (b - 1) * 14, by - 18], bEnd, 12);
    drawLanyeStroke(ctx, bough, {
      minW: 0.7, maxW: 2.4, color: INK_SHADES.dan, alpha: alpha * 0.88, waves: 1.4, seed: seed + 20 + b,
    });

    for (let w = 0; w < 5; w++) {
      const sx = lerp(bx, bEnd[0], (w + 0.5) / 5);
      const sy = lerp(by, bEnd[1], (w + 0.5) / 5);
      const drop = 48 + brushHash(seed * 17 + b * 7 + w) * 58;
      const sway = -22 - brushHash(seed * 29 + w) * 28; // Swept backward by headwind!
      const tendril = sampleBezier(
        [sx, sy],
        [sx + sway * 0.25, sy + drop * 0.35],
        [sx + sway * 0.75, sy + drop * 0.72],
        [sx + sway, sy + drop],
        16
      );
      drawLanyeStroke(ctx, tendril, {
        minW: 0.3,
        maxW: 1.25,
        color: w % 2 === 0 ? INK_SHADES.dan : INK_SHADES.qing,
        alpha: alpha * (0.58 + (w % 3) * 0.12),
        waves: 1.2,
        phase: w,
        splitFilaments: 4,
        halo: false,
        seed: seed + 40 + b * 5 + w,
      });
    }
  }
}

/**
 * Draws a wind-bent wild ink-orchid tuft (`迎风撇兰 / 幽篁丛草`) with classic `螳螂肚、鼠尾尖`
 * calligraphic Lanye blades and broken-eye crossing (`破凤眼`).
 */
function drawWildOrchidTuft(ctx, x, y, scale = 1, windSway = 0, inkTone = INK_SHADES.nong, alpha = 0.88, seed = 1) {
  const blades = [
    { dx: -44, dy: -34, cx1: -14, cy1: -28, cx2: -32, cy2: -38, w: 3.1 },
    { dx: -62, dy: -16, cx1: -18, cy1: -24, cx2: -44, cy2: -26, w: 2.7 },
    { dx: -24, dy: -46, cx1: -4, cy1: -28, cx2: -16, cy2: -44, w: 2.5 },
    { dx: 18, dy: -32, cx1: 12, cy1: -22, cx2: 20, cy2: -30, w: 2.2 }, // Counter-blade breaking the eye
    { dx: -52, dy: 4, cx1: -16, cy1: -10, cx2: -38, cy2: -6, w: 2.0 },
  ];
  for (let i = 0; i < blades.length; i++) {
    const b = blades[i];
    const bend = windSway * (0.7 + i * 0.16);
    const pts = sampleBezier(
      [x + (i - 2) * 1.8 * scale, y],
      [x + (b.cx1 - bend * 0.25) * scale, y + b.cy1 * scale],
      [x + (b.cx2 - bend * 0.7) * scale, y + (b.cy2 + Math.abs(bend) * 0.12) * scale],
      [x + (b.dx - bend) * scale, y + (b.dy + Math.abs(bend) * 0.22) * scale],
      18
    );
    drawLanyeStroke(ctx, pts, {
      minW: 0.35,
      maxW: b.w * scale,
      color: i < 2 ? inkTone : INK_SHADES.zhong,
      alpha: alpha * (1 - i * 0.08),
      waves: 1.0,
      phase: seed + i * 0.9,
      tremor: 0.45,
      splitFilaments: 6,
      seed: seed * 13 + i,
    });
  }
}

/**
 * Draws a three-faceted Tang Baimiao shore boulder (`石分三面兰叶劈皴岸石`) + hand-brushed焦墨苔点.
 */
function drawTangShoreBoulder(ctx, x, y, w, h, paperCanvas, seed = 1) {
  const silhouette = [
    [x - w * 0.52, y + h * 0.35],
    [x - w * 0.46, y - h * 0.18],
    [x - w * 0.16, y - h * 0.52],
    [x + w * 0.22, y - h * 0.44],
    [x + w * 0.50, y - h * 0.08],
    [x + w * 0.46, y + h * 0.38],
  ];
  fillPaperMaskPoly(ctx, silhouette, paperCanvas);

  // Bold angular-calligraphic rock contour (`刚健折铁兰叶勾石`)
  const topContour = sampleBezier(
    silhouette[0],
    [x - w * 0.50, y - h * 0.42],
    [x + w * 0.08, y - h * 0.62],
    silhouette[4],
    22
  );
  drawLanyeStroke(ctx, topContour, {
    minW: 1.1, maxW: 4.4, color: INK_SHADES.nong, alpha: 0.92, waves: 2.2, phase: seed, tremor: 0.85, splitFilaments: 7, seed,
  });

  // Three-facet internal `劈皴 / 兰叶皴` texture strokes (`石分三面`)
  for (let c = 0; c < 4; c++) {
    const cx0 = x - w * 0.28 + c * w * 0.16;
    const cun = sampleQuad(
      [cx0, y - h * 0.30 + (c % 2) * 5],
      [cx0 - w * 0.06, y - h * 0.02],
      [cx0 + w * 0.08, y + h * 0.26],
      14
    );
    drawLanyeStroke(ctx, cun, {
      minW: 0.6, maxW: 2.4, color: c < 2 ? INK_SHADES.zhong : INK_SHADES.dan, alpha: 0.72, waves: 1.4, splitFilaments: 6, seed: seed + 10 + c,
    });
  }

  // Hand-brushed irregular dark-ink moss dots (`焦墨攒点苔痕` — zero `ctx.arc`!)
  for (let m = 0; m < 6; m++) {
    const mx = x - w * 0.24 + brushHash(seed * 19 + m) * w * 0.52;
    const my = y - h * 0.46 + brushHash(seed * 37 + m) * h * 0.24;
    const dotPts = sampleHandRingPts(mx, my, 2.6 + (m % 2) * 1.1, 1.8, 8, 0.55, seed + m, 0.3, false);
    ctx.save();
    ctx.fillStyle = INK_SHADES.jiao;
    ctx.globalAlpha = 0.82;
    ctx.beginPath();
    ctx.moveTo(dotPts[0][0], dotPts[0][1]);
    for (let k = 1; k < dotPts.length; k++) ctx.lineTo(dotPts[k][0], dotPts[k][1]);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Replaces the banned `wx += 142` uniform fish-scale grid with authentic Tang/Song
 * asymmetric surging river eddies & curling foam wave-claws (`吴装奔流回澜惊涛水法`)!
 */
function drawSurgingTangRiver(ctx, paperCanvas) {
  // 1. Long intertwining S-curving river-current bundles (`长短交织琴弦描奔流水纹束`)
  const streamAnchors = [
    { y: 760, amp: 15, freq: 2.1, phase: 0.3, lines: 5, ink: INK_SHADES.zhong, alpha: 0.56 },
    { y: 798, amp: 22, freq: 1.6, phase: 1.7, lines: 6, ink: INK_SHADES.dan, alpha: 0.50 },
    { y: 842, amp: 26, freq: 2.4, phase: 2.9, lines: 5, ink: INK_SHADES.zhong, alpha: 0.52 },
    { y: 888, amp: 19, freq: 1.8, phase: 4.1, lines: 5, ink: INK_SHADES.dan, alpha: 0.46 },
    { y: 932, amp: 16, freq: 2.7, phase: 0.9, lines: 4, ink: INK_SHADES.qing, alpha: 0.42 },
  ];

  for (let b = 0; b < streamAnchors.length; b++) {
    const st = streamAnchors[b];
    for (let l = 0; l < st.lines; l++) {
      const segs = 3; // Asymmetric broken-and-rejoining stream ribbons across 0..1000
      for (let sg = 0; sg < segs; sg++) {
        const xStart = sg * 340 - 20 + brushHash(b * 31 + l * 7 + sg) * 55;
        const xEnd = xStart + 265 + brushHash(b * 17 + l * 13 + sg) * 115;
        const pts = [];
        const steps = 26;
        for (let i = 0; i <= steps; i++) {
          const u = i / steps;
          const px = lerp(xStart, xEnd, u);
          const wave =
            Math.sin((px / 1000) * Math.PI * 2 * st.freq + st.phase + l * 0.22) * st.amp +
            Math.sin((px / 1000) * Math.PI * 5.3 + b) * (st.amp * 0.34);
          const pinch = 3.2 + 2.4 * Math.sin(u * Math.PI * 2 + l); // Converging & diverging water veins!
          pts.push([px, st.y + wave + (l - (st.lines - 1) * 0.5) * pinch]);
        }
        drawLanyeStroke(ctx, pts, {
          minW: 0.45,
          maxW: l === 0 ? 1.95 : 1.35,
          color: l === 0 ? st.ink : INK_SHADES.dan,
          alpha: st.alpha * (1 - l * 0.11),
          waves: 1.8,
          phase: b + l,
          tremor: 0.42,
          splitFilaments: l === 0 ? 4 : 0,
          halo: l === 0,
          seed: 300 + b * 23 + l * 5 + sg,
        });
      }
    }
  }

  // 2. Asymmetric swirling whirlpool eddies (`回澜漩涡眼`) & curling cresting wave-claws (`卷雪浪爪`)
  const crestStations = [
    { x: 118, y: 782, s: 1.05, flip: false },
    { x: 296, y: 828, s: 1.28, flip: false },
    { x: 468, y: 774, s: 0.92, flip: true },
    { x: 642, y: 852, s: 1.35, flip: false },
    { x: 816, y: 794, s: 1.12, flip: false },
    { x: 928, y: 878, s: 0.96, flip: true },
  ];
  for (let i = 0; i < crestStations.length; i++) {
    const c = crestStations[i];
    const dir = c.flip ? -1 : 1;
    // Occlude wave crest foam head with hemp paper so wave claws overlap currents cleanly!
    const crestMask = [
      [c.x - 36 * c.s * dir, c.y + 12 * c.s],
      [c.x - 14 * c.s * dir, c.y - 16 * c.s],
      [c.x + 22 * c.s * dir, c.y - 18 * c.s],
      [c.x + 34 * c.s * dir, c.y + 8 * c.s],
    ];
    fillPaperMaskPoly(ctx, crestMask, paperCanvas);

    // 4 hooked foam wave-claws (`惊涛浪爪`)
    for (let k = 0; k < 4; k++) {
      const ox = (k - 1.5) * 12 * c.s * dir;
      const oy = Math.abs(k - 1.5) * 3.5 * c.s;
      const claw = sampleBezier(
        [c.x - 32 * c.s * dir + ox, c.y + 14 * c.s + oy],
        [c.x - 12 * c.s * dir + ox, c.y - 18 * c.s + oy],
        [c.x + 16 * c.s * dir + ox, c.y - 22 * c.s + oy],
        [c.x + 22 * c.s * dir + ox, c.y - 4 * c.s + oy],
        15
      );
      drawLanyeStroke(ctx, claw, {
        minW: 0.5,
        maxW: 2.3 * c.s,
        color: k < 2 ? INK_SHADES.nong : INK_SHADES.zhong,
        alpha: 0.68 - k * 0.08,
        waves: 1.2,
        splitFilaments: 4,
        seed: 420 + i * 11 + k,
      });
    }

    // Tight spiral eddy under the wave trough (`回澜涡心`)
    const eddy = [];
    for (let s = 0; s <= 24; s++) {
      const t = s / 24;
      const ang = t * Math.PI * 3.2;
      const r = (1 - t * 0.82) * 18 * c.s;
      eddy.push([c.x + 8 * dir + Math.cos(ang) * r * 1.35, c.y + 14 * c.s + Math.sin(ang) * r * 0.68]);
    }
    drawTiexianStroke(ctx, eddy, 1.15, INK_SHADES.dan, 0.55, 480 + i);
  }
}


// -----------------------------------------------------------------------------
// Pre-Baked High-Tang Handscroll Composition (`s04_tang_scroll_r3`)
// -----------------------------------------------------------------------------
function getBakedTangScroll(kit, paperCanvas) {
  return kit.bake2D('s04_tang_scroll_r3', (_g, ctx, _rng, w, h) => {
    // 1. Waxed High-Tang Yinghuang hemp paper substrate
    ctx.drawImage(paperCanvas, 0, 0);

    // 2. WebGL2 `kit.bakeBrush` misty pale-ink willow canopy haze & distant shoal ink wash (`淡墨柳烟汀渚`)
    if (kit && typeof kit.bakeBrush === 'function' && kit.brush) {
      const mistFb = kit.bakeBrush('s04_tang_mist_willow_r3', (p, brush, bRng) => {
        p.clear();
        brush.noStroke();
        brush.noHatch();

        // Misty pale-ink willow foliage clouds around left & right willow crowns
        const willowClouds = [
          { cx: 145, cy: 492, rx: 105, ry: 52, col: '#9e9788', a: 44 },
          { cx: 215, cy: 525, rx: 88, ry: 44, col: '#aba393', a: 36 },
          { cx: 832, cy: 486, rx: 112, ry: 54, col: '#9b9384', a: 42 },
          { cx: 760, cy: 520, rx: 82, ry: 42, col: '#ada596', a: 34 },
          // Distant river-mist band above shoal
          { cx: 480, cy: 548, rx: 280, ry: 34, col: '#b8b0a0', a: 28 },
        ];
        for (const wc of willowClouds) {
          const poly = [];
          for (let k = 0; k < 10; k++) {
            const ang = (k / 10) * Math.PI * 2;
            const radScale = 0.72 + bRng() * 0.48;
            poly.push([wc.cx + Math.cos(ang) * wc.rx * radScale, wc.cy + Math.sin(ang) * wc.ry * radScale]);
          }
          brush.fill(wc.col, wc.a);
          brush.fillBleed(0.42, 'out');
          brush.fillTexture(0.75, 0.4);
          brush.polygon(poly);
        }

        // Soft `charcoal` / `2B` feathery distant willow twigs inside the mist
        for (let t = 0; t < 55; t++) {
          const side = t < 28 ? 0 : 1;
          const bx = (side === 0 ? 95 : 755) + bRng() * 145;
          const by = 456 + bRng() * 88;
          brush.set('2B', '#6f685c', 0.45 + bRng() * 0.4);
          brush.line(bx, by, bx - 14 - bRng() * 22, by + 22 + bRng() * 34);
        }
      });
      const mistSnap = mistFb.get();
      if (mistSnap && mistSnap.canvas) {
        ctx.save();
        ctx.globalAlpha = 0.56;
        ctx.drawImage(mistSnap.canvas, 0, 0, w, h);
        ctx.restore();
      }
    }

    // 3. Multi-layered High-Tang Ruyi Cloud-Ribbon Scrolls across the FULL open sky (`x=45..895`)
    drawTangRuyiCloudBand(ctx, 255, 108, 1.04, false, 0.46, 11);
    drawTangRuyiCloudBand(ctx, 645, 92, 1.12, true, 0.50, 23);
    drawTangRuyiCloudBand(ctx, 435, 206, 0.86, false, 0.36, 37);
    drawTangRuyiCloudBand(ctx, 825, 224, 0.82, true, 0.38, 49);
    drawTangRuyiCloudBand(ctx, 168, 254, 0.76, false, 0.32, 61);

    // 4. Distant misty undulating shoals, waterside Tang pavilion roof & gnarled weeping willows
    const farShoalA = sampleBezier([-10, 566], [230, 526], [510, 580], [820, 548], 34);
    const farShoalB = sampleBezier([310, 588], [590, 546], [810, 578], [1010, 554], 30);
    drawLanyeStroke(ctx, farShoalA, { minW: 0.7, maxW: 2.5, color: INK_SHADES.qing, alpha: 0.45, waves: 2.0, splitFilaments: 5, seed: 71 });
    drawLanyeStroke(ctx, farShoalB, { minW: 0.8, maxW: 2.8, color: INK_SHADES.dan, alpha: 0.48, waves: 1.8, splitFilaments: 5, seed: 79 });

    // Subtle distant High-Tang flying-eave waterside kiosk (`远浦唐风飞檐水榭`, pure pale-ink Tiexian)
    const eaveLeft = sampleQuad([438, 524], [408, 528], [386, 518], 12);
    const eaveRight = sampleQuad([438, 524], [468, 528], [490, 518], 12);
    drawLanyeStroke(ctx, eaveLeft, { minW: 0.6, maxW: 2.1, color: INK_SHADES.dan, alpha: 0.44, waves: 1.0, seed: 83 });
    drawLanyeStroke(ctx, eaveRight, { minW: 0.6, maxW: 2.1, color: INK_SHADES.dan, alpha: 0.44, waves: 1.0, seed: 87 });
    drawTiexianStroke(ctx, [[410, 527], [410, 554]], 1.1, INK_SHADES.qing, 0.40, 89);
    drawTiexianStroke(ctx, [[466, 527], [466, 554]], 1.1, INK_SHADES.qing, 0.40, 91);

    // Gnarled calligraphic weeping willows on left & right shoals (`苍劲老柳 + 万缕垂丝`)
    drawGnarledTangWillow(ctx, 156, 572, 108, 0.35, 0.56, 101);
    drawGnarledTangWillow(ctx, 842, 566, 114, -0.32, 0.54, 131);

    // 5. ABOLISH RULER-STRAIGHT `y = 680` LINE!
    // Overlapping, undulating center-tip `兰叶描/琴弦描` cloud-head stone embankment strokes
    // strictly locked to `(0, 680)` and `(1000, 680)` at both panel boundaries!
    const embankmentSegments = [
      // Left boundary lock: exact (0, 680) horizontal entry tangent -> gently undulating stone slab
      { p0: [0, ROAD_EDGE_Y], p1: [42, ROAD_EDGE_Y], p2: [96, ROAD_EDGE_Y - 5.5], p3: [158, ROAD_EDGE_Y + 2.2], w: 3.8, ink: INK_SHADES.nong },
      { p0: [134, ROAD_EDGE_Y + 4.0], p1: [196, ROAD_EDGE_Y - 6.8], p2: [262, ROAD_EDGE_Y + 3.5], p3: [326, ROAD_EDGE_Y - 1.8], w: 3.6, ink: INK_SHADES.zhong },
      { p0: [298, ROAD_EDGE_Y + 2.5], p1: [368, ROAD_EDGE_Y - 7.2], p2: [436, ROAD_EDGE_Y + 4.8], p3: [508, ROAD_EDGE_Y - 2.4], w: 4.0, ink: INK_SHADES.nong },
      { p0: [482, ROAD_EDGE_Y + 3.2], p1: [556, ROAD_EDGE_Y - 6.4], p2: [628, ROAD_EDGE_Y + 4.2], p3: [702, ROAD_EDGE_Y - 2.0], w: 3.7, ink: INK_SHADES.zhong },
      { p0: [676, ROAD_EDGE_Y + 2.8], p1: [748, ROAD_EDGE_Y - 7.0], p2: [814, ROAD_EDGE_Y + 3.8], p3: [876, ROAD_EDGE_Y - 2.6], w: 3.9, ink: INK_SHADES.nong },
      // Right boundary lock: gently rises back to exact (1000, 680) with horizontal C1 exit tangent!
      { p0: [852, ROAD_EDGE_Y + 2.4], p1: [906, ROAD_EDGE_Y - 5.2], p2: [958, ROAD_EDGE_Y], p3: [PANEL_SIZE, ROAD_EDGE_Y], w: 3.8, ink: INK_SHADES.nong },
    ];

    // Background wild ink-orchid tufts rising FROM BEHIND the stone embankment (`堤后迎风幽兰`)
    drawWildOrchidTuft(ctx, 94, ROAD_EDGE_Y + 2, 0.88, 6, INK_SHADES.zhong, 0.72, 151);
    drawWildOrchidTuft(ctx, 386, ROAD_EDGE_Y + 3, 0.82, 8, INK_SHADES.dan, 0.66, 163);
    drawWildOrchidTuft(ctx, 692, ROAD_EDGE_Y + 2, 0.90, 7, INK_SHADES.zhong, 0.70, 177);
    drawWildOrchidTuft(ctx, 912, ROAD_EDGE_Y + 3, 0.80, 6, INK_SHADES.dan, 0.65, 189);

    for (let i = 0; i < embankmentSegments.length; i++) {
      const seg = embankmentSegments[i];
      const pts = sampleBezier(seg.p0, seg.p1, seg.p2, seg.p3, 24);
      drawLanyeStroke(ctx, pts, {
        minW: 1.25,
        maxW: seg.w,
        color: seg.ink,
        alpha: 0.90,
        waves: 2.0,
        phase: i * 1.1,
        tremor: 0.62,
        splitFilaments: (i === 0 || i === embankmentSegments.length - 1) ? 0 : 6,
        seed: 200 + i * 13,
      });

      // Secondary lower stone-lip `兰叶皴` crease (`堤石叠唇皴线`) creating rich 3D stone thickness
      const lowerPts = pts.map(([px, py], idx) => [
        px,
        py + 9 + Math.sin(idx * 0.35 + i) * 4.5,
      ]);
      drawLanyeStroke(ctx, lowerPts, {
        minW: 0.6,
        maxW: 2.1,
        color: INK_SHADES.dan,
        alpha: 0.62,
        waves: 1.5,
        phase: i + 0.5,
        splitFilaments: 5,
        seed: 240 + i * 7,
      });
    }

    // Craggy three-faceted Baimiao shore boulders anchoring the causeway (`石分三面坡陀岸石`)
    drawTangShoreBoulder(ctx, 132, 720, 108, 42, paperCanvas, 261);
    drawTangShoreBoulder(ctx, 438, 728, 126, 46, paperCanvas, 271);
    drawTangShoreBoulder(ctx, 764, 722, 118, 44, paperCanvas, 281);

    // Hand-brushed irregular dark-ink moss dots along embankment crevices (`攒三聚五焦墨苔点`)
    const mossXs = [58, 184, 246, 352, 528, 618, 722, 836, 944];
    for (let m = 0; m < mossXs.length; m++) {
      for (let d = 0; d < 3; d++) {
        const mx = mossXs[m] + (d - 1) * 6.5 + (brushHash(m * 11 + d) - 0.5) * 4;
        const my = ROAD_EDGE_Y - 1.5 + brushHash(m * 23 + d) * 6.5;
        const ring = sampleHandRingPts(mx, my, 2.2, 1.5, 7, 0.5, 290 + m * 3 + d, 0.2, false);
        ctx.fillStyle = d === 0 ? INK_SHADES.jiao : INK_SHADES.nong;
        ctx.globalAlpha = 0.76;
        ctx.beginPath();
        ctx.moveTo(ring[0][0], ring[0][1]);
        for (let k = 1; k < ring.length; k++) ctx.lineTo(ring[k][0], ring[k][1]);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // 6. Asymmetric Wu-style surging river eddies & curling wave-claws below embankment (`y=748..975`)
    drawSurgingTangRiver(ctx, paperCanvas);

    // 7. Native Tang-Song Handscroll Mounting:
    // Upper/lower hand-brushed `乌丝栏` scroll rule lines + right-hand vertical Xuan-paper `乌丝双栏` Title Slip!
    drawTiexianStroke(ctx, [[16, 18], [w - 16, 18]], 1.25, INK_SHADES.zhong, 0.42, 501);
    drawTiexianStroke(ctx, [[16, h - 18], [w - 16, h - 18]], 1.25, INK_SHADES.zhong, 0.42, 503);

    // Vertical Aged-Xuan `乌丝双栏` Handscroll Title Slip (`题签`, x=934..978, y=38..346)
    const sx = 934;
    const sy = 38;
    const sw = 44;
    const sh = 308;
    const slipPoly = [
      [sx + 0.6, sy], [sx + sw, sy + 0.8], [sx + sw - 0.5, sy + sh], [sx, sy + sh - 0.6],
    ];
    ctx.save();
    ctx.fillStyle = '#f3ebd8';
    ctx.globalAlpha = 0.90;
    ctx.beginPath();
    ctx.moveTo(slipPoly[0][0], slipPoly[0][1]);
    for (let k = 1; k < slipPoly.length; k++) ctx.lineTo(slipPoly[k][0], slipPoly[k][1]);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Outer & inner hand-brushed `乌丝栏` borders of the title slip (ZERO `strokeRect`!)
    drawTiexianStroke(ctx, [[sx, sy], [sx + sw, sy], [sx + sw, sy + sh], [sx, sy + sh], [sx, sy]], 1.35, INK_SHADES.nong, 0.72, 511);
    drawTiexianStroke(ctx, [[sx + 4, sy + 4], [sx + sw - 4, sy + 4], [sx + sw - 4, sy + sh - 4], [sx + 4, sy + sh - 4], [sx + 4, sy + 4]], 0.75, INK_SHADES.dan, 0.55, 513);

    // Pure classical Chinese handscroll title inscription (`唐吳道玄白描奇禽乘輿圖卷` — ZERO Arabic digits or English!)
    const slipTitle = '唐吳道玄白描奇禽乘輿圖卷';
    ctx.save();
    ctx.fillStyle = INK_SHADES.jiao;
    ctx.globalAlpha = 0.88;
    ctx.font = '600 18px "Noto Serif CJK SC", "Songti SC", "STKaiti", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < slipTitle.length; i++) {
      ctx.fillText(slipTitle[i], sx + sw * 0.5, sy + 22 + i * 22.8);
    }
    ctx.restore();

    // Three authentic antique cinnabar collector &imperial appreciation seals (`朱砂鉴藏钤印`)
    drawHandCinnabarSeal(ctx, sx + 6, sy + sh + 10, 32, 32, '開元御覽', false, 521);
    drawHandCinnabarSeal(ctx, sx + 8, sy + sh + 50, 28, 42, '神品', true, 529);
    drawHandCinnabarSeal(ctx, 28, 898, 34, 34, '吳帶當風', true, 537);
  });
}

// -----------------------------------------------------------------------------
// Dynamic Bar-2 "吴带当风" Wind-Vortex Calligraphic Streams & Double-Hooked Petals
// -----------------------------------------------------------------------------
function drawDynamicWindAndPetals(ctx, localT, windPower, paperCanvas) {
  const scrollX = localT * (145 + windPower * 320);

  // 1. Long sweeping `兰叶/游丝` wind-ribbons with sinusoidal vortex curls
  const streamCount = 6;
  for (let i = 0; i < streamCount; i++) {
    const baseY = 128 + i * 86;
    const xOffset = ((i * 257 - scrollX * (0.72 + (i % 3) * 0.16)) % 1360 + 1360) % 1360 - 180;
    const amp = (11 + (i % 3) * 6) * (0.52 + windPower * 1.15);
    const len = 250 + windPower * 195;

    const pts = [];
    const steps = 26;
    for (let s = 0; s <= steps; s++) {
      const u = s / steps;
      const px = xOffset + u * len;
      const py =
        baseY +
        Math.sin(u * Math.PI * 2.5 + localT * 5.2 + i) * amp +
        Math.cos(u * Math.PI * 4.0 - localT * 3.6) * (amp * 0.28 * windPower);
      pts.push([px, py]);
    }

    drawLanyeStroke(ctx, pts, {
      minW: 0.35,
      maxW: 1.25 + windPower * 1.45,
      color: i % 2 === 0 ? INK_SHADES.dan : INK_SHADES.qing,
      alpha: 0.22 + windPower * 0.38,
      waves: 2.0,
      phase: localT * 3 + i,
      splitFilaments: windPower > 0.35 ? 5 : 0,
      halo: false,
      seed: 600 + i,
    });

    if (windPower > 0.22 && i % 2 === 1) {
      const tail = pts[0];
      const spiral = [];
      for (let k = 0; k <= 18; k++) {
        const t = k / 18;
        const ang = t * Math.PI * 2.8 + localT * 4;
        const r = (1 - t * 0.76) * (15 + windPower * 16);
        spiral.push([tail[0] - 16 + Math.cos(ang) * r, tail[1] + Math.sin(ang) * r * 0.72]);
      }
      drawTiexianStroke(ctx, spiral, 0.95 + windPower * 0.45, INK_SHADES.dan, windPower * 0.42, 620 + i);
    }
  }

  // 2. Pure-ink double-outlined (`双勾白描`) Tang Bao-Xiang peony/plum petals occluded with hemp paper!
  const petalCount = 22;
  for (let i = 0; i < petalCount; i++) {
    const seed = i * 73.17 + 11.3;
    const speed = 155 + (i % 5) * 44 + windPower * 275;
    const px = ((980 - ((localT * speed + seed * 37) % 1160)) + 1160) % 1160 - 80;
    const py =
      86 +
      ((seed * 29.7) % 535) +
      Math.sin(localT * 3.8 + seed) * (14 + windPower * 28);
    const rot = localT * (2.2 + (i % 4) * 0.9) + seed;
    const sz = 6.8 + (i % 3) * 2.5;
    const alpha = (i < 10 ? 0.68 : 0.20 + windPower * 0.65);
    if (alpha < 0.08) continue;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rot);

    const upper = sampleBezier([-sz, 0], [-sz * 0.3, -sz * 0.74], [sz * 0.55, -sz * 0.66], [sz, 0], 10);
    const lower = sampleBezier([sz, 0], [sz * 0.5, sz * 0.66], [-sz * 0.35, sz * 0.70], [-sz, 0], 10);
    fillPaperMaskPoly(ctx, [...upper, ...lower], paperCanvas);

    drawLanyeStroke(ctx, upper, { minW: 0.4, maxW: 1.5, color: INK_SHADES.zhong, alpha, waves: 1, halo: false, seed: 640 + i });
    drawLanyeStroke(ctx, lower, { minW: 0.4, maxW: 1.35, color: INK_SHADES.dan, alpha, waves: 1, halo: false, seed: 670 + i });
    drawTiexianStroke(ctx, [[-sz * 0.72, 0], [sz * 0.52, 0]], 0.65, INK_SHADES.qing, alpha * 0.75, 690 + i);
    ctx.restore();
  }
}


// -----------------------------------------------------------------------------
// High-Tang Carved Bentwood Chariot-Cycle (`盛唐曲木榫卯宝相团窠雕花轮舆`, ZERO `ctx.arc`!)
// -----------------------------------------------------------------------------
function drawBaoXiangSleeve(ctx, x, y, r, angle, paperCanvas, seed) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const sleeveRing = sampleHandRingPts(0, 0, r, r * 0.88, 18, 0.45, seed, 0, true);
  fillPaperMaskPoly(ctx, sleeveRing, paperCanvas);
  drawTiexianStroke(ctx, sleeveRing, 1.5, INK_SHADES.nong, 0.92, seed);

  // 6-petal High-Tang Bao-Xiang lotus rosette (`宝相团花铜箍纹`)
  for (let p = 0; p < 6; p++) {
    const a = (p / 6) * Math.PI * 2;
    const petal = sampleQuad(
      [Math.cos(a - 0.35) * r * 0.28, Math.sin(a - 0.35) * r * 0.28],
      [Math.cos(a) * r * 1.05, Math.sin(a) * r * 1.05],
      [Math.cos(a + 0.35) * r * 0.28, Math.sin(a + 0.35) * r * 0.28],
      8
    );
    drawTiexianStroke(ctx, petal, 0.95, INK_SHADES.zhong, 0.85, seed + p);
  }
  const core = sampleHandRingPts(0, 0, r * 0.28, r * 0.28, 10, 0.25, seed + 9, 0, true);
  drawTiexianStroke(ctx, core, 1.1, INK_SHADES.jiao, 0.9, seed + 11);
  ctx.restore();
}

function drawCarvedTangWoodenWheel(ctx, cx, cy, r, rot, paperCanvas, seedBase) {
  ctx.save();
  ctx.translate(cx, cy);

  // Occlude wooden felloe rim band with hemp paper so dual-ring timber reads crisply!
  const outerPts = sampleHandRingPts(0, 0, r, r, 36, 0.65, seedBase, rot * 0.15, true);
  const innerRimPts = sampleHandRingPts(0, 0, r - 8.5, r - 8.5, 34, 0.55, seedBase + 3, rot * 0.15, true);
  const midGroovePts = sampleHandRingPts(0, 0, r - 4.2, r - 4.2, 34, 0.45, seedBase + 5, rot * 0.15, true);

  drawLanyeStroke(ctx, outerPts, {
    minW: 2.1, maxW: 3.4, color: INK_SHADES.jiao, alpha: 0.96, waves: 3.0, phase: rot, tremor: 0.45, seed: seedBase,
  });
  drawTiexianStroke(ctx, innerRimPts, 1.85, INK_SHADES.nong, 0.90, seedBase + 7);
  drawTiexianStroke(ctx, midGroovePts, 0.85, INK_SHADES.dan, 0.68, seedBase + 9);

  // 6 bentwood felloe mortise join wedges & Tang trefoil cloud brackets (`辋木榫卯云牙`)
  for (let j = 0; j < 6; j++) {
    const ja = rot + (j / 6) * Math.PI * 2;
    const ca = Math.cos(ja);
    const sa = Math.sin(ja);
    drawTiexianStroke(ctx, [[ca * (r - 8.5), sa * (r - 8.5)], [ca * r, sa * r]], 1.4, INK_SHADES.nong, 0.88, seedBase + 20 + j);
    // Delicate inward cloud-scroll cusp inside felloe
    const cusp = sampleQuad(
      [Math.cos(ja - 0.15) * (r - 8.5), Math.sin(ja - 0.15) * (r - 8.5)],
      [ca * (r - 15.5), sa * (r - 15.5)],
      [Math.cos(ja + 0.15) * (r - 8.5), Math.sin(ja + 0.15) * (r - 8.5)],
      10
    );
    drawTiexianStroke(ctx, cusp, 0.95, INK_SHADES.zhong, 0.78, seedBase + 30 + j);
  }

  // 12 turned-wood lotus-spindle spokes (`十二辐莲瓣壶门木辐`)
  const spokeCount = 12;
  for (let i = 0; i < spokeCount; i++) {
    const a = rot + (i / spokeCount) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const nx = -sa;
    const ny = ca;
    const r0 = 15;
    const r1 = r - 9;
    const rMid = lerp(r0, r1, 0.44);

    drawTiexianStroke(ctx, [[ca * r0, sa * r0], [ca * r1, sa * r1]], 1.15, INK_SHADES.zhong, 0.84, seedBase + 50 + i);
    // Carved lotus-bud swell at mid-spoke
    const budL = sampleQuad(
      [ca * (rMid - 11), sa * (rMid - 11)],
      [ca * rMid + nx * 3.4, sa * rMid + ny * 3.4],
      [ca * (rMid + 11), sa * (rMid + 11)],
      8
    );
    const budR = sampleQuad(
      [ca * (rMid - 11), sa * (rMid - 11)],
      [ca * rMid - nx * 3.4, sa * rMid - ny * 3.4],
      [ca * (rMid + 11), sa * (rMid + 11)],
      8
    );
    fillPaperMaskPoly(ctx, [...budL, ...budR.slice().reverse()], paperCanvas);
    drawTiexianStroke(ctx, budL, 0.9, INK_SHADES.nong, 0.82, seedBase + 70 + i);
    drawTiexianStroke(ctx, budR, 0.9, INK_SHADES.nong, 0.82, seedBase + 90 + i);
  }

  // Carved 8-petal lotus wooden hub (`八瓣宝莲车毂`)
  drawBaoXiangSleeve(ctx, 0, 0, 15.5, rot, paperCanvas, seedBase + 120);
  ctx.restore();
}

function drawCarvedScrollBeam(ctx, p0, p1, ctrlOffset, width, paperCanvas, seed) {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const mx = (p0[0] + p1[0]) * 0.5 + nx * ctrlOffset;
  const my = (p0[1] + p1[1]) * 0.5 + ny * ctrlOffset;

  const spine = sampleQuad(p0, [mx, my], p1, 20);
  const upper = [];
  const lower = [];
  for (let i = 0; i < spine.length; i++) {
    const t = i / (spine.length - 1);
    const taper = 0.72 + 0.38 * Math.sin(t * Math.PI);
    const hw = width * 0.5 * taper;
    const pPrev = spine[Math.max(0, i - 1)];
    const pNext = spine[Math.min(spine.length - 1, i + 1)];
    const tx = pNext[0] - pPrev[0];
    const ty = pNext[1] - pPrev[1];
    const tl = Math.hypot(tx, ty) || 1;
    const pnx = -ty / tl;
    const pny = tx / tl;
    upper.push([spine[i][0] + pnx * hw, spine[i][1] + pny * hw]);
    lower.push([spine[i][0] - pnx * hw, spine[i][1] - pny * hw]);
  }

  fillPaperMaskPoly(ctx, [...upper, ...lower.slice().reverse()], paperCanvas);
  drawLanyeStroke(ctx, upper, { minW: 1.2, maxW: 2.5, color: INK_SHADES.jiao, alpha: 0.95, waves: 1.5, seed });
  drawLanyeStroke(ctx, lower, { minW: 1.0, maxW: 2.1, color: INK_SHADES.nong, alpha: 0.90, waves: 1.5, seed: seed + 3 });
  // Internal carved Tang-grass vine groove (`卷草阳刻中脊线`)
  drawTiexianStroke(ctx, spine, 0.85, INK_SHADES.dan, 0.72, seed + 5);
}

/**
 * Pierced High-Tang spherical silver censer (`盛唐鎏金银制镂空葡萄花鸟纹香囊`, Hejia Village hoard archetype)
 * rendered in pure iron-wire Baimiao with internal gimbal ring & wind-streaming silk tassels!
 */
function drawSilverSachetCenser(ctx, anchorX, anchorY, localT, windPower, paperCanvas) {
  const swing = -0.22 - windPower * 0.52 + Math.sin(localT * 6.8) * (0.09 + windPower * 0.18);
  const cordLen = 24;
  const cx = anchorX + Math.sin(swing) * cordLen;
  const cy = anchorY + Math.cos(swing) * cordLen;

  // Silk suspension cord
  drawTiexianStroke(ctx, [[anchorX, anchorY], [cx, cy - 12]], 1.25, INK_SHADES.nong, 0.92, 701);

  // Pierced spherical censer body (`镂空球形银香囊`, r = 12.5, hand-brushed ring!)
  const r = 12.5;
  const outerSphere = sampleHandRingPts(cx, cy, r, r, 24, 0.4, 705, 0, true);
  fillPaperMaskPoly(ctx, outerSphere, paperCanvas);
  drawTiexianStroke(ctx, outerSphere, 1.65, INK_SHADES.jiao, 0.95, 707);

  // Equatorial hinge flange & internal cardan gimbal rings (`双轴同心持平机环`)
  const flange = sampleBezier([cx - r - 2, cy], [cx - 4, cy + 3.5], [cx + 4, cy + 3.5], [cx + r + 2, cy], 12);
  drawTiexianStroke(ctx, flange, 1.3, INK_SHADES.nong, 0.9, 709);
  const innerGimbal = sampleHandRingPts(cx, cy, r * 0.62, r * 0.36, 16, 0.3, 711, 0.25, true);
  drawTiexianStroke(ctx, innerGimbal, 0.85, INK_SHADES.zhong, 0.78, 713);

  // Openwork grape-vine & floral scroll (`镂空葡萄忍冬纹`)
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.4;
    const vine = sampleQuad([cx, cy], [cx + Math.cos(a) * 8, cy + Math.sin(a) * 8], [cx + Math.cos(a + 0.6) * 9.5, cy + Math.sin(a + 0.6) * 9.5], 8);
    drawTiexianStroke(ctx, vine, 0.75, INK_SHADES.dan, 0.75, 720 + k);
  }

  // Faint trailing incense wisp (`袅袅瑞脑香烟`, pure pale ink!) + 3 streaming silk tassels
  // Smoothly taper offscreen trails right as the censer crosses `x = 1000` into `#05 宋代山水`
  const censerSeamFade = 1 - smoothstep(956, 1002, anchorX);
  if (censerSeamFade > 0.02) {
    const reachScale = 0.35 + 0.65 * censerSeamFade;
    const smoke = sampleBezier(
      [cx - 4, cy - 8],
      [cx - (32 + windPower * 36) * reachScale, cy - 18 + Math.sin(localT * 5) * 8],
      [cx - (68 + windPower * 58) * reachScale, cy - 6 - Math.cos(localT * 4) * 10],
      [cx - (105 + windPower * 85) * reachScale, cy - 16],
      18
    );
    drawLanyeStroke(ctx, smoke, {
      minW: 0.3, maxW: 1.5, color: INK_SHADES.qing, alpha: (0.36 + windPower * 0.22) * censerSeamFade, waves: 2.0, splitFilaments: 4, halo: false, seed: 731,
    });

    for (let t = -1; t <= 1; t++) {
      const tassel = sampleBezier(
        [cx + t * 2.5, cy + r],
        [cx - (14 + windPower * 28) * reachScale, cy + r + 14 + t * 3],
        [cx - (34 + windPower * 52) * reachScale, cy + r + 24 + Math.sin(localT * 9 + t) * 7],
        [cx - (54 + windPower * 76) * reachScale, cy + r + 20 + t * 6],
        14
      );
      drawLanyeStroke(ctx, tassel, {
        minW: 0.35, maxW: 1.55, color: INK_SHADES.nong, alpha: 0.88 * censerSeamFade, waves: 1.4, splitFilaments: 5, seed: 740 + t,
      });
    }
  }
}

function drawTangWoodenCycle(ctx, rig, localT, windPower, paperCanvas) {
  const rw = rig.rearWheel;
  const fw = rig.frontWheel;
  const crank = rig.crank;
  const seat = rig.seat;
  const hb = rig.handlebar;

  // Ground contact subtle dry-brush ink shadows under wooden wheels
  for (const w of [rw, fw]) {
    const shPts = sampleBezier([w.x - w.r * 0.82, ROAD_EDGE_Y + 3], [w.x - w.r * 0.2, ROAD_EDGE_Y + 6], [w.x + w.r * 0.3, ROAD_EDGE_Y + 5], [w.x + w.r * 0.82, ROAD_EDGE_Y + 2], 14);
    drawLanyeStroke(ctx, shPts, { minW: 0.8, maxW: 3.4, color: INK_SHADES.dan, alpha: 0.48, waves: 1.2, splitFilaments: 5, seed: Math.round(w.x) });
  }

  // 1. Rear & Front Carved Bentwood Lotus Wheels
  drawCarvedTangWoodenWheel(ctx, rw.x, rw.y, rw.r, rw.rot, paperCanvas, 751);
  drawCarvedTangWoodenWheel(ctx, fw.x, fw.y, fw.r, fw.rot, paperCanvas, 781);

  // 2. Steamed-Bentwood Ruyi & Phoenix Scrollwork Chariot Frame (`盛唐曲木如意云梁车架`)
  const headTubeTop = [lerp(fw.x, hb.x, 0.72), lerp(fw.y, hb.y, 0.60)];
  const headTubeBot = [lerp(fw.x, hb.x, 0.46), lerp(fw.y, hb.y, 0.34)];

  drawCarvedScrollBeam(ctx, [rw.x, rw.y], [crank.x, crank.y], 12, 7.0, paperCanvas, 801);
  drawCarvedScrollBeam(ctx, [rw.x, rw.y], [seat.x, seat.y + 8], -18, 6.8, paperCanvas, 807);
  drawCarvedScrollBeam(ctx, [crank.x, crank.y], [seat.x, seat.y + 6], 11, 8.2, paperCanvas, 813);
  // Sweeping S-curved Ruyi cloud main beam (`如意云梁下管`)
  drawCarvedScrollBeam(ctx, [crank.x, crank.y], headTubeBot, -24, 9.0, paperCanvas, 819);
  // Arched Phoenix-back upper beam (`凤脊曲木上梁`)
  drawCarvedScrollBeam(ctx, [seat.x + 2, seat.y + 12], headTubeTop, 20, 8.0, paperCanvas, 825);
  // Curved front fork & rising Phoenix-neck stem (`凤首曲辕前叉`)
  drawCarvedScrollBeam(ctx, [fw.x, fw.y], headTubeBot, 14, 7.6, paperCanvas, 831);
  drawCarvedScrollBeam(ctx, headTubeBot, [hb.x + 8, hb.y - 6], -10, 7.8, paperCanvas, 837);

  // Bao-Xiang floral bronze/wood joinery sleeves (`宝相团窠束腰铜箍`) at structural mortises
  drawBaoXiangSleeve(ctx, headTubeBot[0], headTubeBot[1], 8.2, 0.2, paperCanvas, 843);
  drawBaoXiangSleeve(ctx, headTubeTop[0], headTubeTop[1], 7.8, -0.3, paperCanvas, 849);

  // 3. Carved Phoenix-Head Prow (`朱雀昂首雕木车首`) + Swinging Silver Sachet Censer (`葡萄花鸟纹银香囊`)!
  const prowX = hb.x + 24;
  const prowY = hb.y - 14;
  const phoenixCrest = sampleBezier([hb.x - 14, hb.y + 2], [hb.x + 4, hb.y - 22], [prowX + 10, prowY - 12], [prowX + 18, prowY + 2], 16);
  const phoenixJaw = sampleBezier([prowX + 18, prowY + 2], [prowX + 4, prowY + 12], [hb.x + 4, hb.y + 8], [hb.x - 8, hb.y + 6], 14);
  fillPaperMaskPoly(ctx, [...phoenixCrest, ...phoenixJaw], paperCanvas);
  drawLanyeStroke(ctx, phoenixCrest, { minW: 1.1, maxW: 3.2, color: INK_SHADES.jiao, alpha: 0.96, waves: 1.5, splitFilaments: 4, seed: 855 });
  drawLanyeStroke(ctx, phoenixJaw, { minW: 0.9, maxW: 2.5, color: INK_SHADES.nong, alpha: 0.92, waves: 1.2, seed: 859 });
  // Phoenix eye & flowing crest plume
  drawTiexianStroke(ctx, sampleHandRingPts(prowX + 3, prowY - 2, 2.2, 1.6, 8, 0.2, 861, 0, true), 1.0, INK_SHADES.jiao, 0.95, 863);
  drawSilverSachetCenser(ctx, prowX + 14, prowY + 4, localT, windPower, paperCanvas);

  // 4. Draped High-Tang Double-Outlined Brocade Saddle Valance (`垂帷双勾唐草团花绣茵鞍袱`)!
  const sx = seat.x;
  const sy = seat.y;
  const flutter = Math.sin(localT * 8.4) * (3 + windPower * 7);
  const saddleCloth = [
    ...sampleBezier([sx - 34, sy + 2], [sx - 12, sy - 10], [sx + 18, sy - 9], [sx + 34, sy + 1], 12),
    ...sampleBezier([sx + 34, sy + 1], [sx + 32, sy + 20], [sx + 22 - windPower * 10, sy + 38 + flutter * 0.4], [sx + 10 - windPower * 14, sy + 44 + flutter], 12),
    ...sampleBezier([sx + 10 - windPower * 14, sy + 44 + flutter], [sx - 6 - windPower * 16, sy + 36 - flutter * 0.5], [sx - 24 - windPower * 18, sy + 46 + flutter], [sx - 40 - windPower * 22, sy + 32 + flutter * 0.8], 14),
    ...sampleBezier([sx - 40 - windPower * 22, sy + 32 + flutter * 0.8], [sx - 38 - windPower * 10, sy + 16], [sx - 36, sy + 8], [sx - 34, sy + 2], 10),
  ];
  fillPaperMaskPoly(ctx, saddleCloth, paperCanvas);
  drawLanyeStroke(ctx, saddleCloth, { minW: 1.0, maxW: 2.8, color: INK_SHADES.jiao, alpha: 0.95, waves: 2.2, splitFilaments: 4, seed: 871 });
  // Double-outlined brocade border & central Tang-grass medallion (`双勾团窠唐草绣纹`)
  const innerHem = sampleBezier([sx - 34 - windPower * 18, sy + 27 + flutter * 0.6], [sx - 14 - windPower * 14, sy + 38], [sx + 6 - windPower * 12, sy + 36 + flutter * 0.7], [sx + 26 - windPower * 6, sy + 22], 14);
  drawTiexianStroke(ctx, innerHem, 0.95, INK_SHADES.zhong, 0.82, 875);
  drawBaoXiangSleeve(ctx, sx - 6 - windPower * 6, sy + 20, 8.5, flutter * 0.03, paperCanvas, 879);
  // Corner silk tassels streaming from brocade valance
  for (const [tx, ty, ts] of [[sx - 38 - windPower * 20, sy + 32 + flutter * 0.8, 1], [sx + 10 - windPower * 14, sy + 44 + flutter, 2]]) {
    const tsPts = sampleQuad([tx, ty], [tx - 16 - windPower * 26, ty + 10], [tx - 32 - windPower * 44, ty + 8 + Math.sin(localT * 10 + ts) * 5], 10);
    drawLanyeStroke(ctx, tsPts, { minW: 0.35, maxW: 1.6, color: INK_SHADES.nong, alpha: 0.86, waves: 1.2, splitFilaments: 5, seed: 883 + ts });
  }

  // 5. Braided Hemp Drive Cord & 8-Petal Bao-Xiang Chainring (`八瓣宝相团花牙盘`)
  drawTiexianStroke(ctx, [[rw.x, rw.y - 10], [crank.x, crank.y - 21]], 1.35, INK_SHADES.zhong, 0.82, 891);
  drawTiexianStroke(ctx, [[rw.x, rw.y + 10], [crank.x, crank.y + 21]], 1.25, INK_SHADES.dan, 0.76, 893);
  drawBaoXiangSleeve(ctx, crank.x, crank.y, 21.5, rw.rot * 0.6, paperCanvas, 897);

  for (const foot of [rig.leftFoot, rig.rightFoot]) {
    drawTiexianStroke(ctx, [[crank.x, crank.y], [foot.x, foot.y]], 2.2, INK_SHADES.jiao, 0.92, 901);
    drawLanyeStroke(ctx, [[foot.x - 13, foot.y + 1], [foot.x + 13, foot.y - 1]], {
      minW: 1.6, maxW: 3.2, color: INK_SHADES.jiao, alpha: 0.95, waves: 1.0, seed: 905,
    });
  }
}

// -----------------------------------------------------------------------------
// Advected Traveling-Wave Flipping Apsaras Ribbons (`真·行波传导立体翻转飞天披帛`)
// + Bar-3 Celestial Silk Release (`解带乘风归云霭`, localT ∈ [4.10s, 5.88s])
// -----------------------------------------------------------------------------
function drawAdvectedFlippingRibbon(ctx, anchor, opts, localT, windPower, paperCanvas, releaseState = null) {
  const { len, baseYOff, amp, freq, omega, phaseOff, width, alpha = 0.95, seed = 910 } = opts;
  const relS = releaseState ? releaseState.s : 0;
  const mistFade = releaseState ? (1 - smoothstep(0.48, 1.0, relS)) : 1.0;
  const effAlpha = alpha * mistFade;
  if (effAlpha < 0.015) return;

  const relLift = smoothstep(0.0, 0.72, relS);
  const relFree = smoothstep(0.02, 0.34, relS);
  // Keep generous horizontal span & relax wave frequency so freed sashes form long, cusp-free Wu Daozi S-curves!
  const effLen = relS > 0 ? len * lerp(1.0, 0.74, relLift) : len;
  const effBaseYOff = relS > 0 ? lerp(baseYOff, releaseState.skyTiltY, relLift) : baseYOff;
  const effFreq = relS > 0 ? lerp(freq, 1.22, relLift) : freq;
  const effAmp = relS > 0 ? amp * lerp(1.0, 0.52, relLift) : amp;
  const effHorizSway = relS > 0 ? lerp(10 + windPower * 22, 7.5, relLift) : (10 + windPower * 22);
  const effHarmonic = relS > 0 ? lerp(0.34 * windPower, 0.10, relLift) : (0.34 * windPower);

  const steps = 38;
  const spine = [];

  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    // Downstream traveling-wave phase (`k * u - omega * t`) + supple celestial-drift S-envelope!
    const travelPhase = u * Math.PI * 2 * effFreq - localT * omega + phaseOff;
    const attachedEnv = Math.pow(u, 0.78);
    const freeEnv = 0.28 + 0.72 * Math.sin(u * Math.PI * 0.86);
    const envelope = relS > 0 ? lerp(attachedEnv, freeEnv, relFree) : attachedEnv;
    const skyArchY = relS > 0 ? -Math.sin(u * Math.PI) * (22 * relLift) : 0;
    const px =
      anchor[0] -
      u * effLen +
      Math.sin(travelPhase * 1.4) * effHorizSway * u;
    const py =
      anchor[1] +
      u * effBaseYOff +
      skyArchY +
      Math.sin(travelPhase) * effAmp * envelope +
      Math.cos(travelPhase * 1.85 + 0.7) * (effAmp * effHarmonic) * u;
    spine.push([px, py]);
  }

  // Compute signed ribbon twist (`cos(twistPhase)`): zero-crossings produce true 3D silk flip-overs!
  const upperEdge = [];
  const lowerEdge = [];
  const foldSegments = [];
  let segStart = 0;
  let prevSign = 1;
  const effTwistFreq = relS > 0 ? lerp(2.35, 1.55, relLift) : 2.35;

  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const pPrev = spine[Math.max(0, i - 1)];
    const pNext = spine[Math.min(steps, i + 1)];
    const tx = pNext[0] - pPrev[0];
    const ty = pNext[1] - pPrev[1];
    const tl = Math.hypot(tx, ty) || 1;
    const nx = -ty / tl;
    const ny = tx / tl;

    const twistArg = u * Math.PI * effTwistFreq - localT * (omega * 0.62) + phaseOff * 0.8;
    const signedTwist = Math.cos(twistArg); // Crosses 0 at ribbon flip-over nodes!
    const sign = signedTwist >= 0 ? 1 : -1;
    if (i > 0 && sign !== prevSign) {
      foldSegments.push([segStart, i]);
      segStart = Math.max(0, i - 1);
      prevSign = sign;
    }
    const taper = Math.sin(Math.min(1, u * 1.12) * Math.PI * 0.92);
    const halfW = width * 0.5 * (0.14 + 0.86 * Math.abs(signedTwist)) * Math.max(0.08, taper);

    upperEdge.push([spine[i][0] + nx * halfW * sign, spine[i][1] + ny * halfW * sign]);
    lowerEdge.push([spine[i][0] - nx * halfW * sign, spine[i][1] - ny * halfW * sign]);
  }
  foldSegments.push([segStart, steps]);

  // Occlude & stroke each folded silk lobe back-to-front so front folds overlap back folds cleanly!
  const maskAlpha = relS > 0 ? Math.pow(mistFade, 1.18) : 1.0;
  const boneToneA = relS > 0.64 ? INK_SHADES.zhong : INK_SHADES.jiao;
  const boneToneB = relS > 0.64 ? INK_SHADES.dan : INK_SHADES.nong;

  for (let s = foldSegments.length - 1; s >= 0; s--) {
    const [i0, i1] = foldSegments[s];
    if (i1 - i0 < 2) continue;
    const subU = upperEdge.slice(i0, i1 + 1);
    const subL = lowerEdge.slice(i0, i1 + 1);
    fillPaperMaskPoly(ctx, [...subU, ...subL.slice().reverse()], paperCanvas, maskAlpha);

    const isTip = i1 === steps;
    drawLanyeStroke(ctx, subU, {
      minW: 0.65,
      maxW: 2.6 + windPower * 0.75,
      color: s % 2 === 0 ? boneToneA : boneToneB,
      alpha: effAlpha,
      waves: 2.0,
      phase: localT * 4 + s,
      splitFilaments: isTip ? 7 : 0,
      seed: seed + s * 7,
    });
    drawLanyeStroke(ctx, subL, {
      minW: 0.55,
      maxW: 2.1 + windPower * 0.55,
      color: relS > 0.68 ? INK_SHADES.dan : INK_SHADES.zhong,
      alpha: effAlpha * 0.90,
      waves: 2.0,
      phase: localT * 4 + s + 1.2,
      splitFilaments: isTip ? 6 : 0,
      seed: seed + s * 7 + 3,
    });

    // Delicate inner silk fold crease (`披帛内折衣纹线`)
    const subM = spine.slice(i0, i1 + 1);
    drawTiexianStroke(ctx, subM, 0.75, INK_SHADES.dan, effAlpha * 0.52, seed + s * 11);
  }

  // Freed front sash swallowtail tip (`解带前梢燕尾迎风出锋`) once unfastened from the neck
  if (relFree > 0.14) {
    const headPt = spine[0];
    const nextPt = spine[3];
    const hAng = Math.atan2(headPt[1] - nextPt[1], headPt[0] - nextPt[0]);
    const tipReach = 22 + 18 * relFree;
    const sashTongue = sampleQuad(
      headPt,
      [headPt[0] + Math.cos(hAng - 0.18) * tipReach * 0.52, headPt[1] + Math.sin(hAng - 0.18) * tipReach * 0.52 - 4 * relFree],
      [headPt[0] + Math.cos(hAng - 0.08) * tipReach, headPt[1] + Math.sin(hAng - 0.08) * tipReach - 8 * relFree],
      10
    );
    drawLanyeStroke(ctx, sashTongue, {
      minW: 0.35,
      maxW: 1.95,
      color: boneToneB,
      alpha: effAlpha * relFree * 0.92,
      waves: 1.4,
      splitFilaments: 6,
      seed: seed + 83,
    });
  }

  // Bar-2 Wu-Daozi vortex whip curl at tail (`吴带当风梢头回旋飞白`; unfurls smoothly into sky-whip during release!)
  if (windPower > 0.16) {
    const endPt = spine[steps];
    const prevPt = spine[steps - 2];
    const dirAng = Math.atan2(endPt[1] - prevPt[1], endPt[0] - prevPt[0]);
    const curlUnwind = relS > 0 ? smoothstep(0.0, 0.28, relS) : 0;
    const curlTurns = lerp(2.0 + windPower * 1.5, 0.58, curlUnwind);
    const curlRadScale = lerp(1.0, 0.24, curlUnwind);
    const curlReach = lerp(24, 52, curlUnwind);
    const curl = [];
    for (let k = 0; k <= 16; k++) {
      const t = k / 16;
      const a = dirAng + t * Math.PI * curlTurns;
      const r = (1 - t * 0.72) * (15 + windPower * 22) * curlRadScale;
      curl.push([
        endPt[0] + Math.cos(dirAng) * t * curlReach + Math.cos(a) * r,
        endPt[1] + Math.sin(dirAng) * t * (curlReach * 0.58) - curlUnwind * t * 12 + Math.sin(a) * r * 0.8,
      ]);
    }
    drawLanyeStroke(ctx, curl, {
      minW: 0.3,
      maxW: 1.75 + windPower * 0.7,
      color: relS > 0.64 ? INK_SHADES.dan : INK_SHADES.nong,
      alpha: (0.55 + windPower * 0.4) * mistFade,
      waves: 1.5,
      splitFilaments: 7,
      seed: seed + 99,
    });
  }
}

/**
 * Swirling hand-brushed pale-ink orchid petals & slender willow-leaf wisps (`淡墨兰瓣柳叶随帛旋升`)
 * accompanying the departing celestial silk ribbons during `localT ∈ [4.25s, 5.75s]`!
 */
function drawAscendingReleaseOrchidWisps(ctx, localT, rig, paperCanvas) {
  if (localT <= 4.22 || localT >= 5.80) return;
  const wispProgress = clamp((localT - 4.25) / (5.75 - 4.25), 0, 1);
  const envAlpha = smoothstep(4.22, 4.46, localT) * (1 - smoothstep(5.48, 5.78, localT));
  if (envAlpha <= 0.015) return;

  // Base origin anchored near the Bar-3 unfastening wake (`x ≈ 725..810`, rising into `y ≈ 190..360`)
  const wakeBaseX = rig.body.x - 215 * Math.pow(wispProgress, 1.38);
  const wakeBaseY = rig.body.y - 38 - 252 * Math.pow(wispProgress, 1.15);

  const wisps = [
    { ox: 34, oy: -28, swirlR: 36, freq: 5.0, ph: 0.4, sz: 13.8, slender: 0.40, lift: 1.16 },
    { ox: -22, oy: 18, swirlR: 44, freq: 4.5, ph: 1.7, sz: 12.2, slender: 0.50, lift: 0.94 },
    { ox: -78, oy: -38, swirlR: 38, freq: 5.6, ph: 2.9, sz: 14.5, slender: 0.35, lift: 1.12 },
    { ox: -138, oy: 22, swirlR: 46, freq: 4.2, ph: 4.1, sz: 11.6, slender: 0.52, lift: 0.86 },
    { ox: -48, oy: -64, swirlR: 32, freq: 5.9, ph: 5.0, sz: 13.0, slender: 0.37, lift: 1.22 },
    { ox: -112, oy: -14, swirlR: 38, freq: 4.8, ph: 2.2, sz: 11.0, slender: 0.45, lift: 1.02 },
    { ox: 8, oy: 34, swirlR: 30, freq: 5.3, ph: 3.4, sz: 12.6, slender: 0.42, lift: 0.88 },
  ];

  // Two delicate ascending `游丝/兰叶` breeze filaments weaving among the rising petals
  for (let b = 0; b < 2; b++) {
    const breezePts = [];
    for (let k = 0; k <= 18; k++) {
      const u = k / 18;
      const bx = wakeBaseX + 38 - b * 64 - u * 210 + Math.sin(u * Math.PI * 2.0 + localT * 4.2 + b) * 16;
      const by = wakeBaseY + 24 - b * 42 - u * 88 + Math.cos(u * Math.PI * 2.2 - localT * 3.6 + b) * 14;
      breezePts.push([bx, by]);
    }
    drawLanyeStroke(ctx, breezePts, {
      minW: 0.32,
      maxW: 1.45,
      color: b === 0 ? INK_SHADES.zhong : INK_SHADES.dan,
      alpha: envAlpha * 0.52,
      waves: 2.0,
      phase: localT * 3 + b,
      splitFilaments: 5,
      halo: false,
      seed: 991 + b * 7,
    });
  }

  for (let i = 0; i < wisps.length; i++) {
    const w = wisps[i];
    const theta = wispProgress * w.freq + w.ph;
    const px = wakeBaseX + w.ox - wispProgress * (18 + i * 6) + Math.cos(theta) * w.swirlR;
    const py = wakeBaseY + w.oy - wispProgress * 44 * w.lift + Math.sin(theta * 1.15) * (w.swirlR * 0.48);
    const rot = -0.42 + Math.sin(theta * 0.85) * 0.62 + wispProgress * (1.5 + (i % 2) * 0.85);
    const pAlpha = envAlpha * (0.86 - (i % 3) * 0.08);

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rot);

    const sz = w.sz;
    const hw = sz * w.slender;
    // Asymmetric calligraphic wild-orchid petal / willow-leaf blade (`双勾淡墨兰瓣`)
    const upper = sampleBezier([-sz, 1.2], [-sz * 0.28, -hw * 1.15], [sz * 0.48, -hw * 0.85], [sz * 1.08, -0.8], 10);
    const lower = sampleBezier([sz * 1.08, -0.8], [sz * 0.42, hw * 0.92], [-sz * 0.34, hw * 0.95], [-sz, 1.2], 10);
    fillPaperMaskPoly(ctx, [...upper, ...lower], paperCanvas, pAlpha * 0.88);

    drawLanyeStroke(ctx, upper, {
      minW: 0.32,
      maxW: 1.48,
      color: i % 2 === 0 ? INK_SHADES.zhong : INK_SHADES.dan,
      alpha: pAlpha,
      waves: 1.2,
      splitFilaments: 4,
      halo: false,
      seed: 960 + i * 5,
    });
    drawLanyeStroke(ctx, lower, {
      minW: 0.28,
      maxW: 1.22,
      color: INK_SHADES.dan,
      alpha: pAlpha * 0.88,
      waves: 1.0,
      halo: false,
      seed: 963 + i * 5,
    });
    // Central delicate orchid-vein `琴弦描` filament
    drawTiexianStroke(ctx, [[-sz * 0.72, 0.5], [sz * 0.68, -0.4]], 0.58, INK_SHADES.qing, pAlpha * 0.72, 965 + i);
    ctx.restore();
  }
}

function computeDetachedRibbonState(baseAnchor, localT, isOutroThumbnail, cfg) {
  if (isOutroThumbnail || localT <= 4.10) {
    return { anchor: baseAnchor, releaseState: null, visible: true };
  }
  const s = clamp((localT - cfg.t0) / (cfg.t1 - cfg.t0), 0, 1);
  if (s <= 0) {
    return { anchor: baseAnchor, releaseState: null, visible: true };
  }
  if (s >= 1) {
    return { anchor: baseAnchor, releaseState: null, visible: false };
  }
  // C1-continuous slip & skyward lift: derivative wrt localT is 0 at s = 0, then arcs upward & gently backward!
  const dx = -cfg.backDrift * Math.pow(s, 1.50) - cfg.swayX * Math.sin(s * Math.PI);
  const dy = -cfg.skyLift * Math.pow(s, 1.28) - cfg.archY * Math.sin(s * Math.PI);
  return {
    anchor: [baseAnchor[0] + dx, baseAnchor[1] + dy],
    releaseState: { s, skyTiltY: cfg.skyTiltY },
    visible: true,
  };
}

function drawTangApsarasRibbons(ctx, rig, localT, windPower, paperCanvas, layer, isOutroThumbnail = false) {
  const neckMid = rig.neck[1];
  const shoulder = [rig.body.x + 8, rig.body.y - 24];

  if (layer === 'back') {
    // Upper soaring celestial ribbon (`飞天上扬长帛` — leads highest into the Yinghuang clouds)
    const upperRel = computeDetachedRibbonState([shoulder[0] - 6, shoulder[1] - 6], localT, isOutroThumbnail, {
      t0: 4.10,
      t1: 5.85,
      backDrift: 192,
      swayX: 10,
      skyLift: 302,
      archY: 32,
      skyTiltY: -46,
    });
    if (upperRel.visible) {
      drawAdvectedFlippingRibbon(ctx, upperRel.anchor, {
        len: 215 + windPower * 195,
        baseYOff: -68 - windPower * 46,
        amp: 20 + windPower * 36,
        freq: 1.85,
        omega: 8.2,
        phaseOff: 0.6,
        width: 17 + windPower * 5,
        alpha: 0.90,
        seed: 920,
      }, localT, windPower, paperCanvas, upperRel.releaseState);
    }
  } else {
    // Collar knot loop (`披帛绕颈云结` — unbinds & slips off neck cleanly during localT ∈ [4.10s, 4.56s])
    const knotUnbind = isOutroThumbnail ? 0 : smoothstep(4.10, 4.56, localT);
    if (knotUnbind < 0.99) {
      const kx = -knotUnbind * 38;
      const ky = -knotUnbind * 30;
      const kOpen = knotUnbind * 12;
      const collarPts = sampleBezier(
        [neckMid.x - 17 + kx - kOpen, neckMid.y - 6 + ky - kOpen * 0.5],
        [neckMid.x - 3 + kx, neckMid.y + 15 + ky],
        [neckMid.x + 19 + kx, neckMid.y + 11 + ky - kOpen * 0.3],
        [neckMid.x + 17 + kx + kOpen * 0.4, neckMid.y - 7 + ky - kOpen],
        16
      );
      const kAlpha = 0.96 * (1 - knotUnbind);
      fillPaperMaskPoly(ctx, collarPts, paperCanvas, 1 - knotUnbind);
      drawLanyeStroke(ctx, collarPts, {
        minW: 1.4, maxW: 3.6 * (1 - 0.35 * knotUnbind), color: INK_SHADES.jiao, alpha: kAlpha, waves: 1.5, seed: 940,
      });
    }

    // Primary grand Apsaras ribbon (`主披帛`, sweeping across the middle sky in bold S-waves)
    const mainRel = computeDetachedRibbonState([neckMid.x - 11, neckMid.y + 4], localT, isOutroThumbnail, {
      t0: 4.12,
      t1: 5.88,
      backDrift: 242,
      swayX: 14,
      skyLift: 238,
      archY: 26,
      skyTiltY: -34,
    });
    if (mainRel.visible) {
      drawAdvectedFlippingRibbon(ctx, mainRel.anchor, {
        len: 245 + windPower * 225,
        baseYOff: -12 + windPower * 8,
        amp: 24 + windPower * 44,
        freq: 2.15,
        omega: 9.0,
        phaseOff: 2.1,
        width: 20 + windPower * 6,
        alpha: 0.97,
        seed: 950,
      }, localT, windPower, paperCanvas, mainRel.releaseState);
    }

    // Lower trailing ribbon (`下垂流风披帛`, rising in a lower parallel celestial tier)
    const lowerRel = computeDetachedRibbonState([shoulder[0] - 14, shoulder[1] + 18], localT, isOutroThumbnail, {
      t0: 4.15,
      t1: 5.86,
      backDrift: 292,
      swayX: 18,
      skyLift: 208,
      archY: 20,
      skyTiltY: -18,
    });
    if (lowerRel.visible) {
      drawAdvectedFlippingRibbon(ctx, lowerRel.anchor, {
        len: 190 + windPower * 170,
        baseYOff: 44 + windPower * 18,
        amp: 16 + windPower * 32,
        freq: 1.75,
        omega: 8.6,
        phaseOff: 4.0,
        width: 14 + windPower * 4,
        alpha: 0.92,
        seed: 980,
      }, localT, windPower, paperCanvas, lowerRel.releaseState);
    }

    // Swirling ink orchid petals & willow-leaf wisps ascending with the departing silk (`localT ∈ [4.25s, 5.75s]`)
    if (!isOutroThumbnail) {
      drawAscendingReleaseOrchidWisps(ctx, localT, rig, paperCanvas);
    }
  }
}


// -----------------------------------------------------------------------------
// Wu Daozi Baimiao Pelican (`兰叶描飞羽 + 铁线描羽轴 + 垂云衣褶喉囊 + 禅定高僧神态`)
// -----------------------------------------------------------------------------
function drawTangBaimiaoLeg(ctx, hip, knee, foot, isBack, paperCanvas, seed) {
  const shade = isBack ? INK_SHADES.zhong : INK_SHADES.jiao;
  const alpha = isBack ? 0.80 : 0.96;

  // Feathered tibial trouser cuff (`束口羽袴褶纹`)
  const thighPoly = [
    ...sampleQuad([hip[0] - 11, hip[1] - 4], [lerp(hip[0], knee[0], 0.5) - 13, lerp(hip[1], knee[1], 0.5)], [knee[0] - 5, knee[1] - 2], 10),
    ...sampleQuad([knee[0] + 7, knee[1] - 2], [lerp(hip[0], knee[0], 0.5) + 13, lerp(hip[1], knee[1], 0.5)], [hip[0] + 11, hip[1] - 4], 10),
  ];
  fillPaperMaskPoly(ctx, thighPoly, paperCanvas);
  drawLanyeStroke(ctx, thighPoly.slice(0, 11), { minW: 0.9, maxW: 2.6, color: shade, alpha, waves: 1.5, seed });
  drawLanyeStroke(ctx, thighPoly.slice(11), { minW: 0.9, maxW: 2.4, color: shade, alpha, waves: 1.5, seed: seed + 3 });

  // Tarsus & 3 webbed toes gripping pedal
  drawTiexianStroke(ctx, [knee, foot], isBack ? 2.2 : 2.6, shade, alpha, seed + 5);
  for (let t = -1; t <= 1; t++) {
    drawLanyeStroke(ctx, [foot, [foot[0] + 15, foot[1] + t * 3.8 + 1]], {
      minW: 0.6, maxW: 1.85, color: shade, alpha, waves: 1.0, seed: seed + 9 + t,
    });
  }
}

function drawTangBaimiaoPelican(ctx, rig, localT, windPower, paperCanvas) {
  const bx = rig.body.x;
  const by = rig.body.y;
  const hx = rig.head.x;
  const hy = rig.head.y;
  const n0 = rig.neck[0];
  const n1 = rig.neck[1];
  const n2 = rig.neck[2];
  const n3 = rig.neck[3];
  const pDrop = rig.pouchDrop * 24;
  const ruff = Math.sin(localT * 10.5) * (1.5 + windPower * 5.5);

  // 1. Far Leg (occluded behind body)
  const hipBack = [bx - 4, by + 26];
  drawTangBaimiaoLeg(ctx, hipBack, [rig.leftKnee.x, rig.leftKnee.y], [rig.leftFoot.x, rig.leftFoot.y], true, paperCanvas, 1001);

  // 2. Plump Tang-court Body & Wind-Fanned Tail Plumage (`丰腴盛唐禽身 + 迎风翻飞尾羽`)
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(rig.body.lean * 0.42);
  const rx = rig.body.rx + 8;
  const ry = rig.body.ry + 4;

  const dorsalPts = sampleBezier([-rx - 18, -4], [-rx * 0.45, -ry - 10], [rx * 0.42, -ry - 4], [rx - 4, -8], 22);
  const ventralPts = sampleBezier([rx - 4, -8], [rx + 12, ry * 0.55], [-rx * 0.30, ry + 14], [-rx - 14, 12], 22);
  fillPaperMaskPoly(ctx, [...dorsalPts, ...ventralPts], paperCanvas);

  drawLanyeStroke(ctx, dorsalPts, { minW: 1.4, maxW: 4.0, color: INK_SHADES.jiao, alpha: 0.97, waves: 2.2, splitFilaments: 5, seed: 1011 });
  drawLanyeStroke(ctx, ventralPts, { minW: 1.2, maxW: 3.4, color: INK_SHADES.nong, alpha: 0.94, waves: 2.0, seed: 1015 });

  // Soft breast & flank imbricated down-feather ripples (`胸腹细羽兰叶叠纹`)
  for (let r = 0; r < 5; r++) {
    const fy = -ry * 0.28 + r * 11.5;
    const fWave = sampleBezier(
      [rx * 0.55 - r * 5, fy],
      [rx * 0.12 - r * 5, fy + 8 + ruff * 0.25],
      [-rx * 0.36 - r * 4, fy + 5 - ruff * 0.25],
      [-rx * 0.76 - r * 3 - windPower * 12, fy - 2 + ruff * 0.4],
      16
    );
    drawLanyeStroke(ctx, fWave, {
      minW: 0.45, maxW: 1.85, color: r % 2 === 0 ? INK_SHADES.zhong : INK_SHADES.dan, alpha: 0.72, waves: 1.8, splitFilaments: 5, seed: 1020 + r,
    });
  }

  // 7 Long Calligraphic Tail Rectrices (`七翎修尾迎风出锋`)
  for (let t = 0; t < 7; t++) {
    const spread = (t - 3) * (5.2 + windPower * 3.6);
    const flutter = Math.sin(localT * 11.5 + t * 0.85) * (2.5 + windPower * 8.5);
    const tailLen = 54 + windPower * 28 - Math.abs(t - 3) * 4;
    const tPts = sampleQuad(
      [-rx + 4, -2 + (t - 3) * 3.0],
      [-rx - tailLen * 0.52, -10 + spread * 0.6 + flutter * 0.5],
      [-rx - tailLen, -16 + spread + flutter],
      14
    );
    drawLanyeStroke(ctx, tPts, {
      minW: 0.4, maxW: 2.5, color: t % 2 === 0 ? INK_SHADES.jiao : INK_SHADES.nong, alpha: 0.93, waves: 1.4, splitFilaments: 6, seed: 1040 + t,
    });
  }
  ctx.restore();

  // 3. Near Leg (pedaling over crank)
  const hipFront = [bx + 4, by + 28];
  drawTangBaimiaoLeg(ctx, hipFront, [rig.rightKnee.x, rig.rightKnee.y], [rig.rightFoot.x, rig.rightFoot.y], false, paperCanvas, 1061);

  // 4. Supple S-Curved Neck, Robe-Drapery Gular Pouch & Zen High-Monk Head (`曲颈垂囊 + 高僧庄严法相`)
  const backNeck = sampleBezier([n0.x - 18, n0.y + 4], [n1.x - 20, n1.y - 2], [n2.x - 18, n2.y - 4], [n3.x - 16, n3.y - 6], 22);
  const frontNeck = sampleBezier([n3.x + 14, n3.y + 10], [n2.x + 18, n2.y + 8], [n1.x + 22, n1.y + 8], [n0.x + 22, n0.y + 12], 22);
  fillPaperMaskPoly(ctx, [...backNeck, ...frontNeck], paperCanvas);

  drawLanyeStroke(ctx, backNeck, { minW: 1.3, maxW: 3.6, color: INK_SHADES.jiao, alpha: 0.96, waves: 2.0, seed: 1071 });
  drawLanyeStroke(ctx, frontNeck, { minW: 1.1, maxW: 3.0, color: INK_SHADES.nong, alpha: 0.92, waves: 1.8, seed: 1075 });

  // Streaming nape fine plumes (`颈后迎风细羽`)
  for (let k = 0; k < 5; k++) {
    const u = 0.20 + k * 0.16;
    const idx = Math.floor(u * (backNeck.length - 1));
    const np = backNeck[idx];
    const plume = sampleQuad(
      np,
      [np[0] - 16 - windPower * 18, np[1] - 4 + Math.sin(localT * 12 + k) * (2 + windPower * 5)],
      [np[0] - 28 - windPower * 34, np[1] - 7 + Math.cos(localT * 11 + k) * (3 + windPower * 7)],
      10
    );
    drawLanyeStroke(ctx, plume, { minW: 0.35, maxW: 1.75, color: INK_SHADES.zhong, alpha: 0.84, waves: 1.2, splitFilaments: 5, seed: 1080 + k });
  }

  // Cranial dome (hand-brushed non-`arc` ring!) + Upper Beak + Voluminous Tang Robe-Pleated Gular Pouch (`吴装衣褶大喉囊`)
  const beakTip = [hx + 114, hy + 8];
  const headDome = sampleBezier([hx - 22, hy + 6], [hx - 24, hy - 26], [hx + 14, hy - 28], [hx + 28, hy - 8], 18);
  const upperCulmen = sampleBezier([hx + 24, hy - 9], [hx + 58, hy - 13], [hx + 94, hy - 6], [beakTip[0], beakTip[1] + 4], 20);
  const pouchBelly = sampleBezier(
    [beakTip[0] - 3, beakTip[1] + 3],
    [hx + 84 - windPower * 10, hy + 48 + pDrop],
    [hx + 30 - windPower * 18, hy + 60 + pDrop + ruff * 0.45],
    [hx + 6, hy + 18],
    24
  );
  fillPaperMaskPoly(ctx, [...headDome, ...upperCulmen, ...pouchBelly], paperCanvas);

  drawLanyeStroke(ctx, headDome, { minW: 1.3, maxW: 3.5, color: INK_SHADES.jiao, alpha: 0.97, waves: 1.6, seed: 1091 });
  drawLanyeStroke(ctx, upperCulmen, { minW: 1.4, maxW: 3.4, color: INK_SHADES.jiao, alpha: 0.98, waves: 1.5, seed: 1095 });
  // Iron-wire beak mouth cleft & hooked nail
  const mouthLine = sampleBezier([hx + 18, hy + 4], [hx + 56, hy + 2], [hx + 90, hy + 5], beakTip, 18);
  drawTiexianStroke(ctx, mouthLine, 1.65, INK_SHADES.nong, 0.94, 1099);
  drawLanyeStroke(ctx, pouchBelly, { minW: 1.3, maxW: 3.9, color: INK_SHADES.jiao, alpha: 0.96, waves: 2.6, phase: localT * 2, seed: 1103 });

  // 5 Flowing Wu-Daozi Robe-Drapery Pleats inside the Gular Pouch (`喉囊兰叶衣纹垂褶`)!
  for (let f = 1; f <= 5; f++) {
    const ratio = f / 6;
    const pleat = sampleBezier(
      [hx + 16 + f * 13, hy + 7],
      [hx + 56 - f * 3 - windPower * 8, hy + 20 + (34 + pDrop) * ratio],
      [hx + 28 - windPower * 14, hy + 24 + (40 + pDrop) * ratio + ruff * 0.3],
      [hx + 10, hy + 13 + f * 1.8],
      18
    );
    drawLanyeStroke(ctx, pleat, {
      minW: 0.4, maxW: 1.65, color: f % 2 === 0 ? INK_SHADES.zhong : INK_SHADES.dan, alpha: 0.78, waves: 2.0, phase: f + localT * 2, seed: 1110 + f,
    });
  }

  // Serene Tang Bodhisattva / High-Monk Facial Expression (`得道高僧禅定半阖凤眼 + 长眉入鬓`)!
  const upperLid = sampleQuad([hx - 4, hy - 6], [hx + 7, hy - 12], [hx + 18, hy - 5], 12);
  const lowerLid = sampleQuad([hx - 2, hy - 5], [hx + 7, hy - 2.5], [hx + 16, hy - 5], 10);
  drawLanyeStroke(ctx, upperLid, { minW: 0.8, maxW: 2.4, color: INK_SHADES.jiao, alpha: 0.98, waves: 1.0, seed: 1121 });
  drawTiexianStroke(ctx, lowerLid, 1.0, INK_SHADES.nong, 0.86, 1123);
  const pupilRing = sampleHandRingPts(hx + 8, hy - 6.2, 2.3, 2.0, 8, 0.2, 1125, 0, false);
  ctx.fillStyle = INK_SHADES.jiao;
  ctx.beginPath();
  ctx.moveTo(pupilRing[0][0], pupilRing[0][1]);
  for (let k = 1; k < pupilRing.length; k++) ctx.lineTo(pupilRing[k][0], pupilRing[k][1]);
  ctx.closePath();
  ctx.fill();

  // Sweeping immortal eyebrow (`长眉入鬓随风飞舞`) — settles cleanly as head enters `#05 宋代山水` (`hx -> 1000`)
  const headSeamCalm = 1 - smoothstep(952, 1004, hx);
  if (headSeamCalm > 0.02) {
    const browReach = 0.28 + 0.72 * headSeamCalm;
    const brow = sampleBezier(
      [hx + 19, hy - 10],
      [hx + 5, hy - 19],
      [hx - (16 + windPower * 16) * browReach, hy - 16],
      [hx - (36 + windPower * 32) * browReach, hy - 22 + Math.sin(localT * 9) * (2 + windPower * 5) * headSeamCalm],
      16
    );
    drawLanyeStroke(ctx, brow, { minW: 0.4, maxW: 2.1, color: INK_SHADES.jiao, alpha: 0.94 * headSeamCalm, waves: 1.5, splitFilaments: 6, seed: 1129 });
  }

  // Tang Scholar Lotus Hairpin Crown (`唐代高士莲花束冠横簪`) + 5 Streaming Crown Plumes (`冠羽迎风怒放`)!
  const capBase = [hx - 8, hy - 21];
  const capPoly = [
    [capBase[0] - 9, capBase[1] + 2],
    [capBase[0] - 7, capBase[1] - 12],
    [capBase[0] + 2, capBase[1] - 17],
    [capBase[0] + 11, capBase[1] - 11],
    [capBase[0] + 10, capBase[1] + 2],
  ];
  fillPaperMaskPoly(ctx, capPoly, paperCanvas);
  drawTiexianStroke(ctx, [...capPoly, capPoly[0]], 1.45, INK_SHADES.jiao, 0.95, 1133);
  // Jade hairpin (`横贯玉簪`)
  drawLanyeStroke(ctx, [[capBase[0] - 17, capBase[1] - 7], [capBase[0] + 19, capBase[1] - 9]], {
    minW: 1.0, maxW: 2.3, color: INK_SHADES.jiao, alpha: 0.96, waves: 1.0, seed: 1137,
  });

  if (headSeamCalm > 0.02) {
    for (let c = 0; c < 5; c++) {
      const cLen = (46 + c * 11 + windPower * 56) * (0.25 + 0.75 * headSeamCalm);
      const cWave = Math.sin(localT * 10.5 - c * 0.75) * (5 + windPower * 16) * headSeamCalm;
      const plume = sampleBezier(
        [hx - 14, hy - 17 + c * 3.5],
        [hx - 14 - cLen * 0.36, hy - 28 - c * 4 + cWave * 0.5],
        [hx - 14 - cLen * 0.72, hy - 18 + c * 3 - cWave * 0.8],
        [hx - 14 - cLen, hy - 24 + (c - 2) * 8 + cWave],
        18
      );
      drawLanyeStroke(ctx, plume, {
        minW: 0.35, maxW: 2.35 - c * 0.18, color: c < 2 ? INK_SHADES.jiao : INK_SHADES.nong, alpha: 0.94 * headSeamCalm, waves: 2.0, splitFilaments: 6, seed: 1140 + c,
      });
    }
  }

  // 5. Three-Tiered Meticulous Baimiao Wing (`三层叠羽白描大翼`: Scapulars + Median Coverts + 9 Sweeping Primaries)
  ctx.save();
  ctx.translate(bx + 12, by - 12);
  ctx.rotate(rig.wingAngle * 0.38 - windPower * 0.10);

  const wingBoundary = [
    ...sampleBezier([18, -6], [-18, -28], [-74, -24], [-128 - windPower * 24, -4], 18),
    ...sampleBezier([-128 - windPower * 24, -4], [-96, 30], [-32, 36], [30, 22], 18),
  ];
  fillPaperMaskPoly(ctx, wingBoundary, paperCanvas);

  // Leading-edge wing bone (`翼肩主骨兰叶重墨`)
  drawLanyeStroke(ctx, wingBoundary.slice(0, 19), {
    minW: 1.6, maxW: 4.3, color: INK_SHADES.jiao, alpha: 0.98, waves: 1.8, splitFilaments: 5, seed: 1161,
  });

  // Tier 3: 9 Long Sweeping Primary Flight Remiges (`九枚修长飞羽：兰叶双勾 + 铁线羽轴 + 丝毛飞白羽梢`)
  for (let p = 0; p < 9; p++) {
    const u = p / 8;
    const rootX = lerp(8, -46, u);
    const rootY = lerp(16, 4, u);
    const tipLen = lerp(74, 126 + windPower * 28, u);
    const tipAng = lerp(0.46, -0.10, u) + Math.sin(localT * 11 + p * 0.6) * (0.02 + windPower * 0.06);
    const tipX = rootX - Math.cos(tipAng) * tipLen;
    const tipY = rootY + Math.sin(tipAng) * tipLen * 0.68;
    const midX = (rootX + tipX) * 0.5 - 6;
    const midY = (rootY + tipY) * 0.5 + 8;

    const upperVane = sampleQuad([rootX, rootY - 4.5], [midX, midY - 5.5], [tipX, tipY], 14);
    const lowerVane = sampleQuad([rootX, rootY + 4.5], [midX, midY + 5.0], [tipX, tipY], 14);
    fillPaperMaskPoly(ctx, [...upperVane, ...lowerVane.slice().reverse()], paperCanvas);

    drawLanyeStroke(ctx, upperVane, {
      minW: 0.55, maxW: 2.5, color: INK_SHADES.jiao, alpha: 0.96, waves: 1.4, splitFilaments: 6, seed: 1170 + p,
    });
    drawLanyeStroke(ctx, lowerVane, {
      minW: 0.45, maxW: 1.85, color: INK_SHADES.zhong, alpha: 0.88, waves: 1.2, splitFilaments: 5, seed: 1190 + p,
    });
    // Crisp iron-wire central feather rachis (`铁线描中锋羽轴`)
    const shaft = sampleQuad([rootX, rootY], [midX, midY - 0.4], [tipX, tipY], 12);
    drawTiexianStroke(ctx, shaft, 0.95, INK_SHADES.dan, 0.78, 1210 + p);
  }

  // Tier 2 & Tier 1: Overlapping Median & Lesser Coverts (`中覆羽与肩覆羽鳞次层叠`)
  for (let tier = 0; tier < 2; tier++) {
    const count = tier === 0 ? 7 : 6;
    for (let c = 0; c < count; c++) {
      const cu = c / (count - 1);
      const cx0 = lerp(16, -42 + tier * 10, cu);
      const cy0 = lerp(4 - tier * 9, -6 - tier * 8, cu);
      const fLen = (tier === 0 ? 46 : 30) + windPower * 8;
      const covU = sampleQuad([cx0, cy0 - 4], [cx0 - fLen * 0.52, cy0 + 2], [cx0 - fLen, cy0 + 7], 10);
      const covL = sampleQuad([cx0, cy0 + 4], [cx0 - fLen * 0.48, cy0 + 10], [cx0 - fLen, cy0 + 7], 10);
      fillPaperMaskPoly(ctx, [...covU, ...covL.slice().reverse()], paperCanvas);
      drawLanyeStroke(ctx, covU, {
        minW: 0.55, maxW: 2.25 - tier * 0.25, color: INK_SHADES.jiao, alpha: 0.95, waves: 1.2, splitFilaments: 4, seed: 1230 + tier * 20 + c,
      });
      drawLanyeStroke(ctx, covL, {
        minW: 0.45, maxW: 1.65, color: INK_SHADES.nong, alpha: 0.86, waves: 1.0, seed: 1270 + tier * 20 + c,
      });
    }
  }
  ctx.restore();

  // Wingtip gripping the Phoenix handlebar stem (`执辔羽端`)
  const gripCurve = sampleQuad([bx + 28, by - 4], [lerp(bx + 28, rig.handlebar.x, 0.5), rig.handlebar.y + 15], [rig.handlebar.x + 2, rig.handlebar.y + 1], 14);
  drawLanyeStroke(ctx, gripCurve, { minW: 1.2, maxW: 3.2, color: INK_SHADES.jiao, alpha: 0.94, waves: 1.4, seed: 1311 });
}

/**
 * Foreground wild ink-orchid tufts (`前景破界迎风幽兰`) drawn AFTER the chariot wheels so that
 * supple calligraphic blades cross in front of the `y=680` embankment & wheel plane per #85!
 */
function drawForegroundEmbankmentOrchids(ctx, localT, windPower) {
  const sway = 6 + windPower * 16 + Math.sin(localT * 6.4) * (2.5 + windPower * 6);
  drawWildOrchidTuft(ctx, 174, ROAD_EDGE_Y + 20, 1.02, sway, INK_SHADES.jiao, 0.92, 1401);
  drawWildOrchidTuft(ctx, 518, ROAD_EDGE_Y + 24, 1.08, sway * 1.08, INK_SHADES.jiao, 0.94, 1417);
  drawWildOrchidTuft(ctx, 838, ROAD_EDGE_Y + 21, 0.98, sway * 0.95, INK_SHADES.nong, 0.90, 1433);
}

function drawThumbnailBanner(ctx, scene) {
  const stripH = 96;
  const stripY = PANEL_SIZE - stripH;
  ctx.save();
  ctx.fillStyle = 'rgba(236, 226, 200, 0.92)';
  ctx.fillRect(0, stripY, PANEL_SIZE, stripH);
  ctx.fillStyle = INK_SHADES.nong;
  ctx.fillRect(0, stripY, PANEL_SIZE, 3);
  ctx.fillStyle = CINNABAR_SEAL;
  ctx.fillRect(28, stripY + 18, 12, stripH - 36);
  ctx.fillStyle = INK_SHADES.jiao;
  ctx.font = '800 50px "Noto Serif CJK SC", "Songti SC", serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText(`#${String(scene.index).padStart(2, '0')} ${scene.title}`, 56, stripY + stripH * 0.54);
  ctx.restore();
}

// Smooth C1 stone-embankment height & tangent locked strictly to `(0, 680)` and `(1000, 680)`!
function sampleTangEmbankment(x) {
  const u = clamp(x / PANEL_SIZE, 0, 1);
  const env = Math.sin(Math.PI * u);
  const env2 = env * env; // 0 and d/dx=0 at u=0 and u=1!
  const y = ROAD_EDGE_Y - 2.4 * env2 * Math.sin(u * Math.PI * 5.0);
  const dydx = (-2.4 * env2 * (Math.PI * 5.0 / PANEL_SIZE) * Math.cos(u * Math.PI * 5.0));
  return { y, slope: Math.atan(dydx) };
}

// -----------------------------------------------------------------------------
// Scene Entry Point (`slot.usedFb = false`, zero top-left UI card in main view!)
// -----------------------------------------------------------------------------
export function render(kit, slot, scene, params) {
  const {
    t = 0,
    localT = 0,
    pelicanLocalX = 500,
    pedalAngle = 0,
    speedScale = 1,
    barIndex = Math.floor(localT / 2),
    barPhase = (localT % 2) / 2,
    isOutroThumbnail = false,
  } = params;

  const g = slot.g2d;
  const ctx = g.drawingContext;
  slot.usedFb = false;

  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Pre-baked waxed High-Tang Yinghuang paper & full Baimiao scroll composition
  const paperBaked = getBakedYinghuangPaper(kit);
  const paperCanvas = paperBaked.canvas;
  const scrollBaked = getBakedTangScroll(kit, paperCanvas);
  ctx.drawImage(scrollBaked.canvas, 0, 0);

  // 2. Bar-2 "吴带当风" Headwind Gust Envelope (`localT 2..4s`)
  const gustAttack = smoothstep(1.82, 2.32, localT);
  const gustSustain = barIndex >= 1 ? 0.86 + 0.14 * Math.sin(barPhase * Math.PI * 4) : 0;
  const windPower = isOutroThumbnail ? 0.92 : clamp(Math.max(gustAttack * 0.95, gustSustain), 0, 1);

  // 3. Compute True Pelican & Chariot Rig (`x=0` and `x=1000` strictly grounded on `y = 680`!)
  const px = isOutroThumbnail ? 515 : pelicanLocalX;
  const road = sampleTangEmbankment(px);
  const rawRig = computePelicanRig({
    x: px,
    y: road.y,
    pedalAngle,
    slope: road.slope,
    speedScale,
    time: t,
  });

  const rig = {
    ...rawRig,
    rearWheel: { ...rawRig.rearWheel, rot: rawRig.rearWheel.angle },
    frontWheel: { ...rawRig.frontWheel, rot: rawRig.frontWheel.angle },
    crank: rawRig.bb,
    seat: rawRig.saddle,
    handlebar: rawRig.handleGrip,
    body: {
      x: rawRig.bodyCenter.x,
      y: rawRig.bodyCenter.y,
      rx: rawRig.bodyCenter.rx,
      ry: rawRig.bodyCenter.ry,
      lean: rawRig.bodyCenter.tilt,
    },
    neck: [rawRig.chest, rawRig.neckC1, rawRig.neckC2, rawRig.head],
    pouchDrop: 0.25 + 0.20 * Math.sin(2 * pedalAngle - 0.85) + 0.18 * windPower,
    wingAngle: Math.sin(2 * pedalAngle) * (0.08 + 0.16 * windPower),
  };

  // 4. Layered Pure-Ink Baimiao Painting Order (with pattern-preserving hemp paper occlusion)
  drawDynamicWindAndPetals(ctx, localT, windPower, paperCanvas);
  if (px > -260 && px < PANEL_SIZE + 260) {
    drawTangApsarasRibbons(ctx, rig, localT, windPower, paperCanvas, 'back', isOutroThumbnail);
    drawTangWoodenCycle(ctx, rig, localT, windPower, paperCanvas);
    drawTangBaimiaoPelican(ctx, rig, localT, windPower, paperCanvas);
    drawTangApsarasRibbons(ctx, rig, localT, windPower, paperCanvas, 'front', isOutroThumbnail);
  }
  drawForegroundEmbankmentOrchids(ctx, localT, windPower);

  // 5. No modern floating UI placard in main view (handled externally by museum frame + native scroll slip);
  //    keep clean high-contrast bottom banner ONLY for Outro gallery thumbnails!
  if (isOutroThumbnail) {
    drawThumbnailBanner(ctx, scene);
  }
  ctx.restore();
}
