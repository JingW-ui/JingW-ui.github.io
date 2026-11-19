// src/kit/titleCard.js
// Renders era-authentic, 1080p-legible Title Cards (中文名 + English + 年代)
// onto a panel's 1000x1000 2D canvas layer.

/**
 * Draws the era title card inside the top-left safe zone of a 1000x1000 panel.
 * At 0.95x camera scale in 1920x1080, 1 panel unit ≈ 0.95 px, so:
 * - Chinese title: 34px bold/serif (≈32.3px at 1080p)
 * - Era badge: 20px (≈19px at 1080p)
 * - English subtitle: 18px (≈17px at 1080p)
 */
export function drawEraTitleCard(ctx, scene, localT, opts = {}) {
  const {
    x = 46,
    y = 42,
    variant = scene.isInk ? 'ink' : scene.num >= 15 ? 'digital' : 'museum',
  } = opts;

  // Keep title card 100% opaque at all times so neighboring framed panels on the scroll
  // and strong-beat frame-crossing shots always have crisp 1080p legibility!
  const alpha = 1.0;

  ctx.save();
  ctx.globalAlpha = alpha;

  const fontZh =
    variant === 'ink'
      ? '600 34px "PelicanWenKai", "PelicanSerif", serif'
      : variant === 'digital'
      ? '700 31px "PelicanMono", "PelicanSans", monospace'
      : '700 33px "PelicanSerif", serif';
  const fontEn =
    variant === 'digital'
      ? '500 17px "PelicanMono", monospace'
      : '500 18px "PelicanSerif", "PelicanSans", sans-serif';
  const fontEra =
    variant === 'digital'
      ? '700 18px "PelicanMono", monospace'
      : '600 19px "PelicanSerif", serif';

  ctx.font = fontZh;
  const zhW = ctx.measureText(scene.zh).width;
  ctx.font = fontEra;
  const eraText = `${String(scene.num).padStart(2, '0')} · ${scene.era}`;
  const eraW = ctx.measureText(eraText).width;
  ctx.font = fontEn;
  const enW = ctx.measureText(scene.en).width;

  const cardW = Math.max(zhW + eraW + 46, enW + 40, 290);
  const cardH = 92;

  if (variant === 'ink') {
    // Traditional Xuan-paper / silk mounted title slip with vermilion seal accent
    ctx.fillStyle = scene.inkMode === 'rubbing' ? 'rgba(24, 23, 21, 0.88)' : 'rgba(247, 241, 227, 0.90)';
    ctx.strokeStyle = scene.inkMode === 'rubbing' ? '#d8d0c0' : '#3d352b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(x, y, cardW, cardH);
    ctx.fill();
    ctx.stroke();

    // Inner hairline border
    ctx.strokeStyle = scene.inkMode === 'rubbing' ? 'rgba(216,208,192,0.45)' : 'rgba(61,53,43,0.38)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 5, y + 5, cardW - 10, cardH - 10);

    // Vermilion seal square on left
    ctx.fillStyle = '#b33427';
    ctx.fillRect(x + 14, y + 16, 8, cardH - 32);

    const fg = scene.inkMode === 'rubbing' ? '#f3efe6' : '#1b1916';
    const subFg = scene.inkMode === 'rubbing' ? '#cfc7b6' : '#574e42';

    ctx.fillStyle = fg;
    ctx.font = fontZh;
    ctx.textBaseline = 'top';
    ctx.fillText(scene.zh, x + 32, y + 14);

    ctx.fillStyle = '#b33427';
    ctx.font = fontEra;
    ctx.fillText(eraText, x + cardW - eraW - 16, y + 21);

    ctx.fillStyle = subFg;
    ctx.font = fontEn;
    ctx.fillText(scene.en, x + 32, y + 56);
  } else if (variant === 'digital') {
    // Crisp dark translucent terminal / HUD placard with era accent bar
    ctx.fillStyle = 'rgba(12, 16, 22, 0.86)';
    ctx.strokeStyle = scene.frameAccent || '#39ff7a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, cardH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = scene.frameAccent || '#39ff7a';
    ctx.fillRect(x, y, 7, cardH);

    ctx.fillStyle = '#f5f7fa';
    ctx.font = fontZh;
    ctx.textBaseline = 'top';
    ctx.fillText(scene.zh, x + 20, y + 14);

    ctx.fillStyle = scene.frameAccent || '#39ff7a';
    ctx.font = fontEra;
    ctx.fillText(eraText, x + cardW - eraW - 16, y + 20);

    ctx.fillStyle = '#b8c4d0';
    ctx.font = fontEn;
    ctx.fillText(scene.en, x + 20, y + 56);
  } else {
    // Museum parchment / archival placard
    ctx.fillStyle = 'rgba(249, 244, 232, 0.92)';
    ctx.strokeStyle = scene.frameColor || '#4a3525';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, cardH, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = scene.frameColor || '#4a3525';
    ctx.fillRect(x, y, cardW, 6);

    ctx.fillStyle = '#1d1915';
    ctx.font = fontZh;
    ctx.textBaseline = 'top';
    ctx.fillText(scene.zh, x + 18, y + 16);

    ctx.fillStyle = scene.frameColor || '#6d3920';
    ctx.font = fontEra;
    ctx.fillText(eraText, x + cardW - eraW - 16, y + 22);

    ctx.fillStyle = '#54493d';
    ctx.font = fontEn;
    ctx.fillText(scene.en, x + 18, y + 58);
  }

  ctx.restore();
}
