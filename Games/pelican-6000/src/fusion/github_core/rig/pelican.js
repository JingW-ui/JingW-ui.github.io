// src/rig/pelican.js
// Parametric skeletal rig (Pelican + Bicycle) with exact analytical two-bone leg IK.
// Guarantees continuous pose & motion across every picture-frame style boundary.

/**
 * Solves 2D two-bone analytical IK from `root` to `target` with limb lengths `L1`, `L2`.
 * `bendSign` (+1 or -1) picks the knee bend side deterministically without frame popping.
 */
export function solveTwoBoneIK(rx, ry, tx, ty, L1, L2, bendSign = 1) {
  let dx = tx - rx;
  let dy = ty - ry;
  let d = Math.hypot(dx, dy);
  const minD = Math.abs(L1 - L2) + 1e-3;
  const maxD = L1 + L2 - 1e-3;
  if (d < minD) d = minD;
  if (d > maxD) {
    const k = maxD / d;
    dx *= k;
    dy *= k;
    d = maxD;
  }
  const cosA = (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d);
  const clampedCos = Math.max(-1, Math.min(1, cosA));
  const angleBase = Math.atan2(dy, dx);
  const angleOffset = bendSign * Math.acos(clampedCos);
  const kneeAngle = angleBase + angleOffset;
  return {
    x: rx + L1 * Math.cos(kneeAngle),
    y: ry + L1 * Math.sin(kneeAngle),
    hipAngle: kneeAngle,
  };
}

/**
 * Computes full deterministic joint & spline rig for Pelican + Bicycle at `(x, groundY)`.
 *
 * @param {object} opts
 * @param {number} opts.x - Center X in panel coordinates (0..1000)
 * @param {number} opts.y - Ground contact Y in panel coordinates (canonical edge = 680)
 * @param {number} opts.pedalAngle - Crank angle in radians (2 beats = 2π = 1 full turn)
 * @param {number} [opts.wheelAngle] - Wheel spoke rotation in radians
 * @param {number} [opts.scale=1] - Uniform size scale (e.g. 0.16 in Song Landscape, 1.0 standard)
 * @param {number} [opts.slope=0] - Road tangent angle in radians
 * @param {number} [opts.speedScale=1] - Motion intensity scalar (dampens bobbing during freeze pose)
 * @param {string} [opts.poseMode='normal'] - 'normal' | 'egypt_freeze' | 'bada_eye' | 'jump' | 'lissajous'
 * @param {number} [opts.lissajousMix=0] - [0..1] harmonic distortion amount for #15 Oscilloscope gag
 * @param {number} [opts.time=0] - Global/quantized time for secondary feather/ribbon flutter
 */
export function computePelicanRig({
  x = 500,
  y = 680,
  pedalAngle = 0,
  wheelAngle = null,
  scale = 1.0,
  slope = 0,
  speedScale = 1.0,
  poseMode = 'normal',
  lissajousMix = 0,
  time = 0,
} = {}) {
  const wheelR = 46;
  const wAngle = wheelAngle !== null ? wheelAngle : (x / wheelR);

  // Subtle 1-per-beat saddle bounce & gular throat-pouch jiggle
  const motionAmp = Math.min(1.2, Math.max(0.08, speedScale));
  const bob = -3.4 * Math.sin(2 * pedalAngle) * motionAmp;
  const pouchJiggle = 4.2 * Math.sin(2 * pedalAngle - 0.85) * motionAmp;
  const nod = 0.038 * Math.sin(2 * pedalAngle - 0.4) * motionAmp;

  // Local unscaled coordinates around ground origin (0, 0), facing +X:
  const rearWheel = { x: -86, y: -wheelR, r: wheelR, angle: wAngle };
  const frontWheel = { x: 86, y: -wheelR, r: wheelR, angle: wAngle };
  const bb = { x: -8, y: -wheelR }; // Bottom bracket
  const crankR = 21;

  const rightPedal = {
    x: bb.x + crankR * Math.cos(pedalAngle),
    y: bb.y + crankR * Math.sin(pedalAngle),
  };
  const leftPedal = {
    x: bb.x - crankR * Math.cos(pedalAngle),
    y: bb.y - crankR * Math.sin(pedalAngle),
  };

  // Classic diamond frame + swept cruiser handlebar
  const seatCluster = { x: -33, y: -108 };
  const saddle = { x: -37, y: -115 };
  const headTop = { x: 56, y: -112 };
  const headBot = { x: 63, y: -90 };
  const stemTop = { x: 52, y: -129 };
  const handleGrip = { x: 37, y: -132 };

  // Pelican body & posture adjustments
  const isEgypt = poseMode === 'egypt_freeze';
  const hip = { x: -35, y: -126 + bob };
  const bodyCenter = { x: -16, y: -136 + bob, rx: 46, ry: 27, tilt: -0.16 };
  const tailTip = { x: -84, y: -132 + bob * 0.7 };
  const chest = { x: 14, y: -150 + bob };

  // S-curved neck control points -> head -> iconic long beak + throat pouch
  const neckC1 = { x: 30, y: -164 + bob };
  const neckC2 = { x: 8, y: -188 + bob * 1.05 };
  const head = {
    x: isEgypt ? 22 : 20,
    y: -206 + bob * 1.1,
    r: 15.5,
    angle: isEgypt ? 0 : nod,
  };

  // Beak & elastic gular pouch (in local rig space)
  const beakUpperBase = { x: head.x + 9, y: head.y - 6 };
  const beakLowerBase = { x: head.x + 4, y: head.y + 8 };
  const beakTip = {
    x: head.x + 76,
    y: head.y + 7 + Math.sin(head.angle) * 28,
  };
  const pouchBelly = {
    x: head.x + 38,
    y: head.y + 39 + pouchJiggle,
  };

  // Crown feather tuft
  const crest1 = { x: head.x - 15, y: head.y - 11 - 2 * Math.sin(time * 8) };
  const crest2 = { x: head.x - 20, y: head.y - 4 - 2 * Math.cos(time * 8) };

  // Wing & handlebar reach
  const wingShoulder = { x: -10, y: -149 + bob };
  const wingElbow = { x: 12, y: -134 + bob * 0.6 };
  const wingTip = { x: handleGrip.x, y: handleGrip.y + 2 };

  // Analytical two-bone leg IK to left & right pedals (bendSign = -1 bends bird ankle/knee forward +X)
  const footPadOffsetY = -5;
  const leftKnee = solveTwoBoneIK(
    hip.x + 3,
    hip.y + 6,
    leftPedal.x,
    leftPedal.y + footPadOffsetY,
    52,
    54,
    -1
  );
  const rightKnee = solveTwoBoneIK(
    hip.x - 2,
    hip.y + 6,
    rightPedal.x,
    rightPedal.y + footPadOffsetY,
    52,
    54,
    -1
  );

  const cosS = Math.cos(slope) * scale;
  const sinS = Math.sin(slope) * scale;
  const xf = (pt) => {
    let px = pt.x;
    let py = pt.y;
    if (lissajousMix > 0.001) {
      const ph = time * 14 + px * 0.045 + py * 0.035;
      const lx = 115 * Math.sin(3 * time * 5.0 + px * 0.03);
      const ly = 115 * Math.sin(4 * time * 5.0 + py * 0.03 + 0.9) - 115;
      px = px * (1 - lissajousMix) + lx * lissajousMix + Math.sin(ph) * 6 * lissajousMix;
      py = py * (1 - lissajousMix) + ly * lissajousMix;
    }
    return {
      ...pt,
      x: x + px * cosS - py * sinS,
      y: y + px * sinS + py * cosS,
    };
  };

  return {
    root: { x, y, scale, slope },
    poseMode,
    pedalAngle,
    wheelAngle: wAngle,
    time,
    rearWheel: { ...xf(rearWheel), r: wheelR * scale },
    frontWheel: { ...xf(frontWheel), r: wheelR * scale },
    bb: xf(bb),
    leftPedal: xf(leftPedal),
    rightPedal: xf(rightPedal),
    seatCluster: xf(seatCluster),
    saddle: xf(saddle),
    headTop: xf(headTop),
    headBot: xf(headBot),
    stemTop: xf(stemTop),
    handleGrip: xf(handleGrip),
    hip: xf(hip),
    bodyCenter: {
      ...xf(bodyCenter),
      rx: bodyCenter.rx * scale,
      ry: bodyCenter.ry * scale,
      tilt: bodyCenter.tilt + slope,
    },
    tailTip: xf(tailTip),
    chest: xf(chest),
    neckC1: xf(neckC1),
    neckC2: xf(neckC2),
    head: { ...xf(head), r: head.r * scale, angle: head.angle + slope },
    beakUpperBase: xf(beakUpperBase),
    beakLowerBase: xf(beakLowerBase),
    beakTip: xf(beakTip),
    pouchBelly: xf(pouchBelly),
    crest1: xf(crest1),
    crest2: xf(crest2),
    wingShoulder: xf(wingShoulder),
    wingElbow: xf(wingElbow),
    wingTip: xf(wingTip),
    leftHip: xf({ x: hip.x + 3, y: hip.y + 6 }),
    rightHip: xf({ x: hip.x - 2, y: hip.y + 6 }),
    leftKnee: xf(leftKnee),
    rightKnee: xf(rightKnee),
    leftFoot: xf({ x: leftPedal.x, y: leftPedal.y + footPadOffsetY }),
    rightFoot: xf({ x: rightPedal.x, y: rightPedal.y + footPadOffsetY }),
  };
}

/**
 * Draws a crisp, expressive Pelican + Bicycle on a 2D `CanvasRenderingContext2D` or `p5.Graphics` (2D).
 * Supports palette customization, shadow-only mode (#14 Nosferatu), wireframe phosphor (#15),
 * Bada Shanren roll-eye (#9), etc. Used in Phase 1 animatic & reusable as a base guide.
 */
export function drawRig2D(ctx, rig, style = {}) {
  const s = rig.root.scale;
  const {
    silhouetteColor = null, // if set, renders entire rig in flat silhouette (e.g. Nosferatu shadow!)
    wireframeColor = null, // if set, renders glowing vector lines only (e.g. Oscilloscope!)
    featherFill = '#f8f5ec',
    featherShade = '#dfd7c5',
    wingTipDark = '#2d2b28',
    beakFill = '#f0a22e',
    pouchFill = '#e06d28',
    legFill = '#d96b27',
    frameStroke = '#b63b2e',
    metalStroke = '#3a3835',
    tireStroke = '#23211f',
    inkOutline = '#1d1b18',
    lineScale = 1.0,
    eyeMode = rig.poseMode === 'bada_eye' ? 'bada' : 'normal',
  } = style;

  const isSil = Boolean(silhouetteColor);
  const isWire = Boolean(wireframeColor);
  const strokeMain = isWire ? wireframeColor : isSil ? silhouetteColor : inkOutline;
  const lw = (w) => Math.max(0.8, w * s * lineScale);

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const drawWheel = (w) => {
    // Spokes
    ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : metalStroke;
    ctx.lineWidth = lw(isWire ? 1.4 : 1.3);
    const numSpokes = 10;
    for (let i = 0; i < numSpokes; i++) {
      const a = w.angle + (i * Math.PI * 2) / numSpokes;
      ctx.beginPath();
      ctx.moveTo(w.x, w.y);
      ctx.lineTo(w.x + Math.cos(a) * (w.r - 3 * s), w.y + Math.sin(a) * (w.r - 3 * s));
      ctx.stroke();
    }
    // Rim & Tire
    if (!isSil && !isWire) {
      ctx.strokeStyle = '#c8c2b4';
      ctx.lineWidth = lw(3.2);
      ctx.beginPath();
      ctx.arc(w.x, w.y, w.r - 2.5 * s, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : tireStroke;
    ctx.lineWidth = lw(isWire ? 2.6 : 4.8);
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.r, 0, Math.PI * 2);
    ctx.stroke();

    // Hub
    ctx.fillStyle = strokeMain;
    ctx.beginPath();
    ctx.arc(w.x, w.y, 4.2 * s, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawLeg = (hipPt, kneePt, footPt, pedalPt, darken = false) => {
    // Crank arm behind/front
    ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : metalStroke;
    ctx.lineWidth = lw(3.4);
    ctx.beginPath();
    ctx.moveTo(rig.bb.x, rig.bb.y);
    ctx.lineTo(pedalPt.x, pedalPt.y);
    ctx.stroke();

    // Thigh + Shin
    ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : darken ? '#b55219' : legFill;
    ctx.lineWidth = lw(5.2);
    ctx.beginPath();
    ctx.moveTo(hipPt.x, hipPt.y);
    ctx.lineTo(kneePt.x, kneePt.y);
    ctx.lineTo(footPt.x, footPt.y);
    ctx.stroke();

    if (!isSil && !isWire) {
      ctx.strokeStyle = inkOutline;
      ctx.lineWidth = lw(1.5);
      ctx.stroke();
    }

    // Webbed orange foot on pedal
    ctx.fillStyle = isWire ? 'transparent' : isSil ? silhouetteColor : darken ? '#b55219' : legFill;
    ctx.strokeStyle = strokeMain;
    ctx.lineWidth = lw(1.8);
    ctx.beginPath();
    ctx.moveTo(footPt.x - 4 * s, footPt.y);
    ctx.lineTo(footPt.x + 15 * s, footPt.y + 2 * s);
    ctx.lineTo(footPt.x + 9 * s, footPt.y + 7 * s);
    ctx.lineTo(footPt.x - 5 * s, footPt.y + 5 * s);
    ctx.closePath();
    if (!isWire) ctx.fill();
    ctx.stroke();

    // Pedal block
    ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : metalStroke;
    ctx.lineWidth = lw(3.8);
    ctx.beginPath();
    ctx.moveTo(pedalPt.x - 8 * s, pedalPt.y + 2 * s);
    ctx.lineTo(pedalPt.x + 8 * s, pedalPt.y + 2 * s);
    ctx.stroke();
  };

  // 1. Far (left) leg & crank
  drawLeg(rig.leftHip, rig.leftKnee, rig.leftFoot, rig.leftPedal, true);

  // 2. Wheels
  drawWheel(rig.rearWheel);
  drawWheel(rig.frontWheel);

  // 3. Chain & chainring
  ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : metalStroke;
  ctx.lineWidth = lw(1.8);
  ctx.beginPath();
  ctx.arc(rig.bb.x, rig.bb.y, 12 * s, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rig.rearWheel.x, rig.rearWheel.y - 5 * s);
  ctx.lineTo(rig.bb.x, rig.bb.y - 12 * s);
  ctx.moveTo(rig.rearWheel.x, rig.rearWheel.y + 5 * s);
  ctx.lineTo(rig.bb.x, rig.bb.y + 12 * s);
  ctx.stroke();

  // 4. Bicycle Diamond Frame + Fork + Stem/Handlebar
  ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : frameStroke;
  ctx.lineWidth = lw(4.4);
  ctx.beginPath();
  // Rear triangle
  ctx.moveTo(rig.rearWheel.x, rig.rearWheel.y);
  ctx.lineTo(rig.seatCluster.x, rig.seatCluster.y);
  ctx.lineTo(rig.bb.x, rig.bb.y);
  ctx.closePath();
  // Main triangle
  ctx.moveTo(rig.seatCluster.x, rig.seatCluster.y);
  ctx.lineTo(rig.headTop.x, rig.headTop.y);
  ctx.lineTo(rig.headBot.x, rig.headBot.y);
  ctx.lineTo(rig.bb.x, rig.bb.y);
  // Front fork
  ctx.moveTo(rig.headTop.x, rig.headTop.y);
  ctx.lineTo(rig.headBot.x, rig.headBot.y);
  ctx.lineTo(rig.frontWheel.x, rig.frontWheel.y);
  ctx.stroke();

  // Seatpost, Saddle & Handlebar
  ctx.strokeStyle = isWire ? wireframeColor : isSil ? silhouetteColor : metalStroke;
  ctx.lineWidth = lw(3.4);
  ctx.beginPath();
  ctx.moveTo(rig.seatCluster.x, rig.seatCluster.y);
  ctx.lineTo(rig.saddle.x, rig.saddle.y);
  ctx.moveTo(rig.headTop.x, rig.headTop.y);
  ctx.lineTo(rig.stemTop.x, rig.stemTop.y);
  ctx.quadraticCurveTo(rig.stemTop.x - 4 * s, rig.stemTop.y - 5 * s, rig.handleGrip.x, rig.handleGrip.y);
  ctx.stroke();

  // Saddle pad
  ctx.strokeStyle = strokeMain;
  ctx.lineWidth = lw(5.5);
  ctx.beginPath();
  ctx.moveTo(rig.saddle.x - 13 * s, rig.saddle.y);
  ctx.lineTo(rig.saddle.x + 12 * s, rig.saddle.y + 1 * s);
  ctx.stroke();

  // 5. Pelican Torso, Tail & S-Neck
  ctx.fillStyle = isWire ? 'transparent' : isSil ? silhouetteColor : featherFill;
  ctx.strokeStyle = strokeMain;
  ctx.lineWidth = lw(2.6);

  // Plump torso + pointed tail feathers
  ctx.beginPath();
  ctx.moveTo(rig.tailTip.x, rig.tailTip.y);
  ctx.quadraticCurveTo(
    rig.bodyCenter.x - 36 * s,
    rig.bodyCenter.y - 28 * s,
    rig.chest.x + 8 * s,
    rig.chest.y - 6 * s
  );
  ctx.quadraticCurveTo(
    rig.bodyCenter.x + 34 * s,
    rig.bodyCenter.y + 26 * s,
    rig.hip.x - 14 * s,
    rig.hip.y + 14 * s
  );
  ctx.quadraticCurveTo(
    rig.bodyCenter.x - 46 * s,
    rig.bodyCenter.y + 14 * s,
    rig.tailTip.x,
    rig.tailTip.y
  );
  ctx.closePath();
  if (!isWire) ctx.fill();
  ctx.stroke();

  // S-curved neck (thick stroke + outline)
  if (!isWire) {
    ctx.strokeStyle = isSil ? silhouetteColor : featherFill;
    ctx.lineWidth = lw(19);
    ctx.beginPath();
    ctx.moveTo(rig.chest.x - 2 * s, rig.chest.y + 4 * s);
    ctx.bezierCurveTo(rig.neckC1.x, rig.neckC1.y, rig.neckC2.x, rig.neckC2.y, rig.head.x, rig.head.y);
    ctx.stroke();
  }
  ctx.strokeStyle = strokeMain;
  ctx.lineWidth = lw(2.4);
  ctx.beginPath();
  ctx.moveTo(rig.chest.x - 9 * s, rig.chest.y - 1 * s);
  ctx.bezierCurveTo(
    rig.neckC1.x - 8 * s,
    rig.neckC1.y,
    rig.neckC2.x - 9 * s,
    rig.neckC2.y,
    rig.head.x - 10 * s,
    rig.head.y
  );
  ctx.moveTo(rig.chest.x + 7 * s, rig.chest.y + 7 * s);
  ctx.bezierCurveTo(
    rig.neckC1.x + 9 * s,
    rig.neckC1.y + 3 * s,
    rig.neckC2.x + 9 * s,
    rig.neckC2.y + 2 * s,
    rig.head.x + 8 * s,
    rig.head.y + 5 * s
  );
  ctx.stroke();

  // Head + Crown Crest
  ctx.fillStyle = isWire ? 'transparent' : isSil ? silhouetteColor : featherFill;
  ctx.beginPath();
  ctx.arc(rig.head.x, rig.head.y, rig.head.r, 0, Math.PI * 2);
  if (!isWire) ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(rig.head.x - 9 * s, rig.head.y - 9 * s);
  ctx.lineTo(rig.crest1.x, rig.crest1.y);
  ctx.moveTo(rig.head.x - 11 * s, rig.head.y - 4 * s);
  ctx.lineTo(rig.crest2.x, rig.crest2.y);
  ctx.stroke();

  // 6. Iconic Pelican Gular Throat Pouch + Long Hooked Beak
  // Gular pouch first (underneath upper mandible)
  ctx.fillStyle = isWire ? 'transparent' : isSil ? silhouetteColor : pouchFill;
  ctx.beginPath();
  ctx.moveTo(rig.beakLowerBase.x, rig.beakLowerBase.y);
  ctx.quadraticCurveTo(rig.pouchBelly.x, rig.pouchBelly.y, rig.beakTip.x - 3 * s, rig.beakTip.y);
  ctx.lineTo(rig.beakUpperBase.x, rig.beakUpperBase.y + 5 * s);
  ctx.closePath();
  if (!isWire) ctx.fill();
  ctx.stroke();

  // Upper mandible with hooked tip
  ctx.fillStyle = isWire ? 'transparent' : isSil ? silhouetteColor : beakFill;
  ctx.beginPath();
  ctx.moveTo(rig.beakUpperBase.x, rig.beakUpperBase.y);
  ctx.lineTo(rig.beakTip.x, rig.beakTip.y - 3 * s);
  ctx.quadraticCurveTo(rig.beakTip.x + 5 * s, rig.beakTip.y + 4 * s, rig.beakTip.x - 2 * s, rig.beakTip.y + 5 * s);
  ctx.lineTo(rig.beakLowerBase.x, rig.beakLowerBase.y + 1 * s);
  ctx.closePath();
  if (!isWire) ctx.fill();
  ctx.stroke();

  // Eye (unless silhouette)
  if (!isSil) {
    const ex = rig.head.x + 4 * s;
    const ey = rig.head.y - 3 * s;
    ctx.fillStyle = isWire ? wireframeColor : '#ffffff';
    ctx.strokeStyle = strokeMain;
    ctx.lineWidth = lw(1.6);
    ctx.beginPath();
    ctx.arc(ex, ey, 4.6 * s, 0, Math.PI * 2);
    if (!isWire) ctx.fill();
    ctx.stroke();

    ctx.fillStyle = strokeMain;
    ctx.beginPath();
    const pupilY = eyeMode === 'bada' ? ey - 2.3 * s : ey;
    const pupilX = eyeMode === 'bada' ? ex - 0.8 * s : ex + 1.2 * s;
    ctx.arc(pupilX, pupilY, 1.9 * s, 0, Math.PI * 2);
    ctx.fill();
  }

  // 7. Near (right) Leg & Crank
  drawLeg(rig.rightHip, rig.rightKnee, rig.rightFoot, rig.rightPedal, false);

  // 8. Foreground Wing reaching toward handlebar
  ctx.fillStyle = isWire ? 'transparent' : isSil ? silhouetteColor : featherShade;
  ctx.strokeStyle = strokeMain;
  ctx.lineWidth = lw(2.5);
  ctx.beginPath();
  ctx.moveTo(rig.wingShoulder.x, rig.wingShoulder.y);
  ctx.quadraticCurveTo(
    rig.wingElbow.x - 16 * s,
    rig.wingElbow.y + 18 * s,
    rig.wingTip.x + 4 * s,
    rig.wingTip.y + 2 * s
  );
  ctx.quadraticCurveTo(
    rig.wingElbow.x + 12 * s,
    rig.wingElbow.y - 8 * s,
    rig.wingShoulder.x + 12 * s,
    rig.wingShoulder.y + 2 * s
  );
  ctx.closePath();
  if (!isWire) ctx.fill();
  ctx.stroke();

  // Dark primary feather tips accent
  if (!isSil && !isWire) {
    ctx.strokeStyle = wingTipDark;
    ctx.lineWidth = lw(2.2);
    ctx.beginPath();
    ctx.moveTo(rig.wingTip.x - 8 * s, rig.wingTip.y + 2 * s);
    ctx.lineTo(rig.wingTip.x + 4 * s, rig.wingTip.y + 1 * s);
    ctx.stroke();
  }

  ctx.restore();
}
