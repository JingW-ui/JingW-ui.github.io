// src/openings/gold_svg/smith_left.js
// Pure-Vector Left Bearded Master Blacksmith (`x:44..245, y:548..928`):
// - Uses Target-First 2-Bone IK (`organicArmGeometry` + `rolledSleeveGeometry` + `buildGoldGripHand`)
// - Guarantees the 3D Beveled Square-Block Hand Hammer strikes FLUSH (`0.0px` gap) onto `(236, 718 + anvilDipY)`!

import { el, setAttrs } from './defs.js';
import { buildGoldGripHand, organicArmGeometry, rolledSleeveGeometry } from './kinematics.js';

export function buildLeftMasterSmithGroup(parent, pal) {
  const root = el('g', {}, parent);
  const ink = pal.ink;

  // 1. Lower Trousers & Laced Work Boots (`y = 790..926`) — firmly planted on workshop floor
  const legsG = el('g', {}, root);
  el('path', {
    d: 'M 76 790 L 116 795 Q 104 848 92 892 L 52 886 Q 64 840 76 790 Z',
    fill: pal.trouserLeft,
    stroke: ink,
    'stroke-width': '2.6',
  }, legsG);
  el('path', { d: 'M 84 804 L 68 880 M 96 808 L 80 884', fill: 'none', stroke: ink, 'stroke-width': '1.5' }, legsG);
  el('path', {
    d: 'M 52 886 L 90 890 Q 106 904 106 918 Q 82 928 45 920 Q 43 904 52 886 Z',
    fill: pal.bootGold,
    stroke: ink,
    'stroke-width': '2.6',
  }, legsG);
  el('path', { d: 'M 45 915 Q 80 923 105 915', fill: 'none', stroke: pal.sparkCore, 'stroke-width': '2.0' }, legsG);

  el('path', {
    d: 'M 128 792 L 168 784 Q 184 838 194 888 L 156 892 Q 142 842 128 792 Z',
    fill: pal.trouserLeft,
    stroke: ink,
    'stroke-width': '2.6',
  }, legsG);
  el('path', { d: 'M 144 802 L 166 884 M 158 798 L 180 882', fill: 'none', stroke: ink, 'stroke-width': '1.5' }, legsG);
  el('path', {
    d: 'M 156 888 L 194 886 Q 218 902 218 916 Q 190 926 156 918 Z',
    fill: pal.bootGold,
    stroke: ink,
    'stroke-width': '2.6',
  }, legsG);
  el('path', { d: 'M 157 913 Q 190 921 217 913', fill: 'none', stroke: pal.sparkCore, 'stroke-width': '2.0' }, legsG);

  // 2. Far Left Tongs Arm + Riveted Forging Tongs clamping the glowing billet at `(224, 722 + anvilDipY)`!
  const tongsArmG = el('g', {}, root);
  el('path', {
    d: 'M 144 642 Q 160 668 174 676 L 164 692 Q 146 680 134 658 Z',
    fill: pal.skinLeft,
    stroke: ink,
    'stroke-width': '2.3',
  }, tongsArmG);
  el('path', {
    d: 'M 164 678 L 226 720 M 160 685 L 224 727',
    fill: 'none',
    stroke: pal.beltGold,
    'stroke-width': '4.2',
    'stroke-linecap': 'round',
  }, tongsArmG);
  el('path', {
    d: 'M 164 678 L 226 720 M 160 685 L 224 727',
    fill: 'none',
    stroke: ink,
    'stroke-width': '1.3',
  }, tongsArmG);
  el('path', {
    d: 'M 164 672 Q 184 670 188 684 Q 182 696 166 692 Z',
    fill: pal.skinLeft,
    stroke: ink,
    'stroke-width': '2.2',
  }, tongsArmG);

  // 3. Upper Torso + Bib Apron + Bearded 3/4 Head (pivots into every hammer blow around waist `(122, 704)`)
  const upperG = el('g', {}, root);

  el('path', {
    d: 'M 68 632 Q 70 604 102 598 L 146 604 Q 164 616 166 644 L 158 700 L 76 700 Z',
    fill: pal.shirtLeft,
    stroke: ink,
    'stroke-width': '2.6',
  }, upperG);
  el('path', { d: 'M 102 598 L 130 628 L 144 604', fill: 'none', stroke: ink, 'stroke-width': '2.2' }, upperG);

  // Leather bib apron + shoulder straps + brass rings + pocket
  el('path', {
    d: 'M 94 624 L 154 624 L 160 700 L 174 822 Q 124 832 74 818 L 80 700 Z',
    fill: pal.apronLeft,
    stroke: ink,
    'stroke-width': '2.6',
    'stroke-linejoin': 'round',
  }, upperG);
  el('path', {
    d: 'M 96 600 L 104 626 M 142 604 L 148 626',
    stroke: pal.cuffGold,
    'stroke-width': '6',
    'stroke-linecap': 'round',
  }, upperG);
  el('circle', { cx: 104, cy: 627, r: 3.2, fill: 'none', stroke: pal.sparkCore, 'stroke-width': '1.8' }, upperG);
  el('circle', { cx: 148, cy: 627, r: 3.2, fill: 'none', stroke: pal.sparkCore, 'stroke-width': '1.8' }, upperG);

  el('rect', { x: 76, y: 695, width: 84, height: 13, rx: 2, fill: pal.beltGold, stroke: ink, 'stroke-width': '2.2' }, upperG);
  el('line', { x1: 78, y1: 701.5, x2: 158, y2: 701.5, stroke: ink, 'stroke-width': '1.5' }, upperG);
  el('path', {
    d: 'M 113 716 L 148 716 L 146 756 Q 130 760 115 756 Z',
    fill: pal.apronLeft,
    stroke: ink,
    'stroke-width': '2.1',
  }, upperG);
  el('line', { x1: 113, y1: 724, x2: 148, y2: 724, stroke: ink, 'stroke-width': '1.6' }, upperG);
  el('path', {
    d: 'M 94 714 Q 90 768 86 814 M 108 716 Q 106 772 104 820 M 154 714 Q 160 768 164 818',
    fill: 'none',
    stroke: ink,
    'stroke-width': '1.7',
  }, upperG);

  // Sculpted 3/4 Bearded Craftsman Head + Tied Headband & Tails
  const headG = el('g', {}, upperG);
  el('path', { d: 'M 108 590 L 136 594 L 134 616 L 104 606 Z', fill: pal.skinLeft, stroke: ink, 'stroke-width': '2.0' }, headG);
  el('path', { d: 'M 102 566 Q 92 582 96 598 Q 106 602 114 592 Z', fill: pal.hairDark, stroke: ink, 'stroke-width': '2.2' }, headG);
  el('path', {
    d: 'M 110 560 Q 134 552 150 564 L 149 576 L 155 588 L 148 592 L 146 606 L 116 600 Z',
    fill: pal.skinLeft,
    stroke: ink,
    'stroke-width': '2.2',
    'stroke-linejoin': 'round',
  }, headG);
  el('path', { d: 'M 118 572 Q 112 576 115 585 Q 119 587 121 582', fill: pal.skinLeft, stroke: ink, 'stroke-width': '1.8' }, headG);
  el('path', {
    d: 'M 122 578 Q 124 592 134 592 Q 144 589 150 592 Q 149 606 138 610 Q 122 608 118 592 Z',
    fill: pal.hairDark,
    stroke: ink,
    'stroke-width': '2.2',
  }, headG);
  el('path', { d: 'M 136 591 Q 144 589 150 593', fill: 'none', stroke: pal.beltGold, 'stroke-width': '1.5' }, headG);
  el('path', { d: 'M 136 575 Q 144 574 149 577', fill: 'none', stroke: ink, 'stroke-width': '2.2' }, headG);
  el('circle', { cx: 142, cy: 579.5, r: 1.9, fill: ink }, headG);
  el('path', { d: 'M 104 560 Q 126 544 150 558 L 151 564 Q 126 556 102 564 Z', fill: pal.hairDark, stroke: ink, 'stroke-width': '2.2' }, headG);
  el('path', { d: 'M 101 560 Q 128 555 153 565 L 152 573 Q 128 564 100 569 Z', fill: pal.shirtLeft, stroke: ink, 'stroke-width': '2.1' }, headG);
  el('path', {
    d: 'M 100 565 Q 86 566 80 578 Q 92 577 101 569 Z M 101 568 Q 92 576 90 587 Q 98 582 102 571 Z',
    fill: pal.shirtLeft,
    stroke: ink,
    'stroke-width': '2.0',
  }, headG);

  // 4. World-Space 2-Bone IK Muscular Hammer Arm + Rolled Sleeve + 3D Square-Block Hand Hammer!
  const dynG = el('g', {}, root);

  const swooshArc = el('path', {
    d: 'M 212 604 Q 246 654 236 716',
    fill: 'none',
    stroke: pal.sparkCore,
    'stroke-width': '3.6',
    'stroke-linecap': 'round',
    opacity: '0',
  }, dynG);

  const armFill = el('path', {
    fill: pal.skinLeft,
    stroke: ink,
    'stroke-width': '2.5',
    'stroke-linejoin': 'round',
  }, dynG);
  const armMuscle = el('path', {
    fill: 'none',
    stroke: ink,
    'stroke-width': '1.45',
    'stroke-linecap': 'round',
  }, dynG);

  const sleeveBody = el('path', {
    fill: pal.shirtLeft,
    stroke: ink,
    'stroke-width': '2.5',
    'stroke-linejoin': 'round',
  }, dynG);
  const sleeveCuff = el('path', {
    fill: pal.cuffGold,
    stroke: ink,
    'stroke-width': '2.1',
    'stroke-linejoin': 'round',
  }, dynG);

  const gripHand = buildGoldGripHand(pal.skinLeft, ink, 0.72, false);
  dynG.appendChild(gripHand.backGroup);

  // Hammer group anchored at `headCenter` `(0, 0)` with flat striking face at local `(0, +12.0)`!
  const hammerG = el('g', {}, dynG);
  // Hickory handle along `-X` (`-68..0`, gripped at `-52`)
  el('rect', {
    x: -68,
    y: -3.6,
    width: 68,
    height: 7.2,
    rx: 2.0,
    fill: pal.woodShaft,
    stroke: ink,
    'stroke-width': '2.2',
  }, hammerG);
  // 3D Beveled Square-Block Steel Hammer Head (`x: -14..+14, y: -15..+12` -> bottom face at `y = +12.0`!)
  // Main front cheek (`-13,-10 -> +13,-10 -> +13,+12 -> -13,+12`)
  el('polygon', {
    points: '-13,-10 13,-10 13,12 -13,12',
    fill: pal.steelMid,
    stroke: ink,
    'stroke-width': '2.3',
    'stroke-linejoin': 'round',
  }, hammerG);
  // Top isometric bright bevel (`-13,-10 -> -6,-16 -> +18,-16 -> +13,-10`)
  el('polygon', {
    points: '-13,-10 -6,-16 18,-16 13,-10',
    fill: pal.steelBright,
    stroke: ink,
    'stroke-width': '2.2',
    'stroke-linejoin': 'round',
  }, hammerG);
  el('ellipse', { cx: 3, cy: -13, rx: 3.6, ry: 1.5, fill: ink }, hammerG);
  // Right isometric bevel (`13,-10 -> 18,-16 -> 18,6 -> 13,12`)
  el('polygon', {
    points: '13,-10 18,-16 18,6 13,12',
    fill: pal.steelDark,
    stroke: ink,
    'stroke-width': '2.2',
    'stroke-linejoin': 'round',
  }, hammerG);

  dynG.appendChild(gripHand.frontGroup);

  function update(pose) {
    const { anvilDipY, left } = pose;
    const { torsoDeg, armIK, headCenter, hammerDeg, swoosh } = left;

    upperG.setAttribute('transform', `rotate(${torsoDeg.toFixed(2)} 122 704)`);
    tongsArmG.setAttribute('transform', `translate(0 ${(anvilDipY * 0.65).toFixed(2)})`);

    const armGeo = organicArmGeometry(armIK.shoulder, armIK.elbow, armIK.wrist, 14.8, 12.6, 8.8);
    armFill.setAttribute('d', armGeo.outlinePath);
    armMuscle.setAttribute('d', armGeo.muscleLinePath);

    const slvGeo = rolledSleeveGeometry(armIK.shoulder, armIK.elbow, 0.56, 16.5, 14.5);
    sleeveBody.setAttribute('d', slvGeo.bodyPath);
    sleeveCuff.setAttribute('d', slvGeo.cuffPath);

    hammerG.setAttribute(
      'transform',
      `translate(${headCenter.x.toFixed(1)} ${headCenter.y.toFixed(1)}) rotate(${hammerDeg.toFixed(2)})`
    );
    gripHand.updatePose(armIK.wrist, hammerDeg);
    swooshArc.setAttribute('opacity', swoosh > 0.05 ? swoosh.toFixed(2) : '0');
  }

  return { update };
}
