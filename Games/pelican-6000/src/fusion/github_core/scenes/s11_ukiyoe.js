// src/scenes/s11_ukiyoe.js
// #11 浮世绘 (1830s · Utagawa Hiroshige Hōeidō Tōkaidō Nishiki-e Woodblock Masterpiece — r3)
// - Physical Medium: Fibrous Hosho mulberry washi + spiral Baren bamboo-sheath rubbing tracks (馬連筋)
//   + cherrywood horizontal mountain-grain (木目摺り) + multi-block color misregistration (版ズレ ±1.2~1.7px
//   with `multiply` ink-trapping overlaps & raw-washi hairline leaks) + chisel-jittered Sumi keyblock!
// - Landmarks (#85 Refined): Branching dendritic snow-ravines (雪渓) & mokume-grained Prussian-blue Mt. Fuji
//   (zero straight zigzag折尺!), irregular woodblock wave-claws (波頭) on Suruga Bay (zero uniform arcs!),
//   feathered boneless kasumi mist wipes, gnarled scaled Kuromatsu pines, Ichirizuka & terraced rice paddies.
// - Edo Craftsmanship Bird & Bike: Hiroshige Kachō-ga faceted skull & layered covert plumage, whipping
//   tie-dyed Mame-shibori Tenugui, mortise-tenon Susudake bamboo frame & 32-rib Janome oiled-paper wheels.
// - Animation Soul & Native Cartouches: Right-to-left propagating Shōno gust wavefront + 12Hz woodblock
//   registration micro-breathing; zero modern UI card — authentic Hōeidō dual cartouches & Edo seals!

import {
  PANEL_SIZE,
  clamp,
  lerp,
  smoothstep,
} from '../beat/timeline.js';
import { computePelicanRig } from '../rig/pelican.js';

const ROAD_ARCH_H = 14; // Gentle raised Tōkaidō embankment, strictly y=680 & slope=0 at x=0 and x=1000

// Multi-block color-plate registration offsets (版ズレ) relative to the Sumi keyblock
const PLATE_OFFSETS = {
  blue: { dx: 1.65, dy: -0.95 },
  beni: { dx: -1.45, dy: 1.15 },
  green: { dx: 1.25, dy: 1.40 },
  ochre: { dx: -1.15, dy: -1.10 },
};

function sampleTokaidoRoad(kit, x) {
  return kit.sampleRoad(clamp(x, 0, PANEL_SIZE), ROAD_ARCH_H);
}

function hash11(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

/**
 * Propagating Shōno Wind-Squall Wavefront moving right-to-left (x=1000 -> x=0) across Bar 2.
 */
function sampleGustAt(x, localT, galeEnv, isOutroThumbnail) {
  if (isOutroThumbnail) return 0.95;
  const waveDelay = ((PANEL_SIZE - clamp(x, 0, PANEL_SIZE)) / PANEL_SIZE) * 0.42;
  const tLocal = localT - waveDelay;
  const front = smoothstep(1.22, 1.92, tLocal) * (1 - smoothstep(3.92, 4.68, tLocal));
  const ripple = 0.86 + 0.14 * Math.sin(localT * 9.2 + x * 0.009);
  return clamp(Math.max(galeEnv * 0.65, front) * ripple, 0, 1.08);
}

function sampleCubic(p0, p1, p2, p3, n = 20) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const iu = 1 - u;
    pts.push({
      x: iu * iu * iu * p0.x + 3 * iu * iu * u * p1.x + 3 * iu * u * u * p2.x + u * u * u * p3.x,
      y: iu * iu * iu * p0.y + 3 * iu * iu * u * p1.y + 3 * iu * u * u * p2.y + u * u * u * p3.y,
    });
  }
  return pts;
}

function sampleQuad(p0, p1, p2, n = 14) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const iu = 1 - u;
    pts.push({
      x: iu * iu * p0.x + 2 * iu * u * p1.x + u * u * p2.x,
      y: iu * iu * p0.y + 2 * iu * u * p1.y + u * u * p2.y,
    });
  }
  return pts;
}

/**
 * Hand-gouged cherrywood Sumi keyblock stroke (彫師刀味):
 * Deterministic chisel woodgrain micro-chatter + crisp angled entry bite & rat-tail exit!
 */
function drawCarvedKeyblockCurve(ctx, pts, wStart, wMid, wEnd, color = '#171512', seed = 1) {
  if (pts.length < 2) return;
  const n = pts.length;
  const left = [];
  const right = [];

  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const baseW =
      u < 0.5
        ? lerp(wStart, wMid, smoothstep(0, 0.5, u))
        : lerp(wMid, wEnd, smoothstep(0.5, 1, u));
    const chatter = 1 + (hash11(i * 3.7 + seed * 19.3) - 0.5) * 0.24;
    const w = Math.max(0.55, baseW * chatter);

    const pPrev = pts[Math.max(0, i - 1)];
    const pNext = pts[Math.min(n - 1, i + 1)];
    let tx = pNext.x - pPrev.x;
    let ty = pNext.y - pPrev.y;
    const len = Math.hypot(tx, ty) || 1;
    tx /= len;
    ty /= len;

    const wob = (hash11(i * 7.1 + seed * 5.9) - 0.5) * Math.min(0.85, baseW * 0.22);
    const nx = -ty * (w * 0.5) + -ty * wob;
    const ny = tx * (w * 0.5) + tx * wob;
    left.push({ x: pts[i].x + nx, y: pts[i].y + ny });
    right.push({ x: pts[i].x - nx, y: pts[i].y - ny });
  }

  ctx.fillStyle = color;
  ctx.beginPath();
  // Angled chisel entry nib (入木)
  ctx.moveTo(left[0].x, left[0].y);
  for (let i = 1; i < n; i++) ctx.lineTo(left[i].x, left[i].y);
  for (let i = n - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
  ctx.closePath();
  ctx.fill();
}

/**
 * Hand-carved irregular woodblock rectangular border (replaces geometric strokeRect / roundRect!).
 */
function drawCarvedRectBorder(ctx, x, y, w, h, thickness = 2.6, color = '#171512', seed = 3) {
  const tl = { x, y };
  const tr = { x: x + w, y: y + 0.4 };
  const br = { x: x + w - 0.3, y: y + h };
  const bl = { x: x + 0.3, y: y + h - 0.3 };
  drawCarvedKeyblockCurve(ctx, sampleQuad(tl, { x: x + w * 0.5, y: y - 0.4 }, tr, 8), thickness * 0.92, thickness * 1.08, thickness * 0.95, color, seed);
  drawCarvedKeyblockCurve(ctx, sampleQuad(tr, { x: x + w + 0.4, y: y + h * 0.5 }, br, 10), thickness, thickness * 1.06, thickness * 0.92, color, seed + 1);
  drawCarvedKeyblockCurve(ctx, sampleQuad(br, { x: x + w * 0.5, y: y + h + 0.4 }, bl, 8), thickness * 0.95, thickness * 1.1, thickness, color, seed + 2);
  drawCarvedKeyblockCurve(ctx, sampleQuad(bl, { x: x - 0.4, y: y + h * 0.5 }, tl, 10), thickness, thickness * 1.05, thickness * 0.94, color, seed + 3);
}

/**
 * Hand-carved organic irregular oval/circle polygon (replaces geometric ctx.arc / ctx.ellipse!).
 */
function traceOrganicLoop(ctx, cx, cy, rx, ry, rot = 0, steps = 16, irreg = 0.06, seed = 1) {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const rMod = 1 + Math.sin(a * 3 + seed * 2.1) * irreg + Math.cos(a * 5 - seed * 1.3) * (irreg * 0.65);
    const lx = Math.cos(a) * rx * rMod;
    const ly = Math.sin(a) * ry * rMod;
    const px = cx + lx * c - ly * s;
    const py = cy + lx * s + ly * c;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/**
 * Executes `fn` as an authentic Ukiyo-e color woodblock impression with `multiply` overprinting
 * and micro-misregistration (`版ズレ`).
 */
function withColorPlate(ctx, plateOffset, alpha, fn) {
  ctx.save();
  ctx.translate(plateOffset.dx, plateOffset.dy);
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = alpha;
  fn();
  ctx.restore();
}

/**
 * Draws authentic Hiroshige irregular woodblock black-pine needle cluster (参差聚散的木版墨针团簇)
 * with color-plate offset (`版ズレ`) between mineral green pad and sumi needle bursts!
 */
function drawHiroshigePineFoliage(ctx, cx, cy, rx, ry, leanAngle, seed = 1, breathDx = 0, breathDy = 0) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(leanAngle);

  // 1. Misregistered mineral-green woodblock color pad (草緑色版 + multiply 叠印)
  ctx.save();
  ctx.translate(PLATE_OFFSETS.green.dx + breathDx, PLATE_OFFSETS.green.dy + breathDy);
  ctx.globalCompositeOperation = 'multiply';
  const lobes = [
    { dx: -rx * 0.52, dy: ry * 0.14, lx: rx * 0.48, ly: ry * 0.56, col: '#3d6344' },
    { dx: 0, dy: -ry * 0.22, lx: rx * 0.62, ly: ry * 0.68, col: '#4e784f' },
    { dx: rx * 0.48, dy: ry * 0.18, lx: rx * 0.44, ly: ry * 0.52, col: '#385c3f' },
    { dx: -rx * 0.22, dy: -ry * 0.06, lx: rx * 0.46, ly: ry * 0.54, col: '#648a58' },
    { dx: rx * 0.20, dy: -ry * 0.12, lx: rx * 0.42, ly: ry * 0.48, col: '#739660' },
  ];
  for (const lb of lobes) {
    ctx.fillStyle = lb.col;
    ctx.beginPath();
    const steps = 15;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const jag = 1 + 0.18 * Math.sin(a * 5 + seed * 1.7) + 0.11 * Math.cos(a * 8 - seed);
      const px = lb.dx + Math.cos(a) * lb.lx * jag;
      const py = lb.dy + Math.sin(a) * lb.ly * jag * (Math.sin(a) > 0 ? 0.54 : 1.12);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 2. Asymmetric gouged sumi pine-needle bursts (松葉墨針簇 — tapered chisel triangles, not blunt lines!)
  const hubs = [
    { hx: -rx * 0.56, hy: ry * 0.26, r: rx * 0.50, a0: Math.PI * 0.92, a1: Math.PI * 1.88, n: 15 },
    { hx: -rx * 0.16, hy: ry * 0.10, r: rx * 0.60, a0: Math.PI * 0.98, a1: Math.PI * 2.02, n: 19 },
    { hx: rx * 0.28, hy: ry * 0.14, r: rx * 0.54, a0: Math.PI * 1.08, a1: Math.PI * 2.14, n: 16 },
    { hx: rx * 0.58, hy: ry * 0.30, r: rx * 0.42, a0: Math.PI * 1.22, a1: Math.PI * 2.18, n: 12 },
  ];

  for (let hIdx = 0; hIdx < hubs.length; hIdx++) {
    const hb = hubs[hIdx];
    drawCarvedKeyblockCurve(
      ctx,
      [
        { x: hb.hx * 0.35, y: ry * 0.44 },
        { x: hb.hx * 0.72, y: hb.hy + 7 },
        { x: hb.hx, y: hb.hy + 2 },
      ],
      2.5,
      2.0,
      1.3,
      '#171411',
      seed + hIdx
    );

    ctx.fillStyle = '#141914';
    for (let i = 0; i < hb.n; i++) {
      const u = i / (hb.n - 1);
      const jitterA = Math.sin(i * 3.7 + seed + hIdx) * 0.055;
      const a = lerp(hb.a0, hb.a1, u) + jitterA;
      const lenMul = 0.68 + 0.40 * Math.abs(Math.sin(i * 2.3 + hIdx * 1.9 + seed));
      const rIn = hb.r * (0.09 + (i % 3) * 0.055);
      const rOut = hb.r * lenMul;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const halfBase = i % 3 === 0 ? 1.15 : 0.82;
      const x0 = hb.hx + ca * rIn;
      const y0 = hb.hy + sa * rIn;
      ctx.beginPath();
      ctx.moveTo(x0 - sa * halfBase, y0 + ca * halfBase);
      ctx.lineTo(hb.hx + ca * rOut, hb.hy + sa * rOut);
      ctx.lineTo(x0 + sa * halfBase, y0 - ca * halfBase);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Draws a sinuous, gnarled Kuromatsu pine trunk with tortoise-shell bark scales & `版ズレ` ochre/umber plates.
 */
function drawGnarledPineTrunk(ctx, curvePts, baseW, tipW, rng) {
  const n = curvePts.length;
  const leftEdge = [];
  const rightEdge = [];
  const shadeEdge = [];

  for (let i = 0; i < n; i++) {
    const u = i / (n - 1);
    const knotBulge = 1 + 0.15 * Math.sin(u * Math.PI * 5.2) + 0.09 * Math.cos(u * Math.PI * 9);
    const w = lerp(baseW, tipW, Math.pow(u, 0.82)) * knotBulge;
    const pPrev = curvePts[Math.max(0, i - 1)];
    const pNext = curvePts[Math.min(n - 1, i + 1)];
    let tx = pNext.x - pPrev.x;
    let ty = pNext.y - pPrev.y;
    const len = Math.hypot(tx, ty) || 1;
    tx /= len;
    ty /= len;
    const nx = -ty;
    const ny = tx;

    leftEdge.push({ x: curvePts[i].x + nx * w * 0.5, y: curvePts[i].y + ny * w * 0.5 });
    rightEdge.push({ x: curvePts[i].x - nx * w * 0.5, y: curvePts[i].y - ny * w * 0.5 });
    shadeEdge.push({ x: curvePts[i].x - nx * w * 0.08, y: curvePts[i].y - ny * w * 0.08 });
  }

  // Ochre-bark color block (版ズレ offset)
  withColorPlate(ctx, PLATE_OFFSETS.ochre, 0.94, () => {
    ctx.fillStyle = '#9c6c44';
    ctx.beginPath();
    ctx.moveTo(leftEdge[0].x, leftEdge[0].y);
    for (let i = 1; i < n; i++) ctx.lineTo(leftEdge[i].x, leftEdge[i].y);
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(rightEdge[i].x, rightEdge[i].y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#6b472b';
    ctx.beginPath();
    ctx.moveTo(shadeEdge[0].x, shadeEdge[0].y);
    for (let i = 1; i < n; i++) ctx.lineTo(shadeEdge[i].x, shadeEdge[i].y);
    for (let i = n - 1; i >= 0; i--) ctx.lineTo(rightEdge[i].x, rightEdge[i].y);
    ctx.closePath();
    ctx.fill();
  });

  // Keyblock outlines & irregular angular tortoise-shell bark fissures (亀甲樹皮)
  drawCarvedKeyblockCurve(ctx, leftEdge, 3.3, 2.8, 1.7, '#161310', 11);
  drawCarvedKeyblockCurve(ctx, rightEdge, 3.5, 3.0, 1.8, '#161310', 17);

  for (let i = 1; i < n - 2; i += 2) {
    const u = i / (n - 1);
    const w = lerp(baseW, tipW, Math.pow(u, 0.82));
    if (w < 9) continue;
    const c = curvePts[i];
    const ox = c.x + (rng() - 0.5) * w * 0.26;
    const oy = c.y;
    const rx = w * 0.22;
    const ry = w * 0.34;
    drawCarvedKeyblockCurve(
      ctx,
      [
        { x: ox - rx * 0.5, y: oy - ry },
        { x: ox + rx, y: oy - ry * 0.35 },
        { x: ox + rx * 0.8, y: oy + ry * 0.65 },
        { x: ox - rx * 0.6, y: oy + ry },
      ],
      1.2,
      1.75,
      1.1,
      'rgba(22, 19, 16, 0.78)',
      i + 3
    );
  }
}

/**
 * Pre-bakes tapered woodblock spindle rain streaks (しのぎ彫り枣核刻槽雨丝: Sumi, Bero-ai, and Washi gouge).
 */
function getRainSpriteSheet(kit) {
  return kit.bake2D('s11_rain_spindles_r3', (_g, ctx, rng) => {
    const styles = [
      { col: '#14171a', drySkip: 0.14 }, // Plate 0: Deep Sumi keyblock rain
      { col: '#23282e', drySkip: 0.24 }, // Plate 1: Dry-rubbed grey Sumi rain
      { col: '#faf3e3', drySkip: 0.18 }, // Plate 2: Raw Washi gouged white rain (きめ出し/白抜き)
      { col: '#183f6b', drySkip: 0.20 }, // Plate 3: Bero-ai Prussian-blue rain
    ];
    for (let sIdx = 0; sIdx < styles.length; sIdx++) {
      const st = styles[sIdx];
      const cy = 8 + sIdx * 14;
      ctx.fillStyle = st.col;
      // Draw tapered spindle from x=2 to x=254 with subtle woodgrain breaks
      const segs = 28;
      for (let k = 0; k < segs; k++) {
        if (k > 3 && k < segs - 3 && rng() < st.drySkip) continue;
        const u0 = k / segs;
        const u1 = (k + 0.92) / segs;
        const x0 = 2 + u0 * 252;
        const x1 = 2 + u1 * 252;
        const w0 = Math.sin(u0 * Math.PI) * (sIdx === 0 ? 1.55 : 1.25);
        const w1 = Math.sin(u1 * Math.PI) * (sIdx === 0 ? 1.55 : 1.25);
        ctx.beginPath();
        ctx.moveTo(x0, cy - w0);
        ctx.lineTo(x1, cy - w1);
        ctx.lineTo(x1, cy + w1);
        ctx.lineTo(x0, cy + w0);
        ctx.closePath();
        ctx.fill();
      }
    }
  }, 256, 60);
}

/**
 * Bakes the 1000x1000 Authentic Hōeidō Ukiyo-e Woodblock Substrate & Tōkaidō Landscape.
 */
function getUkiyoeBackdrop(kit) {
  return kit.bake2D('s11_ukiyoe_backdrop_r3', (_g, ctx, rng, w, h) => {
    // Helper: hand-rubbed mineral bokashi band (replaces clean CSS gradients with fibrous pigment speckle!)
    const paintBokashiStrip = (y0, y1, r, gCol, b, aStart, aEnd, bands = 38) => {
      const span = y1 - y0;
      const bh = span / bands;
      for (let i = 0; i < bands; i++) {
        const u = (i + 0.5) / bands;
        const a = lerp(aStart, aEnd, Math.pow(u, 1.12)) * (0.93 + rng() * 0.14);
        if (a <= 0.003) continue;
        ctx.fillStyle = `rgba(${r}, ${gCol}, ${b}, ${a.toFixed(4)})`;
        ctx.fillRect(-4, y0 + i * bh - 0.8, w + 8, bh + 1.8);
      }
    };

    // Helper: feathered boneless Kasumi mist wipe (当てなしぼかし霞雲 — ZERO roundRect!)
    const paintFeatheredKasumi = (cx, cy, halfW, halfH) => {
      ctx.save();
      for (let layer = 0; layer < 7; layer++) {
        const k = 1 - layer * 0.11;
        const lx = halfW * k;
        const ly = halfH * (0.55 + 0.45 * k);
        ctx.fillStyle = `rgba(245, 235, 213, ${(0.18 + layer * 0.04).toFixed(3)})`;
        ctx.beginPath();
        const steps = 22;
        for (let i = 0; i <= steps; i++) {
          const a = (i / steps) * Math.PI * 2;
          const feather = 1 + 0.14 * Math.sin(a * 3 + layer) + 0.08 * Math.cos(a * 7);
          const px = cx + Math.cos(a) * lx * feather;
          const py = cy + Math.sin(a) * ly * (1 + 0.12 * Math.sin(a * 4));
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    };

    // 1. Raw Fibrous Echizen Hosho Washi Substrate (越前奉書紙: warm mulberry tone, deckle fibers & laid lines)
    ctx.fillStyle = '#efe1c4';
    ctx.fillRect(0, 0, w, h);

    // Subtle organic sizing blotches (礬水 Dosa uneven absorption — irregular polygons, no crisp circles)
    for (let i = 0; i < 260; i++) {
      const px = rng() * w;
      const py = rng() * h;
      const pr = 16 + rng() * 54;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 250, 238, 0.13)' : 'rgba(188, 162, 124, 0.09)';
      traceOrganicLoop(ctx, px, py, pr, pr * (0.65 + rng() * 0.5), rng() * 3.14, 10, 0.18, i);
      ctx.fill();
    }

    // Horizontal bamboo screen laid-lines (簀の目 Su-no-me)
    for (let y = 2; y < h; y += 4) {
      ctx.fillStyle = y % 8 === 0 ? 'rgba(255, 251, 242, 0.12)' : 'rgba(138, 112, 76, 0.038)';
      ctx.fillRect(0, y, w, 1.1);
    }

    // Mulberry bark fibers (楮繊維) embedded in handmade washi
    ctx.lineCap = 'round';
    for (let i = 0; i < 780; i++) {
      const fx = rng() * w;
      const fy = rng() * h;
      const flen = 5 + rng() * 22;
      const fang = rng() * Math.PI * 2;
      ctx.strokeStyle =
        i % 5 === 0
          ? 'rgba(136, 108, 72, 0.24)'
          : i % 2 === 0
          ? 'rgba(255, 252, 244, 0.40)'
          : 'rgba(178, 154, 118, 0.22)';
      ctx.lineWidth = i % 5 === 0 ? 1.25 : 0.72;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo(
        fx + Math.cos(fang + 0.35) * flen * 0.5,
        fy + Math.sin(fang + 0.35) * flen * 0.5,
        fx + Math.cos(fang) * flen,
        fy + Math.sin(fang) * flen
      );
      ctx.stroke();
    }

    const M_TOP = 18;
    const M_BOT = 18;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, M_TOP, w, h - M_TOP - M_BOT);
    ctx.clip();

    // 2. Signature Bero-Ai Prussian-Blue Ichimonji Bokashi & Beni-Red Horizon Wipe (Multi-plate multiply!)
    withColorPlate(ctx, PLATE_OFFSETS.blue, 0.96, () => {
      paintBokashiStrip(M_TOP, 228, 13, 46, 88, 0.92, 0.0, 48);
      paintBokashiStrip(M_TOP, 96, 8, 28, 60, 0.45, 0.0, 24);
    });
    withColorPlate(ctx, PLATE_OFFSETS.beni, 0.92, () => {
      paintBokashiStrip(318, 412, 196, 82, 56, 0.0, 0.44, 28);
      paintBokashiStrip(412, 456, 196, 82, 56, 0.44, 0.14, 16);
    });

    // 3. Cherrywood Mountain-Ring Woodgrain (桜板の山形木目 Mokume) + Spiral Baren Rubbing Tracks (馬連筋)!
    ctx.save();
    for (let y = M_TOP; y < 612; y += 2.6) {
      const dy1 = (y - 104) * 3.0;
      const dy2 = (y - 492) * 2.7;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 20) {
        const ring1 = Math.sin(Math.hypot((x - 582) * 0.21, dy1) * 0.14 + Math.sin(x * 0.013) * 1.5);
        const ring2 = Math.sin(Math.hypot((x - 285) * 0.19, dy2) * 0.16);
        const wy = y + ring1 * 2.1 + ring2 * 1.25;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      const inBlueTop = clamp(1 - (y - M_TOP) / 205, 0, 1);
      const inBeni = smoothstep(330, 410, y) * (1 - smoothstep(430, 465, y));
      const inWater = smoothstep(442, 475, y) * (1 - smoothstep(580, 610, y));
      const grainAlpha = 0.052 + 0.075 * Math.max(inBlueTop, inBeni * 0.8, inWater);
      ctx.strokeStyle =
        Math.round(y * 10) % 2 === 0
          ? `rgba(249, 240, 221, ${grainAlpha.toFixed(3)})`
          : `rgba(18, 44, 74, ${(grainAlpha * 0.78).toFixed(3)})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Authentic circular/spiral Baren bamboo-sheath rubbing tracks (馬連の摺り跡) across sky & bay!
    for (let b = 0; b < 190; b++) {
      const bx = rng() * w;
      const by = M_TOP + rng() * 575;
      const br = 24 + rng() * 44;
      const a0 = rng() * Math.PI * 2;
      const span = 0.7 + rng() * 1.3;
      ctx.strokeStyle =
        b % 2 === 0 ? 'rgba(252, 245, 230, 0.055)' : 'rgba(20, 38, 62, 0.042)';
      ctx.lineWidth = 1.35;
      ctx.beginPath();
      for (let s = 0; s <= 10; s++) {
        const a = a0 + (s / 10) * span;
        const rSpiral = br + s * 0.45;
        const px = bx + Math.cos(a) * rSpiral;
        const py = by + Math.sin(a) * rSpiral * 0.62;
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();

    // 4. Serene Snow-Capped Mt. Fuji (#85 Upgraded: Dendritic Snow-Ravines 雪渓 + Horizontal Mokume Slope — ZERO straight zigzags!)
    const fujiCx = 586;
    const fujiTopY = 198;
    const fujiBaseY = 450;

    const fujiLeftCurve = [];
    const fujiRightCurve = [];
    for (let i = 0; i <= 28; i++) {
      const u = i / 28;
      const py = lerp(fujiTopY, fujiBaseY, u);
      const spreadL = 29 + 272 * Math.pow(u, 1.48) + Math.sin(u * 9) * 1.2;
      const spreadR = 31 + 262 * Math.pow(u, 1.44) + Math.cos(u * 8) * 1.1;
      fujiLeftCurve.push({ x: fujiCx - spreadL, y: py });
      fujiRightCurve.push({ x: fujiCx + spreadR, y: py });
    }

    // Trace Fuji's full mountain silhouette path helper
    const traceFujiBody = () => {
      ctx.beginPath();
      ctx.moveTo(fujiLeftCurve[0].x, fujiLeftCurve[0].y + 3);
      ctx.lineTo(fujiCx - 12, fujiTopY - 2.5);
      ctx.lineTo(fujiCx - 2, fujiTopY + 1.5);
      ctx.lineTo(fujiCx + 10, fujiTopY - 1.0);
      ctx.lineTo(fujiRightCurve[0].x, fujiRightCurve[0].y + 2);
      for (let i = 1; i < fujiRightCurve.length; i++) ctx.lineTo(fujiRightCurve[i].x, fujiRightCurve[i].y);
      for (let i = fujiLeftCurve.length - 1; i >= 0; i--) ctx.lineTo(fujiLeftCurve[i].x, fujiLeftCurve[i].y);
      ctx.closePath();
    };

    // Prussian-blue Fuji body block with `版ズレ` offset & organic dendritic snow-reserve boundary!
    withColorPlate(ctx, PLATE_OFFSETS.blue, 0.94, () => {
      ctx.save();
      traceFujiBody();
      ctx.clip();

      // Layered hand-wiped Prussian-blue & slate-indigo mineral washes below the snow cap
      paintBokashiStrip(244, 345, 28, 66, 104, 0.88, 0.72, 28);
      paintBokashiStrip(345, fujiBaseY, 38, 74, 108, 0.72, 0.24, 24);

      // Carve organic dendritic snow-ravines (不规则分叉雪溪留白) down from the summit!
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.beginPath();
      ctx.moveTo(fujiCx - 120, fujiTopY - 10);
      ctx.lineTo(fujiCx + 120, fujiTopY - 10);
      ctx.lineTo(fujiRightCurve[7].x + 6, fujiRightCurve[7].y);
      // Organic sinuous branching snow tongues (雪渓の舌) — curved & irregular, zero straight折尺!
      const snowRavines = [
        { cx: 56, cy: 266, tx: 66, ty: 304 },
        { cx: 48, cy: 274, tx: 39, ty: 264 },
        { cx: 33, cy: 288, tx: 31, ty: 326 },
        { cx: 21, cy: 292, tx: 14, ty: 274 },
        { cx: 6, cy: 298, tx: 3, ty: 338 },
        { cx: -7, cy: 296, tx: -13, ty: 276 },
        { cx: -21, cy: 302, tx: -26, ty: 332 },
        { cx: -35, cy: 288, tx: -42, ty: 270 },
        { cx: -52, cy: 286, tx: -65, ty: 312 },
        { cx: -66, cy: 274, tx: -76, ty: 262 },
      ];
      for (const rv of snowRavines) {
        ctx.quadraticCurveTo(fujiCx + rv.cx, rv.cy, fujiCx + rv.tx, rv.ty);
      }
      ctx.quadraticCurveTo(fujiLeftCurve[7].x + 4, fujiLeftCurve[7].y + 8, fujiLeftCurve[6].x - 6, fujiLeftCurve[6].y);
      ctx.closePath();
      ctx.fill();

      // Secondary fine forked snow-gullies extending down the indigo slopes!
      const snowForks = [
        [
          { x: fujiCx + 64, y: 296 },
          { x: fujiCx + 80, y: 324 },
          { x: fujiCx + 96, y: 348 },
        ],
        [
          { x: fujiCx + 30, y: 318 },
          { x: fujiCx + 38, y: 346 },
          { x: fujiCx + 49, y: 372 },
        ],
        [
          { x: fujiCx + 3, y: 330 },
          { x: fujiCx + 5, y: 360 },
          { x: fujiCx + 1, y: 384 },
        ],
        [
          { x: fujiCx - 25, y: 324 },
          { x: fujiCx - 35, y: 352 },
          { x: fujiCx - 48, y: 378 },
        ],
        [
          { x: fujiCx - 62, y: 304 },
          { x: fujiCx - 80, y: 332 },
          { x: fujiCx - 98, y: 356 },
        ],
      ];
      for (const fk of snowForks) {
        drawCarvedKeyblockCurve(ctx, sampleQuad(fk[0], fk[1], fk[2], 10), 6.5, 3.4, 0.7, 'rgba(0,0,0,1)', 9);
      }

      // Prominent horizontal cherrywood woodgrain bands (靛蓝山体横向木目摺纹!) across Fuji's indigo flanks!
      ctx.globalCompositeOperation = 'destination-out';
      for (let my = 258; my < fujiBaseY - 12; my += 5.5) {
        ctx.strokeStyle = `rgba(0, 0, 0, ${(0.08 + 0.10 * Math.sin(my * 0.27 + 1.2)).toFixed(3)})`;
        ctx.lineWidth = 1.35;
        ctx.beginPath();
        for (let mx = fujiCx - 260; mx <= fujiCx + 260; mx += 18) {
          const wave = Math.sin((mx - fujiCx) * 0.025 + Math.sin(my * 0.09) * 2.2) * 2.4;
          if (mx === fujiCx - 260) ctx.moveTo(mx, my + wave);
          else ctx.lineTo(mx, my + wave);
        }
        ctx.stroke();
      }
      ctx.restore();
    });

    // Subtle Gofun white mineral pigment highlights on Fuji's summit snow ridges
    ctx.fillStyle = 'rgba(253, 250, 242, 0.72)';
    ctx.beginPath();
    ctx.moveTo(fujiLeftCurve[0].x + 1, fujiLeftCurve[0].y + 2);
    ctx.lineTo(fujiCx - 12, fujiTopY - 2);
    ctx.lineTo(fujiCx + 10, fujiTopY - 1);
    ctx.lineTo(fujiRightCurve[5].x - 2, fujiRightCurve[5].y);
    ctx.quadraticCurveTo(fujiCx + 18, 286, fujiCx - 2, 314);
    ctx.quadraticCurveTo(fujiCx - 28, 282, fujiLeftCurve[5].x + 2, fujiLeftCurve[5].y);
    ctx.closePath();
    ctx.fill();

    // Carved Sumi keyblock ridges & snow-ravine contour fissures on Mt. Fuji
    drawCarvedKeyblockCurve(ctx, fujiLeftCurve, 2.3, 2.9, 1.1, '#1c232a', 21);
    drawCarvedKeyblockCurve(ctx, fujiRightCurve, 2.3, 2.8, 1.1, '#1c232a', 22);
    drawCarvedKeyblockCurve(
      ctx,
      [
        { x: fujiLeftCurve[0].x, y: fujiLeftCurve[0].y + 3 },
        { x: fujiCx - 12, y: fujiTopY - 2.5 },
        { x: fujiCx - 1, y: fujiTopY + 1.8 },
        { x: fujiCx + 10, y: fujiTopY - 1.0 },
        { x: fujiRightCurve[0].x, y: fujiRightCurve[0].y + 2 },
      ],
      2.1,
      2.5,
      2.1,
      '#1c232a',
      23
    );
    // Internal carved volcanic ridge crevices (宝永山・雪渓墨筋)
    drawCarvedKeyblockCurve(
      ctx,
      sampleQuad({ x: fujiCx - 15, y: fujiTopY + 12 }, { x: fujiCx - 30, y: 274 }, { x: fujiCx - 66, y: 356 }, 12),
      1.7,
      1.9,
      0.7,
      'rgba(28, 35, 42, 0.72)',
      24
    );
    drawCarvedKeyblockCurve(
      ctx,
      sampleQuad({ x: fujiCx + 11, y: fujiTopY + 14 }, { x: fujiCx + 27, y: 278 }, { x: fujiCx + 58, y: 352 }, 12),
      1.6,
      1.8,
      0.7,
      'rgba(28, 35, 42, 0.68)',
      25
    );
    drawCarvedKeyblockCurve(
      ctx,
      sampleQuad({ x: fujiCx + 2, y: fujiTopY + 22 }, { x: fujiCx - 3, y: 288 }, { x: fujiCx + 6, y: 344 }, 10),
      1.3,
      1.5,
      0.6,
      'rgba(28, 35, 42, 0.55)',
      26
    );

    // Distant Izu / Suruga Foothills in indigo-grey wash + boneless feathered Kasumi mist bands
    withColorPlate(ctx, PLATE_OFFSETS.blue, 0.62, () => {
      ctx.fillStyle = '#58758c';
      ctx.beginPath();
      ctx.moveTo(0, 454);
      ctx.quadraticCurveTo(108, 410, 224, 436);
      ctx.quadraticCurveTo(312, 419, 398, 448);
      ctx.lineTo(858, 448);
      ctx.quadraticCurveTo(936, 422, 1000, 438);
      ctx.lineTo(1000, 460);
      ctx.lineTo(0, 460);
      ctx.closePath();
      ctx.fill();
    });

    paintFeatheredKasumi(422, 416, 128, 8.5);
    paintFeatheredKasumi(638, 430, 168, 9.5);
    paintFeatheredKasumi(764, 399, 112, 7.8);

    // 5. Suruga Bay Waters, Miho Pine Sandspit & Irregular Woodblock Wave-Claws (#85: ZERO uniform semicircle arcs!)
    withColorPlate(ctx, PLATE_OFFSETS.blue, 0.94, () => {
      paintBokashiStrip(446, 492, 34, 82, 128, 0.86, 0.36, 20);
      paintBokashiStrip(492, 548, 88, 134, 168, 0.36, 0.16, 18);
      paintBokashiStrip(548, 598, 22, 68, 114, 0.24, 0.90, 22);
    });

    // Miho-no-Matsubara distant pine spit (irregular organic tree tufts, zero geometric arcs!)
    withColorPlate(ctx, PLATE_OFFSETS.green, 0.88, () => {
      ctx.fillStyle = '#435d52';
      ctx.beginPath();
      ctx.moveTo(466, 467);
      ctx.lineTo(786, 462);
      ctx.lineTo(816, 469);
      ctx.lineTo(460, 470);
      ctx.closePath();
      ctx.fill();
      for (let px = 480; px < 782; px += 7 + ((px * 5) % 6)) {
        const ph = 4.5 + ((px * 13) % 7);
        ctx.fillStyle = px % 2 === 0 ? '#2a453b' : '#385748';
        traceOrganicLoop(ctx, px, 463 - ph * 0.35, ph * 0.72, ph * 0.52, -0.1, 8, 0.22, px);
        ctx.fill();
      }
    });

    // Carved woodblock water-ripple lines (水紋)
    for (let wy = 475; wy < 576; wy += 9) {
      for (let s = 0; s < 6; s++) {
        const sx = ((wy * 23 + s * 173) % 960) - 20;
        const sw = 44 + ((wy * 7 + s * 31) % 72);
        drawCarvedKeyblockCurve(
          ctx,
          sampleQuad({ x: sx, y: wy }, { x: sx + sw * 0.48, y: wy - 1.9 }, { x: sx + sw, y: wy + 0.3 }, 8),
          0.6,
          1.35,
          0.6,
          'rgba(20, 52, 86, 0.42)',
          wy + s
        );
      }
    }

    // Authentic Hiroshige/Hokusai Irregular Cresting Shore Wave-Claws (高低参差的木版浪爪 — #85 fix!)
    const waveCrests = [];
    let wxCursor = -12;
    let wSeed = 1;
    while (wxCursor < w + 24) {
      const spanW = 24 + hash11(wSeed * 3.1) * 38; // Irregular widths 24..62px!
      const crestH = 7 + hash11(wSeed * 7.7) * 15; // Asymmetric wave heights 7..22px!
      const skew = -6 + hash11(wSeed * 11.3) * 10;
      waveCrests.push({ x0: wxCursor, x1: wxCursor + spanW, h: crestH, skew, seed: wSeed });
      wxCursor += spanW - 3;
      wSeed++;
    }

    // Raw Washi & Gofun foam body with jagged claw fingers
    ctx.fillStyle = '#fbf5e7';
    ctx.beginPath();
    ctx.moveTo(-15, 604);
    for (const wc of waveCrests) {
      const xm = (wc.x0 + wc.x1) * 0.5 + wc.skew;
      const topY = 591 - wc.h;
      ctx.quadraticCurveTo(wc.x0 + (xm - wc.x0) * 0.45, topY + wc.h * 0.35, xm - 3, topY);
      // 3 jagged foam claws (浪爪) per wave crest!
      ctx.lineTo(xm + 1, topY + 3.8);
      ctx.lineTo(xm + 6, topY - 1.8);
      ctx.lineTo(xm + 9, topY + 4.5);
      ctx.lineTo(xm + 13, topY + 1.2);
      ctx.quadraticCurveTo(wc.x1 - 4, 590, wc.x1, 593);
    }
    ctx.lineTo(w + 20, 604);
    ctx.closePath();
    ctx.fill();

    // Prussian-blue undertow striated ribs inside curling wave hollows + carved indigo wave-claw keylines!
    for (const wc of waveCrests) {
      const xm = (wc.x0 + wc.x1) * 0.5 + wc.skew;
      const topY = 591 - wc.h;
      drawCarvedKeyblockCurve(
        ctx,
        [
          { x: wc.x0, y: 593 },
          { x: xm - 5, y: topY + 2 },
          { x: xm - 2, y: topY },
          { x: xm + 2, y: topY + 4 },
        ],
        1.1,
        1.9,
        1.0,
        '#193b61',
        wc.seed
      );
      drawCarvedKeyblockCurve(
        ctx,
        [
          { x: xm + 4, y: topY + 2 },
          { x: xm + 7, y: topY - 1.5 },
          { x: wc.x1 - 4, y: 590 },
          { x: wc.x1, y: 593 },
        ],
        1.2,
        1.7,
        0.9,
        '#193b61',
        wc.seed + 50
      );
      // Foam spray droplets (飛沫) above taller breakers
      if (wc.h > 14) {
        ctx.fillStyle = '#fbf5e7';
        traceOrganicLoop(ctx, xm - 5, topY - 4.5, 2.2, 1.7, 0.3, 7, 0.25, wc.seed);
        ctx.fill();
        traceOrganicLoop(ctx, xm + 8, topY - 5.5, 1.8, 1.5, -0.4, 7, 0.25, wc.seed + 9);
        ctx.fill();
      }
    }

    // Left Satta-Pass coastal crag with `版ズレ` ochre/green blocks & axe-cut rock wrinkles
    withColorPlate(ctx, PLATE_OFFSETS.ochre, 0.92, () => {
      ctx.fillStyle = '#9c7f50';
      ctx.beginPath();
      ctx.moveTo(0, 398);
      ctx.bezierCurveTo(64, 405, 108, 452, 146, 528);
      ctx.quadraticCurveTo(168, 568, 192, 598);
      ctx.lineTo(0, 604);
      ctx.closePath();
      ctx.fill();
    });
    withColorPlate(ctx, PLATE_OFFSETS.green, 0.72, () => {
      ctx.fillStyle = '#506e4b';
      ctx.beginPath();
      ctx.moveTo(0, 398);
      ctx.bezierCurveTo(56, 404, 96, 444, 122, 496);
      ctx.quadraticCurveTo(60, 492, 0, 515);
      ctx.closePath();
      ctx.fill();
    });
    drawCarvedKeyblockCurve(
      ctx,
      sampleCubic({ x: 0, y: 398 }, { x: 72, y: 408 }, { x: 124, y: 486 }, { x: 192, y: 598 }, 18),
      3.1,
      3.7,
      2.0,
      '#1a1815',
      31
    );
    for (let k = 0; k < 9; k++) {
      const rx = 16 + k * 17;
      const ry = 426 + k * 18.5;
      drawCarvedKeyblockCurve(
        ctx,
        sampleQuad({ x: rx, y: ry }, { x: rx - 9, y: ry + 16 }, { x: rx - 16, y: ry + 35 }, 8),
        2.1,
        1.6,
        0.8,
        'rgba(26, 24, 21, 0.62)',
        40 + k
      );
    }

    // 6. Midground Grassy Verge, Ichirizuka Mound & Hand-Carved Bamboo Fence
    withColorPlate(ctx, PLATE_OFFSETS.green, 0.94, () => {
      ctx.fillStyle = '#536f49';
      ctx.beginPath();
      ctx.moveTo(0, 596);
      ctx.quadraticCurveTo(180, 578, 340, 598);
      ctx.quadraticCurveTo(560, 608, 760, 590);
      ctx.quadraticCurveTo(900, 582, 1000, 595);
      ctx.lineTo(1000, 650);
      ctx.lineTo(0, 650);
      ctx.closePath();
      ctx.fill();
    });
    drawCarvedKeyblockCurve(
      ctx,
      [
        { x: 0, y: 596 },
        { x: 175, y: 586 },
        { x: 340, y: 598 },
        { x: 560, y: 604 },
        { x: 760, y: 590 },
        { x: 1000, y: 595 },
      ],
      2.2,
      2.6,
      2.1,
      '#1c1a16',
      51
    );

    // Ichirizuka earthen mound & Edo wooden milestone post (一里塚) at x = 216 (zero strokeRect / roundRect!)
    const postX = 216;
    const postBaseY = 628;
    withColorPlate(ctx, PLATE_OFFSETS.green, 0.92, () => {
      ctx.fillStyle = '#4b6642';
      traceOrganicLoop(ctx, postX, postBaseY + 6, 36, 22, 0, 14, 0.09, 61);
      ctx.fill();
    });
    drawCarvedKeyblockCurve(
      ctx,
      sampleCubic({ x: postX - 36, y: postBaseY + 6 }, { x: postX - 24, y: postBaseY - 18 }, { x: postX + 24, y: postBaseY - 18 }, { x: postX + 36, y: postBaseY + 6 }, 14),
      2.3,
      2.6,
      2.2,
      '#1b1916',
      62
    );

    for (let sx = -30; sx <= 22; sx += 13) {
      ctx.fillStyle = '#9ea19c';
      traceOrganicLoop(ctx, postX + sx + 6, postBaseY + 2.5, 6.2, 4.6, 0.08, 9, 0.14, sx + 90);
      ctx.fill();
      ctx.strokeStyle = '#1b1916';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }

    withColorPlate(ctx, PLATE_OFFSETS.ochre, 0.94, () => {
      ctx.fillStyle = '#cca56c';
      ctx.fillRect(postX - 9, postBaseY - 90, 18, 89);
    });
    drawCarvedRectBorder(ctx, postX - 9, postBaseY - 90, 18, 89, 2.3, '#191714', 65);

    ctx.fillStyle = '#5c4228';
    ctx.beginPath();
    ctx.moveTo(postX - 14, postBaseY - 88);
    ctx.lineTo(postX, postBaseY - 102);
    ctx.lineTo(postX + 14, postBaseY - 88);
    ctx.closePath();
    ctx.fill();
    drawCarvedKeyblockCurve(
      ctx,
      [
        { x: postX - 14, y: postBaseY - 88 },
        { x: postX, y: postBaseY - 102 },
        { x: postX + 14, y: postBaseY - 88 },
        { x: postX - 14, y: postBaseY - 88 },
      ],
      2.2,
      2.5,
      2.2,
      '#191714',
      69
    );

    ctx.fillStyle = '#1b1815';
    ctx.font = '700 11px "PelicanWenKai", "PelicanSerif", serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ['東', '海', '道', '拾', '里'].forEach((ch, idx) => {
      ctx.fillText(ch, postX, postBaseY - 82 + idx * 14.2);
    });

    const drawBambooFence = (x0, x1, yBase) => {
      for (let ry = yBase - 23; ry <= yBase - 9; ry += 13) {
        drawCarvedKeyblockCurve(ctx, sampleQuad({ x: x0, y: ry }, { x: (x0 + x1) * 0.5, y: ry + 0.8 }, { x: x1, y: ry }, 10), 3.0, 3.3, 2.9, '#b38e50', ry);
        drawCarvedKeyblockCurve(ctx, sampleQuad({ x: x0, y: ry + 1.4 }, { x: (x0 + x1) * 0.5, y: ry + 2.2 }, { x: x1, y: ry + 1.4 }, 10), 1.1, 1.3, 1.1, '#1b1814', ry + 1);
      }
      for (let vx = x0; vx <= x1; vx += 26) {
        drawCarvedKeyblockCurve(ctx, [{ x: vx, y: yBase - 31 }, { x: vx + 0.3, y: yBase - 14 }, { x: vx, y: yBase + 2 }], 3.5, 3.3, 3.5, '#99753c', vx);
        drawCarvedKeyblockCurve(ctx, [{ x: vx - 1.6, y: yBase - 31 }, { x: vx - 1.5, y: yBase + 2 }], 1.2, 1.3, 1.2, '#181614', vx + 2);
        // Palm-twine cross knots (棕櫚縄結び)
        ctx.fillStyle = '#181614';
        ctx.fillRect(vx - 2.6, yBase - 25, 5.2, 3.6);
        ctx.fillRect(vx - 2.6, yBase - 12, 5.2, 3.6);
      }
    };
    drawBambooFence(26, 168, 630);
    drawBambooFence(774, 972, 630);

    // 7. Sinuous Gnarled Kuromatsu Black Pine Trunks & Boughs
    drawGnarledPineTrunk(ctx, sampleCubic({ x: 120, y: 636 }, { x: 162, y: 548 }, { x: 130, y: 444 }, { x: 62, y: 346 }, 24), 32, 8, rng);
    drawGnarledPineTrunk(ctx, sampleCubic({ x: 142, y: 520 }, { x: 176, y: 470 }, { x: 216, y: 460 }, { x: 246, y: 436 }, 16), 16, 5, rng);
    drawGnarledPineTrunk(ctx, sampleCubic({ x: 110, y: 420 }, { x: 90, y: 390 }, { x: 50, y: 396 }, { x: 22, y: 380 }, 14), 13, 4.5, rng);

    drawGnarledPineTrunk(ctx, sampleCubic({ x: 858, y: 634 }, { x: 842, y: 536 }, { x: 792, y: 440 }, { x: 716, y: 372 }, 24), 30, 8, rng);
    drawGnarledPineTrunk(ctx, sampleCubic({ x: 822, y: 496 }, { x: 858, y: 452 }, { x: 896, y: 446 }, { x: 924, y: 420 }, 16), 15, 5, rng);
    drawGnarledPineTrunk(ctx, sampleCubic({ x: 778, y: 436 }, { x: 752, y: 414 }, { x: 706, y: 426 }, { x: 672, y: 416 }, 14), 12, 4.5, rng);

    // 8. Continuous Wide Tōkaidō Post Road (Strictly anchored to y=680 at x=0 and x=1000!)
    const roadTopPts = [];
    const roadBotPts = [];
    for (let x = 0; x <= w; x += 20) {
      const { y } = sampleTokaidoRoad(kit, x);
      roadTopPts.push({ x, y: y - 48 });
      roadBotPts.push({ x, y: y + 24 });
    }

    withColorPlate(ctx, PLATE_OFFSETS.ochre, 0.90, () => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(roadTopPts[0].x, roadTopPts[0].y);
      for (const p of roadTopPts) ctx.lineTo(p.x, p.y);
      for (let i = roadBotPts.length - 1; i >= 0; i--) ctx.lineTo(roadBotPts[i].x, roadBotPts[i].y);
      ctx.closePath();
      ctx.clip();

      ctx.fillStyle = '#e0cfa9';
      ctx.fillRect(0, 610, w, 110);
      paintBokashiStrip(616, 646, 146, 112, 66, 0.52, 0.0, 14);
      paintBokashiStrip(678, 710, 128, 96, 54, 0.0, 0.56, 14);
      ctx.restore();
    });

    // Organic rain-puddle washes on packed earth road (no geometric ellipse!)
    withColorPlate(ctx, PLATE_OFFSETS.blue, 0.34, () => {
      ctx.fillStyle = '#4e7391';
      traceOrganicLoop(ctx, 196, 668, 49, 4.8, -0.02, 14, 0.16, 71);
      ctx.fill();
      traceOrganicLoop(ctx, 496, 658, 64, 5.2, 0.01, 14, 0.16, 72);
      ctx.fill();
      traceOrganicLoop(ctx, 792, 666, 54, 4.8, 0.02, 14, 0.16, 73);
      ctx.fill();
    });

    drawCarvedKeyblockCurve(ctx, roadTopPts, 2.3, 2.8, 2.3, '#241f19', 75);
    drawCarvedKeyblockCurve(ctx, roadBotPts, 3.2, 3.9, 3.2, '#1a1713', 76);

    for (let i = 0; i < 420; i++) {
      const rx = rng() * w;
      const { y: ryCenter } = sampleTokaidoRoad(kit, rx);
      const ry = ryCenter - 40 + rng() * 58;
      ctx.fillStyle = i % 3 === 0 ? 'rgba(42, 34, 24, 0.36)' : 'rgba(252, 244, 226, 0.42)';
      ctx.fillRect(rx, ry, 1.6 + rng() * 2.4, 1.25);
    }

    // 9. Woven Bamboo Slope Retaining (柴垣) & Flooded Edo Terraced Rice Paddies
    const wattlingBotPts = [];
    for (let x = 0; x <= w; x += 25) {
      const { y } = sampleTokaidoRoad(kit, x);
      wattlingBotPts.push({ x, y: y + 54 + Math.sin(x * 0.014 + 0.8) * 9 });
    }
    withColorPlate(ctx, PLATE_OFFSETS.ochre, 0.94, () => {
      ctx.fillStyle = '#7c5d35';
      ctx.beginPath();
      ctx.moveTo(roadBotPts[0].x, roadBotPts[0].y);
      for (const p of roadBotPts) ctx.lineTo(p.x, p.y);
      for (let i = wattlingBotPts.length - 1; i >= 0; i--) ctx.lineTo(wattlingBotPts[i].x, wattlingBotPts[i].y);
      ctx.closePath();
      ctx.fill();
    });

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(roadBotPts[0].x, roadBotPts[0].y);
    for (const p of roadBotPts) ctx.lineTo(p.x, p.y);
    for (let i = wattlingBotPts.length - 1; i >= 0; i--) ctx.lineTo(wattlingBotPts[i].x, wattlingBotPts[i].y);
    ctx.closePath();
    ctx.clip();

    ctx.strokeStyle = 'rgba(224, 190, 128, 0.52)';
    ctx.lineWidth = 2.0;
    for (let wx = -80; wx < w + 80; wx += 16) {
      ctx.beginPath();
      ctx.moveTo(wx, 680);
      ctx.lineTo(wx + 55, 765);
      ctx.moveTo(wx + 55, 680);
      ctx.lineTo(wx, 765);
      ctx.stroke();
    }
    for (let px = 22; px < w; px += 34 + ((px * 7) % 19)) {
      const { y } = sampleTokaidoRoad(kit, px);
      ctx.fillStyle = '#3d2b19';
      ctx.fillRect(px - 3.5, y + 23, 7, 38);
      drawCarvedKeyblockCurve(ctx, [{ x: px - 3.5, y: y + 23 }, { x: px - 3.3, y: y + 61 }], 1.6, 1.5, 1.4, '#161310', px);
      drawCarvedKeyblockCurve(ctx, [{ x: px + 3.5, y: y + 23 }, { x: px + 3.4, y: y + 61 }], 1.6, 1.5, 1.4, '#161310', px + 1);
    }
    ctx.restore();
    drawCarvedKeyblockCurve(ctx, wattlingBotPts, 2.5, 3.1, 2.5, '#1b1814', 81);

    // Flooded terraced rice paddies with Prussian-blue & mineral-green bokashi
    withColorPlate(ctx, PLATE_OFFSETS.blue, 0.88, () => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(wattlingBotPts[0].x, wattlingBotPts[0].y);
      for (const p of wattlingBotPts) ctx.lineTo(p.x, p.y);
      ctx.lineTo(w, h - M_BOT);
      ctx.lineTo(0, h - M_BOT);
      ctx.closePath();
      ctx.clip();
      paintBokashiStrip(728, 865, 68, 108, 124, 0.72, 0.88, 26);
      paintBokashiStrip(865, h - M_BOT, 36, 70, 74, 0.88, 0.96, 22);
      ctx.restore();
    });

    const drawPaddyDyke = (pts, width = 15, sId = 1) => {
      drawCarvedKeyblockCurve(ctx, pts, width + 5, width + 6, width + 5, '#191713', sId);
      drawCarvedKeyblockCurve(ctx, pts, width, width + 1, width, '#5b7344', sId + 1);
      const topHighlight = pts.map((p) => ({ x: p.x + PLATE_OFFSETS.ochre.dx * 0.7, y: p.y - width * 0.18 }));
      drawCarvedKeyblockCurve(ctx, topHighlight, width * 0.45, width * 0.5, width * 0.45, '#9d8a58', sId + 2);
    };
    drawPaddyDyke(sampleCubic({ x: -10, y: 805 }, { x: 260, y: 774 }, { x: 640, y: 832 }, { x: 1010, y: 792 }, 24), 15, 90);
    drawPaddyDyke(sampleCubic({ x: -10, y: 896 }, { x: 340, y: 924 }, { x: 690, y: 862 }, { x: 1010, y: 908 }, 24), 18, 95);
    drawPaddyDyke(sampleCubic({ x: 358, y: 742 }, { x: 332, y: 795 }, { x: 288, y: 858 }, { x: 245, y: 912 }, 14), 13, 100);
    drawPaddyDyke(sampleCubic({ x: 692, y: 744 }, { x: 724, y: 808 }, { x: 768, y: 855 }, { x: 812, y: 982 }, 16), 14, 105);

    // Wind-bent rice seedling tufts (稲苗)
    for (let row = 0; row < 6; row++) {
      const baseY = 764 + row * 33;
      const stepX = 36 + row * 4;
      for (let sx = 28 + (row % 2) * 17; sx < w - 20; sx += stepX) {
        const jy = baseY + Math.sin(sx * 0.02 + row) * 6;
        if (Math.abs(jy - 802) < 12 || Math.abs(jy - 896) < 14) continue;
        const sc = 0.85 + row * 0.08;
        const ox = sx + (rng() - 0.5) * 9;
        ctx.fillStyle = '#244022';
        for (let b = -2; b <= 2; b++) {
          ctx.beginPath();
          ctx.moveTo(ox - 0.8 * sc, jy);
          ctx.quadraticCurveTo(ox + b * 2.4 * sc, jy - 6 * sc, ox + (b * 4.4 - 3.2) * sc, jy - (9.5 + Math.abs(b % 2) * 2.2) * sc);
          ctx.lineTo(ox + 0.9 * sc, jy);
          ctx.closePath();
          ctx.fill();
        }
      }
    }

    // Asymmetric Foreground Corner Hillocks with Susuki Pampas Blades
    const drawForegroundHillock = (isLeft) => {
      withColorPlate(ctx, PLATE_OFFSETS.green, 0.95, () => {
        ctx.fillStyle = '#2d472c';
        ctx.beginPath();
        if (isLeft) {
          ctx.moveTo(0, 868);
          ctx.bezierCurveTo(95, 858, 195, 905, 285, h - M_BOT);
          ctx.lineTo(0, h - M_BOT);
        } else {
          ctx.moveTo(w, 882);
          ctx.bezierCurveTo(910, 872, 835, 918, 765, h - M_BOT);
          ctx.lineTo(w, h - M_BOT);
        }
        ctx.closePath();
        ctx.fill();
      });

      const edgePts = isLeft
        ? sampleCubic({ x: 0, y: 868 }, { x: 95, y: 858 }, { x: 195, y: 905 }, { x: 285, y: h - M_BOT }, 14)
        : sampleCubic({ x: 765, y: h - M_BOT }, { x: 835, y: 918 }, { x: 910, y: 872 }, { x: w, y: 882 }, 14);
      drawCarvedKeyblockCurve(ctx, edgePts, 2.8, 3.3, 2.4, '#141812', isLeft ? 111 : 112);

      const baseRoots = isLeft ? [48, 118, 186] : [848, 916, 964];
      for (const rx of baseRoots) {
        const ry = isLeft ? 945 + (rx % 25) : 952 + (rx % 20);
        for (let blade = 0; blade < 5; blade++) {
          const tipX = rx - 30 - blade * 7;
          const tipY = ry - 42 - (blade % 3) * 12;
          drawCarvedKeyblockCurve(
            ctx,
            sampleQuad({ x: rx, y: ry }, { x: rx - 7, y: ry - 28 }, { x: tipX, y: tipY }, 8),
            2.4,
            1.6,
            0.5,
            blade % 2 === 0 ? '#d8c089' : '#587546',
            rx + blade
          );
        }
      }
    };
    drawForegroundHillock(true);
    drawForegroundHillock(false);

    // 10. Authentic Hōeidō Hiroshige Dual Woodblock Cartouches & Eroded Edo Seals (#85: Pure traditional Kanji & seals ONLY, zero modern UI box!)
    // (A) Rightmost Tall Vermilion-Bokashi Series Tanzaku: 『東海道五十三次』
    const tx = 910;
    const ty = 40;
    const tw = 52;
    const th = 228;

    withColorPlate(ctx, PLATE_OFFSETS.beni, 0.94, () => {
      ctx.fillStyle = '#f5e9d0';
      ctx.fillRect(tx, ty, tw, th);
      ctx.save();
      ctx.beginPath();
      ctx.rect(tx, ty, tw, th);
      ctx.clip();
      paintBokashiStrip(ty, ty + 148, 194, 58, 40, 0.94, 0.08, 22);
      ctx.restore();
    });
    drawCarvedRectBorder(ctx, tx, ty, tw, th, 3.0, '#171512', 120);
    drawCarvedRectBorder(ctx, tx + 4.5, ty + 4.5, tw - 9, th - 9, 1.1, '#171512', 125);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#fcf6ea';
    ctx.font = '700 18px "PelicanWenKai", "PelicanSerif", serif';
    ['東', '海', '道', '五', '十', '三', '次'].forEach((ch, i) => {
      ctx.fillText(ch, tx + tw * 0.5, ty + 14 + i * 28.5);
    });

    // (B) Companion Tilted Hōeidō Shikishi/Sub-Cartouche: 『浮世絵 · 鵜鶘疾風駅』
    ctx.save();
    ctx.translate(866, 134);
    ctx.rotate(-0.045);
    const sw = 42;
    const sh = 176;
    withColorPlate(ctx, PLATE_OFFSETS.ochre, 0.92, () => {
      ctx.fillStyle = '#f6ebd4';
      ctx.fillRect(-sw * 0.5, -sh * 0.5, sw, sh);
      ctx.fillStyle = 'rgba(28, 72, 114, 0.24)';
      ctx.fillRect(-sw * 0.5 + 3, -sh * 0.5 + 3, sw - 6, 32);
    });
    drawCarvedRectBorder(ctx, -sw * 0.5, -sh * 0.5, sw, sh, 2.5, '#171512', 130);
    ctx.fillStyle = '#b33122';
    ctx.font = '700 13px "PelicanWenKai", "PelicanSerif", serif';
    ['浮', '世', '絵'].forEach((ch, i) => {
      ctx.fillText(ch, 0, -sh * 0.5 + 8 + i * 14);
    });
    ctx.fillStyle = '#161310';
    ctx.font = '700 18px "PelicanWenKai", "PelicanSerif", serif';
    ['鵜', '鶘', '疾', '風', '駅'].forEach((ch, i) => {
      ctx.fillText(ch, 0, -sh * 0.5 + 56 + i * 22.5);
    });
    ctx.restore();

    // (C) Signature `広重画` + Eroded Vermilion Artist Seal `東海堂` & Edo Censor Kiwame Seal `極 / 天保`
    ctx.fillStyle = '#171411';
    ctx.font = '700 15px "PelicanWenKai", "PelicanSerif", serif';
    ['広', '重', '筆'].forEach((ch, i) => {
      ctx.fillText(ch, tx + 26, ty + th + 12 + i * 18);
    });

    // Eroded vermilion artist square seal (朱文印 with weathered ink pits)
    const sealX = tx + 8;
    const sealY = ty + th + 72;
    withColorPlate(ctx, PLATE_OFFSETS.beni, 0.94, () => {
      ctx.fillStyle = '#b83123';
      traceOrganicLoop(ctx, sealX + 18, sealY + 18, 17.5, 17.5, 0.03, 12, 0.08, 140);
      ctx.fill();
      ctx.fillStyle = '#efe1c4';
      for (let p = 0; p < 14; p++) {
        ctx.fillRect(sealX + 3 + rng() * 28, sealY + 3 + rng() * 28, 1.8, 1.5);
      }
      ctx.font = '700 13px "PelicanWenKai", "PelicanSerif", serif';
      ctx.fillText('広', sealX + 18, sealY + 4);
      ctx.fillText('鵜', sealX + 18, sealY + 19);

      // Hand-carved Edo Kiwame censor seal (改印『極』)
      traceOrganicLoop(ctx, sealX + 18, sealY + 54, 12.5, 12.5, -0.05, 14, 0.07, 145);
      ctx.strokeStyle = '#b83123';
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.fillStyle = '#b83123';
      ctx.font = '700 13px "PelicanWenKai", "PelicanSerif", serif';
      ctx.fillText('極', sealX + 18, sealY + 47);
    });

    ctx.restore();

    // Top & Bottom hand-carved woodblock margin rules + Kento registration notch (見当)
    drawCarvedKeyblockCurve(ctx, sampleQuad({ x: 0, y: M_TOP }, { x: w * 0.5, y: M_TOP + 0.4 }, { x: w, y: M_TOP }, 16), 2.6, 2.9, 2.6, '#1c1915', 150);
    drawCarvedKeyblockCurve(ctx, sampleQuad({ x: 0, y: h - M_BOT }, { x: w * 0.5, y: h - M_BOT - 0.4 }, { x: w, y: h - M_BOT }, 16), 2.6, 2.9, 2.6, '#1c1915', 151);

    drawCarvedKeyblockCurve(ctx, [{ x: 952, y: h - 7 }, { x: 976, y: h - 7 }, { x: 976, y: h - 15 }], 1.8, 2.0, 1.6, 'rgba(40, 34, 28, 0.52)', 155);
  });
}

/**
 * Draws Suruga Bay white Edo single-sail Bezaisen cargo boats (弁才船帆影) responding to the gust wavefront.
 */
function drawSurugaSailboats(ctx, t, localT, galeEnv, isOutroThumbnail, breathDx, breathDy) {
  const boats = [
    { x0: 278, y: 504, s: 0.90, speed: 3.5 },
    { x0: 416, y: 482, s: 0.62, speed: 2.2 },
    { x0: 665, y: 492, s: 0.74, speed: 2.8 },
    { x0: 785, y: 522, s: 0.54, speed: 1.9 },
  ];

  ctx.save();
  for (let i = 0; i < boats.length; i++) {
    const b = boats[i];
    const bx = b.x0 - ((t * b.speed) % 40) + 20;
    const localGust = sampleGustAt(bx, localT, galeEnv, isOutroThumbnail);
    const bobY = b.y + Math.sin(t * 2.1 + i * 1.7) * 1.8 * b.s;
    const tilt = -0.05 - localGust * 0.11 + Math.sin(t * 1.8 + i) * 0.025;

    ctx.save();
    ctx.translate(bx, bobY);
    ctx.scale(b.s, b.s);
    ctx.rotate(tilt);

    // Billowing canvas sail (raw Gofun white + subtle `版ズレ` blue-grey belly shade)
    const belly = -6 - localGust * 5;
    ctx.fillStyle = '#fbf5e8';
    ctx.beginPath();
    ctx.moveTo(-14, -46);
    ctx.lineTo(14, -44);
    ctx.quadraticCurveTo(belly + 10, -22, 12, -5);
    ctx.lineTo(-16, -5);
    ctx.quadraticCurveTo(-24 + belly * 0.4, -24, -14, -46);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(42, 74, 108, 0.18)';
    ctx.beginPath();
    ctx.moveTo(-14 + breathDx, -46 + breathDy);
    ctx.quadraticCurveTo(-22 + belly * 0.4, -24, -15, -5);
    ctx.lineTo(-4, -5);
    ctx.quadraticCurveTo(-12 + belly * 0.3, -24, -4, -45);
    ctx.closePath();
    ctx.fill();

    drawCarvedKeyblockCurve(
      ctx,
      [
        { x: -14, y: -46 },
        { x: 14, y: -44 },
        { x: 9 + belly * 0.3, y: -24 },
        { x: 12, y: -5 },
        { x: -16, y: -5 },
        { x: -20 + belly * 0.3, y: -24 },
        { x: -14, y: -46 },
      ],
      1.6,
      1.8,
      1.5,
      '#1d2730',
      200 + i
    );

    ctx.strokeStyle = 'rgba(35, 52, 70, 0.44)';
    ctx.lineWidth = 0.9;
    for (let sx = -7; sx <= 6; sx += 6.5) {
      ctx.beginPath();
      ctx.moveTo(sx, -45);
      ctx.quadraticCurveTo(sx - 6 + belly * 0.25, -24, sx - 2, -5);
      ctx.stroke();
    }

    // Cedar hull with `版ズレ` ochre offset
    ctx.fillStyle = '#755030';
    ctx.beginPath();
    ctx.moveTo(-26 + PLATE_OFFSETS.ochre.dx, -6 + PLATE_OFFSETS.ochre.dy);
    ctx.lineTo(22 + PLATE_OFFSETS.ochre.dx, -3 + PLATE_OFFSETS.ochre.dy);
    ctx.lineTo(16 + PLATE_OFFSETS.ochre.dx, 4 + PLATE_OFFSETS.ochre.dy);
    ctx.lineTo(-18 + PLATE_OFFSETS.ochre.dx, 4 + PLATE_OFFSETS.ochre.dy);
    ctx.closePath();
    ctx.fill();
    drawCarvedKeyblockCurve(
      ctx,
      [
        { x: -26, y: -6 },
        { x: 22, y: -3 },
        { x: 16, y: 4 },
        { x: -18, y: 4 },
        { x: -26, y: -6 },
      ],
      1.7,
      2.0,
      1.7,
      '#181613',
      210 + i
    );

    ctx.restore();

    drawCarvedKeyblockCurve(
      ctx,
      sampleQuad({ x: bx - 19 * b.s, y: bobY + 6 * b.s }, { x: bx, y: bobY + 4.8 * b.s }, { x: bx + 17 * b.s, y: bobY + 6 * b.s }, 6),
      0.9,
      1.4,
      0.8,
      'rgba(250, 245, 232, 0.65)',
      220 + i
    );
  }
  ctx.restore();
}

/**
 * Draws irregular woodblock black-pine needle canopies bending sequentially as the Shōno gust wavefront sweeps right-to-left!
 */
function drawWindBentPineCanopies(ctx, localT, galeEnv, isOutroThumbnail, breathDx, breathDy) {
  const allTufts = [
    { x: 918, y: 422, rx: 50, ry: 27, a: -0.06, seed: 19 },
    { x: 856, y: 454, rx: 54, ry: 29, a: -0.12, seed: 31 },
    { x: 794, y: 406, rx: 56, ry: 30, a: -0.14, seed: 73 },
    { x: 726, y: 368, rx: 70, ry: 37, a: -0.18, seed: 59 },
    { x: 682, y: 418, rx: 52, ry: 28, a: -0.20, seed: 43 },
    { x: 238, y: 440, rx: 52, ry: 28, a: 0.14, seed: 11 },
    { x: 184, y: 464, rx: 46, ry: 25, a: 0.08, seed: 23 },
    { x: 132, y: 392, rx: 54, ry: 29, a: -0.05, seed: 67 },
    { x: 74, y: 344, rx: 68, ry: 36, a: -0.12, seed: 51 },
    { x: 32, y: 382, rx: 48, ry: 26, a: -0.16, seed: 37 },
  ];

  for (const c of allTufts) {
    const gLoc = sampleGustAt(c.x, localT, galeEnv, isOutroThumbnail);
    const sway = -gLoc * 0.125 + Math.sin(localT * 9.5 + c.seed) * (0.016 + gLoc * 0.042);
    drawHiroshigePineFoliage(
      ctx,
      c.x - gLoc * 8.5,
      c.y + gLoc * 3.2,
      c.rx,
      c.ry,
      c.a + sway,
      c.seed,
      breathDx,
      breathDy
    );
  }
}

/**
 * Draws the two staggered Edo travelers on the upper post-road shoulder (y ≈ 642..645)
 * with authentic Utagawa-school Yakusha-e / Kyōga carved facial features (hooked Edo nose,
 * squinted/popping asymmetrical eyes, crooked yelling mouth, stray chonmage locks, gripped toes — ZERO arc circle heads!).
 */
const HAT_RIP_LOCAL_T = 2.48; // Exact beat when bicycle slipstream + Shōno squall rips off mid-road traveler's Sugegasa

/**
 * Draws the staggered Edo travelers on the upper post-road shoulder (y ≈ 634..645):
 * - Traveler 0 (`x ≈ 532..540`, prominent mid-road Tōkaidō traveler): walks `+X` into the driving rain
 *   holding his woven bamboo `菅笠` (*sugegasa*). As the speeding pelican blasts past (`localT ≈ 2.48s`),
 *   the slipstream + Hiroshige gale rips his `菅笠` clean off — revealing his shaved `月代` pate, curved
 *   `ちょんまげ` topknot, fluttering indigo `手拭い` headband, and snapped vermilion chin-cord while he
 *   lunges upward-forward on tiptoe with BOTH arms flung wide open trying in vain to snatch his hat back!
 * - Traveler 1 (`x ≈ 106..112`): companion Edo traveler bracing with an inverted vermilion *bangasa* umbrella.
 */
function drawEdoTravelers(ctx, kit, localT, pelicanLocalX, galeEnv, isOutroThumbnail, breathDx, breathDy) {
  const travelers = [
    {
      baseX: 530,
      walkSpeed: 2.2, // x ≈ 534 at 66.8s, 536 at 67.8s, 539 at 69.2s (prominent mid-road [460..540]!)
      phase: 0.4,
      scale: 1.20,
      kimonoCol: '#244669',
      hasUmbrella: false,
      losesHat: true,
    },
    {
      baseX: 112,
      walkSpeed: -1.5, // x ≈ 109..105, cleanly left of pelican rear wheel at 66.8s!
      phase: 2.1,
      scale: 1.12,
      kimonoCol: '#3f5741',
      hasUmbrella: true,
      losesHat: false,
    },
  ];

  for (let idx = 0; idx < travelers.length; idx++) {
    const tr = travelers[idx];
    const tx = tr.baseX + localT * tr.walkSpeed;
    const { y: roadY } = sampleTokaidoRoad(kit, tx);
    const groundY = roadY - (tr.losesHat ? 32 : 25);
    const localGust = sampleGustAt(tx, localT, galeEnv, isOutroThumbnail);

    if (tr.losesHat) {
      const hatGone = isOutroThumbnail || localT >= HAT_RIP_LOCAL_T;
      const preStrain = isOutroThumbnail ? 0 : smoothstep(2.12, HAT_RIP_LOCAL_T, localT) * (hatGone ? 0 : 1);
      const lungeEnv = isOutroThumbnail
        ? 0.92
        : smoothstep(HAT_RIP_LOCAL_T - 0.04, HAT_RIP_LOCAL_T + 0.22, localT) *
          (1 - 0.18 * smoothstep(5.25, 5.90, localT));
      const ripJolt = isOutroThumbnail
        ? 0
        : Math.exp(-Math.pow((localT - (HAT_RIP_LOCAL_T + 0.24)) / 0.28, 2));

      // Upward-forward tiptoe lunge (`+X, -Y` at 67.8s so he bursts cleanly out ahead of pelican's neck,
      // then arching skyward as the Shōno gale sweeps his hat high across Mt. Fuji!)
      const hopY = -5.0 * lungeEnv - 7.5 * ripJolt;
      const skyTrack = isOutroThumbnail ? 0.55 : smoothstep(3.15, 4.05, localT);
      const leanAngle = lerp(0.20, lerp(0.32, 0.10, skyTrack), lungeEnv) + Math.sin(localT * 12.5) * 0.032 * localGust;
      const stepPhase = localT * 5.2 + tr.phase;

      ctx.save();
      ctx.translate(tx + lungeEnv * lerp(11.0, 3.0, skyTrack), groundY);
      ctx.scale(tr.scale, tr.scale);

      // Organic wet road shadow (shrinks slightly as he lunges onto tiptoe)
      ctx.fillStyle = 'rgba(26, 22, 16, 0.23)';
      traceOrganicLoop(ctx, 0, 2, 23 - lungeEnv * 3, 4.6, 0, 12, 0.14, 300);
      ctx.fill();

      ctx.translate(0, hopY);

      // Wide lunging Edo stride in indigo Kyahan shin-wraps & Waraji straw sandals (facing +X forward!)
      const stride = lerp(Math.sin(stepPhase) * 10.5, 15.5, lungeEnv);
      const drawHeroLeg = (footX, footLift, isFrontRight) => {
        const kneeX = footX * 0.52 + (isFrontRight ? 4.8 : -1.8);
        const kneeY = -23 - footLift * 0.5;
        const skinCol = isFrontRight ? '#e3b38b' : '#c7976e';

        drawCarvedKeyblockCurve(ctx, [{ x: 0, y: -43 }, { x: kneeX, y: kneeY }], 8.4, 7.6, 6.8, '#171512', isFrontRight ? 310 : 311);
        drawCarvedKeyblockCurve(ctx, [{ x: 0, y: -43 }, { x: kneeX, y: kneeY }], 5.5, 4.9, 4.2, skinCol, isFrontRight ? 312 : 313);

        drawCarvedKeyblockCurve(ctx, [{ x: kneeX, y: kneeY }, { x: footX, y: -footLift - 2 }], 8.0, 7.2, 5.8, '#171512', 314);
        drawCarvedKeyblockCurve(
          ctx,
          [{ x: kneeX + breathDx * 0.8, y: kneeY }, { x: footX + breathDx * 0.8, y: -footLift - 2 }],
          5.2,
          4.6,
          3.6,
          '#1d3d61',
          316
        );

        const sandalTiltY = lungeEnv * (isFrontRight ? 1.5 : 3.2);
        drawCarvedKeyblockCurve(ctx, [{ x: footX - 6.5, y: -footLift - sandalTiltY }, { x: footX + 9.5, y: -footLift }], 3.8, 3.6, 3.2, '#171512', 318);
        drawCarvedKeyblockCurve(ctx, [{ x: footX - 6.0, y: -footLift - 0.5 - sandalTiltY }, { x: footX + 9.0, y: -footLift - 0.5 }], 2.4, 2.3, 2.0, '#cfa662', 319);
        ctx.fillStyle = skinCol;
        traceOrganicLoop(ctx, footX + 5.5, -footLift - 2.0, 3.2, 1.8, -0.1, 8, 0.15, 320);
        ctx.fill();
        ctx.fillStyle = '#b53224';
        ctx.fillRect(footX + 2.5, -footLift - 3.2, 2.4, 2.2);
      };

      // Back (-X) trailing leg & Front (+X) lunging leg
      drawHeroLeg(-stride, lungeEnv > 0.3 ? 3.5 * lungeEnv : Math.max(0, -Math.cos(stepPhase) * 3.8), false);
      drawHeroLeg(stride, lungeEnv > 0.3 ? 1.2 * ripJolt : Math.max(0, Math.cos(stepPhase) * 3.8), true);

      // Torso pitching upward-forward (+X) into the slipstream & squall!
      ctx.save();
      ctx.translate(0, -43);
      ctx.rotate(leanAngle);

      const drawWideArm = (shoulderX, shoulderY, elbowX, elbowY, handX, handY, fingerAngles, seedOff) => {
        const sleevePts = sampleQuad({ x: shoulderX, y: shoulderY }, { x: elbowX, y: elbowY }, { x: handX, y: handY }, 9);
        drawCarvedKeyblockCurve(ctx, sleevePts, 9.0, 8.2, 6.2, '#171512', 380 + seedOff);
        drawCarvedKeyblockCurve(
          ctx,
          sleevePts.map((p) => ({ x: p.x + PLATE_OFFSETS.blue.dx * 0.45 + breathDx * 0.5, y: p.y + PLATE_OFFSETS.blue.dy * 0.45 })),
          6.0,
          5.4,
          3.9,
          tr.kimonoCol,
          381 + seedOff
        );
        drawCarvedKeyblockCurve(
          ctx,
          [{ x: lerp(elbowX, handX, 0.82), y: lerp(elbowY, handY, 0.82) }, { x: handX, y: handY }],
          5.0,
          4.6,
          4.2,
          '#f7efe0',
          382 + seedOff
        );
        ctx.fillStyle = '#f2d3b3';
        traceOrganicLoop(ctx, handX, handY, 3.6, 2.7, -0.35, 8, 0.18, 383 + seedOff);
        ctx.fill();
        for (let f = 0; f < fingerAngles.length; f++) {
          const fa = fingerAngles[f];
          const fl = 5.2 + (f === 1 || f === 2 ? 1.3 : 0);
          drawCarvedKeyblockCurve(
            ctx,
            [{ x: handX, y: handY }, { x: handX + Math.cos(fa) * fl, y: handY + Math.sin(fa) * fl }],
            1.5,
            1.15,
            0.65,
            '#171512',
            386 + seedOff + f
          );
        }
      };

      if (hatGone) {
        // Rear (-X) arm flung wide open skyward-left reaching toward the wind-swept hat!
        const flutterL = Math.sin(localT * 17.0) * 2.2;
        drawWideArm(
          -5, -34,
          -17, -49,
          -26 + flutterL * 0.5, -67 + flutterL,
          [-2.35, -2.00, -1.65, -1.28],
          20
        );
      }

      // Billowing indigo cotton Kimono & straw Mino raincape whipped backward (-X) by the Hiroshige gale!
      const flapX = -17 - localGust * 15 + Math.sin(localT * 15) * 3.5;
      ctx.fillStyle = tr.kimonoCol;
      ctx.beginPath();
      ctx.moveTo(-10 + PLATE_OFFSETS.blue.dx * 0.7, -34 + PLATE_OFFSETS.blue.dy * 0.7);
      ctx.lineTo(12 + PLATE_OFFSETS.blue.dx * 0.7, -34);
      ctx.lineTo(10, 4);
      ctx.lineTo(-3, 6);
      ctx.lineTo(flapX, 1);
      ctx.closePath();
      ctx.fill();
      drawCarvedKeyblockCurve(
        ctx,
        [{ x: -10, y: -34 }, { x: 12, y: -34 }, { x: 10, y: 4 }, { x: -3, y: 6 }, { x: flapX, y: 1 }, { x: -10, y: -34 }],
        2.1,
        2.4,
        1.9,
        '#171512',
        340
      );

      // Bristling Straw Mino Raincape (蓑衣) blown backward (-X) in authentic Hiroshige gust direction!
      const minoBlow = -18 - localGust * 20;
      ctx.fillStyle = '#cca564';
      ctx.beginPath();
      ctx.moveTo(9 + PLATE_OFFSETS.ochre.dx * 0.7, -42 + PLATE_OFFSETS.ochre.dy * 0.7);
      ctx.quadraticCurveTo(15, -20, 8, -4);
      ctx.quadraticCurveTo(-12, -2, minoBlow - 10, -12);
      ctx.quadraticCurveTo(minoBlow - 4, -32, -8, -44);
      ctx.closePath();
      ctx.fill();
      drawCarvedKeyblockCurve(
        ctx,
        [{ x: 9, y: -42 }, { x: 13, y: -20 }, { x: 8, y: -4 }, { x: minoBlow - 10, y: -12 }, { x: -8, y: -44 }, { x: 9, y: -42 }],
        2.0,
        2.3,
        1.8,
        '#171512',
        345
      );
      for (let s = 0; s < 12; s++) {
        const sy = -40 + s * 3.0;
        drawCarvedKeyblockCurve(
          ctx,
          [{ x: 5 - s * 0.5, y: sy }, { x: minoBlow - (s % 4) * 4.2, y: sy + 2.5 + (s % 2) * 1.4 }],
          1.5,
          1.2,
          0.5,
          '#221b13',
          350 + s
        );
      }

      // Expressive Hokusai-Manga Profile Head tilted skyward watching his escaping hat!
      // At 67.8s faces +X upward-forward (`headFaceDir = +1`) right into the open window ahead of pelican;
      // as the gale hooks his hat across the sky (`skyTrack -> 1` by 69.2s), cranes his head skyward-back!
      const headFaceDir = skyTrack > 0.55 ? -1 : 1;
      ctx.save();
      ctx.translate(2 * headFaceDir, -50 - lungeEnv * 2.5);
      ctx.rotate(hatGone ? -0.36 * headFaceDir * lungeEnv : -0.05);
      ctx.scale(headFaceDir, 1);

      const jawDrop = hatGone ? 4.4 : 1.5 + preStrain * 1.8;
      const facePoly = [
        { x: -9.5, y: -6.8 },
        { x: -3.2, y: -11.4 },
        { x: 5.6, y: -9.6 },
        { x: 8.4, y: -4.6 },
        { x: 12.8, y: -1.2 }, // hooked Edo nose
        { x: 8.8, y: 0.6 },
        { x: 10.4, y: 2.2 },
        { x: 6.2, y: 2.8 + jawDrop },
        { x: 9.2, y: 5.5 + jawDrop },
        { x: 2.0, y: 7.8 + jawDrop * 0.5 },
        { x: -7.8, y: 5.2 },
        { x: -10.2, y: -1.0 },
        { x: -9.5, y: -6.8 },
      ];
      ctx.fillStyle = '#f2d3b3';
      ctx.beginPath();
      ctx.moveTo(facePoly[0].x + breathDx * 0.5, facePoly[0].y);
      for (let p = 1; p < facePoly.length; p++) ctx.lineTo(facePoly[p].x, facePoly[p].y);
      ctx.closePath();
      ctx.fill();
      drawCarvedKeyblockCurve(ctx, facePoly, 1.9, 2.1, 1.7, '#171512', 360);

      // Bare Shaved Edo Sakayaki Pate (`月代` bluish-slate tone) + Prominent Curved Chonmage Topknot (`ちょんまげ`)!
      ctx.fillStyle = '#92a5b5';
      traceOrganicLoop(ctx, 1.2, -9.2, 5.4, 2.4, 0.14, 9, 0.12, 361);
      ctx.fill();

      ctx.fillStyle = '#161412';
      traceOrganicLoop(ctx, -6.2, -5.2, 4.6, 5.2, -0.2, 9, 0.14, 362);
      ctx.fill();
      const mageLift = hatGone ? Math.sin(localT * 18.0) * 1.1 : 0;
      drawCarvedKeyblockCurve(
        ctx,
        [
          { x: -5.8, y: -9.8 },
          { x: -4.2, y: -15.4 - mageLift },
          { x: 1.6, y: -15.8 - mageLift * 0.7 },
          { x: 6.0, y: -13.4 },
        ],
        4.3,
        4.9,
        3.5,
        '#141210',
        363
      );
      drawCarvedKeyblockCurve(ctx, [{ x: -5.6, y: -12.2 }, { x: -2.6, y: -13.4 }], 2.2, 2.0, 2.2, '#fcf6e8', 364);
      drawCarvedKeyblockCurve(ctx, [{ x: -8.5, y: -6.5 }, { x: -16 - localGust * 4.5, y: -9.5 + mageLift }], 1.8, 1.3, 0.5, '#151311', 365);
      drawCarvedKeyblockCurve(ctx, [{ x: -9.2, y: -3.2 }, { x: -15 - localGust * 3.5, y: -4.5 }], 1.5, 1.0, 0.4, '#151311', 366);

      // Fluttering Indigo-and-White Mame-Shibori Tenugui Hachimaki Headband (`手拭い鉢巻`)!
      const tenuguiBand = [
        { x: -10.2, y: -6.2 },
        { x: 0, y: -7.6 },
        { x: 8.6, y: -6.0 },
      ];
      drawCarvedKeyblockCurve(ctx, tenuguiBand, 4.4, 4.6, 4.2, '#171512', 390);
      drawCarvedKeyblockCurve(
        ctx,
        tenuguiBand.map((p) => ({ x: p.x + breathDx * 0.5, y: p.y })),
        2.9,
        3.1,
        2.7,
        '#1b4675',
        391
      );
      ctx.fillStyle = '#fcf6e8';
      for (const dxDot of [-6.5, -2.0, 2.5, 6.2]) {
        traceOrganicLoop(ctx, dxDot, -6.8, 0.95, 0.85, 0, 6, 0.15, 392 + dxDot);
        ctx.fill();
      }
      // Two whipping Tenugui headband tails streaming backward in the gale!
      for (let tTail = 0; tTail < 2; tTail++) {
        const waveT = Math.sin(localT * 19.0 + tTail * 1.7) * (3.2 + 2.8 * lungeEnv);
        const tailLen = (hatGone ? 24 : 12) - tTail * 4;
        const tailDir = -headFaceDir; // always streams leftward (-X) in world wind!
        const anchorX = tailDir * 9.6;
        const tPts = sampleQuad(
          { x: anchorX, y: -6.4 + tTail * 2.2 },
          { x: anchorX + tailDir * tailLen * 0.55, y: -9.8 + waveT * 0.6 + tTail * 3.0 },
          { x: anchorX + tailDir * tailLen, y: -7.6 + waveT + tTail * 3.8 },
          8
        );
        drawCarvedKeyblockCurve(ctx, tPts, 4.2, 3.8, 2.8, '#161412', 395 + tTail);
        drawCarvedKeyblockCurve(ctx, tPts, 2.7, 2.4, 1.6, tTail === 0 ? '#1d4978' : '#f7efe0', 397 + tTail);
      }

      // Popping wide-open Yakusha-e sclera eye staring up at his flying hat + gaping O-mouth!
      ctx.fillStyle = '#fdfaf2';
      traceOrganicLoop(ctx, 4.9, -3.5, hatGone ? 3.5 : 2.8, hatGone ? 2.8 : 2.0, -0.15, 8, 0.12, 367);
      ctx.fill();
      drawCarvedKeyblockCurve(ctx, [{ x: 1.4, y: -4.2 }, { x: 5.0, y: -6.2 }, { x: 8.2, y: -3.2 }], 1.5, 1.8, 1.2, '#161412', 368);
      ctx.fillStyle = '#141210';
      traceOrganicLoop(ctx, hatGone ? 5.9 : 5.6, hatGone ? -4.3 : -3.5, 1.3, 1.3, 0, 7, 0.1, 369);
      ctx.fill();
      drawCarvedKeyblockCurve(ctx, [{ x: 1.0, y: -7.6 }, { x: 5.2, y: -9.8 }, { x: 8.6, y: -7.2 }], 1.8, 2.2, 1.2, '#161412', 370);

      ctx.fillStyle = '#8c291e';
      ctx.beginPath();
      ctx.moveTo(9.6, 2.0);
      ctx.lineTo(5.2, 2.8 + jawDrop * 0.5);
      ctx.lineTo(8.8, 5.0 + jawDrop);
      ctx.closePath();
      ctx.fill();

      ctx.restore(); // end head

      if (!hatGone) {
        // BEFORE RIP-OFF (`localT < 2.48s`): Strained vermilion chin-cord + Sugegasa trembling on his head!
        drawCarvedKeyblockCurve(ctx, sampleQuad({ x: -5, y: -56 }, { x: 2, y: -41 }, { x: 8, y: -56 }, 8), 1.5, 1.7, 1.5, '#b83526', 371);

        ctx.save();
        ctx.translate(1 - preStrain * 3, -60 - preStrain * 6);
        ctx.rotate(-0.26 - preStrain * 0.52 + Math.sin(localT * 24) * 0.08 * preStrain);
        ctx.fillStyle = '#e8cd90';
        ctx.beginPath();
        ctx.moveTo(-34 + PLATE_OFFSETS.ochre.dx * 0.6, 3);
        ctx.quadraticCurveTo(0, -22, 34, 3);
        ctx.quadraticCurveTo(0, 7.5, -34, 3);
        ctx.closePath();
        ctx.fill();
        drawCarvedKeyblockCurve(
          ctx,
          sampleQuad({ x: -33, y: 2.5 }, { x: 0, y: 6.8 }, { x: 33, y: 2.5 }, 10),
          3.4,
          3.8,
          3.4,
          '#1f446e',
          374
        );
        drawCarvedKeyblockCurve(ctx, sampleQuad({ x: -34, y: 3 }, { x: 0, y: -22 }, { x: 34, y: 3 }, 12), 2.2, 2.6, 2.2, '#161411', 372);
        drawCarvedKeyblockCurve(ctx, sampleQuad({ x: -34, y: 3 }, { x: 0, y: 7.5 }, { x: 34, y: 3 }, 10), 1.9, 2.2, 1.9, '#161411', 373);
        for (let r = -24; r <= 24; r += 8) {
          drawCarvedKeyblockCurve(ctx, [{ x: 0, y: -12 }, { x: r, y: 3 }], 0.9, 1.2, 0.9, 'rgba(30, 24, 18, 0.58)', 375 + r);
        }
        ctx.restore();

        // Both hands clutching the trembling Sugegasa brim before the slipstream rips it free
        drawWideArm(-3, -35, -10, -46, -12, -58 - preStrain * 4, [-2.0, -1.5, -1.0], 1);
        drawWideArm(4, -35, 13, -46, 16, -61 - preStrain * 4, [-2.1, -1.6, -1.1], 6);
      } else {
        // AFTER RIP-OFF (`localT >= 2.48s`): Snapped vermilion chin-cord ends whipping + Front (+X) arm flung WIDE skyward!
        const cordWave = Math.sin(localT * 22.0) * 3.5;
        drawCarvedKeyblockCurve(
          ctx,
          sampleQuad({ x: -2, y: -44 }, { x: -11, y: -49 + cordWave * 0.5 }, { x: -20, y: -55 + cordWave }, 7),
          1.6,
          1.4,
          0.8,
          '#bf3324',
          376
        );
        drawCarvedKeyblockCurve(
          ctx,
          sampleQuad({ x: 3, y: -45 }, { x: -5, y: -52 - cordWave * 0.4 }, { x: -14, y: -58 - cordWave }, 7),
          1.5,
          1.3,
          0.7,
          '#bf3324',
          377
        );

        // Front (+X) arm flung wide open skyward-forward (`+27, -70`) forming a dramatic wide-open V snatch!
        const reachWave = Math.sin(localT * 16.0 + 0.8) * 2.0;
        drawWideArm(
          5, -35,
          17, -51,
          27 + reachWave * 0.5, -70 + reachWave,
          [-1.65, -1.30, -0.95, -0.60],
          40
        );
      }

      ctx.restore();
      ctx.restore();
      continue;
    }

    // --- Secondary Companion Traveler (`idx === 1`, inverted Bangasa umbrella) ---
    const dist = pelicanLocalX - tx;
    const shock = Math.max(smoothstep(-160, -40, dist) * (1 - smoothstep(220, 380, dist)), localGust * 0.78);

    const leanAngle = lerp(0.20, -0.27, shock) + Math.sin(localT * 11 + idx * 2) * 0.036 * localGust;
    const hatFlip = -0.34 - shock * 0.38 + Math.sin(localT * 14 + idx) * 0.08 * localGust;
    const lookDir = dist >= -15 ? 1 : -1;
    const stepPhase = localT * 4.8 + tr.phase;

    ctx.save();
    ctx.translate(tx, groundY);
    ctx.scale(tr.scale, tr.scale);

    // Organic wet road shadow (no geometric ellipse!)
    ctx.fillStyle = 'rgba(26, 22, 16, 0.24)';
    traceOrganicLoop(ctx, 0, 2, 24, 4.8, 0, 12, 0.14, 300 + idx);
    ctx.fill();

    // Braced Edo muscular calves in indigo Kyahan leggings & Waraji straw sandals with gripping toes!
    const stride = lerp(Math.sin(stepPhase) * 12, 13.5, shock * 0.68);
    const drawTravelerLeg = (footX, footLift, isBack) => {
      const kneeX = footX * 0.48 + (footX > 0 ? 4.5 : -2.2);
      const kneeY = -23 - footLift * 0.5;
      const skinCol = isBack ? '#c7976e' : '#e3b38b';

      // Muscular calf & thigh polygon + carved keyblock contour
      drawCarvedKeyblockCurve(ctx, [{ x: 0, y: -43 }, { x: kneeX, y: kneeY }], 8.2, 7.6, 6.8, '#171512', 310 + idx);
      drawCarvedKeyblockCurve(ctx, [{ x: 0, y: -43 }, { x: kneeX, y: kneeY }], 5.4, 4.8, 4.2, skinCol, 312 + idx);

      // Indigo Kyahan shin-wraps with `版ズレ` blue shift
      drawCarvedKeyblockCurve(ctx, [{ x: kneeX, y: kneeY }, { x: footX, y: -footLift - 2 }], 8.0, 7.2, 5.8, '#171512', 314 + idx);
      drawCarvedKeyblockCurve(
        ctx,
        [{ x: kneeX + breathDx * 0.8, y: kneeY }, { x: footX + breathDx * 0.8, y: -footLift - 2 }],
        5.2,
        4.6,
        3.6,
        '#1d3d61',
        316 + idx
      );

      // Straw Waraji sandal + splayed gripping Edo toes!
      drawCarvedKeyblockCurve(ctx, [{ x: footX - 6.5, y: -footLift }, { x: footX + 9.5, y: -footLift }], 3.8, 3.6, 3.2, '#171512', 318);
      drawCarvedKeyblockCurve(ctx, [{ x: footX - 6.0, y: -footLift - 0.5 }, { x: footX + 9.0, y: -footLift - 0.5 }], 2.4, 2.3, 2.0, '#cfa662', 319);
      ctx.fillStyle = skinCol;
      traceOrganicLoop(ctx, footX + 5.5, -footLift - 2.0, 3.2, 1.8, -0.1, 8, 0.15, 320);
      ctx.fill();
      // Red Hanao sandal strap knot
      ctx.fillStyle = '#b53224';
      ctx.fillRect(footX + 2.5, -footLift - 3.2, 2.4, 2.2);
    };

    drawTravelerLeg(-stride, Math.max(0, -Math.cos(stepPhase) * 4 * (1 - shock * 0.5)), true);
    drawTravelerLeg(stride, Math.max(0, Math.cos(stepPhase) * 4 * (1 - shock * 0.5)), false);

    // Torso reeling backward in the headwind & pelican slipstream!
    ctx.save();
    ctx.translate(0, -43);
    ctx.rotate(leanAngle);

    // Traveler 2's wind-inverted Edo Bangasa oiled-paper umbrella whipping backward (-X)!
    if (tr.hasUmbrella) {
      ctx.save();
      ctx.translate(-10, -28);
      ctx.rotate(-0.85 - localGust * 0.28);
      drawCarvedKeyblockCurve(ctx, [{ x: 14, y: 14 }, { x: -23, y: -23 }], 3.4, 3.0, 2.6, '#171512', 330);
      drawCarvedKeyblockCurve(ctx, [{ x: 14, y: 14 }, { x: -23, y: -23 }], 1.8, 1.6, 1.4, '#9c6e38', 331);

      // Inside-out blown oiled-paper canopy with `版ズレ` vermilion offset & torn paper edge!
      ctx.fillStyle = '#c8452e';
      ctx.beginPath();
      ctx.moveTo(-12 + PLATE_OFFSETS.beni.dx * 0.7, -12 + PLATE_OFFSETS.beni.dy * 0.7);
      ctx.quadraticCurveTo(-36, -6, -44, -27);
      ctx.lineTo(-33, -34);
      ctx.lineTo(-25, -44);
      ctx.quadraticCurveTo(-6, -34, -12, -12);
      ctx.closePath();
      ctx.fill();

      drawCarvedKeyblockCurve(
        ctx,
        [{ x: -12, y: -12 }, { x: -30, y: -10 }, { x: -44, y: -27 }, { x: -33, y: -34 }, { x: -25, y: -44 }, { x: -12, y: -12 }],
        2.0,
        2.2,
        1.8,
        '#171512',
        332
      );
      for (const [rx, ry] of [[-36, -36], [-41, -23], [-23, -41]]) {
        drawCarvedKeyblockCurve(ctx, [{ x: -12, y: -12 }, { x: rx, y: ry }], 1.3, 1.1, 0.8, '#171512', 335);
      }
      ctx.restore();
    }

    // Angular woodblock Kimono folds blown backward (-X) with `版ズレ` plate shift
    const flapX = -18 - localGust * 16 + Math.sin(localT * 15 + idx) * 4;
    ctx.fillStyle = tr.kimonoCol;
    ctx.beginPath();
    ctx.moveTo(-10 + PLATE_OFFSETS.blue.dx * 0.7, -34 + PLATE_OFFSETS.blue.dy * 0.7);
    ctx.lineTo(12 + PLATE_OFFSETS.blue.dx * 0.7, -34);
    ctx.lineTo(10, 4);
    ctx.lineTo(-3, 6);
    ctx.lineTo(flapX, 1);
    ctx.closePath();
    ctx.fill();
    drawCarvedKeyblockCurve(
      ctx,
      [{ x: -10, y: -34 }, { x: 12, y: -34 }, { x: 10, y: 4 }, { x: -3, y: 6 }, { x: flapX, y: 1 }, { x: -10, y: -34 }],
      2.1,
      2.4,
      1.9,
      '#171512',
      340 + idx
    );

    // Bristling Straw Mino Raincape (蓑衣) with jagged individual straw stalks flying backward!
    const minoBlow = -19 - localGust * 21;
    ctx.fillStyle = '#cca564';
    ctx.beginPath();
    ctx.moveTo(9 + PLATE_OFFSETS.ochre.dx * 0.7, -42 + PLATE_OFFSETS.ochre.dy * 0.7);
    ctx.quadraticCurveTo(16, -20, 8, -4);
    ctx.quadraticCurveTo(-12, -2, minoBlow - 11, -12);
    ctx.quadraticCurveTo(minoBlow - 4, -32, -8, -44);
    ctx.closePath();
    ctx.fill();
    drawCarvedKeyblockCurve(
      ctx,
      [{ x: 9, y: -42 }, { x: 13, y: -20 }, { x: 8, y: -4 }, { x: minoBlow - 11, y: -12 }, { x: -8, y: -44 }, { x: 9, y: -42 }],
      2.0,
      2.3,
      1.8,
      '#171512',
      345 + idx
    );

    for (let s = 0; s < 13; s++) {
      const sy = -40 + s * 3.0;
      drawCarvedKeyblockCurve(
        ctx,
        [{ x: 5 - s * 0.55, y: sy }, { x: minoBlow - (s % 4) * 4.5, y: sy + 2.5 + (s % 2) * 1.5 }],
        1.5,
        1.2,
        0.5,
        '#221b13',
        350 + s
      );
    }

    // Authentic Utagawa-School Kyōga / Hokusai-Manga Expressive Profile Head (ZERO geometric arc circle!)
    ctx.save();
    ctx.translate(2, -50);
    ctx.scale(lookDir, 1); // Face +X toward pelican!

    // Carved Edo facial silhouette: cranium, protruding brow, hooked Edo nose, open jaw, chin!
    const jawDrop = 1.6 + shock * 2.8;
    const facePoly = [
      { x: -9.5, y: -6.5 },
      { x: -3.5, y: -10.8 },
      { x: 5.5, y: -9.2 },
      { x: 8.2, y: -4.5 },  // brow ridge
      { x: 12.6, y: -1.2 }, // hooked Ukiyo-e nose tip!
      { x: 8.8, y: 0.6 },   // philtrum
      { x: 10.2, y: 2.2 },  // upper lip
      { x: 6.5, y: 2.6 + jawDrop }, // crooked yelling mouth interior
      { x: 9.2, y: 5.4 + jawDrop }, // dropped lower lip/chin!
      { x: 2.0, y: 7.8 + jawDrop * 0.5 },
      { x: -7.8, y: 5.2 },
      { x: -10.2, y: -1.0 },
      { x: -9.5, y: -6.5 },
    ];
    ctx.fillStyle = '#f2d3b3';
    ctx.beginPath();
    ctx.moveTo(facePoly[0].x + breathDx * 0.5, facePoly[0].y);
    for (let p = 1; p < facePoly.length; p++) ctx.lineTo(facePoly[p].x, facePoly[p].y);
    ctx.closePath();
    ctx.fill();
    drawCarvedKeyblockCurve(ctx, facePoly, 1.9, 2.1, 1.7, '#171512', 360 + idx);

    // Wind-whipped Chonmage topknot & stray sidelock hairs (乱れ鬢髪)
    drawCarvedKeyblockCurve(
      ctx,
      [{ x: -4, y: -10 }, { x: -11, y: -13 }, { x: -16 - localGust * 4, y: -10 }],
      3.4,
      2.8,
      1.2,
      '#151311',
      362 + idx
    );
    drawCarvedKeyblockCurve(ctx, [{ x: -8, y: -5 }, { x: -14 - localGust * 3, y: -2 }], 1.8, 1.2, 0.5, '#151311', 364);

    // Expressive Ukiyo-e angled eye + arched brow + red-ochre yelling mouth corner!
    ctx.fillStyle = '#fdfaf2';
    traceOrganicLoop(ctx, 4.8, -3.6, 2.9, 2.1, -0.18, 8, 0.12, 366);
    ctx.fill();
    drawCarvedKeyblockCurve(ctx, [{ x: 1.6, y: -4.2 }, { x: 5.0, y: -5.6 }, { x: 8.0, y: -3.2 }], 1.5, 1.8, 1.2, '#161412', 367);
    ctx.fillStyle = '#141210';
    traceOrganicLoop(ctx, 5.8, -3.5, 1.25, 1.25, 0, 7, 0.1, 368);
    ctx.fill();
    // Slanted Yakusha eyebrow (吊り眉)
    drawCarvedKeyblockCurve(ctx, [{ x: 1.2, y: -7.2 }, { x: 5.2, y: -8.6 }, { x: 8.4, y: -6.8 }], 1.8, 2.2, 1.2, '#161412', 369);
    // Open yelling mouth cavity
    ctx.fillStyle = '#8c291e';
    ctx.beginPath();
    ctx.moveTo(9.4, 2.0);
    ctx.lineTo(5.6, 2.8 + jawDrop * 0.5);
    ctx.lineTo(8.6, 4.8 + jawDrop);
    ctx.closePath();
    ctx.fill();

    ctx.restore(); // end profile head

    // Strained vermilion Sugegasa chin-cord + Wind-Flipped Woven Sedge Hat!
    drawCarvedKeyblockCurve(ctx, sampleQuad({ x: -4, y: -56 }, { x: 3, y: -41 }, { x: 9, y: -56 }, 8), 1.5, 1.7, 1.5, '#b83526', 370);

    ctx.save();
    ctx.translate(1, -60 - shock * 3);
    ctx.rotate(hatFlip);
    ctx.fillStyle = '#e8cd90';
    ctx.beginPath();
    ctx.moveTo(-33 + PLATE_OFFSETS.ochre.dx * 0.6, 3);
    ctx.quadraticCurveTo(0, -21, 33, 3);
    ctx.quadraticCurveTo(0, 7.5, -33, 3);
    ctx.closePath();
    ctx.fill();
    drawCarvedKeyblockCurve(
      ctx,
      sampleQuad({ x: -33, y: 3 }, { x: 0, y: -21 }, { x: 33, y: 3 }, 12),
      2.2,
      2.6,
      2.2,
      '#161411',
      372
    );
    drawCarvedKeyblockCurve(
      ctx,
      sampleQuad({ x: -33, y: 3 }, { x: 0, y: 7.5 }, { x: 33, y: 3 }, 10),
      1.9,
      2.2,
      1.9,
      '#161411',
      373
    );
    for (let r = -24; r <= 24; r += 8) {
      drawCarvedKeyblockCurve(ctx, [{ x: 0, y: -12 }, { x: r, y: 3 }], 0.9, 1.2, 0.9, 'rgba(30, 24, 18, 0.58)', 375 + r);
    }
    ctx.restore();

    // Frantic raised arms & splayed woodblock fingers clutching the flipping hat brim!
    const drawGrabArm = (shoulderX, handX, handY) => {
      const sleevePts = sampleQuad({ x: shoulderX, y: -36 }, { x: shoulderX + 10, y: -45 }, { x: handX, y: handY }, 8);
      drawCarvedKeyblockCurve(ctx, sleevePts, 8.2, 7.6, 6.2, '#171512', 380);
      drawCarvedKeyblockCurve(ctx, sleevePts, 5.4, 5.0, 3.8, tr.kimonoCol, 381);
      // Carved splayed fingers (zero round ball hand!)
      ctx.fillStyle = '#f2d3b3';
      traceOrganicLoop(ctx, handX, handY, 3.4, 2.6, -0.4, 8, 0.18, 382);
      ctx.fill();
      for (let f = -1; f <= 1; f++) {
        drawCarvedKeyblockCurve(
          ctx,
          [{ x: handX, y: handY }, { x: handX + 2.5 + f * 1.4, y: handY - 3.6 + Math.abs(f) }],
          1.4,
          1.1,
          0.7,
          '#171512',
          385 + f
        );
      }
    };
    if (!tr.hasUmbrella) drawGrabArm(-4, -10, -58);
    drawGrabArm(4, 14, -64);

    ctx.restore();
    ctx.restore();
  }
}

/**
 * Animates the wind-ripped woven bamboo sedge hat (`菅笠 sugegasa`) tumbling end-over-end
 * and sailing diagonally skyward-left across the woodblock rain sky (`localT = 2.54s -> 5.8s+`),
 * rendered with authentic Sumi keyblock lines, ochre/indigo flat plate misregistration (`版ズレ`),
 * `±0.35px` woodblock breath, concave bamboo `五徳` head-ring when inverted, & whipping torn red cords!
 */
function drawFlyingSugegasa(ctx, localT, isOutroThumbnail, breathDx, breathDy) {
  if (!isOutroThumbnail && localT < HAT_RIP_LOCAL_T) return;

  const dt = isOutroThumbnail ? 1.72 : Math.max(0, localT - HAT_RIP_LOCAL_T);
  const u = clamp(dt / (5.80 - HAT_RIP_LOCAL_T), 0, 1.08);

  // Aerodynamic slipstream bow-wake scoops the conical hat forward-upward off (552, 545) to (566, 386)
  // right against dark Prussian-blue Mt. Fuji at t=67.8s, where the upper-altitude Hiroshige gale catches it
  // and sweeps it sailing diagonally skyward across the rain sky to (352, 202) at t=69.2s -> (92, 66) at 5.8s!
  const burst = 1 - Math.exp(-dt * 4.4);
  const slipstreamKickX = 32 * dt * Math.exp(-dt * 2.4);
  const hx = 552 + slipstreamKickX - 462 * Math.pow(u, 1.38) + Math.sin(dt * 5.2) * 8.5 * smoothstep(0.05, 0.30, u);
  const hy = 545 - 148 * burst - 332 * Math.pow(u, 0.90) + Math.cos(dt * 6.0) * 7.0 * smoothstep(0.05, 0.30, u);

  // End-over-end somersault (`くるくる宙返り`) calibrated so both t=67.8s (dt=0.32) and t=69.2s (dt=1.72)
  // showcase rich 3/4 conical/bowl woodblock perspectives (never flat edge-on)!
  const somersault = -0.36 - dt * 3.15;
  const flipPhase = dt * 4.25 - 0.55;
  const cosFlip = Math.cos(flipPhase);
  const sinFlip = Math.sin(flipPhase);
  const scaleHat = 1.20 - 0.12 * clamp(u, 0, 1);

  const regOchre = { dx: PLATE_OFFSETS.ochre.dx * 0.72 + breathDx, dy: PLATE_OFFSETS.ochre.dy * 0.72 + breathDy };
  const regBlue = { dx: PLATE_OFFSETS.blue.dx * 0.68 - breathDx, dy: PLATE_OFFSETS.blue.dy * 0.68 + breathDy };
  const regBeni = { dx: PLATE_OFFSETS.beni.dx * 0.65 + breathDx, dy: PLATE_OFFSETS.beni.dy * 0.65 - breathDy };

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 18, PANEL_SIZE, PANEL_SIZE - 36);
  ctx.clip();

  ctx.translate(hx, hy);
  ctx.scale(scaleHat, scaleHat);
  ctx.rotate(somersault);

  const brimHalfW = 36;
  const coneApexY = -21 * cosFlip; // flips apex cleanly from -21 (upright cone) through 0 (edge-on) to +21 (inverted bowl!)
  const brimTiltY = 9.5 * Math.abs(sinFlip) + 3.2;

  // 1. Ochre Woven Sedge Body Plate (`版ズレ` shifted flat mineral ochre `#e5c883` + darker bamboo shade `#c7a258`)
  ctx.save();
  ctx.translate(regOchre.dx, regOchre.dy);
  ctx.fillStyle = cosFlip >= 0 ? '#e6ca86' : '#d1b06b';
  ctx.beginPath();
  ctx.moveTo(-brimHalfW, 0);
  ctx.quadraticCurveTo(0, coneApexY * 1.18, brimHalfW, 0);
  ctx.quadraticCurveTo(0, cosFlip >= 0 ? brimTiltY : -brimTiltY, -brimHalfW, 0);
  ctx.closePath();
  ctx.fill();

  // Darker inner-bowl woven shadow when underside faces viewer
  if (cosFlip < 0.25) {
    ctx.fillStyle = 'rgba(138, 98, 48, 0.46)';
    traceOrganicLoop(ctx, 0, 1.5, brimHalfW * 0.78, brimTiltY * 0.68, 0, 14, 0.08, 801);
    ctx.fill();
  }
  ctx.restore();

  // 2. Indigo-Dyed Cotton Brim Binding Plate (`藍染縁布` — authentic Ukiyo-e blue plate registration!)
  ctx.save();
  ctx.translate(regBlue.dx, regBlue.dy);
  drawCarvedKeyblockCurve(
    ctx,
    sampleQuad({ x: -brimHalfW, y: 0 }, { x: 0, y: brimTiltY }, { x: brimHalfW, y: 0 }, 12),
    3.6,
    4.2,
    3.6,
    '#1d446e',
    804
  );
  if (Math.abs(sinFlip) > 0.28) {
    drawCarvedKeyblockCurve(
      ctx,
      sampleQuad({ x: -brimHalfW, y: 0 }, { x: 0, y: -brimTiltY * 0.85 }, { x: brimHalfW, y: 0 }, 12),
      2.6,
      3.1,
      2.6,
      '#275482',
      805
    );
  }
  ctx.restore();

  // 3. Hand-Gouged Sumi Keyblock Cone Silhouette, Radial Split-Bamboo Ribs (`竹骨`) & Concentric Weave Rings
  drawCarvedKeyblockCurve(
    ctx,
    sampleQuad({ x: -brimHalfW, y: 0 }, { x: 0, y: coneApexY * 1.18 }, { x: brimHalfW, y: 0 }, 14),
    2.2,
    2.7,
    2.2,
    '#161411',
    810
  );
  drawCarvedKeyblockCurve(
    ctx,
    sampleQuad({ x: -brimHalfW, y: 0 }, { x: 0, y: brimTiltY }, { x: brimHalfW, y: 0 }, 12),
    2.1,
    2.5,
    2.1,
    '#161411',
    811
  );
  if (Math.abs(sinFlip) > 0.24) {
    drawCarvedKeyblockCurve(
      ctx,
      sampleQuad({ x: -brimHalfW, y: 0 }, { x: 0, y: -brimTiltY * 0.85 }, { x: brimHalfW, y: 0 }, 12),
      1.6,
      1.9,
      1.6,
      '#161411',
      812
    );
  }

  // Radial split-bamboo ribs converging toward apex
  const apexPt = { x: 0, y: coneApexY * 0.62 };
  for (let r = -27; r <= 27; r += 9) {
    drawCarvedKeyblockCurve(
      ctx,
      [{ x: apexPt.x, y: apexPt.y }, { x: r, y: (1 - Math.abs(r) / brimHalfW) * brimTiltY * 0.45 }],
      0.95,
      1.2,
      0.9,
      'rgba(28, 22, 16, 0.62)',
      820 + r
    );
  }
  // Concentric woven sedge ring band (`菅編み目`)
  drawCarvedKeyblockCurve(
    ctx,
    sampleQuad({ x: -brimHalfW * 0.58, y: coneApexY * 0.25 }, { x: 0, y: coneApexY * 0.25 + brimTiltY * 0.42 }, { x: brimHalfW * 0.58, y: coneApexY * 0.25 }, 10),
    1.0,
    1.25,
    1.0,
    'rgba(28, 22, 16, 0.52)',
    830
  );

  // 4. Inner Bamboo Head-Ring (`五徳 gotoku`) when underside tilts into view + Whipping Snapped Vermilion Chin-Straps (`紅紐`)!
  if (cosFlip < 0.2) {
    traceOrganicLoop(ctx, 0, coneApexY * 0.22, 8.5, 4.2, 0, 10, 0.08, 835);
    ctx.strokeStyle = '#5c3b1e';
    ctx.lineWidth = 2.0;
    ctx.stroke();
  }

  for (const side of [-1, 1]) {
    const strapWave = Math.sin(dt * 19.0 + side * 1.4) * 6.5;
    const strapPts = sampleCubic(
      { x: side * 7.5 + regBeni.dx * 0.5, y: 2.0 + regBeni.dy * 0.5 },
      { x: side * 14 + strapWave * 0.5, y: 12 },
      { x: side * 10 - strapWave * 0.7, y: 22 },
      { x: side * 17 + strapWave, y: 30 },
      10
    );
    drawCarvedKeyblockCurve(ctx, strapPts, 2.3, 1.9, 1.0, '#c23324', 840 + side);
    drawCarvedKeyblockCurve(ctx, strapPts, 0.9, 0.8, 0.5, '#171512', 845 + side);
  }

  ctx.restore();
}

/**
 * Draws the Authentic Edo Kachō-ga Woodblock Pelican & Mortise-Tenon Susudake / 32-Rib Janome Wagasa Bicycle!
 * ZERO drawRig2D, ZERO setLineDash, ZERO roundRect/strokeRect, ZERO geometric circle head!
 */
function drawUkiyoePelicanAndBike(ctx, rig, localT, galeEnv, isOutroThumbnail, breathDx, breathDy) {
  const s = rig.root.scale;
  const lw = (w) => Math.max(0.85, w * s);
  const riderGust = sampleGustAt(rig.root.x, localT, galeEnv, isOutroThumbnail);

  const tuckX = 11 * s * riderGust;
  const tuckY = 9 * s * riderGust;

  const chest = { x: rig.chest.x + tuckX * 0.7, y: rig.chest.y + tuckY * 0.7 };
  const bodyCenter = { x: rig.bodyCenter.x + tuckX * 0.35, y: rig.bodyCenter.y + tuckY * 0.45 };
  const neckC1 = { x: rig.neckC1.x + tuckX * 0.9, y: rig.neckC1.y + tuckY * 0.85 };
  const neckC2 = { x: rig.neckC2.x + tuckX * 1.05, y: rig.neckC2.y + tuckY * 0.95 };
  const head = { x: rig.head.x + tuckX, y: rig.head.y + tuckY, r: rig.head.r };
  const beakUpperBase = { x: rig.beakUpperBase.x + tuckX, y: rig.beakUpperBase.y + tuckY };
  const beakLowerBase = { x: rig.beakLowerBase.x + tuckX, y: rig.beakLowerBase.y + tuckY };
  const beakTip = { x: rig.beakTip.x + tuckX + 3 * s * riderGust, y: rig.beakTip.y + tuckY + 2 * s * riderGust };
  const pouchBelly = {
    x: rig.pouchBelly.x + tuckX,
    y: rig.pouchBelly.y + tuckY - 2 * s * riderGust,
  };
  const wingShoulder = { x: rig.wingShoulder.x + tuckX * 0.45, y: rig.wingShoulder.y + tuckY * 0.5 };
  const wingElbow = { x: rig.wingElbow.x + tuckX * 0.3, y: rig.wingElbow.y + tuckY * 0.35 };

  const regB = { dx: (PLATE_OFFSETS.blue.dx * 0.75 + breathDx) * s, dy: (PLATE_OFFSETS.blue.dy * 0.75 + breathDy) * s };
  const regR = { dx: (PLATE_OFFSETS.beni.dx * 0.75 - breathDx) * s, dy: (PLATE_OFFSETS.beni.dy * 0.75 + breathDy) * s };

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Organic rain-wet shadow wash on packed earth road
  ctx.fillStyle = 'rgba(26, 22, 17, 0.25)';
  traceOrganicLoop(ctx, rig.root.x, rig.root.y + 2 * s, 128 * s, 7.5 * s, rig.root.slope, 18, 0.11, 401);
  ctx.fill();

  // --- Helper 1: Authentic 32-Rib Janome Wagasa (蛇の目番傘) Oiled-Paper Wheel! ---
  const drawJanomeWagasaWheel = (w, seedBase) => {
    const r = w.r;
    const ribs = 32;
    ctx.save();
    ctx.translate(w.x, w.y);

    // Alternating oiled-paper sectors: Bero-ai Indigo, White Janome ring, and Bengara Vermilion!
    for (let i = 0; i < ribs; i++) {
      const a0 = w.angle + (i * Math.PI * 2) / ribs;
      const a1 = w.angle + ((i + 1) * Math.PI * 2) / ribs;
      const midA = (a0 + a1) * 0.5;
      const foldR = r - (2.6 + (i % 2) * 1.1) * s; // Accordion paper pleat scalloped edge!

      // Outer Indigo / Bengara alternating oiled-paper ring (r = 0.58R .. foldR)
      ctx.fillStyle = i % 4 === 0 ? 'rgba(186, 62, 42, 0.84)' : 'rgba(24, 58, 96, 0.86)';
      ctx.beginPath();
      ctx.moveTo(Math.cos(a0) * r * 0.58 + regB.dx * 0.5, Math.sin(a0) * r * 0.58 + regB.dy * 0.5);
      ctx.lineTo(Math.cos(a0) * foldR, Math.sin(a0) * foldR);
      ctx.lineTo(Math.cos(midA) * (foldR - 1.2 * s), Math.sin(midA) * (foldR - 1.2 * s));
      ctx.lineTo(Math.cos(a1) * foldR, Math.sin(a1) * foldR);
      ctx.lineTo(Math.cos(a1) * r * 0.58, Math.sin(a1) * r * 0.58);
      ctx.closePath();
      ctx.fill();

      // Classic Janome bullseye raw-washi white middle band (r = 0.34R .. 0.58R)
      ctx.fillStyle = 'rgba(250, 242, 224, 0.90)';
      ctx.beginPath();
      ctx.moveTo(Math.cos(a0) * r * 0.34, Math.sin(a0) * r * 0.34);
      ctx.lineTo(Math.cos(a0) * r * 0.58, Math.sin(a0) * r * 0.58);
      ctx.lineTo(Math.cos(a1) * r * 0.58, Math.sin(a1) * r * 0.58);
      ctx.lineTo(Math.cos(a1) * r * 0.34, Math.sin(a1) * r * 0.34);
      ctx.closePath();
      ctx.fill();

      // Inner vermilion lacquer rosette band (r = 0.16R .. 0.34R)
      ctx.fillStyle = 'rgba(188, 58, 40, 0.86)';
      ctx.beginPath();
      ctx.moveTo(Math.cos(a0) * r * 0.16 + regR.dx * 0.4, Math.sin(a0) * r * 0.16 + regR.dy * 0.4);
      ctx.lineTo(Math.cos(a0) * r * 0.34, Math.sin(a0) * r * 0.34);
      ctx.lineTo(Math.cos(a1) * r * 0.34, Math.sin(a1) * r * 0.34);
      ctx.lineTo(Math.cos(a1) * r * 0.16, Math.sin(a1) * r * 0.16);
      ctx.closePath();
      ctx.fill();
    }

    // 32 Split-Bamboo Umbrella Ribs (竹骨) + Hand-Woven Rokuro Silk Decorative Threading (かがり糸 — ZERO setLineDash!)
    ctx.strokeStyle = '#211912';
    ctx.lineWidth = lw(1.1);
    for (let i = 0; i < ribs; i++) {
      const a = w.angle + (i * Math.PI * 2) / ribs;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 5 * s, Math.sin(a) * 5 * s);
      ctx.lineTo(Math.cos(a) * (r - 2.5 * s), Math.sin(a) * (r - 2.5 * s));
      ctx.stroke();
    }

    // Crisscrossing silk thread polygon around Rokuro hub (replaces setLineDash!)
    ctx.strokeStyle = '#faf2e1';
    ctx.lineWidth = lw(1.25);
    ctx.beginPath();
    for (let i = 0; i <= ribs; i++) {
      const a = w.angle + (i * Math.PI * 2) / ribs;
      const rad = (i % 2 === 0 ? 15.5 : 18.2) * s;
      const px = Math.cos(a) * rad;
      const py = Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Steam-bent Keyaki wooden felloe rim + hand-forged iron tire band (irregular organic loop, not perfect compass arc!)
    traceOrganicLoop(ctx, 0, 0, r - 2.0 * s, r - 2.0 * s, w.angle, 28, 0.012, seedBase);
    ctx.strokeStyle = '#a87b3e';
    ctx.lineWidth = lw(4.3);
    ctx.stroke();

    traceOrganicLoop(ctx, 0, 0, r + 0.4 * s, r + 0.4 * s, w.angle, 28, 0.014, seedBase + 5);
    ctx.strokeStyle = '#171411';
    ctx.lineWidth = lw(3.1);
    ctx.stroke();

    // Turned hardwood Rokuro hub & brass lynchpin wedge
    ctx.fillStyle = '#54361c';
    traceOrganicLoop(ctx, 0, 0, 6.4 * s, 6.4 * s, w.angle, 12, 0.06, seedBase + 9);
    ctx.fill();
    ctx.strokeStyle = '#161310';
    ctx.lineWidth = lw(1.9);
    ctx.stroke();
    ctx.fillStyle = '#ddb365';
    ctx.fillRect(-1.8 * s, -2.6 * s, 3.6 * s, 5.2 * s);

    ctx.restore();
  };

  // --- Helper 2: Smoked Susudake Bamboo Spar with Swollen Nodes & Mortise-Tenon Wedges (煤竹・枘組)! ---
  const drawSusudakeBamboo = (p0, p1, thickness = 6.2, seed = 1) => {
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;
    const mid = {
      x: (p0.x + p1.x) * 0.5 + nx * 1.3 * s * (seed % 2 === 0 ? 1 : -1),
      y: (p0.y + p1.y) * 0.5 + ny * 1.3 * s * (seed % 2 === 0 ? 1 : -1),
    };
    const curve = sampleQuad(p0, mid, p1, 8);

    // Bamboo ochre-amber fill + smoked dark-side shading
    drawCarvedKeyblockCurve(ctx, curve, lw(thickness + 3.2), lw(thickness + 2.8), lw(thickness + 3.2), '#171411', seed);
    drawCarvedKeyblockCurve(ctx, curve, lw(thickness), lw(thickness * 0.94), lw(thickness), '#bd8e49', seed + 1);
    const shadeCurve = curve.map((pt) => ({ x: pt.x - nx * thickness * 0.18 * s, y: pt.y - ny * thickness * 0.18 * s }));
    drawCarvedKeyblockCurve(ctx, shadeCurve, lw(thickness * 0.44), lw(thickness * 0.4), lw(thickness * 0.44), '#734e23', seed + 2);

    // Double-ring swollen bamboo culm nodes (竹節)
    const nodes = Math.max(1, Math.floor(len / (27 * s)));
    for (let k = 1; k <= nodes; k++) {
      const u = k / (nodes + 1);
      const idx = Math.min(curve.length - 1, Math.round(u * (curve.length - 1)));
      const mp = curve[idx];
      const hw = thickness * 0.68 * s;
      for (const off of [-1.2 * s, 1.2 * s]) {
        drawCarvedKeyblockCurve(
          ctx,
          [
            { x: mp.x + ux * off - nx * hw, y: mp.y + uy * off - ny * hw },
            { x: mp.x + ux * off + nx * hw, y: mp.y + uy * off + ny * hw },
          ],
          lw(1.7),
          lw(2.0),
          lw(1.7),
          '#1f1710',
          seed + k * 7
        );
      }
    }
  };

  // --- Helper 3: Palm-Hemp Cross Lashing & Hardwood Mortise Wedge (棕櫚縄 & 込栓木楔) ---
  const drawJoineryNode = (pt, r = 5.4, seed = 1) => {
    // Protruding carpenter mortise tenon peg (木楔)
    ctx.fillStyle = '#6e4924';
    ctx.fillRect(pt.x - (r + 2.5) * s, pt.y - 2.2 * s, (r * 2 + 5) * s, 4.4 * s);
    drawCarvedRectBorder(ctx, pt.x - (r + 2.5) * s, pt.y - 2.2 * s, (r * 2 + 5) * s, 4.4 * s, lw(1.4), '#161310', seed);

    // Blackened Shuro-nawa palm-fiber lashing ball
    ctx.fillStyle = '#251d16';
    traceOrganicLoop(ctx, pt.x, pt.y, r * s, r * 0.92 * s, 0.2, 10, 0.12, seed + 3);
    ctx.fill();
    ctx.strokeStyle = '#14110e';
    ctx.lineWidth = lw(1.5);
    ctx.stroke();

    // Crisscrossing hemp binding strands
    ctx.strokeStyle = '#ab8450';
    ctx.lineWidth = lw(1.15);
    ctx.beginPath();
    ctx.moveTo(pt.x - 3.4 * s, pt.y - 3.2 * s);
    ctx.lineTo(pt.x + 3.4 * s, pt.y + 3.2 * s);
    ctx.moveTo(pt.x - 3.4 * s, pt.y + 3.2 * s);
    ctx.lineTo(pt.x + 3.4 * s, pt.y - 3.2 * s);
    ctx.stroke();
  };

  // --- Helper 4: Twisted Hemp Rope Drive Chain (麻縄鎖 — ZERO setLineDash!) ---
  const drawTwistedHempRope = (p0, p1) => {
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const dist = Math.hypot(dx, dy) || 1;
    const steps = Math.max(6, Math.round(dist / (5.5 * s)));
    const ux = dx / dist;
    const uy = dy / dist;
    const nx = -uy;
    const ny = ux;
    for (let i = 0; i < steps; i++) {
      const u = (i + 0.5) / steps;
      const mx = p0.x + dx * u;
      const my = p0.y + dy * u;
      ctx.fillStyle = i % 2 === 0 ? '#785a34' : '#4f391f';
      traceOrganicLoop(ctx, mx, my, 2.8 * s, 1.5 * s, Math.atan2(dy, dx) + 0.38, 7, 0.1, 410 + i);
      ctx.fill();
      ctx.strokeStyle = '#181512';
      ctx.lineWidth = lw(0.95);
      ctx.stroke();
    }
    // Slight catenary slack shadow line
    drawCarvedKeyblockCurve(
      ctx,
      [{ x: p0.x + nx * 1.1 * s, y: p0.y + ny * 1.1 * s }, { x: p1.x + nx * 1.1 * s, y: p1.y + ny * 1.1 * s }],
      lw(0.9),
      lw(1.1),
      lw(0.9),
      'rgba(24,21,18,0.65)',
      430
    );
  };

  const drawUkiyoeLeg = (hipPt, kneePt, footPt, pedalPt, isFar) => {
    drawSusudakeBamboo(rig.bb, pedalPt, 4.4, isFar ? 440 : 445);

    const legCol = isFar ? '#b55628' : '#d97232';
    // Scaly bird tarsus & webbed foot with carved keyblock outline
    drawCarvedKeyblockCurve(ctx, [hipPt, kneePt, footPt], lw(8.0), lw(7.3), lw(6.4), '#171512', isFar ? 450 : 455);
    drawCarvedKeyblockCurve(
      ctx,
      [
        { x: hipPt.x + regR.dx * 0.5, y: hipPt.y },
        { x: kneePt.x + regR.dx * 0.5, y: kneePt.y },
        { x: footPt.x + regR.dx * 0.5, y: footPt.y },
      ],
      lw(4.8),
      lw(4.4),
      lw(3.8),
      legCol,
      isFar ? 451 : 456
    );

    // Webbed pelican foot gripping Edo Geta wooden block pedal!
    const footPoly = [
      { x: footPt.x - 5 * s, y: footPt.y },
      { x: footPt.x + 17 * s, y: footPt.y + 1.8 * s },
      { x: footPt.x + 13 * s, y: footPt.y + 5.2 * s },
      { x: footPt.x + 9 * s, y: footPt.y + 7.2 * s },
      { x: footPt.x - 6 * s, y: footPt.y + 5 * s },
      { x: footPt.x - 5 * s, y: footPt.y },
    ];
    ctx.fillStyle = legCol;
    ctx.beginPath();
    ctx.moveTo(footPoly[0].x, footPoly[0].y);
    for (const p of footPoly) ctx.lineTo(p.x, p.y);
    ctx.closePath();
    ctx.fill();
    drawCarvedKeyblockCurve(ctx, footPoly, lw(1.8), lw(2.0), lw(1.7), '#171512', 460);

    // Two-toothed Edo Geta wooden sandal pedal (下駄踏板 — hand-carved border, zero strokeRect!)
    ctx.fillStyle = '#966834';
    ctx.fillRect(pedalPt.x - 10.5 * s, pedalPt.y + 1 * s, 21 * s, 5 * s);
    drawCarvedRectBorder(ctx, pedalPt.x - 10.5 * s, pedalPt.y + 1 * s, 21 * s, 5 * s, lw(1.7), '#171512', 465);
    ctx.fillStyle = '#593919';
    ctx.fillRect(pedalPt.x - 7.5 * s, pedalPt.y + 6 * s, 3.8 * s, 4.2 * s);
    ctx.fillRect(pedalPt.x + 3.8 * s, pedalPt.y + 6 * s, 3.8 * s, 4.2 * s);
  };

  // 1. Far Leg & Both 32-Rib Janome Wagasa Wheels
  drawUkiyoeLeg(rig.leftHip, rig.leftKnee, rig.leftFoot, rig.leftPedal, true);
  drawJanomeWagasaWheel(rig.rearWheel, 470);
  drawJanomeWagasaWheel(rig.frontWheel, 480);

  // 2. Wooden Pegged Sprocket Wheel & Twisted Hemp Drive Rope
  ctx.fillStyle = 'rgba(185, 139, 72, 0.42)';
  traceOrganicLoop(ctx, rig.bb.x, rig.bb.y, 13.2 * s, 13.2 * s, rig.pedalAngle, 16, 0.04, 490);
  ctx.fill();
  ctx.strokeStyle = '#181512';
  ctx.lineWidth = lw(2.3);
  ctx.stroke();

  drawTwistedHempRope({ x: rig.rearWheel.x, y: rig.rearWheel.y - 6 * s }, { x: rig.bb.x, y: rig.bb.y - 12.8 * s });
  drawTwistedHempRope({ x: rig.rearWheel.x, y: rig.rearWheel.y + 6 * s }, { x: rig.bb.x, y: rig.bb.y + 12.8 * s });

  // Mortise-Tenon Susudake Bamboo Frame
  drawSusudakeBamboo(rig.rearWheel, rig.seatCluster, 5.0, 501);
  drawSusudakeBamboo(rig.rearWheel, rig.bb, 5.0, 504);
  drawSusudakeBamboo(rig.seatCluster, rig.bb, 6.0, 507);
  drawSusudakeBamboo(rig.seatCluster, rig.headTop, 6.2, 510);
  drawSusudakeBamboo(rig.bb, rig.headBot, 6.2, 513);
  drawSusudakeBamboo(rig.headTop, rig.headBot, 6.5, 516);
  drawSusudakeBamboo(rig.headBot, rig.frontWheel, 5.5, 519);
  drawSusudakeBamboo(rig.seatCluster, rig.saddle, 4.9, 522);
  drawSusudakeBamboo(rig.headTop, rig.stemTop, 4.9, 525);

  const barPts = sampleQuad(rig.stemTop, { x: rig.stemTop.x - 6 * s, y: rig.stemTop.y - 5.5 * s }, rig.handleGrip, 8);
  drawCarvedKeyblockCurve(ctx, barPts, lw(6.4), lw(5.9), lw(6.6), '#181512', 528);
  drawCarvedKeyblockCurve(ctx, barPts, lw(3.7), lw(3.5), lw(4.1), '#bd8e49', 529);

  drawJoineryNode(rig.seatCluster, 5.3, 531);
  drawJoineryNode(rig.headTop, 5.1, 535);
  drawJoineryNode(rig.headBot, 5.1, 539);
  drawJoineryNode(rig.bb, 5.5, 543);

  // Woven Tatami-rush saddle cushion + tied Furoshiki bundle & bamboo tea canteen behind saddle (zero roundRect!)
  const sadPts = [
    { x: rig.saddle.x - 16 * s, y: rig.saddle.y - 3.5 * s },
    { x: rig.saddle.x + 13 * s, y: rig.saddle.y - 4.0 * s },
    { x: rig.saddle.x + 14 * s, y: rig.saddle.y + 3.8 * s },
    { x: rig.saddle.x - 15 * s, y: rig.saddle.y + 4.2 * s },
    { x: rig.saddle.x - 16 * s, y: rig.saddle.y - 3.5 * s },
  ];
  ctx.fillStyle = '#ccb074';
  ctx.beginPath();
  ctx.moveTo(sadPts[0].x, sadPts[0].y);
  for (const p of sadPts) ctx.lineTo(p.x, p.y);
  ctx.closePath();
  ctx.fill();
  drawCarvedKeyblockCurve(ctx, sadPts, lw(2.1), lw(2.3), lw(2.0), '#181512', 550);

  const packX = rig.saddle.x - 19 * s;
  const packY = rig.saddle.y + 3 * s;
  ctx.fillStyle = '#b8402e';
  traceOrganicLoop(ctx, packX + regR.dx * 0.5, packY + regR.dy * 0.5, 10.2 * s, 7.5 * s, -0.3, 12, 0.12, 555);
  ctx.fill();
  traceOrganicLoop(ctx, packX, packY, 10.2 * s, 7.5 * s, -0.3, 12, 0.12, 555);
  ctx.strokeStyle = '#171512';
  ctx.lineWidth = lw(1.8);
  ctx.stroke();

  // Green cut-bamboo travel flask (竹水筒)
  ctx.fillStyle = '#5a7a48';
  ctx.fillRect(packX - 6 * s, packY + 2 * s, 7.2 * s, 14 * s);
  drawCarvedRectBorder(ctx, packX - 6 * s, packY + 2 * s, 7.2 * s, 14 * s, lw(1.6), '#171512', 558);

  // 3. Hiroshige Kachō-ga (花鳥版画) Pelican Torso, S-Neck & Faceted Carved Skull (ZERO geometric circle head!)
  // Torso Gofun white base + Atenashi-bokashi slate-indigo belly under-wipe (`版ズレ` shifted!)
  const tracePelicanTorso = (ox = 0, oy = 0) => {
    ctx.beginPath();
    ctx.moveTo(rig.tailTip.x - 5 * s + ox, rig.tailTip.y - 2 * s + oy);
    ctx.quadraticCurveTo(bodyCenter.x - 36 * s + ox, bodyCenter.y - 31 * s + oy, chest.x + 11 * s + ox, chest.y - 7 * s + oy);
    ctx.quadraticCurveTo(bodyCenter.x + 36 * s + ox, bodyCenter.y + 26 * s + oy, rig.hip.x - 14 * s + ox, rig.hip.y + 15 * s + oy);
    ctx.quadraticCurveTo(bodyCenter.x - 46 * s + ox, bodyCenter.y + 16 * s + oy, rig.tailTip.x - 5 * s + ox, rig.tailTip.y - 2 * s + oy);
    ctx.closePath();
  };

  ctx.fillStyle = '#fbf6ea';
  tracePelicanTorso(0, 0);
  ctx.fill();

  // `版ズレ` slate-blue woodblock belly bokashi wipe
  ctx.save();
  tracePelicanTorso(regB.dx, regB.dy);
  ctx.clip();
  ctx.fillStyle = 'rgba(138, 162, 178, 0.55)';
  traceOrganicLoop(ctx, bodyCenter.x - 4 * s, bodyCenter.y + 18 * s, 46 * s, 14 * s, 0.08, 14, 0.14, 560);
  ctx.fill();
  ctx.restore();

  // Carved dark indigo-charcoal tail primary feathers (尾羽)
  for (let tf = 0; tf < 3; tf++) {
    const tyOff = (tf - 1) * 4.5 * s;
    ctx.fillStyle = tf === 1 ? '#1e2f40' : '#2c4257';
    ctx.beginPath();
    ctx.moveTo(rig.tailTip.x + 14 * s, rig.tailTip.y + tyOff);
    ctx.lineTo(rig.tailTip.x - (9 - tf * 2) * s, rig.tailTip.y - 3 * s + tyOff * 0.8);
    ctx.lineTo(rig.tailTip.x + 15 * s, rig.tailTip.y + 5 * s + tyOff);
    ctx.closePath();
    ctx.fill();
    drawCarvedKeyblockCurve(
      ctx,
      [
        { x: rig.tailTip.x + 14 * s, y: rig.tailTip.y + tyOff },
        { x: rig.tailTip.x - (9 - tf * 2) * s, y: rig.tailTip.y - 3 * s + tyOff * 0.8 },
      ],
      lw(1.8),
      lw(2.1),
      lw(1.2),
      '#161412',
      565 + tf
    );
  }

  const torsoOutline = sampleQuad(
    { x: rig.tailTip.x - 5 * s, y: rig.tailTip.y - 2 * s },
    { x: bodyCenter.x - 36 * s, y: bodyCenter.y - 31 * s },
    { x: chest.x + 11 * s, y: chest.y - 7 * s },
    12
  );
  const bellyOutline = sampleQuad(
    { x: chest.x + 11 * s, y: chest.y - 7 * s },
    { x: bodyCenter.x + 34 * s, y: bodyCenter.y + 28 * s },
    { x: rig.tailTip.x - 5 * s, y: rig.tailTip.y - 2 * s },
    12
  );
  drawCarvedKeyblockCurve(ctx, torsoOutline, lw(2.5), lw(3.7), lw(2.6), '#161412', 570);
  drawCarvedKeyblockCurve(ctx, bellyOutline, lw(2.4), lw(3.3), lw(2.2), '#161412', 571);

  // Delicate Kachō-ga dorsal feather imbrication lines (羽毛毛彫り)
  for (let f = 0; f < 4; f++) {
    const fx = bodyCenter.x - (22 - f * 10) * s;
    const fy = bodyCenter.y - (8 - f * 1.5) * s;
    drawCarvedKeyblockCurve(
      ctx,
      sampleQuad({ x: fx + 7 * s, y: fy - 3 * s }, { x: fx, y: fy + 2 * s }, { x: fx - 6 * s, y: fy - 1 * s }, 6),
      lw(0.9),
      lw(1.4),
      lw(0.8),
      'rgba(24, 22, 18, 0.55)',
      575 + f
    );
  }

  // S-Curved Neck with `版ズレ` slate shadow strip + Gofun white core + carved keyblock contours
  const neckSpine = sampleCubic({ x: chest.x - 1 * s, y: chest.y + 4 * s }, neckC1, neckC2, head, 12);
  drawCarvedKeyblockCurve(
    ctx,
    neckSpine.map((p) => ({ x: p.x + 2 * s + regB.dx * 0.5, y: p.y + 1 * s + regB.dy * 0.5 })),
    lw(20),
    lw(18),
    lw(16),
    '#c0ccd4',
    580
  );
  drawCarvedKeyblockCurve(ctx, neckSpine, lw(17.5), lw(16), lw(14.5), '#fbf6ea', 581);

  const neckLeftPts = sampleCubic(
    { x: chest.x - 10 * s, y: chest.y - 1 * s },
    { x: neckC1.x - 9 * s, y: neckC1.y },
    { x: neckC2.x - 10 * s, y: neckC2.y },
    { x: head.x - 11 * s, y: head.y },
    12
  );
  const neckRightPts = sampleCubic(
    { x: chest.x + 8 * s, y: chest.y + 7 * s },
    { x: neckC1.x + 9 * s, y: neckC1.y + 3 * s },
    { x: neckC2.x + 9 * s, y: neckC2.y + 2 * s },
    { x: head.x + 8 * s, y: head.y + 5 * s },
    12
  );
  drawCarvedKeyblockCurve(ctx, neckLeftPts, lw(2.6), lw(3.5), lw(2.5), '#161412', 582);
  drawCarvedKeyblockCurve(ctx, neckRightPts, lw(2.5), lw(3.3), lw(2.4), '#161412', 583);

  // Authentic Hiroshige Kachō-ga Faceted Bird Cranium & Nape Crest Feathers (ZERO ctx.arc circle!)
  const hr = head.r;
  const skullPts = [
    { x: head.x - hr * 0.92, y: head.y + hr * 0.35 },
    { x: head.x - hr * 1.32, y: head.y - hr * 0.12 }, // swept nape feather tuft 1
    { x: head.x - hr * 0.96, y: head.y - hr * 0.35 },
    { x: head.x - hr * 1.22, y: head.y - hr * 0.68 }, // swept nape feather tuft 2
    { x: head.x - hr * 0.55, y: head.y - hr * 0.95 }, // angular crown peak
    { x: head.x + hr * 0.38, y: head.y - hr * 0.96 }, // flat-topped pelican forehead
    { x: head.x + hr * 0.98, y: head.y - hr * 0.38 }, // lore / beak bridge
    { x: head.x + hr * 0.92, y: head.y + hr * 0.52 }, // cheek jowl
    { x: head.x - hr * 0.25, y: head.y + hr * 0.78 },
  ];
  ctx.fillStyle = '#fcf7eb';
  ctx.beginPath();
  ctx.moveTo(skullPts[0].x, skullPts[0].y);
  for (let i = 1; i < skullPts.length; i++) ctx.lineTo(skullPts[i].x, skullPts[i].y);
  ctx.closePath();
  ctx.fill();
  drawCarvedKeyblockCurve(ctx, skullPts, lw(2.4), lw(2.9), lw(2.2), '#161412', 588);

  // 4. Woodblock Beak & Pleated Gular Throat Pouch (Multi-plate ochre/vermilion bokashi + carved rib folds!)
  const tracePouch = (ox = 0, oy = 0) => {
    ctx.beginPath();
    ctx.moveTo(beakLowerBase.x + ox, beakLowerBase.y + oy);
    ctx.quadraticCurveTo(pouchBelly.x + ox, pouchBelly.y + oy, beakTip.x - 3 * s + ox, beakTip.y + 1 * s + oy);
    ctx.lineTo(beakUpperBase.x + ox, beakUpperBase.y + 4 * s + oy);
    ctx.closePath();
  };
  ctx.fillStyle = '#eba646';
  tracePouch(0, 0);
  ctx.fill();

  ctx.save();
  tracePouch(regR.dx, regR.dy);
  ctx.clip();
  ctx.fillStyle = 'rgba(196, 68, 40, 0.76)';
  traceOrganicLoop(ctx, pouchBelly.x, pouchBelly.y - 2 * s, 38 * s, 14 * s, 0.1, 14, 0.12, 592);
  ctx.fill();
  ctx.restore();

  for (let f = 1; f <= 3; f++) {
    const fu = f * 0.23;
    drawCarvedKeyblockCurve(
      ctx,
      sampleQuad(
        { x: beakLowerBase.x + 3 * s, y: beakLowerBase.y + f * 2 * s },
        { x: lerp(beakUpperBase.x + 25 * s, pouchBelly.x, fu), y: lerp(beakUpperBase.y + 6 * s, pouchBelly.y, fu) },
        { x: beakTip.x - (10 + f * 6) * s, y: beakTip.y },
        8
      ),
      lw(1.0),
      lw(1.35),
      lw(0.8),
      'rgba(78, 26, 14, 0.55)',
      595 + f
    );
  }

  const pouchCurve = sampleQuad(beakLowerBase, pouchBelly, { x: beakTip.x - 3 * s, y: beakTip.y + 1 * s }, 12);
  drawCarvedKeyblockCurve(ctx, pouchCurve, lw(2.3), lw(3.3), lw(2.2), '#161412', 600);

  // Upper culmen mandible + hooked vermilion nail tip
  const beakPoly = [
    beakUpperBase,
    { x: beakTip.x + 1.5 * s, y: beakTip.y - 3.2 * s },
    { x: beakTip.x + 5.2 * s, y: beakTip.y + 2.8 * s },
    { x: beakTip.x - 2.2 * s, y: beakTip.y + 6.2 * s },
    { x: beakLowerBase.x, y: beakLowerBase.y + 1 * s },
    beakUpperBase,
  ];
  ctx.fillStyle = '#f0b854';
  ctx.beginPath();
  ctx.moveTo(beakPoly[0].x, beakPoly[0].y);
  for (const p of beakPoly) ctx.lineTo(p.x, p.y);
  ctx.closePath();
  ctx.fill();
  // Vermilion beak nail blush (`版ズレ`)
  ctx.fillStyle = '#c83f28';
  traceOrganicLoop(ctx, beakTip.x + regR.dx * 0.6, beakTip.y + 1.5 * s + regR.dy * 0.6, 8 * s, 4.2 * s, 0.3, 8, 0.15, 603);
  ctx.fill();
  drawCarvedKeyblockCurve(ctx, beakPoly, lw(2.3), lw(2.6), lw(2.1), '#161412', 605);

  // Sharp Kachō-ga almond eye & determined fierce brow (眼光炯々)
  const ex = head.x + 4.5 * s;
  const ey = head.y - 2.2 * s;
  ctx.fillStyle = '#f7df74';
  traceOrganicLoop(ctx, ex, ey, 4.6 * s, 3.3 * s, -0.08, 10, 0.1, 610);
  ctx.fill();
  drawCarvedKeyblockCurve(
    ctx,
    [{ x: ex - 4.8 * s, y: ey + 0.3 * s }, { x: ex, y: ey - 3.4 * s }, { x: ex + 4.8 * s, y: ey + 0.5 * s }, { x: ex, y: ey + 3.2 * s }, { x: ex - 4.8 * s, y: ey + 0.3 * s }],
    lw(1.6),
    lw(1.9),
    lw(1.5),
    '#161412',
    611
  );
  ctx.fillStyle = '#141210';
  traceOrganicLoop(ctx, ex + 1.3 * s, ey + 0.1 * s, 1.9 * s, 1.9 * s, 0, 8, 0.08, 612);
  ctx.fill();
  drawCarvedKeyblockCurve(ctx, [{ x: ex - 5.8 * s, y: ey - 5.0 * s }, { x: ex + 6.0 * s, y: ey - 2.4 * s }], lw(2.6), lw(2.2), lw(1.4), '#161412', 613);

  // 5. Whipping Indigo-Dyed Mame-Shibori Tenugui Headband (豆絞り手拭い — organic hand-dyed tie-dye rings, zero roundRect!)
  const bandAngle = -0.14 + 0.08 * riderGust;
  ctx.save();
  ctx.translate(head.x, head.y - 7.8 * s);
  ctx.rotate(bandAngle);

  const tailLen = (86 + 38 * riderGust) * s;
  const waveFreq = 13 + riderGust * 8;
  for (let tIdx = 0; tIdx < 2; tIdx++) {
    const yOff = tIdx === 0 ? -3.6 * s : 4.3 * s;
    const L = tailLen * (tIdx === 0 ? 1.0 : 0.80);
    const halfBand = (tIdx === 0 ? 5.3 : 4.5) * s;

    const spine = [];
    const segs = 13;
    for (let i = 0; i <= segs; i++) {
      const u = i / segs;
      const sx = -14 * s - L * u;
      const sy =
        yOff -
        u * (8 + 11 * riderGust) * s +
        Math.sin(u * Math.PI * 2.5 - localT * waveFreq + tIdx * 1.45) * (5.5 + 8.5 * riderGust) * u * s;
      spine.push({ x: sx, y: sy, u });
    }

    const tailPoly = [];
    for (let i = 0; i <= segs; i++) {
      const wCur = halfBand * (1 - spine[i].u * 0.24);
      tailPoly.push({ x: spine[i].x, y: spine[i].y - wCur });
    }
    // Fringed cotton cloth end (切りっぱなし端)
    tailPoly.push({ x: spine[segs].x + 4.5 * s, y: spine[segs].y - 1.2 * s });
    tailPoly.push({ x: spine[segs].x - 1.5 * s, y: spine[segs].y + 0.8 * s });
    for (let i = segs; i >= 0; i--) {
      const wCur = halfBand * (1 - spine[i].u * 0.24);
      tailPoly.push({ x: spine[i].x, y: spine[i].y + wCur });
    }

    ctx.fillStyle = tIdx === 0 ? '#183e6b' : '#112c4e';
    ctx.beginPath();
    ctx.moveTo(tailPoly[0].x + regB.dx * 0.4, tailPoly[0].y + regB.dy * 0.4);
    for (const p of tailPoly) ctx.lineTo(p.x + regB.dx * 0.4, p.y + regB.dy * 0.4);
    ctx.closePath();
    ctx.fill();
    drawCarvedKeyblockCurve(ctx, tailPoly, lw(1.8), lw(2.0), lw(1.6), '#141210', 620 + tIdx);

    // Hand-dyed Mame-shibori tie-dye irregular ovals (with indigo bleed pinholes!)
    ctx.fillStyle = '#fbf6ea';
    for (let i = 1; i < segs; i++) {
      const pt = spine[i];
      traceOrganicLoop(ctx, pt.x, pt.y - 1.7 * s, 1.7 * s, 1.45 * s, 0.2 * i, 7, 0.22, 630 + i);
      ctx.fill();
      traceOrganicLoop(ctx, pt.x + 3.3 * s, pt.y + 1.8 * s, 1.6 * s, 1.35 * s, -0.3 * i, 7, 0.22, 650 + i);
      ctx.fill();
    }
  }

  // Twisted cotton Hachimaki brow band & knot (carved organic polygon, zero roundRect/arc!)
  const browPoly = [
    { x: -16.5 * s, y: -4.6 * s },
    { x: 0, y: -5.4 * s },
    { x: 16.5 * s, y: -4.2 * s },
    { x: 15.8 * s, y: 4.6 * s },
    { x: 0, y: 5.2 * s },
    { x: -16.2 * s, y: 4.5 * s },
    { x: -16.5 * s, y: -4.6 * s },
  ];
  ctx.fillStyle = '#1b4373';
  ctx.beginPath();
  ctx.moveTo(browPoly[0].x + regB.dx * 0.4, browPoly[0].y + regB.dy * 0.4);
  for (const p of browPoly) ctx.lineTo(p.x + regB.dx * 0.4, p.y + regB.dy * 0.4);
  ctx.closePath();
  ctx.fill();
  drawCarvedKeyblockCurve(ctx, browPoly, lw(2.0), lw(2.3), lw(2.0), '#141210', 670);

  ctx.fillStyle = '#fbf6ea';
  for (let dx = -11.5; dx <= 11.5; dx += 5.2) {
    traceOrganicLoop(ctx, dx * s, -1.8 * s, 1.55 * s, 1.35 * s, 0.15, 7, 0.2, 680 + dx);
    ctx.fill();
    traceOrganicLoop(ctx, (dx + 2.4) * s, 1.9 * s, 1.5 * s, 1.3 * s, -0.2, 7, 0.2, 690 + dx);
    ctx.fill();
  }

  // Jaunty twisted Hachimaki knot
  ctx.fillStyle = '#14355c';
  traceOrganicLoop(ctx, -15.8 * s, 0, 6.0 * s, 5.4 * s, 0.25, 10, 0.16, 700);
  ctx.fill();
  ctx.strokeStyle = '#141210';
  ctx.lineWidth = lw(1.9);
  ctx.stroke();

  ctx.restore();

  // 6. Near Leg & Layered Kachō-ga Wing with Carved Coverts & Primary Flight Feathers!
  drawUkiyoeLeg(rig.rightHip, rig.rightKnee, rig.rightFoot, rig.rightPedal, false);

  const traceWing = (ox = 0, oy = 0) => {
    ctx.beginPath();
    ctx.moveTo(wingShoulder.x + ox, wingShoulder.y + oy);
    ctx.quadraticCurveTo(wingElbow.x - 19 * s + ox, wingElbow.y + 21 * s + oy, rig.wingTip.x + 5 * s + ox, rig.wingTip.y + 2 * s + oy);
    ctx.quadraticCurveTo(wingElbow.x + 13 * s + ox, wingElbow.y - 9 * s + ox, wingShoulder.x + 13 * s + ox, wingShoulder.y + 2 * s + oy);
    ctx.closePath();
  };
  ctx.fillStyle = '#fcf7eb';
  traceWing(0, 0);
  ctx.fill();

  // Indigo-charcoal primary wingtips (`版ズレ` shifted!)
  ctx.save();
  traceWing(regB.dx, regB.dy);
  ctx.clip();
  ctx.fillStyle = '#24384d';
  traceOrganicLoop(ctx, rig.wingTip.x - 2 * s, rig.wingTip.y + 2 * s, 22 * s, 13 * s, -0.2, 12, 0.15, 710);
  ctx.fill();
  ctx.fillStyle = 'rgba(154, 176, 190, 0.55)';
  traceOrganicLoop(ctx, wingElbow.x - 4 * s, wingElbow.y + 7 * s, 24 * s, 12 * s, -0.1, 12, 0.15, 711);
  ctx.fill();
  ctx.restore();

  // Scalloped Kachō-ga secondary covert feather chisel cuts (覆羽の毛彫り — replaces arc!)
  for (let tier = 0; tier < 4; tier++) {
    const tu = 0.20 + tier * 0.19;
    const sx = lerp(wingShoulder.x - 3 * s, rig.wingTip.x - 5 * s, tu);
    const sy = lerp(wingShoulder.y + 4 * s, rig.wingTip.y + 1 * s, tu);
    drawCarvedKeyblockCurve(
      ctx,
      sampleQuad({ x: sx - 5.5 * s, y: sy + 2 * s }, { x: sx, y: sy + 7.2 * s }, { x: sx + 5.8 * s, y: sy + 0.5 * s }, 7),
      lw(1.1),
      lw(1.65),
      lw(1.0),
      '#181613',
      720 + tier
    );
  }

  drawCarvedKeyblockCurve(
    ctx,
    [
      wingShoulder,
      { x: wingElbow.x - 9 * s, y: wingElbow.y + 12 * s },
      { x: rig.wingTip.x + 5 * s, y: rig.wingTip.y + 2 * s },
      { x: wingElbow.x + 8 * s, y: wingElbow.y - 4 * s },
      { x: wingShoulder.x + 13 * s, y: wingShoulder.y + 2 * s },
    ],
    lw(2.6),
    lw(3.3),
    lw(2.2),
    '#161412',
    730
  );

  ctx.restore();
}

/**
 * Draws Hiroshige's Sudden Shower at Shōno (庄野白雨) using pre-baked tapered chisel spindle rain sprites
 * modulated by the right-to-left gust wavefront + road splash crowns & paddy water ripples!
 */
function drawHiroshigeSlantedRain(ctx, kit, rainSheet, localT, galeEnv, isOutroThumbnail) {
  const rng = kit.makePRNG(11083);
  const spriteCanvas = rainSheet.canvas;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 18, PANEL_SIZE, PANEL_SIZE - 36);
  ctx.clip();

  // Diagonal sumi squall cloud wash sweeping in from top-right during Bar 2
  if (galeEnv > 0.02) {
    ctx.fillStyle = `rgba(18, 30, 46, ${(0.22 * galeEnv).toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(220, 18);
    ctx.lineTo(PANEL_SIZE, 18);
    ctx.lineTo(PANEL_SIZE, 540);
    ctx.quadraticCurveTo(640, 410, 220, 18);
    ctx.closePath();
    ctx.fill();
  }

  const dirX = -0.328;
  const dirY = 0.945;
  const rainAngle = Math.atan2(dirY, dirX);
  const totalStreaks = Math.round(150 + 185 * galeEnv);

  const base = ctx.getTransform();
  const cA = Math.cos(rainAngle);
  const sA = Math.sin(rainAngle);

  for (let i = 0; i < totalStreaks; i++) {
    const seedX = rng() * 1420;
    const seedY = rng() * 1160;
    const speed = 820 + (i % 5) * 150;
    const travel = localT * speed;

    const x0 = ((seedX + travel * dirX) % 1420 + 1420) % 1420 - 160;
    const y0 = ((seedY + travel * dirY) % 1160) - 160;
    const gLoc = sampleGustAt(x0, localT, galeEnv, isOutroThumbnail);
    const len = (215 + (i % 8) * 34) * (0.82 + 0.36 * gLoc);
    const plate = i % 4;

    ctx.globalAlpha = (plate === 0 ? 0.62 : plate === 2 ? 0.54 : 0.44) * (0.42 + 0.58 * gLoc);
    ctx.setTransform(
      base.a * cA + base.c * sA,
      base.b * cA + base.d * sA,
      base.a * -sA + base.c * cA,
      base.b * -sA + base.d * cA,
      base.a * x0 + base.c * y0 + base.e,
      base.b * x0 + base.d * y0 + base.f
    );
    ctx.drawImage(spriteCanvas, 0, plate * 14 + 2, 256, 12, 0, -2.2, len, 4.4);
  }
  ctx.setTransform(base);
  ctx.globalAlpha = 1;

  // Rain splash crowns on wet Tōkaidō road, wind-ripples on flooded rice paddies & flying pine needles!
  if (galeEnv > 0.08) {
    const splashCount = Math.round(36 * galeEnv);
    ctx.strokeStyle = `rgba(252, 246, 234, ${(0.70 * galeEnv).toFixed(3)})`;
    ctx.lineWidth = 1.35;
    for (let s = 0; s < splashCount; s++) {
      const sx = ((s * 97 + Math.floor(localT * 16) * 61) % 940) + 30;
      const { y: roadY } = sampleTokaidoRoad(kit, sx);
      const sy = roadY - 36 + ((s * 29) % 52);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx - 5.5, sy - 5.5);
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 4.8, sy - 6.5);
      ctx.stroke();
    }

    // Propagating wind-ripples across the lower flooded terraced rice paddies!
    ctx.strokeStyle = `rgba(246, 239, 222, ${(0.34 * galeEnv).toFixed(3)})`;
    ctx.lineWidth = 1.15;
    for (let r = 0; r < 22; r++) {
      const rx = 980 - ((localT * 195 + r * 89) % 960);
      const ry = 758 + ((r * 43) % 190);
      ctx.beginPath();
      ctx.moveTo(rx - 22, ry);
      ctx.quadraticCurveTo(rx, ry - 2.2, rx + 22, ry);
      ctx.stroke();
    }

    // Wind-torn Kuromatsu pine needles sweeping across midground
    ctx.fillStyle = `rgba(26, 46, 28, ${(0.82 * galeEnv).toFixed(3)})`;
    for (let n = 0; n < 18; n++) {
      const nx = 960 - ((localT * 410 + n * 113) % 1020);
      const ny = 400 + ((n * 47) % 240) + Math.sin(localT * 7 + n) * 14;
      ctx.beginPath();
      ctx.moveTo(nx, ny);
      ctx.lineTo(nx - 14, ny + 3.5);
      ctx.lineTo(nx - 12, ny + 5.8);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.restore();
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

  const g = slot.g2d;
  const ctx = g.drawingContext;
  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  const galeEnv = isOutroThumbnail
    ? 0.95
    : smoothstep(1.30, 2.02, localT) * (1 - smoothstep(3.95, 4.68, localT));

  // Subtle 12Hz handmade woodblock overprint registration breathing (±0.35px, smoothly zeroed at panel borders!)
  const edgeGuard = isOutroThumbnail
    ? 0
    : smoothstep(0, 95, pelicanLocalX) * (1 - smoothstep(PANEL_SIZE - 95, PANEL_SIZE, pelicanLocalX));
  const step12Hz = Math.floor(t * 12);
  const breathDx = (hash11(step12Hz * 3.1) - 0.5) * 0.72 * edgeGuard;
  const breathDy = (hash11(step12Hz * 7.7) - 0.5) * 0.72 * edgeGuard;

  // 1. Baked Hōeidō Ukiyo-e Woodblock Print Backdrop (includes dual native cartouches & Edo seals)
  const backdrop = getUkiyoeBackdrop(kit);
  const rainSheet = getRainSpriteSheet(kit);
  ctx.drawImage(backdrop.canvas, 0, 0);

  // 2. Dynamic Suruga Bay Edo Sailboats & Gust-Wavefront Black Pine Canopies
  drawSurugaSailboats(ctx, t, localT, galeEnv, isOutroThumbnail, breathDx, breathDy);
  drawWindBentPineCanopies(ctx, localT, galeEnv, isOutroThumbnail, breathDx, breathDy);

  // 3. Staggered Utagawa-Style Edo Travelers on Upper Post-Road Shoulder
  drawEdoTravelers(ctx, kit, localT, pelicanLocalX, galeEnv, isOutroThumbnail, breathDx, breathDy);

  // 4. Custom Kachō-ga Woodblock Pelican & Mortise-Tenon Susudake / Janome Wagasa Bicycle
  if (pelicanLocalX > -240 && pelicanLocalX < PANEL_SIZE + 240) {
    const { y: roadY, slope } = sampleTokaidoRoad(kit, pelicanLocalX);
    const rig = computePelicanRig({
      x: pelicanLocalX,
      y: roadY,
      pedalAngle,
      scale: 1.0,
      slope,
      speedScale,
      time: t,
    });
    drawUkiyoePelicanAndBike(ctx, rig, localT, galeEnv, isOutroThumbnail, breathDx, breathDy);
  }

  // 4b. Wind-Ripped Woven Bamboo Sugegasa Tumbling Diagonally Skyward Across the Rain Sky!
  drawFlyingSugegasa(ctx, localT, isOutroThumbnail, breathDx, breathDy);

  // 5. Dense Hiroshige Three-Plate Spindle Rain Squall, Paddy Ripples & Flying Pine Needles
  drawHiroshigeSlantedRain(ctx, kit, rainSheet, localT, galeEnv, isOutroThumbnail);

  // 6. Native Artwork Canvas: ZERO top-left modern UI card! Keep `isOutroThumbnail` bottom label for Outro 7x3 wall.
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(15, 14, 12, 0.76)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.fillStyle = '#f5f0e6';
    ctx.font = '700 48px "PelicanSerif", serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} ${scene.zh}`, 36, PANEL_SIZE - 48);
  }

  ctx.restore();
}
