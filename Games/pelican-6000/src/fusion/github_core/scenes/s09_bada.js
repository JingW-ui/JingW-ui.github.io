// src/scenes/s09_bada.js
// #09 八大山人写意 (c. 1690 / 庚午, Zhu Da / Bada Shanren Freehand Xieyi Ink — r3 Museum Masterpiece)
// - >80% luminous warm antique raw-Xuan negative space ("计白当黑"), zero modern UI box inside painting
// - WebGL2 `p5.brush` Kubelka-Munk spectral watercolor (`fillBleed` capillary 宿墨 rims, cauliflower blooms,
//   dual-pigment granulation) + custom split-bristle wolf/goat-hair brush (`s09_bada_hao` + `charcoal`),
//   baked once via `fb.get().canvas` into `bake2D` offscreen caches (`slot.usedFb = false`, <10ms/frame, 100% Outro-safe!)
// - Right margin: NON-CLOSED angular overhanging Bada strange rock (侧锋折带皴险怪孤石, zero teardrop outline!)
//   + wet-into-wet splashed-ink wilted lotus (泼墨破墨残荷) + authentic `八大体` colophon, `哭之笑之` monogram & chipped seals
// - `y = 680` bold central raw-Xuan void with austere dry-brush slope-bank ink traces strictly anchoring [0,118] & [882,1000]
// - Bespoke boneless splashed-ink pelican (untouched raw-Xuan belly via paper pattern) + 3-stroke crooked old-plum/lotus-stalk
//   seal-script bike & single-stroke Feibai Enso wheels; Bar-2 deadpan square roll-eye ("白眼向青天")!

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  clamp,
  lerp,
  smoothstep,
} from '../beat/timeline.js';
import { computePelicanRig } from '../rig/pelican.js';
import {
  getInkPaper,
  INK_SHADES,
} from '../kit/ink.js';

/**
 * Evaluates a smooth Catmull-Rom spline through `pts` `[[x,y], ...]` for supple
 * center-tip seal-script brushwork (`篆籀中锋`).
 */
function sampleCatmullRom(pts, samplesPerSeg = 10) {
  if (pts.length <= 2) {
    if (pts.length < 2) return pts.slice();
    const out = [];
    for (let i = 0; i <= samplesPerSeg; i++) {
      const u = i / samplesPerSeg;
      out.push([lerp(pts[0][0], pts[1][0], u), lerp(pts[0][1], pts[1][1], u)]);
    }
    return out;
  }

  const out = [];
  const n = pts.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    const steps = i === n - 2 ? samplesPerSeg : samplesPerSeg - 1;
    for (let s = 0; s <= steps; s++) {
      const t = s / samplesPerSeg;
      const t2 = t * t;
      const t3 = t2 * t;
      const x =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const y =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      out.push([x, y]);
    }
  }
  return out;
}

/**
 * Registers Bada Shanren's split-tip goat/wolf-hair dry calligraphy brush (`散锋渴毫`)
 * once on the global `brush` instance.
 */
function ensureBadaCustomBrushes(brush, makePRNG) {
  if (!brush || typeof brush.box !== 'function' || typeof brush.add !== 'function') return false;
  const existing = brush.box();
  if (!existing.includes('s09_bada_hao')) {
    const rng = makePRNG(169009);
    brush.add('s09_bada_hao', {
      type: 'custom',
      weight: 5.5,
      scatter: 0.42,
      opacity: 185,
      spacing: 0.16,
      rotate: 'natural',
      markerTip: true,
      noise: 0.55,
      pressure: { curve: [0.22, 0.32], min_max: [1.22, 0.58] },
      tip: (m) => {
        m.fill(0);
        // Dense central锋颖 core + asymmetric peripheral split bristles for authentic 飞白!
        for (let i = 0; i < 22; i++) {
          const lane = (i / 21 - 0.5) * 2;
          const bx = lane * 24 + (rng() - 0.5) * 4.5;
          const by = (rng() - 0.5) * 11;
          const rw = (1.35 - Math.abs(lane) * 0.68) * (3.2 + rng() * 2.8);
          const rh = 1.6 + rng() * 2.4;
          m.ellipse(bx, by, rw * 2, rh * 2);
        }
      },
    });
  }
  if (!existing.includes('s09_bada_cefeng')) {
    const rng = makePRNG(169088);
    brush.add('s09_bada_cefeng', {
      type: 'custom',
      weight: 8.5,
      scatter: 0.65,
      opacity: 145,
      spacing: 0.22,
      rotate: 'natural',
      markerTip: false,
      noise: 0.72,
      pressure: { curve: [0.18, 0.45], min_max: [1.18, 0.45] },
      tip: (m) => {
        m.fill(0);
        // Broad oblique side-brush 折带皴/渴擦 scraper tip with ragged raw-paper gaps
        for (let i = 0; i < 28; i++) {
          if (i % 4 === 2 && rng() < 0.65) continue;
          const lane = (i / 27 - 0.5) * 2;
          const bx = lane * 34 + (rng() - 0.5) * 3.5;
          const by = lane * 7 + (rng() - 0.5) * 6.5;
          m.ellipse(bx, by, 3.0 + rng() * 4.2, 1.5 + rng() * 2.2);
        }
      },
    });
  }
  return true;
}

/**
 * Safely copies a baked `p5.Framebuffer` into a 2D canvas context via `fb.get().canvas`.
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
 * Draws an angular/eccentric Seal-script / dry-plum-branch brush stroke (`篆籀枯枝铁划`)
 * with tucked entry (`藏锋`), mid-stroke pause knots (`顿挫竹节`), and ragged multi-bristle
 * flying-white splits (`渴笔飞白`) — zero uniform geometric wire!
 */
function drawSealBrushStroke(ctx, ctrlPts, rng, {
  color = INK_SHADES.jiao,
  wStart = 5.2,
  wMid = 4.0,
  wEnd = 1.6,
  dryness = 0.34,
  dryStartU = 0.38,
  bristles = 7,
  alpha = 0.94,
  samplesPerSeg = 10,
  angularity = 0.0,
  rimStain = true,
} = {}) {
  if (ctrlPts.length < 2) return;
  const dense = angularity > 0.5
    ? sampleCatmullRom(ctrlPts, Math.max(4, Math.round(samplesPerSeg * 0.6)))
    : sampleCatmullRom(ctrlPts, samplesPerSeg);
  const n = dense.length;
  if (n < 2) return;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;

  const ph = rng() * Math.PI * 2;
  const widthAt = (u) => {
    const cadence = 1 + 0.19 * Math.sin(u * Math.PI * 3.1 + ph) + 0.09 * Math.cos(u * Math.PI * 6.7);
    const base = u < 0.44 ? lerp(wStart, wMid, u / 0.44) : lerp(wMid, wEnd, (u - 0.44) / 0.56);
    return Math.max(0.55, base * cadence);
  };

  // Faint raw-Xuan capillary bleed edge (`生宣水晕微渗`) on wetter entry half
  if (rimStain && dryness < 0.62) {
    ctx.strokeStyle = INK_SHADES.qing;
    for (let i = 0; i < Math.floor((n - 1) * 0.62); i += 2) {
      const u = i / (n - 1);
      if (rng() < dryness * 0.65) continue;
      ctx.globalAlpha = alpha * 0.14 * (1 - u);
      ctx.lineWidth = widthAt(u) * 1.48;
      ctx.beginPath();
      ctx.moveTo(dense[i][0], dense[i][1]);
      ctx.lineTo(dense[Math.min(n - 1, i + 2)][0], dense[Math.min(n - 1, i + 2)][1]);
      ctx.stroke();
    }
    ctx.strokeStyle = color;
  }

  // Core ink belly before brush splits into dry bristles
  for (let i = 0; i < n - 1; i++) {
    const u = i / (n - 1);
    const dryFactor = dryness > 0 && u > dryStartU ? (u - dryStartU) / (1 - dryStartU) : 0;
    if (dryFactor * dryness > 0.28 && rng() < dryFactor * dryness * 1.25) continue;

    ctx.globalAlpha = alpha * (1 - dryFactor * dryness * 0.54);
    ctx.lineWidth = widthAt(u) * (1 - dryFactor * dryness * 0.42);
    ctx.beginPath();
    ctx.moveTo(dense[i][0], dense[i][1]);
    ctx.lineTo(dense[i + 1][0], dense[i + 1][1]);
    ctx.stroke();
  }

  // Multi-bristle flying-white hair tracks (`飞白丝缕`)
  if (dryness > 0.08) {
    for (let b = 0; b < bristles; b++) {
      const lane = (b / Math.max(1, bristles - 1) - 0.5) + (rng() - 0.5) * 0.08;
      ctx.lineWidth = Math.max(0.55, (Math.max(wStart, wMid) / bristles) * (1.22 - dryness * 0.25));
      ctx.globalAlpha = alpha * (0.36 + (1 - Math.abs(lane)) * 0.48);
      ctx.beginPath();
      let down = false;
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1);
        const [px, py] = dense[i];
        const [qx, qy] = dense[Math.min(n - 1, i + 1)];
        const [rx, ry] = dense[Math.max(0, i - 1)];
        const tx = qx - rx;
        const ty = qy - ry;
        const tl = Math.hypot(tx, ty) || 1;
        const nx = -ty / tl;
        const ny = tx / tl;
        const spread = widthAt(u) * (0.88 + dryness * 0.40);
        const jitter = (rng() - 0.5) * 0.75 * dryness;
        const bx = px + nx * (lane * spread + jitter);
        const by = py + ny * (lane * spread + jitter);

        const gapProb = u > dryStartU * 0.65 ? dryness * (0.26 + 0.88 * u) : dryness * 0.14;
        if (i > 0 && rng() < gapProb) {
          down = false;
        } else if (!down) {
          ctx.moveTo(bx, by);
          down = true;
        } else {
          ctx.lineTo(bx, by);
        }
      }
      ctx.stroke();
    }
  }

  // Irregular 藏锋/顿笔 ink knot at entry (built with organic polygon, never geometric circle)
  ctx.globalAlpha = alpha * 0.88;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2;
    const rr = wStart * (0.38 + 0.18 * rng());
    const kx = dense[0][0] + Math.cos(a) * rr;
    const ky = dense[0][1] + Math.sin(a) * rr * 0.84;
    if (k === 0) ctx.moveTo(kx, ky);
    else ctx.lineTo(kx, ky);
  }
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Draws an irregular Bada `横点苔 / 顿节墨点` (crisp organic ink moss dot, zero `ctx.arc` circle!).
 */
function drawMossDab(ctx, x, y, rx, ry, rot, rng, color = INK_SHADES.jiao, alpha = 0.92) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  const lobes = 9;
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2;
    const rMod = 0.76 + 0.42 * rng();
    const px = Math.cos(a) * rx * rMod;
    const py = Math.sin(a) * ry * rMod;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Hand-stamped antique cinnabar seal (`朱砂印泥残破金石味`) with uneven fiber voids,
 * chipped stone corners, and faint oil halo — zero `fillRect` box!
 */
function drawAntiqueCinnabarSeal(ctx, cx, cy, w, h, rng, mode, strokesFn) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rng() - 0.5) * 0.035);

  const traceIrregularRim = (expand = 0) => {
    const hw = w * 0.5 + expand;
    const hh = h * 0.5 + expand;
    ctx.beginPath();
    if (mode === 'clog') {
      // Iconic Bada Shanren pinched wooden-clog contour (`木屐形印`)
      ctx.moveTo(-hw * 0.82, -hh * 0.90);
      ctx.quadraticCurveTo(0, -hh * 1.08, hw * 0.84, -hh * 0.88);
      ctx.quadraticCurveTo(hw * 1.06, -hh * 0.34, hw * 0.74, hh * 0.04);
      ctx.quadraticCurveTo(hw * 1.12, hh * 0.56, hw * 0.88, hh * 0.92);
      ctx.quadraticCurveTo(0, hh * 1.06, -hw * 0.88, hh * 0.90);
      ctx.quadraticCurveTo(-hw * 1.10, hh * 0.54, -hw * 0.74, hh * 0.04);
      ctx.quadraticCurveTo(-hw * 1.04, -hh * 0.36, -hw * 0.82, -hh * 0.90);
    } else {
      // Hand-chipped stone seal polygon (irregular weathered corners)
      const pts = [
        [-hw + 1.5, -hh + 0.6],
        [-hw * 0.2, -hh - 0.5],
        [hw - 1.8, -hh + 0.8],
        [hw + 0.4, -hh + 2.4],
        [hw - 0.5, hh * 0.25],
        [hw - 1.2, hh - 1.6],
        [hw * 0.3, hh + 0.4],
        [-hw + 1.8, hh - 0.7],
        [-hw - 0.4, hh * 0.15],
      ];
      pts.forEach(([px, py], idx) => {
        const jx = px + (rng() - 0.5) * 1.1;
        const jy = py + (rng() - 0.5) * 1.1;
        if (idx === 0) ctx.moveTo(jx, jy);
        else ctx.lineTo(jx, jy);
      });
    }
    ctx.closePath();
  };

  // Subtle linseed-oil warmth halo around old cinnabar paste
  ctx.fillStyle = 'rgba(188, 68, 42, 0.09)';
  traceIrregularRim(1.8);
  ctx.fill();

  if (mode === 'intaglio') {
    // 白文印: rich vermilion stone ground with carved raw-Xuan characters
    ctx.fillStyle = '#ac291d';
    traceIrregularRim(0);
    ctx.fill();

    // Darker aged cinnabar pooling near upper-left press
    ctx.save();
    traceIrregularRim(0);
    ctx.clip();
    drawMossDab(ctx, -w * 0.18, -h * 0.18, w * 0.42, h * 0.42, 0.3, rng, '#841910', 0.42);
    ctx.restore();

    ctx.strokeStyle = '#f6f1e3';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 1.9;
    strokesFn(ctx);
  } else {
    // 朱文印 / 木屐印: carved red relief rim & characters
    ctx.strokeStyle = '#b42c1f';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.4;
    traceIrregularRim(0);
    ctx.stroke();

    ctx.lineWidth = 1.75;
    strokesFn(ctx);
  }

  // Raw-Xuan paper fiber voids & stone-knife chips (`飞白印泥漏底与崩边`)
  ctx.fillStyle = '#f6f1e3';
  const chips = mode === 'clog' ? 24 : 18;
  for (let i = 0; i < chips; i++) {
    const cx0 = (rng() - 0.5) * (w + 2);
    const cy0 = (rng() - 0.5) * (h + 2);
    drawMossDab(ctx, cx0, cy0, 0.8 + rng() * 1.9, 0.5 + rng() * 1.2, rng() * Math.PI, rng, '#f6f1e3', 0.88);
  }

  ctx.restore();
}

/**
 * Bakes the clean antique raw-Xuan paper substrate (`洁净温润生宣留白底`) separately so
 * both the scroll background and the pelican's untouched-paper belly (`计白当黑`) share
 * the exact same raw mulberry fiber texture!
 */
function getBakedRawXuanSheet(kit) {
  return kit.bake2D('s09_raw_xuan_sheet_v3', (_g, ctx, rng) => {
    const paper = getInkPaper(kit, 'xieyi');
    ctx.drawImage(paper.canvas, 0, 0);

    // Warm museum raw-Xuan luminosity (`明净温润生宣象牙白`)
    const xuanGrad = ctx.createLinearGradient(0, 0, PANEL_SIZE, PANEL_SIZE);
    xuanGrad.addColorStop(0.0, 'rgba(252, 249, 240, 0.72)');
    xuanGrad.addColorStop(0.55, 'rgba(249, 244, 233, 0.67)');
    xuanGrad.addColorStop(1.0, 'rgba(242, 235, 220, 0.63)');
    ctx.fillStyle = xuanGrad;
    ctx.fillRect(0, 0, PANEL_SIZE, PANEL_SIZE);

    // Subtle organic mulberry-bark deckle fibers (curved tapering strands, zero ruler lines)
    ctx.lineCap = 'round';
    for (let i = 0; i < 460; i++) {
      const fx = rng() * PANEL_SIZE;
      const fy = rng() * PANEL_SIZE;
      const len = 7 + rng() * 24;
      const ang = rng() * Math.PI * 2;
      const bend = (rng() - 0.5) * 6.5;
      ctx.strokeStyle = rng() > 0.34
        ? `rgba(255, 253, 248, ${(0.28 + rng() * 0.25).toFixed(3)})`
        : `rgba(152, 134, 104, ${(0.045 + rng() * 0.055).toFixed(3)})`;
      ctx.lineWidth = 0.45 + rng() * 0.65;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo(
        fx + Math.cos(ang) * len * 0.5 - Math.sin(ang) * bend,
        fy + Math.sin(ang) * len * 0.5 + Math.cos(ang) * bend,
        fx + Math.cos(ang) * len,
        fy + Math.sin(ang) * len
      );
      ctx.stroke();
    }
  });
}

/**
 * Builds an irregular polygon around `(cx, cy)` for `p5.brush` Kubelka-Munk watercolor washes.
 */
function buildOrganicWashPoly(cx, cy, rx, ry, rot, rng, lobes = 16, asym = 0.34) {
  const pts = [];
  const p1 = rng() * Math.PI * 2;
  const p2 = rng() * Math.PI * 2;
  const c = Math.cos(rot);
  const sn = Math.sin(rot);
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2;
    const mod =
      1 +
      asym * 0.52 * Math.sin(a * 2 + p1) +
      asym * 0.34 * Math.cos(a * 3 + p2) +
      (rng() - 0.5) * asym * 0.55;
    const lx = Math.cos(a) * rx * mod;
    const ly = Math.sin(a) * ry * mod;
    pts.push([cx + lx * c - ly * sn, cy + lx * sn + ly * c]);
  }
  return pts;
}

/**
 * Bakes the static Bada Shanren raw-Xuan album leaf (`s09_bada_scroll_v3`):
 * - Uses `kit.bakeBrush` WebGL2 Kubelka-Munk watercolor (`fillBleed` + `fillTexture` + wet-on-wet)
 *   and custom `s09_bada_hao` / `s09_bada_cefeng` / `charcoal` brushes, composited via `multiply`
 *   onto the warm raw-Xuan substrate!
 * - Shatters the right boulder into a NON-CLOSED angular overhanging `折带皴` strange rock!
 * - Leaves >80% pure raw-Xuan void, with `y=680` broken in the middle yet strictly anchored at [0,118] & [882,1000]!
 * - Replaces the top-left modern card with upper-right `八大体` colophon + chipped seals!
 */
function getBakedBadaScroll(kit) {
  return kit.bake2D('s09_bada_scroll_v4', (_g, ctx, rng) => {
    const xuan = getBakedRawXuanSheet(kit);
    ctx.drawImage(xuan.canvas, 0, 0);

    // -------------------------------------------------------------------------
    // 1. WebGL2 `p5.brush` Physical Kubelka-Munk Watercolor & Dry-Bristle Layer
    // -------------------------------------------------------------------------
    let copiedBrush = false;
    if (kit.brush && typeof kit.bakeBrush === 'function') {
      const brushFb = kit.bakeBrush('s09_bada_brush_bg_v4', (p, brush, bRng) => {
        p.background(255, 255, 255);
        ensureBadaCustomBrushes(brush, kit.makePRNG);
        brush.noField();
        brush.noHatch();

        // (A) Wet-into-wet Splashed-Ink Wilted Lotus Leaf (`泼墨破墨舒展残荷`, x≈704..926, y≈286..396)
        brush.noStroke();
        // Layer 1: Sprawling pale pine-soot wet wash (`淡清墨润底`)
        brush.fill('#7c7466', 112);
        brush.fillBleed(0.34, 'out', 205);
        brush.fillTexture(0.86, 0.72, true, 0.24);
        brush.polygon(buildOrganicWashPoly(814, 340, 92, 34, -0.15, bRng, 18, 0.38));

        // Layer 2: Curled heavy soot left & upper-right lobes breaking into wet paper (`重墨破淡墨`)
        brush.fill('#35312a', 158);
        brush.fillBleed(0.27, 'out', 225);
        brush.fillTexture(0.88, 0.78, true, 0.22);
        brush.polygon(buildOrganicWashPoly(762, 352, 50, 24, -0.26, bRng, 15, 0.42));

        brush.fill('#2b2822', 164);
        brush.fillBleed(0.24, 'out', 35);
        brush.polygon(buildOrganicWashPoly(858, 324, 46, 21, 0.16, bRng, 14, 0.38));

        // Layer 3: Pooled `焦浓墨` at lotus leaf navel (`荷脐积墨宿晕`)
        brush.fill('#151310', 196);
        brush.fillBleed(0.16, 'out');
        brush.fillTexture(0.75, 0.82, true, 0.16);
        brush.polygon(buildOrganicWashPoly(814, 340, 24, 12, -0.08, bRng, 12, 0.30));

        // Tilted dry lotus pod (`枯莲房`) wash at (848, 234) — perch for the miniature Bada mynah!
        brush.fill('#6e6556', 124);
        brush.fillBleed(0.21, 'out');
        brush.polygon(buildOrganicWashPoly(848, 234, 16, 11, -0.34, bRng, 11, 0.24));

        // (B) NON-CLOSED Angular Overhanging Bada Strange Rock (`险怪孤石浓淡破墨块面`, x≈830..986, y≈682..858)
        // Upper square-shouldered overhanging rock table wash (leaving middle-left raw-Xuan breathing gap!)
        brush.fill('#847b6c', 96);
        brush.fillBleed(0.26, 'out', 195);
        brush.fillTexture(0.90, 0.76, true, 0.26);
        brush.polygon([
          [832, 704], [868, 686], [938, 685], [978, 700],
          [964, 742], [906, 748], [842, 730],
        ]);

        // Darker `宿墨` shadowed undercut facet beneath the overhanging shoulder (NOT a closed teardrop!)
        brush.fill('#3d3830', 142);
        brush.fillBleed(0.22, 'out', 240);
        brush.fillTexture(0.88, 0.80, true, 0.20);
        brush.polygon([
          [852, 726], [924, 720], [962, 748],
          [936, 788], [896, 774], [862, 752],
        ]);

        // Precarious narrow lower stone foot ink wash anchoring at (916, 856)
        brush.fill('#6e6659', 110);
        brush.fillBleed(0.20, 'out', 265);
        brush.polygon([
          [894, 788], [944, 784], [934, 836], [914, 858], [898, 826],
        ]);

        // Subtle dry bank tint at left [0, 110] and right [888, 1000] road anchors
        brush.fill('#988f7f', 68);
        brush.fillBleed(0.28, 'out', 0);
        brush.polygon([[0, 678], [108, 680], [82, 694], [0, 692]]);
        brush.polygon([[888, 682], [1000, 678], [1000, 694], [912, 696]]);

        brush.noFill();

        // (C) Custom Split-Bristle & Charcoal Calligraphic Strokes in WebGL2
        // Sweeping S-curved main lotus stalk (`中锋篆籀荷梗`)
        brush.set('s09_bada_hao', '#2f2c26', 1.05);
        brush.spline([
          [944, 688, 0.95],
          [965, 588, 0.82],
          [940, 480, 0.76],
          [884, 394, 0.72],
          [820, 344, 0.88],
        ], 0.55);

        // Companion dry slender lotus pod stalk arching gracefully to (852, 242)
        brush.set('s09_bada_hao', '#5e574c', 0.78);
        brush.spline([
          [968, 692, 0.85],
          [982, 558, 0.68],
          [952, 416, 0.62],
          [900, 304, 0.64],
          [852, 242, 0.80],
        ], 0.55);

        // Side-brush `折带皴` angular rock fractures & dry charcoal scuffing (open, broken, zero closed loop!)
        brush.set('s09_bada_cefeng', '#1f1d19', 1.0);
        brush.spline([[828, 724, 0.55], [842, 692, 1.0], [908, 685, 0.92], [974, 696, 0.52]], 0.25);
        brush.set('charcoal', '#26231e', 1.55);
        brush.spline([[832, 726, 0.85], [876, 756, 0.95], [886, 796, 0.62]], 0.2);
        brush.spline([[974, 704, 0.75], [958, 766, 0.92], [924, 834, 0.78], [914, 858, 0.48]], 0.22);
        brush.set('s09_bada_cefeng', '#454038', 0.78);
        brush.spline([[856, 738, 0.88], [912, 744, 0.72], [956, 728, 0.38]], 0.25);
        brush.spline([[888, 792, 0.82], [926, 798, 0.58], [946, 782, 0.35]], 0.25);

        // Broken `y = 680` slope-bank dry brush traces strictly anchoring [0, 118] & [882, 1000]!
        brush.set('s09_bada_cefeng', '#4c463e', 0.85);
        brush.spline([[0, ROAD_EDGE_Y, 1.0], [56, ROAD_EDGE_Y + 1.4, 0.78], [116, ROAD_EDGE_Y + 2.8, 0.28]], 0.3);
        brush.set('charcoal', '#6e675b', 1.25);
        brush.spline([[0, ROAD_EDGE_Y + 3.5, 0.85], [44, ROAD_EDGE_Y + 6.5, 0.52], [86, ROAD_EDGE_Y + 9.0, 0.22]], 0.3);

        // Faint middle breath whisper (`中段断白透气飞白微痕`)
        brush.set('charcoal', '#968e7f', 0.95);
        brush.spline([[452, ROAD_EDGE_Y + 0.8, 0.35], [496, ROAD_EDGE_Y - 0.6, 0.45], [538, ROAD_EDGE_Y + 1.1, 0.22]], 0.35);

        // Right exit slope-bank anchoring strictly at (1000, 680)
        brush.set('s09_bada_cefeng', '#37332c', 0.92);
        brush.spline([[882, ROAD_EDGE_Y + 3.0, 0.36], [942, ROAD_EDGE_Y + 0.8, 0.86], [1000, ROAD_EDGE_Y, 1.0]], 0.28);
      });

      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      copiedBrush = copyBrushFbTo2D(brushFb, ctx);
      ctx.restore();
    }

    // Fallback wash if running in mock headless Node test without WebGL
    if (!copiedBrush) {
      drawMossDab(ctx, 814, 340, 88, 30, -0.15, rng, 'rgba(92,86,76,0.45)', 1.0);
      drawMossDab(ctx, 905, 738, 56, 38, -0.2, rng, 'rgba(110,102,90,0.35)', 1.0);
    }

    // -------------------------------------------------------------------------
    // 2. Crisp Center-Tip Calligraphic Accents (`焦墨叶脉、折带皴铁骨、横点苔`)
    // -------------------------------------------------------------------------
    // Left [0, 118] & Right [882, 1000] crisp dry feibai bank reinforcement right on (0,680) & (1000,680)
    drawSealBrushStroke(ctx, [[0, ROAD_EDGE_Y], [54, ROAD_EDGE_Y + 1.0], [114, ROAD_EDGE_Y + 2.4]], rng, {
      color: INK_SHADES.zhong, wStart: 5.4, wMid: 3.8, wEnd: 1.1, dryness: 0.66, dryStartU: 0.15, bristles: 8,
    });
    drawSealBrushStroke(ctx, [[884, ROAD_EDGE_Y + 2.6], [944, ROAD_EDGE_Y + 0.8], [1000, ROAD_EDGE_Y]], rng, {
      color: INK_SHADES.nong, wStart: 1.4, wMid: 4.2, wEnd: 5.6, dryness: 0.62, dryStartU: 0.12, bristles: 8,
    });

    // Angular non-closed `折带皴` crisp bone strokes on the overhanging rock (zero closed teardrop!)
    // (1) Flat square-shouldered top ledge turning sharply down at left overhang (830, 724)
    drawSealBrushStroke(
      ctx,
      [[966, 695], [906, 684], [842, 690], [828, 724], [852, 746]],
      rng,
      { color: INK_SHADES.jiao, wStart: 3.2, wMid: 6.8, wEnd: 2.4, dryness: 0.56, dryStartU: 0.22, bristles: 8, angularity: 0.8 }
    );
    // (2) Stepped angular inner cleft cutting down toward the precarious narrow base (leaving gaps open!)
    drawSealBrushStroke(
      ctx,
      [[862, 748], [892, 766], [886, 804], [914, 856]],
      rng,
      { color: INK_SHADES.nong, wStart: 5.2, wMid: 4.2, wEnd: 2.2, dryness: 0.58, dryStartU: 0.18, bristles: 7, angularity: 0.8 }
    );
    // (3) Right angular step facet (broken off above the foot so raw Xuan breathes through!)
    drawSealBrushStroke(
      ctx,
      [[976, 704], [960, 760], [932, 792], [922, 836]],
      rng,
      { color: INK_SHADES.zhong, wStart: 4.6, wMid: 5.8, wEnd: 1.8, dryness: 0.62, dryStartU: 0.15, bristles: 7, angularity: 0.8 }
    );

    // Iconic Bada Shanren horizontal `焦墨` moss dots (`横点苔`) along rock table & left bank
    for (const [mx, my, rx, ry, rot] of [
      [34, 676, 4.6, 1.9, -0.06],
      [68, 678, 3.8, 1.6, 0.08],
      [854, 685, 5.8, 2.3, -0.08],
      [876, 681, 4.8, 2.0, -0.04],
      [914, 680, 6.2, 2.4, 0.05],
      [944, 686, 4.5, 1.9, 0.10],
      [832, 712, 4.8, 2.1, -0.18],
      [884, 762, 5.0, 2.0, -0.05],
      [906, 842, 4.4, 1.8, 0.08],
    ]) {
      drawMossDab(ctx, mx, my, rx, ry, rot, rng, INK_SHADES.jiao, 0.92);
    }

    // Supple calligraphic lotus leaf veins, curled ragged rim & stem thorns
    const leafVeins = [
      [[814, 340], [774, 334], [728, 346]],
      [[814, 340], [782, 356], [748, 376]],
      [[814, 340], [820, 360], [814, 382]],
      [[814, 340], [856, 336], [898, 338]],
      [[814, 340], [842, 318], [876, 306]],
    ];
    for (const lv of leafVeins) {
      drawSealBrushStroke(ctx, lv, rng, {
        color: INK_SHADES.jiao, wStart: 2.3, wMid: 1.5, wEnd: 0.65, dryness: 0.36, alpha: 0.80, rimStain: false,
      });
    }
    drawSealBrushStroke(ctx, [[720, 348], [754, 376], [796, 368]], rng, {
      color: INK_SHADES.jiao, wStart: 3.8, wMid: 2.8, wEnd: 1.1, dryness: 0.58,
    });
    // Stem thorns (irregular brush pricks, zero `ctx.arc`!)
    for (const [tx, ty, rot] of [[958, 620, 0.4], [953, 534, -0.3], [916, 440, 0.5], [860, 372, -0.4]]) {
      drawMossDab(ctx, tx, ty, 2.4, 1.2, rot, rng, INK_SHADES.jiao, 0.86);
    }
    // Tilted dry-ink lotus pod cup & seed dots at (848, 234)
    drawSealBrushStroke(ctx, [[834, 240], [837, 223], [858, 222], [863, 237], [846, 245]], rng, {
      color: INK_SHADES.jiao, wStart: 2.9, wMid: 2.3, wEnd: 1.5, dryness: 0.38,
    });
    for (const [sx, sy] of [[843, 229], [851, 229], [847, 235], [855, 234]]) {
      drawMossDab(ctx, sx, sy, 2.0, 1.6, 0.2, rng, INK_SHADES.jiao, 0.90);
    }

    // -------------------------------------------------------------------------
    // 3. Authentic Upper-Right `八大体` Colophon, Cipher Monogram & Chipped Seals
    //    (100% pure classical Chinese characters & seals; upper-left Xuan stays 100% empty!)
    // -------------------------------------------------------------------------
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Column 1 (Right, x≈952): Poetic theme "白眼向青天"
    const poemChars = ['白', '眼', '向', '青', '天'];
    for (let i = 0; i < poemChars.length; i++) {
      const cx = 952 + (i % 2 === 0 ? -1.8 : 2.2);
      const cy = 66 + i * 33;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((i % 2 === 0 ? -0.045 : 0.055) + (rng() - 0.5) * 0.02);
      ctx.scale(0.90 + (i % 3) * 0.04, 1.08 - (i % 2) * 0.05);
      ctx.fillStyle = i === 0 ? INK_SHADES.jiao : i < 3 ? INK_SHADES.nong : i === 3 ? INK_SHADES.zhong : INK_SHADES.dan;
      ctx.font = '500 25px "PelicanWenKai", "PelicanSerif", serif';
      ctx.fillText(poemChars[i], 0, 0);
      ctx.restore();
    }

    // Column 2 (Left, x≈910): Classical cyclical year & studio note "庚午涉事" (`庚午` = 1690)
    const dateChars = ['庚', '午', '涉', '事'];
    for (let i = 0; i < dateChars.length; i++) {
      const cx = 910 + (i % 2 === 0 ? 1.4 : -1.5);
      const cy = 104 + i * 25;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((i % 2 === 0 ? 0.04 : -0.05));
      ctx.scale(0.88, 1.05);
      ctx.fillStyle = i < 2 ? INK_SHADES.zhong : INK_SHADES.dan;
      ctx.font = '500 19px "PelicanWenKai", "PelicanSerif", serif';
      ctx.fillText(dateChars[i], 0, 0);
      ctx.restore();
    }
    ctx.restore();

    // Hand-brushed "八大山人" ("哭之笑之" cipher monogram) below Column 2 at x = 910, y = 216..288
    const sigX = 910;
    drawSealBrushStroke(ctx, [[sigX - 4, 214], [sigX - 8, 223], [sigX - 12, 230]], rng, {
      color: INK_SHADES.nong, wStart: 2.3, wMid: 1.8, wEnd: 0.9, dryness: 0.24, rimStain: false,
    });
    drawSealBrushStroke(ctx, [[sigX + 4, 213], [sigX + 8, 223], [sigX + 12, 231]], rng, {
      color: INK_SHADES.nong, wStart: 2.3, wMid: 1.9, wEnd: 1.0, dryness: 0.24, rimStain: false,
    });
    drawSealBrushStroke(ctx, [[sigX - 10, 240], [sigX, 239], [sigX + 10, 238]], rng, {
      color: INK_SHADES.jiao, wStart: 2.2, wMid: 1.7, wEnd: 1.3, dryness: 0.28, rimStain: false,
    });
    drawSealBrushStroke(ctx, [[sigX, 233], [sigX - 1, 256], [sigX - 8, 278], [sigX - 13, 290]], rng, {
      color: INK_SHADES.jiao, wStart: 2.5, wMid: 1.9, wEnd: 0.9, dryness: 0.34, rimStain: false,
    });
    drawSealBrushStroke(ctx, [[sigX - 7, 260], [sigX + 7, 259], [sigX + 6, 274], [sigX - 6, 275]], rng, {
      color: INK_SHADES.nong, wStart: 1.9, wMid: 1.6, wEnd: 1.2, dryness: 0.28, rimStain: false,
    });
    drawSealBrushStroke(ctx, [[sigX + 1, 274], [sigX + 9, 287], [sigX + 14, 295]], rng, {
      color: INK_SHADES.zhong, wStart: 2.0, wMid: 1.6, wEnd: 0.85, dryness: 0.38, rimStain: false,
    });

    // Seal #1: Hand-chipped Vermilion Intaglio Square Seal (`白文印 "涉事"`) at (910, 318)
    drawAntiqueCinnabarSeal(ctx, 910, 318, 26, 26, rng, 'intaglio', (sCtx) => {
      sCtx.beginPath();
      sCtx.moveTo(-7, -8); sCtx.lineTo(-7, 8);
      sCtx.moveTo(-1, -8); sCtx.lineTo(-1, 8);
      sCtx.moveTo(-9, 0); sCtx.lineTo(8, 0);
      sCtx.moveTo(6, -8); sCtx.lineTo(6, 8);
      sCtx.moveTo(2, -5); sCtx.lineTo(9, -5);
      sCtx.moveTo(2, 5); sCtx.lineTo(9, 5);
      sCtx.stroke();
    });

    // Seal #2: Iconic Bada Shanren Wooden-Clog Relief Seal (`木屐形朱文印`) at (952, 266)
    drawAntiqueCinnabarSeal(ctx, 952, 266, 24, 42, rng, 'clog', (sCtx) => {
      sCtx.beginPath();
      sCtx.moveTo(-5, -13); sCtx.lineTo(-8, -4);
      sCtx.moveTo(5, -13); sCtx.lineTo(8, -4);
      sCtx.moveTo(-7, 2); sCtx.lineTo(7, 2);
      sCtx.moveTo(0, -3); sCtx.lineTo(0, 16);
      sCtx.moveTo(-7, 15); sCtx.lineTo(-7, 8); sCtx.lineTo(7, 8); sCtx.lineTo(7, 15);
      sCtx.stroke();
    });

    // Seal #3: Subtle Lower-Left Collector / Leisure Corner Seal (`左下压角闲章`, balances vast Xuan void)
    drawAntiqueCinnabarSeal(ctx, 44, 926, 22, 28, rng, 'relief', (sCtx) => {
      sCtx.beginPath();
      sCtx.moveTo(-6, -8); sCtx.lineTo(6, -8); sCtx.lineTo(6, -1); sCtx.lineTo(-5, -1);
      sCtx.moveTo(0, -10); sCtx.lineTo(0, 10);
      sCtx.moveTo(-6, 5); sCtx.quadraticCurveTo(0, 10, 6, 5);
      sCtx.stroke();
    });
  });
}

/**
 * Pre-bakes a `1000x1000` `p5.brush` Dynamic Ink Component Atlas (`s09_bada_parts_atlas_v3`)
 * on a pure `#ffffff` ground so every frame can composite authentic WebGL2 Kubelka-Munk
 * splashed-ink washes (`宿墨回流花椰菜边 + 双色素沉淀`) and `s09_bada_hao` Feibai Enso wheels
 * onto `slot.g2d` via `multiply` in `< 5ms`!
 *
 * Atlas Layout (1000x1000):
 * - `[0,   0, 380, 240]` (center `190, 120`): Hunched Bird Back Splashed-Ink Mass (`泼墨破墨弓背墨团`)
 * - `[380, 0, 280, 240]` (center `520, 120`): Wet-Breaking Gular Pouch Wash (`浓淡相破微赭喉囊`)
 * - `[660, 0, 320, 240]` (center `820, 120`): Folded Wing Wet+Dry Ink Cluster (`泼墨飞白侧翼`)
 * - `[0,   260, 320, 320]` (center `160, 420`): Rear Single-Stroke Feibai Enso Wheel (`后轮枯墨飞白圆相`, r=88)
 * - `[320, 260, 320, 320]` (center `480, 420`): Front Single-Stroke Feibai Enso Wheel (`前轮枯墨飞白圆相`, r=88)
 * - `[640, 260, 320, 240]` (center `800, 380`): Flat-Topped Bada Crown Wet Cap (`耸顶扁方墨冠`)
 * - `[40,  600, 260, 220]` (center `170, 710`): Miniature Bada Mynah Splashed-Ink Body (`孤高缩颈浓墨小八哥墨团`)
 * - `[340, 600, 220, 200]` (center `450, 700`): Withered Broken-Ink Lotus Petal (`浓淡破墨残荷瓣`)
 */
function getBakedBadaPartsAtlas(kit) {
  return kit.bake2D('s09_bada_parts_atlas_v4', (_g, ctx, rng) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, PANEL_SIZE, PANEL_SIZE);

    let copied = false;
    if (kit.brush && typeof kit.bakeBrush === 'function') {
      const fb = kit.bakeBrush('s09_bada_parts_fb_v4', (p, brush, bRng) => {
        p.background(255, 255, 255);
        ensureBadaCustomBrushes(brush, kit.makePRNG);
        brush.noField();
        brush.noHatch();

        // 1. Tile A (center 190, 120): Hunched Bird Back (`泼墨破墨宿墨弓背`)
        brush.noStroke();
        brush.fill('#827a6c', 120);
        brush.fillBleed(0.32, 'out', 210);
        brush.fillTexture(0.88, 0.74, true, 0.24);
        brush.polygon(buildOrganicWashPoly(192, 124, 96, 46, -0.22, bRng, 16, 0.36));

        brush.fill('#2b2822', 176);
        brush.fillBleed(0.24, 'out', 165);
        brush.fillTexture(0.86, 0.80, true, 0.20);
        brush.polygon(buildOrganicWashPoly(176, 110, 72, 33, -0.16, bRng, 14, 0.40));

        brush.fill('#12110e', 202);
        brush.fillBleed(0.15, 'out');
        brush.polygon(buildOrganicWashPoly(162, 102, 42, 19, -0.10, bRng, 12, 0.32));

        brush.noFill();
        brush.set('s09_bada_cefeng', '#161411', 1.15);
        brush.spline([[264, 114, 0.75], [202, 84, 1.0], [134, 100, 0.88], [88, 126, 0.42]], 0.42);

        // 2. Tile B (center 520, 120): Wet-Breaking Warm Soot Gular Pouch (`微赭墨破重墨大喉囊`)
        brush.noStroke();
        brush.fill('#9a8973', 108);
        brush.fillBleed(0.30, 'out', 280);
        brush.fillTexture(0.85, 0.70, true, 0.25);
        brush.polygon(buildOrganicWashPoly(516, 118, 72, 38, 0.14, bRng, 15, 0.32));

        brush.fill('#474139', 148);
        brush.fillBleed(0.22, 'out', 310);
        brush.polygon(buildOrganicWashPoly(528, 130, 48, 23, -0.14, bRng, 13, 0.38));
        brush.noFill();

        // 3. Tile C (center 820, 120): Folded Wing Splash (`泼墨侧翼`)
        brush.noStroke();
        brush.fill('#302c26', 172);
        brush.fillBleed(0.25, 'out', 330);
        brush.fillTexture(0.86, 0.78, true, 0.20);
        brush.polygon(buildOrganicWashPoly(812, 118, 56, 30, 0.24, bRng, 14, 0.38));
        brush.noFill();
        brush.set('s09_bada_hao', '#14120f', 0.95);
        brush.spline([[766, 112, 0.92], [822, 132, 0.78], [884, 124, 0.35]], 0.35);

        // 4 & 5. Tiles D & E (centers 160,420 & 480,420): Single-Stroke Feibai Enso Ink Wheels (r = 88)
        for (const [wcx, wcy, seedShift] of [[160, 420, 0.0], [480, 420, 1.15]]) {
          const r = 88;
          const arcPts = [];
          const span = Math.PI * 1.48;
          for (let i = 0; i <= 14; i++) {
            const u = i / 14;
            const a = seedShift + u * span;
            const rad = r + Math.sin(a * 3 + seedShift) * 3.5;
            const pres = u < 0.25 ? lerp(1.05, 0.92, u / 0.25) : lerp(0.92, 0.26, (u - 0.25) / 0.75);
            arcPts.push([wcx + Math.cos(a) * rad, wcy + Math.sin(a) * rad, pres]);
          }
          brush.set('s09_bada_hao', '#171512', 1.38);
          brush.spline(arcPts, 0.55);

          // Dry split-bristle `飞白` tail across the remaining ~100 deg raw-paper gap!
          const tailPts = [];
          for (let i = 0; i <= 8; i++) {
            const u = i / 8;
            const a = seedShift + span - 0.14 + u * (Math.PI * 0.56);
            const rad = r + (bRng() - 0.5) * 4.5;
            tailPts.push([wcx + Math.cos(a) * rad, wcy + Math.sin(a) * rad, lerp(0.62, 0.18, u)]);
          }
          brush.set('charcoal', '#3b3730', 1.75);
          brush.spline(tailPts, 0.5);

          // 4 eccentric bamboo-flick spokes (`竹叶攒针辐条`)
          for (let k = 0; k < 4; k++) {
            const sa = seedShift + 0.35 + k * 1.56 + (k % 2 === 0 ? 0.08 : -0.07);
            const midA = sa + (k % 2 === 0 ? 0.16 : -0.15);
            brush.set('s09_bada_hao', k % 2 === 0 ? '#181613' : '#4a453c', 0.62);
            brush.spline([
              [wcx + Math.cos(sa) * 11, wcy + Math.sin(sa) * 11, 0.85],
              [wcx + Math.cos(midA) * (r * 0.52), wcy + Math.sin(midA) * (r * 0.52), 0.58],
              [wcx + Math.cos(sa) * (r - 7), wcy + Math.sin(sa) * (r - 7), 0.28],
            ], 0.45);
          }

          // Wet soot axle knot
          brush.noStroke();
          brush.fill('#161411', 205);
          brush.fillBleed(0.18, 'out');
          brush.polygon(buildOrganicWashPoly(wcx, wcy, 12, 10, seedShift, bRng, 10, 0.26));
          brush.noFill();
        }

        // 6. Tile F (center 800, 380): Flat-Topped Bada Crown Ink Cap (`耸顶扁方湿墨冠`)
        brush.noStroke();
        brush.fill('#1d1b17', 188);
        brush.fillBleed(0.24, 'out', 90);
        brush.fillTexture(0.84, 0.78, true, 0.18);
        brush.polygon(buildOrganicWashPoly(800, 380, 44, 18, -0.10, bRng, 13, 0.34));

        // 7. Tile G (center 170, 710): Miniature Grumpy Bada Mynah Splashed-Ink Blob (`孤高缩颈小八哥浓破淡墨团`)
        brush.fill('#766e60', 118);
        brush.fillBleed(0.28, 'out', 185);
        brush.fillTexture(0.86, 0.74, true, 0.22);
        brush.polygon(buildOrganicWashPoly(172, 712, 54, 38, -0.24, bRng, 14, 0.32));

        brush.fill('#23201b', 186);
        brush.fillBleed(0.20, 'out', 145);
        brush.fillTexture(0.84, 0.80, true, 0.18);
        brush.polygon(buildOrganicWashPoly(166, 704, 42, 28, -0.18, bRng, 13, 0.34));

        brush.fill('#11100d', 208);
        brush.fillBleed(0.14, 'out');
        brush.polygon(buildOrganicWashPoly(158, 698, 26, 17, -0.12, bRng, 11, 0.28));

        // 8. Tile H (center 450, 700): Withered Broken-Ink Lotus Petal (`浓淡破墨残荷瓣`)
        brush.fill('#8a7a64', 116);
        brush.fillBleed(0.25, 'out', 220);
        brush.fillTexture(0.86, 0.72, true, 0.22);
        brush.polygon(buildOrganicWashPoly(450, 700, 36, 14, -0.08, bRng, 14, 0.30));

        brush.fill('#2f2a23', 172);
        brush.fillBleed(0.18, 'out', 30);
        brush.polygon(buildOrganicWashPoly(466, 697, 20, 9, 0.12, bRng, 11, 0.34));
        brush.noFill();
      });
      copied = copyBrushFbTo2D(fb, ctx);
    }

    // Deterministic 2D bristle fallback if running outside WebGL
    if (!copied) {
      drawMossDab(ctx, 190, 120, 88, 40, -0.2, rng, 'rgba(36,33,28,0.82)', 1.0);
      drawMossDab(ctx, 520, 120, 66, 34, 0.12, rng, 'rgba(96,86,74,0.52)', 1.0);
      drawMossDab(ctx, 816, 120, 52, 26, 0.22, rng, 'rgba(40,36,30,0.78)', 1.0);
      drawMossDab(ctx, 800, 380, 40, 16, -0.1, rng, 'rgba(28,26,22,0.85)', 1.0);
      drawMossDab(ctx, 170, 710, 46, 31, -0.2, rng, 'rgba(26,24,20,0.86)', 1.0);
      drawMossDab(ctx, 450, 700, 32, 12, -0.08, rng, 'rgba(62,55,46,0.72)', 1.0);
    }

    // Reinforce crisp flying-white bristle hairs on both Enso wheel tiles so every rotation frame pops!
    for (const [wcx, wcy, seedShift] of [[160, 420, 0.0], [480, 420, 1.15]]) {
      const r = 88;
      const pts = [];
      for (let i = 0; i <= 22; i++) {
        const a = seedShift + (i / 22) * Math.PI * 1.44;
        const rad = r + Math.sin(a * 2.7 + seedShift) * 2.8;
        pts.push([wcx + Math.cos(a) * rad, wcy + Math.sin(a) * rad]);
      }
      drawSealBrushStroke(ctx, pts, rng, {
        color: INK_SHADES.jiao, wStart: 13.5, wMid: 9.8, wEnd: 3.4, dryness: 0.48, dryStartU: 0.48, bristles: 8, samplesPerSeg: 5,
      });
    }
  });
}

/**
 * Stamps a pre-baked `p5.brush` Enso ink wheel tile via `multiply` + crisp dry bristle accents.
 */
function drawBadaEnsoWheelFromAtlas(ctx, atlasCanvas, tileX, tileY, w, rotAngle, s, rng) {
  const scale = (w.r / 88) * 1.02;
  const drawSize = 320 * scale;
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.translate(w.x, w.y);
  ctx.rotate(rotAngle);
  ctx.drawImage(atlasCanvas, tileX, tileY, 320, 320, -drawSize * 0.5, -drawSize * 0.5, drawSize, drawSize);
  ctx.restore();

  // Faint dry soot ground-kiss brush dab right beneath wheel contact
  drawMossDab(ctx, w.x, w.y + w.r + 1.0 * s, 13 * s, 2.1 * s, -0.03, rng, 'rgba(72, 66, 58, 0.24)', 1.0);
}

/**
 * Draws an angular, gnarled Seal-script Bada bird leg & crab-claw crank (`篆隶铁爪与蟹爪曲柄`).
 */
function drawBadaLeg(ctx, bb, hipPt, kneePt, footPt, pedalPt, s, isFar, rng) {
  const inkCol = isFar ? INK_SHADES.zhong : INK_SHADES.jiao;

  // Crooked crab-claw calligraphic crank stroke (not a straight bar!)
  const midCrankX = (bb.x + pedalPt.x) * 0.5 + (isFar ? -3.0 : 3.4) * s;
  const midCrankY = (bb.y + pedalPt.y) * 0.5 - 2.6 * s;
  drawSealBrushStroke(
    ctx,
    [[bb.x, bb.y], [midCrankX, midCrankY], [pedalPt.x, pedalPt.y]],
    rng,
    { color: INK_SHADES.zhong, wStart: 4.2 * s, wMid: 2.8 * s, wEnd: 2.2 * s, dryness: 0.34, rimStain: false }
  );

  // Wiry Bada bird thigh & shin with knotted bamboo-joint ankle dab
  drawSealBrushStroke(
    ctx,
    [
      [hipPt.x, hipPt.y],
      [(hipPt.x + kneePt.x) * 0.5 - 3.6 * s, (hipPt.y + kneePt.y) * 0.5 + 1.8 * s],
      [kneePt.x, kneePt.y],
    ],
    rng,
    { color: inkCol, wStart: 5.8 * s, wMid: 3.6 * s, wEnd: 3.0 * s, dryness: 0.30 }
  );
  drawMossDab(ctx, kneePt.x, kneePt.y, 4.0 * s, 2.9 * s, 0.35, rng, inkCol, 0.94);

  drawSealBrushStroke(
    ctx,
    [
      [kneePt.x, kneePt.y],
      [(kneePt.x + footPt.x) * 0.5 + 2.4 * s, (kneePt.y + footPt.y) * 0.5],
      [footPt.x, footPt.y],
    ],
    rng,
    { color: inkCol, wStart: 3.6 * s, wMid: 2.6 * s, wEnd: 2.2 * s, dryness: 0.24 }
  );

  // Splayed 3-clawed Bada iron toes gripping bamboo-knot pedal
  const claws = [
    [[footPt.x - 2 * s, footPt.y], [footPt.x + 8 * s, footPt.y - 0.8 * s], [footPt.x + 16.5 * s, footPt.y + 2.4 * s]],
    [[footPt.x - 1 * s, footPt.y + 1 * s], [footPt.x + 6 * s, footPt.y + 4.2 * s], [footPt.x + 12.5 * s, footPt.y + 7.6 * s]],
    [[footPt.x - 1 * s, footPt.y + 1 * s], [footPt.x - 5.5 * s, footPt.y + 3.2 * s], [footPt.x - 9.5 * s, footPt.y + 5.6 * s]],
  ];
  for (const c of claws) {
    drawSealBrushStroke(ctx, c, rng, {
      color: inkCol, wStart: 2.6 * s, wMid: 1.8 * s, wEnd: 0.75 * s, dryness: 0.16, samplesPerSeg: 6, rimStain: false,
    });
  }

  drawSealBrushStroke(
    ctx,
    [[pedalPt.x - 8.5 * s, pedalPt.y + 2.6 * s], [pedalPt.x, pedalPt.y + 1.4 * s], [pedalPt.x + 9 * s, pedalPt.y + 2.4 * s]],
    rng,
    { color: INK_SHADES.nong, wStart: 4.8 * s, wMid: 3.8 * s, wEnd: 2.8 * s, dryness: 0.30, rimStain: false }
  );
}

/**
 * Draws the bespoke Bada Shanren Freehand Splashed-Ink Pelican & 3-Stroke Crooked Plum/Lotus-Stalk Bike:
 * - Zero modern steel diamond frame geometry, zero `ctx.arc` circles, zero uniform `rgba` spline blobs!
 * - Uses genuine `p5.brush` Kubelka-Munk washes via `multiply` + raw-Xuan paper pattern for "计白当黑" belly!
 */
function drawBadaPelicanAndBike(kit, ctx, rig, localT, pedalAngle, isOutroThumbnail) {
  const s = rig.root.scale;
  const rng = kit.makePRNG(9209);
  const xuanCanvas = getBakedRawXuanSheet(kit).canvas;
  const atlasCanvas = getBakedBadaPartsAtlas(kit).canvas;

  // Smoothly vanish posture & calligraphic cadence tweaks near frame edges (x<95 / x>905)
  const inPanel = isOutroThumbnail
    ? 1.0
    : smoothstep(45, 165, rig.root.x) * smoothstep(955, 835, rig.root.x);

  // 120 BPM calligraphic wrist cadence ("顿—掠—驻" 书家行笔微节律)
  const wristCadence = Math.sin(pedalAngle * 2.0 - 0.4) * 0.11 * inPanel;
  const breath = Math.sin(pedalAngle * 2.0) * inPanel;

  // Bar-2 Cold Disdainful Roll-Eye Freeze (`localT 2..4s`, peaking dead-on at 55.80s!)
  const bar2Peak = isOutroThumbnail
    ? 1.0
    : smoothstep(1.40, 1.98, localT) * (1 - 0.35 * smoothstep(4.25, 4.95, localT));
  const eyeRoll = clamp(0.46 + 0.54 * bar2Peak, 0, 1);

  ctx.save();

  // 1. Far Leg
  drawBadaLeg(ctx, rig.bb, rig.leftHip, rig.leftKnee, rig.leftFoot, rig.leftPedal, s, true, rng);

  // 2. Two Distinct `p5.brush` Single-Stroke Feibai Enso Ink Wheels (`一笔枯墨飞白圆相双轮`)
  drawBadaEnsoWheelFromAtlas(ctx, atlasCanvas, 0, 260, rig.rearWheel, rig.rearWheel.angle + wristCadence, s, rng);
  drawBadaEnsoWheelFromAtlas(ctx, atlasCanvas, 320, 260, rig.frontWheel, rig.frontWheel.angle + wristCadence * 1.05, s, rng);

  // 3. 3-Stroke Eccentric Bada Crooked Old-Plum / Wilted-Lotus-Stalk Bike (`三笔篆籀折枝车架`, ZERO modern tube look!)
  // Stroke I: Gnarled S-arched main spine sweeping from rear axle knot over bamboo-joint seat cluster to head knot
  const spineKnotX = lerp(rig.seatCluster.x, rig.headTop.x, 0.44);
  const spineKnotY = lerp(rig.seatCluster.y, rig.headTop.y, 0.44) - 9.5 * s;
  drawSealBrushStroke(
    ctx,
    [
      [rig.rearWheel.x + 4 * s, rig.rearWheel.y - 4 * s],
      [lerp(rig.rearWheel.x, rig.seatCluster.x, 0.54) - 7 * s, lerp(rig.rearWheel.y, rig.seatCluster.y, 0.54) - 11 * s],
      [rig.seatCluster.x - 1 * s, rig.seatCluster.y + 2 * s],
      [spineKnotX, spineKnotY],
      [rig.headTop.x + 1 * s, rig.headTop.y + 2 * s],
    ],
    rng,
    { color: INK_SHADES.nong, wStart: 4.2 * s, wMid: 7.2 * s, wEnd: 3.6 * s, dryness: 0.56, dryStartU: 0.26, bristles: 8 }
  );

  // Stroke II: Crooked undercut root/branch stroke from head knot dipping through BB knot toward rear hub (broken feibai!)
  drawSealBrushStroke(
    ctx,
    [
      [rig.headBot.x - 1 * s, rig.headBot.y + 2 * s],
      [lerp(rig.headBot.x, rig.bb.x, 0.48) + 6 * s, lerp(rig.headBot.y, rig.bb.y, 0.48) + 8 * s],
      [rig.bb.x, rig.bb.y],
      [lerp(rig.bb.x, rig.rearWheel.x, 0.55), lerp(rig.bb.y, rig.rearWheel.y, 0.55) + 5 * s],
      [rig.rearWheel.x + 12 * s, rig.rearWheel.y + 2 * s],
    ],
    rng,
    { color: INK_SHADES.zhong, wStart: 5.4 * s, wMid: 4.8 * s, wEnd: 1.4 * s, dryness: 0.62, dryStartU: 0.22, bristles: 8 }
  );

  // Stroke III: Gnarled plum-shoot front fork rising through head cluster into a hooked lotus-twig handlebar!
  drawSealBrushStroke(
    ctx,
    [
      [rig.frontWheel.x - 1 * s, rig.frontWheel.y - 2 * s],
      [lerp(rig.frontWheel.x, rig.headBot.x, 0.46) + 6.5 * s, lerp(rig.frontWheel.y, rig.headBot.y, 0.46) + 3 * s],
      [rig.headBot.x, rig.headBot.y],
      [rig.headTop.x, rig.headTop.y],
      [rig.stemTop.x + 4 * s, rig.stemTop.y - 5 * s],
      [rig.handleGrip.x - 2 * s, rig.handleGrip.y + 1 * s],
    ],
    rng,
    { color: INK_SHADES.jiao, wStart: 3.2 * s, wMid: 5.8 * s, wEnd: 3.2 * s, dryness: 0.46, dryStartU: 0.38, bristles: 7 }
  );

  // Short crooked bamboo seat-stub + juicy splashed-ink lotus-pod saddle + bamboo-node moss dabs (NO `ctx.arc` chainring!)
  drawSealBrushStroke(
    ctx,
    [[rig.bb.x, rig.bb.y], [lerp(rig.bb.x, rig.saddle.x, 0.55) - 4 * s, lerp(rig.bb.y, rig.saddle.y, 0.55)], [rig.saddle.x, rig.saddle.y]],
    rng,
    { color: INK_SHADES.jiao, wStart: 3.8 * s, wMid: 4.4 * s, wEnd: 2.8 * s, dryness: 0.44 }
  );
  drawSealBrushStroke(
    ctx,
    [[rig.saddle.x - 16 * s, rig.saddle.y + 2.5 * s], [rig.saddle.x, rig.saddle.y - 2.5 * s], [rig.saddle.x + 13 * s, rig.saddle.y + 1 * s]],
    rng,
    { color: INK_SHADES.jiao, wStart: 8.2 * s, wMid: 6.4 * s, wEnd: 3.0 * s, dryness: 0.28 }
  );
  // Broken dry-brush crank-ring flick (`残破枯笔轮盘意象` instead of `ctx.arc`!)
  drawSealBrushStroke(
    ctx,
    [
      [rig.bb.x + 11 * s, rig.bb.y - 3 * s],
      [rig.bb.x + 3 * s, rig.bb.y + 11 * s],
      [rig.bb.x - 10 * s, rig.bb.y + 4 * s],
      [rig.bb.x - 6 * s, rig.bb.y - 9 * s],
    ],
    rng,
    { color: INK_SHADES.dan, wStart: 2.8 * s, wMid: 2.2 * s, wEnd: 0.9 * s, dryness: 0.58, rimStain: false }
  );
  // Crisp bamboo-node `点苔` ink accents at branch intersections
  drawMossDab(ctx, spineKnotX, spineKnotY, 4.2 * s, 2.0 * s, -0.25, rng, INK_SHADES.jiao, 0.88);
  drawMossDab(ctx, rig.seatCluster.x, rig.seatCluster.y, 4.6 * s, 2.3 * s, 0.2, rng, INK_SHADES.jiao, 0.90);
  drawMossDab(ctx, rig.bb.x, rig.bb.y, 5.4 * s, 3.8 * s, -0.15, rng, INK_SHADES.jiao, 0.92);

  // 4. Bada Shanren Boneless Splashed-Ink Pelican (`缩颈弓背没骨怪鸟`)
  const hunchX = rig.bodyCenter.x - (8 + 2 * bar2Peak) * s * inPanel;
  const hunchY = rig.bodyCenter.y - (13 - 1.5 * breath) * s * inPanel;
  // Bar-2 neck recoil & proud haughty head cant!
  const headX = rig.head.x - (11 + 5.5 * bar2Peak) * s * inPanel;
  const headY = rig.head.y + (6 - 8.5 * bar2Peak) * s * inPanel;
  const headScale = 1.0 + 0.26 * inPanel;

  // (a) "计白当黑" Untouched Raw-Xuan Belly & Head Sclera Mask:
  // Uses `createPattern(xuanCanvas)` in world-locked panel space so bike branches behind the belly
  // are cleanly occluded by 100% authentic continuous raw-Xuan paper fibers (ZERO flat cream sticker!).
  const paperPattern = ctx.createPattern(xuanCanvas, 'no-repeat');
  ctx.save();
  ctx.fillStyle = paperPattern || '#f6f1e3';
  const bellyPoly = buildOrganicWashPoly(rig.bodyCenter.x + 8 * s, rig.bodyCenter.y + 4 * s, 41 * s, 24 * s, -0.22, rng, 14, 0.20);
  ctx.beginPath();
  bellyPoly.forEach(([bx, by], idx) => (idx === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by)));
  ctx.closePath();
  ctx.fill();

  const headMaskPoly = buildOrganicWashPoly(headX + 2 * s, headY - 1 * s, 19.5 * s * headScale, 16 * s * headScale, -0.10, rng, 12, 0.16);
  ctx.beginPath();
  headMaskPoly.forEach(([hx, hy], idx) => (idx === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy)));
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Single austere dry-brush contour whispering under the untouched raw-Xuan belly!
  drawSealBrushStroke(
    ctx,
    [
      [rig.chest.x + 12 * s, rig.chest.y + 3 * s],
      [rig.bodyCenter.x + 26 * s, rig.bodyCenter.y + (20 + 1.4 * breath) * s],
      [rig.hip.x - 6 * s, rig.hip.y + 14 * s],
      [rig.tailTip.x + 16 * s, rig.tailTip.y + 5 * s],
    ],
    rng,
    { color: INK_SHADES.dan, wStart: 2.0 * s, wMid: 3.4 * s, wEnd: 1.2 * s, dryness: 0.62, alpha: 0.78 }
  );

  // (b) Stamp `p5.brush` Kubelka-Munk Splashed-Ink Hunched Back (`泼墨破墨宿墨弓背`) via `multiply`!
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.translate(hunchX - 5 * s, hunchY - 4 * s);
  ctx.rotate(-0.08 * inPanel);
  ctx.drawImage(atlasCanvas, 0, 0, 380, 240, -96 * s, -62 * s, 192 * s, 124 * s);
  ctx.restore();

  // Bold dry side-brush dorsal spine & slashing crooked Bada tail-plumes (with subtle ink breath)
  drawSealBrushStroke(
    ctx,
    [
      [rig.chest.x - 4 * s, rig.chest.y - 6 * s],
      [hunchX + 3 * s, hunchY - 18 * s],
      [hunchX - 24 * s, hunchY - 9 * s],
      [rig.tailTip.x + 4 * s, rig.tailTip.y - 1 * s],
    ],
    rng,
    { color: INK_SHADES.jiao, wStart: 6.2 * s, wMid: 11.2 * s, wEnd: 4.0 * s, dryness: 0.54, dryStartU: 0.25, bristles: 8 }
  );
  const tailWave = breath * 2.2 * s;
  for (const ts of [
    [[hunchX - 28 * s, hunchY], [hunchX - 48 * s, hunchY + 1 * s], [rig.tailTip.x - 22 * s, rig.tailTip.y - 6 * s + tailWave]],
    [[hunchX - 26 * s, hunchY + 5 * s], [hunchX - 46 * s, hunchY + 7 * s], [rig.tailTip.x - 26 * s, rig.tailTip.y + 3 * s + tailWave * 0.8]],
    [[hunchX - 22 * s, hunchY + 9 * s], [hunchX - 38 * s, hunchY + 12 * s], [rig.tailTip.x - 11 * s, rig.tailTip.y + 10 * s + tailWave * 0.5]],
  ]) {
    drawSealBrushStroke(ctx, ts, rng, {
      color: INK_SHADES.jiao, wStart: 5.8 * s, wMid: 3.8 * s, wEnd: 0.9 * s, dryness: 0.56, dryStartU: 0.20,
    });
  }

  // (c) Supple Seal-Script Dry S-Curved Neck (`苍劲枯笔篆书 S 颈`)
  const neckSpine = [
    [rig.chest.x - 3 * s, rig.chest.y - 2 * s],
    [rig.neckC1.x + (4 - 12 * inPanel) * s, rig.neckC1.y + 3 * s * inPanel],
    [rig.neckC2.x - (15 + 3 * bar2Peak) * s * inPanel, rig.neckC2.y + 5 * s * inPanel],
    [headX - 9 * s, headY + 7 * s],
  ];
  drawSealBrushStroke(ctx, neckSpine, rng, {
    color: INK_SHADES.qing, wStart: 13 * s, wMid: 10.5 * s, wEnd: 9.5 * s, dryness: 0.35, alpha: 0.42, rimStain: false,
  });
  drawSealBrushStroke(ctx, neckSpine, rng, {
    color: INK_SHADES.nong, wStart: 6.8 * s, wMid: 4.8 * s, wEnd: 3.6 * s, dryness: 0.62, dryStartU: 0.16, bristles: 7,
  });

  // (d) Eccentric Flat-Topped Bada Crown (`p5.brush` Kubelka-Munk wet soot cap + 3 unruly hairs)
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.translate(headX - 3 * s, headY - 11.5 * s * headScale);
  ctx.rotate(-0.10);
  ctx.drawImage(
    atlasCanvas,
    640, 260, 320, 240,
    -42 * s * headScale, -30 * s * headScale, 84 * s * headScale, 60 * s * headScale
  );
  ctx.restore();

  drawSealBrushStroke(
    ctx,
    [
      [headX - 16 * s * headScale, headY + 4 * s],
      [headX - 16 * s * headScale, headY - 11 * s * headScale],
      [headX - 2 * s, headY - 14.5 * s * headScale],
      [headX + 12 * s * headScale, headY - 12 * s * headScale],
    ],
    rng,
    { color: INK_SHADES.jiao, wStart: 3.0 * s, wMid: 4.4 * s, wEnd: 2.0 * s, dryness: 0.44 }
  );
  for (const h of [
    [[headX - 10 * s * headScale, headY - 13 * s * headScale], [headX - 18 * s * headScale, headY - 19 * s * headScale], [headX - 26 * s * headScale, headY - 22 * s * headScale]],
    [[headX - 14 * s * headScale, headY - 9 * s * headScale], [headX - 22 * s * headScale, headY - 12 * s * headScale], [headX - 29 * s * headScale, headY - 13 * s * headScale]],
    [[headX - 15 * s * headScale, headY - 4 * s * headScale], [headX - 25 * s * headScale, headY - 5 * s * headScale]],
  ]) {
    drawSealBrushStroke(ctx, h, rng, {
      color: INK_SHADES.jiao, wStart: 2.0 * s, wMid: 1.4 * s, wEnd: 0.65 * s, dryness: 0.18, samplesPerSeg: 5, rimStain: false,
    });
  }

  // (e) Two-Stroke `焦墨破淡墨` Long Beak & `p5.brush` Kubelka-Munk Wet Gular Pouch
  const haughtyLift = -10.5 * bar2Peak * s * inPanel;
  const bTipX = rig.beakTip.x - 3 * s * inPanel;
  const bTipY = rig.beakTip.y + haughtyLift;
  const pouchX = rig.pouchBelly.x - 5 * s * inPanel;
  const pouchY = rig.pouchBelly.y + haughtyLift * 0.52 + breath * 1.8 * s;
  const beakStartX = headX + 12 * s * headScale;
  const beakStartY = headY - 5.5 * s * headScale;

  // Clip to pouch interior and stamp `p5.brush` warm-soot wet-breaking wash via `multiply`!
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(headX + 8 * s * headScale, headY + 7 * s * headScale);
  ctx.quadraticCurveTo(pouchX, pouchY + 8 * s, bTipX - 3 * s, bTipY + 2 * s);
  ctx.quadraticCurveTo(lerp(beakStartX, bTipX, 0.5), lerp(beakStartY, bTipY, 0.5) - 2 * s, beakStartX, beakStartY + 3 * s);
  ctx.closePath();
  ctx.clip();
  ctx.globalCompositeOperation = 'multiply';
  const pMidX = lerp(headX + 10 * s, bTipX, 0.48);
  const pMidY = lerp(headY + 4 * s, pouchY, 0.62);
  const pAng = Math.atan2(bTipY - beakStartY, bTipX - beakStartX);
  ctx.translate(pMidX, pMidY);
  ctx.rotate(pAng);
  ctx.drawImage(atlasCanvas, 380, 0, 280, 240, -68 * s, -48 * s, 136 * s, 96 * s);
  ctx.restore();

  // Lower pouch loose breaking `浓墨` dry-wet stroke
  drawSealBrushStroke(
    ctx,
    [
      [headX + 7 * s * headScale, headY + 8 * s * headScale],
      [lerp(headX + 8 * s, pouchX, 0.48), pouchY - 0.5 * s],
      [pouchX + 10 * s, pouchY - 4 * s],
      [bTipX - 3 * s, bTipY + 2.5 * s],
    ],
    rng,
    { color: INK_SHADES.nong, wStart: 3.2 * s, wMid: 5.8 * s, wEnd: 2.0 * s, dryness: 0.56, dryStartU: 0.26 }
  );

  // Upper mandible: Bold arched `焦墨` stroke + subtle haughty sneer line at gape in Bar 2!
  drawSealBrushStroke(
    ctx,
    [
      [beakStartX - 2 * s, beakStartY + 1.2 * bar2Peak * s],
      [lerp(beakStartX, bTipX, 0.36), lerp(beakStartY, bTipY, 0.36) - 5.8 * s],
      [lerp(beakStartX, bTipX, 0.76), lerp(beakStartY, bTipY, 0.76) - 4.2 * s],
      [bTipX + 1 * s, bTipY - 1.5 * s],
      [bTipX + 4.8 * s, bTipY + 5.8 * s],
      [bTipX - 2 * s, bTipY + 6.8 * s],
    ],
    rng,
    { color: INK_SHADES.jiao, wStart: 6.4 * s, wMid: 4.8 * s, wEnd: 1.9 * s, dryness: 0.38, dryStartU: 0.48 }
  );
  if (bar2Peak > 0.15) {
    // Subtle Bada disdainful mouth-corner curl (`嘴角冷蔑微撇`)
    drawSealBrushStroke(
      ctx,
      [
        [beakStartX - 4 * s, beakStartY + 4.5 * s],
        [beakStartX + 5 * s, beakStartY + 2.2 * s],
        [beakStartX + 14 * s, beakStartY + 3.8 * s],
      ],
      rng,
      { color: INK_SHADES.jiao, wStart: 2.6 * s, wMid: 1.8 * s, wEnd: 0.8 * s, dryness: 0.25, alpha: 0.85 * bar2Peak, rimStain: false }
    );
  }

  // (f) Near Leg on Front Pedal
  drawBadaLeg(ctx, rig.bb, rig.rightHip, rig.rightKnee, rig.rightFoot, rig.rightPedal, s, false, rng);

  // (g) Foreground Folded Wing (`p5.brush` wet splash via `multiply` + dry bristle primaries)
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.translate(lerp(rig.wingShoulder.x, rig.wingElbow.x, 0.56), lerp(rig.wingShoulder.y, rig.wingElbow.y, 0.56) + 2 * s);
  ctx.rotate(0.18);
  ctx.drawImage(atlasCanvas, 660, 0, 320, 240, -64 * s, -46 * s, 128 * s, 92 * s);
  ctx.restore();

  for (const ws of [
    [[rig.wingShoulder.x - 4 * s, rig.wingShoulder.y + 2 * s], [rig.wingElbow.x, rig.wingElbow.y + 6 * s], [rig.wingTip.x + 6 * s, rig.wingTip.y + 1 * s]],
    [[rig.wingElbow.x - 7 * s, rig.wingElbow.y + 8 * s], [lerp(rig.wingElbow.x, rig.wingTip.x, 0.5), rig.wingTip.y + 6 * s], [rig.wingTip.x + 1 * s, rig.wingTip.y + 5 * s]],
    [[rig.wingElbow.x - 11 * s, rig.wingElbow.y + 11 * s], [rig.wingTip.x - 6 * s, rig.wingTip.y + 9 * s]],
  ]) {
    drawSealBrushStroke(ctx, ws, rng, {
      color: INK_SHADES.jiao, wStart: 4.8 * s, wMid: 3.4 * s, wEnd: 1.2 * s, dryness: 0.48,
    });
  }

  // (h) ICONIC BADA SHANREN SQUARE COLD ROLL-EYE ("白眼向青天" 方形巨眼凝视!)
  ctx.save();
  const eyeCx = headX + 1.5 * s * headScale;
  const eyeCy = headY - 2.2 * s * headScale;
  const ew = (8.6 + 3.8 * eyeRoll) * s;
  const eh = (5.8 + 2.7 * eyeRoll) * s;

  ctx.translate(eyeCx, eyeCy);
  ctx.rotate(-0.10 - 0.09 * bar2Peak);

  // Clean raw-Xuan bright sclera inside the angular 4-stroke eye socket
  ctx.fillStyle = '#fcf9f0';
  ctx.beginPath();
  ctx.moveTo(-ew, -eh * 0.86);
  ctx.quadraticCurveTo(0, -eh * 1.06, ew * 0.98, -eh * 0.94);
  ctx.quadraticCurveTo(ew * 1.04, 0, ew, eh * 0.90);
  ctx.quadraticCurveTo(0, eh * 1.05, -ew * 0.94, eh * 0.95);
  ctx.quadraticCurveTo(-ew * 1.02, 0, -ew, -eh * 0.86);
  ctx.closePath();
  ctx.fill();

  // Four calligraphic brush strokes forming Bada's angular square eye frame (zero geometric rect!)
  drawSealBrushStroke(ctx, [[-ew - 2.0 * s, -eh * 0.80], [0, -eh * 1.04], [ew + 2.0 * s, -eh * 0.90]], rng, {
    color: INK_SHADES.jiao, wStart: 3.4 * s, wMid: 3.6 * s, wEnd: 2.6 * s, dryness: 0.22, samplesPerSeg: 6, rimStain: false,
  });
  drawSealBrushStroke(ctx, [[ew * 0.98, -eh * 0.92], [ew * 1.03, 0], [ew * 0.98, eh * 0.92]], rng, {
    color: INK_SHADES.jiao, wStart: 2.3 * s, wMid: 2.1 * s, wEnd: 2.0 * s, dryness: 0.26, samplesPerSeg: 5, rimStain: false,
  });
  drawSealBrushStroke(ctx, [[ew, eh * 0.90], [0, eh * 1.02], [-ew * 0.95, eh * 0.94]], rng, {
    color: INK_SHADES.nong, wStart: 2.2 * s, wMid: 1.9 * s, wEnd: 2.2 * s, dryness: 0.34, samplesPerSeg: 6, rimStain: false,
  });
  drawSealBrushStroke(ctx, [[-ew * 0.95, eh * 0.94], [-ew * 1.02, 0], [-ew, -eh * 0.84]], rng, {
    color: INK_SHADES.jiao, wStart: 2.2 * s, wMid: 2.0 * s, wEnd: 2.4 * s, dryness: 0.26, samplesPerSeg: 5, rimStain: false,
  });

  // Jet-black `焦墨` pupil jammed DEAD AGAINST the upper-front lid glaring up toward the perched mynah!
  const pupilRx = (3.6 + 0.6 * bar2Peak) * s;
  const pupilRy = (2.9 + 0.4 * bar2Peak) * s;
  const mutualAim = isOutroThumbnail
    ? 1.0
    : smoothstep(1.60, 2.05, localT) * (1 - smoothstep(4.60, 5.10, localT));
  const pupilX = lerp(0.8 * s, 2.9 * s, mutualAim > 0.05 ? mutualAim : eyeRoll * 0.4);
  const pupilY = -eh * 0.95 + pupilRy * 0.80;
  drawMossDab(ctx, pupilX, pupilY, pupilRx, pupilRy, -0.08, rng, INK_SHADES.jiao, 0.98);

  ctx.restore();
  ctx.restore();
}

/**
 * Evaluates the slow pendulum leaf-fall trajectory of the dislodged dry-ink lotus petal
 * (`浓淡破墨残荷瓣`, `localT = 2.45s -> 5.80s`), clearing the wilted lotus leaf, passing bicycle,
 * and overhanging rock to come softly to rest in the lower-right raw-Xuan void.
 */
const PETAL_FALL_WAYPOINTS = [
  [837, 242], // u = 0.00 (2.45s): clinging beneath tilted lotus pod at (848, 234)
  [784, 276], // u = 0.17 (2.80s..3.0s): Swing 1 leftward glide in pure Xuan above lotus leaf
  [698, 356], // u = 0.33 (3.30s): Swing 1 left apex, curling past left lotus leaf tip [720, 348]
  [812, 548], // u = 0.50 (3.82s): Swing 2 right swoop in open Xuan corridor ahead of bicycle
  [762, 736], // u = 0.67 (4.20s+): Swing 3 leftward arc into lower-right void below y=680 & left of rock
  [824, 818], // u = 0.83 (5.05s): Swing 4 gentle right drift under overhanging rock lip
  [796, 864], // u = 1.00 (5.80s): settles calmly onto lower-right raw-Xuan void
];

function sampleBadaFallingPetalPose(localT, isOutroThumbnail) {
  if (isOutroThumbnail) {
    return { x: 774, y: 282, rot: -0.44, scaleX: 0.96 };
  }
  const tDrop = 2.45;
  if (localT <= tDrop) {
    // Subtle pre-release quiver right as the perched mynah's claw twitches (`2.30s..2.45s`)
    const preQuiver = smoothstep(2.28, 2.45, localT) * Math.sin(localT * 58.0);
    return {
      x: 837 - preQuiver * 0.9,
      y: 242 + Math.abs(preQuiver) * 0.7,
      rot: -0.36 + preQuiver * 0.11,
      scaleX: 1.0,
    };
  }

  const rawU = clamp((localT - tDrop) / (5.80 - tDrop), 0, 1);
  // Crisp aerodynamic release glide so by t=55.80s (localT=2.80s, rawU=0.1045) the dislodged petal
  // floats clearly out in open raw-Xuan air at ~(778, 278), and by t=57.20s (rawU=0.5224) swings into ~(764, 734)!
  const releaseGlide = smoothstep(0.0, 0.14, rawU) * 0.18;
  const midSwing = smoothstep(0.08, 0.62, rawU) * 0.56 + smoothstep(0.32, 1.0, rawU) * 0.26;
  const splineU = clamp(releaseGlide + midSwing, 0, 1);

  const dense = sampleCatmullRom(PETAL_FALL_WAYPOINTS, 18);
  const maxIdx = dense.length - 1;
  const fIdx = splineU * maxIdx;
  const i0 = Math.min(maxIdx - 1, Math.floor(fIdx));
  const frac = fIdx - i0;
  const x = lerp(dense[i0][0], dense[i0 + 1][0], frac);
  const y = lerp(dense[i0][1], dense[i0 + 1][1], frac);

  const dx = dense[Math.min(maxIdx, i0 + 2)][0] - dense[Math.max(0, i0 - 1)][0];
  const settleFade = 1 - smoothstep(0.90, 1.0, rawU);
  // Boat-shaped dry petal banks upward into each horizontal swing turnaround
  const bankAngle = clamp(dx * 0.032, -0.58, 0.58) * settleFade + (-0.18) * (1 - settleFade);
  const flutterRoll = Math.sin(rawU * Math.PI * 5.2) * 0.16 * settleFade;

  return {
    x,
    y,
    rot: bankAngle + flutterRoll,
    scaleX: 1.0 - 0.18 * Math.abs(Math.sin(rawU * Math.PI * 4.0)) * settleFade,
  };
}

/**
 * Draws the dry-ink withered lotus petal (`浓淡破墨残荷瓣`) using pre-baked `p5.brush` Tile H
 * + crisp dry `篆籀渴笔` petal rim & veins (ZERO geometric primitives!).
 */
function drawBadaFallingPetal(kit, ctx, localT, isOutroThumbnail) {
  const rng = kit.makePRNG(9219);
  const atlasCanvas = getBakedBadaPartsAtlas(kit).canvas;
  const pose = sampleBadaFallingPetalPose(localT, isOutroThumbnail);

  ctx.save();
  ctx.translate(pose.x, pose.y);
  ctx.rotate(pose.rot);
  ctx.scale(pose.scaleX, 1.0);

  // 1. Stamp `p5.brush` Kubelka-Munk warm-soot + dark-tip broken-ink wash (`浓淡破墨残荷瓣`) via `multiply`
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(atlasCanvas, 340, 600, 220, 200, -48, -42, 96, 84);
  ctx.restore();

  // 2. Curved boat-like withered petal dorsal & ventral dry strokes (`渴笔勾瓣脊`)
  drawSealBrushStroke(
    ctx,
    [[-16, -2.5], [-4, 5.2], [9, 4.4], [18, -3.2]],
    rng,
    { color: INK_SHADES.jiao, wStart: 2.3, wMid: 3.1, wEnd: 1.2, dryness: 0.48, dryStartU: 0.24, bristles: 6, rimStain: false }
  );
  drawSealBrushStroke(
    ctx,
    [[-16, -2.2], [-3, -4.6], [10, -4.0], [18, -3.0]],
    rng,
    { color: INK_SHADES.zhong, wStart: 1.5, wMid: 2.0, wEnd: 0.9, dryness: 0.56, dryStartU: 0.18, bristles: 5, rimStain: false }
  );
  // Fine dry filament vein along petal belly
  drawSealBrushStroke(
    ctx,
    [[-11, -0.5], [1, 1.4], [13, -1.2]],
    rng,
    { color: INK_SHADES.nong, wStart: 1.1, wMid: 0.9, wEnd: 0.55, dryness: 0.42, samplesPerSeg: 5, rimStain: false }
  );
  // Crisp `焦墨` shriveled tip accent
  drawMossDab(ctx, 16.5, -2.8, 2.8, 1.5, -0.25, rng, INK_SHADES.jiao, 0.92);

  ctx.restore();
}

/**
 * Draws the grumpy Bada Shanren splashed-ink miniature mynah (`八大式孤高缩颈浓墨小八哥`)
 * perched atop the tilted dry lotus pod at `(848, 224)`:
 * - `localT < 1.6s`: faces away/aloof toward upper-right with tucked neck & half-shut drowsy eye.
 * - `localT ∈ [1.65s, 4.75s]`: jerks its head around & tilts `~42°` downward-left toward the passing
 *   bicycle, rolling an identical square-cornered deadpan white sclera eye right back at the pelican!
 * - `localT ≈ 2.45s`: sharp claw twitch on the lotus pod dislodges the clinging withered lotus petal!
 */
function drawBadaPerchedMynah(kit, ctx, localT, pelicanLocalX, isOutroThumbnail) {
  const rng = kit.makePRNG(9229);
  const xuanCanvas = getBakedRawXuanSheet(kit).canvas;
  const atlasCanvas = getBakedBadaPartsAtlas(kit).canvas;

  // Mutual-glare activation envelope (`localT ∈ [1.65s, 4.75s]`)
  const glareEnv = isOutroThumbnail
    ? 1.0
    : smoothstep(1.58, 1.88, localT) * (1 - smoothstep(4.72, 5.18, localT));

  // Sharp comedic bird-jerk overshoot on head snap (`localT ≈ 1.82s`) + peak glare claw-twitch (`localT ≈ 2.45s`)
  const headSnapJolt = isOutroThumbnail
    ? 0
    : Math.exp(-Math.pow((localT - 1.84) / 0.11, 2)) * 0.12;
  const clawTwitch = isOutroThumbnail
    ? 0
    : Math.exp(-Math.pow((localT - 2.45) / 0.085, 2));

  // Perch anchor right atop the tilted dry lotus pod `(848, 224)` (`x ≈ 830..885`)
  const perchX = 849;
  const perchY = 223;
  const bodyX = perchX + 1.5 - 2.5 * glareEnv;
  const bodyY = perchY - 19.5 - 1.6 * clawTwitch;

  ctx.save();

  // 1. Two wiry Seal-script twig legs & claws (`篆书双铁爪`) gripping the lotus pod rim
  const leftHip = [bodyX - 6.5, bodyY + 10.5];
  const leftFoot = [perchX - 8.5 - 1.2 * clawTwitch, perchY + 1.0 - 2.8 * clawTwitch];
  const rightHip = [bodyX + 5.0, bodyY + 10.0];
  const rightFoot = [perchX + 6.5, perchY - 0.5];

  drawSealBrushStroke(
    ctx,
    [leftHip, [lerp(leftHip[0], leftFoot[0], 0.5) - 1.6, lerp(leftHip[1], leftFoot[1], 0.5)], leftFoot],
    rng,
    { color: INK_SHADES.jiao, wStart: 2.3, wMid: 1.8, wEnd: 1.5, dryness: 0.24, samplesPerSeg: 5, rimStain: false }
  );
  drawSealBrushStroke(
    ctx,
    [rightHip, [lerp(rightHip[0], rightFoot[0], 0.5) + 1.4, lerp(rightHip[1], rightFoot[1], 0.5)], rightFoot],
    rng,
    { color: INK_SHADES.nong, wStart: 2.2, wMid: 1.7, wEnd: 1.4, dryness: 0.26, samplesPerSeg: 5, rimStain: false }
  );
  // Tiny splayed iron toes gripping pod edge (front claw flexes right at `localT ≈ 2.45s`!)
  for (const toe of [
    [[leftFoot[0], leftFoot[1]], [leftFoot[0] - 5.5, leftFoot[1] + 2.2 - 1.2 * clawTwitch]],
    [[leftFoot[0], leftFoot[1]], [leftFoot[0] - 1.5, leftFoot[1] + 3.6 - 1.0 * clawTwitch]],
    [[leftFoot[0], leftFoot[1]], [leftFoot[0] + 4.2, leftFoot[1] + 1.8]],
    [[rightFoot[0], rightFoot[1]], [rightFoot[0] - 4.2, rightFoot[1] + 2.2]],
    [[rightFoot[0], rightFoot[1]], [rightFoot[0] + 4.8, rightFoot[1] + 2.0]],
  ]) {
    drawSealBrushStroke(ctx, toe, rng, {
      color: INK_SHADES.jiao, wStart: 1.6, wMid: 1.2, wEnd: 0.65, dryness: 0.18, samplesPerSeg: 4, rimStain: false,
    });
  }

  // 2. "计白当黑" Untouched Raw-Xuan Breast/Belly Mask so pod rim behind belly stays pure mulberry paper
  const paperPattern = ctx.createPattern(xuanCanvas, 'no-repeat');
  ctx.save();
  ctx.fillStyle = paperPattern || '#f6f1e3';
  const bellyCx = lerp(bodyX + 3.5, bodyX - 4.5, glareEnv);
  const bellyPoly = buildOrganicWashPoly(bellyCx, bodyY + 4.8, 16.5, 11.5, lerp(0.18, -0.24, glareEnv), rng, 12, 0.18);
  ctx.beginPath();
  bellyPoly.forEach(([bx, by], idx) => (idx === 0 ? ctx.moveTo(bx, by) : ctx.lineTo(bx, by)));
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Whisper-dry lower belly contour stroke
  drawSealBrushStroke(
    ctx,
    [[bodyX - 13, bodyY + 8.5], [bodyX - 1, bodyY + 13.5], [bodyX + 12, bodyY + 9.5]],
    rng,
    { color: INK_SHADES.dan, wStart: 1.3, wMid: 1.9, wEnd: 1.0, dryness: 0.58, alpha: 0.72, rimStain: false }
  );

  // 3. Plump Wet-Ink Hunched Back Blob (`泼墨宿墨圆背团` from Tile G via `multiply`)
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.translate(bodyX, bodyY - 1.5);
  ctx.rotate(lerp(-0.18, 0.22, glareEnv));
  ctx.drawImage(atlasCanvas, 40, 600, 260, 220, -44, -36, 88, 72);
  ctx.restore();

  // Crisp dry side-brush hunched shoulder & brisk Bada cropped mynah tail flick (`八哥齐尾浓墨撇`)
  // When facing away (`glareEnv=0`), tail flicks lower-left (`826, 213`); when glaring down-left (`glareEnv=1`),
  // body & tail pivot so stubby tail flicks upper-right (`879, 194`, strictly <= 885!)
  const tailDirX = lerp(-1.0, 1.0, glareEnv);
  const tailBaseX = bodyX + tailDirX * 13.5;
  const tailBaseY = bodyY + lerp(3.5, -2.5, glareEnv);
  const tailTipX = bodyX + tailDirX * 29.5;
  const tailTipY = bodyY + lerp(11.5, -9.5, glareEnv) - 2.0 * clawTwitch;

  drawSealBrushStroke(
    ctx,
    [
      [bodyX - tailDirX * 11, bodyY - 8.5],
      [bodyX, bodyY - 12.5],
      [tailBaseX, tailBaseY - 2.0],
    ],
    rng,
    { color: INK_SHADES.jiao, wStart: 3.4, wMid: 5.4, wEnd: 2.6, dryness: 0.48, dryStartU: 0.24, bristles: 6 }
  );
  for (const [dy0, dy1, w0] of [[0, -2.2, 4.2], [3.0, 1.8, 3.4]]) {
    drawSealBrushStroke(
      ctx,
      [[tailBaseX, tailBaseY + dy0], [lerp(tailBaseX, tailTipX, 0.55), lerp(tailBaseY, tailTipY, 0.55) + dy0 * 0.6], [tailTipX, tailTipY + dy1]],
      rng,
      { color: INK_SHADES.jiao, wStart: w0, wMid: w0 * 0.78, wEnd: 1.1, dryness: 0.52, dryStartU: 0.20, bristles: 6, rimStain: false }
    );
  }

  // 4. Tucked Grumpy Head (`缩颈耸肩圆扁头`):
  //    - Before 1.6s (`glareEnv = 0`): tucked facing upper-right (`dir = +1`, pitch `-16°` aloof skyward)
  //    - During [1.65s, 4.75s] (`glareEnv = 1`): whips to face left (`dir = -1`) and tilts `~42°` (`0.73 rad`)
  //      DOWNWARD toward the passing bicycle (subtly tracking `pelicanLocalX` from 38° -> 47°)!
  const trackSteep = isOutroThumbnail ? 0.0 : clamp((pelicanLocalX - 420) / 420, -0.10, 0.14);
  const downwardTiltRad = 0.73 + trackSteep + headSnapJolt; // ~42° downward toward passing bicycle!

  const headCx = lerp(bodyX + 8.5, bodyX - 13.5, glareEnv);
  const headCy = lerp(bodyY - 12.5, bodyY - 4.5, glareEnv) - 1.2 * clawTwitch;

  // Mask head interior with raw-Xuan paper pattern so the square white eye shines pure & crisp
  ctx.save();
  ctx.fillStyle = paperPattern || '#fcf9f0';
  const hMask = buildOrganicWashPoly(headCx, headCy, 11.5, 9.8, lerp(-0.2, 0.35, glareEnv), rng, 11, 0.15);
  ctx.beginPath();
  hMask.forEach(([hx, hy], idx) => (idx === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy)));
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  if (glareEnv < 0.45) {
    // --- ALOOF POSE (`localT < 1.6s` or `> 5.0s`): Facing away upper-right with half-shut drowsy eye ---
    ctx.save();
    ctx.translate(headCx, headCy);
    ctx.rotate(-0.28); // aloof upward-right cant

    // Flat-topped dark soot mynah cap & nape
    drawMossDab(ctx, -1.5, -5.8, 10.5, 4.8, -0.08, rng, INK_SHADES.jiao, 0.94);
    drawSealBrushStroke(ctx, [[-10.5, 3.0], [-9.5, -6.5], [1.5, -8.2], [9.5, -5.5]], rng, {
      color: INK_SHADES.jiao, wStart: 2.6, wMid: 3.4, wEnd: 1.8, dryness: 0.36, rimStain: false,
    });
    // Tiny `八哥` nasal crest bristle tuft (`额前冠羽`)
    drawMossDab(ctx, 9.2, -5.6, 2.8, 1.6, -0.55, rng, INK_SHADES.jiao, 0.90);

    // Conical mynah beak pointing aloof upper-right
    drawSealBrushStroke(ctx, [[8.5, -3.5], [15.5, -3.2], [20.5, -1.5]], rng, {
      color: INK_SHADES.jiao, wStart: 3.0, wMid: 2.1, wEnd: 0.85, dryness: 0.25, samplesPerSeg: 5, rimStain: false,
    });
    drawSealBrushStroke(ctx, [[8.0, -0.4], [14.5, -0.5], [19.2, -1.0]], rng, {
      color: INK_SHADES.nong, wStart: 2.0, wMid: 1.5, wEnd: 0.7, dryness: 0.30, samplesPerSeg: 5, rimStain: false,
    });

    // Half-shut aloof drowsy eye (`半阖冷眼扁缝`)
    ctx.fillStyle = '#fcf9f0';
    ctx.beginPath();
    ctx.moveTo(-3.8, -1.6);
    ctx.lineTo(4.2, -1.8);
    ctx.lineTo(3.8, 1.3);
    ctx.lineTo(-3.6, 1.2);
    ctx.closePath();
    ctx.fill();
    drawSealBrushStroke(ctx, [[-4.8, -1.6], [0.2, -2.0], [5.0, -1.5]], rng, {
      color: INK_SHADES.jiao, wStart: 2.3, wMid: 2.5, wEnd: 1.8, dryness: 0.20, samplesPerSeg: 5, rimStain: false,
    });
    drawSealBrushStroke(ctx, [[-4.0, 1.2], [0.2, 1.5], [4.2, 1.0]], rng, {
      color: INK_SHADES.zhong, wStart: 1.3, wMid: 1.2, wEnd: 1.1, dryness: 0.32, samplesPerSeg: 5, rimStain: false,
    });
    drawMossDab(ctx, 1.2, -0.5, 1.9, 1.2, 0, rng, INK_SHADES.jiao, 0.92);

    ctx.restore();
  } else {
    // --- MUTUAL DEADPAN GLARE (`localT ∈ [1.65s, 4.75s]`): Facing left, tilted ~42° DOWNWARD at bicycle! ---
    const openAmt = smoothstep(0.45, 0.92, glareEnv);
    const headPitch = lerp(-0.22, -downwardTiltRad, openAmt); // negative angle pitches -X beak ~42° DOWNWARD-LEFT!

    ctx.save();
    ctx.translate(headCx, headCy);
    ctx.rotate(headPitch);

    // Flat-topped Bada soot cap & bristling grumpy crown hairs (`怒耸扁方墨冠`)
    drawMossDab(ctx, 1.5, -6.4, 11.2, 5.0, 0.08, rng, INK_SHADES.jiao, 0.95);
    drawSealBrushStroke(ctx, [[11.0, 3.2], [10.0, -6.8], [-1.5, -8.8], [-10.2, -5.8]], rng, {
      color: INK_SHADES.jiao, wStart: 2.6, wMid: 3.6, wEnd: 2.0, dryness: 0.34, rimStain: false,
    });
    // Bristled `八哥` crest tuft (`八哥额羽怒竖`) + 2 unruly crown hairs
    for (const ch of [
      [[-8.5, -5.5], [-11.5, -9.8], [-13.5, -12.2]],
      [[-5.5, -7.2], [-6.8, -11.8]],
      [[5.5, -7.8], [9.5, -11.5]],
    ]) {
      drawSealBrushStroke(ctx, ch, rng, {
        color: INK_SHADES.jiao, wStart: 1.7, wMid: 1.2, wEnd: 0.6, dryness: 0.18, samplesPerSeg: 4, rimStain: false,
      });
    }

    // Grumpy 2-stroke conical mynah beak (`焦墨八哥短铁喙`) pointing ~42° downward-left at the pelican!
    drawSealBrushStroke(ctx, [[-9.0, -3.6], [-16.8, -3.0], [-22.5, -0.8]], rng, {
      color: INK_SHADES.jiao, wStart: 3.3, wMid: 2.3, wEnd: 0.9, dryness: 0.24, samplesPerSeg: 5, rimStain: false,
    });
    drawSealBrushStroke(ctx, [[-8.5, 0.2], [-15.5, 0.0], [-21.0, -0.4]], rng, {
      color: INK_SHADES.nong, wStart: 2.1, wMid: 1.6, wEnd: 0.75, dryness: 0.28, samplesPerSeg: 5, rimStain: false,
    });

    // IDENTICAL SQUARE-CORNERED DEADPAN WHITE SCLERA EYE (`八大方框冷白眼回敬` — ZERO `ctx.arc`!)
    const ew = lerp(4.8, 7.2, openAmt);
    const eh = lerp(2.6, 5.3, openAmt);
    ctx.save();
    ctx.translate(-1.2, -0.8);

    // Stark luminous raw-Xuan white sclera filling the angular 4-stroke eye frame
    ctx.fillStyle = '#fcf9f0';
    ctx.beginPath();
    ctx.moveTo(-ew, -eh * 0.88);
    ctx.quadraticCurveTo(0, -eh * 1.05, ew * 0.98, -eh * 0.92);
    ctx.quadraticCurveTo(ew * 1.04, 0, ew, eh * 0.92);
    ctx.quadraticCurveTo(0, eh * 1.04, -ew * 0.95, eh * 0.94);
    ctx.quadraticCurveTo(-ew * 1.02, 0, -ew, -eh * 0.88);
    ctx.closePath();
    ctx.fill();

    // 4 crisp calligraphic brush strokes forming the miniature Bada square eye socket
    drawSealBrushStroke(ctx, [[-ew - 1.4, -eh * 0.84], [0, -eh * 1.04], [ew + 1.4, -eh * 0.90]], rng, {
      color: INK_SHADES.jiao, wStart: 2.3, wMid: 2.5, wEnd: 1.9, dryness: 0.20, samplesPerSeg: 5, rimStain: false,
    });
    drawSealBrushStroke(ctx, [[ew * 0.98, -eh * 0.90], [ew * 1.03, 0], [ew * 0.96, eh * 0.92]], rng, {
      color: INK_SHADES.jiao, wStart: 1.7, wMid: 1.6, wEnd: 1.5, dryness: 0.24, samplesPerSeg: 4, rimStain: false,
    });
    drawSealBrushStroke(ctx, [[ew * 0.96, eh * 0.92], [0, eh * 1.02], [-ew * 0.96, eh * 0.94]], rng, {
      color: INK_SHADES.nong, wStart: 1.7, wMid: 1.5, wEnd: 1.7, dryness: 0.30, samplesPerSeg: 5, rimStain: false,
    });
    drawSealBrushStroke(ctx, [[-ew * 0.96, eh * 0.94], [-ew * 1.02, 0], [-ew, -eh * 0.86]], rng, {
      color: INK_SHADES.jiao, wStart: 1.8, wMid: 1.6, wEnd: 1.9, dryness: 0.24, samplesPerSeg: 4, rimStain: false,
    });

    // Jet-black `焦墨` pupil jammed tightly into the front-lower corner so ~78% of the square eye
    // glares pure deadpan white sclera ("翻大白眼") straight down along the 42° sightline at the pelican!
    const pTrackX = clamp((pelicanLocalX - 500) * 0.004, -1.0, 1.4);
    const pupilX = -ew * 0.56 + pTrackX;
    const pupilY = eh * 0.50;
    drawMossDab(ctx, pupilX, pupilY, 2.35, 1.95, 0.12, rng, INK_SHADES.jiao, 0.99);

    ctx.restore();
    ctx.restore();
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

  // Keep `slot.usedFb = false` so both `main.js` and `outro.js` sample 100% of our baked `p5.brush` layers via `slot.g2d`!
  slot.usedFb = false;
  const g = slot.g2d;
  const ctx = g.drawingContext;
  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 1. Baked Luminous Raw-Xuan Bada Album Leaf (`>80%` pure negative space + `p5.brush` Kubelka-Munk washes)
  const bg = getBakedBadaScroll(kit);
  ctx.drawImage(bg.canvas, 0, 0);

  // 2. Perched Grumpy Miniature Bada Mynah (`八大式孤高缩颈浓墨小八哥`) & Dislodged Withered Ink Lotus Petal (`泼墨残荷落瓣`)
  drawBadaFallingPetal(kit, ctx, localT, isOutroThumbnail);
  drawBadaPerchedMynah(kit, ctx, localT, pelicanLocalX, isOutroThumbnail);

  // 3. Bespoke Bada Splashed-Ink Pelican & 3-Stroke Crooked Plum/Lotus-Stalk Bicycle
  if (pelicanLocalX > -240 && pelicanLocalX < PANEL_SIZE + 240) {
    const { y: roadY, slope } = kit.sampleRoad(clamp(pelicanLocalX, 0, PANEL_SIZE), 0);
    const rig = computePelicanRig({
      x: pelicanLocalX,
      y: roadY,
      pedalAngle,
      scale: 1.0,
      slope,
      speedScale,
      poseMode: 'bada_eye',
      time: t,
    });
    drawBadaPelicanAndBike(kit, ctx, rig, localT, pedalAngle, isOutroThumbnail);
  }

  // 3. No modern UI card in main scroll (`wallPlacard` sits outside frame); preserve Outro 7x3 wall label!
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(20, 18, 15, 0.78)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.fillStyle = '#f5f0e6';
    ctx.font = '700 48px "PelicanSerif", serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} ${scene.zh}`, 36, PANEL_SIZE - 48);
  }

  ctx.restore();
}
