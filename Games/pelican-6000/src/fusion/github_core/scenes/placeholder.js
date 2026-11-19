// src/scenes/placeholder.js
// Phase 1 structured animatic renderer for all 20 era panels (1000x1000 space).
// Demonstrates:
// - Era color palettes & shared Xuan-paper/rubbing ink substrates (#3,#4,#5,#6,#9)
// - Continuous road anchored at y=680 on both edges (plus #6 Rainbow Bridge arch, #16 pit jump)
// - Cross-frame dual-clipped pelican style switching with continuous pedal IK
// - #2 Egyptian Bar-2 freeze & grid, #5 Song giant peak + tiny pelican zoom,
//   #10/#16/#17 8-12Hz time quantization, #14->#15 electrified shadow-to-CRT morph,
//   and #19 9:16 vertical short-video frame with progress bar hitting 100% at frame exit!

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  BEAT_SEC,
  clamp,
  lerp,
  smoothstep,
  quantizeTime,
} from '../beat/timeline.js';
import { computePelicanRig, drawRig2D } from '../rig/pelican.js';
import { drawEraTitleCard } from '../kit/titleCard.js';
import { getInkPaper, drawInkWashBlob, drawFeibaiStroke, INK_SHADES } from '../kit/ink.js';

/**
 * Renders a single 1000x1000 panel for `scene` at global time `t`.
 * `pelicanLocalX` is `pelicanWorldX - scene.worldX0` (may be outside [0,1000] when straddling a frame!).
 */
export function renderPlaceholderPanel(kit, slot, scene, {
  t,
  localT,
  pelicanLocalX,
  pedalAngle,
  speedScale,
  isOutroThumbnail = false,
}) {
  const g = slot.g2d;
  const ctx = g.drawingContext;
  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // Quantized internal scene time for retro panels (#10 Wayang, #16 8-bit, #17 IM GIF)
  const sceneT = scene.quantizeHz ? quantizeTime(t, scene.quantizeHz) : t;
  const qPedalAngle = scene.quantizeHz ? (sceneT / BEAT_SEC) * Math.PI : pedalAngle;
  // Note: keep X position quantized ONLY inside retro panels' interior [140..860] so cross-frame entry/exit stays seamless!
  const interiorBlend = scene.quantizeHz
    ? smoothstep(90, 200, pelicanLocalX) * smoothstep(910, 800, pelicanLocalX)
    : 0;
  const quantizedLocalX =
    scene.quantizeHz && !isOutroThumbnail
      ? lerp(pelicanLocalX, Math.round(pelicanLocalX / 16) * 16, interiorBlend)
      : pelicanLocalX;

  const [bgCol, accent1, accent2, accent3, darkCol] = scene.palette;

  // ---------------------------------------------------------------------------
  // 1. Era Backdrop & Texture Substrate
  // ---------------------------------------------------------------------------
  if (scene.isInk) {
    const paper = getInkPaper(kit, scene.inkMode);
    ctx.drawImage(paper.canvas, 0, 0);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, PANEL_SIZE);
    grad.addColorStop(0, bgCol);
    grad.addColorStop(1, accent3);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, PANEL_SIZE, PANEL_SIZE);
  }

  // Subtle architectural / stylistic composition landmarks per era in animatic
  drawAnimaticStageProps(kit, ctx, scene, localT, sceneT);

  // ---------------------------------------------------------------------------
  // 2. Continuous Road across [0, 1000] anchored at y = ROAD_EDGE_Y (680)
  // ---------------------------------------------------------------------------
  const archH = scene.archBridge ? 115 : scene.id === 's05_song' ? -85 : 0;
  drawPanelRoad(ctx, kit, scene, archH);

  // ---------------------------------------------------------------------------
  // 3. Parametric Pelican + Bicycle (clipped naturally to this 1000x1000 panel!)
  // ---------------------------------------------------------------------------
  if (pelicanLocalX > -240 && pelicanLocalX < PANEL_SIZE + 240) {
    const px = quantizedLocalX;
    let { y: roadY, slope } = kit.sampleRoad(clamp(px, 0, PANEL_SIZE), archH);
    let rigScale = 1.0;
    let poseMode = 'normal';
    let lissajousMix = 0;

    // #2 Egypt: profile pose in Bar 2
    if (scene.id === 's02_egypt' && localT > 1.7 && localT < 4.3) {
      poseMode = 'egypt_freeze';
    }
    // #5 Song Monumental Landscape: miniature scale along mountain-foot valley trail!
    // Smoothly shrinks from 1.0 at x=0 -> 0.24 in middle -> 1.0 at x=1000 so cross-frame size matches!
    if (scene.id === 's05_song') {
      const shrinkEnv = smoothstep(30, 210, px) * smoothstep(970, 790, px);
      rigScale = lerp(1.0, 0.24, shrinkEnv);
    }
    // #9 Bada Shanren: signature side-eye / roll-eye
    if (scene.id === 's09_bada') {
      poseMode = 'bada_eye';
    }
    // #14 Nosferatu: shadow climbing diagonal cellar/stair wall, returning to 680 at exit (or electrifying!)
    if (scene.id === 's14_nosferatu') {
      const climbEnv = smoothstep(20, 180, px) * smoothstep(980, 820, px);
      roadY = ROAD_EDGE_Y - climbEnv * 110;
      slope = -0.22 * climbEnv;
    }
    // #15 Oscilloscope: Bar 2 (localT 2.0s..3.0s) wrong knob twists pelican into Lissajous, snaps back at 3.0s!
    if (scene.id === 's15_oscilloscope') {
      if (localT >= 2.0 && localT < 3.0) {
        lissajousMix = smoothstep(2.0, 2.22, localT) * (1 - smoothstep(2.92, 3.0, localT));
      }
    }
    // #16 8-Bit Platformer: jump arc over pit during Bar 2 (px in 380..620)!
    if (scene.id === 's16_8bit') {
      if (px > 370 && px < 630) {
        const ju = (px - 370) / 260;
        const jumpH = Math.sin(Math.PI * ju) * 145;
        roadY -= jumpH;
        slope = -0.28 * Math.cos(Math.PI * ju);
      }
    }

    const rig = computePelicanRig({
      x: px,
      y: roadY,
      pedalAngle: qPedalAngle,
      scale: rigScale,
      slope,
      speedScale,
      poseMode,
      lissajousMix,
      time: sceneT,
    });

    drawStyledAnimaticPelican(ctx, rig, scene, localT, t);
  }

  // ---------------------------------------------------------------------------
  // 4. Special #19 Vertical 9:16 Short-Video Frame Mask & Progress Bar
  // ---------------------------------------------------------------------------
  if (scene.id === 's19_shortvideo') {
    drawVerticalShortVideoFrame(ctx, scene, localT);
  }

  // ---------------------------------------------------------------------------
  // 5. Era Title Card + Subtle Animatic Beat/Gag Strip (hidden in small Outro tiles)
  // ---------------------------------------------------------------------------
  if (!isOutroThumbnail) {
    const cardX = scene.id === 's19_shortvideo' ? 238 : 44;
    drawEraTitleCard(ctx, scene, localT, { x: cardX, y: 40 });
    drawAnimaticBeatFooter(ctx, scene, localT);
  } else {
    // Crisp compact era number + Chinese label for 7x3 Outro wall legibility
    ctx.fillStyle = 'rgba(15, 14, 12, 0.72)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.fillStyle = '#f5f0e6';
    ctx.font = '700 48px "PelicanSerif", serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} ${scene.zh}`, 36, PANEL_SIZE - 48);
  }

  ctx.restore();
}

function drawPanelRoad(ctx, kit, scene, archH) {
  const [, accent1, accent2, , darkCol] = scene.palette;

  if (scene.id === 's15_oscilloscope') {
    // Glowing green horizontal phosphor trace baseline
    ctx.save();
    ctx.strokeStyle = '#39ff7a';
    ctx.shadowColor = '#39ff7a';
    ctx.shadowBlur = 14;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, ROAD_EDGE_Y);
    ctx.lineTo(PANEL_SIZE, ROAD_EDGE_Y);
    ctx.stroke();
    ctx.restore();
    return;
  }

  if (scene.id === 's16_8bit') {
    // Brick platform with center pit (x = 420..580)
    ctx.fillStyle = '#c84c0c';
    ctx.fillRect(0, ROAD_EDGE_Y, 420, PANEL_SIZE - ROAD_EDGE_Y);
    ctx.fillRect(580, ROAD_EDGE_Y, 420, PANEL_SIZE - ROAD_EDGE_Y);
    ctx.fillStyle = '#00a800';
    ctx.fillRect(0, ROAD_EDGE_Y, 420, 18);
    ctx.fillRect(580, ROAD_EDGE_Y, 420, 18);
    // Dark pit
    ctx.fillStyle = '#0d1021';
    ctx.fillRect(420, ROAD_EDGE_Y, 160, PANEL_SIZE - ROAD_EDGE_Y);
    return;
  }

  ctx.save();
  // Ground fill beneath road curve
  ctx.beginPath();
  ctx.moveTo(0, ROAD_EDGE_Y);
  for (let x = 20; x <= PANEL_SIZE; x += 20) {
    ctx.lineTo(x, kit.sampleRoad(x, archH).y);
  }
  ctx.lineTo(PANEL_SIZE, PANEL_SIZE);
  ctx.lineTo(0, PANEL_SIZE);
  ctx.closePath();

  if (scene.isInk) {
    ctx.fillStyle =
      scene.inkMode === 'rubbing'
        ? 'rgba(235, 229, 216, 0.10)'
        : scene.inkMode === 'xieyi'
        ? 'rgba(34, 32, 28, 0.03)'
        : 'rgba(65, 58, 48, 0.11)';
  } else {
    ctx.fillStyle = 'rgba(20, 16, 12, 0.16)';
  }
  ctx.fill();

  // Road top path stroke
  ctx.strokeStyle =
    scene.inkMode === 'rubbing'
      ? '#ebe5d8'
      : scene.isInk
      ? INK_SHADES.zhong
      : darkCol || accent1;
  ctx.lineWidth = scene.inkMode === 'xieyi' ? 2.5 : 5;
  ctx.beginPath();
  ctx.moveTo(0, ROAD_EDGE_Y);
  for (let x = 20; x <= PANEL_SIZE; x += 20) {
    ctx.lineTo(x, kit.sampleRoad(x, archH).y);
  }
  ctx.stroke();

  // Rainbow bridge timber trusses hint for #6 Qingming
  if (scene.archBridge) {
    ctx.strokeStyle = '#6e4e32';
    ctx.lineWidth = 3.5;
    for (let x = 140; x <= 860; x += 72) {
      const { y } = kit.sampleRoad(x, archH);
      ctx.beginPath();
      ctx.moveTo(x, y - 26);
      ctx.lineTo(x, y + 24);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawAnimaticStageProps(kit, ctx, scene, localT, sceneT) {
  const [, accent1, accent2] = scene.palette;

  // Big faint watermark number in background for animatic clarity
  ctx.save();
  ctx.fillStyle =
    scene.inkMode === 'rubbing' || scene.num >= 15
      ? 'rgba(255, 255, 255, 0.06)'
      : 'rgba(30, 24, 18, 0.065)';
  ctx.font = '800 220px "PelicanSerif", serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(String(scene.num).padStart(2, '0'), 955, 40);
  ctx.restore();

  // #2 Egypt: faint red canon proportion grid + hieroglyph cartouche placeholder
  if (scene.id === 's02_egypt') {
    ctx.save();
    ctx.strokeStyle = 'rgba(193, 73, 40, 0.22)';
    ctx.lineWidth = 1;
    for (let g = 0; g <= PANEL_SIZE; g += 50) {
      ctx.beginPath();
      ctx.moveTo(g, 0);
      ctx.lineTo(g, PANEL_SIZE);
      ctx.moveTo(0, g);
      ctx.lineTo(PANEL_SIZE, g);
      ctx.stroke();
    }
    // Cartouche oval
    ctx.strokeStyle = '#1d6b73';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(740, 170, 175, 74, 36);
    ctx.stroke();
    ctx.fillStyle = '#8c2f1b';
    ctx.font = '700 22px "PelicanSerif", serif';
    ctx.fillText('𓅿 鹈鹕测试 𓇌', 758, 214);
    ctx.restore();
  }

  // #5 Song Monumental Landscape: towering central Fan Kuan peak!
  if (scene.id === 's05_song') {
    const rng = kit.makePRNG(505);
    ctx.save();
    // Towering central massif
    ctx.fillStyle = 'rgba(38, 36, 31, 0.78)';
    ctx.beginPath();
    ctx.moveTo(190, 740);
    ctx.lineTo(255, 290);
    ctx.lineTo(390, 120);
    ctx.lineTo(545, 95);
    ctx.lineTo(690, 210);
    ctx.lineTo(780, 520);
    ctx.lineTo(835, 740);
    ctx.closePath();
    ctx.fill();

    // Mist band separating giant peak from tiny foreground road
    drawInkWashBlob(ctx, 500, 650, 440, 75, { color: '234, 224, 204', maxAlpha: 0.88, layers: 6 });
    drawFeibaiStroke(
      ctx,
      [
        [390, 120],
        [375, 280],
        [360, 480],
      ],
      rng,
      { color: INK_SHADES.jiao, width: 16, dryness: 0.5 }
    );
    ctx.restore();
  }

  // #14 Nosferatu: diagonal gothic staircase banister & window bars shadow
  if (scene.id === 's14_nosferatu') {
    ctx.save();
    const grad = ctx.createRadialGradient(520, 460, 90, 500, 500, 620);
    grad.addColorStop(0, 'rgba(230, 218, 190, 0.35)');
    grad.addColorStop(1, 'rgba(12, 11, 10, 0.86)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, PANEL_SIZE, PANEL_SIZE);

    ctx.fillStyle = 'rgba(18, 17, 15, 0.78)';
    ctx.beginPath();
    ctx.moveTo(0, 780);
    ctx.lineTo(PANEL_SIZE, 540);
    ctx.lineTo(PANEL_SIZE, PANEL_SIZE);
    ctx.lineTo(0, PANEL_SIZE);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // #15 Oscilloscope: round green CRT bezel & graticule grid
  if (scene.id === 's15_oscilloscope') {
    ctx.save();
    ctx.strokeStyle = 'rgba(57, 255, 122, 0.22)';
    ctx.lineWidth = 1.2;
    for (let g = 100; g <= 900; g += 80) {
      ctx.beginPath();
      ctx.moveTo(g, 80);
      ctx.lineTo(g, 920);
      ctx.moveTo(80, g);
      ctx.lineTo(920, g);
      ctx.stroke();
    }
    // Round CRT mask ring
    ctx.strokeStyle = '#2d3832';
    ctx.lineWidth = 70;
    ctx.beginPath();
    ctx.arc(500, 500, 465, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#39ff7a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(500, 500, 430, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // #16 8-bit coin & 1UP pop on strong beat (localT >= 3.0s)!
  if (scene.id === 's16_8bit') {
    ctx.save();
    if (localT < 3.0) {
      // Floating gold coin above pit
      ctx.fillStyle = '#f8b800';
      ctx.strokeStyle = '#fcfcfc';
      ctx.lineWidth = 4;
      ctx.fillRect(486, 420, 28, 42);
      ctx.strokeRect(486, 420, 28, 42);
    } else {
      const popY = 410 - Math.min(70, (localT - 3.0) * 55);
      ctx.fillStyle = '#7ee787';
      ctx.font = '700 36px "PelicanMono", monospace';
      ctx.fillText('1UP!', 455, popY);
    }
    ctx.restore();
  }

  // #17 Early 2000s IM window frame (shakes on Bar 2 strong beat localT = 2.0s & 3.0s!)
  if (scene.id === 's17_chat') {
    const nudgeEnv =
      (localT >= 2.0 && localT < 2.45 ? Math.exp(-(localT - 2.0) * 7) : 0) +
      (localT >= 3.0 && localT < 3.45 ? Math.exp(-(localT - 3.0) * 7) : 0);
    const sx = Math.sin(localT * 95) * 14 * nudgeEnv;
    const sy = Math.cos(localT * 110) * 10 * nudgeEnv;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.fillStyle = '#ece9d8';
    ctx.strokeStyle = '#0054e3';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(110, 175, 780, 620, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0054e3';
    ctx.fillRect(110, 175, 780, 44);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 20px "PelicanSans", sans-serif';
    ctx.fillText('PelicanChat 2003 — 对方正在输入…', 132, 204);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ACA899';
    ctx.lineWidth = 2;
    ctx.fillRect(136, 240, 728, 495);
    ctx.strokeRect(136, 240, 728, 495);
    ctx.restore();
  }

  // #18 Vaporwave perspective grid & sunset disc
  if (scene.id === 's18_vaporwave') {
    ctx.save();
    const sunGrad = ctx.createLinearGradient(0, 180, 0, 520);
    sunGrad.addColorStop(0, '#ffbe0b');
    sunGrad.addColorStop(1, '#ff006e');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(500, 370, 165, 0, Math.PI * 2);
    ctx.fill();
    // Horizon perspective grid
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    ctx.lineWidth = 2;
    for (let i = -8; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(500 + i * 28, 560);
      ctx.lineTo(500 + i * 140, PANEL_SIZE);
      ctx.stroke();
    }
    ctx.restore();
  }

  // #20 Code Aesthetics: crisp dark editor gutter & live SVG Bezier tags
  if (scene.id === 's20_code') {
    ctx.save();
    ctx.fillStyle = '#161b22';
    ctx.fillRect(40, 160, 430, 460);
    ctx.strokeStyle = '#30363d';
    ctx.strokeRect(40, 160, 430, 460);
    const lines = [
      '<svg viewBox="0 0 1000 1000">',
      '  <g id="pelican-rig" stroke="#58a6ff">',
      `    <circle cx="${Math.round(160 + localT * 130)}" r="46"/>`,
      '    <path d="M 14,-150 C 30,-164 8,-188 20,-206"/>',
      '    <path id="gular-pouch" fill="#f78166"/>',
      '  </g>',
      '</svg>',
    ];
    const revealCount = Math.min(lines.length, 1 + Math.floor((localT / 5.2) * lines.length));
    ctx.font = '500 16px "PelicanMono", monospace';
    for (let i = 0; i < revealCount; i++) {
      ctx.fillStyle = '#6e7681';
      ctx.fillText(String(i + 1).padStart(2, ' '), 54, 198 + i * 32);
      ctx.fillStyle = i % 2 === 0 ? '#7ee787' : '#a5d6ff';
      ctx.fillText(lines[i], 90, 198 + i * 32);
    }
    ctx.restore();
  }
}

function drawStyledAnimaticPelican(ctx, rig, scene, localT, globalT) {
  const [, accent1, accent2, accent3, darkCol] = scene.palette;

  // Special Transition 14 -> 15 at globalT = 89.0s:
  // Nosferatu wall shadow electrifies on the strong beat into green phosphor CRT vector!
  const distTo89 = Math.abs(globalT - 89.0);
  const electrifyGlow = distTo89 < 0.55 ? 1 - distTo89 / 0.55 : 0;

  if (scene.id === 's14_nosferatu') {
    ctx.save();
    ctx.shadowColor = electrifyGlow > 0.05 ? '#39ff7a' : 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = electrifyGlow > 0.05 ? 24 * electrifyGlow : 12;
    drawRig2D(ctx, rig, {
      silhouetteColor: 'rgba(16, 15, 13, 0.92)',
      lineScale: 1.15,
    });
    if (electrifyGlow > 0.05) {
      ctx.globalAlpha = electrifyGlow;
      drawRig2D(ctx, rig, {
        wireframeColor: '#39ff7a',
        lineScale: 1.25,
      });
    }
    ctx.restore();
    return;
  }

  if (scene.id === 's15_oscilloscope') {
    ctx.save();
    ctx.shadowColor = '#39ff7a';
    ctx.shadowBlur = 18 + electrifyGlow * 18;
    drawRig2D(ctx, rig, {
      wireframeColor: '#39ff7a',
      lineScale: 1.1,
    });
    ctx.restore();
    return;
  }

  if (scene.inkMode === 'rubbing') {
    // Han stone rubbing: crisp white carved relief on black charcoal ground!
    drawRig2D(ctx, rig, {
      featherFill: '#ece6da',
      featherShade: '#dcd4c4',
      wingTipDark: '#181715',
      beakFill: '#ece6da',
      pouchFill: '#d8d0c0',
      legFill: '#ece6da',
      frameStroke: '#ece6da',
      metalStroke: '#cfc7b6',
      tireStroke: '#f2ece0',
      inkOutline: '#181715',
      lineScale: 1.1,
    });
    return;
  }

  if (scene.isInk) {
    // Shared Chinese ink styling across #4, #5, #6, #9
    drawRig2D(ctx, rig, {
      featherFill: scene.inkMode === 'baimiao' ? '#efe6d2' : '#f7f3e8',
      featherShade: scene.inkMode === 'baimiao' ? '#efe6d2' : '#d5cfc2',
      wingTipDark: INK_SHADES.jiao,
      beakFill: scene.inkMode === 'jiehua' ? '#c98c50' : '#dfdad0',
      pouchFill: scene.inkMode === 'jiehua' ? '#b86c3a' : '#bab3a4',
      legFill: INK_SHADES.zhong,
      frameStroke: INK_SHADES.nong,
      metalStroke: INK_SHADES.zhong,
      tireStroke: INK_SHADES.jiao,
      inkOutline: INK_SHADES.jiao,
      lineScale: scene.inkMode === 'baimiao' ? 0.92 : 1.15,
    });
    return;
  }

  if (scene.id === 's10_wayang') {
    // Ornate gold-and-umber Wayang puppet + visible control rods down to puppeteer below!
    drawRig2D(ctx, rig, {
      featherFill: '#e6a832',
      featherShade: '#c48327',
      wingTipDark: '#2b1608',
      beakFill: '#8c2318',
      pouchFill: '#b84a1c',
      legFill: '#c48327',
      frameStroke: '#592c12',
      metalStroke: '#8c2318',
      tireStroke: '#2b1608',
      inkOutline: '#2b1608',
    });
    // Horn control rods (操纵杆) attached to beak & wing!
    ctx.save();
    ctx.strokeStyle = 'rgba(58, 30, 12, 0.82)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(rig.wingTip.x, rig.wingTip.y);
    ctx.lineTo(rig.wingTip.x - 18, PANEL_SIZE);
    ctx.moveTo(rig.beakTip.x - 12, rig.beakTip.y + 4);
    ctx.lineTo(rig.beakTip.x + 12, PANEL_SIZE);
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Distinct per-era tinted palette so cross-frame style change is immediately unmistakable!
  drawRig2D(ctx, rig, {
    featherFill: scene.num >= 18 ? '#f4f6fc' : '#f8f3e6',
    featherShade: accent3 || '#dfd5c0',
    wingTipDark: darkCol || '#26221e',
    beakFill: accent2 || '#eba02d',
    pouchFill: accent1 || '#d96526',
    legFill: accent1 || '#cf6224',
    frameStroke: accent1 || '#a8382b',
    metalStroke: darkCol || '#36322e',
    tireStroke: darkCol || '#1f1c19',
    inkOutline: darkCol && darkCol !== '#ffffff' && darkCol !== '#fcfcfc' ? darkCol : '#1b1815',
  });
}

function drawVerticalShortVideoFrame(ctx, scene, localT) {
  // 9:16 phone viewport centered inside 1000x1000 -> width = 562.5, x in [219, 781]
  const vx = 219;
  const vw = 562;

  ctx.save();
  // Pure black side pillarboxes inside the 1000x1000 panel
  ctx.fillStyle = '#050508';
  ctx.fillRect(0, 0, vx, PANEL_SIZE);
  ctx.fillRect(vx + vw, 0, PANEL_SIZE - (vx + vw), PANEL_SIZE);

  // Subtle phone bezel border
  ctx.strokeStyle = '#2d2d3a';
  ctx.lineWidth = 4;
  ctx.strokeRect(vx, 2, vw, PANEL_SIZE - 4);

  // Fictional short-video right-rail action icons (heart / comment / share circles)
  const railX = vx + vw - 46;
  const likeCount = 1280 + Math.floor(localT * 145);
  ctx.fillStyle = '#ff2a5f';
  ctx.beginPath();
  ctx.arc(railX, 520, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 15px "PelicanSans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${(likeCount / 1000).toFixed(1)}w`, railX, 558);

  // Upward-floating comment bubbles & hearts
  const comments = [
    '？？？真的是鹈鹕在蹬车',
    '这踏频稳在 120 BPM！',
    '前排围观古今第一骑手',
    '喉囊还会跟着拍子晃哈哈哈',
  ];
  ctx.textAlign = 'left';
  for (let i = 0; i < comments.length; i++) {
    const cy = 870 - (((localT * 85 + i * 72) % 280));
    const alpha = clamp(1 - (870 - cy) / 280, 0, 0.92);
    ctx.fillStyle = `rgba(18, 18, 26, ${(alpha * 0.68).toFixed(2)})`;
    ctx.beginPath();
    ctx.roundRect(vx + 22, cy - 22, 265, 32, 16);
    ctx.fill();
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
    ctx.font = '500 16px "PelicanSans", sans-serif';
    ctx.fillText(comments[i], vx + 36, cy);
  }

  // Bottom progress bar: hits 100% EXACTLY at localT = 6.0s when crossing the right frame!
  const prog = clamp(localT / 6.0, 0, 1);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
  ctx.fillRect(vx + 4, PANEL_SIZE - 14, vw - 8, 6);
  ctx.fillStyle = '#ff2a5f';
  ctx.fillRect(vx + 4, PANEL_SIZE - 14, (vw - 8) * prog, 6);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(vx + 4 + (vw - 8) * prog, PANEL_SIZE - 11, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawAnimaticBeatFooter(ctx, scene, localT) {
  const bar = Math.min(3, Math.floor(localT / 2.0) + 1);
  const phaseLabel =
    bar === 1 ? '第1小节 · 过框进场' : bar === 2 ? `第2小节 · 梗：${scene.gag}` : '第3小节 · 驶向下一画框';

  const x0 = scene.id === 's19_shortvideo' ? 236 : 44;
  const maxW = scene.id === 's19_shortvideo' ? 528 : 912;

  ctx.save();
  ctx.fillStyle = 'rgba(16, 15, 13, 0.66)';
  ctx.beginPath();
  ctx.roundRect(x0, PANEL_SIZE - 62, maxW, 38, 6);
  ctx.fill();

  ctx.fillStyle = '#f3ede0';
  ctx.font = '500 17px "PelicanSans", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(phaseLabel, x0 + 16, PANEL_SIZE - 43, maxW - 32);
  ctx.restore();
}
