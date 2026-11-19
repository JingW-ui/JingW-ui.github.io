// src/components/code_size_hud.js
// Understated Browser-Style Top-Right Download Chip (`0.00s .. 168.92s`, zero Chinese text) +
// Restrained Center-Screen Completed Download Card (`168.92s .. 174.64s`).
// Data-driven via `data/code_payload_story.json` on `<canvas id="code-loader-hud">`.

import { clamp, lerp, smootherstep } from '../fusion/github_core/beat/timeline.js';
import { VIEW_W, VIEW_H } from '../fusion/github_core/beat/camera.js';

function easeOutCubic(x) {
  const u = clamp(x, 0, 1);
  return 1 - Math.pow(1 - u, 3);
}

function drawCheckCircle(ctx, cx, cy, r, alpha = 1) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = 'rgba(129, 201, 149, 0.16)';
  ctx.strokeStyle = 'rgba(129, 201, 149, 0.88)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#81c995';
  ctx.lineWidth = Math.max(1.7, r * 0.19);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.36, cy + r * 0.02);
  ctx.lineTo(cx - r * 0.08, cy + r * 0.30);
  ctx.lineTo(cx + r * 0.40, cy - r * 0.28);
  ctx.stroke();
  ctx.restore();
}

/**
 * Minimal, zero-Chinese Chrome-toolbar Top-Right Download Chip (`142 x 30`):
 * - Left: circular clockwise progress ring (`r = 9.2`) around a static `↓` icon (`✓` at 100%)
 * - Right: pure numeric byte progress (`0.53 / 1.93 MB`)
 */
function drawBrowserDownloadChip(ctx, bx, by, bw, bh, pct, loadedMB, totalMB, doneCheckU) {
  ctx.save();
  const radius = bh * 0.5;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.roundRect(bx, by + 1.5, bw, bh, radius);
  ctx.fill();

  ctx.fillStyle = 'rgba(22, 24, 28, 0.72)';
  ctx.strokeStyle = doneCheckU > 0.05
    ? `rgba(129, 201, 149, ${(0.20 + 0.28 * doneCheckU).toFixed(3)})`
    : 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, radius);
  ctx.fill();
  ctx.stroke();

  const rCx = bx + 16.5;
  const rCy = by + bh * 0.5;
  const ringR = 9.2;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.arc(rCx, rCy, ringR, 0, Math.PI * 2);
  ctx.stroke();

  const clampedPct = clamp(pct, 0, 1);
  if (clampedPct > 0.003) {
    const startAng = -Math.PI * 0.5;
    const endAng = startAng + Math.PI * 2 * clampedPct;
    ctx.strokeStyle = doneCheckU > 0.05 ? '#81c995' : '#8ab4f8';
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(rCx, rCy, ringR, startAng, endAng, false);
    ctx.stroke();
  }

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  if (doneCheckU > 0.2) {
    ctx.strokeStyle = '#81c995';
    ctx.lineWidth = 1.75;
    ctx.beginPath();
    ctx.moveTo(rCx - 3.5, rCy + 0.2);
    ctx.lineTo(rCx - 0.9, rCy + 2.8);
    ctx.lineTo(rCx + 3.8, rCy - 2.6);
    ctx.stroke();
  } else {
    ctx.strokeStyle = 'rgba(232, 234, 237, 0.90)';
    ctx.lineWidth = 1.45;
    ctx.beginPath();
    ctx.moveTo(rCx, rCy - 3.8);
    ctx.lineTo(rCx, rCy + 2.0);
    ctx.moveTo(rCx - 2.6, rCy - 0.4);
    ctx.lineTo(rCx, rCy + 2.2);
    ctx.lineTo(rCx + 2.6, rCy - 0.4);
    ctx.moveTo(rCx - 3.2, rCy + 4.1);
    ctx.lineTo(rCx + 3.2, rCy + 4.1);
    ctx.stroke();
  }

  const numStr = `${loadedMB.toFixed(2)} / ${totalMB.toFixed(2)} MB`;
  ctx.fillStyle = doneCheckU > 0.05 ? 'rgba(129, 201, 149, 0.95)' : 'rgba(226, 230, 236, 0.88)';
  ctx.font = '600 11.5px "CarbonMono", "PelicanMono", ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(numStr, bx + 32, rCy + 0.5);

  ctx.restore();
}

export class CodeSizeHud {
  constructor(storyDoc, renderScale = 2) {
    this.doc = storyDoc || {};
    this.renderScale = renderScale;
    this.canvas = null;
    this.ctx = null;
  }

  async init(screenWrapEl) {
    if (!screenWrapEl) return;
    if (this.canvas) this.canvas.remove();

    const c = document.createElement('canvas');
    c.id = 'code-loader-hud';
    c.className = 'code-loader-hud';
    c.width = VIEW_W * this.renderScale;
    c.height = VIEW_H * this.renderScale;
    c.style.cssText = [
      'position:absolute',
      'inset:0',
      'width:100%',
      'height:100%',
      'pointer-events:none',
      'z-index:4',
      'display:block',
    ].join(';');

    screenWrapEl.appendChild(c);
    this.canvas = c;
    this.ctx = c.getContext('2d');
  }

  draw(realT) {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const scale = this.renderScale;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    ctx.scale(scale, scale);

    const revealStartT = this.doc.revealStartRealT ?? 168.92;
    const doneTickStartT = revealStartT - 0.32;
    const totalMB = this.doc.sizeMB ?? 1.93;

    const rawPct = clamp(realT / Math.max(1, doneTickStartT), 0, 1);
    const shapedPct = clamp(
      0.88 * rawPct + 0.12 * Math.pow(rawPct, 0.78) + 0.004 * Math.sin(realT * 1.7) * (1 - rawPct),
      0,
      1
    );
    const pct = realT >= doneTickStartT ? 1.0 : shapedPct;
    const loadedMB = totalMB * pct;
    const doneCheckU = clamp((realT - doneTickStartT) / 0.28, 0, 1);

    const chipW = 142;
    const chipH = 30;
    const chipX = VIEW_W - 14 - chipW; // 804
    const chipY = 12;
    const chipCx = chipX + chipW * 0.5;
    const chipCy = chipY + chipH * 0.5;

    const dtReveal = realT - revealStartT;
    if (dtReveal <= 0) {
      drawBrowserDownloadChip(ctx, chipX, chipY, chipW, chipH, pct, loadedMB, totalMB, doneCheckU);
      ctx.restore();
      return;
    }

    // =========================================================================
    // Restrained, Calm Browser-Completed Card in Center (`476 x 198`)
    // Leaves the dim press-conference hall & empty chair softly visible behind it!
    // =========================================================================
    const morphU = easeOutCubic(dtReveal / 0.68);

    const dimAlpha = smootherstep(0.0, 0.65, dtReveal) * 0.46;
    ctx.fillStyle = `rgba(6, 6, 8, ${dimAlpha.toFixed(3)})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    const targetW = 488;
    const targetH = 228;
    const cardCx = lerp(chipCx, VIEW_W * 0.5, morphU);
    const cardCy = lerp(chipCy, VIEW_H * 0.49, morphU);
    const cardW = lerp(chipW, targetW, morphU);
    const cardH = lerp(chipH, targetH, morphU);
    const cardR = lerp(15, 16, morphU);
    const x0 = cardCx - cardW * 0.5;
    const y0 = cardCy - cardH * 0.5;

    ctx.save();
    // Soft ambient card shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.46)';
    ctx.beginPath();
    ctx.roundRect(x0, y0 + 8, cardW, cardH, cardR);
    ctx.fill();

    // Same clean matte dark-glass surface as the top-right browser download chip
    ctx.fillStyle = 'rgba(20, 22, 26, 0.90)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.roundRect(x0, y0, cardW, cardH, cardR);
    ctx.fill();
    ctx.stroke();

    const contentAlpha = smootherstep(0.26, 0.66, dtReveal);
    if (contentAlpha > 0.01) {
      const fin = this.doc.finale || {};
      const fileName = fin.fileName || '鹈鹕骑行_纯代码全片_单文件版.html';
      const bytesLabel = fin.bytesLabel || '2,028,669 bytes';
      const caption = fin.caption || '全片纯代码，无任何音频/贴图，不到半张照片Size。';
      const credit = fin.credit || 'Hydrogen独立完成';

      ctx.save();
      ctx.globalAlpha = contentAlpha;

      // 1. Clean Browser Completed File Header (`y0 + 36`)
      ctx.font = '500 14.5px "CarbonSans", "PelicanSans", -apple-system, sans-serif';
      const fnW = ctx.measureText(fileName).width;
      const headerTotalW = 22 + 9 + fnW;
      const hx = cardCx - headerTotalW * 0.5;
      const hy = y0 + 36;

      drawCheckCircle(ctx, hx + 11, hy, 9.5, 1);

      ctx.fillStyle = 'rgba(196, 202, 212, 0.88)';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(fileName, hx + 29, hy + 0.5);

      // 2. Clean, Unadorned Primary File Size (`1.93 MB`, `y0 + 93`) + Exact Bytes (`y0 + 131`)
      ctx.fillStyle = '#f5f6f8';
      ctx.font = '700 56px "CarbonMono", "PelicanMono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${totalMB.toFixed(2)} MB`, cardCx, y0 + 93);

      const bytesAlpha = smootherstep(0.45, 0.85, dtReveal);
      ctx.save();
      ctx.globalAlpha = contentAlpha * bytesAlpha;
      ctx.fillStyle = 'rgba(148, 156, 168, 0.82)';
      ctx.font = '500 13.5px "CarbonMono", "PelicanMono", ui-monospace, monospace';
      ctx.fillText(bytesLabel, cardCx, y0 + 131);
      ctx.restore();

      // 3. Subtle Hairline Divider + Two-Line Footnote & Hydrogen Credit
      const footAlpha = smootherstep(0.62, 1.05, dtReveal);
      if (footAlpha > 0.01) {
        ctx.save();
        ctx.globalAlpha = contentAlpha * footAlpha;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x0 + 36, y0 + 150);
        ctx.lineTo(x0 + cardW - 36, y0 + 150);
        ctx.stroke();

        ctx.fillStyle = 'rgba(228, 230, 235, 0.90)';
        ctx.font = '500 15.5px "CarbonSans", "PelicanSans", -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(caption, cardCx, y0 + 174);

        if (credit) {
          ctx.fillStyle = 'rgba(172, 180, 192, 0.82)';
          ctx.font = '500 14px "CarbonSans", "PelicanSans", -apple-system, sans-serif';
          ctx.fillText(credit, cardCx, y0 + 201);
        }
        ctx.restore();
      }

      ctx.restore();
    }

    ctx.restore();
    ctx.restore();
  }
}
