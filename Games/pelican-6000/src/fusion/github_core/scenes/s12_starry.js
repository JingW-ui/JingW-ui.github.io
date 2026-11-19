// src/scenes/s12_starry.js
// #12 梵高《星月夜》 (1889 · Vincent van Gogh Post-Impressionist Impasto Masterpiece — r3)
// - Physical Medium: Coarse raw linen weave + 16 pigments x 8 asymmetric hog-bristle dry-scrape,
//   palette-knife ridge, curved comma, and wet-on-wet marled oil impasto strokes with turbulent
//   non-collinear shingling (zero digital bead-chains, zero roundRect/setLineDash/radial gradients!).
// - Landmarks (#85 Refined): Asymmetric monumental Gothic flame Cypress (billowing wide base splitting
//   into 4 staggered writhing flame spires piercing the cosmos — zero symmetric corn-cob!), rolling
//   Alpilles mountains, Saint-Rémy spire & glowing cottage windows, fat sculpted C-crescent moon & 11 stars.
// - Artwork-Native Bird & Bike (#74 & #85 Refined):
//   * Front & Rear Wheels = Two blazing 4-arm logarithmic-spiral Nebula Fire Vortices (zero rigid outer tire!)
//     anchored over deep Prussian-dark road shadows;
//   * Frame = Writhing deep-Prussian, cypress-emerald & burnt-umber flame-wood branches with bright
//     Chrome-Yellow / Turquoise palette-knife top catchlight ridges & a blazing golden star-core crankset!
// - Pure Museum Canvas: Zero top-left UI sticker box (`wallPlacard` sits on outer gallery wall).

import {
  PANEL_SIZE,
  clamp,
  lerp,
  smoothstep,
} from '../beat/timeline.js';
import { computePelicanRig } from '../rig/pelican.js';

const ROAD_ARCH_H = -8; // Gentle Provençal lane dip, strictly y=680 & slope=0 at x=0 and x=1000

const C = {
  PRUSSIAN_DARK: 0,
  PRUSSIAN: 1,
  ULTRAMARINE: 2,
  COBALT: 3,
  CERULEAN: 4,
  TURQUOISE: 5,
  PALE_ICE: 6,
  TITANIUM: 7,
  NAPLES_YELLOW: 8,
  LEMON_YELLOW: 9,
  CHROME_YELLOW: 10,
  CADMIUM_ORANGE: 11,
  CADMIUM_RED: 12,
  CYPRESS_DARK: 13,
  CYPRESS_OLIVE: 14,
  BURNT_UMBER: 15,
};

// Each pigment carries a secondary `marl` wet-on-wet streak color for unmixed brush authenticity!
const PALETTE_SPEC = [
  { base: '#061229', hi: '#1a3668', lo: '#020610', marl: '#142f5e' }, // 0 PRUSSIAN_DARK
  { base: '#0f2752', hi: '#2b5291', lo: '#051126', marl: '#1e4b8f' }, // 1 PRUSSIAN
  { base: '#1b4285', hi: '#4374c2', lo: '#0b214a', marl: '#2b8a85' }, // 2 ULTRAMARINE
  { base: '#2b65b5', hi: '#649fe8', lo: '#143a70', marl: '#88bff2' }, // 3 COBALT
  { base: '#5092d4', hi: '#8ec4f5', lo: '#285a8f', marl: '#fde452' }, // 4 CERULEAN
  { base: '#2b8a85', hi: '#64c4bd', lo: '#134c49', marl: '#f6e49b' }, // 5 TURQUOISE
  { base: '#a6dbd4', hi: '#e3faf6', lo: '#649e97', marl: '#ffffff' }, // 6 PALE_ICE
  { base: '#f8f5e6', hi: '#ffffff', lo: '#bfb8a2', marl: '#a6dbd4' }, // 7 TITANIUM
  { base: '#f6e49b', hi: '#fff9d9', lo: '#bfa756', marl: '#ffffff' }, // 8 NAPLES_YELLOW
  { base: '#fde452', hi: '#fffbb8', lo: '#c4a516', marl: '#ffffff' }, // 9 LEMON_YELLOW
  { base: '#f5b61e', hi: '#ffe585', lo: '#ad7506', marl: '#eb781e' }, // 10 CHROME_YELLOW
  { base: '#eb781e', hi: '#ffb363', lo: '#994106', marl: '#fde452' }, // 11 CADMIUM_ORANGE
  { base: '#d93f22', hi: '#ff7d5e', lo: '#851908', marl: '#f5b61e' }, // 12 CADMIUM_RED
  { base: '#091b12', hi: '#234533', lo: '#020905', marl: '#693919' }, // 13 CYPRESS_DARK
  { base: '#264421', hi: '#4e7845', lo: '#10210d', marl: '#2b8a85' }, // 14 CYPRESS_OLIVE
  { base: '#693919', hi: '#a36336', lo: '#361a07', marl: '#eb781e' }, // 15 BURNT_UMBER
];

const VARIANTS = 8;
const CELL_W = 72;
const CELL_H = 32;

const STARS_11 = [
  { x: 282, y: 352, r: 47, dir: 1, tier: 3 },  // 1. Blazing white-gold Venus beside Cypress!
  { x: 578, y: 144, r: 34, dir: 1, tier: 2 },  // 2. Major upper-center star
  { x: 354, y: 158, r: 31, dir: -1, tier: 2 }, // 3. Major upper-left-center star
  { x: 942, y: 288, r: 31, dir: 1, tier: 2 },  // 4. Major right-flank star
  { x: 64, y: 80, r: 21, dir: 1, tier: 1 },    // 5. Medium star left of Cypress tip
  { x: 734, y: 164, r: 20, dir: -1, tier: 1 }, // 6. Medium star left of Moon
  { x: 828, y: 354, r: 21, dir: -1, tier: 1 }, // 7. Medium star above village
  { x: 394, y: 412, r: 19, dir: -1, tier: 1 }, // 8. Medium star above valley
  { x: 214, y: 164, r: 13, dir: -1, tier: 0 }, // 9. Delicate starlet
  { x: 602, y: 404, r: 13, dir: 1, tier: 0 },  // 10. Delicate starlet near church spire
  { x: 40, y: 284, r: 12, dir: 1, tier: 0 },   // 11. Delicate starlet left edge
];

function sampleStarryRoad(kit, x) {
  return kit.sampleRoad(clamp(x, 0, PANEL_SIZE), ROAD_ARCH_H);
}

function hash11(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

/**
 * Bakes 16 Pigments x 8 Asymmetric Oil Impasto Brush & Palette-Knife Variants:
 * 0: Splayed hog-bristle with dry-scrape tail (猪鬃分叉干擦飞白)
 * 1: Palette-knife thick wedge with razor specular ridge & heavy cast-shadow lip (刮刀堆膏刀脊)
 * 2: Curved turbulent comma stroke (旋风微弯逗号笔)
 * 3: Short chunky square-ferrule dab (短促方头点彩笔)
 * 4: Wet-on-wet two-tone marled bristle stroke (湿碰湿双色拉丝笔)
 * 5: Tapered flame-tongue impasto lick (火焰尖梢舔舐笔)
 * 6: Ragged split-bristle dry drag (粗亚麻齿纹断续枯擦笔)
 * 7: Heavy loaded impasto impasto-clump (厚堆油彩疙瘩核)
 */
function getImpastoAtlas(kit) {
  return kit.bake2D(
    's12_impasto_atlas_r3',
    (_g, ctx, rng) => {
      ctx.clearRect(0, 0, CELL_W * VARIANTS, CELL_H * PALETTE_SPEC.length);

      for (let idx = 0; idx < PALETTE_SPEC.length; idx++) {
        const spec = PALETTE_SPEC[idx];
        for (let v = 0; v < VARIANTS; v++) {
          const ox = v * CELL_W;
          const oy = idx * CELL_H;
          const cx = ox + CELL_W * 0.5;
          const cy = oy + CELL_H * 0.5;

          ctx.save();
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          if (v === 1) {
            // Variant 1: Palette-Knife Wedge (sharp straight-scraped top ridge + thick bottom impasto lip!)
            ctx.fillStyle = spec.lo;
            ctx.globalAlpha = 0.88;
            ctx.beginPath();
            ctx.moveTo(cx - 29, cy + 1);
            ctx.lineTo(cx + 26, cy - 3);
            ctx.lineTo(cx + 30, cy + 8.5);
            ctx.lineTo(cx - 25, cy + 10.5);
            ctx.closePath();
            ctx.fill();

            ctx.globalAlpha = 0.99;
            ctx.fillStyle = spec.base;
            ctx.beginPath();
            ctx.moveTo(cx - 30, cy - 4.5);
            ctx.lineTo(cx + 28, cy - 7.5);
            ctx.lineTo(cx + 29, cy + 5.5);
            ctx.quadraticCurveTo(cx, cy + 9.5, cx - 27, cy + 6.5);
            ctx.closePath();
            ctx.fill();

            // Razor-bright palette-knife grazing highlight crest!
            ctx.strokeStyle = spec.hi;
            ctx.lineWidth = 2.8;
            ctx.globalAlpha = 0.90;
            ctx.beginPath();
            ctx.moveTo(cx - 28, cy - 4.0);
            ctx.lineTo(cx + 26, cy - 6.8);
            ctx.stroke();
          } else if (v === 2) {
            // Variant 2: Curved Turbulent Comma Stroke (arched hog-bristle follow-through)
            for (const pass of [
              { dy: 2.4, col: spec.lo, w: 12.5, a: 0.84 },
              { dy: 0, col: spec.base, w: 11.5, a: 0.98 },
              { dy: -2.2, col: spec.hi, w: 3.2, a: 0.72 },
            ]) {
              ctx.strokeStyle = pass.col;
              ctx.lineWidth = pass.w;
              ctx.globalAlpha = pass.a;
              ctx.beginPath();
              ctx.moveTo(cx - 26, cy + 4 + pass.dy);
              ctx.quadraticCurveTo(cx - 2, cy - 9 + pass.dy, cx + 26, cy + 3 + pass.dy);
              ctx.stroke();
            }
          } else if (v === 5) {
            // Variant 5: Asymmetric Flame-Tongue Lick (thick bulbous root -> sharp whipping tip)
            ctx.fillStyle = spec.lo;
            ctx.globalAlpha = 0.85;
            ctx.beginPath();
            ctx.moveTo(cx - 28, cy + 2);
            ctx.quadraticCurveTo(cx - 8, cy - 8, cx + 31, cy + 1.5);
            ctx.quadraticCurveTo(cx - 6, cy + 11, cx - 28, cy + 2);
            ctx.fill();

            ctx.fillStyle = spec.base;
            ctx.globalAlpha = 0.98;
            ctx.beginPath();
            ctx.moveTo(cx - 29, cy - 0.5);
            ctx.quadraticCurveTo(cx - 10, cy - 10.5, cx + 31, cy - 0.5);
            ctx.quadraticCurveTo(cx - 8, cy + 8.5, cx - 29, cy - 0.5);
            ctx.fill();

            ctx.strokeStyle = spec.hi;
            ctx.lineWidth = 2.1;
            ctx.globalAlpha = 0.76;
            ctx.beginPath();
            ctx.moveTo(cx - 24, cy - 2.8);
            ctx.quadraticCurveTo(cx - 6, cy - 6.8, cx + 22, cy - 1.0);
            ctx.stroke();
          } else {
            // Variants 0, 3, 4, 6, 7: Multi-bristle Hog-Hair Ribbons with Dry-Scrape Linen Gaps & Wet-on-Wet Marling!
            const rx = v === 3 ? 17.5 : v === 7 ? 14.5 : 28.5;
            const ry = v === 3 ? 10.8 : v === 7 ? 11.5 : 8.6;
            const dryRate = v === 6 ? 0.36 : v === 0 ? 0.18 : 0.06;

            // Thick cast shadow underneath bristle load
            ctx.fillStyle = spec.lo;
            ctx.globalAlpha = 0.82;
            ctx.beginPath();
            ctx.moveTo(cx - rx + 1, cy + 2.5);
            ctx.quadraticCurveTo(cx, cy - ry * 0.65 + 2.5, cx + rx * 0.9, cy + 2.5);
            ctx.quadraticCurveTo(cx, cy + ry * 1.15 + 2.5, cx - rx + 1, cy + 2.5);
            ctx.fill();

            // Individual hog-bristle tracks with splayed frayed tail & canvas-tooth skips!
            const bristles = 7;
            for (let b = 0; b < bristles; b++) {
              const bf = (b / (bristles - 1)) * 2 - 1; // -1..+1
              const by0 = cy + bf * ry * 0.78;
              const splayEnd = cy + bf * ry * (v === 0 || v === 6 ? 1.12 : 0.72) + (rng() - 0.5) * 2.2;
              const xStart = cx - rx + Math.abs(bf) * 3.2 + (rng() - 0.5) * 2.5;
              const xEnd = cx + rx - (rng() * (v === 0 || v === 6 ? 7.5 : 2.5));

              ctx.lineWidth = v === 7 ? 4.2 : 3.0;
              ctx.globalAlpha = 0.96;
              ctx.strokeStyle =
                v === 4 && (b === 2 || b === 4)
                  ? spec.marl // Wet-on-wet unmixed streak!
                  : bf < -0.35
                  ? spec.hi
                  : bf > 0.45
                  ? spec.lo
                  : spec.base;

              ctx.beginPath();
              const segs = 9;
              let penDown = false;
              for (let s = 0; s <= segs; s++) {
                const u = s / segs;
                if (u > 0.55 && rng() < dryRate) {
                  penDown = false;
                  continue;
                }
                const sx = lerp(xStart, xEnd, u);
                const sy = lerp(by0, splayEnd, u) + Math.sin(u * Math.PI) * (-1.2 + bf * 0.6);
                if (!penDown) {
                  ctx.moveTo(sx, sy);
                  penDown = true;
                } else {
                  ctx.lineTo(sx, sy);
                }
              }
              ctx.stroke();
            }

            // Thick butter-ridge impasto catchlight at brush-down head!
            ctx.fillStyle = spec.hi;
            ctx.globalAlpha = v === 7 ? 0.68 : 0.48;
            ctx.beginPath();
            ctx.moveTo(cx - rx * 0.82, cy - ry * 0.45);
            ctx.quadraticCurveTo(cx - rx * 0.1, cy - ry * 0.78, cx + rx * 0.35, cy - ry * 0.32);
            ctx.quadraticCurveTo(cx - rx * 0.2, cy - ry * 0.12, cx - rx * 0.82, cy - ry * 0.45);
            ctx.fill();
          }

          ctx.restore();
        }
      }
    },
    CELL_W * VARIANTS,
    CELL_H * PALETTE_SPEC.length
  );
}

/**
 * Fast zero-allocation transform dabber onto `ctx`.
 */
function createDabPainter(ctx, atlas) {
  const img = atlas.canvas;
  const base = ctx.getTransform();

  function dab(colIdx, x, y, angle, len, wid, variant = 0) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    const sx = (variant & 7) * CELL_W;
    const sy = colIdx * CELL_H;
    ctx.setTransform(
      base.a * c + base.c * s,
      base.b * c + base.d * s,
      base.a * -s + base.c * c,
      base.b * -s + base.d * c,
      base.a * x + base.c * y + base.e,
      base.b * x + base.d * y + base.f
    );
    ctx.drawImage(img, sx, sy, CELL_W, CELL_H, -len * 0.5, -wid * 0.5, len, wid);
  }

  function restore() {
    ctx.setTransform(base);
  }

  return { dab, restore };
}

/**
 * Turbulent non-collinear impasto stream placer (eliminates "digital rice-grain bead chains"!).
 * Applies deterministic normal scatter, angle jitter, pressure breathing & mixed brush variants.
 */
function paintTurbulentStream(dabFn, pts, spacing, len, wid, colorFn, seed = 1, scatter = 2.6, baseVariant = -1) {
  let carry = 0;
  let idxCount = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const segLen = Math.hypot(dx, dy);
    if (segLen < 0.5) continue;
    const ux = dx / segLen;
    const uy = dy / segLen;
    const nx = -uy;
    const ny = ux;
    const baseAng = Math.atan2(dy, dx);
    let d = carry;
    while (d <= segLen) {
      const u = d / segLen;
      const h1 = hash11(idxCount * 7.3 + seed * 13.7);
      const h2 = hash11(idxCount * 11.9 + seed * 5.3);
      const nOff = (h1 - 0.5) * 2 * scatter;
      const px = p0.x + dx * u + nx * nOff;
      const py = p0.y + dy * u + ny * nOff;
      const ang = baseAng + (h2 - 0.5) * 0.22;
      const scaleL = len * (0.86 + h1 * 0.32);
      const scaleW = wid * (0.88 + h2 * 0.28);
      const col = typeof colorFn === 'function' ? colorFn(idxCount, px, py) : colorFn;
      const vPick = baseVariant >= 0 ? baseVariant : (idxCount * 3 + Math.floor(seed)) % 7;
      dabFn(col, px, py, ang, scaleL, scaleW, vPick);
      idxCount++;
      d += spacing * (0.85 + h2 * 0.30);
    }
    carry = d - segLen;
  }
}

/**
 * Bakes the static 1000x1000 Coarse Unbleached Linen Canvas + Turbulent Sky/Valley Impasto +
 * Alpilles Mountains + Saint-Rémy Spire & Cottages + Deep Midnight Prussian Road!
 */
function getStarryBackdrop(kit, atlas) {
  return kit.bake2D('s12_starry_backdrop_r3', (_g, ctx, rng, w, h) => {
    // 1. Coarse Primed Oil Linen Weave Ground (warm ochre-umber sizing peeking under dark Prussian underpaint)
    ctx.fillStyle = '#0a1833';
    ctx.fillRect(0, 0, w, h);

    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 3) {
      ctx.strokeStyle = y % 6 === 0 ? 'rgba(214, 188, 140, 0.055)' : 'rgba(3, 8, 18, 0.18)';
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
    }
    for (let x = 0; x < w; x += 3) {
      ctx.strokeStyle = x % 6 === 0 ? 'rgba(214, 188, 140, 0.048)' : 'rgba(3, 8, 18, 0.16)';
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
      ctx.stroke();
    }

    const { dab, restore } = createDabPainter(ctx, atlas);

    // 2. Turbulent Full-Height Sky & Valley Impasto Field (mixed variants 0..6, zero bare patches!)
    const skyAngleAt = (x, y) => {
      let vx = 1.0;
      let vy = 0.14 * Math.sin(x * 0.008);

      const dxA = x - 468;
      const dyA = y - 274;
      const rA = Math.hypot(dxA, dyA) + 24;
      const wA = Math.exp(-(rA * rA) / (235 * 235)) * 2.5;
      vx += (-dyA / rA) * wA;
      vy += (dxA / rA) * wA;

      const dxB = x - 690;
      const dyB = y - 302;
      const rB = Math.hypot(dxB, dyB) + 24;
      const wB = Math.exp(-(rB * rB) / (178 * 178)) * 2.2;
      vx += (dyB / rB) * wB;
      vy += (-dxB / rB) * wB;

      const dxM = x - 858;
      const dyM = y - 148;
      const rM = Math.hypot(dxM, dyM) + 20;
      const wM = Math.exp(-(rM * rM) / (158 * 158)) * 2.2;
      vx += (-dyM / rM) * wM;
      vy += (dxM / rM) * wM;

      return Math.atan2(vy, vx);
    };

    for (let gy = 6; gy <= 652; gy += 13) {
      for (let gx = 4; gx <= w; gx += 18) {
        const px = gx + (rng() - 0.5) * 14;
        const py = gy + (rng() - 0.5) * 9;
        const ang = py < 510 ? skyAngleAt(px, py) + (rng() - 0.5) * 0.18 : (rng() - 0.5) * 0.25;

        let col = C.ULTRAMARINE;
        const rRoll = rng();
        if (py > 505) {
          col = rRoll < 0.48 ? C.PRUSSIAN_DARK : rRoll < 0.80 ? C.PRUSSIAN : C.CYPRESS_DARK;
        } else if (py > 422) {
          col = rRoll < 0.36 ? C.TURQUOISE : rRoll < 0.68 ? C.CERULEAN : rRoll < 0.85 ? C.PALE_ICE : C.COBALT;
        } else if (py < 112) {
          col = rRoll < 0.52 ? C.PRUSSIAN : rRoll < 0.85 ? C.ULTRAMARINE : C.COBALT;
        } else {
          col = rRoll < 0.28 ? C.PRUSSIAN : rRoll < 0.60 ? C.ULTRAMARINE : rRoll < 0.85 ? C.COBALT : C.TURQUOISE;
        }
        const vPick = Math.floor(rng() * 7);
        dab(col, px, py, ang, 34 + rng() * 18, 13 + rng() * 5.5, vPick);
      }
    }

    // 3. Distant Rolling Alpilles Mountains (14 turbulent palette-knife & hog-bristle contour bands!)
    const ridgeY = (x) =>
      498 -
      38 * Math.sin(x * 0.0068 - 0.4) -
      24 * Math.sin(x * 0.017 + 1.1) -
      22 * Math.exp(-Math.pow((x - 865) / 145, 2));

    for (let row = 0; row < 14; row++) {
      const yOff = row * 11.5;
      const pts = [];
      for (let x = -15; x <= w + 15; x += 20) {
        pts.push({ x, y: ridgeY(x) + yOff });
      }
      paintTurbulentStream(
        dab,
        pts,
        15,
        34,
        14.5,
        (k, px) => {
          if (row === 0) return C.PRUSSIAN_DARK;
          if (row === 1) return k % 2 === 0 ? C.COBALT : C.TURQUOISE;
          if (row < 5) return (k + row) % 3 === 0 ? C.CERULEAN : C.ULTRAMARINE;
          if (row < 9) return (k + row) % 2 === 0 ? C.PRUSSIAN : C.ULTRAMARINE;
          return px > 450 && k % 3 === 0 ? C.CYPRESS_OLIVE : C.PRUSSIAN_DARK;
        },
        20 + row,
        2.2,
        row === 1 ? 1 : -1
      );
    }

    // Swirling Gnarled Olive-Tree Groves across the Valley Floor
    for (let bush = 0; bush < 18; bush++) {
      const bx = 190 + bush * 46;
      const by = 608 + Math.sin(bush * 1.7) * 14;
      const br = 26 + (bush % 3) * 8;
      for (let r = 9; r <= br; r += 9) {
        const steps = Math.max(5, Math.round(r * 0.46));
        for (let s = 0; s < steps; s++) {
          const a = Math.PI + (s / (steps - 1)) * Math.PI + (rng() - 0.5) * 0.14;
          const col =
            r >= br - 2
              ? C.PRUSSIAN_DARK
              : (s + bush) % 3 === 0
              ? C.TURQUOISE
              : (s + bush) % 2 === 0
              ? C.CYPRESS_OLIVE
              : C.CYPRESS_DARK;
          dab(col, bx + Math.cos(a) * r, by + Math.sin(a) * r * 0.76, a + Math.PI * 0.5, 25, 12, 2);
        }
      }
    }

    // 4. Sleeping Saint-Rémy Village & Pointed Gothic Church Spire with Palette-Knife Glowing Windows
    const drawImpastoCottage = (cx, cy, cw, ch, roofCol, seedC) => {
      for (let wx = cx - cw * 0.44; wx <= cx + cw * 0.44; wx += 8.5) {
        for (let wy = cy - ch + 6; wy <= cy; wy += 10) {
          dab(
            Math.round(wx + wy) % 2 === 0 ? C.PRUSSIAN : C.COBALT,
            wx + (rng() - 0.5) * 2,
            wy,
            Math.PI * 0.5 + (rng() - 0.5) * 0.12,
            19,
            11,
            3
          );
        }
      }
      const roofPeakY = cy - ch - cw * 0.44;
      for (let s = 0; s <= 5; s++) {
        const u = s / 5;
        dab(roofCol, lerp(cx - cw * 0.56, cx, u), lerp(cy - ch + 4, roofPeakY, u), -0.68, 22, 10.5, 1);
        dab(
          roofCol === C.BURNT_UMBER ? C.CADMIUM_ORANGE : C.TURQUOISE,
          lerp(cx, cx + cw * 0.56, u),
          lerp(roofPeakY, cy - ch + 4, u),
          0.68,
          22,
          10.5,
          1
        );
      }
      paintTurbulentStream(
        dab,
        [
          { x: cx - cw * 0.58, y: cy - ch + 4 },
          { x: cx, y: roofPeakY - 2 },
          { x: cx + cw * 0.58, y: cy - ch + 4 },
        ],
        10,
        18,
        7.2,
        C.PRUSSIAN_DARK,
        seedC,
        1.0,
        0
      );

      // Sleeping nocturnal shuttered window recesses (awaken sequentially as pelican passes!)
      const winPositions = cw > 46 ? [-cw * 0.19, cw * 0.19] : [0];
      for (const wxOff of winPositions) {
        const wx = cx + wxOff;
        const wy = cy - ch * 0.48;
        dab(C.PRUSSIAN_DARK, wx, wy, Math.PI * 0.5, 16, 12.5, 3);
        dab(C.BURNT_UMBER, wx, wy + 2.5, 0, 12, 6.5, 1);
      }
    };

    drawImpastoCottage(462, 636, 40, 26, C.COBALT, 51);
    drawImpastoCottage(506, 640, 44, 30, C.BURNT_UMBER, 52);
    drawImpastoCottage(562, 634, 40, 27, C.TURQUOISE, 53);
    drawImpastoCottage(722, 640, 52, 33, C.BURNT_UMBER, 54);
    drawImpastoCottage(786, 634, 44, 29, C.COBALT, 55);
    drawImpastoCottage(844, 642, 48, 32, C.TURQUOISE, 56);
    drawImpastoCottage(896, 636, 42, 27, C.BURNT_UMBER, 57);

    // Tall Pointed Saint-Rémy Gothic Church Spire at x = 656
    const chX = 656;
    const chBaseY = 640;
    const towerTopY = 532;
    const spireTipY = 358;

    drawImpastoCottage(chX - 2, chBaseY, 64, 48, C.COBALT, 60);
    for (let ty = chBaseY - 44; ty >= towerTopY; ty -= 10) {
      dab(C.PRUSSIAN_DARK, chX - 18, ty, Math.PI * 0.5, 19, 8.5, 1);
      dab(C.PRUSSIAN_DARK, chX + 18, ty, Math.PI * 0.5, 19, 8.5, 1);
      dab(C.ULTRAMARINE, chX - 8, ty, Math.PI * 0.5, 20, 12, 4);
      dab(C.COBALT, chX + 8, ty, Math.PI * 0.5, 20, 12, 4);
    }
    for (let sy = towerTopY; sy >= spireTipY; sy -= 9.5) {
      const u = (towerTopY - sy) / (towerTopY - spireTipY);
      const halfW = (1 - u) * 18.5;
      dab(C.PRUSSIAN_DARK, chX - halfW - 2.5, sy, -1.46, 20, 8.0, 5);
      dab(C.PRUSSIAN_DARK, chX + halfW + 2.5, sy, 1.46, 20, 8.0, 5);
      dab(u > 0.55 ? C.CERULEAN : C.COBALT, chX - halfW * 0.35, sy, -Math.PI * 0.5, 19, Math.max(7, halfW * 1.15), 1);
      dab(u > 0.65 ? C.PALE_ICE : C.TURQUOISE, chX + halfW * 0.35, sy, -Math.PI * 0.5, 18, Math.max(6.5, halfW * 1.0), 4);
    }
    dab(C.PRUSSIAN_DARK, chX, spireTipY - 8, Math.PI * 0.5, 18, 5.5, 5);
    dab(C.PRUSSIAN_DARK, chX, spireTipY - 9, 0, 13, 5.0, 1);
    // Unlit dark Gothic belfry lancet recess (awakens dynamically when pelican approaches x = 656!)
    dab(C.PRUSSIAN_DARK, chX, towerTopY + 24, Math.PI * 0.5, 20, 11, 5);

    // 5. Deep Velvety Midnight Prussian-Blue Road (y = 644..712, strictly anchored to y=680 at x=0 and x=1000!)
    // Rich dark hog-bristle & palette-knife strokes create extreme 1080p contrast for the blazing nebula wheels!
    for (let rx = -12; rx <= w + 12; rx += 26) {
      const { y: rCenter, slope } = sampleStarryRoad(kit, rx);
      dab(C.PRUSSIAN_DARK, rx, rCenter - 34, slope + (rng() - 0.5) * 0.06, 46, 12.5, 1);
      dab(C.BURNT_UMBER, rx + 12, rCenter - 29, slope + (rng() - 0.5) * 0.08, 36, 9.5, 6);

      for (let offY = -21; offY <= 21; offY += 10.2) {
        const jx = (rng() - 0.5) * 14;
        const pick = Math.floor(rng() * 4);
        const col = pick <= 1 ? C.PRUSSIAN_DARK : pick === 2 ? C.PRUSSIAN : C.ULTRAMARINE;
        dab(col, rx + jx, rCenter + offY, slope + (rng() - 0.5) * 0.07, 50 + rng() * 12, 14.5, pick === 0 ? 1 : 0);
      }
      dab(C.PRUSSIAN_DARK, rx, rCenter + 28, slope + (rng() - 0.5) * 0.06, 48, 13, 1);
    }

    // 6. Foreground Swirling Provençal Night Field below Road (y = 714..1000)
    for (let fy = 716; fy <= h - 4; fy += 14) {
      for (let fx = 6; fx <= w; fx += 21) {
        const px = fx + (rng() - 0.5) * 14;
        const py = fy + (rng() - 0.5) * 9;
        const swirlAng = -0.22 + 0.34 * Math.sin(px * 0.010 + py * 0.008) + (rng() - 0.5) * 0.14;
        const rPick = rng();
        const col =
          rPick < 0.36
            ? C.PRUSSIAN_DARK
            : rPick < 0.64
            ? C.PRUSSIAN
            : rPick < 0.83
            ? C.CYPRESS_OLIVE
            : rPick < 0.94
            ? C.ULTRAMARINE
            : C.BURNT_UMBER;
        dab(col, px, py, swirlAng, 36 + rng() * 16, 14, Math.floor(rng() * 7));
      }
    }

    restore();
  });
}

/**
 * Dynamic Layer 1: Streamline-Advecting Giant S-Shaped Sky Nebula Vortices,
 * Fat Sculpted Chrome-Yellow Crescent Moon & 11 Hierarchical Star-Halo Rings!
 * Strokes crawl & breathe tangentially along spiral streamlines rather than rotating as rigid glued disks!
 */
function drawWheelSyncedStarrySky(ctx, atlas, wheelAngle, syncGlow, t) {
  const { dab, restore } = createDabPainter(ctx, atlas);

  const drawNebulaVortex = (cx, cy, maxR, phase, spinSign, armCount = 4, seedV = 1) => {
    // Pulsing incandescent vortex core
    for (let k = 0; k < 6; k++) {
      const a = phase * 1.15 + (k * Math.PI * 2) / 6;
      const pulse = 1 + 0.14 * Math.sin(t * 6 + k);
      dab(
        k % 2 === 0 ? C.TITANIUM : C.LEMON_YELLOW,
        cx + Math.cos(a) * 9.5,
        cy + Math.sin(a) * 9.5,
        a + Math.PI * 0.5,
        23 * pulse,
        11 * pulse,
        1
      );
    }

    // Logarithmic spiral arms with tangential streamline advection (`uAdv` crawls continuously outward!)
    const advect = (((phase * spinSign * 0.16) % 1) + 1) % 1;
    for (let arm = 0; arm < armCount; arm++) {
      const armBase = phase * 0.55 + (arm * Math.PI * 2) / armCount;
      const steps = 22;
      for (let s = 0; s < steps; s++) {
        const u = ((s + advect) / steps);
        if (u < 0.04 || u > 0.99) continue;
        const jitter = (hash11(s * 5.7 + arm * 13.1 + seedV) - 0.5) * 5.5;
        const r = lerp(13, maxR, Math.pow(u, 0.90)) + jitter;
        const theta = armBase + spinSign * u * Math.PI * 2.25;
        const px = cx + Math.cos(theta) * r;
        const py = cy + Math.sin(theta) * r * 0.86;

        const dTheta = spinSign * Math.PI * 2.25;
        const tx = -Math.sin(theta) * r * dTheta + Math.cos(theta) * (maxR - 13);
        const ty = (Math.cos(theta) * r * dTheta + Math.sin(theta) * (maxR - 13)) * 0.86;
        const tang = Math.atan2(ty, tx) + (hash11(s * 9.1 + arm) - 0.5) * 0.16;

        const shimmer = Math.sin(wheelAngle * 2.5 - u * 9 + arm) > 0.35;
        const col =
          arm === 0
            ? shimmer
              ? C.LEMON_YELLOW
              : C.TITANIUM
            : arm === 1
            ? s % 2 === 0
              ? C.NAPLES_YELLOW
              : C.PALE_ICE
            : arm === 2
            ? s % 2 === 0
              ? C.TURQUOISE
              : C.CERULEAN
            : s % 2 === 0
            ? C.COBALT
            : C.TURQUOISE;

        const breath = 0.88 + 0.24 * Math.sin(u * Math.PI) * (1 + 0.2 * syncGlow);
        const vPick = arm === 0 ? 1 : (s + arm) % 6;
        dab(col, px, py, tang, lerp(20, 35, u) * breath, lerp(9, 13.5, u) * breath, vPick);
      }
    }
  };

  // Sweeping S-bridge nebula river with traveling wave advection linking left sky -> Vortex A -> Vortex B
  const sRiverPts = [
    { x: 192, y: 232 },
    { x: 278, y: 200 },
    { x: 368, y: 182 },
    { x: 468, y: 168 },
    { x: 566, y: 236 },
    { x: 618, y: 348 },
    { x: 698, y: 386 },
    { x: 786, y: 344 },
  ];
  const waveShift = Math.floor(wheelAngle * 3.5);
  for (let lane = -1; lane <= 1; lane++) {
    const shiftedPts = sRiverPts.map((pt, idx) => ({
      x: pt.x + lane * 5,
      y: pt.y + lane * 13.5 + Math.sin(wheelAngle * 2.2 - idx * 0.9) * 4.2,
    }));
    paintTurbulentStream(
      dab,
      shiftedPts,
      19,
      32,
      12,
      (k) => {
        const m = ((k - waveShift) % 4 + 4) % 4;
        if (lane === 0) return m === 0 ? C.LEMON_YELLOW : m === 1 ? C.NAPLES_YELLOW : C.TITANIUM;
        return m % 2 === 0 ? C.PALE_ICE : C.TURQUOISE;
      },
      90 + lane * 7,
      2.8,
      lane === 0 ? 1 : -1
    );
  }

  drawNebulaVortex(468, 276, 126, wheelAngle, 1, 4, 11);
  drawNebulaVortex(690, 302, 94, -wheelAngle * 1.25 + 0.6, -1, 4, 29);

  // --- B. Top-Right Fat Sculpted Chrome-Yellow & Cadmium-Orange C-Crescent Moon (858, 148) ---
  const mx = 858;
  const my = 148;

  const moonRings = [
    { r: 103, count: 22, colA: C.LEMON_YELLOW, colB: C.TURQUOISE, mul: 0.45 },
    { r: 81, count: 18, colA: C.CHROME_YELLOW, colB: C.NAPLES_YELLOW, mul: -0.65 },
    { r: 61, count: 14, colA: C.LEMON_YELLOW, colB: C.TITANIUM, mul: 0.85 },
  ];
  for (let rIdx = 0; rIdx < moonRings.length; rIdx++) {
    const ring = moonRings[rIdx];
    for (let i = 0; i < ring.count; i++) {
      const a = wheelAngle * ring.mul + (i * Math.PI * 2) / ring.count;
      const radJit = ring.r + Math.sin(i * 3.1 + rIdx + t * 3) * 2.6;
      dab(
        i % 2 === 0 ? ring.colA : ring.colB,
        mx + Math.cos(a) * radJit,
        my + Math.sin(a) * radJit,
        a + Math.PI * 0.5 + (hash11(i + rIdx * 17) - 0.5) * 0.18,
        25,
        11,
        (i + rIdx) % 5
      );
    }
  }

  for (let i = 0; i < 14; i++) {
    const a = (i * Math.PI * 2) / 14;
    dab(i % 2 === 0 ? C.ULTRAMARINE : C.COBALT, mx + Math.cos(a) * 46, my + Math.sin(a) * 46, a + 1.57, 21, 10.5, 2);
  }

  const hornA0 = -2.36;
  const hornA1 = 2.16;
  for (let layer = 0; layer < 3; layer++) {
    const steps = 16;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const a = lerp(hornA0, hornA1, u);
      const bellyProfile = Math.sin(u * Math.PI);
      const rad = 35 - layer * (7.5 * bellyProfile);
      const px = mx + Math.cos(a) * rad + 4;
      const py = my + Math.sin(a) * rad;
      const col =
        layer === 0
          ? i % 2 === 0
            ? C.CADMIUM_ORANGE
            : C.CHROME_YELLOW
          : layer === 1
          ? C.CHROME_YELLOW
          : i % 2 === 0
          ? C.LEMON_YELLOW
          : C.TITANIUM;
      dab(col, px, py, a + Math.PI * 0.5, lerp(11, 22, bellyProfile), lerp(5.5, 12.8, bellyProfile), 1);
    }
  }
  dab(C.PRUSSIAN, mx - 13, my - 4, 1.3, 24, 15, 3);
  dab(C.ULTRAMARINE, mx - 16, my + 4, 1.5, 22, 14, 3);
  dab(C.COBALT, mx - 9, my - 11, 0.9, 19, 12, 2);

  // --- C. 11 Hierarchical Stars with Turbulent Shimmering Impasto Rings ---
  for (let idx = 0; idx < STARS_11.length; idx++) {
    const st = STARS_11[idx];
    const rot = wheelAngle * st.dir * (st.tier === 3 ? 0.95 : 0.80) + idx * 0.7;
    const pulse = 1 + 0.10 * Math.sin(t * 5.2 + idx * 1.9);

    if (st.tier >= 1) {
      const outerN = st.tier === 3 ? 14 : st.tier === 2 ? 10 : 7;
      for (let i = 0; i < outerN; i++) {
        const a = rot + (i * Math.PI * 2) / outerN;
        const rJit = st.r * pulse + (hash11(idx * 19 + i) - 0.5) * 3.0;
        const col =
          st.tier === 3
            ? i % 2 === 0
              ? C.TITANIUM
              : C.NAPLES_YELLOW
            : i % 2 === 0
            ? C.LEMON_YELLOW
            : st.tier === 2
            ? C.PALE_ICE
            : C.CERULEAN;
        dab(
          col,
          st.x + Math.cos(a) * rJit,
          st.y + Math.sin(a) * rJit,
          a + Math.PI * 0.5,
          st.tier >= 2 ? 21 : 15,
          st.tier >= 2 ? 9.0 : 7.2,
          (i + idx) % 5
        );
      }
    }

    if (st.tier >= 2) {
      const midR = st.r * 0.58 * pulse;
      const midN = st.tier === 3 ? 9 : 6;
      for (let i = 0; i < midN; i++) {
        const a = -rot * 1.15 + (i * Math.PI * 2) / midN;
        dab(
          st.tier === 3 ? C.TITANIUM : C.LEMON_YELLOW,
          st.x + Math.cos(a) * midR,
          st.y + Math.sin(a) * midR,
          a + Math.PI * 0.5,
          17,
          8.5,
          1
        );
      }
    } else if (st.tier === 0) {
      for (let i = 0; i < 4; i++) {
        const a = rot + (i * Math.PI) / 2;
        dab(C.NAPLES_YELLOW, st.x + Math.cos(a) * st.r, st.y + Math.sin(a) * st.r, a + 1.57, 12, 5.8, 5);
      }
    }

    const coreLen = (st.tier === 3 ? 22 : st.tier === 2 ? 17 : 12.5) * pulse;
    const coreWid = (st.tier === 3 ? 16 : st.tier === 2 ? 12 : 8.5) * pulse;
    dab(st.tier === 3 ? C.LEMON_YELLOW : C.CHROME_YELLOW, st.x, st.y, rot, coreLen, coreWid, 7);
    dab(C.TITANIUM, st.x, st.y, rot + Math.PI * 0.5, coreLen * 0.72, coreWid * 0.72, 1);
  }

  restore();
}

/**
 * Dynamic Layer 2 (#85 Guardrail ② Upgraded):
 * Monumental Asymmetric Multi-Spire Gothic Flame Cypress Tree!
 * NO symmetric corn-cob! Billowing wide root mass (x = 24..220) splitting into 4 staggered,
 * fiercely writhing Gothic flame spires piercing the night sky at y=42, y=156, y=278, and y=412!
 */
function drawFlameCypress(ctx, atlas, pedalAngle, pelicanLocalX = -500, localT = 0, t = 0, isOutroThumbnail = false) {
  const { dab, restore } = createDabPainter(ctx, atlas);
  const beatSway = Math.sin(2 * pedalAngle);

  // Spatial aerodynamic slipstream wake as pelican rushes past the foreground Cypress (x ≈ 140..340, localT ∈ [0.7s, 2.8s]):
  // Pulls upper flame-tips rightward (+18..32px whip) then rebounds elastically!
  let wakeTipDx = 0;
  let surgeEnv = 0;
  if (!isOutroThumbnail && pelicanLocalX > 90 && pelicanLocalX < 540) {
    surgeEnv = smoothstep(100, 222, pelicanLocalX) * (1 - smoothstep(268, 368, pelicanLocalX));
    const reboundEnv = smoothstep(255, 315, pelicanLocalX) * (1 - smoothstep(425, 530, pelicanLocalX));
    const reboundOsc =
      -Math.sin(((pelicanLocalX - 274) / 112) * Math.PI * 1.65) *
      Math.exp(-Math.max(0, pelicanLocalX - 274) / 145);
    wakeTipDx = 30.5 * surgeEnv + 13.5 * reboundEnv * reboundOsc;
  }

  // Define 4 asymmetric interlocking Gothic flame spires rising from a broad, churning root mass!
  const spires = [
    // Spire 1: Tallest commanding main Gothic flame tongue curving left then whipping right to y = 42!
    {
      baseX: 122,
      baseY: 938,
      topY: 42,
      baseHalfW: 54,
      rows: 44,
      swayMul: 14,
      wakeMul: 1.04,
      curveFn: (u) => -16 * Math.sin(u * Math.PI * 1.35) + 12 * Math.pow(u, 2.2) + Math.sin(u * 9 + pedalAngle * 0.6) * 7,
    },
    // Spire 2: Prominent right-flank secondary flame tower hooking inward then flaring skyward to y = 156!
    {
      baseX: 164,
      baseY: 928,
      topY: 156,
      baseHalfW: 42,
      rows: 34,
      swayMul: 11,
      wakeMul: 0.90,
      curveFn: (u) => 22 * Math.sin(u * Math.PI * 0.92) - 10 * Math.pow(u, 2.4) + Math.cos(u * 7.5 - pedalAngle * 0.5) * 6,
    },
    // Spire 3: Sweeping left-flank S-flame tongue licking out toward x = 44 up to y = 274!
    {
      baseX: 76,
      baseY: 932,
      topY: 274,
      baseHalfW: 40,
      rows: 28,
      swayMul: 9.5,
      wakeMul: 0.78,
      curveFn: (u) => -26 * Math.sin(u * Math.PI * 1.05) + 8 * Math.sin(u * 6 + pedalAngle * 0.7),
    },
    // Spire 4: Lower right-shoulder billowing bush-flame surging out to x = 216 up to y = 418!
    {
      baseX: 186,
      baseY: 916,
      topY: 418,
      baseHalfW: 34,
      rows: 20,
      swayMul: 6.5,
      wakeMul: 0.64,
      curveFn: (u) => 24 * Math.sin(u * Math.PI * 0.85) - 12 * u * u,
    },
  ];

  const spireCenterXAt = (sIdx, u) => {
    const sp = spires[sIdx];
    const sway = beatSway * sp.swayMul * Math.pow(u, 1.5);
    const wake = wakeTipDx * sp.wakeMul * Math.pow(u, 1.68);
    return sp.baseX + sp.curveFn(u) + sway + wake;
  };

  for (let sIdx = 0; sIdx < spires.length; sIdx++) {
    const sp = spires[sIdx];
    const spanH = sp.baseY - sp.topY;
    for (let r = 0; r <= sp.rows; r++) {
      const u = r / sp.rows;
      const py = lerp(sp.baseY, sp.topY, u);
      const cx = spireCenterXAt(sIdx, u);

      // Taper to a razor-sharp curling flame tip at u -> 1, with organic billowing lobes below!
      const halfW =
        sp.baseHalfW * Math.pow(1 - u, 1.08) * (1 + 0.18 * Math.sin(u * Math.PI * 4 + sIdx * 1.7));
      const colsAcross = Math.max(0, Math.round((halfW * 2) / 13));

      const wakeSlope = (wakeTipDx * sp.wakeMul * 1.68 * Math.pow(Math.max(0.01, u), 0.68)) / spanH;

      for (let c = 0; c <= colsAcross; c++) {
        const f = colsAcross === 0 ? 0 : (c / colsAcross) * 2 - 1;
        const px = cx + f * halfW + (hash11(r * 11 + c * 7 + sIdx * 31) - 0.5) * 4;
        const slopeDx = (sp.curveFn(Math.min(1, u + 0.04)) - sp.curveFn(Math.max(0, u - 0.04))) * 0.06;
        const flameAng =
          -Math.PI * 0.5 +
          slopeDx +
          wakeSlope * 2.8 +
          f * 0.24 +
          Math.cos(u * 10 + c + pedalAngle * 0.5) * 0.15;

        let col = C.CYPRESS_DARK;
        const hash = (r * 7 + c * 13 + sIdx * 5) % 12;
        if (surgeEnv > 0.22 && f >= 0.42 && u > 0.48 && (r + sIdx) % 4 === 0) {
          col = (r + c) % 2 === 0 ? C.CHROME_YELLOW : C.CADMIUM_ORANGE; // Ember edge igniting as sparks peel off!
        } else if (Math.abs(f) > 0.76) {
          col = (r + sIdx) % 2 === 0 ? C.PRUSSIAN_DARK : C.CYPRESS_DARK;
        } else if (hash === 0 || hash === 5) {
          col = C.BURNT_UMBER; // Charred umber fire vein!
        } else if (hash === 2 || hash === 9) {
          col = C.CYPRESS_OLIVE;
        } else if (hash === 7 && u < 0.76) {
          col = C.CADMIUM_ORANGE; // Smoldering ember vein!
        } else if (hash === 11 && u > 0.45) {
          col = C.TURQUOISE; // Starlight reflection on dark cypress needles!
        }
        const vPick = u > 0.80 ? 5 : (r + c + sIdx) % 6;
        const lenScale = lerp(36, 22, u * 0.7);
        const widScale = lerp(15.5, 8.5, u * 0.8);
        dab(col, px, py, flameAng, lenScale, widScale, vPick);
      }
    }
  }

  // Wild curling side-licking flame shoots breaking off the asymmetric silhouette!
  const wildTongues = [
    { x0: 66, y0: 665, dx: -34, dy: -98, side: -1 },
    { x0: 58, y0: 470, dx: -28, dy: -92, side: -1 },
    { x0: 88, y0: 255, dx: -24, dy: -82, side: -1 },
    { x0: 196, y0: 640, dx: 32, dy: -95, side: 1 },
    { x0: 184, y0: 385, dx: 28, dy: -88, side: 1 },
    { x0: 146, y0: 195, dx: 22, dy: -76, side: 1 },
  ];
  for (let wIdx = 0; wIdx < wildTongues.length; wIdx++) {
    const wt = wildTongues[wIdx];
    const uGlobal = clamp((938 - wt.y0) / 896, 0, 1);
    const sway = beatSway * 12 * Math.pow(uGlobal, 1.4);
    const wakeShift = wakeTipDx * 0.88 * Math.pow(uGlobal, 1.62);
    for (let s = 0; s <= 8; s++) {
      const v = s / 8;
      const px =
        wt.x0 +
        sway +
        wakeShift * (1 + v * 0.28) +
        Math.sin(v * Math.PI * 0.9) * wt.dx +
        Math.sin(v * 5 + pedalAngle) * 3.5;
      const py = wt.y0 + wt.dy * v;
      const ang = -Math.PI * 0.5 + wt.side * (0.45 - v * 0.75) + wakeShift * 0.008;
      dab(
        s % 3 === 0 ? C.BURNT_UMBER : s % 2 === 0 ? C.CYPRESS_DARK : C.PRUSSIAN_DARK,
        px,
        py,
        ang,
        25 * (1 - v * 0.3),
        10.5 * (1 - v * 0.35),
        5
      );
    }
  }

  // =========================================================================
  // 15 Thick Impasto Cadmium-Yellow / Orange-Gold Short Brush-Sparks Peeling
  // Off the Whipped Cypress Spires & Spiraling Up Into the Overhead Sky S-Vortex!
  // =========================================================================
  const sparkEnv = isOutroThumbnail
    ? 0
    : smoothstep(0.66, 0.96, localT) * (1 - smoothstep(2.44, 2.88, localT));

  if (sparkEnv > 0.02) {
    const SPARK_COUNT = 15;
    const vx = 468; // Overhead main Sky S-Vortex center X
    const vy = 276; // Overhead main Sky S-Vortex center Y

    for (let k = 0; k < SPARK_COUNT; k++) {
      const h1 = hash11(k * 13.7 + 5.1);
      const h2 = hash11(k * 29.3 + 11.7);

      // Anchor origins along the upper right-flank & tips of Spires 0, 1, and 3
      const sPick = k % 3 === 0 ? 0 : k % 3 === 1 ? 1 : 3;
      const sp = spires[sPick];
      const uOrigin = sPick === 3 ? lerp(0.68, 0.98, h1) : lerp(0.54, 0.97, h1);
      const rootHalfW = sp.baseHalfW * Math.pow(1 - uOrigin, 1.08);
      const x0 = spireCenterXAt(sPick, uOrigin) + rootHalfW * 0.72 + 4;
      const y0 = lerp(sp.baseY, sp.topY, uOrigin);

      // Stratified advection parameter u ∈ [0.02, 0.98] so all 15 sparks form a rich continuous spiral stream!
      const rawU = (((localT - 0.64) * (0.56 + 0.16 * h2) + (k + 0.35 * h1) / SPARK_COUNT) % 1 + 1) % 1;
      const u = 0.02 + 0.95 * rawU;

      // Curved cubic-Bezier entry into the S-river, smoothly blending into a clockwise spiral around Vortex A (468, 276)
      const vortexOrbitR = lerp(108, 28, Math.pow(clamp((u - 0.45) / 0.55, 0, 1), 0.9));
      const vortexTheta = -Math.PI * 0.78 + u * Math.PI * 2.15 + (h2 - 0.5) * 0.45 + t * 0.45;
      const xEnd = vx + Math.cos(vortexTheta) * vortexOrbitR;
      const yEnd = vy + Math.sin(vortexTheta) * vortexOrbitR * 0.86;

      const c1x = x0 + 68 + 52 * h1;
      const c1y = y0 - (58 + 64 * (1 - h2));
      const c2x = lerp(285, 420, h2);
      const c2y = lerp(136, 212, h1);

      const evalStream = (sU) => {
        const iu = 1 - sU;
        const bx = iu ** 3 * x0 + 3 * iu ** 2 * sU * c1x + 3 * iu * sU ** 2 * c2x + sU ** 3 * xEnd;
        const by = iu ** 3 * y0 + 3 * iu ** 2 * sU * c1y + 3 * iu * sU ** 2 * c2y + sU ** 3 * yEnd;
        const rip = Math.sin(sU * Math.PI * 3 + k * 1.7) * 5.5 * Math.sin(sU * Math.PI);
        return { x: bx, y: by + rip };
      };

      const pCur = evalStream(u);
      const pNxt = evalStream(Math.min(0.999, u + 0.025));
      const tang = Math.atan2(pNxt.y - pCur.y, pNxt.x - pCur.x);

      const lifeAlpha = sparkEnv * smoothstep(0.0, 0.09, u) * (1 - 0.35 * smoothstep(0.86, 0.98, u));
      const sizeScale = (0.92 + 0.24 * Math.sin(u * Math.PI)) * (0.88 + 0.22 * sparkEnv);
      const dLen = (25 + 6 * h1) * sizeScale;
      const dWid = (10.5 + 2.8 * h2) * sizeScale;

      ctx.globalAlpha = clamp(lifeAlpha, 0, 1);

      // Rich Burnt-Umber / Cadmium-Orange warm impasto bed stroke
      dab(
        k % 3 === 0 ? C.BURNT_UMBER : C.CADMIUM_ORANGE,
        pCur.x - Math.cos(tang) * 2.5,
        pCur.y - Math.sin(tang) * 2.5 + 1.4,
        tang - 0.06,
        dLen * 1.06,
        dWid * 1.08,
        k % 2 === 0 ? 2 : 5
      );

      // Thick Loaded Cadmium-Yellow / Orange-Gold Impasto Short Brush-Spark!
      const mainCol =
        k % 4 === 0
          ? C.CADMIUM_ORANGE
          : k % 4 === 3
          ? C.LEMON_YELLOW
          : C.CHROME_YELLOW;
      const vSpark = k % 3 === 0 ? 1 : k % 3 === 1 ? 5 : 2;
      dab(mainCol, pCur.x, pCur.y, tang, dLen, dWid, vSpark);

      // Incandescent Lemon-Gold / Titanium wet-ridge catchlight at brush head
      if (k % 2 === 0) {
        dab(
          C.LEMON_YELLOW,
          pCur.x + Math.cos(tang) * 2.2,
          pCur.y + Math.sin(tang) * 2.2 - 1.0,
          tang,
          dLen * 0.62,
          dWid * 0.58,
          1
        );
      }
    }
    ctx.globalAlpha = 1;
  }

  restore();
}

/**
 * Dynamic Layer 3 (#74 & #85 Guardrail ① Masterpiece Integration):
 * - Wheels = Two Blazing 4-Arm Logarithmic-Spiral Nebula Fire Vortices (ZERO closed circular outer tire!)
 *   grounded over deep midnight Prussian-Dark road contact shadows for instant rolling wheel readability!
 * - Frame = Writhing Deep-Prussian, Cypress-Olive & Burnt-Umber Cypress-Flame Wood Branches with
 *   bright Chrome-Yellow & Turquoise palette-knife top catchlight ridges + blazing golden star-core crankset!
 * - Pelican = 100% Turbulent Shingled Impasto Plumage & Cadmium-Orange/Red Beak!
 */
function drawImpastoPelicanAndBike(ctx, atlas, rig, syncGlow, t) {
  const { dab, restore } = createDabPainter(ctx, atlas);
  const s = rig.root.scale;

  const sampleCubic = (p0, p1, p2, p3, n = 12) => {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const iu = 1 - u;
      out.push({
        x: iu * iu * iu * p0.x + 3 * iu * iu * u * p1.x + 3 * iu * u * u * p2.x + u * u * u * p3.x,
        y: iu * iu * iu * p0.y + 3 * iu * iu * u * p1.y + 3 * iu * u * u * p2.y + u * u * u * p3.y,
      });
    }
    return out;
  };

  const sampleQuad = (p0, p1, p2, n = 10) => {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const iu = 1 - u;
      out.push({
        x: iu * iu * p0.x + 2 * iu * u * p1.x + u * u * p2.x,
        y: iu * iu * p0.y + 2 * iu * u * p1.y + u * u * p2.y,
      });
    }
    return out;
  };

  // 0. Bar-2 Ascending Cosmic Starlight Sparks flung from the Rear Nebula Vortex Wheel up into the Galaxy!
  if (syncGlow > 0.08 && rig.root.x > 50 && rig.root.x < PANEL_SIZE - 50) {
    const sparkCount = Math.round(11 * syncGlow);
    for (let k = 0; k < sparkCount; k++) {
      const wu = ((k / sparkCount + ((t * 0.65) % 1)) % 1);
      const wx = lerp(rig.rearWheel.x - 18 * s, 468, Math.pow(wu, 1.15)) + Math.sin(rig.wheelAngle * 2 + wu * 7 + k) * 22 * wu;
      const wy = lerp(rig.rearWheel.y - 12 * s, 320, wu);
      if (wy > 520 && wx > rig.rearWheel.x - 10 * s && wx < rig.frontWheel.x + 20 * s) continue; // Keep rider silhouette crystal-clean!
      const wang = -1.25 + Math.cos(rig.wheelAngle + wu * 5) * 0.42;
      const col = k % 3 === 0 ? C.LEMON_YELLOW : k % 3 === 1 ? C.TURQUOISE : C.TITANIUM;
      dab(col, wx, wy, wang, (20 - wu * 6) * s, (8.5 - wu * 2.5) * s, 5);
    }
  }

  // 1. Deep Midnight Prussian-Dark Road Contact Shadow & Contrast Aura (#85 Guardrail ①: anchors wheel spacing & road contact!)
  for (const w of [rig.rearWheel, rig.frontWheel]) {
    // Grounded road contact shadow pool directly beneath each vortex wheel at y = w.y + w.r!
    for (let j = -2; j <= 2; j++) {
      dab(C.PRUSSIAN_DARK, w.x + j * 14 * s, w.y + w.r + 2.5 * s, rig.root.slope, 34 * s, 12 * s, 1);
    }
    // Deep Prussian-midnight negative-space halo behind vortex spiral so white/gold flames blaze out!
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI * 2) / 16;
      const rad = w.r * (0.72 + (i % 2) * 0.22);
      dab(C.PRUSSIAN_DARK, w.x + Math.cos(a) * rad, w.y + Math.sin(a) * rad, a + 1.57, 26 * s, 15 * s, 0);
    }
  }

  // --- Helper A: Blazing 4-Arm Logarithmic-Spiral Nebula Vortex Wheel (ZERO closed circular tire or straight spokes!) ---
  const drawBurningNebulaWheel = (w, spinOffset = 0) => {
    const maxR = w.r * 1.03;
    const arms = 4;
    const adv = (((w.angle * 0.22 + spinOffset) % 1) + 1) % 1;

    // 4 Blazing Spiral Flame Arms whipping outward from hub to rolling radius `maxR`!
    for (let arm = 0; arm < arms; arm++) {
      const armBase = w.angle + (arm * Math.PI * 2) / arms;
      const steps = 11;
      for (let st = 0; st < steps; st++) {
        const u = (st + adv * 0.65) / steps; // 0.05..1.0 radial progression
        if (u > 1.02) continue;
        const r = lerp(7 * s, maxR, Math.pow(u, 0.86));
        // Logarithmic spiral twist backward against rotation so it reads unmistakably as a spinning fire-vortex!
        const theta = armBase - u * 1.68;
        const px = w.x + Math.cos(theta) * r;
        const py = w.y + Math.sin(theta) * r;

        // Tangent along spiral curve
        const tx = -Math.sin(theta) * (-1.68 * r) + Math.cos(theta) * (maxR - 7 * s);
        const ty = Math.cos(theta) * (-1.68 * r) + Math.sin(theta) * (maxR - 7 * s);
        const tang = Math.atan2(ty, tx);

        // High-value incandescent core -> golden mid-spiral -> turquoise/chrome-yellow flaming outer tongues!
        let col = C.LEMON_YELLOW;
        if (u < 0.34) {
          col = st % 2 === 0 ? C.TITANIUM : C.LEMON_YELLOW;
        } else if (u < 0.74) {
          col = (st + arm) % 3 === 0 ? C.TITANIUM : (st + arm) % 2 === 0 ? C.LEMON_YELLOW : C.CHROME_YELLOW;
        } else {
          col = arm % 2 === 0 ? (st % 2 === 0 ? C.CHROME_YELLOW : C.CADMIUM_ORANGE) : st % 2 === 0 ? C.LEMON_YELLOW : C.TURQUOISE;
        }

        const vPick = u > 0.78 ? 5 : u < 0.4 ? 1 : 2;
        const dLen = lerp(14, 23, u) * s;
        const dWid = lerp(7.5, 10.2, Math.sin(u * Math.PI)) * s;
        dab(col, px, py, tang, dLen, dWid, vPick);
      }

      // Whipping outer nebula flame-sparks licking tangentially around `r ≈ w.r` (unclosed starry corona, NOT a tire!)
      const tipTheta = armBase - 1.72;
      for (let tail = 1; tail <= 3; tail++) {
        const ta = tipTheta - tail * 0.24;
        const tr = maxR * (1.01 - tail * 0.04);
        dab(
          tail === 1 ? C.LEMON_YELLOW : tail === 2 ? C.CHROME_YELLOW : C.TURQUOISE,
          w.x + Math.cos(ta) * tr,
          w.y + Math.sin(ta) * tr,
          ta + Math.PI * 0.52,
          (20 - tail * 3) * s,
          (8.2 - tail * 1.2) * s,
          5
        );
      }
    }

    // Incandescent Cadmium-Orange & Titanium-White Vortex Star-Nucleus Hub!
    dab(C.CADMIUM_ORANGE, w.x, w.y, w.angle, 19 * s, 16 * s, 7);
    dab(C.LEMON_YELLOW, w.x, w.y, w.angle + 0.8, 14 * s, 12 * s, 1);
    dab(C.TITANIUM, w.x, w.y, w.angle + 1.57, 9.5 * s, 8.5 * s, 1);
  };

  // --- Helper B: Writhing Cypress-Flame Wood Branch with Bright Palette-Knife Catchlight Ridge (#85 Guardrail ①!) ---
  const drawFlameWoodBranch = (p0, p1, bowAmt, seedB, hasBrightSpine = true) => {
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const wiggle = Math.sin(rig.pedalAngle * 2 + seedB) * 1.8 * s;

    // Organic S-curved writhing cypress branch control points (ZERO straight mechanical tubes!)
    const c1 = {
      x: lerp(p0.x, p1.x, 0.33) + nx * (bowAmt + wiggle),
      y: lerp(p0.y, p1.y, 0.33) + ny * (bowAmt + wiggle),
    };
    const c2 = {
      x: lerp(p0.x, p1.x, 0.68) - nx * (bowAmt * 0.72 - wiggle),
      y: lerp(p0.y, p1.y, 0.68) - ny * (bowAmt * 0.72 - wiggle),
    };
    const pts = sampleCubic(p0, c1, c2, p1, 10);

    // 1. Deep Prussian-Dark & Cypress-Dark gnarled branch body
    paintTurbulentStream(
      dab,
      pts,
      6.8 * s,
      19 * s,
      12.5 * s,
      (k) => (k % 2 === 0 ? C.PRUSSIAN_DARK : C.CYPRESS_DARK),
      seedB,
      1.2,
      0
    );

    // 2. Charred Burnt-Umber & Cypress-Olive writhing fire-bark veins!
    paintTurbulentStream(
      dab,
      pts,
      7.2 * s,
      16.5 * s,
      8.8 * s,
      (k) => (k % 3 === 0 ? C.CYPRESS_OLIVE : k % 3 === 1 ? C.BURNT_UMBER : C.CADMIUM_ORANGE),
      seedB + 11,
      1.0,
      4
    );

    // 3. #85 Guardrail ①: Discontinuous Bright Chrome-Yellow & Turquoise Palette-Knife Catchlight Ridge along upper edge!
    if (hasBrightSpine) {
      const upNx = ny < 0 ? nx : -nx;
      const upNy = ny < 0 ? ny : -ny;
      for (let i = 1; i < pts.length - 1; i += 2) {
        const pt = pts[i];
        const pNext = pts[i + 1];
        const tang = Math.atan2(pNext.y - pt.y, pNext.x - pt.x);
        const col = (i + seedB) % 4 === 0 ? C.TURQUOISE : i % 2 === 0 ? C.LEMON_YELLOW : C.CHROME_YELLOW;
        dab(col, pt.x + upNx * 3.6 * s, pt.y + upNy * 3.6 * s - 1.2 * s, tang, 15.5 * s, 5.6 * s, 1);
      }
    }

    // Sprouting miniature cypress-flame thorn shoots licking off the branch!
    const midPt = pts[5];
    dab(C.BURNT_UMBER, midPt.x + nx * 5 * s, midPt.y - 6 * s, -1.25, 14 * s, 5.8 * s, 5);
  };

  // Helper C: Impasto Leg & Flaming Crank Branch
  const drawImpastoLeg = (hipPt, kneePt, footPt, pedalPt, isFar) => {
    drawFlameWoodBranch(rig.bb, pedalPt, 4.5 * s, isFar ? 201 : 205, true);

    paintTurbulentStream(dab, [hipPt, kneePt, footPt], 8.0 * s, 20 * s, 12.5 * s, C.PRUSSIAN_DARK, isFar ? 210 : 215, 1.0, 0);
    paintTurbulentStream(
      dab,
      [hipPt, kneePt, footPt],
      7.5 * s,
      17.5 * s,
      9.0 * s,
      isFar ? C.CADMIUM_ORANGE : C.CHROME_YELLOW,
      isFar ? 211 : 216,
      1.1,
      1
    );

    dab(C.PRUSSIAN_DARK, footPt.x + 4 * s, footPt.y + 3 * s, 0.12, 24 * s, 12 * s, 5);
    dab(C.CADMIUM_ORANGE, footPt.x + 5 * s, footPt.y + 2 * s, 0.12, 20 * s, 9 * s, 1);
    // Glowing star-ember pedal platform
    dab(C.LEMON_YELLOW, pedalPt.x, pedalPt.y + 2.8 * s, 0, 21 * s, 8.0 * s, 1);
    dab(C.TITANIUM, pedalPt.x, pedalPt.y + 2.2 * s, 0, 12 * s, 5.0 * s, 1);
  };

  // 2. Far Leg & Both Blazing 4-Arm Nebula Vortex Wheels
  drawImpastoLeg(rig.leftHip, rig.leftKnee, rig.leftFoot, rig.leftPedal, true);
  drawBurningNebulaWheel(rig.rearWheel, 0.0);
  drawBurningNebulaWheel(rig.frontWheel, 0.35);

  // 3. Swirling Star-Fire Chain Stream & Writhing Cypress-Flame Branch Frame + Blazing Golden Star-Core Crankset!
  const chainStream = sampleQuad(
    { x: rig.rearWheel.x, y: rig.rearWheel.y - 4 * s },
    { x: (rig.rearWheel.x + rig.bb.x) * 0.5, y: (rig.rearWheel.y + rig.bb.y) * 0.5 - 12 * s },
    { x: rig.bb.x, y: rig.bb.y - 12 * s },
    7
  );
  paintTurbulentStream(
    dab,
    chainStream,
    8.5 * s,
    14 * s,
    5.8 * s,
    (k) => ((k + Math.floor(rig.pedalAngle * 3)) % 2 === 0 ? C.LEMON_YELLOW : C.TURQUOISE),
    230,
    1.5,
    5
  );

  // Writhing organic Cypress-Flame Wood Branches replacing every rigid diamond frame tube!
  drawFlameWoodBranch(rig.rearWheel, rig.seatCluster, -9.5 * s, 301, true);
  drawFlameWoodBranch(rig.rearWheel, rig.bb, 8.0 * s, 307, true);
  drawFlameWoodBranch(rig.seatCluster, rig.bb, -7.5 * s, 313, true);
  drawFlameWoodBranch(rig.seatCluster, rig.headTop, -10.5 * s, 319, true); // Arched flame top-bough!
  drawFlameWoodBranch(rig.bb, rig.headBot, 9.5 * s, 325, true);           // Sinuous flame down-bough!
  drawFlameWoodBranch(rig.headTop, rig.headBot, 5.0 * s, 331, true);
  drawFlameWoodBranch(rig.headBot, rig.frontWheel, 9.0 * s, 337, true);   // Curved organic fork bough!
  drawFlameWoodBranch(rig.seatCluster, rig.saddle, -4.5 * s, 343, true);

  // Curled Crescent Star-Shoot Handlebars!
  const hornBarPts = sampleCubic(
    rig.headTop,
    { x: rig.stemTop.x - 8 * s, y: rig.stemTop.y - 10 * s },
    { x: rig.handleGrip.x + 12 * s, y: rig.handleGrip.y - 14 * s },
    rig.handleGrip,
    9
  );
  paintTurbulentStream(dab, hornBarPts, 6.2 * s, 17 * s, 10.5 * s, C.CYPRESS_DARK, 350, 0.9, 2);
  paintTurbulentStream(dab, hornBarPts, 6.5 * s, 15 * s, 6.8 * s, (k) => (k % 2 === 0 ? C.CHROME_YELLOW : C.TURQUOISE), 352, 0.8, 1);
  // Glowing starlight bud at handlebar curl tip
  dab(C.LEMON_YELLOW, rig.handleGrip.x + 3 * s, rig.handleGrip.y - 2 * s, 0.5, 14 * s, 9 * s, 7);

  // #85 Guardrail ①: Blazing Rotating Golden Star-Core Crankset right between the pelican's pedaling feet!
  for (let i = 0; i < 8; i++) {
    const a = rig.pedalAngle + (i * Math.PI * 2) / 8;
    dab(
      i % 2 === 0 ? C.LEMON_YELLOW : C.CHROME_YELLOW,
      rig.bb.x + Math.cos(a) * 13 * s,
      rig.bb.y + Math.sin(a) * 13 * s,
      a + 0.9,
      15 * s,
      7.2 * s,
      5
    );
  }
  dab(C.CADMIUM_ORANGE, rig.bb.x, rig.bb.y, rig.pedalAngle, 18 * s, 15 * s, 7);
  dab(C.TITANIUM, rig.bb.x, rig.bb.y, rig.pedalAngle + 1.57, 10.5 * s, 9.5 * s, 1);

  // Flaming Cadmium-Red & Burnt-Umber Torch-Nest Saddle!
  dab(C.PRUSSIAN_DARK, rig.saddle.x, rig.saddle.y + 1 * s, 0.05, 34 * s, 14 * s, 0);
  dab(C.BURNT_UMBER, rig.saddle.x - 6 * s, rig.saddle.y, -0.18, 24 * s, 10.5 * s, 5);
  dab(C.CADMIUM_RED, rig.saddle.x, rig.saddle.y - 1 * s, 0.04, 22 * s, 10 * s, 1);
  dab(C.CHROME_YELLOW, rig.saddle.x - 11 * s, rig.saddle.y - 3 * s, -0.35, 16 * s, 6.8 * s, 5);

  // 4. Turbulent Multi-Variant Shingled Impasto Pelican Torso, Tail & S-Neck!
  const backCurve = sampleQuad(
    rig.tailTip,
    { x: rig.bodyCenter.x - 36 * s, y: rig.bodyCenter.y - 31 * s },
    { x: rig.chest.x + 10 * s, y: rig.chest.y - 6 * s },
    12
  );
  const bellyCurve = sampleQuad(
    rig.tailTip,
    { x: rig.bodyCenter.x - 8 * s, y: rig.bodyCenter.y + 32 * s },
    { x: rig.chest.x + 9 * s, y: rig.chest.y + 9 * s },
    12
  );
  const neckCenterPts = sampleCubic(
    { x: rig.chest.x - 1 * s, y: rig.chest.y + 3 * s },
    rig.neckC1,
    rig.neckC2,
    rig.head,
    12
  );
  const neckBackPts = sampleCubic(
    { x: rig.chest.x - 10 * s, y: rig.chest.y - 1 * s },
    { x: rig.neckC1.x - 9 * s, y: rig.neckC1.y },
    { x: rig.neckC2.x - 10 * s, y: rig.neckC2.y },
    { x: rig.head.x - 10 * s, y: rig.head.y },
    12
  );
  const neckFrontPts = sampleCubic(
    { x: rig.chest.x + 8 * s, y: rig.chest.y + 7 * s },
    { x: rig.neckC1.x + 9 * s, y: rig.neckC1.y + 2 * s },
    { x: rig.neckC2.x + 9 * s, y: rig.neckC2.y + 2 * s },
    { x: rig.head.x + 8 * s, y: rig.head.y + 5 * s },
    12
  );

  // Dark Prussian aura outline dabs around Torso & Neck
  paintTurbulentStream(dab, backCurve, 7.5 * s, 23 * s, 14.5 * s, C.PRUSSIAN_DARK, 401, 1.4, 0);
  paintTurbulentStream(dab, bellyCurve, 7.5 * s, 23 * s, 14.5 * s, C.PRUSSIAN_DARK, 402, 1.4, 0);
  paintTurbulentStream(dab, neckBackPts, 7.0 * s, 21 * s, 13.5 * s, C.PRUSSIAN_DARK, 403, 1.2, 0);
  paintTurbulentStream(dab, neckFrontPts, 7.0 * s, 21 * s, 13.5 * s, C.PRUSSIAN_DARK, 404, 1.2, 0);

  // 7 Swirling Shingled Plumage Rows (Creamy Titanium + Naples Yellow + Pale Ice + Cerulean!)
  for (let row = 0; row <= 6; row++) {
    const v = row / 6;
    const rowPts = backCurve.map((bp, idx) => ({
      x: lerp(bp.x, bellyCurve[idx].x, v),
      y: lerp(bp.y, bellyCurve[idx].y, v),
    }));
    paintTurbulentStream(
      dab,
      rowPts,
      6.6 * s,
      21 * s,
      12 * s,
      (k) => {
        if (k === 0) return C.COBALT;
        if (row <= 1) return k % 3 === 0 ? C.NAPLES_YELLOW : C.TITANIUM;
        if (row <= 3) return k % 4 === 0 ? C.PALE_ICE : C.TITANIUM;
        if (row === 4) return k % 2 === 0 ? C.NAPLES_YELLOW : C.PALE_ICE;
        return k % 2 === 0 ? C.PALE_ICE : C.CERULEAN;
      },
      410 + row * 3,
      1.8,
      row <= 1 ? 1 : -1
    );
  }

  for (let nLane = 0; nLane <= 4; nLane++) {
    const nv = nLane / 4;
    const lanePts = neckBackPts.map((bp, idx) => ({
      x: lerp(bp.x, neckFrontPts[idx].x, nv),
      y: lerp(bp.y, neckFrontPts[idx].y, nv),
    }));
    paintTurbulentStream(
      dab,
      lanePts,
      6.4 * s,
      19 * s,
      11 * s,
      (k) => {
        if (nLane === 0) return k % 2 === 0 ? C.PALE_ICE : C.CERULEAN;
        if (nLane === 4) return k % 2 === 0 ? C.NAPLES_YELLOW : C.TITANIUM;
        return C.TITANIUM;
      },
      430 + nLane * 5,
      1.4,
      -1
    );
  }
  paintTurbulentStream(dab, neckCenterPts, 6.5 * s, 20 * s, 11.8 * s, C.TITANIUM, 455, 1.0, 1);

  // Swirling Van Gogh Impasto Cranium & Flaming Crown Crest Feathers!
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI * 2) / 12;
    dab(C.PRUSSIAN_DARK, rig.head.x + Math.cos(a) * 16.5 * s, rig.head.y + Math.sin(a) * 16.5 * s, a + 1.57, 17 * s, 10.5 * s, 2);
  }
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI * 2) / 10 + 0.3;
    const col = i % 3 === 0 ? C.NAPLES_YELLOW : i % 3 === 1 ? C.PALE_ICE : C.TITANIUM;
    dab(col, rig.head.x + Math.cos(a) * 10 * s, rig.head.y + Math.sin(a) * 10 * s, a + 1.57, 17 * s, 11 * s, (i % 4) + 1);
  }
  dab(C.TITANIUM, rig.head.x, rig.head.y, rig.head.angle, 19 * s, 13.5 * s, 1);

  dab(C.PRUSSIAN_DARK, rig.crest1.x - 2 * s, rig.crest1.y, -2.5, 20 * s, 9 * s, 5);
  dab(C.LEMON_YELLOW, rig.crest1.x, rig.crest1.y, -2.5, 18 * s, 8 * s, 5);
  dab(C.TITANIUM, rig.crest2.x, rig.crest2.y, -2.8, 17 * s, 8 * s, 5);

  // 5. Palette-Knife Cadmium-Orange, Chrome-Yellow & Cadmium-Red Beak & Gular Throat Pouch!
  const pouchCurve = sampleQuad(
    rig.beakLowerBase,
    rig.pouchBelly,
    { x: rig.beakTip.x - 3 * s, y: rig.beakTip.y + 1 * s },
    10
  );
  const upperBeakPts = [
    rig.beakUpperBase,
    { x: lerp(rig.beakUpperBase.x, rig.beakTip.x, 0.5), y: lerp(rig.beakUpperBase.y, rig.beakTip.y, 0.5) - 2 * s },
    { x: rig.beakTip.x + 2 * s, y: rig.beakTip.y - 1 * s },
  ];

  paintTurbulentStream(dab, pouchCurve, 7.0 * s, 20 * s, 12.5 * s, C.PRUSSIAN_DARK, 470, 1.1, 0);
  paintTurbulentStream(dab, upperBeakPts, 7.5 * s, 21 * s, 12.5 * s, C.PRUSSIAN_DARK, 471, 1.0, 0);

  for (let r = 0; r <= 3; r++) {
    const pv = 0.25 + (r / 3) * 0.75;
    const rowPts = pouchCurve.map((pt, idx) => {
      const u = idx / (pouchCurve.length - 1);
      const topX = lerp(rig.beakLowerBase.x, rig.beakTip.x - 3 * s, u);
      const topY = lerp(rig.beakLowerBase.y, rig.beakTip.y, u);
      return { x: lerp(topX, pt.x, pv), y: lerp(topY, pt.y, pv) };
    });
    paintTurbulentStream(
      dab,
      rowPts,
      6.6 * s,
      18 * s,
      10.2 * s,
      (k) => (r >= 2 ? C.CADMIUM_RED : k % 2 === 0 ? C.CADMIUM_ORANGE : C.CADMIUM_RED),
      480 + r,
      1.2,
      r === 1 ? 4 : 1
    );
  }

  paintTurbulentStream(
    dab,
    upperBeakPts,
    6.6 * s,
    19 * s,
    9.2 * s,
    (k) => (k % 2 === 0 ? C.CHROME_YELLOW : C.LEMON_YELLOW),
    490,
    0.8,
    1
  );
  dab(C.CADMIUM_RED, rig.beakTip.x + 1 * s, rig.beakTip.y + 3 * s, 1.15, 15 * s, 9 * s, 5);

  // Expressive Star-Gold Van Gogh Eye Dab
  const ex = rig.head.x + 4.5 * s;
  const ey = rig.head.y - 2.5 * s;
  dab(C.LEMON_YELLOW, ex, ey, 0.1, 13 * s, 10.5 * s, 7);
  dab(C.PRUSSIAN_DARK, ex + 1 * s, ey, 0, 8.2 * s, 7.5 * s, 7);
  dab(C.TITANIUM, ex - 1 * s, ey - 1.5 * s, 0, 4.8 * s, 4.2 * s, 1);

  // 6. Near Leg & Foreground Arched Impasto Wing gripping Curled Star-Shoot Handlebar!
  drawImpastoLeg(rig.rightHip, rig.rightKnee, rig.rightFoot, rig.rightPedal, false);

  const wingBotPts = sampleQuad(
    rig.wingShoulder,
    { x: rig.wingElbow.x - 16 * s, y: rig.wingElbow.y + 19 * s },
    { x: rig.wingTip.x + 4 * s, y: rig.wingTip.y + 2 * s },
    9
  );
  const wingTopPts = sampleQuad(
    { x: rig.wingShoulder.x + 12 * s, y: rig.wingShoulder.y + 2 * s },
    { x: rig.wingElbow.x + 12 * s, y: rig.wingElbow.y - 8 * s },
    { x: rig.wingTip.x + 4 * s, y: rig.wingTip.y + 2 * s },
    9
  );

  paintTurbulentStream(dab, wingBotPts, 7.2 * s, 20 * s, 11.5 * s, C.PRUSSIAN_DARK, 501, 1.2, 0);
  paintTurbulentStream(dab, wingTopPts, 7.2 * s, 19 * s, 10.5 * s, C.PRUSSIAN_DARK, 502, 1.2, 0);

  for (let tier = 0; tier <= 3; tier++) {
    const tv = tier / 3;
    const tierPts = wingTopPts.map((tp, idx) => ({
      x: lerp(tp.x, wingBotPts[idx].x, tv),
      y: lerp(tp.y, wingBotPts[idx].y, tv),
    }));
    paintTurbulentStream(
      dab,
      tierPts,
      6.5 * s,
      19 * s,
      10.2 * s,
      (k) => {
        if (k >= tierPts.length - 2) return C.TURQUOISE;
        if (tier <= 1) return k % 2 === 0 ? C.TITANIUM : C.NAPLES_YELLOW;
        if (tier === 2) return k % 2 === 0 ? C.PALE_ICE : C.TITANIUM;
        return k % 2 === 0 ? C.CERULEAN : C.PALE_ICE;
      },
      510 + tier * 3,
      1.5,
      tier === 0 ? 1 : 2
    );
  }

  restore();
}

/**
 * Dynamic Layer 1b: Awakening Saint-Rémy Village Cottage & Gothic Lancet Windows (`x ∈ [462..896]`).
 * 9 warm chrome-yellow (`#ffd447` / `#ff9f2e`) impasto windows light up one after another with soft
 * orbiting impasto halo strokes as `pelicanLocalX` rides past each house (`smoothstep(houseX - 90, houseX + 30, pelicanLocalX)`)!
 */
const VILLAGE_WINDOWS_9 = [
  { x: 462, y: 623.5, houseX: 462, isLancet: false, scale: 1.08 },
  { x: 506, y: 625.5, houseX: 506, isLancet: false, scale: 1.14 },
  { x: 562, y: 621.0, houseX: 562, isLancet: false, scale: 1.06 },
  { x: 642, y: 616.5, houseX: 642, isLancet: true, scale: 1.04 },
  { x: 656, y: 546.0, houseX: 656, isLancet: true, scale: 1.24 }, // Saint-Rémy Church belfry lancet!
  { x: 722, y: 624.2, houseX: 722, isLancet: false, scale: 1.14 },
  { x: 786, y: 620.1, houseX: 786, isLancet: false, scale: 1.06 },
  { x: 844, y: 626.6, houseX: 844, isLancet: false, scale: 1.10 },
  { x: 896, y: 623.0, houseX: 896, isLancet: false, scale: 1.04 },
];

function drawAwakeningVillageWindows(ctx, atlas, pelicanLocalX, t, isOutroThumbnail = false) {
  const { dab, restore } = createDabPainter(ctx, atlas);

  // Pass 1: Soft orbiting impasto halo brushstrokes & warm sill reflections via atlas
  for (let idx = 0; idx < VILLAGE_WINDOWS_9.length; idx++) {
    const w = VILLAGE_WINDOWS_9[idx];
    const lit = isOutroThumbnail ? 1.0 : smoothstep(w.houseX - 90, w.houseX + 30, pelicanLocalX);
    if (lit <= 0.015) continue;

    const sc = w.scale * (0.80 + 0.20 * lit);
    const flicker = 1 + 0.08 * Math.sin(t * 5.8 + idx * 1.9);

    // Outer soft impasto halo ring (8 curved hog-bristle / comma strokes, zero radial gradients!)
    ctx.globalAlpha = clamp(lit * 0.62, 0, 1);
    const haloCount = 8;
    for (let h = 0; h < haloCount; h++) {
      const a = (h * Math.PI * 2) / haloCount + idx * 0.4 + Math.sin(t * 1.8 + idx) * 0.08;
      const hr = (w.isLancet ? 15.2 : 13.8) * sc * flicker;
      const hx = w.x + Math.cos(a) * hr * 0.94;
      const hy = w.y + Math.sin(a) * hr * (w.isLancet ? 1.18 : 0.98);
      dab(
        h % 3 === 0 ? C.LEMON_YELLOW : h % 2 === 0 ? C.CHROME_YELLOW : C.CADMIUM_ORANGE,
        hx,
        hy,
        a + Math.PI * 0.5,
        16.5 * sc,
        7.8 * sc,
        2
      );
    }

    // Warm Burnt-Umber & Cadmium-Orange impasto glow bed + sill reflection
    ctx.globalAlpha = clamp(lit * 0.92, 0, 1);
    dab(C.BURNT_UMBER, w.x, w.y + 6.2 * sc, 0.04, 21 * sc, 8.6 * sc, 3);
    dab(C.CADMIUM_ORANGE, w.x, w.y, Math.PI * 0.5, (w.isLancet ? 22 : 18.5) * sc, 14.0 * sc, 7);
    dab(C.CHROME_YELLOW, w.x, w.y, Math.PI * 0.5, (w.isLancet ? 17.5 : 14.2) * sc, 10.8 * sc, 1);
  }
  ctx.globalAlpha = 1;
  restore();

  // Pass 2: Tactile palette-knife `#ff9f2e` & `#ffd447` impasto window panes + rustic casement bar
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (let idx = 0; idx < VILLAGE_WINDOWS_9.length; idx++) {
    const w = VILLAGE_WINDOWS_9[idx];
    const lit = isOutroThumbnail ? 1.0 : smoothstep(w.houseX - 90, w.houseX + 30, pelicanLocalX);
    if (lit <= 0.02) continue;

    const sc = w.scale * (0.78 + 0.22 * lit);
    const pw = (w.isLancet ? 4.4 : 5.5) * sc;
    const ph = (w.isLancet ? 8.8 : 6.4) * sc;

    ctx.globalAlpha = clamp(lit * 0.99, 0, 1);

    // Warm amber-orange impasto bevel (`#ff9f2e`)
    ctx.fillStyle = '#ff9f2e';
    ctx.beginPath();
    if (w.isLancet) {
      ctx.moveTo(w.x - pw * 1.15, w.y + ph);
      ctx.lineTo(w.x - pw * 1.1, w.y - ph * 0.25);
      ctx.quadraticCurveTo(w.x - pw * 0.5, w.y - ph * 1.18, w.x, w.y - ph * 1.32);
      ctx.quadraticCurveTo(w.x + pw * 0.5, w.y - ph * 1.18, w.x + pw * 1.1, w.y - ph * 0.25);
      ctx.lineTo(w.x + pw * 1.15, w.y + ph);
    } else {
      ctx.moveTo(w.x - pw * 1.12, w.y - ph * 0.95);
      ctx.lineTo(w.x + pw * 1.16, w.y - ph * 1.02);
      ctx.lineTo(w.x + pw * 1.10, w.y + ph * 1.04);
      ctx.lineTo(w.x - pw * 1.14, w.y + ph * 0.98);
    }
    ctx.closePath();
    ctx.fill();

    // Thick glowing Chrome-Yellow impasto pane core (`#ffd447`)
    ctx.fillStyle = '#ffd447';
    ctx.beginPath();
    if (w.isLancet) {
      ctx.moveTo(w.x - pw * 0.80, w.y + ph * 0.80);
      ctx.lineTo(w.x - pw * 0.77, w.y - ph * 0.22);
      ctx.quadraticCurveTo(w.x, w.y - ph * 1.06, w.x + pw * 0.77, w.y - ph * 0.22);
      ctx.lineTo(w.x + pw * 0.80, w.y + ph * 0.80);
    } else {
      ctx.moveTo(w.x - pw * 0.82, w.y - ph * 0.70);
      ctx.lineTo(w.x + pw * 0.86, w.y - ph * 0.76);
      ctx.lineTo(w.x + pw * 0.80, w.y + ph * 0.76);
      ctx.lineTo(w.x - pw * 0.84, w.y + ph * 0.72);
    }
    ctx.closePath();
    ctx.fill();

    // Wet oil palette-knife catchlight ridge (`#fff5ba`) + subtle Prussian mullion division on cottage windows
    ctx.strokeStyle = '#fff5ba';
    ctx.lineWidth = 1.6 * sc;
    ctx.beginPath();
    ctx.moveTo(w.x - pw * 0.44, w.y - ph * 0.54);
    ctx.lineTo(w.x - pw * 0.40, w.y + ph * 0.44);
    ctx.stroke();

    if (!w.isLancet && lit > 0.35) {
      ctx.strokeStyle = 'rgba(26, 44, 78, 0.58)';
      ctx.lineWidth = 1.2 * sc;
      ctx.beginPath();
      ctx.moveTo(w.x + 0.3, w.y - ph * 0.72);
      ctx.lineTo(w.x - 0.2, w.y + ph * 0.72);
      ctx.stroke();
    }
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
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  const wheelAngle = pelicanLocalX / 46;
  const syncGlow = isOutroThumbnail
    ? 0.95
    : smoothstep(1.4, 2.1, localT) * (1 - smoothstep(3.9, 4.6, localT));

  const atlas = getImpastoAtlas(kit);

  // 1. Baked Linen Canvas + Full-Height Turbulent Impasto Sky/Hills + Spire & Midnight Prussian Road
  const backdrop = getStarryBackdrop(kit, atlas);
  ctx.drawImage(backdrop.canvas, 0, 0);

  // 1b. Awakening Saint-Rémy Village Cottage & Lancet Windows lighting up sequentially as pelican passes!
  drawAwakeningVillageWindows(ctx, atlas, pelicanLocalX, t, isOutroThumbnail);

  // 2. Streamline-Advecting Giant S-Vortices, Fat C-Crescent Moon & 11 Hierarchical Star Halos
  drawWheelSyncedStarrySky(ctx, atlas, wheelAngle, syncGlow, t);

  // 3. Asymmetric 4-Spire Gothic Flame Cypress Tree with Spatial Slipstream Wake Whip & Spiraling Sparks!
  drawFlameCypress(ctx, atlas, pedalAngle, pelicanLocalX, localT, t, isOutroThumbnail);

  // 4. Impasto Pelican riding Twin Nebula Fire-Vortex Wheels & Writhing Cypress-Flame Branch Frame!
  if (pelicanLocalX > -240 && pelicanLocalX < PANEL_SIZE + 240) {
    const { y: roadY, slope } = sampleStarryRoad(kit, pelicanLocalX);
    const rig = computePelicanRig({
      x: pelicanLocalX,
      y: roadY,
      pedalAngle,
      wheelAngle,
      scale: 1.0,
      slope,
      speedScale,
      time: t,
    });
    drawImpastoPelicanAndBike(ctx, atlas, rig, syncGlow, t);
  }

  // 5. 100% Pure Unobstructed Oil Painting Canvas! (Only render bottom strip for Outro 7x3 wall thumbnail)
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(11, 18, 34, 0.80)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.fillStyle = '#fcf6e3';
    ctx.font = '700 48px "PelicanSerif", serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} ${scene.zh}`, 36, PANEL_SIZE - 48);
  }

  ctx.restore();
}
