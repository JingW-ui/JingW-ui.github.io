// src/scenes/s14_nosferatu.js
// #14 《诺斯费拉图》 (1922 · Silent Expressionist Shadow) — r3 Museum-Authentic Nitrate Print
// Homage to F. W. Murnau's 1922 orthochromatic silver-gelatin silent horror print (amber/sepia split-toned).
// - IRON RULE: ZERO physical pelican or physical bicycle anywhere in frame—ONLY its monstrous,
//   Count-Orlok-deformed shadow projected onto the weathered medieval castle stairwell wall!
// - Per-pixel synthesized spalled lime-plaster, irregular stone masonry, fractal saltpeter seepage,
//   soft 64px-wide optical penumbra vault arch (#85 Director Fix), hand-forged leaded Gothic window
//   with orthochromatic halation bloom, and chemical amber-sepia / Prussian-charcoal split-toning
// - True Optical Wall-Shadow Physics:
//   (1) Contact-hardening variable penumbra (razor-sharp dark umbra where tires touch stone steps ->
//       progressively wider/softer penumbra up at the hunched Orlok spine, scythe beak & bat-bone wingtips)
//   (2) 3D stair-riser & spalled-plaster geometric displacement (`折角投影`) warping spokes, rims & claws
// - 18Hz hand-cranked silent-film gate weave, clumped midtone-weighted silver-halide emulsion grain,
//   Bar 2 ominous candle-dip shadow looming, 35mm nitrate rounded film-gate aperture mask (zero top-left box!),
//   and `localT > 5.4s` CRT high-voltage corona discharge & phosphor emulsion burn into #15 `(1000, 680)`!

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  clamp,
  lerp,
  smoothstep,
  smootherstep,
} from '../beat/timeline.js';
import { computePelicanRig } from '../rig/pelican.js';
import { makePRNG, hashSeed } from '../kit/kit.js';

const RELIEF_GRID_N = 256;
let _cachedWallRelief = null;

/**
 * Fast deterministic integer hash in [0, 1) for procedural stone, plaster & grain synthesis.
 */
function hash2i(ix, iy, seed = 141922) {
  let h = (Math.imul(ix | 0, 374761393) + Math.imul(iy | 0, 668265263) + Math.imul(seed | 0, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) * 2.3283064365386963e-10;
}

function valueNoise2D(x, y, seed = 141922) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2i(ix, iy, seed);
  const b = hash2i(ix + 1, iy, seed);
  const c = hash2i(ix, iy + 1, seed);
  const d = hash2i(ix + 1, iy + 1, seed);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
}

function fbm2D(x, y, octaves = 4, seed = 141922) {
  let sum = 0;
  let amp = 0.5;
  let freq = 1.0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise2D(x * freq, y * freq, seed + i * 97);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return sum / norm;
}

/**
 * Voronoi cellular distance difference (F2 - F1) for authentic fractured lime-plaster spalling
 * and irregular hand-dressed medieval rubble stone joints (zero rectangular CSS grids!).
 */
function cellularEdge2D(x, y, seed = 7719) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  let d1 = 99;
  let d2 = 99;
  let cellId = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = ix + dx;
      const cy = iy + dy;
      const px = cx + 0.16 + 0.68 * hash2i(cx, cy, seed);
      const py = cy + 0.16 + 0.68 * hash2i(cx, cy, seed + 31);
      const dist = Math.hypot(px - x, py - y);
      if (dist < d1) {
        d2 = d1;
        d1 = dist;
        cellId = hash2i(cx, cy, seed + 79);
      } else if (dist < d2) {
        d2 = dist;
      }
    }
  }
  return { edge: d2 - d1, d1, cellId };
}

/**
 * Builds & caches the 256x256 castle wall heightmap & spalling map once, shared by both
 * the per-pixel plaster/stone renderer and the 3D wall-shadow displacement engine!
 */
function getWallReliefField() {
  if (_cachedWallRelief) return _cachedWallRelief;
  const height = new Float32Array(RELIEF_GRID_N * RELIEF_GRID_N);
  const spall = new Float32Array(RELIEF_GRID_N * RELIEF_GRID_N);

  for (let gy = 0; gy < RELIEF_GRID_N; gy++) {
    const wy = (gy / (RELIEF_GRID_N - 1)) * PANEL_SIZE;
    for (let gx = 0; gx < RELIEF_GRID_N; gx++) {
      const wx = (gx / (RELIEF_GRID_N - 1)) * PANEL_SIZE;
      const idx = gy * RELIEF_GRID_N + gx;

      // Broad plaster unevenness + Voronoi spalling islands exposing recessed irregular stone masonry
      const plasterMacro = fbm2D(wx * 0.0055, wy * 0.0062, 4, 1922);
      const spallZone =
        fbm2D(wx * 0.0085 + 3.1, wy * 0.0095 + 1.7, 3, 2911) * 0.72 +
        0.28 * cellularEdge2D(wx * 0.011, wy * 0.012, 4013).cellId;

      const isSpalled = smoothstep(0.55, 0.63, spallZone);

      // Irregular coursed rubble masonry joints (warped horizontal courses + staggered vertical joints)
      const courseWarp = (fbm2D(wx * 0.018, wy * 0.018, 2, 5101) - 0.5) * 9.0;
      const rowF = (wy + courseWarp) / 27.0;
      const rowIdx = Math.floor(rowF);
      const rowFrac = rowF - rowIdx;
      const hMortar = 1 - smoothstep(0.0, 0.13, Math.min(rowFrac, 1 - rowFrac));

      const colOffset = (rowIdx % 2) * 0.48 + (hash2i(rowIdx, 3, 6113) - 0.5) * 0.25;
      const colWarp = (valueNoise2D(wx * 0.03, wy * 0.04, 6397) - 0.5) * 7.5;
      const colF = (wx + colWarp) / 54.0 + colOffset;
      const colIdx = Math.floor(colF);
      const colFrac = colF - colIdx;
      const vMortar = 1 - smoothstep(0.0, 0.09, Math.min(colFrac, 1 - colFrac));

      const stoneTilt = (hash2i(colIdx, rowIdx, 7219) - 0.5) * 0.35;
      const mortarGroove = Math.max(hMortar, vMortar);
      const stoneSurface = 0.28 + stoneTilt - mortarGroove * 0.78;

      // Plaster surface sits higher (+0.65) than recessed spalled stone; cracked fissures cut inward
      const crackCell = cellularEdge2D(wx * 0.017, wy * 0.014, 8821);
      const fissure = 1 - smoothstep(0.0, 0.045, crackCell.edge);

      const hVal =
        lerp(0.68 + (plasterMacro - 0.5) * 0.32, stoneSurface, isSpalled) -
        fissure * (1 - isSpalled * 0.5) * 0.34;

      height[idx] = hVal;
      spall[idx] = isSpalled;
    }
  }

  _cachedWallRelief = { height, spall };
  return _cachedWallRelief;
}

/**
 * Bilinearly samples the castle wall relief height at world coordinates `(wx, wy)`.
 */
function sampleWallHeight(wx, wy) {
  const { height } = getWallReliefField();
  const gx = clamp((wx / PANEL_SIZE) * (RELIEF_GRID_N - 1), 0, RELIEF_GRID_N - 1.001);
  const gy = clamp((wy / PANEL_SIZE) * (RELIEF_GRID_N - 1), 0, RELIEF_GRID_N - 1.001);
  const x0 = gx | 0;
  const y0 = gy | 0;
  const fx = gx - x0;
  const fy = gy - y0;
  const row0 = y0 * RELIEF_GRID_N;
  const row1 = (y0 + 1) * RELIEF_GRID_N;
  const h00 = height[row0 + x0];
  const h10 = height[row0 + x0 + 1];
  const h01 = height[row1 + x0];
  const h11 = height[row1 + x0 + 1];
  return lerp(lerp(h00, h10, fx), lerp(h01, h11, fx), fy);
}

/**
 * Evaluates the shadow's staircase climb trajectory across x in [0, 1000]:
 * - Starts at (0, 680) with slope 0
 * - Climbs steadily up 13 steep projected stone steps across x = 0..695 (y: 680 -> 504)
 * - Glides down the slanted upper-right moonlight corridor across x = 695..1000 back to (1000, 680)
 * Every single point sits over bright moonlit amber-sepia plaster (y <= 680 < 726)!
 */
function sampleStairShadowPath(rawX) {
  const x = clamp(rawX, 0, PANEL_SIZE);
  const peakX = 695;
  const climbHeight = 176; // 680 -> 504

  if (x <= peakX) {
    const u = x / peakX;
    const s = u * u * (3 - 2 * u);
    const dsdu = 6 * u * (1 - u);

    const stepEnv = smoothstep(30, 90, x) * smoothstep(peakX, peakX - 60, x);
    const stepPhase = ((x - 30) / 50.0) * Math.PI;
    const stepBounce = -3.4 * Math.abs(Math.sin(stepPhase)) * stepEnv;

    const y = ROAD_EDGE_Y - climbHeight * s + stepBounce;
    const dydx = (-climbHeight * dsdu) / peakX;
    return { y, slope: Math.atan(dydx) };
  }

  const spanR = PANEL_SIZE - peakX;
  const u2 = (x - peakX) / spanR;
  const s2 = u2 * u2 * (3 - 2 * u2);
  const ds2du = 6 * u2 * (1 - u2);
  const y = ROAD_EDGE_Y - climbHeight * (1 - s2);
  const dydx = (climbHeight * ds2du) / spanR;
  return { y, slope: Math.atan(dydx) };
}

/**
 * 3D Stair-Riser & Wall-Relief Geometric Shadow Displacement (`三维石阶与墙面浮雕折角投影`)!
 * Any shadow point `(wx, wy)` cast obliquely onto the stairwell wall kinks across the 13 stone
 * step treads/risers and ripples across spalled plaster & recessed mortar joints!
 */
function displaceShadowOnWall(wx, wy) {
  // 1. Stone wall spalling & mortar relief displacement
  const h = sampleWallHeight(wx, wy);
  let dx = (h - 0.55) * 4.8;
  let dy = -(h - 0.55) * 4.2;

  // 2. Projected 3D Staircase Molding / Step-Riser Jog along the lower stairwell band
  const numSteps = 13;
  const stepSpan = 695 / numSteps;
  if (wx > 8 && wx < 705) {
    const stairBaseY = sampleStairShadowPath(wx).y + 3;
    const distFromStair = Math.abs(wy - stairBaseY);
    // Strongest stair-step折角 within 95px of the stepped wall stringer & treads
    if (distFromStair < 98) {
      const prox = 1 - distFromStair / 98;
      const stepPhase = wx / stepSpan;
      const frac = stepPhase - Math.floor(stepPhase);
      // Sawtooth riser kink: sharp step-up at each vertical riser edge (frac near 0), flat across tread
      const riserJog = (smoothstep(0.0, 0.18, frac) - frac) * 11.5 * prox;
      dx -= riserJog * 0.62;
      dy += riserJog;
    }
  }

  return { x: wx + dx, y: wy + dy };
}

/**
 * Maps linear wall luminance `L in [0, 1]` to authentic 1922 Orthochromatic Nitrate Split-Toning:
 * - Cold Prussian-charcoal deep shadows -> dusty olive-taupe -> warm amber-sepia highlights!
 */
function orthochromaticSplitToneRGB(lum) {
  const L = clamp(lum, 0, 1);
  if (L < 0.22) {
    const u = L / 0.22;
    return [
      lerp(9, 44, u),
      lerp(9, 39, u),
      lerp(12, 34, u),
    ];
  }
  if (L < 0.64) {
    const u = (L - 0.22) / 0.42;
    return [
      lerp(44, 186, u),
      lerp(39, 161, u),
      lerp(34, 118, u),
    ];
  }
  const u = (L - 0.64) / 0.36;
  return [
    lerp(186, 244, u),
    lerp(161, 226, u),
    lerp(118, 178, u),
  ];
}

/**
 * Overhead crooked German Expressionist stone vault arch Y-boundary across `x in [0, 1000]`.
 * Evaluated softly over a `64px` optical penumbra transition (#85 Director Mandatory Fix!).
 */
function vaultArchCurveY(x) {
  const u = clamp(x / PANEL_SIZE, 0, 1);
  // Asymmetric German Expressionist Gothic vault: y≈342 at x=0, apex y≈34 at x=525, y≈228 at x=1000
  const leftSpan = u < 0.525 ? (0.525 - u) / 0.525 : 0;
  const rightSpan = u >= 0.525 ? (u - 0.525) / 0.475 : 0;
  const baseArch = 34 + leftSpan * leftSpan * 308 + rightSpan * rightSpan * 194;
  // Rough hand-dressed stone voussoir unevenness so it never reads as a smooth Bezier curve!
  const stoneWobble =
    (fbm2D(x * 0.016, 2.7, 3, 9311) - 0.5) * 22 +
    Math.sin(x * 0.055) * 4.5;
  return baseArch + stoneWobble;
}

/**
 * Draws an organic hand-wrought iron / rough stone path (replaces ruler-straight Canvas lines).
 */
function drawWroughtStroke(ctx, x0, y0, x1, y1, width, color, seed = 1) {
  const segs = 9;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    const wobble = (hash2i(i, seed, 3319) - 0.5) * width * 0.58;
    const px = lerp(x0, x1, u) + wobble;
    const py = lerp(y0, y1, u) - wobble * 0.6;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Bakes the 1000x1000 German Expressionist Gothic castle stairwell (`r3`):
 * - Per-pixel synthesized spalled plaster, irregular rubble stone courses, normal-mapped relief,
 *   fractal saltpeter efflorescence & damp seepage (ZERO fillRect bricks or ellipse mold spots!)
 * - Soft 64px-wide optical penumbra moonlight vault falloff (#85 Director Mandatory Fix!)
 * - Hand-forged crooked Gothic leaded quarry-glass window + orthochromatic emulsion halation bloom!
 * - Skewed Gothic window-lattice & stepped staircase/banister bar penumbra shadows on the bright wall
 * - Foreground rough-hewn black stone steps strictly below `y > 726`!
 */
function getBakedNosferatuCastle(kit) {
  return kit.bake2D('s14_nosferatu_castle_r3', (_g, ctx, rng, w, h) => {
    const { height, spall } = getWallReliefField();
    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    // 1. Per-Pixel Castle Plaster, Spalled Masonry, Fractal Seepage & Soft Optical Moonlight Vault!
    for (let y = 0; y < h; y++) {
      const gy = (y / (h - 1)) * (RELIEF_GRID_N - 1);
      const y0 = Math.min(RELIEF_GRID_N - 2, gy | 0);
      const fy = gy - y0;

      for (let x = 0; x < w; x++) {
        const pIdx = (y * w + x) * 4;

        // Below y = 760 is covered by foreground pitch-black stone stairs
        if (y > 768) {
          data[pIdx] = 9;
          data[pIdx + 1] = 8;
          data[pIdx + 2] = 10;
          data[pIdx + 3] = 255;
          continue;
        }

        const gx = (x / (w - 1)) * (RELIEF_GRID_N - 1);
        const x0 = Math.min(RELIEF_GRID_N - 2, gx | 0);
        const fx = gx - x0;
        const r0 = y0 * RELIEF_GRID_N;
        const r1 = (y0 + 1) * RELIEF_GRID_N;

        const hC = lerp(
          lerp(height[r0 + x0], height[r0 + x0 + 1], fx),
          lerp(height[r1 + x0], height[r1 + x0 + 1], fx),
          fy
        );
        const hR = height[r0 + Math.min(RELIEF_GRID_N - 1, x0 + 1)];
        const hD = height[Math.min(RELIEF_GRID_N - 1, y0 + 1) * RELIEF_GRID_N + x0];
        const spallAmt = lerp(
          lerp(spall[r0 + x0], spall[r0 + x0 + 1], fx),
          lerp(spall[r1 + x0], spall[r1 + x0 + 1], fx),
          fy
        );

        // Directional moonlight grazing normal from upper-left Gothic window!
        const nx = (hC - hR) * 3.4;
        const ny = (hC - hD) * 3.4;
        const reliefShade = clamp(0.5 + nx * 0.42 + ny * 0.58, 0.12, 0.96);

        // Soft 68px-wide optical penumbra vault arch falloff (#85 Fix: NO sharp Bezier cut!)
        const vEdge = vaultArchCurveY(x);
        const vaultPenumbra = smoothstep(vEdge - 34, vEdge + 38, y);

        // Broad German Expressionist diagonal moonlight corridor covering (0,680)->(695,504)->(1000,680)
        const distCenter = Math.hypot((x - 515) * 0.82, (y - 495) * 1.12);
        const radialMoon = 1 - smoothstep(140, 690, distCenter) * 0.48;

        // Soft-edged oblique window slash beam (penumbra width ~48px)
        const upperSlashY = x < 210 ? lerp(510, 158, x / 210) : lerp(158, 285, (x - 210) / 790);
        const slashMask = smoothstep(upperSlashY - 36, upperSlashY + 32, y);

        // Fractal vertical damp seepage & saltpeter efflorescence (`分形硝碱渗水纹`, NO ellipses!)
        const seepNoise = fbm2D(x * 0.022, y * 0.0065 - 0.4, 4, 3571);
        const dampStain = smoothstep(0.54, 0.78, seepNoise) * 0.22;
        // Crystalline pale saltpeter bloom along dampness edges
        const efflorescence =
          smoothstep(0.5, 0.545, seepNoise) * (1 - smoothstep(0.545, 0.59, seepNoise)) * 0.16;

        // Micro lime-sandstone grit
        const grit = (hash2i(x, y, 9901) - 0.5) * 0.055;

        let lum =
          (0.68 * radialMoon + 0.24 * slashMask) *
          (0.76 + 0.36 * reliefShade) *
          (1 - spallAmt * 0.18) -
          dampStain +
          efflorescence +
          grit;

        // Multiply by soft optical vault penumbra (retaining faint stone rib detail in vault shadow)
        lum = lerp(0.035 + reliefShade * 0.035, lum, vaultPenumbra);

        const [r, gCol, b] = orthochromaticSplitToneRGB(lum);
        data[pIdx] = r;
        data[pIdx + 1] = gCol;
        data[pIdx + 2] = b;
        data[pIdx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // 2. Jagged Branching Plaster Hairline Cracks
    for (let c = 0; c < 38; c++) {
      let cx = 35 + rng() * 930;
      let cy = Math.max(vaultArchCurveY(cx) + 10, 75 + rng() * 560);
      ctx.strokeStyle = `rgba(22, 19, 17, ${(0.14 + rng() * 0.2).toFixed(2)})`;
      ctx.lineWidth = 0.7 + rng() * 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      const segs = 5 + Math.floor(rng() * 6);
      for (let s = 0; s < segs; s++) {
        cx += (rng() - 0.48) * 18;
        cy += 10 + rng() * 22;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    // 3. Hand-Forged Crooked Gothic Lancet Window + Orthochromatic Emulsion Halation Bloom!
    ctx.save();
    // Deep irregular stone embrasure recess
    const traceIrregularLancet = (cx, apexY, springY, halfW, botY, tiltX, roughScale = 1) => {
      ctx.beginPath();
      const steps = 16;
      for (let i = 0; i <= steps; i++) {
        const u = i / steps;
        const wob = (hash2i(i, 17, 4421) - 0.5) * 2.8 * roughScale;
        const px = lerp(cx - halfW, cx + tiltX, Math.pow(u, 0.78)) + wob;
        const py = u < 0.35 ? lerp(botY, springY, u / 0.35) : lerp(springY, apexY, (u - 0.35) / 0.65);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      for (let i = 1; i <= steps; i++) {
        const u = i / steps;
        const wob = (hash2i(i, 53, 4421) - 0.5) * 2.8 * roughScale;
        const px = lerp(cx + tiltX, cx + halfW, Math.pow(u, 1.25)) + wob;
        const py = u < 0.65 ? lerp(apexY, springY, u / 0.65) : lerp(springY, botY, (u - 0.65) / 0.35);
        ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    traceIrregularLancet(212, 164, 248, 49, 404, -9, 1.4);
    ctx.fillStyle = '#151314';
    ctx.fill();

    // Glowing nocturnal sky / moonlight through antique bullseye & quarry glass
    traceIrregularLancet(216, 179, 254, 36, 391, -7, 0.9);
    const winGrad = ctx.createLinearGradient(195, 178, 236, 392);
    winGrad.addColorStop(0.0, '#fbf0d2');
    winGrad.addColorStop(0.55, '#dec696');
    winGrad.addColorStop(1.0, '#7c6b52');
    ctx.fillStyle = winGrad;
    ctx.fill();

    // Clip inside glazed lancet to draw irregular hand-leaded diamond quarry cames & hand-forged mullions!
    ctx.save();
    ctx.clip();
    // Diagonal leaded quarry-glass diamond cames (irregular hand-soldered lead strips)
    for (let d = -6; d <= 10; d++) {
      drawWroughtStroke(ctx, 168, 205 + d * 24, 262, 265 + d * 24, 1.3, 'rgba(32, 27, 23, 0.52)', d + 10);
      drawWroughtStroke(ctx, 168, 265 + d * 24, 262, 205 + d * 24, 1.3, 'rgba(32, 27, 23, 0.52)', d + 40);
    }
    // Hand-forged crooked vertical & horizontal iron casement bars
    for (const [bx, seed] of [[197, 1], [216, 2], [235, 3]]) {
      drawWroughtStroke(ctx, bx - 4, 184, bx + 1, 392, 3.4, '#141214', seed);
    }
    for (const [by, seed] of [[238, 5], [286, 6], [334, 7], [372, 8]]) {
      drawWroughtStroke(ctx, 176, by - 3, 254, by + 4, 3.1, '#141214', seed);
    }
    ctx.restore();

    // Weathered stone sill with chipped bevel
    ctx.fillStyle = '#cfb78c';
    ctx.beginPath();
    ctx.moveTo(158, 402);
    ctx.lineTo(212, 405);
    ctx.lineTo(268, 409);
    ctx.lineTo(276, 418);
    ctx.lineTo(150, 412);
    ctx.closePath();
    ctx.fill();

    // Orthochromatic Silver-Emulsion Halation Bloom (`高光乳剂漫射光晕`) bleeding over window frame!
    ctx.globalCompositeOperation = 'screen';
    const halation = ctx.createRadialGradient(214, 276, 12, 218, 286, 155);
    halation.addColorStop(0.0, 'rgba(255, 238, 194, 0.42)');
    halation.addColorStop(0.38, 'rgba(238, 208, 150, 0.19)');
    halation.addColorStop(0.75, 'rgba(210, 176, 118, 0.06)');
    halation.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = halation;
    ctx.fillRect(50, 110, 340, 350);
    ctx.restore();

    // 4. Skewed Off-Screen Gothic Window-Lattice Penumbra Shadow on Right Wall (`扭曲窗棂光学半影`)
    // Kept translucent (~0.21 alpha) with soft optical blur so right wall stays ~65%-84% bright!
    ctx.save();
    ctx.shadowColor = 'rgba(14, 12, 12, 0.34)';
    ctx.shadowBlur = 16;
    ctx.strokeStyle = 'rgba(22, 19, 17, 0.20)';
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(646, 698);
    ctx.lineTo(686, 346);
    ctx.quadraticCurveTo(736, 186, 836, 144);
    ctx.quadraticCurveTo(926, 196, 966, 366);
    ctx.lineTo(992, 698);
    ctx.stroke();

    for (const [mx, sd] of [[738, 11], [825, 12], [912, 13]]) {
      drawWroughtStroke(ctx, mx + 18, 176, mx - 28, 692, 9.5, 'rgba(22, 19, 17, 0.19)', sd);
    }
    for (const [my, sd] of [[266, 21], [366, 22], [466, 23], [566, 24]]) {
      drawWroughtStroke(ctx, 662, my - 22, 985, my + 34, 9.0, 'rgba(22, 19, 17, 0.18)', sd);
    }
    ctx.restore();

    // 5. Projected Stepped Staircase Molding & Wooden Banister Bar Penumbra Shadows (`楼梯栏杆斜影`)
    ctx.save();
    ctx.shadowColor = 'rgba(12, 10, 10, 0.36)';
    ctx.shadowBlur = 13;
    ctx.fillStyle = 'rgba(24, 20, 17, 0.21)';

    const numWallSteps = 13;
    ctx.beginPath();
    ctx.moveTo(0, 742);
    ctx.lineTo(0, ROAD_EDGE_Y + 3);
    for (let i = 0; i < numWallSteps; i++) {
      const xA = (i / numWallSteps) * 695;
      const xB = ((i + 1) / numWallSteps) * 695;
      const yB = sampleStairShadowPath(xB).y + 3;
      ctx.lineTo(xA + 1.5, yB);
      ctx.lineTo(xB, yB);
    }
    for (let x = 705; x <= w; x += 15) {
      ctx.lineTo(x, sampleStairShadowPath(x).y + 3);
    }
    ctx.lineTo(w, 742);
    ctx.closePath();
    ctx.fill();

    // Chipped stone tread shadow lip along the climb path
    ctx.lineWidth = 3.0;
    ctx.strokeStyle = 'rgba(30, 25, 20, 0.38)';
    ctx.beginPath();
    ctx.moveTo(0, ROAD_EDGE_Y + 3);
    for (let i = 0; i < numWallSteps; i++) {
      const xA = (i / numWallSteps) * 695;
      const xB = ((i + 1) / numWallSteps) * 695;
      const yB = sampleStairShadowPath(xB).y + 3;
      ctx.lineTo(xA + 1.5, yB);
      ctx.lineTo(xB, yB);
    }
    for (let x = 705; x <= w; x += 15) {
      ctx.lineTo(x, sampleStairShadowPath(x).y + 3);
    }
    ctx.stroke();

    // Oblique wooden handrail & 15 turned baluster bar shadows across lower wall
    drawWroughtStroke(ctx, -20, 648, 710, 468, 11.5, 'rgba(22, 18, 15, 0.24)', 61);
    drawWroughtStroke(ctx, 710, 468, w + 20, 642, 11.5, 'rgba(22, 18, 15, 0.24)', 62);
    for (let i = 0; i < 15; i++) {
      const bx = 24 + i * 68;
      const railY =
        bx <= 710 ? lerp(648, 468, bx / 710) : lerp(468, 642, (bx - 710) / 290);
      drawWroughtStroke(ctx, bx - 14, railY, bx + 18, 740, 8.2, 'rgba(22, 18, 15, 0.23)', 70 + i);
    }
    ctx.restore();

    // 6. Foreground Rough-Hewn Black Stone Staircase Silhouette (Strictly BELOW y > 726!)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, 786);
    const fgSteps = 12;
    for (let i = 0; i < fgSteps; i++) {
      const xA = (i / fgSteps) * 740;
      const xB = ((i + 1) / fgSteps) * 740;
      const yB = lerp(786, 726, (i + 1) / fgSteps);
      ctx.lineTo(xA + 1, yB + (hash2i(i, 1, 811) - 0.5) * 2.2);
      ctx.lineTo(xB, yB + (hash2i(i, 2, 811) - 0.5) * 2.2);
    }
    ctx.lineTo(w, 744);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = '#08080a';
    ctx.fill();

    // Worn amber-moonlight stone step nosing glints (hand-chipped, not ruler lines)
    for (let i = 0; i < fgSteps; i++) {
      const xA = (i / fgSteps) * 740;
      const xB = ((i + 1) / fgSteps) * 740;
      const yB = lerp(786, 726, (i + 1) / fgSteps);
      drawWroughtStroke(ctx, xA + 4, yB, xB - 3, yB, 2.2, 'rgba(218, 196, 154, 0.38)', 90 + i);
    }
    drawWroughtStroke(ctx, 742, 726, w, 744, 2.2, 'rgba(218, 196, 154, 0.34)', 108);
    ctx.restore();
  });
}

/**
 * Bakes a 256x256 organic Clumped Silver-Halide Emulsion Grain tile (`银盐卤化物团簇颗粒`).
 * Replaces digital 1px squares with irregular multi-grain silver-salt clusters centered around
 * neutral 50% grey so `'overlay'` blending concentrates grain in midtones!
 */
function getBakedClumpedFilmGrain(kit) {
  return kit.bake2D(
    's14_clumped_halide_grain_r3',
    (_g, ctx, rng, w, h) => {
      const img = ctx.createImageData(w, h);
      const d = img.data;
      // Multi-scale wrap-around noise for organic silver-halide emulsion clumps
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          // Periodic wrap on 256 grid using modular integer hashes
          const fine = hash2i(x & 255, y & 255, 19221);
          const clumpA =
            0.25 *
            (hash2i((x >> 1) & 127, (y >> 1) & 127, 19223) +
              hash2i(((x + 1) >> 1) & 127, (y >> 1) & 127, 19223) +
              hash2i((x >> 1) & 127, ((y + 1) >> 1) & 127, 19223) +
              hash2i(((x + 1) >> 1) & 127, ((y + 1) >> 1) & 127, 19223));
          const clumpB = hash2i((x >> 2) & 63, (y >> 2) & 63, 19229);
          const grain = (fine * 0.42 + clumpA * 0.43 + clumpB * 0.15 - 0.5) * 86;
          const v = clamp(Math.round(128 + grain), 72, 184);
          const idx = (y * w + x) * 4;
          d[idx] = Math.min(255, v + 3);
          d[idx + 1] = v;
          d[idx + 2] = Math.max(0, v - 4);
          d[idx + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);

      // Occasional coarser silver-gelatin emulsion flocculations
      for (let i = 0; i < 320; i++) {
        const cx = rng() * w;
        const cy = rng() * h;
        const bright = rng() > 0.5;
        ctx.fillStyle = bright ? 'rgba(176, 168, 152, 0.35)' : 'rgba(84, 80, 76, 0.35)';
        ctx.fillRect(cx, cy, 1.5 + rng() * 2.2, 1.2 + rng() * 2.0);
      }
    },
    256,
    256
  );
}

/**
 * Bakes the authentic 1922 35mm Nitrate Silent-Film Rounded Projector Aperture Mask (`片门毛边暗框`)!
 * Leaves `(0, 680)` and `(1000, 680)` open while framing top/bottom edges & rounded corners with
 * fibrous film-gate lint roughness.
 */
function getBakedFilmApertureMask(kit) {
  return kit.bake2D('s14_35mm_aperture_mask_r3', (_g, ctx, rng, w, h) => {
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.fillStyle = '#050406';

    // Outer full frame minus inner rounded 35mm silent aperture window
    ctx.beginPath();
    ctx.rect(0, 0, w, h);

    // Custom organic aperture contour with subtle fibrous gate-edge roughness (keeps x=0 & x=1000 thin around y=680!)
    const insetTop = 9;
    const insetBot = 10;
    const insetSide = 5;
    const cornerR = 38;

    const pts = [];
    const totalSteps = 160;
    for (let i = 0; i < totalSteps; i++) {
      const a = (i / totalSteps) * Math.PI * 2;
      // Superellipse / rounded film-gate projection
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const halfW = (w - insetSide * 2) * 0.5;
      const halfH = (h - insetTop - insetBot) * 0.5;
      const cx = w * 0.5;
      const cy = (insetTop + (h - insetBot)) * 0.5;

      // Superellipse exponent p ≈ 14 gives crisp straight edges + rounded 35mm corners
      const pExp = 15;
      const rNorm = Math.pow(Math.pow(Math.abs(ca), pExp) + Math.pow(Math.abs(sa), pExp), -1 / pExp);
      const fuzz = (rng() - 0.5) * 2.2 + Math.sin(a * 37) * 0.7;
      // Extra corner rounding
      const cornerPull = Math.pow(Math.abs(ca * sa) * 2, 3) * (cornerR * 0.22);
      const px = cx + ca * (halfW * rNorm - cornerPull) + fuzz;
      const py = cy + sa * (halfH * rNorm - cornerPull) + fuzz;
      pts.push([px, py]);
    }

    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = pts.length - 1; i >= 0; i--) {
      ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.closePath();
    ctx.fill('evenodd');

    // Tiny authentic gate-hair fiber specs clinging to upper/lower film gate edge
    ctx.strokeStyle = '#050406';
    ctx.lineWidth = 1.1;
    for (const [hx, hy, dx, dy] of [
      [184, insetTop, 5, 9],
      [762, insetTop, -4, 7],
      [318, h - insetBot, 4, -8],
    ]) {
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.quadraticCurveTo(hx + dx * 0.6, hy + dy * 0.5, hx + dx, hy + dy);
      ctx.stroke();
    }
    ctx.restore();
  });
}

/**
 * Projects a joint from `computePelicanRig` onto the castle stairwell wall:
 * - Applies Count-Orlok Expressionist vertical loom (`1.38x -> 1.52x` during Bar 2 candle dip!)
 * - Applies `penumbraSpread` radial upward/outward optical expansion proportional to height above stairs
 * - Applies `displaceShadowOnWall` so every shadow point kinks across 3D stone risers & spalled plaster!
 */
function projectShadowPoint(pt, rig, candleX, candleY, loomStretch, penumbraSpread = 0, orlokEnv = 1.0) {
  const rx = rig.root.x;
  const ry = rig.root.y;
  const dx = pt.x - rx;
  const dy = pt.y - ry; // negative above stair tread

  // Height factor: 0 right where tire contacts stone step, ~1.0 at skull/wingtips!
  const heightFactor = clamp(-dy / 205, 0, 1.85);

  const rawWx =
    rx +
    dx * (1.0 + (0.08 + penumbraSpread * 0.045 * heightFactor) * orlokEnv) -
    dy * 0.19 * orlokEnv +
    candleX * heightFactor * orlokEnv;
  const rawWy =
    ry +
    dy * (1.0 + (loomStretch - 1.0 + penumbraSpread * 0.055 * heightFactor) * orlokEnv) +
    candleY * heightFactor * orlokEnv;

  if (orlokEnv <= 0.001) {
    return { x: rawWx, y: rawWy, hFactor: heightFactor };
  }
  const disp = displaceShadowOnWall(rawWx, rawWy);
  return {
    x: lerp(rawWx, disp.x, orlokEnv),
    y: lerp(rawWy, disp.y, orlokEnv),
    hFactor: heightFactor,
  };
}

/**
 * Strokes or fills a wall-displaced polyline/curve by sampling intermediate points through
 * `displaceShadowOnWall` so spokes, frame tubes & claws genuinely bend across 3D stone steps!
 */
function traceWallDisplacedSegment(ctx, a, b, subdivs = 6, moveFirst = true) {
  for (let i = 0; i <= subdivs; i++) {
    if (i === 0 && !moveFirst) continue;
    const u = i / subdivs;
    const lx = lerp(a.x, b.x, u);
    const ly = lerp(a.y, b.y, u);
    // Add high-frequency mortar crevice ripple on interior samples
    const h = i > 0 && i < subdivs ? (sampleWallHeight(lx, ly) - 0.55) * 2.4 : 0;
    const wx = lx + h;
    const wy = ly - h * 0.85;
    if (i === 0 && moveFirst) ctx.moveTo(wx, wy);
    else ctx.lineTo(wx, wy);
  }
}

/**
 * Draws ONE optical layer of the Count-Orlok-deformed Pelican + Bicycle wall shadow!
 * Zero `ctx.arc` geometric circles—every wheel rim, spoke, talon, bat-wing & skull contour
 * is wall-displaced across the stone steps & spalled plaster!
 */
function traceOrlokPelicanShadowLayer(ctx, rig, animT, localT, layerOpts) {
  const {
    mode = 'umbra', // 'widePenumbra' | 'midPenumbra' | 'umbra' | 'electrify'
    penumbraSpread = 0,
    wMul = 1.0,
    strokeStyle = '#08080a',
    fillStyle = '#08080a',
    isOutroThumbnail = false,
  } = layerOpts;

  const s = rig.root.scale;
  const isWire = mode === 'electrify';
  // Match 1.0x neighbor silhouettes cleanly at x=0 (#13->#14) and x=1000 (#14->#15), looming to full Orlok inside [145..845]!
  const orlokEnv = isOutroThumbnail
    ? 1.0
    : smoothstep(0, 145, rig.root.x) * smoothstep(PANEL_SIZE, PANEL_SIZE - 155, rig.root.x);
  const os = s * orlokEnv;

  // Bar 2 (localT 2..4s): off-screen candle flame dips lower, making Count Orlok shadow loom taller!
  const bar2Loom = smootherstep(1.65, 2.35, localT) * (1 - 0.55 * smoothstep(4.2, 5.5, localT));
  const loomStretch = 1.37 + bar2Loom * 0.14 + Math.sin(animT * 5.2) * 0.018;

  const candleX = Math.sin(animT * 14.3) * 2.3 + Math.cos(animT * 23.7) * 1.1 - bar2Loom * 5.5;
  const candleY = Math.cos(animT * 17.9) * 1.8 - bar2Loom * 6.0;

  const P = (pt) =>
    projectShadowPoint(pt, rig, candleX, candleY, loomStretch, penumbraSpread, orlokEnv);

  const rearW = P(rig.rearWheel);
  const frontW = P(rig.frontWheel);
  const bb = P(rig.bb);
  const lPedal = P(rig.leftPedal);
  const rPedal = P(rig.rightPedal);

  const seatC = P({ x: rig.seatCluster.x - 4 * os, y: rig.seatCluster.y - 14 * os });
  const saddle = P({ x: rig.saddle.x - 6 * os, y: rig.saddle.y - 20 * os });
  const headTop = P({ x: rig.headTop.x + 2 * os, y: rig.headTop.y - 14 * os });
  const headBot = P(rig.headBot);
  const stemTop = P({ x: rig.stemTop.x + 4 * os, y: rig.stemTop.y - 22 * os });
  const grip = P({ x: rig.handleGrip.x - 2 * os, y: rig.handleGrip.y - 22 * os });

  const tail = P({ x: rig.tailTip.x - 14 * os, y: rig.tailTip.y - 12 * os });
  const bodyC = P({ x: rig.bodyCenter.x - 4 * os, y: rig.bodyCenter.y - 18 * os });
  const hip = P({ x: rig.hip.x - 4 * os, y: rig.hip.y - 18 * os });
  const chest = P({ x: rig.chest.x + 4 * os, y: rig.chest.y - 20 * os });
  const neck1 = P({ x: rig.neckC1.x + 8 * os, y: rig.neckC1.y - 22 * os });
  const neck2 = P({ x: rig.neckC2.x - 10 * os, y: rig.neckC2.y - 24 * os });
  const head = P({ x: rig.head.x - 2 * os, y: rig.head.y - 24 * os });
  const beakU = P({ x: rig.beakUpperBase.x, y: rig.beakUpperBase.y - 24 * os });
  const beakL = P({ x: rig.beakLowerBase.x, y: rig.beakLowerBase.y - 22 * os });
  const beakTipRaw = P({ x: rig.beakTip.x, y: rig.beakTip.y - 24 * os });

  const wShoulder = P({ x: rig.wingShoulder.x - 4 * os, y: rig.wingShoulder.y - 24 * os });
  const wElbow = P({ x: rig.wingElbow.x + 2 * os, y: rig.wingElbow.y - 20 * os });

  const lHip = P({ x: rig.leftHip.x, y: rig.leftHip.y - 18 * os });
  const rHip = P({ x: rig.rightHip.x, y: rig.rightHip.y - 18 * os });
  const lKnee = P({ x: rig.leftKnee.x + 14 * os, y: rig.leftKnee.y - 14 * os });
  const rKnee = P({ x: rig.rightKnee.x + 14 * os, y: rig.rightKnee.y - 14 * os });
  const lFoot = P(rig.leftFoot);
  const rFoot = P(rig.rightFoot);

  const clawTwitch = Math.sin(animT * 11.5) * 3.5 * (0.4 + bar2Loom);
  const beakClawTip = {
    x: beakTipRaw.x + (62 + bar2Loom * 8) * os,
    y: beakTipRaw.y + 4 * os,
  };
  const beakHookPoint = {
    x: beakClawTip.x - (6 + 4 * orlokEnv) * s,
    y: beakClawTip.y + (6 + (20 + bar2Loom * 4) * orlokEnv) * s,
  };
  const humpPeak = {
    x: bodyC.x - 14 * s,
    y: bodyC.y - (22 + (22 + bar2Loom * 7) * orlokEnv) * s,
  };

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = strokeStyle;
  ctx.fillStyle = isWire ? 'transparent' : fillStyle;

  // 1. Wall-Displaced Oblique Sheared Gothic Shadow Wheels (ZERO ctx.arc! Kinks across stone steps!)
  const drawWallDisplacedShadowWheel = (wcRaw, baseR, angle) => {
    const hub = P({ x: wcRaw.x, y: wcRaw.y - baseR * 0.24 * orlokEnv });

    // Transform wheel-local point through oblique Gothic wall shear + 3D stair/plaster displacement!
    const wheelPt = (lx, ly) => {
      const sx = wcRaw.x + lerp(1.0, 0.88, orlokEnv) * lx - 0.28 * orlokEnv * ly;
      const sy =
        wcRaw.y -
        baseR * 0.24 * orlokEnv -
        0.18 * orlokEnv * lx +
        lerp(1.0, 1.36, orlokEnv) * ly;
      if (orlokEnv <= 0.001) {
        return { x: sx, y: sy };
      }
      const hFrac = clamp((rig.root.y - sy) / 205, 0, 1.5);
      const wx = sx + candleX * hFrac * orlokEnv + (sx - wcRaw.x) * penumbraSpread * 0.04 * orlokEnv;
      const wy =
        sy +
        candleY * hFrac * orlokEnv +
        (sy - rig.root.y) * (loomStretch - 1.37 + penumbraSpread * 0.04) * orlokEnv;
      const dp = displaceShadowOnWall(wx, wy);
      return { x: lerp(wx, dp.x, orlokEnv), y: lerp(wy, dp.y, orlokEnv) };
    };

    // 16 cobweb-thin spokes subdivided across stone steps & mortar joints
    if (mode !== 'widePenumbra') {
      ctx.lineWidth = Math.max(0.8, 1.25 * s * wMul);
      const spokes = 16;
      for (let i = 0; i < spokes; i++) {
        const a = angle + (i * Math.PI * 2) / spokes;
        ctx.beginPath();
        for (let stp = 0; stp <= 4; stp++) {
          const rFrac = stp / 4;
          const p = wheelPt(Math.cos(a) * baseR * rFrac, Math.sin(a) * baseR * rFrac);
          if (stp === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }
    }

    // Outer crooked tire rim sampled at 64 wall-displaced vertices (visibly steps over risers!)
    ctx.lineWidth = Math.max(1.8, 4.5 * s * wMul);
    ctx.beginPath();
    const rimSteps = 64;
    for (let k = 0; k <= rimSteps; k++) {
      const a = (k / rimSteps) * Math.PI * 2;
      const p = wheelPt(Math.cos(a) * baseR, Math.sin(a) * baseR);
      if (k === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    // Inner gothic rim ring
    if (mode !== 'widePenumbra') {
      ctx.lineWidth = Math.max(0.9, 1.45 * s * wMul);
      ctx.beginPath();
      for (let k = 0; k <= 44; k++) {
        const a = (k / 44) * Math.PI * 2;
        const p = wheelPt(Math.cos(a) * baseR * 0.85, Math.sin(a) * baseR * 0.85);
        if (k === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    if (!isWire) {
      ctx.beginPath();
      for (let k = 0; k <= 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        const p = wheelPt(Math.cos(a) * 5.0 * s * wMul, Math.sin(a) * 5.0 * s * wMul);
        if (k === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.fill();
    }

    // Contact-hardened tire-to-step razor pinch right at each wheel's exact bottom tread contact (`mode === 'umbra'`)!
    if (mode === 'umbra') {
      const contactL = wheelPt(-15 * s, baseR * 0.99);
      const contactR = wheelPt(15 * s, baseR * 0.99);
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(5, 5, 7, 0.98)';
      ctx.lineWidth = 3.8 * s;
      ctx.beginPath();
      traceWallDisplacedSegment(ctx, contactL, contactR, 4, true);
      ctx.stroke();
      ctx.restore();
    }
    void hub;
  };

  drawWallDisplacedShadowWheel(rig.rearWheel, rig.rearWheel.r, rig.rearWheel.angle);
  drawWallDisplacedShadowWheel(rig.frontWheel, rig.frontWheel.r, rig.frontWheel.angle);

  // 2. Spindly Arachnid Spider-Legs & Long Curved Count-Orlok Talons
  const drawSpiderLeg = (hipP, kneeP, footP, pedP) => {
    ctx.lineWidth = 2.6 * s * wMul;
    ctx.beginPath();
    traceWallDisplacedSegment(ctx, bb, pedP, 4, true);
    ctx.stroke();

    ctx.lineWidth = 3.6 * s * wMul;
    const midThigh = {
      x: (hipP.x + kneeP.x) * 0.5 + 8 * s,
      y: (hipP.y + kneeP.y) * 0.5 - 10 * s,
    };
    const midShin = {
      x: (kneeP.x + footP.x) * 0.5 - 5 * s,
      y: (kneeP.y + footP.y) * 0.5,
    };
    ctx.beginPath();
    traceWallDisplacedSegment(ctx, hipP, midThigh, 3, true);
    traceWallDisplacedSegment(ctx, midThigh, kneeP, 3, false);
    traceWallDisplacedSegment(ctx, kneeP, midShin, 3, false);
    traceWallDisplacedSegment(ctx, midShin, footP, 3, false);
    ctx.stroke();

    // Sharp arachnid knee spur
    ctx.lineWidth = 2.2 * s * wMul;
    ctx.beginPath();
    ctx.moveTo(kneeP.x - 2 * s, kneeP.y + 2 * s);
    ctx.lineTo(kneeP.x + 14 * s, kneeP.y - 11 * s);
    ctx.stroke();

    // Three hooked Count-Orlok talons raking off pedal
    ctx.lineWidth = 2.1 * s * wMul;
    for (let tIdx = 0; tIdx < 3; tIdx++) {
      const tx = footP.x + (18 + tIdx * 7) * s;
      const ty = footP.y + (9 + tIdx * 4) * s;
      ctx.beginPath();
      ctx.moveTo(footP.x - 4 * s, footP.y + 1 * s);
      ctx.quadraticCurveTo(footP.x + 14 * s, footP.y - 3 * s, tx, ty);
      ctx.stroke();
    }
  };

  drawSpiderLeg(lHip, lKnee, lFoot, lPedal);

  // 3. Crooked Expressionist Gothic Iron Bicycle Frame Shadow (wall-displaced across risers!)
  ctx.lineWidth = 3.5 * s * wMul;
  ctx.beginPath();
  traceWallDisplacedSegment(ctx, { x: rearW.x, y: rearW.y - 10 * s }, seatC, 5, true);
  traceWallDisplacedSegment(ctx, seatC, bb, 5, false);
  traceWallDisplacedSegment(ctx, bb, { x: rearW.x, y: rearW.y - 10 * s }, 5, false);
  traceWallDisplacedSegment(ctx, seatC, headTop, 6, true);
  traceWallDisplacedSegment(ctx, headTop, headBot, 3, false);
  traceWallDisplacedSegment(ctx, headBot, bb, 5, false);
  traceWallDisplacedSegment(ctx, headTop, { x: frontW.x, y: frontW.y - 10 * s }, 5, true);
  ctx.stroke();

  // Wall-displaced polygonal chainring + chain (NO ctx.arc/ellipse!)
  if (mode !== 'widePenumbra') {
    ctx.lineWidth = 1.65 * s * wMul;
    ctx.beginPath();
    for (let k = 0; k <= 18; k++) {
      const a = (k / 18) * Math.PI * 2;
      const cx = bb.x + Math.cos(a) * 11 * s - Math.sin(a) * 3 * s;
      const cy = bb.y + Math.sin(a) * 15 * s;
      const dp = displaceShadowOnWall(cx, cy);
      if (k === 0) ctx.moveTo(dp.x, dp.y);
      else ctx.lineTo(dp.x, dp.y);
    }
    traceWallDisplacedSegment(ctx, { x: rearW.x, y: rearW.y - 14 * s }, { x: bb.x, y: bb.y - 14 * s }, 4, true);
    traceWallDisplacedSegment(ctx, { x: rearW.x, y: rearW.y - 4 * s }, { x: bb.x, y: bb.y + 13 * s }, 4, true);
    ctx.stroke();
  }

  // Tall crooked seatpost, horned gothic saddle & swept handlebars
  ctx.lineWidth = 3.0 * s * wMul;
  ctx.beginPath();
  traceWallDisplacedSegment(ctx, seatC, saddle, 3, true);
  ctx.moveTo(saddle.x - 18 * s, saddle.y - 5 * s);
  ctx.quadraticCurveTo(saddle.x, saddle.y + 3 * s, saddle.x + 15 * s, saddle.y - 2 * s);
  traceWallDisplacedSegment(ctx, headTop, stemTop, 3, true);
  ctx.quadraticCurveTo(stemTop.x - 8 * s, stemTop.y - 12 * s, grip.x - 4 * s, grip.y);
  ctx.stroke();

  // 4. Gaunt, Deeply Hunched Count-Orlok Torso & Sawtooth Raven Tail
  ctx.lineWidth = 2.6 * s * wMul;
  ctx.beginPath();
  ctx.moveTo(tail.x - 32 * s, tail.y + 4 * s);
  ctx.lineTo(tail.x - 6 * s, tail.y - 6 * s);
  ctx.lineTo(tail.x - 26 * s, tail.y - 16 * s);
  ctx.lineTo(tail.x - 4 * s, tail.y - 20 * s);
  ctx.quadraticCurveTo(humpPeak.x - 20 * s, humpPeak.y - 8 * s, humpPeak.x + 4 * s, humpPeak.y);
  ctx.lineTo(chest.x - 4 * s, humpPeak.y - 11 * s); // sharp Orlok vampire-coat collar spike!
  ctx.lineTo(chest.x + 8 * s, chest.y - 6 * s);
  ctx.quadraticCurveTo(bodyC.x + 10 * s, bodyC.y + 6 * s, hip.x - 4 * s, hip.y + 8 * s);
  ctx.quadraticCurveTo(bodyC.x - 32 * s, bodyC.y - 2 * s, tail.x - 32 * s, tail.y + 4 * s);
  ctx.closePath();
  if (!isWire) ctx.fill();
  ctx.stroke();

  // 5. Sinewy S-Neck, Bald Domed Orlok Cranium, Pointed Ear Spikes & Scythe-Claw Beak!
  ctx.lineWidth = (isWire ? 2.8 : 11.5) * s * wMul;
  ctx.beginPath();
  ctx.moveTo(chest.x + 2 * s, chest.y - 2 * s);
  ctx.bezierCurveTo(neck1.x + 6 * s, neck1.y, neck2.x - 10 * s, neck2.y, head.x, head.y);
  ctx.stroke();

  ctx.lineWidth = 2.1 * s * wMul;
  for (let k = 1; k <= 3; k++) {
    const u = k * 0.25;
    const bx = lerp(chest.x - 4 * s, head.x - 8 * s, u) - 5 * s;
    const by = lerp(chest.y - 4 * s, head.y + 4 * s, u);
    ctx.beginPath();
    ctx.moveTo(bx + 5 * s, by + 3 * s);
    ctx.lineTo(bx - 11 * s, by - 8 * s);
    ctx.stroke();
  }

  // Asymmetric bald domed Count-Orlok cranium (hand-sculpted Bezier dome, ZERO ctx.ellipse!)
  ctx.beginPath();
  ctx.moveTo(head.x - 17 * s, head.y + 3 * s);
  ctx.bezierCurveTo(
    head.x - 19 * s,
    head.y - 14 * s,
    head.x + 4 * s,
    head.y - 19 * s,
    head.x + 14 * s,
    head.y - 6 * s
  );
  ctx.bezierCurveTo(
    head.x + 17 * s,
    head.y + 4 * s,
    head.x - 4 * s,
    head.y + 12 * s,
    head.x - 17 * s,
    head.y + 3 * s
  );
  ctx.closePath();
  if (!isWire) ctx.fill();
  ctx.stroke();

  // Pointed Nosferatu bat-ear horn & needle plumes
  ctx.beginPath();
  ctx.moveTo(head.x - 6 * s, head.y - 10 * s);
  ctx.lineTo(head.x - 29 * s, head.y - 29 * s);
  ctx.lineTo(head.x - 14 * s, head.y - 6 * s);
  ctx.lineTo(head.x - 37 * s, head.y - 14 * s);
  ctx.lineTo(head.x - 15 * s, head.y + 1 * s);
  ctx.closePath();
  if (!isWire) ctx.fill();
  ctx.stroke();

  // Razor-Long Vampire-Claw Hooked Beak + Starved Scalloped Sinew Throat
  const rib1 = { x: lerp(beakL.x, beakClawTip.x, 0.34), y: beakL.y + 22 * s };
  const rib2 = { x: lerp(beakL.x, beakClawTip.x, 0.66), y: beakL.y + 15 * s };
  ctx.beginPath();
  ctx.moveTo(beakU.x, beakU.y - 4 * s);
  ctx.quadraticCurveTo(
    (beakU.x + beakClawTip.x) * 0.52,
    beakU.y - 16 * s,
    beakClawTip.x,
    beakClawTip.y
  );
  ctx.quadraticCurveTo(
    beakClawTip.x + 6 * s,
    beakClawTip.y + 12 * s,
    beakHookPoint.x,
    beakHookPoint.y
  );
  ctx.quadraticCurveTo(
    beakClawTip.x - 9 * s,
    beakClawTip.y + 9 * s,
    beakClawTip.x - 16 * s,
    beakClawTip.y + 4 * s
  );
  ctx.quadraticCurveTo((beakClawTip.x + rib2.x) * 0.5, beakClawTip.y - 2 * s, rib2.x, rib2.y);
  ctx.quadraticCurveTo((rib2.x + rib1.x) * 0.5, beakL.y + 5 * s, rib1.x, rib1.y);
  ctx.quadraticCurveTo((rib1.x + beakL.x) * 0.5, beakL.y + 6 * s, beakL.x, beakL.y + 3 * s);
  ctx.closePath();
  if (!isWire) ctx.fill();
  ctx.stroke();

  // Eerie angular moonlit slit eye cut inside the vampire skull shadow
  if (mode === 'umbra') {
    ctx.save();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(236, 218, 178, 0.72)';
    ctx.beginPath();
    ctx.moveTo(head.x + 0.5 * s, head.y - 3.0 * s);
    ctx.lineTo(head.x + 5.5 * s, head.y - 5.8 * s);
    ctx.lineTo(head.x + 9.5 * s, head.y - 4.2 * s);
    ctx.lineTo(head.x + 4.8 * s, head.y - 2.1 * s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 6. Near Spider Leg
  drawSpiderLeg(rHip, rKnee, rFoot, rPedal);

  // 7. Spread Skeletal Bat-Bone Wing + Twitching Count-Orlok Handlebar Claws!
  const batWrist = {
    x: wShoulder.x + (6 - bar2Loom * 4) * s,
    y: wShoulder.y - (54 + bar2Loom * 9) * s + clawTwitch * 0.4,
  };
  const boneTips = [
    { x: batWrist.x - 54 * s, y: batWrist.y - 11 * s - clawTwitch * 0.5 },
    { x: batWrist.x - 60 * s, y: batWrist.y + 18 * s + clawTwitch * 0.3 },
    { x: batWrist.x - 43 * s, y: batWrist.y + 44 * s },
    { x: wElbow.x - 16 * s, y: wElbow.y + 22 * s },
  ];
  const clawHand = { x: grip.x + 8 * s, y: grip.y - 2 * s };

  ctx.lineWidth = 2.5 * s * wMul;
  ctx.beginPath();
  ctx.moveTo(wShoulder.x + 4 * s, wShoulder.y + 2 * s);
  ctx.lineTo(batWrist.x, batWrist.y);
  ctx.lineTo(batWrist.x + 12 * s, batWrist.y - 14 * s);
  ctx.lineTo(batWrist.x - 3 * s, batWrist.y - 3 * s);
  ctx.quadraticCurveTo(batWrist.x - 22 * s, batWrist.y - 2 * s, boneTips[0].x, boneTips[0].y);
  ctx.quadraticCurveTo(
    boneTips[0].x + 18 * s,
    (boneTips[0].y + boneTips[1].y) * 0.5,
    boneTips[1].x,
    boneTips[1].y
  );
  ctx.quadraticCurveTo(
    boneTips[1].x + 18 * s,
    (boneTips[1].y + boneTips[2].y) * 0.5,
    boneTips[2].x,
    boneTips[2].y
  );
  ctx.quadraticCurveTo(
    boneTips[2].x + 16 * s,
    (boneTips[2].y + boneTips[3].y) * 0.5,
    boneTips[3].x,
    boneTips[3].y
  );
  ctx.quadraticCurveTo((boneTips[3].x + clawHand.x) * 0.5, clawHand.y - 8 * s, clawHand.x, clawHand.y);
  ctx.quadraticCurveTo(wElbow.x + 12 * s, wElbow.y - 16 * s, wShoulder.x + 8 * s, wShoulder.y + 4 * s);
  ctx.closePath();
  if (!isWire) ctx.fill();
  ctx.stroke();

  ctx.lineWidth = 2.2 * s * wMul;
  for (const bt of boneTips) {
    ctx.beginPath();
    ctx.moveTo(batWrist.x, batWrist.y);
    ctx.lineTo(bt.x, bt.y);
    ctx.stroke();
  }

  // Four asymmetrically creeping Count-Orlok finger claws curling beyond the handlebar!
  ctx.lineWidth = 2.2 * s * wMul;
  for (let cIdx = 0; cIdx < 4; cIdx++) {
    const creep = Math.sin(animT * 9.5 + cIdx * 1.4) * (2.2 + bar2Loom * 3.5) * s;
    const cx1 = clawHand.x + (21 - cIdx * 3) * s + creep;
    const cy1 = clawHand.y + (-4 + cIdx * 6.5) * s + creep * 0.5;
    ctx.beginPath();
    ctx.moveTo(clawHand.x - 2 * s, clawHand.y + cIdx * 2 * s);
    ctx.quadraticCurveTo(clawHand.x + 11 * s, cy1 - 5 * s, cx1, cy1 + 5 * s);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Renders the 3-Tier Contact-Hardening Variable Penumbra + 3D Stair-Displaced Wall Shadow!
 * - Tier 1 (High-Altitude Wide Penumbra): Soft wide blur (`26px`) masked to upper torso, skull,
 *   scythe beak & bat-bone wingtips where distance from object to castle wall is greatest!
 * - Tier 2 (Mid-Altitude Penumbra): Medium optical penumbra (`10px`) across frame & upper wheels.
 * - Tier 3 (Contact-Hardened Core Umbra): Razor-sharp (`1.5px`) dense nitrate-black at wheel-to-step
 *   contact (`stairY`), grading smoothly upward so upper extremities stay ghostly soft-edged!
 */
function drawOpticalWallShadow(ctx, rig, animT, localT, stairY, castleCanvas, isOutroThumbnail = false) {
  // Tier 1: Wide upper penumbra (masked to above wheel hubs so ground contact stays crisp!)
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, PANEL_SIZE, stairY - 26);
  ctx.clip();
  ctx.shadowColor = 'rgba(10, 9, 12, 0.78)';
  ctx.shadowBlur = 26;
  traceOrlokPelicanShadowLayer(ctx, rig, animT, localT, {
    mode: 'widePenumbra',
    penumbraSpread: 1.0,
    wMul: 1.7,
    strokeStyle: 'rgba(12, 11, 14, 0.30)',
    fillStyle: 'rgba(12, 11, 14, 0.28)',
    isOutroThumbnail,
  });
  ctx.restore();

  // Tier 2: Mid optical penumbra
  ctx.save();
  ctx.shadowColor = 'rgba(9, 8, 11, 0.72)';
  ctx.shadowBlur = 10;
  traceOrlokPelicanShadowLayer(ctx, rig, animT, localT, {
    mode: 'midPenumbra',
    penumbraSpread: 0.38,
    wMul: 1.28,
    strokeStyle: 'rgba(10, 9, 12, 0.42)',
    fillStyle: 'rgba(10, 9, 12, 0.40)',
    isOutroThumbnail,
  });
  ctx.restore();

  // Tier 3: Contact-hardened core umbra (vertical density gradient: 0.96 at step contact -> 0.72 at high wingtip!)
  const umbraGrad = ctx.createLinearGradient(0, stairY + 8, 0, stairY - 275);
  umbraGrad.addColorStop(0.0, 'rgba(7, 7, 10, 0.97)');
  umbraGrad.addColorStop(0.36, 'rgba(8, 8, 11, 0.92)');
  umbraGrad.addColorStop(0.72, 'rgba(10, 9, 12, 0.84)');
  umbraGrad.addColorStop(1.0, 'rgba(12, 11, 14, 0.72)');

  ctx.save();
  ctx.shadowColor = 'rgba(7, 7, 10, 0.55)';
  ctx.shadowBlur = 1.6;
  traceOrlokPelicanShadowLayer(ctx, rig, animT, localT, {
    mode: 'umbra',
    penumbraSpread: 0.0,
    wMul: 1.0,
    strokeStyle: umbraGrad,
    fillStyle: umbraGrad,
    isOutroThumbnail,
  });
  ctx.restore();

  // Subtle stone-wall mortar & spall grain bleed-through inside upper penumbra so shadow adheres into plaster!
  ctx.save();
  ctx.globalAlpha = 0.068;
  ctx.globalCompositeOperation = 'lighten';
  ctx.drawImage(castleCanvas, 0, 0);
  ctx.restore();
}

/**
 * Draws the near-foreground rough-hewn pitch-black wooden staircase handrail & balusters
 * strictly in the bottom strip (`y > 766`) so it never occludes the `y <= 680` shadow!
 */
function drawForegroundBanisterSilhouette(ctx) {
  ctx.save();
  drawWroughtStroke(ctx, -20, 948, 740, 778, 22, '#050406', 201);
  drawWroughtStroke(ctx, 740, 778, PANEL_SIZE + 20, 812, 22, '#050406', 202);
  drawWroughtStroke(ctx, -20, 937, 740, 767, 2.0, 'rgba(206, 184, 142, 0.24)', 203);
  drawWroughtStroke(ctx, 740, 767, PANEL_SIZE + 20, 801, 2.0, 'rgba(206, 184, 142, 0.22)', 204);

  ctx.fillStyle = '#050406';
  for (let i = 0; i < 8; i++) {
    const bx = 65 + i * 130;
    const byTop = bx <= 740 ? lerp(948, 778, bx / 740) : lerp(778, 812, (bx - 740) / 260);
    drawWroughtStroke(ctx, bx, byTop, bx + 6, PANEL_SIZE + 20, 16, '#050406', 210 + i);
    // Hand-turned gothic baluster knot polygon (zero smooth ellipse)
    ctx.beginPath();
    ctx.moveTo(bx - 12, byTop + 40);
    ctx.quadraticCurveTo(bx + 2, byTop + 29, bx + 15, byTop + 39);
    ctx.quadraticCurveTo(bx + 2, byTop + 50, bx - 12, byTop + 40);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Special `#14 -> #15` Cross-Medium Transition (`localT > 5.4s` -> `globalT = 89.0s`):
 * Raw Cathode-Ray High-Voltage Gas-Discharge Corona (`阴极高压气体放电电晕`) + Nitrate Emulsion
 * Phosphor Burn converging onto `(1000, 680)`!
 */
function drawCoronaDischargeTransition(ctx, rig, localT, globalT) {
  const rise = Math.max(
    smoothstep(5.4, 5.98, localT),
    globalT >= 88.45 ? smoothstep(88.45, 89.0, globalT) : 0
  );
  const postExitDecay = globalT > 89.0 ? 1 - smoothstep(89.06, 89.48, globalT) : 1.0;
  const elec = rise * postExitDecay;
  if (elec <= 0.01) return;

  const rng = makePRNG(hashSeed(`s14_corona_r3_${Math.floor(globalT * 48)}`));
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // 1. Soft CRT phosphor gas-ionization corona bloom around shadow & exit `(1000, 680)`
  const coronaX = clamp(rig.root.x + 48, 740, PANEL_SIZE);
  const corona = ctx.createRadialGradient(coronaX, ROAD_EDGE_Y - 34, 8, 935, ROAD_EDGE_Y - 24, 340);
  corona.addColorStop(0.0, `rgba(170, 255, 204, ${(0.44 * elec).toFixed(3)})`);
  corona.addColorStop(0.28, `rgba(57, 255, 122, ${(0.28 * elec).toFixed(3)})`);
  corona.addColorStop(0.65, `rgba(24, 155, 68, ${(0.11 * elec).toFixed(3)})`);
  corona.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = corona;
  ctx.fillRect(540, 200, 460, 590);

  // 2. Ionized green corona sheath glowing along the Orlok shadow's contour!
  ctx.save();
  ctx.globalAlpha = clamp(elec * 1.05, 0, 1);
  ctx.shadowColor = '#39ff7a';
  ctx.shadowBlur = 26 * elec;
  traceOrlokPelicanShadowLayer(ctx, rig, globalT, localT, {
    mode: 'electrify',
    penumbraSpread: 0.08,
    wMul: 0.88,
    strokeStyle: '#6eff9f',
    fillStyle: 'transparent',
  });
  ctx.restore();

  // 3. Localized silver-emulsion phosphor burn hotspots & branching corona plasma filaments -> (1000, 680)
  const loomStretch = 1.38;
  const P = (pt) => projectShadowPoint(pt, rig, 0, 0, loomStretch, 0);
  const nodes = [
    P(rig.beakTip),
    P(rig.head),
    P(rig.wingShoulder),
    P(rig.frontWheel),
    { x: PANEL_SIZE, y: ROAD_EDGE_Y },
  ];

  // Glowing horizontal sweep carrier locking onto `(1000, 680)` for #15 Oscilloscope beam entry!
  ctx.save();
  ctx.shadowColor = '#39ff7a';
  ctx.shadowBlur = 18 * elec;
  ctx.strokeStyle = '#b8ffd0';
  ctx.lineWidth = 2.8 * elec + 0.8;
  ctx.beginPath();
  ctx.moveTo(lerp(965, 785, elec), ROAD_EDGE_Y);
  ctx.lineTo(PANEL_SIZE, ROAD_EDGE_Y);
  ctx.stroke();

  // Branching plasma corona streamers (organic curved ionization filaments, not rigid CAD zigzags)
  for (let n = 0; n < nodes.length - 1; n++) {
    if (rng() > 0.35 + elec * 0.65) continue;
    const pA = nodes[n];
    const pB = nodes[n + 1];
    ctx.strokeStyle = n % 2 === 0 ? '#d8ffe6' : '#39ff7a';
    ctx.globalAlpha = (0.52 + rng() * 0.45) * elec;
    ctx.lineWidth = 1.2 + rng() * 1.6;
    ctx.beginPath();
    ctx.moveTo(pA.x, pA.y);
    const steps = 8;
    for (let k = 1; k < steps; k++) {
      const u = k / steps;
      const arcBow = Math.sin(u * Math.PI) * (rng() - 0.5) * 34 * elec;
      const mx = lerp(pA.x, pB.x, u) + (rng() - 0.5) * 14 * elec;
      const my = lerp(pA.y, pB.y, u) + arcBow;
      ctx.lineTo(mx, my);
    }
    ctx.lineTo(pB.x, pB.y);
    ctx.stroke();

    // Emulsion overexposure burn halo at discharge root
    const burnR = (5 + rng() * 11) * elec;
    const burn = ctx.createRadialGradient(pA.x, pA.y, 0.5, pA.x, pA.y, burnR);
    burn.addColorStop(0, `rgba(235, 255, 242, ${(0.75 * elec).toFixed(3)})`);
    burn.addColorStop(0.45, `rgba(57, 255, 122, ${(0.38 * elec).toFixed(3)})`);
    burn.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = burn;
    ctx.fillRect(pA.x - burnR, pA.y - burnR, burnR * 2, burnR * 2);
  }
  ctx.restore();

  ctx.restore();
}

/**
 * Applies authentic 1922 Orthochromatic Nitrate Silent-Film Overlay:
 * - 18Hz hand-cranked silent-projector cadence (`q18`)
 * - Midtone-weighted clumped silver-halide emulsion grain (`overlay` blend)
 * - Carbon-arc exposure breathing, vertical silver-nitrate scratches & wide-corridor Iris Vignette
 * - Authentic 35mm rounded nitrate film-gate aperture mask!
 */
function drawSilentFilmNitrateOverlay(ctx, kit, globalT) {
  const q18 = Math.floor(globalT * 18 + 1e-5);
  const rng = makePRNG(hashSeed(`s14_nitrate_18hz_${q18}`));

  ctx.save();

  // 1. Carbon-arc projector lamp exposure breathing
  const flicker =
    0.034 * Math.sin(globalT * 17.3) +
    0.024 * Math.cos(globalT * 29.1) +
    (rng() - 0.5) * 0.03;
  if (flicker > 0) {
    ctx.fillStyle = `rgba(244, 224, 180, ${flicker.toFixed(3)})`;
    ctx.fillRect(0, 0, PANEL_SIZE, PANEL_SIZE);
  } else {
    ctx.fillStyle = `rgba(8, 8, 11, ${(-flicker).toFixed(3)})`;
    ctx.fillRect(0, 0, PANEL_SIZE, PANEL_SIZE);
  }

  // 2. Clumped Silver-Halide Emulsion Grain (`overlay` naturally weights midtones heaviest!)
  const grainTile = getBakedClumpedFilmGrain(kit);
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.34;
  const ox = -Math.floor(rng() * 256);
  const oy = -Math.floor(rng() * 256);
  for (let gx = ox; gx < PANEL_SIZE; gx += 256) {
    for (let gy = oy; gy < PANEL_SIZE; gy += 256) {
      ctx.drawImage(grainTile.canvas, gx, gy);
    }
  }
  ctx.restore();

  // 3. 18Hz Vertical Silver-Nitrate Hairline Scratches & Chemical Emulsion Specks
  const driftX1 = ((235 + Math.floor(globalT * 3.0) * 7) % 850) + 75;
  const driftX2 = ((690 - Math.floor(globalT * 2.2) * 11 + 900) % 830) + 85;
  const scratches = [
    { x: driftX1, y0: 10, y1: PANEL_SIZE - 10, col: 'rgba(242, 224, 186, 0.21)', w: 0.95 },
    { x: driftX2, y0: 36, y1: 964, col: 'rgba(10, 9, 12, 0.28)', w: 1.1 },
  ];
  const extraCount = 1 + Math.floor(rng() * 2.4);
  for (let s = 0; s < extraCount; s++) {
    const sx = 65 + rng() * 870;
    const sy0 = rng() * 190;
    scratches.push({
      x: sx,
      y0: sy0,
      y1: sy0 + 480 + rng() * 480,
      col:
        rng() > 0.4
          ? `rgba(244, 226, 188, ${(0.15 + rng() * 0.18).toFixed(3)})`
          : `rgba(9, 8, 11, ${(0.22 + rng() * 0.18).toFixed(3)})`,
      w: 0.75 + rng() * 1.0,
    });
  }
  for (const sc of scratches) {
    ctx.strokeStyle = sc.col;
    ctx.lineWidth = sc.w;
    ctx.beginPath();
    ctx.moveTo(sc.x, sc.y0);
    ctx.lineTo(sc.x + (rng() - 0.5) * 3.0, (sc.y0 + sc.y1) * 0.5);
    ctx.lineTo(sc.x + (rng() - 0.5) * 4.0, sc.y1);
    ctx.stroke();
  }

  // 4. Breathing Silent-Film Elliptical Iris Vignette (wide horizontal corridor keeps x=0..1000 lit!)
  const breathR = 1 + 0.022 * Math.sin(globalT * 10.7) + (rng() - 0.5) * 0.015;
  ctx.save();
  ctx.translate(510 + (rng() - 0.5) * 3.5, 496 + (rng() - 0.5) * 3.5);
  ctx.scale(1.25 * breathR, 0.95 / breathR);
  const iris = ctx.createRadialGradient(0, 0, 255, 0, 0, 620);
  iris.addColorStop(0.0, 'rgba(0, 0, 0, 0.0)');
  iris.addColorStop(0.56, 'rgba(8, 8, 11, 0.07)');
  iris.addColorStop(0.79, 'rgba(8, 7, 10, 0.40)');
  iris.addColorStop(0.93, 'rgba(5, 5, 7, 0.82)');
  iris.addColorStop(1.0, 'rgba(4, 3, 5, 0.96)');
  ctx.fillStyle = iris;
  ctx.fillRect(-600, -640, 1200, 1280);
  ctx.restore();

  // 5. Authentic 35mm Nitrate Rounded Projector Gate Mask (`片门毛边暗框`)
  const apertureMask = getBakedFilmApertureMask(kit);
  ctx.drawImage(apertureMask.canvas, 0, 0);

  ctx.restore();
}

/**
 * Casts onto the upper-mid plastered stairwell wall (`x ≈ 640, y ≈ 470` along the stairs)
 * the elongated Murnau expressionist wall-shadow of Clerk Hutter / Night-Watchman holding a
 * brass chamberstick candle, strictly obeying `#14`'s 18Hz silent-film cadence, 3D stair/plaster
 * displacement, and 3-tier variable contact-to-penumbra shadow optics (ZERO crisp vector edges!):
 * - Bar 1 (`localT < 1.8s`): creeps cautiously up a stone step (`+X`) holding the candle steady,
 *   casting subtle flickering warm-sepia candle-halo illumination onto the spalled plaster.
 * - Bar 2 (`localT ∈ [1.85s, 4.55s]`): as the monstrous Orlok-pelican shadow looms huge behind him,
 *   his candle flame stretches & gutters wildly leftward, his shadow jerks around (`-X`), hair &
 *   coat-tails bristle, and he cowers/presses flat backward (`x < 770`, keeping `x > 845` 100% clean!)
 *   with trembling raised hands as the towering pelican sweeps past toward the `89.0s` CRT arc!
 */
function drawTerrifiedCandleWatchmanShadow(ctx, q18Idx, q18T, scene, castleCanvas, isOutroThumbnail = false) {
  const qLocalT = isOutroThumbnail ? 2.85 : scene ? q18T - scene.t0 : 0;

  // Fade cleanly out well before localT = 5.3s so x > 845 & 89.0s CRT discharge stay 100% pristine!
  const visAlpha = isOutroThumbnail
    ? 0.90
    : smoothstep(-0.35, 0.15, qLocalT) * (1 - smoothstep(4.62, 5.20, qLocalT));
  if (visAlpha <= 0.01) return;

  const terrorEnv = smoothstep(1.85, 2.18, qLocalT);
  const cowerDuck = isOutroThumbnail
    ? 0.0
    : smoothstep(3.38, 4.05, qLocalT);

  // 18Hz hand-cranked silent-film jitter & trembling nerves
  const jitA = hash2i(q18Idx, 3, 19224) - 0.5;
  const jitB = hash2i(q18Idx, 9, 19224) - 0.5;
  const jitC = hash2i(q18Idx, 17, 19224) - 0.5;

  // Spatial trajectory along the upper-mid stairs (strictly bounded inside x ∈ [566, 695] < 840, ZERO moonwalk!):
  // - Bar 1 (`0 -> 1.8s`): creeps cautiously up a step from x = 566 -> 588 (at 84.4..84.5s, baseX ≈ 583!)
  // - Terror Recoil (`1.85 -> 2.45s`): scrambles backward up one step to baseX = 626 (< 840) and plants there:
  //   * at 86.0s (pelican at 500, front wheel <= 598), Hutter (torso 652, head 662) stands cleanly ahead facing -X!
  //   * at 86.7s (pelican at 617), Orlok's giant shadow eclipses & sweeps over cowering Hutter!
  //   * at 87.4s (pelican at 733, rear wheel >= 634), Hutter emerges cleanly behind the rear wheel staring +X in horror!
  const creepProgress = clamp(qLocalT / 1.80, 0, 1);
  const creepStepLift =
    (1 - terrorEnv) * Math.max(0, Math.sin(creepProgress * Math.PI * 2.0)) * 7.5;
  const recoilUp = 38.0 * smootherstep(1.85, 2.45, qLocalT);
  const duckBehindSweep = 0;
  const baseX = isOutroThumbnail
    ? 648
    : clamp(566 + 22 * creepProgress + recoilUp + duckBehindSweep, 564, 742);
  const footStairY = sampleStairShadowPath(baseX).y + 1.5;

  // Facing direction:
  // +1 (rightward up stairs in Bar 1) -> jerks sharply to -1 (leftward facing approaching Orlok in Bar 2)
  // -> spins gaze back to +1 (`afterPassTurn` in 3.88..4.18s) staring up-stairs in horror after departing Orlok!
  const spinT = smoothstep(1.85, 2.08, qLocalT);
  const afterPassTurn = isOutroThumbnail ? 0 : smoothstep(3.88, 4.18, qLocalT);
  const faceDir = lerp(lerp(1.0, -1.0, spinT), 1.0, afterPassTurn);
  const dirSign = faceDir >= 0 ? 1 : -1;
  const profileSquash = Math.max(0.28, Math.abs(faceDir));

  // Elongated gaunt Murnau expressionist vertical stretch (~192px tall in Bar 1, cowering low against plaster in sweep!)
  const crouchY = 15 * terrorEnv + 36 * cowerDuck * (1 - 0.35 * afterPassTurn);
  const recoilLeanTarget = lerp(26, -24, afterPassTurn);
  const recoilLeanX = recoilLeanTarget * terrorEnv - 7 * (1 - terrorEnv) + jitA * 3.8 * terrorEnv;

  const hip = {
    x: baseX + recoilLeanX * 0.36,
    y: footStairY - 82 + crouchY * 0.48,
  };
  const shoulder = {
    x: baseX + recoilLeanX + dirSign * 5 * (1 - terrorEnv),
    y: footStairY - 152 + crouchY + jitB * 2.6 * terrorEnv,
  };
  const head = {
    x: shoulder.x + recoilLeanX * 0.38 + dirSign * 5 * (1 - terrorEnv) + jitA * 3.2 * terrorEnv,
    y: shoulder.y - 30 + crouchY * 0.12,
  };

  // Candle-bearing hand & brass chamberstick position (extended forward into open plaster!)
  const candleElbow = {
    x: shoulder.x + faceDir * lerp(18, 16, terrorEnv),
    y: shoulder.y + lerp(22, 18, terrorEnv) + jitB * 4.2 * terrorEnv,
  };
  const candleHand = {
    x: shoulder.x + faceDir * lerp(44, 40, terrorEnv) + jitA * 5.5 * terrorEnv,
    y: shoulder.y + lerp(8, 5, terrorEnv) + jitC * 4.8 * terrorEnv,
  };
  const wickBase = {
    x: candleHand.x + dirSign * 2,
    y: candleHand.y - 25,
  };

  // Raised trembling terror hand (tucked cautiously near coat lapel in Bar 1; flung high above head in Bar 2!)
  const freeElbow = {
    x: shoulder.x + faceDir * lerp(10, 14, terrorEnv) - dirSign * terrorEnv * 3,
    y: shoulder.y + lerp(26, -15, terrorEnv) + jitC * 4.5 * terrorEnv,
  };
  const freeHand = {
    x: shoulder.x + faceDir * lerp(22, 20, terrorEnv) + jitB * 6.8 * terrorEnv,
    y: shoulder.y + lerp(14, -44, terrorEnv) + cowerDuck * 6 + jitA * 6.2 * terrorEnv,
  };

  // Candle flame physics:
  // Steady warm teardrop in Bar 1 -> stretches & gutters WILDLY LEFTWARD (`-42.5px`) in [1.85s, 3.92s],
  // then whips rightward (`+26px`) in the departing vampire's slipstream wake as Orlok sweeps past (`afterPassTurn`)!
  const gutterEnv = smoothstep(1.85, 2.06, qLocalT) * (1 - smoothstep(4.52, 4.92, qLocalT));
  const terrorFlameDx = lerp(
    -42.5 + jitA * 14.0 - Math.abs(jitB) * 10.0,
    26.0 + jitA * 10.0 + Math.abs(jitB) * 6.0,
    afterPassTurn
  );
  const flameDx = lerp(jitA * 3.2 - 1.5, terrorFlameDx, gutterEnv);
  const flameH = lerp(23 + jitB * 3.5, (11.5 - 3.5 * afterPassTurn) + jitC * 4.8, gutterEnv);
  const sootDir = flameDx >= 0 ? 1 : -1;

  // =========================================================================
  // 1. Subtle Flickering Warm-Sepia Plaster Candle-Halo + Guttering Flame & Soot
  //    (Strictly soft optical halation & blur — ZERO crisp vector edges, ZERO x > 845 leak!)
  // =========================================================================
  ctx.save();
  ctx.beginPath();
  ctx.rect(400, 175, 440, 560); // Hard-clipped to x <= 840 so x > 845 is 100% untouched!
  ctx.clip();

  const wDisp = displaceShadowOnWall(wickBase.x, wickBase.y);
  const tipX = wDisp.x + flameDx;
  const tipY = wDisp.y - flameH;

  // Soft tallow-soot & wax-smoke trail torn wildly in the draft direction (`sootDir`)!
  if (gutterEnv > 0.18) {
    const sootSpan = lerp(58, 42, afterPassTurn);
    ctx.save();
    ctx.filter = 'blur(4.2px)';
    ctx.globalAlpha = clamp(visAlpha * gutterEnv * 0.56, 0, 1);
    ctx.fillStyle = 'rgba(15, 13, 12, 0.88)';
    ctx.beginPath();
    ctx.moveTo(wDisp.x + sootDir * 4, wDisp.y - 4);
    ctx.bezierCurveTo(
      wDisp.x + flameDx * 0.55,
      wDisp.y - flameH - 7,
      tipX + sootDir * (sootSpan * 0.42),
      tipY - 9 + jitB * 7,
      tipX + sootDir * sootSpan + jitA * 9,
      tipY - 3 + jitC * 7
    );
    ctx.bezierCurveTo(
      tipX + sootDir * (sootSpan * 0.45),
      tipY + 7 + jitB * 6,
      wDisp.x + flameDx * 0.50,
      wDisp.y - 1,
      wDisp.x + sootDir * 4,
      wDisp.y + 2
    );
    ctx.closePath();
    ctx.fill();

    // Detached torn soot puff further along the slipstream
    ctx.beginPath();
    const puffX = tipX + sootDir * (sootSpan + 10) + jitB * 8;
    const puffY = tipY - 5 + jitA * 6;
    ctx.moveTo(puffX - sootDir * 10, puffY);
    ctx.quadraticCurveTo(puffX, puffY - 6, puffX + sootDir * 14, puffY + 1);
    ctx.quadraticCurveTo(puffX + sootDir * 2, puffY + 6, puffX - sootDir * 10, puffY);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const haloCenterX = wickBase.x + flameDx * 0.45;
  const haloCenterY = wickBase.y - flameH * 0.55;
  const haloR = (126 + jitA * 16 - gutterEnv * 12);
  const haloAlpha = (0.25 + jitB * 0.038 - gutterEnv * 0.03 - afterPassTurn * 0.04) * visAlpha;

  const plasterHalo = ctx.createRadialGradient(
    haloCenterX,
    haloCenterY,
    4,
    haloCenterX + sootDir * gutterEnv * 16,
    haloCenterY,
    haloR
  );
  plasterHalo.addColorStop(0.0, `rgba(254, 236, 190, ${(haloAlpha * 1.42).toFixed(3)})`);
  plasterHalo.addColorStop(0.32, `rgba(235, 203, 145, ${(haloAlpha * 0.76).toFixed(3)})`);
  plasterHalo.addColorStop(0.68, `rgba(198, 164, 108, ${(haloAlpha * 0.25).toFixed(3)})`);
  plasterHalo.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = plasterHalo;
  ctx.fillRect(haloCenterX - haloR - 36, haloCenterY - haloR, haloR * 2 + 72, haloR * 2);

  // Soft-blurred orthochromatic silver-halation candle flame tongue
  ctx.filter = 'blur(2.4px)';
  ctx.globalAlpha = clamp(visAlpha * (0.94 - gutterEnv * 0.06 - afterPassTurn * 0.14 + jitC * 0.10), 0, 1);

  ctx.fillStyle = 'rgba(250, 212, 136, 0.86)';
  ctx.beginPath();
  ctx.moveTo(wDisp.x - 3.8, wDisp.y + 1.5);
  ctx.quadraticCurveTo(wDisp.x + flameDx * 0.44 - sootDir * 2, wDisp.y - flameH * 0.85 - 2.5 * gutterEnv, tipX, tipY);
  ctx.quadraticCurveTo(wDisp.x + flameDx * 0.54 + sootDir * 3, wDisp.y - flameH * 0.14 + 2.5 * gutterEnv, wDisp.x + 3.8, wDisp.y + 1.5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 252, 236, 0.98)';
  ctx.beginPath();
  ctx.moveTo(wDisp.x - 2.2, wDisp.y + 0.5);
  ctx.quadraticCurveTo(wDisp.x + flameDx * 0.38, wDisp.y - flameH * 0.60 - 1.5 * gutterEnv, lerp(wDisp.x, tipX, 0.78), lerp(wDisp.y, tipY, 0.78));
  ctx.quadraticCurveTo(wDisp.x + flameDx * 0.42 + sootDir * 1.5, wDisp.y - flameH * 0.12 + 1.2 * gutterEnv, wDisp.x + 2.2, wDisp.y + 0.5);
  ctx.closePath();
  ctx.fill();

  // Detached guttering ember tongue torn along `sootDir` off the stretched wick!
  if (gutterEnv > 0.32) {
    ctx.fillStyle = `rgba(255, 234, 176, ${(0.72 * gutterEnv * (1 - 0.3 * afterPassTurn)).toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(tipX + sootDir * 2, tipY + 0.5);
    ctx.quadraticCurveTo(tipX + sootDir * 13, tipY - 3.5, tipX + sootDir * 24 + jitB * 6, tipY + 1.5);
    ctx.quadraticCurveTo(tipX + sootDir * 12, tipY + 5.0, tipX + sootDir * 2, tipY + 0.5);
    ctx.fill();
  }
  ctx.restore();
  ctx.restore();

  // =========================================================================
  // 2. Helper Tracing One Wall-Displaced Optical Layer of Watchman Hutter's Shadow
  // =========================================================================
  const traceWatchmanLayer = (penumbraSpread, wMul, strokeCol, fillCol) => {
    const W = (pt) => {
      const hFrac = clamp((footStairY - pt.y) / 190, 0, 1.35);
      const sx = pt.x + (pt.x - baseX) * penumbraSpread * 0.055 * hFrac + jitA * 1.4 * hFrac;
      const sy = pt.y - penumbraSpread * 7.5 * hFrac;
      return displaceShadowOnWall(sx, sy);
    };

    const backFootRaw = {
      x: baseX - dirSign * (14 + 9 * terrorEnv),
      y: sampleStairShadowPath(baseX - dirSign * (14 + 9 * terrorEnv)).y + 1.5,
    };
    const frontFootRaw = {
      x: baseX + dirSign * (14 + 4 * terrorEnv),
      y: sampleStairShadowPath(baseX + dirSign * (14 + 4 * terrorEnv)).y + 1.5 - creepStepLift,
    };
    const backKnee = W({
      x: lerp(hip.x, backFootRaw.x, 0.52) + dirSign * (5 - 8 * terrorEnv),
      y: lerp(hip.y, backFootRaw.y, 0.50) + 3 * terrorEnv,
    });
    const frontKnee = W({
      x: lerp(hip.x, frontFootRaw.x, 0.50) + dirSign * (11 + 4 * terrorEnv),
      y: lerp(hip.y, frontFootRaw.y, 0.48) - creepStepLift * 0.6 - 4 * terrorEnv,
    });
    const bFoot = W(backFootRaw);
    const fFoot = W(frontFootRaw);
    const wHip = W(hip);
    const wSh = W(shoulder);
    const wHead = W(head);
    const wCElbow = W(candleElbow);
    const wCHand = W(candleHand);
    const wFElbow = W(freeElbow);
    const wFHand = W(freeHand);

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = strokeCol;
    ctx.fillStyle = fillCol;

    // A. Elongated Spindly Expressionist Legs & Pointed 1830s Boots
    for (const [kPt, fPt] of [[backKnee, bFoot], [frontKnee, fFoot]]) {
      ctx.lineWidth = 5.8 * wMul;
      ctx.beginPath();
      traceWallDisplacedSegment(ctx, wHip, kPt, 4, true);
      traceWallDisplacedSegment(ctx, kPt, fPt, 4, false);
      ctx.stroke();

      // Boot toe silhouette stepping along stone tread
      ctx.beginPath();
      ctx.moveTo(fPt.x - dirSign * 4.5 * wMul, fPt.y + 1);
      ctx.lineTo(fPt.x + dirSign * 12.5 * wMul, fPt.y + 0.5);
      ctx.quadraticCurveTo(fPt.x + dirSign * 14.5 * wMul, fPt.y - 5.2 * wMul, fPt.x + dirSign * 2, fPt.y - 4.8 * wMul);
      ctx.lineTo(fPt.x - dirSign * 4.5 * wMul, fPt.y - 3 * wMul);
      ctx.closePath();
      ctx.fill();
    }

    // B. Gaunt Narrow-Waisted Biedermeier Frock-Coat Torso + Asymmetric Flying Split Coat-Tails!
    const backArch = (11 + 8 * terrorEnv) * profileSquash;
    const chestFront = (8.5 + 1.5 * (1 - terrorEnv)) * profileSquash;
    const waistFront = 5.5 * profileSquash;
    const tailUpperTip = W({
      x: hip.x - dirSign * (17 + 26 * terrorEnv) + jitC * 5 * terrorEnv,
      y: hip.y + 22 - 14 * terrorEnv + jitB * 4 * terrorEnv,
    });
    const tailNotch = W({
      x: hip.x - dirSign * (8 + 8 * terrorEnv),
      y: hip.y + 18 - 4 * terrorEnv,
    });
    const tailLowerTip = W({
      x: hip.x - dirSign * (15 + 22 * terrorEnv) - jitA * 5 * terrorEnv,
      y: hip.y + 37 - 6 * terrorEnv + jitC * 4 * terrorEnv,
    });

    ctx.lineWidth = 2.2 * wMul;
    ctx.beginPath();
    // High peaked 1830s frock-coat collar behind neck -> arched narrow spine -> flying rear split coat-tails!
    ctx.moveTo(wSh.x - dirSign * 10 * profileSquash, wSh.y - 9);
    ctx.quadraticCurveTo(
      lerp(wSh.x, wHip.x, 0.46) - dirSign * backArch,
      lerp(wSh.y, wHip.y, 0.46) - 3,
      wHip.x - dirSign * 8 * profileSquash,
      wHip.y - 2
    );
    ctx.quadraticCurveTo(
      lerp(wHip.x, tailUpperTip.x, 0.55),
      wHip.y + 2,
      tailUpperTip.x,
      tailUpperTip.y
    );
    ctx.lineTo(tailNotch.x, tailNotch.y);
    ctx.lineTo(tailLowerTip.x, tailLowerTip.y);
    // Tight front waist cut away cleanly above the legs (never a wide bell skirt!)
    ctx.quadraticCurveTo(
      wHip.x + dirSign * 2 * profileSquash,
      wHip.y + 12,
      wHip.x + dirSign * waistFront,
      wHip.y - 2
    );
    ctx.quadraticCurveTo(
      lerp(wHip.x, wSh.x, 0.58) + dirSign * chestFront,
      lerp(wHip.y, wSh.y, 0.58),
      wSh.x + dirSign * 8.5 * profileSquash,
      wSh.y - 3
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // C. Clerk Hutter's Startled Head, Sharp Profile Nose/Gaping Jaw & Bristling Hair Spikes!
    ctx.beginPath();
    ctx.moveTo(wHead.x - dirSign * 9.5, wHead.y + 9);
    ctx.bezierCurveTo(
      wHead.x - dirSign * 12.5,
      wHead.y - 9,
      wHead.x + dirSign * 3,
      wHead.y - 14,
      wHead.x + dirSign * 10,
      wHead.y - 4
    );
    ctx.lineTo(wHead.x + dirSign * 16.0, wHead.y + 0.5);
    ctx.lineTo(wHead.x + dirSign * 10.5, wHead.y + 3.5);
    if (terrorEnv > 0.3) {
      ctx.lineTo(wHead.x + dirSign * 7.0, wHead.y + 6.2); // silent-scream open mouth notch!
      ctx.lineTo(wHead.x + dirSign * 11.8, wHead.y + 11.0 + 2.5 * terrorEnv);
    }
    ctx.quadraticCurveTo(wHead.x + dirSign * 3, wHead.y + 13, wHead.x - dirSign * 9.5, wHead.y + 9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 6 Bristling hair tufts standing sharply on end during terror (`[1.85s, 4.55s]`)!
    const hairSpikes = 6;
    ctx.lineWidth = (1.8 + 0.9 * terrorEnv) * wMul;
    for (let hIdx = 0; hIdx < hairSpikes; hIdx++) {
      const hu = hIdx / (hairSpikes - 1);
      const rootAng = lerp(-2.50, -0.80, hu);
      const rx = wHead.x + dirSign * Math.cos(rootAng) * 9.5;
      const ry = wHead.y + Math.sin(rootAng) * 10.5;
      const spikeLen = lerp(4.5, 16.5 + (hIdx % 2) * 5.0, terrorEnv);
      const tipAng = lerp(rootAng - 0.5, -Math.PI * 0.5 + (hu - 0.5) * 1.22 + jitC * 0.24, terrorEnv);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.quadraticCurveTo(
        rx + dirSign * Math.cos(tipAng) * spikeLen * 0.5,
        ry + Math.sin(tipAng) * spikeLen * 0.55,
        rx + dirSign * Math.cos(tipAng) * spikeLen,
        ry + Math.sin(tipAng) * spikeLen
      );
      ctx.stroke();
    }

    // D. Free Arm & 5 Trembling Raised Fingers Splayed High in Terror!
    ctx.lineWidth = 4.8 * wMul;
    ctx.beginPath();
    traceWallDisplacedSegment(ctx, wSh, wFElbow, 3, true);
    traceWallDisplacedSegment(ctx, wFElbow, wFHand, 3, false);
    ctx.stroke();

    if (terrorEnv > 0.15) {
      ctx.lineWidth = 1.9 * wMul;
      for (let f = 0; f < 5; f++) {
        const fanA = -2.30 + f * 0.38 + jitB * 0.24;
        const fLen = (12.5 + (f === 2 ? 4.5 : f === 1 || f === 3 ? 2.8 : 0)) * (0.5 + 0.5 * terrorEnv);
        ctx.beginPath();
        ctx.moveTo(wFHand.x, wFHand.y);
        ctx.quadraticCurveTo(
          wFHand.x + Math.cos(fanA) * fLen * 0.55,
          wFHand.y + Math.sin(fanA) * fLen * 0.55 - 1.5,
          wFHand.x + Math.cos(fanA) * fLen,
          wFHand.y + Math.sin(fanA) * fLen
        );
        ctx.stroke();
      }
    }

    // E. Candle-Bearer Arm + Brass Chamberstick Saucer, Finger-Ring & Tallow Candle Shadow!
    ctx.lineWidth = 5.0 * wMul;
    ctx.beginPath();
    traceWallDisplacedSegment(ctx, wSh, wCElbow, 3, true);
    traceWallDisplacedSegment(ctx, wCElbow, wCHand, 3, false);
    ctx.stroke();

    // Wide lipped chamberstick drip-saucer & side finger-loop (polygon/curve, ZERO arc/ellipse!)
    ctx.lineWidth = 2.6 * wMul;
    ctx.beginPath();
    ctx.moveTo(wCHand.x - 13.5 * wMul, wCHand.y - 1);
    ctx.quadraticCurveTo(wCHand.x, wCHand.y + 4.8 * wMul, wCHand.x + 13.5 * wMul, wCHand.y - 1);
    ctx.stroke();

    // Chamberstick ring-handle loop
    ctx.lineWidth = 1.8 * wMul;
    ctx.beginPath();
    ctx.moveTo(wCHand.x - dirSign * 9, wCHand.y);
    ctx.quadraticCurveTo(wCHand.x - dirSign * 17, wCHand.y + 4, wCHand.x - dirSign * 10, wCHand.y + 8);
    ctx.stroke();

    // Upright candle shaft & wick shadow
    const candleTop = W({ x: wickBase.x, y: wickBase.y + 3 });
    ctx.lineWidth = 4.2 * wMul;
    ctx.beginPath();
    ctx.moveTo(wCHand.x + dirSign * 1.5, wCHand.y - 1);
    ctx.lineTo(candleTop.x, candleTop.y);
    ctx.stroke();

    ctx.restore();
  };

  // =========================================================================
  // 3. Render 3-Tier Variable Contact-to-Penumbra Optical Wall-Shadow!
  //    (Strictly blurred across all tiers so ZERO crisp vector edges exist!)
  // =========================================================================
  ctx.save();
  ctx.beginPath();
  ctx.rect(420, 180, 420, 560); // Strictly keep x > 840 untouched!
  ctx.clip();

  // Tier 1: Wide upper penumbra (masked above lower calves so boot-to-step contact stays sharper!)
  ctx.save();
  ctx.beginPath();
  ctx.rect(420, 180, 420, Math.max(10, footStairY - 24 - 180));
  ctx.clip();
  ctx.shadowColor = `rgba(10, 9, 12, ${(0.74 * visAlpha).toFixed(3)})`;
  ctx.shadowBlur = 22;
  traceWatchmanLayer(
    1.0,
    1.52,
    `rgba(12, 11, 14, ${(0.27 * visAlpha).toFixed(3)})`,
    `rgba(12, 11, 14, ${(0.25 * visAlpha).toFixed(3)})`
  );
  ctx.restore();

  // Tier 2: Mid optical penumbra
  ctx.save();
  ctx.shadowColor = `rgba(9, 8, 11, ${(0.68 * visAlpha).toFixed(3)})`;
  ctx.shadowBlur = 9.5;
  traceWatchmanLayer(
    0.38,
    1.22,
    `rgba(10, 9, 12, ${(0.38 * visAlpha).toFixed(3)})`,
    `rgba(10, 9, 12, ${(0.36 * visAlpha).toFixed(3)})`
  );
  ctx.restore();

  // Tier 3: Contact-hardened core umbra (soft 2.0px emulsion edge at boot contact -> 0.66 alpha at head!)
  const wUmbraGrad = ctx.createLinearGradient(0, footStairY + 6, 0, footStairY - 215);
  wUmbraGrad.addColorStop(0.0, `rgba(7, 7, 10, ${(0.92 * visAlpha).toFixed(3)})`);
  wUmbraGrad.addColorStop(0.38, `rgba(9, 8, 11, ${(0.84 * visAlpha).toFixed(3)})`);
  wUmbraGrad.addColorStop(0.75, `rgba(11, 10, 13, ${(0.74 * visAlpha).toFixed(3)})`);
  wUmbraGrad.addColorStop(1.0, `rgba(13, 12, 15, ${(0.64 * visAlpha).toFixed(3)})`);

  ctx.save();
  ctx.shadowColor = `rgba(8, 8, 11, ${(0.58 * visAlpha).toFixed(3)})`;
  ctx.shadowBlur = 2.2;
  traceWatchmanLayer(0.0, 1.0, wUmbraGrad, wUmbraGrad);
  ctx.restore();

  // Subtle spalled-plaster & stone-mortar texture bleed-through inside Hutter's shadow
  ctx.save();
  ctx.globalAlpha = 0.065 * visAlpha;
  ctx.globalCompositeOperation = 'lighten';
  ctx.drawImage(castleCanvas, 0, 0);
  ctx.restore();

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

  slot.usedFb = false;

  const g = slot.g2d;
  const ctx = g.drawingContext;
  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  // 18Hz hand-cranked silent-camera cadence + ±0.65px mechanical gate weave,
  // smoothly converging to 0 weave & continuous `t` inside x < 90 and x > 910 (#85 Rule §0.3!)
  const edgeCalm =
    smoothstep(16, 92, pelicanLocalX) *
    smoothstep(PANEL_SIZE - 16, PANEL_SIZE - 92, pelicanLocalX);
  const q18Idx = Math.floor(t * 18 + 1e-5);
  const q18T = q18Idx / 18;
  const animT = lerp(t, q18T, edgeCalm * 0.78);
  const weaveX = (hash2i(q18Idx, 11, 19227) - 0.5) * 1.35 * edgeCalm;
  const weaveY = (hash2i(q18Idx, 29, 19227) - 0.5) * 1.25 * edgeCalm;

  ctx.save();
  ctx.translate(weaveX, weaveY);

  // 1. Baked 1922 Orthochromatic Castle Wall (spalled plaster + soft 68px vault penumbra + leaded window)
  const castleBg = getBakedNosferatuCastle(kit);
  ctx.drawImage(castleBg.canvas, 0, 0);

  // 1b. Terrified Candle-Bearer Watchman / Clerk Hutter Wall-Shadow on Upper-Mid Stairwell!
  drawTerrifiedCandleWatchmanShadow(ctx, q18Idx, q18T, scene, castleBg.canvas, isOutroThumbnail);

  // 2. Grotesque Count-Orlok Wall Shadow Pelican & Bicycle (ZERO physical entity!)
  let activeRig = null;
  if (pelicanLocalX > -260 && pelicanLocalX < PANEL_SIZE + 260) {
    const { y: stairY, slope } = sampleStairShadowPath(pelicanLocalX);

    activeRig = computePelicanRig({
      x: pelicanLocalX,
      y: stairY,
      pedalAngle,
      scale: 1.0,
      slope,
      speedScale,
      poseMode: 'normal',
      time: t,
    });

    drawOpticalWallShadow(ctx, activeRig, animT, localT, stairY, castleBg.canvas, isOutroThumbnail);
  }

  // 3. Foreground rough-hewn black staircase banister strictly in y > 766
  drawForegroundBanisterSilhouette(ctx);

  ctx.restore(); // end projector gate weave transform before fixed film-gate aperture!

  // 4. 1922 Orthochromatic Nitrate Grain, 18Hz Scratches, Breathing Iris & 35mm Film Aperture Mask
  drawSilentFilmNitrateOverlay(ctx, kit, t);

  // 5. Special #14 -> #15 Pre-Transition (`localT > 5.4s` -> `89.0s`): CRT Corona Discharge & Burn!
  if (activeRig) {
    drawCoronaDischargeTransition(ctx, activeRig, localT, t);
  }

  // 6. Pure Silent-Film Screen in Main Run (#85 §0.1: outer brass frame plaque carries title);
  //    retain crisp bottom label ONLY for `isOutroThumbnail`!
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(10, 9, 8, 0.86)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.strokeStyle = '#dfd0ae';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, PANEL_SIZE - 96);
    ctx.lineTo(PANEL_SIZE, PANEL_SIZE - 96);
    ctx.stroke();
    ctx.fillStyle = '#f2e6ca';
    ctx.font = '700 48px "PelicanSerif", serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} ${scene.zh}`, 36, PANEL_SIZE - 48);
  }

  ctx.restore();
}
