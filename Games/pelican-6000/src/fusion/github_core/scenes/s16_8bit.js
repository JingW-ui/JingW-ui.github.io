// src/scenes/s16_8bit.js
// #16 8-bit 像素游戏 (1980s Side-Scrolling Platformer — Original "PELI-QUEST")
// r3 Hardware-Authentic 1980s Famicom PPU + Consumer CRT TV Upgrade:
// - 100% Pure 250x250 Integer Framebuffer (ZERO vector overlay text! Built-in 12x12 arcade bitmap Hanzi `像素游戏`)
// - Hand-crafted CHR-ROM tilemap: stepped craggy cliffs, pixel-clustered foliage knolls, 3 weathered/mossy cobble variants
// - Color-RAM palette-cycled subterranean abyss waterfall + 4-color cycling gems/coins
// - Hand-pixeled sprite templates (21x21 clean pixel wheel + 3 spoke frames, pixel-clustered frame & 4-pose wing sprites — zero float `pline` jaggies!)
// - 1-frame NES hit-stop palette flash on coin smash + hardware OAM even/odd sprite flicker on `1UP` vanish
// - NTSC 1px horizontal composite chroma fringing + baked RGB aperture-grille phosphor triads & scanlines (strict y=680 alignment).

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

const PW = 250; // 250 * 4 = 1000
const PH = 250;
const PIX_SCALE = 4;
const GY = 170; // 170 * 4 = 680 = ROAD_EDGE_Y (100% exact!)
const PIT_X0 = 103; // 412
const PIT_X1 = 147; // 588

// Strict 16-Color Retro Console Hardware Palette (0..15)
const PALETTE_HEX = [
  '#0d1021', // 0: Obsidian Navy-Black (outlines, HUD bar, abyss)
  '#1d2b53', // 1: Midnight Indigo (pit rock shadow, dark wing tips, HUD bevel)
  '#5c94fc', // 2: Classic 8-Bit Royal Sky Blue / Waterfall Mid
  '#9cbcfc', // 3: Pale Horizon Sky Blue / Waterfall Crest
  '#fcfcfc', // 4: Pure PPU White (plumage, clouds, HUD text, sparkle core)
  '#c8d0dc', // 5: Light Silver-Gray (wing/belly shade, wheel rims, obelisk)
  '#687084', // 6: Slate Steel Gray (spokes, chainring, distant crag)
  '#c84c0c', // 7: Terracotta Stone Brick (platform cobbles, far leg)
  '#fc9838', // 8: Tangerine Orange (pelican beak & bouncing gular pouch, brick highlight)
  '#782800', // 9: Deep Umber Brown (brick mortar, wood post, rock cleft)
  '#f8b800', // 10: Goldenrod Coin Yellow (diamond coin, HUD headers)
  '#fce4a0', // 11: Pale Starlight Gold (coin gleam, starburst sparks)
  '#00a800', // 12: Emerald Turf Green (grass, leaf clusters, 1UP body)
  '#80d010', // 13: Chartreuse Lime (sunlit foliage clusters, 1UP top)
  '#005800', // 14: Deep Forest Green (foliage shadow, moss seam)
  '#e40058', // 15: Arcade Ruby-Crimson (bicycle diamond frame, pennant)
];

const PALETTE_RGB = PALETTE_HEX.map((hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
]);

// Crisp 5x7 integer bitmap font for authentic 8-bit HUD & popups
const FONT_5X7 = {
  '0': ['01110', '10011', '10101', '11001', '10001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01110'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  x: ['00000', '00000', '10001', '01010', '00100', '01010', '10001'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  '+': ['00000', '00100', '00100', '11111', '00100', '00100', '00000'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
};

// Authentic 1980s 12x12 Arcade / Famicom Bitmap Hanzi Glyphs (`像素游戏`) — 100% integer pixel art!
const HANZI_12X12 = {
  像: [
    '001000110000',
    '011001001100',
    '010011111110',
    '110010010010',
    '010011111110',
    '010000110000',
    '010011111100',
    '010100110100',
    '010011011000',
    '010100101100',
    '010011110010',
    '010000110000',
  ],
  素: [
    '000001100000',
    '011111111110',
    '000001100000',
    '001111111100',
    '000001100000',
    '111111111111',
    '000011000000',
    '000110010000',
    '001111111000',
    '000001100100',
    '001101101100',
    '010001100010',
  ],
  游: [
    '010001000100',
    '001011110111',
    '000001001010',
    '110001110111',
    '001001010001',
    '000001010010',
    '001001011111',
    '010010010010',
    '010010010010',
    '100100110010',
    '101000000010',
    '000000000110',
  ],
  戏: [
    '000000010100',
    '000000010010',
    '111110010000',
    '000111111111',
    '010010010000',
    '001100010010',
    '001100010100',
    '010110011000',
    '100010011000',
    '000000101001',
    '000001000101',
    '000010000011',
  ],
};

// Hand-Pixeled 21x21 Clean Arcade Bicycle Wheel Templates (3 Spoke Rotation Phases, ZERO midpoint-circle horns!)
// Legend: '.' = transparent, 'T' = dark tire (1), 'R' = silver rim (5), 'S' = bright spoke (5), 's' = secondary spoke (6), 'H' = white hub (4)
const WHEEL_SPRITES_21 = [
  // Phase 0: Cardinal (+) bright spokes + diagonal glints
  [
    '.......TTTTTTT.......',
    '.....TTRRRRRRRTT.....',
    '....TRR...S...RRT....',
    '...TR.....S.....RT...',
    '..TR..s...S...s..RT..',
    '.TR....s..S..s....RT.',
    '.TR.....s.S.s.....RT.',
    'TR.......sSs.......RT',
    'TR........S........RT',
    'TR.......sSs.......RT',
    'TRSSSSSSSSSSSSSSSSSRT',
    'TR.......sSs.......RT',
    'TR........S........RT',
    'TR.......sSs.......RT',
    '.TR.....s.S.s.....RT.',
    '.TR....s..S..s....RT.',
    '..TR..s...S...s..RT..',
    '...TR.....S.....RT...',
    '....TRR...S...RRT....',
    '.....TTRRRRRRRTT.....',
    '.......TTTTTTT.......',
  ],
  // Phase 1: 30-degree stepped arcade spoke rotation
  [
    '.......TTTTTTT.......',
    '.....TTRRRRRRRTT.....',
    '....TRR.....S.RRT....',
    '...TR..s....S...RT...',
    '..TR....s..S.....RT..',
    '.TR......s.S....s.RT.',
    '.TR.......S...ss..RT.',
    'TR........S.ss.....RT',
    'TR..ss....Ss.......RT',
    'TR....sss.S....ss..RT',
    'TR.......sHsss.....RT',
    'TR..ss....S.sss....RT',
    'TR.......sS....ss..RT',
    'TR.....ss.S........RT',
    '.TR..ss...S.......RT.',
    '.TR.s....S.s......RT.',
    '..TR.....S..s....RT..',
    '...TR...S....s..RT...',
    '....TRR.S.....RRT....',
    '.....TTRRRRRRRTT.....',
    '.......TTTTTTT.......',
  ],
  // Phase 2: Diagonal (x) bright spokes + cardinal glints
  [
    '.......TTTTTTT.......',
    '.....TTRRRRRRRTT.....',
    '....TRR...s...RRT....',
    '...TR.S...s...S.RT...',
    '..TR...S..s..S...RT..',
    '.TR.....S.s.S.....RT.',
    '.TR......SsS......RT.',
    'TR........S........RT',
    'TR.......S.S.......RT',
    'TR......S...S......RT',
    'TR..ssss..H..ssss..RT',
    'TR......S...S......RT',
    'TR.......S.S.......RT',
    'TR........S........RT',
    '.TR......SsS......RT.',
    '.TR.....S.s.S.....RT.',
    '..TR...S..s..S...RT..',
    '...TR.S...s...S.RT...',
    '....TRR...s...RRT....',
    '.....TTRRRRRRRTT.....',
    '.......TTTTTTT.......',
  ],
];

// Hand-Pixeled Plump Pelican Torso & Pointed Tail Sprite (26x14, clean pixel clusters + silver underside dither!)
// Legend: 'W' = pure white (4), 'G' = silver-gray shade (5)
const TORSO_SPRITE = [
  '..........WWWWWWWWWW......',
  '........WWWWWWWWWWWWWW....',
  '......WWWWWWWWWWWWWWWWWW..',
  '....WWWWWWWWWWWWWWWWWWWWW.',
  '..WWWWWWWWWWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWWWWWWWWWWWW',
  '.GGGWWWWWWWWWWWWWWWWWWWWWW',
  '...GGGWWWWWWWWWWWWWWWWWWGW',
  '.....GGGGWWWWWWWWWWWWGWGWG',
  '.......GGGGGWWWWWWWGWGWGGG',
  '.........GGGGGGGGGGGGGGGG.',
  '...........GGGGGGGGGGGGG..',
  '.............GGGGGGGGGG...',
  '...............GGGGGG.....',
];

// 4 Hand-Pixeled Wing Animation Templates (anchored at shoulder `(14, 15)` inside 22x24 box):
// Legend: 'W' = white (4), 'G' = silver shade (5), 'I' = dark indigo primary feather tips (1)
const WING_SPRITES = {
  // Grounded steady grip reaching forward-down toward handlebar
  ride: {
    ox: 4,
    oy: 2,
    rows: [
      '....WWWW........',
      '..WWWWWWWW......',
      '.WWWWWWWWWW.....',
      '.GWWWWWWWWWW....',
      '..GGWWWWWWWWWW..',
      '....GGWWWWWWWWWI',
      '......GGGWWWWWII',
      '........GGGGWII.',
    ],
  },
  // Flap 1 (hits at 97.80s!): High Heroic Upstroke with 3 splayed indigo-tipped primary feathers!
  up: {
    ox: 13,
    oy: 16,
    rows: [
      '..II....II......',
      '..IWW..IWWI..II.',
      '...WWW..WWW.IWW.',
      '...WWWW.WWWWWWW.',
      '....WWWWWWWWWWG.',
      '.....WWWWWWWWGG.',
      '......WWWWWWGGG.',
      '.......WWWWWWGG.',
      '........WWWWWWG.',
      '.........WWWWWW.',
      '.........WWWWWW.',
      '..........WWWWW.',
      '..........GWWWW.',
      '...........GWWW.',
    ],
  },
  // Flap 0 & 3: Wide Horizontal Gliding Spread
  glide: {
    ox: 15,
    oy: 7,
    rows: [
      'II..............',
      'IWWWW...........',
      '.WWWWWWWW.......',
      '..GWWWWWWWWWW...',
      'II.GGWWWWWWWWWW.',
      '.IWWWWWWWWWWWWWW',
      '..GGGWWWWWWWWWWG',
      '.....GGGGWWWWGGG',
    ],
  },
  // Flap 2 (hits at 97.50s!): Deep Power Downstroke sweeping below hip
  down: {
    ox: 11,
    oy: 2,
    rows: [
      '.........WWWWWW.',
      '........WWWWWWG.',
      '.......WWWWWWGG.',
      '......WWWWWWGGG.',
      '.....WWWWWWWWGG.',
      '....WWWWWWWWGG..',
      '...WWWW.WWWWG...',
      '..IWWW..IWWWG...',
      '.IIWW...IIWW....',
      '.II.....II......',
    ],
  },
};

// Reusable offscreen 250x250 PPU & phosphor-bloom buffers
let ppuCanvas = null;
let ppuCtx = null;
let ppuImageData = null;
let ppuU32 = null;
let bloomCanvas = null;
let bloomCtx = null;

const frameBuf = new Uint8Array(PW * PH);
const spriteBuf = new Uint8Array(PW * PH); // 0 = transparent, else colorIdx + 1
let staticLevelBuf = null;

function ensurePPU() {
  if (!ppuCanvas && typeof document !== 'undefined') {
    ppuCanvas = document.createElement('canvas');
    ppuCanvas.width = PW;
    ppuCanvas.height = PH;
    ppuCtx = ppuCanvas.getContext('2d');
    ppuImageData = ppuCtx.createImageData(PW, PH);
    ppuU32 = new Uint32Array(ppuImageData.data.buffer);

    bloomCanvas = document.createElement('canvas');
    bloomCanvas.width = PW;
    bloomCanvas.height = PH;
    bloomCtx = bloomCanvas.getContext('2d');
  }
}

function pset(buf, x, y, c) {
  const ix = x | 0;
  const iy = y | 0;
  if (ix >= 0 && ix < PW && iy >= 0 && iy < PH) {
    buf[iy * PW + ix] = c;
  }
}

function sset(x, y, c) {
  const ix = x | 0;
  const iy = y | 0;
  if (ix >= 0 && ix < PW && iy >= 0 && iy < PH) {
    spriteBuf[iy * PW + ix] = c + 1;
  }
}

function prect(buf, x, y, w, h, c) {
  const x0 = Math.max(0, x | 0);
  const y0 = Math.max(0, y | 0);
  const x1 = Math.min(PW, (x | 0) + (w | 0));
  const y1 = Math.min(PH, (y | 0) + (h | 0));
  for (let py = y0; py < y1; py++) {
    const row = py * PW;
    for (let px = x0; px < x1; px++) {
      buf[row + px] = c;
    }
  }
}

/**
 * Clean Pixel-Clustered Line helper for discrete crank/neck segments.
 */
function pline(targetFn, x0, y0, x1, y1, c, thick = 1) {
  let ix0 = Math.round(x0);
  let iy0 = Math.round(y0);
  const ix1 = Math.round(x1);
  const iy1 = Math.round(y1);
  const dx = Math.abs(ix1 - ix0);
  const sx = ix0 < ix1 ? 1 : -1;
  const dy = -Math.abs(iy1 - iy0);
  const sy = iy0 < iy1 ? 1 : -1;
  let err = dx + dy;

  for (let guard = 0; guard < 512; guard++) {
    if (thick <= 1) {
      targetFn(ix0, iy0, c);
    } else if (thick === 2) {
      targetFn(ix0, iy0, c);
      targetFn(ix0 + 1, iy0, c);
      targetFn(ix0, iy0 + 1, c);
      targetFn(ix0 + 1, iy0 + 1, c);
    } else {
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          targetFn(ix0 + ox, iy0 + oy, c);
        }
      }
    }
    if (ix0 === ix1 && iy0 === iy1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      ix0 += sx;
    }
    if (e2 <= dx) {
      err += dx;
      iy0 += sy;
    }
  }
}

function pdisc(targetFn, cx, cy, r, c) {
  const icx = Math.round(cx);
  const icy = Math.round(cy);
  const ir = Math.ceil(r);
  const r2 = r * r;
  for (let dy = -ir; dy <= ir; dy++) {
    for (let dx = -ir; dx <= ir; dx++) {
      if (dx * dx + dy * dy <= r2) {
        targetFn(icx + dx, icy + dy, c);
      }
    }
  }
}

function drawPixelText(buf, str, x, y, mainCol, shadowCol = 0, scale = 1, highlightCol = -1) {
  let cursorX = x | 0;
  const baseY = y | 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const glyph = FONT_5X7[ch] || FONT_5X7[' '];
    if (shadowCol >= 0) {
      for (let gy = 0; gy < 7; gy++) {
        const row = glyph[gy];
        for (let gx = 0; gx < 5; gx++) {
          if (row[gx] === '1') {
            prect(buf, cursorX + gx * scale + scale, baseY + gy * scale + scale, scale, scale, shadowCol);
          }
        }
      }
    }
    for (let gy = 0; gy < 7; gy++) {
      const row = glyph[gy];
      const col = highlightCol >= 0 && gy < 3 ? highlightCol : mainCol;
      for (let gx = 0; gx < 5; gx++) {
        if (row[gx] === '1') {
          prect(buf, cursorX + gx * scale, baseY + gy * scale, scale, scale, col);
        }
      }
    }
    cursorX += 6 * scale;
  }
}

/**
 * Draws 12x12 Arcade Bitmap Hanzi (`像素游戏`) directly into `frameBuf` with 1px drop shadow
 * and top-half goldenrod/white gradient — ZERO smooth vector font anywhere!
 */
function drawBitmapHanzi(buf, str, x, y, topCol = 4, botCol = 11, shadowCol = 0) {
  let cx = x | 0;
  const cy = y | 0;
  for (let i = 0; i < str.length; i++) {
    const mat = HANZI_12X12[str[i]];
    if (!mat) continue;
    if (shadowCol >= 0) {
      for (let r = 0; r < 12; r++) {
        const row = mat[r];
        for (let c = 0; c < 12; c++) {
          if (row[c] === '1') pset(buf, cx + c + 1, cy + r + 1, shadowCol);
        }
      }
    }
    for (let r = 0; r < 12; r++) {
      const row = mat[r];
      const col = r < 5 ? topCol : botCol;
      for (let c = 0; c < 12; c++) {
        if (row[c] === '1') pset(buf, cx + c, cy + r, col);
      }
    }
    cx += 13;
  }
}

function tileHash(a, b) {
  let h = (Math.imul(a, 374761393) + Math.imul(b, 668265263)) ^ 0x5bf03635;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) % 100;
}

/**
 * Bakes the static 250x250 16-color CHR-ROM Tilemap Level Backdrop ONCE:
 * - Royal blue sky + Bayer 2x2 ordered horizon dither (`py = 26..169`)
 * - Hand-stepped craggy rock mountains with vertical clefts & pixel snowcaps
 * - Hand-pixeled leaf-cluster foliage knolls (replacing mathematical grid parabolas!)
 * - 3 weathered/cracked/mossy stone-brick cobble tile variants + jutting cliff-edge rock tiles
 * - Starting pixel wooden stage post (`16-1`) + right milestone obelisk + 2 mossy floating sky-cobble ledges
 */
function getStaticLevelBuf() {
  if (staticLevelBuf) return staticLevelBuf;
  const buf = new Uint8Array(PW * PH);

  const bayer2 = [
    [0, 2],
    [3, 1],
  ];

  // 1. Sky (`py = 26..GY-1`) with Bayer ordered horizon dither
  for (let y = 26; y < GY; y++) {
    for (let x = 0; x < PW; x++) {
      let c = 2;
      if (y >= 130) {
        const u = (y - 130) / (GY - 130);
        const thresh = (bayer2[y & 1][x & 1] + 0.5) / 4;
        if (u > thresh * 0.85) c = 3;
      }
      buf[y * PW + x] = c;
    }
  }

  // 2. Stepped Craggy CHR-ROM Cliff Mountains + Snow-Ridges & Vertical Rock Clefts
  const drawCraggyMountain = (cx, peakY, halfW) => {
    for (let x = cx - halfW; x <= cx + halfW; x++) {
      if (x < 0 || x >= PW) continue;
      const dx = x - cx;
      const adx = Math.abs(dx);
      // Quantized 3px cliff terrace steps for authentic 8-bit tile silhouette
      const stepDist = Math.floor(adx / 3) * 3;
      const ledgeNotch = tileHash(Math.floor(x / 4), peakY) < 28 ? 2 : 0;
      const topY = clamp(
        peakY + Math.floor((stepDist / halfW) * (GY - 28 - peakY)) + ledgeNotch,
        peakY,
        GY
      );
      const isLeftLit = dx < -1;
      const isRidgeSeam = Math.abs(dx + Math.floor((topY - peakY) * 0.25)) <= 1;

      for (let y = topY; y < GY; y++) {
        const dy = y - topY;
        const thresh = (bayer2[y & 1][x & 1] + 0.5) / 4;
        const snowDepth = 12 + (Math.floor(x / 2) % 3) * 3;

        if (dy === 0 || (dy === 1 && adx % 3 === 0)) {
          buf[y * PW + x] = 1; // crisp dark-indigo pixel crag outline
        } else if (y < peakY + 24 && dy < snowDepth) {
          buf[y * PW + x] = isRidgeSeam ? 5 : isLeftLit ? 4 : 3;
        } else if (isRidgeSeam) {
          buf[y * PW + x] = 1; // central vertical rock cleft shadow
        } else {
          // Stepped horizontal strata + ordered Bayer rock dithering
          const fadeU = (y - peakY) / Math.max(1, GY - peakY);
          const strata = y % 8 === 0 && x % 4 !== 0;
          if (strata) {
            buf[y * PW + x] = isLeftLit ? 5 : 1;
          } else if (isLeftLit) {
            buf[y * PW + x] = fadeU * 0.82 > thresh ? 3 : 6;
          } else {
            buf[y * PW + x] = fadeU * 0.92 > thresh ? 6 : 1;
          }
        }
      }
    }
  };
  drawCraggyMountain(68, 58, 56);
  drawCraggyMountain(154, 48, 66);
  drawCraggyMountain(228, 66, 44);

  // 3. Pixel-Clustered Foliage Knolls (8x8 hand-designed leaf cluster pattern — ZERO math grid!)
  const LEAF_TILE_8X8 = [
    '..LLLL..',
    '.LLLLEE.',
    'LLLEEEEE',
    'LEEEEEEF',
    'EEEEFFFF',
    '.EEFFFF.',
    '..FFFFEE',
    'EEEEEEEE',
  ];
  const drawFoliageKnoll = (cx, peakY, halfW) => {
    for (let x = cx - halfW; x <= cx + halfW; x++) {
      if (x < 0 || x >= PW) continue;
      const qx = Math.floor(Math.abs(x - cx) / 2) * 2;
      const u = qx / halfW;
      const topY = clamp(peakY + Math.floor(u * u * (GY - peakY) * 0.5) * 2, peakY, GY);
      const sunlit = x < cx + 4;

      for (let y = topY; y < GY; y++) {
        const dy = y - topY;
        if (dy === 0) {
          buf[y * PW + x] = 0; // crisp 1px black pixel border
        } else if (dy <= 2 && sunlit) {
          buf[y * PW + x] = 13; // 2px sunlit chartreuse crown cluster
        } else {
          const tx = ((x % 8) + 8) % 8;
          const ty = ((y + Math.floor(x / 8) * 3) % 8 + 8) % 8;
          const ch = LEAF_TILE_8X8[ty][tx];
          if (ch === 'L') buf[y * PW + x] = sunlit ? 13 : 12;
          else if (ch === 'F') buf[y * PW + x] = 14;
          else buf[y * PW + x] = sunlit ? 12 : y > GY - 14 ? 14 : 12;
        }
      }
    }
  };
  drawFoliageKnoll(38, 114, 46);
  drawFoliageKnoll(125, 126, 36);
  drawFoliageKnoll(210, 108, 50);

  // 4. Pixel-Clustered Midground Berry Bushes
  const drawPixelBush = (cx, lobes = 3) => {
    const rMain = 8;
    for (let k = -lobes + 1; k <= lobes - 1; k++) {
      const lx = cx + k * 7;
      const lr = k === 0 ? rMain + 2 : rMain - 1;
      const ly = GY - lr + 2;
      pdisc((px, py, col) => {
        if (py < GY) pset(buf, px, py, col);
      }, lx, ly, lr + 1, 0);
    }
    for (let k = -lobes + 1; k <= lobes - 1; k++) {
      const lx = cx + k * 7;
      const lr = k === 0 ? rMain + 2 : rMain - 1;
      const ly = GY - lr + 2;
      for (let dy = -lr; dy <= lr; dy++) {
        for (let dx = -lr; dx <= lr; dx++) {
          if (dx * dx + dy * dy <= lr * lr && ly + dy < GY) {
            let c = 12;
            if (dy < -lr * 0.35 && dx < lr * 0.35) c = 13;
            else if (dy > lr * 0.32) c = 14;
            pset(buf, lx + dx, ly + dy, c);
          }
        }
      }
      // 2x1 pixel berry/blossom cluster
      pset(buf, lx - 2, ly - 1, 11);
      pset(buf, lx - 1, ly - 1, 10);
    }
  };
  drawPixelBush(46, 2);
  drawPixelBush(76, 2);
  drawPixelBush(174, 2);
  drawPixelBush(232, 3);

  // 5. Stage-Start Pixel Wooden Signpost (`16-1`) at px = 18 + Pit-Warning Arrow at px = 92 + Right Obelisk at px = 200
  // Left stage marker plaque (`16`)
  prect(buf, 18, GY - 15, 3, 15, 0);
  prect(buf, 19, GY - 14, 1, 14, 9);
  prect(buf, 10, GY - 25, 19, 11, 0);
  prect(buf, 11, GY - 24, 17, 9, 9);
  prect(buf, 11, GY - 24, 17, 1, 8);
  drawPixelText(buf, '16', 14, GY - 23, 11, 0, 1);

  // Pit-warning arrow signpost on left cliff edge (`px = 92`)
  prect(buf, 92, GY - 15, 3, 15, 0);
  prect(buf, 93, GY - 14, 1, 14, 9);
  prect(buf, 86, GY - 22, 14, 8, 0);
  prect(buf, 87, GY - 21, 12, 6, 8);
  prect(buf, 88, GY - 19, 6, 2, 0);
  pset(buf, 94, GY - 20, 0);
  pset(buf, 94, GY - 19, 0);
  pset(buf, 95, GY - 19, 0);
  pset(buf, 94, GY - 18, 0);

  // Right platform milestone stone obelisk (`px = 200`)
  prect(buf, 196, GY - 26, 9, 26, 0);
  prect(buf, 197, GY - 25, 7, 25, 5);
  prect(buf, 199, GY - 25, 5, 25, 6);
  prect(buf, 195, GY - 4, 11, 4, 0);
  prect(buf, 196, GY - 3, 9, 3, 5);

  // 6. Central Abyss Pit Rock Cavern Backdrop (`PIT_X0..PIT_X1 - 1`, `y = GY..PH - 1`)
  for (let y = GY; y < PH; y++) {
    const depthU = (y - GY) / (PH - GY);
    for (let x = PIT_X0; x < PIT_X1; x++) {
      const thresh = (bayer2[y & 1][x & 1] + 0.5) / 4;
      buf[y * PW + x] = depthU * 1.38 > thresh ? 0 : 1;
    }
  }

  // 7. Left & Right Terracotta Cobble Platforms with 3 CHR-ROM Tile Variants (Normal / Cracked / Mossy)
  //    & Jutting Broken Rock Cliff Edges! (Exact top contact at y = GY = 170 -> 680!)
  const fillCobblePlatform = (xStart, xEnd) => {
    for (let y = GY; y < PH; y++) {
      const ry = y - GY;
      for (let x = xStart; x < xEnd; x++) {
        const distLeftCliff = xStart > 0 ? x - xStart : 999;
        const distRightCliff = xEnd < PW ? xEnd - 1 - x : 999;
        const cliffDist = Math.min(distLeftCliff, distRightCliff);
        const cliffJag = (Math.floor(ry / 4) * 3 + 1) % 3;

        if (ry === 0) {
          pset(buf, x, y, 0); // exact 1px road top line at y = 680!
        } else if (ry === 1) {
          pset(buf, x, y, 13); // bright chartreuse turf lip
        } else if (ry <= 4) {
          pset(buf, x, y, (x + ry) % 4 === 0 ? 13 : 12);
        } else if (ry === 5) {
          pset(buf, x, y, (x + (x >> 2)) % 4 < 2 ? 12 : 14);
        } else if (ry === 6) {
          pset(buf, x, y, x % 5 < 2 ? 14 : 0);
        } else if (cliffDist <= cliffJag + 1) {
          // Rugged jutting broken cliff-wall stone edge bordering the pit!
          pset(buf, x, y, cliffDist === 0 ? 0 : ry % 6 === 0 ? 0 : distLeftCliff < distRightCliff ? 8 : 9);
        } else {
          // 12x8 CHR-ROM Stone Brick Courses with 3 deterministic tile variants (A, B, C)
          const by = ry - 7;
          const course = Math.floor(by / 8);
          const inY = by % 8;
          const xOff = (course % 2) * 6;
          const tileCol = Math.floor((x + xOff) / 12);
          const inX = (x + xOff) % 12;
          const hVal = tileHash(tileCol, course);
          const variant = hVal < 50 ? 0 : hVal < 78 ? 1 : 2; // 0: Clean, 1: Cracked, 2: Moss-crept

          let c = 7; // terracotta face
          if (inY === 7 || inX === 11) {
            c = 0; // obsidian mortar joint
          } else if (variant === 2 && (inY === 0 || (inY === 1 && (inX === 2 || inX === 3 || inX === 8)))) {
            c = inY === 0 && inX % 3 === 0 ? 13 : 12; // Variant C: mossy top seam!
          } else if (inY === 6 || inX === 10) {
            c = 9; // deep umber lower-right bevel
          } else if (inY === 0 || inX === 0) {
            c = variant === 1 && inX >= 5 && inX <= 7 ? 9 : 8; // sunlit orange top-left bevel
          } else if (
            variant === 1 &&
            ((inX === 5 && inY === 1) ||
              (inX === 6 && inY === 2) ||
              (inX === 6 && inY === 3) ||
              (inX === 7 && inY === 4))
          ) {
            c = inY <= 2 ? 0 : 9; // Variant B: stepped diagonal stone fissure crack!
          } else if ((inX === 3 && inY === 4) || (inX === 8 && inY === 2)) {
            c = hVal % 2 === 0 ? 9 : 8; // subtle pixel stone speckle
          }
          pset(buf, x, y, c);
        }
      }
    }
  };

  fillCobblePlatform(0, PIT_X0);
  fillCobblePlatform(PIT_X1, PW);

  // 8. Two Original Moss-Topped Floating Sky-Cobble Platforms (100% original!)
  const drawFloatingPlatform = (startX, topY, numBlocks) => {
    const bw = 10;
    const bh = 8;
    const totalW = numBlocks * bw;
    prect(buf, startX - 1, topY - 1, totalW + 2, bh + 2, 0);
    for (let b = 0; b < numBlocks; b++) {
      const bx = startX + b * bw;
      prect(buf, bx, topY, bw, bh, 7);
      prect(buf, bx, topY, bw - 1, 1, 13);
      prect(buf, bx, topY + 1, bw - 1, 1, 12);
      prect(buf, bx, topY + 2, 1, bh - 3, 8);
      prect(buf, bx + bw - 1, topY, 1, bh, 0);
      prect(buf, bx + 1, topY + bh - 1, bw - 2, 1, 9);
      pset(buf, bx + 4, topY + 4, 11);
      pset(buf, bx + 5, topY + 4, 10);
      pset(buf, bx + 4, topY + 5, 10);
      pset(buf, bx + 5, topY + 5, 9);
    }
  };
  drawFloatingPlatform(44, 72, 3);
  drawFloatingPlatform(168, 60, 4);

  staticLevelBuf = buf;
  return buf;
}

/**
 * Animates Color-RAM Palette-Cycled Subterranean Waterfall Streams & Mist inside the Abyss Pit!
 */
function drawAbyssPaletteCycledWaterfall(buf, sceneT) {
  const cyc = Math.floor(sceneT * 12) % 4;
  const streamPalette = [1, 2, 3, 4]; // dark indigo -> royal blue -> pale blue -> white foam!

  const streams = [
    { x: PIT_X0 + 8, w: 4, startY: GY + 8 },
    { x: PIT_X0 + 20, w: 6, startY: GY + 4 },
    { x: PIT_X0 + 33, w: 3, startY: GY + 12 },
  ];

  for (const st of streams) {
    // Dark rock spout ledge
    prect(buf, st.x - 1, st.startY - 2, st.w + 2, 2, 0);
    prect(buf, st.x, st.startY - 1, st.w, 1, 6);

    for (let y = st.startY; y < PH - 3; y++) {
      const band = ((Math.floor(y / 3) - cyc) % 4 + 4) % 4;
      const cMain = streamPalette[band];
      const cEdge = streamPalette[(band + 3) % 4];
      for (let dx = 0; dx < st.w; dx++) {
        const isEdge = dx === 0 || dx === st.w - 1;
        pset(buf, st.x + dx, y, isEdge ? cEdge : cMain);
      }
    }
  }

  // Boiling 8-bit pixel water foam & mist across bottom of pit (`py = PH - 4 .. PH - 1`)
  for (let x = PIT_X0 + 2; x < PIT_X1 - 2; x++) {
    const foamPhase = (x + cyc * 2) % 5;
    pset(buf, x, PH - 1, 2);
    pset(buf, x, PH - 2, foamPhase < 2 ? 4 : 3);
    if (foamPhase === 0) pset(buf, x, PH - 3, 4);
    else if (foamPhase === 2) pset(buf, x, PH - 3, 3);
  }
}

function drawSteppedCloud(buf, cx, cy, halfW) {
  const tiers = [
    { w: Math.floor(halfW * 0.48), dy: -6, h: 4 },
    { w: Math.floor(halfW * 0.78), dy: -3, h: 4 },
    { w: halfW, dy: 0, h: 5 },
  ];
  for (const tr of tiers) {
    prect(buf, cx - tr.w - 1, cy + tr.dy - 1, tr.w * 2 + 2, tr.h + 2, 0);
  }
  for (const tr of tiers) {
    prect(buf, cx - tr.w, cy + tr.dy, tr.w * 2, tr.h, 4);
  }
  prect(buf, cx - halfW, cy + 3, halfW * 2, 2, 3);
}

/**
 * Draws the Spinning Diamond Gold Coin (with 4-color NES palette cycling),
 * 1-frame hit-stop impact, big 4-way `+` pixel starburst, `+200` pre-3.0s bonus,
 * and Strong-Beat `1UP` with authentic Hardware OAM Even/Odd Frame Flicker on vanish!
 */
function drawDiamondCoinAndPopups(buf, localT, sceneT, gameX, isOutroThumbnail) {
  const coinCx = 124;
  const baseCy = 68;
  const HIT_T = 2.66;
  const hitCoin = isOutroThumbnail || localT >= HIT_T;

  // 4-Color NES Palette Cycling on hovering sky gems (`9 -> 10 -> 11 -> 4`)
  const gemCycleCols = [9, 10, 11, 4];
  const gemCyc = Math.floor(sceneT * 12) % 4;
  for (const [idx, gx] of [178, 198].entries()) {
    const gy = 50 + ((idx + Math.floor(sceneT * 6)) % 2);
    const gCol = gemCycleCols[(gemCyc + idx) % 4];
    const gHi = gemCycleCols[(gemCyc + idx + 1) % 4];
    for (let dy = -3; dy <= 3; dy++) {
      const w = 3 - Math.abs(dy);
      for (let dx = -w; dx <= w; dx++) {
        pset(
          buf,
          gx + dx,
          gy + dy,
          Math.abs(dx) + Math.abs(dy) === 3 ? 0 : dx <= 0 && dy <= 0 ? gHi : gCol
        );
      }
    }
  }

  // 1. Pre-strike spinning diamond-crest gold coin
  if (!hitCoin) {
    const bob = Math.round(Math.sin(sceneT * 6) * 1.5);
    const cy = baseCy + bob;
    const spinFrame = Math.floor(sceneT * 12) % 4;
    const hw = [7, 5, 2, 5][spinFrame];
    const hh = 9;
    const shineCol = gemCycleCols[(gemCyc + 2) % 4];

    for (let dy = -hh - 1; dy <= hh + 1; dy++) {
      for (let dx = -hw - 1; dx <= hw + 1; dx++) {
        const manhattan = Math.abs(dx) / (hw + 1.2) + Math.abs(dy) / (hh + 1.2);
        if (manhattan <= 1.08) {
          const inner = Math.abs(dx) / Math.max(1, hw) + Math.abs(dy) / hh;
          if (inner > 0.96 || Math.abs(dy) === hh + 1 || Math.abs(dx) === hw + 1) {
            pset(buf, coinCx + dx, cy + dy, 0);
          } else {
            const starDist = Math.abs(dx) + Math.abs(dy);
            let c = 10;
            if (dx < 0 && dy < 0 && inner > 0.65) c = 11;
            else if (dx > 0 && dy > 0 && inner > 0.68) c = 8;
            else if (hw >= 5 && (starDist === 4 || starDist === 5)) c = shineCol;
            else if (hw >= 5 && dx === 0 && dy === 0) c = 4;
            pset(buf, coinCx + dx, cy + dy, c);
          }
        }
      }
    }

    const gx = coinCx + (spinFrame % 2 === 0 ? -hw - 2 : hw + 2);
    const gy = cy - 5;
    pset(buf, gx, gy, 4);
    pset(buf, gx - 1, gy, 11);
    pset(buf, gx + 1, gy, 11);
    pset(buf, gx, gy - 1, 11);
    pset(buf, gx, gy + 1, 11);
  }

  // 2. Coin Smash -> Outlined 4-Way `+` Pixel Starburst & 8-Direction Flying Shards!
  if (isOutroThumbnail || (localT >= HIT_T && localT < 3.45)) {
    const burstAge = isOutroThumbnail ? 0.22 : localT - HIT_T;

    if (!isOutroThumbnail && burstAge < 0.34) {
      const armLen = Math.round(15 - burstAge * 18); // ~13px rays at 97.80s!
      const coreR = burstAge < 0.16 ? 3 : 2;

      prect(buf, coinCx - armLen - 1, baseCy - 2, armLen * 2 + 3, 5, 0);
      prect(buf, coinCx - 2, baseCy - armLen - 1, 5, armLen * 2 + 3, 0);
      pdisc((x, y, c) => pset(buf, x, y, c), coinCx, baseCy, coreR + 2.2, 0);

      prect(buf, coinCx - armLen, baseCy - 1, armLen * 2 + 1, 3, 10);
      prect(buf, coinCx - 1, baseCy - armLen, 3, armLen * 2 + 1, 10);
      const innerLen = Math.max(2, Math.round(armLen * 0.68));
      prect(buf, coinCx - innerLen, baseCy - 1, innerLen * 2 + 1, 3, 11);
      prect(buf, coinCx - 1, baseCy - innerLen, 3, innerLen * 2 + 1, 11);
      prect(buf, coinCx - innerLen, baseCy, innerLen * 2 + 1, 1, 4);
      prect(buf, coinCx, baseCy - innerLen, 1, innerLen * 2 + 1, 4);
      pdisc((x, y, c) => pset(buf, x, y, c), coinCx, baseCy, coreR, 4);
    }

    const rad = Math.round(8 + burstAge * 34);
    for (let i = 0; i < 8; i++) {
      const isDiag = i % 2 === 1;
      const rStep = isDiag ? Math.round(rad * 0.86) : rad + 3;
      const a = (i * Math.PI) / 4;
      const sx = coinCx + Math.round(Math.cos(a) * rStep);
      const sy = Math.max(28, baseCy + Math.round(Math.sin(a) * rStep * 0.9));

      if (burstAge < 0.52) {
        prect(buf, sx - 2, sy - 1, 5, 3, 0);
        prect(buf, sx - 1, sy - 2, 3, 5, 0);
        pset(buf, sx - 1, sy, 10);
        pset(buf, sx + 1, sy, 10);
        pset(buf, sx, sy - 1, 11);
        pset(buf, sx, sy + 1, 10);
        pset(buf, sx, sy, i % 2 === 0 ? 4 : 11);
      } else if (Math.floor(sceneT * 12 + i) % 2 === 0) {
        // Hardware OAM flicker as sparks dissipate
        pset(buf, sx, sy, i % 2 === 0 ? 11 : 10);
      }
    }
  }

  // `+200` pixel bonus strictly in `[HIT_T, 2.96)` so zero overlap with strong-beat `1UP`!
  if (!isOutroThumbnail && localT >= HIT_T && localT < 2.96) {
    const floatUp = Math.round((localT - HIT_T) * 16);
    drawPixelText(buf, '+200', coinCx + 15, baseCy - 7 - floatUp, 11, 0, 1, 4);
  }

  // 3. Strong Beat `localT = 3.00s` Giant Emerald-Lime `1UP` with Authentic OAM Sprite Flicker Vanish!
  if (isOutroThumbnail || (localT >= 3.0 && localT < 4.7)) {
    const age = isOutroThumbnail ? 0.16 : localT - 3.0;
    // After age > 1.05s (`localT > 4.05s`), blink on even/odd 12Hz frames (authentic NES OAM flicker, zero alpha!)
    const oamVisible =
      isOutroThumbnail || age < 1.05 || Math.floor(sceneT * 12) % 2 === 0;

    if (oamVisible) {
      const bounce = age < 0.12 ? Math.round(Math.sin((age / 0.12) * Math.PI) * -4) : 0;
      const lift = Math.min(20, Math.round(age * 20)) - bounce;
      const trackX = clamp(Math.round(gameX / PIX_SCALE) + 2, 95, 165);
      const popX = trackX - 18;
      const popY = Math.max(29, 50 - lift); // stays cleanly below py=26 top HUD bar!

      for (let ox = -2; ox <= 2; ox++) {
        for (let oy = -2; oy <= 2; oy++) {
          if (Math.abs(ox) + Math.abs(oy) === 0 || Math.abs(ox) + Math.abs(oy) > 3) continue;
          drawPixelText(buf, '1UP', popX + ox, popY + oy, 0, -1, 2);
        }
      }
      drawPixelText(buf, '1UP', popX, popY, 12, -1, 2, 13);

      prect(buf, popX + 4, popY, 2, 2, 4);
      prect(buf, popX + 12, popY, 2, 2, 4);
      prect(buf, popX + 26, popY, 4, 2, 4);

      if (Math.floor(sceneT * 12) % 2 === 0) {
        for (const sx of [popX - 6, popX + 39]) {
          const sy = popY + 6;
          pset(buf, sx, sy, 4);
          pset(buf, sx - 1, sy, 11);
          pset(buf, sx + 1, gyClamp(sy), 11);
          pset(buf, sx, gyClamp(sy - 1), 11);
          pset(buf, sx, gyClamp(sy + 1), 11);
        }
      }
    }
  }

  return hitCoin;
}

function gyClamp(y) {
  return clamp(y, 27, PH - 2);
}

/**
 * Draws the Native 1980s NES Top Nametable Status Bar (`py = 0..25`) right inside `frameBuf`!
 * Integrates `NO.16 · 1980S` + `8-BIT 像素游戏` (12x12 bitmap Hanzi!) alongside live
 * `PELICAN x03->x04`, `SCORE 019600->019800`, and `WORLD 16-1 / ♦x01` — 100% pure integer pixels!
 */
function drawNativeNametableHUD(buf, coinCollected, sceneT, isOneUp) {
  // Solid obsidian nametable status bar (`py = 0..23`) + 2px indigo/black bottom bevel (`py = 24..25`)
  prect(buf, 0, 0, PW, 24, 0);
  prect(buf, 0, 24, PW, 1, 1);
  prect(buf, 0, 25, PW, 1, 0);

  // Subtle gold/indigo cartridge plaque frame on left (`px = 2..95, py = 1..22`)
  prect(buf, 2, 1, 93, 22, 1);
  prect(buf, 3, 2, 91, 20, 0);
  pset(buf, 2, 1, 10);
  pset(buf, 94, 1, 10);
  pset(buf, 2, 22, 10);
  pset(buf, 94, 22, 10);

  // Left Plaque Row 1 (`py = 3..9`): `NO.16  1980S`
  drawPixelText(buf, 'NO.16', 6, 3, 10, -1, 1, 11);
  drawPixelText(buf, '1980S', 61, 3, 3, -1, 1, 4);

  // Left Plaque Row 2 (`py = 10..21`): `8-BIT` + 12x12 Bitmap Hanzi `像素游戏`!
  drawPixelText(buf, '8-BIT', 6, 13, 11, -1, 1, 4);
  drawBitmapHanzi(buf, '像素游戏', 40, 10, 4, 11, -1);

  // Right 3 Arcade Telemetry Columns (`px = 100..247`)
  const scoreStr = coinCollected ? '019800' : '019600';
  const coinStr = coinCollected ? 'x01' : 'x00';
  const livesStr = isOneUp ? 'x04' : 'x03';

  // Col 1 (`px = 100..143`): PELICAN + [bird]x03/x04
  drawPixelText(buf, 'PELICAN', 100, 3, 10, -1, 1, 11);
  // Mini pixel pelican life icon
  prect(buf, 101, 13, 3, 5, 4);
  pset(buf, 103, 14, 0);
  prect(buf, 104, 14, 5, 1, 10);
  prect(buf, 104, 15, 4, 2, 8);
  drawPixelText(buf, livesStr, 111, 12, isOneUp ? 13 : 4, -1, 1);

  // Col 2 (`px = 148..190`): SCORE + 019600/019800
  drawPixelText(buf, 'SCORE', 151, 3, 4, -1, 1);
  drawPixelText(buf, scoreStr, 148, 12, 4, -1, 1);

  // Col 3 (`px = 197..246`): WORLD 16-1 + [cycling ♦]x00/x01
  drawPixelText(buf, 'WORLD 16', 198, 3, 13, -1, 1);
  const cycCols = [9, 10, 11, 4];
  const cyc = Math.floor(sceneT * 12) % 4;
  const hcx = 203;
  const hcy = 15;
  for (let dy = -2; dy <= 2; dy++) {
    const w = 2 - Math.abs(dy);
    for (let dx = -w; dx <= w; dx++) {
      pset(buf, hcx + dx, hcy + dy, dx <= 0 && dy <= 0 ? cycCols[(cyc + 1) % 4] : cycCols[cyc]);
    }
  }
  drawPixelText(buf, coinStr, 209, 12, 11, -1, 1);
  drawPixelText(buf, '-1', 233, 12, 13, -1, 1);
}

/**
 * Stamps a hand-pixeled ASCII sprite template onto `sset` with optional 1-frame NES Hit-Stop Palette Flash!
 */
function stampSpriteRows(rows, leftX, topY, colorMap) {
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch !== '.' && colorMap[ch] !== undefined) {
        sset(leftX + c, topY + r, colorMap[ch]);
      }
    }
  }
}

/**
 * Draws the Hand-Pixeled Sprite Pelican & Bicycle into `spriteBuf` using clean fixed-slope pixel clusters
 * and hand-tuned wheel/torso/wing sprite templates (ZERO float midpoint-circle horns or `pline` jaggies!).
 */
function drawPixelSpritePelican(
  buf,
  rig,
  isCelebrating,
  isAirborne = false,
  flapIdx = 0,
  hitFlash = false
) {
  spriteBuf.fill(0);

  // Anchor whole bike to integer pixel grid from `rig.root` so tube slopes NEVER shimmer/crawl!
  const rootPx = Math.round(rig.root.x / PIX_SCALE);
  const rootPy = Math.round(rig.root.y / PIX_SCALE);
  // Subtle discrete tilt offset (-2, -1, 0, +1, +2 px) during pit jump arc
  const tiltStep = isAirborne ? clamp(Math.round(rig.root.slope * 14), -3, 3) : 0;

  const rw = { x: rootPx - 21, y: rootPy - 11 - tiltStep };
  const fw = { x: rootPx + 22, y: rootPy - 11 + tiltStep };
  const bb = { x: rootPx - 2, y: rootPy - 10 };
  const seat = { x: rootPx - 10, y: rootPy - 26 - Math.round(tiltStep * 0.5) };
  const hTop = { x: rootPx + 14, y: rootPy - 26 + Math.round(tiltStep * 0.5) };
  const hBot = { x: rootPx + 16, y: rootPy - 19 + Math.round(tiltStep * 0.5) };
  const saddle = { x: seat.x - 2, y: seat.y - 4 };
  const stem = { x: hTop.x - 1, y: hTop.y - 6 };
  const grip = { x: stem.x - 5, y: stem.y - 1 };

  // Palette mapping (with 1-Frame NES Hit-Stop Gold/White Flash right on coin impact!)
  const colFrame = hitFlash ? 11 : 15;
  const colHi = 4;
  const colWhite = hitFlash ? 11 : 4;
  const colShade = hitFlash ? 4 : 5;
  const colBeak = hitFlash ? 4 : 10;
  const colPouch = hitFlash ? 11 : 8;
  const colPouchDark = hitFlash ? 10 : 7;

  // 1. Hand-Pixeled 21x21 Circular Wheels (3 discrete spoke phases!)
  const spokePhase =
    ((Math.floor((rig.wheelAngle / (Math.PI / 6)) % 3) + 3) % 3);
  const wheelTemplate = WHEEL_SPRITES_21[spokePhase];
  const wheelColorMap = {
    T: hitFlash ? 10 : 1,
    R: colShade,
    S: colHi,
    s: hitFlash ? 11 : 6,
    H: 4,
  };
  stampSpriteRows(wheelTemplate, rw.x - 10, rw.y - 10, wheelColorMap);
  stampSpriteRows(wheelTemplate, fw.x - 10, fw.y - 10, wheelColorMap);

  // 2. 8-Step Quantized Discrete Pixel Crank & Far Leg (eliminates float jaggie crawl!)
  const crankStep = ((Math.round((rig.pedalAngle / (Math.PI * 2)) * 8) % 8) + 8) % 8;
  const CRANK_OFFSETS = [
    [5, 0],
    [4, 4],
    [0, 5],
    [-4, 4],
    [-5, 0],
    [-4, -4],
    [0, -5],
    [4, -4],
  ];
  const [rCx, rCy] = CRANK_OFFSETS[crankStep];
  const [lCx, lCy] = CRANK_OFFSETS[(crankStep + 4) % 8];
  const rPedal = { x: bb.x + rCx, y: bb.y + rCy };
  const lPedal = { x: bb.x + lCx, y: bb.y + lCy };

  const toP = (pt) => ({ x: Math.round(pt.x / PIX_SCALE), y: Math.round(pt.y / PIX_SCALE) });
  const lHip = { x: seat.x + 1, y: seat.y - 5 };
  const lKnee = toP(rig.leftKnee);
  pline(sset, bb.x, bb.y, lPedal.x, lPedal.y, 6, 1);
  pline(sset, lHip.x, lHip.y, lKnee.x, lKnee.y, colPouchDark, 2);
  pline(sset, lKnee.x, lKnee.y, lPedal.x, lPedal.y - 1, colPouchDark, 2);
  for (let dx = -1; dx <= 3; dx++) sset(lPedal.x + dx, lPedal.y, colPouchDark);

  // 3. Hand-Clustered Bicycle Chainring & Fixed-Slope Ruby-White Diamond Frame
  // Chainring & chain
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      if (Math.abs(dx) + Math.abs(dy) <= 3) sset(bb.x + dx, bb.y + dy, 6);
    }
  }
  pline(sset, rw.x + 1, rw.y - 2, bb.x, bb.y - 2, 6, 1);
  pline(sset, rw.x + 1, rw.y + 2, bb.x, bb.y + 2, 6, 1);

  // Clean clustered frame tubes + crisp 1px white top-tube arcade highlight
  pline(sset, rw.x, rw.y, seat.x, seat.y, colFrame, 2);
  pline(sset, seat.x, seat.y, bb.x, bb.y, colFrame, 2);
  pline(sset, rw.x, rw.y, bb.x, bb.y, colFrame, 1);
  pline(sset, seat.x, seat.y, hTop.x, hTop.y, colFrame, 2);
  pline(sset, seat.x + 2, seat.y, hTop.x - 1, hTop.y, colHi, 1); // crisp horizontal top-tube shine!
  pline(sset, hTop.x, hTop.y, hBot.x, hBot.y, colFrame, 2);
  pline(sset, hBot.x, hBot.y, bb.x, bb.y, colFrame, 2);
  pline(sset, hBot.x, hBot.y, fw.x, fw.y, colFrame, 2);

  // Seatpost, leather saddle & swept cruiser handlebars
  pline(sset, seat.x, seat.y, saddle.x, saddle.y, colShade, 1);
  for (let dx = -3; dx <= 4; dx++) {
    sset(saddle.x + dx, saddle.y, 1);
    sset(saddle.x + dx, saddle.y + 1, 0);
  }
  pline(sset, hTop.x, hTop.y, stem.x, stem.y, colShade, 2);
  pline(sset, stem.x, stem.y, grip.x, grip.y, colHi, 2);
  sset(grip.x - 1, grip.y, 8); // retro orange handlebar grip!
  sset(grip.x, grip.y, 8);

  // 4. Hand-Pixeled Plump Pelican Torso + Pixel-Clustered S-Neck!
  const bounceY = (crankStep % 4 === 1 || crankStep % 4 === 2) && !isAirborne ? -1 : 0;
  const torsoLeft = seat.x - 12;
  const torsoTop = seat.y - 16 + bounceY;
  stampSpriteRows(TORSO_SPRITE, torsoLeft, torsoTop, { W: colWhite, G: colShade });

  // Clean pixel-clustered S-curve neck rising from chest to head
  const chestX = torsoLeft + 21;
  const chestY = torsoTop + 4;
  const headX = chestX + (isAirborne ? 1 : 0);
  const headY = chestY - 13 + bounceY;

  const neckClusters = [
    [0, 0],
    [1, -2],
    [1, -4],
    [0, -6],
    [-1, -8],
    [-1, -10],
    [0, -12],
  ];
  for (const [nx, ny] of neckClusters) {
    const px = chestX + nx;
    const py = chestY + ny;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        sset(px + dx, py + dy, dx === -2 ? colShade : colWhite);
      }
    }
  }

  // 5. Hand-Pixeled Pelican Head, Crest Tuft, Expressive Eye & Bouncing Orange Gular Pouch!
  // 9x8 pixel-clustered head dome + goldenrod crown crest
  for (let dy = -4; dy <= 3; dy++) {
    const hw = dy <= -3 || dy === 3 ? 3 : 4;
    for (let dx = -hw; dx <= hw; dx++) {
      sset(headX + dx, headY + dy, dx === -hw ? colShade : colWhite);
    }
  }
  // Pointed pixel feather crest tuft
  sset(headX - 4, headY - 4, colBeak);
  sset(headX - 5, headY - 5, colBeak);
  sset(headX - 6, headY - 5, colWhite);
  sset(headX - 5, headY - 3, colWhite);
  sset(headX - 6, headY - 3, colShade);

  // Elastic Orange Gular Throat Pouch + Hooked Goldenrod Upper Mandible (18px iconic beak!)
  const beakX0 = headX + 3;
  const beakLen = 17;
  const pouchSway = ((crankStep === 2 || crankStep === 6) ? 1 : 0) + (isCelebrating ? 1 : 0);
  const maxDepth = 7 + pouchSway;

  for (let bx = 0; bx <= beakLen; bx++) {
    const u = bx / beakLen;
    const px = beakX0 + bx;
    const topPy = headY - 2 + Math.floor(u * 1.6);
    const pouchCurve = Math.round(Math.sin(Math.pow(u, 0.82) * Math.PI) * maxDepth);
    const botPy = topPy + 1 + pouchCurve;

    // Upper goldenrod mandible ridge (2px crisp bar + hooked nail tip!)
    sset(px, topPy - 1, bx < 12 ? 11 : colBeak);
    sset(px, topPy, colBeak);

    // Elastic tangerine gular pouch with pixel-clustered arcade highlight & checkerboard fold!
    for (let py = topPy + 1; py <= botPy; py++) {
      let c = colPouch;
      if (py === botPy && pouchCurve >= 2) {
        c = colPouchDark;
      } else if (py === botPy - 1 && pouchCurve >= 4 && ((px + py) & 1) === 0) {
        c = colPouchDark; // classic 8-bit checkerboard shadow fold
      } else if (py === topPy + 1 && bx >= 3 && bx <= 10) {
        c = bx >= 5 && bx <= 8 ? 4 : 11; // bright white + starlight gold pixel cluster shine!
      } else if (py === topPy + 2 && bx >= 4 && bx <= 9 && pouchCurve >= 4) {
        c = 11;
      }
      sset(px, py, c);
    }
  }
  // Iconic 2px downward beak hook at tip
  sset(beakX0 + beakLen + 1, headY, colBeak);
  sset(beakX0 + beakLen + 1, headY + 1, colPouch);
  sset(beakX0 + beakLen, headY + 2, colPouchDark);

  // Expressive 8-bit arcade eye (`^` joyful arc during coin/1UP celebration!)
  const ex = headX + 1;
  const ey = headY - 2;
  if (isCelebrating) {
    sset(ex - 1, ey + 1, 0);
    sset(ex, ey, 0);
    sset(ex + 1, ey + 1, 0);
  } else {
    sset(ex, ey, 4); // 1x1 crisp white pupil glint
    sset(ex + 1, ey, 0);
    sset(ex, ey + 1, 0);
    sset(ex + 1, ey + 1, 0);
  }

  // 6. Near (Right) Quantized IK Leg & Webbed Orange Foot
  const rHip = { x: seat.x + 2, y: seat.y - 4 };
  const rKnee = toP(rig.rightKnee);
  pline(sset, bb.x, bb.y, rPedal.x, rPedal.y, colShade, 1);
  pline(sset, rHip.x, rHip.y, rKnee.x, rKnee.y, colPouch, 2);
  pline(sset, rKnee.x, rKnee.y, rPedal.x, rPedal.y - 1, colPouch, 2);
  for (let dx = -1; dx <= 4; dx++) sset(rPedal.x + dx, rPedal.y, colPouch);
  for (let dx = -2; dx <= 2; dx++) sset(rPedal.x + dx, rPedal.y + 1, colShade);

  // 7. Hand-Pixeled Wing Sprite Sheet (4-frame airborne flap cycle!)
  const shX = torsoLeft + 13;
  const shY = torsoTop + 5;
  let wingDef = WING_SPRITES.ride;
  if (isAirborne) {
    if (flapIdx === 1) wingDef = WING_SPRITES.up;
    else if (flapIdx === 2) wingDef = WING_SPRITES.down;
    else wingDef = WING_SPRITES.glide;
  }
  stampSpriteRows(wingDef.rows, shX - wingDef.ox, shY - wingDef.oy, {
    W: colWhite,
    G: colShade,
    I: hitFlash ? 10 : 1,
  });

  // Crisp pixel wind-flap motion ticks behind wing during jump
  if (isAirborne && (flapIdx === 1 || flapIdx === 2)) {
    const wy = flapIdx === 1 ? shY - 12 : shY + 9;
    pset(buf, shX - 14, wy, 4);
    pset(buf, shX - 16, wy + (flapIdx === 1 ? 2 : -2), 4);
  }

  // 8. Composite `spriteBuf` onto `buf` with razor-sharp 4-connected 1px `#0d1021` pixel outline!
  for (let y = 26; y < PH - 1; y++) {
    const row = y * PW;
    for (let x = 0; x < PW; x++) {
      const idx = row + x;
      const val = spriteBuf[idx];
      if (val > 0) {
        buf[idx] = val - 1;
      } else if (
        (x > 0 && spriteBuf[idx - 1] > 0) ||
        (x + 1 < PW && spriteBuf[idx + 1] > 0) ||
        spriteBuf[idx - PW] > 0 ||
        spriteBuf[idx + PW] > 0
      ) {
        buf[idx] = 0;
      }
    }
  }
}

/**
 * Bakes the authentic 1980s Consumer Trinitron / Shadow-Mask CRT TV Overlay Mask (`1000x1000`):
 * - 4px-aligned RGB vertical phosphor subpixel triads (`6.5%` alpha)
 * - 1px dark scanline beam gap every 4px (`10.5%` alpha)
 * - Ultra-subtle `≤1.4%` extreme-corner bezel vignette ONLY for `r > 600` from center
 *   so `(0, 680)` and `(1000, 680)` (`r = 531`) have 0% darkening and 100% exact road alignment!
 */
function getBakedCRTMask(kit) {
  return kit.bake2D('s16_crt_mask_r3', (g, ctx) => {
    ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

    // 1. Subtle RGB Aperture-Grille Vertical Phosphor Subpixel Triads inside each 4px column
    for (let x = 0; x < PANEL_SIZE; x += 4) {
      ctx.fillStyle = 'rgba(255, 64, 64, 0.045)';
      ctx.fillRect(x, 0, 1, PANEL_SIZE);
      ctx.fillStyle = 'rgba(64, 255, 96, 0.045)';
      ctx.fillRect(x + 1, 0, 1, PANEL_SIZE);
      ctx.fillStyle = 'rgba(64, 128, 255, 0.045)';
      ctx.fillRect(x + 2, 0, 1, PANEL_SIZE);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.055)';
      ctx.fillRect(x + 3, 0, 1, PANEL_SIZE);
    }

    // 2. Crisp 240p/250p Horizontal CRT Scanline Gaps (every 4th screen pixel row)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.11)';
    for (let y = 3; y < PANEL_SIZE; y += PIX_SCALE) {
      ctx.fillRect(0, y, PANEL_SIZE, 1);
    }

    // 3. Strictly Corner-Only `≤1.4%` TV Bezel Shadow (`r > 600` -> 0.0 at `(0, 680)` & `(1000, 680)`!)
    const vig = ctx.createRadialGradient(500, 500, 605, 500, 500, 708);
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(0.7, 'rgba(0, 0, 0, 0.08)');
    vig.addColorStop(1, 'rgba(0, 0, 0, 0.24)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, PANEL_SIZE, PANEL_SIZE);
  });
}

/**
 * Converts `frameBuf` (`250x250` 16-color indices) into `ppuU32` with authentic 1-pixel horizontal
 * NTSC Composite Video Subcarrier Chroma/Luma Edge Fringing (analog RF/AV console warmth!).
 */
function scanoutNTSCComposite() {
  for (let y = 0; y < PH; y++) {
    const row = y * PW;
    for (let x = 0; x < PW; x++) {
      const idx = row + x;
      const c = frameBuf[idx];
      const rgb = PALETTE_RGB[c];
      let r = rgb[0];
      let g = rgb[1];
      let b = rgb[2];

      if (x > 0 && x < PW - 1) {
        const cL = frameBuf[idx - 1];
        const cR = frameBuf[idx + 1];
        if (cL !== c || cR !== c) {
          const rgbL = PALETTE_RGB[cL];
          const rgbR = PALETTE_RGB[cR];
          const lum = r * 0.3 + g * 0.59 + b * 0.11;
          const lumL = rgbL[0] * 0.3 + rgbL[1] * 0.59 + rgbL[2] * 0.11;
          const lumR = rgbR[0] * 0.3 + rgbR[1] * 0.59 + rgbR[2] * 0.11;
          // Subtle horizontal composite luma bandwidth roll-off + NTSC YIQ warm/cool edge fringe!
          const dL = lumL - lum;
          const dR = lum - lumR;
          const phase = ((x + y) & 1) === 0 ? 1 : -1;
          r = clamp((r * 0.89 + (rgbL[0] + rgbR[0]) * 0.055 + (dL * 0.09) * phase) | 0, 0, 255);
          g = clamp((g * 0.91 + (rgbL[1] + rgbR[1]) * 0.045) | 0, 0, 255);
          b = clamp((b * 0.89 + (rgbL[2] + rgbR[2]) * 0.055 - (dR * 0.09) * phase) | 0, 0, 255);
        }
      }

      ppuU32[idx] = ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0;
    }
  }
}

export function render(kit, slot, scene, params) {
  const {
    t,
    localT,
    pelicanLocalX,
    pedalAngle,
    speedScale = 1.0,
    isOutroThumbnail = false,
  } = params;

  ensurePPU();

  // Strictly quantize internal game clock to 12 Hz (`quantizeTime(t, 12)`)
  const sceneT = quantizeTime(t, 12);
  const qLocalT = quantizeTime(localT, 12);
  // Quantize X & pedal cadence inside [132..868] while keeping cross-frame straddle [<=132] & [>=868] C1 smooth!
  const interiorBlend = smoothstep(132, 180, pelicanLocalX) * smoothstep(868, 820, pelicanLocalX);
  const rawQPedal = (sceneT / BEAT_SEC) * Math.PI;
  const qPedalAngle = isOutroThumbnail
    ? pedalAngle
    : lerp(pedalAngle, rawQPedal, interiorBlend);
  const steppedX = Math.round(pelicanLocalX / PIX_SCALE) * PIX_SCALE;
  const gameX = isOutroThumbnail
    ? pelicanLocalX
    : lerp(pelicanLocalX, steppedX, interiorBlend);

  // 1. Copy pre-baked 16-color 250x250 CHR-ROM tilemap level into `frameBuf`
  frameBuf.set(getStaticLevelBuf());

  // 2. Palette-cycled subterranean abyss waterfall + drifting stepped pixel clouds
  drawAbyssPaletteCycledWaterfall(frameBuf, sceneT);

  const cloudDrift = Math.floor(sceneT * 3) % PW;
  const cloudSeeds = [
    { x: 36, y: 40, w: 17 },
    { x: 102, y: 36, w: 13 },
    { x: 172, y: 44, w: 18 },
    { x: 228, y: 37, w: 12 },
  ];
  for (const cl of cloudSeeds) {
    const cx = (((cl.x - cloudDrift) % PW) + PW) % PW;
    drawSteppedCloud(frameBuf, cx, cl.y, cl.w);
  }

  // Animated crimson pixel pennant flag fluttering on right-platform obelisk
  const flagFrame = Math.floor(sceneT * 8) % 3;
  prect(frameBuf, 200, GY - 34, 1, 9, 0);
  for (let fx = 0; fx < 9; fx++) {
    const wave = (fx + flagFrame) % 3 === 0 ? 1 : 0;
    const fh = Math.max(1, 5 - Math.floor(fx / 2));
    prect(frameBuf, 201 + fx, GY - 34 + wave, 1, fh, 15);
  }

  // 3. Parabolic Pit Jump (with 1-Frame NES Hit-Stop Freeze & Palette Flash at coin smash `2.66..2.74s`!)
  const jumpX0 = 356;
  const jumpX1 = 636;
  const hitFlash = !isOutroThumbnail && qLocalT >= 2.66 && qLocalT < 2.74;
  // Classic 1-frame NES hit-stop holds X steady for 1 quantized tick on coin impact
  const effectiveX = hitFlash ? Math.round((pelicanLocalX - 8) / PIX_SCALE) * PIX_SCALE : gameX;
  const isAirborne = !isOutroThumbnail && effectiveX > jumpX0 && effectiveX < jumpX1;

  if (pelicanLocalX > -240 && pelicanLocalX < PANEL_SIZE + 240) {
    let roadY = ROAD_EDGE_Y;
    let slope = 0;

    if (isAirborne) {
      const ju = (effectiveX - jumpX0) / (jumpX1 - jumpX0);
      const lift = 4 * ju * (1 - ju) * 156;
      roadY = ROAD_EDGE_Y - lift;
      slope = -0.28 * (1 - 2 * ju);
    }

    // Cliff takeoff & landing pixel dust puffs
    if (!isOutroThumbnail && qLocalT >= 2.12 && qLocalT < 2.55) {
      const du = (qLocalT - 2.12) / 0.43;
      const dr = Math.max(1, Math.round((1 - du) * 3));
      pdisc((x, y, c) => pset(frameBuf, x, y, c), 98 - Math.round(du * 6), GY - 2 - Math.round(du * 4), dr, 4);
      pdisc((x, y, c) => pset(frameBuf, x, y, c), 101 - Math.round(du * 3), GY - 1 - Math.round(du * 2), Math.max(1, dr - 1), 5);
    }
    if (!isOutroThumbnail && qLocalT >= 3.72 && qLocalT < 4.12) {
      const du = (qLocalT - 3.72) / 0.4;
      const dr = Math.max(1, Math.round((1 - du) * 3));
      pdisc((x, y, c) => pset(frameBuf, x, y, c), 153 + Math.round(du * 6), GY - 2 - Math.round(du * 4), dr, 4);
      pdisc((x, y, c) => pset(frameBuf, x, y, c), 149 - Math.round(du * 4), GY - 2 - Math.round(du * 3), Math.max(1, dr - 1), 5);
    }

    // Ground pixel drop-shadow on cobble platforms
    const shadowPx = Math.round(effectiveX / PIX_SCALE);
    if (shadowPx < PIT_X0 - 4 || shadowPx > PIT_X1 + 4) {
      prect(frameBuf, shadowPx - 24, GY, 48, 2, 0);
    }

    const rig = computePelicanRig({
      x: effectiveX,
      y: roadY,
      pedalAngle: qPedalAngle,
      scale: 1.0,
      slope,
      speedScale,
      poseMode: 'jump',
      time: sceneT,
    });

    const isCelebrating = isOutroThumbnail || (localT >= 2.66 && localT < 3.65);
    const flapIdx = Math.floor(sceneT * 12) % 4;
    drawPixelSpritePelican(frameBuf, rig, isCelebrating, isAirborne, flapIdx, hitFlash);
  }

  // 4. Spinning Diamond Coin, 4-Way Starburst Explosion & OAM-Flickering "1UP"!
  const coinCollected = drawDiamondCoinAndPopups(
    frameBuf,
    isOutroThumbnail ? 3.0 : qLocalT,
    sceneT,
    effectiveX,
    isOutroThumbnail
  );

  // 5. Native Top NES Nametable Status Bar (`NO.16 1980S | 8-BIT 像素游戏 | PELICAN | SCORE | WORLD 16-1`)
  const isOneUp = isOutroThumbnail || localT >= 3.0;
  drawNativeNametableHUD(frameBuf, coinCollected, sceneT, isOneUp);

  // 6. NTSC Composite Scanout + 4x Nearest-Neighbor Upscale + Consumer CRT Phosphor Bloom & Mask!
  const ctx = slot.g2d.drawingContext;
  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  if (ppuCtx && ppuImageData && ppuCanvas) {
    scanoutNTSCComposite();
    ppuCtx.putImageData(ppuImageData, 0, 0);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(ppuCanvas, 0, 0, PW, PH, 0, 0, PANEL_SIZE, PANEL_SIZE);

    // Subtle CRT phosphor beam-bloom around bright white/gold pixels (authentic Trinitron glow!)
    if (bloomCtx && bloomCanvas) {
      bloomCtx.save();
      bloomCtx.clearRect(0, 0, PW, PH);
      if ('filter' in bloomCtx) {
        bloomCtx.filter = 'blur(2.2px)';
      }
      bloomCtx.drawImage(ppuCanvas, 0, 0);
      bloomCtx.restore();

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.085;
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(bloomCanvas, 0, 0, PW, PH, 0, 0, PANEL_SIZE, PANEL_SIZE);
      ctx.restore();
    }
  }

  // Static baked RGB Aperture-Grille Phosphor Triads + Scanlines + Strict Corner-Only Vignette
  const crtMask = getBakedCRTMask(kit);
  ctx.drawImage(crtMask.canvas, 0, 0);

  // 7. Preserve Outro 7x3 Gallery Thumbnail Strip ONLY (`!isOutroThumbnail` has ZERO vector overlay!)
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(13, 16, 33, 0.86)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.fillStyle = '#f8b800';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 4);
    ctx.fillStyle = '#fcfcfc';
    ctx.font = '700 48px "PelicanMono", "PelicanSerif", monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} ${scene.zh}`, 36, PANEL_SIZE - 48);
  }

  ctx.restore();
}
