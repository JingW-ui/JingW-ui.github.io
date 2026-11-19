// src/kit/frame.js
// Period-authentic physical mounting & border frames (`画框 / 装裱 / 硬件边框`) around each
// 1000x1000 era panel in 1920x1080 world space, baked once per era via `kit.bake2D`
// (`1036x1044`, `PAD=18` outward), plus brushed antique-bronze museum wall placards
// strictly for physical artworks (`#01..#14`, none on `#15..#20`).

import { PANEL_SIZE } from '../beat/timeline.js';
import { makePRNG, hashSeed } from './kit.js';

const PLACARD_W = 420;
const PLACARD_H = 40;
const PLACARD_Y = 1011;

const BAKE_W = 1036;
const BAKE_H = 1044;
const OX = 18; // Panel x=0 in baked canvas
const OY = 18; // Panel y=0 in baked canvas
const PW = PANEL_SIZE; // 1000
const PH = PANEL_SIZE; // 1000

// =============================================================================
// 1. Brushed Antique-Bronze Museum Wall Placard (#01..#14 ONLY)
// =============================================================================

function getBakedWallPlacard(kit, scene) {
  return kit.bake2D(
    `wall_placard_${scene.id}`,
    (_g, ctx, rng, pw, ph) => {
      ctx.clearRect(0, 0, pw, ph);

      // 1. Brushed antique dark-bronze base gradient
      const bg = ctx.createLinearGradient(0, 0, pw, ph);
      bg.addColorStop(0.0, '#231b12');
      bg.addColorStop(0.28, '#3c2e1d');
      bg.addColorStop(0.52, '#493823');
      bg.addColorStop(0.76, '#362919');
      bg.addColorStop(1.0, '#211910');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, pw, ph);

      // Subtle vertical sheen falloff (museum picture-light grazing from above)
      const vSheen = ctx.createLinearGradient(0, 0, 0, ph);
      vSheen.addColorStop(0, 'rgba(238, 206, 142, 0.10)');
      vSheen.addColorStop(0.45, 'rgba(0, 0, 0, 0.0)');
      vSheen.addColorStop(1, 'rgba(8, 6, 4, 0.34)');
      ctx.fillStyle = vSheen;
      ctx.fillRect(0, 0, pw, ph);

      // 2. Fine horizontal brushed-bronze hairlines + subtle diagonal metallic grain
      for (let y = 1; y < ph - 1; y++) {
        const a = (rng() - 0.5) * 0.09;
        if (Math.abs(a) > 0.012) {
          ctx.fillStyle =
            a > 0
              ? `rgba(235, 202, 138, ${a.toFixed(3)})`
              : `rgba(10, 7, 4, ${(-a * 1.3).toFixed(3)})`;
          ctx.fillRect(1, y, pw - 2, 1);
        }
      }
      ctx.save();
      ctx.strokeStyle = 'rgba(218, 184, 118, 0.035)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 48; i++) {
        const sx = rng() * pw;
        const sy = rng() * ph;
        const len = 10 + rng() * 26;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + len, sy + (rng() - 0.5) * 3.5);
        ctx.stroke();
      }
      ctx.restore();

      // 3. Outer dark oxidized bevel + 1px #a8874c chamfered inner gilt rule
      ctx.strokeStyle = 'rgba(198, 162, 96, 0.36)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, pw - 1, ph - 1);

      const ins = 3.5;
      const ch = 5.5;
      ctx.strokeStyle = '#a8874c';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ins + ch, ins);
      ctx.lineTo(pw - ins - ch, ins);
      ctx.lineTo(pw - ins, ins + ch);
      ctx.lineTo(pw - ins, ph - ins - ch);
      ctx.lineTo(pw - ins - ch, ph - ins);
      ctx.lineTo(ins + ch, ph - ins);
      ctx.lineTo(ins, ph - ins - ch);
      ctx.lineTo(ins, ins + ch);
      ctx.closePath();
      ctx.stroke();

      // 4. Four oxidized brass corner rivets
      const rivets = [
        [9.5, 9.5],
        [pw - 9.5, 9.5],
        [9.5, ph - 9.5],
        [pw - 9.5, ph - 9.5],
      ];
      for (const [rx, ry] of rivets) {
        ctx.fillStyle = 'rgba(8, 6, 4, 0.65)';
        ctx.beginPath();
        ctx.arc(rx + 0.6, ry + 0.8, 2.5, 0, Math.PI * 2);
        ctx.fill();

        const rg = ctx.createRadialGradient(rx - 0.7, ry - 0.7, 0.3, rx, ry, 2.5);
        rg.addColorStop(0, '#d8ba7e');
        rg.addColorStop(0.55, '#8a6b39');
        rg.addColorStop(1, '#3d2d17');
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(rx, ry, 2.3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Incised warm-gold museum curator typography
      const numStr = String(scene.num).padStart(2, '0');
      const topLine = `${numStr} · ${scene.zh}   |   ${scene.era}`;
      const botLine = scene.en;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.font = '600 13.5px "PelicanSerif", serif';
      ctx.fillStyle = 'rgba(10, 7, 4, 0.82)';
      ctx.fillText(topLine, pw / 2 + 0.6, 13.5 + 0.8);
      ctx.fillStyle = '#ead5a5';
      ctx.fillText(topLine, pw / 2, 13.5);

      ctx.font = '500 10.5px "PelicanSerif", "PelicanSans", serif';
      ctx.fillStyle = 'rgba(10, 7, 4, 0.78)';
      ctx.fillText(botLine, pw / 2 + 0.5, 28.5 + 0.7);
      ctx.fillStyle = '#bfa26b';
      ctx.fillText(botLine, pw / 2, 28.5);
    },
    PLACARD_W,
    PLACARD_H
  );
}

// =============================================================================
// 2. Shared Geometry & Material Micro-Helpers
// =============================================================================

/**
 * Fills the rectangular frame band `[xOuter..xOuter+wOuter] \ [xInner..xInner+wInner]`
 * using even-odd winding so the inner artwork aperture stays 100% transparent.
 */
function clipFrameBand(ctx, ox0, oy0, ox1, oy1, ix0, iy0, ix1, iy1) {
  ctx.beginPath();
  ctx.moveTo(ox0, oy0);
  ctx.lineTo(ox1, oy0);
  ctx.lineTo(ox1, oy1);
  ctx.lineTo(ox0, oy1);
  ctx.closePath();

  ctx.moveTo(ix0, iy0);
  ctx.lineTo(ix0, iy1);
  ctx.lineTo(ix1, iy1);
  ctx.lineTo(ix1, iy0);
  ctx.closePath();
  ctx.clip('evenodd');
}

/**
 * Draws a mitred 4-trapezoid picture-frame bevel (`top`, `right`, `bottom`, `left`)
 * between outer bounds `[ox0, oy0, ox1, oy1]` and inner aperture `[ix0, iy0, ix1, iy1]`.
 */
function drawMitredMolding(ctx, ox0, oy0, ox1, oy1, ix0, iy0, ix1, iy1, stopsBySide) {
  const sides = [
    // Top trapezoid (light from above)
    {
      poly: [
        [ox0, oy0],
        [ox1, oy0],
        [ix1, iy0],
        [ix0, iy0],
      ],
      g0: [0, oy0],
      g1: [0, iy0],
      stops: stopsBySide.top,
    },
    // Bottom trapezoid (in shadow)
    {
      poly: [
        [ix0, iy1],
        [ix1, iy1],
        [ox1, oy1],
        [ox0, oy1],
      ],
      g0: [0, iy1],
      g1: [0, oy1],
      stops: stopsBySide.bottom,
    },
    // Left trapezoid
    {
      poly: [
        [ox0, oy0],
        [ix0, iy0],
        [ix0, iy1],
        [ox0, oy1],
      ],
      g0: [ox0, 0],
      g1: [ix0, 0],
      stops: stopsBySide.left,
    },
    // Right trapezoid
    {
      poly: [
        [ix1, iy0],
        [ox1, oy0],
        [ox1, oy1],
        [ix1, iy1],
      ],
      g0: [ix1, 0],
      g1: [ox1, 0],
      stops: stopsBySide.right,
    },
  ];

  for (const s of sides) {
    const grad = ctx.createLinearGradient(s.g0[0], s.g0[1], s.g1[0], s.g1[1]);
    for (const [pos, col] of s.stops) grad.addColorStop(pos, col);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(s.poly[0][0], s.poly[0][1]);
    ctx.lineTo(s.poly[1][0], s.poly[1][1]);
    ctx.lineTo(s.poly[2][0], s.poly[2][1]);
    ctx.lineTo(s.poly[3][0], s.poly[3][1]);
    ctx.closePath();
    ctx.fill();
  }

  // Subtle 45-degree mitre join hairlines at the 4 corners
  ctx.save();
  ctx.strokeStyle = 'rgba(12, 8, 5, 0.34)';
  ctx.lineWidth = 0.85;
  const mitres = [
    [ox0, oy0, ix0, iy0],
    [ox1, oy0, ix1, iy0],
    [ox1, oy1, ix1, iy1],
    [ox0, oy1, ix0, iy1],
  ];
  for (const [x1, y1, x2, y2] of mitres) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Soft top & bottom gallery wall drop shadow (staying strictly <= worldY 1009 on #01..#14).
 */
function drawWallDropShadow(ctx, x0, x1, yBotOut, maxShadowY, alpha = 0.34) {
  const shH = Math.max(0, maxShadowY - yBotOut);
  if (shH <= 0.5) return;
  const g = ctx.createLinearGradient(0, yBotOut, 0, yBotOut + shH);
  g.addColorStop(0, `rgba(6, 5, 4, ${alpha.toFixed(3)})`);
  g.addColorStop(1, 'rgba(6, 5, 4, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(x0, yBotOut, x1 - x0, shH);
}

/**
 * Draws one matching half ('L' = left of seam inside right edge of Panel i,
 * 'R' = right of seam inside left edge of Panel i+1) of a Song/Ming cinnabar
 * straddling collector's seal (`骑缝朱文收藏印`) with identical seed across the seam!
 */
function drawStraddlingTallySealHalf(ctx, halfSide, seamCx, topCy, sealW, sealH, chars, seedKey) {
  const sRng = makePRNG(hashSeed(seedKey));
  const halfW = sealW * 0.5;
  const fullX0 = seamCx - halfW;
  const fullY0 = topCy;

  ctx.save();
  ctx.beginPath();
  if (halfSide === 'L') {
    ctx.rect(seamCx - halfW - 1, fullY0 - 1, halfW + 1, sealH + 2);
  } else {
    ctx.rect(seamCx, fullY0 - 1, halfW + 1, sealH + 2);
  }
  ctx.clip();

  // Hand-chipped stone seal outer朱文 border (irregular polygon, zero crisp vector rect)
  ctx.globalAlpha = 0.80;
  ctx.strokeStyle = '#b42d1f';
  ctx.lineWidth = 1.45;
  ctx.beginPath();
  const segs = 12;
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    let px = fullX0;
    let py = fullY0;
    if (t < 0.25) {
      px = fullX0 + (t / 0.25) * sealW;
      py = fullY0 + (sRng() - 0.5) * 0.8;
    } else if (t < 0.5) {
      px = fullX0 + sealW + (sRng() - 0.5) * 0.8;
      py = fullY0 + ((t - 0.25) / 0.25) * sealH;
    } else if (t < 0.75) {
      px = fullX0 + (1 - (t - 0.5) / 0.25) * sealW;
      py = fullY0 + sealH + (sRng() - 0.5) * 0.8;
    } else {
      px = fullX0 + (sRng() - 0.5) * 0.8;
      py = fullY0 + (1 - (t - 0.75) / 0.25) * sealH;
    }
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  // Subtle cinnabar paste暈染 (oil halo into silk fibers)
  ctx.fillStyle = 'rgba(184, 46, 31, 0.11)';
  ctx.fillRect(fullX0 + 0.8, fullY0 + 0.8, sealW - 1.6, sealH - 1.6);

  // Seal-script characters (`朱文`) centered on the seam so L & R halves lock across x=4000 / 5000!
  ctx.fillStyle = '#b62e20';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = chars.length > 1 ? Math.min(11.5, (sealH - 5) / chars.length) : 12;
  ctx.font = `600 ${fontSize.toFixed(1)}px "PelicanSerif", "Songti SC", serif`;
  for (let i = 0; i < chars.length; i++) {
    const cy = fullY0 + ((i + 0.5) / chars.length) * sealH;
    ctx.fillText(chars[i], seamCx, cy);
  }

  // Authentic xuan/silk dry-fiber voids (`飞白斑驳`) over cinnabar without punching through brocade
  for (let k = 0; k < 22; k++) {
    const vx = fullX0 + sRng() * sealW;
    const vy = fullY0 + sRng() * sealH;
    ctx.fillStyle = `rgba(216, 204, 178, ${(0.22 + sRng() * 0.32).toFixed(2)})`;
    ctx.fillRect(vx, vy, 0.9 + sRng() * 1.3, 0.6 + sRng() * 1.0);
  }
  ctx.restore();
}

// =============================================================================
// 3. Family 1 — `stone_arch` (#01 Sahara, #02 Egypt, #03 Han)
// =============================================================================

function bakeSaharaFrame(ctx, rng, halfMode = 'right_open_left') {
  // Continuous 2000px Sahara Cave Wall (`[-1000, +1000]`):
  // - `s01_sahara` (`right_open_left`): top + bottom + right border at `x = 1000`; OPEN at `x = 0`!
  // - `s01_sahara_pre` (`left_open_right`): top + bottom + left border at `x = -1000`; OPEN at `x = 0`!
  const openLeft = halfMode === 'right_open_left';
  const openRight = halfMode === 'left_open_right';

  const ox0 = openLeft ? OX : OX - 10;
  const ox1 = openRight ? OX + PW : OX + PW;
  const oy0 = OY - 10;
  const oy1 = OY + PH + 7;

  drawWallDropShadow(ctx, ox0, ox1, oy1, OY + PH + 9, 0.32);

  const innerPts = [];
  const N = 44;
  // Top edge (left -> right; pinned to `OY + 8.2` at `x = 0` seam so both halves join flush!)
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const seamFade = openLeft ? Math.min(1, u * 6) : openRight ? Math.min(1, (1 - u) * 6) : 1;
    const wob = (Math.sin(u * 19.3) * 1.4 + (rng() - 0.5) * 2.0) * seamFade;
    innerPts.push([OX + u * PW, OY + 8.2 + wob]);
  }
  // Right edge (top -> bottom)
  if (openRight) {
    innerPts.push([OX + PW + 2, OY + PH - 8.0]);
  } else {
    for (let i = 1; i <= N; i++) {
      const u = i / N;
      const py = OY + u * PH;
      const roadOpen = Math.exp(-Math.pow((u * PH - 680) / 56, 2)) * 2.4;
      const wob = Math.cos(u * 23.1) * 1.3 + (rng() - 0.5) * 1.8;
      innerPts.push([OX + PW - (8.4 - roadOpen + wob), py]);
    }
  }
  // Bottom edge (right -> left; pinned to `OY + PH - 8.0` at `x = 0` seam!)
  for (let i = 1; i <= N; i++) {
    const u = 1 - i / N;
    const seamFade = openLeft ? Math.min(1, u * 6) : openRight ? Math.min(1, (1 - u) * 6) : 1;
    const wob = (Math.sin(u * 17.7 + 1.2) * 1.4 + (rng() - 0.5) * 1.9) * seamFade;
    innerPts.push([OX + u * PW, OY + PH - (8.0 + wob)]);
  }
  // Left edge (bottom -> top)
  if (openLeft) {
    innerPts.push([OX - 2, OY + 8.2]);
  } else {
    for (let i = 1; i < N; i++) {
      const u = 1 - i / N;
      const roadOpen = Math.exp(-Math.pow((u * PH - 680) / 56, 2)) * 2.4;
      const wob = Math.sin(u * 21.4 + 2.4) * 1.4 + (rng() - 0.5) * 1.9;
      innerPts.push([OX + (8.6 - roadOpen + wob), OY + u * PH]);
    }
  }

  const outerPts = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const seamFade = openLeft ? Math.min(1, u * 6) : openRight ? Math.min(1, (1 - u) * 6) : 1;
    outerPts.push([ox0 + u * (ox1 - ox0), oy0 + (rng() - 0.5) * 2.2 * seamFade]);
  }
  outerPts.push([ox1, oy0]);
  outerPts.push([ox1, oy1]);
  for (let i = 0; i <= N; i++) {
    const u = 1 - i / N;
    const seamFade = openLeft ? Math.min(1, u * 6) : openRight ? Math.min(1, (1 - u) * 6) : 1;
    outerPts.push([ox0 + u * (ox1 - ox0), oy1 + (rng() - 0.5) * 1.8 * seamFade]);
  }
  if (!openLeft) {
    for (let i = 1; i < N; i++) {
      const u = 1 - i / N;
      outerPts.push([ox0 + (rng() - 0.5) * 2.6, oy0 + u * (oy1 - oy0)]);
    }
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(openLeft ? OX : 0, 0, openLeft ? PW : openRight ? OX + PW : BAKE_W, BAKE_H);
  ctx.clip();

  ctx.beginPath();
  ctx.moveTo(outerPts[0][0], outerPts[0][1]);
  for (let i = 1; i < outerPts.length; i++) ctx.lineTo(outerPts[i][0], outerPts[i][1]);
  ctx.closePath();
  ctx.moveTo(innerPts[0][0], innerPts[0][1]);
  for (let i = innerPts.length - 1; i >= 1; i--) ctx.lineTo(innerPts[i][0], innerPts[i][1]);
  ctx.closePath();
  ctx.clip('evenodd');

  // Stratified Saharan sandstone base (vertical gradient so `x = 0` seam matches 100%!)
  const rockGrad = ctx.createLinearGradient(0, oy0, 0, oy1);
  rockGrad.addColorStop(0.0, '#6e391f');
  rockGrad.addColorStop(0.32, '#874928');
  rockGrad.addColorStop(0.68, '#5a2c17');
  rockGrad.addColorStop(1.0, '#442010');
  ctx.fillStyle = rockGrad;
  ctx.fillRect(ox0 - 4, oy0 - 4, ox1 - ox0 + 8, oy1 - oy0 + 8);

  for (let s = 0; s < 140; s++) {
    const sy = oy0 + rng() * (oy1 - oy0);
    const sx = ox0 + rng() * (ox1 - ox0);
    const len = 18 + rng() * 65;
    ctx.strokeStyle =
      rng() > 0.45 ? 'rgba(226, 178, 124, 0.16)' : 'rgba(28, 13, 7, 0.26)';
    ctx.lineWidth = 0.7 + rng() * 1.3;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + len, sy + (rng() - 0.5) * 3.2);
    ctx.stroke();
  }
  for (let g = 0; g < 420; g++) {
    const gx = ox0 + rng() * (ox1 - ox0);
    const gy = oy0 + rng() * (oy1 - oy0);
    if (gx > OX + 14 && gx < OX + PW - 14 && gy > OY + 14 && gy < OY + PH - 14) continue;
    ctx.fillStyle =
      rng() > 0.5 ? 'rgba(238, 198, 145, 0.22)' : 'rgba(32, 14, 8, 0.32)';
    ctx.fillRect(gx, gy, 1.3, 1.3);
  }
  ctx.restore();

  // Chipped inner rock ledge shadow ONLY along actual rock edges (NEVER across `x = 0` open seam!)
  ctx.save();
  ctx.beginPath();
  ctx.rect(openLeft ? OX : 0, 0, openLeft ? PW : openRight ? OX + PW : BAKE_W, BAKE_H);
  ctx.clip();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(24, 11, 5, 0.68)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  // Top inner edge (`0..N`)
  ctx.moveTo(innerPts[0][0], innerPts[0][1]);
  for (let i = 1; i <= N; i++) ctx.lineTo(innerPts[i][0], innerPts[i][1]);
  if (!openRight) {
    for (let i = N + 1; i <= 2 * N; i++) ctx.lineTo(innerPts[i][0], innerPts[i][1]);
  } else {
    ctx.moveTo(innerPts[N + 1][0], innerPts[N + 1][1]);
  }
  const botStart = openRight ? N + 2 : 2 * N + 1;
  const botEnd = botStart + N - 1;
  for (let i = botStart; i <= botEnd && i < innerPts.length; i++) {
    ctx.lineTo(innerPts[i][0], innerPts[i][1]);
  }
  if (!openLeft) {
    for (let i = botEnd + 1; i < innerPts.length; i++) ctx.lineTo(innerPts[i][0], innerPts[i][1]);
    ctx.lineTo(innerPts[0][0], innerPts[0][1]);
  }
  ctx.stroke();

  ctx.strokeStyle = 'rgba(224, 174, 118, 0.36)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const [px, py] = innerPts[i];
    if (i === 0) ctx.moveTo(px, py - 1.2);
    else ctx.lineTo(px, py - 1.2);
  }
  ctx.stroke();
  ctx.restore();
}

function bakeEgyptFrame(ctx, rng) {
  // #02 Ancient Egyptian Tomb Limestone Architrave, Block-Band & Papyrus Torus (inward = 10px)
  const ox0 = OX;
  const ox1 = OX + PW;
  const oy0 = OY - 10;
  const oy1 = OY + PH + 7;
  const ix0 = OX + 10;
  const ix1 = OX + PW - 10;
  const iy0 = OY + 10;
  const iy1 = OY + PH - 10;

  drawWallDropShadow(ctx, ox0, ox1, oy1, OY + PH + 9, 0.30);

  ctx.save();
  clipFrameBand(ctx, ox0, oy0, ox1, oy1, ix0, iy0, ix1, iy1);

  // Dressed Tura limestone ground
  ctx.fillStyle = '#cbb181';
  ctx.fillRect(ox0, oy0, ox1 - ox0, oy1 - oy0);

  // Subtle limestone grain & plaster pores
  for (let i = 0; i < 320; i++) {
    const side = i & 3;
    const px =
      side < 2
        ? ox0 + rng() * PW
        : side === 2
          ? ox0 + rng() * 10
          : ox1 - 10 + rng() * 10;
    const py =
      side === 0
        ? oy0 + rng() * 20
        : side === 1
          ? iy1 + rng() * 17
          : oy0 + rng() * (oy1 - oy0);
    ctx.fillStyle = rng() > 0.5 ? 'rgba(255,244,218,0.22)' : 'rgba(72,54,30,0.18)';
    ctx.fillRect(px, py, 1.5, 1.2);
  }

  // Top & Bottom Egyptian tomb polychrome *block-band* (`红赭 / 埃及蓝 / 雌黄 / 白灰`)
  const colors = ['#c14928', '#1d6b73', '#d4a024', '#e8d5a7'];
  const segW = 16;
  const drawBlockBand = (by, bh) => {
    ctx.fillStyle = '#1f1a15';
    ctx.fillRect(ox0, by - 0.9, PW, bh + 1.8);
    const count = Math.ceil(PW / segW);
    for (let k = 0; k < count; k++) {
      const bx = ox0 + k * segW;
      const bw = Math.min(segW - 1.2, ox1 - bx - 0.6);
      if (bw <= 0) continue;
      ctx.fillStyle = colors[k % colors.length];
      ctx.fillRect(bx + 0.6, by, bw, bh);
      // Mineral pigment dry-brush variation
      if (rng() > 0.4) {
        ctx.fillStyle = 'rgba(245, 232, 200, 0.14)';
        ctx.fillRect(bx + 1.5, by + 0.8, bw * 0.6, 1.2);
      }
    }
  };
  drawBlockBand(OY + 2.2, 5.2);
  drawBlockBand(OY + PH - 7.4, 5.2);

  // Upper cavetto lotus/khekher fluted frieze (`oy0..OY+1`)
  for (let k = 0; k < 50; k++) {
    const fx = ox0 + k * 20 + 10;
    ctx.strokeStyle = k % 2 === 0 ? '#1d6b73' : '#9c381e';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(fx, oy0 + 1.5);
    ctx.lineTo(fx, OY + 0.5);
    ctx.stroke();
  }

  // Left & Right bundled-reed *torus* molding (`束苇圆线雕`) with diagonal lashing ties
  const drawTorusStile = (sx) => {
    const tg = ctx.createLinearGradient(sx, 0, sx + 9.5, 0);
    tg.addColorStop(0.0, '#7c5d30');
    tg.addColorStop(0.42, '#dfc48c');
    tg.addColorStop(0.75, '#b89250');
    tg.addColorStop(1.0, '#594120');
    ctx.fillStyle = tg;
    ctx.fillRect(sx, OY + 8.5, 9.5, PH - 17);

    ctx.strokeStyle = '#291f16';
    ctx.lineWidth = 1.1;
    for (let y = OY + 16; y < OY + PH - 16; y += 26) {
      ctx.beginPath();
      ctx.moveTo(sx + 0.8, y - 3);
      ctx.lineTo(sx + 8.7, y + 3);
      ctx.moveTo(sx + 0.8, y + 1.2);
      ctx.lineTo(sx + 8.7, y + 7.2);
      ctx.stroke();
    }
  };
  drawTorusStile(ox0);
  drawTorusStile(ox1 - 9.5);

  ctx.restore();

  // Crisp carbon-soot tomb outline around aperture
  ctx.strokeStyle = 'rgba(26, 20, 15, 0.72)';
  ctx.lineWidth = 1.1;
  ctx.strokeRect(ix0 + 0.5, iy0 + 0.5, PW - 21, PH - 21);
}

function bakeHanFrame(ctx, rng) {
  // #03 Eastern Han Stone-Que (`汉画像石阙`) Chiseled Bluestone & Lozenge Relief Rubbing (inward = 10px)
  const ox0 = OX;
  const ox1 = OX + PW;
  const oy0 = OY - 9;
  const oy1 = OY + PH + 7;
  const ix0 = OX + 10;
  const ix1 = OX + PW - 10;
  const iy0 = OY + 10;
  const iy1 = OY + PH - 10;

  drawWallDropShadow(ctx, ox0, ox1, oy1, OY + PH + 9, 0.34);

  ctx.save();
  clipFrameBand(ctx, ox0, oy0, ox1, oy1, ix0, iy0, ix1, iy1);

  // Pine-soot ink rubbing ground (`浓墨拓底`)
  ctx.fillStyle = '#1b1a18';
  ctx.fillRect(ox0, oy0, PW, oy1 - oy0);

  // Parallel diagonal iron-chisel striker grooves (`汉代石工斩道纹` — uninked white Xuan relief!)
  ctx.strokeStyle = 'rgba(228, 222, 208, 0.30)';
  ctx.lineWidth = 0.85;
  for (let d = -oy1; d < PW + oy1; d += 5.5) {
    ctx.beginPath();
    ctx.moveTo(ox0 + d, oy0);
    ctx.lineTo(ox0 + d - (oy1 - oy0) * 0.45, oy1);
    ctx.stroke();
  }

  // Uninked Xuan-paper carved `菱格穿璧纹` (lozenge-and-bi-disc Han stone relief band)
  ctx.strokeStyle = 'rgba(236, 230, 216, 0.78)';
  ctx.lineWidth = 1.05;
  const step = 20;
  const drawLozengeH = (cy) => {
    for (let x = ox0 + 10; x <= ox1 - 10; x += step) {
      ctx.beginPath();
      ctx.moveTo(x - 8, cy);
      ctx.lineTo(x, cy - 4.2);
      ctx.lineTo(x + 8, cy);
      ctx.lineTo(x, cy + 4.2);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = 'rgba(236, 230, 216, 0.65)';
      ctx.fillRect(x - 1, cy - 1, 2, 2);
    }
  };
  drawLozengeH(OY + 1.2);
  drawLozengeH(OY + PH - 1.2);

  const drawLozengeV = (cx) => {
    for (let y = OY + 22; y <= OY + PH - 22; y += step) {
      ctx.beginPath();
      ctx.moveTo(cx, y - 8);
      ctx.lineTo(cx + 3.8, y);
      ctx.lineTo(cx, y + 8);
      ctx.lineTo(cx - 3.8, y);
      ctx.closePath();
      ctx.stroke();
    }
  };
  drawLozengeV(ox0 + 4.8);
  drawLozengeV(ox1 - 4.8);

  // Subtle weathered stone spalling & faint cinnabar拓本 fleck patina
  for (let i = 0; i < 180; i++) {
    const px = ox0 + rng() * PW;
    const py = rng() > 0.5 ? oy0 + rng() * 19 : iy1 + rng() * 17;
    ctx.fillStyle =
      rng() > 0.16 ? 'rgba(235, 229, 215, 0.38)' : 'rgba(179, 57, 43, 0.34)';
    ctx.fillRect(px, py, 1.4 + rng() * 1.6, 1.1 + rng() * 1.2);
  }

  ctx.restore();

  // Inner carved Xuan-paper relief double rule
  ctx.strokeStyle = 'rgba(232, 226, 212, 0.72)';
  ctx.lineWidth = 0.95;
  ctx.strokeRect(ix0 - 0.5, iy0 - 0.5, PW - 19, PH - 19);
}

// =============================================================================
// 4. Family 2 — `silk_scroll` (#04 Tang, #05 Song, #06 Qingming, #09 Bada)
// =============================================================================

/**
 * Renders `#04 -> #05 -> #06` as ONE continuous Northern Song Imperial `宣和装` Handscroll
 * (inward strictly `7.5px <= 8px`!), or `#09 Bada` as an austere Ming-Qing literati
 * pale-ash silk mounting (inward strictly `5.5px <= 6px`!).
 */
function bakeSilkScrollFrame(ctx, rng, scene) {
  const isBada = scene.id === 's09_bada';
  const inW = isBada ? 5.5 : 7.5; // Strict <=6px (#09) and <=8px (#04..#06) guard!
  const outTop = isBada ? 10 : 12;
  const outBot = 7; // worldY <= 1007 -> clears PLACARD_Y=1011 cleanly!

  const ox0 = OX;
  const ox1 = OX + PW;
  const oy0 = OY - outTop;
  const oy1 = OY + PH + outBot;
  const ix0 = OX + inW;
  const ix1 = OX + PW - inW;
  const iy0 = OY + inW;
  const iy1 = OY + PH - inW;

  drawWallDropShadow(ctx, ox0, ox1, oy1, OY + PH + 9, 0.24);

  // Palette: warm Song tea-celadon damask (#04..#06) vs cool silver-ash literati silk (#09)
  const brocadeTop = isBada ? '#cfcbc0' : '#c6bca2';
  const brocadeMid = isBada ? '#dbd7cc' : '#d5cab0';
  const brocadeBot = isBada ? '#bfbab0' : '#b7ac91';
  const geshuiCol = isBada ? '#d6d2c7' : '#d8ccb0';
  const zhutiaoCol = isBada ? '#f2efe6' : '#efe7d4';
  const pasteRule = isBada ? 'rgba(62, 59, 53, 0.52)' : 'rgba(92, 72, 46, 0.48)';

  ctx.save();
  clipFrameBand(ctx, ox0, oy0, ox1, oy1, ix0, iy0, ix1, iy1);

  // 1. Unified Top `天头` & Bottom `地脚` Silk Brocade (100% continuous across x=4000 & x=5000!)
  const topG = ctx.createLinearGradient(0, oy0, 0, iy0);
  topG.addColorStop(0, brocadeBot);
  topG.addColorStop(0.55, brocadeMid);
  topG.addColorStop(1, brocadeTop);
  ctx.fillStyle = topG;
  ctx.fillRect(ox0, oy0, PW, iy0 - oy0 + 1);

  const botG = ctx.createLinearGradient(0, iy1, 0, oy1);
  botG.addColorStop(0, brocadeTop);
  botG.addColorStop(0.45, brocadeMid);
  botG.addColorStop(1, brocadeBot);
  ctx.fillStyle = botG;
  ctx.fillRect(ox0, iy1 - 1, PW, oy1 - iy1 + 1);

  // Vertical `隔水` silk stiles
  ctx.fillStyle = geshuiCol;
  ctx.fillRect(ox0, iy0, inW, PH - 2 * inW);
  ctx.fillRect(ix1, iy0, inW, PH - 2 * inW);

  // Woven Song/Ming damask warp-weft texture & subtle `回纹/云鹤` brocade threads
  // Use world-aligned X (`scene.worldX0 + localX`) so #04->#05->#06 weave phase never breaks!
  const stepX = 16;
  ctx.strokeStyle = isBada ? 'rgba(130, 126, 116, 0.22)' : 'rgba(138, 122, 92, 0.25)';
  ctx.lineWidth = 0.75;
  for (let lx = 0; lx < PW; lx += stepX) {
    const wx = scene.worldX0 + lx;
    const phase = (wx / stepX) & 1;
    const bx = ox0 + lx + 4;
    const ty = oy0 + 4.5 + phase * 1.5;
    const by = iy1 + 3.5 + phase * 1.2;
    // Tiny woven Song lozenge/fret motif on 天头 & 地脚
    ctx.strokeRect(bx, ty, 6.5, 4.5);
    ctx.strokeRect(bx, by, 6.5, 4.2);
  }

  // Fine horizontal silk slub threads across 天头, 地脚 & 隔水
  ctx.strokeStyle = 'rgba(255, 250, 238, 0.18)';
  ctx.lineWidth = 0.6;
  for (let y = oy0 + 1.5; y < oy1; y += 2.5) {
    if (y > iy0 && y < iy1) {
      ctx.beginPath();
      ctx.moveTo(ox0, y);
      ctx.lineTo(ix0, y);
      ctx.moveTo(ix1, y);
      ctx.lineTo(ox1, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(ox0, y);
      ctx.lineTo(ox1, y);
      ctx.stroke();
    }
  }

  // Outer woven silk trim binding (`包首锦边` top & bottom)
  ctx.fillStyle = isBada ? '#54514b' : '#5e4934';
  ctx.fillRect(ox0, oy0, PW, 1.8);
  ctx.fillRect(ox0, oy1 - 1.8, PW, 1.8);

  ctx.restore();

  // 2. Crisp `助条` (ivory mounting paper strip) & `糊口` paste-seam around inner painting perimeter
  // Notice: at internal scroll seams (#04 R, #05 L/R, #06 L), top/bottom `助条` runs continuously!
  ctx.strokeStyle = zhutiaoCol;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(ox0, iy0 - 0.9);
  ctx.lineTo(ox1, iy0 - 0.9);
  ctx.moveTo(ox0, iy1 + 0.9);
  ctx.lineTo(ox1, iy1 + 0.9);
  ctx.moveTo(ix0 - 0.9, iy0);
  ctx.lineTo(ix0 - 0.9, iy1);
  ctx.moveTo(ix1 + 0.9, iy0);
  ctx.lineTo(ix1 + 0.9, iy1);
  ctx.stroke();

  ctx.strokeStyle = pasteRule;
  ctx.lineWidth = 0.75;
  ctx.strokeRect(ix0, iy0, PW - 2 * inW, PH - 2 * inW);

  // Hair-thin vertical silk join crease right on internal scroll seams (x=4000, x=5000)
  if (scene.id === 's04_tang' || scene.id === 's05_song') {
    ctx.strokeStyle = 'rgba(84, 68, 45, 0.28)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(ox1 - 0.35, iy0);
    ctx.lineTo(ox1 - 0.35, iy1);
    ctx.stroke();
  }
  if (scene.id === 's05_song' || scene.id === 's06_qingming') {
    ctx.strokeStyle = 'rgba(84, 68, 45, 0.28)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(ox0 + 0.35, iy0);
    ctx.lineTo(ox0 + 0.35, iy1);
    ctx.stroke();
  }

  // 3. Straddling Imperial Cinnabar Tally Seals (`半枚骑缝朱文收藏印` locking across x=4000 & x=5000!)
  if (scene.id === 's04_tang') {
    drawStraddlingTallySealHalf(ctx, 'L', ox1, OY + 504, 18, 32, ['宣', '和'], 'tally_4000_top');
    drawStraddlingTallySealHalf(ctx, 'L', ox1, OY + 842, 16, 18, ['御'], 'tally_4000_bot');
  } else if (scene.id === 's05_song') {
    drawStraddlingTallySealHalf(ctx, 'R', ox0, OY + 504, 18, 32, ['宣', '和'], 'tally_4000_top');
    drawStraddlingTallySealHalf(ctx, 'R', ox0, OY + 842, 16, 18, ['御'], 'tally_4000_bot');
    drawStraddlingTallySealHalf(ctx, 'L', ox1, OY + 152, 18, 32, ['紹', '興'], 'tally_5000_top');
    drawStraddlingTallySealHalf(ctx, 'L', ox1, OY + 844, 16, 18, ['寶'], 'tally_5000_bot');
  } else if (scene.id === 's06_qingming') {
    drawStraddlingTallySealHalf(ctx, 'R', ox0, OY + 152, 18, 32, ['紹', '興'], 'tally_5000_top');
    drawStraddlingTallySealHalf(ctx, 'R', ox0, OY + 844, 16, 18, ['寶'], 'tally_5000_bot');
  } else if (isBada) {
    drawStraddlingTallySealHalf(ctx, 'R', ox0, OY + 852, 14, 22, ['真', '賞'], 'tally_bada_left');
  }

  // 4. Scroll Stave & Turned Imperial Zitan Rosewood Roller Finials (`天杆玉别子` & `紫檀轴头`)
  // Strictly inside `[ox0..ox1]` horizontally so neighbors at #03/#07/#08/#10 are never touched!
  if (scene.id === 's04_tang') {
    // Leftmost scroll head stave (`天杆` + warm celadon-jade `玉别子` finials at top/bottom)
    const sg = ctx.createLinearGradient(ox0, 0, ox0 + 4.5, 0);
    sg.addColorStop(0, '#362015');
    sg.addColorStop(0.5, '#6e452e');
    sg.addColorStop(1, '#2b180f');
    ctx.fillStyle = sg;
    ctx.fillRect(ox0, oy0 - 2, 4.5, oy1 - oy0 + 4);

    // Jade/ivory roller knob tips protruding subtly into top/bottom gallery wall
    for (const [ky, kh] of [
      [oy0 - 5, 5.5],
      [oy1 - 0.5, 5.5],
    ]) {
      const jg = ctx.createLinearGradient(ox0, 0, ox0 + 6.5, 0);
      jg.addColorStop(0, '#b5ae99');
      jg.addColorStop(0.45, '#ebe5d3');
      jg.addColorStop(1, '#8c8572');
      ctx.fillStyle = jg;
      ctx.fillRect(ox0, ky, 6.2, kh);
    }
  }

  if (scene.id === 's06_qingming' || isBada) {
    // Rightmost imperial rosewood roller (`小叶紫檀轴杆` + lathe-turned `紫檀轴头` finials!)
    const rw = isBada ? 4.5 : 5.5;
    const rx = ox1 - rw;
    const zg = ctx.createLinearGradient(rx, 0, ox1, 0);
    zg.addColorStop(0.0, '#1e0b09');
    zg.addColorStop(0.42, '#5c261f');
    zg.addColorStop(0.72, '#3d1713');
    zg.addColorStop(1.0, '#160706');
    ctx.fillStyle = zg;
    ctx.fillRect(rx, oy0, rw, oy1 - oy0);

    // Protruding turned `紫檀轴头` knobs above 天头 and below 地脚 (far right of PLACARD!)
    const fw = isBada ? 7.2 : 8.5;
    const fx = ox1 - fw;
    const drawZitanFinial = (fy, fh, isTop) => {
      const fg = ctx.createLinearGradient(fx, 0, ox1, 0);
      fg.addColorStop(0.0, '#1c0a08');
      fg.addColorStop(0.38, '#6c2d24');
      fg.addColorStop(0.68, '#451a15');
      fg.addColorStop(1.0, '#140605');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(fx + 1.2, isTop ? fy : fy + fh);
      ctx.lineTo(ox1 - 0.8, isTop ? fy : fy + fh);
      ctx.lineTo(ox1, isTop ? fy + fh : fy);
      ctx.lineTo(fx, isTop ? fy + fh : fy);
      ctx.closePath();
      ctx.fill();

      // Brass/gilt collar ring (`鎏金轴箍`)
      ctx.fillStyle = '#b99352';
      ctx.fillRect(fx, isTop ? fy + fh - 1.6 : fy + 0.4, fw, 1.3);
    };
    drawZitanFinial(oy0 - 5.5, 5.8, true);
    drawZitanFinial(oy1 - 0.3, 6.2, false);
  }

  // Subtle age foxing flecks on brocade
  for (let i = 0; i < 45; i++) {
    const px = ox0 + rng() * PW;
    const py = rng() > 0.5 ? oy0 + rng() * (iy0 - oy0) : iy1 + rng() * (oy1 - iy1);
    ctx.fillStyle = 'rgba(110, 86, 54, 0.12)';
    ctx.fillRect(px, py, 1.4, 1.1);
  }
}

// =============================================================================
// 5. Family 3 — `codex_print` (#07 Maya, #08 Mughal, #11 Ukiyo-e)
// =============================================================================

function bakeMayaFrame(ctx, rng) {
  // #07 Dresden Codex Beaten Amate Bark-Paper Deckle & Lime-Stucco Accordion Fold (inward = 8px)
  const ox0 = OX;
  const ox1 = OX + PW;
  const oy0 = OY - 8;
  const oy1 = OY + PH + 6;
  const ix0 = OX + 8;
  const ix1 = OX + PW - 8;
  const iy0 = OY + 8;
  const iy1 = OY + PH - 8;

  drawWallDropShadow(ctx, ox0, ox1, oy1, OY + PH + 8.5, 0.28);

  ctx.save();
  clipFrameBand(ctx, ox0, oy0, ox1, oy1, ix0, iy0, ix1, iy1);

  // Raw beaten fig-bark (`amate`) fibrous substrate
  ctx.fillStyle = '#7c5533';
  ctx.fillRect(ox0, oy0, PW, oy1 - oy0);

  // Orthogonal cross-beaten bark fibers
  ctx.strokeStyle = 'rgba(46, 28, 14, 0.34)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 240; i++) {
    const horiz = rng() > 0.45;
    const px = ox0 + rng() * PW;
    const py = oy0 + rng() * (oy1 - oy0);
    if (px > ix0 + 2 && px < ix1 - 2 && py > iy0 + 2 && py < iy1 - 2) continue;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + (horiz ? 12 + rng() * 18 : 1.5), py + (horiz ? 1.2 : 12 + rng() * 18));
    ctx.stroke();
  }

  // Chipped white calcium-carbonate lime stucco (`碳酸钙白灰泥`) with exposed bark edges
  ctx.fillStyle = '#e7d7b6';
  ctx.fillRect(ox0 + 2.2, oy0 + 2.4, PW - 4.4, oy1 - oy0 - 4.8);
  for (let c = 0; c < 95; c++) {
    const cx = rng() > 0.5 ? ox0 + rng() * 4 : ox1 - rng() * 4;
    const cy = oy0 + rng() * (oy1 - oy0);
    ctx.fillStyle = rng() > 0.35 ? '#734d2c' : '#f5ebd4';
    ctx.fillRect(cx - 1.5, cy - 2, 3.2, 4.5);
  }

  // Classic Dresden Codex mineral cinnabar-red (`#a83020`) framing border band
  ctx.strokeStyle = '#a83020';
  ctx.lineWidth = 2.4;
  ctx.strokeRect(ox0 + 5.2, OY + 4.2, PW - 10.4, PH - 8.4);

  // Screenfold accordion vertical V-crease shadow at x=0 and x=1000
  const foldL = ctx.createLinearGradient(ox0, 0, ox0 + 4.5, 0);
  foldL.addColorStop(0, 'rgba(28, 16, 8, 0.58)');
  foldL.addColorStop(1, 'rgba(28, 16, 8, 0)');
  ctx.fillStyle = foldL;
  ctx.fillRect(ox0, oy0, 4.5, oy1 - oy0);

  const foldR = ctx.createLinearGradient(ox1 - 4.5, 0, ox1, 0);
  foldR.addColorStop(0, 'rgba(28, 16, 8, 0)');
  foldR.addColorStop(1, 'rgba(28, 16, 8, 0.58)');
  ctx.fillStyle = foldR;
  ctx.fillRect(ox1 - 4.5, oy0, 4.5, oy1 - oy0);

  ctx.restore();
}

function bakeMughalFrame(ctx, rng) {
  // #08 Imperial Mughal *Muraqqa* Burnished 24k Gold *Jadval* & Lapis Folio Lip
  // STRICT GUARD (#139): inward = 5.5px (<= 6px!) so inner lapis floral *hashiya* is 100% preserved!
  const ox0 = OX;
  const ox1 = OX + PW;
  const oy0 = OY - 9;
  const oy1 = OY + PH + 6.5;
  const ix0 = OX + 5.5;
  const ix1 = OX + PW - 5.5;
  const iy0 = OY + 5.5;
  const iy1 = OY + PH - 5.5;

  drawWallDropShadow(ctx, ox0, ox1, oy1, OY + PH + 8.5, 0.28);

  ctx.save();
  clipFrameBand(ctx, ox0, oy0, ox1, oy1, ix0, iy0, ix1, iy1);

  // Outer Imperial *Wasli* gold-flecked salmon-buff album folio margin (top & bottom outward)
  ctx.fillStyle = '#d7be96';
  ctx.fillRect(ox0, oy0, PW, oy1 - oy0);

  // *Afshan* 24k gold dust flecks on outward folio lip
  for (let i = 0; i < 110; i++) {
    const px = ox0 + rng() * PW;
    const py = rng() > 0.5 ? oy0 + rng() * 9 : OY + PH + rng() * 6.5;
    ctx.fillStyle = rng() > 0.4 ? 'rgba(232, 188, 82, 0.55)' : 'rgba(184, 132, 40, 0.40)';
    ctx.fillRect(px, py, 1.3, 1.1);
  }

  // Deep Badakhshan ultramarine lapis outer framing band
  ctx.fillStyle = '#173a4c';
  ctx.fillRect(ox0, OY - 2.5, PW, PH + 5.0);

  // Agate-burnished 24k gold leaf *jadval* rule (`[1.8..4.6px]` inward)
  const goldG = ctx.createLinearGradient(ox0, OY, ox1, OY + PH);
  goldG.addColorStop(0.0, '#c6922c');
  goldG.addColorStop(0.28, '#edd078');
  goldG.addColorStop(0.54, '#d49e35');
  goldG.addColorStop(0.80, '#f2d988');
  goldG.addColorStop(1.0, '#b58224');
  ctx.strokeStyle = goldG;
  ctx.lineWidth = 2.6;
  ctx.strokeRect(ox0 + 3.1, OY + 3.1, PW - 6.2, PH - 6.2);

  ctx.restore();

  // Crisp 0.7px cinnabar + lampblack *jadval* precision hairlines
  ctx.strokeStyle = '#c43b29';
  ctx.lineWidth = 0.75;
  ctx.strokeRect(ox0 + 1.4, OY + 1.4, PW - 2.8, PH - 2.8);

  ctx.strokeStyle = '#1a1612';
  ctx.lineWidth = 0.7;
  ctx.strokeRect(ix0 - 0.35, iy0 - 0.35, PW - 10.3, PH - 10.3);
}

function bakeUkiyoeFrame(ctx, rng) {
  // #11 Edo Woodblock Echizen *Washi* `余白` Paper Margin, Sumi Keyblock Rule & `見当` (*Kentō*)
  const ox0 = OX;
  const ox1 = OX + PW;
  const oy0 = OY - 7;
  const oy1 = OY + PH + 6;
  const ix0 = OX + 8.5;
  const ix1 = OX + PW - 8.5;
  const iy0 = OY + 8.5;
  const iy1 = OY + PH - 8.5;

  drawWallDropShadow(ctx, ox0, ox1, oy1, OY + PH + 8.5, 0.26);

  ctx.save();
  clipFrameBand(ctx, ox0, oy0, ox1, oy1, ix0, iy0, ix1, iy1);

  // Unbleached Echizen *hōsho* mulberry *washi* margin (`越前奉書紙余白`)
  const washiG = ctx.createLinearGradient(ox0, oy0, ox1, oy1);
  washiG.addColorStop(0, '#f1e6cd');
  washiG.addColorStop(0.5, '#ece0c4');
  washiG.addColorStop(1, '#e4d6b7');
  ctx.fillStyle = washiG;
  ctx.fillRect(ox0, oy0, PW, oy1 - oy0);

  // Fine kozo mulberry fibers in the unprinted margin
  ctx.strokeStyle = 'rgba(168, 146, 112, 0.22)';
  ctx.lineWidth = 0.55;
  for (let i = 0; i < 160; i++) {
    const px = ox0 + rng() * PW;
    const py = oy0 + rng() * (oy1 - oy0);
    if (px > ix0 && px < ix1 && py > iy0 && py < iy1) continue;
    const ang = rng() * Math.PI;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.cos(ang) * 7, py + Math.sin(ang) * 7);
    ctx.stroke();
  }

  // Authentic woodblock printer's `見当` (*kentō*) registration notches in the margin!
  // 1) Right-bottom `かぎ見当` (L-shaped corner registration mark)
  ctx.strokeStyle = 'rgba(42, 38, 33, 0.52)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(ox1 - 6.8, OY + 942);
  ctx.lineTo(ox1 - 2.2, OY + 942);
  ctx.lineTo(ox1 - 2.2, OY + 962);
  ctx.stroke();
  // Embossed *baren* blind-impression highlight next to kentō
  ctx.strokeStyle = 'rgba(255, 252, 242, 0.65)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(ox1 - 6.8, OY + 943.1);
  ctx.lineTo(ox1 - 3.1, OY + 943.1);
  ctx.lineTo(ox1 - 3.1, OY + 962);
  ctx.stroke();

  // 2) Bottom-left `引きつけ見当` (horizontal stop bar)
  ctx.strokeStyle = 'rgba(42, 38, 33, 0.48)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(OX + 132, OY + PH - 2.4);
  ctx.lineTo(OX + 156, OY + PH - 2.4);
  ctx.stroke();

  ctx.restore();

  // Hand-carved cherrywood sumi-black keyblock frame rule (`輪郭線`, slight organic woodcut edge)
  ctx.strokeStyle = '#1e1c19';
  ctx.lineWidth = 1.55;
  ctx.strokeRect(ix0 - 0.8, iy0 - 0.8, PW - 15.4, PH - 15.4);

  // Subtle outer deckle paper shadow
  ctx.strokeStyle = 'rgba(65, 54, 40, 0.30)';
  ctx.lineWidth = 0.75;
  ctx.strokeRect(ox0 + 0.4, oy0 + 0.4, PW - 0.8, oy1 - oy0 - 0.8);
}

// =============================================================================
// 6. Family 4 — `wayang_proscenium` (#10 Wayang)
// =============================================================================

function bakeWayangFrame(ctx, rng) {
  // #10 Javanese Carved Teakwood Proscenium, Bamboo *Kelir* Lashing & *Gedebog* Banana-Trunk Rail
  const ox0 = OX;
  const ox1 = OX + PW;
  const oy0 = OY - 12;
  const oy1 = OY + PH + 7;
  const ix0 = OX + 10;
  const ix1 = OX + PW - 10;
  const iy0 = OY + 9.5;
  const iy1 = OY + PH - 9.5;

  drawWallDropShadow(ctx, ox0, ox1, oy1, OY + PH + 9, 0.36);

  ctx.save();
  clipFrameBand(ctx, ox0, oy0, ox1, oy1, ix0, iy0, ix1, iy1);

  // 1. Top & Vertical Stiles: Oil-rubbed Javanese *jati* teakwood (`#3b1c0b`)
  drawMitredMolding(ctx, ox0, oy0, ox1, oy1, ix0, iy0, ix1, iy1, {
    top: [
      [0.0, '#2a1206'],
      [0.38, '#5c2d13'],
      [0.72, '#421e0b'],
      [1.0, '#210e04'],
    ],
    bottom: [
      [0.0, '#363f1a'],
      [0.45, '#59662c'],
      [1.0, '#2b3314'],
    ],
    left: [
      [0.0, '#261005'],
      [0.5, '#542811'],
      [1.0, '#2c1408'],
    ],
    right: [
      [0.0, '#2c1408'],
      [0.5, '#542811'],
      [1.0, '#240f05'],
    ],
  });

  // 2. Carved *ukiran Majapahit* gold-leaf (`prada`) scroll relief along top beam & vertical stiles
  ctx.strokeStyle = 'rgba(224, 162, 58, 0.48)';
  ctx.lineWidth = 1.05;
  for (let x = ox0 + 16; x < ox1 - 16; x += 24) {
    ctx.beginPath();
    ctx.arc(x, OY - 1.5, 4.2, 0.15 * Math.PI, 1.35 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 9, OY - 1.5, 3.2, 1.15 * Math.PI, 2.25 * Math.PI);
    ctx.stroke();
  }

  // 3. Stretched cotton *kelir* bamboo/rattan cord lashing (`tali bambu`) along left & right edges!
  const drawKelirLashing = (lx, dir) => {
    for (let y = iy0 + 12; y < iy1 - 12; y += 24) {
      // Brass/punched cotton eyelet dot
      ctx.fillStyle = '#241207';
      ctx.beginPath();
      ctx.arc(lx, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
      // Diagonal rattan cord loop
      ctx.strokeStyle = '#d4a359';
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(lx, y);
      ctx.lineTo(lx + dir * 5.8, y - 6.5);
      ctx.moveTo(lx, y);
      ctx.lineTo(lx + dir * 5.8, y + 6.5);
      ctx.stroke();
    }
  };
  drawKelirLashing(ix0 - 1.5, -1);
  drawKelirLashing(ix1 + 1.5, 1);

  // 4. Bottom Rail: Fibrous green-ochre banana-tree trunk (`gedebog`) base rail!
  const gedG = ctx.createLinearGradient(0, iy1, 0, oy1);
  gedG.addColorStop(0.0, '#6a7636');
  gedG.addColorStop(0.32, '#828e46');
  gedG.addColorStop(0.72, '#4d5824');
  gedG.addColorStop(1.0, '#2d3514');
  ctx.fillStyle = gedG;
  ctx.fillRect(ox0 + 4, iy1, PW - 8, oy1 - iy1);

  // Longitudinal vascular banana-stem fibers & horn-rod peg holes
  for (let y = iy1 + 1.5; y < oy1 - 1; y += 2.2) {
    ctx.strokeStyle =
      rng() > 0.45 ? 'rgba(214, 210, 142, 0.22)' : 'rgba(28, 34, 10, 0.30)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(ox0 + 6, y);
    ctx.lineTo(ox1 - 6, y);
    ctx.stroke();
  }
  for (let x = ox0 + 38; x < ox1 - 30; x += 46) {
    ctx.fillStyle = 'rgba(24, 20, 8, 0.55)';
    ctx.fillRect(x + (rng() - 0.5) * 6, iy1 + 3.2, 2.2, 1.8);
  }

  ctx.restore();
}

// =============================================================================
// 7. Family 5 — `museum_easel` (#12 Starry Night, #13 Scream)
// =============================================================================

function bakeMuseumEaselFrame(ctx, rng, scene) {
  const isStarry = scene.id === 's12_starry';
  // STRICT GUARD (#139): #12 inward <= 12px (11.5px total incl. 3px oatmeal linen liner!)
  const inW = isStarry ? 11.5 : 11.0;
  const ox0 = OX;
  const ox1 = OX + PW;
  const oy0 = OY - 14;
  const oy1 = OY + PH + 7.5;
  const ix0 = OX + inW;
  const ix1 = OX + PW - inW;
  const iy0 = OY + inW;
  const iy1 = OY + PH - inW;

  drawWallDropShadow(ctx, ox0, ox1, oy1, OY + PH + 9.5, 0.38);

  if (isStarry) {
    // #12 Deep Carved French Post-Impressionist Antique Giltwood + Raw Oatmeal Linen Slip
    const lipW = 3.0; // inner oatmeal linen liner
    const gx0 = ix0 - lipW;
    const gx1 = ix1 + lipW;
    const gy0 = iy0 - lipW;
    const gy1 = iy1 + lipW;

    // Outer carved gesso giltwood ogee molding
    drawMitredMolding(ctx, ox0, oy0, ox1, oy1, gx0, gy0, gx1, gy1, {
      top: [
        [0.0, '#5a4118'],
        [0.24, '#cfa042'],
        [0.48, '#f0d57c'],
        [0.74, '#9b7228'],
        [1.0, '#4f3814'],
      ],
      bottom: [
        [0.0, '#3e2b0f'],
        [0.35, '#8c6623'],
        [0.68, '#b58834'],
        [1.0, '#33220b'],
      ],
      left: [
        [0.0, '#4e3714'],
        [0.34, '#c2943b'],
        [0.62, '#e3c46a'],
        [1.0, '#593f17'],
      ],
      right: [
        [0.0, '#4a3412'],
        [0.38, '#b58833'],
        [0.70, '#966d24'],
        [1.0, '#38260d'],
      ],
    });

    // Carved acanthus/gadroon relief ticks & aged red Armenian bole peeking through gilt
    ctx.save();
    clipFrameBand(ctx, ox0, oy0, ox1, oy1, gx0, gy0, gx1, gy1);
    for (let k = 0; k < 220; k++) {
      const px = ox0 + rng() * PW;
      const py = oy0 + rng() * (oy1 - oy0);
      if (px > gx0 && px < gx1 && py > gy0 && py < gy1) continue;
      ctx.fillStyle =
        rng() > 0.32 ? 'rgba(255, 238, 172, 0.22)' : 'rgba(128, 44, 26, 0.24)';
      ctx.fillRect(px, py, 2.2, 1.4);
    }
    ctx.strokeStyle = 'rgba(64, 42, 12, 0.36)';
    ctx.lineWidth = 1.0;
    for (let x = ox0 + 8; x < ox1 - 8; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, oy0 + 3);
      ctx.lineTo(x + 2, oy0 + 8);
      ctx.moveTo(x, oy1 - 3);
      ctx.lineTo(x + 2, oy1 - 7);
      ctx.stroke();
    }
    ctx.restore();

    // Raw French oatmeal linen canvas liner (`亚麻内衬边`, 3px wide)
    ctx.save();
    clipFrameBand(ctx, gx0, gy0, gx1, gy1, ix0, iy0, ix1, iy1);
    ctx.fillStyle = '#d6ccb6';
    ctx.fillRect(gx0, gy0, gx1 - gx0, gy1 - gy0);
    ctx.strokeStyle = 'rgba(112, 98, 76, 0.28)';
    ctx.lineWidth = 0.6;
    for (let t = 0; t < PW; t += 2.5) {
      ctx.beginPath();
      ctx.moveTo(ox0 + t, gy0);
      ctx.lineTo(ox0 + t, gy1);
      ctx.stroke();
    }
    ctx.restore();

    ctx.strokeStyle = 'rgba(20, 16, 12, 0.62)';
    ctx.lineWidth = 0.95;
    ctx.strokeRect(ix0 - 0.4, iy0 - 0.4, PW - 2 * inW + 0.8, PH - 2 * inW + 0.8);
  } else {
    // #13 Dark Stained Nordic Pine Expressionist Frame + Muted Blood-Vermilion Fillet
    const filW = 2.2;
    const wx0 = ix0 - filW;
    const wx1 = ix1 + filW;
    const wy0 = iy0 - filW;
    const wy1 = iy1 + filW;

    drawMitredMolding(ctx, ox0, oy0, ox1, oy1, wx0, wy0, wx1, wy1, {
      top: [
        [0.0, '#1e1310'],
        [0.42, '#462a21'],
        [0.75, '#352019'],
        [1.0, '#19100d'],
      ],
      bottom: [
        [0.0, '#160e0c'],
        [0.5, '#2e1b15'],
        [1.0, '#120b09'],
      ],
      left: [
        [0.0, '#1a100e'],
        [0.48, '#3f261e'],
        [1.0, '#1e1310'],
      ],
      right: [
        [0.0, '#1e1310'],
        [0.52, '#362019'],
        [1.0, '#150d0b'],
      ],
    });

    // Sweeping undulating Nordic pine woodgrain lines
    ctx.save();
    clipFrameBand(ctx, ox0, oy0, ox1, oy1, wx0, wy0, wx1, wy1);
    ctx.strokeStyle = 'rgba(18, 9, 7, 0.38)';
    ctx.lineWidth = 0.85;
    for (let g = 0; g < 6; g++) {
      ctx.beginPath();
      for (let x = ox0; x <= ox1; x += 16) {
        const yTop = oy0 + 2.5 + g * 3.4 + Math.sin(x * 0.025 + g) * 1.4;
        if (x === ox0) ctx.moveTo(x, yTop);
        else ctx.lineTo(x, yTop);
      }
      ctx.stroke();
    }
    ctx.restore();

    // Tense muted blood-vermilion & ochre inner rabbet fillet
    ctx.strokeStyle = '#b64626';
    ctx.lineWidth = 2.0;
    ctx.strokeRect(ix0 - 1.1, iy0 - 1.1, PW - 2 * inW + 2.2, PH - 2 * inW + 2.2);

    ctx.strokeStyle = 'rgba(18, 11, 9, 0.70)';
    ctx.lineWidth = 0.9;
    ctx.strokeRect(ix0 - 0.3, iy0 - 0.3, PW - 2 * inW + 0.6, PH - 2 * inW + 0.6);
  }
}

// =============================================================================
// 8. Family 6 — `nitrate_strip` (#14 Nosferatu)
// =============================================================================

function bakeNitrateFrame(ctx, rng) {
  // #14 1922 35mm Silver-Nitrate Silent Film Stock w/ Authentic BH-1866 Sprocket Perforations
  const ox0 = OX;
  const ox1 = OX + PW;
  const oy0 = OY - 6;
  const oy1 = OY + PH + 6;
  const stileW = 12.8; // <= 13px inward on vertical stiles
  const barH = 4.8; // slim silent-aperture frame line top & bottom
  const ix0 = OX + stileW;
  const ix1 = OX + PW - stileW;
  const iy0 = OY + barH;
  const iy1 = OY + PH - barH;

  drawWallDropShadow(ctx, ox0, ox1, oy1, OY + PH + 8.5, 0.40);

  ctx.save();
  clipFrameBand(ctx, ox0, oy0, ox1, oy1, ix0, iy0, ix1, iy1);

  // Matte silver-gelatin black cellulose-nitrate base
  const nitG = ctx.createLinearGradient(ox0, 0, ox1, 0);
  nitG.addColorStop(0.0, '#141311');
  nitG.addColorStop(0.02, '#1d1b18');
  nitG.addColorStop(0.5, '#11100e');
  nitG.addColorStop(0.98, '#1d1b18');
  nitG.addColorStop(1.0, '#141311');
  ctx.fillStyle = nitG;
  ctx.fillRect(ox0, oy0, PW, oy1 - oy0);

  // Longitudinal projector-gate silver-halide emulsion scratches down vertical stiles
  for (let s = 0; s < 14; s++) {
    const onLeft = s < 7;
    const sx = onLeft ? ox0 + 1.2 + rng() * 10.2 : ix1 + 1.2 + rng() * 10.2;
    const sy = oy0 + rng() * 240;
    const len = 180 + rng() * 620;
    ctx.strokeStyle =
      s % 3 === 0 ? 'rgba(218, 206, 178, 0.16)' : 'rgba(72, 66, 56, 0.24)';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + (rng() - 0.5) * 0.6, Math.min(oy1, sy + len));
    ctx.stroke();
  }

  // 16 Authentic Kodak/Pathé 35mm Sprocket Perforations (`胶片齿孔`) per vertical stile!
  const perfCount = 16;
  const pitch = PH / perfCount; // 62.5px exact rhythmic spacing
  const pw = 6.8;
  const ph = 4.8;

  const drawSprocketHole = (cx, cy) => {
    const xL = cx - pw * 0.5;
    const yT = cy - ph * 0.5;
    // Die-punched Bell & Howell rounded-side perforation path
    ctx.beginPath();
    ctx.moveTo(xL + 1.3, yT);
    ctx.lineTo(xL + pw - 1.3, yT);
    ctx.quadraticCurveTo(xL + pw, cy, xL + pw - 1.3, yT + ph);
    ctx.lineTo(xL + 1.3, yT + ph);
    ctx.quadraticCurveTo(xL, cy, xL + 1.3, yT);
    ctx.closePath();

    // Warm projector-gate / gallery-wall backlit sepia glow inside hole
    const hg = ctx.createLinearGradient(xL, yT, xL, yT + ph);
    hg.addColorStop(0, '#968970');
    hg.addColorStop(0.35, '#d4c6a8');
    hg.addColorStop(1, '#aea085');
    ctx.fillStyle = hg;
    ctx.fill();

    // Celluloid stock thickness inner shadow + crisp die-cut rim
    ctx.strokeStyle = 'rgba(10, 9, 8, 0.85)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(232, 220, 194, 0.28)';
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(xL + 1.3, yT + ph + 0.45);
    ctx.lineTo(xL + pw - 1.3, yT + ph + 0.45);
    ctx.stroke();
  };

  for (let i = 0; i < perfCount; i++) {
    const cy = OY + (i + 0.5) * pitch;
    drawSprocketHole(ox0 + 6.4, cy);
    drawSprocketHole(ox1 - 6.4, cy);
  }

  // Faint optical edge-print stock code (`AGFA · NITRATE · 1922`) along outer edge
  ctx.save();
  ctx.fillStyle = 'rgba(196, 182, 152, 0.30)';
  ctx.font = '600 5.5px "PelicanMono", monospace';
  ctx.textAlign = 'center';
  ctx.translate(ox0 + 2.1, OY + 312);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('AGFA · NITRATE · 35MM · 1922', 0, 0);
  ctx.restore();

  ctx.restore();

  // Soft silent-gate optical halation edge around aperture
  ctx.strokeStyle = 'rgba(198, 186, 158, 0.28)';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(ix0 - 0.4, iy0 - 0.4, PW - 2 * stileW + 0.8, PH - 2 * barH + 0.8);
}

// =============================================================================
// 9. Family 7 — `hardware_digital` (#15..#20 — NO Wall Placards!)
// =============================================================================

function drawSlottedMachineScrew(ctx, cx, cy, r, slotAngle) {
  ctx.save();
  // Counterbore recess shadow
  ctx.fillStyle = 'rgba(8, 11, 10, 0.72)';
  ctx.beginPath();
  ctx.arc(cx + 0.5, cy + 0.7, r + 1.0, 0, Math.PI * 2);
  ctx.fill();

  // Machined stainless steel head
  const sg = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 0.4, cx, cy, r);
  sg.addColorStop(0.0, '#dce4e1');
  sg.addColorStop(0.55, '#869490');
  sg.addColorStop(1.0, '#394240');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Screwdriver slot
  ctx.translate(cx, cy);
  ctx.rotate(slotAngle);
  ctx.fillStyle = '#1b211f';
  ctx.fillRect(-r * 0.76, -0.75, r * 1.52, 1.5);
  ctx.fillStyle = 'rgba(235, 244, 240, 0.45)';
  ctx.fillRect(-r * 0.72, 0.75, r * 1.44, 0.5);
  ctx.restore();
}

function bakeOscilloscopeFrame(ctx, rng) {
  // #15 1950s Tektronix Brushed Slate-Aluminum Rack Chassis Bezel + 4 Corner Screws
  const ox0 = OX;
  const ox1 = OX + PW;
  const oy0 = OY - 12;
  const oy1 = OY + PH + 12; // No placard on #15..#20!
  const inW = 10.5;
  const ix0 = OX + inW;
  const ix1 = OX + PW - inW;
  const iy0 = OY + inW;
  const iy1 = OY + PH - inW;

  drawWallDropShadow(ctx, ox0, ox1, oy1, oy1 + 7, 0.42);

  drawMitredMolding(ctx, ox0, oy0, ox1, oy1, ix0, iy0, ix1, iy1, {
    top: [
      [0.0, '#2a3330'],
      [0.35, '#596763'],
      [0.72, '#434f4c'],
      [1.0, '#202725'],
    ],
    bottom: [
      [0.0, '#1e2523'],
      [0.45, '#3b4643'],
      [1.0, '#181e1c'],
    ],
    left: [
      [0.0, '#27302d'],
      [0.5, '#4b5854'],
      [1.0, '#222927'],
    ],
    right: [
      [0.0, '#222927'],
      [0.5, '#45514e'],
      [1.0, '#1d2422'],
    ],
  });

  // Brushed anodized aluminum horizontal hairlines
  ctx.save();
  clipFrameBand(ctx, ox0, oy0, ox1, oy1, ix0, iy0, ix1, iy1);
  for (let y = oy0 + 1; y < oy1; y += 2) {
    if (y > iy0 && y < iy1) continue;
    const a = (rng() - 0.5) * 0.08;
    ctx.fillStyle =
      a > 0
        ? `rgba(220, 236, 230, ${a.toFixed(3)})`
        : `rgba(12, 16, 15, ${(-a * 1.2).toFixed(3)})`;
    ctx.fillRect(ox0 + 1, y, PW - 2, 1);
  }
  ctx.restore();

  // 4 Corner Slotted Stainless Machine Screws
  drawSlottedMachineScrew(ctx, ox0 + 7.2, oy0 + 9.5, 3.4, 0.42);
  drawSlottedMachineScrew(ctx, ox1 - 7.2, oy0 + 9.5, 3.4, -0.65);
  drawSlottedMachineScrew(ctx, ox0 + 7.2, oy1 - 9.5, 3.4, 1.05);
  drawSlottedMachineScrew(ctx, ox1 - 7.2, oy1 - 9.5, 3.4, -0.28);

  // Recessed steel CRT hood bevel + subtle P1 green (#39ff7a) phosphor edge reflection
  ctx.strokeStyle = 'rgba(57, 255, 122, 0.22)';
  ctx.lineWidth = 1.0;
  ctx.strokeRect(ix0 - 0.6, iy0 - 0.6, PW - 2 * inW + 1.2, PH - 2 * inW + 1.2);
}

function bake8BitFrame(ctx, rng) {
  // #16 1980s Famicom / CRT TV Molded Charcoal-ABS Bezel w/ Red-Gold Pinstripe & Power LED
  const ox0 = OX;
  const ox1 = OX + PW;
  const oy0 = OY - 11;
  const oy1 = OY + PH + 12;
  const inW = 9.5;
  const ix0 = OX + inW;
  const ix1 = OX + PW - inW;
  const iy0 = OY + inW;
  const iy1 = OY + PH - inW;

  drawWallDropShadow(ctx, ox0, ox1, oy1, oy1 + 6, 0.40);

  ctx.save();
  clipFrameBand(ctx, ox0, oy0, ox1, oy1, ix0, iy0, ix1, iy1);

  // Molded dark charcoal-navy consumer TV ABS plastic
  const tvG = ctx.createLinearGradient(0, oy0, 0, oy1);
  tvG.addColorStop(0.0, '#313548');
  tvG.addColorStop(0.15, '#232636');
  tvG.addColorStop(0.85, '#1d202e');
  tvG.addColorStop(1.0, '#141620');
  ctx.fillStyle = tvG;
  ctx.fillRect(ox0, oy0, PW, oy1 - oy0);

  // Pebble-grain textured plastic stipple
  for (let i = 0; i < 280; i++) {
    const px = ox0 + rng() * PW;
    const py = rng() > 0.5 ? oy0 + rng() * 20 : iy1 + rng() * 21;
    ctx.fillStyle = rng() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.18)';
    ctx.fillRect(px, py, 1.5, 1.5);
  }

  // Iconic 80s Famicom / Trinitron metallic gold + crimson twin pinstripe!
  ctx.strokeStyle = '#9e2420';
  ctx.lineWidth = 1.6;
  ctx.strokeRect(ox0 + 3.2, oy0 + 3.8, PW - 6.4, oy1 - oy0 - 7.6);

  ctx.strokeStyle = '#d8a63a';
  ctx.lineWidth = 1.0;
  ctx.strokeRect(ox0 + 5.2, oy0 + 5.8, PW - 10.4, oy1 - oy0 - 11.6);

  // Molded speaker grill slots on bottom-left outward chin + glowing red CRT power LED on right!
  ctx.fillStyle = '#0d0e15';
  for (let k = 0; k < 10; k++) {
    ctx.fillRect(ox0 + 34 + k * 7, OY + PH + 3.5, 4.2, 4.5);
  }
  const ledX = ox1 - 42;
  const ledY = OY + PH + 5.6;
  const ledG = ctx.createRadialGradient(ledX, ledY, 0.4, ledX, ledY, 4.5);
  ledG.addColorStop(0, '#ff7a7a');
  ledG.addColorStop(0.45, '#ff2424');
  ledG.addColorStop(1, 'rgba(255, 36, 36, 0)');
  ctx.fillStyle = ledG;
  ctx.beginPath();
  ctx.arc(ledX, ledY, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Inner dark curved CRT glass bezel lip
  ctx.strokeStyle = '#0e1018';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(ix0 - 0.6, iy0 - 0.6, PW - 2 * inW + 1.2, PH - 2 * inW + 1.2);
}

function bakeWin2000CRTFrame(ctx, rng) {
  // #17 Ca. 2000 Warm Putty-Beige CRT Monitor Bezel
  // STRICT GUARD (#139): Bottom inward <= 3px (2.2px!) so Win2000 Start button & taskbar
  // (`y = 966..1000`) remain 100% unobstructed; CRT chin + OSD buttons + green LED sit outward!
  const ox0 = OX;
  const ox1 = OX + PW;
  const oy0 = OY - 13;
  const oy1 = OY + PH + 16; // Outward CRT monitor chin y=1000..1016!
  const ix0 = OX + 8.5;
  const ix1 = OX + PW - 8.5;
  const iy0 = OY + 8.5;
  const iy1 = OY + PH - 2.2; // <= 3px bottom inward guard!

  drawWallDropShadow(ctx, ox0, ox1, oy1, oy1 + 7, 0.40);

  drawMitredMolding(ctx, ox0, oy0, ox1, oy1, ix0, iy0, ix1, iy1, {
    top: [
      [0.0, '#ebe6da'],
      [0.32, '#dcd6c8'],
      [0.78, '#c5bfb1'],
      [1.0, '#8d877b'],
    ],
    bottom: [
      [0.0, '#858074'],
      [0.22, '#cfc9bb'],
      [0.72, '#c2bcb0'],
      [1.0, '#999386'],
    ],
    left: [
      [0.0, '#e2ddd0'],
      [0.55, '#d2ccc0'],
      [1.0, '#969084'],
    ],
    right: [
      [0.0, '#969084'],
      [0.45, '#cbc5b8'],
      [1.0, '#aba598'],
    ],
  });

  ctx.save();
  clipFrameBand(ctx, ox0, oy0, ox1, oy1, ix0, iy0, ix1, iy1);

  // Subtle matte office-beige plastic speckle
  for (let i = 0; i < 200; i++) {
    const px = ox0 + rng() * PW;
    const py = rng() > 0.5 ? oy0 + rng() * 21 : OY + PH + rng() * 16;
    ctx.fillStyle = rng() > 0.5 ? 'rgba(255,255,255,0.16)' : 'rgba(80,74,64,0.10)';
    ctx.fillRect(px, py, 1.4, 1.2);
  }

  // Outward CRT bottom chin (`worldY = 1000..1016`): 4 tactile OSD buttons + green power LED!
  const chinY = OY + PH + 8.2;
  for (let b = 0; b < 4; b++) {
    const bx = ox1 - 152 + b * 22;
    ctx.fillStyle = '#999386';
    ctx.fillRect(bx, chinY - 2.2, 12, 4.6);
    ctx.fillStyle = '#e5e0d4';
    ctx.fillRect(bx + 0.6, chinY - 1.7, 10.8, 3.2);
  }

  // Glowing lime-green (`#4cd938`) CRT monitor power LED + power button circle
  const pwrBtnX = ox1 - 48;
  ctx.strokeStyle = '#8b8579';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(pwrBtnX, chinY, 4.2, 0, Math.PI * 2);
  ctx.stroke();

  const ledX = ox1 - 32;
  const ledG = ctx.createRadialGradient(ledX, chinY, 0.3, ledX, chinY, 4.2);
  ledG.addColorStop(0, '#c8ffbe');
  ledG.addColorStop(0.45, '#42d62e');
  ledG.addColorStop(1, 'rgba(66, 214, 46, 0)');
  ctx.fillStyle = ledG;
  ctx.beginPath();
  ctx.arc(ledX, chinY, 4.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Crisp dark CRT anti-glare glass gasket shadow hairline (strictly 1.2px at bottom!)
  ctx.strokeStyle = 'rgba(24, 24, 26, 0.82)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(ix0 - 0.5, iy0 - 0.5, ix1 - ix0 + 1.0, iy1 - iy0 + 1.0);
}

function bakeVaporwaveFrame(ctx, rng) {
  // #18 Smoked Broadcast PVM Bezel + VHS Overscan Head-Switching Chroma Bleed Edge
  const ox0 = OX;
  const ox1 = OX + PW;
  const oy0 = OY - 9;
  const oy1 = OY + PH + 9;
  const inW = 7.5;
  const ix0 = OX + inW;
  const ix1 = OX + PW - inW;
  const iy0 = OY + inW;
  const iy1 = OY + PH - inW;

  drawWallDropShadow(ctx, ox0, ox1, oy1, oy1 + 6, 0.38);

  ctx.save();
  clipFrameBand(ctx, ox0, oy0, ox1, oy1, ix0, iy0, ix1, iy1);

  // Dark smoked violet-graphite PVM chassis rim
  const pvmG = ctx.createLinearGradient(ox0, oy0, ox1, oy1);
  pvmG.addColorStop(0.0, '#1e162b');
  pvmG.addColorStop(0.5, '#140f1e');
  pvmG.addColorStop(1.0, '#1c1328');
  ctx.fillStyle = pvmG;
  ctx.fillRect(ox0, oy0, PW, oy1 - oy0);

  // Authentic VHS top & bottom overscan head-switching chroma noise line (`#00f0ff` / `#ff4ecd`)
  const drawChromaOverscan = (cy) => {
    let x = ix0;
    while (x < ix1) {
      const seg = 10 + rng() * 34;
      const w = Math.min(seg, ix1 - x);
      const pick = rng();
      ctx.fillStyle =
        pick < 0.44
          ? 'rgba(0, 240, 255, 0.62)'
          : pick < 0.86
            ? 'rgba(255, 78, 205, 0.62)'
            : 'rgba(255, 240, 255, 0.52)';
      ctx.fillRect(x, cy, w - 1.5, 1.7);
      x += seg;
    }
  };
  drawChromaOverscan(iy0 - 2.1);
  drawChromaOverscan(iy1 + 0.5);

  ctx.restore();

  // Subtle dual-chroma outer smoked acrylic edge highlight
  ctx.strokeStyle = 'rgba(157, 78, 221, 0.34)';
  ctx.lineWidth = 0.9;
  ctx.strokeRect(ox0 + 0.5, oy0 + 0.5, PW - 1, oy1 - oy0 - 1);
}

function bakeShortvideoFrame(ctx) {
  // #19 Sleek Minimal Dark PVD Titanium Smartphone Edge (inward = 4.5px; hidden when surroundDim > 0.6)
  const ox0 = OX;
  const ox1 = OX + PW;
  const oy0 = OY - 5;
  const oy1 = OY + PH + 5;
  const inW = 4.5;
  const ix0 = OX + inW;
  const ix1 = OX + PW - inW;
  const iy0 = OY + inW;
  const iy1 = OY + PH - inW;

  ctx.save();
  clipFrameBand(ctx, ox0, oy0, ox1, oy1, ix0, iy0, ix1, iy1);

  const phG = ctx.createLinearGradient(ox0, oy0, ox1, oy1);
  phG.addColorStop(0.0, '#252634');
  phG.addColorStop(0.45, '#12131a');
  phG.addColorStop(1.0, '#1d1f2b');
  ctx.fillStyle = phG;
  ctx.fillRect(ox0, oy0, PW, oy1 - oy0);
  ctx.restore();

  // 2.5D curved Gorilla Glass micro-specular catchlight
  ctx.strokeStyle = 'rgba(220, 230, 255, 0.20)';
  ctx.lineWidth = 0.85;
  ctx.strokeRect(ix0 - 0.5, iy0 - 0.5, PW - 2 * inW + 1, PH - 2 * inW + 1);
}

function bakeCodeGlassFrame(ctx) {
  // #20 Razor-Thin 3px Dark Anodized Aluminum & OLED Glass Hairline
  // Matches Tile #20 (`#1f2937` + `#58a6ff` micro-chamfer) for zero-pop Outro cross-dissolve!
  const ox0 = OX;
  const ox1 = OX + PW;
  const oy0 = OY - 2.5;
  const oy1 = OY + PH + 2.5;
  const inW = 3.0;
  const ix0 = OX + inW;
  const ix1 = OX + PW - inW;
  const iy0 = OY + inW;
  const iy1 = OY + PH - inW;

  ctx.save();
  clipFrameBand(ctx, ox0, oy0, ox1, oy1, ix0, iy0, ix1, iy1);
  ctx.fillStyle = '#1b2432';
  ctx.fillRect(ox0, oy0, PW, oy1 - oy0);
  ctx.restore();

  // Diamond-chamfered `#58a6ff` precision anodized inner hairline
  ctx.strokeStyle = 'rgba(88, 166, 255, 0.34)';
  ctx.lineWidth = 0.9;
  ctx.strokeRect(ix0 - 0.45, iy0 - 0.45, PW - 2 * inW + 0.9, PH - 2 * inW + 0.9);

  ctx.strokeStyle = 'rgba(15, 20, 28, 0.75)';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(ox0 + 0.4, oy0 + 0.4, PW - 0.8, oy1 - oy0 - 0.8);
}

// =============================================================================
// 10. Master Baked Panel-Frame Dispatcher & World Renderer
// =============================================================================

function getInwardMarginForPulse(scene) {
  switch (scene.id) {
    case 's04_tang':
    case 's05_song':
    case 's06_qingming':
      return 7.5;
    case 's08_mughal':
    case 's09_bada':
      return 5.5;
    case 's07_maya':
      return 8.0;
    case 's11_ukiyoe':
      return 8.5;
    case 's12_starry':
      return 11.5;
    case 's13_scream':
      return 11.0;
    case 's14_nosferatu':
      return 12.8;
    case 's15_oscilloscope':
      return 10.5;
    case 's16_8bit':
      return 9.5;
    case 's17_chat':
      return 8.5;
    case 's18_vaporwave':
      return 7.5;
    case 's19_shortvideo':
      return 4.5;
    case 's20_code':
      return 3.0;
    default:
      return 10.0;
  }
}

function getBakedPanelFrame(kit, scene) {
  return kit.bake2D(
    `panel_frame_s3_${scene.id}`,
    (_g, ctx, rng, bw, bh) => {
      ctx.clearRect(0, 0, bw, bh);

      // Strict horizontal neighbor non-interference clip:
      // Panel 1 may extend slightly left into empty pre-scroll wall; panels 2..20 stay >= OX (x=0)
      // and <= OX+PW (x=1000) so adjacent frames meet cleanly at k*1000 with zero overwrite!
      ctx.save();
      const clipX0 = scene.id === 's01_sahara_pre' ? 2 : OX;
      const clipX1 = scene.num === 20 ? bw - 2 : OX + PW;
      ctx.beginPath();
      ctx.rect(clipX0, 0, clipX1 - clipX0, bh);
      ctx.clip();

      switch (scene.id) {
        // Family 1: `stone_arch`
        case 's01_sahara':
          bakeSaharaFrame(ctx, rng, 'right_open_left');
          break;
        case 's01_sahara_pre':
          bakeSaharaFrame(ctx, rng, 'left_open_right');
          break;
        case 's02_egypt':
          bakeEgyptFrame(ctx, rng);
          break;
        case 's03_han':
          bakeHanFrame(ctx, rng);
          break;

        // Family 2: `silk_scroll`
        case 's04_tang':
        case 's05_song':
        case 's06_qingming':
        case 's09_bada':
          bakeSilkScrollFrame(ctx, rng, scene);
          break;

        // Family 3: `codex_print`
        case 's07_maya':
          bakeMayaFrame(ctx, rng);
          break;
        case 's08_mughal':
          bakeMughalFrame(ctx, rng);
          break;
        case 's11_ukiyoe':
          bakeUkiyoeFrame(ctx, rng);
          break;

        // Family 4: `wayang_proscenium`
        case 's10_wayang':
          bakeWayangFrame(ctx, rng);
          break;

        // Family 5: `museum_easel`
        case 's12_starry':
        case 's13_scream':
          bakeMuseumEaselFrame(ctx, rng, scene);
          break;

        // Family 6: `nitrate_strip`
        case 's14_nosferatu':
          bakeNitrateFrame(ctx, rng);
          break;

        // Family 7: `hardware_digital`
        case 's15_oscilloscope':
          bakeOscilloscopeFrame(ctx, rng);
          break;
        case 's16_8bit':
          bake8BitFrame(ctx, rng);
          break;
        case 's17_chat':
          bakeWin2000CRTFrame(ctx, rng);
          break;
        case 's18_vaporwave':
          bakeVaporwaveFrame(ctx, rng);
          break;
        case 's19_shortvideo':
          bakeShortvideoFrame(ctx);
          break;
        case 's20_code':
          bakeCodeGlassFrame(ctx);
          break;

        default:
          bakeMuseumEaselFrame(ctx, rng, scene);
          break;
      }

      ctx.restore();
    },
    BAKE_W,
    BAKE_H
  );
}

/**
 * Draws the era-authentic mounting / frame around Panel `i` on the main WEBGL canvas
 * (called inside world camera coordinates where Panel `i` spans `[worldX0, worldX0+1000] x [0, 1000]`).
 */
export function drawPanelFrame(p, scene, isActive = false, pulse = 0, kit = null) {
  const x0 = scene.worldX0;
  const y0 = 0;
  const w = PANEL_SIZE;
  const h = PANEL_SIZE;

  p.push();

  if (kit) {
    const frameG = getBakedPanelFrame(kit, scene);
    p.imageMode(p.CORNER);
    p.image(frameG, x0 - OX, y0 - OY, BAKE_W, BAKE_H);

    // Whisper-subtle museum grazing bevel sheen on beat cadence (<= 0.10 alpha, ZERO gaudy flash!)
    if (isActive && pulse > 0.0003) {
      const uPulse = Math.min(1, pulse / 0.005);
      const alpha = Math.round(uPulse * 24);
      if (alpha >= 2) {
        const inM = getInwardMarginForPulse(scene);
        const botM = scene.id === 's17_chat' ? 2.2 : inM;
        const accentCol = p.color(scene.frameAccent || '#e8d8b8');
        p.rectMode(p.CORNER);
        p.noFill();
        p.stroke(p.red(accentCol), p.green(accentCol), p.blue(accentCol), alpha);
        p.strokeWeight(1.0);
        p.rect(x0 + inM, y0 + inM, w - 2 * inM, h - inM - botM);
      }
    }
  } else {
    // Minimal fallback when `kit` is absent
    p.rectMode(p.CORNER);
    p.noFill();
    p.stroke(scene.frameColor || '#4a3728');
    p.strokeWeight(8);
    p.rect(x0 + 4, y0 + 4, w - 8, h - 8);
  }

  // Wall placards are now rendered at native 4K vector sharpness in `gallery_lighting.js`!
  p.pop();
}
