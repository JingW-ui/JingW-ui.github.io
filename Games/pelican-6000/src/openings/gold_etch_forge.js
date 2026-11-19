// src/openings/gold_etch_forge.js
// Geometry & Slanted Polygon Solver for the 4K Live `<svg>` 3-Strip Gold-Printmaking Blacksmith Stage:
// - Canonical `/` seam coordinates (`(363,0)->(113,720)` and `(478,0)->(251,720)`)
// - Supports interactive hover/click/pill drawer expansion while keeping the underlying canvas matte obsidian

import { lerp } from '../fusion/github_core/beat/timeline.js';

export function loadOpeningMasterPlate() {
  return Promise.resolve(null);
}

export function computeSlantedForgePolygons(
  forgeDrawers,
  stageX0,
  stageW,
  focusCenter = 1,
  overrideWeight = 0,
  soloWeight = 0,
  soloIdx = 0
) {
  // Exact canonical `/` seam positions in local `616x720` stage coordinates:
  // Seam 1: top `363`, bot `113` -> mid `238` (`238 / 616 = 0.3864`)
  // Seam 2: top `478`, bot `251` -> mid `364.5` (`126.5 / 616 = 0.2054`)
  // Strip 2: remaining `251.5 / 616 = 0.4082`
  const slant1 = 250; // 363 - 113
  const slant2 = 227; // 478 - 251
  const baseWeights = [0.3864, 0.2054, 0.4082];

  const n = Math.min(3, forgeDrawers.length);
  const weights = new Array(n);
  let sum = 0;

  for (let i = 0; i < n; i += 1) {
    const d = (i - focusCenter) / 0.58;
    const bell = Math.exp(-0.5 * d * d);
    const boosted = baseWeights[i] * (1 + 2.8 * bell * overrideWeight);
    let w = lerp(baseWeights[i], boosted, overrideWeight);
    if (soloWeight > 0.002) {
      w = i === soloIdx ? lerp(w, 60, Math.pow(soloWeight, 1.8)) : w * (1 - soloWeight);
    }
    weights[i] = { w: Math.max(0, w), focus: overrideWeight > 0.05 ? bell : (i === 1 ? 0.7 : 0.5) };
    sum += weights[i].w;
  }

  let cursorMid = 0;
  return forgeDrawers.slice(0, n).map((item, i) => {
    const wMid = sum > 0 ? (weights[i].w / sum) * stageW : stageW / n;
    const localMidL = cursorMid;
    const localMidR = cursorMid + wMid;
    cursorMid += wMid;

    const sL = i === 1 ? slant1 : slant2;
    const sR = i === 0 ? slant1 : slant2;

    // Fade slant slightly toward 0 only if a single strip is soloed 100% full-screen so it fills all 4 corners!
    const slantFade = 1 - soloWeight;
    const localTopL = i === 0 ? 0 : localMidL + sL * 0.5 * slantFade;
    const localBotL = i === 0 ? 0 : localMidL - sL * 0.5 * slantFade;
    const localTopR = i === n - 1 ? stageW : localMidR + sR * 0.5 * slantFade;
    const localBotR = i === n - 1 ? stageW : localMidR - sR * 0.5 * slantFade;

    return {
      ...item,
      index: i,
      x: stageX0 + localMidL,
      w: wMid,
      localTopL,
      localBotL,
      localTopR,
      localBotR,
      xTopL: stageX0 + localTopL,
      xTopR: stageX0 + localTopR,
      xBotL: stageX0 + localBotL,
      xBotR: stageX0 + localBotR,
      focus: weights[i].focus,
    };
  });
}

export function renderGoldPrintmakingForgeStage(
  ctx,
  _forgeTimeline,
  _realT,
  stageX0,
  stageW,
  stageH
) {
  // Clean matte obsidian backdrop beneath the live 4K `<svg>` overlay
  ctx.fillStyle = '#120f0c';
  ctx.fillRect(stageX0, 0, stageW, stageH);
}
