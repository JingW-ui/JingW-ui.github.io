// src/scenes/s18_vaporwave.js
// #18 蒸汽波 (2010s · Bryce/POV-Ray Chrome Mesh, Per-Pixel 3D Normal-Mapped Plaster Bust & Analog VHS) — r3 Masterpiece
// - Per-pixel 3D sculptural heightfield/quadric normal-mapped Greco-Roman Marble Plaster Bust (5 baked yaw angles
//   with Carrara veins, plaster micro-pores, subsurface alabaster wrap & cyan/magenta Fresnel rim light — zero vector strokes!)
// - Per-pixel 3D normal-mapped Fluted Roman Ionic Column Pedestal matching the bust's Carrara marble shader
// - Quarter-resolution Additive Neon Phosphor Bloom eliminating dry 1px SVG lines on mountains, synth grid, palms & crystal
// - 1995 POV-Ray / Bryce 3D Faceted Environment-Mapped Liquid-Chrome Pelican & Bike (high-luminance pearl-cyan #7df9ff,
//   neon-pink #ff5edb, sunset-gold & white horizon reflections + facet ridge highlights + wet marble causeway reflections!)
// - Viscous 0.79x slowed-tape motion + Bar-2 4x cassette tape-loop stutter + Eye-Safe VHS tracking snow bands + y=986..1000
//   VHS head-switching noise + rightward NTSC chroma smear!
// - Native glowing CRT Camcorder VCR OSD (`PLAY ▶  18 · 2010s` / `蒸 汽 波  VAPORWAVE`) — zero floating black HUD box!

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  clamp,
  lerp,
  smoothstep,
} from '../beat/timeline.js';
import { computePelicanRig } from '../rig/pelican.js';

const HORIZON_Y = 542;

// Exact 30-faced Catalan Rhombic Triacontahedron vertices & planar rhombic faces
const POLYHEDRON = (() => {
  const phi = (1 + Math.sqrt(5)) / 2;
  const invPhi = 1 / phi;
  const verts = [];

  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      for (const sz of [-1, 1]) {
        verts.push([sx, sy, sz]);
      }
    }
  }
  for (const s1 of [-1, 1]) {
    for (const s2 of [-1, 1]) {
      verts.push([0, s1 * invPhi, s2 * phi]);
      verts.push([s2 * phi, 0, s1 * invPhi]);
      verts.push([s1 * invPhi, s2 * phi, 0]);
    }
  }
  for (const s1 of [-1, 1]) {
    for (const s2 of [-1, 1]) {
      verts.push([0, s1 * phi, s2]);
      verts.push([s2, 0, s1 * phi]);
      verts.push([s1 * phi, s2, 0]);
    }
  }

  const normVerts = verts.map(([x, y, z]) => [x / 1.9021, y / 1.9021, z / 1.9021]);

  const faces = [];
  for (let i = 20; i < 32; i++) {
    for (let j = i + 1; j < 32; j++) {
      const dx = normVerts[i][0] - normVerts[j][0];
      const dy = normVerts[i][1] - normVerts[j][1];
      const dz = normVerts[i][2] - normVerts[j][2];
      const d = Math.hypot(dx, dy, dz);
      if (Math.abs(d - 2 / 1.9021) < 0.05) {
        const shared = [];
        for (let k = 0; k < 20; k++) {
          const di = Math.hypot(
            normVerts[i][0] - normVerts[k][0],
            normVerts[i][1] - normVerts[k][1],
            normVerts[i][2] - normVerts[k][2]
          );
          const dj = Math.hypot(
            normVerts[j][0] - normVerts[k][0],
            normVerts[j][1] - normVerts[k][1],
            normVerts[j][2] - normVerts[k][2]
          );
          if (di < 0.66 && dj < 0.66) shared.push(k);
        }
        if (shared.length === 2) {
          faces.push([i, shared[0], j, shared[1]]);
        }
      }
    }
  }

  return { verts: normVerts, faces };
})();

// Reusable offscreen canvases for Quarter-Res Phosphor Bloom & NTSC/VHS Chroma Smear
let _bloomCanvas = null;
let _bloomBlurCanvas = null;
let _aberrationCanvas = null;
let _tintChannelCanvas = null;

function ensurePostCanvases() {
  if (!_bloomCanvas) {
    _bloomCanvas = document.createElement('canvas');
    _bloomCanvas.width = 250;
    _bloomCanvas.height = 250;
  }
  if (!_bloomBlurCanvas) {
    _bloomBlurCanvas = document.createElement('canvas');
    _bloomBlurCanvas.width = 250;
    _bloomBlurCanvas.height = 250;
  }
  if (!_aberrationCanvas) {
    _aberrationCanvas = document.createElement('canvas');
    _aberrationCanvas.width = PANEL_SIZE;
    _aberrationCanvas.height = PANEL_SIZE;
  }
  if (!_tintChannelCanvas) {
    _tintChannelCanvas = document.createElement('canvas');
    _tintChannelCanvas.width = 250;
    _tintChannelCanvas.height = 250;
  }
  return {
    bloom: _bloomCanvas,
    bloomBlur: _bloomBlurCanvas,
    scratch: _aberrationCanvas,
    tint: _tintChannelCanvas,
  };
}

function drawStarSparkle(ctx, x, y, r, color = '#ffffff', alpha = 0.9) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + r * 0.13, y - r * 0.13, x + r, y);
  ctx.quadraticCurveTo(x + r * 0.13, y + r * 0.13, x, y + r);
  ctx.quadraticCurveTo(x - r * 0.13, y + r * 0.13, x - r, y);
  ctx.quadraticCurveTo(x - r * 0.13, y - r * 0.13, x, y - r);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// =============================================================================
// 1. MUSEUM-GRADE PER-PIXEL 3D NORMAL-MAPPED CARRARA MARBLE & PLASTER SHADER
// =============================================================================

function smaxZ(a, b, k) {
  if (a < -9) return b;
  if (b < -9) return a;
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.max(a, b) + h * h * k * 0.25;
}

/**
 * Exact closed-form front-most z of a 3D ellipsoid rotated by `yaw` around Y axis.
 */
function ellipZ(x, y, cx, cy, cz, rx, ry, rz, cyaw, syaw) {
  const dy = (y - cy) / ry;
  const rem = 1.0 - dy * dy;
  if (rem <= 0) return -10;
  const ux = x * cyaw - cx;
  const uz = x * syaw - cz;
  const irx2 = 1 / (rx * rx);
  const irz2 = 1 / (rz * rz);
  const A = syaw * syaw * irx2 + cyaw * cyaw * irz2;
  const B = 2 * (-ux * syaw * irx2 + uz * cyaw * irz2);
  const C = ux * ux * irx2 + uz * uz * irz2 - rem;
  const disc = B * B - 4 * A * C;
  return disc <= 0 ? -10 : (-B + Math.sqrt(disc)) / (2 * A);
}

// 19 3D Greco-Roman sculpted curl lobes [cx, cy, cz, rx, ry, rz] (Apollo Anastole + Temple Tresses!)
const APOLLO_CURL_LOBES = [
  [-0.068, -0.575, 0.245, 0.088, 0.068, 0.092], // Left Anastole crown wave
  [ 0.068, -0.575, 0.245, 0.088, 0.068, 0.092], // Right Anastole crown wave
  [-0.172, -0.545, 0.215, 0.098, 0.074, 0.100],
  [ 0.172, -0.545, 0.215, 0.098, 0.074, 0.100],
  [-0.265, -0.475, 0.160, 0.102, 0.082, 0.105],
  [ 0.265, -0.475, 0.160, 0.102, 0.082, 0.105],
  [-0.335, -0.365, 0.105, 0.102, 0.092, 0.110], // Upper temple cluster
  [ 0.335, -0.365, 0.105, 0.102, 0.092, 0.110],
  [-0.355, -0.235, 0.050, 0.096, 0.092, 0.102], // Mid temple ear-covering curls
  [ 0.355, -0.235, 0.050, 0.096, 0.092, 0.102],
  [-0.332, -0.105,-0.005, 0.084, 0.085, 0.090], // Lower temple side-locks
  [ 0.332, -0.105,-0.005, 0.084, 0.085, 0.090],
  [ 0.000, -0.680, 0.080, 0.145, 0.092, 0.145], // Upper cranial dome curls
  [-0.165, -0.655, 0.050, 0.132, 0.092, 0.132],
  [ 0.165, -0.655, 0.050, 0.132, 0.092, 0.132],
  [-0.285, -0.575,-0.020, 0.132, 0.102, 0.132],
  [ 0.285, -0.575,-0.020, 0.132, 0.102, 0.132],
  [-0.365, -0.435,-0.065, 0.122, 0.110, 0.132],
  [ 0.365, -0.435,-0.065, 0.122, 0.110, 0.132],
];

/**
 * Evaluates the 3D sculptural height `z(x, y)` + ambient occlusion hint of the
 * Classical Greco-Roman Plaster Bust at yaw angle `(cyaw, syaw)`.
 */
function evalClassicalBustSurface(x, y, yaw) {
  const cyaw = Math.cos(yaw);
  const syaw = Math.sin(yaw);
  let z = -10;
  let ao = 1.0;

  // 1. Classical Museum-Cut Chest Shield & Chlamys Drapery (subtle 15% torso follow)
  const cTorso = Math.cos(yaw * 0.16);
  const sTorso = Math.sin(yaw * 0.16);
  if (y > 0.22 && y < 1.12) {
    let zChest = ellipZ(x, y, 0, 0.72, -0.06, 0.86, 0.43, 0.45, cTorso, sTorso);
    if (zChest > -9) {
      const cutY = 0.96 + 0.11 * (1 - x * x * 1.15);
      if (y > cutY || y < 0.35) {
        zChest = -10;
      } else {
        // Beveled museum plaster cast cut edge along bottom rim
        const bevel = clamp((cutY - y) * 16, 0, 1);
        zChest = lerp(-0.14, zChest, bevel);
        // Sweeping classical Greek Chlamys cloak folds + right-shoulder Fibula clasp!
        const foldArg = (x * cTorso) * 10.5 + (y - 0.68) * 9.5 + 0.4;
        const drape = (Math.sin(foldArg) * 0.65 + Math.cos(foldArg * 1.9 - 0.8) * 0.35) *
          0.024 * Math.exp(-Math.pow((y - 0.69) / 0.22, 2));
        zChest += drape;
        if (drape < -0.008) ao *= 0.86;

        // Round fibula brooch on right shoulder (viewer's right, x ≈ +0.46, y ≈ 0.53)
        const bx = x - (0.45 * cTorso);
        const by = y - 0.53;
        const bDist2 = (bx * bx + by * by) / (0.085 * 0.085);
        if (bDist2 < 1.0) {
          zChest += Math.sqrt(1 - bDist2) * 0.045;
        }
      }
    }
    z = smaxZ(z, zChest, 0.045);
  }

  // 2. Turned Cylindrical Greco-Roman Marble Socle Pedestal Foot (y = 0.95..1.20)
  if (y >= 0.94 && y <= 1.20 && Math.abs(x) < 0.32) {
    const uSoc = (y - 1.07) / 0.13;
    const rad = 0.20 + 0.085 * uSoc * uSoc + (Math.abs(y - 1.17) < 0.025 ? 0.025 : 0);
    if (Math.abs(x) < rad) {
      const zSoc = -0.04 + Math.sqrt(Math.max(0, rad * rad - x * x));
      if (zSoc > z) {
        z = zSoc;
        if (y < 1.01) ao *= 0.72; // Deep undercut shadow beneath chest rim!
      }
    }
  }

  // 3. Inclined Anatomical Neck + Sternocleidomastoid Tendons
  if (y > -0.08 && y < 0.56) {
    let zNeck = ellipZ(x, y, 0, 0.23, -0.03, 0.205, 0.34, 0.215, cyaw, syaw);
    if (zNeck > -9) {
      const nxLocal = x * cyaw - zNeck * syaw;
      // V-shaped sternocleidomastoid tendons & suprasternal hollow
      const vDist = Math.abs(Math.abs(nxLocal) - Math.max(0, 0.44 - y) * 0.34);
      const tendon = Math.exp(-Math.pow(vDist / 0.032, 2)) * 0.014 * smoothstep(0.46, 0.16, y);
      const pit = Math.exp(-Math.pow(nxLocal / 0.055, 2) - Math.pow((y - 0.41) / 0.045, 2)) * 0.024;
      zNeck += tendon - pit;
      // Sub-chin cast shadow occlusion onto upper neck!
      const chinOcc = smoothstep(0.28, 0.08, y) * Math.exp(-Math.pow(nxLocal / 0.18, 2));
      ao *= 1.0 - 0.42 * chinOcc;
    }
    z = smaxZ(z, zNeck, 0.065);
  }

  // 4. Classical Cranium, Chiseled Jaw, Recessed Sockets, Blank Plaster Eyes, Greek Nose, Lips & 3D Curls!
  if (y < 0.24) {
    const zSkull = ellipZ(x, y, 0, -0.34, -0.02, 0.345, 0.41, 0.39, cyaw, syaw);
    const zJaw = ellipZ(x, y, 0, -0.085, 0.105, 0.242, 0.265, 0.255, cyaw, syaw);
    const zChin = ellipZ(x, y, 0, 0.108, 0.235, 0.092, 0.078, 0.098, cyaw, syaw);
    let zHead = smaxZ(smaxZ(zSkull, zJaw, 0.135), zChin, 0.065);

    if (zHead > -9) {
      // Face-local coordinates on the rotated 3D head surface
      const fx = x * cyaw - zHead * syaw;
      const fz = x * syaw + zHead * cyaw;

      if (fz > 0.04) {
        const afx = Math.abs(fx);

        // Cheekbone (zygomatic) subtle planar sculpture
        const zygoma = Math.exp(-Math.pow((afx - 0.165) / 0.065, 2) - Math.pow((y + 0.135) / 0.055, 2));
        const hollowCheek = Math.exp(-Math.pow((afx - 0.175) / 0.065, 2) - Math.pow((y + 0.015) / 0.075, 2));
        zHead += zygoma * 0.018 - hollowCheek * 0.016;

        // Deeply recessed orbital sockets beneath sharp classical superciliary brow arch!
        const sock = Math.exp(-Math.pow((afx - 0.120) / 0.078, 2) - Math.pow((y + 0.222) / 0.052, 2));
        zHead -= sock * 0.072;
        ao *= 1.0 - sock * 0.36;

        const browY = -0.292 - 0.014 * Math.sin(Math.min(1, afx / 0.19) * Math.PI);
        const brow = Math.exp(-Math.pow(fx / 0.215, 4) - Math.pow((y - browY) / 0.028, 2));
        zHead += brow * 0.038;

        // Smooth blank spherical plaster eyeballs + chiseled upper & lower marble eyelids!
        const eyeNorm = Math.pow((afx - 0.118) / 0.054, 2) + Math.pow((y + 0.216) / 0.032, 2);
        if (eyeNorm < 1.0) {
          zHead += Math.sqrt(1.0 - eyeNorm) * 0.046;
          ao = Math.max(ao, 0.88);
        }
        const upperLid = Math.exp(-Math.pow((afx - 0.118) / 0.060, 2) - Math.pow((y + 0.244) / 0.010, 2));
        const lidCrease = Math.exp(-Math.pow((afx - 0.118) / 0.062, 2) - Math.pow((y + 0.254) / 0.008, 2));
        const lowerLid = Math.exp(-Math.pow((afx - 0.118) / 0.054, 2) - Math.pow((y + 0.188) / 0.009, 2));
        zHead += upperLid * 0.016 - lidCrease * 0.018 + lowerLid * 0.010;
        if (lidCrease > 0.3) ao *= 0.78;

        // Noble Straight Classical Greek Nose (continuous from glabella to tip!)
        if (y > -0.305 && y < -0.045 && afx < 0.095) {
          const uNose = clamp((y + 0.305) / 0.245, 0, 1);
          const wNose = 0.030 + 0.024 * Math.pow(uNose, 1.7);
          const ridge = Math.max(0, 1.0 - Math.pow(afx / wNose, 1.85));
          const tipTaper = uNose > 0.88 ? Math.cos(((uNose - 0.88) / 0.12) * Math.PI * 0.5) : 1.0;
          zHead += ridge * (0.040 + 0.082 * uNose) * tipTaper;
        }
        // Nostril alar wings + dark nostril undercut hollows
        const alar = Math.exp(-Math.pow((afx - 0.046) / 0.025, 2) - Math.pow((y + 0.072) / 0.020, 2));
        const nostrilCut = Math.exp(-Math.pow((afx - 0.028) / 0.016, 2) - Math.pow((y + 0.056) / 0.011, 2));
        zHead += alar * 0.028 - nostrilCut * 0.022;
        if (nostrilCut > 0.25) ao *= 0.66;

        // Philtrum groove + Sculpted Classical Cupid's-Bow Lips + Mentolabial Cleft
        const philtrum = Math.exp(-Math.pow(fx / 0.018, 2) - Math.pow((y + 0.028) / 0.022, 2));
        const bowCurve = 0.008 * Math.cos(clamp(fx / 0.08, -1, 1) * Math.PI * 2);
        const upLip = Math.exp(-Math.pow(fx / 0.092, 2) - Math.pow((y - (-0.002 + bowCurve)) / 0.018, 2));
        const lipPart = Math.exp(-Math.pow(fx / 0.088, 2) - Math.pow((y - 0.019) / 0.0065, 2));
        const loLip = Math.exp(-Math.pow(fx / 0.076, 2) - Math.pow((y - 0.040) / 0.020, 2));
        const chinCleft = Math.exp(-Math.pow(fx / 0.075, 2) - Math.pow((y - 0.074) / 0.018, 2));
        zHead += -philtrum * 0.010 + upLip * 0.026 - lipPart * 0.030 + loLip * 0.032 - chinCleft * 0.016;
        if (lipPart > 0.25) ao *= 0.65;
      }
    }

    // 5. 19 True 3D Sculpted Greco-Roman Hair Curl Lobes with Chiseled Wave Grooves!
    if (y < 0.06) {
      let zHair = -10;
      let secondHair = -10;
      for (let i = 0; i < APOLLO_CURL_LOBES.length; i++) {
        const cl = APOLLO_CURL_LOBES[i];
        let zc = ellipZ(x, y, cl[0], cl[1], cl[2], cl[3], cl[4], cl[5], cyaw, syaw);
        if (zc > -9) {
          // Carve fine S-curved Hellenistic chisel lock grooves into each 3D curl volume!
          const hx = x * cyaw - zc * syaw;
          const groove = Math.sin((hx - cl[0]) * 52 + (y - cl[1]) * 38 + i * 1.7) * 0.011;
          zc += groove;
          if (zc > zHair) {
            secondHair = zHair;
            zHair = zc;
          } else if (zc > secondHair) {
            secondHair = zc;
          }
        }
      }
      if (zHair > -9) {
        // Deep undercut crevice AO between overlapping marble curls and along hairline!
        if (secondHair > -9 && zHair - secondHair < 0.035) {
          ao *= 0.80;
        }
        if (zHead > -9 && zHair > zHead && zHair - zHead < 0.04) {
          ao *= 0.78;
        }
        zHead = smaxZ(zHead, zHair, 0.022);
      }
    }

    z = smaxZ(z, zHead, 0.055);
  }

  return { z, ao };
}

/**
 * Shades a 3D Carrara Marble / Museum Plaster surface pixel from heightfield normal `(nx, ny, nz)`,
 * world coords `(wx, wy, wz)`, and ambient occlusion `ao` under Vaporwave 3-Point Neon Museum Lighting!
 */
function shadeCarraraMarblePixel(nx, ny, nz, wx, wy, wz, ao) {
  // Subtle Carrara marble grey-violet veining + fine plaster cast micro-pitting
  const veinWave = Math.sin(wx * 8.5 + wy * 6.2 + Math.sin(wx * 19 - wy * 14 + wz * 11) * 1.4);
  const veinDark = Math.pow(Math.max(0, veinWave), 6) * 0.09;
  const poreHash = (((Math.imul((wx * 400) | 0, 73856093) ^ Math.imul((wy * 400) | 0, 19349663)) >>> 0) & 255) / 255;
  const microPore = (poreHash - 0.5) * 0.028;

  // 1. Soft Alabaster Museum Key Light from upper-front-left + Subsurface Wrap!
  const keyDot = -nx * 0.44 - ny * 0.56 + nz * 0.70;
  const wrapDiff = clamp((keyDot + 0.38) / 1.38, 0, 1);
  const spec = Math.pow(Math.max(0, -nx * 0.25 - ny * 0.35 + nz * 0.90), 22) * 0.24;

  // 2. Electric Cyan Left Fresnel Rim & Bounce + Hot Neon Magenta Right Fresnel Rim!
  const fresnel = Math.pow(clamp(1.0 - nz, 0, 1), 1.65);
  const cyanRim = Math.max(0, -nx * 0.92 - ny * 0.08 + nz * 0.18) * (0.35 + 0.85 * fresnel);
  const magRim = Math.max(0, nx * 0.92 + ny * 0.10 + nz * 0.18) * (0.38 + 0.92 * fresnel);
  const topSkyFill = Math.max(0, -ny) * 0.14;

  // Base alabaster shadow-to-highlight ramp (#3d286b -> #cbbde6 -> #fcfaff)
  const lit = clamp((wrapDiff * 0.88 + 0.12) * ao - veinDark + microPore, 0.06, 1.0);
  let r = lerp(52, 250, Math.pow(lit, 0.92)) + spec * 255;
  let g = lerp(34, 245, Math.pow(lit, 0.96)) + spec * 255;
  let b = lerp(98, 255, Math.pow(lit, 0.86)) + spec * 255 + topSkyFill * 90;

  // Additive neon cyan & magenta Fresnel rim glow!
  r += cyanRim * 22 + magRim * 245;
  g += cyanRim * 238 + magRim * 48;
  b += cyanRim * 255 + magRim * 212;

  return [
    clamp(Math.round(r), 0, 255),
    clamp(Math.round(g), 0, 255),
    clamp(Math.round(b), 0, 255),
  ];
}

/**
 * Bakes 5 discrete 3D head-turn yaw angles of the Per-Pixel Normal-Mapped Classical Bust
 * PLUS the Per-Pixel Normal-Mapped Fluted Roman Ionic Column Pedestal once via `kit.bake2D`!
 */
const BUST_YAW_ANGLES = [-0.72, -0.36, 0.0, 0.36, 0.72];
const BUST_W = 216;
const BUST_H = 292;

function getBakedMarbleBustAtlas(kit) {
  return kit.bake2D('s18_apollo_bust_atlas_r3', (_g, ctx) => {
    const totalW = BUST_W * BUST_YAW_ANGLES.length;
    const img = ctx.createImageData(totalW, BUST_H);
    const dst = img.data;

    const zBuf = new Float32Array(BUST_W * BUST_H);
    const aoBuf = new Float32Array(BUST_W * BUST_H);

    const dxWorld = 1.96 / BUST_W;
    const dyWorld = 2.14 / BUST_H;

    for (let k = 0; k < BUST_YAW_ANGLES.length; k++) {
      const yaw = BUST_YAW_ANGLES[k];
      for (let py = 0; py < BUST_H; py++) {
        const wy = (py / BUST_H) * 2.14 - 0.88;
        const rowOff = py * BUST_W;
        for (let px = 0; px < BUST_W; px++) {
          const wx = ((px / BUST_W) - 0.5) * 1.96;
          const res = evalClassicalBustSurface(wx, wy, yaw);
          zBuf[rowOff + px] = res.z;
          aoBuf[rowOff + px] = res.ao;
        }
      }

      const xPanelOff = k * BUST_W;
      for (let py = 1; py < BUST_H - 1; py++) {
        const wy = (py / BUST_H) * 2.14 - 0.88;
        const rowOff = py * BUST_W;
        for (let px = 1; px < BUST_W - 1; px++) {
          const idx = rowOff + px;
          const zc = zBuf[idx];
          if (zc < -9) continue;

          const wx = ((px / BUST_W) - 0.5) * 1.96;
          const zL = zBuf[idx - 1] > -9 ? zBuf[idx - 1] : zc - 0.06;
          const zR = zBuf[idx + 1] > -9 ? zBuf[idx + 1] : zc - 0.06;
          const zU = zBuf[idx - BUST_W] > -9 ? zBuf[idx - BUST_W] : zc - 0.06;
          const zD = zBuf[idx + BUST_W] > -9 ? zBuf[idx + BUST_W] : zc - 0.06;

          const dzdx = (zR - zL) / (2 * dxWorld);
          const dzdy = (zD - zU) / (2 * dyWorld);
          const invLen = 1 / Math.hypot(dzdx, dzdy, 1);
          const nx = -dzdx * invLen;
          const ny = -dzdy * invLen;
          const nz = invLen;

          // Clean anti-aliased silhouette feather on grazing boundary pixels
          let edgeNeighbors = 4;
          if (zBuf[idx - 1] < -9) edgeNeighbors--;
          if (zBuf[idx + 1] < -9) edgeNeighbors--;
          if (zBuf[idx - BUST_W] < -9) edgeNeighbors--;
          if (zBuf[idx + BUST_W] < -9) edgeNeighbors--;
          const alpha = edgeNeighbors === 4 ? 255 : edgeNeighbors === 3 ? 215 : 145;

          const [r, g, b] = shadeCarraraMarblePixel(nx, ny, nz, wx, wy, zc, aoBuf[idx]);
          const pOut = (py * totalW + (xPanelOff + px)) * 4;
          dst[pOut] = r;
          dst[pOut + 1] = g;
          dst[pOut + 2] = b;
          dst[pOut + 3] = alpha;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }, BUST_W * BUST_YAW_ANGLES.length, BUST_H);
}

/**
 * Bakes the Per-Pixel 3D Normal-Mapped Roman Ionic Column Pedestal (`168 x 172`)
 * so the pedestal shares 100% identical Carrara marble veins & neon Fresnel rim lighting!
 */
function getBakedIonicPedestal(kit) {
  const PW = 168;
  const PH = 172;
  return kit.bake2D('s18_ionic_pedestal_r3', (_g, ctx) => {
    const img = ctx.createImageData(PW, PH);
    const dst = img.data;
    const zBuf = new Float32Array(PW * PH);
    const aoBuf = new Float32Array(PW * PH);

    for (let py = 0; py < PH; py++) {
      const v = py / PH; // 0 = top abacus, 1 = bottom plinth
      const wy = v * 1.65;
      for (let px = 0; px < PW; px++) {
        const wx = ((px / PW) - 0.5) * 1.62;
        const ax = Math.abs(wx);
        let z = -10;
        let ao = 1.0;

        // 1. Twin Spiral Ionic Volutes at Capital Sides (v ∈ [0.03..0.28], ax ≈ 0.54)
        const vdx = ax - 0.52;
        const vdy = wy - 0.20;
        const vr = Math.hypot(vdx, vdy);
        if (vr < 0.21) {
          const theta = Math.atan2(vdy, wx < 0 ? -vdx : vdx);
          const spiralGroove = Math.sin(vr * 48 - theta * 1.0) * 0.016;
          const zv = 0.22 + Math.sqrt(Math.max(0, 0.21 * 0.21 - vr * vr)) * 0.55 + spiralGroove;
          z = smaxZ(z, zv, 0.02);
        }

        // 2. Top Abacus Slab & Egg-and-Dart Echinus Cushion (v ∈ [0.00..0.22])
        if (wy < 0.10 && ax < 0.66) {
          const za = 0.34 - Math.pow(ax / 0.66, 6) * 0.08;
          z = smaxZ(z, za, 0.015);
        } else if (wy >= 0.09 && wy < 0.24 && ax < 0.54) {
          const egg = Math.cos(wx * 26) * 0.022 * Math.sin(((wy - 0.09) / 0.15) * Math.PI);
          const ze = 0.30 + egg - Math.pow(ax / 0.54, 4) * 0.06;
          z = smaxZ(z, ze, 0.02);
          if (egg < -0.008) ao *= 0.80;
        }

        // 3. Cylindrical Fluted Column Shaft (7 concave flutes, wy ∈ [0.22..1.38])
        if (wy >= 0.21 && wy <= 1.40 && ax < 0.46) {
          let zs = Math.sqrt(Math.max(0, 0.46 * 0.46 - wx * wx));
          // Carve 7 classical concave flutes into the cylinder!
          const angle = Math.asin(clamp(wx / 0.46, -1, 1));
          const flutePhase = (angle / (Math.PI * 0.44)) * 3.5;
          const frac = Math.abs(flutePhase - Math.round(flutePhase));
          if (Math.abs(angle) < 1.28 && frac < 0.38 && wy > 0.27 && wy < 1.35) {
            const depth = Math.sqrt(Math.max(0, 1 - Math.pow(frac / 0.38, 2))) * 0.042;
            zs -= depth;
            ao *= 1.0 - depth * 3.8;
          }
          // Cast shadow directly beneath capital overhang
          if (wy < 0.34) ao *= lerp(0.58, 1.0, clamp((wy - 0.22) / 0.12, 0, 1));
          z = smaxZ(z, zs, 0.02);
        }

        // 4. Stepped Attic Base Torus & Plinth (wy ∈ [1.38..1.65])
        if (wy > 1.36 && wy <= 1.51 && ax < 0.56) {
          const torus = Math.sin(((wy - 1.36) / 0.15) * Math.PI) * 0.05;
          const zb = Math.sqrt(Math.max(0, 0.56 * 0.56 - wx * wx)) * 0.65 + torus;
          z = smaxZ(z, zb, 0.02);
        }
        if (wy > 1.50 && ax < 0.66) {
          const zp = 0.38 - Math.pow(ax / 0.66, 8) * 0.08;
          z = smaxZ(z, zp, 0.015);
        }

        const idx = py * PW + px;
        zBuf[idx] = z;
        aoBuf[idx] = ao;
      }
    }

    const dxW = 1.62 / PW;
    const dyW = 1.65 / PH;
    for (let py = 1; py < PH - 1; py++) {
      const wy = (py / PH) * 1.65;
      for (let px = 1; px < PW - 1; px++) {
        const idx = py * PW + px;
        const zc = zBuf[idx];
        if (zc < -9) continue;

        const wx = ((px / PW) - 0.5) * 1.62;
        const zL = zBuf[idx - 1] > -9 ? zBuf[idx - 1] : zc - 0.06;
        const zR = zBuf[idx + 1] > -9 ? zBuf[idx + 1] : zc - 0.06;
        const zU = zBuf[idx - PW] > -9 ? zBuf[idx - PW] : zc - 0.06;
        const zD = zBuf[idx + PW] > -9 ? zBuf[idx + PW] : zc - 0.06;

        const dzdx = (zR - zL) / (2 * dxW);
        const dzdy = (zD - zU) / (2 * dyW);
        const inv = 1 / Math.hypot(dzdx, dzdy, 1);
        const [r, g, b] = shadeCarraraMarblePixel(
          -dzdx * inv,
          -dzdy * inv,
          inv,
          wx,
          wy + 1.2,
          zc,
          aoBuf[idx]
        );

        const p = idx * 4;
        dst[p] = r;
        dst[p + 1] = g;
        dst[p + 2] = b;
        dst[p + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, PW, PH);
}

// =============================================================================
// 2. STATIC BAKED SKY, SLICED SUNSET & PHOSPHOR-BLOOMED WIREFRAME MOUNTAINS
// =============================================================================

function drawWireframeMountainRange(ctx, xStart, xEnd, peakProfile) {
  const cols = peakProfile.length - 1;
  const rows = 4;
  const grid = [];

  for (let r = 0; r <= rows; r++) {
    const v = r / rows;
    const rowPts = [];
    for (let c = 0; c <= cols; c++) {
      const u = c / cols;
      const baseX = lerp(xStart, xEnd, u);
      const summitY = peakProfile[c];
      const jitterX = (r > 0 && r < rows && c > 0 && c < cols)
        ? Math.sin(c * 2.7 + r * 1.9) * 14
        : 0;
      const py = lerp(summitY, HORIZON_Y, Math.pow(v, 0.85)) +
        (r > 0 && r < rows ? Math.cos(c * 3.1 - r * 2.2) * 8 : 0);
      rowPts.push({ x: baseX + jitterX, y: Math.min(HORIZON_Y, py) });
    }
    grid.push(rowPts);
  }

  ctx.save();
  // Pass 1: Faceted dark-indigo / synth-violet low-poly mountain faces
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p00 = grid[r][c];
      const p10 = grid[r][c + 1];
      const p01 = grid[r + 1][c];
      const p11 = grid[r + 1][c + 1];

      ctx.fillStyle = (p10.y - p00.y) > 0 ? '#2b0d59' : '#160530';
      ctx.beginPath();
      ctx.moveTo(p00.x, p00.y);
      ctx.lineTo(p10.x, p10.y);
      ctx.lineTo(p01.x, p01.y);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = (p11.y - p01.y) > -4 ? '#200844' : '#3a1170';
      ctx.beginPath();
      ctx.moveTo(p10.x, p10.y);
      ctx.lineTo(p11.x, p11.y);
      ctx.lineTo(p01.x, p01.y);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Pass 2: Soft wide analog phosphor glow + crisp neon core (eliminates dry 1px SVG lines!)
  for (const pass of [
    { blur: 10, widthScale: 2.8, alpha: 0.42 },
    { blur: 0, widthScale: 1.0, alpha: 0.92 },
  ]) {
    ctx.save();
    ctx.globalAlpha = pass.alpha;
    ctx.shadowBlur = pass.blur;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const p00 = grid[r][c];
        const p10 = grid[r][c + 1];
        const p01 = grid[r + 1][c];
        const p11 = grid[r + 1][c + 1];
        const isSummit = r === 0;
        const col = isSummit ? '#5efcff' : ((r + c) & 1) === 0 ? '#00f0ff' : '#ff4edc';
        ctx.strokeStyle = col;
        ctx.shadowColor = col;
        ctx.lineWidth = (isSummit ? 2.2 : 1.35) * pass.widthScale;

        ctx.beginPath();
        ctx.moveTo(p00.x, p00.y);
        ctx.lineTo(p10.x, p10.y);
        ctx.lineTo(p01.x, p01.y);
        ctx.closePath();
        ctx.moveTo(p10.x, p10.y);
        ctx.lineTo(p11.x, p11.y);
        ctx.lineTo(p01.x, p01.y);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
  ctx.restore();
}

function getVaporBackdrop(kit) {
  return kit.bake2D('s18_vapor_sky_r3', (_g, ctx, rng) => {
    const sky = ctx.createLinearGradient(0, 0, 0, HORIZON_Y);
    sky.addColorStop(0.00, '#0d021c');
    sky.addColorStop(0.28, '#230742');
    sky.addColorStop(0.56, '#58127d');
    sky.addColorStop(0.80, '#c81d8c');
    sky.addColorStop(0.93, '#ff4ec8');
    sky.addColorStop(1.00, '#72f7ff');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, PANEL_SIZE, HORIZON_Y + 4);

    // Analog airbrush nebula mist bands
    for (let i = 0; i < 6; i++) {
      const my = 90 + i * 68;
      const mist = ctx.createRadialGradient(500 + (i - 2.5) * 120, my, 10, 500, my, 380);
      mist.addColorStop(0, i % 2 === 0 ? 'rgba(255, 78, 210, 0.10)' : 'rgba(0, 240, 255, 0.08)');
      mist.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = mist;
      ctx.fillRect(0, 0, PANEL_SIZE, HORIZON_Y);
    }

    for (let i = 0; i < 105; i++) {
      const sx = rng() * PANEL_SIZE;
      const sy = rng() * (HORIZON_Y - 70);
      const sr = rng() < 0.16 ? 2.4 : 1.3;
      ctx.fillStyle = i % 3 === 0 ? 'rgba(110, 248, 255, 0.80)' : 'rgba(255, 232, 252, 0.82)';
      ctx.fillRect(sx, sy, sr, sr);
    }
    drawStarSparkle(ctx, 212, 162, 12, '#6efaff', 0.82);
    drawStarSparkle(ctx, 782, 114, 15, '#ffe6fa', 0.88);
    drawStarSparkle(ctx, 638, 184, 10, '#ff6ee0', 0.76);

    // Central Horizontally-Sliced Neon Sunset Disc with Rich Phosphor Halo
    const sunCx = 500;
    const sunCy = 352;
    const sunR = 184;

    const halo = ctx.createRadialGradient(sunCx, sunCy, sunR * 0.35, sunCx, sunCy, sunR * 1.85);
    halo.addColorStop(0.00, 'rgba(255, 195, 110, 0.45)');
    halo.addColorStop(0.38, 'rgba(255, 72, 188, 0.44)');
    halo.addColorStop(0.72, 'rgba(190, 28, 175, 0.18)');
    halo.addColorStop(1.00, 'rgba(90, 12, 150, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(sunCx - 350, sunCy - 350, 700, 700);

    ctx.save();
    ctx.beginPath();
    const sliceCuts = [
      [346, 351],
      [370, 377],
      [394, 404],
      [419, 431],
      [444, 459],
      [470, 488],
      [497, 519],
    ];
    let curY = sunCy - sunR - 4;
    for (const [cutTop, cutBot] of sliceCuts) {
      ctx.rect(sunCx - sunR - 12, curY, sunR * 2 + 24, cutTop - curY);
      curY = cutBot;
    }
    ctx.rect(sunCx - sunR - 12, curY, sunR * 2 + 24, sunCy + sunR + 8 - curY);
    ctx.clip();

    const sunGrad = ctx.createLinearGradient(0, sunCy - sunR, 0, sunCy + sunR);
    sunGrad.addColorStop(0.00, '#fff996');
    sunGrad.addColorStop(0.26, '#ffbe3b');
    sunGrad.addColorStop(0.56, '#ff3d8e');
    sunGrad.addColorStop(0.84, '#df149e');
    sunGrad.addColorStop(1.00, '#7c0d86');
    ctx.shadowColor = '#ff5ec8';
    ctx.shadowBlur = 22;
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunCx, sunCy, sunR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    drawWireframeMountainRange(ctx, -10, 412, [438, 396, 446, 384, 452, 498, 540]);
    drawWireframeMountainRange(ctx, 588, 1010, [540, 494, 446, 390, 448, 400, 440]);

    // Reflective dark synth floor base
    const floorGrad = ctx.createLinearGradient(0, HORIZON_Y, 0, PANEL_SIZE);
    floorGrad.addColorStop(0.00, '#2c0a52');
    floorGrad.addColorStop(0.22, '#170530');
    floorGrad.addColorStop(0.65, '#0d031f');
    floorGrad.addColorStop(1.00, '#070112');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, HORIZON_Y, PANEL_SIZE, PANEL_SIZE - HORIZON_Y);

    const sunRefl = ctx.createRadialGradient(500, HORIZON_Y + 18, 18, 500, HORIZON_Y + 155, 340);
    sunRefl.addColorStop(0, 'rgba(255, 92, 212, 0.42)');
    sunRefl.addColorStop(0.55, 'rgba(0, 240, 255, 0.14)');
    sunRefl.addColorStop(1, 'rgba(255, 78, 205, 0)');
    ctx.fillStyle = sunRefl;
    ctx.fillRect(120, HORIZON_Y, 760, PANEL_SIZE - HORIZON_Y);
  });
}

// =============================================================================
// 3. SYNTH PERSPECTIVE GRID, WET MARBLE CHECKERBOARD, PALMS & TRIACONTAHEDRON
// =============================================================================

function drawSynthGridAndCheckerCorridor(ctx, bctx, vaporT) {
  const vpX = 500;
  const vpY = HORIZON_Y;
  const floorH = PANEL_SIZE - vpY;

  const scrollZ = (vaporT * 0.92) % 1;
  const lateralShift = ((vaporT * 0.62) % 1) * 42;

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, vpY, PANEL_SIZE, floorH);
  ctx.clip();

  // Radial perspective synth lines (drawn on main + quarter-res phosphor bloom buffer!)
  for (let i = -20; i <= 20; i++) {
    const xNear = vpX + i * 115 - lateralShift * 2.7;
    const xHorizon = vpX + (xNear - vpX) * 0.08;
    const distNorm = Math.min(1, Math.abs(i) / 14);
    const col = i % 2 === 0
      ? `rgba(0, 240, 255, ${(0.72 - distNorm * 0.32).toFixed(2)})`
      : `rgba(255, 78, 205, ${(0.62 - distNorm * 0.28).toFixed(2)})`;

    ctx.strokeStyle = col;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(xHorizon, vpY);
    ctx.lineTo(xNear, PANEL_SIZE);
    ctx.stroke();

    if (bctx && (i & 1) === 0) {
      bctx.strokeStyle = i % 4 === 0 ? '#00f0ff' : '#ff4ecd';
      bctx.lineWidth = 1.2;
      bctx.beginPath();
      bctx.moveTo(xHorizon * 0.25, vpY * 0.25);
      bctx.lineTo(xNear * 0.25, PANEL_SIZE * 0.25);
      bctx.stroke();
    }
  }

  const numRows = 15;
  for (let k = 0; k < numRows; k++) {
    const u = (k + scrollZ) / numRows;
    const py = vpY + floorH * Math.pow(u, 2.15);
    const alpha = clamp(u * 1.18, 0.16, 0.88);
    const isPink = k % 3 === 0;
    ctx.strokeStyle = isPink
      ? `rgba(255, 78, 205, ${(alpha * 0.82).toFixed(2)})`
      : `rgba(0, 240, 255, ${(alpha * 0.78).toFixed(2)})`;
    ctx.lineWidth = 1.2 + u * 2.0;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(PANEL_SIZE, py);
    ctx.stroke();

    if (bctx) {
      bctx.strokeStyle = isPink ? '#ff4ecd' : '#00f0ff';
      bctx.lineWidth = 0.8 + u * 1.1;
      bctx.beginPath();
      bctx.moveTo(0, py * 0.25);
      bctx.lineTo(250, py * 0.25);
      bctx.stroke();
    }
  }

  // Horizon laser glow bar
  ctx.strokeStyle = '#7df9ff';
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(0, vpY + 1);
  ctx.lineTo(PANEL_SIZE, vpY + 1);
  ctx.stroke();
  if (bctx) {
    bctx.strokeStyle = '#7df9ff';
    bctx.lineWidth = 2.4;
    bctx.beginPath();
    bctx.moveTo(0, vpY * 0.25);
    bctx.lineTo(250, vpY * 0.25);
    bctx.stroke();
  }

  // Perspective Polished Veined Black & White Marble Checkerboard Causeway straddling y = 680!
  const corrTopY = 652;
  const corrMidY1 = 670;
  const corrMidY2 = 691;
  const corrBotY = 716;
  const bands = [corrTopY, corrMidY1, corrMidY2, corrBotY];

  ctx.fillStyle = '#090314';
  ctx.fillRect(0, corrTopY - 3, PANEL_SIZE, corrBotY - corrTopY + 14);

  const tileShift = (vaporT * 185.0) % 112;
  for (let r = 0; r < 3; r++) {
    const y0 = bands[r];
    const y1 = bands[r + 1];
    const s0 = (y0 - vpY) / (ROAD_EDGE_Y - vpY);
    const s1 = (y1 - vpY) / (ROAD_EDGE_Y - vpY);

    for (let c = -14; c <= 14; c++) {
      const baseCenter0 = c * 56 - tileShift;
      const baseCenter1 = (c + 1) * 56 - tileShift;

      const x0L = vpX + baseCenter0 * s0;
      const x0R = vpX + baseCenter1 * s0;
      const x1R = vpX + baseCenter1 * s1;
      const x1L = vpX + baseCenter0 * s1;

      if (x0R < -40 && x1R < -40) continue;
      if (x0L > PANEL_SIZE + 40 && x1L > PANEL_SIZE + 40) continue;

      const isWhite = ((c + r) & 1) === 0;
      const distCenter = Math.abs((x0L + x0R) * 0.5 - 500);
      const skySheen = Math.max(0, 1 - distCenter / 340);

      if (isWhite) {
        ctx.fillStyle = skySheen > 0.35 ? '#f7effd' : '#e6dff5';
      } else {
        ctx.fillStyle = skySheen > 0.35 ? '#261147' : '#150a2b';
      }

      ctx.beginPath();
      ctx.moveTo(x0L, y0);
      ctx.lineTo(x0R, y0);
      ctx.lineTo(x1R, y1);
      ctx.lineTo(x1L, y1);
      ctx.closePath();
      ctx.fill();

      // Subtle marble diagonal vein & sunset sheen on white tiles
      if (isWhite) {
        ctx.strokeStyle = 'rgba(130, 104, 178, 0.28)';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(lerp(x0L, x0R, 0.25), y0 + 1);
        ctx.lineTo(lerp(x1L, x1R, 0.72), y1 - 1);
        ctx.stroke();

        if (skySheen > 0.05) {
          ctx.fillStyle = `rgba(255, 118, 224, ${(0.24 * skySheen).toFixed(2)})`;
          ctx.fill();
        }
      }
    }
  }

  // Glowing neon causeway curbs & canonical y = 680 laser guide rail
  ctx.strokeStyle = '#ff4ecd';
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(0, corrTopY);
  ctx.lineTo(PANEL_SIZE, corrTopY);
  ctx.moveTo(0, corrBotY);
  ctx.lineTo(PANEL_SIZE, corrBotY);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(110, 250, 255, 0.85)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, ROAD_EDGE_Y);
  ctx.lineTo(PANEL_SIZE, ROAD_EDGE_Y);
  ctx.stroke();

  if (bctx) {
    bctx.strokeStyle = '#ff4ecd';
    bctx.lineWidth = 1.4;
    bctx.beginPath();
    bctx.moveTo(0, corrTopY * 0.25);
    bctx.lineTo(250, corrTopY * 0.25);
    bctx.moveTo(0, corrBotY * 0.25);
    bctx.lineTo(250, corrBotY * 0.25);
    bctx.stroke();
  }

  const curbGrad = ctx.createLinearGradient(0, corrBotY, 0, corrBotY + 12);
  curbGrad.addColorStop(0, '#5a189a');
  curbGrad.addColorStop(1, '#10002b');
  ctx.fillStyle = curbGrad;
  ctx.fillRect(0, corrBotY + 1, PANEL_SIZE, 11);

  ctx.restore();
}

function drawLowPolyPalm(ctx, bctx, baseX, baseY, leanSign, scale, vaporT) {
  ctx.save();
  const sway = Math.sin(vaporT * 1.65 + baseX * 0.02) * 8 * scale;
  const segs = 8;
  const trunkH = 295 * scale;
  const curveX = leanSign * 52 * scale + sway;

  const rings = [];
  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    rings.push({
      x: baseX + curveX * (u * u),
      y: baseY - trunkH * u,
      w: lerp(18, 6.5, u) * scale,
    });
  }

  for (let i = 0; i < segs; i++) {
    const r0 = rings[i];
    const r1 = rings[i + 1];

    ctx.fillStyle = i % 2 === 0 ? '#240b42' : '#33115c';
    ctx.beginPath();
    ctx.moveTo(r0.x - r0.w, r0.y);
    ctx.lineTo(r0.x + r0.w, r0.y);
    ctx.lineTo(r1.x + r1.w, r1.y);
    ctx.lineTo(r1.x - r1.w, r1.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ff5edb';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (bctx) {
      bctx.strokeStyle = '#ff4ecd';
      bctx.lineWidth = 0.9;
      bctx.beginPath();
      bctx.moveTo(r0.x * 0.25, r0.y * 0.25);
      bctx.lineTo(r1.x * 0.25, r1.y * 0.25);
      bctx.stroke();
    }
  }

  const crown = rings[segs];
  const frondSpecs = [
    { ang: -2.65, len: 148, drop: 62 },
    { ang: -2.18, len: 162, drop: 44 },
    { ang: -1.68, len: 135, drop: 26 },
    { ang: -1.12, len: 138, drop: 28 },
    { ang: -0.62, len: 164, drop: 46 },
    { ang: -0.22, len: 150, drop: 66 },
    { ang: 0.16, len: 122, drop: 78 },
  ];

  for (let fIdx = 0; fIdx < frondSpecs.length; fIdx++) {
    const spec = frondSpecs[fIdx];
    // Viscous underwater slowed-cassette frond sway
    const fSway = Math.sin(vaporT * 1.95 + fIdx * 0.9) * 0.05;
    const a = spec.ang + fSway;
    const len = spec.len * scale;
    const drop = spec.drop * scale;
    const leafSegs = 6;

    let prevSpine = { x: crown.x, y: crown.y };
    for (let k = 1; k <= leafSegs; k++) {
      const u = k / leafSegs;
      const sx = crown.x + Math.cos(a) * len * u;
      const sy = crown.y + Math.sin(a) * len * u + drop * u * u;
      const nx = -Math.sin(a);
      const ny = Math.cos(a);
      const wingW = Math.sin(Math.PI * Math.pow(u, 0.75)) * 24 * scale;

      const pL = { x: (prevSpine.x + sx) * 0.5 + nx * wingW, y: (prevSpine.y + sy) * 0.5 + ny * wingW + 8 * scale };
      const pR = { x: (prevSpine.x + sx) * 0.5 - nx * wingW, y: (prevSpine.y + sy) * 0.5 - ny * wingW + 8 * scale };

      ctx.fillStyle = k % 2 === 0 ? 'rgba(0, 210, 232, 0.42)' : 'rgba(156, 48, 235, 0.38)';
      ctx.strokeStyle = k % 2 === 0 ? '#5efcff' : '#00f0ff';
      ctx.lineWidth = 1.4;

      for (const tip of [pL, pR]) {
        ctx.beginPath();
        ctx.moveTo(prevSpine.x, prevSpine.y);
        ctx.lineTo(tip.x, tip.y);
        ctx.lineTo(sx, sy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      if (bctx && k === leafSegs) {
        bctx.strokeStyle = '#00f0ff';
        bctx.lineWidth = 1.0;
        bctx.beginPath();
        bctx.moveTo(crown.x * 0.25, crown.y * 0.25);
        bctx.lineTo(sx * 0.25, sy * 0.25);
        bctx.stroke();
      }
      prevSpine = { x: sx, y: sy };
    }
  }

  ctx.restore();
}

function drawRotatingTriacontahedron(ctx, bctx, cx, cy, radius, vaporT, phaseOffset = 0) {
  const rx = vaporT * 0.62 + phaseOffset;
  const ry = vaporT * 0.88 + phaseOffset * 1.4;
  const crx = Math.cos(rx), srx = Math.sin(rx);
  const cry = Math.cos(ry), sry = Math.sin(ry);

  const proj = POLYHEDRON.verts.map(([x, y, z]) => {
    const y1 = y * crx - z * srx;
    const z1 = y * srx + z * crx;
    const x2 = x * cry + z1 * sry;
    const z2 = -x * sry + z1 * cry;
    const persp = 3.6 / (3.6 - z2 * 0.55);
    return {
      x: cx + x2 * radius * persp,
      y: cy + y1 * radius * persp,
      z: z2,
      raw: [x2, y1, z2],
    };
  });

  const sortedFaces = POLYHEDRON.faces
    .map((f) => {
      const a = proj[f[0]].raw;
      const b = proj[f[1]].raw;
      const c = proj[f[2]].raw;
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
      const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      let nx = uy * vz - uz * vy;
      let ny = uz * vx - ux * vz;
      let nz = ux * vy - uy * vx;
      const nl = Math.hypot(nx, ny, nz) || 1;
      nx /= nl; ny /= nl; nz /= nl;
      const mx = (a[0] + c[0]) * 0.5;
      const my = (a[1] + c[1]) * 0.5;
      const mz = (a[2] + c[2]) * 0.5;
      if (nx * mx + ny * my + nz * mz < 0) {
        nx = -nx; ny = -ny; nz = -nz;
      }
      const depth = (proj[f[0]].z + proj[f[1]].z + proj[f[2]].z + proj[f[3]].z) * 0.25;
      return { f, nx, ny, nz, depth };
    })
    .sort((p, q) => p.depth - q.depth);

  ctx.save();
  for (const { f, nx, ny, nz } of sortedFaces) {
    if (nz <= -0.15) continue;
    const lightCyan = Math.max(0, -nx * 0.7 - ny * 0.5 + nz * 0.5);
    const lightPink = Math.max(0, nx * 0.7 + ny * 0.35 + nz * 0.55);
    const spec = Math.pow(Math.max(0, nz), 8) * 95;
    const r = Math.round(clamp(65 + lightPink * 195 + lightCyan * 35 + spec, 0, 255));
    const g = Math.round(clamp(30 + lightCyan * 215 + lightPink * 45 + spec, 0, 255));
    const b = Math.round(clamp(135 + lightCyan * 125 + lightPink * 110 + spec, 0, 255));

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.68)`;
    ctx.strokeStyle = lightCyan > lightPink ? '#7df9ff' : '#ff6ee0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(proj[f[0]].x, proj[f[0]].y);
    ctx.lineTo(proj[f[1]].x, proj[f[1]].y);
    ctx.lineTo(proj[f[2]].x, proj[f[2]].y);
    ctx.lineTo(proj[f[3]].x, proj[f[3]].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  if (bctx) {
    bctx.fillStyle = 'rgba(0, 240, 255, 0.32)';
    bctx.beginPath();
    bctx.arc(cx * 0.25, cy * 0.25, radius * 0.26, 0, Math.PI * 2);
    bctx.fill();
  }
  ctx.restore();
}

/**
 * Draws the Baked Per-Pixel 3D Normal-Mapped Fluted Ionic Column & Classical Marble Bust,
 * smoothly cross-blending adjacent baked 3D yaw frames with viscous stone inertia!
 */
function drawBakedClassicalMarbleBust(ctx, bctx, bustAtlas, ionicPedestal, cx, baseY, pelicanLocalX, localT) {
  // Viscous stone head-tracking yaw in [-0.72, +0.72]
  const rawYaw = clamp((pelicanLocalX - cx) / 365, -0.72, 0.72);
  const floatIdx = ((rawYaw + 0.72) / 1.44) * (BUST_YAW_ANGLES.length - 1);
  const idx0 = clamp(Math.floor(floatIdx), 0, BUST_YAW_ANGLES.length - 1);
  const idx1 = clamp(idx0 + 1, 0, BUST_YAW_ANGLES.length - 1);
  const frac = floatIdx - idx0;

  ctx.save();

  // 1. Per-Pixel Normal-Mapped Roman Ionic Column Pedestal (y = 486..654)
  const pedW = 164;
  const pedH = 168;
  const pedX = Math.round(cx - pedW / 2);
  const pedY = Math.round(baseY - pedH + 2);
  ctx.drawImage(ionicPedestal.canvas, pedX, pedY, pedW, pedH);

  // 2. Per-Pixel 3D Normal-Mapped Classical Plaster Bust resting on the Ionic Abacus!
  const drawW = 216;
  const drawH = 292;
  const drawX = Math.round(cx - drawW / 2);
  const drawY = Math.round(pedY - drawH + 34); // Socle rests cleanly on Ionic capital at y ≈ 490!

  ctx.drawImage(
    bustAtlas.canvas,
    idx0 * BUST_W, 0, BUST_W, BUST_H,
    drawX, drawY, drawW, drawH
  );
  if (idx1 !== idx0 && frac > 0.01) {
    ctx.globalAlpha = frac;
    ctx.drawImage(
      bustAtlas.canvas,
      idx1 * BUST_W, 0, BUST_W, BUST_H,
      drawX, drawY, drawW, drawH
    );
    ctx.globalAlpha = 1.0;
  }

  // 3. Glowing Holographic Neon Halo Ring hovering above the Bust's Crown (y ≈ 224)
  const haloX = cx + rawYaw * 12;
  const haloY = drawY + 12;
  const tilt = Math.sin(localT * 1.58) * 0.09;
  ctx.strokeStyle = '#7df9ff';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.ellipse(haloX, haloY, 50, 10.5, tilt, 0, Math.PI * 2);
  ctx.stroke();

  if (bctx) {
    bctx.strokeStyle = '#00f0ff';
    bctx.lineWidth = 1.6;
    bctx.beginPath();
    bctx.ellipse(haloX * 0.25, haloY * 0.25, 13, 3, tilt, 0, Math.PI * 2);
    bctx.stroke();
  }

  ctx.restore();
}

/**
 * Draws classic beveled Win95-era Vaporwave Aesthetic Mini-Dialogs (100% fictional, zero real logos).
 */
function drawRetroAestheticWindows(ctx, localT, pelicanLocalX, tapeGlitch) {
  ctx.save();

  const drawVaporDialog = (x, y, w, h, title) => {
    ctx.fillStyle = 'rgba(14, 4, 32, 0.78)';
    ctx.fillRect(x + 5, y + 5, w, h);

    // Classic #C8C2D8 lavender-gray 3D aesthetic dialog frame
    ctx.fillStyle = 'rgba(34, 16, 66, 0.84)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#7df9ff';
    ctx.lineWidth = 1.6;
    ctx.strokeRect(x + 0.8, y + 0.8, w - 1.6, h - 1.6);

    const hGrad = ctx.createLinearGradient(x + 3, y + 3, x + w - 3, y + 3);
    hGrad.addColorStop(0, '#ff2ed6');
    hGrad.addColorStop(0.55, '#8338ec');
    hGrad.addColorStop(1, '#00f0ff');
    ctx.fillStyle = hGrad;
    ctx.fillRect(x + 3, y + 3, w - 6, 21);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 11.5px "PelicanMono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, x + 8, y + 14);

    ctx.fillStyle = '#d8d0e8';
    ctx.fillRect(x + w - 19, y + 5, 14, 14);
    ctx.fillStyle = '#18082e';
    ctx.font = '700 10px "PelicanMono", monospace';
    ctx.fillText('×', x + w - 15, y + 12.5);
  };

  // 1. Upper-right statue gaze telemetry mini-window
  const w1x = 804 + (tapeGlitch > 0.1 ? Math.round(Math.sin(localT * 52) * 3) : 0);
  const w1y = 136;
  drawVaporDialog(w1x, w1y, 174, 102, 'STATUE_GAZE.SYS');
  ctx.fillStyle = '#ffe8fb';
  ctx.font = '500 12.5px "PelicanSans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(pelicanLocalX < 728 ? '视线: ← 偏头追视中' : '视线: 偏头目送中 →', w1x + 10, w1y + 39);
  ctx.fillStyle = '#7df9ff';
  ctx.fillText('表情: 古 典 冷 漠', w1x + 10, w1y + 60);
  ctx.strokeStyle = '#ff6ee0';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(w1x + 48, w1y + 73, 78, 20);
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 11.5px "PelicanSans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('O K', w1x + 87, w1y + 83.5);

  // 2. Lower-left Slowed-Tape Spectrum Equalizer Mini-Window
  const w2x = 40;
  const w2y = 758;
  drawVaporDialog(w2x, w2y, 282, 104, 'PLAZA_84.WAV [0.79x]');
  for (let b = 0; b < 14; b++) {
    const bh = 10 + Math.abs(Math.sin(localT * 5.2 + b * 0.72)) * 34;
    ctx.fillStyle = b % 2 === 0 ? '#7df9ff' : '#ff5edb';
    ctx.fillRect(w2x + 13 + b * 18.5, w2y + 73 - bh, 12, bh);
  }
  ctx.fillStyle = tapeGlitch > 0.05 ? '#ffe66d' : '#e6d8ff';
  ctx.font = '700 11.5px "PelicanMono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(
    tapeGlitch > 0.05 ? '<< TAPE LOOP STUTTER x4 >>' : '▶ SLOWED + REVERB  120BPM',
    w2x + 13,
    w2y + 90
  );

  ctx.restore();
}

// =============================================================================
// 4. 1995 POV-RAY / BRYCE 3D FACETED ENVIRONMENT-MAPPED LIQUID-CHROME PELICAN
// =============================================================================

function evalCubic(p0, p1, p2, p3, u) {
  const m = 1 - u;
  return {
    x: m * m * m * p0.x + 3 * m * m * u * p1.x + 3 * m * u * u * p2.x + u * u * u * p3.x,
    y: m * m * m * p0.y + 3 * m * m * u * p1.y + 3 * m * u * u * p2.y + u * u * u * p3.y,
  };
}

function evalQuad(p0, p1, p2, u) {
  const m = 1 - u;
  return {
    x: m * m * p0.x + 2 * m * u * p1.x + u * u * p2.x,
    y: m * m * p0.y + 2 * m * u * p1.y + u * u * p2.y,
  };
}

/**
 * 1995 POV-Ray / Bryce 3D High-Contrast "Sky-Earth Horizon Banding" Liquid-Chrome Sampler!
 * Enforces authentic 90s raytracer mirror-chrome physics (#95):
 *   - Upper hemisphere (`ry < -0.20`): Deep Midnight Indigo (#140b42) -> Royal Cobalt (#2155cd) -> Electric Cyan (#00f5ff)
 *   - Horizon ridge (`-0.20 <= ry < +0.02`): Electric Cyan (#00f5ff) -> Blazing Laser Pure White (#ffffff)
 *   - Horizon step (`+0.02 <= ry < +0.13`): Sharp POV-Ray Earth-Line Cut (#18083e) -> Hot Neon Magenta (#ff2a9d)
 *   - Lower hemisphere (`ry >= +0.13`): Hot Neon Magenta (#ff2a9d) -> Sunset Amber-Gold (#ffb703) <-> Synth Cyan (#00f5ff)
 * Eliminates washed-out grey-white midtones so chrome pops over BOTH dark synth-grid AND white marble columns!
 */
function sampleSkyEarthChromeEnv(ryBase, rxBase = 0, shimmerPhase = 0, specBoost = 0) {
  const ry = clamp(ryBase + Math.sin(shimmerPhase) * 0.042, -1, 1);
  let r, g, b;

  if (ry < -0.52) {
    // Deep zenith dome: Midnight Indigo (#140b42) <- Royal Cobalt (#2155cd)
    const u = clamp((-ry - 0.52) / 0.48, 0, 1);
    r = lerp(33, 20, u);
    g = lerp(85, 11, u);
    b = lerp(205, 66, u);
  } else if (ry < -0.20) {
    // Upper sky band: Royal Cobalt (#2155cd) -> High-Saturation Electric Cyan (#00f5ff)
    const u = clamp((ry + 0.52) / 0.32, 0, 1);
    r = lerp(33, 0, u);
    g = lerp(85, 245, u);
    b = lerp(205, 255, u);
  } else if (ry < -0.07) {
    // Horizon cyan approach: Electric Cyan (#00f5ff) -> Laser White (#ffffff)
    const u = clamp((ry + 0.20) / 0.13, 0, 1);
    r = lerp(0, 255, u * 0.85);
    g = lerp(245, 255, u);
    b = 255;
  } else if (ry < 0.03) {
    // Blazing POV-Ray Horizon Specular Core: Pure Laser White (#ffffff)!
    r = 255;
    g = 255;
    b = 255;
  } else if (ry < 0.14) {
    // Classic 1995 Raytracer Horizon Discontinuity: Dark Indigo Cut (#18083e) -> Hot Neon Magenta (#ff2a9d)!
    const u = clamp((ry - 0.03) / 0.11, 0, 1);
    if (u < 0.45) {
      r = 24;
      g = 8;
      b = 62;
    } else {
      const k = (u - 0.45) / 0.55;
      r = lerp(24, 255, k);
      g = lerp(8, 42, k);
      b = lerp(62, 157, k);
    }
  } else if (ry < 0.48) {
    // Lower sunset reflection: Hot Neon Magenta (#ff2a9d) -> Sunset Amber-Gold (#ffb703)!
    const u = clamp((ry - 0.14) / 0.34, 0, 1);
    r = 255;
    g = lerp(42, 183, u);
    b = lerp(157, 3, u);
  } else {
    // Ventral grid bounce: Sunset Amber-Gold (#ffb703) <-> Hot Magenta (#ff2a9d) / Electric Cyan (#00f5ff)
    const gridWave = 0.5 + 0.5 * Math.sin(rxBase * 6.2 + shimmerPhase * 1.4);
    if (gridWave < 0.55) {
      const k = gridWave / 0.55;
      r = 255;
      g = lerp(183, 42, k);
      b = lerp(3, 157, k);
    } else {
      const k = (gridWave - 0.55) / 0.45;
      r = lerp(255, 0, k * 0.85);
      g = lerp(42, 245, k);
      b = lerp(157, 255, k);
    }
  }

  return `rgb(${clamp(Math.round(r + specBoost), 0, 255)}, ${clamp(Math.round(g + specBoost), 0, 255)}, ${clamp(Math.round(b + specBoost), 0, 255)})`;
}

/**
 * Renders a 3D faceted triangle `(A, B, C)` at explicit sculpted reflection elevation `ryHint`
 * plus true 3D facet normal tilt computed from `(za, zb, zc)`, producing razor-sharp
 * 1995 Bryce 3D / POV-Ray Sky-Earth Horizon Chrome without muddy pastel wash-out!
 */
function drawChromeHorizonFacet(ctx, A, B, C, za, zb, zc, ryHint, shimmerPhase, ridgeStyle, lineW = 0.75) {
  const ux = B.x - A.x, uy = B.y - A.y, uz = zb - za;
  const vx = C.x - A.x, vy = C.y - A.y, vz = zc - za;
  let nx = uy * vz - uz * vy;
  let ny = uz * vx - ux * vz;
  let nz = ux * vy - uy * vx;
  if (nz < 0) {
    nx = -nx; ny = -ny; nz = -nz;
  }
  const len = Math.hypot(nx, ny, nz) || 1;
  nx /= len; ny /= len; nz /= len;

  // Combine macro cross-section elevation `ryHint` with local 3D facet tilt for jewel-cut reflections
  const ry = ryHint + ny * 0.22 + nx * 0.06;
  const rx = 2 * nx * nz;
  const spec = Math.pow(Math.max(0, -nx * 0.34 - ny * 0.46 + nz * 0.82), 14) * 55;

  ctx.fillStyle = sampleSkyEarthChromeEnv(ry, rx, shimmerPhase, spec);
  ctx.beginPath();
  ctx.moveTo(A.x, A.y);
  ctx.lineTo(B.x, B.y);
  ctx.lineTo(C.x, C.y);
  ctx.closePath();
  ctx.fill();

  if (ridgeStyle && lineW > 0) {
    ctx.strokeStyle = ridgeStyle;
    ctx.lineWidth = lineW;
    ctx.stroke();
  }
}

/**
 * Draws a 3D Cylindrical Sky-Earth Liquid-Chrome Tube between `P` and `Q`:
 * Outer `#12062c` optical-separation backlight rim + Top `#00f5ff` Fresnel edge +
 * `#140b42`->`#2155cd` Midnight Cobalt dark core + `#ffffff` Laser Horizon Spine +
 * `#ff2a9d`->`#ffb703` Neon Magenta & Sunset Gold lower cylinder reflection!
 */
function drawChromePrismTube(ctx, P, Q, halfW, shimmerPhase) {
  const dx = Q.x - P.x;
  const dy = Q.y - P.y;
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len;
  let ny = dx / len;
  // Ensure `(nx, ny)` always points toward the sky (`ny <= 0`) so Sky-Earth banding is physically consistent!
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }

  // 1. Crisp deep dark-violet (#12062c) outer backlight silhouette for razor separation over white marble
  ctx.strokeStyle = '#12062c';
  ctx.lineWidth = halfW * 2 + 3.4;
  ctx.beginPath();
  ctx.moveTo(P.x, P.y);
  ctx.lineTo(Q.x, Q.y);
  ctx.stroke();

  // 2. Cylindrical POV-Ray Sky-Earth Horizon Chrome Reflection Gradient across tube cross-section
  const midX = (P.x + Q.x) * 0.5;
  const midY = (P.y + Q.y) * 0.5;
  const grad = ctx.createLinearGradient(
    midX + nx * halfW,
    midY + ny * halfW,
    midX - nx * halfW,
    midY - ny * halfW
  );
  const shift = clamp(Math.sin(shimmerPhase) * 0.04, -0.04, 0.04);
  grad.addColorStop(0.00, '#00f5ff'); // Top electric-cyan Fresnel rim
  grad.addColorStop(0.16, '#140b42'); // Deep midnight indigo upper core
  grad.addColorStop(0.36, '#2155cd'); // Royal cobalt sky reflection
  grad.addColorStop(clamp(0.49 + shift, 0.42, 0.55), '#00f5ff'); // Horizon cyan approach
  grad.addColorStop(clamp(0.55 + shift, 0.48, 0.61), '#ffffff'); // Blazing laser-white horizon ridge
  grad.addColorStop(clamp(0.63 + shift, 0.56, 0.69), '#18083e'); // Sharp POV-Ray earth-line cut!
  grad.addColorStop(0.80, '#ff2a9d'); // Hot neon magenta lower band
  grad.addColorStop(1.00, '#ffb703'); // Warm sunset amber-gold underside

  const pTop = { x: P.x + nx * halfW, y: P.y + ny * halfW };
  const qTop = { x: Q.x + nx * halfW, y: Q.y + ny * halfW };
  const pBot = { x: P.x - nx * halfW, y: P.y - ny * halfW };
  const qBot = { x: Q.x - nx * halfW, y: Q.y - ny * halfW };

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(pTop.x, pTop.y);
  ctx.lineTo(qTop.x, qTop.y);
  ctx.lineTo(qBot.x, qBot.y);
  ctx.lineTo(pBot.x, pBot.y);
  ctx.closePath();
  ctx.fill();

  // 3. Pinpoint laser-white specular centerline glint
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.lineWidth = Math.max(0.85, halfW * 0.26);
  ctx.beginPath();
  ctx.moveTo(P.x + nx * (halfW * -0.08), P.y + ny * (halfW * -0.08));
  ctx.lineTo(Q.x + nx * (halfW * -0.08), Q.y + ny * (halfW * -0.08));
  ctx.stroke();
}

/**
 * Renders the 1995 Bryce 3D / POV-Ray Faceted Sky-Earth Liquid-Chrome Pelican & Bicycle,
 * Smoked-Obsidian Holographic Laser-Disc Wheels, Outrun Plasma Trails, Wet Marble Reflections,
 * AND Full Optical Separation (Deep-Indigo Drop Aura + `#12062c` Backlight Rim + `#00f5ff` Fresnel)!
 */
function drawRaytracedChromePelican(ctx, bctx, rig, localT) {
  const s = rig.root.scale;
  const lw = (w) => Math.max(0.75, w * s);
  const shimmer = localT * 3.2 + rig.root.x * 0.012;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // ---------------------------------------------------------------------------
  // 0. Wet Polished Marble Vertical Neon Reflection on Checkerboard Causeway (y = 681..736)!
  // ---------------------------------------------------------------------------
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, ROAD_EDGE_Y + 1, PANEL_SIZE, 58);
  ctx.clip();
  for (const w of [rig.rearWheel, rig.frontWheel]) {
    for (let k = 0; k < 7; k++) {
      const ry = ROAD_EDGE_Y + 4 + k * 7.5;
      const waveX = Math.sin(localT * 9 + k * 1.4) * 5;
      const rw = (w.r * 1.08) * (1 - k * 0.10);
      const alpha = (0.36 - k * 0.044);
      ctx.fillStyle = k % 2 === 0
        ? `rgba(0, 245, 255, ${alpha.toFixed(2)})`
        : `rgba(255, 42, 157, ${alpha.toFixed(2)})`;
      ctx.fillRect(w.x - rw + waveX, ry, rw * 2, 4.2);
    }
  }
  const poolG = ctx.createRadialGradient(rig.root.x, ROAD_EDGE_Y + 18, 8, rig.root.x, ROAD_EDGE_Y + 22, 115 * s);
  poolG.addColorStop(0, 'rgba(255, 42, 157, 0.34)');
  poolG.addColorStop(0.55, 'rgba(0, 245, 255, 0.24)');
  poolG.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = poolG;
  ctx.fillRect(rig.root.x - 130 * s, ROAD_EDGE_Y + 1, 260 * s, 56);
  ctx.restore();

  // ---------------------------------------------------------------------------
  // 1. Dual Grounded Deep-Indigo Optical-Separation Aura (Upper Bird + Lower Bike/Wheels!)
  //    Guarantees crisp contrast right in front of the bright white Ionic column at 111.80s!
  // ---------------------------------------------------------------------------
  const auraUpperX = rig.root.x + 8 * s;
  const auraUpperY = rig.root.y - 118 * s;
  const auraUpG = ctx.createRadialGradient(auraUpperX, auraUpperY, 16 * s, auraUpperX, auraUpperY, 156 * s);
  auraUpG.addColorStop(0.00, 'rgba(14, 5, 38, 0.68)');
  auraUpG.addColorStop(0.56, 'rgba(18, 6, 48, 0.38)');
  auraUpG.addColorStop(1.00, 'rgba(14, 5, 38, 0)');
  ctx.fillStyle = auraUpG;
  ctx.beginPath();
  ctx.ellipse(auraUpperX, auraUpperY, 158 * s, 128 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  const auraLowerX = rig.root.x + 2 * s;
  const auraLowerY = rig.root.y - 42 * s;
  const auraLoG = ctx.createRadialGradient(auraLowerX, auraLowerY, 18 * s, auraLowerX, auraLowerY, 152 * s);
  auraLoG.addColorStop(0.00, 'rgba(14, 5, 38, 0.66)');
  auraLoG.addColorStop(0.60, 'rgba(18, 6, 48, 0.36)');
  auraLoG.addColorStop(1.00, 'rgba(14, 5, 38, 0)');
  ctx.fillStyle = auraLoG;
  ctx.beginPath();
  ctx.ellipse(auraLowerX, auraLowerY, 156 * s, 72 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // ---------------------------------------------------------------------------
  // 2. Outrun Dual Plasma Light Ribbons Trailing Leftward + Phosphor Bloom!
  // ---------------------------------------------------------------------------
  const trailLen = 320 * s;
  for (const w of [rig.rearWheel, rig.frontWheel]) {
    const tx0 = w.x - trailLen;
    const tx1 = w.x;

    // Subtle dark-indigo contrast backing behind near-wheel plasma ribbon so neon stays saturated over white stone
    const backGrad = ctx.createLinearGradient(tx0 + 110 * s, 0, tx1, 0);
    backGrad.addColorStop(0, 'rgba(14, 5, 38, 0)');
    backGrad.addColorStop(1, 'rgba(14, 5, 38, 0.48)');
    ctx.fillStyle = backGrad;
    ctx.beginPath();
    ctx.moveTo(tx0 + 110 * s, w.y + 4 * s);
    ctx.lineTo(tx1, w.y - 14 * s);
    ctx.lineTo(tx1, w.y + w.r + 2 * s);
    ctx.lineTo(tx0 + 110 * s, w.y + w.r + 2 * s);
    ctx.closePath();
    ctx.fill();

    const pinkGrad = ctx.createLinearGradient(tx0, 0, tx1, 0);
    pinkGrad.addColorStop(0, 'rgba(255, 42, 157, 0)');
    pinkGrad.addColorStop(0.55, 'rgba(255, 42, 157, 0.58)');
    pinkGrad.addColorStop(1, 'rgba(255, 72, 185, 0.96)');
    ctx.fillStyle = pinkGrad;
    ctx.beginPath();
    ctx.moveTo(tx0, w.y + 8 * s);
    ctx.lineTo(tx1, w.y - 11 * s);
    ctx.lineTo(tx1, w.y + 9 * s);
    ctx.lineTo(tx0, w.y + 21 * s);
    ctx.closePath();
    ctx.fill();

    const cyanGrad = ctx.createLinearGradient(tx0, 0, tx1, 0);
    cyanGrad.addColorStop(0, 'rgba(0, 245, 255, 0)');
    cyanGrad.addColorStop(0.55, 'rgba(0, 245, 255, 0.56)');
    cyanGrad.addColorStop(1, 'rgba(0, 245, 255, 0.96)');
    ctx.fillStyle = cyanGrad;
    ctx.beginPath();
    ctx.moveTo(tx0, w.y + 22 * s);
    ctx.lineTo(tx1, w.y + 11 * s);
    ctx.lineTo(tx1, w.y + w.r);
    ctx.lineTo(tx0, w.y + w.r);
    ctx.closePath();
    ctx.fill();

    const coreGrad = ctx.createLinearGradient(tx0, 0, tx1, 0);
    coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0.96)');
    ctx.strokeStyle = coreGrad;
    ctx.lineWidth = lw(2.4);
    ctx.beginPath();
    ctx.moveTo(tx0 + 32 * s, w.y + 18 * s);
    ctx.lineTo(tx1, w.y + 10 * s);
    ctx.stroke();

    if (bctx) {
      bctx.strokeStyle = '#ff2a9d';
      bctx.lineWidth = 2.4;
      bctx.beginPath();
      bctx.moveTo((tx0 + 60 * s) * 0.25, (w.y + 8 * s) * 0.25);
      bctx.lineTo(tx1 * 0.25, w.y * 0.25);
      bctx.stroke();

      bctx.strokeStyle = '#00f5ff';
      bctx.beginPath();
      bctx.moveTo((tx0 + 40 * s) * 0.25, (w.y + w.r - 4 * s) * 0.25);
      bctx.lineTo(tx1 * 0.25, (w.y + w.r - 4 * s) * 0.25);
      bctx.stroke();
    }
  }

  // ---------------------------------------------------------------------------
  // 3. Smoked-Obsidian Holographic Laser-Disc Wheels & Cylindrical Chrome Legs
  // ---------------------------------------------------------------------------
  const drawHoloLaserWheel = (w) => {
    // Deep smoked-obsidian backing disc so white column stone never bleaches out wheel interior!
    ctx.fillStyle = 'rgba(18, 6, 44, 0.78)';
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
    ctx.fill();

    // Iridescent high-saturation holographic LaserDisc rainbow sectors
    const sectors = 12;
    for (let i = 0; i < sectors; i++) {
      const a0 = w.angle + (i * Math.PI * 2) / sectors;
      const a1 = w.angle + ((i + 1) * Math.PI * 2) / sectors;
      const mod = i % 4;
      ctx.fillStyle = mod === 0
        ? 'rgba(0, 245, 255, 0.56)'
        : mod === 1
        ? 'rgba(33, 85, 205, 0.68)'
        : mod === 2
        ? 'rgba(255, 42, 157, 0.54)'
        : 'rgba(20, 11, 66, 0.82)';
      ctx.beginPath();
      ctx.moveTo(w.x, w.y);
      ctx.arc(w.x, w.y, w.r - 3.5 * s, a0, a1);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = i % 2 === 0 ? '#00f5ff' : '#ff2a9d';
      ctx.lineWidth = lw(1.35);
      ctx.beginPath();
      ctx.moveTo(w.x, w.y);
      ctx.lineTo(w.x + Math.cos(a0) * (w.r - 3.5 * s), w.y + Math.sin(a0) * (w.r - 3.5 * s));
      ctx.stroke();
    }

    // Concentric LaserDisc amber-gold & cobalt data rings
    ctx.strokeStyle = '#ffb703';
    ctx.lineWidth = lw(1.8);
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.r * 0.56, 0, Math.PI * 2);
    ctx.stroke();

    // Bold dark-violet obsidian tire casing (#12062c) + dual blazing neon rims (#ff2a9d & #00f5ff)
    ctx.strokeStyle = '#12062c';
    ctx.lineWidth = lw(9.4);
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#ff2a9d';
    ctx.lineWidth = lw(3.8);
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.r - 3.2 * s, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = lw(2.8);
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.r - 0.6 * s, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#12062c';
    ctx.beginPath();
    ctx.arc(w.x, w.y, 7.2 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(w.x, w.y, 4.6 * s, 0, Math.PI * 2);
    ctx.fill();

    if (bctx) {
      bctx.strokeStyle = '#00f5ff';
      bctx.lineWidth = 1.6;
      bctx.beginPath();
      bctx.arc(w.x * 0.25, w.y * 0.25, w.r * 0.25, 0, Math.PI * 2);
      bctx.stroke();
    }
  };

  const drawChromeLeg = (hipPt, kneePt, footPt, pedalPt, isBack) => {
    drawChromePrismTube(ctx, rig.bb, pedalPt, 2.5 * s, shimmer);
    drawChromePrismTube(ctx, hipPt, kneePt, (isBack ? 3.5 : 4.1) * s, shimmer + (isBack ? 1.1 : 0));
    drawChromePrismTube(ctx, kneePt, footPt, (isBack ? 3.1 : 3.7) * s, shimmer + 0.5);

    // Faceted Sky-Earth chrome webbed foot with `#12062c` outer separation rim
    const fTip = { x: footPt.x + 16 * s, y: footPt.y + 2 * s };
    const fBot = { x: footPt.x + 9 * s, y: footPt.y + 8 * s };
    const fHeel = { x: footPt.x - 5 * s, y: footPt.y + 4 * s };
    ctx.strokeStyle = '#12062c';
    ctx.fillStyle = '#12062c';
    ctx.lineWidth = lw(4.2);
    ctx.beginPath();
    ctx.moveTo(footPt.x, footPt.y);
    ctx.lineTo(fTip.x, fTip.y);
    ctx.lineTo(fBot.x, fBot.y);
    ctx.lineTo(fHeel.x, fHeel.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    drawChromeHorizonFacet(ctx, footPt, fTip, fBot, 7, 2, 3, -0.32, shimmer + 0.8, '#00f5ff', lw(0.9));
    drawChromeHorizonFacet(ctx, footPt, fBot, fHeel, 7, 3, 2, 0.26, shimmer + 1.0, '#ff2a9d', lw(0.9));

    ctx.strokeStyle = '#12062c';
    ctx.lineWidth = lw(6.0);
    ctx.beginPath();
    ctx.moveTo(pedalPt.x - 8 * s, pedalPt.y + 2 * s);
    ctx.lineTo(pedalPt.x + 8 * s, pedalPt.y + 2 * s);
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = lw(2.8);
    ctx.stroke();
  };

  drawChromeLeg(rig.leftHip, rig.leftKnee, rig.leftFoot, rig.leftPedal, true);
  drawHoloLaserWheel(rig.rearWheel);
  drawHoloLaserWheel(rig.frontWheel);

  // ---------------------------------------------------------------------------
  // 4. 3D Cylindrical Sky-Earth Liquid-Chrome Bicycle Frame
  // ---------------------------------------------------------------------------
  drawChromePrismTube(ctx, rig.rearWheel, rig.seatCluster, 3.5 * s, shimmer);
  drawChromePrismTube(ctx, rig.rearWheel, rig.bb, 3.3 * s, shimmer + 0.3);
  drawChromePrismTube(ctx, rig.bb, rig.seatCluster, 3.8 * s, shimmer + 0.6);
  drawChromePrismTube(ctx, rig.seatCluster, rig.headTop, 3.9 * s, shimmer + 0.2);
  drawChromePrismTube(ctx, rig.bb, rig.headBot, 4.0 * s, shimmer + 0.7);
  drawChromePrismTube(ctx, rig.headTop, rig.frontWheel, 3.6 * s, shimmer + 0.9);
  drawChromePrismTube(ctx, rig.seatCluster, rig.saddle, 2.9 * s, shimmer);
  drawChromePrismTube(ctx, rig.headTop, rig.stemTop, 2.9 * s, shimmer);
  drawChromePrismTube(ctx, rig.stemTop, rig.handleGrip, 2.6 * s, shimmer + 0.4);

  // Dark-cobalt & neon-magenta chrome chainring disc
  ctx.fillStyle = '#140b42';
  ctx.strokeStyle = '#12062c';
  ctx.lineWidth = lw(4.4);
  ctx.beginPath();
  ctx.arc(rig.bb.x, rig.bb.y, 13 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#00f5ff';
  ctx.lineWidth = lw(2.0);
  ctx.stroke();
  ctx.strokeStyle = '#ff2a9d';
  ctx.lineWidth = lw(1.6);
  ctx.beginPath();
  ctx.arc(rig.bb.x, rig.bb.y, 8.5 * s, 0, Math.PI * 2);
  ctx.stroke();

  // Chrome racing saddle with `#12062c` outer bevel & neon magenta/white specular top
  ctx.strokeStyle = '#12062c';
  ctx.lineWidth = lw(9.2);
  ctx.beginPath();
  ctx.moveTo(rig.saddle.x - 14 * s, rig.saddle.y);
  ctx.lineTo(rig.saddle.x + 12 * s, rig.saddle.y + 1 * s);
  ctx.stroke();
  ctx.strokeStyle = '#ff2a9d';
  ctx.lineWidth = lw(5.0);
  ctx.stroke();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = lw(1.8);
  ctx.beginPath();
  ctx.moveTo(rig.saddle.x - 12 * s, rig.saddle.y - 1.2 * s);
  ctx.lineTo(rig.saddle.x + 10 * s, rig.saddle.y - 0.3 * s);
  ctx.stroke();

  // ---------------------------------------------------------------------------
  // 5. True 1995 POV-Ray / Bryce 3D Sky-Earth Horizon Chrome Pelican Mesh!
  // ---------------------------------------------------------------------------
  const pTail = rig.tailTip;
  const pChest = { x: rig.chest.x + 9 * s, y: rig.chest.y - 6 * s };
  const pHipBot = { x: rig.hip.x - 14 * s, y: rig.hip.y + 16 * s };
  const cTop = { x: rig.bodyCenter.x - 36 * s, y: rig.bodyCenter.y - 30 * s };
  const cFront = { x: rig.bodyCenter.x + 36 * s, y: rig.bodyCenter.y + 26 * s };
  const cRearBot = { x: rig.bodyCenter.x - 46 * s, y: rig.bodyCenter.y + 15 * s };

  const nBack0 = { x: rig.chest.x - 9 * s, y: rig.chest.y - 1 * s };
  const nBack1 = { x: rig.neckC1.x - 8 * s, y: rig.neckC1.y };
  const nBack2 = { x: rig.neckC2.x - 9 * s, y: rig.neckC2.y };
  const nBack3 = { x: rig.head.x - 10 * s, y: rig.head.y };

  const nFront0 = { x: rig.chest.x + 7 * s, y: rig.chest.y + 7 * s };
  const nFront1 = { x: rig.neckC1.x + 9 * s, y: rig.neckC1.y + 3 * s };
  const nFront2 = { x: rig.neckC2.x + 9 * s, y: rig.neckC2.y + 2 * s };
  const nFront3 = { x: rig.head.x + 8 * s, y: rig.head.y + 5 * s };

  const hx = rig.head.x;
  const hy = rig.head.y;
  const hr = rig.head.r * 1.08;

  const pouchStart = rig.beakLowerBase;
  const pouchCtrl = { x: rig.pouchBelly.x, y: rig.pouchBelly.y + 3 * s };
  const pouchEnd = { x: rig.beakTip.x - 3 * s, y: rig.beakTip.y + 1 * s };
  const beakTopBase = rig.beakUpperBase;
  const beakTip = { x: rig.beakTip.x + 2 * s, y: rig.beakTip.y - 2 * s };

  // --- 5A. Optical-Separation Under-Fill + `#12062c` Backlight Rim + Soft Drop Shadow! ---
  // Fills `#12062c` behind all mesh triangles (eliminating any AA white bleed) AND carves
  // a crisp 2.8px `#12062c` dark-violet silhouette + 12px deep-indigo aura over white columns!
  ctx.save();
  ctx.shadowColor = 'rgba(14, 5, 38, 0.78)';
  ctx.shadowBlur = 12 * s;
  ctx.fillStyle = '#12062c';
  ctx.strokeStyle = '#12062c';
  ctx.lineWidth = lw(5.8);

  // Torso silhouette
  ctx.beginPath();
  ctx.moveTo(pTail.x, pTail.y);
  ctx.quadraticCurveTo(cTop.x, cTop.y, pChest.x, pChest.y);
  ctx.quadraticCurveTo(cFront.x, cFront.y, pHipBot.x, pHipBot.y);
  ctx.quadraticCurveTo(cRearBot.x, cRearBot.y, pTail.x, pTail.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // S-Neck silhouette
  ctx.beginPath();
  ctx.moveTo(nBack0.x, nBack0.y);
  ctx.bezierCurveTo(nBack1.x, nBack1.y, nBack2.x, nBack2.y, nBack3.x, nBack3.y);
  ctx.lineTo(nFront3.x, nFront3.y);
  ctx.bezierCurveTo(nFront2.x, nFront2.y, nFront1.x, nFront1.y, nFront0.x, nFront0.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cranium + Crest blades silhouette
  ctx.beginPath();
  ctx.arc(hx, hy, hr, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(hx - 6 * s, hy - 10 * s);
  ctx.lineTo(rig.crest1.x - 6 * s, rig.crest1.y - 3 * s);
  ctx.lineTo(hx - 12 * s, hy - 2 * s);
  ctx.closePath();
  ctx.moveTo(hx - 9 * s, hy - 4 * s);
  ctx.lineTo(rig.crest2.x - 7 * s, rig.crest2.y + 1 * s);
  ctx.lineTo(hx - 12 * s, hy + 4 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Hooked Beak + Gular Pouch silhouette
  ctx.beginPath();
  ctx.moveTo(beakTopBase.x, beakTopBase.y);
  ctx.lineTo(beakTip.x, beakTip.y);
  ctx.lineTo(beakTip.x - 2 * s, beakTip.y + 8 * s);
  ctx.lineTo(pouchEnd.x, pouchEnd.y);
  ctx.quadraticCurveTo(pouchCtrl.x, pouchCtrl.y, pouchStart.x, pouchStart.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // --- 5B. 5-Band Faceted Torso Mesh (Midnight Cobalt Core -> Laser White Horizon -> Neon Magenta/Gold!) ---
  const torsoSlices = 7;
  const tRows = [[], [], [], [], [], []]; // 6 boundary rows = 5 cross-sectional bands!
  const rowFracs = [0.0, 0.24, 0.44, 0.58, 0.78, 1.0];
  const rowDepths = [2, 16, 26, 25, 16, 2];

  for (let i = 0; i <= torsoSlices; i++) {
    const u = i / torsoSlices;
    const tp = evalQuad(pTail, cTop, pChest, u);
    const bp = u < 0.5
      ? evalQuad(pTail, cRearBot, pHipBot, u * 2)
      : evalQuad(pHipBot, cFront, pChest, (u - 0.5) * 2);
    const arch = Math.sin(Math.PI * u);
    for (let rIdx = 0; rIdx < 6; rIdx++) {
      const vf = rowFracs[rIdx];
      const puffX = Math.sin(Math.PI * vf) * 3.5 * s * arch;
      const puffY = (vf - 0.5) * -2.2 * s * arch;
      tRows[rIdx].push({
        x: lerp(tp.x, bp.x, vf) + puffX,
        y: lerp(tp.y, bp.y, vf) + puffY,
        z: rowDepths[rIdx] * s * (0.28 + 0.72 * arch),
      });
    }
  }

  // Band target reflection elevations `ry`:
  //   0: Deep Midnight Indigo (#140b42)
  //   1: Royal Cobalt (#2155cd) -> Electric Cyan (#00f5ff)
  //   2: Blazing Laser White (#ffffff) + Electric Cyan (#00f5ff) Horizon Ridge!
  //   3: Sharp Dark Horizon Cut (#18083e) -> Hot Neon Magenta (#ff2a9d)
  //   4: Sunset Amber-Gold (#ffb703) + Hot Neon Magenta (#ff2a9d)
  const torsoBandRy = [-0.72, -0.36, -0.05, 0.14, 0.44];
  const torsoBandStroke = [
    'rgba(0, 245, 255, 0.50)',
    'rgba(0, 245, 255, 0.65)',
    '#ffffff',
    'rgba(24, 8, 62, 0.65)',
    'rgba(255, 42, 157, 0.62)',
  ];

  for (let i = 0; i < torsoSlices; i++) {
    const longTilt = ((i / torsoSlices) - 0.45) * 0.08;
    for (let b = 0; b < 5; b++) {
      const p00 = tRows[b][i];
      const p10 = tRows[b][i + 1];
      const p01 = tRows[b + 1][i];
      const p11 = tRows[b + 1][i + 1];
      const ryA = torsoBandRy[b] + longTilt - 0.05;
      const ryB = torsoBandRy[b] + longTilt + 0.05;
      const strokeW = b === 2 ? lw(1.05) : lw(0.72);
      drawChromeHorizonFacet(ctx, p00, p10, p11, p00.z, p10.z, p11.z, ryA, shimmer + i * 0.12, torsoBandStroke[b], strokeW);
      drawChromeHorizonFacet(ctx, p00, p11, p01, p00.z, p11.z, p01.z, ryB, shimmer + i * 0.12 + 0.18, torsoBandStroke[b], strokeW);
    }
  }

  // --- 5C. S-Curved 4-Band Cylindrical Sky-Earth Chrome Neck ---
  const neckSegs = 6;
  const nRows = [[], [], [], [], []]; // 5 boundary curves = 4 cross-sectional bands!
  const nFracs = [0.0, 0.28, 0.50, 0.72, 1.0];
  const nDepths = [2, 11, 15, 11, 2];
  for (let i = 0; i <= neckSegs; i++) {
    const u = i / neckSegs;
    const bPt = evalCubic(nBack0, nBack1, nBack2, nBack3, u);
    const fPt = evalCubic(nFront0, nFront1, nFront2, nFront3, u);
    for (let rIdx = 0; rIdx < 5; rIdx++) {
      const vf = nFracs[rIdx];
      nRows[rIdx].push({
        x: lerp(bPt.x, fPt.x, vf),
        y: lerp(bPt.y, fPt.y, vf),
        z: nDepths[rIdx] * s,
      });
    }
  }
  const neckBandRy = [-0.66, -0.06, 0.14, 0.42];
  const neckBandStroke = ['rgba(0, 245, 255, 0.55)', '#ffffff', 'rgba(24, 8, 62, 0.62)', 'rgba(255, 42, 157, 0.62)'];
  for (let i = 0; i < neckSegs; i++) {
    for (let b = 0; b < 4; b++) {
      const p00 = nRows[b][i], p10 = nRows[b][i + 1];
      const p01 = nRows[b + 1][i], p11 = nRows[b + 1][i + 1];
      drawChromeHorizonFacet(ctx, p00, p10, p11, p00.z, p10.z, p11.z, neckBandRy[b] - 0.04, shimmer + i * 0.14, neckBandStroke[b], b === 1 ? lw(0.95) : lw(0.68));
      drawChromeHorizonFacet(ctx, p00, p11, p01, p00.z, p11.z, p01.z, neckBandRy[b] + 0.04, shimmer + i * 0.14 + 0.2, neckBandStroke[b], b === 1 ? lw(0.95) : lw(0.68));
    }
  }

  // --- 5D. 2-Ring Geodesic Chrome Cranium + High-Contrast Swept Chrome Crest Blades! ---
  const headCenter = { x: hx + 1 * s, y: hy - 1 * s };
  const headMid = [];
  const headRim = [];
  const headSides = 10;
  for (let k = 0; k < headSides; k++) {
    const a = (k * Math.PI * 2) / headSides;
    headMid.push({ x: hx + Math.cos(a) * hr * 0.54, y: hy + Math.sin(a) * hr * 0.54 });
    headRim.push({ x: hx + Math.cos(a) * hr, y: hy + Math.sin(a) * hr });
  }
  for (let k = 0; k < headSides; k++) {
    const kNext = (k + 1) % headSides;
    const aMid = ((k + 0.5) * Math.PI * 2) / headSides;
    const nySector = Math.sin(aMid); // -1 at crown (dorsal), 0 at horizon, +1 at jaw!
    const innerRy = nySector * 0.55 - 0.08;
    const outerRy = nySector * 0.78;
    const seamCol = Math.abs(nySector) < 0.28 ? '#ffffff' : nySector < 0 ? 'rgba(0, 245, 255, 0.58)' : 'rgba(255, 42, 157, 0.58)';
    drawChromeHorizonFacet(ctx, headCenter, headMid[k], headMid[kNext], 16 * s, 10 * s, 10 * s, innerRy, shimmer + k * 0.1, seamCol, lw(0.75));
    drawChromeHorizonFacet(ctx, headMid[k], headRim[k], headRim[kNext], 10 * s, 2 * s, 2 * s, outerRy, shimmer + k * 0.1 + 0.15, seamCol, lw(0.75));
    drawChromeHorizonFacet(ctx, headMid[k], headRim[kNext], headMid[kNext], 10 * s, 2 * s, 10 * s, (innerRy + outerRy) * 0.5, shimmer + k * 0.1 + 0.25, seamCol, lw(0.75));
  }

  // Swept chrome crest feathers: upper midnight-cobalt/cyan blade + lower laser-white/magenta blade!
  drawChromeHorizonFacet(
    ctx,
    { x: hx - 6 * s, y: hy - 10 * s },
    { x: rig.crest1.x - 5 * s, y: rig.crest1.y - 3 * s },
    { x: hx - 12 * s, y: hy - 2 * s },
    9 * s, 1 * s, 6 * s,
    -0.58,
    shimmer,
    '#00f5ff',
    lw(1.0)
  );
  drawChromeHorizonFacet(
    ctx,
    { x: hx - 9 * s, y: hy - 4 * s },
    { x: rig.crest2.x - 6 * s, y: rig.crest2.y + 1 * s },
    { x: hx - 12 * s, y: hy + 4 * s },
    8 * s, 1 * s, 5 * s,
    0.22,
    shimmer + 0.3,
    '#ff2a9d',
    lw(1.0)
  );

  // ---------------------------------------------------------------------------
  // 6. 4-Band Pleated Sky-Earth Chrome Gular Throat Pouch & Hooked Mandible Prism!
  // ---------------------------------------------------------------------------
  const pouchSlices = 6;
  const pRows = [[], [], [], [], []]; // 4 pleated bands!
  const pFracs = [0.0, 0.26, 0.50, 0.76, 1.0];
  const pDepths = [3, 12, 18, 12, 2];
  for (let i = 0; i <= pouchSlices; i++) {
    const u = i / pouchSlices;
    const topP = { x: lerp(beakTopBase.x, pouchEnd.x, u), y: lerp(beakTopBase.y + 4 * s, pouchEnd.y, u) };
    const botP = evalQuad(pouchStart, pouchCtrl, pouchEnd, u);
    const bulge = Math.sin(Math.PI * u);
    for (let rIdx = 0; rIdx < 5; rIdx++) {
      const vf = pFracs[rIdx];
      pRows[rIdx].push({
        x: lerp(topP.x, botP.x, vf),
        y: lerp(topP.y, botP.y, vf),
        z: pDepths[rIdx] * s * (0.22 + 0.78 * bulge),
      });
    }
  }
  const pouchBandRy = [-0.62, -0.06, 0.18, 0.48];
  const pouchBandStroke = ['rgba(0, 245, 255, 0.55)', '#ffffff', 'rgba(24, 8, 62, 0.65)', 'rgba(255, 183, 3, 0.72)'];
  for (let i = 0; i < pouchSlices; i++) {
    for (let b = 0; b < 4; b++) {
      const p00 = pRows[b][i], p10 = pRows[b][i + 1];
      const p01 = pRows[b + 1][i], p11 = pRows[b + 1][i + 1];
      drawChromeHorizonFacet(ctx, p00, p10, p11, p00.z, p10.z, p11.z, pouchBandRy[b] - 0.05, shimmer + 0.4 + i * 0.1, pouchBandStroke[b], b === 1 ? lw(0.95) : lw(0.7));
      drawChromeHorizonFacet(ctx, p00, p11, p01, p00.z, p11.z, p01.z, pouchBandRy[b] + 0.05, shimmer + 0.5 + i * 0.1, pouchBandStroke[b], b === 1 ? lw(0.95) : lw(0.7));
    }
  }

  // Faceted Chrome Upper Hooked Mandible (Deep Cobalt dorsal ridge + Laser-White culmen!)
  const beakMid = {
    x: lerp(beakTopBase.x, beakTip.x, 0.55),
    y: lerp(beakTopBase.y, beakTip.y, 0.55) + 2.6 * s,
  };
  drawChromeHorizonFacet(ctx, beakTopBase, beakTip, beakMid, 6 * s, 2 * s, 12 * s, -0.56, shimmer + 0.1, '#00f5ff', lw(0.95));
  drawChromeHorizonFacet(ctx, beakTopBase, beakMid, pouchStart, 6 * s, 12 * s, 4 * s, -0.05, shimmer + 0.35, '#ffffff', lw(1.05));
  drawChromeHorizonFacet(
    ctx,
    beakMid,
    beakTip,
    { x: beakTip.x - 2 * s, y: beakTip.y + 8 * s },
    12 * s, 3 * s, 4 * s,
    0.22,
    shimmer,
    '#ff2a9d',
    lw(1.0)
  );

  // --- 6B. Inner Electric-Cyan & Laser-White Dorsal Fresnel Rim Highlight! ---
  // Paired right inside the `#12062c` outer backlight border for unmistakable chrome edge pop!
  ctx.strokeStyle = '#00f5ff';
  ctx.lineWidth = lw(2.1);
  ctx.beginPath();
  ctx.moveTo(pTail.x, pTail.y);
  ctx.quadraticCurveTo(cTop.x, cTop.y, pChest.x, pChest.y);
  ctx.moveTo(nBack0.x, nBack0.y);
  ctx.bezierCurveTo(nBack1.x, nBack1.y, nBack2.x, nBack2.y, nBack3.x, nBack3.y);
  ctx.moveTo(hx - hr * 0.72, hy - hr * 0.68);
  ctx.arc(hx, hy, hr - 0.6 * s, -Math.PI * 0.78, -Math.PI * 0.15);
  ctx.moveTo(beakTopBase.x, beakTopBase.y + 0.6 * s);
  ctx.lineTo(beakTip.x, beakTip.y + 0.6 * s);
  ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = lw(0.95);
  ctx.stroke();

  // Synthwave Slotted Neon Cyber Visor Sunglasses
  ctx.fillStyle = '#0d0322';
  ctx.strokeStyle = '#ff2a9d';
  ctx.lineWidth = lw(2.1);
  ctx.beginPath();
  ctx.moveTo(hx - 3 * s, hy - 7 * s);
  ctx.lineTo(hx + 16 * s, hy - 6 * s);
  ctx.lineTo(hx + 13 * s, hy + 2 * s);
  ctx.lineTo(hx - 1 * s, hy + 1 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#00f5ff';
  ctx.lineWidth = lw(1.45);
  ctx.beginPath();
  ctx.moveTo(hx, hy - 3.5 * s);
  ctx.lineTo(hx + 14 * s, hy - 3 * s);
  ctx.moveTo(hx + 1 * s, hy - 1 * s);
  ctx.lineTo(hx + 12 * s, hy - 0.5 * s);
  ctx.stroke();

  // Foreground Leg
  drawChromeLeg(rig.rightHip, rig.rightKnee, rig.rightFoot, rig.rightPedal, false);

  // ---------------------------------------------------------------------------
  // 7. 4-Band Faceted Sky-Earth Liquid-Chrome Wing Feather Blades!
  // ---------------------------------------------------------------------------
  const wStart = rig.wingShoulder;
  const wTip = { x: rig.wingTip.x + 6 * s, y: rig.wingTip.y + 2 * s };
  const wEnd = { x: rig.wingShoulder.x + 14 * s, y: rig.wingShoulder.y + 2 * s };
  const wCtrlBot = { x: rig.wingElbow.x - 16 * s, y: rig.wingElbow.y + 20 * s };
  const wCtrlTop = { x: rig.wingElbow.x + 12 * s, y: rig.wingElbow.y - 8 * s };

  // Crisp `#12062c` wing drop-separation bevel over torso
  ctx.fillStyle = '#12062c';
  ctx.strokeStyle = '#12062c';
  ctx.lineWidth = lw(4.6);
  ctx.beginPath();
  ctx.moveTo(wEnd.x, wEnd.y);
  ctx.quadraticCurveTo(wCtrlTop.x, wCtrlTop.y, wTip.x, wTip.y);
  ctx.quadraticCurveTo(wCtrlBot.x, wCtrlBot.y, wStart.x, wStart.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const wingFeathers = 5;
  const wRows = [[], [], [], [], []];
  const wFracs = [0.0, 0.28, 0.48, 0.72, 1.0];
  const wDepths = [4, 15, 20, 13, 2];
  for (let i = 0; i <= wingFeathers; i++) {
    const u = i / wingFeathers;
    const tp = evalQuad(wEnd, wCtrlTop, wTip, u);
    const bp = evalQuad(wStart, wCtrlBot, wTip, u);
    const taper = 1 - u * 0.68;
    for (let rIdx = 0; rIdx < 5; rIdx++) {
      const vf = wFracs[rIdx];
      wRows[rIdx].push({
        x: lerp(tp.x, bp.x, vf),
        y: lerp(tp.y, bp.y, vf),
        z: wDepths[rIdx] * s * taper + 2 * s,
      });
    }
  }
  const wingBandRy = [-0.68, -0.05, 0.16, 0.48];
  const wingBandStroke = ['rgba(0, 245, 255, 0.62)', '#ffffff', 'rgba(24, 8, 62, 0.65)', 'rgba(255, 42, 157, 0.70)'];
  for (let i = 0; i < wingFeathers; i++) {
    for (let b = 0; b < 4; b++) {
      const p00 = wRows[b][i], p10 = wRows[b][i + 1];
      const p01 = wRows[b + 1][i], p11 = wRows[b + 1][i + 1];
      drawChromeHorizonFacet(ctx, p00, p10, p11, p00.z, p10.z, p11.z, wingBandRy[b] - 0.04, shimmer - 0.12 + i * 0.08, wingBandStroke[b], b === 1 ? lw(1.05) : lw(0.75));
      drawChromeHorizonFacet(ctx, p00, p11, p01, p00.z, p11.z, p01.z, wingBandRy[b] + 0.04, shimmer + 0.08 + i * 0.08, wingBandStroke[b], b === 1 ? lw(1.05) : lw(0.75));
    }
  }

  // Wing leading-edge electric-cyan Fresnel highlight
  ctx.strokeStyle = '#00f5ff';
  ctx.lineWidth = lw(1.6);
  ctx.beginPath();
  ctx.moveTo(wEnd.x, wEnd.y);
  ctx.quadraticCurveTo(wCtrlTop.x, wCtrlTop.y, wTip.x, wTip.y);
  ctx.stroke();

  // Specular 4-point raytracer star glints on chrome ridges!
  const glintPulse = 0.78 + 0.22 * Math.sin(localT * 9.5);
  drawStarSparkle(ctx, beakTip.x - 1 * s, beakTip.y, 12 * s * glintPulse, '#ffffff', 0.96);
  drawStarSparkle(ctx, wRows[2][1].x, wRows[2][1].y, 10.5 * s * glintPulse, '#00f5ff', 0.94);
  drawStarSparkle(ctx, rig.headTop.x, rig.headTop.y, 8.5 * s * glintPulse, '#ff2a9d', 0.90);

  // Pinpoint star-glint phosphor bloom ONLY (no foggy body circle so deep `#140b42` cobalt stays rich!)
  if (bctx) {
    bctx.fillStyle = 'rgba(0, 245, 255, 0.75)';
    bctx.beginPath();
    bctx.arc((beakTip.x - 1 * s) * 0.25, beakTip.y * 0.25, 2.2, 0, Math.PI * 2);
    bctx.arc(wRows[2][1].x * 0.25, wRows[2][1].y * 0.25, 2.0, 0, Math.PI * 2);
    bctx.fill();
  }

  ctx.restore();
}

// =============================================================================
// 5. ANALOG NTSC/VHS SIGNAL PIPELINE & NATIVE GLOWING VCR CAMCORDER OSD
// =============================================================================

/**
 * Composites Quarter-Resolution Phosphor Bloom, Rightward VHS Chroma Bleeding,
 * Eye-Safe Bar-2 VHS Tracking Snow Bands, Magnetic Tape Grain, and y = 986..1000 Head-Switching Noise!
 */
function applyAnalogVhsPipeline(ctx, gCanvas, bloomCanvas, bloomBlurCanvas, localT, tapeGlitch, makePRNG, hashSeed) {
  const { scratch, tint } = ensurePostCanvases();

  // 1. Composite Quarter-Res Additive Neon Phosphor Bloom onto Main Canvas!
  const bbCtx = bloomBlurCanvas.getContext('2d');
  bbCtx.clearRect(0, 0, 250, 250);
  try {
    bbCtx.filter = 'blur(5px)';
    bbCtx.drawImage(bloomCanvas, 0, 0);
    bbCtx.filter = 'none';
  } catch (_e) {
    bbCtx.drawImage(bloomCanvas, 0, 0);
  }

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.62;
  ctx.drawImage(bloomBlurCanvas, 0, 0, PANEL_SIZE, PANEL_SIZE);
  ctx.globalAlpha = 1.0;
  ctx.globalCompositeOperation = 'source-over';

  // Snapshot full scene for VHS chroma bleed & horizontal tracking tears
  const sctx = scratch.getContext('2d');
  sctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);
  sctx.drawImage(gCanvas, 0, 0);

  // 2. Authentic NTSC/VHS Rightward Chroma Bandwidth Smear (+7px Magenta & -3.5px Cyan)!
  const tctx = tint.getContext('2d');
  const smearPx = tapeGlitch > 0.05 ? 9.0 * tapeGlitch + 5.5 : 5.5;

  // Magenta rightward VHS color-under smear
  tctx.clearRect(0, 0, 250, 250);
  tctx.globalCompositeOperation = 'source-over';
  tctx.drawImage(scratch, 0, 0, 250, 250);
  tctx.globalCompositeOperation = 'multiply';
  tctx.fillStyle = '#ff2496';
  tctx.fillRect(0, 0, 250, 250);

  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = tapeGlitch > 0.05 ? 0.24 * tapeGlitch + 0.10 : 0.10;
  ctx.drawImage(tint, smearPx, 0.5, PANEL_SIZE, PANEL_SIZE);

  // Cyan leftward composite fringe
  tctx.clearRect(0, 0, 250, 250);
  tctx.globalCompositeOperation = 'source-over';
  tctx.drawImage(scratch, 0, 0, 250, 250);
  tctx.globalCompositeOperation = 'multiply';
  tctx.fillStyle = '#00f0ff';
  tctx.fillRect(0, 0, 250, 250);

  ctx.globalAlpha = tapeGlitch > 0.05 ? 0.22 * tapeGlitch + 0.08 : 0.08;
  ctx.drawImage(tint, -smearPx * 0.55, 0, PANEL_SIZE, PANEL_SIZE);

  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1.0;

  // 3. Bar-2 Eye-Safe VHS Tape-Tracking Snow & Horizontal Tear Bands!
  //    CRITICAL: Strictly confined to y ∈ [154..188] and y ∈ [622..728] — NEVER crossing
  //    the Marble Bust's face/eyes (y ≈ 238..490)!
  const rng = makePRNG(hashSeed(`vhs_r3_${Math.round(localT * 24)}`));

  if (tapeGlitch > 0.05) {
    const safeTearBands = [
      { y: Math.round(166 + Math.sin(localT * 9.0) * 10), h: 20, dx: Math.round(18 * tapeGlitch) },
      { y: Math.round(638 + Math.cos(localT * 8.2) * 14), h: 24, dx: Math.round(-22 * tapeGlitch) },
      { y: Math.round(706 + Math.sin(localT * 10.5 + 1.4) * 12), h: 18, dx: Math.round(15 * tapeGlitch) },
    ];

    for (const band of safeTearBands) {
      ctx.drawImage(scratch, 0, band.y, PANEL_SIZE, band.h, band.dx, band.y, PANEL_SIZE, band.h);

      ctx.fillStyle = `rgba(125, 249, 255, ${(0.42 * tapeGlitch).toFixed(2)})`;
      ctx.fillRect(0, band.y, PANEL_SIZE, 1.8);
      ctx.fillStyle = `rgba(255, 78, 220, ${(0.42 * tapeGlitch).toFixed(2)})`;
      ctx.fillRect(0, band.y + band.h - 1.8, PANEL_SIZE, 1.8);

      for (let s = 0; s < 32; s++) {
        const sx = rng() * PANEL_SIZE;
        const sy = band.y + rng() * band.h;
        const sw = 5 + rng() * 32;
        ctx.fillStyle = s % 3 === 0
          ? `rgba(125, 249, 255, ${(0.78 * tapeGlitch).toFixed(2)})`
          : s % 4 === 0
          ? `rgba(255, 94, 219, ${(0.76 * tapeGlitch).toFixed(2)})`
          : `rgba(255, 255, 255, ${(0.84 * tapeGlitch).toFixed(2)})`;
        ctx.fillRect(sx, sy, sw, rng() < 0.35 ? 2.2 : 1.4);
      }
    }
  }

  // 4. Subtle Analog Magnetic Tape Oxide Speckles & Fine CRT Scanlines
  for (let i = 0; i < 26; i++) {
    const gx = rng() * PANEL_SIZE;
    const gy = rng() * (PANEL_SIZE - 20);
    // Keep Bust face region clean of bright white dropouts too
    if (gx > 620 && gx < 835 && gy > 240 && gy < 430) continue;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.16)' : 'rgba(0, 240, 255, 0.14)';
    ctx.fillRect(gx, gy, 3 + rng() * 14, 1.2);
  }

  ctx.fillStyle = 'rgba(8, 2, 18, 0.14)';
  for (let y = 0; y < PANEL_SIZE - 14; y += 4) {
    ctx.fillRect(0, y, PANEL_SIZE, 1.4);
  }

  // 5. Iconic Bottom VHS Head-Switching Noise Bar along y = 986..1000!
  const hsY = 986;
  ctx.fillStyle = '#090214';
  ctx.fillRect(0, hsY, PANEL_SIZE, 14);
  for (let r = 0; r < 7; r++) {
    const ry = hsY + r * 2;
    const skew = Math.round(14 + Math.sin(localT * 28 + r * 1.9) * 18);
    ctx.drawImage(scratch, 0, ry - 6, PANEL_SIZE, 2, skew, ry, PANEL_SIZE, 2);

    // Jagged white/cyan/magenta head-switching sync spikes!
    for (let k = 0; k < 14; k++) {
      const nx = rng() * PANEL_SIZE;
      const nw = 10 + rng() * 58;
      ctx.fillStyle = k % 3 === 0
        ? 'rgba(255, 255, 255, 0.82)'
        : k % 3 === 1
        ? 'rgba(125, 249, 255, 0.72)'
        : 'rgba(255, 78, 218, 0.72)';
      ctx.fillRect(nx, ry, nw, 1.6);
    }
  }

  ctx.restore();
}

/**
 * Draws Native Glowing CRT Camcorder VCR On-Screen Display (OSD) Typography!
 * Replaces the modern dark-bordered AESTHETIC.EXE box with 100% authentic VHS OSD characters
 * burned directly into the upper-left & lower-right video signal (with chroma fringe & scanlines!).
 */
function drawNativeVcrCamcorderOsd(ctx, scene, localT, tapeGlitch) {
  ctx.save();

  const drawOsdText = (str, x, y, font, mainColor, align = 'left') => {
    ctx.font = font;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';

    // Composite NTSC dark right-drop shadow
    ctx.fillStyle = 'rgba(6, 1, 16, 0.88)';
    ctx.fillText(str, x + 3, y + 3);
    ctx.fillText(str, x + 2, y + 1);

    // SubtleVHS magenta rightward & cyan leftward analog chroma bleed on OSD characters!
    ctx.fillStyle = 'rgba(255, 62, 208, 0.52)';
    ctx.fillText(str, x + 2.4, y);
    ctx.fillStyle = 'rgba(0, 245, 255, 0.48)';
    ctx.fillText(str, x - 1.6, y);

    // Glowing phosphor OSD core
    ctx.shadowColor = mainColor;
    ctx.shadowBlur = 8;
    ctx.fillStyle = mainColor;
    ctx.fillText(str, x, y);
    ctx.shadowBlur = 0;
  };

  const x0 = 42;
  const y0 = 32;
  const blinkOn = Math.floor(localT * 2.5) % 2 === 0;
  const modeStr = tapeGlitch > 0.05
    ? 'CUE >>   18 · 2010s'
    : `PLAY ${blinkOn ? '▶' : '▷'}   18 · ${scene.era}`;

  // Line 1: Classic VCR phosphor green transport status + sequence/era!
  drawOsdText(modeStr, x0, y0, '700 22px "PelicanMono", monospace', '#6bff95', 'left');

  // Line 2: Era Title in crisp glowing CRT white + spaced Vaporwave subtitle!
  drawOsdText(
    `${scene.zh}   V A P O R W A V E`,
    x0,
    y0 + 34,
    '700 28px "PelicanSans", sans-serif',
    '#f8fff9',
    'left'
  );

  // Line 3: Subtle cassette tape spec line
  drawOsdText(
    'HI-FI STEREO  ·  SUNSET GRID',
    x0 + 2,
    y0 + 72,
    '700 14px "PelicanMono", monospace',
    '#9efcff',
    'left'
  );

  // Bottom-right VCR Tape Counter OSD (safely above y = 986 head-switching noise!)
  const totalSec = 107 + Math.floor(localT);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  const ff = String(Math.floor((localT % 1) * 30)).padStart(2, '0');
  drawOsdText(
    `SLP   01:${mm}:${ss}:${ff}`,
    958,
    948,
    '700 18px "PelicanMono", monospace',
    '#f6fff8',
    'right'
  );

  // Fine horizontal CRT scanline pass over OSD so it sits INSIDE the television glass!
  ctx.fillStyle = 'rgba(8, 2, 18, 0.22)';
  for (let sy = y0 - 2; sy < y0 + 96; sy += 4) {
    ctx.fillRect(x0 - 6, sy, 490, 1.4);
  }

  ctx.restore();
}

export function render(kit, slot, scene, params) {
  const {
    localT,
    pelicanLocalX,
    pedalAngle,
    speedScale,
    isOutroThumbnail = false,
  } = params;

  const g = slot.g2d;
  const ctx = g.drawingContext;
  const { bloom, bloomBlur } = ensurePostCanvases();
  const bctx = bloom.getContext('2d');

  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);
  bctx.clearRect(0, 0, 250, 250);

  // ---------------------------------------------------------------------------
  // 0. Viscous 0.79x Slowed-Cassette Fluidity + Bar-2 4x Tape-Loop Stutter!
  //    During [2.0..3.55s], background grid/crystal/palms stutter-loop on half-beats
  //    while the liquid-chrome pelican glides smoothly forward!
  // ---------------------------------------------------------------------------
  let vaporEnvT = localT * 0.79;
  let tapeGlitch = 0;
  if (!isOutroThumbnail && localT >= 2.0 && localT < 3.56) {
    vaporEnvT = 2.0 * 0.79 + ((localT - 2.0) % 0.25) * 0.79;
    tapeGlitch = smoothstep(2.0, 2.16, localT) * (1 - smoothstep(3.36, 3.56, localT));
  } else if (isOutroThumbnail) {
    tapeGlitch = 0.52;
  }

  // ---------------------------------------------------------------------------
  // 1. Static Baked Sunset Sky, Sliced Neon Disc & Phosphor-Bloomed Mountains
  // ---------------------------------------------------------------------------
  const bg = getVaporBackdrop(kit);
  const bustAtlas = getBakedMarbleBustAtlas(kit);
  const ionicPedestal = getBakedIonicPedestal(kit);
  ctx.drawImage(bg.canvas, 0, 0);

  // Seed sunset glow into quarter-res bloom buffer
  bctx.fillStyle = 'rgba(255, 78, 200, 0.28)';
  bctx.beginPath();
  bctx.arc(500 * 0.25, 352 * 0.25, 44, 0, Math.PI * 2);
  bctx.fill();

  // ---------------------------------------------------------------------------
  // 2. Floating 30-Faced Rhombic Triacontahedron Crystals (0.79x viscous spin!)
  // ---------------------------------------------------------------------------
  drawRotatingTriacontahedron(ctx, bctx, 276, 228, 52, vaporEnvT, 0.25);
  drawRotatingTriacontahedron(ctx, bctx, 888, 92, 29, vaporEnvT, 1.9);

  // ---------------------------------------------------------------------------
  // 3. Infinite Scrolling Synth Grid & Wet Veined Marble Checkerboard Causeway
  // ---------------------------------------------------------------------------
  drawSynthGridAndCheckerCorridor(ctx, bctx, vaporEnvT);

  // ---------------------------------------------------------------------------
  // 4. Low-Poly Palms & Per-Pixel 3D Normal-Mapped Classical Marble Bust!
  // ---------------------------------------------------------------------------
  drawLowPolyPalm(ctx, bctx, 106, 650, 1, 1.02, vaporEnvT);
  drawLowPolyPalm(ctx, bctx, 928, 646, -1, 0.86, vaporEnvT + 1.1);

  drawBakedClassicalMarbleBust(ctx, bctx, bustAtlas, ionicPedestal, 728, 652, pelicanLocalX, localT);

  drawRetroAestheticWindows(ctx, localT, pelicanLocalX, tapeGlitch);

  // ---------------------------------------------------------------------------
  // 5. 1995 Bryce/POV-Ray Faceted Liquid-Chrome Pelican, Laser Wheels & Reflections!
  // ---------------------------------------------------------------------------
  if (pelicanLocalX > -260 && pelicanLocalX < PANEL_SIZE + 260) {
    const rig = computePelicanRig({
      x: pelicanLocalX,
      y: ROAD_EDGE_Y,
      pedalAngle,
      scale: 1.0,
      slope: 0,
      speedScale,
      time: localT,
    });
    drawRaytracedChromePelican(ctx, bctx, rig, localT);
  }

  // ---------------------------------------------------------------------------
  // 6. Analog VHS Pipeline: Phosphor Bloom, Chroma Smear, Eye-Safe Tears & Head-Switch!
  // ---------------------------------------------------------------------------
  applyAnalogVhsPipeline(
    ctx,
    g.canvas,
    bloom,
    bloomBlur,
    localT,
    tapeGlitch,
    kit.makePRNG,
    kit.hashSeed
  );

  // ---------------------------------------------------------------------------
  // 7. Native Glowing CRT Camcorder VCR OSD (or Outro Gallery Thumbnail Strip)
  // ---------------------------------------------------------------------------
  if (!isOutroThumbnail) {
    drawNativeVcrCamcorderOsd(ctx, scene, localT, tapeGlitch);
  } else {
    ctx.fillStyle = 'rgba(15, 10, 26, 0.82)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.fillStyle = '#fff0fc';
    ctx.font = '700 48px "PelicanSerif", serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} ${scene.zh}`, 36, PANEL_SIZE - 48);
  }

  ctx.restore();
}
