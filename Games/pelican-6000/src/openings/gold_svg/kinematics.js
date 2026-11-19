// src/openings/gold_svg/kinematics.js
// Target-First Reverse IK, Organic Muscular Arm Silhouettes, Rolled Sleeves & Layered Grip Hands
// Calibrated 1:1 in the canonical forge coordinate system (`500x650` space):
// - Guarantees 0.0px flush hammer-face-to-iron-billet contact on EVERY Left (`(236, 718)`) & Right (`(266, 718)`) strike!

import { el, setAttrs } from './defs.js';

export const BILLET_TOP_Y = 718.0;
export const LEFT_STRIKE_X = 236.0;
export const RIGHT_STRIKE_X = 266.0;

// Exact 10 hammer strike instants (`0.449s .. 3.548s`)
export const STRIKE_EVENTS = [
  { t: 0.449, hand: 'L', power: 0.90 },
  { t: 0.805, hand: 'R', power: 1.00 },
  { t: 1.164, hand: 'L', power: 0.92 },
  { t: 1.520, hand: 'R', power: 1.00 },
  { t: 1.877, hand: 'L', power: 0.90 },
  { t: 2.234, hand: 'R', power: 1.00 },
  { t: 2.591, hand: 'L', power: 0.92 },
  { t: 2.950, hand: 'R', power: 1.00 },
  { t: 3.307, hand: 'L', power: 0.94 },
  { t: 3.548, hand: 'R', power: 1.08 },
];

const LEFT_TIMES = STRIKE_EVENTS.filter((e) => e.hand === 'L').map((e) => e.t);
const RIGHT_TIMES = STRIKE_EVENTS.filter((e) => e.hand === 'R').map((e) => e.t);

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad) {
  return (rad * 180) / Math.PI;
}

function easeOutCubic(t) {
  const u = 1 - clamp(t, 0, 1);
  return 1 - u * u * u;
}

function easeInOutCubic(t) {
  const u = clamp(t, 0, 1);
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

export function rotatePoint(pt, pivot, deg) {
  const rad = degToRad(deg);
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const dx = pt.x - pivot.x;
  const dy = pt.y - pivot.y;
  return {
    x: pivot.x + dx * c - dy * s,
    y: pivot.y + dx * s + dy * c,
  };
}

export function seededRng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Analytical planar 2-bone inverse kinematics solver (ported from `v3_woodcut/svg_util.js`). */
export function solveTwoBoneIK(root, target, len1, len2, bendDir = 1) {
  const dx = target.x - root.x;
  const dy = target.y - root.y;
  const rawDist = Math.hypot(dx, dy) || 1e-4;
  const minD = Math.abs(len1 - len2) + 1.5;
  const maxD = len1 + len2 - 0.8;
  const d = clamp(rawDist, minD, maxD);

  const ux = dx / rawDist;
  const uy = dy / rawDist;
  const clampedTarget = {
    x: root.x + ux * d,
    y: root.y + uy * d,
  };

  const cosAlpha = clamp((len1 * len1 + d * d - len2 * len2) / (2 * len1 * d), -1, 1);
  const sinAlpha = Math.sqrt(Math.max(0, 1 - cosAlpha * cosAlpha)) * bendDir;
  const baseAngle = Math.atan2(uy, ux);
  const cosB = Math.cos(baseAngle);
  const sinB = Math.sin(baseAngle);

  const dirX = cosB * cosAlpha - sinB * sinAlpha;
  const dirY = sinB * cosAlpha + cosB * sinAlpha;

  const elbow = {
    x: root.x + dirX * len1,
    y: root.y + dirY * len1,
  };

  return { shoulder: { ...root }, elbow, wrist: clampedTarget };
}

function perpNormal(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: -dy / len, y: dx / len, ux: dx / len, uy: dy / len };
}

/** Seamless muscular arm silhouette wrapping shoulder -> elbow -> wrist (`v3_woodcut`). */
export function organicArmGeometry(p0, p1, p2, r0, r1, r2) {
  const n01 = perpNormal(p0, p1);
  const n12 = perpNormal(p1, p2);

  const cross = (p1.x - p0.x) * (p2.y - p1.y) - (p1.y - p0.y) * (p2.x - p1.x);
  const outerSign = cross >= 0 ? 1 : -1;

  const rOuter = r1 * 0.96;
  const rInner = r1 * 0.84;
  const rA = outerSign > 0 ? rOuter : rInner;
  const rB = outerSign > 0 ? rInner : rOuter;

  const e0A = { x: lerp(p0.x, p1.x, 0.72) + n01.x * rA, y: lerp(p0.y, p1.y, 0.72) + n01.y * rA };
  const e0B = { x: lerp(p0.x, p1.x, 0.72) - n01.x * rB, y: lerp(p0.y, p1.y, 0.72) - n01.y * rB };
  const e2A = { x: lerp(p1.x, p2.x, 0.28) + n12.x * rA, y: lerp(p1.y, p2.y, 0.28) + n12.y * rA };
  const e2B = { x: lerp(p1.x, p2.x, 0.28) - n12.x * rB, y: lerp(p1.y, p2.y, 0.28) - n12.y * rB };

  let nx = n01.x + n12.x;
  let ny = n01.y + n12.y;
  const nLen = Math.hypot(nx, ny);
  if (nLen < 1e-3) {
    nx = n01.x;
    ny = n01.y;
  } else {
    nx /= nLen;
    ny /= nLen;
  }
  const dot = clamp(n01.x * nx + n01.y * ny, 0.86, 1.0);
  const erA = rA / dot;
  const erB = rB / dot;

  const sA = { x: p0.x + n01.x * r0, y: p0.y + n01.y * r0 };
  const sB = { x: p0.x - n01.x * r0, y: p0.y - n01.y * r0 };
  const eCornerA = { x: p1.x + nx * erA, y: p1.y + ny * erA };
  const eCornerB = { x: p1.x - nx * erB, y: p1.y - ny * erB };
  const wA = { x: p2.x + n12.x * r2, y: p2.y + n12.y * r2 };
  const wB = { x: p2.x - n12.x * r2, y: p2.y - n12.y * r2 };

  const upMidA = {
    x: lerp(sA.x, e0A.x, 0.48) + n01.x * (outerSign > 0 ? 1.4 : 3.4),
    y: lerp(sA.y, e0A.y, 0.48) + n01.y * (outerSign > 0 ? 1.4 : 3.4),
  };
  const upMidB = {
    x: lerp(sB.x, e0B.x, 0.48) - n01.x * (outerSign > 0 ? 3.4 : 1.4),
    y: lerp(sB.y, e0B.y, 0.48) - n01.y * (outerSign > 0 ? 3.4 : 1.4),
  };
  const loMidA = {
    x: lerp(e2A.x, wA.x, 0.36) + n12.x * 3.2,
    y: lerp(e2A.y, wA.y, 0.36) + n12.y * 3.2,
  };
  const loMidB = {
    x: lerp(e2B.x, wB.x, 0.36) - n12.x * 3.2,
    y: lerp(e2B.y, wB.y, 0.36) - n12.y * 3.2,
  };

  const capW = { x: p2.x + n12.ux * (r2 * 0.55), y: p2.y + n12.uy * (r2 * 0.55) };
  const capS = { x: p0.x - n01.ux * (r0 * 0.68), y: p0.y - n01.uy * (r0 * 0.68) };

  const outlinePath = [
    `M ${sA.x.toFixed(1)} ${sA.y.toFixed(1)}`,
    `Q ${upMidA.x.toFixed(1)} ${upMidA.y.toFixed(1)} ${e0A.x.toFixed(1)} ${e0A.y.toFixed(1)}`,
    `Q ${eCornerA.x.toFixed(1)} ${eCornerA.y.toFixed(1)} ${e2A.x.toFixed(1)} ${e2A.y.toFixed(1)}`,
    `Q ${loMidA.x.toFixed(1)} ${loMidA.y.toFixed(1)} ${wA.x.toFixed(1)} ${wA.y.toFixed(1)}`,
    `Q ${capW.x.toFixed(1)} ${capW.y.toFixed(1)} ${wB.x.toFixed(1)} ${wB.y.toFixed(1)}`,
    `Q ${loMidB.x.toFixed(1)} ${loMidB.y.toFixed(1)} ${e2B.x.toFixed(1)} ${e2B.y.toFixed(1)}`,
    `Q ${eCornerB.x.toFixed(1)} ${eCornerB.y.toFixed(1)} ${e0B.x.toFixed(1)} ${e0B.y.toFixed(1)}`,
    `Q ${upMidB.x.toFixed(1)} ${upMidB.y.toFixed(1)} ${sB.x.toFixed(1)} ${sB.y.toFixed(1)}`,
    `Q ${capS.x.toFixed(1)} ${capS.y.toFixed(1)} ${sA.x.toFixed(1)} ${sA.y.toFixed(1)} Z`,
  ].join(' ');

  const muscleLinePath = `M ${lerp(p1.x, e2A.x, 0.35).toFixed(1)} ${lerp(p1.y, e2A.y, 0.35).toFixed(1)} Q ${lerp(p1.x, p2.x, 0.52).toFixed(1)} ${lerp(p1.y, p2.y, 0.52).toFixed(1)} ${lerp(p2.x, wA.x, 0.25).toFixed(1)} ${lerp(p2.y, wA.y, 0.25).toFixed(1)}`;

  return { outlinePath, muscleLinePath };
}

/** Rolled work-shirt sleeve & cuff tracking upper arm bone `p0 -> p1`. */
export function rolledSleeveGeometry(p0, p1, frac, rShoulder, rCuff) {
  const n = perpNormal(p0, p1);
  const end = { x: lerp(p0.x, p1.x, frac), y: lerp(p0.y, p1.y, frac) };
  const sA = { x: p0.x + n.x * rShoulder, y: p0.y + n.y * rShoulder };
  const sB = { x: p0.x - n.x * rShoulder, y: p0.y - n.y * rShoulder };
  const cA = { x: end.x + n.x * rCuff, y: end.y + n.y * rCuff };
  const cB = { x: end.x - n.x * rCuff, y: end.y - n.y * rCuff };
  const capS = { x: p0.x - n.ux * (rShoulder * 0.85), y: p0.y - n.uy * (rShoulder * 0.85) };

  const bodyPath = [
    `M ${sA.x.toFixed(1)} ${sA.y.toFixed(1)}`,
    `L ${cA.x.toFixed(1)} ${cA.y.toFixed(1)}`,
    `L ${cB.x.toFixed(1)} ${cB.y.toFixed(1)}`,
    `L ${sB.x.toFixed(1)} ${sB.y.toFixed(1)}`,
    `Q ${capS.x.toFixed(1)} ${capS.y.toFixed(1)} ${sA.x.toFixed(1)} ${sA.y.toFixed(1)} Z`,
  ].join(' ');

  const rollBack = { x: end.x - n.ux * 7.2, y: end.y - n.uy * 7.2 };
  const rA = { x: rollBack.x + n.x * (rCuff + 1.8), y: rollBack.y + n.y * (rCuff + 1.8) };
  const rB = { x: rollBack.x - n.x * (rCuff + 1.8), y: rollBack.y - n.y * (rCuff + 1.8) };
  const oA = { x: end.x + n.x * (rCuff + 2.0), y: end.y + n.y * (rCuff + 2.0) };
  const oB = { x: end.x - n.x * (rCuff + 2.0), y: end.y - n.y * (rCuff + 2.0) };

  const cuffPath = `M ${rA.x.toFixed(1)} ${rA.y.toFixed(1)} L ${oA.x.toFixed(1)} ${oA.y.toFixed(1)} L ${oB.x.toFixed(1)} ${oB.y.toFixed(1)} L ${rB.x.toFixed(1)} ${rB.y.toFixed(1)} Z`;
  return { bodyPath, cuffPath };
}

/** Shaft-locked 2-layer gripping hand (`backGroup` behind shaft, `frontGroup` 4 curled fingers + thumb over shaft). */
export function buildGoldGripHand(skinFill, inkStroke, scale = 0.72, flipY = false) {
  const backGroup = el('g');
  const frontGroup = el('g');
  const fy = flipY ? -1 : 1;
  const s = (v) => (v * scale).toFixed(1);
  const sy = (v) => (v * scale * fy).toFixed(1);

  el('path', {
    d: `M ${s(-13)} ${sy(-9.5)} Q ${s(2)} ${sy(-11.5)} ${s(16)} ${sy(-5.5)} Q ${s(18)} ${sy(3.5)} ${s(12)} ${sy(10.0)} Q ${s(0)} ${sy(12.0)} ${s(-13)} ${sy(9.0)} Z`,
    fill: skinFill,
    stroke: inkStroke,
    'stroke-width': (2.2 * scale).toFixed(2),
    'stroke-linejoin': 'round',
  }, backGroup);

  const fingers = [-6.8, -0.2, 6.2, 12.0];
  for (let i = 0; i < fingers.length; i += 1) {
    const fx = fingers[i];
    const w = i === 3 ? 5.6 : 6.6;
    const tip = i === 1 ? 8.2 : i === 3 ? 5.6 : 7.2;
    el('path', {
      d: `M ${s(fx - w * 0.45)} ${sy(-5.5)} L ${s(fx - w * 0.42)} ${sy(tip)} Q ${s(fx)} ${sy(tip + 2.2)} ${s(fx + w * 0.45)} ${sy(tip)} L ${s(fx + w * 0.45)} ${sy(-5.5)} Z`,
      fill: skinFill,
      stroke: inkStroke,
      'stroke-width': (2.0 * scale).toFixed(2),
      'stroke-linejoin': 'round',
    }, frontGroup);
  }

  // Opposing thumb clamping across knuckles
  el('path', {
    d: `M ${s(-13)} ${sy(3.8)} Q ${s(-8)} ${sy(10.8)} ${s(2.5)} ${sy(10.4)} Q ${s(5.5)} ${sy(6.2)} ${s(-2.5)} ${sy(4.2)} Z`,
    fill: skinFill,
    stroke: inkStroke,
    'stroke-width': (2.0 * scale).toFixed(2),
    'stroke-linejoin': 'round',
  }, frontGroup);

  function updatePose(pos, deg) {
    const tx = `translate(${pos.x.toFixed(1)} ${pos.y.toFixed(1)}) rotate(${deg.toFixed(2)})`;
    setAttrs(backGroup, { transform: tx });
    setAttrs(frontGroup, { transform: tx });
  }

  return { backGroup, frontGroup, updatePose };
}

/**
 * Continuous bracketed strike curve (`0.0 = high windup apex`, `0.18 = guard`, `1.0 = exact flush contact on iron bar!`).
 * Guarantees `ratio === 1.0` at every strike timestamp + a crisp contact dwell window (`dwellSec`) so the eye
 * sees the hammer flatten squarely against the glowing billet on every single beat!
 */
function evalContinuousStrikeRatio(realT, hitTimes, guardRatio, dwellSec, downWindowSec) {
  // 1. Before first strike (`realT <= hitTimes[0]`)
  const firstT = hitTimes[0];
  if (realT <= firstT) {
    const coilStart = Math.max(0.02, firstT - downWindowSec - 0.24);
    const apexT = firstT - downWindowSec;
    if (realT <= coilStart) return { ratio: guardRatio, impactAge: -1 };
    if (realT < apexT) {
      const u = easeInOutCubic((realT - coilStart) / Math.max(0.05, apexT - coilStart));
      return { ratio: lerp(guardRatio, 0.0, u), impactAge: -1 };
    }
    const downU = clamp((realT - apexT) / downWindowSec, 0, 1);
    return { ratio: Math.pow(downU, 2.35), impactAge: realT >= firstT - 0.004 ? 0 : -1 };
  }

  // 2. Between consecutive strikes `prevT .. nextT`
  for (let i = 0; i < hitTimes.length; i += 1) {
    const prevT = hitTimes[i];
    const nextT = i + 1 < hitTimes.length ? hitTimes[i + 1] : null;
    if (nextT === null || realT <= nextT) {
      const dt = realT - prevT;
      if (dt <= dwellSec) {
        // Solid iron-on-iron contact dwell right on the glowing billet (`y = 718`)!
        return { ratio: 1.0, impactAge: dt };
      }

      if (nextT === null) {
        // After final strike -> crisp elastic rebound back to guard pose
        const rebU = easeOutCubic(clamp((dt - dwellSec) / 0.28, 0, 1));
        return { ratio: lerp(1.0, guardRatio, rebU), impactAge: dt };
      }

      const span = Math.max(0.18, nextT - prevT - dwellSec);
      const u = clamp((dt - dwellSec) / span, 0, 1);
      // First 56% of cycle: rebound & lift smoothly to high overhead apex (`ratio = 0.0`)
      // Final 44% of cycle: explosive gravity-assisted whip down to `ratio = 1.0` on `nextT`!
      const apexFrac = 0.56;
      if (u < apexFrac) {
        const liftU = easeOutCubic(u / apexFrac);
        return { ratio: 1.0 - liftU, impactAge: dt };
      }
      const downU = clamp((u - apexFrac) / (1 - apexFrac), 0, 1);
      return { ratio: Math.pow(downU, 2.4), impactAge: dt };
    }
  }

  return { ratio: guardRatio, impactAge: -1 };
}

/** Master per-frame kinematics & target-first IK solver (called ONCE per frame in `scene.js`). */
export function computeGoldForgePose(realT) {
  const leftCurve = evalContinuousStrikeRatio(realT, LEFT_TIMES, 0.22, 0.032, 0.16);
  const rightCurve = evalContinuousStrikeRatio(realT, RIGHT_TIMES, 0.08, 0.036, 0.19);

  const beta = leftCurve.ratio;   // 0 = high coil, 0.22 = grid guard, 1.0 = FLUSH ON IRON BAR (236, 718)!
  const alpha = rightCurve.ratio; // 0 = high coil, 0.08 = grid guard, 1.0 = FLUSH ON IRON BAR (266, 718)!

  const leftFlash =
    leftCurve.impactAge >= 0 && leftCurve.impactAge < 0.15
      ? Math.pow(1 - leftCurve.impactAge / 0.15, 1.6) * 0.9
      : 0;
  const rightFlash =
    rightCurve.impactAge >= 0 && rightCurve.impactAge < 0.18
      ? Math.pow(1 - rightCurve.impactAge / 0.18, 1.5) * 1.15
      : 0;

  const flash = Math.max(leftFlash, rightFlash);
  const anvilDipY = leftFlash * 2.2 + rightFlash * 3.8;
  const billetSurfaceY = BILLET_TOP_Y + anvilDipY;

  // ============================================================================
  // 1. LEFT MASTER BLACKSMITH TARGET-FIRST REVERSE IK (`0.0px` contact at `beta = 1`!)
  // ============================================================================
  // Local 3D square hammer head has `(0, 0)` at `headCenter` and bottom striking face at `(0, +12)`.
  // At `beta = 1.0`: `hammerDeg = +8.0°` -> rotated `(0, +12)` is `(-1.67, +11.88)`, so setting
  // `impactHeadCenter = (236 + 12*sin(8°), billetSurfaceY - 12*cos(8°))` places the striking face
  // at EXACTLY `(236.0, billetSurfaceY)`!
  const leftWaist = { x: 122, y: 704 };
  const leftTorsoDeg = lerp(-1.5, 7.2, beta);
  const leftShoulderBase = rotatePoint({ x: 94, y: 622 }, leftWaist, leftTorsoDeg);
  const leftShoulder = {
    x: leftShoulderBase.x + beta * 3.5,
    y: leftShoulderBase.y + beta * 2.5,
  };

  const apexHammerDeg = -44.0;
  const impactHammerDeg = 8.0;
  const hammerDeg = lerp(apexHammerDeg, impactHammerDeg, Math.pow(beta, 0.92));
  const hRad = degToRad(hammerDeg);

  const apexHeadCenter = { x: 208.0, y: 602.0 };
  const impactHeadCenter = {
    x: LEFT_STRIKE_X + 12.0 * Math.sin(degToRad(impactHammerDeg)),
    y: billetSurfaceY - 12.0 * Math.cos(degToRad(impactHammerDeg)),
  };

  const leftBow = Math.sin(beta * Math.PI);
  const headCenter = {
    x: lerp(apexHeadCenter.x, impactHeadCenter.x, beta) + leftBow * 8.0,
    y: lerp(apexHeadCenter.y, impactHeadCenter.y, beta) - leftBow * 10.0,
  };

  const HANDLE_GRIP_DIST = 52.0;
  const desiredLeftWrist = {
    x: headCenter.x - Math.cos(hRad) * HANDLE_GRIP_DIST,
    y: headCenter.y - Math.sin(hRad) * HANDLE_GRIP_DIST,
  };

  const leftArmIK = solveTwoBoneIK(leftShoulder, desiredLeftWrist, 60, 62, 1);
  // Re-anchor hammer head from `leftArmIK.wrist` (since reach is 122 > 110, `clampedTarget === desiredLeftWrist` -> 0.0px error!)
  const finalLeftHead = {
    x: leftArmIK.wrist.x + Math.cos(hRad) * HANDLE_GRIP_DIST,
    y: leftArmIK.wrist.y + Math.sin(hRad) * HANDLE_GRIP_DIST,
  };

  // ============================================================================
  // 2. RIGHT STRIKER BLACKSMITH TARGET-FIRST REVERSE IK (`0.0px` contact at `alpha = 1`!)
  // ============================================================================
  // Local heavy 3D sledgehammer has `(0, 0)` at `sledgeCenter`, `+X` from butt toward head,
  // and flat striking cheek at local `(0, -16)`.
  // Counter-clockwise swing from `234°` (high guard `(286, 504)`) down to `175°` (horizontal smash!):
  // At `175°`, local `(0, -16)` rotates to `(+16*sin(175°), -16*cos(175°))` -> bottom face lands at
  // EXACTLY `(266.0, billetSurfaceY)`!
  const rightWaist = { x: 392, y: 704 };
  const rightTorsoDeg = lerp(2.2, -13.0, alpha);
  const rightHipShiftX = lerp(1.5, -8.0, alpha);
  const rightHipShiftY = lerp(0.0, 13.5, alpha);

  const leadShoulderRot = rotatePoint({ x: 356, y: 614 }, rightWaist, rightTorsoDeg);
  const trailShoulderRot = rotatePoint({ x: 432, y: 622 }, rightWaist, rightTorsoDeg);
  const leadShoulder = {
    x: leadShoulderRot.x + rightHipShiftX,
    y: leadShoulderRot.y + rightHipShiftY,
  };
  const trailShoulder = {
    x: trailShoulderRot.x + rightHipShiftX,
    y: trailShoulderRot.y + rightHipShiftY,
  };

  const apexSledgeDeg = 234.0;
  const impactSledgeDeg = 175.0;
  const sledgeDeg = lerp(apexSledgeDeg, impactSledgeDeg, Math.pow(alpha, 0.94));
  const sRad = degToRad(sledgeDeg);

  const apexSledgeCenter = { x: 286.0, y: 504.0 };
  const impactSledgeCenter = {
    x: RIGHT_STRIKE_X - 16.0 * Math.sin(degToRad(impactSledgeDeg)),
    y: billetSurfaceY + 16.0 * Math.cos(degToRad(impactSledgeDeg)),
  };

  const rightBow = Math.sin(alpha * Math.PI);
  const sledgeCenter = {
    x: lerp(apexSledgeCenter.x, impactSledgeCenter.x, alpha) - rightBow * 24.0,
    y: lerp(apexSledgeCenter.y, impactSledgeCenter.y, alpha) - rightBow * 10.0,
  };

  const frontDist = lerp(102.0, 82.0, alpha);
  const trailDist = lerp(164.0, 138.0, alpha);
  const frontGrip = {
    x: sledgeCenter.x - Math.cos(sRad) * frontDist,
    y: sledgeCenter.y - Math.sin(sRad) * frontDist,
  };
  const trailGrip = {
    x: sledgeCenter.x - Math.cos(sRad) * trailDist,
    y: sledgeCenter.y - Math.sin(sRad) * trailDist,
  };

  const leadArmIK = solveTwoBoneIK(leadShoulder, frontGrip, 54, 53, -1);
  const trailArmIK = solveTwoBoneIK(trailShoulder, trailGrip, 56, 56, 1);

  const rightSwoosh = alpha > 0.22 && alpha < 0.99 && rightCurve.impactAge !== 0 ? Math.sin(alpha * Math.PI) * 0.85 : 0;
  const leftSwoosh = beta > 0.30 && beta < 0.99 && leftCurve.impactAge !== 0 ? Math.sin(beta * Math.PI) * 0.68 : 0;

  return {
    realT,
    beta,
    alpha,
    flash,
    leftFlash,
    rightFlash,
    anvilDipY,
    billetSurfaceY,
    left: {
      torsoDeg: leftTorsoDeg,
      armIK: leftArmIK,
      headCenter: finalLeftHead,
      hammerDeg,
      swoosh: leftSwoosh,
    },
    right: {
      torsoDeg: rightTorsoDeg,
      hipShiftX: rightHipShiftX,
      hipShiftY: rightHipShiftY,
      leadArmIK,
      trailArmIK,
      frontGrip: leadArmIK.wrist,
      trailGrip: trailArmIK.wrist,
      sledgeCenter,
      sledgeDeg,
      swoosh: rightSwoosh,
    },
  };
}
