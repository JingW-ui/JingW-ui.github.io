// src/scenes/s10_wayang.js
// #10 爪哇皮影戏 Wayang Kulit (c. 1800, Kraton Yogyakarta Shadow Theatre — r3 Museum Masterpiece)
// - 100% pure shadow-theatre canvas (zero modern UI box, zero computer fonts inside painting; outer frame carries museum placard)
// - Hand-spun slubbed cotton Kelir screen with oil-smoke aging; full-width symmetrical perforated Suluran valance
// - Authentic spatial optics: Blencong brass Garuda oil lamp hangs BEHIND the cotton Kelir (soft-focus rear-projected
//   lamp silhouette + cloth-transmitted incandescent wick core, never a front-pasted sticker!)
// - Fibrous cylindrical banana pseudostem (Debog) with sheath arcs, sap stains & spike scars; carved teak Kotak beam
//   with pure hand-drawn Javanese Ukiran medallion; hand-waxed Batik Tulis Parang Rusak skirt with malam wax crackle
// - Ceremonial Rata Garuda perforated Ukiran Naga-Suluran chariot (zero straight steel diamond tubes!) + Sungging
//   drenjeman dot-stippled polychrome & Prada gold craquelure on translucent water-buffalo hide
// - Three core physical animation mechanisms at 10Hz (`quantizeTime(t, 10)`, smoothly blended at x<95 / x>905):
//   ① Z-depth screen-contact optical breathing + differential upper/lower Z-tilt (razor-sharp Tatahan pinholes when
//     pressed against Kelir <-> expanding warm chestnut-amber soft-focus penumbra when lifted toward Blencong!)
//   ② 7-joint bone-rivet (`Gegel`) 10Hz pendulum staccato & settle (chassis pitch, torso rock, head nod, clacking
//     Garuda jaws, 2-link elbow-whipping wing salute, ankle claw hinges)
//   ③ Naturally curved translucent ox-horn `Cempurit` rods with thread-wrapped bamboo grips (`细竹柄缠线`),
//     oblique X-crossing choreography & 10Hz Dalang wrist-flick tremors!

import {
  PANEL_SIZE,
  ROAD_EDGE_Y,
  SCENE_SEC,
  BEAT_SEC,
  clamp,
  lerp,
  smoothstep,
  quantizeTime,
} from '../beat/timeline.js';
import { computePelicanRig } from '../rig/pelican.js';

/**
 * Punches a row of hand-chiseled Tatahan lace pinholes (`destination-out` must be active)
 * with slight artisanal radius & angle variation so it never looks machine-drilled.
 */
function punchHoleRow(ctx, x0, y0, x1, y1, count, radius, seed = 1) {
  for (let i = 0; i < count; i++) {
    const u = count === 1 ? 0.5 : i / (count - 1);
    const jitter = Math.sin(seed * 7.13 + i * 3.71) * 0.14;
    const r = Math.max(0.8, radius * (1 + jitter));
    const cx = lerp(x0, x1, u);
    const cy = lerp(y0, y1, u);
    ctx.beginPath();
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + i * 0.3;
      const rr = r * (k % 2 === 0 ? 1.04 : 0.94);
      if (k === 0) ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      else ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * Punches a curved arc of hand-chiseled Tatahan lace pinholes around `(cx, cy)`.
 */
function punchHoleArc(ctx, cx, cy, r, a0, a1, count, holeR) {
  for (let i = 0; i < count; i++) {
    const u = count === 1 ? 0.5 : i / (count - 1);
    const a = lerp(a0, a1, u);
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    ctx.beginPath();
    for (let k = 0; k < 8; k++) {
      const ka = (k / 8) * Math.PI * 2 + a;
      const rr = holeR * (k % 2 === 0 ? 1.05 : 0.93);
      if (k === 0) ctx.moveTo(px + Math.cos(ka) * rr, py + Math.sin(ka) * rr);
      else ctx.lineTo(px + Math.cos(ka) * rr, py + Math.sin(ka) * rr);
    }
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * Punches a curved Javanese comma/petal slot (` Tatahan Semut Dulur / Lung-lungan `).
 */
function punchPetalSlot(ctx, x, y, rx, ry, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(-rx, 0);
  ctx.quadraticCurveTo(-rx * 0.15, -ry * 1.32, rx, -ry * 0.12);
  ctx.quadraticCurveTo(rx * 0.12, ry * 1.28, -rx, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Paints traditional Javanese `Sungging Drenjeman` hand-stippled pigment dot gradations
 * inside a clipped buffalo-hide region (eliminating flat vector fills!).
 */
function paintSunggingStipple(ctx, cx, cy, rx, ry, baseCol, midCol, tipCol, rng, dots = 42) {
  ctx.save();
  ctx.fillStyle = baseCol;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < dots; i++) {
    const u = rng();
    const a = rng() * Math.PI * 2;
    const dist = Math.sqrt(u);
    const px = cx + Math.cos(a) * rx * dist * 0.92;
    const py = cy + Math.sin(a) * ry * dist * 0.92;
    ctx.fillStyle = dist < 0.52 ? tipCol : midCol;
    ctx.globalAlpha = dist < 0.52 ? 0.78 : 0.62;
    const dr = (1.1 + rng() * 1.5) * (1.15 - dist * 0.35);
    ctx.beginPath();
    ctx.moveTo(px - dr, py);
    ctx.quadraticCurveTo(px, py - dr, px + dr, py);
    ctx.quadraticCurveTo(px, py + dr, px - dr, py);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Bakes a 220x500 translucent Javanese Gunungan / Kayon (Tree of Life) puppet stamp
 * with `Sungging` stippled polychrome, `Prada` gold-leaf craquelure, and airy `Tatahan` lace,
 * plus a warm chestnut-amber rear-projection shadow copy!
 */
function getBakedKayonAssets(kit) {
  const puppet = kit.bake2D('s10_wayang_kayon_v3', (_g, ctx, rng) => {
    const cx = 110;
    const topY = 16;
    const botY = 474;
    ctx.clearRect(0, 0, 220, 500);

    const traceKayonOutline = (inset = 0) => {
      const w = 90 - inset;
      ctx.beginPath();
      ctx.moveTo(cx, topY + inset * 1.4);
      ctx.bezierCurveTo(cx + w * 0.36, topY + 92, cx + w * 1.08, topY + 204, cx + w * 0.92, topY + 324);
      ctx.bezierCurveTo(cx + w * 0.78, topY + 394, cx + w * 0.52, botY - 24, cx + w * 0.44, botY - inset);
      ctx.lineTo(cx - w * 0.44, botY - inset);
      ctx.bezierCurveTo(cx - w * 0.52, botY - 24, cx - w * 0.78, topY + 394, cx - w * 0.92, topY + 324);
      ctx.bezierCurveTo(cx - w * 1.08, topY + 204, cx - w * 0.36, topY + 92, cx, topY + inset * 1.4);
      ctx.closePath();
    };

    // Translucent dark-roasted water-buffalo parchment base (`Kulit Kerbau`)
    ctx.fillStyle = '#240f05';
    traceKayonOutline(0);
    ctx.fill();

    ctx.save();
    traceKayonOutline(5.5);
    ctx.clip();

    const innerGrad = ctx.createLinearGradient(0, topY, 0, botY);
    innerGrad.addColorStop(0.0, '#962215');
    innerGrad.addColorStop(0.38, '#381507');
    innerGrad.addColorStop(0.72, '#165b4a');
    innerGrad.addColorStop(1.0, '#781d12');
    ctx.fillStyle = innerGrad;
    ctx.fillRect(0, 0, 220, 500);

    // Warm buffalo-hide collagen translucency mottling & Sungging stippling
    for (let i = 0; i < 160; i++) {
      const mx = 20 + rng() * 180;
      const my = topY + rng() * (botY - topY);
      ctx.fillStyle = rng() > 0.45 ? 'rgba(248, 186, 68, 0.14)' : 'rgba(22, 8, 3, 0.22)';
      const mr = 2 + rng() * 7;
      ctx.fillRect(mx, my, mr, mr * 0.65);
    }

    // Winged Javanese Candi Larasati temple portal at base
    ctx.fillStyle = '#c88926';
    ctx.beginPath();
    ctx.moveTo(cx - 37, botY);
    ctx.lineTo(cx - 28, botY - 98);
    ctx.lineTo(cx - 48, botY - 113);
    ctx.lineTo(cx, botY - 146);
    ctx.lineTo(cx + 48, botY - 113);
    ctx.lineTo(cx + 28, botY - 98);
    ctx.lineTo(cx + 37, botY);
    ctx.closePath();
    ctx.fill();

    // Cosmic Kalpataru Tree trunk & curling golden branches
    ctx.strokeStyle = '#f3bf4b';
    ctx.lineCap = 'round';
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(cx, botY - 142);
    ctx.quadraticCurveTo(cx + 2, (botY + topY) * 0.5, cx, topY + 36);
    ctx.stroke();

    for (let lvl = 0; lvl < 5; lvl++) {
      const by = topY + 96 + lvl * 46;
      const span = 24 + lvl * 11.5;
      for (const dir of [-1, 1]) {
        ctx.strokeStyle = '#f6ca5e';
        ctx.lineWidth = 2.9;
        ctx.beginPath();
        ctx.moveTo(cx, by + 12);
        ctx.quadraticCurveTo(cx + dir * span * 0.65, by - 18, cx + dir * span, by + 4);
        ctx.quadraticCurveTo(cx + dir * span * 0.85, by + 22, cx + dir * span * 0.52, by + 10);
        ctx.stroke();
      }
    }

    // Banaspati / Kala guardian mask with Sungging stippling
    paintSunggingStipple(ctx, cx, topY + 262, 31, 21, '#9e2115', '#df6c20', '#fce288', rng, 38);
    ctx.restore();

    // Prada gold-leaf inner border with subtle antique crackle breaks
    ctx.strokeStyle = '#f0ba41';
    ctx.lineWidth = 2.6;
    traceKayonOutline(4);
    ctx.stroke();

    // Dense Tatahan lace cutouts (`destination-out`)
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000';

    for (let i = 1; i <= 27; i++) {
      const u = i / 28;
      const py = lerp(topY + 26, botY - 14, u);
      const halfW = Math.sin(Math.pow(u, 0.78) * Math.PI * 0.88) * 76;
      for (const dir of [-1, 1]) {
        punchHoleRow(ctx, cx + dir * halfW, py, cx + dir * halfW, py, 1, 3.1, i);
        if (halfW > 22) {
          punchPetalSlot(ctx, cx + dir * (halfW - 13), py, 6.4, 3.1, dir * 0.45);
        }
      }
    }

    for (let lvl = 0; lvl < 5; lvl++) {
      const by = topY + 96 + lvl * 46;
      const span = 22 + lvl * 10.5;
      for (const dir of [-1, 1]) {
        punchHoleArc(ctx, cx + dir * span * 0.62, by + 4, 10, 0, Math.PI * 2 * (5 / 6), 6, 2.7);
        punchHoleRow(ctx, cx + dir * span * 0.62, by + 4, cx + dir * span * 0.62, by + 4, 1, 4.2, lvl);
      }
    }

    for (const dir of [-1, 1]) {
      punchPetalSlot(ctx, cx + dir * 12, topY + 259, 5.4, 4.2, dir * 0.2);
    }
    punchHoleRow(ctx, cx - 13, topY + 272, cx + 13, topY + 272, 5, 2.4, 9);

    for (let row = 0; row < 5; row++) {
      punchHoleRow(ctx, cx - 18, botY - 16 - row * 16, cx + 18, botY - 16 - row * 16, 5, 3.2, row + 20);
    }
    ctx.restore();

    // Gently curved ox-horn central Gapit spike
    ctx.strokeStyle = '#3d1b08';
    ctx.lineCap = 'round';
    ctx.lineWidth = 6.2;
    ctx.beginPath();
    ctx.moveTo(cx, botY - 4);
    ctx.quadraticCurveTo(cx + 2.5, botY + 11, cx + 1, 498);
    ctx.stroke();
  }, 220, 500);

  const shadow = kit.bake2D('s10_wayang_kayon_sh_v3', (_g, ctx) => {
    ctx.clearRect(0, 0, 220, 500);
    ctx.drawImage(puppet.canvas, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = '#6d2a07';
    ctx.fillRect(0, 0, 220, 500);
    ctx.globalCompositeOperation = 'source-over';
  }, 220, 500);

  return { puppet, shadow };
}

/**
 * Bakes a 156x156 ceremonial `Surya Majapahit` 8-Rayed Flame-Lotus perforated buffalo-hide wheel
 * (zero plain geometric circle rims — outer rim is a 24-flame carved leather sun-crown with Sungging stippling!).
 */
function getBakedSunLotusWheel(kit) {
  return kit.bake2D('s10_wayang_wheel_v3', (_g, ctx, rng) => {
    const cx = 78;
    const cy = 78;
    const r = 46.5;
    ctx.clearRect(0, 0, 156, 156);

    // 1. Hand-carved 24-tongue Surya flame-tooth buffalo-hide wheel disc
    ctx.fillStyle = '#230e05';
    ctx.beginPath();
    const teeth = 24;
    for (let i = 0; i < teeth * 2; i++) {
      const a = (i / (teeth * 2)) * Math.PI * 2;
      const wob = Math.sin(i * 1.9) * 0.55;
      const rad = (i % 2 === 0 ? r + 3.2 : r - 1.4) + wob;
      const px = cx + Math.cos(a) * rad;
      const py = cy + Math.sin(a) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // 2. Sungging polychrome bands + drenjeman stippled gold/vermilion/emerald dots
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2;
      const rr = r - 7.8 + (i % 2) * 1.4;
      ctx.fillStyle = i % 3 === 0 ? '#f6cb62' : '#c42d1c';
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * (rr - 3.2), cy + Math.sin(a) * (rr - 3.2));
      ctx.lineTo(cx + Math.cos(a + 0.08) * rr, cy + Math.sin(a + 0.08) * rr);
      ctx.lineTo(cx + Math.cos(a) * (rr + 3.2), cy + Math.sin(a) * (rr + 3.2));
      ctx.lineTo(cx + Math.cos(a - 0.08) * rr, cy + Math.sin(a - 0.08) * rr);
      ctx.closePath();
      ctx.fill();
    }
    paintSunggingStipple(ctx, cx, cy, r * 0.52, r * 0.52, '#16634f', '#3ea67d', '#f5ce69', rng, 36);

    // 3. Bold transparent Tatahan lace cutouts (`destination-out`, >38% open lace!)
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000';

    punchHoleArc(ctx, cx, cy, r - 7.8, 0, Math.PI * 2 * (23 / 24), 24, 2.35);

    // 8 major Surya-Majapahit flame-petal cutouts + 8 secondary lotus-bud slots
    const rays = 8;
    for (let i = 0; i < rays; i++) {
      const aMid = ((i + 0.5) / rays) * Math.PI * 2;
      punchPetalSlot(
        ctx,
        cx + Math.cos(aMid) * (r * 0.64),
        cy + Math.sin(aMid) * (r * 0.64),
        9.4,
        4.6,
        aMid + 0.12
      );
      const aIn = (i / rays) * Math.PI * 2;
      punchPetalSlot(
        ctx,
        cx + Math.cos(aIn + 0.22) * (r * 0.33),
        cy + Math.sin(aIn + 0.22) * (r * 0.33),
        5.2,
        2.9,
        aIn
      );
    }
    punchHoleRow(ctx, cx, cy, cx, cy, 1, 3.4, 7);
    ctx.restore();

    // 4. S-curved Prada gold-leaf Surya spokes & scalloped inner lotus petals (with fine crackle breaks)
    ctx.strokeStyle = '#f8d26e';
    ctx.lineCap = 'round';
    ctx.lineWidth = 2.2;
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 8.5, cy + Math.sin(a) * 8.5);
      ctx.bezierCurveTo(
        cx + Math.cos(a + 0.26) * (r * 0.38),
        cy + Math.sin(a + 0.26) * (r * 0.38),
        cx + Math.cos(a - 0.18) * (r * 0.72),
        cy + Math.sin(a - 0.18) * (r * 0.72),
        cx + Math.cos(a) * (r - 4.2),
        cy + Math.sin(a) * (r - 4.2)
      );
      ctx.stroke();
    }

    // Scalloped 16-petal lotus hub ring (organic petal curves, not `ctx.arc`!)
    ctx.lineWidth = 1.65;
    ctx.beginPath();
    for (let i = 0; i <= 16; i++) {
      const a0 = ((i - 0.5) / 16) * Math.PI * 2;
      const a1 = (i / 16) * Math.PI * 2;
      const x1 = cx + Math.cos(a1) * 10.2;
      const y1 = cy + Math.sin(a1) * 10.2;
      const cpx = cx + Math.cos((a0 + a1) * 0.5) * 12.6;
      const cpy = cy + Math.sin((a0 + a1) * 0.5) * 12.6;
      if (i === 0) ctx.moveTo(cx + Math.cos(a0) * 10.2, cy + Math.sin(a0) * 10.2);
      else ctx.quadraticCurveTo(cpx, cpy, x1, y1);
    }
    ctx.stroke();
  }, 156, 156);
}

/**
 * Bakes the rear-hanging `Blencong` Garuda brass oil-lamp silhouette (`280x180`):
 * Because the audience views the `Kelir` cotton screen from the FRONT while the `Blencong` hangs
 * BEHIND the screen, its winged brass body & lotus chains appear as a warm, soft-focus,
 * semi-transparent rear-projected silhouette THROUGH the woven cotton — NEVER a crisp front sticker!
 */
function getBakedRearBlencongSilhouette(kit) {
  return kit.bake2D('s10_wayang_blencong_rear_v3', (_g, ctx) => {
    const cx = 140;
    const cy = 104;
    ctx.clearRect(0, 0, 280, 180);

    // Lotus-link suspension chains behind cloth (hand-drawn oval chain links, zero `setLineDash`!)
    ctx.strokeStyle = 'rgba(76, 28, 5, 0.75)';
    ctx.lineWidth = 3.2;
    for (const dir of [-1, 1]) {
      for (let k = 0; k < 8; k++) {
        const u = k / 7;
        const lx = lerp(cx + dir * 38, cx + dir * 21, u);
        const ly = lerp(6, cy - 18, u);
        ctx.beginPath();
        ctx.ellipse(lx, ly, 2.8, 5.2, dir * -0.18, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Spread Garuda wings & lotus oil chalice silhouette (cast from behind the cotton!)
    ctx.fillStyle = 'rgba(72, 26, 4, 0.88)';
    for (const dir of [-1, 1]) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(dir, 1);
      ctx.beginPath();
      ctx.moveTo(15, -4);
      ctx.quadraticCurveTo(56, -36, 114, -22);
      ctx.quadraticCurveTo(98, -4, 86, -1);
      ctx.quadraticCurveTo(96, 10, 72, 12);
      ctx.quadraticCurveTo(78, 22, 50, 20);
      ctx.quadraticCurveTo(32, 20, 15, 11);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Central oil chalice & hanging Kuncup lotus bud finial
    ctx.beginPath();
    ctx.moveTo(cx - 36, cy - 8);
    ctx.quadraticCurveTo(cx, cy + 2, cx + 36, cy - 8);
    ctx.quadraticCurveTo(cx + 26, cy + 25, cx, cy + 29);
    ctx.quadraticCurveTo(cx - 26, cy + 25, cx - 36, cy - 8);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx - 6, cy + 28);
    ctx.lineTo(cx + 6, cy + 28);
    ctx.lineTo(cx, cy + 54);
    ctx.closePath();
    ctx.fill();

    // Punch filigree wing cutouts so warm scattered oil light leaks through the brass wings
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000';
    for (const dir of [-1, 1]) {
      punchPetalSlot(ctx, cx + dir * 48, cy - 9, 7, 3.2, dir * -0.2);
      punchPetalSlot(ctx, cx + dir * 72, cy - 13, 8, 3.2, dir * -0.15);
      punchPetalSlot(ctx, cx + dir * 56, cy + 6, 6, 2.8, dir * 0.1);
    }
    ctx.globalCompositeOperation = 'source-over';
  }, 280, 180);
}

/**
 * Bakes the static Wayang Kulit theatre stage (`s10_wayang_stage_v3`):
 * - Slubbed hand-spun cotton `Kelir` screen with oil-smoke patina & cottonseed flecks
 * - Full-width 100% SYMMETRICAL perforated `Suluran` cloud-and-flame leather valance (`x = 0..1000`)
 * - Royal `Batik Kawung` stitched cloth border (`Pelipit`)
 * - Cylindrical fibrous emerald `Debog` banana trunk (`y = 680..784`) with sheath arcs, sap stains & spike scars
 * - Hand-carved teakwood `Kotak` beam (`y = 784..824`) + `Batik Tulis Parang Rusak` skirt with `malam` wax crackle!
 */
function getBakedWayangStage(kit) {
  return kit.bake2D('s10_wayang_stage_v3', (_g, ctx, rng) => {
    // 1. Hand-Spun Backlit Cotton Shadow Screen (`Kelir`) with non-circular cloth scattering & smoke patina
    ctx.fillStyle = '#4a1d06';
    ctx.fillRect(0, 0, PANEL_SIZE, PANEL_SIZE);

    // Multi-pass organic cloth translucency falloff (avoids single smooth computer circle!)
    for (const [gx, gy, rx, ry, col, alpha] of [
      [500, 340, 690, 520, '#ae5b1a', 0.85],
      [500, 305, 520, 410, '#e8aa46', 0.82],
      [500, 265, 365, 305, '#ffe8aa', 0.84],
      [500, 215, 225, 195, '#fff9de', 0.78],
    ]) {
      ctx.save();
      ctx.translate(gx, gy);
      ctx.scale(1, ry / rx);
      const grad = ctx.createRadialGradient(0, 0, rx * 0.08, 0, 0, rx);
      grad.addColorStop(0.0, col);
      grad.addColorStop(0.62, col);
      grad.addColorStop(1.0, 'rgba(74, 29, 6, 0)');
      ctx.globalAlpha = alpha;
      ctx.fillStyle = grad;
      ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
      ctx.restore();
    }

    // Uneven hand-spun slubbed cotton warp & weft threads (`粗纺竹节棉纱肌理`)
    ctx.lineCap = 'round';
    for (let y = 36; y < ROAD_EDGE_Y; y += 3) {
      let x = 14;
      while (x < PANEL_SIZE - 14) {
        const seg = 26 + rng() * 68;
        const slub = rng() < 0.18 ? 1.65 : 0.75 + rng() * 0.45;
        const isDark = rng() < 0.46;
        const a = (0.024 + rng() * 0.042) * (slub > 1.2 ? 1.35 : 1.0);
        ctx.strokeStyle = isDark
          ? `rgba(104, 50, 12, ${a.toFixed(3)})`
          : `rgba(255, 252, 236, ${(a * 1.35).toFixed(3)})`;
        ctx.lineWidth = slub;
        ctx.beginPath();
        ctx.moveTo(x, y + (rng() - 0.5) * 0.6);
        ctx.lineTo(Math.min(PANEL_SIZE - 14, x + seg), y + (rng() - 0.5) * 0.6);
        ctx.stroke();
        x += seg + rng() * 6;
      }
    }
    for (let x = 16; x < PANEL_SIZE - 16; x += 4) {
      let y = 38;
      while (y < ROAD_EDGE_Y) {
        const seg = 30 + rng() * 75;
        const a = 0.018 + rng() * 0.032;
        ctx.strokeStyle = rng() < 0.5
          ? `rgba(116, 58, 15, ${a.toFixed(3)})`
          : `rgba(255, 249, 226, ${a.toFixed(3)})`;
        ctx.lineWidth = 0.7 + rng() * 0.6;
        ctx.beginPath();
        ctx.moveTo(x + (rng() - 0.5) * 0.5, y);
        ctx.lineTo(x + (rng() - 0.5) * 0.5, Math.min(ROAD_EDGE_Y, y + seg));
        ctx.stroke();
        y += seg + rng() * 8;
      }
    }
    // Natural raw cottonseed flecks & subtle coconut-oil smoke mottling near upper screen
    for (let i = 0; i < 650; i++) {
      const fx = 18 + rng() * (PANEL_SIZE - 36);
      const fy = 40 + rng() * (ROAD_EDGE_Y - 42);
      ctx.fillStyle = rng() < 0.72 ? 'rgba(92, 44, 12, 0.11)' : 'rgba(255, 252, 240, 0.16)';
      ctx.fillRect(fx, fy, 1.1 + rng() * 1.4, 0.9 + rng() * 1.3);
    }

    // 2. Full-Width 100% Symmetrical Perforated `Suluran` Cloud-and-Flame Leather Valance (`x = 0..1000`)!
    // (Left top corner is now 100% liberated from any UI card!)
    const valBuf = kit.bake2D('s10_wayang_valance_v3', (_vg, vCtx, vRng) => {
      vCtx.clearRect(0, 0, PANEL_SIZE, 210);

      for (const dir of [-1, 1]) {
        vCtx.save();
        vCtx.translate(500, 0);
        vCtx.scale(dir, 1);

        vCtx.fillStyle = '#240f05';
        vCtx.beginPath();
        vCtx.moveTo(0, 36);
        vCtx.lineTo(500, 36);
        vCtx.lineTo(500, 178);
        vCtx.quadraticCurveTo(422, 182, 366, 132);
        vCtx.quadraticCurveTo(306, 150, 246, 106);
        vCtx.quadraticCurveTo(186, 122, 128, 82);
        vCtx.quadraticCurveTo(68, 66, 0, 58);
        vCtx.closePath();
        vCtx.fill();

        // Sungging crimson & Prada gold scalloped trim
        vCtx.strokeStyle = '#b5281a';
        vCtx.lineWidth = 5.4;
        vCtx.stroke();
        vCtx.strokeStyle = '#f5c756';
        vCtx.lineWidth = 2.0;
        vCtx.stroke();

        // Curling Ukiran golden spiral tendrils (organic bezier scrolls, zero `ctx.arc` circles)
        for (const [vx, vy, vr] of [[95, 56, 13], [175, 68, 17], [265, 84, 21], [365, 106, 25], [452, 126, 22]]) {
          paintSunggingStipple(vCtx, vx, vy, vr * 0.85, vr * 0.65, '#8e1f14', '#d8661e', '#f8d878', vRng, 16);
          vCtx.strokeStyle = '#f4c34e';
          vCtx.lineWidth = 2.0;
          vCtx.beginPath();
          vCtx.moveTo(vx - vr, vy);
          vCtx.bezierCurveTo(vx - vr, vy - vr, vx + vr, vy - vr, vx + vr * 0.85, vy + vr * 0.2);
          vCtx.bezierCurveTo(vx + vr * 0.6, vy + vr * 0.85, vx - vr * 0.4, vy + vr * 0.6, vx, vy);
          vCtx.stroke();
        }
        vCtx.restore();
      }

      // Punch crisp Tatahan lace pinholes symmetrically across both halves!
      vCtx.globalCompositeOperation = 'destination-out';
      vCtx.fillStyle = '#000';
      for (const dir of [-1, 1]) {
        for (const [ox, vy, vr] of [[95, 56, 11], [175, 68, 14], [265, 84, 17], [365, 106, 20], [452, 126, 17]]) {
          const vx = 500 + dir * ox;
          punchHoleArc(vCtx, vx, vy, vr, 0, Math.PI * 2 * (7 / 8), 8, 2.7);
          punchHoleRow(vCtx, vx, vy, vx, vy, 1, 4.0, ox);
        }
      }
      punchHoleRow(vCtx, 28, 49, 972, 49, 42, 2.4, 3);
      vCtx.globalCompositeOperation = 'source-over';
    }, PANEL_SIZE, 210);

    // Warm diffused Suluran valance shadow on Kelir, then crisp leather valance
    ctx.save();
    ctx.globalAlpha = 0.30;
    ctx.filter = 'blur(5px)';
    ctx.drawImage(valBuf.canvas, 0, 9);
    ctx.restore();
    ctx.drawImage(valBuf.canvas, 0, 0);

    // 3. Stitched Royal `Batik Kawung` Cloth Border (`Pelipit`, y = 0..38 & side stiles) — zero `strokeRect`!
    ctx.save();
    ctx.fillStyle = '#58140d';
    ctx.fillRect(0, 0, PANEL_SIZE, 37);
    ctx.fillRect(0, 37, 16, ROAD_EDGE_Y - 37);
    ctx.fillRect(PANEL_SIZE - 16, 37, 16, ROAD_EDGE_Y - 37);

    // Hand-waxed gold malam border waves & cotton lacing stitches along Kelir frame
    ctx.strokeStyle = '#edb53e';
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(0, 36.5);
    for (let x = 0; x <= PANEL_SIZE; x += 25) {
      ctx.lineTo(x, 36.5 + Math.sin(x * 0.09) * 0.7);
    }
    ctx.moveTo(16, 37); ctx.lineTo(16, ROAD_EDGE_Y);
    ctx.moveTo(PANEL_SIZE - 16, 37); ctx.lineTo(PANEL_SIZE - 16, ROAD_EDGE_Y);
    ctx.stroke();

    // Diagonal white cotton lacing cords tying Kelir edge to bamboo frame (`Tali Kelir`)
    ctx.strokeStyle = 'rgba(255, 240, 200, 0.55)';
    ctx.lineWidth = 1.5;
    for (let y = 52; y < ROAD_EDGE_Y - 12; y += 34) {
      ctx.beginPath();
      ctx.moveTo(3, y - 5); ctx.lineTo(17, y + 4);
      ctx.moveTo(PANEL_SIZE - 3, y - 5); ctx.lineTo(PANEL_SIZE - 17, y + 4);
      ctx.stroke();
    }

    // Authentic 4-lobed palm-blossom `Kawung` wax-resist motifs along top Pelipit
    for (let mx = 22; mx < PANEL_SIZE; mx += 36) {
      const my = 18.5;
      ctx.strokeStyle = '#f6ce6e';
      ctx.lineWidth = 1.45;
      for (const [ox, oy] of [[-7, 0], [7, 0], [0, -6.5], [0, 6.5]]) {
        ctx.save();
        ctx.translate(mx + ox, my + oy);
        if (ox === 0) ctx.rotate(Math.PI * 0.5);
        ctx.beginPath();
        ctx.moveTo(-6.5, 0);
        ctx.quadraticCurveTo(0, -4.2, 6.5, 0);
        ctx.quadraticCurveTo(0, 4.2, -6.5, 0);
        ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = '#fff2c2';
      ctx.fillRect(mx - 1.6, my - 1.6, 3.2, 3.2);
    }
    ctx.restore();

    // 4. Cylindrical Fibrous Banana Pseudostem (`Debog`, y = 680..784)
    // Strictly anchored at `(0, 680)` and `(1000, 680)` at top bearing line, sculpted with overlapping
    // banana leaf-sheaths, vascular fibers, sap bruises, dark spike scars & angled bamboo pegs!
    const debogTop = ROAD_EDGE_Y;
    const debogH = 104;
    const debogGrad = ctx.createLinearGradient(0, debogTop, 0, debogTop + debogH);
    debogGrad.addColorStop(0.0, '#9ad96e');
    debogGrad.addColorStop(0.10, '#6bb351');
    debogGrad.addColorStop(0.42, '#41833b');
    debogGrad.addColorStop(0.78, '#255525');
    debogGrad.addColorStop(1.0, '#132e15');
    ctx.fillStyle = debogGrad;
    ctx.fillRect(0, debogTop, PANEL_SIZE, debogH);

    // Overlapping organic banana leaf-sheath arcs (`香蕉假茎叶鞘包叠肌理`)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, debogTop, PANEL_SIZE, debogH);
    ctx.clip();

    for (let sx = -60; sx < PANEL_SIZE + 80; sx += 145) {
      const shW = 165 + rng() * 45;
      const shY = debogTop + 8 + rng() * 28;
      ctx.strokeStyle = 'rgba(218, 245, 148, 0.24)';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(sx, shY + 26);
      ctx.quadraticCurveTo(sx + shW * 0.48, shY - 10, sx + shW, shY + 22);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(18, 46, 18, 0.36)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, shY + 28);
      ctx.quadraticCurveTo(sx + shW * 0.48, shY - 8, sx + shW, shY + 24);
      ctx.stroke();
    }

    // Longitudinal vascular banana-bark fibers & oxidized sap bruises (`青褐汁液斑驳`)
    for (let i = 0; i < 42; i++) {
      const fy = debogTop + 4 + (i / 42) * (debogH - 6);
      ctx.strokeStyle = i % 3 === 0
        ? `rgba(16, 44, 17, ${(0.22 + rng() * 0.25).toFixed(3)})`
        : `rgba(204, 242, 142, ${(0.08 + rng() * 0.14).toFixed(3)})`;
      ctx.lineWidth = 0.7 + rng() * 1.2;
      ctx.beginPath();
      ctx.moveTo(0, fy);
      for (let x = 40; x <= PANEL_SIZE; x += 40) {
        ctx.lineTo(x, fy + Math.sin(x * 0.014 + i * 1.7) * 1.8 + (rng() - 0.5) * 0.9);
      }
      ctx.stroke();
    }
    for (let b = 0; b < 28; b++) {
      const bx = rng() * PANEL_SIZE;
      const by = debogTop + 10 + rng() * (debogH - 22);
      ctx.fillStyle = rng() < 0.55 ? 'rgba(64, 52, 18, 0.24)' : 'rgba(196, 224, 112, 0.14)';
      ctx.beginPath();
      ctx.ellipse(bx, by, 12 + rng() * 28, 2.2 + rng() * 4.5, (rng() - 0.5) * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pierced dark diagonal puppet-spike stab scars (`插影斜戳孔痕`) along top of Debog!
    for (let px = 42; px < PANEL_SIZE - 30; px += 48 + rng() * 34) {
      const py = debogTop + 6 + rng() * 12;
      ctx.fillStyle = 'rgba(22, 32, 10, 0.72)';
      ctx.beginPath();
      ctx.ellipse(px, py, 4.8, 2.1, -0.28 + (rng() - 0.5) * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(182, 214, 118, 0.38)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(px - 4, py + 2);
      ctx.lineTo(px + 4, py + 1.5);
      ctx.stroke();
    }

    // Hand-whittled angled bamboo/horn pegs (`Tuding` anchors for the side Kayon trees + spares)
    for (const [px, slant] of [[78, -3], [218, 4], [786, -4], [922, 3]]) {
      ctx.fillStyle = '#5e3916';
      ctx.strokeStyle = '#210f04';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px - 4.5, debogTop + 9);
      ctx.lineTo(px + 4.5, debogTop + 9);
      ctx.lineTo(px + 3.2 + slant, debogTop + 56);
      ctx.lineTo(px - 3.2 + slant, debogTop + 56);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();

    // Warm Blencong oil-light rim kissing the cylindrical top ridge of Debog at y = 680!
    ctx.strokeStyle = 'rgba(238, 248, 152, 0.72)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, debogTop + 1.2);
    ctx.quadraticCurveTo(500, debogTop + 0.6, PANEL_SIZE, debogTop + 1.2);
    ctx.stroke();

    // 5. Carved Teakwood `Kotak` Stage Beam (`y = 784..824`) with Gilded Javanese `Ukiran` Medallion
    //    (100% pure hand-drawn scrollwork — ZERO computer text!)
    const beamY = debogTop + debogH;
    const woodGrad = ctx.createLinearGradient(0, beamY, 0, beamY + 40);
    woodGrad.addColorStop(0.0, '#4f270f');
    woodGrad.addColorStop(0.5, '#2f1507');
    woodGrad.addColorStop(1.0, '#1a0a03');
    ctx.fillStyle = woodGrad;
    ctx.fillRect(0, beamY, PANEL_SIZE, 40);

    // Wood grain & gilded Ukiran lotus-vine relief along teak beam
    ctx.strokeStyle = 'rgba(234, 178, 62, 0.72)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, beamY + 4); ctx.lineTo(PANEL_SIZE, beamY + 4);
    ctx.moveTo(0, beamY + 36); ctx.lineTo(PANEL_SIZE, beamY + 36);
    ctx.stroke();

    for (let x = 24; x < PANEL_SIZE - 20; x += 44) {
      if (x > 410 && x < 590) continue; // leave center for royal Padma medallion
      ctx.strokeStyle = 'rgba(238, 182, 66, 0.68)';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(x - 16, beamY + 22);
      ctx.bezierCurveTo(x - 6, beamY + 9, x + 6, beamY + 31, x + 18, beamY + 18);
      ctx.stroke();
    }

    // Central Gilded Royal Kraton Padma-Scroll Cartouche (`x = 500, y = beamY + 20`, zero fonts!)
    ctx.save();
    ctx.translate(500, beamY + 20);
    ctx.fillStyle = '#3b1808';
    ctx.strokeStyle = '#f2be49';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-74, 0);
    ctx.quadraticCurveTo(-52, -13, 0, -13);
    ctx.quadraticCurveTo(52, -13, 74, 0);
    ctx.quadraticCurveTo(52, 13, 0, 13);
    ctx.quadraticCurveTo(-52, 13, -74, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Hand-drawn Javanese Aksara-inspired ornamental scroll flourishes inside cartouche
    ctx.strokeStyle = '#fae084';
    ctx.lineWidth = 1.5;
    for (let k = -2; k <= 2; k++) {
      const sx = k * 20;
      ctx.beginPath();
      ctx.moveTo(sx - 6, 4);
      ctx.bezierCurveTo(sx - 4, -6, sx + 4, -6, sx + 6, 4);
      ctx.moveTo(sx - 2, -2);
      ctx.lineTo(sx + 4, 5);
      ctx.stroke();
    }
    ctx.restore();

    // 6. Hand-Waxed `Batik Tulis Parang Rusak` Lower Skirt (`y = 824..1000`) with `Malam` Wax Crackle!
    const clothY = beamY + 40;
    ctx.fillStyle = '#210c06';
    ctx.fillRect(0, clothY, PANEL_SIZE, PANEL_SIZE - clothY);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, clothY, PANEL_SIZE, PANEL_SIZE - clothY);
    ctx.clip();

    // Undulating Yogyakarta `Parang` S-scroll bands (`Soga` brown + `Indigo` dark + white `Cecek` wax dots)
    for (let dx = -200; dx < PANEL_SIZE + 220; dx += 52) {
      // Soga warm ochre-crimson band with organic hand-drawn wave
      ctx.strokeStyle = 'rgba(148, 56, 22, 0.52)';
      ctx.lineWidth = 21;
      ctx.beginPath();
      for (let sStep = 0; sStep <= 8; sStep++) {
        const u = sStep / 8;
        const px = dx + u * 165 + Math.sin(u * Math.PI * 3) * 5.5;
        const py = lerp(clothY - 6, PANEL_SIZE + 6, u);
        if (sStep === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Interlocking `Parang` S-blade curls & `Cecek` 3-dot wax-resist motifs along each band!
      for (let m = 0; m < 6; m++) {
        const u = (m + 0.5) / 6;
        const mx = dx + u * 165 + Math.sin(u * Math.PI * 3) * 5.5;
        const my = lerp(clothY + 4, PANEL_SIZE - 4, u);
        ctx.strokeStyle = 'rgba(238, 184, 78, 0.56)';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(mx - 9, my - 6);
        ctx.bezierCurveTo(mx - 2, my - 13, mx + 2, my + 13, mx + 9, my + 6);
        ctx.stroke();

        // Traditional white-cream `Cecek` wax resist dots
        ctx.fillStyle = 'rgba(255, 236, 184, 0.48)';
        ctx.fillRect(mx - 1.2, my - 1.2, 2.4, 2.4);
        ctx.fillRect(mx + 13, my - 3, 2.0, 2.0);
        ctx.fillRect(mx + 16, my + 1, 2.0, 2.0);
      }
    }

    // Authentic `Batik Tulis` fine `Malam` wax-crackle veins (`手工蜡染冰裂纹`)
    for (let c = 0; c < 95; c++) {
      let cx0 = rng() * PANEL_SIZE;
      let cy0 = clothY + rng() * (PANEL_SIZE - clothY);
      ctx.strokeStyle = rng() < 0.6
        ? 'rgba(244, 198, 108, 0.14)'
        : 'rgba(18, 8, 4, 0.35)';
      ctx.lineWidth = 0.65 + rng() * 0.65;
      ctx.beginPath();
      ctx.moveTo(cx0, cy0);
      for (let seg = 0; seg < 5; seg++) {
        cx0 += (rng() - 0.48) * 24;
        cy0 += (rng() - 0.42) * 18;
        ctx.lineTo(cx0, cy0);
      }
      ctx.stroke();
    }
    ctx.restore();
  });
}

/**
 * Draws the twin symmetrical Gunungan / Kayon (Trees of Life) with 10Hz strong-beat breathing sway
 * and optical rear-projection shadows driven by the live `Blencong` wick position!
 */
function drawDynamicSwayingKayons(kit, ctx, qT, qLocalT, lampX, isOutroThumbnail = false) {
  const { puppet, shadow } = getBakedKayonAssets(kit);
  const step = Math.floor(qT * 10 + 1e-4);
  const stepSign = step % 2 === 0 ? 1 : -1;

  // Ceremonial Dalang choreography on the 10Hz quantized clock:
  // - Opening (`qLocalT < 0.4s`): poised upright near stage wings (~1.6° outward)
  // - Parting (`0.4s -> 1.8s`): smooth ceremonial `分山` outward sweep to ~12.8°..13.8° (`0.224..0.241 rad`)
  // - Bar 2 (`1.8s -> 4.0s`): wide parted stance + rapid 10Hz `getaran kayon` wrist-tremble
  // - Bar 3 (`4.05s -> 5.75s`): graceful inward ceremonial bow (`~3.4°` inward = `-0.060 rad` outward)
  let partAngle;
  let trembleAmp;
  let wingSlidePx;
  let zLift;

  if (isOutroThumbnail) {
    partAngle = 0.205; // ~11.7° ceremonial parted pose
    trembleAmp = 0.006;
    wingSlidePx = 6;
    zLift = 0.22;
  } else {
    const partRise = smoothstep(0.36, 1.76, qLocalT);
    const bar2Release = 1 - smoothstep(3.95, 4.78, qLocalT);
    const bar3BowEnv = smoothstep(4.10, 4.88, qLocalT) * (1 - 0.45 * smoothstep(5.55, 6.0, qLocalT));
    const bar2TrembleEnv = smoothstep(1.55, 2.05, qLocalT) * (1 - smoothstep(3.90, 4.45, qLocalT));
    const movingEnv =
      smoothstep(0.30, 0.65, qLocalT) * (1 - smoothstep(1.65, 2.05, qLocalT)) +
      bar2TrembleEnv * 0.65 +
      bar3BowEnv * 0.55;

    // Outward angle in radians (+ = top tilts outward toward panel edge; - = top bows inward toward center)
    partAngle = 0.028 + 0.202 * partRise * bar2Release - 0.086 * bar3BowEnv;
    trembleAmp = 0.005 + 0.015 * bar2TrembleEnv;
    wingSlidePx = 9.5 * partRise * bar2Release - 4.0 * bar3BowEnv;
    zLift = clamp(0.16 + 0.34 * movingEnv, 0.14, 0.58);
  }

  const beatBreath =
    Math.sin((qT / BEAT_SEC) * Math.PI) * (0.016 + trembleAmp * 0.45) +
    stepSign * trembleAmp +
    Math.sin(step * 1.9) * (trembleAmp * 0.45);

  const drawOne = (baseKx, ky, isRight) => {
    const dir = isRight ? 1 : -1;
    const kx = baseKx + dir * wingSlidePx;
    // Left (`dir = -1`): negative rotation tilts top (`y = -474`) leftward/outward.
    // Right (`dir = +1`): positive rotation tilts top (`y = -474`) rightward/outward.
    const outwardRad = partAngle + beatBreath;
    const tilt = dir * outwardRad;

    const shOffX = clamp((kx - lampX) * (0.032 + 0.028 * zLift), -24, 24);
    const shOffY = 9.5 + 4.5 * zLift;
    const shScale = 1.038 + 0.032 * zLift;
    const shBlur = 4.6 + 3.8 * zLift;

    ctx.save();
    ctx.translate(kx + shOffX, ky + shOffY);
    ctx.rotate(tilt);
    ctx.scale(isRight ? -shScale : shScale, shScale);
    ctx.globalAlpha = lerp(0.36, 0.48, zLift);
    ctx.filter = `blur(${shBlur.toFixed(1)}px)`;
    ctx.drawImage(shadow.canvas, -110, -474);
    ctx.restore();

    ctx.save();
    ctx.translate(kx, ky);
    ctx.rotate(tilt);
    ctx.scale(isRight ? -1 : 1, 1);
    ctx.globalAlpha = 0.96;
    ctx.drawImage(puppet.canvas, -110, -474);
    ctx.restore();
  };

  ctx.save();
  ctx.beginPath();
  ctx.rect(16, 37, PANEL_SIZE - 32, ROAD_EDGE_Y - 37);
  ctx.clip();
  drawOne(84, ROAD_EDGE_Y + 6, false);
  drawOne(916, ROAD_EDGE_Y + 6, true);
  ctx.restore();
}

/**
 * Renders the authentic REAR-HUNG `Blencong` coconut-oil lamp (`#85 总监挑刺补强 ①` + Aerodynamic Gust):
 * 1. Soft-focus rear-projected Garuda brass lamp silhouette (`blur(7.5px)`, semi-transparent warm umber)
 *    swaying subtly BEHIND the cotton `Kelir`!
 * 2. Cloth-diffused incandescent white-gold -> saffron wick transmission core shining THROUGH the cotton
 *    threads, kicking sideways (`dx`) right as the Garuda-pelican whooshes past `x = 500`!
 */
function drawQuantizedBlencongOptics(kit, ctx, qT, qLocalT, qPelicanX, isOutroThumbnail = false) {
  const rearLamp = getBakedRearBlencongSilhouette(kit);
  const step = Math.floor(qT * 10 + 1e-4);
  const f1 = Math.sin(step * 2.37) * 0.5 + Math.cos(step * 3.91) * 0.5;
  const f2 = Math.sin(step * 1.73 + 1.1);
  const bar2Pulse = qLocalT >= 1.6 && qLocalT < 4.4
    ? Math.exp(-(((qT % BEAT_SEC) / BEAT_SEC) * 3.4)) * 0.45
    : Math.exp(-(((qT % BEAT_SEC) / BEAT_SEC) * 4.5)) * 0.16;

  // Aerodynamic wake gust as Garuda-pelican whooshes past stage center (`x ≈ 500`):
  // Ramps sharply across x = 380..515 (dramatic at t = 61.8s / x = 467!), peaks near x = 495,
  // then rebounds with damped 10Hz oscillation across x = 545..720!
  let gustDx = 0;
  let gustStretch = 0;
  let mainKick = 0;
  if (!isOutroThumbnail && qPelicanX > 350 && qPelicanX < 750) {
    mainKick = Math.exp(-Math.pow((qPelicanX - 492) / 62, 2));
    const wakeTail =
      smoothstep(495, 540, qPelicanX) *
      (1 - smoothstep(575, 730, qPelicanX)) *
      Math.cos((qPelicanX - 505) * 0.048);
    gustDx = 35.0 * mainKick - 13.5 * wakeTail + (step % 2 === 0 ? 3.2 : -2.6) * mainKick;
    gustStretch = 16.5 * mainKick;
  }

  const lampSwayX = f2 * 5.2 + gustDx * 0.28;
  const lampX = 500 + f2 * 5.2 + gustDx * 0.78;
  const lampY = 148 + f1 * 2.8;

  ctx.save();
  ctx.beginPath();
  ctx.rect(16, 37, PANEL_SIZE - 32, ROAD_EDGE_Y - 37);
  ctx.clip();

  // 1. Rear-projected Garuda brass lamp silhouette cast ON the cotton Kelir from BEHIND (`柔焦半透背影`)
  ctx.save();
  ctx.globalAlpha = 0.36 + 0.04 * f1;
  ctx.filter = 'blur(7.0px)';
  ctx.drawImage(rearLamp.canvas, 500 - 140 - lampSwayX * 0.44, 162 - 104);
  ctx.restore();

  // Slightly sharper inner brass core shadow where chalice center sits closest to cloth (~0.17 alpha)
  ctx.save();
  ctx.globalAlpha = 0.17;
  ctx.filter = 'blur(3.0px)';
  ctx.drawImage(rearLamp.canvas, 500 - 140 - lampSwayX * 0.24, 160 - 104);
  ctx.restore();

  // Subtle rear-projected coconut-oil soot/smoke curl whipping sideways off the wick during the gust!
  if (Math.abs(gustDx) > 4.0) {
    ctx.save();
    ctx.filter = 'blur(4.2px)';
    ctx.strokeStyle = `rgba(98, 38, 6, ${(0.26 * Math.min(1, Math.abs(gustDx) / 24)).toFixed(3)})`;
    ctx.lineWidth = 7.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(500 + gustDx * 0.65, 114);
    ctx.quadraticCurveTo(500 + gustDx * 1.45, 96, 500 + gustDx * 2.05, 86);
    ctx.stroke();
    ctx.restore();
  }

  // 2. Warm Saffron-Crimson Outer Flame Tongues (`source-over` so sideways kick reads clearly against bright Kelir!)
  ctx.save();
  ctx.filter = 'blur(2.6px)';
  for (const [wx, baseH, baseW] of [[-22, 32, 10.0], [0, 52, 15.0], [22, 32, 10.0]]) {
    const wickMul = wx === 0 ? 1.24 : 0.96;
    const h = baseH + f1 * 6.5 + bar2Pulse * 12 + gustStretch * wickMul * 0.42 - Math.abs(gustDx) * 0.12;
    const tilt = f2 * 7.2 + wx * 0.16 + gustDx * wickMul;
    const midBend = gustDx * wickMul * 0.62;
    const bx = 500 + wx + lampSwayX * 0.25;
    const by = 152;

    ctx.fillStyle = 'rgba(214, 78, 12, 0.56)';
    ctx.beginPath();
    ctx.moveTo(bx - baseW, by + 3);
    ctx.quadraticCurveTo(bx - baseW * 0.92 + midBend, by - h * 0.54, bx + tilt, by - h);
    ctx.quadraticCurveTo(bx + baseW * 1.12 + midBend * 0.72, by - h * 0.44, bx + baseW, by + 3);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // 3. Cloth-transmitted coconut-oil flame radiance & incandescent wick cores shining THROUGH Kelir!
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // Broad warm cloth-scattered amber breath across Kelir weave (shifts with flame gust!)
  ctx.save();
  ctx.translate(lampX, lampY + 52);
  ctx.scale(1.28, 0.94);
  const breathR = 390 + f1 * 28 + bar2Pulse * 58 + gustStretch * 3.2;
  const aura = ctx.createRadialGradient(0, -28, 12, 0, 18, breathR);
  aura.addColorStop(0.0, `rgba(255, 242, 182, ${(0.30 + bar2Pulse * 0.15).toFixed(3)})`);
  aura.addColorStop(0.28, `rgba(255, 184, 58, ${(0.16 + (f1 + 1) * 0.04).toFixed(3)})`);
  aura.addColorStop(0.66, 'rgba(228, 118, 22, 0.055)');
  aura.addColorStop(1.0, 'rgba(180, 75, 10, 0)');
  ctx.fillStyle = aura;
  ctx.fillRect(-breathR, -breathR, breathR * 2, breathR * 2);
  ctx.restore();

  // Three cloth-softened incandescent coconut-oil wick transmission tongues (`棉幕背后的炽白灯芯透射核`)
  ctx.filter = 'blur(2.8px)';
  for (const [wx, baseH, baseW] of [[-22, 30, 9.0], [0, 48, 13.5], [22, 30, 9.0]]) {
    const wickMul = wx === 0 ? 1.24 : 0.96;
    const h = baseH + f1 * 6.5 + bar2Pulse * 11 + gustStretch * wickMul * 0.42 - Math.abs(gustDx) * 0.12;
    const tilt = f2 * 7.2 + wx * 0.16 + gustDx * wickMul;
    const midBend = gustDx * wickMul * 0.62;
    const bx = 500 + wx + lampSwayX * 0.25;
    const by = 152;

    ctx.fillStyle = 'rgba(255, 174, 44, 0.62)';
    ctx.beginPath();
    ctx.moveTo(bx - baseW, by + 2);
    ctx.quadraticCurveTo(bx - baseW * 0.92 + midBend, by - h * 0.54, bx + tilt, by - h);
    ctx.quadraticCurveTo(bx + baseW * 1.10 + midBend * 0.72, by - h * 0.46, bx + baseW, by + 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 253, 232, 0.94)';
    ctx.beginPath();
    ctx.moveTo(bx - baseW * 0.48, by);
    ctx.quadraticCurveTo(bx - baseW * 0.42 + midBend * 0.70, by - h * 0.46, bx + tilt * 0.82, by - h * 0.78);
    ctx.quadraticCurveTo(bx + baseW * 0.50 + midBend * 0.50, by - h * 0.38, bx + baseW * 0.48, by);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  ctx.restore();

  return { lampX, lampY, lampPulse: bar2Pulse, gustDx };
}

/**
 * Draws an artisanal carved bone/horn Wayang joint rivet (`Gegel`) with central silk knot.
 */
function drawGegelPivot(ctx, x, y, r = 4.4) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#fff0ab';
  ctx.strokeStyle = '#241006';
  ctx.lineWidth = 1.45;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const rr = r * (i % 2 === 0 ? 1.04 : 0.95);
    if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
    else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#a42216';
  ctx.fillRect(-r * 0.36, -r * 0.36, r * 0.72, r * 0.72);
  ctx.restore();
}

/**
 * Draws a naturally curved, tapered water-buffalo horn control rod (`Cempurit / Gapit`)
 * (`#85 总监挑刺补强 ②：天然牛角柔韧微弯弧度与细竹柄缠线，绝非笔直钢丝！`)
 * with rear-projected Kelir shadow, amber-honey horn translucency, carved bamboo handle (`Hulu`),
 * and cross-bound rattan/cotton thread wraps (`细竹柄缠线`).
 */
function drawCurvedHornCempurit(ctx, x0, y0, xBot, yBot, lampX, {
  thickness = 4.4,
  bow1 = 18,
  bow2 = -12,
  handleU0 = 0.68,
  handleU1 = 0.87,
  isMainGapit = false,
} = {}) {
  const dx = xBot - x0;
  const dy = yBot - y0;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  // Natural organic S-bowed ox-horn cubic Bezier control points!
  const c1x = lerp(x0, xBot, 0.32) + nx * bow1;
  const c1y = lerp(y0, yBot, 0.32) + ny * bow1;
  const c2x = lerp(x0, xBot, 0.68) + nx * bow2;
  const c2y = lerp(y0, yBot, 0.68) + ny * bow2;

  const evalPt = (u) => {
    const iu = 1 - u;
    return {
      x: iu ** 3 * x0 + 3 * iu ** 2 * u * c1x + 3 * iu * u ** 2 * c2x + u ** 3 * xBot,
      y: iu ** 3 * y0 + 3 * iu ** 2 * u * c1y + 3 * iu * u ** 2 * c2y + u ** 3 * yBot,
    };
  };

  // Horn rods sit slightly FURTHER behind the puppet toward the Dalang, so they cast a wider soft shadow!
  const shShiftX = clamp((lerp(x0, xBot, 0.4) - lampX) * 0.065, -26, 26);

  ctx.save();
  ctx.lineCap = 'round';

  // 1. Soft warm chestnut-amber rear shadow of the curved horn rod on Kelir cloth (clipped to Kelir above Debog)
  ctx.save();
  ctx.beginPath();
  ctx.rect(16, 37, PANEL_SIZE - 32, ROAD_EDGE_Y - 37);
  ctx.clip();
  ctx.strokeStyle = 'rgba(92, 35, 7, 0.30)';
  ctx.lineWidth = thickness + 6.8;
  ctx.beginPath();
  ctx.moveTo(x0 + shShiftX * 0.65, y0 + 8);
  ctx.bezierCurveTo(
    c1x + shShiftX * 0.82, c1y + 10,
    c2x + shShiftX * 0.95, c2y + 12,
    xBot + shShiftX, yBot + 12
  );
  ctx.stroke();
  ctx.restore();

  // 2. Tapered semi-transparent water-buffalo horn shaft (slender flexible tip -> sturdier base)
  const segments = 14;
  for (let i = 0; i < segments; i++) {
    const u0 = i / segments;
    const u1 = (i + 1) / segments;
    const p0 = evalPt(u0);
    const p1 = evalPt(u1);
    const w = thickness * lerp(0.64, 1.24, u0);

    ctx.strokeStyle = isMainGapit ? 'rgba(48, 20, 6, 0.90)' : 'rgba(78, 36, 9, 0.84)';
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();

    // Translucent golden-amber backlit horn core highlight
    ctx.strokeStyle = 'rgba(255, 212, 108, 0.68)';
    ctx.lineWidth = Math.max(1.0, w * 0.34);
    ctx.beginPath();
    ctx.moveTo(p0.x - 0.7, p0.y);
    ctx.lineTo(p1.x - 0.7, p1.y);
    ctx.stroke();
  }

  // 3. Turned Bamboo/Horn Handle (`Hulu Cempurit`) + Fine Cross-Bound Thread Wraps (`细竹柄缠线`)!
  const hp0 = evalPt(handleU0);
  const hp1 = evalPt(handleU1);
  const hAng = Math.atan2(hp1.y - hp0.y, hp1.x - hp0.x);
  const hLen = Math.hypot(hp1.x - hp0.x, hp1.y - hp0.y);

  ctx.save();
  ctx.translate(hp0.x, hp0.y);
  ctx.rotate(hAng);

  // Tapered bamboo grip sleeve with node swellings
  ctx.fillStyle = '#4a240c';
  ctx.strokeStyle = '#1f0c03';
  ctx.lineWidth = 1.5;
  const hw = thickness * 1.38;
  ctx.beginPath();
  ctx.moveTo(0, -hw * 0.68);
  ctx.quadraticCurveTo(hLen * 0.28, -hw * 1.05, hLen * 0.5, -hw * 0.88);
  ctx.quadraticCurveTo(hLen * 0.76, -hw * 1.08, hLen, -hw * 0.72);
  ctx.lineTo(hLen, hw * 0.72);
  ctx.quadraticCurveTo(hLen * 0.76, hw * 1.08, hLen * 0.5, hw * 0.88);
  ctx.quadraticCurveTo(hLen * 0.28, hw * 1.05, 0, hw * 0.68);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Bamboo node rings & tight diagonal rattan/silk thread bindings (`细竹节与缠线纹理`)
  ctx.strokeStyle = '#d99834';
  ctx.lineWidth = 1.35;
  for (let k = 1; k <= 9; k++) {
    const tx = (k / 10) * hLen;
    ctx.beginPath();
    ctx.moveTo(tx - 1.2, -hw * 0.84);
    ctx.lineTo(tx + 1.2, hw * 0.84);
    ctx.stroke();
  }
  // Crimson-brown cord lashing collars at top & bottom of bamboo handle
  ctx.fillStyle = '#8f2014';
  ctx.fillRect(1, -hw * 0.80, 5.5, hw * 1.60);
  ctx.fillRect(hLen - 6.5, -hw * 0.80, 5.5, hw * 1.60);
  ctx.restore();

  // 4. Bone-pin & crimson silk lashing knot right at the puppet leather joint
  drawGegelPivot(ctx, x0, y0, 3.6);
  ctx.restore();
}

/**
 * Draws an ornate curved Javanese `Ukiran Suluran-Naga` perforated leather chariot arch
 * between `p0` and `p1` (completely replacing straight modern diamond-frame tubes!).
 */
function drawUkiranLeatherArch(ctx, p0, p1, bow, wMid, s, rng, flipScroll = 1) {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const mx = (p0.x + p1.x) * 0.5 + nx * bow * s;
  const my = (p0.y + p1.y) * 0.5 + ny * bow * s;

  ctx.save();
  ctx.lineCap = 'round';

  // Scalloped dark-roasted buffalo-hide outer silhouette with flame curls along crest
  ctx.fillStyle = '#220e05';
  ctx.strokeStyle = '#f6cc63';
  ctx.lineWidth = 2.0 * s;
  ctx.beginPath();
  const steps = 10;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const iu = 1 - u;
    const bx = iu * iu * p0.x + 2 * iu * u * mx + u * u * p1.x;
    const by = iu * iu * p0.y + 2 * iu * u * my + u * u * p1.y;
    const scallop = (Math.sin(u * Math.PI) * wMid * 0.62 + 3.2 + (i % 2 === 0 ? 1.8 : -0.6) * flipScroll) * s;
    const px = bx + nx * scallop;
    const py = by + ny * scallop;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  for (let i = steps; i >= 0; i--) {
    const u = i / steps;
    const iu = 1 - u;
    const bx = iu * iu * p0.x + 2 * iu * u * mx + u * u * p1.x;
    const by = iu * iu * p0.y + 2 * iu * u * my + u * u * p1.y;
    const wBot = (Math.sin(u * Math.PI) * wMid * 0.48 + 2.8) * s;
    ctx.lineTo(bx - nx * wBot, by - ny * wBot);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner Sungging crimson/emerald polychrome vein
  ctx.strokeStyle = flipScroll > 0 ? '#bf2b1c' : '#196c56';
  ctx.lineWidth = wMid * 0.46 * s;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.quadraticCurveTo(mx, my, p1.x, p1.y);
  ctx.stroke();

  // Prada gold filigree spine
  ctx.strokeStyle = '#fae084';
  ctx.lineWidth = 1.4 * s;
  ctx.stroke();

  // Tatahan lace pinholes punched right through the curved Ukiran arch!
  ctx.globalCompositeOperation = 'destination-out';
  ctx.fillStyle = '#000';
  for (let k = 1; k <= 6; k++) {
    const u = k / 7;
    const iu = 1 - u;
    const hx = iu * iu * p0.x + 2 * iu * u * mx + u * u * p1.x;
    const hy = iu * iu * p0.y + 2 * iu * u * my + u * u * p1.y;
    punchHoleRow(ctx, hx, hy, hx, hy, 1, 2.1 * s, k + bow);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();
}

/**
 * Renders the ultra-ornate perforated Wayang Kulit `Rata Garuda` Chariot & Garuda-Pelican
 * with ALL THREE authentic physical shadow-puppetry mechanisms:
 * ① Dual-Plane Optical Z-Depth Screen-Contact Breathing (`zLower` tight near Debog <-> `zUpper` tilted off-screen
 *    expanding warm chestnut-amber soft-focus penumbra + 10Hz whole-body beat breathing!)
 * ② 7-Joint `Gegel` Bone-Rivet 10Hz Pendulum Staccato (chassis pitch, torso rock, head nod, clacking jaws,
 *    2-link elbow-whipping wing, articulated ankle claws)
 * ③ Curved Ox-Horn `Cempurit` Rods with Bamboo Thread Wraps, Oblique X-Crossing & 10Hz Wrist Tremor!
 */
function drawWayangPelicanPuppet(kit, ctx, rig, qT, localT, qMix, lampState, isOutroThumbnail) {
  const s = rig.root.scale;
  const rng = kit.makePRNG(180010);
  const wheelStamp = getBakedSunLotusWheel(kit);
  const bufW = 760;
  const bufH = 620;
  const ox = 380;
  const oy = 490;

  // Dual depth buffers:
  // - `lowBuf` (`zLower`): wheels, Ukiran Naga-chariot, legs & lower belly (closer to Kelir & Debog)
  // - `upBuf`  (`zUpper`): articulated neck, Supit Urang crown, clacking Garuda beak & flaring wings (tilted further toward lamp!)
  const lowBuf = kit.bake2D('s10_wayang_low_buf_v3', () => {}, bufW, bufH);
  const lowSh = kit.bake2D('s10_wayang_low_sh_v3', () => {}, bufW, bufH);
  const lowDark = kit.bake2D('s10_wayang_low_dk_v3', () => {}, bufW, bufH);
  const upBuf = kit.bake2D('s10_wayang_up_buf_v3', () => {}, bufW, bufH);
  const upSh = kit.bake2D('s10_wayang_up_sh_v3', () => {}, bufW, bufH);
  const upDark = kit.bake2D('s10_wayang_up_dk_v3', () => {}, bufW, bufH);

  const lCtx = lowBuf.drawingContext;
  const uCtx = upBuf.drawingContext;
  lCtx.save();
  uCtx.save();
  lCtx.clearRect(0, 0, bufW, bufH);
  uCtx.clearRect(0, 0, bufW, bufH);

  // =========================================================================
  // 10Hz Quantized Multi-Joint `Gegel` Articulation & Z-Depth Breathing State
  // =========================================================================
  const qStep = Math.floor(qT * 10 + 1e-4);
  const gagEnv = isOutroThumbnail
    ? 0.86
    : smoothstep(1.50, 1.92, localT) * (1 - smoothstep(4.12, 4.58, localT));

  // ① Z-Depth Screen-Contact Breathing (`zLower` & `zUpper` in [0, 1]):
  // On Gamelan beat strikes (`beatFrac ≈ 0`), Dalang slaps puppet tight to Kelir (`zLower ≈ 0.04`, razor-sharp pinholes!);
  // between beats & during theatrical flourishes (`61.80s` -> `beatFrac = 0.60`), puppet lifts & tilts back!
  const beatFrac = ((qT - 59.0) % BEAT_SEC) / BEAT_SEC;
  const beatLiftWave = Math.pow(Math.sin(beatFrac * Math.PI), 1.15); // 0 on downbeats -> 1.0 mid-beat!
  const rawZLower = clamp(0.03 + 0.36 * beatLiftWave + 0.14 * gagEnv * (qStep % 3 === 0 ? 0.85 : 0.25), 0.03, 0.72);

  // ② 10Hz Clacking Garuda Jaws & 2-Link Whipping Wing Salute (peaking heroically at t = 61.80s!)
  const rawClack = 0.5 + 0.5 * Math.sin(((qT - 61.8) / 0.6) * Math.PI * 2 + Math.PI / 2);
  const jawOpen = gagEnv * (rawClack > 0.50 ? 1.0 : 0.06) * qMix;

  const rawFlap = 0.60 + 0.40 * Math.cos(((qT - 61.8) / 0.5) * Math.PI * 2);
  const wingLift = gagEnv * rawFlap * qMix;

  // Differential Z-tilt: upper crown, beak & flaring wing tilt back toward Blencong oil lamp!
  const zLower = isOutroThumbnail ? 0.12 : rawZLower * qMix;
  const zUpper = isOutroThumbnail
    ? 0.48
    : clamp(rawZLower + 0.38 * wingLift + 0.18 * gagEnv + 0.10 * beatLiftWave, 0.05, 0.92) * qMix;

  // Independent 10Hz Bone-Rivet (`Gegel`) Pendulum Oscillations (damped step jiggle, zero rigid cardboard!):
  const stepAlt = (qStep % 2 === 0 ? 1 : -1) * qMix;
  const stepTri = ((qStep % 3) - 1) * qMix;
  const chassisPitch = (Math.sin(qStep * 1.85) * 0.018 + stepAlt * 0.007) * qMix;
  const torsoRock = (Math.cos(qStep * 1.42) * 0.034 + stepTri * 0.014 - 0.04 * wingLift) * qMix;
  const headNod = (Math.sin(qStep * 2.15 - 0.7) * 0.058 + stepAlt * 0.026 - 0.09 * jawOpen) * qMix;
  const elbowWhip = (Math.sin(qStep * 2.6 - 1.1) * 0.095 + stepAlt * 0.045) * (0.35 + 0.65 * gagEnv) * qMix;
  const ankleJiggle = (stepAlt * 0.09 + Math.cos(qStep * 1.9) * 0.06) * qMix;

  const rotPt = (p, piv, ang) => {
    const dx = p.x - piv.x;
    const dy = p.y - piv.y;
    const c = Math.cos(ang);
    const sn = Math.sin(ang);
    return { x: piv.x + dx * c - dy * sn, y: piv.y + dx * sn + dy * c };
  };

  // Transform rig joints into local buffer space with 10Hz chassis pitch around rear/front wheel midpoint
  const rawPt = (p) => ({ x: (p.x - rig.root.x) + ox, y: (p.y - rig.root.y) + oy });
  const rw = rawPt(rig.rearWheel);
  const fw = rawPt(rig.frontWheel);
  const wheelMid = { x: (rw.x + fw.x) * 0.5, y: (rw.y + fw.y) * 0.5 };
  const cPt = (p) => rotPt(rawPt(p), wheelMid, chassisPitch);

  const bb = cPt(rig.bb);
  const lp = cPt(rig.leftPedal);
  const rp = cPt(rig.rightPedal);
  const sc = cPt(rig.seatCluster);
  const sad = cPt(rig.saddle);
  const ht = cPt(rig.headTop);
  const hb = cPt(rig.headBot);
  const st = cPt(rig.stemTop);
  const hg = cPt(rig.handleGrip);

  // Articulated Torso rocking around hip Gegel pin!
  const hipBase = cPt(rig.hip);
  const tPt = (p) => rotPt(cPt(p), hipBase, torsoRock);
  const hip = hipBase;
  const bc = tPt(rig.bodyCenter);
  const tail = tPt(rig.tailTip);
  const chest = tPt(rig.chest);
  const ws = tPt(rig.wingShoulder);
  const weRaw = tPt(rig.wingElbow);
  const wtRaw = tPt(rig.wingTip);

  // Articulated S-Neck & Head nodding around chest Gegel pin!
  const nPt = (p) => rotPt(tPt(p), chest, headNod * 0.55);
  const hPt = (p) => rotPt(nPt(p), nPt(rig.head), headNod * 0.85);
  const nc1 = nPt(rig.neckC1);
  const nc2 = nPt(rig.neckC2);
  const hd = nPt(rig.head);
  const bu = hPt(rig.beakUpperBase);
  const bl = hPt(rig.beakLowerBase);
  const btBase = hPt(rig.beakTip);
  const pbBase = hPt(rig.pouchBelly);

  const lh = cPt(rig.leftHip);
  const lk = cPt(rig.leftKnee);
  const lf = cPt(rig.leftFoot);
  const rh = cPt(rig.rightHip);
  const rk = cPt(rig.rightKnee);
  const rf = cPt(rig.rightFoot);

  // 2-Link Articulated Wing with independent `elbowWhip` pendulum lag!
  const weLifted = {
    x: lerp(weRaw.x, ws.x + 8 * s, wingLift),
    y: lerp(weRaw.y, ws.y - 38 * s, wingLift),
  };
  const wtLiftedBase = {
    x: lerp(wtRaw.x, ws.x + 60 * s, wingLift),
    y: lerp(wtRaw.y, ws.y - 72 * s, wingLift),
  };
  const we = rotPt(weLifted, ws, elbowWhip * 0.45);
  const wt = rotPt(wtLiftedBase, we, elbowWhip);

  // Clacking Upper & Lower Garuda Beak coordinates
  const upperJawAngle = -0.29 * jawOpen;
  const btUpper = rotPt(btBase, bu, upperJawAngle);
  const btLower = rotPt(btBase, bl, 0.16 * jawOpen);
  const pbLower = {
    x: pbBase.x - 4 * jawOpen * s,
    y: pbBase.y + 17 * jawOpen * s,
  };

  // Helper to paint an articulated Wayang leather leg with ankle Gegel jiggle
  const drawPuppetLeg = (tCtx, hipP, kneeP, footP, pedP, isFar) => {
    // S-curved golden Naga crank arm (not a straight bar!)
    const cmx = (bb.x + pedP.x) * 0.5 + (isFar ? -4 : 4.5) * s;
    const cmy = (bb.y + pedP.y) * 0.5 - 3 * s;
    tCtx.strokeStyle = '#220e05';
    tCtx.lineWidth = 6.8 * s;
    tCtx.lineCap = 'round';
    tCtx.beginPath();
    tCtx.moveTo(bb.x, bb.y);
    tCtx.quadraticCurveTo(cmx, cmy, pedP.x, pedP.y);
    tCtx.stroke();
    tCtx.strokeStyle = '#f4c24d';
    tCtx.lineWidth = 2.0 * s;
    tCtx.stroke();

    // Carved scalloped leather thigh (`Paha`)
    const ta = Math.atan2(kneeP.y - hipP.y, kneeP.x - hipP.x);
    const tl = Math.hypot(kneeP.x - hipP.x, kneeP.y - hipP.y);
    tCtx.save();
    tCtx.translate(hipP.x, hipP.y);
    tCtx.rotate(ta);
    tCtx.fillStyle = isFar ? '#3b1909' : '#230e05';
    tCtx.strokeStyle = '#f5c85b';
    tCtx.lineWidth = 1.9 * s;
    tCtx.beginPath();
    tCtx.moveTo(-4 * s, 0);
    tCtx.quadraticCurveTo(tl * 0.45, -10.5 * s, tl + 3 * s, 0);
    tCtx.quadraticCurveTo(tl * 0.45, 10.0 * s, -4 * s, 0);
    tCtx.closePath();
    tCtx.fill();
    tCtx.stroke();
    paintSunggingStipple(tCtx, tl * 0.48, 0, tl * 0.34, 4.5 * s, isFar ? '#7d1e14' : '#bf2b1c', '#eb8b28', '#fce288', rng, 14);
    tCtx.restore();

    // Carved leather shin (`Betis`)
    const sa = Math.atan2(footP.y - kneeP.y, footP.x - kneeP.x);
    const sl = Math.hypot(footP.x - kneeP.x, footP.y - kneeP.y);
    tCtx.save();
    tCtx.translate(kneeP.x, kneeP.y);
    tCtx.rotate(sa);
    tCtx.fillStyle = isFar ? '#3b1909' : '#230e05';
    tCtx.strokeStyle = '#f5c85b';
    tCtx.lineWidth = 1.7 * s;
    tCtx.beginPath();
    tCtx.moveTo(-3 * s, 0);
    tCtx.quadraticCurveTo(sl * 0.48, -7.2 * s, sl + 2 * s, 0);
    tCtx.quadraticCurveTo(sl * 0.48, 7.2 * s, -3 * s, 0);
    tCtx.closePath();
    tCtx.fill();
    tCtx.stroke();
    tCtx.restore();

    // Articulated Webbed Garuda Claw rotating independently on ankle Gegel rivet!
    tCtx.save();
    tCtx.translate(footP.x, footP.y);
    tCtx.rotate((isFar ? -ankleJiggle : ankleJiggle));
    tCtx.fillStyle = isFar ? '#9c621b' : '#efb036';
    tCtx.strokeStyle = '#220e05';
    tCtx.lineWidth = 1.7 * s;
    tCtx.beginPath();
    tCtx.moveTo(-6 * s, 0);
    tCtx.lineTo(15 * s, 0.5 * s);
    tCtx.quadraticCurveTo(23 * s, -6 * s, 20 * s, 5 * s);
    tCtx.quadraticCurveTo(10 * s, 8.5 * s, -5 * s, 6.5 * s);
    tCtx.closePath();
    tCtx.fill();
    tCtx.stroke();
    tCtx.restore();
  };

  // =========================================================================
  // PLANE A (`lowBuf` at `zLower`): Chariot-Mount, Surya Wheels, Legs & Torso
  // =========================================================================
  // 1. Far Leg
  drawPuppetLeg(lCtx, lh, lk, lf, lp, true);

  // 2. Surya Majapahit 8-Rayed Flame-Lotus Perforated Wheels
  for (const w of [
    { p: rw, a: rig.rearWheel.angle },
    { p: fw, a: rig.frontWheel.angle },
  ]) {
    lCtx.save();
    lCtx.translate(w.p.x, w.p.y);
    lCtx.rotate(w.a);
    lCtx.scale(s, s);
    lCtx.drawImage(wheelStamp.canvas, -78, -78);
    lCtx.restore();
  }

  // 3. Authentic `Rata Garuda` Perforated `Ukiran Naga-Suluran` Chariot Lattice (ZERO straight diamond tubes!)
  drawUkiranLeatherArch(lCtx, rw, sc, -13, 11.5, s, rng, 1);
  drawUkiranLeatherArch(lCtx, rw, bb, 10, 10.5, s, rng, -1);
  drawUkiranLeatherArch(lCtx, sc, bb, -8, 11.0, s, rng, 1);
  // Sweeping royal Naga-body main arch from seat lotus throne to crowned Naga prow (`ht`)!
  drawUkiranLeatherArch(lCtx, sc, ht, -17, 13.5, s, rng, 1);
  drawUkiranLeatherArch(lCtx, hb, bb, 15, 12.5, s, rng, -1);
  drawUkiranLeatherArch(lCtx, ht, fw, 12, 11.0, s, rng, 1);

  // Crowned Naga-Head Prow & Curling Garuda-Scroll Handlebar (`st -> hg`)
  lCtx.fillStyle = '#220e05';
  lCtx.strokeStyle = '#f7cf68';
  lCtx.lineWidth = 2.1 * s;
  lCtx.beginPath();
  lCtx.moveTo(ht.x - 5 * s, ht.y + 4 * s);
  lCtx.quadraticCurveTo(st.x - 10 * s, st.y - 16 * s, st.x + 14 * s, st.y - 14 * s);
  lCtx.quadraticCurveTo(hg.x + 6 * s, hg.y - 10 * s, hg.x - 3 * s, hg.y + 2 * s);
  lCtx.quadraticCurveTo(st.x + 2 * s, st.y + 2 * s, ht.x + 4 * s, ht.y + 5 * s);
  lCtx.closePath();
  lCtx.fill();
  lCtx.stroke();

  // Scalloped Padma-Lotus Crank Medallion at BB (no plain circle!)
  lCtx.fillStyle = '#220e05';
  lCtx.strokeStyle = '#f7cf68';
  lCtx.lineWidth = 2.0 * s;
  lCtx.beginPath();
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + rig.rearWheel.angle * 0.5;
    const rr = (i % 2 === 0 ? 16.5 : 12.8) * s;
    if (i === 0) lCtx.moveTo(bb.x + Math.cos(a) * rr, bb.y + Math.sin(a) * rr);
    else lCtx.lineTo(bb.x + Math.cos(a) * rr, bb.y + Math.sin(a) * rr);
  }
  lCtx.closePath();
  lCtx.fill();
  lCtx.stroke();

  // Lotus-throne saddle (`Padmasana`)
  lCtx.fillStyle = '#a82216';
  lCtx.strokeStyle = '#f7cf68';
  lCtx.lineWidth = 2.1 * s;
  lCtx.beginPath();
  lCtx.moveTo(sad.x - 21 * s, sad.y - 6 * s);
  lCtx.quadraticCurveTo(sad.x, sad.y + 9 * s, sad.x + 17 * s, sad.y - 1 * s);
  lCtx.quadraticCurveTo(sad.x, sad.y - 7 * s, sad.x - 21 * s, sad.y - 6 * s);
  lCtx.closePath();
  lCtx.fill();
  lCtx.stroke();

  // 4. Garuda-Pelican Royal Tail Plumes & Sungging-Stippled Torso Armor
  for (let f = 2; f >= 0; f--) {
    const ang = -0.40 + f * 0.25 + torsoRock * 0.6;
    lCtx.save();
    lCtx.translate(tail.x + 12 * s, tail.y - 2 * s);
    lCtx.rotate(ang);
    lCtx.fillStyle = f === 1 ? '#186a55' : '#b5281a';
    lCtx.strokeStyle = '#f7cf68';
    lCtx.lineWidth = 1.9 * s;
    lCtx.beginPath();
    lCtx.moveTo(10 * s, 0);
    lCtx.quadraticCurveTo(-24 * s, -17 * s, -50 * s, -6 * s);
    lCtx.quadraticCurveTo(-30 * s, 12 * s, 10 * s, 5 * s);
    lCtx.closePath();
    lCtx.fill();
    lCtx.stroke();
    lCtx.restore();
  }

  lCtx.fillStyle = '#220e05';
  lCtx.strokeStyle = '#f7cf68';
  lCtx.lineWidth = 2.5 * s;
  lCtx.beginPath();
  lCtx.moveTo(tail.x, tail.y);
  lCtx.quadraticCurveTo(bc.x - 38 * s, bc.y - 36 * s, chest.x + 11 * s, chest.y - 8 * s);
  lCtx.quadraticCurveTo(bc.x + 38 * s, bc.y + 28 * s, hip.x - 14 * s, hip.y + 16 * s);
  lCtx.quadraticCurveTo(bc.x - 46 * s, bc.y + 16 * s, tail.x, tail.y);
  lCtx.closePath();
  lCtx.fill();
  lCtx.stroke();

  // Sungging drenjeman stippled polychrome breastplates (no flat ovals!)
  paintSunggingStipple(lCtx, bc.x + 2 * s, bc.y + 2 * s, 33 * s, 18 * s, '#9c1f14', '#e0671f', '#fce082', rng, 44);
  paintSunggingStipple(lCtx, bc.x - 3 * s, bc.y + 1 * s, 20 * s, 10.5 * s, '#155c4a', '#3ea67d', '#f7d46e', rng, 28);

  // Near Leg on Front Pedal
  drawPuppetLeg(lCtx, rh, rk, rf, rp, false);

  // Punch crisp `Tatahan` lace cutouts in `lowBuf` (`destination-out`)!
  lCtx.save();
  lCtx.globalCompositeOperation = 'destination-out';
  lCtx.fillStyle = '#000';
  punchHoleArc(lCtx, bb.x, bb.y, 9.5 * s, 0, Math.PI * 1.75, 8, 2.3 * s);
  punchHoleArc(lCtx, bc.x + 1 * s, bc.y + 2 * s, 26 * s, -2.75, 2.75, 14, 2.7 * s);
  for (let k = 0; k < 7; k++) {
    const a = -2.1 + (k / 6) * 4.2;
    punchPetalSlot(lCtx, bc.x + Math.cos(a) * 16 * s, bc.y + 1 * s + Math.sin(a) * 9.5 * s, 4.4 * s, 2.3 * s, a);
  }
  for (let f = 0; f < 3; f++) {
    const fy = tail.y - 9 * s + f * 6.5 * s;
    punchHoleRow(lCtx, tail.x - 28 * s, fy - 4 * s, tail.x + 2 * s, fy, 5, 2.4 * s, f + 30);
  }
  punchHoleRow(lCtx, lerp(rh.x, rk.x, 0.24), lerp(rh.y, rk.y, 0.24), lerp(rh.x, rk.x, 0.76), lerp(rh.y, rk.y, 0.76), 4, 2.1 * s, 41);
  punchHoleRow(lCtx, lerp(rk.x, rf.x, 0.24), lerp(rk.y, rf.y, 0.24), lerp(rk.x, rf.x, 0.76), lerp(rk.y, rf.y, 0.76), 4, 1.9 * s, 42);
  lCtx.restore();

  drawGegelPivot(lCtx, hip.x, hip.y, 4.2 * s);
  drawGegelPivot(lCtx, rh.x, rh.y, 4.4 * s);
  drawGegelPivot(lCtx, rk.x, rk.y, 3.9 * s);
  drawGegelPivot(lCtx, rf.x, rf.y, 3.3 * s);
  drawGegelPivot(lCtx, lk.x, lk.y, 3.3 * s);

  // =========================================================================
  // PLANE B (`upBuf` at `zUpper`): Tilted S-Neck, Supit Urang Crown, Clacking
  // Garuda Beak & 2-Link Whipping Wings (casts wider amber penumbra when lifted!)
  // =========================================================================
  // Far-side secondary wing fanning out during Bar-2 salute
  if (wingLift > 0.04) {
    uCtx.save();
    uCtx.translate(ws.x - 8 * s, ws.y - 4 * s);
    uCtx.rotate(-0.58 * wingLift + elbowWhip * 0.3);
    uCtx.fillStyle = '#361608';
    uCtx.strokeStyle = '#f2be49';
    uCtx.lineWidth = 2.0 * s;
    uCtx.beginPath();
    uCtx.moveTo(0, 0);
    uCtx.quadraticCurveTo(18 * s, -44 * s, 60 * s, -35 * s);
    uCtx.quadraticCurveTo(42 * s, 5 * s, 0, 12 * s);
    uCtx.closePath();
    uCtx.fill();
    uCtx.stroke();
    uCtx.globalCompositeOperation = 'destination-out';
    uCtx.fillStyle = '#000';
    punchHoleRow(uCtx, 14 * s, -12 * s, 46 * s, -24 * s, 5, 2.3 * s, 51);
    uCtx.globalCompositeOperation = 'source-over';
    uCtx.restore();
  }

  // S-Curved Neck + Praba Necklace Collar
  uCtx.lineCap = 'round';
  uCtx.strokeStyle = '#220e05';
  uCtx.lineWidth = 22 * s;
  uCtx.beginPath();
  uCtx.moveTo(chest.x, chest.y + 2 * s);
  uCtx.bezierCurveTo(nc1.x, nc1.y, nc2.x, nc2.y, hd.x, hd.y);
  uCtx.stroke();
  uCtx.strokeStyle = '#e5a42c';
  uCtx.lineWidth = 13.5 * s;
  uCtx.stroke();
  uCtx.strokeStyle = '#220e05';
  uCtx.lineWidth = 6.5 * s;
  uCtx.stroke();

  paintSunggingStipple(uCtx, chest.x + 4 * s, chest.y + 2 * s, 15 * s, 8 * s, '#a82316', '#f2b63d', '#fff0a8', rng, 18);

  // Royal `Gelung Supit Urang` Lobster-Claw Garuda Crown behind head
  uCtx.fillStyle = '#220e05';
  uCtx.strokeStyle = '#f7cf68';
  uCtx.lineWidth = 2.4 * s;
  uCtx.beginPath();
  uCtx.moveTo(hd.x - 8 * s, hd.y + 6 * s);
  uCtx.bezierCurveTo(hd.x - 50 * s, hd.y - 6 * s, hd.x - 52 * s, hd.y - 56 * s, hd.x - 5 * s, hd.y - 49 * s);
  uCtx.quadraticCurveTo(hd.x - 26 * s, hd.y - 30 * s, hd.x + 5 * s, hd.y - 16 * s);
  uCtx.closePath();
  uCtx.fill();
  uCtx.stroke();

  uCtx.fillStyle = '#bf2b1c';
  uCtx.strokeStyle = '#fff0a8';
  uCtx.lineWidth = 1.7 * s;
  uCtx.beginPath();
  uCtx.moveTo(hd.x - 14 * s, hd.y - 6 * s);
  uCtx.lineTo(hd.x - 4 * s, hd.y - 35 * s);
  uCtx.lineTo(hd.x + 9 * s, hd.y - 17 * s);
  uCtx.lineTo(hd.x + 16 * s, hd.y - 11 * s);
  uCtx.closePath();
  uCtx.fill();
  uCtx.stroke();

  // Sculpted Javanese Garuda cranium (organic scalloped contour, not plain circle!)
  uCtx.fillStyle = '#220e05';
  uCtx.strokeStyle = '#f7cf68';
  uCtx.lineWidth = 2.1 * s;
  uCtx.beginPath();
  uCtx.moveTo(hd.x - 16 * s, hd.y + 2 * s);
  uCtx.quadraticCurveTo(hd.x - 15 * s, hd.y - 16 * s, hd.x + 2 * s, hd.y - 16 * s);
  uCtx.quadraticCurveTo(hd.x + 17 * s, hd.y - 14 * s, hd.x + 16 * s, hd.y + 3 * s);
  uCtx.quadraticCurveTo(hd.x + 4 * s, hd.y + 16 * s, hd.x - 16 * s, hd.y + 2 * s);
  uCtx.closePath();
  uCtx.fill();
  uCtx.stroke();

  // Articulated Clacking Garuda Jaws & Honeycomb-Perforated Gular Throat Pouch!
  if (jawOpen > 0.12) {
    uCtx.strokeStyle = '#fae084';
    uCtx.lineWidth = 2.5 * s;
    uCtx.beginPath();
    uCtx.moveTo(bu.x + 4 * s, bu.y + 4 * s);
    uCtx.quadraticCurveTo(
      lerp(bu.x, btUpper.x, 0.45),
      lerp(bu.y, btLower.y, 0.5) - 4 * s,
      lerp(btUpper.x, btLower.x, 0.5) - 8 * s,
      lerp(btUpper.y, btLower.y, 0.5)
    );
    uCtx.stroke();
  }

  // Lower Jaw & Sungging-shaded Gular Throat Pouch
  uCtx.fillStyle = '#a82216';
  uCtx.strokeStyle = '#f7cf68';
  uCtx.lineWidth = 2.3 * s;
  uCtx.beginPath();
  uCtx.moveTo(bl.x, bl.y);
  uCtx.quadraticCurveTo(pbLower.x - 6 * s, pbLower.y + 12 * s, btLower.x - 2 * s, btLower.y + 3 * s);
  uCtx.lineTo(bl.x + 4 * s, bl.y - 1 * s);
  uCtx.closePath();
  uCtx.fill();
  uCtx.stroke();

  uCtx.fillStyle = '#186b56';
  uCtx.strokeStyle = '#f5c85b';
  uCtx.lineWidth = 1.5 * s;
  uCtx.beginPath();
  uCtx.moveTo(bl.x + 6 * s, bl.y + 3 * s);
  uCtx.quadraticCurveTo(pbLower.x - 2 * s, pbLower.y + 2 * s, btLower.x - 12 * s, btLower.y + 2 * s);
  uCtx.lineTo(bl.x + 8 * s, bl.y + 1 * s);
  uCtx.closePath();
  uCtx.fill();
  uCtx.stroke();

  // Upper Garuda Mandible rotating around jaw Gegel pin
  uCtx.save();
  uCtx.translate(bu.x, bu.y);
  uCtx.rotate(upperJawAngle);
  const bLen = Math.hypot(btBase.x - bu.x, btBase.y - bu.y);
  const bBaseAng = Math.atan2(btBase.y - bu.y, btBase.x - bu.x);
  uCtx.rotate(bBaseAng);

  uCtx.fillStyle = '#220e05';
  uCtx.strokeStyle = '#fff0a8';
  uCtx.lineWidth = 2.1 * s;
  uCtx.beginPath();
  uCtx.moveTo(-2 * s, -2 * s);
  uCtx.quadraticCurveTo(bLen * 0.28, -14 * s, bLen * 0.46, -4 * s);
  uCtx.quadraticCurveTo(bLen * 0.68, -13 * s, bLen + 3 * s, -4 * s);
  uCtx.quadraticCurveTo(bLen + 14 * s, 4 * s, bLen + 1 * s, 11.5 * s);
  uCtx.quadraticCurveTo(bLen - 4 * s, 4 * s, -2 * s, 7 * s);
  uCtx.closePath();
  uCtx.fill();
  uCtx.stroke();

  uCtx.globalCompositeOperation = 'destination-out';
  uCtx.fillStyle = '#000';
  punchHoleRow(uCtx, bLen * 0.16, 1.5 * s, bLen * 0.84, 1.5 * s, 7, 2.3 * s, 61);
  uCtx.globalCompositeOperation = 'source-over';
  uCtx.restore();

  // Foreground Two-Segment Articulated Wing (`Bahu` upper arm + `Sayap` forearm feather fan!)
  // Segment 1: Upper wing (`ws -> we`)
  uCtx.fillStyle = '#220e05';
  uCtx.strokeStyle = '#f7cf68';
  uCtx.lineWidth = 2.2 * s;
  uCtx.beginPath();
  uCtx.moveTo(ws.x - 6 * s, ws.y - 3 * s);
  uCtx.quadraticCurveTo((ws.x + we.x) * 0.5 - 8 * s, (ws.y + we.y) * 0.5 - 8 * s, we.x + 5 * s, we.y - 3 * s);
  uCtx.quadraticCurveTo((ws.x + we.x) * 0.5 + 8 * s, (ws.y + we.y) * 0.5 + 10 * s, ws.x + 6 * s, ws.y + 6 * s);
  uCtx.closePath();
  uCtx.fill();
  uCtx.stroke();

  // Segment 2: Whipping primary feather fan (`we -> wt`) with scalloped Garuda feather tips!
  uCtx.fillStyle = '#220e05';
  uCtx.strokeStyle = '#f7cf68';
  uCtx.lineWidth = 2.4 * s;
  uCtx.beginPath();
  uCtx.moveTo(we.x - 5 * s, we.y - 2 * s);
  uCtx.quadraticCurveTo(lerp(we.x, wt.x, 0.5) - 10 * s, lerp(we.y, wt.y, 0.5) - 10 * s, wt.x + 9 * s, wt.y + 1 * s);
  // 4 scalloped primary feather notches along trailing edge
  for (let f = 1; f <= 4; f++) {
    const u = f / 4;
    const tx = lerp(wt.x + 9 * s, ws.x + 12 * s, u);
    const ty = lerp(wt.y + 1 * s, ws.y + 5 * s, u);
    uCtx.quadraticCurveTo(tx + 5 * s, ty + 8 * s, tx, ty);
  }
  uCtx.closePath();
  uCtx.fill();
  uCtx.stroke();

  paintSunggingStipple(
    uCtx,
    lerp(we.x, wt.x, 0.36),
    lerp(we.y, wt.y, 0.36) + 3 * s,
    18 * s,
    8 * s,
    '#9e2014',
    '#e47222',
    '#fce082',
    rng,
    24
  );

  // Punch crisp `Tatahan` lace cutouts in `upBuf` (`destination-out`)!
  uCtx.save();
  uCtx.globalCompositeOperation = 'destination-out';
  uCtx.fillStyle = '#000';
  for (let i = 1; i <= 6; i++) {
    const u = i / 7;
    const nx = (1 - u) ** 3 * chest.x + 3 * (1 - u) ** 2 * u * nc1.x + 3 * (1 - u) * u ** 2 * nc2.x + u ** 3 * hd.x;
    const ny = (1 - u) ** 3 * chest.y + 3 * (1 - u) ** 2 * u * nc1.y + 3 * (1 - u) * u ** 2 * nc2.y + u ** 3 * hd.y;
    punchHoleRow(uCtx, nx, ny, nx, ny, 1, 2.6 * s, i + 70);
  }
  punchHoleArc(uCtx, hd.x - 24 * s, hd.y - 26 * s, 15 * s, 1.7, 4.8, 9, 2.9 * s);
  punchPetalSlot(uCtx, hd.x - 4 * s, hd.y - 21 * s, 4.6 * s, 2.4 * s, -1.2);

  for (let rIdx = 1; rIdx <= 3; rIdx++) {
    const v = rIdx / 4.0;
    const rowY0 = lerp(bl.y + 2 * s, bl.y + 6 * s, v);
    const rowMidX = lerp((bl.x + btLower.x) * 0.5, pbLower.x, v);
    const rowMidY = lerp((bl.y + btLower.y) * 0.5 + 2 * s, pbLower.y + 5 * s, v);
    const count = 8 - rIdx;
    for (let k = 1; k <= count; k++) {
      const u = k / (count + 1);
      const hx = (1 - u) ** 2 * (bl.x + 5 * s) + 2 * (1 - u) * u * rowMidX + u ** 2 * (btLower.x - 8 * s);
      const hy = (1 - u) ** 2 * rowY0 + 2 * (1 - u) * u * rowMidY + u ** 2 * (btLower.y + 2 * s);
      punchHoleRow(uCtx, hx, hy, hx, hy, 1, (2.9 - rIdx * 0.25) * s, rIdx * 10 + k);
    }
  }

  punchHoleRow(uCtx, lerp(ws.x, wt.x, 0.16), lerp(ws.y, wt.y, 0.16), lerp(ws.x, wt.x, 0.88), lerp(ws.y, wt.y, 0.88), 7, 2.7 * s, 81);
  punchHoleRow(uCtx, lerp(we.x, wt.x, 0.20), lerp(we.y, wt.y, 0.20) + 7 * s, lerp(we.x, wt.x, 0.82), lerp(we.y, wt.y, 0.82) + 6 * s, 5, 2.4 * s, 82);
  uCtx.restore();

  // Expressive Javanese Wayang ` Kedelen ` Eye & Gegel Bone Rivets
  const ex = hd.x + 4.5 * s;
  const ey = hd.y - 2.5 * s;
  uCtx.fillStyle = '#fffbe8';
  uCtx.strokeStyle = '#bf2b1c';
  uCtx.lineWidth = 1.9 * s;
  uCtx.beginPath();
  uCtx.moveTo(ex - 6.2 * s, ey);
  uCtx.quadraticCurveTo(ex, ey - 5.5 * s, ex + 6.2 * s, ey);
  uCtx.quadraticCurveTo(ex, ey + 5.2 * s, ex - 6.2 * s, ey);
  uCtx.closePath();
  uCtx.fill();
  uCtx.stroke();
  uCtx.fillStyle = '#1a0a03';
  uCtx.fillRect(ex - 0.5 * s, ey - 2.2 * s, 3.8 * s, 4.4 * s);

  drawGegelPivot(uCtx, chest.x, chest.y + 2 * s, 4.0 * s);
  drawGegelPivot(uCtx, bu.x, bu.y + 3 * s, 3.6 * s);
  drawGegelPivot(uCtx, ws.x, ws.y, 4.6 * s);
  drawGegelPivot(uCtx, we.x, we.y, 4.1 * s);
  drawGegelPivot(uCtx, wt.x, wt.y, 3.6 * s);

  lCtx.restore();
  uCtx.restore();

  // =========================================================================
  // COMPOSITE BOTH OPTICAL Z-PLANES ONTO `Kelir` SCREEN!
  // When `z ≈ 0`: pressed flat against cotton -> razor-sharp Tatahan pinholes & crisp polychrome!
  // When `z > 0`: lifted toward Blencong `(lampX, lampY)` -> shadow expands (`1 + 0.072*z`), shifts
  // radially away from lamp, blooms into warm chestnut-amber soft-focus penumbra + diffused umber core,
  // while direct polychrome contrast softens organically behind the scattering cotton!
  // =========================================================================
  const compositeOpticalPlane = (srcBuf, amberBuf, darkBuf, zDepth) => {
    const aCtx = amberBuf.drawingContext;
    aCtx.save();
    aCtx.clearRect(0, 0, bufW, bufH);
    aCtx.drawImage(srcBuf.canvas, 0, 0);
    aCtx.globalCompositeOperation = 'source-in';
    aCtx.fillStyle = '#803107'; // Warm translucent chestnut-amber penumbra
    aCtx.fillRect(0, 0, bufW, bufH);
    aCtx.restore();

    const dCtx = darkBuf.drawingContext;
    dCtx.save();
    dCtx.clearRect(0, 0, bufW, bufH);
    dCtx.drawImage(srcBuf.canvas, 0, 0);
    dCtx.globalCompositeOperation = 'source-in';
    dCtx.fillStyle = '#2a0f04'; // Deep roasted-umber rear silhouette core when lifted off screen
    dCtx.fillRect(0, 0, bufW, bufH);
    dCtx.restore();

    // Radial projection vector away from live flickering Blencong oil-lamp wick!
    const rayX = (rig.root.x - lampState.lampX) * (0.022 + 0.085 * zDepth);
    const rayY = (rig.root.y - lampState.lampY) * (0.012 + 0.048 * zDepth);
    const scaleSh = 1.006 + 0.072 * zDepth;
    const penumbraBlur = 1.4 + 10.5 * zDepth;

    // 1) Outer warm chestnut-amber optical penumbra (`离幕散开琥珀柔焦虚影并微涨`)
    ctx.save();
    ctx.globalAlpha = lerp(0.24, 0.56, zDepth);
    ctx.filter = `blur(${penumbraBlur.toFixed(1)}px)`;
    ctx.drawImage(
      amberBuf.canvas,
      rig.root.x - ox * scaleSh + rayX,
      rig.root.y - oy * scaleSh + rayY,
      bufW * scaleSh,
      bufH * scaleSh
    );
    ctx.restore();

    // 2) Softened umber shadow core as puppet lifts back from cotton weave
    if (zDepth > 0.08) {
      const coreScale = 1.0 + 0.036 * zDepth;
      const coreBlur = 0.8 + 4.8 * zDepth;
      ctx.save();
      ctx.globalAlpha = lerp(0.10, 0.68, zDepth);
      ctx.filter = `blur(${coreBlur.toFixed(1)}px)`;
      ctx.drawImage(
        darkBuf.canvas,
        rig.root.x - ox * coreScale + rayX * 0.52,
        rig.root.y - oy * coreScale + rayY * 0.52,
        bufW * coreScale,
        bufH * coreScale
      );
      ctx.restore();
    }

    // 3) Warm backlit Tatahan pinhole light-diffraction bloom on cotton threads
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = lerp(0.16, 0.28, zDepth);
    ctx.filter = `blur(${(2.0 + 3.0 * zDepth).toFixed(1)}px)`;
    ctx.drawImage(amberBuf.canvas, rig.root.x - ox, rig.root.y - oy);
    ctx.restore();

    // 4) Direct buffalo-hide polychrome & razor-sharp Tatahan pinholes (100% crisp when `z≈0`, softening as `z` lifts!)
    ctx.save();
    ctx.globalAlpha = lerp(0.99, 0.48, zDepth);
    if (zDepth > 0.42) {
      ctx.filter = `blur(${((zDepth - 0.42) * 2.6).toFixed(1)}px)`;
    }
    ctx.drawImage(srcBuf.canvas, rig.root.x - ox, rig.root.y - oy);
    ctx.restore();
  };

  compositeOpticalPlane(lowBuf, lowSh, lowDark, zLower);
  compositeOpticalPlane(upBuf, upSh, upDark, zUpper);

  // =========================================================================
  // ③ Naturally Curved Ox-Horn `Cempurit` Rods with Bamboo Thread Wraps,
  //    Oblique X-Crossing Choreography & 10Hz Dalang Wrist-Flick Tremors!
  // =========================================================================
  const panelWingAnchor = {
    x: rig.root.x + (wt.x - ox) - 2 * s,
    y: rig.root.y + (wt.y - oy) + 2 * s,
  };
  const panelBeakAnchor = {
    x: rig.root.x + (btLower.x - ox) - 5 * s,
    y: rig.root.y + (btLower.y - oy) + 4 * s,
  };
  const panelSaddleAnchor = {
    x: rig.root.x + (sad.x - ox) + 2 * s,
    y: rig.root.y + (sad.y - oy) + 7 * s,
  };
  const panelFootAnchor = {
    x: rig.root.x + (rf.x - ox) + 5 * s,
    y: rig.root.y + (rf.y - oy) + 4 * s,
  };

  // 10Hz high-frequency Dalang wrist-flick tremor (`抖腕微颤`) + oblique crossing hand pivots!
  const wristTremorA = (stepAlt * 7.5 + Math.sin(qStep * 3.1) * 5.0) * (0.35 + 0.65 * gagEnv) * s;
  const wristTremorB = (-stepAlt * 6.8 + Math.cos(qStep * 2.7) * 5.5) * (0.35 + 0.65 * gagEnv) * s;

  // Notice the authentic oblique X-crossing:
  // - Wing anchor is upper-left (`~rig.root.x + 15`), while its puppeteer left-hand sweeps forward-right (`rig.root.x + 68`)!
  // - Beak anchor is far-right (`~rig.beakTip.x`), while its puppeteer right-hand sweeps back-left (`rig.root.x - 4`)!
  // This makes the two curved horn rods cross dynamically in a theatrical Javanese Dalang X-stance!
  const wingBotX = rig.root.x + (58 + 26 * wingLift) * s + wristTremorB;
  const beakBotX = rig.root.x - (2 + 18 * jawOpen) * s + wristTremorA;
  const wingBotY = PANEL_SIZE + 14 - 28 * wingLift;
  const beakBotY = PANEL_SIZE + 14 - 24 * jawOpen;

  // 1) Main `Gapit` central split-horn spine slanting obliquely into Debog/Dalang grip
  drawCurvedHornCempurit(
    ctx,
    panelSaddleAnchor.x,
    panelSaddleAnchor.y,
    rig.root.x - 42 * s + wristTremorB * 0.25,
    PANEL_SIZE + 12,
    lampState.lampX,
    { thickness: 6.0 * s, bow1: -16 * s, bow2: 10 * s, handleU0: 0.62, handleU1: 0.84, isMainGapit: true }
  );

  // 2) Auxiliary Front Foot/Pedal Horn Rod (oblique forward slant)
  drawCurvedHornCempurit(
    ctx,
    panelFootAnchor.x,
    panelFootAnchor.y,
    panelFootAnchor.x + 38 * s - wristTremorA * 0.5,
    PANEL_SIZE + 12,
    lampState.lampX,
    { thickness: 3.5 * s, bow1: 14 * s, bow2: -8 * s, handleU0: 0.58, handleU1: 0.82 }
  );

  // 3) Wing `Cempurit` Curved Ox-Horn Rod (angles obliquely forward-downward, crossing the Beak rod!)
  drawCurvedHornCempurit(
    ctx,
    panelWingAnchor.x,
    panelWingAnchor.y,
    wingBotX,
    wingBotY,
    lampState.lampX,
    { thickness: 4.3 * s, bow1: -22 * s, bow2: 14 * s, handleU0: 0.66, handleU1: 0.86 }
  );

  // 4) Beak `Cempurit` Curved Ox-Horn Rod (angles obliquely backward-downward, crossing the Wing rod!)
  drawCurvedHornCempurit(
    ctx,
    panelBeakAnchor.x,
    panelBeakAnchor.y,
    beakBotX,
    beakBotY,
    lampState.lampX,
    { thickness: 4.1 * s, bow1: 24 * s, bow2: -15 * s, handleU0: 0.68, handleU1: 0.88 }
  );

  // Dalang Master Puppeteer's warm backlit sculpted hand/finger silhouettes flicking the bamboo grips at bottom!
  if (gagEnv > 0.04 && !isOutroThumbnail) {
    ctx.save();
    ctx.globalAlpha = gagEnv * 0.58;
    ctx.fillStyle = '#170702';
    ctx.strokeStyle = 'rgba(248, 192, 82, 0.45)';
    ctx.lineWidth = 1.5;
    for (const [hx, hy, tilt] of [
      [wingBotX - 8 * s, PANEL_SIZE - 16 - 16 * wingLift, -0.26 + stepAlt * 0.05],
      [beakBotX + 8 * s, PANEL_SIZE - 14 - 14 * jawOpen, 0.24 - stepAlt * 0.05],
    ]) {
      ctx.save();
      ctx.translate(hx, hy);
      ctx.rotate(tilt);
      // Articulated thumb + curled fingers gripping Hulu handle (not a plain ellipse!)
      ctx.beginPath();
      ctx.moveTo(-18 * s, 26 * s);
      ctx.quadraticCurveTo(-22 * s, -6 * s, -6 * s, -18 * s);
      ctx.quadraticCurveTo(6 * s, -22 * s, 14 * s, -8 * s);
      ctx.quadraticCurveTo(22 * s, -12 * s, 19 * s, 4 * s);
      ctx.quadraticCurveTo(18 * s, 20 * s, 10 * s, 28 * s);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
}

/**
 * Renders a classic Javanese Kraton comic court-servant shadow puppet (`Punokawan` — round-bellied
 * `Semar / Bagong` silhouette, ~135px tall, planted in the `Debog` banana trunk at `x ≈ 775, y ≈ 680`):
 * - Complete with Sungging stippled Kain Poleng sarong, fine `Tatahan` leather pin-perforations,
 *   bone `Gegel` joint rivets, central `Gapit` horn spike into the banana trunk, warm translucent
 *   amber horn rod (`Cempurit`) to its articulated wrist, and contact-to-soft-penumbra rear shadow!
 * - Across `localT ∈ [1.6s, 4.9s]` (10Hz `qT`), enthusiastically clacks its long two-link articulated
 *   fore-arm up and down in comic salute while nodding its round `Kuncung`-crested head!
 */
function drawPunokawanServantPuppet(kit, ctx, qT, qLocalT, lampState, isOutroThumbnail = false) {
  const baseX = 775;
  const baseY = ROAD_EDGE_Y + 2;
  const bufW = 250;
  const bufH = 230;
  const ox = 152; // local foot X inside 250x230 buffer (leaves room on left `-X` for long saluting arm!)
  const oy = 196; // local foot Y inside 250x230 buffer

  const lowBuf = kit.bake2D('s10_punokawan_low_v1', () => {}, bufW, bufH);
  const lowAmb = kit.bake2D('s10_punokawan_low_amb_v1', () => {}, bufW, bufH);
  const lowDk = kit.bake2D('s10_punokawan_low_dk_v1', () => {}, bufW, bufH);
  const upBuf = kit.bake2D('s10_punokawan_up_v1', () => {}, bufW, bufH);
  const upAmb = kit.bake2D('s10_punokawan_up_amb_v1', () => {}, bufW, bufH);
  const upDk = kit.bake2D('s10_punokawan_up_dk_v1', () => {}, bufW, bufH);

  const lCtx = lowBuf.drawingContext;
  const uCtx = upBuf.drawingContext;
  lCtx.save();
  uCtx.save();
  lCtx.clearRect(0, 0, bufW, bufH);
  uCtx.clearRect(0, 0, bufW, bufH);

  const rng = kit.makePRNG(180077);
  const qStep = Math.floor(qT * 10 + 1e-4);
  const stepSign = qStep % 2 === 0 ? 1 : -1;

  // Salute envelope across localT ∈ [1.6s, 4.9s] on the 10Hz quantized clock
  const saluteEnv = isOutroThumbnail
    ? 0.85
    : smoothstep(1.52, 1.86, qLocalT) * (1 - smoothstep(4.56, 4.96, qLocalT));

  // 10Hz staccato arm-clacking wave (peaks cleanly in raised salute at t = 61.80s!)
  const clackWave = isOutroThumbnail
    ? 0.85
    : Math.cos(((qT - 61.8) / 0.40) * Math.PI * 2);
  const clack01 = 0.5 + 0.5 * clackWave; // 0 (down-clack) .. 1 (high enthusiastic salute!)

  // Joyful 10Hz body rock & round-head nod
  const bodyRock =
    Math.sin((qT / BEAT_SEC) * Math.PI) * 0.022 +
    saluteEnv * (-0.045 * clack01 + stepSign * 0.016);
  const headNod =
    Math.sin(qStep * 1.3) * 0.025 +
    saluteEnv * (0.165 * Math.sin(((qT - 61.7) / 0.50) * Math.PI * 2) + stepSign * 0.052);

  // Differential Z-depth: planted feet/belly stay tight to Debog & Kelir (`zLower`),
  // while nodding head & clacking salute arm lift off-screen into softer amber penumbra (`zUpper`)!
  const zLower = clamp(0.05 + 0.08 * saluteEnv * (qStep % 3 === 0 ? 1 : 0.35), 0.04, 0.20);
  const zUpper = clamp(0.14 + 0.28 * saluteEnv * (0.45 + 0.55 * clack01), 0.12, 0.52);

  // =========================================================================
  // 1. Fresh Debog Stab Scar & Planted Ox-Horn Central `Gapit` Spike at (775, 682)
  // =========================================================================
  ctx.save();
  ctx.fillStyle = 'rgba(18, 28, 8, 0.82)';
  ctx.beginPath();
  ctx.moveTo(baseX - 7, baseY + 2);
  ctx.quadraticCurveTo(baseX, baseY - 1.5, baseX + 8, baseY + 2.5);
  ctx.quadraticCurveTo(baseX, baseY + 6, baseX - 7, baseY + 2);
  ctx.fill();

  // Sturdy tapered buffalo-horn central Gapit spike planted obliquely into banana trunk
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(46, 19, 6, 0.94)';
  ctx.lineWidth = 5.4;
  ctx.beginPath();
  ctx.moveTo(baseX + 1, baseY - 6);
  ctx.quadraticCurveTo(baseX + 4, baseY + 14, baseX + 7, baseY + 34);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255, 210, 104, 0.62)';
  ctx.lineWidth = 1.7;
  ctx.beginPath();
  ctx.moveTo(baseX, baseY - 5);
  ctx.quadraticCurveTo(baseX + 3, baseY + 14, baseX + 6, baseY + 32);
  ctx.stroke();
  ctx.restore();

  // =========================================================================
  // 2. `lowBuf` (`zLower` tight contact): Planted Feet, Kain Poleng Sarong & Pot-Belly Torso
  // =========================================================================
  lCtx.translate(ox, oy);
  lCtx.rotate(bodyRock);

  // Short sturdy comic Semar legs & planted bare feet with anklets (`Binggel`)
  lCtx.fillStyle = '#230e05';
  lCtx.strokeStyle = '#f5c85b';
  lCtx.lineWidth = 1.7;
  for (const [fx, fw, isBack] of [[8, 16, true], [-9, 18, false]]) {
    lCtx.fillStyle = isBack ? '#381708' : '#230e05';
    lCtx.beginPath();
    lCtx.moveTo(fx - 5, -26);
    lCtx.lineTo(fx + 6, -26);
    lCtx.lineTo(fx + 5, -2);
    lCtx.quadraticCurveTo(fx - fw * 0.6, 2, fx - fw, -2.5);
    lCtx.quadraticCurveTo(fx - fw * 0.75, -7.5, fx - 5, -6.5);
    lCtx.closePath();
    lCtx.fill();
    lCtx.stroke();
  }

  // Iconic Pot-Bellied Semar/Bagong Silhouette (`Perut Buncit` left `-X`, Comic Rump `Bokong` right `+X`)!
  // Total height reaches ~135px (`y = 0` feet up to `y = -135` Kuncung crest!)
  lCtx.fillStyle = '#220e05';
  lCtx.strokeStyle = '#f6cb60';
  lCtx.lineWidth = 2.1;
  lCtx.beginPath();
  lCtx.moveTo(-18, -22); // lower front sarong hem
  // Huge jovial protruding round belly facing left (`-X`)!
  lCtx.bezierCurveTo(-48, -28, -52, -68, -24, -84);
  // Sloping comic chest & neck base
  lCtx.quadraticCurveTo(-12, -92, 4, -90);
  // Hunched comic back & prominent jutting Semar rump (`Bokong`) on `+X`!
  lCtx.bezierCurveTo(22, -88, 38, -66, 36, -44);
  lCtx.bezierCurveTo(35, -26, 22, -18, 15, -20);
  // Scalloped Kain Poleng sarong bottom fold
  lCtx.quadraticCurveTo(-2, -15, -18, -22);
  lCtx.closePath();
  lCtx.fill();
  lCtx.stroke();

  // Sungging Drenjeman stippled Kain Poleng sarong & warm golden-ochre belly skin
  paintSunggingStipple(lCtx, -18, -56, 20, 18, '#9b2215', '#df6d20', '#fce082', rng, 28);
  paintSunggingStipple(lCtx, 10, -44, 19, 17, '#165e4b', '#3ca279', '#f6cf66', rng, 24);

  // Golden waist sash (`Sabuk` & `Pending` buckle) + Kain Poleng diagonal lattice lines
  lCtx.strokeStyle = '#f7cf68';
  lCtx.lineWidth = 1.6;
  lCtx.beginPath();
  lCtx.moveTo(-36, -48);
  lCtx.quadraticCurveTo(-4, -40, 32, -48);
  lCtx.moveTo(-32, -36);
  lCtx.quadraticCurveTo(-2, -29, 28, -36);
  lCtx.stroke();

  // Fine `Tatahan` leather pin-perforations across belly, Poleng sarong & rump scroll!
  lCtx.save();
  lCtx.globalCompositeOperation = 'destination-out';
  lCtx.fillStyle = '#000';
  punchHoleArc(lCtx, -15, -55, 21, 1.95, 4.35, 9, 2.0);
  punchHoleArc(lCtx, 13, -47, 15, -1.05, 1.25, 7, 1.9);
  punchHoleRow(lCtx, -24, -30, 16, -27, 7, 1.9, 91);
  punchHoleRow(lCtx, -27, -42, 20, -41, 7, 1.8, 92);
  punchPetalSlot(lCtx, -16, -56, 4.2, 2.2, -0.35);
  punchPetalSlot(lCtx, 12, -48, 4.0, 2.1, 0.40);
  lCtx.restore();

  // =========================================================================
  // 3. `upBuf` (`zUpper` breathing penumbra): Nodding Round Head + 2-Link Clacking Long Arm!
  // =========================================================================
  uCtx.translate(ox, oy);
  uCtx.rotate(bodyRock);

  const neckPiv = { x: -5, y: -90 };
  const shPiv = { x: -8, y: -80 };

  // Far-side rear comic hand resting on hip/belly (subtle secondary silhouette depth)
  uCtx.fillStyle = '#361608';
  uCtx.strokeStyle = '#e8b647';
  uCtx.lineWidth = 1.4;
  uCtx.beginPath();
  uCtx.moveTo(-16, -76);
  uCtx.quadraticCurveTo(-40, -72, -44, -56);
  uCtx.quadraticCurveTo(-38, -50, -30, -56);
  uCtx.closePath();
  uCtx.fill();
  uCtx.stroke();

  // --- A. Articulated Nodding Round Semar/Bagong Head (`y ≈ -90..-136`) ---
  uCtx.save();
  uCtx.translate(neckPiv.x, neckPiv.y);
  uCtx.rotate(headNod);

  // Round jovial Semar/Bagong head facing LEFT (`-X`) with upturned pug nose & grinning comic jaw!
  uCtx.fillStyle = '#220e05';
  uCtx.strokeStyle = '#f8d26c';
  uCtx.lineWidth = 1.9;
  uCtx.beginPath();
  uCtx.moveTo(11, -2); // nape of neck
  uCtx.bezierCurveTo(18, -14, 15, -31, 0, -33); // round cranium back
  // Iconic bobbing white-gold `Kuncung` tuft curling high at top (`y = -46`, total puppet height ~136px!)
  uCtx.quadraticCurveTo(-4, -47, -15, -43);
  uCtx.quadraticCurveTo(-9, -36, -9, -31);
  // Forehead & comic upturned Semar/Bagong pug nose (`Hidung Pesek`)
  uCtx.quadraticCurveTo(-18, -29, -19, -22);
  uCtx.bezierCurveTo(-29, -23, -30, -13, -20, -12);
  // Wide joyful open grinning mouth & jovial double-chin (`Dagu`)
  uCtx.lineTo(-13, -10);
  uCtx.lineTo(-22, -6);
  uCtx.quadraticCurveTo(-21, 3, -8, 3);
  uCtx.quadraticCurveTo(4, 4, 11, -2);
  uCtx.closePath();
  uCtx.fill();
  uCtx.stroke();

  // Sungging warm gold/ivory comic face stippling + single gleaming white comic tooth!
  paintSunggingStipple(uCtx, -5, -18, 10, 9, '#b32818', '#ed942b', '#fff0a6', rng, 18);
  uCtx.fillStyle = '#fff9de';
  uCtx.fillRect(-19, -12, 3.2, 3.0); // signature single Punokawan tooth!

  // Expressive round Bagong/Semar comic eye + `Sumping` ear-leaf ornament
  uCtx.fillStyle = '#fffbe8';
  uCtx.strokeStyle = '#b52618';
  uCtx.lineWidth = 1.5;
  uCtx.beginPath();
  uCtx.moveTo(-14.5, -20);
  uCtx.quadraticCurveTo(-10, -24.5, -5.5, -20);
  uCtx.quadraticCurveTo(-10, -15.5, -14.5, -20);
  uCtx.closePath();
  uCtx.fill();
  uCtx.stroke();
  uCtx.fillStyle = '#180903';
  uCtx.fillRect(-12, -21.5, 3.0, 3.0);

  // Tatahan pinholes in Kuncung tuft & Sumping ear scroll
  uCtx.save();
  uCtx.globalCompositeOperation = 'destination-out';
  uCtx.fillStyle = '#000';
  punchHoleRow(uCtx, -11, -39, -4, -35, 3, 1.6, 95);
  punchHoleArc(uCtx, 4, -18, 6.5, -1.1, 1.1, 4, 1.6);
  uCtx.restore();

  drawGegelPivot(uCtx, 0, 0, 3.2);
  uCtx.restore();

  // --- B. Two-Link Articulated Long Comic Arm (`Bahu` + `Lengan`) Clacking in Salute! ---
  // In local coords, `-X` is left (`Math.PI`).
  // At rest (`saluteEnv = 0`): upper arm hangs down-left (`~2.08 rad`), forearm angles gently forward (`~2.68 rad`).
  // During salute (`saluteEnv = 1`): shoulder swings forward-up and forearm clacks vigorously up & down (`2.55 <-> 3.95 rad`)!
  const shAng = lerp(2.04, lerp(2.38, 3.12, clack01), saluteEnv) + stepSign * 0.03 * saluteEnv;
  const elAng = lerp(2.62, lerp(2.52, 4.08, clack01), saluteEnv) + (qStep % 3 - 1) * 0.045 * saluteEnv;

  const upperLen = 33;
  const foreLen = 44;
  const elbow = {
    x: shPiv.x + Math.cos(shAng) * upperLen,
    y: shPiv.y + Math.sin(shAng) * upperLen,
  };
  const wrist = {
    x: elbow.x + Math.cos(elAng) * foreLen,
    y: elbow.y + Math.sin(elAng) * foreLen,
  };

  // Upper Arm (`Bahu`) with Tatahan pinholes
  uCtx.save();
  uCtx.translate(shPiv.x, shPiv.y);
  uCtx.rotate(shAng);
  uCtx.fillStyle = '#220e05';
  uCtx.strokeStyle = '#f6cc63';
  uCtx.lineWidth = 1.75;
  uCtx.beginPath();
  uCtx.moveTo(-3, 0);
  uCtx.quadraticCurveTo(upperLen * 0.48, -5.8, upperLen + 2.5, 0);
  uCtx.quadraticCurveTo(upperLen * 0.48, 5.8, -3, 0);
  uCtx.closePath();
  uCtx.fill();
  uCtx.stroke();
  uCtx.globalCompositeOperation = 'destination-out';
  uCtx.fillStyle = '#000';
  punchHoleRow(uCtx, 7, 0, upperLen - 6, 0, 4, 1.5, 96);
  uCtx.globalCompositeOperation = 'source-over';
  uCtx.restore();

  // Extra-Long Articulated Forearm (`Lengan`) + Expressive Saluting Comic Hand (`Tangan`)!
  uCtx.save();
  uCtx.translate(elbow.x, elbow.y);
  uCtx.rotate(elAng);
  uCtx.fillStyle = '#220e05';
  uCtx.strokeStyle = '#f8d26c';
  uCtx.lineWidth = 1.75;
  uCtx.beginPath();
  uCtx.moveTo(-2.5, 0);
  uCtx.quadraticCurveTo(foreLen * 0.5, -5.0, foreLen, -1.8);
  // Expressive Javanese Punokawan hand: upturned jovial thumb + long pointing/waving salute fingers!
  uCtx.lineTo(foreLen + 5, -9.5);
  uCtx.lineTo(foreLen + 8.5, -3.0);
  uCtx.lineTo(foreLen + 17, -4.5);
  uCtx.quadraticCurveTo(foreLen + 18, 1.5, foreLen + 13, 3.8);
  uCtx.lineTo(foreLen + 1, 3.2);
  uCtx.quadraticCurveTo(foreLen * 0.5, 5.0, -2.5, 0);
  uCtx.closePath();
  uCtx.fill();
  uCtx.stroke();

  uCtx.globalCompositeOperation = 'destination-out';
  uCtx.fillStyle = '#000';
  punchHoleRow(uCtx, 6, 0, foreLen - 6, 0, 5, 1.45, 97);
  uCtx.globalCompositeOperation = 'source-over';
  uCtx.restore();

  drawGegelPivot(uCtx, shPiv.x, shPiv.y, 3.3);
  drawGegelPivot(uCtx, elbow.x, elbow.y, 3.0);
  drawGegelPivot(uCtx, wrist.x, wrist.y, 2.8);

  lCtx.restore();
  uCtx.restore();

  // =========================================================================
  // 4. Composite Both Z-Planes with Authentic Contact-to-Soft-Penumbra Shadow Optics!
  // =========================================================================
  const compositePunokawanPlane = (srcB, ambB, dkB, zDepth) => {
    const aCtx = ambB.drawingContext;
    aCtx.save();
    aCtx.clearRect(0, 0, bufW, bufH);
    aCtx.drawImage(srcB.canvas, 0, 0);
    aCtx.globalCompositeOperation = 'source-in';
    aCtx.fillStyle = '#803107';
    aCtx.fillRect(0, 0, bufW, bufH);
    aCtx.restore();

    const dCtx = dkB.drawingContext;
    dCtx.save();
    dCtx.clearRect(0, 0, bufW, bufH);
    dCtx.drawImage(srcB.canvas, 0, 0);
    dCtx.globalCompositeOperation = 'source-in';
    dCtx.fillStyle = '#2a0f04';
    dCtx.fillRect(0, 0, bufW, bufH);
    dCtx.restore();

    // Radial projection away from live flickering Blencong wick `(lampX, lampY)`
    const rayX = (baseX - lampState.lampX) * (0.018 + 0.068 * zDepth);
    const rayY = (baseY - 68 - lampState.lampY) * (0.010 + 0.036 * zDepth);
    const scaleSh = 1.005 + 0.062 * zDepth;
    const penumbraBlur = 1.2 + 9.2 * zDepth;

    ctx.save();
    ctx.beginPath();
    ctx.rect(16, 37, PANEL_SIZE - 32, ROAD_EDGE_Y - 37);
    ctx.clip();

    // Warm chestnut-amber soft penumbra
    ctx.save();
    ctx.globalAlpha = lerp(0.24, 0.54, zDepth);
    ctx.filter = `blur(${penumbraBlur.toFixed(1)}px)`;
    ctx.drawImage(
      ambB.canvas,
      baseX - ox * scaleSh + rayX,
      baseY - oy * scaleSh + rayY,
      bufW * scaleSh,
      bufH * scaleSh
    );
    ctx.restore();

    // Diffused umber shadow core when lifted off cotton screen
    if (zDepth > 0.08) {
      const coreScale = 1.0 + 0.030 * zDepth;
      const coreBlur = 0.7 + 4.2 * zDepth;
      ctx.save();
      ctx.globalAlpha = lerp(0.12, 0.62, zDepth);
      ctx.filter = `blur(${coreBlur.toFixed(1)}px)`;
      ctx.drawImage(
        dkB.canvas,
        baseX - ox * coreScale + rayX * 0.52,
        baseY - oy * coreScale + rayY * 0.52,
        bufW * coreScale,
        bufH * coreScale
      );
      ctx.restore();
    }

    // Backlit Tatahan pinhole warm glow on cotton weave
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = lerp(0.14, 0.25, zDepth);
    ctx.filter = `blur(${(1.8 + 2.6 * zDepth).toFixed(1)}px)`;
    ctx.drawImage(ambB.canvas, baseX - ox, baseY - oy);
    ctx.restore();
    ctx.restore();

    // Direct buffalo-hide polychrome & crisp Tatahan perforations
    ctx.save();
    ctx.globalAlpha = lerp(0.98, 0.60, zDepth);
    if (zDepth > 0.42) {
      ctx.filter = `blur(${((zDepth - 0.42) * 2.2).toFixed(1)}px)`;
    }
    ctx.drawImage(srcB.canvas, baseX - ox, baseY - oy);
    ctx.restore();
  };

  compositePunokawanPlane(lowBuf, lowAmb, lowDk, zLower);
  compositePunokawanPlane(upBuf, upAmb, upDk, zUpper);

  // =========================================================================
  // 5. Warm Translucent Amber Ox-Horn `Cempurit` Control Rod Attached to Saluting Wrist!
  // =========================================================================
  const cosB = Math.cos(bodyRock);
  const sinB = Math.sin(bodyRock);
  const panelWristX = baseX + wrist.x * cosB - wrist.y * sinB;
  const panelWristY = baseY + wrist.x * sinB + wrist.y * cosB;
  const rodTremor = (stepSign * 5.2 + Math.sin(qStep * 2.9) * 3.8) * (0.25 + 0.75 * saluteEnv);

  drawCurvedHornCempurit(
    ctx,
    panelWristX,
    panelWristY,
    baseX + 34 - 16 * saluteEnv * clack01 + rodTremor,
    PANEL_SIZE + 12 - 18 * saluteEnv * clack01,
    lampState.lampX,
    {
      thickness: 3.6,
      bow1: -15,
      bow2: 11,
      handleU0: 0.64,
      handleU1: 0.85,
    }
  );
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

  // Strict 10Hz quantized internal Wayang clock (`quantizeTime(t, 10)`) driving ALL world reactivity!
  const hz = scene.quantizeHz || 10;
  const qT = quantizeTime(t, hz);
  const qLocalT = isOutroThumbnail ? 2.8 : qT - scene.t0;
  const qPelicanX = isOutroThumbnail ? pelicanLocalX : qLocalT * (PANEL_SIZE / SCENE_SEC);

  // 1. Baked Wayang Stage (slubbed cotton Kelir, full symmetrical Suluran valance, Debog banana trunk, Batik Tulis skirt)
  const stage = getBakedWayangStage(kit);
  ctx.drawImage(stage.canvas, 0, 0);

  // 2. Rear-Hung `Blencong` Oil Lamp Silhouette & Cloth-Transmitted Wick Radiance (kicks sideways as pelican passes x = 500!)
  const lampState = drawQuantizedBlencongOptics(kit, ctx, qT, qLocalT, qPelicanX, isOutroThumbnail);

  // 3. Twin Symmetrical Lace-Perforated Gunungan / Kayon Trees of Life performing ceremonial `开场分山` parting!
  drawDynamicSwayingKayons(kit, ctx, qT, qLocalT, lampState.lampX, isOutroThumbnail);

  // 4. Planted Comic `Punokawan` (Semar/Bagong) Servant Puppet saluting & clacking its articulated arm on Debog!
  drawPunokawanServantPuppet(kit, ctx, qT, qLocalT, lampState, isOutroThumbnail);

  // 5. Bespoke Perforated `Rata Garuda` Pelican + Z-Depth Optical Breathing + 7-Joint Staccato + Crossed Curved Horn Rods
  if (pelicanLocalX > -240 && pelicanLocalX < PANEL_SIZE + 240) {
    // Smoothly blend 10Hz stepping & Z-tilt in/out strictly inside [132..868] so cross-frame straddle is 100% 60fps 1.0x!
    const qMix = isOutroThumbnail
      ? 1.0
      : smoothstep(132, 188, pelicanLocalX) * smoothstep(868, 812, pelicanLocalX);

    const rawQX = (qT - scene.t0) * (PANEL_SIZE / SCENE_SEC);
    const px = isOutroThumbnail ? pelicanLocalX : lerp(pelicanLocalX, rawQX, qMix);
    const pa = isOutroThumbnail ? pedalAngle : pedalAngle + ((qT - t) / BEAT_SEC) * Math.PI * qMix;
    const wAngle = px / 46.5;

    const { y: roadY, slope } = kit.sampleRoad(clamp(px, 0, PANEL_SIZE), 0);
    const rig = computePelicanRig({
      x: px,
      y: roadY,
      pedalAngle: pa,
      wheelAngle: wAngle,
      scale: 1.0,
      slope,
      speedScale,
      poseMode: 'normal',
      time: isOutroThumbnail ? qT : lerp(t, qT, qMix),
    });

    drawWayangPelicanPuppet(kit, ctx, rig, qT, qLocalT, qMix, lampState, isOutroThumbnail);
  }

  // 6. 100% pure shadow-theatre canvas in main scroll (`wallPlacard` sits on gallery wall below frame);
  //    preserve Outro 7x3 exhibition wall thumbnail strip!
  if (isOutroThumbnail) {
    ctx.fillStyle = 'rgba(20, 11, 5, 0.82)';
    ctx.fillRect(0, PANEL_SIZE - 96, PANEL_SIZE, 96);
    ctx.fillStyle = '#f9ebc8';
    ctx.font = '700 48px "PelicanSerif", serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${String(scene.num).padStart(2, '0')} ${scene.zh}`, 36, PANEL_SIZE - 48);
  }

  ctx.restore();
}
