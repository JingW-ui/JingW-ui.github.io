// src/openings/accordion_intro.js
// Master Opening (`0.00s .. 11.45s`) for 《鹈鹕六千年的车》:
// - Act I (`0.00s .. 3.55s`):
//   * Left Obsidian Lacquer Title Stele (`x = 0..344`, `left_title_wall.js`): Double-gold Song-brocade frame,
//     4 official `羽轮纹章` corner crests, official cover vector glyph outlines (`鹈鹕 / 六千年的车`), and
//     genuine hand-carved Shuowen Xiaozhuan (`《说文解字》小篆`) cinnabar vector seal (「六千年」)!
//   * Right Stage (`x = 344..960`): Live 60fps 4K `<svg>` 3-Strip Gold-Printmaking Twin Blacksmiths hammering flush!
// - Transition (`3.55s .. 4.35s`): `/` Diagonal Golden Shutter Curtain sweeps across the ENTIRE `960x720` screen,
//   sliding both the Blacksmiths & Left Title Stele off-stage while unfolding the Pelican Era Accordion to 100% FULL SCREEN!
// - Act II (`4.35s .. 10.02s`): Full-Screen (`960x720`) 12-Era Vertical Accordion + Giant Cycling Pelican!
// - Act III (`10.02s .. 11.45s`): Drawer #01 (`撒哈拉岩画`) expands seamlessly into Scene 01!

import { lerp, smootherstep } from '../fusion/github_core/beat/timeline.js';
import { VIEW_W, VIEW_H } from '../fusion/github_core/beat/camera.js';
import {
  computeSlantedForgePolygons,
  renderGoldPrintmakingForgeStage,
} from './gold_etch_forge.js';
import { renderEraAccordionStage } from './era_slats.js';
import {
  preloadLeftTitleWallAssets,
  drawLeftEditorialPanel,
} from './left_title_wall.js';

export async function preloadIntroDecorAssets() {
  await preloadLeftTitleWallAssets();
}

function computeAccordionSlats(
  items,
  stageX0,
  stageW,
  focusCenter,
  boost = 1.8,
  sigma = 1.05,
  soloU = 0,
  soloIdx = 0
) {
  const n = items.length;
  const weights = new Array(n);
  let sum = 0;

  for (let i = 0; i < n; i += 1) {
    const d = (i - focusCenter) / sigma;
    const focus = Math.exp(-0.5 * d * d);
    let w = 1 + boost * focus;
    if (soloU > 0.001) {
      w = i === soloIdx ? lerp(w, 64, Math.pow(soloU, 2.0)) : w * (1 - soloU);
    }
    weights[i] = { w: Math.max(0, w), focus: soloU > 0.5 ? (i === soloIdx ? 1 : 0) : focus };
    sum += weights[i].w;
  }

  let cursor = stageX0;
  return items.map((item, i) => {
    const width = sum > 0 ? (weights[i].w / sum) * stageW : stageW / n;
    const slat = {
      ...item,
      index: i,
      x: cursor,
      w: width,
      focus: weights[i].focus,
    };
    cursor += width;
    return slat;
  });
}

function getEraFocusCenter(realT) {
  const keyframes = [
    { t: 3.67, idx: 0.5 },
    { t: 4.55, idx: 3.5 },
    { t: 5.5, idx: 5.2 },
    { t: 6.65, idx: 8.0 },
    { t: 7.8, idx: 10.6 },
    { t: 8.85, idx: 7.8 },
    { t: 9.85, idx: 0.0 },
  ];
  if (realT <= keyframes[0].t) return keyframes[0].idx;
  for (let i = 0; i < keyframes.length - 1; i += 1) {
    const a = keyframes[i];
    const b = keyframes[i + 1];
    if (realT >= a.t && realT <= b.t) {
      const u = smootherstep(a.t, b.t, realT);
      return lerp(a.idx, a.idx + (b.idx - a.idx), u);
    }
  }
  return 0.0;
}

function drawAccordionSeamsAndLabels(ctx, slats, stageH, isEraMode, handoffU) {
  const footerFade = 1 - smootherstep(0.15, 0.72, handoffU);

  for (let i = 0; i < slats.length; i += 1) {
    const s = slats[i];
    if (s.w <= 1.2) continue;

    if (isEraMode && i > 0) {
      const shW = Math.min(22, s.w * 0.38);
      const shG = ctx.createLinearGradient(s.x, 0, s.x + shW, 0);
      shG.addColorStop(0, 'rgba(5, 4, 3, 0.72)');
      shG.addColorStop(1, 'rgba(5, 4, 3, 0)');
      ctx.fillStyle = shG;
      ctx.fillRect(s.x, 0, shW, stageH);

      ctx.strokeStyle = s.focus > 0.48 ? 'rgba(242, 202, 128, 0.75)' : 'rgba(18, 14, 11, 0.90)';
      ctx.lineWidth = s.focus > 0.48 ? 1.8 : 1.2;
      ctx.beginPath();
      ctx.moveTo(s.x + 0.5, 0);
      ctx.lineTo(s.x + 0.5, stageH);
      ctx.stroke();
    }

    if (footerFade > 0.02) {
      ctx.save();
      ctx.globalAlpha = footerFade;
      const botG = ctx.createLinearGradient(0, stageH - 104, 0, stageH);
      botG.addColorStop(0, 'rgba(12, 10, 8, 0)');
      botG.addColorStop(0.52, 'rgba(12, 10, 8, 0.80)');
      botG.addColorStop(1, 'rgba(9, 7, 5, 0.95)');
      ctx.fillStyle = botG;
      ctx.fillRect(s.x, stageH - 104, s.w, 104);

      if (s.w >= 40) {
        const cx = s.x + s.w * 0.5;
        const active = s.focus > 0.52;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = active ? '#ffd884' : 'rgba(232, 216, 190, 0.84)';
        ctx.font = `${active ? 900 : 800} 19px "CarbonMono", monospace`;
        ctx.fillText(s.num, cx, stageH - 52);

        if (s.w >= 58) {
          ctx.fillStyle = active ? '#fff9eb' : 'rgba(244, 232, 212, 0.92)';
          ctx.font = `${active ? 800 : 700} 18px "CarbonSans", sans-serif`;
          ctx.fillText(s.year, cx, stageH - 22);
        }
      }
      ctx.restore();
    }
  }
}

export function renderAccordionIntroOverlay(
  kit,
  overlay2D,
  realT,
  sync,
  forgeTimeline,
  _svgBank,
  accordionDoc,
  drawerState = null,
  handoffTarget = null
) {
  const handoffStart = accordionDoc?.handoffStartRealT ?? 10.02;
  const handoffEnd = accordionDoc?.handoffEndRealT ?? 11.447;
  if (realT >= handoffEnd) {
    if (drawerState) {
      drawerState.lastForgeSlats = null;
      drawerState.renderForgeSlats = null;
      drawerState.forgeDomAlpha = 0;
      drawerState.forgeWipeU = 1;
      drawerState.lastEraSlats = null;
    }
    return false;
  }

  const ctx = overlay2D.drawingContext;
  const basePanelW = accordionDoc?.leftPanelWidth ?? 344;
  const guitarDropT = accordionDoc?.guitarDropRealT ?? 3.668;

  const handoffU = smootherstep(handoffStart, handoffEnd - 0.04, realT);
  const fadeOutAlpha = 1 - smootherstep(handoffEnd - 0.14, handoffEnd, realT);
  if (fadeOutAlpha <= 0.004) {
    if (drawerState) {
      drawerState.lastForgeSlats = null;
      drawerState.renderForgeSlats = null;
      drawerState.forgeDomAlpha = 0;
      drawerState.forgeWipeU = 1;
      drawerState.lastEraSlats = null;
    }
    return false;
  }

  ctx.save();
  ctx.globalAlpha = fadeOutAlpha;

  const forgeDrawers = accordionDoc?.forgeDrawers || [];
  const eraDrawers = accordionDoc?.eraDrawers || [];

  // Choreographed Full-Screen `/` Diagonal Shutter Curtain (`3.55s .. 4.35s`):
  // Sweeps across the ENTIRE `960x720` screen (`globalEdgeTop: 1196 -> 0`), retracting BOTH the Blacksmiths
  // AND the Left Title Stele so the 12-Era Pelican Accordion occupies 100% FULL SCREEN (`0..960`)!
  const eraWipeU = smootherstep(guitarDropT - 0.12, guitarDropT + 0.68, realT);
  const slant = 236;
  const globalEdgeTop = (VIEW_W + slant) * (1 - eraWipeU);
  const globalEdgeBot = globalEdgeTop - slant;

  // 1. FULL-SCREEN (`0 .. 960`) 12-Era Accordion + Giant Cycling Pelican (`eraWipeU > 0.002`)
  if (eraWipeU > 0.002 && eraDrawers.length > 0) {
    ctx.save();
    ctx.globalAlpha = fadeOutAlpha;

    const autoEraCenter = getEraFocusCenter(realT);
    const wipeFan = (1 - eraWipeU) * 3.2;
    const eCenter = lerp(9.5, autoEraCenter, eraWipeU);
    const eBoost = 1.65 + wipeFan;
    const eSigma = lerp(0.88, 1.18, eraWipeU);

    const eSlats = computeAccordionSlats(
      eraDrawers,
      0,
      VIEW_W,
      eCenter,
      eBoost,
      eSigma,
      handoffU,
      0
    );
    if (drawerState) {
      drawerState.lastEraSlats = eraWipeU >= 0.5 && handoffU < 0.25 ? eSlats : null;
    }

    renderEraAccordionStage(ctx, kit, realT, 0, VIEW_W, VIEW_H, eSlats, handoffU, eraWipeU, handoffTarget);
    drawAccordionSeamsAndLabels(ctx, eSlats, VIEW_H, true, handoffU);

    if (eraWipeU < 0.996) {
      ctx.save();
      ctx.strokeStyle = 'rgba(8, 6, 4, 0.72)';
      ctx.lineWidth = 26;
      ctx.beginPath();
      ctx.moveTo(globalEdgeTop + 10, 0);
      ctx.lineTo(globalEdgeBot + 10, VIEW_H);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 228, 152, ${(Math.sin(eraWipeU * Math.PI) * 0.95).toFixed(2)})`;
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.moveTo(globalEdgeTop, 0);
      ctx.lineTo(globalEdgeBot, VIEW_H);
      ctx.stroke();

      const sparkAlpha = Math.sin(eraWipeU * Math.PI);
      ctx.strokeStyle = `rgba(255, 232, 160, ${(sparkAlpha * 0.92).toFixed(2)})`;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      for (let k = 0; k < 14; k += 1) {
        const frac = (k + 0.5) / 14;
        const sy = frac * VIEW_H + Math.sin(realT * 14 + k * 1.9) * 14;
        const sx = lerp(globalEdgeTop, globalEdgeBot, frac) + 8 + ((k * 29) % 46) * sparkAlpha;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + 16 * sparkAlpha, sy - 6 * sparkAlpha);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
  } else if (drawerState) {
    drawerState.lastEraSlats = null;
  }

  // 2. Act I Left Obsidian Title Stele + Right Live `<svg>` Blacksmith Stage (clipped cleanly to left of `/` curtain!)
  if (eraWipeU < 0.998) {
    const forgeStageW = VIEW_W - basePanelW;
    const fPolys = computeSlantedForgePolygons(
      forgeDrawers,
      basePanelW,
      forgeStageW,
      1,
      0,
      0,
      0
    );

    if (drawerState) {
      drawerState.lastForgeSlats = eraWipeU < 0.5 ? fPolys : null;
      drawerState.renderForgeSlats = fPolys;
      drawerState.forgeDomAlpha = fadeOutAlpha;
      drawerState.forgeWipeU = eraWipeU;
      drawerState.activeAutoForgeIndex = 1;
    }

    if (eraWipeU <= 0.002) {
      renderGoldPrintmakingForgeStage(
        ctx,
        forgeTimeline,
        realT,
        basePanelW,
        forgeStageW,
        VIEW_H,
        fPolys
      );
    }

    ctx.save();
    if (eraWipeU > 0.002) {
      ctx.beginPath();
      ctx.moveTo(-200, 0);
      ctx.lineTo(globalEdgeTop, 0);
      ctx.lineTo(globalEdgeBot, VIEW_H);
      ctx.lineTo(-200, VIEW_H);
      ctx.closePath();
      ctx.clip();
    }
    const pushLeftX = -Math.round(96 * eraWipeU);
    drawLeftEditorialPanel(
      ctx,
      kit,
      pushLeftX,
      basePanelW,
      VIEW_H,
      accordionDoc,
      realT,
      sync?.anvilShock || 0
    );
    ctx.restore();
  } else if (drawerState) {
    drawerState.lastForgeSlats = null;
    drawerState.renderForgeSlats = null;
    drawerState.forgeDomAlpha = 0;
    drawerState.forgeWipeU = 1;
  }

  ctx.restore();
  return true;
}
