// src/openings/gold_svg/hearth_and_anvil.js
// Pure-Vector 1:1 Grid-Traced Hearth, Arched Kiln, Roaring Woodcut Flames, Horned Anvil,
// Flat Glowing Forged Iron Billet (`top surface y = 718.0`), Oak Barrel, Bucket & Tool Rack.
// Parameterized by `pal` (`getPrintmakingPalette(mode)`) — ZERO SVG `<filter>` or `<mask>`!

import { el, setAttrs } from './defs.js';
import { BILLET_TOP_Y, LEFT_STRIKE_X, RIGHT_STRIKE_X, STRIKE_EVENTS, clamp, seededRng } from './kinematics.js';

const SPARK_POOL = 28;

export function buildHearthAndAnvilGroup(parent, pal) {
  const g = el('g', {}, parent);
  const ink = pal.ink;

  // 1. Subtle dry-point diagonal scratch lines above the arch (`y = 400..475`)
  const scratchG = el('g', { stroke: pal.scratchStroke, 'stroke-width': '1.1', opacity: '0.52' }, g);
  for (let i = 0; i < 14; i += 1) {
    const x0 = 216 + i * 10;
    const y0 = 454 - (i % 4) * 8;
    el('line', { x1: x0, y1: y0, x2: x0 + 32, y2: y0 - 36 }, scratchG);
  }

  // 2. Engraved Workshop Ground Cross-Hatching (`x = 18..445, y = 918..1002`)
  const floorG = el('g', { stroke: pal.floorStroke, 'stroke-linecap': 'round' }, g);
  for (let row = 0; row < 12; row += 1) {
    const fy = 918 + row * 6.6;
    const leftX = 18 + row * 7;
    const rightX = 432 - row * 9;
    el('line', {
      x1: leftX,
      y1: fy,
      x2: rightX,
      y2: fy,
      'stroke-width': row < 5 ? '2.1' : '1.35',
      opacity: (0.85 - row * 0.055).toFixed(2),
    }, floorG);

    for (let s = 0; s < 6; s += 1) {
      const sx = leftX + 24 + s * 56 + (row % 2) * 19;
      if (sx + 18 < rightX) {
        el('line', {
          x1: sx,
          y1: fy + 2.6,
          x2: sx + 20,
          y2: fy + 2.6,
          stroke: ink,
          'stroke-width': '2.2',
        }, floorG);
      }
    }
  }

  // 3. Arched Brick Kiln (`cx = 264, cy = 572, R_out = 114, R_in = 76`)
  const archCX = 264;
  const archCY = 572;
  const rOut = 114;
  const rIn = 76;
  const hearthY = 668;
  const kilnG = el('g', {}, g);

  el('path', {
    d: `M ${archCX - rIn} ${hearthY} L ${archCX - rIn} ${archCY} A ${rIn} ${rIn} 0 0 1 ${archCX + rIn} ${archCY} L ${archCX + rIn} ${hearthY} Z`,
    fill: '#130f0b',
    stroke: pal.scratchStroke,
    'stroke-width': '2',
  }, kilnG);

  const innerHatch = el('g', { stroke: pal.scratchStroke, 'stroke-width': '1.2', opacity: '0.68' }, kilnG);
  for (let h = 0; h < 16; h += 1) {
    const hx = 192 + h * 8.2;
    el('line', { x1: hx, y1: 598 - Math.min(60, h * 4), x2: hx + 26, y2: 552 - Math.min(48, h * 3) }, innerHatch);
  }

  // Left & Right Vertical Brick Piers (`y = 572..668`)
  for (const [px, isLeft] of [[archCX - rOut, true], [archCX + rIn, false]]) {
    for (let row = 0; row < 4; row += 1) {
      const by = archCY + row * 24;
      el('rect', {
        x: px,
        y: by + 1.5,
        width: rOut - rIn,
        height: 21,
        rx: 2,
        fill: isLeft ? pal.brickDim : pal.brickBright,
        stroke: ink,
        'stroke-width': '2.4',
      }, kilnG);
      el('line', {
        x1: px + 6,
        y1: by + 9,
        x2: px + 30,
        y2: by + 9,
        stroke: ink,
        'stroke-width': '1.3',
        opacity: '0.58',
      }, kilnG);
    }
  }

  // 11 Carved Radial Voussoir Arch Stones (`180° -> 360°`)
  const numWedges = 11;
  for (let i = 0; i < numWedges; i += 1) {
    const a0 = Math.PI + (i / numWedges) * Math.PI + 0.014;
    const a1 = Math.PI + ((i + 1) / numWedges) * Math.PI - 0.014;
    const x0o = archCX + Math.cos(a0) * rOut;
    const y0o = archCY + Math.sin(a0) * rOut;
    const x1o = archCX + Math.cos(a1) * rOut;
    const y1o = archCY + Math.sin(a1) * rOut;
    const x1i = archCX + Math.cos(a1) * rIn;
    const y1i = archCY + Math.sin(a1) * rIn;
    const x0i = archCX + Math.cos(a0) * rIn;
    const y0i = archCY + Math.sin(a0) * rIn;

    el('path', {
      d: `M ${x0o.toFixed(1)} ${y0o.toFixed(1)} A ${rOut} ${rOut} 0 0 1 ${x1o.toFixed(1)} ${y1o.toFixed(1)} L ${x1i.toFixed(1)} ${y1i.toFixed(1)} A ${rIn} ${rIn} 0 0 0 ${x0i.toFixed(1)} ${y0i.toFixed(1)} Z`,
      fill: i < 3 ? pal.brickDim : pal.brickBright,
      stroke: ink,
      'stroke-width': '2.6',
    }, kilnG);

    for (const rMid of [rIn + 12, rIn + 25]) {
      const mx0 = archCX + Math.cos(a0 + 0.04) * rMid;
      const my0 = archCY + Math.sin(a0 + 0.04) * rMid;
      const mx1 = archCX + Math.cos(a1 - 0.04) * rMid;
      const my1 = archCY + Math.sin(a1 - 0.04) * rMid;
      el('path', {
        d: `M ${mx0.toFixed(1)} ${my0.toFixed(1)} A ${rMid} ${rMid} 0 0 1 ${mx1.toFixed(1)} ${my1.toFixed(1)}`,
        fill: 'none',
        stroke: ink,
        'stroke-width': '1.35',
        opacity: '0.55',
      }, kilnG);
    }
  }

  // 4. Live 60fps Roaring Woodcut Flames + Coal Bed (`y = 656..668`)
  const mainFlamePath = el('path', {
    fill: pal.flameFill,
    stroke: ink,
    'stroke-width': '2.4',
    'stroke-linejoin': 'round',
  }, kilnG);
  const innerFlameVeins = el('path', {
    fill: 'none',
    stroke: ink,
    'stroke-width': '2.0',
    'stroke-linecap': 'round',
  }, kilnG);

  for (let c = 0; c < 8; c += 1) {
    el('ellipse', {
      cx: 204 + c * 16.5,
      cy: 660 + (c % 2) * 2.5,
      rx: 8.5,
      ry: 5.5,
      fill: pal.coalFill,
      stroke: ink,
      'stroke-width': '2.0',
    }, kilnG);
  }

  el('rect', {
    x: 186,
    y: 667,
    width: 158,
    height: 11,
    rx: 2,
    fill: pal.brickBright,
    stroke: ink,
    'stroke-width': '2.4',
  }, kilnG);

  // 5. Left Oak Stave Water Bucket (`x = 28..78, y = 755..842`)
  const bucketG = el('g', {}, g);
  el('path', {
    d: 'M 33 786 C 33 752, 73 752, 73 786',
    fill: 'none',
    stroke: pal.floorStroke,
    'stroke-width': '2.6',
  }, bucketG);
  el('path', {
    d: 'M 28 786 L 78 786 L 72 840 Q 53 847 34 840 Z',
    fill: pal.apronLeft,
    stroke: ink,
    'stroke-width': '2.2',
  }, bucketG);
  for (const sx of [39, 48, 58, 67]) {
    el('line', { x1: sx, y1: 787, x2: sx + (sx - 53) * 0.1, y2: 842, stroke: ink, 'stroke-width': '1.4' }, bucketG);
  }
  el('rect', { x: 27, y: 785, width: 52, height: 5.5, rx: 1.5, fill: pal.beltGold, stroke: ink, 'stroke-width': '1.6' }, bucketG);
  el('rect', { x: 30, y: 804, width: 46, height: 5, rx: 1.2, fill: pal.barrelHoop, stroke: ink, 'stroke-width': '1.5' }, bucketG);

  // 6. Upper-Right Hanging 3-Rod Forge Tool Rack (`x = 414..464, y = 458..556`)
  const rackG = el('g', {}, g);
  el('rect', { x: 414, y: 458, width: 50, height: 7, rx: 2, fill: pal.beltGold, stroke: ink, 'stroke-width': '2.0' }, rackG);
  for (const rx of [424, 439, 454]) {
    el('rect', { x: rx - 3, y: 465, width: 6, height: 84, rx: 2, fill: pal.woodShaft, stroke: ink, 'stroke-width': '1.8' }, rackG);
    el('circle', { cx: rx, cy: 552, r: 4.5, fill: 'none', stroke: pal.sparkCore, 'stroke-width': '2.3' }, rackG);
  }

  // 7. Cylindrical Riveted-Hoop Oak Stave Barrel (`x = 194..318, y = 790..928`)
  const barrelG = el('g', {}, g);
  el('path', {
    d: 'M 196 798 Q 192 862 198 924 Q 256 936 314 924 Q 320 862 316 798 Z',
    fill: pal.barrelBody,
    stroke: ink,
    'stroke-width': '2.8',
  }, barrelG);
  el('ellipse', {
    cx: 256,
    cy: 798,
    rx: 61,
    ry: 9.5,
    fill: pal.barrelLid,
    stroke: ink,
    'stroke-width': '2.5',
  }, barrelG);
  for (const sx of [210, 225, 240, 256, 272, 287, 302]) {
    el('line', { x1: sx, y1: 806, x2: sx, y2: 928, stroke: ink, 'stroke-width': '2.1' }, barrelG);
  }
  for (const hy of [806, 868]) {
    el('path', {
      d: `M 194 ${hy} Q 256 ${hy + 8} 318 ${hy} L 318 ${hy + 10} Q 256 ${hy + 18} 194 ${hy + 10} Z`,
      fill: pal.barrelHoop,
      stroke: ink,
      'stroke-width': '2.2',
    }, barrelG);
    for (const rvx of [208, 232, 256, 280, 304]) {
      el('circle', { cx: rvx, cy: hy + 6, r: 2.0, fill: pal.sparkCore }, barrelG);
    }
  }

  // 8. Horned London Anvil + Flat Glowing Forged Iron Bar (`top y = 718.0` across `x = 212..294`!)
  const anvilG = el('g', {}, g);
  el('path', {
    d: 'M 168 734 Q 194 726 220 726 L 344 730 L 342 742 Q 308 750 298 768 L 308 788 L 204 788 L 216 768 Q 208 748 168 734 Z',
    fill: pal.anvilBody,
    stroke: ink,
    'stroke-width': '2.8',
    'stroke-linejoin': 'round',
  }, anvilG);
  for (let k = 0; k < 9; k += 1) {
    el('line', {
      x1: 214 + k * 9.5,
      y1: 746,
      x2: 226 + k * 9.5,
      y2: 778,
      stroke: ink,
      'stroke-width': '1.6',
    }, anvilG);
  }
  // Anvil flat steel top table (`y = 728..736`)
  el('path', {
    d: 'M 168 733 Q 196 725 224 726 L 345 729 L 336 738 L 214 737 Z',
    fill: pal.anvilTop,
    stroke: ink,
    'stroke-width': '2.4',
  }, anvilG);
  el('rect', { x: 202, y: 784, width: 108, height: 11, rx: 3, fill: pal.anvilTop, stroke: ink, 'stroke-width': '2.3' }, anvilG);

  // Glowing flat forged iron billet bar (`top striking surface strictly at y = BILLET_TOP_Y = 718.0`!)
  const billetEl = el('path', {
    d: `M 212 ${BILLET_TOP_Y} L 294 ${BILLET_TOP_Y} Q 299 ${BILLET_TOP_Y + 6} 292 ${BILLET_TOP_Y + 12} L 214 ${BILLET_TOP_Y + 12} Q 208 ${BILLET_TOP_Y + 6} 212 ${BILLET_TOP_Y} Z`,
    fill: pal.billetHot,
    stroke: ink,
    'stroke-width': '2.4',
  }, anvilG);
  // White-hot core sheen along top edge of iron bar so contact is 100% unmistakable!
  const billetRim = el('line', {
    x1: 216,
    y1: BILLET_TOP_Y + 2.2,
    x2: 290,
    y2: BILLET_TOP_Y + 2.2,
    stroke: pal.sparkCore,
    'stroke-width': '2.2',
    'stroke-linecap': 'round',
  }, anvilG);

  // 9. Impact Bloom, Shock Ring, Woodcut Crown Rays & Ballistic Forge Sparks
  const fxG = el('g', {}, g);
  const impactBloom = el('circle', { r: '36', fill: 'url(#gf-impact-bloom)', opacity: '0' }, fxG);
  const shockRing = el('ellipse', {
    rx: '14',
    ry: '5',
    fill: 'none',
    stroke: pal.sparkCore,
    'stroke-width': '2.4',
    opacity: '0',
  }, fxG);

  const crownAngles = [-154, -138, -120, -103, -88, -73, -57, -40, -24];
  const crownRays = crownAngles.map((deg, idx) => ({
    deg,
    idx,
    line: el('line', {
      stroke: idx % 2 === 0 ? pal.sparkCore : pal.sparkGold,
      'stroke-width': idx % 2 === 0 ? '2.7' : '2.0',
      'stroke-linecap': 'round',
    }, fxG),
  }));

  const sparkStreaks = [];
  for (let i = 0; i < SPARK_POOL; i += 1) {
    sparkStreaks.push(
      el('line', {
        stroke: i % 3 === 0 ? pal.sparkCore : pal.sparkGold,
        'stroke-width': i % 2 === 0 ? '2.4' : '1.7',
        'stroke-linecap': 'round',
        opacity: '0',
      }, fxG)
    );
  }

  function update(pose) {
    const { realT, anvilDipY, flash, leftFlash, rightFlash, billetSurfaceY } = pose;

    anvilG.setAttribute('transform', `translate(0 ${anvilDipY.toFixed(2)})`);
    billetEl.setAttribute('fill', flash > 0.25 ? pal.billetFlash : pal.billetHot);
    billetRim.setAttribute('opacity', (0.65 + flash * 0.35).toFixed(2));

    // Roaring S-curved woodcut flames
    const s1 = Math.sin(realT * 9.5) * 6;
    const s2 = Math.cos(realT * 12.2) * 7;
    const s3 = Math.sin(realT * 14.8 + 1.2) * 5;
    const boost = flash * 16;

    mainFlamePath.setAttribute(
      'd',
      [
        'M 206 656',
        `C 198 632, ${210 + s1} 602, ${224 + s1 * 0.6} ${576 - boost * 0.5}`,
        'C 226 596, 232 608, 236 614',
        `C 234 584, ${248 + s2} 556, ${264 + s2 * 0.7} ${532 - boost}`,
        'C 272 558, 268 580, 276 594',
        `C 282 572, ${296 + s3} 558, ${304 + s3} ${546 - boost * 0.6}`,
        'C 308 574, 300 598, 308 612',
        'C 316 600, 324 588, 326 578',
        'C 330 610, 322 638, 316 656 Z',
      ].join(' ')
    );
    innerFlameVeins.setAttribute(
      'd',
      `M 228 652 Q ${226 + s1 * 0.5} 620 234 598 M 256 654 Q ${254 + s2 * 0.6} 605 ${264 + s2 * 0.4} 562 M 286 652 Q ${292 + s3 * 0.5} 616 298 584`
    );

    // Impact bloom & shock ring right at the exact contact point (`236` Left or `266` Right!)
    const hitX = rightFlash >= leftFlash ? RIGHT_STRIKE_X : LEFT_STRIKE_X;
    if (flash > 0.06) {
      setAttrs(impactBloom, {
        cx: hitX.toFixed(1),
        cy: billetSurfaceY.toFixed(1),
        r: (24 + flash * 32).toFixed(1),
        opacity: clamp(flash * 0.88, 0, 1).toFixed(2),
      });
      setAttrs(shockRing, {
        cx: hitX.toFixed(1),
        cy: billetSurfaceY.toFixed(1),
        rx: (14 + (1.2 - Math.min(1, flash)) * 46).toFixed(1),
        ry: (4 + (1.2 - Math.min(1, flash)) * 14).toFixed(1),
        opacity: clamp(flash * 0.78, 0, 1).toFixed(2),
      });
    } else {
      impactBloom.setAttribute('opacity', '0');
      shockRing.setAttribute('opacity', '0');
    }

    // Radial woodcut spark crown above the billet
    const rayPulse = 0.32 + flash * 0.98;
    for (const r of crownRays) {
      const rad = (r.deg * Math.PI) / 180;
      const jitter = Math.sin(realT * 18 + r.idx * 2.1) * 2.8;
      const r0 = 11 + (r.idx % 2) * 5;
      const r1 = r0 + (15 + (r.idx % 3) * 8) * rayPulse + jitter;
      setAttrs(r.line, {
        x1: (hitX + Math.cos(rad) * r0).toFixed(1),
        y1: (billetSurfaceY - 2 + Math.sin(rad) * r0).toFixed(1),
        x2: (hitX + Math.cos(rad) * r1).toFixed(1),
        y2: (billetSurfaceY - 2 + Math.sin(rad) * r1).toFixed(1),
        opacity: clamp(0.38 + flash * 0.82, 0, 1).toFixed(2),
      });
    }

    // Ballistic flying forge sparks (`v3_woodcut` deterministic particle pool)
    let cursor = 0;
    for (let h = 0; h < STRIKE_EVENTS.length && cursor < SPARK_POOL; h += 1) {
      const ev = STRIKE_EVENTS[h];
      const age = realT - ev.t;
      if (age < 0 || age > 0.42) continue;

      const isRight = ev.hand === 'R';
      const ox = isRight ? RIGHT_STRIKE_X : LEFT_STRIKE_X;
      const oy = BILLET_TOP_Y + 1;
      const count = isRight ? 14 : 9;
      const rng = seededRng(Math.floor(ev.t * 1000) * 97 + (isRight ? 53 : 19));

      for (let k = 0; k < count && cursor < SPARK_POOL; k += 1) {
        const life = (isRight ? 0.28 : 0.22) + rng() * 0.14;
        if (age > life) continue;

        const dir = rng() < 0.5 ? -Math.PI * (0.06 + rng() * 0.34) : -Math.PI + rng() * Math.PI * 0.36;
        const speed = (isRight ? 220 : 155) + rng() * (isRight ? 260 : 180);
        const vx = Math.cos(dir) * speed;
        const vy0 = Math.sin(dir) * speed * 0.65 - (isRight ? 95 : 55);
        const grav = 680;
        const tEff = age + 0.018;
        const x = ox + vx * tEff;
        const y = Math.min(918, oy + vy0 * tEff + 0.5 * grav * tEff * tEff);
        const vy = vy0 + grav * tEff;
        const dtTrail = 0.024;
        const op = clamp(1 - age / life, 0, 1);

        setAttrs(sparkStreaks[cursor], {
          x1: x.toFixed(1),
          y1: y.toFixed(1),
          x2: (x - vx * dtTrail).toFixed(1),
          y2: (y - vy * dtTrail).toFixed(1),
          opacity: op.toFixed(2),
        });
        cursor += 1;
      }
    }

    while (cursor < SPARK_POOL) {
      if (sparkStreaks[cursor].getAttribute('opacity') !== '0') {
        sparkStreaks[cursor].setAttribute('opacity', '0');
      }
      cursor += 1;
    }
  }

  return { update };
}
