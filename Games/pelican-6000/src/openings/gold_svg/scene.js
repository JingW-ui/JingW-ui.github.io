// src/openings/gold_svg/scene.js
// Zero-Filter 60fps 4K Live `<svg>` Gold-Printmaking Twin-Blacksmith Stage (`616x720`):
// - Instantiates 3 pure-vector printmaking strips (`copperplate`, `woodblock`, `mosaic`) with ZERO `<filter>`/`<mask>`
// - Updates all 3 strips from ONE `computeGoldForgePose(realT)` target-first IK solve (<0.3ms/frame!)
// - Supports a choreographed `/` Diagonal Golden Shutter Curtain Wipe (`wipeU` in `[0..1]`) across `3.56s..4.32s`
//   so the Blacksmiths compress/part cleanly along a `/` diagonal seam as the 12-Era Pelican Accordion sweeps in!

import { SVG_NS, el, buildGoldForgeDefs, getPrintmakingPalette } from './defs.js';
import { computeGoldForgePose } from './kinematics.js';
import { buildHearthAndAnvilGroup } from './hearth_and_anvil.js';
import { buildLeftMasterSmithGroup } from './smith_left.js';
import { buildRightStrikerSmithGroup } from './smith_right.js';
import { CREST_PATH_D } from '../vector_emblems.js';

const GRID_TO_STAGE_TRANSFORM = 'translate(34, -496) scale(1.22)';

function buildStyledStripInstance(parent, mode) {
  const pal = getPrintmakingPalette(mode);
  const g = el('g', { transform: GRID_TO_STAGE_TRANSFORM }, parent);
  const hearth = buildHearthAndAnvilGroup(g, pal);
  const leftSmith = buildLeftMasterSmithGroup(g, pal);
  const rightSmith = buildRightStrikerSmithGroup(g, pal);

  return {
    update(pose) {
      hearth.update(pose);
      leftSmith.update(pose);
      rightSmith.update(pose);
    },
  };
}

export function createGoldPrintmakingForgeSvg(svgRoot, stageW = 616, stageH = 720) {
  svgRoot.setAttribute('xmlns', SVG_NS);
  svgRoot.setAttribute('viewBox', `0 0 ${stageW} ${stageH}`);
  svgRoot.innerHTML = '';

  const { defs, poly0, poly1, poly2 } = buildGoldForgeDefs(svgRoot);

  // Diagonal `/` shutter clipPath for the Blacksmith -> Pelican Era Accordion Curtain Transition (`3.56s..4.32s`)!
  const wipeClip = el('clipPath', { id: 'gf-shutter-wipe' }, defs);
  const wipePoly = el('polygon', { points: `-20,0 ${stageW + 20},0 ${stageW + 20},${stageH} -20,${stageH}` }, wipeClip);

  // Root shutter wrapper clipped by `#gf-shutter-wipe` (transparent outside so the incoming Pelican Accordion shows!)
  const shutterRoot = el('g', { 'clip-path': 'url(#gf-shutter-wipe)' }, svgRoot);
  const slideContent = el('g', {}, shutterRoot);

  // 1. Matte Obsidian Stage Background + Warm Hearth Ambient Glow inside shutter zone
  el('rect', { x: -120, y: 0, width: stageW + 240, height: stageH, fill: '#120f0c' }, slideContent);
  const ambientGlow = el(
    'ellipse',
    { cx: 356, cy: 310, rx: 245, ry: 255, fill: 'url(#gf-hearth-glow)' },
    slideContent
  );

  // 2. Strip 0 (`01 铜版金刻` — Left `/` zone): Pure-Vector Tonal Bronze + Fine Copperplate Etch Pattern
  const strip0G = el('g', { 'clip-path': 'url(#gf-clip-0)' }, slideContent);
  const inst0 = buildStyledStripInstance(strip0G, 'copperplate');
  el(
    'rect',
    {
      x: -120,
      y: 0,
      width: stageW + 240,
      height: stageH,
      fill: 'url(#gf-pat-copper-etch)',
      'pointer-events': 'none',
    },
    strip0G
  );

  // 3. Strip 1 (`02 木刻金版` — Middle `/` zone): Pure-Vector High-Contrast Carved Woodblock Gold Relief
  const strip1G = el('g', { 'clip-path': 'url(#gf-clip-1)' }, slideContent);
  const inst1 = buildStyledStripInstance(strip1G, 'woodblock');

  // 4. Strip 2 (`03 金网像素` — Right `/` zone): Pure-Vector 4-Tier Square-Dot Gold Halftone Mosaic!
  const strip2G = el('g', { 'clip-path': 'url(#gf-clip-2)' }, slideContent);
  const inst2 = buildStyledStripInstance(strip2G, 'mosaic');

  // 5. Two Crisp `/` Diagonal Gold Hairline Seams (`(363,0)->(113,720)` & `(478,0)->(251,720)`)
  const seamLine1 = el('line', { stroke: '#e8b35a', 'stroke-width': '2.1', opacity: '0.92' }, slideContent);
  const seamLine2 = el('line', { stroke: '#e8b35a', 'stroke-width': '2.1', opacity: '0.92' }, slideContent);

  // 5.5. Pure-vector right-side continuation of Cover Double Gold Frame & `羽轮纹章` Corner Emblems
  //      (`stageX0 = 344` => `x_local = x_global - 344`) — 100% pure-vector SVG paths!
  const coverFrameG = el('g', { fill: 'none', stroke: '#c6a363', 'pointer-events': 'none' }, slideContent);
  el('rect', { x: '-315.92', y: '28.08', width: '903.84', height: '663.84', 'stroke-width': '0.85' }, coverFrameG);
  el('rect', { x: '-307.28', y: '36.72', width: '886.56', height: '646.56', 'stroke-width': '0.50' }, coverFrameG);
  const crestScale = (28.8 / 256).toFixed(6);
  for (const cy of [43.92, 647.28]) {
    const cg = el(
      'g',
      {
        transform: `translate(543.28, ${cy}) scale(${crestScale})`,
        opacity: '0.96',
        'pointer-events': 'none',
      },
      slideContent
    );
    el(
      'path',
      {
        d: CREST_PATH_D,
        fill: 'url(#gf-crest-gold)',
        'fill-rule': 'evenodd',
      },
      cg
    );
  }

  // 6. Glowing `/` Golden Curtain-Edge Bevel Seam that sweeps right-to-left during `wipeU > 0`!
  const shutterGlowLine = el(
    'line',
    { stroke: '#ffe498', 'stroke-width': '4.2', opacity: '0', 'stroke-linecap': 'round' },
    svgRoot
  );

  function setSeams(s1Top, s1Bot, s2Top, s2Bot) {
    poly0.setAttribute('points', `-140,0 ${s1Top.toFixed(1)},0 ${s1Bot.toFixed(1)},${stageH} -140,${stageH}`);
    poly1.setAttribute(
      'points',
      `${s1Top.toFixed(1)},0 ${s2Top.toFixed(1)},0 ${s2Bot.toFixed(1)},${stageH} ${s1Bot.toFixed(1)},${stageH}`
    );
    poly2.setAttribute(
      'points',
      `${s2Top.toFixed(1)},0 ${stageW + 140},0 ${stageW + 140},${stageH} ${s2Bot.toFixed(1)},${stageH}`
    );

    seamLine1.setAttribute('x1', s1Top.toFixed(1));
    seamLine1.setAttribute('y1', '0');
    seamLine1.setAttribute('x2', s1Bot.toFixed(1));
    seamLine1.setAttribute('y2', String(stageH));

    seamLine2.setAttribute('x1', s2Top.toFixed(1));
    seamLine2.setAttribute('y1', '0');
    seamLine2.setAttribute('x2', s2Bot.toFixed(1));
    seamLine2.setAttribute('y2', String(stageH));
  }

  setSeams(363, 113, 478, 251);

  function renderAt(realT, localPolys = null, wipeU = 0) {
    const pose = computeGoldForgePose(realT);
    inst0.update(pose);
    inst1.update(pose);
    inst2.update(pose);

    ambientGlow.setAttribute('opacity', (0.76 + pose.flash * 0.42).toFixed(2));

    if (localPolys && localPolys.length === 3) {
      setSeams(
        localPolys[1].localTopL,
        localPolys[1].localBotL,
        localPolys[2].localTopL,
        localPolys[2].localBotL
      );
    } else {
      setSeams(363, 113, 478, 251);
    }

    // Choreographed Full-Screen `/` Diagonal Shutter Wipe (`wipeU = 0 -> 1` across `3.55s .. 4.35s`):
    // Global `/` curtain sweeps across the ENTIRE `960x720` screen (`globalTop: 1196 -> 0`, `slant = 236`),
    // mapped into local `616x720` stage coordinates (`stageX0 = 344` => `localTop = globalTop - 344`)!
    if (wipeU <= 0.002) {
      wipePoly.setAttribute('points', `-20,0 ${stageW + 20},0 ${stageW + 20},${stageH} -20,${stageH}`);
      slideContent.setAttribute('transform', 'translate(0 0)');
      shutterGlowLine.setAttribute('opacity', '0');
    } else {
      const slant = 236;
      const globalTop = (960 + slant) * (1 - wipeU);
      const edgeTop = globalTop - 344;
      const edgeBot = edgeTop - slant;
      if (edgeTop <= -10 && edgeBot <= -10) {
        wipePoly.setAttribute('points', '0,0 0,0 0,0');
        shutterGlowLine.setAttribute('opacity', '0');
      } else {
        wipePoly.setAttribute(
          'points',
          `-180,0 ${edgeTop.toFixed(1)},0 ${edgeBot.toFixed(1)},${stageH} -180,${stageH}`
        );
        const pushX = -96 * wipeU;
        slideContent.setAttribute('transform', `translate(${pushX.toFixed(1)} 0)`);

        shutterGlowLine.setAttribute('x1', edgeTop.toFixed(1));
        shutterGlowLine.setAttribute('y1', '0');
        shutterGlowLine.setAttribute('x2', edgeBot.toFixed(1));
        shutterGlowLine.setAttribute('y2', String(stageH));
        shutterGlowLine.setAttribute('opacity', Math.sin(wipeU * Math.PI).toFixed(2));
      }
    }
  }

  renderAt(0, null, 0);
  return { renderAt };
}
