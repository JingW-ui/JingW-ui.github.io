// src/fusion/forge_kinematics.js
// Deterministic 2-bone IK & alternating two-craftsman blacksmith kinematics solver,
// calibrated to the timeline audio offset (+0.125s).

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function easeOutCubic(t) {
  const u = 1 - clamp(t, 0, 1);
  return 1 - u * u * u;
}

export function easeInCubic(t) {
  const u = clamp(t, 0, 1);
  return u * u * u;
}

export function easeInOutCubic(t) {
  const u = clamp(t, 0, 1);
  return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
}

export function easeOutQuad(t) {
  const u = clamp(t, 0, 1);
  return 1 - (1 - u) * (1 - u);
}

export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad) {
  return (rad * 180) / Math.PI;
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

export function solveTwoBoneIK(root, target, len1, len2, bendDir = 1) {
  const dx = target.x - root.x;
  const dy = target.y - root.y;
  const rawDist = Math.hypot(dx, dy) || 1e-4;
  const minD = Math.abs(len1 - len2) + 1.5;
  const maxD = len1 + len2 - 1.0;
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

  return {
    shoulder: { ...root },
    elbow: { x: root.x + dirX * len1, y: root.y + dirY * len1 },
    wrist: clampedTarget,
  };
}

function perpNormal(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: -dy / len, y: dx / len, ux: dx / len, uy: dy / len };
}

export function traceOrganicArmPath(ctx, p0, p1, p2, r0, r1, r2) {
  const n01 = perpNormal(p0, p1);
  const n12 = perpNormal(p1, p2);
  const cross = (p1.x - p0.x) * (p2.y - p1.y) - (p1.y - p0.y) * (p2.x - p1.x);
  const outerSign = cross >= 0 ? 1 : -1;

  const rOuter = r1 * 0.94;
  const rInner = r1 * 0.80;
  const rA = outerSign > 0 ? rOuter : rInner;
  const rB = outerSign > 0 ? rInner : rOuter;

  const e0A = { x: lerp(p0.x, p1.x, 0.74) + n01.x * rA, y: lerp(p0.y, p1.y, 0.74) + n01.y * rA };
  const e0B = { x: lerp(p0.x, p1.x, 0.72) - n01.x * rB, y: lerp(p0.y, p1.y, 0.72) - n01.y * rB };
  const e2A = { x: lerp(p1.x, p2.x, 0.24) + n12.x * rA, y: lerp(p1.y, p2.y, 0.24) + n12.y * rA };
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
  const dot = clamp(n01.x * nx + n01.y * ny, 0.78, 1.0);
  const erA = rA / dot;
  const erB = rB / dot;

  const sA = { x: p0.x + n01.x * r0, y: p0.y + n01.y * r0 };
  const sB = { x: p0.x - n01.x * r0, y: p0.y - n01.y * r0 };
  const eCornerA = { x: p1.x + nx * erA, y: p1.y + ny * erA };
  const eCornerB = { x: p1.x - nx * erB, y: p1.y - ny * erB };
  const wA = { x: p2.x + n12.x * r2, y: p2.y + n12.y * r2 };
  const wB = { x: p2.x - n12.x * r2, y: p2.y - n12.y * r2 };

  const upMidA = {
    x: lerp(sA.x, e0A.x, 0.48) + n01.x * (outerSign > 0 ? 1.5 : 5.5),
    y: lerp(sA.y, e0A.y, 0.48) + n01.y * (outerSign > 0 ? 1.5 : 5.5),
  };
  const upMidB = {
    x: lerp(sB.x, e0B.x, 0.48) - n01.x * (outerSign > 0 ? 5.5 : 1.5),
    y: lerp(sB.y, e0B.y, 0.48) - n01.y * (outerSign > 0 ? 5.5 : 1.5),
  };
  const loMidA = {
    x: lerp(e2A.x, wA.x, 0.34) + n12.x * 5.2,
    y: lerp(e2A.y, wA.y, 0.34) + n12.y * 5.2,
  };
  const loMidB = {
    x: lerp(e2B.x, wB.x, 0.34) - n12.x * (outerSign > 0 ? 5.8 : 4.2),
    y: lerp(e2B.y, wB.y, 0.34) - n12.y * (outerSign > 0 ? 5.8 : 4.2),
  };

  const capW = { x: p2.x + n12.ux * (r2 * 0.72), y: p2.y + n12.uy * (r2 * 0.72) };
  const capS = { x: p0.x - n01.ux * (r0 * 0.78), y: p0.y - n01.uy * (r0 * 0.78) };

  ctx.beginPath();
  ctx.moveTo(sA.x, sA.y);
  ctx.quadraticCurveTo(upMidA.x, upMidA.y, e0A.x, e0A.y);
  ctx.quadraticCurveTo(eCornerA.x, eCornerA.y, e2A.x, e2A.y);
  ctx.quadraticCurveTo(loMidA.x, loMidA.y, wA.x, wA.y);
  ctx.quadraticCurveTo(capW.x, capW.y, wB.x, wB.y);
  ctx.quadraticCurveTo(loMidB.x, loMidB.y, e2B.x, e2B.y);
  ctx.quadraticCurveTo(eCornerB.x, eCornerB.y, e0B.x, e0B.y);
  ctx.quadraticCurveTo(upMidB.x, upMidB.y, sB.x, sB.y);
  ctx.quadraticCurveTo(capS.x, capS.y, sA.x, sA.y);
  ctx.closePath();
}

export function traceSleevePath(ctx, p0, p1, frac, rShoulder, rCuff) {
  const n = perpNormal(p0, p1);
  const end = { x: lerp(p0.x, p1.x, frac), y: lerp(p0.y, p1.y, frac) };
  const sA = { x: p0.x + n.x * rShoulder, y: p0.y + n.y * rShoulder };
  const sB = { x: p0.x - n.x * rShoulder, y: p0.y - n.y * rShoulder };
  const cA = { x: end.x + n.x * rCuff, y: end.y + n.y * rCuff };
  const cB = { x: end.x - n.x * rCuff, y: end.y - n.y * rCuff };
  const midA = { x: lerp(sA.x, cA.x, 0.52) + n.x * 2.5, y: lerp(sA.y, cA.y, 0.52) + n.y * 2.5 };
  const midB = { x: lerp(sB.x, cB.x, 0.52) - n.x * 2.5, y: lerp(sB.y, cB.y, 0.52) - n.y * 2.5 };
  const capS = { x: p0.x - n.ux * (rShoulder * 0.92), y: p0.y - n.uy * (rShoulder * 0.92) };
  const capC = { x: end.x - n.ux * 2.5, y: end.y - n.uy * 2.5 };

  ctx.beginPath();
  ctx.moveTo(sA.x, sA.y);
  ctx.quadraticCurveTo(midA.x, midA.y, cA.x, cA.y);
  ctx.quadraticCurveTo(capC.x, capC.y, cB.x, cB.y);
  ctx.quadraticCurveTo(midB.x, midB.y, sB.x, sB.y);
  ctx.bezierCurveTo(
    sB.x - n.ux * rShoulder * 0.55,
    sB.y - n.uy * rShoulder * 0.55,
    capS.x,
    capS.y,
    sA.x,
    sA.y
  );
  ctx.closePath();
}

export function buildForgeTimeline(doc) {
  const rawStrikes = doc.strikes || [];
  const expandedHits = [];
  for (const s of rawStrikes) {
    expandedHits.push({ ...s, hitId: `${s.id}a`, isRebound: false });
    if (s.kind === 'dbl' && typeof s.reboundDt === 'number') {
      expandedHits.push({
        id: s.id,
        hitId: `${s.id}b`,
        t: Number((s.t + s.reboundDt).toFixed(3)),
        hand: s.hand,
        kind: 'rebound',
        intensity: Number((s.intensity * 0.56).toFixed(2)),
        isRebound: true,
      });
    }
  }
  expandedHits.sort((a, b) => a.t - b.t);

  return {
    audioOffset: doc.audioOffset ?? 0.125,
    guitarEntryRealT: doc.guitarEntryRealT ?? 3.664,
    forgeHoldUntilRealT: doc.forgeHoldUntilRealT ?? 4.95,
    morphStartRealT: doc.morphStartRealT ?? 4.35,
    morphEndRealT: doc.morphEndRealT ?? 5.25,
    config: doc.config,
    duration: doc.config?.duration ?? 14.7,
    rawStrikes,
    leftStrikes: rawStrikes.filter((s) => s.hand === 'L'),
    rightStrikes: rawStrikes.filter((s) => s.hand === 'R'),
    expandedHits,
    barShifts: doc.barShifts || [],
  };
}

function findBracketStrikes(t, list) {
  let prev = null;
  let next = null;
  for (let i = 0; i < list.length; i += 1) {
    if (list[i].t <= t) prev = list[i];
    else {
      next = list[i];
      break;
    }
  }
  return { prev, next };
}

function evalBarShift(t, barShifts) {
  for (const bs of barShifts) {
    if (t >= bs.start && t <= bs.end) {
      let k = 0;
      if (t <= bs.peak) {
        k = easeInOutCubic((t - bs.start) / Math.max(1e-4, bs.peak - bs.start));
      } else {
        k = 1 - easeInOutCubic((t - bs.peak) / Math.max(1e-4, bs.end - bs.peak));
      }
      return { active: true, k, dx: bs.dx * k, dy: bs.dy * k, rotDeg: bs.rotDeg * k };
    }
  }
  return { active: false, k: 0, dx: 0, dy: 0, rotDeg: 0 };
}

function evalRightSwingRatio(t, rightStrikes, duration) {
  const { prev, next } = findBracketStrikes(t, rightStrikes);
  const startAlpha = 0.24;

  if (!prev && next) {
    const riseEnd = next.t - 0.22;
    const holdEnd = next.t - 0.18;
    if (t < riseEnd) {
      const u = clamp(t / Math.max(0.05, riseEnd), 0, 1);
      return { alpha: lerp(startAlpha, 0.0, easeInOutCubic(u)), swoosh: 0, impactAge: 99, impactPower: 0 };
    }
    if (t < holdEnd) return { alpha: 0.0, swoosh: 0.05, impactAge: 99, impactPower: 0 };
    const u = clamp((t - holdEnd) / Math.max(0.05, next.t - holdEnd), 0, 1);
    return { alpha: Math.pow(u, 2.55), swoosh: clamp((u - 0.32) / 0.68, 0, 1), impactAge: 99, impactPower: 0 };
  }

  if (prev && !next) {
    const dt = t - prev.t;
    let alpha = startAlpha;
    if (dt < 0.03) alpha = 1.0 + Math.sin((dt / 0.03) * Math.PI) * 0.015;
    else if (dt < 0.11) alpha = lerp(1.0, 0.91, easeOutCubic((dt - 0.03) / 0.08));
    else {
      const u = clamp((t - (prev.t + 0.11)) / Math.max(0.1, duration - (prev.t + 0.11)), 0, 1);
      alpha = lerp(0.91, startAlpha, easeInOutCubic(u));
    }
    return { alpha, swoosh: 0, impactAge: dt, impactPower: prev.intensity };
  }

  if (!prev && !next) return { alpha: startAlpha, swoosh: 0, impactAge: 99, impactPower: 0 };

  const dtPrev = t - prev.t;
  const span = next.t - prev.t;
  const downDur = clamp(span * 0.29, 0.175, 0.215);
  const peakHoldStart = Math.max(prev.t + 0.12, next.t - downDur - 0.05);
  const downStart = next.t - downDur;

  if (dtPrev < 0.028) {
    return {
      alpha: 1.0 + Math.sin((dtPrev / 0.028) * Math.PI) * 0.016,
      swoosh: clamp(0.45 * (1 - dtPrev / 0.028), 0, 1),
      impactAge: dtPrev,
      impactPower: prev.intensity,
    };
  }
  if (dtPrev < 0.105) {
    return { alpha: lerp(1.0, 0.905, easeOutCubic((dtPrev - 0.028) / 0.077)), swoosh: 0, impactAge: dtPrev, impactPower: prev.intensity };
  }
  if (t < peakHoldStart) {
    const u = clamp((t - (prev.t + 0.105)) / Math.max(0.05, peakHoldStart - (prev.t + 0.105)), 0, 1);
    return { alpha: lerp(0.905, 0.0, easeInOutCubic(u)), swoosh: 0, impactAge: dtPrev, impactPower: prev.intensity };
  }
  if (t < downStart) return { alpha: 0.0, swoosh: 0, impactAge: dtPrev, impactPower: prev.intensity };

  const u = clamp((t - downStart) / downDur, 0, 1);
  return { alpha: Math.pow(u, 2.6), swoosh: clamp((u - 0.28) / 0.72, 0, 1), impactAge: dtPrev, impactPower: prev.intensity };
}

function evalLeftSwingRatio(t, expandedHits, duration) {
  const leftExpanded = expandedHits.filter((h) => h.hand === 'L');
  const { prev, next } = findBracketStrikes(t, leftExpanded);
  const restBeta = 0.25;

  if (!prev && next) {
    const downDur = Math.min(0.14, next.t * 0.45);
    const downStart = next.t - downDur;
    if (t < downStart) {
      const u = clamp(t / Math.max(0.04, downStart), 0, 1);
      return { beta: lerp(restBeta, 0.04, easeInOutCubic(u)), hitAge: 99, hitPower: 0 };
    }
    const u = clamp((t - downStart) / downDur, 0, 1);
    return { beta: lerp(0.04, 1.0, easeInCubic(u)), hitAge: 99, hitPower: 0 };
  }

  if (prev && !next) {
    const dt = t - prev.t;
    if (dt < 0.065) return { beta: lerp(1.0, 0.76, easeOutQuad(dt / 0.065)), hitAge: dt, hitPower: prev.intensity };
    const u = clamp((dt - 0.065) / Math.max(0.1, duration - (prev.t + 0.065)), 0, 1);
    return { beta: lerp(0.76, restBeta, easeInOutCubic(u)), hitAge: dt, hitPower: prev.intensity };
  }

  if (!prev && !next) return { beta: restBeta, hitAge: 99, hitPower: 0 };

  const dtPrev = t - prev.t;
  const span = next.t - prev.t;
  if (span < 0.145) {
    const u = clamp(dtPrev / span, 0, 1);
    const bounceApex = next.isRebound ? 0.64 : 0.68;
    const peakU = 0.48;
    const beta =
      u < peakU
        ? lerp(1.0, bounceApex, easeOutQuad(u / peakU))
        : lerp(bounceApex, 1.0, easeInCubic((u - peakU) / (1 - peakU)));
    return { beta, hitAge: dtPrev, hitPower: prev.intensity };
  }

  const downDur = 0.125;
  const downStart = next.t - downDur;
  const midLiftTime = prev.t + (span - downDur) * 0.56;
  if (dtPrev < 0.055) return { beta: lerp(1.0, 0.80, easeOutCubic(dtPrev / 0.055)), hitAge: dtPrev, hitPower: prev.intensity };
  if (t < midLiftTime) {
    const u = clamp((t - (prev.t + 0.055)) / Math.max(0.05, midLiftTime - (prev.t + 0.055)), 0, 1);
    return { beta: lerp(0.80, 0.0, easeInOutCubic(u)), hitAge: dtPrev, hitPower: prev.intensity };
  }
  if (t < downStart) {
    const u = clamp((t - midLiftTime) / Math.max(0.02, downStart - midLiftTime), 0, 1);
    return { beta: lerp(0.0, 0.06, u), hitAge: dtPrev, hitPower: prev.intensity };
  }
  const u = clamp((t - downStart) / downDur, 0, 1);
  return { beta: lerp(0.06, 1.0, Math.pow(u, 2.2)), hitAge: dtPrev, hitPower: prev.intensity };
}

function rotateAroundPivot(pivot, localOffset, deg) {
  const r = degToRad(deg);
  const c = Math.cos(r);
  const s = Math.sin(r);
  return {
    x: pivot.x + localOffset.x * c - localOffset.y * s,
    y: pivot.y + localOffset.x * s + localOffset.y * c,
  };
}

export function computeForgePose(realT, timeline) {
  const t = Math.max(0, realT - timeline.audioOffset);
  const { config, rightStrikes, expandedHits, barShifts, duration } = timeline;
  const { anvilTarget, leftCraftsman, rightCraftsman } = config;

  const rSwing = evalRightSwingRatio(t, rightStrikes, duration);
  const lSwing = evalLeftSwingRatio(t, expandedHits, duration);
  const barShift = evalBarShift(t, barShifts);

  const hearthFlicker = 0.86 + 0.14 * Math.sin(t * 11.3) * Math.cos(t * 4.7);
  const rImpactDecay = rSwing.impactAge < 0.24 ? Math.exp(-rSwing.impactAge * 18) * rSwing.impactPower : 0;
  const lImpactDecay = lSwing.hitAge < 0.15 ? Math.exp(-lSwing.hitAge * 24) * lSwing.hitPower : 0;
  const anvilDipY = rImpactDecay * 3.2 + lImpactDecay * 0.9;
  const flashIntensity = clamp(rImpactDecay * 1.15 + lImpactDecay * 0.62, 0, 1.25);

  const alpha = rSwing.alpha;
  const clampedAlpha = clamp(alpha, 0, 1.03);
  const angleDeg = lerp(rightCraftsman.sledgeApexAngleDeg, rightCraftsman.sledgeImpactAngleDeg, clampedAlpha);
  const angleRad = degToRad(angleDeg);
  const dirX = Math.cos(angleRad);
  const dirY = Math.sin(angleRad);

  const frontDist = lerp(218, 232, clamp(alpha, 0, 1));
  const trailDist = lerp(346, 358, clamp(alpha, 0, 1));
  const totalLen = rightCraftsman.sledgeHandleLen;

  const impactAngleRad = degToRad(rightCraftsman.sledgeImpactAngleDeg);
  const strikeCenterX = anvilTarget.rightHitX - 10;
  const strikeCenterY = anvilTarget.rightHitY - 34;
  const impactFrontX = strikeCenterX - 232 * Math.cos(impactAngleRad);
  const impactFrontY = strikeCenterY - 232 * Math.sin(impactAngleRad);

  const arcBow = Math.sin(clamp(alpha, 0, 1) * Math.PI);
  const frontGrip = {
    x: lerp(876, impactFrontX, clamp(alpha, 0, 1)) - arcBow * 44,
    y: lerp(266, impactFrontY, clamp(alpha, 0, 1)) - arcBow * 28 + anvilDipY * 0.6,
  };
  const sledgeHead = { x: frontGrip.x + dirX * frontDist, y: frontGrip.y + dirY * frontDist };
  const trailGrip = { x: sledgeHead.x - dirX * trailDist, y: sledgeHead.y - dirY * trailDist };
  const sledgeButt = { x: sledgeHead.x - dirX * totalLen, y: sledgeHead.y - dirY * totalLen };

  const hipDropX = lerp(8, -20, clamp(alpha, 0, 1)) - rImpactDecay * 3.5;
  const hipDropY = lerp(-4, 16, clamp(alpha, 0, 1)) + rImpactDecay * 3.5;
  const leanRotDeg = lerp(3.0, -9.2, clamp(alpha, 0, 1));
  const rHipPivot = { x: rightCraftsman.hipBase.x + hipDropX, y: rightCraftsman.hipBase.y + hipDropY };

  const shoulderBack = rotateAroundPivot(rHipPivot, rightCraftsman.shoulderLeadLocal, leanRotDeg);
  const shoulderFront = rotateAroundPivot(rHipPivot, rightCraftsman.shoulderTrailLocal, leanRotDeg);
  const rLeadIK = solveTwoBoneIK(shoulderBack, frontGrip, rightCraftsman.armUpperLen, rightCraftsman.armForeLen, -1);
  const rTrailIK = solveTwoBoneIK(shoulderFront, trailGrip, rightCraftsman.armUpperLen, rightCraftsman.armForeLen, -1);
  const rHeadNodDeg = lerp(-4, 6, clamp(alpha, 0, 1)) + rImpactDecay * 2.5;

  const beta = clamp(lSwing.beta, 0, 1);
  const lImpactAngle = 22.0;
  const lApexAngle = -26.0;
  const lHandleEffLen = leftCraftsman.hammerHandleLen;
  const lImpactWrist = {
    x: anvilTarget.leftTapX - lHandleEffLen * Math.cos(degToRad(lImpactAngle)),
    y: anvilTarget.leftTapY - lHandleEffLen * Math.sin(degToRad(lImpactAngle)),
  };
  const lArcBow = Math.sin(beta * Math.PI);
  const lHammerWrist = {
    x: lerp(382, lImpactWrist.x, beta) - lArcBow * 12,
    y: lerp(294, lImpactWrist.y, beta) - lArcBow * 20 + lImpactDecay * 1.8,
  };
  const lHandleAngleDeg = lerp(lApexAngle, lImpactAngle, beta);
  const lHandleRad = degToRad(lHandleAngleDeg);

  const lBodyBobX = lerp(-4, 7, beta) + barShift.dx * 0.14;
  const lBodyBobY = lerp(-2, 4, beta) + anvilDipY * 0.25;
  const lTorsoLeanDeg = lerp(-1.5, 4.0, beta);
  const lHipPivot = { x: leftCraftsman.hipBase.x + lBodyBobX, y: leftCraftsman.hipBase.y + lBodyBobY };

  const lHammerShoulder = rotateAroundPivot(lHipPivot, leftCraftsman.shoulderHammerLocal, lTorsoLeanDeg);
  const lTongsShoulder = rotateAroundPivot(lHipPivot, leftCraftsman.shoulderTongsLocal, lTorsoLeanDeg * 0.65);
  const lHammerIK = solveTwoBoneIK(lHammerShoulder, lHammerWrist, leftCraftsman.hammerUpperLen, leftCraftsman.hammerForeLen, 1);

  const tongsHandTarget = {
    x: 412 + barShift.dx * 0.85,
    y: 326 + barShift.dy * 0.85 + anvilDipY * 0.5,
  };
  const lTongsIK = solveTwoBoneIK(lTongsShoulder, tongsHandTarget, leftCraftsman.tongsUpperLen, leftCraftsman.tongsForeLen, 1);

  const barStart = { x: anvilTarget.barStartX + barShift.dx, y: anvilTarget.barStartY + barShift.dy + anvilDipY };
  const barEnd = { x: anvilTarget.barEndX + barShift.dx * 0.6, y: anvilTarget.barEndY + barShift.dy * 0.6 + anvilDipY };

  return {
    t,
    realT,
    hearthFlicker,
    anvilDipY,
    flashIntensity,
    barStart,
    barEnd,
    right: {
      alpha: clampedAlpha,
      swoosh: rSwing.swoosh,
      angleDeg,
      head: sledgeHead,
      frontGrip,
      trailGrip,
      butt: sledgeButt,
      hipPivot: rHipPivot,
      leanRotDeg,
      headNodDeg: rHeadNodDeg,
      leadIK: rLeadIK,
      trailIK: rTrailIK,
    },
    left: {
      beta,
      hipPivot: lHipPivot,
      torsoLeanDeg: lTorsoLeanDeg,
      hammerAngleDeg: lHandleAngleDeg,
      hammerWrist: lHammerWrist,
      hammerIK: lHammerIK,
      tongsHand: tongsHandTarget,
      tongsIK: lTongsIK,
    },
    impacts: {
      rightAge: rSwing.impactAge,
      rightPower: rSwing.impactPower,
      leftAge: lSwing.hitAge,
      leftPower: lSwing.hitPower,
    },
  };
}
