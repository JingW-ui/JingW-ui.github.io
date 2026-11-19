// src/scenes/s06_qingming.js
// #06 清明上河图 (Along the River During the Qingming Festival · Bianjing Scroll, c. 1100 — r3 Museum Masterpiece)
// Homage to Zhang Zeduan's 《清明上河图》 (Beijing Palace Museum Handscroll):
// - Deep Palace Museum amber-tea aged handscroll silk (`故宫暗金茶褐熟绢包浆 #c8b089`), 2px silk warp/weft weave,
//   tea-stain oxidation patina, and vertical handscroll rolling creases (`卷摺丝裂纹`)
// - WebGL2 `kit.bakeBrush` (`p5.brush` Kubelka-Munk silty Bian River ochre-slate mineral washes & willow mist)
//   transferred once via `fb.get().canvas` into `bake2D` (`slot.usedFb = false`, 100% Outro-safe, <18ms/frame)
// - Authentic hand-ruled `界画` brush engine (`jiehuaStroke`, `jiehuaQuad`, `paintSongTileRoof`) with hair-brush
//   entry/exit pause beads (`起收顿挫蓄墨锋节`), silk-tooth modulation, Song `退晕` shading, and scalloped roof tiles
//   — 100% eradicating `strokeRect`, `roundRect`, `setLineDash`, and `createRadialGradient` glow balls!
// - Irregular upstream muddy silt shoals, reed islets, stepped stone quays, moored perspective barges,
//   varied 3/4-perspective overlapping Bianjing tiled compounds & mat sheds, and gnarled ink-strand willows
//   (ZERO smooth highway riverbanks, ZERO copy-paste box houses, ZERO `ctx.ellipse` green willow balloons!)
// - Palace Museum 5-rib × 9-transom woven-timber pierless Rainbow Bridge (`五排叠梁巨木穿插无柱木拱虹桥`)
//   with wood-grain beam ends, iron dovetail clamps (`燕尾铁锔`), deep vaulted shadow, and carved `勾阑望柱`
// - Old elmwood mortise-and-tenon Song bicycle with grooved wooden rope-pulley drive, 16-spoke iron-clamped
//   segmented wooden wheels, bamboo sutra chest (`竹书箧`) & swaying wine gourd + Gongbi clam-white pelican
// - Dual-plot climax: 15 `钉头鼠尾描` Song townsfolk left-to-right domino wave + river barge crew lowering mast (`虹桥过船`)!

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  clamp,
  lerp,
  smoothstep,
} from '../beat/timeline.js';
import { computePelicanRig } from '../rig/pelican.js';
import { INK_SHADES } from '../kit/ink.js';

const ARCH_H = 125;

const SONG_PIGMENTS = {
  ochreLight: '#cfa474',
  ochreMid: '#9f6c3e',
  ochreDark: '#6b4526',
  indigoLight: '#889da0',
  indigoMid: '#566f78',
  indigoDark: '#36474f',
  sapGreenLight: '#8d9d72',
  sapGreenMid: '#667852',
  sapGreenDark: '#445336',
  cinnabarMuted: '#ab4232',
  clamWhite: '#f7efe0',
};

/**
 *Deterministic lightweight hash in [0, 1) for subtle hand-ruled Jiehua brush modulation.
 */
function brushHash(n) {
  let x = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13;
  x = Math.imul(x, 0xc2b2ae35);
  return ((x ^ (x >>> 16)) >>> 0) * 2.3283064365386963e-10;
}

/**
 * Transfers a baked `p5.Framebuffer` into a 2D canvas context once via `fb.get().canvas`.
 */
function copyBrushFbTo2D(fb, ctx, w = PANEL_SIZE, h = PANEL_SIZE) {
  if (!fb || typeof fb.get !== 'function') return false;
  const img = fb.get();
  const srcCanvas = img && img.canvas ? img.canvas : null;
  if (!srcCanvas) return false;
  ctx.drawImage(srcCanvas, 0, 0, w, h);
  return true;
}

/**
 * Fills a polygon path cleanly.
 */
function fillPoly(ctx, pts, fillStyle, alpha = 1.0) {
  if (pts.length < 3) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Subdivides a polyline into organic muddy shoals / stone / bark contours.
 */
function subdivideOrganic(ctrlPts, rng, iterations = 2, roughness = 0.15, closed = false) {
  let pts = ctrlPts.map((p) => [p[0], p[1]]);
  for (let it = 0; it < iterations; it++) {
    const next = [];
    const len = closed ? pts.length : pts.length - 1;
    const falloff = Math.pow(0.58, it);
    for (let i = 0; i < len; i++) {
      const p0 = pts[i];
      const p1 = pts[(i + 1) % pts.length];
      next.push(p0);
      const dx = p1[0] - p0[0];
      const dy = p1[1] - p0[1];
      const segLen = Math.hypot(dx, dy);
      if (segLen < 4.0) continue;
      const nx = -dy / segLen;
      const ny = dx / segLen;
      const tSplit = 0.36 + rng() * 0.28;
      const disp = (rng() - 0.48) * segLen * roughness * falloff;
      next.push([p0[0] + dx * tSplit + nx * disp, p0[1] + dy * tSplit + ny * disp]);
    }
    if (!closed) next.push(pts[pts.length - 1]);
    pts = next;
  }
  return pts;
}

/**
 * Core Northern Song `界画` Ruled-Brush Operator (`界尺引笔算子`):
 * Simulates a fine wolf-hair brush guided along a grooved wooden ruler on silk —
 * featuring organic entry/exit ink pause knots (`起收顿挫蓄墨锋节`) and subtle silk-weave width breathing!
 * Completely replaces mechanical `strokeRect` / uniform CAD lines!
 */
function jiehuaStroke(ctx, x0, y0, x1, y1, width = 1.2, color = INK_SHADES.jiao, alpha = 0.90) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  if (len < 0.4) return;

  const nx = -dy / len;
  const ny = dx / len;
  const seed = ((x0 * 17 + y0 * 31 + x1 * 47 + y1 * 13) | 0);
  const segs = Math.max(2, Math.min(7, Math.ceil(len / 28)));

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';

  let px = x0;
  let py = y0;
  for (let s = 1; s <= segs; s++) {
    const u = s / segs;
    const h = brushHash(seed + s * 71);
    const jitter = s < segs ? (h - 0.5) * 0.36 : 0;
    const qx = lerp(x0, x1, u) + nx * jitter;
    const qy = lerp(y0, y1, u) + ny * jitter;
    const endPress = s === 1 || s === segs ? 1.16 : 0.88 + 0.24 * h;
    ctx.lineWidth = Math.max(0.45, width * endPress);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(qx, qy);
    ctx.stroke();
    px = qx;
    py = qy;
  }

  // Tiny irregular brush pause ink beads (`藏锋起笔与驻锋收笔墨节`)
  if (width >= 0.9) {
    const r0 = width * 0.62;
    ctx.beginPath();
    ctx.moveTo(x0 - r0, y0);
    ctx.lineTo(x0, y0 - r0 * 0.85);
    ctx.lineTo(x0 + r0, y0 + r0 * 0.15);
    ctx.lineTo(x0, y0 + r0 * 0.85);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x1 - r0 * 0.9, y1);
    ctx.lineTo(x1, y1 - r0 * 0.8);
    ctx.lineTo(x1 + r0 * 0.95, y1);
    ctx.lineTo(x1, y1 + r0 * 0.85);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Fills and rules a 4-point architectural plane with `jiehuaStroke` (zero `fillRect`/`strokeRect`!).
 */
function jiehuaQuad(ctx, pts, fillCol, strokeCol = INK_SHADES.jiao, lineW = 1.15, alpha = 1.0) {
  if (fillCol) fillPoly(ctx, pts, fillCol, alpha);
  if (strokeCol && lineW > 0) {
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[(i + 1) % pts.length];
      jiehuaStroke(ctx, x0, y0, x1, y1, lineW, strokeCol, 0.88 * alpha);
    }
  }
}

/**
 * Convenience helper for axis-aligned architectural panels drawn as hand-ruled `jiehuaQuad`.
 */
function jiehuaBox(ctx, x, y, w, h, fillCol, strokeCol = INK_SHADES.jiao, lineW = 1.15, alpha = 1.0) {
  jiehuaQuad(
    ctx,
    [
      [x, y],
      [x + w, y + 0.2],
      [x + w - 0.15, y + h],
      [x + 0.15, y + h - 0.15],
    ],
    fillCol,
    strokeCol,
    lineW,
    alpha
  );
}

/**
 * Draws a hand-ruled Song timber beam (`界画巨木方梁`) with `退晕` highlight/shadow wood faces,
 * longitudinal wood-grain split seams, and optional iron dovetail clamp (`燕尾铁锔`).
 */
function drawJiehuaBeam(
  ctx,
  x0,
  y0,
  x1,
  y1,
  thickness,
  fillCol = '#9b6c40',
  strokeCol = INK_SHADES.jiao,
  withIronClamp = false
) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * (thickness * 0.5);
  const ny = (dx / len) * (thickness * 0.5);

  const p0 = [x0 + nx, y0 + ny];
  const p1 = [x1 + nx, y1 + ny];
  const p2 = [x1 - nx, y1 - ny];
  const p3 = [x0 - nx, y0 - ny];

  fillPoly(ctx, [p0, p1, p2, p3], fillCol, 1.0);

  // Song `退晕` underside bevel shadow along lower half of timber
  fillPoly(
    ctx,
    [
      [(p0[0] + p3[0]) * 0.5, (p0[1] + p3[1]) * 0.5],
      [(p1[0] + p2[0]) * 0.5, (p1[1] + p2[1]) * 0.5],
      p2,
      p3,
    ],
    'rgba(28, 20, 13, 0.26)',
    1.0
  );

  jiehuaStroke(ctx, p0[0], p0[1], p1[0], p1[1], 1.18, strokeCol, 0.90);
  jiehuaStroke(ctx, p2[0], p2[1], p3[0], p3[1], 1.28, strokeCol, 0.92);
  jiehuaStroke(ctx, p1[0], p1[1], p2[0], p2[1], 1.05, strokeCol, 0.86);
  jiehuaStroke(ctx, p3[0], p3[1], p0[0], p0[1], 1.05, strokeCol, 0.86);

  // Fine wood-grain check crack (`老榆木顺纹裂隙`)
  jiehuaStroke(
    ctx,
    lerp(x0, x1, 0.14) + nx * 0.22,
    lerp(y0, y1, 0.14) + ny * 0.22,
    lerp(x0, x1, 0.86) + nx * 0.18,
    lerp(y0, y1, 0.86) + ny * 0.18,
    0.62,
    'rgba(32, 23, 15, 0.42)',
    0.8
  );

  if (withIronClamp) {
    const mx = (x0 + x1) * 0.5;
    const my = (y0 + y1) * 0.5;
    const ux = (dx / len) * 4.5;
    const uy = (dy / len) * 4.5;
    fillPoly(
      ctx,
      [
        [mx - ux + nx * 0.65, my - uy + ny * 0.65],
        [mx + ux + nx * 0.65, my + uy + ny * 0.65],
        [mx + ux * 0.7 - nx * 0.65, my + uy * 0.7 - ny * 0.65],
        [mx - ux * 0.7 - nx * 0.65, my - uy * 0.7 - ny * 0.65],
      ],
      '#23201c',
      0.92
    );
  }
}

/**
 * Draws a tapered `钉头鼠尾描` calligraphic stroke for garments, branches, and waves.
 */
function drawNailRatStroke(ctx, x0, y0, x1, y1, w0, w1, color = INK_SHADES.jiao, bend = 0, alpha = 0.92) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const mx = (x0 + x1) * 0.5 + nx * bend;
  const my = (y0 + y1) * 0.5 + ny * bend;
  const wm = (w0 + w1) * 0.28;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x0 - (dx / len) * w0 * 0.35, y0 - (dy / len) * w0 * 0.35);
  ctx.quadraticCurveTo(x0 + nx * w0 * 0.52, y0 + ny * w0 * 0.52, mx + nx * wm, my + ny * wm);
  ctx.quadraticCurveTo(x1 + nx * w1 * 0.48, y1 + ny * w1 * 0.48, x1 + (dx / len) * w1 * 0.3, y1 + (dy / len) * w1 * 0.3);
  ctx.quadraticCurveTo(x1 - nx * w1 * 0.48, y1 - ny * w1 * 0.48, mx - nx * wm, my - ny * wm);
  ctx.quadraticCurveTo(x0 - nx * w0 * 0.52, y0 - ny * w0 * 0.52, x0 - (dx / len) * w0 * 0.35, y0 - (dy / len) * w0 * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draws an organic polygonal ink/mineral dot (replaces geometric `ctx.arc` circles!).
 */
function fillOrganicDot(ctx, cx, cy, rx, ry, rot, fillCol, strokeCol = null, lineW = 0.9, alpha = 1.0) {
  const c = Math.cos(rot);
  const s = Math.sin(rot);
  const local = [
    [-rx * 0.94, -ry * 0.20],
    [-rx * 0.38, -ry * 0.96],
    [rx * 0.45, -ry * 0.88],
    [rx * 0.96, -ry * 0.10],
    [rx * 0.60, ry * 0.90],
    [-rx * 0.40, ry * 0.94],
  ].map(([lx, ly]) => [cx + lx * c - ly * s, cy + lx * s + ly * c]);

  fillPoly(ctx, local, fillCol, alpha);
  if (strokeCol) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = lineW;
    ctx.beginPath();
    ctx.moveTo(local[0][0], local[0][1]);
    for (let i = 1; i < local.length; i++) ctx.lineTo(local[i][0], local[i][1]);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * Paints a varied 3/4-axonometric Northern Song Bianjing courtyard/shop/shed compound
 * (`错落透视坡顶瓦舍、悬山粉墙、席棚竹篱与粮袋垛` — ZERO identical copy-pasted flat grey boxes!).
 */
function paintBianjingCompoundCluster(ctx, rng, x, y, scale = 1.0, flip = 1, variant = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale * flip, scale);

  const paintSlopedTileRoof = (rx0, ry0, rx1, ry1, eaveDrop, eaveFlare, tileSpacing = 5.5, shade = '#545b58') => {
    const roofPoly = [
      [rx0, ry0],
      [rx1, ry1],
      [rx1 + eaveFlare, ry1 + eaveDrop],
      [rx0 - eaveFlare, ry0 + eaveDrop + 2],
    ];
    fillPoly(ctx, roofPoly, shade, 0.96);
    // Ridge beam (`正脊`) + owl-tail finials (`鸱吻`)
    jiehuaStroke(ctx, rx0 - 2, ry0, rx1 + 2, ry1, 2.2, '#2d312f', 0.94);
    jiehuaStroke(ctx, rx0 - 1, ry0, rx0 - 3, ry0 - 3.5, 1.4, INK_SHADES.jiao, 0.9);
    jiehuaStroke(ctx, rx1 + 1, ry1, rx1 + 3, ry1 - 3.5, 1.4, INK_SHADES.jiao, 0.9);

    // Individual `筒瓦/板瓦` tile ribs & scalloped drip-eave (`瓦当滴水`)
    const nTiles = Math.max(4, Math.floor((rx1 - rx0) / tileSpacing));
    for (let i = 0; i <= nTiles; i++) {
      const u = i / nTiles;
      const txTop = lerp(rx0, rx1, u);
      const tyTop = lerp(ry0, ry1, u);
      const txBot = lerp(rx0 - eaveFlare, rx1 + eaveFlare, u);
      const tyBot = lerp(ry0 + eaveDrop + 2, ry1 + eaveDrop, u);
      jiehuaStroke(ctx, txTop, tyTop, txBot, tyBot, 0.68, 'rgba(22, 22, 20, 0.62)', 0.85);
      // Tiny drip-tile bead at eave
      fillOrganicDot(ctx, txBot, tyBot + 0.6, 1.2, 0.9, 0, '#2a2d2b', null, 0, 0.85);
    }
    jiehuaStroke(ctx, rx0 - eaveFlare, ry0 + eaveDrop + 2, rx1 + eaveFlare, ry1 + eaveDrop, 1.25, INK_SHADES.jiao, 0.9);
  };

  if (variant === 0) {
    // Variant A: L-Shaped 3/4 Perspective Courtyard Hall + Gable Side-Wing + Bamboo Lattice Fence (`四合瓦舍竹篱院`)
    // Side gable wall (`山墙粉壁`)
    jiehuaQuad(
      ctx,
      [[-58, -14], [-34, -34], [-14, -14], [-14, 18], [-58, 16]],
      '#dfd0b2',
      INK_SHADES.nong,
      1.0
    );
    // Front 3/4 perspective hall wall
    jiehuaQuad(
      ctx,
      [[-14, -14], [48, -18], [48, 16], [-14, 18]],
      '#cebba0',
      INK_SHADES.nong,
      1.0
    );
    // Dark open shopfront & lattice window
    jiehuaBox(ctx, -4, -4, 18, 21, 'rgba(42, 34, 25, 0.72)', INK_SHADES.jiao, 0.9);
    jiehuaBox(ctx, 22, -5, 18, 12, 'rgba(235, 224, 198, 0.78)', INK_SHADES.nong, 0.8);
    paintSlopedTileRoof(-36, -35, 46, -39, 22, 10, 5.2, '#555c59');

    // Woven bamboo courtyard fence (`交织竹篱笆`) + courtyard jujube tree
    for (let fx = -78; fx <= -42; fx += 5.5) {
      jiehuaStroke(ctx, fx, 6, fx + 4, 22, 0.8, '#8c6d43', 0.82);
      jiehuaStroke(ctx, fx + 4, 6, fx, 22, 0.8, '#735834', 0.82);
    }
    jiehuaStroke(ctx, -80, 8, -38, 9, 1.1, '#5e4628', 0.88);
  } else if (variant === 1) {
    // Variant B: Stepped Two-Roof Riverside Granary Shop + Woven-Mat Awning (`临河粮行与席棚凉伞`) + Grain Sacks!
    jiehuaQuad(
      ctx,
      [[-44, -24], [24, -28], [24, 14], [-44, 16]],
      '#d9c8a8',
      INK_SHADES.nong,
      1.0
    );
    paintSlopedTileRoof(-46, -42, 22, -46, 19, 9, 5.4, '#4e5552');

    // Projecting woven-reed awning (`斜撑芦席棚`) supported by bamboo poles
    jiehuaQuad(
      ctx,
      [[-12, -10], [54, -13], [64, 3], [-4, 6]],
      '#cbb07c',
      INK_SHADES.jiao,
      0.95
    );
    for (let sx = -6; sx <= 52; sx += 7.5) {
      jiehuaStroke(ctx, sx, -11, sx + 8, 4, 0.65, 'rgba(68, 50, 28, 0.55)', 0.8);
    }
    jiehuaStroke(ctx, 58, 3, 58, 24, 1.3, '#5c4226', 0.9);
    jiehuaStroke(ctx, 2, 5, 2, 24, 1.3, '#5c4226', 0.9);

    // Stacked hemp grain sacks (`码头麻袋粮垛`) outside shop
    for (const [gx, gy] of [[18, 20], [32, 20], [25, 15]]) {
      fillOrganicDot(ctx, gx, gy, 7.5, 3.6, -0.05, '#dccaa8', INK_SHADES.nong, 0.8);
    }
  } else {
    // Variant C: Thatched Rustic Dockside Shed + Earthen Courtyard Wall (`郊野茅草席舍与土墙`)
    jiehuaQuad(ctx, [[-52, 0], [8, -2], [8, 20], [-52, 22]], '#c9b592', INK_SHADES.nong, 0.95);
    // Warm ochre thatched gable roof (`茅草坡顶`)
    const thatchPts = [[-60, 2], [-38, -18], [4, -20], [18, 0]];
    fillPoly(ctx, thatchPts, '#b59663', 0.95);
    for (let tx = -52; tx <= 10; tx += 4.2) {
      drawNailRatStroke(ctx, tx * 0.72 - 12, -18, tx, 1 + (rng() - 0.5) * 1.8, 0.9, 0.5, '#5e492b', 0, 0.72);
    }
    jiehuaStroke(ctx, -38, -18, 4, -20, 1.6, '#4a3820', 0.88);
    // Adjacent tiled gatehouse
    jiehuaQuad(ctx, [[12, -8], [48, -10], [48, 18], [12, 19]], '#dfd1b4', INK_SHADES.nong, 0.95);
    paintSlopedTileRoof(10, -23, 46, -25, 15, 7, 5.2, '#5a615e');
  }

  ctx.restore();
}

/**
 * Paints an authentic Zhang Zeduan Pollarded Bian River Willow (`张择端盘曲苍老墨干 + 万缕攒点细垂丝古柳`
 * — ZERO `ctx.ellipse` green balloons anywhere!).
 */
function paintWillowTree(ctx, rng, baseX, baseY, scale = 1.0, lean = 1, isDistant = false) {
  ctx.save();
  ctx.translate(baseX, baseY);
  ctx.scale(scale, scale);

  // Gnarled, twisted, knot-scarred willow trunk (`盘曲树瘤苍干`)
  const trunkLeft = subdivideOrganic([[-13, 0], [-10, -38], [lean * 7 - 11, -86]], rng, 2, 0.14);
  const trunkRight = subdivideOrganic([[15, 0], [10, -40], [lean * 17 + 8, -90]], rng, 2, 0.14).reverse();
  const trunkPoly = [...trunkLeft, ...trunkRight];
  fillPoly(ctx, trunkPoly, isDistant ? 'rgba(112, 88, 62, 0.72)' : '#835e3b', 1.0);

  // Calligraphic rough bark outlines & hollow knot scar (`老柳树洞疤痕`)
  for (let i = 0; i < trunkLeft.length - 1; i++) {
    drawNailRatStroke(
      ctx,
      trunkLeft[i][0],
      trunkLeft[i][1],
      trunkLeft[i + 1][0],
      trunkLeft[i + 1][1],
      2.3,
      1.8,
      INK_SHADES.jiao,
      0,
      isDistant ? 0.62 : 0.92
    );
  }
  for (let i = 0; i < trunkRight.length - 1; i++) {
    drawNailRatStroke(
      ctx,
      trunkRight[i][0],
      trunkRight[i][1],
      trunkRight[i + 1][0],
      trunkRight[i + 1][1],
      2.3,
      1.8,
      INK_SHADES.jiao,
      0,
      isDistant ? 0.62 : 0.92
    );
  }
  if (!isDistant) {
    fillOrganicDot(ctx, lean * 3, -49, 3.6, 7.4, lean * 0.18, INK_SHADES.jiao, null, 0, 0.88);
    // Vertical bark texture strokes (`树皮皴纹`)
    for (let k = -2; k <= 2; k++) {
      drawNailRatStroke(ctx, k * 3.2, -8, lean * 5 + k * 2.6, -78, 0.9, 0.6, 'rgba(32, 24, 16, 0.52)', lean * 2);
    }
  }

  // Pollarded crooked crown boughs (`杀头柳盘曲枝干`)
  const boughs = [
    [-7, -84, -44, -124],
    [-2, -88, -18, -142],
    [4, -89, 16, -144],
    [9, -88, 36, -132],
    [13, -85, 52, -114],
  ];
  for (const [x0, y0, x1, y1] of boughs) {
    const mx = (x0 + x1) * 0.5 + lean * 7 + (rng() - 0.5) * 8;
    const my = (y0 + y1) * 0.5 - 8;
    drawNailRatStroke(ctx, x0 + lean * 8, y0, mx, my, 2.8, 1.8, INK_SHADES.nong, 0, isDistant ? 0.55 : 0.88);
    drawNailRatStroke(ctx, mx, my, x1 + lean * 10, y1, 1.8, 0.85, INK_SHADES.nong, 0, isDistant ? 0.50 : 0.84);
  }

  // Pure Fine Weeping Willow Brush Strands + `攒点` Sap-Green/Indigo Leaf Buds (ZERO `ctx.ellipse` balloons!)
  const strandCount = isDistant ? 58 : 118;
  for (let i = 0; i < strandCount; i++) {
    const u = i / (strandCount - 1);
    const archX = lerp(-56, 58, u) + lean * 10 + (rng() - 0.5) * 9;
    const archY = -108 - 36 * Math.sin(Math.PI * u) + (rng() - 0.5) * 16;
    const len = (isDistant ? 30 : 44) + rng() * 48;
    const sway = lean * (8 + rng() * 10) + (rng() - 0.5) * 10;

    ctx.strokeStyle =
      i % 3 === 0
        ? `rgba(54, 70, 44, ${isDistant ? 0.36 : 0.58})`
        : i % 3 === 1
        ? `rgba(88, 108, 66, ${isDistant ? 0.34 : 0.54})`
        : `rgba(74, 94, 88, ${isDistant ? 0.28 : 0.44})`;
    ctx.lineWidth = isDistant ? 0.68 : 0.82;
    ctx.beginPath();
    ctx.moveTo(archX, archY);
    ctx.bezierCurveTo(
      archX + sway * 0.35,
      archY + len * 0.36,
      archX + sway * 0.78,
      archY + len * 0.72,
      archX + sway,
      archY + len
    );
    ctx.stroke();

    // Delicate spring willow leaf buds (`柳叶攒点`) clinging along the weeping strands!
    const buds = isDistant ? 2 : 4;
    for (let b = 1; b <= buds; b++) {
      const bu = (b - 0.3 + rng() * 0.5) / buds;
      const bx = archX + sway * (bu * bu) + (rng() - 0.5) * 2.2;
      const by = archY + len * bu;
      fillOrganicDot(
        ctx,
        bx,
        by,
        1.65,
        0.85,
        0.9 + lean * 0.2,
        b % 2 === 0 ? 'rgba(104, 124, 76, 0.55)' : 'rgba(66, 86, 54, 0.50)'
      );
    }
  }

  ctx.restore();
}

/**
 * Paints an antique eroded Song collector seal (`宣和 / 秘府 残破朱白文印`, zero `strokeRect`!).
 */
function paintQingmingSeal(ctx, cx, cy, w, h, rng, chars = ['宣', '和'], intaglio = false) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rng() - 0.5) * 0.03);

  const hw = w * 0.5;
  const hh = h * 0.5;
  const rim = subdivideOrganic([[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]], rng, 2, 0.07, true);

  if (intaglio) {
    fillPoly(ctx, rim, 'rgba(156, 38, 26, 0.68)', 1.0);
    ctx.fillStyle = 'rgba(202, 180, 142, 0.84)';
  } else {
    fillPoly(ctx, rim, 'rgba(156, 38, 26, 0.10)', 1.0);
    for (let i = 0; i < rim.length; i++) {
      const [x0, y0] = rim[i];
      const [x1, y1] = rim[(i + 1) % rim.length];
      jiehuaStroke(ctx, x0, y0, x1, y1, 1.5, 'rgba(156, 38, 26, 0.72)', 0.85);
    }
    ctx.fillStyle = 'rgba(156, 38, 26, 0.72)';
  }

  ctx.font = `600 ${Math.round(Math.min(w, h) * 0.38)}px "PelicanWenKai", "PelicanSerif", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (chars.length === 2) {
    ctx.fillText(chars[0], 0, -hh * 0.42);
    ctx.fillText(chars[1], 0, hh * 0.42);
  } else if (chars.length === 4) {
    ctx.fillText(chars[0], hw * 0.44, -hh * 0.44);
    ctx.fillText(chars[1], hw * 0.44, hh * 0.44);
    ctx.fillText(chars[2], -hw * 0.44, -hh * 0.44);
    ctx.fillText(chars[3], -hw * 0.44, hh * 0.44);
  }

  ctx.fillStyle = 'rgba(200, 176, 138, 0.56)';
  for (let i = 0; i < 14; i++) {
    ctx.fillRect((rng() - 0.5) * w * 0.9, (rng() - 0.5) * h * 0.9, 1.3 + rng() * 1.4, 0.9 + rng() * 1.1);
  }
  ctx.restore();
}

/**
 * Paints the Left-Bank Open-Front Waterside Tea Pavilion (`左岸临水王家茶坊`)
 * using 100% hand-ruled `jiehuaStroke` & `jiehuaBox` (zero `strokeRect` / `roundRect`!).
 */
function paintLeftBankTeaPavilion(ctx, rng) {
  ctx.save();
  // Main timber hall (x = 0..128, y = 458..644)
  jiehuaBox(ctx, 0, 458, 128, 186, '#d6c29d', INK_SHADES.jiao, 1.3);
  jiehuaBox(ctx, 8, 488, 98, 138, 'rgba(46, 36, 26, 0.68)', null, 0);

  // Rolled-up woven bamboo sun-blinds (`竹卷帘`)
  jiehuaBox(ctx, 8, 483, 98, 15, '#c19f68', INK_SHADES.jiao, 1.0);
  for (let ly = 486.5; ly < 497; ly += 3.4) {
    jiehuaStroke(ctx, 9, ly, 105, ly, 0.65, 'rgba(48, 36, 22, 0.68)', 0.85);
  }

  // Square Song wooden table, benches & white Jingdezhen `影青` tea ewer/cups
  jiehuaBox(ctx, 32, 576, 44, 6, '#96683c', INK_SHADES.jiao, 1.05);
  jiehuaBox(ctx, 36, 582, 4, 38, '#7a522e', INK_SHADES.jiao, 0.85);
  jiehuaBox(ctx, 68, 582, 4, 38, '#7a522e', INK_SHADES.jiao, 0.85);
  fillOrganicDot(ctx, 46, 572, 3.3, 3.0, 0, '#ebefea', INK_SHADES.nong, 0.7);
  fillOrganicDot(ctx, 60, 573, 2.5, 2.0, 0, '#ebefea', INK_SHADES.nong, 0.65);

  // Two seated Song tea drinkers in draped robes (`钉头鼠尾` folds, zero `roundRect`!)
  for (const [px, col, dir] of [[24, '#889da0', 1], [82, '#c59666', -1]]) {
    jiehuaBox(ctx, px - 7, 592, 14, 26, '#764e2c', INK_SHADES.jiao, 0.85);
    const robePts = [
      [px - 7.5, 593],
      [px - 6.5, 561],
      [px + 6.5, 561],
      [px + 7.8, 593],
    ];
    fillPoly(ctx, robePts, col, 0.98);
    for (let i = 0; i < robePts.length; i++) {
      const [ax, ay] = robePts[i];
      const [bx, by] = robePts[(i + 1) % robePts.length];
      drawNailRatStroke(ctx, ax, ay, bx, by, 1.15, 0.95, INK_SHADES.jiao, 0);
    }
    // Folded hands/sleeves resting toward table
    drawNailRatStroke(ctx, px + dir * 3, 568, px + dir * 9, 574, 3.6, 2.6, col, 0);
    fillOrganicDot(ctx, px + dir * 0.8, 553, 4.6, 5.1, 0, '#e4c9a8', INK_SHADES.jiao, 0.95);
    jiehuaBox(ctx, px - 4.2, 546, 8.8, 4.2, INK_SHADES.nong, INK_SHADES.jiao, 0.8);
  }

  // Timber columns & low front `勾阑` balustrade
  for (const cx of [4, 56, 106, 124]) {
    jiehuaBox(ctx, cx, 458, 6, 186, '#74452d', INK_SHADES.jiao, 1.05);
  }
  jiehuaBox(ctx, 4, 616, 122, 26, '#9a6d42', INK_SHADES.jiao, 1.05);
  for (let bx = 16; bx < 122; bx += 15) {
    jiehuaStroke(ctx, bx, 617, bx, 641, 0.85, INK_SHADES.jiao, 0.8);
  }

  // Overhanging swept Song hip-and-gable tile roof (`歇山瓦檐`, y = 402..465)
  const roofPts = [[0, 464], [0, 402], [96, 408], [120, 438], [146, 464]];
  fillPoly(ctx, roofPts, '#525956', 0.98);
  jiehuaStroke(ctx, 0, 402, 98, 408, 2.4, '#2c302e', 0.95);
  jiehuaStroke(ctx, 96, 408, 146, 464, 1.6, INK_SHADES.jiao, 0.92);
  jiehuaStroke(ctx, 0, 464, 146, 464, 1.4, INK_SHADES.jiao, 0.92);
  for (let gx = 8; gx < 140; gx += 7.5) {
    const topX = Math.min(96, gx * 0.68);
    const topY = lerp(404, 409, topX / 96);
    jiehuaStroke(ctx, topX, topY, gx, 463, 0.72, 'rgba(20, 20, 18, 0.62)', 0.85);
    fillOrganicDot(ctx, gx, 464.5, 1.4, 1.0, 0, '#2a2d2b');
  }

  // Authentic Song Tea Banners (`新茶` & `香飲子` — pure classical calligraphy, zero modern metadata!)
  drawJiehuaBeam(ctx, 126, 474, 165, 468, 2.8, '#6e4c2e');
  jiehuaBox(ctx, 138, 470, 22, 49, '#f2e6cb', SONG_PIGMENTS.indigoMid, 1.7);
  ctx.fillStyle = INK_SHADES.jiao;
  ctx.font = '600 13px "PelicanWenKai", "PelicanSerif", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('新', 149, 484);
  ctx.fillText('茶', 149, 504);

  jiehuaBox(ctx, 111, 492, 16, 56, '#efe3c6', INK_SHADES.jiao, 1.0);
  ctx.font = '600 11px "PelicanWenKai", "PelicanSerif", serif';
  ctx.fillText('香', 119, 504);
  ctx.fillText('飲', 119, 520);
  ctx.fillText('子', 119, 536);

  // Slanted Song Market Bamboo Sun Umbrella (`市井竹骨油布大伞` — polygonal segmented canopy, zero `ellipse`!)
  drawJiehuaBeam(ctx, 158, 650, 152, 528, 2.6, '#6e4d2d');
  const umbPts = [];
  const ribs = 12;
  for (let i = 0; i < ribs; i++) {
    const a = (i / ribs) * Math.PI * 2;
    umbPts.push([152 + Math.cos(a) * 43, 535 + Math.sin(a) * 12.2 - Math.cos(a) * 2.5]);
  }
  fillPoly(ctx, umbPts, '#e8dbc0', 0.97);
  for (let i = 0; i < ribs; i++) {
    const [ux, uy] = umbPts[i];
    const [nx, ny] = umbPts[(i + 1) % ribs];
    jiehuaStroke(ctx, 152, 529, ux, uy, 0.72, 'rgba(48, 38, 26, 0.68)', 0.85);
    jiehuaStroke(ctx, ux, uy, nx, ny, 1.15, INK_SHADES.jiao, 0.90);
  }

  ctx.restore();
}

/**
 * Paints the Right-Bank Grand Two-Story Song Winehouse (`孫家正店`) + 3D Bound-Bamboo `彩楼欢门`!
 * 100% hand-ruled `jiehuaStroke`, zero `strokeRect`, strictly authentic Song calligraphy!
 */
function paintGrandSongWineTavern(ctx) {
  ctx.save();
  const x0 = 820;
  const w = 174;

  // Ground floor open tavern hall
  jiehuaBox(ctx, x0 + 8, 468, w - 12, 174, '#d6c39f', INK_SHADES.jiao, 1.35);
  jiehuaBox(ctx, x0 + 20, 486, 118, 142, 'rgba(38, 30, 22, 0.70)', null, 0);

  // Counter & clay-sealed Song wine jars (`泥封紅綢酒壇`, sculpted Bezier jars)
  jiehuaBox(ctx, x0 + 18, 568, 102, 58, '#96683e', INK_SHADES.jiao, 1.1);
  for (let j = 0; j < 4; j++) {
    const jx = x0 + 32 + j * 22;
    const jy = 556;
    fillOrganicDot(ctx, jx, jy, 8.2, 10.8, 0, '#6e4c31', INK_SHADES.jiao, 1.0);
    jiehuaBox(ctx, jx - 4.8, jy - 13, 9.6, 4.2, SONG_PIGMENTS.cinnabarMuted, INK_SHADES.jiao, 0.8);
  }

  // Timber pillars
  for (const px of [x0 + 12, x0 + 74, x0 + 136, x0 + 172]) {
    jiehuaBox(ctx, px, 338, 7, 304, '#75432c', INK_SHADES.jiao, 1.1);
  }

  // Mid-floor belt roof eave (`腰檐瓦垄`)
  const beltPts = [[x0 - 20, 472], [x0 + 2, 452], [x0 + 16, 443], [x0 + w, 443], [x0 + w, 472]];
  fillPoly(ctx, beltPts, '#535a57', 0.98);
  jiehuaStroke(ctx, x0 + 16, 443, x0 + w, 443, 1.5, INK_SHADES.jiao, 0.9);
  jiehuaStroke(ctx, x0 - 20, 472, x0 + w, 472, 1.4, INK_SHADES.jiao, 0.92);
  for (let bx = x0 - 12; bx < x0 + w - 4; bx += 8) {
    jiehuaStroke(ctx, Math.max(x0 + 14, bx + 14), 444, bx, 471, 0.7, 'rgba(20, 20, 18, 0.6)', 0.85);
    fillOrganicDot(ctx, bx, 472.5, 1.3, 0.9, 0, '#272a28');
  }

  // Upper floor dining gallery (`二楼雅座格子窗`)
  jiehuaBox(ctx, x0 + 14, 338, w - 20, 105, '#e1d1b2', INK_SHADES.jiao, 1.15);
  for (let wx = x0 + 24; wx < x0 + 160; wx += 22) {
    jiehuaBox(ctx, wx, 350, 18, 66, 'rgba(244, 235, 214, 0.55)', 'rgba(52, 40, 28, 0.78)', 0.85);
    for (let ly = 362; ly < 414; ly += 12) {
      jiehuaStroke(ctx, wx, ly, wx + 18, ly, 0.7, 'rgba(52, 40, 28, 0.72)', 0.85);
    }
    jiehuaStroke(ctx, wx + 9, 350, wx + 9, 416, 0.65, 'rgba(52, 40, 28, 0.65)', 0.8);
  }

  // Two 2nd-floor Song scholars leaning over balcony rail watching the bridge!
  for (const [dx, col] of [[x0 + 46, '#748991'], [x0 + 96, '#c29464']]) {
    fillOrganicDot(ctx, dx, 396, 5.2, 5.6, 0, '#e3c8a6', INK_SHADES.jiao, 0.95);
    jiehuaBox(ctx, dx - 7, 402, 14, 15, col, INK_SHADES.jiao, 0.95);
    jiehuaBox(ctx, dx - 5.5, 388, 11, 4.2, INK_SHADES.nong, INK_SHADES.jiao, 0.8);
  }

  // Upper balcony carved `勾阑` balustrade
  jiehuaBox(ctx, x0 + 6, 416, w - 8, 27, '#996b40', INK_SHADES.jiao, 1.1);
  for (let bx = x0 + 16; bx < x0 + w - 8; bx += 16) {
    jiehuaStroke(ctx, bx, 416, bx, 443, 0.95, INK_SHADES.jiao, 0.85);
  }

  // Grand Swept Song Hip-and-Gable Tile Roof (`重檐歇山飞檐瓦顶` + `瓦当滴水` + `鸱吻`)
  const mainRoof = [[x0 - 34, 340], [x0 + 6, 320], [x0 + 38, 248], [x0 + w + 6, 248], [x0 + w + 6, 340]];
  fillPoly(ctx, mainRoof, '#4f5654', 0.99);
  jiehuaStroke(ctx, x0 - 34, 340, x0 + 6, 320, 1.6, INK_SHADES.jiao, 0.94);
  jiehuaStroke(ctx, x0 + 6, 320, x0 + 38, 248, 1.6, INK_SHADES.jiao, 0.94);
  jiehuaStroke(ctx, x0 - 34, 340, x0 + w + 6, 340, 1.6, INK_SHADES.jiao, 0.94);
  for (let i = 0; i < 18; i++) {
    const txTop = x0 + 38 + i * 8.8;
    const txBot = x0 - 28 + i * 12.2;
    jiehuaStroke(ctx, Math.min(x0 + w + 4, txTop), 250, Math.min(x0 + w + 4, txBot), 339, 0.82, 'rgba(20, 20, 18, 0.65)', 0.88);
    if (txBot <= x0 + w + 4) {
      fillOrganicDot(ctx, txBot, 341.2, 1.5, 1.0, 0, '#262928');
    }
  }
  jiehuaBox(ctx, x0 + 34, 240, w - 28, 9, '#343836', INK_SHADES.jiao, 1.2);
  // Sculpted Song `鸱吻` ridge finial
  fillPoly(ctx, [[x0 + 34, 244], [x0 + 25, 232], [x0 + 30, 223], [x0 + 41, 240]], '#343836', 1.0);
  jiehuaStroke(ctx, x0 + 34, 244, x0 + 27, 226, 1.3, INK_SHADES.jiao, 0.92);

  // Authentic Classical Song Plaque: 「孫家正店」 (traditional script, zero modern numbers!)
  jiehuaBox(ctx, x0 + 42, 470, 68, 22, '#231e19', '#cfa474', 1.25);
  ctx.fillStyle = '#f0dcb4';
  ctx.font = '600 13px "PelicanWenKai", "PelicanSerif", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('孫家正店', x0 + 76, 481);

  // 3D Crisscross Bound-Bamboo `彩楼欢门` Scaffolding (`立体竹木绑扎彩楼欢门`, x = 768..828)
  const hx = 798;
  const drawBambooPole = (x1, y1, x2, y2, wPole = 3.0, col = '#b48b50') => {
    drawJiehuaBeam(ctx, x1, y1, x2, y2, wPole, col, INK_SHADES.jiao, false);
  };

  drawBambooPole(hx - 16, 644, hx - 9, 418, 2.4, '#886538');
  drawBambooPole(hx + 16, 644, hx + 9, 418, 2.4, '#886538');
  drawBambooPole(hx - 28, 648, hx - 18, 410, 3.0, '#c29a5b');
  drawBambooPole(hx + 28, 648, hx + 18, 410, 3.0, '#c29a5b');
  drawBambooPole(hx, 536, hx, 388, 2.8, '#c29a5b');

  for (const [cy, hw] of [[536, 30], [492, 27], [450, 24], [414, 20]]) {
    drawBambooPole(hx - hw, cy, hx + hw, cy, 2.4, '#b68e52');
  }
  for (let tier = 0; tier < 3; tier++) {
    const yBot = 536 - tier * 42;
    const yTop = yBot - 42;
    for (let k = -2; k <= 1; k++) {
      jiehuaStroke(ctx, hx + k * 9, yBot, hx + (k + 1) * 9, yTop, 1.3, '#684b2b', 0.88);
      jiehuaStroke(ctx, hx + (k + 1) * 9, yBot, hx + k * 9, yTop, 1.3, '#684b2b', 0.88);
    }
  }

  // Hemp-rope cross lashings (`麻绳十字绑扎结`)
  for (const [kx, ky] of [
    [hx - 21, 536], [hx + 21, 536], [hx - 19, 492], [hx + 19, 492],
    [hx - 18, 450], [hx + 18, 450], [hx, 450], [hx, 414],
  ]) {
    fillOrganicDot(ctx, kx, ky, 2.6, 2.6, 0.4, '#281f16');
  }

  // Crimson & indigo silk swags + rosette flower knots (`红青彩帛花结`) + hanging lantern
  ctx.strokeStyle = SONG_PIGMENTS.cinnabarMuted;
  ctx.lineWidth = 3.1;
  ctx.beginPath();
  ctx.moveTo(hx - 20, 450);
  ctx.quadraticCurveTo(hx - 10, 464, hx, 450);
  ctx.quadraticCurveTo(hx + 10, 464, hx + 20, 450);
  ctx.stroke();

  ctx.strokeStyle = SONG_PIGMENTS.indigoMid;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(hx - 22, 492);
  ctx.quadraticCurveTo(hx, 508, hx + 22, 492);
  ctx.stroke();

  for (const [kx, ky, col] of [
    [hx, 396, SONG_PIGMENTS.cinnabarMuted],
    [hx - 20, 450, SONG_PIGMENTS.cinnabarMuted],
    [hx + 20, 450, SONG_PIGMENTS.cinnabarMuted],
    [hx, 450, SONG_PIGMENTS.indigoMid],
    [hx - 21, 492, SONG_PIGMENTS.indigoMid],
    [hx + 21, 492, SONG_PIGMENTS.indigoMid],
  ]) {
    fillOrganicDot(ctx, kx, ky, 5.2, 5.0, 0.2, col, INK_SHADES.jiao, 0.9);
  }
  fillOrganicDot(ctx, hx, 554, 6.4, 8.6, 0, '#c44634', INK_SHADES.jiao, 0.95);

  // Tall bamboo flagpole (`酒旗长竹竿`, x = 754, y = 212..634) with bamboo node rings!
  drawBambooPole(758, 634, 754, 214, 3.4, '#b48b50');
  for (let ny = 248; ny < 620; ny += 38) {
    const nx = lerp(754, 758, (ny - 214) / 420);
    jiehuaStroke(ctx, nx - 2.4, ny, nx + 2.4, ny, 1.3, INK_SHADES.jiao, 0.85);
  }
  fillOrganicDot(ctx, 754, 211, 4.4, 4.4, 0, SONG_PIGMENTS.cinnabarMuted, INK_SHADES.jiao, 0.85);

  ctx.restore();
}

/**
 * Paints the Northern Song Riverbanks (`排桩护岸、埠头石阶与芦苇乱石`) AND the Palace Museum
 * **5-Rib × 9-Transom Pierless Woven-Timber Rainbow Bridge (`五排叠梁巨木穿插无柱木拱虹桥`)**!
 */
function paintRainbowBridgeAndBanks(ctx, kit, rng) {
  ctx.save();

  // 1. Foreground Bian River Silty Ochre-Slate Channel (`汴河浑黄微青水色`, x = 110..890, y = 550..1000)
  const riverGrad = ctx.createLinearGradient(0, 545, 0, PANEL_SIZE);
  riverGrad.addColorStop(0, 'rgba(136, 144, 128, 0.42)');
  riverGrad.addColorStop(0.38, 'rgba(116, 128, 114, 0.50)');
  riverGrad.addColorStop(0.75, 'rgba(98, 112, 100, 0.56)');
  riverGrad.addColorStop(1, 'rgba(84, 98, 88, 0.62)');
  ctx.fillStyle = riverGrad;
  ctx.fillRect(110, 545, 780, PANEL_SIZE - 545);

  // Shimmering vaulted reflection of the 5-rib Rainbow Bridge on the river water
  ctx.fillStyle = 'rgba(38, 40, 34, 0.22)';
  ctx.beginPath();
  ctx.moveTo(168, 684);
  ctx.quadraticCurveTo(500, 608, 832, 684);
  ctx.quadraticCurveTo(500, 676, 168, 684);
  ctx.fill();

  // 2. Authentic Song Timber-Pile, Stepped Stone Quay & Earthen Riverbanks (`排桩护岸 + 埠头石阶 + 芦苇`)
  const drawNaturalSongBank = (isLeft) => {
    ctx.save();
    ctx.beginPath();
    if (isLeft) {
      ctx.moveTo(0, ROAD_EDGE_Y);
      for (let x = 0; x <= 186; x += 12) ctx.lineTo(x, kit.sampleRoad(x, ARCH_H).y);
      ctx.bezierCurveTo(194, 725, 168, 825, 134, PANEL_SIZE);
      ctx.lineTo(0, PANEL_SIZE);
    } else {
      ctx.moveTo(814, kit.sampleRoad(814, ARCH_H).y);
      for (let x = 814; x <= PANEL_SIZE; x += 12) ctx.lineTo(x, kit.sampleRoad(x, ARCH_H).y);
      ctx.lineTo(PANEL_SIZE, PANEL_SIZE);
      ctx.lineTo(866, PANEL_SIZE);
      ctx.bezierCurveTo(832, 825, 806, 725, 814, kit.sampleRoad(814, ARCH_H).y);
    }
    ctx.closePath();

    const earthGrad = ctx.createLinearGradient(0, 650, 0, PANEL_SIZE);
    earthGrad.addColorStop(0, '#cbb792');
    earthGrad.addColorStop(0.45, '#b7a078');
    earthGrad.addColorStop(1, '#98815c');
    ctx.fillStyle = earthGrad;
    ctx.fill();

    ctx.clip();
    // Hemp-fiber `披麻皴` earthen bank strokes
    for (let i = 0; i < 320; i++) {
      const ex = isLeft ? rng() * 190 : 810 + rng() * 190;
      const ey = 660 + rng() * 335;
      const len = 10 + rng() * 22;
      drawNailRatStroke(
        ctx,
        ex,
        ey,
        ex + (isLeft ? 14 : -14),
        ey + len * 0.75,
        1.4,
        0.7,
        rng() > 0.42 ? 'rgba(68, 52, 34, 0.24)' : 'rgba(96, 110, 70, 0.20)',
        isLeft ? 2 : -2
      );
    }
    ctx.restore();

    // Stepped stone landing quay (`河埠头青石台阶`) tucked halfway down left bank!
    if (isLeft) {
      for (let st = 0; st < 5; st++) {
        const sx = 148 + st * 4.2;
        const sy = 804 + st * 9.5;
        jiehuaBox(ctx, sx - 16, sy, 22, 8.5, st % 2 === 0 ? '#b7aa92' : '#9f937c', INK_SHADES.jiao, 0.95);
      }
    }

    // Driven Vertical Timber Retaining Piles & Horizontal Fascine Logs (`排桩圆木护岸`, zero `roundRect`!)
    const numPiles = 14;
    for (let p = 0; p < numPiles; p++) {
      const u = p / (numPiles - 1);
      const px = isLeft ? lerp(186, 136, u) : lerp(814, 864, u);
      const pyTop = lerp(658, 952, u) + (rng() - 0.5) * 5;
      const pileH = 32 + rng() * 12;

      if (p < numPiles - 1) {
        const nx = isLeft ? lerp(186, 136, (p + 1) / (numPiles - 1)) : lerp(814, 864, (p + 1) / (numPiles - 1));
        const ny = lerp(658, 952, (p + 1) / (numPiles - 1));
        drawJiehuaBeam(ctx, px - (isLeft ? 8 : -8), pyTop + 10, nx - (isLeft ? 8 : -8), ny + 10, 5.0, '#78512f');
        drawJiehuaBeam(ctx, px - (isLeft ? 6 : -6), pyTop + 20, nx - (isLeft ? 6 : -6), ny + 20, 5.0, '#664325');
      }

      jiehuaBox(ctx, px - 3.2, pyTop, 6.4, pileH, '#8b6038', INK_SHADES.jiao, 1.1);
      fillOrganicDot(ctx, px, pyTop + 1.4, 3.3, 1.9, 0, '#d2ab7a', INK_SHADES.jiao, 0.85);
    }

    // Angular Rip-Rap River Boulders & Feathery Reed Plumes (`护岸乱石与水草芦花`)
    for (let r = 0; r < 12; r++) {
      const u = (r + 0.3) / 12.5;
      const bx = (isLeft ? lerp(182, 132, u) : lerp(818, 868, u)) + (rng() - 0.5) * 16;
      const by = lerp(685, 978, u) + (rng() - 0.5) * 12;
      const rx = 8 + rng() * 9;
      const ry = 5 + rng() * 6;
      const rockPts = [
        [bx - rx, by + 2],
        [bx - rx * 0.45, by - ry],
        [bx + rx * 0.35, by - ry * 0.85],
        [bx + rx, by + 1],
        [bx + rx * 0.4, by + ry * 0.65],
      ];
      jiehuaQuad(ctx, rockPts, r % 2 === 0 ? '#a5957a' : '#897b64', INK_SHADES.jiao, 1.05);

      if (r % 2 === 1) {
        for (let b = -2; b <= 2; b++) {
          drawNailRatStroke(
            ctx,
            bx + (isLeft ? 6 : -6),
            by + 2,
            bx + (isLeft ? 16 : -16) + b * 5,
            by - 19 - Math.abs(b) * 2.5,
            1.25,
            0.45,
            '#495c3b',
            b * 1.5
          );
        }
      }
    }
  };
  drawNaturalSongBank(true);
  drawNaturalSongBank(false);

  // ---------------------------------------------------------------------------
  // 3. Palace Museum 5-Rib × 9-Transom Woven-Timber Rainbow Bridge (`五排叠梁无柱木拱虹桥`)!
  // ---------------------------------------------------------------------------
  // Stone-and-timber bridgehead abutments (`桥台叠石护木`)
  for (const [ax, isL] of [[170, true], [830, false]]) {
    const ay = kit.sampleRoad(ax, ARCH_H).y;
    for (let tier = 0; tier < 4; tier++) {
      const bx = isL ? ax - 18 + tier * 3 : ax - 6 - tier * 3;
      jiehuaBox(ctx, bx, ay + 8 + tier * 9, 24, 9.5, tier % 2 === 0 ? '#9c8d74' : '#857760', INK_SHADES.jiao, 1.05);
    }
  }

  // Deep vaulted architectural shadow inside the woven-timber arch belly (`桥腹浓荫`)
  ctx.fillStyle = 'rgba(28, 19, 11, 0.86)';
  ctx.beginPath();
  for (let x = 168; x <= 832; x += 14) {
    const ry = kit.sampleRoad(x, ARCH_H).y + 6;
    if (x === 168) ctx.moveTo(x, ry);
    else ctx.lineTo(x, ry);
  }
  for (let x = 832; x >= 168; x -= 14) {
    const u = (x - 168) / (832 - 168);
    ctx.lineTo(x, 706 - 114 * Math.sin(Math.PI * u));
  }
  ctx.closePath();
  ctx.fill();

  const archPt = (u, depthOffset = 0) => [
    lerp(166, 834, u),
    700 - 110 * Math.sin(Math.PI * u) + depthOffset,
  ];

  // Five Interlocking Polygonal Timber Arch Ribs (`五排纵联叠梁巨木拱骨`, weaving from far shadow to foreground!):
  // Rib 1 & 3 (Far/Mid 5-chord arches) + Rib 2 & 4 (Alternating 4-chord arches) + Rib 5 (Foreground hero arch)!
  const ribSpecs = [
    { uNodes: [0.0, 0.20, 0.40, 0.60, 0.80, 1.0], dy: -11, thick: 7.4, col: '#563920', clamp: false },
    { uNodes: [0.03, 0.26, 0.50, 0.74, 0.97], dy: -6, thick: 8.0, col: '#6c4828', clamp: false },
    { uNodes: [0.0, 0.19, 0.39, 0.61, 0.81, 1.0], dy: -1, thick: 8.6, col: '#845932', clamp: true },
    { uNodes: [0.04, 0.27, 0.50, 0.73, 0.96], dy: 4, thick: 9.4, col: '#9b6b3e', clamp: true },
    { uNodes: [0.0, 0.21, 0.41, 0.59, 0.79, 1.0], dy: 8.5, thick: 10.2, col: '#b3804e', clamp: true },
  ];

  // Vertical & radial timber spandrel posts (`排柱立木`) between arch ribs and bridge deck
  for (let x = 190; x <= 810; x += 31) {
    const u = (x - 166) / (834 - 166);
    const [ax, ay] = archPt(u, 2);
    const deckY = kit.sampleRoad(x, ARCH_H).y + 9;
    if (ay > deckY + 2) {
      drawJiehuaBeam(ctx, ax, ay, x, deckY, 5.2, '#78502d', INK_SHADES.jiao, false);
    }
  }

  // Draw the 5 woven longitudinal arch ribs & inter-woven cross-timbers!
  const nineTransomUs = [0.10, 0.20, 0.29, 0.40, 0.50, 0.60, 0.71, 0.80, 0.90];
  for (let rIdx = 0; rIdx < ribSpecs.length; rIdx++) {
    const rib = ribSpecs[rIdx];
    for (let i = 0; i < rib.uNodes.length - 1; i++) {
      const [x0, y0] = archPt(rib.uNodes[i], rib.dy);
      const [x1, y1] = archPt(rib.uNodes[i + 1], rib.dy);
      // Authentic Zhang Zeduan protruding timber ends (`巨木出头穿插咬合`)!
      const ox = (x1 - x0) * 0.085;
      const oy = (y1 - y0) * 0.085;
      drawJiehuaBeam(ctx, x0 - ox, y0 - oy, x1 + ox, y1 + oy, rib.thick, rib.col, INK_SHADES.jiao, rib.clamp);
    }

    // After Rib 3, weave the inner receding shafts of the 9 transverse cross-beams (`横贯大圆木`)!
    if (rIdx === 2) {
      for (const cu of nineTransomUs) {
        const [tx, ty] = archPt(cu, 2);
        drawJiehuaBeam(ctx, tx - 4, ty - 11, tx + 3, ty + 8, 8.2, '#694526', INK_SHADES.jiao, false);
      }
    }
  }

  // Nine Protruding Round Timber Cross-Beam Ends (`九根横贯大圆木端头年轮断面 + 麻绳铁箍`)!
  for (const cu of nineTransomUs) {
    const [cx, cy] = archPt(cu, 7.2);
    // Dark hemp/iron collar behind protruding log head
    fillOrganicDot(ctx, cx - 1.2, cy - 1.0, 6.8, 6.5, 0.2, '#2b2016');
    // Cut-timber end face with concentric tree-ring grain & radial check split!
    fillOrganicDot(ctx, cx, cy, 6.0, 5.6, 0.1, '#d6ab78', INK_SHADES.jiao, 1.3);
    fillOrganicDot(ctx, cx, cy, 3.5, 3.2, -0.2, '#be8f5b', 'rgba(42, 30, 18, 0.72)', 0.75);
    fillOrganicDot(ctx, cx, cy, 1.4, 1.3, 0, '#5a3e24');
    jiehuaStroke(ctx, cx, cy, cx + 4.8, cy - 2.2, 0.7, INK_SHADES.jiao, 0.8);
  }

  // ---------------------------------------------------------------------------
  // 4. Bridge Roadway Deck (`高下错落横铺木板虹桥桥面`, strictly anchored at (0,680) & (1000,680)!)
  // ---------------------------------------------------------------------------
  ctx.fillStyle = '#dcc9a4';
  ctx.beginPath();
  for (let x = 0; x <= PANEL_SIZE; x += 10) {
    const y = kit.sampleRoad(x, ARCH_H).y - 14;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  for (let x = PANEL_SIZE; x >= 0; x -= 10) {
    ctx.lineTo(x, kit.sampleRoad(x, ARCH_H).y + 18);
  }
  ctx.closePath();
  ctx.fill();

  // Warm sunlit timber deck wash over central Rainbow Bridge span (`x = 165..835`)
  ctx.fillStyle = 'rgba(176, 132, 82, 0.30)';
  ctx.beginPath();
  for (let x = 165; x <= 835; x += 10) {
    const y = kit.sampleRoad(x, ARCH_H).y - 14;
    if (x === 165) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  for (let x = 835; x >= 165; x -= 10) {
    ctx.lineTo(x, kit.sampleRoad(x, ARCH_H).y + 18);
  }
  ctx.closePath();
  ctx.fill();

  // Individual uneven transverse timber bridge planks (`横铺木桥板与铁钉眼`)
  for (let x = 170; x <= 830; x += 11.5) {
    const { y } = kit.sampleRoad(x, ARCH_H);
    const plankJit = (rng() - 0.5) * 1.2;
    jiehuaStroke(ctx, x - 3.2, y - 13.5 + plankJit, x + 3.2, y + 17.5 + plankJit, 0.95, 'rgba(54, 38, 22, 0.52)', 0.85);
    // Projecting plank end teeth along near bridge edge!
    jiehuaBox(ctx, x - 2, y + 16.5 + plankJit * 0.6, 8.5, 3.4, x % 23 < 11 ? '#b88a56' : '#9f7244', INK_SHADES.jiao, 0.85);
  }

  // Hand-ruled near bridge curb beam anchoring `(0, 680+18)` and `(1000, 680+18)`
  for (let x = 0; x < PANEL_SIZE; x += 25) {
    const xNext = Math.min(PANEL_SIZE, x + 25);
    jiehuaStroke(
      ctx,
      x,
      kit.sampleRoad(x, ARCH_H).y + 18,
      xNext,
      kit.sampleRoad(xNext, ARCH_H).y + 18,
      1.9,
      INK_SHADES.jiao,
      0.92
    );
  }

  // ---------------------------------------------------------------------------
  // 5. Far-Side Song `勾阑` Carved Lattice Balustrade & Sculpted `望柱` Posts (`寻杖·华板·望柱`)
  // ---------------------------------------------------------------------------
  const railH = 34;
  for (const [dy, rw, col] of [
    [-14 - railH, 2.5, INK_SHADES.jiao],
    [-14 - railH * 0.45, 1.5, '#68482c'],
    [-14, 1.6, '#5c3f26'],
  ]) {
    for (let x = 156; x < 844; x += 24) {
      const xNext = Math.min(844, x + 24);
      jiehuaStroke(
        ctx,
        x,
        kit.sampleRoad(x, ARCH_H).y + dy,
        xNext,
        kit.sampleRoad(xNext, ARCH_H).y + dy,
        rw,
        col,
        0.92
      );
    }
  }

  for (let x = 160; x <= 840; x += 40) {
    const baseY = kit.sampleRoad(x, ARCH_H).y - 14;
    if (x + 40 <= 842) {
      const midX = x + 20;
      const midY = kit.sampleRoad(midX, ARCH_H).y - 14 - railH * 0.52;
      // Song `华板` cloud-diamond & vertical `蜀柱` mullions
      jiehuaStroke(ctx, midX - 10, midY, midX, midY - 7.5, 0.9, 'rgba(68, 48, 30, 0.72)', 0.85);
      jiehuaStroke(ctx, midX, midY - 7.5, midX + 10, midY, 0.9, 'rgba(68, 48, 30, 0.72)', 0.85);
      jiehuaStroke(ctx, midX + 10, midY, midX, midY + 7.5, 0.9, 'rgba(68, 48, 30, 0.72)', 0.85);
      jiehuaStroke(ctx, midX, midY + 7.5, midX - 10, midY, 0.9, 'rgba(68, 48, 30, 0.72)', 0.85);
      jiehuaStroke(ctx, x + 10, baseY - railH, x + 10, baseY, 0.85, '#68482c', 0.8);
      jiehuaStroke(ctx, x + 30, baseY - railH, x + 30, baseY, 0.85, '#68482c', 0.8);
    }

    // `望柱` post + carved cloud/lotus cap (`雕花望柱头`, polygonal, zero `ctx.arc`!)
    jiehuaBox(ctx, x - 3.1, baseY - railH - 8, 6.2, railH + 8, '#986a40', INK_SHADES.jiao, 1.15);
    jiehuaQuad(
      ctx,
      [
        [x - 4.8, baseY - railH - 8],
        [x - 3.4, baseY - railH - 13.5],
        [x, baseY - railH - 16],
        [x + 3.4, baseY - railH - 13.5],
        [x + 4.8, baseY - railH - 8],
      ],
      '#cfa474',
      INK_SHADES.jiao,
      1.05
    );
  }

  ctx.restore();
}

/**
 * Bakes the static Qingming Bianjing handscroll (`s06_qingming_bg_r3`, 1000x1000):
 * - Palace Museum amber-tea aged silk (`#c8b089`) + `kit.bakeBrush` Kubelka-Munk mineral river/mist washes
 * - Irregular scalloped upstream muddy shoals, reed islets, stepped stone quays & moored perspective barges
 * - Varied 3/4-perspective Bianjing rooftops/sheds + gnarled ink-strand willows (zero ellipse balloons!)
 */
function getBakedQingmingScroll(kit) {
  return kit.bake2D('s06_qingming_bg_r3', (_g, ctx, rng) => {
    // 1. Palace Museum Deep Amber-Tea Aged Handscroll Silk (`故宫暗金茶褐熟绢包浆`)
    const silkGrad = ctx.createLinearGradient(0, 0, PANEL_SIZE, PANEL_SIZE);
    silkGrad.addColorStop(0, '#d2bc95');
    silkGrad.addColorStop(0.5, '#c8b089');
    silkGrad.addColorStop(1, '#b79d74');
    ctx.fillStyle = silkGrad;
    ctx.fillRect(0, 0, PANEL_SIZE, PANEL_SIZE);

    // WebGL2 `p5.brush` Spectral Mineral Washes (`bakeBrush -> fb.get().canvas`)
    if (kit && kit.brush && typeof kit.bakeBrush === 'function') {
      const brushFb = kit.bakeBrush('s06_qingming_brush_r3', (p, brush) => {
        p.background(200, 176, 137);
        brush.noField();
        brush.noHatch();
        brush.noStroke();

        // Silty ochre-slate Bian River upstream & foreground watercolor wash
        brush.fill('#76887e', 108);
        brush.fillBleed(0.32, 'out');
        brush.fillTexture(0.82, 0.56);
        brush.polygon([
          [518, 168], [420, 245], [322, 348], [248, 488], [178, 608],
          [822, 608], [735, 485], [612, 392], [538, 308], [618, 168],
        ]);

        brush.fill('#697c74', 124);
        brush.fillBleed(0.28, 'out');
        brush.polygon([
          [165, 650], [835, 650], [875, 1010], [125, 1010],
        ]);

        // Delicate sap-green & indigo spring willow mist washes (`迷蒙烟柳淡染`)
        for (const [wx, wy, rw, rh] of [
          [326, 305, 76, 34], [218, 520, 82, 42], [96, 336, 68, 34],
          [635, 342, 78, 36], [728, 504, 78, 40],
        ]) {
          brush.fill('#7c9064', 86);
          brush.fillBleed(0.38, 'out');
          brush.polygon([
            [wx - rw, wy + 6], [wx - rw * 0.4, wy - rh], [wx + rw * 0.45, wy - rh * 0.9],
            [wx + rw, wy + 4], [wx + rw * 0.3, wy + rh * 0.7], [wx - rw * 0.35, wy + rh * 0.75],
          ]);
        }

        // Warm golden silk horizon mist softening top of upstream river
        brush.fill('#dfd0b0', 165);
        brush.fillBleed(0.42, 'out');
        brush.polygon([
          [-15, -15], [1015, -15], [1015, 195], [560, 215], [-15, 185],
        ]);
      });
      ctx.save();
      ctx.globalAlpha = 0.85;
      copyBrushFbTo2D(brushFb, ctx);
      ctx.restore();
    }

    // 2px Northern Song Double-Thread Silk Weave & Patina (`双丝熟绢织纹与茶渍包浆`)
    ctx.save();
    for (let y = 0; y < PANEL_SIZE; y += 2) {
      ctx.fillStyle = y % 4 === 0 ? 'rgba(84, 66, 42, 0.035)' : 'rgba(248, 238, 214, 0.026)';
      ctx.fillRect(0, y, PANEL_SIZE, 0.9);
    }
    for (let x = 0; x < PANEL_SIZE; x += 3) {
      ctx.fillStyle = x % 6 === 0 ? 'rgba(90, 72, 46, 0.030)' : 'rgba(246, 234, 208, 0.022)';
      ctx.fillRect(x, 0, 0.85, PANEL_SIZE);
    }
    ctx.restore();

    // -------------------------------------------------------------------------
    // 2. Irregular Upstream Bian River Channel, Muddy Shoals, Reed Islets & Quays (#85 Note #1!)
    // Completely breaks up the smooth "highway" Bezier banks!
    // -------------------------------------------------------------------------
    const upLeftBank = subdivideOrganic(
      [
        [522, 168], [462, 208], [418, 246], [362, 276],
        [342, 318], [298, 358], [308, 396], [262, 448],
        [242, 504], [186, 604],
      ],
      rng,
      3,
      0.16
    );
    const upRightBank = subdivideOrganic(
      [
        [624, 168], [578, 214], [542, 262], [526, 304],
        [574, 348], [608, 392], [676, 434], [712, 482],
        [766, 534], [814, 604],
      ],
      rng,
      3,
      0.16
    );

    const upRiverGrad = ctx.createLinearGradient(0, 168, 0, 608);
    upRiverGrad.addColorStop(0, 'rgba(206, 188, 152, 0.0)');
    upRiverGrad.addColorStop(0.24, 'rgba(128, 140, 128, 0.24)');
    upRiverGrad.addColorStop(0.65, 'rgba(112, 126, 114, 0.38)');
    upRiverGrad.addColorStop(1, 'rgba(122, 136, 122, 0.46)');
    fillPoly(ctx, [...upLeftBank, ...upRightBank.slice().reverse()], upRiverGrad, 1.0);

    // Scalloped muddy silt flats (`汴河淤泥浅滩`), dry brush bank contours & reed clusters along BOTH banks!
    const paintIrregularMudBank = (bankPts, sideSign) => {
      for (let i = 1; i < bankPts.length - 1; i++) {
        const [bx, by] = bankPts[i];
        const [nx, ny] = bankPts[i + 1];
        // Muddy silt shoal tongue jutting into water (`泥沙浅渚`)
        if (i % 3 === 1 && by > 215 && by < 565) {
          const shoalW = 18 + rng() * 26;
          const shoalPts = subdivideOrganic(
            [
              [bx - sideSign * 8, by - 9],
              [bx + sideSign * shoalW, by + 2],
              [bx + sideSign * (shoalW * 0.65), by + 13],
              [bx - sideSign * 6, by + 15],
            ],
            rng,
            2,
            0.18,
            true
          );
          fillPoly(ctx, shoalPts, 'rgba(188, 168, 132, 0.78)', 1.0);
          // Reeds sprouting on mud shoal!
          for (let r = 0; r < 6; r++) {
            const rx = bx + sideSign * (6 + rng() * (shoalW * 0.6));
            const ry = by + (rng() - 0.5) * 8;
            drawNailRatStroke(ctx, rx, ry + 2, rx + sideSign * 4 + (rng() - 0.5) * 4, ry - 9 - rng() * 6, 0.9, 0.35, '#526340', 0, 0.72);
          }
        }
        // Broken earthen bank brush strokes (never a continuous highway line!)
        if (rng() > 0.22) {
          drawNailRatStroke(ctx, bx, by, nx, ny, 1.8, 0.9, 'rgba(84, 66, 44, 0.48)', sideSign * 1.2);
        }
        // Driven mooring stakes (`系船木桩`) at quay bends
        if (i % 5 === 2 && by > 260 && by < 540) {
          jiehuaBox(ctx, bx + sideSign * 3, by - 6, 3.2, 12, '#75502e', INK_SHADES.jiao, 0.8);
        }
      }
    };
    paintIrregularMudBank(upLeftBank, 1);
    paintIrregularMudBank(upRightBank, -1);

    // Mid-River Sandbar & Reed Islet (`河心沙洲芦苇渚` at (468, 354)) + Stepped Stone Quay (`上游石砌埠头` at (652, 424))!
    const midIslet = subdivideOrganic(
      [[432, 356], [462, 345], [504, 352], [488, 365], [446, 364]],
      rng,
      2,
      0.18,
      true
    );
    fillPoly(ctx, midIslet, 'rgba(192, 172, 136, 0.84)', 1.0);
    for (let r = 0; r < 14; r++) {
      const rx = 442 + rng() * 52;
      const ry = 355 + (rng() - 0.5) * 6;
      drawNailRatStroke(ctx, rx, ry + 2, rx + (rng() - 0.5) * 6, ry - 8 - rng() * 7, 0.95, 0.35, '#4c5e3c', 0, 0.75);
    }

    // Stepped stone landing dock (`石埠头与跳板`) on right upstream quay
    for (let st = 0; st < 4; st++) {
      jiehuaBox(ctx, 646 + st * 4, 412 + st * 5.5, 24, 5.5, '#afa086', INK_SHADES.nong, 0.85);
    }
    drawJiehuaBeam(ctx, 646, 426, 616, 434, 3.4, '#9c7246');

    // Fine Zhang Zeduan flowing current threads (`远水细流丝纹`) in upstream bend
    ctx.strokeStyle = 'rgba(64, 78, 72, 0.28)';
    ctx.lineWidth = 0.72;
    for (let ry = 232; ry < 548; ry += 17) {
      const cx = ry < 360 ? lerp(525, 428, (ry - 232) / 128) : lerp(428, 495, (ry - 360) / 188);
      const span = lerp(38, 175, (ry - 232) / 316);
      for (let k = 0; k < 3; k++) {
        const rx = cx + (k - 1) * span * 0.34 + (rng() - 0.5) * 14;
        const len = 16 + rng() * 18;
        ctx.beginPath();
        ctx.moveTo(rx - len * 0.5, ry);
        ctx.bezierCurveTo(rx - len * 0.15, ry - 1.8, rx + len * 0.2, ry + 1.6, rx + len * 0.5, ry - 0.4);
        ctx.stroke();
      }
    }

    // -------------------------------------------------------------------------
    // 3. Varied 3/4-Perspective Bianjing Courtyards, Granary Shops, Sheds & Upstream Willows!
    // -------------------------------------------------------------------------
    // Distant & mid-ground pollarded ink-strand willows along both banks (ZERO `ellipse` balloons!)
    paintWillowTree(ctx, rng, 462, 224, 0.34, 1, true);
    paintWillowTree(ctx, rng, 384, 268, 0.42, 1, true);
    paintWillowTree(ctx, rng, 314, 344, 0.54, 1, true);
    paintWillowTree(ctx, rng, 608, 228, 0.35, -1, true);
    paintWillowTree(ctx, rng, 586, 294, 0.46, -1, true);
    paintWillowTree(ctx, rng, 694, 412, 0.58, -1, true);

    // Right-bank Bianjing city ward (`桥东瓦舍粮行街坊`, varied 3/4 perspective!)
    paintBianjingCompoundCluster(ctx, rng, 704, 152, 0.66, 1, 0);
    paintBianjingCompoundCluster(ctx, rng, 812, 144, 0.72, -1, 1);
    paintBianjingCompoundCluster(ctx, rng, 916, 158, 0.76, 1, 2);
    paintBianjingCompoundCluster(ctx, rng, 654, 212, 0.80, -1, 1);
    paintBianjingCompoundCluster(ctx, rng, 764, 204, 0.86, 1, 0);

    // Left-bank Bianjing suburb courtyards & thatched market sheds (now free of top-left UI box, lush handscroll space!)
    paintWillowTree(ctx, rng, 154, 218, 0.50, 1, true);
    paintBianjingCompoundCluster(ctx, rng, 94, 178, 0.70, 1, 2);
    paintBianjingCompoundCluster(ctx, rng, 224, 198, 0.74, -1, 0);
    paintBianjingCompoundCluster(ctx, rng, 336, 232, 0.76, 1, 1);
    paintBianjingCompoundCluster(ctx, rng, 248, 282, 0.86, -1, 0);
    paintBianjingCompoundCluster(ctx, rng, 168, 344, 0.94, 1, 1);

    // Moored & Punting Upstream Bianjing Cargo Barges (`远岸停泊客货漕船群`, angled naturally along banks!)
    const upstreamBoats = [
      { x: 526, y: 232, sc: 0.54, ang: -0.06, sail: true, moored: false },
      { x: 438, y: 296, sc: 0.70, ang: -0.10, sail: false, moored: true },
      { x: 326, y: 404, sc: 0.88, ang: 0.14, sail: false, moored: true },
      { x: 604, y: 434, sc: 0.86, ang: -0.16, sail: false, moored: true },
    ];
    for (const b of upstreamBoats) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.ang);
      ctx.scale(b.sc, b.sc);
      // Waterline reflection
      fillPoly(ctx, [[-26, 6], [28, 6], [22, 13], [-20, 13]], 'rgba(46, 54, 48, 0.24)');
      // Wooden hull
      jiehuaQuad(ctx, [[-30, -1], [32, -2], [24, 7], [-22, 7]], '#8b623c', INK_SHADES.jiao, 1.05);
      // Woven bamboo cabin (`篷舱`)
      jiehuaQuad(ctx, [[-12, -1], [-10, -10], [14, -10], [16, -1]], '#cab082', INK_SHADES.jiao, 0.95);
      if (b.moored) {
        // Lowered mast resting horizontally on cabin crutch + gangplank!
        jiehuaStroke(ctx, -22, -11, 28, -9, 1.3, '#6e4c2d', 0.9);
      } else {
        jiehuaStroke(ctx, 2, -1, 2, -46, 1.3, '#5c3f24', 0.9);
        if (b.sail) {
          jiehuaQuad(ctx, [[2, -42], [18, -34], [16, -8], [2, -10]], 'rgba(244, 236, 216, 0.86)', INK_SHADES.nong, 0.85);
        }
      }
      ctx.restore();
    }

    // -------------------------------------------------------------------------
    // 4. Foreground Gnarled Pollarded Willows, Tea Pavilion, `孫家正店` & 5-Rib Rainbow Bridge
    // -------------------------------------------------------------------------
    paintWillowTree(ctx, rng, 214, 636, 1.04, 1, false);
    paintWillowTree(ctx, rng, 88, 438, 0.90, 1, false);
    paintWillowTree(ctx, rng, 734, 614, 0.98, -1, false);

    paintLeftBankTeaPavilion(ctx, rng);
    paintGrandSongWineTavern(ctx);
    paintRainbowBridgeAndBanks(ctx, kit, rng);

    // -------------------------------------------------------------------------
    // 5. Vertical Handscroll Rolling Creases (`手卷竖向卷摺丝裂纹`) & Eroded `宣和`/`秘府` Seals
    // -------------------------------------------------------------------------
    for (const cx of [146, 418, 688, 896]) {
      ctx.save();
      ctx.strokeStyle = 'rgba(246, 235, 210, 0.14)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let y = 0; y <= PANEL_SIZE; y += 28) {
        const jx = cx + Math.sin(y * 0.02 + cx) * 0.7;
        if (y === 0) ctx.moveTo(jx, y);
        else ctx.lineTo(jx, y);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(76, 58, 36, 0.13)';
      ctx.lineWidth = 0.65;
      ctx.beginPath();
      for (let y = 0; y <= PANEL_SIZE; y += 28) {
        if (rng() < 0.2) continue;
        const jx = cx + 0.9 + Math.sin(y * 0.02 + cx) * 0.7;
        if (y === 0) ctx.moveTo(jx, y);
        else ctx.lineTo(jx, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    paintQingmingSeal(ctx, 36, 940, 26, 34, rng, ['宣', '和'], false);
    paintQingmingSeal(ctx, 962, 936, 28, 36, rng, ['秘', '府'], true);
  });
}


// ============================================================================
// Dynamic Handscroll Layers: Wine Banner, River Barge (`虹桥过船`) & 15 Townsfolk
// ============================================================================

/**
 * Draws the fluttering `新酒` cloth banner on the tall bamboo flagpole, crimson `彩楼欢门`
 * silk ribbons, and gentle spring breeze in the weeping willow ink strands.
 */
function drawDynamicTavernBannerAndWillows(ctx, t) {
  ctx.save();

  // 1. Fluttering Song Wine Banner (`迎风招展「新酒」布幌`, strictly classical calligraphy!)
  const poleX = 754;
  const poleY = 222;
  const wave1 = Math.sin(t * 3.1) * 5.2;
  const wave2 = Math.cos(t * 2.5 + 0.8) * 6.8;

  // Hemp tie cords from bamboo pole to banner rod
  jiehuaStroke(ctx, poleX, poleY - 3, poleX - 8, poleY + 2, 1.1, INK_SHADES.jiao, 0.9);
  jiehuaStroke(ctx, poleX + 1, poleY + 34, poleX - 8, poleY + 33, 1.0, INK_SHADES.jiao, 0.85);
  // Horizontal bamboo banner crossbar
  drawJiehuaBeam(ctx, poleX - 6, poleY, poleX - 96, poleY + wave1 * 0.25, 2.2, '#8b6438');

  // Billowing swallowtail linen banner with crimson silk border
  ctx.fillStyle = '#f3e7cc';
  ctx.strokeStyle = SONG_PIGMENTS.cinnabarMuted;
  ctx.lineWidth = 2.1;
  ctx.beginPath();
  ctx.moveTo(poleX - 8, poleY + 1);
  ctx.bezierCurveTo(
    poleX - 38,
    poleY - 6 + wave1,
    poleX - 68,
    poleY + 6 - wave2 * 0.6,
    poleX - 96,
    poleY + 2 + wave2
  );
  // Twin swallowtail streamers (`燕尾酒帘飘带`)
  ctx.lineTo(poleX - 114, poleY + 11 + wave2 * 1.25);
  ctx.lineTo(poleX - 93, poleY + 19 + wave1 * 0.7);
  ctx.lineTo(poleX - 116, poleY + 29 + wave2 * 1.3);
  ctx.lineTo(poleX - 95, poleY + 36 + wave2);
  ctx.bezierCurveTo(
    poleX - 66,
    poleY + 40 - wave2 * 0.5,
    poleX - 36,
    poleY + 29 + wave1,
    poleX - 8,
    poleY + 34
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner ink border rule
  jiehuaStroke(ctx, poleX - 13, poleY + 5, poleX - 89, poleY + 6 + wave2 * 0.7, 0.75, INK_SHADES.jiao, 0.7);
  jiehuaStroke(ctx, poleX - 13, poleY + 30, poleX - 89, poleY + 31 + wave2 * 0.7, 0.75, INK_SHADES.jiao, 0.7);

  // Bold Northern Song Kaishu 「新 酒」 (right-to-left or left-to-right readable horizontal plaque style)
  ctx.fillStyle = INK_SHADES.jiao;
  ctx.font = '700 18px "PelicanWenKai", "PelicanSerif", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.save();
  ctx.translate(poleX - 34, poleY + 18 + wave1 * 0.45);
  ctx.rotate(wave1 * 0.012);
  ctx.fillText('酒', 0, 0);
  ctx.restore();
  ctx.save();
  ctx.translate(poleX - 68, poleY + 18 + wave2 * 0.45);
  ctx.rotate(-wave2 * 0.012);
  ctx.fillText('新', 0, 0);
  ctx.restore();

  // 2. Fluttering crimson & indigo silk ribbons on `孫家正店` `彩楼欢门` (`hx = 798`)
  for (const [rx, ry, len, col, ph] of [
    [778, 452, 28, SONG_PIGMENTS.cinnabarMuted, 0.0],
    [818, 452, 28, SONG_PIGMENTS.cinnabarMuted, 1.4],
    [798, 400, 24, SONG_PIGMENTS.indigoMid, 2.3],
  ]) {
    const sw = Math.sin(t * 3.4 + ph) * 5.5;
    drawNailRatStroke(ctx, rx, ry, rx - 4 + sw, ry + len, 2.2, 0.7, col, sw * 0.4, 0.88);
  }

  // 3. Gentle spring breeze swaying foreground weeping willow strands (`柳丝拂风`)
  const willowClusters = [
    { x: 214, y: 548, count: 14, span: 48, len: 58 },
    { x: 88, y: 364, count: 10, span: 38, len: 48 },
    { x: 734, y: 530, count: 13, span: 46, len: 54 },
  ];
  for (const wc of willowClusters) {
    for (let i = 0; i < wc.count; i++) {
      const u = i / (wc.count - 1) - 0.5;
      const sx = wc.x + u * wc.span * 2;
      const sy = wc.y + Math.abs(u) * 14;
      const sway = Math.sin(t * 2.1 + i * 0.7 + wc.x * 0.02) * 6.5;
      const ex = sx + sway + u * 8;
      const ey = sy + wc.len + (i % 3) * 7;

      ctx.strokeStyle = i % 2 === 0 ? 'rgba(54, 68, 42, 0.52)' : 'rgba(78, 94, 56, 0.46)';
      ctx.lineWidth = 0.82;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(sx + sway * 0.45, sy + wc.len * 0.52, ex, ey);
      ctx.stroke();

      // Tiny Song `攒点` willow leaf buds along each swaying strand (zero `ellipse`!)
      for (let b = 1; b <= 4; b++) {
        const bu = b / 4.4;
        const bx = lerp(sx, ex, bu) + sway * 0.12 * (1 - bu);
        const by = lerp(sy, ey, bu);
        const side = b % 2 === 0 ? 1 : -1;
        drawNailRatStroke(
          ctx,
          bx,
          by,
          bx + side * 3.2 + sway * 0.08,
          by + 4.2,
          1.15,
          0.35,
          b % 2 === 0 ? SONG_PIGMENTS.sapGreenDark : SONG_PIGMENTS.sapGreenMid,
          0,
          0.74
        );
      }
    }
  }

  ctx.restore();
}

/**
 * Draws Zhang Zeduan's dynamic Bian River water currents (`勾水丝纹与桥下急湍`) AND the iconic
 * Northern Song Wooden Cargo Barge lowering its mast to pass beneath the Rainbow Bridge (`虹桥过船`),
 * with 5 `钉头鼠尾描` boatmen punting, hauling stay ropes, steering, and pointing up at the pelican!
 */
function drawBianRiverAndCargoBarge(ctx, t, localT) {
  ctx.save();

  // Barge glides upstream toward the Rainbow Bridge arch throat
  const bargeX = 562 - localT * 14.5;
  const bargeY = 856 - localT * 4.5 + Math.sin(t * 2.0) * 1.6;
  const pitch = Math.sin(t * 1.9) * 0.012;

  // 1. Authentic Zhang Zeduan Bian River Water Threads (`汴河勾水法：桥下急流丝纹 + 船首分水波`)
  // Under-bridge rapid current threads (`y = 676..790`)
  for (let row = 0; row < 9; row++) {
    const wy = 682 + row * 13;
    const rowSpread = lerp(290, 340, row / 8);
    for (let k = -3; k <= 3; k++) {
      const drift = ((t * 26 + row * 19 + k * 37) % 44) - 22;
      const wx = 500 + k * (rowSpread / 3.4) + drift * 0.55;
      const wLen = 22 + ((row * 7 + Math.abs(k) * 5) % 18);
      const crest = Math.sin(t * 2.8 + row + k) * 1.6;
      ctx.strokeStyle = row < 3 ? 'rgba(42, 52, 46, 0.42)' : 'rgba(54, 66, 58, 0.34)';
      ctx.lineWidth = row < 3 ? 1.05 : 0.85;
      ctx.beginPath();
      ctx.moveTo(wx - wLen * 0.5, wy);
      ctx.bezierCurveTo(
        wx - wLen * 0.16,
        wy - 2.2 + crest,
        wx + wLen * 0.18,
        wy + 2.0 - crest,
        wx + wLen * 0.5,
        wy - 0.5
      );
      ctx.stroke();
    }
  }

  // Foreground slower braided river ripples (`y = 805..985`)
  for (let row = 0; row < 8; row++) {
    const wy = 812 + row * 22;
    for (let k = -3; k <= 3; k++) {
      const wx = 500 + k * 96 + Math.sin(row * 1.7 + k) * 18 - ((t * 18) % 28);
      if (wx < 165 || wx > 835) continue;
      // Leave clean wake pocket around the hull
      if (Math.abs(wx - bargeX) < 125 && Math.abs(wy - bargeY) < 28) continue;
      ctx.strokeStyle = 'rgba(48, 60, 52, 0.30)';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.moveTo(wx - 18, wy);
      ctx.quadraticCurveTo(wx - 6, wy - 2.0, wx + 4, wy + 0.4);
      ctx.quadraticCurveTo(wx + 12, wy + 2.1, wx + 22, wy - 0.3);
      ctx.stroke();
    }
  }

  // V-shaped parted bow wake & stern sweep eddies around the wooden barge!
  for (let w = 1; w <= 4; w++) {
    const spread = w * 8.5;
    const len = 34 + w * 18;
    ctx.strokeStyle = `rgba(244, 236, 214, ${0.34 - w * 0.06})`;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(bargeX - 108, bargeY + 5);
    ctx.quadraticCurveTo(bargeX - 65, bargeY - spread * 0.55, bargeX - 108 + len, bargeY - spread);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bargeX - 108, bargeY + 8);
    ctx.quadraticCurveTo(bargeX - 65, bargeY + 10 + spread * 0.65, bargeX - 108 + len, bargeY + 12 + spread);
    ctx.stroke();
  }

  // 2. Northern Song Wooden Cargo Barge (`汴河木质客货大漕船`, 100% hand-ruled Jiehua!)
  ctx.save();
  ctx.translate(bargeX, bargeY);
  ctx.rotate(pitch);

  // Dark silty reflection beneath hull
  fillPoly(
    ctx,
    [[-108, 12], [116, 10], [102, 26], [-92, 25]],
    'rgba(34, 42, 36, 0.30)'
  );

  // Far-side hull gunwale
  jiehuaQuad(
    ctx,
    [[-112, -5], [-74, -10], [78, -11], [118, -14], [108, 4], [-96, 5]],
    '#6e4b2c',
    INK_SHADES.jiao,
    1.1
  );

  // Woven-bamboo arched cargo cabin (`篾席拱篷船舱`) + stacked hemp grain sacks (`漕粮麻袋`)
  const cabinPts = [
    [-26, -7],
    [-24, -27],
    [-4, -33],
    [34, -33],
    [54, -26],
    [56, -7],
  ];
  fillPoly(ctx, cabinPts, '#cbb183', 1.0);
  // Cross-hatched woven bamboo mat texture & arched bamboo ribs (`竹篾编织篷顶`)
  for (let rx = -20; rx <= 50; rx += 10) {
    const archTop = -32.5 + Math.pow((rx - 15) / 38, 2) * 6.5;
    jiehuaStroke(ctx, rx, -7, rx, archTop, 1.15, '#70512f', 0.88);
  }
  for (let ry = -28; ry <= -12; ry += 6) {
    jiehuaStroke(ctx, -23, ry, 53, ry + 0.5, 0.75, 'rgba(72, 52, 30, 0.58)', 0.82);
  }
  jiehuaStroke(ctx, -24, -27, -4, -33, 1.35, INK_SHADES.jiao, 0.92);
  jiehuaStroke(ctx, -4, -33, 34, -33, 1.35, INK_SHADES.jiao, 0.92);
  jiehuaStroke(ctx, 34, -33, 54, -26, 1.35, INK_SHADES.jiao, 0.92);

  // Open side cabin lattice window
  jiehuaBox(ctx, -6, -24, 28, 12, 'rgba(38, 28, 18, 0.74)', INK_SHADES.jiao, 0.9);
  jiehuaStroke(ctx, 8, -24, 8, -12, 0.8, '#b9935e', 0.85);

  // Stacked grain sacks (`粮袋`) on foredeck
  for (const [sx, sy] of [[-46, -11], [-35, -12], [-41, -17]]) {
    fillOrganicDot(ctx, sx, sy, 7.5, 4.2, -0.08, '#d8c59e', INK_SHADES.jiao, 0.9);
  }

  // Near-side cambered Song hull strakes with iron dovetail clamps (`锔钉木船帮`)
  const hullPts = [
    [-114, -3],
    [-82, 0],
    [76, -1],
    [120, -9],
    [106, 12],
    [64, 15],
    [-76, 15],
    [-98, 9],
  ];
  jiehuaQuad(ctx, hullPts, '#97693e', INK_SHADES.jiao, 1.4);
  // Longitudinal hull plank seams + iron clamps (`船板缝与铁锔`)
  jiehuaStroke(ctx, -104, 4, 110, 2, 0.95, INK_SHADES.jiao, 0.82);
  jiehuaStroke(ctx, -96, 9.5, 102, 8.5, 0.95, INK_SHADES.jiao, 0.82);
  for (let cx = -76; cx <= 84; cx += 26) {
    jiehuaStroke(ctx, cx, 1.5, cx - 1.2, 6.8, 1.15, '#23201c', 0.88);
  }

  // Hinged Tabernacle Mast Partner (`木桅夹桩`) & Lowering Mast (`放倒过桥大木桅杆`)!
  jiehuaBox(ctx, -18, -24, 6.5, 18, '#5c3d22', INK_SHADES.jiao, 1.15);
  // Mast lowers smoothly from 52 deg down toward horizontal crutch (`14 deg`) as barge nears bridge!
  const lowerProg = smoothstep(0.3, 4.8, localT);
  const mastAngle = lerp(-0.92, -0.24, lowerProg); // pointing aft-upward (`+x, -y`)
  const mastLen = 108;
  const mx0 = -15;
  const my0 = -22;
  const mx1 = mx0 + Math.cos(mastAngle) * mastLen;
  const my1 = my0 + Math.sin(mastAngle) * mastLen;
  drawJiehuaBeam(ctx, mx0, my0, mx1, my1, 4.4, '#8b5e34', INK_SHADES.jiao, true);
  // Furled bamboo-batten sail bundle lashed under mast
  jiehuaStroke(
    ctx,
    lerp(mx0, mx1, 0.25),
    lerp(my0, my1, 0.25) + 3.2,
    lerp(mx0, mx1, 0.88),
    lerp(my0, my1, 0.88) + 3.0,
    2.6,
    '#dfd1b2',
    0.9
  );
  // Taut hemp forestay & halyard ropes (`绷紧纤绳与落桅索`)
  jiehuaStroke(ctx, mx1, my1, -96, -2, 0.95, 'rgba(46, 36, 24, 0.82)', 0.9);
  jiehuaStroke(ctx, lerp(mx0, mx1, 0.72), lerp(my0, my1, 0.72), 66, -14, 0.95, 'rgba(46, 36, 24, 0.82)', 0.9);
  // Aft wooden mast crutch (`船尾承桅木叉`)
  drawJiehuaBeam(ctx, 74, -4, 76, -28, 2.8, '#6b4728');
  jiehuaStroke(ctx, 72, -32, 76, -27, 1.5, INK_SHADES.jiao, 0.9);
  jiehuaStroke(ctx, 80, -32, 76, -27, 1.5, INK_SHADES.jiao, 0.9);

  // Helper for crisp `钉头鼠尾描` boatmen on deck (zero `ctx.arc` or `roundRect`!)
  const drawBoatman = (bx, by, lean, robeCol, action) => {
    ctx.save();
    ctx.translate(bx, by);
    // Legs braced wide on deck (`短褐绑腿`)
    drawNailRatStroke(ctx, -2, -9, -6, 0, 2.8, 1.6, '#dcd0b8', 0.5);
    drawNailRatStroke(ctx, 2, -9, 6, 0, 2.8, 1.6, '#dcd0b8', -0.5);
    // Tunic torso leaning into effort
    const tx = lean * 6;
    const ty = -20;
    jiehuaQuad(
      ctx,
      [[-4.5, -8], [4.5, -8], [tx + 4.8, ty], [tx - 4.8, ty]],
      robeCol,
      INK_SHADES.jiao,
      1.05
    );
    // Sculpted profile head + knotted cloth headscarf (`船夫包头巾`)
    const lookUp = action === 'point' ? -2.5 : 0;
    fillOrganicDot(ctx, tx + lean * 1.5, ty - 4.8 + lookUp, 3.8, 4.2, lean * 0.2, '#dfc29d', INK_SHADES.jiao, 0.95);
    fillOrganicDot(ctx, tx + lean * 0.6, ty - 7.5 + lookUp, 4.1, 2.4, -0.1, '#4d5d63', INK_SHADES.jiao, 0.85);

    if (action === 'pole') {
      // Thrusting long bamboo punt pole deep into river silt!
      drawNailRatStroke(ctx, tx, ty + 3, tx - 11, ty + 7, 3.0, 1.8, robeCol, 0.8);
      jiehuaStroke(ctx, tx + 9, ty - 8, tx - 38, 38, 1.65, '#a8844c', 0.94);
    } else if (action === 'haul') {
      drawNailRatStroke(ctx, tx, ty + 2, tx - 9, ty - 6, 2.8, 1.7, robeCol, -0.8);
    } else if (action === 'point') {
      // Boatman pointing straight up at the cycling pelican on the Rainbow Bridge!
      const ptLift = smoothstep(1.4, 2.3, localT);
      const ax = lerp(tx - 6, tx - 11, ptLift);
      const ay = lerp(ty + 4, ty - 16, ptLift);
      drawNailRatStroke(ctx, tx, ty + 2, ax, ay, 3.1, 1.6, robeCol, -1.0);
      fillOrganicDot(ctx, ax - 1, ay - 1.5, 1.8, 1.4, -0.6, '#dfc29d');
    } else if (action === 'oar') {
      drawNailRatStroke(ctx, tx, ty + 3, tx + 9, ty + 5, 3.0, 1.8, robeCol, 0.6);
      // Long stern `摇橹` sweep oar slicing into wake
      drawJiehuaBeam(ctx, tx + 4, ty + 4, 48, 24, 2.4, '#8d6239');
    }
    ctx.restore();
  };

  // 2 bow punters, 1 rope hauler, 1 astonished pointer, 1 stern helmsman!
  drawBoatman(-86, -2, -0.65, '#839498', 'pole');
  drawBoatman(-66, -2, -0.55, '#a88b68', 'pole');
  drawBoatman(62, -3, 0.35, '#728268', 'haul');
  drawBoatman(22, -7, -0.25, '#bc7d58', 'point');
  drawBoatman(96, -6, 0.30, '#62747c', 'oar');

  ctx.restore();
  ctx.restore();
}

/**
 * 15 Authentic Northern Song Bianjing Townsfolk (`清明上河图虹桥十五市井人物群像`)
 * Arranged into `back` promenade figures & `front` near-parapet spectators for true 3D depth!
 */
const BRIDGE_TOWNSFOLK = [
  // Left bridgehead & ascending slope
  { x: 186, row: 'back', role: 'donkeyDrover', hat: 'straw', robe: '#8e7355', skirt: '#cbbba0', scale: 0.94 },
  { x: 238, row: 'front', role: 'barrowman', hat: 'cloth', robe: '#6e7f74', skirt: '#c8b89d', scale: 0.98 },
  { x: 288, row: 'back', role: 'peddler', hat: 'bamboo', robe: '#a4784c', skirt: '#d6c6aa', scale: 0.95 },
  { x: 334, row: 'front', role: 'child', hat: 'tufts', robe: '#b3503c', skirt: '#d8c7a8', scale: 0.72 },
  { x: 368, row: 'front', role: 'lady', hat: 'bun', robe: '#7c9288', skirt: '#e6d8be', scale: 0.94 },
  // Central Rainbow Bridge crest (`拱顶闹市围观核心`)
  { x: 416, row: 'back', role: 'official', hat: 'futou', robe: '#4c646e', skirt: '#3d5159', scale: 1.00 },
  { x: 458, row: 'front', role: 'scholar', hat: 'dongpo', robe: '#cad4d0', skirt: '#8fa1a6', scale: 0.99 },
  { x: 502, row: 'back', role: 'monk', hat: 'bare', robe: '#b58d59', skirt: '#8c693e', scale: 0.97 },
  { x: 544, row: 'front', role: 'child', hat: 'tufts', robe: '#64806c', skirt: '#dfd0b4', scale: 0.74 },
  { x: 582, row: 'back', role: 'merchant', hat: 'futou', robe: '#9e6b49', skirt: '#cbb898', scale: 0.98 },
  // Right descending slope & tavern approach
  { x: 626, row: 'front', role: 'teaServer', hat: 'cloth', robe: '#7a8c94', skirt: '#dfd1b6', scale: 0.96 },
  { x: 672, row: 'back', role: 'scholar', hat: 'dongpo', robe: '#b8a27e', skirt: '#70624d', scale: 0.96 },
  { x: 718, row: 'front', role: 'elder', hat: 'cloth', robe: '#7d7565', skirt: '#bfb29a', scale: 0.94 },
  { x: 764, row: 'back', role: 'peddler', hat: 'bamboo', robe: '#637658', skirt: '#cfc0a3', scale: 0.95 },
  { x: 812, row: 'front', role: 'waiter', hat: 'cloth', robe: '#bc8a5c', skirt: '#e4d6bc', scale: 0.96 },
];

/**
 * Renders an individual Song dynasty townsperson in crisp `钉头鼠尾描` / `折芦描` brushwork,
 * executing a cascading **Left-to-Right Domino Wave** (`多米诺人浪惊叹指认`) as the pelican crests the arch!
 * Zero `ctx.arc` circle heads, zero `roundRect` limbs!
 */
function drawSongTownsperson(ctx, kit, person, localT, t, pelicanX, pelicanY) {
  const { y: roadY } = kit.sampleRoad(person.x, ARCH_H);
  const footY = person.row === 'back' ? roadY - 7.5 : roadY + 14.5;
  const sc = person.scale;

  // Cascading Left-to-Right Domino Wave (`x = 186..812` triggers sequentially across Bar 2!)
  const dominoOffset = clamp((person.x - 180) / 640, 0, 1) * 1.05;
  const reactIn = smoothstep(1.25 + dominoOffset, 1.85 + dominoOffset, localT);
  const reactOut = 1 - 0.35 * smoothstep(4.95, 5.75, localT);
  const amaze = reactIn * reactOut;

  // Direction from townsperson to the cycling pelican (`+1` = look right, `-1` = look left)
  const dxPel = pelicanX - person.x;
  const faceDir = dxPel >= 0 ? 1 : -1;
  const pointAngle = Math.atan2((pelicanY - 46) - (footY - 30 * sc), dxPel);

  ctx.save();
  ctx.translate(person.x, footY);
  ctx.scale(sc, sc);

  // 1. Companion Bianjing Street Props (`毛驴·独轮车·挑担` — drawn before/around figure!)
  if (person.role === 'donkeyDrover') {
    // Startled Song pack donkey (`惊呆翘耳驮炭小毛驴`, polygonal anatomy, zero `ctx.arc`!)
    const dkX = -22;
    const earPerk = amaze * 3.5;
    // Four slender donkey legs & hooves
    for (const [lx, bend] of [[-29, -2], [-25, 1], [-16, -1], [-12, 2]]) {
      jiehuaStroke(ctx, lx, -16, lx + bend, 0, 1.7, '#4d4339', 0.95);
    }
    // Donkey barrel torso + woven charcoal pannier (`竹编驮篓`)
    fillOrganicDot(ctx, dkX, -20, 12.5, 6.8, -0.05, '#75685a', INK_SHADES.jiao, 1.15);
    jiehuaBox(ctx, dkX - 7, -28, 13, 8.5, '#b8945e', INK_SHADES.jiao, 1.0);
    // Neck, long muzzle & perked twin ears snapping toward the pelican!
    const headDir = faceDir;
    drawNailRatStroke(ctx, dkX + headDir * 9, -22, dkX + headDir * 15, -31 - amaze * 2, 5.2, 3.4, '#75685a', 0);
    fillOrganicDot(ctx, dkX + headDir * 18, -32 - amaze * 2, 5.4, 3.1, headDir * 0.25, '#7d7062', INK_SHADES.jiao, 1.0);
    drawNailRatStroke(ctx, dkX + headDir * 14, -34, dkX + headDir * 12, -43 - earPerk, 2.2, 0.6, '#4d4339', 0);
    drawNailRatStroke(ctx, dkX + headDir * 16, -34, dkX + headDir * 17, -43 - earPerk, 2.2, 0.6, '#4d4339', 0);
  } else if (person.role === 'barrowman') {
    // Authentic Song Single-Wheel Wooden Barrow (`宋代木构独轮推车` — 10-segment polygonal wheel, zero `ctx.arc`!)
    const bwX = 18;
    jiehuaBox(ctx, bwX - 13, -19, 24, 9, '#a67b4b', INK_SHADES.jiao, 1.05);
    fillOrganicDot(ctx, bwX - 1, -22, 8.5, 5.0, 0, '#dfd1b4', INK_SHADES.jiao, 0.95); // grain sack on barrow
    const segs = 10;
    const rW = 8.2;
    for (let s = 0; s < segs; s++) {
      const a0 = (s / segs) * Math.PI * 2;
      const a1 = ((s + 1) / segs) * Math.PI * 2;
      jiehuaStroke(
        ctx,
        bwX + Math.cos(a0) * rW,
        -8.2 + Math.sin(a0) * rW,
        bwX + Math.cos(a1) * rW,
        -8.2 + Math.sin(a1) * rW,
        1.7,
        '#5c3e22',
        0.95
      );
      if (s % 2 === 0) {
        jiehuaStroke(ctx, bwX, -8.2, bwX + Math.cos(a0) * rW, -8.2 + Math.sin(a0) * rW, 0.85, '#5c3e22', 0.8);
      }
    }
    drawJiehuaBeam(ctx, bwX - 20, -14, bwX + 12, -11, 2.2, '#7d5630');
  }

  // Subtle ink ground contact shadow
  fillOrganicDot(ctx, 0, 0.8, 7.5, 2.1, 0, 'rgba(36, 28, 18, 0.24)');

  // 2. Lower Garments: Pleated Song Skirt (`百迭裙` / `圆领长袍`) or Wrapped Puttees (`短褐行缠`)
  const leanX = faceDir * amaze * 3.4 + Math.sin(t * 2.2 + person.x) * 0.4;
  const isLongRobe =
    person.role === 'scholar' ||
    person.role === 'official' ||
    person.role === 'lady' ||
    person.role === 'monk' ||
    person.role === 'merchant' ||
    person.role === 'elder';

  if (isLongRobe) {
    const skirtPts = [
      [-5.8, -19],
      [5.8, -19],
      [7.4 + leanX * 0.2, -1.5],
      [-7.2 + leanX * 0.2, -1.5],
    ];
    jiehuaQuad(ctx, skirtPts, person.skirt, INK_SHADES.jiao, 1.1);
    // Crisp `折芦描` vertical pleat folds
    jiehuaStroke(ctx, -2.0, -18, -2.6 + leanX * 0.15, -1.8, 0.78, 'rgba(30, 24, 18, 0.65)', 0.85);
    jiehuaStroke(ctx, 2.1, -18, 2.8 + leanX * 0.15, -1.8, 0.78, 'rgba(30, 24, 18, 0.65)', 0.85);
  } else {
    // Laborer/child trousers + cloth shoes
    drawNailRatStroke(ctx, -2.8, -16, -4.2, -1, 3.8, 2.1, person.skirt, 0.5);
    drawNailRatStroke(ctx, 2.8, -16, 4.4, -1, 3.8, 2.1, person.skirt, -0.5);
    fillOrganicDot(ctx, -4.5, -0.8, 2.8, 1.3, 0, INK_SHADES.jiao);
    fillOrganicDot(ctx, 4.6, -0.8, 2.8, 1.3, 0, INK_SHADES.jiao);
  }

  // 3. Upper Robe Torso (`交领襦衫 / 圆领袍` with `钉头鼠尾描` lapel & waist sash!)
  const hipY = -17;
  const shoulderY = -33 - amaze * 1.4;
  const torsoPts = [
    [-5.8, hipY],
    [5.8, hipY],
    [leanX + 6.8, shoulderY],
    [leanX - 6.8, shoulderY],
  ];
  jiehuaQuad(ctx, torsoPts, person.robe, INK_SHADES.jiao, 1.18);
  // Crossed Song `交领` collar V-fold & silk waist sash (`束腰帛带`)
  jiehuaStroke(ctx, leanX - 2.6, shoulderY + 0.5, leanX + 1.8, hipY + 5, 0.95, INK_SHADES.jiao, 0.88);
  jiehuaStroke(ctx, leanX + 2.6, shoulderY + 0.5, leanX - 0.4, shoulderY + 7, 0.9, INK_SHADES.jiao, 0.85);
  jiehuaBox(ctx, -5.9 + leanX * 0.25, hipY - 2.2, 11.8, 2.8, '#3d3328', INK_SHADES.jiao, 0.8);

  // 4. Sculpted 3/4 Profile Song Head (`精勾五官侧脸：鼻梁·眉目·惊叹微张口`, ZERO `ctx.arc` ball!)
  const hx = leanX + faceDir * (1.2 + amaze * 1.4);
  const hy = shoulderY - 6.2;
  const headPts = [
    [hx - faceDir * 4.2, hy - 4.4],
    [hx + faceDir * 3.4, hy - 4.8],
    [hx + faceDir * 4.6, hy - 1.2], // brow
    [hx + faceDir * 5.8, hy + 0.6], // sculpted nose bridge!
    [hx + faceDir * 4.4, hy + 2.4], // upper lip
    [hx + faceDir * 3.8, hy + 4.8], // chin
    [hx - faceDir * 3.6, hy + 4.2], // jaw/nape
  ];
  jiehuaQuad(ctx, headPts, '#e5c9a5', INK_SHADES.jiao, 1.05);

  // Expressive Song eyebrow, eye slit gazing at pelican, and astonished open mouth (`惊呼张口`)!
  jiehuaStroke(ctx, hx + faceDir * 1.2, hy - 1.8, hx + faceDir * 3.8, hy - 2.2 - amaze * 0.6, 0.8, INK_SHADES.jiao, 0.9);
  fillOrganicDot(ctx, hx + faceDir * 2.5, hy - 0.6, 1.1, 0.75, 0, INK_SHADES.jiao);
  if (amaze > 0.35) {
    fillOrganicDot(ctx, hx + faceDir * 3.5, hy + 2.7, 1.15, 0.6 + amaze * 0.85, 0, '#4a2019');
  }
  if (person.role === 'scholar' || person.role === 'official' || person.role === 'elder') {
    const beardCol = person.role === 'elder' ? '#d8d2c5' : INK_SHADES.nong;
    drawNailRatStroke(ctx, hx + faceDir * 3.4, hy + 4.4, hx + faceDir * 4.6, hy + 10.5, 1.5, 0.3, beardCol, faceDir * 0.8);
  }

  // 5. Authentic Northern Song Headgear (`展脚幞头 · 东坡巾 · 斗笠 · 双丫髻 · 妇人高髻`)
  if (person.hat === 'futou') {
    jiehuaBox(ctx, hx - 4.8, hy - 8.8, 9.6, 4.8, '#23201d', INK_SHADES.jiao, 1.0);
    // Iconic horizontal Song `展脚幞头` wings!
    jiehuaStroke(ctx, hx - 12.5, hy - 7.0, hx + 12.5, hy - 7.0, 1.65, '#1d1a17', 0.95);
  } else if (person.hat === 'dongpo') {
    jiehuaQuad(
      ctx,
      [[hx - 4.8, hy - 4.2], [hx - 3.6, hy - 10.6], [hx + 3.8, hy - 10.6], [hx + 4.8, hy - 4.2]],
      '#2f3638',
      INK_SHADES.jiao,
      1.05
    );
  } else if (person.hat === 'bamboo') {
    jiehuaQuad(
      ctx,
      [[hx - 10.5, hy - 3.6], [hx, hy - 9.8], [hx + 10.5, hy - 3.6]],
      '#cbb07c',
      INK_SHADES.jiao,
      1.1
    );
  } else if (person.hat === 'straw') {
    jiehuaQuad(
      ctx,
      [[hx - 9.2, hy - 3.8], [hx - 3.2, hy - 8.4], [hx + 3.2, hy - 8.4], [hx + 9.2, hy - 3.8]],
      '#c6aa74',
      INK_SHADES.jiao,
      1.05
    );
  } else if (person.hat === 'tufts') {
    // Child's twin Song `总角双丫髻` hair buns tied with crimson thread!
    fillOrganicDot(ctx, hx - 3.2, hy - 6.2, 2.5, 2.3, -0.3, INK_SHADES.jiao);
    fillOrganicDot(ctx, hx + 2.6, hy - 6.4, 2.5, 2.3, 0.3, INK_SHADES.jiao);
    fillOrganicDot(ctx, hx - 2.6, hy - 4.6, 1.4, 0.9, 0, SONG_PIGMENTS.cinnabarMuted);
    fillOrganicDot(ctx, hx + 2.2, hy - 4.8, 1.4, 0.9, 0, SONG_PIGMENTS.cinnabarMuted);
  } else if (person.hat === 'bun') {
    fillOrganicDot(ctx, hx - faceDir * 1.2, hy - 7.4, 4.2, 3.8, -faceDir * 0.25, '#221e1a', INK_SHADES.jiao, 0.9);
    jiehuaStroke(ctx, hx - 5.2, hy - 7.6, hx + 4.8, hy - 7.2, 1.25, '#cfa474', 0.95); // gold hairpin
  } else if (person.hat === 'cloth') {
    fillOrganicDot(ctx, hx - faceDir * 0.6, hy - 5.8, 4.8, 3.0, 0, '#5a686e', INK_SHADES.jiao, 0.95);
  }

  // 6. Animated Pointing Wide Sleeves (`垂胡大袖伸手齐指鹈鹕`!) & Role Props
  if (person.role === 'peddler') {
    // Bamboo shoulder pole (`扁担`) + two swaying woven baskets (`货郎担筐`)
    const tilt = amaze * faceDir * 0.08;
    const pLx = leanX - 18;
    const pRx = leanX + 18;
    const pLy = shoulderY + 1 - tilt * 18;
    const pRy = shoulderY + 1 + tilt * 18;
    drawJiehuaBeam(ctx, pLx, pLy, pRx, pRy, 2.0, '#9c7242');
    for (const [bx, by] of [[pLx, pLy], [pRx, pRy]]) {
      jiehuaStroke(ctx, bx, by, bx - 4, by + 11, 0.75, INK_SHADES.jiao, 0.8);
      jiehuaStroke(ctx, bx, by, bx + 4, by + 11, 0.75, INK_SHADES.jiao, 0.8);
      jiehuaBox(ctx, bx - 6, by + 11, 12, 7.5, '#c7a670', INK_SHADES.jiao, 1.0);
    }
  }

  // Pointing arm shoots out along `pointAngle` as the domino wave arrives!
  const restArmX = leanX + faceDir * 5.5;
  const restArmY = shoulderY + 9.5;
  const reachLen = 15.5;
  const targetArmX = leanX + Math.cos(pointAngle) * reachLen;
  const targetArmY = (shoulderY + 3) + Math.sin(pointAngle) * reachLen;
  const handX = lerp(restArmX, targetArmX, amaze);
  const handY = lerp(restArmY, targetArmY, amaze);

  // Billowing Song sleeve (`垂胡袖` polygon) + pointing hand
  const sx = leanX + faceDir * 2.5;
  const sy = shoulderY + 3.2;
  jiehuaQuad(
    ctx,
    [
      [sx, sy - 2.2],
      [handX, handY - 1.8],
      [handX - faceDir * 1.2, handY + 3.4],
      [sx - faceDir * 1.0, sy + 5.2],
    ],
    person.robe,
    INK_SHADES.jiao,
    1.05
  );
  fillOrganicDot(ctx, handX + faceDir * 1.6, handY - 0.4, 2.1, 1.3, pointAngle, '#e5c9a5', INK_SHADES.jiao, 0.8);

  // Secondary hand prop (scholar's round silk fan `纨扇` or elder's gnarled walking staff `鸠杖`)
  if (person.role === 'scholar') {
    const fx = handX + faceDir * 4.5;
    const fy = handY - 3.5 + Math.sin(t * 5.2 + person.x) * 1.4;
    fillOrganicDot(ctx, fx, fy, 4.6, 5.2, 0.25, '#f4ead2', INK_SHADES.jiao, 0.95);
    jiehuaStroke(ctx, handX, handY, fx, fy + 4, 1.0, '#6e4c2e', 0.9);
  } else if (person.role === 'elder') {
    jiehuaStroke(ctx, leanX - faceDir * 5, shoulderY + 6, -faceDir * 7, 0, 1.5, '#5c3f24', 0.95);
  }

  ctx.restore();
}


/**
 * Draws the near-side foreground Rainbow Bridge `勾阑望柱` timber posts & low `寻杖` rail
 * (`y = sampleRoad(x, ARCH_H).y + 18`) for authentic handscroll foreground depth occlusion!
 */
function drawForegroundBridgePosts(ctx, kit) {
  ctx.save();

  // Low near-side `寻杖` timber rail beam spanning the arch
  for (let x = 164; x < 836; x += 24) {
    const xNext = Math.min(836, x + 24);
    jiehuaStroke(
      ctx,
      x,
      kit.sampleRoad(x, ARCH_H).y + 6,
      xNext,
      kit.sampleRoad(xNext, ARCH_H).y + 6,
      2.1,
      '#6b492b',
      0.88
    );
  }

  // Carved foreground `望柱` posts spaced along the near curb
  for (let x = 176; x <= 824; x += 54) {
    const curbY = kit.sampleRoad(x, ARCH_H).y + 18;
    const postH = 22;
    jiehuaBox(ctx, x - 3.3, curbY - postH, 6.6, postH + 3, '#a47445', INK_SHADES.jiao, 1.2);
    // Polygonal carved cloud-cap (`雕花望柱头`, zero `ctx.arc`!)
    jiehuaQuad(
      ctx,
      [
        [x - 5.0, curbY - postH],
        [x - 3.5, curbY - postH - 5.2],
        [x, curbY - postH - 7.6],
        [x + 3.5, curbY - postH - 5.2],
        [x + 5.0, curbY - postH],
      ],
      '#d5ab79',
      INK_SHADES.jiao,
      1.05
    );
  }

  ctx.restore();
}

/**
 * Draws the bespoke Northern Song Imperial Academy `工笔设色蛤粉` Pelican & Old Elmwood
 * Mortise-and-Tenon Bicycle (`宣和画院工笔蛤粉鹈鹕 + 老榆木榫卯槽轮麻绳传动脚踏车`)!
 * - 16-spoke 16-felloe iron-clamped hardwood wheels (polygonal segments, ZERO `ctx.arc`!)
 * - Grooved wooden spinning-wheel pulley & continuous twisted hemp-rope drive (ZERO `setLineDash`!)
 * - Woven bamboo sutra chest (`竹书箧`) wrapped in `花青` cloth + Bezier double-bulb wine gourd (`酒葫芦`)
 * - Sculpted anatomical Gongbi clam-white plumage (`蛤粉分染`) + Huizong lacquer-dot eye (`生漆点睛`)
 * - ZERO `createRadialGradient` modern glow ball, ZERO `roundRect`, ZERO `strokeRect`!
 */
function drawQingmingGongbiPelican(ctx, rig) {
  const s = rig.root.scale;
  const lw = (w) => Math.max(0.55, w * s);
  const t = rig.time || 0;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 1. Grounded Ink-and-Ochre Bridge-Deck Contact Shadow (replaces artificial glow aura!)
  fillOrganicDot(
    ctx,
    (rig.rearWheel.x + rig.frontWheel.x) * 0.5,
    (rig.rearWheel.y + rig.frontWheel.y) * 0.5 + rig.rearWheel.r + 2.2 * s,
    114 * s,
    7.5 * s,
    rig.root.slope,
    'rgba(38, 28, 18, 0.28)'
  );

  // 2. 16-Spoke Segmented Hardwood & Iron-Clamped Song Wheel (`十六辐拼合木辋铁箍木轮`, zero `ctx.arc`!)
  const drawElmwoodSongWheel = (w) => {
    const felloes = 16;
    const spokes = 16;
    const rOuter = w.r;
    const rInner = w.r - 6.2 * s;

    // 16 tapered mortised hardwood spokes (`榫接木辐条`)
    for (let i = 0; i < spokes; i++) {
      const a = w.angle + (i / spokes) * Math.PI * 2;
      drawNailRatStroke(
        ctx,
        w.x + Math.cos(a) * (6.5 * s),
        w.y + Math.sin(a) * (6.5 * s),
        w.x + Math.cos(a) * (rInner + 1.5 * s),
        w.y + Math.sin(a) * (rInner + 1.5 * s),
        lw(2.3),
        lw(1.35),
        i % 2 === 0 ? '#6e4928' : '#855a33',
        0
      );
    }

    // 16 bent-elmwood felloe segments (`十六段拼合老榆木车辋`) + forged iron rim tire (`熟铁外箍`)
    for (let k = 0; k < felloes; k++) {
      const a0 = w.angle + (k / felloes) * Math.PI * 2;
      const a1 = w.angle + ((k + 1) / felloes) * Math.PI * 2;
      const segPts = [
        [w.x + Math.cos(a0) * rOuter, w.y + Math.sin(a0) * rOuter],
        [w.x + Math.cos(a1) * rOuter, w.y + Math.sin(a1) * rOuter],
        [w.x + Math.cos(a1) * rInner, w.y + Math.sin(a1) * rInner],
        [w.x + Math.cos(a0) * rInner, w.y + Math.sin(a0) * rInner],
      ];
      fillPoly(ctx, segPts, k % 2 === 0 ? '#a97946' : '#946739', 1.0);
      // Forged dark iron tire band & inner rim rule
      jiehuaStroke(ctx, segPts[0][0], segPts[0][1], segPts[1][0], segPts[1][1], lw(2.3), '#24201c', 0.96);
      jiehuaStroke(ctx, segPts[3][0], segPts[3][1], segPts[2][0], segPts[2][1], lw(1.15), INK_SHADES.jiao, 0.90);
      // Radial felloe joinery seam + iron dovetail cramp (`木辋拼缝铁锔`) every 2 segments!
      jiehuaStroke(ctx, segPts[0][0], segPts[0][1], segPts[3][0], segPts[3][1], lw(0.95), INK_SHADES.jiao, 0.85);
      if (k % 2 === 0) {
        const am = (a0 + a1) * 0.5;
        const rm = (rOuter + rInner) * 0.5;
        fillOrganicDot(
          ctx,
          w.x + Math.cos(am) * rm,
          w.y + Math.sin(am) * rm,
          2.2 * s,
          1.1 * s,
          am,
          '#231f1b'
        );
      }
    }

    // Octagonal iron-banded elmwood axle nave (`八角铁箍车毂`, zero `ctx.arc`!)
    fillOrganicDot(ctx, w.x, w.y, 7.6 * s, 7.4 * s, w.angle, '#5c3c20', INK_SHADES.jiao, lw(1.4));
    fillOrganicDot(ctx, w.x, w.y, 3.6 * s, 3.5 * s, w.angle + 0.4, '#cfa474', INK_SHADES.jiao, lw(1.0));
  };

  drawElmwoodSongWheel(rig.rearWheel);
  drawElmwoodSongWheel(rig.frontWheel);

  // 3. Far Pelican Leg (`左腿远景工笔赭黄鳞爪`, drawn behind wooden frame!)
  const drawGongbiPelicanLeg = (hip, knee, foot, pedal, isFar) => {
    const thighCol = isFar ? '#dfd2ba' : SONG_PIGMENTS.clamWhite;
    const shankCol = isFar ? '#b5743c' : '#cf8847';
    // Feathered thigh drumstick
    drawNailRatStroke(ctx, hip.x, hip.y, knee.x, knee.y, lw(13.5), lw(6.2), thighCol, 1.5 * s);
    jiehuaStroke(ctx, hip.x, hip.y, knee.x, knee.y, lw(1.1), INK_SHADES.jiao, 0.85);
    // Scaly orange-ochre tarsus (`工笔细勾鳞纹鸟胫`)
    drawNailRatStroke(ctx, knee.x, knee.y, foot.x, foot.y, lw(4.8), lw(3.4), shankCol, -0.6 * s);
    jiehuaStroke(ctx, knee.x, knee.y, foot.x, foot.y, lw(1.1), INK_SHADES.jiao, 0.92);
    // Webbed 3-toe pelican foot gripping rectangular wooden pedal block (`木踏板`, zero `roundRect`!)
    const toePts = [
      [foot.x - 4 * s, foot.y],
      [foot.x + 13 * s, foot.y - 1.5 * s],
      [foot.x + 11 * s, foot.y + 4.2 * s],
      [foot.x - 3 * s, foot.y + 3.5 * s],
    ];
    jiehuaQuad(ctx, toePts, shankCol, INK_SHADES.jiao, lw(1.0));
    jiehuaBox(ctx, pedal.x - 9 * s, pedal.y - 2.6 * s, 18 * s, 5.2 * s, '#6e4928', INK_SHADES.jiao, lw(1.1));
  };

  drawGongbiPelicanLeg(rig.leftHip, rig.leftKnee, rig.leftFoot, rig.leftPedal, true);

  // 4. Old Elmwood Mortise-and-Tenon Frame (`老榆木方梁透榫楔钉车架`)!
  const beam = (p0, p1, thick, col = '#9c6d3e', extend = 4.5) => {
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy) || 1;
    const ox = (dx / len) * extend * s;
    const oy = (dy / len) * extend * s;
    drawJiehuaBeam(ctx, p0.x - ox, p0.y - oy, p1.x + ox, p1.y + oy, thick * s, col, INK_SHADES.jiao, false);
  };

  // Rear stays, seat post, main diagonal beam, top beam & twin-cheek front fork
  beam(rig.rearWheel, rig.bb, 5.2, '#855a32', 4.0);
  beam(rig.rearWheel, rig.seatCluster, 5.0, '#8d6036', 5.5);
  beam(rig.bb, rig.seatCluster, 6.2, '#9e6f40', 6.5);
  beam(rig.bb, rig.headBot, 6.6, '#a57545', 5.5);
  beam(rig.seatCluster, rig.headTop, 6.0, '#ad7d4b', 7.0);
  beam(rig.frontWheel, rig.headBot, 5.8, '#96683b', 4.0);
  beam(rig.headBot, rig.stemTop, 5.6, '#8b5e34', 4.5);
  // Swept wooden tiller bar & turned locust-wood handle grip (`木横把`)
  beam(rig.stemTop, rig.handleGrip, 4.8, '#a67646', 3.5);

  // Hemp-rope cross-lashings & dark wooden wedges at every mortise joint (`麻绳缠结与透榫木楔`)
  for (const jt of [rig.seatCluster, rig.headTop, rig.headBot, rig.bb]) {
    jiehuaBox(ctx, jt.x - 4.2 * s, jt.y - 4.2 * s, 8.4 * s, 8.4 * s, '#593d23', INK_SHADES.jiao, lw(1.1));
    jiehuaStroke(ctx, jt.x - 4.5 * s, jt.y - 4.5 * s, jt.x + 4.5 * s, jt.y + 4.5 * s, lw(1.2), '#cbb082', 0.9);
    jiehuaStroke(ctx, jt.x + 4.5 * s, jt.y - 4.5 * s, jt.x - 4.5 * s, jt.y + 4.5 * s, lw(1.2), '#cbb082', 0.9);
  }

  // Carved curved hardwood saddle (`木雕马鞍座垫` + crimson quilted pad)
  jiehuaQuad(
    ctx,
    [
      [rig.saddle.x - 16 * s, rig.saddle.y - 2 * s],
      [rig.saddle.x + 15 * s, rig.saddle.y - 3.5 * s],
      [rig.saddle.x + 12 * s, rig.saddle.y + 4.5 * s],
      [rig.saddle.x - 14 * s, rig.saddle.y + 5.0 * s],
    ],
    SONG_PIGMENTS.cinnabarMuted,
    INK_SHADES.jiao,
    lw(1.25)
  );

  // 5. Rear Elmwood Rack + Woven-Bamboo Scholar's Sutra Chest (`竹编书箧`) & Swaying Wine Gourd (`红绸酒葫芦`)!
  const cosS = Math.cos(rig.root.slope);
  const sinS = Math.sin(rig.root.slope);
  const rPt = (lx, ly) => ({
    x: rig.rearWheel.x + (lx * cosS - ly * sinS) * s,
    y: rig.rearWheel.y + (lx * sinS + ly * cosS) * s,
  });
  const rackF = rPt(18, -56);
  const rackB = rPt(-34, -56);
  const rackSupport = rPt(-22, -4);
  beam(rackSupport, rackB, 3.8, '#855a32', 2.0);
  beam(rig.seatCluster, rackB, 4.2, '#9c6d3e', 3.5);

  ctx.save();
  ctx.translate((rackF.x + rackB.x) * 0.5, (rackF.y + rackB.y) * 0.5);
  ctx.rotate(rig.root.slope);
  ctx.scale(s, s);

  // Woven-Bamboo Sutra Chest (`宋式竹编书箧` wrapped in `花青` indigo cloth — ZERO `roundRect`!)
  jiehuaBox(ctx, -22, -28, 38, 25, '#cfa96e', INK_SHADES.jiao, 1.25);
  // Cream Song folded-leaf sutra volume peeking under lid (`书卷折页露白`)
  jiehuaBox(ctx, -19, -22, 32, 4.2, '#f5ecd4', INK_SHADES.jiao, 0.85);
  // Overhanging woven bamboo box lid + horizontal bamboo slat weave
  jiehuaBox(ctx, -24, -31, 42, 6.5, '#b88f54', INK_SHADES.jiao, 1.25);
  for (let bx = -16; bx <= 10; bx += 8.5) {
    jiehuaStroke(ctx, bx, -24, bx, -3, 0.8, 'rgba(68, 46, 24, 0.65)', 0.85);
  }
  // `花青` indigo cloth wrapping band & top bow-knot (`花青包袱皮系结`)
  jiehuaQuad(ctx, [[-7, -32], [5, -32], [7, -2], [-5, -2]], SONG_PIGMENTS.indigoMid, INK_SHADES.jiao, 1.0);
  fillOrganicDot(ctx, -1, -34.5, 5.8, 3.2, -0.15, SONG_PIGMENTS.indigoMid, INK_SHADES.jiao, 1.0);

  // Pendulum-Swaying Double-Bulb Song Wine Gourd (`系红绸双腹酒葫芦`, pure Bezier anatomy, zero `ctx.arc`!)
  const gourdSwing = Math.sin(t * 4.6 + rig.pedalAngle) * 0.16;
  ctx.save();
  ctx.translate(-24, -14);
  ctx.rotate(gourdSwing);
  // Crimson silk suspension cord & fluttering ribbon tail
  jiehuaStroke(ctx, 0, 0, 0, 7, 1.3, SONG_PIGMENTS.cinnabarMuted, 0.95);
  drawNailRatStroke(ctx, 0, 6, -9 - gourdSwing * 14, 15, 2.2, 0.6, SONG_PIGMENTS.cinnabarMuted, -1.5);
  // Double-bulb bottle gourd silhouette (`亚腰葫芦`)
  ctx.fillStyle = '#d8a85c';
  ctx.strokeStyle = INK_SHADES.jiao;
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  ctx.moveTo(-1.8, 6);
  ctx.bezierCurveTo(-6.5, 7, -6.2, 13.5, -2.5, 15.2); // upper bulb left
  ctx.bezierCurveTo(-9.5, 17.8, -9.8, 28.5, 0, 29.2); // lower belly left
  ctx.bezierCurveTo(9.8, 28.5, 9.5, 17.8, 2.5, 15.2); // lower belly right
  ctx.bezierCurveTo(6.2, 13.5, 6.5, 7, 1.8, 6);       // upper bulb right
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Crimson waist sash & wooden cork stopper
  jiehuaStroke(ctx, -2.8, 15.2, 2.8, 15.2, 1.8, SONG_PIGMENTS.cinnabarMuted, 0.95);
  jiehuaBox(ctx, -1.8, 3.2, 3.6, 3.0, '#6b3e24', INK_SHADES.jiao, 0.9);
  ctx.restore();
  ctx.restore();

  // 6. Grooved Wooden Rope-Pulley Drive & Continuous Twisted Hemp Rope (`木纺车槽轮与双股绞合麻绳`, ZERO `setLineDash`!)
  const rPulley = 16.5 * s;
  const rRearGroove = 8.2 * s;
  // Continuous braided hemp rope upper & lower runs (two intertwined phase-shifted strands!)
  const drawTwistedHempRun = (x0, y0, x1, y1) => {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const steps = 18;
    for (const strandSign of [-1, 1]) {
      ctx.strokeStyle = strandSign > 0 ? '#cbb07c' : '#6e5232';
      ctx.lineWidth = lw(1.35);
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const twist = Math.sin(u * 26 - rig.pedalAngle * 4) * 0.9 * s * strandSign;
        const px = lerp(x0, x1, u) + nx * twist;
        const py = lerp(y0, y1, u) + ny * twist;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  };
  drawTwistedHempRun(rig.rearWheel.x, rig.rearWheel.y - rRearGroove, rig.bb.x, rig.bb.y - rPulley);
  drawTwistedHempRun(rig.rearWheel.x, rig.rearWheel.y + rRearGroove, rig.bb.x, rig.bb.y + rPulley);

  // 12-sided Grooved Hardwood Pulley Wheel (`十二棱雕槽大木轮`) + wooden crank arms!
  const pulleyPts = [];
  for (let i = 0; i < 12; i++) {
    const a = rig.pedalAngle + (i / 12) * Math.PI * 2;
    pulleyPts.push([rig.bb.x + Math.cos(a) * rPulley, rig.bb.y + Math.sin(a) * rPulley]);
  }
  jiehuaQuad(ctx, pulleyPts, '#9b6b3c', INK_SHADES.jiao, lw(1.35));
  for (let i = 0; i < 4; i++) {
    const a = rig.pedalAngle + (i * Math.PI) / 2;
    jiehuaStroke(
      ctx,
      rig.bb.x + Math.cos(a) * (4 * s),
      rig.bb.y + Math.sin(a) * (4 * s),
      rig.bb.x + Math.cos(a) * (rPulley - 3 * s),
      rig.bb.y + Math.sin(a) * (rPulley - 3 * s),
      lw(2.1),
      '#54381e',
      0.92
    );
  }
  drawJiehuaBeam(ctx, rig.bb.x, rig.bb.y, rig.leftPedal.x, rig.leftPedal.y, 3.8 * s, '#784e2a');
  drawJiehuaBeam(ctx, rig.bb.x, rig.bb.y, rig.rightPedal.x, rig.rightPedal.y, 4.2 * s, '#8c5d34');

  // 7. Northern Song Imperial Academy `工笔设色蛤粉` Pelican (`宣和院体工笔设色鹈鹕`)!
  const bc = rig.bodyCenter;
  const rx = bc.rx;
  const ry = bc.ry;

  // Tail feathers (`焦墨分染尾羽`)
  for (let tf = -2; tf <= 2; tf++) {
    drawNailRatStroke(
      ctx,
      bc.x - rx * 0.72,
      bc.y + tf * 2.5 * s,
      rig.tailTip.x - Math.abs(tf) * 3 * s,
      rig.tailTip.y + tf * 4.2 * s,
      lw(5.2),
      lw(1.2),
      tf % 2 === 0 ? SONG_PIGMENTS.clamWhite : '#ded2bc',
      0
    );
    jiehuaStroke(
      ctx,
      bc.x - rx * 0.72,
      bc.y + tf * 2.5 * s,
      rig.tailTip.x - Math.abs(tf) * 3 * s,
      rig.tailTip.y + tf * 4.2 * s,
      lw(0.95),
      INK_SHADES.jiao,
      0.88
    );
  }

  // Sculpted anatomical Gongbi clam-white torso + S-neck silhouette (`蛤粉厚涂托底 + 赭墨花青分染`)
  ctx.save();
  ctx.fillStyle = SONG_PIGMENTS.clamWhite;
  ctx.strokeStyle = INK_SHADES.jiao;
  ctx.lineWidth = lw(1.45);
  ctx.beginPath();
  ctx.moveTo(rig.tailTip.x + 8 * s, rig.tailTip.y - 4 * s);
  ctx.bezierCurveTo(
    bc.x - rx * 0.65,
    bc.y - ry * 1.18,
    bc.x + rx * 0.45,
    bc.y - ry * 1.05,
    rig.chest.x - 4 * s,
    rig.chest.y - 6 * s
  );
  // Back of S-curved neck rising to occipital crown
  ctx.bezierCurveTo(
    rig.neckC1.x - 15 * s,
    rig.neckC1.y - 4 * s,
    rig.neckC2.x - 13 * s,
    rig.neckC2.y,
    rig.head.x - 13 * s,
    rig.head.y - 5 * s
  );
  // Sculpted anatomical pelican crown & brow (NO `ctx.arc` ball!)
  ctx.bezierCurveTo(
    rig.head.x - 9 * s,
    rig.head.y - 16 * s,
    rig.head.x + 8 * s,
    rig.head.y - 15 * s,
    rig.beakUpperBase.x + 2 * s,
    rig.beakUpperBase.y
  );
  ctx.lineTo(rig.beakLowerBase.x, rig.beakLowerBase.y + 4 * s);
  // Throat & front of S-curved neck sweeping into full chest & belly
  ctx.bezierCurveTo(
    rig.neckC2.x + 11 * s,
    rig.neckC2.y + 8 * s,
    rig.neckC1.x + 14 * s,
    rig.neckC1.y + 10 * s,
    rig.chest.x + 12 * s,
    rig.chest.y + 12 * s
  );
  ctx.bezierCurveTo(
    bc.x + rx * 0.75,
    bc.y + ry * 1.15,
    bc.x - rx * 0.62,
    bc.y + ry * 1.08,
    rig.tailTip.x + 8 * s,
    rig.tailTip.y + 5 * s
  );
  ctx.closePath();
  ctx.fill();

  // Clip inside torso/neck to lay in museum `淡赭墨` warm dorsal wash & `花青` cool belly shadow!
  ctx.save();
  ctx.clip();
  const dorsalGrad = ctx.createLinearGradient(bc.x, rig.head.y - 16 * s, bc.x, bc.y + ry);
  dorsalGrad.addColorStop(0, 'rgba(182, 146, 102, 0.24)');
  dorsalGrad.addColorStop(0.55, 'rgba(247, 239, 224, 0.0)');
  dorsalGrad.addColorStop(1, 'rgba(86, 111, 120, 0.22)');
  ctx.fillStyle = dorsalGrad;
  ctx.fillRect(bc.x - 140 * s, rig.head.y - 40 * s, 280 * s, 240 * s);

  // Fine Gongbi scalloped body contour feathers (`工笔细丝鳞状腹羽`)
  ctx.strokeStyle = 'rgba(72, 58, 42, 0.34)';
  ctx.lineWidth = lw(0.75);
  for (let row = 0; row < 3; row++) {
    for (let col = -3; col <= 3; col++) {
      const fx = bc.x + col * 9.5 * s + (row % 2) * 4.5 * s;
      const fy = bc.y - 6 * s + row * 8.5 * s;
      ctx.beginPath();
      ctx.moveTo(fx - 5 * s, fy);
      ctx.quadraticCurveTo(fx, fy + 4.2 * s, fx + 5 * s, fy);
      ctx.stroke();
    }
  }
  ctx.restore();
  ctx.stroke();
  ctx.restore();

  // Wispy occipital crest plumes (`脑后冠羽`, `钉头鼠尾` strokes)
  drawNailRatStroke(ctx, rig.head.x - 9 * s, rig.head.y - 11 * s, rig.crest1.x, rig.crest1.y, lw(3.4), lw(0.6), SONG_PIGMENTS.clamWhite, -1.2 * s);
  jiehuaStroke(ctx, rig.head.x - 9 * s, rig.head.y - 11 * s, rig.crest1.x, rig.crest1.y, lw(0.95), INK_SHADES.jiao, 0.88);
  drawNailRatStroke(ctx, rig.head.x - 11 * s, rig.head.y - 6 * s, rig.crest2.x, rig.crest2.y, lw(3.0), lw(0.6), '#e8dcc4', -1.0 * s);
  jiehuaStroke(ctx, rig.head.x - 11 * s, rig.head.y - 6 * s, rig.crest2.x, rig.crest2.y, lw(0.9), INK_SHADES.jiao, 0.85);

  // Near Pelican Leg (`右腿前景工笔鳞爪蹬踏`)
  drawGongbiPelicanLeg(rig.rightHip, rig.rightKnee, rig.rightFoot, rig.rightPedal, false);

  // 8. Layered Gongbi Wing (`工笔层叠覆羽 + 焦墨劲挺主飞羽握车把` — 18 individual feathers!)
  const ws = rig.wingShoulder;
  const we = rig.wingElbow;
  const wt = rig.wingTip;

  // Dark soot-ink primary flight quills (`焦墨主飞羽`) extending forward to wrap the elmwood handlebar!
  for (let p = 0; p < 6; p++) {
    const u = p / 5;
    const sx = lerp(we.x - 8 * s, we.x + 6 * s, u);
    const sy = lerp(we.y + 6 * s, we.y - 4 * s, u);
    const tx = wt.x + (2 - p * 2.4) * s;
    const ty = wt.y + (p * 2.8 - 2) * s;
    drawNailRatStroke(ctx, sx, sy, tx, ty, lw(5.2), lw(1.6), p < 3 ? '#2c2925' : '#4a453e', -2.2 * s);
    jiehuaStroke(ctx, sx, sy, tx, ty, lw(0.85), INK_SHADES.jiao, 0.92);
  }

  // Secondary & lesser clam-white/ochre covert feathers (`蛤粉赭石层叠覆羽`)
  const wingCovertPts = [
    [ws.x - 18 * s, ws.y - 4 * s],
    [ws.x + 12 * s, ws.y - 10 * s],
    [wt.x + 4 * s, wt.y - 3 * s],
    [we.x + 8 * s, we.y + 8 * s],
    [ws.x - 14 * s, ws.y + 12 * s],
  ];
  fillPoly(ctx, wingCovertPts, SONG_PIGMENTS.clamWhite, 0.98);
  for (let c = 0; c < 8; c++) {
    const cu = c / 7;
    const cx0 = lerp(ws.x - 14 * s, we.x + 12 * s, cu);
    const cy0 = lerp(ws.y - 2 * s, wt.y - 1 * s, cu);
    drawNailRatStroke(
      ctx,
      cx0,
      cy0,
      cx0 + 13 * s,
      cy0 + 6.5 * s,
      lw(4.4),
      lw(1.2),
      c % 2 === 0 ? '#e6d7ba' : '#d2bc96',
      1.0 * s
    );
    jiehuaStroke(ctx, cx0, cy0, cx0 + 13 * s, cy0 + 6.5 * s, lw(0.85), INK_SHADES.jiao, 0.85);
  }
  jiehuaStroke(ctx, ws.x - 16 * s, ws.y - 5 * s, wt.x + 4 * s, wt.y - 3 * s, lw(1.35), INK_SHADES.jiao, 0.94);

  // 9. Iconic Gongbi Long Hooked Beak & Veined Ochre-Cinnabar Gular Pouch (`朱砂赭石细勾颔囊与钩喙`)!
  // Elastic gular throat pouch (`颔囊`) with delicate vascular brush lines
  ctx.fillStyle = '#dba065';
  ctx.strokeStyle = INK_SHADES.jiao;
  ctx.lineWidth = lw(1.25);
  ctx.beginPath();
  ctx.moveTo(rig.beakLowerBase.x, rig.beakLowerBase.y + 1 * s);
  ctx.quadraticCurveTo(
    rig.pouchBelly.x - 8 * s,
    rig.pouchBelly.y + 8 * s,
    rig.beakTip.x - 5 * s,
    rig.beakTip.y + 2 * s
  );
  ctx.lineTo(rig.beakLowerBase.x, rig.beakLowerBase.y + 1 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Subtle cinnabar-ochre pouch blush & delicate Song `游丝描` pouch folds
  for (let v = 1; v <= 4; v++) {
    const vu = v / 5;
    const vx0 = lerp(rig.beakLowerBase.x + 4 * s, rig.beakTip.x - 14 * s, vu);
    const vy0 = lerp(rig.beakLowerBase.y + 2 * s, rig.beakTip.y + 1 * s, vu);
    const vx1 = lerp(rig.pouchBelly.x - 10 * s, rig.pouchBelly.x + 12 * s, vu);
    const vy1 = lerp(rig.beakLowerBase.y + 9 * s, rig.pouchBelly.y - 3 * s, Math.sin(vu * Math.PI));
    ctx.strokeStyle = 'rgba(148, 62, 44, 0.38)';
    ctx.lineWidth = lw(0.68);
    ctx.beginPath();
    ctx.moveTo(vx0, vy0);
    ctx.quadraticCurveTo((vx0 + vx1) * 0.5, vy1, vx1, vy1 + 2 * s);
    ctx.stroke();
  }

  // Sculpted upper mandible ridge (`赭黄染朱砂钩喙`) with hooked nail tip (`喙端焦墨鹰钩`)
  ctx.fillStyle = '#e7be7c';
  ctx.strokeStyle = INK_SHADES.jiao;
  ctx.lineWidth = lw(1.35);
  ctx.beginPath();
  ctx.moveTo(rig.beakUpperBase.x - 1 * s, rig.beakUpperBase.y - 1 * s);
  ctx.quadraticCurveTo(
    (rig.beakUpperBase.x + rig.beakTip.x) * 0.52,
    (rig.beakUpperBase.y + rig.beakTip.y) * 0.5 - 4.5 * s,
    rig.beakTip.x + 2.5 * s,
    rig.beakTip.y - 1.5 * s
  );
  // Sharp downward hook at tip of pelican bill
  ctx.lineTo(rig.beakTip.x + 3.8 * s, rig.beakTip.y + 4.8 * s);
  ctx.lineTo(rig.beakTip.x - 2.2 * s, rig.beakTip.y + 1.8 * s);
  ctx.lineTo(rig.beakLowerBase.x, rig.beakLowerBase.y + 1 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Cinnabar-red nail hook accent
  fillOrganicDot(ctx, rig.beakTip.x + 1.4 * s, rig.beakTip.y + 1.8 * s, 3.0 * s, 2.2 * s, 0.4, SONG_PIGMENTS.cinnabarMuted);

  // 10. Emperor Huizong Lacquer-Dot Eye (`宣和生漆点睛` — golden-ochre orbital ring + obsidian dot + clam-white spark!)
  const ex = rig.head.x + 3.2 * s;
  const ey = rig.head.y - 4.2 * s;
  fillOrganicDot(ctx, ex, ey, 4.4 * s, 3.6 * s, 0.05, '#e8c885', INK_SHADES.jiao, lw(0.95));
  fillOrganicDot(ctx, ex + 0.6 * s, ey, 2.3 * s, 2.2 * s, 0, '#110f0d');
  fillOrganicDot(ctx, ex + 1.2 * s, ey - 0.8 * s, 0.85 * s, 0.75 * s, 0, SONG_PIGMENTS.clamWhite);

  ctx.restore();
}

/**
 * Main scene entry point for `#06 清明上河图` (`s06_qingming.js` — r3 Museum Masterpiece).
 */
export function render(kit, slot, scene, params) {
  const {
    localT = 0,
    t = 0,
    pelicanLocalX = 500,
    pedalAngle = 0,
    speedScale = 1.0,
    isOutroThumbnail = false,
  } = params;

  // Strictly pure 2D slot output (`bakeBrush` transferred once inside `getBakedQingmingScroll`)
  slot.usedFb = false;
  const g = slot.g2d;
  const ctx = g.drawingContext;

  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Baked Palace Museum Handscroll Substrate, Irregular Upstream River, 3/4 Compounds & 5-Rib Rainbow Bridge
  const bg = getBakedQingmingScroll(kit);
  if (bg && bg.canvas) {
    ctx.drawImage(bg.canvas, 0, 0);
  }

  // 2. Dynamic `新酒` Tavern Banner, `彩楼欢门` Silk Streamers & Swaying Weeping Willow Strands
  drawDynamicTavernBannerAndWillows(ctx, t);

  // 3. Dynamic Bian River Water Threads & Cargo Barge Lowering Mast (`虹桥过船`)
  drawBianRiverAndCargoBarge(ctx, t, localT);

  // Compute pelican bridge coordinates for cascading domino crowd gaze & rig
  const clampedPelX = clamp(pelicanLocalX, -220, PANEL_SIZE + 220);
  const { y: pelRoadY, slope: pelSlope } = kit.sampleRoad(clamp(clampedPelX, 0, PANEL_SIZE), ARCH_H);

  // 4. Far-Row Rainbow Bridge Townsfolk (`back` promenade spectators, `钉头鼠尾描` domino wave)
  for (const person of BRIDGE_TOWNSFOLK) {
    if (person.row === 'back') {
      drawSongTownsperson(ctx, kit, person, localT, t, clampedPelX, pelRoadY);
    }
  }

  // 5. Bespoke Gongbi Clam-White Pelican & Old Elmwood Mortise-and-Tenon Pulley Bicycle
  if (pelicanLocalX > -240 && pelicanLocalX < PANEL_SIZE + 240) {
    const rig = computePelicanRig({
      x: pelicanLocalX,
      y: pelRoadY,
      pedalAngle,
      scale: 1.0,
      slope: pelSlope,
      speedScale,
      poseMode: 'normal',
      time: t,
    });
    drawQingmingGongbiPelican(ctx, rig);
  }

  // 6. Near-Row Rainbow Bridge Townsfolk & Foreground `勾阑望柱` Posts for True Handscroll Depth!
  for (const person of BRIDGE_TOWNSFOLK) {
    if (person.row === 'front') {
      drawSongTownsperson(ctx, kit, person, localT, t, clampedPelX, pelRoadY);
    }
  }
  drawForegroundBridgePosts(ctx, kit);

  // 7. ONLY Outro 7x3 Exhibition Wall Label Strip (`!isOutroThumbnail` top-left UI card 100% removed per #85!)
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(15, 14, 12, 0.74)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.fillStyle = '#f5f0e6';
    ctx.font = '700 48px "PelicanSerif", serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} ${scene.zh}`, 36, PANEL_SIZE - 48);
  }

  ctx.restore();
}
