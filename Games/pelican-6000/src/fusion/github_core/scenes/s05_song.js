// src/scenes/s05_song.js
// #05 宋代山水 (Northern Song Monumental Landscape, c. 1000 — r3 Museum Artifact Masterpiece)
// Homage to Fan Kuan's 《溪山行旅图》 (Taipei National Palace Museum):
// - Deep Taipei Palace Museum tea-umber double-thread aged Song silk (`千年茶褐双丝熟绢包浆`),
//   2px orthogonal warp/weft silk weave, age mottling, and horizontal scroll-rolling silk creases (`断绢丝裂`)
// - WebGL2 `kit.bakeBrush` (`p5.brush` Kubelka-Munk spectral ink & wet mist bleed) transferred once via
//   `fb.get().canvas` into `bake2D` (`slot.usedFb = false`, 100% Outro-wall compatible, <16ms/frame)
// - Asymmetric, square-shouldered central granite monolith sculpted by ~14,000 strata-aligned teardrop/sesame
//   `雨点皴 / 豆瓣皴` calligraphic brush dabs (ZERO `lineTo` capsule ticks!) in 4 layered ink passes
// - Three-tiered zigzagging rocky ravine cascade (`三叠折落深谷岩缝泉道`) occluded by interlocking dark cliff jaws,
//   with `p5.brush` wet-bleed plunge mist rising from the pool mouth into the waist clouds (`山腰氤氲云气`)
// - 2x supersampled (`2000x1120`) mid-ground valley, overhanging `折带皴/小斧劈` cliff stone foundations &
//   diagonal round-log cantilever trestle (`斜撑圆木栈道排架`, completely eliminating under-trail void & comb sticks!),
//   angular 3-face sunlit/shaded stream boulders, and Song `勾水法` rapids for razor-sharp `2.95x` (`31.80s`) zoom!
// - Bespoke Northern Song square-timber mortise-and-tenon porter bicycle (polygonal iron-clamped 8-spoke wood wheels,
//   hemp lashings) + calligraphic `0.18x` `点景` pelican with woven bamboo conical hat (`斗笠`), startled pack donkeys & drover
// - Native Song slender-gold (`瘦金体`) silk mounting slip, eroded imperial cinnabar seals, and hidden `臣寬製` signature in pine!

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  clamp,
  lerp,
  smoothstep,
  smootherstep,
} from '../beat/timeline.js';
import { computePelicanRig } from '../rig/pelican.js';
import { INK_SHADES } from '../kit/ink.js';

/**
 * Evaluates the C1-continuous Northern Song mountain-foot trail `y(x)` and `slope(x)`.
 * Strictly anchored at `(0, 680)` and `(1000, 680)` with horizontal tangents at both frame stiles.
 */
function evalSongTrailY(x) {
  const u = clamp(x / PANEL_SIZE, 0, 1);
  const s = Math.sin(Math.PI * u);
  const seamTerrace = smootherstep(0.115, 0.235, u) * smootherstep(0.885, 0.765, u);
  const env = s * s * seamTerrace;
  const profile =
    82 -
    26 * Math.tanh((u - 0.45) * 7.2) +
    11 * Math.sin(Math.PI * 3 * u - 0.25);
  return ROAD_EDGE_Y + env * profile;
}

function sampleSongTrail(x) {
  const cx = clamp(x, 0, PANEL_SIZE);
  const y = evalSongTrailY(cx);
  if (cx <= 0.5 || cx >= PANEL_SIZE - 0.5) {
    return { y: ROAD_EDGE_Y, slope: 0 };
  }
  const dx = 1.0;
  const dydx = (evalSongTrailY(cx + dx) - evalSongTrailY(cx - dx)) / (2 * dx);
  return { y, slope: Math.atan(dydx) };
}

/**
 * Subdivides a coarse control polyline into a craggy, angular Northern Song granite contour
 * (`折带皴/斧劈石棱细分`, eliminating straight low-poly computer lines).
 */
function subdivideCraggyPath(ctrlPts, rng, iterations = 3, roughness = 0.19, closed = false) {
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
      const tSplit = 0.34 + rng() * 0.32;
      const disp = (rng() - 0.46) * segLen * roughness * falloff;
      const jog = (rng() - 0.5) * segLen * 0.09 * falloff;
      next.push([
        p0[0] + dx * tSplit + nx * disp + (dx / segLen) * jog,
        p0[1] + dy * tSplit + ny * disp + (dy / segLen) * jog,
      ]);
    }
    if (!closed) next.push(pts[pts.length - 1]);
    pts = next;
  }
  return pts;
}

/**
 * Fills an arbitrary polygon path cleanly.
 */
function fillPoly(ctx, pts, fillStyle, alpha = 1.0) {
  if (pts.length < 3) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Registers custom Northern Song brushes on `p5.brush` once (`s05_fankuan_cun`, `s05_zhedai_cefeng`).
 */
function ensureSongCustomBrushes(brush, makePRNG) {
  if (!brush || typeof brush.box !== 'function' || typeof brush.add !== 'function') return false;
  const existing = brush.box();
  if (!existing.includes('s05_fankuan_cun')) {
    const rng = makePRNG(100005);
    brush.add('s05_fankuan_cun', {
      type: 'custom',
      weight: 4.8,
      scatter: 0.48,
      opacity: 165,
      spacing: 0.18,
      rotate: 'natural',
      markerTip: true,
      noise: 0.62,
      pressure: { curve: [0.20, 0.36], min_max: [1.26, 0.48] },
      tip: (m) => {
        m.fill(0);
        for (let i = 0; i < 20; i++) {
          const lane = (i / 19 - 0.5) * 2;
          const bx = lane * 20 + (rng() - 0.5) * 4;
          const by = (rng() - 0.5) * 9;
          m.ellipse(bx, by, 2.8 + rng() * 3.4, 1.5 + rng() * 2.2);
        }
      },
    });
  }
  if (!existing.includes('s05_zhedai_cefeng')) {
    const rng = makePRNG(100055);
    brush.add('s05_zhedai_cefeng', {
      type: 'custom',
      weight: 8.2,
      scatter: 0.62,
      opacity: 140,
      spacing: 0.22,
      rotate: 'natural',
      markerTip: false,
      noise: 0.75,
      pressure: { curve: [0.16, 0.44], min_max: [1.20, 0.42] },
      tip: (m) => {
        m.fill(0);
        for (let i = 0; i < 26; i++) {
          if (i % 4 === 1 && rng() < 0.6) continue;
          const lane = (i / 25 - 0.5) * 2;
          m.ellipse(lane * 30 + (rng() - 0.5) * 4, lane * 6 + (rng() - 0.5) * 6, 3.4 + rng() * 4.0, 1.4 + rng() * 2.0);
        }
      },
    });
  }
  return true;
}

/**
 * Transfers a baked `p5.Framebuffer` into a 2D context once via `fb.get().canvas`.
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
 * Draws an organic Northern Song `钉头鼠尾 / 折带描` variable-width multi-bristle rock/branch stroke
 * with heavy paused corner knots (`顿挫石棱`), dry split-bristle flying white (`渴笔飞白`), and ink pooling.
 */
function drawCalligraphicRockOutline(ctx, pts, rng, {
  baseWidth = 3.2,
  color = INK_SHADES.jiao,
  alpha = 0.90,
  dryness = 0.34,
  bristles = 5,
} = {}) {
  if (pts.length < 2) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let b = 0; b < bristles; b++) {
    const bNorm = bristles === 1 ? 0 : (b / (bristles - 1) - 0.5) * 2;
    const isCore = Math.abs(bNorm) < 0.38;
    ctx.globalAlpha = alpha * (isCore ? 0.88 : 0.46);

    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const dx = x1 - x0;
      const dy = y1 - y0;
      const segL = Math.hypot(dx, dy) || 1;
      const nx = -dy / segL;
      const ny = dx / segL;

      let cornerBoost = 0;
      if (i > 0) {
        const [px, py] = pts[i - 1];
        const a0 = Math.atan2(y0 - py, x0 - px);
        const a1 = Math.atan2(dy, dx);
        let da = Math.abs(a1 - a0);
        if (da > Math.PI) da = Math.PI * 2 - da;
        cornerBoost = Math.min(1.45, da * 1.15);
      }

      // Skip outer bristles intermittently for dry silk-tooth 飞白
      if (!isCore && dryness > 0.1 && rng() < dryness * (0.45 + 0.35 * Math.abs(bNorm))) {
        continue;
      }

      const wMod = 0.58 + 0.52 * Math.sin(i * 0.72 + b * 1.1) + cornerBoost * 0.58;
      const off0 = bNorm * baseWidth * 0.38 * wMod;
      const off1 = bNorm * baseWidth * 0.36 * wMod + (rng() - 0.5) * 0.55;
      ctx.lineWidth = Math.max(0.45, (baseWidth / Math.max(1.8, bristles * 0.52)) * wMod);
      ctx.beginPath();
      ctx.moveTo(x0 + nx * off0, y0 + ny * off0);
      ctx.lineTo(x1 + nx * off1, y1 + ny * off1);
      ctx.stroke();

      // Pause ink knot (`折笔驻锋顿点`) at sharp rock corners
      if (isCore && cornerBoost > 0.52 && rng() < 0.72) {
        ctx.beginPath();
        const kr = baseWidth * (0.42 + 0.25 * cornerBoost);
        for (let k = 0; k < 7; k++) {
          const ka = (k / 7) * Math.PI * 2;
          const rj = kr * (0.72 + 0.45 * rng());
          const kx = x0 + Math.cos(ka) * rj;
          const ky = y0 + Math.sin(ka) * rj * 0.82;
          if (k === 0) ctx.moveTo(kx, ky);
          else ctx.lineTo(kx, ky);
        }
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

/**
 * Draws a single authentic Fan Kuan `雨点皴 / 豆瓣皴` teardrop/sesame-seed calligraphic brush dab!
 * Features a rounded heavy press entry (`藏锋顿按`), subtle rock-strata curvature, and split dry tail (`锋梢飞白`)
 * — completely eradicating uniform straight `lineTo` capsule ticks!
 */
function drawRaindropCunDab(ctx, x, y, len, width, angle, curve, rng) {
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const nx = -sa;
  const ny = ca;

  const hwTop = width * (0.52 + 0.16 * rng());
  const hwMid = width * (0.38 + 0.12 * rng());
  const bend = curve * len;

  const headX = x - ca * hwTop * 0.55;
  const headY = y - sa * hwTop * 0.55;
  const midX = x + ca * len * 0.46 + nx * bend * 0.55;
  const midY = y + sa * len * 0.46 + ny * bend * 0.55;
  const tipX = x + ca * len + nx * bend;
  const tipY = y + sa * len + ny * bend;

  ctx.beginPath();
  ctx.moveTo(headX, headY);
  // Left belly of sesame/raindrop dab
  ctx.quadraticCurveTo(
    x + ca * len * 0.18 + nx * hwTop,
    y + sa * len * 0.18 + ny * hwTop,
    midX + nx * hwMid,
    midY + ny * hwMid
  );
  ctx.quadraticCurveTo(
    x + ca * len * 0.78 + nx * (bend * 0.85 + hwMid * 0.35),
    y + sa * len * 0.78 + ny * (bend * 0.85 + hwMid * 0.35),
    tipX,
    tipY
  );
  // Split dry-brush notch on larger cun dabs (`渴笔分叉尾梢`)
  if (len > 5.8 && rng() < 0.42) {
    ctx.lineTo(
      x + ca * len * 0.82 + nx * (bend * 0.75),
      y + sa * len * 0.82 + ny * (bend * 0.75)
    );
    ctx.lineTo(
      tipX - nx * width * 0.34 - ca * len * 0.08,
      tipY - ny * width * 0.34 - sa * len * 0.08
    );
  }
  // Right belly back to tucked entry
  ctx.quadraticCurveTo(
    midX - nx * hwMid,
    midY - ny * hwMid,
    x + ca * len * 0.16 - nx * hwTop * 0.92,
    y + sa * len * 0.16 - ny * hwTop * 0.92
  );
  ctx.closePath();
  ctx.fill();
}

/**
 * Populates a clipped Northern Song rock mass with 4 calligraphic passes of strata-aligned
 * `雨点皴 / 豆瓣皴` or `小斧劈皴` dabs (`浅绛赭底 → 清淡墨疏皴 → 浓重墨攒簇 → 焦墨破醒石棱`)!
 */
function paintRockCunMass(ctx, rng, pts, {
  count = 1400,
  slant = 0.04,
  cunLength = [3.2, 8.2],
  cunWidth = [1.05, 2.35],
  darkBias = 0.62,
  topDense = true,
  ochreTint = 0.17,
  mistFadeRange = null,
  lightDir = -1,
  axeCutMix = 0.0, // >0 blends broader oblique `小斧劈/折带侧锋` facets for cliff bases & stream rocks
}) {
  let xMin = 99999;
  let xMax = -99999;
  let yMin = 99999;
  let yMax = -99999;
  for (const [x, y] of pts) {
    if (x < xMin) xMin = x;
    if (x > xMax) xMax = x;
    if (y < yMin) yMin = y;
    if (y > yMax) yMax = y;
  }

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.closePath();
  ctx.clip();

  // Pass 1: Northern Song warm mineral umber-ochre & indigo-soot undertone (`浅绛赭石与花青墨底分染`)
  if (ochreTint > 0) {
    const og = ctx.createLinearGradient(xMin, yMin, xMax, yMax);
    og.addColorStop(0, `rgba(136, 106, 68, ${(ochreTint * 0.88).toFixed(3)})`);
    og.addColorStop(0.55, `rgba(98, 78, 52, ${ochreTint.toFixed(3)})`);
    og.addColorStop(1, `rgba(58, 52, 44, ${(ochreTint * 0.82).toFixed(3)})`);
    ctx.fillStyle = og;
    ctx.fillRect(xMin - 8, yMin - 8, xMax - xMin + 16, yMax - yMin + 16);
  }

  // Three-face granite volumetric wash (`石分三面：迎光留绢亮面、侧背积墨沉厚`)
  const sg = ctx.createLinearGradient(
    lightDir < 0 ? xMin : xMax,
    yMin,
    lightDir < 0 ? xMax : xMin,
    yMax
  );
  sg.addColorStop(0, 'rgba(244, 233, 208, 0.16)');
  sg.addColorStop(0.34, `rgba(68, 61, 50, ${(0.15 * darkBias).toFixed(3)})`);
  sg.addColorStop(0.76, `rgba(28, 25, 21, ${(0.38 * darkBias).toFixed(3)})`);
  sg.addColorStop(1, `rgba(15, 14, 12, ${(0.52 * darkBias).toFixed(3)})`);
  ctx.fillStyle = sg;
  ctx.fillRect(xMin - 8, yMin - 8, xMax - xMin + 16, yMax - yMin + 16);

  // Heavy summit/ridge ink accumulation (`山顶积墨笼染`)
  const tg = ctx.createLinearGradient(0, yMin, 0, yMin + (yMax - yMin) * 0.46);
  tg.addColorStop(0, `rgba(18, 16, 13, ${(0.40 * darkBias).toFixed(3)})`);
  tg.addColorStop(0.65, `rgba(32, 29, 24, ${(0.16 * darkBias).toFixed(3)})`);
  tg.addColorStop(1, 'rgba(22, 20, 17, 0.0)');
  ctx.fillStyle = tg;
  ctx.fillRect(xMin - 8, yMin - 8, xMax - xMin + 16, (yMax - yMin) * 0.5 + 16);

  // Geological Strata Vector Field (`岩层节理场`): groups cun into organic vertical rock columns & ledges!
  const spanW = Math.max(1, xMax - xMin);
  const spanH = Math.max(1, yMax - yMin);
  const phaseA = rng() * Math.PI * 2;
  const phaseB = rng() * Math.PI * 2;

  const [minL, maxL] = cunLength;
  const [minW, maxW] = cunWidth;

  // Passes 2–4: Multi-tone clustered teardrop `雨点皴 / 豆瓣皴`
  for (let i = 0; i < count; i++) {
    let v = rng();
    if (topDense) v = Math.pow(v, 1.32);

    // Cluster horizontally along vertical granite cleavage ribs so sunlit rock ribs breathe between dark fissures!
    let uH = rng();
    const ribWave = Math.sin(uH * Math.PI * 7.5 + phaseA + v * 1.4);
    if (ribWave < -0.52 && rng() < 0.58) {
      uH = clamp(uH + 0.045, 0, 1);
    }

    const px = xMin + uH * spanW;
    const py = yMin + v * spanH;

    let mistFade = 1.0;
    if (mistFadeRange) {
      mistFade = 1 - smoothstep(mistFadeRange[0], mistFadeRange[1], py);
      if (mistFade <= 0.03) continue;
    }

    const shadeBoost = (lightDir < 0 ? uH * 0.34 : (1 - uH) * 0.34) + Math.max(0, ribWave) * 0.16;
    const strataAngle =
      Math.PI * 0.5 +
      slant +
      0.11 * Math.sin((px - xMin) * 0.035 + phaseB) +
      0.06 * Math.cos((py - yMin) * 0.028 + phaseA) +
      (rng() - 0.5) * 0.12;

    const isAxeFacet = axeCutMix > 0 && rng() < axeCutMix;
    const len = (minL + rng() * (maxL - minL)) * (0.76 + 0.44 * (1 - v)) * (isAxeFacet ? 1.38 : 1.0);
    const wid = (minW + rng() * (maxW - minW)) * (isAxeFacet ? 1.55 : 1.0);
    const curve = (rng() - 0.5) * 0.16;

    const toneRoll = rng() + darkBias * 0.34 + shadeBoost - v * 0.18;
    let rgb = '94, 86, 72'; // 清淡墨
    let alpha = 0.26 + rng() * 0.24;
    if (toneRoll > 0.90) {
      rgb = '15, 14, 12'; // 焦墨醒石棱
      alpha = 0.58 + rng() * 0.32;
    } else if (toneRoll > 0.62) {
      rgb = '32, 29, 24'; // 浓墨密攒
      alpha = 0.46 + rng() * 0.28;
    } else if (toneRoll > 0.34) {
      rgb = '62, 57, 48'; // 重墨分面
      alpha = 0.34 + rng() * 0.26;
    }
    alpha *= mistFade;

    ctx.fillStyle = `rgba(${rgb}, ${alpha.toFixed(3)})`;
    drawRaindropCunDab(
      ctx,
      px,
      py,
      len,
      wid,
      isAxeFacet ? strataAngle + (lightDir < 0 ? 0.26 : -0.26) : strataAngle,
      curve,
      rng
    );
  }

  // Deep vertical & folded-belt granite cleavage crevices (`石罅深缝折带骨线`)
  const numFissures = Math.max(4, Math.round(count / 195));
  for (let c = 0; c < numFissures; c++) {
    let cx = xMin + (0.10 + 0.80 * rng()) * spanW;
    let cy = yMin + rng() * spanH * 0.62;
    const steps = 4 + Math.floor(rng() * 5);
    const fPts = [[cx, cy]];
    for (let s = 0; s < steps; s++) {
      cx += slant * 20 + (rng() - 0.48) * 15;
      cy += 11 + rng() * 19;
      if (mistFadeRange && cy > mistFadeRange[1] - 16) break;
      fPts.push([cx, cy]);
    }
    drawCalligraphicRockOutline(ctx, fPts, rng, {
      baseWidth: 2.6 + rng() * 2.4,
      color: c % 2 === 0 ? INK_SHADES.jiao : INK_SHADES.nong,
      alpha: 0.68,
      dryness: 0.46,
      bristles: 4,
    });
  }

  ctx.restore();
}

/**
 * Paints an angular, three-face Northern Song boulder group (`石分三面：折带皴/小斧劈近景苍岩 + 聚散焦墨苔点`).
 */
function paintOrganicSongBoulder(ctx, rng, coarseCtrlPts, {
  cunCount = 720,
  slant = 0.24,
  darkBias = 0.72,
  cunLength = [3.6, 10.2],
  cunWidth = [1.15, 2.55],
  axeCutMix = 0.32,
  subFacets = [],
  mossClusters = 6,
  baseFill = '#ccb998',
  outlineWidth = 3.3,
} = {}) {
  const craggyPts = subdivideCraggyPath(coarseCtrlPts, rng, 3, 0.20, false);
  fillPoly(ctx, craggyPts, baseFill, 0.98);

  paintRockCunMass(ctx, rng, craggyPts, {
    count: cunCount,
    slant,
    cunLength,
    cunWidth,
    darkBias,
    topDense: true,
    ochreTint: 0.19,
    mistFadeRange: null,
    lightDir: -1,
    axeCutMix,
  });

  // Sunlit top-left granite facet highlight (`石肩留白受光折面`)
  const topFacet = craggyPts.slice(1, Math.min(craggyPts.length - 1, Math.floor(craggyPts.length * 0.45)));
  if (topFacet.length >= 3) {
    drawCalligraphicRockOutline(ctx, topFacet, rng, {
      baseWidth: outlineWidth * 1.15,
      color: 'rgba(242, 231, 205, 0.26)',
      alpha: 0.85,
      dryness: 0.40,
      bristles: 3,
    });
  }

  for (const sf of subFacets) {
    const sfCraggy = subdivideCraggyPath(sf, rng, 2, 0.19, false);
    drawCalligraphicRockOutline(ctx, sfCraggy, rng, {
      baseWidth: outlineWidth * 1.85,
      color: 'rgba(16, 15, 13, 0.46)',
      alpha: 0.82,
      dryness: 0.48,
      bristles: 5,
    });
    drawCalligraphicRockOutline(ctx, sfCraggy, rng, {
      baseWidth: outlineWidth * 0.86,
      color: INK_SHADES.jiao,
      alpha: 0.88,
      dryness: 0.32,
      bristles: 4,
    });
  }

  const visiblePts = craggyPts.filter(([, y]) => y < PANEL_SIZE + 180);
  drawCalligraphicRockOutline(ctx, visiblePts, rng, {
    baseWidth: outlineWidth,
    color: INK_SHADES.jiao,
    alpha: 0.93,
    dryness: 0.30,
    bristles: 5,
  });

  // Organic `攒三聚五` irregular soot-ink moss dabs (NO geometric circles!)
  for (let m = 0; m < mossClusters; m++) {
    const anchorIdx = Math.floor(rng() * Math.max(1, visiblePts.length - 1));
    const [ax, ay] = visiblePts[anchorIdx];
    const dotsInCluster = 5 + Math.floor(rng() * 7);
    for (let d = 0; d < dotsInCluster; d++) {
      const mx = ax + (rng() - 0.5) * 14;
      const my = ay - 1.5 + (rng() - 0.5) * 8;
      const r = 1.1 + rng() * 2.1;
      ctx.fillStyle = d % 3 === 0 ? INK_SHADES.jiao : 'rgba(30, 28, 24, 0.84)';
      drawRaindropCunDab(ctx, mx, my - r, r * 2.1, r * 1.55, Math.PI * 0.5 + (rng() - 0.5) * 0.9, 0.08, rng);
    }
  }
}

/**
 * Paints dense Northern Song summit scrub woods (`山顶寒林攒点灌木丛`) using irregular brush dabs.
 */
function paintSummitScrubWoods(ctx, rng, ridgePts, depth = 42, density = 1600) {
  ctx.save();
  ctx.strokeStyle = 'rgba(18, 16, 13, 0.82)';
  ctx.lineCap = 'round';
  for (let i = 0; i < ridgePts.length - 1; i++) {
    const [x0, y0] = ridgePts[i];
    const [x1, y1] = ridgePts[i + 1];
    const segLen = Math.hypot(x1 - x0, y1 - y0);
    const nTrees = Math.max(1, Math.floor(segLen / 9.5));
    for (let k = 0; k < nTrees; k++) {
      const u = (k + rng() * 0.85) / nTrees;
      const tx = lerp(x0, x1, u);
      const ty = lerp(y0, y1, u) + rng() * 8;
      const h = 8 + rng() * 16;
      ctx.lineWidth = 0.85 + rng() * 1.15;
      ctx.beginPath();
      ctx.moveTo(tx, ty + 4);
      ctx.quadraticCurveTo(tx + (rng() - 0.5) * 5, ty - h * 0.5, tx + (rng() - 0.5) * 9, ty - h);
      ctx.stroke();
      // Crab-claw tiny crown twigs (`蟹爪枝梢`)
      ctx.lineWidth = 0.65;
      ctx.beginPath();
      ctx.moveTo(tx + (rng() - 0.5) * 4, ty - h * 0.72);
      ctx.lineTo(tx - 4 - rng() * 4, ty - h - 2);
      ctx.moveTo(tx + (rng() - 0.5) * 4, ty - h * 0.78);
      ctx.lineTo(tx + 4 + rng() * 4, ty - h - 2);
      ctx.stroke();
    }
  }

  for (let i = 0; i < density; i++) {
    const segIdx = Math.min(ridgePts.length - 2, Math.floor(rng() * (ridgePts.length - 1)));
    const u = rng();
    const bx = lerp(ridgePts[segIdx][0], ridgePts[segIdx + 1][0], u) + (rng() - 0.5) * 22;
    const by =
      lerp(ridgePts[segIdx][1], ridgePts[segIdx + 1][1], u) -
      16 +
      Math.pow(rng(), 0.86) * depth;

    const r = 1.2 + rng() * 2.9;
    const shade = rng();
    if (shade > 0.64) {
      ctx.fillStyle = `rgba(15, 14, 12, ${(0.74 + rng() * 0.24).toFixed(2)})`;
    } else if (shade > 0.32) {
      ctx.fillStyle = `rgba(36, 33, 28, ${(0.56 + rng() * 0.28).toFixed(2)})`;
    } else {
      ctx.fillStyle = `rgba(72, 68, 58, ${(0.40 + rng() * 0.24).toFixed(2)})`;
    }
    drawRaindropCunDab(ctx, bx, by - r, r * 2.3, r * 1.5, (rng() - 0.5) * 1.8, 0.12, rng);
  }
  ctx.restore();
}

/**
 * Draws an ancient twisted Northern Song pine (`虬曲古松 · 郭熙蟹爪枝 + 攒针松叶`),
 * optionally concealing Fan Kuan's famous tiny vertical signature (`臣寬製`) among the trunk & foliage!
 */
function paintAncientSongPine(ctx, rng, baseX, baseY, dir = 1, scale = 1.0, hideSignature = false) {
  ctx.save();
  ctx.translate(baseX, baseY);
  ctx.scale(scale, scale);

  const trunkPts = subdivideCraggyPath(
    [
      [0, 0],
      [dir * 14, -30],
      [dir * 4, -68],
      [dir * 28, -104],
      [dir * 58, -126],
      [dir * 88, -132],
    ],
    rng,
    2,
    0.13
  );

  // Warm Song umber bark core
  ctx.strokeStyle = '#4b3826';
  ctx.lineWidth = 11.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(trunkPts[0][0], trunkPts[0][1]);
  for (let i = 1; i < trunkPts.length; i++) ctx.lineTo(trunkPts[i][0], trunkPts[i][1]);
  ctx.stroke();

  drawCalligraphicRockOutline(ctx, trunkPts, rng, {
    baseWidth: 11.5,
    color: INK_SHADES.jiao,
    alpha: 0.90,
    dryness: 0.36,
    bristles: 6,
  });

  // Irregular pine bark dragon-scales (`松鳞纹` — organic polygons, zero `ctx.arc`!)
  ctx.strokeStyle = 'rgba(15, 14, 12, 0.72)';
  ctx.lineWidth = 0.85;
  for (let i = 1; i < trunkPts.length - 1; i++) {
    const [sx, sy] = trunkPts[i];
    for (let k = 0; k < 2; k++) {
      const ox = sx + (rng() - 0.5) * 5;
      const oy = sy + (rng() - 0.5) * 6;
      ctx.beginPath();
      ctx.moveTo(ox - 2.6, oy - 1.2);
      ctx.quadraticCurveTo(ox + 1.8, oy - 3.0, ox + 2.8, oy + 0.8);
      ctx.quadraticCurveTo(ox - 0.5, oy + 2.8, ox - 2.6, oy - 1.2);
      ctx.stroke();
    }
  }

  const branches = [
    subdivideCraggyPath([[dir * 11, -50], [dir * 44, -58], [dir * 68, -44]], rng, 2, 0.16),
    subdivideCraggyPath([[dir * 16, -84], [-dir * 18, -98], [-dir * 38, -89]], rng, 2, 0.16),
    subdivideCraggyPath([[dir * 40, -114], [dir * 76, -144], [dir * 106, -136]], rng, 2, 0.16),
    subdivideCraggyPath([[dir * 62, -126], [dir * 100, -116], [dir * 128, -105]], rng, 2, 0.16),
  ];
  for (const br of branches) {
    drawCalligraphicRockOutline(ctx, br, rng, {
      baseWidth: 4.3,
      color: INK_SHADES.jiao,
      alpha: 0.90,
      dryness: 0.30,
      bristles: 4,
    });
  }

  const canopyCenters = [
    [dir * 64, -48],
    [dir * 44, -62],
    [-dir * 34, -94],
    [-dir * 12, -104],
    [dir * 52, -136],
    [dir * 78, -145],
    [dir * 104, -138],
    [dir * 94, -122],
    [dir * 122, -109],
  ];
  for (const [cx, cy] of canopyCenters) {
    // Organic indigo-green pine aura (`松烟花青汁绿淡晕`)
    ctx.fillStyle = 'rgba(54, 68, 56, 0.24)';
    drawRaindropCunDab(ctx, cx - 18, cy - 4, 36, 18, 0.04, 0.05, rng);

    for (let f = 0; f < 5; f++) {
      const fx = cx + (rng() - 0.5) * 18;
      const fy = cy + (rng() - 0.5) * 9;
      const spokes = 14;
      ctx.strokeStyle = f % 2 === 0 ? INK_SHADES.jiao : INK_SHADES.nong;
      ctx.lineWidth = 0.78;
      for (let k = 0; k < spokes; k++) {
        const ang = -Math.PI * 0.97 + (k / (spokes - 1)) * Math.PI * 0.94;
        const r = 8.2 + rng() * 4.8;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + Math.cos(ang) * r, fy + Math.sin(ang) * r);
        ctx.stroke();
      }
    }
  }

  // Homage to Fan Kuan's hidden signature (`树叶间暗藏“臣寬製”小楷款`, discovered in 1958 at Taipei Palace Museum!)
  if (hideSignature) {
    ctx.save();
    ctx.translate(dir * 34, -44);
    ctx.fillStyle = 'rgba(24, 21, 17, 0.48)';
    ctx.font = '600 6.5px "PelicanWenKai", "PelicanSerif", serif';
    ctx.textAlign = 'center';
    ctx.fillText('臣', 0, 0);
    ctx.fillText('寬', 0.4, 7.2);
    ctx.fillText('製', -0.2, 14.4);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws a hidden Northern Song mountain monastery (`深山藏古寺`) with curved Song bracketed eaves.
 */
function paintHiddenMonastery(ctx, x, y, rng) {
  ctx.save();
  ctx.translate(x, y);

  // Main timber hall (`歇山飞檐殿宇`)
  const roofPts = [
    [-33, 5],
    [-17, 1],
    [-10, -9],
    [10, -9],
    [17, 1],
    [33, 5],
    [16, 7],
    [-16, 7],
  ];
  fillPoly(ctx, roofPts, '#3b3730', 0.92);
  drawCalligraphicRockOutline(ctx, roofPts, rng, {
    baseWidth: 1.4,
    color: INK_SHADES.jiao,
    alpha: 0.88,
    dryness: 0.25,
    bristles: 3,
  });

  // Owl-tail ridge finials (`鸱吻`) & tile courses
  ctx.strokeStyle = INK_SHADES.jiao;
  ctx.lineWidth = 1.05;
  ctx.beginPath();
  ctx.moveTo(-10, -9);
  ctx.quadraticCurveTo(-13, -12, -11, -14);
  ctx.moveTo(10, -9);
  ctx.quadraticCurveTo(13, -12, 11, -14);
  for (let rx = -22; rx <= 22; rx += 5.5) {
    ctx.moveTo(rx * 0.42, -8);
    ctx.lineTo(rx, 5.5);
  }
  ctx.stroke();

  // Muted cinnabar pillars & lattice sanctuary half-veiled by mist
  ctx.strokeStyle = 'rgba(126, 56, 42, 0.58)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (const px of [-15, -5, 5, 15]) {
    ctx.moveTo(px, 6);
    ctx.lineTo(px, 19);
  }
  ctx.stroke();

  // Distant pagoda spire rising faintly behind pines (`古刹浮屠尖`)
  ctx.strokeStyle = 'rgba(32, 29, 24, 0.68)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(38, -2);
  ctx.lineTo(38, -24);
  for (const py of [-6, -12, -17]) {
    ctx.moveTo(32, py);
    ctx.quadraticCurveTo(38, py - 2.5, 44, py);
  }
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws an antique weathered Song/Imperial collector cinnabar seal (`残破剥蚀朱白文鉴藏印`)
 * with irregular chipped stone borders and silk-weave voids — zero `strokeRect`!
 */
function paintCollectorSeal(ctx, cx, cy, w, h, rng, chars = ['溪', '山', '清', '遠'], isIntaglio = false) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rng() - 0.5) * 0.03);

  const hw = w * 0.5;
  const hh = h * 0.5;
  const rimPts = subdivideCraggyPath(
    [
      [-hw, -hh],
      [hw, -hh],
      [hw, hh],
      [-hw, hh],
    ],
    rng,
    2,
    0.07,
    true
  );

  if (isIntaglio) {
    // White-intaglio imperial seal (`白文印`) with silk pores showing through cinnabar paste
    fillPoly(ctx, rimPts, 'rgba(154, 38, 26, 0.68)', 1.0);
    ctx.fillStyle = 'rgba(204, 184, 148, 0.82)';
  } else {
    // Relief vermilion seal (`朱文印`)
    fillPoly(ctx, rimPts, 'rgba(158, 40, 28, 0.10)', 1.0);
    drawCalligraphicRockOutline(ctx, [...rimPts, rimPts[0]], rng, {
      baseWidth: 1.7,
      color: 'rgba(156, 38, 26, 0.72)',
      alpha: 0.85,
      dryness: 0.42,
      bristles: 3,
    });
    ctx.fillStyle = 'rgba(156, 38, 26, 0.72)';
  }

  ctx.font = `600 ${Math.round(Math.min(w, h) * 0.36)}px "PelicanWenKai", "PelicanSerif", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (chars.length === 4) {
    ctx.fillText(chars[0], hw * 0.44, -hh * 0.44);
    ctx.fillText(chars[1], hw * 0.44, hh * 0.44);
    ctx.fillText(chars[2], -hw * 0.44, -hh * 0.44);
    ctx.fillText(chars[3], -hw * 0.44, hh * 0.44);
  } else if (chars.length === 2) {
    ctx.fillText(chars[0], 0, -hh * 0.42);
    ctx.fillText(chars[1], 0, hh * 0.42);
  }

  // Silk-weave erosion specks knocking tiny gaps through aged cinnabar
  ctx.fillStyle = 'rgba(196, 174, 138, 0.58)';
  for (let i = 0; i < 16; i++) {
    const ex = (rng() - 0.5) * w * 0.92;
    const ey = (rng() - 0.5) * h * 0.92;
    ctx.fillRect(ex, ey, 1.2 + rng() * 1.6, 0.9 + rng() * 1.2);
  }

  ctx.restore();
}

/**
 * Paints Emperor Huizong's archaic `瘦金体` silk mounting title slip (`宣和装瘦金题签：北宋范寬溪山行旅`,
 * strictly pure classical Chinese characters, zero Arabic numerals or English!).
 */
function paintSlenderGoldMountingSlip(ctx, rng) {
  ctx.save();
  const sx = 948;
  const sy = 28;
  const sw = 26;
  const sh = 148;

  const slipPts = subdivideCraggyPath(
    [
      [sx, sy],
      [sx + sw, sy + 0.5],
      [sx + sw - 0.4, sy + sh],
      [sx + 0.3, sy + sh - 0.5],
    ],
    rng,
    2,
    0.03,
    true
  );
  fillPoly(ctx, slipPts, 'rgba(225, 208, 172, 0.84)', 1.0);
  drawCalligraphicRockOutline(ctx, [...slipPts, slipPts[0]], rng, {
    baseWidth: 1.0,
    color: 'rgba(88, 68, 44, 0.62)',
    alpha: 0.8,
    dryness: 0.35,
    bristles: 2,
  });

  ctx.fillStyle = 'rgba(24, 20, 16, 0.84)';
  ctx.font = '600 13px "PelicanWenKai", "PelicanSerif", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const titleChars = ['宋', '范', '寬', '溪', '山', '行', '旅'];
  for (let i = 0; i < titleChars.length; i++) {
    ctx.fillText(titleChars[i], sx + sw * 0.5, sy + 16 + i * 17.5);
  }

  // Tiny imperial half-seal (`双龙小玺`) straddling bottom of label slip
  paintCollectorSeal(ctx, sx + sw * 0.5, sy + sh + 6, 20, 20, rng, ['宣', '和'], false);
  ctx.restore();
}

/**
 * Bakes the aged Northern Song silk substrate, `p5.brush` Kubelka-Munk washes, towering central monolith,
 * and three-tiered rocky ravine waterfall (`s05_song_upper_r3`, 1000x1000).
 */
function getBakedUpperSongScroll(kit) {
  return kit.bake2D('s05_song_upper_r3', (_g, ctx, rng) => {
    // -------------------------------------------------------------------------
    // 1. Deep Taipei Palace Museum Tea-Umber Double-Thread Aged Silk (`千年双丝熟绢包浆`)
    // -------------------------------------------------------------------------
    const silkGrad = ctx.createLinearGradient(0, 0, PANEL_SIZE, PANEL_SIZE);
    silkGrad.addColorStop(0, '#d5c3a0');
    silkGrad.addColorStop(0.48, '#c6b18b');
    silkGrad.addColorStop(1, '#b49e77');
    ctx.fillStyle = silkGrad;
    ctx.fillRect(0, 0, PANEL_SIZE, PANEL_SIZE);

    // WebGL2 `p5.brush` Spectral Kubelka-Munk Ink & Mist Underpainting (`bakeBrush -> fb.get().canvas`)
    if (kit && kit.brush && typeof kit.bakeBrush === 'function') {
      const brushFb = kit.bakeBrush('s05_song_brush_r3', (p, brush, bRng) => {
        p.background(202, 181, 143);
        ensureSongCustomBrushes(brush, kit.makePRNG);
        brush.noField();
        brush.noHatch();
        brush.noStroke();

        // (A) Distant atmospheric misty mountain peaks (`远山烟岚无皴湿染`, left & right)
        brush.fill('#5e5b50', 116);
        brush.fillBleed(0.32, 'out');
        brush.fillTexture(0.84, 0.62);
        brush.polygon([
          [-15, 326], [38, 276], [94, 246], [154, 278], [212, 344], [238, 515], [-15, 515],
        ]);

        brush.fill('#58554b', 122);
        brush.fillBleed(0.32, 'out');
        brush.fillTexture(0.84, 0.62);
        brush.polygon([
          [772, 418], [828, 294], [882, 236], [936, 216], [982, 256], [1015, 278], [1015, 525], [772, 525],
        ]);

        // (B) Deep `宿墨/积墨` dark moisture core inside central monolith & waterfall chasm
        brush.fill('#25221d', 155);
        brush.fillBleed(0.28, 'out');
        brush.fillTexture(0.88, 0.72);
        brush.polygon([
          [358, 106], [462, 44], [552, 35], [622, 54], [656, 108],
          [652, 275], [512, 245], [352, 265],
        ]);

        brush.fill('#161411', 188);
        brush.fillBleed(0.22, 'out');
        brush.polygon([
          [632, 138], [692, 148], [696, 565], [626, 565],
        ]);

        // (C) Luminous Kubelka-Munk waist-mist & waterfall plunge-pool rising vapor (`山腰云气与潭口湿晕水雾`)
        brush.fill('#ece0c6', 176);
        brush.fillBleed(0.38, 'out');
        brush.fillTexture(0.76, 0.48);
        brush.polygon([
          [-20, 542], [240, 528], [495, 545], [745, 522], [1020, 548],
          [1020, 646], [710, 636], [460, 622], [210, 638], [-20, 642],
        ]);

        brush.fill('#f5ebd4', 188);
        brush.fillBleed(0.40, 'out');
        brush.polygon([
          [608, 508], [668, 476], [728, 514], [748, 588], [588, 594],
        ]);

        // (D) Dry calligraphic `s05_zhedai_cefeng` vertical granite energy strokes on peak
        brush.noFill();
        brush.set('s05_zhedai_cefeng', '#1d1b17', 0.95);
        for (let k = 0; k < 14; k++) {
          const sx = 345 + bRng() * 290;
          const sy = 68 + bRng() * 190;
          brush.spline([
            [sx, sy, 0.85],
            [sx + (bRng() - 0.5) * 14, sy + 85, 0.95],
            [sx + (bRng() - 0.5) * 18, sy + 175, 0.45],
          ], 0.25);
        }
      });
      ctx.save();
      ctx.globalAlpha = 0.84;
      copyBrushFbTo2D(brushFb, ctx);
      ctx.restore();
    } else {
      // Headless fallback distant peaks
      const farL = subdivideCraggyPath([[0, 322], [44, 274], [96, 248], [154, 280], [214, 348], [238, 520], [0, 520]], rng, 3, 0.14);
      fillPoly(ctx, farL, 'rgba(88, 84, 74, 0.34)');
      const farR = subdivideCraggyPath([[775, 420], [832, 292], [882, 238], [936, 218], [1000, 276], [1000, 525], [775, 525]], rng, 3, 0.14);
      fillPoly(ctx, farR, 'rgba(84, 80, 70, 0.36)');
    }

    // Authentic 2px Northern Song Double-Thread Silk Weave (`双丝熟绢经纬织纹`)
    ctx.save();
    for (let y = 0; y < PANEL_SIZE; y += 2) {
      ctx.fillStyle = y % 4 === 0 ? 'rgba(86, 68, 44, 0.036)' : 'rgba(248, 238, 214, 0.028)';
      ctx.fillRect(0, y, PANEL_SIZE, 0.9);
    }
    for (let x = 0; x < PANEL_SIZE; x += 3) {
      ctx.fillStyle = x % 6 === 0 ? 'rgba(92, 74, 48, 0.030)' : 'rgba(245, 234, 208, 0.022)';
      ctx.fillRect(x, 0, 0.85, PANEL_SIZE);
    }
    // Mottled century tea-stain & mildew patina patches (`千年古绢水渍包浆`)
    for (let i = 0; i < 120; i++) {
      const mx = rng() * PANEL_SIZE;
      const my = rng() * 620;
      const mr = 8 + rng() * 34;
      ctx.fillStyle = rng() > 0.45 ? 'rgba(104, 82, 52, 0.032)' : 'rgba(238, 224, 194, 0.035)';
      drawRaindropCunDab(ctx, mx - mr, my, mr * 2, mr * 0.9, rng() * Math.PI, 0.05, rng);
    }
    ctx.restore();

    // -------------------------------------------------------------------------
    // 2. Asymmetric Square-Shouldered Fan Kuan Central Monolith (`雄浑巨碑主峰 · 万点水滴雨点皴`)
    // -------------------------------------------------------------------------
    // Deep waterfall gorge shadow (`飞瀑幽谷深壑`)
    const chasmPts = subdivideCraggyPath(
      [[626, 136], [696, 146], [702, 580], [622, 580]],
      rng,
      2,
      0.12,
      true
    );
    const chasmGrad = ctx.createLinearGradient(632, 142, 694, 575);
    chasmGrad.addColorStop(0, 'rgba(13, 12, 10, 0.95)');
    chasmGrad.addColorStop(0.75, 'rgba(20, 18, 15, 0.88)');
    chasmGrad.addColorStop(1, 'rgba(42, 38, 32, 0.0)');
    fillPoly(ctx, chasmPts, chasmGrad);

    // Left Escarpment (`左侧层叠断崖`)
    const leftEscarpment = subdivideCraggyPath(
      [
        [152, 592], [174, 432], [198, 296], [224, 230],
        [268, 216], [296, 160], [346, 152], [374, 264], [366, 592],
      ],
      rng,
      3,
      0.16
    );
    fillPoly(ctx, leftEscarpment, '#c5b493', 0.96);
    paintRockCunMass(ctx, rng, leftEscarpment, {
      count: 2350,
      slant: 0.05,
      darkBias: 0.74,
      ochreTint: 0.17,
      mistFadeRange: [495, 598],
      lightDir: -1,
    });

    // Sheer Right Precipice Beyond Waterfall Gorge (`右侧危崖峭壁`)
    const rightPrecipice = subdivideCraggyPath(
      [
        [670, 590], [672, 368], [668, 246], [678, 154],
        [714, 112], [758, 124], [788, 186], [820, 294], [854, 476], [862, 590],
      ],
      rng,
      3,
      0.16
    );
    fillPoly(ctx, rightPrecipice, '#bfae8d', 0.96);
    paintRockCunMass(ctx, rng, rightPrecipice, {
      count: 2200,
      slant: -0.05,
      darkBias: 0.82,
      ochreTint: 0.16,
      mistFadeRange: [492, 595],
      lightDir: 1,
    });

    // Main Towering Square-Shouldered Summit Monolith (`主峰危立方硬巨嶂`)
    const mainSummit = subdivideCraggyPath(
      [
        [312, 594], [326, 392], [340, 210], [356, 106],
        [398, 76], [432, 80], [462, 42], [548, 32],
        [618, 50], [652, 96], [656, 214], [650, 392], [648, 594],
      ],
      rng,
      3,
      0.14
    );
    fillPoly(ctx, mainSummit, '#cbb998', 0.97);
    paintRockCunMass(ctx, rng, mainSummit, {
      count: 5600,
      slant: 0.02,
      darkBias: 0.68,
      ochreTint: 0.18,
      mistFadeRange: [498, 602],
      lightDir: -1,
    });

    // Interlocking Lower Cliff Buttresses (`主峰前抱叠嶂危岩`)
    const leftButtress = subdivideCraggyPath(
      [[266, 594], [286, 432], [312, 324], [362, 286], [418, 302], [446, 390], [454, 594]],
      rng,
      3,
      0.16
    );
    fillPoly(ctx, leftButtress, '#cebc9c', 0.95);
    paintRockCunMass(ctx, rng, leftButtress, {
      count: 1750,
      slant: 0.06,
      darkBias: 0.64,
      ochreTint: 0.17,
      mistFadeRange: [498, 602],
      lightDir: -1,
    });

    const rightButtress = subdivideCraggyPath(
      [[422, 598], [448, 386], [486, 256], [548, 234], [598, 264], [632, 356], [640, 598]],
      rng,
      3,
      0.16
    );
    fillPoly(ctx, rightButtress, '#d1bfa0', 0.95);
    paintRockCunMass(ctx, rng, rightButtress, {
      count: 2050,
      slant: -0.04,
      darkBias: 0.60,
      ochreTint: 0.17,
      mistFadeRange: [498, 602],
      lightDir: -1,
    });

    // Calligraphic cliff contours (`折带铁骨山石廓线`)
    for (const [poly, bw, al] of [
      [leftEscarpment, 3.3, 0.88],
      [mainSummit, 3.8, 0.92],
      [rightPrecipice, 3.3, 0.88],
      [leftButtress, 2.9, 0.82],
      [rightButtress, 3.0, 0.84],
    ]) {
      drawCalligraphicRockOutline(
        ctx,
        poly.filter(([, y]) => y < 520),
        rng,
        { baseWidth: bw, alpha: al, dryness: 0.34, bristles: 5 }
      );
    }

    // Summit Scrub Forests (`山顶密林攒点`)
    paintSummitScrubWoods(ctx, rng, [[356, 106], [398, 76], [432, 80], [462, 42], [548, 32], [618, 50], [650, 94]], 48, 2350);
    paintSummitScrubWoods(ctx, rng, [[224, 230], [268, 216], [296, 160], [346, 152]], 34, 680);
    paintSummitScrubWoods(ctx, rng, [[680, 152], [714, 112], [758, 124], [786, 184]], 36, 640);
    paintSummitScrubWoods(ctx, rng, [[486, 256], [548, 234], [596, 262]], 28, 560);
    paintSummitScrubWoods(ctx, rng, [[312, 324], [362, 286], [414, 300]], 24, 420);

    // -------------------------------------------------------------------------
    // 3. Three-Tiered Zigzagging Rocky Ravine Cascade (`三叠折落深谷岩缝泉道` — #85 Note #1!)
    // Completely replaces the straight vertical white tape with 3 stepped rock-bound falls!
    // -------------------------------------------------------------------------
    ctx.save();
    const drawCascadeTier = (leftEdge, rightEdge, yTop, yBot, topAlpha = 0.94, botAlpha = 0.82) => {
      const wg = ctx.createLinearGradient(0, yTop, 0, yBot);
      wg.addColorStop(0, `rgba(248, 241, 224, ${topAlpha})`);
      wg.addColorStop(0.75, `rgba(242, 233, 212, ${botAlpha})`);
      wg.addColorStop(1, `rgba(234, 223, 198, ${botAlpha * 0.45})`);
      const tierPoly = [...leftEdge, ...rightEdge.slice().reverse()];
      fillPoly(ctx, tierPoly, wg, 1.0);

      // Fine rock-split water threads (`岩缝水脉丝缕`)
      ctx.strokeStyle = 'rgba(52, 47, 39, 0.38)';
      ctx.lineWidth = 0.72;
      for (let s = 1; s <= 3; s++) {
        const u = s / 4;
        ctx.beginPath();
        for (let k = 0; k < leftEdge.length; k++) {
          const lx = lerp(leftEdge[k][0], rightEdge[Math.min(rightEdge.length - 1, k)][0], u) + (rng() - 0.5) * 1.4;
          const ly = lerp(leftEdge[k][1], rightEdge[Math.min(rightEdge.length - 1, k)][1], u);
          if (k === 0) ctx.moveTo(lx, ly);
          else ctx.lineTo(lx, ly);
        }
        ctx.stroke();
      }
    };

    // Tier 1 (Upper Cliff Slot: x≈655..664 -> steps left onto shelf at y=258)
    drawCascadeTier(
      [[655, 148], [653, 186], [649, 224], [646, 260]],
      [[663, 151], [662, 188], [659, 226], [657, 262]],
      148,
      262,
      0.94,
      0.88
    );

    // Craggy dark overhanging step-ledge #1 (`第一叠犬牙危岩横截水脉`, y=248..282)
    const stepLedge1 = subdivideCraggyPath(
      [[636, 248], [656, 255], [668, 268], [655, 282], [634, 276]],
      rng,
      2,
      0.24,
      true
    );
    fillPoly(ctx, stepLedge1, '#1a1815', 0.94);

    // Tier 2 (Mid Gorge Offset Fall: spills around ledge to x≈661..673, y=268..404)
    drawCascadeTier(
      [[656, 266], [662, 304], [660, 352], [655, 404]],
      [[664, 268], [673, 306], [672, 354], [668, 406]],
      266,
      406,
      0.92,
      0.85
    );

    // Interlocking right & left cliff jaws (`第二叠两侧犬牙交错危崖半掩飞泉`, y=378..432)
    const rightJaw = subdivideCraggyPath(
      [[686, 376], [665, 392], [659, 408], [672, 424], [688, 434]],
      rng,
      2,
      0.24,
      true
    );
    fillPoly(ctx, rightJaw, '#151411', 0.95);

    // Tier 3 (Lower Split Plunge into Vapor Pool: x≈646..668, y=408..556, branching over boulder!)
    drawCascadeTier(
      [[648, 408], [644, 452], [647, 502], [650, 556]],
      [[658, 410], [656, 454], [661, 504], [666, 558]],
      408,
      558,
      0.88,
      0.25
    );
    // Secondary thin silver cascade thread on right side of boulder
    drawCascadeTier(
      [[666, 422], [670, 468], [672, 536]],
      [[670, 423], [675, 470], [678, 538]],
      422,
      538,
      0.78,
      0.15
    );

    // Mid-plunge dividing rock tooth (`潭口分水危石`)
    const splitTooth = subdivideCraggyPath(
      [[657, 454], [667, 448], [671, 488], [660, 496]],
      rng,
      2,
      0.22,
      true
    );
    fillPoly(ctx, splitTooth, '#1d1a16', 0.92);

    // Organic wet-bleed plunge spray merging seamlessly into waist clouds (`潭口腾起湿晕水雾融进腰云`)
    for (const [mx, my, mw, mh, al] of [
      [658, 534, 78, 34, 0.56],
      [664, 566, 136, 44, 0.72],
      [632, 584, 185, 48, 0.68],
    ]) {
      const mistPoly = subdivideCraggyPath(
        [
          [mx - mw * 0.5, my + 4],
          [mx - mw * 0.22, my - mh * 0.52],
          [mx + mw * 0.24, my - mh * 0.48],
          [mx + mw * 0.52, my + 2],
          [mx + mw * 0.20, my + mh * 0.48],
          [mx - mw * 0.25, my + mh * 0.44],
        ],
        rng,
        3,
        0.22,
        true
      );
      const mg = ctx.createLinearGradient(mx, my - mh * 0.55, mx, my + mh * 0.55);
      mg.addColorStop(0, 'rgba(229, 216, 188, 0.0)');
      mg.addColorStop(0.45, `rgba(238, 227, 202, ${al})`);
      mg.addColorStop(0.75, `rgba(229, 216, 188, ${(al * 0.58).toFixed(3)})`);
      mg.addColorStop(1, 'rgba(222, 208, 178, 0.0)');
      fillPoly(ctx, mistPoly, mg, 1.0);
    }
    ctx.restore();

    // -------------------------------------------------------------------------
    // 4. Sweeping Mid-Slope Silk Mist (`山腰氤氲留白云气`) & Hidden Monastery (`深山藏古寺`)
    // -------------------------------------------------------------------------
    const mistBand = ctx.createLinearGradient(0, 476, 0, 668);
    mistBand.addColorStop(0, 'rgba(218, 203, 173, 0.0)');
    mistBand.addColorStop(0.38, 'rgba(227, 214, 186, 0.72)');
    mistBand.addColorStop(0.62, 'rgba(232, 220, 194, 0.88)');
    mistBand.addColorStop(0.86, 'rgba(220, 206, 178, 0.54)');
    mistBand.addColorStop(1, 'rgba(212, 196, 166, 0.0)');
    ctx.fillStyle = mistBand;
    ctx.fillRect(0, 476, PANEL_SIZE, 192);

    paintSummitScrubWoods(ctx, rng, [[706, 522], [758, 510], [810, 524]], 28, 320);
    paintHiddenMonastery(ctx, 756, 503, rng);

    // Veil lower monastery base in soft horizontal Song silk mist ribbon
    const templeMistPoly = subdivideCraggyPath(
      [[672, 526], [718, 506], [798, 508], [842, 528], [802, 550], [712, 548]],
      rng,
      2,
      0.16,
      true
    );
    const templeMist = ctx.createLinearGradient(758, 504, 758, 552);
    templeMist.addColorStop(0, 'rgba(230, 218, 192, 0.0)');
    templeMist.addColorStop(0.5, 'rgba(230, 218, 192, 0.78)');
    templeMist.addColorStop(1, 'rgba(230, 218, 192, 0.0)');
    fillPoly(ctx, templeMistPoly, templeMist, 1.0);

    // -------------------------------------------------------------------------
    // 5. Emperor Huizong Slender-Gold Mounting Slip & Aged Silk Scroll Creases (`断绢横折痕`)
    // -------------------------------------------------------------------------
    paintSlenderGoldMountingSlip(ctx, rng);

    for (const cy of [168, 384, 612, 846]) {
      ctx.save();
      ctx.strokeStyle = 'rgba(246, 236, 212, 0.16)';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      for (let x = 0; x <= PANEL_SIZE; x += 24) {
        const jy = cy + Math.sin(x * 0.018 + cy) * 0.9 + (rng() - 0.5) * 0.7;
        if (x === 0) ctx.moveTo(x, jy);
        else ctx.lineTo(x, jy);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(72, 54, 34, 0.15)';
      ctx.lineWidth = 0.65;
      ctx.beginPath();
      for (let x = 0; x <= PANEL_SIZE; x += 24) {
        if (rng() < 0.18) continue;
        const jy = cy + 1.0 + Math.sin(x * 0.018 + cy) * 0.9;
        if (x === 0) ctx.moveTo(x, jy);
        else ctx.lineTo(x, jy);
      }
      ctx.stroke();
      ctx.restore();
    }
  });
}

/**
 * Bakes the entire Lower Mountain Valley (`y = 440..1000`) at **2x Supersampling (`2000x1120`)**
 * (`s05_song_valley_2x_r3` — #85 Note #2!) so the `2.95x` zoom at `31.80s` has razor-sharp
 * brush tips, overhanging cliff stone foundations, diagonal timber trestle struts (zero tan void or comb sticks!),
 * angular 3-face stream boulders, and hidden `臣寬製` pine signature!
 */
const VALLEY_Y0 = 440;
const VALLEY_H = PANEL_SIZE - VALLEY_Y0; // 560 world units -> baked at 2000 x 1120 px!

function getBakedValley2x(kit) {
  return kit.bake2D(
    's05_song_valley_2x_r3',
    (_g, ctx, rng) => {
      ctx.save();
      ctx.scale(2, 2);
      ctx.translate(0, -VALLEY_Y0);

      // -----------------------------------------------------------------------
      // 1. Mid-Valley Sunlit Granite Slope Behind the Trail (`山脚受光坡陀石壁`, y=624..772)
      // Calibrated warm silk luminosity behind y=690..755 so 0.18x pelican & bamboo hat pop cleanly!
      // -----------------------------------------------------------------------
      const valleyHillside = subdivideCraggyPath(
        [
          [198, 760], [262, 680], [342, 646], [435, 632],
          [530, 624], [618, 640], [708, 666], [788, 716],
          [788, 780], [198, 780],
        ],
        rng,
        3,
        0.15
      );
      fillPoly(ctx, valleyHillside, '#d5c4a3', 0.97);
      paintRockCunMass(ctx, rng, valleyHillside, {
        count: 1650,
        slant: 0.18,
        cunLength: [2.2, 6.2],
        cunWidth: [0.68, 1.45],
        darkBias: 0.36,
        topDense: true,
        ochreTint: 0.14,
        mistFadeRange: null,
        lightDir: -1,
        axeCutMix: 0.22,
      });

      // Internal `折带皴` rock ledges on mid-valley slope (keeping y=708..748 clean behind travelers!)
      for (const ridge of [
        [[252, 694], [336, 658], [428, 644], [528, 638], [625, 652], [712, 678]],
        [[362, 684], [454, 662], [548, 658], [642, 678]],
      ]) {
        const cr = subdivideCraggyPath(ridge, rng, 2, 0.16);
        drawCalligraphicRockOutline(ctx, cr, rng, {
          baseWidth: 1.9,
          color: INK_SHADES.zhong,
          alpha: 0.68,
          dryness: 0.42,
          bristles: 4,
        });
      }

      // -----------------------------------------------------------------------
      // 2. Left & Right Promontory Crags + Ancient Twisted Song Pines (`左右苍岩古松 + 臣寬製藏款`)
      // -----------------------------------------------------------------------
      paintOrganicSongBoulder(
        ctx,
        rng,
        [
          [0, 680], [0, 562], [58, 538], [128, 552],
          [188, 590], [238, 646], [272, 706], [196, 722], [88, 694],
        ],
        {
          cunCount: 1250,
          slant: 0.22,
          cunLength: [2.6, 7.6],
          cunWidth: [0.85, 1.85],
          darkBias: 0.70,
          subFacets: [[[22, 620], [88, 592], [158, 614], [208, 670]]],
          mossClusters: 9,
          outlineWidth: 2.8,
        }
      );
      paintAncientSongPine(ctx, rng, 118, 576, 1, 0.96, false);
      paintAncientSongPine(ctx, rng, 56, 596, 1, 0.68, false);

      paintOrganicSongBoulder(
        ctx,
        rng,
        [
          [728, 710], [772, 634], [832, 580], [898, 552],
          [958, 554], [1000, 576], [1000, 680], [912, 694], [816, 718],
        ],
        {
          cunCount: 1220,
          slant: -0.22,
          cunLength: [2.6, 7.6],
          cunWidth: [0.85, 1.85],
          darkBias: 0.72,
          subFacets: [[[786, 668], [854, 614], [928, 602], [986, 636]]],
          mossClusters: 9,
          outlineWidth: 2.8,
        }
      );
      // Right-side Song pine concealing Fan Kuan's tiny `臣寬製` signature!
      paintAncientSongPine(ctx, rng, 896, 580, -1, 0.92, true);

      // -----------------------------------------------------------------------
      // 3. SOLID Overhanging Cliff Stone Foundations Beneath the Entire Trail (`路下悬崖折带皴石基`!)
      // Completely eliminates the blank tan void & floating comb-sticks under left/right road!
      // -----------------------------------------------------------------------
      // Left Cliff Foundation Wall (`左侧古道下悬崖石壁`, x=0..308, y=trail..910)
      const leftCliffUnderRoad = [];
      for (let x = 0; x <= 304; x += 16) {
        leftCliffUnderRoad.push([x, evalSongTrailY(x) + 2]);
      }
      leftCliffUnderRoad.push([296, 804], [268, 862], [222, 930], [0, 930]);
      paintOrganicSongBoulder(ctx, rng, leftCliffUnderRoad, {
        cunCount: 1550,
        slant: 0.28,
        cunLength: [3.0, 8.8],
        cunWidth: [0.95, 2.1],
        darkBias: 0.76,
        axeCutMix: 0.45,
        subFacets: [
          [[14, 728], [96, 742], [186, 768], [266, 796]],
          [[46, 782], [142, 796], [234, 828]],
        ],
        mossClusters: 8,
        baseFill: '#baa685',
        outlineWidth: 2.6,
      });

      // Right Cliff Foundation Wall (`右侧古道下悬崖叠石石基`, x=374..1000, y=trail..940)
      const rightCliffUnderRoad = [];
      for (let x = 376; x <= PANEL_SIZE; x += 18) {
        rightCliffUnderRoad.push([x, evalSongTrailY(x) + 2]);
      }
      rightCliffUnderRoad.push(
        [1000, 940],
        [632, 940],
        [594, 858],
        [528, 814],
        [436, 794],
        [380, 778]
      );
      paintOrganicSongBoulder(ctx, rng, rightCliffUnderRoad, {
        cunCount: 2450,
        slant: -0.24,
        cunLength: [3.0, 9.0],
        cunWidth: [0.95, 2.15],
        darkBias: 0.74,
        axeCutMix: 0.46,
        subFacets: [
          [[412, 774], [516, 762], [634, 748], [756, 736], [886, 718], [988, 706]],
          [[488, 804], [618, 792], [748, 776], [892, 756]],
          [[612, 846], [732, 826], [864, 808]],
        ],
        mossClusters: 12,
        baseFill: '#b8a483',
        outlineWidth: 2.7,
      });

      // -----------------------------------------------------------------------
      // 4. Mountain Gorge Stream, Song `勾水法` Rapids & Angular 3-Face Stream Boulders (`方硬三面受光溪石`)
      // (ZERO oval fried-egg pebbles or `~` squiggles!)
      // -----------------------------------------------------------------------
      ctx.save();
      const waterGrad = ctx.createLinearGradient(0, 754, 0, PANEL_SIZE);
      waterGrad.addColorStop(0, 'rgba(244, 236, 216, 0.84)');
      waterGrad.addColorStop(0.52, 'rgba(236, 226, 204, 0.88)');
      waterGrad.addColorStop(1, 'rgba(222, 210, 186, 0.84)');
      ctx.fillStyle = waterGrad;
      ctx.beginPath();
      ctx.moveTo(298, 760);
      ctx.bezierCurveTo(286, 824, 228, 896, 182, 1000);
      ctx.lineTo(662, 1000);
      ctx.bezierCurveTo(638, 904, 582, 826, 408, 760);
      ctx.closePath();
      ctx.fill();

      // Authentic Song `勾水法` swirling multi-thread rapids hugging rock channels
      ctx.lineCap = 'round';
      for (let band = 0; band < 18; band++) {
        const v = band / 17;
        const wy = lerp(768, 992, v);
        const xL = lerp(302, 194, v);
        const xR = lerp(402, 646, v);
        const threads = 3 + (band % 3);
        for (let tIdx = 0; tIdx < threads; tIdx++) {
          const u0 = (tIdx + 0.15 + rng() * 0.5) / threads;
          const sx = lerp(xL + 8, xR - 26, u0);
          const len = 18 + rng() * 26;
          ctx.strokeStyle = tIdx % 2 === 0 ? 'rgba(64, 58, 48, 0.42)' : 'rgba(252, 246, 232, 0.62)';
          ctx.lineWidth = tIdx % 2 === 0 ? 0.72 : 1.05;
          ctx.beginPath();
          ctx.moveTo(sx, wy);
          ctx.bezierCurveTo(
            sx + len * 0.33,
            wy - 2.6 + (rng() - 0.5) * 1.6,
            sx + len * 0.66,
            wy + 2.4 + (rng() - 0.5) * 1.6,
            sx + len,
            wy + 0.6
          );
          ctx.stroke();
        }
      }

      // Angular Three-Face Granite Stream Boulders (`石分三面水口乱石` — sharp polygons, zero `ellipse`!)
      const drawAngularStreamRock = (cx, cy, rw, rh) => {
        const topFace = [
          [cx - rw * 0.85, cy + rh * 0.12],
          [cx - rw * 0.36, cy - rh * 0.88],
          [cx + rw * 0.44, cy - rh * 0.72],
          [cx + rw * 0.18, cy + rh * 0.08],
        ];
        const leftShadeFace = [
          topFace[0],
          topFace[3],
          [cx - rw * 0.08, cy + rh * 0.74],
          [cx - rw * 0.92, cy + rh * 0.54],
        ];
        const rightDarkFace = [
          topFace[2],
          [cx + rw * 0.95, cy + rh * 0.16],
          [cx + rw * 0.78, cy + rh * 0.68],
          [cx - rw * 0.08, cy + rh * 0.74],
          topFace[3],
        ];
        fillPoly(ctx, topFace, '#dfd0b2', 0.96);      // Sunlit top facet
        fillPoly(ctx, leftShadeFace, '#9e8e73', 0.96); // Mid-tone side facet
        fillPoly(ctx, rightDarkFace, '#5b5244', 0.96); // Deep shaded facet

        drawCalligraphicRockOutline(
          ctx,
          [topFace[0], topFace[1], topFace[2], rightDarkFace[1], rightDarkFace[2], leftShadeFace[2], leftShadeFace[3], topFace[0]],
          rng,
          { baseWidth: 1.05, color: INK_SHADES.jiao, alpha: 0.88, dryness: 0.26, bristles: 3 }
        );
        // Internal ridge crease + white water foam collar at base
        ctx.strokeStyle = INK_SHADES.nong;
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(topFace[0][0], topFace[0][1]);
        ctx.lineTo(topFace[3][0], topFace[3][1]);
        ctx.lineTo(topFace[2][0], topFace[2][1]);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(252, 246, 232, 0.74)';
        ctx.lineWidth = 0.95;
        ctx.beginPath();
        ctx.moveTo(cx - rw * 0.95, cy + rh * 0.66);
        ctx.quadraticCurveTo(cx, cy + rh * 0.92, cx + rw * 0.92, cy + rh * 0.72);
        ctx.stroke();
      };

      const rockSites = [
        [284, 792, 10, 6.5], [268, 816, 13, 8], [250, 848, 11, 7], [292, 838, 8.5, 5.5], [232, 882, 14, 8.5],
        [388, 784, 9.5, 6], [418, 796, 12.5, 7.5], [452, 808, 10.5, 6.5], [346, 824, 9, 5.5],
        [558, 842, 13.5, 8], [588, 872, 11.5, 7], [612, 908, 15, 9], [538, 884, 9.5, 6],
      ];
      for (const [rx, ry, rw, rh] of rockSites) {
        drawAngularStreamRock(rx + (rng() - 0.5) * 4, ry + (rng() - 0.5) * 3, rw, rh);
      }
      ctx.restore();

      // -----------------------------------------------------------------------
      // 5. Ancient Mountain Trail, Cantilever Timber Trestle (`古栈道斜撑木排架`) & Stream Log Bridge
      // -----------------------------------------------------------------------
      ctx.save();
      // Cantilevered Northern Song Cliff-Road Timber Brackets (`栈道托木与斜撑圆木`, where cliff is steepest!)
      const trestleStations = [
        48, 86, 126, 168, 212, 256,
        412, 456, 502, 548, 596, 646, 698, 752, 808, 864, 922,
      ];
      for (const tx of trestleStations) {
        const { y: ty } = sampleSongTrail(tx);
        const braceDrop = 16 + (tx % 3) * 4.5;
        const cliffInX = tx + (tx < 340 ? -8.5 : 8.5);

        // Dark rock socket shadow where diagonal strut bites into granite ledge
        ctx.fillStyle = 'rgba(18, 16, 13, 0.72)';
        drawRaindropCunDab(ctx, cliffInX - 3, ty + braceDrop - 1, 6.5, 3.8, 0.2, 0.05, rng);

        // Diagonal round-log strut (`斜撑撑木`) + horizontal corbel beam (`横托木`)
        ctx.strokeStyle = '#38281a';
        ctx.lineCap = 'round';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cliffInX, ty + braceDrop);
        ctx.lineTo(tx, ty + 4.8);
        ctx.stroke();

        ctx.strokeStyle = '#6e4f32';
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(cliffInX + 0.4, ty + braceDrop - 0.4);
        ctx.lineTo(tx, ty + 4.5);
        ctx.stroke();

        // Horizontal projecting log end cap under road edge
        ctx.fillStyle = '#a88354';
        ctx.strokeStyle = INK_SHADES.jiao;
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(tx - 2.2, ty + 3.6);
        ctx.lineTo(tx + 2.2, ty + 3.6);
        ctx.lineTo(tx + 2.0, ty + 6.4);
        ctx.lineTo(tx - 2.0, ty + 6.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Worn stone-and-ochre mountain trail ribbon (strictly anchored at (0,680) and (1000,680)!)
      ctx.strokeStyle = '#e5d6b6';
      ctx.lineWidth = 13.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      for (let x = 0; x <= PANEL_SIZE; x += 6) {
        const ty = evalSongTrailY(x) + (x > 18 && x < 982 ? Math.sin(x * 0.085) * 0.55 : 0);
        if (x === 0) ctx.moveTo(0, ROAD_EDGE_Y);
        else if (x >= PANEL_SIZE) ctx.lineTo(PANEL_SIZE, ROAD_EDGE_Y);
        else ctx.lineTo(x, ty);
      }
      ctx.stroke();

      // Irregular fitted mountain flagstone seams & ochre earth dust (`山径石板错缝与黄土迹`)
      for (let x = 14; x < PANEL_SIZE - 14; x += 13 + Math.floor(rng() * 9)) {
        if (x > 296 && x < 380) continue;
        const { y, slope } = sampleSongTrail(x);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(slope);
        ctx.fillStyle = rng() > 0.48 ? 'rgba(158, 126, 84, 0.26)' : 'rgba(82, 74, 62, 0.20)';
        ctx.fillRect(-4.5, -3.6 + (rng() - 0.5) * 2.4, 7 + rng() * 5, 2.4 + rng() * 2.2);
        ctx.strokeStyle = 'rgba(48, 42, 34, 0.34)';
        ctx.lineWidth = 0.62;
        ctx.beginPath();
        ctx.moveTo(0, -5.2);
        ctx.lineTo((rng() - 0.5) * 2.5, 5.2);
        ctx.stroke();
        ctx.restore();
      }

      // Broken calligraphic trail margins (`中锋折带枯笔山径边线`)
      const upperTrail = [];
      const lowerTrail = [];
      for (let x = 0; x <= PANEL_SIZE; x += 12) {
        const ty = evalSongTrailY(x);
        upperTrail.push([x, ty - 6.0 + (x > 16 && x < 984 ? (rng() - 0.5) * 1.3 : 0)]);
        lowerTrail.push([x, ty + 6.0 + (x > 16 && x < 984 ? (rng() - 0.5) * 1.4 : 0)]);
      }
      drawCalligraphicRockOutline(ctx, upperTrail, rng, {
        baseWidth: 1.7,
        color: INK_SHADES.zhong,
        alpha: 0.78,
        dryness: 0.46,
        bristles: 3,
      });
      drawCalligraphicRockOutline(ctx, lowerTrail, rng, {
        baseWidth: 2.5,
        color: INK_SHADES.jiao,
        alpha: 0.90,
        dryness: 0.32,
        bristles: 4,
      });

      // Rustic Northern Song Round-Log Stream Trestle Bridge (`山涧斜撑圆木栈桥`, x=298..378)
      for (const ax of [298, 378]) {
        const ay = evalSongTrailY(ax);
        const abPts = subdivideCraggyPath(
          [[ax - 11, ay + 3], [ax + 11, ay + 3], [ax + 14, ay + 24], [ax - 13, ay + 24]],
          rng,
          2,
          0.22,
          true
        );
        fillPoly(ctx, abPts, '#96856b', 0.98);
        drawCalligraphicRockOutline(ctx, abPts, rng, { baseWidth: 1.7, dryness: 0.28, bristles: 3 });
      }

      ctx.lineCap = 'round';
      for (const [bx, leanX] of [[316, -5.5], [338, 1.8], [360, 6.2]]) {
        const by = evalSongTrailY(bx);
        ctx.strokeStyle = '#332417';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.moveTo(bx, by + 4);
        ctx.quadraticCurveTo(bx + leanX * 0.45, by + 19, bx + leanX, by + 37);
        ctx.stroke();

        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(bx + leanX * 0.35, by + 23);
        ctx.lineTo(bx + (leanX < 0 ? 15 : -15), by + 5);
        ctx.stroke();
      }

      // Gnarled longitudinal log stringers
      const bridgeStringer = [];
      for (let x = 296; x <= 380; x += 7) {
        bridgeStringer.push([x, evalSongTrailY(x) + 3.6]);
      }
      drawCalligraphicRockOutline(ctx, bridgeStringer, rng, {
        baseWidth: 4.4,
        color: '#5c4128',
        alpha: 0.96,
        dryness: 0.18,
        bristles: 3,
      });
      drawCalligraphicRockOutline(ctx, bridgeStringer, rng, {
        baseWidth: 1.5,
        color: INK_SHADES.jiao,
        alpha: 0.90,
        dryness: 0.28,
        bristles: 2,
      });

      // Hand-hewn irregular transverse round logs (`排铺圆木断面`)
      for (let lx = 299; lx <= 377; lx += 5.0) {
        const ly = evalSongTrailY(lx) + 1.2 + (rng() - 0.5) * 0.8;
        const logPoly = [];
        for (let k = 0; k < 7; k++) {
          const a = (k / 7) * Math.PI * 2;
          const r = 2.35 * (0.86 + 0.24 * rng());
          logPoly.push([lx + Math.cos(a) * r, ly + Math.sin(a) * r]);
        }
        fillPoly(ctx, logPoly, lx % 2 < 1 ? '#b4905e' : '#967549', 0.98);
        drawCalligraphicRockOutline(ctx, [...logPoly, logPoly[0]], rng, {
          baseWidth: 0.85,
          color: INK_SHADES.jiao,
          alpha: 0.88,
          dryness: 0.15,
          bristles: 2,
        });
      }

      // Crooked mountain-branch handrail on far side of bridge
      const railTop = subdivideCraggyPath(
        [
          [301, evalSongTrailY(301) - 10.2],
          [338, evalSongTrailY(338) - 11.8],
          [375, evalSongTrailY(375) - 9.8],
        ],
        rng,
        2,
        0.09
      );
      drawCalligraphicRockOutline(ctx, railTop, rng, {
        baseWidth: 1.55,
        color: '#42301f',
        alpha: 0.92,
        dryness: 0.22,
        bristles: 2,
      });
      for (const px of [304, 321, 339, 357, 373]) {
        const py = evalSongTrailY(px);
        drawCalligraphicRockOutline(
          ctx,
          [[px + (rng() - 0.5) * 1.4, py - 1.5], [px, py - 10.6]],
          rng,
          { baseWidth: 1.35, color: '#3b2b1c', alpha: 0.92, dryness: 0.20, bristles: 2 }
        );
      }
      ctx.restore();

      // -----------------------------------------------------------------------
      // 6. Monumental Foreground Stream-Bed Crags (`近景折带/斧劈寒溪巨石`, y > 792) & Eroded Seals
      // -----------------------------------------------------------------------
      paintOrganicSongBoulder(
        ctx,
        rng,
        [
          [0, 1000], [16, 868], [74, 818], [142, 796],
          [208, 816], [258, 868], [288, 946], [296, 1000],
        ],
        {
          cunCount: 1380,
          slant: 0.28,
          cunLength: [3.2, 9.2],
          cunWidth: [1.0, 2.2],
          darkBias: 0.76,
          axeCutMix: 0.42,
          subFacets: [
            [[54, 920], [116, 856], [188, 864], [240, 928]],
            [[110, 986], [164, 918], [228, 938]],
          ],
          mossClusters: 10,
          outlineWidth: 3.1,
        }
      );

      paintOrganicSongBoulder(
        ctx,
        rng,
        [
          [366, 1000], [384, 910], [424, 844], [478, 824],
          [534, 850], [566, 918], [574, 1000],
        ],
        {
          cunCount: 1050,
          slant: -0.22,
          cunLength: [3.0, 8.8],
          cunWidth: [0.95, 2.1],
          darkBias: 0.74,
          axeCutMix: 0.40,
          subFacets: [[[404, 934], [462, 876], [522, 896], [548, 966]]],
          mossClusters: 8,
          outlineWidth: 3.0,
        }
      );

      paintOrganicSongBoulder(
        ctx,
        rng,
        [
          [650, 1000], [678, 892], [734, 822], [808, 790],
          [886, 806], [952, 856], [996, 938], [1000, 1000],
        ],
        {
          cunCount: 1420,
          slant: -0.26,
          cunLength: [3.2, 9.2],
          cunWidth: [1.0, 2.2],
          darkBias: 0.77,
          axeCutMix: 0.42,
          subFacets: [
            [[698, 944], [768, 864], [852, 856], [918, 918]],
            [[774, 990], [838, 922], [926, 942]],
          ],
          mossClusters: 10,
          outlineWidth: 3.1,
        }
      );

      // Authentic weathered imperial collector seals (`御書之寶`, `溪山清遠`, `秘府`)
      paintCollectorSeal(ctx, 38, 936, 28, 34, rng, ['溪', '山', '清', '遠'], false);
      paintCollectorSeal(ctx, 960, 904, 30, 30, rng, ['御', '書', '之', '寶'], true);
      paintCollectorSeal(ctx, 960, 950, 26, 36, rng, ['神', '品'], false);

      ctx.restore();
    },
    PANEL_SIZE * 2,
    VALLEY_H * 2
  );
}

/**
 * Draws a hand-brushed calligraphic tapered stroke (`中锋鼠尾提按笔触`) between two points
 * with rounded press entry, subtle belly curve, and pointed/feibai exit — zero uniform geometric wire!
 */
function drawTaperedBrushSegment(ctx, x0, y0, x1, y1, w0, w1, color, curveOff = 0, alpha = 1.0) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const mx = (x0 + x1) * 0.5 + nx * curveOff;
  const my = (y0 + y1) * 0.5 + ny * curveOff;
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
 * Draws an organic hand-painted irregular ink dab / polygonal dot (zero `ctx.arc` circle!).
 */
function fillOrganicInkDot(ctx, cx, cy, rx, ry, rot, color, alpha = 1.0) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  const pts = [
    [-rx * 0.92, -ry * 0.22],
    [-rx * 0.35, -ry * 0.96],
    [rx * 0.48, -ry * 0.86],
    [rx * 0.98, -ry * 0.08],
    [rx * 0.62, ry * 0.88],
    [-rx * 0.38, ry * 0.94],
  ];
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a sculpted Northern Song miniature ink pack donkey (`精绘范宽点景驮驴`)
 * with startled ear twitching, hand-woven bamboo firewood pannier, and astonished mountain drover!
 */
function drawMiniaturePackDonkey(ctx, x, time, withDrover = false, pelicanX = 0) {
  const { y, slope } = sampleSongTrail(x);
  const nearPelican = clamp(1 - Math.abs(pelicanX - x) / 155, 0, 1);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(slope);

  const stepPhase = time * 9.0 + x * 0.11;
  const stride = Math.sin(stepPhase) * 2.1 * (1 - nearPelican * 0.45);
  const bob = Math.abs(Math.cos(stepPhase)) * 0.62;

  // Soft ink wash shadow on stone trail
  fillOrganicInkDot(ctx, 0.4, 0.8, 12.8, 2.5, 0, 'rgba(24, 21, 16, 0.26)');

  // Articulated 2-joint equine legs with tapered brush strokes
  const drawDonkeyLeg = (hx, hy, kx, ky, fx, fy, isFar) => {
    const col = isFar ? '#3b352c' : INK_SHADES.jiao;
    drawTaperedBrushSegment(ctx, hx, hy, kx, ky, isFar ? 1.5 : 1.75, 1.1, col, 0.15);
    drawTaperedBrushSegment(ctx, kx, ky, fx, fy, 1.15, 0.85, col, -0.1);
    fillOrganicInkDot(ctx, fx, fy - 0.35, 1.15, 0.85, 0, INK_SHADES.jiao);
  };

  drawDonkeyLeg(-6.8, -8.5 - bob, -8.5 - stride * 0.3, -4.2, -7.8 - stride * 0.7, 0, true);
  drawDonkeyLeg(5.2, -8.5 - bob, 5.8 + stride * 0.35, -4.2, 4.8 + stride * 0.75, 0, true);

  // Sculpted ink-wash donkey torso & haunches
  ctx.fillStyle = '#5e564a';
  ctx.beginPath();
  ctx.moveTo(-9.8, -9.5 - bob);
  ctx.quadraticCurveTo(-10.8, -14.4 - bob, -3.5, -14.1 - bob);
  ctx.lineTo(5.8, -13.9 - bob);
  ctx.quadraticCurveTo(10.0, -13.2 - bob, 8.8, -8.2 - bob);
  ctx.quadraticCurveTo(0, -6.1 - bob, -9.8, -9.5 - bob);
  ctx.closePath();
  ctx.fill();

  // Unpainted silk belly highlight (`计白当黑留白驴腹`)
  fillOrganicInkDot(ctx, -0.5, -8.0 - bob, 6.2, 1.7, 0, 'rgba(232, 221, 196, 0.48)');

  // Calligraphic dorsal spine & belly brush strokes
  drawTaperedBrushSegment(ctx, -9.6, -12.2 - bob, 6.2, -13.8 - bob, 1.35, 1.05, INK_SHADES.jiao, -0.8);
  drawTaperedBrushSegment(ctx, -9.4, -9.2 - bob, 8.4, -8.2 - bob, 1.0, 1.15, INK_SHADES.jiao, 1.3);

  drawDonkeyLeg(-5.2, -8.2 - bob, -6.6 + stride * 0.3, -4.0, -5.2 + stride * 0.7, 0, false);
  drawDonkeyLeg(6.8, -8.2 - bob, 7.6 - stride * 0.35, -4.0, 7.2 - stride * 0.75, 0, false);

  // Swishing tufted tail
  drawTaperedBrushSegment(
    ctx,
    -9.8,
    -12.0 - bob,
    -13.2,
    -5.8 + Math.sin(stepPhase * 1.5) * 1.5,
    1.25,
    0.65,
    INK_SHADES.jiao,
    -1.0
  );

  // Muted cinnabar saddle cloth + hand-woven irregular bamboo firewood pannier (ZERO `roundRect`!)
  fillPoly(
    ctx,
    [
      [-6.8, -14.6 - bob],
      [5.8, -14.5 - bob],
      [6.4, -11.0 - bob],
      [-7.2, -11.2 - bob],
    ],
    '#884232',
    0.92
  );

  // Bundled mountain firewood sticks jutting out of top of pannier (`柴薪束`)
  ctx.strokeStyle = '#523922';
  ctx.lineWidth = 1.05;
  ctx.beginPath();
  ctx.moveTo(-6.8, -18.2 - bob);
  ctx.lineTo(5.8, -20.4 - bob);
  ctx.moveTo(-6.2, -19.8 - bob);
  ctx.lineTo(6.2, -18.5 - bob);
  ctx.stroke();

  const basketPts = [
    [-5.8, -18.8 - bob],
    [4.9, -18.9 - bob],
    [5.3, -12.6 - bob],
    [-5.4, -12.5 - bob],
  ];
  fillPoly(ctx, basketPts, '#c5a066', 0.98);
  ctx.strokeStyle = INK_SHADES.jiao;
  ctx.lineWidth = 0.95;
  ctx.beginPath();
  ctx.moveTo(basketPts[0][0], basketPts[0][1]);
  for (let i = 1; i < basketPts.length; i++) ctx.lineTo(basketPts[i][0], basketPts[i][1]);
  ctx.closePath();
  ctx.moveTo(-2.2, -18.8 - bob);
  ctx.lineTo(-2.0, -12.5 - bob);
  ctx.moveTo(1.5, -18.8 - bob);
  ctx.lineTo(1.7, -12.6 - bob);
  ctx.moveTo(-5.6, -15.6 - bob);
  ctx.lineTo(5.1, -15.6 - bob);
  ctx.stroke();

  // Donkey neck & head (startled head lift when cycling pelican passes!)
  const headLift = nearPelican * 1.8;
  const headPts = [
    [6.0, -12.8 - bob],
    [10.5, -18.0 - bob - headLift],
    [16.2, -14.9 - bob - headLift * 0.7],
    [14.7, -12.0 - bob - headLift * 0.6],
    [8.2, -9.5 - bob],
  ];
  fillPoly(ctx, headPts, '#544d42', 0.98);
  ctx.strokeStyle = INK_SHADES.jiao;
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.moveTo(headPts[0][0], headPts[0][1]);
  for (let i = 1; i < headPts.length; i++) ctx.lineTo(headPts[i][0], headPts[i][1]);
  ctx.closePath();
  ctx.stroke();

  // White muzzle (`粉鼻`) & organic ink eye speck
  fillOrganicInkDot(ctx, 14.8, -13.5 - bob - headLift * 0.65, 1.5, 1.25, -0.2, '#ede2ca');
  fillOrganicInkDot(ctx, 11.8, -15.5 - bob - headLift * 0.85, 0.85, 0.75, 0, INK_SHADES.jiao);

  // Expressive long donkey ears twitching backward toward the strange pelican!
  const earBackTilt = -nearPelican * 0.42 + Math.sin(time * 12) * 0.08 * nearPelican;
  fillOrganicInkDot(ctx, 9.4 + earBackTilt * 1.8, -20.7 - bob - headLift, 1.05, 3.7, -0.24 + earBackTilt, '#3d372f');
  fillOrganicInkDot(ctx, 11.5 + earBackTilt * 1.5, -20.3 - bob - headLift, 1.05, 3.6, 0.22 + earBackTilt * 0.7, '#292520');

  // Song Mountain Drover (`赶驴山夫`) reining in & pointing back in shock!
  if (withDrover) {
    const dx = 25;
    const lookBack = pelicanX > x - 165 && pelicanX < x + 85;
    const shockLean = lookBack ? -0.14 : 0.06;
    ctx.save();
    ctx.translate(dx, 0.5);

    // Rolled-up hempen trousers & straw-sandal calves
    drawTaperedBrushSegment(ctx, -1.4, -9.5, -3.5 - stride * 0.4, -4.4, 2.3, 1.8, '#e2d5bc', 0.1);
    drawTaperedBrushSegment(ctx, 1.4, -9.5, 3.1 + stride * 0.4, -4.4, 2.3, 1.8, '#e2d5bc', -0.1);
    drawTaperedBrushSegment(ctx, -3.5 - stride * 0.4, -4.4, -3.8 - stride * 0.45, 0, 1.3, 0.9, INK_SHADES.jiao, 0);
    drawTaperedBrushSegment(ctx, 3.1 + stride * 0.4, -4.4, 3.4 + stride * 0.45, 0, 1.3, 0.9, INK_SHADES.jiao, 0);

    ctx.save();
    ctx.rotate(shockLean);

    // Draped Northern Song mountain tunic (`短褐束腰山衣`, `钉头鼠尾` folds)
    const tunicPts = [
      [-4.6, -8.0],
      [-4.9, -13.6],
      [-3.1, -18.4],
      [3.3, -18.4],
      [5.1, -13.6],
      [4.7, -8.0],
    ];
    fillPoly(ctx, tunicPts, '#cfc2a6', 0.98);
    ctx.strokeStyle = INK_SHADES.jiao;
    ctx.lineWidth = 1.05;
    ctx.beginPath();
    ctx.moveTo(tunicPts[0][0], tunicPts[0][1]);
    for (let i = 1; i < tunicPts.length; i++) ctx.lineTo(tunicPts[i][0], tunicPts[i][1]);
    ctx.closePath();
    ctx.moveTo(-3.9, -12.7);
    ctx.lineTo(4.1, -12.7);
    ctx.stroke();

    // Sculpted profile head (polygon, zero `ctx.arc`!) + tilted woven bamboo conical hat (`山民竹笠`)
    fillOrganicInkDot(ctx, lookBack ? -1.0 : 0.8, -20.5, 2.5, 2.7, 0, '#dfc7a4');

    ctx.save();
    ctx.translate(0, -21.2);
    ctx.rotate(lookBack ? 0.18 : -0.06);
    ctx.fillStyle = '#cca668';
    ctx.strokeStyle = INK_SHADES.jiao;
    ctx.lineWidth = 1.05;
    ctx.beginPath();
    ctx.moveTo(-7.5, 0.2);
    ctx.quadraticCurveTo(0, -5.4, 7.5, 0.2);
    ctx.quadraticCurveTo(0, 1.4, -7.5, 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Outstretched pointing sleeve & crooked vine staff
    if (lookBack) {
      drawTaperedBrushSegment(ctx, -2.4, -16.6, -11.2, -19.2, 2.6, 1.5, '#cfc2a6', -0.4);
      drawTaperedBrushSegment(ctx, -2.4, -17.6, -11.2, -19.6, 1.05, 0.75, INK_SHADES.jiao, -0.3);
    } else {
      drawTaperedBrushSegment(ctx, 2.4, -16.6, 6.2, -13.4, 2.4, 1.5, '#cfc2a6', 0.2);
    }

    const tremor = lookBack ? Math.sin(time * 20) * 0.55 : 0;
    drawTaperedBrushSegment(ctx, 3.4, -17.6, 7.4 + tremor, 0.4, 1.35, 0.95, '#46321f', 0.6);
    ctx.restore();

    // Taut hemp lead rope to Donkey #2's halter
    ctx.strokeStyle = 'rgba(38, 32, 24, 0.62)';
    ctx.lineWidth = 0.78;
    ctx.beginPath();
    ctx.moveTo(-3.6, -15.0);
    ctx.quadraticCurveTo(-7.5, lookBack ? -13.6 : -11.2, -11.6, -13.6 - bob - headLift * 0.6);
    ctx.stroke();

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Draws the bespoke Northern Song Calligraphic `点景` Pelican + Square-Timber Mortise-and-Tenon
 * Porter Bicycle (`北宋老山木榫卯麻绳绑扎挑夫车`)!
 * - Segmented polygonal iron-clamped 8-spoke wooden wheels (ZERO smooth `ctx.arc` circles!)
 * - Straight rough-hewn square timber beams with wooden wedges (`木楔`) & hemp-rope lashings (`麻绳缠结`)
 * - Rhythmic standing/crouching uphill climbing effort + prominent woven bamboo conical hat (`淡赭斗笠`)!
 */
function drawSongPelicanAndBike(ctx, rig, localT) {
  const s = rig.root.scale;
  const lw = (w, minPx = 0.72) => Math.max(minPx, w * s);

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Soft ink wash shadow under wheels
  fillOrganicInkDot(
    ctx,
    (rig.rearWheel.x + rig.frontWheel.x) * 0.5,
    (rig.rearWheel.y + rig.frontWheel.y) * 0.5 + rig.rearWheel.r + 0.5 * s,
    116 * s,
    9.5 * s + 0.85,
    rig.root.slope,
    'rgba(22, 19, 15, 0.26)'
  );

  // Segmented 14-felloe Northern Song Iron-Bound Hardwood Wheel (`多边形木辋铁箍八辐木轮`, zero `ctx.arc`!)
  const drawSongWoodenWheel = (w) => {
    const numSpokes = 8;
    const felloes = 14;
    const rOuter = w.r;
    const rWood = Math.max(0.8, w.r - lw(2.4, 0.75));

    // Tapered wooden spokes mortised into hub
    for (let i = 0; i < numSpokes; i++) {
      const a = w.angle + (i * Math.PI * 2) / numSpokes;
      const sx = w.x + Math.cos(a) * (rOuter - lw(1.4, 0.5));
      const sy = w.y + Math.sin(a) * (rOuter - lw(1.4, 0.5));
      drawTaperedBrushSegment(
        ctx,
        w.x,
        w.y,
        sx,
        sy,
        lw(2.2, 0.8),
        lw(1.3, 0.58),
        '#4c3926',
        0
      );
    }

    // Multi-segment bent-hardwood felloe ring (`拼合木辋`)
    ctx.strokeStyle = '#9e7c4e';
    ctx.lineWidth = lw(3.4, 0.92);
    ctx.beginPath();
    for (let k = 0; k <= felloes; k++) {
      const a = w.angle + (k / felloes) * Math.PI * 2;
      const rJitter = rWood * (1 + 0.014 * Math.sin(k * 3.7));
      const px = w.x + Math.cos(a) * rJitter;
      const py = w.y + Math.sin(a) * rJitter;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Hand-forged dark iron rim band & iron felloe-clamp ticks (`生铁包箍与铁锔`)
    ctx.strokeStyle = INK_SHADES.jiao;
    ctx.lineWidth = lw(2.8, 1.05);
    ctx.beginPath();
    for (let k = 0; k <= felloes; k++) {
      const a = w.angle + (k / felloes) * Math.PI * 2;
      const rJitter = rOuter * (1 + 0.015 * Math.cos(k * 2.9));
      const px = w.x + Math.cos(a) * rJitter;
      const py = w.y + Math.sin(a) * rJitter;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Heavy wooden hub block (`木车毂`)
    fillOrganicInkDot(ctx, w.x, w.y, Math.max(1.2, 4.4 * s), Math.max(1.1, 4.0 * s), w.angle, '#594028');
    fillOrganicInkDot(ctx, w.x, w.y, Math.max(0.8, 2.1 * s), Math.max(0.8, 2.1 * s), 0, INK_SHADES.jiao);
  };

  const drawCalligraphicLeg = (hipPt, kneePt, footPt, pedalPt, isFar) => {
    // Wooden crank arm (`直柄木曲拐`)
    drawTaperedBrushSegment(ctx, rig.bb.x, rig.bb.y, pedalPt.x, pedalPt.y, lw(3.4, 0.88), lw(2.6, 0.72), '#3e2e1f', 0);

    const legCol = isFar ? '#76502f' : '#a66b38';
    drawTaperedBrushSegment(ctx, hipPt.x, hipPt.y, kneePt.x, kneePt.y, lw(5.2, 1.05), lw(3.8, 0.88), legCol, 0.4 * s);
    drawTaperedBrushSegment(ctx, kneePt.x, kneePt.y, footPt.x, footPt.y, lw(3.8, 0.88), lw(2.8, 0.75), legCol, -0.3 * s);
    drawTaperedBrushSegment(ctx, hipPt.x, hipPt.y, kneePt.x, kneePt.y, lw(1.5, 0.62), lw(1.1, 0.55), INK_SHADES.jiao, 0.4 * s, 0.82);

    // Webbed Song pelican foot pressing wooden treadle block
    const footPoly = [
      [footPt.x - 4 * s, footPt.y],
      [footPt.x + 14 * s, footPt.y + 2 * s],
      [footPt.x + 8 * s, footPt.y + 6.2 * s],
      [footPt.x - 4.5 * s, footPt.y + 4.2 * s],
    ];
    fillPoly(ctx, footPoly, isFar ? '#76502f' : '#b4743c', 1.0);
    ctx.strokeStyle = INK_SHADES.jiao;
    ctx.lineWidth = lw(1.3, 0.62);
    ctx.beginPath();
    ctx.moveTo(footPoly[0][0], footPoly[0][1]);
    for (let i = 1; i < footPoly.length; i++) ctx.lineTo(footPoly[i][0], footPoly[i][1]);
    ctx.closePath();
    ctx.stroke();
  };

  // 1. Far leg & polygonal wooden wheels
  drawCalligraphicLeg(rig.leftHip, rig.leftKnee, rig.leftFoot, rig.leftPedal, true);
  drawSongWoodenWheel(rig.rearWheel);
  drawSongWoodenWheel(rig.frontWheel);

  // 2. Grooved Wooden Pulley & Twisted Hemp-Rope Drive (`木槽轮麻绳传动` — zero `setLineDash`!)
  const pulleyR = Math.max(1.6, 11.2 * s);
  fillOrganicInkDot(ctx, rig.bb.x, rig.bb.y, pulleyR, pulleyR * 0.96, rig.pedalAngle, '#8b6840', 0.88);
  ctx.strokeStyle = INK_SHADES.jiao;
  ctx.lineWidth = lw(1.5, 0.65);
  ctx.beginPath();
  for (let k = 0; k <= 10; k++) {
    const a = rig.pedalAngle + (k / 10) * Math.PI * 2;
    const px = rig.bb.x + Math.cos(a) * pulleyR;
    const py = rig.bb.y + Math.sin(a) * pulleyR;
    if (k === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Continuous braided hemp rope strands
  ctx.strokeStyle = '#3b3126';
  ctx.lineWidth = lw(1.6, 0.65);
  ctx.beginPath();
  ctx.moveTo(rig.rearWheel.x, rig.rearWheel.y - 4.2 * s);
  ctx.lineTo(rig.bb.x, rig.bb.y - pulleyR);
  ctx.moveTo(rig.rearWheel.x, rig.rearWheel.y + 4.2 * s);
  ctx.lineTo(rig.bb.x, rig.bb.y + pulleyR);
  ctx.stroke();

  // Square-section mortise-and-tenon mountain timber frame (`方木穿榫车架 + 木楔麻绳绑扎`)
  const drawSquareTimber = (p0, p1, wBeam = 5.0) => {
    // Project beam ends slightly past joint for authentic Song through-tenon look (`出头透榫`)!
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy) || 1;
    const ext = 2.6 * s;
    const x0 = p0.x - (dx / len) * ext;
    const y0 = p0.y - (dy / len) * ext;
    const x1 = p1.x + (dx / len) * ext;
    const y1 = p1.y + (dy / len) * ext;

    drawTaperedBrushSegment(ctx, x0, y0, x1, y1, lw(wBeam + 2.0, 1.35), lw(wBeam + 1.8, 1.3), INK_SHADES.jiao, 0);
    drawTaperedBrushSegment(ctx, x0, y0, x1, y1, lw(wBeam - 0.6, 0.72), lw(wBeam - 0.8, 0.68), '#9b7748', 0);
  };

  drawSquareTimber(rig.rearWheel, rig.seatCluster, 4.4);
  drawSquareTimber(rig.rearWheel, rig.bb, 4.6);
  drawSquareTimber(rig.seatCluster, rig.bb, 5.0);
  drawSquareTimber(rig.seatCluster, rig.headTop, 5.0);
  drawSquareTimber(rig.bb, rig.headBot, 5.2);
  drawSquareTimber(rig.headTop, rig.headBot, 5.4);
  drawSquareTimber(rig.headTop, rig.frontWheel, 4.6);

  // Dark hemp-rope lashing knots (`麻绳十字缠扎`) at every mortise joint
  for (const jt of [rig.seatCluster, rig.bb, rig.headTop, rig.headBot]) {
    fillOrganicInkDot(ctx, jt.x, jt.y, Math.max(1.0, 4.2 * s), Math.max(1.0, 3.8 * s), 0.4, '#241c14');
  }

  // Mortised wooden seat post, straw-bound saddle pad & straight crossbar handlebar
  drawSquareTimber(rig.seatCluster, rig.saddle, 3.6);
  drawSquareTimber(rig.headTop, rig.stemTop, 3.8);
  drawTaperedBrushSegment(ctx, rig.stemTop.x + 3 * s, rig.stemTop.y, rig.handleGrip.x - 2 * s, rig.handleGrip.y, lw(3.8, 0.95), lw(3.4, 0.88), '#3b2b1d', 0);
  drawTaperedBrushSegment(ctx, rig.saddle.x - 13 * s, rig.saddle.y, rig.saddle.x + 11 * s, rig.saddle.y + 1 * s, lw(5.4, 1.2), lw(4.6, 1.05), '#523b24', -0.8 * s);

  // 3. Rhythmic Uphill Standing/Crouching Climb Effort + Calligraphic `减笔点景` Song Pelican
  const climbFactor = 1 - Math.abs(s - 0.18) / 0.82;
  const pedalEffort = Math.sin(rig.pedalAngle * 2) * 3.2 * s * climbFactor;
  const climbLean = (8.8 + Math.cos(rig.pedalAngle * 2) * 2.2) * s * climbFactor;

  const chestX = rig.chest.x + climbLean * 0.62;
  const chestY = rig.chest.y + climbLean * 0.26 - pedalEffort;
  const headX = rig.head.x + climbLean;
  const headY = rig.head.y + climbLean * 0.46 - pedalEffort * 1.15;
  const beakUpperX = rig.beakUpperBase.x + climbLean;
  const beakUpperY = rig.beakUpperBase.y + climbLean * 0.46 - pedalEffort * 1.15;
  const beakLowerX = rig.beakLowerBase.x + climbLean;
  const beakLowerY = rig.beakLowerBase.y + climbLean * 0.46 - pedalEffort * 1.15;
  const beakTipX = rig.beakTip.x + climbLean * 1.12;
  const beakTipY = rig.beakTip.y + climbLean * 0.50 - pedalEffort * 0.95;
  const pouchX = rig.pouchBelly.x + climbLean;
  const pouchY = rig.pouchBelly.y + climbLean * 0.46 - pedalEffort;

  // Warm clam-shell white silk wash torso (`蛤粉衬底 + 焦浓墨书法减笔勾背`)
  ctx.fillStyle = '#f5ecda';
  ctx.beginPath();
  ctx.moveTo(rig.tailTip.x, rig.tailTip.y);
  ctx.quadraticCurveTo(rig.bodyCenter.x - 34 * s, rig.bodyCenter.y - 28 * s - pedalEffort * 0.6, chestX + 8 * s, chestY - 5 * s);
  ctx.quadraticCurveTo(rig.bodyCenter.x + 32 * s, rig.bodyCenter.y + 25 * s, rig.hip.x - 13 * s, rig.hip.y + 13 * s);
  ctx.quadraticCurveTo(rig.bodyCenter.x - 44 * s, rig.bodyCenter.y + 13 * s, rig.tailTip.x, rig.tailTip.y);
  ctx.closePath();
  ctx.fill();

  // Pale pine-soot belly shadow wash
  ctx.fillStyle = 'rgba(84, 78, 66, 0.32)';
  ctx.beginPath();
  ctx.moveTo(rig.tailTip.x + 2 * s, rig.tailTip.y + 1 * s);
  ctx.quadraticCurveTo(rig.bodyCenter.x - 20 * s, rig.bodyCenter.y + 16 * s, rig.hip.x + 8 * s, rig.hip.y + 9 * s);
  ctx.quadraticCurveTo(rig.bodyCenter.x - 26 * s, rig.bodyCenter.y + 2 * s, rig.tailTip.x + 2 * s, rig.tailTip.y + 1 * s);
  ctx.fill();

  // Expressive variable-width dorsal & ventral `钉头鼠尾` ink strokes (NOT uniform stroke!)
  drawTaperedBrushSegment(ctx, rig.tailTip.x, rig.tailTip.y, chestX + 7 * s, chestY - 5 * s, lw(2.2, 0.85), lw(3.4, 1.1), INK_SHADES.jiao, -14 * s);
  drawTaperedBrushSegment(ctx, chestX + 6 * s, chestY + 8 * s, rig.hip.x - 12 * s, rig.hip.y + 12 * s, lw(2.4, 0.85), lw(1.8, 0.72), INK_SHADES.jiao, 10 * s);
  drawTaperedBrushSegment(ctx, rig.hip.x - 12 * s, rig.hip.y + 12 * s, rig.tailTip.x, rig.tailTip.y, lw(2.0, 0.78), lw(1.4, 0.68), INK_SHADES.jiao, 5 * s);

  // S-curved neck
  ctx.strokeStyle = '#f5ecda';
  ctx.lineWidth = lw(17.5, 2.7);
  ctx.beginPath();
  ctx.moveTo(chestX - 2 * s, chestY + 4 * s);
  ctx.bezierCurveTo(
    rig.neckC1.x + climbLean * 0.7,
    rig.neckC1.y + climbLean * 0.3 - pedalEffort * 0.8,
    rig.neckC2.x + climbLean * 0.85,
    rig.neckC2.y + climbLean * 0.35 - pedalEffort,
    headX,
    headY
  );
  ctx.stroke();

  ctx.strokeStyle = INK_SHADES.jiao;
  ctx.lineWidth = lw(2.5, 0.90);
  ctx.beginPath();
  ctx.moveTo(chestX - 8 * s, chestY - 1 * s);
  ctx.bezierCurveTo(
    rig.neckC1.x - 7 * s + climbLean * 0.7,
    rig.neckC1.y + climbLean * 0.3 - pedalEffort * 0.8,
    rig.neckC2.x - 8 * s + climbLean * 0.85,
    rig.neckC2.y + climbLean * 0.35 - pedalEffort,
    headX - 9 * s,
    headY
  );
  ctx.moveTo(chestX + 6 * s, chestY + 7 * s);
  ctx.bezierCurveTo(
    rig.neckC1.x + 8 * s + climbLean * 0.7,
    rig.neckC1.y + 3 * s + climbLean * 0.3 - pedalEffort * 0.8,
    rig.neckC2.x + 8 * s + climbLean * 0.85,
    rig.neckC2.y + 2 * s + climbLean * 0.35 - pedalEffort,
    headX + 7 * s,
    headY + 5 * s
  );
  ctx.stroke();

  // 4. Anatomical Sculpted Skull (ZERO `ctx.arc` ball head!), Soot-Ink Hooked Beak & Ochre Pouch
  const hr = Math.max(2.6, rig.head.r);
  ctx.fillStyle = '#f5ecda';
  ctx.strokeStyle = INK_SHADES.jiao;
  ctx.lineWidth = lw(2.4, 0.92);
  ctx.beginPath();
  ctx.moveTo(headX - hr * 0.95, headY + hr * 0.15);
  ctx.bezierCurveTo(headX - hr * 0.92, headY - hr * 0.95, headX + hr * 0.45, headY - hr * 1.05, headX + hr * 0.98, headY - hr * 0.25);
  ctx.quadraticCurveTo(headX + hr * 1.05, headY + hr * 0.65, headX - hr * 0.15, headY + hr * 0.88);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Crown feather tuft (`冠羽两撇`)
  drawTaperedBrushSegment(ctx, headX - hr * 0.6, headY - hr * 0.65, headX - hr * 1.45, headY - hr * 0.92, lw(1.8, 0.72), lw(0.8, 0.5), INK_SHADES.jiao, -1 * s);

  // Warm Song ochre gular pouch & soot-ink hooked beak
  ctx.fillStyle = '#cca06e';
  ctx.strokeStyle = INK_SHADES.jiao;
  ctx.lineWidth = lw(2.2, 0.88);
  ctx.beginPath();
  ctx.moveTo(beakLowerX, beakLowerY);
  ctx.quadraticCurveTo(pouchX, pouchY, beakTipX - 3 * s, beakTipY);
  ctx.lineTo(beakUpperX, beakUpperY + 4 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#dfba84';
  ctx.lineWidth = lw(2.6, 1.02);
  ctx.beginPath();
  ctx.moveTo(beakUpperX, beakUpperY);
  ctx.lineTo(beakTipX, beakTipY - 2.5 * s);
  ctx.quadraticCurveTo(beakTipX + 5 * s, beakTipY + 4 * s, beakTipX - 2 * s, beakTipY + 5 * s);
  ctx.lineTo(beakLowerX, beakLowerY + 1 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Crisp Song ink-dot eye (`焦墨点睛`)
  const ex = headX + 3.8 * s;
  const ey = headY - 2.8 * s;
  fillOrganicInkDot(ctx, ex, ey, Math.max(1.0, 4.0 * s), Math.max(0.9, 3.4 * s), -0.1, '#fbf6e8');
  fillOrganicInkDot(ctx, ex + 1.0 * s, ey, Math.max(0.75, 2.0 * s), Math.max(0.75, 2.0 * s), 0, INK_SHADES.jiao);

  // 5. Near Leg & Layered Ink-Wash Wing (`淡墨分染飞羽`)
  drawCalligraphicLeg(rig.rightHip, rig.rightKnee, rig.rightFoot, rig.rightPedal, false);

  ctx.fillStyle = '#ddd3be';
  ctx.strokeStyle = INK_SHADES.jiao;
  ctx.lineWidth = lw(2.4, 0.92);
  ctx.beginPath();
  ctx.moveTo(rig.wingShoulder.x, rig.wingShoulder.y - pedalEffort * 0.5);
  ctx.quadraticCurveTo(
    rig.wingElbow.x - 15 * s,
    rig.wingElbow.y + 17 * s,
    rig.wingTip.x + 4 * s,
    rig.wingTip.y + 2 * s
  );
  ctx.quadraticCurveTo(
    rig.wingElbow.x + 12 * s,
    rig.wingElbow.y - 8 * s,
    rig.wingShoulder.x + 12 * s,
    rig.wingShoulder.y + 2 * s - pedalEffort * 0.5
  );
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Dark soot primary wing feathers (`浓墨飞羽扫笔`)
  for (let p = 0; p < 3; p++) {
    drawTaperedBrushSegment(
      ctx,
      rig.wingElbow.x - (3 - p * 3) * s,
      rig.wingElbow.y + (5 - p * 2.5) * s,
      rig.wingTip.x + (4 - p * 1.5) * s,
      rig.wingTip.y + (2 - p * 1.8) * s,
      lw(2.6, 0.92),
      lw(1.2, 0.62),
      INK_SHADES.jiao,
      1.5 * s
    );
  }

  // 6. Prominent Woven Bamboo Conical Hat Slung Proudly on Back (`背挂淡赭竹编小斗笠`)!
  const miniBoost = lerp(1.58, 1.0, smoothstep(0.18, 0.65, s));
  const hatCx = rig.bodyCenter.x - 24 * s * miniBoost;
  const hatCy = rig.bodyCenter.y - 25 * s * miniBoost - pedalEffort * 0.6;

  ctx.save();
  // Cinnabar-brown hemp cord slung across neck base
  ctx.strokeStyle = '#783326';
  ctx.lineWidth = lw(1.8, 0.82);
  ctx.beginPath();
  ctx.moveTo(hatCx + 8 * s, hatCy + 4 * s);
  ctx.quadraticCurveTo(chestX + 3 * s, chestY - 2 * s, chestX + 7 * s, chestY + 9 * s);
  ctx.stroke();

  ctx.translate(hatCx, hatCy);
  ctx.rotate(-0.78 + rig.root.slope + Math.sin(localT * 6.5) * 0.045);
  const hatR = 38 * s * miniBoost;
  const hatH = 19.5 * s * miniBoost;

  ctx.fillStyle = '#d4b06e';
  ctx.strokeStyle = INK_SHADES.jiao;
  ctx.lineWidth = lw(2.5, 1.06);
  ctx.beginPath();
  ctx.moveTo(-hatR, 2.5 * s);
  ctx.quadraticCurveTo(-hatR * 0.28, -hatH * 0.72, 0, -hatH);
  ctx.quadraticCurveTo(hatR * 0.28, -hatH * 0.72, hatR, 2.5 * s);
  ctx.quadraticCurveTo(0, 7.5 * s * miniBoost, -hatR, 2.5 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  fillOrganicInkDot(ctx, 0, -hatH - 0.8 * s, Math.max(1.0, 2.2 * s * miniBoost), Math.max(0.9, 1.8 * s * miniBoost), 0, INK_SHADES.jiao);

  ctx.strokeStyle = 'rgba(38, 28, 18, 0.82)';
  ctx.lineWidth = lw(1.15, 0.65);
  ctx.beginPath();
  ctx.moveTo(0, -hatH);
  ctx.lineTo(-hatR * 0.58, 3.4 * s);
  ctx.moveTo(0, -hatH);
  ctx.lineTo(0, 5.2 * s * miniBoost);
  ctx.moveTo(0, -hatH);
  ctx.lineTo(hatR * 0.58, 3.4 * s);
  ctx.moveTo(-hatR * 0.66, -hatH * 0.36);
  ctx.quadraticCurveTo(0, -hatH * 0.14, hatR * 0.66, -hatH * 0.36);
  ctx.stroke();
  ctx.restore();

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

  slot.usedFb = false;
  const g = slot.g2d;
  const ctx = g.drawingContext;
  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Upper Monumental Scroll (`s05_song_upper_r3`: aged silk, `p5.brush` washes, monolith & 3-tier waterfall)
  const upperBg = getBakedUpperSongScroll(kit);
  ctx.drawImage(upperBg.canvas, 0, 0);

  // 2. 2x Supersampled Valley (`s05_song_valley_2x_r3`: 2000x1120 -> 1000x560 high-quality SSAA!)
  const valley2x = getBakedValley2x(kit);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    valley2x.canvas,
    0,
    0,
    PANEL_SIZE * 2,
    VALLEY_H * 2,
    0,
    VALLEY_Y0,
    PANEL_SIZE,
    VALLEY_H
  );
  ctx.restore();

  // 3. Living Northern Song Atmosphere: Shimmering 3-Tier Cascade Threads, Stream Foam & Mountain Cranes
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 250, 238, 0.68)';
  ctx.lineCap = 'round';
  ctx.lineWidth = 1.15;
  // Tier 1 shimmer (y = 154..252)
  for (let i = 0; i < 3; i++) {
    const u = ((t * 1.4 + i * 0.33) % 1);
    const wy = lerp(154, 244, u);
    const wx = lerp(659, 652, u) + (i - 1) * 2.4;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx - 0.8, wy + 13);
    ctx.stroke();
  }
  // Tier 2 shimmer (y = 272..392)
  for (let i = 0; i < 3; i++) {
    const u = ((t * 1.35 + i * 0.33 + 0.17) % 1);
    const wy = lerp(272, 384, u);
    const wx = lerp(664, 662, u) + (i - 1) * 2.8;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx - 0.5, wy + 15);
    ctx.stroke();
  }
  // Tier 3 shimmer (y = 414..538)
  for (let i = 0; i < 3; i++) {
    const u = ((t * 1.3 + i * 0.33 + 0.4) % 1);
    const wy = lerp(414, 526, u);
    const wx = lerp(653, 658, u) + (i - 1) * 3.0;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx + 0.6, wy + 16);
    ctx.stroke();
  }

  // Subtle drifting horizontal Song silk mist ribbons across the waist of the monolith
  const mistDrift = (localT - 3.0) * 10;
  for (const [mx, my, rx, ry, al] of [
    [658 + Math.sin(t * 1.3) * 6, 568, 76, 20, 0.28],
    [352 + mistDrift, 584, 168, 24, 0.24],
    [598 - mistDrift * 0.7, 594, 158, 22, 0.22],
  ]) {
    const mg = ctx.createLinearGradient(mx, my - ry, mx, my + ry);
    mg.addColorStop(0, 'rgba(235, 224, 198, 0.0)');
    mg.addColorStop(0.5, `rgba(235, 224, 198, ${al})`);
    mg.addColorStop(1, 'rgba(235, 224, 198, 0.0)');
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.moveTo(mx - rx, my + 2);
    ctx.bezierCurveTo(mx - rx * 0.45, my - ry, mx + rx * 0.45, my - ry * 0.85, mx + rx, my - 1);
    ctx.bezierCurveTo(mx + rx * 0.42, my + ry, mx - rx * 0.42, my + ry * 0.9, mx - rx, my + 2);
    ctx.closePath();
    ctx.fill();
  }

  // Animated Song `勾水纹` foaming stream threads around angular stream boulders
  ctx.strokeStyle = 'rgba(252, 246, 232, 0.66)';
  ctx.lineWidth = 1.1;
  const foamSpots = [
    [326, 788], [358, 812], [312, 845], [348, 878], [418, 836], [562, 868], [588, 912],
  ];
  for (let i = 0; i < foamSpots.length; i++) {
    const [rx, ry] = foamSpots[i];
    const dx = Math.sin(t * 2.8 + i * 1.3) * 4.5;
    ctx.beginPath();
    ctx.moveTo(rx - 11 + dx, ry);
    ctx.bezierCurveTo(rx - 3 + dx, ry - 2.6, rx + 4 + dx, ry + 2.0, rx + 11 + dx, ry + 0.4);
    ctx.stroke();
  }

  // Distant mountain cranes soaring beside the left cliff escarpment
  ctx.strokeStyle = 'rgba(30, 27, 23, 0.66)';
  ctx.lineWidth = 1.15;
  for (let c = 0; c < 3; c++) {
    const cx = 178 + c * 24 + localT * 6;
    const cy = 140 - c * 11 + Math.sin(t * 4 + c) * 2;
    const flap = Math.sin(t * 7 + c * 1.4) * 3.2;
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy + flap);
    ctx.quadraticCurveTo(cx - 2, cy - 2, cx, cy);
    ctx.quadraticCurveTo(cx + 2, cy - 2, cx + 6, cy + flap);
    ctx.stroke();
  }
  ctx.restore();

  // 4. Two Sculpted Miniature Pack Donkeys + Startled Song Mountain Drover
  const donkey1X = 360 + localT * 12;
  const donkey2X = 524 + localT * 12;
  drawMiniaturePackDonkey(ctx, donkey1X, t, false, pelicanLocalX);
  drawMiniaturePackDonkey(ctx, donkey2X, t, true, pelicanLocalX);

  // 5. Parametric Song Ink Pelican + Square-Timber Porter Bike + Woven Bamboo Hat (1.0 -> 0.18 -> 1.0)
  if (pelicanLocalX > -240 && pelicanLocalX < PANEL_SIZE + 240) {
    const px = pelicanLocalX;
    const { y: roadY, slope } = sampleSongTrail(px);

    const shrinkEnv = smootherstep(132, 238, px) * smootherstep(868, 762, px);
    const rigScale = isOutroThumbnail ? 0.22 : lerp(1.0, 0.18, shrinkEnv);
    const effWheelAngle = px / (46 * Math.max(0.28, rigScale) * 1.35);

    const rig = computePelicanRig({
      x: px,
      y: roadY,
      pedalAngle,
      wheelAngle: effWheelAngle,
      scale: rigScale,
      slope,
      speedScale,
      poseMode: 'normal',
      time: t,
    });

    drawSongPelicanAndBike(ctx, rig, localT);
  }

  // 6. ONLY Outro 7x3 Exhibition Wall Label Strip (`!isOutroThumbnail` modern UI card 100% removed per #85!)
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
