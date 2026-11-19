// src/openings/left_title_wall.js
// 1:1 Cover-Inherited Obsidian Title Wall (`x = 0..344`, `y = 0..720`) for Act I (`0.00s .. 3.55s`):
// - Locks `Hydrogen`, `鹈鹕` & `六千年的车` to the EXACT `÷3` coordinates & `#f3e5c2` gilt-ivory fill
// - Locks the Double Gold Frame (`x=28.08..931.92, y=28.08..691.92` & `36.72..683.28`) and Left Corner
//   pure-vector `羽轮纹章` crests (`(43.92, 43.92)` & `(43.92, 647.28)`, `28.80x28.80`)
// - Stamps the pure-vector Shuowen Xiaozhuan cinnabar seal (`「六千年」`) at upper-right shoulder `(300, 136)`

import { lerp, smootherstep } from '../fusion/github_core/beat/timeline.js';
import { createVectorCrestCanvas, createVectorSealCanvas } from './vector_emblems.js';

let sealStampImg = null;
let goldCrestImg = null;
let titleGlyphPaths = null;

async function loadTitleGlyphPaths(url) {
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data?.glyphs || {};
    if (typeof Path2D === 'undefined') return null;
    const compiled = {};
    for (const [ch, d] of Object.entries(raw)) {
      if (d) compiled[ch] = new Path2D(d);
    }
    return Object.keys(compiled).length >= 7 ? compiled : null;
  } catch {
    return null;
  }
}

export async function preloadLeftTitleWallAssets() {
  if (!sealStampImg) sealStampImg = createVectorSealCanvas(512);
  if (!goldCrestImg) goldCrestImg = createVectorCrestCanvas(256);
  if (!titleGlyphPaths) {
    titleGlyphPaths = await loadTitleGlyphPaths('./data/opening_title_glyphs.json');
  }
}

function drawDiamondNode(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r, cy);
  ctx.closePath();
  ctx.fill();
}

function getBakedLeftObsidianStele(kit, panelW, panelH) {
  return kit.bake2D(
    `intro_left_cover_locked_v5_${panelW}x${panelH}`,
    (_g, ctx, rng, w, h) => {
      // 1. Seamless matte obsidian base matching `gold_svg/scene.js` (`#120f0c`)
      ctx.fillStyle = '#120f0c';
      ctx.fillRect(0, 0, w, h);

      const g = ctx.createRadialGradient(w * 0.56, h * 0.44, 16, w * 0.52, h * 0.48, h * 0.72);
      g.addColorStop(0, 'rgba(34, 27, 20, 0.72)');
      g.addColorStop(0.58, 'rgba(20, 16, 12, 0.35)');
      g.addColorStop(1, 'rgba(18, 15, 12, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // 2. Subtle Xuan-stone micro-grain (blending cleanly into `x = 344` right stage)
      for (let i = 0; i < 620; i += 1) {
        const fx = rng() * (w - 18);
        const fy = rng() * h;
        ctx.strokeStyle =
          rng() > 0.56
            ? `rgba(244, 214, 156, ${(0.011 + rng() * 0.018).toFixed(3)})`
            : `rgba(0, 0, 0, ${(0.06 + rng() * 0.08).toFixed(3)})`;
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + 3 + rng() * 9, fy + (rng() - 0.5) * 1.4);
        ctx.stroke();
      }

      // 3. Exact `÷3` Cover Double-Gold Frame (clipped at `x = 344`, continued in `gold_svg/scene.js`)
      ctx.strokeStyle = '#c6a363';
      ctx.lineWidth = 0.85;
      ctx.strokeRect(28.08, 28.08, 903.84, 663.84);

      ctx.strokeStyle = '#c6a363';
      ctx.lineWidth = 0.50;
      ctx.strokeRect(36.72, 36.72, 886.56, 646.56);
    },
    panelW,
    panelH
  );
}

function drawCoverLockedGlyph(ctx, path2d, tx, ty, scale, fillStyle, reliefAlpha, specAlpha) {
  if (reliefAlpha > 0.01) {
    ctx.save();
    ctx.translate(tx + 1.5, ty + 2.1);
    ctx.scale(scale, -scale);
    ctx.fillStyle = `rgba(5, 3, 2, ${(0.82 * reliefAlpha).toFixed(3)})`;
    ctx.fill(path2d);
    ctx.restore();
  }

  ctx.save();
  ctx.translate(tx, ty);
  ctx.scale(scale, -scale);
  ctx.fillStyle = fillStyle;
  ctx.fill(path2d);
  if (specAlpha > 0.01) {
    ctx.strokeStyle = `rgba(255, 232, 176, ${specAlpha.toFixed(3)})`;
    ctx.lineWidth = 0.48 / scale;
    ctx.stroke(path2d);
  }
  ctx.restore();
}

export function drawLeftEditorialPanel(ctx, kit, panelX, panelW, panelH, doc, realT, anvilShock) {
  if (panelX + panelW <= 0) return;
  const wallBg = getBakedLeftObsidianStele(kit, panelW, panelH);

  ctx.save();
  ctx.translate(panelX, 0);
  ctx.drawImage(wallBg.canvas || wallBg, 0, 0, panelW, panelH);

  // Pure-code edition has no raster JPG cover overlay, so title relief & forge glow stay live from 0.00s!
  const postCoverU = 1.0;

  // 1. Warm forge hearth rim-glow + drifting micro-embers from the adjacent anvil
  const rimAlpha = (0.06 + anvilShock * 0.15) * postCoverU;
  const rimG = ctx.createLinearGradient(panelW - 110, 0, panelW, 0);
  rimG.addColorStop(0, 'rgba(245, 178, 72, 0)');
  rimG.addColorStop(1, `rgba(245, 178, 72, ${rimAlpha.toFixed(3)})`);
  ctx.fillStyle = rimG;
  ctx.fillRect(panelW - 110, 0, 110, panelH);

  if (anvilShock > 0.04) {
    ctx.save();
    ctx.fillStyle = `rgba(255, 214, 128, ${(anvilShock * 0.42).toFixed(3)})`;
    for (let i = 0; i < 6; i += 1) {
      const ey = ((140 + i * 83 - realT * (28 + i * 5)) % 560 + 560) % 560 + 80;
      const ex = panelW - 14 - ((i * 19) % 34) - Math.sin(realT * 5 + i) * 5;
      ctx.beginPath();
      ctx.arc(ex, ey, 1.1 + (i % 2) * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 2. Exact `÷3` Cover Left-Top & Left-Bottom pure-vector `羽轮纹章` Emblems (`x = 43.92, y = 43.92 / 647.28`)
  if (goldCrestImg) {
    ctx.save();
    ctx.globalAlpha = 0.96;
    ctx.drawImage(goldCrestImg, 43.92, 43.92, 28.8, 28.8);
    ctx.drawImage(goldCrestImg, 43.92, 647.28, 28.8, 28.8);
    ctx.restore();
  }

  // 3. Pure-vector Carved Shuowen Xiaozhuan Stone Seal (`「六千年」`) at upper-right shoulder `(300, 136)`
  const sealCx = 300;
  const sealCy = 136;
  const sealSize = 56 * (1 + anvilShock * 0.032);
  const stampEnter = smootherstep(0.02, 0.34, realT);
  if (sealStampImg) {
    ctx.save();
    ctx.translate(sealCx, sealCy);
    ctx.rotate(-0.018);
    const sScale = lerp(1.14, 1.0, stampEnter);
    ctx.scale(sScale, sScale);
    ctx.globalAlpha = lerp(0.88, 0.96, stampEnter);
    ctx.drawImage(sealStampImg, -sealSize * 0.5, -sealSize * 0.5, sealSize, sealSize);
    ctx.restore();
  }

  // 4. 100% Pure-Code Vector Outline Typography (`Hydrogen` + `鹈鹕` + `六千年的车`)
  const kicker = 'Hydrogen';
  const line1 = doc?.title?.line1 || '鹈鹕';
  const line2 = doc?.title?.line2 || '六千年的车';
  const specAlpha = 0.14 + anvilShock * 0.22;

  if (titleGlyphPaths) {
    // Row 0 (`Hydrogen`)
    const s0 = 0.036;
    const chars0 = [...kicker];
    const tx0 = [62.4, 94.416, 116.424, 141.852, 161.016, 185.292, 208.092, 230.64];
    for (let i = 0; i < chars0.length; i += 1) {
      const p2d = titleGlyphPaths[chars0[i]];
      if (p2d) {
        drawCoverLockedGlyph(ctx, p2d, tx0[i], 159.084, s0, '#f3e5c2', postCoverU, specAlpha * 0.7);
      }
    }

    // Row 1 (`鹈鹕`)
    const s1 = 0.1296;
    const chars1 = [...line1];
    if (chars1[0] && titleGlyphPaths[chars1[0]]) {
      drawCoverLockedGlyph(ctx, titleGlyphPaths[chars1[0]], 62.4, 297.36, s1, '#f3e5c2', postCoverU, specAlpha);
    }
    if (chars1[1] && titleGlyphPaths[chars1[1]]) {
      drawCoverLockedGlyph(ctx, titleGlyphPaths[chars1[1]], 199.68, 297.36, s1, '#f3e5c2', postCoverU, specAlpha);
    }

    // Row 2 (`六千年的车`)
    const s2 = 0.04992;
    const chars2 = [...line2];
    const tx2 = [62.4, 113.28, 164.16, 215.04, 265.92];
    for (let i = 0; i < chars2.length; i += 1) {
      const p2d = titleGlyphPaths[chars2[i]];
      const gx = tx2[i] ?? (62.4 + i * 50.88);
      if (p2d) {
        drawCoverLockedGlyph(ctx, p2d, gx, 374.331, s2, '#f3e5c2', postCoverU, specAlpha);
      }
    }
  } else {
    ctx.fillStyle = '#f3e5c2';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '900 36px "PelicanSerif", "CarbonSerif", serif';
    ctx.fillText(kicker, 62.4, 159.084);
    ctx.font = '900 128px "PelicanSerif", "CarbonSerif", serif';
    ctx.fillText(line1, 62.4, 297.36);
    const chars2 = [...line2];
    ctx.font = '900 49px "PelicanSerif", "CarbonSerif", serif';
    for (let i = 0; i < chars2.length; i += 1) {
      ctx.fillText(chars2[i], 62.4 + i * 50.88, 374.33);
    }
  }

  // 5. Subtle antique-gold horizontal finial rule beneath `六千年的车` (`y = 408`)
  const ruleY = 408;
  const midX = 195;
  ctx.save();
  const ruleGrad = ctx.createLinearGradient(64, ruleY, 326, ruleY);
  ruleGrad.addColorStop(0, 'rgba(206, 168, 98, 0.06)');
  ruleGrad.addColorStop(0.5, `rgba(236, 196, 120, ${(0.56 + anvilShock * 0.26).toFixed(2)})`);
  ruleGrad.addColorStop(1, 'rgba(206, 168, 98, 0.06)');
  ctx.strokeStyle = ruleGrad;
  ctx.lineWidth = 1.05;
  ctx.beginPath();
  ctx.moveTo(64, ruleY);
  ctx.lineTo(midX - 9, ruleY);
  ctx.moveTo(midX + 9, ruleY);
  ctx.lineTo(326, ruleY);
  ctx.stroke();

  ctx.fillStyle = `rgba(232, 192, 118, ${(0.78 + anvilShock * 0.18).toFixed(2)})`;
  drawDiamondNode(ctx, midX, ruleY, 3.4);
  ctx.restore();

  ctx.restore();
}
