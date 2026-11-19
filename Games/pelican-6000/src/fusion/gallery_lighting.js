// src/fusion/gallery_lighting.js
// Museum Exhibition Hall Wall Texture, 3D Brushed-Brass Picture Lamps,
// 2900K Volumetric Spotlight Cones, Peripheral Chiaroscuro, Conservation-Glass Sheen,
// High-Contrast 4K-Crisp Museum Curator Plaques (#01..#20), and Neon Bokeh Curtain Optics.

import { PANEL_SIZE } from './github_core/beat/timeline.js';
import { VIEW_W, VIEW_H } from './github_core/beat/camera.js';
import { makePRNG, hashSeed } from './github_core/kit/kit.js';

const TAU = Math.PI * 2;

let cachedWallTile = null;

export function getGalleryPlasterTile() {
  if (cachedWallTile) return cachedWallTile;
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  const rng = makePRNG(hashSeed('louvre_venetian_plaster_tile_v2'));

  ctx.fillStyle = '#25211c';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 180; i++) {
    const x = rng() * 512;
    const y = rng() * 512;
    const r = 18 + rng() * 58;
    const light = rng() > 0.48;
    const g = ctx.createRadialGradient(x, y, 2, x, y, r);
    g.addColorStop(0, light ? 'rgba(255, 240, 214, 0.022)' : 'rgba(6, 5, 4, 0.036)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  ctx.lineWidth = 0.75;
  for (let y = 0; y < 512; y += 3) {
    ctx.strokeStyle = y % 6 === 0 ? 'rgba(255, 244, 222, 0.012)' : 'rgba(0, 0, 0, 0.022)';
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(512, y + 0.5);
    ctx.stroke();
  }
  cachedWallTile = c;
  return c;
}

function drawCrispMuseumPlaque2D(ctx, scene, cx, topY, maxW, isActive) {
  if (scene.num < 1 || scene.num > 20) return;
  const numStr = String(scene.num).padStart(2, '0');
  const label = `${numStr} · ${scene.zh}  ｜  ${scene.era}`;

  ctx.save();
  ctx.font = '900 25.5px "PelicanSerif", "CarbonSerif", serif';
  const textW = ctx.measureText(label).width;
  const capW = Math.min(VIEW_W - 44, Math.max(maxW, 568));
  const pw = Math.min(capW, Math.max(348, Math.ceil(textW + 58)));
  const ph = 48;
  const px = cx - pw * 0.5;
  const py = Math.min(topY, VIEW_H - ph - 5);

  if (px + pw < -20 || px > VIEW_W + 20 || py > VIEW_H + 4) {
    ctx.restore();
    return;
  }

  ctx.globalAlpha = isActive ? 1.0 : 0.62;

  // Drop shadow
  ctx.fillStyle = 'rgba(4, 3, 2, 0.72)';
  ctx.beginPath();
  ctx.roundRect(px + 2, py + 3, pw, ph, 4);
  ctx.fill();

  // Deep obsidian-bronze brushed plate
  const bg = ctx.createLinearGradient(px, py, px + pw, py + ph);
  bg.addColorStop(0, '#19130c');
  bg.addColorStop(0.35, '#2b2014');
  bg.addColorStop(0.55, '#342718');
  bg.addColorStop(1, '#17110b');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, 4);
  ctx.fill();

  // Outer & chamfered inner gilt rules
  ctx.strokeStyle = isActive ? 'rgba(228, 188, 112, 0.86)' : 'rgba(186, 150, 88, 0.48)';
  ctx.lineWidth = isActive ? 1.5 : 1.1;
  ctx.beginPath();
  ctx.roundRect(px + 0.5, py + 0.5, pw - 1, ph - 1, 4);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(238, 204, 136, 0.34)';
  ctx.lineWidth = 0.9;
  ctx.strokeRect(px + 4, py + 4, pw - 8, ph - 8);

  // 4 gleaming brass corner rivets
  const rivets = [
    [px + 9, py + 9],
    [px + pw - 9, py + 9],
    [px + 9, py + ph - 9],
    [px + pw - 9, py + ph - 9],
  ];
  for (const [rx, ry] of rivets) {
    ctx.fillStyle = '#dcb874';
    ctx.beginPath();
    ctx.arc(rx, ry, 1.8, 0, TAU);
    ctx.fill();
  }

  // Crisp incised ivory-gold title & era typography (rendered at native 4K resolution!)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(6, 4, 2, 0.92)';
  ctx.fillText(label, cx + 0.8, py + ph * 0.52 + 1.0);
  ctx.fillStyle = isActive ? '#fff7e4' : '#e6d2ab';
  ctx.fillText(label, cx, py + ph * 0.52);

  ctx.restore();
}

export function renderMuseumGalleryOptics2D(ctx, cam, visiblePanels, activeSceneIndex, sync, realT) {
  const scale = cam.scale;
  const worldToScreenX = (wx) => VIEW_W * 0.5 + (wx - cam.camX) * scale;
  const worldToScreenY = (wy) => VIEW_H * 0.5 + (wy - cam.camY) * scale;

  const panelTopY = worldToScreenY(0);
  const panelBotY = worldToScreenY(PANEL_SIZE);
  const frameBotY = worldToScreenY(PANEL_SIZE + 18);
  const dadoY = Math.max(frameBotY + 42, VIEW_H - 5);
  const anvil = sync?.anvilShock ?? 0;

  // 1. Slim Brass Baseboard Molding at very bottom edge (eliminating giant empty dado margin!)
  if (cam.surroundDim < 0.85) {
    ctx.save();
    ctx.globalAlpha = 1 - cam.surroundDim * 0.85;
    const railY = Math.min(dadoY, VIEW_H - 4.5);
    const railGrad = ctx.createLinearGradient(0, railY, 0, VIEW_H);
    railGrad.addColorStop(0, '#c8a362');
    railGrad.addColorStop(0.45, '#7c6138');
    railGrad.addColorStop(1, '#1b140d');
    ctx.fillStyle = railGrad;
    ctx.fillRect(0, railY, VIEW_W, VIEW_H - railY);
    ctx.restore();
  }

  // 2. Per-Panel Museum Optics, Brass Picture Lamps & Crisp 4K Curator Plaques
  const hasSaharaPre = visiblePanels.some((p) => p.scene.id === 's01_sahara_pre');
  for (const { scene } of visiblePanels) {
    if (scene.id === 's01_sahara_pre') continue;
    if (scene.id === 's19_shortvideo' && cam.surroundDim > 0.55) continue;

    const isContinuousSahara = scene.id === 's01_sahara' && hasSaharaPre;
    const sx = worldToScreenX(isContinuousSahara ? -PANEL_SIZE : scene.worldX0);
    const sw = (isContinuousSahara ? PANEL_SIZE * 2 : PANEL_SIZE) * scale;
    const sy = panelTopY;
    const sh = panelBotY - panelTopY;

    const isActive = scene.index === activeSceneIndex;
    const smoothSlide = isContinuousSahara
      ? Math.max(0, Math.min(1, cam.camX / 500))
      : 1;
    const sCurve = smoothSlide * smoothSlide * (3 - 2 * smoothSlide);
    const featureCx = isContinuousSahara
      ? VIEW_W * 0.5 + (worldToScreenX(500) - VIEW_W * 0.5) * sCurve
      : sx + sw * 0.5;
    const featureW = PANEL_SIZE * scale;

    // A. Subtle peripheral museum chiaroscuro on inactive flanking paintings
    if (!isActive && cam.surroundDim < 0.5) {
      ctx.save();
      ctx.fillStyle = 'rgba(10, 9, 8, 0.20)';
      ctx.fillRect(sx, sy, sw, sh);
      ctx.restore();
    }

    // B. Diagonal museum conservation-glass / oil-varnish specular sheen
    ctx.save();
    ctx.beginPath();
    ctx.rect(sx, sy, sw, sh);
    ctx.clip();

    const sheen = ctx.createLinearGradient(sx, sy, sx + sw, sy + sh);
    sheen.addColorStop(0, `rgba(255, 248, 232, ${isActive ? '0.052' : '0.025'})`);
    sheen.addColorStop(0.26, 'rgba(255, 248, 232, 0.012)');
    sheen.addColorStop(0.34, 'rgba(255, 248, 232, 0)');
    sheen.addColorStop(0.68, 'rgba(255, 244, 218, 0.018)');
    sheen.addColorStop(0.74, 'rgba(255, 244, 218, 0)');
    sheen.addColorStop(1, 'rgba(0, 0, 0, 0.12)');
    ctx.fillStyle = sheen;
    ctx.fillRect(sx, sy, sw, sh);

    if (isActive && anvil > 0.05) {
      ctx.strokeStyle = `rgba(255, 214, 124, ${(anvil * 0.34).toFixed(3)})`;
      ctx.lineWidth = 2.2;
      ctx.strokeRect(sx + 1.5, sy + 1.5, sw - 3, sh - 3);
    }
    ctx.restore();

    // C. Overhead 3D Brushed-Brass Picture Lamp + 2900K Volumetric Wash Cone
    if (sy > 10 && cam.surroundDim < 0.65) {
      const lampCx = featureCx;
      const lampY = Math.max(7, sy - 12 * Math.min(1.15, scale / 0.63));
      const hoodW = 118 * scale;
      const hoodH = 11 * scale;
      const intensity = isActive ? 1.0 + anvil * 0.16 : 0.42;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      const cone = ctx.createRadialGradient(
        lampCx,
        lampY + 4,
        6,
        lampCx,
        sy + sh * 0.38,
        featureW * 0.78
      );
      cone.addColorStop(0, `rgba(255, 224, 154, ${(0.18 * intensity).toFixed(3)})`);
      cone.addColorStop(0.38, `rgba(255, 210, 128, ${(0.075 * intensity).toFixed(3)})`);
      cone.addColorStop(1, 'rgba(255, 198, 108, 0)');
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(lampCx - hoodW * 0.48, lampY + hoodH * 0.5);
      ctx.lineTo(lampCx + hoodW * 0.48, lampY + hoodH * 0.5);
      ctx.lineTo(lampCx + featureW * 0.5 + 28, sy + sh * 0.85);
      ctx.lineTo(lampCx - featureW * 0.5 - 28, sy + sh * 0.85);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = '#6f5632';
      ctx.lineWidth = Math.max(1.5, 3.0 * scale);
      ctx.beginPath();
      ctx.moveTo(lampCx, sy + 2);
      ctx.lineTo(lampCx, lampY + hoodH * 0.5);
      ctx.stroke();

      const brass = ctx.createLinearGradient(lampCx - hoodW * 0.5, lampY, lampCx + hoodW * 0.5, lampY);
      brass.addColorStop(0, '#4d3a1f');
      brass.addColorStop(0.28, '#cfa763');
      brass.addColorStop(0.5, '#f4d999');
      brass.addColorStop(0.72, '#b98f4b');
      brass.addColorStop(1, '#443219');
      ctx.fillStyle = brass;
      ctx.beginPath();
      ctx.roundRect(lampCx - hoodW * 0.5, lampY - hoodH * 0.5, hoodW, hoodH, hoodH * 0.45);
      ctx.fill();

      ctx.fillStyle = isActive ? 'rgba(255, 238, 188, 0.92)' : 'rgba(255, 222, 158, 0.45)';
      ctx.fillRect(lampCx - hoodW * 0.4, lampY + hoodH * 0.32, hoodW * 0.8, 1.8);
      ctx.restore();
    }

    // D. High-Contrast 4K Museum Curator Plaque right below frame (`y = frameBotY + 3`)
    if (cam.surroundDim < 0.65 && frameBotY < VIEW_H - 18) {
      drawCrispMuseumPlaque2D(ctx, scene, featureCx, frameBotY + 2, featureW * 0.86, isActive);
    }
  }

  // 3. Dreamy Out-of-Focus City Neon Bokeh on Flanking Curtains during #19 Vertical Short-Video Mode
  if (cam.surroundDim > 0.15) {
    const panel19X = worldToScreenX(18 * PANEL_SIZE);
    const panel19W = PANEL_SIZE * scale;
    const rng = makePRNG(hashSeed('curtain_neon_bokeh_19'));
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = cam.surroundDim * 0.55;
    for (let i = 0; i < 24; i++) {
      const leftSide = i % 2 === 0;
      const bx = leftSide
        ? rng() * Math.max(20, panel19X - 18)
        : panel19X + panel19W + 18 + rng() * Math.max(20, VIEW_W - (panel19X + panel19W));
      const by = 70 + rng() * (VIEW_H - 150) + Math.sin(realT * 0.9 + i) * 12;
      const br = 16 + rng() * 34;
      const col = i % 3 === 0 ? '255, 64, 148' : i % 3 === 1 ? '46, 226, 255' : '255, 178, 72';
      const bg = ctx.createRadialGradient(bx, by, 2, bx, by, br);
      bg.addColorStop(0, `rgba(${col}, 0.24)`);
      bg.addColorStop(0.65, `rgba(${col}, 0.08)`);
      bg.addColorStop(1, `rgba(${col}, 0)`);
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }
}
