// src/components/kinetic_lyrics/layouts.js
// 4K Spatial Kinetic Typography Shot Renderers (`文字镜头引擎` — Era-Adaptive Ink & Gold Edition):
// - Enforces strict museum curator plaque protection (`y <= 648 < 654` across all 20 eras; `y <= 690` in Outro)
// - Aligns horizontal bounds to the active 632px painting frame (`[188..772]`) so lyrics never slice across
//   vertical 3D museum frames onto neighboring paintings, while keeping #19 Shorts inside `[304..612]`
// - Adapts 4K typography between `paper_ink` (carved pine-soot & cinnabar ink on bright Xuan paper / silk / UI,
//   with zero dark soot smudge) and `ivory_gold` (sculpted warm ivory & molten sparks on dark scenes, with
//   reveal-progressive cushions that never project ahead of unsung characters).

import { clamp, smooth } from '../../core/math.js';
import {
  drawCarvedSeal,
  drawBeakCaliperDiagram,
  drawBellAcousticRings,
  drawPigmentChips,
  drawRouteTrajectoryArc,
  drawChatBubbleStack,
  drawAngledHistoryCards,
  drawSmileArc,
  drawSpeedLines,
  drawHammerSparks,
  drawInteractivePillButton,
} from './ornaments.js';

const SAFE_X0 = 36;
const SAFE_X1 = 924;
const ACTIVE_X0 = 146;
const ACTIVE_X1 = 814;
const SCENE_Y0 = 58; // Keeps >=14px clearance below top Download Loader Capsule (`y = 6..42`)
const SCENE_Y1 = 638; // Guarantees bottom pixel (glyph + stroke + shadow) <= 654 < 666 (48px museum plaque at 666..714)

const LIGHT_PAPER_SCENES = new Set(['tang', 'song', 'qingming', 'bada', 'ukiyoe', 'chat']);

function easeOutBack(x) {
  const t = clamp(x, 0, 1);
  const c1 = 2.05;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function resolveFontFamily(code) {
  switch (code) {
    case 'serif':
      return '"CarbonSerif", "PelicanSerif", serif';
    case 'kai':
      return '"CarbonKai", "PelicanWenKai", serif';
    case 'mono':
      return '"CarbonMono", "PelicanMono", monospace';
    default:
      return '"CarbonSans", "PelicanSans", sans-serif';
  }
}

function resolveInkStyle(shot, sceneId) {
  const isPaperInk =
    shot.inkMode === 'paper_ink' ||
    (shot.inkMode !== 'ivory_gold' && LIGHT_PAPER_SCENES.has(sceneId));
  const darkInkColor = sceneId === 'chat' ? '#172234' : '#1b1510';
  return {
    lightInk: !isPaperInk,
    darkInkColor,
  };
}

function measureFittedRow(ctx, items, basePx, heroMult, fontFam, maxW, padNormal = 3, padHero = 6) {
  const build = (scale) => {
    let totalW = 0;
    const metrics = items.map((g) => {
      const px = Math.max(36, Math.round(basePx * scale * (g.isHero ? heroMult : 1.0)));
      ctx.font = `900 ${px}px ${fontFam}`;
      const gw = ctx.measureText(g.ch).width + (g.isHero ? padHero : padNormal) * scale;
      totalW += gw;
      return { g, px, gw };
    });
    return { metrics, totalW };
  };

  const raw = build(1.0);
  if (raw.totalW <= maxW || raw.totalW <= 1) return raw;
  return build((maxW / raw.totalW) * 0.985);
}

function drawSculptedGlyph(ctx, ch, x, y, px, fontFam, opts) {
  const {
    sung,
    impulse,
    isHero,
    accent,
    rot = 0,
    chromatic = false,
    lightInk = true,
    darkInkColor = '#1b1510',
  } = opts;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const scale = 1 + impulse * (isHero ? 0.24 : 0.12);
  ctx.scale(scale, scale);
  ctx.font = `900 ${px}px ${fontFam}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (chromatic && (sung || isHero)) {
    ctx.fillStyle = '#25f4ee';
    ctx.fillText(ch, -2.4, -1.4);
    ctx.fillStyle = '#fe2c55';
    ctx.fillText(ch, 2.4, 1.4);
  }

  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;

  if (lightInk) {
    // Dark / rich background -> Sculpted Ivory-Gold & Molten Spark with zero-blur crisp bevel drop-stroke (60fps!)
    const strokeW = Math.max(5.2, px * (isHero ? 0.135 : 0.12));
    ctx.lineWidth = strokeW + 1.8;
    ctx.strokeStyle = 'rgba(6, 4, 2, 0.72)';
    ctx.strokeText(ch, 0, 2.2);

    ctx.lineWidth = strokeW;
    ctx.strokeStyle = '#120d09';
    ctx.strokeText(ch, 0, 0);

    if (!sung) {
      ctx.fillStyle = 'rgba(246, 238, 224, 0.38)';
    } else if (isHero) {
      ctx.fillStyle = accent;
    } else {
      ctx.fillStyle = '#fffaf0';
    }
    ctx.fillText(ch, 0, 0);
  } else {
    // Bright Xuan paper / silk / parchment / white UI -> Crisp rice-paper halo + carved pine-soot / cinnabar ink
    const strokeW = Math.max(5.2, px * (isHero ? 0.142 : 0.128));
    ctx.lineWidth = strokeW + 1.4;
    ctx.strokeStyle = 'rgba(28, 20, 12, 0.18)';
    ctx.strokeText(ch, 0, 1.6);

    ctx.lineWidth = strokeW;
    ctx.strokeStyle = 'rgba(253, 249, 240, 0.96)';
    ctx.strokeText(ch, 0, 0);

    ctx.lineWidth = Math.max(1.5, px * 0.035);
    ctx.strokeStyle = 'rgba(255, 253, 247, 0.98)';
    ctx.strokeText(ch, 0, 0);

    if (!sung) {
      ctx.fillStyle = 'rgba(42, 32, 24, 0.30)';
    } else if (isHero) {
      ctx.fillStyle = accent;
    } else {
      ctx.fillStyle = darkInkColor;
    }
    ctx.fillText(ch, 0, 0);
  }

  ctx.restore();
}

function drawSoftBackdropCushion(ctx, cx, cy, rx, ry, darkness = 0.28) {
  if (darkness <= 0.01 || rx <= 4 || ry <= 4) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(Math.max(10, rx), Math.max(10, ry));
  const g = ctx.createRadialGradient(0, 0, 0.06, 0, 0, 1.0);
  g.addColorStop(0, `rgba(10, 8, 6, ${darkness})`);
  g.addColorStop(0.58, `rgba(10, 8, 6, ${(darkness * 0.48).toFixed(3)})`);
  g.addColorStop(1, 'rgba(10, 8, 6, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(-1.02, -1.02, 2.04, 2.04);
  ctx.restore();
}

function computeRevealedRowSpan(metrics, startX, t) {
  let xCursor = startX;
  let minX = Infinity;
  let maxX = -Infinity;
  for (let i = 0; i < metrics.length; i += 1) {
    const m = metrics[i];
    const enterU = clamp((t - (m.g.timing.start - 0.045)) / 0.11, 0, 1);
    if (enterU > 0.02) {
      if (xCursor < minX) minX = xCursor;
      const rightEdge = xCursor + m.gw * clamp(enterU * 1.35, 0.25, 1);
      if (rightEdge > maxX) maxX = rightEdge;
    }
    xCursor += m.gw;
  }
  if (!Number.isFinite(minX) || maxX <= minX) return null;
  return { cx: (minX + maxX) * 0.5, width: maxX - minX };
}

function charStateAt(t, charTiming, isHero) {
  const leadStart = charTiming.start - 0.045;
  const enterU = clamp((t - leadStart) / 0.11, 0, 1);
  const sung = t >= charTiming.start - 0.015;
  const elapsed = Math.max(0, t - charTiming.start);
  const impulse = sung ? Math.exp(-elapsed * (isHero ? 7.5 : 11.5)) : 0;
  return { enterU, spring: easeOutBack(enterU), sung, impulse };
}

export function renderSpatialLyricShot(ctx, state) {
  const { t, line, shot, sceneId = '', alpha, progress, beat, anvil, pelPos } = state;
  const fontFam = resolveFontFamily(shot.font);
  const accent = shot.accent || '#e87a3d';
  const basePx = Math.round((shot.size || 56) * 1.28);
  const { lightInk, darkInkColor } = resolveInkStyle(shot, sceneId);

  ctx.save();
  ctx.globalAlpha = alpha;

  // Special interactive UI pill button shot (`Outro L35: 那只鸟 还在跑`)
  if (shot.layout === 'outro_pill_button') {
    drawInteractivePillButton(ctx, shot.x, shot.y, line, progress, anvil, accent);
    ctx.restore();
    return;
  }

  const clauses = line.clauses;

  // --- LAYOUT 1: Active-Frame Left Editorial Block / Beak Caliper / IM Chat ---
  if (
    shot.layout === 'left_editorial' ||
    shot.layout === 'beak_caliper' ||
    shot.layout === 'chat_bubbles'
  ) {
    const startX = clamp(shot.x - 24, ACTIVE_X0, 240);
    // Reserve `[542..808]` inside #17 active panel when IM bubbles are stacked on the right
    const maxRight = shot.ornament === 'im_stack' ? 536 : ACTIVE_X1;
    const availW = Math.max(296, maxRight - startX);

    const fittedRows = clauses.map((cl) =>
      measureFittedRow(ctx, cl.items, basePx, 1.18, fontFam, availW, 3, 5.5)
    );
    const maxRowW = Math.max(...fittedRows.map((r) => r.totalW), 180);
    const rowStep = Math.min(88, Math.round(basePx * 1.18));
    const minTopY = shot.ornament === 'counter_badge' ? SCENE_Y0 + 62 : SCENE_Y0 + 34;
    const maxStartY = SCENE_Y1 - 36 - Math.max(0, clauses.length - 1) * rowStep;
    const startY = clamp(shot.y, minTopY, Math.max(minTopY, maxStartY));

    // Reveal-progressive subtle cushion ONLY on dark scenes (never smears soot on Xuan paper / silk / white UI!)
    if (lightInk) {
      for (let ci = 0; ci < fittedRows.length; ci += 1) {
        const span = computeRevealedRowSpan(fittedRows[ci].metrics, startX, t);
        if (span) {
          drawSoftBackdropCushion(
            ctx,
            span.cx,
            startY + ci * rowStep,
            span.width * 0.56 + 32,
            44,
            0.30
          );
        }
      }
    }

    const bottomRowY = startY + (fittedRows.length - 1) * rowStep;
    if (shot.ornament === 'route_arc') {
      drawRouteTrajectoryArc(ctx, startX, bottomRowY, maxRowW, progress, accent);
    } else if (shot.ornament === 'caliper_bracket') {
      drawBeakCaliperDiagram(ctx, pelPos, progress, accent, !lightInk);
    } else if (shot.ornament === 'im_stack') {
      drawChatBubbleStack(ctx, shot.sideBubbles, progress, accent);
    } else if (shot.ornament === 'counter_badge') {
      const badgeY = Math.max(SCENE_Y0 - 2, startY - 64);
      ctx.save();
      ctx.fillStyle = lightInk ? 'rgba(14, 11, 16, 0.90)' : 'rgba(250, 243, 228, 0.96)';
      ctx.strokeStyle = accent;
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.roundRect(startX, badgeY, 286, 38, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = lightInk ? accent : '#9e2a1c';
      ctx.font = '800 20.5px "CarbonMono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const trips = Math.min(6000, Math.round(smooth(clamp(progress * 1.4, 0, 1)) * 6000));
      ctx.fillText(`「第 ${String(trips).padStart(4, '0')} / 6000 趟」`, startX + 13, badgeY + 19.5);
      ctx.restore();
    }

    for (let ci = 0; ci < fittedRows.length; ci += 1) {
      const row = fittedRows[ci];
      let xCursor = startX;
      const rowY = startY + ci * rowStep - anvil * 3.0;

      for (let gi = 0; gi < row.metrics.length; gi += 1) {
        const m = row.metrics[gi];
        const cs = charStateAt(t, m.g.timing, m.g.isHero);
        if (cs.enterU <= 0.01) {
          xCursor += m.gw;
          continue;
        }
        const dropY = (1 - cs.spring) * -16 - cs.impulse * (m.g.isHero ? 7 : 3.5);
        const safeGlyphY = clamp(
          rowY + dropY,
          SCENE_Y0 + m.px * 0.46,
          SCENE_Y1 - m.px * 0.48
        );

        ctx.save();
        ctx.globalAlpha *= clamp(cs.enterU * 1.5, 0, 1);
        drawSculptedGlyph(ctx, m.g.ch, xCursor + m.gw * 0.5, safeGlyphY, m.px, fontFam, {
          sung: cs.sung,
          impulse: cs.impulse,
          isHero: m.g.isHero,
          accent,
          rot: m.g.isHero ? -0.02 : 0,
          lightInk,
          darkInkColor,
        });
        ctx.restore();
        xCursor += m.gw;
      }
    }

    ctx.restore();
    return;
  }

  // --- LAYOUT 2: Upper / Foreground Staggered & Split Diagonal ---
  if (shot.layout === 'upper_staggered' || shot.layout === 'split_diagonal') {
    const allItems = clauses.flatMap((c) => c.items);
    const maxW = ACTIVE_X1 - ACTIVE_X0 - 12;
    const fitted = measureFittedRow(ctx, allItems, basePx, 1.2, fontFam, maxW, 3.5, 6);

    const centerX = clamp(
      shot.x,
      ACTIVE_X0 + 6 + fitted.totalW * 0.5,
      ACTIVE_X1 - 6 - fitted.totalW * 0.5
    );
    const baseY = clamp(shot.y, SCENE_Y0 + 38, SCENE_Y1 - 42);
    const leftEdgeX = centerX - fitted.totalW * 0.5;

    if (lightInk) {
      const span = computeRevealedRowSpan(fitted.metrics, leftEdgeX, t);
      if (span) {
        drawSoftBackdropCushion(ctx, span.cx, baseY + 4, span.width * 0.56 + 32, 46, 0.28);
      }
    }

    if (shot.ornament === 'route_arc') {
      drawRouteTrajectoryArc(ctx, leftEdgeX, baseY + 4, fitted.totalW, progress, accent);
    } else if (shot.ornament === 'smile_arc') {
      drawSmileArc(ctx, centerX, baseY + 22, fitted.totalW, progress, accent);
    } else if (shot.ornament === 'speed_lines') {
      drawSpeedLines(ctx, centerX, baseY, fitted.totalW, progress, accent);
    } else if (shot.ornament === 'chisel_sparks' || shot.ornament === 'hammer_stamp') {
      drawHammerSparks(ctx, centerX, baseY, fitted.totalW, anvil, progress, accent);
    }

    let xCursor = leftEdgeX;
    for (let i = 0; i < fitted.metrics.length; i += 1) {
      const m = fitted.metrics[i];
      const cs = charStateAt(t, m.g.timing, m.g.isHero);
      if (cs.enterU <= 0.01) {
        xCursor += m.gw;
        continue;
      }
      const staggerY =
        Math.sin(i * 1.45) * 7.5 +
        (shot.layout === 'split_diagonal' ? (i - fitted.metrics.length * 0.5) * 2.3 : 0);
      const rawY =
        baseY +
        staggerY +
        (1 - cs.spring) * 16 -
        cs.impulse * (m.g.isHero ? 8 : 3.5) -
        anvil * 3.0;
      const y = clamp(rawY, SCENE_Y0 + m.px * 0.46, SCENE_Y1 - m.px * 0.48);

      ctx.save();
      ctx.globalAlpha *= clamp(cs.enterU * 1.5, 0, 1);
      drawSculptedGlyph(ctx, m.g.ch, xCursor + m.gw * 0.5, y, m.px, fontFam, {
        sung: cs.sung,
        impulse: cs.impulse,
        isHero: m.g.isHero,
        accent,
        rot: ((i % 3) - 1) * 0.048,
        lightInk,
        darkInkColor,
      });
      ctx.restore();
      xCursor += m.gw;
    }

    ctx.restore();
    return;
  }

  // --- LAYOUT 3: Classical Vertical Calligraphy Scroll + Cinnabar Seal ---
  if (shot.layout === 'vertical_scroll') {
    const maxLen = Math.max(...clauses.map((c) => c.items.length), 1);
    const startY = clamp(shot.y, SCENE_Y0 + 24, 132);
    const sealSpace = shot.seal ? 68 : 16;
    const availH = SCENE_Y1 - startY - sealSpace;
    const fittedBasePx = Math.min(basePx, Math.floor(availH / (maxLen * 1.12)));
    const colSpacing = fittedBasePx * 1.32;

    // In #05 Song (`sceneId === 'song'`), camera pushes 2.75x full-bleed across 960x720
    const maxRightCol = sceneId === 'song' || shot.x > 780 ? SAFE_X1 - 42 : ACTIVE_X1 - 28;
    const minRightCol = ACTIVE_X0 + 28 + Math.max(0, clauses.length - 1) * colSpacing;
    const rightColX = clamp(shot.x, minRightCol, Math.max(minRightCol, maxRightCol));

    if (shot.ornament === 'pigment_chips') {
      const leftMostCol = rightColX - (clauses.length - 1) * colSpacing;
      drawPigmentChips(ctx, leftMostCol - 22, startY - 12, progress);
    }

    for (let ci = 0; ci < clauses.length; ci += 1) {
      const cl = clauses[ci];
      const colX = rightColX - ci * colSpacing;
      let yCursor = startY;

      for (let gi = 0; gi < cl.items.length; gi += 1) {
        const g = cl.items[gi];
        const px = Math.round(fittedBasePx * (g.isHero ? 1.16 : 1.0));
        const cs = charStateAt(t, g.timing, g.isHero);
        if (cs.enterU <= 0.01) {
          yCursor += px * 1.08;
          continue;
        }
        ctx.save();
        ctx.globalAlpha *= clamp(cs.enterU * 1.5, 0, 1);
        drawSculptedGlyph(
          ctx,
          g.ch,
          clamp(colX + (1 - cs.spring) * 10, SAFE_X0 + 32, SAFE_X1 - 32),
          clamp(yCursor, SCENE_Y0 + px * 0.45, SCENE_Y1 - px * 0.48),
          px,
          fontFam,
          {
            sung: cs.sung,
            impulse: cs.impulse,
            isHero: g.isHero,
            accent,
            rot: 0,
            lightInk: false,
            darkInkColor: '#1b1510',
          }
        );
        ctx.restore();
        yCursor += px * 1.08;
      }

      if (ci === clauses.length - 1 && shot.seal && progress > 0.40) {
        const sealU = smooth(clamp((progress - 0.40) * 3.4, 0, 1));
        ctx.save();
        ctx.globalAlpha *= sealU;
        drawCarvedSeal(ctx, colX, yCursor + 22, 54, shot.seal, SCENE_Y1);
        ctx.restore();
      }
    }

    ctx.restore();
    return;
  }

  // --- LAYOUT 4: Acoustic Handlebar Bell Pop ---
  if (shot.layout === 'bell_acoustic') {
    drawBellAcousticRings(ctx, pelPos, t, beat, accent, ACTIVE_X0, ACTIVE_X1);
    const allItems = clauses.flatMap((c) => c.items);
    const maxW = ACTIVE_X1 - ACTIVE_X0 - 20;
    const fitted = measureFittedRow(ctx, allItems, basePx, 1.2, fontFam, maxW, 5, 8);

    const rawCx = pelPos?.x ?? shot.x;
    const cx = clamp(
      rawCx,
      ACTIVE_X0 + 10 + fitted.totalW * 0.5,
      ACTIVE_X1 - 10 - fitted.totalW * 0.5
    );
    const baseBy = clamp(
      Math.min(shot.y, (pelPos?.y ?? 459) - 168),
      SCENE_Y0 + 58,
      SCENE_Y1 - 42
    );
    const leftEdgeX = cx - fitted.totalW * 0.5;

    if (lightInk) {
      const span = computeRevealedRowSpan(fitted.metrics, leftEdgeX, t);
      if (span) {
        drawSoftBackdropCushion(ctx, span.cx, baseBy - 8, span.width * 0.56 + 30, 44, 0.28);
      }
    }

    let xCursor = leftEdgeX;
    for (let i = 0; i < fitted.metrics.length; i += 1) {
      const m = fitted.metrics[i];
      const cs = charStateAt(t, m.g.timing, m.g.isHero);
      if (cs.enterU <= 0.01) {
        xCursor += m.gw;
        continue;
      }
      const arcY = clamp(
        baseBy -
          Math.sin((i / Math.max(1, fitted.metrics.length - 1)) * Math.PI) * 20 -
          cs.impulse * 10,
        SCENE_Y0 + m.px * 0.46,
        SCENE_Y1 - m.px * 0.48
      );
      const tilt = (i - (fitted.metrics.length - 1) * 0.5) * 0.072;

      ctx.save();
      ctx.globalAlpha *= clamp(cs.enterU * 1.5, 0, 1);
      drawSculptedGlyph(ctx, m.g.ch, xCursor + m.gw * 0.5, arcY, m.px, fontFam, {
        sung: cs.sung,
        impulse: cs.impulse,
        isHero: m.g.isHero,
        accent,
        rot: tilt,
        lightInk,
        darkInkColor,
      });
      ctx.restore();
      xCursor += m.gw;
    }

    ctx.restore();
    return;
  }

  // --- LAYOUT 5: CRT Phosphor Terminal / 8-Bit Stage & JRPG Dialogue Box ---
  if (shot.layout === 'crt_terminal' || shot.layout === 'pixel_banner') {
    const isCRT = shot.layout === 'crt_terminal';
    const maxFrameW = ACTIVE_X1 - ACTIVE_X0;
    const maxInnerW = maxFrameW - 44;
    const fittedRows = clauses.map((cl) =>
      measureFittedRow(ctx, cl.items, basePx, 1.15, fontFam, maxInnerW, 3, 5)
    );
    const widest = Math.max(...fittedRows.map((r) => r.totalW), 320);
    const rowStep = Math.round(Math.min(74, basePx * 1.14));
    const headerH = 36;
    const boxW = clamp(widest + 48, isCRT ? 460 : 480, maxFrameW);
    const boxH = headerH + fittedRows.length * rowStep + 26;
    const rawBx = isCRT ? shot.x - 18 : shot.x - boxW * 0.5;
    const bx = clamp(rawBx, ACTIVE_X0, ACTIVE_X1 - boxW);
    const by = clamp(shot.y - 20, SCENE_Y0, SCENE_Y1 - boxH);

    ctx.save();
    ctx.fillStyle = isCRT ? 'rgba(6, 22, 14, 0.90)' : 'rgba(16, 15, 34, 0.92)';
    ctx.strokeStyle = accent;
    ctx.lineWidth = isCRT ? 2.1 : 3.0;
    ctx.fillRect(bx, by, boxW, boxH);
    if (isCRT) ctx.setLineDash([8, 4]);
    ctx.strokeRect(bx, by, boxW, boxH);
    ctx.setLineDash([]);

    // Dedicated header bar with hairline separator so glyphs NEVER collide with header text!
    ctx.fillStyle = isCRT ? 'rgba(57, 255, 122, 0.12)' : 'rgba(255, 216, 77, 0.14)';
    ctx.fillRect(bx + 1, by + 1, boxW - 2, headerH - 1);
    ctx.strokeStyle = isCRT ? 'rgba(110, 255, 158, 0.36)' : 'rgba(255, 216, 77, 0.40)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bx + 1, by + headerH);
    ctx.lineTo(bx + boxW - 1, by + headerH);
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.font = '800 17.5px "CarbonMono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const headerText = isCRT
      ? shot.y > 400
        ? 'OSC_CH2 // PHOSPHOR_TRACE'
        : 'OSC_CH1 // VECTOR_READOUT'
      : shot.y > 400
        ? 'STAGE 16 // PIXEL_DIALOGUE'
        : 'STAGE 16 // PELICAN_8BIT';
    ctx.fillText(headerText, bx + 14, by + headerH * 0.5 + 0.5);
    ctx.restore();

    for (let ci = 0; ci < fittedRows.length; ci += 1) {
      const row = fittedRows[ci];
      const rowY = by + headerH + 10 + rowStep * 0.5 + ci * rowStep;
      let xCursor = isCRT ? bx + 22 : bx + (boxW - row.totalW) * 0.5;

      for (let gi = 0; gi < row.metrics.length; gi += 1) {
        const m = row.metrics[gi];
        const cs = charStateAt(t, m.g.timing, m.g.isHero);
        if (cs.enterU <= 0.01) {
          xCursor += m.gw;
          continue;
        }
        const gy = clamp(
          rowY - cs.impulse * 5,
          by + headerH + m.px * 0.42,
          SCENE_Y1 - m.px * 0.44
        );
        drawSculptedGlyph(ctx, m.g.ch, xCursor + m.gw * 0.5, gy, m.px, fontFam, {
          sung: cs.sung,
          impulse: cs.impulse,
          isHero: m.g.isHero,
          accent,
          lightInk: true,
        });
        xCursor += m.gw;
      }
    }

    ctx.restore();
    return;
  }

  // --- LAYOUT 5.5: Museum Wainscoting Horizontal Duet (`Outro L32..L34`, safe down to y <= 690) ---
  if (shot.layout === 'outro_duet') {
    const centerY = clamp(shot.y, 632, 646) - anvil * 2.5;
    const leftClause = clauses[0]?.items || [];
    const rightClause = clauses[1]?.items || [];

    const dividerGap = 62;
    const halfMaxW = (SAFE_X1 - SAFE_X0 - dividerGap - 24) * 0.5;
    const leftFit = measureFittedRow(ctx, leftClause, basePx * 0.96, 1.14, fontFam, halfMaxW, 4, 6);
    const rightFit = measureFittedRow(ctx, rightClause, basePx * 1.04, 1.16, fontFam, halfMaxW, 4, 6);

    const totalW = leftFit.totalW + dividerGap + rightFit.totalW;
    const cx = clamp(shot.x, SAFE_X0 + 12 + totalW * 0.5, SAFE_X1 - 12 - totalW * 0.5);
    const leftStartX = cx - totalW * 0.5;
    const rightStartX = leftStartX + leftFit.totalW + dividerGap;

    const spanL = computeRevealedRowSpan(leftFit.metrics, leftStartX, t);
    const spanR = computeRevealedRowSpan(rightFit.metrics, rightStartX, t);
    if (spanL) drawSoftBackdropCushion(ctx, spanL.cx, centerY, spanL.width * 0.62 + 34, 40, 0.52);
    if (spanR) drawSoftBackdropCushion(ctx, spanR.cx, centerY, spanR.width * 0.62 + 34, 40, 0.52);

    ctx.save();
    ctx.strokeStyle = 'rgba(218, 182, 116, 0.36)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - totalW * 0.5 - 18, centerY - 36);
    ctx.lineTo(cx + totalW * 0.5 + 18, centerY - 36);
    ctx.moveTo(cx - totalW * 0.5 - 18, centerY + 36);
    ctx.lineTo(cx + totalW * 0.5 + 18, centerY + 36);
    ctx.stroke();

    const midX = leftStartX + leftFit.totalW + dividerGap * 0.5;
    ctx.strokeStyle = accent;
    ctx.fillStyle = accent;
    if (shot.ornament === 'guitar_strings') {
      const vib = Math.sin(t * 28) * 3.0 * (0.4 + beat);
      for (const dy of [-6.5, 0, 6.5]) {
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(midX - 18, centerY + dy);
        ctx.quadraticCurveTo(midX, centerY + dy + vib, midX + 18, centerY + dy);
        ctx.stroke();
      }
    } else if (shot.ornament === 'timeline_ticks') {
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(midX - 18, centerY);
      ctx.lineTo(midX + 18, centerY);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(midX, centerY, 4.6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const s = 8.2 + anvil * 4.8;
      ctx.beginPath();
      ctx.moveTo(midX, centerY - s);
      ctx.lineTo(midX + s * 0.65, centerY);
      ctx.lineTo(midX, centerY + s);
      ctx.lineTo(midX - s * 0.65, centerY);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    let xL = leftStartX;
    for (const m of leftFit.metrics) {
      const cs = charStateAt(t, m.g.timing, m.g.isHero);
      if (cs.enterU > 0.01) {
        const y = clamp(centerY + (1 - cs.spring) * 13 - cs.impulse * 5, 612, 676);
        ctx.save();
        ctx.globalAlpha *= clamp(cs.enterU * 1.5, 0, 1);
        drawSculptedGlyph(ctx, m.g.ch, xL + m.gw * 0.5, y, m.px, fontFam, {
          sung: cs.sung,
          impulse: cs.impulse,
          isHero: m.g.isHero,
          accent,
          lightInk: true,
        });
        ctx.restore();
      }
      xL += m.gw;
    }

    let xR = rightStartX;
    for (const m of rightFit.metrics) {
      const cs = charStateAt(t, m.g.timing, m.g.isHero);
      if (cs.enterU > 0.01) {
        const y = clamp(
          centerY + (1 - cs.spring) * -14 - cs.impulse * (m.g.isHero ? 8 : 4),
          612,
          676
        );
        ctx.save();
        ctx.globalAlpha *= clamp(cs.enterU * 1.5, 0, 1);
        drawSculptedGlyph(ctx, m.g.ch, xR + m.gw * 0.5, y, m.px, fontFam, {
          sung: cs.sung,
          impulse: cs.impulse,
          isHero: m.g.isHero,
          accent,
          rot: m.g.isHero ? -0.02 : 0,
          lightInk: true,
        });
        ctx.restore();
      }
      xR += m.gw;
    }

    ctx.restore();
    return;
  }

  // --- LAYOUT 6: Center Monument / Angled History / 9:16 Shorts Punch ---
  if (shot.ornament === 'angled_history') {
    drawAngledHistoryCards(ctx, progress, !lightInk);
  }

  const isChromatic = shot.layout === 'shorts_punch';
  // In #19 ShortVideo (`x=[295..665]`, right icons `[615..658]`), clamp strictly inside `[304..612]`!
  const minBoundX = isChromatic ? 304 : ACTIVE_X0;
  const maxBoundX = isChromatic ? 612 : ACTIVE_X1;
  const maxW = maxBoundX - minBoundX - 8;

  if (isChromatic && shot.ornament === 'bell_rings') {
    drawBellAcousticRings(ctx, pelPos, t, beat, accent, 304, 652);
  }

  const fittedRows = clauses.map((cl) =>
    measureFittedRow(ctx, cl.items, basePx, 1.18, fontFam, maxW, 3, 5.5)
  );
  const rowStep = Math.min(88, Math.round(basePx * 1.18));
  const maxStartY = SCENE_Y1 - 38 - Math.max(0, fittedRows.length - 1) * rowStep;
  const startY = clamp(shot.y, SCENE_Y0 + 40, Math.max(SCENE_Y0 + 40, maxStartY));

  for (let ci = 0; ci < fittedRows.length; ci += 1) {
    const row = fittedRows[ci];
    const sealReserve = shot.ornament === 'rubbing_seal' && ci === fittedRows.length - 1 ? 66 : 0;
    const cx = clamp(
      shot.x,
      minBoundX + 4 + row.totalW * 0.5,
      maxBoundX - 4 - sealReserve - row.totalW * 0.5
    );
    const rowY = startY + ci * rowStep - anvil * 3.2;
    const leftEdgeX = cx - row.totalW * 0.5;

    if (lightInk) {
      const span = computeRevealedRowSpan(row.metrics, leftEdgeX, t);
      if (span) {
        drawSoftBackdropCushion(ctx, span.cx, rowY, span.width * 0.56 + 28, 38, 0.28);
      }
    }

    let xCursor = leftEdgeX;
    for (let mi = 0; mi < row.metrics.length; mi += 1) {
      const m = row.metrics[mi];
      const cs = charStateAt(t, m.g.timing, m.g.isHero);
      if (cs.enterU <= 0.01) {
        xCursor += m.gw;
        continue;
      }
      const slamY = clamp(
        rowY + (1 - cs.spring) * -17 - cs.impulse * (m.g.isHero ? 8.5 : 3.5),
        SCENE_Y0 + m.px * 0.46,
        SCENE_Y1 - m.px * 0.48
      );
      ctx.save();
      ctx.globalAlpha *= clamp(cs.enterU * 1.5, 0, 1);
      drawSculptedGlyph(ctx, m.g.ch, xCursor + m.gw * 0.5, slamY, m.px, fontFam, {
        sung: cs.sung,
        impulse: cs.impulse,
        isHero: m.g.isHero,
        accent,
        rot: isChromatic ? (ci % 2 === 0 ? -1 : 1) * 0.028 : 0,
        chromatic: isChromatic,
        lightInk,
        darkInkColor,
      });
      ctx.restore();
      xCursor += m.gw;
    }

    if (ci === fittedRows.length - 1) {
      if (shot.ornament === 'rubbing_seal' && progress > 0.35) {
        drawCarvedSeal(ctx, cx + row.totalW * 0.5 + 36, rowY - 2, 54, '拓印', SCENE_Y1);
      } else if (shot.ornament === 'hammer_stamp') {
        drawHammerSparks(ctx, cx, rowY, row.totalW, anvil, progress, accent);
      } else if (shot.ornament === 'smile_arc') {
        drawSmileArc(ctx, cx, rowY + 20, row.totalW, progress, accent);
      }
    }
  }

  ctx.restore();
}
