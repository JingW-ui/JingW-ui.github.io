// src/kit/ink.js
// Shared Chinese Ink-Wash Rendering Foundation for Scenes #3, #4, #5, #6, #9:
// Procedural Xuan paper / silk grain, five-shade ink tones (焦浓重淡清),
// dry-brush flying white (飞白), and wet halo diffusion (晕染).

import { PANEL_SIZE } from '../beat/timeline.js';

export const INK_SHADES = {
  jiao: '#11100e', // 焦墨
  nong: '#22201c', // 浓墨
  zhong: '#45413a', // 重墨
  dan: '#7d776b', // 淡墨
  qing: '#b8b1a3', // 清墨
};

/**
 * Bakes a reusable 1000x1000 Xuan paper / aged silk / stone-rubbing substrate via `kit.bake2D`.
 */
export function getInkPaper(kit, mode = 'xuan') {
  return kit.bake2D(`ink_paper_${mode}`, (g, ctx, rng) => {
    if (mode === 'rubbing') {
      // Han stone relief rubbing ground: deep charcoal soot with mottled un-inked stone pits (石花)
      ctx.fillStyle = '#181715';
      ctx.fillRect(0, 0, PANEL_SIZE, PANEL_SIZE);

      // Subtle mottled stone grain
      for (let i = 0; i < 1800; i++) {
        const px = rng() * PANEL_SIZE;
        const py = rng() * PANEL_SIZE;
        const r = 0.6 + rng() * 2.8;
        const a = 0.04 + rng() * 0.14;
        ctx.fillStyle = `rgba(232, 226, 213, ${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      }
      // Fine stone fissure lines
      ctx.strokeStyle = 'rgba(238, 232, 220, 0.22)';
      ctx.lineWidth = 1.1;
      for (let k = 0; k < 18; k++) {
        let cx = rng() * PANEL_SIZE;
        let cy = rng() * PANEL_SIZE;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        for (let s = 0; s < 6; s++) {
          cx += (rng() - 0.45) * 55;
          cy += (rng() - 0.45) * 55;
          ctx.lineTo(cx, cy);
        }
        ctx.stroke();
      }
      return;
    }

    // Warm Xuan paper / aged Song-Tang silk base
    const baseGrad = ctx.createLinearGradient(0, 0, PANEL_SIZE, PANEL_SIZE);
    if (mode === 'shanshui' || mode === 'jiehua') {
      // Aged Northern Song silk (古绢微褐)
      baseGrad.addColorStop(0, '#e6dac1');
      baseGrad.addColorStop(0.5, '#dfd0b2');
      baseGrad.addColorStop(1, '#d7c6a4');
    } else if (mode === 'xieyi') {
      // Crisp raw Xuan paper with stark luminosity for Bada Shanren
      baseGrad.addColorStop(0, '#f5f1e6');
      baseGrad.addColorStop(1, '#ece6d6');
    } else {
      // Warm Tang baimiao麻纸
      baseGrad.addColorStop(0, '#efe6d2');
      baseGrad.addColorStop(1, '#e4d8be');
    }
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, PANEL_SIZE, PANEL_SIZE);

    // Organic Xuan paper plant fibers (宣纸帘纹与草木纤维)
    for (let y = 0; y < PANEL_SIZE; y += 6) {
      ctx.strokeStyle = `rgba(120, 102, 74, ${(0.025 + rng() * 0.02).toFixed(3)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(PANEL_SIZE, y);
      ctx.stroke();
    }
    for (let i = 0; i < 950; i++) {
      const fx = rng() * PANEL_SIZE;
      const fy = rng() * PANEL_SIZE;
      const len = 6 + rng() * 22;
      const ang = rng() * Math.PI * 2;
      ctx.strokeStyle =
        rng() > 0.35
          ? `rgba(255, 252, 244, ${(0.12 + rng() * 0.18).toFixed(3)})`
          : `rgba(115, 92, 64, ${(0.05 + rng() * 0.08).toFixed(3)})`;
      ctx.lineWidth = 0.6 + rng() * 0.9;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + Math.cos(ang) * len, fy + Math.sin(ang) * len);
      ctx.stroke();
    }
  });
}

/**
 * Draws a dry-brush "flying white" (飞白) stroke along a polyline `points` `[[x,y], ...]`
 * on a 2D canvas context with deterministic bristle splitting.
 */
export function drawFeibaiStroke(ctx, points, rng, {
  color = INK_SHADES.nong,
  width = 8,
  bristles = 7,
  dryness = 0.45,
} = {}) {
  if (points.length < 2) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;

  for (let b = 0; b < bristles; b++) {
    const offsetNorm = (b / Math.max(1, bristles - 1) - 0.5) * width;
    ctx.lineWidth = Math.max(0.6, (width / bristles) * (1.35 - dryness * 0.5));
    ctx.globalAlpha = 0.45 + (1 - Math.abs(b / bristles - 0.5)) * 0.45;
    ctx.beginPath();
    let penDown = false;
    for (let i = 0; i < points.length; i++) {
      const [px, py] = points[i];
      const nx = i < points.length - 1 ? -(points[i + 1][1] - py) : 0;
      const ny = i < points.length - 1 ? points[i + 1][0] - px : 1;
      const nl = Math.hypot(nx, ny) || 1;
      const bx = px + (nx / nl) * offsetNorm;
      const by = py + (ny / nl) * offsetNorm;
      const skip = i > 0 && dryness > 0 && (i / points.length) * dryness * 1.3 > rng();
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
 * Draws a soft layered ink wash halo (水墨晕染) on a 2D context.
 */
export function drawInkWashBlob(ctx, x, y, rx, ry, {
  color = '34, 32, 28',
  maxAlpha = 0.22,
  layers = 5,
  rotation = 0,
} = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  for (let i = layers; i >= 1; i--) {
    const k = i / layers;
    ctx.fillStyle = `rgba(${color}, ${(maxAlpha / layers) * (1.3 - 0.4 * k)})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx * (0.65 + 0.42 * k), ry * (0.65 + 0.42 * k), 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
