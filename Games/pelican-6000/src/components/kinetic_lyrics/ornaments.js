// src/components/kinetic_lyrics/ornaments.js
// 4K-Crisp Graphic-Prop, UI-Event & Museum Callout Ornaments for Spatial Kinetic Typography.
// Strictly bounded inside active painting frames and above the y=668..714 museum curator plaques
// during Scenes 1..20 (maxBottom <= 650), and <= 690 during the Outro exhibition wall.

import { clamp, smooth } from '../../core/math.js';

export function drawCarvedSeal(ctx, x, y, size, text, maxBottomY = 648) {
  const half = size * 0.5;
  const cx = clamp(x, 186 + half, 888 - half);
  const cy = clamp(y, 54 + half, maxBottomY - half);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.035);

  // Soft paper contact impression shadow
  ctx.fillStyle = 'rgba(28, 14, 8, 0.22)';
  ctx.beginPath();
  ctx.roundRect(-half + 1.5, -half + 2, size, size, 3.5);
  ctx.fill();

  // Mineral cinnabar paste (`印泥朱砂`)
  ctx.fillStyle = '#b42c1e';
  ctx.beginPath();
  ctx.roundRect(-half, -half, size, size, 3.2);
  ctx.fill();

  // Crisp 4K carved inner border with subtle stone-cut corner chamfers
  ctx.strokeStyle = 'rgba(253, 244, 228, 0.94)';
  ctx.lineWidth = 1.65;
  ctx.strokeRect(-half + 3.2, -half + 3.2, size - 6.4, size - 6.4);

  ctx.fillStyle = '#fcf2df';
  ctx.font = `800 ${Math.round(size * 0.37)}px "CarbonSerif", "PelicanSerif", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (text.length === 2) {
    ctx.fillText(text[0], 0, -size * 0.19);
    ctx.fillText(text[1], 0, size * 0.21);
  } else {
    ctx.fillText(text, 0, 0);
  }
  ctx.restore();
}

export function drawBeakCaliperDiagram(ctx, pelPos, progress, accent = '#e86830', isLightBg = false) {
  // At BASE_PANEL_SCALE = 0.632, pelPos = (roadX, ~458.6).
  // Pelican head is at (px + 13, py - 130), beak at [px + 16..72, py - 136..-104],
  // handlebar stemTop is at (px + 33, py - 82).
  const px = clamp(pelPos?.x ?? 480, 260, 610);
  const py = clamp(pelPos?.y ?? 459, 340, 520);
  const reveal = smooth(clamp(progress * 2.4, 0, 1));
  if (reveal <= 0.02) return;

  ctx.save();
  ctx.globalAlpha *= reveal;

  // 1. Architectural caliper over the Pelican's iconic long beak (strictly inside active frame <= 772)
  const beakX0 = px + 15;
  const beakX1 = Math.min(770, px + 18 + 142 * reveal);
  const beakTopY = py - 138;
  const beakH = 36;

  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.2;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(beakX0, beakTopY, Math.max(12, beakX1 - beakX0), beakH);
  ctx.setLineDash([]);

  const dimY = beakTopY - 11;
  ctx.beginPath();
  ctx.moveTo(beakX0, dimY - 6);
  ctx.lineTo(beakX0, dimY + 6);
  ctx.moveTo(beakX1, dimY - 6);
  ctx.lineTo(beakX1, dimY + 6);
  ctx.moveTo(beakX0, dimY);
  ctx.lineTo(beakX1, dimY);
  ctx.stroke();

  const tagW = 192;
  const tagH = 34;
  const tagCx = clamp((beakX0 + beakX1) * 0.5, 265, 804 - tagW * 0.5);
  const tagCy = dimY - 20;

  ctx.fillStyle = isLightBg ? 'rgba(251, 245, 232, 0.96)' : 'rgba(14, 10, 18, 0.92)';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.roundRect(tagCx - tagW * 0.5, tagCy - tagH * 0.5, tagW, tagH, 7);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isLightBg ? '#a62c1c' : accent;
  ctx.font = '800 20.5px "CarbonMono", "CarbonSans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('「嘴巴 · 188cm」', tagCx, tagCy + 0.5);

  // 2. Contrast compact handlebar bracket + forward callout tag (zero occlusion on Pelican body!)
  const barX0 = px + 18;
  const barX1 = px + 44;
  const barCy = py - 82;

  ctx.strokeStyle = isLightBg ? 'rgba(42, 32, 22, 0.82)' : 'rgba(248, 240, 225, 0.88)';
  ctx.lineWidth = 1.8;
  ctx.setLineDash([4, 3]);
  ctx.strokeRect(barX0, barCy - 11, barX1 - barX0, 22);
  ctx.setLineDash([]);

  const barTagW = 172;
  const barTagH = 32;
  const barTagX = Math.min(804 - barTagW, barX1 + 14);
  ctx.beginPath();
  ctx.moveTo(barX1, barCy);
  ctx.lineTo(barTagX, barCy);
  ctx.stroke();

  ctx.fillStyle = isLightBg ? 'rgba(248, 241, 226, 0.95)' : 'rgba(14, 11, 18, 0.90)';
  ctx.strokeStyle = isLightBg ? 'rgba(58, 44, 30, 0.58)' : 'rgba(240, 230, 212, 0.52)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(barTagX, barCy - barTagH * 0.5, barTagW, barTagH, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = isLightBg ? '#261d15' : '#f5ede0';
  ctx.font = '800 19px "CarbonMono", "CarbonSans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('「车把 · 42cm」', barTagX + barTagW * 0.5, barCy + 0.5);
  ctx.restore();
}

export function drawBellAcousticRings(ctx, pelPos, t, beat, accent = '#ff9238', minX = 190, maxX = 770) {
  const bx = clamp((pelPos?.x ?? 480) + 33, minX + 40, maxX - 40);
  const by = clamp((pelPos?.y ?? 459) - 85, 180, 560);

  ctx.save();
  for (let i = 0; i < 3; i += 1) {
    const phase = (t * 2.2 + i * 0.33) % 1;
    const r = 14 + phase * 74;
    ctx.strokeStyle = accent;
    ctx.globalAlpha = (1 - phase) * (0.72 + beat * 0.24);
    ctx.lineWidth = 2.6 - phase * 1.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(bx, by, r, -Math.PI * 0.84, -Math.PI * 0.12);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawPigmentChips(ctx, x, y, progress) {
  const chips = [
    { name: '石青', col: '#2e6f95' },
    { name: '朱砂', col: '#c9482b' },
    { name: '赭石', col: '#9e5a34' },
    { name: '藤黄', col: '#e3a83b' },
  ];
  const cardX = clamp(x - 116, 156, 790);
  ctx.save();
  for (let i = 0; i < chips.length; i += 1) {
    const u = smooth(clamp((progress - i * 0.1) * 3.2, 0, 1));
    if (u <= 0.01) continue;
    const cy = clamp(y + i * 56 + (1 - u) * 10, 60, 594);
    ctx.save();
    ctx.globalAlpha *= u;

    ctx.fillStyle = 'rgba(28, 20, 12, 0.16)';
    ctx.beginPath();
    ctx.roundRect(cardX + 1.5, cy + 2, 104, 44, 8);
    ctx.fill();

    ctx.fillStyle = 'rgba(250, 243, 229, 0.96)';
    ctx.strokeStyle = 'rgba(72, 54, 38, 0.58)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cardX, cy, 104, 44, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = chips[i].col;
    ctx.beginPath();
    ctx.arc(cardX + 22, cy + 22, 10.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(34, 24, 16, 0.28)';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    ctx.fillStyle = '#241b13';
    ctx.font = '800 22.5px "CarbonKai", "PelicanWenKai", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(chips[i].name, cardX + 40, cy + 22.5);
    ctx.restore();
  }
  ctx.restore();
}

export function drawRouteTrajectoryArc(ctx, x, bottomRowY, rowWidth, progress, accent) {
  const u = smooth(clamp(progress * 1.85, 0, 1));
  if (u <= 0.02) return;
  const spanW = clamp(rowWidth * 0.78, 180, 360);
  const x0 = clamp(x + 8, 190, 740);
  const x1 = Math.min(768, x0 + spanW * u);
  const baseArcY = clamp(bottomRowY + 38, 86, 640);
  const peakArcY = Math.max(64, baseArcY - 24);

  ctx.save();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.setLineDash([7, 5]);
  ctx.beginPath();
  ctx.moveTo(x0, baseArcY);
  ctx.quadraticCurveTo((x0 + x1) * 0.5, peakArcY, x1, baseArcY - 4);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x0, baseArcY, 3.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x1, baseArcY - 4, 5.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawChatBubbleStack(ctx, bubbles, progress, accent = '#d94e1f') {
  if (!bubbles?.length) return;
  const rightEdge = 804;
  const baseY = 148;

  ctx.save();
  for (let i = 0; i < bubbles.length; i += 1) {
    const u = smooth(clamp((progress - i * 0.14) * 3.0, 0, 1));
    if (u <= 0.01) continue;
    const rawTxt = bubbles[i];
    const txt = rawTxt.startsWith('「') ? rawTxt : `「${rawTxt}」`;
    ctx.font = '800 22px "CarbonSans", "PelicanSans", sans-serif';
    const bw = Math.min(258, Math.ceil(ctx.measureText(txt).width + 28));
    const bh = 44;
    const bx = rightEdge - bw;
    const by = clamp(baseY + i * 52 + (1 - u) * 12, 64, 596);
    const isLast = i === bubbles.length - 1;

    ctx.save();
    ctx.globalAlpha *= u * 0.97;

    ctx.fillStyle = 'rgba(16, 24, 38, 0.18)';
    ctx.beginPath();
    ctx.roundRect(bx + 2, by + 2.5, bw, bh, 10);
    ctx.fill();

    ctx.fillStyle = isLast ? accent : 'rgba(252, 250, 244, 0.96)';
    ctx.strokeStyle = isLast ? 'rgba(255, 245, 232, 0.85)' : 'rgba(30, 54, 96, 0.42)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isLast ? '#fffaf4' : '#1b2638';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(txt, bx + bw * 0.5, by + bh * 0.5 + 0.5);
    ctx.restore();
  }
  ctx.restore();
}

export function drawAngledHistoryCards(ctx, progress, isLightBg = false) {
  // Positioned cleanly in upper #17 frame (`[196..766] x [150..265]`), zero overlap with GIF89a Pelican!
  const notes = [
    { t: '「前4000 · 撒哈拉草图」', x: 312, y: 170, rot: -0.065 },
    { t: '「1100 · 汴河虹桥速写」', x: 628, y: 168, rot: 0.055 },
    { t: '「2003 · pelican.gif」', x: 634, y: 222, rot: -0.045 },
  ];
  ctx.save();
  for (let i = 0; i < notes.length; i += 1) {
    const n = notes[i];
    const u = smooth(clamp((progress - i * 0.09) * 2.8, 0, 1));
    if (u <= 0.01) continue;
    ctx.save();
    ctx.globalAlpha *= u * 0.92;
    ctx.translate(n.x, n.y);
    ctx.rotate(n.rot);
    ctx.font = '800 19.5px "CarbonMono", "CarbonSans", sans-serif';
    const w = Math.min(292, ctx.measureText(n.t).width + 28);

    ctx.fillStyle = 'rgba(18, 24, 34, 0.20)';
    ctx.beginPath();
    ctx.roundRect(-w * 0.5 + 2, -20 + 2.5, w, 40, 9);
    ctx.fill();

    ctx.fillStyle = isLightBg ? 'rgba(255, 249, 224, 0.96)' : 'rgba(20, 16, 13, 0.90)';
    ctx.strokeStyle = isLightBg ? 'rgba(168, 118, 42, 0.68)' : 'rgba(232, 184, 118, 0.62)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-w * 0.5, -20, w, 40, 9);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isLightBg ? '#2a2015' : '#f2e6d2';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(n.t, 0, 0.5);
    ctx.restore();
  }
  ctx.restore();
}

export function drawSmileArc(ctx, cx, bottomY, width, progress, accent) {
  const u = smooth(clamp((progress - 0.22) * 2.2, 0, 1));
  if (u <= 0.02) return;
  const halfW = clamp(width * 0.24, 42, 92) * u;
  const ay = clamp(bottomY + 12, 90, 636);

  ctx.save();
  ctx.globalAlpha *= u * 0.9;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3.0;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - halfW, ay - 6);
  ctx.quadraticCurveTo(cx, ay + 12, cx + halfW, ay - 6);
  ctx.stroke();
  ctx.restore();
}

export function drawSpeedLines(ctx, cx, cy, width, progress, accent) {
  const u = smooth(clamp(progress * 2.4, 0, 1));
  if (u <= 0.02) return;
  const leftX = Math.max(190, cx - width * 0.5 - 46);
  ctx.save();
  ctx.globalAlpha *= u * 0.82;
  ctx.strokeStyle = accent;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i += 1) {
    const ly = clamp(cy - 14 + i * 14, 62, 638);
    const len = (28 - i * 5) * u;
    ctx.lineWidth = 2.6 - i * 0.4;
    ctx.beginPath();
    ctx.moveTo(leftX + i * 6, ly);
    ctx.lineTo(leftX + i * 6 + len, ly);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawHammerSparks(ctx, cx, cy, width, anvil, progress, accent) {
  const burst = Math.max(anvil * 0.95, smooth(clamp((progress - 0.55) * 2.6, 0, 1)) * 0.65);
  if (burst <= 0.04) return;
  const sx = clamp(cx + width * 0.5 + 18, 210, 764);
  const sy = clamp(cy - 6, 68, 634);

  ctx.save();
  ctx.globalAlpha *= burst;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  const angles = [-0.85, -0.32, 0.22, 0.75];
  for (let i = 0; i < angles.length; i += 1) {
    const a = angles[i];
    const r0 = 7 + (1 - burst) * 4;
    const r1 = r0 + 11 + (i % 2) * 4;
    ctx.beginPath();
    ctx.moveTo(sx + Math.cos(a) * r0, sy + Math.sin(a) * r0);
    ctx.lineTo(sx + Math.cos(a) * r1, sy + Math.sin(a) * r1);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawInteractivePillButton(ctx, cx, cy, line, progress, anvil, accent = '#d97543') {
  // Sync click impulse to `progress = 0.74` (`t ≈ 160.7s`, exact vocal onset of "还在跑"!)
  const clickU = clamp((progress - 0.72) / 0.16, 0, 1);
  const secondHalfLit = smooth(clamp((progress - 0.68) / 0.12, 0, 1));
  const pressScale =
    clickU > 0 && clickU < 1 ? 1 - Math.sin(clickU * Math.PI) * 0.058 : 1 + anvil * 0.025;

  // SafeCy = 636 -> button [600..672], pointer tail <= 686 (100% <= 692 safe limit!)
  const safeCy = clamp(cy, 622, 638);
  ctx.save();
  ctx.translate(cx, safeCy);
  ctx.scale(pressScale, pressScale);

  const bw = 524;
  const bh = 80;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.50)';
  ctx.beginPath();
  ctx.roundRect(-bw * 0.5 + 2.5, -bh * 0.5 + 4.5, bw, bh, 40);
  ctx.fill();

  const bg = ctx.createLinearGradient(0, -bh * 0.5, 0, bh * 0.5);
  bg.addColorStop(0, secondHalfLit > 0.5 ? '#eb8f58' : '#df7f4e');
  bg.addColorStop(1, accent);
  ctx.fillStyle = bg;
  ctx.strokeStyle = secondHalfLit > 0.3 ? 'rgba(255, 246, 216, 0.92)' : 'rgba(255, 242, 224, 0.74)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.roundRect(-bw * 0.5, -bh * 0.5, bw, bh, 40);
  ctx.fill();
  ctx.stroke();

  // Crisp 4K Pelican bicycle icon badge on left side of button
  ctx.save();
  ctx.translate(-bw * 0.5 + 58, 0);
  ctx.strokeStyle = '#fff9f0';
  ctx.lineWidth = 3.1;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.arc(-14, 7, 9.2, 0, Math.PI * 2);
  ctx.arc(14, 7, 9.2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-14, 7);
  ctx.lineTo(0, -7);
  ctx.lineTo(14, 7);
  ctx.moveTo(0, -7);
  ctx.lineTo(16, -12);
  ctx.stroke();
  ctx.restore();

  // Two-part vocal-synced button title: `那只鸟` -> `还在跑`
  const parts = (line?.text || '那只鸟 还在跑').trim().split(/\s+/);
  const p0 = parts[0] || '那只鸟';
  const p1 = parts[1] || '还在跑';

  ctx.font = '900 48px "CarbonSans", "PelicanSans", sans-serif';
  ctx.textBaseline = 'middle';
  const w0 = ctx.measureText(p0).width;
  const gap = 18;
  const w1 = ctx.measureText(p1).width;
  const totalTextW = w0 + gap + w1;
  const textStartX = 22 - totalTextW * 0.5;

  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(28, 12, 6, 0.42)';
  ctx.fillText(p0, textStartX + 1, 2.5);
  ctx.fillText(p1, textStartX + w0 + gap + 1, 2.5);

  ctx.fillStyle = '#fffaf2';
  ctx.fillText(p0, textStartX, 1);

  ctx.fillStyle = secondHalfLit > 0.05 ? '#fff0a8' : 'rgba(255, 250, 242, 0.76)';
  ctx.fillText(p1, textStartX + w0 + gap, 1);

  // Pointer arrow gliding in & clicking cleanly inside y <= 686 (zero bottom clip!)
  const ptrEnter = smooth(clamp((progress - 0.36) / 0.34, 0, 1));
  if (ptrEnter > 0.02) {
    const px = 192 - ptrEnter * 64;
    const py = 18 - ptrEnter * 12;
    ctx.save();
    ctx.translate(px, py);
    if (clickU > 0.1 && clickU < 0.96) {
      ctx.strokeStyle = 'rgba(255, 248, 222, 0.88)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, 0, 8 + clickU * 24, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#fffdf8';
    ctx.strokeStyle = '#1d1612';
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 24);
    ctx.lineTo(7.5, 17.5);
    ctx.lineTo(12, 27);
    ctx.lineTo(16.5, 24.5);
    ctx.lineTo(11.5, 15);
    ctx.lineTo(20.5, 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}
