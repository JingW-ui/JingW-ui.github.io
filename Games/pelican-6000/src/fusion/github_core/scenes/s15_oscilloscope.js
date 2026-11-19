// src/scenes/s15_oscilloscope.js
// #15 示波器矢量图 (1950s Cold-War Lab CRT Vector Oscilloscope — PELISCOPE MODEL 54-A)
// r3 Museum/Hardware-Authentic Upgrade:
// - Riveted Etched-Brass & Black-Enamel Manufacturer Nameplate on top-left chassis (NO floating UI card)
// - Cellular baked military hammertone enamel + 19" rack-mount slots & steel/brass rack-rash wear
// - Edge-lit Lucite engraved graticule with warm tungsten side-bleed & 1.8px glass parallax shadow
// - Perspective-curved twin-tube lab ceiling fluorescent reflection on spherical CRT dome (NO ellipse primitive)
// - Darkroom silver-halide volumetric technician hand with soft P1 subsurface green glow & twill lab cuff (NO SVG arrow/outlines)
// - Single-beam continuous CH1/CH2 closed-loop oscillogram: ±4.2% standing-wave wheels, AM carrier gular pouch,
//   5% unblanked flyback retrace, I ∝ 1/||v_beam|| velocity-inverse brightness/width, 250x250 dual-Gaussian halation,
//   6-step exponential P1 persistence, and 2nd-order underdamped PLL lock-in bounce at localT = 3.0s.

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  BEAT_SEC,
  clamp,
  lerp,
  smoothstep,
} from '../beat/timeline.js';
import { computePelicanRig } from '../rig/pelican.js';

const CRT_CX = 500;
const CRT_CY = 492;
const CRT_R = 416;

// Knob coordinates on the 1950s front panel
const KNOB_INTENSITY = { x: 84, y: 836, r: 30, label: 'INTENSITY' };
const KNOB_Y_PHASE = { x: 186, y: 898, r: 30, label: 'Y-PHASE' };
const KNOB_X_GAIN = { x: 804, y: 904, r: 29, label: 'X-GAIN' };
const KNOB_XY_FREQ = { x: 896, y: 830, r: 39, label: 'X-Y FREQ' };

// Reusable 250x250 low-res P1 glass halation offscreen canvas (< 1.2ms per frame)
let halationCanvas = null;
let halationCtx = null;

function ensureHalationBuffer() {
  if (!halationCanvas && typeof document !== 'undefined') {
    halationCanvas = document.createElement('canvas');
    halationCanvas.width = 250;
    halationCanvas.height = 250;
    halationCtx = halationCanvas.getContext('2d');
  }
}

/**
 * Deterministic fast hash -> [-1, 1] for analog electron-beam deflection noise.
 */
function analogNoise(a, b) {
  const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453123;
  return (s - Math.floor(s)) * 2 - 1;
}

/**
 * Computes the Lissajous distortion envelope, 2nd-order underdamped PLL lock-in ring,
 * and knob/hand kinematics for Bar 2 (`localT 2.0s..3.0s`).
 */
function getGagState(localT, isOutroThumbnail) {
  if (isOutroThumbnail) {
    return {
      mix: 0,
      pllRing: 0,
      knobAngle: -0.88,
      handReach: 0,
      snapRing: 0,
      panicShake: 0,
    };
  }

  const twistIn = smoothstep(1.92, 2.15, localT);
  const snapBack = smoothstep(2.91, 2.995, localT);
  const baseMix = clamp(twistIn * (1 - snapBack), 0, 1);

  // Second-order underdamped PLL phase-lock oscillation right after localT = 3.00s!
  let pllRing = 0;
  if (localT >= 2.995 && localT < 3.48) {
    const dt = localT - 2.995;
    pllRing = Math.exp(-dt * 9.5) * Math.cos(dt * 46.0);
  }

  const knobAngle = lerp(-0.88, 1.02, baseMix) - pllRing * 0.09;

  // Lab technician's hand reaches in at 1.78s, twists knob to 3:4, snaps back at 2.95..3.02s, withdraws by 3.36s
  const handIn = smoothstep(1.78, 1.98, localT);
  const handOut = 1 - smoothstep(3.06, 3.36, localT);
  const handReach = clamp(handIn * handOut, 0, 1);

  const snapRing =
    localT >= 2.99 && localT < 3.44 ? (localT - 2.99) / 0.45 : 0;

  const panicShake =
    localT >= 2.82 && localT < 3.04 ? Math.sin(localT * 145) * 1.0 : 0;

  return { mix: baseMix, pllRing, knobAngle, handReach, snapRing, panicShake };
}

/**
 * Bakes the static 1950s Cold-War military olive-gray hammertone chassis,
 * rack-mount slots with steel/brass rack-rash scratches, riveted etched-brass
 * `NO.15 · 示波器矢量图 · 1950s` manufacturer nameplate, and edge-lit Lucite CRT graticule.
 */
function getBakedOscilloscopeChassis(kit, scene) {
  return kit.bake2D('s15_oscilloscope_chassis_r3', (g, ctx, rng) => {
    ctx.save();

    // 1. Base military olive-charcoal hammertone enamel plate
    const baseGrad = ctx.createLinearGradient(0, 0, PANEL_SIZE, PANEL_SIZE);
    baseGrad.addColorStop(0, '#38433d');
    baseGrad.addColorStop(0.48, '#29322d');
    baseGrad.addColorStop(1, '#1b221e');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, PANEL_SIZE, PANEL_SIZE);

    // Dense authentic 1950s cellular hammertone baked enamel dimple network
    for (let i = 0; i < 5200; i++) {
      const hx = rng() * PANEL_SIZE;
      const hy = rng() * PANEL_SIZE;
      if (Math.hypot(hx - CRT_CX, hy - CRT_CY) < CRT_R - 8) continue;
      const hr = 1.8 + rng() * 4.8;
      // Top-left specular ridge + bottom-right dimple pit
      ctx.strokeStyle = `rgba(116, 136, 124, ${(0.08 + rng() * 0.11).toFixed(3)})`;
      ctx.lineWidth = 0.95;
      ctx.beginPath();
      ctx.arc(hx, hy, hr, Math.PI * 0.85, Math.PI * 1.85);
      ctx.stroke();

      ctx.strokeStyle = `rgba(10, 14, 12, ${(0.14 + rng() * 0.16).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(hx, hy, hr, -Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();

      ctx.fillStyle = `rgba(68, 84, 75, ${(0.06 + rng() * 0.08).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(hx - hr * 0.2, hy - hr * 0.2, hr * 0.52, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fine metallic paint grain & subtle oil/finger smudges near lower control deck
    for (let i = 0; i < 2400; i++) {
      const gx = rng() * PANEL_SIZE;
      const gy = rng() * PANEL_SIZE;
      if (Math.hypot(gx - CRT_CX, gy - CRT_CY) < CRT_R - 4) continue;
      ctx.fillStyle =
        rng() > 0.5
          ? `rgba(195, 212, 200, ${(0.015 + rng() * 0.03).toFixed(3)})`
          : `rgba(8, 11, 9, ${(0.03 + rng() * 0.05).toFixed(3)})`;
      ctx.fillRect(gx, gy, 1.5, 1.5);
    }

    // Outer recessed steel rack-ear seam
    ctx.strokeStyle = 'rgba(10, 13, 11, 0.78)';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, PANEL_SIZE - 20, PANEL_SIZE - 20);
    ctx.strokeStyle = 'rgba(142, 162, 148, 0.22)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(13, 13, PANEL_SIZE - 26, PANEL_SIZE - 26);

    // 19-Inch Laboratory Rack-Mount Notches + Authentic "Rack-Rash" Paint Chipping (exposing brass/steel!)
    const drawRackSlotAndWear = (sx, sy, isLeft) => {
      // Scuffed bare steel & brass primer rings from decades of rack mounting bolts
      for (let s = 0; s < 14; s++) {
        const ox = sx + (rng() - 0.5) * 18;
        const oy = sy + (rng() - 0.5) * 24;
        const len = 3 + rng() * 9;
        const ang = (rng() - 0.5) * 1.4;
        ctx.strokeStyle =
          s % 3 === 0
            ? `rgba(188, 156, 92, ${(0.28 + rng() * 0.32).toFixed(3)})` // brass undercoat
            : `rgba(182, 194, 186, ${(0.25 + rng() * 0.35).toFixed(3)})`; // bare cold-rolled steel
        ctx.lineWidth = 0.8 + rng() * 1.3;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox + Math.cos(ang) * len, oy + Math.sin(ang) * len);
        ctx.stroke();
      }
      // Dark punched rack oval cutout
      ctx.fillStyle = '#0c100e';
      ctx.strokeStyle = 'rgba(175, 188, 180, 0.48)';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.roundRect(isLeft ? 0 : PANEL_SIZE - 20, sy - 7, 20, 14, 6);
      ctx.fill();
      ctx.stroke();
    };
    for (const ry of [196, 492, 804]) {
      drawRackSlotAndWear(14, ry, true);
      drawRackSlotAndWear(PANEL_SIZE - 14, ry, false);
    }

    // Subtle edge paint wear scratches along chassis corners
    for (let c = 0; c < 42; c++) {
      const edge = c % 4;
      const ex =
        edge === 0 ? 12 + rng() * 90 : edge === 1 ? PANEL_SIZE - 12 - rng() * 90 : rng() * PANEL_SIZE;
      const ey =
        edge === 2 ? 12 + rng() * 50 : edge === 3 ? PANEL_SIZE - 12 - rng() * 50 : rng() * PANEL_SIZE;
      if (Math.hypot(ex - CRT_CX, ey - CRT_CY) < CRT_R + 42) continue;
      const ang = rng() * Math.PI * 2;
      const len = 4 + rng() * 14;
      ctx.strokeStyle =
        c % 2 === 0 ? 'rgba(186, 154, 90, 0.24)' : 'rgba(178, 192, 184, 0.22)';
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex + Math.cos(ang) * len, ey + Math.sin(ang) * len);
      ctx.stroke();
    }

    // Top & bottom stamped cooling louver vents
    for (let k = 0; k < 9; k++) {
      const vx = 382 + k * 28;
      ctx.fillStyle = '#0f1411';
      ctx.fillRect(vx, 19, 18, 7);
      ctx.fillRect(vx, 972, 18, 7);
      ctx.fillStyle = 'rgba(155, 175, 162, 0.26)';
      ctx.fillRect(vx, 26, 18, 1.4);
      ctx.fillRect(vx, 979, 18, 1.4);
    }

    // 2. Brushed Anodized Aluminum Sub-Panels in all 4 instrument corners
    const drawBrushedPlate = (px, py, pw, ph) => {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, 8);
      ctx.clip();

      const alGrad = ctx.createLinearGradient(px, py, px, py + ph);
      alGrad.addColorStop(0, '#46514b');
      alGrad.addColorStop(0.5, '#36403b');
      alGrad.addColorStop(1, '#28302c');
      ctx.fillStyle = alGrad;
      ctx.fillRect(px, py, pw, ph);

      for (let y = py; y < py + ph; y += 1.5) {
        ctx.fillStyle =
          rng() > 0.5
            ? `rgba(215, 228, 220, ${(0.02 + rng() * 0.055).toFixed(3)})`
            : `rgba(12, 16, 14, ${(0.035 + rng() * 0.065).toFixed(3)})`;
        ctx.fillRect(px, y, pw, 1);
      }
      ctx.restore();

      ctx.strokeStyle = '#141916';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, 8);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(186, 204, 192, 0.26)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(px + 2, py + 2, pw - 4, ph - 4, 6);
      ctx.stroke();
    };

    // Top-left manufacturer nameplate subplate (drawn BEFORE bezel so inner corner tucks naturally under CRT hood!)
    drawBrushedPlate(22, 24, 252, 196);
    // Top-right meter & pilot-lamp subplate
    drawBrushedPlate(726, 24, 252, 206);
    // Bottom-left intensity / phase control subplate
    drawBrushedPlate(22, 754, 250, 222);
    // Bottom-right X-gain / X-Y freq control subplate
    drawBrushedPlate(728, 754, 250, 222);

    // Helper for slotted metallic dome rivets / brass screws
    const drawRivet = (rx, ry, r = 11, angle = 0.5, isBrass = false) => {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.beginPath();
      ctx.arc(rx + 1.8, ry + 2.6, r, 0, Math.PI * 2);
      ctx.fill();

      const rg = ctx.createRadialGradient(
        rx - r * 0.35,
        ry - r * 0.35,
        r * 0.1,
        rx,
        ry,
        r
      );
      if (isBrass) {
        rg.addColorStop(0, '#f3dfa2');
        rg.addColorStop(0.52, '#b59246');
        rg.addColorStop(1, '#4c3a16');
      } else {
        rg.addColorStop(0, '#cedad2');
        rg.addColorStop(0.55, '#6c7971');
        rg.addColorStop(1, '#28302b');
      }
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(rx, ry, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = isBrass ? '#2c200a' : '#161b18';
      ctx.lineWidth = Math.max(1.3, r * 0.22);
      ctx.beginPath();
      ctx.moveTo(rx - Math.cos(angle) * r * 0.68, ry - Math.sin(angle) * r * 0.68);
      ctx.lineTo(rx + Math.cos(angle) * r * 0.68, ry + Math.sin(angle) * r * 0.68);
      ctx.stroke();
      ctx.restore();
    };

    // 3. Native Riveted Etched-Brass & Chemical-Blackened Enamel Manufacturer Plate!
    // Positioned at (30, 32, 200, 86) -> bottom-right (230, 118) is at r = 461.3 > bezel 460 (100% UNCLIPPED!)
    {
      const npx = 28;
      const npy = 30;
      const npw = 202;
      const nph = 86;

      ctx.save();
      // Drop shadow onto subplate
      ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
      ctx.fillRect(npx + 2, npy + 3, npw, nph);

      // Outer raised tarnished brass plate base
      const brassG = ctx.createLinearGradient(npx, npy, npx + npw, npy + nph);
      brassG.addColorStop(0, '#d8bd78');
      brassG.addColorStop(0.38, '#b59449');
      brassG.addColorStop(0.72, '#8b6d2f');
      brassG.addColorStop(1, '#bfa05a');
      ctx.fillStyle = brassG;
      ctx.fillRect(npx, npy, npw, nph);

      // Inner acid-etched black bake-enamel recessed field
      ctx.fillStyle = '#121513';
      ctx.fillRect(npx + 4, npy + 4, npw - 8, nph - 8);

      // Brass inner hairline border & divider rules
      ctx.strokeStyle = 'rgba(216, 189, 120, 0.72)';
      ctx.lineWidth = 1.1;
      ctx.strokeRect(npx + 6.5, npy + 6.5, npw - 13, nph - 13);
      ctx.beginPath();
      ctx.moveTo(npx + 10, npy + 25);
      ctx.lineTo(npx + npw - 10, npy + 25);
      ctx.moveTo(npx + 10, npy + 63);
      ctx.lineTo(npx + npw - 10, npy + 63);
      ctx.stroke();

      // Brushed brass micro-scratches & patina across plate
      for (let s = 0; s < 90; s++) {
        const sx = npx + 5 + rng() * (npw - 10);
        const sy = npy + 5 + rng() * (nph - 10);
        ctx.fillStyle =
          rng() > 0.5
            ? 'rgba(235, 210, 145, 0.06)'
            : 'rgba(0, 0, 0, 0.18)';
        ctx.fillRect(sx, sy, 6 + rng() * 18, 0.8);
      }

      // Line 1: Raised brass micro-lettering
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#dfca92';
      ctx.font = '700 9.5px "PelicanMono", monospace';
      ctx.fillText('PELISCOPE INSTRUMENT CORP.', npx + npw / 2, npy + 16);

      // Line 2: Primary Stamped Era & Chinese Title (`NO.15 · 示波器矢量图`)
      const numStr = String(scene?.num ?? 15).padStart(2, '0');
      const zhStr = scene?.zh || '示波器矢量图';
      ctx.fillStyle = '#f5ecd2';
      ctx.font = '700 18.5px "PelicanMono", "PelicanSans", sans-serif';
      ctx.fillText(`NO.${numStr} · ${zhStr}`, npx + npw / 2, npy + 44);

      // Line 3: Stamped Serial & 1950s Era Spec (`MODEL 54-A · 1950s CRT`)
      ctx.fillStyle = '#d4b872';
      ctx.font = '700 10.5px "PelicanMono", monospace';
      ctx.fillText(`MODEL 54-A · ${scene?.era || '1950s'} X-Y`, npx + npw / 2, npy + 73);

      // 4 Slotted Brass Corner Rivets securing the nameplate
      drawRivet(npx + 9, npy + 9, 3.6, 0.4, true);
      drawRivet(npx + npw - 9, npy + 9, 3.6, -0.6, true);
      drawRivet(npx + 9, npy + nph - 9, 3.6, 1.1, true);
      drawRivet(npx + npw - 9, npy + nph - 9, 3.6, -0.2, true);
      ctx.restore();
    }

    // Engraved calibration spec tag below top-left nameplate (outside bezel at x=34, y=128)
    ctx.save();
    ctx.fillStyle = 'rgba(206, 220, 210, 0.62)';
    ctx.font = '700 9.5px "PelicanMono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('PHOSPHOR: P1 Zn2SiO4:Mn', 32, 134);
    ctx.fillText('ANODE HV: 4.2 kV DC', 32, 148);
    ctx.restore();

    // Small specification plaque on top-right subplate
    ctx.fillStyle = '#141917';
    ctx.strokeStyle = '#8fa096';
    ctx.lineWidth = 1.3;
    ctx.fillRect(742, 36, 148, 38);
    ctx.strokeRect(742, 36, 148, 38);
    ctx.fillStyle = '#d7e2da';
    ctx.font = '700 11px "PelicanMono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DEFLECTION TELEMETRY', 816, 49);
    ctx.fillStyle = '#8adba4';
    ctx.font = '600 9.5px "PelicanMono", monospace';
    ctx.fillText('CH1-X / CH2-Y HARMONIC', 816, 64);

    // Four heavy corner slotted dome chassis bolts + subplate screws
    drawRivet(30, 968, 11.5, 1.1);
    drawRivet(970, 32, 11.5, -0.5);
    drawRivet(970, 968, 11.5, -0.2);

    const smallScrews = [
      [36, 206], [260, 38],
      [740, 216], [964, 216],
      [38, 768], [258, 962],
      [742, 962], [964, 768],
    ];
    smallScrews.forEach(([sx, sy], idx) => drawRivet(sx, sy, 5.2, idx * 0.7));

    // Toggle switches on bottom-left subplate
    const drawToggle = (tx, ty, lbl, up = true) => {
      ctx.fillStyle = '#181e1b';
      ctx.beginPath();
      ctx.arc(tx, ty, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#9aa8a0';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(tx, ty, 8, 0, Math.PI * 2);
      ctx.stroke();

      // Machined chrome bat-handle toggle
      const batG = ctx.createLinearGradient(tx - 4, ty - 16, tx + 4, ty + 4);
      batG.addColorStop(0, '#f2f7f4');
      batG.addColorStop(0.5, '#9aa8a0');
      batG.addColorStop(1, '#3b443f');
      ctx.strokeStyle = batG;
      ctx.lineWidth = 5.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + (up ? 2 : -2), ty + (up ? -15 : 15));
      ctx.stroke();

      ctx.fillStyle = '#cfdbd3';
      ctx.font = '700 10px "PelicanMono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(lbl, tx, ty + 24);
    };
    drawToggle(68, 936, 'POWER', true);
    drawToggle(124, 936, 'HV SYNC', true);

    // 4. Horizontal HV Cathode Coupling Waveguide Windows at y = 680 (left & right edges)
    const drawSideWaveguide = (x0, x1) => {
      const wy = ROAD_EDGE_Y - 26;
      const wh = 52;
      ctx.fillStyle = '#131916';
      ctx.strokeStyle = '#58675e';
      ctx.lineWidth = 2.4;
      ctx.fillRect(x0, wy, x1 - x0, wh);
      ctx.strokeRect(x0, wy, x1 - x0, wh);

      const wg = ctx.createLinearGradient(0, wy, 0, wy + wh);
      wg.addColorStop(0, '#020704');
      wg.addColorStop(0.5, '#071b0e');
      wg.addColorStop(1, '#020704');
      ctx.fillStyle = wg;
      ctx.fillRect(x0, wy + 6, x1 - x0, wh - 12);

      // Copper deflection coil windings along slot
      for (let cx = x0 + 9; cx < x1 - 6; cx += 13) {
        ctx.strokeStyle = 'rgba(198, 138, 76, 0.48)';
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.moveTo(cx, wy + 6);
        ctx.lineTo(cx, wy + 13);
        ctx.moveTo(cx, wy + wh - 13);
        ctx.lineTo(cx, wy + wh - 6);
        ctx.stroke();
      }
    };
    drawSideWaveguide(0, 128);
    drawSideWaveguide(872, PANEL_SIZE);

    // 5. Heavy Stepped Cast-Aluminum Circular CRT Bezel Hood
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
    ctx.beginPath();
    ctx.arc(CRT_CX + 6, CRT_CY + 10, CRT_R + 46, 0, Math.PI * 2);
    ctx.fill();

    const bezelGrad = ctx.createLinearGradient(
      CRT_CX - CRT_R,
      CRT_CY - CRT_R,
      CRT_CX + CRT_R,
      CRT_CY + CRT_R
    );
    bezelGrad.addColorStop(0, '#5c6962');
    bezelGrad.addColorStop(0.32, '#343d38');
    bezelGrad.addColorStop(0.74, '#1a201d');
    bezelGrad.addColorStop(1, '#445049');
    ctx.fillStyle = bezelGrad;
    ctx.beginPath();
    ctx.arc(CRT_CX, CRT_CY, CRT_R + 44, 0, Math.PI * 2);
    ctx.fill();

    // Machined lathe concentric micro-grooves on cast bezel hood
    for (let rStep = CRT_R + 16; rStep <= CRT_R + 42; rStep += 3.5) {
      ctx.strokeStyle =
        rStep % 7 < 3.5 ? 'rgba(210, 226, 216, 0.07)' : 'rgba(8, 12, 10, 0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(CRT_CX, CRT_CY, rStep, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Inner dark vulcanized rubber CRT cushion gasket
    ctx.fillStyle = '#0e1311';
    ctx.beginPath();
    ctx.arc(CRT_CX, CRT_CY, CRT_R + 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(208, 224, 214, 0.34)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(CRT_CX, CRT_CY, CRT_R + 42, -Math.PI * 0.88, -Math.PI * 0.12);
    ctx.stroke();

    ctx.strokeStyle = '#0a0e0c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(CRT_CX, CRT_CY, CRT_R + 44, 0, Math.PI * 2);
    ctx.stroke();

    // 8 Bezel flange bolts around perimeter
    for (let i = 0; i < 8; i++) {
      const ba = (i * Math.PI) / 4 + Math.PI / 8;
      const bx = CRT_CX + Math.cos(ba) * (CRT_R + 29);
      const by = CRT_CY + Math.sin(ba) * (CRT_R + 29);
      drawRivet(bx, by, 6.4, ba);
    }
    ctx.restore();

    // 6. Deep Spherical P1 Phosphor Coat + Edge-Lit Engraved Lucite Graticule (with 1.8px Parallax!)
    ctx.save();
    ctx.beginPath();
    ctx.arc(CRT_CX, CRT_CY, CRT_R, 0, Math.PI * 2);
    ctx.clip();

    const crtGrad = ctx.createRadialGradient(
      CRT_CX - 32,
      CRT_CY - 38,
      20,
      CRT_CX,
      CRT_CY,
      CRT_R
    );
    crtGrad.addColorStop(0, '#0d2515');
    crtGrad.addColorStop(0.56, '#06150b');
    crtGrad.addColorStop(0.86, '#030a05');
    crtGrad.addColorStop(1, '#010402');
    ctx.fillStyle = crtGrad;
    ctx.fillRect(CRT_CX - CRT_R, CRT_CY - CRT_R, CRT_R * 2, CRT_R * 2);

    // Authentic settled P1 zinc-silicate phosphor micro-crystalline coat texture
    for (let i = 0; i < 3600; i++) {
      const gx = CRT_CX + (rng() * 2 - 1) * CRT_R;
      const gy = CRT_CY + (rng() * 2 - 1) * CRT_R;
      ctx.fillStyle =
        rng() > 0.35
          ? `rgba(58, 245, 118, ${(0.012 + rng() * 0.026).toFixed(3)})`
          : `rgba(0, 0, 0, ${(0.08 + rng() * 0.14).toFixed(3)})`;
      ctx.fillRect(gx, gy, 1.5, 1.5);
    }

    // Warm 6.3V Tungsten Edge-Lit Lucite Side Illumination Glow (left & right bezel edges!)
    for (const side of [-1, 1]) {
      const lx = CRT_CX + side * (CRT_R - 4);
      const edgeGlow = ctx.createRadialGradient(lx, CRT_CY, 8, lx, CRT_CY, 155);
      edgeGlow.addColorStop(0, 'rgba(255, 196, 118, 0.18)');
      edgeGlow.addColorStop(0.45, 'rgba(210, 175, 102, 0.06)');
      edgeGlow.addColorStop(1, 'rgba(180, 160, 90, 0)');
      ctx.fillStyle = edgeGlow;
      ctx.fillRect(CRT_CX - CRT_R, CRT_CY - CRT_R, CRT_R * 2, CRT_R * 2);
    }

    // Helper to stroke the entire precision orthogonal graticule (called twice: 1st for 1.8px deep phosphor shadow, 2nd for etched Lucite!)
    const div = 76;
    const sub = div / 5;
    const strokeGraticulePass = (dx, dy, majorCol, axisCol, refCol) => {
      ctx.save();
      ctx.translate(dx, dy);

      // Major 10x10 grid rulings
      ctx.strokeStyle = majorCol;
      ctx.lineWidth = 1.05;
      ctx.beginPath();
      for (let k = -5; k <= 5; k++) {
        if (k === 0) continue;
        const gx = CRT_CX + k * div;
        const gy = CRT_CY + k * div;
        ctx.moveTo(gx, CRT_CY - CRT_R);
        ctx.lineTo(gx, CRT_CY + CRT_R);
        ctx.moveTo(CRT_CX - CRT_R, gy);
        ctx.lineTo(CRT_CX + CRT_R, gy);
      }
      ctx.stroke();

      // Central calibrated axes + 5-subdivision vernier ticks
      ctx.strokeStyle = axisCol;
      ctx.lineWidth = 1.55;
      ctx.beginPath();
      ctx.moveTo(CRT_CX - CRT_R, CRT_CY);
      ctx.lineTo(CRT_CX + CRT_R, CRT_CY);
      ctx.moveTo(CRT_CX, CRT_CY - CRT_R);
      ctx.lineTo(CRT_CX, CRT_CY + CRT_R);
      ctx.stroke();

      ctx.lineWidth = 1.15;
      ctx.beginPath();
      for (let s = -27; s <= 27; s++) {
        const tickLen = s % 5 === 0 ? 8.5 : 4.2;
        const px = CRT_CX + s * sub;
        const py = CRT_CY + s * sub;
        ctx.moveTo(px, CRT_CY - tickLen);
        ctx.lineTo(px, CRT_CY + tickLen);
        ctx.moveTo(CRT_CX - tickLen, py);
        ctx.lineTo(CRT_CX + tickLen, py);
      }
      ctx.stroke();

      // Engraved micro-tick baseline calibration ruling along y = 680 (NO setLineDash!)
      ctx.strokeStyle = refCol;
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      for (let rx = CRT_CX - CRT_R + 6; rx < CRT_CX + CRT_R - 6; rx += 12) {
        ctx.moveTo(rx, ROAD_EDGE_Y);
        ctx.lineTo(rx + 6.5, ROAD_EDGE_Y);
        ctx.moveTo(rx + 3.2, ROAD_EDGE_Y - 2.5);
        ctx.lineTo(rx + 3.2, ROAD_EDGE_Y + 2.5);
      }
      ctx.stroke();

      ctx.restore();
    };

    // Pass 1: 1.8px Refraction Parallax Shadow cast onto deep P1 phosphor layer
    strokeGraticulePass(
      1.8,
      2.1,
      'rgba(0, 8, 3, 0.52)',
      'rgba(0, 12, 4, 0.68)',
      'rgba(0, 10, 4, 0.48)'
    );

    // Pass 2: Edge-lit engraved Lucite rulings (warm amber-tinted near left/right tungsten bulbs, cool pale-green in center!)
    const luciteGrad = ctx.createLinearGradient(CRT_CX - CRT_R, 0, CRT_CX + CRT_R, 0);
    luciteGrad.addColorStop(0, 'rgba(255, 206, 138, 0.34)');
    luciteGrad.addColorStop(0.18, 'rgba(136, 245, 168, 0.22)');
    luciteGrad.addColorStop(0.5, 'rgba(84, 245, 142, 0.18)');
    luciteGrad.addColorStop(0.82, 'rgba(136, 245, 168, 0.22)');
    luciteGrad.addColorStop(1, 'rgba(255, 206, 138, 0.34)');

    const axisGrad = ctx.createLinearGradient(CRT_CX - CRT_R, 0, CRT_CX + CRT_R, 0);
    axisGrad.addColorStop(0, 'rgba(255, 218, 152, 0.48)');
    axisGrad.addColorStop(0.22, 'rgba(125, 255, 170, 0.38)');
    axisGrad.addColorStop(0.5, 'rgba(98, 255, 152, 0.34)');
    axisGrad.addColorStop(0.78, 'rgba(125, 255, 170, 0.38)');
    axisGrad.addColorStop(1, 'rgba(255, 218, 152, 0.48)');

    strokeGraticulePass(0, 0, luciteGrad, axisGrad, 'rgba(118, 255, 164, 0.28)');

    ctx.fillStyle = 'rgba(130, 255, 172, 0.42)';
    ctx.font = '600 10.5px "PelicanMono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Y0 = -2.5V REF', CRT_CX + 10, ROAD_EDGE_Y + 15);
    ctx.fillText('+Y DEFLECT', CRT_CX + 10, CRT_CY - CRT_R + 34);

    // Outer circular Vernier degree scale around CRT perimeter
    ctx.strokeStyle = axisGrad;
    ctx.lineWidth = 1.05;
    ctx.beginPath();
    for (let deg = 0; deg < 360; deg += 5) {
      const rad = (deg * Math.PI) / 180;
      const rOuter = CRT_R - 5;
      const rInner = deg % 30 === 0 ? CRT_R - 17 : deg % 10 === 0 ? CRT_R - 12 : CRT_R - 8;
      ctx.moveTo(CRT_CX + Math.cos(rad) * rInner, CRT_CY + Math.sin(rad) * rInner);
      ctx.lineTo(CRT_CX + Math.cos(rad) * rOuter, CRT_CY + Math.sin(rad) * rOuter);
    }
    ctx.stroke();

    // Inner bezel recessed rim vignette inside CRT glass
    const innerVig = ctx.createRadialGradient(
      CRT_CX,
      CRT_CY,
      CRT_R - 42,
      CRT_CX,
      CRT_CY,
      CRT_R + 2
    );
    innerVig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    innerVig.addColorStop(0.74, 'rgba(0, 0, 0, 0.34)');
    innerVig.addColorStop(1, 'rgba(0, 0, 0, 0.86)');
    ctx.fillStyle = innerVig;
    ctx.fillRect(CRT_CX - CRT_R, CRT_CY - CRT_R, CRT_R * 2, CRT_R * 2);

    ctx.restore();

    // 7. Static Dial Markings around the 4 Rotary Knobs & Analog Meter Face
    const drawKnobScale = (k, ticks = 9, specialLabels = null) => {
      ctx.save();
      ctx.strokeStyle = '#cfdcd4';
      ctx.lineWidth = 1.4;
      for (let i = 0; i < ticks; i++) {
        const u = i / (ticks - 1);
        const a = lerp(-Math.PI * 0.78, Math.PI * 0.78, u) - Math.PI / 2;
        const r0 = k.r + 5;
        const r1 = k.r + (i % 2 === 0 ? 11 : 8);
        ctx.beginPath();
        ctx.moveTo(k.x + Math.cos(a) * r0, k.y + Math.sin(a) * r0);
        ctx.lineTo(k.x + Math.cos(a) * r1, k.y + Math.sin(a) * r1);
        ctx.stroke();
      }
      ctx.fillStyle = '#dce8e0';
      ctx.font = '700 11.5px "PelicanMono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(k.label, k.x, k.y + k.r + 22);

      if (specialLabels) {
        ctx.font = '700 10px "PelicanMono", monospace';
        for (const sl of specialLabels) {
          const a = sl.angle - Math.PI / 2;
          const lx = k.x + Math.cos(a) * (k.r + 19);
          const ly = k.y + Math.sin(a) * (k.r + 19);
          ctx.fillStyle = sl.color || '#cde0d4';
          ctx.fillText(sl.text, lx, ly + 3);
        }
      }
      ctx.restore();
    };

    drawKnobScale(KNOB_INTENSITY, 9);
    drawKnobScale(KNOB_Y_PHASE, 9);
    drawKnobScale(KNOB_X_GAIN, 9);
    drawKnobScale(KNOB_XY_FREQ, 9, [
      { angle: -0.88, text: '1:1', color: '#6eff9e' },
      { angle: 0.05, text: '2:3', color: '#cfdcd4' },
      { angle: 1.02, text: '3:4', color: '#ff8a4c' },
    ]);

    // Analog Moving-Coil Meter Face (top-right at (816, 144))
    const mx = 816;
    const my = 144;
    const mr = 46;
    ctx.save();
    ctx.fillStyle = '#121715';
    ctx.beginPath();
    ctx.arc(mx, my, mr + 5, 0, Math.PI * 2);
    ctx.fill();

    // Aged warm parchment/ivory Bakelite meter card
    const mGrad = ctx.createRadialGradient(mx, my - 10, 4, mx, my, mr);
    mGrad.addColorStop(0, '#efeede');
    mGrad.addColorStop(0.8, '#d5d6c3');
    mGrad.addColorStop(1, '#b6b8a4');
    ctx.fillStyle = mGrad;
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();

    // Mirrored anti-parallax chrome arc slot on meter face
    ctx.strokeStyle = 'rgba(155, 172, 165, 0.72)';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(mx, my + 14, 25, -Math.PI * 0.84, -Math.PI * 0.16);
    ctx.stroke();

    // Red overload zone arc
    ctx.strokeStyle = '#c43420';
    ctx.lineWidth = 4.6;
    ctx.beginPath();
    ctx.arc(mx, my + 14, 34, -Math.PI * 0.34, -Math.PI * 0.14);
    ctx.stroke();

    // Fine black meter scale ticks + stop pins
    ctx.strokeStyle = '#1b1f1c';
    ctx.lineWidth = 1.2;
    for (let i = 0; i <= 10; i++) {
      const a = lerp(-Math.PI * 0.84, -Math.PI * 0.16, i / 10);
      const r0 = 28;
      const r1 = i % 5 === 0 ? 37 : 33;
      ctx.beginPath();
      ctx.moveTo(mx + Math.cos(a) * r0, my + 14 + Math.sin(a) * r0);
      ctx.lineTo(mx + Math.cos(a) * r1, my + 14 + Math.sin(a) * r1);
      ctx.stroke();
    }
    // Mechanical brass limit stop pins
    ctx.fillStyle = '#6d5726';
    ctx.beginPath();
    ctx.arc(mx - 31, my - 1, 1.8, 0, Math.PI * 2);
    ctx.arc(mx + 31, my - 1, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1d221e';
    ctx.font = '700 8.8px "PelicanMono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('BEAM µA', mx, my + 4);
    ctx.restore();

    // Riveted etched metal terminal plaques outside circular CRT bezel (zero clipping!)
    const drawPortPlaque = (px, py, pw, ph, text) => {
      ctx.save();
      ctx.fillStyle = '#131816';
      ctx.strokeStyle = '#8fa096';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, 2.5);
      ctx.fill();
      ctx.stroke();

      drawRivet(px + 5.5, py + ph / 2, 2.0, 0.3);
      drawRivet(px + pw - 5.5, py + ph / 2, 2.0, -0.5);

      ctx.fillStyle = '#edf6f0';
      ctx.font = '700 9.5px "PelicanMono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, px + pw / 2, py + ph / 2 + 0.5);
      ctx.restore();
    };
    drawPortPlaque(16, 714, 78, 22, 'TRACE IN');
    drawPortPlaque(906, 714, 78, 22, 'SYNC OUT');

    ctx.restore();
  });
}

/**
 * Bakes the Darkroom Silver-Halide Volumetric Lab Technician's Hand + Twill-Weave Lab Coat Cuff
 * ONCE into a 340x360 offscreen texture (knob grip centered at (140, 130)).
 * Eliminates all flat cartoon outlines (`#9effbe` strokes) & tutorial arrows, replacing them with
 * anatomical multi-band volumetric shading, soft P1 green subsurface scatter, cotton twill weave,
 * and genuine silver-halide film grain!
 */
function getBakedTechnicianHand(kit) {
  return kit.bake2D(
    's15_tech_hand_volumetric_r3',
    (g, ctx, rng, w, h) => {
      ctx.save();
      ctx.clearRect(0, 0, w, h);
      // Local origin (140, 130) corresponds to KNOB_XY_FREQ center
      const ox = 140;
      const oy = 130;
      ctx.translate(ox, oy);

      // Soft ambient cast shadow on lower-right control panel
      const shGrad = ctx.createRadialGradient(28, 62, 12, 34, 74, 118);
      shGrad.addColorStop(0, 'rgba(0, 0, 0, 0.62)');
      shGrad.addColorStop(0.55, 'rgba(0, 0, 0, 0.32)');
      shGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = shGrad;
      ctx.beginPath();
      ctx.ellipse(34, 74, 74, 118, -0.46, 0, Math.PI * 2);
      ctx.fill();

      // Helper to paint an anatomical finger/thumb volume using soft layered tonal flesh/shadow passes
      // (lit from top-left by P1 green CRT phosphor glow, falling off into warm-charcoal darkroom shadow)
      const paintDigitVolume = (buildPathFn, lightCenter, shadowShift = 1) => {
        ctx.save();
        buildPathFn();
        ctx.clip();

        // Deep darkroom shadow base
        const baseG = ctx.createLinearGradient(
          lightCenter.x - 24,
          lightCenter.y - 24,
          lightCenter.x + 56 * shadowShift,
          lightCenter.y + 52
        );
        baseG.addColorStop(0, '#5a8f6f'); // cool skin lit by P1 green CRT
        baseG.addColorStop(0.26, '#565954'); // neutral warm-olive darkroom skin midtone
        baseG.addColorStop(0.62, '#2d2d2b'); // core form shadow
        baseG.addColorStop(1, '#151615'); // deep occlusion crease
        ctx.fillStyle = baseG;
        ctx.fillRect(-130, -120, 290, 320);

        // Subsurface soft P1 phosphor green irradiance wash on CRT-facing upper-left skin
        const sssG = ctx.createRadialGradient(
          lightCenter.x,
          lightCenter.y,
          3,
          lightCenter.x + 6,
          lightCenter.y + 8,
          58
        );
        sssG.addColorStop(0, 'rgba(132, 255, 174, 0.52)');
        sssG.addColorStop(0.42, 'rgba(62, 208, 114, 0.24)');
        sssG.addColorStop(1, 'rgba(32, 120, 64, 0)');
        ctx.fillStyle = sssG;
        ctx.fillRect(-130, -120, 290, 320);

        ctx.restore();
      };

      // 1. Ring & Little Finger tucked in darkroom falloff on far right
      paintDigitVolume(
        () => {
          ctx.beginPath();
          ctx.moveTo(50, -10);
          ctx.bezierCurveTo(64, -22, 76, -12, 75, 8);
          ctx.bezierCurveTo(74, 28, 66, 48, 52, 50);
          ctx.lineTo(42, 34);
          ctx.closePath();
        },
        { x: 54, y: -10 },
        1.15
      );

      // 2. Middle Finger flexed behind index knuckle
      paintDigitVolume(
        () => {
          ctx.beginPath();
          ctx.moveTo(31, -22);
          ctx.bezierCurveTo(42, -38, 58, -32, 59, -12);
          ctx.bezierCurveTo(60, 10, 56, 34, 42, 38);
          ctx.lineTo(28, 28);
          ctx.closePath();
        },
        { x: 38, y: -26 },
        1.05
      );

      // Crease occlusion shadow between middle & index finger
      ctx.fillStyle = 'rgba(6, 8, 7, 0.65)';
      ctx.beginPath();
      ctx.moveTo(28, -24);
      ctx.quadraticCurveTo(40, 2, 42, 34);
      ctx.lineTo(35, 36);
      ctx.quadraticCurveTo(32, 2, 24, -20);
      ctx.closePath();
      ctx.fill();

      // 3. Index Finger pinching top-right flute of knob (leaves top-left white 3:4 pointer 100% unobstructed!)
      paintDigitVolume(
        () => {
          ctx.beginPath();
          ctx.moveTo(16, 36);
          ctx.bezierCurveTo(18, 8, 10, -14, 5, -28);
          ctx.bezierCurveTo(1, -40, 10, -48, 21, -44);
          ctx.bezierCurveTo(32, -39, 39, -18, 45, 8);
          ctx.bezierCurveTo(48, 22, 48, 34, 38, 40);
          ctx.closePath();
        },
        { x: 9, y: -36 },
        0.95
      );

      // 4. Dorsal Hand / Metacarpal Bridge with subtle extensor tendon ridges
      paintDigitVolume(
        () => {
          ctx.beginPath();
          ctx.moveTo(-10, 28);
          ctx.bezierCurveTo(14, 14, 48, 18, 72, 40);
          ctx.bezierCurveTo(82, 56, 86, 76, 82, 92);
          ctx.lineTo(22, 108);
          ctx.bezierCurveTo(8, 84, -4, 56, -10, 28);
          ctx.closePath();
        },
        { x: 6, y: 32 },
        1.1
      );

      // Soft anatomical knuckle skin folds & tendon catchlights (feathered, never wireframe!)
      for (const [kx, ky, rx, ry, rot, alpha] of [
        [15, -38, 7, 3.5, -0.35, 0.34], // index distal knuckle highlight
        [28, -14, 9, 4.2, -0.25, 0.24], // index PIP joint fold
        [46, -22, 7, 3.2, -0.2, 0.2], // middle knuckle catchlight
        [18, 44, 6, 22, -0.32, 0.14], // index extensor tendon ridge
        [38, 46, 5, 20, -0.26, 0.11], // middle extensor tendon ridge
      ]) {
        ctx.save();
        ctx.translate(kx, ky);
        ctx.rotate(rot);
        const kg = ctx.createRadialGradient(0, 0, 0.5, 0, 0, Math.max(rx, ry));
        kg.addColorStop(0, `rgba(176, 255, 204, ${alpha})`);
        kg.addColorStop(1, 'rgba(90, 190, 125, 0)');
        ctx.fillStyle = kg;
        ctx.scale(1, ry / rx);
        ctx.beginPath();
        ctx.arc(0, 0, rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 5. Opposable Thumb pressing left fluted skirt of knob
      paintDigitVolume(
        () => {
          ctx.beginPath();
          ctx.moveTo(16, 66);
          ctx.bezierCurveTo(-12, 54, -32, 30, -40, 8);
          ctx.bezierCurveTo(-46, -8, -42, -21, -31, -21);
          ctx.bezierCurveTo(-21, -21, -17, -8, -15, 10);
          ctx.bezierCurveTo(-12, 26, 2, 36, 24, 40);
          ctx.closePath();
        },
        { x: -34, y: -10 },
        0.9
      );

      // Subtle translucent thumbnail specular sheen catching the green CRT glow
      ctx.save();
      ctx.translate(-32, -13);
      ctx.rotate(-0.28);
      const nailG = ctx.createLinearGradient(-5, -6, 5, 6);
      nailG.addColorStop(0, 'rgba(205, 255, 222, 0.55)');
      nailG.addColorStop(0.5, 'rgba(110, 185, 138, 0.22)');
      nailG.addColorStop(1, 'rgba(35, 50, 42, 0.3)');
      ctx.fillStyle = nailG;
      ctx.beginPath();
      ctx.roundRect(-4.5, -6, 8.5, 11, 3.5);
      ctx.fill();
      ctx.restore();

      // 6. Vintage 1950s Leather-Strap Mechanical Lab Wristwatch
      ctx.save();
      // Stitched dark cordovan leather strap
      const strapG = ctx.createLinearGradient(20, 88, 84, 62);
      strapG.addColorStop(0, '#3a2d24');
      strapG.addColorStop(0.5, '#241b15');
      strapG.addColorStop(1, '#120e0b');
      ctx.fillStyle = strapG;
      ctx.beginPath();
      ctx.moveTo(20, 86);
      ctx.lineTo(80, 60);
      ctx.lineTo(86, 73);
      ctx.lineTo(26, 99);
      ctx.closePath();
      ctx.fill();

      // Brushed stainless watch case + lugs
      const caseG = ctx.createLinearGradient(38, 64, 66, 90);
      caseG.addColorStop(0, '#d7fae4');
      caseG.addColorStop(0.45, '#8ea196');
      caseG.addColorStop(1, '#2b332f');
      ctx.fillStyle = caseG;
      ctx.beginPath();
      ctx.arc(53, 78, 14, 0, Math.PI * 2);
      ctx.fill();

      // Radium-dial black military watch face + glowing green radium hands + curved acrylic crystal glint
      ctx.fillStyle = '#0c140f';
      ctx.beginPath();
      ctx.arc(53, 78, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(148, 255, 182, 0.78)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(53, 78);
      ctx.lineTo(58, 71);
      ctx.moveTo(53, 78);
      ctx.lineTo(47, 74);
      ctx.stroke();

      ctx.fillStyle = 'rgba(220, 255, 232, 0.28)';
      ctx.beginPath();
      ctx.arc(49, 74, 5.5, Math.PI * 0.8, Math.PI * 1.9);
      ctx.fill();
      ctx.restore();

      // 7. Heavy Cotton-Twill 1950s White Lab-Coat Cuff (with woven diagonal fabric grain & soft fold shadows!)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(18, 98);
      ctx.quadraticCurveTo(52, 80, 88, 67);
      ctx.lineTo(164, 186);
      ctx.lineTo(72, 222);
      ctx.closePath();
      ctx.clip();

      const cuffGrad = ctx.createLinearGradient(16, 92, 128, 152);
      cuffGrad.addColorStop(0, '#b5f2ca'); // P1 green phosphor bounce on left cuff edge
      cuffGrad.addColorStop(0.24, '#e3ece6'); // warm starched lab cotton
      cuffGrad.addColorStop(0.65, '#aebcb4'); // soft cylindrical sleeve roll-off
      cuffGrad.addColorStop(1, '#6c7a72'); // underside darkroom shadow
      ctx.fillStyle = cuffGrad;
      ctx.fillRect(10, 60, 170, 175);

      // Authentic woven diagonal cotton-twill ridges across cuff
      ctx.strokeStyle = 'rgba(42, 54, 48, 0.11)';
      ctx.lineWidth = 1;
      for (let tLine = -40; tLine < 260; tLine += 3.5) {
        ctx.beginPath();
        ctx.moveTo(10 + tLine, 60);
        ctx.lineTo(tLine - 55, 230);
        ctx.stroke();
      }

      // Soft fabric crease shadows & folded cuff hem (NO black cartoon outline!)
      const foldG = ctx.createLinearGradient(28, 110, 34, 122);
      foldG.addColorStop(0, 'rgba(20, 28, 24, 0.42)');
      foldG.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
      foldG.addColorStop(1, 'rgba(20, 28, 24, 0)');
      ctx.strokeStyle = foldG;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(24, 116);
      ctx.quadraticCurveTo(60, 98, 98, 84);
      ctx.stroke();

      // 4-hole mother-of-pearl lab coat cuff button
      const bx = 79;
      const by = 106;
      ctx.fillStyle = 'rgba(15, 22, 18, 0.45)';
      ctx.beginPath();
      ctx.arc(bx + 1.5, by + 2, 6, 0, Math.PI * 2);
      ctx.fill();
      const btnG = ctx.createRadialGradient(bx - 2, by - 2, 1, bx, by, 6);
      btnG.addColorStop(0, '#f7faf8');
      btnG.addColorStop(1, '#9aa8a0');
      ctx.fillStyle = btnG;
      ctx.beginPath();
      ctx.arc(bx, by, 5.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#39463f';
      for (const [hx, hy] of [
        [-1.6, -1.6],
        [1.6, -1.6],
        [-1.6, 1.6],
        [1.6, 1.6],
      ]) {
        ctx.fillRect(bx + hx - 0.7, by + hy - 0.7, 1.4, 1.4);
      }
      ctx.restore();

      // 8. Darkroom Silver-Halide Film Grain Pass across all non-transparent pixels of the hand!
      if (typeof ctx.getImageData === 'function') {
        const img = ctx.getImageData(0, 0, w, h);
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          const a = d[i + 3];
          if (a > 8) {
            // Midtone-weighted organic silver-halide grain
            const lum = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255;
            const midWeight = 4 * lum * (1 - lum) + 0.25;
            const grain = (rng() + rng() - 1) * 19 * midWeight;
            d[i] = clamp(d[i] + grain * 0.85, 0, 255);
            d[i + 1] = clamp(d[i + 1] + grain * 1.05, 0, 255);
            d[i + 2] = clamp(d[i + 2] + grain * 0.9, 0, 255);
          }
        }
        ctx.putImageData(img, 0, 0);
      }

      ctx.restore();
    },
    340,
    360
  );
}

/**
 * Draws a fluted 1950s black phenolic Bakelite knob at rotation `angle` (0 = straight up).
 */
function drawBakeliteKnob(ctx, k, angle) {
  ctx.save();
  ctx.translate(k.x, k.y);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.58)';
  ctx.beginPath();
  ctx.arc(3, 5, k.r + 2, 0, Math.PI * 2);
  ctx.fill();

  // Spun aluminum skirt ring
  const skGrad = ctx.createLinearGradient(-k.r, -k.r, k.r, k.r);
  skGrad.addColorStop(0, '#c2cfc7');
  skGrad.addColorStop(0.5, '#68756e');
  skGrad.addColorStop(1, '#262e2a');
  ctx.fillStyle = skGrad;
  ctx.beginPath();
  ctx.arc(0, 0, k.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.rotate(angle);

  // Scalloped dark phenolic Bakelite grip flutes
  const lobes = 12;
  const innerR = k.r * 0.82;
  ctx.fillStyle = '#151716';
  ctx.strokeStyle = '#38403c';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  for (let i = 0; i < lobes * 2; i++) {
    const a = (i * Math.PI) / lobes;
    const rad = i % 2 === 0 ? innerR : innerR * 0.9;
    const px = Math.cos(a) * rad;
    const py = Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  const capG = ctx.createRadialGradient(-4, -5, 2, 0, 0, innerR * 0.72);
  capG.addColorStop(0, '#3b423e');
  capG.addColorStop(1, '#0f1110');
  ctx.fillStyle = capG;
  ctx.beginPath();
  ctx.arc(0, 0, innerR * 0.68, 0, Math.PI * 2);
  ctx.fill();

  // Ivory-white engraved Bakelite pointer inlay bar
  ctx.strokeStyle = '#f4f6ed';
  ctx.lineWidth = 3.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -innerR * 0.18);
  ctx.lineTo(0, -k.r * 0.94);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws dynamic Pilot Jewel Lamp, Moving-Coil Meter Needle (with mechanical inertia & stop-pin bounce!),
 * Rotary Bakelite Knobs, and bottom-right `SYNC UNLOCK` ruby-amber strobe jewel.
 */
function drawDynamicPanelIndicators(ctx, t, localT, gag) {
  // 1. Ruby-Amber Faceted Power Jewel Lamp at (928, 86)
  const lx = 928;
  const ly = 86;
  const hum = 0.88 + 0.12 * Math.sin(t * 38) + gag.mix * 0.25 * Math.sin(t * 95);

  ctx.save();
  ctx.fillStyle = '#8b9990';
  ctx.beginPath();
  ctx.arc(lx, ly, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1b211e';
  ctx.beginPath();
  ctx.arc(lx, ly, 16, 0, Math.PI * 2);
  ctx.fill();

  const halo = ctx.createRadialGradient(lx, ly, 3, lx, ly, 44);
  halo.addColorStop(0, `rgba(255, 210, 110, ${(0.84 * hum).toFixed(3)})`);
  halo.addColorStop(0.35, `rgba(255, 82, 28, ${(0.52 * hum).toFixed(3)})`);
  halo.addColorStop(1, 'rgba(255, 50, 10, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(lx, ly, 44, 0, Math.PI * 2);
  ctx.fill();

  const jg = ctx.createRadialGradient(lx - 4, ly - 4, 2, lx, ly, 14.5);
  jg.addColorStop(0, '#fff2b8');
  jg.addColorStop(0.45, '#ff6a1f');
  jg.addColorStop(1, '#751005');
  ctx.fillStyle = jg;
  ctx.beginPath();
  ctx.arc(lx, ly, 14.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 240, 200, 0.36)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(lx - Math.cos(a) * 12.5, ly - Math.sin(a) * 12.5);
    ctx.lineTo(lx + Math.cos(a) * 12.5, ly + Math.sin(a) * 12.5);
    ctx.stroke();
  }

  ctx.fillStyle = '#d8e4dc';
  ctx.font = '700 9.5px "PelicanMono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('PILOT 6.3V', lx, ly + 29);
  ctx.restore();

  // 2. Analog Moving-Coil Meter Needle at (816, 144) with 2nd-order mechanical inertia & pin-bounce!
  const mx = 816;
  const my = 144;
  const entrySurge =
    localT < 0.55
      ? Math.exp(-localT * 6.5) * Math.cos(localT * 26) * 0.44
      : 0;
  const meterVal = clamp(
    0.42 +
      entrySurge +
      gag.mix * 0.53 -
      gag.pllRing * 0.32 +
      0.03 * Math.sin(t * 19) +
      gag.mix * 0.09 * Math.sin(t * 78),
    0.03,
    0.99
  );
  const needleA = lerp(-Math.PI * 0.84, -Math.PI * 0.16, meterVal);

  ctx.save();
  ctx.beginPath();
  ctx.arc(mx, my, 45, 0, Math.PI * 2);
  ctx.clip();

  // Subtle needle shadow on parchment dial
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(mx + 1.5, my + 17.5);
  ctx.lineTo(mx + 1.5 + Math.cos(needleA) * 39, my + 15.5 + Math.sin(needleA) * 39);
  ctx.stroke();

  // Knife-edge red meter pointer
  ctx.strokeStyle = '#b82318';
  ctx.lineWidth = 1.9;
  ctx.beginPath();
  ctx.moveTo(mx, my + 16);
  ctx.lineTo(mx + Math.cos(needleA) * 39, my + 14 + Math.sin(needleA) * 39);
  ctx.stroke();

  ctx.fillStyle = '#1f2421';
  ctx.beginPath();
  ctx.arc(mx, my + 16, 6, 0, Math.PI * 2);
  ctx.fill();

  // Curved convex watch-glass reflection band across meter
  const mgG = ctx.createLinearGradient(mx - 40, my - 40, mx + 20, my + 10);
  mgG.addColorStop(0, 'rgba(255, 255, 255, 0.20)');
  mgG.addColorStop(0.35, 'rgba(255, 255, 255, 0.05)');
  mgG.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = mgG;
  ctx.beginPath();
  ctx.arc(mx - 12, my - 14, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Four Rotary Bakelite Knobs
  drawBakeliteKnob(ctx, KNOB_INTENSITY, 0.42 + (localT < 0.5 ? (0.5 - localT) * 0.5 : 0));
  drawBakeliteKnob(ctx, KNOB_Y_PHASE, -0.25 + 0.04 * Math.sin(t * 3));
  drawBakeliteKnob(ctx, KNOB_X_GAIN, 0.18);
  drawBakeliteKnob(ctx, KNOB_XY_FREQ, gag.knobAngle + gag.panicShake * 0.08);

  // 4. Bottom-Right `SYNC UNLOCK` High-Intensity Ruby-Amber Strobe Jewel
  const wx = 786;
  const wy = 804;
  ctx.save();
  ctx.fillStyle = '#8b9990';
  ctx.beginPath();
  ctx.arc(wx, wy, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#181e1b';
  ctx.beginPath();
  ctx.arc(wx, wy, 12, 0, Math.PI * 2);
  ctx.fill();

  if (gag.mix > 0.06) {
    const strobe = 0.78 + 0.22 * Math.sin(t * 68);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const wg = ctx.createRadialGradient(wx, wy, 2, wx, wy, 56);
    wg.addColorStop(0, `rgba(255, 245, 190, ${(gag.mix * strobe * 0.95).toFixed(3)})`);
    wg.addColorStop(0.28, `rgba(255, 96, 28, ${(gag.mix * strobe * 0.82).toFixed(3)})`);
    wg.addColorStop(0.65, `rgba(255, 36, 12, ${(gag.mix * strobe * 0.35).toFixed(3)})`);
    wg.addColorStop(1, 'rgba(255, 20, 0, 0)');
    ctx.fillStyle = wg;
    ctx.beginPath();
    ctx.arc(wx, wy, 56, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = 'rgba(68, 12, 6, 0.92)';
    ctx.strokeStyle = '#ff7b3d';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(wx - 48, wy - 36, 96, 17, 2.5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffe3c2';
    ctx.font = '700 10px "PelicanMono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('! SYNC UNLOCK !', wx, wy - 24);
  } else {
    ctx.fillStyle = '#aebcb3';
    ctx.font = '700 9.5px "PelicanMono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SYNC UNLOCK', wx, wy - 20);
  }

  const lampG = ctx.createRadialGradient(wx - 3, wy - 3, 1, wx, wy, 10.5);
  if (gag.mix > 0.06) {
    lampG.addColorStop(0, '#ffffff');
    lampG.addColorStop(0.4, '#ff8826');
    lampG.addColorStop(1, '#9e1608');
  } else {
    lampG.addColorStop(0, '#5e3830');
    lampG.addColorStop(1, '#261411');
  }
  ctx.fillStyle = lampG;
  ctx.beginPath();
  ctx.arc(wx, wy, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function sampleCubic(p0, p1, p2, p3, steps = 16) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    pts.push({
      x:
        mt * mt * mt * p0.x +
        3 * mt * mt * t * p1.x +
        3 * mt * t * t * p2.x +
        t * t * t * p3.x,
      y:
        mt * mt * mt * p0.y +
        3 * mt * mt * t * p1.y +
        3 * mt * t * t * p2.y +
        t * t * t * p3.y,
    });
  }
  return pts;
}

function sampleQuad(p0, p1, p2, steps = 14) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    pts.push({
      x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
      y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
    });
  }
  return pts;
}

function sampleLine(a, b, steps = 10) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    pts.push({ x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u) });
  }
  return pts;
}

/**
 * Builds an authentic 1950s Single-Beam Continuous CH1(X)/CH2(Y) Analog Oscillogram!
 * - Standing-wave polar wheels (`±4.2% R` petal modulation + continuous epitrochoid spoke rose)
 * - Crisp closed outer pelican silhouette + high-frequency AM carrier wave envelope inside gular pouch & wing
 * - 5% alpha unblanked high-speed flyback retrace lines connecting sub-loops
 * - Physical `I ∝ 1/||v_beam||` velocity-inverse segment classification (`fast`, `med`, `slow`) so fast sweeps are fine
 *   and turnaround/high-curvature vertices bloom bright white-green!
 */
function buildVectorPelicanTraces(rig, sampleT, mix, pllRing = 0, jitterAmp = 0.85, includeVelocityBins = true) {
  const s = rig.root.scale;
  const rawPolylines = [];
  const rawDwellDots = [];

  // 1. Standing-Wave Polar Harmonic Wheels (`±4.2% R` petal modulation + continuous rose-curve inner spoke wave!)
  for (const w of [rig.rearWheel, rig.frontWheel]) {
    // Outer standing-wave tire envelope (kept crisp ±4.2% R for instant bicycle recognition!)
    const rimPts = [];
    const rimSteps = 44;
    for (let i = 0; i <= rimSteps; i++) {
      const th = (i / rimSteps) * Math.PI * 2;
      const standWave = 1 + 0.042 * Math.cos(8 * (th - w.angle)) + 0.014 * Math.sin(16 * th + sampleT * 18);
      const rad = w.r * standWave;
      rimPts.push({
        x: w.x + Math.cos(th) * rad,
        y: w.y + Math.sin(th) * rad,
      });
    }
    rawPolylines.push(rimPts);

    // Continuous Single-Beam Rose-Trochoid Harmonic Spoke Loop (`r = 0.84R * |cos(4*(θ - angle))|`)
    const rosePts = [];
    const roseSteps = 56;
    for (let i = 0; i <= roseSteps; i++) {
      const th = w.angle + (i / roseSteps) * Math.PI * 2;
      const petal = 0.14 + 0.72 * Math.abs(Math.cos(4 * (th - w.angle)));
      const rad = w.r * petal;
      rosePts.push({
        x: w.x + Math.cos(th) * rad,
        y: w.y + Math.sin(th) * rad,
      });
    }
    rawPolylines.push(rosePts);
    rawDwellDots.push({ x: w.x, y: w.y });
  }

  // 2. Harmonic Sprocket Oscillator & Carrier Drive Chain
  const chainSteps = 22;
  const sprocketPts = [];
  for (let i = 0; i <= chainSteps; i++) {
    const th = rig.pedalAngle + (i / chainSteps) * Math.PI * 2;
    const rr = 12.2 * s * (1 + 0.08 * Math.cos(6 * th));
    sprocketPts.push({ x: rig.bb.x + Math.cos(th) * rr, y: rig.bb.y + Math.sin(th) * rr });
  }
  rawPolylines.push(sprocketPts);
  rawPolylines.push(
    sampleLine(
      { x: rig.rearWheel.x, y: rig.rearWheel.y - 5 * s },
      { x: rig.bb.x, y: rig.bb.y - 12 * s },
      8
    )
  );
  rawPolylines.push(
    sampleLine(
      { x: rig.bb.x, y: rig.bb.y + 12 * s },
      { x: rig.rearWheel.x, y: rig.rearWheel.y + 5 * s },
      8
    )
  );

  // 3. Continuous Closed-Loop Bicycle Frame Sweep + Cruiser Handlebar
  rawPolylines.push([
    ...sampleLine(rig.rearWheel, rig.seatCluster, 10),
    ...sampleLine(rig.seatCluster, rig.headTop, 12).slice(1),
    ...sampleLine(rig.headTop, rig.headBot, 5).slice(1),
    ...sampleLine(rig.headBot, rig.bb, 12).slice(1),
    ...sampleLine(rig.bb, rig.rearWheel, 10).slice(1),
    ...sampleLine(rig.rearWheel, rig.bb, 2).slice(1), // quick flyback to BB
    ...sampleLine(rig.bb, rig.seatCluster, 10).slice(1),
    ...sampleLine(rig.seatCluster, rig.saddle, 4).slice(1),
    ...sampleLine(
      { x: rig.saddle.x - 14 * s, y: rig.saddle.y },
      { x: rig.saddle.x + 13 * s, y: rig.saddle.y + 1 * s },
      5
    ),
  ]);
  rawPolylines.push([
    ...sampleLine(rig.frontWheel, rig.headBot, 8),
    ...sampleLine(rig.headBot, rig.stemTop, 6).slice(1),
    ...sampleQuad(
      rig.stemTop,
      { x: rig.stemTop.x - 5 * s, y: rig.stemTop.y - 6 * s },
      rig.handleGrip,
      6
    ).slice(1),
  ]);

  rawDwellDots.push(
    rig.bb,
    rig.seatCluster,
    rig.headTop,
    rig.headBot,
    rig.handleGrip
  );

  // 4. Two-Bone IK Legs, Cranks & Webbed Vector Feet
  const addLeg = (hipPt, kneePt, footPt, pedalPt) => {
    const toeTop = { x: footPt.x + 15 * s, y: footPt.y + 1.5 * s };
    const toeBot = { x: footPt.x + 10 * s, y: footPt.y + 7 * s };
    const heel = { x: footPt.x - 5 * s, y: footPt.y + 4 * s };
    rawPolylines.push([
      ...sampleLine(hipPt, kneePt, 8),
      ...sampleLine(kneePt, footPt, 8).slice(1),
      ...sampleLine(footPt, heel, 3).slice(1),
      ...sampleLine(heel, toeTop, 4).slice(1),
      ...sampleLine(toeTop, toeBot, 3).slice(1),
      ...sampleLine(toeBot, heel, 4).slice(1),
    ]);
    rawPolylines.push([
      ...sampleLine(rig.bb, pedalPt, 6),
      ...sampleLine(
        { x: pedalPt.x - 8 * s, y: pedalPt.y + 2 * s },
        { x: pedalPt.x + 8 * s, y: pedalPt.y + 2 * s },
        4
      ),
    ]);
    rawDwellDots.push(kneePt, pedalPt);
  };
  addLeg(rig.leftHip, rig.leftKnee, rig.leftFoot, rig.leftPedal);
  addLeg(rig.rightHip, rig.rightKnee, rig.rightFoot, rig.rightPedal);

  // 5. Crisp Closed Outer Pelican Torso Envelope + Internal Harmonic Standing Wave
  const torsoTop = sampleQuad(
    rig.tailTip,
    { x: rig.bodyCenter.x - 36 * s, y: rig.bodyCenter.y - 30 * s },
    { x: rig.chest.x + 9 * s, y: rig.chest.y - 6 * s },
    15
  );
  const torsoFront = sampleQuad(
    { x: rig.chest.x + 9 * s, y: rig.chest.y - 6 * s },
    { x: rig.bodyCenter.x + 35 * s, y: rig.bodyCenter.y + 26 * s },
    { x: rig.hip.x - 14 * s, y: rig.hip.y + 14 * s },
    12
  );
  const torsoBelly = sampleQuad(
    { x: rig.hip.x - 14 * s, y: rig.hip.y + 14 * s },
    { x: rig.bodyCenter.x - 46 * s, y: rig.bodyCenter.y + 14 * s },
    rig.tailTip,
    13
  );
  rawPolylines.push([
    ...torsoTop,
    ...torsoFront.slice(1),
    ...torsoBelly.slice(1),
  ]);
  rawDwellDots.push(rig.tailTip);

  // 6. S-Curved Vector Neck (crisp dual boundary traces + continuous sine-wave carrier zigzag!)
  const neckBack = sampleCubic(
    { x: rig.chest.x - 9 * s, y: rig.chest.y - 1 * s },
    { x: rig.neckC1.x - 8 * s, y: rig.neckC1.y },
    { x: rig.neckC2.x - 9 * s, y: rig.neckC2.y },
    { x: rig.head.x - 10 * s, y: rig.head.y },
    16
  );
  const neckFront = sampleCubic(
    { x: rig.chest.x + 7 * s, y: rig.chest.y + 7 * s },
    { x: rig.neckC1.x + 9 * s, y: rig.neckC1.y + 3 * s },
    { x: rig.neckC2.x + 9 * s, y: rig.neckC2.y + 2 * s },
    { x: rig.head.x + 8 * s, y: rig.head.y + 5 * s },
    16
  );
  rawPolylines.push(neckBack);
  rawPolylines.push(neckFront);
  // Continuous AM carrier wave weaving between neckBack and neckFront
  const neckCarrier = [];
  for (let k = 1; k < neckBack.length - 1; k++) {
    const wv = 0.5 + 0.42 * Math.sin(k * 1.9 - sampleT * 22);
    neckCarrier.push({
      x: lerp(neckBack[k].x, neckFront[k].x, wv),
      y: lerp(neckBack[k].y, neckFront[k].y, wv),
    });
  }
  rawPolylines.push(neckCarrier);

  // 7. Head Dome, Crown Crest, Eye Loop, Sharp Closed Beak/Pouch Envelope + High-Freq AM Carrier Pouch Wave!
  const headLoop = [];
  for (let i = 0; i <= 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    headLoop.push({
      x: rig.head.x + Math.cos(a) * rig.head.r,
      y: rig.head.y + Math.sin(a) * rig.head.r,
    });
  }
  rawPolylines.push(headLoop);
  rawPolylines.push([
    rig.crest1,
    { x: rig.head.x - 9 * s, y: rig.head.y - 9 * s },
    { x: rig.head.x - 11 * s, y: rig.head.y - 4 * s },
    rig.crest2,
  ]);
  rawDwellDots.push(rig.crest1, rig.crest2);

  // Vector eye loop + cathode dwell pupil
  const ex = rig.head.x + 4.2 * s;
  const ey = rig.head.y - 3.2 * s;
  const eyePts = [];
  for (let i = 0; i <= 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    eyePts.push({ x: ex + Math.cos(a) * 4.4 * s, y: ey + Math.sin(a) * 4.4 * s });
  }
  rawPolylines.push(eyePts);
  rawDwellDots.push({ x: ex + 1.2 * s, y: ey });

  // Upper hooked mandible + Closed Crisp Outer Gular Pouch Boundary (guarantees instant pelican silhouette!)
  const hookTip = { x: rig.beakTip.x + 4 * s, y: rig.beakTip.y + 5 * s };
  rawPolylines.push([
    ...sampleLine(rig.beakUpperBase, { x: rig.beakTip.x, y: rig.beakTip.y - 3 * s }, 12),
    ...sampleQuad(
      { x: rig.beakTip.x, y: rig.beakTip.y - 3 * s },
      { x: rig.beakTip.x + 6 * s, y: rig.beakTip.y + 2 * s },
      hookTip,
      4
    ).slice(1),
    ...sampleLine(hookTip, rig.beakLowerBase, 12).slice(1),
  ]);
  rawDwellDots.push(hookTip);

  const pouchOuter = sampleQuad(
    rig.beakLowerBase,
    rig.pouchBelly,
    { x: rig.beakTip.x - 1.5 * s, y: rig.beakTip.y + 1 * s },
    20
  );
  rawPolylines.push(pouchOuter);

  // Authentic AM-Modulated Sinusoidal Carrier Wave (`y_mid + A_env(u) * sin(ω_c u + φ)`) inside Gular Pouch!
  const pouchAM = [];
  const amSteps = 34;
  for (let i = 0; i <= amSteps; i++) {
    const u = i / amSteps;
    const mu = 1 - u;
    const topPt = {
      x: lerp(rig.beakLowerBase.x + 3 * s, rig.beakTip.x - 3 * s, u),
      y: lerp(rig.beakLowerBase.y + 0.5 * s, rig.beakTip.y + 0.5 * s, u),
    };
    const botPt = {
      x:
        mu * mu * (rig.beakLowerBase.x + 3 * s) +
        2 * mu * u * rig.pouchBelly.x +
        u * u * (rig.beakTip.x - 3 * s),
      y:
        mu * mu * (rig.beakLowerBase.y + 1 * s) +
        2 * mu * u * (rig.pouchBelly.y - 1.5 * s) +
        u * u * (rig.beakTip.y + 0.5 * s),
    };
    const carrier = 0.5 + 0.44 * Math.sin(u * Math.PI * 11.0 - sampleT * 28.0);
    pouchAM.push({
      x: lerp(topPt.x, botPt.x, carrier),
      y: lerp(topPt.y, botPt.y, carrier),
    });
  }
  rawPolylines.push(pouchAM);

  // 8. Closed Articulated Wing Envelope + Continuous Harmonic Feather Sweep
  const wingLower = sampleQuad(
    rig.wingShoulder,
    { x: rig.wingElbow.x - 16 * s, y: rig.wingElbow.y + 19 * s },
    { x: rig.wingTip.x + 4 * s, y: rig.wingTip.y + 2 * s },
    13
  );
  const wingUpper = sampleQuad(
    { x: rig.wingTip.x + 4 * s, y: rig.wingTip.y + 2 * s },
    { x: rig.wingElbow.x + 12 * s, y: rig.wingElbow.y - 8 * s },
    { x: rig.wingShoulder.x + 12 * s, y: rig.wingShoulder.y + 2 * s },
    11
  );
  rawPolylines.push([...wingLower, ...wingUpper.slice(1)]);

  // Continuous sawtooth/harmonic feather wave inside wing
  const wingWave = [];
  for (let k = 1; k <= 10; k++) {
    const u = k / 11;
    const idxL = Math.min(wingLower.length - 1, Math.round(u * (wingLower.length - 1)));
    const idxU = Math.min(wingUpper.length - 1, Math.round((1 - u) * (wingUpper.length - 1)));
    wingWave.push(k % 2 === 0 ? wingLower[idxL] : wingUpper[idxU]);
  }
  rawPolylines.push(wingWave);

  // Count total points for uniform parametric `u in [0, 1]` mapping onto the 3:4 Lissajous knot
  let totalPts = 0;
  for (const poly of rawPolylines) totalPts += poly.length;

  const lissCx = lerp(rig.root.x, clamp(rig.root.x, 340, 660), mix * 0.55);
  const lissCy = lerp(rig.root.y - 105 * s, CRT_CY + 6, mix);
  const phaseX = sampleT * 10.5;
  const phaseY = sampleT * 7.0 + 0.72;
  const ax = 204;
  const ay = 168;
  const coilRot = 0.24 * Math.sin(sampleT * 2.9 + 0.4);
  const cosR = Math.cos(coilRot);
  const sinR = Math.sin(coilRot);

  const evalLissajous = (theta, relX = 0, relY = 0) => {
    const env = 0.84 + 0.16 * Math.cos(theta - sampleT * 4.2) + 0.06 * Math.sin(2 * theta + 1.1);
    const rawX =
      ax * env * Math.sin(3 * theta + phaseX) +
      relX * 0.12 * Math.cos(4 * theta - sampleT * 8);
    const rawY =
      ay * env * Math.sin(4 * theta + phaseY) +
      relY * 0.12 * Math.sin(3 * theta + sampleT * 8);
    return {
      x: lissCx + rawX * cosR - rawY * sinR,
      y: lissCy + rawX * sinR + rawY * cosR,
    };
  };

  let ptIdx = 0;
  const warpedPolylines = rawPolylines.map((poly) =>
    poly.map((pt) => {
      const u = ptIdx / Math.max(1, totalPts - 1);
      ptIdx++;

      let wx = pt.x;
      let wy = pt.y;

      if (mix > 0.001) {
        const theta = u * Math.PI * 4.0;
        const relX = pt.x - rig.root.x;
        const relY = pt.y - (rig.root.y - 105 * s);
        const lp = evalLissajous(theta, relX, relY);
        wx = lerp(wx, lp.x, mix);
        wy = lerp(wy, lp.y, mix);
      }

      // Second-order PLL lock-in shear oscillation right at localT = 3.00s!
      if (Math.abs(pllRing) > 0.002) {
        const dyRel = wy - ROAD_EDGE_Y;
        wx += pllRing * (-dyRel * 0.16) * Math.cos(u * 12);
        wy += pllRing * 14 * Math.sin(u * 18);
      }

      const jx = analogNoise(ptIdx * 1.37, sampleT * 60) * jitterAmp;
      const jy = analogNoise(ptIdx * 2.91 + 17, sampleT * 60) * jitterAmp;
      return { x: wx + jx, y: wy + jy };
    })
  );

  // Build Unblanked High-Speed Flyback Retrace Ghost Lines connecting consecutive sub-loops!
  const retraceLines = [];
  for (let p = 0; p < warpedPolylines.length - 1; p++) {
    const aPoly = warpedPolylines[p];
    const bPoly = warpedPolylines[p + 1];
    if (aPoly.length > 0 && bPoly.length > 0) {
      const pEnd = aPoly[aPoly.length - 1];
      const pStart = bPoly[0];
      if (Math.hypot(pStart.x - pEnd.x, pStart.y - pEnd.y) > 4) {
        retraceLines.push([pEnd, pStart]);
      }
    }
  }
  // Close the master single-beam loop from final point back to initial wheel point
  if (warpedPolylines.length > 1) {
    const firstPt = warpedPolylines[0][0];
    const lastPoly = warpedPolylines[warpedPolylines.length - 1];
    const lastPt = lastPoly[lastPoly.length - 1];
    retraceLines.push([lastPt, firstPt]);
  }

  // Compute `I ∝ 1/||v_beam||` Velocity-Inverse Segments (`fast`, `med`, `slow`) + Turnaround Hotspots!
  const fastSegs = [];
  const medSegs = [];
  const slowSegs = [];
  const hotspots = [];

  if (includeVelocityBins) {
    for (const poly of warpedPolylines) {
      for (let i = 0; i < poly.length - 1; i++) {
        const p0 = poly[i];
        const p1 = poly[i + 1];
        const ds = Math.hypot(p1.x - p0.x, p1.y - p0.y);
        // Check directional turnaround / curvature inflection at p1
        let turnBoost = 0;
        if (i < poly.length - 2) {
          const p2 = poly[i + 2];
          const ds2 = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          if (ds > 0.4 && ds2 > 0.4) {
            const cosA =
              ((p1.x - p0.x) * (p2.x - p1.x) + (p1.y - p0.y) * (p2.y - p1.y)) /
              (ds * ds2);
            turnBoost = clamp((1 - cosA) * 0.5, 0, 1);
          }
        }
        const effectiveSpeed = ds * (1 - turnBoost * 0.65);
        const seg = [p0, p1];
        if (effectiveSpeed < 6.2 || turnBoost > 0.45) {
          slowSegs.push(seg);
        } else if (effectiveSpeed < 13.5) {
          medSegs.push(seg);
        } else {
          fastSegs.push(seg);
        }
      }
    }
  }

  if (mix > 0.12) {
    const carrier = [];
    const N = 192;
    for (let i = 0; i <= N; i++) {
      const th = (i / N) * Math.PI * 2;
      const lp = evalLissajous(th, 0, 0);
      const jx = analogNoise(i * 0.9, sampleT * 60) * jitterAmp;
      const jy = analogNoise(i * 1.7 + 9, sampleT * 60) * jitterAmp;
      const fx = lerp(rig.root.x, lp.x, mix) + jx;
      const fy = lerp(rig.root.y - 105 * s, lp.y, mix) + jy;
      carrier.push({ x: fx, y: fy });

      if (i < N) {
        const vx = Math.abs(3 * Math.cos(3 * th + phaseX));
        const vy = Math.abs(4 * Math.cos(4 * th + phaseY));
        const vMin = Math.min(vx, vy);
        const vTot = Math.hypot(vx, vy);
        if (vTot < 1.65 || (vMin < 0.24 && i % 3 === 0)) {
          const intensity = clamp((1.85 - Math.min(vTot, vMin * 3.2)) / 1.85, 0.35, 1.0) * mix;
          hotspots.push({ x: fx, y: fy, intensity });
        }
      }
    }
    warpedPolylines.push(carrier);
  }

  const warpedDots = rawDwellDots.map((pt, idx) => {
    let wx = pt.x;
    let wy = pt.y;
    if (mix > 0.001) {
      const th = (idx / Math.max(1, rawDwellDots.length)) * Math.PI * 2;
      const lp = evalLissajous(th, 0, 0);
      wx = lerp(wx, lp.x, mix);
      wy = lerp(wy, lp.y, mix);
    }
    return { x: wx, y: wy };
  });

  return {
    polylines: warpedPolylines,
    retraceLines,
    fastSegs,
    medSegs,
    slowSegs,
    dwellDots: warpedDots,
    hotspots,
  };
}

function strokePolylines(ctx, polylines, color, width) {
  if (!polylines || polylines.length === 0) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  for (const poly of polylines) {
    if (poly.length < 2) continue;
    ctx.moveTo(poly[0].x, poly[0].y);
    for (let i = 1; i < poly.length; i++) {
      ctx.lineTo(poly[i].x, poly[i].y);
    }
  }
  ctx.stroke();
}

/**
 * Renders true 250x250 Dual-Gaussian Lead-Glass Halation Bloom behind the CRT electron beam!
 */
function renderGlassHalation(ctx, mainSweep, currPolylines, entryBoost) {
  ensureHalationBuffer();
  if (!halationCtx || !halationCanvas) return;

  halationCtx.save();
  halationCtx.setTransform(1, 0, 0, 1, 0, 0);
  halationCtx.filter = 'none';
  halationCtx.clearRect(0, 0, 250, 250);

  if ('filter' in halationCtx) {
    halationCtx.filter = 'blur(5.5px)';
  }
  halationCtx.scale(0.25, 0.25);
  halationCtx.lineCap = 'round';
  halationCtx.lineJoin = 'round';

  strokePolylines(halationCtx, mainSweep, 'rgba(32, 238, 96, 0.42)', 14);
  strokePolylines(
    halationCtx,
    currPolylines,
    `rgba(38, 250, 108, ${(0.52 * entryBoost).toFixed(3)})`,
    18 * entryBoost
  );
  halationCtx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(CRT_CX, CRT_CY, CRT_R, 0, Math.PI * 2);
  ctx.clip();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.85;
  ctx.drawImage(halationCanvas, 0, 0, 250, 250, 0, 0, PANEL_SIZE, PANEL_SIZE);
  ctx.restore();
}

/**
 * Draws the P1 Phosphor Horizontal Baseline Trace at y = 680 (`ROAD_EDGE_Y`),
 * including `rawLocalT ∈ [-0.45, 0.54]` cathode spot-killer expansion + RC overshoot ringing lock-in
 * seamless from #14's `(1000, 680)` corona discharge!
 */
function drawPhosphorBaseline(ctx, t, rawLocalT, pelicanLocalX, gag, isOutroThumbnail = false) {
  const entryEnv = isOutroThumbnail
    ? 0
    : rawLocalT > -0.45 && rawLocalT < 0.54
      ? smoothstep(-0.45, -0.04, rawLocalT) * (1 - smoothstep(0.0, 0.54, rawLocalT))
      : 0;
  const ringDecayT = Math.max(0, rawLocalT);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const buildSweep = (phaseMul = 1, ampScale = 1) => {
    const pts = [];
    const steps = 112;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const x = u * PANEL_SIZE;
      const edgePin = Math.sin(Math.PI * u);
      // Authentic RC transient overshoot & ringing lock-in during entry window
      const rcRing =
        entryEnv *
        72 *
        ampScale *
        Math.exp(-ringDecayT * 5.2 - u * 1.2) *
        Math.cos(u * 20 * phaseMul - rawLocalT * 56);
      const lissWave =
        gag.mix *
        18 *
        edgePin *
        Math.sin(u * 28 + t * 34 * phaseMul) *
        Math.cos(u * 12 - t * 21);
      const pllWave = gag.pllRing * 12 * edgePin * Math.sin(u * Math.PI * 5);
      const jitter =
        analogNoise(i * 3.1, t * 70) * (0.65 + entryEnv * 3.2 + gag.mix * 1.6) * edgePin;
      pts.push({ x, y: ROAD_EDGE_Y + rcRing + lissWave + pllWave + jitter });
    }
    return pts;
  };

  if (entryEnv > 0.01) {
    // Initial cathode warm-up bright unfocused spot expanding from (180, 680) across baseline
    const spotR = (1 - entryEnv * 0.4) * 46 * entryEnv;
    const spotG = ctx.createRadialGradient(140, ROAD_EDGE_Y, 1, 140, ROAD_EDGE_Y, spotR + 18);
    spotG.addColorStop(0, `rgba(245, 255, 248, ${(entryEnv * 0.85).toFixed(3)})`);
    spotG.addColorStop(0.35, `rgba(65, 255, 128, ${(entryEnv * 0.52).toFixed(3)})`);
    spotG.addColorStop(1, 'rgba(20, 200, 80, 0)');
    ctx.fillStyle = spotG;
    ctx.beginPath();
    ctx.arc(140, ROAD_EDGE_Y, spotR + 18, 0, Math.PI * 2);
    ctx.fill();

    const ghostA = buildSweep(1.35, -1.2);
    const ghostB = buildSweep(0.8, 0.75);
    strokePolylines(ctx, [ghostA, ghostB], `rgba(42, 255, 118, ${(entryEnv * 0.4).toFixed(3)})`, 3.0);
    strokePolylines(ctx, [ghostA, ghostB], `rgba(215, 255, 230, ${(entryEnv * 0.52).toFixed(3)})`, 1.1);
  }

  const mainSweep = [buildSweep(1.0, 1.0)];
  strokePolylines(ctx, mainSweep, 'rgba(24, 224, 88, 0.15)', 12);
  strokePolylines(ctx, mainSweep, 'rgba(57, 255, 122, 0.58)', 3.8);
  strokePolylines(ctx, mainSweep, 'rgba(228, 255, 238, 0.94)', 1.4);

  // High-voltage corona coupling arcs from (0, 680) welcoming #14's ionized shadow!
  if (entryEnv > 0.02 && pelicanLocalX > -145 && pelicanLocalX < 230) {
    const arcPolys = [];
    for (let a = 0; a < 3; a++) {
      const segs = [];
      const tx = clamp(pelicanLocalX + 96, 18, 195);
      const ty = ROAD_EDGE_Y - 32 - a * 36;
      for (let k = 0; k <= 8; k++) {
        const u = k / 8;
        segs.push({
          x: lerp(0, tx, u) + analogNoise(k + a * 11, t * 90) * 14 * Math.sin(Math.PI * u),
          y: lerp(ROAD_EDGE_Y, ty, u) + analogNoise(k * 2 + a * 7, t * 90) * 18 * Math.sin(Math.PI * u),
        });
      }
      arcPolys.push(segs);
    }
    strokePolylines(ctx, arcPolys, `rgba(57, 255, 122, ${(entryEnv * 0.62).toFixed(3)})`, 3.2);
    strokePolylines(ctx, arcPolys, `rgba(235, 255, 242, ${(entryEnv * 0.88).toFixed(3)})`, 1.2);
  }

  ctx.restore();
  return mainSweep;
}

/**
 * Composites the pre-baked Darkroom Volumetric Technician's Hand over `KNOB_XY_FREQ`
 * during Bar 2 (`localT 1.78..3.36s`) — zero cartoon lines, zero tutorial arrows!
 */
function drawTechnicianHand(ctx, kit, gag) {
  if (gag.handReach <= 0.01) return;

  const handTex = getBakedTechnicianHand(kit);
  const u = gag.handReach;
  const hx = lerp(1085, KNOB_XY_FREQ.x, u);
  const hy = lerp(1055, KNOB_XY_FREQ.y, u);
  const twistRot = (gag.knobAngle + 0.88) * 0.25 + gag.panicShake * 0.045;

  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(twistRot);
  ctx.drawImage(handTex.canvas, -140, -130);
  ctx.restore();
}

/**
 * Draws spherical CRT glass scanlines, 60Hz hum band, and a perspective-curved
 * Twin-Tube Lab Ceiling Fluorescent Fixture Reflection (NO `ctx.ellipse` primitive!).
 */
function drawCRTGlassOverlay(ctx, t, gag) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(CRT_CX, CRT_CY, CRT_R, 0, Math.PI * 2);
  ctx.clip();

  // Subtle magnetic-shield interference raster lines
  ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
  const yOff = (t * 24) % 4;
  for (let y = CRT_CY - CRT_R + yOff; y < CRT_CY + CRT_R; y += 4) {
    ctx.fillRect(CRT_CX - CRT_R, y, CRT_R * 2, 1.1);
  }

  // Rolling 60Hz AC power-supply hum bar
  const humY = CRT_CY - CRT_R + (((t * 115) % (CRT_R * 2 + 120)) - 60);
  const humGrad = ctx.createLinearGradient(0, humY - 45, 0, humY + 45);
  humGrad.addColorStop(0, 'rgba(57, 255, 122, 0)');
  humGrad.addColorStop(0.5, 'rgba(57, 255, 122, 0.032)');
  humGrad.addColorStop(1, 'rgba(57, 255, 122, 0)');
  ctx.fillStyle = humGrad;
  ctx.fillRect(CRT_CX - CRT_R, humY - 45, CRT_R * 2, 90);

  // Subtle top-of-screen vector mode readout etched inside CRT hood shadow
  ctx.font = '700 13px "PelicanMono", monospace';
  ctx.textAlign = 'center';
  if (gag.mix > 0.25) {
    ctx.fillStyle = 'rgba(188, 255, 212, 0.84)';
    ctx.fillText(
      'X:Y HARMONIC = 3 : 4   [LISSAJOUS PHASE UNLOCK]',
      CRT_CX,
      CRT_CY - CRT_R + 68
    );
  } else {
    ctx.fillStyle = 'rgba(92, 255, 148, 0.46)';
    ctx.fillText('CH1/CH2 LOCKED · 1:1 CONTINUOUS OSCILLOGRAM', CRT_CX, CRT_CY - CRT_R + 68);
  }

  // Spherical Dome Perspective-Warped Twin-Tube Ceiling Fluorescent Fixture Reflection!
  ctx.save();
  ctx.translate(CRT_CX - 138, CRT_CY - 158);
  ctx.rotate(-0.6);

  // Soft diffused housing hood reflection behind tubes
  const hoodG = ctx.createLinearGradient(0, -34, 0, 34);
  hoodG.addColorStop(0, 'rgba(210, 240, 224, 0)');
  hoodG.addColorStop(0.3, 'rgba(220, 248, 232, 0.045)');
  hoodG.addColorStop(0.7, 'rgba(210, 240, 224, 0.035)');
  hoodG.addColorStop(1, 'rgba(210, 240, 224, 0)');
  ctx.fillStyle = hoodG;
  ctx.beginPath();
  ctx.moveTo(-168, 18);
  ctx.quadraticCurveTo(0, -36, 168, 12);
  ctx.lineTo(156, 36);
  ctx.quadraticCurveTo(0, -6, -156, 40);
  ctx.closePath();
  ctx.fill();

  // Two curved fluorescent lamp tubes bowed along the spherical CRT glass curvature,
  // split in the middle by a dark metal ballast crossbar!
  for (const ty of [-8, 8]) {
    const tubeG = ctx.createLinearGradient(-155, 0, 155, 0);
    tubeG.addColorStop(0, 'rgba(235, 255, 244, 0)');
    tubeG.addColorStop(0.18, 'rgba(238, 255, 246, 0.13)');
    tubeG.addColorStop(0.47, 'rgba(242, 255, 248, 0.16)');
    tubeG.addColorStop(0.495, 'rgba(20, 40, 28, 0.02)'); // central metal louver/ballast gap!
    tubeG.addColorStop(0.52, 'rgba(242, 255, 248, 0.15)');
    tubeG.addColorStop(0.82, 'rgba(235, 255, 244, 0.11)');
    tubeG.addColorStop(1, 'rgba(235, 255, 244, 0)');
    ctx.strokeStyle = tubeG;
    ctx.lineWidth = 5.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-152, ty + 24);
    ctx.quadraticCurveTo(0, ty - 22, 152, ty + 18);
    ctx.stroke();
  }
  ctx.restore();

  // Secondary Fresnel glass rim sheen + subtle micro-wiping hairline arcs on bottom-right dome
  ctx.strokeStyle = 'rgba(182, 242, 206, 0.085)';
  ctx.lineWidth = 5.5;
  ctx.beginPath();
  ctx.arc(CRT_CX, CRT_CY, CRT_R - 16, Math.PI * 0.13, Math.PI * 0.41);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(220, 255, 235, 0.04)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.arc(CRT_CX - 18, CRT_CY - 12, CRT_R - 48, -Math.PI * 0.84, -Math.PI * 0.56);
  ctx.stroke();

  ctx.restore();
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

  const ctx = slot.g2d.drawingContext;
  ctx.save();
  ctx.clearRect(0, 0, PANEL_SIZE, PANEL_SIZE);

  const gag = getGagState(localT, isOutroThumbnail);

  // 1. Static baked 1950s Cold-War front panel + riveted brass nameplate + edge-lit Lucite graticule
  const chassis = getBakedOscilloscopeChassis(kit, scene);
  ctx.drawImage(chassis.canvas, 0, 0);

  const rawLocalT = isOutroThumbnail ? localT : (params.rawLocalT ?? (t - scene.t0));
  const entryEnv = isOutroThumbnail
    ? 0
    : rawLocalT > -0.45 && rawLocalT < 0.54
      ? smoothstep(-0.45, -0.04, rawLocalT) * (1 - smoothstep(0.0, 0.54, rawLocalT))
      : 0;

  // 2. Dynamic pilot jewel lamp, inertial micro-ammeter needle & Bakelite rotary knobs
  drawDynamicPanelIndicators(ctx, t, localT, gag);

  // 3. P1 Phosphor Baseline Trace at y = 680 (with cathode spot lock-in & RC ringing)
  const mainSweep = drawPhosphorBaseline(ctx, t, rawLocalT, pelicanLocalX, gag, isOutroThumbnail);

  // 4. Single-Beam Continuous P1 Phosphor Pelican + 6-Step Exponential Persistence + Glass Halation
  if (pelicanLocalX > -250 && pelicanLocalX < PANEL_SIZE + 250) {
    const entryBoost = 1 + 0.375 * entryEnv;
    const snapElastic = 1 + gag.pllRing * 0.085;

    const currRig = computePelicanRig({
      x: pelicanLocalX,
      y: ROAD_EDGE_Y,
      pedalAngle,
      scale: snapElastic,
      slope: 0,
      speedScale,
      poseMode: 'normal',
      lissajousMix: 0,
      time: t,
    });

    const jitterAmp = (0.78 + gag.mix * 1.85) * entryBoost;
    const currVec = buildVectorPelicanTraces(
      currRig,
      t,
      gag.mix,
      gag.pllRing,
      jitterAmp,
      true
    );

    // 4a. True 250x250 Dual-Gaussian Lead-Glass Halation Fog behind crisp beam
    renderGlassHalation(ctx, mainSweep, currVec.polylines, entryBoost);

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const panelVx = (PANEL_SIZE / 6.0) * (isOutroThumbnail ? 0.85 : speedScale);

    // 4b. 6-Step Dual-Decay Exponential P1 (`Zn2SiO4:Mn`) Phosphor Persistence Trail!
    const afterglowSteps = [
      { dt: 0.22, alpha: 0.045, width: 6.4, col: '10, 148, 52', driftY: -1.8 },
      { dt: 0.17, alpha: 0.075, width: 5.4, col: '14, 172, 62', driftY: -1.3 },
      { dt: 0.13, alpha: 0.12, width: 4.5, col: '20, 198, 76', driftY: -0.9 },
      { dt: 0.09, alpha: 0.19, width: 3.7, col: '30, 226, 90', driftY: -0.5 },
      { dt: 0.055, alpha: 0.29, width: 3.0, col: '44, 246, 108', driftY: -0.2 },
      { dt: 0.025, alpha: 0.42, width: 2.4, col: '62, 255, 126', driftY: 0 },
    ];

    ctx.save();
    ctx.beginPath();
    ctx.arc(CRT_CX, CRT_CY, CRT_R, 0, Math.PI * 2);
    ctx.clip();
    for (const step of afterglowSteps) {
      const histT = t - step.dt;
      const histLocalT = clamp(rawLocalT - step.dt, 0, 6.0);
      const histGag = getGagState(histLocalT, isOutroThumbnail);
      const histX = pelicanLocalX - step.dt * panelVx;
      const histPedal = pedalAngle - (step.dt / BEAT_SEC) * Math.PI;

      const histRig = computePelicanRig({
        x: histX,
        y: ROAD_EDGE_Y + step.driftY,
        pedalAngle: histPedal,
        scale: 1 + histGag.pllRing * 0.085,
        slope: 0,
        speedScale,
        poseMode: 'normal',
        lissajousMix: 0,
        time: histT,
      });

      const histVec = buildVectorPelicanTraces(
        histRig,
        histT,
        histGag.mix,
        histGag.pllRing,
        0.5 + histGag.mix * 1.0,
        false
      );
      strokePolylines(
        ctx,
        histVec.polylines,
        `rgba(${step.col}, ${step.alpha})`,
        step.width
      );
    }
    ctx.restore();

    // 4c. 5% Alpha Ultra-Thin Unblanked High-Speed Retrace Flyback Ghost Lines!
    strokePolylines(ctx, currVec.retraceLines, 'rgba(92, 255, 148, 0.068)', 0.75);

    // 4d. Physical `I ∝ 1/||v_beam||` Velocity-Inverse Electron-Beam Brightness & Width!
    // Outer soft emerald phosphor envelope across full closed trace
    strokePolylines(ctx, currVec.polylines, 'rgba(34, 238, 98, 0.26)', 6.2 * entryBoost);

    // Fast long sweeps: thin, crisp emerald green
    strokePolylines(ctx, currVec.fastSegs, 'rgba(52, 250, 116, 0.68)', 2.4);
    strokePolylines(ctx, currVec.fastSegs, 'rgba(195, 255, 216, 0.78)', 0.95);

    // Medium velocity curves: balanced P1 phosphor green + bright core
    strokePolylines(ctx, currVec.medSegs, 'rgba(62, 255, 126, 0.82)', 3.3);
    strokePolylines(ctx, currVec.medSegs, 'rgba(228, 255, 238, 0.92)', 1.35);

    // Slow high-curvature turnarounds & joints: charge accumulation -> thick overexposed white-mint core!
    strokePolylines(ctx, currVec.slowSegs, 'rgba(82, 255, 142, 0.92)', 4.5);
    strokePolylines(ctx, currVec.slowSegs, 'rgba(246, 255, 250, 0.98)', 2.05);

    // Cathode dwell hot-dots at sharp inflection vertices
    ctx.fillStyle = 'rgba(244, 255, 248, 0.94)';
    ctx.beginPath();
    for (const d of currVec.dwellDots) {
      ctx.moveTo(d.x + 2.5, d.y);
      ctx.arc(d.x, d.y, 2.5, 0, Math.PI * 2);
    }
    ctx.fill();

    // Analog CRT Overexposed Beam-Dwell Hotspots at 3:4 Lissajous Turnarounds & Nodal Crossings
    if (currVec.hotspots && currVec.hotspots.length > 0) {
      for (const hs of currVec.hotspots) {
        const k = hs.intensity;
        ctx.fillStyle = `rgba(42, 255, 114, ${(0.18 * k).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(hs.x, hs.y, 18 * k + 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(148, 255, 188, ${(0.42 * k).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(hs.x, hs.y, 7.5 * k + 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(248, 255, 252, ${(0.96 * k).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(hs.x, hs.y, 3.2 * k + 1.0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Strong-Beat localT = 3.00s Crisp PLL Phase-Lock Flash Flare
    if (gag.snapRing > 0 && gag.snapRing < 0.45) {
      const fa = (1 - gag.snapRing / 0.45) * 0.88;
      const flareR = 185 * (1 - gag.snapRing * 0.6);
      const cx = pelicanLocalX;
      const cy = ROAD_EDGE_Y - 98;
      ctx.strokeStyle = `rgba(235, 255, 242, ${fa.toFixed(3)})`;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(cx - flareR, cy);
      ctx.lineTo(cx + flareR, cy);
      ctx.moveTo(cx, cy - flareR * 0.62);
      ctx.lineTo(cx, cy + flareR * 0.62);
      ctx.stroke();
    }

    ctx.restore();
  }

  // 5. Spherical CRT Glass Scanlines, 60Hz Hum & Twin-Tube Lab Lamp Dome Reflection
  drawCRTGlassOverlay(ctx, t, gag);

  // 6. Bar-2 Volumetric Darkroom Technician's Hand twisting `X-Y FREQ` knob
  drawTechnicianHand(ctx, kit, gag);

  // 7. Preserve Outro 7x3 Gallery Thumbnail Strip ONLY (`!isOutroThumbnail` uses native brass nameplate!)
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(10, 16, 12, 0.82)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.strokeStyle = '#39ff7a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, PANEL_SIZE - 96);
    ctx.lineTo(PANEL_SIZE, PANEL_SIZE - 96);
    ctx.stroke();
    ctx.fillStyle = '#dbffe6';
    ctx.font = '700 48px "PelicanMono", "PelicanSerif", monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} ${scene.zh}`, 36, PANEL_SIZE - 48);
  }

  ctx.restore();
}
