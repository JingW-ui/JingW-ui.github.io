// src/openings/gold_svg/smith_right.js
// Pure-Vector Right Cap Striker Blacksmith (`x:296..458, y:492..926`):
// - Uses Dual-Arm 2-Bone IK (`leadArmIK` + `trailArmIK` + `organicArmGeometry` + `rolledSleeveGeometry` + 2 `buildGoldGripHand`s)
// - Guarantees the Heavy 3D Beveled Sledgehammer smashes FLUSH (`0.0px` gap) onto `(266, 718 + anvilDipY)`!

import { el } from './defs.js';
import { buildGoldGripHand, organicArmGeometry, rolledSleeveGeometry } from './kinematics.js';

export function buildRightStrikerSmithGroup(parent, pal) {
  const root = el('g', {}, parent);
  const ink = pal.ink;

  // 1. Lower Trousers & Planted Boots (`y = 792..926`)
  const legsG = el('g', {}, root);
  el('path', {
    d: 'M 346 792 L 382 796 Q 362 848 350 896 L 316 894 Q 328 842 346 792 Z',
    fill: pal.trouserRight,
    stroke: ink,
    'stroke-width': '2.6',
  }, legsG);
  el('path', {
    d: 'M 316 892 L 352 894 L 352 922 Q 322 928 298 920 Q 298 904 316 892 Z',
    fill: pal.bootGold,
    stroke: ink,
    'stroke-width': '2.6',
  }, legsG);

  el('path', {
    d: 'M 386 794 L 424 792 Q 432 846 432 892 L 398 892 Q 394 844 386 794 Z',
    fill: pal.trouserLeft,
    stroke: ink,
    'stroke-width': '2.6',
  }, legsG);
  el('path', {
    d: 'M 398 890 L 432 890 L 434 918 Q 410 924 388 916 Z',
    fill: pal.bootGold,
    stroke: ink,
    'stroke-width': '2.6',
  }, legsG);

  // 2. Background Right Lead Arm (behind torso & sledgehammer shaft!)
  const leadArmG = el('g', {}, root);
  const leadArmFill = el('path', {
    fill: pal.skinRight,
    stroke: ink,
    'stroke-width': '2.5',
    'stroke-linejoin': 'round',
  }, leadArmG);
  const leadSleeveBody = el('path', {
    fill: pal.shirtRight,
    stroke: ink,
    'stroke-width': '2.5',
    'stroke-linejoin': 'round',
  }, leadArmG);
  const leadSleeveCuff = el('path', {
    fill: pal.cuffGold,
    stroke: ink,
    'stroke-width': '2.0',
    'stroke-linejoin': 'round',
  }, leadArmG);

  // 3. Upper Body Torso, Split Apron & Woven Flat-Cap Head (leans powerfully into every blow!)
  const upperG = el('g', {}, root);

  el('path', {
    d: 'M 348 612 Q 364 596 402 598 Q 440 600 448 628 L 434 700 L 352 700 Z',
    fill: pal.shirtRight,
    stroke: ink,
    'stroke-width': '2.6',
  }, upperG);
  el('path', {
    d: 'M 378 598 L 388 624 L 414 602 M 388 624 L 386 696',
    fill: 'none',
    stroke: ink,
    'stroke-width': '2.0',
  }, upperG);

  // Plaid/woodcut shirt fold accents matching reference
  el('path', {
    d: 'M 364 636 L 432 636 M 360 664 L 430 664 M 372 612 L 370 694 M 408 610 L 408 694',
    fill: 'none',
    stroke: ink,
    'stroke-width': '1.35',
    opacity: '0.52',
  }, upperG);

  el('path', {
    d: 'M 350 704 L 434 704 L 438 818 Q 392 828 344 816 Z',
    fill: pal.apronRight,
    stroke: ink,
    'stroke-width': '2.6',
  }, upperG);
  el('rect', { x: 348, y: 694, width: 88, height: 13, rx: 2, fill: pal.beltGold, stroke: ink, 'stroke-width': '2.2' }, upperG);
  el('path', {
    d: 'M 372 710 L 368 818 M 396 710 L 396 822 M 416 710 L 420 818',
    fill: 'none',
    stroke: ink,
    'stroke-width': '1.7',
  }, upperG);

  const headG = el('g', {}, upperG);
  el('path', { d: 'M 384 592 L 412 590 L 416 608 L 382 608 Z', fill: pal.skinRight, stroke: ink, 'stroke-width': '2.0' }, headG);
  el('path', {
    d: 'M 374 572 L 373 581 L 368 589 L 374 592 L 374 602 Q 388 606 406 596 L 412 574 Z',
    fill: pal.skinRight,
    stroke: ink,
    'stroke-width': '2.2',
    'stroke-linejoin': 'round',
  }, headG);
  el('path', { d: 'M 402 578 Q 408 580 406 588 Q 402 590 400 586', fill: pal.skinRight, stroke: ink, 'stroke-width': '1.7' }, headG);
  el('path', { d: 'M 374 578 Q 381 576 387 579', fill: 'none', stroke: ink, 'stroke-width': '2.1' }, headG);
  el('circle', { cx: 381, cy: 582, r: 1.9, fill: ink }, headG);
  el('path', { d: 'M 374 595 Q 380 595 384 594', fill: 'none', stroke: ink, 'stroke-width': '1.6' }, headG);

  // Rounded Craftsman Woven Cap + Brim + Tied Ribbon Tails
  el('path', {
    d: 'M 364 575 Q 368 553 398 554 Q 422 556 422 574 Q 394 571 364 575 Z',
    fill: pal.cuffGold,
    stroke: ink,
    'stroke-width': '2.3',
  }, headG);
  el('path', {
    d: 'M 362 575 Q 378 570 398 574 L 396 579 Q 376 576 362 578 Z',
    fill: pal.beltGold,
    stroke: ink,
    'stroke-width': '1.9',
  }, headG);
  el('path', {
    d: 'M 421 569 Q 435 568 443 578 Q 432 579 420 573 Z M 420 573 Q 430 580 433 588 Q 424 584 419 575 Z',
    fill: pal.cuffGold,
    stroke: ink,
    'stroke-width': '1.9',
  }, headG);

  // 4. Sledgehammer + Shaft-Locked Dual Hands + Foreground Left Trail Arm!
  const foreG = el('g', {}, root);

  const swooshArc = el('path', {
    d: 'M 286 504 Q 236 598 266 716',
    fill: 'none',
    stroke: pal.sparkCore,
    'stroke-width': '4.8',
    'stroke-linecap': 'round',
    opacity: '0',
  }, foreG);

  const frontHand = buildGoldGripHand(pal.skinRight, ink, 0.72, true);
  const trailHand = buildGoldGripHand(pal.skinRight, ink, 0.72, false);
  foreG.appendChild(frontHand.backGroup);
  foreG.appendChild(trailHand.backGroup);

  // Heavy Sledgehammer anchored at `sledgeCenter (0, 0)`:
  // - Long hickory shaft runs along `-X` (`x = -190 .. +12`), `+X` points from butt toward head!
  // - Flat striking face sits at local `y = -16.0` (`-19 .. +19, y = -16`), so at `sledgeDeg = 175°`,
  //   `(0, -16)` points straight down onto `(266, 718 + anvilDipY)` with `0.0px` gap!
  const sledgeG = el('g', {}, foreG);
  el('rect', {
    x: -190,
    y: -4.2,
    width: 202,
    height: 8.4,
    rx: 2.4,
    fill: pal.woodShaft,
    stroke: ink,
    'stroke-width': '2.4',
  }, sledgeG);

  // Heavy 3D Beveled Rectangular Steel Sledge Head (`x: -20..+20, y: -16..+15`)
  // Main broad side cheek (`-19,-12 -> +19,-12 -> +19,+11 -> -19,+11`)
  el('polygon', {
    points: '-19,-12 19,-12 19,11 -19,11',
    fill: pal.steelMid,
    stroke: ink,
    'stroke-width': '2.5',
    'stroke-linejoin': 'round',
  }, sledgeG);
  // Woodcut chisel lines across sledge cheek
  for (const lx of [-10, -2, 6, 14]) {
    el('line', { x1: lx, y1: -10, x2: lx, y2: 9, stroke: ink, 'stroke-width': '1.4' }, sledgeG);
  }
  // Striking face bevel along `y = -16.0` (`-19,-12 -> +19,-12 -> +15,-16 -> -15,-16`) — hits iron bar flush!
  el('polygon', {
    points: '-19,-12 19,-12 15,-16 -15,-16',
    fill: pal.steelDark,
    stroke: ink,
    'stroke-width': '2.2',
    'stroke-linejoin': 'round',
  }, sledgeG);
  // Top-back bright bevel (`-19,+11 -> +19,+11 -> +23,+15 -> -15,+15`)
  el('polygon', {
    points: '-19,11 19,11 23,15 -15,15',
    fill: pal.steelBright,
    stroke: ink,
    'stroke-width': '2.2',
    'stroke-linejoin': 'round',
  }, sledgeG);
  // Front nose bevel (`19,-12 -> 23,-8 -> 23,15 -> 19,11`)
  el('polygon', {
    points: '19,-12 23,-8 23,15 19,11',
    fill: pal.steelBright,
    stroke: ink,
    'stroke-width': '2.2',
    'stroke-linejoin': 'round',
  }, sledgeG);

  foreG.appendChild(frontHand.frontGroup);

  // Foreground Left Trail Arm (`trailArmIK`) + Rolled Sleeve + `trailHand.frontGroup`
  const trailArmFill = el('path', {
    fill: pal.skinRight,
    stroke: ink,
    'stroke-width': '2.5',
    'stroke-linejoin': 'round',
  }, foreG);
  const trailMuscle = el('path', {
    fill: 'none',
    stroke: ink,
    'stroke-width': '1.4',
    'stroke-linecap': 'round',
  }, foreG);
  const trailSleeveBody = el('path', {
    fill: pal.shirtRight,
    stroke: ink,
    'stroke-width': '2.5',
    'stroke-linejoin': 'round',
  }, foreG);
  const trailSleeveCuff = el('path', {
    fill: pal.cuffGold,
    stroke: ink,
    'stroke-width': '2.0',
    'stroke-linejoin': 'round',
  }, foreG);

  foreG.appendChild(trailHand.frontGroup);

  function update(pose) {
    const {
      torsoDeg,
      hipShiftX,
      hipShiftY,
      leadArmIK,
      trailArmIK,
      frontGrip,
      trailGrip,
      sledgeCenter,
      sledgeDeg,
      swoosh,
    } = pose.right;

    upperG.setAttribute(
      'transform',
      `translate(${hipShiftX.toFixed(1)} ${hipShiftY.toFixed(1)}) rotate(${torsoDeg.toFixed(2)} 392 704)`
    );

    const leadGeo = organicArmGeometry(leadArmIK.shoulder, leadArmIK.elbow, leadArmIK.wrist, 14.5, 12.2, 8.6);
    leadArmFill.setAttribute('d', leadGeo.outlinePath);
    const leadSlv = rolledSleeveGeometry(leadArmIK.shoulder, leadArmIK.elbow, 0.58, 16.0, 14.0);
    leadSleeveBody.setAttribute('d', leadSlv.bodyPath);
    leadSleeveCuff.setAttribute('d', leadSlv.cuffPath);

    const trailGeo = organicArmGeometry(trailArmIK.shoulder, trailArmIK.elbow, trailArmIK.wrist, 15.0, 12.8, 8.8);
    trailArmFill.setAttribute('d', trailGeo.outlinePath);
    trailMuscle.setAttribute('d', trailGeo.muscleLinePath);
    const trailSlv = rolledSleeveGeometry(trailArmIK.shoulder, trailArmIK.elbow, 0.58, 16.5, 14.2);
    trailSleeveBody.setAttribute('d', trailSlv.bodyPath);
    trailSleeveCuff.setAttribute('d', trailSlv.cuffPath);

    sledgeG.setAttribute(
      'transform',
      `translate(${sledgeCenter.x.toFixed(1)} ${sledgeCenter.y.toFixed(1)}) rotate(${sledgeDeg.toFixed(2)})`
    );
    frontHand.updatePose(frontGrip, sledgeDeg);
    trailHand.updatePose(trailGrip, sledgeDeg);

    swooshArc.setAttribute('opacity', swoosh > 0.05 ? swoosh.toFixed(2) : '0');
  }

  return { update };
}
