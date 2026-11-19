// src/scenes/s17_chat.js
// #17 早期聊天窗口 (2000s · Win32 GDI Integer-Pixel IM, 256c Bayer Wallpaper & Ripped-Matte GIF89a) — r3 Authentic Edition
// - 100% original fictional 2003 OS & IM client "PeliChat 2003" (zero real brand logos, penguins, butterflies, or OS flags)
// - Full integer-pixel Win32 GDI rendering (`imageSmoothingEnabled = false`) + 256-color Bayer-dithered BMP landscape wallpaper
// - Crisp 32x32 hand-pixeled desktop icons + 48x48 hand-shaded dithered pixel-art portraits (Birdwatcher & Night-Surfing Pelican)
// - Zero modern roundRect chat bubbles: authentic 2003 RichEdit indented message stream with 1px dotted dividers & OLE GIF box
// - Native title-bar era integration (`[17 · 2000s | 早期聊天窗口] PeliChat 2003 — 水鸟观察员`) — zero floating ERA_INFO HUD card!
// - True GIF89a Pelican + Bike: 216 Web-Safe colors + Bayer 4x4 ordered dithering + jagged #FFFFFF/#000033 ripped GeoCities matte fringe
//   + early 56K dial-up interlaced GIF scan-in + Win2000 sunken horizontal scrollbar/progress-bar road locked at y = 680!
// - Bar-2 strong-beat "闪屏振动" (localT 2.0s & 3.0s): authentic Win32 GDI `BitBlt` cascading unrepainted window-frame trails
//   + taskbar #DF7401 alert orange flash + subtle CRT H-sync scan jitter (zero cartoon lightning bolts!)
// - Anti-moiré CRT RGB shadow-mask phosphor overlay strictly capped at 6.8% opacity for razor-sharp 1080p typography.

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  BEAT_SEC,
  clamp,
  lerp,
  smoothstep,
  quantizeTime,
} from '../beat/timeline.js';
import { computePelicanRig } from '../rig/pelican.js';

// Classic 4x4 Bayer ordered dithering matrix (0..15)
const BAYER_4X4 = new Uint8Array([
   0,  8,  2, 10,
  12,  4, 14,  6,
   3, 11,  1,  9,
  15,  7, 13,  5,
]);

// Reusable offscreen buffers for integer GIF89a dithering & ripped matte fringe
let _gifBuffer = null;
let _gifOutBuffer = null;
let _cachedGifKey = '';

function ensureGifBuffers() {
  if (_gifBuffer) return;
  const GW = 140;
  const GH = 136;
  _gifBuffer = document.createElement('canvas');
  _gifBuffer.width = GW;
  _gifBuffer.height = GH;
  _gifOutBuffer = document.createElement('canvas');
  _gifOutBuffer.width = GW;
  _gifOutBuffer.height = GH;
}

function snapWebSafe(v, bayerNorm, spread = 46) {
  return Math.max(0, Math.min(5, Math.round((v + bayerNorm * spread) / 51))) * 51;
}

/**
 * Draws an integer-snapped classic Win2000/2003 3D beveled rectangle (raised or sunken).
 */
function drawBevelBox(ctx, x, y, w, h, {
  fill = '#d4d0c8',
  sunken = false,
  outerLight = '#ffffff',
  innerLight = '#eae8e1',
  innerDark = '#808080',
  outerDark = '#404040',
} = {}) {
  x = Math.round(x);
  y = Math.round(y);
  w = Math.round(w);
  h = Math.round(h);

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
  }

  const tlOut = sunken ? innerDark : outerLight;
  const tlIn = sunken ? outerDark : innerLight;
  const brIn = sunken ? innerLight : innerDark;
  const brOut = sunken ? outerLight : outerDark;

  ctx.fillStyle = tlOut;
  ctx.fillRect(x, y, w - 1, 1);
  ctx.fillRect(x, y, 1, h - 1);

  ctx.fillStyle = brOut;
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillRect(x + w - 1, y, 1, h);

  ctx.fillStyle = tlIn;
  ctx.fillRect(x + 1, y + 1, w - 3, 1);
  ctx.fillRect(x + 1, y + 1, 1, h - 3);

  ctx.fillStyle = brIn;
  ctx.fillRect(x + 1, y + h - 2, w - 2, 1);
  ctx.fillRect(x + w - 2, y + 1, 1, h - 2);
}

/**
 * Draws an integer-grid horizontal or vertical 1px pixel-dotted rule (zero anti-aliased strokes).
 */
function drawDottedHLine(ctx, x0, x1, y, color = '#99b4d1', step = 3) {
  const iy = Math.round(y);
  const start = Math.round(x0);
  const end = Math.round(x1);
  ctx.fillStyle = color;
  for (let x = start; x < end; x += step) {
    ctx.fillRect(x, iy, 1, 1);
  }
}

function drawDottedRect(ctx, x, y, w, h, color = '#ffff99', step = 2) {
  x = Math.round(x);
  y = Math.round(y);
  w = Math.round(w);
  h = Math.round(h);
  ctx.fillStyle = color;
  for (let px = x; px < x + w; px += step) {
    ctx.fillRect(px, y, 1, 1);
    ctx.fillRect(px, y + h - 1, 1, 1);
  }
  for (let py = y; py < y + h; py += step) {
    ctx.fillRect(x, py, 1, 1);
    ctx.fillRect(x + w - 1, py, 1, 1);
  }
}

/**
 * Draws a crisp hand-crafted pixel matrix on an integer grid.
 */
function drawPixelArt(ctx, ox, oy, pxSize, rows, palette) {
  ox = Math.round(ox);
  oy = Math.round(oy);
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === '.' || !palette[ch]) continue;
      ctx.fillStyle = palette[ch];
      ctx.fillRect(ox + c * pxSize, oy + r * pxSize, pxSize, pxSize);
    }
  }
}

/**
 * Bakes two rich 48x48 hand-shaded, Bayer-dithered pixel-art avatar portraits (2 frames each)
 * via `kit.bake2D` so both right-column buddy frames look like authentic 2003 pixel portraits!
 */
function getAvatarSprites(kit) {
  // 4 columns x 1 row of 48x48 sprites: [friend0, friend1, self0, self1]
  return kit.bake2D('s17_avatars_48x48_r3', (_g, ctx) => {
    const W = 48 * 4;
    const H = 48;
    const img = ctx.createImageData(W, H);
    const data = img.data;

    const setPx = (panelIdx, x, y, r, g, b) => {
      if (x < 0 || x >= 48 || y < 0 || y >= 48) return;
      const bVal = BAYER_4X4[(y & 3) * 4 + (x & 3)] / 16 - 0.5;
      const rq = snapWebSafe(r, bVal, 34);
      const gq = snapWebSafe(g, bVal, 34);
      const bq = snapWebSafe(b, bVal, 34);
      const idx = (y * W + (panelIdx * 48 + x)) * 4;
      data[idx] = rq;
      data[idx + 1] = gq;
      data[idx + 2] = bq;
      data[idx + 3] = 255;
    };

    const fillRectPx = (pIdx, x0, y0, w, h, r, g, b) => {
      for (let yy = y0; yy < y0 + h; yy++) {
        for (let xx = x0; xx < x0 + w; xx++) setPx(pIdx, xx, yy, r, g, b);
      }
    };

    const fillCirclePx = (pIdx, cx, cy, rad, r, g, b) => {
      const r2 = rad * rad;
      for (let yy = Math.floor(cy - rad); yy <= Math.ceil(cy + rad); yy++) {
        for (let xx = Math.floor(cx - rad); xx <= Math.ceil(cx + rad); xx++) {
          if ((xx - cx) * (xx - cx) + (yy - cy) * (yy - cy) <= r2) {
            setPx(pIdx, xx, yy, r, g, b);
          }
        }
      }
    };

    // -------------------------------------------------------------------------
    // Panels 0 & 1: Friend "水鸟观察员" (Wetland sky, reed marsh, sun-hat, vest & binoculars!)
    // -------------------------------------------------------------------------
    for (let f = 0; f < 2; f++) {
      const bob = f === 1 ? -1 : 0;
      // Dithered wetland sky & marsh water background
      for (let y = 0; y < 48; y++) {
        for (let x = 0; x < 48; x++) {
          if (y < 30) {
            const t = y / 30;
            setPx(f, x, y, lerp(85, 175, t), lerp(168, 226, t), lerp(235, 252, t));
          } else {
            const t = (y - 30) / 18;
            const ripple = ((x + y * 2) % 7 === 0) ? 28 : 0;
            setPx(f, x, y, 42 + ripple, lerp(136, 92, t) + ripple, lerp(188, 138, t) + ripple);
          }
        }
      }
      // Pixel cumulus cloud
      fillCirclePx(f, 10, 9, 4.2, 245, 250, 255);
      fillCirclePx(f, 15, 8, 5.0, 250, 252, 255);
      fillCirclePx(f, 20, 10, 3.6, 235, 245, 255);

      // Cattails & marsh reeds on left/right
      for (const rx of [5, 9, 40, 44]) {
        fillRectPx(f, rx, 19, 1, 26, 42, 118, 48);
        fillRectPx(f, rx + 1, 22, 1, 23, 28, 86, 34);
        fillRectPx(f, rx - 1, 16, 3, 6, 112, 62, 24);
        setPx(f, rx, 14, 72, 42, 18);
      }

      // Utility field vest & collar
      for (let y = 32 + bob; y < 48; y++) {
        const halfW = 13 + Math.floor((y - (32 + bob)) * 0.45);
        for (let x = 24 - halfW; x <= 24 + halfW; x++) {
          const isEdge = Math.abs(x - 24) >= halfW - 1;
          const isZip = Math.abs(x - 24) <= 1;
          if (isEdge) setPx(f, x, y, 22, 44, 28);
          else if (isZip) setPx(f, x, y, 228, 212, 168);
          else if (x < 24) setPx(f, x, y, 56, 118, 72);
          else setPx(f, x, y, 38, 92, 54);
        }
      }
      // Pocket flaps
      fillRectPx(f, 15, 39 + bob, 6, 5, 74, 142, 86);
      fillRectPx(f, 28, 39 + bob, 6, 5, 48, 108, 64);

      // Khaki safari sun-hat (brim + crown + olive ribbon)
      for (let y = 13 + bob; y <= 16 + bob; y++) {
        for (let x = 8; x <= 40; x++) {
          const edge = y === 13 + bob || x === 8 || x === 40;
          setPx(f, x, y, edge ? 96 : 228, edge ? 72 : 192, edge ? 32 : 114);
        }
      }
      for (let y = 6 + bob; y <= 13 + bob; y++) {
        const hw = 10 + Math.floor((y - (6 + bob)) * 0.35);
        for (let x = 24 - hw; x <= 24 + hw; x++) {
          const isBand = y >= 11 + bob;
          const shade = x > 26 ? -28 : 14;
          if (isBand) setPx(f, x, y, 48 + shade, 96 + shade, 54 + shade);
          else setPx(f, x, y, 234 + shade, 200 + shade, 124 + shade);
        }
      }

      // Face & warm pixel skin shading
      for (let y = 16 + bob; y <= 31 + bob; y++) {
        for (let x = 15; x <= 33; x++) {
          const edge = x === 15 || x === 33 || y === 31 + bob;
          const shade = x > 25 ? -22 : 10;
          if (edge) setPx(f, x, y, 118, 74, 48);
          else setPx(f, x, y, 252 + shade, 212 + shade, 174 + shade);
        }
      }
      // Cheerful smile
      fillRectPx(f, 21, 28 + bob, 6, 1, 138, 56, 44);
      setPx(f, 20, 27 + bob, 138, 56, 44);
      setPx(f, 27, 27 + bob, 138, 56, 44);

      // Dual-lens Binoculars held to eyes with cyan optical lens glints!
      for (const lx of [18, 29]) {
        fillCirclePx(f, lx, 21 + bob, 5.4, 24, 30, 38);
        fillCirclePx(f, lx, 21 + bob, 4.0, 24, 118, 176);
        fillCirclePx(f, lx - 0.6, 20.5 + bob, 2.6, 78, 232, 255);
        // Specular glint shifts on frame 1!
        setPx(f, lx - 2 + f, 19 + bob, 255, 255, 255);
        setPx(f, lx - 1 + f, 19 + bob, 255, 255, 255);
        setPx(f, lx - 2 + f, 20 + bob, 255, 255, 255);
      }
      // Binocular center bridge
      fillRectPx(f, 22, 19 + bob, 4, 3, 45, 52, 64);
    }

    // -------------------------------------------------------------------------
    // Panels 2 & 3: Self "夜航鹈鹕(我)" (Midnight dorm room + CRT blue glow + pixel pelican!)
    // -------------------------------------------------------------------------
    for (let f = 0; f < 2; f++) {
      const pIdx = 2 + f;
      const crtGlow = f === 1 ? 18 : 0;
      // Dark indigo dorm background + blue CRT monitor glow from right edge
      for (let y = 0; y < 48; y++) {
        for (let x = 0; x < 48; x++) {
          const rightLight = Math.max(0, (x - 16) / 32);
          setPx(
            pIdx,
            x,
            y,
            18 + rightLight * 24,
            26 + rightLight * (68 + crtGlow),
            56 + rightLight * (128 + crtGlow)
          );
        }
      }
      // Starry dorm window in top-left
      fillRectPx(pIdx, 3, 4, 13, 15, 10, 16, 36);
      fillRectPx(pIdx, 4, 5, 5, 6, 20, 38, 78);
      fillRectPx(pIdx, 10, 5, 5, 6, 20, 38, 78);
      fillRectPx(pIdx, 4, 12, 5, 6, 20, 38, 78);
      fillRectPx(pIdx, 10, 12, 5, 6, 20, 38, 78);
      setPx(pIdx, 6, 7, 255, 255, 180);
      setPx(pIdx, 12, 9, 140, 235, 255);

      // Edge of glowing CRT monitor on far right
      fillRectPx(pIdx, 42, 12, 6, 26, 196, 192, 180);
      fillRectPx(pIdx, 43, 14, 4, 22, 68, 196 + crtGlow, 255);

      // Pelican neck & white/cyan-lit plumage torso
      for (let y = 22; y < 46; y++) {
        const cx = 19;
        const hw = y > 34 ? 10 : 6;
        for (let x = cx - hw; x <= cx + hw; x++) {
          const isEdge = x === cx - hw || x === cx + hw;
          const isLit = x >= cx + hw - 3;
          if (isEdge) setPx(pIdx, x, y, 16, 28, 58);
          else if (isLit) setPx(pIdx, x, y, 165, 236, 255);
          else if (x > cx) setPx(pIdx, x, y, 242, 248, 255);
          else setPx(pIdx, x, y, 188, 206, 232);
        }
      }

      // Pelican round head
      fillCirclePx(pIdx, 19, 18, 8.2, 18, 28, 58);
      fillCirclePx(pIdx, 19, 18, 6.8, 238, 246, 255);
      fillCirclePx(pIdx, 21, 18, 4.5, 178, 236, 255);

      // Backwards red & gold 2003 street cap!
      for (let y = 9; y <= 15; y++) {
        for (let x = 12; x <= 25; x++) {
          if ((x - 19) * (x - 19) + (y - 15) * (y - 15) <= 52) {
            setPx(pIdx, x, y, y < 12 ? 235 : 196, y < 12 ? 58 : 32, 42);
          }
        }
      }
      fillRectPx(pIdx, 6, 13, 8, 3, 255, 204, 32);
      fillRectPx(pIdx, 6, 15, 8, 1, 148, 92, 12);

      // Iconic long hooked orange beak + deep orange-red gular throat pouch!
      const beakBob = f === 1 ? 1 : 0;
      for (let x = 23; x <= 40; x++) {
        const u = (x - 23) / 17;
        const pouchBot = Math.round(21 + Math.sin(u * Math.PI) * (9 + beakBob));
        for (let y = 18; y <= pouchBot; y++) {
          if (y <= 20) {
            setPx(pIdx, x, y, 255, 196, 48); // upper mandible
          } else if (y === pouchBot) {
            setPx(pIdx, x, y, 112, 34, 18); // dark outline
          } else {
            setPx(pIdx, x, y, 242, 112 - (y - 20) * 6, 32); // gular pouch
          }
        }
      }

      // Cool retro green CRT-reflecting cyber glasses
      fillRectPx(pIdx, 19, 15, 9, 5, 16, 22, 32);
      fillRectPx(pIdx, 20, 16, 7, 3, 56, 248, 132);
      setPx(pIdx, 21 + f, 16, 255, 255, 255);

      // Mechanical beige keyboard at bottom with wing typing!
      fillRectPx(pIdx, 12, 43, 30, 5, 212, 208, 196);
      for (let kx = 14; kx < 40; kx += 3) {
        setPx(pIdx, kx, 44 + ((kx + f) & 1), 96, 94, 88);
      }
    }

    ctx.putImageData(img, 0, 0);
  }, 48 * 4, 48);
}

/**
 * Bakes the static 256-Color Bayer-Dithered BMP Desktop Wallpaper, Crisp 32x32 Pixel Icons,
 * Lived-in 56K Modem Utility Box, Background Buddy-List Window, and Win2000 Taskbar Base.
 */
function getDesktopBackdrop(kit) {
  return kit.bake2D('s17_desktop_bg_r3', (_g, ctx, rng) => {
    ctx.imageSmoothingEnabled = false;

    // 1. True 256-Color Bayer-Dithered Landscape BMP Wallpaper (computed at 500x500 -> 2x nearest-neighbor!)
    const BW = 500;
    const BH = 500;
    const bmpCanvas = document.createElement('canvas');
    bmpCanvas.width = BW;
    bmpCanvas.height = BH;
    const bctx = bmpCanvas.getContext('2d');
    const img = bctx.createImageData(BW, BH);
    const dst = img.data;

    // Precompute cloud puffs for nostalgic millennium sky-hill wallpaper
    const clouds = [
      { cx: 92, cy: 52, rx: 46, ry: 15 },
      { cx: 122, cy: 46, rx: 34, ry: 18 },
      { cx: 268, cy: 38, rx: 58, ry: 16 },
      { cx: 302, cy: 32, rx: 38, ry: 19 },
      { cx: 435, cy: 58, rx: 44, ry: 14 },
    ];

    for (let y = 0; y < BH; y++) {
      const bRow = (y & 3) * 4;
      const wy = y / BH;
      for (let x = 0; x < BW; x++) {
        const wx = x / BW;
        const bayerVal = BAYER_4X4[bRow + (x & 3)] / 16 - 0.5;

        // Rolling distant blue ridge + sunlit emerald-teal foreground hill
        const ridgeY = 0.56 - 0.045 * Math.sin(wx * 5.2 + 0.4) - 0.02 * Math.cos(wx * 11.0);
        const hillY = 0.61 - 0.055 * Math.sin(wx * 3.8 - 0.5) + 0.018 * Math.sin(wx * 9.5 + 1.1);

        let r, g, b;
        if (wy < ridgeY) {
          // Cerulean -> horizon sky cyan
          const u = clamp(wy / ridgeY, 0, 1);
          r = lerp(24, 128, Math.pow(u, 1.15));
          g = lerp(84, 186, Math.pow(u, 1.05));
          b = lerp(168, 232, u);

          // Fluffy pixel-dithered cumulus clouds
          let cAmt = 0;
          for (let k = 0; k < clouds.length; k++) {
            const cl = clouds[k];
            const dx = (x - cl.cx) / cl.rx;
            const dy = (y - cl.cy) / cl.ry;
            const d2 = dx * dx + dy * dy;
            if (d2 < 1.0) {
              const shade = dy > 0.25 ? 0.72 : 1.0;
              cAmt = Math.max(cAmt, (1 - d2) * shade);
            }
          }
          if (cAmt > 0.08) {
            const w = clamp(cAmt * 1.45, 0, 0.92);
            r = lerp(r, 246, w);
            g = lerp(g, 250, w);
            b = lerp(b, 255, w);
          }
        } else if (wy < hillY) {
          // Distant misty blue-teal mountain band
          const u = (wy - ridgeY) / Math.max(0.01, hillY - ridgeY);
          r = lerp(64, 48, u);
          g = lerp(142, 122, u);
          b = lerp(168, 146, u);
        } else {
          // Classic 2000s sunlit emerald-teal rolling meadow (with subtle pixel grass texture)
          const u = clamp((wy - hillY) / (1 - hillY), 0, 1);
          const sunPatch = Math.max(0, Math.sin(wx * 4.4 + 0.2) * (1 - u * 0.7));
          const blade = (((x * 7 + y * 13) & 7) === 0 ? 10 : 0) * (1 - u * 0.5);
          r = lerp(62, 26, u) + sunPatch * 34 + blade * 0.5;
          g = lerp(158, 86, u) + sunPatch * 38 + blade;
          b = lerp(88, 66, u) + sunPatch * 10;
        }

        // Quantize to authentic 216 Web-Safe / 256-color BMP palette with Bayer 4x4 dithering!
        const p = (y * BW + x) * 4;
        dst[p] = snapWebSafe(r, bayerVal, 48);
        dst[p + 1] = snapWebSafe(g, bayerVal, 48);
        dst[p + 2] = snapWebSafe(b, bayerVal, 48);
        dst[p + 3] = 255;
      }
    }
    bctx.putImageData(img, 0, 0);
    ctx.drawImage(bmpCanvas, 0, 0, PANEL_SIZE, PANEL_SIZE);

    // 2. Crisp 32x32 Hand-Shaded Desktop Shortcut Icons on Left Column (x = 14..78, y = 20..585)
    const iconPalette = {
      K: '#14181f',
      W: '#ffffff',
      L: '#e8e6de',
      G: '#b8b4a8',
      D: '#78756e',
      B: '#1f6fe0',
      N: '#0a246a',
      C: '#6beeff',
      Y: '#ffd22b',
      O: '#e8741e',
      R: '#dc3626',
      M: '#2ebd52',
    };

    const shortcuts = [
      {
        label: '我的电脑',
        y: 22,
        selected: false,
        art: [
          '..KKKKKKKKKKKK..',
          '.KLLLLLLLLLLLLK.',
          '.KLNNNNNNNNNNLK.',
          '.KLNBBCCCCBBNLK.',
          '.KLNBBBBBBBBNLK.',
          '.KLNBBBBBBBBNLK.',
          '.KLLLLLLLLLLLLK.',
          '..KKKKGGGGKKKK..',
          '.....KGGGGK.....',
          '.KKKKKKKKKKKKKK.',
          '.KLLLLGGGGGGMMK.',
          '.KDDDDDDDDDDDDK.',
          '.KKKKKKKKKKKKKK.',
        ],
      },
      {
        label: '网上邻居',
        y: 132,
        selected: false,
        art: [
          '.KKKKKKK........',
          'KLLLLLLLK.KKKKKK',
          'KLNBCCBNKKLLLLLK',
          'KLNBBBBNKKLNBBNK',
          'KLLLLLLLK.KLLLLK',
          '.KKGGGKK...KKGGK',
          '...KGK.......KGK',
          '.KKKMMKKKKKKKMMK',
          '....KKKKKKKKKK..',
        ],
      },
      {
        label: '56K拨号器',
        y: 242,
        selected: false,
        art: [
          '....KKKKKKKK....',
          '..KKYYYYYYYYKK..',
          '.KYYKKKKKKKKYYK.',
          '....KGGGGGGK....',
          '.KKKKKKKKKKKKKK.',
          '.KLLLLLLLLLLLLK.',
          '.KLGGGRRMMGGGLK.',
          '.KDDDDDDDDDDDDK.',
          '.KKKKKKKKKKKKKK.',
        ],
      },
      {
        label: '回收站(满)',
        y: 352,
        selected: false,
        art: [
          '...KWWK..KWWK...',
          '..KWWWWKKWWWWK..',
          '.KKKKKKKKKKKKKK.',
          '..KLLLLLLLLLLK..',
          '..KLGDWGGWDGLK..',
          '..KLGDGMMDGDK...',
          '..KLGDGMMDGDLK..',
          '..KLGDGLLDGDLK..',
          '..KGGGGGGGGGGK..',
          '...KKKKKKKKKK...',
        ],
      },
      {
        label: '逆天动图.gif',
        y: 468,
        selected: true,
        art: [
          '.KKKKKKKKKK.....',
          '.KWWWWWWWWKK....',
          '.KWBBWWYYWKWWK..',
          '.KWBBBBYYYWWWWK.',
          '.KWBWWWWOOOOOWK.',
          '.KWBBBBWOOOOOWK.',
          '.KWMMMMGGGGWWWK.',
          '.KWWWWWWWWWWWWK.',
          '.KKKKKKKKKKKKKK.',
        ],
      },
    ];

    for (const sc of shortcuts) {
      // 1px black pixel drop-shadow silhouette behind icon
      ctx.fillStyle = 'rgba(0, 12, 24, 0.45)';
      ctx.fillRect(24, sc.y + 4, 30, 26);
      drawPixelArt(ctx, 20, sc.y, 2, sc.art, iconPalette);

      ctx.font = '700 12px "PelicanSans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      if (sc.selected) {
        ctx.fillStyle = '#0a246a';
        ctx.fillRect(5, sc.y + 30, 74, 18);
        drawDottedRect(ctx, 5, sc.y + 30, 74, 18, '#ffff99', 2);
      } else {
        ctx.fillStyle = '#081828';
        ctx.fillText(sc.label, 43, sc.y + 33);
      }
      ctx.fillStyle = '#ffffff';
      ctx.fillText(sc.label, 42, sc.y + 32);
    }

    // 3. Lived-in Upper-Left Win2000 "56K 拨号连接状态" Mini Dialog (replaces modern ERA_INFO box!)
    const mx = 98;
    const my = 18;
    const mw = 356;
    const mh = 92;
    ctx.fillStyle = 'rgba(0, 14, 28, 0.38)';
    ctx.fillRect(mx + 4, my + 4, mw, mh);
    drawBevelBox(ctx, mx, my, mw, mh, { fill: '#d4d0c8' });

    const dialGrad = ctx.createLinearGradient(mx + 3, my + 3, mx + mw - 3, my + 3);
    dialGrad.addColorStop(0, '#4a658c');
    dialGrad.addColorStop(1, '#8ba8cc');
    ctx.fillStyle = dialGrad;
    ctx.fillRect(mx + 3, my + 3, mw - 6, 21);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 12px "PelicanSans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('已连接至 ChinaNet-163 (56K V.90)', mx + 10, my + 14);
    drawBevelBox(ctx, mx + mw - 21, my + 5, 16, 16, { fill: '#d4d0c8' });
    ctx.fillStyle = '#111111';
    ctx.font = '700 11px "PelicanMono", monospace';
    ctx.fillText('×', mx + mw - 17, my + 13);

    // Dual networked PC icon inside modem box
    drawPixelArt(ctx, mx + 12, my + 34, 2, shortcuts[1].art, iconPalette);
    ctx.fillStyle = '#111111';
    ctx.font = '500 12px "PelicanSans", sans-serif';
    ctx.fillText('状态：已连接    速率：48.0 Kbps', mx + 54, my + 40);
    ctx.fillText('持续时间：01:42:18   接收：2,841 字节', mx + 54, my + 58);
    drawBevelBox(ctx, mx + mw - 78, my + 64, 68, 21, { fill: '#d4d0c8' });
    ctx.textAlign = 'center';
    ctx.fillText('断开(D)', mx + mw - 44, my + 75);

    // 4. Secondary Background Window: "PeliChat 2003 好友列表" peeking out on top-right
    const bx = 720;
    const by = 16;
    const bw = 264;
    const bh = 296;
    ctx.fillStyle = 'rgba(0, 12, 28, 0.36)';
    ctx.fillRect(bx + 5, by + 5, bw, bh);
    drawBevelBox(ctx, bx, by, bw, bh, { fill: '#d4d0c8' });

    const inactGrad = ctx.createLinearGradient(bx + 3, by + 3, bx + bw - 3, by + 3);
    inactGrad.addColorStop(0, '#4a658c');
    inactGrad.addColorStop(1, '#8ba8cc');
    ctx.fillStyle = inactGrad;
    ctx.fillRect(bx + 3, by + 3, bw - 6, 24);

    ctx.fillStyle = '#f2f6ff';
    ctx.font = '700 12.5px "PelicanSans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('PeliChat 2003 好友列表', bx + 10, by + 15);
    drawBevelBox(ctx, bx + bw - 23, by + 6, 17, 17, { fill: '#d4d0c8' });
    ctx.fillStyle = '#222222';
    ctx.font = '700 11px "PelicanMono", monospace';
    ctx.fillText('×', bx + bw - 18, by + 15);

    drawBevelBox(ctx, bx + 6, by + 32, bw - 12, 42, { fill: '#e4ebf5', sunken: true });
    ctx.fillStyle = '#0a246a';
    ctx.font = '700 12.5px "PelicanSans", sans-serif';
    ctx.fillText('夜航鹈鹕 (ID: 104829)', bx + 14, by + 46);
    ctx.fillStyle = '#4a5a70';
    ctx.font = '500 11px "PelicanSans", sans-serif';
    ctx.fillText('签名: 期末死磕二十时代美术史…', bx + 14, by + 63);

    drawBevelBox(ctx, bx + 6, by + 80, bw - 12, 204, { fill: '#ffffff', sunken: true });
    const buddies = [
      { text: '[-] 观鸟骑行车友群 (3/9)', col: '#0a246a', bold: true, bg: null },
      { text: '  ● 水鸟观察员 [狂敲键盘]', col: '#ffffff', bold: true, bg: '#0a246a' },
      { text: '  ● 追风大白鹅 [冲浪中]', col: '#006633', bold: false, bg: null },
      { text: '  ● 摸鱼小河狸 [暂离]', col: '#805500', bold: false, bg: null },
      { text: '  ○ 拨号上网的鱼 [离线]', col: '#808080', bold: false, bg: null },
      { text: '[+] 大学宿舍局域网 (2/6)', col: '#0a246a', bold: true, bg: null },
    ];
    buddies.forEach((b, idx) => {
      const ry = by + 90 + idx * 24;
      if (b.bg) {
        ctx.fillStyle = b.bg;
        ctx.fillRect(bx + 10, ry - 4, bw - 20, 20);
      }
      ctx.fillStyle = b.col;
      ctx.font = `${b.bold ? 700 : 500} 12px "PelicanSans", sans-serif`;
      ctx.fillText(b.text, bx + 14, ry + 6);
    });

    // 5. Bottom Classic Win2000 Desktop Taskbar Base (y = 954..1000)
    drawBevelBox(ctx, 0, 954, PANEL_SIZE, 46, { fill: '#d4d0c8' });
    drawBevelBox(ctx, 6, 960, 118, 34, { fill: '#d4d0c8' });
    // Original geometric PeliOS pixel diamond emblem (zero Windows flag!)
    drawPixelArt(ctx, 14, 968, 2, [
      '...KKK...',
      '..KYYYK..',
      '.KYOOOYK.',
      'KBBBBBBBK',
      '.KCCCCCK.',
      '..KBBBK..',
      '...KKK...',
    ], iconPalette);
    ctx.fillStyle = '#111111';
    ctx.font = '700 14.5px "PelicanSans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('开始菜单', 40, 977);

    // Raised Gripper Bar
    ctx.fillStyle = '#808080';
    ctx.fillRect(132, 962, 1, 30);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(133, 962, 1, 30);

    drawBevelBox(ctx, 142, 960, 162, 34, { fill: '#d4d0c8' });
    ctx.fillStyle = '#222222';
    ctx.font = '500 12.5px "PelicanSans", sans-serif';
    ctx.fillText('▣ 美术史期末汇报.ppt', 152, 977);

    // System Tray Sunken Box
    drawBevelBox(ctx, 814, 960, 180, 34, { fill: '#cecac2', sunken: true });
    ctx.fillStyle = '#0a246a';
    ctx.fillRect(896, 967, 20, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 12px "PelicanSans", sans-serif';
    ctx.fillText('拼', 900, 977);
    ctx.fillStyle = '#111111';
    ctx.font = '700 14px "PelicanMono", monospace';
    ctx.fillText('22:14', 928, 978);

    // Unused rng touch for determinism consistency
    if (rng() < -1) ctx.fillRect(0, 0, 0, 0);
  });
}

/**
 * Bakes the Anti-Moiré CRT Shadow-Mask RGB Phosphor Triad Overlay once via `kit.bake2D`.
 * Strictly uses 6.8% phosphor triad opacity (`6%~8%`)
 * so 1080p small Win32 typography remains razor-sharp with zero moiré interference!
 */
function getCrtShadowMaskOverlay(kit) {
  return kit.bake2D('s17_crt_mask_r3', (_g, ctx) => {
    const img = ctx.createImageData(PANEL_SIZE, PANEL_SIZE);
    const dst = img.data;

    for (let y = 0; y < PANEL_SIZE; y++) {
      const ny = (y - 500) / 500;
      const isScanDark = (y & 1) === 1;
      // Shadow-mask staggered brick offset every other row
      const triadShift = ((y >> 1) & 1) === 1 ? 1 : 0;

      for (let x = 0; x < PANEL_SIZE; x++) {
        const nx = (x - 500) / 500;
        const p = (y * PANEL_SIZE + x) * 4;

        // Subtle corner glass darkening (0% along y=680 road center, max ~9% at extreme corners)
        const r4 = nx * nx * nx * nx + ny * ny * ny * ny;
        const cornerDark = Math.max(0, (r4 - 0.55) * 0.14);

        const sub = (x + triadShift) % 3;
        if (isScanDark) {
          dst[p] = 6;
          dst[p + 1] = 12;
          dst[p + 2] = 20;
          dst[p + 3] = Math.round((0.068 + cornerDark) * 255);
        } else {
          // Delicate 6.5% RGB aperture phosphor tint
          dst[p] = sub === 0 ? 255 : 0;
          dst[p + 1] = sub === 1 ? 255 : 0;
          dst[p + 2] = sub === 2 ? 255 : 0;
          dst[p + 3] = Math.round(0.058 * 255);
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  });
}

/**
 * Draws the unshaken Win2000 Sunken Horizontal Scrollbar / Download Progress-Bar Road
 * strictly locked at y = 680 across [0..84] and [916..1000]!
 */
function drawOuterScrollbarRoad(ctx, localT) {
  const drawTrack = (x0, w, isLeft) => {
    const yTop = ROAD_EDGE_Y - 2; // Bearing top rail sits cleanly across y = 678..680
    const h = 22;
    drawBevelBox(ctx, x0, yTop, w, h, { fill: '#e6e3d8', sunken: true });

    // Classic 2px checkerboard dithered scrollbar trough
    ctx.fillStyle = '#ffffff';
    for (let py = yTop + 2; py < yTop + h - 2; py += 2) {
      for (let px = x0 + 2 + ((py >> 1) & 1) * 2; px < x0 + w - 2; px += 4) {
        ctx.fillRect(px, py, 2, 2);
      }
    }

    // Classic Win2000 chunked #0A246A progress-bar blocks marching rightward!
    const innerX0 = isLeft ? x0 + 18 : x0 + 3;
    const innerX1 = isLeft ? x0 + w - 2 : x0 + w - 19;
    const shift = Math.floor(localT * 28) % 9;
    ctx.fillStyle = '#0a246a';
    for (let bx = innerX0 - 9 + shift; bx < innerX1 - 5; bx += 9) {
      if (bx >= innerX0) {
        ctx.fillRect(bx, yTop + 4, 6, 14);
        ctx.fillStyle = '#3a6ea5';
        ctx.fillRect(bx, yTop + 4, 6, 3);
        ctx.fillStyle = '#0a246a';
      }
    }

    // Classic raised 16x18 scrollbar arrow button at outer edge
    const btnX = isLeft ? x0 + 2 : x0 + w - 18;
    drawBevelBox(ctx, btnX, yTop + 2, 16, 18, { fill: '#d4d0c8' });
    ctx.fillStyle = '#111111';
    if (isLeft) {
      ctx.fillRect(btnX + 6, yTop + 10, 2, 2);
      ctx.fillRect(btnX + 8, yTop + 8, 2, 6);
      ctx.fillRect(btnX + 10, yTop + 6, 1, 10);
    } else {
      ctx.fillRect(btnX + 9, yTop + 10, 2, 2);
      ctx.fillRect(btnX + 7, yTop + 8, 2, 6);
      ctx.fillRect(btnX + 6, yTop + 6, 1, 10);
    }

    // Crisp navy top bearing rail right on y = 680 for C1 wheel contact continuity
    ctx.fillStyle = '#0a246a';
    ctx.fillRect(x0, ROAD_EDGE_Y - 1, w, 2);
  };

  drawTrack(0, 86, true);
  drawTrack(914, 86, false);
}

/**
 * Draws a custom 48x48 pixel-art avatar inside a Win2000 3D sunken PeliShow frame.
 */
function drawCustomAvatarBox(ctx, spriteCanvas, x, y, w, h, mode, sceneT) {
  drawBevelBox(ctx, x, y, w, h, { fill: '#ece9d8' });

  // Mini header strip inside avatar box
  ctx.fillStyle = '#d6dff0';
  ctx.fillRect(x + 3, y + 3, w - 6, 18);
  ctx.fillStyle = '#1b355c';
  ctx.font = '700 11px "PelicanSans", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(mode === 'friend' ? 'PeliShow 形象' : '我的像素秀', x + 8, y + 12);

  // Sunken 2x integer-scaled 48x48 -> 96x96 pixel portrait frame
  const pSize = 96;
  const px = x + Math.floor((w - (pSize + 8)) / 2);
  const py = y + 25;
  drawBevelBox(ctx, px, py, pSize + 8, pSize + 8, { fill: '#ffffff', sunken: true });

  const frameIdx = (Math.floor(sceneT * 3) & 1) + (mode === 'friend' ? 0 : 2);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(spriteCanvas, frameIdx * 48, 0, 48, 48, px + 4, py + 4, pSize, pSize);
  ctx.restore();

  // Online badge & level label below portrait
  ctx.fillStyle = mode === 'friend' ? '#007a3d' : '#0a246a';
  ctx.font = '700 12px "PelicanSans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(mode === 'friend' ? '● 水鸟观察员' : '● 夜航鹈鹕(我)', x + Math.floor(w / 2), y + h - 30);

  drawBevelBox(ctx, x + 12, y + h - 20, w - 24, 15, { fill: '#e4e1d6', sunken: true });
  ctx.fillStyle = '#4a4a44';
  ctx.font = '600 10.5px "PelicanMono", monospace';
  ctx.fillText(mode === 'friend' ? 'LV.18 湿地抓拍王' : 'LV.16 熬夜赶稿人', x + Math.floor(w / 2), y + h - 12);
}

/**
 * Evaluates deterministic window shake displacement at arbitrary time `tau`
 * so we can compute exact historical positions for Win32 GDI `BitBlt` repaint trails!
 */
function evalBuzzOffset(tau, isOutroThumbnail) {
  let env = 0;
  if (isOutroThumbnail) {
    env = 0.78;
    tau = 2.08;
  } else if (tau >= 2.0 && tau < 2.92) {
    const u = (tau - 2.0) / 0.92;
    env = 1.0 - 0.42 * Math.pow(u, 1.3);
  } else if (tau >= 3.0 && tau < 3.92) {
    const u = (tau - 3.0) / 0.92;
    env = 1.0 - 0.46 * Math.pow(u, 1.3);
  }
  if (env <= 0.02) return { dx: 0, dy: 0, env: 0 };

  const rawX = Math.cos((tau - 2.0) * 94.2 + 0.25) * 19 + Math.sin((tau - 2.0) * 157.0 + 0.8) * 6;
  const rawY = Math.sin((tau - 2.0) * 113.1 + 0.65) * 14 + Math.cos((tau - 2.0) * 172.0 + 0.4) * 5;
  return {
    dx: Math.round(rawX * env),
    dy: Math.round(rawY * env),
    env,
  };
}

/**
 * Authentic Win32 GDI `BitBlt` Unrepainted Window Frame Trail Cascade!
 * Replaces cartoon comic bolts with classic Windows 2000/XP lagging-repaint ghost window frames
 * left stranded on the desktop when the window violently buzzes at 2.0s & 3.0s!
 */
function drawWin32BitBltTrails(ctx, WX, WY, WW, WH, localT, isOutroThumbnail) {
  const trailSteps = isOutroThumbnail
    ? [
        { dx: -26, dy: -18 },
        { dx: -17, dy: -11 },
        { dx: 22, dy: -15 },
        { dx: 11, dy: 14 },
      ]
    : [4, 3, 2, 1].map((k) => {
        const past = evalBuzzOffset(localT - k * 0.021, false);
        // Amplify trail spread slightly so all 4 cascading GDI frames step out visibly!
        return {
          dx: past.dx + (k % 2 === 0 ? -k * 5 : k * 5),
          dy: past.dy + (k > 2 ? -k * 4 : k * 4),
        };
      });

  ctx.save();
  for (let i = 0; i < trailSteps.length; i++) {
    const tr = trailSteps[i];
    const gx = WX + tr.dx;
    const gy = WY + tr.dy;

    // 100% opaque Win32 GDI unrepainted gray window frame + classic blue title bar!
    drawBevelBox(ctx, gx, gy, WW, WH, {
      fill: '#d4d0c8',
      outerLight: '#ffffff',
      innerLight: '#eae8e1',
      innerDark: '#808080',
      outerDark: '#202020',
    });

    const tbGrad = ctx.createLinearGradient(gx + 3, gy + 3, gx + WW - 3, gy + 3);
    tbGrad.addColorStop(0, i < 2 ? '#3a6ea5' : '#0a246a');
    tbGrad.addColorStop(1, i < 2 ? '#83aedb' : '#3a6ea5');
    ctx.fillStyle = tbGrad;
    ctx.fillRect(gx + 3, gy + 3, WW - 6, 32);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 14px "PelicanSans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('[17 · 2000s | 早期聊天窗口] PeliChat 2003', gx + 12, gy + 19);

    // Classic GDI stale inner white RichEdit client rect edge
    drawBevelBox(ctx, gx + 10, gy + 66, WW - 20, WH - 78, { fill: '#eef4fb', sunken: true });
  }
  ctx.restore();
}

/**
 * Draws the chunky PaintShop Pro / ImageReady Web-Safe shaded Pelican + Bicycle onto the
 * low-res GIF buffer BEFORE applying Bayer 4x4 ordered dithering & ripped-matte halo!
 */
function drawRawGifPelicanToBuffer(gctx, rig) {
  const s = rig.root.scale;
  const lw = (w) => Math.max(1.1, w * s);

  gctx.save();
  gctx.lineCap = 'butt';
  gctx.lineJoin = 'miter';

  const drawGifWheel = (w) => {
    // Chunky dark-navy pixel tire + stepped cyan beveled rim
    gctx.strokeStyle = '#000033';
    gctx.lineWidth = lw(6.2);
    gctx.beginPath();
    gctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
    gctx.stroke();

    gctx.strokeStyle = '#3399ff';
    gctx.lineWidth = lw(2.8);
    gctx.beginPath();
    gctx.arc(w.x, w.y, w.r - 2.6 * s, 0, Math.PI * 2);
    gctx.stroke();

    gctx.strokeStyle = '#99ccff';
    gctx.lineWidth = lw(1.6);
    for (let i = 0; i < 6; i++) {
      const a = w.angle + (i * Math.PI) / 3;
      gctx.beginPath();
      gctx.moveTo(w.x, w.y);
      gctx.lineTo(w.x + Math.cos(a) * (w.r - 3 * s), w.y + Math.sin(a) * (w.r - 3 * s));
      gctx.stroke();
    }

    gctx.fillStyle = '#ffcc00';
    gctx.fillRect(w.x - 4.5 * s, w.y - 4.5 * s, 9 * s, 9 * s);
  };

  const drawGifLeg = (hipPt, kneePt, footPt, pedalPt, isBack) => {
    gctx.strokeStyle = '#333366';
    gctx.lineWidth = lw(3.6);
    gctx.beginPath();
    gctx.moveTo(rig.bb.x, rig.bb.y);
    gctx.lineTo(pedalPt.x, pedalPt.y);
    gctx.stroke();

    gctx.strokeStyle = isBack ? '#cc6600' : '#ff9900';
    gctx.lineWidth = lw(6.0);
    gctx.beginPath();
    gctx.moveTo(hipPt.x, hipPt.y);
    gctx.lineTo(kneePt.x, kneePt.y);
    gctx.lineTo(footPt.x, footPt.y);
    gctx.stroke();

    gctx.fillStyle = isBack ? '#cc6600' : '#ff9933';
    gctx.strokeStyle = '#330000';
    gctx.lineWidth = lw(2.2);
    gctx.beginPath();
    gctx.moveTo(footPt.x - 4 * s, footPt.y);
    gctx.lineTo(footPt.x + 15 * s, footPt.y + 2 * s);
    gctx.lineTo(footPt.x + 9 * s, footPt.y + 8 * s);
    gctx.lineTo(footPt.x - 5 * s, footPt.y + 5 * s);
    gctx.closePath();
    gctx.fill();
    gctx.stroke();

    gctx.fillStyle = '#000033';
    gctx.fillRect(pedalPt.x - 8 * s, pedalPt.y, 16 * s, 4.5 * s);
  };

  drawGifLeg(rig.leftHip, rig.leftKnee, rig.leftFoot, rig.leftPedal, true);
  drawGifWheel(rig.rearWheel);
  drawGifWheel(rig.frontWheel);

  // Chainring
  gctx.strokeStyle = '#666699';
  gctx.lineWidth = lw(2.4);
  gctx.beginPath();
  gctx.arc(rig.bb.x, rig.bb.y, 12 * s, 0, Math.PI * 2);
  gctx.stroke();

  // PaintShop Pro beveled Web-Safe blue bike frame
  gctx.strokeStyle = '#000033';
  gctx.lineWidth = lw(8.2);
  gctx.beginPath();
  gctx.moveTo(rig.rearWheel.x, rig.rearWheel.y);
  gctx.lineTo(rig.seatCluster.x, rig.seatCluster.y);
  gctx.lineTo(rig.bb.x, rig.bb.y);
  gctx.closePath();
  gctx.moveTo(rig.seatCluster.x, rig.seatCluster.y);
  gctx.lineTo(rig.headTop.x, rig.headTop.y);
  gctx.lineTo(rig.headBot.x, rig.headBot.y);
  gctx.lineTo(rig.bb.x, rig.bb.y);
  gctx.moveTo(rig.headTop.x, rig.headTop.y);
  gctx.lineTo(rig.frontWheel.x, rig.frontWheel.y);
  gctx.stroke();

  const frameGrad = gctx.createLinearGradient(
    rig.rearWheel.x,
    rig.seatCluster.y,
    rig.frontWheel.x,
    rig.bb.y
  );
  frameGrad.addColorStop(0, '#0066ff');
  frameGrad.addColorStop(0.5, '#66ffff');
  frameGrad.addColorStop(1, '#0033cc');
  gctx.strokeStyle = frameGrad;
  gctx.lineWidth = lw(4.8);
  gctx.stroke();

  gctx.strokeStyle = '#333366';
  gctx.lineWidth = lw(4.0);
  gctx.beginPath();
  gctx.moveTo(rig.seatCluster.x, rig.seatCluster.y);
  gctx.lineTo(rig.saddle.x, rig.saddle.y);
  gctx.moveTo(rig.headTop.x, rig.headTop.y);
  gctx.lineTo(rig.stemTop.x, rig.stemTop.y);
  gctx.lineTo(rig.handleGrip.x, rig.handleGrip.y);
  gctx.stroke();

  gctx.fillStyle = '#cc0033';
  gctx.fillRect(rig.saddle.x - 13 * s, rig.saddle.y - 3 * s, 25 * s, 6 * s);

  // Chunky GIF clip-art Pelican body (intentionally steep gradient to emphasize Bayer 4x4 checkerboard!)
  const bodyGrad = gctx.createLinearGradient(
    rig.bodyCenter.x,
    rig.bodyCenter.y - 34 * s,
    rig.bodyCenter.x,
    rig.bodyCenter.y + 34 * s
  );
  bodyGrad.addColorStop(0, '#ffffff');
  bodyGrad.addColorStop(0.42, '#cce6ff');
  bodyGrad.addColorStop(0.78, '#6699ff');
  bodyGrad.addColorStop(1, '#3366cc');

  gctx.fillStyle = bodyGrad;
  gctx.strokeStyle = '#000033';
  gctx.lineWidth = lw(3.4);
  gctx.beginPath();
  gctx.moveTo(rig.tailTip.x, rig.tailTip.y);
  gctx.quadraticCurveTo(
    rig.bodyCenter.x - 36 * s,
    rig.bodyCenter.y - 29 * s,
    rig.chest.x + 8 * s,
    rig.chest.y - 6 * s
  );
  gctx.quadraticCurveTo(
    rig.bodyCenter.x + 35 * s,
    rig.bodyCenter.y + 26 * s,
    rig.hip.x - 14 * s,
    rig.hip.y + 15 * s
  );
  gctx.quadraticCurveTo(
    rig.bodyCenter.x - 46 * s,
    rig.bodyCenter.y + 15 * s,
    rig.tailTip.x,
    rig.tailTip.y
  );
  gctx.closePath();
  gctx.fill();
  gctx.stroke();

  // S-Neck
  gctx.lineCap = 'round';
  gctx.strokeStyle = '#000033';
  gctx.lineWidth = lw(24.0);
  gctx.beginPath();
  gctx.moveTo(rig.chest.x - 2 * s, rig.chest.y + 4 * s);
  gctx.bezierCurveTo(rig.neckC1.x, rig.neckC1.y, rig.neckC2.x, rig.neckC2.y, rig.head.x, rig.head.y);
  gctx.stroke();

  gctx.strokeStyle = '#ddeeff';
  gctx.lineWidth = lw(17.5);
  gctx.stroke();

  // Head
  gctx.fillStyle = '#ffffff';
  gctx.strokeStyle = '#000033';
  gctx.lineWidth = lw(3.2);
  gctx.beginPath();
  gctx.arc(rig.head.x, rig.head.y, rig.head.r * 1.05, 0, Math.PI * 2);
  gctx.fill();
  gctx.stroke();

  // 2000s backwards blue-and-gold cap
  gctx.fillStyle = '#0033cc';
  gctx.beginPath();
  gctx.arc(rig.head.x - 1 * s, rig.head.y - 4 * s, rig.head.r * 0.98, Math.PI * 0.95, Math.PI * 2.02);
  gctx.closePath();
  gctx.fill();
  gctx.stroke();

  gctx.fillStyle = '#ffcc00';
  gctx.beginPath();
  gctx.moveTo(rig.head.x - 12 * s, rig.head.y - 6 * s);
  gctx.lineTo(rig.head.x - 29 * s, rig.head.y - 2 * s);
  gctx.lineTo(rig.head.x - 11 * s, rig.head.y + 1 * s);
  gctx.closePath();
  gctx.fill();
  gctx.stroke();

  // Gular pouch with rich orange-red Bayer dither ramp
  const pouchGrad = gctx.createLinearGradient(
    rig.beakUpperBase.x,
    rig.beakUpperBase.y,
    rig.pouchBelly.x,
    rig.pouchBelly.y + 10 * s
  );
  pouchGrad.addColorStop(0, '#ffcc00');
  pouchGrad.addColorStop(0.5, '#ff6600');
  pouchGrad.addColorStop(1, '#cc0033');

  gctx.fillStyle = pouchGrad;
  gctx.beginPath();
  gctx.moveTo(rig.beakLowerBase.x, rig.beakLowerBase.y);
  gctx.quadraticCurveTo(rig.pouchBelly.x, rig.pouchBelly.y + 3 * s, rig.beakTip.x - 3 * s, rig.beakTip.y);
  gctx.lineTo(rig.beakUpperBase.x, rig.beakUpperBase.y + 5 * s);
  gctx.closePath();
  gctx.fill();
  gctx.stroke();

  gctx.fillStyle = '#ffcc33';
  gctx.beginPath();
  gctx.moveTo(rig.beakUpperBase.x, rig.beakUpperBase.y);
  gctx.lineTo(rig.beakTip.x, rig.beakTip.y - 3 * s);
  gctx.quadraticCurveTo(rig.beakTip.x + 5 * s, rig.beakTip.y + 4 * s, rig.beakTip.x - 2 * s, rig.beakTip.y + 5 * s);
  gctx.lineTo(rig.beakLowerBase.x, rig.beakLowerBase.y + 1 * s);
  gctx.closePath();
  gctx.fill();
  gctx.stroke();

  // Big pixel-art eye
  const ex = rig.head.x + 5 * s;
  const ey = rig.head.y - 2 * s;
  gctx.fillStyle = '#ffffff';
  gctx.beginPath();
  gctx.arc(ex, ey, 5.4 * s, 0, Math.PI * 2);
  gctx.fill();
  gctx.stroke();
  gctx.fillStyle = '#000033';
  gctx.fillRect(ex, ey - 2.2 * s, 4.4 * s, 4.4 * s);

  drawGifLeg(rig.rightHip, rig.rightKnee, rig.rightFoot, rig.rightPedal, false);

  // Wing with strong Web-Safe cyan/blue gradient for crisp Bayer crosshatch!
  const wingGrad = gctx.createLinearGradient(
    rig.wingShoulder.x,
    rig.wingShoulder.y - 10 * s,
    rig.wingTip.x,
    rig.wingElbow.y + 18 * s
  );
  wingGrad.addColorStop(0, '#ffffff');
  wingGrad.addColorStop(0.48, '#99ccff');
  wingGrad.addColorStop(1, '#0033cc');

  gctx.fillStyle = wingGrad;
  gctx.beginPath();
  gctx.moveTo(rig.wingShoulder.x, rig.wingShoulder.y);
  gctx.quadraticCurveTo(
    rig.wingElbow.x - 16 * s,
    rig.wingElbow.y + 19 * s,
    rig.wingTip.x + 4 * s,
    rig.wingTip.y + 2 * s
  );
  gctx.quadraticCurveTo(
    rig.wingElbow.x + 12 * s,
    rig.wingElbow.y - 8 * s,
    rig.wingShoulder.x + 12 * s,
    rig.wingShoulder.y + 2 * s
  );
  gctx.closePath();
  gctx.fill();
  gctx.stroke();

  gctx.restore();
}

/**
 * Renders the GIF89a Pelican + Bicycle onto a 140x136 integer buffer (PIXEL_SCALE = 3),
 * applies Bayer 4x4 Ordered Dithering + 216 Web-Safe Palette + Ripped GeoCities #FFFFFF/#000033 Matte Fringe
 * + Early 56K Modem Interlaced GIF Scan-in on entry!
 */
function drawDitheredGifPelican(ctx, {
  px,
  py,
  qPedalAngle,
  qWheelAngle,
  speedScale,
  sceneT,
  localT,
  isOutroThumbnail,
}) {
  ensureGifBuffers();
  const PIXEL_SCALE = 3;
  const GW = _gifBuffer.width;
  const GH = _gifBuffer.height;

  const anchorLocalX = 68;
  const anchorLocalY = 114;

  const cacheKey = `r3_${qPedalAngle.toFixed(3)}_${qWheelAngle.toFixed(3)}_${speedScale.toFixed(2)}`;
  if (_cachedGifKey !== cacheKey) {
    _cachedGifKey = cacheKey;
    const gctx = _gifBuffer.getContext('2d', { willReadFrequently: true });
    gctx.clearRect(0, 0, GW, GH);

    const lowResRig = computePelicanRig({
      x: anchorLocalX,
      y: anchorLocalY,
      pedalAngle: qPedalAngle,
      wheelAngle: qWheelAngle,
      scale: 1 / PIXEL_SCALE,
      slope: 0,
      speedScale,
      time: sceneT,
    });

    drawRawGifPelicanToBuffer(gctx, lowResRig);

    const srcImg = gctx.getImageData(0, 0, GW, GH);
    const src = srcImg.data;
    const outCtx = _gifOutBuffer.getContext('2d');
    const outImg = outCtx.createImageData(GW, GH);
    const dst = outImg.data;

    // Pass 1: 1-bit binary GIF89a transparency threshold
    const mask = new Uint8Array(GW * GH);
    for (let i = 0, p = 0; i < mask.length; i++, p += 4) {
      if (src[p + 3] >= 106) mask[i] = 1;
    }

    // Pass 2: Bayer 4x4 Web-Safe 216-color quantization + Ripped GeoCities #FFFFFF / #000033 Matte Halo!
    const spread = 58;
    for (let y = 0; y < GH; y++) {
      const rowOff = y * GW;
      const bRow = (y & 3) * 4;
      for (let x = 0; x < GW; x++) {
        const idx = rowOff + x;
        const p = idx * 4;
        const bayerVal = BAYER_4X4[bRow + (x & 3)] / 16 - 0.5;

        if (mask[idx] === 1) {
          const a = src[p + 3] / 255;
          const rRaw = src[p] * a + 255 * (1 - a);
          const gRaw = src[p + 1] * a + 255 * (1 - a);
          const bRaw = src[p + 2] * a + 255 * (1 - a);

          dst[p] = snapWebSafe(rRaw, bayerVal, spread);
          dst[p + 1] = snapWebSafe(gRaw, bayerVal, spread);
          dst[p + 2] = snapWebSafe(bRaw, bayerVal, spread);
          dst[p + 3] = 255;
        } else {
          let dist1 = false;
          let dist2 = false;
          for (let dy = -2; dy <= 2 && !dist1; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= GH) continue;
            const nRow = ny * GW;
            for (let dx = -2; dx <= 2; dx++) {
              const nx = x + dx;
              if (nx < 0 || nx >= GW) continue;
              if (mask[nRow + nx] === 1) {
                const cheb = Math.max(Math.abs(dx), Math.abs(dy));
                const manh = Math.abs(dx) + Math.abs(dy);
                if (cheb === 1) {
                  dist1 = true;
                  break;
                } else if (manh <= 2 || (cheb === 2 && bayerVal > 0.08)) {
                  dist2 = true;
                }
              }
            }
          }

          if (dist1 || (dist2 && ((x + y * 3) % 2 === 0 || bayerVal > -0.05))) {
            // Authentic "ripped from a dark #000033 GeoCities page" matte halo:
            // Inner 1px ring is bright jagged #FFFFFF matte, outer spurs mix #FFFFFF with stray #000033 dark-page crumbs!
            const hash = (x * 17 + y * 31) % 7;
            if (!dist1 && (hash === 0 || hash === 3)) {
              dst[p] = 0;
              dst[p + 1] = 0;
              dst[p + 2] = 51; // #000033 stray dark GeoCities matte pixel!
              dst[p + 3] = 255;
            } else {
              dst[p] = 255;
              dst[p + 1] = 255;
              dst[p + 2] = 255; // #FFFFFF jagged GIF89a white matte halo!
              dst[p + 3] = 255;
            }
          } else {
            dst[p + 3] = 0;
          }
        }
      }
    }
    outCtx.putImageData(outImg, 0, 0);
  }

  const drawX = Math.round(px - anchorLocalX * PIXEL_SCALE);
  const drawY = Math.round(py - anchorLocalY * PIXEL_SCALE);
  const fullW = GW * PIXEL_SCALE;
  const fullH = GH * PIXEL_SCALE;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // Early 2003 slow-modem Interlaced GIF89a top-to-bottom progressive scan-in inside RichEdit pane (zero seam pop!)
  const scanIn = isOutroThumbnail ? 1.0 : clamp(0.28 + Math.max(0, localT - 0.55) * 0.92, 0.28, 1.0);
  const interlaceAlpha = isOutroThumbnail
    ? 0
    : smoothstep(134, 172, px) * (1 - smoothstep(0.91, 0.995, scanIn));
  if (interlaceAlpha > 0.01 && px > 134 && px < 520) {
    const cleanRows = Math.floor(GH * scanIn);
    // Clean upper downloaded portion
    ctx.drawImage(
      _gifOutBuffer,
      0, 0, GW, cleanRows,
      drawX, drawY, fullW, cleanRows * PIXEL_SCALE
    );
    if (cleanRows < GH && interlaceAlpha < 0.995) {
      ctx.save();
      ctx.globalAlpha = 1 - interlaceAlpha;
      ctx.drawImage(
        _gifOutBuffer,
        0, cleanRows, GW, GH - cleanRows,
        drawX, drawY + cleanRows * PIXEL_SCALE, fullW, (GH - cleanRows) * PIXEL_SCALE
      );
      ctx.restore();
    }
    // Lower Adam7 blocky 4x-stretched interlaced pass + scanline bar!
    ctx.save();
    ctx.globalAlpha = interlaceAlpha;
    for (let ry = cleanRows; ry < GH; ry += 4) {
      const bandH = Math.min(4, GH - ry);
      ctx.drawImage(
        _gifOutBuffer,
        0, ry, GW, 1,
        drawX, drawY + ry * PIXEL_SCALE, fullW, bandH * PIXEL_SCALE
      );
    }
    // Bright blue/white browser GIF progressive scan cursor bar
    const barY = drawY + cleanRows * PIXEL_SCALE;
    ctx.fillStyle = '#0a246a';
    ctx.fillRect(drawX + 36, barY, fullW - 72, 3);
    ctx.fillStyle = '#66ffff';
    ctx.fillRect(drawX + 36, barY + 1, Math.round((fullW - 72) * scanIn), 1);
    ctx.restore();
  } else {
    ctx.drawImage(_gifOutBuffer, drawX, drawY, fullW, fullH);
  }

  // RichEdit Embedded-OLE GIF Selection Frame (y = 436..684, strictly below chat text!)
  if (px > 165 && px < 835) {
    const boxAlpha = smoothstep(165, 225, px) * smoothstep(835, 775, px) * 0.88;
    const frameX = Math.round(px - 154);
    const frameY = 436;
    const frameW = 308;
    const frameH = 248;

    ctx.globalAlpha = boxAlpha;
    drawDottedRect(ctx, frameX, frameY, frameW, frameH, '#3a6ea5', 3);

    // 8 classic 5x5 navy Win32 OLE resize handles on corners & midpoints
    ctx.fillStyle = '#0a246a';
    const hxList = [frameX - 2, frameX + Math.floor(frameW / 2) - 2, frameX + frameW - 3];
    const hyList = [frameY - 2, frameY + Math.floor(frameH / 2) - 2, frameY + frameH - 3];
    for (let ix = 0; ix < 3; ix++) {
      for (let iy = 0; iy < 3; iy++) {
        if (ix === 1 && iy === 1) continue;
        ctx.fillRect(hxList[ix], hyList[iy], 5, 5);
      }
    }

    // Classic pale-yellow Win32 tooltip tag inside top-right of OLE box
    const tagW = 152;
    const tagH = 19;
    const tagX = frameX + frameW - tagW - 5;
    const tagY = frameY + 5;
    ctx.fillStyle = '#ffffe1';
    ctx.fillRect(tagX, tagY, tagW, tagH);
    ctx.fillStyle = '#000000';
    ctx.fillRect(tagX, tagY, tagW, 1);
    ctx.fillRect(tagX, tagY + tagH - 1, tagW, 1);
    ctx.fillRect(tagX, tagY, 1, tagH);
    ctx.fillRect(tagX + tagW - 1, tagY, 1, tagH);
    ctx.font = '700 11px "PelicanMono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const pct = scanIn < 0.995 ? `${Math.round(scanIn * 100)}%` : '9fps';
    ctx.fillText(`GIF89a · 216c · ${pct}`, tagX + Math.floor(tagW / 2), tagY + 10);
  }

  ctx.restore();
}

export function render(kit, slot, scene, params) {
  const {
    t,
    localT,
    pelicanLocalX,
    pedalAngle,
    speedScale,
    isOutroThumbnail = false,
  } = params;

  const g = slot.g2d;
  const ctx = g.drawingContext;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // ---------------------------------------------------------------------------
  // 1. 9Hz Uneven Hand-Exported GIF Frame Cadence (smoothly converging for x < 90 & x > 910!)
  // ---------------------------------------------------------------------------
  const interiorBlend = smoothstep(132, 185, pelicanLocalX) * smoothstep(868, 815, pelicanLocalX);
  const rawFrameIdx = Math.floor(t * 9);
  // Hand-exported GIFs often had alternating 90ms / 130ms frame holds — replicate that organic stutter!
  const heldFrameIdx = (rawFrameIdx % 5 === 3) ? rawFrameIdx - 1 : rawFrameIdx;
  const qT = heldFrameIdx / 9;
  const gifPedalAngle = (qT / BEAT_SEC) * Math.PI;
  const qPedalAngle = isOutroThumbnail
    ? pedalAngle
    : lerp(pedalAngle, gifPedalAngle, interiorBlend);

  const steppedX = Math.round(pelicanLocalX / 16) * 16;
  const effectivePelicanX = isOutroThumbnail
    ? pelicanLocalX
    : lerp(pelicanLocalX, steppedX, interiorBlend);
  const qWheelAngle = effectivePelicanX / 46;

  // ---------------------------------------------------------------------------
  // 2. Bar-2 Strong-Beat Window Buzz ("闪屏振动") at localT = 2.0s & 3.0s
  // ---------------------------------------------------------------------------
  const buzz = evalBuzzOffset(localT, isOutroThumbnail);
  const shakeX = buzz.dx;
  const shakeY = buzz.dy;
  const buzzEnv = buzz.env;

  // ---------------------------------------------------------------------------
  // 3. Static Baked 256c Bayer Desktop Wallpaper, 32x32 Icons, Modem Box & Taskbar
  // ---------------------------------------------------------------------------
  const desktopBg = getDesktopBackdrop(kit);
  const avatarSprites = getAvatarSprites(kit);
  ctx.drawImage(desktopBg.canvas, 0, 0);

  // Active Taskbar Button flashing classic Win32 #DF7401 alert orange during buzz!
  const isTaskbarAlert = buzzEnv > 0.08 && Math.floor(localT * 11) % 2 === 0;
  drawBevelBox(ctx, 312, 960, 286, 34, {
    fill: isTaskbarAlert ? '#df7401' : '#c6c2b8',
    sunken: !isTaskbarAlert,
  });
  ctx.fillStyle = isTaskbarAlert ? '#ffffff' : '#111111';
  ctx.font = '700 13px "PelicanSans", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('▶ [PeliChat 2003] 水鸟观察员', 324, 977);

  // Blinking dual 56K modem monitors + pixel speaker in system tray
  const ledRx = Math.floor(t * 9) % 2 === 0;
  const ledTx = Math.floor(t * 7 + 1) % 3 !== 0;
  ctx.fillStyle = '#18202c';
  ctx.fillRect(824, 967, 16, 14);
  ctx.fillRect(844, 967, 16, 14);
  ctx.fillStyle = ledRx ? '#33ff66' : '#144d22';
  ctx.fillRect(826, 969, 12, 10);
  ctx.fillStyle = ledTx ? '#ffcc00' : '#4d4010';
  ctx.fillRect(846, 969, 12, 10);

  ctx.fillStyle = '#222222';
  ctx.fillRect(868, 974, 5, 6);
  ctx.fillRect(873, 972, 3, 10);
  ctx.fillRect(876, 969, 3, 16);

  // ---------------------------------------------------------------------------
  // 4. Outer Win2000 Sunken Horizontal Scrollbar Road at (0, 680) and (1000, 680)
  // ---------------------------------------------------------------------------
  drawOuterScrollbarRoad(ctx, localT);

  // ---------------------------------------------------------------------------
  // 5. Main Chat Window + Authentic Win32 GDI `BitBlt` Repaint Trails on Buzz!
  // ---------------------------------------------------------------------------
  const WX = 84;
  const WY = 128;
  const WW = 832;
  const WH = 796;

  if (buzzEnv > 0.06) {
    drawWin32BitBltTrails(ctx, WX, WY, WW, WH, localT, isOutroThumbnail);
  }

  ctx.save();
  ctx.translate(shakeX, shakeY);

  // Hard Win32 pixel drop-shadow
  ctx.fillStyle = 'rgba(4, 12, 24, 0.44)';
  ctx.fillRect(WX + 6, WY + 6, WW, WH);

  drawBevelBox(ctx, WX, WY, WW, WH, {
    fill: '#d4d0c8',
    outerLight: '#ffffff',
    innerLight: '#ece9d8',
    innerDark: '#808080',
    outerDark: '#202020',
  });

  // Classic Win2000 Deep-Blue Gradient Title Bar carrying Native Era Identity!
  const tbGrad = ctx.createLinearGradient(WX + 4, WY + 4, WX + WW - 4, WY + 4);
  tbGrad.addColorStop(0, '#0a246a');
  tbGrad.addColorStop(0.62, '#285ea8');
  tbGrad.addColorStop(1, '#7eaee3');
  ctx.fillStyle = tbGrad;
  ctx.fillRect(WX + 4, WY + 4, WW - 8, 36);

  // Original PeliChat Pixel Beak-Bubble Icon
  drawPixelArt(ctx, WX + 11, WY + 12, 2, [
    '..KKKKKK..',
    '.KWWWWWWK.',
    'KWWOOWWWWK',
    'KWWOOOOOWK',
    'KWWWOOOWWK',
    '.KWWWWWWK.',
    '..KKWWKKKK',
    '...KWWK...',
  ], { K: '#061538', W: '#ffffff', O: '#ff9900' });

  // Native Title Bar Era & Buddy Status (1080p razor-sharp, zero floating HUD box!)
  const dotPhase = Math.floor(t * 3.5) % 4;
  const dots = dotPhase === 0 ? '.' : dotPhase === 1 ? '..' : dotPhase === 2 ? '...' : '…';
  const titleStr = `[17 · ${scene.era} | ${scene.zh}] PeliChat 2003 — 水鸟观察员 (对方正在输入${dots})`;
  ctx.fillStyle = '#04102e';
  ctx.font = '700 16px "PelicanSans", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(titleStr, WX + 37, WY + 23);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(titleStr, WX + 36, WY + 22);

  // Hand-pixeled yellow writing pencil icon next to title text (zero Unicode tofu risk!)
  if (dotPhase % 2 === 0) {
    const textW = Math.round(ctx.measureText(titleStr).width);
    const px0 = Math.min(WX + WW - 118, WX + 44 + textW);
    drawPixelArt(ctx, px0, WY + 13, 2, [
      '......KK',
      '.....KYK',
      '....KYYK',
      '...KYYK.',
      '..KYYK..',
      '.KOOK...',
      'KKKK....',
    ], { K: '#0a1838', Y: '#ffdd33', O: '#ff7700' });
  }

  // Right-side Classic Beveled Window Control Buttons: [_] [□] [×]
  const btnY = WY + 9;
  drawBevelBox(ctx, WX + WW - 88, btnY, 24, 24, { fill: '#d4d0c8' });
  ctx.fillStyle = '#111111';
  ctx.fillRect(WX + WW - 82, btnY + 16, 11, 3);

  drawBevelBox(ctx, WX + WW - 61, btnY, 24, 24, { fill: '#d4d0c8' });
  ctx.fillRect(WX + WW - 56, btnY + 5, 13, 3);
  ctx.fillRect(WX + WW - 56, btnY + 5, 1, 13);
  ctx.fillRect(WX + WW - 44, btnY + 5, 1, 13);
  ctx.fillRect(WX + WW - 56, btnY + 17, 13, 1);

  drawBevelBox(ctx, WX + WW - 34, btnY, 24, 24, {
    fill: '#d93b2b',
    outerLight: '#ff9c91',
    innerLight: '#f06659',
    innerDark: '#96190e',
    outerDark: '#4d0803',
  });
  drawPixelArt(ctx, WX + WW - 28, btnY + 6, 2, [
    'WW..WW',
    '.WWWW.',
    '..WW..',
    '..WW..',
    '.WWWW.',
    'WW..WW',
  ], { W: '#ffffff' });

  // Classic Win32 Menu Bar Strip
  ctx.fillStyle = '#d4d0c8';
  ctx.fillRect(WX + 4, WY + 41, WW - 8, 24);
  ctx.fillStyle = '#111111';
  ctx.font = '500 12.5px "PelicanSans", sans-serif';
  ctx.fillText('文件(F)   编辑(E)   查看(V)   传文件(T)   像素秀(P)   消息记录(H)   帮助(A)', WX + 14, WY + 53);
  ctx.fillStyle = '#808080';
  ctx.fillRect(WX + 6, WY + 65, WW - 12, 1);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(WX + 6, WY + 66, WW - 12, 1);

  // ---------------------------------------------------------------------------
  // 6. RichEdit Chat History Pane (Sunken #EEF5FC Stationery — ZERO modern roundRect bubbles!)
  // ---------------------------------------------------------------------------
  const logX = WX + 10; // 94
  const logY = WY + 72; // 200
  const rightColX = WX + WW - 154; // 762
  const logWTop = rightColX - logX - 8;
  const logH = 516; // spans y = 200..716, straddling y = 680 road!

  // Sunken RichEdit interior fill
  ctx.fillStyle = '#eef5fc';
  ctx.fillRect(logX, logY, logWTop, 214);
  ctx.fillRect(logX, logY + 212, WW - 20, logH - 212);

  // Faint Bayer-style stationery grid lines in lower GIF stage
  for (let ry = logY + 236; ry < logY + logH - 36; ry += 28) {
    drawDottedHLine(ctx, logX + 8, WX + WW - 34, ry, '#c5d8ec', 2);
  }

  // Crisp Win32 2px Sunken Border around L-shaped RichEdit Pane
  ctx.fillStyle = '#808080';
  ctx.fillRect(logX, logY, logWTop, 1);
  ctx.fillRect(logX, logY, 1, logH);
  ctx.fillRect(rightColX - 8, logY, 1, 212);
  ctx.fillRect(rightColX - 8, logY + 212, WW - 12 - (rightColX - WX), 1);
  ctx.fillStyle = '#404040';
  ctx.fillRect(logX + 1, logY + 1, logWTop - 2, 1);
  ctx.fillRect(logX + 1, logY + 1, 1, logH - 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(logX, logY + logH - 1, WW - 20, 1);
  ctx.fillRect(WX + WW - 11, logY + 212, 1, logH - 212);

  // Vertical Win2000 Scrollbar on right edge of RichEdit stage
  drawBevelBox(ctx, WX + WW - 30, logY + 214, 18, logH - 216, { fill: '#e4e1d6', sunken: true });
  drawBevelBox(ctx, WX + WW - 29, logY + 215, 16, 17, { fill: '#d4d0c8' });
  drawBevelBox(ctx, WX + WW - 29, logY + 340, 16, 74, { fill: '#c8c4b8' });
  drawBevelBox(ctx, WX + WW - 29, logY + logH - 20, 16, 17, { fill: '#d4d0c8' });

  // Upper Friend & Lower Self 48x48 Hand-Shaded Pixel Portrait Frames!
  drawCustomAvatarBox(ctx, avatarSprites.canvas, rightColX, logY, 144, 206, 'friend', qT);
  drawCustomAvatarBox(ctx, avatarSprites.canvas, rightColX, WY + 594, 144, 192, 'self', qT);

  // Authentic 2003 RichEdit Indented Message Stream (y = 206..420, 1px dotted dividers!)
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Message 1 (Self)
  ctx.fillStyle = '#0000cc';
  ctx.font = '700 13px "PelicanSans", sans-serif';
  ctx.fillText('夜航鹈鹕 (22:13:42):', logX + 12, logY + 8);
  ctx.fillStyle = '#111111';
  ctx.font = '500 14px "PelicanSans", sans-serif';
  ctx.fillText('在吗？艺术史期末汇报的跨时代灵感你找齐没？', logX + 28, logY + 27);
  drawDottedHLine(ctx, logX + 10, logX + logWTop - 12, logY + 49, '#a5bed9', 3);

  // Message 2 (Friend + hand-pixeled 14x14 classic yellow grin emoticon!)
  ctx.fillStyle = '#007a3d';
  ctx.font = '700 13px "PelicanSans", sans-serif';
  ctx.fillText('水鸟观察员 (22:13:56):', logX + 12, logY + 55);
  ctx.fillStyle = '#111111';
  ctx.font = '500 14px "PelicanSans", sans-serif';
  ctx.fillText('哈哈哈刚用56K小猫在论坛扒到一张绝世神图！', logX + 28, logY + 74);
  drawPixelArt(ctx, logX + 346, logY + 73, 2, [
    '..KKKK..',
    '.KYYYYK.',
    'KYKYYKYK',
    'KYYYYYYK',
    'KYWWWWYK',
    'KYYYYYYK',
    '.KYYYYK.',
    '..KKKK..',
  ], { K: '#4d3300', Y: '#ffcc00', W: '#ffffff' });
  drawDottedHLine(ctx, logX + 10, logX + logWTop - 12, logY + 96, '#a5bed9', 3);

  // Message 3 (Featured GIF message + sunken gray Win32 attachment chip — zero roundRect!)
  ctx.fillStyle = '#007a3d';
  ctx.font = '700 13.5px "PelicanSans", sans-serif';
  ctx.fillText('水鸟观察员 (22:14:08):', logX + 12, logY + 102);

  ctx.fillStyle = '#0a246a';
  ctx.font = '700 15.5px "PelicanSans", sans-serif';
  ctx.fillText('快看我刚存的逆天动图 ->', logX + 28, logY + 123);

  drawBevelBox(ctx, logX + 232, logY + 120, 368, 24, { fill: '#e6ecf5', sunken: true });
  ctx.fillStyle = '#2b4466';
  ctx.font = '600 12px "PelicanMono", monospace';
  ctx.fillText('[文件: pelican_2003.gif | 42.6 KB | 接收完毕]', logX + 242, logY + 126);

  // Bar-2 System Buzz Prompt inside RichEdit stream (sunken Win32 notice bar, zero roundRect!)
  if (localT >= 2.0 || isOutroThumbnail) {
    const sysFlash = buzzEnv > 0.18 && Math.floor(localT * 12) % 2 === 0;
    const bx0 = logX + 14;
    const by0 = logY + 154;
    const bw0 = 560;
    const bh0 = 26;

    drawBevelBox(ctx, bx0, by0, bw0, bh0, {
      fill: sysFlash ? '#ffe49c' : '#f2efe2',
      sunken: true,
    });
    // Pixel vibrating-window mini icon
    drawPixelArt(ctx, bx0 + 8, by0 + 6, 2, [
      'R.KKKK.R',
      '.KBBBBK.',
      'RKWOOOWR',
      '.KWWWWK.',
      'R.KKKK.R',
    ], { R: '#d94800', K: '#111111', B: '#0a246a', W: '#ffffff', O: '#ffcc00' });

    ctx.fillStyle = sysFlash ? '#a82e00' : '#444444';
    ctx.font = '700 13.5px "PelicanSans", sans-serif';
    const hitTag = localT >= 3.0 && !isOutroThumbnail ? ' (×2 连环震屏！)' : '';
    ctx.fillText(`系统提示：对方给您发送了一个窗口抖动！${hitTag}`, bx0 + 30, by0 + 5);
  }

  // Inner RichEdit Horizontal Road Strip right at y = 680 (connects cleanly with outer scrollbars!)
  const innerRoadY = ROAD_EDGE_Y;
  for (let gx = logX + 2; gx < WX + WW - 32; gx += 16) {
    const even = ((gx >> 4) & 1) === 0;
    ctx.fillStyle = even ? '#d8e6f5' : '#c3d6ec';
    ctx.fillRect(gx, innerRoadY + 1, 16, 15);
    ctx.fillStyle = even ? '#c3d6ec' : '#d8e6f5';
    ctx.fillRect(gx, innerRoadY + 16, 16, 15);
  }
  ctx.fillStyle = '#0a246a';
  ctx.fillRect(logX + 2, innerRoadY - 1, WX + WW - 34 - logX, 3);

  // ---------------------------------------------------------------------------
  // 7. Formatting Toolbar (字体 / 表情 / 闪屏震动) + Input Box + Status Bar
  // ---------------------------------------------------------------------------
  const tbY = WY + 594;
  const inputW = rightColX - logX - 8;

  drawBevelBox(ctx, logX, tbY, inputW, 34, { fill: '#d4d0c8' });

  const toolButtons = [
    { label: 'A 字体', w: 74, active: false, icon: 'font' },
    { label: '表情', w: 72, active: false, icon: 'smile' },
    { label: '闪屏震动', w: 104, active: buzzEnv > 0.10, icon: 'buzz' },
    { label: '发贴图', w: 84, active: false, icon: 'img' },
    { label: '传文件', w: 80, active: false, icon: 'file' },
  ];
  let curTx = logX + 5;
  for (const btn of toolButtons) {
    drawBevelBox(ctx, curTx, tbY + 4, btn.w, 26, {
      fill: btn.active ? '#ffd68a' : '#d4d0c8',
      sunken: btn.active,
    });
    let textOff = 10;
    if (btn.icon === 'smile') {
      drawPixelArt(ctx, curTx + 7, tbY + 10, 2, [
        '.KKKK.',
        'KYYYYK',
        'KYKKYK',
        'KYYYYK',
        'KYWWYK',
        '.KKKK.',
      ], { K: '#4d3300', Y: '#ffcc00', W: '#ffffff' });
      textOff = 24;
    } else if (btn.icon === 'buzz') {
      drawPixelArt(ctx, curTx + 7, tbY + 10, 2, [
        'R.KKKK.R',
        '.KBBBBK.',
        'RKWWWWKR',
        '.KWWWWK.',
        'R.KKKK.R',
      ], { R: '#d94800', K: '#111111', B: '#0a246a', W: '#ffffff' });
      textOff = 27;
    }
    ctx.fillStyle = btn.active ? '#9e2a00' : '#111111';
    ctx.font = `${btn.active ? 700 : 600} 12.5px "PelicanSans", sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.label, curTx + textOff, tbY + 17);
    curTx += btn.w + 5;
  }

  ctx.fillStyle = '#444444';
  ctx.font = '600 11.5px "PelicanMono", monospace';
  ctx.fillText('SimSun 9pt', logX + inputW - 82, tbY + 17);

  // Sunken Message Input Box
  const inpY = tbY + 38;
  drawBevelBox(ctx, logX, inpY, inputW, 86, { fill: '#ffffff', sunken: true });

  const replyFull = '哈哈哈哈这只256色抠图残边GIF鹈鹕居然顺着聊天框骑过去了！！';
  const typedLen = isOutroThumbnail
    ? 24
    : clamp(Math.floor((localT / 5.3) * replyFull.length), 5, replyFull.length);
  const typedText = replyFull.slice(0, typedLen);
  ctx.fillStyle = '#000000';
  ctx.font = '500 15.5px "PelicanSans", sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText(typedText, logX + 12, inpY + 12);

  if (Math.floor(t * 2.5) % 2 === 0) {
    const tw = Math.round(ctx.measureText(typedText).width);
    ctx.fillStyle = '#000000';
    ctx.fillRect(logX + 14 + tw, inpY + 11, 2, 19);
  }

  // Bottom Status Strip & Raised "关闭(C)" / "发送(S)" Buttons
  const botY = inpY + 91;
  drawBevelBox(ctx, logX, botY + 2, inputW - 216, 28, { fill: '#cecac2', sunken: true });
  ctx.fillStyle = '#333333';
  ctx.font = '600 11.5px "PelicanMono", monospace';
  ctx.textBaseline = 'middle';
  ctx.fillText(`2000s Desktop IM & GIF89a  |  56K V.90 在线`, logX + 10, botY + 16);

  drawBevelBox(ctx, logX + inputW - 208, botY + 1, 92, 30, { fill: '#d4d0c8' });
  ctx.fillStyle = '#111111';
  ctx.font = '700 13.5px "PelicanSans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('关闭(C)', logX + inputW - 162, botY + 16);

  // Default Win32 1px black outer ring around primary "发送(S)" button
  ctx.fillStyle = '#000000';
  ctx.fillRect(logX + inputW - 108, botY, 108, 32);
  drawBevelBox(ctx, logX + inputW - 107, botY + 1, 106, 30, { fill: '#d4d0c8' });
  ctx.fillStyle = '#0a246a';
  ctx.font = '700 14px "PelicanSans", sans-serif';
  ctx.fillText('发送(S) ▾', logX + inputW - 54, botY + 16);

  ctx.restore();

  // ---------------------------------------------------------------------------
  // 8. 216-Color Bayer-Dithered GIF89a Pelican + Ripped #FFFFFF/#000033 Matte Fringe!
  // ---------------------------------------------------------------------------
  if (pelicanLocalX > -240 && pelicanLocalX < PANEL_SIZE + 240) {
    const pelShakeX = Math.round(shakeX * interiorBlend * 0.85);
    const pelShakeY = Math.round(shakeY * interiorBlend);

    drawDitheredGifPelican(ctx, {
      px: effectivePelicanX + pelShakeX,
      py: ROAD_EDGE_Y + pelShakeY,
      qPedalAngle,
      qWheelAngle,
      speedScale,
      sceneT: qT,
      localT,
      isOutroThumbnail,
    });
  }

  // ---------------------------------------------------------------------------
  // 9. Subtle CRT Horizontal-Sync Scanline Shudder during peak buzz impacts!
  // ---------------------------------------------------------------------------
  const isImpactWindow =
    !isOutroThumbnail &&
    ((localT >= 2.0 && localT < 2.34) || (localT >= 3.0 && localT < 3.34));
  if (isImpactWindow) {
    const hShift = ((Math.floor(localT * 36) & 1) === 0 ? 2 : -2);
    ctx.drawImage(g.canvas, 0, 220, PANEL_SIZE, 44, hShift, 220, PANEL_SIZE, 44);
    ctx.drawImage(g.canvas, 0, 520, PANEL_SIZE, 52, -hShift, 520, PANEL_SIZE, 52);
  }

  // ---------------------------------------------------------------------------
  // 10. Anti-Moiré CRT Shadow-Mask RGB Phosphor Overlay (6.8% opacity) + Outro Strip
  // ---------------------------------------------------------------------------
  const crtMask = getCrtShadowMaskOverlay(kit);
  ctx.drawImage(crtMask.canvas, 0, 0);

  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(15, 14, 12, 0.78)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.fillStyle = '#f5f0e6';
    ctx.font = '700 48px "PelicanSerif", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} ${scene.zh}`, 36, PANEL_SIZE - 48);
  }

  ctx.restore();
}
